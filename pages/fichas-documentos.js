// === Fichas & Documentos (combinado) ===
const FichasDocumentosPage = {
    _tabs: [
        { id: 'fichas',   label: 'Fichas Técnicas', icon: 'clinical_notes' },
        { id: 'consent',  label: 'Consentimento',   icon: 'draw' }
    ],

    render() {
        const tabs = this._tabs.map((t, i) => `
            <button class="fd-tab flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${i === 0 ? 'bg-[#58323F] text-white shadow' : 'text-[#58323F] hover:bg-white/60'}" data-tab="${t.id}">
                <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1">${t.icon}</span>
                ${t.label}
            </button>`).join('');
        return `
        <div>
            <div class="flex gap-1.5 p-1.5 bg-[#F0E8DC] rounded-2xl mb-8">${tabs}</div>
            <div id="fd-tab-body"></div>
        </div>`;
    },

    async init() {
        document.querySelectorAll('.fd-tab').forEach(btn => {
            btn.addEventListener('click', () => this._switch(btn.dataset.tab));
        });
        this._switch('fichas');
    },

    _switch(tabId) {
        document.querySelectorAll('.fd-tab').forEach(b => {
            const on = b.dataset.tab === tabId;
            b.classList.toggle('bg-[#58323F]', on);
            b.classList.toggle('text-white', on);
            b.classList.toggle('shadow', on);
            b.classList.toggle('text-[#58323F]', !on);
        });
        const body = document.getElementById('fd-tab-body');
        if (!body) return;
        if (tabId === 'fichas') {
            body.innerHTML = FichaTecnicaPage.render();
            FichaTecnicaPage.init();
        } else {
            body.innerHTML = ConsentPage.render();
            ConsentPage.init();
        }
    }
};
