// === Dashboard Page — StudioBeauty Aperfeiçoado ===
const DashboardPage = {
    currentPeriod: 'month',
    cachedStats: null,

    render() {
        const user = Auth.currentUser;
        const displayName = user ? (user.displayName || user.email.split('@')[0]) : 'Gestor';
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

        return `
        <div class="space-y-6 max-w-[1400px] mobile-full-width mx-auto">

            <!-- === HEADER === -->
            <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Painel de Controle</h2>
                    <p id="dash-greeting" class="text-on-surface-variant mt-1">${greeting}, <strong>${displayName}</strong>! Carregando resumo...</p>
                </div>
                <div class="flex items-center gap-3">
                    <button id="btn-export-report" class="px-5 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-surface-container-highest transition-colors flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">file_download</span> Exportar
                    </button>
                    <a href="#/clients/new" class="px-5 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">add_circle</span> Novo Cliente
                    </a>
                </div>
            </section>

            <!-- === FILTRO DE PERÍODO === -->
            <div class="flex items-center gap-2 flex-wrap">
                <button class="period-btn active px-4 py-2 rounded-full text-xs font-bold transition-all" data-period="today">Hoje</button>
                <button class="period-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-period="week">Esta Semana</button>
                <button class="period-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-period="month">Este Mês</button>
                <button class="period-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-period="all">Todo Período</button>
            </div>

            <!-- ============================================================ -->
            <!-- ZONA 1 — VISÃO FINANCEIRA                                   -->
            <!-- ============================================================ -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Faturamento Bruto -->
                <div class="col-span-2 lg:col-span-1 bg-gradient-to-br from-[#58323F] to-[#7A4A57] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-[#58323F]/20">
                    <div class="absolute right-[-10px] bottom-[-10px] opacity-10 pointer-events-none select-none">
                        <span class="material-symbols-outlined" style="font-size:100px">payments</span>
                    </div>
                    <div class="relative z-10">
                        <p class="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Faturamento <span id="period-label">(Mês)</span></p>
                        <h3 id="fin-faturamento" class="text-3xl font-black mt-1 leading-none">R$ --</h3>
                        <div id="fin-meta-wrap" class="mt-3 hidden">
                            <div class="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div id="fin-meta-progress" class="h-full bg-white rounded-full transition-all duration-700" style="width:0%"></div>
                            </div>
                            <p id="fin-meta-label" class="text-[10px] text-white/60 mt-1">-- da meta mensal</p>
                        </div>
                        <p class="text-[10px] text-white/40 mt-2 flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">receipt_long</span> Notas autorizadas
                        </p>
                    </div>
                </div>

                <!-- Ticket Médio -->
                <div class="bg-[#F0D9DC] rounded-2xl p-5 relative overflow-hidden">
                    <div class="absolute right-1 bottom-1 opacity-15 pointer-events-none select-none text-[70px]">🎯</div>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-[#58323F]/70 mb-1">Ticket Médio</p>
                    <h3 id="fin-ticket" class="text-2xl font-black text-[#58323F] leading-none">R$ --</h3>
                    <p class="text-[10px] text-[#58323F]/50 mt-2">por atendimento faturado</p>
                </div>

                <!-- Lucro Líquido -->
                <div class="bg-[#EAD9CA] rounded-2xl p-5 relative overflow-hidden">
                    <div class="absolute right-1 bottom-1 opacity-15 pointer-events-none select-none text-[70px]">📈</div>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-[#6B4F56]/70 mb-1">Lucro Líquido</p>
                    <h3 id="fin-lucro" class="text-2xl font-black text-[#6B4F56] leading-none">R$ --</h3>
                    <p class="text-[10px] text-[#6B4F56]/50 mt-2">após dedução de ISS</p>
                </div>

                <!-- Agendamentos -->
                <div class="bg-surface-container-low rounded-2xl p-5 relative overflow-hidden group cursor-default">
                    <div class="absolute right-[-20px] bottom-[-20px] text-primary/10 pointer-events-none select-none">
                        <span class="material-symbols-outlined" style="font-size:120px">monitoring</span>
                    </div>
                    <div class="relative z-10">
                        <p class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Agendamentos</p>
                        <h3 id="stat-appointments" class="text-3xl font-black text-primary leading-none">--</h3>
                        <span id="trend-appointments" class="hidden text-xs font-bold mt-1"></span>
                        <div class="mt-3 flex items-center gap-1 text-primary font-bold text-xs">
                            <span class="material-symbols-outlined text-sm">trending_up</span> Atualizado em tempo real
                        </div>
                    </div>
                </div>
            </div>

            <!-- ============================================================ -->
            <!-- ZONA 2 — GRÁFICOS                                           -->
            <!-- ============================================================ -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

                <!-- Formas de Pagamento -->
                <div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
                    <h3 class="font-headline font-bold text-base mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings:'FILL' 1">credit_card</span>
                        Formas de Pagamento
                    </h3>
                    <div class="flex items-center justify-center mb-3">
                        <svg id="payment-svg" width="160" height="160" viewBox="0 0 180 180">
                            <text x="90" y="95" text-anchor="middle" font-size="11" fill="#94a3b8">Carregando...</text>
                        </svg>
                    </div>
                    <div id="payment-legend" class="space-y-2"></div>
                    <p class="text-[10px] text-on-surface-variant/60 mt-3 text-center">Baseado nas notas fiscais autorizadas</p>
                </div>

                <!-- Serviços Mais Vendidos -->
                <div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
                    <h3 class="font-headline font-bold text-base mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings:'FILL' 1">workspace_premium</span>
                        Serviços Mais Vendidos
                    </h3>
                    <div id="services-ranking" class="space-y-3">
                        <div class="text-center py-6 text-on-surface-variant">
                            <div class="spinner mx-auto mb-2"></div>
                            <p class="text-xs">Carregando...</p>
                        </div>
                    </div>
                    <a href="#/schedule" class="block mt-4 text-xs text-primary font-bold text-center hover:underline">Ver agenda completa →</a>
                </div>

                <!-- Ocupação da Agenda -->
                <div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
                    <h3 class="font-headline font-bold text-base mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings:'FILL' 1">event_available</span>
                        Ocupação da Agenda
                    </h3>
                    <div class="flex flex-col items-center">
                        <div class="relative w-[140px] h-[140px]">
                            <svg viewBox="0 0 180 180" width="140" height="140">
                                <circle cx="90" cy="90" r="65" fill="none" stroke="#F0E8DC" stroke-width="20"/>
                                <circle id="occupancy-arc" cx="90" cy="90" r="65" fill="none" stroke="#58323F" stroke-width="20"
                                    stroke-linecap="round" stroke-dasharray="408.41" stroke-dashoffset="408.41"
                                    transform="rotate(-90 90 90)" style="transition:stroke-dashoffset 0.9s ease"/>
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span id="occupancy-pct" class="text-2xl font-black text-[#58323F]">--%</span>
                                <span class="text-[9px] text-on-surface-variant font-semibold">ocupação</span>
                            </div>
                        </div>
                        <p class="text-xs text-on-surface-variant text-center mt-3">
                            <span id="occupancy-real" class="font-bold text-on-surface">--</span> de
                            <span id="occupancy-cap" class="font-bold text-on-surface">--</span> atend./semana
                        </p>
                        <a href="#/bolsa-beleza-sb" class="mt-2 text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5">
                            <span class="material-symbols-outlined text-xs">settings</span> Configurar na Bolsa da Beleza
                        </a>
                    </div>
                </div>
            </div>

            <!-- ============================================================ -->
            <!-- ZONA 3 — GESTÃO DE CLIENTES                                 -->
            <!-- ============================================================ -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <!-- Taxa de Retenção -->
                <div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-emerald-600" style="font-variation-settings:'FILL' 1">favorite</span>
                        </div>
                        <div>
                            <p class="font-bold text-sm text-on-surface">Taxa de Retenção</p>
                            <p class="text-[10px] text-on-surface-variant">clientes que voltaram (30 dias)</p>
                        </div>
                    </div>
                    <h3 id="retention-pct" class="text-4xl font-black text-emerald-600 leading-none">--%</h3>
                    <p id="retention-detail" class="text-xs text-on-surface-variant mt-1">-- de -- clientes ativos</p>
                    <div class="mt-3 h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div id="retention-bar" class="h-full bg-emerald-500 rounded-full transition-all duration-700" style="width:0%"></div>
                    </div>
                </div>

                <!-- Novos vs Recorrentes -->
                <div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-blue-600" style="font-variation-settings:'FILL' 1">group_add</span>
                        </div>
                        <div>
                            <p class="font-bold text-sm text-on-surface">Novos vs Recorrentes</p>
                            <p class="text-[10px] text-on-surface-variant">base de clientes — este mês</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="text-center p-3 bg-blue-50 rounded-xl">
                            <p class="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Novos</p>
                            <p id="new-clients-count" class="text-3xl font-black text-blue-700">--</p>
                        </div>
                        <div class="text-center p-3 bg-surface-container-high rounded-xl">
                            <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Recorrentes</p>
                            <p id="returning-clients-count" class="text-3xl font-black text-on-surface">--</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                        <a href="#/clients" class="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                            <span id="stat-active" class="font-black">--</span> ativos
                        </a>
                        <span class="text-on-surface-variant text-xs">·</span>
                        <a href="#/clients" class="text-xs text-amber-600 font-bold hover:underline">
                            <span id="stat-prospects" class="font-black">--</span> prospectos
                        </a>
                    </div>
                </div>

                <!-- No-Show -->
                <div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-amber-600" style="font-variation-settings:'FILL' 1">event_busy</span>
                        </div>
                        <div>
                            <p class="font-bold text-sm text-on-surface">Taxa de No-Show</p>
                            <p class="text-[10px] text-on-surface-variant">cancelamentos / total agendado</p>
                        </div>
                    </div>
                    <h3 id="noshow-pct" class="text-4xl font-black text-amber-600 leading-none">--%</h3>
                    <p id="noshow-detail" class="text-xs text-on-surface-variant mt-1">-- ocorrências no período</p>
                    <div class="mt-3 h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div id="noshow-bar" class="h-full bg-amber-400 rounded-full transition-all duration-700" style="width:0%"></div>
                    </div>
                    <p class="text-[10px] text-on-surface-variant/60 mt-2">* Baseado em agendamentos cancelados</p>
                </div>

                <!-- NPS Geral -->
                <div class="bg-gradient-to-br from-[#58323F] to-[#7A4A57] rounded-2xl p-5 shadow-sm text-white relative overflow-hidden">
                    <div class="absolute right-[-12px] bottom-[-12px] opacity-10 pointer-events-none select-none">
                        <span class="material-symbols-outlined" style="font-size:90px">sentiment_satisfied</span>
                    </div>
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-white" style="font-variation-settings:'FILL' 1">rate_review</span>
                        </div>
                        <div>
                            <p class="font-bold text-sm text-white">NPS Geral</p>
                            <p class="text-[10px] text-white/60">Net Promoter Score</p>
                        </div>
                    </div>
                    <h3 id="dash-nps-score" class="text-4xl font-black text-white leading-none">--</h3>
                    <p id="dash-nps-label" class="text-xs text-white/70 mt-1">Sem respostas ainda</p>
                    <div class="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div id="dash-nps-bar" class="h-full bg-white rounded-full transition-all duration-700" style="width:0%"></div>
                    </div>
                    <div class="flex justify-between text-[10px] text-white/50 mt-1">
                        <span>-100</span><span>0</span><span>+100</span>
                    </div>
                    <a href="#/reviews" class="mt-3 flex items-center gap-1 text-[10px] text-white/60 hover:text-white font-bold transition-colors">
                        <span class="material-symbols-outlined text-xs">open_in_new</span> Ver detalhes em Avaliações
                    </a>
                </div>
            </div>


            <!-- ============================================================ -->
            <!-- ZONA 4 — OPERAÇÃO (mantém existentes)                       -->
            <!-- ============================================================ -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <!-- Próximos Agendamentos -->
                <div class="lg:col-span-2 space-y-5">
                    <div class="flex items-center justify-between">
                        <h3 class="font-headline text-xl font-bold">Próximos Agendamentos</h3>
                        <a class="text-primary text-sm font-bold hover:underline" href="#/schedule">Ver agenda completa</a>
                    </div>
                    <div id="dash-appointments" class="space-y-3">
                        <div class="text-center py-12 text-on-surface-variant">
                            <div class="spinner mx-auto mb-4"></div>
                            <p>Carregando...</p>
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">

                    <!-- Status dos Clientes (Donut) -->
                    <div>
                        <h3 class="font-headline text-lg font-bold mb-4">Status dos Clientes</h3>
                        <div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
                            <div class="flex items-center justify-center mb-4">
                                <canvas id="donut-chart" width="180" height="180"></canvas>
                            </div>
                            <div id="donut-legend" class="space-y-2 text-sm"></div>
                        </div>
                    </div>

                    <!-- Aniversariantes (injetado dinamicamente) -->
                    <div id="dash-birthday-box" class="hidden">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="font-headline text-lg font-bold flex items-center gap-2">
                                <span class="text-xl">🎂</span> Aniversariantes
                            </h3>
                            <a href="#/birthdays" class="text-primary text-xs font-bold hover:underline">Ver todos</a>
                        </div>
                        <div id="dash-birthday-items" class="space-y-2"></div>
                    </div>

                    <!-- Estoque Baixo (injetado dinamicamente) -->
                    <div id="inventory-alert" class="hidden">
                        <h3 class="font-headline text-lg font-bold mb-3 flex items-center gap-2">
                            <span class="material-symbols-outlined text-amber-600">warning</span>
                            Estoque Baixo
                        </h3>
                        <div id="inventory-alert-items" class="space-y-2"></div>
                    </div>

                    <!-- Dica Rápida -->
                    <div class="relative rounded-2xl p-6 overflow-hidden bg-primary/5 border border-primary/20">
                        <div class="relative z-10">
                            <h4 class="font-headline font-bold text-lg text-primary flex items-center gap-2 mb-2">
                                <span class="material-symbols-outlined text-xl">lightbulb</span>
                                Dica Rápida
                            </h4>
                            <p id="system-tip-text" class="text-sm text-on-surface-variant mb-4 min-h-[60px] flex items-center">
                                Carregando dica...
                            </p>
                            <div class="flex justify-between items-center">
                                <span class="text-[10px] uppercase font-bold text-primary/60 tracking-wider">Aproveite ao máximo</span>
                                <button id="btn-next-tip" class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                        <div class="absolute right-[-10px] top-[-10px] opacity-10 text-primary pointer-events-none">
                            <span class="material-symbols-outlined text-8xl">tips_and_updates</span>
                        </div>
                    </div>

                    <!-- Centro de Ajuda -->
                    <div class="relative rounded-2xl p-6 overflow-hidden bg-on-background text-surface">
                        <div class="relative z-10">
                            <h4 class="font-headline font-bold text-lg leading-tight mb-2">Centro de Ajuda</h4>
                            <p class="text-xs text-surface-variant mb-4">Acesse tutoriais e documentação do sistema.</p>
                            <button id="btn-help-guides" class="px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-white/30 transition-all border border-white/20">📖 Acessar Guias →</button>
                        </div>
                        <div class="absolute right-[-10px] bottom-[-10px] opacity-20 pointer-events-none">
                            <span class="material-symbols-outlined text-8xl">school</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- FAB -->
        <div id="fab-container" class="fixed bottom-8 right-8 z-50">
            <div id="fab-menu" class="hidden flex flex-col-reverse gap-3 mb-3 items-end">
                <a href="#/clients/new" class="flex items-center gap-2 bg-white shadow-lg rounded-full pl-4 pr-5 py-2.5 text-sm font-bold text-on-surface hover:bg-slate-50 transition-all border border-outline-variant/10">
                    <span class="material-symbols-outlined text-primary text-lg">person_add</span> Novo Cliente
                </a>
                <button id="fab-new-appt" class="flex items-center gap-2 bg-white shadow-lg rounded-full pl-4 pr-5 py-2.5 text-sm font-bold text-on-surface hover:bg-slate-50 transition-all border border-outline-variant/10">
                    <span class="material-symbols-outlined text-primary text-lg">calendar_add_on</span> Novo Agendamento
                </button>
            </div>
            <button id="fab-toggle" class="w-14 h-14 vitality-gradient text-white rounded-full shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                <span class="material-symbols-outlined text-2xl transition-transform duration-300" id="fab-icon">add</span>
            </button>
        </div>`;
    },

    async init() {
        // Period filter
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.period-btn').forEach(b => {
                    b.classList.remove('active', 'vitality-gradient', 'text-white');
                    b.classList.add('bg-surface-container-low', 'text-on-surface-variant');
                });
                btn.classList.add('active', 'vitality-gradient', 'text-white');
                btn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
                DashboardPage.currentPeriod = btn.dataset.period;
                DashboardPage.loadData();
            });
        });

        const defaultBtn = document.querySelector('.period-btn.active');
        if (defaultBtn) {
            defaultBtn.classList.add('vitality-gradient', 'text-white');
            defaultBtn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
        }

        document.getElementById('btn-export-report')?.addEventListener('click', () => DashboardPage.exportReport());
        document.getElementById('btn-help-guides')?.addEventListener('click', () => App.showHelpModal());

        // FAB
        document.getElementById('fab-toggle')?.addEventListener('click', () => {
            const menu = document.getElementById('fab-menu');
            const icon = document.getElementById('fab-icon');
            menu.classList.toggle('hidden');
            icon.style.transform = menu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(45deg)';
        });
        document.getElementById('fab-new-appt')?.addEventListener('click', () => {
            document.getElementById('fab-menu').classList.add('hidden');
            document.getElementById('fab-icon').style.transform = 'rotate(0deg)';
            document.getElementById('btn-new-appointment')?.click();
        });
        document.addEventListener('click', (e) => {
            const fab = document.getElementById('fab-container');
            if (fab && !fab.contains(e.target)) {
                document.getElementById('fab-menu')?.classList.add('hidden');
                const icon = document.getElementById('fab-icon');
                if (icon) icon.style.transform = 'rotate(0deg)';
            }
        });

        // Quick Tips
        DashboardPage.loadNPS();

        const tips = [
            "Cadastre a data de nascimento das clientes para nunca perder um aniversário!",
            "Use a busca rápida (Lupa) na barra lateral para abrir clientes em poucos segundos.",
            "Defina o 'Nível Mínimo' no Estoque e o dashboard te avisará quando algo estiver acabando.",
            "No perfil do cliente, use a aba 'Faturas' para controlar pagamentos pendentes.",
            "Preencha a Bolsa da Beleza SB para ver sua Ocupação da Agenda no Dashboard.",
            "Toque no botão 'Exportar' para baixar um resumo gerencial em CSV.",
            "Agendamentos cancelados impactam na sua Taxa de No-Show. Monitore sempre!",
            "Registre a forma de pagamento nas faturas para ver o gráfico de pagamentos.",
        ];
        let tipIdx = Math.floor(Math.random() * tips.length);
        const tipEl = document.getElementById('system-tip-text');
        const updateTip = () => {
            if (tipEl) {
                tipEl.style.opacity = '0';
                setTimeout(() => {
                    tipEl.innerHTML = `<strong>Dica:</strong> <span>${tips[tipIdx]}</span>`;
                    tipEl.style.opacity = '1';
                    tipEl.style.transition = 'opacity 0.3s';
                }, 200);
            }
        };
        updateTip();
        document.getElementById('btn-next-tip')?.addEventListener('click', () => {
            tipIdx = (tipIdx + 1) % tips.length;
            updateTip();
        });

        await this.loadData();
    },

    async loadData() {
        const periodLabels = { today: 'Hoje', week: 'Semana', month: 'Mês', all: 'Total' };
        const labelEl = document.getElementById('period-label');
        if (labelEl) labelEl.textContent = `(${periodLabels[this.currentPeriod]})`;

        try {
            const [stats, appointments, clients] = await Promise.all([
                Store.getDashboardStats(),
                Store.getAppointments(),
                Store.getClients()
            ]);
            this.cachedStats = stats;

            const filtered = this.filterByPeriod(appointments);

            // Greeting dinâmico
            const greetEl = document.getElementById('dash-greeting');
            const user = Auth.currentUser;
            const name = user ? (user.displayName || user.email.split('@')[0]) : 'Gestor';
            const hour = new Date().getHours();
            const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
            const todayAppts = this.filterByPeriod(appointments, 'today').length;
            if (greetEl) {
                if (todayAppts > 0) {
                    greetEl.innerHTML = `${greeting}, <strong>${name}</strong>! Você tem <strong class="text-primary">${todayAppts} agendamento${todayAppts > 1 ? 's' : ''}</strong> para hoje.`;
                } else {
                    greetEl.innerHTML = `${greeting}, <strong>${name}</strong>! Sua agenda de hoje está livre.`;
                }
            }

            // Agendamentos count
            const apptEl = document.getElementById('stat-appointments');
            if (apptEl) apptEl.textContent = filtered.length;

            // Clientes ativos e prospectos
            const activeEl = document.getElementById('stat-active');
            const prospectsEl = document.getElementById('stat-prospects');
            if (activeEl) activeEl.textContent = stats.activeClients;
            if (prospectsEl) prospectsEl.textContent = stats.prospects;

            // Próximos agendamentos
            this.renderAppointments(appointments);

            // Donut status clientes
            this.drawDonut(stats.activeClients, stats.prospects, stats.inactiveClients);

            // ---- ZONAS FINANCEIRAS ----
            await this.loadFinancials(filtered);

            // ---- SERVIÇOS MAIS VENDIDOS ----
            this.loadServicesRanking(appointments);

            // ---- OCUPAÇÃO DA AGENDA ----
            this.loadOccupancy();

            // ---- MÉTRICAS DE CLIENTES ----
            this.loadClientMetrics(clients, appointments);

            // ---- ANIVERSARIANTES ----
            await this.loadBirthdays();

            // ---- ESTOQUE ----
            await this.checkLowInventory();

        } catch (e) {
            console.warn('Dashboard error:', e);
        }
    },

    // ============================================================
    // ZONA 1 — FINANCEIRO
    // ============================================================
    async loadFinancials(filteredAppointments) {
        try {
            const invoices = await Store.getInvoices();
            const now = new Date();

            // Filtra notas pelo período selecionado
            const filteredInvoices = invoices.filter(inv => {
                if (inv.status !== 'autorizada') return false;
                const d = inv.createdAt?.toDate ? inv.createdAt.toDate() : new Date(inv.createdAt || now);
                return this.filterByPeriod([{ date: d }]).length > 0 ||
                    this._dateInPeriod(d);
            });

            const faturamento = filteredInvoices.reduce((s, i) => s + (i.value || 0), 0);
            const issTotal    = filteredInvoices.reduce((s, i) => s + (i.issValue || 0), 0);
            const lucro       = faturamento - issTotal;
            const ticket      = filteredInvoices.length > 0 ? faturamento / filteredInvoices.length : 0;

            const fmt = v => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

            const el = id => document.getElementById(id);
            if (el('fin-faturamento')) el('fin-faturamento').textContent = fmt(faturamento);
            if (el('fin-ticket'))      el('fin-ticket').textContent = fmt(ticket);
            if (el('fin-lucro'))       el('fin-lucro').textContent = fmt(lucro);

            // Meta de faturamento (vem da Bolsa da Beleza SB)
            const bolsaState = JSON.parse(localStorage.getItem('bolsa_beleza_sb_state') || '{}');
            const meta = parseFloat(bolsaState?.metas?.metaFinanceira) || 0;
            const metaWrap = el('fin-meta-wrap');
            if (meta > 0 && metaWrap) {
                metaWrap.classList.remove('hidden');
                const pct = Math.min(100, (faturamento / meta) * 100);
                const bar = el('fin-meta-progress');
                const label = el('fin-meta-label');
                if (bar) setTimeout(() => { bar.style.width = `${pct}%`; }, 100);
                if (label) label.textContent = `${pct.toFixed(0)}% da meta R$ ${meta.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
            }

            // Gráfico de formas de pagamento
            const paymentGroups = {};
            filteredInvoices.forEach(inv => {
                const pm = inv.paymentMethod || 'Não informado';
                paymentGroups[pm] = (paymentGroups[pm] || 0) + (inv.value || 0);
            });
            this.drawPaymentChart(paymentGroups);

        } catch (e) {
            console.warn('Financials error:', e);
        }
    },

    // Verifica se uma data está no período atual
    _dateInPeriod(d) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        switch (this.currentPeriod) {
            case 'today':
                return d >= startOfDay && d < new Date(startOfDay.getTime() + 86400000);
            case 'week': {
                const sow = new Date(startOfDay);
                sow.setDate(sow.getDate() - sow.getDay());
                return d >= sow && d < new Date(sow.getTime() + 7 * 86400000);
            }
            case 'month':
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    },

    // ============================================================
    // ZONA 2 — GRÁFICO: Formas de Pagamento (SVG Donut)
    // ============================================================
    drawPaymentChart(data) {
        const svgEl  = document.getElementById('payment-svg');
        const legEl  = document.getElementById('payment-legend');
        if (!svgEl) return;

        const palette = ['#58323F', '#E8C5C8', '#7A4A57', '#EAD9CA', '#F0E8DC', '#94a3b8'];
        const entries = Object.entries(data).filter(([, v]) => v > 0);
        const total   = entries.reduce((s, [, v]) => s + v, 0);

        if (total === 0 || entries.length === 0) {
            svgEl.innerHTML = `
                <circle cx="90" cy="90" r="65" fill="none" stroke="#F0E8DC" stroke-width="20"/>
                <text x="90" y="88" text-anchor="middle" font-size="11" fill="#94a3b8">Sem dados</text>
                <text x="90" y="103" text-anchor="middle" font-size="9" fill="#b0b9c4">Emita notas com</text>
                <text x="90" y="115" text-anchor="middle" font-size="9" fill="#b0b9c4">forma de pagamento</text>`;
            if (legEl) legEl.innerHTML = '';
            return;
        }

        const cx = 90, cy = 90, r = 65, gap = 0.04;
        let start = -Math.PI / 2;
        let paths = '';

        entries.forEach(([, value], i) => {
            const angle  = (value / total) * Math.PI * 2;
            const x1 = cx + r * Math.cos(start);
            const y1 = cy + r * Math.sin(start);
            const x2 = cx + r * Math.cos(start + angle - gap);
            const y2 = cy + r * Math.sin(start + angle - gap);
            const la = angle > Math.PI ? 1 : 0;
            const color = palette[i % palette.length];
            paths += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${la},1 ${x2},${y2} Z" fill="${color}"/>`;
            start += angle;
        });

        // Centro branco
        paths += `<circle cx="${cx}" cy="${cy}" r="44" fill="white"/>`;
        paths += `<text x="${cx}" y="${cy - 5}" text-anchor="middle" font-size="18" font-weight="800" fill="#1a1a1a">${entries.length}</text>`;
        paths += `<text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="9" fill="#64748b">formas</text>`;
        svgEl.innerHTML = paths;

        if (legEl) {
            legEl.innerHTML = entries.map(([name, value], i) => `
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-1.5">
                        <div class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${palette[i % palette.length]}"></div>
                        <span class="text-on-surface truncate max-w-[120px]">${name}</span>
                    </div>
                    <span class="font-bold text-on-surface-variant ml-2">${((value / total) * 100).toFixed(0)}%</span>
                </div>`).join('');
        }
    },

    // ============================================================
    // ZONA 2 — Serviços Mais Vendidos (barras CSS)
    // ============================================================
    loadServicesRanking(appointments) {
        const container = document.getElementById('services-ranking');
        if (!container) return;

        const period = this.filterByPeriod(appointments);
        const counts = {};
        period.forEach(a => {
            const svc = a.service || 'Outro';
            counts[svc] = (counts[svc] || 0) + 1;
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const max = sorted[0]?.[1] || 1;
        const colors = ['#58323F', '#7A4A57', '#E8C5C8', '#EAD9CA', '#94a3b8'];
        const medals = ['🥇', '🥈', '🥉', '4°', '5°'];

        if (sorted.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">bar_chart</span>
                    <p class="text-sm text-on-surface-variant">Sem agendamentos no período</p>
                </div>`;
            return;
        }

        container.innerHTML = sorted.map(([name, count], i) => `
            <div class="space-y-1">
                <div class="flex justify-between items-center text-xs">
                    <span class="flex items-center gap-1.5 font-semibold text-on-surface">
                        <span>${medals[i]}</span>
                        <span class="truncate max-w-[140px]">${name}</span>
                    </span>
                    <span class="font-black text-on-surface-variant ml-2">${count}</span>
                </div>
                <div class="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700" style="width:${((count/max)*100).toFixed(0)}%;background:${colors[i]};transition-delay:${i*80}ms"></div>
                </div>
            </div>`).join('');
    },

    // ============================================================
    // ZONA 2 — Ocupação da Agenda (Gauge SVG)
    // ============================================================
    loadOccupancy() {
        try {
            const bolsaState = JSON.parse(localStorage.getItem('bolsa_beleza_sb_state') || '{}');
            const cap  = parseFloat(bolsaState?.metas?.capacidadeSemanal) || 0;
            const real = parseFloat(bolsaState?.metas?.realizadoSemanal)  || 0;
            const pct  = cap > 0 ? Math.min(100, (real / cap) * 100) : 0;

            const el = id => document.getElementById(id);
            const circumference = 2 * Math.PI * 65; // r=65

            if (el('occupancy-pct')) el('occupancy-pct').textContent = cap > 0 ? `${pct.toFixed(0)}%` : '--';
            if (el('occupancy-real')) el('occupancy-real').textContent = cap > 0 ? real : '--';
            if (el('occupancy-cap'))  el('occupancy-cap').textContent  = cap > 0 ? cap  : '--';

            const arc = el('occupancy-arc');
            if (arc && cap > 0) {
                setTimeout(() => {
                    arc.setAttribute('stroke-dashoffset', circumference * (1 - pct / 100));
                    // Color: green if >70%, amber if >40%, cassis if lower
                    const color = pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#58323F';
                    arc.setAttribute('stroke', color);
                }, 150);
            }
        } catch (e) {
            console.warn('Occupancy error:', e);
        }
    },

    // ============================================================
    // ZONA 3 — Métricas de Clientes
    // ============================================================
    loadClientMetrics(clients, appointments) {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

            // Clientes que tiveram agendamento nos últimos 30 dias
            const recentClientNames = new Set(
                appointments
                    .filter(a => {
                        const d = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
                        return d >= thirtyDaysAgo;
                    })
                    .map(a => (a.clientName || '').toLowerCase())
                    .filter(Boolean)
            );

            const activeClients = clients.filter(c => c.status === 'active').length;
            const retained = Math.min(recentClientNames.size, activeClients);
            const retPct = activeClients > 0 ? Math.round((retained / activeClients) * 100) : 0;

            // Novos este mês
            const newThisMonth = clients.filter(c => {
                const d = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt || now);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length;
            const recurring = Math.max(0, retained - newThisMonth);

            // No-show (agendamentos cancelados no período)
            const periodAppts  = this.filterByPeriod(appointments);
            const cancelled    = periodAppts.filter(a => a.status === 'cancelled' || a.status === 'cancelado').length;
            const noshowPct    = periodAppts.length > 0 ? Math.round((cancelled / periodAppts.length) * 100) : 0;

            const el = id => document.getElementById(id);

            // Retenção
            if (el('retention-pct'))    el('retention-pct').textContent = `${retPct}%`;
            if (el('retention-detail')) el('retention-detail').textContent = `${retained} de ${activeClients} clientes ativos`;
            const retBar = el('retention-bar');
            if (retBar) setTimeout(() => { retBar.style.width = `${retPct}%`; }, 200);

            // Novos vs Recorrentes
            if (el('new-clients-count'))       el('new-clients-count').textContent = newThisMonth;
            if (el('returning-clients-count')) el('returning-clients-count').textContent = recurring;

            // No-Show
            if (el('noshow-pct'))    el('noshow-pct').textContent = `${noshowPct}%`;
            if (el('noshow-detail')) el('noshow-detail').textContent = `${cancelled} ocorrência${cancelled !== 1 ? 's' : ''} no período`;
            const noshowBar = el('noshow-bar');
            if (noshowBar) setTimeout(() => { noshowBar.style.width = `${noshowPct}%`; }, 200);

        } catch (e) {
            console.warn('Client metrics error:', e);
        }
    },

    // ============================================================
    // UTILITÁRIOS (mantidos da versão anterior)
    // ============================================================
    filterByPeriod(items, period) {
        const p = period || this.currentPeriod;
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return items.filter(item => {
            if (!item.date) return p === 'all';
            const d = item.date.seconds ? new Date(item.date.seconds * 1000) : new Date(item.date);
            switch (p) {
                case 'today':
                    return d >= startOfDay && d < new Date(startOfDay.getTime() + 86400000);
                case 'week': {
                    const sow = new Date(startOfDay);
                    sow.setDate(sow.getDate() - sow.getDay());
                    return d >= sow && d < new Date(sow.getTime() + 7 * 86400000);
                }
                case 'month':
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    },

    renderAppointments(allAppointments) {
        const container = document.getElementById('dash-appointments');
        if (!container) return;

        const upcoming = allAppointments
            .filter(a => {
                const d = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
                return d >= new Date();
            })
            .sort((a, b) => {
                const da = a.date?.seconds ? a.date.seconds : new Date(a.date).getTime() / 1000;
                const db = b.date?.seconds ? b.date.seconds : new Date(b.date).getTime() / 1000;
                return da - db;
            })
            .slice(0, 5);

        if (upcoming.length === 0) {
            container.innerHTML = `
            <div class="bg-surface-container-lowest rounded-2xl p-8 border-2 border-dashed border-outline-variant/20 text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <span class="material-symbols-outlined text-3xl text-primary/40">calendar_today</span>
                </div>
                <p class="font-bold text-on-surface text-lg mb-1">Nenhum agendamento próximo</p>
                <p class="text-on-surface-variant text-sm mb-5">Sua agenda está livre. Que tal criar um novo compromisso?</p>
                <button id="btn-dash-new-appt" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform inline-flex items-center gap-2">
                    <span class="material-symbols-outlined">add</span> Agendar Agora
                </button>
            </div>`;
            document.getElementById('btn-dash-new-appt')?.addEventListener('click', () => {
                document.getElementById('btn-new-appointment')?.click();
            });
            return;
        }

        const statusColors = {
            scheduled: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };

        container.innerHTML = upcoming.map(a => {
            const d = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
            const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            const sc = statusColors[a.status] || statusColors.scheduled;
            return `
            <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/10 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                    <span class="text-[10px] font-bold text-primary/70 uppercase">${dateStr.split(' ')[1]}</span>
                    <span class="text-lg font-black text-primary leading-none">${dateStr.split(' ')[0]}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-on-surface text-sm truncate">${a.clientName || a.service || 'Agendamento'}</p>
                    <p class="text-xs text-on-surface-variant">${timeStr} • ${a.service || '—'}</p>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sc}">${a.status === 'completed' ? 'Concluído' : a.status === 'cancelled' ? 'Cancelado' : 'Agendado'}</span>
            </div>`;
        }).join('');
    },

    drawDonut(active, prospects, inactive) {
        const canvas = document.getElementById('donut-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const total = active + prospects + inactive;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 180 * dpr;
        canvas.height = 180 * dpr;
        ctx.scale(dpr, dpr);
        const cx = 90, cy = 90, r = 65, lineW = 20;
        ctx.clearRect(0, 0, 180, 180);

        if (total === 0) {
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = lineW; ctx.stroke();
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('Sem dados', cx, cy);
        } else {
            const data = [
                { value: active,   color: '#2E7D32', label: 'Ativos' },
                { value: prospects, color: '#E65100', label: 'Prospectos' },
                { value: inactive, color: '#94a3b8', label: 'Inativos' }
            ];
            let start = -Math.PI / 2;
            data.forEach(seg => {
                if (!seg.value) return;
                const angle = (seg.value / total) * Math.PI * 2;
                ctx.beginPath(); ctx.arc(cx, cy, r, start, start + angle);
                ctx.strokeStyle = seg.color; ctx.lineWidth = lineW; ctx.lineCap = 'round'; ctx.stroke();
                start += angle + 0.04;
            });
            ctx.font = 'bold 28px Inter, sans-serif'; ctx.fillStyle = '#1a1a1a';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(total, cx, cy - 8);
            ctx.font = '500 11px Inter, sans-serif'; ctx.fillStyle = '#64748b';
            ctx.fillText('clientes', cx, cy + 12);
        }

        const legend = document.getElementById('donut-legend');
        if (legend) {
            legend.innerHTML = [
                { label: 'Ativos', value: active, color: '#2E7D32' },
                { label: 'Prospectos', value: prospects, color: '#E65100' },
                { label: 'Inativos', value: inactive, color: '#94a3b8' }
            ].map(i => `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full" style="background:${i.color}"></div>
                        <span class="font-semibold text-on-surface">${i.label}</span>
                    </div>
                    <span class="font-bold text-on-surface-variant">${i.value}</span>
                </div>`).join('');
        }
    },

    // Aniversariantes do dia (mantido)
    async loadBirthdays() {
        try {
            const clients = await Store.getClients();
            const now = new Date();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const todayMMDD = `${mm}-${dd}`;

            const todayBirthdays = clients.filter(c => {
                if (!c.birthdate) return false;
                const parts = c.birthdate.split('-');
                return `${parts[1]}-${parts[2]}` === todayMMDD;
            });

            const box   = document.getElementById('dash-birthday-box');
            const items = document.getElementById('dash-birthday-items');
            if (!box || !items) return;
            if (todayBirthdays.length === 0) { box.classList.add('hidden'); return; }

            box.classList.remove('hidden');
            items.innerHTML = todayBirthdays.map(c => {
                const phone   = (c.phone || '').replace(/\D/g, '');
                const first   = (c.name || 'cliente').split(' ')[0];
                const msg     = encodeURIComponent(`🎂 Feliz Aniversário, ${first}! 🌸\n\nDesejamos um dia especial cheio de alegrias e realizações. Que este novo ano seja incrível para você!\n\nCom carinho,\nStudiobeauty 💕`);
                const waUrl   = phone ? `https://wa.me/55${phone}?text=${msg}` : null;
                const initials = (c.name || '?').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
                return `
                <div class="flex items-center gap-3 bg-gradient-to-r from-[#FAF4ED] to-[#F0D9DC] rounded-xl p-3 border border-[#E8C5C8]/50">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#58323F] to-[#7A4A57] flex items-center justify-center text-white font-black text-sm shrink-0">${initials}</div>
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-on-surface text-sm truncate">${c.name || '—'}</p>
                        <p class="text-[10px] text-[#6B4F56] font-semibold">🎉 Aniversariante hoje!</p>
                    </div>
                    ${waUrl ? `
                    <a href="${waUrl}" target="_blank" rel="noopener"
                       class="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-white hover:bg-[#1ebe5d] active:scale-95 transition-all shadow-sm" title="Enviar parabéns">
                        <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>` : ''}
                </div>`;
            }).join('');
        } catch (e) { /* ignore */ }
    },

    // Estoque baixo (mantido)
    async checkLowInventory() {
        try {
            const items = await Store.getInventory();
            const low = items.filter(i => (i.quantity || 0) <= (i.minQuantity || 5));
            const alertBox   = document.getElementById('inventory-alert');
            const alertItems = document.getElementById('inventory-alert-items');
            if (!alertBox || !alertItems) return;
            window.__lowStockItems = low;

            if (low.length > 0) {
                alertBox.classList.remove('hidden');
                alertItems.innerHTML = low.slice(0, 4).map(i => `
                    <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-amber-600 text-lg">inventory</span>
                            <span class="text-sm font-semibold text-on-surface">${i.name}</span>
                        </div>
                        <span class="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">${i.quantity || 0} un.</span>
                    </div>`).join('');
            } else {
                alertBox.classList.add('hidden');
            }
        } catch (e) { /* ignore */ }
    },

    async exportReport() {
        App.showToast('Gerando relatório...', 'info');
        try {
            const stats = await Store.getDashboardStats();
            const today = new Date().toLocaleDateString('pt-BR');
            let csv = `Relatório Studiobeauty - ${today}\n\n`;
            csv += 'RESUMO\n';
            csv += `Total de Clientes,${stats.totalClients}\n`;
            csv += `Clientes Ativos,${stats.activeClients}\n`;
            csv += `Prospectos,${stats.prospects}\n`;
            csv += `Inativos,${stats.inactiveClients}\n`;
            csv += `Agendamentos Hoje,${stats.todayAppointments}\n\n`;
            csv += 'CLIENTES\nNome,E-mail,Telefone,Status\n';
            stats.clients.forEach(c => {
                csv += `"${c.name || ''}","${c.email || ''}","${c.phone || ''}","${c.status || ''}"\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url; a.download = `studiobeauty_${today.replace(/\//g, '-')}.csv`; a.click();
            URL.revokeObjectURL(url);
            App.showToast('Relatório exportado!', 'success');
        } catch (e) {
            App.showToast('Erro ao exportar: ' + e.message, 'error');
        }
    },

    loadNPS() {
        try {
            const responses = JSON.parse(localStorage.getItem('nps_responses') || '[]');
            const total      = responses.length;
            const scoreEl    = document.getElementById('dash-nps-score');
            const labelEl    = document.getElementById('dash-nps-label');
            const barEl      = document.getElementById('dash-nps-bar');
            if (!scoreEl) return;

            if (total === 0) {
                scoreEl.textContent = '--';
                if (labelEl) labelEl.textContent = 'Sem respostas ainda';
                return;
            }

            const promoters  = responses.filter(r => r.score >= 9).length;
            const detractors = responses.filter(r => r.score <= 6).length;
            const nps        = Math.round(((promoters - detractors) / total) * 100);

            scoreEl.textContent = (nps > 0 ? '+' : '') + nps;

            const { label } = nps >= 75 ? { label: `🏆 Excelência · ${total} resposta${total !== 1 ? 's' : ''}` } :
                              nps >= 50 ? { label: `😊 Favorável · ${total} resposta${total !== 1 ? 's' : ''}` } :
                              nps >= 0  ? { label: `📈 Em melhoria · ${total} resposta${total !== 1 ? 's' : ''}` } :
                                          { label: `⚠️ Crítico · ${total} resposta${total !== 1 ? 's' : ''}` };
            if (labelEl) labelEl.textContent = label;

            // Barra de progresso (NPS -100 a +100 → 0% a 100%)
            const pct = Math.max(0, Math.min(100, (nps + 100) / 2));
            setTimeout(() => { if (barEl) barEl.style.width = pct + '%'; }, 300);
        } catch (e) {
            console.warn('Erro ao carregar NPS no Dashboard:', e);
        }
    }
};
