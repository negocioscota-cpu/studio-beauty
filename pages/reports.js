// === RELATÓRIOS E MÉTRICAS COM GRÁFICOS ===
const Reports = {
    charts: {},
    _appointments: [],
    _clients: [],
    _stats: null,

    /** Converte Timestamp do Firestore, string ISO ou Date em objeto Date */
    toDateSafe(val) {
        if (!val) return null;
        if (val.toDate) return val.toDate();       // Firestore Timestamp
        if (val instanceof Date) return val;        // já é Date
        const d = new Date(val);                    // string ISO
        return isNaN(d.getTime()) ? null : d;
    },

    async render(container) {
        const appointments = await Store.getAppointments();
        const clients = await Store.getClients();
        const stats = await Store.getDashboardStats();

        // Cache para filtros e exportação
        Reports._appointments = appointments;
        Reports._clients = clients;
        Reports._stats = stats;

        // Processa dados para gráficos
        const monthlyRevenue = Reports.getMonthlyRevenue(appointments);
        const procedureCount = Reports.getProcedureCount(appointments);
        const clientGrowth = Reports.getClientGrowth(clients);
        const topClients = Reports.getTopClients(appointments, clients);

        const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Header -->
          <div class="card" style="background:linear-gradient(135deg,#e8f0ff 0%,#f0f4ff 100%);border-color:#c8d8ff">
            <div class="card-body" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
              <div style="font-size:36px">📊</div>
              <div style="flex:1;min-width:200px">
                <h3 style="font-weight:700;color:#3b5998;margin-bottom:4px">Relatórios & Métricas</h3>
                <p style="font-size:0.85rem;color:var(--text-secondary)">Analise o desempenho do seu estúdio com gráficos e indicadores financeiros.</p>
              </div>
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <select class="form-control" id="reports-period" onchange="Reports.changePeriod()" style="width:180px">
                  <option value="3">Últimos 3 meses</option>
                  <option value="6">Últimos 6 meses</option>
                  <option value="12" selected>Últimos 12 meses</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Filtros e Exportação -->
          <div class="reports-filter-bar">
            <label>📅 De:</label>
            <input class="form-control" type="date" id="reports-date-from" onchange="Reports.applyFilters()" />
            <label>Até:</label>
            <input class="form-control" type="date" id="reports-date-to" onchange="Reports.applyFilters()" />
            <label>Procedimento:</label>
            <select class="form-control" id="reports-procedure-filter" onchange="Reports.applyFilters()" style="min-width:170px">
              <option value="">Todos</option>
              ${[...new Set(appointments.map(a => a.service || a.procedure).filter(Boolean))].sort().map(p => `<option value="${p}">${p}</option>`).join('')}
            </select>
            <button class="btn btn-ghost btn-sm" onclick="Reports.clearFilters()" title="Limpar filtros">
              <span class="material-symbols-outlined" style="font-size:16px">filter_alt_off</span> Limpar
            </button>
            <div style="flex:1"></div>
            <button class="btn-export-excel" onclick="Reports.exportFiltered()">
              <span class="material-symbols-outlined" style="font-size:18px">download</span>
              Exportar Excel
            </button>
          </div>

          <!-- KPIs Financeiros -->
          <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)" id="reports-kpi-grid">
            ${Reports._renderKPIs(stats, appointments, clients)}
          </div>

          <!-- Gráficos -->
          <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px">
            <!-- Faturamento Mensal -->
            <div class="card">
              <div class="card-body">
                <div style="font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px">
                  <span class="material-symbols-outlined" style="color:var(--primary)">trending_up</span>
                  Faturamento Mensal
                </div>
                <canvas id="chart-revenue" height="260"></canvas>
              </div>
            </div>

            <!-- Procedimentos por Tipo -->
            <div class="card">
              <div class="card-body">
                <div style="font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px">
                  <span class="material-symbols-outlined" style="color:var(--gold)">donut_small</span>
                  Procedimentos por Tipo
                </div>
                <canvas id="chart-procedures" height="260"></canvas>
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <!-- Crescimento de Clientes -->
            <div class="card">
              <div class="card-body">
                <div style="font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px">
                  <span class="material-symbols-outlined" style="color:#28a745">group_add</span>
                  Crescimento de Clientes
                </div>
                <canvas id="chart-clients" height="200"></canvas>
              </div>
            </div>

            <!-- Top Clientes -->
            <div class="card">
              <div class="card-body">
                <div style="font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;justify-content:space-between">
                  <div style="display:flex;align-items:center;gap:8px">
                    <span class="material-symbols-outlined" style="color:#9c27b0">star</span>
                    Top 5 Clientes (Faturamento)
                  </div>
                  <button class="btn-export-excel" onclick="Reports.exportTopClients()" style="font-size:0.75rem;padding:5px 10px">
                    <span class="material-symbols-outlined" style="font-size:14px">download</span> Excel
                  </button>
                </div>
                <div style="display:flex;flex-direction:column;gap:8px">
                  ${topClients.map((tc, i) => `
                  <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--bg);border-radius:var(--radius-sm)">
                    <div style="width:28px;height:28px;border-radius:50%;background:${i === 0 ? 'linear-gradient(135deg,var(--gold),var(--gold-dark))' : 'var(--primary-xlight)'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;color:${i === 0 ? 'white' : 'var(--primary)'}">${i + 1}</div>
                    <div style="flex:1">
                      <div style="font-weight:600;font-size:0.9rem">${tc.name}</div>
                      <div style="font-size:0.78rem;color:var(--text-muted)">${tc.count} atendimentos</div>
                    </div>
                    <div style="font-weight:700;color:var(--primary)">R$ ${tc.total.toFixed(2)}</div>
                  </div>`).join('')}
                  ${topClients.length === 0 ? '<div style="text-align:center;color:var(--text-muted);padding:20px">Sem dados</div>' : ''}
                </div>
              </div>
            </div>
          </div>

          <!-- Resumo do Período -->
          <div class="card">
            <div class="card-body">
              <div style="font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px;justify-content:space-between">
                <div style="display:flex;align-items:center;gap:8px">
                  <span class="material-symbols-outlined" style="color:var(--primary)">summarize</span>
                  Resumo Detalhado
                </div>
                <button class="btn-export-excel" onclick="Reports.exportSummary()" style="font-size:0.75rem;padding:5px 10px">
                  <span class="material-symbols-outlined" style="font-size:14px">download</span> Resumo Excel
                </button>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
                ${Reports.getDetailedSummary(appointments, clients, stats)}
              </div>
            </div>
          </div>
        </div>`;

        // Renderiza gráficos com Chart.js
        Reports.renderCharts(monthlyRevenue, procedureCount, clientGrowth);
    },

    _renderKPIs(stats, appointments, clients) {
        return `
            <div class="kpi-card">
              <div class="kpi-icon"><span class="material-symbols-outlined">payments</span></div>
              <div class="kpi-value">R$ ${(stats.revenue || 0).toFixed(2)}</div>
              <div class="kpi-label">Faturamento Total</div>
            </div>
            <div class="kpi-card gold">
              <div class="kpi-icon"><span class="material-symbols-outlined">avg_pace</span></div>
              <div class="kpi-value">R$ ${appointments.length > 0 ? (stats.revenue / appointments.length).toFixed(2) : '0.00'}</div>
              <div class="kpi-label">Ticket Médio</div>
            </div>
            <div class="kpi-card green">
              <div class="kpi-icon"><span class="material-symbols-outlined">groups</span></div>
              <div class="kpi-value">${clients.length}</div>
              <div class="kpi-label">Total de Clientes</div>
            </div>
            <div class="kpi-card" style="background:rgba(156,39,176,0.05);border-color:rgba(156,39,176,0.2)">
              <div class="kpi-icon"><span class="material-symbols-outlined" style="color:#9c27b0">event_available</span></div>
              <div class="kpi-value" style="color:#9c27b0">${appointments.length}</div>
              <div class="kpi-label">Total de Atendimentos</div>
            </div>`;
    },

    // === FILTROS ===
    getFilteredAppointments() {
        let filtered = [...Reports._appointments];
        const dateFrom = document.getElementById('reports-date-from')?.value;
        const dateTo = document.getElementById('reports-date-to')?.value;
        const procedure = document.getElementById('reports-procedure-filter')?.value;

        if (dateFrom) {
            const from = new Date(dateFrom + 'T00:00:00');
            filtered = filtered.filter(a => {
                const d = Reports.toDateSafe(a.date);
                return d && d >= from;
            });
        }
        if (dateTo) {
            const to = new Date(dateTo + 'T23:59:59');
            filtered = filtered.filter(a => {
                const d = Reports.toDateSafe(a.date);
                return d && d <= to;
            });
        }
        if (procedure) {
            filtered = filtered.filter(a => (a.service || a.procedure) === procedure);
        }
        return filtered;
    },

    applyFilters() {
        const filtered = Reports.getFilteredAppointments();
        const revenue = filtered.reduce((s, a) => s + parseFloat(a.price || 0), 0);
        const kpiGrid = document.getElementById('reports-kpi-grid');
        if (kpiGrid) {
            kpiGrid.innerHTML = `
              <div class="kpi-card">
                <div class="kpi-icon"><span class="material-symbols-outlined">payments</span></div>
                <div class="kpi-value">R$ ${revenue.toFixed(2)}</div>
                <div class="kpi-label">Faturamento (Filtrado)</div>
              </div>
              <div class="kpi-card gold">
                <div class="kpi-icon"><span class="material-symbols-outlined">avg_pace</span></div>
                <div class="kpi-value">R$ ${filtered.length > 0 ? (revenue / filtered.length).toFixed(2) : '0.00'}</div>
                <div class="kpi-label">Ticket Médio</div>
              </div>
              <div class="kpi-card green">
                <div class="kpi-icon"><span class="material-symbols-outlined">groups</span></div>
                <div class="kpi-value">${Reports._clients.length}</div>
                <div class="kpi-label">Total de Clientes</div>
              </div>
              <div class="kpi-card" style="background:rgba(156,39,176,0.05);border-color:rgba(156,39,176,0.2)">
                <div class="kpi-icon"><span class="material-symbols-outlined" style="color:#9c27b0">event_available</span></div>
                <div class="kpi-value" style="color:#9c27b0">${filtered.length}</div>
                <div class="kpi-label">Atendimentos (Filtrado)</div>
              </div>`;
        }
    },

    clearFilters() {
        const el1 = document.getElementById('reports-date-from');
        const el2 = document.getElementById('reports-date-to');
        const el3 = document.getElementById('reports-procedure-filter');
        if (el1) el1.value = '';
        if (el2) el2.value = '';
        if (el3) el3.value = '';
        Reports.applyFilters();
        App.showToast('Filtros limpos.', 'info');
    },

    // === EXPORTAÇÃO ===
    exportFiltered() {
        const filtered = Reports.getFilteredAppointments();
        const data = filtered.map(a => {
            const d = Reports.toDateSafe(a.date);
            const client = Reports._clients.find(c => c.id === a.clientId);
            return {
                'Data': d ? d.toLocaleDateString('pt-BR') : '—',
                'Horário': a.time || '—',
                'Cliente': client?.name || a.clientName || '—',
                'Procedimento': a.service || a.procedure || '—',
                'Valor (R$)': parseFloat(a.price || 0).toFixed(2),
                'Status': a.status === 'done' ? 'Realizado' : a.status === 'canceled' ? 'Cancelado' : 'Agendado',
                'Profissional': a.professionalName || '—',
                'Observações': a.notes || ''
            };
        });
        ExcelExport.fromData(data, `relatorio_atendimentos_${new Date().toISOString().slice(0,10)}`, 'Atendimentos');
    },

    exportTopClients() {
        const topClients = Reports.getTopClients(Reports._appointments, Reports._clients);
        const data = topClients.map((tc, i) => ({
            'Posição': i + 1,
            'Cliente': tc.name,
            'Atendimentos': tc.count,
            'Faturamento (R$)': tc.total.toFixed(2)
        }));
        ExcelExport.fromData(data, `top_clientes_${new Date().toISOString().slice(0,10)}`, 'Top Clientes');
    },

    exportSummary() {
        const today = new Date();
        const appointments = Reports._appointments;
        const clients = Reports._clients;
        
        const thisMonth = appointments.filter(a => {
            if (!a.date) return false;
            const d = Reports.toDateSafe(a.date);
            if (!d) return false;
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        });
        const thisMonthRev = thisMonth.reduce((s, a) => s + parseFloat(a.price || 0), 0);
        const newClientsMonth = clients.filter(c => {
            if (!c.createdAt) return false;
            const d = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        }).length;

        const data = [{
            'Mês Atual': today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            'Faturamento Mês (R$)': thisMonthRev.toFixed(2),
            'Média/Dia (R$)': (thisMonthRev / today.getDate()).toFixed(2),
            'Atendimentos Mês': thisMonth.length,
            'Clientes Novos': newClientsMonth,
            'Total Clientes': clients.length,
            'Faturamento Total (R$)': (Reports._stats?.revenue || 0).toFixed(2),
            'Total Atendimentos': appointments.length
        }];
        ExcelExport.fromData(data, `resumo_${new Date().toISOString().slice(0,10)}`, 'Resumo');
    },

    renderCharts(monthlyRevenue, procedureCount, clientGrowth) {
        // Destrói gráficos anteriores
        Object.values(Reports.charts).forEach(c => c.destroy && c.destroy());
        Reports.charts = {};

        // 1. Faturamento Mensal (barras + linha)
        const revenueCtx = document.getElementById('chart-revenue')?.getContext('2d');
        if (revenueCtx) {
            Reports.charts.revenue = new Chart(revenueCtx, {
                type: 'bar',
                data: {
                    labels: monthlyRevenue.labels,
                    datasets: [{
                        label: 'Faturamento (R$)',
                        data: monthlyRevenue.values,
                        backgroundColor: 'rgba(179,136,255,0.4)',
                        borderColor: 'rgba(179,136,255,1)',
                        borderWidth: 2,
                        borderRadius: 6,
                    }, {
                        label: 'Tendência',
                        data: monthlyRevenue.values,
                        type: 'line',
                        borderColor: 'rgba(196,163,88,0.8)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 3,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { callback: v => 'R$ ' + v } }
                    }
                }
            });
        }

        // 2. Procedimentos por Tipo (doughnut)
        const procCtx = document.getElementById('chart-procedures')?.getContext('2d');
        if (procCtx) {
            Reports.charts.procedures = new Chart(procCtx, {
                type: 'doughnut',
                data: {
                    labels: procedureCount.labels,
                    datasets: [{
                        data: procedureCount.values,
                        backgroundColor: [
                            '#B388FF', '#C4A358', '#FF80AB', '#80DEEA',
                            '#A5D6A7', '#FFE082', '#CE93D8', '#90CAF9'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    cutout: '60%',
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
                    }
                }
            });
        }

        // 3. Crescimento de Clientes (área)
        const clientCtx = document.getElementById('chart-clients')?.getContext('2d');
        if (clientCtx) {
            Reports.charts.clients = new Chart(clientCtx, {
                type: 'line',
                data: {
                    labels: clientGrowth.labels,
                    datasets: [{
                        label: 'Clientes Acumulados',
                        data: clientGrowth.values,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40,167,69,0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    },

    getMonthlyRevenue(appointments) {
        const months = {};
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months[key] = 0;
        }
        appointments.forEach(a => {
            if (!a.date) return;
            const d = Reports.toDateSafe(a.date);
            if (!d) return;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (months[key] !== undefined) months[key] += parseFloat(a.price || 0);
        });
        return {
            labels: Object.keys(months).map(k => {
                const [y, m] = k.split('-');
                return new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'short' });
            }),
            values: Object.values(months)
        };
    },

    getProcedureCount(appointments) {
        const map = {};
        appointments.forEach(a => {
            const proc = a.service || a.procedure || 'Outro';
            map[proc] = (map[proc] || 0) + 1;
        });
        const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
        return {
            labels: sorted.map(s => s[0]),
            values: sorted.map(s => s[1])
        };
    },

    getClientGrowth(clients) {
        const months = {};
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months[key] = 0;
        }

        clients.forEach(c => {
            if (!c.createdAt) return;
            const date = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (months[key] !== undefined) months[key]++;
        });

        let cumulative = 0;
        const values = Object.values(months).map(v => { cumulative += v; return cumulative; });

        return {
            labels: Object.keys(months).map(k => {
                const [y, m] = k.split('-');
                return new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'short' });
            }),
            values
        };
    },

    getTopClients(appointments, clients) {
        const map = {};
        appointments.forEach(a => {
            if (!a.clientId) return;
            if (!map[a.clientId]) map[a.clientId] = { total: 0, count: 0 };
            map[a.clientId].total += parseFloat(a.price || 0);
            map[a.clientId].count++;
        });
        return Object.entries(map)
            .map(([id, d]) => ({ name: clients.find(c => c.id === id)?.name || 'Cliente', ...d }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    },

    getDetailedSummary(appointments, clients, stats) {
        const today = new Date();
        const thisMonth = appointments.filter(a => {
            if (!a.date) return false;
            const d = Reports.toDateSafe(a.date);
            if (!d) return false;
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        });
        const thisMonthRev = thisMonth.reduce((s, a) => s + parseFloat(a.price || 0), 0);
        const avgPerDay = thisMonthRev / (today.getDate());

        return `
        <div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);text-align:center">
          <div style="font-size:0.8rem;color:var(--text-muted)">Este Mês</div>
          <div style="font-size:1.2rem;font-weight:700;color:var(--primary)">R$ ${thisMonthRev.toFixed(2)}</div>
        </div>
        <div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);text-align:center">
          <div style="font-size:0.8rem;color:var(--text-muted)">Média/Dia (Mês Atual)</div>
          <div style="font-size:1.2rem;font-weight:700;color:var(--gold-dark)">R$ ${avgPerDay.toFixed(2)}</div>
        </div>
        <div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);text-align:center">
          <div style="font-size:0.8rem;color:var(--text-muted)">Atendimentos (Mês)</div>
          <div style="font-size:1.2rem;font-weight:700">${thisMonth.length}</div>
        </div>
        <div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);text-align:center">
          <div style="font-size:0.8rem;color:var(--text-muted)">Clientes Novos (Mês)</div>
          <div style="font-size:1.2rem;font-weight:700;color:#28a745">${clients.filter(c => {
              if (!c.createdAt) return false;
              const d = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
              return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
          }).length}</div>
        </div>`;
    },

    async changePeriod() {
        // Re-render with selected period (future enhancement)
        await Reports.render(document.getElementById('page-content'));
    }
};
