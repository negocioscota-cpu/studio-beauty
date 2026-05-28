// === LashBrow — Programa de Indicações ===
const Referrals = {

    async init() {
        await Referrals.loadMyCode();
        await Referrals.loadMyReferrals();
    },

    async loadMyCode() {
        const uid = firebase.auth().currentUser?.uid;
        if (!uid) return;

        try {
            const doc = await db.collection('studios').doc(uid).get();
            const data = doc.data() || {};
            let code = data.referralCode;

            // Gera código se não existir
            if (!code) {
                code = uid.substring(0, 6).toUpperCase();
                await db.collection('studios').doc(uid).update({ referralCode: code });
            }

            const link = `${window.location.origin}/app.html?ref=${code}`;
            const el = document.getElementById('referral-code-display');
            const linkEl = document.getElementById('referral-link-display');
            if (el) el.textContent = code;
            if (linkEl) linkEl.textContent = link;

            document.getElementById('btn-copy-code')?.addEventListener('click', () => {
                navigator.clipboard.writeText(code).then(() => App.showToast('Código copiado!', 'success'));
            });
            document.getElementById('btn-copy-link')?.addEventListener('click', () => {
                navigator.clipboard.writeText(link).then(() => App.showToast('Link copiado!', 'success'));
            });
            document.getElementById('btn-share-whatsapp')?.addEventListener('click', () => {
                const msg = encodeURIComponent(`✨ Conheça o LashBrow — gestão completa para designers de cílios e sobrancelhas! Cadastre-se pelo meu link: ${link}`);
                window.open(`https://wa.me/?text=${msg}`, '_blank');
            });

        } catch (err) {
            console.error('[Referrals] loadMyCode:', err);
        }
    },

    async loadMyReferrals() {
        const uid = firebase.auth().currentUser?.uid;
        if (!uid) return;

        const tbody = document.getElementById('referrals-tbody');

        try {
            const snap = await db.collection('referral_payments')
                .where('referrerId', '==', uid)
                .get();

            const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const pending  = items.filter(i => i.status === 'pending').length;
            const paid     = items.filter(i => i.status === 'paid').length;
            const total    = items.length;
            const earnings = paid * 30;

            const el = (id) => document.getElementById(id);
            if (el('ref-total'))    el('ref-total').textContent = total;
            if (el('ref-pending'))  el('ref-pending').textContent = pending;
            if (el('ref-paid'))     el('ref-paid').textContent = paid;
            if (el('ref-earnings')) el('ref-earnings').textContent =
                `R$ ${earnings.toFixed(2).replace('.', ',')}`;

            if (!tbody) return;

            if (items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color:var(--text-muted);padding:32px">
                    Você ainda não tem indicações. Compartilhe seu link!</td></tr>`;
                return;
            }

            tbody.innerHTML = items.map(item => {
                const statusBadge = {
                    pending:   '<span class="badge badge-gold">⏳ Pendente</span>',
                    converted: '<span class="badge badge-blue">✓ Convertida</span>',
                    paid:      '<span class="badge badge-green">💰 Pago</span>'
                }[item.status] || item.status;
                const date = item.createdAt?.toDate().toLocaleDateString('pt-BR') || '-';
                return `<tr>
                    <td>${item.referredEmail || '-'}</td>
                    <td>${date}</td>
                    <td>${statusBadge}</td>
                    <td>${item.status === 'paid' ? '<b style="color:var(--success)">R$ 30,00</b>' : '-'}</td>
                </tr>`;
            }).join('');

        } catch (err) {
            console.error('[Referrals] loadMyReferrals:', err);
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color:var(--text-muted);padding:32px">
                    Erro ao carregar indicações. Tente novamente.</td></tr>`;
            }
        }
    },

    // Registra a indicação quando um novo usuário se cadastra via link
    async registerReferral(referrerCode, referredUid, referredEmail) {
        if (!referrerCode) return;
        try {
            const snap = await db.collection('studios')
                .where('referralCode', '==', referrerCode)
                .limit(1).get();
            if (snap.empty) return;

            const referrerDoc = snap.docs[0];
            await db.collection('referral_payments').add({
                referrerId:   referrerDoc.id,
                referrerCode: referrerCode,
                referredUid,
                referredEmail,
                status:       'pending',
                bonusAmount:  30.00,
                createdAt:    firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (err) {
            console.error('[Referrals] registerReferral:', err);
        }
    }
};

