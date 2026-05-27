// === Schedule Page ===
const SchedulePage = {
    allAppointments: [],
    waitList: [],
    blockedSlots: [],
    // 3. Cores por serviço
    serviceColors: {
        'Manutenção': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-300' },
        'Novo Set': { bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-500', border: 'border-pink-300' },
        'Retoque': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-300' },
        'Remoção': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-300' },
        'Consulta': { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500', border: 'border-teal-300' },
        'Avaliação': { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-300' },
        'default': { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary', border: 'border-primary/30' }
    },

    render() {
        const today = new Date();
        const dayNames = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
        const monday = new Date(today); monday.setDate(today.getDate() - today.getDay() + 1);
        let daysHeader = '';
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday); d.setDate(monday.getDate() + i);
            const isToday = d.toDateString() === today.toDateString();
            daysHeader += `<div class="p-4 border-r border-outline-variant/10 text-center ${isToday?'bg-primary/5':''}">
                <span class="block text-[10px] font-bold ${isToday?'text-primary':'text-slate-400'} uppercase tracking-widest">${dayNames[d.getDay()]}</span>
                <span class="text-xl font-extrabold ${isToday?'text-primary':''}">${d.getDate()}</span>
            </div>`;
        }
        const hours = []; for (let h=8;h<=18;h++) hours.push(`<span>${String(h).padStart(2,'0')}:00</span>`);
        return `
        <div class="space-y-8 flex-1 flex overflow-hidden">
            <div class="flex-1 flex flex-col space-y-6">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Agenda Semanal</h2>
                        <p class="text-slate-500 font-medium">${monday.toLocaleDateString('pt-BR',{month:'long',day:'numeric'})} - ${new Date(monday.getTime()+6*86400000).toLocaleDateString('pt-BR',{month:'long',day:'numeric',year:'numeric'})}</p>
                    </div>
                    <div class="flex items-center gap-3 flex-wrap">
                        <div class="flex items-center bg-surface-container-low p-1.5 rounded-xl">
                            <button class="view-btn px-4 py-2 bg-surface-container-lowest shadow-sm text-sm font-bold rounded-lg text-primary" data-view="week">Semana</button>
                            <button class="view-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" data-view="day">Dia</button>
                            <button class="view-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" data-view="month">Mês</button>
                        </div>
                    </div>
                </div>
                <div class="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant/15 flex flex-col flex-1">
                    <div class="grid grid-cols-8 border-b border-outline-variant/10">
                        <div class="p-4 border-r border-outline-variant/10 bg-surface-container-low/50"></div>
                        ${daysHeader}
                    </div>
                    <div class="relative overflow-y-auto flex-1">
                        <div id="schedule-grid" class="grid grid-cols-8 divide-x divide-outline-variant/10 h-full min-h-[600px]">
                            <div class="flex flex-col text-right pr-4 py-2 space-y-12 text-[11px] font-bold text-slate-400">${hours.join('\n')}</div>
                            ${Array.from({length:7},(_,i)=>`<div class="relative group hover:bg-slate-50/50 cursor-pointer" data-day="${i}" onclick="SchedulePage.onGridClick(event,${i})"></div>`).join('')}
                        </div>
                    </div>
                </div>
                <!-- 3. Legenda de cores -->
                <div class="flex flex-wrap items-center gap-3 px-1">
                    <span class="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Legenda:</span>
                    ${Object.entries(this.serviceColors).filter(([k])=>k!=='default').map(([name,c])=>`<span class="inline-flex items-center gap-1.5 text-xs font-medium ${c.text}"><span class="w-2.5 h-2.5 rounded-full ${c.dot}"></span>${name}</span>`).join('')}
                    <span class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>Bloqueado</span>
                </div>
            </div>
            <!-- Sidebar -->
            <aside class="w-full md:w-80 ml-0 md:ml-8 space-y-6 flex flex-col md:h-full overflow-y-auto">
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-primary/5 p-4 rounded-3xl border border-primary/10"><p class="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Concluídos</p><p id="sched-done" class="text-2xl font-black text-primary">0</p></div>
                    <div class="bg-secondary/5 p-4 rounded-3xl border border-secondary/10"><p class="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">Pendentes</p><p id="sched-pending" class="text-2xl font-black text-secondary">0</p></div>
                </div>
                <!-- Ações rápidas -->
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="SchedulePage.showNewAppointmentModal()" class="py-2.5 bg-primary/10 hover:bg-primary/20 rounded-xl text-xs font-bold text-primary flex items-center justify-center gap-1.5 transition-colors"><span class="material-symbols-outlined text-sm">add</span>Agendar</button>
                    <button onclick="SchedulePage.showBlockSlotModal()" class="py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5 transition-colors"><span class="material-symbols-outlined text-sm">block</span>Bloquear</button>
                    <button onclick="SchedulePage.showAddToWaitlistModal()" class="py-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl text-xs font-bold text-amber-700 flex items-center justify-center gap-1.5 transition-colors"><span class="material-symbols-outlined text-sm">group_add</span>Fila Espera</button>
                    <button onclick="SchedulePage.showMaterialDeduction()" class="py-2.5 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold text-red-600 flex items-center justify-center gap-1.5 transition-colors"><span class="material-symbols-outlined text-sm">inventory</span>Baixa Mat.</button>
                </div>
                <!-- 4. Fila de Espera -->
                <section class="flex-1 space-y-3">
                    <div class="flex items-center justify-between"><h3 class="text-sm font-bold text-on-surface">Fila de Espera</h3><span id="waitlist-count" class="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">0</span></div>
                    <div id="sched-queue" class="space-y-2"><p class="text-xs text-on-surface-variant text-center py-4">Nenhum cliente na fila.</p></div>
                </section>
                <!-- Nota do dia -->
                <div class="bg-slate-900 rounded-[2rem] p-5 text-white overflow-hidden relative">
                    <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-primary rounded-full opacity-20 blur-2xl"></div>
                    <h4 class="font-bold text-xs mb-3">Nota do Dia</h4>
                    <p class="text-[10px] text-slate-400 leading-relaxed mb-3">Anote lembretes importantes.</p>
                    <button id="btn-edit-notes" class="w-full bg-white/10 hover:bg-white/20 transition-colors py-2 rounded-xl text-xs font-bold">Editar Notas</button>
                </div>
            </aside>
        </div>`;
    },

    async init() {
        document.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => { b.classList.remove('bg-surface-container-lowest','shadow-sm','text-primary','font-bold'); b.classList.add('text-slate-500','font-semibold'); });
            btn.classList.add('bg-surface-container-lowest','shadow-sm','text-primary','font-bold'); btn.classList.remove('text-slate-500','font-semibold');
        }));
        document.getElementById('btn-edit-notes')?.addEventListener('click', () => this.showNotesModal());
        this.loadBlockedSlots();
        this.loadWaitList();
        await this.loadAppointments();
    },

    async loadAppointments() {
        try {
            const appointments = await Store.getAppointments();
            this.allAppointments = appointments;
            const done = appointments.filter(a=>a.status==='completed').length;
            const pending = appointments.filter(a=>a.status!=='completed').length;
            document.getElementById('sched-done').textContent = String(done).padStart(2,'0');
            document.getElementById('sched-pending').textContent = String(pending).padStart(2,'0');
            this.renderEventsOnGrid(appointments);
        } catch(e) { console.warn('Schedule load error:', e); }
    },

    // Renderizar eventos no grid semanal com 3. CÓDIGO DE CORES
    renderEventsOnGrid(appointments) {
        const today = new Date(); const monday = new Date(today); monday.setDate(today.getDate()-today.getDay()+1); monday.setHours(0,0,0,0);
        const cols = document.querySelectorAll('#schedule-grid > div[data-day]');
        cols.forEach(col => { col.querySelectorAll('.sched-event,.sched-block').forEach(e=>e.remove()); });
        // Bloqueios
        this.blockedSlots.forEach(b => {
            const bDate = new Date(b.date); const dayIdx = Math.round((bDate-monday)/86400000);
            if (dayIdx < 0 || dayIdx > 6) return;
            const col = cols[dayIdx]; if (!col) return;
            const startH = parseInt(b.startTime.split(':')[0]), endH = parseInt(b.endTime.split(':')[0]);
            const top = (startH - 8) * 56 + 8, height = (endH - startH) * 56;
            col.insertAdjacentHTML('beforeend', `<div class="sched-block absolute left-1 right-1 rounded-lg bg-slate-200/80 border border-slate-300 border-dashed flex items-center justify-center cursor-pointer hover:bg-slate-300/80 transition-colors z-10" style="top:${top}px;height:${height}px" onclick="SchedulePage.removeBlock('${b.id}')" title="Clique para desbloquear">
                <span class="material-symbols-outlined text-slate-500 text-sm">block</span><span class="text-[10px] font-bold text-slate-500 ml-1">${b.reason||'Bloqueado'}</span></div>`);
        });
        // Eventos
        appointments.forEach(a => {
            const aDate = new Date(a.date.seconds ? a.date.seconds*1000 : a.date);
            const dayIdx = Math.round((new Date(aDate.getFullYear(),aDate.getMonth(),aDate.getDate()) - monday) / 86400000);
            if (dayIdx < 0 || dayIdx > 6) return;
            const col = cols[dayIdx]; if (!col) return;
            const h = aDate.getHours(), m = aDate.getMinutes();
            const top = (h - 8) * 56 + (m/60)*56 + 8;
            const sColor = this.serviceColors[a.service] || this.serviceColors.default;
            const isDone = a.status === 'completed';
            col.insertAdjacentHTML('beforeend', `<div class="sched-event absolute left-1 right-1 rounded-lg px-2 py-1.5 ${sColor.bg} border ${sColor.border} ${isDone?'opacity-50':''} cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all z-20" style="top:${top}px;min-height:42px" onclick="SchedulePage.showEventDetail('${a.id}')">
                <p class="text-[10px] font-black ${sColor.text} truncate">${a.clientName||'Cliente'}</p>
                <p class="text-[9px] ${sColor.text} opacity-70 truncate">${a.service||''} • ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}</p>
            </div>`);
        });
    },

    // 5. BLOQUEIO DE HORÁRIO
    onGridClick(event, dayIdx) {
        if (event.target.closest('.sched-event,.sched-block')) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const y = event.clientY - rect.top + event.currentTarget.scrollTop;
        const hour = Math.floor(y / 56) + 8;
        if (hour < 8 || hour > 18) return;
        // Menu rápido
        const modal = document.getElementById('modal-content');
        const today = new Date(); const monday = new Date(today); monday.setDate(today.getDate()-today.getDay()+1);
        const clickDate = new Date(monday); clickDate.setDate(monday.getDate()+dayIdx);
        const dateStr = clickDate.toISOString().split('T')[0];
        modal.innerHTML = `<div class="p-8"><h3 class="font-headline font-bold text-xl mb-4 flex items-center gap-2"><span class="material-symbols-outlined text-primary">more_time</span>${clickDate.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'short'})} às ${hour}:00</h3>
            <div class="grid grid-cols-2 gap-3">
                <button onclick="App.closeModal(); SchedulePage.showNewAppointmentModal('${dateStr}','${hour}:00')" class="p-4 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-colors text-center"><span class="material-symbols-outlined text-primary text-2xl mb-1">event</span><p class="text-xs font-bold text-primary">Novo Agendamento</p></button>
                <button onclick="App.closeModal(); SchedulePage.quickBlock('${dateStr}',${hour})" class="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors text-center"><span class="material-symbols-outlined text-slate-600 text-2xl mb-1">block</span><p class="text-xs font-bold text-slate-600">Bloquear Horário</p></button>
            </div>
            <button onclick="App.closeModal()" class="w-full mt-4 py-2.5 text-on-surface-variant font-bold text-sm hover:bg-surface-container-low rounded-xl">Cancelar</button>
        </div>`;
        App.openModal();
    },

    quickBlock(dateStr, hour) {
        const id = 'blk_' + Date.now();
        this.blockedSlots.push({ id, date: dateStr, startTime: `${hour}:00`, endTime: `${hour+1}:00`, reason: 'Bloqueado' });
        localStorage.setItem('ch_blocked_slots', JSON.stringify(this.blockedSlots));
        this.renderEventsOnGrid(this.allAppointments);
        App.showToast('Horário bloqueado!','success');
    },

    showBlockSlotModal() {
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `<div class="p-8"><h3 class="font-headline font-bold text-xl mb-4 flex items-center gap-2"><span class="material-symbols-outlined text-slate-600">block</span>Bloquear Horário</h3>
            <form id="block-form" class="space-y-4">
                <div class="grid grid-cols-3 gap-3">
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Data</label><input type="date" id="blk-date" required value="${tomorrow.toISOString().split('T')[0]}" class="w-full px-3 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm"></div>
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Início</label><input type="time" id="blk-start" required value="12:00" class="w-full px-3 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm"></div>
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Fim</label><input type="time" id="blk-end" required value="13:00" class="w-full px-3 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm"></div>
                </div>
                <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Motivo</label><input type="text" id="blk-reason" placeholder="Ex: Almoço, compromisso pessoal..." class="w-full px-3 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm"></div>
                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-5 py-2.5 text-on-surface-variant font-bold rounded-xl text-sm">Cancelar</button>
                    <button type="submit" class="px-5 py-2.5 bg-slate-700 text-white font-bold rounded-xl text-sm flex items-center gap-2"><span class="material-symbols-outlined text-sm">block</span>Bloquear</button>
                </div>
            </form></div>`;
        App.openModal();
        document.getElementById('block-form').addEventListener('submit', e => {
            e.preventDefault();
            const id = 'blk_'+Date.now();
            this.blockedSlots.push({ id, date: document.getElementById('blk-date').value, startTime: document.getElementById('blk-start').value, endTime: document.getElementById('blk-end').value, reason: document.getElementById('blk-reason').value || 'Bloqueado' });
            localStorage.setItem('ch_blocked_slots', JSON.stringify(this.blockedSlots));
            App.closeModal(); this.renderEventsOnGrid(this.allAppointments);
            App.showToast('Horário bloqueado!','success');
        });
    },

    removeBlock(id) {
        if (!confirm('Desbloquear este horário?')) return;
        this.blockedSlots = this.blockedSlots.filter(b=>b.id!==id);
        localStorage.setItem('ch_blocked_slots', JSON.stringify(this.blockedSlots));
        this.renderEventsOnGrid(this.allAppointments); App.showToast('Horário desbloqueado.','success');
    },

    loadBlockedSlots() { try { this.blockedSlots = JSON.parse(localStorage.getItem('ch_blocked_slots')||'[]'); } catch(e){ this.blockedSlots=[]; } },

    // 4. FILA DE ESPERA
    loadWaitList() {
        try { this.waitList = JSON.parse(localStorage.getItem('ch_waitlist')||'[]'); } catch(e){ this.waitList=[]; }
        this.renderWaitList();
    },

    renderWaitList() {
        const el = document.getElementById('sched-queue');
        document.getElementById('waitlist-count').textContent = this.waitList.length;
        if (this.waitList.length === 0) { el.innerHTML = '<p class="text-xs text-on-surface-variant text-center py-4">Nenhum cliente na fila.</p>'; return; }
        el.innerHTML = this.waitList.map((w,i) => `<div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high hover:bg-amber-50 transition-colors group">
            <span class="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">${i+1}</span>
            <div class="flex-1 min-w-0"><p class="font-bold text-sm text-on-surface truncate">${w.name}</p><p class="text-[10px] text-slate-500">${w.service||'—'} • ${w.phone||''}</p></div>
            <button class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-primary/10 rounded-lg transition-all" onclick="SchedulePage.checkInFromWaitlist(${i})" title="Check-in: agendar"><span class="material-symbols-outlined text-primary text-sm">event_available</span></button>
            <button class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all" onclick="SchedulePage.removeFromWaitlist(${i})" title="Remover"><span class="material-symbols-outlined text-red-400 text-sm">close</span></button>
        </div>`).join('');
    },

    showAddToWaitlistModal() {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `<div class="p-8"><h3 class="font-headline font-bold text-xl mb-4 flex items-center gap-2"><span class="material-symbols-outlined text-amber-600">group_add</span>Adicionar à Fila de Espera</h3>
            <form id="waitlist-form" class="space-y-4">
                <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Nome do Cliente *</label><input type="text" id="wl-name" required placeholder="Nome completo" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface"></div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Serviço</label><input type="text" id="wl-service" placeholder="Ex: Manutenção" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface"></div>
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Telefone</label><input type="tel" id="wl-phone" placeholder="(11) 99999-9999" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface"></div>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-5 py-2.5 text-on-surface-variant font-bold rounded-xl text-sm">Cancelar</button>
                    <button type="submit" class="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm flex items-center gap-2"><span class="material-symbols-outlined text-sm">add</span>Adicionar</button>
                </div>
            </form></div>`;
        App.openModal();
        document.getElementById('waitlist-form').addEventListener('submit', e => {
            e.preventDefault();
            this.waitList.push({ name: document.getElementById('wl-name').value, service: document.getElementById('wl-service').value, phone: document.getElementById('wl-phone').value, addedAt: new Date().toISOString() });
            localStorage.setItem('ch_waitlist', JSON.stringify(this.waitList));
            App.closeModal(); this.renderWaitList(); App.showToast('Cliente adicionado à fila!','success');
        });
    },

    // Check-in: mover da fila para agendamento
    checkInFromWaitlist(idx) {
        const w = this.waitList[idx]; if (!w) return;
        this.showNewAppointmentModal(null, null, w.name, w.service);
        // Remove da fila após abrir modal
        this.waitList.splice(idx, 1);
        localStorage.setItem('ch_waitlist', JSON.stringify(this.waitList));
        this.renderWaitList();
    },

    removeFromWaitlist(idx) {
        if (!confirm('Remover da fila de espera?')) return;
        this.waitList.splice(idx, 1);
        localStorage.setItem('ch_waitlist', JSON.stringify(this.waitList));
        this.renderWaitList(); App.showToast('Removido da fila.','success');
    },

    // 1. GOOGLE CALENDAR SYNC + AGENDAMENTO
    showNewAppointmentModal(prefillDate, prefillTime, prefillName, prefillService) {
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
        const dateVal = prefillDate || tomorrow.toISOString().split('T')[0];
        const timeVal = prefillTime || '10:00';
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `<div class="p-8"><h3 class="font-headline font-bold text-xl mb-4 flex items-center gap-2"><span class="material-symbols-outlined text-primary">event</span>Novo Agendamento</h3>
            <form id="new-apt-form" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Cliente *</label><input type="text" id="apt-client" required value="${prefillName||''}" placeholder="Nome do cliente" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface"></div>
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Serviço *</label>
                        <select id="apt-service" required class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface">
                            ${Object.keys(this.serviceColors).filter(k=>k!=='default').map(s=>`<option value="${s}" ${s===prefillService?'selected':''}>${s}</option>`).join('')}
                            <option value="Outro">Outro</option>
                        </select></div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Data *</label><input type="date" id="apt-date" required value="${dateVal}" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface"></div>
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Horário *</label><input type="time" id="apt-time" required value="${timeVal}" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface"></div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-xl"><input type="checkbox" id="apt-gcal" class="w-4 h-4 accent-blue-600" checked><label for="apt-gcal" class="text-xs font-semibold text-blue-700 flex items-center gap-1"><span class="material-symbols-outlined text-sm">calendar_month</span>Adicionar ao Google Calendar</label></div>
                <div class="flex items-center gap-3 p-3 bg-green-50 rounded-xl"><input type="checkbox" id="apt-whatsapp" class="w-4 h-4 accent-green-600" checked><label for="apt-whatsapp" class="text-xs font-semibold text-green-700 flex items-center gap-1"><span class="material-symbols-outlined text-sm">chat</span>Enviar lembrete WhatsApp (24h antes)</label></div>
                <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Telefone (para lembrete)</label><input type="tel" id="apt-phone" placeholder="(11) 99999-9999" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface"></div>
                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-5 py-2.5 text-on-surface-variant font-bold rounded-xl text-sm">Cancelar</button>
                    <button type="submit" class="px-5 py-2.5 vitality-gradient text-white font-bold rounded-xl text-sm flex items-center gap-2"><span class="material-symbols-outlined text-sm">event_available</span>Agendar</button>
                </div>
            </form></div>`;
        App.openModal();
        document.getElementById('new-apt-form').addEventListener('submit', async e => {
            e.preventDefault();
            const d = document.getElementById('apt-date').value, t = document.getElementById('apt-time').value;
            const dateObj = new Date(`${d}T${t}`);
            const clientName = document.getElementById('apt-client').value;
            const service = document.getElementById('apt-service').value;
            const phone = document.getElementById('apt-phone').value;
            const addGcal = document.getElementById('apt-gcal').checked;
            const sendWA = document.getElementById('apt-whatsapp').checked;
            try {
                await Store.addAppointment({ clientName, service, date: dateObj, phone, status: 'scheduled' });
                // 1. Google Calendar
                if (addGcal) this.addToGoogleCalendar(clientName, service, dateObj);
                // 2. WhatsApp reminder
                if (sendWA && phone) this.scheduleWhatsAppReminder(clientName, service, dateObj, phone);
                App.closeModal(); App.showToast('Agendamento criado!','success');
                this.loadAppointments();
            } catch(err) { App.showToast('Erro: '+err.message,'error'); }
        });
    },

    // 1. SYNC GOOGLE CALENDAR (via URL scheme — abre no navegador)
    addToGoogleCalendar(client, service, date) {
        const start = date.toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
        const end = new Date(date.getTime()+3600000).toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service+' — '+client)}&dates=${start}/${end}&details=${encodeURIComponent('Agendamento Studiobeauty: '+service+' com '+client)}`;
        window.open(url, '_blank');
    },

    // 2. LEMBRETE WHATSAPP (abre mensagem pré-formatada)
    scheduleWhatsAppReminder(client, service, date, phone) {
        const cleanPhone = phone.replace(/\D/g,'');
        const dateStr = date.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
        const timeStr = date.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
        const msg = `Olá ${client}! 😊\n\nLembrando do seu agendamento:\n📋 *${service}*\n📅 ${dateStr}\n⏰ ${timeStr}\n\nConfirme sua presença respondendo esta mensagem. Até lá! ✨`;
        const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
        // Salva o link para abertura posterior (24h antes)
        const reminders = JSON.parse(localStorage.getItem('ch_wa_reminders')||'[]');
        reminders.push({ client, service, date: date.toISOString(), phone: cleanPhone, url, sent: false });
        localStorage.setItem('ch_wa_reminders', JSON.stringify(reminders));
        App.showToast('Lembrete WhatsApp configurado!','info');
    },

    showEventDetail(id) {
        const a = this.allAppointments.find(x=>x.id===id); if (!a) return;
        const aDate = new Date(a.date.seconds?a.date.seconds*1000:a.date);
        const sc = this.serviceColors[a.service]||this.serviceColors.default;
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `<div class="p-8"><div class="flex items-center gap-3 mb-4"><div class="w-3 h-8 rounded-full ${sc.dot}"></div><div><h3 class="font-headline font-bold text-xl">${a.clientName||'Cliente'}</h3><p class="text-sm text-on-surface-variant">${a.service||'Serviço'}</p></div></div>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="p-3 bg-surface-container-high rounded-xl"><p class="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">Data/Hora</p><p class="font-bold text-sm">${aDate.toLocaleDateString('pt-BR')} às ${aDate.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</p></div>
                <div class="p-3 bg-surface-container-high rounded-xl"><p class="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">Status</p><p class="font-bold text-sm">${a.status==='completed'?'✅ Concluído':'⏳ Pendente'}</p></div>
            </div>
            <div class="flex gap-2 flex-wrap">
                ${a.status!=='completed'?`<button onclick="SchedulePage.completeAppointment('${id}')" class="px-4 py-2.5 bg-green-500 text-white font-bold rounded-xl text-xs flex items-center gap-1"><span class="material-symbols-outlined text-sm">check</span>Concluir</button>`:''}
                ${a.phone?`<button onclick="window.open('https://wa.me/55${(a.phone||'').replace(/\\D/g,'')}','_blank')" class="px-4 py-2.5 bg-green-50 text-green-700 font-bold rounded-xl text-xs flex items-center gap-1"><span class="material-symbols-outlined text-sm">chat</span>WhatsApp</button>`:''}
                <button onclick="SchedulePage.cancelAppointment('${id}')" class="px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl text-xs flex items-center gap-1"><span class="material-symbols-outlined text-sm">cancel</span>Cancelar</button>
                <button onclick="App.closeModal()" class="px-4 py-2.5 text-on-surface-variant font-bold rounded-xl text-xs">Fechar</button>
            </div></div>`;
        App.openModal();
    },

    async completeAppointment(id) { await Store.updateAppointment(id,{status:'completed'}); App.closeModal(); App.showToast('Concluído!','success'); this.loadAppointments(); },
    async cancelAppointment(id) { if(!confirm('Cancelar agendamento?'))return; await Store.deleteAppointment(id); App.closeModal(); App.showToast('Cancelado.','success'); this.loadAppointments(); },

    showNotesModal() {
        const saved = localStorage.getItem('ch_daily_notes')||'';
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `<div class="p-8"><h3 class="font-headline font-bold text-xl mb-4">Nota do Dia</h3>
            <textarea id="daily-notes" rows="6" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface resize-none">${saved}</textarea>
            <div class="flex justify-end gap-3 pt-4 mt-4 border-t border-outline-variant/10">
                <button onclick="App.closeModal()" class="px-5 py-2.5 text-on-surface-variant font-bold rounded-xl text-sm">Cancelar</button>
                <button onclick="localStorage.setItem('ch_daily_notes',document.getElementById('daily-notes').value); App.showToast('Nota salva!','success'); App.closeModal();" class="px-5 py-2.5 vitality-gradient text-white font-bold rounded-xl text-sm">Salvar</button>
            </div></div>`;
        App.openModal();
    },

    // Baixa de materiais (mantido)
    async showMaterialDeduction() {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `<div class="p-8"><div class="flex items-center gap-3 mb-6"><span class="material-symbols-outlined text-amber-600 text-2xl">inventory</span><div><h3 class="font-headline font-bold text-xl">Baixa de Materiais</h3><p class="text-on-surface-variant text-sm">Registre materiais utilizados no atendimento.</p></div></div><div class="text-center py-4"><div class="spinner mx-auto mb-2"></div></div></div>`;
        App.openModal();
        try {
            const items = await Store.getInventory();
            const content = document.querySelector('#modal-content > div');
            content.querySelector('.text-center')?.remove();
            if (items.length===0) { content.insertAdjacentHTML('beforeend','<p class="text-center text-on-surface-variant py-6">Nenhum item.</p>'); return; }
            let html = '<div class="space-y-2 max-h-[300px] overflow-y-auto mb-4">';
            items.forEach(item => {
                html += `<div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high"><input type="checkbox" class="material-check w-4 h-4 accent-primary" data-id="${item.id}" data-name="${item.name}" data-qty="${item.quantity||0}"/><div class="flex-1"><p class="font-bold text-sm">${item.name}</p><p class="text-[10px] text-slate-500">Estoque: ${item.quantity||0}</p></div><input type="number" class="material-deduct-qty w-14 px-2 py-1.5 bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-center text-sm font-bold hidden" value="1" min="1" max="${item.quantity||0}"/></div>`;
            });
            html += '</div>';
            content.insertAdjacentHTML('beforeend', html);
            content.insertAdjacentHTML('beforeend','<div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10"><button onclick="App.closeModal()" class="px-5 py-2.5 text-on-surface-variant font-bold rounded-xl text-sm">Cancelar</button><button onclick="SchedulePage.confirmDeduction()" class="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm flex items-center gap-2"><span class="material-symbols-outlined text-sm">remove_circle</span>Confirmar</button></div>');
            document.querySelectorAll('.material-check').forEach(cb => cb.addEventListener('change', () => { cb.closest('div.flex').querySelector('.material-deduct-qty').classList.toggle('hidden',!cb.checked); }));
        } catch(e) { App.showToast('Erro ao carregar inventário','error'); }
    },

    async confirmDeduction() {
        const checks = document.querySelectorAll('.material-check:checked');
        if (checks.length===0) { App.showToast('Selecione materiais.','info'); return; }
        let n=0;
        for (const cb of checks) {
            const id=cb.dataset.id, name=cb.dataset.name, cur=parseInt(cb.dataset.qty)||0;
            const qty=parseInt(cb.closest('div.flex').querySelector('.material-deduct-qty').value)||1;
            const nw=Math.max(0,cur-qty);
            try { await Store.updateInventoryItem(id,{quantity:nw}); await Store.addMovementLog({itemId:id,itemName:name,type:'saída',oldQty:cur,newQty:nw,delta:-qty,note:'Baixa via Agenda'}); n++; } catch(e){}
        }
        App.closeModal(); App.showToast(`${n} material(is) atualizado(s)!`,'success');
    }
};
