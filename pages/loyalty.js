// === Loyalty Program Page ===
const LoyaltyPage = {
    clients: [],
    rules: { pointsPerReal: 1, rewardPoints: 500, rewardName: "Design de Sobrancelha Premium" },

    render() {
        return `
        <div class="space-y-8 max-w-[1400px] mobile-full-width mx-auto animation-fade-in pb-20">
            <!-- Header -->
            <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Programa de Fidelidade</h2>
                    <p class="text-on-surface-variant mt-1">Estimule o retorno das suas clientes com pontuação por procedimentos e resgate de recompensas.</p>
                </div>
            </section>

            <!-- Grid de Regras e Busca -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Regras do Programa -->
                <div class="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/10 shadow-xs space-y-4">
                    <h3 class="font-headline font-bold text-lg text-primary flex items-center gap-1.5">
                        <span class="material-symbols-outlined">settings_suggest</span>
                        Regras do Estúdio
                    </h3>
                    <div class="space-y-3 text-sm text-on-surface">
                        <div class="p-3 bg-primary/5 rounded-xl border border-primary/10" style="background-color: rgba(199, 123, 107, 0.05);">
                            <span class="text-xs text-on-surface-variant block uppercase font-bold">Conversão Básica</span>
                            <strong>R$ 1,00 Gasto = ${LoyaltyPage.rules.pointsPerReal} Ponto(s)</strong>
                        </div>
                        <div class="p-3 bg-surface-container rounded-xl">
                            <span class="text-xs text-on-surface-variant block uppercase font-bold">Recompensa Atual</span>
                            <strong>${LoyaltyPage.rules.rewardPoints} Pontos = ${LoyaltyPage.rules.rewardName}</strong>
                        </div>
                    </div>
                </div>

                <!-- Painel de Busca e Ação rápida por Cliente -->
                <div class="lg:col-span-2 bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/10 shadow-xs space-y-6">
                    <div>
                        <h3 class="font-headline font-bold text-lg text-on-surface">Clientes & Saldos</h3>
                        <p class="text-xs text-on-surface-variant mt-0.5">Busque a cliente e gerencie seus pontos em tempo real.</p>
                    </div>
                    
                    <!-- Search input -->
                    <div class="relative">
                        <input type="text" id="loyalty-search" class="w-full pl-11 pr-4 py-3 bg-surface-container border-none rounded-xl text-sm text-on-surface" placeholder="Digite o nome da cliente..." />
                        <span class="material-symbols-outlined absolute left-4 top-3 text-on-surface-variant text-xl">search</span>
                    </div>

                    <!-- Clientes Saldos Lista -->
                    <div id="loyalty-list" class="space-y-3 max-h-[300px] overflow-y-auto">
                        <div class="text-center py-6 text-on-surface-variant text-sm">Carregando dados das clientes...</div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    async init() {
        // Search trigger
        const searchInput = document.getElementById('loyalty-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                LoyaltyPage.renderList(searchInput.value.trim());
            });
        }

        await LoyaltyPage.loadData();
    },

    async loadData() {
        try {
            LoyaltyPage.clients = await Store.getClients();
            LoyaltyPage.renderList();
        } catch (error) {
            console.error("Erro ao carregar dados do fidelidade:", error);
            App.showToast("Falha ao carregar saldos de fidelidade.", "error");
        }
    },

    renderList(query = '') {
        const list = document.getElementById('loyalty-list');
        if (!list) return;

        const filtered = query.length === 0
            ? LoyaltyPage.clients
            : LoyaltyPage.clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

        if (filtered.length === 0) {
            list.innerHTML = `<div class="text-center py-8 text-on-surface-variant text-xs">Nenhuma cliente encontrada com o nome digitado.</div>`;
            return;
        }

        list.innerHTML = filtered.map(client => {
            const points = client.loyaltyPoints || 0;
            const progress = Math.min(Math.round((points / LoyaltyPage.rules.rewardPoints) * 100), 100);
            const canRedeem = points >= LoyaltyPage.rules.rewardPoints;

            return `
            <div class="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex-1 space-y-2">
                    <div class="flex items-center gap-2">
                        <h4 class="font-headline font-bold text-sm text-on-surface">${client.name}</h4>
                        <span class="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-full" style="background-color: rgba(199, 123, 107, 0.1);">
                            ${points} pts
                        </span>
                    </div>

                    <!-- Progress bar to reward -->
                    <div class="space-y-1">
                        <div class="flex justify-between text-[10px] text-on-surface-variant font-medium">
                            <span>Progresso para o Prêmio</span>
                            <span>${progress}% (${points}/${LoyaltyPage.rules.rewardPoints} pts)</span>
                        </div>
                        <div class="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                            <div class="h-full vitality-gradient rounded-full" style="width: ${progress}%;"></div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 self-end md:self-center shrink-0">
                    <!-- Lancar pontos -->
                    <button onclick="LoyaltyPage.showAddPointsModal('${client.id}')" class="px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs rounded-xl flex items-center gap-1 transition-colors">
                        <span class="material-symbols-outlined text-base">add</span>
                        Crédito
                    </button>
                    <!-- Resgatar -->
                    <button onclick="LoyaltyPage.redeemPoints('${client.id}')" ${!canRedeem ? 'disabled' : ''} 
                        class="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md flex items-center gap-1 transition-all ${canRedeem ? 'vitality-gradient hover:scale-102 cursor-pointer shadow-primary/10' : 'bg-slate-300 shadow-none cursor-not-allowed opacity-60'}">
                        <span class="material-symbols-outlined text-base">celebration</span>
                        Resgatar Prêmio
                    </button>
                </div>
            </div>`;
        }).join('');
    },

    showAddPointsModal(clientId) {
        const client = LoyaltyPage.clients.find(c => c.id === clientId);
        if (!client) return;

        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-8 max-w-sm mx-auto">
            <h3 class="font-headline font-bold text-xl mb-1">Pontuar Cliente</h3>
            <p class="text-on-surface-variant text-xs mb-6">Insira o valor em dinheiro do procedimento para converter em pontos para <strong>${client.name}</strong>.</p>
            <form id="points-form" class="space-y-4">
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Valor do Procedimento (R$)</label>
                    <input type="number" id="pts-amount" step="0.01" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Ex: 180.00" required />
                </div>
                <div class="p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs text-primary" style="background-color: rgba(199, 123, 107, 0.05);">
                    💡 Equivalência estimada: <strong id="pts-calc-preview">0 pontos</strong>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-5 py-2 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl text-xs transition-colors">Cancelar</button>
                    <button type="submit" class="px-5 py-2 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all text-xs flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">save</span>
                        Salvar Pontos
                    </button>
                </div>
            </form>
        </div>`;
        App.openModal();

        const amtInput = document.getElementById('pts-amount');
        const calcPreview = document.getElementById('pts-calc-preview');

        amtInput.addEventListener('input', () => {
            const val = parseFloat(amtInput.value) || 0;
            const pts = Math.round(val * LoyaltyPage.rules.pointsPerReal);
            calcPreview.textContent = `${pts} ponto${pts > 1 || pts === 0 ? 's' : ''}`;
        });

        document.getElementById('points-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const val = parseFloat(amtInput.value) || 0;
            const pts = Math.round(val * LoyaltyPage.rules.pointsPerReal);

            try {
                const currentPoints = client.loyaltyPoints || 0;
                await Store.updateClient(clientId, {
                    loyaltyPoints: currentPoints + pts
                });
                App.closeModal();
                App.showToast(`Creditados ${pts} pontos com sucesso!`, "success");
                await LoyaltyPage.loadData();
            } catch (err) {
                console.error("Erro ao creditar pontos:", err);
                App.showToast("Erro ao creditar pontos no Firebase.", "error");
            }
        });
    },

    async redeemPoints(clientId) {
        const client = LoyaltyPage.clients.find(c => c.id === clientId);
        if (!client) return;

        if (!confirm(`Confirmar o resgate da recompensa "${LoyaltyPage.rules.rewardName}" para ${client.name}? Serão debitados ${LoyaltyPage.rules.rewardPoints} pontos.`)) return;

        try {
            const currentPoints = client.loyaltyPoints || 0;
            await Store.updateClient(clientId, {
                loyaltyPoints: Math.max(0, currentPoints - LoyaltyPage.rules.rewardPoints)
            });
            App.showToast("Prêmio resgatado e entregue com sucesso! 🎉", "success");
            await LoyaltyPage.loadData();
        } catch (err) {
            console.error("Erro ao resgatar pontos:", err);
            App.showToast("Erro ao processar resgate no Firebase.", "error");
        }
    }
};
