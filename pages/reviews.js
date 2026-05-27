// === Reviews & NPS Page ===
const ReviewsPage = {
    reviews: [],
    npsResponses: [],

    render() {
        return `
        <div class="space-y-8 max-w-[1400px] mobile-full-width mx-auto animation-fade-in pb-20">

            <!-- Header -->
            <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Avaliações & NPS</h2>
                    <p class="text-on-surface-variant mt-1">Mural de feedbacks e pesquisa NPS via WhatsApp para mensurar a satisfação das clientes.</p>
                </div>
                <div class="flex gap-3">
                    <button id="btn-send-nps" class="px-5 py-3 bg-[#25D366] text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-sm">
                        <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Enviar NPS via WhatsApp
                    </button>
                    <button id="btn-new-review" class="px-5 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">star</span>
                        Registrar Feedback
                    </button>
                </div>
            </section>

            <!-- ======== BLOCO NPS ======== -->
            <div class="bg-gradient-to-br from-[#58323F] to-[#7A4A57] rounded-2xl p-6 shadow-lg shadow-[#58323F]/20 text-white">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                    <!-- Score NPS -->
                    <div class="flex items-center gap-6">
                        <div class="relative w-28 h-28 shrink-0">
                            <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="12"/>
                                <circle id="nps-arc" cx="60" cy="60" r="50" fill="none" stroke="white" stroke-width="12"
                                    stroke-linecap="round" stroke-dasharray="314.16" stroke-dashoffset="314.16"
                                    style="transition:stroke-dashoffset 1s ease"/>
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span id="nps-score-display" class="text-3xl font-black leading-none">--</span>
                                <span class="text-[9px] font-bold opacity-70 uppercase tracking-wider">NPS</span>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Net Promoter Score</p>
                            <h3 id="nps-classification" class="text-2xl font-black">Sem dados</h3>
                            <p id="nps-sub" class="text-sm opacity-70 mt-0.5">Envie pesquisas para calcular</p>
                        </div>
                    </div>

                    <!-- Breakdown Promotores / Neutros / Detratores -->
                    <div class="grid grid-cols-3 gap-4 w-full md:w-auto">
                        <div class="text-center bg-white/10 rounded-xl p-3">
                            <p class="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Promotoras</p>
                            <p id="nps-promoters" class="text-2xl font-black text-emerald-300">0</p>
                            <p class="text-[9px] opacity-60">nota 9–10</p>
                        </div>
                        <div class="text-center bg-white/10 rounded-xl p-3">
                            <p class="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Neutras</p>
                            <p id="nps-passives" class="text-2xl font-black text-amber-300">0</p>
                            <p class="text-[9px] opacity-60">nota 7–8</p>
                        </div>
                        <div class="text-center bg-white/10 rounded-xl p-3">
                            <p class="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Detratoras</p>
                            <p id="nps-detractors" class="text-2xl font-black text-red-300">0</p>
                            <p class="text-[9px] opacity-60">nota 0–6</p>
                        </div>
                    </div>
                </div>

                <!-- Escala NPS -->
                <div class="mt-5 pt-4 border-t border-white/10">
                    <p class="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Como interpretar o NPS</p>
                    <div class="flex gap-1.5 flex-wrap">
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/30 text-red-200">Crítico: abaixo de 0</span>
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-200">Aperfeiçoamento: 0 a 49</span>
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200">Favorável: 50 a 74</span>
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200">Excelência: 75 a 100</span>
                    </div>
                </div>
            </div>

            <!-- Respostas NPS recebidas -->
            <div>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-headline text-xl font-bold">Respostas NPS Registradas</h3>
                    <button id="btn-register-nps" class="px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-colors flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">add_circle</span> Registrar Resposta
                    </button>
                </div>
                <div id="nps-responses-list" class="space-y-2">
                    <div class="text-center py-6 text-on-surface-variant text-sm">
                        <span class="material-symbols-outlined text-3xl block mb-2 opacity-30">bar_chart</span>
                        Nenhuma resposta NPS registrada ainda.
                    </div>
                </div>
            </div>

            <!-- Métricas de Estrelas -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-xs flex items-center gap-4">
                    <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                        <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">star</span>
                    </div>
                    <div>
                        <span class="text-xs uppercase font-bold text-on-surface-variant tracking-wider block">Média de Estrelas</span>
                        <h3 id="rev-avg-stars" class="font-headline text-3xl font-black text-on-surface mt-1">-- / 5.0</h3>
                    </div>
                </div>
                <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-xs flex items-center gap-4">
                    <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                        <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">sentiment_satisfied</span>
                    </div>
                    <div>
                        <span class="text-xs uppercase font-bold text-on-surface-variant tracking-wider block">Clientes Satisfeitas</span>
                        <h3 id="rev-promoters" class="font-headline text-3xl font-black text-emerald-600 mt-1">--%</h3>
                    </div>
                </div>
                <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-xs flex items-center gap-4">
                    <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                        <span class="material-symbols-outlined text-2xl">rate_review</span>
                    </div>
                    <div>
                        <span class="text-xs uppercase font-bold text-on-surface-variant tracking-wider block">Total de Feedbacks</span>
                        <h3 id="rev-total-count" class="font-headline text-3xl font-black text-primary mt-1">0</h3>
                    </div>
                </div>
            </div>

            <!-- Feedbacks Grid -->
            <div>
                <h3 class="font-headline text-xl font-bold mb-4">Mural de Feedbacks</h3>
                <div id="reviews-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="col-span-full text-center py-12 text-on-surface-variant">
                        <div class="spinner mx-auto mb-4"></div>
                        <p class="text-sm">Carregando mural de feedbacks...</p>
                    </div>
                </div>
            </div>
        </div>`;
    },

    async init() {
        document.getElementById('btn-new-review')?.addEventListener('click', () => ReviewsPage.showFormModal());
        document.getElementById('btn-send-nps')?.addEventListener('click', () => ReviewsPage.showNPSSendModal());
        document.getElementById('btn-register-nps')?.addEventListener('click', () => ReviewsPage.showNPSRegisterModal());
        await ReviewsPage.loadData();
        ReviewsPage.loadNPSResponses();
    },

    // =============================================
    // DADOS DE AVALIAÇÕES (estrelas)
    // =============================================
    async loadData() {
        try {
            const dbReviews = await Store.getReviews();
            if (dbReviews.length === 0) {
                const sampleReviews = [
                    { clientName: 'Mariana Costa',    rating: 5, comment: 'O alongamento de cílios fio a fio ficou espetacular! O estúdio é lindo, atendimento impecável. Indico para todo mundo!', serviceName: 'Extensão de Cílios' },
                    { clientName: 'Camila Ribeiro',   rating: 5, comment: 'Fiz o design de sobrancelha com henna e ficou super natural. A equipe foi muito delicada e me explicou cada passo.', serviceName: 'Design de Sobrancelha' },
                    { clientName: 'Beatriz Nogueira', rating: 4, comment: 'Ótima experiência no Studiobeauty! As meninas são super simpáticas e o mapping gatinho ficou lindo.', serviceName: 'Volume Russo' }
                ];
                for (const r of sampleReviews) await Store.addReview(r);
                ReviewsPage.reviews = await Store.getReviews();
            } else {
                ReviewsPage.reviews = dbReviews;
            }
            ReviewsPage.renderMural();
        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
        }
    },

    renderMural() {
        const grid = document.getElementById('reviews-grid');
        if (!grid) return;
        const total = ReviewsPage.reviews.length;
        document.getElementById('rev-total-count').textContent = total;
        if (total === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-12 text-on-surface-variant">
                <span class="material-symbols-outlined text-primary/30 text-5xl mb-4">star_rate</span>
                <h4 class="font-headline font-bold text-base text-on-surface">Mural vazio</h4>
                <p class="text-xs mt-1">Nenhum feedback registrado ainda.</p></div>`;
            return;
        }
        let sum = 0, promoters = 0;
        ReviewsPage.reviews.forEach(r => { sum += r.rating || 5; if (r.rating >= 4) promoters++; });
        const avg = (sum / total).toFixed(1);
        const promoterPct = Math.round((promoters / total) * 100);
        document.getElementById('rev-avg-stars').textContent = `${avg} / 5.0`;
        document.getElementById('rev-promoters').textContent = `${promoterPct}%`;
        grid.innerHTML = ReviewsPage.reviews.map(rev => {
            const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
            const date  = rev.createdAt ? new Date(rev.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
            return `
            <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h4 class="font-headline font-bold text-sm text-on-surface">${rev.clientName}</h4>
                            <span class="text-[10px] text-primary font-bold uppercase tracking-wider">${rev.serviceName || 'Geral'}</span>
                        </div>
                        <span class="text-amber-500 font-bold text-sm tracking-widest">${stars}</span>
                    </div>
                    <p class="text-on-surface-variant text-xs leading-relaxed italic">"${rev.comment || 'Sem comentário.'}"</p>
                </div>
                <div class="flex justify-between items-center pt-4 border-t border-outline-variant/10 mt-6 text-[10px] text-on-surface-variant font-medium">
                    <span>Feedback</span><span>${date}</span>
                </div>
            </div>`;
        }).join('');
    },

    // =============================================
    // NPS — ENVIAR PESQUISA VIA WHATSAPP
    // =============================================
    showNPSSendModal() {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-6 max-w-lg mx-auto">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" class="w-5 h-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <div>
                    <h3 class="font-headline font-bold text-xl">Enviar Pesquisa NPS</h3>
                    <p class="text-xs text-on-surface-variant">Selecione a cliente e o procedimento</p>
                </div>
            </div>

            <div class="space-y-4 mt-5">
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Cliente</label>
                    <select id="nps-client-sel" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm">
                        <option value="">Selecione a cliente...</option>
                    </select>
                </div>
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Procedimento Realizado</label>
                    <select id="nps-service-sel" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm">
                        <option value="Procedimento">Procedimento Geral</option>
                    </select>
                </div>

                <!-- Preview da mensagem -->
                <div class="p-4 bg-[#DCF8C6] rounded-xl border border-[#25D366]/20">
                    <p class="text-[10px] font-bold text-[#128C7E] uppercase tracking-wider mb-2">Prévia da Mensagem</p>
                    <p id="nps-msg-preview" class="text-xs text-gray-800 leading-relaxed whitespace-pre-line"></p>
                </div>

                <div class="flex justify-end gap-3 pt-2 border-t border-outline-variant/10">
                    <button onclick="App.closeModal()" class="px-5 py-2.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl text-sm transition-colors">Cancelar</button>
                    <button id="nps-wa-send" class="px-6 py-2.5 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1ebe5d] transition-colors flex items-center gap-2 text-sm shadow-lg shadow-green-500/20">
                        <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Abrir no WhatsApp
                    </button>
                </div>
            </div>
        </div>`;
        App.openModal();

        // Carrega clientes
        Store.getClients().then(clients => {
            const sel = document.getElementById('nps-client-sel');
            if (sel) sel.innerHTML = '<option value="">Selecione...</option>' +
                clients.map(c => `<option value="${(c.phone||'').replace(/\D/g,'')}" data-name="${c.name}">${c.name}</option>`).join('');
            this._updateNPSPreview();
        });
        // Carrega serviços
        Store.getServices && Store.getServices().then(services => {
            const sel = document.getElementById('nps-service-sel');
            if (sel && services?.length) {
                sel.innerHTML = '<option value="Procedimento">Procedimento Geral</option>' +
                    services.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
            }
            this._updateNPSPreview();
        }).catch(() => {});

        document.getElementById('nps-client-sel')?.addEventListener('change', () => this._updateNPSPreview());
        document.getElementById('nps-service-sel')?.addEventListener('change', () => this._updateNPSPreview());
        document.getElementById('nps-wa-send')?.addEventListener('click', () => this._openWhatsAppNPS());
    },

    _getNPSMessage(clientName, service) {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        const studio = s.company || 'Studiobeauty';
        const nome = clientName || 'cliente';
        return `Olá, ${nome}! 🌸\n\nObrigada pela sua visita ao ${studio}!\n\nGostaríamos de saber como foi sua experiência com o procedimento *${service}*.\n\n*Em uma escala de 0 a 10, o quanto você recomendaria nosso studio para uma amiga ou familiar?*\n\n0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟\n\nResponda apenas com o número! Sua opinião é muito importante para nós. 💕\n\n_Equipe ${studio}_`;
    },

    _updateNPSPreview() {
        const sel  = document.getElementById('nps-client-sel');
        const svc  = document.getElementById('nps-service-sel');
        const prev = document.getElementById('nps-msg-preview');
        if (!prev) return;
        const name = sel?.selectedOptions[0]?.dataset.name || 'cliente';
        const service = svc?.value || 'Procedimento';
        prev.textContent = this._getNPSMessage(name, service);
    },

    _openWhatsAppNPS() {
        const sel  = document.getElementById('nps-client-sel');
        const svc  = document.getElementById('nps-service-sel');
        const phone = sel?.value || '';
        const name  = sel?.selectedOptions[0]?.dataset.name || 'cliente';
        const service = svc?.value || 'Procedimento';
        if (!phone) { App.showToast('Selecione uma cliente com telefone cadastrado.', 'info'); return; }
        const msg = this._getNPSMessage(name, service);
        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
        App.closeModal();
        App.showToast('WhatsApp aberto! Após receber a resposta, registre a nota.', 'success');
    },

    // =============================================
    // NPS — REGISTRAR RESPOSTA RECEBIDA
    // =============================================
    showNPSRegisterModal() {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-6 max-w-md mx-auto">
            <h3 class="font-headline font-bold text-xl mb-1">Registrar Resposta NPS</h3>
            <p class="text-on-surface-variant text-sm mb-5">Digite a nota que a cliente respondeu via WhatsApp.</p>

            <form id="nps-register-form" class="space-y-4">
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Cliente</label>
                    <select id="nps-reg-client" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                        <option value="">Selecione...</option>
                    </select>
                </div>
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                        Nota Dada pela Cliente (0–10)
                    </label>
                    <!-- Botões de nota 0 a 10 -->
                    <div class="grid grid-cols-6 gap-1.5" id="nps-score-btns">
                        ${[...Array(11).keys()].map(n => {
                            const color = n >= 9 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                                          n >= 7 ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                                   'bg-red-100 text-red-700 hover:bg-red-200';
                            return `<button type="button" class="nps-score-btn ${color} font-black py-2.5 rounded-xl text-sm transition-all" data-score="${n}">${n}</button>`;
                        }).join('')}
                    </div>
                    <input type="hidden" id="nps-score-val" value="" required/>
                    <p id="nps-score-label" class="text-xs text-on-surface-variant mt-2 text-center hidden"></p>
                </div>
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Comentário (opcional)</label>
                    <textarea id="nps-reg-comment" rows="2" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm resize-none" placeholder="Algum comentário adicional da cliente..."></textarea>
                </div>
                <div class="flex justify-end gap-3 pt-3 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-5 py-2.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl text-sm">Cancelar</button>
                    <button type="submit" class="px-6 py-2.5 vitality-gradient text-white font-bold rounded-xl shadow-lg text-sm">Salvar Nota</button>
                </div>
            </form>
        </div>`;
        App.openModal();

        Store.getClients().then(clients => {
            const sel = document.getElementById('nps-reg-client');
            if (sel) sel.innerHTML = '<option value="">Selecione...</option>' +
                clients.map(c => `<option value="${c.id}" data-name="${c.name}">${c.name}</option>`).join('');
        });

        // Score button selection
        document.getElementById('nps-score-btns')?.addEventListener('click', e => {
            const btn = e.target.closest('.nps-score-btn');
            if (!btn) return;
            document.querySelectorAll('.nps-score-btn').forEach(b => b.classList.remove('ring-2', 'ring-offset-1', 'ring-[#58323F]', 'scale-110'));
            btn.classList.add('ring-2', 'ring-offset-1', 'ring-[#58323F]', 'scale-110');
            const score = parseInt(btn.dataset.score);
            document.getElementById('nps-score-val').value = score;
            const labelEl = document.getElementById('nps-score-label');
            if (labelEl) {
                labelEl.classList.remove('hidden');
                labelEl.textContent = score >= 9 ? '🟢 Promotora — vai recomendar o studio!' :
                                      score >= 7 ? '🟡 Neutra — satisfeita, mas não entusiasmada' :
                                                   '🔴 Detratora — pode não voltar ou não indicar';
            }
        });

        document.getElementById('nps-register-form')?.addEventListener('submit', e => {
            e.preventDefault();
            const score = document.getElementById('nps-score-val').value;
            if (score === '') { App.showToast('Selecione a nota da cliente.', 'info'); return; }
            const sel = document.getElementById('nps-reg-client');
            const response = {
                clientName: sel?.selectedOptions[0]?.dataset.name || 'Cliente',
                score: parseInt(score),
                comment: document.getElementById('nps-reg-comment')?.value || '',
                date: new Date().toISOString()
            };
            const stored = JSON.parse(localStorage.getItem('nps_responses') || '[]');
            stored.push(response);
            localStorage.setItem('nps_responses', JSON.stringify(stored));
            App.closeModal();
            App.showToast('Resposta NPS registrada! ✅', 'success');
            ReviewsPage.loadNPSResponses();
        });
    },

    // =============================================
    // NPS — CARREGAR E CALCULAR SCORE
    // =============================================
    loadNPSResponses() {
        const responses = JSON.parse(localStorage.getItem('nps_responses') || '[]');
        this.npsResponses = responses;

        // Calcular NPS
        const total = responses.length;
        const promoters  = responses.filter(r => r.score >= 9).length;
        const passives   = responses.filter(r => r.score >= 7 && r.score <= 8).length;
        const detractors = responses.filter(r => r.score <= 6).length;
        const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : null;

        // Atualiza contadores
        const el = id => document.getElementById(id);
        if (el('nps-promoters'))  el('nps-promoters').textContent  = promoters;
        if (el('nps-passives'))   el('nps-passives').textContent   = passives;
        if (el('nps-detractors')) el('nps-detractors').textContent = detractors;

        if (nps !== null) {
            if (el('nps-score-display')) el('nps-score-display').textContent = nps;
            // Gauge SVG (NPS vai de -100 a +100; normaliza para 0-100%)
            const pct = Math.max(0, Math.min(100, (nps + 100) / 2));
            const arc = el('nps-arc');
            if (arc) setTimeout(() => { arc.style.strokeDashoffset = 314.16 * (1 - pct / 100); }, 200);
            // Classificação
            const { label, sub } = nps >= 75 ? { label: '🏆 Excelência', sub: 'Suas clientes são fãs do studio!' } :
                                   nps >= 50 ? { label: '😊 Favorável', sub: 'Boa satisfação, com espaço para crescer.' } :
                                   nps >= 0  ? { label: '📈 Aperfeiçoamento', sub: 'Há pontos a melhorar.' } :
                                              { label: '⚠️ Crítico', sub: 'Muitas clientes insatisfeitas.' };
            if (el('nps-classification')) el('nps-classification').textContent = label;
            if (el('nps-sub')) el('nps-sub').textContent = `${sub} (${total} resposta${total !== 1 ? 's' : ''})`;
        }

        // Renderiza lista
        const list = el('nps-responses-list');
        if (!list) return;
        if (total === 0) {
            list.innerHTML = `<div class="text-center py-6 text-on-surface-variant text-sm">
                <span class="material-symbols-outlined text-3xl block mb-2 opacity-30">bar_chart</span>
                Nenhuma resposta NPS registrada ainda.</div>`;
            return;
        }

        const sorted = [...responses].sort((a, b) => new Date(b.date) - new Date(a.date));
        list.innerHTML = sorted.map(r => {
            const scoreColor = r.score >= 9 ? 'bg-emerald-100 text-emerald-700' :
                               r.score >= 7 ? 'bg-amber-100 text-amber-700' :
                                              'bg-red-100 text-red-700';
            const scoreLabel = r.score >= 9 ? 'Promotora' : r.score >= 7 ? 'Neutra' : 'Detratora';
            const date = new Date(r.date).toLocaleDateString('pt-BR');
            return `
            <div class="flex items-center gap-4 bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10">
                <div class="w-12 h-12 rounded-xl ${scoreColor} flex items-center justify-center font-black text-xl shrink-0">${r.score}</div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm text-on-surface">${r.clientName}</p>
                    ${r.comment ? `<p class="text-xs text-on-surface-variant truncate italic">"${r.comment}"</p>` : ''}
                </div>
                <div class="text-right shrink-0">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${scoreColor}">${scoreLabel}</span>
                    <p class="text-[10px] text-on-surface-variant mt-1">${date}</p>
                </div>
            </div>`;
        }).join('');
    },

    // =============================================
    // FORMULÁRIO: Feedback manual (estrelas)
    // =============================================
    showFormModal() {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-8 max-w-lg mx-auto">
            <h3 class="font-headline font-bold text-2xl mb-1">Registrar Feedback</h3>
            <p class="text-on-surface-variant text-sm mb-6">Cadastre a nota e o comentário que a cliente deixou.</p>
            <form id="review-form" class="space-y-4">
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Cliente</label>
                    <select id="rev-client" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                        <option value="">Selecione a cliente...</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Procedimento</label>
                        <select id="rev-service" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                            <option value="Geral">Procedimento Geral</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Nota (1–5 ★)</label>
                        <select id="rev-stars" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                            <option value="5">★★★★★ Excelente</option>
                            <option value="4">★★★★☆ Muito Bom</option>
                            <option value="3">★★★☆☆ Regular</option>
                            <option value="2">★★☆☆☆ Ruim</option>
                            <option value="1">★☆☆☆☆ Péssimo</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Comentário / Depoimento</label>
                    <textarea id="rev-comment" rows="3" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm resize-none" placeholder="Digite o comentário que a cliente enviou..." required></textarea>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-2.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl text-sm">Cancelar</button>
                    <button type="submit" class="px-6 py-2.5 vitality-gradient text-white font-bold rounded-xl shadow-lg text-sm flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">save</span> Salvar Feedback
                    </button>
                </div>
            </form>
        </div>`;
        App.openModal();
        Store.getClients().then(clients => {
            const sel = document.getElementById('rev-client');
            if (sel) sel.innerHTML = '<option value="">Selecione...</option>' +
                clients.map(c => `<option value="${c.id}" data-name="${c.name}">${c.name}</option>`).join('');
        });
        Store.getServices && Store.getServices().then(services => {
            const sel = document.getElementById('rev-service');
            if (sel && services?.length) sel.innerHTML = '<option value="Geral">Procedimento Geral</option>' +
                services.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
        }).catch(() => {});
        document.getElementById('review-form')?.addEventListener('submit', async e => {
            e.preventDefault();
            const sel = document.getElementById('rev-client');
            const data = {
                clientName: sel.selectedOptions[0]?.dataset.name || '',
                serviceName: document.getElementById('rev-service').value,
                rating: parseInt(document.getElementById('rev-stars').value) || 5,
                comment: document.getElementById('rev-comment').value.trim()
            };
            try {
                await Store.addReview(data);
                App.closeModal();
                App.showToast('Feedback registrado! ✅', 'success');
                await ReviewsPage.loadData();
            } catch (err) {
                App.showToast('Falha ao registrar feedback.', 'error');
            }
        });
    }
};
