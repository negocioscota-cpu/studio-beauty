// === Clients Page ===
const ClientsPage = {
    selectedIds: new Set(),
    allClients: [],
    currentFilter: 'all',

    render() {
        return `
        <div class="space-y-6 max-w-[1400px] mobile-full-width mx-auto">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p class="text-sm text-on-surface-variant mb-1">Menu › <span class="text-primary font-semibold">Clientes</span></p>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight">Clientes</h2>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                    <!-- 1. Import/Export -->
                    <button id="btn-import-csv" class="px-4 py-2.5 bg-surface-container-low text-on-surface-variant rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-surface-container transition-colors">
                        <span class="material-symbols-outlined text-lg">upload_file</span>CSV
                    </button>
                    <button id="btn-import-phone" class="px-4 py-2.5 bg-surface-container-low text-on-surface-variant rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-surface-container transition-colors">
                        <span class="material-symbols-outlined text-lg">contacts</span>Celular
                    </button>
                    <button id="btn-export-csv" class="px-4 py-2.5 bg-surface-container-low text-on-surface-variant rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-surface-container transition-colors">
                        <span class="material-symbols-outlined text-lg">file_download</span>Exportar
                    </button>
                    <input type="file" id="csv-file-input" accept=".csv,.xlsx,.xls" class="hidden" />
                    <a href="#/clients/new" class="px-5 py-2.5 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">person_add</span>Novo Cliente
                    </a>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex items-center gap-3 flex-wrap">
                <button class="filter-btn active px-4 py-2 rounded-full text-xs font-bold transition-all" data-filter="all">Todos</button>
                <button class="filter-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-filter="active">Ativos</button>
                <button class="filter-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-filter="prospect">Prospectos</button>
                <button class="filter-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-filter="inactive">Inativos</button>
                <!-- 2. Tag filter buttons -->
                <div id="tag-filters" class="flex items-center gap-2 ml-1"></div>
                <div class="ml-auto flex items-center gap-2">
                    <button id="btn-manage-tags" class="px-3 py-2 bg-surface-container-low text-on-surface-variant rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-surface-container" title="Gerenciar Tags">
                        <span class="material-symbols-outlined text-base">sell</span>Tags
                    </button>
                    <button id="btn-advanced-filters" class="px-3 py-2 bg-surface-container-low text-on-surface-variant rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-surface-container">
                        <span class="material-symbols-outlined text-base">tune</span>Filtros
                    </button>
                </div>
            </div>

            <!-- Bulk Actions Bar -->
            <div id="bulk-bar" class="hidden sticky top-0 z-30 bg-primary/95 backdrop-blur-sm text-white rounded-2xl px-6 py-3 flex items-center justify-between shadow-xl shadow-primary/20 animate-slide-down">
                <div class="flex items-center gap-3">
                    <input type="checkbox" id="bulk-select-all" class="w-4 h-4 accent-white cursor-pointer" />
                    <span id="bulk-count" class="font-bold text-sm">0 selecionado(s)</span>
                </div>
                <div class="flex items-center gap-2">
                    <button id="bulk-set-active" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">check_circle</span>Ativar
                    </button>
                    <button id="bulk-set-inactive" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">pause_circle</span>Inativar
                    </button>
                    <button id="bulk-set-prospect" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">person_search</span>Prospecto
                    </button>
                    <div class="w-px h-6 bg-white/30 mx-1"></div>
                    <button id="bulk-delete" class="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">delete</span>Excluir
                    </button>
                    <button id="bulk-cancel" class="px-3 py-1.5 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors">
                        <span class="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            </div>

            <!-- Client Cards Grid -->
            <div id="clients-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                ${ClientsPage.renderSkeletons()}
            </div>

            <div id="clients-pagination" class="flex items-center justify-between text-sm text-on-surface-variant"></div>
        </div>

        <!-- Side Drawer -->
        <div id="drawer-overlay" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 hidden opacity-0 transition-opacity duration-300"></div>
        <div id="drawer-panel" class="fixed top-0 right-0 h-full w-full max-w-md bg-surface z-50 shadow-2xl translate-x-full transition-transform duration-300 overflow-y-auto">
            <div id="drawer-content" class="p-6"></div>
        </div>`;
    },

    renderSkeletons() {
        const s = `
        <div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 animate-pulse">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-slate-200"></div>
                    <div class="space-y-2"><div class="h-4 w-28 bg-slate-200 rounded-lg"></div><div class="h-3 w-36 bg-slate-100 rounded-lg"></div></div>
                </div>
                <div class="h-5 w-16 bg-slate-200 rounded-full"></div>
            </div>
            <div class="h-3 w-32 bg-slate-100 rounded-lg mb-3"></div>
            <div class="h-3 w-24 bg-slate-100 rounded-lg mb-4"></div>
            <div class="pt-4 border-t border-outline-variant/10 flex justify-between">
                <div class="h-4 w-20 bg-slate-200 rounded-lg"></div>
                <div class="h-5 w-5 bg-slate-100 rounded"></div>
            </div>
        </div>`;
        return s.repeat(6);
    },

    async init() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active', 'vitality-gradient', 'text-white');
                    b.classList.add('bg-surface-container-low', 'text-on-surface-variant');
                });
                btn.classList.add('active', 'vitality-gradient', 'text-white');
                btn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
                ClientsPage.currentFilter = btn.dataset.filter;
                ClientsPage.loadClients(btn.dataset.filter);
            });
        });

        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) {
            activeBtn.classList.add('vitality-gradient', 'text-white');
            activeBtn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
        }

        // 1. Import CSV
        document.getElementById('btn-import-csv')?.addEventListener('click', () => {
            document.getElementById('csv-file-input').click();
        });
        document.getElementById('csv-file-input')?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) ClientsPage.importCSV(e.target.files[0]);
        });

        // 1. Export CSV
        document.getElementById('btn-export-csv')?.addEventListener('click', () => ClientsPage.exportCSV());

        // Import from Phone
        document.getElementById('btn-import-phone')?.addEventListener('click', () => ClientsPage.importFromPhone());

        // 2. Manage Tags
        document.getElementById('btn-manage-tags')?.addEventListener('click', () => ClientsPage.openTagManager());

        // Advanced Filters
        document.getElementById('btn-advanced-filters')?.addEventListener('click', () => {
            const modal = document.getElementById('modal-content');
            modal.innerHTML = `
            <div class="p-8">
                <h3 class="font-headline font-bold text-2xl mb-2">Filtros Avançados</h3>
                <p class="text-on-surface-variant text-sm mb-6">Busque clientes por nome, e-mail ou serviço.</p>
                <form id="adv-filter-form" class="space-y-4">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Buscar por Nome ou E-mail</label>
                        <input type="text" id="adv-search" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="Digite para buscar..."/>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Tag</label>
                        <input type="text" id="adv-tag" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="Ex: VIP, Fiel..."/>
                    </div>
                    <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                        <button type="button" onclick="App.closeModal()" class="px-6 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors">Cancelar</button>
                        <button type="submit" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2">
                            <span class="material-symbols-outlined">search</span>Buscar
                        </button>
                    </div>
                </form>
            </div>`;
            App.openModal();
            document.getElementById('adv-filter-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const st = document.getElementById('adv-search').value.toLowerCase();
                const tag = document.getElementById('adv-tag').value.toLowerCase();
                App.closeModal();
                const filtered = ClientsPage.allClients.filter(c => {
                    const matchName = !st || (c.name || '').toLowerCase().includes(st) || (c.email || '').toLowerCase().includes(st);
                    const matchTag = !tag || (c.tags || []).some(t => t.toLowerCase().includes(tag));
                    return matchName && matchTag;
                });
                ClientsPage.renderClients(filtered);
                App.showToast(filtered.length + ' cliente(s) encontrado(s).', 'info');
            });
        });

        // Bulk actions
        document.getElementById('bulk-select-all')?.addEventListener('change', (e) => {
            document.querySelectorAll('.client-checkbox').forEach(cb => {
                cb.checked = e.target.checked;
                if (e.target.checked) ClientsPage.selectedIds.add(cb.dataset.id);
                else ClientsPage.selectedIds.delete(cb.dataset.id);
            });
            ClientsPage.updateBulkBar();
        });
        document.getElementById('bulk-set-active')?.addEventListener('click', () => ClientsPage.bulkSetStatus('active'));
        document.getElementById('bulk-set-inactive')?.addEventListener('click', () => ClientsPage.bulkSetStatus('inactive'));
        document.getElementById('bulk-set-prospect')?.addEventListener('click', () => ClientsPage.bulkSetStatus('prospect'));
        document.getElementById('bulk-delete')?.addEventListener('click', () => ClientsPage.bulkDelete());
        document.getElementById('bulk-cancel')?.addEventListener('click', () => {
            ClientsPage.selectedIds.clear();
            document.querySelectorAll('.client-checkbox').forEach(cb => cb.checked = false);
            document.getElementById('bulk-select-all').checked = false;
            ClientsPage.updateBulkBar();
        });

        document.getElementById('drawer-overlay')?.addEventListener('click', () => ClientsPage.closeDrawer());

        await this.loadClients('all');
    },

    async loadClients(filter = 'all') {
        const grid = document.getElementById('clients-grid');
        this.selectedIds.clear();
        this.updateBulkBar();

        try {
            const clients = await Store.getClients();
            // 5. Enrich with last interaction data
            const interactions = await Store.getInteractions().catch(() => []);
            clients.forEach(c => {
                const clientInteractions = interactions.filter(i => i.clientName === c.name || i.clientId === c.id);
                if (clientInteractions.length > 0) {
                    const latest = clientInteractions.sort((a, b) => {
                        const da = a.date?.seconds || 0;
                        const db = b.date?.seconds || 0;
                        return db - da;
                    })[0];
                    c._lastInteraction = latest.date?.seconds ? new Date(latest.date.seconds * 1000) : null;
                }
            });

            this.allClients = clients;
            const filtered = filter === 'all' ? clients : clients.filter(c => c.status === filter);
            this.renderClients(filtered);
            this.renderTagFilters();
        } catch (e) {
            grid.innerHTML = `<div class="col-span-full text-center py-12 text-error"><p>Erro ao carregar clientes.</p></div>`;
            console.error(e);
        }
    },

    // 2. Tag filter pills
    renderTagFilters() {
        const container = document.getElementById('tag-filters');
        if (!container) return;
        const allTags = new Set();
        this.allClients.forEach(c => (c.tags || []).forEach(t => allTags.add(t)));
        if (allTags.size === 0) { container.innerHTML = ''; return; }

        const tagColors = { VIP: 'bg-amber-100 text-amber-800', Fiel: 'bg-emerald-100 text-emerald-800', 'Pós-operatório': 'bg-purple-100 text-purple-800' };

        container.innerHTML = [...allTags].slice(0, 5).map(tag => {
            const cls = tagColors[tag] || 'bg-indigo-100 text-indigo-800';
            return `<button class="tag-filter-btn px-3 py-1 rounded-full text-[10px] font-bold ${cls} hover:opacity-80 transition-opacity" data-tag="${tag}">${tag}</button>`;
        }).join('');

        container.querySelectorAll('.tag-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                const filtered = this.allClients.filter(c => (c.tags || []).includes(tag));
                this.renderClients(filtered);
                App.showToast(`Filtrando por tag "${tag}": ${filtered.length} cliente(s).`, 'info');
            });
        });
    },

    renderClients(filtered) {
        const grid = document.getElementById('clients-grid');

        if (filtered.length === 0) {
            grid.innerHTML = `
            <div class="col-span-full bg-surface-container-lowest rounded-2xl p-10 border-2 border-dashed border-outline-variant/20 text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <span class="material-symbols-outlined text-3xl text-primary/40">group_off</span>
                </div>
                <p class="font-bold text-on-surface text-lg mb-1">Nenhum cliente encontrado</p>
                <p class="text-on-surface-variant text-sm mb-5">Comece adicionando ou importando clientes.</p>
                <div class="flex items-center gap-3 justify-center">
                    <a href="#/clients/new" class="px-5 py-2.5 vitality-gradient text-white font-bold rounded-xl inline-flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">person_add</span>Adicionar
                    </a>
                    <button onclick="document.getElementById('csv-file-input').click()" class="px-5 py-2.5 border-2 border-primary/30 text-primary font-bold rounded-xl inline-flex items-center gap-2 text-sm hover:bg-primary/5">
                        <span class="material-symbols-outlined text-lg">upload_file</span>Importar CSV
                    </button>
                </div>
            </div>`;
            document.getElementById('clients-pagination').innerHTML = '';
            return;
        }

        grid.innerHTML = filtered.map(c => this.renderCard(c)).join('') + `
        <a href="#/clients/new" class="border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center py-12 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
            <span class="material-symbols-outlined text-4xl text-outline-variant group-hover:text-primary transition-colors">add</span>
            <h4 class="font-bold text-on-surface-variant mt-3 group-hover:text-primary">Novo Cliente</h4>
        </a>`;

        // Attach listeners
        document.querySelectorAll('.client-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                e.stopPropagation();
                if (cb.checked) ClientsPage.selectedIds.add(cb.dataset.id);
                else ClientsPage.selectedIds.delete(cb.dataset.id);
                ClientsPage.updateBulkBar();
            });
        });
        document.querySelectorAll('.btn-quick-view').forEach(btn => {
            btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); ClientsPage.openDrawer(btn.dataset.id); });
        });

        document.getElementById('clients-pagination').innerHTML = `<span>Exibindo ${filtered.length} de ${this.allClients.length} clientes</span>`;
    },

    renderCard(client) {
        const statusMap = {
            active:   { label: 'ATIVO',     bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
            prospect: { label: 'PROSPECTO', bg: 'bg-blue-100',    text: 'text-blue-800',    dot: 'bg-blue-500' },
            inactive: { label: 'INATIVO',   bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400' }
        };
        const s = statusMap[client.status] || statusMap.active;
        const initials = (client.name || 'C').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const checked = this.selectedIds.has(client.id) ? 'checked' : '';

        // 5. Last interaction days
        let lastInteractionHtml = '';
        if (client._lastInteraction) {
            const days = Math.floor((Date.now() - client._lastInteraction.getTime()) / 86400000);
            const color = days > 30 ? 'text-red-600 bg-red-50' : days > 14 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';
            lastInteractionHtml = `<span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${color}" title="Última interação">${days === 0 ? 'Hoje' : days + 'd atrás'}</span>`;
        } else if (client.createdAt) {
            lastInteractionHtml = `<span class="text-[10px] px-2 py-0.5 rounded-full font-bold text-slate-500 bg-slate-50">Sem interação</span>`;
        }

        // 4. Lead Score for prospects
        let leadScoreHtml = '';
        if (client.status === 'prospect') {
            const score = client.leadScore || 0;
            const barColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-400';
            const label = score >= 70 ? 'Quente' : score >= 40 ? 'Morno' : 'Frio';
            leadScoreHtml = `
            <div class="flex items-center gap-2 mt-1" title="Lead Score: ${score}%">
                <div class="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div class="${barColor} h-full rounded-full transition-all" style="width:${score}%"></div></div>
                <span class="text-[10px] font-bold ${score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-red-500'}">${label} ${score}%</span>
            </div>`;
        }

        // 2. Tags
        const tagColors = { VIP: 'bg-amber-400 text-white', Fiel: 'bg-emerald-500 text-white', 'Pós-operatório': 'bg-purple-500 text-white', Novo: 'bg-blue-500 text-white' };
        const tags = (client.tags || []).slice(0, 3).map(tag => {
            const tc = tagColors[tag] || 'bg-indigo-500 text-white';
            return `<span class="text-[9px] px-1.5 py-0.5 rounded font-bold ${tc}">${tag}</span>`;
        }).join('');

        // 3. WhatsApp
        const phone = (client.phone || '').replace(/\D/g, '');
        const whatsappLink = phone ? `https://wa.me/55${phone}?text=${encodeURIComponent('Olá ' + (client.name || '') + '! Tudo bem? Entrando em contato pela Studiobeauty.')}` : '';

        return `
        <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 hover:shadow-lg hover:border-primary/15 transition-all relative group">
            <div class="absolute top-3 left-3 z-10">
                <input type="checkbox" class="client-checkbox w-4 h-4 accent-primary cursor-pointer rounded" data-id="${client.id}" ${checked} />
            </div>
            <div class="p-5 pl-10">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-3">
                        <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">${initials}</div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-1.5">
                                <h4 class="font-extrabold text-on-surface text-sm truncate">${client.name || 'Sem nome'}</h4>
                                ${whatsappLink ? `<a href="${whatsappLink}" target="_blank" class="text-green-500 hover:text-green-600 transition-colors shrink-0" title="Abrir WhatsApp"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>` : ''}
                            </div>
                            <p class="text-[11px] text-on-surface-variant truncate">${client.email || ''}</p>
                        </div>
                    </div>
                    <span class="${s.bg} ${s.text} text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                        <span class="w-1.5 h-1.5 rounded-full ${s.dot}"></span>${s.label}
                    </span>
                </div>

                ${tags ? `<div class="flex items-center gap-1 mb-1.5">${tags}</div>` : ''}

                <div class="flex items-center gap-2 flex-wrap mb-1">
                    ${client.phone ? `<span class="text-[11px] text-on-surface-variant"><span class="material-symbols-outlined text-xs align-middle mr-0.5">phone</span>${client.phone}</span>` : ''}
                    ${lastInteractionHtml}
                    ${client.source ? `<span class="text-[10px] px-2 py-0.5 rounded-full font-bold text-purple-600 bg-purple-50" title="Origem"><span class="material-symbols-outlined text-[10px] align-middle">pin_drop</span> ${ClientsPage.getSourceLabel(client.source)}</span>` : ''}
                </div>

                ${leadScoreHtml}

                <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-outline-variant/10">
                    <button class="btn-quick-view text-primary font-bold text-xs hover:underline flex items-center gap-1" data-id="${client.id}">
                        <span class="material-symbols-outlined text-sm">visibility</span>Visualizar
                    </button>
                    <div class="flex items-center gap-1.5">
                        <a href="#/clients/${client.id}" class="text-on-surface-variant hover:text-primary transition-colors" title="Editar">
                            <span class="material-symbols-outlined text-base">edit</span>
                        </a>
                        <button onclick="ClientsPage.deleteClientPrompt('${client.id}','${(client.name || '').replace(/'/g, "\\'")}')" class="text-slate-400 hover:text-red-500 transition-colors" title="Excluir">
                            <span class="material-symbols-outlined text-base">delete_outline</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    },

    // === 1. Import CSV ===
    async importCSV(file) {
        App.showToast('Processando arquivo...', 'info');
        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) { App.showToast('Arquivo vazio ou sem dados.', 'error'); return; }

        const headers = lines[0].split(/[,;]/).map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const nameIdx = headers.findIndex(h => ['nome', 'name', 'cliente'].includes(h));
        const emailIdx = headers.findIndex(h => ['email', 'e-mail'].includes(h));
        const phoneIdx = headers.findIndex(h => ['telefone', 'phone', 'celular', 'tel'].includes(h));
        const statusIdx = headers.findIndex(h => ['status'].includes(h));

        if (nameIdx === -1) { App.showToast('Coluna "Nome" não encontrada no CSV.', 'error'); return; }

        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(/[,;]/).map(c => c.trim().replace(/"/g, ''));
            const name = cols[nameIdx];
            if (!name) continue;

            const data = { name, status: 'active' };
            if (emailIdx >= 0 && cols[emailIdx]) data.email = cols[emailIdx];
            if (phoneIdx >= 0 && cols[phoneIdx]) data.phone = cols[phoneIdx];
            if (statusIdx >= 0 && cols[statusIdx]) {
                const st = cols[statusIdx].toLowerCase();
                if (['active', 'ativo'].includes(st)) data.status = 'active';
                else if (['prospect', 'prospecto'].includes(st)) data.status = 'prospect';
                else if (['inactive', 'inativo'].includes(st)) data.status = 'inactive';
            }

            try { await Store.addClient(data); imported++; } catch (e) { console.warn('Import error row ' + i, e); }
        }

        App.showToast(`${imported} cliente(s) importado(s) com sucesso!`, 'success');
        document.getElementById('csv-file-input').value = '';
        await this.loadClients('all');
    },

    // === Import from Phone (Contact Picker API) ===
    async importFromPhone() {
        // Verificar suporte à API
        if (!('contacts' in navigator && 'ContactsManager' in window)) {
            // Fallback: mostrar modal com instruções
            const modal = document.getElementById('modal-content');
            modal.innerHTML = `
            <div class="p-8">
                <h3 class="font-headline font-bold text-2xl mb-2 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">contacts</span>
                    Importar Contatos do Celular
                </h3>
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <p class="text-sm text-amber-800 flex items-start gap-2">
                        <span class="material-symbols-outlined text-amber-600 text-base mt-0.5">info</span>
                        <span>A importação direta de contatos está disponível apenas no <strong>Chrome para Android</strong>. Para usar em outro navegador, exporte seus contatos como <strong>CSV</strong> e use o botão "Importar CSV".</span>
                    </p>
                </div>
                <div class="space-y-3">
                    <div class="bg-surface-container-high rounded-xl p-4">
                        <h4 class="font-bold text-sm mb-2">📱 No celular Android:</h4>
                        <ol class="text-sm text-on-surface-variant space-y-1 list-decimal pl-5">
                            <li>Abra o site pelo <strong>Chrome</strong></li>
                            <li>Vá em <strong>Clientes</strong></li>
                            <li>Toque em <strong>"Celular"</strong></li>
                            <li>Selecione os contatos desejados</li>
                        </ol>
                    </div>
                    <div class="bg-surface-container-high rounded-xl p-4">
                        <h4 class="font-bold text-sm mb-2">💻 No computador:</h4>
                        <ol class="text-sm text-on-surface-variant space-y-1 list-decimal pl-5">
                            <li>Exporte os contatos do celular como <strong>CSV</strong></li>
                            <li>Use o botão <strong>"CSV"</strong> para importar</li>
                        </ol>
                    </div>
                </div>
                <div class="flex justify-end pt-4 mt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl">Entendi</button>
                </div>
            </div>`;
            App.openModal();
            return;
        }

        try {
            const props = ['name', 'email', 'tel'];
            const opts = { multiple: true };
            const contacts = await navigator.contacts.select(props, opts);

            if (!contacts || contacts.length === 0) {
                App.showToast('Nenhum contato selecionado.', 'info');
                return;
            }

            // Confirmar importação
            if (!confirm(`Importar ${contacts.length} contato(s) para o sistema?`)) return;

            App.showToast(`Importando ${contacts.length} contato(s)...`, 'info');
            let imported = 0;
            let skipped = 0;

            for (const contact of contacts) {
                const name = contact.name?.[0] || '';
                if (!name) { skipped++; continue; }

                // Verificar se já existe pelo telefone ou nome
                const phone = contact.tel?.[0] || '';
                const exists = this.allClients.some(c =>
                    (phone && c.phone && c.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')) ||
                    (c.name && c.name.toLowerCase() === name.toLowerCase())
                );

                if (exists) { skipped++; continue; }

                const data = {
                    name,
                    email: contact.email?.[0] || '',
                    phone: phone,
                    status: 'prospect',
                    source: 'contato_celular',
                    tags: ['Importado']
                };

                try {
                    await Store.addClient(data);
                    imported++;
                } catch (e) {
                    console.warn('Erro ao importar contato:', name, e);
                }
            }

            let msg = `${imported} contato(s) importado(s) com sucesso!`;
            if (skipped > 0) msg += ` ${skipped} ignorado(s) (duplicados ou sem nome).`;
            App.showToast(msg, 'success');
            await this.loadClients('all');

        } catch (e) {
            if (e.name !== 'AbortError') {
                App.showToast('Erro ao importar contatos: ' + e.message, 'error');
            }
        }
    },

    // === Mapa de labels de origem ===
    getSourceLabel(source) {
        const labels = {
            instagram: 'Instagram',
            facebook: 'Facebook',
            tiktok: 'TikTok',
            google: 'Google',
            indicacao_cliente: 'Indicação',
            indicacao_amigo: 'Indicação',
            bolsa_beleza: 'Bolsa Beleza',
            whatsapp: 'WhatsApp',
            passou_na_frente: 'Passou na frente',
            panfleto: 'Panfleto',
            evento: 'Evento',
            retorno: 'Retornando',
            contato_celular: 'Celular',
            outro: 'Outro'
        };
        return labels[source] || source;
    },

    // === 1. Export CSV ===
    exportCSV() {
        if (this.allClients.length === 0) { App.showToast('Nenhum cliente para exportar.', 'error'); return; }

        let csv = 'Nome,E-mail,Telefone,Status,Tags,Lead Score,Origem\n';
        this.allClients.forEach(c => {
            csv += `"${c.name || ''}","${c.email || ''}","${c.phone || ''}","${c.status || ''}","${(c.tags || []).join('; ')}","${c.leadScore || ''}","${ClientsPage.getSourceLabel(c.source || '')}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clientehub_clientes_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        App.showToast('Base de clientes exportada!', 'success');
    },

    // === 2. Tag Manager ===
    openTagManager() {
        const modal = document.getElementById('modal-content');
        const defaultTags = ['VIP', 'Fiel', 'Pós-operatório', 'Novo', 'Prioritário', 'Recorrente'];

        modal.innerHTML = `
        <div class="p-8">
            <h3 class="font-headline font-bold text-2xl mb-2">Gerenciar Tags</h3>
            <p class="text-on-surface-variant text-sm mb-6">Atribua etiquetas para segmentar seus clientes.</p>
            <div class="space-y-4">
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Selecionar Cliente</label>
                    <select id="tag-client-select" class="w-full px-4 py-3 bg-surface-container-high rounded-xl text-on-surface">
                        <option value="">Escolha um cliente...</option>
                        ${this.allClients.map(c => `<option value="${c.id}">${c.name || c.email}</option>`).join('')}
                    </select>
                </div>
                <div id="tag-client-current" class="hidden">
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Tags Atuais</label>
                    <div id="tag-current-pills" class="flex flex-wrap gap-1.5 min-h-[32px]"></div>
                </div>
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Adicionar Tags</label>
                    <div class="flex flex-wrap gap-2 mb-3">
                        ${defaultTags.map(t => `<button class="tag-preset px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors" data-tag="${t}">${t}</button>`).join('')}
                    </div>
                    <div class="flex gap-2">
                        <input type="text" id="tag-custom-input" class="flex-1 px-4 py-3 bg-surface-container-high rounded-xl text-on-surface" placeholder="Ou crie uma nova tag..."/>
                        <button id="tag-add-custom" class="px-4 py-3 vitality-gradient text-white font-bold rounded-xl text-sm">Adicionar</button>
                    </div>
                </div>
            </div>
            <div class="flex justify-end gap-3 pt-6 border-t border-outline-variant/10 mt-6">
                <button type="button" onclick="App.closeModal()" class="px-6 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors">Fechar</button>
            </div>
        </div>`;
        App.openModal();

        let selectedClientId = '';

        document.getElementById('tag-client-select').addEventListener('change', (e) => {
            selectedClientId = e.target.value;
            const section = document.getElementById('tag-client-current');
            if (!selectedClientId) { section.classList.add('hidden'); return; }
            section.classList.remove('hidden');
            ClientsPage.renderCurrentTags(selectedClientId);
        });

        document.querySelectorAll('.tag-preset').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!selectedClientId) { App.showToast('Selecione um cliente primeiro.', 'error'); return; }
                await ClientsPage.addTagToClient(selectedClientId, btn.dataset.tag);
            });
        });

        document.getElementById('tag-add-custom')?.addEventListener('click', async () => {
            const input = document.getElementById('tag-custom-input');
            const tag = input.value.trim();
            if (!tag) return;
            if (!selectedClientId) { App.showToast('Selecione um cliente primeiro.', 'error'); return; }
            await ClientsPage.addTagToClient(selectedClientId, tag);
            input.value = '';
        });
    },

    renderCurrentTags(clientId) {
        const client = this.allClients.find(c => c.id === clientId);
        const pills = document.getElementById('tag-current-pills');
        if (!client || !pills) return;

        const tags = client.tags || [];
        if (tags.length === 0) {
            pills.innerHTML = '<span class="text-xs text-on-surface-variant italic">Nenhuma tag atribuída</span>';
            return;
        }
        pills.innerHTML = tags.map(t => `
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                ${t}
                <button class="tag-remove hover:text-red-600" data-client="${clientId}" data-tag="${t}">×</button>
            </span>`).join('');

        pills.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', async () => {
                await ClientsPage.removeTagFromClient(btn.dataset.client, btn.dataset.tag);
            });
        });
    },

    async addTagToClient(clientId, tag) {
        const client = this.allClients.find(c => c.id === clientId);
        if (!client) return;
        const tags = client.tags || [];
        if (tags.includes(tag)) { App.showToast(`Tag "${tag}" já existe.`, 'info'); return; }
        tags.push(tag);
        await Store.updateClient(clientId, { tags });
        client.tags = tags;
        this.renderCurrentTags(clientId);
        App.showToast(`Tag "${tag}" adicionada!`, 'success');
    },

    async removeTagFromClient(clientId, tag) {
        const client = this.allClients.find(c => c.id === clientId);
        if (!client) return;
        const tags = (client.tags || []).filter(t => t !== tag);
        await Store.updateClient(clientId, { tags });
        client.tags = tags;
        this.renderCurrentTags(clientId);
        App.showToast(`Tag "${tag}" removida.`, 'info');
    },

    // === Bulk Actions ===
    updateBulkBar() {
        const bar = document.getElementById('bulk-bar');
        const count = document.getElementById('bulk-count');
        if (!bar || !count) return;
        if (this.selectedIds.size > 0) { bar.classList.remove('hidden'); count.textContent = `${this.selectedIds.size} selecionado(s)`; }
        else { bar.classList.add('hidden'); }
    },

    async bulkSetStatus(status) {
        const labels = { active: 'Ativo', inactive: 'Inativo', prospect: 'Prospecto' };
        const n = this.selectedIds.size;
        if (!confirm(`Mudar ${n} cliente(s) para "${labels[status]}"?`)) return;
        try {
            await Promise.all([...this.selectedIds].map(id => Store.updateClient(id, { status })));
            App.showToast(`${n} cliente(s) atualizado(s).`, 'success');
            this.selectedIds.clear();
            document.getElementById('bulk-select-all').checked = false;
            await this.loadClients(this.currentFilter);
        } catch (e) { App.showToast('Erro: ' + e.message, 'error'); }
    },

    async bulkDelete() {
        const n = this.selectedIds.size;
        if (!confirm(`EXCLUIR ${n} cliente(s)? Ação irreversível.`)) return;
        try {
            await Promise.all([...this.selectedIds].map(id => Store.deleteClient(id)));
            App.showToast(`${n} cliente(s) excluído(s).`, 'success');
            this.selectedIds.clear();
            document.getElementById('bulk-select-all').checked = false;
            await this.loadClients(this.currentFilter);
        } catch (e) { App.showToast('Erro: ' + e.message, 'error'); }
    },

    // === Quick View Side Drawer ===
    openDrawer(clientId) {
        const client = this.allClients.find(c => c.id === clientId);
        if (!client) return;

        const overlay = document.getElementById('drawer-overlay');
        const panel = document.getElementById('drawer-panel');
        const content = document.getElementById('drawer-content');

        const statusMap = {
            active:   { label: 'Ativo',     bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
            prospect: { label: 'Prospecto', bg: 'bg-blue-100',    text: 'text-blue-800',    dot: 'bg-blue-500' },
            inactive: { label: 'Inativo',   bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400' }
        };
        const s = statusMap[client.status] || statusMap.active;
        const initials = (client.name || 'C').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const created = client.createdAt?.seconds ? new Date(client.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : '—';
        const phone = (client.phone || '').replace(/\D/g, '');
        const whatsappLink = phone ? `https://wa.me/55${phone}?text=${encodeURIComponent('Olá ' + (client.name || '') + '! Tudo bem? Entrando em contato pela Studiobeauty.')}` : '';

        // 5. Last interaction
        let lastInteractionText = 'Sem registro';
        if (client._lastInteraction) {
            const days = Math.floor((Date.now() - client._lastInteraction.getTime()) / 86400000);
            lastInteractionText = days === 0 ? 'Hoje' : `${days} dia(s) atrás`;
        }

        // 4. Lead Score
        let leadScoreHtml = '';
        if (client.status === 'prospect') {
            const score = client.leadScore || 0;
            const barColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-400';
            const label = score >= 70 ? '🔥 Quente' : score >= 40 ? '🌤️ Morno' : '❄️ Frio';
            leadScoreHtml = `
            <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p class="text-[10px] uppercase tracking-wider text-blue-700 font-bold mb-2">Lead Score</p>
                <div class="flex items-center gap-3">
                    <div class="flex-1 h-2.5 bg-blue-100 rounded-full overflow-hidden"><div class="${barColor} h-full rounded-full" style="width:${score}%"></div></div>
                    <span class="text-sm font-bold text-blue-800">${score}%</span>
                </div>
                <p class="text-xs text-blue-600 mt-1 font-semibold">${label}</p>
                <input type="range" id="drawer-lead-score" min="0" max="100" value="${score}" class="w-full mt-2 accent-primary cursor-pointer" />
                <button id="drawer-save-score" class="mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Salvar Score</button>
            </div>`;
        }

        // 2. Tags
        const tagsHtml = (client.tags || []).map(t => `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">${t}</span>`).join(' ');

        content.innerHTML = `
        <div class="space-y-5">
            <div class="flex items-center justify-between">
                <h3 class="font-headline text-xl font-bold">Visão Rápida</h3>
                <button id="drawer-close" class="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div class="text-center pb-5 border-b border-outline-variant/10">
                <div class="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-3">${initials}</div>
                <h4 class="font-headline text-xl font-extrabold text-on-surface">${client.name || 'Sem nome'}</h4>
                <p class="text-sm text-on-surface-variant mt-1">${client.email || '—'}</p>
                <div class="flex items-center justify-center gap-2 mt-3">
                    <span class="${s.bg} ${s.text} text-xs px-3 py-1 rounded-full font-bold uppercase inline-flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full ${s.dot}"></span>${s.label}
                    </span>
                    ${tagsHtml}
                </div>
                ${whatsappLink ? `<a href="${whatsappLink}" target="_blank" class="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-colors">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Abrir WhatsApp</a>` : ''}
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="bg-surface-container-low rounded-xl p-3">
                    <p class="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Telefone</p>
                    <p class="font-bold text-on-surface text-sm">${client.phone || '—'}</p>
                </div>
                <div class="bg-surface-container-low rounded-xl p-3">
                    <p class="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Cadastro</p>
                    <p class="font-bold text-on-surface text-sm">${created}</p>
                </div>
                <div class="bg-surface-container-low rounded-xl p-3">
                    <p class="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Segmento</p>
                    <p class="font-bold text-on-surface text-sm">${client.serviceType || client.segment || '—'}</p>
                </div>
                <div class="bg-surface-container-low rounded-xl p-3">
                    <p class="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Última Interação</p>
                    <p class="font-bold text-on-surface text-sm">${lastInteractionText}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-purple-50 rounded-xl p-3 border border-purple-100">
                    <p class="text-[10px] uppercase tracking-wider text-purple-700 font-bold mb-1">📍 Origem</p>
                    <p class="font-bold text-purple-900 text-sm">${client.source ? ClientsPage.getSourceLabel(client.source) : 'Não informada'}</p>
                </div>
                <div class="bg-surface-container-low rounded-xl p-3">
                    <p class="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Categoria</p>
                    <p class="font-bold text-on-surface text-sm">${client.category || '—'}</p>
                </div>
            </div>

            ${leadScoreHtml}

            ${client.notes ? `<div class="bg-amber-50 rounded-xl p-4 border border-amber-200/50">
                <p class="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1">Observações</p>
                <p class="text-sm text-on-surface">${client.notes}</p>
            </div>` : ''}

            <div class="space-y-2 pt-4 border-t border-outline-variant/10">
                <a href="#/clients/${client.id}" class="w-full px-4 py-3 vitality-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform" onclick="ClientsPage.closeDrawer()">
                    <span class="material-symbols-outlined text-lg">edit</span>Editar Cadastro
                </a>
                <button onclick="ClientsPage.closeDrawer(); ClientsPage.deleteClientPrompt('${client.id}','${(client.name || '').replace(/'/g, "\\'")}')" class="w-full px-4 py-3 bg-red-50 text-red-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
                    <span class="material-symbols-outlined text-lg">delete</span>Excluir
                </button>
            </div>
        </div>`;

        // Show
        overlay.classList.remove('hidden');
        requestAnimationFrame(() => { overlay.style.opacity = '1'; panel.style.transform = 'translateX(0)'; });
        document.getElementById('drawer-close')?.addEventListener('click', () => ClientsPage.closeDrawer());

        // 4. Save lead score from drawer
        document.getElementById('drawer-save-score')?.addEventListener('click', async () => {
            const score = parseInt(document.getElementById('drawer-lead-score').value);
            await Store.updateClient(clientId, { leadScore: score });
            const c = this.allClients.find(x => x.id === clientId);
            if (c) c.leadScore = score;
            App.showToast(`Lead Score atualizado para ${score}%.`, 'success');
        });

        const escHandler = (e) => { if (e.key === 'Escape') { ClientsPage.closeDrawer(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    closeDrawer() {
        const overlay = document.getElementById('drawer-overlay');
        const panel = document.getElementById('drawer-panel');
        if (!overlay || !panel) return;
        overlay.style.opacity = '0';
        panel.style.transform = 'translateX(100%)';
        setTimeout(() => overlay.classList.add('hidden'), 300);
    },

    deleteClientPrompt(id, name) {
        if (confirm('Excluir o cliente "' + name + '"?')) {
            Store.deleteClient(id).then(() => {
                App.showToast('Cliente excluído.', 'success');
                this.loadClients(this.currentFilter);
            }).catch(e => App.showToast('Erro: ' + e.message, 'error'));
        }
    }
};
