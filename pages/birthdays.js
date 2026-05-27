// === Birthdays Page ===
const BirthdaysPage = {
    allClients: [],
    currentFilter: 'today',
    searchQuery: '',

    render() {
        return `
        <div class="space-y-6 max-w-[1100px] mx-auto">
            <!-- Header -->
            <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <p class="text-sm text-on-surface-variant mb-1">Marketing › <span class="text-primary font-semibold">Aniversariantes</span></p>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">🎂 Aniversariantes</h2>
                    <p class="text-on-surface-variant mt-1 text-sm">Parabenize suas clientes no dia especial delas via WhatsApp.</p>
                </div>
                <div class="flex items-center gap-3">
                    <span id="bday-total-badge" class="px-4 py-2 bg-[#F0D9DC] text-[#58323F] text-xs font-bold rounded-full hidden"></span>
                    <a href="#/clients/new" class="px-5 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">person_add</span>
                        Novo Cliente
                    </a>
                </div>
            </section>

            <!-- Stats Row -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gradient-to-br from-[#58323F] to-[#7A4A57] rounded-2xl p-5 text-white relative overflow-hidden">
                    <div class="absolute right-2 bottom-1 opacity-20 text-6xl select-none">🎂</div>
                    <p class="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Hoje</p>
                    <h3 id="bday-stat-today" class="text-3xl font-black">--</h3>
                </div>
                <div class="bg-[#F0D9DC] rounded-2xl p-5 relative overflow-hidden">
                    <div class="absolute right-2 bottom-1 opacity-20 text-6xl select-none">🌸</div>
                    <p class="text-xs font-bold uppercase tracking-wider text-[#58323F]/70 mb-1">Próximos 7 dias</p>
                    <h3 id="bday-stat-week" class="text-3xl font-black text-[#58323F]">--</h3>
                </div>
                <div class="bg-[#EAD9CA] rounded-2xl p-5 relative overflow-hidden">
                    <div class="absolute right-2 bottom-1 opacity-20 text-6xl select-none">📅</div>
                    <p class="text-xs font-bold uppercase tracking-wider text-[#6B4F56]/70 mb-1">Este Mês</p>
                    <h3 id="bday-stat-month" class="text-3xl font-black text-[#6B4F56]">--</h3>
                </div>
                <div class="bg-surface-container-low rounded-2xl p-5 relative overflow-hidden">
                    <div class="absolute right-2 bottom-1 opacity-20 text-6xl select-none">👥</div>
                    <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Com Aniversário</p>
                    <h3 id="bday-stat-total" class="text-3xl font-black text-on-surface">--</h3>
                </div>
            </div>

            <!-- Filters + Search -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div class="flex bg-surface-container-low rounded-xl p-1 gap-1">
                    <button class="bday-filter-btn active px-4 py-2 rounded-lg text-xs font-bold transition-all" data-filter="today">🎂 Hoje</button>
                    <button class="bday-filter-btn px-4 py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-all" data-filter="week">Próx. 7 dias</button>
                    <button class="bday-filter-btn px-4 py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-all" data-filter="month">Este Mês</button>
                    <button class="bday-filter-btn px-4 py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-all" data-filter="all">Todos</button>
                </div>
                <div class="relative flex-1 min-w-0">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                    <input id="bday-search" type="text" class="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm text-on-surface placeholder:text-outline" placeholder="Buscar cliente..."/>
                </div>
            </div>

            <!-- Client Cards -->
            <div id="bday-list" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div class="col-span-full text-center py-16 text-on-surface-variant">
                    <div class="spinner mx-auto mb-4"></div>
                    <p>Carregando aniversariantes...</p>
                </div>
            </div>
        </div>`;
    },

    async init() {
        // Filter buttons
        document.querySelectorAll('.bday-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.bday-filter-btn').forEach(b => {
                    b.classList.remove('active', 'vitality-gradient', 'text-white');
                    b.classList.add('text-on-surface-variant');
                });
                btn.classList.add('active', 'vitality-gradient', 'text-white');
                btn.classList.remove('text-on-surface-variant');
                BirthdaysPage.currentFilter = btn.dataset.filter;
                BirthdaysPage.renderList();
            });
        });

        // Set first button active style
        const activeBtn = document.querySelector('.bday-filter-btn.active');
        if (activeBtn) {
            activeBtn.classList.add('vitality-gradient', 'text-white');
        }

        // Search
        document.getElementById('bday-search')?.addEventListener('input', e => {
            BirthdaysPage.searchQuery = e.target.value.toLowerCase();
            BirthdaysPage.renderList();
        });

        // Load data
        await this.loadClients();
    },

    async loadClients() {
        try {
            const clients = await Store.getClients();
            // Filter only clients that have birthdate filled
            this.allClients = clients.filter(c => c.birthdate);
            this.updateStats();
            this.renderList();
        } catch (e) {
            document.getElementById('bday-list').innerHTML = `
            <div class="col-span-full text-center py-12 text-on-surface-variant">
                <span class="material-symbols-outlined text-5xl mb-3 block opacity-30">error</span>
                <p>Erro ao carregar clientes.</p>
            </div>`;
        }
    },

    // Returns today as MM-DD
    todayMMDD() {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${mm}-${dd}`;
    },

    // Days until next birthday
    daysUntilBirthday(birthdate) {
        if (!birthdate) return Infinity;
        const [, mm, dd] = birthdate.split('-');
        const now = new Date();
        const thisYear = now.getFullYear();
        let next = new Date(thisYear, parseInt(mm) - 1, parseInt(dd));
        if (next < now) next = new Date(thisYear + 1, parseInt(mm) - 1, parseInt(dd));
        const diff = Math.round((next - now) / (1000 * 60 * 60 * 24));
        return diff;
    },

    birthMonthDay(birthdate) {
        if (!birthdate) return '';
        const parts = birthdate.split('-');
        return `${parts[1]}-${parts[2]}`;
    },

    calcAge(birthdate) {
        if (!birthdate) return null;
        const [y, m, d] = birthdate.split('-').map(Number);
        const now = new Date();
        let age = now.getFullYear() - y;
        if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
        return age;
    },

    filterClients() {
        const today = this.todayMMDD();
        const now = new Date();
        const thisMonth = String(now.getMonth() + 1).padStart(2, '0');

        let filtered = this.allClients;

        switch (this.currentFilter) {
            case 'today':
                filtered = filtered.filter(c => this.birthMonthDay(c.birthdate) === today);
                break;
            case 'week':
                filtered = filtered.filter(c => {
                    const d = this.daysUntilBirthday(c.birthdate);
                    return d >= 0 && d <= 7;
                });
                break;
            case 'month':
                filtered = filtered.filter(c => {
                    const parts = c.birthdate.split('-');
                    return parts[1] === thisMonth;
                });
                break;
            default:
                break;
        }

        if (this.searchQuery) {
            filtered = filtered.filter(c =>
                (c.name || '').toLowerCase().includes(this.searchQuery) ||
                (c.phone || '').includes(this.searchQuery)
            );
        }

        // Sort: by days until birthday
        filtered.sort((a, b) => this.daysUntilBirthday(a.birthdate) - this.daysUntilBirthday(b.birthdate));

        return filtered;
    },

    updateStats() {
        const today = this.todayMMDD();
        const now = new Date();
        const thisMonth = String(now.getMonth() + 1).padStart(2, '0');

        const todayCount = this.allClients.filter(c => this.birthMonthDay(c.birthdate) === today).length;
        const weekCount  = this.allClients.filter(c => { const d = this.daysUntilBirthday(c.birthdate); return d >= 0 && d <= 7; }).length;
        const monthCount = this.allClients.filter(c => c.birthdate.split('-')[1] === thisMonth).length;

        document.getElementById('bday-stat-today').textContent = todayCount;
        document.getElementById('bday-stat-week').textContent  = weekCount;
        document.getElementById('bday-stat-month').textContent = monthCount;
        document.getElementById('bday-stat-total').textContent = this.allClients.length;

        const badge = document.getElementById('bday-total-badge');
        if (todayCount > 0) {
            badge.textContent = `🎂 ${todayCount} aniversariante${todayCount > 1 ? 's' : ''} hoje!`;
            badge.classList.remove('hidden');
        }
    },

    formatWhatsAppMsg(name) {
        const firstName = (name || 'cliente').split(' ')[0];
        return encodeURIComponent(`🎂 Feliz Aniversário, ${firstName}! 🌸\n\nDesejamos um dia especial cheio de alegrias e realizações. Que este novo ano seja incrível para você!\n\nCom carinho,\nStudiobeauty 💕`);
    },

    formatPhone(phone) {
        return (phone || '').replace(/\D/g, '');
    },

    renderList() {
        const list = document.getElementById('bday-list');
        if (!list) return;

        const filtered = this.filterClients();

        if (filtered.length === 0) {
            const emptyMessages = {
                today: { icon: '🎂', title: 'Nenhuma aniversariante hoje', sub: 'Aproveite para preparar mensagens para os próximos dias!' },
                week: { icon: '📅', title: 'Nenhuma nos próximos 7 dias', sub: 'Verifique os aniversários do mês.' },
                month: { icon: '🌸', title: 'Nenhuma neste mês', sub: 'Veja todos os aniversários cadastrados.' },
                all: { icon: '👥', title: 'Nenhuma cliente com aniversário cadastrado', sub: 'Edite as clientes e adicione a data de nascimento.' }
            };
            const em = emptyMessages[this.currentFilter] || emptyMessages.all;
            list.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div class="text-6xl">${em.icon}</div>
                <h3 class="font-headline font-bold text-xl text-on-surface">${em.title}</h3>
                <p class="text-on-surface-variant text-sm max-w-xs">${em.sub}</p>
                <a href="#/clients" class="mt-2 px-5 py-2.5 bg-surface-container-high text-on-surface font-bold rounded-xl text-sm hover:bg-surface-container transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-base">group</span>
                    Ver Clientes
                </a>
            </div>`;
            return;
        }

        const today = this.todayMMDD();

        list.innerHTML = filtered.map(c => {
            const isToday  = this.birthMonthDay(c.birthdate) === today;
            const days     = this.daysUntilBirthday(c.birthdate);
            const age      = this.calcAge(c.birthdate);
            const phone    = this.formatPhone(c.phone);
            const msgUrl   = `https://wa.me/55${phone}?text=${this.formatWhatsAppMsg(c.name)}`;
            const [, mm, dd] = c.birthdate.split('-');
            const bdayLabel = `${dd}/${mm}`;
            const initials  = (c.name || '?').split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();

            let daysLabel = '';
            if (days === 0)      daysLabel = `<span class="text-[#58323F] font-extrabold animate-pulse">🎉 Hoje!</span>`;
            else if (days === 1) daysLabel = `<span class="text-amber-600 font-bold">Amanhã</span>`;
            else                 daysLabel = `<span class="text-on-surface-variant">Em ${days} dias</span>`;

            const cardBorder = isToday ? 'border-2 border-[#E8C5C8] shadow-lg shadow-[#E8C5C8]/30' : 'border border-outline-variant/10';
            const bgGradient = isToday ? 'bg-gradient-to-br from-[#FAF4ED] to-[#F0D9DC]' : 'bg-surface-container-lowest';

            return `
            <div class="rounded-2xl p-5 ${bgGradient} ${cardBorder} transition-all hover:shadow-md relative overflow-hidden">
                ${isToday ? `<div class="absolute top-3 right-3 text-2xl animate-bounce select-none">🎂</div>` : ''}
                <div class="flex items-start gap-4">
                    <!-- Avatar -->
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0 ${isToday ? 'bg-gradient-to-br from-[#58323F] to-[#7A4A57]' : 'bg-surface-container-high text-on-surface-variant'}">
                        ${isToday ? initials : `<span class="text-on-surface-variant font-black">${initials}</span>`}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-headline font-bold text-on-surface truncate">${c.name || '—'}</h4>
                        <p class="text-xs text-on-surface-variant mt-0.5">${c.phone || 'Sem telefone'}</p>
                        <div class="flex items-center gap-3 mt-2 flex-wrap">
                            <span class="flex items-center gap-1 text-xs font-semibold text-[#6B4F56] bg-[#EAD9CA] px-2 py-0.5 rounded-full">
                                <span class="material-symbols-outlined text-sm">cake</span>
                                ${bdayLabel}
                            </span>
                            ${age !== null ? `<span class="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">${age + (isToday ? 1 : 0)} anos</span>` : ''}
                        </div>
                    </div>
                </div>
                <!-- Days label -->
                <div class="mt-4 flex items-center justify-between gap-2">
                    <div class="text-sm">${daysLabel}</div>
                    <!-- Actions -->
                    <div class="flex items-center gap-2">
                        ${c.phone ? `
                        <a href="${msgUrl}" target="_blank" rel="noopener"
                           class="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white font-bold text-xs rounded-xl hover:bg-[#1ebe5d] active:scale-95 transition-all shadow-sm shadow-green-500/20">
                            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Parabenizar
                        </a>` : `
                        <span class="text-xs text-on-surface-variant italic">Sem telefone</span>`}
                        <a href="#/clients/${c.id}" class="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors" title="Ver perfil">
                            <span class="material-symbols-outlined text-lg">person</span>
                        </a>
                    </div>
                </div>
            </div>`;
        }).join('');
    }
};
