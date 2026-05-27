# Documento de Design: Módulo Bolsa da Beleza SB

**Data:** 2026-05-20  
**Status:** Aprovado  
**Autor:** Antigravity (Google DeepMind Team)  
**Projeto:** Studiobeauty — Sistema de Gestão (`studiobeauty.clientehub.app.br`)

---

## 1. Visão Geral e Contexto
O módulo **Bolsa da Beleza SB** é uma nova ferramenta integrada ao sistema de gestão do Studiobeauty projetada para digitalizar a metodologia financeira do e-book **Bolsa da Beleza™**. O objetivo é capacitar profissionais da estética e beleza a gerenciarem seus procedimentos não apenas como prestação de serviços, mas como uma **Carteira de Ativos Financeiros**, equilibrando tempo, risco, liquidez e rentabilidade para atingir metas de faturamento sem sobrecarga física.

---

## 2. Requisitos de UI/UX e Identidade Visual

### 2.1. Estética Rose Gold, Champanhe e Bronze
A fim de transmitir sofisticação, luxo e profissionalismo gerencial, a interface adotará uma paleta premium específica:
*   **Gradiente Principal (Cards/Destaques):** `linear-gradient(135deg, #c97c5c 0%, #a0522d 100%)` (Bronze Terroso ao Dourado Queimado).
*   **Cores de Destaque:** `#f4a2a2` (Rosa Soft/Rose Gold) e `#d4af37` (Dourado sutil).
*   **Fundo da Página:** Off-white quente/champanhe (`#fcf9f7`) com elementos de Glassmorphism (efeito vidro fosco com sombras leves).
*   **Títulos e Textos:** `#2C1810` (Marrom Café Profundo) para títulos e `#7A5C54` (Marrom Suave) para descrições.

### 2.2. Integração e Roteamento SPA
*   **Rota:** `#/bolsa-beleza-sb`
*   **Entrada de Menu Lateral (Sidebar):** Uma nova aba denominada **"Bolsa da Beleza SB"** utilizando o ícone de Material Symbols `payments` com cor bronze.
*   **Bottom Navigation (Mobile):** Botão mobile compacto com rótulo **"Bolsa SB"** e ícone `payments`.
*   **Efeito de Transição:** Injeção do HTML da página com animação suave de `fadeIn` para garantir reatividade e leveza.

---

## 3. Arquitetura do Fluxo do Usuário (Etapas do Formulário)

O módulo conduzirá a profissional por um formulário sequencial de 3 etapas com orientação ativa em cada passo, salvando o progresso automaticamente no `localStorage` a cada interação.

### Etapa 1: Diagnóstico Inicial e Metas
*   **Métricas Operacionais (Últimos 3 meses):**
    *   Nome da profissional e Local de atendimento (Home, Espaço Compartilhado, Salão, Outro).
    *   Capacidade máxima de agendamentos semanais (limite físico).
    *   Agendamentos reais realizados por semana.
    *   Cancelamentos por semana (para calcular a taxa de ociosidade/cancelamentos).
    *   Procedimentos reais concluídos por semana.
    *   Meta financeira de faturamento mensal (R$).
*   **Perguntas Qualitativas (Percepção do Negócio):**
    Sete perguntas de percepção com campos de texto explicativos para mapear o relacionamento da profissional com sua agenda de serviços.
*   **Orientação Ativa:** Cards de mentoria confortando a usuária de que números estimados são suficientes para o diagnóstico inicial.

### Etapa 2: Cadastro e Identificação de Serviços (Tabela Dinâmica)
*   **Tabela Dinâmica de Cadastro:**
    *   *Nome do Procedimento*
    *   *Tempo Total (minutos)*
    *   *Valor Cobrado (R$)*
    *   *Nº de Atendimentos nos últimos 3 meses*
    *   *Custo Total de Insumos (R$)*
*   **Lógica de Cálculos em Tempo Real:**
    *   **Lucro Líquido (R$):** `Valor Cobrado - Custo Insumos`.
    *   **Hora R$ 100 (Tempo para R$ 100 de Lucro):** 
        $$\text{Tempo para R\$ 100} = \frac{100 \times \text{Tempo Total}}{\text{Lucro Líquido}}$$
*   **Orientação Ativa:** Tooltips explicando que um menor "Tempo para R$ 100" indica serviços de maior eficiência financeira, nos quais o lucro nasce mais rápido.

### Etapa 3: Atribuição de Notas (Critérios de Ativos)
*   **Sliders Interativos de Avaliação (1 a 5):**
    *   **Tempo (Eficiência):** Bloqueado e calculado de forma automatizada com base na "Hora R$ 100" da Etapa 2. Exibe tags de feedback visual reativas por cores:
        *   *Até 60 min:* 🟢 **Alta Eficiência** (Verde)
        *   *61-75 min:* 🟡 **Moderada Eficiência** (Amarelo)
        *   *76-90 min:* 🟠 **Baixa Eficiência** (Laranja)
        *   *+90 min:* 🔴 **Ineficiente** (Vermelho)
    *   **Risco (Estabilidade da Procura):** Manual (1 a 5), com feedbacks textuais na tela (1 - Essencial/Estável todo o ano; 5 - Serviço modista/alto risco).
    *   **Liquidez (Velocidade da Venda):** Manual (1 a 5), com feedbacks textuais (1 - Alta demanda espontânea/Boca a boca; 5 - Quase não vende/Exige promoções agressivas).

---

## 4. Dashboard: Posição Real vs. Carteira Ideal

### 4.1. Algoritmo de Classificação
O sistema classifica autonomamente os procedimentos em uma das 5 categorias oficiais do método:
*   ⚓ **Âncora:** Tempo da Hora R$ 100 até 60 min, Risco Baixo (1-2), Liquidez Alta (1-2).
*   💎 **Premium:** Tempo alto, Risco Médio (2-4), Liquidez Média (2-4), Hora R$ 100 entre 45-75 min.
*   🌸 **Bem-estar:** Tempo médio, Risco Médio (2-4), Liquidez Alta (1-2), Hora R$ 100 entre 50-80 min.
*   🍂 **Ocasional:** Tempo variável, Risco Alto (3-5), Liquidez Baixa (3-5), Hora R$ 100 de 70-100 min.
*   🌴 **Exótico:** Tempo alto (+90 min), Risco Alto (4-5), Liquidez Incerta (4-5), Hora R$ 100 acima de 90 min.

### 4.2. Gráfico de Pizza SVG Dinâmico
*   Exibição lado a lado do faturamento real dos últimos 3 meses por categoria versus a **Distribuição Perfeita** (Âncora 40%-50%, Premium 25%-30%, Bem-estar 10%-15%, Outros/Exóticos ~5%).
*   **Fatias Clicáveis:** Clicar em uma fatia do gráfico filtra imediatamente a lista de serviços exibida abaixo, revelando quais procedimentos pertencem àquela categoria de ativos.
*   **Narrativa de Diagnóstico de Gestão:** Geração de um parágrafo textual inteligente explicando onde está o desvio da carteira da usuária e sugerindo o rebalanceamento.

---

## 5. Módulo de Execução: Rebalanceamento e Cronograma de 14 Dias

*   **Seleção de Serviço Estratégico:** A profissional seleciona 1 serviço cadastrado para focar a campanha de atração e vendas.
*   **Calendário de 14 Dias Automatizado:**
    *   Checklist visual de 14 dias com tarefas diárias (Semana 1: Atração e Educação / Semana 2: Decisão e Pressão Elegante).
    *   Injeção dinâmica do **[Nome do Serviço]** em todas as copys de Stories, Feed e WhatsApp.
    *   **Botão "Copiar Roteiro":** Permite copiar o texto das postagens ou mensagens de WhatsApp instantaneamente com um clique.
    *   **Barra de Progresso Gamificada:** Mostra a evolução do rebalanceamento de 0% a 100% à medida que os dias são marcados como concluídos.

---

## 6. Persistência de Dados e Performance
*   Utilização exclusiva do `localStorage` para leitura e gravação assíncrona das configurações de metas, tabela de serviços, notas e progresso do plano de rebalanceamento.
*   Zero dependências de bibliotecas de gráficos externas, mantendo o arquivo da página 100% autocontido em JS vanilla de alta performance.
