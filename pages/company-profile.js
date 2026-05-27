// === Página: Perfil da Empresa ===
const CompanyProfilePage = {
    render() {
        return `
        <div class="max-w-3xl mx-auto space-y-8">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight">Perfil da Empresa</h2>
                    <p class="text-on-surface-variant mt-1">Informações da sua empresa exibidas para clientes.</p>
                </div>
            </div>

            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">account_circle</span> Identidade Visual
                </h3>
                <div class="space-y-6">
                    <div class="flex items-center gap-6 mb-6">
                        <div id="logo-upload-area" class="relative w-24 h-24 rounded-2xl vitality-gradient flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20 cursor-pointer overflow-hidden group hover:scale-105 transition-transform" title="Clique para trocar o logo">
                            <img id="logo-preview" src="" class="hidden absolute inset-0 w-full h-full object-cover" alt="Logo"/>
                            <span id="logo-text" class="z-10">SB</span>
                            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <span class="material-symbols-outlined text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity">photo_camera</span>
                            </div>
                            <input type="file" id="logo-file-input" accept="image/*" class="hidden"/>
                        </div>
                        <div class="flex-1">
                            <h4 id="company-display-name" class="font-bold text-lg">Sua Empresa</h4>
                            <p class="text-sm text-on-surface-variant mb-2">Clique no ícone para carregar seu logo</p>
                            <div class="flex gap-2">
                                <button onclick="document.getElementById('logo-file-input').click()" class="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                                    <span class="material-symbols-outlined text-xs">upload</span> Trocar Logo
                                </button>
                                <button id="btn-remove-logo" onclick="CompanyProfilePage.removeLogo()" class="hidden px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1">
                                    <span class="material-symbols-outlined text-xs">delete</span> Remover
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Nome da Empresa</label>
                            <input type="text" id="set-company" class="settings-input w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="Nome da empresa"/></div>
                        <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Telefone</label>
                            <input type="tel" id="set-phone" class="settings-input w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="(00) 00000-0000" maxlength="15"/></div>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Endereço</label>
                        <div class="relative">
                            <input type="text" id="set-address" class="settings-input w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface pr-10" placeholder="Comece a digitar o endereço..." autocomplete="off"/>
                            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">location_on</span>
                            <div id="address-suggestions" class="hidden absolute z-50 left-0 right-0 top-full mt-1 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/20 max-h-48 overflow-y-auto"></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">CEP</label>
                            <input type="text" id="set-cep" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl" placeholder="00000-000" maxlength="9"/></div>
                        <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Cidade</label>
                            <input type="text" id="set-city" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl" placeholder="Cidade"/></div>
                        <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Estado</label>
                            <input type="text" id="set-state" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl" placeholder="UF" maxlength="2"/></div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button onclick="CompanyProfilePage.save()" class="px-8 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2">
                    <span class="material-symbols-outlined">save</span> Salvar Perfil
                </button>
            </div>
        </div>`;
    },

    async init() {
        // Logo upload
        const area = document.getElementById('logo-upload-area'), input = document.getElementById('logo-file-input');
        if (area && input) {
            area.addEventListener('click', (e) => { if (e.target !== input) input.click(); });
            input.addEventListener('change', (e) => { if (e.target.files[0]) this.processLogo(e.target.files[0]); });
        }
        // Phone mask
        document.getElementById('set-phone')?.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 11) v = v.slice(0, 11);
            if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
            else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
            else if (v.length > 0) v = `(${v}`;
            e.target.value = v;
        });
        // CEP
        document.getElementById('set-cep')?.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 8) v = v.slice(0, 8);
            if (v.length > 5) v = `${v.slice(0,5)}-${v.slice(5)}`;
            e.target.value = v;
            if (v.replace('-','').length === 8) this.lookupCEP(v.replace('-',''));
        });
        // Name update live
        document.getElementById('set-company')?.addEventListener('input', (e) => {
            const dn = document.getElementById('company-display-name');
            if (dn) dn.textContent = e.target.value || 'Sua Empresa';
        });
        this.loadSaved();
    },

    processLogo(file) {
        if (!file.type.startsWith('image/')) { App.showToast('Selecione uma imagem.', 'error'); return; }
        if (file.size > 2 * 1024 * 1024) { App.showToast('Máx 2MB.', 'error'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('logo-preview').src = e.target.result;
            document.getElementById('logo-preview').classList.remove('hidden');
            document.getElementById('logo-text').classList.add('hidden');
            document.getElementById('btn-remove-logo')?.classList.remove('hidden');
            document.getElementById('btn-remove-logo')?.classList.add('flex');
            localStorage.setItem('ch_logo', e.target.result);
            App.showToast('Logo atualizado!', 'success');
        };
        reader.readAsDataURL(file);
    },
    removeLogo() {
        document.getElementById('logo-preview').classList.add('hidden');
        document.getElementById('logo-text').classList.remove('hidden');
        document.getElementById('btn-remove-logo')?.classList.add('hidden');
        localStorage.removeItem('ch_logo');
        App.showToast('Logo removido.', 'success');
    },

    async lookupCEP(cep) {
        try {
            const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const d = await r.json();
            if (!d.erro) {
                document.getElementById('set-address').value = d.logradouro || '';
                document.getElementById('set-city').value = d.localidade || '';
                document.getElementById('set-state').value = d.uf || '';
                App.showToast('Endereço preenchido!', 'success');
            }
        } catch(e) {}
    },

    loadSaved() {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        if (s.company) { document.getElementById('set-company').value = s.company; document.getElementById('company-display-name').textContent = s.company; }
        if (s.phone) document.getElementById('set-phone').value = s.phone;
        if (s.address) document.getElementById('set-address').value = s.address;
        if (s.cep) document.getElementById('set-cep').value = s.cep;
        if (s.city) document.getElementById('set-city').value = s.city;
        if (s.state) document.getElementById('set-state').value = s.state;
        const logo = localStorage.getItem('ch_logo');
        if (logo) {
            document.getElementById('logo-preview').src = logo;
            document.getElementById('logo-preview').classList.remove('hidden');
            document.getElementById('logo-text').classList.add('hidden');
            document.getElementById('btn-remove-logo')?.classList.remove('hidden');
            document.getElementById('btn-remove-logo')?.classList.add('flex');
        }
    },

    save() {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        s.company = document.getElementById('set-company')?.value || s.company;
        s.phone = document.getElementById('set-phone')?.value || s.phone;
        s.address = document.getElementById('set-address')?.value || s.address;
        s.cep = document.getElementById('set-cep')?.value || s.cep;
        s.city = document.getElementById('set-city')?.value || s.city;
        s.state = document.getElementById('set-state')?.value || s.state;
        localStorage.setItem('ch_settings', JSON.stringify(s));
        App.showToast('Perfil salvo com sucesso! ✅', 'success');
    }
};
