// === PÁGINA DE AVALIAÇÕES NPS ===
const Reviews = {
    async render(container) {
        container.innerHTML = `<div style="display:flex;justify-content:center;padding:48px"><div class="spinner"></div></div>`;
        let data;
        try {
            data = await Store.getAvgRating();
        } catch(e) {
            data = { avg: 0, total: 0, recent: [] };
        }

        // Buscar todas as avaliações (últimas 100)
        let all = [];
        try {
            const snap = await firebase.firestore().collection('reviews')
                .where('studioId', '==', Store._uid())
                .orderBy('createdAt', 'desc')
                .limit(100).get();
            all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch(e) { all = data.recent || []; }

        container.innerHTML = Reviews._buildHTML(data, all);
        Reviews._renderStars('nps-stars-hero', data.avg);
        Reviews._renderDistribution(all);
    },

    _buildHTML(data, all) {
        const avgDisplay = data.avg > 0 ? data.avg.toFixed(1) : '—';
        const satPct = data.avg > 0 ? Math.round(data.avg / 5 * 100) : 0;
        const npsCategory = data.avg >= 4.5 ? { label: 'Excelente', color: '#22c55e' }
            : data.avg >= 3.5 ? { label: 'Bom', color: '#84cc16' }
            : data.avg >= 2.5 ? { label: 'Regular', color: '#f59e0b' }
            : data.avg > 0    ? { label: 'Atenção', color: '#ef4444' }
            : { label: '—', color: 'var(--text-muted)' };

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

          <!-- Lista de avaliações -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">⭐ Todas as Avaliações</span>
              <span style="font-size:0.8rem;color:var(--text-muted)">${all.length} no total</span>
            </div>
            <div class="card-body" style="padding:0">
              ${all.length === 0
                ? `<div class="empty-state" style="padding:48px">
                    <span class="material-symbols-outlined empty-state-icon">star_border</span>
                    <p class="empty-state-title">Nenhuma avaliação ainda</p>
                    <p class="empty-state-desc">Envie o link de avaliação para suas clientes pela Agenda.</p>
                  </div>`
                : `<div class="reviews-list">${all.map(r => Reviews._reviewCard(r)).join('')}</div>`
              }
            </div>
          </div>

        </div>`;
    },

    _reviewCard(r) {
        const dt = r.createdAt?.toDate ? r.createdAt.toDate() : new Date();
        const date = dt.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });
        const stars = '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0));
        const color = r.rating >= 4 ? '#fbbf24' : r.rating >= 3 ? '#f59e0b' : '#ef4444';
        return `
        <div class="review-item" style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;gap:16px;align-items:flex-start">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:white;flex-shrink:0">
            ${(r.clientName || '?').charAt(0).toUpperCase()}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <strong style="color:var(--text-primary)">${r.clientName || 'Cliente Anônima'}</strong>
              ${r.clientPhone ? `<span style="font-size:0.75rem;color:var(--text-muted)">${r.clientPhone}</span>` : ''}
              <span style="font-size:0.75rem;color:var(--text-muted);margin-left:auto">${date}</span>
            </div>
            <div style="color:${color};font-size:1.1rem;margin-top:4px;letter-spacing:2px">${stars}</div>
            ${r.comment ? `<p style="margin-top:6px;font-size:0.85rem;color:var(--text-secondary);line-height:1.5">"${r.comment}"</p>` : ''}
          </div>
        </div>`;
    },

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

    _renderDistribution(all) {
        const el = document.getElementById('nps-dist');
        if (!el || !all.length) return;
        const counts = [0, 0, 0, 0, 0]; // índice 0 = 1 estrela
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
    }
};
