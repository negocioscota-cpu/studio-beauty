// === Referrals Page Module ===
const ReferralsPage = {
    render() {
        return `
        <div class="px-6 py-8 pb-32 md:pb-8 max-w-7xl mx-auto animation-fade-in">

            <!-- ===== HERO BANNER ===== -->
            <div class="relative rounded-3xl overflow-hidden mb-8 vitality-gradient p-8 md:p-10 shadow-xl shadow-primary/20">
                <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 60%)"></div>
                <div class="absolute top-[-40px] right-[-40px] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div class="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div class="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg shrink-0">
                        <span class="material-symbols-outlined text-white text-4xl" style="font-variation-settings:'FILL' 1">star</span>
                    </div>
                    <div>
                        <div class="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                            <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            Bolsa da Beleza
                        </div>
                        <h1 class="font-headline font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-tight">
                            Indique e Ganhe <span class="bg-white/20 px-2 py-0.5 rounded-lg">R$ 50,00</span><br class="hidden md:block"> por indicação ativa
                        </h1>
                        <p class="text-white/80 mt-2 text-sm max-w-lg">
                            Compartilhe seu link exclusivo com outros profissionais de cílios, sobrancelhas, lábios e face. Quando eles assinarem um plano pago, você recebe automaticamente R$&nbsp;50,00 na sua carteira — sem limite de indicações!
                        </p>
                    </div>
                </div>
            </div>

            <!-- ===== COMO FUNCIONA ===== -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 mb-8">
                <div class="flex items-center gap-2 mb-6">
                    <span class="material-symbols-outlined text-primary" style="font-variation-settings:'FILL' 1">emoji_objects</span>
                    <h2 class="font-headline font-bold text-xl text-slate-900">Como funciona?</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="flex flex-col items-center text-center gap-3">
                        <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-black shadow-sm">1</div>
                        <div>
                            <p class="font-bold text-slate-800 text-sm">Copie seu link</p>
                            <p class="text-xs text-slate-500 mt-1">Seu link exclusivo está abaixo. É único e rastreável.</p>
                        </div>
                    </div>
                    <div class="hidden md:flex items-center justify-center text-slate-200">
                        <span class="material-symbols-outlined text-3xl">arrow_forward</span>
                    </div>
                    <div class="flex flex-col items-center text-center gap-3">
                        <div class="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-2xl font-black shadow-sm">2</div>
                        <div>
                            <p class="font-bold text-slate-800 text-sm">Compartilhe</p>
                            <p class="text-xs text-slate-500 mt-1">Envie para lashers, designers de sobrancelhas, lip designers, esteticistas e profissionais da beleza.</p>
                        </div>
                    </div>
                    <div class="hidden md:flex items-center justify-center text-slate-200">
                        <span class="material-symbols-outlined text-3xl">arrow_forward</span>
                    </div>
                    <div class="flex flex-col items-center text-center gap-3">
                        <div class="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl font-black shadow-sm">3</div>
                        <div>
                            <p class="font-bold text-slate-800 text-sm">Eles assinam</p>
                            <p class="text-xs text-slate-500 mt-1">Quando o indicado ativar um plano pago, a conversão é registrada.</p>
                        </div>
                    </div>
                    <div class="hidden md:flex items-center justify-center text-slate-200">
                        <span class="material-symbols-outlined text-3xl">arrow_forward</span>
                    </div>
                    <div class="flex flex-col items-center text-center gap-3">
                        <div class="w-14 h-14 rounded-2xl vitality-gradient text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <span class="material-symbols-outlined text-2xl" style="font-variation-settings:'FILL' 1">wallet</span>
                        </div>
                        <div>
                            <p class="font-bold text-slate-800 text-sm">Você recebe R$ 50</p>
                            <p class="text-xs text-slate-500 mt-1">O saldo cai direto na sua carteira. Saque via PIX quando quiser.</p>
                        </div>
                    </div>
                </div>

                <!-- Info box multi-plataforma -->
                <div class="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                    <span class="material-symbols-outlined text-blue-500 shrink-0 mt-0.5" style="font-variation-settings:'FILL' 1">info</span>
                    <div>
                        <p class="text-sm font-bold text-blue-800">Válido para toda a linha Cliente Hub</p>
                        <p class="text-xs text-blue-700 mt-0.5">Seu link funciona para qualquer sistema da plataforma — Estética, Cílios, Sobrancelhas, Lábios, Face e Beleza. Qualquer profissional que se cadastrar pelo seu link e assinar conta como uma indicação sua!</p>
                    </div>
                </div>
            </div>

            <!-- ===== STATS ===== -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">group</span>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-slate-500">Total de Indicações</p>
                        <p class="text-2xl font-black text-slate-900" id="ref-total-count">—</p>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">verified</span>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-slate-500">Convertidas (Ativas)</p>
                        <p class="text-2xl font-black text-slate-900" id="ref-converted-count">—</p>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden">
                    <div class="absolute right-0 bottom-0 top-0 w-32 bg-primary/5 rounded-l-full blur-xl pointer-events-none"></div>
                    <div class="w-12 h-12 rounded-xl vitality-gradient text-white flex items-center justify-center shadow-lg shadow-primary/20 z-10">
                        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">payments</span>
                    </div>
                    <div class="z-10">
                        <p class="text-sm font-bold text-slate-500">Carteira Disponível</p>
                        <p class="text-2xl font-black text-primary" id="ref-balance">R$ —</p>
                    </div>
                </div>
            </div>

            <!-- ===== LINK + PIX + LISTA ===== -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <!-- Left: Link + PIX -->
                <div class="lg:col-span-1 space-y-6">
                    <!-- Link Card -->
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div class="mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">link</span>
                            <h3 class="font-bold text-slate-800">Seu Link Exclusivo</h3>
                        </div>
                        <p class="text-sm text-slate-500 mb-4">Compartilhe e garanta suas comissões por cada novo negócio fechado.</p>
                        <div class="flex items-center gap-2">
                            <input type="text" id="referral-link-input" readonly class="text-xs bg-slate-100 border-none rounded-xl w-full py-3 px-4 text-slate-600 font-medium focus:ring-2 focus:ring-primary/20">
                            <button id="btn-copy-link" onclick="ReferralsPage.copyLink()" class="bg-primary text-white p-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-primary/20 shrink-0 w-12 h-12 flex items-center justify-center">
                                <span class="material-symbols-outlined text-xl">content_copy</span>
                            </button>
                        </div>
                        <!-- Share buttons -->
                        <div class="mt-4 grid grid-cols-2 gap-2">
                            <button onclick="ReferralsPage.shareWhatsApp()" class="flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs font-bold py-2.5 rounded-xl transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                WhatsApp
                            </button>
                            <button onclick="ReferralsPage.copyLink()" class="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors">
                                <span class="material-symbols-outlined text-[16px]">share</span>
                                Copiar Link
                            </button>
                        </div>
                    </div>

                    <!-- PIX Key Card -->
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div class="mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-secondary">pix</span>
                            <h3 class="font-bold text-slate-800">Dados Bancários (PIX)</h3>
                        </div>
                        <p class="text-sm text-slate-500 mb-4">Cadastre sua chave PIX para receber os R$&nbsp;50,00 de cada indicação convertida.</p>
                        <input type="text" id="pix-key-input" placeholder="CPF, e-mail, telefone ou chave aleatória" class="bg-slate-50 border border-slate-200 text-slate-800 sm:text-sm rounded-xl focus:ring-primary focus:border-primary block w-full px-4 py-3 mb-4">
                        <button id="btn-save-pix" onclick="ReferralsPage.savePixKey()" class="w-full vitality-gradient text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-lg">save</span>
                            Salvar Chave PIX
                        </button>
                    </div>
                </div>

                <!-- Right: List -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
                        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-slate-400">format_list_bulleted</span>
                                <h3 class="font-bold text-slate-800">Status das Indicações</h3>
                            </div>
                            <span class="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-semibold">Em tempo real</span>
                        </div>
                        <div id="referrals-list" class="flex-1 min-h-[300px] flex flex-col">
                            <div class="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 gap-3">
                                <div class="spinner w-8 h-8 border-t-primary"></div>
                                <p class="text-sm">Carregando indicações...</p>
                            </div>
                        </div>
                        <!-- Legend -->
                        <div class="p-4 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-500">
                            <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-green-500"></span> Ativo = Bônus liberado (R$ 50)</div>
                            <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-slate-300"></span> Em Teste = Aguardando assinatura</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    async init() {
        if (!Auth.currentUser) return;
        
        // Render base link
        const currentUrl = window.location.origin + window.location.pathname;
        const refLink = `${currentUrl}?ref=${Auth.currentUser.uid}`;
        const inputLink = document.getElementById('referral-link-input');
        if (inputLink) inputLink.value = refLink;

        // Fetch company document to display PIX key and stats
        try {
            const doc = await db.collection('companies').doc(Auth.currentUser.uid).get();
            if (doc.exists) {
                const data = doc.data();
                const pixInput = document.getElementById('pix-key-input');
                if (pixInput && data.pixKey) {
                    pixInput.value = data.pixKey;
                }
            }

            // Fetch referrals where referredBy == this user's UID
            const snapshot = await db.collection('companies').where('referredBy', '==', Auth.currentUser.uid).get();
            let totalReferrals = 0;
            let convertedReferrals = 0;
            
            const listEl = document.getElementById('referrals-list');
            if (listEl) listEl.innerHTML = ''; // clear

            if (snapshot.empty) {
                if (listEl) {
                    listEl.innerHTML = `
                        <div class="p-8 text-center text-slate-500 font-medium">
                            <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                                <span class="material-symbols-outlined text-slate-400 text-3xl">sentiment_dissatisfied</span>
                            </div>
                            <p>Você ainda não fez nenhuma indicação.</p>
                            <p class="text-sm mt-1">Copie o seu link e comece a compartilhar!</p>
                        </div>
                    `;
                }
            }

            snapshot.forEach(docSnap => {
                const refData = docSnap.data();
                totalReferrals++;
                const isConverted = refData.plan !== 'free'; // Rule: not free = converted
                if (isConverted) convertedReferrals++;

                if (listEl) {
                    listEl.innerHTML += `
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black shadow-inner">
                                    ${refData.companyName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p class="font-bold text-slate-800">${refData.companyName}</p>
                                    <div class="flex items-center gap-2 mt-1">
                                        <span class="material-symbols-outlined text-[14px] text-slate-400">person</span>
                                        <p class="text-xs text-slate-500 font-medium">${refData.ownerName}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 sm:self-auto self-start pl-16 sm:pl-0">
                                <span class="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${isConverted ? 'bg-[#25D366]/10 text-green-700' : 'bg-slate-100 text-slate-600'}">
                                    <span class="w-1.5 h-1.5 rounded-full ${isConverted ? 'bg-[#25D366]' : 'bg-slate-400'}"></span>
                                    ${isConverted ? 'Ativo' : 'Em Teste (Trial)'}
                                </span>
                            </div>
                        </div>
                    `;
                }
            });

            // Update DOM counters
            const elTotal = document.getElementById('ref-total-count');
            const elConverted = document.getElementById('ref-converted-count');
            const elBalance = document.getElementById('ref-balance');

            if (elTotal) elTotal.textContent = totalReferrals;
            if (elConverted) elConverted.textContent = convertedReferrals;
            if (elBalance) elBalance.textContent = `R$ ${(convertedReferrals * 50).toFixed(2).replace('.', ',')}`;

        } catch (err) {
            console.error("Erro ao carregar indicações: ", err);
        }
    },

    copyLink() {
        const inputLink = document.getElementById('referral-link-input');
        if (!inputLink) return;

        inputLink.select();
        inputLink.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(inputLink.value).then(() => {
            const btn = document.getElementById('btn-copy-link');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined text-xl">check</span>';
            setTimeout(() => btn.innerHTML = originalHTML, 2000);
        });
    },

    shareWhatsApp() {
        const inputLink = document.getElementById('referral-link-input');
        if (!inputLink) return;
        const msg = encodeURIComponent(
            `Olá! Estou usando o Studiobeauty para gerenciar meu studio e tem me ajudado muito. ` +
            `Você pode experimentar gratuitamente por 14 dias usando meu link de convite: ${inputLink.value}`
        );
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    },

    async savePixKey() {
        const pixInput = document.getElementById('pix-key-input');
        if (!pixInput || !Auth.currentUser) return;
        
        const btn = document.getElementById('btn-save-pix');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<div class="spinner w-4 h-4 border-2 border-white/20 border-t-white mr-2"></div> Salvando...';
        btn.disabled = true;

        try {
            await db.collection('companies').doc(Auth.currentUser.uid).update({
                pixKey: pixInput.value.trim()
            });
            btn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> Chave Salva';
            setTimeout(() => btn.innerHTML = originalText, 2000);
        } catch (err) {
            console.error("Erro ao salvar chave PIX: ", err);
            btn.innerHTML = 'Erro ao salvar';
            setTimeout(() => btn.innerHTML = originalText, 2000);
        } finally {
            btn.disabled = false;
        }
    }
};

window.ReferralsPage = ReferralsPage;
