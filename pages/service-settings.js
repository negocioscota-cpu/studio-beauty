// === Configurações de Serviço (combinado: Horário + Moeda) ===
const ServiceSettingsPage = {
    _tabs: [
        { id: 'hours',    label: 'Horário de Funcionamento', icon: 'schedule' },
        { id: 'currency', label: 'Moeda e Serviço',          icon: 'payments' }
    ],

    render() {
        const tabs = this._tabs.map((t, i) => `
            <button class="ss-tab flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${i === 0 ? 'bg-[#58323F] text-white shadow' : 'text-[#58323F] hover:bg-white/60'}" data-tab="${t.id}">
                <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1">${t.icon}</span>
                <span class="hidden sm:inline">${t.label}</span>
                <span class="sm:hidden">${t.label.split(' ')[0]}</span>
            </button>`).join('');
        return `
        <div>
            <div class="flex gap-1.5 p-1.5 bg-[#F0E8DC] rounded-2xl mb-8">${tabs}</div>
            <div id="ss-tab-body"></div>
        </div>`;
    },

    async init() {
        document.querySelectorAll('.ss-tab').forEach(btn => {
            btn.addEventListener('click', () => this._switch(btn.dataset.tab));
        });
        this._switch('hours');
    },

    _switch(tabId) {
        document.querySelectorAll('.ss-tab').forEach(b => {
            const on = b.dataset.tab === tabId;
            b.classList.toggle('bg-[#58323F]', on);
            b.classList.toggle('text-white', on);
            b.classList.toggle('shadow', on);
            b.classList.toggle('text-[#58323F]', !on);
        });
        const body = document.getElementById('ss-tab-body');
        if (!body) return;
        if (tabId === 'hours') {
            body.innerHTML = BusinessHoursPage.render();
            BusinessHoursPage.init();
        } else {
            body.innerHTML = CurrencyServicePage.render();
            CurrencyServicePage.init();
        }
    }
};
