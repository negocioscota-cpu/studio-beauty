// === Reminders & WhatsApp Page ===
const RemindersPage = {
    reminders: [],

    render() {
        return `
        <div class="space-y-8 max-w-[1400px] mobile-full-width mx-auto animation-fade-in pb-20">
            <!-- Header -->
            <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Lembretes & WhatsApp</h2>
                    <p class="text-on-surface-variant mt-1">Envie lembretes e mensagens personalizadas de confirmação e pós-procedimento.</p>
                </div>
                <div>
                    <button id="btn-new-reminder" class="px-5 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">add_alarm</span>
                        Novo Lembrete Manual
                    </button>
                </div>
            </section>

            <!-- Lembretes Grid/List -->
            <div class="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/10 shadow-xs">
                <h3 class="font-headline font-bold text-lg mb-4">Mensagens Pendentes de Hoje</h3>
                <div id="reminders-list" class="space-y-4">
                    <div class="text-center py-12 text-on-surface-variant text-sm">
                        <div class="spinner mx-auto mb-4"></div>
                        <p>Carregando lembretes...</p>
                    </div>
                </div>
            </div>
        </div>`;
    },

    async init() {
        document.getElementById('btn-new-reminder')?.addEventListener('click', () => RemindersPage.showFormModal());
        await RemindersPage.loadData();
    },

    async loadData() {
        try {
            // Primeiro, carregar os lembretes do banco
            const dbReminders = await Store.getReminders();
            
            // Gerar dinamicamente lembretes baseados nos agendamentos de amanhã se a lista estiver vazia (auto-geração inteligente para WOW!)
            if (dbReminders.length === 0) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                const appts = await Store.getAppointments();
                const tomorrowAppts = appts.filter(a => {
                    const d = a.date ? new Date(a.date.seconds * 1000) : null;
                    return d && d.toDateString() === tomorrow.toDateString() && a.status !== 'cancelled';
                });

                for (const appt of tomorrowAppts) {
                    const client = await Store.getClient(appt.clientId);
                    const timeStr = appt.date ? new Date(appt.date.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
                    
                    const reminderData = {
                        clientName: appt.clientName || 'Cliente',
                        phone: client ? (client.phone || '') : '',
                        type: 'Confirmação',
                        dueDate: tomorrow,
                        message: `Olá, ${appt.clientName}! Passando para confirmar seu procedimento de ${appt.service || 'estética'} marcado para amanhã, às ${timeStr}, aqui no Studiobeauty. Podemos confirmar? ✨`,
                        apptId: appt.id
                    };
                    await Store.addReminder(reminderData);
                }
                
                // Recarregar após a geração automática
                RemindersPage.reminders = await Store.getReminders();
            } else {
                RemindersPage.reminders = dbReminders;
            }

            RemindersPage.renderList();
        } catch (error) {
            console.error("Erro ao carregar lembretes:", error);
            App.showToast("Falha ao carregar lista de lembretes.", "error");
        }
    },

    renderList() {
        const list = document.getElementById('reminders-list');
        if (!list) return;

        if (RemindersPage.reminders.length === 0) {
            list.innerHTML = `
            <div class="text-center py-12 text-on-surface-variant">
                <span class="material-symbols-outlined text-primary/30 text-5xl mb-4" style="font-variation-settings: 'FILL' 1;">sms</span>
                <h4 class="font-headline font-bold text-base text-on-surface">Tudo limpo por aqui!</h4>
                <p class="text-xs mt-1">Nenhum lembrete ou confirmação de agendamento pendente no momento.</p>
            </div>`;
            return;
        }

        list.innerHTML = RemindersPage.reminders.map(rem => {
            const dateStr = rem.dueDate ? new Date(rem.dueDate.seconds * 1000).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
            const encodedMsg = encodeURIComponent(rem.message || '');
            const cleanPhone = (rem.phone || '').replace(/\D/g, '');
            const waUrl = `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodedMsg}`;
            const isConf = rem.type === 'Confirmação';

            return `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-surface-container-low rounded-2xl border border-outline-variant/10 hover:border-primary/20 transition-all">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isConf ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'}" style="${isConf ? 'background-color: rgba(199, 123, 107, 0.1);' : ''}">
                        <span class="material-symbols-outlined">${isConf ? 'event_upcoming' : 'history'}</span>
                    </div>
                    <div class="space-y-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h4 class="font-headline font-bold text-sm text-on-surface">${rem.clientName}</h4>
                            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${isConf ? 'bg-primary/15 text-primary' : 'bg-amber-100 text-amber-800'}" style="${isConf ? 'background-color: rgba(199, 123, 107, 0.15);' : ''}">
                                ${rem.type || 'Lembrete'}
                            </span>
                        </div>
                        <p class="text-xs text-on-surface-variant italic leading-relaxed">
                            "${rem.message || 'Sem mensagem cadastrada.'}"
                        </p>
                        <div class="flex gap-4 text-[10px] text-on-surface-variant font-medium pt-1.5">
                            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">call</span> ${rem.phone || 'Sem telefone'}</span>
                            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">calendar_today</span> Prazo: ${dateStr}</span>
                        </div>
                    </div>
                </div>

                <!-- Ações -->
                <div class="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button onclick="RemindersPage.deleteReminder('${rem.id}')" class="w-10 h-10 rounded-xl hover:bg-red-50 text-on-surface-variant hover:text-red-600 flex items-center justify-center transition-colors" title="Descartar">
                        <span class="material-symbols-outlined text-lg">close</span>
                    </button>
                    <a href="${waUrl}" target="_blank" onclick="RemindersPage.completeReminder('${rem.id}')" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/10 flex items-center gap-1.5 transition-all text-decoration-none">
                        <span class="material-symbols-outlined text-base">chat</span>
                        Enviar WhatsApp
                    </a>
                </div>
            </div>`;
        }).join('');
    },

    showFormModal() {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-8 max-w-lg mx-auto">
            <h3 class="font-headline font-bold text-2xl mb-1">Novo Lembrete Manual</h3>
            <p class="text-on-surface-variant text-sm mb-6">Cadastre um lembrete personalizado para enviar a uma cliente.</p>
            <form id="reminder-form" class="space-y-4">
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Cliente</label>
                    <select id="rem-client" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                        <option value="">Selecione a cliente...</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Tipo de Mensagem</label>
                        <select id="rem-type" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                            <option value="Confirmação">Confirmação de Agendamento</option>
                            <option value="Pós-Procedimento">Pós-Procedimento / Retorno</option>
                            <option value="Agradecimento">Agradecimento / Feedback</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Data de Envio</label>
                        <input type="date" id="rem-date" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required />
                    </div>
                </div>

                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Mensagem do WhatsApp</label>
                    <textarea id="rem-message" rows="3" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm resize-none" placeholder="Digite a mensagem que será enviada para o WhatsApp..." required></textarea>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-2.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl text-sm transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-2.5 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all text-sm flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">save</span>
                        Salvar Lembrete
                    </button>
                </div>
            </form>
        </div>`;
        App.openModal();

        // Populate Clients
        Store.getClients().then(clients => {
            const select = document.getElementById('rem-client');
            if (select) {
                select.innerHTML = '<option value="">Selecione a cliente...</option>' +
                    clients.map(c => `<option value="${c.id}" data-name="${c.name}" data-phone="${c.phone || ''}">${c.name}</option>`).join('');
            }
        });

        // Set today by default
        document.getElementById('rem-date').valueAsDate = new Date();

        // Auto text template change based on type selection
        const typeSelect = document.getElementById('rem-type');
        const msgArea = document.getElementById('rem-message');
        const clientSelect = document.getElementById('rem-client');

        const updateTemplate = () => {
            const clientName = clientSelect.selectedOptions[0]?.dataset.name || '[Nome da Cliente]';
            if (typeSelect.value === 'Confirmação') {
                msgArea.value = `Olá, ${clientName}! Passando para confirmar seu procedimento marcado para amanhã aqui no Studiobeauty. Podemos confirmar? ✨`;
            } else if (typeSelect.value === 'Pós-Procedimento') {
                msgArea.value = `Oi, ${clientName}! Já se passaram alguns dias do seu alongamento de cílios. Como você está se adaptando? Lembre-se que já podemos agendar a sua manutenção! 👁✨`;
            } else {
                msgArea.value = `Olá, ${clientName}! Agradecemos a sua preferência e confiança no Studiobeauty. Esperamos te ver em breve novamente! ❤️`;
            }
        };

        typeSelect.addEventListener('change', updateTemplate);
        clientSelect.addEventListener('change', updateTemplate);

        // Submit form
        document.getElementById('reminder-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const clientSel = document.getElementById('rem-client');
            const data = {
                clientName: clientSel.selectedOptions[0]?.dataset.name || '',
                phone: clientSel.selectedOptions[0]?.dataset.phone || '',
                type: typeSelect.value,
                dueDate: new Date(document.getElementById('rem-date').value),
                message: msgArea.value.trim()
            };

            try {
                await Store.addReminder(data);
                App.closeModal();
                App.showToast("Lembrete agendado com sucesso!", "success");
                await RemindersPage.loadData();
            } catch (err) {
                console.error("Erro ao salvar lembrete:", err);
                App.showToast("Falha ao salvar lembrete.", "error");
            }
        });
    },

    async deleteReminder(remId) {
        try {
            await Store.deleteReminder(remId);
            App.showToast("Lembrete descartado.", "info");
            await RemindersPage.loadData();
        } catch (err) {
            console.error("Erro ao descartar lembrete:", err);
            App.showToast("Falha ao descartar lembrete.", "error");
        }
    },

    async completeReminder(remId) {
        // Ao clicar para abrir o WhatsApp, consideramos que a ação foi tomada e removemos da lista de mensagens pendentes do dia
        setTimeout(async () => {
            try {
                await Store.deleteReminder(remId);
                await RemindersPage.loadData();
            } catch (err) {
                console.error(err);
            }
        }, 1000);
    }
};
