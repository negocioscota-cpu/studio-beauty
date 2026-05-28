// ============================================================
// LASHBROW — Booking (Mini-site público de agendamento)
// URL: /booking/:slug
// ============================================================

'use strict';

const Booking = {
    // Estado
    studioUid:  null,
    studioData: null,
    services:   [],
    selectedService: null,
    selectedDate:    null,
    selectedTime:    null,
    calYear:  null,
    calMonth: null,
    bookedSlots: {},   // { 'YYYY-MM-DD': ['09:00', '10:30', ...] }

    // ─── Inicialização ────────────────────────────────────────
    async init() {
        // Extrai slug da URL: /booking/SLUG
        const pathParts = window.location.pathname.split('/');
        const slug = pathParts[pathParts.length - 1] || '';

        if (!slug) { Booking.showNotFound(); return; }

        try {
            // Busca studio pelo slug
            const snap = await db.collection('studios')
                .where('bookingSlug', '==', slug)
                .limit(1)
                .get();

            if (snap.empty) { Booking.showNotFound(); return; }

            const doc = snap.docs[0];
            Booking.studioUid  = doc.id;
            Booking.studioData = doc.data();

            Booking.renderHeader();
            await Booking.loadServices();
            await Booking.loadBookedSlots();
            Booking.renderServiceGrid();

            const now = new Date();
            Booking.calYear  = now.getFullYear();
            Booking.calMonth = now.getMonth();

            document.getElementById('bk-loading').style.display = 'none';
            const app = document.getElementById('bk-app');
            app.style.display = 'flex';

        } catch(err) {
            console.error('Booking init error:', err);
            Booking.showNotFound();
        }
    },

    showNotFound() {
        document.getElementById('bk-loading').style.display = 'none';
        document.getElementById('bk-app').style.display = 'flex';
        document.getElementById('bk-not-found').style.display = 'flex';
        document.getElementById('bk-not-found').style.flexDirection = 'column';
        // Esconde steps
        document.querySelectorAll('.step, .step-indicator, .booking-card').forEach(el => {
            if (!el.id?.startsWith('bk-not')) el.style.display = 'none';
        });
    },

    // ─── Header ──────────────────────────────────────────────
    renderHeader() {
        const d = Booking.studioData;
        document.title = `${d.studioName || 'Studio'} — Agendar`;

        const logoEl = document.getElementById('bk-studio-logo');
        if (d.logoUrl) {
            logoEl.innerHTML = `<img src="${d.logoUrl}" alt="Logo">`;
        }
        document.getElementById('bk-studio-name').textContent = d.studioName || d.companyName || 'Studio';
        document.getElementById('bk-studio-sub').textContent  = d.city ? `${d.city} — Agendamento Online` : 'Agendamento Online';
    },

    // ─── Serviços ────────────────────────────────────────────
    async loadServices() {
        // Tenta serviços customizados; se vazio, usa defaults
        let svcs = [];
        try {
            const snap = await db.collection('studios').doc(Booking.studioUid)
                .collection('services').get();
            snap.forEach(d => svcs.push({ id: d.id, ...d.data() }));
        } catch(e) {}

        if (!svcs.length) {
            svcs = [
                { id: 's1', name: 'Extensão de Cílios',    icon: '✨', duration: 90, price: 120 },
                { id: 's2', name: 'Lash Lifting',           icon: '👁️', duration: 60, price: 80  },
                { id: 's3', name: 'Sobrancelha Design',     icon: '🌸', duration: 40, price: 60  },
                { id: 's4', name: 'Brow Lamination',        icon: '💆', duration: 50, price: 90  },
                { id: 's5', name: 'Manutenção de Cílios',   icon: '🔧', duration: 45, price: 70  },
                { id: 's6', name: 'Henna de Sobrancelha',   icon: '🎨', duration: 30, price: 50  },
            ];
        }
        Booking.services = svcs;
    },

    renderServiceGrid() {
        const grid = document.getElementById('service-grid');
        grid.innerHTML = Booking.services.map(s => `
            <div class="service-item" id="srv-${s.id}" onclick="Booking.selectService('${s.id}')">
                <div class="service-item-icon">${s.icon || '✨'}</div>
                <div class="service-item-name">${s.name}</div>
                <div class="service-item-duration">${s.duration} min</div>
                <div class="service-item-price">${s.price ? 'R$ ' + Number(s.price).toFixed(2).replace('.',',') : ''}</div>
            </div>
        `).join('');
    },

    selectService(id) {
        Booking.selectedService = Booking.services.find(s => s.id === id);
        document.querySelectorAll('.service-item').forEach(el => el.classList.remove('selected'));
        document.getElementById('srv-' + id)?.classList.add('selected');
        document.getElementById('btn-step1').disabled = false;
    },

    // ─── Horários Ocupados ───────────────────────────────────
    async loadBookedSlots() {
        try {
            // Busca agendamentos dos próximos 60 dias
            const start = new Date(); start.setHours(0,0,0,0);
            const end   = new Date(start); end.setDate(end.getDate() + 60);

            const snap = await db.collection('studios').doc(Booking.studioUid)
                .collection('bookings')
                .where('dateTs', '>=', start.toISOString().split('T')[0])
                .where('dateTs', '<=', end.toISOString().split('T')[0])
                .where('status', 'in', ['pending', 'confirmed'])
                .get();

            Booking.bookedSlots = {};
            snap.forEach(d => {
                const data = d.data();
                if (!Booking.bookedSlots[data.dateTs]) Booking.bookedSlots[data.dateTs] = [];
                Booking.bookedSlots[data.dateTs].push(data.time);
            });
        } catch(e) {
            console.warn('bookedSlots error:', e);
        }
    },

    // ─── Calendário ──────────────────────────────────────────
    renderCalendar() {
        const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                            'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const dayNames   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

        const today = new Date(); today.setHours(0,0,0,0);
        const first = new Date(Booking.calYear, Booking.calMonth, 1);
        const last  = new Date(Booking.calYear, Booking.calMonth + 1, 0);

        document.getElementById('cal-title').textContent =
            `${monthNames[Booking.calMonth]} ${Booking.calYear}`;

        const grid = document.getElementById('date-grid');
        let html = dayNames.map(d => `<div class="date-header">${d}</div>`).join('');

        // Células vazias antes do dia 1
        for (let i = 0; i < first.getDay(); i++) {
            html += '<div></div>';
        }

        const bh = Booking.studioData?.businessHours || {};
        const dayKeys = ['dom','seg','ter','qua','qui','sex','sab'];

        for (let day = 1; day <= last.getDate(); day++) {
            const d = new Date(Booking.calYear, Booking.calMonth, day);
            const isToday   = d.getTime() === today.getTime();
            const isPast    = d < today;
            const dayKey    = dayKeys[d.getDay()];
            const isClosed  = bh[dayKey] ? !bh[dayKey].open : false;
            const isDisabled = isPast || isClosed;
            const dateStr   = Booking.formatDate(d);
            const isSel     = Booking.selectedDate === dateStr;

            html += `<div class="date-cell ${isSel ? 'selected' : ''} ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''}"
                          onclick="${isDisabled ? '' : `Booking.selectDate('${dateStr}')`}"
                          title="${isClosed ? 'Fechado' : ''}">${day}</div>`;
        }

        grid.innerHTML = html;
    },

    selectDate(dateStr) {
        Booking.selectedDate = dateStr;
        Booking.renderCalendar();
        Booking.renderTimeGrid();
        document.getElementById('btn-step2').disabled = false;
    },

    prevMonth() {
        if (Booking.calMonth === 0) { Booking.calMonth = 11; Booking.calYear--; }
        else Booking.calMonth--;
        Booking.renderCalendar();
    },

    nextMonth() {
        if (Booking.calMonth === 11) { Booking.calMonth = 0; Booking.calYear++; }
        else Booking.calMonth++;
        Booking.renderCalendar();
    },

    formatDate(d) {
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },

    // ─── Grade de horários ───────────────────────────────────
    renderTimeGrid() {
        const grid = document.getElementById('time-grid');
        if (!Booking.selectedDate) { grid.innerHTML = ''; return; }

        const d = new Date(Booking.selectedDate + 'T00:00:00');
        const dayKeys = ['dom','seg','ter','qua','qui','sex','sab'];
        const dayKey  = dayKeys[d.getDay()];
        const bh      = Booking.studioData?.businessHours || {};
        const dayConf = bh[dayKey] || { open: true, start: '09:00', end: '18:00' };

        const lunch = Booking.studioData?.lunchBlock || { enabled: false, start: '12:00', end: '13:00' };
        const busy  = Booking.bookedSlots[Booking.selectedDate] || [];
        const svcMin = Booking.selectedService?.duration || 60;

        const slots = [];
        let [sh, sm] = dayConf.start.split(':').map(Number);
        let [eh, em] = dayConf.end.split(':').map(Number);
        const endMin = eh * 60 + em;

        let cur = sh * 60 + sm;
        while (cur + svcMin <= endMin) {
            const h = Math.floor(cur / 60);
            const m = cur % 60;
            const label = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

            // Verifica almoço
            let inLunch = false;
            if (lunch.enabled) {
                const [lh, lm] = lunch.start.split(':').map(Number);
                const [leh, lem] = lunch.end.split(':').map(Number);
                if (cur >= lh*60+lm && cur < leh*60+lem) inLunch = true;
            }

            const isBusy = busy.includes(label) || inLunch;
            slots.push({ label, busy: isBusy });
            cur += 30; // intervalo de 30min
        }

        if (!slots.length) {
            grid.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;grid-column:1/-1;text-align:center;padding:16px">Nenhum horário disponível nesta data.</div>';
            return;
        }

        grid.innerHTML = slots.map(s => `
            <div class="time-slot ${s.busy ? 'busy' : ''} ${Booking.selectedTime === s.label ? 'selected' : ''}"
                 onclick="${s.busy ? '' : `Booking.selectTime('${s.label}')`}">
                ${s.label}
            </div>
        `).join('');
    },

    selectTime(time) {
        Booking.selectedTime = time;
        Booking.renderTimeGrid();
        document.getElementById('btn-step3').disabled = false;
    },

    // ─── Navegação Steps ─────────────────────────────────────
    goStep(n) {
        [1,2,3,4].forEach(i => {
            const el = document.getElementById('step-' + i);
            if (el) el.classList.toggle('active', i === n);
            const dot = document.getElementById('sdot-' + i);
            if (dot) {
                dot.classList.toggle('active', i === n);
                dot.classList.toggle('done', i < n);
            }
            if (i < 4) {
                const line = document.getElementById('sline-' + i);
                if (line) line.classList.toggle('done', i < n);
            }
        });

        if (n === 2) Booking.renderCalendar();
        if (n === 4) Booking.renderSummary();
    },

    // ─── Resumo ──────────────────────────────────────────────
    renderSummary() {
        const svc   = Booking.selectedService;
        const date  = Booking.selectedDate;
        const time  = Booking.selectedTime;

        const dateLabel = date
            ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' })
            : '-';

        document.getElementById('bk-summary').innerHTML = `
            <div class="summary-row">
                <span class="summary-label">Serviço</span>
                <span class="summary-value">${svc?.name || '-'}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Duração</span>
                <span class="summary-value">${svc?.duration || '-'} min</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Data</span>
                <span class="summary-value">${dateLabel}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Horário</span>
                <span class="summary-value">${time || '-'}</span>
            </div>
            ${svc?.price ? `
            <div class="summary-row" style="border-top:1px solid var(--border);padding-top:8px;margin-top:4px">
                <span class="summary-label">Valor</span>
                <span class="summary-value" style="color:var(--gold)">R$ ${Number(svc.price).toFixed(2).replace('.',',')}</span>
            </div>` : ''}
        `;
    },

    // ─── Confirmação ─────────────────────────────────────────
    async confirm() {
        const name  = document.getElementById('bk-client-name')?.value.trim();
        const phone = document.getElementById('bk-client-phone')?.value.trim();
        const notes = document.getElementById('bk-client-notes')?.value.trim();

        if (!name || !phone) {
            Booking.toast('Preencha nome e WhatsApp! ⚠️'); return;
        }

        const btn = document.getElementById('btn-confirm');
        btn.disabled = true;
        btn.textContent = 'Salvando...';

        try {
            await db.collection('studios').doc(Booking.studioUid)
                .collection('bookings').add({
                    clientName:  name,
                    clientPhone: phone,
                    notes:       notes || '',
                    serviceId:   Booking.selectedService?.id || '',
                    serviceName: Booking.selectedService?.name || '',
                    serviceDuration: Booking.selectedService?.duration || 0,
                    servicePrice:   Booking.selectedService?.price || 0,
                    dateTs:   Booking.selectedDate,
                    time:     Booking.selectedTime,
                    status:   'pending',
                    source:   'booking_minisite',
                    createdAt: new Date().toISOString()
                });

            // Esconde steps, mostra sucesso
            document.querySelectorAll('.booking-card, .step-indicator').forEach(el => el.style.display = 'none');
            const success = document.getElementById('bk-success');
            success.classList.add('show');

            const dateLabel = new Date(Booking.selectedDate + 'T12:00:00')
                .toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' });
            document.getElementById('bk-success-detail').textContent =
                `${Booking.selectedService?.name} — ${dateLabel} às ${Booking.selectedTime}`;

        } catch(err) {
            console.error('confirm error:', err);
            Booking.toast('Erro ao confirmar. Tente novamente.'); 
            btn.disabled = false;
            btn.textContent = 'Confirmar Agendamento ✨';
        }
    },

    // ─── Utilitários ─────────────────────────────────────────
    toast(msg, dur = 3000) {
        const el = document.getElementById('bk-toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), dur);
    }
};

// Boot
document.addEventListener('DOMContentLoaded', () => Booking.init());
