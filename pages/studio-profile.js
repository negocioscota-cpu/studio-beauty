// === PERFIL DO STUDIO + MEU PLANO ===
const StudioProfile = {
    async render(container) {
        const uid = firebase.auth().currentUser?.uid;
        let comp = {};
        if (uid) {
            try {
                const doc = await db.collection('studios').doc(uid).get();
                comp = doc.exists ? (doc.data() || {}) : {};
            } catch(e) { console.warn('StudioProfile load error:', e); }
        }

        container.innerHTML = `
        <div class="settings-page">

          <!-- ===== PERFIL DO STUDIO ===== -->
          <div class="settings-section-card">
            <div class="settings-section-header">
              <span class="material-symbols-outlined">store</span>
              <div>
                <h3 class="settings-section-title">Perfil do Studio</h3>
                <p class="settings-section-sub">Informações exibidas para suas clientes</p>
              </div>
            </div>
            <div class="settings-section-body">
              <div class="settings-logo-area">
                <div class="settings-logo-preview" id="logo-preview">
                  ${comp.logoUrl ? `<img src="${comp.logoUrl}" alt="Logo" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : `<span class="material-symbols-outlined" style="font-size:2.5rem;color:var(--primary-light)">photo_camera</span>`}
                </div>
                <div>
                  <label class="btn btn-ghost btn-sm" style="cursor:pointer">
                    <span class="material-symbols-outlined">upload</span> Alterar Foto
                    <input type="file" accept="image/*" style="display:none" onchange="StudioProfile.handleLogoUpload(event)">
                  </label>
                  <p style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">JPG ou PNG · Máx. 2MB</p>
                </div>
              </div>
              <div class="form-grid" style="margin-top:20px">
                <div class="form-group form-group-full">
                  <label class="form-label">Nome do Studio *</label>
                  <input class="form-control" id="s-name" required value="${comp.studioName || comp.companyName || ''}" placeholder="Ex: Studio Lash & Brow da Ana">
                </div>
                <div class="form-group">
                  <label class="form-label">Telefone / WhatsApp</label>
                  <input class="form-control" id="s-phone" value="${comp.ownerPhone || ''}" placeholder="(00) 00000-0000">
                </div>
                <div class="form-group">
                  <label class="form-label">E-mail de Contato</label>
                  <input class="form-control" type="email" id="s-email" value="${comp.ownerEmail || ''}" placeholder="studio@email.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Cidade</label>
                  <input class="form-control" id="s-city" value="${comp.city || ''}" placeholder="São Paulo">
                </div>
                <div class="form-group">
                  <label class="form-label">Estado</label>
                  <input class="form-control" id="s-state" value="${comp.state || ''}" placeholder="SP" maxlength="2">
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">Endereço Completo</label>
                  <input class="form-control" id="s-address" value="${comp.address || ''}" placeholder="Rua, número, bairro">
                </div>
                <div class="form-group">
                  <label class="form-label">Chave PIX (Bolsa Studio Beauty)</label>
                  <input class="form-control" id="s-pix" value="${comp.pixKey || ''}" placeholder="CPF, CNPJ, e-mail ou telefone">
                </div>
              </div>
              <div class="settings-action-bar">
                <button class="btn btn-primary" onclick="StudioProfile.saveProfile()">
                  <span class="material-symbols-outlined">save</span> Salvar Perfil
                </button>
              </div>
            </div>
          </div>

          <!-- ===== MEU PLANO ===== -->
          <div class="settings-section-card">
            <div class="settings-section-header">
              <span class="material-symbols-outlined">workspace_premium</span>
              <div>
                <h3 class="settings-section-title">Meu Plano</h3>
                <p class="settings-section-sub">Gerencie sua assinatura Studio Beauty</p>
              </div>
            </div>
            <div class="settings-section-body">
              <div class="settings-plan-badge">
                <span class="material-symbols-outlined">diamond</span>
                ${comp.plan === 'free' ? '⏳ Período de Trial (14 dias)' : (comp.plan?.toUpperCase() || 'Trial')}
              </div>
              <p style="color:var(--text-secondary);margin:12px 0;font-size:0.88rem">
                Faça upgrade para continuar usando todos os recursos após o trial.
              </p>
              <div class="settings-plan-grid">
                <div class="settings-plan-card">
                  <div class="settings-plan-name">Solo</div>
                  <div class="settings-plan-price">R$ 69,00<small>/mês</small></div>
                  <div class="settings-plan-desc">Profissional Autônoma</div>
                  <ul class="settings-plan-features">
                    <li>✓ Agenda ilimitada</li>
                    <li>✓ Clientes ilimitadas</li>
                    <li>✓ Bolsa da Beleza 💰</li>
                    <li>✓ Controle de estoque 📦</li>
                    <li>✓ Financeiro básico</li>
                  </ul>
                  <a href="https://wa.me/5511999999999?text=Quero+assinar+o+plano+Solo+Studio+Beauty" target="_blank" class="btn btn-ghost btn-sm" style="width:100%;margin-top:12px">Assinar</a>
                </div>
                <div class="settings-plan-card settings-plan-featured">
                  <div class="settings-plan-badge-top">Mais Popular ✨</div>
                  <div class="settings-plan-name">Studio</div>
                  <div class="settings-plan-price">R$ 99,80<small>/mês</small></div>
                  <div class="settings-plan-desc">2–3 Profissionais</div>
                  <ul class="settings-plan-features">
                    <li>✓ Tudo do Solo</li>
                    <li>✓ Equipe até 3</li>
                    <li>✓ Bolsa Studio Beauty</li>
                    <li>✓ Programa de Indicações</li>
                  </ul>
                  <a href="https://wa.me/5511999999999?text=Quero+assinar+o+plano+Studio+Studio+Beauty" target="_blank" class="btn btn-primary btn-sm" style="width:100%;margin-top:12px">Assinar</a>
                </div>
                <div class="settings-plan-card">
                  <div class="settings-plan-name">Premium</div>
                  <div class="settings-plan-price">R$ 149,90<small>/mês</small></div>
                  <div class="settings-plan-desc">Até 10 Profissionais</div>
                  <ul class="settings-plan-features">
                    <li>✓ Tudo do Studio</li>
                    <li>✓ Relatórios avançados</li>
                    <li>✓ Suporte prioritário</li>
                  </ul>
                  <a href="https://wa.me/5511999999999?text=Quero+assinar+o+plano+Premium+Studio+Beauty" target="_blank" class="btn btn-ghost btn-sm" style="width:100%;margin-top:12px">Assinar</a>
                </div>
              </div>
            </div>
          </div>

          <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid var(--border);text-align:center">
            <p style="font-size:0.78rem;color:var(--text-muted)">
              🔒 Seus dados são privados e isolados. Somente você acessa as informações do seu estúdio.
            </p>
          </div>
        </div>`;
    },

    async handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { App.showToast('Imagem muito grande (máx. 2MB)', 'error'); return; }
        const reader = new FileReader();
        reader.onload = e => {
            const preview = document.getElementById('logo-preview');
            if (preview) preview.innerHTML = `<img src="${e.target.result}" alt="Logo" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
        };
        reader.readAsDataURL(file);
        const uid = firebase.auth().currentUser?.uid;
        if (!uid) return;
        App.showToast('Enviando foto... 📤', 'info');
        try {
            const ext = file.name.split('.').pop().toLowerCase().replace('jpeg', 'jpg');
            const storageRef = firebase.storage().ref(`studios/${uid}/logo.${ext}`);
            await storageRef.put(file, { contentType: file.type });
            const logoUrl = await storageRef.getDownloadURL();
            await db.collection('studios').doc(uid).set({ logoUrl }, { merge: true });
            App.showToast('Logo salva com sucesso! 📸', 'success');
        } catch(err) {
            console.error('Erro upload logo:', err);
            App.showToast('Erro no upload: ' + err.message, 'error');
        }
    },

    async saveProfile() {
        const uid = firebase.auth().currentUser?.uid;
        if (!uid) return;
        const emailVal = document.getElementById('s-email')?.value.trim() || '';
        const bookingSlug = emailVal.replace(/[@.]/g, '').toLowerCase() || uid.slice(0, 8);
        const data = {
            studioName:  document.getElementById('s-name')?.value.trim(),
            companyName: document.getElementById('s-name')?.value.trim(),
            ownerPhone:  document.getElementById('s-phone')?.value.trim(),
            ownerEmail:  emailVal,
            city:        document.getElementById('s-city')?.value.trim(),
            state:       document.getElementById('s-state')?.value.trim().toUpperCase(),
            address:     document.getElementById('s-address')?.value.trim(),
            pixKey:      document.getElementById('s-pix')?.value.trim(),
            bookingSlug
        };
        try {
            await db.collection('studios').doc(uid).set(data, { merge: true });
            App.showToast('Perfil salvo com sucesso! ✅', 'success');
        } catch(err) { App.showToast('Erro: ' + err.message, 'error'); }
    }
};
