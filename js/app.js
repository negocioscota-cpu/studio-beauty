// === App Router & Initialization ===
const App = {
    currentPage: null,

    init() {
        window.addEventListener('hashchange', () => App.route());

        // Mobile sidebar toggle
        document.getElementById('btn-hamburger')?.addEventListener('click', () => App.toggleMobileSidebar());
        document.getElementById('sidebar-overlay')?.addEventListener('click', () => App.closeMobileSidebar());

        // New appointment button
        document.getElementById('btn-new-appointment')?.addEventListener('click', () => {
            App.showNewAppointmentModal();
        });

        // Notifications button
        document.getElementById('btn-notifications')?.addEventListener('click', () => {
            App.showNotificationsModal();
        });

        // Help button
        document.getElementById('btn-help')?.addEventListener('click', () => {
            App.showHelpModal();
        });

        // Global search
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const query = searchInput.value.trim();
                    if (query.length >= 2) {
                        App.globalSearch(query);
                    }
                }, 400);
            });
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = searchInput.value.trim();
                    if (query.length >= 1) App.globalSearch(query);
                }
            });
        }

        // Logout
        document.getElementById('btn-logout')?.addEventListener('click', () => {
            if (confirm('Deseja realmente sair do sistema?')) {
                auth.signOut();
            }
        });

        // Initial route
        if (!window.location.hash || window.location.hash === '#/') {
            window.location.hash = '#/dashboard';
        } else {
            App.route();
        }

        // Monitoramento de conectividade em tempo real (Online/Offline)
        window.addEventListener('online', () => {
            App.showToast('Conexão reestabelecida! Sincronizando dados com a nuvem...', 'success');
        });

        window.addEventListener('offline', () => {
            App.showToast('Você está offline. O Studiobeauty continuará funcionando localmente!', 'info');
        });

        // Verificação de conectividade no carregamento inicial
        if (!navigator.onLine) {
            setTimeout(() => {
                App.showToast('Você está offline. Alterações em clientes, agenda e estoque serão salvas localmente.', 'info');
            }, 1500);
        }
    },

    route() {
        const hash = window.location.hash.replace('#/', '') || 'dashboard';
        const segments = hash.split('/');
        const page = segments[0];
        const param = segments[1] || null;

        if (page === 'ia-consultancy') {
            if (typeof IAConsultoria !== 'undefined') {
                IAConsultoria.openChat();
            }
            // Restaura a rota anterior (para manter o usuário onde ele estava)
            window.location.hash = '#/' + (App.currentPage || 'dashboard');
            return;
        }

        App.currentPage = page;

        // Update sidebar nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page || (page === 'clients' && item.dataset.page === 'clients')) {
                item.classList.add('active');
            }
        });

        // Update bottom nav
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page || (page === 'clients' && item.dataset.page === 'clients')) {
                item.classList.add('active');
            }
        });

        // Close mobile sidebar on navigation
        App.closeMobileSidebar();

        const content = document.getElementById('app-content');

        switch (page) {
            case 'dashboard':
                content.innerHTML = DashboardPage.render();
                DashboardPage.init();
                break;
            case 'schedule':
                content.innerHTML = SchedulePage.render();
                SchedulePage.init();
                break;
            case 'clients':
                if (param === 'new' || param) {
                    content.innerHTML = ClientFormPage.render(param);
                    ClientFormPage.init(param);
                } else {
                    content.innerHTML = ClientsPage.render();
                    ClientsPage.init();
                }
                break;
            case 'inventory':
                content.innerHTML = InventoryPage.render();
                InventoryPage.init();
                break;
            case 'interactions':
                content.innerHTML = InteractionsPage.render();
                InteractionsPage.init();
                break;
            case 'invoices':
                content.innerHTML = InvoicesPage.render();
                InvoicesPage.init();
                break;
            case 'settings':
                content.innerHTML = SettingsPage.render();
                SettingsPage.init();
                break;
            case 'referrals':
                if (Auth.companyData && Auth.companyData.plan === 'starter') {
                    content.innerHTML = `
                    <div class="px-6 py-8 pb-32 md:pb-8 max-w-xl mx-auto text-center animation-fade-in" style="margin-top: 40px;">
                        <div class="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6" style="background-color: rgba(199, 123, 107, 0.1);">
                            <span class="material-symbols-outlined text-primary text-4xl" style="font-variation-settings:'FILL' 1; color: var(--rose);">stars</span>
                        </div>
                        <h1 class="font-headline font-extrabold text-2xl text-slate-900 leading-tight mb-3" style="font-size: 24px; font-weight: 800; color: #2C1810; font-family: 'Manrope', sans-serif;">
                            Recurso Exclusivo do Plano Studio e Premium
                        </h1>
                        <p class="text-slate-500 mb-6 text-sm" style="color: #7A5C54; font-size: 14px; margin-bottom: 24px;">
                            O programa de indicações (Bolsa da Beleza) está disponível apenas a partir do plano **Studio**. Faça o upgrade da sua conta e comece a ganhar até R$ 50,00 por indicação!
                        </p>
                        <a href="subscribe.html?plan=profissional" class="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-sm" style="background: linear-gradient(135deg, var(--rose) 0%, var(--gold) 100%); color: white; padding: 14px 24px; border-radius: 16px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-family: 'Manrope', sans-serif;">
                            <span class="material-symbols-outlined" style="font-size: 18px;">upgrade</span>
                            Fazer Upgrade do Plano
                        </a>
                    </div>`;
                } else {
                    content.innerHTML = ReferralsPage.render();
                    ReferralsPage.init();
                }
                break;
            case 'bolsa-beleza-sb':
                content.innerHTML = BolsaBelezaSBPage.render();
                BolsaBelezaSBPage.init();
                break;
            case 'catalog':
                content.innerHTML = CatalogPage.render();
                CatalogPage.init();
                break;
            case 'portfolio':
                content.innerHTML = PortfolioPage.render();
                PortfolioPage.init();
                break;
            case 'reports':
                content.innerHTML = ReportsPage.render();
                ReportsPage.init();
                break;
            case 'team-management':
                content.innerHTML = TeamManagementPage.render();
                TeamManagementPage.init();
                break;
            case 'reminders':
                content.innerHTML = RemindersPage.render();
                RemindersPage.init();
                break;
            case 'birthdays':
                content.innerHTML = BirthdaysPage.render();
                BirthdaysPage.init();
                break;
            case 'loyalty':
                content.innerHTML = LoyaltyPage.render();
                LoyaltyPage.init();
                break;
            case 'ficha-tecnica':
                content.innerHTML = FichaTecnicaPage.render();
                FichaTecnicaPage.init();
                break;
            case 'consent':
                content.innerHTML = ConsentPage.render();
                ConsentPage.init();
                break;
            case 'reviews':
                content.innerHTML = ReviewsPage.render();
                ReviewsPage.init();
                break;
            case 'company-profile':
                content.innerHTML = CompanyProfilePage.render();
                CompanyProfilePage.init();
                break;
            case 'subscription':
                content.innerHTML = SubscriptionPage.render();
                SubscriptionPage.init();
                break;
            case 'fiscal':
                content.innerHTML = FiscalPage.render();
                FiscalPage.init();
                break;
            case 'business-hours':
                content.innerHTML = BusinessHoursPage.render();
                BusinessHoursPage.init();
                break;
            case 'currency-service':
                content.innerHTML = CurrencyServicePage.render();
                CurrencyServicePage.init();
                break;
            case 'notifications-settings':
                content.innerHTML = NotificationsSettingsPage.render();
                NotificationsSettingsPage.init();
                break;
            case 'booking-link':
                content.innerHTML = BookingLinkPage.render();
                BookingLinkPage.init();
                break;
            // === PÁGINAS COMBINADAS ===
            case 'catalog-portfolio':
                content.innerHTML = CatalogPortfolioPage.render();
                CatalogPortfolioPage.init();
                break;
            case 'fichas-documentos':
                content.innerHTML = FichasDocumentosPage.render();
                FichasDocumentosPage.init();
                break;
            case 'service-settings':
                content.innerHTML = ServiceSettingsPage.render();
                ServiceSettingsPage.init();
                break;
            case 'comunicacao':
                content.innerHTML = ComunicacaoPage.render();
                ComunicacaoPage.init();
                break;
            case 'minha-conta':
                content.innerHTML = MinhaContaPage.render();
                MinhaContaPage.init();
                break;
            // === ALIASES (retrocompatibilidade) ===
            case 'catalog':
                content.innerHTML = CatalogPortfolioPage.render();
                CatalogPortfolioPage.init();
                break;
            case 'portfolio':
                content.innerHTML = CatalogPortfolioPage.render();
                CatalogPortfolioPage._switch('portfolio');
                break;
            case 'ficha-tecnica':
                content.innerHTML = FichasDocumentosPage.render();
                FichasDocumentosPage.init();
                break;
            case 'consent':
                content.innerHTML = FichasDocumentosPage.render();
                FichasDocumentosPage._switch('consent');
                break;
            case 'business-hours':
                content.innerHTML = ServiceSettingsPage.render();
                ServiceSettingsPage.init();
                break;
            case 'currency-service':
                content.innerHTML = ServiceSettingsPage.render();
                ServiceSettingsPage._switch('currency');
                break;
            case 'reminders':
                content.innerHTML = ComunicacaoPage.render();
                ComunicacaoPage.init();
                break;
            case 'notifications-settings':
                content.innerHTML = ComunicacaoPage.render();
                ComunicacaoPage._switch('notificacoes');
                break;
            case 'settings':
            case 'company-profile':
            case 'subscription':
            case 'fiscal':
                content.innerHTML = MinhaContaPage.render();
                MinhaContaPage.init();
                break;
            default:
                content.innerHTML = DashboardPage.render();
                DashboardPage.init();
        }

        // Re‐trigger fade
        content.style.animation = 'none';
        content.offsetHeight; // trigger reflow
        content.style.animation = '';
    },

    // === Modal ===
    openModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('hidden');
        overlay.classList.add('show');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) App.closeModal();
        });
    },

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.add('hidden');
        overlay.classList.remove('show');
    },

    // === Mobile Sidebar ===
    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const isOpen = sidebar.classList.contains('open');
        if (isOpen) {
            App.closeMobileSidebar();
        } else {
            sidebar.classList.add('open');
            overlay.classList.remove('hidden');
            requestAnimationFrame(() => overlay.classList.add('show'));
        }
    },

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (!sidebar || !overlay) return;
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    },

    // === Toast ===
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const colors = {
            success: 'bg-primary text-white',
            error: 'bg-error text-white',
            info: 'bg-on-surface text-surface'
        };
        const icons = {
            success: 'check_circle',
            error: 'error',
            info: 'info'
        };

        const toast = document.createElement('div');
        toast.className = `toast flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl ${colors[type] || colors.info}`;
        toast.innerHTML = `
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">${icons[type] || icons.info}</span>
            <span class="font-medium text-sm">${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            toast.style.transition = 'all 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    // === New Appointment Modal ===
    showNewAppointmentModal() {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-8">
            <h3 class="font-headline font-bold text-2xl mb-2">Novo Agendamento</h3>
            <p class="text-on-surface-variant text-sm mb-6">Preencha as informações para agendar um atendimento.</p>
            <form id="appointment-form" class="space-y-5">
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Cliente</label>
                    <select id="appt-client" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" required>
                        <option value="">Carregando clientes...</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Data</label>
                        <input type="date" id="appt-date" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface" required/>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Horário</label>
                        <input type="time" id="appt-time" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface" required/>
                    </div>
                </div>
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Tipo de Serviço</label>
                    <input type="text" id="appt-service" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface" placeholder="Ex: Consultoria, Manutenção..."/>
                </div>
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Observações</label>
                    <textarea id="appt-notes" rows="2" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface resize-none" placeholder="Notas adicionais..."></textarea>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2">
                        <span class="material-symbols-outlined">event_available</span>
                        Agendar
                    </button>
                </div>
            </form>
        </div>`;
        App.openModal();

        // Populate clients dropdown
        Store.getClients().then(clients => {
            const select = document.getElementById('appt-client');
            select.innerHTML = '<option value="">Selecione um cliente...</option>' +
                clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        });

        // Today as default
        document.getElementById('appt-date').valueAsDate = new Date();

        // Form submit
        document.getElementById('appointment-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const dateVal = document.getElementById('appt-date').value;
            const timeVal = document.getElementById('appt-time').value;
            const dateTime = new Date(dateVal + 'T' + timeVal);

            await Store.addAppointment({
                clientId: document.getElementById('appt-client').value,
                clientName: document.getElementById('appt-client').selectedOptions[0]?.text || '',
                date: dateTime,
                service: document.getElementById('appt-service').value,
                notes: document.getElementById('appt-notes').value
            });

            App.closeModal();
            App.showToast('Agendamento criado com sucesso!', 'success');
            App.route(); // Refresh current page
        });
    },

    // === Notifications Modal ===
    showNotificationsModal() {
        const modal = document.getElementById('modal-content');
        const lowItems = window.__lowStockItems || [];

        let stockAlerts = '';
        if (lowItems.length > 0) {
            stockAlerts = lowItems.map(item => `
                <div class="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                    <span class="material-symbols-outlined text-red-500 mt-0.5">warning</span>
                    <div class="flex-1">
                        <p class="font-bold text-sm text-on-surface">${item.name} — Estoque Baixo!</p>
                        <p class="text-xs text-on-surface-variant mt-1">Quantidade atual: <strong class="text-red-600">${item.quantity || 0}</strong> | Mínimo: <strong>${item.minQuantity || 0}</strong></p>
                        <p class="text-[10px] text-red-400 mt-1">⚠ Repor o mais rápido possível</p>
                    </div>
                </div>`).join('');
        } else {
            stockAlerts = `
                <div class="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span class="material-symbols-outlined text-emerald-500 mt-0.5">check_circle</span>
                    <div>
                        <p class="font-bold text-sm text-on-surface">Estoque em dia ✓</p>
                        <p class="text-xs text-on-surface-variant mt-1">Todos os itens estão acima do nível mínimo.</p>
                    </div>
                </div>`;
        }

        modal.innerHTML = `
        <div class="p-8">
            <h3 class="font-headline font-bold text-2xl mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">notifications</span>
                Notificações
            </h3>
            <p class="text-on-surface-variant text-sm mb-6">Alertas e notificações do sistema.</p>

            ${lowItems.length > 0 ? `<div class="flex items-center gap-2 mb-4">
                <span class="bg-red-100 text-red-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase">${lowItems.length} alerta${lowItems.length > 1 ? 's' : ''}</span>
                <a href="#/inventory" onclick="App.closeModal();" class="text-xs text-primary font-bold hover:underline">Ver Inventário →</a>
            </div>` : ''}

            <div class="space-y-3 max-h-[350px] overflow-y-auto">
                ${stockAlerts}
                <div class="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <span class="material-symbols-outlined text-primary mt-0.5">info</span>
                    <div>
                        <p class="font-bold text-sm text-on-surface">Bem-vinda ao Studiobeauty!</p>
                        <p class="text-xs text-on-surface-variant mt-1">Seu sistema está pronto para uso. Comece cadastrando seus clientes.</p>
                        <p class="text-[10px] text-outline mt-2">Sistema</p>
                    </div>
                </div>
                <div class="flex items-start gap-3 p-4 bg-surface-container-high rounded-xl">
                    <span class="material-symbols-outlined text-on-surface-variant mt-0.5">tips_and_updates</span>
                    <div>
                        <p class="font-bold text-sm text-on-surface">Dica: Exporte relatórios</p>
                        <p class="text-xs text-on-surface-variant mt-1">Use o botão "Relatório" no Inventário para gerar PDFs de consumo.</p>
                        <p class="text-[10px] text-outline mt-2">Dica</p>
                    </div>
                </div>
            </div>
            <div class="flex justify-end pt-4 mt-4 border-t border-outline-variant/10">
                <button type="button" onclick="App.closeModal()" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl">Fechar</button>
            </div>
        </div>`;
        App.openModal();
    },

    // === Help Modal — Centro de Ajuda Completo ===
    showHelpModal(initialTab = 'inicio') {
        const modal = document.getElementById('modal-content');

        const helpSections = {
            inicio: {
                icon: 'home',
                title: 'Bem-vindo ao Centro de Ajuda',
                content: `
                    <div class="space-y-4">
                        <div class="bg-primary/5 border border-primary/10 rounded-xl p-5">
                            <h4 class="font-bold text-base text-on-surface flex items-center gap-2 mb-2">
                                <span class="material-symbols-outlined text-primary text-lg">waving_hand</span>
                                Olá! Bem-vindo(a) ao ClienteHub
                            </h4>
                            <p class="text-sm text-on-surface-variant leading-relaxed">
                                Este é o seu sistema completo de gestão do estúdio. Aqui você encontra tutoriais detalhados para aproveitar ao máximo cada funcionalidade.
                            </p>
                        </div>
                        <h4 class="font-bold text-sm text-on-surface mt-4">📖 Guia Rápido — Primeiros Passos</h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="bg-surface-container-high rounded-xl p-4 cursor-pointer hover:bg-surface-container transition-colors" onclick="App.switchHelpTab('clientes')">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="material-symbols-outlined text-primary text-lg">group</span>
                                    <span class="font-bold text-sm">1. Cadastrar Clientes</span>
                                </div>
                                <p class="text-xs text-on-surface-variant">Comece registrando seus clientes no sistema.</p>
                            </div>
                            <div class="bg-surface-container-high rounded-xl p-4 cursor-pointer hover:bg-surface-container transition-colors" onclick="App.switchHelpTab('agenda')">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="material-symbols-outlined text-primary text-lg">calendar_today</span>
                                    <span class="font-bold text-sm">2. Criar Agendamentos</span>
                                </div>
                                <p class="text-xs text-on-surface-variant">Organize suas consultas e atendimentos.</p>
                            </div>
                            <div class="bg-surface-container-high rounded-xl p-4 cursor-pointer hover:bg-surface-container transition-colors" onclick="App.switchHelpTab('inventario')">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="material-symbols-outlined text-primary text-lg">inventory_2</span>
                                    <span class="font-bold text-sm">3. Controlar Estoque</span>
                                </div>
                                <p class="text-xs text-on-surface-variant">Gerencie materiais e produtos do estúdio.</p>
                            </div>
                            <div class="bg-surface-container-high rounded-xl p-4 cursor-pointer hover:bg-surface-container transition-colors" onclick="App.switchHelpTab('config')">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="material-symbols-outlined text-primary text-lg">settings</span>
                                    <span class="font-bold text-sm">4. Personalizar Sistema</span>
                                </div>
                                <p class="text-xs text-on-surface-variant">Configure sua clínica, serviços e horários.</p>
                            </div>
                        </div>
                        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                            <p class="text-xs text-amber-800 flex items-start gap-2">
                                <span class="material-symbols-outlined text-amber-600 text-base mt-0.5">tips_and_updates</span>
                                <span><strong>Dica:</strong> Use o menu à esquerda para navegar pelas seções do tutorial. Cada seção possui instruções passo a passo detalhadas.</span>
                            </p>
                        </div>
                    </div>`
            },
            dashboard: {
                icon: 'dashboard',
                title: 'Dashboard — Painel Principal',
                content: `
                    <div class="space-y-4">
                        <p class="text-sm text-on-surface-variant leading-relaxed">O Dashboard é a visão geral da sua clínica. Aqui você acompanha métricas, agenda do dia e acessa atalhos rápidos.</p>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden" open>
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">analytics</span> Entendendo as Métricas</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p>No topo do Dashboard você encontra <strong>4 cards de métricas</strong>:</p>
                                <ul class="list-disc pl-5 space-y-1">
                                    <li><strong>Total de Clientes</strong> — Número total de clientes cadastrados</li>
                                    <li><strong>Clientes Ativos</strong> — Clientes com consultas nos últimos 30 dias</li>
                                    <li><strong>Agendamentos do Mês</strong> — Quantas consultas estão marcadas este mês</li>
                                    <li><strong>Taxa de Retorno</strong> — Percentual de clientes que retornaram</li>
                                </ul>
                                <p>As métricas são atualizadas automaticamente em tempo real.</p>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">download</span> Exportar Relatório CSV</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p><strong>Passo a passo:</strong></p>
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Acesse o <strong>Dashboard</strong> pelo menu lateral</li>
                                    <li>Clique no botão <strong>"Exportar Relatório"</strong> no canto superior</li>
                                    <li>Um arquivo <strong>.CSV</strong> será baixado automaticamente</li>
                                    <li>Abra no Excel ou Google Sheets para análise detalhada</li>
                                </ol>
                                <p>O relatório inclui: total de clientes, clientes ativos, agendamentos do mês e taxa de retorno.</p>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">today</span> Consultas do Dia</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p>Na seção <strong>"Agenda de Hoje"</strong> você visualiza:</p>
                                <ul class="list-disc pl-5 space-y-1">
                                    <li>Todas as consultas marcadas para o dia atual</li>
                                    <li>Nome do cliente e horário</li>
                                    <li>Tipo de serviço agendado</li>
                                    <li>Status do agendamento (confirmado, pendente, cancelado)</li>
                                </ul>
                                <p>Clique em qualquer consulta para ver os detalhes completos.</p>
                            </div>
                        </details>
                    </div>`
            },
            agenda: {
                icon: 'calendar_today',
                title: 'Agenda — Agendamentos',
                content: `
                    <div class="space-y-4">
                        <p class="text-sm text-on-surface-variant leading-relaxed">Gerencie todos os agendamentos do estúdio. Crie, edite, cancele consultas e integre com o Google Calendar.</p>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden" open>
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">add_circle</span> Criar Novo Agendamento</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p><strong>Existem duas formas de criar um agendamento:</strong></p>
                                <p><em>Opção 1 — Botão rápido:</em></p>
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Clique no botão <strong>"Novo Agendamento"</strong> no menu lateral</li>
                                    <li>Selecione o cliente na lista</li>
                                    <li>Escolha a <strong>data</strong> e o <strong>horário</strong></li>
                                    <li>Informe o <strong>tipo de serviço</strong> (ex: Consulta, Retorno, Exame)</li>
                                    <li>Adicione observações se necessário</li>
                                    <li>Clique em <strong>"Agendar"</strong></li>
                                </ol>
                                <p class="mt-2"><em>Opção 2 — Pela página Agenda:</em></p>
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Vá em <strong>Agenda</strong> no menu lateral</li>
                                    <li>Clique no botão <strong>"+"</strong> ou no horário desejado</li>
                                    <li>Preencha os dados e confirme</li>
                                </ol>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">edit_calendar</span> Editar ou Cancelar Consulta</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Acesse a página <strong>Agenda</strong></li>
                                    <li>Localize a consulta desejada</li>
                                    <li>Clique no <strong>ícone de edição</strong> (lápis) para alterar dados</li>
                                    <li>Ou clique no <strong>ícone de cancelamento</strong> (X) para cancelar</li>
                                    <li>Confirme a ação na janela de confirmação</li>
                                </ol>
                                <p class="mt-2"><strong>Alterar status:</strong> Você pode marcar uma consulta como <em>Confirmada</em>, <em>Em andamento</em>, <em>Concluída</em> ou <em>Cancelada</em>.</p>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">event</span> Integração Google Calendar</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p>Cada agendamento pode ser adicionado ao seu <strong>Google Calendar</strong>:</p>
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Abra os detalhes de qualquer consulta agendada</li>
                                    <li>Clique no botão <strong>"Adicionar ao Google Calendar"</strong></li>
                                    <li>Uma nova aba abrirá com o evento pré-preenchido</li>
                                    <li>Confirme no Google Calendar para salvar</li>
                                </ol>
                                <p>O evento incluirá: nome do cliente, serviço, horário e duração.</p>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">filter_alt</span> Filtros da Agenda</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p>Use os filtros para organizar a visualização:</p>
                                <ul class="list-disc pl-5 space-y-1">
                                    <li><strong>Hoje</strong> — Mostra apenas as consultas de hoje</li>
                                    <li><strong>Esta Semana</strong> — Visão semanal completa</li>
                                    <li><strong>Este Mês</strong> — Visão mensal com todos os agendamentos</li>
                                    <li><strong>Status</strong> — Filtre por confirmados, pendentes ou cancelados</li>
                                </ul>
                            </div>
                        </details>
                    </div>`
            },
            clientes: {
                icon: 'group',
                title: 'Clientes — Gestão de Clientes',
                content: `
                    <div class="space-y-4">
                        <p class="text-sm text-on-surface-variant leading-relaxed">Cadastre, organize e acompanhe todos os seus clientes. Acesse perfis, histórico e comunique-se por WhatsApp.</p>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden" open>
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">person_add</span> Cadastrar Novo Cliente</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Acesse <strong>Clientes</strong> no menu lateral</li>
                                    <li>Clique no botão <strong>"Novo Cliente"</strong></li>
                                    <li>Preencha os dados obrigatórios:
                                        <ul class="list-disc pl-5 mt-1">
                                            <li><strong>Nome completo</strong> do cliente</li>
                                            <li><strong>E-mail</strong> para contato</li>
                                            <li><strong>Telefone/WhatsApp</strong></li>
                                            <li><strong>Data de nascimento</strong></li>
                                        </ul>
                                    </li>
                                    <li>Adicione informações extras: endereço, observações, alergias</li>
                                    <li>Clique em <strong>"Finalizar Registro"</strong></li>
                                </ol>
                                <p class="mt-2">O cliente ficará imediatamente disponível para agendamentos.</p>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">search</span> Buscar e Filtrar Clientes</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p><strong>Busca global</strong> (barra no topo):</p>
                                <ul class="list-disc pl-5 space-y-1">
                                    <li>Digite o nome, e-mail ou telefone do cliente</li>
                                    <li>Os resultados aparecem automaticamente após 2 caracteres</li>
                                    <li>Pressione <strong>Enter</strong> para buscar diretamente</li>
                                </ul>
                                <p class="mt-2"><strong>Filtros da página Clientes:</strong></p>
                                <ul class="list-disc pl-5 space-y-1">
                                    <li><strong>Todos</strong> — Lista completa de clientes</li>
                                    <li><strong>Ativos</strong> — Clientes com consultas recentes</li>
                                    <li><strong>Inativos</strong> — Clientes sem interação recente</li>
                                    <li><strong>VIP</strong> — Clientes marcados como prioritários</li>
                                </ul>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">chat</span> WhatsApp e Comunicação</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p>Comunique-se diretamente com seus clientes:</p>
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Abra o perfil do cliente (clique no card)</li>
                                    <li>Clique no <strong>ícone do WhatsApp</strong> (verde)</li>
                                    <li>O WhatsApp Web abrirá com uma mensagem pré-escrita</li>
                                    <li>Personalize a mensagem se necessário e envie</li>
                                </ol>
                                <p class="mt-2">Também é possível enviar e-mail diretamente clicando no ícone de e-mail.</p>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">table_chart</span> Exportar Lista de Clientes</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Na página <strong>Clientes</strong>, clique no botão <strong>"Exportar CSV"</strong></li>
                                    <li>Um arquivo <strong>.CSV</strong> será baixado com todos os dados</li>
                                    <li>O arquivo inclui: nome, e-mail, telefone, status e data de cadastro</li>
                                    <li>Abra no <strong>Excel</strong> ou <strong>Google Sheets</strong> para análise</li>
                                </ol>
                            </div>
                        </details>
                    </div>`
            },
            interacoes: {
                icon: 'forum',
                title: 'Interações — Registro de Atendimentos',
                content: `
                    <div class="space-y-4">
                        <p class="text-sm text-on-surface-variant leading-relaxed">Registre cada interação com seus clientes: consultas, telefonemas, mensagens e observações clínicas.</p>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden" open>
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">add_comment</span> Registrar Nova Interação</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Acesse <strong>Interações</strong> no menu lateral</li>
                                    <li>Clique em <strong>"Nova Interação"</strong></li>
                                    <li>Selecione o <strong>cliente</strong></li>
                                    <li>Escolha o <strong>tipo de interação</strong>:
                                        <ul class="list-disc pl-5 mt-1">
                                            <li>📞 <strong>Telefonema</strong></li>
                                            <li>💬 <strong>Mensagem</strong> (WhatsApp, SMS)</li>
                                            <li>🏥 <strong>Consulta Presencial</strong></li>
                                            <li>📧 <strong>E-mail</strong></li>
                                            <li>📝 <strong>Observação</strong></li>
                                        </ul>
                                    </li>
                                    <li>Descreva os detalhes da interação</li>
                                    <li>Clique em <strong>"Salvar"</strong></li>
                                </ol>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">history</span> Histórico de Interações</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p>O histórico completo de interações está disponível de duas formas:</p>
                                <ul class="list-disc pl-5 space-y-1">
                                    <li><strong>Página Interações</strong> — Lista cronológica de todas as interações</li>
                                    <li><strong>Perfil do Cliente</strong> — Histórico filtrado por cliente</li>
                                </ul>
                                <p class="mt-2">Use os filtros para buscar por tipo, data ou cliente específico.</p>
                            </div>
                        </details>
                    </div>`
            },
            inventario: {
                icon: 'inventory_2',
                title: 'Inventário — Controle de Estoque',
                content: `
                    <div class="space-y-4">
                        <p class="text-sm text-on-surface-variant leading-relaxed">Controle seus materiais, produtos e insumos. Receba alertas de estoque baixo e gere relatórios de consumo.</p>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden" open>
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">add_box</span> Adicionar Item ao Estoque</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Acesse <strong>Inventário</strong> no menu lateral</li>
                                    <li>Clique em <strong>"Novo Item"</strong></li>
                                    <li>Preencha:
                                        <ul class="list-disc pl-5 mt-1">
                                            <li><strong>Nome</strong> do produto/material</li>
                                            <li><strong>Categoria</strong> (ex: Material Clínico, Higiene, Escritório)</li>
                                            <li><strong>Quantidade</strong> atual em estoque</li>
                                            <li><strong>Quantidade Mínima</strong> (para alerta de estoque baixo)</li>
                                            <li><strong>Preço Unitário</strong> (opcional)</li>
                                        </ul>
                                    </li>
                                    <li>Clique em <strong>"Salvar"</strong></li>
                                </ol>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">warning</span> Alertas de Estoque Baixo</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p>O sistema monitora automaticamente seu estoque:</p>
                                <ul class="list-disc pl-5 space-y-1">
                                    <li>Quando a quantidade de um item fica <strong>igual ou abaixo do mínimo</strong>, um alerta é gerado</li>
                                    <li>Os alertas aparecem no <strong>ícone de notificações</strong> (sino) no topo</li>
                                    <li>Itens com estoque baixo ficam destacados em <strong>vermelho</strong> na lista</li>
                                    <li>Configure a quantidade mínima ao cadastrar/editar cada item</li>
                                </ul>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">print</span> Relatório de Consumo (PDF)</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Na página <strong>Inventário</strong>, clique em <strong>"Relatório"</strong></li>
                                    <li>Uma nova janela abrirá com o relatório formatado</li>
                                    <li>O relatório inclui:
                                        <ul class="list-disc pl-5 mt-1">
                                            <li>Resumo geral (total de itens, valor do estoque)</li>
                                            <li>Itens com estoque baixo (alertas)</li>
                                            <li>Tabela detalhada de todos os produtos</li>
                                        </ul>
                                    </li>
                                    <li>Use <strong>Ctrl+P</strong> para imprimir ou salvar como PDF</li>
                                </ol>
                            </div>
                        </details>
                    </div>`
            },
            config: {
                icon: 'settings',
                title: 'Configurações — Personalização',
                content: `
                    <div class="space-y-4">
                        <p class="text-sm text-on-surface-variant leading-relaxed">Configure sua clínica, serviços, horários de funcionamento, agendamento online e pagamentos.</p>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden" open>
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">store</span> Dados do estúdio</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p>Na aba <strong>"Dados da Empresa"</strong>, configure:</p>
                                <ul class="list-disc pl-5 space-y-1">
                                    <li><strong>Nome do estúdio/consultório</strong></li>
                                    <li><strong>Endereço</strong> e dados de contato</li>
                                    <li><strong>Segmento de atuação</strong></li>
                                </ul>
                                <p class="mt-2">Após preencher, clique em <strong>"Salvar Configurações"</strong> no final da página.</p>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">medical_services</span> Serviços e Duração</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p>Na aba <strong>"Moeda e Serviço"</strong>:</p>
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Defina a <strong>moeda</strong> (R$ BRL é o padrão)</li>
                                    <li>Selecione a <strong>duração padrão</strong> das consultas (15, 30, 45 ou 60 minutos)</li>
                                    <li>O botão selecionado ficará destacado em verde</li>
                                    <li>Salve para aplicar em novos agendamentos</li>
                                </ol>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">link</span> Agendamento Online (Booking)</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p>Seus clientes podem agendar online pela página de booking:</p>
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Na aba <strong>"Booking & Pagamento"</strong>, configure seu <strong>slug</strong> (ex: <code>studiobeauty</code>)</li>
                                    <li>O link de agendamento será: <code>clientehubclin.web.app/booking/seu-slug</code></li>
                                    <li>Gere um <strong>QR Code</strong> para divulgar o link</li>
                                    <li>Baixe o QR Code e imprima para usar no estúdio</li>
                                    <li>Clientes acessam, escolhem serviço, data e horário</li>
                                </ol>
                                <p class="mt-2"><strong>Compartilhe o link</strong> nas redes sociais, WhatsApp e receituários.</p>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">payments</span> Pagamento Online</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p>Aceite pagamentos online via <strong>MercadoPago</strong>:</p>
                                <ol class="list-decimal pl-5 space-y-1">
                                    <li>Na aba <strong>"Booking & Pagamento"</strong>, ative a opção de pagamento</li>
                                    <li>Insira sua <strong>chave de API do MercadoPago</strong></li>
                                    <li>Clientes poderão pagar pela consulta no ato do agendamento</li>
                                    <li>O comprovante fica registrado automaticamente no sistema</li>
                                </ol>
                                <p class="mt-2">Para obter sua chave API, acesse: <strong>mercadopago.com.br → Configurações → Credenciais</strong></p>
                            </div>
                        </details>

                        <details class="group bg-surface-container-high rounded-xl overflow-hidden">
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">notifications_active</span> Notificações e Lembretes</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-2">
                                <p>Na aba <strong>"Notificações e Lembretes"</strong>:</p>
                                <ul class="list-disc pl-5 space-y-1">
                                    <li>Ative lembretes de consulta por e-mail para clientes</li>
                                    <li>Personalize a mensagem de lembrete</li>
                                    <li>Defina o tempo de antecedência (24h antes, por exemplo)</li>
                                </ul>
                                <p class="mt-2">O sistema também gera alertas internos para estoque baixo e agenda do dia.</p>
                            </div>
                        </details>
                    </div>`
            },
            suporte: {
                icon: 'support_agent',
                title: 'Suporte & FAQ',
                content: `
                    <div class="space-y-4">
                        <details class="group bg-surface-container-high rounded-xl overflow-hidden" open>
                            <summary class="px-5 py-4 cursor-pointer font-bold text-sm text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
                                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-base">quiz</span> Perguntas Frequentes</span>
                                <span class="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div class="px-5 pb-4 text-sm text-on-surface-variant space-y-3">
                                <div class="border-b border-outline-variant/10 pb-3">
                                    <p class="font-bold text-on-surface">Meus dados estão seguros?</p>
                                    <p class="mt-1">Sim! Utilizamos o <strong>Firebase</strong> do Google, que oferece criptografia de ponta a ponta, backups automáticos e infraestrutura de nível empresarial.</p>
                                </div>
                                <div class="border-b border-outline-variant/10 pb-3">
                                    <p class="font-bold text-on-surface">Posso acessar de qualquer dispositivo?</p>
                                    <p class="mt-1">Sim! O sistema é <strong>100% responsivo</strong> e funciona em computadores, tablets e celulares. Basta acessar pelo navegador.</p>
                                </div>
                                <div class="border-b border-outline-variant/10 pb-3">
                                    <p class="font-bold text-on-surface">Como recuperar minha senha?</p>
                                    <p class="mt-1">Na tela de login, clique em <strong>"Esqueceu a senha?"</strong>. Insira seu e-mail e você receberá um link de redefinição em alguns minutos.</p>
                                </div>
                                <div class="border-b border-outline-variant/10 pb-3">
                                    <p class="font-bold text-on-surface">Quantos clientes posso cadastrar?</p>
                                    <p class="mt-1">Não há limite! Cadastre quantos clientes forem necessários. O sistema é escalável e mantém a performance.</p>
                                </div>
                                <div class="border-b border-outline-variant/10 pb-3">
                                    <p class="font-bold text-on-surface">É possível ter mais de um usuário?</p>
                                    <p class="mt-1">Sim! Cada membro da equipe pode ter seu próprio login. O administrador gerencia acessos na área de Configurações.</p>
                                </div>
                                <div>
                                    <p class="font-bold text-on-surface">Como faço backup dos meus dados?</p>
                                    <p class="mt-1">Os dados são salvos automaticamente na nuvem em tempo real. Você também pode exportar relatórios em CSV a qualquer momento pelo Dashboard ou Clientes.</p>
                                </div>
                            </div>
                        </details>

                        <div class="bg-primary/5 border border-primary/10 rounded-xl p-5">
                            <h4 class="font-bold text-base text-on-surface flex items-center gap-2 mb-3">
                                <span class="material-symbols-outlined text-primary text-lg">headset_mic</span>
                                Precisa de mais ajuda?
                            </h4>
                            <p class="text-sm text-on-surface-variant mb-4">Nossa equipe está pronta para ajudar. Entre em contato:</p>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <a href="mailto:contato@connectai.app.br" class="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl hover:bg-surface-container transition-colors no-underline">
                                    <span class="material-symbols-outlined text-primary">email</span>
                                    <div>
                                        <p class="font-bold text-xs text-on-surface">E-mail</p>
                                        <p class="text-[11px] text-on-surface-variant">contato@connectai.app.br</p>
                                    </div>
                                </a>
                                <a href="https://wa.me/5537991208394" target="_blank" class="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl hover:bg-surface-container transition-colors no-underline">
                                    <span class="material-symbols-outlined text-green-600">chat</span>
                                    <div>
                                        <p class="font-bold text-xs text-on-surface">WhatsApp</p>
                                        <p class="text-[11px] text-on-surface-variant">(37) 99120-8394</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div class="bg-surface-container-high rounded-xl p-4 text-center">
                            <p class="text-xs text-on-surface-variant">
                                <strong>Connectai</strong> — Soluções Digitais<br>
                                <span class="text-[10px]">Tecnologia que conecta você ao sucesso ✨</span>
                            </p>
                        </div>
                    </div>`
            }
        };

        const tabKeys = Object.keys(helpSections);
        const activeTab = tabKeys.includes(initialTab) ? initialTab : 'inicio';

        const renderTabs = () => tabKeys.map(key => {
            const s = helpSections[key];
            const isActive = key === activeTab;
            return `<button onclick="App.switchHelpTab('${key}')" class="help-tab flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${isActive ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'}">
                <span class="material-symbols-outlined text-base">${s.icon}</span>
                <span class="hidden sm:inline">${s.title.split(' — ')[0]}</span>
            </button>`;
        }).join('');

        const activeSection = helpSections[activeTab];

        modal.innerHTML = `
        <div class="p-6 md:p-8 max-h-[85vh] overflow-hidden flex flex-col">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-headline font-bold text-2xl flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">menu_book</span>
                    Centro de Ajuda
                </h3>
                <span class="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase">v2.0</span>
            </div>

            <!-- Tabs -->
            <div class="flex gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-outline-variant/10 scrollbar-hide" id="help-tabs">
                ${renderTabs()}
            </div>

            <!-- Tab Content -->
            <div class="flex-1 overflow-y-auto pr-1" id="help-tab-content">
                <h4 class="font-headline font-bold text-lg mb-3 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">${activeSection.icon}</span>
                    ${activeSection.title}
                </h4>
                ${activeSection.content}
            </div>

            <div class="flex justify-end pt-4 mt-4 border-t border-outline-variant/10">
                <button type="button" onclick="App.closeModal()" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl">Fechar</button>
            </div>
        </div>`;
        App.openModal();
    },

    switchHelpTab(tab) {
        App.showHelpModal(tab);
    },

    // === Global Search ===
    async globalSearch(query) {
        try {
            const clients = await Store.getClients();
            const q = query.toLowerCase();
            const results = clients.filter(c =>
                (c.name || '').toLowerCase().includes(q) ||
                (c.email || '').toLowerCase().includes(q) ||
                (c.phone || '').toLowerCase().includes(q)
            );

            if (results.length === 0) {
                App.showToast('Nenhum resultado para "' + query + '".', 'info');
                return;
            }

            // Navigate to clients page showing filtered results
            window.location.hash = '#/clients';
            setTimeout(() => {
                const grid = document.getElementById('clients-grid');
                if (grid) {
                    grid.innerHTML = results.map(c => ClientsPage.renderCard(c)).join('');
                    const pagination = document.getElementById('clients-pagination');
                    if (pagination) pagination.innerHTML = `<span>Busca: ${results.length} resultado(s) para "${query}"</span><button onclick="ClientsPage.loadClients('all')" class="text-primary font-bold hover:underline">Limpar busca</button>`;
                }
            }, 300);
        } catch (e) {
            App.showToast('Erro na busca: ' + e.message, 'error');
        }
    }
};

// === Bootstrap ===
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
