// === Catálogo & Portfólio (combinado) ===
const CatalogPortfolioPage = {
    _tabs: [
        { id: 'catalog',   label: 'Catálogo de Serviços', icon: 'menu_book' },
        { id: 'portfolio', label: 'Portfólio',             icon: 'photo_library' }
    ],

    render() {
        const tabs = this._tabs.map((t, i) => `
            <button class="cp-tab flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${i === 0 ? 'bg-[#58323F] text-white shadow' : 'text-[#58323F] hover:bg-white/60'}" data-tab="${t.id}">
                <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1">${t.icon}</span>
                <span class="hidden sm:inline">${t.label}</span>
                <span class="sm:hidden">${t.label.split(' ')[0]}</span>
            </button>`).join('');
        return `
        <div>
            <div class="flex gap-1.5 p-1.5 bg-[#F0E8DC] rounded-2xl mb-8">${tabs}</div>
            <div id="cp-tab-body"></div>
        </div>`;
    },

    async init() {
        document.querySelectorAll('.cp-tab').forEach(btn => {
            btn.addEventListener('click', () => this._switch(btn.dataset.tab));
        });
        this._switch('catalog');
    },

    _switch(tabId) {
        document.querySelectorAll('.cp-tab').forEach(b => {
            const on = b.dataset.tab === tabId;
            b.classList.toggle('bg-[#58323F]', on);
            b.classList.toggle('text-white', on);
            b.classList.toggle('shadow', on);
            b.classList.toggle('text-[#58323F]', !on);
        });
        const body = document.getElementById('cp-tab-body');
        if (!body) return;
        if (tabId === 'catalog') {
            body.innerHTML = CatalogPage.render();
            CatalogPage.init();
        } else {
            body.innerHTML = PortfolioPage.render();
            PortfolioPage.init();
        }
    }
};
