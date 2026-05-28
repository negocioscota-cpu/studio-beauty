// === NOTIFICAÇÕES E LEMBRETES (Config) ===
const NotificationsConfig = {
    async render(container) {
        const uid = firebase.auth().currentUser?.uid;
        let comp = {};
        if (uid) {
            try {
                const doc = await db.collection('studios').doc(uid).get();
                comp = doc.exists ? (doc.data() || {}) : {};
            } catch(e) {}
        }
        const notif = comp.notifications || {};

        container.innerHTML = `
        <div class="settings-page">
          <div class="settings-section-card">
            <div class="settings-section-header">
              <span class="material-symbols-outlined">notifications</span>
              <div>
                <h3 class="settings-section-title">Notificações e Lembretes</h3>
                <p class="settings-section-sub">Configure como suas clientes recebem lembretes</p>
              </div>
            </div>
            <div class="settings-section-body">
              <div class="settings-toggle-item">
                <div>
                  <div style="font-weight:600;font-size:0.9rem">E-mails de Lembrete</div>
                  <div style="font-size:0.8rem;color:var(--text-muted)">Lembretes automáticos para clientes antes dos agendamentos</div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-email" ${notif.emailReminder !== false ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>
              <div class="settings-toggle-item">
                <div>
                  <div style="font-weight:600;font-size:0.9rem">Notificações Push</div>
                  <div style="font-size:0.8rem;color:var(--text-muted)">Receba alertas em tempo real sobre novos agendamentos</div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-push" ${notif.push ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>
              <div class="form-group" style="margin-top:16px">
                <label class="form-label" style="text-transform:uppercase;font-size:0.72rem;letter-spacing:0.8px">Mensagem de Saudação do Lembrete</label>
                <textarea class="form-control" id="notif-msg" rows="3" placeholder="Olá {nome}! Lembrando do seu agendamento de {serviço} no dia {data} às {hora}. Te esperamos! 💗">${notif.reminderMsg || ''}</textarea>
                <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px">
                  <span style="font-size:0.72rem;color:var(--text-muted);margin-right:4px">VARIÁVEIS:</span>
                  ${['{nome}','{serviço}','{data}','{hora}','{studio}'].map(v => `<span class="settings-var-badge">${v}</span>`).join('')}
                </div>
              </div>
              <div class="settings-action-bar">
                <button class="btn btn-primary" onclick="NotificationsConfig.save()">
                  <span class="material-symbols-outlined">save</span> Salvar Notificações
                </button>
              </div>
            </div>
          </div>
        </div>`;
    },

    async save() {
        const uid = firebase.auth().currentUser?.uid;
        if (!uid) return;
        const notifications = {
            emailReminder: document.getElementById('notif-email')?.checked !== false,
            push:          document.getElementById('notif-push')?.checked || false,
            reminderMsg:   document.getElementById('notif-msg')?.value.trim()
        };
        try {
            await db.collection('studios').doc(uid).set({ notifications }, { merge: true });
            App.showToast('Notificações salvas! 🔔', 'success');
        } catch(err) { App.showToast('Erro: ' + err.message, 'error'); }
    }
};
