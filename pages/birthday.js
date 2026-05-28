// === PARABÉNS DE ANIVERSÁRIO AUTOMÁTICO ===
const Birthday = {
    currentClients: [],

    async render(container) {
        Birthday.currentClients = await Store.getClients();

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Header -->
          <div class="card" style="background:linear-gradient(135deg,#FF6B8A 0%,var(--gold) 100%);color:white">
            <div class="card-body" style="display:flex;align-items:center;gap:16px">
              <div style="font-size:40px">🎂</div>
              <div style="flex:1">
                <h3 style="font-weight:800;font-size:1.2rem;margin-bottom:4px">Aniversariantes</h3>
                <p style="opacity:0.9;font-size:0.85rem">Fidelize clientes com felicitações personalizadas e ofertas especiais.</p>
              </div>
              <button class="btn btn-sm" style="background:rgba(255,255,255,0.25);color:white;border:1px solid rgba(255,255,255,0.4);backdrop-filter:blur(4px)" onclick="Birthday.downloadList()" title="Baixar lista de aniversariantes">
                <span class="material-symbols-outlined" style="font-size:18px">download</span> Baixar Lista
              </button>
            </div>
          </div>

          <!-- KPIs -->
          <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
            <div class="kpi-card rose">
              <div class="kpi-icon"><span class="material-symbols-outlined">cake</span></div>
              <div class="kpi-value" id="bday-today">0</div>
              <div class="kpi-label">Hoje 🎉</div>
            </div>
            <div class="kpi-card gold">
              <div class="kpi-icon"><span class="material-symbols-outlined">date_range</span></div>
              <div class="kpi-value" id="bday-week">0</div>
              <div class="kpi-label">Esta Semana</div>
            </div>
            <div class="kpi-card green">
              <div class="kpi-icon"><span class="material-symbols-outlined">calendar_month</span></div>
              <div class="kpi-value" id="bday-month">0</div>
              <div class="kpi-label">Este Mês</div>
            </div>
          </div>

          <!-- Lista -->
          <div id="bday-sections"></div>

          <!-- Clientes sem data de nascimento -->
          <div id="bday-missing" class="card hidden">
            <div class="card-header"><span class="card-title">⚠️ Clientes sem data de nascimento</span></div>
            <div class="card-body" id="bday-missing-list" style="font-size:0.85rem"></div>
          </div>
        </div>`;

        Birthday.loadData();
    },

    loadData() {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();
        const todayDay = today.getDay();

        // Início e fim da semana
        const weekStart = new Date(today);
        weekStart.setDate(todayDate - todayDay);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const bdayToday = [];
        const bdayWeek = [];
        const bdayMonth = [];
        const missing = [];

        Birthday.currentClients.forEach(client => {
            if (!client.birthday) {
                missing.push(client);
                return;
            }

            let bDate;
            if (client.birthday.toDate) {
                bDate = client.birthday.toDate();
            } else {
                bDate = new Date(client.birthday + 'T12:00:00');
            }

            if (isNaN(bDate.getTime())) {
                missing.push(client);
                return;
            }

            const bMonth = bDate.getMonth();
            const bDay = bDate.getDate();

            // Mesmo mês?
            if (bMonth === todayMonth) {
                bdayMonth.push({ client, birthday: bDate, day: bDay });

                // Hoje?
                if (bDay === todayDate) {
                    bdayToday.push({ client, birthday: bDate, day: bDay });
                }

                // Esta semana? (verifica se o aniversário "deste ano" cai na semana)
                const thisYearBday = new Date(today.getFullYear(), bMonth, bDay);
                if (thisYearBday >= weekStart && thisYearBday <= weekEnd) {
                    bdayWeek.push({ client, birthday: bDate, day: bDay });
                }
            }
        });

        // Atualiza KPIs
        document.getElementById('bday-today').textContent = bdayToday.length;
        document.getElementById('bday-week').textContent = bdayWeek.length;
        document.getElementById('bday-month').textContent = bdayMonth.length;

        // Renderiza seções
        const sections = document.getElementById('bday-sections');
        let html = '';

        if (bdayToday.length) {
            html += Birthday.renderSection('🎉 Aniversariantes de Hoje', bdayToday, 'rose');
        }

        if (bdayWeek.length) {
            const notToday = bdayWeek.filter(b => b.day !== todayDate);
            if (notToday.length) {
                html += Birthday.renderSection('📅 Esta Semana', notToday, 'gold');
            }
        }

        const upcoming = bdayMonth
            .filter(b => b.day > todayDate)
            .sort((a, b) => a.day - b.day);
        if (upcoming.length) {
            html += Birthday.renderSection('📆 Próximos neste Mês', upcoming, 'green');
        }

        if (!html) {
            html = `<div class="empty-state">
                <span class="material-symbols-outlined empty-state-icon">sentiment_satisfied</span>
                <p class="empty-state-title">Nenhum aniversário neste mês</p>
                <p class="empty-state-desc">Verifique se suas clientes têm data de nascimento cadastrada.</p>
            </div>`;
        }

        sections.innerHTML = html;

        // Clientes sem data
        if (missing.length) {
            document.getElementById('bday-missing').classList.remove('hidden');
            document.getElementById('bday-missing-list').innerHTML = missing.map(c =>
                `<span style="display:inline-block;background:var(--bg);border:1px solid var(--border);padding:4px 10px;border-radius:var(--radius-full);margin:3px;font-size:0.8rem">${c.name}</span>`
            ).join('');
        }
    },

    renderSection(title, items, colorClass) {
        return `<div class="card">
            <div class="card-header"><span class="card-title">${title}</span></div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
                ${items.map(({ client, birthday }) => {
                    const age = new Date().getFullYear() - birthday.getFullYear();
                    const phone = client.phone || '';
                    const hasWhatsApp = phone.length >= 10;

                    return `<div style="display:flex;align-items:center;gap:14px;padding:12px;background:var(--bg);border-radius:var(--radius-sm);border:1px solid var(--border)">
                        <div style="font-size:2rem">🎂</div>
                        <div style="flex:1">
                            <div style="font-weight:700;font-size:1rem">${client.name}</div>
                            <div style="font-size:0.82rem;color:var(--text-secondary)">
                                ${birthday.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                ${age > 0 && age < 100 ? ` · ${age} anos` : ''}
                            </div>
                            ${client.procedure ? `<div style="font-size:0.78rem;color:var(--text-muted)">${client.procedure}</div>` : ''}
                        </div>
                        <div style="display:flex;gap:6px">
                            ${hasWhatsApp ? `<button class="btn btn-sm" style="background:#25D366;color:white;border:none" onclick="Birthday.sendWhatsApp('${phone}', '${client.name.split(' ')[0]}')">
                                <span class="material-symbols-outlined" style="font-size:16px">chat</span> WhatsApp
                            </button>` : ''}
                            ${hasWhatsApp ? `<button class="btn btn-ghost btn-sm" onclick="Birthday.sendPromo('${phone}', '${client.name.split(' ')[0]}')" title="Enviar oferta de aniversário">
                                <span class="material-symbols-outlined" style="font-size:16px">card_giftcard</span>
                            </button>` : ''}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    },

    sendWhatsApp(phone, firstName) {
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.length <= 11 ? '55' + cleanPhone : cleanPhone;
        const msg = encodeURIComponent(
            `Olá ${firstName}! 🎂💕\n\n` +
            `Parabéns pelo seu aniversário! 🥳🎉\n\n` +
            `Que esse novo ciclo traga muitas conquistas e alegrias! ` +
            `É uma honra cuidar da sua beleza. 😘✨\n\n` +
            `Com carinho,\n✨ LashBrow`
        );
        window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
    },

    sendPromo(phone, firstName) {
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.length <= 11 ? '55' + cleanPhone : cleanPhone;
        const msg = encodeURIComponent(
            `Olá ${firstName}! 🎂✨\n\n` +
            `Como hoje é o SEU dia, preparei um presente especial:\n\n` +
            `🎁 *10% OFF* em qualquer procedimento durante este mês!\n\n` +
            `Aproveite para agendar aquele procedimento que você está querendo. ` +
            `Válido durante todo o mês do seu aniversário! 💕\n\n` +
            `Agende agora mesmo! 😘\n✨ LashBrow`
        );
        window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
    },

    downloadList() {
        const today = new Date();
        const todayMonth = today.getMonth();
        const monthName = today.toLocaleDateString('pt-BR', { month: 'long' });

        const rows = [];
        Birthday.currentClients.forEach(client => {
            if (!client.birthday) return;
            let bDate;
            if (client.birthday.toDate) { bDate = client.birthday.toDate(); }
            else { bDate = new Date(client.birthday + 'T12:00:00'); }
            if (isNaN(bDate.getTime())) return;
            if (bDate.getMonth() !== todayMonth) return;

            const age = today.getFullYear() - bDate.getFullYear();
            rows.push({
                name: client.name || '-',
                phone: client.phone || '-',
                birthday: bDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                age: (age > 0 && age < 100) ? age : '-'
            });
        });

        rows.sort((a, b) => {
            const dA = parseInt(a.birthday);
            const dB = parseInt(b.birthday);
            return dA - dB;
        });

        if (rows.length === 0) {
            App.showToast('Nenhum aniversariante neste mês para exportar.', 'info');
            return;
        }

        // Gerar CSV
        let csv = '\uFEFF'; // BOM para Excel
        csv += 'Nome;Telefone;Aniversário;Idade\n';
        rows.forEach(r => {
            csv += `${r.name};${r.phone};${r.birthday};${r.age}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aniversariantes_${monthName}_${today.getFullYear()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        App.showToast(`Lista de ${rows.length} aniversariante(s) baixada! 📋`, 'success');
    }
};
