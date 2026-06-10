// === LINK DA BIO (Linktree) ===
const BioLink = {
    async render(container) {
        const uid = firebase.auth().currentUser?.uid;
        let comp = {};
        let studioConfig = {};
        if (uid) {
            try {
                const [studioDoc, configDoc] = await Promise.all([
                    db.collection('studios').doc(uid).get(),
                    db.collection('studioConfig').doc(uid).get().catch(() => null)
                ]);
                comp = studioDoc.exists ? (studioDoc.data() || {}) : {};
                studioConfig = configDoc?.exists ? (configDoc.data() || {}) : {};
            } catch(e) {}
        }

        const bookingSlug = comp.bookingSlug || (comp.ownerEmail || '').replace(/[@.]/g, '').toLowerCase() || uid?.slice(0,8);
        const bioUrl = `${window.location.origin}/bio/${bookingSlug}`;
        const bookingUrl = `${window.location.origin}/booking/${bookingSlug}`;
        const portfolioUrl = `${window.location.origin}/portfolio/${bookingSlug}`;
        const reviewUrl = `${window.location.origin}/avaliacao.html?studio=${uid}`;
        const studioName = studioConfig.studioName || comp.studioName || comp.companyName || 'Seu Studio';
        const wa = (comp.whatsapp || studioConfig.studioPhone || '').replace(/\D/g, '');

        container.innerHTML = `
        <div style="max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:20px">

          <!-- Hero -->
          <div class="card" style="background:linear-gradient(135deg,#1a0a1e 0%,#2d1040 50%,#1a0a1e 100%);overflow:hidden;position:relative">
            <div style="position:absolute;top:-40px;right:-40px;font-size:140px;opacity:0.06;transform:rotate(-15deg)">🔗</div>
            <div class="card-body" style="padding:28px;position:relative;z-index:1">
              <div style="display:flex;align-items:center;gap:16px">
                <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,var(--primary),var(--gold));display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">🔗</div>
                <div>
                  <h2 style="font-size:1.3rem;font-weight:800;color:white">Link da Bio</h2>
                  <p style="font-size:0.85rem;color:var(--text-muted);margin-top:2px">Sua página tipo Linktree para colar na bio do Instagram</p>
                </div>
              </div>
            </div>
          </div>

          <!-- URL Principal -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">🌐 Sua URL Pública</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:14px">
              <div style="display:flex;align-items:center;gap:10px;background:var(--bg);padding:14px 16px;border-radius:12px;border:1px solid var(--border)">
                <div style="flex:1;min-width:0">
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px">Link da Bio</div>
                  <div style="font-size:0.92rem;font-weight:700;color:var(--primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${bioUrl}</div>
                </div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-primary" onclick="BioLink.copyLink('${bioUrl}')" style="flex:1;min-width:120px">
                  <span class="material-symbols-outlined">content_copy</span> Copiar Link
                </button>
                <button class="btn btn-outline" onclick="window.open('${bioUrl}','_blank')" style="flex:1;min-width:120px">
                  <span class="material-symbols-outlined">open_in_new</span> Visualizar
                </button>
                <button class="btn btn-outline" onclick="BioLink.shareWhatsApp('${bioUrl}','${studioName}')" style="flex:1;min-width:120px">
                  <span style="font-size:1rem">📲</span> WhatsApp
                </button>
              </div>
              <div style="background:rgba(201,169,110,0.08);border:1px solid rgba(201,169,110,0.2);border-radius:10px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px">
                <span style="font-size:1.1rem;margin-top:1px">💡</span>
                <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5">
                  Cole este link na <strong>bio do Instagram</strong>, no <strong>TikTok</strong>, no <strong>status do WhatsApp</strong> ou em qualquer lugar! Seus clientes acessam tudo em um único link.
                </div>
              </div>
            </div>
          </div>

          <!-- Preview dos Links -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">📱 O que aparece na sua página</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:12px">

              <!-- Preview simulado -->
              <div style="background:linear-gradient(135deg,#0a060d,#16101a);border-radius:16px;padding:24px 20px;border:1px solid var(--border);display:flex;flex-direction:column;align-items:center;gap:12px">
                <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--gold));display:flex;align-items:center;justify-content:center;font-size:1.5rem;box-shadow:0 0 0 3px rgba(196,117,138,.15)">
                  ${comp.logoUrl ? `<img src="${comp.logoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : '✨'}
                </div>
                <div style="font-weight:800;font-size:1rem;color:white;text-align:center">${studioName}</div>
                <div style="font-size:0.75rem;color:rgba(255,255,255,.5);text-align:center">${comp.bio || comp.tagline || 'Especialista em cílios e sobrancelhas'}</div>

                <!-- Mini links preview -->
                <div style="width:100%;display:flex;flex-direction:column;gap:8px;margin-top:4px">
                  <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:linear-gradient(135deg,var(--primary),#a85570);font-size:0.8rem;color:white;font-weight:600">
                    <span>📅</span> Agendar agora
                    <span class="material-symbols-outlined" style="margin-left:auto;font-size:14px;opacity:.7">chevron_right</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:rgba(201,169,110,.1);border:1px solid rgba(201,169,110,.2);font-size:0.8rem;font-weight:600">
                    <span>📸</span> Veja meu portfólio
                    <span class="material-symbols-outlined" style="margin-left:auto;font-size:14px;opacity:.4">chevron_right</span>
                  </div>
                  ${wa ? `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:rgba(37,211,102,.08);border:1px solid rgba(37,211,102,.15);font-size:0.8rem;font-weight:600">
                    <span>💬</span> Falar no WhatsApp
                    <span class="material-symbols-outlined" style="margin-left:auto;font-size:14px;opacity:.4">chevron_right</span>
                  </div>` : ''}
                  <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:rgba(250,204,21,.06);border:1px solid rgba(250,204,21,.15);font-size:0.8rem;font-weight:600">
                    <span>⭐</span> Deixar avaliação
                    <span class="material-symbols-outlined" style="margin-left:auto;font-size:14px;opacity:.4">chevron_right</span>
                  </div>
                </div>

                <div style="font-size:0.65rem;color:rgba(255,255,255,.3);margin-top:4px">Powered by Studio Beauty ✨</div>
              </div>
            </div>
          </div>

          <!-- Links individuais -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">🔗 Links Individuais</span>
              <span style="font-size:0.78rem;color:var(--text-muted)">Copie cada um separadamente</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:10px">
              ${[
                { icon: '📅', label: 'Agendamento Online', url: bookingUrl, color: 'var(--primary)' },
                { icon: '📸', label: 'Portfólio Público', url: portfolioUrl, color: 'var(--gold)' },
                { icon: '⭐', label: 'Avaliação NPS', url: reviewUrl, color: '#facc15' },
                { icon: '🔗', label: 'Link da Bio Completo', url: bioUrl, color: '#3b82f6' },
              ].map(l => `
              <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid var(--border)">
                <span style="font-size:1.2rem">${l.icon}</span>
                <div style="flex:1;min-width:0">
                  <div style="font-size:0.82rem;font-weight:600">${l.label}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.url}</div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="BioLink.copyLink('${l.url}')" title="Copiar" style="padding:4px 8px">
                  <span class="material-symbols-outlined" style="font-size:18px">content_copy</span>
                </button>
              </div>`).join('')}
            </div>
          </div>

          <!-- Dica de uso -->
          <div style="padding:14px;background:rgba(255,255,255,.03);border-radius:12px;border:1px solid var(--border);text-align:center">
            <p style="font-size:0.78rem;color:var(--text-muted);line-height:1.5">
              🎯 <strong>Dica:</strong> Personalize as informações que aparecem na Bio em <strong>Perfil do Studio</strong> e <strong>Configurações</strong>.
            </p>
          </div>

        </div>`;
    },

    copyLink(url) {
        navigator.clipboard.writeText(url).then(() => App.showToast('Link copiado! 🔗', 'success'));
    },

    shareWhatsApp(url, name) {
        const msg = encodeURIComponent(`✨ Confira os serviços do ${name}! Agende online, veja o portfólio e muito mais:\n\n${url}`);
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    }
};
