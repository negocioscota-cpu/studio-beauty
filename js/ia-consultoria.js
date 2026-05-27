// === IA Consultoria — Agente Virtual Studiobeauty ===
// Desenvolvido de forma nativa e offline para suporte de alta performance sobre cílios, sobrancelhas, lábios e face.

const IAConsultoria = {
    chatDrawer: null,
    chatMessages: null,
    chatInput: null,
    chatForm: null,
    suggestionsContainer: null,
    fab: null,
    isInitialized: false,
    isTyping: false,

    // Base de dados local compilada do Kit Lips, protocolos e produtos
    knowledgeBase: {
        company: "Studiobeauty",
        product: {
            name: "Kit Labial Lash and Beauty Lips",
            shortName: "Kit Lips",
            description: "Uma solução completa e premium de cuidados labiais dividida em 4 etapas sinérgicas. Proporciona suavidade extrema, hidratação profunda, nutrição celular intensa e proteção duradoura contra agressões externas.",
            steps: [
                {
                    number: 1,
                    name: "Esfoliação (Scrub de Arroz)",
                    purpose: "Remove células mortas de forma suave e natural sem ser abrasivo, preparando os lábios para os ativos."
                },
                {
                    number: 2,
                    name: "Hidratação e Nutrição profunda (Sérum Coco Boost)",
                    purpose: "Permeação de ativos nanotecnológicos de altíssima performance para restabelecer a maciez e contorno labial."
                },
                {
                    number: 3,
                    name: "Proteção e Regeneração (Butter Coco e Vanilla)",
                    purpose: "Blend ultra-emoliente de manteigas e óleos nobres para criar barreira física hidratante duradoura."
                },
                {
                    number: 4,
                    name: "Finalização e Selagem (Gloss Reconstrutor)",
                    purpose: "Criação de uma película protetora confortável que sela os ativos e confere um brilho radiante de alta durabilidade."
                }
            ],
            keyIngredients: [
                { name: "RAFFERMINE®", benefit: "Renova a matriz extracelular dérmica dos lábios, combatendo a flacidez e o envelhecimento." },
                { name: "Ácido Hialurônico", benefit: "Retém até 1.000x seu peso em água, garantindo preenchimento visual e volumetria por hidratação profunda." },
                { name: "Pantenol (Vitamina B5)", benefit: "Ação emoliente, reparadora e anti-inflamatória, acelerando a cicatrização pós-esfoliação." },
                { name: "Vitamina C", benefit: "Antioxidante potente que clareia e uniformiza o tom dos lábios, estimulando a produção de colágeno." },
                { name: "Niacinamida (Vitamina B3)", benefit: "Melhora a elasticidade, uniformiza o tom da pele e possui excelente efeito calmante." },
                { name: "Squalane (Esqualano)", benefit: "Emoliente nobre que protege a barreira de hidratação lipídica e evita a desidratação labial." },
                { name: "Manteiga de Cacau", benefit: "Forma uma barreira protetora anti-desidratação e combate o envelhecimento precoce." },
                { name: "Manteiga de Karité", benefit: "Nutrição profunda e regeneração celular com efeito duradouro para lábios severamente secos." },
                { name: "Óleo de Coco", benefit: "Ação antibacteriana natural que protege e deixa a pele extremamente macia." },
                { name: "Óleo de Pracaxi", benefit: "Poderoso regenerador da Amazônia, restaura a elasticidade natural e regenera fissuras." },
                { name: "Óleo de Macadâmia", benefit: "Absorção rápida que fortalece a barreira de umidade sem pesar nos lábios." },
                { name: "Óleo de Semente de Uva", benefit: "Forte antioxidante natural que combate os danos solares e poluição." },
                { name: "Vitamina E", benefit: "Acelera a cicatrização e regeneração de rachaduras dolorosas." }
            ],
            gloss: {
                description: "O Gloss Labial Lash and Beauty é um tratamento de saúde com brilho tridimensional, enriquecido com Ácido Hialurônico, Squalane e Vitamina E. Não resseca com o uso.",
                versions: [
                    { name: "Fresh Mint", details: "Translúcido (incolor), mentolado e extremamente refrescante. Perfeito para usar puro ou por cima de batom." },
                    { name: "Coco & Vanilla", details: "Fragrância doce e sabor de sorvete, possui um tom avermelhado translúcido elegante que realça a saúde labial." }
                ]
            },
            protocols: {
                spa: "Protocolo Spa dos Lábios Avançado:\n1. Higienize com a **Espuma de Limpeza TOTAL CARE** para otimizar em até 300% a absorção dos ativos.\n2. Aplique o esfoliante **Scrub de Arroz** massageando em círculos suaves para afinar a pele labial de forma não abrasiva.\n3. Aplique o **Sérum Coco Boost** e associe a técnica de **Nanoagulhamento** usando agulhas nano que apenas massageiam sem causar cortes ou sangramento para máxima infusão de ativos.\n4. Aplique a **Butter Coco e Vanilla** para nutrição lipídica profunda. (Pode ser usada também nas sobrancelhas para hidratar e acalmar a pele pós-procedimentos).\n5. Sele tudo aplicando o **Gloss Labial** (Fresh Mint ou Coco & Vanilla) para brilho tridimensional e barreira protetora.",
                nightRoutine: "Rotina Home Care Noturna:\nLimpeza suave + aplicação combinada de Sérum Coco Boost e Butter Coco e Vanilla antes de dormir para regeneração celular profunda das fibras labiais durante o sono."
            },
            prices: {
                gloss: "R$ 39,99 (ou R$ 37,99 via Pix)",
                serumReVita: "R$ 109,90",
                note: "Os preços podem sofrer alterações. Para conferir os valores atualizados e fechar sua compra, consulte o site oficial da **Lash Shop Brasil** em **www.lashshopbrasil.com.br**."
            },
            commercial: {
                coupon: "LIPS10",
                website: "www.lashshopbrasil.com.br",
                whatsapp: ["(37) 99134-2113", "(31) 98772-9581"]
            }
        },
        otherProducts: [
            { name: "Balm Fix — Pomada Modeladora de Sobrancelhas", description: "Enriquecida com ativos de tratamento que nutrem a fibra capilar das sobrancelhas enquanto alinham os pelos, proporcionando efeito de Brow Lamination temporário. Perfeita para finalizações em cabine e revenda home care." },
            { name: "Máscara de Cílios LASH FILLER (Complex 3D)", description: "Tratamento de cílios diário. Dá volume, trata, nutre e regenera os fios. Resistente à água, mas removível em forma de tubinhos na água morna sem borrar. Fantástica após Lash Lifting!" },
            { name: "Espuma de Limpeza TOTAL CARE", description: "Espuma para higienização completa da face, cílios, sobrancelhas e lábios antes de procedimentos. Melhora em até 300% a absorção de ativos." },
            { name: "ReVita Sérum Capilar (30ml)", description: "Loção científica premium que estimula o crescimento capilar acelerado, fortalecendo a raiz e combatendo a queda de cabelo." }
        ]
    },

    currentMenu: 'main',

    // Nova estrutura de navegação dinâmica por submenus
    navigationMenus: {
        main: [
            { text: "👁️ Cílios", action: "submenu", target: "cilios" },
            { text: "✨ Sobrancelhas", action: "submenu", target: "sobrancelhas" },
            { text: "💋 Lábios", action: "submenu", target: "labios" },
            { text: "🧴 Estética & Pele", action: "submenu", target: "estetica" },
            { text: "💅 Unhas & Make", action: "submenu", target: "unhas_make" },
            { text: "💰 Desconto & Compras", action: "query", query: "preço" }
        ],
        cilios: [
            { text: "👁️ O que é Lash Lifting?", action: "query", query: "lash_lifting" },
            { text: "✨ Volume Russo vs. Brasileiro", action: "query", query: "extension_cilios" },
            { text: "🧴 Máscara Lash Filler 3D", action: "query", query: "lash_filler" },
            { text: "🧼 Como higienizar os cílios", action: "query", query: "higienizar_cilios" },
            { text: "🔙 Menu Principal", action: "submenu", target: "main" }
        ],
        sobrancelhas: [
            { text: "🧴 Modelador Balm Fix", action: "query", query: "balm_fix" },
            { text: "🌿 Design com Henna", action: "query", query: "design_henna" },
            { text: "💫 O que é Brow Lamination?", action: "query", query: "brow_lamination" },
            { text: "🍦 Butter nas Sobrancelhas", action: "query", query: "butter_sobrancelhas" },
            { text: "🔙 Menu Principal", action: "submenu", target: "main" }
        ],
        labios: [
            { text: "💋 Técnicas de Lips Design", action: "query", query: "lips_design" },
            { text: "✨ Spa dos Lábios Avançado", action: "query", query: "spa" },
            { text: "🧪 Ingredientes & Ativos Nobres", action: "query", query: "ingredientes" },
            { text: "🍦 Sabores do Gloss Labial", action: "query", query: "gloss" },
            { text: "🔙 Menu Principal", action: "submenu", target: "main" }
        ],
        estetica: [
            { text: "🧼 Limpeza com Total Care", action: "query", query: "total_care" },
            { text: "💆 Passos da Limpeza de Pele", action: "query", query: "limpeza_pele" },
            { text: "🧴 Skincare Diário Científico", action: "query", query: "skincare" },
            { text: "🔙 Menu Principal", action: "submenu", target: "main" }
        ],
        unhas_make: [
            { text: "💅 Unhas em Gel & Fibra", action: "query", query: "unhas_gel" },
            { text: "🧼 Biossegurança na Manicure", action: "query", query: "unhas_seguranca" },
            { text: "💄 Make de Alta Durabilidade", action: "query", query: "preparacao_make" },
            { text: "🔙 Menu Principal", action: "submenu", target: "main" }
        ]
    },

    init() {
        if (this.isInitialized) return;

        this.chatDrawer = document.getElementById('ia-chat-drawer');
        this.chatMessages = document.getElementById('ia-chat-messages');
        this.chatInput = document.getElementById('ia-chat-input');
        this.chatForm = document.getElementById('ia-chat-input-form');
        this.suggestionsContainer = document.getElementById('ia-chat-suggestions');
        this.fab = document.getElementById('ia-fab');

        if (!this.chatDrawer || !this.chatMessages || !this.chatInput || !this.chatForm || !this.fab) {
            console.error('Elementos do Chatbot da IA não foram encontrados no DOM.');
            return;
        }

        // Eventos
        this.fab.addEventListener('click', () => this.toggleChat());
        document.getElementById('btn-close-ia-chat')?.addEventListener('click', () => this.closeChat());
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUserSubmit();
        });

        this.renderSuggestions('main');
        this.sendInitialMessage();
        this.isInitialized = true;
    },

    toggleChat() {
        if (this.chatDrawer.classList.contains('pointer-events-none')) {
            this.openChat();
        } else {
            this.closeChat();
        }
    },

    openChat() {
        this.chatDrawer.classList.remove('pointer-events-none', 'translate-y-10', 'opacity-0');
        this.chatDrawer.classList.add('translate-y-0', 'opacity-100');
        this.chatInput.focus();
        
        // Sempre resetar para o menu principal ao abrir o chat
        this.renderSuggestions('main');

        // Remove badge de notificação pendente do FAB ao abrir
        const ping = this.fab.querySelector('.animate-ping');
        const badge = this.fab.querySelector('.bg-emerald-500:not(.animate-ping)');
        if (ping) ping.remove();
        if (badge) badge.remove();
    },

    closeChat() {
        this.chatDrawer.classList.add('pointer-events-none', 'translate-y-10', 'opacity-0');
        this.chatDrawer.classList.remove('translate-y-0', 'opacity-100');
    },

    renderSuggestions(menuKey = 'main') {
        this.currentMenu = menuKey;
        this.suggestionsContainer.innerHTML = '';
        
        // Reinicia a animação de transição dos chips para engajar a micro-animação
        this.suggestionsContainer.classList.remove('animate-chips-transition');
        void this.suggestionsContainer.offsetWidth; // Força reflow
        this.suggestionsContainer.classList.add('animate-chips-transition');

        const items = this.navigationMenus[menuKey] || this.navigationMenus.main;
        
        items.forEach(item => {
            const chip = document.createElement('button');
            chip.className = "px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border border-slate-200/50 flex-shrink-0 cursor-pointer";
            chip.textContent = item.text;
            
            chip.addEventListener('click', () => {
                if (item.action === "submenu") {
                    this.renderSuggestions(item.target);
                } else if (item.action === "query") {
                    this.chatInput.value = item.text;
                    this.handleUserSubmit(item.query);
                }
            });
            this.suggestionsContainer.appendChild(chip);
        });
    },

    sendInitialMessage() {
        const welcomeText = `Olá! Sou a **Consultoria IA** do **Studiobeauty** 🌸✨\n\nEstou aqui para ajudar você a dominar todos os segredos do nosso ecossistema de beleza modular de alta performance! Explore as principais especialidades do nosso Studio:\n\n- 👁️ **Cílios:** Lash Lifting, Volume Russo e retenção impecável de extensões.\n- ✨ **Sobrancelhas:** Brow Lamination, Design com Henna e Balm Fix.\n- 💋 **Lábios:** Spa dos Lábios Avançado e volumetria com o Kit Lips.\n- 🧴 **Estética & Pele:** Protocolos científicos de Limpeza de Pele Profunda e cuidados diários.\n- 💅 **Unhas & Make:** Alongamento em Gel/Fibra, biossegurança rigorosa e blindagem de pele para Make de noiva.\n\nEscolha uma das categorias abaixo ou digite sua dúvida técnica ou comercial!`;
        this.appendMessage(welcomeText, 'bot');
    },

    appendMessage(text, sender) {
        const msgWrapper = document.createElement('div');
        msgWrapper.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} w-full animate-fade-in`;

        const bubble = document.createElement('div');
        bubble.className = `max-w-[85%] px-4 py-3 text-sm shadow-sm leading-relaxed ${sender === 'user' ? 'ia-bubble-client' : 'ia-bubble-bot'}`;
        
        // Converte o formato markdown básico do texto para HTML
        bubble.innerHTML = this.markdownToHtml(text);

        msgWrapper.appendChild(bubble);
        this.chatMessages.appendChild(msgWrapper);
        this.scrollToBottom();
    },

    showTypingIndicator() {
        if (this.isTyping) return;
        this.isTyping = true;

        const indicator = document.createElement('div');
        indicator.id = 'ia-typing-indicator';
        indicator.className = 'flex justify-start w-full animate-fade-in';
        indicator.innerHTML = `
            <div class="px-4 py-3 ia-bubble-bot shadow-sm flex items-center">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>`;
        this.chatMessages.appendChild(indicator);
        this.scrollToBottom();
    },

    hideTypingIndicator() {
        const indicator = document.getElementById('ia-typing-indicator');
        if (indicator) {
            indicator.remove();
        }
        this.isTyping = false;
    },

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    },

    markdownToHtml(text) {
        if (!text) return '';
        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Negritos **texto**
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Tópicos - item ou * item
        html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li class="ml-4 list-disc mt-1">$1</li>');

        // Listas ordenadas 1. item
        html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li class="ml-4 list-decimal mt-1">$1</li>');

        // Quebras de linha
        html = html.replace(/\n/g, '<br>');

        return html;
    },

    handleUserSubmit(forceQuery = null) {
        const queryText = this.chatInput.value.trim();
        if (!queryText && !forceQuery) return;

        this.chatInput.value = '';
        if (queryText) {
            this.appendMessage(queryText, 'user');
        }

        this.showTypingIndicator();

        // Simula delay natural da IA
        setTimeout(() => {
            const rawQuery = forceQuery || queryText;
            const response = this.getResponse(rawQuery);
            this.hideTypingIndicator();
            this.appendMessage(response, 'bot');
        }, 800);
    },

    getResponse(query) {
        const intents = [
            {
                name: "what_is_kit",
                keywords: ["o que e", "kit lips", "o que significa", "explicar kit", "como funciona", "sobre o kit", "o que vem", "definicao", "kit labial", "apresente"],
                score: 0,
                response: `O **Kit Labial Lash and Beauty Lips (Kit Lips)** é uma solução de cuidados premium de alto padrão, ideal tanto para uso diário em casa (Home Care) quanto em cabine profissional do **Studiobeauty** 🌸✨\n\nEle é estruturado em **4 etapas sinérgicas**:\n\n1. **Esfoliação (Scrub de Arroz):** Remove células mortas de forma suave e não abrasiva.\n2. **Hidratação e Nutrição profunda (Sérum Coco Boost):** Devolve a elasticidade e contorno celular através de ativos de alta performance.\n3. **Proteção e Regeneração (Butter Coco e Vanilla):** Blend nutritivo e cicatrizante de manteigas e óleos nobres.\n4. **Finalização e Selagem (Gloss Reconstrutor):** Criação de uma película protetora com brilho tridimensional luxuoso e duradouro.\n\nQuer saber quais ingredientes compõem essa fórmula rica? Digite **"Ingredientes"** ou selecione no menu de Lábios!`
            },
            {
                name: "spa_dos_labios",
                keywords: ["spa", "protocolo", "passo a passo", "cabine", "aplicacao", "procedimento", "como usar", "como aplicar", "hidra gloss", "hidragloss", "passo", "etapas", "nanoagulhamento", "agulha nano"],
                score: 0,
                response: `Aqui está o **Protocolo Profissional do Spa dos Lábios com Nanoagulhamento** para encantar suas clientes e gerar um over-delivery impecável no **Studiobeauty** 💋🏆:\n\n1. **Higienização Profunda:** Prepare a área com a **Espuma de Limpeza TOTAL CARE** para remover sujidades e otimizar em até 300% a absorção dos ativos.\n2. **Afinamento Mecânico (Scrub de Arroz):** Aplique o esfoliante labial fazendo massagens circulares delicadas de forma suave para eliminar a pele seca sem machucar.\n3. **Nanoagulhamento Hidratante (Opcional & Premium):** Aplique o **Sérum Coco Boost** utilizando uma caneta com cartucho de **agulhas nano** (que apenas massageiam a epiderme por vibração, sem causar cortes ou sangramentos) para indução profunda dos ativos.\n4. **Nutrição Labial:** Aplique uma camada generosa da **Butter Coco e Vanilla** para restaurar a elasticidade. (Essa Butter também é incrível para ser usada nas sobrancelhas pós-design para acalmar a pele!).\n5. **Brilho & Selagem:** Finalize aplicando o **Gloss Labial** (Fresh Mint ou Coco & Vanilla) para dar volume visual 3D e blindagem protetora de longa duração.\n\nEste protocolo é perfeito para ser feito enquanto a cliente aguarda cílios ou sobrancelhas!`
            },
            {
                name: "ingredients",
                keywords: ["ingredientes", "ativos", "composicao", "formula", "cacau", "karite", "pracaxi", "semente de uva", "vitamina e", "esqualano", "squalane", "oleos", "natural", "raffermine", "vitamina c", "niacinamida", "pantenol"],
                score: 0,
                response: `O segredo do **Kit Lips** do **Studiobeauty** está em sua formulação científica rica em ativos biológicos premium e nanotecnologia 🧪🌿:\n\n- **RAFFERMINE®:** Ativo firmador de alta tecnologia que renova a matriz extracelular dos lábios, combatendo rugas e flacidez labial.\n- **Ácido Hialurônico:** Retém até 1.000x seu peso em água, promovendo volumetria visual e preenchimento por hidratação profunda.\n- **Pantenol (Vitamina B5):** Emoliente potente de ação anti-inflamatória e cicatrizante que acelera a regeneração celular pós-esfoliação.\n- **Vitamina C:** Poderoso antioxidante que clareia hiperpigmentações, uniformizando o tom e estimulando o colágeno.\n- **Niacinamida (Vitamina B3):** Melhora a elasticidade, acalma e uniformiza perfeitamente a derme labial.\n- **Squalane (Esqualano):** Emoliente nobre que protege a barreira de hidratação e evita a perda de água transepidérmica.\n- **Manteiga de Cacau & Karité:** Nutrição celular profunda com emoliência física que previne ressecamentos severos.\n- **Óleos Nobres (Coco, Pracaxi, Macadâmia e Semente de Uva):** Blend cicatrizante, antibacteriano e antioxidante que restaura a elasticidade labial profunda.\n- **Vitamina E:** Promove a cicatrização rápida de rachaduras dolorosas em sinergia com o esqualano.`
            },
            {
                name: "gloss",
                keywords: ["gloss", "sabores", "fragrancias", "mint", "coco & vanilla", "fresh mint", "baunilha", "translucido", "brilho", "cor"],
                score: 0,
                response: `O **Gloss Labial Lash and Beauty** é muito mais que um brilho: ele é um tratamento labial ativo que sela a hidratação com Ácido Hialurônico, Squalane e Vitamina E 🍦🌱!\n\nEle está disponível em duas versões incríveis:\n\n1. **Fresh Mint (Translúcido):** Extremamente refrescante, mentolado e 100% incolor. Perfeito para uso diário, não altera a cor de batons e dá sensação de lábios revigorados.\n2. **Coco & Vanilla (Red Translúcido):** Possui um aroma e sabor doce irresistível de sorvete. Oferece uma coloração avermelhada translúcida suave, que dá tom saudável e jovem aos lábios.\n\nAmbos proporcionam brilho tridimensional luxuoso sem deixar os lábios colando ou secos!`
            },
            {
                name: "pricing_and_buy",
                keywords: ["preco", "valor", "comprar", "onde comprar", "site", "onde vende", "revenda", "lucro", "custo", "pagar", "adquirir", "desconto", "cupom", "lash shop", "lashshop"],
                score: 0,
                response: `💰 **Preços de Referência & Onde Adquirir** 💰\n\nNossos valores de referência para venda no varejo são:\n- **Gloss Labial (Mint / Coco & Vanilla):** R$ 39,99 (ou R$ 37,99 via Pix)\n- **Sérum Capilar ReVita Complex 3D:** R$ 109,90\n\n⚠️ **IMPORTANTE:** Para consultar a tabela completa de preços atualizados, promoções vigentes e adquirir seus produtos oficiais, **consulte o site oficial da Lash Shop Brasil** em:\n🔗 **[www.lashshopbrasil.com.br](http://www.lashshopbrasil.com.br)**\n\n🎁 **Cupom Especial de Desconto:** Use o cupom **LIPS10** no checkout e garanta 10% de desconto em suas compras!\n\nSe preferir falar com um atendente comercial via WhatsApp para compras corporativas ou no atacado, entre em contato:\n- 📞 (37) 99134-2113\n- 📞 (31) 98772-9581`
            },
            {
                name: "sales_tips",
                keywords: ["venda", "vender", "como vender", "lucrar", "lucro", "marketing", "atrair", "fidelizar", "oferecer", "promover", "cobrar"],
                score: 0,
                response: `📈 **Dicas Comerciais do Studiobeauty para Alavancar sua Receita** 📈\n\nO Kit Lips é uma máquina de lucro e fidelização para o seu estúdio de beleza. Aqui estão estratégias de ouro:\n\n1. **Estratégia de Over-delivery:** Ofereça a esfoliação e a hidratação labial como um *mimo surpresa* durante a aplicação de cílios ou sobrancelhas. A cliente ficará impressionada com o carinho e o resultado imediato!\n2. **Demonstração Ativa:** Tenha sempre provadores do **Gloss Coco & Vanilla** (com aquela corzinha saudável e sabor de sorvete) e do **Fresh Mint** na sua recepção. Peça para a cliente experimentar após o procedimento.\n3. **Upselling no Checkout:** No momento do pagamento, comente: *"Para manter o efeito do Spa dos Lábios que fizemos hoje em cabine por muito mais tempo, eu recomendo levar esse Gloss Labial para usar na sua bolsa. Tenho as duas versões a pronta entrega!"*\n4. **Combos Exclusivos:** Crie o procedimento *"Lash & Lips Spa"* ou *"Brow & Lips Spa"* cobrando um pequeno valor adicional (ex: R$ 25 a R$ 40) para agregar a hidratação labial profunda ao serviço de cílios ou sobrancelhas. Isso aumenta o seu ticket médio sem exigir muito tempo de trabalho!`
            },
            {
                name: "other_products",
                keywords: ["outros produtos", "revita", "lash filler", "total care", "mascara de cilios", "capilar", "crescimento", "espuma de limpeza", "espuma", "ciliolifting", "lifting"],
                score: 0,
                response: `Além do Kit Lips, a linha do **Studiobeauty** conta com produtos espetaculares de alto padrão para tratamento facial, cílios e cabelos 🌟:\n\n1. **Espuma de Limpeza TOTAL CARE:** Essencial para higienização pré-procedimento. Limpa profundamente face, cílios, sobrancelhas e lábios, aumentando a permeação de ativos em até 300%. Perfeita para revenda home care diária!\n2. **Máscara de Cílios LASH FILLER (Complex 3D):** Enriquecida com Complex 3D, trata, nutre e encorpa os fios naturais. Resistente à água mas sai em tubinhos no banho com água morna. Incrível para clientes pós-Lash Lifting, pois estende a curvatura natural.\n3. **ReVita Sérum Capilar (30ml):** Formulação científica que estimula e acelera o crescimento capilar, bioestimulando o bulbo e combatendo a queda.\n\nTodos estes produtos podem ser adquiridos no site **www.lashshopbrasil.com.br** com o cupom **LIPS10**!`
            },
            {
                name: "contacts",
                keywords: ["contato", "telefone", "whatsapp", "suporte", "atendimento", "falar com alguem", "ajuda", "vendedor", "email"],
                score: 0,
                response: `Se precisar falar diretamente com o suporte comercial ou atendimento oficial da marca, você pode acionar os seguintes canais 📞✨:\n\n- **WhatsApp Comercial (unidade 1):** (37) 99134-2113\n- **WhatsApp Comercial (unidade 2):** (31) 98772-9581\n- **Site Oficial:** [www.lashshopbrasil.com.br](http://www.lashshopbrasil.com.br)\n\nLembre-se de utilizar o cupom **LIPS10** se for fazer compras online no site!`
            },
            {
                name: "lips_design",
                keywords: ["lips design", "dicas lips", "lips designer", "ebook lips", "dicas do ebook", "ebook lash and beauty", "tecnicas de lips", "estetica labial", "hidratacao labial", "volumetria", "hidra gloss"],
                score: 0,
                response: `💋 **Técnicas de Lips Design — Diretrizes do Ebook Oficial** 📘✨\n\nPara atuar como uma **Lips Designer** de excelência e entregar lábios volumosos, saudáveis e desenhados, o e-book oficial da **Studiobeauty** estabelece as seguintes práticas:\n\n1. **Afinamento e Permeação:** Para aumentar a capacidade de absorção labial, utilize a **Espuma TOTAL CARE** seguida de uma esfoliação mecânica fina com o **Scrub de Arroz**. Isso afina suavemente o estrato córneo labial.\n2. **Técnica de Nanoagulhamento:** Durante a aplicação do **Sérum Coco Boost** (rico em Raffermine e Ácido Hialurônico), utilize uma caneta de nanoagulhamento com cartucho de **agulhas nano**. Essa vibração mecânica acelera a permeação dos ativos nas camadas mais profundas sem causar qualquer corte ou sangramento!\n3. **Volumetria por Hidratação Extrema:** O verdadeiro segredo do *Hidra Gloss* é reter água nas células. A combinação de Ácido Hialurônico com Squalane garante que os lábios retenham a umidade, prevenindo rachaduras e preenchendo as marcas de expressão labiais.\n4. **Revenda Estratégica:** Faça o procedimento em cabine e oriente a cliente a levar o **Sérum** e o **Gloss** para uso diário Home Care. O uso do Sérum e da Butter associados antes de dormir promove uma regeneração celular intensa durante o sono!`
            },
            {
                name: "balm_fix",
                keywords: ["balm fix", "pomada modeladora", "sobrancelhas", "brow lamination", "efeito lamination", "pelos sobrancelhas", "alinhamento", "design de sobrancelha"],
                score: 0,
                response: `🧴 **Balm Fix — Pomada Modeladora de Sobrancelhas** 🌸✨\n\nO **Balm Fix** é uma pomada modeladora de sobrancelhas de altíssima performance:\n\n- **Tratamento Integrado:** Enriquecida com ativos que nutrem profundamente os pelos enquanto alinham a fibra capilar.\n- **Efeito Brow Lamination Temporário:** Ideal para quem deseja aquele efeito alinhado, cheio ("fluffy") e estruturado de forma duradoura ao longo do dia, sem a necessidade de química permanente.\n- **Versatilidade:** Excelente para finalização de atendimentos de design em cabine e maquiagem profissional, além de ser um produto indispensável para revenda home care diária.\n\nAdquira o seu com o cupom **LIPS10** no site oficial **www.lashshopbrasil.com.br**!`
            },
            {
                name: "lash_lifting",
                keywords: ["lash lifting", "lifting de cilios", "ciliolifting", "curvatura natural", "curvar cilios", "anatomica", "hidratacao profunda cilios", "lash filler"],
                score: 0,
                response: `👁️ **Lash Lifting & Reconstrução Científica com Lash Filler 3D** ✨\n\nO **Lash Lifting** é uma técnica inovadora que eleva, alinha e acentua a curvatura anatômica natural dos cílios desde a raiz, proporcionando um olhar marcante por semanas sem a necessidade de extensões artificiais.\n\n- **Processo Anatômico:** O procedimento altera quimicamente a estrutura de pontes de dissulfeto dos fios de forma controlada, fixando-os em moldes de silicone especiais.\n- **Nutrição & Reconstrução com Máscara Lash Filler 3D (Complex 3D):** Essencial pós-procedimento. A máscara penetra no córtex do fio, proporcionando uma hidratação profunda e promovendo o engrossamento dos cílios naturais em até **24%** após três aplicações. Além disso, reverte com eficácia danos químicos residuais.\n- **Home Care:** Recomende à sua cliente escovar diariamente os cílios e aplicar a Máscara Lash Filler 3D como tratamento nutritivo contínuo.`
            },
            {
                name: "extension_cilios",
                keywords: ["extensao de cilios", "extensoes de cilios", "alongamento de cilios", "fio a fio", "volume russo", "volume brasileiro", "fio y", "pbt", "cola cilios", "retencao da cola", "choque de polimerizacao", "umidade cabine"],
                score: 0,
                response: `✨ **Técnicas de Extensão de Cílios & Segredos de Retenção Química** 👁️💎\n\nNo **Studiobeauty**, as técnicas de extensão de cílios são aplicadas com rigor científico e máxima segurança:\n\n1. **Técnicas e Fios Premium:**\n   - **Fio a Fio Clássico:** Aplicação de um fio sintético sobre cada cílio natural, ideal para definição e naturalidade.\n   - **Volume Russo Artesanal:** Criação manual de leques (*fans* ultra-leves e finos) para máxima densidade e preenchimento volumoso.\n   - **Volume Brasileiro:** Técnica de fios tecnológicos em formato de **Y**, fabricados em **PBT nobre** (polibutileno tereftalato), que proporcionam leveza, flexibilidade e um visual marcante.\n\n2. **Química de Retenção do Adesivo (Cola):**\n   - **Ambiente de Trabalho Controlado:** Para máxima polimerização e retenção da cola, a cabine de atendimento deve manter a umidade ideal entre **45% a 65%** e temperatura controlada de **19°C a 23°C**.\n   - **Perigo da Alta Umidade (Choque de Polimerização):** Se a umidade estiver excessiva, ocorre um choque que solidifica a cola instantaneamente por fora, deixando a base enfraquecida e opaca, o que causa queda precoce.\n   - **Perigo da Baixa Umidade:** Se o ar estiver muito seco, a cura do adesivo é retardada, fazendo com que escorra, crie fios ou aumente a inalação de vapores irritantes pela cliente.\n\n3. **Preparação com Espuma TOTAL CARE:** A higienização prévia e obrigatória com a Espuma Total Care elimina biofilme, gorduras naturais e resíduos de maquiagem, garantindo uma acoplagem perfeita e duradoura.`
            },
            {
                name: "higienizar_cilios",
                keywords: ["higienizar cilios", "limpar cilios", "lavar cilios", "como higienizar", "biofilme cilios", "gordura natural cilios", "espuma total care"],
                score: 0,
                response: `🧼 **Como Higienizar Cílios Corretamente (Cabine e Home Care)** 👁️✨\n\nA higienização de cílios é essencial tanto para o sucesso de novos procedimentos quanto para a durabilidade e saúde das extensões:\n\n1. **Por que higienizar é obrigatório?**\n   A base dos cílios naturalmente acumula **biofilme** (colônias bacterianas), gordura natural (sebo), células mortas e resíduos de poluição. Se a extensão for aplicada sobre essa barreira, a aderência da cola cai drasticamente.\n\n2. **Protocolo com Espuma TOTAL CARE:**\n   A higienização em cabine deve ser feita com a **Espuma de Limpeza TOTAL CARE** do **Studiobeauty**:\n   - Aplique uma nuvem de espuma sobre os olhos fechados.\n   - Com um pincel de cerdas macias, faça movimentos circulares e de varredura suaves da raiz para as pontas para desprender os resíduos.\n   - Enxágue abundantemente com soro fisiológico ou água destilada fria e seque com ventilador manual frio.\n\n3. **Cuidado Diário em Casa:**\n   Oriente sua cliente a lavar as extensões em casa diariamente com água fria e sabonete neutro (ou a própria Espuma Total Care), secando delicadamente com toalha sem esfregar e escovando-as com escovinha limpa uma vez ao dia.`
            },
            {
                name: "lash_filler",
                keywords: ["lash filler", "mascara lash filler", "complex 3d", "hidratacao profunda cilios", "engrossar cilios"],
                score: 0,
                response: `🧴 **Máscara Lash Filler (Complex 3D) — Tratamento Científico de Cílios** 🌟👁️\n\nA **Máscara Lash Filler 3D** é a revolução em cosmética regenerativa diária para cílios naturais:\n\n- **Tratamento Clínico Diário:** Não é apenas uma maquiagem, mas um tratamento de alto padrão formulado com o ativo exclusivo **Complex 3D**.\n- **Eficácia Comprovada:** Penetra profundamente na cutícula capilar, promovendo o engrossamento dos cílios naturais em até **24%** com o uso contínuo.\n- **Ação Reparadora:** Reconstrói e nutre as fibras capilares, revertendo danos causados por procedimentos químicos agressivos (como lash lift incorreto ou remoções inadequadas).\n- **Remoção Inteligente (Tecnologia Tubing):** Extremamente resistente à água fria e suor ao longo do dia (não escorrega nem borra), mas se solta facilmente em forma de pequenos tubinhos sob água morna no banho, sem agredir os cílios.\n\nPerfeita para revenda pós-Lash Lifting ou para clientes que desejam recuperar a saúde dos fios!`
            },
            {
                name: "total_care",
                keywords: ["total care", "espuma total care", "espuma de limpeza total care", "camomila", "calendula", "hialuronico", "ph micelar"],
                score: 0,
                response: `🧼 **Espuma de Limpeza TOTAL CARE — Limpeza Ativa & Preparação** 🧴🌸\n\nA **Espuma de Limpeza TOTAL CARE** é um produto indispensável do **Studiobeauty** para preparação profissional de pele e pelos:\n\n- **Fórmula Científica Calmante:** Enriquecida com **camomila, calêndula e ácido hialurônico**, possui ação calmante, cicatrizante e hidratante profunda.\n- **Tecnologia Micelar & pH Balanceado:** Remove as micropartículas de sujeira, maquiagem e oleosidade excessiva sem agredir a barreira lipídica da pele ou causar ardência ocular.\n- **Otimização de Absorção (+300%):** Prepara a pele em cabine, eliminando resíduos de queratina e desobstruindo poros. Isso otimiza em até **300%** a absorção e eficácia de ativos nanotecnológicos aplicados posteriormente (como séruns e cremes).\n- **Multifuncional:** Perfeita para higienizar cílios antes da extensão, sobrancelhas antes da henna/lamination, e face completa antes de limpezas de pele.`
            },
            {
                name: "limpeza_pele",
                keywords: ["limpeza de pele", "limpeza profunda", "passos limpeza", "protocolo limpeza", "vapor de ozonio", "comedoes", "alta frequencia", "trietanolamina", "gaze", "ozonio"],
                score: 0,
                response: `💆 **Protocolo Científico de Limpeza de Pele Profunda em 7 Passos** 🧴✨\n\nNo **Studiobeauty**, a limpeza de pele é conduzida sob as melhores diretrizes estéticas e científicas para garantir a renovação celular sem danos dermocosméticos:\n\n1. **Higienização Ativa (Passo 1):** Limpeza suave da face com a **Espuma TOTAL CARE** para remover sujidades superficiais e resíduos hidrossolúveis.\n2. **Afinamento Epitelial (Passo 2):** Esfoliação física delicada com o **Scrub de Arroz** para remover células mortas de forma homogênea e não abrasiva.\n3. **Emoliência Química (Passo 3):** Aplicação de creme ou loção emoliente à base de **trietanolamina** sob compressas de gaze e máscara térmica/vapor de ozônio por **15 minutos** para dilatar os óstios e amolecer o sebo.\n4. **Extração Minuciosa (Passo 4):** Remoção manual cuidadosa de comedões (cravos) e miliuns utilizando gaze estéril nas pontas dos dedos, garantindo pressão adequada para não romper capilares cutâneos.\n5. **Alta Frequência Antisséptica (Passo 5):** Aplicação do aparelho de alta frequência com eletrodo de vidro gerador de ozônio. Possui ação altamente bactericida, fungicida, antisséptica e cicatrizante para os poros extraídos.\n6. **Calmante Dérmico (Passo 6):** Massagem suave com a **Butter Coco e Vanilla** (rica em óleo de pracaxi e coco) para acalmar a derme irritada, reduzir vermelhidões instantaneamente e acelerar a regeneração dérmica.\n7. **Nutrição & Proteção (Passo 7):** Aplicação do **Sérum Capilar/Facial Coco Boost** enriquecido com ácido hialurônico para nutrição profunda, seguido de fotoproteção FPS de alta cobertura.`
            },
            {
                name: "skincare",
                keywords: ["skincare", "cuidados diarios", "rotina facial", "limpeza micelar", "barreira biologica", "hidratacao facial"],
                score: 0,
                response: `🧴 **Rotina Científica de Skincare Diário — Studiobeauty** 🌸🌿\n\nManter uma pele radiante e jovem requer uma rotina de cuidados baseada em ciência e sinergia de ativos:\n\n1. **Passo 1: Limpeza Micelar Ativa (Manhã e Noite):**\n   Lave o rosto com a **Espuma TOTAL CARE**. Ela remove impurezas e o excesso de sebo sem agredir o manto hidrolipídico, acalmando a pele com camomila e calêndula.\n\n2. **Passo 2: Hidratação Ativa Profunda (Manhã e Noite):**\n   With a pele limpa e levemente úmida, aplique de 3 a 4 gotas do **Sérum Coco Boost**. Enriquecido com **Raffermine e Ácido Hialurônico**, ele atua preenchendo as linhas finas, combatendo a flacidez e devolvendo a elasticidade celular.\n\n3. **Passo 3: Selagem e Nutrição Lipídica (Noite):**\n   Antes de dormir, aplique uma fina camada da **Butter Coco e Vanilla** nas áreas mais secas do rosto ou linhas de expressão. O blend nutritivo de manteigas de cacau/karité e óleo de pracaxi cria uma barreira biológica saudável que impede a perda de água transepidérmica durante o sono.\n\n4. **Passo 4: Proteção Solar (Obrigatório pela Manhã):**\n   Sempre finalize sua rotina diurna aplicando protetor solar facial adequado ao seu tipo de pele.`
            },
            {
                name: "design_henna",
                keywords: ["design de sobrancelha", "design com henna", "henna sobrancelha", "henna degrade", "brow mapping", "mapeamento facial", "phi aurea", "paquimetro digital", "pinçamento egípcio"],
                score: 0,
                response: `🌿 **Design de Sobrancelhas, Brow Mapping & Henna Degradê Premium** ✨📐\n\nNo **Studiobeauty**, o design de sobrancelhas é uma obra de simetria personalizada e precisão técnica:\n\n1. **Brow Mapping (Mapeamento Facial):**\n   Utilizamos paquímetro digital e marcação com linha pigmentada para desenhar o mapeamento facial com base na **Proporção Áurea PHI** (simetria matemática universal adaptada aos traços naturais do seu rosto).\n2. **Pinçamento Egípcio e Epilação:**\n   Eliminamos as penugens mais finas e curtas através de pinçamento de precisão e epilação egípcia com linha, definindo um contorno limpo e elegante sem irritar excessivamente os folículos.\n3. **Aplicação de Henna Degradê Premium:**\n   Aplicamos henna de altíssima qualidade enriquecida com ativos reconstrutores. A aplicação é feita na técnica degradê (mais clara no início e intensificada no arco e cauda), criando um efeito sombreado natural que realça a densidade dos pelos sem pesar o olhar.\n4. **Finalização Calmante:**\n   Aplicamos a **Butter Coco e Vanilla** para regenerar instantaneamente a pele sensibilizada e acalmar vermelhidões.`
            },
            {
                name: "brow_lamination",
                keywords: ["brow lamination", "lamination sobrancelhas", "alisamento de sobrancelhas", "tioglicolato de amonia", "sobrancelha fluffy", "cuidados pos brow"],
                score: 0,
                response: `💫 **Brow Lamination — Sobrancelhas Alinhadas & Estilizadas** 🧴✨\n\nA **Brow Lamination** é uma técnica inovadora que alinha e estiliza quimicamente os pelos das sobrancelhas para cima, proporcionando um efeito encorpado, volumoso e moderno (efeito "fluffy" ou "wild brows"):\n\n- **Como funciona?** Utiliza um agente redutor de **tioglicolato de amônia** para quebrar as pontes químicas dos pelos, tornando-os flexíveis e fáceis de modelar na direção desejada. Em seguida, aplica-se o neutralizante para fixar a nova posição.\n- **Nutrição Imediata:** Pós-química, é fundamental nutrir profundamente as sobrancelhas com óleos ricos para restaurar a integridade capilar. No Studiobeauty, utilizamos a **Butter Coco e Vanilla** pós-procedimento para esta finalidade.\n- **Cuidados nas Primeiras 24 Horas:**\n  - Não molhar as sobrancelhas.\n  - Evitar suor intenso, saunas e banhos muito quentes.\n  - Não deitar com o rosto pressionado no travesseiro.\n  - Pentear os pelos diariamente com a escovinha.\n- **Dica Home Care:** O uso diário da pomada **Balm Fix** ajuda a manter os pelos alinhados no lugar com fixação e tratamento continuado!`
            },
            {
                name: "butter_sobrancelhas",
                keywords: ["butter nas sobrancelhas", "butter sobrancelha", "pos design sobrancelha", "acalmante sobrancelha", "pracaxi sobrancelha"],
                score: 0,
                response: `🍦 **Uso da Butter Coco e Vanilla pós-Design de Sobrancelhas** 🌿🌸\n\nA nossa **Butter Coco e Vanilla** do **Studiobeauty** é um poderoso coringa cicatrizante e calmante:\n\n- **Ação Pós-Procedimento:** Logo após a epilação facial (com cera ou pinça) ou o design de sobrancelhas, a pele fica sensibilizada, irritada e com vermelhidões (eritema folicular).\n- **Regeneração Profunda com Pracaxi:** O **óleo de pracaxi** da Amazônia e o **óleo de coco**, ricos em ácidos graxos essenciais, criam um escudo protetor que acalma a inflamação, reduz o inchaço e acelera a cicatrização da pele.\n- **Hidratação dos Pelos:** Nutre as cutículas dos pelos das sobrancelhas, promovendo brilho, maciez e vitalidade folicular.\n- **Como aplicar:** Aplique uma gota minúscula sobre as sobrancelhas e a área epilada, massageando suavemente até completa absorção.`
            },
            {
                name: "unhas_gel",
                keywords: ["alongamento em gel", "fibra de vidro", "unhas de gel", "gel autonivelante", "tips", "moldes led uv", "unhas de fibra"],
                score: 0,
                response: `💅 **Alongamentos Premium — Unhas em Gel Autonivelante & Fibra de Vidro** ✨💎\n\nNo **Studiobeauty**, a estética de unhas une beleza, anatomia e alta durabilidade:\n\n1. **Alongamento em Gel Autonivelante:**\n   - Utiliza géis construtores de alta tecnologia e flexibilidade que se autonivelam na superfície da unha, reduzindo a necessidade de lixamento excessivo.\n   - Pode ser estruturado sobre **Tips** (extensões de plástico ABS premium coladas na ponta) ou modelado sobre **Moldes adesivos**.\n   - A polimerização e secagem ocorrem sob cabines de luz **LED/UV**, conferindo brilho vitrificado e alta resistência contra quebras.\n\n2. **Alongamento em Fibra de Vidro:**\n   - Uma técnica altamente anatômica e sofisticada, onde filamentos ultrafinos de fibra de vidro são fundidos ao gel construtor.\n   - O resultado é uma unha extremamente natural, fina e resistente, que se adapta perfeitamente ao formato do leito ungueal, ideal para quem busca durabilidade prolongada (3 a 4 semanas entre manutenções).`
            },
            {
                name: "unhas_seguranca",
                keywords: ["biosseguranca manicure", "esterilizacao autoclave", "controle quimico classe 5", "epi manicure", "mascara pff2 n95", "po de gel inalacao", "infiltracao fungos", "pseudomonas unhas", "esterilizar metais"],
                score: 0,
                response: `🧼 **Biossegurança e Saúde na Manicure — Padrão Studiobeauty** 🛡️💅\n\nA biossegurança é o pilar inegociável do **Studiobeauty** para proteger a saúde das nossas clientes e profissionais:\n\n1. **Esterilização em Autoclave:**\n   - Todos os alicates, espátulas e brocas de metal passam por limpeza prévia e são esterilizados obrigatoriamente em **Autoclave sob pressão e vapor de água** (em temperaturas de 121°C a 134°C).\n   - O controle de qualidade é auditado a cada ciclo através de **indicadores de controle químico classe 5**, que confirmam que todos os vírus (como Hepatite B e C) e bactérias resistentes foram eliminados com eficácia.\n   - *Importante:* Fornos secos (estufas) não são seguros e estão obsoletos na saúde dermatológica.\n\n2. **Uso Mandatório de EPIs & Inalação de Pó:**\n   - **Máscaras N95/PFF2 ou Triplas Descartáveis:** Obrigatórias durante o lixamento de alongamentos em gel e acrílico. O pó fino de gel e acrilato é nocivo para o trato respiratório superior e pulmões, podendo desencadear pneumoconiose ocupacional e alergias severas a longo prazo se for inalado.\n   - **Óculos de Proteção:** Protegem contra detritos de unhas e respingos de produtos químicos.\n\n3. **Prevenção de Infiltrações e Pseudomonas:**\n   - Se o alongamento em gel se descolar minimamente da unha natural e não for reparado, cria-se uma micro-câmara de umidade quente.\n   - Isso favorece a proliferação de fungos oportunos e da bactéria **Pseudomonas aeruginosa**, caracterizada por manchas esverdeadas na unha. O Studiobeauty orienta a retirada imediata e tratamento adequado em caso de infiltrações para evitar infecções no leito ungueal.`
            },
            {
                name: "preparacao_make",
                keywords: ["skin prep", "preparacao de maquiagem", "preparar pele maquiagem", "maquiagem noiva", "maquiagem formanda", "base craquelar", "evitar base craquelar", "durabilidade maquiagem", "blindagem pele"],
                score: 0,
                response: `💄 **Skin Prep & Blindagem de Pele Pré-Maquiagem de Gala** 👰✨\n\nUma maquiagem impecável para noivas, formandas e grandes festas que dure mais de **12 horas** exige uma preparação de pele (Skin Prep) científica e rica em barreira elástica hidratante:\n\n1. **Limpeza Prévia:**\n   Inicie higienizando o rosto com a **Espuma TOTAL CARE** para remover todo o sebo sem ressecar os tecidos, criando uma superfície perfeitamente limpa.\n2. **Hidratação e Controle de Oleosidade com Sérum Coco Boost:**\n   Aplique de 3 a 4 gotas do **Sérum Coco Boost** massageando toda a face. A presença do Ácido Hialurônico e do Raffermine promove uma hidratação celular profunda. Se a pele não estiver extremamente hidratada, ela tentará absorver a umidade da base líquida aplicada depois, fazendo com que a maquiagem separe, oxide ou suma rapidamente.\n3. **Evitar Craquelamento com a Butter Coco e Vanilla:**\n   Nas regiões mais secas do rosto ou com linhas de expressão ativas (como a área das olheiras, ao redor do nariz e cantos da boca), aplique uma quantidade mínima da **Butter Coco e Vanilla**.\n   - *Como atua:* O blend ultra-emoliente cria uma barreira elástica microscópica que preenche as linhas e impede que a base pesada acumule ou craquele ao longo das horas, garantindo aquele acabamento "glow" luxuoso e radiante nas fotos de alta definição.\n4. **Fixador e Blindagem:**\n   Finalize com bruma fixadora antes e depois da base para selar a blindagem facial.`
            }
        ];

        // Processa pesos das intenções
        intents.forEach(intent => {
            intent.keywords.forEach(keyword => {
                const kwNormal = this.normalizeText(keyword);
                if (query.includes(kwNormal)) {
                    intent.score += 2; // Match exato
                } else {
                    // Match parcial de termos (se a palavra-chave tiver mais de uma palavra)
                    const kwWords = kwNormal.split(' ');
                    if (kwWords.length > 1) {
                        let partialMatches = 0;
                        kwWords.forEach(word => {
                            if (word.length > 3 && query.includes(word)) {
                                partialMatches++;
                            }
                        });
                        if (partialMatches === kwWords.length) {
                            intent.score += 1.5;
                        }
                    }
                }
            });
        });

        // Ordena intenções por pontuação
        intents.sort((a, b) => b.score - a.score);

        // Seleciona a melhor se o score for maior que 0
        if (intents[0] && intents[0].score > 0) {
            return intents[0].response;
        }

        // Resposta padrão (Fallback)
        return `Hum, não tenho certeza se entendi completamente sua dúvida sobre "${rawQuery}". 🤔\n\nComo sou a Consultoria IA oficial do **Studiobeauty**, você pode me perguntar sobre toda a nossa linha de cílios, sobrancelhas, lábios e face, por exemplo:\n\n- 💋 **"Dicas de Lips Design"** para saber as diretrizes do nosso Ebook oficial.\n- ✨ **"Protocolo Spa"** para ver o passo a passo profissional com nanoagulhamento.\n- 🧴 **"Balm Fix"** ou cuidados de sobrancelhas com a Butter.\n- 🧪 **"Ingredientes"** ou ativos da nossa formulação (Raffermine, Ácido Hialurônico, etc.).\n- 🍦 **"Fragrâncias"** e sabores do nosso Gloss.\n- 📈 **"Dicas de Venda"** para faturar muito mais no seu Studio.\n- 💰 **"Preços"** e canais oficiais de compra.\n\nSe preferir, digite sua pergunta de forma diferente ou clique em um dos balões rápidos aqui embaixo!`;
    },

    normalizeText(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "") // Remove pontuações simples
            .trim();
    }
};

// Auto-inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a Consultoria IA
    IAConsultoria.init();
});
