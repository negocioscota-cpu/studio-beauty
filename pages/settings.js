// === CONFIGURAÇÕES DO ESTÚDIO ===
const Settings = {
    _saving: false,

    async render(container) {
        container.innerHTML = `<div style="display:flex;justify-content:center;padding:48px"><div class="spinner"></div></div>`;

        // Carregar dados em paralelo
        let loyaltyConfig = { threshold: 10, reward: 'Manutenção grátis' };
        let studioData = {};
        try {
            const [lc, sd] = await Promise.all([
                Store.getLoyaltyConfig().catch(() => loyaltyConfig),
                firebase.firestore().collection('studioConfig').doc(Store._uid()).get().catch(() => null)
            ]);
            if (lc) loyaltyConfig = lc;
            if (sd && sd.exists) studioData = sd.data();
        } catch(e) {}

        container.innerHTML = Settings._buildHTML(loyaltyConfig, studioData);
        Settings._bindEvents();
    },

    _buildHTML(lc, sd) {
        return `
        <div style="max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:20px">

          <!-- Header -->
          <div class="card" style="background:linear-gradient(135deg,#1a0a1e 0%,#2d1040 50%,#1a0a1e 100%)">
            <div class="card-body" style="padding:28px;display:flex;align-items:center;gap:16px">
              <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">⚙️</div>
              <div>
                <h2 style="font-size:1.3rem;font-weight:700;color:white">Configurações do Estúdio</h2>
                <p style="font-size:0.85rem;color:var(--text-muted);margin-top:2px">Personalize o sistema para o seu negócio</p>
              </div>
            </div>
          </div>

          <!-- Dados do Estúdio -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">🏪 Dados do Estúdio</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
              <div class="form-group">
                <label class="form-label">Nome do Estúdio</label>
                <input type="text" class="form-input" id="cfg-studio-name"
                  value="${sd.studioName || ''}" placeholder="Ex: Studio LashBrow by Ana">
              </div>
              <div class="form-group">
                <label class="form-label">Telefone / WhatsApp do Estúdio</label>
                <input type="tel" class="form-input" id="cfg-studio-phone"
                  value="${sd.studioPhone || ''}" placeholder="(11) 99999-9999">
              </div>
              <div class="form-group">
                <label class="form-label">Cidade / Estado</label>
                <input type="text" class="form-input" id="cfg-studio-city"
                  value="${sd.studioCity || ''}" placeholder="São Paulo, SP">
              </div>
              <div class="form-group">
                <label class="form-label">Instagram (sem @)</label>
                <input type="text" class="form-input" id="cfg-studio-instagram"
                  value="${sd.instagram || ''}" placeholder="seuestudio">
              </div>
              <button class="btn btn-primary" onclick="Settings.saveStudio()" id="btn-save-studio">
                <span class="material-symbols-outlined">save</span> Salvar Dados do Estúdio
              </button>
            </div>
          </div>

          <!-- Programa de Fidelidade -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">💎 Programa de Fidelidade</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
              <div style="background:rgba(201,169,110,0.08);border:1px solid rgba(201,169,110,0.2);border-radius:12px;padding:16px">
                <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5">
                  🎁 Configure quantos atendimentos a cliente precisa para ganhar uma recompensa.
                  Esse progresso aparece no perfil 360° de cada cliente.
                </p>
              </div>
              <div class="form-group">
                <label class="form-label">Atendimentos para recompensa</label>
                <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
                  <input type="number" class="form-input" id="cfg-loyalty-threshold"
                    value="${lc.threshold || 10}" min="1" max="50" style="max-width:120px">
                  <span style="color:var(--text-muted);font-size:0.85rem">atendimentos concluídos</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Recompensa (o que a cliente ganha)</label>
                <input type="text" class="form-input" id="cfg-loyalty-reward"
                  value="${lc.reward || ''}" placeholder="Ex: Manutenção grátis, Desconto 20%, Brinde surpresa">
              </div>
              <!-- Preview do card de fidelidade -->
              <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:16px;border:1px dashed rgba(255,255,255,0.1)">
                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:10px">Prévia do cartão de fidelidade:</div>
                <div style="display:flex;align-items:center;gap:12px">
                  <div style="flex:1">
                    <div style="font-size:0.8rem;color:var(--text-secondary)">Progresso da cliente</div>
                    <div style="height:8px;background:rgba(255,255,255,0.1);border-radius:99px;margin-top:6px;overflow:hidden">
                      <div id="loyalty-preview-bar" style="height:100%;width:60%;background:linear-gradient(90deg,var(--gold),#f59e0b);border-radius:99px;transition:width 0.5s"></div>
                    </div>
                    <div id="loyalty-preview-text" style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">6 de 10 atendimentos · faltam 4 para "Manutenção grátis"</div>
                  </div>
                </div>
              </div>
              <button class="btn btn-primary" onclick="Settings.saveLoyalty()" id="btn-save-loyalty">
                <span class="material-symbols-outlined">save</span> Salvar Fidelidade
              </button>
            </div>
          </div>

          <!-- Link de Avaliação Padrão -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">⭐ Link de Avaliação NPS</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
              <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5">
                Compartilhe este link com suas clientes para coletar avaliações do estúdio de forma geral.
                Para links vinculados a agendamentos (com rastreamento), use os botões na <strong>Agenda</strong>.
              </p>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <input type="text" class="form-input" id="cfg-review-link"
                  value="${location.origin}/avaliacao.html?studio=${Store._uid()}"
                  readonly style="flex:1;font-size:0.8rem;color:var(--text-muted)">
                <button class="btn btn-outline" onclick="Settings.copyReviewLink()" style="white-space:nowrap">
                  <span class="material-symbols-outlined">content_copy</span> Copiar
                </button>
                <button class="btn btn-outline" onclick="Settings.shareReviewWhatsApp()" style="white-space:nowrap">
                  <span style="font-size:1rem">📲</span> WhatsApp
                </button>
              </div>
            </div>
          </div>

          <!-- Aviso de Segurança -->
          <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid var(--border);text-align:center">
            <p style="font-size:0.78rem;color:var(--text-muted)">
              🔒 Seus dados são privados e isolados. Somente você acessa as informações do seu estúdio.
            </p>
          </div>

        </div>`;
    },

    _bindEvents() {
        // Atualiza preview do cartão de fidelidade em tempo real
        const thresholdEl = document.getElementById('cfg-loyalty-threshold');
        const rewardEl    = document.getElementById('cfg-loyalty-reward');
        const updatePreview = () => {
            const t = parseInt(thresholdEl?.value) || 10;
            const r = rewardEl?.value || 'Recompensa';
            const example = Math.min(Math.floor(t * 0.6), t - 1);
            const pct = Math.round(example / t * 100);
            const barEl  = document.getElementById('loyalty-preview-bar');
            const textEl = document.getElementById('loyalty-preview-text');
            if (barEl)  barEl.style.width = pct + '%';
            if (textEl) textEl.textContent = `${example} de ${t} atendimentos · faltam ${t - example} para "${r}"`;
        };
        thresholdEl?.addEventListener('input', updatePreview);
        rewardEl?.addEventListener('input', updatePreview);
        updatePreview();
    },

    async saveStudio() {
        if (Settings._saving) return;
        const btn = document.getElementById('btn-save-studio');
        Settings._setBtnLoading(btn, true);
        try {
            await firebase.firestore().collection('studioConfig').doc(Store._uid()).set({
                studioName:  document.getElementById('cfg-studio-name')?.value.trim() || '',
                studioPhone: document.getElementById('cfg-studio-phone')?.value.trim() || '',
                studioCity:  document.getElementById('cfg-studio-city')?.value.trim() || '',
                instagram:   document.getElementById('cfg-studio-instagram')?.value.trim() || '',
                updatedAt:   firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            App.showToast('Dados do estúdio salvos! ✅', 'success');
        } catch(e) {
            App.showToast('Erro ao salvar: ' + e.message, 'error');
        }
        Settings._setBtnLoading(btn, false);
    },

    async saveLoyalty() {
        if (Settings._saving) return;
        const btn = document.getElementById('btn-save-loyalty');
        const threshold = parseInt(document.getElementById('cfg-loyalty-threshold')?.value) || 10;
        const reward    = document.getElementById('cfg-loyalty-reward')?.value.trim() || 'Manutenção grátis';
        if (threshold < 1 || threshold > 50) {
            App.showToast('Número de atendimentos deve ser entre 1 e 50.', 'error');
            return;
        }
        Settings._setBtnLoading(btn, true);
        try {
            await Store.saveLoyaltyConfig({ threshold, reward });
            App.showToast(`Fidelidade salva! A cada ${threshold} atendimentos → "${reward}" ✅`, 'success');
        } catch(e) {
            App.showToast('Erro ao salvar: ' + e.message, 'error');
        }
        Settings._setBtnLoading(btn, false);
    },

    copyReviewLink() {
        const link = document.getElementById('cfg-review-link')?.value;
        navigator.clipboard?.writeText(link).then(() => App.showToast('Link copiado! ✅', 'success'));
    },

    shareReviewWhatsApp() {
        const link = document.getElementById('cfg-review-link')?.value;
        const msg = `⭐ *Avalie nosso atendimento!*\n\nClique no link abaixo para deixar sua avaliação:\n${link}\n\nSua opinião é muito importante para nós! 💕`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    },

    _setBtnLoading(btn, loading) {
        Settings._saving = loading;
        if (!btn) return;
        btn.disabled = loading;
        btn.innerHTML = loading
            ? '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div> Salvando...'
            : '<span class="material-symbols-outlined">save</span> Salvar';
    }
};
