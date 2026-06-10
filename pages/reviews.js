// === PÁGINA DE AVALIAÇÕES NPS ===
const Reviews = {
    _allReviews: [],
    _filteredReviews: [],

    async render(container) {
        container.innerHTML = `<div style="display:flex;justify-content:center;padding:48px"><div class="spinner"></div></div>`;

        // Buscar todas as avaliações (single query — sem duplicação)
        let all = [];
        try {
            const snap = await firebase.firestore().collection('reviews')
                .where('studioId', '==', Store._uid())
                .orderBy('createdAt', 'desc')
                .limit(200).get();
            all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch(e) { console.warn('Erro ao carregar avaliações:', e); }

        Reviews._allReviews = all;
        Reviews._filteredReviews = all;

        // Calcular stats
        const avg = all.length > 0 ? all.reduce((s, r) => s + (r.rating || 0), 0) / all.length : 0;
        const data = { avg, total: all.length, recent: all.slice(0, 5) };

        container.innerHTML = Reviews._buildHTML(data, all);
        Reviews._renderStars('nps-stars-hero', data.avg);
        Reviews._renderDistribution(all);
        Reviews._renderChart(all);
    },

    _buildHTML(data, all) {
        const avgDisplay = data.avg > 0 ? data.avg.toFixed(1) : '—';
        const satPct = data.avg > 0 ? Math.round(data.avg / 5 * 100) : 0;
        const promoters = all.filter(r => r.rating === 5).length;
        const passives = all.filter(r => r.rating === 4).length;
        const detractors = all.filter(r => r.rating >= 1 && r.rating <= 3).length;
        const npsScore = all.length > 0 ? Math.round((promoters/all.length - detractors/all.length) * 100) : 0;
        const npsColor = npsScore >= 50 ? '#22c55e' : npsScore >= 0 ? '#f59e0b' : '#ef4444';
        const npsLabel = npsScore >= 75 ? 'Zona de Excelência' : npsScore >= 50 ? 'Zona de Qualidade' : npsScore >= 0 ? 'Zona de Aperfeiçoamento' : 'Zona Crítica';
        const npsCategory = data.avg >= 4.5 ? { label: 'Excelente', color: '#22c55e' }
            : data.avg >= 3.5 ? { label: 'Bom', color: '#84cc16' }
            : data.avg >= 2.5 ? { label: 'Regular', color: '#f59e0b' }
            : data.avg > 0    ? { label: 'Atenção', color: '#ef4444' }
            : { label: '—', color: 'var(--text-muted)' };

        // Gerar link genérico de avaliação (sem apptId)
        const reviewLink = `${location.origin}/avaliacao.html?studio=${Store._uid()}`;

        return `
        <div style="display:flex;flex-direction:column;gap:20px;max-width:900px;margin:0 auto">

          <!-- Hero NPS -->
          <div class="card" style="background:linear-gradient(135deg,#1a0a1e 0%,#2d1040 50%,#1a0a1e 100%);overflow:hidden;position:relative">
            <div style="position:absolute;top:-20px;right:-20px;font-size:120px;opacity:0.06;pointer-events:none">⭐</div>
            <div class="card-body" style="padding:32px;position:relative;z-index:1">
              <div style="display:flex;align-items:center;gap:32px;flex-wrap:wrap">
                <!-- Nota grande -->
                <div style="text-align:center;min-width:120px">
                  <div style="font-size:4rem;font-weight:900;color:var(--gold);line-height:1">${avgDisplay}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">de 5.0</div>
                  <div id="nps-stars-hero" style="margin-top:8px;font-size:1.4rem"></div>
                </div>
                <!-- Stats -->
                <div style="flex:1;min-width:200px">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                    <span style="font-size:1.4rem;font-weight:700;color:white">${data.total} avaliação${data.total !== 1 ? 'ões' : ''}</span>
                    <span style="background:${npsCategory.color}22;color:${npsCategory.color};padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600">${npsCategory.label}</span>
                  </div>
                  <div style="font-size:0.85rem;color:var(--text-muted)">Satisfação geral do estúdio</div>
                  <!-- Barra de satisfação -->
                  <div style="margin-top:16px">
                    <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-bottom:6px">
                      <span>Índice de Satisfação</span><span style="color:${npsCategory.color}">${satPct}%</span>
                    </div>
                    <div style="height:8px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden">
                      <div style="height:100%;width:${satPct}%;background:linear-gradient(90deg,var(--rose),var(--gold));border-radius:99px;transition:width 1s ease"></div>
                    </div>
                  </div>
                </div>
                <!-- Distribuição de estrelas -->
                <div id="nps-dist" style="min-width:200px;flex:1"></div>
              </div>
            </div>
          </div>

          <!-- Link de Avaliação -->
          <div class="card" style="border:1px solid rgba(251,191,36,0.3);background:rgba(251,191,36,0.04)">
            <div class="card-body" style="padding:20px">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                <span class="material-symbols-outlined" style="color:#fbbf24;font-size:24px">link</span>
                <strong style="color:var(--text-primary)">Link de Avaliação</strong>
                <span style="font-size:0.75rem;color:var(--text-muted)">Envie para suas clientes avaliarem seu atendimento</span>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                <input class="form-control" id="nps-review-link" value="${reviewLink}" readonly
                  style="flex:1;min-width:200px;font-size:0.82rem;background:var(--bg-tertiary);cursor:text" onclick="this.select()" />
                <button class="btn btn-sm" onclick="Reviews._copyLink()" style="background:#fbbf24;color:#1a0a1e;border:none;display:inline-flex;align-items:center;gap:4px;font-weight:700">
                  <span class="material-symbols-outlined" style="font-size:16px">content_copy</span> Copiar
                </button>
                <button class="btn btn-sm" onclick="Reviews._shareWhatsApp()" style="background:#25d366;color:white;border:none;display:inline-flex;align-items:center;gap:4px;font-weight:700">
                  <span class="material-symbols-outlined" style="font-size:16px">share</span> WhatsApp
                </button>
              </div>
            </div>
          </div>

          <!-- NPS Score Card -->
          <div class="card">
            <div class="card-body" style="padding:24px">
              <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
                <div style="text-align:center;min-width:100px">
                  <div style="font-size:2.8rem;font-weight:900;color:${npsColor};line-height:1">${npsScore}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">NPS Score</div>
                  <div style="font-size:0.7rem;padding:3px 10px;border-radius:20px;background:${npsColor}15;color:${npsColor};font-weight:600;margin-top:6px">${npsLabel}</div>
                </div>
                <div style="flex:1;min-width:200px;display:flex;gap:16px;flex-wrap:wrap">
                  <div style="flex:1;min-width:80px;text-align:center;padding:12px;background:rgba(34,197,94,0.06);border-radius:10px;border:1px solid rgba(34,197,94,0.15)">
                    <div style="font-size:1.3rem;font-weight:800;color:#22c55e">${promoters}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted)">Promotoras (5★)</div>
                  </div>
                  <div style="flex:1;min-width:80px;text-align:center;padding:12px;background:rgba(245,158,11,0.06);border-radius:10px;border:1px solid rgba(245,158,11,0.15)">
                    <div style="font-size:1.3rem;font-weight:800;color:#f59e0b">${passives}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted)">Neutras (4★)</div>
                  </div>
                  <div style="flex:1;min-width:80px;text-align:center;padding:12px;background:rgba(239,68,68,0.06);border-radius:10px;border:1px solid rgba(239,68,68,0.15)">
                    <div style="font-size:1.3rem;font-weight:800;color:#ef4444">${detractors}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted)">Detratoras (1-3★)</div>
                  </div>
                </div>
              </div>
              <div style="margin-top:16px;padding:10px 14px;background:rgba(59,130,246,0.04);border-radius:8px;border:1px solid rgba(59,130,246,0.1)">
                <p style="font-size:0.75rem;color:var(--text-muted);line-height:1.5;margin:0">
                  📊 <strong>NPS</strong> = % Promotoras − % Detratoras · Escala: -100 a +100 · 
                  <span style="color:#22c55e">≥75</span> Excelência · <span style="color:#84cc16">≥50</span> Qualidade · <span style="color:#f59e0b">≥0</span> Aperfeiçoamento · <span style="color:#ef4444">&lt;0</span> Crítica
                </p>
              </div>
            </div>
          </div>

          <!-- Gráfico de Evolução NPS -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">📈 Evolução Mensal</span>
              <span style="font-size:0.75rem;color:var(--text-muted)">NPS Score e Nota Média por mês</span>
            </div>
            <div class="card-body" style="padding:20px">
              <div id="nps-chart" style="width:100%;overflow-x:auto"></div>
            </div>
          </div>

          <!-- Filtros + Lista de avaliações -->
          <div class="card">
            <div class="card-header" style="flex-wrap:wrap;gap:10px">
              <span class="card-title">⭐ Avaliações</span>
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <select class="form-control" id="nps-filter-period" onchange="Reviews._applyFilters()" style="width:140px;font-size:0.82rem">
                  <option value="">Todo período</option>
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                  <option value="365">Último ano</option>
                </select>
                <select class="form-control" id="nps-filter-rating" onchange="Reviews._applyFilters()" style="width:130px;font-size:0.82rem">
                  <option value="">Todas notas</option>
                  <option value="5">5★ Excelente</option>
                  <option value="4">4★ Bom</option>
                  <option value="3">3★ Regular</option>
                  <option value="2">2★ Ruim</option>
                  <option value="1">1★ Horrível</option>
                </select>
                <input class="form-control" id="nps-search" placeholder="Buscar comentário..." oninput="Reviews._applyFilters()" style="width:170px;font-size:0.82rem" />
                <button class="btn btn-sm" onclick="Reviews._exportExcel()" style="background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);display:inline-flex;align-items:center;gap:4px">
                  <span class="material-symbols-outlined" style="font-size:16px">download</span> Excel
                </button>
              </div>
            </div>
            <div class="card-body" style="padding:0">
              <div id="nps-count" style="padding:12px 20px;font-size:0.8rem;color:var(--text-muted);border-bottom:1px solid var(--border)">
                ${all.length} avaliação${all.length !== 1 ? 'ões' : ''} no total
              </div>
              <div id="nps-reviews-list">
                ${all.length === 0
                  ? `<div class="empty-state" style="padding:48px">
                      <span class="material-symbols-outlined empty-state-icon">star_border</span>
                      <p class="empty-state-title">Nenhuma avaliação ainda</p>
                      <p class="empty-state-desc">Envie o link de avaliação para suas clientes.</p>
                    </div>`
                  : `<div class="reviews-list">${all.map(r => Reviews._reviewCard(r)).join('')}</div>`
                }
              </div>
            </div>
          </div>

        </div>`;
    },

    // === CARD DE AVALIAÇÃO ===
    _reviewCard(r) {
        const dt = r.createdAt?.toDate ? r.createdAt.toDate() : new Date();
        const date = dt.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });
        const stars = '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0));
        const color = r.rating >= 4 ? '#fbbf24' : r.rating >= 3 ? '#f59e0b' : '#ef4444';
        const isNegative = r.rating <= 2;
        const name = Reviews._escapeHtml(r.clientName || 'Cliente Anônima');
        return `
        <div class="review-item" style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;gap:16px;align-items:flex-start;${isNegative ? 'background:rgba(239,68,68,0.04);border-left:3px solid #ef4444;' : ''}">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,${isNegative ? '#ef4444,#dc2626' : 'var(--primary),var(--secondary)'});display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:white;flex-shrink:0">
            ${name.charAt(0).toUpperCase()}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <strong style="color:var(--text-primary)">${name}</strong>
              ${r.clientPhone ? `<span style="font-size:0.75rem;color:var(--text-muted)">${Reviews._escapeHtml(r.clientPhone)}</span>` : ''}
              <span style="font-size:0.75rem;color:var(--text-muted);margin-left:auto">${date}</span>
            </div>
            <div style="color:${color};font-size:1.1rem;margin-top:4px;letter-spacing:2px">${stars}</div>
            ${r.comment ? `<p style="margin-top:6px;font-size:0.85rem;color:var(--text-secondary);line-height:1.5">"${Reviews._escapeHtml(r.comment)}"</p>` : ''}
          </div>
        </div>`;
    },

    // === SANITIZAÇÃO XSS ===
    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // === ESTRELAS VISUAIS ===
    _renderStars(id, avg) {
        const el = document.getElementById(id);
        if (!el) return;
        const full = Math.floor(avg);
        const half = avg - full >= 0.25 && avg - full < 0.75;
        el.innerHTML = [1,2,3,4,5].map(i => {
            if (i <= full) return '<span style="color:#fbbf24">★</span>';
            if (i === full + 1 && half) return '<span style="color:#fbbf24;opacity:0.6">★</span>';
            return '<span style="color:rgba(255,255,255,0.2)">☆</span>';
        }).join('');
    },

    // === DISTRIBUIÇÃO DE ESTRELAS ===
    _renderDistribution(all) {
        const el = document.getElementById('nps-dist');
        if (!el || !all.length) return;
        const counts = [0, 0, 0, 0, 0];
        all.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++; });
        el.innerHTML = [5,4,3,2,1].map(star => {
            const count = counts[star - 1];
            const pct = all.length ? Math.round(count / all.length * 100) : 0;
            return `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="font-size:0.75rem;color:#fbbf24;width:14px">${star}★</span>
              <div style="flex:1;height:6px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#fbbf24,#f59e0b);border-radius:99px;transition:width 1s ease"></div>
              </div>
              <span style="font-size:0.72rem;color:var(--text-muted);width:24px;text-align:right">${count}</span>
            </div>`;
        }).join('');
    },

    // === GRÁFICO TEMPORAL NPS ===
    _renderChart(all) {
        const el = document.getElementById('nps-chart');
        if (!el || all.length === 0) {
            if (el) el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:0.85rem">Dados insuficientes para o gráfico.</div>';
            return;
        }

        // Agrupar por mês
        const months = {};
        all.forEach(r => {
            const dt = r.createdAt?.toDate ? r.createdAt.toDate() : new Date();
            const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
            if (!months[key]) months[key] = [];
            months[key].push(r);
        });

        const sortedKeys = Object.keys(months).sort();
        if (sortedKeys.length < 2) {
            el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:0.85rem">É necessário pelo menos 2 meses de dados para o gráfico.</div>';
            return;
        }

        const chartData = sortedKeys.map(key => {
            const items = months[key];
            const avg = items.reduce((s, r) => s + (r.rating || 0), 0) / items.length;
            const prom = items.filter(r => r.rating === 5).length;
            const det = items.filter(r => r.rating >= 1 && r.rating <= 3).length;
            const nps = Math.round((prom/items.length - det/items.length) * 100);
            const [y, m] = key.split('-');
            const label = new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            return { key, label, avg, nps, count: items.length };
        });

        const maxNps = Math.max(...chartData.map(d => d.nps), 10);
        const minNps = Math.min(...chartData.map(d => d.nps), -10);
        const range = maxNps - minNps || 1;
        const barWidth = Math.max(40, Math.min(80, Math.floor(600 / chartData.length)));
        const chartH = 180;

        let barsHtml = chartData.map((d, idx) => {
            const npsH = Math.round(((d.nps - minNps) / range) * (chartH - 40));
            const npsColor = d.nps >= 50 ? '#22c55e' : d.nps >= 0 ? '#f59e0b' : '#ef4444';
            const avgH = Math.round((d.avg / 5) * (chartH - 40));
            return `
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;min-width:${barWidth}px">
              <div style="font-size:0.7rem;font-weight:700;color:${npsColor}">${d.nps}</div>
              <div style="width:24px;height:${npsH}px;background:${npsColor};border-radius:4px 4px 0 0;transition:height 0.5s"></div>
              <div style="width:100%;height:1px;background:var(--border)"></div>
              <div style="font-size:0.68rem;color:var(--text-muted)">${d.label}</div>
              <div style="font-size:0.68rem;color:#fbbf24;font-weight:600">${d.avg.toFixed(1)}★</div>
              <div style="font-size:0.65rem;color:var(--text-muted)">${d.count} aval.</div>
            </div>`;
        }).join('');

        el.innerHTML = `
        <div style="display:flex;align-items:flex-end;gap:6px;justify-content:center;min-height:${chartH + 60}px;padding:10px 0">
          ${barsHtml}
        </div>
        <div style="display:flex;justify-content:center;gap:20px;margin-top:8px;font-size:0.72rem;color:var(--text-muted)">
          <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#22c55e;margin-right:4px"></span>NPS Score</span>
          <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#fbbf24;margin-right:4px"></span>Nota Média</span>
        </div>`;
    },

    // === FILTROS ===
    _applyFilters() {
        const period = document.getElementById('nps-filter-period')?.value;
        const rating = document.getElementById('nps-filter-rating')?.value;
        const search = (document.getElementById('nps-search')?.value || '').toLowerCase();

        let filtered = [...Reviews._allReviews];

        // Filtro por período
        if (period) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - parseInt(period));
            filtered = filtered.filter(r => {
                const dt = r.createdAt?.toDate ? r.createdAt.toDate() : new Date();
                return dt >= cutoff;
            });
        }

        // Filtro por nota
        if (rating) {
            filtered = filtered.filter(r => r.rating === parseInt(rating));
        }

        // Busca por comentário/nome
        if (search) {
            filtered = filtered.filter(r =>
                (r.comment || '').toLowerCase().includes(search) ||
                (r.clientName || '').toLowerCase().includes(search)
            );
        }

        Reviews._filteredReviews = filtered;
        const list = document.getElementById('nps-reviews-list');
        const count = document.getElementById('nps-count');
        if (count) count.textContent = `${filtered.length} avaliação${filtered.length !== 1 ? 'ões' : ''} encontrada${filtered.length !== 1 ? 's' : ''}`;
        if (list) {
            list.innerHTML = filtered.length === 0
                ? `<div style="padding:32px;text-align:center;color:var(--text-muted)">Nenhuma avaliação encontrada para os filtros selecionados.</div>`
                : `<div class="reviews-list">${filtered.map(r => Reviews._reviewCard(r)).join('')}</div>`;
        }
    },

    // === GERADOR DE LINK ===
    _copyLink() {
        const input = document.getElementById('nps-review-link');
        if (!input) return;
        input.select();
        navigator.clipboard.writeText(input.value).then(() => {
            App.toast('Link copiado! 📋', 'success');
        }).catch(() => {
            document.execCommand('copy');
            App.toast('Link copiado! 📋', 'success');
        });
    },

    _shareWhatsApp() {
        const link = document.getElementById('nps-review-link')?.value || '';
        const msg = `⭐ *Avalie nosso atendimento!*\n\nSua opinião é muito importante para nós. Clique no link abaixo para avaliar:\n\n${link}\n\n💕 Obrigada por nos escolher!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    },

    // === EXPORTAÇÃO EXCEL ===
    _exportExcel() {
        const reviews = Reviews._filteredReviews;
        if (reviews.length === 0) { App.toast('Nenhuma avaliação para exportar.', 'warning'); return; }
        const data = reviews.map(r => {
            const dt = r.createdAt?.toDate ? r.createdAt.toDate() : new Date();
            return {
                'Data': dt.toLocaleDateString('pt-BR'),
                'Cliente': r.clientName || 'Anônima',
                'Telefone': r.clientPhone || '',
                'Nota': r.rating || 0,
                'Estrelas': '★'.repeat(r.rating || 0),
                'Comentário': r.comment || ''
            };
        });
        ExcelExport.fromData(data, `avaliacoes_nps_${new Date().toISOString().slice(0,10)}`, 'Avaliações NPS');
    }
};
