// === Minha Conta (combinado: Perfil + Assinatura + Dados Fiscais + Configurações) ===
const MinhaContaPage = {
    _tabs: [
        { id: 'perfil',      label: 'Perfil da Empresa',  icon: 'store' },
        { id: 'assinatura',  label: 'Minha Assinatura',   icon: 'workspace_premium' },
        { id: 'fiscal',      label: 'Dados Fiscais (Opcional)', icon: 'receipt_long' }
    ],

    render() {
        const tabs = this._tabs.map((t, i) => `
            <button class="mc-tab flex-1 py-3 px-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 sm:flex-row sm:gap-1.5 sm:text-xs ${i === 0 ? 'bg-[#58323F] text-white shadow' : 'text-[#58323F] hover:bg-white/60'}" data-tab="${t.id}">
                <span class="material-symbols-outlined text-base sm:text-sm" style="font-variation-settings:'FILL' 1">${t.icon}</span>
                <span class="hidden sm:inline">${t.label}</span>
                <span class="sm:hidden text-[9px] leading-tight text-center">${t.label.split(' ').slice(0, 2).join(' ')}</span>
            </button>`).join('');
        return `
        <div>
            <div class="flex gap-1 p-1.5 bg-[#F0E8DC] rounded-2xl mb-8">${tabs}</div>
            <div id="mc-tab-body"></div>
        </div>`;
    },

    async init() {
        document.querySelectorAll('.mc-tab').forEach(btn => {
            btn.addEventListener('click', () => this._switch(btn.dataset.tab));
        });
        // Abrir na aba correta se vier de um link direto
        const hash = window.location.hash || '';
        if (hash.includes('assinatura'))   this._switch('assinatura');
        else if (hash.includes('fiscal'))  this._switch('fiscal');
        else if (hash.includes('config'))  this._switch('config');
        else                               this._switch('perfil');
    },

    _switch(tabId) {
        document.querySelectorAll('.mc-tab').forEach(b => {
            const on = b.dataset.tab === tabId;
            b.classList.toggle('bg-[#58323F]', on);
            b.classList.toggle('text-white', on);
            b.classList.toggle('shadow', on);
            b.classList.toggle('text-[#58323F]', !on);
        });
        const body = document.getElementById('mc-tab-body');
        if (!body) return;
        switch (tabId) {
            case 'perfil':
                body.innerHTML = CompanyProfilePage.render();
                CompanyProfilePage.init();
                break;
            case 'assinatura':
                body.innerHTML = SubscriptionPage.render();
                SubscriptionPage.init();
                break;
            case 'fiscal':
                body.innerHTML = FiscalPage.render();
                FiscalPage.init();
                break;
        }
    }
};
