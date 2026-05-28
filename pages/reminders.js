// === LEMBRETES DE RETOQUE/MANUTENÇÃO ===
const Reminders = {
    currentClients: [],

    async render(container) {
        Reminders.currentClients = await Store.getClients();
        const reminders = await Store.getReminders();
        const fichas = await Store.getFichasTecnicas();

        // Gera lembretes automáticos a partir de fichas técnicas com retoque pendente
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const autoReminders = fichas
            .filter(f => f.nextRetouchDate && new Date(f.nextRetouchDate) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000))
            .map(f => {
                const client = Reminders.currentClients.find(c => c.id === f.clientId);
                const retouchDate = new Date(f.nextRetouchDate);
                const isPast = retouchDate < today;
                const isToday = retouchDate.toDateString() === today.toDateString();
                return {
                    id: `ficha_${f.id}`,
                    fichaId: f.id,
                    clientId: f.clientId,
                    clientName: client?.name || 'Cliente',
                    clientPhone: client?.phone || '',
                    procedure: f.type || 'Procedimento',
                    dueDate: f.nextRetouchDate,
                    status: isPast ? 'overdue' : isToday ? 'today' : 'upcoming',
                    source: 'ficha',
                    auto: true
                };
            });

        // Combina lembretes manuais + automáticos
        const manualReminders = reminders.map(r => ({
            ...r,
            clientName: Reminders.currentClients.find(c => c.id === r.clientId)?.name || r.clientName || 'Cliente',
            clientPhone: Reminders.currentClients.find(c => c.id === r.clientId)?.phone || '',
            source: 'manual',
            auto: false,
            status: r.dismissed ? 'dismissed' : (new Date(r.dueDate) < today ? 'overdue' : 'upcoming')
        }));

        const allReminders = [...autoReminders, ...manualReminders]
            .filter(r => r.status !== 'dismissed')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        const overdue = allReminders.filter(r => r.status === 'overdue');
        const todayItems = allReminders.filter(r => r.status === 'today');
        const upcoming = allReminders.filter(r => r.status === 'upcoming');

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Header -->
          <div class="card" style="background:linear-gradient(135deg,var(--gold-light) 0%,#fffaf0 100%);border-color:var(--gold)">
            <div class="card-body" style="display:flex;align-items:center;gap:16px">
              <div style="font-size:36px">🔔</div>
              <div style="flex:1">
                <h3 style="font-weight:700;color:var(--gold-dark);margin-bottom:4px">Lembretes de Retoque & Manutenção</h3>
                <p style="font-size:0.85rem;color:var(--text-secondary)">Acompanhe retoques pendentes e envie lembretes por WhatsApp para suas clientes.</p>
              </div>
              <button class="btn btn-primary" onclick="Reminders.openModal()">
                <span class="material-symbols-outlined">add_alert</span> Novo Lembrete
              </button>
            </div>
          </div>

          <!-- KPIs -->
          <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
            <div class="kpi-card" style="background:rgba(220,53,69,0.05);border-color:rgba(220,53,69,0.2)">
              <div class="kpi-icon"><span class="material-symbols-outlined" style="color:#dc3545">warning</span></div>
              <div class="kpi-value" style="color:#dc3545">${overdue.length}</div>
              <div class="kpi-label">Atrasados</div>
            </div>
            <div class="kpi-card gold">
              <div class="kpi-icon"><span class="material-symbols-outlined">today</span></div>
              <div class="kpi-value">${todayItems.length}</div>
              <div class="kpi-label">Para Hoje</div>
            </div>
            <div class="kpi-card green">
              <div class="kpi-icon"><span class="material-symbols-outlined">upcoming</span></div>
              <div class="kpi-value">${upcoming.length}</div>
              <div class="kpi-label">Próximos 7 Dias</div>
            </div>
          </div>

          <!-- Atrasados -->
          ${overdue.length > 0 ? `
          <div>
            <div style="font-weight:700;color:#dc3545;margin-bottom:10px;display:flex;align-items:center;gap:6px">
              <span class="material-symbols-outlined" style="font-size:20px">error</span> Retoques Atrasados (${overdue.length})
            </div>
            ${overdue.map(r => Reminders.reminderCard(r)).join('')}
          </div>` : ''}

          <!-- Hoje -->
          ${todayItems.length > 0 ? `
          <div>
            <div style="font-weight:700;color:var(--gold-dark);margin-bottom:10px;display:flex;align-items:center;gap:6px">
              <span class="material-symbols-outlined" style="font-size:20px">schedule</span> Para Hoje (${todayItems.length})
            </div>
            ${todayItems.map(r => Reminders.reminderCard(r)).join('')}
          </div>` : ''}

          <!-- Próximos -->
          ${upcoming.length > 0 ? `
          <div>
            <div style="font-weight:700;color:var(--text-secondary);margin-bottom:10px;display:flex;align-items:center;gap:6px">
              <span class="material-symbols-outlined" style="font-size:20px">event_upcoming</span> Próximos Dias (${upcoming.length})
            </div>
            ${upcoming.map(r => Reminders.reminderCard(r)).join('')}
          </div>` : ''}

          ${allReminders.length === 0 ? `
          <div class="empty-state">
            <span class="material-symbols-outlined empty-state-icon">notifications_active</span>
            <p class="empty-state-title">Nenhum lembrete pendente</p>
            <p class="empty-state-desc">Quando suas clientes tiverem retoques agendados, eles aparecerão aqui automaticamente.</p>
          </div>` : ''}
        </div>

        <!-- Modal de novo lembrete -->
        <div id="reminder-modal" class="modal-overlay hidden" onclick="Reminders.closeModal(event)">
          <div class="modal-container" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">🔔 Novo Lembrete</h3>
              <button class="modal-close" onclick="Reminders.closeModal()">✕</button>
            </div>
            <form id="reminder-form" onsubmit="Reminders.handleSave(event)" class="modal-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Cliente *</label>
                  <select class="form-control" id="rem-client" required>
                    <option value="">-- Selecione --</option>
                    ${Reminders.currentClients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Data do Lembrete *</label>
                  <input class="form-control" type="date" id="rem-date" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Tipo</label>
                  <select class="form-control" id="rem-type">
                    <option>Retoque de Extensão</option>
                    <option>Manutenção de Lifting</option>
                    <option>Retoque de Micropigmentação</option>
                    <option>Retorno de Brow Lamination</option>
                    <option>Retoque de Henna</option>
                    <option>Retorno Geral</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">Observações</label>
                  <textarea class="form-control" id="rem-notes" rows="2" placeholder="Notas adicionais..."></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-ghost" onclick="Reminders.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  <span class="material-symbols-outlined">save</span> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>`;
    },

    reminderCard(r) {
        const dueDate = new Date(r.dueDate);
        const dateStr = dueDate.toLocaleDateString('pt-BR');
        const borderColor = r.status === 'overdue' ? '#dc3545' : r.status === 'today' ? 'var(--gold)' : 'var(--border)';
        const bgColor = r.status === 'overdue' ? 'rgba(220,53,69,0.03)' : r.status === 'today' ? 'rgba(196,163,88,0.05)' : 'white';

        const phone = (r.clientPhone || '').replace(/\D/g, '');
        const whatsappMsg = encodeURIComponent(
            `Olá ${r.clientName}! 💕\n\n` +
            `Passando para lembrar que seu retoque de *${r.procedure}* está ${r.status === 'overdue' ? 'pendente desde' : 'agendado para'} *${dateStr}*.\n\n` +
            `Posso confirmar o horário para você? 😊\n\n` +
            `✨ LashBrow`
        );

        return `
        <div class="card" style="border-left:4px solid ${borderColor};background:${bgColor};margin-bottom:8px">
          <div class="card-body" style="display:flex;align-items:center;gap:16px;padding:14px 18px">
            <div style="flex:1">
              <div style="font-weight:700;color:var(--text-primary)">${r.clientName}</div>
              <div style="font-size:0.83rem;color:var(--text-secondary)">${r.procedure} · ${dateStr}</div>
              ${r.auto ? '<span style="font-size:0.7rem;background:var(--primary-xlight);color:var(--primary);padding:2px 8px;border-radius:10px">Auto (Ficha Técnica)</span>' : ''}
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0">
              ${phone ? `
              <a href="https://wa.me/55${phone}?text=${whatsappMsg}" target="_blank" class="btn btn-primary btn-sm" title="Enviar Lembrete WhatsApp" style="background:#25D366;border-color:#25D366">
                <span class="material-symbols-outlined" style="font-size:16px">chat</span> WhatsApp
              </a>` : ''}
              ${!r.auto ? `
              <button class="btn btn-ghost btn-sm" onclick="Reminders.dismiss('${r.id}')" title="Dispensar" style="color:var(--text-muted)">
                <span class="material-symbols-outlined" style="font-size:16px">check</span>
              </button>
              <button class="btn btn-ghost btn-sm" onclick="Reminders.deleteItem('${r.id}')" title="Excluir" style="color:var(--danger)">
                <span class="material-symbols-outlined" style="font-size:16px">delete</span>
              </button>` : ''}
            </div>
          </div>
        </div>`;
    },

    openModal() {
        document.getElementById('reminder-modal')?.classList.remove('hidden');
    },
    closeModal(event) {
        if (event && event.target !== document.getElementById('reminder-modal')) return;
        document.getElementById('reminder-modal')?.classList.add('hidden');
    },

    async handleSave(e) {
        e.preventDefault();
        const data = {
            clientId:    document.getElementById('rem-client').value,
            clientName:  Reminders.currentClients.find(c => c.id === document.getElementById('rem-client').value)?.name || '',
            dueDate:     document.getElementById('rem-date').value,
            type:        document.getElementById('rem-type').value,
            notes:       document.getElementById('rem-notes').value.trim()
        };
        try {
            await Store.addReminder(data);
            document.getElementById('reminder-modal').classList.add('hidden');
            App.showToast('Lembrete criado!', 'success');
            await Reminders.render(document.getElementById('page-content'));
        } catch (err) {
            App.showToast('Erro: ' + err.message, 'error');
        }
    },

    async dismiss(id) {
        await Store.updateReminder(id, { dismissed: true });
        App.showToast('Lembrete dispensado.', 'success');
        await Reminders.render(document.getElementById('page-content'));
    },

    async deleteItem(id) {
        if (!confirm('Excluir este lembrete?')) return;
        await Store.deleteReminder(id);
        App.showToast('Removido.', 'success');
        await Reminders.render(document.getElementById('page-content'));
    },

    // Usado pelo Dashboard para mostrar alertas de retoque
    async getDashboardAlerts() {
        const fichas = await Store.getFichasTecnicas();
        const clients = await Store.getClients();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return fichas
            .filter(f => f.nextRetouchDate && new Date(f.nextRetouchDate) <= today)
            .map(f => {
                const client = clients.find(c => c.id === f.clientId);
                return {
                    clientName: client?.name || 'Cliente',
                    procedure: f.type || 'Procedimento',
                    dueDate: f.nextRetouchDate,
                    clientPhone: client?.phone || ''
                };
            });
    }
};
