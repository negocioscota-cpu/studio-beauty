// === LINK DA BIO (Linktree) ===
const BioLink = {
    async render(container) {
        const uid = firebase.auth().currentUser?.uid;
        let comp = {};
        if (uid) {
            try {
                const doc = await db.collection('studios').doc(uid).get();
                comp = doc.exists ? (doc.data() || {}) : {};
            } catch(e) {}
        }
        const bookingSlug = (comp.ownerEmail || '').replace(/[@.]/g, '').toLowerCase() || uid?.slice(0,8);
        const bioUrl = `https://lashbrow.clientehub.app.br/bio/${bookingSlug}`;

        container.innerHTML = `
        <div class="settings-page">
          <div class="settings-section-card">
            <div class="settings-section-header">
              <span class="material-symbols-outlined">manage_accounts</span>
              <div>
                <h3 class="settings-section-title">Link de Bio (Linktree)</h3>
                <p class="settings-section-sub">Página pública com todos os seus links. Cole na bio do Instagram!</p>
              </div>
            </div>
            <div class="settings-section-body">
              <div class="settings-booking-link-row">
                <div class="settings-booking-link-display">
                  <span style="color:var(--text-muted);font-size:0.82rem">lashbrow.clientehub.app.br/bio/</span>
                  <span style="font-weight:700">${bookingSlug}</span>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="BioLink.copyLink('${bioUrl}')" title="Copiar">
                  <span class="material-symbols-outlined">content_copy</span>
                </button>
                <button class="btn btn-ghost btn-sm" onclick="window.open('${bioUrl}','_blank')" title="Abrir">
                  <span class="material-symbols-outlined">open_in_new</span>
                </button>
              </div>
              <a href="${bioUrl}" target="_blank"
                 style="font-size:0.82rem;color:var(--primary);display:inline-flex;align-items:center;gap:4px;margin-top:8px">
                <span class="material-symbols-outlined" style="font-size:0.9rem">link</span>
                lashbrow.clientehub.app.br/bio/${bookingSlug}
              </a>
              <div style="margin-top:16px;padding:14px;background:var(--surface-2);border-radius:var(--radius-sm);border:1px solid var(--border)">
                <div style="font-size:0.82rem;font-weight:600;margin-bottom:8px">📲 O que aparece no seu Link de Bio:</div>
                <div style="display:flex;flex-direction:column;gap:6px;font-size:0.8rem;color:var(--text-muted)">
                  <span>📅 Agendar agora → link de agendamento online</span>
                  <span>📸 Ver portfólio → sua galeria de trabalhos</span>
                  <span>💬 Falar no WhatsApp → seu número cadastrado</span>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    },

    copyLink(url) {
        navigator.clipboard.writeText(url).then(() => App.showToast('Link copiado! 🔗', 'success'));
    }
};
