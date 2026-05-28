const functions = require("firebase-functions");
const admin     = require("firebase-admin");
const cors      = require("cors")({ origin: true });
const axios     = require("axios");

admin.initializeApp();
const db = admin.firestore();

// ══════════════════════════════════════════════════════════════════════
// ⚙️  CONFIGURAÇÃO ASAAS
//     Em produção, definir variáveis no console Firebase:
//     firebase functions:secrets:set ASAAS_API_KEY
//     (ou no arquivo .env local para o emulador)
// ══════════════════════════════════════════════════════════════════════
function getAsaasConfig() {
  const env  = process.env.ASAAS_ENVIRONMENT || "sandbox";
  const key  = process.env.ASAAS_API_KEY     || "";
  const base = env === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3";
  return { key, base, env };
}

function getWebhookToken() {
  return process.env.ASAAS_WEBHOOK_TOKEN || "";
}

// ── Planos LashBrow ──────────────────────────────────────────────────
const PLAN_PRICES = {
  solo:    99.80,
  studio:  149.80,
  premium: 199.80,
};

const PLAN_LABELS = {
  solo:    "Solo — Para lashistas autônomas",
  studio:  "Studio — Para studios com 2-3 profissionais",
  premium: "Premium — Até 10 profissionais",
};

// ── Helper: chamada à API Asaas ──────────────────────────────────────
async function asaasRequest(method, endpoint, data = null) {
  const { key, base } = getAsaasConfig();
  const config = {
    method,
    url: `${base}${endpoint}`,
    headers: {
      "Content-Type": "application/json",
      "access_token": key,
    },
  };
  if (data) config.data = data;
  try {
    const response = await axios(config);
    return response.data;
  } catch (err) {
    const detail = err.response?.data?.errors?.[0]?.description || err.message;
    throw new Error(`Asaas API [${method} ${endpoint}]: ${detail}`);
  }
}

// ══════════════════════════════════════════════════════════════════════
// 1. CRIAR CLIENTE NO ASAAS
//    Chamado pelo frontend no fluxo de assinatura.
//    POST { uid, name, email, phone }
// ══════════════════════════════════════════════════════════════════════
exports.createAsaasCustomer = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { uid, name, email, phone } = req.body;

      if (!uid || !name || !email) {
        return res.status(400).json({ error: "uid, name e email são obrigatórios" });
      }

      // Verificar se já existe customer salvo
      const companyRef  = db.collection("companies").doc(uid);
      const companySnap = await companyRef.get();

      if (companySnap.data()?.asaasCustomerId) {
        return res.json({
          customerId: companySnap.data().asaasCustomerId,
          existing: true,
        });
      }

      // Criar customer no Asaas
      const customer = await asaasRequest("POST", "/customers", {
        name,
        email,
        mobilePhone: phone ? phone.replace(/\D/g, "") : undefined,
        externalReference: uid,
        notificationDisabled: false,
        observations: "LashBrow — Sistema de Gestão para Cílios e Sobrancelhas",
      });

      // Salvar customerId no Firestore
      await companyRef.update({
        asaasCustomerId: customer.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Customer Asaas criado: ${customer.id} para uid: ${uid}`);
      return res.json({ customerId: customer.id });

    } catch (err) {
      console.error("createAsaasCustomer error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });
});

// ══════════════════════════════════════════════════════════════════════
// 2. CRIAR ASSINATURA RECORRENTE
//    POST { uid, plan, billingType }
//    billingType: "PIX" | "BOLETO" | "CREDIT_CARD"  (default: PIX)
//    Retorna: { subscriptionId, paymentLink, status }
// ══════════════════════════════════════════════════════════════════════
exports.createAsaasSubscription = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { uid, plan, billingType } = req.body;

      if (!uid || !plan) {
        return res.status(400).json({ error: "uid e plan são obrigatórios" });
      }

      const price = PLAN_PRICES[plan];
      if (!price) {
        return res.status(400).json({ error: `Plano inválido: ${plan}. Use: solo, studio ou premium` });
      }

      // Buscar dados da empresa no Firestore
      const companySnap = await db.collection("companies").doc(uid).get();
      if (!companySnap.exists) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }
      const company = companySnap.data();

      // Garantir que o customer existe no Asaas
      let customerId = company.asaasCustomerId;
      if (!customerId) {
        const customer = await asaasRequest("POST", "/customers", {
          name: company.ownerName || company.companyName || "Cliente LashBrow",
          email: company.ownerEmail || "",
          mobilePhone: company.ownerPhone ? company.ownerPhone.replace(/\D/g, "") : undefined,
          externalReference: uid,
          notificationDisabled: false,
          observations: "LashBrow — Sistema de Gestão para Cílios e Sobrancelhas",
        });
        customerId = customer.id;
        await db.collection("companies").doc(uid).update({
          asaasCustomerId: customerId,
        });
      }

      // Primeira cobrança: amanhã (trial já expirou)
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + 1);
      const nextDueFormatted = nextDue.toISOString().split("T")[0]; // YYYY-MM-DD

      // Criar assinatura recorrente mensal
      const subscription = await asaasRequest("POST", "/subscriptions", {
        customer:      customerId,
        billingType:   billingType || "PIX",
        value:         price,
        nextDueDate:   nextDueFormatted,
        cycle:         "MONTHLY",
        description:   `LashBrow — ${PLAN_LABELS[plan]}`,
        externalReference: uid,
      });

      // Buscar link de pagamento da primeira cobrança
      let paymentLink = null;
      try {
        const payments = await asaasRequest("GET", `/subscriptions/${subscription.id}/payments`);
        const firstPayment = payments?.data?.[0];
        if (firstPayment) {
          paymentLink = firstPayment.invoiceUrl
            || firstPayment.bankSlipUrl
            || null;
        }
      } catch (e) {
        console.warn("Aviso: não foi possível buscar link de pagamento:", e.message);
      }

      // Atualizar Firestore
      await db.collection("companies").doc(uid).update({
        asaasSubscriptionId: subscription.id,
        subscriptionStatus:  "pending_payment",
        selectedPlan:        plan,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Subscription criada: ${subscription.id} | uid: ${uid} | plano: ${plan}`);
      return res.json({
        subscriptionId: subscription.id,
        paymentLink,
        status: subscription.status,
      });

    } catch (err) {
      console.error("createAsaasSubscription error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });
});

// ══════════════════════════════════════════════════════════════════════
// 3. WEBHOOK DO ASAAS
//    Configurar no painel Asaas → Integrações → Webhooks:
//    URL: https://us-central1-lashbrow-app.cloudfunctions.net/asaasWebhook
//
//    Eventos tratados:
//    PAYMENT_CONFIRMED / PAYMENT_RECEIVED → status: active
//    PAYMENT_OVERDUE                       → status: overdue
//    SUBSCRIPTION_DELETED                  → status: cancelled
//    PAYMENT_REFUNDED                      → status: cancelled
// ══════════════════════════════════════════════════════════════════════
exports.asaasWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Validar token de segurança (header enviado pelo Asaas)
    const incomingToken = req.headers["asaas-access-token"] || req.query.token || "";
    const expectedToken  = getWebhookToken();

    if (expectedToken && incomingToken !== expectedToken) {
      console.warn("⚠️ Webhook recusado: token inválido");
      return res.sendStatus(401);
    }

    const event       = req.body;
    const payment     = event?.payment;
    const subscription = event?.subscription;

    console.log("📩 Webhook Asaas recebido:", JSON.stringify({
      event: event.event,
      paymentId: payment?.id,
      subscriptionId: payment?.subscription || subscription?.id,
    }));

    // Mapeamento evento → novo status
    const eventMap = {
      PAYMENT_CONFIRMED:        "active",
      PAYMENT_RECEIVED:         "active",
      PAYMENT_OVERDUE:          "overdue",
      SUBSCRIPTION_DELETED:     "cancelled",
      SUBSCRIPTION_INACTIVATED: "cancelled",
      PAYMENT_REFUNDED:         "cancelled",
      PAYMENT_DELETED:          null, // ignorar
    };

    const newStatus = eventMap[event.event];
    if (newStatus === undefined) {
      // Evento não mapeado — retornar 200 para o Asaas não reenviar
      return res.sendStatus(200);
    }
    if (newStatus === null) {
      return res.sendStatus(200);
    }

    // Identificar o uid do usuário via asaasSubscriptionId no Firestore
    let uid = null;
    const subscriptionId = payment?.subscription || subscription?.id;

    if (subscriptionId) {
      const snap = await db.collection("companies")
        .where("asaasSubscriptionId", "==", subscriptionId)
        .limit(1)
        .get();
      if (!snap.empty) uid = snap.docs[0].id;
    }

    // Fallback: externalReference direto no pagamento
    if (!uid && payment?.externalReference) {
      uid = payment.externalReference;
    }

    if (!uid) {
      console.warn("⚠️ uid não identificado para o evento:", event.event);
      return res.sendStatus(200);
    }

    // Montar update do Firestore
    const updateData = {
      subscriptionStatus: newStatus,
      lastWebhookEvent:   event.event,
      lastWebhookAt:      admin.firestore.FieldValue.serverTimestamp(),
      updatedAt:          admin.firestore.FieldValue.serverTimestamp(),
    };

    if (newStatus === "active") {
      // Registrar data de ativação e estimar fim do período atual (+1 mês)
      updateData.lastPaidAt    = admin.firestore.FieldValue.serverTimestamp();
      updateData.lastPaymentId = payment?.id || null;

      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      updateData.currentPeriodEnd = admin.firestore.Timestamp.fromDate(periodEnd);

      // Promover plano selecionado para plano ativo
      const companySnap = await db.collection("companies").doc(uid).get();
      const selectedPlan = companySnap.data()?.selectedPlan;
      if (selectedPlan) {
        updateData.plan = selectedPlan;
        updateData.status = "active";

        // ── Sincronizar plano em studios (fonte usada pelo app) ──
        try {
          await db.collection("studios").doc(uid).update({
            plan: selectedPlan,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`✅ studios/${uid}.plan sincronizado: ${selectedPlan}`);
        } catch (e) {
          console.warn(`⚠️ Não foi possível atualizar studios/${uid}:`, e.message);
        }
      }
    }

    if (newStatus === "cancelled") {
      updateData.plan    = "free";
      updateData.status  = "blocked";
      updateData.cancelledAt = admin.firestore.FieldValue.serverTimestamp();

      // ── Sincronizar cancelamento em studios ──
      try {
        await db.collection("studios").doc(uid).update({
          plan: "free",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (e) {
        console.warn(`⚠️ Não foi possível atualizar studios/${uid} (cancelamento):`, e.message);
      }
    }

    if (newStatus === "overdue") {
      updateData.status = "overdue";
    }

    await db.collection("companies").doc(uid).update(updateData);
    console.log(`✅ Firestore atualizado: uid=${uid} → status=${newStatus} (${event.event})`);

    return res.sendStatus(200);

  } catch (err) {
    console.error("asaasWebhook error:", err.message);
    // Sempre 200 para evitar reenvios infinitos do Asaas
    return res.sendStatus(200);
  }
});

// ══════════════════════════════════════════════════════════════════════
// 4. STATUS DA ASSINATURA  (consultado pelo frontend na inicialização)
//    GET ?uid=<uid>
// ══════════════════════════════════════════════════════════════════════
exports.getSubscriptionStatus = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const uid = req.query.uid;
      if (!uid) return res.status(400).json({ error: "uid é obrigatório" });

      const companySnap = await db.collection("companies").doc(uid).get();
      if (!companySnap.exists) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }

      const data = companySnap.data();

      // Calcular se trial expirou (para usuários sem assinatura)
      const createdAt   = data?.createdAt?.toDate?.() || new Date();
      const TRIAL_DAYS  = 14;
      const trialEndDate = new Date(createdAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const now         = new Date();
      const trialActive = now < trialEndDate;

      let effectiveStatus = data?.subscriptionStatus || (trialActive ? "trial" : "trial_expired");

      // Se tem assinatura Asaas, verificar diretamente na API
      if (data?.asaasSubscriptionId && data.subscriptionStatus === "active") {
        try {
          const sub = await asaasRequest("GET", `/subscriptions/${data.asaasSubscriptionId}`);
          if (sub.status === "INACTIVE" || sub.deleted) {
            effectiveStatus = "cancelled";
            await db.collection("companies").doc(uid).update({
              subscriptionStatus: "cancelled",
              status: "blocked",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        } catch (e) {
          console.warn("Não foi possível verificar assinatura na API Asaas:", e.message);
        }
      }

      return res.json({
        status:            effectiveStatus,
        plan:              data?.plan || "free",
        selectedPlan:      data?.selectedPlan || null,
        trialEndsAt:       trialEndDate.toISOString(),
        trialActive,
        currentPeriodEnd:  data?.currentPeriodEnd?.toDate?.()?.toISOString() || null,
        asaasCustomerId:   data?.asaasCustomerId || null,
        asaasSubscriptionId: data?.asaasSubscriptionId || null,
      });

    } catch (err) {
      console.error("getSubscriptionStatus error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });
});

// ══════════════════════════════════════════════════════════════════════
// 5. CANCELAR ASSINATURA  (acionado pelo usuário ou admin)
//    POST { uid }
// ══════════════════════════════════════════════════════════════════════
exports.cancelAsaasSubscription = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { uid } = req.body;
      if (!uid) return res.status(400).json({ error: "uid é obrigatório" });

      const companySnap    = await db.collection("companies").doc(uid).get();
      const subscriptionId = companySnap.data()?.asaasSubscriptionId;

      if (!subscriptionId) {
        return res.status(404).json({ error: "Assinatura não encontrada" });
      }

      // Deletar assinatura no Asaas
      await asaasRequest("DELETE", `/subscriptions/${subscriptionId}`);

      // Atualizar Firestore
      await db.collection("companies").doc(uid).update({
        subscriptionStatus: "cancelled",
        plan:               "free",
        status:             "blocked",
        cancelledAt:        admin.firestore.FieldValue.serverTimestamp(),
        updatedAt:          admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Assinatura cancelada: ${subscriptionId} | uid: ${uid}`);
      return res.json({ success: true });

    } catch (err) {
      console.error("cancelAsaasSubscription error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });
});

// ══════════════════════════════════════════════════════════════════════
// 6. RECUPERAR LINK DE PAGAMENTO  (para usuários em overdue / pending)
//    GET ?uid=<uid>
// ══════════════════════════════════════════════════════════════════════
exports.getPaymentLink = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const uid = req.query.uid;
      if (!uid) return res.status(400).json({ error: "uid é obrigatório" });

      const companySnap    = await db.collection("companies").doc(uid).get();
      const subscriptionId = companySnap.data()?.asaasSubscriptionId;

      if (!subscriptionId) {
        return res.status(404).json({ error: "Assinatura não encontrada" });
      }

      // Buscar cobranças pendentes da assinatura
      const payments = await asaasRequest("GET", `/subscriptions/${subscriptionId}/payments`);
      const pending  = payments?.data?.find(p =>
        ["PENDING", "OVERDUE"].includes(p.status)
      );

      const paymentLink = pending?.invoiceUrl || pending?.bankSlipUrl || null;

      return res.json({
        paymentLink,
        status: pending?.status || null,
        dueDate: pending?.dueDate || null,
      });

    } catch (err) {
      console.error("getPaymentLink error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });
});
