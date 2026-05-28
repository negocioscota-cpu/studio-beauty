// === AGENDA ===
const Schedule = {
    editingId: null,
    currentClients: [],

    async render(container) {
        Schedule.currentClients = await Store.getClients();
        const today = new Date().toISOString().split('T')[0];

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <div class="toolbar">
            <div style="display:flex;align-items:center;gap:12px">
              <input class="form-control" type="date" id="schedule-date" value="${today}" onchange="Schedule.loadAppointments()" style="width:180px" />
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('schedule-date').value='${today}';Schedule.loadAppointments()">Hoje</button>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="btn-export-excel" onclick="Schedule.exportExcel()">
                <span class="material-symbols-outlined" style="font-size:18px">download</span> Exportar Dia
              </button>
              <button class="btn btn-primary" onclick="Schedule.openModal()">
                <span class="material-symbols-outlined">event_available</span> Novo Agendamento
              </button>
            </div>
          </div>
          <div id="schedule-list" class="appointments-list"></div>
        </div>

        <!-- Painel D-1 (lembrete de amanhã) -->
        <div id="reminder-panel"></div>

        <!-- Modal -->
        <div id="schedule-modal" class="modal-overlay hidden" onclick="Schedule.closeModal(event)">
          <div class="modal-container" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title" id="schedule-modal-title">Novo Agendamento</h3>
              <button class="modal-close" onclick="Schedule.closeModal()">✕</button>
            </div>
            <form id="schedule-form" onsubmit="Schedule.handleSave(event)" class="modal-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Cliente *</label>
                  <select class="form-control" id="appt-client" required>
                    <option value="">-- Selecione --</option>
                    ${Schedule.currentClients.map(c => `<option value="${c.id}" data-phone="${c.phone || ''}">${c.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Data *</label>
                  <input class="form-control" type="date" id="appt-date" required value="${today}" />
                </div>
                <div class="form-group">
                  <label class="form-label">Horário *</label>
                  <input class="form-control" type="time" id="appt-time" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Procedimento</label>
                  <select class="form-control" id="appt-procedure">
                    <option value="">-- Selecione --</option>
                    <option>Extensão de Cílios — Volume Russo</option>
                    <option>Extensão de Cílios — Clássico</option>
                    <option>Lifting de Cílios</option>
                    <option>Manutenção de Extensão</option>
                    <option>Design de Sobrancelhas</option>
                    <option>Micropigmentação</option>
                    <option>Brow Lamination</option>
                    <option>Henna de Sobrancelhas</option>
                    <option>Remoção de Extensão</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Duração Estimada</label>
                  <select class="form-control" id="appt-duration">
                    <option>30 min</option><option>1 hora</option><option>1h30</option>
                    <option>2 horas</option><option>2h30</option><option>3 horas</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Valor (R$)</label>
                  <input class="form-control" type="number" id="appt-value" min="0" step="0.01" placeholder="0,00" />
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select class="form-control" id="appt-status">
                    <option value="scheduled">Agendado</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="done">Concluído</option>
                    <option value="canceled">Cancelado</option>
                  </select>
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">Observações</label>
                  <textarea class="form-control" id="appt-notes" rows="2"></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-ghost" onclick="Schedule.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  <span class="material-symbols-outlined">save</span> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>`;

        await Schedule.loadAppointments();
        await Schedule.loadReminders();
    },

    // === PAINEL D-1 ===
    async loadReminders() {
        const panel = document.getElementById('reminder-panel');
        if (!panel) return;
        const tomorrow = Schedule._tomorrow();
        const appts = await Store.getAppointments(tomorrow);
        const active = appts.filter(a => a.status !== 'canceled');
        if (!active.length) { panel.innerHTML = ''; return; }

        panel.innerHTML = `
          <div class="card reminder-panel">
            <div class="card-header">
              <span class="card-title">🔔 Lembretes para Amanhã <span class="badge badge-gold">${active.length}</span></span>
              <button class="btn btn-wa btn-sm" onclick="Schedule.sendAllReminders()">📲 Enviar todos</button>
            </div>
            <div class="card-body" style="padding:0">
              <div class="reminder-list">
                ${active.map(a => {
                    const c = Schedule.currentClients.find(x => x.id === a.clientId);
                    const phone = c?.phone || '';
                    const name = c?.name || a.clientName || 'Cliente';
                    return `<div class="reminder-item" data-phone="${phone}" data-name="${name}" data-procedure="${(a.procedure||'').replace(/"/g,'&quot;')}" data-time="${a.time||''}">
                      <div class="reminder-avatar">${name.charAt(0)}</div>
                      <div class="reminder-info">
                        <div class="reminder-name">${name}</div>
                        <div class="reminder-detail">${a.procedure || '—'} · ${a.time || ''}</div>
                      </div>
                      ${phone
                        ? `<button class="btn btn-wa btn-sm" onclick="WA.reminder('${name}','${phone}','${(a.procedure||'').replace(/'/g,"\\'")}'  ,'${a.time||''}')" title="Enviar lembrete">📲</button>`
                        : `<span style="font-size:0.75rem;color:var(--text-muted)">Sem telefone</span>`
                      }
                    </div>`;
                }).join('')}
              </div>
            </div>
          </div>`;

        // Guarda dados para envio em lote
        Schedule._remindersData = active.map(a => {
            const c = Schedule.currentClients.find(x => x.id === a.clientId);
            return { name: c?.name || a.clientName || 'Cliente', phone: c?.phone || '', procedure: a.procedure || '', time: a.time || '' };
        });
    },

    sendAllReminders() {
        const data = Schedule._remindersData || [];
        const withPhone = data.filter(d => d.phone);
        if (!withPhone.length) { App.showToast('Nenhuma cliente com telefone cadastrado.', 'error'); return; }
        let delay = 0;
        withPhone.forEach(d => {
            setTimeout(() => WA.reminder(d.name, d.phone, d.procedure, d.time), delay);
            delay += 800; // Pequeno delay para não bloquear o navegador
        });
        App.showToast(`📲 ${withPhone.length} lembretes abertos!`, 'success');
    },

    _tomorrow() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    },
    _remindersData: [],

    async loadAppointments() {
        const date = document.getElementById('schedule-date').value;
        const list = document.getElementById('schedule-list');
        list.innerHTML = '<div style="text-align:center;padding:32px"><div class="spinner"></div></div>';
        const appts = await Store.getAppointments(date);
        if (!appts.length) {
            list.innerHTML = `<div class="empty-state">
                <span class="material-symbols-outlined empty-state-icon">calendar_today</span>
                <p class="empty-state-title">Nenhum agendamento neste dia</p>
                <button class="btn btn-primary" onclick="Schedule.openModal()">Agendar agora</button>
            </div>`;
            return;
        }
        const sorted = appts.sort((a,b) => (a.time||'').localeCompare(b.time||''));
        const loyaltyConfig = await Store.getLoyaltyConfig().catch(() => null);

        list.innerHTML = sorted.map(a => {
            const client = Schedule.currentClients.find(c => c.id === a.clientId);
            const clientName = client?.name || 'Cliente';
            const clientPhone = client?.phone || '';
            const isDone = a.status === 'done';
            const isCanceled = a.status === 'canceled';

            const statusBadge = {
                scheduled: '<span class="badge badge-gold">📅 Agendado</span>',
                confirmed:  '<span class="badge badge-blue">✓ Confirmado</span>',
                done:       '<span class="badge badge-green">✅ Concluído</span>',
                canceled:   '<span class="badge badge-brown">✗ Cancelado</span>'
            }[a.status] || a.status;

            // Formata data para exibição no WA
            const dt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateDisplay = isNaN(dt) ? '' : dt.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' });

            // Link de avaliação (inclui name e phone para vínculo no Firestore)
            const nameEnc  = encodeURIComponent(clientName);
            const phoneEnc = encodeURIComponent(clientPhone);
            const reviewUrl = `${location.origin}/avaliacao.html?studio=${Store._uid()}&appt=${a.id}&name=${nameEnc}&phone=${phoneEnc}`;

            return `<div class="appointment-card ${isDone ? 'appt-done' : ''} ${isCanceled ? 'appt-canceled' : ''}">
              <div class="appt-time">${a.time || '--:--'}</div>
              <div class="appt-info">
                <div class="appt-name">${clientName}</div>
                <div class="appt-procedure">${a.procedure || '-'} · ${a.duration || ''}</div>
                ${a.notes ? `<div class="appt-notes">${a.notes}</div>` : ''}
              </div>
              <div class="appt-right">
                <div style="font-weight:700;color:var(--primary)">${a.value ? App.formatCurrency(Number(a.value)) : ''}</div>
                ${statusBadge}
                <div class="appt-actions">
                  <!-- Editar -->
                  <button class="btn btn-ghost btn-sm" onclick="Schedule.openModal('${a.id}')" title="Editar">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <!-- WhatsApp Confirmação -->
                  ${!isCanceled ? `<button class="btn btn-wa btn-sm" title="Enviar confirmação por WhatsApp"
                    onclick="WA.confirmation('${clientName}','${clientPhone}','${(a.procedure||'').replace(/'/g,"\\'")}'  ,'${dateDisplay}','${a.time||''}')">
                    <span style="font-size:15px">📲</span>
                  </button>` : ''}
                  <!-- Lembrete D-1 -->
                  ${!isCanceled && !isDone ? `<button class="btn btn-reminder btn-sm" title="Enviar lembrete D-1"
                    onclick="WA.reminder('${clientName}','${clientPhone}','${(a.procedure||'').replace(/'/g,"\\'")}'  ,'${a.time||''}')">
                    <span class="material-symbols-outlined" style="font-size:15px">notifications</span>
                  </button>` : ''}
                  <!-- Avaliação (só concluídos) -->
                  ${isDone ? `<button class="btn btn-review btn-sm" title="Enviar link de avaliação"
                    onclick="Schedule.sendReviewLink('${clientName}','${clientPhone}','${reviewUrl}')">
                    <span class="material-symbols-outlined" style="font-size:15px">star</span>
                  </button>` : ''}
                  <!-- Concluir rápido -->
                  ${a.status === 'scheduled' || a.status === 'confirmed' ? `<button class="btn btn-ghost btn-sm" title="Marcar como concluído"
                    onclick="Schedule.markDone('${a.id}','${a.clientId}','${clientName}','${clientPhone}','${(a.procedure||'').replace(/'/g,"\\'")}','${reviewUrl}',${loyaltyConfig ? loyaltyConfig.threshold : 0},'${loyaltyConfig ? loyaltyConfig.reward : ''}')">
                    <span class="material-symbols-outlined" style="font-size:15px">check_circle</span>
                  </button>` : ''}
                  <!-- Excluir -->
                  <button class="btn btn-ghost btn-sm" onclick="Schedule.delete('${a.id}')" style="color:var(--danger)" title="Excluir">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>`;
        }).join('');
    },

    // Enviar link de avaliação por WhatsApp
    sendReviewLink(clientName, phone, reviewUrl) {
        WA.reviewRequest(clientName, phone, reviewUrl);
    },

    // Marcar como concluído + verificar fidelidade
    async markDone(apptId, clientId, clientName, clientPhone, procedure, reviewUrl, loyaltyThreshold, loyaltyReward) {
        // 1. Pede baixa de estoque antes de confirmar
        try {
            await new Promise(resolve => {
                Inventory.buildUsageModal(apptId, async (usedItems) => {
                    // Dá baixa em cada item selecionado
                    for (const item of usedItems) {
                        const newQty = Math.max(0, item.currentQty - item.qty);
                        try { await Store.updateInventoryItem(item.id, { qty: newQty }); } catch(e) { console.warn(e); }
                    }
                    resolve();
                });
            });
        } catch(e) { /* ignora — segue sem baixa de estoque */ }

        // 2. Marca como concluído
        try {
            await Store.updateAppointment(apptId, { status: 'done' });
            App.showToast('✅ Atendimento concluído!', 'success');

            // Verificar milestone de fidelidade
            if (loyaltyThreshold > 0 && clientId) {
                const milestone = await Store.checkLoyaltyMilestone(clientId, loyaltyThreshold);
                if (milestone.reached) {
                    Schedule._showLoyaltyToast(clientName, clientPhone, loyaltyReward, milestone.totalVisits);
                }
            }

            await Schedule.loadAppointments();
        } catch(err) {
            App.showToast('Erro: ' + err.message, 'error');
        }
    },

    _showLoyaltyToast(clientName, phone, reward, visitCount) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const id = 'loyalty-' + Date.now();
        const el = document.createElement('div');
        el.id = id;
        el.className = 'toast toast-loyalty';
        el.innerHTML = `
          <div style="font-size:1.5rem">🎉</div>
          <div style="flex:1">
            <div style="font-weight:800;font-size:0.95rem;color:var(--gold)">Marco de Fidelidade!</div>
            <div style="font-size:0.82rem;margin-top:2px"><strong>${clientName}</strong> atingiu <strong>${visitCount} atendimentos</strong> e ganhou: <em>${reward}</em></div>
            <div style="display:flex;gap:8px;margin-top:10px">
              <button class="btn btn-wa btn-sm" onclick="WA.loyaltyReward('${clientName}','${phone}','${reward}','${visitCount}')">
                📲 Avisar no WhatsApp
              </button>
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('${id}').remove()">Fechar</button>
            </div>
          </div>`;
        container.appendChild(el);
        setTimeout(() => el.remove(), 15000);
    },

    async openModal(id = null) {
        Schedule.editingId = id;
        const form = document.getElementById('schedule-form');
        form.reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appt-date').value = today;
        document.getElementById('schedule-modal-title').textContent = id ? 'Editar Agendamento' : 'Novo Agendamento';

        if (id) {
            const appts = await Store.getAppointments();
            const a = appts.find(x => x.id === id);
            if (a) {
                const dateVal = a.date?.toDate ? a.date.toDate().toISOString().split('T')[0] : (a.date || today);
                document.getElementById('appt-client').value = a.clientId || '';
                document.getElementById('appt-date').value = dateVal;
                document.getElementById('appt-time').value = a.time || '';
                document.getElementById('appt-procedure').value = a.procedure || '';
                document.getElementById('appt-duration').value = a.duration || '1 hora';
                document.getElementById('appt-value').value = a.value || '';
                document.getElementById('appt-status').value = a.status || 'scheduled';
                document.getElementById('appt-notes').value = a.notes || '';
            }
        }
        document.getElementById('schedule-modal').classList.remove('hidden');
    },

    closeModal(event) {
        if (event && event.target !== document.getElementById('schedule-modal')) return;
        document.getElementById('schedule-modal')?.classList.add('hidden');
        Schedule.editingId = null;
    },

    async handleSave(e) {
        e.preventDefault();
        const dateStr = document.getElementById('appt-date').value;
        const [y,m,d] = dateStr.split('-').map(Number);
        const clientSelect = document.getElementById('appt-client');
        const clientId = clientSelect.value;
        const clientName = clientSelect.options[clientSelect.selectedIndex]?.text || '';
        const data = {
            clientId,
            clientName,
            date:      firebase.firestore.Timestamp.fromDate(new Date(y, m-1, d)),
            time:      document.getElementById('appt-time').value,
            procedure: document.getElementById('appt-procedure').value,
            duration:  document.getElementById('appt-duration').value,
            value:     parseFloat(document.getElementById('appt-value').value) || 0,
            price:     parseFloat(document.getElementById('appt-value').value) || 0,
            status:    document.getElementById('appt-status').value,
            notes:     document.getElementById('appt-notes').value
        };
        try {
            if (Schedule.editingId) await Store.updateAppointment(Schedule.editingId, data);
            else {
                const newId = await Store.addAppointment(data);
                // Oferecer envio de confirmação por WhatsApp após novo agendamento
                const client = Schedule.currentClients.find(c => c.id === clientId);
                if (client?.phone) {
                    Schedule._offerWaConfirmation(client, data, newId);
                }
            }
            document.getElementById('schedule-modal').classList.add('hidden');
            App.showToast('Agendamento salvo!', 'success');
            await Schedule.loadAppointments();
        } catch (err) {
            App.showToast('Erro: ' + err.message, 'error');
        }
    },

    _offerWaConfirmation(client, data, apptId) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const id = 'wa-confirm-' + Date.now();
        const dt = data.date.toDate ? data.date.toDate() : new Date();
        const dateDisplay = dt.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' });
        const el = document.createElement('div');
        el.id = id;
        el.className = 'toast toast-wa';
        el.innerHTML = `
          <div style="font-size:1.4rem">📲</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:0.9rem">Enviar confirmação para ${client.name}?</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px">${dateDisplay} às ${data.time}</div>
            <div style="display:flex;gap:8px;margin-top:10px">
              <button class="btn btn-wa btn-sm" onclick="WA.confirmation('${client.name}','${client.phone}','${(data.procedure||'').replace(/'/g,"\\'")}','${dateDisplay}','${data.time}');document.getElementById('${id}').remove()">
                📲 Enviar WhatsApp
              </button>
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('${id}').remove()">Agora não</button>
            </div>
          </div>`;
        container.appendChild(el);
        setTimeout(() => el.remove(), 12000);
    },

    async delete(id) {
        if (!confirm('Excluir este agendamento?')) return;
        await Store.deleteAppointment(id);
        App.showToast('Agendamento removido.', 'success');
        await Schedule.loadAppointments();
    },

    async exportExcel() {
        const date = document.getElementById('schedule-date')?.value || new Date().toISOString().split('T')[0];
        const appts = await Store.getAppointments(date);
        const clients = Schedule.currentClients;
        const statusMap = { scheduled: 'Agendado', confirmed: 'Confirmado', done: 'Concluído', canceled: 'Cancelado' };
        const data = appts.map(a => {
            const client = clients.find(c => c.id === a.clientId);
            return {
                'Horário': a.time || '—',
                'Cliente': client?.name || a.clientName || '—',
                'Telefone': client?.phone || '',
                'Procedimento': a.procedure || '—',
                'Duração': a.duration || '',
                'Valor (R$)': a.value ? parseFloat(a.value).toFixed(2) : '',
                'Status': statusMap[a.status] || a.status || '',
                'Observações': a.notes || ''
            };
        });
        ExcelExport.fromData(data, `agenda_${date}`, 'Agenda');
    }
};
