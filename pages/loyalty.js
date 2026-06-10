// === PROGRAMA DE FIDELIDADE ===
const Loyalty = {
    async render(container) {
        container.innerHTML = '<div style="text-align:center;padding:48px"><div class="spinner"></div></div>';

        const [config, clients, allAppts] = await Promise.all([
            Store.getLoyaltyConfig().catch(() => ({ threshold: 10, reward: 'Manutenção grátis' })),
            Store.getClients(),
            Store.getAllAppointmentsDone()
        ]);

        // Contar visitas por cliente
        const visitMap = {};
        allAppts.forEach(a => {
            if (!a.clientId) return;
            visitMap[a.clientId] = (visitMap[a.clientId] || 0) + 1;
        });

        // Enriquecer clientes com visitas
        const enriched = clients.map(c => ({
            ...c,
            visits: visitMap[c.id] || 0,
            currentCycle: (visitMap[c.id] || 0) % config.threshold,
            progress: Math.min(100, Math.round(((visitMap[c.id] || 0) % config.threshold) / config.threshold * 100)),
            milestones: Math.floor((visitMap[c.id] || 0) / config.threshold),
            nextIn: config.threshold - ((visitMap[c.id] || 0) % config.threshold)
        })).sort((a, b) => b.visits - a.visits);

        const withVisits = enriched.filter(c => c.visits > 0);
        const reachedMilestone = enriched.filter(c => c.visits > 0 && c.visits % config.threshold === 0);
        const totalRewards = enriched.reduce((s, c) => s + c.milestones, 0);
        const avgVisits = withVisits.length ? Math.round(withVisits.reduce((s, c) => s + c.visits, 0) / withVisits.length) : 0;
        const closeTo = enriched.filter(c => c.visits > 0 && c.nextIn <= Math.ceil(config.threshold * 0.3) && c.nextIn > 0);

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">

          <!-- Hero -->
          <div class="loyalty-hero">
            <div class="loyalty-hero-icon">🎁</div>
            <div>
              <h2 class="loyalty-hero-title">Programa de Fidelidade</h2>
              <p class="loyalty-hero-sub">Cartão de fidelidade automático com carimbos visuais.</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="Loyalty.openConfig()">
              <span class="material-symbols-outlined">settings</span> Configurar
            </button>
          </div>

          <!-- Stats -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px">
            <div class="card" style="text-align:center;padding:16px">
              <div style="font-size:1.8rem;font-weight:800;color:var(--primary)">${withVisits.length}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">Clientes ativas</div>
            </div>
            <div class="card" style="text-align:center;padding:16px">
              <div style="font-size:1.8rem;font-weight:800;color:var(--gold)">${totalRewards}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">Prêmios entregues</div>
            </div>
            <div class="card" style="text-align:center;padding:16px">
              <div style="font-size:1.8rem;font-weight:800;color:#3b82f6">${avgVisits}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">Média de visitas</div>
            </div>
            <div class="card" style="text-align:center;padding:16px">
              <div style="font-size:1.8rem;font-weight:800;color:#22c55e">${closeTo.length}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">Próximas do prêmio</div>
            </div>
          </div>

          <!-- Config Banner -->
          <div class="loyalty-config-banner">
            <span class="material-symbols-outlined" style="color:var(--gold);font-size:20px">stars</span>
            <span>A cada <strong>${config.threshold} atendimentos</strong>, a cliente ganha: <strong>${config.reward || 'Brinde não configurado'}</strong></span>
          </div>

          <!-- Busca -->
          <div style="display:flex;gap:8px;align-items:center">
            <input class="form-control" id="loyalty-search" placeholder="Buscar cliente..." oninput="Loyalty._filter()" style="flex:1;font-size:0.85rem" />
            <select class="form-control" id="loyalty-filter" onchange="Loyalty._filter()" style="width:160px;font-size:0.85rem">
              <option value="all">Todas</option>
              <option value="milestone">🎉 Prêmio pendente</option>
              <option value="close">🔥 Próximas do prêmio</option>
              <option value="active">Ativas (com visitas)</option>
            </select>
          </div>

          <!-- Clientes que atingiram o marco -->
          ${reachedMilestone.length > 0 ? `
          <div class="card" style="border:2px solid var(--gold);background:rgba(201,169,110,0.06)">
            <div class="card-header">
              <span class="card-title">🎉 Prêmio a Entregar!</span>
              <span class="badge badge-gold">${reachedMilestone.length} cliente${reachedMilestone.length > 1 ? 's' : ''}</span>
            </div>
            <div class="card-body" style="padding:0">
              ${reachedMilestone.map(c => `
              <div class="loyalty-milestone-row">
                <div class="loyalty-avatar">${c.name.charAt(0)}</div>
                <div style="flex:1">
                  <div style="font-weight:700">${c.name}</div>
                  <div style="font-size:0.78rem;color:var(--text-muted)">${c.visits} atendimentos · ${c.milestones}× premiada</div>
                </div>
                ${c.phone ? `<button class="btn btn-wa btn-sm" onclick="WA.loyaltyReward('${c.name.replace(/'/g,"\\'")}','${c.phone}','${(config.reward||'').replace(/'/g,"\\'")}','${c.visits}')">
                  📲 Avisar
                </button>` : '<span class="badge badge-brown" style="font-size:0.7rem">Sem tel.</span>'}
              </div>`).join('')}
            </div>
          </div>` : ''}

          <!-- Ranking com cartão de carimbos -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">🏆 Cartões de Fidelidade</span>
              <span style="font-size:0.8rem;color:var(--text-muted)">${withVisits.length} clientes ativas</span>
            </div>
            <div class="card-body" style="padding:0" id="loyalty-list">
              ${withVisits.length === 0
                ? `<div class="empty-state" style="padding:40px">
                    <span class="material-symbols-outlined empty-state-icon">loyalty</span>
                    <p class="empty-state-title">Nenhum atendimento registrado ainda</p>
                    <p class="empty-state-desc">Conclua agendamentos para começar o programa.</p>
                  </div>`
                : withVisits.map((c, i) => Loyalty._renderCard(c, i, config)).join('')
              }
            </div>
          </div>

        </div>

        <!-- Modal de Configuração -->
        <div id="loyalty-modal" class="modal-overlay hidden" onclick="Loyalty.closeConfig(event)">
          <div class="modal-container" onclick="event.stopPropagation()" style="max-width:420px">
            <div class="modal-header">
              <h3 class="modal-title">⚙️ Configurar Fidelidade</h3>
              <button class="modal-close" onclick="Loyalty.closeConfig()">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Número de atendimentos para o prêmio *</label>
                <input class="form-control" type="number" id="loyalty-threshold" min="1" max="100"
                  value="${config.threshold}" placeholder="Ex: 10" />
                <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">Cada vez que a cliente atingir este número, ela ganha a recompensa.</div>
              </div>
              <div class="form-group">
                <label class="form-label">Recompensa *</label>
                <input class="form-control" id="loyalty-reward" value="${config.reward || ''}"
                  placeholder="Ex: Manutenção grátis, 20% de desconto..." />
              </div>
              <div class="modal-footer">
                <button class="btn btn-ghost" onclick="Loyalty.closeConfig()">Cancelar</button>
                <button class="btn btn-primary" onclick="Loyalty.saveConfig()">
                  <span class="material-symbols-outlined">save</span> Salvar
                </button>
              </div>
            </div>
          </div>
        </div>`;

        // Guardar dados para filtro
        Loyalty._data = { enriched, config, closeTo };
    },

    // === CARTÃO DE CARIMBOS VISUAL ===
    _renderCard(c, i, config) {
        const stamps = [];
        const total = config.threshold;
        const filled = c.currentCycle;
        const isComplete = c.visits > 0 && c.visits % total === 0;

        for (let s = 0; s < total; s++) {
            if (isComplete || s < filled) {
                // Carimbo preenchido
                stamps.push(`<div class="stamp stamp-filled" title="Visita ${s + 1}">
                    <span class="material-symbols-outlined" style="font-size:16px;color:#fff">check</span>
                </div>`);
            } else if (s === filled) {
                // Próximo carimbo (atual)
                stamps.push(`<div class="stamp stamp-next" title="Próximo carimbo">
                    <span style="font-size:12px;color:var(--gold)">★</span>
                </div>`);
            } else {
                // Carimbo vazio
                stamps.push(`<div class="stamp stamp-empty" title="Carimbo ${s + 1}">
                    <span style="font-size:10px;color:rgba(255,255,255,0.15)">${s + 1}</span>
                </div>`);
            }
        }

        // Medalhas de prêmio
        const medals = c.milestones > 0
            ? `<div style="display:flex;align-items:center;gap:4px;margin-top:6px">
                ${Array.from({length: Math.min(c.milestones, 5)}, () => '🏅').join('')}
                ${c.milestones > 5 ? `<span style="font-size:0.72rem;color:var(--gold)">+${c.milestones - 5}</span>` : ''}
                <span style="font-size:0.72rem;color:var(--text-muted);margin-left:4px">${c.milestones} prêmio${c.milestones > 1 ? 's' : ''} resgatado${c.milestones > 1 ? 's' : ''}</span>
              </div>`
            : '';

        const posStyle = i < 3 ? `top-${i + 1}` : '';

        return `
        <div class="loyalty-rank-row loyalty-card-row" data-name="${(c.name||'').toLowerCase()}" data-visits="${c.visits}" data-next="${c.nextIn}" data-milestone="${c.visits > 0 && c.visits % config.threshold === 0 ? '1' : '0'}" data-close="${c.nextIn <= Math.ceil(config.threshold * 0.3) && c.nextIn > 0 ? '1' : '0'}">
          <div class="loyalty-rank-pos ${posStyle}">${i + 1}</div>
          <div class="loyalty-avatar">${c.name.charAt(0)}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <span style="font-weight:600;font-size:0.9rem">${c.name}</span>
              <span style="font-size:0.78rem;color:var(--text-muted)">${c.visits} visita${c.visits > 1 ? 's' : ''}</span>
            </div>

            <!-- Cartão de carimbos -->
            <div class="stamp-card">
              <div class="stamp-card-header">
                <span style="font-size:0.7rem;font-weight:600;color:var(--gold)">CARTÃO DE FIDELIDADE</span>
                <span style="font-size:0.68rem;color:var(--text-muted)">${isComplete ? '🎉 COMPLETO!' : `${filled}/${total}`}</span>
              </div>
              <div class="stamp-grid">
                ${stamps.join('')}
              </div>
              ${isComplete
                ? `<div style="text-align:center;padding:4px 0;font-size:0.75rem;color:var(--gold);font-weight:700;animation:pulse 2s infinite">🎁 Prêmio: ${config.reward}</div>`
                : `<div style="text-align:center;padding:2px 0;font-size:0.7rem;color:var(--text-muted)">Falta${c.nextIn > 1 ? 'm' : ''} ${c.nextIn} para o prêmio</div>`
              }
            </div>
            ${medals}
          </div>
        </div>`;
    },

    // === FILTRO E BUSCA ===
    _filter() {
        const search = (document.getElementById('loyalty-search')?.value || '').toLowerCase();
        const filter = document.getElementById('loyalty-filter')?.value || 'all';
        const rows = document.querySelectorAll('.loyalty-card-row');
        rows.forEach(row => {
            const name = row.dataset.name || '';
            const visits = parseInt(row.dataset.visits) || 0;
            const isMilestone = row.dataset.milestone === '1';
            const isClose = row.dataset.close === '1';

            let show = true;
            if (search && !name.includes(search)) show = false;
            if (filter === 'milestone' && !isMilestone) show = false;
            if (filter === 'close' && !isClose) show = false;
            if (filter === 'active' && visits === 0) show = false;

            row.style.display = show ? '' : 'none';
        });
    },

    // === DATA ===
    _data: null,

    openConfig() {
        document.getElementById('loyalty-modal')?.classList.remove('hidden');
    },

    closeConfig(event) {
        if (event && event.target !== document.getElementById('loyalty-modal')) return;
        document.getElementById('loyalty-modal')?.classList.add('hidden');
    },

    async saveConfig() {
        const threshold = parseInt(document.getElementById('loyalty-threshold').value) || 10;
        const reward    = document.getElementById('loyalty-reward').value.trim();
        if (!reward) { App.showToast('Informe a recompensa.', 'error'); return; }
        await Store.saveLoyaltyConfig({ threshold, reward });
        document.getElementById('loyalty-modal')?.classList.add('hidden');
        App.showToast('Programa de fidelidade configurado! ✅', 'success');
        App.currentPage = null;
        await App.navigate('loyalty');
    }
};
