// === Inventory Page ===
const InventoryPage = {
    allItems: [],
    currentFilter: 'all',

    render() {
        return `
        <div class="space-y-6 max-w-[1400px] mobile-full-width mx-auto">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p class="text-sm text-on-surface-variant mb-1">Menu › <span class="text-primary font-semibold">Inventário</span></p>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight">Inventário</h2>
                    <p class="text-on-surface-variant mt-1 text-sm">Gerencie produtos, materiais e suprimentos do seu negócio.</p>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                    <button onclick="InventoryPage.openBarcodeScanner()" class="px-4 py-2.5 bg-surface-container-low text-on-surface-variant rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-surface-container transition-colors" title="Escanear código de barras">
                        <span class="material-symbols-outlined text-lg">qr_code_scanner</span>Scanner
                    </button>
                    <button onclick="InventoryPage.showHistoryModal()" class="px-4 py-2.5 bg-surface-container-low text-on-surface-variant rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-surface-container transition-colors" title="Histórico de movimentação">
                        <span class="material-symbols-outlined text-lg">history</span>Histórico
                    </button>
                    <button onclick="InventoryPage.generatePDFReport()" class="px-4 py-2.5 bg-surface-container-low text-on-surface-variant rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-surface-container transition-colors" title="Relatório de Consumo PDF">
                        <span class="material-symbols-outlined text-lg">picture_as_pdf</span>Relatório
                    </button>
                    <button onclick="InventoryPage.showAddModal()" class="px-5 py-2.5 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">add_circle</span>Novo Item
                    </button>
                </div>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/15">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">inventory_2</span>
                        </div>
                        <div>
                            <p class="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Total de Itens</p>
                            <p id="inv-total" class="text-2xl font-bold">--</p>
                        </div>
                    </div>
                </div>
                <div id="card-low-stock" class="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/15 transition-colors">
                    <div class="flex items-center gap-3">
                        <div id="card-low-icon" class="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                            <span class="material-symbols-outlined">warning</span>
                        </div>
                        <div>
                            <p class="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Estoque Baixo</p>
                            <p id="inv-low" class="text-2xl font-bold text-secondary">--</p>
                        </div>
                    </div>
                </div>
                <div class="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/15">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-primary">
                            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                        </div>
                        <div>
                            <p class="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Em Estoque</p>
                            <p id="inv-ok" class="text-2xl font-bold text-primary">--</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filtros rápidos -->
            <div class="flex items-center gap-3 flex-wrap">
                <button class="inv-filter-btn active px-4 py-2 rounded-full text-xs font-bold transition-all" data-filter="all">Todos</button>
                <button class="inv-filter-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-filter="revenda">Revenda</button>
                <button class="inv-filter-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-filter="profissional">Uso Profissional</button>
                <button class="inv-filter-btn px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all" data-filter="low">⚠ Estoque Baixo</button>
                <div id="inv-cat-filters" class="flex items-center gap-2 ml-1"></div>
            </div>

            <!-- Table -->
            <div class="inv-table-wrap bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden">
                <table class="w-full text-sm">
                    <thead class="bg-surface-container-low">
                        <tr>
                            <th class="text-left py-3.5 px-5 font-bold text-on-surface-variant text-[10px] uppercase tracking-widest">Item</th>
                            <th class="text-left py-3.5 px-5 font-bold text-on-surface-variant text-[10px] uppercase tracking-widest inv-hide-mobile">Categoria</th>
                            <th class="text-center py-3.5 px-5 font-bold text-on-surface-variant text-[10px] uppercase tracking-widest">Qtd</th>
                            <th class="text-center py-3.5 px-5 font-bold text-on-surface-variant text-[10px] uppercase tracking-widest inv-hide-mobile">Mín</th>
                            <th class="text-center py-3.5 px-5 font-bold text-on-surface-variant text-[10px] uppercase tracking-widest">Status</th>
                            <th class="text-right py-3.5 px-5 font-bold text-on-surface-variant text-[10px] uppercase tracking-widest">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="inv-table" class="divide-y divide-outline-variant/10">
                        ${InventoryPage.renderSkeletonRows()}
                    </tbody>
                </table>
            </div>
        </div>`;
    },

    renderSkeletonRows() {
        const row = `
        <tr class="animate-pulse">
            <td class="py-4 px-5"><div class="h-4 w-32 bg-slate-200 rounded-lg"></div></td>
            <td class="py-4 px-5"><div class="h-4 w-24 bg-slate-100 rounded-lg"></div></td>
            <td class="py-4 px-5 text-center"><div class="h-4 w-12 bg-slate-200 rounded-lg mx-auto"></div></td>
            <td class="py-4 px-5 text-center"><div class="h-4 w-10 bg-slate-100 rounded-lg mx-auto"></div></td>
            <td class="py-4 px-5 text-center"><div class="h-5 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
            <td class="py-4 px-5 text-right"><div class="h-5 w-5 bg-slate-100 rounded ml-auto"></div></td>
        </tr>`;
        return row.repeat(5);
    },

    async init() {
        document.querySelectorAll('.inv-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.inv-filter-btn').forEach(b => {
                    b.classList.remove('active', 'vitality-gradient', 'text-white');
                    b.classList.add('bg-surface-container-low', 'text-on-surface-variant');
                });
                btn.classList.add('active', 'vitality-gradient', 'text-white');
                btn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
                InventoryPage.currentFilter = btn.dataset.filter;
                InventoryPage.applyFilter(btn.dataset.filter);
            });
        });

        const activeBtn = document.querySelector('.inv-filter-btn.active');
        if (activeBtn) {
            activeBtn.classList.add('vitality-gradient', 'text-white');
            activeBtn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
        }

        await this.loadItems();
    },

    async loadItems() {
        const tbody = document.getElementById('inv-table');
        try {
            const items = await Store.getInventory();
            this.allItems = items;

            document.getElementById('inv-total').textContent = items.length;
            const lowCount = items.filter(i => (i.quantity || 0) <= (i.minQuantity || 0)).length;
            document.getElementById('inv-low').textContent = lowCount;
            document.getElementById('inv-ok').textContent = items.length - lowCount;

            // Card estoque baixo vermelho
            const card = document.getElementById('card-low-stock');
            const icon = document.getElementById('card-low-icon');
            const lowLabel = document.getElementById('inv-low');
            if (lowCount > 0) {
                card.className = 'bg-red-50 rounded-xl p-5 border border-red-200 transition-colors';
                icon.className = 'w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600';
                lowLabel.className = 'text-2xl font-bold text-red-600';
            } else {
                card.className = 'bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/15 transition-colors';
                icon.className = 'w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary';
                lowLabel.className = 'text-2xl font-bold text-secondary';
            }

            // 2. Alerta no sino
            InventoryPage.updateNotificationBadge(lowCount);

            this.renderCategoryFilters();
            this.applyFilter(this.currentFilter);
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-error">Erro ao carregar inventário.</td></tr>`;
            console.error(e);
        }
    },

    // === 2. ALERTA AUTOMÁTICO NO SINO ===
    updateNotificationBadge(lowCount) {
        const badge = document.querySelector('#btn-notifications .absolute');
        if (!badge) return;
        if (lowCount > 0) {
            badge.className = 'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1 animate-pulse';
            badge.textContent = lowCount;
        } else {
            badge.className = 'absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full';
            badge.textContent = '';
        }
        // Store low items for notification modal
        window.__lowStockItems = this.allItems.filter(i => (i.quantity || 0) <= (i.minQuantity || 0));
    },

    renderCategoryFilters() {
        const container = document.getElementById('inv-cat-filters');
        if (!container) return;
        const cats = new Set();
        this.allItems.forEach(i => { if (i.category) cats.add(i.category); });
        const standard = ['revenda', 'profissional', 'uso profissional'];
        const extra = [...cats].filter(c => !standard.some(s => c.toLowerCase().includes(s)));

        container.innerHTML = extra.slice(0, 5).map(cat =>
            `<button class="inv-cat-btn px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 hover:opacity-80 transition-opacity" data-cat="${cat}">${cat}</button>`
        ).join('');

        container.querySelectorAll('.inv-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filtered = this.allItems.filter(i => i.category === btn.dataset.cat);
                this.renderTable(filtered);
            });
        });
    },

    applyFilter(filter) {
        let filtered;
        switch (filter) {
            case 'revenda':
                filtered = this.allItems.filter(i => (i.category || '').toLowerCase().includes('revenda'));
                break;
            case 'profissional':
                filtered = this.allItems.filter(i => {
                    const cat = (i.category || '').toLowerCase();
                    return cat.includes('profissional') || cat.includes('uso');
                });
                break;
            case 'low':
                filtered = this.allItems.filter(i => (i.quantity || 0) <= (i.minQuantity || 0));
                break;
            default:
                filtered = this.allItems;
        }
        this.renderTable(filtered);
    },

    renderTable(items) {
        const tbody = document.getElementById('inv-table');

        if (items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12 text-on-surface-variant">
                <div class="flex flex-col items-center gap-3">
                    <span class="material-symbols-outlined text-4xl text-outline-variant">inventory_2</span>
                    <p class="font-bold">Nenhum item encontrado</p>
                    <p class="text-xs text-outline">Adicione itens ao seu inventário.</p>
                    <button onclick="InventoryPage.showAddModal()" class="mt-2 px-5 py-2.5 vitality-gradient text-white font-bold rounded-xl text-sm inline-flex items-center gap-2">
                        <span class="material-symbols-outlined text-lg">add_circle</span>Adicionar
                    </button>
                </div>
            </td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(item => {
            const qty = item.quantity || 0;
            const min = item.minQuantity || 0;
            const isLow = qty <= min;
            const rowClass = isLow ? 'bg-red-50/60 hover:bg-red-100/50' : 'hover:bg-surface-container-low/50';
            const statusBadge = isLow
                ? '<span class="bg-red-100 text-red-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase flex items-center gap-1 justify-center"><span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>BAIXO</span>'
                : '<span class="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase flex items-center gap-1 justify-center"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>OK</span>';

            return `<tr class="${rowClass} transition-colors">
                <td class="py-3.5 px-5">
                    <div class="font-bold text-on-surface">${item.name || '--'}</div>
                    ${item.barcode ? `<span class="text-[10px] text-slate-400 font-mono">${item.barcode}</span>` : ''}
                </td>
                <td class="py-3.5 px-5 text-on-surface-variant inv-hide-mobile">
                    ${item.category ? `<span class="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 uppercase">${item.category}</span>` : '--'}
                </td>
                <td class="py-3.5 px-5 text-center">
                    <div class="inline-flex items-center gap-1.5">
                        <button onclick="InventoryPage.changeQty('${item.id}', -1)" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 flex items-center justify-center transition-colors text-lg font-bold leading-none" title="Diminuir">−</button>
                        <span class="font-bold text-on-surface min-w-[28px] text-center ${isLow ? 'text-red-600' : ''}">${qty}</span>
                        <button onclick="InventoryPage.changeQty('${item.id}', 1)" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 flex items-center justify-center transition-colors text-lg font-bold leading-none" title="Aumentar">+</button>
                    </div>
                </td>
                <td class="py-3.5 px-5 text-center text-on-surface-variant font-semibold inv-hide-mobile">${min}</td>
                <td class="py-3.5 px-5 text-center">${statusBadge}</td>
                <td class="py-3.5 px-5 text-right">
                    <div class="flex items-center gap-1 justify-end">
                        <button onclick="InventoryPage.showItemHistory('${item.id}')" class="text-slate-400 hover:text-indigo-500 transition-colors" title="Histórico"><span class="material-symbols-outlined text-lg">history</span></button>
                        <button onclick="InventoryPage.showEditModal('${item.id}')" class="text-slate-400 hover:text-primary transition-colors" title="Editar"><span class="material-symbols-outlined text-lg">edit</span></button>
                        <button onclick="InventoryPage.deleteItem('${item.id}')" class="text-slate-400 hover:text-red-500 transition-colors" title="Excluir"><span class="material-symbols-outlined text-lg">delete_outline</span></button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    },

    // === QUANTITY CHANGE WITH LOG ===
    async changeQty(itemId, delta) {
        const item = this.allItems.find(i => i.id === itemId);
        if (!item) return;
        const oldQty = item.quantity || 0;
        const newQty = Math.max(0, oldQty + delta);
        try {
            await Store.updateInventoryItem(itemId, { quantity: newQty });
            // 1. Log de movimentação
            await Store.addMovementLog({
                itemId: itemId,
                itemName: item.name,
                type: delta > 0 ? 'entrada' : 'saída',
                oldQty: oldQty,
                newQty: newQty,
                delta: delta
            });
            item.quantity = newQty;
            this.refreshCounts();
            this.applyFilter(this.currentFilter);
        } catch (e) {
            App.showToast('Erro ao atualizar: ' + e.message, 'error');
        }
    },

    refreshCounts() {
        const lowCount = this.allItems.filter(i => (i.quantity || 0) <= (i.minQuantity || 0)).length;
        document.getElementById('inv-total').textContent = this.allItems.length;
        document.getElementById('inv-low').textContent = lowCount;
        document.getElementById('inv-ok').textContent = this.allItems.length - lowCount;

        const card = document.getElementById('card-low-stock');
        const icon = document.getElementById('card-low-icon');
        const lowLabel = document.getElementById('inv-low');
        if (lowCount > 0) {
            card.className = 'bg-red-50 rounded-xl p-5 border border-red-200 transition-colors';
            icon.className = 'w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600';
            lowLabel.className = 'text-2xl font-bold text-red-600';
        } else {
            card.className = 'bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/15 transition-colors';
            icon.className = 'w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary';
            lowLabel.className = 'text-2xl font-bold text-secondary';
        }
        this.updateNotificationBadge(lowCount);
    },

    // === 1. HISTÓRICO DE MOVIMENTAÇÃO ===
    async showHistoryModal() {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `<div class="p-8"><div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-primary text-2xl">history</span>
            <div><h3 class="font-headline font-bold text-xl">Histórico de Movimentação</h3>
            <p class="text-on-surface-variant text-sm">Log completo de todas as entradas e saídas.</p></div>
        </div><div class="text-center py-8"><div class="spinner mx-auto mb-2"></div><p class="text-sm text-on-surface-variant">Carregando...</p></div></div>`;
        App.openModal();

        try {
            const logs = await Store.getMovementLogs();
            const content = document.querySelector('#modal-content > div');
            if (logs.length === 0) {
                content.innerHTML += `<div class="flex flex-col items-center py-8 text-on-surface-variant"><span class="material-symbols-outlined text-4xl mb-2">receipt_long</span><p class="font-bold">Nenhuma movimentação registrada</p><p class="text-xs mt-1">As movimentações aparecerão aqui quando você alterar quantidades.</p></div>`;
                // Remove spinner
                content.querySelector('.text-center')?.remove();
                return;
            }
            let tableHTML = `<div class="overflow-y-auto max-h-[400px] rounded-xl border border-outline-variant/10"><table class="w-full text-sm"><thead class="bg-surface-container-low sticky top-0"><tr>
                <th class="text-left py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Data</th>
                <th class="text-left py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Item</th>
                <th class="text-center py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Tipo</th>
                <th class="text-center py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">De → Para</th>
                <th class="text-left py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Usuário</th>
            </tr></thead><tbody class="divide-y divide-outline-variant/10">`;

            logs.forEach(log => {
                const date = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '--';
                const isEntrada = log.type === 'entrada';
                const badge = isEntrada
                    ? '<span class="bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">ENTRADA</span>'
                    : '<span class="bg-red-100 text-red-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">SAÍDA</span>';

                tableHTML += `<tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="py-3 px-4 text-on-surface-variant text-xs font-mono">${date}</td>
                    <td class="py-3 px-4 font-bold text-on-surface">${log.itemName || '--'}</td>
                    <td class="py-3 px-4 text-center">${badge}</td>
                    <td class="py-3 px-4 text-center font-mono text-xs"><span class="text-slate-500">${log.oldQty}</span> → <span class="font-bold ${isEntrada ? 'text-emerald-600' : 'text-red-600'}">${log.newQty}</span></td>
                    <td class="py-3 px-4 text-on-surface-variant text-xs">${log.user || '--'}</td>
                </tr>`;
            });

            tableHTML += '</tbody></table></div>';
            content.querySelector('.text-center')?.remove();
            content.innerHTML = content.innerHTML.replace('</div>', tableHTML + '<div class="flex justify-end pt-4 mt-4 border-t border-outline-variant/10"><button type="button" onclick="App.closeModal()" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl">Fechar</button></div></div>');
        } catch (e) {
            console.error(e);
            App.showToast('Erro ao carregar histórico', 'error');
        }
    },

    async showItemHistory(itemId) {
        const item = this.allItems.find(i => i.id === itemId);
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `<div class="p-8"><div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-indigo-500 text-2xl">history</span>
            <div><h3 class="font-headline font-bold text-xl">Histórico: ${item?.name || 'Item'}</h3>
            <p class="text-on-surface-variant text-sm">Movimentações deste item.</p></div>
        </div><div class="text-center py-8"><div class="spinner mx-auto mb-2"></div></div></div>`;
        App.openModal();

        try {
            const logs = await Store.getMovementLogs(itemId);
            const content = document.querySelector('#modal-content > div');
            content.querySelector('.text-center')?.remove();

            if (logs.length === 0) {
                content.insertAdjacentHTML('beforeend', `<div class="text-center py-8 text-on-surface-variant"><span class="material-symbols-outlined text-3xl mb-2 block">receipt_long</span><p class="text-sm">Sem movimentações registradas.</p></div>`);
            } else {
                let html = '<div class="space-y-2 max-h-[350px] overflow-y-auto">';
                logs.forEach(log => {
                    const date = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '--';
                    const isEntrada = log.type === 'entrada';
                    const icon = isEntrada ? 'arrow_upward' : 'arrow_downward';
                    const color = isEntrada ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50';
                    html += `<div class="flex items-center gap-3 p-3 rounded-xl ${isEntrada ? 'bg-emerald-50/50' : 'bg-red-50/50'}">
                        <span class="material-symbols-outlined ${color} w-8 h-8 rounded-lg flex items-center justify-center text-lg">${icon}</span>
                        <div class="flex-1"><p class="text-sm font-bold">${log.oldQty} → ${log.newQty} <span class="text-xs font-normal text-slate-500">(${isEntrada ? '+' : ''}${log.delta})</span></p>
                        <p class="text-[10px] text-slate-500">${date} • ${log.user}</p></div>
                    </div>`;
                });
                html += '</div>';
                content.insertAdjacentHTML('beforeend', html);
            }
            content.insertAdjacentHTML('beforeend', '<div class="flex justify-end pt-4 mt-4 border-t border-outline-variant/10"><button type="button" onclick="App.closeModal()" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl">Fechar</button></div>');
        } catch (e) {
            console.error(e);
            App.showToast('Erro ao carregar histórico', 'error');
        }
    },

    // === 3. LEITOR DE CÓDIGO DE BARRAS ===
    openBarcodeScanner() {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-8">
            <div class="flex items-center gap-3 mb-6">
                <span class="material-symbols-outlined text-primary text-2xl">qr_code_scanner</span>
                <div><h3 class="font-headline font-bold text-xl">Scanner de Código de Barras</h3>
                <p class="text-on-surface-variant text-sm">Use a câmera para dar baixa rápida em produtos.</p></div>
            </div>
            <div id="scanner-area" class="relative bg-black rounded-2xl overflow-hidden mb-4" style="height:300px;">
                <video id="scanner-video" autoplay playsinline class="w-full h-full object-cover"></video>
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div class="w-64 h-40 border-2 border-primary rounded-xl" style="box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);"></div>
                </div>
                <p id="scanner-status" class="absolute bottom-3 left-0 right-0 text-center text-white text-xs font-bold bg-black/40 py-1">Posicione o código de barras na área</p>
            </div>
            <div class="text-center text-xs text-on-surface-variant mb-4">Ou digite manualmente:</div>
            <div class="flex gap-2 mb-4">
                <input type="text" id="manual-barcode" placeholder="Código de barras..." class="flex-1 px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface font-mono" />
                <button onclick="InventoryPage.searchBarcode()" class="px-5 py-3 vitality-gradient text-white font-bold rounded-xl flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">search</span>Buscar
                </button>
            </div>
            <div id="barcode-result" class="hidden"></div>
            <div class="flex justify-end pt-4 border-t border-outline-variant/10">
                <button type="button" onclick="InventoryPage.stopScanner(); App.closeModal();" class="px-6 py-3 text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-low transition-colors">Fechar</button>
            </div>
        </div>`;
        App.openModal();
        this.startScanner();
    },

    async startScanner() {
        try {
            const video = document.getElementById('scanner-video');
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            video.srcObject = stream;
            this._scannerStream = stream;

            // Use BarcodeDetector API if available
            if ('BarcodeDetector' in window) {
                const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code'] });
                this._scanInterval = setInterval(async () => {
                    try {
                        const barcodes = await detector.detect(video);
                        if (barcodes.length > 0) {
                            const code = barcodes[0].rawValue;
                            document.getElementById('manual-barcode').value = code;
                            document.getElementById('scanner-status').textContent = `✅ Código detectado: ${code}`;
                            this.stopScanner();
                            this.searchBarcode();
                        }
                    } catch (e) { /* silence */ }
                }, 500);
            } else {
                document.getElementById('scanner-status').textContent = 'Scanner não suportado neste navegador. Use entrada manual.';
            }
        } catch (e) {
            document.getElementById('scanner-status').textContent = '⚠ Câmera indisponível. Use entrada manual.';
            console.warn('Camera error:', e);
        }
    },

    stopScanner() {
        if (this._scanInterval) { clearInterval(this._scanInterval); this._scanInterval = null; }
        if (this._scannerStream) { this._scannerStream.getTracks().forEach(t => t.stop()); this._scannerStream = null; }
    },

    async searchBarcode() {
        const code = document.getElementById('manual-barcode')?.value?.trim();
        if (!code) { App.showToast('Digite ou escaneie um código', 'info'); return; }

        const resultDiv = document.getElementById('barcode-result');
        resultDiv.className = '';
        resultDiv.innerHTML = '<div class="text-center py-4"><div class="spinner mx-auto mb-2"></div></div>';

        const item = await Store.getInventoryByBarcode(code);
        if (!item) {
            resultDiv.innerHTML = `<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <span class="material-symbols-outlined text-amber-600">info</span>
                <div><p class="font-bold text-sm text-amber-800">Nenhum item encontrado</p>
                <p class="text-xs text-amber-600 mt-1">Código: <span class="font-mono">${code}</span> não está cadastrado.</p></div>
            </div>`;
            return;
        }

        const isLow = (item.quantity || 0) <= (item.minQuantity || 0);
        resultDiv.innerHTML = `<div class="bg-primary/5 border border-primary/15 rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
                <div><p class="font-bold text-on-surface">${item.name}</p>
                <p class="text-xs text-on-surface-variant">${item.category || 'Sem categoria'} • <span class="font-mono">${code}</span></p></div>
                <span class="text-2xl font-bold ${isLow ? 'text-red-600' : 'text-primary'}">${item.quantity || 0}</span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="InventoryPage.barcodeDeduct('${item.id}')" class="flex-1 py-2.5 bg-red-100 text-red-700 font-bold rounded-xl text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-lg">remove</span>Dar Baixa (−1)
                </button>
                <button onclick="InventoryPage.changeQty('${item.id}', 1); InventoryPage.searchBarcode();" class="flex-1 py-2.5 bg-emerald-100 text-emerald-700 font-bold rounded-xl text-sm hover:bg-emerald-200 transition-colors flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-lg">add</span>Entrada (+1)
                </button>
            </div>
        </div>`;
    },

    async barcodeDeduct(itemId) {
        await this.changeQty(itemId, -1);
        this.searchBarcode(); // refresh result
        App.showToast('Baixa registrada!', 'success');
    },

    // === 4. RELATÓRIO DE CONSUMO (PDF) ===
    async generatePDFReport() {
        App.showToast('Gerando relatório...', 'info');

        let logs = [];
        try { logs = await Store.getMovementLogs(); } catch(e) { /* skip */ }

        // Build consumption analysis
        const consumptionMap = {};
        logs.filter(l => l.type === 'saída').forEach(log => {
            if (!consumptionMap[log.itemName]) consumptionMap[log.itemName] = { name: log.itemName, totalOut: 0, count: 0 };
            consumptionMap[log.itemName].totalOut += Math.abs(log.delta || 1);
            consumptionMap[log.itemName].count++;
        });
        const rankings = Object.values(consumptionMap).sort((a, b) => b.totalOut - a.totalOut);

        const now = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
        const lowItems = this.allItems.filter(i => (i.quantity || 0) <= (i.minQuantity || 0));

        // Generate printable HTML
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório de Consumo - Studiobeauty</title>
        <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; color:#1a1a1a; padding:40px; max-width:800px; margin:0 auto; }
            h1 { font-size:24px; margin-bottom:4px; color:#4F46E5; }
            h2 { font-size:16px; margin:24px 0 12px; padding-bottom:8px; border-bottom:2px solid #E5E7EB; color:#374151; }
            .subtitle { color:#6B7280; font-size:13px; margin-bottom:24px; }
            table { width:100%; border-collapse:collapse; margin-bottom:20px; font-size:13px; }
            th { background:#F3F4F6; padding:10px 12px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#6B7280; }
            td { padding:10px 12px; border-bottom:1px solid #F3F4F6; }
            .low { background:#FEF2F2; color:#DC2626; font-weight:bold; }
            .badge { display:inline-block; padding:2px 8px; border-radius:8px; font-size:10px; font-weight:bold; }
            .badge-low { background:#FEE2E2; color:#DC2626; }
            .badge-ok { background:#D1FAE5; color:#059669; }
            .rank { color:#4F46E5; font-weight:bold; }
            .footer { margin-top:40px; padding-top:16px; border-top:1px solid #E5E7EB; font-size:11px; color:#9CA3AF; text-align:center; }
            @media print { body { padding:20px; } }
        </style></head><body>
        <h1>📦 Relatório de Consumo</h1>
        <p class="subtitle">Studiobeauty — Gerado em ${now}</p>

        <h2>📊 Resumo Geral</h2>
        <table><tr><th>Métrica</th><th>Valor</th></tr>
            <tr><td>Total de Itens</td><td><strong>${this.allItems.length}</strong></td></tr>
            <tr><td>Itens Ok</td><td><strong>${this.allItems.length - lowItems.length}</strong></td></tr>
            <tr ${lowItems.length > 0 ? 'class="low"' : ''}><td>⚠ Estoque Baixo</td><td><strong>${lowItems.length}</strong></td></tr>
            <tr><td>Movimentações Registradas</td><td><strong>${logs.length}</strong></td></tr>
        </table>

        ${lowItems.length > 0 ? `<h2>🔴 Itens com Estoque Baixo</h2><table><tr><th>Item</th><th>Categoria</th><th>Atual</th><th>Mínimo</th><th>Status</th></tr>
        ${lowItems.map(i => `<tr class="low"><td>${i.name}</td><td>${i.category || '--'}</td><td>${i.quantity || 0}</td><td>${i.minQuantity || 0}</td><td><span class="badge badge-low">CRÍTICO</span></td></tr>`).join('')}
        </table>` : ''}

        ${rankings.length > 0 ? `<h2>🔥 Ranking de Consumo (Mais Saídas)</h2><table><tr><th>#</th><th>Item</th><th>Total Saídas</th><th>Nº Movimentações</th></tr>
        ${rankings.slice(0, 15).map((r, i) => `<tr><td class="rank">${i+1}º</td><td>${r.name}</td><td><strong>${r.totalOut}</strong> unidades</td><td>${r.count}</td></tr>`).join('')}
        </table>` : '<h2>📈 Ranking de Consumo</h2><p style="color:#9CA3AF; font-size:13px;">Nenhuma saída registrada ainda. Use os botões "−" na tabela para registrar consumo.</p>'}

        <h2>📋 Inventário Completo</h2>
        <table><tr><th>Item</th><th>Categoria</th><th>Qtd</th><th>Mín</th><th>Status</th></tr>
        ${this.allItems.map(i => {
            const isLow = (i.quantity || 0) <= (i.minQuantity || 0);
            return `<tr ${isLow ? 'class="low"' : ''}><td>${i.name || '--'}</td><td>${i.category || '--'}</td><td>${i.quantity || 0}</td><td>${i.minQuantity || 0}</td><td><span class="badge ${isLow ? 'badge-low' : 'badge-ok'}">${isLow ? 'BAIXO' : 'OK'}</span></td></tr>`;
        }).join('')}
        </table>

        <div class="footer">Studiobeauty — Relatório gerado automaticamente</div>
        </body></html>`);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 500);
        App.showToast('Relatório gerado! Use Ctrl+P para salvar como PDF.', 'success');
    },

    // === MODALS ===
    showAddModal() {
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
        <div class="p-8">
            <h3 class="font-headline font-bold text-xl mb-2">Novo Item</h3>
            <p class="text-on-surface-variant text-sm mb-6">Adicione um produto ou material ao inventário.</p>
            <form id="inv-form" class="space-y-4">
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Nome do Item</label>
                    <input type="text" id="inv-name" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="Ex: Shampoo Profissional" required/>
                </div>
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Código de Barras (opcional)</label>
                    <input type="text" id="inv-barcode" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface font-mono" placeholder="EAN / UPC / Código interno"/>
                </div>
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Categoria</label>
                    <select id="inv-cat" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface">
                        <option value="">Selecione...</option>
                        <option value="Revenda">Produto de Revenda</option>
                        <option value="Uso Profissional">Material de Uso Profissional</option>
                        <option value="Consumível">Consumível</option>
                        <option value="Equipamento">Equipamento</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Quantidade</label>
                        <input type="number" id="inv-qty" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface" placeholder="0" min="0" required/>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Mínimo</label>
                        <input type="number" id="inv-min" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface" placeholder="0" min="0"/>
                    </div>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2">
                        <span class="material-symbols-outlined">save</span>Salvar
                    </button>
                </div>
            </form>
        </div>`;
        App.openModal();

        document.getElementById('inv-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const barcode = document.getElementById('inv-barcode').value.trim();
            await Store.addInventoryItem({
                name: document.getElementById('inv-name').value,
                category: document.getElementById('inv-cat').value,
                quantity: parseInt(document.getElementById('inv-qty').value) || 0,
                minQuantity: parseInt(document.getElementById('inv-min').value) || 0,
                ...(barcode && { barcode })
            });
            App.closeModal();
            App.showToast('Item adicionado!', 'success');
            InventoryPage.loadItems();
        });
    },

    showEditModal(itemId) {
        const item = this.allItems.find(i => i.id === itemId);
        if (!item) return;

        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
        <div class="p-8">
            <h3 class="font-headline font-bold text-xl mb-2">Editar Item</h3>
            <p class="text-on-surface-variant text-sm mb-6">Atualize os dados deste item.</p>
            <form id="inv-edit-form" class="space-y-4">
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Nome</label>
                    <input type="text" id="inv-edit-name" value="${item.name || ''}" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface" required/>
                </div>
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Código de Barras</label>
                    <input type="text" id="inv-edit-barcode" value="${item.barcode || ''}" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface font-mono" placeholder="EAN / UPC"/>
                </div>
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Categoria</label>
                    <select id="inv-edit-cat" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface">
                        <option value="" ${!item.category ? 'selected' : ''}>Selecione...</option>
                        <option value="Revenda" ${item.category === 'Revenda' ? 'selected' : ''}>Produto de Revenda</option>
                        <option value="Uso Profissional" ${item.category === 'Uso Profissional' ? 'selected' : ''}>Material de Uso Profissional</option>
                        <option value="Consumível" ${item.category === 'Consumível' ? 'selected' : ''}>Consumível</option>
                        <option value="Equipamento" ${item.category === 'Equipamento' ? 'selected' : ''}>Equipamento</option>
                        <option value="Outro" ${item.category === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Quantidade</label>
                        <input type="number" id="inv-edit-qty" value="${item.quantity || 0}" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface" min="0" required/>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Mínimo</label>
                        <input type="number" id="inv-edit-min" value="${item.minQuantity || 0}" class="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface" min="0"/>
                    </div>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2">
                        <span class="material-symbols-outlined">save</span>Atualizar
                    </button>
                </div>
            </form>
        </div>`;
        App.openModal();

        document.getElementById('inv-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const oldQty = item.quantity || 0;
            const newQty = parseInt(document.getElementById('inv-edit-qty').value) || 0;
            const barcode = document.getElementById('inv-edit-barcode').value.trim();

            await Store.updateInventoryItem(itemId, {
                name: document.getElementById('inv-edit-name').value,
                category: document.getElementById('inv-edit-cat').value,
                quantity: newQty,
                minQuantity: parseInt(document.getElementById('inv-edit-min').value) || 0,
                ...(barcode ? { barcode } : {})
            });

            // Log if qty changed
            if (newQty !== oldQty) {
                await Store.addMovementLog({
                    itemId, itemName: document.getElementById('inv-edit-name').value,
                    type: newQty > oldQty ? 'entrada' : 'saída',
                    oldQty, newQty, delta: newQty - oldQty
                });
            }

            App.closeModal();
            App.showToast('Item atualizado!', 'success');
            InventoryPage.loadItems();
        });
    },

    async deleteItem(id) {
        if (confirm('Excluir este item do inventário?')) {
            const item = this.allItems.find(i => i.id === id);
            await Store.deleteInventoryItem(id);
            if (item) {
                await Store.addMovementLog({
                    itemId: id, itemName: item.name, type: 'saída',
                    oldQty: item.quantity || 0, newQty: 0, delta: -(item.quantity || 0),
                    note: 'Item excluído'
                });
            }
            App.showToast('Item removido.', 'success');
            this.loadItems();
        }
    }
};
