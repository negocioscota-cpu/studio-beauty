// === Portfolio Page ===
const PortfolioPage = {
    items: [],

    render() {
        return `
        <div class="space-y-8 max-w-[1400px] mobile-full-width mx-auto animation-fade-in">
            <!-- Header -->
            <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Portfólio Interno</h2>
                    <p class="text-on-surface-variant mt-1">Galeria de Antes e Depois interativa dos procedimentos do Studiobeauty.</p>
                </div>
                <div>
                    <button id="btn-new-portfolio" class="px-5 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">add_a_photo</span>
                        Novo Antes & Depois
                    </button>
                </div>
            </section>

            <!-- Grid de Itens de Portfólio -->
            <div id="portfolio-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                <div class="col-span-full text-center py-12 text-on-surface-variant">
                    <div class="spinner mx-auto mb-4"></div>
                    <p class="text-sm">Carregando galeria do portfólio...</p>
                </div>
            </div>
        </div>`;
    },

    async init() {
        document.getElementById('btn-new-portfolio')?.addEventListener('click', () => PortfolioPage.showFormModal());
        await PortfolioPage.loadData();
    },

    async loadData() {
        try {
            PortfolioPage.items = await Store.getPortfolioItems();
            PortfolioPage.renderGrid();
        } catch (error) {
            console.error("Erro ao carregar portfólio:", error);
            App.showToast("Falha ao carregar itens do portfólio.", "error");
        }
    },

    renderGrid() {
        const grid = document.getElementById('portfolio-grid');
        if (!grid) return;

        if (PortfolioPage.items.length === 0) {
            grid.innerHTML = `
            <div class="col-span-full text-center py-16 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
                <span class="material-symbols-outlined text-primary/30 text-5xl mb-4">photo_library</span>
                <h4 class="font-headline font-bold text-lg text-on-surface">Galeria vazia</h4>
                <p class="text-on-surface-variant text-sm mt-1 mb-6">Comece registrando o seu primeiro resultado transformador (Antes e Depois).</p>
                <button onclick="PortfolioPage.showFormModal()" class="px-5 py-2.5 vitality-gradient text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto">
                    <span class="material-symbols-outlined text-base">add_a_photo</span>
                    Novo Antes & Depois
                </button>
            </div>`;
            return;
        }

        grid.innerHTML = PortfolioPage.items.map(item => {
            const formattedDate = item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
            return `
            <div class="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10 shadow-sm flex flex-col justify-between group">
                <div>
                    <!-- Interativo Antes e Depois Slider -->
                    <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none mb-4 bg-surface-container-high shadow-inner">
                        <!-- Imagem DEPOIS (Fundo) -->
                        <img src="${item.afterUrl}" class="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Depois" />
                        
                        <!-- Imagem ANTES (Sobreposição cortada pela largura) -->
                        <div class="absolute inset-y-0 left-0 overflow-hidden pointer-events-none" id="before-wrap-${item.id}" style="width: 50%;">
                            <!-- Forçar a largura da imagem a ser igual à largura total do container pai (w-[calc(100%)] ou equivalente no cálculo em container de aspect-[4/3]) -->
                            <img src="${item.beforeUrl}" class="absolute inset-0 w-full h-full object-cover max-w-none" style="width: 100%;" alt="Antes" />
                        </div>
                        
                        <!-- Divisor Visual / Handle -->
                        <div class="absolute inset-y-0 w-1 bg-white/80 backdrop-blur-xs flex items-center justify-center pointer-events-none" id="handle-${item.id}" style="left: 50%; transform: translateX(-50%);">
                            <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md border-2 border-white/80 text-[10px] font-bold">
                                ⇄
                            </div>
                        </div>

                        <!-- Labels antes e depois -->
                        <span class="absolute bottom-3 left-3 bg-black/40 text-white text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold">Antes</span>
                        <span class="absolute bottom-3 right-3 bg-black/40 text-white text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold">Depois</span>

                        <!-- Controle Deslizante Real -->
                        <input type="range" min="0" max="100" value="50" 
                            class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" 
                            oninput="PortfolioPage.handleSlider(this, '${item.id}')" />
                    </div>

                    <!-- Informações do Item -->
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-headline font-bold text-base text-on-surface">${item.serviceName || 'Procedimento'}</h4>
                        <button onclick="PortfolioPage.deleteItem('${item.id}')" class="w-8 h-8 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 flex items-center justify-center transition-colors" title="Excluir">
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>

                    <p class="text-on-surface-variant text-xs mb-4 line-clamp-2 leading-relaxed">
                        ${item.notes || 'Sem observações adicionais cadastrados sobre este procedimento.'}
                    </p>
                </div>

                <!-- Footer do Card -->
                <div class="flex items-center justify-between pt-3.5 border-t border-outline-variant/10 mt-auto text-[11px] text-on-surface-variant font-medium">
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm text-primary">face</span>
                        <span>Cliente: <strong class="text-on-surface">${item.clientName || 'Geral'}</strong></span>
                    </div>
                    <span>${formattedDate}</span>
                </div>
            </div>`;
        }).join('');

        // Forçar ajuste do tamanho das imagens do "Antes" para ocuparem a mesma largura do container pai
        PortfolioPage.adjustBeforeImages();
    },

    adjustBeforeImages() {
        PortfolioPage.items.forEach(item => {
            const wrap = document.getElementById(`before-wrap-${item.id}`);
            if (wrap) {
                const parentWidth = wrap.parentElement.clientWidth;
                const img = wrap.querySelector('img');
                if (img && parentWidth > 0) {
                    img.style.width = `${parentWidth}px`;
                }
            }
        });
    },

    handleSlider(rangeInput, id) {
        const value = rangeInput.value;
        const wrap = document.getElementById(`before-wrap-${id}`);
        const handle = document.getElementById(`handle-${id}`);

        if (wrap) wrap.style.width = `${value}%`;
        if (handle) handle.style.left = `${value}%`;
    },

    showFormModal() {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-8 max-w-lg mx-auto">
            <h3 class="font-headline font-bold text-2xl mb-1">Novo Antes & Depois</h3>
            <p class="text-on-surface-variant text-sm mb-6">Insira os dados e as URLs das imagens do procedimento realizado.</p>
            <form id="portfolio-form" class="space-y-4">
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Cliente</label>
                    <select id="ptf-client" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                        <option value="">Selecione a cliente...</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Procedimento / Serviço</label>
                        <select id="ptf-service" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                            <option value="">Selecione o procedimento...</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Profissional / Designer</label>
                        <input type="text" id="ptf-designer" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Ex: Ana Souza" required />
                    </div>
                </div>

                <div class="space-y-3">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Foto de ANTES (URL da Imagem)</label>
                        <input type="url" id="ptf-before-url" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="https://exemplo.com/antes.jpg" required />
                        <span class="text-[10px] text-on-surface-variant">Cole o link da imagem hospedada ou insira uma imagem demo (Ex: https://images.unsplash.com/photo-1522337360788-8b13dee7a37e)</span>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Foto de DEPOIS (URL da Imagem)</label>
                        <input type="url" id="ptf-after-url" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="https://exemplo.com/depois.jpg" required />
                        <span class="text-[10px] text-on-surface-variant">Cole o link da imagem (Ex: https://images.unsplash.com/photo-1596462502278-27bfdc403348)</span>
                    </div>
                </div>

                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Notas e Detalhes da Técnica</label>
                    <textarea id="ptf-notes" rows="2" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm resize-none" placeholder="Ex: Técnica de Lash Mapping Gatinho, fios de curvatura D 0.07."></textarea>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-2.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl text-sm transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-2.5 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all text-sm flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">save</span>
                        Publicar Item
                    </button>
                </div>
            </form>
        </div>`;
        App.openModal();

        // Populate Clients and Services
        Store.getClients().then(clients => {
            const select = document.getElementById('ptf-client');
            if (select) {
                select.innerHTML = '<option value="">Selecione a cliente...</option>' +
                    clients.map(c => `<option value="${c.id}" data-name="${c.name}">${c.name}</option>`).join('');
            }
        });

        Store.getServices().then(services => {
            const select = document.getElementById('ptf-service');
            if (select) {
                select.innerHTML = '<option value="">Selecione o procedimento...</option>' +
                    services.map(s => `<option value="${s.id}" data-name="${s.name}">${s.name}</option>`).join('');
            }
        });

        // Form Submit
        document.getElementById('portfolio-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const clientSelect = document.getElementById('ptf-client');
            const serviceSelect = document.getElementById('ptf-service');

            const data = {
                clientId: clientSelect.value,
                clientName: clientSelect.selectedOptions[0]?.dataset.name || '',
                serviceId: serviceSelect.value,
                serviceName: serviceSelect.selectedOptions[0]?.dataset.name || '',
                designerName: document.getElementById('ptf-designer').value.trim(),
                beforeUrl: document.getElementById('ptf-before-url').value.trim(),
                afterUrl: document.getElementById('ptf-after-url').value.trim(),
                notes: document.getElementById('ptf-notes').value.trim()
            };

            try {
                await Store.addPortfolioItem(data);
                App.closeModal();
                App.showToast("Portfólio atualizado com sucesso!", "success");
                await PortfolioPage.loadData();
            } catch (err) {
                console.error("Erro ao salvar portfólio:", err);
                App.showToast("Falha ao salvar portfólio.", "error");
            }
        });
    },

    async deleteItem(itemId) {
        if (!confirm("Tem certeza que deseja excluir este item do portfólio?")) return;
        try {
            await Store.deletePortfolioItem(itemId);
            App.showToast("Item excluído com sucesso do portfólio!", "success");
            await PortfolioPage.loadData();
        } catch (err) {
            console.error("Erro ao excluir item:", err);
            App.showToast("Falha ao excluir item.", "error");
        }
    }
};

// Listener global para ajustar o slider quando a janela mudar de tamanho
window.addEventListener('resize', () => {
    if (typeof App !== 'undefined' && App.currentPage === 'portfolio') {
        PortfolioPage.adjustBeforeImages();
    }
});
