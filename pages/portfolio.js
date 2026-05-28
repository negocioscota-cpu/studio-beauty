// === PORTFÓLIO ANTES & DEPOIS ===
const Portfolio = {
    editingId: null,
    currentClients: [],
    _allItems: [],
    RETENTION_DAYS: 100,

    async render(container) {
        Portfolio.currentClients = await Store.getClients();
        let items = await Store.getPortfolio();

        // Limpeza automática: remover imagens com mais de 100 dias
        await Portfolio._cleanupExpiredImages(items);
        // Recalcula dias restantes para cada item
        items = items.map(p => ({ ...p, _daysLeft: Portfolio._getDaysLeft(p) }));
        Portfolio._allItems = items;

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Header -->
          <div class="card" style="background:linear-gradient(135deg,var(--primary-xlight) 0%,#fff5f8 100%);border-color:var(--primary-light)">
            <div class="card-body" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
              <div style="font-size:36px">📸</div>
              <div style="flex:1;min-width:200px">
                <h3 style="font-weight:700;color:var(--primary-dark);margin-bottom:4px">Portfólio Antes & Depois</h3>
                <p style="font-size:0.85rem;color:var(--text-secondary)">Registre seus melhores trabalhos e compartilhe com suas clientes.</p>
                <p style="font-size:0.75rem;color:var(--gold-dark);margin-top:4px;display:flex;align-items:center;gap:4px">
                  <span class="material-symbols-outlined" style="font-size:14px">schedule</span>
                  As fotos ficam armazenadas por <strong>${Portfolio.RETENTION_DAYS} dias</strong>. Baixe-as antes que expirem!
                </p>
              </div>
              <button class="btn btn-primary" onclick="Portfolio.openModal()">
                <span class="material-symbols-outlined">add_photo_alternate</span> Novo Registro
              </button>
            </div>
          </div>

          <!-- Filtro -->
          <div class="toolbar">
            <div class="search-wrapper">
              <span class="material-symbols-outlined search-icon">search</span>
              <input class="search-input" id="portfolio-search" placeholder="Buscar por cliente ou procedimento..." oninput="Portfolio.filterItems()" />
            </div>
            <select class="form-control" id="portfolio-filter-type" onchange="Portfolio.filterItems()" style="width:200px">
              <option value="">Todos os procedimentos</option>
              <optgroup label="Cílios">
                <option>Extensão de Cílios</option>
                <option>Lifting de Cílios</option>
              </optgroup>
              <optgroup label="Lash Lifting">
                <option>Lash Lifting Clássico</option>
                <option>Lash Lifting com Tintura</option>
              </optgroup>
              <optgroup label="Sobrancelhas">
                <option>Design de Sobrancelhas</option>
                <option>Micropigmentação</option>
                <option>Brow Lamination</option>
                <option>Henna de Sobrancelhas</option>
              </optgroup>
              <optgroup label="Lábios">
                <option>Micropigmentação Labial</option>
                <option>Neutralização Labial</option>
                <option>Hydra Lips</option>
              </optgroup>
              <optgroup label="Facial">
                <option>Limpeza de Pele</option>
                <option>Peeling</option>
                <option>Microagulhamento</option>
                <option>Toxina Botulínica</option>
                <option>Preenchimento Facial</option>
                <option>Skinbooster</option>
              </optgroup>
            </select>
          </div>

          <!-- Grid de portfólio -->
          <div id="portfolio-grid" class="portfolio-grid">
            ${items.length === 0
                ? `<div class="empty-state" style="grid-column:1/-1">
                    <span class="material-symbols-outlined empty-state-icon">photo_camera</span>
                    <p class="empty-state-title">Seu portfólio está vazio</p>
                    <p class="empty-state-desc">Adicione fotos dos seus procedimentos para criar sua galeria profissional.</p>
                    <button class="btn btn-primary" onclick="Portfolio.openModal()">Adicionar primeiro registro</button>
                   </div>`
                : items.map(p => Portfolio.cardHtml(p)).join('')
            }
          </div>
        </div>

        <!-- Modal de novo registro -->
        <div id="portfolio-modal" class="modal-overlay hidden" onclick="Portfolio.closeModal(event)">
          <div class="modal-container modal-large" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">📸 Novo Registro de Portfólio</h3>
              <button class="modal-close" onclick="Portfolio.closeModal()">✕</button>
            </div>
            <form id="portfolio-form" onsubmit="Portfolio.handleSave(event)" class="modal-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Cliente *</label>
                  <select class="form-control" id="port-client" required>
                    <option value="">-- Selecione --</option>
                    ${Portfolio.currentClients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Procedimento *</label>
                  <select class="form-control" id="port-procedure" required>
                    <option value="">-- Selecione --</option>
                    <optgroup label="Cílios">
                      <option>Extensão de Cílios — Volume Russo</option>
                      <option>Extensão de Cílios — Clássico</option>
                      <option>Extensão de Cílios — Híbrido</option>
                      <option>Extensão de Cílios — Mega Volume</option>
                      <option>Extensão de Cílios — Fox Eyes</option>
                      <option>Lifting de Cílios</option>
                      <option>Remoção de Extensão</option>
                    </optgroup>
                    <optgroup label="Lash Lifting">
                      <option>Lash Lifting Clássico</option>
                      <option>Lash Lifting com Tintura</option>
                      <option>Lash Lifting + Brow Lamination</option>
                    </optgroup>
                    <optgroup label="Sobrancelhas">
                      <option>Design Simples (Pinça/Linha/Cera)</option>
                      <option>Design com Henna</option>
                      <option>Design com Tintura / Refectocil</option>
                      <option>Brow Lamination</option>
                      <option>Nutrição / Brow Botox</option>
                      <option>Reconstrução de Sobrancelhas</option>
                      <option>Micropigmentação — Fio a Fio (Tebori)</option>
                      <option>Micropigmentação — Shadow / Pixel</option>
                      <option>Despigmentação de Sobrancelhas</option>
                      <option>Henna de Sobrancelhas</option>
                    </optgroup>
                    <optgroup label="Lábios">
                      <option>Micropigmentação Labial — Efeito Batom / Pixel</option>
                      <option>Micropigmentação Labial — Efeito Aquarela</option>
                      <option>Neutralização de Lábios Escuros</option>
                      <option>Hydra Lips / Hydra Gloss</option>
                      <option>Microagulhamento Labial com Ativos</option>
                      <option>Revitalização / Peeling Labial</option>
                      <option>Despigmentação de Micropigmentação Labial</option>
                      <option>Preenchimento Labial (Ácido Hialurônico)</option>
                    </optgroup>
                    <optgroup label="Facial">
                      <option>Limpeza de Pele Profunda</option>
                      <option>Peeling Químico / Enzimático</option>
                      <option>Microagulhamento Facial</option>
                      <option>Protocolo de Exossomos</option>
                      <option>Skinbooster (Hidratação Injetável)</option>
                      <option>Toxina Botulínica (Botox)</option>
                      <option>Bioestimuladores de Colágeno</option>
                      <option>Preenchimento Facial (Ácido Hialurônico)</option>
                      <option>Fios de Sustentação / PDO</option>
                      <option>Ultrassom Micro e Macrofocado</option>
                      <option>Laser Lavieen / BB Laser</option>
                      <option>Laser de CO2 Fracionado</option>
                    </optgroup>
                    <optgroup label="Outros">
                      <option>Outro</option>
                    </optgroup>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Data do Procedimento</label>
                  <input class="form-control" type="date" id="port-date" value="${new Date().toISOString().split('T')[0]}" />
                </div>
                <div class="form-group">
                  <label class="form-label">Avaliação</label>
                  <select class="form-control" id="port-rating">
                    <option value="5">⭐⭐⭐⭐⭐ Excelente</option>
                    <option value="4">⭐⭐⭐⭐ Muito Bom</option>
                    <option value="3">⭐⭐⭐ Bom</option>
                    <option value="2">⭐⭐ Regular</option>
                  </select>
                </div>

                <!-- Fotos -->
                <div class="form-group form-group-full ficha-section">
                  <div class="ficha-section-title">
                    <span class="material-symbols-outlined">photo_library</span> Fotos do Procedimento
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px">
                    <!-- Antes -->
                    <div>
                      <label class="form-label">📷 Foto ANTES</label>
                      <div class="photo-upload-area" id="port-before-area" onclick="document.getElementById('port-before-input').click()">
                        <img id="port-before-preview" class="photo-preview hidden" />
                        <div id="port-before-placeholder" class="photo-placeholder">
                          <span class="material-symbols-outlined" style="font-size:32px;color:var(--text-muted)">add_a_photo</span>
                          <span style="font-size:0.8rem;color:var(--text-muted)">Toque para adicionar</span>
                        </div>
                      </div>
                      <input type="file" id="port-before-input" accept="image/*" capture="environment" class="hidden" onchange="Portfolio.handleImageUpload(this, 'before')" />
                    </div>
                    <!-- Depois -->
                    <div>
                      <label class="form-label">✨ Foto DEPOIS</label>
                      <div class="photo-upload-area" id="port-after-area" onclick="document.getElementById('port-after-input').click()">
                        <img id="port-after-preview" class="photo-preview hidden" />
                        <div id="port-after-placeholder" class="photo-placeholder">
                          <span class="material-symbols-outlined" style="font-size:32px;color:var(--text-muted)">add_a_photo</span>
                          <span style="font-size:0.8rem;color:var(--text-muted)">Toque para adicionar</span>
                        </div>
                      </div>
                      <input type="file" id="port-after-input" accept="image/*" capture="environment" class="hidden" onchange="Portfolio.handleImageUpload(this, 'after')" />
                    </div>
                  </div>
                </div>

                <div class="form-group form-group-full">
                  <label class="form-label">Observações / Depoimento da cliente</label>
                  <textarea class="form-control" id="port-notes" rows="2" placeholder="Ex: Cliente amou o resultado! Voltou a se sentir confiante..."></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-ghost" onclick="Portfolio.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" id="port-save-btn">
                  <span class="material-symbols-outlined">save</span> Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal de visualização -->
        <div id="portfolio-view-modal" class="modal-overlay hidden" onclick="Portfolio.closeViewModal(event)">
          <div class="modal-container modal-large" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title" id="port-view-title">Detalhes do Registro</h3>
              <button class="modal-close" onclick="Portfolio.closeViewModal()">✕</button>
            </div>
            <div class="modal-body" id="port-view-body"></div>
          </div>
        </div>`;

        Portfolio._allItems = items;
    },

    _allItems: [],
    _tempBefore: null,
    _tempAfter: null,

    cardHtml(p) {
        const clientName = Portfolio.currentClients.find(c => c.id === p.clientId)?.name || 'Cliente';
        const stars = '⭐'.repeat(p.rating || 5);
        const hasPhotos = p.photoBefore || p.photoAfter;
        const daysLeft = p._daysLeft ?? Portfolio._getDaysLeft(p);
        const isExpiringSoon = daysLeft >= 0 && daysLeft <= 15;
        const isExpired = daysLeft < 0;
        const retentionBadge = hasPhotos
            ? (isExpired
                ? `<span style="font-size:0.7rem;padding:2px 8px;border-radius:10px;background:rgba(220,53,69,0.1);color:#dc3545;font-weight:600">📷 Fotos expiradas</span>`
                : isExpiringSoon
                    ? `<span style="font-size:0.7rem;padding:2px 8px;border-radius:10px;background:rgba(255,193,7,0.15);color:#e0a800;font-weight:600">⏳ ${daysLeft}d restantes</span>`
                    : `<span style="font-size:0.7rem;padding:2px 8px;border-radius:10px;background:rgba(40,167,69,0.1);color:#28a745;font-weight:600">📷 ${daysLeft}d</span>`)
            : '';

        return `
        <div class="portfolio-card" onclick="Portfolio.viewItem('${p.id}')">
          <div class="portfolio-photos">
            ${p.photoBefore
                ? `<div class="portfolio-photo-half">
                    <div class="portfolio-photo-label">ANTES</div>
                    <img src="${p.photoBefore}" alt="Antes" />
                   </div>`
                : `<div class="portfolio-photo-half portfolio-photo-empty">
                    <span class="material-symbols-outlined">photo_camera</span>ANTES
                   </div>`
            }
            ${p.photoAfter
                ? `<div class="portfolio-photo-half">
                    <div class="portfolio-photo-label label-after">DEPOIS</div>
                    <img src="${p.photoAfter}" alt="Depois" />
                   </div>`
                : `<div class="portfolio-photo-half portfolio-photo-empty">
                    <span class="material-symbols-outlined">auto_awesome</span>DEPOIS
                   </div>`
            }
          </div>
          <div class="portfolio-card-body">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div>
                <div style="font-weight:700;font-size:0.95rem;color:var(--text-primary)">${clientName}</div>
                <div style="font-size:0.8rem;color:var(--text-muted)">${p.procedure || '-'}</div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
                <div style="font-size:0.75rem">${stars}</div>
                ${retentionBadge}
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
              <span style="font-size:0.78rem;color:var(--text-muted)">${p.date || '-'}</span>
              <div style="display:flex;gap:4px">
                ${hasPhotos ? `<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Portfolio.downloadImages('${p.id}')" title="Baixar fotos" style="color:#1d6f42">
                  <span class="material-symbols-outlined" style="font-size:16px">download</span>
                </button>` : ''}
                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Portfolio.shareItem('${p.id}')" title="Compartilhar">
                  <span class="material-symbols-outlined" style="font-size:16px">share</span>
                </button>
                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Portfolio.deleteItem('${p.id}')" title="Excluir" style="color:var(--danger)">
                  <span class="material-symbols-outlined" style="font-size:16px">delete</span>
                </button>
              </div>
            </div>
            ${p.notes ? `<div style="font-size:0.78rem;color:var(--text-secondary);margin-top:6px;font-style:italic">"${p.notes}"</div>` : ''}
          </div>
        </div>`;
    },

    async handleImageUpload(input, type) {
        const file = input.files[0];
        if (!file) return;

        const preview = document.getElementById(`port-${type}-preview`);
        const placeholder = document.getElementById(`port-${type}-placeholder`);

        // Comprimir imagem para max 300KB
        const compressed = await Portfolio.compressImage(file, 800, 0.7);
        preview.src = compressed;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');

        if (type === 'before') Portfolio._tempBefore = compressed;
        else Portfolio._tempAfter = compressed;
    },

    compressImage(file, maxWidth, quality) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height;
                    if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
                    canvas.width = w;
                    canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },

    filterItems() {
        const q = (document.getElementById('portfolio-search')?.value || '').toLowerCase();
        const typeFilter = document.getElementById('portfolio-filter-type')?.value || '';
        const grid = document.getElementById('portfolio-grid');
        if (!grid) return;

        const filtered = Portfolio._allItems.filter(p => {
            const clientName = Portfolio.currentClients.find(c => c.id === p.clientId)?.name || '';
            const matchSearch = !q || clientName.toLowerCase().includes(q) || (p.procedure || '').toLowerCase().includes(q);
            const matchType = !typeFilter || (p.procedure || '').includes(typeFilter);
            return matchSearch && matchType;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
                <span class="material-symbols-outlined empty-state-icon">search_off</span>
                <p class="empty-state-title">Nenhum resultado encontrado</p>
            </div>`;
        } else {
            grid.innerHTML = filtered.map(p => Portfolio.cardHtml(p)).join('');
        }
    },

    async viewItem(id) {
        const items = Portfolio._allItems;
        const p = items.find(x => x.id === id);
        if (!p) return;

        const clientName = Portfolio.currentClients.find(c => c.id === p.clientId)?.name || 'Cliente';
        const stars = '⭐'.repeat(p.rating || 5);
        const body = document.getElementById('port-view-body');
        document.getElementById('port-view-title').textContent = `${clientName} — ${p.procedure || ''}`;

        body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div style="text-align:center">
              <div style="font-weight:600;color:var(--text-muted);margin-bottom:8px;font-size:0.85rem">📷 ANTES</div>
              ${p.photoBefore
                  ? `<img src="${p.photoBefore}" style="width:100%;border-radius:var(--radius-sm);max-height:400px;object-fit:cover" />`
                  : `<div style="height:200px;background:var(--bg);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--text-muted)">Sem foto</div>`
              }
            </div>
            <div style="text-align:center">
              <div style="font-weight:600;color:var(--primary);margin-bottom:8px;font-size:0.85rem">✨ DEPOIS</div>
              ${p.photoAfter
                  ? `<img src="${p.photoAfter}" style="width:100%;border-radius:var(--radius-sm);max-height:400px;object-fit:cover" />`
                  : `<div style="height:200px;background:var(--bg);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--text-muted)">Sem foto</div>`
              }
            </div>
          </div>
          <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center">
            <div><strong>Data:</strong> ${p.date || '-'}</div>
            <div><strong>Avaliação:</strong> ${stars}</div>
            ${(() => { const dl = Portfolio._getDaysLeft(p); return (p.photoBefore || p.photoAfter) ? `<div style="display:flex;align-items:center;gap:4px">
              <span class="material-symbols-outlined" style="font-size:16px;color:${dl <= 15 ? '#e0a800' : '#28a745'}">schedule</span>
              <span style="font-size:0.85rem;font-weight:600;color:${dl <= 15 ? '#e0a800' : '#28a745'}">${dl > 0 ? dl + ' dias restantes' : 'Fotos expiradas'}</span>
            </div>` : ''; })()}
          </div>
          ${p.notes ? `<div class="card" style="background:var(--primary-xlight)"><div class="card-body"><strong>💬 Depoimento:</strong><br>"${p.notes}"</div></div>` : ''}
          <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
            ${(p.photoBefore || p.photoAfter) ? `<button class="btn-export-excel" onclick="Portfolio.downloadImages('${p.id}')" style="background:linear-gradient(135deg,#1d6f42,#217346)">
              <span class="material-symbols-outlined">download</span> Baixar Fotos
            </button>` : ''}
            <button class="btn btn-outline" onclick="Portfolio.shareItem('${p.id}')">
              <span class="material-symbols-outlined">share</span> Compartilhar WhatsApp
            </button>
          </div>
        </div>`;

        document.getElementById('portfolio-view-modal').classList.remove('hidden');
    },

    closeViewModal(event) {
        if (event && event.target !== document.getElementById('portfolio-view-modal')) return;
        document.getElementById('portfolio-view-modal')?.classList.add('hidden');
    },

    async shareItem(id) {
        const p = Portfolio._allItems.find(x => x.id === id);
        if (!p) return;
        const clientName = Portfolio.currentClients.find(c => c.id === p.clientId)?.name || 'Cliente';
        const msg = encodeURIComponent(`✨ Resultado incrível de ${p.procedure || 'procedimento'} com ${clientName}!\n\n` +
            `Agende o seu horário! 💕\n` +
            `📱 LashBrow — Gestão Profissional de Cílios & Sobrancelhas`);
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    },

    async openModal(id = null) {
        Portfolio.editingId = id;
        Portfolio._tempBefore = null;
        Portfolio._tempAfter = null;
        const form = document.getElementById('portfolio-form');
        form.reset();
        document.getElementById('port-date').value = new Date().toISOString().split('T')[0];

        // Reset previews
        ['before', 'after'].forEach(t => {
            document.getElementById(`port-${t}-preview`).classList.add('hidden');
            document.getElementById(`port-${t}-preview`).src = '';
            document.getElementById(`port-${t}-placeholder`).classList.remove('hidden');
        });

        if (id) {
            const p = Portfolio._allItems.find(x => x.id === id);
            if (p) {
                document.getElementById('port-client').value = p.clientId || '';
                document.getElementById('port-procedure').value = p.procedure || '';
                document.getElementById('port-date').value = p.date || '';
                document.getElementById('port-rating').value = p.rating || 5;
                document.getElementById('port-notes').value = p.notes || '';
                if (p.photoBefore) {
                    Portfolio._tempBefore = p.photoBefore;
                    document.getElementById('port-before-preview').src = p.photoBefore;
                    document.getElementById('port-before-preview').classList.remove('hidden');
                    document.getElementById('port-before-placeholder').classList.add('hidden');
                }
                if (p.photoAfter) {
                    Portfolio._tempAfter = p.photoAfter;
                    document.getElementById('port-after-preview').src = p.photoAfter;
                    document.getElementById('port-after-preview').classList.remove('hidden');
                    document.getElementById('port-after-placeholder').classList.add('hidden');
                }
            }
        }
        document.getElementById('portfolio-modal').classList.remove('hidden');
    },

    closeModal(event) {
        if (event && event.target !== document.getElementById('portfolio-modal')) return;
        document.getElementById('portfolio-modal')?.classList.add('hidden');
        Portfolio.editingId = null;
    },

    async handleSave(e) {
        e.preventDefault();
        const btn = document.getElementById('port-save-btn');
        btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> Salvando...';

        const data = {
            clientId:    document.getElementById('port-client').value,
            procedure:   document.getElementById('port-procedure').value,
            date:        document.getElementById('port-date').value,
            rating:      parseInt(document.getElementById('port-rating').value) || 5,
            notes:       document.getElementById('port-notes').value.trim(),
            photoBefore: Portfolio._tempBefore || '',
            photoAfter:  Portfolio._tempAfter || ''
        };

        try {
            if (Portfolio.editingId) await Store.updatePortfolio(Portfolio.editingId, data);
            else await Store.addPortfolio(data);
            document.getElementById('portfolio-modal').classList.add('hidden');
            App.showToast('Registro salvo no portfólio!', 'success');
            await Portfolio.render(document.getElementById('page-content'));
        } catch (err) {
            App.showToast('Erro: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined">save</span> Salvar Registro';
        }
    },

    async deleteItem(id) {
        if (!confirm('Excluir este registro do portfólio?')) return;
        await Store.deletePortfolio(id);
        App.showToast('Registro removido.', 'success');
        await Portfolio.render(document.getElementById('page-content'));
    },

    /** Baixa as imagens do registro do portfólio */
    downloadImages(id) {
        const p = Portfolio._allItems.find(x => x.id === id);
        if (!p) return;
        const clientName = Portfolio.currentClients.find(c => c.id === p.clientId)?.name || 'cliente';
        const safeName = clientName.replace(/[^a-zA-Z0-9À-ÿ]/g, '_').toLowerCase();

        if (p.photoBefore) Portfolio._downloadBase64(p.photoBefore, `${safeName}_antes.jpg`);
        if (p.photoAfter)  Portfolio._downloadBase64(p.photoAfter, `${safeName}_depois.jpg`);

        if (!p.photoBefore && !p.photoAfter) {
            App.showToast('Este registro não possui fotos.', 'warning');
            return;
        }
        App.showToast('📥 Download das fotos iniciado!', 'success');
    },

    /** Converte base64 ou URL em download */
    _downloadBase64(dataUrl, filename) {
        try {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => { document.body.removeChild(link); }, 200);
        } catch (e) {
            console.error('Erro ao baixar imagem:', e);
        }
    },

    /** Calcula quantos dias restam para as fotos deste item */
    _getDaysLeft(p) {
        try {
            let created;
            if (p.createdAt?.toDate) {
                created = p.createdAt.toDate();
            } else if (p.createdAt?.seconds) {
                created = new Date(p.createdAt.seconds * 1000);
            } else if (p.date) {
                // Fallback: usa o campo date (formato dd/mm/yyyy ou yyyy-mm-dd)
                const parts = p.date.includes('/') ? p.date.split('/').reverse().join('-') : p.date;
                created = new Date(parts);
            } else {
                return Portfolio.RETENTION_DAYS; // sem data, assume recente
            }
            const now = new Date();
            const diffMs = now - created;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            return Portfolio.RETENTION_DAYS - diffDays;
        } catch (e) {
            return Portfolio.RETENTION_DAYS;
        }
    },

    /** Limpeza automática: remove imagens (base64) de registros com +100 dias */
    async _cleanupExpiredImages(items) {
        const expiredItems = items.filter(p => {
            const daysLeft = Portfolio._getDaysLeft(p);
            return daysLeft < 0 && (p.photoBefore || p.photoAfter);
        });

        if (expiredItems.length === 0) return;

        console.log(`[Portfolio] Limpando imagens de ${expiredItems.length} registro(s) com mais de ${Portfolio.RETENTION_DAYS} dias.`);

        for (const item of expiredItems) {
            try {
                await Store.updatePortfolio(item.id, {
                    photoBefore: null,
                    photoAfter: null,
                    _imagesCleanedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                // Atualiza localmente para refletir a limpeza
                item.photoBefore = null;
                item.photoAfter = null;
            } catch (e) {
                console.error(`[Portfolio] Erro ao limpar imagens do item ${item.id}:`, e);
            }
        }

        if (expiredItems.length > 0) {
            App.showToast(`🗑️ ${expiredItems.length} registro(s) tiveram fotos removidas após ${Portfolio.RETENTION_DAYS} dias.`, 'info');
        }
    }
};
