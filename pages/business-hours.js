// === Página: Horário de Funcionamento ===
const BusinessHoursPage = {
    dayNames: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],

    render() {
        const flexRows = this.dayNames.map((d, i) => `
            <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high hover:bg-surface-container transition-colors" data-flex-day="${i}">
                <button type="button" class="day-btn w-12 h-10 rounded-lg text-xs font-bold transition-all ${i < 5 ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}" data-day="${i}">${d}</button>
                <input type="time" class="flex-day-start settings-input px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-on-surface w-24 ${i >= 5 ? 'opacity-40' : ''}" value="${i >= 5 ? '09:00' : '08:00'}" ${i >= 5 ? 'disabled' : ''}/>
                <span class="text-xs text-on-surface-variant font-bold">até</span>
                <input type="time" class="flex-day-end settings-input px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-on-surface w-24 ${i >= 5 ? 'opacity-40' : ''}" value="${i >= 5 ? '13:00' : '18:00'}" ${i >= 5 ? 'disabled' : ''}/>
            </div>`).join('');

        return `
        <div class="max-w-3xl mx-auto space-y-8">
            <div>
                <h2 class="font-headline text-3xl font-extrabold tracking-tight">Horário de Funcionamento</h2>
                <p class="text-on-surface-variant mt-1">Defina horários diferentes para cada dia da semana. Clique no dia para ativar/desativar.</p>
            </div>

            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">schedule</span> Horários por Dia
                </h3>
                <div class="space-y-2" id="flex-schedule">${flexRows}</div>

                <!-- Intervalo de Almoço -->
                <div class="mt-6 p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl">
                    <div class="flex items-center gap-3 mb-3">
                        <input type="checkbox" id="set-lunch-enabled" class="settings-input w-4 h-4 accent-amber-600" checked/>
                        <label for="set-lunch-enabled" class="font-bold text-sm text-amber-800 flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">lunch_dining</span>Bloqueio de Horário de Almoço
                        </label>
                    </div>
                    <div id="lunch-fields" class="flex items-center gap-3 ml-7">
                        <input type="time" id="set-lunch-start" value="12:00" class="settings-input px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm w-28"/>
                        <span class="text-xs font-bold text-amber-700">até</span>
                        <input type="time" id="set-lunch-end" value="13:00" class="settings-input px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm w-28"/>
                        <span class="text-xs text-amber-600 ml-2">Clientes não poderão agendar neste período</span>
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button onclick="BusinessHoursPage.save()" class="px-8 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2">
                    <span class="material-symbols-outlined">save</span> Salvar Horários
                </button>
            </div>
        </div>`;
    },

    async init() {
        // Day toggle buttons
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const row = btn.closest('[data-flex-day]');
                const isActive = btn.classList.contains('bg-primary/10');
                btn.classList.toggle('bg-primary/10', !isActive);
                btn.classList.toggle('text-primary', !isActive);
                btn.classList.toggle('bg-surface-container', isActive);
                btn.classList.toggle('text-on-surface-variant', isActive);
                row.querySelectorAll('input[type=time]').forEach(inp => {
                    inp.disabled = isActive;
                    inp.classList.toggle('opacity-40', isActive);
                });
            });
        });
        // Lunch toggle
        document.getElementById('set-lunch-enabled')?.addEventListener('change', (e) => {
            const fields = document.getElementById('lunch-fields');
            fields.querySelectorAll('input').forEach(i => i.disabled = !e.target.checked);
            fields.classList.toggle('opacity-40', !e.target.checked);
        });
        this.loadSaved();
    },

    loadSaved() {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        if (s.lunchEnabled === false) {
            const cb = document.getElementById('set-lunch-enabled');
            if (cb) { cb.checked = false; document.getElementById('lunch-fields')?.classList.add('opacity-40'); }
        }
        if (s.lunchStart) document.getElementById('set-lunch-start').value = s.lunchStart;
        if (s.lunchEnd)   document.getElementById('set-lunch-end').value = s.lunchEnd;
    },

    save() {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        s.lunchEnabled = document.getElementById('set-lunch-enabled')?.checked;
        s.lunchStart   = document.getElementById('set-lunch-start')?.value;
        s.lunchEnd     = document.getElementById('set-lunch-end')?.value;
        // Horários por dia
        const days = [];
        document.querySelectorAll('[data-flex-day]').forEach(row => {
            const i = parseInt(row.dataset.flexDay);
            days[i] = {
                enabled: !row.querySelector('.day-btn')?.classList.contains('bg-surface-container'),
                start: row.querySelector('.flex-day-start')?.value,
                end:   row.querySelector('.flex-day-end')?.value
            };
        });
        s.flexDays = days;
        localStorage.setItem('ch_settings', JSON.stringify(s));
        App.showToast('Horários salvos! ✅', 'success');
    }
};
