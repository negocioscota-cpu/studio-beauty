// === TUTORIAL — Guia de Uso LashBrow ===
const Tutorial = {

    _sections: [
        {
            id: 'inicio', icon: '🚀', title: 'Primeiros Passos',
            color: '#c4756a',
            steps: [
                { title: 'Acesse o sistema', text: 'Entre em <b>lashbrow.clientehub.app.br</b> com seu e-mail e senha. O sistema funciona no celular e no computador.' },
                { title: 'Complete seu perfil', text: 'Vá em <b>🏪 Perfil do Studio</b> e preencha: nome do studio, telefone, endereço e foto de capa. Esses dados aparecem na sua Agenda Online.' },
                { title: 'Cadastre seus serviços', text: 'Em <b>📱 Catálogo de Serviços</b>, adicione cada serviço com nome, descrição, preço e duração. Ex: "Extensão Fio a Fio – R$180 – 2h30min".' },
                { title: 'Cadastre suas clientes', text: 'Em <b>Cadastro</b>, crie a ficha de cada cliente: nome, telefone, data de nascimento e observações. Clientes cadastradas são sugeridas em toda a plataforma.' },
            ]
        },
        {
            id: 'agenda', icon: '📅', title: 'Agenda',
            color: '#7B61FF',
            steps: [
                { title: 'Criar agendamento', text: 'Clique em <b>+ Novo</b> na Agenda. Selecione a cliente, serviço, data e horário. O sistema bloqueia horários em conflito automaticamente.' },
                { title: 'Visualizar a semana', text: 'A agenda exibe a visão semanal. Clique em qualquer horário vazio para criar um novo agendamento rapidamente.' },
                { title: 'Confirmar e concluir', text: 'Mude o status do agendamento para <b>Confirmado</b> após a cliente confirmar, e <b>Concluído</b> após o atendimento. Isso alimenta os relatórios automaticamente.' },
                { title: 'Agenda Online', text: 'Em <b>📅 Agenda Online</b>, ative o link de agendamento público para que clientes marquem sozinhas. Compartilhe o link no Instagram e WhatsApp.' },
            ]
        },
        {
            id: 'ficha', icon: '✨', title: 'Ficha Técnica',
            color: '#e91e8c',
            steps: [
                { title: 'O que é a Ficha Técnica?', text: 'Registro completo do procedimento realizado: tipo de extensão, curvatura, espessura dos fios, mix de tamanhos, tempo de aplicação e observações.' },
                { title: 'Criar nova ficha', text: 'Clique em <b>+ Nova Ficha</b>. Vincule à cliente, preencha os detalhes técnicos. Na próxima vez, você terá tudo registrado para repetir o trabalho com perfeição.' },
                { title: 'Histórico por cliente', text: 'Cada cliente tem um histórico de fichas, ordenado da mais recente. Ideal para acompanhar a evolução e planejar manutenções.' },
                { title: 'Alerta de retoque', text: 'Informe a data prevista do retoque. O sistema exibe lembretes automáticos para você entrar em contato com a cliente no momento certo.' },
            ]
        },
        {
            id: 'clientes', icon: '👤', title: 'Gestão de Clientes',
            color: '#00BCAF',
            steps: [
                { title: 'Cadastro completo', text: 'Em <b>Cadastro</b>, registre nome, telefone, e-mail, data de nascimento, endereço e observações (ex: alergias, preferências). Todas as informações em um só lugar.' },
                { title: 'Histórico de atendimentos', text: 'Em <b>Histórico</b>, visualize todos os serviços realizados por cada cliente: data, serviço, valor pago e profissional responsável.' },
                { title: 'Termo de consentimento', text: 'Em <b>📋 Termo de Consentimento</b>, gere e registre o aceite digital da cliente antes de procedimentos. Protege você juridicamente.' },
                { title: 'Aniversariantes', text: 'Em <b>🎂 Aniversariantes</b>, veja quem faz aniversário no mês. Envie um WhatsApp de parabéns com um toque de desconto — fideliza muito!' },
            ]
        },
        {
            id: 'financeiro', icon: '💰', title: 'Central Financeira',
            color: '#4CAF50',
            steps: [
                { title: 'Contas a Receber', text: 'Acesse <b>Financeiro → Contas a Receber</b>. Clique em <b>Nova Venda</b> e preencha: categoria (Ex: Extensão), descrição (Ex: Volume Russo), cliente, valor e forma de recebimento.' },
                { title: 'Tipos de lançamento', text: 'Escolha o tipo: <b>Única</b> (pagamento avulso), <b>Parcelada</b> (informe o nº de parcelas) ou <b>Recorrente</b> (pacotes mensais com dia fixo de cobrança).' },
                { title: 'Contas a Pagar', text: 'Na aba <b>Contas a Pagar</b>, clique em <b>Nova Despesa</b>. Informe: categoria (Ex: Descartáveis), descrição, valor, vencimento e forma de pagamento.' },
                { title: 'Filtros e período', text: 'Use os filtros de data e status para ver apenas o mês atual, despesas vencidas ou pagamentos pendentes. Os KPIs do topo se atualizam automaticamente.' },
                { title: 'Histórico da cliente', text: 'No campo "Cliente" de uma nova venda, clique no ícone 🕐 para ver todo o histórico de atendimentos e gastos daquela cliente antes de registrar.' },
            ]
        },
        {
            id: 'estoque', icon: '📦', title: 'Gestão de Estoque',
            color: '#FF9800',
            steps: [
                { title: 'Cadastrar produto', text: 'Em <b>Estoque</b>, clique em <b>+ Novo Produto</b>. Informe: nome (Ex: Microbrush), quantidade atual, quantidade mínima e unidade (unid, ml, g...).' },
                { title: 'Quantidade mínima', text: 'A <b>Quantidade Mínima</b> define o alerta de estoque crítico. Ex: se você cadastrar mínimo = 10 e tiver 8 unidades, o item aparecerá em vermelho como "⚠️ Baixo".' },
                { title: 'Alertas automáticos', text: 'O painel de Estoque mostra automaticamente produtos em nível crítico. Clique em <b>+ Comprar</b> ao lado de qualquer item para adicioná-lo à Lista de Compras.' },
                { title: 'Lista de Compras', text: 'A Lista de Compras agrupa tudo que precisa ser reposto. Marque itens como ✅ comprado após ir ao fornecedor. Acesse pelo botão com badge de contador no painel de Estoque.' },
                { title: 'Ajustar quantidade', text: 'Após uma compra, clique no ícone de edição (✏️) ao lado do produto e atualize a quantidade. O sistema recalcula os alertas instantaneamente.' },
            ]
        },
        {
            id: 'relatorios', icon: '📊', title: 'Relatórios',
            color: '#5B8DEF',
            steps: [
                { title: 'Visão geral', text: 'Em <b>📊 Relatórios</b>, veja o faturamento do mês, número de atendimentos e ticket médio. Dados consolidados de toda a operação.' },
                { title: 'Bolsa da Beleza', text: 'A <b>💰 Bolsa da Beleza</b> é sua calculadora de metas financeiras: informe suas despesas fixas e o sistema calcula quantos atendimentos você precisa fazer para atingir sua meta de lucro.' },
                { title: 'Dashboard', text: 'O <b>Dashboard</b> exibe um resumo executivo: próximos agendamentos, receitas do mês, clientes novas e alertas de estoque — tudo em uma única tela.' },
            ]
        },
        {
            id: 'marketing', icon: '📣', title: 'Marketing & Fidelização',
            color: '#9C27B0',
            steps: [
                { title: 'Portfólio', text: 'Em <b>📸 Portfólio</b>, salve fotos dos seus trabalhos vinculadas a cada cliente. Use a galeria como cartão de visitas digital para novas clientes.' },
                { title: 'Programa de Fidelidade', text: 'Em <b>💎 Fidelidade</b>, configure pontos por atendimento ou valor gasto. Clientes que acumulam pontos ganham benefícios — isso aumenta a retenção.' },
                { title: 'Indique e Ganhe', text: 'Em <b>🎁 Indique e Ganhe</b>, configure comissões para quem indicar novas clientes. Cada indicação bem-sucedida gera um crédito automático.' },
                { title: 'Link da Bio', text: 'Em <b>🔗 Link da Bio</b>, gere um micro-site com sua foto, serviços, portfólio e link de agendamento. Coloque no Instagram e WhatsApp.' },
                { title: 'Avaliações NPS', text: 'Em <b>⭐ Avaliações NPS</b>, envie o link de avaliação após cada atendimento. As respostas ficam salvas para você monitorar a satisfação das clientes.' },
            ]
        },
        {
            id: 'equipe', icon: '👥', title: 'Equipe',
            color: '#795548',
            steps: [
                { title: 'Convidar profissional', text: 'Em <b>👥 Equipe</b>, clique em <b>Convidar Profissional</b> e informe o e-mail dela. Ela receberá um convite e terá acesso ao sistema com permissões limitadas.' },
                { title: 'Permissões', text: 'Profissionais veem Agenda, Clientes, Ficha Técnica e Portfólio. Dados financeiros (Financeiro, Relatórios, Estoque) são exclusivos da proprietária.' },
                { title: 'Comissões', text: 'Configure o percentual de comissão de cada profissional. O sistema calcula automaticamente com base nos atendimentos registrados.' },
            ]
        },
        {
            id: 'dicas', icon: '💡', title: 'Dicas de Uso Diário',
            color: '#607D8B',
            steps: [
                { title: '☀️ Manhã — Verifique a agenda', text: 'Abra o <b>Dashboard</b> para ver os agendamentos do dia e quaisquer alertas de estoque antes de começar os atendimentos.' },
                { title: '🌙 Noite — Lance os recebimentos', text: 'Ao final do dia, registre em <b>Financeiro → Contas a Receber</b> todos os serviços realizados. 5 minutos por dia = controle total no mês.' },
                { title: '📦 Semanal — Confira o estoque', text: 'Uma vez por semana, revise as quantidades em <b>Estoque</b>. Itens em vermelho = compra urgente. Itens em amarelo = planejamento.' },
                { title: '📲 Instale no celular', text: 'Ao acessar o sistema pelo Chrome no celular, clique em <b>"Adicionar à tela inicial"</b>. O LashBrow funciona como um app — rápido e offline!' },
            ]
        },
    ],

    _activeSection: null,

    render(container) {
        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:24px;max-width:900px;margin:0 auto">

          <!-- Hero -->
          <div style="background:linear-gradient(135deg,#c4756a,#a0506a);border-radius:16px;padding:28px 32px;color:#fff;position:relative;overflow:hidden">
            <div style="position:absolute;right:-20px;top:-20px;font-size:100px;opacity:0.1">📖</div>
            <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 6px">Guia de Uso — LashBrow</h1>
            <p style="opacity:0.9;font-size:0.92rem;margin:0">Aprenda a usar cada funcionalidade do sistema para organizar seu studio e aumentar seus resultados.</p>
            <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
              <span style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:0.8rem">✅ ${Tutorial._sections.reduce((a,s)=>a+s.steps.length,0)} passos</span>
              <span style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:0.8rem">📱 Funciona no celular</span>
              <span style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:0.8rem">🔄 Sempre atualizado</span>
            </div>
          </div>

          <!-- Índice rápido -->
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${Tutorial._sections.map(s=>`
              <button onclick="Tutorial.scrollTo('${s.id}')"
                style="display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:20px;border:1.5px solid ${s.color}30;background:${s.color}10;color:${s.color};font-size:0.82rem;font-weight:600;cursor:pointer;transition:all .2s"
                onmouseover="this.style.background='${s.color}22'" onmouseout="this.style.background='${s.color}10'">
                ${s.icon} ${s.title}
              </button>`).join('')}
          </div>

          <!-- Seções -->
          ${Tutorial._sections.map(s=>`
          <div id="tutorial-sec-${s.id}" class="card" style="border-top:4px solid ${s.color};padding:0;overflow:hidden">
            <div style="padding:20px 24px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;user-select:none"
                 onclick="Tutorial.toggle('${s.id}')">
              <div style="width:44px;height:44px;border-radius:12px;background:${s.color}15;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">${s.icon}</div>
              <div style="flex:1">
                <div style="font-size:1.05rem;font-weight:700;color:var(--text-primary)">${s.title}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px">${s.steps.length} tópico${s.steps.length>1?'s':''}</div>
              </div>
              <span class="material-symbols-outlined" id="arrow-${s.id}" style="color:var(--text-muted);transition:transform .3s">expand_more</span>
            </div>
            <div id="body-${s.id}" style="display:none;border-top:1px solid var(--border);padding:20px 24px;display:flex;flex-direction:column;gap:12px">
              ${s.steps.map((step,i)=>`
              <div style="display:flex;gap:14px;padding:14px;background:var(--surface);border-radius:10px;border-left:3px solid ${s.color}">
                <div style="width:28px;height:28px;border-radius:50%;background:${s.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:700;flex-shrink:0;margin-top:2px">${i+1}</div>
                <div>
                  <div style="font-weight:700;font-size:0.92rem;color:var(--text-primary);margin-bottom:4px">${step.title}</div>
                  <div style="font-size:0.86rem;color:var(--text-secondary);line-height:1.55">${step.text}</div>
                </div>
              </div>`).join('')}
            </div>
          </div>`).join('')}

          <!-- Suporte -->
          <div style="background:var(--surface);border-radius:16px;padding:24px;text-align:center;border:1px solid var(--border)">
            <div style="font-size:2rem">💬</div>
            <div style="font-weight:700;font-size:1rem;margin:8px 0 4px;color:var(--text-primary)">Ainda tem dúvidas?</div>
            <p style="font-size:0.86rem;color:var(--text-secondary);margin:0 0 16px">Nossa equipe está pronta para te ajudar pelo WhatsApp.</p>
            <a href="https://wa.me/5537991208394?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20o%20LashBrow." target="_blank"
               style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:#25D366;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.92rem">
              <span class="material-symbols-outlined">chat</span> Falar com o Suporte
            </a>
          </div>

        </div>`;

        // Abrir primeira seção por padrão
        Tutorial._open('inicio');
    },

    _open(id) {
        const body = document.getElementById('body-'+id);
        const arrow = document.getElementById('arrow-'+id);
        if (body) { body.style.display='flex'; }
        if (arrow) { arrow.style.transform='rotate(180deg)'; }
        Tutorial._activeSection = id;
    },

    toggle(id) {
        const body = document.getElementById('body-'+id);
        const arrow = document.getElementById('arrow-'+id);
        if (!body) return;
        const isOpen = body.style.display !== 'none' && body.style.display !== '';
        body.style.display = isOpen ? 'none' : 'flex';
        if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
    },

    scrollTo(id) {
        const el = document.getElementById('tutorial-sec-'+id);
        if (!el) return;
        el.scrollIntoView({ behavior:'smooth', block:'start' });
        // Garante que a seção está aberta
        const body = document.getElementById('body-'+id);
        if (body && (body.style.display === 'none' || body.style.display === '')) {
            Tutorial._open(id);
        }
    }
};
