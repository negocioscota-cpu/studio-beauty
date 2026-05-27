const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

// ============================================================
// HELPER: Asaas API
// ============================================================
function asaasApi() {
  const apiKey = functions.config().asaas?.api_key;
  if (!apiKey) throw new Error("Chave Asaas não configurada.");
  return axios.create({
    baseURL: "https://api.asaas.com/v3",
    headers: {
      "access_token": apiKey,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });
}

// ============================================================
// FUNÇÃO 1: CRIAR ASSINATURA ASAAS (subscribe.html)
// ============================================================
exports.createAsaasSubscription = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
      const { uid, name, email, cpfCnpj, phone, plan, billingType } = req.body;

      if (!uid || !name || !email || !plan) {
        return res.status(400).json({ error: "Campos obrigatórios: uid, name, email, plan" });
      }

      const PLANS = {
        starter:      { name: "Solo",    value: 69.00,  description: "Plano Solo — até 1 profissional" },
        profissional: { name: "Studio",  value: 99.80,  description: "Plano Studio — até 3 profissionais" },
        studio:       { name: "Premium", value: 149.90, description: "Plano Premium — até 10 profissionais" },
      };

      const planInfo = PLANS[plan];
      if (!planInfo) return res.status(400).json({ error: "Plano inválido: " + plan });

      const api = asaasApi();

      // 1. Buscar ou criar cliente no Asaas
      let asaasCustomerId;
      const companyRef = db.collection("companies").doc(uid);
      const companySnap = await companyRef.get();
      const companyData = companySnap.exists ? companySnap.data() : {};

      if (companyData.asaasCustomerId) {
        asaasCustomerId = companyData.asaasCustomerId;
      } else {
        const customerPayload = {
          name,
          email,
          ...(cpfCnpj && { cpfCnpj: cpfCnpj.replace(/\D/g, "") }),
          ...(phone && { mobilePhone: phone.replace(/\D/g, "") }),
          externalReference: uid,
        };
        const custResp = await api.post("/customers", customerPayload);
        asaasCustomerId = custResp.data.id;
        await companyRef.set({ asaasCustomerId }, { merge: true });
      }

      // 2. Criar assinatura (14 dias trial)
      const nextDueDate = new Date();
      nextDueDate.setDate(nextDueDate.getDate() + 14);
      const nextDueDateStr = nextDueDate.toISOString().split("T")[0];

      const subscriptionPayload = {
        customer: asaasCustomerId,
        billingType: billingType || "BOLETO",
        value: planInfo.value,
        nextDueDate: nextDueDateStr,
        cycle: "MONTHLY",
        description: planInfo.description,
        externalReference: uid,
      };

      const subResp = await api.post("/subscriptions", subscriptionPayload);
      const subscription = subResp.data;

      // 3. Atualizar Firestore
      const trialEndsAt = admin.firestore.Timestamp.fromDate(nextDueDate);
      await companyRef.set({
        plan,
        asaasSubscriptionId: subscription.id,
        asaasStatus: "PENDING",
        subscriptionStartedAt: admin.firestore.FieldValue.serverTimestamp(),
        trialEndsAt,
        status: "trial",
      }, { merge: true });

      // 4. Buscar link de pagamento da primeira cobrança
      let paymentLink = null;
      try {
        const paymentsResp = await api.get(`/subscriptions/${subscription.id}/payments`);
        const payments = paymentsResp.data?.data || [];
        if (payments.length > 0) {
          paymentLink = payments[0].bankSlipUrl || payments[0].invoiceUrl || null;
        }
      } catch (e) {
        console.warn("Não foi possível buscar pagamentos:", e.message);
      }

      return res.json({
        subscriptionId: subscription.id,
        customerId: asaasCustomerId,
        paymentLink,
        trialEndsAt: nextDueDateStr,
        plan,
        value: planInfo.value,
      });

    } catch (error) {
      const errData = error.response?.data || {};
      console.error("createAsaasSubscription error:", error.message, errData);
      return res.status(500).json({ error: error.message, details: errData });
    }
  });
});

// ============================================================
// FUNÇÃO 2: WEBHOOK ASAAS (assinaturas + agendamentos)
// ============================================================
exports.asaasWebhook = functions.https.onRequest(async (req, res) => {
  // Validar token
  const expectedToken = functions.config().asaas?.webhook_token;
  const receivedToken = req.headers["asaas-access-token"];
  if (expectedToken && receivedToken !== expectedToken) {
    console.warn("asaasWebhook: token inválido:", receivedToken);
    return res.sendStatus(401);
  }

  res.sendStatus(200); // Asaas exige resposta rápida

  try {
    const event = req.body;
    const eventType = event?.event;
    const payment = event?.payment;
    const subscription = event?.subscription;

    console.log("Asaas webhook:", eventType, JSON.stringify(event).substring(0, 300));

    // ----------------------------------------------------------------
    // Determinar se é pagamento de AGENDAMENTO ou ASSINATURA
    // Agendamentos têm externalReference no formato de orderId (não uid)
    // Assinaturas têm payment.subscription preenchido
    // ----------------------------------------------------------------
    const isSubscriptionPayment = !!payment?.subscription;
    const extRef = payment?.externalReference || subscription?.externalReference;

    // --- HELPER: encontrar empresa por uid ou asaasSubscriptionId ---
    const findCompany = async (subId, uid) => {
      if (uid) {
        const snap = await db.collection("companies").doc(uid).get();
        if (snap.exists) return { ref: snap.ref, data: snap.data() };
      }
      if (subId) {
        const q = await db.collection("companies")
          .where("asaasSubscriptionId", "==", subId)
          .limit(1).get();
        if (!q.empty) return { ref: q.docs[0].ref, data: q.docs[0].data() };
      }
      return null;
    };

    // --- HELPER: encontrar pedido por asaasPaymentId ou externalReference ---
    const findOrder = async (asaasPaymentId, orderId) => {
      if (orderId) {
        const snap = await db.collection("orders").doc(orderId).get();
        if (snap.exists) return { ref: snap.ref, data: snap.data() };
      }
      if (asaasPaymentId) {
        const q = await db.collection("orders")
          .where("asaasPaymentId", "==", asaasPaymentId)
          .limit(1).get();
        if (!q.empty) return { ref: q.docs[0].ref, data: q.docs[0].data() };
      }
      return null;
    };

    // ================================================================
    // PAGAMENTO RECEBIDO / CONFIRMADO
    // ================================================================
    if (eventType === "PAYMENT_RECEIVED" || eventType === "PAYMENT_CONFIRMED") {
      if (isSubscriptionPayment) {
        // → Atualizar assinatura da empresa
        const company = await findCompany(payment.subscription, extRef);
        if (company) {
          const nextExpiry = new Date();
          nextExpiry.setDate(nextExpiry.getDate() + 31);
          await company.ref.update({
            asaasStatus: "ACTIVE",
            status: "active",
            lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionExpiresAt: admin.firestore.Timestamp.fromDate(nextExpiry),
          });
          console.log("Empresa ativada:", company.ref.id);
        }
      } else {
        // → Marcar pedido de agendamento como PAGO
        const order = await findOrder(payment?.id, extRef);
        if (order) {
          await order.ref.update({
            status: "paid",
            paymentMethod: payment?.billingType || "unknown",
            asaasPaymentId: payment?.id,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          // Também atualizar o agendamento, se existir
          if (order.data.appointmentId && order.data.ownerUid) {
            try {
              await db.collection("users").doc(order.data.ownerUid)
                .collection("appointments").doc(order.data.appointmentId)
                .update({ paymentStatus: "paid", asaasPaymentId: payment?.id });
            } catch (e) { console.warn("Appointment update skipped:", e.message); }
          }
          console.log("Pedido pago:", order.ref.id);
        }
      }
    }

    // ================================================================
    // PAGAMENTO ATRASADO
    // ================================================================
    if (eventType === "PAYMENT_OVERDUE") {
      if (isSubscriptionPayment) {
        const company = await findCompany(payment.subscription, extRef);
        if (company) {
          await company.ref.update({
            asaasStatus: "OVERDUE",
            status: "overdue",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } else {
        const order = await findOrder(payment?.id, extRef);
        if (order) {
          await order.ref.update({
            status: "overdue",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }

    // ================================================================
    // ASSINATURA CANCELADA / INATIVADA
    // ================================================================
    if (eventType === "SUBSCRIPTION_DELETED" || eventType === "SUBSCRIPTION_INACTIVATED") {
      const subId = subscription?.id || payment?.subscription;
      const company = await findCompany(subId, extRef);
      if (company) {
        await company.ref.update({
          asaasStatus: "CANCELLED",
          status: "blocked",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("Empresa bloqueada:", company.ref.id);
      }
    }

    // ================================================================
    // PAGAMENTO ESTORNADO
    // ================================================================
    if (eventType === "PAYMENT_REFUNDED") {
      if (isSubscriptionPayment) {
        const company = await findCompany(payment.subscription, extRef);
        if (company) {
          await company.ref.update({
            asaasStatus: "REFUNDED",
            status: "blocked",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } else {
        const order = await findOrder(payment?.id, extRef);
        if (order) {
          await order.ref.update({
            status: "refunded",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }

  } catch (err) {
    console.error("asaasWebhook processing error:", err.message);
  }
});

// ============================================================
// FUNÇÃO 3: CANCELAR ASSINATURA ASAAS
// ============================================================
exports.cancelAsaasSubscription = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
      const { uid } = req.body;
      if (!uid) return res.status(400).json({ error: "uid é obrigatório" });

      const companyRef = db.collection("companies").doc(uid);
      const snap = await companyRef.get();
      if (!snap.exists) return res.status(404).json({ error: "Empresa não encontrada" });

      const { asaasSubscriptionId } = snap.data();
      if (!asaasSubscriptionId) return res.status(400).json({ error: "Nenhuma assinatura ativa" });

      const api = asaasApi();
      await api.delete(`/subscriptions/${asaasSubscriptionId}`);

      await companyRef.update({
        asaasStatus: "CANCELLED",
        status: "blocked",
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({ success: true, message: "Assinatura cancelada com sucesso" });

    } catch (error) {
      const errData = error.response?.data || {};
      console.error("cancelAsaasSubscription error:", error.message, errData);
      return res.status(500).json({ error: error.message, details: errData });
    }
  });
});

// ============================================================
// FUNÇÃO 4: CRIAR PAGAMENTO ASAAS (agendamentos — substitui MP)
// ============================================================
exports.createAsaasPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
      const { orderId, method } = req.body; // method: "PIX" | "BOLETO"
      if (!orderId) return res.status(400).json({ error: "orderId é obrigatório" });

      const orderRef = db.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) return res.status(404).json({ error: "Pedido não encontrado" });

      const order = orderSnap.data();

      // Verificar se já tem pagamento Asaas criado para este pedido
      if (order.asaasPaymentId && order.asaasPaymentMethod === (method || "PIX")) {
        // Reutilizar cobrança existente
        const api = asaasApi();
        try {
          const existingResp = await api.get(`/payments/${order.asaasPaymentId}`);
          const existing = existingResp.data;
          if (existing.status === "PENDING") {
            return res.json({
              paymentId: existing.id,
              status: existing.status,
              pixQrCodeImage: existing.pixQrCodeImage || null,
              pixCopiaECola: existing.pixCopiaECola || null,
              bankSlipUrl: existing.bankSlipUrl || null,
              invoiceUrl: existing.invoiceUrl || null,
              billingType: existing.billingType,
            });
          }
        } catch (e) {
          console.warn("Não foi possível reutilizar cobrança:", e.message);
        }
      }

      // Buscar asaasCustomerId do proprietário do estúdio
      // Para agendamentos, o cliente final (end-user) pode não ter conta Asaas.
      // Usamos o customer da empresa como referência intermediária:
      // → Se a empresa já tem asaasCustomerId, OK.
      // → Caso contrário, usamos o cliente do próprio proprietário.
      const companyRef = db.collection("companies").doc(order.ownerUid);
      const companySnap = await companyRef.get();

      // Criar cliente para o pagador (cliente final) se não existir
      const api = asaasApi();
      let clientCustomerId;

      // Verificar se já temos customer para este cliente pelo telefone/email
      if (order.clientPhone || order.clientEmail) {
        try {
          const searchParam = order.clientPhone
            ? `?mobilePhone=${order.clientPhone.replace(/\D/g, "")}`
            : `?email=${encodeURIComponent(order.clientEmail)}`;
          const searchResp = await api.get(`/customers${searchParam}`);
          const found = searchResp.data?.data?.[0];
          if (found) clientCustomerId = found.id;
        } catch (e) {
          console.warn("Busca de customer falhou:", e.message);
        }
      }

      if (!clientCustomerId) {
        // Criar cliente do pagador
        const custPayload = {
          name: order.clientName || "Cliente",
          ...(order.clientEmail && { email: order.clientEmail }),
          ...(order.clientPhone && { mobilePhone: order.clientPhone.replace(/\D/g, "") }),
        };
        const custResp = await api.post("/customers", custPayload);
        clientCustomerId = custResp.data.id;
      }

      // Criar a cobrança no Asaas
      const billingType = (method || "PIX").toUpperCase();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1); // vence amanhã
      const dueDateStr = dueDate.toISOString().split("T")[0];

      const chargePayload = {
        customer: clientCustomerId,
        billingType,
        value: order.amount / 100, // amount está em centavos no Firestore
        dueDate: dueDateStr,
        description: `${order.service} — Studiobeauty`,
        externalReference: orderId,
      };

      const chargeResp = await api.post("/payments", chargePayload);
      const charge = chargeResp.data;

      // Se for Pix, buscar QR code
      let pixQrCodeImage = null;
      let pixCopiaECola = null;
      if (billingType === "PIX") {
        try {
          const pixResp = await api.get(`/payments/${charge.id}/pixQrCode`);
          pixQrCodeImage = pixResp.data?.encodedImage || null;
          pixCopiaECola = pixResp.data?.payload || null;
        } catch (e) {
          console.warn("Erro ao buscar QR Pix:", e.message);
        }
      }

      // Persistir no Firestore
      await orderRef.update({
        asaasPaymentId: charge.id,
        asaasPaymentMethod: billingType,
        asaasStatus: charge.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({
        paymentId: charge.id,
        status: charge.status,
        pixQrCodeImage,
        pixCopiaECola,
        bankSlipUrl: charge.bankSlipUrl || null,
        invoiceUrl: charge.invoiceUrl || null,
        billingType,
      });

    } catch (error) {
      const errData = error.response?.data || {};
      console.error("createAsaasPayment error:", error.message, errData);
      return res.status(500).json({ error: error.message, details: errData });
    }
  });
});

// ─────────────────────────────────────────────
// Cancelar assinatura Asaas
// ─────────────────────────────────────────────
exports.cancelAsaasSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Autenticação necessária.");
  }

  const uid = context.auth.uid;
  const companyRef = db.collection("companies").doc(uid);
  const companyDoc = await companyRef.get();

  if (!companyDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Empresa não encontrada.");
  }

  const companyData = companyDoc.data();
  const subscriptionId = companyData.asaasSubscriptionId;

  if (!subscriptionId) {
    throw new functions.https.HttpsError("failed-precondition", "Nenhuma assinatura Asaas encontrada.");
  }

  try {
    const asaasKey = functions.config().asaas.api_key;
    const asaasBase = functions.config().asaas.base_url || "https://www.asaas.com/api/v3";

    const api = axios.create({
      baseURL: asaasBase,
      headers: { access_token: asaasKey },
    });

    await api.delete(`/subscriptions/${subscriptionId}`);

    await companyRef.update({
      asaasStatus: "CANCELLED",
      status: "cancelled",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    const errData = error.response?.data || {};
    console.error("cancelAsaasSubscription error:", error.message, errData);
    throw new functions.https.HttpsError("internal", `Erro ao cancelar: ${error.message}`);
  }
});
