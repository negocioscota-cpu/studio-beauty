// === Construtor do Link da Bio ===
const BioLinkPage = {
    BIO_BASE: window.location.origin + '/bio.html',

    _defaultConfig() {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        return {
            name:      s.company   || 'Studiobeauty',
            tagline:   'Especialistas em Sobrancelhas & Cílios ✨',
            phone:     (s.phone    || '').replace(/\D/g, ''),
            instagram: '',
            services:  ['Design de Sobrancelha', 'Extensão de Cílios', 'Laminação de Cílios', 'Volume Russo'],
            days:      [1, 2, 3, 4, 5],
            hourStart: s.lunchStart ? '08:00' : (s.flexDays?.[1]?.start || '08:00'),
            hourEnd:   s.lunchEnd   ? '18:00' : (s.flexDays?.[1]?.end   || '18:00'),
            interval:  s.appointmentDuration || 60,
            images:    [],
            logo:      localStorage.getItem('ch_logo') || '',
            initials:  (s.company || 'SB').substring(0, 2).toUpperCase()
        };
    },

    render() {
        const cfg = JSON.parse(localStorage.getItem('bio_config') || 'null') || this._defaultConfig();
        const dayLabels = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
        const dayChecks = dayLabels.map((d, i) => `
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="bio-day-cb w-4 h-4 accent-[#58323F]" value="${i}" ${cfg.days.includes(i) ? 'checked' : ''}/>
                <span class="text-sm font-bold text-on-surface">${d}</span>
            </label>`).join('');

        const imageRows = [0, 1, 2, 3].map(i => {
            const img = cfg.images[i] || {};
            return `
            <div class="grid grid-cols-2 gap-3 items-end">
                <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Foto Antes ${i+1}</label>
                    <input type="text" class="bio-img-before settings-input w-full px-3 py-2 bg-surface-container-high border-none rounded-xl text-xs" placeholder="URL da imagem..." value="${img.before || ''}" data-idx="${i}"/>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Foto Depois ${i+1}</label>
                    <input type="text" class="bio-img-after settings-input w-full px-3 py-2 bg-surface-container-high border-none rounded-xl text-xs" placeholder="URL da imagem..." value="${img.after || ''}" data-idx="${i}"/>
                </div>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Legenda</label>
                <input type="text" class="bio-img-label settings-input w-full px-3 py-2 bg-surface-container-high border-none rounded-xl text-xs" placeholder="ex: Design de Sobrancelha" value="${img.label || ''}" data-idx="${i}"/>
            </div>`;
        }).join('<div class="border-t border-outline-variant/10 my-2"></div>');

        return `
        <div class="max-w-4xl mx-auto space-y-8">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight">🔗 Link da Bio</h2>
                    <p class="text-on-surface-variant mt-1">Configure sua página pública para o Instagram e compartilhe na bio.</p>
                </div>
                <div class="flex gap-3 flex-wrap">
                    <button onclick="BioLinkPage.previewBio()" class="px-4 py-2.5 bg-surface-container-high text-on-surface text-sm font-bold rounded-xl hover:bg-surface-container transition-colors flex items-center gap-2">
                        <span class="material-symbols-outlined text-base">open_in_new</span> Prévia
                    </button>
                    <button onclick="BioLinkPage.save()" class="px-5 py-2.5 vitality-gradient text-white font-bold rounded-xl shadow-lg text-sm flex items-center gap-2">
                        <span class="material-symbols-outlined text-base">save</span> Salvar & Gerar Link
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                <!-- ===== FORMULÁRIO ===== -->
                <div class="space-y-6">

                    <!-- Identidade -->
                    <div class="bg-surface-container-lowest rounded-xl p-5 shadow-sm ghost-border">
                        <h3 class="font-headline font-bold text-base mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings:'FILL' 1">store</span>
                            Identidade do Studio
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Nome do Studio</label>
                                <input id="bio-f-name" type="text" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" value="${cfg.name}" placeholder="Studiobeauty"/>
                            </div>
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Tagline / Slogan</label>
                                <input id="bio-f-tagline" type="text" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" value="${cfg.tagline}" placeholder="Especialistas em..."/>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">WhatsApp do Studio</label>
                                    <input id="bio-f-phone" type="tel" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" value="${cfg.phone}" placeholder="11999999999" maxlength="11"/>
                                </div>
                                <div>
                                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Instagram</label>
                                    <input id="bio-f-ig" type="text" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" value="${cfg.instagram}" placeholder="@studiobeauty"/>
                                </div>
                            </div>
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Sigla (2 letras para o avatar)</label>
                                <input id="bio-f-initials" type="text" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" value="${cfg.initials}" maxlength="2" placeholder="SB"/>
                            </div>
                        </div>
                    </div>

                    <!-- Serviços -->
                    <div class="bg-surface-container-lowest rounded-xl p-5 shadow-sm ghost-border">
                        <h3 class="font-headline font-bold text-base mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings:'FILL' 1">spa</span>
                            Serviços na Bio
                        </h3>
                        <textarea id="bio-f-services" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm resize-none h-24" placeholder="Um serviço por linha...">${cfg.services.join('\n')}</textarea>
                        <p class="text-[10px] text-on-surface-variant mt-1">Um serviço por linha. Aparecem como chips e no seletor de agendamento.</p>
                    </div>

                    <!-- Horários disponíveis -->
                    <div class="bg-surface-container-lowest rounded-xl p-5 shadow-sm ghost-border">
                        <h3 class="font-headline font-bold text-base mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings:'FILL' 1">schedule</span>
                            Horários de Atendimento
                        </h3>
                        <div class="flex flex-wrap gap-4 mb-4">${dayChecks}</div>
                        <div class="grid grid-cols-3 gap-3">
                            <div>
                                <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Início</label>
                                <input id="bio-f-hstart" type="time" value="${cfg.hourStart}" class="settings-input w-full px-3 py-2.5 bg-surface-container-high border-none rounded-xl text-sm"/>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Fim</label>
                                <input id="bio-f-hend" type="time" value="${cfg.hourEnd}" class="settings-input w-full px-3 py-2.5 bg-surface-container-high border-none rounded-xl text-sm"/>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Intervalo</label>
                                <select id="bio-f-interval" class="settings-input w-full px-3 py-2.5 bg-surface-container-high border-none rounded-xl text-sm">
                                    <option value="30" ${cfg.interval==30?'selected':''}>30 min</option>
                                    <option value="45" ${cfg.interval==45?'selected':''}>45 min</option>
                                    <option value="60" ${cfg.interval==60?'selected':''}>60 min</option>
                                    <option value="90" ${cfg.interval==90?'selected':''}>90 min</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Portfólio -->
                    <div class="bg-surface-container-lowest rounded-xl p-5 shadow-sm ghost-border">
                        <h3 class="font-headline font-bold text-base mb-2 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings:'FILL' 1">photo_library</span>
                            Fotos Antes & Depois
                        </h3>
                        <p class="text-xs text-on-surface-variant mb-4">Cole URLs de imagens (hospedadas no Google Drive, Imgur, etc.). Deixe vazio para usar placeholders coloridos.</p>
                        <div class="space-y-4" id="bio-images-form">${imageRows}</div>
                    </div>
                </div>

                <!-- ===== PREVIEW + LINK ===== -->
                <div class="lg:sticky lg:top-6 space-y-5">
                    <!-- Phone mockup -->
                    <div class="bg-surface-container-lowest rounded-xl p-5 shadow-sm ghost-border text-center">
                        <h3 class="font-headline font-bold text-base mb-4">📱 Prévia da Bio</h3>
                        <div class="mx-auto" style="width:220px; height:440px; background:#1a1a2e; border-radius:32px; padding:10px; box-shadow:0 20px 60px rgba(0,0,0,0.4); border:3px solid rgba(255,255,255,0.1);">
                            <div style="width:100%;height:100%;border-radius:22px;overflow:hidden;background:#3d2029;">
                                <iframe id="bio-preview-frame" src="about:blank" style="width:100%;height:100%;border:none;pointer-events:none;transform:scale(0.55);transform-origin:top left;width:182%;height:182%;" title="Preview Bio"></iframe>
                            </div>
                        </div>
                        <button onclick="BioLinkPage.refreshPreview()" class="mt-3 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5 mx-auto">
                            <span class="material-symbols-outlined text-sm">refresh</span> Atualizar prévia
                        </button>
                    </div>

                    <!-- Link gerado -->
                    <div class="bg-surface-container-lowest rounded-xl p-5 shadow-sm ghost-border">
                        <h3 class="font-headline font-bold text-base mb-3 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary text-lg">link</span>
                            Seu Link da Bio
                        </h3>
                        <div class="flex gap-2">
                            <input id="bio-generated-link" type="text" readonly class="flex-1 px-3 py-2.5 bg-surface-container-high border-none rounded-xl text-xs text-on-surface font-mono" value="Salve para gerar o link..."/>
                            <button onclick="BioLinkPage.copyLink()" class="px-3 py-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors" title="Copiar">
                                <span class="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                        </div>
                        <button onclick="BioLinkPage.shareOnWhatsApp()" class="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white text-sm font-bold rounded-xl hover:bg-[#1ebe5d] transition-colors shadow-lg shadow-green-500/20">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Compartilhar no WhatsApp
                        </button>

                        <div class="mt-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2">
                            <span class="material-symbols-outlined text-blue-600 text-sm mt-0.5">tips_and_updates</span>
                            <p class="text-[11px] text-blue-700 leading-relaxed">Cole este link na <strong>bio do Instagram</strong> para que suas clientes possam agendar e ver seu portfólio diretamente da sua página.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    async init() {
        // Nada a inicializar assincronamente
    },

    _buildConfig() {
        const services = (document.getElementById('bio-f-services')?.value || '')
            .split('\n').map(s => s.trim()).filter(Boolean);
        const days = [...document.querySelectorAll('.bio-day-cb:checked')].map(cb => parseInt(cb.value));
        const images = [];
        for (let i = 0; i < 4; i++) {
            const before = document.querySelector(`.bio-img-before[data-idx="${i}"]`)?.value.trim() || '';
            const after  = document.querySelector(`.bio-img-after[data-idx="${i}"]`)?.value.trim() || '';
            const label  = document.querySelector(`.bio-img-label[data-idx="${i}"]`)?.value.trim() || `Procedimento ${i+1}`;
            images.push({ before, after, label });
        }
        return {
            name:      document.getElementById('bio-f-name')?.value.trim()     || 'Studiobeauty',
            tagline:   document.getElementById('bio-f-tagline')?.value.trim()  || '',
            phone:     document.getElementById('bio-f-phone')?.value.replace(/\D/g,'') || '',
            instagram: document.getElementById('bio-f-ig')?.value.trim()       || '',
            initials:  (document.getElementById('bio-f-initials')?.value.trim() || 'SB').toUpperCase(),
            services,
            days,
            hourStart: document.getElementById('bio-f-hstart')?.value || '08:00',
            hourEnd:   document.getElementById('bio-f-hend')?.value   || '18:00',
            interval:  parseInt(document.getElementById('bio-f-interval')?.value || '60'),
            images,
            logo:      localStorage.getItem('ch_logo') || ''
        };
    },

    _generateUrl(cfg) {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));
        return `${this.BIO_BASE}?c=${encoded}`;
    },

    save() {
        const cfg = this._buildConfig();
        localStorage.setItem('bio_config', JSON.stringify(cfg));
        const url = this._generateUrl(cfg);
        const el = document.getElementById('bio-generated-link');
        if (el) el.value = url;
        this.refreshPreview(cfg);
        App.showToast('Link da Bio gerado! ✅', 'success');
    },

    refreshPreview(cfg) {
        const c = cfg || this._buildConfig();
        const url = this._generateUrl(c);
        const frame = document.getElementById('bio-preview-frame');
        if (frame) frame.src = url;
    },

    previewBio() {
        const cfg = this._buildConfig();
        const url = this._generateUrl(cfg);
        window.open(url, '_blank');
    },

    copyLink() {
        const el = document.getElementById('bio-generated-link');
        if (!el || !el.value || el.value === 'Salve para gerar o link...') {
            App.showToast('Salve primeiro para gerar o link.', 'info'); return;
        }
        navigator.clipboard.writeText(el.value);
        App.showToast('Link copiado! Cole na bio do Instagram. ✅', 'success');
    },

    shareOnWhatsApp() {
        const el = document.getElementById('bio-generated-link');
        if (!el || !el.value || el.value === 'Salve para gerar o link...') {
            App.showToast('Salve primeiro para gerar o link.', 'info'); return;
        }
        const msg = `✨ Agende seu procedimento online!\n\n${el.value}\n\nVeja nosso portfólio e agende diretamente pelo link! 💅`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
};
