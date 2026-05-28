// === CALCULADORA DE CUSTO POR PROCEDIMENTO ===
const CostCalc = {
    currentInventory: [],
    currentCatalog: [],
    editingId: null,

    async render(container) {
        CostCalc.currentInventory = await Store.getInventory();
        CostCalc.currentCatalog = await Store.getCatalog();

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Header -->
          <div class="card" style="background:linear-gradient(135deg,#2d4a3e 0%,#4a7c59 100%);color:white">
            <div class="card-body" style="display:flex;align-items:center;gap:16px">
              <div style="font-size:40px">🧮</div>
              <div>
                <h3 style="font-weight:800;font-size:1.2rem;margin-bottom:4px">Calculadora de Custo</h3>
                <p style="opacity:0.9;font-size:0.85rem">Descubra o custo real de cada procedimento e sua margem de lucro. Precifique com inteligência!</p>
              </div>
            </div>
          </div>

          <div class="toolbar">
            <div></div>
            <button class="btn btn-primary" onclick="CostCalc.openModal()">
              <span class="material-symbols-outlined">add</span> Nova Análise
            </button>
          </div>

          <div id="cost-list"></div>
        </div>

        <!-- Modal -->
        <div id="cost-modal" class="modal-overlay hidden" onclick="CostCalc.closeModal(event)">
          <div class="modal-container" style="max-width:640px" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Análise de Custo</h3>
              <button class="modal-close" onclick="CostCalc.closeModal()">✕</button>
            </div>
            <form id="cost-form" onsubmit="CostCalc.handleSave(event)" class="modal-body" style="max-height:70vh;overflow-y:auto">
              <div class="form-grid">
                <div class="form-group form-group-full">
                  <label class="form-label">Procedimento *</label>
                  <select class="form-control" id="cost-procedure" required onchange="CostCalc.onProcedureChange()">
                    <option value="">-- Selecione ou digite --</option>
                    ${CostCalc.currentCatalog.map(c => `<option value="${c.name}" data-price="${c.price || 0}">${c.name} (${App.formatCurrency(c.price || 0)})</option>`).join('')}
                    <option value="__custom">✏️ Outro (digitar)</option>
                  </select>
                </div>
                <div class="form-group hidden" id="cost-custom-name-wrap">
                  <label class="form-label">Nome do Procedimento</label>
                  <input class="form-control" id="cost-custom-name" placeholder="Ex: Volume Mega" />
                </div>
                <div class="form-group">
                  <label class="form-label">Valor Cobrado (R$) *</label>
                  <input class="form-control" type="number" id="cost-sell-price" min="0" step="0.01" required placeholder="0,00" />
                </div>
                <div class="form-group">
                  <label class="form-label">Tempo de Trabalho (min)</label>
                  <input class="form-control" type="number" id="cost-work-time" min="0" placeholder="120" />
                </div>

                <!-- Insumos -->
                <div class="form-group form-group-full">
                  <label class="form-label" style="display:flex;justify-content:space-between;align-items:center">
                    Insumos Utilizados
                    <button type="button" class="btn btn-ghost btn-sm" onclick="CostCalc.addInsumoRow()">
                      <span class="material-symbols-outlined" style="font-size:16px">add</span> Adicionar Insumo
                    </button>
                  </label>
                  <div id="cost-insumos-list" style="display:flex;flex-direction:column;gap:8px;margin-top:8px"></div>
                </div>

                <!-- Custos fixos -->
                <div class="form-group form-group-full">
                  <label class="form-label">Custos Fixos por Procedimento</label>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
                    <div>
                      <label style="font-size:0.75rem;color:var(--text-muted)">Aluguel/hora (R$)</label>
                      <input class="form-control" type="number" id="cost-rent" min="0" step="0.01" placeholder="0,00" oninput="CostCalc.liveCalc()" />
                    </div>
                    <div>
                      <label style="font-size:0.75rem;color:var(--text-muted)">Energia/hora (R$)</label>
                      <input class="form-control" type="number" id="cost-energy" min="0" step="0.01" placeholder="0,00" oninput="CostCalc.liveCalc()" />
                    </div>
                    <div>
                      <label style="font-size:0.75rem;color:var(--text-muted)">Descartáveis (R$)</label>
                      <input class="form-control" type="number" id="cost-disposable" min="0" step="0.01" placeholder="0,00" oninput="CostCalc.liveCalc()" />
                    </div>
                    <div>
                      <label style="font-size:0.75rem;color:var(--text-muted)">Outros (R$)</label>
                      <input class="form-control" type="number" id="cost-other" min="0" step="0.01" placeholder="0,00" oninput="CostCalc.liveCalc()" />
                    </div>
                  </div>
                </div>

                <!-- Preview de resultado -->
                <div class="form-group form-group-full" id="cost-preview" style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;display:none">
                  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center">
                    <div>
                      <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase">Custo Total</div>
                      <div style="font-size:1.2rem;font-weight:800;color:var(--danger)" id="cost-total-display">R$ 0,00</div>
                    </div>
                    <div>
                      <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase">Lucro</div>
                      <div style="font-size:1.2rem;font-weight:800;color:var(--success)" id="cost-profit-display">R$ 0,00</div>
                    </div>
                    <div>
                      <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase">Margem</div>
                      <div style="font-size:1.2rem;font-weight:800;color:var(--primary)" id="cost-margin-display">0%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-ghost" onclick="CostCalc.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  <span class="material-symbols-outlined">save</span> Salvar Análise
                </button>
              </div>
            </form>
          </div>
        </div>`;

        await CostCalc.loadList();
    },

    onProcedureChange() {
        const sel = document.getElementById('cost-procedure');
        const customWrap = document.getElementById('cost-custom-name-wrap');
        
        if (sel.value === '__custom') {
            customWrap.classList.remove('hidden');
        } else {
            customWrap.classList.add('hidden');
            // Preenche preço do catálogo
            const opt = sel.selectedOptions[0];
            if (opt && opt.dataset.price) {
                document.getElementById('cost-sell-price').value = opt.dataset.price;
            }
        }
        CostCalc.liveCalc();
    },

    addInsumoRow() {
        const container = document.getElementById('cost-insumos-list');
        const idx = container.children.length;
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:1fr 80px 80px 32px;gap:6px;align-items:end';
        row.innerHTML = `
            <div>
                <select class="form-control" style="font-size:0.82rem" onchange="CostCalc.liveCalc()">
                    <option value="">-- Insumo --</option>
                    ${CostCalc.currentInventory.map(i => `<option value="${i.id}" data-unit-cost="${((i.purchasePrice || 0) / Math.max(i.qty || 1, 1)).toFixed(2)}">${i.name} (${i.unit || 'un'})</option>`).join('')}
                    <option value="__manual">✏️ Manual</option>
                </select>
            </div>
            <div>
                <input class="form-control" type="number" placeholder="Qtd" min="0" step="0.1" value="1" style="font-size:0.82rem" oninput="CostCalc.liveCalc()" />
            </div>
            <div>
                <input class="form-control" type="number" placeholder="R$" min="0" step="0.01" style="font-size:0.82rem" oninput="CostCalc.liveCalc()" />
            </div>
            <button type="button" class="btn btn-ghost btn-sm" onclick="this.parentElement.remove();CostCalc.liveCalc()" style="color:var(--danger)">✕</button>
        `;
        container.appendChild(row);
    },

    liveCalc() {
        const sellPrice = parseFloat(document.getElementById('cost-sell-price')?.value) || 0;
        if (sellPrice <= 0) {
            document.getElementById('cost-preview').style.display = 'none';
            return;
        }

        // Insumos
        let insumoCost = 0;
        document.querySelectorAll('#cost-insumos-list > div').forEach(row => {
            const inputs = row.querySelectorAll('input[type="number"]');
            const qty = parseFloat(inputs[0]?.value) || 0;
            const unitCost = parseFloat(inputs[1]?.value) || 0;
            insumoCost += qty * unitCost;
        });

        // Custos fixos
        const workTime = parseFloat(document.getElementById('cost-work-time')?.value) || 0;
        const hours = workTime / 60;
        const rent = (parseFloat(document.getElementById('cost-rent')?.value) || 0) * hours;
        const energy = (parseFloat(document.getElementById('cost-energy')?.value) || 0) * hours;
        const disposable = parseFloat(document.getElementById('cost-disposable')?.value) || 0;
        const other = parseFloat(document.getElementById('cost-other')?.value) || 0;

        const totalCost = insumoCost + rent + energy + disposable + other;
        const profit = sellPrice - totalCost;
        const margin = sellPrice > 0 ? (profit / sellPrice * 100) : 0;

        document.getElementById('cost-preview').style.display = 'block';
        document.getElementById('cost-total-display').textContent = App.formatCurrency(totalCost);
        document.getElementById('cost-total-display').style.color = totalCost > sellPrice ? 'var(--danger)' : 'var(--text-secondary)';
        document.getElementById('cost-profit-display').textContent = App.formatCurrency(profit);
        document.getElementById('cost-profit-display').style.color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
        document.getElementById('cost-margin-display').textContent = margin.toFixed(1) + '%';
        document.getElementById('cost-margin-display').style.color = margin >= 50 ? 'var(--success)' : margin >= 30 ? 'var(--primary)' : 'var(--danger)';
    },

    async loadList() {
        const list = document.getElementById('cost-list');
        list.innerHTML = '<div style="text-align:center;padding:32px"><div class="spinner"></div></div>';
        const items = await Store.getCostAnalyses();
        CostCalc._allItems = items;

        if (!items.length) {
            list.innerHTML = `<div class="empty-state">
                <span class="material-symbols-outlined empty-state-icon">calculate</span>
                <p class="empty-state-title">Nenhuma análise de custo</p>
                <p class="empty-state-desc">Calcule o custo real e a margem de lucro dos seus procedimentos.</p>
                <button class="btn btn-primary" onclick="CostCalc.openModal()">Criar Primeira Análise</button>
            </div>`;
            return;
        }

        list.innerHTML = `<div class="table-wrapper"><table>
            <thead><tr>
                <th>Procedimento</th><th>Valor Cobrado</th><th>Custo Total</th><th>Lucro</th><th>Margem</th><th>Ações</th>
            </tr></thead>
            <tbody>${items.map(item => {
                const margin = item.sellPrice > 0 ? ((item.profit || 0) / item.sellPrice * 100) : 0;
                const marginColor = margin >= 50 ? 'var(--success)' : margin >= 30 ? 'var(--primary)' : 'var(--danger)';
                return `<tr>
                    <td style="font-weight:600">${item.procedureName || '-'}</td>
                    <td style="font-weight:700;color:var(--primary)">${App.formatCurrency(item.sellPrice || 0)}</td>
                    <td>${App.formatCurrency(item.totalCost || 0)}</td>
                    <td style="font-weight:700;color:${(item.profit || 0) >= 0 ? 'var(--success)' : 'var(--danger)'}">${App.formatCurrency(item.profit || 0)}</td>
                    <td>
                        <div style="display:flex;align-items:center;gap:6px">
                            <div style="width:60px;height:6px;background:var(--border);border-radius:3px;overflow:hidden">
                                <div style="width:${Math.min(margin, 100)}%;height:100%;background:${marginColor};border-radius:3px"></div>
                            </div>
                            <span style="font-weight:700;color:${marginColor};font-size:0.85rem">${margin.toFixed(0)}%</span>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-ghost btn-sm" onclick="CostCalc.delete('${item.id}')" style="color:var(--danger)">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </td>
                </tr>`;
            }).join('')}</tbody>
        </table></div>`;
    },

    closeModal(event) {
        if (event && event.target !== document.getElementById('cost-modal')) return;
        document.getElementById('cost-modal')?.classList.add('hidden');
    },

    openModal() {
        CostCalc.editingId = null;
        document.getElementById('cost-form').reset();
        document.getElementById('cost-insumos-list').innerHTML = '';
        document.getElementById('cost-preview').style.display = 'none';
        document.getElementById('cost-custom-name-wrap').classList.add('hidden');
        document.getElementById('cost-modal').classList.remove('hidden');
    },

    async handleSave(e) {
        e.preventDefault();
        const procSel = document.getElementById('cost-procedure').value;
        const procedureName = procSel === '__custom'
            ? document.getElementById('cost-custom-name').value
            : procSel;

        const sellPrice = parseFloat(document.getElementById('cost-sell-price').value) || 0;
        const workTime = parseFloat(document.getElementById('cost-work-time').value) || 0;
        const hours = workTime / 60;

        // Calcula custos
        let insumoCost = 0;
        const insumos = [];
        document.querySelectorAll('#cost-insumos-list > div').forEach(row => {
            const select = row.querySelector('select');
            const inputs = row.querySelectorAll('input[type="number"]');
            const qty = parseFloat(inputs[0]?.value) || 0;
            const unitCost = parseFloat(inputs[1]?.value) || 0;
            insumoCost += qty * unitCost;
            if (select?.value) insumos.push({ itemId: select.value, qty, unitCost });
        });

        const rent = (parseFloat(document.getElementById('cost-rent').value) || 0) * hours;
        const energy = (parseFloat(document.getElementById('cost-energy').value) || 0) * hours;
        const disposable = parseFloat(document.getElementById('cost-disposable').value) || 0;
        const other = parseFloat(document.getElementById('cost-other').value) || 0;

        const totalCost = insumoCost + rent + energy + disposable + other;
        const profit = sellPrice - totalCost;

        const data = {
            procedureName,
            sellPrice,
            workTime,
            insumoCost,
            fixedCosts: { rent, energy, disposable, other },
            insumos,
            totalCost,
            profit,
            date: firebase.firestore.Timestamp.fromDate(new Date())
        };

        try {
            await Store.addCostAnalysis(data);
            document.getElementById('cost-modal').classList.add('hidden');
            App.showToast('Análise de custo salva! 🧮', 'success');
            await CostCalc.loadList();
        } catch (err) {
            App.showToast('Erro: ' + err.message, 'error');
        }
    },

    async delete(id) {
        if (!confirm('Excluir esta análise?')) return;
        await Store.deleteCostAnalysis(id);
        App.showToast('Análise removida.', 'success');
        await CostCalc.loadList();
    }
};
