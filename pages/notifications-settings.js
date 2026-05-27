// === Página: Notificações e Lembretes ===
const NotificationsSettingsPage = {
    render() {
        return `
        <div class="max-w-3xl mx-auto space-y-8">
            <div>
                <h2 class="font-headline text-3xl font-extrabold tracking-tight">Notificações e Lembretes</h2>
                <p class="text-on-surface-variant mt-1">Configure como o sistema notifica você e seus clientes.</p>
            </div>

            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">notifications</span> Canais de Notificação
                </h3>
                <div class="space-y-4">
                    <label class="flex items-center justify-between p-4 bg-surface-container-high rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
                        <div><p class="font-bold text-on-surface">E-mails de Lembrete</p><p class="text-sm text-on-surface-variant">Lembretes automáticos para clientes antes dos agendamentos</p></div>
                        <input type="checkbox" id="set-email-reminders" checked class="settings-input w-5 h-5 text-primary"/>
                    </label>
                    <label class="flex items-center justify-between p-4 bg-surface-container-high rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
                        <div><p class="font-bold text-on-surface">Notificações Push</p><p class="text-sm text-on-surface-variant">Receba alertas em tempo real sobre novos agendamentos</p></div>
                        <input type="checkbox" id="set-push-notif" class="settings-input w-5 h-5 text-primary"/>
                    </label>
                </div>

                <!-- Mensagem personalizada -->
                <div class="mt-6">
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Mensagem de Saudação do Lembrete</label>
                    <textarea id="set-greeting-msg" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface resize-none h-24 text-sm" placeholder="Olá {nome}! Lembrando da sua consulta de {serviço} no dia {data} às {hora}. Esperamos você! 🌸"></textarea>
                    <div class="flex flex-wrap gap-2 mt-2">
                        <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Variáveis:</span>
                        <button onclick="NotificationsSettingsPage.insertVar('{nome}')" class="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20">{nome}</button>
                        <button onclick="NotificationsSettingsPage.insertVar('{serviço}')" class="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20">{serviço}</button>
                        <button onclick="NotificationsSettingsPage.insertVar('{data}')" class="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20">{data}</button>
                        <button onclick="NotificationsSettingsPage.insertVar('{hora}')" class="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20">{hora}</button>
                        <button onclick="NotificationsSettingsPage.insertVar('{empresa}')" class="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20">{empresa}</button>
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button onclick="NotificationsSettingsPage.save()" class="px-8 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2">
                    <span class="material-symbols-outlined">save</span> Salvar Notificações
                </button>
            </div>
        </div>`;
    },

    async init() {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        if (s.emailReminders === false) document.getElementById('set-email-reminders').checked = false;
        if (s.pushNotif) document.getElementById('set-push-notif').checked = true;
        if (s.greetingMsg) document.getElementById('set-greeting-msg').value = s.greetingMsg;
    },

    insertVar(v) {
        const ta = document.getElementById('set-greeting-msg');
        if (!ta) return;
        const s = ta.selectionStart, e = ta.selectionEnd;
        ta.value = ta.value.substring(0, s) + v + ta.value.substring(e);
        ta.selectionStart = ta.selectionEnd = s + v.length;
        ta.focus();
    },

    save() {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        s.emailReminders = document.getElementById('set-email-reminders')?.checked;
        s.pushNotif      = document.getElementById('set-push-notif')?.checked;
        s.greetingMsg    = document.getElementById('set-greeting-msg')?.value;
        localStorage.setItem('ch_settings', JSON.stringify(s));
        App.showToast('Configurações de notificação salvas! ✅', 'success');
    }
};
