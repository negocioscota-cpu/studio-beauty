// === CATÁLOGO DE PROCEDIMENTOS COM PREÇOS ===
const Catalog = {
    editingId: null,

    // Procedimentos padrão do nicho
    DEFAULT_PROCEDURES: [
        { name: 'Extensão de Cílios — Volume Russo', category: 'cilios', duration: '2 horas', price: 250 },
        { name: 'Extensão de Cílios — Clássico', category: 'cilios', duration: '1h30', price: 180 },
        { name: 'Lifting de Cílios', category: 'cilios', duration: '1 hora', price: 120 },
        { name: 'Manutenção de Extensão', category: 'cilios', duration: '1 hora', price: 130 },
        { name: 'Remoção de Extensão', category: 'cilios', duration: '30 min', price: 60 },
        { name: 'Design de Sobrancelhas', category: 'sobrancelhas', duration: '30 min', price: 50 },
        { name: 'Micropigmentação', category: 'sobrancelhas', duration: '2 horas', price: 400 },
        { name: 'Brow Lamination', category: 'sobrancelhas', duration: '1 hora', price: 100 },
        { name: 'Henna de Sobrancelhas', category: 'sobrancelhas', duration: '30 min', price: 40 },
    ],

    inventoryItems: [],

    async render(container) {
        Catalog.inventoryItems = [];
        try {
            Catalog.inventoryItems = await Store.getInventory();
        } catch(e) { console.warn("Erro ao buscar estoque no catálogo:", e); }

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Header -->
          <div class="card" style="background:linear-gradient(135deg,var(--primary-dark) 0%,var(--primary) 100%);color:white">
            <div class="card-body" style="display:flex;align-items:center;gap:16px">
              <div style="font-size:40px">📱</div>
              <div>
                <h3 style="font-weight:800;font-size:1.2rem;margin-bottom:4px">Catálogo de Procedimentos</h3>
                <p style="opacity:0.9;font-size:0.85rem">Gerencie seus serviços com preços e durações padronizadas. Ao criar agendamentos, os valores serão preenchidos automaticamente.</p>
              </div>
            </div>
          </div>

          <div class="toolbar">
            <div style="display:flex;gap:8px">
              <select class="form-control" id="catalog-filter" onchange="Catalog.loadList()" style="width:180px">
                <option value="">Todos</option>
                <option value="cilios">🫧 Cílios</option>
                <option value="sobrancelhas">✏️ Sobrancelhas</option>
                <option value="labios">💋 Lábios</option>
                <option value="facial">🧴 Facial</option>
                <option value="combo">🎀 Combos</option>
                <option value="outro">📦 Outros</option>
              </select>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost" onclick="Catalog.loadDefaults()" title="Carregar procedimentos padrão">
                <span class="material-symbols-outlined">playlist_add</span> Carregar Padrão
              </button>
              <button class="btn btn-primary" onclick="Catalog.openModal()">
                <span class="material-symbols-outlined">add</span> Novo Serviço
              </button>
            </div>
          </div>

          <div id="catalog-list"></div>
        </div>

        <!-- Modal -->
        <div id="catalog-modal" class="modal-overlay hidden" onclick="Catalog.closeModal(event)">
          <div class="modal-container" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title" id="catalog-modal-title">Novo Procedimento</h3>
              <button class="modal-close" onclick="Catalog.closeModal()">✕</button>
            </div>
            <form id="catalog-form" onsubmit="Catalog.handleSave(event)" class="modal-body">
              <div class="form-grid">
                <div class="form-group form-group-full">
                  <label class="form-label">Nome do Serviço *</label>
                  <input class="form-control" id="cat-name" required placeholder="Ex: Extensão Volume Russo" />
                </div>
                <div class="form-group">
                  <label class="form-label">Categoria *</label>
                  <select class="form-control" id="cat-category" required>
                    <option value="">-- Selecione --</option>
                    <option value="cilios">🫧 Cílios</option>
                    <option value="sobrancelhas">✏️ Sobrancelhas</option>
                    <option value="labios">💋 Lábios</option>
                    <option value="facial">🧴 Facial</option>
                    <option value="combo">🎀 Combo</option>
                    <option value="outro">📦 Outro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Duração Estimada</label>
                  <select class="form-control" id="cat-duration">
                    <option>30 min</option><option>45 min</option><option>1 hora</option>
                    <option>1h30</option><option>2 horas</option><option>2h30</option>
                    <option>3 horas</option><option>3h30</option><option>4 horas</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Preço (R$) *</label>
                  <input class="form-control" type="number" id="cat-price" min="0" step="0.01" required placeholder="0,00" />
                </div>
                <div class="form-group">
                  <label class="form-label">Preço Promocional (R$)</label>
                  <input class="form-control" type="number" id="cat-promo-price" min="0" step="0.01" placeholder="Opcional" />
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">Descrição</label>
                  <textarea class="form-control" id="cat-description" rows="2" placeholder="Detalhes do procedimento (exibido em futura página de agendamento online)"></textarea>
                </div>

                <!-- Insumos Utilizados (Baixa Automática) -->
                <div class="form-group form-group-full" style="margin-top: 12px; border-top: 1px solid var(--border); padding-top: 16px;">
                  <h4 style="font-size:0.9rem;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:6px;margin:0 0 12px 0">📦 Insumos Utilizados (Baixa Automática)</h4>
                  <div id="cat-inputs-list" style="display:flex;flex-direction:column;gap:10px">
                    <!-- Gerado dinamicamente -->
                  </div>
                  <button type="button" class="btn btn-ghost btn-sm" onclick="Catalog.addInputRow()" style="margin-top:10px;gap:6px;font-size:0.75rem;padding:4px 8px;display:inline-flex;align-items:center">
                    <span class="material-symbols-outlined" style="font-size:16px">add_circle</span> Adicionar Insumo
                  </button>
                </div>

                <div class="form-group form-group-full">
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;cursor:pointer">
                    <input type="checkbox" id="cat-active" checked> Serviço ativo (visível para agendamento)
                  </label>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-ghost" onclick="Catalog.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  <span class="material-symbols-outlined">save</span> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>`;

        await Catalog.loadList();
    },

    async loadList() {
        const list = document.getElementById('catalog-list');
        list.innerHTML = '<div style="text-align:center;padding:32px"><div class="spinner"></div></div>';
        
        const items = await Store.getCatalog();
        const filter = document.getElementById('catalog-filter')?.value || '';
        const filtered = filter ? items.filter(i => i.category === filter) : items;

        Catalog._allItems = items;

        if (!filtered.length) {
            list.innerHTML = `<div class="empty-state">
                <span class="material-symbols-outlined empty-state-icon">spa</span>
                <p class="empty-state-title">Nenhum serviço cadastrado</p>
                <p class="empty-state-desc">Adicione seus procedimentos ou carregue os padrão do nicho.</p>
                <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
                    <button class="btn btn-primary" onclick="Catalog.openModal()">Adicionar Serviço</button>
                    <button class="btn btn-ghost" onclick="Catalog.loadDefaults()">Carregar Padrão</button>
                </div>
            </div>`;
            return;
        }

        // Agrupa por categoria
        const groups = {};
        filtered.forEach(item => {
            const cat = item.category || 'outro';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });

        const categoryLabels = {
            cilios: '🫧 Cílios',
            sobrancelhas: '✏️ Sobrancelhas',
            labios: '💋 Lábios',
            facial: '🧴 Facial',
            combo: '🎀 Combos',
            outro: '📦 Outros'
        };

        list.innerHTML = Object.entries(groups).map(([cat, items]) => `
            <div class="card" style="margin-bottom:16px">
                <div class="card-header"><span class="card-title">${categoryLabels[cat] || cat}</span></div>
                <div class="table-wrapper">
                    <table>
                        <thead><tr>
                            <th>Serviço</th><th>Duração</th><th>Preço</th><th>Promo</th><th>Status</th><th>Ações</th>
                        </tr></thead>
                        <tbody>${items.map(item => `<tr>
                            <td>
                                <div style="font-weight:600">${item.name}</div>
                                ${item.description ? `<div style="font-size:0.75rem;color:var(--text-muted)">${item.description}</div>` : ''}
                            </td>
                            <td>${item.duration || '-'}</td>
                            <td style="font-weight:700;color:var(--primary)">${App.formatCurrency(item.price || 0)}</td>
                            <td>${item.promoPrice ? `<span style="color:var(--success);font-weight:700">${App.formatCurrency(item.promoPrice)}</span>` : '-'}</td>
                            <td>${item.active !== false ? '<span class="badge badge-green">Ativo</span>' : '<span class="badge badge-brown">Inativo</span>'}</td>
                            <td>
                                <div style="display:flex;gap:4px">
                                    <button class="btn btn-ghost btn-sm" onclick="Catalog.openModal('${item.id}')"><span class="material-symbols-outlined">edit</span></button>
                                    <button class="btn btn-ghost btn-sm" onclick="Catalog.delete('${item.id}')" style="color:var(--danger)"><span class="material-symbols-outlined">delete</span></button>
                                </div>
                            </td>
                        </tr>`).join('')}</tbody>
                    </table>
                </div>
            </div>
        `).join('');
    },

    openModal(id = null) {
        Catalog.editingId = id;
        const form = document.getElementById('catalog-form');
        form.reset();
        document.getElementById('cat-active').checked = true;
        document.getElementById('catalog-modal-title').textContent = id ? 'Editar Serviço' : 'Novo Procedimento';

        const inputsContainer = document.getElementById('cat-inputs-list');
        if (inputsContainer) inputsContainer.innerHTML = '';

        if (id) {
            const item = (Catalog._allItems || []).find(i => i.id === id);
            if (item) {
                document.getElementById('cat-name').value = item.name || '';
                document.getElementById('cat-category').value = item.category || '';
                document.getElementById('cat-duration').value = item.duration || '1 hora';
                document.getElementById('cat-price').value = item.price || '';
                document.getElementById('cat-promo-price').value = item.promoPrice || '';
                document.getElementById('cat-description').value = item.description || '';
                document.getElementById('cat-active').checked = item.active !== false;

                const inputs = item.inputs || [];
                inputs.forEach(inp => {
                    Catalog.addInputRow(inp.productId, inp.qty);
                });
            }
        }
        document.getElementById('catalog-modal').classList.remove('hidden');
    },

    closeModal(event) {
        if (event && event.target !== document.getElementById('catalog-modal')) return;
        document.getElementById('catalog-modal')?.classList.add('hidden');
        Catalog.editingId = null;
    },

    async handleSave(e) {
        e.preventDefault();

        const inputs = [];
        document.querySelectorAll('.cat-input-item-row').forEach(row => {
            const select = row.querySelector('.cat-input-select');
            const qtyInput = row.querySelector('.cat-input-qty');
            if (select && qtyInput && select.value) {
                inputs.push({
                    productId: select.value,
                    qty: parseFloat(qtyInput.value) || 1
                });
            }
        });

        const data = {
            name: document.getElementById('cat-name').value,
            category: document.getElementById('cat-category').value,
            duration: document.getElementById('cat-duration').value,
            price: parseFloat(document.getElementById('cat-price').value) || 0,
            promoPrice: parseFloat(document.getElementById('cat-promo-price').value) || null,
            description: document.getElementById('cat-description').value,
            active: document.getElementById('cat-active').checked,
            inputs: inputs
        };

        try {
            if (Catalog.editingId) {
                await Store.updateCatalog(Catalog.editingId, data);
            } else {
                await Store.addCatalog(data);
            }
            document.getElementById('catalog-modal').classList.add('hidden');
            App.showToast('Serviço salvo!', 'success');
            await Catalog.loadList();
        } catch (err) {
            App.showToast('Erro: ' + err.message, 'error');
        }
    },

    async loadDefaults() {
        if (!confirm('Carregar os procedimentos padrão? (Não duplicará itens com o mesmo nome)')) return;
        const existing = await Store.getCatalog();
        const existingNames = existing.map(i => i.name.toLowerCase());
        let added = 0;

        for (const proc of Catalog.DEFAULT_PROCEDURES) {
            if (!existingNames.includes(proc.name.toLowerCase())) {
                await Store.addCatalog({ ...proc, active: true });
                added++;
            }
        }

        App.showToast(`${added} procedimento(s) adicionado(s)!`, 'success');
        await Catalog.loadList();
    },

    async delete(id) {
        if (!confirm('Excluir este serviço?')) return;
        await Store.deleteCatalog(id);
        App.showToast('Serviço removido.', 'success');
        await Catalog.loadList();
    },

    addInputRow(productId = '', qty = '') {
        const container = document.getElementById('cat-inputs-list');
        if (!container) return;
        
        const rowId = 'cat-input-row-' + Math.random().toString(36).substring(2, 9);
        const row = document.createElement('div');
        row.id = rowId;
        row.className = 'cat-input-item-row';
        row.style.cssText = 'display:flex;gap:10px;align-items:center';
        
        const optionsHTML = Catalog.inventoryItems.length === 0
            ? `<option value="">-- Cadastre produtos no estoque --</option>`
            : `<option value="">-- Selecione o insumo --</option>` + Catalog.inventoryItems.map(i => `<option value="${i.id}" ${i.id === productId ? 'selected' : ''}>${i.name} (${i.unit || 'unid'})</option>`).join('');
            
        row.innerHTML = `
            <select class="form-control cat-input-select" style="flex:1.5;font-size:0.8rem;padding:6px 10px" required>
                ${optionsHTML}
            </select>
            <input class="form-control cat-input-qty" type="number" step="0.001" min="0.001" value="${qty || 1}" placeholder="Qtd" style="flex:0.8;font-size:0.8rem;padding:6px 10px" required />
            <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('${rowId}').remove()" style="color:var(--danger);padding:4px;display:flex;align-items:center;justify-content:center" title="Remover">
                <span class="material-symbols-outlined" style="font-size:1.2rem">delete</span>
            </button>
        `;
        container.appendChild(row);
    }
};
