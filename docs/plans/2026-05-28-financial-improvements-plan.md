# Central Financeira Premium — Plano de Implementação

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar Nota Fiscal MEI Simplificada (Recibo) e Relatório de Receitas Brutas MEI, Relatório de Inadimplência com ação rápida de cobrança via WhatsApp, e DRE Simplificado com distribuição de despesas por categoria em barras de progresso CSS na Central Financeira.

**Architecture:**
1. Modificar o arquivo agrupador `pages/modules.js` sob a classe `Invoices` para incluir o Widget DRE de balanço geral e consolidado.
2. Adicionar na aba de despesas o gráfico de barras horizontais nativas CSS de proporção de gastos.
3. Criar uma nova aba `tab-inadimplencia` e o método `_renderInadimplencias()` para faturas vencidas em aberto.
4. Implementar modal de Nota Fiscal / Recibo MEI Simplificada com estilo de documento oficial e suporte a impressão otimizada.
5. Criar o modal de Relatório Mensal de Receitas MEI compilando dados do período de faturamento.

**Tech Stack:** HTML5, CSS3, Vanilla JS (PWA), Google Fonts, Fontes de Ícones, Firestore CRUD.

---

### Task 1: Implementar o Widget DRE de Balanço Mensal no Topo da Central Financeira

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\pages\modules.js`

**Step 1: Carregar dados do estúdio no objeto Invoices**
Garantir que os dados do estúdio estejam carregados no `Invoices` para compor o cabeçalho das notas fiscais e relatórios.
No início de `Invoices.render(container)`:
```javascript
        try {
            const uid = Store._uid();
            const studioDoc = await db.collection('studios').doc(uid).get();
            Invoices.studioData = studioDoc.exists ? studioDoc.data() : {};
        } catch (e) {
            console.error('Erro ao carregar dados do estúdio:', e);
            Invoices.studioData = {};
        }
```

**Step 2: Adicionar o esqueleto do painel DRE de Balanço Geral**
Modificar a renderização principal `Invoices.render(container)` para exibir o painel de Balanço Geral no topo, logo abaixo das abas, que será preenchido de forma consolidada por receitas e despesas.

```html
          <!-- Painel DRE Consolidado (Balanço de Caixa) -->
          <div id="cf-dre-panel" class="card" style="background:linear-gradient(135deg,var(--surface) 0%,var(--surface-2) 100%);border-color:var(--border)">
            <div class="card-body" style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;padding:16px 20px">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:24px">📊</span>
                <div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">Balanço de Caixa (Mês Atual)</div>
                  <div id="dre-saldo" style="font-size:1.3rem;font-weight:800;color:var(--text)">R$ 0,00</div>
                </div>
              </div>
              <div style="display:flex;gap:24px;flex-wrap:wrap">
                <div>
                  <div style="font-size:0.72rem;color:var(--text-muted)">📥 Total Recebido</div>
                  <div id="dre-receitas" style="font-size:0.95rem;font-weight:700;color:#28a745">R$ 0,00</div>
                </div>
                <div>
                  <div style="font-size:0.72rem;color:var(--text-muted)">📤 Total Pago (Despesas)</div>
                  <div id="dre-despesas" style="font-size:0.95rem;font-weight:700;color:var(--danger)">R$ 0,00</div>
                </div>
              </div>
            </div>
          </div>
```

**Step 3: Implementar o método utilitário `Invoices.updateDRE()`**
Criar o método `updateDRE()` para ler as faturas pagas e despesas pagas do período atual e atualizar o widget DRE no topo de forma integrada:
```javascript
    async updateDRE() {
        try {
            const invoices = await Store.getInvoices();
            const expenses = await Store.getExpenses();
            
            const today = new Date();
            const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            
            const totalReceived = invoices
                .filter(i => i.status === 'paid' && (i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt || 0)) >= startMonth)
                .reduce((s, i) => s + (i.value || 0), 0);
                
            const totalPaid = expenses
                .filter(e => e.status === 'paid' && (e.dueDate?.toDate ? e.dueDate.toDate() : new Date(e.dueDate || 0)) >= startMonth)
                .reduce((s, e) => s + (e.value || 0), 0);
                
            const balance = totalReceived - totalPaid;
            
            const saldoEl = document.getElementById('dre-saldo');
            const recEl = document.getElementById('dre-receitas');
            const expEl = document.getElementById('dre-despesas');
            
            if (saldoEl) {
                saldoEl.textContent = App.formatCurrency(balance);
                saldoEl.style.color = balance >= 0 ? '#28a745' : 'var(--danger)';
            }
            if (recEl) recEl.textContent = App.formatCurrency(totalReceived);
            if (expEl) expEl.textContent = App.formatCurrency(totalPaid);
        } catch (e) {
            console.error('Erro ao atualizar painel DRE:', e);
        }
    },
```
E chamá-lo no final de `render()`.

**Step 4: Commit**
```bash
git add pages/modules.js
git commit -m "feat: implement DRE balance panel widget in financial dashboard"
```

---

### Task 2: Criar e Renderizar o Gráfico de Barras CSS de Distribuição de Despesas

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\pages\modules.js`

**Step 1: Adicionar o container de distribuição lateral de gastos em `_renderDespesas()`**
Ajustar o método `_renderDespesas()` para exibir a tabela de despesas ocupando `flex: 2` e uma barra lateral ocupando `flex: 1` em telas grandes, contendo o resumo proporcional de gastos por categoria em barras de progresso horizontais nativas no tema Cassis e Dourado Rosé.

**Step 2: Implementar a lógica de cálculo de frações de despesas**
No método `_renderDespesas()`, agrupar o montante de despesas pagas por categoria, calcular a porcentagem sobre o total de saídas, ordenar por valor decrescente e renderizar como barras CSS estilizadas:
```javascript
        const catMap = {};
        expenses.filter(e => e.status === 'paid').forEach(e => {
            catMap[e.category] = (catMap[e.category] || 0) + (e.value || 0);
        });
        const sortedCats = Object.entries(catMap).sort((a,b) => b[1] - a[1]);
```
HTML das Barras CSS:
```javascript
        const barsHtml = sortedCats.map(([cat, val]) => {
            const pct = totalPago > 0 ? (val / totalPago * 100).toFixed(0) : 0;
            return `
            <div style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px">
                <span style="font-weight:600;color:var(--text-secondary)">${cat}</span>
                <span style="color:var(--text-muted)">${App.formatCurrency(val)} (${pct}%)</span>
              </div>
              <div style="height:6px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:100px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--primary) 0%,var(--gold) 100%);border-radius:100px"></div>
              </div>
            </div>`;
        }).join('') || '<div style="font-size:0.78rem;color:var(--text-muted);text-align:center;padding:12px">Nenhum pagamento realizado.</div>';
```

**Step 3: Commit**
```bash
git add pages/modules.js
git commit -m "feat: add horizonal CSS progress bars for operational expense category shares"
```

---

### Task 3: Criar a Nova Aba de Inadimplência com Lógica de Filtro e Ação de Cobrança

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\pages\modules.js`

**Step 1: Adicionar a aba "Inadimplência / Pendências"**
Adicionar o botão de aba na renderização superior de abas (`cf-tab-receitas`, `cf-tab-despesas`, `cf-tab-inadimplencias`):
```html
            <button id="tab-inadimplencias" onclick="Invoices.switchTab('inadimplencias')" style="padding:8px 20px;border-radius:var(--radius-sm);border:none;cursor:pointer;font-weight:600;font-size:0.88rem;transition:all .2s;background:transparent;color:var(--text-secondary)">⚠️ Pendências de Cobrança</button>
```

**Step 2: Criar o método `_renderInadimplencias()`**
Criar a função para buscar todas as faturas `pending` (pendentes) com data anterior a hoje, computar os dias de atraso e exibir uma tabela de inadimplência com um botão de ação rápida do WhatsApp contendo o texto amigável de lembrete:

```javascript
    async _renderInadimplencias() {
        let invoices = await Store.getInvoices();
        const today = new Date(); today.setHours(0,0,0,0);
        
        // Filtra faturas pendentes criadas antes de hoje
        const overdueInvoices = invoices.filter(i => {
            if (i.status !== 'pending') return false;
            const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt || 0);
            dt.setHours(0,0,0,0);
            return dt < today;
        });

        const totalOverdue = overdueInvoices.reduce((s, i) => s + (i.value || 0), 0);
        const pane = document.getElementById('cf-tab-inadimplencias');
        if (!pane) return;

        pane.innerHTML = `
          <!-- KPI -->
          <div class="kpi-grid" style="grid-template-columns:repeat(2,1fr);margin-bottom:20px">
            <div class="kpi-card rose"><div class="kpi-icon"><span class="material-symbols-outlined">warning</span></div><div class="kpi-value">${overdueInvoices.length}</div><div class="kpi-label">Cobranças Pendentes</div></div>
            <div class="kpi-card gold"><div class="kpi-icon"><span class="material-symbols-outlined">hourglass_empty</span></div><div class="kpi-value" style="font-size:1.1rem;color:var(--danger)">${App.formatCurrency(totalOverdue)}</div><div class="kpi-label">Total em Atraso</div></div>
          </div>
          <!-- Tabela -->
          <div class="card">
            <div class="table-wrapper">
              <table>
                <thead><tr><th>Cliente</th><th>Procedimento/Categoria</th><th>Data Procedimento</th><th>Atraso</th><th>Valor</th><th>Ação de Cobrança</th></tr></thead>
                <tbody>
                  ${overdueInvoices.map(i => {
                      const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt || 0);
                      const diffDays = Math.max(1, Math.floor((new Date() - dt) / (1000 * 60 * 60 * 24)));
                      const textCobrança = `Olá ${i.clientName || 'cliente'}, tudo bem? Passando para lembrar com carinho que ficou pendente o acerto do procedimento ${i.description || i.category} feito no dia ${dt.toLocaleDateString('pt-BR')} no valor de ${App.formatCurrency(i.value)}. Deseja que eu te envie o link de pagamento ou a chave PIX? 💕`;
                      const linkWhats = `https://wa.me/?text=${encodeURIComponent(textCobrança)}`;
                      return `
                      <tr>
                        <td style="font-weight:600">${i.clientName || 'Cliente'}</td>
                        <td>${i.description || i.category}</td>
                        <td>${dt.toLocaleDateString('pt-BR')}</td>
                        <td><span style="font-size:0.75rem;padding:2px 8px;border-radius:10px;background:rgba(220,53,69,0.1);color:#dc3545;font-weight:600">⏳ ${diffDays} dias</span></td>
                        <td style="font-weight:700;color:var(--danger)">${App.formatCurrency(i.value)}</td>
                        <td>
                          <a href="${linkWhats}" target="_blank" class="btn btn-ghost btn-sm" style="color:#25D366;display:inline-flex;align-items:center;gap:4px;font-weight:600;text-decoration:none" title="Enviar cobrança via WhatsApp">
                            <span class="material-symbols-outlined">chat</span> Cobrar via WhatsApp
                          </a>
                        </td>
                      </tr>`;
                  }).join('') || '<tr><td colspan="6" class="text-center" style="color:var(--text-muted);padding:32px">Parabéns! Nenhuma pendência em atraso. 🎉</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>`;
    },
```

**Step 3: Commit**
```bash
git add pages/modules.js
git commit -m "feat: add Overdues and Delinquency tab with direct WhatsApp collection templates"
```

---

### Task 4: Criar o Comprovante/Recibo Simplificado de Nota Fiscal MEI no Modal e Recurso de Impressão

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\pages\modules.js`

**Step 1: Adicionar botão "Nota MEI" na tabela de receitas pagas**
Na função `_renderInvRows(invoices)`, adicionar a ação ao lado do botão de deletar para lançamentos `paid`:
```javascript
                ${i.status==='paid'?`<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Invoices.showMeiReceipt('${i.id}')" title="Emitir Recibo / Nota MEI" style="color:var(--primary)"><span class="material-symbols-outlined" style="font-size:16px">description</span></button>`:''}
```

**Step 2: Criar o Modal HTML de Nota Fiscal MEI e Estilização de Impressão**
Adicionar o esqueleto do modal `inv-mei-modal` na renderização do `Invoices.render(container)` com uma folha de estilo de impressão `@media print` acoplada dinamicamente:
```html
        <!-- Modal Recibo MEI -->
        <div id="inv-mei-modal" class="modal-overlay hidden" onclick="Invoices.closeMeiModal(event)">
          <div class="modal-container" style="max-width:650px;background:#ffffff;color:#1e1e1e" onclick="event.stopPropagation()">
            <div class="modal-header" style="border-bottom:1px solid #ddd;display:flex;justify-content:space-between;padding:12px 20px;background:#f5f5f5">
              <h3 class="modal-title" style="color:#333;font-weight:700">🧾 Recibo / Nota MEI Simplificada</h3>
              <div style="display:flex;gap:8px">
                <button class="btn btn-sm" onclick="Invoices.printMeiReceipt()" style="background:#58323F;color:#fff;font-weight:600;display:flex;align-items:center;gap:4px"><span class="material-symbols-outlined" style="font-size:16px">print</span> Imprimir / PDF</button>
                <button class="modal-close" onclick="Invoices.closeMeiModal()" style="color:#555">✕</button>
              </div>
            </div>
            <div id="inv-mei-content" style="padding:24px;font-family:'Courier New',Courier,monospace;line-height:1.4"></div>
          </div>
        </div>
```

E no `showMeiReceipt(id)`, preencher e abrir o modal:
```javascript
    showMeiReceipt(id) {
        const item = Invoices._allInvoices.find(x => x.id === id); // Cache carregado no _renderReceitas
        if (!item) return;
        
        const dt = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt || 0);
        const studio = Invoices.studioData || {};
        const content = document.getElementById('inv-mei-content');
        if (!content) return;
        
        content.innerHTML = `
        <div id="mei-print-area" style="padding:10px;border:2px solid #000;border-radius:4px">
          <div style="text-align:center;border-bottom:1px dashed #000;padding-bottom:12px;margin-bottom:12px">
            <h2 style="margin:0;font-size:1.3rem;font-weight:800">${studio.studioName || studio.companyName || 'STUDIO BEAUTY'}</h2>
            <div style="font-size:0.8rem;margin-top:4px">CNPJ: ${studio.cnpj || '—'} | Tel: ${studio.phone || '—'}</div>
            <div style="font-size:0.8rem">${studio.address || '—'}</div>
          </div>
          
          <div style="font-size:0.85rem;margin-bottom:12px">
            <div style="text-align:center;font-weight:700;text-decoration:underline;margin-bottom:8px">COMPROVANTE DE PRESTAÇÃO DE SERVIÇOS (MEI)</div>
            <div><strong>Nº DOCUMENTO:</strong> ${item.id.substring(0,8).toUpperCase()}</div>
            <div><strong>DATA EMISSÃO:</strong> ${new Date().toLocaleDateString('pt-BR')}</div>
            <div><strong>CLIENTE (TOMADOR):</strong> ${item.clientName || 'CONSUMIDOR FINAL'}</div>
          </div>
          
          <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:0.85rem">
            <thead>
              <tr style="border-bottom:1px solid #000;text-align:left">
                <th>DESCRIÇÃO DO SERVIÇO</th>
                <th style="text-align:right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:6px 0">${item.description || item.category} (Executado em ${dt.toLocaleDateString('pt-BR')})</td>
                <td style="text-align:right;padding:6px 0">${App.formatCurrency(item.value)}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="border-top:1px dashed #000;padding-top:12px;margin-top:12px;font-size:0.85rem;text-align:right;font-weight:700">
            TOTAL RECEBIDO (${(item.paymentMethod || 'Outro').toUpperCase()}): ${App.formatCurrency(item.value)}
          </div>
          
          <div style="border-top:1px solid #000;margin-top:16px;padding-top:8px;font-size:0.65rem;color:#555;text-align:justify;font-style:italic">
            Documento emitido por Microempreendedor Individual (MEI), dispensado de emissão de nota fiscal eletrônica para consumidor final pessoa física, conforme o Art. 26, § 1º, inciso II, da Lei Complementar nº 123/2006.
          </div>
        </div>`;
        document.getElementById('inv-mei-modal').classList.remove('hidden');
    },
    closeMeiModal(event) {
        if (event && event.target !== document.getElementById('inv-mei-modal')) return;
        document.getElementById('inv-mei-modal')?.classList.add('hidden');
    },
    printMeiReceipt() {
        const area = document.getElementById('mei-print-area');
        if (!area) return;
        const printWin = window.open('', '_blank');
        printWin.document.write(`<html><head><title>Imprimir Recibo MEI</title><style>
          body{font-family:monospace;padding:20px;color:#000;background:#fff}
          table{width:100%;border-collapse:collapse}
          th,td{padding:6px;border-bottom:1px solid #000}
        </style></head><body>${area.innerHTML}</body></html>`);
        printWin.document.close();
        printWin.focus();
        printWin.print();
        printWin.close();
    }
```

**Step 3: Commit**
```bash
git add pages/modules.js
git commit -m "feat: implement simplified MEI receipt generator with optimized browser print window"
```

---

### Task 5: Criar o Relatório Mensal de Faturamento Bruto MEI da Receita Federal

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\pages\modules.js`

**Step 1: Adicionar o botão global "Relatório MEI" na Central Financeira**
Na barra de filtros de Receitas, ao lado de Nova Venda:
```html
              <button class="btn btn-ghost" style="height:40px;color:var(--primary);border-color:rgba(88,50,63,.3)" onclick="Invoices.showMeiMonthlyReport()"><span class="material-symbols-outlined">receipt_long</span> Relatório MEI</button>
```

**Step 2: Implementar o modal e cálculo do Relatório Mensal de Receitas MEI**
Criar o modal `inv-mei-report-modal` e a função `showMeiMonthlyReport()` em `pages/modules.js` para compilar o montante do mês selecionado e exibir o formulário oficial da Receita Federal:

```javascript
    async showMeiMonthlyReport() {
        const from = document.getElementById('inv-from')?.value;
        const to = document.getElementById('inv-to')?.value;
        let invoices = await Store.getInvoices();
        
        // Filtra por período
        if (from) { const d = new Date(from); d.setHours(0,0,0,0); invoices = invoices.filter(i => { const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt||0); return dt >= d; }); }
        if (to)   { const d = new Date(to); d.setHours(23,59,59,999); invoices = invoices.filter(i => { const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt||0); return dt <= d; }); }
        
        const paidInvoices = invoices.filter(i => i.status === 'paid');
        const totalServicos = paidInvoices.reduce((s, i) => s + (i.value || 0), 0);
        const studio = Invoices.studioData || {};

        const content = document.getElementById('inv-mei-report-content') || document.body;
        
        const modalHtml = `
        <div id="mei-report-print-area" style="padding:10px;font-family:sans-serif;color:#000;line-height:1.5">
          <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:15px">
            <h3 style="margin:0;font-size:1.1rem;font-weight:700">RELATÓRIO MENSAL DAS RECEITAS BRUTAS</h3>
            <div style="font-size:0.75rem;margin-top:2px">Artigo 26, § 2º, inciso I da Lei Complementar nº 123/06</div>
          </div>
          
          <table style="width:100%;border-collapse:collapse;font-size:0.8rem;margin-bottom:15px">
            <tr>
              <td style="padding:6px;border:1px solid #000;width:70%"><strong>Razão Social:</strong> ${studio.companyName || studio.studioName || '—'}</td>
              <td style="padding:6px;border:1px solid #000"><strong>CNPJ:</strong> ${studio.cnpj || '—'}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:6px;border:1px solid #000"><strong>Período de Apuração:</strong> ${from ? new Date(from).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Mês Corrente'}</td>
            </tr>
          </table>

          <table style="width:100%;border-collapse:collapse;font-size:0.78rem;margin-bottom:15px">
            <thead>
              <tr style="background:#eaeaea">
                <th style="padding:6px;border:1px solid #000;text-align:left">RECEITA BRUTA MENSAL — ATIVIDADES</th>
                <th style="padding:6px;border:1px solid #000;text-align:right;width:30%">VALOR ACUMULADO (R$)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:6px;border:1px solid #000">I - Receitas brutas com comércio (Venda de cosméticos/produtos)</td>
                <td style="padding:6px;border:1px solid #000;text-align:right">R$ 0,00</td>
              </tr>
              <tr>
                <td style="padding:6px;border:1px solid #000;font-weight:700">II - Receitas brutas com prestação de serviços (Cílios, design, etc.)</td>
                <td style="padding:6px;border:1px solid #000;text-align:right;font-weight:700">${App.formatCurrency(totalServicos)}</td>
              </tr>
              <tr style="background:#f5f5f5;font-weight:800">
                <td style="padding:6px;border:1px solid #000">III - TOTAL DE RECEITAS BRUTAS DO PERÍODO (I + II)</td>
                <td style="padding:6px;border:1px solid #000;text-align:right;color:var(--primary)">${App.formatCurrency(totalServicos)}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="font-size:0.75rem;margin-top:20px;border-top:1px dashed #000;padding-top:10px">
            <div style="margin-bottom:15px">Local e data: __________________________, ______/______/______</div>
            <div style="text-align:center;margin-top:20px">____________________________________________________________<br>Assinatura do Microempreendedor Individual</div>
          </div>
        </div>`;

        // Renderiza no Modal
        let modal = document.getElementById('inv-mei-report-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'inv-mei-report-modal';
            modal.className = 'modal-overlay hidden';
            modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
            modal.innerHTML = `
              <div class="modal-container" style="max-width:650px;background:#ffffff;color:#1e1e1e" onclick="event.stopPropagation()">
                <div class="modal-header" style="border-bottom:1px solid #ddd;display:flex;justify-content:space-between;padding:12px 20px;background:#f5f5f5">
                  <h3 class="modal-title" style="color:#333;font-weight:700">📋 Relatório Mensal de Faturamento MEI</h3>
                  <div style="display:flex;gap:8px">
                    <button class="btn btn-sm" onclick="Invoices.printMeiReport()" style="background:#58323F;color:#fff;font-weight:600;display:flex;align-items:center;gap:4px"><span class="material-symbols-outlined" style="font-size:16px">print</span> Imprimir</button>
                    <button class="modal-close" onclick="document.getElementById('inv-mei-report-modal').classList.add('hidden')" style="color:#555">✕</button>
                  </div>
                </div>
                <div id="inv-mei-report-content" style="padding:24px;"></div>
              </div>`;
            document.body.appendChild(modal);
        }
        document.getElementById('inv-mei-report-content').innerHTML = modalHtml;
        modal.classList.remove('hidden');
    },
    
    printMeiReport() {
        const area = document.getElementById('mei-report-print-area');
        if (!area) return;
        const printWin = window.open('', '_blank');
        printWin.document.write(`<html><head><title>Relatório MEI</title><style>
          body{font-family:sans-serif;padding:20px;color:#000;background:#fff}
          table{width:100%;border-collapse:collapse;margin-bottom:15px}
          th,td{padding:8px;border:1px solid #000}
        </style></head><body>${area.innerHTML}</body></html>`);
        printWin.document.close();
        printWin.focus();
        printWin.print();
        printWin.close();
    }
```

**Step 3: Commit**
```bash
git add pages/modules.js
git commit -m "feat: complete MEI monthly gross faturamento reports under DAS-SIMEI legal layout"
```

---

## Plano de Verificação

### Automated Tests
* Por se tratar de Vanilla JS e HTML5 com banco de dados Firestore, faremos a validação manual dos fluxos de caixa e relatórios MEI no ambiente.

### Manual Verification
1. **DRE de Lucro Líquido:** Realizar lançamentos de receitas recebidas e despesas pagas e conferir o balanço no topo da tela.
2. **Gráfico de Barras CSS:** Adicionar despesas de categorias diferentes (ex: "Aluguel" e "Equipamentos") e verificar se as frações de barra são plotadas proporcionalmente.
3. **Cobrança Inadimplência:** Acessar a aba "Pendências", conferir se faturas em aberto anteriores a hoje são listadas com a data e dias de atraso corretos e se o link WhatsApp é gerado.
4. **Comprovante/Relatório MEI:** Emitir o recibo individual e o relatório mensal de receitas brutas do MEI, certificando a limpeza e formatação nas caixas de impressão do navegador.
