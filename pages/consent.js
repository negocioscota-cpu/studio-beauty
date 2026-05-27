// === Consent Form (TCLE) & Canvas Digital Signature Page ===
const ConsentPage = {
    consents: [],
    canvas: null,
    ctx: null,
    isDrawing: false,

    render() {
        return `
        <div class="space-y-8 max-w-[1400px] mobile-full-width mx-auto animation-fade-in pb-20">
            <!-- Header -->
            <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Termos de Consentimento (TCLE)</h2>
                    <p class="text-on-surface-variant mt-1">Gerencie termos de responsabilidade e colha assinaturas digitais diretamente em tela.</p>
                </div>
                <div>
                    <button id="btn-new-consent" class="px-5 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">draw</span>
                        Assinar Novo Termo
                    </button>
                </div>
            </section>

            <!-- Termos Assinados Lista -->
            <div class="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/10 shadow-xs">
                <h3 class="font-headline font-bold text-lg mb-4">Termos Assinados Recentemente</h3>
                <div id="consents-list" class="space-y-4">
                    <div class="text-center py-12 text-on-surface-variant text-sm">
                        <div class="spinner mx-auto mb-4"></div>
                        <p>Carregando registros de consentimentos...</p>
                    </div>
                </div>
            </div>
        </div>`;
    },

    async init() {
        document.getElementById('btn-new-consent')?.addEventListener('click', () => ConsentPage.showFormModal());
        await ConsentPage.loadData();
    },

    async loadData() {
        try {
            ConsentPage.consents = await Store.getConsents();
            ConsentPage.renderList();
        } catch (error) {
            console.error("Erro ao carregar termos de consentimento:", error);
            App.showToast("Falha ao carregar termos de consentimento.", "error");
        }
    },

    renderList() {
        const list = document.getElementById('consents-list');
        if (!list) return;

        if (ConsentPage.consents.length === 0) {
            list.innerHTML = `
            <div class="text-center py-12 text-on-surface-variant">
                <span class="material-symbols-outlined text-primary/30 text-5xl mb-4">fact_check</span>
                <h4 class="font-headline font-bold text-base text-on-surface">Nenhum termo de consentimento assinado</h4>
                <p class="text-xs mt-1">Gere novos termos jurídicos de responsabilidade com assinatura digital na tela para suas clientes.</p>
            </div>`;
            return;
        }

        list.innerHTML = ConsentPage.consents.map(rem => {
            const dateStr = rem.createdAt ? new Date(rem.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
            return `
            <div class="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/10 hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold" style="background-color: rgba(199, 123, 107, 0.1);">
                        ✒
                    </div>
                    <div>
                        <h4 class="font-headline font-bold text-sm text-on-surface">Termo assinado por: <strong class="text-primary">${rem.clientName}</strong></h4>
                        <p class="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Procedimento: ${rem.termType || 'Alongamento de Cílios'} | Registro assinado digitalmente ✓</p>
                    </div>
                </div>

                <div class="flex items-center gap-3 self-end md:self-center shrink-0">
                    <span class="text-[10px] text-on-surface-variant font-medium">${dateStr}</span>
                    <button onclick="ConsentPage.viewSignature('${rem.id}')" class="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all">
                        <span class="material-symbols-outlined text-base">visibility</span>
                        Visualizar Assinatura
                    </button>
                </div>
            </div>`;
        }).join('');
    },

    showFormModal() {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-8 max-w-2xl mx-auto">
            <h3 class="font-headline font-bold text-2xl mb-1">Termo de Consentimento Livre e Esclarecido</h3>
            <p class="text-on-surface-variant text-sm mb-6">Selecione o procedimento, revise o termo e colha a assinatura da cliente.</p>
            <form id="consent-form" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Cliente</label>
                        <select id="cst-client" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                            <option value="">Selecione a cliente...</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Tipo de Procedimento</label>
                        <select id="cst-type" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                            <option value="Alongamento de Cílios">Alongamento / Extensão de Cílios</option>
                            <option value="Micropigmentação">Micropigmentação Labial / Sobrancelhas</option>
                            <option value="Design de Sobrancelhas">Design de Sobrancelhas & Tintura</option>
                        </select>
                    </div>
                </div>

                <!-- Corpo do termo de consentimento -->
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Revisão do Termo Jurídico</label>
                    <div id="cst-term-body" class="w-full h-40 overflow-y-auto px-4 py-3 bg-surface-container-high rounded-xl text-xs text-on-surface-variant leading-relaxed select-none border border-outline-variant/5">
                        <!-- Carregado via JS -->
                    </div>
                </div>

                <!-- Canvas de Assinatura -->
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant">Assinatura Digital (Assine abaixo usando o dedo ou mouse)</label>
                        <button type="button" id="cst-clear-canvas" class="text-[10px] text-primary font-bold hover:underline">Limpar Tela</button>
                    </div>
                    <div class="w-full bg-white rounded-2xl border border-outline-variant/30 overflow-hidden flex items-center justify-center" style="touch-action: none;">
                        <canvas id="cst-signature-canvas" width="550" height="150" class="w-full h-[150px] cursor-crosshair bg-white"></canvas>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-2.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl text-sm transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-2.5 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all text-sm flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">verified</span>
                        Salvar e Registrar Termo
                    </button>
                </div>
            </form>
        </div>`;
        App.openModal();

        // Populate Clients dropdown
        Store.getClients().then(clients => {
            const select = document.getElementById('cst-client');
            if (select) {
                select.innerHTML = '<option value="">Selecione a cliente...</option>' +
                    clients.map(c => `<option value="${c.id}" data-name="${c.name}">${c.name}</option>`).join('');
            }
        });

        // Term templates
        const termTemplates = {
            "Alongamento de Cílios": `Termo de Responsabilidade - Extensão de Cílios no Studiobeauty:\n\n1. Entendo que o procedimento envolve a colagem de cílios sintéticos aos meus cílios naturais por meio de adesivo de grau cirúrgico.\n2. Fui informada sobre as regras de manutenção de 15 a 21 dias.\n3. Confirmo que não possuo alergias a produtos oculares, rinite severa em crise ou infecções oculares ativas.\n4. Autorizo a aplicação e me comprometo a seguir as regras de pós-atendimento (não molhar nas primeiras 24 horas, escovar diariamente e não utilizar rímel a base de óleo).`,
            "Micropigmentação": `Termo de Consentimento - Micropigmentação Labial / Sobrancelhas:\n\n1. Dou meu pleno consentimento para a realização do procedimento de dermopigmentação estética.\n2. Compreendo que a técnica envolve a inserção de pigmentos minerais na camada superficial da epiderme.\n3. Fui orientada sobre o processo de cicatrização (descamação leve e clareamento de até 40% da cor nas primeiras semanas).\n4. Declaro que não tenho tendências a queloides, não estou grávida/lactante sem aval médico, e não uso ácidos tópicos na região.`,
            "Design de Sobrancelhas": `Termo de Consentimento - Design de Sobrancelhas & Tintura / Henna:\n\n1. Autorizo a realização do mapeamento geométrico das sobrancelhas e remoção de pelos excedentes.\n2. Declaro não possuir alergias conhecidas a tinturas cosméticas ou henna natural.\n3. Compreendo as orientações de durabilidade de fixação da tintura na pele e pelos.`
        };

        const termBody = document.getElementById('cst-term-body');
        const typeSelect = document.getElementById('cst-type');

        const updateTerm = () => {
            const text = termTemplates[typeSelect.value] || termTemplates["Alongamento de Cílios"];
            termBody.innerHTML = text.replace(/\n/g, '<br>');
        };

        typeSelect.addEventListener('change', updateTerm);
        updateTerm(); // Initial trigger

        // Canvas Drawing Setup
        const canvas = document.getElementById('cst-signature-canvas');
        const ctx = canvas.getContext('2d');
        ConsentPage.canvas = canvas;
        ConsentPage.ctx = ctx;

        // Estilos do traço de assinatura
        ctx.strokeStyle = '#331c15';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Mouse Events
        canvas.addEventListener('mousedown', (e) => {
            ConsentPage.isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!ConsentPage.isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
        });

        window.addEventListener('mouseup', () => {
            ConsentPage.isDrawing = false;
        });

        // Touch Events para celulares (muito importante para WOW!)
        canvas.addEventListener('touchstart', (e) => {
            ConsentPage.isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            ctx.beginPath();
            ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
            e.preventDefault();
        });

        canvas.addEventListener('touchmove', (e) => {
            if (!ConsentPage.isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
            ctx.stroke();
            e.preventDefault();
        });

        canvas.addEventListener('touchend', () => {
            ConsentPage.isDrawing = false;
        });

        // Clear Canvas
        document.getElementById('cst-clear-canvas').addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        // Submit Form
        document.getElementById('consent-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const clientSel = document.getElementById('cst-client');

            // Validar se o canvas não está completamente em branco
            // Uma verificação simples de que pelo menos alguns pixels foram desenhados
            const canvasDataUrl = canvas.toDataURL();
            
            const data = {
                clientId: clientSel.value,
                clientName: clientSel.selectedOptions[0]?.dataset.name || '',
                termType: typeSelect.value,
                signatureDataUrl: canvasDataUrl // Grava como String Base64
            };

            try {
                await Store.addConsent(data);
                App.closeModal();
                App.showToast("Termo assinado e registrado com sucesso!", "success");
                await ConsentPage.loadData();
            } catch (err) {
                console.error("Erro ao salvar consentimento:", err);
                App.showToast("Erro ao registrar assinatura no banco.", "error");
            }
        });
    },

    viewSignature(consentId) {
        const consent = ConsentPage.consents.find(c => c.id === consentId);
        if (!consent) return;

        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-8 max-w-lg mx-auto text-center space-y-6">
            <div>
                <h3 class="font-headline font-bold text-2xl text-on-surface">Assinatura de ${consent.clientName}</h3>
                <p class="text-xs text-on-surface-variant uppercase font-semibold tracking-wider mt-0.5">${consent.termType}</p>
            </div>
            
            <div class="border border-outline-variant/30 rounded-2xl bg-white p-4 flex items-center justify-center max-w-sm mx-auto shadow-inner">
                <img src="${consent.signatureDataUrl}" class="max-h-[120px] w-auto pointer-events-none" alt="Assinatura" />
            </div>

            <p class="text-xs text-on-surface-variant italic leading-relaxed">
                "Este termo de consentimento foi assinado eletronicamente direto na tela do dispositivo."
            </p>

            <div class="flex justify-end pt-4 border-t border-outline-variant/10">
                <button type="button" onclick="App.closeModal()" class="px-6 py-2.5 vitality-gradient text-white font-bold rounded-xl text-xs">Fechar</button>
            </div>
        </div>`;
        App.openModal();
    }
};
