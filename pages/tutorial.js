// === TUTORIAL — Guia de Uso Studio Beauty ===
const Tutorial = {

    _sections: [
        {
            id: 'inicio', icon: '🚀', title: 'Primeiros Passos',
            color: '#c4756a',
            steps: [
                { title: 'Acesse o sistema', text: 'Entre em <b>studiobeauty.clientehub.app.br</b> com seu e-mail e senha. O sistema funciona no celular e no computador.' },
                { title: 'Complete seu perfil', text: 'Vá em <b>🏪 Perfil do Studio</b> e preencha: nome do studio, telefone, endereço e foto de capa. Esses dados aparecem na sua Agenda Online.' },
                { title: 'Cadastre seus serviços', text: 'Em <b>📱 Catálogo de Serviços</b>, adicione cada serviço com nome, descrição, preço e duração. Ex: "Extensão Fio a Fio – R$180 – 2h30min".' },
                { title: 'Cadastre suas clientes', text: 'Em <b>Cadastro</b>, crie a ficha de cada cliente: nome, telefone, data de nascimento e observações. Clientes cadastradas são sugeridas em toda a plataforma.' },
                { title: 'Máscara de telefone', text: 'O campo de telefone formata automaticamente para <b>(00) 00000-0000</b>. Basta digitar os números — o sistema cuida do formato.' },
            ]
        },
        {
            id: 'agenda', icon: '📅', title: 'Agenda & Atendimentos',
            color: '#7B61FF',
            steps: [
                { title: 'Criar agendamento', text: 'Clique em <b>+ Novo</b> na Agenda. Selecione a cliente, serviço, data e horário. O sistema bloqueia horários em conflito automaticamente.' },
                { title: 'Visualizar a semana', text: 'A agenda exibe a visão semanal. Clique em qualquer horário vazio para criar um novo agendamento rapidamente.' },
                { title: 'Confirmar e concluir', text: 'Mude o status do agendamento para <b>Confirmado</b> após a cliente confirmar, e <b>Concluído</b> após o atendimento. Isso alimenta os relatórios automaticamente.' },
                { title: 'Agenda Online', text: 'Em <b>📅 Agenda Online</b>, ative o link de agendamento público para que clientes marquem sozinhas. Compartilhe o link no Instagram e WhatsApp.' },
                { title: 'Arrastar para reagendar', text: 'Arraste qualquer agendamento para outro dia na visão semanal. O horário original é preservado automaticamente.' },
                { title: 'Cuidados pós-atendimento', text: 'Ao marcar como <b>Concluído</b>, o sistema oferece envio automático de cuidados pós-procedimento via WhatsApp. Os templates são personalizáveis em <b>Configurações</b>.' },
                { title: 'Faturamento de NFS-e direto', text: 'Para agendamentos finalizados, se você configurou o módulo fiscal, o sistema exibe o bloco <b>Nota Fiscal (NFS-e)</b> para você emitir a nota fiscal de serviço oficial com 1 clique direto pela agenda.' },
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
                { title: '5 tipos de ficha', text: 'Escolha entre Cílios, Lash Lifting, Sobrancelhas, Lábios e Facial. Cada tipo tem campos específicos: laudo de cílios naturais, protocolo Lami System 3D, laudo labial, laudo facial com Fitzpatrick.' },
                { title: 'Fotos de registro', text: 'Adicione fotos do estado ANTES do procedimento em cada ficha. Essa evidência protege você em caso de contestações.' },
            ]
        },
        {
            id: 'clientes', icon: '👤', title: 'Gestão de Clientes',
            color: '#00BCAF',
            steps: [
                { title: 'Cadastro completo', text: 'Em <b>Cadastro</b>, registre nome, telefone, e-mail, data de nascimento, endereço e observações (ex: alergias, preferências). Todas as informações em um só lugar.' },
                { title: 'Histórico de atendimentos', text: 'Em <b>Histórico</b>, visualize todos os serviços realizados por cada cliente: data, serviço, valor pago e profissional responsável.' },
                { title: 'Termo de consentimento', text: 'Em <b>📋 Termo de Consentimento</b>, gere e registre o aceite digital da cliente antes de procedimentos. A cliente lê e assina no próprio celular via QR Code, sem papéis.' },
                { title: 'Aniversariantes', text: 'Em <b>🎂 Aniversariantes</b>, veja quem faz aniversário no mês. Envie um WhatsApp de parabéns com um toque de desconto — fideliza muito!' },
                { title: 'Aba Retenção', text: 'Clique em <b>📈 Retenção</b> dentro de Clientes para ver: taxa de retorno, clientes inativos (45+ dias), churn, ticket médio, gráfico de evolução mensal e Top 10 fiéis.' },
                { title: 'Reconquistar clientes inativas', text: 'Na aba Retenção, use o botão <b>📲 Reconquistar</b> para enviar mensagem de retorno via WhatsApp. Filtre por 45, 60, 90 ou 120 dias de ausência.' },
                { title: 'Dados fiscais integrados', text: 'No perfil de cada cliente, você pode salvar o CPF/CNPJ e endereço completo. Use a busca por CEP integrada para preencher os dados de endereço na hora.' },
            ]
        },
        {
            id: 'portfolio', icon: '📸', title: 'Portfólio',
            color: '#E040FB',
            steps: [
                { title: 'Adicionar trabalho', text: 'Em <b>📸 Portfólio</b>, clique em <b>+ Novo Registro</b>. Faça upload das fotos (antes e depois), selecione a cliente e o procedimento realizado. Categorias disponíveis: Cílios, Sobrancelhas, Lábios, Facial e Unhas.' },
                { title: 'Marca d\'água automática', text: 'O sistema aplica automaticamente a marca d\'água personalizada com o nome do seu studio em todas as fotos, protegendo seus trabalhos contra uso não autorizado.' },
                { title: 'Compartilhar nas redes', text: 'Use o botão de compartilhamento para enviar fotos com moldura profissional direto para Instagram Stories e WhatsApp. Ideal para divulgação de resultados.' },
                { title: 'Galeria pública', text: 'Seus trabalhos ficam visíveis na página pública do <b>🔗 Link da Bio</b>, funcionando como vitrine digital para atrair novas clientes.' },
                { title: 'Retenção automática de 100 dias', text: 'As fotos são mantidas por 100 dias com indicadores visuais de expiração (🟢 recente, 🟡 expirando, 🔴 próximo da remoção). Faça download antes do vencimento para manter seu acervo.' },
            ]
        },
        {
            id: 'financeiro', icon: '💰', title: 'Central Financeira',
            color: '#4CAF50',
            steps: [
                { title: 'Lançamentos Automáticos', text: 'Ao dar baixa em atendimentos concluídos na agenda, o sistema faz o lançamento automático da entrada no fluxo de caixa.' },
                { title: 'Contas a Pagar e Despesas', text: 'Na aba <b>Contas a Pagar</b>, clique em <b>Nova Despesa</b>. Informe: categoria (Ex: Aluguel, Descartáveis), descrição, valor, vencimento e forma de pagamento.' },
                { title: 'Recebimento Online (Asaas)', text: 'Habilite pagamentos online nas Configurações. Suas clientes podem pagar sinal ou valor integral ao agendar. A confirmação é 100% automatizada e altera o status da agenda no mesmo segundo.' },
                { title: 'Divisão de Comissões', text: 'Com profissionais cadastrados, o sistema calcula na hora a fatia da profissional que atendeu e consolida o relatório para folha de pagamento na aba Comissões.' },
                { title: 'Filtros e períodos de caixa', text: 'Filtre suas despesas e receitas por períodos (mês atual, semanas) ou por status de pagamento (vencidas, pagas, pendentes) para controle absoluto.' },
            ]
        },
        {
            id: 'estoque', icon: '📦', title: 'Gestão de Estoque',
            color: '#FF9800',
            steps: [
                { title: 'Cadastrar produto de estoque', text: 'Em <b>Estoque</b>, clique em <b>+ Novo Produto</b>. Informe: nome (Ex: Gel Base, Cola), quantidade atual, quantidade mínima (alerta crítico) e unidade (ml, g, un).' },
                { title: 'Baixa Silenciosa Automática', text: 'Vincule a receita de insumos aos serviços no Catálogo. Ao concluir os atendimentos na Agenda, o estoque é debitado silenciosamente nas frações exatas usadas.' },
                { title: 'Leitor XML de Notas Fiscais', text: 'Cadastre suas reposições arrastando o arquivo <b>.xml</b> da nota de compra. O sistema extrai fornecedor, itens e quantidades automaticamente.' },
                { title: 'Mapeamento inteligente De/Para', text: 'Associe os itens da nota fiscal aos produtos do seu estoque. O sistema memoriza esses vínculos para preenchê-los sozinho em compras futuras do mesmo fornecedor.' },
                { title: 'Balanço Físico e Auditorias', text: 'Na aba <b>Inventários</b>, faça contagens físicas de controle. Se houver divergências (sobras ou perdas), justifique o motivo (Vencimento, Quebra, Furto) para ajustar o estoque real.' },
            ]
        },
        {
            id: 'custos', icon: '🧮', title: 'Análise de Custos',
            color: '#FF5722',
            steps: [
                { title: 'Calcular custo por procedimento', text: 'Em <b>🧮 Calculadora de Custo</b>, selecione os produtos que usa em cada procedimento e o sistema calcula o custo total dos insumos.' },
                { title: 'Margem de lucro real', text: 'O calculador cruza os custos de aquisição do seu estoque com a receita de insumos e o preço de venda para indicar a margem exata e alertar contra prejuízos.' },
                { title: 'Otimizar preços', text: 'Use a análise de custos para ajustar seus preços com base em dados reais, não em achismo.' },
            ]
        },
        {
            id: 'fidelidade', icon: '💎', title: 'Fidelidade',
            color: '#AB47BC',
            steps: [
                { title: 'Cartão de Fidelidade Digital', text: 'Em <b>💎 Fidelidade</b>, configure quantos atendimentos a cliente precisa completar para ganhar uma recompensa (ex: 10 atendimentos = 1 grátis). O cartão é 100% digital.' },
                { title: 'Carimbos visuais automáticos', text: 'O sistema cria um cartão visual com carimbos preenchidos automaticamente a cada atendimento concluído na agenda. Veja o progresso de cada cliente na tela — sem papel, sem confusão.' },
                { title: 'Classificação automática', text: 'Clientes são classificadas como 🌱 Regular, ⭐ Fiel (5+ visitas) e 💎 Diamante (10+ visitas), com ranking e medalhas. Identifique suas melhores clientes de relance.' },
                { title: 'Alerta de prêmio', text: 'Quando a cliente completa o ciclo de carimbos, aparece o badge <b>🎉 Prêmio a Entregar!</b>. Use o botão <b>📲 Avisar</b> para enviar a boa notícia via WhatsApp.' },
                { title: 'Lembrete de fidelidade', text: 'Envie uma mensagem automática via WhatsApp quando a cliente estiver próxima da recompensa para estimular o retorno. Clientes que se sentem valorizadas voltam mais.' },
            ]
        },
        {
            id: 'marketing', icon: '📣', title: 'Comunicação & CRM',
            color: '#9C27B0',
            steps: [
                { title: 'Central de Disparos CRM (Lote)', text: 'No painel administrativo do CRM (admin-convites.html), cadastre contatos e envie comunicados ou campanhas de marketing em massa via E-mail/SMS com placeholders dinâmicos.' },
                { title: 'Link da Bio', text: 'Em <b>🔗 Link da Bio</b>, gere um micro-site com sua foto, serviços, portfólio e link de agendamento. Coloque na bio do Instagram, TikTok e WhatsApp — todos os seus links públicos em um só lugar.' },
                { title: 'NPS com cálculo real', text: 'Em <b>⭐ Avaliações NPS</b>, o sistema calcula o NPS real: <b>Promotoras</b> (5★), <b>Neutras</b> (4★) e <b>Detratoras</b> (1-3★). Acompanhe a lealdade da base e compartilhe o link de avaliação.' },
                { title: 'WhatsApp como canal principal', text: 'O sistema integra o WhatsApp em todos os módulos: confirmações de agenda, lembretes de retoque, parabéns de aniversário, reconquista de inativas e avisos de fidelidade — tudo com um clique.' },
            ]
        },
        {
            id: 'notificacoes', icon: '🔔', title: 'Notificações & Lembretes',
            color: '#FF7043',
            steps: [
                { title: 'Lembretes automáticos na nuvem', text: 'Em <b>🔔 Notificações Push</b>, ative os lembretes de agendamento por E-mail e/ou SMS. Os disparos acontecem automaticamente na nuvem, 24h e 1h antes do horário marcado — sem depender do seu celular.' },
                { title: 'Compra de pacotes SMS', text: 'Compre pacotes de SMS pré-pagos via PIX com liberação instantânea. SMS reduzem faltas em até 85%, se pagando no primeiro mês de uso.' },
                { title: '6 tipos de notificação', text: 'Configure individualmente: 🎂 Aniversariantes, 📦 Estoque Baixo, 🔔 Lembrete D-1 (amanhã), ☀️ Lembrete D-0 (hoje), 📅 Novo Agendamento Online e ⭐ Nova Avaliação NPS. Ative ou desative cada um com um toggle.' },
                { title: 'Lembretes de retoque', text: 'Em <b>🔔 Lembretes</b>, veja automaticamente os retoques que vencem nos próximos dias. Os alertas são gerados das fichas técnicas, organizados em 🔴 Atrasados, 🟡 Hoje e 🟢 Próximos Dias.' },
                { title: 'Lembretes manuais', text: 'Crie lembretes pessoais para tarefas do dia a dia: repor estoque, cobrar cliente, pagar fornecedor. Classifique por prioridade e categoria (Geral, Financeiro, Estoque, Cliente, Marketing).' },
                { title: 'Envio em lote via WhatsApp', text: 'Na tela de Lembretes, selecione vários retoques pendentes e envie a mensagem de retorno para todas as clientes de uma só vez via WhatsApp.' },
            ]
        },
        {
            id: 'relatorios', icon: '📊', title: 'Relatórios & Dashboard',
            color: '#5B8DEF',
            steps: [
                { title: 'Dashboard inteligente', text: 'O <b>Dashboard</b> é a vitrine do seu negócio. Ele exibe: 7 KPIs (clientes, novos cadastros, atendimentos do dia/mês, faturamento, ticket médio e nota NPS), meta mensal com barra de progresso, gráfico de 7 dias, evolução de 6 meses, agenda do dia, aniversariantes, confirmações pendentes e alertas de estoque.' },
                { title: 'Meta mensal de faturamento', text: 'No Dashboard, defina sua meta mensal. O sistema mostra em tempo real quanto já faturou, quanto falta e um emoji motivacional (🚀💪🔥🏆) conforme o progresso.' },
                { title: 'Comparativo com mês anterior', text: 'O Dashboard compara faturamento, atendimentos e novas clientes do mês atual com o anterior, usando setas ▲ verde (crescimento) e ▼ vermelho (queda).' },
                { title: 'Relatórios consolidados', text: 'Em <b>📊 Relatórios</b>, veja o faturamento do mês, número de atendimentos, ticket médio e detalhamento por serviço. Dados consolidados de toda a operação.' },
                { title: 'Bolsa da Beleza', text: 'A <b>💰 Bolsa da Beleza</b> é seu coach estratégico: calcula o Hora Cem (quanto cobrar por hora), oferece um Plano de 14 Dias com ações diárias (auditar agenda, criar combos, reajustar preços, prospectar parcerias) e acompanha seu progresso direto no Dashboard.' },
            ]
        },
        {
            id: 'equipe', icon: '👥', title: 'Equipe',
            color: '#795548',
            steps: [
                { title: 'Convidar profissional', text: 'Em <b>👥 Equipe</b>, clique em <b>Convidar Profissional</b> e informe o e-mail dela. Ela receberá um convite e terá acesso ao sistema com permissões limitadas.' },
                { title: 'Permissões e restrições', text: 'Profissionais veem Agenda, Clientes, Ficha Técnica e Portfólio. Dados financeiros (Financeiro, Relatórios, Estoque, Configurações Fiscais) são exclusivos da proprietária.' },
                { title: 'Comissões automáticas', text: 'Configure o percentual de comissão de cada profissional. O sistema calcula automaticamente com base nos atendimentos concluídos na agenda.' },
            ]
        },
        {
            id: 'config', icon: '⚙️', title: 'Configurações',
            color: '#607D8B',
            steps: [
                { title: 'Horário de Funcionamento', text: 'Em <b>🕐 Horário de Funcionamento</b>, defina os dias e horários de atendimento do seu studio. Ative/desative cada dia da semana, configure horário de início e fim, e opcionalmente o intervalo de almoço. Esses horários impactam diretamente a <b>Agenda Online</b> — clientes só conseguem agendar dentro do seu expediente.' },
                { title: 'Configurar Pagamentos (Asaas)', text: 'Cole sua API Key do Asaas e ative o switch de recebimento online. Suas clientes pagam no cartão/PIX ao agendar online.' },
                { title: 'Configurar NFS-e (Focus NFe)', text: 'Cole seu Token da Focus NFe, defina o Regime Tributário, alíquota de ISS e CNAE padrão para automatizar as emissões fiscais.' },
                { title: 'Mensagens pós-atendimento', text: 'Ative ou desative o envio de cuidados pós-procedimento. O sistema inclui templates prontos (Cílios, Sobrancelhas, Micropigmentação, Henna, Lami) que você pode editar.' },
                { title: 'Templates de WhatsApp', text: 'Personalize os textos de confirmações e lembretes com emojis ou com a linguagem do seu estúdio.' },
            ]
        },
        {
            id: 'consultora', icon: '🤖', title: 'Consultora IA',
            color: '#c4756a',
            steps: [
                { title: 'O que é a Consultora IA?', text: 'A <b>🤖 Consultora IA</b> é sua assistente especialista em cílios, sobrancelhas, estética facial e gestão de beauty studio. Ela conhece os protocolos oficiais de Brow Lamination, Lash Lifting, Complex 3D, ReVita, BioSpik, Lábios, Hidragloss e Manicure.' },
                { title: 'Como acessar', text: 'Clique no botão <b>🤖 Consultora IA</b> no rodapé do menu lateral. O chat abre na lateral da tela, sem sair da página atual. Funciona no celular e no computador.' },
                { title: 'O que perguntar', text: 'Pergunte sobre protocolos de aplicação, técnicas de curvatura, reações adversas, mapeamento de cílios, precificação, compatibilidade entre peelings, cuidados pós-procedimento e muito mais. Use os chips de sugestão para começar.' },
                { title: 'Contexto inteligente', text: 'A Consultora detecta automaticamente em qual página do sistema você está e adapta as respostas ao contexto. Por exemplo, se você está na Ficha Técnica, ela pode sugerir protocolos específicos para o procedimento em questão.' },
            ]
        },
        {
            id: 'dicas', icon: '💡', title: 'Dicas de Uso Diário',
            color: '#607D8B',
            steps: [
                { title: '☀️ Manhã — Verifique a agenda', text: 'Abra o <b>Dashboard</b> para ver os agendamentos do dia, alertas de estoque, aniversariantes e confirmações pendentes antes de começar os atendimentos.' },
                { title: '🌙 Noite — Conclua os atendimentos', text: 'Marcar os agendamentos como concluídos no final do dia garante que o financeiro, comissões de equipe e a baixa do estoque fiquem 100% redondos.' },
                { title: '📸 Registre seus trabalhos', text: 'Após cada procedimento, tire uma foto do resultado e adicione ao <b>Portfólio</b>. Fotos de antes e depois são a melhor propaganda para atrair novas clientes.' },
                { title: '📦 Semanal — Auditoria de Estoque', text: 'Realize contagens físicas semanais nas auditorias para identificar desvios ou perdas e manter o calculador de custos afiado.' },
                { title: '🤖 Use a Consultora IA', text: 'Antes de aplicar um protocolo novo ou tirar uma dúvida técnica, abra a <b>Consultora IA</b>. Ela pode esclarecer compatibilidade de produtos, tempos de pausa e cuidados específicos em tempo real.' },
                { title: '📲 Instale no celular', text: 'Ao acessar o sistema pelo Chrome no celular, clique em <b>"Adicionar à tela inicial"</b>. O Studio Beauty funciona como um app — rápido e offline!' },
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
            <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 6px">Guia de Uso — Studio Beauty</h1>
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
            <a href="https://wa.me/5537991208394?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20o%20Studio%20Beauty." target="_blank"
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

// Garantir que Tutorial esteja disponível no escopo global
window.Tutorial = Tutorial;
