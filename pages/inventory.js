// === GESTÃO DE ESTOQUE ===
const Inventory = {

    async render(container) {
        container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:200px">
            <div class="spinner"></div></div>`;

        let items = [];
        try { items = await Store.getInventory(); } catch(e) { console.warn(e); }

        const low = items.filter(i => i.qty <= i.minQty);
        // Alertas de validade
        const now = new Date();
        const soon30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiring = items.filter(i => {
            if (!i.expiryDate) return false;
            const d = i.expiryDate.toDate ? i.expiryDate.toDate() : new Date(i.expiryDate);
            return d <= soon30;
        });
        const expired = expiring.filter(i => {
            const d = i.expiryDate.toDate ? i.expiryDate.toDate() : new Date(i.expiryDate);
            return d <= now;
        });

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">

          <!-- Header -->
          <div class="card" style="background:linear-gradient(135deg,#1a3a2a,#2d6a4f);color:white;padding:24px;border-radius:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
              <div>
                <h2 style="font-size:1.4rem;font-weight:800;margin:0">📦 Gestão de Estoque</h2>
                <p style="opacity:0.85;margin-top:4px;font-size:0.88rem">
                  ${items.length} produto${items.length !== 1 ? 's' : ''} cadastrado${items.length !== 1 ? 's' : ''}
                  ${low.length > 0 ? ` · <strong style="color:#ffd166">⚠️ ${low.length} abaixo do mínimo</strong>` : ''}
                  ${expired.length > 0 ? ` · <strong style="color:#ff6b6b">🚫 ${expired.length} vencido${expired.length !== 1 ? 's' : ''}</strong>` : ''}
                  ${(expiring.length - expired.length) > 0 ? ` · <strong style="color:#ffa94d">⏰ ${expiring.length - expired.length} vencendo em breve</strong>` : ''}
                </p>
              </div>
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <a href="https://lashandbeauty.com.br" target="_blank" class="btn"
                  style="background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3);backdrop-filter:blur(4px);display:inline-flex;align-items:center;gap:4px;text-decoration:none;font-size:0.82rem;padding:8px 14px;border-radius:8px;font-weight:600;cursor:pointer">
                  <span class="material-symbols-outlined" style="font-size:18px">storefront</span> Lash & Beauty
                </a>
                <button class="btn-export-excel" onclick="Inventory.exportExcel()" style="background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3)">
                  <span class="material-symbols-outlined" style="font-size:18px">download</span> Excel
                </button>
                <button class="btn" onclick="Inventory.openXmlModal()"
                  style="background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3);backdrop-filter:blur(4px);display:inline-flex;align-items:center;gap:4px">
                  <span class="material-symbols-outlined" style="font-size:18px">upload_file</span> Importar XML
                </button>
                <button class="btn" onclick="Inventory.openModal()"
                  style="background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3);backdrop-filter:blur(4px)">
                  <span class="material-symbols-outlined">add</span> Novo Produto
                </button>
              </div>
            </div>
          </div>

          <!-- Abas -->
          <div style="display:flex;border-radius:10px;border:1px solid var(--border);overflow:hidden;margin-bottom:8px">
            <button id="tab-products" onclick="Inventory.switchTab('products')" style="flex:1;padding:10px 16px;font-size:0.82rem;font-weight:700;border:none;cursor:pointer;transition:all 0.2s;background:var(--primary);color:#fff">📋 Produtos</button>
            <button id="tab-movements" onclick="Inventory.switchTab('movements')" style="flex:1;padding:10px 16px;font-size:0.82rem;font-weight:700;border:none;cursor:pointer;transition:all 0.2s;background:var(--bg-secondary);color:var(--text-primary);border-left:1px solid var(--border)">📊 Movimentações</button>
            <button id="tab-shopping" onclick="Inventory.switchTab('shopping')" style="flex:1;padding:10px 16px;font-size:0.82rem;font-weight:700;border:none;cursor:pointer;transition:all 0.2s;background:var(--bg-secondary);color:var(--text-primary);border-left:1px solid var(--border)">🛒 Compras</button>
            <button id="tab-audits" onclick="Inventory.switchTab('audits')" style="flex:1;padding:10px 16px;font-size:0.82rem;font-weight:700;border:none;cursor:pointer;transition:all 0.2s;background:var(--bg-secondary);color:var(--text-primary);border-left:1px solid var(--border)">🗃️ Balanço</button>
          </div>

          <div id="products-tab-content" style="display:flex;flex-direction:column;gap:20px">
              <!-- Alerta de baixo estoque -->
              ${low.length > 0 ? `
              <div class="card" style="border:1px solid rgba(255,193,7,0.4);background:rgba(255,193,7,0.06);padding:20px;border-radius:12px">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                  <span class="material-symbols-outlined" style="color:#ffc107;font-size:24px">warning</span>
                  <strong style="color:var(--text-primary)">Produtos abaixo do estoque mínimo</strong>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px">
                  ${low.map(i => `
                    <div style="padding:6px 14px;border-radius:20px;background:rgba(255,193,7,0.15);border:1px solid rgba(255,193,7,0.3);font-size:0.82rem;display:flex;align-items:center;gap:6px">
                      <span style="font-weight:700;color:#e0a800">${i.qty}</span>
                      <span style="color:var(--text-secondary)">${i.name}</span>
                      <span style="color:var(--text-muted);font-size:0.75rem">(mín: ${i.minQty})</span>
                    </div>
                  `).join('')}
                </div>
              </div>` : ''}

              <!-- Alerta de validade -->
              ${expiring.length > 0 ? `
              <div class="card" style="border:1px solid rgba(255,107,107,0.4);background:rgba(255,107,107,0.06);padding:20px;border-radius:12px">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                  <span class="material-symbols-outlined" style="color:#ff6b6b;font-size:24px">event_busy</span>
                  <strong style="color:var(--text-primary)">Produtos com validade próxima ou vencidos</strong>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px">
                  ${expiring.map(i => {
                    const d = i.expiryDate.toDate ? i.expiryDate.toDate() : new Date(i.expiryDate);
                    const isExpired = d <= now;
                    return `<div style="padding:6px 14px;border-radius:20px;background:${isExpired ? 'rgba(255,107,107,0.15)' : 'rgba(255,169,77,0.15)'};border:1px solid ${isExpired ? 'rgba(255,107,107,0.3)' : 'rgba(255,169,77,0.3)'};font-size:0.82rem;display:flex;align-items:center;gap:6px">
                      <span style="font-weight:700;color:${isExpired ? '#ff6b6b' : '#ffa94d'}">${isExpired ? '🚫' : '⏰'}</span>
                      <span style="color:var(--text-secondary)">${i.name}</span>
                      <span style="color:var(--text-muted);font-size:0.75rem">${d.toLocaleDateString('pt-BR')}</span>
                    </div>`;
                  }).join('')}
                </div>
              </div>` : ''}

              <!-- Lista de produtos -->
              <div class="card">
                <div class="card-header" style="flex-wrap:wrap;gap:10px">
                  <span class="card-title">📋 Produtos</span>
                  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                    <select class="form-control" id="inv-filter-cat" onchange="Inventory.filterTable()" style="width:180px;font-size:0.82rem">
                      <option value="">Todas categorias</option>
                      <option>Henna</option><option>Extensão de Cílios</option><option>Lifting</option>
                      <option>Brow Lamination</option><option>Higiene</option><option>Descartável</option><option>Outro</option>
                    </select>
                    <input class="form-control" id="inv-search" placeholder="Buscar produto..."
                      style="width:180px;font-size:0.82rem" oninput="Inventory.filterTable()" />
                  </div>
                </div>
                <div class="table-wrapper">
                  <table id="inv-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th style="text-align:center">Qtd</th>
                        <th style="text-align:center">Mín</th>
                        <th>Custo</th>
                        <th>Validade</th>
                        <th>Status</th>
                        <th style="text-align:center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items.length === 0
                        ? `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)">
                            <span class="material-symbols-outlined" style="font-size:36px;display:block;margin-bottom:8px;opacity:0.4">inventory_2</span>
                            Nenhum produto cadastrado ainda.</td></tr>`
                        : items.map(i => Inventory._row(i)).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>

          <div id="movements-tab-content" style="display:none;flex-direction:column;gap:20px"></div>
          <div id="shopping-tab-content" style="display:none;flex-direction:column;gap:20px"></div>
          <div id="audits-tab-content" style="display:none;flex-direction:column;gap:20px"></div>

        </div>

        <!-- Modal Produto -->
        <div id="inv-modal" class="modal-overlay hidden" onclick="Inventory.closeModal(event)">
          <div class="modal-container" onclick="event.stopPropagation()" style="max-width:480px">
            <div class="modal-header">
              <h3 class="modal-title" id="inv-modal-title">Novo Produto</h3>
              <button class="modal-close" onclick="Inventory.closeModal()">✕</button>
            </div>
            <form id="inv-form" onsubmit="Inventory.handleSave(event)" class="modal-body">
              <div class="form-grid">
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Nome do Produto *</label>
                  <input class="form-control" id="inv-name" required placeholder="Ex: Henna Castanho" />
                </div>
                <div class="form-group">
                  <label class="form-label">Quantidade Atual *</label>
                  <input class="form-control" id="inv-qty" type="number" min="0" step="0.01" required placeholder="0" />
                </div>
                <div class="form-group">
                  <label class="form-label">Quantidade Mínima *</label>
                  <input class="form-control" id="inv-min-qty" type="number" min="0" step="0.01" required placeholder="2" />
                  <span style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;display:block">Alerta abaixo deste valor</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Unidade</label>
                  <select class="form-control" id="inv-unit">
                    <option>unid</option>
                    <option>ml</option>
                    <option>g</option>
                    <option>L</option>
                    <option>kg</option>
                    <option>cx</option>
                    <option>pct</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Categoria</label>
                  <select class="form-control" id="inv-category">
                    <option value="">— Sem categoria —</option>
                    <option>Henna</option>
                    <option>Extensão de Cílios</option>
                    <option>Lifting</option>
                    <option>Brow Lamination</option>
                    <option>Higiene</option>
                    <option>Descartável</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">💰 Preço de Custo (R$)</label>
                  <input class="form-control" type="number" id="inv-cost" step="0.01" min="0" placeholder="0,00" />
                </div>
                <div class="form-group">
                  <label class="form-label">📅 Data de Validade</label>
                  <input class="form-control" type="date" id="inv-expiry" />
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">🏭 Fornecedor</label>
                  <input class="form-control" type="text" id="inv-supplier" placeholder="Nome do fornecedor" />
                </div>
              </div>
              <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:20px">
                <button type="button" class="btn btn-ghost" onclick="Inventory.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" id="inv-save-btn">
                  <span class="material-symbols-outlined">save</span> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal Baixa manual de produto -->
        <div id="inv-adjust-modal" class="modal-overlay hidden" onclick="Inventory.closeAdjustModal(event)">
          <div class="modal-container" onclick="event.stopPropagation()" style="max-width:380px">
            <div class="modal-header">
              <h3 class="modal-title">Ajustar Quantidade</h3>
              <button class="modal-close" onclick="Inventory.closeAdjustModal()">✕</button>
            </div>
            <div class="modal-body">
              <p id="inv-adjust-name" style="font-weight:700;margin-bottom:16px;color:var(--text-primary)"></p>
              <div class="form-group">
                <label class="form-label">Nova Quantidade</label>
                <input class="form-control" id="inv-adjust-qty" type="number" min="0" step="0.01" placeholder="0" />
              </div>
              <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:20px">
                <button class="btn btn-ghost" onclick="Inventory.closeAdjustModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="Inventory.confirmAdjust()">
                  <span class="material-symbols-outlined">check</span> Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>`;
    },

    _row(i) {
        const isLow = i.qty <= i.minQty;
        const pct = i.minQty > 0 ? Math.min(100, Math.round(i.qty / i.minQty * 100)) : 100;
        const barColor = isLow ? '#ff6b6b' : pct < 150 ? '#ffc107' : '#28a745';
        // Validade
        let expiryHtml = '<span style="color:var(--text-muted);font-size:0.8rem">—</span>';
        if (i.expiryDate) {
            const d = i.expiryDate.toDate ? i.expiryDate.toDate() : new Date(i.expiryDate);
            const now = new Date();
            const isExpired = d <= now;
            const soon = d <= new Date(now.getTime() + 30*24*60*60*1000);
            const color = isExpired ? '#ff6b6b' : soon ? '#ffa94d' : 'var(--text-secondary)';
            expiryHtml = `<span style="color:${color};font-size:0.8rem;font-weight:${isExpired||soon?700:400}">${d.toLocaleDateString('pt-BR')}</span>`;
        }
        return `<tr data-name="${(i.name || '').toLowerCase()}" data-category="${i.category || ''}" ${isLow ? 'style="background:rgba(255,107,107,0.04)"' : ''}>
          <td>
            <div style="font-weight:600;color:var(--text-primary)">${i.name}</div>
            <div style="font-size:0.72rem;color:var(--text-muted)">${i.category || ''} ${i.supplier ? '· ' + i.supplier : ''}</div>
          </td>
          <td style="text-align:center">
            <div style="font-size:1.1rem;font-weight:700;color:${isLow ? '#ff6b6b' : 'var(--text-primary)'}">${i.qty} <span style="font-size:0.7rem;font-weight:400;color:var(--text-muted)">${i.unit || 'unid'}</span></div>
            <div style="height:4px;border-radius:4px;background:var(--border);margin-top:4px;width:60px;margin-left:auto;margin-right:auto">
              <div style="height:100%;border-radius:4px;background:${barColor};width:${Math.min(pct,100)}%;transition:width 0.4s"></div>
            </div>
          </td>
          <td style="text-align:center;color:var(--text-secondary)">${i.minQty}</td>
          <td style="font-size:0.82rem;color:var(--text-secondary)">${i.costPrice ? 'R$ ' + Number(i.costPrice).toFixed(2) : '—'}</td>
          <td>${expiryHtml}</td>
          <td>
            ${isLow
              ? `<span class="badge badge-orange">⚠️ Baixo</span>`
              : `<span class="badge badge-green">✅ OK</span>`}
          </td>
          <td style="text-align:center">
            <div style="display:flex;gap:4px;justify-content:center">
              <button class="btn btn-ghost btn-sm" onclick="Inventory.openAdjustModal('${i.id}','${(i.name||'').replace(/'/g,"\\'")}',${i.qty})" title="Ajustar quantidade">
                <span class="material-symbols-outlined" style="font-size:16px">edit</span>
              </button>
              <button class="btn btn-ghost btn-sm" onclick="Inventory.openModal('${i.id}')" title="Editar produto">
                <span class="material-symbols-outlined" style="font-size:16px">tune</span>
              </button>
              <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="Inventory.delete('${i.id}','${(i.name||'').replace(/'/g,"\\'")}')" title="Excluir">
                <span class="material-symbols-outlined" style="font-size:16px">delete</span>
              </button>
            </div>
          </td>
        </tr>`;
    },

    filterTable() {
        const q = (document.getElementById('inv-search')?.value || '').toLowerCase();
        const cat = document.getElementById('inv-filter-cat')?.value || '';
        document.querySelectorAll('#inv-table tbody tr[data-name]').forEach(r => {
            const nameMatch = r.dataset.name.includes(q);
            const catMatch = !cat || r.dataset.category === cat;
            r.style.display = (nameMatch && catMatch) ? '' : 'none';
        });
    },

    _editingId: null,

    async openModal(id = null) {
        Inventory._editingId = id;
        document.getElementById('inv-form').reset();
        document.getElementById('inv-modal-title').textContent = id ? 'Editar Produto' : 'Novo Produto';

        if (id) {
            try {
                const items = await Store.getInventory();
                const item = items.find(i => i.id === id);
                if (item) {
                    document.getElementById('inv-name').value     = item.name || '';
                    document.getElementById('inv-qty').value      = item.qty ?? 0;
                    document.getElementById('inv-min-qty').value  = item.minQty ?? 0;
                    document.getElementById('inv-unit').value     = item.unit || 'unid';
                    document.getElementById('inv-category').value = item.category || '';
                    document.getElementById('inv-cost').value     = item.costPrice || '';
                    document.getElementById('inv-expiry').value   = item.expiryDate
                        ? (item.expiryDate.toDate ? item.expiryDate.toDate().toISOString().split('T')[0] : item.expiryDate)
                        : '';
                    document.getElementById('inv-supplier').value = item.supplier || '';
                }
            } catch(e) { console.warn(e); }
        }
        document.getElementById('inv-modal').classList.remove('hidden');
    },

    closeModal(event) {
        if (event && event.target !== document.getElementById('inv-modal')) return;
        document.getElementById('inv-modal')?.classList.add('hidden');
        Inventory._editingId = null;
    },

    async handleSave(e) {
        e.preventDefault();
        const btn = document.getElementById('inv-save-btn');
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div>';

        const data = {
            name:      document.getElementById('inv-name').value.trim(),
            qty:       parseFloat(document.getElementById('inv-qty').value) || 0,
            minQty:    parseFloat(document.getElementById('inv-min-qty').value) || 0,
            unit:      document.getElementById('inv-unit').value,
            category:  document.getElementById('inv-category').value,
            costPrice: parseFloat(document.getElementById('inv-cost').value) || 0,
            expiryDate: document.getElementById('inv-expiry').value || null,
            supplier:  document.getElementById('inv-supplier').value.trim() || ''
        };

        try {
            if (Inventory._editingId) {
                await Store.updateInventoryItem(Inventory._editingId, data);
                App.toast('Produto atualizado!', 'success');
            } else {
                await Store.addInventoryItem(data);
                App.toast('Produto cadastrado!', 'success');
            }
            document.getElementById('inv-modal')?.classList.add('hidden');
            Inventory._editingId = null;
            await Inventory.render(document.getElementById('page-content'));
        } catch(err) {
            App.toast('Erro: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined">save</span> Salvar';
        }
    },

    _adjustingId: null,

    openAdjustModal(id, name, currentQty) {
        Inventory._adjustingId = id;
        document.getElementById('inv-adjust-name').textContent = `Produto: ${name}`;
        document.getElementById('inv-adjust-qty').value = currentQty;
        document.getElementById('inv-adjust-modal').classList.remove('hidden');
    },

    closeAdjustModal(event) {
        if (event && event.target !== document.getElementById('inv-adjust-modal')) return;
        document.getElementById('inv-adjust-modal')?.classList.add('hidden');
        Inventory._adjustingId = null;
    },

    async confirmAdjust() {
        const newQty = parseFloat(document.getElementById('inv-adjust-qty').value);
        if (isNaN(newQty) || newQty < 0) {
            App.toast('Quantidade inválida.', 'warning');
            return;
        }
        try {
            await Store.updateInventoryItem(Inventory._adjustingId, { qty: newQty });
            App.toast('Quantidade atualizada!', 'success');
            document.getElementById('inv-adjust-modal')?.classList.add('hidden');
            Inventory._adjustingId = null;
            await Inventory.render(document.getElementById('page-content'));
        } catch(err) {
            App.toast('Erro: ' + err.message, 'error');
        }
    },

    async delete(id, name) {
        if (!confirm(`Excluir "${name}" do estoque?`)) return;
        try {
            await Store.deleteInventoryItem(id);
            App.toast(`"${name}" removido.`, 'info');
            await Inventory.render(document.getElementById('page-content'));
        } catch(err) {
            App.toast('Erro: ' + err.message, 'error');
        }
    },

    // Chamado pela schedule ao marcar atendimento como "Realizado"
    // Retorna lista de produtos para o modal de baixa
    async buildUsageModal(apptId, onConfirm) {
        let items = [];
        try { items = await Store.getInventory(); } catch(e) {}
        if (items.length === 0) { onConfirm([]); return; }

        const modalId = 'inv-usage-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
          <div class="modal-container" onclick="event.stopPropagation()" style="max-width:480px">
            <div class="modal-header">
              <h3 class="modal-title">📦 Produtos Utilizados</h3>
              <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
            </div>
            <div class="modal-body">
              <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px">
                Selecione os produtos usados neste atendimento para dar baixa automática no estoque.
              </p>
              <div id="inv-usage-list" style="display:flex;flex-direction:column;gap:10px;max-height:320px;overflow-y:auto">
                ${items.map(i => `
                  <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;background:var(--bg-tertiary)">
                    <input type="checkbox" id="inv-use-${i.id}" value="${i.id}"
                      style="width:16px;height:16px;accent-color:var(--primary);flex-shrink:0" />
                    <label for="inv-use-${i.id}" style="flex:1;font-weight:500;cursor:pointer">${i.name}
                      <span style="font-size:0.75rem;color:var(--text-muted);font-weight:400"> · ${i.qty} ${i.unit || 'unid'} em estoque</span>
                    </label>
                    <input type="number" id="inv-qty-${i.id}" min="0.01" step="0.01" value="1" placeholder="Qtd"
                      style="width:70px;padding:6px 8px;border-radius:6px;border:1px solid var(--border);background:var(--bg-card);font-size:0.85rem;color:var(--text-primary)" />
                  </div>`).join('')}
              </div>
              <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:20px">
                <button class="btn btn-ghost" onclick="document.getElementById('${modalId}').remove();(${onConfirm.toString()})([])">
                  Pular
                </button>
                <button class="btn btn-primary" id="inv-usage-confirm">
                  <span class="material-symbols-outlined">check</span> Confirmar Baixa
                </button>
              </div>
            </div>
          </div>`;
        document.body.appendChild(modal);

        document.getElementById('inv-usage-confirm').onclick = async () => {
            const used = items
                .filter(i => document.getElementById(`inv-use-${i.id}`)?.checked)
                .map(i => ({
                    id: i.id,
                    name: i.name,
                    qty: parseFloat(document.getElementById(`inv-qty-${i.id}`)?.value) || 1,
                    currentQty: i.qty,
                    unit: i.unit || 'unid'
                }));
            modal.remove();
            await onConfirm(used);
        };
    },

    async exportExcel() {
        let items = [];
        try { items = await Store.getInventory(); } catch(e) { console.warn(e); }
        const data = items.map(i => ({
            'Produto': i.name || '',
            'Qtd Atual': i.qty ?? 0,
            'Qtd Mínima': i.minQty ?? 0,
            'Unidade': i.unit || 'unid',
            'Preço Custo': i.costPrice ? `R$ ${Number(i.costPrice).toFixed(2)}` : '',
            'Fornecedor': i.supplier || '',
            'Validade': i.expiryDate ? (i.expiryDate.toDate ? i.expiryDate.toDate().toLocaleDateString('pt-BR') : i.expiryDate) : '',
            'Status': i.qty <= i.minQty ? '⚠ Baixo' : '✓ OK'
        }));
        ExcelExport.fromData(data, `estoque_${new Date().toISOString().slice(0,10)}`, 'Estoque');
    },

    switchTab(tab) {
        const tabs = ['products','movements','shopping','audits'];
        tabs.forEach(t => {
            const btn = document.getElementById('tab-' + t);
            const cont = document.getElementById(t + '-tab-content');
            if (!btn || !cont) return;
            if (t === tab) {
                btn.style.background = 'var(--primary)'; btn.style.color = '#fff';
                cont.style.display = 'flex';
            } else {
                btn.style.background = 'var(--bg-secondary)'; btn.style.color = 'var(--text-primary)';
                cont.style.display = 'none';
            }
        });
        if (tab === 'audits') Inventory.loadAuditsTab();
        if (tab === 'movements') Inventory.loadMovementsTab();
        if (tab === 'shopping') Inventory.loadShoppingTab();
    },

    // === ABA MOVIMENTAÇÕES ===
    async loadMovementsTab() {
        const container = document.getElementById('movements-tab-content');
        if (!container) return;
        container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:120px"><div class="spinner"></div></div>`;
        try {
            const logs = await Store.getMovementLogs();
            let html = `
            <div class="card">
                <div class="card-header"><span class="card-title">📊 Histórico de Movimentações</span></div>
                <div class="table-wrapper">
                    <table>
                        <thead><tr>
                            <th>Data/Hora</th>
                            <th>Produto</th>
                            <th style="text-align:center">Tipo</th>
                            <th style="text-align:center">Qtd</th>
                            <th>Descrição</th>
                            <th>Responsável</th>
                        </tr></thead>
                        <tbody>`;
            if (logs.length === 0) {
                html += `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted)">Nenhuma movimentação registrada ainda.</td></tr>`;
            } else {
                logs.forEach(l => {
                    const ts = l.timestamp?.toDate ? l.timestamp.toDate() : (l.createdAt?.toDate ? l.createdAt.toDate() : new Date());
                    const isIn = l.type === 'in';
                    html += `<tr>
                        <td style="font-size:0.82rem;white-space:nowrap">${ts.toLocaleDateString('pt-BR')} ${ts.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</td>
                        <td style="font-weight:600">${l.itemName || (l.usedItems ? l.usedItems.map(u=>u.name).join(', ') : '—')}</td>
                        <td style="text-align:center">${isIn
                            ? '<span style="color:#28a745;font-weight:700">↑ Entrada</span>'
                            : '<span style="color:#ff6b6b;font-weight:700">↓ Saída</span>'}</td>
                        <td style="text-align:center;font-weight:700">${l.qty || (l.usedItems ? l.usedItems.reduce((s,u)=>s+(u.qty||0),0) : '—')}</td>
                        <td style="font-size:0.82rem;color:var(--text-secondary)">${l.description || (l.apptId ? 'Baixa por atendimento' : '—')}</td>
                        <td style="font-size:0.82rem;color:var(--text-muted)">${l.user || '—'}</td>
                    </tr>`;
                });
            }
            html += `</tbody></table></div></div>`;
            container.innerHTML = html;
        } catch(e) {
            container.innerHTML = `<div class="card" style="padding:24px;text-align:center;color:var(--text-muted)">Erro ao carregar movimentações.</div>`;
        }
    },

    // === ABA LISTA DE COMPRAS ===
    async loadShoppingTab() {
        const container = document.getElementById('shopping-tab-content');
        if (!container) return;
        container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:120px"><div class="spinner"></div></div>`;
        try {
            const shopItems = await Store.getShoppingList();
            const invItems = await Store.getInventory();
            const lowItems = invItems.filter(i => i.qty <= i.minQty);
            const pending = shopItems.filter(s => !s.checked).length;

            let html = `
            <div class="card">
                <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
                    <span class="card-title">🛒 Lista de Compras ${pending > 0 ? `<span style="background:var(--primary);color:#fff;border-radius:20px;padding:2px 10px;font-size:0.75rem;margin-left:8px">${pending} pendente${pending!==1?'s':''}</span>` : ''}</span>
                    <div style="display:flex;gap:8px;flex-wrap:wrap">
                        ${lowItems.length > 0 ? `<button class="btn btn-sm" onclick="Inventory._generateFromLow()" style="background:rgba(255,193,7,0.15);color:#e0a800;border:1px solid rgba(255,193,7,0.3);display:inline-flex;align-items:center;gap:4px">
                            <span class="material-symbols-outlined" style="font-size:16px">auto_fix</span> Gerar dos itens baixos (${lowItems.length})
                        </button>` : ''}
                        <button class="btn btn-sm" onclick="Inventory._shareShoppingList()" style="background:rgba(37,211,102,0.15);color:#25d366;border:1px solid rgba(37,211,102,0.3);display:inline-flex;align-items:center;gap:4px">
                            <span class="material-symbols-outlined" style="font-size:16px">share</span> WhatsApp
                        </button>
                        <button class="btn btn-sm" onclick="Inventory._clearChecked()" style="background:rgba(255,107,107,0.1);color:#ff6b6b;border:1px solid rgba(255,107,107,0.2);display:inline-flex;align-items:center;gap:4px">
                            <span class="material-symbols-outlined" style="font-size:16px">cleaning_services</span> Limpar comprados
                        </button>
                    </div>
                </div>
                <!-- Add manual -->
                <div style="display:flex;gap:8px;padding:16px;border-bottom:1px solid var(--border)">
                    <input class="form-control" id="shop-new-name" placeholder="Nome do item..." style="flex:1;font-size:0.85rem" />
                    <input class="form-control" id="shop-new-qty" type="number" min="1" value="1" style="width:70px;font-size:0.85rem" />
                    <button class="btn btn-primary btn-sm" onclick="Inventory._addShoppingItem()" style="display:inline-flex;align-items:center;gap:4px">
                        <span class="material-symbols-outlined" style="font-size:16px">add</span> Adicionar
                    </button>
                </div>
                <div id="shopping-list" style="padding:12px">`;

            if (shopItems.length === 0) {
                html += `<div style="text-align:center;padding:32px;color:var(--text-muted)">
                    <span class="material-symbols-outlined" style="font-size:36px;display:block;margin-bottom:8px;opacity:0.4">shopping_cart</span>
                    Lista vazia. Adicione itens ou gere automaticamente dos produtos abaixo do mínimo.
                </div>`;
            } else {
                shopItems.forEach(s => {
                    html += `<div style="display:flex;align-items:center;gap:12px;padding:10px 8px;border-bottom:1px solid var(--border);${s.checked ? 'opacity:0.5;' : ''}">
                        <input type="checkbox" ${s.checked ? 'checked' : ''} onchange="Inventory._toggleShopItem('${s.id}',this.checked)" style="width:18px;height:18px;accent-color:var(--primary);cursor:pointer" />
                        <div style="flex:1;${s.checked ? 'text-decoration:line-through;' : ''}">
                            <span style="font-weight:600;color:var(--text-primary)">${s.name}</span>
                            ${s.qty ? `<span style="color:var(--text-muted);font-size:0.82rem"> · ${s.qty} ${s.unit || 'unid'}</span>` : ''}
                        </div>
                        <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="Inventory._deleteShopItem('${s.id}')">
                            <span class="material-symbols-outlined" style="font-size:16px">close</span>
                        </button>
                    </div>`;
                });
            }
            html += `</div></div>`;
            container.innerHTML = html;
        } catch(e) {
            container.innerHTML = `<div class="card" style="padding:24px;text-align:center;color:var(--text-muted)">Erro ao carregar lista de compras.</div>`;
        }
    },

    async _addShoppingItem() {
        const name = document.getElementById('shop-new-name')?.value.trim();
        const qty = parseFloat(document.getElementById('shop-new-qty')?.value) || 1;
        if (!name) { App.toast('Digite o nome do item.', 'warning'); return; }
        await Store.addShoppingItem({ name, qty, unit: 'unid' });
        App.toast('Item adicionado à lista!', 'success');
        Inventory.loadShoppingTab();
    },

    async _toggleShopItem(id, checked) {
        await Store.toggleShoppingItem(id, checked);
    },

    async _deleteShopItem(id) {
        await Store.deleteShoppingItem(id);
        Inventory.loadShoppingTab();
    },

    async _generateFromLow() {
        const items = await Store.getInventory();
        const low = items.filter(i => i.qty <= i.minQty);
        const existing = await Store.getShoppingList();
        const existingNames = existing.map(s => s.name.toLowerCase());
        let added = 0;
        for (const i of low) {
            if (!existingNames.includes(i.name.toLowerCase())) {
                const needQty = Math.max(1, (i.minQty * 2) - i.qty);
                await Store.addShoppingItem({ name: i.name, qty: Math.ceil(needQty), unit: i.unit || 'unid' });
                added++;
            }
        }
        App.toast(`${added} item(ns) adicionado(s) à lista!`, 'success');
        Inventory.loadShoppingTab();
    },

    async _clearChecked() {
        const items = await Store.getShoppingList();
        const checked = items.filter(s => s.checked);
        for (const s of checked) await Store.deleteShoppingItem(s.id);
        App.toast(`${checked.length} item(ns) removido(s).`, 'info');
        Inventory.loadShoppingTab();
    },

    async _shareShoppingList() {
        const items = await Store.getShoppingList();
        const pending = items.filter(s => !s.checked);
        if (pending.length === 0) { App.toast('Lista vazia!', 'warning'); return; }
        let msg = '🛒 *Lista de Compras — Estoque*\n\n';
        pending.forEach((s, idx) => {
            msg += `${idx+1}. ${s.name} — ${s.qty || 1} ${s.unit || 'unid'}\n`;
        });
        msg += `\n📅 ${new Date().toLocaleDateString('pt-BR')}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    },

    async loadAuditsTab() {
        const container = document.getElementById('audits-tab-content');
        if (!container) return;
        container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:120px">
            <div class="spinner"></div></div>`;

        try {
            const audits = await Store.getInventoryAudits();
            let html = `
            <div class="card">
                <div class="card-header" style="justify-content:space-between;align-items:center;display:flex;flex-wrap:wrap;gap:12px">
                    <span class="card-title">🗃️ Histórico de Auditorias</span>
                    <button class="btn btn-primary btn-sm" onclick="Inventory.openAuditWizard()" style="display:inline-flex;align-items:center;gap:6px">
                        <span class="material-symbols-outlined" style="font-size:18px">assignment_turned_in</span> Novo Balanço / Inventário
                    </button>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Responsável</th>
                                <th style="text-align:center">Itens Auditados</th>
                                <th style="text-align:center">Divergências</th>
                                <th style="text-align:center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>`;
            
            if (audits.length === 0) {
                html += `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted)">
                    Nenhuma auditoria realizada ainda.
                </td></tr>`;
            } else {
                audits.forEach(aud => {
                    const dt = aud.date?.toDate ? aud.date.toDate() : (aud.date ? new Date(aud.date) : new Date());
                    const formattedDate = dt.toLocaleString('pt-BR');
                    const adjustments = aud.adjustments || [];
                    const itemsCount = adjustments.length;
                    const diffs = adjustments.filter(adj => adj.difference !== 0).length;
                    
                    html += `<tr>
                        <td><strong>${formattedDate}</strong></td>
                        <td>${aud.responsible || 'Profissional'}</td>
                        <td style="text-align:center;font-weight:600">${itemsCount}</td>
                        <td style="text-align:center">
                            ${diffs > 0 
                                ? `<span class="badge badge-orange" style="cursor:pointer" onclick="Inventory.viewAuditDetails('${aud.id}')">⚠️ ${diffs} divergência(s)</span>`
                                : `<span class="badge badge-green">✓ Sem divergências</span>`}
                        </td>
                        <td style="text-align:center">
                            <button class="btn btn-ghost btn-sm" onclick="Inventory.viewAuditDetails('${aud.id}')" title="Visualizar Detalhes">
                                <span class="material-symbols-outlined" style="font-size:18px">visibility</span> Detalhes
                            </button>
                        </td>
                    </tr>`;
                });
            }
            
            html += `</tbody>
                    </table>
                </div>
            </div>`;
            container.innerHTML = html;
        } catch (err) {
            container.innerHTML = `<div class="card" style="padding:20px;color:var(--danger)">Erro ao carregar auditorias: ${err.message}</div>`;
        }
    },

    async viewAuditDetails(auditId) {
        try {
            const audits = await Store.getInventoryAudits();
            const aud = audits.find(a => a.id === auditId);
            if (!aud) {
                App.toast('Auditoria não encontrada', 'error');
                return;
            }
            const dt = aud.date?.toDate ? aud.date.toDate() : (aud.date ? new Date(aud.date) : new Date());
            const formattedDate = dt.toLocaleString('pt-BR');

            const modalId = 'inv-audit-details-modal';
            const existing = document.getElementById(modalId);
            if (existing) existing.remove();

            const modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal-overlay';
            modal.style.zIndex = '9999';
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };
            
            let adjustmentsHtml = aud.adjustments.map(adj => {
                const diffBadge = adj.difference === 0 
                    ? `<span style="color:#28a745;font-weight:700">✓ OK</span>`
                    : adj.difference > 0
                        ? `<span style="color:#28a745;font-weight:700">+${adj.difference}</span>`
                        : `<span style="color:#ff6b6b;font-weight:700">${adj.difference}</span>`;
                
                return `
                <tr style="border-bottom:1px solid var(--border)">
                    <td style="padding:10px 0">
                        <div style="font-weight:600;color:var(--text-primary)">${adj.productName}</div>
                    </td>
                    <td style="text-align:center;color:var(--text-secondary)">${adj.expectedQty}</td>
                    <td style="text-align:center;font-weight:600;color:var(--text-primary)">${adj.actualQty}</td>
                    <td style="text-align:center">${diffBadge}</td>
                    <td style="font-size:0.8rem;color:var(--text-muted)">${adj.reason || '—'}</td>
                </tr>`;
            }).join('');

            modal.innerHTML = `
              <div class="modal-container" onclick="event.stopPropagation()" style="max-width:600px">
                <div class="modal-header">
                  <h3 class="modal-title">📋 Detalhes do Balanço</h3>
                  <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
                </div>
                <div class="modal-body">
                  <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:0.88rem;color:var(--text-secondary);border-bottom:1px solid var(--border);padding-bottom:12px">
                    <div><strong>Data:</strong> ${formattedDate}</div>
                    <div><strong>Responsável:</strong> ${aud.responsible || 'Profissional'}</div>
                  </div>
                  <div style="max-height:350px;overflow-y:auto">
                    <table style="width:100%;border-collapse:collapse">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border);text-align:left;font-size:0.8rem;color:var(--text-muted)">
                                <th style="padding-bottom:8px">Produto</th>
                                <th style="text-align:center;padding-bottom:8px">Qtd Esperada</th>
                                <th style="text-align:center;padding-bottom:8px">Qtd Contada</th>
                                <th style="text-align:center;padding-bottom:8px">Diferença</th>
                                <th style="padding-bottom:8px">Motivo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${adjustmentsHtml}
                        </tbody>
                    </table>
                  </div>
                  <div style="display:flex;justify-content:flex-end;margin-top:20px">
                    <button class="btn btn-primary" onclick="document.getElementById('${modalId}').remove()">Fechar</button>
                  </div>
                </div>
              </div>`;
            document.body.appendChild(modal);
        } catch (e) {
            App.toast('Erro ao carregar detalhes: ' + e.message, 'error');
        }
    },

    async openAuditWizard() {
        let items = [];
        try { items = await Store.getInventory(); } catch(e) { console.warn(e); }
        if (items.length === 0) {
            App.toast('Não há produtos cadastrados para auditar', 'warning');
            return;
        }

        const modalId = 'inv-audit-wizard-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.style.zIndex = '9999';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        let rowsHtml = items.map(i => `
        <tr data-product-id="${i.id}" data-product-name="${i.name.replace(/"/g, '&quot;')}" data-expected-qty="${i.qty}" style="border-bottom:1px solid var(--border)">
            <td style="padding:12px 0">
                <div style="font-weight:600;color:var(--text-primary)">${i.name}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">Estoque atual: ${i.qty} ${i.unit || 'unid'}</div>
            </td>
            <td style="text-align:center;font-weight:600;color:var(--text-secondary)">${i.qty}</td>
            <td style="text-align:center">
                <input class="form-control" type="number" min="0" step="0.01" value="${i.qty}" 
                    style="width:80px;text-align:center;display:inline-block;padding:4px 8px;font-size:0.9rem"
                    oninput="Inventory.handleAuditQtyChange('${i.id}', this.value, ${i.qty})" />
            </td>
            <td style="text-align:center" id="audit-diff-${i.id}">
                <span style="color:var(--text-muted);font-weight:600">0</span>
            </td>
            <td>
                <select class="form-control hidden" id="audit-reason-${i.id}" style="font-size:0.8rem;padding:4px 8px;height:32px">
                    <option value="Divergência de Contagem">Divergência de Contagem</option>
                    <option value="Vencimento">Vencimento / Validade</option>
                    <option value="Quebra / Danificado">Quebra / Danificado</option>
                    <option value="Perda / Extravio">Perda / Extravio</option>
                    <option value="Consumo Interno">Consumo Interno</option>
                    <option value="Outro">Outro</option>
                </select>
            </td>
        </tr>`).join('');

        modal.innerHTML = `
          <div class="modal-container" onclick="event.stopPropagation()" style="max-width:800px;width:95%">
            <div class="modal-header">
              <h3 class="modal-title">📋 Novo Balanço e Inventário Físico</h3>
              <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
            </div>
            <div class="modal-body" style="padding:0 24px 24px 24px">
              <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px">
                Insira a quantidade física real contada nas prateleiras para cada produto. Caso haja divergência com o sistema, justifique o motivo.
              </p>
              <div style="max-height:400px;overflow-y:auto;margin-bottom:20px;border-top:1px solid var(--border)">
                <table style="width:100%;border-collapse:collapse">
                    <thead>
                        <tr style="border-bottom:2px solid var(--border);text-align:left;font-size:0.8rem;color:var(--text-muted)">
                            <th style="padding:10px 0">Produto</th>
                            <th style="text-align:center">Qtd no Sistema</th>
                            <th style="text-align:center">Qtd Física Real</th>
                            <th style="text-align:center">Divergência</th>
                            <th>Motivo (se houver dif.)</th>
                        </tr>
                    </thead>
                    <tbody id="audit-items-tbody">
                        ${rowsHtml}
                    </tbody>
                </table>
              </div>
              <div style="display:flex;gap:12px;justify-content:flex-end">
                <button class="btn btn-ghost" onclick="document.getElementById('${modalId}').remove()">Cancelar</button>
                <button class="btn btn-primary" id="btn-submit-audit" onclick="Inventory.submitAuditWizard()">
                  <span class="material-symbols-outlined">check_circle</span> Salvar e Ajustar Estoque
                </button>
              </div>
            </div>
          </div>`;
        document.body.appendChild(modal);
    },

    handleAuditQtyChange(productId, value, expectedQty) {
        const parsed = parseFloat(value);
        const diffElement = document.getElementById(`audit-diff-${productId}`);
        const reasonSelect = document.getElementById(`audit-reason-${productId}`);
        if (!diffElement) return;

        if (isNaN(parsed) || parsed < 0) {
            diffElement.innerHTML = `<span style="color:var(--danger)">Inválido</span>`;
            reasonSelect?.classList.add('hidden');
            return;
        }

        const diff = Math.round((parsed - expectedQty) * 100) / 100;
        
        if (diff === 0) {
            diffElement.innerHTML = `<span style="color:var(--text-muted);font-weight:600">0</span>`;
            reasonSelect?.classList.add('hidden');
        } else if (diff > 0) {
            diffElement.innerHTML = `<span style="color:#28a745;font-weight:700">+${diff}</span>`;
            reasonSelect?.classList.remove('hidden');
        } else {
            diffElement.innerHTML = `<span style="color:#ff6b6b;font-weight:700">${diff}</span>`;
            reasonSelect?.classList.remove('hidden');
        }
    },

    async submitAuditWizard() {
        const rows = document.querySelectorAll('#audit-items-tbody tr');
        const adjustments = [];
        const btn = document.getElementById('btn-submit-audit');
        
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div> Salvando...';
        }

        try {
            for (let r of rows) {
                const productId = r.dataset.productId;
                const productName = r.dataset.productName;
                const expectedQty = parseFloat(r.dataset.expectedQty);
                const input = r.querySelector('input');
                const actualQty = parseFloat(input.value);

                if (isNaN(actualQty) || actualQty < 0) {
                    throw new Error(`Quantidade inválida para o produto: ${productName}`);
                }

                const diff = Math.round((actualQty - expectedQty) * 100) / 100;
                const reasonSelect = document.getElementById(`audit-reason-${productId}`);
                const reason = diff !== 0 ? (reasonSelect?.value || 'Divergência de Contagem') : '';

                adjustments.push({
                    productId,
                    productName,
                    expectedQty,
                    actualQty,
                    difference: diff,
                    reason
                });

                if (diff !== 0) {
                    await Store.updateInventoryItem(productId, { qty: actualQty });
                    
                    const action = diff > 0 ? 'Entrada (Ajuste Balanço)' : 'Saída (Ajuste Balanço)';
                    await Store.addMovementLog({
                        itemId: productId,
                        itemName: productName,
                        qty: Math.abs(diff),
                        type: diff > 0 ? 'in' : 'out',
                        description: `Ajuste de inventário físico: ${reason}`
                    });
                }
            }

            await Store.addInventoryAudit({ adjustments });

            App.toast('Balanço físico e estoque atualizados com sucesso!', 'success');
            
            const modal = document.getElementById('inv-audit-wizard-modal');
            if (modal) modal.remove();

            await Inventory.render(document.getElementById('page-content'));
            Inventory.switchTab('audits');
        } catch (err) {
            App.toast('Erro ao salvar auditoria: ' + err.message, 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Salvar e Ajustar Estoque';
            }
        }
    },

    openXmlModal() {
        const modalId = 'inv-xml-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.style.zIndex = '9999';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        modal.innerHTML = `
          <div class="modal-container" onclick="event.stopPropagation()" style="max-width:550px">
            <div class="modal-header">
              <h3 class="modal-title">📥 Importar XML de Nota Fiscal</h3>
              <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
            </div>
            <div class="modal-body" style="text-align:center;padding:24px">
              <div id="xml-dropzone" style="border:2px dashed var(--border);border-radius:12px;padding:40px 20px;cursor:pointer;background:var(--bg-secondary);transition:all 0.2s"
                   onclick="document.getElementById('xml-file-input').click()">
                <span class="material-symbols-outlined" style="font-size:48px;color:var(--primary);margin-bottom:12px;display:block">upload_file</span>
                <strong style="color:var(--text-primary);display:block;margin-bottom:4px">Arraste a nota fiscal XML ou clique para selecionar</strong>
                <span style="font-size:0.75rem;color:var(--text-secondary)">Apenas arquivos XML de notas fiscais de compra (NFe)</span>
                <input type="file" id="xml-file-input" accept=".xml" style="display:none" onchange="Inventory.handleXmlFileSelect(this.files[0])" />
              </div>
              <div id="xml-progress" class="hidden" style="margin-top:20px">
                <div class="spinner" style="margin:0 auto 10px auto"></div>
                <span style="color:var(--text-secondary);font-size:0.85rem">Lendo arquivo XML...</span>
              </div>
            </div>
          </div>`;
        document.body.appendChild(modal);

        const dropzone = document.getElementById('xml-dropzone');
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'var(--primary)';
            dropzone.style.background = 'rgba(40,167,69,0.04)';
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.style.borderColor = 'var(--border)';
            dropzone.style.background = 'var(--bg-secondary)';
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                Inventory.handleXmlFileSelect(files[0]);
            }
        });
    },

    async handleXmlFileSelect(file) {
        if (!file) return;
        if (!file.name.endsWith('.xml')) {
            App.toast('Por favor, selecione um arquivo XML válido.', 'warning');
            return;
        }

        const dropzone = document.getElementById('xml-dropzone');
        const progress = document.getElementById('xml-progress');
        if (dropzone) dropzone.classList.add('hidden');
        if (progress) progress.classList.remove('hidden');

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const xmlText = e.target.result;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                
                const nfeNode = xmlDoc.querySelector('infNFe');
                if (!nfeNode) {
                    throw new Error('Arquivo XML não aparenta ser uma NF-e de compra válida.');
                }

                const emitNode = xmlDoc.querySelector('emit');
                if (!emitNode) throw new Error('Dados do emitente não encontrados no XML.');
                const cnpjEmit = emitNode.querySelector('CNPJ')?.textContent || '';
                const nameEmit = emitNode.querySelector('xNome')?.textContent || '';

                if (!cnpjEmit) throw new Error('CNPJ do emitente/fornecedor não localizado.');

                const detNodes = xmlDoc.querySelectorAll('det');
                if (detNodes.length === 0) throw new Error('Nenhum item de produto cadastrado nesta nota.');

                const parsedItems = [];
                detNodes.forEach(det => {
                    const prodNode = det.querySelector('prod');
                    if (prodNode) {
                        const code = prodNode.querySelector('cProd')?.textContent || '';
                        const name = prodNode.querySelector('xProd')?.textContent || '';
                        const qty = parseFloat(prodNode.querySelector('qTrib')?.textContent || prodNode.querySelector('qCom')?.textContent || '0');
                        const unit = prodNode.querySelector('uTrib')?.textContent || prodNode.querySelector('uCom')?.textContent || 'unid';
                        const price = parseFloat(prodNode.querySelector('vUnTrib')?.textContent || prodNode.querySelector('vUnCom')?.textContent || '0');
                        
                        parsedItems.push({ code, name, qty, unit, price });
                    }
                });

                const config = await Store.getStudioConfig();
                const mapping = config.xmlMapping || {};
                const localProducts = await Store.getInventory();

                const xmlModal = document.getElementById('inv-xml-modal');
                if (xmlModal) xmlModal.remove();

                Inventory.openXmlMappingWizard(cnpjEmit, nameEmit, parsedItems, mapping, localProducts);
            };
            reader.readAsText(file);
        } catch(err) {
            App.toast('Erro ao ler XML: ' + err.message, 'error');
            if (dropzone) dropzone.classList.remove('hidden');
            if (progress) progress.classList.add('hidden');
        }
    },

    openXmlMappingWizard(cnpjFornecedor, nomeFornecedor, xmlItems, mapping, localProducts) {
        const modalId = 'xml-mapping-wizard-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.style.zIndex = '9999';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        let rowsHtml = xmlItems.map((item, idx) => {
            const key = `${cnpjFornecedor}_${item.name.replace(/[.\#\$\[\]\/]/g, '_')}`;
            const mappedProductId = mapping[key] || '';

            let selectOptions = `<option value="">-- Vincular Produto --</option>`;
            selectOptions += `<option value="NEW" ${mappedProductId === '' ? 'selected' : ''}>🆕 Cadastrar como Novo Produto</option>`;
            
            localProducts.forEach(prod => {
                const selected = prod.id === mappedProductId ? 'selected' : '';
                selectOptions += `<option value="${prod.id}" ${selected}>${prod.name} (${prod.qty} ${prod.unit || 'unid'} em estoque)</option>`;
            });

            return `
            <tr data-index="${idx}" data-xml-name="${item.name.replace(/"/g, '&quot;')}" data-qty="${item.qty}" data-unit="${item.unit}" data-price="${item.price}" style="border-bottom:1px solid var(--border)">
                <td style="padding:12px 0;max-width:300px">
                    <div style="font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">Qtd na Nota: ${item.qty} ${item.unit} · Valor Unit: R$ ${item.price.toFixed(2)}</div>
                </td>
                <td style="padding:12px 0">
                    <select class="form-control" id="xml-product-select-${idx}" style="font-size:0.85rem;height:38px" onchange="Inventory.handleXmlProductSelectChange(${idx}, this.value)">
                        ${selectOptions}
                    </select>
                    <div id="new-product-name-container-${idx}" class="hidden" style="margin-top:6px">
                        <input class="form-control" id="xml-new-product-name-${idx}" value="${item.name.replace(/"/g, '&quot;')}" placeholder="Nome amigável no estoque" style="font-size:0.8rem;padding:4px 8px;height:30px" />
                    </div>
                </td>
            </tr>`;
        }).join('');

        modal.innerHTML = `
          <div class="modal-container" onclick="event.stopPropagation()" style="max-width:850px;width:95%">
            <div class="modal-header">
              <h3 class="modal-title">📥 Mapeamento "De/Para" de Produtos (XML)</h3>
              <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
            </div>
            <div class="modal-body" style="padding:0 24px 24px 24px">
              <div class="card" style="padding:12px 16px;background:var(--bg-tertiary);border-radius:8px;margin-bottom:16px;font-size:0.85rem;color:var(--text-secondary)">
                <strong>Fornecedor:</strong> ${nomeFornecedor} (CNPJ: ${cnpjFornecedor})
              </div>
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px">
                Associe cada produto da Nota Fiscal ao seu produto cadastrado em estoque. Da próxima vez, o sistema lembrará automaticamente deste vínculo!
              </p>
              <div style="max-height:350px;overflow-y:auto;margin-bottom:20px;border-top:1px solid var(--border)">
                <table style="width:100%;border-collapse:collapse">
                    <thead>
                        <tr style="border-bottom:2px solid var(--border);text-align:left;font-size:0.8rem;color:var(--text-muted)">
                            <th style="padding:10px 0">Produto na Nota</th>
                            <th>Vinculação no Estoque Interno</th>
                        </tr>
                    </thead>
                    <tbody id="xml-mapping-tbody">
                        ${rowsHtml}
                    </tbody>
                </table>
              </div>
              <div style="display:flex;gap:12px;justify-content:flex-end">
                <button class="btn btn-ghost" onclick="document.getElementById('${modalId}').remove()">Cancelar</button>
                <button class="btn btn-primary" id="btn-confirm-xml-import" onclick="Inventory.confirmXmlImport('${cnpjFornecedor}')">
                  <span class="material-symbols-outlined">input</span> Confirmar Entrada no Estoque
                </button>
              </div>
            </div>
          </div>`;
        document.body.appendChild(modal);

        xmlItems.forEach((item, idx) => {
            const key = `${cnpjFornecedor}_${item.name.replace(/[.\#\$\[\]\/]/g, '_')}`;
            const mappedProductId = mapping[key] || '';
            if (mappedProductId === '') {
                document.getElementById(`new-product-name-container-${idx}`)?.classList.remove('hidden');
            }
        });
    },

    handleXmlProductSelectChange(idx, value) {
        const inputContainer = document.getElementById(`new-product-name-container-${idx}`);
        if (!inputContainer) return;
        if (value === 'NEW') {
            inputContainer.classList.remove('hidden');
        } else {
            inputContainer.classList.add('hidden');
        }
    },

    async confirmXmlImport(cnpjFornecedor) {
        const rows = document.querySelectorAll('#xml-mapping-tbody tr');
        const btn = document.getElementById('btn-confirm-xml-import');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div> Importando...';
        }

        try {
            const config = await Store.getStudioConfig();
            const currentMapping = config.xmlMapping || {};
            const newMapping = { ...currentMapping };

            for (let r of rows) {
                const idx = r.dataset.index;
                const xmlName = r.dataset.xmlName;
                const qty = parseFloat(r.dataset.qty) || 0;
                const unit = r.dataset.unit || 'unid';
                const price = parseFloat(r.dataset.price) || 0;
                
                const select = document.getElementById(`xml-product-select-${idx}`);
                const selectValue = select.value;

                let targetProductId = selectValue;
                let actualProductName = '';

                if (selectValue === 'NEW' || selectValue === '') {
                    const newNameInput = document.getElementById(`xml-new-product-name-${idx}`);
                    const newName = newNameInput?.value.trim() || xmlName;

                    targetProductId = await Store.addInventoryItem({
                        name: newName,
                        qty: qty,
                        minQty: 0,
                        unit: unit,
                        category: 'Importação XML'
                    });
                    actualProductName = newName;
                } else {
                    const localProducts = await Store.getInventory();
                    const prod = localProducts.find(p => p.id === selectValue);
                    if (prod) {
                        const newQty = Math.round(((prod.qty || 0) + qty) * 100) / 100;
                        await Store.updateInventoryItem(selectValue, { qty: newQty });
                        actualProductName = prod.name;
                    } else {
                        throw new Error(`Produto associado não foi encontrado no estoque.`);
                    }
                }

                const key = `${cnpjFornecedor}_${xmlName.replace(/[.\#\$\[\]\/]/g, '_')}`;
                newMapping[key] = targetProductId;

                await Store.addMovementLog({
                    itemId: targetProductId,
                    itemName: actualProductName,
                    qty: qty,
                    type: 'in',
                    description: `Entrada via Importação XML NFe (Fornecedor CNPJ: ${cnpjFornecedor})`
                });
            }

            await Store.updateStudioConfig({ xmlMapping: newMapping });

            App.toast('Importação realizada com sucesso!', 'success');
            
            const modal = document.getElementById('xml-mapping-wizard-modal');
            if (modal) modal.remove();

            await Inventory.render(document.getElementById('page-content'));
        } catch (err) {
            App.toast('Erro na importação: ' + err.message, 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined">input</span> Confirmar Entrada no Estoque';
            }
        }
    }
};
