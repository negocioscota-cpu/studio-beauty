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
        const pushGranted = PushNotifications?.isGranted() || false;
        const pushStatusHTML = pushGranted
            ? '<span style="color:#22c55e;font-weight:600;font-size:0.78rem">✅ Ativas</span>'
            : '<span style="color:#f59e0b;font-weight:600;font-size:0.78rem">⚠️ Não ativadas</span>';

        container.innerHTML = `
        <div class="settings-page">
          <!-- Push Notifications PWA -->
          <div class="settings-section-card" style="border-left:4px solid var(--primary)">
            <div class="settings-section-header">
              <span class="material-symbols-outlined">notifications_active</span>
              <div>
                <h3 class="settings-section-title">🔔 Notificações Push (PWA)</h3>
                <p class="settings-section-sub">Receba alertas diretamente no seu dispositivo — mesmo com o app minimizado</p>
              </div>
              ${pushStatusHTML}
            </div>
            <div class="settings-section-body">

              <!-- Botão de ativar permissão -->
              ${!pushGranted ? `
              <div style="padding:16px;background:rgba(201,169,110,0.08);border-radius:12px;border:1px solid rgba(201,169,110,0.25);margin-bottom:16px;display:flex;align-items:center;gap:14px">
                <span style="font-size:2rem">📱</span>
                <div style="flex:1">
                  <div style="font-weight:700;font-size:0.9rem;color:var(--text-primary)">Ativar Notificações Push</div>
                  <div style="font-size:0.78rem;color:var(--text-muted)">Permita notificações para receber alertas de aniversariantes, estoque baixo e lembretes no seu dispositivo.</div>
                </div>
                <button class="btn btn-primary" onclick="PushNotifications.requestPermission().then(()=>App.navigate('notifications'))">
                  <span class="material-symbols-outlined">notifications</span> Ativar
                </button>
              </div>` : ''}

              <!-- 🎂 Push Aniversariantes -->
              <div class="settings-toggle-item">
                <div>
                  <div style="font-weight:600;font-size:0.9rem">🎂 Aniversariantes do Dia</div>
                  <div style="font-size:0.8rem;color:var(--text-muted)">Notificação pela manhã com as clientes aniversariantes</div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-push-birthday" ${notif.pushBirthday !== false ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>

              <!-- 📦 Push Estoque Baixo -->
              <div class="settings-toggle-item">
                <div>
                  <div style="font-weight:600;font-size:0.9rem">📦 Estoque Baixo</div>
                  <div style="font-size:0.8rem;color:var(--text-muted)">Alerta quando produtos atingem o nível mínimo</div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-push-stock" ${notif.pushStock !== false ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>

              <!-- 🔔 Push Lembrete D-1 -->
              <div class="settings-toggle-item">
                <div>
                  <div style="font-weight:600;font-size:0.9rem">🔔 Lembrete D-1 (Amanhã)</div>
                  <div style="font-size:0.8rem;color:var(--text-muted)">Alerta à tarde com os atendimentos de amanhã (no seu dispositivo)</div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-push-reminder" ${notif.pushReminder !== false ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>

              <!-- Teste de push -->
              ${pushGranted ? `
              <div style="padding:12px 0;border-top:1px solid var(--border);margin-top:8px">
                <button class="btn btn-ghost btn-sm" onclick="PushNotifications.sendTest()" style="font-size:0.78rem">
                  <span class="material-symbols-outlined" style="font-size:16px">science</span> Enviar Notificação de Teste
                </button>
              </div>` : ''}

            </div>
          </div>

          <!-- WhatsApp / Email (configurações já existentes) -->
          <div class="settings-section-card">
            <div class="settings-section-header">
              <span class="material-symbols-outlined">mail</span>
              <div>
                <h3 class="settings-section-title">📧 Lembretes por E-mail e WhatsApp</h3>
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
                  <div style="font-weight:600;font-size:0.9rem">Notificações Push (geral)</div>
                  <div style="font-size:0.8rem;color:var(--text-muted)">Master switch — desative para pausar todas as notificações push</div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-push" ${notif.push !== false ? 'checked' : ''}>
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
            </div>
          </div>

          <!-- Botão Salvar -->
          <div class="settings-action-bar">
            <button class="btn btn-primary" onclick="NotificationsConfig.save()">
              <span class="material-symbols-outlined">save</span> Salvar Configurações
            </button>
          </div>
        </div>`;
    },

    async save() {
        const uid = firebase.auth().currentUser?.uid;
        if (!uid) return;
        const notifications = {
            emailReminder:  document.getElementById('notif-email')?.checked !== false,
            push:           document.getElementById('notif-push')?.checked !== false,
            pushBirthday:   document.getElementById('notif-push-birthday')?.checked !== false,
            pushStock:      document.getElementById('notif-push-stock')?.checked !== false,
            pushReminder:   document.getElementById('notif-push-reminder')?.checked !== false,
            reminderMsg:    document.getElementById('notif-msg')?.value.trim()
        };
        try {
            await db.collection('studios').doc(uid).set({ notifications }, { merge: true });
            App.showToast('Configurações de notificação salvas! 🔔', 'success');
        } catch(err) { App.showToast('Erro: ' + err.message, 'error'); }
    }
};
