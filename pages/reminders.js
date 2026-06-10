// === LEMBRETES DE RETOQUE/MANUTENÇÃO ===
const Reminders = {
    currentClients: [],
    _editingId: null,
    _allReminders: [],

    async render(container) {
        container.innerHTML = `<div style="display:flex;justify-content:center;padding:48px"><div class="spinner"></div></div>`;

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

        // Combina lembretes manuais + automáticos — CORRIGIDO: agora detecta "today"
        const manualReminders = reminders.map(r => {
            const dueDate = new Date(r.dueDate);
            const isPast = dueDate < today;
            const isToday = dueDate.toDateString() === today.toDateString();
            return {
                ...r,
                clientName: Reminders.currentClients.find(c => c.id === r.clientId)?.name || r.clientName || 'Cliente',
                clientPhone: Reminders.currentClients.find(c => c.id === r.clientId)?.phone || '',
                source: 'manual',
                auto: false,
                status: r.dismissed ? 'dismissed' : isPast ? 'overdue' : isToday ? 'today' : 'upcoming'
            };
        });

        const allReminders = [...autoReminders, ...manualReminders]
            .filter(r => r.status !== 'dismissed')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        Reminders._allReminders = allReminders;

        const overdue = allReminders.filter(r => r.status === 'overdue');
        const todayItems = allReminders.filter(r => r.status === 'today');
        const upcoming = allReminders.filter(r => r.status === 'upcoming');

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Header -->
          <div class="card" style="background:linear-gradient(135deg,var(--gold-light) 0%,#fffaf0 100%);border-color:var(--gold)">
            <div class="card-body" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
              <div style="font-size:36px">🔔</div>
              <div style="flex:1;min-width:200px">
                <h3 style="font-weight:700;color:var(--gold-dark);margin-bottom:4px">Lembretes de Retoque & Manutenção</h3>
                <p style="font-size:0.85rem;color:var(--text-secondary)">Acompanhe retoques pendentes e envie lembretes por WhatsApp para suas clientes.</p>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-sm" onclick="Reminders._sendBatch()" style="background:rgba(37,211,102,0.12);color:#25d366;border:1px solid rgba(37,211,102,0.3);display:inline-flex;align-items:center;gap:4px">
                  <span class="material-symbols-outlined" style="font-size:16px">send</span> Enviar Lote
                </button>
                <button class="btn btn-primary" onclick="Reminders.openModal()">
                  <span class="material-symbols-outlined">add_alert</span> Novo Lembrete
                </button>
              </div>
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

          <!-- Filtros -->
          <div class="card" style="padding:12px 16px">
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
              <span class="material-symbols-outlined" style="font-size:18px;color:var(--text-muted)">filter_alt</span>
              <select class="form-control" id="rem-filter-type" onchange="Reminders._applyFilters()" style="width:180px;font-size:0.82rem">
                <option value="">Todos os tipos</option>
                <option>Retoque de Extensão</option>
                <option>Manutenção de Lifting</option>
                <option>Retoque de Micropigmentação</option>
                <option>Retorno de Brow Lamination</option>
                <option>Retoque de Henna</option>
                <option>Retorno Geral</option>
                <option>Outro</option>
              </select>
              <select class="form-control" id="rem-filter-status" onchange="Reminders._applyFilters()" style="width:130px;font-size:0.82rem">
                <option value="">Todos status</option>
                <option value="overdue">Atrasados</option>
                <option value="today">Para Hoje</option>
                <option value="upcoming">Próximos</option>
              </select>
              <input class="form-control" id="rem-search" placeholder="Buscar cliente..." oninput="Reminders._applyFilters()" style="width:180px;font-size:0.82rem" />
            </div>
          </div>

          <!-- Lista de lembretes -->
          <div id="rem-list">
            ${Reminders._renderSections(overdue, todayItems, upcoming, allReminders)}
          </div>
        </div>

        <!-- Modal de lembrete (novo/editar) -->
        <div id="reminder-modal" class="modal-overlay hidden" onclick="Reminders.closeModal(event)">
          <div class="modal-container" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title" id="rem-modal-title">🔔 Novo Lembrete</h3>
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
                <button type="submit" class="btn btn-primary" id="rem-save-btn">
                  <span class="material-symbols-outlined">save</span> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>`;
    },

    // === RENDERIZAR SEÇÕES ===
    _renderSections(overdue, todayItems, upcoming, all) {
        if (all.length === 0) {
            return `<div class="empty-state">
              <span class="material-symbols-outlined empty-state-icon">notifications_active</span>
              <p class="empty-state-title">Nenhum lembrete pendente</p>
              <p class="empty-state-desc">Quando suas clientes tiverem retoques agendados, eles aparecerão aqui automaticamente.</p>
            </div>`;
        }

        let html = '';

        if (overdue.length > 0) {
            html += `<div style="margin-bottom:16px">
              <div style="font-weight:700;color:#dc3545;margin-bottom:10px;display:flex;align-items:center;gap:6px">
                <span class="material-symbols-outlined" style="font-size:20px">error</span> Retoques Atrasados (${overdue.length})
              </div>
              ${overdue.map(r => Reminders.reminderCard(r)).join('')}
            </div>`;
        }

        if (todayItems.length > 0) {
            html += `<div style="margin-bottom:16px">
              <div style="font-weight:700;color:var(--gold-dark);margin-bottom:10px;display:flex;align-items:center;gap:6px">
                <span class="material-symbols-outlined" style="font-size:20px">schedule</span> Para Hoje (${todayItems.length})
              </div>
              ${todayItems.map(r => Reminders.reminderCard(r)).join('')}
            </div>`;
        }

        if (upcoming.length > 0) {
            html += `<div style="margin-bottom:16px">
              <div style="font-weight:700;color:var(--text-secondary);margin-bottom:10px;display:flex;align-items:center;gap:6px">
                <span class="material-symbols-outlined" style="font-size:20px">event_upcoming</span> Próximos Dias (${upcoming.length})
              </div>
              ${upcoming.map(r => Reminders.reminderCard(r)).join('')}
            </div>`;
        }

        return html;
    },

    // === CARD DE LEMBRETE ===
    reminderCard(r) {
        const dueDate = new Date(r.dueDate);
        const dateStr = dueDate.toLocaleDateString('pt-BR');
        const borderColor = r.status === 'overdue' ? '#dc3545' : r.status === 'today' ? 'var(--gold)' : 'var(--border)';
        const bgColor = r.status === 'overdue' ? 'rgba(220,53,69,0.03)' : r.status === 'today' ? 'rgba(196,163,88,0.05)' : 'var(--bg-card)';

        const phone = typeof WA !== 'undefined' && WA._formatPhone ? WA._formatPhone(r.clientPhone || '') : (r.clientPhone || '').replace(/\D/g, '');
        const whatsappMsg = encodeURIComponent(
            `Olá ${r.clientName}! 💕\n\n` +
            `Passando para lembrar que seu retoque de *${r.procedure || r.type || 'procedimento'}* está ${r.status === 'overdue' ? 'pendente desde' : 'agendado para'} *${dateStr}*.\n\n` +
            `Posso confirmar o horário para você? 😊\n\n` +
            `✨ Studio Beauty`
        );

        // Verificar se já foi enviado
        const sentBadge = r.whatsappSent
            ? '<span style="font-size:0.68rem;background:rgba(37,211,102,0.12);color:#25d366;padding:2px 8px;border-radius:10px;margin-left:4px">✓ Enviado</span>'
            : '';

        return `
        <div class="card" style="border-left:4px solid ${borderColor};background:${bgColor};margin-bottom:8px" data-name="${(r.clientName || '').toLowerCase()}" data-type="${r.procedure || r.type || ''}" data-status="${r.status}">
          <div class="card-body" style="display:flex;align-items:center;gap:16px;padding:14px 18px;flex-wrap:wrap">
            <div style="flex:1;min-width:180px">
              <div style="font-weight:700;color:var(--text-primary)">${r.clientName} ${sentBadge}</div>
              <div style="font-size:0.83rem;color:var(--text-secondary)">${r.procedure || r.type || 'Procedimento'} · ${dateStr}</div>
              ${r.notes ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;font-style:italic">${r.notes}</div>` : ''}
              <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
                ${r.auto ? '<span style="font-size:0.7rem;background:var(--primary-xlight);color:var(--primary);padding:2px 8px;border-radius:10px">Auto (Ficha Técnica)</span>' : ''}
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap">
              ${phone ? `
              <button class="btn btn-sm" onclick="Reminders._sendWhatsApp('${r.id}','${phone}','${whatsappMsg}')" title="Enviar WhatsApp" style="background:#25D366;border-color:#25D366;color:white;display:inline-flex;align-items:center;gap:4px">
                <span class="material-symbols-outlined" style="font-size:16px">chat</span> WhatsApp
              </button>` : ''}
              ${!r.auto ? `
              <button class="btn btn-ghost btn-sm" onclick="Reminders.openModal('${r.id}')" title="Editar" style="color:var(--primary)">
                <span class="material-symbols-outlined" style="font-size:16px">edit</span>
              </button>
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

    // === FILTROS ===
    _applyFilters() {
        const type = document.getElementById('rem-filter-type')?.value || '';
        const status = document.getElementById('rem-filter-status')?.value || '';
        const search = (document.getElementById('rem-search')?.value || '').toLowerCase();

        let filtered = [...Reminders._allReminders];

        if (type) filtered = filtered.filter(r => (r.procedure || r.type || '') === type);
        if (status) filtered = filtered.filter(r => r.status === status);
        if (search) filtered = filtered.filter(r => (r.clientName || '').toLowerCase().includes(search));

        const overdue = filtered.filter(r => r.status === 'overdue');
        const todayItems = filtered.filter(r => r.status === 'today');
        const upcoming = filtered.filter(r => r.status === 'upcoming');

        const listEl = document.getElementById('rem-list');
        if (listEl) listEl.innerHTML = Reminders._renderSections(overdue, todayItems, upcoming, filtered);
    },

    // === MODAL ABRIR/FECHAR ===
    openModal(id = null) {
        Reminders._editingId = id;
        const form = document.getElementById('reminder-form');
        const title = document.getElementById('rem-modal-title');
        if (form) form.reset();
        if (title) title.textContent = id ? '✏️ Editar Lembrete' : '🔔 Novo Lembrete';

        if (id) {
            // Buscar dados do lembrete para edição
            const reminders = Reminders._allReminders;
            const r = reminders.find(rem => rem.id === id);
            if (r) {
                const clientEl = document.getElementById('rem-client');
                const dateEl = document.getElementById('rem-date');
                const typeEl = document.getElementById('rem-type');
                const notesEl = document.getElementById('rem-notes');
                if (clientEl) clientEl.value = r.clientId || '';
                if (dateEl) dateEl.value = r.dueDate || '';
                if (typeEl) typeEl.value = r.procedure || r.type || 'Retoque de Extensão';
                if (notesEl) notesEl.value = r.notes || '';
            }
        }

        document.getElementById('reminder-modal')?.classList.remove('hidden');
    },

    closeModal(event) {
        if (event && event.target !== document.getElementById('reminder-modal')) return;
        document.getElementById('reminder-modal')?.classList.add('hidden');
        Reminders._editingId = null;
    },

    // === SALVAR (CRIAR/EDITAR) ===
    async handleSave(e) {
        e.preventDefault();
        const btn = document.getElementById('rem-save-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div>'; }

        const data = {
            clientId:    document.getElementById('rem-client').value,
            clientName:  Reminders.currentClients.find(c => c.id === document.getElementById('rem-client').value)?.name || '',
            dueDate:     document.getElementById('rem-date').value,
            type:        document.getElementById('rem-type').value,
            notes:       document.getElementById('rem-notes').value.trim()
        };

        try {
            if (Reminders._editingId) {
                await Store.updateReminder(Reminders._editingId, data);
                App.showToast('Lembrete atualizado!', 'success');
            } else {
                await Store.addReminder(data);
                App.showToast('Lembrete criado!', 'success');
            }
            document.getElementById('reminder-modal').classList.add('hidden');
            Reminders._editingId = null;
            await Reminders.render(document.getElementById('page-content'));
        } catch (err) {
            App.showToast('Erro: ' + err.message, 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-symbols-outlined">save</span> Salvar'; }
        }
    },

    // === DISPENSAR COM TRY/CATCH ===
    async dismiss(id) {
        try {
            await Store.updateReminder(id, { dismissed: true });
            App.showToast('Lembrete dispensado.', 'success');
            await Reminders.render(document.getElementById('page-content'));
        } catch (err) {
            App.showToast('Erro ao dispensar: ' + err.message, 'error');
        }
    },

    // === EXCLUIR COM TRY/CATCH ===
    async deleteItem(id) {
        if (!confirm('Excluir este lembrete?')) return;
        try {
            await Store.deleteReminder(id);
            App.showToast('Removido.', 'success');
            await Reminders.render(document.getElementById('page-content'));
        } catch (err) {
            App.showToast('Erro ao excluir: ' + err.message, 'error');
        }
    },

    // === WHATSAPP COM TRACKING ===
    async _sendWhatsApp(id, phone, msg) {
        // Abrir WhatsApp
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
        // Marcar como enviado (só para manuais)
        if (id && !id.startsWith('ficha_')) {
            try {
                await Store.updateReminder(id, { whatsappSent: true, whatsappSentAt: new Date().toISOString() });
                // Atualizar visualmente o badge
                const card = document.querySelector(`[data-name]`);
                if (card) {
                    await Reminders.render(document.getElementById('page-content'));
                }
            } catch(e) { console.warn('Erro ao marcar como enviado:', e); }
        }
    },

    // === ENVIO EM LOTE ===
    async _sendBatch() {
        const atrasados = Reminders._allReminders.filter(r => r.status === 'overdue' || r.status === 'today');
        const comTelefone = atrasados.filter(r => {
            const phone = (r.clientPhone || '').replace(/\D/g, '');
            return phone.length >= 10;
        });

        if (comTelefone.length === 0) {
            App.showToast('Nenhum lembrete atrasado/hoje com telefone.', 'warning');
            return;
        }

        if (!confirm(`Enviar WhatsApp para ${comTelefone.length} cliente${comTelefone.length !== 1 ? 's' : ''} com lembretes atrasados/hoje?\n\nSerão abertos ${comTelefone.length} janela(s) do WhatsApp.`)) return;

        for (let i = 0; i < comTelefone.length; i++) {
            const r = comTelefone[i];
            const phone = typeof WA !== 'undefined' && WA._formatPhone ? WA._formatPhone(r.clientPhone) : (r.clientPhone || '').replace(/\D/g, '');
            const dateStr = new Date(r.dueDate).toLocaleDateString('pt-BR');
            const msg = encodeURIComponent(
                `Olá ${r.clientName}! 💕\n\n` +
                `Passando para lembrar que seu retoque de *${r.procedure || r.type || 'procedimento'}* está ${r.status === 'overdue' ? 'pendente desde' : 'agendado para'} *${dateStr}*.\n\n` +
                `Posso confirmar o horário para você? 😊\n\n` +
                `✨ Studio Beauty`
            );
            window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');

            // Marcar como enviado
            if (r.id && !r.id.startsWith('ficha_')) {
                try { await Store.updateReminder(r.id, { whatsappSent: true, whatsappSentAt: new Date().toISOString() }); } catch(e) {}
            }

            // Delay entre cada abertura para não sobrecarregar
            if (i < comTelefone.length - 1) {
                await new Promise(res => setTimeout(res, 800));
            }
        }

        App.showToast(`${comTelefone.length} WhatsApp(s) enviado(s)!`, 'success');
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
