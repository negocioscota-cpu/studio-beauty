// === PAGE HELP — Ajuda Contextual por Página ===
const PageHelp = {

    DATA: {
        dashboard: {
            icon: '📊', color: '#c4756a', title: 'Dashboard',
            tips: [
                { title: 'KPIs do mês', text: 'Os cards no topo mostram agendamentos, receita e ticket médio do mês atual — atualizados em tempo real.' },
                { title: 'Próximos agendamentos', text: 'Lista os atendimentos dos próximos dias. Verifique sempre antes de começar o dia.' },
                { title: 'Alertas de estoque', text: 'Produtos em vermelho precisam de reposição urgente. Clique para ir ao Estoque.' },
            ]
        },
        schedule: {
            icon: '📅', color: '#7B61FF', title: 'Agenda',
            tips: [
                { title: 'Criar agendamento', text: 'Clique em <b>+ Novo</b> ou em qualquer horário vazio na grade para criar rapidamente.' },
                { title: 'Confirmar atendimento', text: 'Mude o status para <b>Confirmado</b> após a cliente confirmar. Use <b>Concluído</b> após o serviço — isso alimenta os relatórios.' },
                { title: 'Visão semanal e diária', text: 'Alterne entre semana e dia no topo da agenda. No celular, a visão diária é mais prática.' },
                { title: 'Agenda Online', text: 'Ative o link de agendamento público em <b>📅 Agenda Online</b> para que clientes marquem sozinhas.' },
                { title: 'Arrastar para reagendar', text: 'Na visão semanal, arraste um agendamento para outro dia. O horário original é preservado automaticamente.' },
                { title: 'Cuidados pós-procedimento', text: 'Ao marcar <b>Concluído</b>, o sistema oferece envio de cuidados via WhatsApp. Templates personalizáveis em <b>Configurações</b>.' },
                { title: 'Exportar Excel', text: 'Clique em <b>Exportar</b> para baixar a agenda da semana/mês em formato Excel.' },
            ]
        },
        clients: {
            icon: '👤', color: '#00BCAF', title: 'Cadastro de Clientes',
            tips: [
                { title: 'Cadastrar cliente', text: 'Clique em <b>+ Nova Cliente</b>. Preencha nome e telefone — os demais campos enriquecem o relacionamento.' },
                { title: 'Buscar cliente', text: 'Use a barra de busca para encontrar pelo nome ou telefone. Funciona mesmo com nome parcial.' },
                { title: 'Data de nascimento', text: 'Cadastre a data de nascimento para que a cliente apareça em <b>🎂 Aniversariantes</b>.' },
                { title: 'Observações importantes', text: 'Use o campo de observações para registrar alergias, preferências e particularidades. Aparece na Ficha Técnica.' },
                { title: 'Aba Retenção', text: 'Clique em <b>📈 Retenção</b> para ver taxa de retorno, clientes inativos, churn e Top 10 fiéis. Use <b>📲 Reconquistar</b> para enviar mensagem de retorno.' },
                { title: 'Paginação', text: 'O sistema carrega 50 clientes por vez. Clique em <b>Carregar mais</b> para ver os próximos. A busca funciona em toda a base.' },
                { title: 'Máscara de telefone', text: 'O campo de telefone formata automaticamente para <b>(00) 00000-0000</b>. Basta digitar os números.' },
            ]
        },
        ficha: {
            icon: '✨', color: '#e91e8c', title: 'Ficha Técnica',
            tips: [
                { title: 'Nova ficha', text: 'Clique em <b>+ Nova Ficha</b>. Vincule à cliente e preencha: tipo de extensão, curvatura, espessura e mix de tamanhos.' },
                { title: 'Avaliação dos cílios', text: 'Registre o estado natural dos cílios — descrição, tamanho e fotos. Essa referência é essencial para manutenções futuras.' },
                { title: 'Histórico completo', text: 'Cada ficha fica salva no perfil da cliente, ordenada da mais recente. Ideal para repetir o trabalho com perfeição.' },
                { title: 'Alerta de retoque', text: 'Informe a data prevista do retoque — o sistema gera lembretes automáticos para você entrar em contato no momento certo.' },
            ]
        },
        catalog: {
            icon: '📱', color: '#c4756a', title: 'Catálogo de Serviços',
            tips: [
                { title: 'Adicionar serviço', text: 'Clique em <b>+ Novo Serviço</b>. Informe nome, descrição, preço e duração estimada.' },
                { title: 'Duração importa', text: 'A duração é usada para bloquear os horários corretos na <b>Agenda Online</b>. Seja precisa.' },
                { title: 'Organizar por categoria', text: 'Agrupe por tipo (Cílios, Sobrancelha, Tratamento) para facilitar a busca da cliente no agendamento online.' },
            ]
        },
        'studio-profile': {
            icon: '🏪', color: '#c4756a', title: 'Perfil do Studio',
            tips: [
                { title: 'Foto de capa', text: 'Adicione uma foto profissional — ela aparece na Agenda Online e no Link da Bio.' },
                { title: 'Dados completos', text: 'Preencha endereço e telefone. Esses dados aparecem publicamente para as clientes que agendam online.' },
                { title: 'Redes sociais', text: 'Adicione Instagram e WhatsApp para que as clientes possam te encontrar pelo Link da Bio.' },
            ]
        },
        portfolio: {
            icon: '📸', color: '#9C27B0', title: 'Portfólio',
            tips: [
                { title: 'Adicionar foto', text: 'Clique em <b>+ Nova Foto</b>, selecione da galeria e vincule a uma cliente com descrição do serviço.' },
                { title: 'Cartão de visitas digital', text: 'O portfólio fica disponível no seu Link da Bio — novas clientes verão seus trabalhos antes de agendar.' },
                { title: 'Dica de impacto', text: 'Fotos com legenda "Antes e Depois" geram muito mais engajamento e confiança.' },
            ]
        },
        reminders: {
            icon: '🔔', color: '#c4756a', title: 'Lembretes',
            tips: [
                { title: 'Criar lembrete', text: 'Clique em <b>+ Novo Lembrete</b>. Escolha a data, horário e para qual cliente o lembrete se refere.' },
                { title: 'Lembretes de retoque', text: 'Informe a data de retoque na Ficha Técnica — o sistema gera o lembrete automaticamente para você.' },
                { title: 'Envio via WhatsApp', text: 'Use o botão de WhatsApp ao lado da cliente para enviar a mensagem de lembrete com um único clique.' },
            ]
        },
        reports: {
            icon: '📊', color: '#5B8DEF', title: 'Relatórios',
            tips: [
                { title: 'Filtrar período', text: 'Use o seletor de mês/ano para analisar períodos anteriores e comparar a evolução.' },
                { title: 'Serviços mais vendidos', text: 'O gráfico mostra quais serviços geram mais receita. Foque no que já funciona.' },
                { title: 'Clientes mais frequentes', text: 'Identifique suas melhores clientes para criar ações de fidelização direcionadas.' },
            ]
        },
        consent: {
            icon: '📋', color: '#607D8B', title: 'Termo de Consentimento',
            tips: [
                { title: 'Gerar termo', text: 'Selecione a cliente e clique em <b>Gerar Termo</b>. O documento é preenchido automaticamente com os dados dela.' },
                { title: 'Assinatura digital', text: 'A cliente assina diretamente no celular. O termo fica salvo no perfil dela para consulta futura.' },
                { title: 'Por que usar?', text: 'O termo protege você juridicamente em caso de alergias ou reações. Sempre colete <b>antes</b> do procedimento.' },
            ]
        },
        birthday: {
            icon: '🎂', color: '#FF9800', title: 'Aniversariantes',
            tips: [
                { title: 'Ver aniversariantes', text: 'O sistema filtra automaticamente as clientes que fazem aniversário no mês atual.' },
                { title: 'Enviar parabéns', text: 'Clique no ícone do WhatsApp ao lado da cliente para enviar uma mensagem personalizada com um toque.' },
                { title: 'Dica de fidelização', text: 'Ofereça um desconto especial no mês do aniversário. Clientes se sentem valorizadas e voltam!' },
            ]
        },
        'bolsa-beleza': {
            icon: '💰', color: '#4CAF50', title: 'Bolsa da Beleza',
            tips: [
                { title: 'Definir sua meta', text: 'Informe o salário desejado e suas despesas fixas. A Bolsa calcula quantos atendimentos você precisa por mês.' },
                { title: 'Ticket médio', text: 'O ticket médio é calculado com base nos seus serviços cadastrados. Mantenha o Catálogo atualizado para mais precisão.' },
                { title: 'Acompanhar progresso', text: 'A barra de progresso mostra quanto você já faturou do total necessário no mês atual.' },
            ]
        },
        inventory: {
            icon: '📦', color: '#FF9800', title: 'Estoque',
            tips: [
                { title: 'Cadastrar produto', text: 'Clique em <b>+ Novo Produto</b>. Defina a quantidade mínima para receber alertas de reposição.' },
                { title: 'Alertas de estoque baixo', text: 'Produtos em vermelho estão abaixo do mínimo. Clique em <b>+ Comprar</b> para adicionar à Lista de Compras.' },
                { title: 'Atualizar após compra', text: 'Depois de ir ao fornecedor, clique no lápis (✏️) ao lado do produto e atualize a quantidade.' },
                { title: 'Lista de compras', text: 'A Lista de Compras agrupa tudo que precisa ser reposto. Marque como ✅ comprado após adquirir.' },
            ]
        },
        invoices: {
            icon: '💳', color: '#4CAF50', title: 'Financeiro',
            tips: [
                { title: 'Nova venda', text: 'Clique em <b>+ Nova Venda</b>. Selecione a categoria, cliente, valor e forma de recebimento.' },
                { title: 'Tipos de lançamento', text: 'Escolha: <b>Única</b> (avulso), <b>Parcelada</b> (informe nº de parcelas) ou <b>Recorrente</b> (pacotes mensais).' },
                { title: 'Contas a pagar', text: 'Na aba <b>Contas a Pagar</b>, registre despesas como aluguel, produtos e cursos para ter o saldo real.' },
                { title: 'Filtros de período', text: 'Use os filtros de data e status para ver apenas o mês atual, despesas vencidas ou pagamentos pendentes.' },
            ]
        },
        loyalty: {
            icon: '💎', color: '#9C27B0', title: 'Programa de Fidelidade',
            tips: [
                { title: 'Programa individual', text: 'Cada cliente acumula visitas individualmente. Ao atingir o número configurado, ela ganha a recompensa automaticamente.' },
                { title: 'Configurar meta', text: 'Defina o <b>número de visitas</b> para a recompensa e qual <b>benefício</b> a cliente recebe (ex: 10ª sessão grátis, 20% de desconto).' },
                { title: 'Progresso no perfil', text: 'O progresso de fidelidade aparece no <b>drawer do perfil</b> de cada cliente. Ao concluir um agendamento, o sistema verifica se a meta foi atingida.' },
            ]
        },
        team: {
            icon: '👥', color: '#795548', title: 'Equipe',
            tips: [
                { title: 'Convidar profissional', text: 'Clique em <b>Convidar</b>. Informe o e-mail — ela receberá acesso ao sistema com permissões de profissional.' },
                { title: 'O que a profissional acessa', text: 'Profissionais veem: Agenda, Clientes, Ficha Técnica e Portfólio. Dados financeiros são exclusivos da proprietária.' },
                { title: 'Comissões', text: 'Configure o percentual de comissão na aba <b>Permissões</b>. O sistema calcula automaticamente.' },
            ]
        },
        reviews: {
            icon: '⭐', color: '#FF9800', title: 'Avaliações NPS',
            tips: [
                { title: 'Enviar link de avaliação', text: 'Após cada atendimento, clique em <b>Enviar Link</b> para a cliente receber o formulário de satisfação.' },
                { title: 'NPS real', text: 'O sistema calcula o NPS: <b>Promotoras</b> (5★) - <b>Detratoras</b> (1-3★). Zonas: ≥75 Excelência, ≥50 Qualidade, ≥0 Aperfeiçoamento, <0 Crítica.' },
                { title: 'Atenção às críticas', text: 'Clientes insatisfeitas merecem atenção rápida. Use o WhatsApp para resolver e reconquistar.' },
            ]
        },
        'business-hours': {
            icon: '🕐', color: '#607D8B', title: 'Horário de Funcionamento',
            tips: [
                { title: 'Definir horários', text: 'Configure os horários de início e fim de atendimento de cada dia. A Agenda Online respeita esses horários.' },
                { title: 'Dias de folga', text: 'Desative os dias que não atende. As clientes não poderão agendar online nesses dias.' },
                { title: 'Intervalos', text: 'Defina pausas para almoço ou descanso — esses horários ficam bloqueados no agendamento online.' },
            ]
        },
        'booking-online': {
            icon: '📅', color: '#7B61FF', title: 'Agenda Online',
            tips: [
                { title: 'Ativar link', text: 'Ative a chave para habilitar o agendamento online. Copie o link e compartilhe no Instagram e WhatsApp.' },
                { title: 'Aprovação manual', text: 'Com aprovação manual ativada, você confirma cada agendamento antes de ele entrar na sua agenda.' },
                { title: 'Deixe o perfil completo', text: 'A página de agendamento usa o nome, foto e serviços do seu <b>Perfil do Studio</b>. Mantenha-o atualizado!' },
            ]
        },
        'notifications-config': {
            icon: '🔔', color: '#c4756a', title: 'Notificações e Lembretes',
            tips: [
                { title: 'Lembrete de confirmação', text: 'Ative para enviar WhatsApp automático 24h antes do agendamento pedindo confirmação da cliente.' },
                { title: 'Lembrete de retoque', text: 'O sistema notifica você quando uma cliente está próxima da data de retoque cadastrada na ficha.' },
                { title: 'Aniversariantes', text: 'Ative para receber lembretes diários das clientes aniversariantes — nunca perca uma data.' },
            ]
        },
        'bio-link': {
            icon: '🔗', color: '#00BCAF', title: 'Link da Bio',
            tips: [
                { title: 'Ativar o link', text: 'Ative a chave e copie o link. Cole na bio do Instagram e no WhatsApp Business.' },
                { title: 'O que aparece', text: 'Sua foto de perfil, nome do studio, lista de serviços, portfólio e botão de agendamento.' },
                { title: 'Manter atualizado', text: 'O Link da Bio usa os dados do <b>Perfil do Studio</b>. Qualquer alteração lá aparece automaticamente aqui.' },
            ]
        },
        interactions: {
            icon: '📋', color: '#607D8B', title: 'Histórico de Atendimentos',
            tips: [
                { title: 'Filtrar por cliente', text: 'Selecione uma cliente no filtro para ver somente os atendimentos dela — serviço, data e valor.' },
                { title: 'Filtrar por período', text: 'Use os filtros de data para analisar um mês ou intervalo específico.' },
                { title: 'Dados alimentados pela Agenda', text: 'O histórico é preenchido automaticamente quando você marca um agendamento como <b>Concluído</b> na Agenda.' },
            ]
        },
        referrals: {
            icon: '🎁', color: '#9C27B0', title: 'Indique e Ganhe',
            tips: [
                { title: 'Compartilhe seu link', text: 'Envie o link exclusivo de indicação pelo WhatsApp para colegas lashistas.' },
                { title: 'Acompanhar indicações', text: 'O painel mostra quantas indicações estão pendentes e quantas foram convertidas em assinantes.' },
                { title: 'Como é o pagamento', text: 'R$ 30,00 por indicação convertida. Pagamento via PIX todo dia 05 do mês seguinte.' },
            ]
        },
        settings: {
            icon: '⚙️', color: '#607D8B', title: 'Configurações',
            tips: [
                { title: 'Mensagens pós-atendimento', text: 'Ative/desative o envio automático de cuidados via WhatsApp. Personalize os 6 templates para cada tipo de procedimento.' },
                { title: 'Templates editáveis', text: 'Cada procedimento tem um template padrão que pode ser editado. Use <b>🔄 Restaurar padrão</b> para voltar ao texto original.' },
                { title: 'Link de avaliação', text: 'Configure e copie o link de avaliação NPS para enviar às clientes após cada atendimento.' },
            ]
        },
        'cost-calc': {
            icon: '🧮', color: '#FF5722', title: 'Análise de Custos',
            tips: [
                { title: 'Criar análise', text: 'Selecione o procedimento, adicione os produtos utilizados e suas quantidades. O sistema calcula o custo total automático.' },
                { title: 'Margem de lucro', text: 'Compare o custo dos insumos com o valor cobrado para saber sua margem real por serviço.' },
                { title: 'Produtos do estoque', text: 'A análise puxa os preços do seu <b>Estoque</b>. Mantenha os custos atualizados para cálculos precisos.' },
            ]
        },
    },

    _initialized: false,
    _currentPage: null,

    _init() {
        if (this._initialized) return;
        this._initialized = true;

        // Adiciona estilos de animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ph-pulse {
                0%, 100% { box-shadow: 0 4px 16px rgba(196,117,138,0.45); }
                50% { box-shadow: 0 4px 24px rgba(196,117,138,0.8), 0 0 0 7px rgba(196,117,138,0.12); }
            }
            @keyframes ph-slide-in {
                from { opacity: 0; transform: translateX(18px); }
                to   { opacity: 1; transform: translateX(0); }
            }
            #ph-fab { animation: ph-pulse 2.8s ease-in-out infinite; }
            #ph-fab:hover { animation: none; }
        `;
        document.head.appendChild(style);

        // Backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'ph-backdrop';
        backdrop.style.cssText = 'position:fixed;inset:0;z-index:1050;background:rgba(0,0,0,0.38);backdrop-filter:blur(2px);display:none;opacity:0;transition:opacity 0.3s;';
        backdrop.onclick = () => PageHelp.close();
        document.body.appendChild(backdrop);

        // Drawer
        const drawer = document.createElement('div');
        drawer.id = 'ph-drawer';
        drawer.style.cssText = 'position:fixed;top:0;right:0;bottom:0;z-index:1051;width:min(400px,92vw);background:var(--surface);box-shadow:-4px 0 32px rgba(0,0,0,0.18);display:flex;flex-direction:column;transform:translateX(100%);transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);overflow:hidden;';
        drawer.innerHTML = `
            <div id="ph-header" style="padding:20px 20px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;flex-shrink:0;">
                <div id="ph-icon" style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;"></div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.09em;color:var(--text-muted);margin-bottom:2px;">Ajuda desta página</div>
                    <div id="ph-title" style="font-size:1rem;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
                </div>
                <button onclick="PageHelp.close()" style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 8px;cursor:pointer;display:flex;align-items:center;color:var(--text-muted);flex-shrink:0;">
                    <span class="material-symbols-outlined" style="font-size:20px;">close</span>
                </button>
            </div>
            <div id="ph-body" style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px;"></div>
            <div style="padding:16px 20px;border-top:1px solid var(--border);flex-shrink:0;">
                <button onclick="App.navigate('tutorial');PageHelp.close();"
                    style="width:100%;padding:11px;background:var(--primary-xlight);color:var(--primary);border:1.5px solid var(--primary-light);border-radius:10px;font-weight:600;font-size:0.86rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.2s;"
                    onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='var(--primary-xlight)'">
                    <span class="material-symbols-outlined" style="font-size:18px;">menu_book</span>
                    Ver Guia de Uso Completo
                </button>
            </div>
        `;
        document.body.appendChild(drawer);

        // Botão flutuante (FAB)
        const fab = document.createElement('button');
        fab.id = 'ph-fab';
        fab.title = 'Ajuda desta página';
        fab.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:900;width:50px;height:50px;border-radius:50%;background:var(--primary);color:#fff;border:none;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(196,117,138,0.45);transition:transform 0.2s,box-shadow 0.2s;';
        fab.innerHTML = '<span class="material-symbols-outlined" style="font-size:23px;">help</span>';
        fab.onclick = () => PageHelp.open();
        fab.onmouseenter = () => { fab.style.transform = 'scale(1.12)'; fab.style.animationPlayState = 'paused'; };
        fab.onmouseleave = () => { fab.style.transform = 'scale(1)'; fab.style.animationPlayState = 'running'; };
        document.body.appendChild(fab);
    },

    update(page) {
        this._init();
        this._currentPage = page;
        const hasHelp = !!this.DATA[page];

        // FAB
        const fab = document.getElementById('ph-fab');
        if (fab) fab.style.display = hasHelp ? 'flex' : 'none';

        // Topbar icon
        const topbarBtn = document.getElementById('topbar-help-btn');
        if (topbarBtn) topbarBtn.style.display = hasHelp ? 'flex' : 'none';

        // Atualiza cor do topbar btn
        if (hasHelp && topbarBtn) {
            const iconEl = topbarBtn.querySelector('span');
            if (iconEl) iconEl.style.color = this.DATA[page].color;
        }
    },

    open(page) {
        page = page || this._currentPage;
        const data = this.DATA[page];
        if (!data) return;

        const icon  = document.getElementById('ph-icon');
        const title = document.getElementById('ph-title');
        const body  = document.getElementById('ph-body');
        const backdrop = document.getElementById('ph-backdrop');
        const drawer   = document.getElementById('ph-drawer');
        if (!body || !drawer) return;

        // Preenche cabeçalho
        icon.style.background = data.color + '20';
        icon.textContent = data.icon;
        title.textContent = data.title;

        // Preenche dicas
        body.innerHTML = data.tips.map((tip, i) => `
            <div style="display:flex;gap:14px;padding:15px;background:var(--bg);border-radius:12px;border-left:3px solid ${data.color};animation:ph-slide-in 0.3s ease both;animation-delay:${i * 0.08}s;">
                <div style="width:28px;height:28px;border-radius:50%;background:${data.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:700;flex-shrink:0;margin-top:2px;">${i + 1}</div>
                <div>
                    <div style="font-weight:700;font-size:0.9rem;color:var(--text-primary);margin-bottom:4px;">${tip.title}</div>
                    <div style="font-size:0.84rem;color:var(--text-secondary);line-height:1.6;">${tip.text}</div>
                </div>
            </div>
        `).join('');

        // Exibe
        backdrop.style.display = 'block';
        requestAnimationFrame(() => {
            backdrop.style.opacity = '1';
            drawer.style.transform = 'translateX(0)';
        });
    },

    close() {
        const backdrop = document.getElementById('ph-backdrop');
        const drawer   = document.getElementById('ph-drawer');
        if (!drawer) return;
        backdrop.style.opacity = '0';
        drawer.style.transform = 'translateX(100%)';
        setTimeout(() => { backdrop.style.display = 'none'; }, 360);
    }
};
