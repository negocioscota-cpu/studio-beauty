// === Catalog Page ===
const CatalogPage = {
    services: [],
    currentCategory: 'all',

    render() {
        return `
        <div class="space-y-8 max-w-[1400px] mobile-full-width mx-auto animation-fade-in">
            <!-- Header -->
            <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Catálogo de Serviços</h2>
                    <p class="text-on-surface-variant mt-1">Gerencie os procedimentos, preços e durações oferecidos no Studiobeauty.</p>
                </div>
                <div>
                    <button id="btn-new-service" class="px-5 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">add_circle</span>
                        Novo Procedimento
                    </button>
                </div>
            </section>

            <!-- Categories Filter -->
            <div class="flex items-center gap-2 flex-wrap" id="category-filters">
                <button class="filter-btn active px-4 py-2 rounded-full text-xs font-bold transition-all" data-category="all">Todos</button>
                <button class="filter-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-category="Cílios">👁 Cílios</button>
                <button class="filter-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-category="Sobrancelhas">✨ Sobrancelhas</button>
                <button class="filter-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-category="Lábios">👄 Lábios</button>
                <button class="filter-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-category="Face">💆‍♀️ Face & Outros</button>
            </div>

            <!-- Grid de Serviços -->
            <div id="services-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                <div class="col-span-full text-center py-12 text-on-surface-variant">
                    <div class="spinner mx-auto mb-4"></div>
                    <p class="text-sm">Carregando catálogo...</p>
                </div>
            </div>
        </div>`;
    },

    async init() {
        // Category filtering setup
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active', 'vitality-gradient', 'text-white');
                    b.classList.add('bg-surface-container-low', 'text-on-surface-variant');
                });
                btn.classList.add('active', 'vitality-gradient', 'text-white');
                btn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
                CatalogPage.currentCategory = btn.dataset.category;
                CatalogPage.renderGrid();
            });
        });

        // Ensure active styling is correct at start
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) {
            activeBtn.classList.add('vitality-gradient', 'text-white');
            activeBtn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
        }

        // New service click
        document.getElementById('btn-new-service')?.addEventListener('click', () => CatalogPage.showFormModal());

        // Load data
        await CatalogPage.loadData();
    },

    async loadData() {
        try {
            CatalogPage.services = await Store.getServices();
            CatalogPage.renderGrid();
        } catch (error) {
            console.error("Erro ao carregar catálogo:", error);
            App.showToast("Falha ao carregar catálogo de serviços.", "error");
        }
    },

    renderGrid() {
        const grid = document.getElementById('services-grid');
        if (!grid) return;

        const filtered = CatalogPage.currentCategory === 'all'
            ? CatalogPage.services
            : CatalogPage.services.filter(s => s.category === CatalogPage.currentCategory);

        if (filtered.length === 0) {
            grid.innerHTML = `
            <div class="col-span-full text-center py-16 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
                <span class="material-symbols-outlined text-primary/30 text-5xl mb-4">auto_awesome</span>
                <h4 class="font-headline font-bold text-lg text-on-surface">Nenhum procedimento encontrado</h4>
                <p class="text-on-surface-variant text-sm mt-1 mb-6">Que tal começar cadastrando o seu primeiro procedimento premium?</p>
                <button onclick="CatalogPage.showFormModal()" class="px-5 py-2.5 vitality-gradient text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto">
                    <span class="material-symbols-outlined text-base">add</span>
                    Cadastrar Serviço
                </button>
            </div>`;
            return;
        }

        grid.innerHTML = filtered.map(service => {
            const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price || 0);
            return `
            <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col justify-between group">
                <div>
                    <!-- Top section with category and action buttons -->
                    <div class="flex justify-between items-start mb-4">
                        <span class="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full" style="background-color: rgba(199, 123, 107, 0.1);">
                            ${service.category || 'Outros'}
                        </span>
                        <div class="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onclick="CatalogPage.showFormModal('${service.id}')" class="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" title="Editar">
                                <span class="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button onclick="CatalogPage.deleteService('${service.id}')" class="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-on-surface-variant hover:text-red-600 transition-colors" title="Excluir">
                                <span class="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </div>

                    <!-- Emoji & Title -->
                    <div class="flex items-center gap-3 mb-3">
                        <span class="text-3xl">${service.emoji || '✨'}</span>
                        <h4 class="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">${service.name}</h4>
                    </div>

                    <!-- Description -->
                    <p class="text-on-surface-variant text-xs leading-relaxed line-clamp-3 mb-5">
                        ${service.description || 'Nenhuma descrição detalhada informada para este procedimento.'}
                    </p>
                </div>

                <!-- Info footer -->
                <div class="flex items-center justify-between pt-4 border-t border-outline-variant/10 mt-auto">
                    <div class="flex items-center gap-1.5 text-on-surface-variant">
                        <span class="material-symbols-outlined text-base">schedule</span>
                        <span class="text-xs font-medium">${service.duration || 60} min</span>
                    </div>
                    <div class="text-right">
                        <span class="text-[10px] block text-on-surface-variant font-semibold uppercase tracking-wider">Investimento</span>
                        <span class="font-headline text-lg font-black text-primary">${formattedPrice}</span>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    showFormModal(serviceId = null) {
        const isEdit = !!serviceId;
        const service = isEdit ? CatalogPage.services.find(s => s.id === serviceId) : null;

        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-8 max-w-lg mx-auto">
            <h3 class="font-headline font-bold text-2xl mb-1">${isEdit ? 'Editar Procedimento' : 'Novo Procedimento'}</h3>
            <p class="text-on-surface-variant text-sm mb-6">Cadastre os detalhes do serviço oferecido no estúdio.</p>
            <form id="service-form" class="space-y-4">
                <div class="grid grid-cols-4 gap-3">
                    <div class="col-span-3">
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Nome do Procedimento</label>
                        <input type="text" id="srv-name" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Ex: Alongamento de Cílios Fio a Fio" value="${service ? service.name : ''}" required />
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Emoji</label>
                        <input type="text" id="srv-emoji" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-center text-sm" placeholder="👁, ✨..." value="${service ? service.emoji : '✨'}" maxlength="4" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Categoria</label>
                        <select id="srv-category" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                            <option value="Cílios" ${service && service.category === 'Cílios' ? 'selected' : ''}>Cílios</option>
                            <option value="Sobrancelhas" ${service && service.category === 'Sobrancelhas' ? 'selected' : ''}>Sobrancelhas</option>
                            <option value="Lábios" ${service && service.category === 'Lábios' ? 'selected' : ''}>Lábios</option>
                            <option value="Face" ${service && service.category === 'Face' ? 'selected' : ''}>Face & Outros</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Preço (R$)</label>
                        <input type="number" id="srv-price" step="0.01" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Ex: 150.00" value="${service ? service.price : ''}" required />
                    </div>
                </div>

                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Duração Estimada (minutos)</label>
                    <select id="srv-duration" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                        <option value="30" ${service && service.duration == 30 ? 'selected' : ''}>30 minutos</option>
                        <option value="45" ${service && service.duration == 45 ? 'selected' : ''}>45 minutos</option>
                        <option value="60" ${service && service.duration == 60 ? 'selected' : ''}>1 hora</option>
                        <option value="90" ${service && service.duration == 90 ? 'selected' : ''}>1 hora e 30 minutos</option>
                        <option value="120" ${service && service.duration == 120 ? 'selected' : ''}>2 horas</option>
                        <option value="150" ${service && service.duration == 150 ? 'selected' : ''}>2 horas e 30 minutos</option>
                        <option value="180" ${service && service.duration == 180 ? 'selected' : ''}>3 horas</option>
                    </select>
                </div>

                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Descrição Curta</label>
                    <textarea id="srv-description" rows="3" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm resize-none" placeholder="Breve resumo do que inclui o procedimento, técnicas utilizadas, etc...">${service ? service.description : ''}</textarea>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-2.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl text-sm transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-2.5 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all text-sm flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">save</span>
                        Salvar
                    </button>
                </div>
            </form>
        </div>`;
        App.openModal();

        // Handle Submit
        document.getElementById('service-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('srv-name').value.trim(),
                emoji: document.getElementById('srv-emoji').value.trim() || '✨',
                category: document.getElementById('srv-category').value,
                price: parseFloat(document.getElementById('srv-price').value) || 0,
                duration: parseInt(document.getElementById('srv-duration').value) || 60,
                description: document.getElementById('srv-description').value.trim()
            };

            try {
                if (isEdit) {
                    await Store.updateService(serviceId, data);
                    App.showToast("Procedimento atualizado com sucesso!", "success");
                } else {
                    await Store.addService(data);
                    App.showToast("Procedimento cadastrado com sucesso!", "success");
                }
                App.closeModal();
                await CatalogPage.loadData();
            } catch (err) {
                console.error("Erro ao salvar serviço:", err);
                App.showToast("Erro ao salvar procedimento. Tente novamente.", "error");
            }
        });
    },

    async deleteService(serviceId) {
        if (!confirm("Tem certeza que deseja excluir permanentemente este procedimento do catálogo?")) return;
        try {
            await Store.deleteService(serviceId);
            App.showToast("Procedimento removido com sucesso!", "success");
            await CatalogPage.loadData();
        } catch (err) {
            console.error("Erro ao remover serviço:", err);
            App.showToast("Falha ao remover procedimento.", "error");
        }
    }
};
