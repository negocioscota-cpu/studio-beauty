// === RELATÓRIO DE RETENÇÃO DE CLIENTES ===
const Retention = {
    _data: null,
    _filter: 45,

    async render(container) {
        container.innerHTML = '<div style="text-align:center;padding:48px"><div class="spinner"></div></div>';
        
        try {
            Retention._data = await Store.getRetentionData();
        } catch(e) {
            container.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined empty-state-icon">error</span><p class="empty-state-title">Erro ao carregar dados</p></div>';
            return;
        }

        const { clients, appointments } = Retention._data;
        const today = new Date(); today.setHours(0,0,0,0);
        
        // KPIs
        const withVisits = clients.filter(c => c.totalVisits > 0);
        const returned90 = withVisits.filter(c => c.daysSinceLastVisit <= 90);
        const returnRate = withVisits.length > 0 ? Math.round(returned90.length / withVisits.length * 100) : 0;
        const inactive = withVisits.filter(c => c.daysSinceLastVisit >= Retention._filter);
        
        // Churn: clientes com recorrência (2+ visitas, intervalo médio < 45 dias) que não voltaram
        const churned = withVisits.filter(c => c.totalVisits >= 2 && c.avgInterval > 0 && c.avgInterval < 45 && c.daysSinceLastVisit > c.avgInterval * 2);
        
        // Ticket médio de recorrentes
        const recurrents = withVisits.filter(c => c.totalVisits >= 2);
        const avgTicketRecurrent = recurrents.length > 0 
            ? recurrents.reduce((s, c) => s + c.totalSpent, 0) / recurrents.reduce((s, c) => s + c.totalVisits, 0) 
            : 0;

        // Gráfico 6 meses - taxa de retenção por mês
        const monthlyRetention = Retention._calcMonthlyRetention(clients, appointments);

        // Top 10 fiéis
        const topFaithful = [...withVisits]
            .sort((a, b) => b.totalVisits - a.totalVisits || b.totalSpent - a.totalSpent)
            .slice(0, 10);

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Header -->
          <div class="card" style="background:linear-gradient(135deg,#0a1628 0%,#1a2d50 50%,#0a1628 100%)">
            <div class="card-body" style="padding:28px;display:flex;align-items:center;gap:16px">
              <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">📈</div>
              <div>
                <h2 style="font-size:1.3rem;font-weight:700;color:white">Retenção de Clientes</h2>
                <p style="font-size:0.85rem;color:rgba(255,255,255,0.6);margin-top:2px">Analise o retorno das clientes e reconquiste quem parou de vir</p>
              </div>
            </div>
          </div>

          <!-- KPIs -->
          <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
            <div class="kpi-card" style="background:rgba(59,130,246,0.06);border-color:rgba(59,130,246,0.2)">
              <div class="kpi-icon"><span class="material-symbols-outlined" style="color:#3b82f6">refresh</span></div>
              <div class="kpi-value" style="color:#3b82f6">${returnRate}%</div>
              <div class="kpi-label">Taxa de Retorno (90d)</div>
            </div>
            <div class="kpi-card" style="background:rgba(245,158,11,0.06);border-color:rgba(245,158,11,0.2)">
              <div class="kpi-icon"><span class="material-symbols-outlined" style="color:#f59e0b">person_off</span></div>
              <div class="kpi-value" style="color:#f59e0b">${inactive.length}</div>
              <div class="kpi-label">Inativos (${Retention._filter}+ dias)</div>
            </div>
            <div class="kpi-card" style="background:rgba(239,68,68,0.06);border-color:rgba(239,68,68,0.2)">
              <div class="kpi-icon"><span class="material-symbols-outlined" style="color:#ef4444">trending_down</span></div>
              <div class="kpi-value" style="color:#ef4444">${churned.length}</div>
              <div class="kpi-label">Churn Detectado</div>
            </div>
            <div class="kpi-card" style="background:rgba(34,197,94,0.06);border-color:rgba(34,197,94,0.2)">
              <div class="kpi-icon"><span class="material-symbols-outlined" style="color:#22c55e">payments</span></div>
              <div class="kpi-value" style="color:#22c55e">${App.formatCurrency(avgTicketRecurrent)}</div>
              <div class="kpi-label">Ticket Médio Recorrentes</div>
            </div>
          </div>

          <!-- Filtro + Tabela de Inativos -->
          <div class="card">
            <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
              <span class="card-title">⚠️ Clientes Inativos</span>
              <div style="display:flex;gap:6px;align-items:center">
                <span style="font-size:0.78rem;color:var(--text-muted)">Sem visita há:</span>
                ${[45, 60, 90, 120].map(d => `
                  <button onclick="Retention.setFilter(${d})" 
                    style="font-size:0.72rem;padding:4px 12px;border-radius:20px;border:1px solid ${Retention._filter === d ? 'var(--primary)' : 'var(--border)'};background:${Retention._filter === d ? 'var(--primary)' : 'var(--bg-secondary)'};color:${Retention._filter === d ? '#fff' : 'var(--text-primary)'};cursor:pointer;font-weight:600;transition:all 0.2s">${d}+ dias</button>
                `).join('')}
              </div>
            </div>
            <div class="table-wrapper">
              <table>
                <thead><tr>
                  <th>Cliente</th><th>Telefone</th><th>Último Procedimento</th><th>Última Visita</th><th>Dias Ausente</th><th>Ações</th>
                </tr></thead>
                <tbody id="retention-inactive-tbody">
                  ${Retention._renderInactiveRows(inactive)}
                </tbody>
              </table>
            </div>
            ${inactive.length === 0 ? '<div style="text-align:center;padding:32px;color:var(--text-muted)"><span class="material-symbols-outlined" style="font-size:48px;opacity:0.3">celebration</span><p style="margin-top:8px">Nenhuma cliente inativa! Todas estão voltando 🎉</p></div>' : ''}
          </div>

          <!-- Gráfico de Retenção Mensal -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">📊 Evolução da Retenção (6 meses)</span>
            </div>
            <div class="card-body" style="padding:20px">
              ${Retention._renderRetentionChart(monthlyRetention)}
            </div>
          </div>

          <!-- Top 10 Fiéis -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">⭐ Top 10 Clientes Fiéis</span>
            </div>
            <div class="table-wrapper">
              <table>
                <thead><tr>
                  <th>#</th><th>Cliente</th><th>Visitas</th><th>Total Gasto</th><th>Intervalo Médio</th><th>Fidelidade</th>
                </tr></thead>
                <tbody>
                  ${topFaithful.map((c, i) => `
                    <tr>
                      <td style="font-weight:800;color:${i < 3 ? 'var(--gold-dark)' : 'var(--text-muted)'}">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                      <td><strong>${c.name}</strong></td>
                      <td style="font-weight:700">${c.totalVisits}</td>
                      <td style="font-weight:600;color:var(--primary)">${App.formatCurrency(c.totalSpent)}</td>
                      <td>${c.avgInterval > 0 ? c.avgInterval + ' dias' : '—'}</td>
                      <td>${c.totalVisits >= 10 ? '<span class="badge badge-gold">💎 Diamante</span>' : c.totalVisits >= 5 ? '<span class="badge badge-blue">⭐ Fiel</span>' : '<span class="badge badge-green">🌱 Regular</span>'}</td>
                    </tr>
                  `).join('')}
                  ${topFaithful.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted)">Ainda sem dados de atendimentos concluídos</td></tr>' : ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>`;
    },

    setFilter(days) {
        Retention._filter = days;
        if (Retention._data) {
            const inactive = Retention._data.clients
                .filter(c => c.totalVisits > 0 && c.daysSinceLastVisit >= days)
                .sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);
            
            // Atualizar KPI de inativos
            const kpiCards = document.querySelectorAll('.kpi-card');
            if (kpiCards[1]) {
                kpiCards[1].querySelector('.kpi-value').textContent = inactive.length;
                kpiCards[1].querySelector('.kpi-label').textContent = `Inativos (${days}+ dias)`;
            }
            
            // Atualizar botões de filtro
            document.querySelectorAll('[onclick^="Retention.setFilter"]').forEach(btn => {
                const d = parseInt(btn.textContent);
                btn.style.background = d === days ? 'var(--primary)' : 'var(--bg-secondary)';
                btn.style.color = d === days ? '#fff' : 'var(--text-primary)';
                btn.style.borderColor = d === days ? 'var(--primary)' : 'var(--border)';
            });
            
            // Atualizar tabela
            const tbody = document.getElementById('retention-inactive-tbody');
            if (tbody) tbody.innerHTML = Retention._renderInactiveRows(inactive);
        }
    },

    _renderInactiveRows(inactive) {
        if (!inactive.length) return '';
        return inactive.map(c => {
            const lastDate = c.lastVisit ? c.lastVisit.toLocaleDateString('pt-BR') : '—';
            const days = c.daysSinceLastVisit;
            const badgeColor = days >= 90 ? '#ef4444' : days >= 60 ? '#f97316' : '#f59e0b';
            const badgeLabel = days >= 90 ? 'Crítico' : days >= 60 ? 'Alerta' : 'Atenção';
            const phone = (c.phone || '').replace(/\D/g, '');
            return `
            <tr>
              <td><strong>${c.name}</strong></td>
              <td>${c.phone || '—'}</td>
              <td style="font-size:0.85rem">${c.lastProcedure || '—'}</td>
              <td style="font-size:0.85rem">${lastDate}</td>
              <td>
                <span style="display:inline-flex;align-items:center;gap:4px;font-size:0.78rem;padding:3px 10px;border-radius:12px;background:${badgeColor}15;color:${badgeColor};font-weight:700">
                  ${days} dias · ${badgeLabel}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:6px">
                  ${phone ? `<button class="btn btn-sm" style="background:#25D366;color:white;border:none;padding:6px 12px;border-radius:8px;font-size:0.75rem;cursor:pointer;font-weight:600" 
                    onclick="WA.winback('${c.name.replace(/'/g, "\\'")}','${c.phone}','${(c.lastProcedure||'').replace(/'/g, "\\'")}')" title="Reconquistar via WhatsApp">📲 Reconquistar</button>` : ''}
                  <button class="btn btn-ghost btn-sm" onclick="App.navigate('schedule')" title="Agendar retorno" style="font-size:0.75rem">
                    <span class="material-symbols-outlined" style="font-size:14px">event</span> Agendar
                  </button>
                </div>
              </td>
            </tr>`;
        }).join('');
    },

    _calcMonthlyRetention(clients, appointments) {
        const today = new Date(); today.setHours(0,0,0,0);
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const mStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const mEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
            const mAppts = appointments.filter(a => {
                const dt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                return dt >= mStart && dt < mEnd;
            });
            const uniqueClients = new Set(mAppts.map(a => a.clientId));
            const returning = [...uniqueClients].filter(cid => {
                // Cliente que já tinha vindo antes desse mês
                return appointments.some(a => {
                    const dt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                    return a.clientId === cid && dt < mStart;
                });
            });
            const rate = uniqueClients.size > 0 ? Math.round(returning.length / uniqueClients.size * 100) : 0;
            months.push({
                label: mStart.toLocaleDateString('pt-BR', { month: 'short' }),
                fullLabel: mStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                total: uniqueClients.size,
                returning: returning.length,
                rate
            });
        }
        return months;
    },

    _renderRetentionChart(months) {
        const maxRate = Math.max(...months.map(m => m.rate), 1);
        return `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${months.map(m => {
            const pct = Math.max(m.rate, 2);
            const color = m.rate >= 70 ? '#22c55e' : m.rate >= 40 ? '#f59e0b' : '#ef4444';
            return `
            <div style="display:flex;align-items:center;gap:12px">
              <div style="min-width:50px;font-size:0.78rem;font-weight:600;color:var(--text-muted);text-align:right;text-transform:capitalize">${m.label}</div>
              <div style="flex:1;height:28px;background:rgba(255,255,255,0.05);border-radius:8px;overflow:hidden;position:relative">
                <div style="height:100%;width:${pct}%;background:${color};border-radius:8px;transition:width 0.8s ease;display:flex;align-items:center;padding-left:10px">
                  ${m.rate > 15 ? `<span style="font-size:0.72rem;font-weight:700;color:white">${m.rate}%</span>` : ''}
                </div>
                ${m.rate <= 15 ? `<span style="position:absolute;left:${pct + 2}%;top:50%;transform:translateY(-50%);font-size:0.72rem;font-weight:600;color:var(--text-muted)">${m.rate}%</span>` : ''}
              </div>
              <div style="min-width:90px;font-size:0.72rem;color:var(--text-muted)">${m.returning}/${m.total} clientes</div>
            </div>`;
          }).join('')}
        </div>
        <div style="margin-top:16px;padding:12px 16px;background:rgba(59,130,246,0.05);border-radius:10px;border:1px solid rgba(59,130,246,0.15)">
          <p style="font-size:0.78rem;color:var(--text-secondary);line-height:1.6">
            📊 <strong>Taxa de Retenção</strong> = clientes que retornaram ÷ total de clientes atendidos no mês. 
            Verde (≥70%) = excelente · Amarelo (40-69%) = atenção · Vermelho (<40%) = ação urgente.
          </p>
        </div>`;
    }
};
