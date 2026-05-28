// === GESTÃO DE ESTOQUE ===
const Inventory = {

    async render(container) {
        container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:200px">
            <div class="spinner"></div></div>`;

        let items = [];
        try { items = await Store.getInventory(); } catch(e) { console.warn(e); }

        const low = items.filter(i => i.qty <= i.minQty);

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
                </p>
              </div>
              <div style="display:flex;gap:8px;align-items:center">
                <button class="btn-export-excel" onclick="Inventory.exportExcel()" style="background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3)">
                  <span class="material-symbols-outlined" style="font-size:18px">download</span> Excel
                </button>
                <button class="btn" onclick="Inventory.openModal()"
                  style="background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3);backdrop-filter:blur(4px)">
                  <span class="material-symbols-outlined">add</span> Novo Produto
                </button>
              </div>
            </div>
          </div>

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

          <!-- Lista de produtos -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">📋 Produtos</span>
              <input class="form-control" id="inv-search" placeholder="Buscar produto..."
                style="width:220px;font-size:0.85rem" oninput="Inventory.filterTable(this.value)" />
            </div>
            <div class="table-wrapper">
              <table id="inv-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th style="text-align:center">Qtd Atual</th>
                    <th style="text-align:center">Qtd Mínima</th>
                    <th>Unidade</th>
                    <th>Status</th>
                    <th style="text-align:center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.length === 0
                    ? `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted)">
                        <span class="material-symbols-outlined" style="font-size:36px;display:block;margin-bottom:8px;opacity:0.4">inventory_2</span>
                        Nenhum produto cadastrado ainda.</td></tr>`
                    : items.map(i => Inventory._row(i)).join('')}
                </tbody>
              </table>
            </div>
          </div>

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
        return `<tr data-name="${(i.name || '').toLowerCase()}" ${isLow ? 'style="background:rgba(255,107,107,0.04)"' : ''}>
          <td>
            <div style="font-weight:600;color:var(--text-primary)">${i.name}</div>
            ${i.category ? `<div style="font-size:0.75rem;color:var(--text-muted)">${i.category}</div>` : ''}
          </td>
          <td style="text-align:center">
            <div style="font-size:1.1rem;font-weight:700;color:${isLow ? '#ff6b6b' : 'var(--text-primary)'}">${i.qty}</div>
            <div style="height:4px;border-radius:4px;background:var(--border);margin-top:4px;width:60px;margin-left:auto;margin-right:auto">
              <div style="height:100%;border-radius:4px;background:${barColor};width:${Math.min(pct,100)}%;transition:width 0.4s"></div>
            </div>
          </td>
          <td style="text-align:center;color:var(--text-secondary)">${i.minQty}</td>
          <td style="color:var(--text-muted)">${i.unit || 'unid'}</td>
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
              <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="Inventory.delete('${i.id}','${(i.name||'').replace(/'/g,"\\'")}'" title="Excluir">
                <span class="material-symbols-outlined" style="font-size:16px">delete</span>
              </button>
            </div>
          </td>
        </tr>`;
    },

    filterTable(q) {
        const rows = document.querySelectorAll('#inv-table tbody tr');
        rows.forEach(r => {
            const name = r.dataset.name || '';
            r.style.display = name.includes(q.toLowerCase()) ? '' : 'none';
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
            name:     document.getElementById('inv-name').value.trim(),
            qty:      parseFloat(document.getElementById('inv-qty').value) || 0,
            minQty:   parseFloat(document.getElementById('inv-min-qty').value) || 0,
            unit:     document.getElementById('inv-unit').value,
            category: document.getElementById('inv-category').value
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
            'Status': i.qty <= i.minQty ? '⚠ Baixo' : '✓ OK'
        }));
        ExcelExport.fromData(data, `estoque_${new Date().toISOString().slice(0,10)}`, 'Estoque');
    }
};
