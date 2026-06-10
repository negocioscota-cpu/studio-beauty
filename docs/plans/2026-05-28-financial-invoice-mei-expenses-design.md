# Design Doc: Nota Fiscal MEI, Inadimplência e DRE Simplificado na Central Financeira

**Data:** 28 de Maio de 2026  
**Status:** Aprovado  
**Autor:** Antigravity (Gemini)

---

## 1. Objetivo

Expandir e consolidar o módulo **Central Financeira** do **Studio Beauty** (localizado no arquivo agrupador `pages/modules.js` sob o objeto `Invoices`) para oferecer à profissional um controle financeiro premium com suporte a:
1. Emissão de Recibo/Nota Fiscal MEI Simplificada e Relatório Mensal de Faturamento MEI.
2. Controle e gerenciamento visual de clientes inadimplentes com ação rápida de cobrança via WhatsApp.
3. Visão consolidada de resultado de caixa (DRE Simplificado) e distribuição proporcional de despesas operacionais por categoria usando barras gráficas CSS nativas.

---

## 2. Requisitos Técnicos e de Interface

### 2.1 Nota Fiscal MEI Simplificada e Relatório
* **Recibo Individual MEI (Simulação de NFS-e):**
  - Adicionar botão de ação na tabela de Receitas para lançamentos com status `paid` (Recebido).
  - Modal `inv-mei-modal` com cabeçalho contendo dados do estúdio (obtidos dinamicamente de `Store.studioData`), dados do tomador/cliente, descrição e data do procedimento, valor bruto e a declaração obrigatória de isenção tributária para pessoa física baseada no Art. 26 da LC 123/2006.
  - Recurso de impressão com CSS de página inteligente (`@media print`) que otimiza a diagramação para folha A4 vertical limpa.
* **Relatório Mensal de Faturamento MEI:**
  - Botão na interface financeira para compilar todas as receitas em uma tabela idêntica ao modelo padrão da Receita Federal (Relatório Mensal de Receitas Brutas), permitindo preenchimento e arquivamento ágil do faturamento anual.

### 2.2 Relatório e Gestão de Inadimplência
* **Aba "⚠️ Pendências de Cobrança":**
  - Uma terceira aba `tab-inadimplencia` inserida na interface de navegação unificada do módulo financeiro.
  - Filtro automático de receitas com status `pending` cujas datas de criação sejam anteriores a hoje.
  - Listagem com dias acumulados de atraso e o valor total devido pela cliente.
  - Botão verde de WhatsApp que gera o link de contato direto `wa.me` contendo um texto de lembrete cordial e profissional configurado com o nome do cliente, procedimento, data e valor a acertar.

### 2.3 Balanço Financeiro (DRE) e Distribuição por Categorias
* **Widget DRE de Balanço Mensal:**
  - Card consolidado inserido no topo da Central Financeira contendo:
    - **Total Recebido (Entradas):** Receitas pagas.
    - **Total Pago (Saídas):** Despesas pagas.
    - **Resultado Líquido:** Diferença com cor dinâmica (verde se maior/igual a zero, vermelho se menor).
* **Distribuição Visual de Despesas:**
  - Um painel moderno acoplado à aba de Despesas que agrega os gastos totais pagos no período por categoria (ex: Aluguel, Insumos, Energia) e gera barras de porcentagem CSS horizontais nativas no tema Cassis e Dourado Rosé, dando transparência total aos custos operacionais do negócio.

---

## 3. Plano de Testes e Validação

* **Validação dos Cálculos do DRE:** Confirmar se o cálculo do Saldo Líquido responde corretamente aos filtros de período (Data Inicial/Final) selecionados na barra de ferramentas.
* **Geração da Nota MEI:** Abrir um recibo no modal de uma fatura paga e testar a exibição dos dados e o disparo da janela de impressão sem elementos do app shell.
* **Envio de WhatsApp da Cobrança:** Testar o clique no botão de cobrança de inadimplência e checar se o texto formatado traz as variáveis de nome, serviço, data e valor preenchidas perfeitamente.
