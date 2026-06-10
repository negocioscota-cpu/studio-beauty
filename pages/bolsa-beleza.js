// ============================================================
// BOLSA DA BELEZA — Módulo SPA para Studio Beauty
// Adaptado do app standalone para funcionar dentro do SPA
// ============================================================
const BolsaBeleza = {
  services: [],
  selectedDayIndex: null,
  editingServiceId: null,
  _container: null,
  _saveTimeout: null,

  // ── Constantes ──────────────────────────────────────────

  IDEAL_RANGES: {
    'Âncora':    { min: 40, max: 50, color: '#7c3aed' },
    'Premium':   { min: 25, max: 30, color: '#f97316' },
    'Bem-Estar': { min: 10, max: 15, color: '#3b82f6' },
    'Ocasional': { min: 0,  max: 15, color: '#6b7280' },
    'Exótico':   { min: 0,  max: 5,  color: '#ec4899' }
  },

  STRATEGIES: [
    { id:'A', title:'Priorizar o ativo mais eficiente dentro da classe', description:'Se vai fazer, faz o que te paga mais rápido.', trigger:()=>true },
    { id:'B', title:'Aumentar o valor do ativo e controlar custos/desperdícios', description:'Melhorar a Hora R$100 sem aumentar carga de trabalho.', trigger:(d)=>d.some(x=>x.avgHora100>90) },
    { id:'C', title:'Aumentar o volume do ativo desbalanceado', description:'Caminho mais cansativo, mas direto.', trigger:(d)=>d.some(x=>x.status==='critical'&&x.percentReal<x.idealMin) },
    { id:'D', title:'Criar combos para deslocar o fluxo', description:'Ex: Se Premium está baixo, cria combo "Alongamento + Lash Lifting" → puxa a carteira pra cima.', trigger:(d)=>{const p=d.find(x=>x.type==='Premium');return p&&p.percentReal<p.idealMin;} },
    { id:'E', title:'Reduzir vagas dos ativos que estão pesando muito', description:'Se Âncora está em 70%, limite 2 horários por dia. Rebalanceamento por escassez.', trigger:(d)=>d.some(x=>x.percentReal>x.idealMax+10) },
    { id:'F', title:'Mudar a comunicação (marketing seletivo por ativo)', description:'Se Premium está baixo: só poste premium, só fale premium, só mostre premium. A agenda imita o feed.', trigger:(d)=>d.some(x=>x.status!=='ok') },
    { id:'G', title:'Aumentar gatilhos de recompra (manutenção)', description:'Lembrete automático, agendamento antecipado, bônus pela próxima sessão.', trigger:()=>true },
    { id:'H', title:'Desaceleração estratégica', description:'Deixar de promover propositalmente o ativo que está sobrando.', trigger:(d)=>d.some(x=>x.percentReal>x.idealMax) },
    { id:'I', title:'Reposicionar um ativo dentro de outra classe', description:'Ex: Lash Lifting pode sair de "âncora" e virar "premium leve".', trigger:(d)=>d.some(x=>x.status==='critical') },
    { id:'J', title:'Criar novos ativos dentro da classe defasada', description:'Se Bem-estar está fraco: cria nova massagem curta, terapia capilar express.', trigger:(d)=>d.some(x=>x.percentReal<x.idealMin&&x.count===0) },
    { id:'K', title:'Descontinuar (ou hibernar) o ativo que está descontrolando', description:'O mais poderoso — e o mais negado emocionalmente.', trigger:(d)=>d.some(x=>x.percentReal>x.idealMax+15) }
  ],

  PLAN_14_DAYS: [
    { day:1, title:'ANÚNCIO E EDUCAÇÃO', week:1, scripts:{ instagram_stories:'Explicar o que é o {SERVICO} → 3 stories curtos. Enquete: "Você já fez?" / "Tem vontade?"', instagram_feed:'Carrossel: "O que é / Para quem / Benefícios / Resultados / Duração" sobre {SERVICO}.', whatsapp:'Oi, linda! Esta semana estou dando atenção especial ao {SERVICO}. Se quiser entender se ele é ideal pra você, posso te mandar um diagnóstico gratuito. Quer?' } },
    { day:2, title:'PROVA SOCIAL + BASTIDOR', week:1, scripts:{ instagram_stories:'Antes e depois do {SERVICO}. Vídeo rápido preparando o material. Print de cliente elogiando.', instagram_feed:'Reels: "Transformação em 5 segundos" mostrando resultado do {SERVICO}.', whatsapp:'Esse foi o resultado de {SERVICO} de hoje. Quer um igual? Te explico se serve pra você.' } },
    { day:3, title:'CAIXINHA DE PERGUNTAS', week:1, scripts:{ instagram_stories:'Caixinha: "Pergunte tudo sobre o {SERVICO}!" Responder 5 a 10 perguntas ao longo do dia.', instagram_feed:'Enquete: "Você já sabia disso?" com curiosidade sobre {SERVICO}.', whatsapp:'Recebi várias dúvidas sobre o {SERVICO} hoje. Quer que eu te envie um áudio explicando rapidinho como funciona?' } },
    { day:4, title:'BASTIDOR PROFISSIONAL', week:1, scripts:{ instagram_stories:'Stories mostrando: Higienização, Ferramentas, Explicação técnica simplificada do {SERVICO}.', instagram_feed:'Carrossel: "5 motivos para fazer o {SERVICO}".', whatsapp:'Olha o capricho que o {SERVICO} exige. É por isso que o resultado dura tanto. (Enviar vídeo de 15s do bastidor)' } },
    { day:5, title:'REELS "COMO FUNCIONA"', week:1, scripts:{ instagram_stories:'Enquete: "Você já sabia disso?" com fato sobre {SERVICO}.', instagram_feed:'Reels com legenda clara: "Como funciona o {SERVICO} em 20 segundos".', whatsapp:'Mandei um vídeo explicando como o {SERVICO} funciona. Quer que eu te envie?' } },
    { day:6, title:'COMUNICAÇÃO DE VALOR', week:1, scripts:{ instagram_stories:'Depoimentos reais (prints + vídeos) sobre {SERVICO}.', instagram_feed:'Carrossel: "5 motivos para fazer o {SERVICO}".', whatsapp:'Olha o que as meninas falam depois de fazer {SERVICO}! (enviar prints de elogios)' } },
    { day:7, title:'MINI LISTA DE ESPERA', week:1, scripts:{ instagram_stories:'"Vou abrir 3 horários exclusivos para o {SERVICO} na próxima semana. Quer que eu te coloque na lista?"', instagram_feed:'Post sobre exclusividade e lista de espera do {SERVICO}.', whatsapp:'Estou abrindo uma lista de espera só para o {SERVICO} esta semana. Quer que eu coloque seu nome?' } },
    { day:8, title:'STORYTELLING', week:2, scripts:{ instagram_stories:'Conte a história de uma cliente que transformou o olhar/pele/sobrancelha com o {SERVICO}.', instagram_feed:'Post de storytelling: transformação real com {SERVICO}.', whatsapp:'Você já pensou em fazer {SERVICO}? Ele resolve exatamente [dor da cliente]. Se quiser ver como ficaria no seu caso, te mando sugestão.' } },
    { day:9, title:'COMPARATIVO', week:2, scripts:{ instagram_stories:'Enquete: "Qual combina mais com você?" comparando {SERVICO} com outro serviço.', instagram_feed:'Carrossel no feed: "{SERVICO} vs Y — qual é ideal pra você?"', whatsapp:'No seu rosto, eu recomendaria {SERVICO} por causa de [motivo técnico]. Quer ver um comparativo?' } },
    { day:10, title:'DEMONSTRAÇÃO AO VIVO', week:2, scripts:{ instagram_stories:'Gravar um atendimento real de {SERVICO} em 5 a 8 stories.', instagram_feed:'Reels: "Processo acelerado" do {SERVICO}.', whatsapp:'Olha como fica lindo o {SERVICO}! Fiz agora e lembrei de você.' } },
    { day:11, title:'PROVA SOCIAL PESADA', week:2, scripts:{ instagram_stories:'35-50 segundos de depoimentos em sequência sobre {SERVICO}.', instagram_feed:'Carrossel: Antes e depois com legendas curtas do {SERVICO}.', whatsapp:'Olha os resultados de {SERVICO} de hoje. Se quiser agendar, tenho X horários.' } },
    { day:12, title:'DIAGNÓSTICO PERSONALIZADO', week:2, scripts:{ instagram_stories:'Caixinha: "Quer que eu avalie sua sobrancelha/pele/cílios e te diga qual serviço é ideal?"', instagram_feed:'Post educativo sobre como saber se {SERVICO} é ideal para você.', whatsapp:'Me manda uma foto no ângulo certo que eu analiso pra você se {SERVICO} é o ideal.' } },
    { day:13, title:'OFERTA DE VALOR (sem desconto)', week:2, scripts:{ instagram_stories:'Agende o {SERVICO} e ganhe um mini diagnóstico.', instagram_feed:'Post sobre o valor agregado do {SERVICO}, sem desconto.', whatsapp:'Hoje estou oferecendo um mimo especial para quem fizer {SERVICO}. Quer saber qual?' } },
    { day:14, title:'ENCERRAMENTO E CHAMADO ELEGANTE', week:2, scripts:{ instagram_stories:'Agradecimento + mostrar como o {SERVICO} cresceu na semana.', instagram_feed:'Carrossel: Resultados da campanha de {SERVICO}.', whatsapp:'Fechando a semana de foco no {SERVICO}. Última chamada para os horários desta semana. Quer aproveitar?' } }
  ],

  // ── Helpers ─────────────────────────────────────────────

  _currency(v) { return (v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); },
  _fmtMinutes(m) { if(!m||m<=0) return '0min'; const h=Math.floor(m/60),min=Math.round(m%60); return h>0?`${h}h ${min}min`:`${min}min`; },
  _assetSlug(type) { const m={'Âncora':'ancora','Premium':'premium','Bem-Estar':'bem-estar','Ocasional':'ocasional','Exótico':'exotico'}; return m[type]||'ancora'; },

  _calcFields(s) {
    const profit=(s.price||0)-(s.cost||0), time=s.time||1;
    const efficiency=(profit/time)*60;
    const hora100=profit>0?(100/profit)*time:Infinity;
    const totalRevenue=(s.price||0)*(s.qty||0);
    const totalProfit=profit*(s.qty||0);
    let efficiencyCategory,efficiencyColor;
    if(time<=60){efficiencyCategory='alta';efficiencyColor='#22c55e';}
    else if(time<=75){efficiencyCategory='moderada';efficiencyColor='#eab308';}
    else if(time<=90){efficiencyCategory='baixa';efficiencyColor='#f97316';}
    else{efficiencyCategory='ineficiente';efficiencyColor='#ef4444';}
    return {profit,efficiency,hora100,totalRevenue,totalProfit,efficiencyCategory,efficiencyColor};
  },

  _$(sel) { return this._container ? this._container.querySelector(sel) : document.querySelector(sel); },
  _$$(sel) { return this._container ? this._container.querySelectorAll(sel) : document.querySelectorAll(sel); },

  // ── Ponto de Entrada ────────────────────────────────────

  async render(container) {
    this._container = container;
    this.services = [];
    this.selectedDayIndex = null;
    this.editingServiceId = null;
    container.innerHTML = this._buildHTML();
    this._initNavigation();
    this._initServiceModal();
    this._initCalculator();
    await this._loadFirestore();
    this._renderServicesTable();
    this._renderDashboard();
    this._renderDiagnosis();
    this._populateServiceSelect();

    window.__BB = {
      openModal: (id) => this._openModal(id),
      deleteService: (id) => this._deleteService(id),
      selectDay: (idx,sid) => this._selectDay(idx,sid),
      copyScript: (t) => this._copyScript(t)
    };
  },

  // ── HTML Completo ───────────────────────────────────────

  _buildHTML() {
    return `
    <div class="bb-page">
      <!-- Nav Tabs -->
      <div class="bb-nav-tabs">
        <button class="bb-nav-tab active" data-bb-section="bb-dashboard"><span class="bb-tab-icon">🏠</span><span class="bb-tab-label">Dashboard</span></button>
        <button class="bb-nav-tab" data-bb-section="bb-criterios"><span class="bb-tab-icon">📐</span><span class="bb-tab-label">Critérios</span></button>
        <button class="bb-nav-tab" data-bb-section="bb-servicos"><span class="bb-tab-icon">📋</span><span class="bb-tab-label">Serviços</span></button>
        <button class="bb-nav-tab" data-bb-section="bb-diagnostico"><span class="bb-tab-icon">📊</span><span class="bb-tab-label">Diagnóstico</span></button>
        <button class="bb-nav-tab" data-bb-section="bb-plano14"><span class="bb-tab-icon">🚀</span><span class="bb-tab-label">Plano 14 Dias</span></button>
      </div>

      <!-- SEÇÃO 1: DASHBOARD -->
      <section id="bb-dashboard" class="bb-section active">
        <h2>Dashboard — Visão Geral</h2>
        <div class="bb-dashboard-cards">
          <div class="bb-stat-card" id="bb-stat-total"><span class="bb-stat-icon">📋</span><div class="bb-stat-info"><p class="bb-stat-label">Total de Serviços</p><p class="bb-stat-value">0</p></div></div>
          <div class="bb-stat-card" id="bb-stat-fat"><span class="bb-stat-icon">💰</span><div class="bb-stat-info"><p class="bb-stat-label">Faturamento (3 meses)</p><p class="bb-stat-value">R$ 0,00</p></div></div>
          <div class="bb-stat-card" id="bb-stat-melhor"><span class="bb-stat-icon">⭐</span><div class="bb-stat-info"><p class="bb-stat-label">Serviço Mais Eficiente</p><p class="bb-stat-value">—</p></div></div>
          <div class="bb-stat-card" id="bb-stat-alertas"><span class="bb-stat-icon">⚠️</span><div class="bb-stat-info"><p class="bb-stat-label">Alertas de Desvio</p><p class="bb-stat-value">0</p></div></div>
        </div>
        <div class="bb-chart-container"><h3>Composição da Carteira</h3><canvas id="bb-dashboard-pie" width="300" height="300"></canvas><div class="bb-pie-chart-legend" id="bb-dashboard-legend"></div></div>
        <div class="bb-top-services"><h3>Top 3 por Eficiência/Hora</h3><div id="bb-top-list"></div></div>
      </section>

      <!-- SEÇÃO 2: CRITÉRIOS -->
      <section id="bb-criterios" class="bb-section">
        <h2>Critérios de Avaliação</h2>
        <p>Antes de classificar seus serviços, entenda os 3 critérios que definem a saúde do seu portfólio.</p>
        <div class="bb-criteria-section">
          <div class="bb-criteria-header"><h3>⏱️ Critério 1 — TEMPO</h3><p>Tempo gasto por atendimento (execução + preparo + limpeza)</p></div>
          <div class="bb-efficiency-grid">
            <div class="bb-efficiency-card alta"><span class="bb-efficiency-badge">🟢</span><h4>Alta Eficiência</h4><p class="bb-efficiency-range">Até 60 min</p><p class="bb-efficiency-desc">Lucro rápido e previsível.</p></div>
            <div class="bb-efficiency-card moderada"><span class="bb-efficiency-badge">🟡</span><h4>Moderada</h4><p class="bb-efficiency-range">61–75 min</p><p class="bb-efficiency-desc">Lucro razoável, pode melhorar.</p></div>
            <div class="bb-efficiency-card baixa"><span class="bb-efficiency-badge">🟠</span><h4>Baixa</h4><p class="bb-efficiency-range">76–90 min</p><p class="bb-efficiency-desc">Consome tempo, paga devagar.</p></div>
            <div class="bb-efficiency-card ineficiente"><span class="bb-efficiency-badge">🔴</span><h4>Ineficiente</h4><p class="bb-efficiency-range">+90 min</p><p class="bb-efficiency-desc">Tempo demais pra pouco retorno.</p></div>
          </div>
        </div>
        <div class="bb-criteria-section">
          <div class="bb-criteria-header"><h3>🎯 Critério 2 — RISCO</h3><p>A estabilidade da procura.</p></div>
          <table class="bb-criteria-table"><thead><tr><th>Nota</th><th>Descrição</th><th>Interpretação</th></tr></thead><tbody>
            <tr><td>1</td><td>Procura constante o ano todo</td><td>Serviço essencial</td></tr>
            <tr><td>2</td><td>Pequenas variações sazonais</td><td>Vende bem quase sempre</td></tr>
            <tr><td>3</td><td>Oscila com clima ou moda</td><td>Meses fortes e fracos</td></tr>
            <tr><td>4</td><td>Depende de tendência/evento</td><td>Alta demanda sazonal</td></tr>
            <tr><td>5</td><td>Serviço modista ou instável</td><td>Popular por pouco tempo</td></tr>
          </tbody></table>
        </div>
        <div class="bb-criteria-section">
          <div class="bb-criteria-header"><h3>💧 Critério 3 — LIQUIDEZ</h3><p>Velocidade da venda.</p></div>
          <table class="bb-criteria-table"><thead><tr><th>Nota</th><th>Descrição</th><th>Interpretação</th></tr></thead><tbody>
            <tr><td>1</td><td>A cliente pede sozinha</td><td>Alta demanda espontânea</td></tr>
            <tr><td>2</td><td>Vende com leve divulgação</td><td>Bastam fotos e agendamentos</td></tr>
            <tr><td>3</td><td>Requer esforço de marketing moderado</td><td>Precisa explicar valor</td></tr>
            <tr><td>4</td><td>Vende bem só com oferta ou desconto</td><td>Alta concorrência</td></tr>
            <tr><td>5</td><td>Quase não vende</td><td>Serviço muito nichado</td></tr>
          </tbody></table>
          <p class="bb-highlight-text">"A Hora R$ 100 mostra quanto tempo seu trabalho precisa para gerar R$ 100 de lucro."</p>
        </div>
        <div class="bb-calculator-box">
          <h3>🧮 Calculadora — Hora R$100</h3>
          <div class="bb-calc-inputs">
            <div class="bb-calc-input"><label for="bb-calc-price">Preço do Serviço (R$)</label><input type="number" id="bb-calc-price" placeholder="150,00" step="0.01" min="0"></div>
            <div class="bb-calc-input"><label for="bb-calc-cost">Custo Direto (R$)</label><input type="number" id="bb-calc-cost" placeholder="30,00" step="0.01" min="0"></div>
            <div class="bb-calc-input"><label for="bb-calc-time">Tempo Total (min)</label><input type="number" id="bb-calc-time" placeholder="60" min="1"></div>
          </div>
          <button class="bb-btn-primary" id="bb-btn-calc">Calcular</button>
          <div class="bb-calc-result" id="bb-calc-result"></div>
        </div>
      </section>

      <!-- SEÇÃO 3: SERVIÇOS -->
      <section id="bb-servicos" class="bb-section">
        <div class="bb-services-header"><h2>Cadastro de Serviços</h2><button class="bb-btn-primary" id="bb-btn-add-service">+ Novo Serviço</button></div>
        <div class="bb-services-table-container">
          <table class="bb-services-table" id="bb-services-table">
            <thead><tr><th>Procedimento</th><th>Tipo</th><th>Tempo</th><th>Valor</th><th>Custo</th><th>Lucro</th><th>R$/Hora</th><th>Hora R$100</th><th>Atend. 3m</th><th>Ações</th></tr></thead>
            <tbody id="bb-services-tbody"></tbody>
          </table>
          <div class="bb-empty-state" id="bb-empty-services"><p>Nenhum serviço cadastrado. Clique em "<strong>+ Novo Serviço</strong>" para começar.</p></div>
        </div>
      </section>

      <!-- SEÇÃO 4: DIAGNÓSTICO -->
      <section id="bb-diagnostico" class="bb-section">
        <h2>Diagnóstico de Carteira</h2>
        <div class="bb-diagnosis-grid">
          <div class="bb-diagnosis-col"><h3>Carteira Real</h3><canvas id="bb-diagnosis-pie" width="350" height="350"></canvas><div class="bb-pie-chart-legend" id="bb-diagnosis-legend"></div></div>
          <div class="bb-diagnosis-col">
            <h3>Real vs Ideal</h3>
            <table class="bb-comparison-table" id="bb-comparison-table">
              <thead><tr><th>Tipo de Ativo</th><th>% Real</th><th>% Ideal</th><th>Faturamento</th><th>Faturamento Ideal</th><th>Status</th></tr></thead>
              <tbody id="bb-comparison-tbody"></tbody>
            </table>
          </div>
        </div>
        <div class="bb-alerts-container" id="bb-alerts-container"><h3>⚠️ Alertas de Desvio</h3><div id="bb-alerts-list"></div></div>
        <h3>🔧 Estratégias de Rebalanceamento</h3>
        <p>Baseado no seu diagnóstico, estas são as estratégias recomendadas:</p>
        <div class="bb-strategies-grid" id="bb-strategies-grid"></div>
      </section>

      <!-- SEÇÃO 5: PLANO 14 DIAS -->
      <section id="bb-plano14" class="bb-section">
        <h2>Plano Tático de 14 Dias</h2>
        <p>Escolha um serviço que precisa de tração e siga o calendário diário.</p>
        <div class="bb-plan-selector">
          <label for="bb-plan-service-select">Selecione o Ativo-Alvo:</label>
          <select id="bb-plan-service-select"><option value="">— Selecione um serviço —</option></select>
        </div>
        <div class="bb-service-summary-card bb-hidden" id="bb-plan-summary"></div>
        <h3>📅 Calendário Tático</h3>
        <p class="bb-week-label">SEMANA 1 — A SEMANA DA CONEXÃO</p>
        <div class="bb-calendar-grid" id="bb-week1-grid"></div>
        <p class="bb-week-label">SEMANA 2 — A SEMANA DA DECISÃO</p>
        <div class="bb-calendar-grid" id="bb-week2-grid"></div>
        <div class="bb-hidden" id="bb-scripts-container"><h3 id="bb-scripts-day-title"></h3><div id="bb-scripts-list"></div></div>
      </section>

      <!-- MODAL -->
      <div class="bb-modal-overlay" id="bb-service-modal">
        <div class="bb-modal">
          <div class="bb-modal-header"><h3 id="bb-modal-title">Novo Serviço</h3><button class="bb-modal-close" id="bb-modal-close">&times;</button></div>
          <div class="bb-modal-body">
            <form id="bb-service-form">
              <div class="bb-form-group"><label for="bb-input-name">Procedimento</label><input type="text" id="bb-input-name" placeholder="Ex: Design de Sobrancelhas" required></div>
              <div class="bb-form-row">
                <div class="bb-form-group"><label for="bb-input-time">Tempo Total (min)</label><input type="number" id="bb-input-time" placeholder="60" min="1" required></div>
                <div class="bb-form-group"><label for="bb-input-price">Valor Cobrado (R$)</label><input type="number" id="bb-input-price" placeholder="150" step="0.01" min="0" required></div>
              </div>
              <div class="bb-form-row">
                <div class="bb-form-group"><label for="bb-input-qty">Nº Atendimentos (3 meses)</label><input type="number" id="bb-input-qty" placeholder="45" min="0" required></div>
                <div class="bb-form-group"><label for="bb-input-cost">Custo Insumos (R$)</label><input type="number" id="bb-input-cost" placeholder="30" step="0.01" min="0" required></div>
              </div>
              <div class="bb-form-row">
                <div class="bb-form-group"><label for="bb-input-risk">Risco</label><select id="bb-input-risk" required><option value="">— Selecione —</option><option value="1">1 — Constante</option><option value="2">2 — Variação leve</option><option value="3">3 — Oscila</option><option value="4">4 — Tendência</option><option value="5">5 — Instável</option></select></div>
                <div class="bb-form-group"><label for="bb-input-liquidity">Liquidez</label><select id="bb-input-liquidity" required><option value="">— Selecione —</option><option value="1">1 — Pede sozinha</option><option value="2">2 — Leve divulgação</option><option value="3">3 — Marketing moderado</option><option value="4">4 — Só com oferta</option><option value="5">5 — Quase não vende</option></select></div>
              </div>
              <div class="bb-form-group"><label for="bb-input-asset-type">Tipo de Ativo</label><select id="bb-input-asset-type" required><option value="">— Selecione —</option><option value="Âncora">Âncora</option><option value="Premium">Premium</option><option value="Bem-Estar">Bem-Estar</option><option value="Ocasional">Ocasional</option><option value="Exótico">Exótico</option></select></div>
              <div class="bb-form-actions"><button type="button" class="bb-btn-secondary" id="bb-btn-cancel-modal">Cancelar</button><button type="submit" class="bb-btn-primary">Salvar</button></div>
              <input type="hidden" id="bb-edit-id" value="">
            </form>
          </div>
        </div>
      </div>

      <!-- TOAST -->
      <div class="bb-copy-feedback" id="bb-copy-toast">✅ Script copiado!</div>
    </div>`;
  },

  // ── Navegação ───────────────────────────────────────────

  _initNavigation() {
    this._$$('.bb-nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.bbSection;
        this._$$('.bb-nav-tab').forEach(t => t.classList.remove('active'));
        this._$$('.bb-section').forEach(s => { s.classList.remove('active'); s.classList.remove('bb-fade-in'); });
        tab.classList.add('active');
        const sec = this._$(`#${target}`);
        if (sec) { sec.classList.add('active'); sec.classList.add('bb-fade-in'); }
        switch(target) {
          case 'bb-dashboard': this._renderDashboard(); break;
          case 'bb-servicos': this._renderServicesTable(); break;
          case 'bb-diagnostico': this._renderDiagnosis(); break;
          case 'bb-plano14': this._populateServiceSelect(); break;
        }
      });
    });
  },

  // ── CRUD Serviços ───────────────────────────────────────

  _initServiceModal() {
    const btnAdd = this._$('#bb-btn-add-service');
    const form = this._$('#bb-service-form');
    const modal = this._$('#bb-service-modal');
    const btnClose = this._$('#bb-modal-close');
    const btnCancel = this._$('#bb-btn-cancel-modal');
    if (btnAdd) btnAdd.addEventListener('click', () => this._openModal());
    if (form) form.addEventListener('submit', (e) => this._handleFormSubmit(e));
    if (btnClose) btnClose.addEventListener('click', () => this._closeModal());
    if (btnCancel) btnCancel.addEventListener('click', () => this._closeModal());
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) this._closeModal(); });
  },

  _openModal(serviceId = null) {
    const modal = this._$('#bb-service-modal');
    const title = this._$('#bb-modal-title');
    const form = this._$('#bb-service-form');
    if (!modal || !form) return;
    form.reset();
    this._$('#bb-edit-id').value = '';
    if (serviceId) {
      const s = this.services.find(sv => sv.id === serviceId);
      if (!s) return;
      this.editingServiceId = serviceId;
      title.textContent = 'Editar Serviço';
      this._$('#bb-input-name').value = s.name;
      this._$('#bb-input-time').value = s.time;
      this._$('#bb-input-price').value = s.price;
      this._$('#bb-input-qty').value = s.qty;
      this._$('#bb-input-cost').value = s.cost;
      this._$('#bb-input-risk').value = s.risk;
      this._$('#bb-input-liquidity').value = s.liquidity;
      this._$('#bb-input-asset-type').value = s.assetType;
      this._$('#bb-edit-id').value = s.id;
    } else {
      this.editingServiceId = null;
      title.textContent = 'Novo Serviço';
    }
    modal.classList.add('active');
    setTimeout(() => modal.style.opacity = '1', 10);
  },

  _closeModal() {
    const modal = this._$('#bb-service-modal');
    if (!modal) return;
    modal.style.opacity = '0';
    setTimeout(() => { modal.classList.remove('active'); this.editingServiceId = null; }, 300);
  },

  _handleFormSubmit(e) {
    e.preventDefault();
    const data = {
      name: this._$('#bb-input-name').value.trim(),
      time: parseFloat(this._$('#bb-input-time').value) || 0,
      price: parseFloat(this._$('#bb-input-price').value) || 0,
      qty: parseInt(this._$('#bb-input-qty').value, 10) || 0,
      cost: parseFloat(this._$('#bb-input-cost').value) || 0,
      risk: parseInt(this._$('#bb-input-risk').value, 10) || 1,
      liquidity: parseInt(this._$('#bb-input-liquidity').value, 10) || 1,
      assetType: this._$('#bb-input-asset-type').value || 'Âncora'
    };
    if (!data.name) return;
    const editId = this._$('#bb-edit-id').value;
    if (editId) {
      const idx = this.services.findIndex(s => s.id === parseInt(editId, 10));
      if (idx !== -1) this.services[idx] = { ...this.services[idx], ...data };
    } else {
      data.id = Date.now();
      this.services.push(data);
    }
    this._saveFirestore();
    this._closeModal();
    this._renderServicesTable();
    this._renderDashboard();
    this._renderDiagnosis();
    this._populateServiceSelect();
  },

  _deleteService(id) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    this.services = this.services.filter(s => s.id !== id);
    this._saveFirestore();
    this._renderServicesTable();
    this._renderDashboard();
    this._renderDiagnosis();
    this._populateServiceSelect();
  },

  _renderServicesTable() {
    const tbody = this._$('#bb-services-tbody');
    const empty = this._$('#bb-empty-services');
    if (!tbody) return;
    if (this.services.length === 0) { tbody.innerHTML = ''; if (empty) empty.style.display = 'flex'; return; }
    if (empty) empty.style.display = 'none';
    const sorted = [...this.services].map(s => ({ ...s, ...this._calcFields(s) }));
    sorted.sort((a, b) => b.efficiency - a.efficiency);
    const mid = Math.floor(sorted.length / 2);
    const medianEff = sorted.length % 2 === 0 ? (sorted[mid-1].efficiency + sorted[mid].efficiency)/2 : sorted[mid].efficiency;
    let ceilingInserted = false, rows = '';
    sorted.forEach(s => {
      if (!ceilingInserted && s.efficiency < medianEff) {
        rows += `<tr class="bb-ceiling-line"><td colspan="10"><div class="bb-ceiling-label">⚡ Teto de Faturamento — Mediana: ${this._currency(medianEff)}/h</div></td></tr>`;
        ceilingInserted = true;
      }
      rows += `<tr class="bb-fade-in-row"><td><span class="bb-service-name">${s.name}</span></td><td><span class="bb-badge ${this._assetSlug(s.assetType)}">${s.assetType}</span></td><td>${this._fmtMinutes(s.time)}</td><td>${this._currency(s.price)}</td><td>${this._currency(s.cost)}</td><td>${this._currency(s.profit)}</td><td><span class="bb-efficiency-dot" style="background:${s.efficiencyColor}"></span>${this._currency(s.efficiency)}/h</td><td>${this._fmtMinutes(s.hora100===Infinity?0:s.hora100)}</td><td>${s.qty}x</td><td class="bb-actions-cell"><button class="bb-btn-icon" onclick="window.__BB.openModal(${s.id})" title="Editar">✏️</button><button class="bb-btn-icon" onclick="window.__BB.deleteService(${s.id})" title="Excluir">🗑️</button></td></tr>`;
    });
    if (!ceilingInserted && sorted.length > 0) {
      rows += `<tr class="bb-ceiling-line"><td colspan="10"><div class="bb-ceiling-label">⚡ Teto de Faturamento — Mediana: ${this._currency(medianEff)}/h</div></td></tr>`;
    }
    tbody.innerHTML = rows;
    setTimeout(() => { this._$$('.bb-fade-in-row').forEach((row, i) => { setTimeout(() => row.classList.add('visible'), i * 60); }); }, 50);
  },

  // ── Calculadora ─────────────────────────────────────────

  _initCalculator() {
    const btn = this._$('#bb-btn-calc');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const price = parseFloat(this._$('#bb-calc-price').value) || 0;
      const cost = parseFloat(this._$('#bb-calc-cost').value) || 0;
      const time = parseFloat(this._$('#bb-calc-time').value) || 1;
      const result = this._$('#bb-calc-result');
      if (!result) return;
      const profit = price - cost;
      const effPerHour = (profit / time) * 60;
      const hora100 = profit > 0 ? (100 / profit) * time : 0;
      let category, catColor;
      if (time <= 60) { category = 'Alta eficiência'; catColor = '#22c55e'; }
      else if (time <= 75) { category = 'Eficiência moderada'; catColor = '#eab308'; }
      else if (time <= 90) { category = 'Baixa eficiência'; catColor = '#f97316'; }
      else { category = 'Ineficiente'; catColor = '#ef4444'; }
      result.innerHTML = `<div class="bb-calc-result-grid"><div class="bb-calc-result-item"><span class="bb-calc-label">Lucro por atendimento</span><span class="bb-calc-value">${this._currency(profit)}</span></div><div class="bb-calc-result-item"><span class="bb-calc-label">Eficiência (R$/hora)</span><span class="bb-calc-value">${this._currency(effPerHour)}/h</span></div><div class="bb-calc-result-item"><span class="bb-calc-label">Hora R$100</span><span class="bb-calc-value">${profit > 0 ? this._fmtMinutes(hora100) : '∞'}</span></div><div class="bb-calc-result-item"><span class="bb-calc-label">Classificação</span><span class="bb-calc-value" style="color:${catColor}">${category}</span></div></div>`;
      result.classList.add('active');
    });
  },

  // ── Gráfico Pizza ───────────────────────────────────────

  _drawPieChart(canvasId, legendId, data) {
    const canvas = this._$(`#${canvasId}`);
    const legend = this._$(`#${legendId}`);
    if (!canvas || !legend) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(canvas.parentElement.offsetWidth, 300);
    canvas.width = size * dpr; canvas.height = size * dpr;
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, size, size);
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0 || data.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.arc(size/2, size/2, size/2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Sem dados', size/2, size/2);
      legend.innerHTML = '<p style="color:rgba(255,255,255,0.4)">Cadastre serviços para visualizar</p>'; return;
    }
    const cx=size/2, cy=size/2, radius=size/2.5; let startAngle=-Math.PI/2;
    data.forEach(item => {
      const sliceAngle = (item.value/total)*Math.PI*2, endAngle = startAngle + sliceAngle;
      ctx.save(); ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=12; ctx.shadowOffsetX=2; ctx.shadowOffsetY=2;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,radius,startAngle,endAngle); ctx.closePath(); ctx.fillStyle=item.color; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,radius,startAngle,endAngle); ctx.closePath(); ctx.strokeStyle='rgba(13,13,26,0.6)'; ctx.lineWidth=2; ctx.stroke();
      const pct=((item.value/total)*100).toFixed(0);
      if(pct>=5){const midAngle=startAngle+sliceAngle/2,labelR=radius*0.65,lx=cx+Math.cos(midAngle)*labelR,ly=cy+Math.sin(midAngle)*labelR;ctx.fillStyle='#fff';ctx.font='bold 12px Inter, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.save();ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=4;ctx.fillText(`${pct}%`,lx,ly);ctx.restore();}
      startAngle = endAngle;
    });
    ctx.beginPath(); ctx.arc(cx,cy,radius*0.35,0,Math.PI*2); ctx.fillStyle='#0d0d1a'; ctx.fill();
    legend.innerHTML = data.map(item => { const pct=((item.value/total)*100).toFixed(1); return `<div class="bb-legend-item"><span class="bb-legend-dot" style="background:${item.color}"></span><span class="bb-legend-label">${item.label}</span><span class="bb-legend-value">${pct}%</span></div>`; }).join('');
  },

  // ── Diagnóstico ─────────────────────────────────────────

  _buildDiagnosisData() {
    if (this.services.length === 0) return [];
    const totalQty = this.services.reduce((s, sv) => s + (sv.qty||0), 0);
    const totalRevenue = this.services.reduce((s, sv) => s + (sv.price||0)*(sv.qty||0), 0);
    return Object.keys(this.IDEAL_RANGES).map(type => {
      const grouped = this.services.filter(s => s.assetType === type);
      const count = grouped.length, qty = grouped.reduce((s,sv)=>s+(sv.qty||0),0), revenue = grouped.reduce((s,sv)=>s+(sv.price||0)*(sv.qty||0),0);
      const percentReal = totalQty > 0 ? (qty/totalQty)*100 : 0;
      const idealMin = this.IDEAL_RANGES[type].min, idealMax = this.IDEAL_RANGES[type].max, idealMid = (idealMin+idealMax)/2;
      const idealRevenue = (idealMid/100)*totalRevenue;
      const hora100s = grouped.map(s=>{const c=this._calcFields(s);return c.hora100===Infinity?999:c.hora100;});
      const avgHora100 = hora100s.length>0?hora100s.reduce((a,b)=>a+b,0)/hora100s.length:0;
      let status;
      if(percentReal>=idealMin&&percentReal<=idealMax){status='ok';}else{const distMin=percentReal<idealMin?idealMin-percentReal:0;const distMax=percentReal>idealMax?percentReal-idealMax:0;status=Math.max(distMin,distMax)>=5?'critical':'warning';}
      return {type,count,qty,revenue,percentReal,idealMin,idealMax,idealMid,idealRevenue,avgHora100,status,color:this.IDEAL_RANGES[type].color};
    });
  },

  _renderDiagnosis() {
    const diagData = this._buildDiagnosisData();
    const compTbody = this._$('#bb-comparison-tbody');
    if (compTbody) {
      if (diagData.length === 0) { compTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:rgba(255,255,255,0.4);padding:2rem;">Cadastre serviços para ver o diagnóstico</td></tr>'; }
      else { compTbody.innerHTML = diagData.map(d => { const sb=d.status==='ok'?'<span class="bb-status-badge ok">✅ OK</span>':d.status==='warning'?'<span class="bb-status-badge warning">⚠️ Atenção</span>':'<span class="bb-status-badge critical">🔴 Crítico</span>'; return `<tr><td><span class="bb-badge ${this._assetSlug(d.type)}">${d.type}</span></td><td>${d.percentReal.toFixed(1)}%</td><td>${d.idealMin}%–${d.idealMax}%</td><td>${this._currency(d.revenue)}</td><td>${this._currency(d.idealRevenue)}</td><td>${sb}</td></tr>`; }).join(''); }
    }
    if(diagData.length>0){const pd=diagData.filter(d=>d.percentReal>0).map(d=>({label:d.type,value:d.percentReal,color:d.color}));this._drawPieChart('bb-diagnosis-pie','bb-diagnosis-legend',pd);}else{this._drawPieChart('bb-diagnosis-pie','bb-diagnosis-legend',[]);}
    const alertsList = this._$('#bb-alerts-list');
    if (alertsList) {
      const alerts = diagData.filter(d => d.status !== 'ok');
      if(alerts.length===0){alertsList.innerHTML='<div class="bb-alert-card ok"><span class="bb-alert-icon">✅</span><div class="bb-alert-text"><strong>Carteira equilibrada!</strong><p>Todos os tipos de ativo estão dentro das faixas ideais.</p></div></div>';}
      else{alertsList.innerHTML=alerts.map(d=>{const icon=d.status==='critical'?'🔴':'⚠️';const diff=d.percentReal<d.idealMin?(d.idealMin-d.percentReal).toFixed(1):(d.percentReal-d.idealMax).toFixed(1);const dir=d.percentReal<d.idealMin?'abaixo':'acima';return`<div class="bb-alert-card ${d.status}"><span class="bb-alert-icon">${icon}</span><div class="bb-alert-text"><strong>${d.type} está em ${d.percentReal.toFixed(1)}%</strong><p>Ideal: ${d.idealMin}%–${d.idealMax}%. Desvio de ${diff} pontos ${dir} do range.</p></div></div>`;}).join('');}
    }
    this._renderStrategies(diagData);
  },

  _renderStrategies(diagData) {
    const grid = this._$('#bb-strategies-grid');
    if (!grid) return;
    grid.innerHTML = this.STRATEGIES.map(st => {
      const isRec = diagData.length > 0 && st.trigger(diagData);
      return `<div class="bb-strategy-card ${isRec?'recommended':''}"><div class="bb-strategy-header"><span class="bb-strategy-id">${st.id}</span>${isRec?'<span class="bb-strategy-badge">Recomendada</span>':''}</div><h4 class="bb-strategy-title">${st.title}</h4><p class="bb-strategy-desc">${st.description}</p></div>`;
    }).join('');
  },

  // ── Plano 14 Dias ───────────────────────────────────────

  _populateServiceSelect() {
    const select = this._$('#bb-plan-service-select');
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="">— Selecione um serviço —</option>';
    this.services.forEach(s => { const opt = document.createElement('option'); opt.value = s.id; opt.textContent = s.name; select.appendChild(opt); });
    if (currentVal && this.services.find(s => s.id === parseInt(currentVal, 10))) select.value = currentVal;
    if (!select._bbListenerAttached) {
      select.addEventListener('change', () => { const id = parseInt(select.value, 10); if (id) this._renderPlan14(id); else this._clearPlan(); });
      select._bbListenerAttached = true;
    }
    if (select.value) this._renderPlan14(parseInt(select.value, 10));
  },

  _clearPlan() {
    const summary = this._$('#bb-plan-summary');
    const w1 = this._$('#bb-week1-grid'); const w2 = this._$('#bb-week2-grid');
    const sc = this._$('#bb-scripts-container');
    if(summary)summary.classList.add('bb-hidden');if(w1)w1.innerHTML='';if(w2)w2.innerHTML='';if(sc)sc.classList.add('bb-hidden');
    this.selectedDayIndex = null;
  },

  _renderPlan14(serviceId) {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) return;
    const c = this._calcFields(service);
    const summary = this._$('#bb-plan-summary');
    if (summary) {
      summary.classList.remove('bb-hidden');
      summary.innerHTML = `<div class="bb-summary-item"><span class="bb-summary-label">Serviço</span><span class="bb-summary-value">${service.name}</span></div><div class="bb-summary-item"><span class="bb-summary-label">Tipo</span><span class="bb-summary-value"><span class="bb-badge ${this._assetSlug(service.assetType)}">${service.assetType}</span></span></div><div class="bb-summary-item"><span class="bb-summary-label">Eficiência</span><span class="bb-summary-value">${this._currency(c.efficiency)}/h</span></div><div class="bb-summary-item"><span class="bb-summary-label">Hora R$100</span><span class="bb-summary-value">${c.hora100===Infinity?'∞':this._fmtMinutes(c.hora100)}</span></div>`;
    }
    const renderDayCards = (days, container) => {
      if (!container) return;
      container.innerHTML = days.map(d => `<div class="bb-day-card ${this.selectedDayIndex===d.day-1?'active':''}" onclick="window.__BB.selectDay(${d.day-1},${serviceId})"><div class="bb-day-number">Dia ${d.day}</div><div class="bb-day-title">${d.title}</div></div>`).join('');
    };
    renderDayCards(this.PLAN_14_DAYS.filter(d=>d.week===1), this._$('#bb-week1-grid'));
    renderDayCards(this.PLAN_14_DAYS.filter(d=>d.week===2), this._$('#bb-week2-grid'));
    if (this.selectedDayIndex !== null) this._showScripts(this.selectedDayIndex, service.name);
  },

  _selectDay(dayIndex, serviceId) {
    this.selectedDayIndex = dayIndex;
    const service = this.services.find(s => s.id === serviceId);
    if (!service) return;
    const allCards = [...this._$$('.bb-day-card')];
    allCards.forEach(card => card.classList.remove('active'));
    if (allCards[dayIndex]) allCards[dayIndex].classList.add('active');
    this._showScripts(dayIndex, service.name);
  },

  _showScripts(dayIndex, serviceName) {
    const container = this._$('#bb-scripts-container');
    const dayTitle = this._$('#bb-scripts-day-title');
    const list = this._$('#bb-scripts-list');
    if (!container || !list) return;
    const dayData = this.PLAN_14_DAYS[dayIndex];
    if (!dayData) return;
    container.classList.remove('bb-hidden');
    if (dayTitle) dayTitle.textContent = `Dia ${dayData.day} — ${dayData.title}`;
    const channelLabels = { instagram_stories:'📱 Instagram Stories', instagram_feed:'📸 Instagram Feed', whatsapp:'💬 WhatsApp' };
    const channelIcons = { instagram_stories:'stories', instagram_feed:'feed', whatsapp:'whatsapp' };
    list.innerHTML = Object.entries(dayData.scripts).map(([channel, script]) => {
      const finalScript = script.replace(/\{SERVICO\}/g, serviceName);
      return `<div class="bb-script-card ${channelIcons[channel]}"><div class="bb-script-header"><span class="bb-script-channel">${channelLabels[channel]}</span><button class="bb-btn-copy" data-bb-script="${finalScript.replace(/"/g,'&quot;')}">📋 Copiar</button></div><p class="bb-script-text">${finalScript}</p></div>`;
    }).join('');
    list.querySelectorAll('.bb-btn-copy').forEach(btn => {
      btn.addEventListener('click', () => { this._copyScript(btn.dataset.bbScript); });
    });
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  async _copyScript(text) {
    try { await navigator.clipboard.writeText(text); } catch(e) {
      const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    }
    const toast = this._$('#bb-copy-toast');
    if (toast) { toast.classList.add('active'); setTimeout(() => toast.classList.remove('active'), 2000); }
  },

  // ── Dashboard ───────────────────────────────────────────

  _renderDashboard() {
    const setVal = (id, val) => { const el = this._$(id); if (el) { const v = el.querySelector('.bb-stat-value'); if (v) v.textContent = val; } };
    setVal('#bb-stat-total', this.services.length);
    const totalFat = this.services.reduce((s, sv) => s + (sv.price||0)*(sv.qty||0), 0);
    setVal('#bb-stat-fat', this._currency(totalFat));
    if (this.services.length === 0) { setVal('#bb-stat-melhor', '—'); } else {
      const best = this.services.reduce((top, sv) => { const eff=this._calcFields(sv).efficiency; return eff>(top?this._calcFields(top).efficiency:-1)?sv:top; }, null);
      setVal('#bb-stat-melhor', best ? best.name : '—');
    }
    const diag = this._buildDiagnosisData();
    setVal('#bb-stat-alertas', diag.filter(d => d.status === 'critical').length);
    if (this.services.length > 0) {
      const typeGroups = {}; this.services.forEach(s => { if(!typeGroups[s.assetType]) typeGroups[s.assetType]=0; typeGroups[s.assetType]+= s.qty||0; });
      const pieData = Object.entries(typeGroups).filter(([,v])=>v>0).map(([type,qty])=>({label:type,value:qty,color:this.IDEAL_RANGES[type]?.color||'#6b7280'}));
      this._drawPieChart('bb-dashboard-pie','bb-dashboard-legend',pieData);
    } else { this._drawPieChart('bb-dashboard-pie','bb-dashboard-legend',[]); }
    const topList = this._$('#bb-top-list');
    if (topList) {
      if(this.services.length===0){topList.innerHTML='<p style="color:rgba(255,255,255,0.4);text-align:center;">Nenhum serviço cadastrado</p>';}
      else{const sorted=[...this.services].map(s=>({...s,...this._calcFields(s)})).sort((a,b)=>b.efficiency-a.efficiency).slice(0,3);
        const medals=['🥇','🥈','🥉'];
        topList.innerHTML=sorted.map((s,i)=>`<div class="bb-top-service-item"><span class="bb-top-medal">${medals[i]}</span><div class="bb-top-info"><span class="bb-top-name">${s.name}</span><span class="bb-top-detail">${this._currency(s.efficiency)}/h · Hora R$100: ${s.hora100===Infinity?'∞':this._fmtMinutes(s.hora100)}</span></div><span class="bb-badge ${this._assetSlug(s.assetType)}">${s.assetType}</span></div>`).join('');
      }
    }
  },

  // ── Persistência Firestore ──────────────────────────────

  async _loadFirestore() {
    try {
      const uid = firebase.auth().currentUser?.uid;
      if (!uid) { this.services = JSON.parse(localStorage.getItem('bolsa_services') || '[]'); return; }
      const snap = await firebase.firestore().collection('studios').doc(uid).collection('bolsa_beleza').doc('dados').get();
      if (snap.exists) {
        const d = snap.data();
        if (d.services) this.services = d.services;
      }
    } catch(e) {
      console.warn('BolsaBeleza: Firestore load fallback to localStorage', e);
      this.services = JSON.parse(localStorage.getItem('bolsa_services') || '[]');
    }
  },

  _saveFirestore() {
    clearTimeout(this._saveTimeout);
    this._saveTimeout = setTimeout(async () => {
      try {
        const uid = firebase.auth().currentUser?.uid;
        if (!uid) { localStorage.setItem('bolsa_services', JSON.stringify(this.services)); return; }
        await firebase.firestore().collection('studios').doc(uid).collection('bolsa_beleza').doc('dados').set({ services: this.services }, { merge: true });
      } catch(e) {
        console.warn('BolsaBeleza: Firestore save fallback', e);
        localStorage.setItem('bolsa_services', JSON.stringify(this.services));
      }
    }, 1000);
  }
};
