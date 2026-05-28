// === CENTRAL FINANCEIRA ===
const Invoices = {
    PAYMENT_METHODS: {
        pix:      { label: 'PIX',            icon: '⚡', color: '#00BCAF' },
        credit:   { label: 'Cartão Crédito', icon: '💳', color: '#7B61FF' },
        debit:    { label: 'Cartão Débito',  icon: '💳', color: '#5B8DEF' },
        cash:     { label: 'Dinheiro',       icon: '💵', color: '#4CAF50' },
        transfer: { label: 'Transferência',  icon: '🏦', color: '#FF9800' },
        other:    { label: 'Outro',          icon: '🔄', color: '#9E9E9E' }
    },
    EXPENSE_CATEGORIES: [
        'Descartáveis','Insumos e Materiais','Colas e Adesivos','Extensões',
        'Equipamentos','Aluguel e Espaço','Marketing e Publicidade',
        'Água e Energia','Internet e Telefone','Cursos e Capacitação',
        'Salários e Comissões','Impostos e Taxas','Software e Assinaturas',
        'Limpeza e Higiene','Embalagens','Outros'
    ],
    SERVICE_CATEGORIES: [
        'Extensão de Cílios','Manutenção de Cílios','Design de Sobrancelhas',
        'Henna de Sobrancelhas','Laminação de Cílios','Laminação de Sobrancelhas',
        'Lifting de Cílios','Remoção de Extensão','Micropigmentação',
        'Brow Lamination','Fio a Fio','Volume Russo','Volume Mega','Híbrido',
        'Combo (Cílios + Sobrancelhas)','Outros'
    ],
    _activeTab: 'receitas', // 'receitas' | 'despesas'

    async render(container) {
        container.innerHTML = `<div style="display:flex;flex-direction:column;gap:20px">
          <!-- Título Central Financeira -->
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <div>
              <h2 style="font-size:1.4rem;font-weight:800;color:var(--primary);margin:0">💰 Central Financeira</h2>
              <p style="font-size:0.82rem;color:var(--text-muted);margin:0">Gerencie receitas e contas a pagar em um só lugar</p>
            </div>
          </div>
          <!-- Abas -->
          <div style="display:flex;gap:4px;background:var(--surface);border-radius:var(--radius-sm);padding:4px;width:fit-content">
            <button id="tab-receitas" onclick="Invoices.switchTab('receitas')" style="padding:8px 20px;border-radius:var(--radius-sm);border:none;cursor:pointer;font-weight:600;font-size:0.88rem;transition:all .2s;background:var(--primary);color:#fff">📥 Contas a Receber</button>
            <button id="tab-despesas" onclick="Invoices.switchTab('despesas')" style="padding:8px 20px;border-radius:var(--radius-sm);border:none;cursor:pointer;font-weight:600;font-size:0.88rem;transition:all .2s;background:transparent;color:var(--text-secondary)">📤 Contas a Pagar</button>
          </div>
          <div id="cf-tab-receitas"></div>
          <div id="cf-tab-despesas" style="display:none"></div>
        </div>`;
        try { await Invoices._renderReceitas(); } catch(e) {
            const p = document.getElementById('cf-tab-receitas');
            if (p) p.innerHTML = `<div class="card" style="padding:24px;color:var(--danger)">⚠️ Erro ao carregar receitas: ${e.message}${e.message.includes('index')||e.message.includes('Index')?'<br><small>O banco de dados está criando o índice. Aguarde 1-2 min e tente novamente.</small>':''}</div>`;
        }
        try { await Invoices._renderDespesas(); } catch(e) {
            const p = document.getElementById('cf-tab-despesas');
            if (p) p.innerHTML = `<div class="card" style="padding:24px;color:var(--danger)">⚠️ Erro ao carregar despesas: ${e.message}${e.message.includes('index')||e.message.includes('Index')?'<br><small>O banco de dados está criando o índice. Aguarde 1-2 min e tente novamente.</small>':''}</div>`;
        }
        Invoices.switchTab(Invoices._activeTab || 'receitas');
    },

    switchTab(tab) {
        Invoices._activeTab = tab;
        const tabs = ['receitas','despesas'];
        tabs.forEach(t => {
            const btn = document.getElementById('tab-'+t);
            const pane = document.getElementById('cf-tab-'+t);
            if (!btn || !pane) return;
            if (t === tab) {
                btn.style.background = 'var(--primary)'; btn.style.color = '#fff';
                pane.style.display = '';
            } else {
                btn.style.background = 'transparent'; btn.style.color = 'var(--text-secondary)';
                pane.style.display = 'none';
            }
        });
    },

    async _renderReceitas(filters = {}) {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay  = new Date(today.getFullYear(), today.getMonth()+1, 0);
        const fmt = d => d.toISOString().split('T')[0];
        const defFrom = filters.from || fmt(firstDay);
        const defTo   = filters.to   || fmt(lastDay);

        let invoices = await Store.getInvoices();
        // Filtrar por data client-side
        if (defFrom) {
            const from = new Date(defFrom); from.setHours(0,0,0,0);
            invoices = invoices.filter(i => {
                const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt||0);
                return dt >= from;
            });
        }
        if (defTo) {
            const to = new Date(defTo); to.setHours(23,59,59,999);
            invoices = invoices.filter(i => {
                const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt||0);
                return dt <= to;
            });
        }
        if (filters.status) invoices = invoices.filter(i => i.status === filters.status);

        const totalRec = invoices.reduce((s,i)=>s+(i.value||0),0);
        const recebido = invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+(i.value||0),0);
        const aReceber = invoices.filter(i=>i.status==='pending').reduce((s,i)=>s+(i.value||0),0);
        const byMethod = {};
        invoices.filter(i=>i.status==='paid').forEach(i=>{ const m=i.paymentMethod||'other'; byMethod[m]=(byMethod[m]||0)+(i.value||0); });

        const pane = document.getElementById('cf-tab-receitas');
        if (!pane) return;
        pane.innerHTML = `
          <!-- KPIs Contas a Receber -->
          <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
            <div class="kpi-card rose"><div class="kpi-icon"><span class="material-symbols-outlined">receipt_long</span></div><div class="kpi-value">${invoices.length}</div><div class="kpi-label">Vendas</div></div>
            <div class="kpi-card green"><div class="kpi-icon"><span class="material-symbols-outlined">check_circle</span></div><div class="kpi-value" style="font-size:1.1rem">${App.formatCurrency(recebido)}</div><div class="kpi-label">Total Recebido</div></div>
            <div class="kpi-card gold"><div class="kpi-icon"><span class="material-symbols-outlined">hourglass_empty</span></div><div class="kpi-value" style="font-size:1.1rem">${App.formatCurrency(aReceber)}</div><div class="kpi-label">Total a Receber</div></div>
            <div class="kpi-card blue"><div class="kpi-icon"><span class="material-symbols-outlined">account_balance_wallet</span></div><div class="kpi-value" style="font-size:1.1rem">${App.formatCurrency(totalRec)}</div><div class="kpi-label">Total Geral</div></div>
          </div>
          <!-- Filtros -->
          <div class="card"><div class="card-body">
            <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end">
              <div class="form-group" style="margin:0;flex:1;min-width:130px"><label class="form-label" style="font-size:0.78rem">Data Inicial</label><input type="date" class="form-control" id="inv-from" value="${defFrom}" /></div>
              <div class="form-group" style="margin:0;flex:1;min-width:130px"><label class="form-label" style="font-size:0.78rem">Data Final</label><input type="date" class="form-control" id="inv-to" value="${defTo}" /></div>
              <div class="form-group" style="margin:0;flex:1;min-width:130px"><label class="form-label" style="font-size:0.78rem">Status</label>
                <select class="form-control" id="inv-filter-status">
                  <option value="">Todos</option><option value="paid">✅ Recebido</option><option value="pending">⏳ Pendente</option>
                </select></div>
              <div class="form-group" style="margin:0;flex:1;min-width:150px"><label class="form-label" style="font-size:0.78rem">Forma</label>
                <select class="form-control" id="inv-filter-method">
                  <option value="">Todas formas</option>${Object.entries(Invoices.PAYMENT_METHODS).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label}</option>`).join('')}
                </select></div>
              <button class="btn btn-ghost" style="height:40px" onclick="Invoices.filterReceitas()"><span class="material-symbols-outlined">filter_list</span> Filtrar</button>
              <button class="btn btn-ghost" style="height:40px;color:var(--success);border-color:rgba(76,175,80,.3)" onclick="Invoices.downloadReceitas()" title="Baixar Excel"><span class="material-symbols-outlined">download</span> Excel</button>
              <button class="btn btn-primary" style="height:40px" onclick="Invoices.openModal()"><span class="material-symbols-outlined">add</span> Nova Venda</button>
            </div>
          </div></div>
          ${Object.keys(byMethod).length > 0 ? `<div class="card"><div class="card-header"><span class="card-title">💰 Por Forma de Recebimento</span></div><div class="card-body" style="display:flex;flex-wrap:wrap;gap:12px">
            ${Object.entries(byMethod).map(([k,v])=>{ const m=Invoices.PAYMENT_METHODS[k]||Invoices.PAYMENT_METHODS.other; const pct=recebido>0?(v/recebido*100).toFixed(0):0; return `<div style="flex:1;min-width:120px;background:${m.color}10;border:1px solid ${m.color}30;border-radius:var(--radius-sm);padding:12px;text-align:center"><div style="font-size:1.4rem">${m.icon}</div><div style="font-size:0.75rem;color:var(--text-muted)">${m.label}</div><div style="font-size:1.1rem;font-weight:800;color:${m.color}">${App.formatCurrency(v)}</div><div style="font-size:0.72rem;color:var(--text-muted)">${pct}%</div></div>`; }).join('')}
          </div></div>` : ''}
          <!-- Tabela -->
          <div class="card"><div class="table-wrapper"><table>
            <thead><tr><th>Categoria</th><th>Descrição</th><th>Cliente</th><th>Tipo</th><th>Data</th><th>Recebimento</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody id="invoices-tbody">
              ${Invoices._renderInvRows(invoices)}
            </tbody>
          </table></div></div>
          <!-- Modal Nova Venda -->
          <div id="inv-bill-modal" class="modal-overlay hidden" onclick="Invoices.closeModal(event)">
            <div class="modal-container" style="max-width:520px" onclick="event.stopPropagation()">
              <div class="modal-header"><h3 class="modal-title">Nova Venda / Recebimento</h3><button class="modal-close" onclick="Invoices.closeModal()">✕</button></div>
              <form id="invoice-form" onsubmit="Invoices.handleSave(event)" class="modal-body">
                <!-- Tipo -->
                <div class="form-group"><label class="form-label">Tipo *</label>
                  <div style="display:flex;gap:8px">
                    ${[['unica','Única'],['parcelada','Parcelada'],['recorrente','Recorrente']].map(([v,l])=>`
                    <label style="flex:1;display:flex;align-items:center;gap:6px;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:0.88rem;font-weight:500;transition:all .2s">
                      <input type="radio" name="inv-type" value="${v}" ${v==='unica'?'checked':''} onchange="Invoices.onInvTypeChange()" style="accent-color:var(--primary)" />${l}</label>`).join('')}
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-group form-group-full"><label class="form-label">Categoria *</label>
                    <select class="form-control" id="inv-bill-cat" required>
                      ${Invoices.SERVICE_CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('')}
                    </select></div>
                  <div class="form-group form-group-full"><label class="form-label">Descrição *</label><input class="form-control" id="inv-bill-desc" required placeholder="Ex: Volume Russo completo" /></div>
                  <div class="form-group"><label class="form-label">Valor (R$) *</label><input class="form-control" type="number" id="inv-bill-value" min="0" step="0.01" required /></div>
                  <div class="form-group"><label class="form-label">Forma de Recebimento *</label><select class="form-control" id="inv-bill-method" required>${Object.entries(Invoices.PAYMENT_METHODS).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label}</option>`).join('')}</select></div>
                  <div class="form-group" id="inv-parc-wrap" style="display:none"><label class="form-label">Nº de Parcelas</label><input class="form-control" type="number" id="inv-parcelas" min="2" max="60" value="2" /></div>
                  <div class="form-group" id="inv-recorr-wrap" style="display:none"><label class="form-label">Dia de Vencimento (mensal)</label><input class="form-control" type="number" id="inv-recorr-day" min="1" max="31" value="1" /></div>
                  <div class="form-group"><label class="form-label">Status</label><select class="form-control" id="inv-bill-status"><option value="paid">✅ Recebido</option><option value="pending">⏳ Pendente</option></select></div>
                  <div class="form-group"><label class="form-label">Cliente</label>
                    <div style="display:flex;gap:6px">
                      <input class="form-control" id="inv-bill-client" placeholder="Nome da cliente" style="flex:1" />
                      <button type="button" class="btn btn-ghost btn-sm" onclick="Invoices.openClientHistory()" title="Ver histórico" style="padding:8px 10px;white-space:nowrap"><span class="material-symbols-outlined" style="font-size:18px">history</span></button>
                    </div>
                  </div>
                </div>
                <div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="Invoices.closeModal()">Cancelar</button><button type="submit" class="btn btn-primary"><span class="material-symbols-outlined">save</span> Salvar</button></div>
              </form>
            </div>
          </div>
          <!-- Drawer Histórico do Cliente -->
          <div id="inv-client-history-panel" style="display:none;position:fixed;top:0;right:0;width:380px;height:100vh;background:var(--card-bg);border-left:1px solid var(--border);z-index:9000;overflow-y:auto;padding:20px;box-shadow:-4px 0 20px rgba(0,0,0,.15)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
              <h3 style="font-weight:800;font-size:1rem;margin:0">👤 Histórico da Cliente</h3>
              <button onclick="document.getElementById('inv-client-history-panel').style.display='none'" class="btn btn-ghost btn-sm">✕</button>
            </div>
            <div id="inv-client-history-content" style="font-size:0.88rem;color:var(--text-muted)">Digite o nome da cliente e clique no ícone 👆</div>
          </div>`;
    },

    _renderInvRows(invoices) {
        if (!invoices.length) return '<tr><td colspan="9" class="text-center" style="color:var(--text-muted);padding:32px">Nenhum lançamento no período.</td></tr>';
        const tipoMap = { unica:'Única', parcelada:'Parcelada', recorrente:'Recorrente' };
        return invoices.map(i => {
            const pm = Invoices.PAYMENT_METHODS[i.paymentMethod]||Invoices.PAYMENT_METHODS.other;
            return `<tr data-status="${i.status||''}" data-method="${i.paymentMethod||'other'}">
              <td><span style="font-size:0.78rem;padding:2px 8px;background:var(--primary-xlight);color:var(--primary);border-radius:20px">${i.category||'-'}</span></td>
              <td>${i.description||'-'}</td>
              <td style="font-size:0.85rem">${i.clientName||'-'}</td>
              <td style="font-size:0.82rem">${tipoMap[i.type]||'Única'}</td>
              <td style="font-size:0.85rem">${App.formatDate(i.createdAt)}</td>
              <td><span style="display:inline-flex;align-items:center;gap:4px;font-size:0.78rem;padding:3px 8px;background:${pm.color}15;color:${pm.color};border-radius:20px;font-weight:600">${pm.icon} ${pm.label}</span></td>
              <td style="font-weight:700;color:var(--primary)">${App.formatCurrency(i.value)}</td>
              <td><span class="badge ${i.status==='paid'?'badge-green':i.status==='pending'?'badge-gold':'badge-brown'}">${i.status==='paid'?'Recebido':i.status==='pending'?'Pendente':'Cancelado'}</span></td>
              <td><div style="display:flex;gap:4px">
                ${i.status==='pending'?`<button class="btn btn-ghost btn-sm" onclick="Invoices.markPaid('${i.id}')" style="color:var(--success)"><span class="material-symbols-outlined">check</span></button>`:''}
                <button class="btn btn-ghost btn-sm" onclick="Invoices.deleteInv('${i.id}')" style="color:var(--danger)"><span class="material-symbols-outlined">delete</span></button>
              </div></td>
            </tr>`;
        }).join('');
    },

    onInvTypeChange() {
        const type = document.querySelector('input[name="inv-type"]:checked')?.value;
        document.getElementById('inv-parc-wrap').style.display    = type==='parcelada'   ? '' : 'none';
        document.getElementById('inv-recorr-wrap').style.display  = type==='recorrente'  ? '' : 'none';
    },

    async filterReceitas() {
        const from   = document.getElementById('inv-from')?.value;
        const to     = document.getElementById('inv-to')?.value;
        const status = document.getElementById('inv-filter-status')?.value;
        await Invoices._renderReceitas({ from, to, status: status||undefined });
        Invoices.switchTab('receitas');
    },

    async openClientHistory() {
        const clientName = document.getElementById('inv-bill-client')?.value?.trim();
        const panel = document.getElementById('inv-client-history-panel');
        const content = document.getElementById('inv-client-history-content');
        if (!panel || !content) return;
        panel.style.display = '';
        if (!clientName) { content.innerHTML = '<p style="color:var(--text-muted)">Digite o nome da cliente no campo acima primeiro.</p>'; return; }
        content.innerHTML = '<p>Buscando...</p>';
        try {
            const clients = await Store.getClients();
            const found = clients.find(c => c.name?.toLowerCase().includes(clientName.toLowerCase()));
            if (!found) { content.innerHTML = `<p style="color:var(--text-muted)">Nenhuma cliente encontrada com o nome "<b>${clientName}</b>".</p>`; return; }
            const hist = await Store.getClientHistory(found.id);
            content.innerHTML = `
              <div style="padding:12px;background:var(--surface);border-radius:var(--radius-sm);margin-bottom:12px">
                <div style="font-weight:700">${found.name}</div>
                <div style="font-size:0.78rem;color:var(--text-muted)">${found.phone||''}</div>
                <div style="display:flex;gap:12px;margin-top:8px;font-size:0.82rem">
                  <span>👁 <b>${hist.totalVisits}</b> visitas</span>
                  <span>💰 <b>${App.formatCurrency(hist.totalSpent)}</b> gasto</span>
                </div>
              </div>
              ${hist.history.length===0?'<p style="color:var(--text-muted)">Sem histórico.</p>':hist.history.map(h=>`
              <div style="padding:10px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;font-size:0.82rem">
                <div style="display:flex;justify-content:space-between"><b>${h.type==='ficha'?'📋 Ficha Técnica':'📅 Agendamento'}</b><span style="color:var(--text-muted)">${App.formatDate(h.date||h.createdAt)}</span></div>
                ${h.procedure||h.notes||h.service?`<div style="color:var(--text-secondary);margin-top:4px">${h.procedure||h.service||h.notes||''}</div>`:''}
                ${h.price?`<div style="color:var(--primary);font-weight:600">R$ ${parseFloat(h.price).toFixed(2)}</div>`:''}
              </div>`).join('')}`;
        } catch(e) { content.innerHTML = `<p style="color:var(--danger)">Erro: ${e.message}</p>`; }
    },

    async _renderDespesas() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay  = new Date(today.getFullYear(), today.getMonth()+1, 0);
        const fmt = d => d.toISOString().split('T')[0];
        const defFrom = fmt(firstDay), defTo = fmt(lastDay);
        const expenses = await Store.getExpenses({ from: defFrom, to: defTo });
        const totalPagar = expenses.filter(e=>e.status!=='paid').reduce((s,e)=>s+(e.value||0),0);
        const totalPago  = expenses.filter(e=>e.status==='paid').reduce((s,e)=>s+(e.value||0),0);
        const pane = document.getElementById('cf-tab-despesas');
        if (!pane) return;
        pane.innerHTML = `
          <!-- KPIs Contas a Pagar -->
          <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
            <div class="kpi-card rose"><div class="kpi-icon"><span class="material-symbols-outlined">payments</span></div><div class="kpi-value">${expenses.length}</div><div class="kpi-label">Despesas</div></div>
            <div class="kpi-card gold"><div class="kpi-icon"><span class="material-symbols-outlined">pending_actions</span></div><div class="kpi-value" style="font-size:1.1rem">${App.formatCurrency(totalPagar)}</div><div class="kpi-label">Total a Pagar</div></div>
            <div class="kpi-card green"><div class="kpi-icon"><span class="material-symbols-outlined">check_circle</span></div><div class="kpi-value" style="font-size:1.1rem">${App.formatCurrency(totalPago)}</div><div class="kpi-label">Total Pago</div></div>
          </div>
          <!-- Filtros -->
          <div class="card"><div class="card-body">
            <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end">
              <div class="form-group" style="margin:0;flex:1;min-width:130px"><label class="form-label" style="font-size:0.78rem">Data Inicial</label><input type="date" class="form-control" id="exp-from" value="${defFrom}" /></div>
              <div class="form-group" style="margin:0;flex:1;min-width:130px"><label class="form-label" style="font-size:0.78rem">Data Final</label><input type="date" class="form-control" id="exp-to" value="${defTo}" /></div>
              <div class="form-group" style="margin:0;flex:1;min-width:130px"><label class="form-label" style="font-size:0.78rem">Status</label><select class="form-control" id="exp-status"><option value="">Todos</option><option value="pending">⏳ A Pagar</option><option value="paid">✅ Pago</option><option value="overdue">🔴 Vencido</option></select></div>
              <button class="btn btn-ghost" style="height:40px" onclick="Invoices.filterExpenses()"><span class="material-symbols-outlined">filter_list</span> Filtrar</button>
              <button class="btn btn-ghost" style="height:40px;color:var(--success);border-color:rgba(76,175,80,.3)" onclick="Invoices.downloadDespesas()" title="Baixar Excel"><span class="material-symbols-outlined">download</span> Excel</button>
              <button class="btn btn-primary" style="height:40px" onclick="Invoices.openExpModal()"><span class="material-symbols-outlined">add</span> Nova Despesa</button>
            </div>
          </div></div>
          <!-- Tabela despesas -->
          <div class="card"><div class="table-wrapper"><table>
            <thead><tr><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Vencimento</th><th>Forma Pag.</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody id="expenses-tbody">
              ${Invoices._renderExpRows(expenses)}
            </tbody>
          </table></div></div>
          <!-- Modal Nova Despesa -->
          <div id="exp-modal" class="modal-overlay hidden" onclick="Invoices.closeExpModal(event)">
            <div class="modal-container" style="max-width:520px" onclick="event.stopPropagation()">
              <div class="modal-header"><h3 class="modal-title">Nova Despesa</h3><button class="modal-close" onclick="Invoices.closeExpModal()">✕</button></div>
              <form id="expense-form" onsubmit="Invoices.handleSaveExp(event)" class="modal-body">
                <!-- Tipo da despesa -->
                <div class="form-group"><label class="form-label">Tipo de Despesa *</label>
                  <div style="display:flex;gap:8px">
                    ${[['unica','Única'],['parcelada','Parcelada'],['recorrente','Recorrente']].map(([v,l])=>`
                    <label style="flex:1;display:flex;align-items:center;gap:6px;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:0.88rem;font-weight:500;transition:all .2s" id="exp-type-lbl-${v}">
                      <input type="radio" name="exp-type" value="${v}" ${v==='unica'?'checked':''} onchange="Invoices.onExpTypeChange()" style="accent-color:var(--primary)" />${l}</label>`).join('')}
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-group form-group-full"><label class="form-label">Categoria *</label>
                    <select class="form-control" id="exp-cat" required>
                      ${Invoices.EXPENSE_CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('')}
                    </select></div>
                  <div class="form-group form-group-full"><label class="form-label">Descrição *</label><input class="form-control" id="exp-desc" required placeholder="Ex: Descartáveis para copa" /></div>
                  <div class="form-group"><label class="form-label">Valor (R$) *</label><input class="form-control" type="number" id="exp-val" min="0" step="0.01" required /></div>
                  <div class="form-group"><label class="form-label">Forma de Pagamento</label>
                    <select class="form-control" id="exp-pay">${Object.entries(Invoices.PAYMENT_METHODS).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label}</option>`).join('')}</select></div>
                  <div class="form-group"><label class="form-label">Vencimento *</label><input class="form-control" type="date" id="exp-due" required /></div>
                  <div class="form-group" id="exp-parcelas-wrap" style="display:none"><label class="form-label">Nº de Parcelas</label><input class="form-control" type="number" id="exp-parcelas" min="2" max="60" value="2" placeholder="Ex: 12" /></div>
                  <div class="form-group" id="exp-recorr-wrap" style="display:none"><label class="form-label">Dia de Vencimento (mensal)</label><input class="form-control" type="number" id="exp-recorr-day" min="1" max="31" value="1" /></div>
                </div>
                <div class="form-group"><label class="form-label">Observações</label><textarea class="form-control" id="exp-obs" rows="2" placeholder="Notas adicionais..."></textarea></div>
                <div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="Invoices.closeExpModal()">Cancelar</button><button type="submit" class="btn btn-primary" style="background:var(--danger);border-color:var(--danger)"><span class="material-symbols-outlined">save</span> Salvar Despesa</button></div>
              </form>
            </div>
          </div>`;
        // Setar data de hoje como padrão do vencimento
        const dueInput = document.getElementById('exp-due');
        if (dueInput) dueInput.value = fmt(today);
    },

    _renderExpRows(expenses) {
        if (!expenses.length) return '<tr><td colspan="8" class="text-center" style="color:var(--text-muted);padding:32px">Nenhuma despesa no período.</td></tr>';
        return expenses.map(e => {
            const pm = Invoices.PAYMENT_METHODS[e.paymentMethod]||Invoices.PAYMENT_METHODS.other;
            const due = e.dueDate?.toDate ? e.dueDate.toDate() : (e.dueDate ? new Date(e.dueDate) : null);
            const isOverdue = due && e.status!=='paid' && due < new Date();
            const statusLabel = e.status==='paid' ? '✅ Pago' : isOverdue ? '🔴 Vencido' : '⏳ A Pagar';
            const badgeCls = e.status==='paid' ? 'badge-green' : isOverdue ? 'badge-danger' : 'badge-gold';
            const tipoMap = { unica:'Única', parcelada:'Parcelada', recorrente:'Recorrente' };
            return `<tr data-status="${e.status||'pending'}" data-category="${e.category||''}">
              <td>${e.description||'-'}</td>
              <td><span style="font-size:0.78rem;padding:2px 8px;background:var(--primary-xlight);color:var(--primary);border-radius:20px">${e.category||'-'}</span></td>
              <td style="font-size:0.82rem">${tipoMap[e.type]||'Única'}</td>
              <td style="font-size:0.85rem${isOverdue?' color:var(--danger);font-weight:700':''}">${due ? due.toLocaleDateString('pt-BR') : '-'}</td>
              <td><span style="display:inline-flex;align-items:center;gap:3px;font-size:0.78rem;padding:2px 7px;background:${pm.color}15;color:${pm.color};border-radius:20px">${pm.icon} ${pm.label}</span></td>
              <td style="font-weight:700;color:var(--danger)">${App.formatCurrency(e.value)}</td>
              <td><span class="badge ${badgeCls}">${statusLabel}</span></td>
              <td><div style="display:flex;gap:4px">
                ${e.status!=='paid'?`<button class="btn btn-ghost btn-sm" onclick="Invoices.markExpPaid('${e.id}')" title="Marcar pago" style="color:var(--success)"><span class="material-symbols-outlined">check</span></button>`:''}
                <button class="btn btn-ghost btn-sm" onclick="Invoices.deleteExp('${e.id}')" style="color:var(--danger)"><span class="material-symbols-outlined">delete</span></button>
              </div></td>
            </tr>`;
        }).join('');
    },

    onExpTypeChange() {
        const type = document.querySelector('input[name="exp-type"]:checked')?.value;
        document.getElementById('exp-parcelas-wrap').style.display = type==='parcelada' ? '' : 'none';
        document.getElementById('exp-recorr-wrap').style.display   = type==='recorrente' ? '' : 'none';
    },

    async filterExpenses() {
        const from   = document.getElementById('exp-from')?.value;
        const to     = document.getElementById('exp-to')?.value;
        const status = document.getElementById('exp-status')?.value;
        const filters = { from, to };
        if (status) filters.status = status;
        const expenses = await Store.getExpenses(filters);
        const tbody = document.getElementById('expenses-tbody');
        if (tbody) tbody.innerHTML = Invoices._renderExpRows(expenses);
        const totalPagar = expenses.filter(e=>e.status!=='paid').reduce((s,e)=>s+(e.value||0),0);
        const totalPago  = expenses.filter(e=>e.status==='paid').reduce((s,e)=>s+(e.value||0),0);
        // Atualizar KPIs
        const kpis = document.querySelectorAll('#cf-tab-despesas .kpi-value');
        if (kpis[0]) kpis[0].textContent = expenses.length;
        if (kpis[1]) kpis[1].textContent = App.formatCurrency(totalPagar);
        if (kpis[2]) kpis[2].textContent = App.formatCurrency(totalPago);
    },

    async downloadReceitas() {
        const from = document.getElementById('inv-from')?.value;
        const to   = document.getElementById('inv-to')?.value;
        let invoices = await Store.getInvoices();
        if (from) { const d = new Date(from); d.setHours(0,0,0,0); invoices = invoices.filter(i => { const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt||0); return dt >= d; }); }
        if (to)   { const d = new Date(to); d.setHours(23,59,59,999); invoices = invoices.filter(i => { const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt||0); return dt <= d; }); }
        const status = document.getElementById('inv-filter-status')?.value;
        if (status) invoices = invoices.filter(i => i.status === status);
        if (!invoices.length) { App.showToast('Nenhum lançamento para exportar.', 'warning'); return; }
        const tipoMap = { unica:'Única', parcelada:'Parcelada', recorrente:'Recorrente' };
        const header = ['Categoria','Descrição','Cliente','Tipo','Data','Forma de Recebimento','Valor (R$)','Status'];
        const rows = invoices.map(i => {
            const pm = Invoices.PAYMENT_METHODS[i.paymentMethod]||Invoices.PAYMENT_METHODS.other;
            const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt||0);
            return [
                i.category||'', i.description||'', i.clientName||'',
                tipoMap[i.type]||'Única', dt.toLocaleDateString('pt-BR'),
                pm.label, (i.value||0).toFixed(2).replace('.',','),
                i.status==='paid'?'Recebido':i.status==='pending'?'Pendente':'Cancelado'
            ];
        });
        const csv = '\uFEFF' + [header,...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(';')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `receitas_${from||'inicio'}_a_${to||'hoje'}.csv`;
        a.click(); URL.revokeObjectURL(url);
        App.showToast('Planilha de receitas baixada! 📊', 'success');
    },

    async downloadDespesas() {
        const from = document.getElementById('exp-from')?.value;
        const to   = document.getElementById('exp-to')?.value;
        let expenses = await Store.getExpenses({ from, to });
        const status = document.getElementById('exp-status')?.value;
        if (status) expenses = expenses.filter(e => e.status === status);
        if (!expenses.length) { App.showToast('Nenhuma despesa para exportar.', 'warning'); return; }
        const tipoMap = { unica:'Única', parcelada:'Parcelada', recorrente:'Recorrente' };
        const header = ['Descrição','Categoria','Tipo','Vencimento','Forma de Pagamento','Valor (R$)','Status','Observações'];
        const rows = expenses.map(e => {
            const pm = Invoices.PAYMENT_METHODS[e.paymentMethod]||Invoices.PAYMENT_METHODS.other;
            const due = e.dueDate?.toDate ? e.dueDate.toDate() : (e.dueDate ? new Date(e.dueDate) : null);
            const isOverdue = due && e.status!=='paid' && due < new Date();
            return [
                e.description||'', e.category||'', tipoMap[e.type]||'Única',
                due ? due.toLocaleDateString('pt-BR') : '',
                pm.label, (e.value||0).toFixed(2).replace('.',','),
                e.status==='paid'?'Pago': isOverdue?'Vencido':'A Pagar',
                e.notes||''
            ];
        });
        const csv = '\uFEFF' + [header,...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(';')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `despesas_${from||'inicio'}_a_${to||'hoje'}.csv`;
        a.click(); URL.revokeObjectURL(url);
        App.showToast('Planilha de despesas baixada! 📊', 'success');
    },

    openExpModal()  { document.getElementById('exp-modal')?.classList.remove('hidden'); },
    closeExpModal(event) {
        if (event && event.target !== document.getElementById('exp-modal')) return;
        document.getElementById('exp-modal')?.classList.add('hidden');
    },

    async handleSaveExp(e) {
        e.preventDefault();
        const type = document.querySelector('input[name="exp-type"]:checked')?.value || 'unica';
        const data = {
            type,
            category:      document.getElementById('exp-cat').value,
            description:   document.getElementById('exp-desc').value.trim(),
            value:         parseFloat(document.getElementById('exp-val').value) || 0,
            paymentMethod: document.getElementById('exp-pay').value,
            dueDate:       document.getElementById('exp-due').value,
            notes:         document.getElementById('exp-obs').value.trim(),
            status:        'pending'
        };
        if (type === 'parcelada') data.installments = parseInt(document.getElementById('exp-parcelas').value) || 2;
        if (type === 'recorrente') data.recurringDay = parseInt(document.getElementById('exp-recorr-day').value) || 1;
        try {
            await Store.addExpense(data);
            document.getElementById('exp-modal').classList.add('hidden');
            App.showToast('Despesa registrada! 📤', 'success');
            Invoices.switchTab('despesas');
            await Invoices._renderDespesas();
        } catch (err) { App.showToast('Erro: ' + err.message, 'error'); }
    },

    async markExpPaid(id) {
        if (!confirm('Marcar despesa como paga?')) return;
        await Store.updateExpense(id, { status: 'paid' });
        App.showToast('Despesa marcada como paga! ✅', 'success');
        await Invoices._renderDespesas();
    },

    async deleteExp(id) {
        if (!confirm('Excluir esta despesa?')) return;
        await Store.deleteExpense(id);
        App.showToast('Despesa removida.', 'success');
        await Invoices._renderDespesas();
    },

    filterTable() {
        const statusF = document.getElementById('inv-filter-status')?.value || '';
        const methodF = document.getElementById('inv-filter-method')?.value || '';
        document.querySelectorAll('#invoices-tbody tr[data-status]').forEach(tr => {
            const matchS = !statusF || tr.dataset.status === statusF;
            const matchM = !methodF || tr.dataset.method === methodF;
            tr.style.display = (matchS && matchM) ? '' : 'none';
        });
    },

    openModal()  { document.getElementById('inv-bill-modal')?.classList.remove('hidden'); },
    closeModal(event) {
        if (event && event.target !== document.getElementById('inv-bill-modal')) return;
        document.getElementById('inv-bill-modal')?.classList.add('hidden');
    },

    async handleSave(e) {
        e.preventDefault();
        const type = document.querySelector('input[name="inv-type"]:checked')?.value || 'unica';
        const data = {
            type,
            category:      document.getElementById('inv-bill-cat')?.value || '',
            description:   document.getElementById('inv-bill-desc').value.trim(),
            value:         parseFloat(document.getElementById('inv-bill-value').value) || 0,
            paymentMethod: document.getElementById('inv-bill-method').value,
            status:        document.getElementById('inv-bill-status').value,
            clientName:    document.getElementById('inv-bill-client')?.value.trim() || ''
        };
        if (type === 'parcelada') data.installments = parseInt(document.getElementById('inv-parcelas')?.value) || 2;
        if (type === 'recorrente') data.recurringDay = parseInt(document.getElementById('inv-recorr-day')?.value) || 1;
        try {
            await Store.addInvoice(data);
            document.getElementById('inv-bill-modal').classList.add('hidden');
            App.showToast('Venda registrada! 💰', 'success');
            await Invoices._renderReceitas();
        } catch (err) { App.showToast('Erro: ' + err.message, 'error'); }
    },

    async markPaid(id) {
        if (!confirm('Marcar como pago?')) return;
        await Store.updateInvoice(id, { status: 'paid' });
        App.showToast('Marcado como pago! ✅', 'success');
        await Invoices._renderReceitas();
    },

    async deleteInv(id) {
        if (!confirm('Excluir este lançamento?')) return;
        await Store.deleteInvoice(id);
        App.showToast('Removido.', 'success');
        await Invoices._renderReceitas();
    }
};

// === HISTÓRICO DE ATENDIMENTOS ===
const Interactions = {
    async render(container) {
        const list = await Store.getInteractions();
        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <div class="toolbar">
            <span style="font-weight:600;color:var(--text-secondary)">Histórico de Atendimentos</span>
            <button class="btn btn-primary" onclick="Interactions.openModal()">
              <span class="material-symbols-outlined">add</span> Registrar
            </button>
          </div>
          <div class="card">
            <div class="table-wrapper">
              <table>
                <thead><tr><th>Data</th><th>Cliente</th><th>Tipo</th><th>Obs.</th><th>Ações</th></tr></thead>
                <tbody>
                  ${list.length === 0
                    ? '<tr><td colspan="5" class="text-center" style="color:var(--text-muted);padding:32px">Nenhum histórico ainda.</td></tr>'
                    : list.map(i => `<tr>
                        <td>${App.formatDate(i.date)}</td>
                        <td>${i.clientName || '-'}</td>
                        <td>${i.type || '-'}</td>
                        <td>${i.notes || '-'}</td>
                        <td><button class="btn btn-ghost btn-sm" onclick="Interactions.delete('${i.id}')" style="color:var(--danger)"><span class="material-symbols-outlined">delete</span></button></td>
                      </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="inter-modal" class="modal-overlay hidden" onclick="Interactions.closeModal(event)">
          <div class="modal-container" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Registrar Atendimento</h3>
              <button class="modal-close" onclick="Interactions.closeModal()">✕</button>
            </div>
            <form id="inter-form" onsubmit="Interactions.handleSave(event)" class="modal-body">
              <div class="form-grid">
                <div class="form-group"><label class="form-label">Cliente</label>
                  <input class="form-control" id="inter-client" placeholder="Nome da cliente" /></div>
                <div class="form-group"><label class="form-label">Data *</label>
                  <input class="form-control" type="date" id="inter-date" required value="${new Date().toISOString().split('T')[0]}" /></div>
                <div class="form-group"><label class="form-label">Tipo</label>
                  <select class="form-control" id="inter-type">
                    <option>Procedimento</option><option>Retoque</option><option>Remoção</option><option>Retorno</option><option>Outro</option>
                  </select></div>
                <div class="form-group form-group-full"><label class="form-label">Observações</label>
                  <textarea class="form-control" id="inter-notes" rows="3"></textarea></div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-ghost" onclick="Interactions.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>`;
    },

    openModal() { document.getElementById('inter-modal')?.classList.remove('hidden'); },
    closeModal(event) {
        if (event && event.target !== document.getElementById('inter-modal')) return;
        document.getElementById('inter-modal')?.classList.add('hidden');
    },

    async handleSave(e) {
        e.preventDefault();
        const data = {
            clientName: document.getElementById('inter-client').value.trim(),
            date:       firebase.firestore.Timestamp.fromDate(new Date(document.getElementById('inter-date').value)),
            type:       document.getElementById('inter-type').value,
            notes:      document.getElementById('inter-notes').value.trim()
        };
        await Store.addInteraction(data);
        document.getElementById('inter-modal').classList.add('hidden');
        App.showToast('Atendimento registrado!', 'success');
        await Interactions.render(document.getElementById('page-content'));
    },

    async delete(id) {
        if (!confirm('Excluir este registro?')) return;
        await Store.deleteInteraction(id);
        App.showToast('Removido.', 'success');
        await Interactions.render(document.getElementById('page-content'));
    }
};

// ============================================================
// MÓDULO DE ESTOQUE — Inventory
// ============================================================
const Inventory = {
    CATEGORIES: [
        'Descartáveis','Extensão de Cílios','Lash Lifting','Design de Sobrancelhas',
        'Microblading','Labial','Facial','Produtos de Limpeza','Equipamentos','Outros'
    ],
    // Qtd mínima e dias de alerta de validade
    LOW_STOCK_THRESHOLD: 10,
    EXPIRY_WARN_DAYS: 15,

    _daysUntil(ts) {
        if (!ts) return null;
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        const diff = d - new Date();
        return Math.ceil(diff / 86400000);
    },

    async render(container) {
        container.innerHTML = '<div style="display:flex;justify-content:center;padding:48px"><div class="spinner" style="border-color:rgba(196,117,138,0.2);border-top-color:var(--primary)"></div></div>';
        try {
            const [items, shopping] = await Promise.all([Store.getInventory(), Store.getShoppingList()]);
            Inventory._renderUI(container, items, shopping);
        } catch(e) {
            container.innerHTML = `<p style="color:var(--danger);padding:24px">Erro: ${e.message}</p>`;
        }
    },

    _renderUI(container, items, shopping) {
        const today = new Date(); today.setHours(0,0,0,0);
        const expiring = items.filter(i => { const d = Inventory._daysUntil(i.expiryDate); return d !== null && d >= 0 && d <= Inventory.EXPIRY_WARN_DAYS; });
        const expired  = items.filter(i => { const d = Inventory._daysUntil(i.expiryDate); return d !== null && d < 0; });
        const lowStock = items.filter(i => i.quantity !== undefined && i.quantity <= (i.minQty || Inventory.LOW_STOCK_THRESHOLD) && !expiring.find(e=>e.id===i.id) && !expired.find(e=>e.id===i.id));

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px;max-width:1000px;margin:0 auto">

          <!-- KPIs -->
          <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
            <div class="kpi-card blue"><div class="kpi-icon"><span class="material-symbols-outlined">inventory_2</span></div><div class="kpi-value">${items.length}</div><div class="kpi-label">Itens Cadastrados</div></div>
            <div class="kpi-card ${expired.length>0?'rose':'green'}"><div class="kpi-icon"><span class="material-symbols-outlined">event_busy</span></div><div class="kpi-value">${expired.length}</div><div class="kpi-label">Vencidos</div></div>
            <div class="kpi-card ${expiring.length>0?'gold':'green'}"><div class="kpi-icon"><span class="material-symbols-outlined">schedule</span></div><div class="kpi-value">${expiring.length}</div><div class="kpi-label">A Vencer (${Inventory.EXPIRY_WARN_DAYS}d)</div></div>
            <div class="kpi-card ${lowStock.length>0?'rose':'green'}"><div class="kpi-icon"><span class="material-symbols-outlined">warning</span></div><div class="kpi-value">${lowStock.length}</div><div class="kpi-label">Estoque Crítico</div></div>
          </div>

          <!-- Alertas -->
          ${expired.length > 0 ? `
          <div class="card" style="border-left:4px solid var(--danger);background:rgba(239,68,68,0.05)">
            <div class="card-header" style="padding-bottom:8px">
              <span class="card-title" style="color:var(--danger)">🚨 Produtos Vencidos</span>
              <span style="font-size:0.78rem;color:var(--text-muted)">Retire do estoque imediatamente</span>
            </div>
            <div class="card-body" style="display:flex;flex-wrap:wrap;gap:10px">
              ${expired.map(i=>`
              <div style="display:flex;align-items:center;gap:10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:var(--radius-sm);padding:10px 14px;flex:1;min-width:200px">
                <span class="material-symbols-outlined" style="color:var(--danger)">event_busy</span>
                <div style="flex:1">
                  <div style="font-weight:700;font-size:0.9rem">${i.name}</div>
                  <div style="font-size:0.75rem;color:var(--danger)">Venceu há ${Math.abs(Inventory._daysUntil(i.expiryDate))} dia(s)</div>
                </div>
                <button class="btn btn-ghost btn-sm" style="color:var(--primary);font-size:0.75rem" onclick="Inventory.addToShoppingList('${i.id}','${i.name.replace(/'/g,"\\'")}')">+ Comprar</button>
              </div>`).join('')}
            </div>
          </div>` : ''}

          ${expiring.length > 0 ? `
          <div class="card" style="border-left:4px solid var(--gold)">
            <div class="card-header" style="padding-bottom:8px">
              <span class="card-title" style="color:var(--gold)">⚠️ A Vencer em ${Inventory.EXPIRY_WARN_DAYS} Dias</span>
            </div>
            <div class="card-body" style="display:flex;flex-wrap:wrap;gap:10px">
              ${expiring.map(i=>`
              <div style="display:flex;align-items:center;gap:10px;background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.3);border-radius:var(--radius-sm);padding:10px 14px;flex:1;min-width:200px">
                <span class="material-symbols-outlined" style="color:var(--gold)">schedule</span>
                <div style="flex:1">
                  <div style="font-weight:700;font-size:0.9rem">${i.name}</div>
                  <div style="font-size:0.75rem;color:var(--gold)">Vence em ${Inventory._daysUntil(i.expiryDate)} dia(s) · ${App.formatDate(i.expiryDate)}</div>
                </div>
                <button class="btn btn-ghost btn-sm" style="color:var(--primary);font-size:0.75rem" onclick="Inventory.addToShoppingList('${i.id}','${i.name.replace(/'/g,"\\'")}')">+ Comprar</button>
              </div>`).join('')}
            </div>
          </div>` : ''}

          ${lowStock.length > 0 ? `
          <div class="card" style="border-left:4px solid var(--danger)">
            <div class="card-header" style="padding-bottom:8px">
              <span class="card-title" style="color:var(--danger)">📉 Estoque Crítico</span>
              <span style="font-size:0.78rem;color:var(--text-muted)">Abaixo da quantidade mínima</span>
            </div>
            <div class="card-body" style="display:flex;flex-wrap:wrap;gap:10px">
              ${lowStock.map(i=>`
              <div style="display:flex;align-items:center;gap:10px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:var(--radius-sm);padding:10px 14px;flex:1;min-width:200px">
                <span class="material-symbols-outlined" style="color:var(--danger)">warning</span>
                <div style="flex:1">
                  <div style="font-weight:700;font-size:0.9rem">${i.name}</div>
                  <div style="font-size:0.75rem;color:var(--danger)">${i.quantity} un. restantes · mín. ${i.minQty||Inventory.LOW_STOCK_THRESHOLD}</div>
                </div>
                <button class="btn btn-ghost btn-sm" style="color:var(--primary);font-size:0.75rem" onclick="Inventory.addToShoppingList('${i.id}','${i.name.replace(/'/g,"\\'")}')">+ Comprar</button>
              </div>`).join('')}
            </div>
          </div>` : ''}

          <!-- Toolbar -->
          <div class="toolbar">
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <input class="form-control" id="inv-search" placeholder="🔍 Buscar produto..." style="width:200px" oninput="Inventory.filterItems()" />
              <select class="form-control" id="inv-cat-filter" style="width:180px" onchange="Inventory.filterItems()">
                <option value="">Todas as categorias</option>
                ${Inventory.CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-outline" onclick="Inventory.openShoppingList()" style="position:relative">
                <span class="material-symbols-outlined">shopping_cart</span> Lista de Compras
                ${shopping.filter(s=>!s.checked).length>0?`<span style="position:absolute;top:-6px;right:-6px;background:var(--danger);color:white;border-radius:50%;width:18px;height:18px;font-size:0.65rem;display:flex;align-items:center;justify-content:center;font-weight:800">${shopping.filter(s=>!s.checked).length}</span>`:''}
              </button>
              <button class="btn btn-primary" onclick="Inventory.openModal()"><span class="material-symbols-outlined">add</span> Novo Item</button>
            </div>
          </div>

          <!-- Tabela de Estoque -->
          <div class="card">
            <div class="table-wrapper">
              <table id="inventory-table">
                <thead><tr>
                  <th>Produto</th><th>Categoria</th><th>Qtd</th><th>Qtd Mín.</th><th>Validade</th><th>Status</th><th>Ações</th>
                </tr></thead>
                <tbody id="inventory-tbody">
                  ${items.length===0
                    ? '<tr><td colspan="7" class="text-center" style="color:var(--text-muted);padding:32px">Nenhum item cadastrado ainda.<br><small>Clique em "Novo Item" para começar.</small></td></tr>'
                    : items.map(i => Inventory._itemRow(i)).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Modal Novo/Editar Item -->
          <div id="inv-item-modal" class="modal-overlay hidden" onclick="Inventory.closeModal(event)">
            <div class="modal-container" onclick="event.stopPropagation()">
              <div class="modal-header">
                <h3 class="modal-title" id="inv-modal-title">Novo Item de Estoque</h3>
                <button class="modal-close" onclick="Inventory.closeModal()">✕</button>
              </div>
              <form id="inv-item-form" onsubmit="Inventory.saveItem(event)" class="modal-body">
                <div class="form-grid">
                  <div class="form-group form-group-full">
                    <label class="form-label">Nome do Produto *</label>
                    <input class="form-control" id="inv-item-name" required placeholder="Ex: Microbrush descartável" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Categoria</label>
                    <select class="form-control" id="inv-item-cat">
                      ${Inventory.CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quantidade em Estoque *</label>
                    <input class="form-control" type="number" id="inv-item-qty" min="0" required placeholder="Ex: 50" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quantidade Mínima</label>
                    <input class="form-control" type="number" id="inv-item-minqty" min="0" placeholder="Ex: 10" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Data de Validade</label>
                    <input class="form-control" type="date" id="inv-item-expiry" />
                  </div>
                  <div class="form-group form-group-full">
                    <label class="form-label">Observações</label>
                    <input class="form-control" id="inv-item-notes" placeholder="Ex: Fornecedor X, lote ABC..." />
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-ghost" onclick="Inventory.closeModal()">Cancelar</button>
                  <button type="submit" class="btn btn-primary"><span class="material-symbols-outlined">save</span> Salvar</button>
                </div>
              </form>
            </div>
          </div>

          <!-- Modal Lista de Compras -->
          <div id="inv-shopping-modal" class="modal-overlay hidden" onclick="Inventory.closeShoppingModal(event)">
            <div class="modal-container" onclick="event.stopPropagation()" style="max-width:540px">
              <div class="modal-header">
                <h3 class="modal-title">🛒 Lista de Compras</h3>
                <button class="modal-close" onclick="Inventory.closeShoppingModal()">✕</button>
              </div>
              <div class="modal-body">
                <!-- Adicionar item manual -->
                <div style="display:flex;gap:8px;margin-bottom:16px">
                  <input class="form-control" id="shop-item-name" placeholder="Nome do produto..." style="flex:1" />
                  <input class="form-control" id="shop-item-qty" type="number" min="1" placeholder="Qtd." style="width:80px" />
                  <button class="btn btn-primary btn-sm" onclick="Inventory.saveShoppingItem()">
                    <span class="material-symbols-outlined">add</span>
                  </button>
                </div>
                <div id="shopping-list-body">
                  ${Inventory._renderShoppingItems(shopping)}
                </div>
              </div>
            </div>
          </div>

        </div>`;

        // Guarda os dados no DOM para filtros client-side
        container.querySelector('#inventory-tbody').dataset.items = JSON.stringify(items);
    },

    _itemRow(i) {
        const days = Inventory._daysUntil(i.expiryDate);
        const isExpired  = days !== null && days < 0;
        const isExpiring = days !== null && days >= 0 && days <= Inventory.EXPIRY_WARN_DAYS;
        const isLow      = i.quantity !== undefined && i.quantity <= (i.minQty || Inventory.LOW_STOCK_THRESHOLD);
        const statusBadge = isExpired
            ? '<span class="badge badge-brown">⛔ Vencido</span>'
            : isExpiring
            ? `<span class="badge badge-gold">⚠️ Vence em ${days}d</span>`
            : isLow
            ? '<span class="badge" style="background:rgba(239,68,68,0.15);color:var(--danger);font-weight:700">📉 Crítico</span>'
            : '<span class="badge badge-green">✅ OK</span>';

        return `<tr data-name="${(i.name||'').toLowerCase()}" data-cat="${i.category||''}">
            <td style="font-weight:600">${i.name||'-'}</td>
            <td><span style="font-size:0.8rem;padding:2px 8px;background:var(--primary-xlight);color:var(--primary);border-radius:20px">${i.category||'-'}</span></td>
            <td style="font-weight:700;font-size:1.05rem;${isLow?'color:var(--danger)':''}">${i.quantity ?? '-'}</td>
            <td style="color:var(--text-muted);font-size:0.88rem">${i.minQty || Inventory.LOW_STOCK_THRESHOLD}</td>
            <td style="font-size:0.88rem;${isExpired?'color:var(--danger);font-weight:700':isExpiring?'color:#d97706;font-weight:600':''}">${i.expiryDate ? App.formatDate(i.expiryDate) : '-'}</td>
            <td>${statusBadge}</td>
            <td>
              <div style="display:flex;gap:4px">
                <button class="btn btn-ghost btn-sm" title="Editar" onclick="Inventory.openModal('${i.id}')">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="btn btn-ghost btn-sm" title="Adicionar à lista de compras" style="color:var(--primary)" onclick="Inventory.addToShoppingList('${i.id}','${i.name.replace(/'/g,"\\'")}')">
                  <span class="material-symbols-outlined">add_shopping_cart</span>
                </button>
                <button class="btn btn-ghost btn-sm" title="Excluir" style="color:var(--danger)" onclick="Inventory.deleteItem('${i.id}')">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </td>
          </tr>`;
    },

    _renderShoppingItems(shopping) {
        if (shopping.length === 0) return '<p style="color:var(--text-muted);text-align:center;padding:20px">Lista vazia. Adicione itens acima.</p>';
        const pending = shopping.filter(s=>!s.checked);
        const done    = shopping.filter(s=>s.checked);
        let html = '';
        if (pending.length > 0) {
            html += `<div style="margin-bottom:8px;font-size:0.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">A Comprar (${pending.length})</div>`;
            html += pending.map(s=>`
            <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--radius-sm);background:var(--bg);border:1px solid var(--border);margin-bottom:6px" id="shop-row-${s.id}">
              <input type="checkbox" onchange="Inventory.toggleShop('${s.id}',this.checked)" style="width:18px;height:18px;accent-color:var(--primary)" />
              <span style="flex:1;font-weight:600">${s.name}</span>
              ${s.quantity?`<span style="font-size:0.8rem;color:var(--text-muted);background:var(--border);padding:2px 8px;border-radius:20px">${s.quantity} un.</span>`:''}
              <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="Inventory.removeShopItem('${s.id}')"><span class="material-symbols-outlined">delete</span></button>
            </div>`).join('');
        }
        if (done.length > 0) {
            html += `<div style="margin:12px 0 8px;font-size:0.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Já comprado (${done.length})</div>`;
            html += done.map(s=>`
            <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--radius-sm);background:var(--bg);border:1px solid var(--border);margin-bottom:6px;opacity:0.55" id="shop-row-${s.id}">
              <input type="checkbox" checked onchange="Inventory.toggleShop('${s.id}',this.checked)" style="width:18px;height:18px;accent-color:var(--primary)" />
              <span style="flex:1;text-decoration:line-through;color:var(--text-muted)">${s.name}</span>
              <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="Inventory.removeShopItem('${s.id}')"><span class="material-symbols-outlined">delete</span></button>
            </div>`).join('');
        }
        return html;
    },

    filterItems() {
        const q   = (document.getElementById('inv-search')?.value||'').toLowerCase();
        const cat = document.getElementById('inv-cat-filter')?.value||'';
        document.querySelectorAll('#inventory-tbody tr[data-name]').forEach(row => {
            const nameMatch = !q || row.dataset.name.includes(q);
            const catMatch  = !cat || row.dataset.cat === cat;
            row.style.display = (nameMatch && catMatch) ? '' : 'none';
        });
    },

    _editingId: null,

    async openModal(id = null) {
        Inventory._editingId = id;
        document.getElementById('inv-modal-title').textContent = id ? 'Editar Item' : 'Novo Item de Estoque';
        document.getElementById('inv-item-form').reset();
        if (id) {
            const items = JSON.parse(document.querySelector('#inventory-tbody').dataset.items || '[]');
            const item = items.find(i=>i.id===id);
            if (item) {
                document.getElementById('inv-item-name').value  = item.name||'';
                document.getElementById('inv-item-cat').value   = item.category||Inventory.CATEGORIES[0];
                document.getElementById('inv-item-qty').value   = item.quantity ?? '';
                document.getElementById('inv-item-minqty').value= item.minQty ?? '';
                document.getElementById('inv-item-notes').value = item.notes||'';
                if (item.expiryDate) {
                    const d = item.expiryDate.toDate ? item.expiryDate.toDate() : new Date(item.expiryDate);
                    document.getElementById('inv-item-expiry').value = d.toISOString().split('T')[0];
                }
            }
        }
        document.getElementById('inv-item-modal').classList.remove('hidden');
    },

    closeModal(e) {
        if (!e || e.target === document.getElementById('inv-item-modal')) {
            document.getElementById('inv-item-modal')?.classList.add('hidden');
        }
    },

    async saveItem(e) {
        e.preventDefault();
        const data = {
            name:     document.getElementById('inv-item-name').value.trim(),
            category: document.getElementById('inv-item-cat').value,
            quantity: parseInt(document.getElementById('inv-item-qty').value) || 0,
            minQty:   parseInt(document.getElementById('inv-item-minqty').value) || Inventory.LOW_STOCK_THRESHOLD,
            notes:    document.getElementById('inv-item-notes').value.trim(),
            expiryDate: document.getElementById('inv-item-expiry').value || null
        };
        try {
            if (Inventory._editingId) {
                await Store.updateInventoryItem(Inventory._editingId, data);
                App.showToast('Item atualizado! ✅', 'success');
            } else {
                await Store.addInventoryItem(data);
                App.showToast('Item adicionado ao estoque! ✅', 'success');
            }
            document.getElementById('inv-item-modal').classList.add('hidden');
            await Inventory.render(document.getElementById('page-content'));
        } catch(err) { App.showToast('Erro: ' + err.message, 'error'); }
    },

    async deleteItem(id) {
        if (!confirm('Remover este item do estoque?')) return;
        await Store.deleteInventoryItem(id);
        App.showToast('Item removido.', 'success');
        await Inventory.render(document.getElementById('page-content'));
    },

    async addToShoppingList(itemId, name) {
        const qty = prompt(`Quantidade desejada para "${name}"?`, '1');
        if (qty === null) return;
        await Store.addShoppingItem({ name, quantity: parseInt(qty)||1, inventoryItemId: itemId });
        App.showToast(`"${name}" adicionado à lista de compras! 🛒`, 'success');
        // Atualiza o badge do botão
        const shopping = await Store.getShoppingList();
        const pendingBtn = document.querySelector('button[onclick="Inventory.openShoppingList()"]');
        if (pendingBtn) {
            const pending = shopping.filter(s=>!s.checked).length;
            const badge = pendingBtn.querySelector('span[style*="position:absolute"]');
            if (badge) badge.textContent = pending;
            else if (pending > 0) pendingBtn.insertAdjacentHTML('beforeend',`<span style="position:absolute;top:-6px;right:-6px;background:var(--danger);color:white;border-radius:50%;width:18px;height:18px;font-size:0.65rem;display:flex;align-items:center;justify-content:center;font-weight:800">${pending}</span>`);
        }
    },

    async openShoppingList() {
        const shopping = await Store.getShoppingList();
        document.getElementById('shopping-list-body').innerHTML = Inventory._renderShoppingItems(shopping);
        document.getElementById('inv-shopping-modal').classList.remove('hidden');
    },

    closeShoppingModal(e) {
        if (!e || e.target === document.getElementById('inv-shopping-modal')) {
            document.getElementById('inv-shopping-modal')?.classList.add('hidden');
        }
    },

    async saveShoppingItem() {
        const name = document.getElementById('shop-item-name').value.trim();
        const qty  = parseInt(document.getElementById('shop-item-qty').value) || 1;
        if (!name) { App.showToast('Informe o nome do produto.', 'error'); return; }
        await Store.addShoppingItem({ name, quantity: qty });
        document.getElementById('shop-item-name').value = '';
        document.getElementById('shop-item-qty').value  = '';
        App.showToast(`${name} adicionado! 🛒`, 'success');
        const shopping = await Store.getShoppingList();
        document.getElementById('shopping-list-body').innerHTML = Inventory._renderShoppingItems(shopping);
    },

    async toggleShop(id, checked) {
        await Store.toggleShoppingItem(id, checked);
        const shopping = await Store.getShoppingList();
        document.getElementById('shopping-list-body').innerHTML = Inventory._renderShoppingItems(shopping);
    },

    async removeShopItem(id) {
        await Store.deleteShoppingItem(id);
        App.showToast('Removido da lista.', 'success');
        const shopping = await Store.getShoppingList();
        document.getElementById('shopping-list-body').innerHTML = Inventory._renderShoppingItems(shopping);
    }
};
