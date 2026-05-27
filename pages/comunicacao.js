// === Central de Comunicação (combinado: Lembretes WhatsApp + Notificações) ===
const ComunicacaoPage = {
    _tabs: [
        { id: 'lembretes',      label: 'Lembretes WhatsApp',    icon: 'chat' },
        { id: 'notificacoes',   label: 'Notificações',           icon: 'notifications' },
        { id: 'booking',        label: 'Link de Agendamento',    icon: 'link' },
        { id: 'bio',            label: 'Link da Bio',             icon: 'share' }
    ],

    render() {
        const tabs = this._tabs.map((t, i) => `
            <button class="com-tab flex-1 py-3 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${i === 0 ? 'bg-[#58323F] text-white shadow' : 'text-[#58323F] hover:bg-white/60'}" data-tab="${t.id}">
                <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1">${t.icon}</span>
                <span class="hidden sm:inline">${t.label}</span>
                <span class="sm:hidden">${t.label.split(' ')[0]}</span>
            </button>`).join('');
        return `
        <div>
            <div class="flex gap-1 p-1.5 bg-[#F0E8DC] rounded-2xl mb-8">${tabs}</div>
            <div id="com-tab-body"></div>
        </div>`;
    },

    async init() {
        document.querySelectorAll('.com-tab').forEach(btn => {
            btn.addEventListener('click', () => this._switch(btn.dataset.tab));
        });
        this._switch('lembretes');
    },

    _switch(tabId) {
        document.querySelectorAll('.com-tab').forEach(b => {
            const on = b.dataset.tab === tabId;
            b.classList.toggle('bg-[#58323F]', on);
            b.classList.toggle('text-white', on);
            b.classList.toggle('shadow', on);
            b.classList.toggle('text-[#58323F]', !on);
        });
        const body = document.getElementById('com-tab-body');
        if (!body) return;
        if (tabId === 'lembretes') {
            body.innerHTML = RemindersPage.render();
            RemindersPage.init();
        } else if (tabId === 'notificacoes') {
            body.innerHTML = NotificationsSettingsPage.render();
            NotificationsSettingsPage.init();
        } else if (tabId === 'booking') {
            body.innerHTML = BookingLinkPage.render();
            BookingLinkPage.init();
        } else {
            body.innerHTML = BioLinkPage.render();
            BioLinkPage.init();
        }
    }
};
