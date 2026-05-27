# Bolsa da Beleza SB Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Desenvolver o módulo "Bolsa da Beleza SB", digitalizando de forma interativa e com paleta Rose Gold premium a metodologia de finanças de ativos de beleza do e-book Bolsa da Beleza™.

**Architecture:** Módulo SPA autocontido no arquivo `pages/bolsa-beleza-sb.js` que gerencia o estado da aplicação localmente, persistindo dados no `localStorage`. Integra-se ao app através de inserção de roteamento no `js/app.js` e elementos visuais de navegação (sidebar, mobile bottom nav, script import) no `app.html`.

**Tech Stack:** HTML5, CSS3, JavaScript Vanilla, Tailwind CSS, Material Symbols (ícones).

---

### Task 1: Estruturação Inicial do Módulo
**Files:**
*   Create: `pages/bolsa-beleza-sb.js`
*   Test: Execução local e validação sintática sintática com Node.js (`node -c pages/bolsa-beleza-sb.js`)

**Step 1: Criar o arquivo com o esqueleto do objeto de página**
Escrever a estrutura SPA com `render()` e `init()`, incluindo a lógica básica de leitura e inicialização do estado no `localStorage`.

```javascript
const BolsaBelezaSBPage = {
    state: {
        currentStep: 1, // 1: Diagnóstico, 2: Serviços, 3: Notas, 4: Dashboard
        metas: {
            nome: "",
            local: "Salao", // Home, Compartilhado, Salao, Outro
            capacidadeSemanal: 0,
            realizadoSemanal: 0,
            cancelamentosSemanal: 0,
            procedimentosSemanal: 0,
            metaFinanceira: 0,
            qualitativa1: "",
            qualitativa2: "",
            qualitativa3: "",
            qualitativa4: "",
            qualitativa5: "",
            qualitativa6: "",
            qualitativa7: ""
        },
        servicos: [], // { id, nome, tempo, valor, atendimentos3Meses, custo }
        notas: {}, // { servicoId: { risco, liquidez } }
        servicoEstrategicoId: null,
        cronogramaProgresso: {} // { dia1: true, dia2: false, ... }
    },

    loadState() {
        const saved = localStorage.getItem('bolsa_beleza_sb_state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {
                console.error("Erro ao carregar estado da Bolsa da Beleza:", e);
            }
        }
    },

    saveState() {
        localStorage.setItem('bolsa_beleza_sb_state', JSON.stringify(this.state));
    },

    render() {
        this.loadState();
        return `
            <div class="px-6 py-8 pb-32 md:pb-8 max-w-7xl mx-auto animation-fade-in text-[#2C1810]" style="background-color: #fcf9f7; min-height: 80vh; border-radius: 24px; position: relative; overflow: hidden;">
                <!-- Blurs de Glassmorphism Premium -->
                <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#f4a2a2]/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#c97c5c]/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div class="relative z-10">
                    <!-- Cabeçalho -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#c97c5c]/25">
                        <div>
                            <h1 class="font-headline font-extrabold text-3xl tracking-tight flex items-center gap-3 text-[#2C1810]">
                                <span class="material-symbols-outlined text-[#c97c5c] text-4xl" style="font-variation-settings: 'FILL' 1;">payments</span>
                                Bolsa da Beleza SB™
                            </h1>
                            <p class="text-sm font-semibold text-[#7A5C54] mt-1">Conduza seu estúdio como uma verdadeira gestora de ativos financeiros.</p>
                        </div>
                        <div id="bolsa-stepper" class="flex items-center gap-2 bg-[#ffffff]/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#c97c5c]/20">
                            <!-- Renderizado dinamicamente via JS -->
                        </div>
                    </div>

                    <!-- Conteúdo Principal Dinâmico -->
                    <div id="bolsa-step-content" class="space-y-6"></div>
                </div>
            </div>
        `;
    },

    init() {
        this.loadState();
        this.renderStep();
    }
};
```

**Step 2: Validar a sintaxe do arquivo de página inicial**
Run: `node -c pages/bolsa-beleza-sb.js`
Expected: PASS com nenhuma saída de erro.

---

### Task 2: Implementação da Etapa 1 — Diagnóstico e Metas
**Files:**
*   Modify: `pages/bolsa-beleza-sb.js` (Adicionar layout e escuta de eventos da Etapa 1)

**Step 1: Escrever o HTML e formulário de dados operacionais e perguntas qualitativas**
Adicionar a função `renderStep()` e programar o HTML da Etapa 1 com cards de orientação de mentoria para guiar a usuária.
*   **Métricas Operacionais:** Inputs com ícones e labels refinadas.
*   **7 Perguntas Qualitativas:** Inputs com sugestões e exemplos em placeholders.
*   **Controles:** Botão "Avançar" que valida e salva os dados, avançando para a Etapa 2.

**Step 2: Validar o salvamento automático**
Adicionar escuta ao evento `input` de todos os campos para executar `this.saveState()` em tempo real.

---

### Task 3: Implementação da Etapa 2 — Tabela Dinâmica de Serviços
**Files:**
*   Modify: `pages/bolsa-beleza-sb.js` (Lógica da tabela dinâmica de cadastro de serviços)

**Step 1: Escrever a tabela reativa**
Criar interface contendo:
*   Tabela com Nome do Procedimento, Tempo (min), Valor (R$), Atendimentos 3 Meses, Custo (R$), Lucro Líquido (calculado) e "Hora R$ 100" (calculado).
*   Fórmula do Tempo para R$ 100 de Lucro:
    $$\text{Tempo para R\$ 100} = \frac{100 \times \text{Tempo}}{\text{Valor} - \text{Custo}}$$
*   Seção de Mentoria ativa explicando como funciona o indicador do lucro no tempo.

**Step 2: Lógica de adição e remoção de itens**
Adicionar escutas de clique para "Deletar" serviço da lista e "Adicionar" uma nova linha preenchida instantaneamente a partir dos inputs do rodapé da tabela.

---

### Task 4: Implementação da Etapa 3 — Avaliação de Notas de Ativos
**Files:**
*   Modify: `pages/bolsa-beleza-sb.js` (Adicionar sliders de notas de 1 a 5 para Risco e Liquidez)

**Step 1: Criar cards de avaliação por serviço**
Renderizar para cada serviço cadastrado na Etapa 2:
*   Tag colorida reativa para **Tempo (Eficiência)** baseada na "Hora R$ 100":
    *   Verde (`<= 60` min): 🟢 Alta Eficiência
    *   Amarelo (`61-75` min): 🟡 Moderada Eficiência
    *   Laranja (`76-90` min): 🟠 Baixa Eficiência
    *   Vermelho (`> 90` min): 🔴 Ineficiente
*   Sliders de **Risco** e **Liquidez** de 1 a 5.

**Step 2: Feedback textual dos Sliders**
Ao arrastar o slider, atualizar dinamicamente um texto descritivo explicativo logo abaixo de cada seletor para conduzir a usuária.

---

### Task 5: Implementação do Dashboard de Ativos (Real vs. Ideal)
**Files:**
*   Modify: `pages/bolsa-beleza-sb.js` (Dashboard com algoritmo de classificação, gráficos SVG dinâmicos clicáveis e diagnóstico textual)

**Step 1: Programar o Algoritmo de Classificação**
Classificar cada serviço em uma das classes: **Âncora**, **Premium**, **Bem-estar**, **Ocasional**, **Exótico** com base em:
*   Âncora: Tempo eficiente (até 60m), Risco baixo (1-2), Liquidez alta (1-2).
*   Premium: Tempo alto, Risco médio (2-4), Liquidez média (2-4), Hora R$ 100 de 45 a 75m.
*   Bem-estar: Tempo médio, Risco médio (2-4), Liquidez alta (1-2), Hora R$ 100 de 50 a 80m.
*   Ocasional: Tempo variável, Risco alto (3-5), Liquidez baixa (3-5), Hora R$ 100 de 70 a 100m.
*   Exótico: Tempo alto (+90m), Risco alto (4-5), Liquidez incerta (4-5), Hora R$ 100 acima de 90m.

**Step 2: Renderização de Gráficos SVG Dinâmicos**
Programar uma função trigonométrica vanilla para calcular as coordenadas das fatias (arc paths) de um círculo SVG de pizza para exibir a Distribuição Real (cruzando atendimentos * valor cobrado) vs. Distribuição Ideal (metas: Âncora 40%-50%, Premium 25%-30%, Bem-estar 10%-15%, Outros ~5%).
*   Adicionar escutas de clique nas fatias para filtrar a tabela de serviços.

**Step 3: Diagnóstico Narrativo**
Algoritmo gera uma leitura da carteira da usuária e emite conselhos práticos e construtivos.

---

### Task 6: Implementação do Módulo de Rebalanceamento e Plano de 14 Dias
**Files:**
*   Modify: `pages/bolsa-beleza-sb.js` (Plano de 14 dias com injeção dinâmica de serviço escolhido, cópia de texto e barra de progresso gamificada)

**Step 1: Seleção do Serviço Estratégico**
Exibir um card com o aviso estratégico e um seletor para a usuária clicar e definir 1 serviço estratégico para divulgar nos próximos 14 dias.

**Step 2: Calendário e Checklist Interativa de 14 Dias**
Adicionar a checklist interativa injetando dinamicamente o `[Nome do Serviço]` selecionado em todas as copys de Stories, Feed e WhatsApp.
*   Implementar botão "Copiar Roteiro" com `navigator.clipboard.writeText` e feedback de toast na tela.
*   Adicionar barra de progresso gamificada e salvar a conclusão no `localStorage`.

---

### Task 7: Integração de Roteamento e UI no Sistema Principal
**Files:**
*   Modify: `app.html` (Importação do script, menu lateral, mobile bottom nav)
*   Modify: `js/app.js` (Roteador do sistema)

**Step 1: Registrar o menu no `app.html`**
Adicionar item de menu na sidebar (logo abaixo de "referrals") e no bottom-nav mobile para a rota `#/bolsa-beleza-sb`.
Adicionar a tag `<script src="pages/bolsa-beleza-sb.js"></script>` logo antes do script `js/app.js` no final do arquivo.

**Step 2: Mapear a rota no `js/app.js`**
Adicionar o caso `'bolsa-beleza-sb'` no switch do `App.route()`, renderizando o conteúdo e inicializando o componente:
```javascript
case 'bolsa-beleza-sb':
    content.innerHTML = BolsaBelezaSBPage.render();
    BolsaBelezaSBPage.init();
    break;
```

---

### Task 8: Validação Sintática e Deploy
**Files:**
*   Test: Executar validação com Node.js (`node -c js/app.js pages/bolsa-beleza-sb.js`)
*   Deploy: Executar comando de deploy no Firebase Hosting (`firebase deploy --only hosting`)

**Step 1: Rodar a verificação de código**
Garantir que a sintaxe JavaScript está perfeitamente correta em todos os arquivos modificados.

**Step 2: Deploy de Homologação**
Enviar as atualizações para o Firebase Hosting no ar (`https://clientehubclin.web.app`) e validar as transições de tela e comportamentos interativos.
