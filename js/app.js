// === LashBrow App — Roteamento e Módulos ===
const App = {
    currentPage: null,

    init() {
        App.setupNav();
        // Profissionais iniciam na agenda, não no dashboard
        const startPage = (typeof Team !== 'undefined' && Team.isProfessional()) ? 'schedule' : 'dashboard';
        App.navigate(startPage);
    },

    setupNav() {
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', () => {
                App.navigate(item.dataset.page);
            });
        });
    },

    async navigate(page) {
        if (App.currentPage === page) return;
        App.currentPage = page;

        // Atualiza nav ativo
        document.querySelectorAll('.nav-item[data-page]').forEach(el => {
            el.classList.toggle('active', el.dataset.page === page);
        });

        // Atualiza título
        const titles = {
            dashboard:    'Dashboard',
            clients:      'Cadastro',
            schedule:     'Agenda',
            catalog:      '📱 Catálogo de Serviços',
            'studio-profile': '🏪 Perfil do Studio',
            ficha:        '✨ Ficha Técnica',
            portfolio:    '📸 Portfólio',
            reminders:    '🔔 Lembretes',
            reports:      '📊 Relatórios',
            consent:      '📋 Termo de Consentimento',
            birthday:     '🎂 Aniversariantes',
            'bolsa-beleza':'💰 Bolsa da Beleza',
            inventory:    'Estoque',
            invoices:     'Financeiro',
            interactions: 'Histórico de Atendimentos',
            referrals:    '🎁 Indique e Ganhe',
            loyalty:      '💎 Programa de Fidelidade',
            team:         '👥 Equipe',
            reviews:      '⭐ Avaliações NPS',
            'business-hours': '🕐 Horário de Funcionamento',
            'booking-online': '📅 Agenda Online',
            'notifications-config': '🔔 Notificações e Lembretes',
            'bio-link':   '🔗 Link da Bio',
            tutorial:     '📖 Guia de Uso'
        };
        document.getElementById('topbar-title').textContent = titles[page] || page;

        // Atualiza ícone de ajuda contextual
        if (typeof PageHelp !== 'undefined') PageHelp.update(page);

        // 🔒 Guard de acesso — bloquear páginas owner-only para profissionais
        // Páginas exclusivas da proprietária — profissionais verão tela de "Acesso Restrito"
        const ownerOnlyPages = [
            'dashboard', 'reports', 'invoices', 'inventory', 'catalog',
            'bolsa-beleza', 'referrals', 'loyalty', 'team',
            'studio-profile', 'business-hours', 'booking-online',
            'notifications-config', 'bio-link', 'reviews'
        ];
        if (typeof Team !== 'undefined' && Team.isProfessional() && ownerOnlyPages.includes(page)) {
            const content = document.getElementById('page-content');
            content.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;text-align:center">
                    <span class="material-symbols-outlined" style="font-size:64px;color:var(--primary);opacity:0.5">lock</span>
                    <h3 style="margin-top:16px;color:var(--text-primary)">Acesso Restrito</h3>
                    <p style="color:var(--text-secondary);margin-top:8px;max-width:360px">
                        Esta página é exclusiva para a proprietária do studio.
                        Você tem acesso a Agenda, Clientes, Ficha Técnica, Portfólio e outros módulos operacionais.
                    </p>
                    <button class="btn btn-primary" onclick="App.navigate('schedule')" style="margin-top:20px">
                        <span class="material-symbols-outlined">event</span> Ir para Agenda
                    </button>
                </div>
            `;
            return;
        }

        // Renderiza módulo
        const content = document.getElementById('page-content');
        content.innerHTML = '<div style="display:flex;justify-content:center;padding:48px"><div class="spinner" style="border-color:rgba(196,117,138,0.2);border-top-color:var(--primary)"></div></div>';

        try {
            switch (page) {
                case 'dashboard':    await Dashboard.render(content); break;
                case 'clients':      await Clients.render(content); break;
                case 'schedule':     await Schedule.render(content); break;
                case 'ficha':        await FichaTecnica.render(content); break;
                case 'portfolio':    await Portfolio.render(content); break;
                case 'reminders':    await Reminders.render(content); break;
                case 'reports':      await Reports.render(content); break;
                case 'consent':      await Consent.render(content); break;
                case 'birthday':     await Birthday.render(content); break;
                case 'catalog':      await Catalog.render(content); break;
                case 'bolsa-beleza': await BolsaBeleza.render(content); break;
                case 'inventory':    await Inventory.render(content); break;
                case 'invoices':     await Invoices.render(content); break;
                case 'interactions': await Interactions.render(content); break;
                case 'referrals':    await App.renderReferrals(content); break;
                case 'loyalty':      await Loyalty.render(content); break;
                case 'team':         await TeamManagement.render(content); break;
                case 'reviews':      await Reviews.render(content); break;
                case 'studio-profile':       await StudioProfile.render(content); break;
                case 'business-hours':       await BusinessHours.render(content); break;
                case 'booking-online':       await BookingOnline.render(content); break;
                case 'notifications-config': await NotificationsConfig.render(content); break;
                case 'bio-link':             await BioLink.render(content); break;
                case 'tutorial':             Tutorial.render(content); break;
                default:             content.innerHTML = '<p>Página não encontrada</p>';
            }
        } catch (err) {
            console.error('Erro ao renderizar:', err);
            const isIndexError = err.message && (err.message.includes('index') || err.message.includes('requires an index'));
            const isPermError = err.message && (err.message.includes('permission') || err.message.includes('Missing or insufficient'));
            let icon = 'error', title = 'Erro ao carregar', desc = err.message;
            if (isIndexError) {
                icon = 'hourglass_empty';
                title = 'Preparando seus dados...';
                desc = 'O sistema está configurando o banco de dados para esta funcionalidade. Isso acontece apenas uma vez e leva de 1 a 3 minutos. Clique em "Tentar Novamente" em breve!';
            } else if (isPermError) {
                icon = 'lock';
                title = 'Sem permissão';
                desc = 'Você não tem acesso a esses dados. Tente recarregar a página ou faça login novamente.';
            }
            content.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined empty-state-icon">${icon}</span>
                <p class="empty-state-title">${title}</p>
                <p class="empty-state-desc">${desc}</p>
                <button class="btn btn-primary" onclick="App.currentPage=null;App.navigate('${page}')" style="margin-top:16px">
                    <span class="material-symbols-outlined">refresh</span> Tentar Novamente
                </button></div>`;
        }
    },

    async renderReferrals(container) {
        container.innerHTML = `
        <div style="max-width:800px;margin:0 auto;display:flex;flex-direction:column;gap:20px">
          <!-- Hero Card -->
          <div class="card" style="background:linear-gradient(135deg,#2d1b3d 0%,#5b2d6e 40%,var(--primary) 100%);color:white;overflow:hidden;position:relative">
            <div style="position:absolute;top:-30px;right:-30px;font-size:120px;opacity:0.08;transform:rotate(-15deg)">🎁</div>
            <div class="card-body" style="padding:32px;position:relative;z-index:1">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
                <span style="font-size:32px">🎁</span>
                <h2 style="font-size:1.6rem;font-weight:800;letter-spacing:-0.5px">Indique e Ganhe!</h2>
              </div>
              <p style="font-size:1.05rem;line-height:1.7;opacity:0.95;margin-bottom:20px">
                Convide colegas lashistas para usar o LashBrow e <strong>receba R$ 30,00 por cada indicação</strong> que se tornar assinante!
              </p>
              <div style="background:rgba(255,255,255,0.12);border-radius:12px;padding:20px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15)">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                  <span style="font-size:20px">📅</span>
                  <strong style="font-size:0.95rem">Como funciona o pagamento?</strong>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;font-size:0.88rem;opacity:0.9">
                  <div style="display:flex;align-items:flex-start;gap:10px">
                    <span style="background:rgba(255,255,255,0.2);border-radius:50%;min-width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:800">1</span>
                    <span>Você compartilha seu link exclusivo com colegas profissionais</span>
                  </div>
                  <div style="display:flex;align-items:flex-start;gap:10px">
                    <span style="background:rgba(255,255,255,0.2);border-radius:50%;min-width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:800">2</span>
                    <span>Quando sua indicada se cadastra e paga a assinatura, seu bônus é registrado</span>
                  </div>
                  <div style="display:flex;align-items:flex-start;gap:10px">
                    <span style="background:var(--gold);color:#1a1a2e;border-radius:50%;min-width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:800">✓</span>
                    <span><strong>Todo dia 05 do mês seguinte</strong>, você recebe R$ 30,00 via PIX por cada indicação convertida!</span>
                  </div>
                </div>
              </div>
              <div style="margin-top:20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
                <div style="background:rgba(255,255,255,0.15);padding:10px 20px;border-radius:8px;text-align:center">
                  <div style="font-size:1.8rem;font-weight:900;color:var(--gold-light)">R$ 30</div>
                  <div style="font-size:0.75rem;opacity:0.8">por indicação</div>
                </div>
                <div style="background:rgba(255,255,255,0.15);padding:10px 20px;border-radius:8px;text-align:center">
                  <div style="font-size:1.8rem;font-weight:900;color:var(--gold-light)">♾️</div>
                  <div style="font-size:0.75rem;opacity:0.8">sem limite</div>
                </div>
                <div style="background:rgba(255,255,255,0.15);padding:10px 20px;border-radius:8px;text-align:center">
                  <div style="font-size:1.8rem;font-weight:900;color:var(--gold-light)">PIX</div>
                  <div style="font-size:0.75rem;opacity:0.8">dia 05 do mês</div>
                </div>
              </div>
            </div>
          </div>

          <!-- KPIs -->
          <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
            <div class="kpi-card rose">
              <div class="kpi-icon"><span class="material-symbols-outlined">group</span></div>
              <div class="kpi-value" id="ref-total">0</div>
              <div class="kpi-label">Total de Indicações</div>
            </div>
            <div class="kpi-card gold">
              <div class="kpi-icon"><span class="material-symbols-outlined">hourglass_empty</span></div>
              <div class="kpi-value" id="ref-pending">0</div>
              <div class="kpi-label">Pendentes</div>
            </div>
            <div class="kpi-card green">
              <div class="kpi-icon"><span class="material-symbols-outlined">check_circle</span></div>
              <div class="kpi-value" id="ref-paid">0</div>
              <div class="kpi-label">Pagas</div>
            </div>
            <div class="kpi-card blue">
              <div class="kpi-icon"><span class="material-symbols-outlined">payments</span></div>
              <div class="kpi-value" id="ref-earnings" style="font-size:1.2rem">R$ 0,00</div>
              <div class="kpi-label">Total Ganho</div>
            </div>
          </div>

          <!-- Meu código e link -->
          <div class="card">
            <div class="card-header"><span class="card-title">📎 Seu Link de Indicação</span></div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
              <div>
                <div class="form-label">Código único</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:6px">
                  <div style="font-size:1.5rem;font-weight:800;color:var(--primary);letter-spacing:3px;background:var(--primary-xlight);padding:10px 20px;border-radius:var(--radius-sm)" id="referral-code-display">...</div>
                  <button class="btn btn-outline btn-sm" id="btn-copy-code">
                    <span class="material-symbols-outlined">content_copy</span> Copiar
                  </button>
                </div>
              </div>
              <div>
                <div class="form-label">Link de cadastro</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:6px;flex-wrap:wrap">
                  <div style="font-size:0.82rem;color:var(--text-secondary);background:var(--bg);padding:8px 14px;border-radius:var(--radius-sm);border:1px solid var(--border);flex:1;min-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" id="referral-link-display">...</div>
                  <button class="btn btn-outline btn-sm" id="btn-copy-link">
                    <span class="material-symbols-outlined">link</span> Copiar
                  </button>
                  <button class="btn btn-ghost btn-sm" id="btn-share-whatsapp">
                    <span class="material-symbols-outlined">chat</span> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Histórico -->
          <div class="card">
            <div class="card-header"><span class="card-title">📋 Histórico de Indicações</span></div>
            <div class="table-wrapper">
              <table>
                <thead><tr>
                  <th>E-mail</th><th>Data</th><th>Status</th><th>Bônus</th>
                </tr></thead>
                <tbody id="referrals-tbody">
                  <tr><td colspan="4" class="text-center" style="color:var(--text-muted);padding:32px">Carregando...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>`;

        await Referrals.init();
    },

    showToast(msg, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        const icons = { success: 'check_circle', error: 'error', warning: 'warning' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px">${icons[type]||'info'}</span> ${msg}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    },

    formatCurrency(val) {
        return 'R$ ' + (val || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },
    formatDate(ts) {
        if (!ts) return '-';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('pt-BR');
    }
};
