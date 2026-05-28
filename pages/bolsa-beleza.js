// ==========================================
// Bolsa da Beleza — Gestão de Ativos do Studio
// ==========================================
const BolsaBeleza = {
    currentSection: 0,
    sections: ['intro', 'ativos', 'minhaCarteira', 'plano14dias', 'ferramentas', 'insight'],

    async render(container) {
        container.innerHTML = this._renderShell();
        this.init();
    },

    _renderShell() {
        return `
        <div class="bolsa-odonto-page" style="max-width:960px;margin:0 auto;padding-bottom:48px">
            <div class="bolsa-hero">
                <div class="bolsa-hero-content">
                    <span class="bolsa-hero-icon">💼</span>
                    <h1 class="bolsa-hero-title">A Bolsa da Beleza</h1>
                    <p class="bolsa-hero-subtitle">Gestão Estratégica de Ativos do seu Studio</p>
                    <div class="bolsa-hero-badges">
                        <span class="bolsa-badge bolsa-badge-gold">✦ Estratégia</span>
                        <span class="bolsa-badge bolsa-badge-rose">✦ Gestão</span>
                        <span class="bolsa-badge bolsa-badge-gold">✦ Marketing</span>
                        <span class="bolsa-badge bolsa-badge-rose">✦ Vendas</span>
                    </div>
                </div>
            </div>
            <div class="bolsa-tabs-wrapper">
                <button data-section="0" class="bolsa-tab-btn active"><span class="tab-icon">💡</span>Introdução</button>
                <button data-section="1" class="bolsa-tab-btn"><span class="tab-icon">📊</span>5 Ativos</button>
                <button data-section="2" class="bolsa-tab-btn"><span class="tab-icon">💰</span>Minha Carteira</button>
                <button data-section="3" class="bolsa-tab-btn"><span class="tab-icon">🚀</span>Plano 14 Dias</button>
                <button data-section="4" class="bolsa-tab-btn"><span class="tab-icon">🔧</span>Ferramentas</button>
                <button data-section="5" class="bolsa-tab-btn"><span class="tab-icon">💎</span>Insight de Ouro</button>
            </div>
            <div id="bolsa-content" style="transition:opacity 0.25s,transform 0.25s">
                ${this.renderIntro()}
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:32px;padding-top:20px;border-top:1px solid var(--border)">
                <button id="bolsa-prev" class="btn btn-ghost" style="display:flex;align-items:center;gap:6px" disabled>
                    <span class="material-symbols-outlined" style="font-size:18px">arrow_back</span>Anterior
                </button>
                <span style="font-size:0.78rem;color:var(--text-muted);font-weight:600" id="bolsa-counter">1 / 6</span>
                <button id="bolsa-next" class="btn btn-primary" style="display:flex;align-items:center;gap:6px">
                    Próximo<span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
                </button>
            </div>
        </div>`;
    },

    renderIntro() {
        return `
        <div class="bolsa-section">
            <div class="bolsa-card">
                <div class="bolsa-section-header">
                    <div class="bolsa-icon-box bolsa-icon-box-gold">⚠️</div>
                    <h2 class="bolsa-section-title">O Fim da Ilusão da Agenda Cheia</h2>
                </div>
                <div class="bolsa-prose">
                    <p>Existe uma <strong>mentira confortável</strong> que a maioria das profissionais ainda acredita: <em>"Se minha agenda está cheia, meu studio está indo bem."</em></p>
                    <div class="bolsa-alert bolsa-alert-danger">
                        <p class="bolsa-alert-title">🚨 A Verdade Inconveniente</p>
                        <p>Agenda lotada não é sinônimo de lucro. É sinônimo de <strong>trabalho</strong>. E trabalho sem estratégia é apenas <strong>exaustão remunerada — mal remunerada</strong>.</p>
                    </div>
                    <p>Você pode ter 8 clientes por dia e ainda fechar o mês no vermelho. <strong>Quando sua agenda é preenchida por serviços de baixa margem</strong>, você está basicamente <strong>alugando sua cadeira por centavos</strong>.</p>
                    <p>Imagine: <strong>5 clientes por dia, 4 dias por semana</strong>, distribuídas entre extensões volume russo, brow lamination e combos recorrentes. O faturamento? <strong>3 a 5 vezes maior</strong>. O desgaste? Uma fração.</p>
                    <div class="bolsa-highlight-box">
                        <p class="bolsa-highlight-title">📈 O Conceito: Bolsa da Beleza</p>
                        <p>Na Bolsa de Valores, <strong>nenhum investidor coloca tudo em um único ativo</strong>. <strong>Seu studio segue a mesma lógica.</strong> Cada serviço é um "ativo" no seu portfólio. O segredo está no <strong>equilíbrio entre eles</strong>.</p>
                    </div>
                    <div class="bolsa-compare-grid">
                        <div class="bolsa-compare-card bolsa-compare-bad">
                            <p class="bolsa-compare-label">✗ Mentalidade Antiga</p>
                            <ul>
                                <li>• "Preciso lotar minha agenda"</li>
                                <li>• "Qualquer cliente é boa cliente"</li>
                                <li>• "Desconto pelo menos traz alguém"</li>
                                <li>• "Marketing é postar qualquer coisa"</li>
                            </ul>
                        </div>
                        <div class="bolsa-compare-card bolsa-compare-good">
                            <p class="bolsa-compare-label">✓ Mentalidade Investidora</p>
                            <ul>
                                <li>• "Preciso otimizar minha agenda"</li>
                                <li>• "Cada horário tem custo de oportunidade"</li>
                                <li>• "Desconto corrói meu ativo: o preço"</li>
                                <li>• "Marketing é isca para o serviço certo"</li>
                            </ul>
                        </div>
                    </div>
                    <p>A partir de agora, <strong>sua cadeira é um ativo financeiro</strong>. Cada cliente precisa gerar retorno proporcional ao investimento de tempo, energia e material. Se não gera — está <strong>desvalorizando sua carteira</strong>.</p>
                    <p style="text-align:center;color:var(--text-muted);font-size:0.75rem;letter-spacing:0.1em;font-weight:600;padding:16px 0">— PRÓXIMO: AS 5 CATEGORIAS DE ATIVOS —</p>
                </div>
            </div>
        </div>`;
    },
    renderAtivos() {
        const ativos = [
            { icon: '🌿', nome: 'Renda Fixa — Manutenções & Retoques', desc: 'Serviços recorrentes e previsíveis. Margens menores, mas fluxo de caixa <strong>constante e previsível</strong>.', ex: 'Manutenção fio a fio, retoque de henna, remoção de cílios, manutenção volume brasileiro.', peso: '20-30%', risco: 'Baixo', retorno: 'Estável', tip: 'É a base da agenda. Garante que as contas fixas sejam pagas. Se passar de 40%, você está subsidiando sua agenda com trabalho barato.' },
            { icon: '✨', nome: 'Ações de Crescimento — Extensões Premium', desc: 'Serviços de alto valor. <strong>Alto retorno por hora trabalhada</strong>.', ex: 'Volume Russo, Mega Volume, Extensão Sirena, Extensão com Fios de Seda Premium.', peso: '25-35%', risco: 'Moderado', retorno: 'Alto', tip: 'É aqui que o lucro real mora. Cada slot de volume russo perdido para manutenção simples é dinheiro saindo do seu bolso.' },
            { icon: '🏆', nome: 'Fundos Premium — Procedimentos de Alto Valor', desc: 'Ticket altíssimo e alta percepção de valor. <strong>Alta margem, efeito uau</strong>.', ex: 'Brow Lamination, Lash Lifting com Tintura, Design HD com Henna, Combo Olhar Completo.', peso: '20-25%', risco: 'Moderado-Alto', retorno: 'Muito Alto', tip: 'São seus geradores de autoridade. Cada resultado postado é propaganda gratuita que atrai clientes premium.' },
            { icon: '💎', nome: 'Dividendos — Programas de Fidelidade & Recorrência', desc: 'Renda passiva e previsível. <strong>Receita garantida antes do mês começar</strong>.', ex: 'Pacote Mensal 2 Manutenções, Assinatura Olhar VIP, Combo Trimestral Cílios + Sobrancelha.', peso: '10-20%', risco: 'Muito Baixo', retorno: 'Previsível', tip: 'Se 15 clientes pagam R$150/mês, você começa todo mês com R$2.250 garantidos — antes de qualquer encaixe.' },
            { icon: '🎓', nome: 'Venture Capital — Cursos & Workshops', desc: 'Monetização do seu conhecimento. <strong>Escala sem trocar hora por dinheiro</strong>.', ex: 'Workshop "Cílios Perfeitos em Casa", Curso Online de Design, Mentoria para Profissionais.', peso: '5-10%', risco: 'Alto', retorno: 'Exponencial', tip: 'O ativo mais escalável. Um curso gravado pode gerar renda por anos. Exige autoridade construída nos outros 4 ativos primeiro.' }
        ];

        const cards = ativos.map((a, i) => `
            <div class="bolsa-ativo-card">
                <div class="bolsa-ativo-header">
                    <span class="bolsa-ativo-icon">${a.icon}</span>
                    <div>
                        <p class="bolsa-ativo-num">ATIVO ${i + 1}</p>
                        <h3 class="bolsa-ativo-title">${a.nome}</h3>
                    </div>
                </div>
                <p class="bolsa-ativo-desc">${a.desc}</p>
                <div class="bolsa-ativo-exemplos">
                    <p class="bolsa-ativo-exemplos-label">EXEMPLOS NO SEU STUDIO</p>
                    <p>${a.ex}</p>
                </div>
                <div class="bolsa-ativo-stats">
                    <div class="bolsa-stat"><p class="bolsa-stat-label">PESO IDEAL</p><p class="bolsa-stat-val">${a.peso}</p></div>
                    <div class="bolsa-stat"><p class="bolsa-stat-label">RISCO</p><p class="bolsa-stat-val">${a.risco}</p></div>
                    <div class="bolsa-stat"><p class="bolsa-stat-label">RETORNO</p><p class="bolsa-stat-val">${a.retorno}</p></div>
                </div>
                <div class="bolsa-ativo-tip">💡 ${a.tip}</div>
            </div>
        `).join('');

        return `
        <div class="bolsa-section">
            <div class="bolsa-card" style="margin-bottom:20px">
                <div class="bolsa-section-header">
                    <div class="bolsa-icon-box" style="background:var(--primary-light)">📊</div>
                    <h2 class="bolsa-section-title">Os 5 Ativos do Seu Studio</h2>
                </div>
                <p class="bolsa-prose">Assim como na bolsa de valores, seu studio possui <strong>5 categorias de ativos</strong>. O segredo não é apostar tudo em uma — é encontrar o <strong>equilíbrio perfeito</strong> entre risco, retorno e previsibilidade.</p>
            </div>
            <div class="bolsa-ativos-grid">${cards}</div>
            <p style="text-align:center;color:var(--text-muted);font-size:0.75rem;letter-spacing:0.1em;font-weight:600;padding:24px 0">— PRÓXIMO: MONTE SUA CARTEIRA —</p>
        </div>`;
    },

    renderMinhaCarteira() {
        return `
        <div class="bolsa-section">
            <div class="bolsa-dark-panel" style="margin-bottom:20px">
                <div class="bolsa-section-header" style="margin-bottom:20px">
                    <div class="bolsa-icon-box" style="background:rgba(255,255,255,0.15)">⚡</div>
                    <div>
                        <h2 style="color:#fff;font-size:1.2rem;font-weight:800;margin:0">Motor Hora Cem 💰</h2>
                        <p style="color:rgba(255,255,255,0.6);font-size:0.78rem;margin:0">Calcule quanto vale <strong>cada hora</strong> da sua cadeira</p>
                    </div>
                </div>
                <div class="bolsa-calc-grid-3">
                    <div>
                        <label class="bolsa-input-label">Custo Fixo Mensal (R$)</label>
                        <input type="number" id="hc-custo-fixo" class="bolsa-input-dark" placeholder="3.500" value="3500">
                    </div>
                    <div>
                        <label class="bolsa-input-label">Dias de Trabalho / Mês</label>
                        <input type="number" id="hc-dias" class="bolsa-input-dark" placeholder="22" value="22">
                    </div>
                    <div>
                        <label class="bolsa-input-label">Horas de Atendimento / Dia</label>
                        <input type="number" id="hc-horas" class="bolsa-input-dark" placeholder="8" value="8">
                    </div>
                </div>
                <div class="bolsa-calc-grid-2" style="margin-top:12px">
                    <div>
                        <label class="bolsa-input-label">Meta de Lucro Mensal (R$)</label>
                        <input type="number" id="hc-meta-lucro" class="bolsa-input-dark" placeholder="8.000" value="8000">
                    </div>
                    <div>
                        <label class="bolsa-input-label">Custo Variável por Atend. (R$)</label>
                        <input type="number" id="hc-custo-var" class="bolsa-input-dark" placeholder="25" value="25">
                        <p style="color:rgba(255,255,255,0.4);font-size:0.68rem;margin-top:4px">Cola, fios, pigmentos, consumíveis</p>
                    </div>
                </div>
                <button onclick="BolsaBeleza.calcularHoraCem()" class="btn btn-primary" style="width:100%;margin-top:16px;justify-content:center;gap:8px;display:flex;align-items:center">
                    <span class="material-symbols-outlined">calculate</span>Calcular Meu Hora Cem
                </button>
                <div id="hc-resultado" class="bolsa-hc-resultado" style="display:none">
                    <div class="bolsa-hc-stats">
                        <div class="bolsa-hc-stat"><p class="bolsa-hc-stat-label">CUSTO/HORA</p><p class="bolsa-hc-stat-val" style="color:#f87171" id="hc-custo-hora">R$ 0</p></div>
                        <div class="bolsa-hc-stat"><p class="bolsa-hc-stat-label">HORA CEM</p><p class="bolsa-hc-stat-val" style="color:#34d399" id="hc-hora-cem">R$ 0</p></div>
                        <div class="bolsa-hc-stat"><p class="bolsa-hc-stat-label">META/DIA</p><p class="bolsa-hc-stat-val" style="color:var(--gold)" id="hc-meta-dia">R$ 0</p></div>
                        <div class="bolsa-hc-stat"><p class="bolsa-hc-stat-label">TICKET MÍN.</p><p class="bolsa-hc-stat-val" style="color:#60a5fa" id="hc-ticket-min">R$ 0</p></div>
                    </div>
                    <div class="bolsa-hc-insight"><p id="hc-insight"></p></div>
                </div>
            </div>

            <div class="bolsa-card" style="margin-bottom:20px">
                <div class="bolsa-section-header">
                    <div class="bolsa-icon-box" style="background:var(--primary-light)">📋</div>
                    <h3 class="bolsa-section-title" style="font-size:1rem">Meus Serviços — Composição da Carteira</h3>
                </div>
                <p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:16px">Cadastre seus serviços e veja como sua carteira está distribuída entre os 5 ativos.</p>
                <div id="servicos-lista" style="display:flex;flex-direction:column;gap:10px;margin-bottom:12px"></div>
                <button onclick="BolsaBeleza.adicionarServico()" class="bolsa-btn-add">
                    <span class="material-symbols-outlined">add_circle</span>Adicionar Serviço
                </button>
            </div>

            <div class="bolsa-card">
                <div class="bolsa-section-header">
                    <div class="bolsa-icon-box bolsa-icon-box-gold">🍩</div>
                    <h3 class="bolsa-section-title" style="font-size:1rem">Alocação da Carteira</h3>
                </div>
                <div class="bolsa-aloc-grid" id="alocacao-grid">
                    <div class="bolsa-aloc-item" style="--aloc-color:#10b981"><p class="bolsa-aloc-cat">RENDA FIXA</p><p class="bolsa-aloc-pct" id="aloc-0">0%</p><p class="bolsa-aloc-ideal">Ideal: 20-30%</p></div>
                    <div class="bolsa-aloc-item" style="--aloc-color:#a855f7"><p class="bolsa-aloc-cat">CRESCIMENTO</p><p class="bolsa-aloc-pct" id="aloc-1">0%</p><p class="bolsa-aloc-ideal">Ideal: 25-35%</p></div>
                    <div class="bolsa-aloc-item" style="--aloc-color:var(--gold)"><p class="bolsa-aloc-cat">PREMIUM</p><p class="bolsa-aloc-pct" id="aloc-2">0%</p><p class="bolsa-aloc-ideal">Ideal: 20-25%</p></div>
                    <div class="bolsa-aloc-item" style="--aloc-color:#38bdf8"><p class="bolsa-aloc-cat">DIVIDENDOS</p><p class="bolsa-aloc-pct" id="aloc-3">0%</p><p class="bolsa-aloc-ideal">Ideal: 10-20%</p></div>
                    <div class="bolsa-aloc-item" style="--aloc-color:var(--primary)"><p class="bolsa-aloc-cat">VENTURE</p><p class="bolsa-aloc-pct" id="aloc-4">0%</p><p class="bolsa-aloc-ideal">Ideal: 5-10%</p></div>
                </div>
                <div class="bolsa-aloc-bar" id="alocacao-bar">
                    <div style="background:#10b981;height:100%;transition:width 0.5s;width:0%" id="bar-0"></div>
                    <div style="background:#a855f7;height:100%;transition:width 0.5s;width:0%" id="bar-1"></div>
                    <div style="background:var(--gold);height:100%;transition:width 0.5s;width:0%" id="bar-2"></div>
                    <div style="background:#38bdf8;height:100%;transition:width 0.5s;width:0%" id="bar-3"></div>
                    <div style="background:var(--primary);height:100%;transition:width 0.5s;width:0%" id="bar-4"></div>
                </div>
                <p style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:8px" id="alocacao-total">Faturamento total: R$ 0</p>
            </div>
        </div>`;
    },
    renderPlano14Dias() {
        const dias = [
            { dia: 1, titulo: 'Audite Sua Agenda', desc: 'Revise os últimos 30 dias. Quantos atendimentos foram de manutenção barata? Quantos de extensão premium? Anote a proporção real.', cat: 'Diagnóstico' },
            { dia: 2, titulo: 'Calcule Seu Hora Cem', desc: 'Use o motor na aba anterior. Descubra o custo real de cada hora e quanto precisa cobrar para lucrar de verdade.', cat: 'Financeiro' },
            { dia: 3, titulo: 'Catalogue Seus Serviços', desc: 'Liste todos os serviços com preço, tempo médio e custo de material. Classifique cada um nos 5 ativos.', cat: 'Estratégia' },
            { dia: 4, titulo: 'Elimine os Vilões', desc: 'Identifique serviços que dão prejuízo (ticket < custo/hora). Reajuste o preço ou retire do portfólio.', cat: 'Financeiro' },
            { dia: 5, titulo: 'Crie Seu Combo Premium', desc: 'Monte um combo "Olhar Completo" (cílios + sobrancelha + tintura). Preço premium com alta percepção de valor.', cat: 'Produto' },
            { dia: 6, titulo: 'Lance o Pacote de Fidelidade', desc: 'Crie um pacote mensal com 2 manutenções incluídas. Ofereça às 10 melhores clientes. Meta: 5 adesões.', cat: 'Recorrência' },
            { dia: 7, titulo: 'Faça 5 Stories de Bastidores', desc: 'Mostre seu material premium, antes/depois, seu setup. Não venda — gere desejo e autoridade.', cat: 'Marketing' },
            { dia: 8, titulo: 'Reajuste 3 Preços', desc: 'Escolha 3 serviços abaixo do seu Hora Cem e aumente em 15-25%. Comunique valor, não custo.', cat: 'Financeiro' },
            { dia: 9, titulo: 'Crie Sua Lista VIP', desc: 'Identifique as 20 clientes que mais gastam. Ofereça agendamento prioritário e um mimo exclusivo.', cat: 'Fidelização' },
            { dia: 10, titulo: 'Grave Um Reels Tutorial', desc: 'Ensine algo simples (cuidados pós-extensão). Posicione-se como especialista. Marketing de autoridade.', cat: 'Marketing' },
            { dia: 11, titulo: 'Prospecte 3 Parcerias', desc: 'Busque salões, dermatologistas, espaços de estética para indicação mútua. Construa sua rede.', cat: 'Parcerias' },
            { dia: 12, titulo: 'Implemente Upsell Automático', desc: 'Para cada manutenção, sugira um upgrade. Treine o pitch: "Por +R$X incluo a tintura dos cílios."', cat: 'Vendas' },
            { dia: 13, titulo: 'Analise Sua Nova Alocação', desc: 'Volte à aba "Minha Carteira" e atualize os números. Compare com o dia 1. A proporção melhorou?', cat: 'Análise' },
            { dia: 14, titulo: 'Defina Metas do Mês', desc: 'Com base nos dados, defina: faturamento-alvo, ticket médio ideal, número mínimo de procedimentos premium por semana.', cat: 'Planejamento' }
        ];

        const catColors = { 'Diagnóstico':'#a855f7','Financeiro':'#10b981','Estratégia':'#f59e0b','Produto':'#38bdf8','Recorrência':'#6366f1','Marketing':'#ec4899','Fidelização':'#f97316','Vendas':'#ef4444','Parcerias':'#14b8a6','Análise':'#3b82f6','Planejamento':'#8b5cf6' };

        const items = dias.map(d => `
            <div class="bolsa-dia-card">
                <div class="bolsa-dia-num">${d.dia}</div>
                <div style="flex:1">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                        <h4 style="font-weight:700;font-size:0.88rem;margin:0">${d.titulo}</h4>
                        <span style="font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:20px;background:${catColors[d.cat]}22;color:${catColors[d.cat]}">${d.cat}</span>
                    </div>
                    <p style="font-size:0.78rem;color:var(--text-muted);line-height:1.5;margin:0">${d.desc}</p>
                </div>
                <label style="flex-shrink:0;cursor:pointer">
                    <input type="checkbox" class="plano14-check" data-dia="${d.dia}" style="width:18px;height:18px;cursor:pointer;accent-color:var(--primary)">
                </label>
            </div>`).join('');

        return `
        <div class="bolsa-section">
            <div class="bolsa-card" style="margin-bottom:20px">
                <div class="bolsa-section-header">
                    <div class="bolsa-icon-box bolsa-icon-box-gold">🚀</div>
                    <h2 class="bolsa-section-title">Plano de Tração: 14 Dias Para Rebalancear</h2>
                </div>
                <p class="bolsa-prose">Um protocolo <strong>dia a dia</strong> para otimizar sua carteira. Cada ação é pequena, mas o efeito acumulado transforma seu faturamento.</p>
                <div style="display:flex;align-items:center;gap:12px;margin-top:16px">
                    <div style="flex:1;height:8px;background:var(--bg-secondary);border-radius:8px;overflow:hidden">
                        <div style="height:100%;background:var(--primary);border-radius:8px;transition:width 0.4s;width:0%" id="plano14-progress"></div>
                    </div>
                    <span style="font-size:0.78rem;font-weight:700;color:var(--text-muted)" id="plano14-counter">0/14</span>
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px">${items}</div>
        </div>`;
    },

    renderFerramentas() {
        const ferramentas = [
            { icon: '💲', titulo: 'Calculadora de Margem', desc: 'Para cada serviço, calcule: (Preço - Custo Material - Custo Hora) = Margem Líquida. Se a margem for menor que 40%, revise.', acao: 'Fórmula: (Preço - Material - (Custo Fixo/Hora × Tempo)) ÷ Preço × 100 = Margem %' },
            { icon: '↕️', titulo: 'Matriz de Rebalanceamento', desc: 'Monte uma tabela com todos os serviços. Classifique por: Frequência, Ticket, Margem, Tempo. Elimine os que pontuam baixo em tudo.', acao: 'Regra: Se um serviço pontua abaixo de 2/4 critérios, ele está desbalanceando sua carteira.' },
            { icon: '📣', titulo: 'Script de Upsell', desc: 'Para cada serviço básico, tenha um upgrade pronto: "Que tal incluir a tintura por apenas +R$X?"', acao: 'Template: "[Nome], como você já está fazendo [serviço], fica perfeito complementar com [upgrade]. É um investimento de apenas +R$[valor]."' },
            { icon: '📅', titulo: 'Régua de Agendamento', desc: 'Defina slots premium no horário nobre (10h-15h) para extensões/combos. Manutenções ficam nos extremos.', acao: 'Slots 10h, 11h, 13h, 14h = Premium. Slots 8h, 9h, 16h, 17h = Manutenções e retoques.' }
        ];

        const cards = ferramentas.map(f => `
            <div class="bolsa-card">
                <div class="bolsa-section-header">
                    <div class="bolsa-icon-box" style="background:var(--primary-light);font-size:1.2rem">${f.icon}</div>
                    <h3 style="font-weight:700;font-size:0.95rem;margin:0">${f.titulo}</h3>
                </div>
                <p style="font-size:0.84rem;color:var(--text-secondary);margin-bottom:12px;line-height:1.6">${f.desc}</p>
                <div style="background:var(--bg-secondary);border-radius:10px;padding:12px;border-left:3px solid var(--primary)">
                    <p style="font-size:0.75rem;color:var(--text-secondary);font-family:monospace;line-height:1.6">${f.acao}</p>
                </div>
            </div>`).join('');

        return `
        <div class="bolsa-section">
            <div class="bolsa-card" style="margin-bottom:20px">
                <div class="bolsa-section-header">
                    <div class="bolsa-icon-box" style="background:var(--primary-light)">🔧</div>
                    <h2 class="bolsa-section-title">Ferramentas de Rebalanceamento</h2>
                </div>
                <p class="bolsa-prose">Ferramentas práticas para otimizar sua carteira de serviços e maximizar cada hora da sua cadeira.</p>
            </div>
            <div class="bolsa-ativos-grid">${cards}</div>
        </div>`;
    },

    renderInsight() {
        return `
        <div class="bolsa-section">
            <div class="bolsa-insight-panel">
                <div style="text-align:center;margin-bottom:28px">
                    <span style="font-size:3rem">💎</span>
                    <h2 style="font-size:1.6rem;font-weight:900;color:var(--gold);margin:12px 0 8px">O Insight de Ouro</h2>
                    <div style="width:48px;height:3px;background:var(--gold);border-radius:4px;margin:0 auto"></div>
                </div>
                <blockquote class="bolsa-quote">
                    "Você não precisa de mais clientes.<br>
                    Você precisa das <span style="color:var(--gold);text-decoration:underline wavy">clientes certas</span>,<br>
                    nos <span style="color:var(--gold);text-decoration:underline wavy">serviços certos</span>,<br>
                    no <span style="color:var(--gold);text-decoration:underline wavy">preço certo</span>."
                </blockquote>
                <div class="bolsa-insight-body">
                    <p>A maioria das profissionais tenta resolver problemas de faturamento com <strong>mais trabalho</strong>. Mais horários, mais clientes, mais cansaço. Isso é a esteira — você corre muito e não sai do lugar.</p>
                    <p>A <strong>Bolsa da Beleza</strong> é o oposto. É olhar para sua agenda como um investidor olha para sua carteira: quais ativos estão performando? Quais estão queimando capital? Onde realocar para maximizar retorno?</p>
                    <p><strong>Quando você domina essa mentalidade, <span style="color:var(--primary)">trabalha menos, ganha mais, e constrói um studio que funciona como uma máquina de lucro previsível</span>.</strong></p>
                </div>
                <div class="bolsa-insight-stats">
                    <div class="bolsa-insight-stat"><p style="font-size:1.8rem;font-weight:900;color:#f87171">-30%</p><p style="font-size:0.65rem;font-weight:700;color:var(--text-muted)">MENOS HORAS</p></div>
                    <div class="bolsa-insight-stat"><p style="font-size:1.8rem;font-weight:900;color:#34d399">+80%</p><p style="font-size:0.65rem;font-weight:700;color:var(--text-muted)">MAIS LUCRO</p></div>
                    <div class="bolsa-insight-stat"><p style="font-size:1.8rem;font-weight:900;color:var(--primary)">∞</p><p style="font-size:0.65rem;font-weight:700;color:var(--text-muted)">QUALIDADE DE VIDA</p></div>
                </div>
            </div>

            <!-- Card de Download do eBook -->
            <div style="margin-top:24px;background:linear-gradient(135deg,#1a0a10 0%,#2d0f1e 50%,#3d1530 100%);border-radius:20px;padding:28px 24px;position:relative;overflow:hidden;border:1px solid rgba(196,117,138,0.25);">
                <div style="position:absolute;right:-16px;top:-16px;font-size:100px;opacity:0.07;transform:rotate(-10deg);line-height:1;">📖</div>
                <div style="position:relative;z-index:1;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                        <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,var(--primary),#a0506a);display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;box-shadow:0 4px 16px rgba(196,117,138,0.4);">📘</div>
                        <div>
                            <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:rgba(196,117,138,0.7);font-weight:700;margin-bottom:2px;">Material Exclusivo</div>
                            <h3 style="color:#fff;font-size:1.05rem;font-weight:800;margin:0;line-height:1.2;">eBook Bolsa da Beleza</h3>
                        </div>
                    </div>
                    <p style="color:rgba(255,255,255,0.7);font-size:0.85rem;line-height:1.65;margin-bottom:20px;">
                        Aprofunde ainda mais seu conhecimento em gestão estratégica para studios. O eBook completo com planilhas, modelos e estratégias para transformar seu studio em um negócio lucrativo.
                    </p>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
                        <a href="https://drive.google.com/file/d/1u7rgf6rOdh8Rpr2t6HdYnJ2s_fpwFtYg/view?usp=sharing"
                           target="_blank" rel="noopener"
                           style="display:inline-flex;align-items:center;gap:10px;padding:13px 22px;background:linear-gradient(135deg,var(--primary),#a0506a);color:#fff;border-radius:12px;text-decoration:none;font-weight:700;font-size:0.9rem;box-shadow:0 4px 16px rgba(196,117,138,0.45);transition:all 0.2s;"
                           onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(196,117,138,0.6)';"
                           onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 16px rgba(196,117,138,0.45)';">
                            <span class="material-symbols-outlined" style="font-size:20px;">download</span>
                            Baixar eBook Gratuito
                        </a>
                        <span style="font-size:0.75rem;color:rgba(255,255,255,0.4);display:flex;align-items:center;gap:4px;">
                            <span class="material-symbols-outlined" style="font-size:14px;">lock_open</span>
                            Acesso gratuito · PDF
                        </span>
                    </div>
                </div>
            </div>

        </div>`;
    },
    // ══════════════════════════════════════════
    // NAVEGAÇÃO E EVENTOS
    // ══════════════════════════════════════════
    init() {
        this.currentSection = 0;
        this.bindNavigation();
    },

    bindNavigation() {
        document.querySelectorAll('.bolsa-tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.section);
                this.navigateTo(idx);
            });
        });
        const prev = document.getElementById('bolsa-prev');
        const next = document.getElementById('bolsa-next');
        if (prev) prev.addEventListener('click', () => this.navigateTo(this.currentSection - 1));
        if (next) next.addEventListener('click', () => this.navigateTo(this.currentSection + 1));
    },

    navigateTo(idx) {
        if (idx < 0 || idx >= this.sections.length) return;
        this.currentSection = idx;
        const contentEl = document.getElementById('bolsa-content');
        if (!contentEl) return;

        contentEl.style.opacity = '0';
        contentEl.style.transform = 'translateY(10px)';

        setTimeout(() => {
            switch (idx) {
                case 0: contentEl.innerHTML = this.renderIntro(); break;
                case 1: contentEl.innerHTML = this.renderAtivos(); break;
                case 2:
                    contentEl.innerHTML = this.renderMinhaCarteira();
                    this.atualizarAlocacao();
                    this._carregarDadosFirestore();
                    break;
                case 3:
                    contentEl.innerHTML = this.renderPlano14Dias();
                    this._carregarDadosFirestore().then(() => this._bindPlano14());
                    break;
                case 4: contentEl.innerHTML = this.renderFerramentas(); break;
                case 5: contentEl.innerHTML = this.renderInsight(); break;
            }
            contentEl.style.opacity = '1';
            contentEl.style.transform = 'translateY(0)';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 200);

        // Atualizar tabs
        document.querySelectorAll('.bolsa-tab-btn').forEach((tab, i) => {
            tab.classList.toggle('active', i === idx);
        });

        // Atualizar prev/next
        const prev = document.getElementById('bolsa-prev');
        const next = document.getElementById('bolsa-next');
        if (prev) prev.disabled = idx === 0;
        if (next) {
            if (idx === this.sections.length - 1) {
                next.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">check</span>Concluído';
                next.disabled = true;
            } else {
                next.innerHTML = 'Próximo<span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>';
                next.disabled = false;
            }
        }

        const counter = document.getElementById('bolsa-counter');
        if (counter) counter.textContent = `${idx + 1} / ${this.sections.length}`;
    },

    // ══════════════════════════════════════════
    // HORA CEM — MOTOR DE CÁLCULO
    // ══════════════════════════════════════════
    calcularHoraCem() {
        const custoFixo = parseFloat(document.getElementById('hc-custo-fixo')?.value) || 0;
        const dias = parseFloat(document.getElementById('hc-dias')?.value) || 22;
        const horas = parseFloat(document.getElementById('hc-horas')?.value) || 8;
        const metaLucro = parseFloat(document.getElementById('hc-meta-lucro')?.value) || 0;
        const custoVar = parseFloat(document.getElementById('hc-custo-var')?.value) || 0;

        const totalHoras = dias * horas;
        const custoHora = totalHoras > 0 ? custoFixo / totalHoras : 0;
        const metaDia = dias > 0 ? (custoFixo + metaLucro) / dias : 0;
        const horaCem = custoHora + custoVar + (metaLucro / totalHoras);
        const ticketMin = custoHora + custoVar;

        document.getElementById('hc-custo-hora').textContent = `R$ ${custoHora.toFixed(0)}`;
        document.getElementById('hc-hora-cem').textContent = `R$ ${horaCem.toFixed(0)}`;
        document.getElementById('hc-meta-dia').textContent = `R$ ${metaDia.toFixed(0)}`;
        document.getElementById('hc-ticket-min').textContent = `R$ ${ticketMin.toFixed(0)}`;

        const insight = `Para atingir sua meta de R$ ${metaLucro.toLocaleString('pt-BR')} de lucro, cada hora na cadeira precisa gerar pelo menos <strong>R$ ${horaCem.toFixed(0)}</strong>. Qualquer serviço que cobre menos que <strong>R$ ${ticketMin.toFixed(0)}/hora</strong> está gerando prejuízo real.`;
        document.getElementById('hc-insight').innerHTML = insight;
        document.getElementById('hc-resultado').style.display = 'block';

        this._salvarFirestore('horaCem', { custoFixo, dias, horas, metaLucro, custoVar, custoHora, horaCem, metaDia, ticketMin });
    },

    // ══════════════════════════════════════════
    // SERVIÇOS — GESTÃO DA CARTEIRA
    // ══════════════════════════════════════════
    servicos: [],

    adicionarServico() {
        const id = Date.now();
        this.servicos.push({ id, nome: '', preco: 0, tempo: 1, custo: 0, categoria: 0 });
        this._renderServicos();
    },

    removerServico(id) {
        this.servicos = this.servicos.filter(s => s.id !== id);
        this._renderServicos();
        this.atualizarAlocacao();
        this._salvarFirestore('servicos', this.servicos);
    },

    _renderServicos() {
        const container = document.getElementById('servicos-lista');
        if (!container) return;
        const catNomes = ['Renda Fixa', 'Crescimento', 'Premium', 'Dividendos', 'Venture Capital'];
        container.innerHTML = this.servicos.map(s => `
            <div style="background:var(--bg-secondary);border-radius:12px;padding:14px;border:1px solid var(--border)">
                <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:8px;align-items:end">
                    <div>
                        <label style="font-size:0.65rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px">SERVIÇO</label>
                        <input type="text" value="${s.nome}" onchange="BolsaBeleza._updateServico(${s.id}, 'nome', this.value)"
                            class="form-input" style="font-size:0.84rem" placeholder="Ex: Volume Russo">
                    </div>
                    <div>
                        <label style="font-size:0.65rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px">PREÇO (R$)</label>
                        <input type="number" value="${s.preco}" onchange="BolsaBeleza._updateServico(${s.id}, 'preco', this.value)"
                            class="form-input" style="font-size:0.84rem" placeholder="250">
                    </div>
                    <div>
                        <label style="font-size:0.65rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px">TEMPO (H)</label>
                        <input type="number" step="0.5" value="${s.tempo}" onchange="BolsaBeleza._updateServico(${s.id}, 'tempo', this.value)"
                            class="form-input" style="font-size:0.84rem" placeholder="2">
                    </div>
                    <div>
                        <label style="font-size:0.65rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px">ATIVO</label>
                        <select onchange="BolsaBeleza._updateServico(${s.id}, 'categoria', this.value)" class="form-input" style="font-size:0.84rem">
                            ${catNomes.map((n, i) => `<option value="${i}" ${s.categoria == i ? 'selected' : ''}>${n}</option>`).join('')}
                        </select>
                    </div>
                    <div style="display:flex;align-items:flex-end">
                        <button onclick="BolsaBeleza.removerServico(${s.id})" style="padding:8px;border-radius:8px;border:none;background:none;color:#f87171;cursor:pointer;font-size:1.1rem">🗑</button>
                    </div>
                </div>
            </div>`).join('');
    },

    _updateServico(id, campo, valor) {
        const s = this.servicos.find(s => s.id === id);
        if (!s) return;
        s[campo] = campo === 'nome' ? valor : parseFloat(valor) || 0;
        this.atualizarAlocacao();
        this._salvarFirestore('servicos', this.servicos);
    },

    atualizarAlocacao() {
        const totais = [0, 0, 0, 0, 0];
        this.servicos.forEach(s => { totais[s.categoria] = (totais[s.categoria] || 0) + s.preco; });
        const total = totais.reduce((a, b) => a + b, 0);
        totais.forEach((t, i) => {
            const pct = total > 0 ? Math.round(t / total * 100) : 0;
            const el = document.getElementById(`aloc-${i}`);
            const bar = document.getElementById(`bar-${i}`);
            if (el) el.textContent = `${pct}%`;
            if (bar) bar.style.width = `${pct}%`;
        });
        const totalEl = document.getElementById('alocacao-total');
        if (totalEl) totalEl.textContent = `Faturamento total: R$ ${total.toLocaleString('pt-BR')}`;
    },

    // ══════════════════════════════════════════
    // PLANO 14 DIAS — CHECKBOXES
    // ══════════════════════════════════════════
    _bindPlano14() {
        document.querySelectorAll('.plano14-check').forEach(cb => {
            const dia = parseInt(cb.dataset.dia);
            const saved = this._dados?.plano14 || {};
            if (saved[dia]) cb.checked = true;
            cb.addEventListener('change', () => {
                if (!this._dados) this._dados = {};
                if (!this._dados.plano14) this._dados.plano14 = {};
                this._dados.plano14[dia] = cb.checked;
                this._atualizarProgressoPlano14();
                this._salvarFirestore('plano14', this._dados.plano14);
            });
        });
        this._atualizarProgressoPlano14();
    },

    _atualizarProgressoPlano14() {
        const checks = document.querySelectorAll('.plano14-check');
        const done = [...checks].filter(c => c.checked).length;
        const prog = document.getElementById('plano14-progress');
        const counter = document.getElementById('plano14-counter');
        if (prog) prog.style.width = `${(done / 14) * 100}%`;
        if (counter) counter.textContent = `${done}/14`;
    },

    // ══════════════════════════════════════════
    // FIRESTORE — PERSISTÊNCIA
    // ══════════════════════════════════════════
    _dados: null,

    async _carregarDadosFirestore() {
        try {
            const uid = firebase.auth().currentUser?.uid;
            if (!uid) return;
            const snap = await firebase.firestore()
                .collection('studios').doc(uid)
                .collection('bolsa_beleza').doc('dados').get();
            if (snap.exists) {
                this._dados = snap.data();
                if (this._dados.servicos) {
                    this.servicos = this._dados.servicos;
                    this._renderServicos();
                    this.atualizarAlocacao();
                }
                if (this._dados.horaCem) {
                    const d = this._dados.horaCem;
                    ['custo-fixo','dias','horas','meta-lucro','custo-var'].forEach(id => {
                        const el = document.getElementById(`hc-${id}`);
                        const key = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace('hc-','');
                        if (el && d[key] !== undefined) el.value = d[key];
                    });
                }
            }
        } catch(e) { console.warn('Firestore load:', e); }
    },

    async _salvarFirestore(chave, valor) {
        try {
            const uid = firebase.auth().currentUser?.uid;
            if (!uid) return;
            await firebase.firestore()
                .collection('studios').doc(uid)
                .collection('bolsa_beleza').doc('dados')
                .set({ [chave]: valor }, { merge: true });
        } catch(e) { console.warn('Firestore save:', e); }
    }
};
