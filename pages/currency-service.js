// === Página: Moeda e Serviço ===
const CurrencyServicePage = {
    render() {
        return `
        <div class="max-w-3xl mx-auto space-y-8">
            <div>
                <h2 class="font-headline text-3xl font-extrabold tracking-tight">Moeda e Serviço</h2>
                <p class="text-on-surface-variant mt-1">Configure a moeda exibida e o tempo médio de cada atendimento.</p>
            </div>

            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">payments</span> Configurações de Serviço
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Símbolo da Moeda</label>
                        <select id="set-currency" class="settings-input w-full px-4 py-4 bg-surface-container-high border-none rounded-xl text-on-surface">
                            <option value="R$" selected>R$ — Real Brasileiro</option>
                            <option value="US$">US$ — Dólar Americano</option>
                            <option value="€">€ — Euro</option>
                            <option value="£">£ — Libra Esterlina</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Tempo Médio de Atendimento</label>
                        <div class="flex gap-2">
                            <button type="button" class="duration-btn settings-input flex-1 py-3 rounded-xl text-sm font-bold transition-all" data-dur="30">30 min</button>
                            <button type="button" class="duration-btn settings-input flex-1 py-3 rounded-xl text-sm font-bold transition-all" data-dur="60" data-selected="true">60 min</button>
                            <button type="button" class="duration-btn settings-input flex-1 py-3 rounded-xl text-sm font-bold transition-all" data-dur="90">90 min</button>
                            <button type="button" class="duration-btn settings-input flex-1 py-3 rounded-xl text-sm font-bold transition-all" data-dur="120">120 min</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button onclick="CurrencyServicePage.save()" class="px-8 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2">
                    <span class="material-symbols-outlined">save</span> Salvar Configurações
                </button>
            </div>
        </div>`;
    },

    async init() {
        const applyStyles = () => {
            document.querySelectorAll('.duration-btn').forEach(b => {
                const sel = b.dataset.selected === 'true';
                b.classList.toggle('bg-primary/10', sel);
                b.classList.toggle('text-primary', sel);
                b.classList.toggle('font-extrabold', sel);
                b.classList.toggle('bg-surface-container-high', !sel);
                b.classList.toggle('text-on-surface-variant', !sel);
            });
        };
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.duration-btn').forEach(b => delete b.dataset.selected);
                btn.dataset.selected = 'true';
                applyStyles();
            });
        });
        applyStyles();
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        if (s.currency) document.getElementById('set-currency').value = s.currency;
        if (s.appointmentDuration) {
            document.querySelectorAll('.duration-btn').forEach(b => {
                delete b.dataset.selected;
                if (b.dataset.dur === String(s.appointmentDuration)) b.dataset.selected = 'true';
            });
            applyStyles();
        }
    },

    save() {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        s.currency = document.getElementById('set-currency')?.value || 'R$';
        const selDur = document.querySelector('.duration-btn[data-selected="true"]');
        if (selDur) s.appointmentDuration = parseInt(selDur.dataset.dur);
        localStorage.setItem('ch_settings', JSON.stringify(s));
        App.showToast('Configurações salvas! ✅', 'success');
    }
};
