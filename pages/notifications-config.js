// === NOTIFICAÇÕES PUSH (Config) ===
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
        const browserState = !('Notification' in window) ? 'unsupported' :
            Notification.permission === 'granted' ? 'granted' :
            Notification.permission === 'denied' ? 'denied' : 'default';

        const statusBadges = {
            granted: '<span style="color:#22c55e;font-weight:700;font-size:0.8rem;display:inline-flex;align-items:center;gap:4px"><span class="material-symbols-outlined" style="font-size:16px">check_circle</span> Ativas</span>',
            denied: '<span style="color:#ef4444;font-weight:700;font-size:0.8rem;display:inline-flex;align-items:center;gap:4px"><span class="material-symbols-outlined" style="font-size:16px">block</span> Bloqueadas</span>',
            default: '<span style="color:#f59e0b;font-weight:700;font-size:0.8rem;display:inline-flex;align-items:center;gap:4px"><span class="material-symbols-outlined" style="font-size:16px">warning</span> Não ativadas</span>',
            unsupported: '<span style="color:#6b7280;font-weight:700;font-size:0.8rem;display:inline-flex;align-items:center;gap:4px"><span class="material-symbols-outlined" style="font-size:16px">do_not_disturb</span> Não suportado</span>'
        };

        // Mensagem de saudação com preview
        const reminderMsg = notif.reminderMsg || '';
        const previewMsg = (reminderMsg || 'Olá {nome}! Lembrando do seu agendamento de {serviço} no dia {data} às {hora}. Te esperamos! 💗')
            .replace('{nome}', 'Maria')
            .replace('{serviço}', 'Extensão de Cílios')
            .replace('{data}', new Date().toLocaleDateString('pt-BR'))
            .replace('{hora}', '14:00')
            .replace('{studio}', comp.studioName || comp.companyName || 'Studio Beauty');

        container.innerHTML = `
        <div style="max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:20px">

          <!-- Hero -->
          <div class="card" style="background:linear-gradient(135deg,#1a0820 0%,#2a1040 50%,#1a0820 100%);overflow:hidden;position:relative">
            <div style="position:absolute;top:-30px;right:-30px;font-size:120px;opacity:0.06;transform:rotate(-15deg)">🔔</div>
            <div class="card-body" style="padding:28px;position:relative;z-index:1">
              <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
                <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--primary),var(--gold));display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0">🔔</div>
                <div style="flex:1;min-width:200px">
                  <h2 style="font-size:1.2rem;font-weight:800;color:white;margin-bottom:4px">Notificações Push</h2>
                  <p style="font-size:0.82rem;color:rgba(255,255,255,.6)">Receba alertas diretamente no seu dispositivo — mesmo com o app minimizado</p>
                </div>
                ${statusBadges[browserState]}
              </div>
            </div>
          </div>

          <!-- Ativação / Status -->
          ${browserState !== 'granted' ? `
          <div class="card" style="border-left:4px solid ${browserState === 'denied' ? '#ef4444' : '#f59e0b'}">
            <div class="card-body" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
              <span style="font-size:2.5rem">${browserState === 'denied' ? '🚫' : '📱'}</span>
              <div style="flex:1;min-width:200px">
                <div style="font-weight:700;font-size:0.95rem;color:var(--text-primary)">
                  ${browserState === 'denied' ? 'Notificações bloqueadas pelo navegador' : 'Ativar Notificações Push'}
                </div>
                <div style="font-size:0.82rem;color:var(--text-muted);margin-top:4px;line-height:1.5">
                  ${browserState === 'denied'
                    ? 'Você bloqueou as notificações anteriormente. Para reativar, clique no 🔒 ao lado da URL do navegador → Permissões → Notificações → Permitir.'
                    : 'Permita notificações para receber alertas de aniversariantes, estoque baixo, agendamentos e avaliações no seu dispositivo.'}
                </div>
              </div>
              ${browserState !== 'denied' ? `
              <button class="btn btn-primary" onclick="PushNotifications.requestPermission().then(()=>App.currentPage=null,App.navigate('notifications-config'))">
                <span class="material-symbols-outlined">notifications</span> Ativar
              </button>` : ''}
            </div>
          </div>` : ''}

          <!-- Tipos de Notificação Push -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">📋 Tipos de Notificação</span>
              <span style="font-size:0.78rem;color:var(--text-muted)">Escolha quais alertas deseja receber</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:0">

              <!-- Master switch -->
              <div class="settings-toggle-item" style="padding:14px 0;border-bottom:2px solid var(--border)">
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-size:1.3rem">⚡</span>
                  <div>
                    <div style="font-weight:700;font-size:0.92rem">Master Switch</div>
                    <div style="font-size:0.78rem;color:var(--text-muted)">Desative para pausar todas as notificações push</div>
                  </div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-push" ${notif.push !== false ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>

              <!-- Aniversariantes -->
              <div class="settings-toggle-item" style="padding:14px 0">
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-size:1.3rem">🎂</span>
                  <div>
                    <div style="font-weight:600;font-size:0.9rem">Aniversariantes do Dia</div>
                    <div style="font-size:0.78rem;color:var(--text-muted)">Alerta pela manhã com as clientes aniversariantes</div>
                  </div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-push-birthday" ${notif.pushBirthday !== false ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>

              <!-- Estoque Baixo -->
              <div class="settings-toggle-item" style="padding:14px 0">
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-size:1.3rem">📦</span>
                  <div>
                    <div style="font-weight:600;font-size:0.9rem">Estoque Baixo</div>
                    <div style="font-size:0.78rem;color:var(--text-muted)">Alerta quando produtos atingem o nível mínimo</div>
                  </div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-push-stock" ${notif.pushStock !== false ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>

              <!-- Lembrete D-1 -->
              <div class="settings-toggle-item" style="padding:14px 0">
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-size:1.3rem">🔔</span>
                  <div>
                    <div style="font-weight:600;font-size:0.9rem">Lembrete D-1 (Amanhã)</div>
                    <div style="font-size:0.78rem;color:var(--text-muted)">Alerta à tarde com os agendamentos de amanhã</div>
                  </div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-push-reminder" ${notif.pushReminder !== false ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>

              <!-- Lembrete D-0 (Novo!) -->
              <div class="settings-toggle-item" style="padding:14px 0">
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-size:1.3rem">☀️</span>
                  <div>
                    <div style="font-weight:600;font-size:0.9rem">Lembrete D-0 (Hoje)
                      <span style="font-size:0.68rem;background:linear-gradient(135deg,var(--primary),var(--gold));color:#fff;padding:2px 8px;border-radius:8px;margin-left:6px;font-weight:700">NOVO</span>
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-muted)">Alerta pela manhã com os agendamentos do dia</div>
                  </div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-push-d0" ${notif.pushD0 !== false ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>

              <!-- Novo agendamento online (Novo!) -->
              <div class="settings-toggle-item" style="padding:14px 0">
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-size:1.3rem">📅</span>
                  <div>
                    <div style="font-weight:600;font-size:0.9rem">Novo Agendamento Online
                      <span style="font-size:0.68rem;background:linear-gradient(135deg,var(--primary),var(--gold));color:#fff;padding:2px 8px;border-radius:8px;margin-left:6px;font-weight:700">NOVO</span>
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-muted)">Alerta quando uma cliente agenda online</div>
                  </div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-push-booking" ${notif.pushBooking !== false ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>

              <!-- Nova avaliação NPS (Novo!) -->
              <div class="settings-toggle-item" style="padding:14px 0">
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-size:1.3rem">⭐</span>
                  <div>
                    <div style="font-weight:600;font-size:0.9rem">Nova Avaliação NPS
                      <span style="font-size:0.68rem;background:linear-gradient(135deg,var(--primary),var(--gold));color:#fff;padding:2px 8px;border-radius:8px;margin-left:6px;font-weight:700">NOVO</span>
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-muted)">Alerta quando uma cliente deixa uma avaliação</div>
                  </div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-push-review" ${notif.pushReview !== false ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>

            </div>
          </div>

          <!-- Teste de Push -->
          ${pushGranted ? `
          <div class="card" style="border:1px dashed var(--border)">
            <div class="card-body" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:1.3rem">🧪</span>
                <div>
                  <div style="font-weight:600;font-size:0.88rem">Testar Notificações</div>
                  <div style="font-size:0.78rem;color:var(--text-muted)">Envie uma notificação de teste para verificar se está funcionando</div>
                </div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="PushNotifications.sendTest()">
                <span class="material-symbols-outlined" style="font-size:16px">science</span> Enviar Teste
              </button>
            </div>
          </div>` : ''}

          <!-- Mensagem de Lembrete WhatsApp -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">💬 Mensagem de Lembrete (WhatsApp)</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:14px">
              <div class="form-group" style="margin:0">
                <label class="form-label" style="text-transform:uppercase;font-size:0.72rem;letter-spacing:0.8px">Mensagem de Saudação</label>
                <textarea class="form-control" id="notif-msg" rows="3" placeholder="Olá {nome}! Lembrando do seu agendamento de {serviço} no dia {data} às {hora}. Te esperamos! 💗" oninput="NotificationsConfig._updatePreview()">${reminderMsg}</textarea>
                <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px">
                  <span style="font-size:0.72rem;color:var(--text-muted);margin-right:4px">VARIÁVEIS:</span>
                  ${['{nome}','{serviço}','{data}','{hora}','{studio}'].map(v => `<span class="settings-var-badge" onclick="NotificationsConfig._insertVar('${v}')" style="cursor:pointer" title="Clique para inserir">${v}</span>`).join('')}
                </div>
              </div>

              <!-- Preview -->
              <div style="background:linear-gradient(135deg,#075e54,#128c7e);border-radius:12px;padding:14px 16px;position:relative">
                <div style="font-size:0.68rem;color:rgba(255,255,255,.6);margin-bottom:8px;font-weight:600">PREVIEW (como a cliente verá)</div>
                <div id="notif-preview" style="font-size:0.85rem;color:#fff;line-height:1.55;background:rgba(0,0,0,.15);padding:10px 14px;border-radius:8px;border-top-left-radius:0">
                  ${previewMsg}
                </div>
                <div style="text-align:right;font-size:0.65rem;color:rgba(255,255,255,.4);margin-top:4px">${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})} ✓✓</div>
              </div>

              <div class="settings-toggle-item" style="padding:10px 0 0">
                <div>
                  <div style="font-weight:600;font-size:0.88rem">E-mails de Lembrete</div>
                  <div style="font-size:0.78rem;color:var(--text-muted)">Lembretes automáticos por e-mail antes dos agendamentos</div>
                </div>
                <label class="settings-toggle-wrap">
                  <input type="checkbox" class="settings-toggle-cb" id="notif-email" ${notif.emailReminder !== false ? 'checked' : ''}>
                  <span class="settings-toggle-pill"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Botão Salvar -->
          <div style="display:flex;justify-content:flex-end;gap:10px">
            <button class="btn btn-primary" onclick="NotificationsConfig.save()" style="min-width:200px">
              <span class="material-symbols-outlined">save</span> Salvar Configurações
            </button>
          </div>
        </div>`;
    },

    _updatePreview() {
        const msg = document.getElementById('notif-msg')?.value || 'Olá {nome}! Lembrando do seu agendamento de {serviço} no dia {data} às {hora}. Te esperamos! 💗';
        const preview = msg
            .replace('{nome}', 'Maria')
            .replace('{serviço}', 'Extensão de Cílios')
            .replace('{data}', new Date().toLocaleDateString('pt-BR'))
            .replace('{hora}', '14:00')
            .replace('{studio}', 'Studio Beauty');
        const el = document.getElementById('notif-preview');
        if (el) el.textContent = preview;
    },

    _insertVar(v) {
        const ta = document.getElementById('notif-msg');
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        ta.value = ta.value.substring(0, start) + v + ta.value.substring(end);
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + v.length;
        NotificationsConfig._updatePreview();
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
            pushD0:         document.getElementById('notif-push-d0')?.checked !== false,
            pushBooking:    document.getElementById('notif-push-booking')?.checked !== false,
            pushReview:     document.getElementById('notif-push-review')?.checked !== false,
            reminderMsg:    document.getElementById('notif-msg')?.value.trim()
        };
        try {
            await db.collection('studios').doc(uid).set({ notifications }, { merge: true });
            App.showToast('Configurações de notificação salvas! 🔔', 'success');
        } catch(err) { App.showToast('Erro: ' + err.message, 'error'); }
    }
};
