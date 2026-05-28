// === HORÁRIO DE FUNCIONAMENTO ===
const BusinessHours = {
    DAYS: [
        { key: 'seg', label: 'Seg' }, { key: 'ter', label: 'Ter' },
        { key: 'qua', label: 'Qua' }, { key: 'qui', label: 'Qui' },
        { key: 'sex', label: 'Sex' }, { key: 'sab', label: 'Sáb' },
        { key: 'dom', label: 'Dom' }
    ],

    async render(container) {
        const uid = firebase.auth().currentUser?.uid;
        let comp = {};
        if (uid) {
            try {
                const doc = await db.collection('studios').doc(uid).get();
                comp = doc.exists ? (doc.data() || {}) : {};
            } catch(e) {}
        }
        const hours = comp.businessHours || {};

        const dayRow = (d) => {
            const h = hours[d.key] || { open: false, start: '09:00', end: '18:00' };
            return `
            <div class="settings-day-row" id="day-row-${d.key}">
              <label class="settings-toggle-wrap">
                <input type="checkbox" class="settings-toggle-cb" id="day-${d.key}" ${h.open ? 'checked' : ''}
                  onchange="BusinessHours.toggleDay('${d.key}')">
                <span class="settings-toggle-pill"></span>
                <span class="settings-day-label">${d.label}</span>
              </label>
              <div class="settings-time-range ${h.open ? '' : 'hidden'}" id="time-range-${d.key}">
                <input type="time" class="form-control form-control-sm" id="start-${d.key}" value="${h.start || '09:00'}">
                <span style="color:var(--text-muted);font-size:0.85rem">até</span>
                <input type="time" class="form-control form-control-sm" id="end-${d.key}" value="${h.end || '18:00'}">
              </div>
              <span class="settings-day-closed ${h.open ? 'hidden' : ''}" id="closed-${d.key}" style="color:var(--text-muted);font-size:0.82rem;padding-left:8px">Fechado</span>
            </div>`;
        };

        container.innerHTML = `
        <div class="settings-page">
          <div class="settings-section-card">
            <div class="settings-section-header">
              <span class="material-symbols-outlined">schedule</span>
              <div>
                <h3 class="settings-section-title">Horário de Funcionamento</h3>
                <p class="settings-section-sub">Defina os dias e horários disponíveis para agendamento</p>
              </div>
            </div>
            <div class="settings-section-body">
              <div class="settings-days-list">
                ${BusinessHours.DAYS.map(dayRow).join('')}
              </div>
              <div class="settings-lunch-block" id="lunch-block-wrap">
                <label class="settings-toggle-wrap" style="gap:12px">
                  <input type="checkbox" class="settings-toggle-cb" id="lunch-block" ${(comp.lunchBlock?.enabled) ? 'checked' : ''}
                    onchange="BusinessHours.toggleLunch()">
                  <span class="settings-toggle-pill"></span>
                  <span style="font-size:0.9rem;font-weight:600">🍽️ Bloqueio de Horário de Almoço</span>
                </label>
                <div class="settings-time-range ${comp.lunchBlock?.enabled ? '' : 'hidden'}" id="lunch-time-range" style="margin-top:10px">
                  <input type="time" class="form-control form-control-sm" id="lunch-start" value="${comp.lunchBlock?.start || '12:00'}">
                  <span style="color:var(--text-muted);font-size:0.85rem">até</span>
                  <input type="time" class="form-control form-control-sm" id="lunch-end" value="${comp.lunchBlock?.end || '13:00'}">
                  <span style="color:var(--primary);font-size:0.8rem">Clientes não poderão agendar neste período</span>
                </div>
              </div>
              <div class="settings-action-bar">
                <button class="btn btn-primary" onclick="BusinessHours.saveHours()">
                  <span class="material-symbols-outlined">save</span> Salvar Horários
                </button>
              </div>
            </div>
          </div>
        </div>`;
    },

    toggleDay(key) {
        const cb = document.getElementById(`day-${key}`);
        const range = document.getElementById(`time-range-${key}`);
        const closed = document.getElementById(`closed-${key}`);
        if (cb.checked) { range?.classList.remove('hidden'); closed?.classList.add('hidden'); }
        else { range?.classList.add('hidden'); closed?.classList.remove('hidden'); }
    },

    toggleLunch() {
        const cb = document.getElementById('lunch-block');
        const range = document.getElementById('lunch-time-range');
        cb.checked ? range?.classList.remove('hidden') : range?.classList.add('hidden');
    },

    async saveHours() {
        const uid = firebase.auth().currentUser?.uid;
        if (!uid) return;
        const businessHours = {};
        BusinessHours.DAYS.forEach(d => {
            const cb = document.getElementById(`day-${d.key}`);
            businessHours[d.key] = {
                open:  cb?.checked || false,
                start: document.getElementById(`start-${d.key}`)?.value || '09:00',
                end:   document.getElementById(`end-${d.key}`)?.value   || '18:00'
            };
        });
        const lunchEnabled = document.getElementById('lunch-block')?.checked || false;
        const lunchBlock = {
            enabled: lunchEnabled,
            start:   document.getElementById('lunch-start')?.value || '12:00',
            end:     document.getElementById('lunch-end')?.value   || '13:00'
        };
        try {
            await db.collection('studios').doc(uid).set({ businessHours, lunchBlock }, { merge: true });
            App.showToast('Horários salvos! 🕐', 'success');
        } catch(err) { App.showToast('Erro: ' + err.message, 'error'); }
    }
};
