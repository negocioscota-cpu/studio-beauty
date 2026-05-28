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
            progress: Math.min(100, Math.round(((visitMap[c.id] || 0) % config.threshold) / config.threshold * 100)),
            milestones: Math.floor((visitMap[c.id] || 0) / config.threshold),
            nextIn: config.threshold - ((visitMap[c.id] || 0) % config.threshold)
        })).sort((a, b) => b.visits - a.visits);

        const reachedMilestone = enriched.filter(c => c.visits > 0 && c.visits % config.threshold === 0);

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">

          <!-- Hero -->
          <div class="loyalty-hero">
            <div class="loyalty-hero-icon">🎁</div>
            <div>
              <h2 class="loyalty-hero-title">Programa de Fidelidade</h2>
              <p class="loyalty-hero-sub">Recompense suas clientes mais fiéis automaticamente.</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="Loyalty.openConfig()">
              <span class="material-symbols-outlined">settings</span> Configurar
            </button>
          </div>

          <!-- Config atual -->
          <div class="loyalty-config-banner">
            <span class="material-symbols-outlined" style="color:var(--gold);font-size:20px">stars</span>
            <span>A cada <strong>${config.threshold} atendimentos</strong>, a cliente ganha: <strong>${config.reward || 'Brinde não configurado'}</strong></span>
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
                ${c.phone ? `<button class="btn btn-wa btn-sm" onclick="WA.loyaltyReward('${c.name}','${c.phone}','${config.reward}','${c.visits}')">
                  📲 Avisar
                </button>` : '<span class="badge badge-brown" style="font-size:0.7rem">Sem tel.</span>'}
              </div>`).join('')}
            </div>
          </div>` : ''}

          <!-- Ranking de clientes -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">🏆 Ranking de Fidelidade</span>
              <span style="font-size:0.8rem;color:var(--text-muted)">${enriched.filter(c => c.visits > 0).length} clientes ativas</span>
            </div>
            <div class="card-body" style="padding:0">
              ${enriched.filter(c => c.visits > 0).length === 0
                ? `<div class="empty-state" style="padding:40px">
                    <span class="material-symbols-outlined empty-state-icon">loyalty</span>
                    <p class="empty-state-title">Nenhum atendimento registrado ainda</p>
                    <p class="empty-state-desc">Conclua agendamentos para começar o ranking.</p>
                  </div>`
                : enriched.filter(c => c.visits > 0).map((c, i) => `
                <div class="loyalty-rank-row">
                  <div class="loyalty-rank-pos ${i < 3 ? 'top-' + (i+1) : ''}">${i + 1}</div>
                  <div class="loyalty-avatar">${c.name.charAt(0)}</div>
                  <div style="flex:1;min-width:0">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                      <span style="font-weight:600;font-size:0.9rem">${c.name}</span>
                      <span style="font-size:0.78rem;color:var(--text-muted)">${c.visits} visit${c.visits > 1 ? 'as' : 'a'}</span>
                    </div>
                    <!-- Barra de progresso -->
                    <div class="loyalty-progress-bar-bg">
                      <div class="loyalty-progress-bar-fill" style="width:${c.progress}%"></div>
                    </div>
                    <div style="font-size:0.7rem;color:var(--text-muted);margin-top:3px">
                      ${c.visits % config.threshold === 0
                        ? `🎉 Marco atingido! (${c.milestones}× premiada)`
                        : `Faltam ${c.nextIn} para o próximo prêmio`}
                    </div>
                  </div>
                  ${c.milestones > 0 ? `<div class="loyalty-medal" title="${c.milestones} prêmio(s)">🏅 ×${c.milestones}</div>` : ''}
                </div>`).join('')
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
    },

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
