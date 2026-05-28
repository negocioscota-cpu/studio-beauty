// === DASHBOARD INTELIGENTE ===
const Dashboard = {
    async render(container) {
        container.innerHTML = Dashboard._skeleton();
        const [stats, nps, lowStock, bolsaData] = await Promise.all([
            Store.getDashboardStats(),
            Store.getAvgRating().catch(() => ({ avg: 0, total: 0 })),
            Store.getInventory().catch(() => []).then(items => items.filter(i => i.qty <= i.minQty)),
            Dashboard._loadBolsaData().catch(() => null)
        ]);
        // Aniversariantes do dia
        const bdayToday = Dashboard._findBirthdaysToday(stats.clients || []);
        // Agendamentos pendentes de confirmação
        const pendingConfirm = (stats.todayAppts || []).filter(a => a.status === 'scheduled');
        container.innerHTML = Dashboard._buildHTML(stats, nps, lowStock, bdayToday, pendingConfirm, bolsaData);
        Dashboard._renderChart(stats.last7Days);
        Dashboard._renderNpsBar(nps.avg);
    },

    _skeleton() {
        return `<div style="display:flex;flex-direction:column;gap:20px">
          <div class="kpi-grid">
            ${Array(7).fill('<div class="kpi-card" style="animation:pulse 1.5s infinite"><div style="height:60px;background:var(--border);border-radius:8px"></div></div>').join('')}
          </div>
          <div class="card"><div class="card-body" style="height:120px;background:var(--border);border-radius:8px;animation:pulse 1.5s infinite"></div></div>
        </div>`;
    },

    _buildHTML(s, nps, lowStock = [], bdayToday = [], pendingConfirm = [], bolsaData = null) {
        const now = new Date();
        const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
        const userName = document.getElementById('user-name')?.textContent || 'Profissional';

        return `
        <div style="display:flex;flex-direction:column;gap:20px">

          <!-- Saudação -->
          <div class="card dash-greeting-card">
            <div class="card-body" style="display:flex;align-items:center;gap:16px;padding:20px">
              <div class="dash-greeting-emoji">✨</div>
              <div style="flex:1">
                <h2 class="dash-greeting-title">${greeting}, ${userName}! 💕</h2>
                <p class="dash-greeting-sub">Você tem <strong>${s.todayAppointments} atendimento${s.todayAppointments !== 1 ? 's' : ''}</strong> hoje${s.pendingRetouches > 0 ? ` e <strong>${s.pendingRetouches} retoque${s.pendingRetouches !== 1 ? 's' : ''}</strong> a vencer em breve` : ''}.</p>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-primary btn-sm" onclick="App.navigate('clients')">
                  <span class="material-symbols-outlined">person_add</span> Nova Cliente
                </button>
                <button class="btn btn-outline btn-sm" onclick="App.navigate('schedule')">
                  <span class="material-symbols-outlined">event</span> Agenda
                </button>
              </div>
            </div>
          </div>

          <!-- Alerta de estoque baixo -->
          ${lowStock.length > 0 ? `
          <div style="display:flex;align-items:flex-start;gap:14px;padding:16px 20px;border-radius:12px;background:rgba(255,193,7,0.08);border:1px solid rgba(255,193,7,0.35);cursor:pointer" onclick="App.navigate('inventory')">
            <span class="material-symbols-outlined" style="color:#ffc107;font-size:22px;margin-top:2px">warning</span>
            <div style="flex:1">
              <strong style="color:var(--text-primary);font-size:0.9rem">⚠️ Estoque Baixo</strong>
              <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px">
                ${lowStock.map(i => `<span style="margin-right:12px">${i.name}: <strong style="color:#e0a800">${i.qty} ${i.unit||'unid'}</strong> (mín ${i.minQty})</span>`).join('')}
              </div>
            </div>
            <span style="font-size:0.78rem;color:var(--text-muted);white-space:nowrap">Ver estoque →</span>
          </div>` : ''}

          <!-- 7 KPIs -->
          <div class="kpi-grid kpi-grid-7">
            <div class="kpi-card rose kpi-animated">
              <div class="kpi-icon"><span class="material-symbols-outlined">group</span></div>
              <div class="kpi-value">${s.totalClients}</div>
              <div class="kpi-label">Total de Clientes</div>
            </div>
            <div class="kpi-card green kpi-animated" style="animation-delay:.05s">
              <div class="kpi-icon"><span class="material-symbols-outlined">person_add</span></div>
              <div class="kpi-value">${s.newClientsMonth}</div>
              <div class="kpi-label">Novas este Mês</div>
            </div>
            <div class="kpi-card gold kpi-animated" style="animation-delay:.1s">
              <div class="kpi-icon"><span class="material-symbols-outlined">today</span></div>
              <div class="kpi-value">${s.todayAppointments}</div>
              <div class="kpi-label">Atendimentos Hoje</div>
            </div>
            <div class="kpi-card blue kpi-animated" style="animation-delay:.15s">
              <div class="kpi-icon"><span class="material-symbols-outlined">payments</span></div>
              <div class="kpi-value" style="font-size:1rem">${App.formatCurrency(s.monthRevenue)}</div>
              <div class="kpi-label">Faturamento do Mês</div>
            </div>
            <div class="kpi-card purple kpi-animated" style="animation-delay:.2s">
              <div class="kpi-icon"><span class="material-symbols-outlined">receipt_long</span></div>
              <div class="kpi-value" style="font-size:1rem">${App.formatCurrency(s.avgTicket)}</div>
              <div class="kpi-label">Ticket Médio</div>
            </div>
            <div class="kpi-card orange kpi-animated" style="animation-delay:.25s">
              <div class="kpi-icon"><span class="material-symbols-outlined">spa</span></div>
              <div class="kpi-value">${s.pendingRetouches}</div>
              <div class="kpi-label">Retoques p/ Vencer</div>
            </div>
            <!-- NPS KPI -->
            <div class="kpi-card kpi-nps kpi-animated" style="animation-delay:.3s" onclick="App.navigate('reviews')" title="Ver todas as avaliações">
              <div class="kpi-icon"><span class="material-symbols-outlined">star</span></div>
              <div class="kpi-value" id="nps-kpi-value">${nps.avg > 0 ? nps.avg.toFixed(1) : '—'}</div>
              <div class="kpi-label">Nota NPS (${nps.total} aval.)</div>
              <div class="nps-stars-mini" id="nps-stars-bar"></div>
            </div>
          </div>

          <!-- Gráfico + Agenda do Dia -->
          <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:20px" class="dash-split-grid">

            <!-- Mini gráfico 7 dias -->
            <div class="card">
              <div class="card-header">
                <span class="card-title">📊 Atendimentos — Últimos 7 Dias</span>
              </div>
              <div class="card-body">
                <div id="dash-chart" class="dash-chart"></div>
              </div>
            </div>

            <!-- Agenda do Dia -->
            <div class="card">
              <div class="card-header">
                <span class="card-title">📅 Agenda de Hoje</span>
                <button class="btn btn-ghost btn-sm" onclick="App.navigate('schedule')">Ver agenda →</button>
              </div>
              <div class="card-body" style="padding:0">
                ${s.todayAppts.length === 0
                  ? `<div class="empty-state" style="padding:30px">
                      <span class="material-symbols-outlined empty-state-icon" style="font-size:32px">event_available</span>
                      <p class="empty-state-title" style="font-size:0.9rem">Nenhum atendimento hoje</p>
                     </div>`
                  : `<div class="dash-agenda-list">
                      ${s.todayAppts.map(a => {
                        const dt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                        const time = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        return `<div class="dash-agenda-item">
                          <div class="dash-agenda-time">${time}</div>
                          <div class="dash-agenda-dot"></div>
                          <div class="dash-agenda-info">
                            <div class="dash-agenda-client">${a.clientName || 'Cliente'}</div>
                            <div class="dash-agenda-service">${a.service || a.procedure || '—'}</div>
                          </div>
                          ${a.price ? `<div class="dash-agenda-price">${App.formatCurrency(parseFloat(a.price))}</div>` : ''}
                        </div>`;
                      }).join('')}
                     </div>`
                }
              </div>
            </div>
          </div>

          <!-- Aniversariantes + Confirmação (2 colunas) -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px" class="dash-action-grid">

            <!-- 🎂 Aniversariantes do Dia -->
            <div class="card" style="border-left:4px solid #ec4899">
              <div class="card-header" style="padding:14px 16px 8px">
                <span class="card-title" style="font-size:0.88rem">🎂 Aniversariantes do Dia</span>
                <button class="btn btn-ghost btn-sm" onclick="App.navigate('birthday')" style="font-size:0.72rem">Ver todos →</button>
              </div>
              <div class="card-body" style="padding:8px 16px 14px">
                ${bdayToday.length === 0
                  ? `<div style="text-align:center;padding:12px 0;color:var(--text-muted);font-size:0.82rem">
                       <span style="font-size:1.5rem;display:block;margin-bottom:4px">🎉</span>Nenhum aniversário hoje
                     </div>`
                  : bdayToday.map(b => `
                    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
                      <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#f59e0b);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.8rem;flex-shrink:0">${b.name.charAt(0)}</div>
                      <div style="flex:1;min-width:0">
                        <div style="font-weight:600;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.name}</div>
                        <div style="font-size:0.72rem;color:var(--text-muted)">${b.age > 0 && b.age < 100 ? b.age + ' anos' : '🎂 Parabéns!'}</div>
                      </div>
                      ${b.phone ? `<button class="btn btn-sm" style="background:#25D366;color:#fff;border:none;padding:4px 8px;font-size:0.7rem" onclick="Birthday.sendWhatsApp('${b.phone}','${b.firstName}')">📲</button>` : ''}
                    </div>`).join('')}
              </div>
            </div>

            <!-- ✅ Confirmação de Agendamento -->
            <div class="card" style="border-left:4px solid #f59e0b">
              <div class="card-header" style="padding:14px 16px 8px">
                <span class="card-title" style="font-size:0.88rem">✅ Aguardando Confirmação</span>
                ${pendingConfirm.length > 0 ? `<span class="badge badge-gold" style="font-size:0.68rem">${pendingConfirm.length}</span>` : ''}
              </div>
              <div class="card-body" style="padding:8px 16px 14px">
                ${pendingConfirm.length === 0
                  ? `<div style="text-align:center;padding:12px 0;color:var(--text-muted);font-size:0.82rem">
                       <span style="font-size:1.5rem;display:block;margin-bottom:4px">👍</span>Todos confirmados!
                     </div>`
                  : pendingConfirm.slice(0,4).map(a => {
                      const dt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                      const time = dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
                      const cName = a.clientName || 'Cliente';
                      return `
                      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
                        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#ef4444);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.8rem;flex-shrink:0">${time}</div>
                        <div style="flex:1;min-width:0">
                          <div style="font-weight:600;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${cName}</div>
                          <div style="font-size:0.72rem;color:var(--text-muted)">${a.procedure || a.service || '—'}</div>
                        </div>
                        <button class="btn btn-sm" style="background:#25D366;color:#fff;border:none;padding:4px 8px;font-size:0.7rem" onclick="App.navigate('schedule')" title="Confirmar na agenda">📲</button>
                      </div>`;}).join('')}
              </div>
            </div>
          </div>

          <!-- 💼 Bolsa da Beleza (largura total) -->
          <div class="card" style="border-left:4px solid #a855f7">
            <div class="card-header" style="padding:14px 16px 8px">
              <span class="card-title" style="font-size:0.88rem">💼 Bolsa da Beleza — Ações Estratégicas</span>
              <button class="btn btn-ghost btn-sm" onclick="App.navigate('bolsa-beleza')" style="font-size:0.72rem">Abrir →</button>
            </div>
            <div class="card-body" style="padding:12px 16px 14px">
              ${bolsaData ? `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:center">
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                      <span style="font-size:0.78rem;font-weight:600;color:var(--text-secondary)">🚀 Plano 14 Dias</span>
                      <span style="font-size:0.72rem;font-weight:700;color:var(--primary)">${bolsaData.plano14Done}/14</span>
                    </div>
                    <div style="height:8px;background:var(--bg-secondary);border-radius:6px;overflow:hidden">
                      <div style="height:100%;background:linear-gradient(90deg,var(--primary),#a855f7);border-radius:6px;width:${Math.round(bolsaData.plano14Done/14*100)}%;transition:width 0.5s"></div>
                    </div>
                  </div>
                  ${bolsaData.nextTask ? `
                  <div style="background:var(--bg-secondary);border-radius:8px;padding:10px 14px">
                    <div style="font-size:0.72rem;color:var(--text-muted);font-weight:600;margin-bottom:2px">PRÓXIMA AÇÃO</div>
                    <div style="font-size:0.82rem;font-weight:600;color:var(--text-primary)">${bolsaData.nextTask}</div>
                  </div>` : '<div></div>'}
                </div>
              ` : `
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <div style="display:flex;align-items:center;gap:12px">
                    <span style="font-size:1.5rem">💼</span>
                    <span style="font-size:0.85rem;color:var(--text-muted)">Comece a otimizar seu studio com o plano estratégico</span>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="App.navigate('bolsa-beleza')" style="font-size:0.78rem">Iniciar Estratégia</button>
                </div>`}
            </div>
          </div>

          <!-- Próximos Retoques -->
          ${s.upcomingRetouches.length > 0 ? `
          <div class="card">
            <div class="card-header">
              <span class="card-title">🔔 Retoques a Vencer nos Próximos 7 Dias</span>
              <button class="btn btn-ghost btn-sm" onclick="App.navigate('ficha')">Ver fichas →</button>
            </div>
            <div class="table-wrapper">
              <table>
                <thead><tr><th>Cliente</th><th>Procedimento</th><th>Data do Retoque</th><th>Status</th></tr></thead>
                <tbody>
                  ${s.upcomingRetouches.slice(0,5).map(f => {
                    const dt = f.nextRetouchDate?.toDate ? f.nextRetouchDate.toDate() : new Date(f.nextRetouchDate);
                    const today = new Date(); today.setHours(0,0,0,0);
                    const diff = Math.ceil((dt - today) / (1000*60*60*24));
                    const label = diff < 0 ? 'Vencido' : diff === 0 ? 'Hoje!' : `em ${diff}d`;
                    const badge = diff < 0 ? 'badge-brown' : diff <= 2 ? 'badge-orange' : 'badge-green';
                    return `<tr>
                      <td><strong>${f.clientName || '—'}</strong></td>
                      <td>${f.procedure || '—'}</td>
                      <td>${dt.toLocaleDateString('pt-BR')}</td>
                      <td><span class="badge ${badge}">${label}</span></td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>` : ''}

          <!-- Card NPS Avaliações Recentes -->
          ${nps.total > 0 ? `
          <div class="card">
            <div class="card-header">
              <span class="card-title">⭐ Avaliações Recentes</span>
              <button class="btn btn-ghost btn-sm" onclick="App.navigate('reviews')">Ver todas →</button>
            </div>
            <div class="card-body">
              <div class="nps-summary-bar">
                <div class="nps-score-big">${nps.avg.toFixed(1)}</div>
                <div style="flex:1">
                  <div class="nps-stars-row" id="nps-stars-full"></div>
                  <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">${nps.total} avaliação${nps.total !== 1 ? 'ões' : ''} recebida${nps.total !== 1 ? 's' : ''}</div>
                </div>
                <div class="nps-satisfaction">
                  <div class="nps-sat-circle" style="--sat:${Math.round(nps.avg / 5 * 100)}%">
                    <span>${Math.round(nps.avg / 5 * 100)}%</span>
                  </div>
                  <div style="font-size:0.72rem;color:var(--text-muted);text-align:center;margin-top:4px">Satisfação</div>
                </div>
              </div>
            </div>
          </div>` : ''}

          <!-- Últimas Clientes -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">👥 Últimas Clientes Cadastradas</span>
              <button class="btn btn-ghost btn-sm" onclick="App.navigate('clients')">Ver todas →</button>
            </div>
            <div class="table-wrapper">
              <table>
                <thead><tr><th>Nome</th><th>Telefone</th><th>Procedimento</th><th>Status</th></tr></thead>
                <tbody>
                  ${s.clients.slice(0,5).map(c => `
                  <tr style="cursor:pointer" onclick="App.navigate('clients')">
                    <td><strong>${c.name}</strong></td>
                    <td>${c.phone || '-'}</td>
                    <td>${c.procedure || '-'}</td>
                    <td><span class="badge ${c.status === 'active' ? 'badge-green' : 'badge-brown'}">${c.status === 'active' ? 'Ativa' : 'Inativa'}</span></td>
                  </tr>`).join('') || '<tr><td colspan="4" class="text-center" style="color:var(--text-muted);padding:24px">Nenhuma cliente ainda.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

        </div>`;
    },

    _renderNpsBar(avg) {
        const full = Math.floor(avg);
        const half = avg - full >= 0.25 && avg - full < 0.75;
        const makeStars = (id) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = [1,2,3,4,5].map(i => {
                if (i <= full) return '<span class="nps-star filled">★</span>';
                if (i === full + 1 && half) return '<span class="nps-star half">★</span>';
                return '<span class="nps-star">☆</span>';
            }).join('');
        };
        makeStars('nps-stars-bar');
        makeStars('nps-stars-full');
    },

    _renderChart(data) {
        const el = document.getElementById('dash-chart');
        if (!el || !data) return;
        const max = Math.max(...data.map(d => d.count), 1);
        el.innerHTML = data.map(d => {
            const pct = Math.round((d.count / max) * 100);
            return `<div class="dash-bar-wrap">
              <div class="dash-bar-label-top">${d.count > 0 ? d.count : ''}</div>
              <div class="dash-bar-container">
                <div class="dash-bar-fill" style="height:${Math.max(pct, d.count > 0 ? 8 : 0)}%" data-pct="${pct}"></div>
              </div>
              <div class="dash-bar-label">${d.label}</div>
            </div>`;
        }).join('');

        // Animar barras com delay
        setTimeout(() => {
            el.querySelectorAll('.dash-bar-fill').forEach((bar, i) => {
                bar.style.transition = `height 0.5s ease ${i * 0.07}s`;
            });
        }, 50);
    },

    // === ANIVERSARIANTES DO DIA ===
    _findBirthdaysToday(clients) {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();
        const result = [];
        clients.forEach(c => {
            if (!c.birthday) return;
            let bDate;
            if (c.birthday.toDate) bDate = c.birthday.toDate();
            else bDate = new Date(c.birthday + 'T12:00:00');
            if (isNaN(bDate.getTime())) return;
            if (bDate.getMonth() === todayMonth && bDate.getDate() === todayDate) {
                result.push({
                    name: c.name,
                    firstName: (c.name || '').split(' ')[0],
                    phone: c.phone || '',
                    age: today.getFullYear() - bDate.getFullYear()
                });
            }
        });
        return result;
    },

    // === DADOS DA BOLSA DA BELEZA ===
    async _loadBolsaData() {
        const uid = firebase.auth().currentUser?.uid;
        if (!uid) return null;
        const snap = await firebase.firestore()
            .collection('studios').doc(uid)
            .collection('bolsa_beleza').doc('dados').get();
        if (!snap.exists) return null;
        const data = snap.data();
        const plano14 = data.plano14 || {};
        const done = Object.values(plano14).filter(v => v === true).length;
        const taskNames = [
            'Audite Sua Agenda','Calcule Seu Hora Cem','Catalogue Seus Serviços',
            'Elimine os Vilões','Crie Seu Combo Premium','Lance o Pacote de Fidelidade',
            'Faça 5 Stories de Bastidores','Reajuste 3 Preços','Crie Sua Lista VIP',
            'Grave Um Reels Tutorial','Prospecte 3 Parcerias','Implemente Upsell Automático',
            'Analise Sua Nova Alocação','Defina Metas do Mês'
        ];
        let nextTask = null;
        for (let i = 1; i <= 14; i++) {
            if (!plano14[i]) { nextTask = `Dia ${i}: ${taskNames[i-1]}`; break; }
        }
        return { plano14Done: done, nextTask };
    }
};
