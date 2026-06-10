// === AGENDA ONLINE (Link de Agendamento + Guias de Integração) ===
const BookingOnline = {
    async render(container) {
        const uid = firebase.auth().currentUser?.uid;
        let comp = {};
        if (uid) {
            try {
                const doc = await db.collection('studios').doc(uid).get();
                comp = doc.exists ? (doc.data() || {}) : {};
            } catch(e) {}
        }
        const bookingSlug = (comp.ownerEmail || '').replace(/[@.]/g, '').toLowerCase() || uid?.slice(0,8);
        const bookingUrl  = `https://lashbrow.clientehub.app.br/booking/${bookingSlug}`;
        const bookingIG   = `${bookingUrl}?utm_source=instagram`;
        const bookingFB   = `${bookingUrl}?utm_source=facebook`;
        const bookingGMB  = `${bookingUrl}?utm_source=google`;

        container.innerHTML = `
        <div class="settings-page">

          <!-- ═══ CARD 1: LINK PRINCIPAL ═══ -->
          <div class="settings-section-card">
            <div class="settings-section-header">
              <span class="material-symbols-outlined">link</span>
              <div>
                <h3 class="settings-section-title">Link de Agendamento Online</h3>
                <p class="settings-section-sub">Compartilhe na bio do Instagram, WhatsApp ou site</p>
              </div>
            </div>
            <div class="settings-section-body">
              <div class="settings-booking-link-row">
                <div class="settings-booking-link-display">
                  <span style="color:var(--text-muted);font-size:0.82rem">lashbrow.clientehub.app.br/booking/</span>
                  <span style="font-weight:700">${bookingSlug}</span>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="BookingOnline.copyLink('${bookingUrl}')" title="Copiar">
                  <span class="material-symbols-outlined">content_copy</span>
                </button>
                <button class="btn btn-ghost btn-sm" onclick="window.open('${bookingUrl}','_blank')" title="Abrir">
                  <span class="material-symbols-outlined">share</span>
                </button>
              </div>
              <a href="${bookingUrl}" target="_blank" style="font-size:0.82rem;color:var(--primary);display:inline-flex;align-items:center;gap:4px;margin-top:8px">
                <span class="material-symbols-outlined" style="font-size:0.9rem">verified</span>
                ${bookingUrl}
              </a>
              <div class="settings-qrcode-box">
                <div id="qrcode-container" style="display:flex;align-items:center;justify-content:center;width:140px;height:140px;background:var(--surface-2);border-radius:var(--radius-sm);overflow:hidden">
                  <span class="material-symbols-outlined" style="font-size:3rem;color:var(--text-muted)">qr_code_2</span>
                </div>
                <div>
                  <div style="font-weight:600;font-size:0.88rem">QR Code de Agendamento</div>
                  <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">Suas clientes podem escanear para acessar sua agenda</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══ CARD 2: INTEGRAÇÃO INSTAGRAM ═══ -->
          <div class="settings-section-card">
            <div class="settings-section-header">
              <span class="material-symbols-outlined" style="color:#E1306C">photo_camera</span>
              <div>
                <h3 class="settings-section-title">Botão "Reservar" no Instagram</h3>
                <p class="settings-section-sub">Clientes agendam direto do seu perfil no Instagram</p>
              </div>
            </div>
            <div class="settings-section-body">

              <div class="booking-integration-link-box">
                <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:6px">Link para o Instagram (com rastreamento):</div>
                <div class="settings-booking-link-row">
                  <div class="settings-booking-link-display" style="font-size:0.78rem;word-break:break-all">${bookingIG}</div>
                  <button class="btn btn-ghost btn-sm" onclick="BookingOnline.copyLink('${bookingIG}')" title="Copiar">
                    <span class="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
              </div>

              <div class="booking-guide-steps">
                <div class="booking-guide-title">
                  <span class="material-symbols-outlined" style="font-size:1rem">menu_book</span>
                  Como configurar em 4 passos:
                </div>

                <div class="booking-step">
                  <div class="booking-step-number">1</div>
                  <div class="booking-step-content">
                    <div class="booking-step-title">Mude para conta Profissional</div>
                    <div class="booking-step-desc">Abra o Instagram → <strong>Configurações</strong> → <strong>Conta</strong> → <strong>Mudar para conta profissional</strong> (se ainda não for).</div>
                  </div>
                </div>

                <div class="booking-step">
                  <div class="booking-step-number">2</div>
                  <div class="booking-step-content">
                    <div class="booking-step-title">Acesse os Botões de Ação</div>
                    <div class="booking-step-desc">Vá em <strong>Editar perfil</strong> → role até <strong>Botões de ação</strong> → toque em <strong>"Reservar"</strong> ou <strong>"Agendar"</strong>.</div>
                  </div>
                </div>

                <div class="booking-step">
                  <div class="booking-step-number">3</div>
                  <div class="booking-step-content">
                    <div class="booking-step-title">Cole o link</div>
                    <div class="booking-step-desc">Selecione <strong>"Adicionar link"</strong> e cole o link acima (toque no botão copiar ☝️). Salve.</div>
                  </div>
                </div>

                <div class="booking-step">
                  <div class="booking-step-number">4</div>
                  <div class="booking-step-content">
                    <div class="booking-step-title">Pronto! ✨</div>
                    <div class="booking-step-desc">O botão <strong>"Reservar"</strong> aparecerá no seu perfil. Clientes tocam e vão direto para sua agenda!</div>
                  </div>
                </div>
              </div>

              <div class="booking-guide-tip">
                <span class="material-symbols-outlined" style="font-size:0.9rem">lightbulb</span>
                <span>Dica: Coloque o link também na sua <strong>bio</strong> do Instagram para máxima visibilidade!</span>
              </div>
            </div>
          </div>

          <!-- ═══ CARD 3: INTEGRAÇÃO FACEBOOK ═══ -->
          <div class="settings-section-card">
            <div class="settings-section-header">
              <span class="material-symbols-outlined" style="color:#1877F2">group</span>
              <div>
                <h3 class="settings-section-title">Botão "Reservar" no Facebook</h3>
                <p class="settings-section-sub">Adicione o botão de agendamento na sua página do Facebook</p>
              </div>
            </div>
            <div class="settings-section-body">

              <div class="booking-integration-link-box">
                <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:6px">Link para o Facebook (com rastreamento):</div>
                <div class="settings-booking-link-row">
                  <div class="settings-booking-link-display" style="font-size:0.78rem;word-break:break-all">${bookingFB}</div>
                  <button class="btn btn-ghost btn-sm" onclick="BookingOnline.copyLink('${bookingFB}')" title="Copiar">
                    <span class="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
              </div>

              <div class="booking-guide-steps">
                <div class="booking-guide-title">
                  <span class="material-symbols-outlined" style="font-size:1rem">menu_book</span>
                  Como configurar em 3 passos:
                </div>

                <div class="booking-step">
                  <div class="booking-step-number">1</div>
                  <div class="booking-step-content">
                    <div class="booking-step-title">Acesse sua Página</div>
                    <div class="booking-step-desc">Abra o Facebook → vá na sua <strong>Página profissional</strong> → clique em <strong>"Adicionar botão de ação"</strong> (abaixo da foto de capa).</div>
                  </div>
                </div>

                <div class="booking-step">
                  <div class="booking-step-number">2</div>
                  <div class="booking-step-content">
                    <div class="booking-step-title">Escolha "Reservar agora"</div>
                    <div class="booking-step-desc">Selecione <strong>"Reservar agora"</strong> → escolha <strong>"Link para o site"</strong> → cole o link acima.</div>
                  </div>
                </div>

                <div class="booking-step">
                  <div class="booking-step-number">3</div>
                  <div class="booking-step-content">
                    <div class="booking-step-title">Salve e pronto! ✨</div>
                    <div class="booking-step-desc">O botão <strong>"Reservar agora"</strong> aparecerá na sua página. Clientes clicam e vão direto para sua agenda!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══ CARD 4: GOOGLE MEU NEGÓCIO ═══ -->
          <div class="settings-section-card" style="opacity:0.7">
            <div class="settings-section-header">
              <span class="material-symbols-outlined" style="color:#4285F4">location_on</span>
              <div>
                <h3 class="settings-section-title">Google Maps & Busca <span style="font-size:0.7rem;background:var(--surface-2);padding:2px 8px;border-radius:20px;margin-left:8px;color:var(--text-muted)">Em breve</span></h3>
                <p class="settings-section-sub">Botão "Agendar" no Google Maps e Busca do Google</p>
              </div>
            </div>
            <div class="settings-section-body" style="text-align:center;padding:20px">
              <div style="font-size:2rem;margin-bottom:8px">🗺️</div>
              <div style="font-size:0.88rem;color:var(--text-muted)">Em breve você poderá adicionar o link de agendamento diretamente no Google Meu Negócio, para aparecer no Google Maps e nas buscas.</div>
            </div>
          </div>

        </div>`;

        // Inject scoped styles
        if (!document.getElementById('booking-online-styles')) {
            const style = document.createElement('style');
            style.id = 'booking-online-styles';
            style.textContent = `
              .booking-integration-link-box {
                background: var(--surface-2);
                border-radius: var(--radius-sm);
                padding: 14px 16px;
                margin-bottom: 16px;
              }
              .booking-guide-steps {
                background: linear-gradient(135deg, rgba(196,117,138,0.04), rgba(201,169,110,0.04));
                border: 1px solid rgba(196,117,138,0.1);
                border-radius: var(--radius-md);
                padding: 20px;
                margin-top: 4px;
              }
              .booking-guide-title {
                display: flex;
                align-items: center;
                gap: 6px;
                font-weight: 700;
                font-size: 0.88rem;
                color: var(--primary-light);
                margin-bottom: 16px;
              }
              .booking-step {
                display: flex;
                gap: 14px;
                margin-bottom: 16px;
                align-items: flex-start;
              }
              .booking-step:last-child { margin-bottom: 0; }
              .booking-step-number {
                width: 28px;
                height: 28px;
                min-width: 28px;
                border-radius: 50%;
                background: var(--gradient-rose);
                color: #fff;
                font-weight: 800;
                font-size: 0.82rem;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 2px;
              }
              .booking-step-content { flex: 1; }
              .booking-step-title {
                font-weight: 700;
                font-size: 0.88rem;
                color: var(--text);
                margin-bottom: 3px;
              }
              .booking-step-desc {
                font-size: 0.82rem;
                color: var(--text-muted);
                line-height: 1.5;
              }
              .booking-step-desc strong {
                color: var(--primary-light);
                font-weight: 600;
              }
              .booking-guide-tip {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 14px;
                padding: 10px 14px;
                background: rgba(201,169,110,0.08);
                border-radius: var(--radius-sm);
                font-size: 0.8rem;
                color: var(--gold);
                border-left: 3px solid var(--gold);
              }
              .booking-guide-tip strong { color: var(--gold-dark); }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => BookingOnline.generateQRCode(bookingUrl), 200);
    },

    copyLink(url) {
        navigator.clipboard.writeText(url).then(() => App.showToast('Link copiado! 🔗', 'success'));
    },

    generateQRCode(url) {
        const container = document.getElementById('qrcode-container');
        if (!container || !url) return;
        container.innerHTML = '';
        if (typeof QRCode === 'undefined') { container.innerHTML = '<span style="color:#aaa;font-size:0.8rem">QR Code indisponível</span>'; return; }
        try {
            new QRCode(container, { text: url, width: 140, height: 140, colorDark: '#C4758A', colorLight: '#1e0a14', correctLevel: QRCode.CorrectLevel.M });
        } catch(e) { console.warn('QR Code error:', e); }
    }
};
