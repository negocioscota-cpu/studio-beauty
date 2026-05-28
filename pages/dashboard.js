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
        Dashboard._render6MonthChart(stats.last6Months);
        Dashboard._renderGoalProgress(stats);
    },

    _skeleton() {
        return `<div style="display:flex;flex-direction:column;gap:20px">
          <div class="kpi-grid">
            ${Array(7).fill('<div class="kpi-card" style="animation:pulse 1.5s infinite"><div style="height:60px;background:var(--border);border-radius:8px"></div></div>').join('')}
          </div>
          <div class="card"><div class="card-body" style="height:120px;background:var(--border);border-radius:8px;animation:pulse 1.5s infinite"></div></div>
        </div>`;
    },

    // Helper: calcula variação percentual e retorna badge HTML
    _trendBadge(current, previous) {
        if (!previous || previous === 0) return current > 0 ? '<span style="color:#22c55e;font-size:0.68rem;font-weight:700">🆕 Novo</span>' : '';
        const pct = ((current - previous) / previous * 100).toFixed(0);
        if (pct > 0) return `<span style="color:#22c55e;font-size:0.68rem;font-weight:700">▲ ${pct}%</span>`;
        if (pct < 0) return `<span style="color:#ef4444;font-size:0.68rem;font-weight:700">▼ ${Math.abs(pct)}%</span>`;
        return '<span style="color:var(--text-muted);font-size:0.68rem;font-weight:700">= 0%</span>';
    },

    _buildHTML(s, nps, lowStock = [], bdayToday = [], pendingConfirm = [], bolsaData = null) {
        const now = new Date();
        const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
        const userName = document.getElementById('user-name')?.textContent || 'Profissional';
        const prevMonthName = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });

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

          <!-- 🎯 META MENSAL + COMPARATIVO -->
          <div class="card" style="border-left:4px solid var(--primary)">
            <div class="card-header" style="padding:14px 16px 8px">
              <span class="card-title" style="font-size:0.88rem">🎯 Meta Mensal de Faturamento</span>
              <button class="btn btn-ghost btn-sm" onclick="Dashboard._openGoalModal()" style="font-size:0.72rem">
                <span class="material-symbols-outlined" style="font-size:14px">edit</span> Editar Meta
              </button>
            </div>
            <div class="card-body" style="padding:12px 16px 16px" id="goal-progress-area">
              <!-- Preenchido por _renderGoalProgress -->
            </div>
          </div>

          <!-- 7 KPIs com comparativo -->
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
              <div class="kpi-trend">${Dashboard._trendBadge(s.newClientsMonth, s.prevNewClientsMonth)}</div>
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
              <div class="kpi-trend">${Dashboard._trendBadge(s.monthRevenue, s.prevMonthRevenue)}</div>
            </div>
            <div class="kpi-card purple kpi-animated" style="animation-delay:.2s">
              <div class="kpi-icon"><span class="material-symbols-outlined">receipt_long</span></div>
              <div class="kpi-value" style="font-size:1rem">${App.formatCurrency(s.avgTicket)}</div>
              <div class="kpi-label">Ticket Médio</div>
              <div class="kpi-trend">${Dashboard._trendBadge(s.avgTicket, s.prevAvgTicket)}</div>
            </div>
            <div class="kpi-card orange kpi-animated" style="animation-delay:.25s">
              <div class="kpi-icon"><span class="material-symbols-outlined">spa</span></div>
              <div class="kpi-value">${s.monthAppointments || 0}</div>
              <div class="kpi-label">Atendimentos Mês</div>
              <div class="kpi-trend">${Dashboard._trendBadge(s.monthAppointments, s.prevMonthAppointments)}</div>
            </div>
            <!-- NPS KPI -->
            <div class="kpi-card kpi-nps kpi-animated" style="animation-delay:.3s" onclick="App.navigate('reviews')" title="Ver todas as avaliações">
              <div class="kpi-icon"><span class="material-symbols-outlined">star</span></div>
              <div class="kpi-value" id="nps-kpi-value">${nps.avg > 0 ? nps.avg.toFixed(1) : '—'}</div>
              <div class="kpi-label">Nota NPS (${nps.total} aval.)</div>
              <div class="nps-stars-mini" id="nps-stars-bar"></div>
            </div>
          </div>

          <!-- Comparativo rápido com mês anterior -->
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <div style="flex:1;min-width:200px;padding:14px 18px;border-radius:12px;background:var(--bg-secondary);border:1px solid var(--border)">
              <div style="font-size:0.72rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">📊 vs. ${prevMonthName}</div>
              <div style="display:flex;gap:20px;flex-wrap:wrap">
                <div><span style="font-size:0.78rem;color:var(--text-secondary)">Faturamento:</span> <strong style="font-size:0.85rem">${App.formatCurrency(s.prevMonthRevenue)}</strong> → <strong style="font-size:0.85rem;color:var(--primary)">${App.formatCurrency(s.monthRevenue)}</strong> ${Dashboard._trendBadge(s.monthRevenue, s.prevMonthRevenue)}</div>
                <div><span style="font-size:0.78rem;color:var(--text-secondary)">Atendimentos:</span> <strong>${s.prevMonthAppointments}</strong> → <strong style="color:var(--primary)">${s.monthAppointments || 0}</strong> ${Dashboard._trendBadge(s.monthAppointments, s.prevMonthAppointments)}</div>
                <div><span style="font-size:0.78rem;color:var(--text-secondary)">Novas Clientes:</span> <strong>${s.prevNewClientsMonth}</strong> → <strong style="color:var(--primary)">${s.newClientsMonth}</strong> ${Dashboard._trendBadge(s.newClientsMonth, s.prevNewClientsMonth)}</div>
              </div>
            </div>
          </div>

          <!-- Gráficos: 7 dias + 6 meses -->
          <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:20px" class="dash-split-grid">

            <!-- Mini gráfico 7 dias -->
            <div class="card">
              <div class="card-header">
                <span class="card-title">📊 Atendimentos — Últimos 7 Dias</span>
              </div>
              <div class="card-body">
                <div id="dash-chart" class="dash-chart"></div>
              </div>
            </div>

            <!-- 📈 Evolução 6 Meses -->
            <div class="card">
              <div class="card-header">
                <span class="card-title">📈 Evolução — Últimos 6 Meses</span>
                <div style="display:flex;gap:12px;align-items:center">
                  <span style="display:flex;align-items:center;gap:4px;font-size:0.68rem;color:var(--text-muted)"><span style="width:10px;height:10px;border-radius:2px;background:var(--primary);display:inline-block"></span> Atendimentos</span>
                  <span style="display:flex;align-items:center;gap:4px;font-size:0.68rem;color:var(--text-muted)"><span style="width:10px;height:10px;border-radius:2px;background:#a855f7;display:inline-block"></span> Receita</span>
                </div>
              </div>
              <div class="card-body" style="padding:16px">
                <div id="dash-6month-chart" style="display:flex;align-items:flex-end;gap:8px;height:160px"></div>
              </div>
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

          <!-- 💼 Bolsa da Beleza -->
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
                    const today2 = new Date(); today2.setHours(0,0,0,0);
                    const diff = Math.ceil((dt - today2) / (1000*60*60*24));
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

    // === GRÁFICO DE EVOLUÇÃO — ÚLTIMOS 6 MESES ===
    _render6MonthChart(data) {
        const el = document.getElementById('dash-6month-chart');
        if (!el || !data || data.length === 0) return;

        const maxAppts = Math.max(...data.map(d => d.appointments), 1);
        const maxRev = Math.max(...data.map(d => d.revenue), 1);

        el.innerHTML = data.map((d, idx) => {
            const apptPct = Math.round((d.appointments / maxAppts) * 100);
            const revPct = Math.round((d.revenue / maxRev) * 100);
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0">
              <div style="font-size:0.65rem;font-weight:700;color:var(--text-secondary)">${d.appointments}</div>
              <div style="width:100%;height:120px;display:flex;align-items:flex-end;gap:3px">
                <div style="flex:1;background:var(--primary);border-radius:4px 4px 0 0;height:0%;transition:height 0.6s ease ${idx*0.08}s;opacity:0.9" data-target-h="${Math.max(apptPct, d.appointments > 0 ? 8 : 0)}%" class="bar-animate"></div>
                <div style="flex:1;background:#a855f7;border-radius:4px 4px 0 0;height:0%;transition:height 0.6s ease ${idx*0.08+0.1}s;opacity:0.75" data-target-h="${Math.max(revPct, d.revenue > 0 ? 8 : 0)}%" class="bar-animate"></div>
              </div>
              <div style="font-size:0.68rem;color:var(--text-muted);text-transform:capitalize;font-weight:600">${d.label}</div>
              <div style="font-size:0.6rem;color:var(--text-muted)">${App.formatCurrency(d.revenue)}</div>
            </div>`;
        }).join('');

        // Animar barras com delay
        setTimeout(() => {
            el.querySelectorAll('.bar-animate').forEach(bar => {
                bar.style.height = bar.dataset.targetH;
            });
        }, 100);
    },

    // === META MENSAL — PROGRESSO ===
    _renderGoalProgress(stats) {
        const el = document.getElementById('goal-progress-area');
        if (!el) return;

        const goal = stats.monthlyGoal;
        const revenue = stats.monthRevenue;

        if (!goal || goal <= 0) {
            el.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div style="display:flex;align-items:center;gap:12px">
                <span style="font-size:1.5rem">🎯</span>
                <div>
                  <div style="font-size:0.85rem;color:var(--text-primary);font-weight:600">Defina sua meta mensal</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">Acompanhe o progresso do faturamento em relação à sua meta</div>
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="Dashboard._openGoalModal()" style="font-size:0.78rem">Definir Meta</button>
            </div>`;
            return;
        }

        const pct = Math.min(Math.round((revenue / goal) * 100), 100);
        const remaining = Math.max(goal - revenue, 0);
        const barColor = pct >= 100 ? '#22c55e' : pct >= 70 ? 'var(--primary)' : pct >= 40 ? '#f59e0b' : '#ef4444';
        const statusEmoji = pct >= 100 ? '🏆' : pct >= 70 ? '🔥' : pct >= 40 ? '💪' : '🚀';
        const statusText = pct >= 100 ? 'Meta atingida! Parabéns!' : pct >= 70 ? 'Quase lá, continue assim!' : pct >= 40 ? 'Bom progresso, mantenha o ritmo!' : 'Vamos acelerar este mês!';

        el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary)">${statusEmoji} ${statusText}</span>
              <span style="font-size:0.82rem;font-weight:700;color:var(--primary)">${pct}%</span>
            </div>
            <div style="height:12px;background:var(--bg-secondary);border-radius:8px;overflow:hidden;position:relative">
              <div style="height:100%;background:${barColor};border-radius:8px;width:${pct}%;transition:width 1s ease"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:6px">
              <span style="font-size:0.72rem;color:var(--text-muted)">Atual: <strong>${App.formatCurrency(revenue)}</strong></span>
              <span style="font-size:0.72rem;color:var(--text-muted)">Meta: <strong>${App.formatCurrency(goal)}</strong></span>
            </div>
          </div>
          <div style="text-align:center;padding:8px 16px;background:var(--bg-secondary);border-radius:12px;min-width:100px">
            <div style="font-size:0.68rem;color:var(--text-muted);font-weight:600;margin-bottom:2px">FALTAM</div>
            <div style="font-size:1.1rem;font-weight:800;color:${pct >= 100 ? '#22c55e' : 'var(--text-primary)'}">${pct >= 100 ? '✅' : App.formatCurrency(remaining)}</div>
          </div>
        </div>`;
    },

    // === MODAL PARA EDITAR META ===
    _openGoalModal() {
        const modal = document.getElementById('modal-content');
        if (!modal) return;

        const uid = firebase.auth().currentUser?.uid;
        // Carregar meta atual
        firebase.firestore().collection('studioConfig').doc(uid).get().then(doc => {
            const currentGoal = doc.exists ? doc.data().monthlyGoal || '' : '';
            modal.innerHTML = `
            <div style="padding:24px">
              <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:8px">
                <span class="material-symbols-outlined" style="color:var(--primary)">flag</span>
                Definir Meta Mensal
              </h3>
              <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:20px">Quanto você quer faturar por mês? Essa meta aparecerá no dashboard.</p>

              <label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:6px">Meta de faturamento mensal (R$)</label>
              <input type="number" id="goal-input" value="${currentGoal}" placeholder="Ex: 5000" min="0" step="100"
                style="width:100%;padding:14px 16px;border:1px solid var(--border);border-radius:10px;font-size:1.1rem;font-weight:700;background:var(--bg-secondary);color:var(--text-primary)">

              <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap">
                ${[3000, 5000, 8000, 10000, 15000].map(v => `<button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('goal-input').value=${v}" style="font-size:0.75rem">${App.formatCurrency(v)}</button>`).join('')}
              </div>

              <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;padding-top:16px;border-top:1px solid var(--border)">
                <button class="btn btn-ghost" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="Dashboard._saveGoal()">
                  <span class="material-symbols-outlined" style="font-size:16px">save</span> Salvar Meta
                </button>
              </div>
            </div>`;
            App.openModal();
        });
    },

    async _saveGoal() {
        const input = document.getElementById('goal-input');
        const goal = parseFloat(input?.value) || 0;
        const uid = firebase.auth().currentUser?.uid;
        if (!uid) return;

        try {
            await firebase.firestore().collection('studioConfig').doc(uid).set(
                { monthlyGoal: goal, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
                { merge: true }
            );
            App.closeModal();
            App.showToast(goal > 0 ? `Meta de ${App.formatCurrency(goal)} definida! 🎯` : 'Meta removida.', 'success');
            // Recarregar dashboard
            const container = document.getElementById('app-content') || document.querySelector('.main-content');
            if (container) Dashboard.render(container);
        } catch(e) {
            App.showToast('Erro ao salvar meta: ' + e.message, 'error');
        }
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
