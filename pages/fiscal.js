// === Página: Dados Fiscais ===
const FiscalPage = {
    render() {
        return `
        <div class="max-w-3xl mx-auto space-y-8">
            <div>
                <h2 class="font-headline text-3xl font-extrabold tracking-tight">Dados Fiscais (NFS-e)</h2>
                <p class="text-on-surface-variant mt-1">Configure os dados necessários para emissão de Notas Fiscais de Serviço Eletrônicas.</p>
            </div>

            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">receipt_long</span> Informações Fiscais
                </h3>
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">CNPJ</label>
                            <input type="text" id="set-fiscal-cnpj" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="00.000.000/0000-00" maxlength="18"/>
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Inscrição Municipal</label>
                            <input type="text" id="set-fiscal-insc-municipal" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Número da inscrição municipal"/>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">CNAE Principal</label>
                            <input type="text" id="set-fiscal-cnae" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="8630-5/03" maxlength="12"/>
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Código Serviço Padrão</label>
                            <input type="text" id="set-fiscal-service-code" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="0601" value="0601"/>
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Alíquota ISS (%)</label>
                            <input type="number" id="set-fiscal-iss-rate" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="5" value="5" step="0.01" min="0" max="100"/>
                        </div>
                    </div>
                    <div class="border-t border-outline-variant/10 pt-4">
                        <h4 class="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary text-base">vpn_key</span> Integração Focus NFe
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">API Token Focus NFe</label>
                                <input type="password" id="set-fiscal-api-token" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Insira seu token da Focus NFe"/>
                                <p class="text-[10px] text-on-surface-variant mt-1">Obtido em: focusnfe.com.br → Credenciais da API</p>
                            </div>
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Ambiente</label>
                                <select id="set-fiscal-environment" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm">
                                    <option value="homologacao">🟡 Homologação (Testes)</option>
                                    <option value="producao">🟢 Produção (Real)</option>
                                </select>
                            </div>
                        </div>
                        <div class="mt-3 p-3 bg-amber-50 rounded-xl flex items-start gap-2">
                            <span class="material-symbols-outlined text-amber-600 text-sm mt-0.5">info</span>
                            <p class="text-[11px] text-amber-800">No modo <strong>MVP/Demo</strong>, as notas são simuladas localmente. Para emissão real, configure o token e altere para <strong>Produção</strong>.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button onclick="FiscalPage.save()" class="px-8 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2">
                    <span class="material-symbols-outlined">save</span> Salvar Dados Fiscais
                </button>
            </div>
        </div>`;
    },

    async init() {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        if (s.fiscalCnpj)        document.getElementById('set-fiscal-cnpj').value = s.fiscalCnpj;
        if (s.fiscalInscMun)     document.getElementById('set-fiscal-insc-municipal').value = s.fiscalInscMun;
        if (s.fiscalCnae)        document.getElementById('set-fiscal-cnae').value = s.fiscalCnae;
        if (s.fiscalServiceCode) document.getElementById('set-fiscal-service-code').value = s.fiscalServiceCode;
        if (s.fiscalIssRate)     document.getElementById('set-fiscal-iss-rate').value = s.fiscalIssRate;
        if (s.fiscalApiToken)    document.getElementById('set-fiscal-api-token').value = s.fiscalApiToken;
        if (s.fiscalEnvironment) document.getElementById('set-fiscal-environment').value = s.fiscalEnvironment;

        // CNPJ mask
        document.getElementById('set-fiscal-cnpj')?.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '').slice(0, 14);
            if (v.length > 12) v = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8,12)}-${v.slice(12)}`;
            else if (v.length > 8) v = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8)}`;
            else if (v.length > 5) v = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5)}`;
            else if (v.length > 2) v = `${v.slice(0,2)}.${v.slice(2)}`;
            e.target.value = v;
        });
    },

    save() {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        s.fiscalCnpj        = document.getElementById('set-fiscal-cnpj')?.value || '';
        s.fiscalInscMun     = document.getElementById('set-fiscal-insc-municipal')?.value || '';
        s.fiscalCnae        = document.getElementById('set-fiscal-cnae')?.value || '';
        s.fiscalServiceCode = document.getElementById('set-fiscal-service-code')?.value || '0601';
        s.fiscalIssRate     = document.getElementById('set-fiscal-iss-rate')?.value || '5';
        s.fiscalApiToken    = document.getElementById('set-fiscal-api-token')?.value || '';
        s.fiscalEnvironment = document.getElementById('set-fiscal-environment')?.value || 'homologacao';
        localStorage.setItem('ch_settings', JSON.stringify(s));
        App.showToast('Dados fiscais salvos! ✅', 'success');
    }
};
