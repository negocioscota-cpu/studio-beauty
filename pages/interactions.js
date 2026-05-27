// === Interactions Page ===
const InteractionsPage = {
    allInteractions: [],
    currentFilter: 'all',
    filterColors: {
        all:      { bg: 'vitality-gradient', text: 'text-white', inactive: 'bg-slate-100 text-slate-600 hover:bg-slate-200' },
        service:  { bg: 'bg-blue-500', text: 'text-white', inactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-200' },
        support:  { bg: 'bg-amber-500', text: 'text-white', inactive: 'bg-amber-50 text-amber-700 hover:bg-amber-100 ring-1 ring-amber-200' },
        feedback: { bg: 'bg-purple-500', text: 'text-white', inactive: 'bg-purple-50 text-purple-700 hover:bg-purple-100 ring-1 ring-purple-200' },
        sale:     { bg: 'bg-emerald-500', text: 'text-white', inactive: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200' },
        followup: { bg: 'bg-indigo-500', text: 'text-white', inactive: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ring-1 ring-indigo-200' }
    },
    typeConfig: {
        service:  { icon: 'build', dotColor: 'bg-blue-500', lineColor: 'bg-blue-200', pillBg: 'bg-blue-100', pillText: 'text-blue-700', label: 'Serviço' },
        support:  { icon: 'support_agent', dotColor: 'bg-amber-500', lineColor: 'bg-amber-200', pillBg: 'bg-amber-100', pillText: 'text-amber-700', label: 'Suporte' },
        feedback: { icon: 'rate_review', dotColor: 'bg-purple-500', lineColor: 'bg-purple-200', pillBg: 'bg-purple-100', pillText: 'text-purple-700', label: 'Feedback' },
        sale:     { icon: 'shopping_cart', dotColor: 'bg-emerald-500', lineColor: 'bg-emerald-200', pillBg: 'bg-emerald-100', pillText: 'text-emerald-700', label: 'Venda' },
        followup: { icon: 'follow_the_signs', dotColor: 'bg-indigo-500', lineColor: 'bg-indigo-200', pillBg: 'bg-indigo-100', pillText: 'text-indigo-700', label: 'Follow-up' }
    },
    statusConfig: {
        pending:     { label: 'Pendente', icon: 'schedule', bg: 'bg-red-100', text: 'text-red-700' },
        in_progress: { label: 'Em Andamento', icon: 'autorenew', bg: 'bg-amber-100', text: 'text-amber-700' },
        completed:   { label: 'Concluída', icon: 'check_circle', bg: 'bg-green-100', text: 'text-green-700' }
    },
    sentimentConfig: {
        positive: { label: 'Satisfeito', icon: 'sentiment_satisfied', color: 'text-green-600', bg: 'bg-green-50' },
        neutral:  { label: 'Neutro', icon: 'sentiment_neutral', color: 'text-slate-500', bg: 'bg-slate-50' },
        negative: { label: 'Insatisfeito', icon: 'sentiment_dissatisfied', color: 'text-red-600', bg: 'bg-red-50' }
    },
    quickTemplates: [
        { label: 'Dúvida resolvida?', msg: 'Olá! Sua dúvida foi resolvida? Estou à disposição para ajudar. 😊' },
        { label: 'Gostou do serviço?', msg: 'Olá! Gostaria de saber se ficou satisfeito(a) com o nosso serviço. Seu feedback é muito importante! ⭐' },
        { label: 'Agendar retorno', msg: 'Olá! Que tal agendar seu próximo atendimento? Temos horários disponíveis essa semana. 📅' },
        { label: 'Promoção especial', msg: 'Olá! Temos uma promoção especial para clientes como você. Gostaria de saber mais? 🎉' }
    ],

    render() {
        const skel = `<div class="flex gap-6 animate-pulse"><div class="flex flex-col items-center"><div class="w-10 h-10 rounded-full bg-slate-200"></div><div class="w-0.5 flex-1 bg-slate-100 mt-2"></div></div><div class="bg-surface-container-lowest rounded-2xl p-6 flex-1 mb-6 border border-outline-variant/10"><div class="h-4 w-40 bg-slate-200 rounded-lg mb-3"></div><div class="h-3 w-64 bg-slate-100 rounded-lg mb-2"></div><div class="h-3 w-32 bg-slate-100 rounded-lg"></div></div></div>`;
        return `
        <div class="space-y-8 max-w-[1400px] mobile-full-width mx-auto">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <p class="text-sm text-on-surface-variant mb-1">Menu › <span class="text-primary font-semibold">Interações</span></p>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight">Interações</h2>
                    <p class="text-on-surface-variant mt-1">Acompanhe serviços prestados e o relacionamento com seus clientes.</p>
                </div>
                <button id="btn-new-interaction" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2">
                    <span class="material-symbols-outlined">add_circle</span> Nova Interação
                </button>
            </div>
            <!-- Summary Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mobile-grid-2x2">
                <div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10"><div class="flex items-center gap-3 mb-2"><div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><span class="material-symbols-outlined text-primary">forum</span></div><div><p class="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Total</p><p id="stat-total-interactions" class="text-2xl font-black text-on-surface">0</p></div></div></div>
                <div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10"><div class="flex items-center gap-3 mb-2"><div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><span class="material-symbols-outlined text-green-600">check_circle</span></div><div><p class="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Concluídas</p><p id="stat-completed" class="text-2xl font-black text-green-700">0</p></div></div></div>
                <div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10"><div class="flex items-center gap-3 mb-2"><div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><span class="material-symbols-outlined text-amber-600">pending</span></div><div><p class="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Em Andamento</p><p id="stat-in-progress" class="text-2xl font-black text-amber-700">0</p></div></div></div>
                <div id="card-pending" class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10 transition-all duration-300"><div class="flex items-center gap-3 mb-2"><div id="pending-icon-wrap" class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center relative"><span class="material-symbols-outlined text-red-600">priority_high</span></div><div><p class="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Pendentes</p><p id="stat-pending-int" class="text-2xl font-black text-red-700">0</p></div></div></div>
            </div>
            <!-- Sentiment Mini-Chart -->
            <div id="sentiment-chart-area" class="hidden bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
                <p class="text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-3">Análise de Sentimento</p>
                <div class="flex items-center gap-4">
                    <div id="sentiment-bar" class="flex-1 h-5 rounded-full overflow-hidden bg-slate-100 flex"></div>
                    <div id="sentiment-labels" class="flex gap-4 text-xs font-bold"></div>
                </div>
            </div>
            <!-- Filters -->
            <div class="flex items-center gap-3 flex-wrap">
                <button class="int-filter-btn px-5 py-2.5 rounded-full text-sm font-bold transition-all vitality-gradient text-white" data-filter="all">Todas</button>
                <button class="int-filter-btn px-5 py-2.5 rounded-full text-sm font-bold transition-all bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-200" data-filter="service"><span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue-500"></span>Serviço</span></button>
                <button class="int-filter-btn px-5 py-2.5 rounded-full text-sm font-bold transition-all bg-amber-50 text-amber-700 hover:bg-amber-100 ring-1 ring-amber-200" data-filter="support"><span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500"></span>Suporte</span></button>
                <button class="int-filter-btn px-5 py-2.5 rounded-full text-sm font-bold transition-all bg-purple-50 text-purple-700 hover:bg-purple-100 ring-1 ring-purple-200" data-filter="feedback"><span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-purple-500"></span>Feedback</span></button>
                <button class="int-filter-btn px-5 py-2.5 rounded-full text-sm font-bold transition-all bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200" data-filter="sale"><span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>Venda</span></button>
                <button class="int-filter-btn px-5 py-2.5 rounded-full text-sm font-bold transition-all bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ring-1 ring-indigo-200" data-filter="followup"><span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-indigo-500"></span>Follow-up</span></button>
            </div>
            <!-- Timeline -->
            <div id="interactions-list" class="relative"><div class="pl-1">${skel.repeat(3)}</div></div>
        </div>`;
    },

    async init() {
        document.querySelectorAll('.int-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveFilter(btn.dataset.filter);
                this.currentFilter = btn.dataset.filter;
                this.applyFilter(btn.dataset.filter);
            });
        });
        document.getElementById('btn-new-interaction').addEventListener('click', () => this.showNewInteractionModal());
        await this.loadInteractions();
    },

    setActiveFilter(af) {
        document.querySelectorAll('.int-filter-btn').forEach(btn => {
            const f = btn.dataset.filter, c = this.filterColors[f];
            btn.className = f === af
                ? `int-filter-btn px-5 py-2.5 rounded-full text-sm font-bold transition-all ${c.bg} ${c.text}`
                : `int-filter-btn px-5 py-2.5 rounded-full text-sm font-bold transition-all ${c.inactive}`;
        });
    },

    async loadInteractions() {
        try {
            this.allInteractions = await Store.getInteractions();
            this.updateStats(this.allInteractions);
            this.updateSentimentChart(this.allInteractions);
            this.applyFilter(this.currentFilter);
        } catch (e) {
            document.getElementById('interactions-list').innerHTML = `<p class="text-error text-center py-8">Erro ao carregar: ${e.message}</p>`;
        }
    },

    updateStats(items) {
        const t = items.length, co = items.filter(i=>i.status==='completed').length, ip = items.filter(i=>i.status==='in_progress').length, pe = items.filter(i=>i.status==='pending').length;
        document.getElementById('stat-total-interactions').textContent = t;
        document.getElementById('stat-completed').textContent = co;
        document.getElementById('stat-in-progress').textContent = ip;
        document.getElementById('stat-pending-int').textContent = pe;
        const card = document.getElementById('card-pending'), iw = document.getElementById('pending-icon-wrap'), pn = document.getElementById('stat-pending-int');
        if (pe > 0) {
            card.className = 'bg-red-50 rounded-2xl p-5 shadow-sm border-2 border-red-300 transition-all duration-300';
            iw.className = 'w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center relative';
            iw.querySelector('.material-symbols-outlined').className = 'material-symbols-outlined text-white animate-pulse';
            pn.className = 'text-2xl font-black text-red-600 animate-pulse';
            if (!iw.querySelector('.pulse-ring')) iw.insertAdjacentHTML('beforeend','<span class="pulse-ring absolute inset-0 rounded-xl border-2 border-red-400 animate-ping opacity-50"></span>');
        } else {
            card.className = 'bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10 transition-all duration-300';
            iw.className = 'w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center relative';
            iw.querySelector('.material-symbols-outlined').className = 'material-symbols-outlined text-red-600';
            pn.className = 'text-2xl font-black text-red-700';
            iw.querySelector('.pulse-ring')?.remove();
        }
    },

    // 2. ANÁLISE DE SENTIMENTO - barra visual
    updateSentimentChart(items) {
        const area = document.getElementById('sentiment-chart-area');
        if (items.length === 0) { area.classList.add('hidden'); return; }
        area.classList.remove('hidden');
        const pos = items.filter(i=>i.sentiment==='positive').length, neg = items.filter(i=>i.sentiment==='negative').length, neu = items.length - pos - neg;
        const pP = Math.round(pos/items.length*100), pN = Math.round(neg/items.length*100), pNe = 100 - pP - pN;
        document.getElementById('sentiment-bar').innerHTML = `
            <div class="bg-green-400 h-full transition-all" style="width:${pP}%"></div>
            <div class="bg-slate-300 h-full transition-all" style="width:${pNe}%"></div>
            <div class="bg-red-400 h-full transition-all" style="width:${pN}%"></div>`;
        document.getElementById('sentiment-labels').innerHTML = `
            <span class="flex items-center gap-1 text-green-600"><span class="material-symbols-outlined text-sm">sentiment_satisfied</span>${pP}%</span>
            <span class="flex items-center gap-1 text-slate-500"><span class="material-symbols-outlined text-sm">sentiment_neutral</span>${pNe}%</span>
            <span class="flex items-center gap-1 text-red-600"><span class="material-symbols-outlined text-sm">sentiment_dissatisfied</span>${pN}%</span>`;
    },

    applyFilter(f) {
        const filtered = f === 'all' ? this.allInteractions : this.allInteractions.filter(i => i.type === f);
        this.renderTimeline(filtered);
    },

    renderTimeline(items) {
        const list = document.getElementById('interactions-list');
        if (items.length === 0) {
            list.innerHTML = `<div class="flex flex-col items-center justify-center py-20">
                <div class="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6"><span class="material-symbols-outlined text-5xl text-primary/40">forum</span></div>
                <p class="text-on-surface font-bold text-xl mb-2">Nenhuma interação registrada</p>
                <p class="text-on-surface-variant text-sm mb-8 text-center max-w-sm">Comece registrando sua primeira interação para acompanhar o relacionamento com seus clientes.</p>
                <button onclick="InteractionsPage.showNewInteractionModal()" class="px-8 py-4 vitality-gradient text-white font-bold rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.03] transition-transform flex items-center gap-3 text-base">
                    <span class="material-symbols-outlined text-2xl">add_circle</span> Registrar Primeira Interação
                </button></div>`;
            return;
        }
        let html = '<div class="relative pl-1">';
        items.forEach((item, idx) => {
            const type = this.typeConfig[item.type] || this.typeConfig.service;
            const status = this.statusConfig[item.status] || this.statusConfig.pending;
            const sentiment = this.sentimentConfig[item.sentiment] || this.sentimentConfig.neutral;
            const isLast = idx === items.length - 1, isPending = item.status === 'pending';
            const dateStr = item.date ? new Date(item.date.seconds ? item.date.seconds * 1000 : item.date).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
            const canSchedule = item.type === 'sale' || item.type === 'followup';
            const attachments = item.attachments || [];

            html += `<div class="flex gap-5 group">
                <div class="flex flex-col items-center">
                    <div class="w-11 h-11 rounded-full ${type.dotColor} flex items-center justify-center shadow-lg shrink-0 z-10 ${isPending ? 'ring-4 ring-red-200 animate-pulse' : ''}">
                        <span class="material-symbols-outlined text-white text-lg">${type.icon}</span>
                    </div>
                    ${!isLast ? `<div class="w-0.5 flex-1 ${type.lineColor} mt-1 mb-1 min-h-[20px]"></div>` : ''}
                </div>
                <div class="flex-1 ${isLast ? '' : 'mb-5'}">
                    <div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border ${isPending ? 'border-red-200 bg-red-50/30' : 'border-outline-variant/10'} hover:shadow-md transition-all group-hover:translate-x-1 duration-200">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 flex-wrap mb-1.5">
                                    <h3 class="font-bold text-on-surface text-base">${item.clientName || 'Cliente'}</h3>
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${type.pillBg} ${type.pillText}">${type.label}</span>
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text} flex items-center gap-1">
                                        ${isPending ? '<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>' : ''}${status.label}
                                    </span>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${sentiment.bg} ${sentiment.color} flex items-center gap-0.5">
                                        <span class="material-symbols-outlined text-xs">${sentiment.icon}</span>${sentiment.label}
                                    </span>
                                </div>
                                <p class="text-sm text-on-surface-variant leading-relaxed mb-2">${item.description || 'Sem descrição'}</p>
                                ${attachments.length > 0 ? `<div class="flex gap-2 mb-2 flex-wrap">${attachments.map(a=>`<a href="${a}" target="_blank" class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100"><span class="material-symbols-outlined text-sm">attach_file</span>Anexo</a>`).join('')}</div>` : ''}
                                <div class="flex items-center gap-4 text-xs text-on-surface-variant/70">
                                    <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">calendar_today</span>${dateStr}</span>
                                    ${item.channel ? `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">language</span>${item.channel}</span>` : ''}
                                    ${item.followUpDate ? `<span class="flex items-center gap-1 text-indigo-600 font-semibold"><span class="material-symbols-outlined text-sm">notifications_active</span>Follow-up: ${new Date(item.followUpDate.seconds?item.followUpDate.seconds*1000:item.followUpDate).toLocaleDateString('pt-BR')}</span>` : ''}
                                </div>
                            </div>
                            <div class="flex flex-col items-center gap-1 shrink-0">
                                <button class="btn-status-int p-2 hover:bg-surface-container-high rounded-lg transition-colors" data-id="${item.id}" data-status="${item.status}" title="Alterar status"><span class="material-symbols-outlined text-lg ${status.text}">${status.icon}</span></button>
                                <button class="btn-quick-reply p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600" data-id="${item.id}" data-client="${item.clientName||''}" title="Resposta Rápida"><span class="material-symbols-outlined text-lg">quickreply</span></button>
                                <button class="btn-followup-reminder p-2 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-500" data-id="${item.id}" data-client="${item.clientName||''}" title="Lembrete Follow-up"><span class="material-symbols-outlined text-lg">alarm_add</span></button>
                                ${canSchedule ? `<button class="btn-to-schedule p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary" data-id="${item.id}" data-client-id="${item.clientId||''}" data-client="${item.clientName||''}" data-type="${item.type}" title="Criar Agendamento"><span class="material-symbols-outlined text-lg">event</span></button>` : ''}
                                <button class="btn-attach p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-500" data-id="${item.id}" title="Anexar Foto/Doc"><span class="material-symbols-outlined text-lg">attach_file</span></button>
                                <button class="btn-delete-int p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" data-id="${item.id}" title="Excluir"><span class="material-symbols-outlined text-lg">delete</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        });
        html += '</div>';
        list.innerHTML = html;
        this.attachEventHandlers();
    },

    attachEventHandlers() {
        document.querySelectorAll('.btn-delete-int').forEach(b => b.addEventListener('click', async e => {
            if (confirm('Deseja excluir esta interação?')) { await Store.deleteInteraction(e.currentTarget.dataset.id); App.showToast('Excluída.','success'); this.loadInteractions(); }
        }));
        document.querySelectorAll('.btn-status-int').forEach(b => b.addEventListener('click', async e => {
            const ns = {pending:'in_progress',in_progress:'completed',completed:'pending'};
            await Store.updateInteraction(e.currentTarget.dataset.id, {status: ns[e.currentTarget.dataset.status]});
            App.showToast('Status atualizado!','success'); this.loadInteractions();
        }));
        // 4. Resposta Rápida
        document.querySelectorAll('.btn-quick-reply').forEach(b => b.addEventListener('click', e => this.showQuickReplyModal(e.currentTarget.dataset.client)));
        // 1. Lembrete Follow-up
        document.querySelectorAll('.btn-followup-reminder').forEach(b => b.addEventListener('click', e => this.showFollowUpModal(e.currentTarget.dataset.id, e.currentTarget.dataset.client)));
        // 5. Vínculo com Agendamento
        document.querySelectorAll('.btn-to-schedule').forEach(b => b.addEventListener('click', e => this.showCreateAppointmentModal(e.currentTarget.dataset)));
        // 3. Anexos
        document.querySelectorAll('.btn-attach').forEach(b => b.addEventListener('click', e => this.handleAttachment(e.currentTarget.dataset.id)));
    },

    // 1. LEMBRETE DE FOLLOW-UP
    showFollowUpModal(intId, clientName) {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `<div class="p-8">
            <h3 class="font-headline font-bold text-2xl mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-indigo-500">alarm_add</span>Agendar Lembrete de Follow-up</h3>
            <p class="text-on-surface-variant text-sm mb-6">Cliente: <strong>${clientName}</strong></p>
            <form id="followup-form" class="space-y-4">
                <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Retornar em</label>
                    <div class="grid grid-cols-4 gap-2" id="followup-days">
                        <button type="button" class="fu-day-btn px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors" data-days="3">3 dias</button>
                        <button type="button" class="fu-day-btn px-4 py-3 rounded-xl bg-indigo-500 text-white font-bold" data-days="7">7 dias</button>
                        <button type="button" class="fu-day-btn px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors" data-days="15">15 dias</button>
                        <button type="button" class="fu-day-btn px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors" data-days="30">30 dias</button>
                    </div>
                </div>
                <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Mensagem do lembrete</label>
                    <textarea id="fu-message" rows="2" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface resize-none focus:ring-2 focus:ring-primary/20" placeholder="Ex: Perguntar se gostou do serviço...">Retornar contato — perguntar ao cliente se gostou do serviço.</textarea>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"><span class="material-symbols-outlined">alarm_on</span>Agendar Lembrete</button>
                </div>
            </form></div>`;
        App.openModal();
        let selectedDays = 7;
        document.querySelectorAll('.fu-day-btn').forEach(btn => btn.addEventListener('click', () => {
            document.querySelectorAll('.fu-day-btn').forEach(b=>{b.className='fu-day-btn px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors';});
            btn.className='fu-day-btn px-4 py-3 rounded-xl bg-indigo-500 text-white font-bold';
            selectedDays = parseInt(btn.dataset.days);
        }));
        document.getElementById('followup-form').addEventListener('submit', async e => {
            e.preventDefault();
            const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + selectedDays);
            await Store.addReminder({ interactionId: intId, clientName, dueDate, message: document.getElementById('fu-message').value });
            await Store.updateInteraction(intId, { followUpDate: dueDate });
            App.closeModal(); App.showToast(`Lembrete agendado para ${dueDate.toLocaleDateString('pt-BR')}!`,'success');
            this.loadInteractions();
        });
    },

    // 3. ANEXOS (Foto/Documento via FileReader base64)
    handleAttachment(intId) {
        const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*,.pdf,.doc,.docx';
        input.addEventListener('change', async () => {
            const file = input.files[0]; if (!file) return;
            if (file.size > 2 * 1024 * 1024) { App.showToast('Arquivo muito grande (máx 2MB).','error'); return; }
            const reader = new FileReader();
            reader.onload = async () => {
                const interaction = this.allInteractions.find(i=>i.id===intId);
                const attachments = interaction?.attachments || [];
                attachments.push(reader.result);
                await Store.updateInteraction(intId, { attachments });
                App.showToast('Anexo adicionado!','success');
                this.loadInteractions();
            };
            reader.readAsDataURL(file);
        });
        input.click();
    },

    // 4. MODELOS DE RESPOSTA RÁPIDA
    showQuickReplyModal(clientName) {
        const modal = document.getElementById('modal-content');
        const btns = this.quickTemplates.map((t,i) => `<button class="qr-btn w-full text-left p-4 rounded-xl bg-surface-container-high hover:bg-green-50 hover:ring-2 hover:ring-green-300 transition-all group" data-idx="${i}">
            <div class="flex items-center justify-between"><span class="font-bold text-on-surface group-hover:text-green-700">${t.label}</span><span class="material-symbols-outlined text-green-500 text-lg">send</span></div>
            <p class="text-xs text-on-surface-variant mt-1 line-clamp-2">${t.msg}</p>
        </button>`).join('');
        modal.innerHTML = `<div class="p-8">
            <h3 class="font-headline font-bold text-2xl mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-green-500">quickreply</span>Resposta Rápida</h3>
            <p class="text-on-surface-variant text-sm mb-6">Enviar mensagem para <strong>${clientName}</strong></p>
            <div class="space-y-3 mb-6">${btns}</div>
            <div class="flex gap-3">
                <button onclick="App.closeModal()" class="flex-1 px-4 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors text-center">Cancelar</button>
            </div></div>`;
        App.openModal();
        document.querySelectorAll('.qr-btn').forEach(b => b.addEventListener('click', e => {
            const t = this.quickTemplates[e.currentTarget.dataset.idx];
            const encoded = encodeURIComponent(t.msg);
            window.open(`https://wa.me/?text=${encoded}`, '_blank');
            App.closeModal(); App.showToast('Mensagem aberta no WhatsApp!','success');
        }));
    },

    // 5. VÍNCULO COM AGENDAMENTO
    showCreateAppointmentModal(data) {
        const modal = document.getElementById('modal-content');
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
        const dateVal = tomorrow.toISOString().split('T')[0];
        modal.innerHTML = `<div class="p-8">
            <h3 class="font-headline font-bold text-2xl mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-primary">event</span>Criar Agendamento</h3>
            <p class="text-on-surface-variant text-sm mb-6">A partir da interação de <strong>${data.type==='sale'?'Venda':'Follow-up'}</strong> com <strong>${data.client}</strong></p>
            <form id="schedule-from-int" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Data *</label>
                        <input type="date" id="sfi-date" required value="${dateVal}" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20"></div>
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Horário *</label>
                        <input type="time" id="sfi-time" required value="10:00" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20"></div>
                </div>
                <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Serviço *</label>
                    <input type="text" id="sfi-service" required placeholder="Ex: Consulta, Retoque, Avaliação..." class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20"></div>
                <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Observações</label>
                    <textarea id="sfi-notes" rows="2" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface resize-none focus:ring-2 focus:ring-primary/20" placeholder="Notas adicionais..."></textarea></div>
                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg flex items-center gap-2"><span class="material-symbols-outlined">event_available</span>Agendar</button>
                </div>
            </form></div>`;
        App.openModal();
        document.getElementById('schedule-from-int').addEventListener('submit', async e => {
            e.preventDefault();
            const d = document.getElementById('sfi-date').value, t = document.getElementById('sfi-time').value;
            const dateObj = new Date(`${d}T${t}`);
            await Store.addAppointment({ clientId: data.clientId, clientName: data.client, service: document.getElementById('sfi-service').value, date: dateObj, notes: document.getElementById('sfi-notes').value, fromInteraction: data.id });
            App.closeModal(); App.showToast('Agendamento criado com sucesso!','success');
        });
    },

    async showNewInteractionModal() {
        let opts = '<option value="">Selecione um cliente</option>';
        try { const c = await Store.getClients(); opts += c.map(c=>`<option value="${c.id}" data-name="${c.name}">${c.name} — ${c.email||''}</option>`).join(''); } catch(e){}
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `<div class="p-8">
            <h3 class="font-headline font-bold text-2xl mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-primary">add_circle</span>Nova Interação</h3>
            <p class="text-on-surface-variant text-sm mb-6">Registre uma interação com seu cliente.</p>
            <form id="interaction-form" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Cliente *</label><select id="int-client" required class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20">${opts}</select></div>
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Tipo *</label><select id="int-type" required class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20"><option value="service">Serviço</option><option value="support">Suporte</option><option value="feedback">Feedback</option><option value="sale">Venda</option><option value="followup">Follow-up</option></select></div>
                </div>
                <div class="grid grid-cols-3 gap-4">
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Status</label><select id="int-status" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20"><option value="pending">Pendente</option><option value="in_progress">Em Andamento</option><option value="completed">Concluída</option></select></div>
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Satisfação</label><select id="int-sentiment" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20"><option value="neutral">😐 Neutro</option><option value="positive">😊 Satisfeito</option><option value="negative">😞 Insatisfeito</option></select></div>
                    <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Canal</label><select id="int-channel" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20"><option value="Presencial">Presencial</option><option value="WhatsApp">WhatsApp</option><option value="Telefone">Telefone</option><option value="E-mail">E-mail</option><option value="Outro">Outro</option></select></div>
                </div>
                <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Descrição *</label><textarea id="int-description" required rows="3" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface resize-none focus:ring-2 focus:ring-primary/20" placeholder="Descreva a interação..."></textarea></div>
                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"><span class="material-symbols-outlined">save</span>Registrar</button>
                </div>
            </form></div>`;
        App.openModal();
        document.getElementById('interaction-form').addEventListener('submit', async e => {
            e.preventDefault();
            const cs = document.getElementById('int-client'), so = cs.options[cs.selectedIndex];
            const data = { clientId:cs.value, clientName:so.dataset.name||'', type:document.getElementById('int-type').value, status:document.getElementById('int-status').value, sentiment:document.getElementById('int-sentiment').value, channel:document.getElementById('int-channel').value, description:document.getElementById('int-description').value, date:new Date(), attachments:[] };
            try { await Store.addInteraction(data); App.closeModal(); App.showToast('Interação registrada!','success'); this.loadInteractions(); } catch(err){ App.showToast('Erro: '+err.message,'error'); }
        });
    }
};
