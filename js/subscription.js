// === Subscription Module — LashBrow ===
// Gerencia chamadas às Cloud Functions do Asaas para criação e consulta de assinaturas.

const Subscription = (() => {
  // ─────────────────────────────────────────────────────────────────────
  // URL base das Cloud Functions
  // ⚠️  Substituir pelo projeto correto após o deploy
  const FUNCTIONS_BASE = 'https://us-central1-lashbrow-app.cloudfunctions.net';

  // ─────────────────────────────────────────────────────────────────────
  // Inicia o fluxo de assinatura ao clicar num plano
  async function initiate(plan, billingType = 'PIX') {
    const uid  = firebase.auth().currentUser?.uid;
    const user = firebase.auth().currentUser;
    if (!uid) return;

    const loadingEl = document.getElementById('subscription-loading');
    const errorEl   = document.getElementById('subscription-error');
    const cardsEl   = document.getElementById('plan-cards');

    // UI: mostrar loading
    if (loadingEl) { loadingEl.classList.remove('hidden'); loadingEl.style.display = 'flex'; }
    if (errorEl)   errorEl.classList.add('hidden');
    if (cardsEl)   cardsEl.style.pointerEvents = 'none';

    try {
      // 1. Buscar dados da empresa para criar o customer Asaas
      const companySnap = await db.collection('companies').doc(uid).get();
      const company     = companySnap.data() || {};

      // 2. Garantir que o customer existe no Asaas
      const customerRes = await post('/createAsaasCustomer', {
        uid,
        name:  company.ownerName  || company.companyName || user.displayName || 'Cliente LashBrow',
        email: company.ownerEmail || user.email || '',
        phone: company.ownerPhone || '',
      });
      if (customerRes.error) throw new Error(customerRes.error);

      // 3. Criar assinatura e obter link de pagamento
      const subRes = await post('/createAsaasSubscription', {
        uid,
        plan,
        billingType,
      });
      if (subRes.error) throw new Error(subRes.error);

      // 4. Redirecionar para o checkout Asaas
      if (subRes.paymentLink) {
        window.open(subRes.paymentLink, '_blank');
        // Mostrar mensagem de acompanhamento
        if (errorEl) {
          errorEl.className = 'auth-success';
          errorEl.innerHTML = `✓ Link de pagamento aberto! Após confirmar o pagamento, atualize esta página.
            <br><br>
            <button class="btn btn-primary btn-full" style="margin-top:8px" onclick="location.reload()">
              <span class="material-symbols-outlined">refresh</span> Já paguei — Atualizar
            </button>`;
          errorEl.classList.remove('hidden');
        }
      } else {
        throw new Error('Não foi possível gerar o link de pagamento. Tente novamente ou fale pelo WhatsApp.');
      }

    } catch (err) {
      console.error('Subscription.initiate error:', err);
      if (errorEl) {
        errorEl.className = 'auth-error';
        errorEl.textContent = '⚠️ ' + (err.message || 'Erro ao processar. Tente novamente.');
        errorEl.classList.remove('hidden');
      }
    } finally {
      if (loadingEl) { loadingEl.classList.add('hidden'); loadingEl.style.display = 'none'; }
      if (cardsEl)   cardsEl.style.pointerEvents = 'auto';
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // Verifica o status da assinatura na inicialização do app
  // Retorna: { status, plan, trialActive, trialEndsAt, currentPeriodEnd }
  async function checkStatus(uid) {
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/getSubscriptionStatus?uid=${uid}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('Subscription.checkStatus error:', err.message);
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // Recupera o link de pagamento para assinaturas em overdue/pending
  async function getPaymentLink(uid) {
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/getPaymentLink?uid=${uid}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.paymentLink || null;
    } catch (err) {
      console.warn('Subscription.getPaymentLink error:', err.message);
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // Helper: POST para Cloud Function
  async function post(endpoint, body) {
    const res = await fetch(`${FUNCTIONS_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  }

  return { initiate, checkStatus, getPaymentLink };
})();

