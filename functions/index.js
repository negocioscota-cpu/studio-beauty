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
  solo:    69.00,
  studio:  99.80,
  premium: 149.80,
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

    // Se o pagamento for uma recarga de SMS (externalReference tem prefixo "sms_recarga_")
    if (payment && payment.externalReference && payment.externalReference.startsWith("sms_recarga_")) {
      const parts = payment.externalReference.split("_");
      const studioId = parts[2];
      const transactionId = parts[3];

      if (event.event === "PAYMENT_CONFIRMED" || event.event === "PAYMENT_RECEIVED") {
        console.log(`⚡ Recarga SMS confirmada para studioId=${studioId}, transacao=${transactionId}`);
        
        const txRef = db.collection("sms_transactions").doc(transactionId);
        const txSnap = await txRef.get();
        
        if (txSnap.exists && txSnap.data().status !== "approved") {
          const qty = txSnap.data().qty || 0;
          
          await txRef.update({
            status: "approved",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          const configRef = db.collection("studioConfig").doc(studioId);
          const configSnap = await configRef.get();
          
          if (configSnap.exists) {
            const currentBalance = configSnap.data().communication?.sms?.creditsBalance || 0;
            await configRef.set({
              communication: {
                sms: {
                  creditsBalance: currentBalance + qty
                }
              }
            }, { merge: true });
          } else {
            await configRef.set({
              communication: {
                sms: {
                  creditsBalance: qty
                }
              }
            }, { merge: true });
          }
          console.log(`✅ Saldo SMS creditado: +${qty} créditos para studioId=${studioId}`);
        }
      }
      return res.sendStatus(200);
    }

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
      const TRIAL_DAYS  = 7;
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

// ══════════════════════════════════════════════════════════════════════
// 7. ENVIAR WHATSAPP VIA Z-API (instância centralizada Studio Beauty)
//    POST { phone, message, studioName }
//    - phone: número do destinatário
//    - message: texto da mensagem
//    - studioName: nome do studio para personalização
// ══════════════════════════════════════════════════════════════════════
exports.sendWhatsApp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { phone, message } = req.body;

      if (!phone || !message) {
        return res.status(400).json({ error: "phone e message são obrigatórios" });
      }

      const instanceId = process.env.ZAPI_INSTANCE_ID;
      const token      = process.env.ZAPI_TOKEN;

      if (!instanceId || !token) {
        console.error("Z-API não configurada: ZAPI_INSTANCE_ID ou ZAPI_TOKEN ausente");
        return res.status(503).json({ error: "Z-API não configurada no servidor" });
      }

      // Formatar telefone (apenas dígitos, com código 55)
      const digits = phone.replace(/\D/g, "");
      const formattedPhone = digits.startsWith("55") ? digits : "55" + digits;

      // Enviar via Z-API
      const response = await axios.post(
        `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
        {
          phone: formattedPhone,
          message,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
        }
      );

      console.log(`✅ WhatsApp enviado via Z-API para ${formattedPhone.slice(0,6)}***`);
      return res.json({
        success: true,
        messageId: response.data?.messageId || response.data?.id || null,
      });

    } catch (err) {
      const detail = err.response?.data?.message || err.response?.data || err.message;
      console.error("sendWhatsApp Z-API error:", detail);
      return res.status(502).json({
        error: "Falha ao enviar via Z-API",
        detail: typeof detail === "string" ? detail : JSON.stringify(detail),
      });
    }
  });
});

// ══════════════════════════════════════════════════════════════════════
// ── Helper: chamada à API Asaas usando a API Key do STUDIO ──────────
//    Diferente de asaasRequest(), que usa a chave global do sistema.
//    Aqui, cada studio tem sua própria chave em:
//    studioConfig/{studioUid}.asaasPaymentConfig.apiKey
//    studioConfig/{studioUid}.asaasPaymentConfig.environment
// ══════════════════════════════════════════════════════════════════════
async function studioAsaasRequest(studioUid, method, endpoint, data = null) {
  // Ler configuração Asaas do studio
  const configSnap = await db.collection("studioConfig").doc(studioUid).get();
  if (!configSnap.exists) {
    throw new Error(`studioConfig/${studioUid} não encontrado`);
  }

  const paymentConfig = configSnap.data()?.asaasPaymentConfig;
  if (!paymentConfig?.apiKey) {
    throw new Error(`API Key do Asaas não configurada para o studio ${studioUid}`);
  }

  const env  = paymentConfig.environment || "sandbox";
  const base = env === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3";

  const config = {
    method,
    url: `${base}${endpoint}`,
    headers: {
      "Content-Type": "application/json",
      "access_token": paymentConfig.apiKey,
    },
  };
  if (data) config.data = data;

  try {
    const response = await axios(config);
    return response.data;
  } catch (err) {
    const detail = err.response?.data?.errors?.[0]?.description || err.message;
    throw new Error(`Asaas Studio API [${method} ${endpoint}]: ${detail}`);
  }
}

// ══════════════════════════════════════════════════════════════════════
// 8. CRIAR COBRANÇA DE AGENDAMENTO (BOOKING)
//    POST { studioUid, bookingId, amount, clientName, clientPhone, description }
//    - Usa a API Key do STUDIO (não a global do sistema)
//    - Cria customer + cobrança avulsa no Asaas
//    - Retorna: { paymentId, invoiceUrl, status }
//    - Atualiza booking no Firestore com paymentId e paymentStatus
// ══════════════════════════════════════════════════════════════════════
exports.createBookingPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { studioUid, bookingId, amount, clientName, clientPhone, description } = req.body;

      // Validação de campos obrigatórios
      if (!studioUid || !bookingId || !amount || !clientName) {
        return res.status(400).json({
          error: "studioUid, bookingId, amount e clientName são obrigatórios",
        });
      }

      // ── 1. Criar (ou reusar) customer no Asaas do studio ──
      const customerData = {
        name: clientName,
        cpfCnpj: undefined,
        mobilePhone: clientPhone ? clientPhone.replace(/\D/g, "") : undefined,
        notificationDisabled: false,
      };

      const customer = await studioAsaasRequest(
        studioUid, "POST", "/customers", customerData
      );

      // ── 2. Calcular dueDate (amanhã) ──
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      const dueDateFormatted = dueDate.toISOString().split("T")[0]; // YYYY-MM-DD

      // ── 3. Criar cobrança avulsa ──
      const billing = await studioAsaasRequest(studioUid, "POST", "/payments", {
        customer:          customer.id,
        billingType:       "UNDEFINED",   // Aceita PIX, cartão e boleto
        value:             amount,
        dueDate:           dueDateFormatted,
        description:       description || `Agendamento #${bookingId}`,
        externalReference: `booking_${studioUid}_${bookingId}`,
      });

      // ── 4. Atualizar booking no Firestore ──
      const bookingRef = db
        .collection("studios").doc(studioUid)
        .collection("bookings").doc(bookingId);

      await bookingRef.update({
        paymentId:     billing.id,
        paymentStatus: "pending",
        paymentUrl:    billing.invoiceUrl || null,
        updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Booking payment criado: ${billing.id} | studio: ${studioUid} | booking: ${bookingId}`);
      return res.json({
        paymentId:  billing.id,
        invoiceUrl: billing.invoiceUrl || null,
        status:     billing.status,
      });

    } catch (err) {
      console.error("createBookingPayment error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });
});

// ══════════════════════════════════════════════════════════════════════
// 10. WEBHOOK ASAAS PARA PAGAMENTOS DE AGENDAMENTO (BOOKING)
//    POST (chamado pelo Asaas quando pagamento muda de status)
//    URL: https://us-central1-<project>.cloudfunctions.net/asaasBookingWebhook
//
//    Eventos tratados:
//    PAYMENT_CONFIRMED / PAYMENT_RECEIVED → paymentStatus: 'paid', booking status: 'confirmed'
//    PAYMENT_REFUNDED                     → paymentStatus: 'refunded'
//
//    Identifica o booking via externalReference: booking_{studioUid}_{bookingId}
// ══════════════════════════════════════════════════════════════════════
exports.asaasBookingWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const event   = req.body;
    const payment = event?.payment;

    console.log("📩 Booking Webhook Asaas recebido:", JSON.stringify({
      event: event.event,
      paymentId: payment?.id,
      externalReference: payment?.externalReference,
    }));

    // ── 1. Verificar se é um pagamento de booking ──
    const extRef = payment?.externalReference || "";
    if (!extRef.startsWith("booking_")) {
      // Não é um pagamento de booking — ignorar
      return res.sendStatus(200);
    }

    // ── 2. Extrair studioUid e bookingId do externalReference ──
    // Formato: booking_{studioUid}_{bookingId}
    const parts = extRef.split("_");
    // parts[0] = "booking", parts[1] = studioUid, parts[2+] = bookingId
    if (parts.length < 3) {
      console.warn("⚠️ externalReference com formato inesperado:", extRef);
      return res.sendStatus(200);
    }

    const studioUid = parts[1];
    const bookingId = parts.slice(2).join("_");

    // ── 3. Mapear evento → paymentStatus ──
    const statusMap = {
      PAYMENT_CONFIRMED: "paid",
      PAYMENT_RECEIVED:  "paid",
      PAYMENT_REFUNDED:  "refunded",
    };

    const newPaymentStatus = statusMap[event.event];
    if (!newPaymentStatus) {
      // Evento não tratado — retornar 200 para o Asaas não reenviar
      return res.sendStatus(200);
    }

    // ── 4. Atualizar booking no Firestore ──
    const bookingRef = db
      .collection("studios").doc(studioUid)
      .collection("bookings").doc(bookingId);

    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      console.warn(`⚠️ Booking não encontrado: studios/${studioUid}/bookings/${bookingId}`);
      return res.sendStatus(200);
    }

    const updateData = {
      paymentStatus: newPaymentStatus,
      updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
    };

    if (newPaymentStatus === "paid") {
      updateData.paidAt = admin.firestore.FieldValue.serverTimestamp();
      updateData.status = "confirmed";   // Confirmar agendamento ao receber pagamento
    }

    if (newPaymentStatus === "refunded") {
      updateData.refundedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await bookingRef.update(updateData);

    console.log(`✅ Booking atualizado: studios/${studioUid}/bookings/${bookingId} → paymentStatus: ${newPaymentStatus} (${event.event})`);
    return res.sendStatus(200);

  } catch (err) {
    console.error("asaasBookingWebhook error:", err.message);
    // Sempre 200 para evitar reenvios infinitos do Asaas
    return res.sendStatus(200);
  }
});

// ══════════════════════════════════════════════════════════════════════
// 🧾 FOCUS NFE — EMISSÃO DE NFS-e
// ══════════════════════════════════════════════════════════════════════
exports.emitFocusNFSe = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'O usuário precisa estar logado.');
  }

  const {
    studioUid,
    bookingId,
    clientName,
    clientEmail,
    cpfCnpj,
    zipCode, street, number, complement, neighborhood, city, state,
    serviceCnae,
    serviceValue,
    serviceDescription
  } = data;

  if (!studioUid || !bookingId || !clientName || !cpfCnpj || !zipCode || !street || !number || !neighborhood || !city || !state || !serviceCnae || !serviceValue || !serviceDescription) {
    throw new functions.https.HttpsError('invalid-argument', 'Parâmetros obrigatórios ausentes.');
  }

  try {
    const configSnap = await db.collection("studioConfig").doc(studioUid).get();
    if (!configSnap.exists) {
      throw new Error("Estúdio não possui configurações fiscais ativas.");
    }
    const focusNfeConfig = configSnap.data()?.focusNfeConfig;
    if (!focusNfeConfig || !focusNfeConfig.enabled || !focusNfeConfig.token) {
      throw new Error("Integração Focus NFe desativada ou Token ausente.");
    }

    const { token, environment, taxRegime, issRate } = focusNfeConfig;
    const baseUrl = environment === "production"
      ? "https://api.focusnfe.com.br"
      : "https://homologacao.focusnfe.com.br";

    const reference = `${studioUid}_${bookingId}`;

    const payload = {
      data_emissao: new Date().toISOString().split('T')[0],
      prestador: {},
      tomador: {
        cpf: cpfCnpj.replace(/\D/g, "").length === 11 ? cpfCnpj.replace(/\D/g, "") : undefined,
        cnpj: cpfCnpj.replace(/\D/g, "").length === 14 ? cpfCnpj.replace(/\D/g, "") : undefined,
        razao_social: clientName,
        email: clientEmail,
        endereco: {
          logradouro: street,
          numero: number,
          complemento: complement || undefined,
          bairro: neighborhood,
          uf: state,
          cep: zipCode.replace(/\D/g, "")
        }
      },
      servico: {
        aliquota: parseFloat(issRate) || 2.0,
        cnae_servico: serviceCnae.replace(/\D/g, ""),
        descricao: serviceDescription,
        valor_servicos: parseFloat(serviceValue)
      }
    };

    const authHeader = Buffer.from(`${token}:`).toString('base64');
    console.log(`📤 Enviando NFS-e ref=${reference} para Focus NFe baseUrl=${baseUrl}`);
    
    const response = await axios({
      method: "POST",
      url: `${baseUrl}/v2/nfse?ref=${reference}`,
      data: payload,
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/json"
      },
      timeout: 15000
    });

    const focusResult = response.data;
    const focusStatus = focusResult.status;

    const invoiceData = {
      provider: "focus_nfe",
      reference: reference,
      status: focusStatus === "erro_autorizacao" ? "error" : "processing",
      errorMessage: focusStatus === "erro_autorizacao" ? (focusResult.mensagem || "Erro na emissão.") : null,
      issuedAt: new Date().toISOString(),
      pdfUrl: focusResult.caminho_pdf_nota_fiscal ? `${baseUrl}${focusResult.caminho_pdf_nota_fiscal}` : null,
      xmlUrl: focusResult.caminho_xml_nota_fiscal ? `${baseUrl}${focusResult.caminho_xml_nota_fiscal}` : null
    };

    await db.collection("appointments").doc(bookingId).update({
      invoice: invoiceData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      status: invoiceData.status,
      message: invoiceData.errorMessage || "Enviada para processamento com sucesso.",
      data: invoiceData
    };

  } catch (err) {
    console.error("emitFocusNFSe API Error:", err.response?.data || err.message);
    const detail = err.response?.data?.mensagem || err.response?.data?.erros?.[0]?.mensagem || err.message;
    
    try {
      await db.collection("appointments").doc(bookingId).update({
        "invoice.status": "error",
        "invoice.errorMessage": detail,
        "invoice.issuedAt": new Date().toISOString(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch(e){}

    return {
      status: "error",
      message: detail
    };
  }
});

// ══════════════════════════════════════════════════════════════════════
// 🔍 FOCUS NFE — CONSULTAR STATUS DA NFS-e
// ══════════════════════════════════════════════════════════════════════
exports.checkFocusNFSeStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'O usuário precisa estar logado.');
  }

  const { studioUid, bookingId } = data;
  if (!studioUid || !bookingId) {
    throw new functions.https.HttpsError('invalid-argument', 'studioUid e bookingId são obrigatórios.');
  }

  try {
    const configSnap = await db.collection("studioConfig").doc(studioUid).get();
    if (!configSnap.exists) {
      throw new Error("Estúdio não possui configurações fiscais.");
    }
    const focusNfeConfig = configSnap.data()?.focusNfeConfig;
    if (!focusNfeConfig || !focusNfeConfig.token) {
      throw new Error("Token Focus NFe ausente.");
    }

    const { token, environment } = focusNfeConfig;
    const baseUrl = environment === "production"
      ? "https://api.focusnfe.com.br"
      : "https://homologacao.focusnfe.com.br";

    const reference = `${studioUid}_${bookingId}`;
    const authHeader = Buffer.from(`${token}:`).toString('base64');

    console.log(`🔍 Consultando status NFS-e ref=${reference} na Focus NFe`);

    const response = await axios({
      method: "GET",
      url: `${baseUrl}/v2/nfse/${reference}`,
      headers: {
        "Authorization": `Basic ${authHeader}`
      },
      timeout: 10000
    });

    const focusResult = response.data;
    const focusStatus = focusResult.status;

    let finalStatus = "processing";
    let errorMessage = null;

    if (focusStatus === "autorizado") {
      finalStatus = "authorized";
    } else if (focusStatus === "erro_autorizacao") {
      finalStatus = "error";
      errorMessage = focusResult.mensagem || "Erro na emissão.";
    }

    const invoiceData = {
      provider: "focus_nfe",
      reference: reference,
      status: finalStatus,
      errorMessage: errorMessage,
      issuedAt: new Date().toISOString(),
      pdfUrl: focusResult.caminho_pdf_nota_fiscal ? `${baseUrl}${focusResult.caminho_pdf_nota_fiscal}` : null,
      xmlUrl: focusResult.caminho_xml_nota_fiscal ? `${baseUrl}${focusResult.caminho_xml_nota_fiscal}` : null
    };

    await db.collection("appointments").doc(bookingId).update({
      invoice: invoiceData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return invoiceData;

  } catch (err) {
    console.error("checkFocusNFSeStatus error:", err.response?.data || err.message);
    const detail = err.response?.data?.mensagem || err.message;
    throw new functions.https.HttpsError('internal', detail);
  }
});

// ══════════════════════════════════════════════════════════════════════
// 📣 CENTRAL DE COMUNICAÇÃO — ENVIO DE E-MAIL CENTRALIZADO (RESEND)
// ══════════════════════════════════════════════════════════════════════
exports.sendCentralEmail = functions.runWith({ secrets: ["RESEND_API_KEY"] }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'O usuário precisa estar logado.');
  }

  const { studioUid, toEmail, subject, htmlContent } = data;
  if (!studioUid || !toEmail || !subject || !htmlContent) {
    throw new functions.https.HttpsError('invalid-argument', 'studioUid, toEmail, subject e htmlContent são obrigatórios.');
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY || "re_dummy_key";
    
    const configRef = db.collection("studioConfig").doc(studioUid);
    const configSnap = await configRef.get();
    
    let plan = "solo";
    let sentThisMonth = 0;
    let limit = 1000;
    let lastResetDate = new Date().toISOString();

    if (configSnap.exists) {
      const configData = configSnap.data();
      plan = configData.plan || "solo";
      const emailConfig = configData.communication?.email || {};
      sentThisMonth = emailConfig.sentThisMonth || 0;
      limit = emailConfig.limit || (plan === "premium" ? 10000 : plan === "studio" ? 3000 : 1000);
      lastResetDate = emailConfig.lastResetDate || new Date().toISOString();
    }

    const now = new Date();
    const lastReset = new Date(lastResetDate);
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      sentThisMonth = 0;
      lastResetDate = now.toISOString();
    }

    if (sentThisMonth >= limit) {
      throw new Error(`Limite de e-mails do plano atingido (${sentThisMonth}/${limit}). Faça upgrade para enviar mais.`);
    }

    console.log(`📤 Enviando e-mail centralizado para ${toEmail} ref=${studioUid}`);
    const response = await axios({
      method: "POST",
      url: "https://api.resend.com/emails",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      data: {
        from: "Studio Beauty <no-reply@clientehub.app.br>",
        to: [toEmail],
        subject: subject,
        html: htmlContent
      },
      timeout: 10000
    });

    sentThisMonth += 1;
    await configRef.set({
      plan: plan,
      communication: {
        email: {
          sentThisMonth: sentThisMonth,
          limit: limit,
          lastResetDate: lastResetDate
        }
      }
    }, { merge: true });

    return {
      status: "success",
      message: "E-mail enviado com sucesso!",
      sentThisMonth,
      limit
    };

  } catch (err) {
    console.error("sendCentralEmail error:", err.response?.data || err.message);
    const detail = err.response?.data?.message || err.message;
    throw new functions.https.HttpsError('internal', detail);
  }
});

// ══════════════════════════════════════════════════════════════════════
// 📣 CENTRAL DE COMUNICAÇÃO — ENVIO DE SMS CENTRALIZADO (SMS DEV)
// ══════════════════════════════════════════════════════════════════════
exports.sendCentralSMS = functions.runWith({ secrets: ["SMS_DEV_TOKEN"] }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'O usuário precisa estar logado.');
  }

  const { studioUid, phone, message } = data;
  if (!studioUid || !phone || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'studioUid, phone e message são obrigatórios.');
  }

  try {
    const smsDevKey = process.env.SMS_DEV_TOKEN || "sms_dummy_key";

    const configRef = db.collection("studioConfig").doc(studioUid);
    const configSnap = await configRef.get();
    
    let creditsBalance = 0;
    if (configSnap.exists) {
      creditsBalance = configSnap.data().communication?.sms?.creditsBalance || 0;
    }

    if (creditsBalance <= 0) {
      throw new Error("Saldo de créditos de SMS esgotado. Por favor, faça uma recarga.");
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : "55" + cleanPhone;

    console.log(`📤 Enviando SMS centralizado para ${formattedPhone} ref=${studioUid}`);

    const response = await axios({
      method: "POST",
      url: "https://api.smsdev.com.br/v1/send",
      headers: { "Content-Type": "application/json" },
      data: {
        key: smsDevKey,
        type: 9,
        number: formattedPhone,
        msg: message
      },
      timeout: 10000
    });

    const newBalance = creditsBalance - 1;
    await configRef.set({
      communication: {
        sms: {
          creditsBalance: newBalance
        }
      }
    }, { merge: true });

    return {
      status: "success",
      message: "SMS enviado com sucesso!",
      creditsBalance: newBalance
    };

  } catch (err) {
    console.error("sendCentralSMS error:", err.response?.data || err.message);
    const detail = err.response?.data?.description || err.message;
    throw new functions.https.HttpsError('internal', detail);
  }
});

// ══════════════════════════════════════════════════════════════════════
// 📣 CENTRAL DE COMUNICAÇÃO — COMPRA DE CRÉDITOS DE SMS VIA PIX (ASAAS MASTER)
// ══════════════════════════════════════════════════════════════════════
exports.buySmsCredits = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'O usuário precisa estar logado.');
  }

  const { studioUid, packageId } = data;
  if (!studioUid || !packageId) {
    throw new functions.https.HttpsError('invalid-argument', 'studioUid e packageId são obrigatórios.');
  }

  const PACKAGES = {
    bronze: { qty: 100, value: 15.00, label: "Pacote Bronze (100 SMS)" },
    prata:  { qty: 300, value: 39.00, label: "Pacote Prata (300 SMS)" },
    ouro:   { qty: 500, value: 59.00, label: "Pacote Ouro (500 SMS)" }
  };

  const pack = PACKAGES[packageId];
  if (!pack) {
    throw new functions.https.HttpsError('invalid-argument', 'Pacote de recarga inválido.');
  }

  try {
    const companySnap = await db.collection("companies").doc(studioUid).get();
    if (!companySnap.exists) {
      throw new Error("Estúdio/Empresa não cadastrada no sistema.");
    }
    const company = companySnap.data();

    let customerId = company.asaasCustomerId;
    if (!customerId) {
      const customer = await asaasRequest("POST", "/customers", {
        name: company.ownerName || company.companyName || "Cliente LashBrow",
        email: company.ownerEmail || "",
        mobilePhone: company.ownerPhone ? company.ownerPhone.replace(/\D/g, "") : undefined,
        externalReference: studioUid,
        notificationDisabled: false,
        observations: "LashBrow — Sistema de Gestão para Cílios e Sobrancelhas",
      });
      customerId = customer.id;
      await db.collection("companies").doc(studioUid).update({
        asaasCustomerId: customerId,
      });
    }

    const txRef = await db.collection("sms_transactions").add({
      studioId: studioUid,
      qty: pack.qty,
      value: pack.value,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const transactionId = txRef.id;

    console.log(`⚡ Gerando cobrança PIX para recarga SMS do studioId=${studioUid}, transacao=${transactionId}`);
    const payment = await asaasRequest("POST", "/payments", {
      customer: customerId,
      billingType: "PIX",
      value: pack.value,
      dueDate: new Date().toISOString().split("T")[0],
      description: `Recarga SMS Studio Beauty — ${pack.label}`,
      externalReference: `sms_recarga_${studioUid}_${transactionId}`
    });

    const pixData = await asaasRequest("GET", `/payments/${payment.id}/pixQrCode`);

    await txRef.update({
      paymentId: payment.id,
      invoiceUrl: payment.invoiceUrl || null,
      pixCopiaCola: pixData.payload || null,
      pixQrCodeBase64: pixData.encodedImage || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      status: "pending",
      transactionId,
      invoiceUrl: payment.invoiceUrl || null,
      pixCopiaCola: pixData.payload || null,
      pixQrCodeBase64: pixData.encodedImage || null,
      value: pack.value,
      qty: pack.qty
    };

  } catch (err) {
    console.error("buySmsCredits error:", err.message);
    throw new functions.https.HttpsError('internal', err.message);
  }
});

// ══════════════════════════════════════════════════════════════════════
// 📣 CENTRAL DE COMUNICAÇÃO — DISPARO DE CAMPANHAS EM MASSA (ADMIN CRM)
// ══════════════════════════════════════════════════════════════════════
exports.sendAdminCampaign = functions.runWith({ secrets: ["RESEND_API_KEY", "SMS_DEV_TOKEN"] }).https.onCall(async (data, context) => {
  const { type, subject, message, contacts, adminPin } = data;
  
  if (adminPin !== "lash@2026") {
    throw new functions.https.HttpsError('permission-denied', 'PIN administrativo inválido.');
  }

  if (!type || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'type e message são obrigatórios.');
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY || "re_dummy_key";
    const smsDevKey = process.env.SMS_DEV_TOKEN || "sms_dummy_key";

    let targetContacts = contacts;
    if (!targetContacts || targetContacts.length === 0) {
      const snap = await db.collection("admin_contacts").get();
      targetContacts = snap.docs.map(doc => doc.data());
    }

    if (targetContacts.length === 0) {
      return { status: "success", message: "Nenhum contato selecionado ou cadastrado para envio.", sentCount: 0 };
    }

    console.log(`📣 Iniciando Campanha CRM Admin em lote para ${targetContacts.length} contatos. Tipo=${type}`);

    let emailSent = 0;
    let smsSent = 0;
    let errors = [];

    for (const contact of targetContacts) {
      const name = contact.name || "Cliente";
      const email = contact.email;
      const phone = contact.phone;

      // Substitui placeholder {nome}
      const customMessage = message.replace(/\{nome\}/g, name);

      // 1. Envio de E-mail
      if ((type === "email" || type === "both") && email && email.includes("@")) {
        try {
          const htmlMessage = customMessage.replace(/\n/g, '<br>');
          const htmlBody = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { margin: 0; padding: 0; background-color: #0b050f; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #e2e8f0; }
              .container { max-width: 600px; margin: 40px auto; background-color: #12071a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(201, 169, 110, 0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
              .header { background: linear-gradient(135deg, #1a0a1e 0%, #2d1040 100%); padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a96e; }
              .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px; }
              .content { padding: 40px 30px; line-height: 1.6; font-size: 15px; }
              .content p { margin: 0 0 20px 0; color: #cbd5e1; }
              .content strong { color: #ffffff; }
              .msg-box { background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-left: 4px solid #c9a96e; border-radius: 8px; padding: 24px; margin: 25px 0; font-size: 16px; color: #f1f5f9; }
              .footer { background-color: #08030c; padding: 25px 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.03); }
              .footer a { color: #c9a96e; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Studio Beauty</h1>
              </div>
              <div class="content">
                <p>Olá, <strong>${name}</strong>! 💕</p>
                <div class="msg-box">${htmlMessage}</div>
              </div>
              <div class="footer">
                <p>Enviado pela Central de Relacionamento Studio Beauty</p>
                <p style="margin-top: 8px;">Tecnologia <a href="https://clientehub.app.br" target="_blank">Studio Beauty</a></p>
              </div>
            </div>
          </body>
          </html>
          `;

          await axios({
            method: "POST",
            url: "https://api.resend.com/emails",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json"
            },
            data: {
              from: "Studio Beauty <no-reply@clientehub.app.br>",
              to: [email],
              subject: subject || "Comunicado Importante — Studio Beauty",
              html: htmlBody
            },
            timeout: 10000
          });
          emailSent++;
        } catch (mailErr) {
          console.error(`Falha ao disparar e-mail para ${email}:`, mailErr.message);
          errors.push({ contact: email, type: "email", error: mailErr.message });
        }
      }

      // 2. Envio de SMS
      if ((type === "sms" || type === "both") && phone) {
        try {
          // Sanitização de SMS
          let cleanMsg = customMessage.replace(/[\*_~]/g, '');
          cleanMsg = cleanMsg.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');

          const cleanPhone = phone.replace(/\D/g, "");
          const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : "55" + cleanPhone;

          await axios({
            method: "POST",
            url: "https://api.smsdev.com.br/v1/send",
            headers: { "Content-Type": "application/json" },
            data: {
              key: smsDevKey,
              type: 9,
              number: formattedPhone,
              msg: cleanMsg
            },
            timeout: 10000
          });
          smsSent++;
        } catch (smsErr) {
          console.error(`Falha ao disparar SMS para ${phone}:`, smsErr.message);
          errors.push({ contact: phone, type: "sms", error: smsErr.message });
        }
      }
    }

    // Salva histórico da campanha
    await db.collection("admin_campaigns").add({
      title: subject || "Campanha Informativa",
      type,
      message,
      targetCount: targetContacts.length,
      emailSent,
      smsSent,
      failedCount: errors.length,
      sentAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Campanha finalizada. E-mails: ${emailSent}, SMS: ${smsSent}, Erros: ${errors.length}`);

    return {
      status: "success",
      emailSent,
      smsSent,
      failedCount: errors.length,
      errors: errors.slice(0, 10) // reporta os primeiros 10 erros para debug
    };

  } catch (err) {
    console.error("sendAdminCampaign error:", err.message);
    throw new functions.https.HttpsError('internal', err.message);
  }
});
