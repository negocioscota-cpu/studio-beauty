// === AGENDA ONLINE (Link de Agendamento) ===
const BookingOnline = {
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
        const bookingUrl  = `https://lashbrow.clientehub.app.br/booking/${bookingSlug}`;

        container.innerHTML = `
        <div class="settings-page">
          <div class="settings-section-card">
            <div class="settings-section-header">
              <span class="material-symbols-outlined">link</span>
              <div>
                <h3 class="settings-section-title">Link de Agendamento Online</h3>
                <p class="settings-section-sub">Compartilhe na bio do Instagram, WhatsApp ou site</p>
              </div>
            </div>
            <div class="settings-section-body">
              <div class="settings-booking-link-row">
                <div class="settings-booking-link-display">
                  <span style="color:var(--text-muted);font-size:0.82rem">lashbrow.clientehub.app.br/booking/</span>
                  <span style="font-weight:700">${bookingSlug}</span>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="BookingOnline.copyLink('${bookingUrl}')" title="Copiar">
                  <span class="material-symbols-outlined">content_copy</span>
                </button>
                <button class="btn btn-ghost btn-sm" onclick="window.open('${bookingUrl}','_blank')" title="Abrir">
                  <span class="material-symbols-outlined">share</span>
                </button>
              </div>
              <a href="${bookingUrl}" target="_blank" style="font-size:0.82rem;color:var(--primary);display:inline-flex;align-items:center;gap:4px;margin-top:8px">
                <span class="material-symbols-outlined" style="font-size:0.9rem">verified</span>
                ${bookingUrl}
              </a>
              <div class="settings-qrcode-box">
                <div id="qrcode-container" style="display:flex;align-items:center;justify-content:center;width:140px;height:140px;background:var(--surface-2);border-radius:var(--radius-sm);overflow:hidden">
                  <span class="material-symbols-outlined" style="font-size:3rem;color:var(--text-muted)">qr_code_2</span>
                </div>
                <div>
                  <div style="font-weight:600;font-size:0.88rem">QR Code de Agendamento</div>
                  <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">Suas clientes podem escanear para acessar sua agenda</div>
                </div>
              </div>
            </div>
          </div>
        </div>`;

        setTimeout(() => BookingOnline.generateQRCode(bookingUrl), 200);
    },

    copyLink(url) {
        navigator.clipboard.writeText(url).then(() => App.showToast('Link copiado! 🔗', 'success'));
    },

    generateQRCode(url) {
        const container = document.getElementById('qrcode-container');
        if (!container || !url) return;
        container.innerHTML = '';
        if (typeof QRCode === 'undefined') { container.innerHTML = '<span style="color:#aaa;font-size:0.8rem">QR Code indisponível</span>'; return; }
        try {
            new QRCode(container, { text: url, width: 140, height: 140, colorDark: '#C4758A', colorLight: '#1e0a14', correctLevel: QRCode.CorrectLevel.M });
        } catch(e) { console.warn('QR Code error:', e); }
    }
};
