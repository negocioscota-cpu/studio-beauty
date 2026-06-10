// === AGENDA AVANÇADA ===
const Schedule = {
    editingId: null,
    currentClients: [],
    currentView: 'day', // 'day', 'week', 'month'
    currentDate: new Date(),
    _dragData: null,

    focusNfeConfig: null,

    async render(container) {
        const [cls, doc] = await Promise.all([
            Store.getClients(),
            firebase.firestore().collection('studioConfig').doc(Store._uid()).get().catch(() => null)
        ]);
        Schedule.currentClients = cls;
        Schedule.currentDate = new Date();
        Schedule.focusNfeConfig = doc && doc.exists && doc.data().focusNfeConfig ? doc.data().focusNfeConfig : null;

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Toolbar -->
          <div class="toolbar" style="flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <!-- Navegação -->
              <button class="btn btn-ghost btn-sm" onclick="Schedule.navDate(-1)" title="Anterior">
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <button class="btn btn-ghost btn-sm" onclick="Schedule.goToday()">Hoje</button>
              <button class="btn btn-ghost btn-sm" onclick="Schedule.navDate(1)" title="Próximo">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
              <span id="schedule-title" style="font-size:1rem;font-weight:700;color:var(--text-primary);min-width:180px"></span>
            </div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <!-- Alternância de visão -->
              <div style="display:flex;border-radius:8px;border:1px solid var(--border);overflow:hidden">
                <button class="sched-view-btn active" id="view-btn-day" onclick="Schedule.setView('day')" style="padding:6px 14px;font-size:0.75rem;font-weight:600;border:none;cursor:pointer;transition:all 0.2s">Dia</button>
                <button class="sched-view-btn" id="view-btn-week" onclick="Schedule.setView('week')" style="padding:6px 14px;font-size:0.75rem;font-weight:600;border:none;cursor:pointer;transition:all 0.2s;border-left:1px solid var(--border)">Semana</button>
                <button class="sched-view-btn" id="view-btn-month" onclick="Schedule.setView('month')" style="padding:6px 14px;font-size:0.75rem;font-weight:600;border:none;cursor:pointer;transition:all 0.2s;border-left:1px solid var(--border)">Mês</button>
              </div>
              <button class="btn-export-excel" onclick="Schedule.exportExcel()">
                <span class="material-symbols-outlined" style="font-size:18px">download</span> Exportar
              </button>
              <button class="btn btn-primary" onclick="Schedule.openModal()">
                <span class="material-symbols-outlined">event_available</span> Novo Agendamento
              </button>
            </div>
          </div>

          <!-- Área de conteúdo (dia, semana ou mês) -->
          <div id="schedule-content"></div>
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
                  <input class="form-control" type="date" id="appt-date" required />
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
                <!-- Recorrência -->
                <div class="form-group">
                  <label class="form-label">🔁 Repetir</label>
                  <select class="form-control" id="appt-recurrence" onchange="Schedule._toggleRecurrenceOptions()">
                    <option value="">Não repetir</option>
                    <option value="7">A cada 7 dias</option>
                    <option value="14">A cada 14 dias</option>
                    <option value="21">A cada 21 dias (manutenção)</option>
                    <option value="28">A cada 28 dias</option>
                    <option value="30">A cada 30 dias (mensal)</option>
                    <option value="custom">Personalizado...</option>
                  </select>
                </div>
                <div class="form-group hidden" id="recurrence-custom-group">
                  <label class="form-label">Intervalo (dias)</label>
                  <input class="form-control" type="number" id="appt-recurrence-days" min="1" max="365" placeholder="Ex: 21" />
                </div>
                <div class="form-group hidden" id="recurrence-count-group">
                  <label class="form-label">Nº de repetições</label>
                  <select class="form-control" id="appt-recurrence-count">
                    <option value="3">3 vezes</option>
                    <option value="4">4 vezes</option>
                    <option value="6" selected>6 vezes</option>
                    <option value="8">8 vezes</option>
                    <option value="12">12 vezes</option>
                  </select>
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">Observações</label>
                  <textarea class="form-control" id="appt-notes" rows="2"></textarea>
                </div>
              </div>

              <!-- Seção Fiscal (NFS-e) -->
              <div id="appt-fiscal-section" style="margin-top:16px;border-top:1px solid var(--border);padding-top:16px" class="hidden"></div>

              <div class="modal-footer">
                <button type="button" class="btn btn-ghost" onclick="Schedule.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  <span class="material-symbols-outlined">save</span> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>`;

        Schedule._updateTitle();
        Schedule._updateViewButtons();
        await Schedule.loadView();
        await Schedule.loadReminders();
    },

    // ===== NAVEGAÇÃO E VISÕES =====
    setView(view) {
        Schedule.currentView = view;
        Schedule._updateViewButtons();
        Schedule._updateTitle();
        Schedule.loadView();
    },

    _updateViewButtons() {
        document.querySelectorAll('.sched-view-btn').forEach(b => {
            b.style.background = 'var(--bg-secondary)';
            b.style.color = 'var(--text-primary)';
        });
        const active = document.getElementById(`view-btn-${Schedule.currentView}`);
        if (active) {
            active.style.background = 'var(--primary)';
            active.style.color = '#fff';
        }
    },

    _updateTitle() {
        const el = document.getElementById('schedule-title');
        if (!el) return;
        const d = Schedule.currentDate;
        const opts = { day: '2-digit', month: 'long', year: 'numeric' };
        if (Schedule.currentView === 'day') {
            el.textContent = d.toLocaleDateString('pt-BR', { weekday: 'long', ...opts });
        } else if (Schedule.currentView === 'week') {
            const start = Schedule._weekStart(d);
            const end = new Date(start); end.setDate(end.getDate() + 6);
            el.textContent = `${start.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})} — ${end.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})}`;
        } else {
            el.textContent = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        }
    },

    navDate(dir) {
        const d = Schedule.currentDate;
        if (Schedule.currentView === 'day') d.setDate(d.getDate() + dir);
        else if (Schedule.currentView === 'week') d.setDate(d.getDate() + dir * 7);
        else d.setMonth(d.getMonth() + dir);
        Schedule._updateTitle();
        Schedule.loadView();
    },

    goToday() {
        Schedule.currentDate = new Date();
        Schedule._updateTitle();
        Schedule.loadView();
    },

    _weekStart(d) {
        const start = new Date(d);
        const day = start.getDay();
        start.setDate(start.getDate() - (day === 0 ? 6 : day - 1)); // Segunda-feira
        start.setHours(0,0,0,0);
        return start;
    },

    async loadView() {
        const container = document.getElementById('schedule-content');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:32px"><div class="spinner"></div></div>';
        if (Schedule.currentView === 'day') await Schedule._renderDayView(container);
        else if (Schedule.currentView === 'week') await Schedule._renderWeekView(container);
        else await Schedule._renderMonthView(container);
    },

    // ===== VISÃO DIÁRIA =====
    async _renderDayView(container) {
        const dateStr = Schedule.currentDate.toISOString().split('T')[0];
        const appts = await Store.getAppointments(dateStr);
        if (!appts.length) {
            container.innerHTML = `<div class="empty-state">
                <span class="material-symbols-outlined empty-state-icon">calendar_today</span>
                <p class="empty-state-title">Nenhum agendamento neste dia</p>
                <button class="btn btn-primary" onclick="Schedule.openModal()">Agendar agora</button>
            </div>`;
            return;
        }
        const sorted = appts.sort((a,b) => (a.time||'').localeCompare(b.time||''));
        const loyaltyConfig = await Store.getLoyaltyConfig().catch(() => null);

        container.innerHTML = `<div class="appointments-list">${sorted.map(a => Schedule._renderApptCard(a, loyaltyConfig)).join('')}</div>`;
        Schedule._initDragAndDrop(container);
    },

    _renderApptCard(a, loyaltyConfig) {
        const client = Schedule.currentClients.find(c => c.id === a.clientId);
        const clientName = client?.name || a.clientName || 'Cliente';
        const clientPhone = client?.phone || '';
        const clientEmail = client?.email || '';
        const isDone = a.status === 'done';
        const isCanceled = a.status === 'canceled';

        const statusBadge = {
            scheduled: '<span class="badge badge-gold">📅 Agendado</span>',
            confirmed: '<span class="badge badge-blue">✓ Confirmado</span>',
            done:      '<span class="badge badge-green">✅ Concluído</span>',
            canceled:  '<span class="badge badge-brown">✗ Cancelado</span>'
        }[a.status] || a.status;

        const dt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateDisplay = isNaN(dt) ? '' : dt.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' });
        const nameEnc = encodeURIComponent(clientName);
        const phoneEnc = encodeURIComponent(clientPhone);
        const reviewUrl = `${location.origin}/avaliacao.html?studio=${Store._uid()}&appt=${a.id}&name=${nameEnc}&phone=${phoneEnc}`;
        const recurrenceLabel = a.recurrenceInterval ? `<span style="font-size:0.68rem;color:var(--primary);margin-left:6px">🔁 a cada ${a.recurrenceInterval}d</span>` : '';

        return `<div class="appointment-card ${isDone ? 'appt-done' : ''} ${isCanceled ? 'appt-canceled' : ''}"
          draggable="${!isDone && !isCanceled}" data-appt-id="${a.id}" data-date="${a.date?.toDate ? a.date.toDate().toISOString().split('T')[0] : ''}" data-time="${a.time||''}">
              <div class="appt-time">${a.time || '--:--'}</div>
              <div class="appt-info">
                <div class="appt-name">${clientName} ${recurrenceLabel}</div>
                <div class="appt-procedure">${a.procedure || '-'} · ${a.duration || ''}</div>
                ${a.notes ? `<div class="appt-notes">${a.notes}</div>` : ''}
              </div>
              <div class="appt-right">
                <div style="font-weight:700;color:var(--primary)">${a.value ? App.formatCurrency(Number(a.value)) : ''}</div>
                ${a.paymentStatus === 'paid' ? '<span class="badge" style="background:rgba(46,160,67,.15);color:#2ea043;font-size:0.68rem;padding:2px 8px;border-radius:12px">💳 Pago</span>' : ''}
                ${statusBadge}
                <div class="appt-actions">
                  <button class="btn btn-ghost btn-sm" onclick="Schedule.openModal('${a.id}')" title="Editar">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  ${!isCanceled ? `<button class="btn btn-wa btn-sm" title="Enviar confirmação por WhatsApp"
                    onclick="WA.confirmation('${clientName}','${clientPhone}','${(a.procedure||'').replace(/'/g,"\\'")}','${dateDisplay}','${a.time||''}','${clientEmail}')">
                    <span style="font-size:15px">📲</span>
                  </button>` : ''}
                  ${!isCanceled && !isDone ? `<button class="btn btn-reminder btn-sm" title="Enviar lembrete D-1"
                    onclick="WA.reminder('${clientName}','${clientPhone}','${(a.procedure||'').replace(/'/g,"\\'")}','${a.time||''}','${clientEmail}')">
                    <span class="material-symbols-outlined" style="font-size:15px">notifications</span>
                  </button>` : ''}
                  ${isDone ? `<button class="btn btn-review btn-sm" title="Enviar link de avaliação"
                    onclick="Schedule.sendReviewLink('${clientName}','${clientPhone}','${reviewUrl}')">
                    <span class="material-symbols-outlined" style="font-size:15px">star</span>
                  </button>` : ''}
                  ${a.status === 'scheduled' || a.status === 'confirmed' ? `<button class="btn btn-ghost btn-sm" title="Marcar como concluído"
                    onclick="Schedule.markDone('${a.id}','${a.clientId}','${clientName}','${clientPhone}','${(a.procedure||'').replace(/'/g,"\\'")}','${reviewUrl}',${loyaltyConfig ? loyaltyConfig.threshold : 0},'${loyaltyConfig ? (loyaltyConfig.reward||'').replace(/'/g,"\\'") : ''}','${clientEmail}')">
                    <span class="material-symbols-outlined" style="font-size:15px">check_circle</span>
                  </button>` : ''}
                  <button class="btn btn-ghost btn-sm" onclick="Schedule.delete('${a.id}')" style="color:var(--danger)" title="Excluir">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>`;
    },

    // ===== VISÃO SEMANAL =====
    async _renderWeekView(container) {
        const start = Schedule._weekStart(Schedule.currentDate);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start); d.setDate(d.getDate() + i);
            days.push(d);
        }
        // Buscar appointments de toda a semana
        const startStr = days[0].toISOString().split('T')[0];
        const endDate = new Date(days[6]); endDate.setDate(endDate.getDate() + 1);
        const allAppts = await Store.getAppointmentsRange(days[0], endDate);

        const today = new Date(); today.setHours(0,0,0,0);
        const weekdayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

        container.innerHTML = `
        <div class="card">
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:0;overflow-x:auto;min-height:300px" id="week-grid">
            ${days.map((day, idx) => {
              const dateStr = day.toISOString().split('T')[0];
              const dayAppts = allAppts.filter(a => {
                const adt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                return adt.toISOString().split('T')[0] === dateStr;
              }).sort((a,b) => (a.time||'').localeCompare(b.time||''));
              const isToday = day.getTime() === today.getTime();
              const isPast = day < today;

              return `<div class="week-day-col ${isToday ? 'week-day-today' : ''}" data-date="${dateStr}"
                ondragover="event.preventDefault();this.style.background='rgba(201,169,110,0.1)'"
                ondragleave="this.style.background=''"
                ondrop="Schedule._handleDrop(event,'${dateStr}')">
                <div class="week-day-header" style="padding:10px 8px;text-align:center;border-bottom:1px solid var(--border);font-size:0.72rem;font-weight:700;color:${isToday ? 'var(--primary)' : isPast ? 'var(--text-muted)' : 'var(--text-primary)'}">
                  <div>${weekdayNames[idx]}</div>
                  <div style="font-size:1.1rem;font-weight:800;${isToday ? 'background:var(--primary);color:#fff;width:30px;height:30px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center' : ''}">${day.getDate()}</div>
                </div>
                <div class="week-day-body" style="padding:4px;min-height:200px;display:flex;flex-direction:column;gap:4px;${idx < 6 ? 'border-right:1px solid var(--border)' : ''}">
                  ${dayAppts.length === 0
                    ? `<div style="text-align:center;padding:20px 4px;color:var(--text-muted);font-size:0.68rem">—</div>`
                    : dayAppts.map(a => {
                        const st = {scheduled:'#f59e0b',confirmed:'#3b82f6',done:'#22c55e',canceled:'#9ca3af'}[a.status] || '#6b7280';
                        const clientName = Schedule.currentClients.find(c => c.id === a.clientId)?.name || a.clientName || '?';
                        return `<div class="week-appt-chip" draggable="true" data-appt-id="${a.id}" data-date="${dateStr}" data-time="${a.time||''}"
                          ondragstart="Schedule._handleDragStart(event)"
                          onclick="Schedule.openModal('${a.id}')"
                          style="padding:6px 8px;border-radius:8px;font-size:0.7rem;cursor:grab;background:${st}15;border-left:3px solid ${st};transition:transform 0.15s"
                          onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
                          <div style="font-weight:700;color:${st};font-size:0.68rem">${a.time || '--:--'}</div>
                          <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100px">${clientName}</div>
                          <div style="color:var(--text-muted);font-size:0.62rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.procedure || ''}</div>
                        </div>`;
                      }).join('')}
                  <button class="btn btn-ghost" style="font-size:0.68rem;padding:4px;width:100%;margin-top:auto;opacity:0.5"
                    onclick="Schedule.currentDate=new Date('${dateStr}T12:00:00');Schedule.openModal()">+ Agendar</button>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
    },

    // ===== VISÃO MENSAL =====
    async _renderMonthView(container) {
        const d = Schedule.currentDate;
        const year = d.getFullYear();
        const month = d.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const nextMonthFirst = new Date(year, month + 1, 1);

        // Buscar todos os appointments do mês
        const allAppts = await Store.getAppointmentsRange(firstDay, nextMonthFirst);

        const today = new Date(); today.setHours(0,0,0,0);
        const startWeekday = firstDay.getDay() || 7; // 1=seg...7=dom
        const daysInMonth = lastDay.getDate();
        const weekdayHeaders = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

        // Gerar grid de 6 semanas
        let cells = '';
        let dayNum = 1;
        let started = false;
        for (let row = 0; row < 6; row++) {
            for (let col = 1; col <= 7; col++) {
                if (!started && col === startWeekday) started = true;
                if (!started || dayNum > daysInMonth) {
                    cells += `<div class="month-cell month-cell-empty" style="padding:6px;border:1px solid var(--border);min-height:80px;background:var(--bg-secondary)"></div>`;
                    continue;
                }
                const cellDate = new Date(year, month, dayNum);
                const dateStr = cellDate.toISOString().split('T')[0];
                const isToday = cellDate.getTime() === today.getTime();
                const dayAppts = allAppts.filter(a => {
                    const adt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                    return adt.toISOString().split('T')[0] === dateStr;
                });

                cells += `<div class="month-cell" data-date="${dateStr}" style="padding:6px;border:1px solid var(--border);min-height:80px;cursor:pointer;transition:background 0.2s"
                  onclick="Schedule.currentDate=new Date('${dateStr}T12:00:00');Schedule.setView('day')"
                  ondragover="event.preventDefault();this.style.background='rgba(201,169,110,0.15)'"
                  ondragleave="this.style.background=''"
                  ondrop="Schedule._handleDrop(event,'${dateStr}')">
                  <div style="font-size:0.78rem;font-weight:${isToday ? '800' : '600'};margin-bottom:4px;${isToday ? 'background:var(--primary);color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center' : 'color:var(--text-primary)'}">${dayNum}</div>
                  ${dayAppts.length > 0 ? `
                    ${dayAppts.slice(0,3).map(a => {
                      const st = {scheduled:'#f59e0b',confirmed:'#3b82f6',done:'#22c55e',canceled:'#9ca3af'}[a.status] || '#6b7280';
                      const name = Schedule.currentClients.find(c => c.id === a.clientId)?.name || '?';
                      return `<div style="font-size:0.62rem;padding:2px 4px;margin-bottom:2px;border-radius:4px;background:${st}15;border-left:2px solid ${st};white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
                        draggable="true" data-appt-id="${a.id}" ondragstart="Schedule._handleDragStart(event)">
                        <strong>${a.time||''}</strong> ${name}
                      </div>`;
                    }).join('')}
                    ${dayAppts.length > 3 ? `<div style="font-size:0.6rem;color:var(--text-muted);text-align:center">+${dayAppts.length-3} mais</div>` : ''}
                  ` : ''}
                </div>`;
                dayNum++;
            }
        }

        container.innerHTML = `
        <div class="card">
          <div style="display:grid;grid-template-columns:repeat(7,1fr)">
            ${weekdayHeaders.map(w => `<div style="padding:8px;text-align:center;font-size:0.72rem;font-weight:700;color:var(--text-muted);border-bottom:2px solid var(--border)">${w}</div>`).join('')}
            ${cells}
          </div>
        </div>`;
    },

    // ===== DRAG & DROP =====
    _handleDragStart(e) {
        const card = e.target.closest('[data-appt-id]');
        if (!card) return;
        Schedule._dragData = {
            apptId: card.dataset.apptId,
            fromDate: card.dataset.date,
            time: card.dataset.time
        };
        e.dataTransfer.setData('text/plain', card.dataset.apptId);
        e.dataTransfer.effectAllowed = 'move';
        card.style.opacity = '0.5';
        setTimeout(() => card.style.opacity = '1', 500);
    },

    async _handleDrop(e, newDateStr) {
        e.preventDefault();
        e.currentTarget.style.background = '';
        if (!Schedule._dragData) return;

        const { apptId, fromDate } = Schedule._dragData;
        if (fromDate === newDateStr) return; // Mesmo dia — sem mudança

        try {
            const [y,m,d] = newDateStr.split('-').map(Number);
            // Preservar horário original do agendamento
            const timeStr = Schedule._dragData.time || '00:00';
            const [hours, minutes] = timeStr.split(':').map(Number);
            const newDateObj = new Date(y, m-1, d, hours || 0, minutes || 0);
            const newDate = firebase.firestore.Timestamp.fromDate(newDateObj);
            await Store.updateAppointment(apptId, { date: newDate });
            App.showToast(`📅 Agendamento movido para ${new Date(y,m-1,d).toLocaleDateString('pt-BR')}!`, 'success');
            await Schedule.loadView();
        } catch(err) {
            App.showToast('Erro ao reagendar: ' + err.message, 'error');
        }
        Schedule._dragData = null;
    },

    _initDragAndDrop(container) {
        container.querySelectorAll('.appointment-card[draggable="true"]').forEach(card => {
            card.addEventListener('dragstart', Schedule._handleDragStart);
        });
    },

    // ===== TOGGLE RECURRENCE =====
    _toggleRecurrenceOptions() {
        const val = document.getElementById('appt-recurrence').value;
        const customG = document.getElementById('recurrence-custom-group');
        const countG = document.getElementById('recurrence-count-group');
        if (val === 'custom') {
            customG?.classList.remove('hidden');
            countG?.classList.remove('hidden');
        } else if (val) {
            customG?.classList.add('hidden');
            countG?.classList.remove('hidden');
        } else {
            customG?.classList.add('hidden');
            countG?.classList.add('hidden');
        }
    },

    // ===== PAINEL D-1 =====
    async loadReminders() {
        const panel = document.getElementById('reminder-panel');
        if (!panel) return;
        const tomorrow = Schedule._tomorrow();
        const appts = await Store.getAppointments(tomorrow);
        const active = appts.filter(a => a.status !== 'canceled');
        if (!active.length) { panel.innerHTML = ''; return; }

        panel.innerHTML = `
          <div class="card reminder-panel" style="margin-top:20px">
            <div class="card-header">
              <span class="card-title">🔔 Lembretes para Amanhã <span class="badge badge-gold">${active.length}</span></span>
              <button class="btn btn-wa btn-sm" onclick="Schedule.sendAllReminders()">📲 Enviar todos</button>
            </div>
            <div class="card-body" style="padding:0">
              <div class="reminder-list">
                ${active.map(a => {
                    const c = Schedule.currentClients.find(x => x.id === a.clientId);
                    const phone = c?.phone || '';
                    const email = c?.email || '';
                    const name = c?.name || a.clientName || 'Cliente';
                    return `<div class="reminder-item" data-phone="${phone}" data-name="${name}" data-email="${email}" data-procedure="${(a.procedure||'').replace(/"/g,'&quot;')}" data-time="${a.time||''}">
                      <div class="reminder-avatar">${name.charAt(0)}</div>
                      <div class="reminder-info">
                        <div class="reminder-name">${name}</div>
                        <div class="reminder-detail">${a.procedure || '—'} · ${a.time || ''}</div>
                      </div>
                      ${phone
                        ? `<button class="btn btn-wa btn-sm" onclick="WA.reminder('${name}','${phone}','${(a.procedure||'').replace(/'/g,"\\'")}','${a.time||''}','${email}')" title="Enviar lembrete">📲</button>`
                        : `<span style="font-size:0.75rem;color:var(--text-muted)">Sem telefone</span>`
                      }
                    </div>`;
                }).join('')}
              </div>
            </div>
          </div>`;

        Schedule._remindersData = active.map(a => {
            const c = Schedule.currentClients.find(x => x.id === a.clientId);
            return { name: c?.name || a.clientName || 'Cliente', phone: c?.phone || '', email: c?.email || '', procedure: a.procedure || '', time: a.time || '' };
        });
    },

    sendAllReminders() {
        const data = Schedule._remindersData || [];
        const withPhone = data.filter(d => d.phone);
        if (!withPhone.length) { App.showToast('Nenhuma cliente com telefone cadastrado.', 'error'); return; }
        let delay = 0;
        withPhone.forEach(d => {
            setTimeout(() => WA.reminder(d.name, d.phone, d.procedure, d.time, d.email), delay);
            delay += 800;
        });
        App.showToast(`📲 ${withPhone.length} lembretes abertos!`, 'success');
    },

    _tomorrow() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    },
    _remindersData: [],

    // Enviar link de avaliação por WhatsApp
    sendReviewLink(clientName, phone, reviewUrl) {
        WA.reviewRequest(clientName, phone, reviewUrl);
    },

    // Marcar como concluído + verificar fidelidade
    async markDone(apptId, clientId, clientName, clientPhone, procedure, reviewUrl, loyaltyThreshold, loyaltyReward, email = null) {
        try {
            const catalog = await Store.getCatalog();
            const service = catalog.find(s => s.name.toLowerCase() === procedure.toLowerCase());
            
            if (service && service.inputs && service.inputs.length > 0) {
                const inventory = await Store.getInventory();
                
                for (const inp of service.inputs) {
                    const invItem = inventory.find(i => i.id === inp.productId);
                    if (invItem) {
                        const newQty = Math.max(0, invItem.qty - inp.qty);
                        await Store.updateInventoryItem(invItem.id, { qty: newQty });
                        
                        try {
                            const db = firebase.firestore();
                            await db.collection('inventory_logs').add({
                                userId: Store._uid(),
                                apptId: apptId,
                                productId: invItem.id,
                                productName: invItem.name,
                                qty: inp.qty,
                                type: 'out',
                                description: `Baixa automática - Atendimento de ${clientName || 'Cliente'} em ${new Date().toLocaleDateString('pt-BR')}`,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        } catch(logErr) { console.warn("Erro ao gravar log de estoque:", logErr); }
                    }
                }
                console.log(`✅ Baixa automática concluída silenciosamente para o serviço "${procedure}".`);
            } else {
                console.log(`ℹ️ Serviço "${procedure}" sem receita cadastrada no catálogo. Nenhuma baixa realizada.`);
            }
        } catch(e) {
            console.warn("Erro no processamento da baixa de estoque automática:", e);
        }

        try {
            await Store.updateAppointment(apptId, { status: 'done' });
            App.showToast('✅ Atendimento concluído!', 'success');

            if (loyaltyThreshold > 0 && clientId) {
                const milestone = await Store.checkLoyaltyMilestone(clientId, loyaltyThreshold);
                if (milestone.reached) {
                    Schedule._showLoyaltyToast(clientName, clientPhone, loyaltyReward, milestone.totalVisits, email);
                }
            }

            // Enviar cuidados pós-atendimento
            if (clientPhone && procedure) {
                try {
                    const cfg = await Store.getStudioConfig();
                    if (cfg.aftercareEnabled !== false) { // ativado por padrão
                        setTimeout(() => {
                            Schedule._showAftercareToast(clientName, clientPhone, procedure, cfg.aftercareTemplates, email);
                        }, loyaltyThreshold > 0 ? 2500 : 1000);
                    }
                } catch(e) { console.warn('Aftercare config error:', e); }
            }

            await Schedule.loadView();
        } catch(err) {
            App.showToast('Erro: ' + err.message, 'error');
        }
    },

    _showLoyaltyToast(clientName, phone, reward, visitCount, email = null) {
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
              <button class="btn btn-wa btn-sm" onclick="WA.loyaltyReward('${clientName}','${phone}','${reward}','${visitCount}','${email}')">
                📲 Avisar no WhatsApp
              </button>
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('${id}').remove()">Fechar</button>
            </div>
          </div>`;
        container.appendChild(el);
        setTimeout(() => el.remove(), 15000);
    },

    _showAftercareToast(clientName, phone, procedure, customTemplates, email = null) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const id = 'aftercare-' + Date.now();
        const el = document.createElement('div');
        el.id = id;
        el.className = 'toast toast-aftercare';
        el.style.cssText = 'display:flex;gap:12px;align-items:flex-start;padding:16px 20px;background:linear-gradient(135deg,#1a2a1a,#2d4a2d);border:1px solid rgba(37,211,102,0.3);border-radius:14px;color:white;max-width:420px;animation:slideIn 0.4s ease';
        el.innerHTML = `
          <div style="font-size:1.5rem">📲</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:0.92rem;color:#25D366">Cuidados Pós-Atendimento</div>
            <div style="font-size:0.82rem;margin-top:4px;color:rgba(255,255,255,0.8)">Enviar orientações de <strong>${procedure}</strong> para <strong>${clientName}</strong>?</div>
            <div style="display:flex;gap:8px;margin-top:12px">
              <button class="btn btn-sm" style="background:#25D366;color:white;border:none;padding:8px 16px;border-radius:8px;font-weight:600;cursor:pointer;font-size:0.82rem" onclick="WA.aftercare('${clientName.replace(/'/g, "\\'")}','${phone}','${(procedure||'').replace(/'/g, "\\'")}',${customTemplates ? 'Schedule._aftercareTemplates' : 'null'},'${email}');document.getElementById('${id}').remove()">📲 Enviar cuidados</button>
              <button class="btn btn-ghost btn-sm" style="color:rgba(255,255,255,0.6);border:none;cursor:pointer;font-size:0.82rem" onclick="document.getElementById('${id}').remove()">Agora não</button>
            </div>
          </div>`;
        container.appendChild(el);
        if (customTemplates) Schedule._aftercareTemplates = customTemplates;
        setTimeout(() => el.remove(), 15000);
    },
    _aftercareTemplates: null,

    // ===== MODAL CADASTRO/EDIÇÃO =====
    async openModal(id = null) {
        Schedule.editingId = id;
        const form = document.getElementById('schedule-form');
        form.reset();
        const dateStr = Schedule.currentDate.toISOString().split('T')[0];
        document.getElementById('appt-date').value = dateStr;
        document.getElementById('schedule-modal-title').textContent = id ? 'Editar Agendamento' : 'Novo Agendamento';

        // Reset recurrence fields
        document.getElementById('recurrence-custom-group')?.classList.add('hidden');
        document.getElementById('recurrence-count-group')?.classList.add('hidden');

        if (id) {
            const appts = await Store.getAppointments();
            const a = appts.find(x => x.id === id);
            if (!a) {
                // Tentar buscar direto do Firestore
                try {
                    const doc = await firebase.firestore().collection('appointments').doc(id).get();
                    if (doc.exists) {
                        const aData = { id: doc.id, ...doc.data() };
                        Schedule._fillModalFields(aData);
                    }
                } catch(e) {}
            } else {
                Schedule._fillModalFields(a);
            }
        }
        
        if (id && Schedule.focusNfeConfig && Schedule.focusNfeConfig.enabled) {
            const appts = await Store.getAppointments();
            const a = appts.find(x => x.id === id);
            if (a) {
                Schedule.renderFiscalSection(a);
            } else {
                try {
                    const doc = await firebase.firestore().collection('appointments').doc(id).get();
                    if (doc.exists) {
                        Schedule.renderFiscalSection({ id: doc.id, ...doc.data() });
                    }
                } catch(e){}
            }
        } else {
            document.getElementById('appt-fiscal-section')?.classList.add('hidden');
        }

        document.getElementById('schedule-modal').classList.remove('hidden');
    },

    _fillModalFields(a) {
        const today = new Date().toISOString().split('T')[0];
        const dateVal = a.date?.toDate ? a.date.toDate().toISOString().split('T')[0] : (a.date || today);
        document.getElementById('appt-client').value = a.clientId || '';
        document.getElementById('appt-date').value = dateVal;
        document.getElementById('appt-time').value = a.time || '';
        document.getElementById('appt-procedure').value = a.procedure || '';
        document.getElementById('appt-duration').value = a.duration || '1 hora';
        document.getElementById('appt-value').value = a.value || '';
        document.getElementById('appt-status').value = a.status || 'scheduled';
        document.getElementById('appt-notes').value = a.notes || '';
        if (a.recurrenceInterval) {
            document.getElementById('appt-recurrence').value = String(a.recurrenceInterval);
            Schedule._toggleRecurrenceOptions();
        }
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

        const recurrenceVal = document.getElementById('appt-recurrence').value;
        let recurrenceInterval = 0;
        if (recurrenceVal === 'custom') {
            recurrenceInterval = parseInt(document.getElementById('appt-recurrence-days').value) || 0;
        } else if (recurrenceVal) {
            recurrenceInterval = parseInt(recurrenceVal);
        }

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
            notes:     document.getElementById('appt-notes').value,
            recurrenceInterval: recurrenceInterval || null
        };

        try {
            if (Schedule.editingId) {
                await Store.updateAppointment(Schedule.editingId, data);
            } else {
                const newId = await Store.addAppointment(data);
                const client = Schedule.currentClients.find(c => c.id === clientId);
                if (client?.phone) {
                    Schedule._offerWaConfirmation(client, data, newId);
                }

                // Criar agendamentos recorrentes
                if (recurrenceInterval > 0 && !Schedule.editingId) {
                    const repeatCount = parseInt(document.getElementById('appt-recurrence-count').value) || 6;
                    let currentDate = new Date(y, m-1, d);
                    for (let i = 1; i < repeatCount; i++) {
                        currentDate = new Date(currentDate);
                        currentDate.setDate(currentDate.getDate() + recurrenceInterval);
                        const recurData = { ...data };
                        recurData.date = firebase.firestore.Timestamp.fromDate(currentDate);
                        recurData.recurrenceGroup = newId;
                        recurData.recurrenceIndex = i;
                        recurData.status = 'scheduled';
                        await Store.addAppointment(recurData);
                    }
                    App.showToast(`🔁 ${repeatCount} agendamentos criados (a cada ${recurrenceInterval} dias)!`, 'success');
                }
            }
            document.getElementById('schedule-modal').classList.add('hidden');
            App.showToast('Agendamento salvo!', 'success');
            await Schedule.loadView();
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
              <button class="btn btn-wa btn-sm" onclick="WA.confirmation('${client.name}','${client.phone}','${(data.procedure||'').replace(/'/g,"\\'")}','${dateDisplay}','${data.time}','${client.email || ''}');document.getElementById('${id}').remove()">
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
        await Schedule.loadView();
    },

    async exportExcel() {
        const dateStr = Schedule.currentDate.toISOString().split('T')[0];
        const appts = await Store.getAppointments(dateStr);
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
                'Recorrência': a.recurrenceInterval ? `A cada ${a.recurrenceInterval} dias` : '',
                'Observações': a.notes || ''
            };
        });
        ExcelExport.fromData(data, `agenda_${dateStr}`, 'Agenda');
    },

    // ===== GOOGLE CALENDAR SYNC =====
    async syncGoogleCalendar() {
        try {
            if (typeof gapi === 'undefined' || !gapi.client) {
                App.showToast('⚠️ Google Calendar API não carregada. Configure as credenciais OAuth no Google Cloud Console.', 'info');
                return;
            }
            const isAuthed = gapi.auth2?.getAuthInstance()?.isSignedIn?.get();
            if (!isAuthed) {
                await gapi.auth2.getAuthInstance().signIn();
            }
            // Buscar eventos do dia
            const dateStr = Schedule.currentDate.toISOString().split('T')[0];
            const appts = await Store.getAppointments(dateStr);
            let synced = 0;
            for (const a of appts) {
                if (a.status === 'canceled') continue;
                const dt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                const [h, min] = (a.time || '09:00').split(':').map(Number);
                dt.setHours(h, min, 0, 0);
                const endDt = new Date(dt);
                const durMap = {'30 min':30,'1 hora':60,'1h30':90,'2 horas':120,'2h30':150,'3 horas':180};
                endDt.setMinutes(endDt.getMinutes() + (durMap[a.duration] || 60));

                const event = {
                    summary: `${a.clientName || 'Cliente'} — ${a.procedure || 'Atendimento'}`,
                    start: { dateTime: dt.toISOString() },
                    end: { dateTime: endDt.toISOString() },
                    description: `Studio Beauty · ${a.notes || ''}`.trim()
                };
                await gapi.client.calendar.events.insert({ calendarId: 'primary', resource: event });
                synced++;
            }
            App.showToast(`📅 ${synced} agendamento${synced !== 1 ? 's' : ''} sincronizado${synced !== 1 ? 's' : ''} com Google Calendar!`, 'success');
        } catch(err) {
            App.showToast('Erro ao sincronizar: ' + (err.message || err.result?.error?.message || 'Verifique as credenciais OAuth'), 'error');
        }
    },

    // ===== NOTA FISCAL ELETRÔNICA (FOCUS NFE) =====
    renderFiscalSection(a) {
        const sec = document.getElementById('appt-fiscal-section');
        if (!sec || !Schedule.focusNfeConfig) return;
        sec.classList.remove('hidden');

        const invoice = a.invoice || {};
        const status = invoice.status || 'not_issued';

        let content = '';

        if (status === 'authorized') {
            content = `
            <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="font-size:0.85rem;font-weight:700;color:#22c55e;display:flex;align-items:center;gap:6px">
                  <span class="material-symbols-outlined" style="font-size:18px">check_circle</span> NFS-e Autorizada com Sucesso!
                </span>
                <span style="font-size:0.75rem;color:var(--text-muted)">Emitida em ${invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString('pt-BR') : '—'}</span>
              </div>
              <div style="display:flex;gap:8px;margin-top:4px">
                <a href="${invoice.pdfUrl}" target="_blank" class="btn btn-ghost btn-sm" style="flex:1;font-size:0.78rem;gap:4px;display:flex;align-items:center;justify-content:center">
                  <span class="material-symbols-outlined" style="font-size:16px">picture_as_pdf</span> Baixar PDF
                </a>
                <a href="${invoice.xmlUrl}" target="_blank" class="btn btn-ghost btn-sm" style="flex:1;font-size:0.78rem;gap:4px;display:flex;align-items:center;justify-content:center">
                  <span class="material-symbols-outlined" style="font-size:16px">code</span> Baixar XML
                </a>
              </div>
            </div>`;
        } else if (status === 'processing') {
            content = `
            <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:10px;padding:14px;text-align:center">
              <div class="spinner" style="width:20px;height:20px;border-width:2.5px;margin:0 auto 8px"></div>
              <span style="font-size:0.85rem;font-weight:600;color:#3b82f6">NFS-e sendo processada na prefeitura...</span>
              <p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">A prefeitura pode levar alguns minutos. Você pode fechar o modal e verificar mais tarde.</p>
              <button type="button" class="btn btn-ghost btn-sm" onclick="Schedule.checkInvoiceStatus('${a.id}')" style="margin-top:8px;font-size:0.75rem;gap:4px;display:inline-flex;align-items:center;justify-content:center">
                <span class="material-symbols-outlined" style="font-size:15px">sync</span> Verificar Status
              </button>
            </div>`;
        } else {
            const isError = status === 'error';
            content = `
            <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="font-weight:700;font-size:0.85rem;color:var(--text-primary)">🧾 Nota Fiscal Eletrônica (NFS-e)</span>
                <span class="badge ${isError ? 'badge-red' : 'badge-brown'}">${isError ? 'Erro na Emissão' : 'Não Emitida'}</span>
              </div>
              
              ${isError ? `
              <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:10px;font-size:0.78rem;color:#ef4444;line-height:1.4">
                ❌ <strong>Motivo da rejeição:</strong><br>${invoice.errorMessage || 'Erro desconhecido.'}
              </div>` : ''}

              <p style="font-size:0.78rem;color:var(--text-muted);margin:0">Deseja emitir a nota fiscal de serviço para esta cliente?</p>
              
              <button type="button" class="btn btn-primary btn-sm" onclick="Schedule.openFiscalModal('${a.id}')" style="margin-top:4px;gap:6px;align-self:flex-start;display:inline-flex;align-items:center;justify-content:center">
                <span class="material-symbols-outlined" style="font-size:16px">send</span> Preparar e Emitir NFS-e
              </button>
            </div>`;
        }

        sec.innerHTML = content;
    },

    async openFiscalModal(apptId) {
        const appts = await Store.getAppointments();
        const a = appts.find(x => x.id === apptId);
        if (!a) return;

        const client = Schedule.currentClients.find(c => c.id === a.clientId) || {};
        const fd = client.fiscalData || {};
        const addr = fd.address || {};

        let modal = document.getElementById('fiscal-emission-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'fiscal-emission-modal';
            modal.className = 'modal-overlay hidden';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
        <div class="modal-container" style="max-width:550px;width:100%" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">🧾 Preparar Nota Fiscal (NFS-e)</h3>
              <button class="modal-close" onclick="document.getElementById('fiscal-emission-modal').classList.add('hidden')">✕</button>
            </div>
            <form id="fiscal-emission-form" class="modal-body" style="display:flex;flex-direction:column;gap:16px;overflow-y:auto;max-height:80vh">
              
              <div style="background:rgba(201,169,110,0.06);border:1px solid rgba(201,169,110,0.15);border-radius:10px;padding:12px">
                <p style="font-size:0.78rem;color:var(--text-secondary);line-height:1.4;margin:0">
                  ⚠️ Preencha ou revise as informações abaixo. Se houver dados faltantes (como o CPF do cliente), preencha aqui e eles serão <strong>salvos de volta na ficha do cliente</strong> automaticamente após a emissão.
                </p>
              </div>

              <!-- Dados do Tomador (Cliente) -->
              <div style="display:flex;flex-direction:column;gap:12px">
                <h4 style="font-size:0.85rem;font-weight:700;color:var(--primary);margin:0">👤 Dados do Cliente (Tomador)</h4>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                  <div class="form-group">
                    <label class="form-label" style="font-size:0.75rem">Nome Completo</label>
                    <input class="form-control" id="f-client-name" value="${client.name || a.clientName || ''}" required style="font-size:0.8rem;padding:6px 10px" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-size:0.75rem">CPF ou CNPJ</label>
                    <input class="form-control" id="f-client-cpf" value="${fd.cpfCnpj || ''}" required placeholder="000.000.000-00" oninput="Clients._maskCpfCnpj(this)" style="font-size:0.8rem;padding:6px 10px" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" style="font-size:0.75rem">E-mail (para envio da nota)</label>
                  <input class="form-control" type="email" id="f-client-email" value="${client.email || ''}" required placeholder="cliente@email.com" style="font-size:0.8rem;padding:6px 10px" />
                </div>

                <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:12px">
                  <div class="form-group">
                    <label class="form-label" style="font-size:0.75rem">CEP</label>
                    <div style="display:flex;gap:6px">
                      <input class="form-control" id="f-client-cep" value="${addr.zipCode || ''}" required placeholder="00000-000" maxlength="9" oninput="Clients._maskCep(this)" style="font-size:0.8rem;padding:6px 10px;flex:1" />
                      <button type="button" class="btn btn-ghost btn-sm" onclick="Schedule.searchFiscalCep()" style="padding:0 8px;font-size:0.72rem" id="btn-f-search-cep">Buscar</button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-size:0.75rem">Rua / Logradouro</label>
                    <input class="form-control" id="f-client-street" value="${addr.street || ''}" required style="font-size:0.8rem;padding:6px 10px" />
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:12px">
                  <div class="form-group">
                    <label class="form-label" style="font-size:0.75rem">Número</label>
                    <input class="form-control" id="f-client-number" value="${addr.number || ''}" required style="font-size:0.8rem;padding:6px 10px" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-size:0.75rem">Complemento</label>
                    <input class="form-control" id="f-client-complement" value="${addr.complement || ''}" placeholder="Apto, Sala..." style="font-size:0.8rem;padding:6px 10px" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-size:0.75rem">Bairro</label>
                    <input class="form-control" id="f-client-neighborhood" value="${addr.neighborhood || ''}" required style="font-size:0.8rem;padding:6px 10px" />
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:12px">
                  <div class="form-group">
                    <label class="form-label" style="font-size:0.75rem">Cidade</label>
                    <input class="form-control" id="f-client-city" value="${addr.city || ''}" required style="font-size:0.8rem;padding:6px 10px" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-size:0.75rem">Estado (UF)</label>
                    <input class="form-control" id="f-client-uf" value="${addr.state || ''}" required maxlength="2" style="font-size:0.8rem;padding:6px 10px;text-transform:uppercase" />
                  </div>
                </div>
              </div>

              <hr style="border:none;border-top:1px solid var(--border);margin:4px 0" />

              <!-- Dados do Serviço -->
              <div style="display:flex;flex-direction:column;gap:12px">
                <h4 style="font-size:0.85rem;font-weight:700;color:var(--primary);margin:0">💅 Detalhes da Prestação de Serviço</h4>
                
                <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:12px">
                  <div class="form-group">
                    <label class="form-label" style="font-size:0.75rem">CNAE de Serviço</label>
                    <input class="form-control" id="f-service-cnae" value="${a.cnae || Schedule.focusNfeConfig.defaultCnae || ''}" required style="font-size:0.8rem;padding:6px 10px" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-size:0.75rem">Valor dos Serviços (R$)</label>
                    <input class="form-control" type="number" step="0.01" min="0" id="f-service-value" value="${a.value || ''}" required style="font-size:0.8rem;padding:6px 10px" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" style="font-size:0.75rem">Descrição que constará na NFS-e</label>
                  <textarea class="form-control" id="f-service-description" rows="3" required style="font-size:0.8rem;padding:6px 10px;line-height:1.4">${Schedule.focusNfeConfig.defaultServiceDescription || ''}</textarea>
                </div>
              </div>

              <div class="modal-footer" style="padding:10px 0 0">
                <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('fiscal-emission-modal').classList.add('hidden')">Cancelar</button>
                <button type="button" class="btn btn-primary btn-sm" onclick="Schedule.submitFiscalNFSe('${a.id}', '${a.clientId}')" id="btn-submit-fiscal-nfse" style="display:inline-flex;align-items:center;gap:4px">
                  <span class="material-symbols-outlined" style="font-size:15px">check</span> Confirmar e Emitir Nota
                </button>
              </div>
            </form>
        </div>`;

        modal.onclick = (event) => {
            if (event.target === modal) modal.classList.add('hidden');
        };

        modal.classList.remove('hidden');
    },

    async searchFiscalCep() {
        const cepEl = document.getElementById('f-client-cep');
        const btn = document.getElementById('btn-f-search-cep');
        if (!cepEl) return;
        const cep = cepEl.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            App.showToast('CEP inválido!', 'error');
            return;
        }
        if (btn) { btn.disabled = true; btn.innerHTML = '...'; }
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (data.erro) {
                App.showToast('CEP não encontrado.', 'error');
            } else {
                document.getElementById('f-client-street').value = data.logradouro || '';
                document.getElementById('f-client-neighborhood').value = data.bairro || '';
                document.getElementById('f-client-city').value = data.localidade || '';
                document.getElementById('f-client-uf').value = data.uf || '';
                document.getElementById('f-client-number')?.focus();
            }
        } catch (err) {
            App.showToast('Erro ao buscar CEP: ' + err.message, 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = 'Buscar'; }
        }
    },

    async submitFiscalNFSe(apptId, clientId) {
        const btn = document.getElementById('btn-submit-fiscal-nfse');
        if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:16px;height:16px"></div> Enviando...'; }
        
        const clientName = document.getElementById('f-client-name').value.trim();
        const cpfCnpj = document.getElementById('f-client-cpf').value.trim();
        const email = document.getElementById('f-client-email').value.trim();
        const zipCode = document.getElementById('f-client-cep').value.trim();
        const street = document.getElementById('f-client-street').value.trim();
        const number = document.getElementById('f-client-number').value.trim();
        const complement = document.getElementById('f-client-complement').value.trim();
        const neighborhood = document.getElementById('f-client-neighborhood').value.trim();
        const city = document.getElementById('f-client-city').value.trim();
        const state = document.getElementById('f-client-uf').value.trim().toUpperCase();

        const serviceCnae = document.getElementById('f-service-cnae').value.trim();
        const serviceValue = parseFloat(document.getElementById('f-service-value').value) || 0;
        const serviceDescription = document.getElementById('f-service-description').value.trim();

        if (!clientName || !cpfCnpj || !email || !zipCode || !street || !number || !neighborhood || !city || !state || !serviceCnae || !serviceValue || !serviceDescription) {
            App.showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:15px">check</span> Confirmar e Emitir Nota'; }
            return;
        }

        try {
            const clientFiscalUpdate = {
                name: clientName,
                email: email,
                fiscalData: {
                    cpfCnpj,
                    address: {
                        zipCode, street, number, complement, neighborhood, city, state
                    }
                }
            };
            await Store.updateClient(clientId, clientFiscalUpdate);

            const uid = Store._uid();
            const emitFunction = firebase.functions().httpsCallable('emitFocusNFSe');
            
            const response = await emitFunction({
                studioUid: uid,
                bookingId: apptId,
                clientId,
                clientName,
                clientEmail: email,
                cpfCnpj,
                zipCode, street, number, complement, neighborhood, city, state,
                serviceCnae,
                serviceValue,
                serviceDescription
            });

            const result = response.data;
            if (result.status === 'success' || result.status === 'processing') {
                App.showToast('NFS-e enviada para processamento! 🧾', 'success');
                document.getElementById('fiscal-emission-modal').classList.add('hidden');
                
                // Recarregar agendamentos locais para atualizar
                await Schedule.loadView();
                
                // Achar agendamento atualizado para renderizar a seção fiscal de novo
                const appts = await Store.getAppointments();
                const a = appts.find(x => x.id === apptId);
                if (a) {
                    Schedule.renderFiscalSection(a);
                }
            } else {
                throw new Error(result.message || 'Erro ao emitir NFS-e.');
            }
        } catch (err) {
            App.showToast('Erro ao emitir NFS-e: ' + err.message, 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:15px">check</span> Confirmar e Emitir Nota'; }
        }
    },

    async checkInvoiceStatus(apptId) {
        try {
            const checkFunction = firebase.functions().httpsCallable('checkFocusNFSeStatus');
            const response = await checkFunction({
                studioUid: Store._uid(),
                bookingId: apptId
            });
            const result = response.data;
            if (result.status === 'authorized') {
                App.showToast('NFS-e Autorizada! ✅', 'success');
            } else if (result.status === 'error') {
                App.showToast('NFS-e rejeitada pela prefeitura: ' + (result.errorMessage || ''), 'error');
            } else {
                App.showToast('A NFS-e ainda está sendo processada.', 'info');
            }
            
            await Schedule.loadView();
            const appts = await Store.getAppointments();
            const a = appts.find(x => x.id === apptId);
            if (a) {
                Schedule.renderFiscalSection(a);
            }
        } catch (err) {
            App.showToast('Erro ao consultar status: ' + err.message, 'error');
        }
    }
};
