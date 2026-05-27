// === Invoices (NFS-e) Page — MVP/Demo ===
const InvoicesPage = {
    invoices: [],
    clients: [],
    filter: 'all',
    searchQuery: '',

    render() {
        return `
        <div class="max-w-6xl mx-auto space-y-6">
            <!-- Header -->
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">receipt_long</span>
                        Notas Fiscais
                    </h2>
                    <p class="text-on-surface-variant mt-1">Emissão e controle de NFS-e — Nota Fiscal de Serviço Eletrônica</p>
                </div>
                <button onclick="InvoicesPage.showNewInvoiceModal()" class="px-5 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">add</span>
                    Nova Nota Fiscal
                </button>
            </div>

            <!-- Status Banner (Config pendente) -->
            <div id="nfse-config-banner"></div>

            <!-- Metrics Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div class="bg-surface-container-lowest rounded-xl p-4 md:p-5 shadow-sm ghost-border">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-primary text-lg">description</span>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Total Mês</span>
                    </div>
                    <p id="metric-total" class="text-2xl md:text-3xl font-extrabold text-on-surface">0</p>
                    <p class="text-xs text-on-surface-variant mt-1">notas emitidas</p>
                </div>
                <div class="bg-surface-container-lowest rounded-xl p-4 md:p-5 shadow-sm ghost-border">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Autorizadas</span>
                    </div>
                    <p id="metric-authorized" class="text-2xl md:text-3xl font-extrabold text-emerald-600">0</p>
                    <p class="text-xs text-on-surface-variant mt-1">aprovadas</p>
                </div>
                <div class="bg-surface-container-lowest rounded-xl p-4 md:p-5 shadow-sm ghost-border">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-amber-600 text-lg">pending</span>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Pendentes</span>
                    </div>
                    <p id="metric-pending" class="text-2xl md:text-3xl font-extrabold text-amber-600">0</p>
                    <p class="text-xs text-on-surface-variant mt-1">em processamento</p>
                </div>
                <div class="bg-surface-container-lowest rounded-xl p-4 md:p-5 shadow-sm ghost-border">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-primary text-lg">payments</span>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Valor Total</span>
                    </div>
                    <p id="metric-value" class="text-xl md:text-2xl font-extrabold text-on-surface">R$ 0</p>
                    <p class="text-xs text-on-surface-variant mt-1">faturado no mês</p>
                </div>
            </div>

            <!-- Filters + Search -->
            <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm ghost-border">
                <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="InvoicesPage.setFilter('all')" data-filter="all" class="inv-filter-btn px-4 py-2 rounded-lg text-xs font-bold transition-all">Todas</button>
                        <button onclick="InvoicesPage.setFilter('autorizada')" data-filter="autorizada" class="inv-filter-btn px-4 py-2 rounded-lg text-xs font-bold transition-all">Autorizadas</button>
                        <button onclick="InvoicesPage.setFilter('processando')" data-filter="processando" class="inv-filter-btn px-4 py-2 rounded-lg text-xs font-bold transition-all">Processando</button>
                        <button onclick="InvoicesPage.setFilter('rascunho')" data-filter="rascunho" class="inv-filter-btn px-4 py-2 rounded-lg text-xs font-bold transition-all">Rascunhos</button>
                        <button onclick="InvoicesPage.setFilter('cancelada')" data-filter="cancelada" class="inv-filter-btn px-4 py-2 rounded-lg text-xs font-bold transition-all">Canceladas</button>
                    </div>
                    <div class="flex-1 md:max-w-xs ml-auto">
                        <div class="relative">
                            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                            <input id="inv-search" type="text" class="w-full pl-10 pr-4 py-2.5 bg-surface-container-high border-none rounded-xl text-sm placeholder:text-outline/60" placeholder="Buscar por cliente ou número..."/>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Invoices List -->
            <div id="invoices-list" class="space-y-3">
                <div class="flex items-center justify-center py-16">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>`;
    },

    async init() {
        this.checkConfig();
        this.applyFilterStyles();

        // Search
        document.getElementById('inv-search')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderList();
        });

        // Load data
        await this.loadData();
    },

    checkConfig() {
        const settings = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        const banner = document.getElementById('nfse-config-banner');
        if (!banner) return;

        if (!settings.fiscalCnpj || !settings.fiscalInscMunicipal) {
            banner.innerHTML = `
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <span class="material-symbols-outlined text-amber-600 text-xl mt-0.5">warning</span>
                <div class="flex-1">
                    <p class="font-bold text-sm text-amber-800">Configuração Fiscal Pendente</p>
                    <p class="text-xs text-amber-700 mt-1">Para emitir notas fiscais reais, configure seus dados fiscais (CNPJ, Inscrição Municipal, API Focus NFe) nas <a href="#/settings" class="underline font-bold">Configurações</a>.</p>
                    <p class="text-[10px] text-amber-600 mt-2 flex items-center gap-1"><span class="material-symbols-outlined text-xs">info</span>Modo demonstração ativo — notas são simuladas</p>
                </div>
            </div>`;
        } else {
            const env = settings.fiscalEnvironment || 'homologacao';
            const envLabel = env === 'producao' ? '🟢 Produção' : '🟡 Homologação';
            banner.innerHTML = `
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                <span class="material-symbols-outlined text-emerald-600">verified</span>
                <p class="text-xs text-emerald-800 font-medium">Módulo fiscal configurado — Ambiente: <strong>${envLabel}</strong> | CNPJ: ${settings.fiscalCnpj}</p>
            </div>`;
        }
    },

    async loadData() {
        try {
            [this.invoices, this.clients] = await Promise.all([
                Store.getInvoices(),
                Store.getClients()
            ]);
            this.updateMetrics();
            this.renderList();
        } catch (e) {
            console.error('Erro ao carregar notas:', e);
            document.getElementById('invoices-list').innerHTML = `
                <div class="text-center py-12"><p class="text-on-surface-variant">Erro ao carregar notas fiscais.</p></div>`;
        }
    },

    updateMetrics() {
        const now = new Date();
        const monthInvoices = this.invoices.filter(inv => {
            const d = inv.createdAt?.toDate ? inv.createdAt.toDate() : new Date(inv.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const authorized = monthInvoices.filter(i => i.status === 'autorizada');
        const pending = monthInvoices.filter(i => i.status === 'processando' || i.status === 'rascunho');
        const totalValue = authorized.reduce((sum, i) => sum + (i.value || 0), 0);

        const el = (id) => document.getElementById(id);
        if (el('metric-total')) el('metric-total').textContent = monthInvoices.length;
        if (el('metric-authorized')) el('metric-authorized').textContent = authorized.length;
        if (el('metric-pending')) el('metric-pending').textContent = pending.length;
        if (el('metric-value')) el('metric-value').textContent = `R$ ${totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    },

    renderList() {
        const container = document.getElementById('invoices-list');
        if (!container) return;

        let filtered = this.invoices;
        if (this.filter !== 'all') {
            filtered = filtered.filter(i => i.status === this.filter);
        }
        if (this.searchQuery) {
            filtered = filtered.filter(i =>
                (i.clientName || '').toLowerCase().includes(this.searchQuery) ||
                (i.number || '').toLowerCase().includes(this.searchQuery)
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = `
            <div class="text-center py-16">
                <span class="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">receipt_long</span>
                <p class="font-bold text-on-surface/60 text-lg">Nenhuma nota fiscal encontrada</p>
                <p class="text-sm text-on-surface-variant mt-1">Clique em "Nova Nota Fiscal" para começar a emitir</p>
            </div>`;
            return;
        }

        container.innerHTML = filtered.map(inv => {
            const statusConfig = {
                rascunho: { color: 'bg-slate-100 text-slate-600', icon: 'edit_note', label: 'Rascunho' },
                processando: { color: 'bg-amber-100 text-amber-700', icon: 'hourglass_top', label: 'Processando' },
                autorizada: { color: 'bg-emerald-100 text-emerald-700', icon: 'check_circle', label: 'Autorizada' },
                rejeitada: { color: 'bg-red-100 text-red-700', icon: 'cancel', label: 'Rejeitada' },
                cancelada: { color: 'bg-red-50 text-red-500', icon: 'block', label: 'Cancelada' }
            };
            const st = statusConfig[inv.status] || statusConfig.rascunho;
            const date = inv.createdAt?.toDate ? inv.createdAt.toDate() : new Date(inv.createdAt);
            const dateStr = date.toLocaleDateString('pt-BR');

            return `
            <div class="bg-surface-container-lowest rounded-xl p-4 md:p-5 shadow-sm ghost-border hover:shadow-md transition-shadow cursor-pointer" onclick="InvoicesPage.showInvoiceDetail('${inv.id}')">
                <div class="flex items-center gap-4">
                    <div class="hidden md:flex w-12 h-12 rounded-xl bg-primary/10 items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-primary">${st.icon}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <p class="font-bold text-sm text-on-surface truncate">${inv.clientName || 'Cliente não informado'}</p>
                            <span class="px-2 py-0.5 ${st.color} rounded-full text-[10px] font-bold uppercase">${st.label}</span>
                        </div>
                        <div class="flex items-center gap-3 mt-1 flex-wrap">
                            <span class="text-xs text-on-surface-variant flex items-center gap-1">
                                <span class="material-symbols-outlined text-xs">tag</span>${inv.number || '---'}
                            </span>
                            <span class="text-xs text-on-surface-variant flex items-center gap-1">
                                <span class="material-symbols-outlined text-xs">medical_services</span>${inv.serviceDescription || 'Serviço'}
                            </span>
                            <span class="text-xs text-on-surface-variant flex items-center gap-1">
                                <span class="material-symbols-outlined text-xs">calendar_today</span>${dateStr}
                            </span>
                        </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                        <p class="font-extrabold text-lg text-on-surface">R$ ${(inv.value || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        <p class="text-[10px] text-on-surface-variant">ISS: R$ ${(inv.issValue || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    setFilter(f) {
        this.filter = f;
        this.applyFilterStyles();
        this.renderList();
    },

    applyFilterStyles() {
        document.querySelectorAll('.inv-filter-btn').forEach(btn => {
            if (btn.dataset.filter === this.filter) {
                btn.style.backgroundColor = '#0d7377';
                btn.style.color = '#ffffff';
                btn.classList.remove('bg-surface-container-high', 'text-on-surface-variant');
            } else {
                btn.style.backgroundColor = '';
                btn.style.color = '';
                btn.classList.add('bg-surface-container-high', 'text-on-surface-variant');
            }
        });
    },

    // === New Invoice Modal ===
    async showNewInvoiceModal() {
        const settings = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        const issRate = settings.fiscalIssRate || 5;
        const serviceCode = settings.fiscalServiceCode || '0601';

        // Load clients if not cached
        if (this.clients.length === 0) {
            this.clients = await Store.getClients();
        }

        const clientOptions = this.clients.map(c =>
            `<option value="${c.id}" data-name="${c.name}" data-email="${c.email || ''}" data-cpf="${c.cpf || ''}">${c.name}</option>`
        ).join('');

        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-6 md:p-8">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 rounded-xl vitality-gradient flex items-center justify-center">
                    <span class="material-symbols-outlined text-white text-2xl">receipt_long</span>
                </div>
                <div>
                    <h3 class="font-headline font-bold text-xl">Nova Nota Fiscal</h3>
                    <p class="text-xs text-on-surface-variant">NFS-e — Nota Fiscal de Serviço Eletrônica</p>
                </div>
            </div>

            <form id="invoice-form" class="space-y-5">
                <!-- Tomador (Cliente) -->
                <div class="bg-surface-container-high/50 rounded-xl p-4 space-y-4">
                    <h4 class="font-bold text-sm text-on-surface flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-base">person</span>
                        Dados do Tomador (Cliente)
                    </h4>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Cliente</label>
                        <select id="inv-client" class="w-full px-4 py-3 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface text-sm" required>
                            <option value="">Selecione um cliente...</option>
                            ${clientOptions}
                        </select>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">CPF / CNPJ</label>
                            <input type="text" id="inv-cpf" class="w-full px-4 py-3 bg-surface-container-lowest border-none rounded-xl text-on-surface text-sm" placeholder="000.000.000-00" maxlength="18"/>
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">E-mail</label>
                            <input type="email" id="inv-email" class="w-full px-4 py-3 bg-surface-container-lowest border-none rounded-xl text-on-surface text-sm" placeholder="email@cliente.com"/>
                        </div>
                    </div>
                </div>

                <!-- Serviço -->
                <div class="bg-surface-container-high/50 rounded-xl p-4 space-y-4">
                    <h4 class="font-bold text-sm text-on-surface flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-base">medical_services</span>
                        Dados do Serviço
                    </h4>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Descrição do Serviço</label>
                        <select id="inv-service" class="w-full px-4 py-3 bg-surface-container-lowest border-none rounded-xl text-on-surface text-sm" required>
                            <option value="Consulta Médica">Consulta Médica</option>
                            <option value="Retorno">Retorno</option>
                            <option value="Exame">Exame</option>
                            <option value="Procedimento">Procedimento</option>
                            <option value="Outro">Outro (especificar)</option>
                        </select>
                    </div>
                    <div id="inv-custom-service-wrapper" class="hidden">
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Especificar Serviço</label>
                        <input type="text" id="inv-custom-service" class="w-full px-4 py-3 bg-surface-container-lowest border-none rounded-xl text-on-surface text-sm" placeholder="Descreva o serviço prestado"/>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Código Serviço</label>
                            <input type="text" id="inv-service-code" value="${serviceCode}" class="w-full px-4 py-3 bg-surface-container-lowest border-none rounded-xl text-on-surface text-sm" placeholder="0601"/>
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Valor do Serviço (R$)</label>
                            <input type="number" id="inv-value" class="w-full px-4 py-3 bg-surface-container-lowest border-none rounded-xl text-on-surface text-sm font-bold" placeholder="0.00" step="0.01" min="0" required/>
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Alíquota ISS (%)</label>
                            <input type="number" id="inv-iss-rate" value="${issRate}" class="w-full px-4 py-3 bg-surface-container-lowest border-none rounded-xl text-on-surface text-sm" placeholder="5" step="0.01" min="0" max="100"/>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                        <span class="material-symbols-outlined text-blue-600 text-sm">calculate</span>
                        <span class="text-xs text-blue-800">ISS Calculado: <strong id="inv-iss-preview">R$ 0,00</strong></span>
                        <span class="text-xs text-blue-600 ml-auto">Valor Líquido: <strong id="inv-net-preview">R$ 0,00</strong></span>
                    </div>
                </div>

                <!-- Forma de Pagamento -->
                <div class="bg-surface-container-high/50 rounded-xl p-4">
                    <h4 class="font-bold text-sm text-on-surface flex items-center gap-2 mb-3">
                        <span class="material-symbols-outlined text-primary text-base">credit_card</span>
                        Forma de Pagamento
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2" id="payment-method-group">
                        ${['Pix', 'Cartão de Crédito', 'Débito', 'Dinheiro'].map(pm => `
                        <button type="button" class="pm-btn px-3 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-all" data-pm="${pm}">
                            ${pm === 'Pix' ? '🔑' : pm === 'Cartão de Crédito' ? '💳' : pm === 'Débito' ? '💰' : '💵'} ${pm}
                        </button>`).join('')}
                    </div>
                    <input type="hidden" id="inv-payment-method" value=""/>
                </div>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors">Cancelar</button>
                    <button type="button" onclick="InvoicesPage.saveAsDraft()" class="px-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-surface-container transition-colors flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">save</span>Salvar Rascunho
                    </button>
                    <button type="submit" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">send</span>Emitir NFS-e
                    </button>
                </div>
            </form>
        </div>`;
        App.openModal();

        // Event listeners
        document.getElementById('inv-service')?.addEventListener('change', (e) => {
            document.getElementById('inv-custom-service-wrapper').classList.toggle('hidden', e.target.value !== 'Outro');
        });

        document.getElementById('inv-client')?.addEventListener('change', (e) => {
            const opt = e.target.selectedOptions[0];
            if (opt) {
                document.getElementById('inv-cpf').value = opt.dataset.cpf || '';
                document.getElementById('inv-email').value = opt.dataset.email || '';
            }
        });

        // ISS calc
        const calcISS = () => {
            const value = parseFloat(document.getElementById('inv-value')?.value) || 0;
            const rate = parseFloat(document.getElementById('inv-iss-rate')?.value) || 0;
            const iss = value * (rate / 100);
            document.getElementById('inv-iss-preview').textContent = `R$ ${iss.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            document.getElementById('inv-net-preview').textContent = `R$ ${(value - iss).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        };
        document.getElementById('inv-value')?.addEventListener('input', calcISS);
        document.getElementById('inv-iss-rate')?.addEventListener('input', calcISS);

        // Forma de Pagamento
        document.getElementById('payment-method-group')?.addEventListener('click', e => {
            const btn = e.target.closest('.pm-btn');
            if (!btn) return;
            document.querySelectorAll('.pm-btn').forEach(b => {
                b.classList.remove('border-primary', 'text-primary', 'bg-primary/5');
                b.classList.add('border-outline-variant/30', 'text-on-surface-variant');
            });
            btn.classList.add('border-primary', 'text-primary', 'bg-primary/5');
            btn.classList.remove('border-outline-variant/30', 'text-on-surface-variant');
            const hidden = document.getElementById('inv-payment-method');
            if (hidden) hidden.value = btn.dataset.pm;
        });

        // CPF/CNPJ mask
        document.getElementById('inv-cpf')?.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length <= 11) {
                if (v.length > 9) v = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6,9)}-${v.slice(9)}`;
                else if (v.length > 6) v = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6)}`;
                else if (v.length > 3) v = `${v.slice(0,3)}.${v.slice(3)}`;
            } else {
                v = v.slice(0, 14);
                if (v.length > 12) v = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8,12)}-${v.slice(12)}`;
                else if (v.length > 8) v = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8)}`;
                else if (v.length > 5) v = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5)}`;
                else if (v.length > 2) v = `${v.slice(0,2)}.${v.slice(2)}`;
            }
            e.target.value = v;
        });

        // Form submit
        document.getElementById('invoice-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitInvoice('processando');
        });
    },

    getFormData() {
        const serviceSelect = document.getElementById('inv-service');
        const serviceDesc = serviceSelect?.value === 'Outro'
            ? (document.getElementById('inv-custom-service')?.value || 'Serviço')
            : (serviceSelect?.value || 'Consulta Médica');
        const clientSelect = document.getElementById('inv-client');
        const value = parseFloat(document.getElementById('inv-value')?.value) || 0;
        const issRate = parseFloat(document.getElementById('inv-iss-rate')?.value) || 0;

        return {
            clientId: clientSelect?.value || '',
            clientName: clientSelect?.selectedOptions[0]?.text || '',
            clientCpfCnpj: document.getElementById('inv-cpf')?.value || '',
            clientEmail: document.getElementById('inv-email')?.value || '',
            serviceDescription: serviceDesc,
            serviceCode: document.getElementById('inv-service-code')?.value || '0601',
            value: value,
            issRate: issRate,
            issValue: value * (issRate / 100),
            paymentMethod: document.getElementById('inv-payment-method')?.value || ''
        };
    },

    async saveAsDraft() {
        const data = this.getFormData();
        if (!data.clientId) { App.showToast('Selecione um cliente.', 'error'); return; }
        data.status = 'rascunho';
        data.number = this.generateNumber();
        await Store.addInvoice(data);
        App.closeModal();
        App.showToast('Rascunho salvo com sucesso! 📝', 'success');
        await this.loadData();
    },

    async submitInvoice(status = 'processando') {
        const data = this.getFormData();
        if (!data.clientId) { App.showToast('Selecione um cliente.', 'error'); return; }
        if (!data.value || data.value <= 0) { App.showToast('Informe o valor do serviço.', 'error'); return; }

        data.number = this.generateNumber();
        data.status = status;

        const id = await Store.addInvoice(data);

        // Simulação (MVP): após 2s, a nota é "autorizada"
        if (status === 'processando') {
            App.showToast('Nota fiscal enviada para processamento... ⏳', 'info');
            setTimeout(async () => {
                await Store.updateInvoice(id, {
                    status: 'autorizada',
                    focusRef: `NFSE-SIM-${Date.now()}`,
                    issuedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                App.showToast('✅ NFS-e Autorizada com sucesso!', 'success');
                await this.loadData();
            }, 2500);
        }

        App.closeModal();
        await this.loadData();
    },

    generateNumber() {
        const year = new Date().getFullYear();
        const seq = String(this.invoices.length + 1).padStart(4, '0');
        return `${year}/${seq}`;
    },

    // === Invoice Detail Modal ===
    showInvoiceDetail(id) {
        const inv = this.invoices.find(i => i.id === id);
        if (!inv) return;

        const statusConfig = {
            rascunho: { color: 'bg-slate-100 text-slate-600', label: 'Rascunho' },
            processando: { color: 'bg-amber-100 text-amber-700', label: 'Processando' },
            autorizada: { color: 'bg-emerald-100 text-emerald-700', label: 'Autorizada' },
            rejeitada: { color: 'bg-red-100 text-red-700', label: 'Rejeitada' },
            cancelada: { color: 'bg-red-50 text-red-500', label: 'Cancelada' }
        };
        const st = statusConfig[inv.status] || statusConfig.rascunho;
        const date = inv.createdAt?.toDate ? inv.createdAt.toDate() : new Date(inv.createdAt);
        const issuedDate = inv.issuedAt?.toDate ? inv.issuedAt.toDate().toLocaleDateString('pt-BR') : '—';

        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-6 md:p-8">
            <div class="flex items-start justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl vitality-gradient flex items-center justify-center">
                        <span class="material-symbols-outlined text-white text-2xl">receipt_long</span>
                    </div>
                    <div>
                        <h3 class="font-headline font-bold text-xl">NFS-e ${inv.number || ''}</h3>
                        <span class="px-3 py-1 ${st.color} rounded-full text-xs font-bold uppercase">${st.label}</span>
                    </div>
                </div>
                <button onclick="App.closeModal()" class="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div class="space-y-4">
                <!-- Tomador -->
                <div class="bg-surface-container-high/50 rounded-xl p-4">
                    <h4 class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-3">Tomador do Serviço</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div><span class="text-xs text-on-surface-variant">Nome:</span> <span class="text-sm font-bold text-on-surface">${inv.clientName}</span></div>
                        <div><span class="text-xs text-on-surface-variant">CPF/CNPJ:</span> <span class="text-sm font-bold text-on-surface">${inv.clientCpfCnpj || '—'}</span></div>
                        <div><span class="text-xs text-on-surface-variant">E-mail:</span> <span class="text-sm text-on-surface">${inv.clientEmail || '—'}</span></div>
                    </div>
                </div>

                <!-- Serviço -->
                <div class="bg-surface-container-high/50 rounded-xl p-4">
                    <h4 class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-3">Serviço Prestado</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div><span class="text-xs text-on-surface-variant">Descrição:</span> <span class="text-sm font-bold text-on-surface">${inv.serviceDescription}</span></div>
                        <div><span class="text-xs text-on-surface-variant">Código:</span> <span class="text-sm text-on-surface">${inv.serviceCode || '—'}</span></div>
                    </div>
                </div>

                <!-- Valores -->
                <div class="bg-primary/5 border border-primary/10 rounded-xl p-4">
                    <h4 class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-3">Valores</h4>
                    <div class="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p class="text-xs text-on-surface-variant">Valor Bruto</p>
                            <p class="text-lg font-extrabold text-on-surface">R$ ${(inv.value || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        </div>
                        <div>
                            <p class="text-xs text-on-surface-variant">ISS (${inv.issRate || 0}%)</p>
                            <p class="text-lg font-extrabold text-amber-600">R$ ${(inv.issValue || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        </div>
                        <div>
                            <p class="text-xs text-on-surface-variant">Valor Líquido</p>
                            <p class="text-lg font-extrabold text-emerald-600">R$ ${((inv.value || 0) - (inv.issValue || 0)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        </div>
                    </div>
                </div>

                <!-- Info -->
                <div class="grid grid-cols-2 gap-3 text-xs text-on-surface-variant">
                    <div>📅 Criada: <strong>${date.toLocaleDateString('pt-BR')}</strong></div>
                    <div>📋 Emitida: <strong>${issuedDate}</strong></div>
                    <div>🔗 Ref: <strong>${inv.focusRef || 'N/A (Simulada)'}</strong></div>
                    <div>🆔 ID: <strong class="text-[10px]">${inv.id}</strong></div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-2 pt-5 mt-5 border-t border-outline-variant/10">
                ${inv.status === 'rascunho' ? `
                    <button onclick="InvoicesPage.emitDraft('${inv.id}')" class="px-4 py-2.5 vitality-gradient text-white font-bold rounded-xl text-sm flex items-center gap-1.5 shadow-lg shadow-primary/20">
                        <span class="material-symbols-outlined text-sm">send</span>Emitir Nota
                    </button>` : ''}
                ${inv.status === 'autorizada' ? `
                    <button onclick="InvoicesPage.downloadPDF('${inv.id}')" class="px-4 py-2.5 bg-primary/10 text-primary font-bold rounded-xl text-sm flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">picture_as_pdf</span>Baixar PDF
                    </button>
                    <button onclick="InvoicesPage.resendEmail('${inv.id}')" class="px-4 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl text-sm flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">forward_to_inbox</span>Enviar por E-mail
                    </button>` : ''}
                ${inv.status !== 'cancelada' ? `
                    <button onclick="InvoicesPage.cancelInvoice('${inv.id}')" class="px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl text-sm flex items-center gap-1.5 ml-auto">
                        <span class="material-symbols-outlined text-sm">block</span>Cancelar
                    </button>` : ''}
                ${inv.status === 'rascunho' ? `
                    <button onclick="InvoicesPage.deleteInvoice('${inv.id}')" class="px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl text-sm flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">delete</span>Excluir
                    </button>` : ''}
            </div>
        </div>`;
        App.openModal();
    },

    // === Actions ===
    async emitDraft(id) {
        App.closeModal();
        App.showToast('Enviando nota para processamento... ⏳', 'info');
        await Store.updateInvoice(id, { status: 'processando' });
        await this.loadData();

        // Simulação
        setTimeout(async () => {
            await Store.updateInvoice(id, {
                status: 'autorizada',
                focusRef: `NFSE-SIM-${Date.now()}`,
                issuedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            App.showToast('✅ NFS-e Autorizada com sucesso!', 'success');
            await this.loadData();
        }, 2500);
    },

    async cancelInvoice(id) {
        if (!confirm('⚠️ Deseja realmente cancelar esta nota fiscal?\nEsta ação não pode ser desfeita.')) return;
        await Store.updateInvoice(id, { status: 'cancelada' });
        App.closeModal();
        App.showToast('Nota fiscal cancelada.', 'info');
        await this.loadData();
    },

    async deleteInvoice(id) {
        if (!confirm('🗑️ Excluir este rascunho permanentemente?')) return;
        await Store.deleteInvoice(id);
        App.closeModal();
        App.showToast('Rascunho excluído.', 'info');
        await this.loadData();
    },

    downloadPDF(id) {
        const inv = this.invoices.find(i => i.id === id);
        if (!inv) return;

        // Gerar PDF simulado
        const printWindow = window.open('', '_blank');
        const settings = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        const date = inv.issuedAt?.toDate ? inv.issuedAt.toDate() : new Date();

        printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="utf-8">
            <title>NFS-e ${inv.number}</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; }
                .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0d7377; padding-bottom: 16px; margin-bottom: 24px; }
                .logo { font-size: 24px; font-weight: 800; color: #0d7377; }
                .badge { display: inline-block; padding: 4px 12px; background: #d1fae5; color: #065f46; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                th { text-align: left; padding: 8px 12px; background: #f0f5f4; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
                td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                .total-row td { font-weight: 700; font-size: 16px; border-top: 2px solid #0d7377; background: #f0fffe; }
                .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
                .demo-banner { background: #fef3c7; border: 1px solid #fbbf24; padding: 8px 16px; border-radius: 8px; text-align: center; font-size: 11px; color: #92400e; margin-bottom: 20px; }
                @media print { .demo-banner { display: block; } body { padding: 20px; } }
            </style>
        </head>
        <body>
            <div class="demo-banner">⚠️ DOCUMENTO DEMONSTRATIVO — Sem validade fiscal (Modo MVP/Demo)</div>
            <div class="header">
                <div>
                    <div class="logo">${settings.company || 'Studiobeauty'}</div>
                    <p style="font-size:12px;color:#64748b;margin:4px 0">${settings.address || ''} ${settings.city ? '— ' + settings.city + '/' + settings.state : ''}</p>
                    <p style="font-size:12px;color:#64748b">${settings.phone || ''}</p>
                </div>
                <div style="text-align:right">
                    <p style="font-size:20px;font-weight:800">NFS-e</p>
                    <p style="font-size:14px;font-weight:600;color:#0d7377">${inv.number}</p>
                    <span class="badge">Autorizada</span>
                </div>
            </div>
            <h3 style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Tomador do Serviço</h3>
            <table>
                <tr><th>Nome</th><th>CPF/CNPJ</th><th>E-mail</th></tr>
                <tr><td>${inv.clientName}</td><td>${inv.clientCpfCnpj || '—'}</td><td>${inv.clientEmail || '—'}</td></tr>
            </table>
            <h3 style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Serviço Prestado</h3>
            <table>
                <tr><th>Descrição</th><th>Código</th><th style="text-align:right">Valor</th></tr>
                <tr><td>${inv.serviceDescription}</td><td>${inv.serviceCode || '0601'}</td><td style="text-align:right">R$ ${(inv.value || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td></tr>
                <tr><td colspan="2" style="text-align:right;color:#64748b">ISS (${inv.issRate || 0}%)</td><td style="text-align:right;color:#b45309">- R$ ${(inv.issValue || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td></tr>
                <tr class="total-row"><td colspan="2" style="text-align:right">VALOR LÍQUIDO</td><td style="text-align:right;color:#0d7377">R$ ${((inv.value || 0) - (inv.issValue || 0)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td></tr>
            </table>
            <div style="margin-top:24px;font-size:11px;color:#64748b">
                <p>Data de Emissão: ${date.toLocaleDateString('pt-BR')} | Referência: ${inv.focusRef || 'N/A'}</p>
            </div>
            <div class="footer">
                <p>Documento gerado pelo sistema ClienteHub — ${settings.company || 'Studiobeauty'}</p>
                <p>Este documento é uma demonstração. Para emissão válida, configure a integração com a Focus NFe.</p>
            </div>
        </body>
        </html>`);
        printWindow.document.close();
        App.showToast('PDF gerado! Use Ctrl+P para imprimir. 📄', 'success');
    },

    resendEmail(id) {
        const inv = this.invoices.find(i => i.id === id);
        if (!inv || !inv.clientEmail) {
            App.showToast('Cliente sem e-mail cadastrado.', 'error');
            return;
        }
        const subject = encodeURIComponent(`NFS-e ${inv.number} — ${inv.serviceDescription}`);
        const body = encodeURIComponent(`Prezado(a) ${inv.clientName},\n\nSegue a Nota Fiscal de Serviço referente ao serviço "${inv.serviceDescription}" no valor de R$ ${(inv.value||0).toFixed(2)}.\n\nNúmero da NFS-e: ${inv.number}\nData: ${new Date().toLocaleDateString('pt-BR')}\n\nAtenciosamente,\nStudiobeauty`);
        window.open(`mailto:${inv.clientEmail}?subject=${subject}&body=${body}`, '_blank');
        App.showToast('E-mail aberto para envio! 📧', 'success');
    }
};
