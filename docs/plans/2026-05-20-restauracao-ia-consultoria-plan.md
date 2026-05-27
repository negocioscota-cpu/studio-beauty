# Restestruturação da Consultoria IA Studiobeauty Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reestruturar o arquivo de consultoria virtual `ia-consultoria.js` do Studiobeauty para suportar submenus de navegação dinâmica via chips flutuantes, controle de estado local de menu e um motor semântico enriquecido com informações científicas detalhadas de cílios, sobrancelhas, lábios, pele, unhas e maquiagem.

**Architecture:** A interface do chatbot usará uma máquina de estados locais na propriedade `currentMenu` do objeto `IAConsultoria`. A constante de dados `navigationMenus` estruturará os submenus aninhados de sugestões rápidas. O método `getResponse` será expandido com termos semânticos ricos e respostas científicas explicativas para os tratamentos estéticos.

**Tech Stack:** JavaScript (ES6+ nativo), HTML5 e CSS Vanilla.

---

### Task 1: Estrutura de Dados e Navegação por Submenus

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\LashBrow\js\ia-consultoria.js:87-97`

**Step 1: Definir as propriedades `currentMenu` e `navigationMenus`**
Substituir a propriedade `defaultSuggestions` por `navigationMenus` no objeto `IAConsultoria` e declarar a variável `currentMenu` iniciada como `'main'`.

```javascript
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
```

---

### Task 2: Refatorar Métodos de Renderização e Controle de Estados

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\LashBrow\js\ia-consultoria.js` (Métodos `init()`, `openChat()`, `renderSuggestions()`, `sendInitialMessage()`)

**Step 1: Refatorar `init()` e `openChat()`**
Garantir que ao iniciar ou reabrir o chat, as sugestões do menu principal (`'main'`) sejam renderizadas e o estado seja reiniciado.

```javascript
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
```

**Step 2: Refatorar `renderSuggestions(menuKey = 'main')`**
Implementar a renderização dinâmica de chips baseada no estado de submenus do `navigationMenus`, incluindo a reinicialização da classe de animação `.animate-chips-transition`.

```javascript
    renderSuggestions(menuKey = 'main') {
        this.currentMenu = menuKey;
        this.suggestionsContainer.innerHTML = '';
        
        // Reinicia a animação de transição dos chips
        this.suggestionsContainer.classList.remove('animate-chips-transition');
        void this.suggestionsContainer.offsetWidth; // Gatilho de reflow
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
```

**Step 3: Atualizar a Mensagem Inicial de Boas-vindas `sendInitialMessage()`**
Atualizar o texto para apresentar de forma charmosa o ecossistema modular do **Studiobeauty** (cílios, sobrancelhas, lábios, pele, unhas e make).

---

### Task 3: Expandir e Enriquecer as Intenções Semânticas no `getResponse`

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\LashBrow\js\ia-consultoria.js` (Método `getResponse()`)

**Step 1: Enriquecer as respostas existentes e adicionar novas intenções**
Expandir o array `intents` com respostas científicas detalhadas e precisas, cobrindo os seguintes tópicos solicitados pelo usuário:
1. `lash_lifting`: curvatura anatômica, hidratação profunda, Lash Filler 3D e reversão de danos químicos em 24%.
2. `extension_cilios` e `higienizar_cilios`: Fio a Fio clássico, Volume Russo artesanal, Volume Brasileiro (fio Y em PBT), retenção da cola com umidade ideal (45% a 65%) e temperatura (19°C a 23°C), choque de polimerização por umidade excessiva e retardo por baixa umidade. Higienização obrigatória com Espuma Total Care prévia.
3. `lash_filler`: Máscara Lash Filler 3D com Complex 3D.
4. `total_care`: Espuma de limpeza pré-procedimento. camomila, calêndula e hialurônico, pH micelar, otimização de absorção em 300%.
5. `limpeza_pele`: Protocolo científico em 7 passos de Limpeza de Pele Profunda em cabine.
6. `skincare`: Rotina de cuidados diários científicos.
7. `design_henna`: Brow Mapping com proporção PHI áurea, pinçamento egípcio e Henna degradê premium.
8. `brow_lamination`: Alisamento químico de tioglicolato de amônia e pós-procedimento das primeiras 24 horas.
9. `butter_sobrancelhas`: Aplicação da Butter Coco e Vanilla pós-design para acalmar com pracaxi e coco.
10. `unhas_gel`: Alongamento em gel autonivelante e fibra de vidro ultra-resistente.
11. `unhas_seguranca`: Biossegurança na manicure, esterilização em autoclave, controle classe 5, EPIs PFF2/N95 contra inalação do pó de gel e prevenção de infiltrações de Pseudomonas.
12. `preparacao_make`: Skin Prep e blindagem pré-make com Sérum Coco Boost e Butter Coco e Vanilla em zonas secas contra craquelamento.

---

### Task 4: Validação de Sintaxe

**Step 1: Validar sintaxe usando Node.js**
Garantir que a compilação do arquivo modificado está 100% perfeita.
Run: `node -c C:\Users\conec\OneDrive\Documentos\projetos connectai\LashBrow\js\ia-consultoria.js`
Expected: Sem erros (saída vazia).
