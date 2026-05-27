// === Bolsa da Beleza SB Page ===
const BolsaBelezaSBPage = {
    state: {
        currentStep: 1, // 1: Diagnóstico & Metas, 2: Tabela de Serviços, 3: Atribuição de Notas, 4: Dashboard
        metas: {
            nome: "",
            local: "Home", // Home, Compartilhado, Salao, Outro
            capacidadeSemanal: 0,
            realizadoSemanal: 0,
            cancelamentosSemanal: 0,
            procedimentosSemanal: 0,
            metaFinanceira: 0,
            qualitativa1: "", // serviço que paga mais rápido
            qualitativa2: "", // serviço que exige mais tempo
            qualitativa3: "", // serviço que paga bem, mas é instável
            qualitativa4: "", // serviço rápido com risco alto
            qualitativa5: "", // serviço que cortaria para reduzir 30% tempo
            qualitativa6: "", // serviço que mais gosta
            qualitativa7: ""  // serviço que menos gosta
        },
        servicos: [
            // { id, nome, tempo, valor, atendimentos3Meses, custo }
        ],
        notas: {
            // { servicoId: { risco, liquidez } }
        },
        servicoEstrategicoId: null,
        cronogramaProgresso: {
            // { dia1: true, dia2: false, ... }
        }
    },

    loadState() {
        const saved = localStorage.getItem('bolsa_beleza_sb_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Mesclar com o estado padrão para evitar que campos novos fiquem indefinidos
                this.state = {
                    ...this.state,
                    ...parsed,
                    metas: { ...this.state.metas, ...parsed.metas },
                    cronogramaProgresso: { ...this.state.cronogramaProgresso, ...parsed.cronogramaProgresso }
                };
            } catch (e) {
                console.error("Erro ao carregar estado do localStorage:", e);
            }
        }
    },

    saveState() {
        localStorage.setItem('bolsa_beleza_sb_state', JSON.stringify(this.state));
    },

    render() {
        this.loadState();
        return `
        <style>
            @media print {
                aside, #sidebar, header, #bottom-nav, #sidebar-overlay, #bolsa-stepper,
                #btn-prev-step4, #btn-reset-diagnostico, #btn-export-pdf, .btn-copy-script,
                #srv-strategico, label[for="srv-strategico"], .absolute, .pointer-events-none {
                    display: none !important;
                }
                @page {
                    size: A4;
                    margin: 1.2cm;
                }
                body {
                    background: white !important;
                    color: #2C1810 !important;
                    font-size: 11pt !important;
                }
                main {
                    margin-left: 0 !important;
                    padding: 0 !important;
                }
                .max-w-7xl {
                    max-width: 100% !important;
                    width: 100% !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    background-color: transparent !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                }
                .grid {
                    display: grid !important;
                }
                .bg-white\\/80 {
                    background: white !important;
                    border: 1px solid #e2e8f0 !important;
                    box-shadow: none !important;
                    border-radius: 12px !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                }
                tr, th, td {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                .bg-gradient-to-br, #rebalance-campaign-panel, .grid-cols-1 {
                    page-break-inside: auto !important;
                }
                .flex.items-start.gap-3.p-3\\.5 {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    border: 1px solid #e2e8f0 !important;
                    background: white !important;
                    margin-bottom: 8px !important;
                }
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        </style>
        <div class="px-6 py-8 pb-32 md:pb-8 max-w-7xl mx-auto animation-fade-in text-[#2C1810]" style="background-color: #fcf9f7; min-height: 80vh; border-radius: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(201, 124, 92, 0.05);">
            <!-- Elementos de Glassmorphism decorativos de fundo -->
            <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#f4a2a2]/15 rounded-full blur-[120px] pointer-events-none"></div>
            <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#c97c5c]/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div class="relative z-10 space-y-8">
                <!-- Cabeçalho Principal -->
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#c97c5c]/20">
                    <div>
                        <h1 class="font-headline font-extrabold text-3xl tracking-tight flex items-center gap-3 text-[#2C1810] md:text-4xl">
                            <span class="material-symbols-outlined text-[#c97c5c] text-4xl md:text-5xl" style="font-variation-settings: 'FILL' 1;">payments</span>
                            Bolsa da Beleza SB™
                        </h1>
                        <p class="text-sm font-semibold text-[#7A5C54] mt-1.5 max-w-2xl leading-relaxed">
                            Módulo avançado de gestão financeira. Pare de trabalhar no escuro e transforme seus procedimentos de beleza em uma Carteira de Ativos altamente rentável.
                        </p>
                    </div>
                    <!-- Stepper Visual -->
                    <div id="bolsa-stepper" class="flex items-center gap-2 bg-[#ffffff]/70 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#c97c5c]/15 shadow-sm overflow-x-auto shrink-0 scrollbar-none">
                        <!-- Renderizado dinamicamente pelo renderStep -->
                    </div>
                </div>

                <!-- Conteúdo do Step Ativo -->
                <div id="bolsa-step-content" class="transition-all duration-300">
                    <!-- Renderizado dinamicamente -->
                </div>
            </div>
        </div>
        `;
    },

    init() {
        this.loadState();
        this.renderStep();
    },

    renderStep() {
        const step = this.state.currentStep;
        this.renderStepper();
        
        const contentContainer = document.getElementById('bolsa-step-content');
        if (!contentContainer) return;

        if (step === 1) {
            contentContainer.innerHTML = this.renderStep1();
            this.initStep1();
        } else if (step === 2) {
            contentContainer.innerHTML = this.renderStep2();
            this.initStep2();
        } else if (step === 3) {
            contentContainer.innerHTML = this.renderStep3();
            this.initStep3();
        } else if (step === 4) {
            contentContainer.innerHTML = this.renderStep4();
            this.initStep4();
        }
    },

    renderStepper() {
        const stepper = document.getElementById('bolsa-stepper');
        if (!stepper) return;

        const steps = [
            { num: 1, label: "Diagnóstico", icon: "troubleshoot" },
            { num: 2, label: "Serviços", icon: "tactic" },
            { num: 3, label: "Notas", icon: "fact_check" },
            { num: 4, label: "Dashboard", icon: "finance" }
        ];

        stepper.innerHTML = steps.map((s, idx) => {
            const isActive = s.num === this.state.currentStep;
            const isCompleted = s.num < this.state.currentStep;
            
            let bgClass = "bg-slate-100 text-slate-400 border-transparent";
            if (isActive) {
                bgClass = "bg-gradient-to-r from-[#c97c5c] to-[#a0522d] text-white border-[#c97c5c]";
            } else if (isCompleted) {
                bgClass = "bg-[#c97c5c]/10 text-[#c97c5c] border-[#c97c5c]/30";
            }

            return `
                <div class="flex items-center gap-1.5">
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs ${bgClass} transition-all duration-300">
                        <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' ${isCompleted || isActive ? 1 : 0}">${s.icon}</span>
                        <span>${s.label}</span>
                    </div>
                    ${idx < steps.length - 1 ? `
                        <span class="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
                    ` : ''}
                </div>
            `;
        }).join('');
    },

    // === ETAPA 1: DIAGNÓSTICO INICIAL E METAS ===
    renderStep1() {
        const metas = this.state.metas;
        const localOptions = [
            { value: "Home", label: "Home / Domicílio", icon: "home" },
            { value: "Compartilhado", label: "Espaço Compartilhado", icon: "groups" },
            { value: "Salao", label: "Salão / Estúdio Próprio", icon: "store" },
            { value: "Outro", label: "Outro Local", icon: "location_on" }
        ];

        return `
        <div class="space-y-8 animation-fade-in">
            <!-- Card de Condução e Mentoria Inicial -->
            <div class="bg-gradient-to-r from-[#c97c5c]/5 to-[#f4a2a2]/15 border border-[#c97c5c]/15 rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-start gap-5 shadow-sm">
                <div class="w-12 h-12 rounded-2xl bg-[#c97c5c] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#c97c5c]/25">
                    <span class="material-symbols-outlined text-2xl">wb_incandescent</span>
                </div>
                <div class="space-y-2">
                    <h3 class="font-headline font-bold text-lg text-[#2C1810]">Boas-vindas ao Diagnóstico da Bolsa da Beleza</h3>
                    <p class="text-sm text-[#7A5C54] leading-relaxed">
                        Nesta primeira etapa, faremos um <strong>raio-x dos seus últimos 3 meses de atendimento</strong>. Não se preocupe se não tiver números exatos ao centavo; estimativas conscientes são suficientes. Responder a estas perguntas qualitativas e quantitativas nos ajudará a mapear a saúde e o perfil da sua agenda. Vamos tirar seu estúdio do escuro!
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Coluna 1: Métricas Operacionais (Dados Quantitativos) -->
                <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-[#c97c5c]/10 shadow-sm space-y-6">
                    <div class="border-b border-slate-100 pb-4">
                        <h4 class="font-headline font-bold text-lg flex items-center gap-2 text-[#2C1810]">
                            <span class="material-symbols-outlined text-[#c97c5c]">query_stats</span>
                            1. Métricas do Estúdio (Médias dos Últimos 3 Meses)
                        </h4>
                        <p class="text-xs text-[#7A5C54] mt-1">Como tem sido a dinâmica da sua rotina semanal e metas financeiras.</p>
                    </div>

                    <!-- Nome do Profissional -->
                    <div class="space-y-2">
                        <label class="block font-label text-xs font-bold uppercase tracking-wider text-[#7A5C54] ml-1" for="meta-nome">Seu Nome Profissional</label>
                        <div class="relative">
                            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person</span>
                            <input class="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl transition-all text-sm text-[#2C1810]" 
                                   id="meta-nome" type="text" placeholder="Ex: Studiobeauty" value="${metas.nome || ''}" required />
                        </div>
                    </div>

                    <!-- Local de Atendimento (Grupo de botões estilizados) -->
                    <div class="space-y-2">
                        <label class="block font-label text-xs font-bold uppercase tracking-wider text-[#7A5C54] ml-1">Onde você atende?</label>
                        <div class="grid grid-cols-2 gap-3" id="meta-local-group">
                            ${localOptions.map(opt => {
                                const isSelected = metas.local === opt.value;
                                const activeClass = isSelected ? "border-[#c97c5c] bg-[#c97c5c]/5 text-[#c97c5c] font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-600";
                                return `
                                    <button type="button" class="local-btn flex items-center gap-2.5 p-3 rounded-2xl border text-xs text-left transition-all ${activeClass}" data-value="${opt.value}">
                                        <span class="material-symbols-outlined text-base ${isSelected ? 'text-[#c97c5c]' : 'text-slate-400'}">${opt.icon}</span>
                                        <span>${opt.label}</span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Capacidade Física Semanal -->
                        <div class="space-y-2">
                            <label class="block font-label text-xs font-bold uppercase tracking-wider text-[#7A5C54] ml-1" for="meta-capacidade">Capacidade Máxima / Semana</label>
                            <div class="relative">
                                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">event_busy</span>
                                <input class="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl transition-all text-sm text-[#2C1810]" 
                                       id="meta-capacidade" type="number" min="1" placeholder="Ex: 30 agendamentos" value="${metas.capacidadeSemanal || ''}" required />
                            </div>
                        </div>

                        <!-- Realizado Semanal -->
                        <div class="space-y-2">
                            <label class="block font-label text-xs font-bold uppercase tracking-wider text-[#7A5C54] ml-1" for="meta-realizado">Atendimentos Reais / Semana</label>
                            <div class="relative">
                                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">event_available</span>
                                <input class="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl transition-all text-sm text-[#2C1810]" 
                                       id="meta-realizado" type="number" min="0" placeholder="Ex: 18 agendamentos" value="${metas.realizadoSemanal || ''}" required />
                            </div>
                        </div>

                        <!-- Cancelamentos por Semana -->
                        <div class="space-y-2">
                            <label class="block font-label text-xs font-bold uppercase tracking-wider text-[#7A5C54] ml-1" for="meta-cancelamentos">Cancelamentos / Semana</label>
                            <div class="relative">
                                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">block</span>
                                <input class="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl transition-all text-sm text-[#2C1810]" 
                                       id="meta-cancelamentos" type="number" min="0" placeholder="Ex: 3 desmarcações" value="${metas.cancelamentosSemanal || ''}" required />
                            </div>
                        </div>

                        <!-- Procedimentos por Semana -->
                        <div class="space-y-2">
                            <label class="block font-label text-xs font-bold uppercase tracking-wider text-[#7A5C54] ml-1" for="meta-procedimentos">Procedimentos Feitos / Semana</label>
                            <div class="relative">
                                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">history_edu</span>
                                <input class="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl transition-all text-sm text-[#2C1810]" 
                                       id="meta-procedimentos" type="number" min="0" placeholder="Ex: 22 procedimentos" value="${metas.procedimentosSemanal || ''}" required />
                            </div>
                        </div>
                    </div>

                    <!-- Meta de Faturamento Mensal -->
                    <div class="space-y-2 pt-2 border-t border-slate-100">
                        <label class="block font-label text-xs font-bold uppercase tracking-wider text-[#7A5C54] ml-1" for="meta-faturamento">Quanto deseja faturar por mês? (R$ Meta)</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                            <input class="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl transition-all text-sm font-bold text-[#2C1810]" 
                                   id="meta-faturamento" type="number" min="1" placeholder="Ex: 10000" value="${metas.metaFinanceira || ''}" required />
                        </div>
                    </div>
                </div>

                <!-- Coluna 2: Perguntas Qualitativas (Percepções) -->
                <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-[#c97c5c]/10 shadow-sm space-y-6">
                    <div class="border-b border-slate-100 pb-4">
                        <h4 class="font-headline font-bold text-lg flex items-center gap-2 text-[#2C1810]">
                            <span class="material-symbols-outlined text-[#c97c5c]">psychology</span>
                            2. Mapeamento de Percepção (Metodologia Qualitativa)
                        </h4>
                        <p class="text-xs text-[#7A5C54] mt-1">Como você percebe e se sente em relação aos seus serviços atuais.</p>
                    </div>

                    <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                        <!-- Pergunta 1 -->
                        <div class="space-y-1.5">
                            <label class="block font-label text-xs font-bold text-[#2C1810] ml-1" for="meta-q1">1. Qual serviço te paga mais rápido (dinheiro cai na hora e vende fácil)?</label>
                            <textarea class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl text-xs text-[#2C1810] resize-none" 
                                      id="meta-q1" rows="2" placeholder="Ex: Manutenção rápida de cílios clássico...">${metas.qualitativa1 || ''}</textarea>
                        </div>

                        <!-- Pergunta 2 -->
                        <div class="space-y-1.5">
                            <label class="block font-label text-xs font-bold text-[#2C1810] ml-1" for="meta-q2">2. Qual serviço exige mais tempo (consome horas de dedicação)?</label>
                            <textarea class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl text-xs text-[#2C1810] resize-none" 
                                      id="meta-q2" rows="2" placeholder="Ex: Extensão volumão mega russo primeira colocação...">${metas.qualitativa2 || ''}</textarea>
                        </div>

                        <!-- Pergunta 3 -->
                        <div class="space-y-1.5">
                            <label class="block font-label text-xs font-bold text-[#2C1810] ml-1" for="meta-q3">3. Qual serviço te paga bem, mas é instável (demanda oscila muito)?</label>
                            <textarea class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl text-xs text-[#2C1810] resize-none" 
                                      id="meta-q3" rows="2" placeholder="Ex: Micropigmentação Labial premium...">${metas.qualitativa3 || ''}</textarea>
                        </div>

                        <!-- Pergunta 4 -->
                        <div class="space-y-1.5">
                            <label class="block font-label text-xs font-bold text-[#2C1810] ml-1" for="meta-q4">4. Qual serviço é rápido, mas tem risco alto (moda passageira ou muita concorrência)?</label>
                            <textarea class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl text-xs text-[#2C1810] resize-none" 
                                      id="meta-q4" rows="2" placeholder="Ex: Lash Lifting modista com muita concorrência desleal...">${metas.qualitativa4 || ''}</textarea>
                        </div>

                        <!-- Pergunta 5 -->
                        <div class="space-y-1.5">
                            <label class="block font-label text-xs font-bold text-[#2C1810] ml-1" for="meta-q5">5. Se pudesse reduzir 30% do seu tempo de trabalho mantendo o lucro, qual cortaria primeiro?</label>
                            <textarea class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl text-xs text-[#2C1810] resize-none" 
                                      id="meta-q5" rows="2" placeholder="Ex: Corte de cabelo ou serviço de manicure simples...">${metas.qualitativa5 || ''}</textarea>
                        </div>

                        <!-- Pergunta 6 -->
                        <div class="space-y-1.5">
                            <label class="block font-label text-xs font-bold text-[#2C1810] ml-1" for="meta-q6">6. Qual serviço você mais sente prazer em fazer?</label>
                            <textarea class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl text-xs text-[#2C1810] resize-none" 
                                      id="meta-q6" rows="2" placeholder="Ex: Sobrancelhas com design e henna personalizada...">${metas.qualitativa6 || ''}</textarea>
                        </div>

                        <!-- Pergunta 7 -->
                        <div class="space-y-1.5">
                            <label class="block font-label text-xs font-bold text-[#2C1810] ml-1" for="meta-q7">7. Qual serviço você menos gosta de fazer e te deixa mais cansada?</label>
                            <textarea class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl text-xs text-[#2C1810] resize-none" 
                                      id="meta-q7" rows="2" placeholder="Ex: Extensões de cílios com técnica antiga demorada...">${metas.qualitativa7 || ''}</textarea>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Controles do Stepper no Rodapé -->
            <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="button" id="btn-next-step1" class="bg-gradient-to-r from-[#c97c5c] to-[#a0522d] hover:opacity-90 active:scale-[0.98] transition-all text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-[#c97c5c]/20 flex items-center gap-2.5 text-sm md:text-base">
                    Avançar: Cadastrar Serviços
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>
        </div>
        `;
    },

    initStep1() {
        // Listeners de Local de Atendimento
        const localBtns = document.querySelectorAll('.local-btn');
        localBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                localBtns.forEach(b => {
                    b.classList.remove('border-[#c97c5c]', 'bg-[#c97c5c]/5', 'text-[#c97c5c]', 'font-bold');
                    b.classList.add('border-slate-200', 'hover:bg-slate-50', 'text-slate-600');
                    b.querySelector('span').classList.remove('text-[#c97c5c]');
                    b.querySelector('span').classList.add('text-slate-400');
                });
                
                btn.classList.add('border-[#c97c5c]', 'bg-[#c97c5c]/5', 'text-[#c97c5c]', 'font-bold');
                btn.classList.remove('border-slate-200', 'hover:bg-slate-50', 'text-slate-600');
                btn.querySelector('span').classList.add('text-[#c97c5c]');
                btn.querySelector('span').classList.remove('text-slate-400');
                
                this.state.metas.local = btn.dataset.value;
                this.saveState();
            });
        });

        // Eventos de entrada em tempo real para inputs/textareas
        const bindInput = (id, statePath) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input', () => {
                let val = el.value;
                if (el.type === 'number') val = parseFloat(val) || 0;
                
                // Grava no caminho de dados
                const keys = statePath.split('.');
                let current = this.state;
                for (let i = 0; i < keys.length - 1; i++) {
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = val;
                
                this.saveState();
            });
        };

        bindInput('meta-nome', 'metas.nome');
        bindInput('meta-capacidade', 'metas.capacidadeSemanal');
        bindInput('meta-realizado', 'metas.realizadoSemanal');
        bindInput('meta-cancelamentos', 'metas.cancelamentosSemanal');
        bindInput('meta-procedimentos', 'metas.procedimentosSemanal');
        bindInput('meta-faturamento', 'metas.metaFinanceira');
        
        bindInput('meta-q1', 'metas.qualitativa1');
        bindInput('meta-q2', 'metas.qualitativa2');
        bindInput('meta-q3', 'metas.qualitativa3');
        bindInput('meta-q4', 'metas.qualitativa4');
        bindInput('meta-q5', 'metas.qualitativa5');
        bindInput('meta-q6', 'metas.qualitativa6');
        bindInput('meta-q7', 'metas.qualitativa7');

        // Botão Avançar
        document.getElementById('btn-next-step1')?.addEventListener('click', () => {
            const nomeInput = document.getElementById('meta-nome');
            if (nomeInput && !nomeInput.value.trim()) {
                App.showToast('Por favor, informe seu nome profissional para prosseguir!', 'error');
                nomeInput.focus();
                return;
            }
            
            const faturamentoInput = document.getElementById('meta-faturamento');
            if (faturamentoInput && (parseFloat(faturamentoInput.value) || 0) <= 0) {
                App.showToast('Por favor, defina uma meta de faturamento positiva!', 'error');
                faturamentoInput.focus();
                return;
            }

            this.state.currentStep = 2;
            this.saveState();
            this.renderStep();
        });
    },
    // === ETAPA 2: TABELA DE SERVIÇOS REATIVA ===
    renderStep2() {
        // Inicializar com exemplos práticos caso a lista esteja vazia para evitar tela vazia (Zero Cold Start)
        if (this.state.servicos.length === 0) {
            this.state.servicos = [
                { id: "ex-1", nome: "Extensão de Cílios Fio a Fio", tempo: 120, valor: 150, atendimentos3Meses: 24, custo: 30 },
                { id: "ex-2", nome: "Design de Sobrancelha Simples", tempo: 30, valor: 45, atendimentos3Meses: 60, custo: 5 },
                { id: "ex-3", nome: "Micropigmentação Labial", tempo: 150, valor: 450, atendimentos3Meses: 6, custo: 60 }
            ];
            this.saveState();
        }

        return `
        <div class="space-y-8 animation-fade-in text-[#2C1810]">
            <!-- Card de Condução e Mentoria da Etapa 2 -->
            <div class="bg-gradient-to-r from-[#c97c5c]/5 to-[#f4a2a2]/15 border border-[#c97c5c]/15 rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-start gap-5 shadow-sm">
                <div class="w-12 h-12 rounded-2xl bg-[#c97c5c] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#c97c5c]/25">
                    <span class="material-symbols-outlined text-2xl">insights</span>
                </div>
                <div class="space-y-2">
                    <h3 class="font-headline font-bold text-lg text-[#2C1810]">A Tabela Dinâmica de Procedimentos</h3>
                    <p class="text-sm text-[#7A5C54] leading-relaxed">
                        Mapeie todos os serviços prestados no seu estúdio. Insira os dados reais em cada célula da tabela. O sistema calculará instantaneamente o seu <strong>Lucro Líquido</strong> e a <strong>Eficiência da Hora R$ 100</strong> (fórmula exclusiva da Bolsa da Beleza™ que mostra quantos minutos de trabalho você precisa dedicar a cada serviço para colocar R$ 100 limpos no seu bolso).
                    </p>
                </div>
            </div>

            <!-- Tabela de Cadastro e Edição -->
            <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-[#c97c5c]/10 shadow-sm space-y-6 overflow-hidden">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                        <h4 class="font-headline font-bold text-lg flex items-center gap-2 text-[#2C1810]">
                            <span class="material-symbols-outlined text-[#c97c5c]">table_chart</span>
                            Grade Operacional de Serviços
                        </h4>
                        <p class="text-xs text-[#7A5C54] mt-1">Os campos são editáveis diretamente. Suas alterações são gravadas na hora.</p>
                    </div>
                    <!-- Botão Adicionar Procedimento -->
                    <button type="button" id="btn-add-service" class="bg-[#c97c5c]/10 hover:bg-[#c97c5c]/20 text-[#c97c5c] font-bold px-5 py-2.5 rounded-xl border border-[#c97c5c]/20 transition-all flex items-center gap-2 text-xs">
                        <span class="material-symbols-outlined text-sm font-extrabold">add</span>
                        Adicionar Procedimento
                    </button>
                </div>

                <!-- Tabela Responsiva Scrollable -->
                <div class="overflow-x-auto rounded-2xl border border-slate-100 scrollbar-thin">
                    <table class="w-full text-left border-collapse" id="table-services">
                        <thead>
                            <tr class="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                <th class="py-4 px-4 font-label min-w-[200px]">Procedimento</th>
                                <th class="py-4 px-3 font-label text-center min-w-[90px]">Tempo (min)</th>
                                <th class="py-4 px-3 font-label text-center min-w-[100px]">Valor Cobrado (R$)</th>
                                <th class="py-4 px-3 font-label text-center min-w-[110px]">Atendimentos / 3m</th>
                                <th class="py-4 px-3 font-label text-center min-w-[100px]">Custo Insumos (R$)</th>
                                <th class="py-4 px-3 font-label text-center min-w-[100px] text-[#c97c5c]">Lucro Líquido</th>
                                <th class="py-4 px-3 font-label text-center min-w-[110px] text-[#a0522d]">Hora R$ 100</th>
                                <th class="py-4 px-4 font-label text-center min-w-[70px]">Ação</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100" id="services-tbody">
                            ${this.state.servicos.map(s => {
                                const lucro = s.valor - s.custo;
                                const tempoR100 = lucro > 0 ? ((100 * s.tempo) / lucro) : 0;
                                const formattedTempo100 = lucro > 0 ? `${Math.round(tempoR100)} min` : '---';
                                
                                return `
                                <tr class="hover:bg-slate-50/50 transition-colors" data-id="${s.id}">
                                    <!-- Nome -->
                                    <td class="py-3 px-3">
                                        <input class="w-full bg-slate-50 border border-slate-200 focus:border-[#c97c5c] focus:ring-1 focus:ring-[#c97c5c]/20 rounded-xl px-3 py-2 text-xs font-semibold service-nome" 
                                               type="text" value="${s.nome}" placeholder="Nome do serviço" />
                                    </td>
                                    <!-- Tempo -->
                                    <td class="py-3 px-2 text-center">
                                        <input class="w-20 bg-slate-50 border border-slate-200 focus:border-[#c97c5c] focus:ring-1 focus:ring-[#c97c5c]/20 rounded-xl px-2 py-2 text-xs font-bold text-center service-tempo" 
                                               type="number" min="1" value="${s.tempo}" placeholder="Ex: 60" />
                                    </td>
                                    <!-- Valor -->
                                    <td class="py-3 px-2 text-center">
                                        <input class="w-24 bg-slate-50 border border-slate-200 focus:border-[#c97c5c] focus:ring-1 focus:ring-[#c97c5c]/20 rounded-xl px-2 py-2 text-xs font-bold text-center service-valor" 
                                               type="number" min="0" value="${s.valor}" placeholder="Ex: 150" />
                                    </td>
                                    <!-- Atendimentos em 3 meses -->
                                    <td class="py-3 px-2 text-center">
                                        <input class="w-24 bg-slate-50 border border-slate-200 focus:border-[#c97c5c] focus:ring-1 focus:ring-[#c97c5c]/20 rounded-xl px-2 py-2 text-xs font-bold text-center service-atendimentos" 
                                               type="number" min="0" value="${s.atendimentos3Meses}" placeholder="Ex: 30" />
                                    </td>
                                    <!-- Custo -->
                                    <td class="py-3 px-2 text-center">
                                        <input class="w-24 bg-slate-50 border border-slate-200 focus:border-[#c97c5c] focus:ring-1 focus:ring-[#c97c5c]/20 rounded-xl px-2 py-2 text-xs font-bold text-center service-custo" 
                                               type="number" min="0" value="${s.custo}" placeholder="Ex: 15" />
                                    </td>
                                    <!-- Lucro Líquido (Calculado) -->
                                    <td class="py-3 px-3 text-center text-xs font-bold text-[#c97c5c] cell-lucro">
                                        R$ ${lucro.toFixed(2)}
                                    </td>
                                    <!-- Hora R$ 100 (Calculado) -->
                                    <td class="py-3 px-3 text-center text-xs font-black text-[#a0522d] cell-tempo100">
                                        ${formattedTempo100}
                                    </td>
                                    <!-- Exclusão -->
                                    <td class="py-3 px-3 text-center">
                                        <button type="button" class="btn-delete-service p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors active:scale-95" title="Remover procedimento">
                                            <span class="material-symbols-outlined text-base">delete</span>
                                        </button>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Dica de Mentoria Exclusiva -->
                <div class="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-[#7A5C54]">
                    <span class="material-symbols-outlined text-amber-600 shrink-0 text-base" style="font-variation-settings: 'FILL' 1;">lightbulb</span>
                    <span>
                        <strong>Dica de Mentoria:</strong> Se a sua <strong>"Hora R$ 100"</strong> for menor que 60 minutos, parabéns! Você tem um serviço extremamente produtivo e rápido para encher o caixa. Se ela passar de 90 minutos, significa que você está passando muito tempo concentrada para ter o mesmo retorno de R$ 100 límpidos. Fique atenta aos Ativos demorados!
                    </span>
                </div>
            </div>

            <!-- Controles do Stepper no Rodapé -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                <button type="button" id="btn-prev-step2" class="bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all text-slate-700 font-bold px-6 py-3.5 rounded-2xl flex items-center gap-2 text-xs md:text-sm shadow-sm">
                    <span class="material-symbols-outlined text-sm">arrow_back</span>
                    Voltar: Diagnóstico
                </button>
                <button type="button" id="btn-next-step2" class="bg-gradient-to-r from-[#c97c5c] to-[#a0522d] hover:opacity-90 active:scale-[0.98] transition-all text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-[#c97c5c]/20 flex items-center gap-2.5 text-sm md:text-base">
                    Avançar: Classificar Ativos
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>
        </div>
        `;
    },

    initStep2() {
        const table = document.getElementById('table-services');
        if (!table) return;

        // Listener Delegado para Inputs de Célula
        table.addEventListener('input', (e) => {
            const input = e.target;
            if (!input.classList.contains('service-nome') && 
                !input.classList.contains('service-tempo') && 
                !input.classList.contains('service-valor') && 
                !input.classList.contains('service-atendimentos') && 
                !input.classList.contains('service-custo')) return;

            const tr = input.closest('tr');
            const rowId = tr.dataset.id;
            const index = this.state.servicos.findIndex(s => s.id === rowId);
            if (index === -1) return;

            // Coletar valores e atualizar estado local
            const nome = tr.querySelector('.service-nome').value;
            const tempo = parseFloat(tr.querySelector('.service-tempo').value) || 0;
            const valor = parseFloat(tr.querySelector('.service-valor').value) || 0;
            const atendimentos = parseFloat(tr.querySelector('.service-atendimentos').value) || 0;
            const custo = parseFloat(tr.querySelector('.service-custo').value) || 0;

            this.state.servicos[index] = {
                ...this.state.servicos[index],
                nome,
                tempo,
                valor,
                atendimentos3Meses: atendimentos,
                custo
            };
            this.saveState();

            // Atualizar os cálculos reativos na linha do DOM
            const lucro = valor - custo;
            const tempoR100 = lucro > 0 ? ((100 * tempo) / lucro) : 0;
            
            const lucroEl = tr.querySelector('.cell-lucro');
            const tempo100El = tr.querySelector('.cell-tempo100');
            
            if (lucroEl) lucroEl.textContent = `R$ ${lucro.toFixed(2)}`;
            if (tempo100El) {
                tempo100El.textContent = lucro > 0 ? `${Math.round(tempoR100)} min` : '---';
            }
        });

        // Clique para Remover Serviço
        const deleteBtns = document.querySelectorAll('.btn-delete-service');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tr = btn.closest('tr');
                const rowId = tr.dataset.id;
                
                if (this.state.servicos.length <= 1) {
                    App.showToast('Você deve manter pelo menos 1 serviço cadastrado!', 'error');
                    return;
                }

                if (confirm('Deseja realmente remover este procedimento?')) {
                    this.state.servicos = this.state.servicos.filter(s => s.id !== rowId);
                    
                    // Remover notas associadas para limpeza de estado
                    if (this.state.notas[rowId]) {
                        delete this.state.notas[rowId];
                    }
                    
                    this.saveState();
                    this.renderStep();
                }
            });
        });

        // Botão para Adicionar Novo Serviço
        document.getElementById('btn-add-service')?.addEventListener('click', () => {
            const newId = "srv-" + Date.now().toString(36);
            const newService = {
                id: newId,
                nome: "Novo Procedimento",
                tempo: 60,
                valor: 100,
                atendimentos3Meses: 10,
                custo: 10
            };
            this.state.servicos.push(newService);
            this.saveState();
            this.renderStep();
            
            // Focar no novo input de nome adicionado
            const lastTr = table.querySelector(`tr[data-id="${newId}"]`);
            if (lastTr) {
                const inputNome = lastTr.querySelector('.service-nome');
                inputNome?.focus();
                inputNome?.select();
            }
        });

        // Navegação Voltar
        document.getElementById('btn-prev-step2')?.addEventListener('click', () => {
            this.state.currentStep = 1;
            this.saveState();
            this.renderStep();
        });

        // Navegação Avançar
        document.getElementById('btn-next-step2')?.addEventListener('click', () => {
            // Validar tabela inteira
            for (const s of this.state.servicos) {
                if (!s.nome.trim()) {
                    App.showToast('Por favor, preencha o nome de todos os procedimentos!', 'error');
                    return;
                }
                if (s.tempo <= 0) {
                    App.showToast(`O tempo do serviço "${s.nome}" deve ser maior que 0!`, 'error');
                    return;
                }
                if (s.valor <= 0) {
                    App.showToast(`O valor cobrado pelo serviço "${s.nome}" deve ser maior que 0!`, 'error');
                    return;
                }
                if (s.valor <= s.custo) {
                    App.showToast(`Alerta: O serviço "${s.nome}" tem custo maior ou igual ao preço cobrado! Ajuste para gerar lucro.`, 'error');
                    return;
                }
            }

            this.state.currentStep = 3;
            this.saveState();
            this.renderStep();
        });
    },

    // === ETAPA 3: AVALIAÇÃO DE NOTAS DE ATIVOS ===
    renderStep3() {
        return `
        <div class="space-y-8 animation-fade-in text-[#2C1810]">
            <!-- Card de Condução e Mentoria da Etapa 3 -->
            <div class="bg-gradient-to-r from-[#c97c5c]/5 to-[#f4a2a2]/15 border border-[#c97c5c]/15 rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-start gap-5 shadow-sm">
                <div class="w-12 h-12 rounded-2xl bg-[#c97c5c] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#c97c5c]/25">
                    <span class="material-symbols-outlined text-2xl">fact_check</span>
                </div>
                <div class="space-y-2">
                    <h3 class="font-headline font-bold text-lg text-[#2C1810]">Classificando Risco e Liquidez dos seus Ativos</h3>
                    <p class="text-sm text-[#7A5C54] leading-relaxed">
                        Nesta etapa, você dará notas de <strong>1 a 5</strong> para dois conceitos cruciais do mercado de ativos aplicados à beleza: 
                        <strong>Risco</strong> (estabilidade da procura deste serviço ao longo do ano) e <strong>Liquidez</strong> (velocidade e facilidade de vender e agendar este serviço espontaneamente). O sistema já cruzou automaticamente a eficiência de tempo da etapa anterior!
                    </p>
                </div>
            </div>

            <!-- Listagem de Cartões de Ativos -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${this.state.servicos.map(s => {
                    const lucro = s.valor - s.custo;
                    const tempoR100 = lucro > 0 ? ((100 * s.tempo) / lucro) : 0;
                    const roundedTempo = Math.round(tempoR100);
                    
                    // Definir classe e texto do badge por cor
                    let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200/50";
                    let badgeLabel = "Altamente Eficiente";
                    if (roundedTempo > 60 && roundedTempo <= 75) {
                        badgeBg = "bg-amber-50 text-amber-700 border-amber-200/50";
                        badgeLabel = "Eficiente";
                    } else if (roundedTempo > 75 && roundedTempo <= 90) {
                        badgeBg = "bg-orange-50 text-orange-700 border-orange-200/50";
                        badgeLabel = "Eficiência Moderada";
                    } else if (roundedTempo > 90) {
                        badgeBg = "bg-rose-50 text-rose-700 border-rose-200/50";
                        badgeLabel = "Ineficiente / Alerta";
                    }

                    // Obter notas já atribuídas ou padrão 3
                    const userNotas = this.state.notas[s.id] || { risco: 3, liquidez: 3 };
                    
                    return `
                    <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-[#c97c5c]/10 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all duration-300 card-ativo" data-id="${s.id}">
                        <!-- Topo: Identidade do Serviço -->
                        <div class="space-y-3">
                            <h4 class="font-headline font-bold text-base text-[#2C1810] line-clamp-1">${s.nome}</h4>
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="px-2.5 py-1 rounded-xl text-[10px] font-bold border ${badgeBg}">
                                    ${roundedTempo} min / R$ 100
                                </span>
                                <span class="px-2.5 py-1 rounded-xl text-[10px] font-bold border bg-slate-50 border-slate-200 text-slate-500">
                                    ${badgeLabel}
                                </span>
                            </div>
                        </div>

                        <!-- Meio: Controles de Notas -->
                        <div class="space-y-5 pt-3 border-t border-slate-100">
                            <!-- Slider Risco -->
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    <label class="block font-label text-xs font-bold text-[#7A5C54] flex items-center gap-1.5">
                                        <span class="material-symbols-outlined text-sm text-[#c97c5c]">shield</span>
                                        Estabilidade (Risco):
                                    </label>
                                    <span class="text-xs font-black text-[#a0522d] score-risco">${userNotas.risco}/5</span>
                                </div>
                                <input class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#c97c5c] slider-risco" 
                                       type="range" min="1" max="5" value="${userNotas.risco}" />
                                <p class="text-[10px] font-medium text-slate-500 italic min-h-[30px] leading-tight text-risco-desc">
                                    Carregando descrição...
                                </p>
                            </div>

                            <!-- Slider Liquidez -->
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    <label class="block font-label text-xs font-bold text-[#7A5C54] flex items-center gap-1.5">
                                        <span class="material-symbols-outlined text-sm text-[#c97c5c]">sell</span>
                                        Facilidade Venda (Liquidez):
                                    </label>
                                    <span class="text-xs font-black text-[#a0522d] score-liquidez">${userNotas.liquidez}/5</span>
                                </div>
                                <input class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#c97c5c] slider-liquidez" 
                                       type="range" min="1" max="5" value="${userNotas.liquidez}" />
                                <p class="text-[10px] font-medium text-slate-500 italic min-h-[30px] leading-tight text-liquidez-desc">
                                    Carregando descrição...
                                </p>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>

            <!-- Controles do Stepper no Rodapé -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                <button type="button" id="btn-prev-step3" class="bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all text-slate-700 font-bold px-6 py-3.5 rounded-2xl flex items-center gap-2 text-xs md:text-sm shadow-sm">
                    <span class="material-symbols-outlined text-sm">arrow_back</span>
                    Voltar: Tabela de Serviços
                </button>
                <button type="button" id="btn-next-step3" class="bg-gradient-to-r from-[#c97c5c] to-[#a0522d] hover:opacity-90 active:scale-[0.98] transition-all text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-[#c97c5c]/20 flex items-center gap-2.5 text-sm md:text-base">
                    Avançar: Gerar Dashboard
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>
        </div>
        `;
    },

    initStep3() {
        const cards = document.querySelectorAll('.card-ativo');
        
        const descRisco = {
            1: "Instabilidade extrema: procura sazonal e esporádica (moda que passa).",
            2: "Instável: exige campanhas ativas para atrair novos clientes.",
            3: "Estabilidade média: fluxo constante, mas oscila muito conforme o mês.",
            4: "Boa estabilidade: procura garantida, clientes fazem a manutenção em dia.",
            5: "Estabilidade total: serviço essencial que as clientes não vivem sem!"
        };

        const descLiquidez = {
            1: "Venda super lenta: exige muita explicação e convencimento demorado.",
            2: "Venda lenta: clientes pensam bastante antes de fazer por ser caro ou novidade.",
            3: "Liquidez média: atrai interesse constante, processo de decisão normal.",
            4: "Venda rápida: agendamento muito fácil, excelente apelo de recompra.",
            5: "Liquidez máxima: vende sozinho! Alta taxa de agendamento espontâneo diário."
        };

        cards.forEach(card => {
            const srvId = card.dataset.id;
            
            // Garantir inicialização correta no estado
            if (!this.state.notas[srvId]) {
                this.state.notas[srvId] = { risco: 3, liquidez: 3 };
            }
            
            const rSlider = card.querySelector('.slider-risco');
            const lSlider = card.querySelector('.slider-liquidez');
            
            const rScore = card.querySelector('.score-risco');
            const lScore = card.querySelector('.score-liquidez');
            
            const rDesc = card.querySelector('.text-risco-desc');
            const lDesc = card.querySelector('.text-liquidez-desc');

            // Renderizar descrições iniciais
            const updateTexts = () => {
                const rVal = parseInt(rSlider.value);
                const lVal = parseInt(lSlider.value);
                
                rScore.textContent = `${rVal}/5`;
                lScore.textContent = `${lVal}/5`;
                
                rDesc.textContent = descRisco[rVal];
                lDesc.textContent = descLiquidez[lVal];
            };
            
            updateTexts();

            // Listeners de Mudança
            rSlider.addEventListener('input', () => {
                const val = parseInt(rSlider.value);
                this.state.notas[srvId].risco = val;
                this.saveState();
                updateTexts();
            });

            lSlider.addEventListener('input', () => {
                const val = parseInt(lSlider.value);
                this.state.notas[srvId].liquidez = val;
                this.saveState();
                updateTexts();
            });
        });

        // Navegação Voltar
        document.getElementById('btn-prev-step3')?.addEventListener('click', () => {
            this.state.currentStep = 2;
            this.saveState();
            this.renderStep();
        });

        // Navegação Avançar
        document.getElementById('btn-next-step3')?.addEventListener('click', () => {
            // Garantir que todos os serviços ativos no estado possuem notas instanciadas
            this.state.servicos.forEach(s => {
                if (!this.state.notas[s.id]) {
                    this.state.notas[s.id] = { risco: 3, liquidez: 3 };
                }
            });
            this.saveState();

            this.state.currentStep = 4;
            this.saveState();
            this.renderStep();
        });
    },

    // === ETAPA 4: DASHBOARD DE ATIVOS E PLANO DE 14 DIAS ===
    // Algoritmo de classificação de carteira
    classifyService(s) {
        const lucro = s.valor - s.custo;
        const tempoR100 = lucro > 0 ? ((100 * s.tempo) / lucro) : 999;
        const note = this.state.notas[s.id] || { risco: 3, liquidez: 3 };
        
        // Ativo Âncora (Gerador de Caixa Rápido)
        if (note.liquidez >= 4 && note.risco >= 4) {
            return {
                category: "ancora",
                label: "Ativo Âncora",
                color: "#c97c5c", // Rose Gold
                desc: "Garante o caixa rápido do estúdio e cobre suas contas fixas. Alta recorrência e facilidade de venda."
            };
        }
        
        // Ativo Premium (Margem e Alavancagem)
        if (s.valor >= 150 && tempoR100 <= 75) {
            return {
                category: "premium",
                label: "Ativo Premium",
                color: "#a0522d", // Bronze
                desc: "Serviço de alto tíquete e excelente margem de lucro. Alavanca seus rendimentos sem encher sua agenda."
            };
        }
        
        // Ativo de Bem-estar (Fidelização e Relaxamento)
        if (note.liquidez === 3 || note.risco === 3) {
            return {
                category: "bemestar",
                label: "Ativo Bem-estar",
                color: "#f4a2a2", // Rose Gold Suave
                desc: "Garante a retenção da cliente de forma agradável e fidelidade ao longo dos meses."
            };
        }
        
        // Ativo Ocasional (Sazonal / Eventos)
        if (note.risco <= 2 && s.valor >= 120) {
            return {
                category: "ocasional",
                label: "Ativo Ocasional",
                color: "#d4af37", // Champanhe / Gold
                desc: "Demanda flutuante e focada em datas comemorativas ou eventos. Gera bons picos de caixa."
            };
        }
        
        // Ativo Exótico (Dreno de Energia / Ineficiente)
        return {
            category: "exotico",
            label: "Ativo Exótico",
            color: "#6b7280", // Slate Gray (Dreno / Alerta)
            desc: "Alto tempo de execução por R$ 100 de lucro, ou difícil de vender e instável. Exige atenção ou corte urgente!"
        };
    },

    // Função interna para desenhar fatias de pizza SVG dinamicamente
    createPieSvg(slices, width = 240, height = 240) {
        const cx = width / 2;
        const cy = height / 2;
        const r = width * 0.4;
        
        const total = slices.reduce((sum, s) => sum + s.value, 0);
        if (total === 0) {
            return `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="mx-auto">
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2" />
                <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter">Sem dados de faturamento</text>
            </svg>`;
        }
        
        const validSlices = slices.filter(s => s.value > 0);
        if (validSlices.length === 1) {
            const s = validSlices[0];
            const pct = Math.round((s.value / total) * 100);
            return `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="mx-auto cursor-pointer flex-shrink-0">
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="${s.color}" data-category="${s.category}" class="transition-all duration-300 hover:opacity-90 chart-slice" />
                <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="14" font-weight="extrabold" font-family="Inter">${pct}%</text>
            </svg>`;
        }
        
        let currentAngle = -Math.PI / 2; // Começa às 12 horas
        let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="mx-auto flex-shrink-0">`;
        
        slices.forEach(slice => {
            if (slice.value <= 0) return;
            const percentage = slice.value / total;
            const angleDelta = percentage * 2 * Math.PI;
            const endAngle = currentAngle + angleDelta;
            
            const x1 = cx + r * Math.cos(currentAngle);
            const y1 = cy + r * Math.sin(currentAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            
            const largeArc = percentage > 0.5 ? 1 : 0;
            
            svgContent += `
                <path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" 
                      fill="${slice.color}" 
                      data-category="${slice.category}" 
                      class="transition-all duration-300 hover:opacity-90 hover:scale-[1.03] origin-center cursor-pointer chart-slice" 
                      style="transform-origin: ${cx}px ${cy}px;">
                    <title>${slice.label}: ${Math.round(percentage * 100)}% (R$ ${slice.value.toFixed(2)}/mês)</title>
                </path>
            `;
            
            if (percentage > 0.05) {
                const textAngle = currentAngle + angleDelta / 2;
                const tx = cx + r * 0.65 * Math.cos(textAngle);
                const ty = cy + r * 0.65 * Math.sin(textAngle);
                svgContent += `
                    <text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10" font-weight="black" font-family="Inter" pointer-events="none">
                        ${Math.round(percentage * 100)}%
                    </text>
                `;
            }
            
            currentAngle = endAngle;
        });
        
        svgContent += `</svg>`;
        return svgContent;
    },

    renderStep4() {
        // 1. Processar dados operacionais de faturamento
        let totalFaturamentoMensal = 0;
        let totalAtendimentosMensal = 0;
        let faturamentosPorCategoria = {
            ancora: 0,
            premium: 0,
            bemestar: 0,
            ocasional: 0,
            exotico: 0
        };

        const classificados = this.state.servicos.map(s => {
            const classif = this.classifyService(s);
            // faturamento mensal = atendimentos em 3 meses * valor / 3
            const fatMensal = (s.atendimentos3Meses * s.valor) / 3;
            
            totalFaturamentoMensal += fatMensal;
            totalAtendimentosMensal += (s.atendimentos3Meses / 3);
            faturamentosPorCategoria[classif.category] += fatMensal;
            
            return {
                ...s,
                classif,
                fatMensal
            };
        });

        const numServicos = this.state.servicos.length;
        const totalFaturamento = totalFaturamentoMensal || 1; // evitar divisao por zero

        // 2. Preparar fatias de pizza Real
        const slicesReal = [
            { category: "ancora", label: "Ativos Âncora", value: faturamentosPorCategoria.ancora, color: "#c97c5c" },
            { category: "premium", label: "Ativos Premium", value: faturamentosPorCategoria.premium, color: "#a0522d" },
            { category: "bemestar", label: "Ativos Bem-estar", value: faturamentosPorCategoria.bemestar, color: "#f4a2a2" },
            { category: "ocasional", label: "Ativos Ocasionais", value: faturamentosPorCategoria.ocasional, color: "#d4af37" },
            { category: "exotico", label: "Ativos Exóticos", value: faturamentosPorCategoria.exotico, color: "#6b7280" }
        ];

        // 3. Preparar fatias de pizza Ideal (50% Âncora, 30% Premium, 15% Bem-estar, 5% Ocasional, 0% Exótico)
        const slicesIdeal = [
            { category: "ancora", label: "Ativos Âncora (Ideal)", value: 50, color: "#c97c5c" },
            { category: "premium", label: "Ativos Premium (Ideal)", value: 30, color: "#a0522d" },
            { category: "bemestar", label: "Ativos Bem-estar (Ideal)", value: 15, color: "#f4a2a2" },
            { category: "ocasional", label: "Ativos Ocasionais (Ideal)", value: 5, color: "#d4af37" }
        ];

        // 4. Mapeamento de percentuais reais para o diagnóstico
        const pctAncora = Math.round((faturamentosPorCategoria.ancora / totalFaturamento) * 100);
        const pctPremium = Math.round((faturamentosPorCategoria.premium / totalFaturamento) * 100);
        const pctExotico = Math.round((faturamentosPorCategoria.exotico / totalFaturamento) * 100);

        // 5. Geração de Diagnóstico de Caixa Narrado e Inteligente
        let diagnosticoTitulo = "⚖️ Estúdio Equilibrado e Lucrativo";
        let diagnosticoTexto = "Parabéns! Sua carteira de ativos está alinhada à metodologia da Bolsa da Beleza™. Você tem uma base sólida de geração de caixa rápido (Ativos Âncora) e serviços premium que alavancam seu lucro sem sobrecarregar sua rotina física!";
        let diagnosticoAlertClass = "bg-emerald-50/60 border-emerald-200/50 text-[#1e3a1e]";
        let diagnosticoIconColor = "text-emerald-600";

        if (pctExotico > 10) {
            diagnosticoTitulo = "⚠️ Alerta Urgente: Dreno de Energia Física";
            diagnosticoTexto = `Você possui <strong>${pctExotico}%</strong> do seu faturamento médio atrelado a <strong>Ativos Exóticos</strong> (serviços ineficientes com altíssimo tempo de aplicação ou baixa margem de lucro). Você está gastando sua saúde física para gerar receita. Recomenda-se aumentar os preços dessas técnicas ou excluí-las da sua agenda para liberar horários de rebalanceamento!`;
            diagnosticoAlertClass = "bg-rose-50/60 border-rose-200/50 text-[#4a1515]";
            diagnosticoIconColor = "text-rose-600";
        } else if (pctAncora < 40) {
            diagnosticoTitulo = "📉 Alerta: Caixa Mensal Instável";
            diagnosticoTexto = `Seus <strong>Ativos Âncora</strong> representam apenas <strong>${pctAncora}%</strong> do seu negócio (o ideal é 50%). Isso indica que você sofre muita ansiedade pelas oscilações de faturamento. Serviços como design de sobrancelha ou cílios de manutenção rápida devem ser impulsionados para dar previsibilidade financeira!`;
            diagnosticoAlertClass = "bg-amber-50/60 border-amber-200/50 text-[#4a3515]";
            diagnosticoIconColor = "text-amber-600";
        } else if (pctPremium < 20) {
            diagnosticoTitulo = "🚀 Alerta: Teto de Faturamento Atingido";
            diagnosticoTexto = `Seus <strong>Ativos Premium</strong> representam apenas <strong>${pctPremium}%</strong> (o ideal é 30%). Você trabalha muitas horas e sente que seu faturamento bateu no teto. Para crescer de forma inteligente, você precisa elevar a venda e introduzir novos serviços de alto tíquete e alta margem de lucro!`;
            diagnosticoAlertClass = "bg-blue-50/60 border-blue-200/50 text-[#1e2e4a]";
            diagnosticoIconColor = "text-blue-600";
        }

        // Seletor estratégico de serviços cadastrados
        const hasServices = this.state.servicos.length > 0;
        const selectedSrvId = this.state.servicoEstrategicoId || (hasServices ? this.state.servicos[0].id : "");

        return `
        <div class="space-y-8 animation-fade-in text-[#2C1810]">
            <!-- Grid de Métricas Principais -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Métrica 1 -->
                <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-[#c97c5c]/10 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-[#c97c5c]/15 text-[#c97c5c] flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-2xl font-bold">payments</span>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Faturamento Médio Mensal</p>
                        <p class="text-xl font-black text-[#2C1810] mt-0.5">R$ ${totalFaturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
                <!-- Métrica 2 -->
                <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-[#c97c5c]/10 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-[#a0522d]/15 text-[#a0522d] flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-2xl font-bold">group</span>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Atendimentos Médios / Mês</p>
                        <p class="text-xl font-black text-[#2C1810] mt-0.5">${Math.round(totalAtendimentosMensal)} clientes</p>
                    </div>
                </div>
                <!-- Métrica 3 -->
                <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-[#c97c5c]/10 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-2xl font-bold">track_changes</span>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Meta Financeira</p>
                        <p class="text-xl font-black text-[#2C1810] mt-0.5">R$ ${(this.state.metas.metaFinanceira || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>

            <!-- Gráficos de Pizza Lado a Lado -->
            <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-[#c97c5c]/10 shadow-sm space-y-6">
                <div class="border-b border-slate-100 pb-4">
                    <h4 class="font-headline font-bold text-lg flex items-center gap-2 text-[#2C1810]">
                        <span class="material-symbols-outlined text-[#c97c5c]">analytics</span>
                        Análise de Equilíbrio Real vs. Ideal
                    </h4>
                    <p class="text-xs text-[#7A5C54] mt-1">Compare a saúde financeira real da sua agenda com a Distribuição Perfeita da Bolsa da Beleza.</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <!-- Gráfico Real -->
                    <div class="space-y-4 text-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
                        <h5 class="font-label text-sm font-bold text-[#2C1810]">Sua Distribuição (Real)</h5>
                        <div id="chart-real-container" class="flex justify-center select-none">
                            ${this.createPieSvg(slicesReal)}
                        </div>
                        <p class="text-[10px] text-slate-400 italic">Dica: clique em uma fatia para filtrar a lista abaixo!</p>
                    </div>
                    <!-- Gráfico Ideal -->
                    <div class="space-y-4 text-center">
                        <h5 class="font-label text-sm font-bold text-[#2C1810]">Distribuição Recomendada (Ideal)</h5>
                        <div id="chart-ideal-container" class="flex justify-center select-none">
                            ${this.createPieSvg(slicesIdeal)}
                        </div>
                        <!-- Legendas explicativas -->
                        <div class="flex flex-wrap justify-center gap-3 pt-3">
                            <span class="flex items-center gap-1.5 text-[10px] font-bold text-slate-600"><span class="w-2.5 h-2.5 rounded-full" style="background-color:#c97c5c"></span>Âncora (50%)</span>
                            <span class="flex items-center gap-1.5 text-[10px] font-bold text-slate-600"><span class="w-2.5 h-2.5 rounded-full" style="background-color:#a0522d"></span>Premium (30%)</span>
                            <span class="flex items-center gap-1.5 text-[10px] font-bold text-slate-600"><span class="w-2.5 h-2.5 rounded-full" style="background-color:#f4a2a2"></span>Bem-estar (15%)</span>
                            <span class="flex items-center gap-1.5 text-[10px] font-bold text-slate-600"><span class="w-2.5 h-2.5 rounded-full" style="background-color:#d4af37"></span>Ocasional (5%)</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card de Diagnóstico de Caixa Narrado -->
            <div class="${diagnosticoAlertClass} border rounded-3xl p-6 lg:p-8 flex items-start gap-5 shadow-sm transition-all duration-300">
                <span class="material-symbols-outlined text-4xl ${diagnosticoIconColor} shrink-0 mt-1" style="font-variation-settings: 'FILL' 1;">insights</span>
                <div class="space-y-2.5">
                    <h4 class="font-headline font-extrabold text-lg text-[#2C1810]">${diagnosticoTitulo}</h4>
                    <p class="text-sm leading-relaxed">${diagnosticoTexto}</p>
                </div>
            </div>

            <!-- Lista de Ativos Cadastrados com Filtro Interativo -->
            <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-[#c97c5c]/10 shadow-sm space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                        <h4 class="font-headline font-bold text-base flex items-center gap-2 text-[#2C1810]">
                            <span class="material-symbols-outlined text-[#c97c5c]">format_list_bulleted</span>
                            Serviços Classificados na Carteira
                        </h4>
                        <p class="text-xs text-[#7A5C54] mt-1">Exibindo classificação automatizada baseada no algoritmo financeiro.</p>
                    </div>
                    <button type="button" id="btn-clear-filter" class="hidden text-xs font-bold text-[#c97c5c] hover:underline flex items-center gap-1">
                        <span class="material-symbols-outlined text-xs">close</span> Limpar Filtro
                    </button>
                </div>

                <div class="overflow-x-auto rounded-2xl border border-slate-100">
                    <table class="w-full text-left border-collapse" id="table-portfolio">
                        <thead>
                            <tr class="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                <th class="py-4 px-4 font-label">Procedimento</th>
                                <th class="py-4 px-3 font-label text-center">Faturamento Mensal</th>
                                <th class="py-4 px-3 font-label text-center">Lucro Líquido</th>
                                <th class="py-4 px-3 font-label text-center">Hora R$ 100</th>
                                <th class="py-4 px-4 font-label text-center">Classificação de Ativo</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100" id="portfolio-tbody">
                            ${classificados.map(s => {
                                return `
                                <tr class="hover:bg-slate-50/50 transition-colors portfolio-row" data-category="${s.classif.category}">
                                    <td class="py-4 px-4 text-xs font-semibold text-[#2C1810]">${s.nome}</td>
                                    <td class="py-4 px-3 text-xs text-center font-bold text-slate-600">R$ ${s.fatMensal.toFixed(2)}</td>
                                    <td class="py-4 px-3 text-xs text-center font-semibold text-emerald-700">R$ ${(s.valor - s.custo).toFixed(2)}</td>
                                    <td class="py-4 px-3 text-xs text-center font-semibold text-[#a0522d]">${Math.round(s.valor - s.custo > 0 ? ((100 * s.tempo) / (s.valor - s.custo)) : 0)} min</td>
                                    <td class="py-4 px-4 text-center">
                                        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold text-white shadow-sm" style="background-color: ${s.classif.color};">
                                            <span class="material-symbols-outlined text-xs" style="font-variation-settings: 'FILL' 1;">
                                                ${s.classif.category === 'exotico' ? 'warning' : 'stars'}
                                            </span>
                                            ${s.classif.label}
                                        </span>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Campanha de Rebalanceamento de 14 dias -->
            <div class="bg-gradient-to-br from-white/90 to-[#fcf9f7] backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-[#c97c5c]/10 shadow-sm space-y-6">
                <div class="border-b border-slate-100 pb-5">
                    <h4 class="font-headline font-bold text-lg flex items-center gap-2 text-[#2C1810]">
                        <span class="material-symbols-outlined text-[#c97c5c]">calendar_month</span>
                        Plano de Ação e Rebalanceamento (14 dias)
                    </h4>
                    <p class="text-xs text-[#7A5C54] mt-1">Gamifique e execute a atração de clientes para rebalancear a sua agenda em duas semanas.</p>
                </div>

                <!-- Seletor do Ativo Estratégico -->
                <div class="space-y-2 max-w-md">
                    <label class="block font-label text-xs font-bold uppercase tracking-wider text-[#7A5C54]" for="srv-strategico">Selecione o serviço que deseja alavancar na agenda:</label>
                    <select id="srv-strategico" class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#c97c5c] focus:ring-2 focus:ring-[#c97c5c]/20 rounded-2xl text-xs font-bold text-[#2C1810]">
                        ${this.state.servicos.map(s => `
                            <option value="${s.id}" ${s.id === selectedSrvId ? "selected" : ""}>
                                ${s.nome} (${this.classifyService(s).label})
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Painel de Progresso da Campanha -->
                <div id="rebalance-campaign-panel" class="space-y-8 pt-4">
                    <!-- Renderizado dinamicamente com base no serviço escolhido -->
                </div>
            </div>

            <!-- Controles Finais -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <button type="button" id="btn-prev-step4" class="bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all text-slate-700 font-bold px-6 py-3.5 rounded-2xl flex items-center gap-2 text-xs md:text-sm shadow-sm w-full sm:w-auto justify-center">
                    <span class="material-symbols-outlined text-sm">arrow_back</span>
                    Voltar: Notas
                </button>
                <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <button type="button" id="btn-export-pdf" class="bg-gradient-to-r from-[#c97c5c] to-[#a0522d] hover:opacity-90 active:scale-[0.98] transition-all text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-[#c97c5c]/20 flex items-center gap-2 text-xs md:text-sm w-full sm:w-auto justify-center">
                        <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
                        Exportar Planejamento (PDF)
                    </button>
                    <button type="button" id="btn-reset-diagnostico" class="bg-[#c97c5c]/10 hover:bg-[#c97c5c]/20 text-[#c97c5c] font-bold px-6 py-3.5 rounded-2xl border border-[#c97c5c]/20 transition-all flex items-center gap-2 text-xs md:text-sm active:scale-[0.98] w-full sm:w-auto justify-center">
                        <span class="material-symbols-outlined text-sm">restart_alt</span>
                        Reiniciar Novo Diagnóstico
                    </button>
                </div>
            </div>
        </div>
        `;
    },

    initStep4() {
        const services = this.state.servicos;
        if (services.length === 0) return;

        // Limpar Filtros
        const btnClear = document.getElementById('btn-clear-filter');
        const rows = document.querySelectorAll('.portfolio-row');
        
        const clearFilter = () => {
            rows.forEach(r => r.style.display = '');
            btnClear.classList.add('hidden');
            document.querySelectorAll('.chart-slice').forEach(el => el.style.opacity = '1');
        };
        
        btnClear?.addEventListener('click', clearFilter);

        // Click nas fatias do gráfico Real para Filtrar Tabela
        const slicesEl = document.querySelectorAll('#chart-real-container .chart-slice');
        slicesEl.forEach(slice => {
            slice.addEventListener('click', (e) => {
                const cat = slice.dataset.category;
                
                // Reduzir opacidade das outras fatias
                slicesEl.forEach(el => el.style.opacity = '0.4');
                slice.style.opacity = '1';

                // Mostrar apenas linhas com a categoria selecionada
                rows.forEach(r => {
                    if (r.dataset.category === cat) {
                        r.style.display = '';
                    } else {
                        r.style.display = 'none';
                    }
                });

                btnClear.classList.remove('hidden');
            });
        });

        // Evento de Mudança de Serviço Estratégico
        const selector = document.getElementById('srv-strategico');
        
        const renderCampaign = () => {
            const currentId = selector.value;
            this.state.servicoEstrategicoId = currentId;
            this.saveState();

            const srv = services.find(s => s.id === currentId);
            if (!srv) return;

            const campaignPanel = document.getElementById('rebalance-campaign-panel');
            if (!campaignPanel) return;

            // Gerar Copys Injetadas Dinamicamente
            const copyWhatsApp = `Olá [Nome da Cliente], tudo bem? ❤️ Estava organizando minha agenda de atendimentos aqui e lembrei com muito carinho de você! Faz um tempinho que você não vem fazer o seu **${srv.nome}**, e eu preparei uma surpresa especial para minhas clientes mais queridas nesta semana. Se você agendar seu atendimento para os próximos dias, vou te dar um mimo surpresa de cuidados pós-procedimento. O que acha? Tenho horário disponível na quinta às 14h ou sexta às 10h. Vamos renovar sua autoestima? ✨`.replace(/\n/g, '\\n');
            const copyWhatsAppVIP = `Oi, tudo bem? Passando para te dar uma notícia em primeira mão! Abri a agenda especial da próxima semana para o procedimento **${srv.nome}**, que é o mais pedido aqui no estúdio. Como você é nossa cliente VIP, estou te enviando essa mensagem antes de postar no Instagram para você garantir seu horário com tranquilidade. Me avisa se quiser reservar um espaço, pois as vagas costumam preencher muito rápido! Beijos!`.replace(/\n/g, '\\n');
            
            const copyStories = `Story 1: Foto bem de perto e nítida de um resultado lindo de **${srv.nome}**.\nTexto: 'Você sabia que o segredo de um acabamento natural e confortável está na precisão técnica? ✨'\nStory 2: Vídeo curto de 5s aplicando o procedimento.\nTexto: 'Cada detalhe é planejado exclusivamente para o formato do seu rosto. Menos tempo de aplicação e muito mais durabilidade! 😍'\nStory 3: Enquete interativa.\nTexto: 'Você gostaria de acordar pronta todos os dias com o **${srv.nome}**?' Opções: 'Sim, meu sonho!' ou 'Quero saber mais!'`.replace(/\n/g, '\\n');
            const copyFeed = `✨ 3 Coisas que você precisa saber antes de fazer seu **${srv.nome}**:\n\n1️⃣ Durabilidade Incrível: Com os devidos cuidados, o resultado permanece perfeito por muito mais tempo, economizando seus minutos diários de maquiagem.\n2️⃣ Personalização Completa: Não existe técnica padrão! Eu avalio a estrutura do seu rosto e cílios para criar um design único que valoriza sua beleza natural.\n3️⃣ Saúde em Primeiro Lugar: Todos os nossos materiais são testados, hipoalergênicos e aplicados com biossegurança rigorosa.\n\n👉 Quer experimentar essa transformação na sua rotina? Clique no link da bio e reserve seu horário!`.replace(/\n/g, '\\n');

            // Mapeamento de Tarefas dos 14 dias
            const daysData = [
                { num: 1, week: 1, title: "Dia 1: Lista de Ouro", desc: `Defina sua meta de agendamentos e liste 15 clientes antigas que não realizam o procedimento de **${srv.nome}** há mais de 45 dias.`, copy: null },
                { num: 2, week: 1, title: "Dia 2: Stories - Desejo", desc: `Poste uma sequência de Stories mostrando o antes e depois do serviço **${srv.nome}** sem vender nada, ativando o desejo.`, copy: copyStories, type: "stories" },
                { num: 3, week: 1, title: "Dia 3: Stories - Objeções", desc: `Abra uma caixinha de perguntas no Instagram para quebrar as principais dúvidas e medos das clientes sobre o **${srv.nome}**.`, copy: null },
                { num: 4, week: 1, title: "Dia 4: WhatsApp - Abordagem", desc: `Envie um texto carinhoso e direto no WhatsApp de forma pessoal para as 15 clientes listadas no Dia 1.`, copy: copyWhatsApp, type: "whatsapp" },
                { num: 5, week: 1, title: "Dia 5: Stories - Prova Social", desc: `Compartilhe o feedback de uma cliente satisfeita com o **${srv.nome}** e informe que restam apenas 2 horários nesta semana.`, copy: null },
                { num: 6, week: 1, title: "Dia 6: Reels/Feed - Autoridade", desc: `Publique um post completo no Instagram demonstrando os cuidados e os insumos premium que você utiliza.`, copy: copyFeed, type: "feed" },
                { num: 7, week: 1, title: "Dia 7: Análise Semanal", desc: "Avalie a sua conversão da primeira semana de campanha, ajuste a abordagem e comemore os agendamentos!", copy: null },
                { num: 8, week: 2, title: "Dia 8: WhatsApp - Lista VIP", desc: `Envie uma campanha exclusiva e antecipada do **${srv.nome}** para a sua lista de clientes fiéis e VIPs.`, copy: copyWhatsAppVIP, type: "whatsapp_vip" },
                { num: 9, week: 2, title: "Dia 9: Stories - Escassez Real", desc: `Mostre a agenda com horários de **${srv.nome}** preenchidos e destaque os últimos 3 horários vagos.`, copy: null },
                { num: 10, week: 2, title: "Dia 10: Indicações Mútuas", desc: `Feche uma parceria rápida com 2 profissionais de beleza parceiros de outras áreas para indicação mútua do **${srv.nome}**.`, copy: null },
                { num: 11, week: 2, title: "Dia 11: Reels - Bastidores", desc: `Publique um Reels mostrando os bastidores do atendimento do **${srv.nome}**, o conforto e o cafezinho do estúdio.`, copy: null },
                { num: 12, week: 2, title: "Dia 12: WhatsApp - Última Chamada", desc: `Faça o follow-up individual com quem engajou nos Stories ou na caixinha de perguntas mas ainda não agendou.`, copy: null },
                { num: 13, week: 2, title: "Dia 13: Stories - Conexão", desc: `Mostre sua rotina pessoal como gestora do seu estúdio e reforce os benefícios a longo prazo de ter o **${srv.nome}** em dia.`, copy: null },
                { num: 14, week: 2, title: "Dia 14: Fechamento Final", desc: `Calcule seu faturamento extra gerado nestes 14 dias com a atração ativa de **${srv.nome}** e comemore!`, copy: null }
            ];

            // Calcular porcentagem de progresso
            const completedCount = Object.values(this.state.cronogramaProgresso).filter(v => v === true).length;
            const progressPercentage = Math.round((completedCount / 14) * 100);

            let html = `
            <!-- Barra de Progresso Gamificada -->
            <div class="space-y-2 bg-[#c97c5c]/5 border border-[#c97c5c]/10 rounded-2xl p-5">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-[#7A5C54] flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">stars</span>
                        Seu Progresso de Rebalanceamento
                    </span>
                    <span class="text-xs font-black text-[#a0522d]" id="campaign-progress-label">${progressPercentage}% (${completedCount}/14 dias concluídos)</span>
                </div>
                <div class="w-full bg-[#c97c5c]/15 h-3.5 rounded-full overflow-hidden">
                    <div class="bg-gradient-to-r from-[#c97c5c] to-[#a0522d] h-full rounded-full transition-all duration-500 shadow-inner" 
                         id="campaign-progress-bar" style="width: ${progressPercentage}%;"></div>
                </div>
            </div>

            <!-- Grade de Semanas Lado a Lado -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <!-- Semana 1 -->
                <div class="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                    <h5 class="font-headline font-bold text-sm text-[#2C1810] border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-[#c97c5c]"></span>
                        Semana 1: Atração e Desejo
                    </h5>
                    <div class="space-y-3">
                        ${daysData.filter(d => d.week === 1).map(d => {
                            const isChecked = this.state.cronogramaProgresso[`dia${d.num}`] === true;
                            return `
                            <div class="flex items-start gap-3 p-3.5 rounded-2xl border ${isChecked ? 'bg-slate-50/50 border-slate-200' : 'bg-white hover:border-[#c97c5c]/30 border-slate-100'} transition-all text-xs" data-day="${d.num}">
                                <input type="checkbox" class="day-checkbox w-4 h-4 rounded border-2 border-outline-variant text-[#c97c5c] focus:ring-[#c97c5c]/30 cursor-pointer accent-[#c97c5c] mt-0.5" 
                                       data-day="${d.num}" ${isChecked ? "checked" : ""} />
                                <div class="flex-1 space-y-1.5">
                                    <p class="font-bold text-[#2C1810] flex items-center gap-1.5 ${isChecked ? 'line-through text-slate-400' : ''}">
                                        ${d.title}
                                    </p>
                                    <p class="text-[11px] text-slate-500 leading-relaxed ${isChecked ? 'line-through text-slate-400' : ''}">${d.desc}</p>
                                    
                                    ${d.copy ? `
                                        <div class="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 mt-2">
                                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Roteiro Sugerido</p>
                                            <p class="text-[10px] text-slate-600 italic whitespace-pre-wrap leading-relaxed border-l-2 border-[#c97c5c]/30 pl-2 select-all font-mono">${d.copy.replace(/\\n/g, '\n')}</p>
                                            <button type="button" class="btn-copy-script bg-white border border-slate-200 hover:bg-[#c97c5c]/5 hover:border-[#c97c5c]/30 font-bold px-3 py-1.5 rounded-lg text-[9px] transition-all flex items-center gap-1 text-[#c97c5c] active:scale-95 mt-1" 
                                                    data-copy-text="${d.copy}">
                                                <span class="material-symbols-outlined text-xs">content_copy</span>
                                                Copiar Roteiro
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Semana 2 -->
                <div class="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                    <h5 class="font-headline font-bold text-sm text-[#2C1810] border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-[#a0522d]"></span>
                        Semana 2: Conversão e Fechamento
                    </h5>
                    <div class="space-y-3">
                        ${daysData.filter(d => d.week === 2).map(d => {
                            const isChecked = this.state.cronogramaProgresso[`dia${d.num}`] === true;
                            return `
                            <div class="flex items-start gap-3 p-3.5 rounded-2xl border ${isChecked ? 'bg-slate-50/50 border-slate-200' : 'bg-white hover:border-[#c97c5c]/30 border-slate-100'} transition-all text-xs" data-day="${d.num}">
                                <input type="checkbox" class="day-checkbox w-4 h-4 rounded border-2 border-outline-variant text-[#c97c5c] focus:ring-[#c97c5c]/30 cursor-pointer accent-[#c97c5c] mt-0.5" 
                                       data-day="${d.num}" ${isChecked ? "checked" : ""} />
                                <div class="flex-1 space-y-1.5">
                                    <p class="font-bold text-[#2C1810] flex items-center gap-1.5 ${isChecked ? 'line-through text-slate-400' : ''}">
                                        ${d.title}
                                    </p>
                                    <p class="text-[11px] text-slate-500 leading-relaxed ${isChecked ? 'line-through text-slate-400' : ''}">${d.desc}</p>
                                    
                                    ${d.copy ? `
                                        <div class="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 mt-2">
                                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Roteiro Sugerido</p>
                                            <p class="text-[10px] text-slate-600 italic whitespace-pre-wrap leading-relaxed border-l-2 border-[#c97c5c]/30 pl-2 select-all font-mono">${d.copy.replace(/\\n/g, '\n')}</p>
                                            <button type="button" class="btn-copy-script bg-white border border-slate-200 hover:bg-[#c97c5c]/5 hover:border-[#c97c5c]/30 font-bold px-3 py-1.5 rounded-lg text-[9px] transition-all flex items-center gap-1 text-[#c97c5c] active:scale-95 mt-1" 
                                                    data-copy-text="${d.copy}">
                                                <span class="material-symbols-outlined text-xs">content_copy</span>
                                                Copiar Roteiro
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            `;

            campaignPanel.innerHTML = html;

            // Bind de Checkboxes do Progresso
            const checkboxes = campaignPanel.querySelectorAll('.day-checkbox');
            checkboxes.forEach(chk => {
                chk.addEventListener('change', () => {
                    const day = chk.dataset.day;
                    const checked = chk.checked;
                    this.state.cronogramaProgresso[`dia${day}`] = checked;
                    this.saveState();

                    // Recalcular progresso
                    const newCompletedCount = Object.values(this.state.cronogramaProgresso).filter(v => v === true).length;
                    const newProgress = Math.round((newCompletedCount / 14) * 100);

                    // Atualizar visualmente no DOM sem renderizar tudo
                    const progressLabel = document.getElementById('campaign-progress-label');
                    const progressBar = document.getElementById('campaign-progress-bar');
                    if (progressLabel) progressLabel.textContent = `${newProgress}% (${newCompletedCount}/14 dias concluídos)`;
                    if (progressBar) progressBar.style.width = `${newProgress}%`;

                    // Riscar ou desriscar os textos correspondentes
                    const dayRow = campaignPanel.querySelector(`div[data-day="${day}"]`);
                    const titleText = dayRow?.querySelector('.font-bold');
                    const descText = dayRow?.querySelector('.text-[11px]');

                    if (checked) {
                        dayRow?.classList.add('bg-slate-50/50', 'border-slate-200');
                        dayRow?.classList.remove('bg-white');
                        titleText?.classList.add('line-through', 'text-slate-400');
                        descText?.classList.add('line-through', 'text-slate-400');
                    } else {
                        dayRow?.classList.remove('bg-slate-50/50', 'border-slate-200');
                        dayRow?.classList.add('bg-white');
                        titleText?.classList.remove('line-through', 'text-slate-400');
                        descText?.classList.remove('line-through', 'text-slate-400');
                    }
                });
            });

            // Bind de Copiar Roteiro
            const copyBtns = campaignPanel.querySelectorAll('.btn-copy-script');
            copyBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const text = btn.dataset.copyText.replace(/\\n/g, '\n');
                    navigator.clipboard.writeText(text).then(() => {
                        App.showToast('Roteiro copiado para a área de transferência!', 'success');
                        
                        // Feedback local do botão
                        const originalHtml = btn.innerHTML;
                        btn.innerHTML = `<span class="material-symbols-outlined text-xs">done</span> Copiado!`;
                        btn.classList.add('bg-emerald-50', 'border-emerald-300', 'text-emerald-700');
                        setTimeout(() => {
                            btn.innerHTML = originalHtml;
                            btn.classList.remove('bg-emerald-50', 'border-emerald-300', 'text-emerald-700');
                        }, 2000);
                    }).catch(err => {
                        console.error('Falha ao copiar texto:', err);
                        App.showToast('Erro ao copiar roteiro. Selecione o texto e copie manualmente!', 'error');
                    });
                });
            });
        };

        renderCampaign();

        // Escutar seletor estratégico
        selector?.addEventListener('change', renderCampaign);

        // Navegação Voltar
        document.getElementById('btn-prev-step4')?.addEventListener('click', () => {
            this.state.currentStep = 3;
            this.saveState();
            this.renderStep();
        });

        // Botão Reiniciar Diagnóstico Completo
        document.getElementById('btn-reset-diagnostico')?.addEventListener('click', () => {
            if (confirm('Deseja realmente apagar o diagnóstico atual e iniciar um novo raio-x do seu estúdio? Os serviços cadastrados serão mantidos para facilitar, mas as notas e o progresso do calendário serão zerados.')) {
                this.state.currentStep = 1;
                this.state.notas = {};
                this.state.cronogramaProgresso = {};
                this.state.servicoEstrategicoId = null;
                this.saveState();
                this.renderStep();
                App.showToast('Diagnóstico reiniciado com sucesso! Vamos começar.', 'info');
            }
        });

        // Botão Exportar PDF
        document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
            window.print();
        });
    }
};
