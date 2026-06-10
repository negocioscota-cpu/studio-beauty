// === CENTRAL FINANCEIRA ===
const Invoices = {
    _allInvoices: [],
    PAYMENT_METHODS: {
        pix:      { label: 'PIX',            icon: 'âš¡', color: '#00BCAF' },
        credit:   { label: 'CartÃ£o CrÃ©dito', icon: 'ðŸ’³', color: '#7B61FF' },
        debit:    { label: 'CartÃ£o DÃ©bito',  icon: 'ðŸ’³', color: '#5B8DEF' },
        cash:     { label: 'Dinheiro',       icon: 'ðŸ’µ', color: '#4CAF50' },
        transfer: { label: 'TransferÃªncia',  icon: 'ðŸ¦', color: '#FF9800' },
        other:    { label: 'Outro',          icon: 'ðŸ”„', color: '#9E9E9E' }
    },
    EXPENSE_CATEGORIES: [
        'DescartÃ¡veis','Insumos e Materiais','Colas e Adesivos','ExtensÃµes',
        'Equipamentos','Aluguel e EspaÃ§o','Marketing e Publicidade',
        'Ãgua e Energia','Internet e Telefone','Cursos e CapacitaÃ§Ã£o',
        'SalÃ¡rios e ComissÃµes','Impostos e Taxas','Software e Assinaturas',
        'Limpeza e Higiene','Embalagens','Outros'
    ],
    SERVICE_CATEGORIES: [
        'ExtensÃ£o de CÃ­lios','ManutenÃ§Ã£o de CÃ­lios','Design de Sobrancelhas',
        'Henna de Sobrancelhas','LaminaÃ§Ã£o de CÃ­lios','LaminaÃ§Ã£o de Sobrancelhas',
        'Lifting de CÃ­lios','RemoÃ§Ã£o de ExtensÃ£o','MicropigmentaÃ§Ã£o',
        'Brow Lamination','Fio a Fio','Volume Russo','Volume Mega','HÃ­brido',
        'Combo (CÃ­lios + Sobrancelhas)','Outros'
    ],
    _activeTab: 'receitas', // 'receitas' | 'despesas'

    async render(container) {
        try {
            const uid = Store._uid();
            const studioDoc = await db.collection('studios').doc(uid).get();
            Invoices.studioData = studioDoc.exists ? studioDoc.data() : {};
        } catch (e) {
            console.error('Erro ao carregar dados do estÃºdio:', e);
            Invoices.studioData = {};
        }

        container.innerHTML = `<div style="display:flex;flex-direction:column;gap:20px">
          <!-- TÃ­tulo Central Financeira -->
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <div>
              <h2 style="font-size:1.4rem;font-weight:800;color:var(--primary);margin:0">ðŸ’° Central Financeira</h2>
              <p style="font-size:0.82rem;color:var(--text-muted);margin:0">Gerencie receitas e contas a pagar em um sÃ³ lugar</p>
            </div>
          </div>
          <!-- Painel DRE Consolidado (BalanÃ§o de Caixa) -->
          <div id="cf-dre-panel" class="card" style="background:linear-gradient(135deg,var(--surface) 0%,var(--surface-2) 100%);border-color:var(--border)">
            <div class="card-body" style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;padding:16px 20px">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:24px">ðŸ“Š</span>
                <div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">BalanÃ§o de Caixa (MÃªs Atual)</div>
                  <div id="dre-saldo" style="font-size:1.3rem;font-weight:800;color:var(--text)">R$ 0,00</div>
                </div>
              </div>
              <div style="display:flex;gap:24px;flex-wrap:wrap">
                <div>
                  <div style="font-size:0.72rem;color:var(--text-muted)">ðŸ“¥ Total Recebido</div>
                  <div id="dre-receitas" style="font-size:0.95rem;font-weight:700;color:#28a745">R$ 0,00</div>
                </div>
                <div>
                  <div style="font-size:0.72rem;color:var(--text-muted)">ðŸ“¤ Total Pago (Despesas)</div>
                  <div id="dre-despesas" style="font-size:0.95rem;font-weight:700;color:var(--danger)">R$ 0,00</div>
                </div>
              </div>
            </div>
          </div>
          <!-- Abas -->
          <div style="display:flex;gap:4px;background:var(--surface);border-radius:var(--radius-sm);padding:4px;width:fit-content">
            <button id="tab-receitas" onclick="Invoices.switchTab('receitas')" style="padding:8px 20px;border-radius:var(--radius-sm);border:none;cursor:pointer;font-weight:600;font-size:0.88rem;transition:all .2s;background:var(--primary);color:#fff">ðŸ“¥ Contas a Receber</button>
            <button id="tab-despesas" onclick="Invoices.switchTab('despesas')" style="padding:8px 20px;border-radius:var(--radius-sm);border:none;cursor:pointer;font-weight:600;font-size:0.88rem;transition:all .2s;background:transparent;color:var(--text-secondary)">ðŸ“¤ Contas a Pagar</button>
            <button id="tab-inadimplencias" onclick="Invoices.switchTab('inadimplencias')" style="padding:8px 20px;border-radius:var(--radius-sm);border:none;cursor:pointer;font-weight:600;font-size:0.88rem;transition:all .2s;background:transparent;color:var(--text-secondary)">âš ï¸ PendÃªncias de CobranÃ§a</button>
          </div>
          <div id="cf-tab-receitas"></div>
          <div id="cf-tab-despesas" style="display:none"></div>
          <div id="cf-tab-inadimplencias" style="display:none"></div>
        </div>`;
        try { await Invoices._renderReceitas(); } catch(e) {
            const p = document.getElementById('cf-tab-receitas');
            if (p) p.innerHTML = `<div class="card" style="padding:24px;color:var(--danger)">âš ï¸ Erro ao carregar receitas: ${e.message}${e.message.includes('index')||e.message.includes('Index')?'<br><small>O banco de dados estÃ¡ criando o Ã­ndice. Aguarde 1-2 min e tente novamente.</small>':''}</div>`;
        }
        try { await Invoices._renderDespesas(); } catch(e) {
            const p = document.getElementById('cf-tab-despesas');
            if (p) p.innerHTML = `<div class="card" style="padding:24px;color:var(--danger)">âš ï¸ Erro ao carregar despesas: ${e.message}${e.message.includes('index')||e.message.includes('Index')?'<br><small>O banco de dados estÃ¡ criando o Ã­ndice. Aguarde 1-2 min e tente novamente.</small>':''}</div>`;
        }
        try { await Invoices._renderInadimplencias(); } catch(e) {
            const p = document.getElementById('cf-tab-inadimplencias');
            if (p) p.innerHTML = `<div class="card" style="padding:24px;color:var(--danger)">âš ï¸ Erro ao carregar pendÃªncias: ${e.message}</div>`;
        }
        Invoices.switchTab(Invoices._activeTab || 'receitas');
        await Invoices.updateDRE();
    },

    switchTab(tab) {
        Invoices._activeTab = tab;
        const tabs = ['receitas','despesas','inadimplencias'];
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

        Invoices._allInvoices = invoices;

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
                  <option value="">Todos</option><option value="paid">âœ… Recebido</option><option value="pending">â³ Pendente</option>
                </select></div>
              <div class="form-group" style="margin:0;flex:1;min-width:150px"><label class="form-label" style="font-size:0.78rem">Forma</label>
                <select class="form-control" id="inv-filter-method">
                  <option value="">Todas formas</option>${Object.entries(Invoices.PAYMENT_METHODS).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label}</option>`).join('')}
                </select></div>
              <button class="btn btn-ghost" style="height:40px" onclick="Invoices.filterReceitas()"><span class="material-symbols-outlined">filter_list</span> Filtrar</button>
              <button class="btn btn-ghost" style="height:40px;color:var(--success);border-color:rgba(76,175,80,.3)" onclick="Invoices.downloadReceitas()" title="Baixar Excel"><span class="material-symbols-outlined">download</span> Excel</button>
              <button class="btn btn-ghost" style="height:40px;color:var(--primary);border-color:rgba(88,50,63,.3)" onclick="Invoices.showMeiMonthlyReport()" title="RelatÃ³rio Mensal MEI"><span class="material-symbols-outlined">receipt_long</span> RelatÃ³rio MEI</button>
              <button class="btn btn-primary" style="height:40px" onclick="Invoices.openModal()"><span class="material-symbols-outlined">add</span> Nova Venda</button>
            </div>
          </div></div>
          ${Object.keys(byMethod).length > 0 ? `<div class="card"><div class="card-header"><span class="card-title">ðŸ’° Por Forma de Recebimento</span></div><div class="card-body" style="display:flex;flex-wrap:wrap;gap:12px">
            ${Object.entries(byMethod).map(([k,v])=>{ const m=Invoices.PAYMENT_METHODS[k]||Invoices.PAYMENT_METHODS.other; const pct=recebido>0?(v/recebido*100).toFixed(0):0; return `<div style="flex:1;min-width:120px;background:${m.color}10;border:1px solid ${m.color}30;border-radius:var(--radius-sm);padding:12px;text-align:center"><div style="font-size:1.4rem">${m.icon}</div><div style="font-size:0.75rem;color:var(--text-muted)">${m.label}</div><div style="font-size:1.1rem;font-weight:800;color:${m.color}">${App.formatCurrency(v)}</div><div style="font-size:0.72rem;color:var(--text-muted)">${pct}%</div></div>`; }).join('')}
          </div></div>` : ''}
          <!-- Tabela -->
          <div class="card"><div class="table-wrapper"><table>
            <thead><tr><th>Categoria</th><th>DescriÃ§Ã£o</th><th>Cliente</th><th>Tipo</th><th>Data</th><th>Recebimento</th><th>Valor</th><th>Status</th><th>AÃ§Ãµes</th></tr></thead>
            <tbody id="invoices-tbody">
              ${Invoices._renderInvRows(invoices)}
            </tbody>
          </table></div></div>
          <!-- Modal Nova Venda -->
          <div id="inv-bill-modal" class="modal-overlay hidden" onclick="Invoices.closeModal(event)">
            <div class="modal-container" style="max-width:520px" onclick="event.stopPropagation()">
              <div class="modal-header"><h3 class="modal-title">Nova Venda / Recebimento</h3><button class="modal-close" onclick="Invoices.closeModal()">âœ•</button></div>
              <form id="invoice-form" onsubmit="Invoices.handleSave(event)" class="modal-body">
                <!-- Tipo -->
                <div class="form-group"><label class="form-label">Tipo *</label>
                  <div style="display:flex;gap:8px">
                    ${[['unica','Ãšnica'],['parcelada','Parcelada'],['recorrente','Recorrente']].map(([v,l])=>`
                    <label style="flex:1;display:flex;align-items:center;gap:6px;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:0.88rem;font-weight:500;transition:all .2s">
                      <input type="radio" name="inv-type" value="${v}" ${v==='unica'?'checked':''} onchange="Invoices.onInvTypeChange()" style="accent-color:var(--primary)" />${l}</label>`).join('')}
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-group form-group-full"><label class="form-label">Categoria *</label>
                    <select class="form-control" id="inv-bill-cat" required>
                      ${Invoices.SERVICE_CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('')}
                    </select></div>
                  <div class="form-group form-group-full"><label class="form-label">DescriÃ§Ã£o *</label><input class="form-control" id="inv-bill-desc" required placeholder="Ex: Volume Russo completo" /></div>
                  <div class="form-group"><label class="form-label">Valor (R$) *</label><input class="form-control" type="number" id="inv-bill-value" min="0" step="0.01" required /></div>
                  <div class="form-group"><label class="form-label">Forma de Recebimento *</label><select class="form-control" id="inv-bill-method" required>${Object.entries(Invoices.PAYMENT_METHODS).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label}</option>`).join('')}</select></div>
                  <div class="form-group" id="inv-parc-wrap" style="display:none"><label class="form-label">NÂº de Parcelas</label><input class="form-control" type="number" id="inv-parcelas" min="2" max="60" value="2" /></div>
                  <div class="form-group" id="inv-recorr-wrap" style="display:none"><label class="form-label">Dia de Vencimento (mensal)</label><input class="form-control" type="number" id="inv-recorr-day" min="1" max="31" value="1" /></div>
                  <div class="form-group"><label class="form-label">Status</label><select class="form-control" id="inv-bill-status"><option value="paid">âœ… Recebido</option><option value="pending">â³ Pendente</option></select></div>
                  <div class="form-group"><label class="form-label">Cliente</label>
                    <div style="display:flex;gap:6px">
                      <input class="form-control" id="inv-bill-client" placeholder="Nome da cliente" style="flex:1" />
                      <button type="button" class="btn btn-ghost btn-sm" onclick="Invoices.openClientHistory()" title="Ver histÃ³rico" style="padding:8px 10px;white-space:nowrap"><span class="material-symbols-outlined" style="font-size:18px">history</span></button>
                    </div>
                  </div>
                </div>
                <div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="Invoices.closeModal()">Cancelar</button><button type="submit" class="btn btn-primary"><span class="material-symbols-outlined">save</span> Salvar</button></div>
              </form>
            </div>
          </div>
          <!-- Drawer HistÃ³rico do Cliente -->
          <div id="inv-client-history-panel" style="display:none;position:fixed;top:0;right:0;width:380px;height:100vh;background:var(--card-bg);border-left:1px solid var(--border);z-index:9000;overflow-y:auto;padding:20px;box-shadow:-4px 0 20px rgba(0,0,0,.15)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
              <h3 style="font-weight:800;font-size:1rem;margin:0">ðŸ‘¤ HistÃ³rico da Cliente</h3>
              <button onclick="document.getElementById('inv-client-history-panel').style.display='none'" class="btn btn-ghost btn-sm">âœ•</button>
            </div>
            <div id="inv-client-history-content" style="font-size:0.88rem;color:var(--text-muted)">Digite o nome da cliente e clique no Ã­cone ðŸ‘†</div>
          </div>
          <!-- Modal Recibo MEI -->
          <div id="inv-mei-modal" class="modal-overlay hidden" onclick="Invoices.closeMeiModal(event)">
            <div class="modal-container" style="max-width:650px;background:#ffffff;color:#1e1e1e" onclick="event.stopPropagation()">
              <div class="modal-header" style="border-bottom:1px solid #ddd;display:flex;justify-content:space-between;padding:12px 20px;background:#f5f5f5;align-items:center">
                <h3 class="modal-title" style="color:#333;font-weight:700;margin:0;font-size:1.05rem">ðŸ§¾ Recibo / Nota MEI Simplificada</h3>
                <div style="display:flex;gap:8px;align-items:center">
                  <button class="btn btn-sm" onclick="Invoices.printMeiReceipt()" style="background:#58323F;color:#fff;font-weight:600;display:inline-flex;align-items:center;gap:4px;border:none;border-radius:4px;padding:6px 12px;font-size:0.8rem;cursor:pointer"><span class="material-symbols-outlined" style="font-size:16px">print</span> Imprimir / PDF</button>
                  <button class="modal-close" onclick="Invoices.closeMeiModal()" style="color:#555;background:transparent;border:none;cursor:pointer;font-size:1.1rem">âœ•</button>
                </div>
              </div>
              <div id="inv-mei-content" style="padding:24px;font-family:monospace;line-height:1.4"></div>
            </div>
          </div>`;
    },

    _renderInvRows(invoices) {
        if (!invoices.length) return '<tr><td colspan="9" class="text-center" style="color:var(--text-muted);padding:32px">Nenhum lanÃ§amento no perÃ­odo.</td></tr>';
        const tipoMap = { unica:'Ãšnica', parcelada:'Parcelada', recorrente:'Recorrente' };
        return invoices.map(i => {
            const pm = Invoices.PAYMENT_METHODS[i.paymentMethod]||Invoices.PAYMENT_METHODS.other;
            return `<tr data-status="${i.status||''}" data-method="${i.paymentMethod||'other'}">
              <td><span style="font-size:0.78rem;padding:2px 8px;background:var(--primary-xlight);color:var(--primary);border-radius:20px">${i.category||'-'}</span></td>
              <td>${i.description||'-'}</td>
              <td style="font-size:0.85rem">${i.clientName||'-'}</td>
              <td style="font-size:0.82rem">${tipoMap[i.type]||'Ãšnica'}</td>
              <td style="font-size:0.85rem">${App.formatDate(i.createdAt)}</td>
              <td><span style="display:inline-flex;align-items:center;gap:4px;font-size:0.78rem;padding:3px 8px;background:${pm.color}15;color:${pm.color};border-radius:20px;font-weight:600">${pm.icon} ${pm.label}</span></td>
              <td style="font-weight:700;color:var(--primary)">${App.formatCurrency(i.value)}</td>
              <td><span class="badge ${i.status==='paid'?'badge-green':i.status==='pending'?'badge-gold':'badge-brown'}">${i.status==='paid'?'Recebido':i.status==='pending'?'Pendente':'Cancelado'}</span></td>
              <td><div style="display:flex;gap:4px">
                ${i.status==='paid'?`<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Invoices.showMeiReceipt('${i.id}')" title="Emitir Recibo / Nota MEI" style="color:var(--primary)"><span class="material-symbols-outlined" style="font-size:16px">description</span></button>`:''}
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
                  <span>ðŸ‘ <b>${hist.totalVisits}</b> visitas</span>
                  <span>ðŸ’° <b>${App.formatCurrency(hist.totalSpent)}</b> gasto</span>
                </div>
              </div>
              ${hist.history.length===0?'<p style="color:var(--text-muted)">Sem histÃ³rico.</p>':hist.history.map(h=>`
              <div style="padding:10px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;font-size:0.82rem">
                <div style="display:flex;justify-content:space-between"><b>${h.type==='ficha'?'ðŸ“‹ Ficha TÃ©cnica':'ðŸ“… Agendamento'}</b><span style="color:var(--text-muted)">${App.formatDate(h.date||h.createdAt)}</span></div>
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

        const catMap = {};
        expenses.filter(e => e.status === 'paid').forEach(e => {
            catMap[e.category] = (catMap[e.category] || 0) + (e.value || 0);
        });
        const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

        const barsHtml = sortedCats.map(([cat, val]) => {
            const pct = totalPago > 0 ? (val / totalPago * 100).toFixed(0) : 0;
            return `
            <div style="margin-bottom:14px">
              <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px">
                <span style="font-weight:600;color:var(--text-secondary)">${cat}</span>
                <span style="color:var(--text-muted)">${App.formatCurrency(val)} (${pct}%)</span>
              </div>
              <div style="height:6px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:100px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--primary) 0%,var(--gold) 100%);border-radius:100px"></div>
              </div>
            </div>`;
        }).join('') || '<div style="font-size:0.78rem;color:var(--text-muted);text-align:center;padding:12px">Nenhum pagamento realizado no perÃ­odo.</div>';

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
              <div class="form-group" style="margin:0;flex:1;min-width:130px"><label class="form-label" style="font-size:0.78rem">Status</label><select class="form-control" id="exp-status"><option value="">Todos</option><option value="pending">â³ A Pagar</option><option value="paid">âœ… Pago</option><option value="overdue">ðŸ”´ Vencido</option></select></div>
              <button class="btn btn-ghost" style="height:40px" onclick="Invoices.filterExpenses()"><span class="material-symbols-outlined">filter_list</span> Filtrar</button>
              <button class="btn btn-ghost" style="height:40px;color:var(--success);border-color:rgba(76,175,80,.3)" onclick="Invoices.downloadDespesas()" title="Baixar Excel"><span class="material-symbols-outlined">download</span> Excel</button>
              <button class="btn btn-primary" style="height:40px" onclick="Invoices.openExpModal()"><span class="material-symbols-outlined">add</span> Nova Despesa</button>
            </div>
          </div></div>
          <div style="display:flex;gap:20px;flex-wrap:wrap">
            <!-- Tabela despesas -->
            <div class="card" style="flex:2;min-width:320px;margin:0">
              <div class="table-wrapper">
                <table>
                  <thead><tr><th>DescriÃ§Ã£o</th><th>Categoria</th><th>Tipo</th><th>Vencimento</th><th>Forma Pag.</th><th>Valor</th><th>Status</th><th>AÃ§Ãµes</th></tr></thead>
                  <tbody id="expenses-tbody">
                    ${Invoices._renderExpRows(expenses)}
                  </tbody>
                </table>
              </div>
            </div>
            <!-- DistribuiÃ§Ã£o Proporcional -->
            <div class="card" style="flex:1;min-width:280px;margin:0">
              <div class="card-header" style="border-bottom:1.5px solid var(--border);padding:12px 16px"><span class="card-title" style="font-size:0.88rem;font-weight:700">ðŸ“Š DistribuiÃ§Ã£o de Gastos</span></div>
              <div id="expenses-cats-body" class="card-body" style="padding:16px">
                ${barsHtml}
              </div>
            </div>
          </div>
          <!-- Modal Nova Despesa -->
          <div id="exp-modal" class="modal-overlay hidden" onclick="Invoices.closeExpModal(event)">
            <div class="modal-container" style="max-width:520px" onclick="event.stopPropagation()">
              <div class="modal-header"><h3 class="modal-title">Nova Despesa</h3><button class="modal-close" onclick="Invoices.closeExpModal()">âœ•</button></div>
              <form id="expense-form" onsubmit="Invoices.handleSaveExp(event)" class="modal-body">
                <!-- Tipo da despesa -->
                <div class="form-group"><label class="form-label">Tipo de Despesa *</label>
                  <div style="display:flex;gap:8px">
                    ${[['unica','Ãšnica'],['parcelada','Parcelada'],['recorrente','Recorrente']].map(([v,l])=>`
                    <label style="flex:1;display:flex;align-items:center;gap:6px;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:0.88rem;font-weight:500;transition:all .2s" id="exp-type-lbl-${v}">
                      <input type="radio" name="exp-type" value="${v}" ${v==='unica'?'checked':''} onchange="Invoices.onExpTypeChange()" style="accent-color:var(--primary)" />${l}</label>`).join('')}
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-group form-group-full"><label class="form-label">Categoria *</label>
                    <select class="form-control" id="exp-cat" required>
                      ${Invoices.EXPENSE_CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('')}
                    </select></div>
                  <div class="form-group form-group-full"><label class="form-label">DescriÃ§Ã£o *</label><input class="form-control" id="exp-desc" required placeholder="Ex: DescartÃ¡veis para copa" /></div>
                  <div class="form-group"><label class="form-label">Valor (R$) *</label><input class="form-control" type="number" id="exp-val" min="0" step="0.01" required /></div>
                  <div class="form-group"><label class="form-label">Forma de Pagamento</label>
                    <select class="form-control" id="exp-pay">${Object.entries(Invoices.PAYMENT_METHODS).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label}</option>`).join('')}</select></div>
                  <div class="form-group"><label class="form-label">Vencimento *</label><input class="form-control" type="date" id="exp-due" required /></div>
                  <div class="form-group" id="exp-parcelas-wrap" style="display:none"><label class="form-label">NÂº de Parcelas</label><input class="form-control" type="number" id="exp-parcelas" min="2" max="60" value="2" placeholder="Ex: 12" /></div>
                  <div class="form-group" id="exp-recorr-wrap" style="display:none"><label class="form-label">Dia de Vencimento (mensal)</label><input class="form-control" type="number" id="exp-recorr-day" min="1" max="31" value="1" /></div>
                </div>
                <div class="form-group"><label class="form-label">ObservaÃ§Ãµes</label><textarea class="form-control" id="exp-obs" rows="2" placeholder="Notas adicionais..."></textarea></div>
                <div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="Invoices.closeExpModal()">Cancelar</button><button type="submit" class="btn btn-primary" style="background:var(--danger);border-color:var(--danger)"><span class="material-symbols-outlined">save</span> Salvar Despesa</button></div>
              </form>
            </div>
          </div>`;
        // Setar data de hoje como padrÃ£o do vencimento
        const dueInput = document.getElementById('exp-due');
        if (dueInput) dueInput.value = fmt(today);
    },

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
          <!-- KPI InadimplÃªncia -->
          <div class="kpi-grid" style="grid-template-columns:repeat(2,1fr);margin-bottom:20px">
            <div class="kpi-card rose"><div class="kpi-icon"><span class="material-symbols-outlined">warning</span></div><div class="kpi-value">${overdueInvoices.length}</div><div class="kpi-label">CobranÃ§as Pendentes</div></div>
            <div class="kpi-card gold"><div class="kpi-icon"><span class="material-symbols-outlined">hourglass_empty</span></div><div class="kpi-value" style="font-size:1.1rem;color:var(--danger)">${App.formatCurrency(totalOverdue)}</div><div class="kpi-label">Total em Atraso</div></div>
          </div>
          <!-- Tabela -->
          <div class="card">
            <div class="table-wrapper">
              <table>
                <thead><tr><th>Cliente</th><th>Procedimento/Categoria</th><th>Data Procedimento</th><th>Atraso</th><th>Valor</th><th>AÃ§Ã£o de CobranÃ§a</th></tr></thead>
                <tbody>
                  ${overdueInvoices.map(i => {
                      const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt || 0);
                      const diffDays = Math.max(1, Math.floor((new Date() - dt) / (1000 * 60 * 60 * 24)));
                      const textCobranca = `OlÃ¡ ${i.clientName || 'cliente'}, tudo bem? Passando para lembrar com carinho que ficou pendente o acerto do procedimento ${i.description || i.category} feito no dia ${dt.toLocaleDateString('pt-BR')} no valor de ${App.formatCurrency(i.value)}. Deseja que eu te envie o link de pagamento ou a chave PIX? ðŸ’•`;
                      const linkWhats = `https://wa.me/?text=${encodeURIComponent(textCobranca)}`;
                      return `
                      <tr>
                        <td style="font-weight:600">${i.clientName || 'Cliente'}</td>
                        <td>${i.description || i.category}</td>
                        <td>${dt.toLocaleDateString('pt-BR')}</td>
                        <td><span style="font-size:0.75rem;padding:2px 8px;border-radius:10px;background:rgba(220,53,69,0.1);color:#dc3545;font-weight:600">â³ ${diffDays} dias</span></td>
                        <td style="font-weight:700;color:var(--danger)">${App.formatCurrency(i.value)}</td>
                        <td>
                          <a href="${linkWhats}" target="_blank" class="btn btn-ghost btn-sm" style="color:#25D366;display:inline-flex;align-items:center;gap:4px;font-weight:600;text-decoration:none" title="Enviar cobranÃ§a via WhatsApp">
                            <span class="material-symbols-outlined">chat</span> Cobrar via WhatsApp
                          </a>
                        </td>
                      </tr>`;
                  }).join('') || '<tr><td colspan="6" class="text-center" style="color:var(--text-muted);padding:32px">ParabÃ©ns! Nenhuma pendÃªncia em atraso. ðŸŽ‰</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>`;
    },

    _renderExpRows(expenses) {
        if (!expenses.length) return '<tr><td colspan="8" class="text-center" style="color:var(--text-muted);padding:32px">Nenhuma despesa no perÃ­odo.</td></tr>';
        return expenses.map(e => {
            const pm = Invoices.PAYMENT_METHODS[e.paymentMethod]||Invoices.PAYMENT_METHODS.other;
            const due = e.dueDate?.toDate ? e.dueDate.toDate() : (e.dueDate ? new Date(e.dueDate) : null);
            const isOverdue = due && e.status!=='paid' && due < new Date();
            const statusLabel = e.status==='paid' ? 'âœ… Pago' : isOverdue ? 'ðŸ”´ Vencido' : 'â³ A Pagar';
            const badgeCls = e.status==='paid' ? 'badge-green' : isOverdue ? 'badge-danger' : 'badge-gold';
            const tipoMap = { unica:'Ãšnica', parcelada:'Parcelada', recorrente:'Recorrente' };
            return `<tr data-status="${e.status||'pending'}" data-category="${e.category||''}">
              <td>${e.description||'-'}</td>
              <td><span style="font-size:0.78rem;padding:2px 8px;background:var(--primary-xlight);color:var(--primary);border-radius:20px">${e.category||'-'}</span></td>
              <td style="font-size:0.82rem">${tipoMap[e.type]||'Ãšnica'}</td>
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

        const catMap = {};
        expenses.filter(e => e.status === 'paid').forEach(e => {
            catMap[e.category] = (catMap[e.category] || 0) + (e.value || 0);
        });
        const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

        const barsHtml = sortedCats.map(([cat, val]) => {
            const pct = totalPago > 0 ? (val / totalPago * 100).toFixed(0) : 0;
            return `
            <div style="margin-bottom:14px">
              <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px">
                <span style="font-weight:600;color:var(--text-secondary)">${cat}</span>
                <span style="color:var(--text-muted)">${App.formatCurrency(val)} (${pct}%)</span>
              </div>
              <div style="height:6px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:100px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--primary) 0%,var(--gold) 100%);border-radius:100px"></div>
              </div>
            </div>`;
        }).join('') || '<div style="font-size:0.78rem;color:var(--text-muted);text-align:center;padding:12px">Nenhum pagamento realizado no perÃ­odo.</div>';

        const catsBody = document.getElementById('expenses-cats-body');
        if (catsBody) catsBody.innerHTML = barsHtml;
    },

    async downloadReceitas() {
        const from = document.getElementById('inv-from')?.value;
        const to   = document.getElementById('inv-to')?.value;
        let invoices = await Store.getInvoices();
        if (from) { const d = new Date(from); d.setHours(0,0,0,0); invoices = invoices.filter(i => { const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt||0); return dt >= d; }); }
        if (to)   { const d = new Date(to); d.setHours(23,59,59,999); invoices = invoices.filter(i => { const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt||0); return dt <= d; }); }
        const status = document.getElementById('inv-filter-status')?.value;
        if (status) invoices = invoices.filter(i => i.status === status);
        if (!invoices.length) { App.showToast('Nenhum lanÃ§amento para exportar.', 'warning'); return; }
        const tipoMap = { unica:'Ãšnica', parcelada:'Parcelada', recorrente:'Recorrente' };
        const header = ['Categoria','DescriÃ§Ã£o','Cliente','Tipo','Data','Forma de Recebimento','Valor (R$)','Status'];
        const rows = invoices.map(i => {
            const pm = Invoices.PAYMENT_METHODS[i.paymentMethod]||Invoices.PAYMENT_METHODS.other;
            const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt||0);
            return [
                i.category||'', i.description||'', i.clientName||'',
                tipoMap[i.type]||'Ãšnica', dt.toLocaleDateString('pt-BR'),
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
        App.showToast('Planilha de receitas baixada! ðŸ“Š', 'success');
    },

    async downloadDespesas() {
        const from = document.getElementById('exp-from')?.value;
        const to   = document.getElementById('exp-to')?.value;
        let expenses = await Store.getExpenses({ from, to });
        const status = document.getElementById('exp-status')?.value;
        if (status) expenses = expenses.filter(e => e.status === status);
        if (!expenses.length) { App.showToast('Nenhuma despesa para exportar.', 'warning'); return; }
        const tipoMap = { unica:'Ãšnica', parcelada:'Parcelada', recorrente:'Recorrente' };
        const header = ['DescriÃ§Ã£o','Categoria','Tipo','Vencimento','Forma de Pagamento','Valor (R$)','Status','ObservaÃ§Ãµes'];
        const rows = expenses.map(e => {
            const pm = Invoices.PAYMENT_METHODS[e.paymentMethod]||Invoices.PAYMENT_METHODS.other;
            const due = e.dueDate?.toDate ? e.dueDate.toDate() : (e.dueDate ? new Date(e.dueDate) : null);
            const isOverdue = due && e.status!=='paid' && due < new Date();
            return [
                e.description||'', e.category||'', tipoMap[e.type]||'Ãšnica',
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
        App.showToast('Planilha de despesas baixada! ðŸ“Š', 'success');
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
            App.showToast('Despesa registrada! ðŸ“¤', 'success');
            Invoices.switchTab('despesas');
            await Invoices._renderDespesas();
        } catch (err) { App.showToast('Erro: ' + err.message, 'error'); }
    },

    async markExpPaid(id) {
        if (!confirm('Marcar despesa como paga?')) return;
        await Store.updateExpense(id, { status: 'paid' });
        App.showToast('Despesa marcada como paga! âœ…', 'success');
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
            App.showToast('Venda registrada! ðŸ’°', 'success');
            await Invoices._renderReceitas();
        } catch (err) { App.showToast('Erro: ' + err.message, 'error'); }
    },

    async markPaid(id) {
        if (!confirm('Marcar como pago?')) return;
        await Store.updateInvoice(id, { status: 'paid' });
        App.showToast('Marcado como pago! âœ…', 'success');
        await Invoices._renderReceitas();
        await Invoices._renderInadimplencias();
    },

    async deleteInv(id) {
        if (!confirm('Excluir este lanÃ§amento?')) return;
        await Store.deleteInvoice(id);
        App.showToast('Removido.', 'success');
        await Invoices._renderReceitas();
        await Invoices._renderInadimplencias();
    },

    showMeiReceipt(id) {
        const item = (Invoices._allInvoices || []).find(x => x.id === id);
        if (!item) return;
        
        const dt = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt || 0);
        const studio = Invoices.studioData || {};
        const content = document.getElementById('inv-mei-content');
        if (!content) return;
        
        content.innerHTML = `
        <div id="mei-print-area" style="padding:16px;border:2px solid #000;border-radius:4px;background:#fff;color:#000">
          <div style="text-align:center;border-bottom:1px dashed #000;padding-bottom:12px;margin-bottom:12px">
            <h2 style="margin:0;font-size:1.25rem;font-weight:800;color:#000">${studio.studioName || studio.companyName || 'STUDIO BEAUTY'}</h2>
            <div style="font-size:0.8rem;margin-top:4px;color:#333">CNPJ: ${studio.cnpj || 'â€”'} | Tel: ${studio.phone || 'â€”'}</div>
            <div style="font-size:0.8rem;color:#333">${studio.address || 'â€”'}</div>
          </div>
          
          <div style="font-size:0.85rem;margin-bottom:12px;color:#000">
            <div style="text-align:center;font-weight:700;text-decoration:underline;margin-bottom:8px">COMPROVANTE DE PRESTAÃ‡ÃƒO DE SERVIÃ‡OS (MEI)</div>
            <div><strong>NÂº DOCUMENTO:</strong> ${item.id.substring(0,8).toUpperCase()}</div>
            <div><strong>DATA EMISSÃƒO:</strong> ${new Date().toLocaleDateString('pt-BR')}</div>
            <div><strong>CLIENTE (TOMADOR):</strong> ${item.clientName || 'CONSUMIDOR FINAL'}</div>
          </div>
          
          <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:0.85rem;color:#000">
            <thead>
              <tr style="border-bottom:1px solid #000;text-align:left">
                <th style="padding:4px 0">DESCRIÃ‡ÃƒO DO SERVIÃ‡O</th>
                <th style="text-align:right;padding:4px 0">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:6px 0">${item.description || item.category} (Executado em ${dt.toLocaleDateString('pt-BR')})</td>
                <td style="text-align:right;padding:6px 0">${App.formatCurrency(item.value)}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="border-top:1px dashed #000;padding-top:12px;margin-top:12px;font-size:0.85rem;text-align:right;font-weight:700;color:#000">
            TOTAL RECEBIDO (${(item.paymentMethod || 'Outro').toUpperCase()}): ${App.formatCurrency(item.value)}
          </div>
          
          <div style="border-top:1px solid #000;margin-top:16px;padding-top:8px;font-size:0.68rem;color:#555;text-align:justify;font-style:italic">
            Documento emitido por Microempreendedor Individual (MEI), dispensado de emissÃ£o de nota fiscal eletrÃ´nica para consumidor final pessoa fÃ­sica, conforme o Art. 26, Â§ 1Âº, inciso II, da Lei Complementar nÂº 123/2006.
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
        printWin.document.write('<html><head><title>Imprimir Recibo MEI</title><style>');
        printWin.document.write('body{font-family:monospace;padding:20px;color:#000;background:#fff}');
        printWin.document.write('table{width:100%;border-collapse:collapse}');
        printWin.document.write('th,td{padding:6px;border-bottom:1px solid #000}');
        printWin.document.write('</style></head><body>');
        printWin.document.write(area.innerHTML);
        printWin.document.write('</body></html>');
        printWin.document.close();
        printWin.focus();
        printWin.print();
        printWin.close();
    },
    async showMeiMonthlyReport() {
        const from = document.getElementById('inv-from')?.value;
        const to = document.getElementById('inv-to')?.value;
        let invoices = await Store.getInvoices();
        
        // Filtra por perÃ­odo
        if (from) { const d = new Date(from); d.setHours(0,0,0,0); invoices = invoices.filter(i => { const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt||0); return dt >= d; }); }
        if (to)   { const d = new Date(to); d.setHours(23,59,59,999); invoices = invoices.filter(i => { const dt = i.createdAt?.toDate ? i.createdAt.toDate() : new Date(i.createdAt||0); return dt <= d; }); }
        
        const paidInvoices = invoices.filter(i => i.status === 'paid');
        const totalServicos = paidInvoices.reduce((s, i) => s + (i.value || 0), 0);
        const studio = Invoices.studioData || {};

        const modalHtml = `
        <div id="mei-report-print-area" style="padding:10px;font-family:sans-serif;color:#000;line-height:1.5">
          <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:15px">
            <h3 style="margin:0;font-size:1.1rem;font-weight:700">RELATÃ“RIO MENSAL DAS RECEITAS BRUTAS</h3>
            <div style="font-size:0.75rem;margin-top:2px">Artigo 26, Â§ 2Âº, inciso I da Lei Complementar nÂº 123/06</div>
          </div>
          
          <table style="width:100%;border-collapse:collapse;font-size:0.8rem;margin-bottom:15px">
            <tr>
              <td style="padding:6px;border:1px solid #000;width:70%"><strong>RazÃ£o Social:</strong> ${studio.companyName || studio.studioName || 'â€”'}</td>
              <td style="padding:6px;border:1px solid #000"><strong>CNPJ:</strong> ${studio.cnpj || 'â€”'}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:6px;border:1px solid #000"><strong>PerÃ­odo de ApuraÃ§Ã£o:</strong> ${from ? new Date(from).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'MÃªs Corrente'}</td>
            </tr>
          </table>

          <table style="width:100%;border-collapse:collapse;font-size:0.78rem;margin-bottom:15px">
            <thead>
              <tr style="background:#eaeaea">
                <th style="padding:6px;border:1px solid #000;text-align:left">RECEITA BRUTA MENSAL â€” ATIVIDADES</th>
                <th style="padding:6px;border:1px solid #000;text-align:right;width:30%">VALOR ACUMULADO (R$)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:6px;border:1px solid #000">I - Receitas brutas com comÃ©rcio (Venda de cosmÃ©ticos/produtos)</td>
                <td style="padding:6px;border:1px solid #000;text-align:right">R$ 0,00</td>
              </tr>
              <tr>
                <td style="padding:6px;border:1px solid #000;font-weight:700">II - Receitas brutas com prestaÃ§Ã£o de serviÃ§os (CÃ­lios, design, etc.)</td>
                <td style="padding:6px;border:1px solid #000;text-align:right;font-weight:700">${App.formatCurrency(totalServicos)}</td>
              </tr>
              <tr style="background:#f5f5f5;font-weight:800">
                <td style="padding:6px;border:1px solid #000">III - TOTAL DE RECEITAS BRUTAS DO PERÃODO (I + II)</td>
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
                <div class="modal-header" style="border-bottom:1px solid #ddd;display:flex;justify-content:space-between;padding:12px 20px;background:#f5f5f5;align-items:center">
                  <h3 class="modal-title" style="color:#333;font-weight:700;margin:0;font-size:1.05rem">ðŸ“‹ RelatÃ³rio Mensal de Faturamento MEI</h3>
                  <div style="display:flex;gap:8px">
                    <button class="btn btn-sm" onclick="Invoices.printMeiReport()" style="background:#58323F;color:#fff;font-weight:600;display:inline-flex;align-items:center;gap:4px;border:none;border-radius:4px;padding:6px 12px;font-size:0.8rem;cursor:pointer"><span class="material-symbols-outlined" style="font-size:16px">print</span> Imprimir</button>
                    <button class="modal-close" onclick="document.getElementById('inv-mei-report-modal').classList.add('hidden')" style="color:#555;background:transparent;border:none;cursor:pointer;font-size:1.1rem">âœ•</button>
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
        printWin.document.write('<html><head><title>RelatÃ³rio MEI</title><style>');
        printWin.document.write('body{font-family:sans-serif;padding:20px;color:#000;background:#fff}');
        printWin.document.write('table{width:100%;border-collapse:collapse;margin-bottom:15px}');
        printWin.document.write('th,td{padding:8px;border:1px solid #000}');
        printWin.document.write('</style></head><body>');
        printWin.document.write(area.innerHTML);
        printWin.document.write('</body></html>');
        printWin.document.close();
        printWin.focus();
        printWin.print();
        printWin.close();
    }
};

// === HISTÃ“RICO DE ATENDIMENTOS ===
const Interactions = {
    async render(container) {
        const list = await Store.getInteractions();
        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <div class="toolbar">
            <span style="font-weight:600;color:var(--text-secondary)">HistÃ³rico de Atendimentos</span>
            <button class="btn btn-primary" onclick="Interactions.openModal()">
              <span class="material-symbols-outlined">add</span> Registrar
            </button>
          </div>
          <div class="card">
            <div class="table-wrapper">
              <table>
                <thead><tr><th>Data</th><th>Cliente</th><th>Tipo</th><th>Obs.</th><th>AÃ§Ãµes</th></tr></thead>
                <tbody>
                  ${list.length === 0
                    ? '<tr><td colspan="5" class="text-center" style="color:var(--text-muted);padding:32px">Nenhum histÃ³rico ainda.</td></tr>'
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
              <button class="modal-close" onclick="Interactions.closeModal()">âœ•</button>
            </div>
            <form id="inter-form" onsubmit="Interactions.handleSave(event)" class="modal-body">
              <div class="form-grid">
                <div class="form-group"><label class="form-label">Cliente</label>
                  <input class="form-control" id="inter-client" placeholder="Nome da cliente" /></div>
                <div class="form-group"><label class="form-label">Data *</label>
                  <input class="form-control" type="date" id="inter-date" required value="${new Date().toISOString().split('T')[0]}" /></div>
                <div class="form-group"><label class="form-label">Tipo</label>
                  <select class="form-control" id="inter-type">
                    <option>Procedimento</option><option>Retoque</option><option>RemoÃ§Ã£o</option><option>Retorno</option><option>Outro</option>
                  </select></div>
                <div class="form-group form-group-full"><label class="form-label">ObservaÃ§Ãµes</label>
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

