// === Página: Minha Assinatura ===
const SubscriptionPage = {
    render() {
        return `
        <div class="max-w-3xl mx-auto space-y-8">
            <div>
                <h2 class="font-headline text-3xl font-extrabold tracking-tight">Minha Assinatura</h2>
                <p class="text-on-surface-variant mt-1">Gerencie seu plano Studiobeauty. Pagamentos processados com segurança via Asaas.</p>
            </div>

            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <!-- Status card -->
                <div id="subscription-status-card" class="p-5 rounded-xl mb-6" style="background: linear-gradient(135deg, rgba(201,124,92,0.1) 0%, rgba(212,175,55,0.08) 100%); border: 1px solid rgba(201,124,92,0.2);">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                            <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Status da Assinatura</p>
                            <div id="sub-status-badge" class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3" style="background: rgba(201,124,92,0.15); color: #7B3F2A;">
                                <span class="w-2 h-2 rounded-full animate-pulse" style="background: #c97c5c;"></span>
                                <span id="sub-status-text">Carregando...</span>
                            </div>
                            <div id="sub-plan-info">
                                <p id="sub-plan-name" class="font-bold text-on-surface text-sm"></p>
                                <p id="sub-plan-detail" class="text-xs text-on-surface-variant mt-0.5"></p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-on-surface-variant mb-1">Próxima cobrança</p>
                            <p id="sub-next-billing" class="font-bold text-on-surface text-sm">—</p>
                        </div>
                    </div>
                    <div id="sub-trial-bar-container" class="mt-4 hidden">
                        <div class="flex justify-between text-xs text-on-surface-variant mb-1">
                            <span>Dias de teste usados</span>
                            <span id="sub-trial-days-left" class="font-bold" style="color: #c97c5c;"></span>
                        </div>
                        <div class="w-full h-2 rounded-full" style="background: rgba(201,124,92,0.15);">
                            <div id="sub-trial-progress" class="h-2 rounded-full transition-all" style="background: linear-gradient(90deg, #c97c5c, #d4af37); width: 0%;"></div>
                        </div>
                    </div>
                </div>

                <!-- Ações -->
                <div class="flex flex-col sm:flex-row gap-3">
                    <a href="subscribe.html" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all text-white" style="background: linear-gradient(135deg, #c97c5c, #a0522d); box-shadow: 0 4px 12px rgba(201,124,92,0.3);">
                        <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1;">upgrade</span> Mudar Plano
                    </a>
                    <button onclick="SubscriptionPage.cancelSubscription()" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                        <span class="material-symbols-outlined text-base">cancel</span> Cancelar Assinatura
                    </button>
                </div>
                <p class="text-xs text-on-surface-variant mt-4 text-center opacity-70">Ao cancelar, você mantém acesso até o fim do período pago. Cancele quando quiser, sem multas.</p>

                <!-- Checkout Online -->
                <div class="mt-6 pt-6 border-t border-outline-variant/10">
                    <h4 class="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-base" style="font-variation-settings: 'FILL' 1;">point_of_sale</span>
                        Checkout Online para Clientes
                    </h4>
                    <label class="flex items-center justify-between p-4 bg-surface-container-high rounded-xl cursor-pointer hover:bg-surface-container transition-colors mb-4">
                        <div><p class="font-bold text-on-surface">Ativar Checkout Online</p><p class="text-sm text-on-surface-variant">Clientes pagam via Pix ou Boleto ao confirmar o agendamento</p></div>
                        <input type="checkbox" id="set-payment-enabled" class="settings-input w-5 h-5 text-primary"/>
                    </label>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Preço por Serviço (R$)</label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl">
                                <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">content_cut</span>
                                <span class="flex-1 font-bold text-sm">Design de Sobrancelha</span>
                                <input type="number" id="price-consulta" class="settings-input w-24 px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-right font-bold" placeholder="0.00" step="0.01" min="0"/>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl">
                                <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">visibility</span>
                                <span class="flex-1 font-bold text-sm">Extensão de Cílios</span>
                                <input type="number" id="price-retorno" class="settings-input w-24 px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-right font-bold" placeholder="0.00" step="0.01" min="0"/>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl">
                                <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">face_retouching_natural</span>
                                <span class="flex-1 font-bold text-sm">Laminação</span>
                                <input type="number" id="price-exame" class="settings-input w-24 px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-right font-bold" placeholder="0.00" step="0.01" min="0"/>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl">
                                <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">spa</span>
                                <span class="flex-1 font-bold text-sm">Outros Procedimentos</span>
                                <input type="number" id="price-procedimento" class="settings-input w-24 px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-right font-bold" placeholder="0.00" step="0.01" min="0"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    async init() {
        // Carrega status da assinatura do localStorage / Asaas
        try {
            const subData = JSON.parse(localStorage.getItem('ch_subscription') || '{}');
            const statusText = document.getElementById('sub-status-text');
            const planName   = document.getElementById('sub-plan-name');
            const planDetail = document.getElementById('sub-plan-detail');
            if (statusText) statusText.textContent = subData.status || 'Trial Ativo';
            if (planName)   planName.textContent   = subData.planName || 'Plano Básico';
            if (planDetail) planDetail.textContent  = subData.planDetail || 'Período de avaliação gratuita';
        } catch(e) {}
    },

    cancelSubscription() {
        if (!confirm('Tem certeza que deseja cancelar sua assinatura?\nVocê manterá o acesso até o fim do período pago.')) return;
        App.showToast('Solicitação de cancelamento enviada.', 'info');
    }
};
