# Studiobeauty AI Consulting Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redirecionar completamente o chatbot e a base de conhecimento do antigo LashBrow para Studiobeauty, integrando um ecossistema modular de beleza (Cílios, Sobrancelhas, Lábios, Estética/Skincare, Unhas e Maquiagem) acessado por submenus de chips dinâmicos na interface do chat.

**Architecture:** Transição da interface de botões flutuantes para chips com lógica de submenus no JavaScript (`ia-consultoria.js`). Enriquecimento da base de dados local com intenções de busca robustas para todas as frentes de embelezamento. Atualização das bases científicas Markdown/JSON e aplicação de micro-animações CSS para transições de chips premium.

**Tech Stack:** Vanilla JS, CSS3, HTML5, Firebase Hosting.

---

### Task 1: [Base de Conhecimento] Unificar e Expandir Ativos e Protocolos das Novas Áreas de Beleza

**Files:**
- Modify: `knowledge_base/kit_lips_knowledge_base.md`
- Modify: `knowledge_base/kit_lips_knowledge_base.json`

**Step 1: Expandir o arquivo Markdown**
*   Inserir seções robustas no arquivo Markdown para cada uma das novas frentes:
    *   **Cílios (Lash):** Descrição das técnicas (Volume Russo vs Volume Brasileiro), indicações para aumento de retenção e durabilidade, uso nutritivo da Máscara Lash Filler (Complex 3D).
    *   **Sobrancelhas (Brows):** Design de Sobrancelhas (Simples e com Henna), efeito temporário e de tratamento do modelador Balm Fix, Brow Lamination, uso da Butter Coco e Vanilla pós-procedimento.
    *   **Estética & Skincare (Pele):** Higienização celular avançada com a Espuma de Limpeza TOTAL CARE (otimização de 300% em procedimentos), passos científicos da limpeza de pele profunda em cabine, cuidados preventivos home care.
    *   **Unhas & Maquiagem (Especialidades):** Dicas de biossegurança (esterilização e controle fúngico nas unhas de gel/fibra), técnicas de blindagem de pele pré-maquiagem usando o Sérum Coco Boost e Butter para noivas e eventos de gala (efeito "anti-craquelado").
*   Verificar a gramática e coesão das descrições científicas em português do Brasil (`<RULE[user_global]>`).

**Step 2: Sincronizar o arquivo JSON**
*   Atualizar o arquivo JSON de dados para refletir as mesmas expansões de produtos (`Balm Fix`, `Lash Filler`, `Total Care`), novos protocolos e taxas comerciais.

**Step 3: Commit**
```bash
git add knowledge_base/kit_lips_knowledge_base.md knowledge_base/kit_lips_knowledge_base.json
git commit -m "docs: expand knowledge base with all studiobeauty sectors (lash, brows, lips, skin, nails, makeup)"
```

---

### Task 2: [JavaScript] Implementar Interface Dinâmica de Submenus e Novas Intenções de Chat

**Files:**
- Modify: `js/ia-consultoria.js`

**Step 1: Implementar o Menu de Navegação no Código**
*   Declarar o objeto estruturado `navigationMenus` mapeando o menu principal (`main`) e submenus (`cilios`, `sobrancelhas`, `labios`, `estetica`, `unhas_make`), utilizando os ícones correspondentes:
```javascript
const navigationMenus = {
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
    // [Inserir sob a mesma lógica os submenus de sobrancelhas, labios, estetica e unhas_make...]
};
```

**Step 2: Atualizar Métodos de Renderização e Eventos**
*   Modificar a mensagem inicial de boas-vindas do assistente para abranger o ecossistema completo do **Studiobeauty** (cílios, sobrancelhas, lábios, estética facial, unhas e maquiagem).
*   Refatorar o método `renderSuggestions` para aceitar um objeto de menu específico (ex: `renderSuggestions(menuKey = 'main')`).
*   Configurar o clique dos chips:
    *   Se `chip.action === "submenu"`, atualizar os chips flutuantes chamando `renderSuggestions(chip.target)`. Adicionar classe CSS `.fade-out` e `.fade-in` para micro-animações nas trocas de estado.
    *   Se `chip.action === "query"`, enviar a consulta de busca para a engine semântica local.
*   Garantir a limpeza e recarregamento do Menu Principal sempre que o chatbot for fechado e reaberto.

**Step 3: Enriquecer a Engine de Busca Semântica (`getResponse`)**
*   Adicionar as seguintes intenções completas e detalhadas:
    1.  `lash_lifting`: Explicação de curvatura de cílios e cuidados.
    2.  `extension_cilios`: Volume Russo vs Brasileiro e aumento da retenção da cola.
    3.  `total_care`: Higienização profunda pré-procedimento.
    4.  `limpeza_pele`: Protocolo completo de limpeza profunda em cabine.
    5.  `design_henna`: Design de sobrancelhas e técnicas de aplicação.
    6.  `brow_lamination`: Alinhamento químico e cuidados pós.
    7.  `unhas_gel`: Dicas de alongamento de unhas em gel e fibra.
    8.  `unhas_seguranca`: Recomendações de biossegurança para manicures.
    9.  `preparacao_make`: Blindagem de pele anti-craquelado.
    10. `butter_sobrancelhas`: Aplicação pós-design da Butter.

**Step 4: Executar validação de sintaxe local**
*   Executar o console de verificação do Node:
    `node -c js/ia-consultoria.js`
*   Expected output: ZERO erros de compilação ou sintaxe JS.

**Step 5: Commit**
```bash
git add js/ia-consultoria.js
git commit -m "feat: implement multi-category dynamic submenu navigation and expand semantic AI capabilities in ia-consultoria.js"
```

---

### Task 3: [CSS / UI] Adicionar Micro-Animações no Troca de Submenus

**Files:**
- Modify: `css/app.css`

**Step 1: Criar animações de transição de chips**
*   Ao final de `css/app.css`, inserir estilos para micro-animações de esmaecimento e transição suave:
```css
/* Animação suave para transição de submenus e chips */
.animate-chips-transition {
    animation: chipsFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes chipsFadeIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```
*   No arquivo `js/ia-consultoria.js`, aplicar a classe `animate-chips-transition` no contêiner de chips sempre que renderizar um submenu ou resposta.

**Step 2: Commit**
```bash
git add css/app.css
git commit -m "style: add dynamic micro-animations for chatbot chip transitions in app.css"
```

---

### Task 4: [Deploy & Verificação] Publicação Firebase e Testes de Homologação

**Files:**
- N/A

**Step 1: Deploy no Hosting**
*   Rodar o deploy oficial da CDN:
    `firebase deploy --only hosting`
*   Confirmar que o deploy foi realizado sem problemas.

**Step 2: Testes Manuais**
*   Abrir a URL hospedada e testar a navegação em cada categoria.
*   Digitar termos avulsos como *"biossegurança unhas"*, *"volume brasileiro"* ou *"blindagem make"* para verificar se a IA responde de forma rica e científica.

---

## Plano de Verificação

### Testes de Sintaxe e Compilação
- `node -c js/ia-consultoria.js` -> Deve retornar com código de saída `0`.

### Teste de Transição Visual (Manual)
- Ao transitar entre categorias do chatbot, a animação de fading lateral e vertical deve ser visível e suave, sem saltos visuais grosseiros.
