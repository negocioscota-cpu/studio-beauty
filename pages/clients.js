// === CLIENTES ===
const Clients = {
    currentClients: [],
    editingId: null,

    async render(container) {
        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Toolbar -->
          <div class="toolbar">
            <div class="search-wrapper">
              <span class="material-symbols-outlined search-icon">search</span>
              <input class="search-input" id="clients-search" placeholder="Buscar clientes..." oninput="Clients.filterClients()" />
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="btn-export-excel" onclick="Clients.exportExcel()">
                <span class="material-symbols-outlined" style="font-size:18px">download</span> Exportar Excel
              </button>
              <button class="btn btn-primary" id="btn-new-client" onclick="Clients.openModal()">
                <span class="material-symbols-outlined">person_add</span> Nova Cliente
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="card">
            <div class="table-wrapper">
              <table>
                <thead><tr>
                  <th>Nome</th><th>Telefone</th><th>Email</th><th>Procedimento</th><th>Status</th><th>Ações</th>
                </tr></thead>
                <tbody id="clients-tbody">
                  <tr><td colspan="6" class="text-center" style="padding:32px;color:var(--text-muted)">Carregando...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modal de cadastro/edição -->
        <div id="client-modal" class="modal-overlay hidden" onclick="Clients.closeModal(event)">
          <div class="modal-container" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title" id="client-modal-title">Nova Cliente</h3>
              <button class="modal-close" onclick="Clients.closeModal()">✕</button>
            </div>
            <form id="client-form" onsubmit="Clients.handleSave(event)" class="modal-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nome *</label>
                  <input class="form-control" id="client-name" required placeholder="Nome completo" />
                </div>
                <div class="form-group">
                  <label class="form-label">Telefone</label>
                  <input class="form-control" id="client-phone" placeholder="(00) 00000-0000" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input class="form-control" type="email" id="client-email" placeholder="email@exemplo.com" />
                </div>
                <div class="form-group">
                  <label class="form-label">Data de Nascimento</label>
                  <input class="form-control" type="date" id="client-birthday" />
                </div>
                <div class="form-group">
                  <label class="form-label">Procedimento Principal</label>
                  <select class="form-control" id="client-procedure">
                    <option value="">-- Selecione --</option>
                    <option>Extensão de Cílios</option>
                    <option>Lifting de Cílios</option>
                    <option>Design de Sobrancelhas</option>
                    <option>Micropigmentação de Sobrancelhas</option>
                    <option>Brow Lamination</option>
                    <option>Remoção de Extensão</option>
                    <option>Manutenção</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select class="form-control" id="client-status">
                    <option value="active">Ativa</option>
                    <option value="inactive">Inativa</option>
                  </select>
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">Observações / Alergias</label>
                  <textarea class="form-control" id="client-notes" rows="3" placeholder="Alergias, preferências, observações..."></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-ghost" onclick="Clients.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" id="client-save-btn">
                  <span class="material-symbols-outlined">save</span> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Drawer de Perfil da Cliente -->
        <div id="client-drawer-overlay" class="drawer-overlay hidden" onclick="Clients.closeDrawer()"></div>
        <div id="client-drawer" class="client-drawer hidden">
          <div class="drawer-header">
            <div>
              <h3 class="drawer-title" id="drawer-client-name">Perfil da Cliente</h3>
              <div class="drawer-subtitle" id="drawer-client-sub"></div>
            </div>
            <button class="modal-close" onclick="Clients.closeDrawer()">✕</button>
          </div>
          <!-- Tabs -->
          <div class="drawer-tabs">
            <button class="drawer-tab active" id="tab-btn-resumo" onclick="Clients.switchTab('resumo')">
              <span class="material-symbols-outlined">person</span> Resumo
            </button>
            <button class="drawer-tab" id="tab-btn-historico" onclick="Clients.switchTab('historico')">
              <span class="material-symbols-outlined">history</span> Histórico
            </button>
            <button class="drawer-tab" id="tab-btn-galeria" onclick="Clients.switchTab('galeria')">
              <span class="material-symbols-outlined">photo_library</span> Galeria
            </button>
            <button class="drawer-tab" id="tab-btn-avaliacoes" onclick="Clients.switchTab('avaliacoes')">
              <span class="material-symbols-outlined">star</span> NPS
            </button>
          </div>
          <div id="drawer-content" class="drawer-content">
            <div class="empty-state"><div class="spinner"></div></div>
          </div>
        </div>`;

        await Clients.loadClients();
    },

    async loadClients() {
        Clients.currentClients = await Store.getClients();
        Clients.renderTable(Clients.currentClients);
    },

    renderTable(clients) {
        const tbody = document.getElementById('clients-tbody');
        if (!tbody) return;
        if (!clients.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:var(--text-muted);padding:40px">
                <div class="empty-state"><span class="material-symbols-outlined empty-state-icon">person_search</span>
                <p class="empty-state-title">Nenhuma cliente encontrada</p>
                <button class="btn btn-primary" onclick="Clients.openModal()">Cadastrar primeira cliente</button></div>
            </td></tr>`;
            return;
        }
        tbody.innerHTML = clients.map(c => `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td>${c.phone || '-'}</td>
          <td>${c.email || '-'}</td>
          <td>${c.procedure || '-'}</td>
          <td><span class="badge ${c.status === 'active' ? 'badge-green' : 'badge-brown'}">${c.status === 'active' ? 'Ativa' : 'Inativa'}</span></td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-primary btn-sm" onclick="Clients.openDrawer('${c.id}')" title="Ver Perfil" style="gap:4px">
                <span class="material-symbols-outlined" style="font-size:16px">person_search</span> Perfil
              </button>
              <button class="btn btn-ghost btn-sm" onclick="Clients.openModal('${c.id}')" title="Editar">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="btn btn-ghost btn-sm" onclick="Clients.deleteClient('${c.id}','${c.name}')" title="Excluir" style="color:var(--danger)">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </td>
        </tr>`).join('');
    },

    filterClients() {
        const q = document.getElementById('clients-search').value.toLowerCase();
        const filtered = Clients.currentClients.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.phone?.includes(q) ||
            c.email?.toLowerCase().includes(q)
        );
        Clients.renderTable(filtered);
    },

    // ===== DRAWER DE PERFIL =====
    _drawerClientId: null,
    _drawerTab: 'resumo',

    async openDrawer(clientId) {
        Clients._drawerClientId = clientId;
        Clients._drawerTab = 'resumo';

        const c = await Store.getClient(clientId);
        if (!c) return;

        document.getElementById('drawer-client-name').textContent = c.name;
        document.getElementById('drawer-client-sub').textContent =
            [c.procedure, c.phone].filter(Boolean).join(' · ') || 'Sem dados adicionais';

        // Mostrar drawer
        document.getElementById('client-drawer-overlay').classList.remove('hidden');
        document.getElementById('client-drawer').classList.remove('hidden');
        requestAnimationFrame(() => {
            document.getElementById('client-drawer').classList.add('open');
        });

        // Resetar tabs
        document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
        document.getElementById('tab-btn-resumo').classList.add('active');

        await Clients.loadDrawerTab('resumo', c);
    },

    closeDrawer() {
        const drawer = document.getElementById('client-drawer');
        drawer?.classList.remove('open');
        setTimeout(() => {
            drawer?.classList.add('hidden');
            document.getElementById('client-drawer-overlay')?.classList.add('hidden');
        }, 300);
    },

    async switchTab(tab) {
        Clients._drawerTab = tab;
        document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-btn-${tab}`)?.classList.add('active');
        const c = await Store.getClient(Clients._drawerClientId);
        document.getElementById('drawer-content').innerHTML =
            '<div class="empty-state" style="padding:40px"><div class="spinner"></div></div>';
        await Clients.loadDrawerTab(tab, c);
    },

    async loadDrawerTab(tab, client) {
        const container = document.getElementById('drawer-content');
        if (!container) return;

        if (tab === 'resumo') {
            const loyalty = await Store.getClientLoyalty(client.id).catch(() => null);
            container.innerHTML = Clients._tabResumoHTML(client, loyalty);
        }

        if (tab === 'historico') {
            const data = await Store.getClientHistory(client.id);
            container.innerHTML = Clients._tabHistoricoHTML(data, client);
        }

        if (tab === 'galeria') {
            const photos = await Store.getPortfolioByClient(client.id);
            container.innerHTML = Clients._tabGaleriaHTML(photos, client);
        }

        if (tab === 'avaliacoes') {
            const reviews = await Store.getClientReviews(client.phone).catch(() => []);
            container.innerHTML = Clients._tabAvaliacoesHTML(reviews, client);
        }
    },

    _tabResumoHTML(c, loyalty) {
        const bday = c.birthday ? new Date(c.birthday + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
        const since = c.createdAt?.toDate
            ? c.createdAt.toDate().toLocaleDateString('pt-BR')
            : (c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '—');

        const loyaltyHTML = loyalty ? `
        <div class="card" style="background:linear-gradient(135deg,rgba(201,169,110,0.1),rgba(201,169,110,0.03));border:1px solid rgba(201,169,110,0.3)">
          <div class="card-body" style="padding:14px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <strong style="font-size:0.85rem;color:var(--gold-dark)">💎 Programa de Fidelidade</strong>
              ${loyalty.milestones > 0 ? `<span class="badge badge-gold">🏅 ×${loyalty.milestones} premiada</span>` : ''}
            </div>
            <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:8px">
              ${loyalty.totalVisits} atendimento${loyalty.totalVisits !== 1 ? 's' : ''} concluído${loyalty.totalVisits !== 1 ? 's' : ''}
              ${loyalty.totalVisits % loyalty.config.threshold === 0 && loyalty.totalVisits > 0
                ? ' · 🎉 <strong style="color:var(--gold-dark)">Marco atingido!</strong>'
                : ` · Faltam <strong>${loyalty.nextIn}</strong> para "${loyalty.config.reward}"`}
            </div>
            <div class="loyalty-progress-bar-bg">
              <div class="loyalty-progress-bar-fill" style="width:${loyalty.progress}%"></div>
            </div>
          </div>
        </div>` : '';

        return `
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="drawer-avatar-section">
            <div class="drawer-avatar">${(c.name || 'C').charAt(0).toUpperCase()}</div>
            <div>
              <div style="font-size:1.1rem;font-weight:700;color:var(--text-primary)">${c.name}</div>
              <span class="badge ${c.status === 'active' ? 'badge-green' : 'badge-brown'}" style="margin-top:4px">
                ${c.status === 'active' ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>

          <div class="drawer-info-grid">
            <div class="drawer-info-item">
              <span class="material-symbols-outlined drawer-info-icon">phone</span>
              <div><div class="drawer-info-label">Telefone</div><div class="drawer-info-value">${c.phone || '—'}</div></div>
            </div>
            <div class="drawer-info-item">
              <span class="material-symbols-outlined drawer-info-icon">mail</span>
              <div><div class="drawer-info-label">E-mail</div><div class="drawer-info-value">${c.email || '—'}</div></div>
            </div>
            <div class="drawer-info-item">
              <span class="material-symbols-outlined drawer-info-icon">cake</span>
              <div><div class="drawer-info-label">Aniversário</div><div class="drawer-info-value">${bday}</div></div>
            </div>
            <div class="drawer-info-item">
              <span class="material-symbols-outlined drawer-info-icon">spa</span>
              <div><div class="drawer-info-label">Procedimento</div><div class="drawer-info-value">${c.procedure || '—'}</div></div>
            </div>
            <div class="drawer-info-item">
              <span class="material-symbols-outlined drawer-info-icon">calendar_today</span>
              <div><div class="drawer-info-label">Cliente desde</div><div class="drawer-info-value">${since}</div></div>
            </div>
          </div>

          ${loyaltyHTML}

          ${c.notes ? `<div class="card" style="background:var(--primary-xlight)">
            <div class="card-body" style="padding:14px">
              <strong style="font-size:0.85rem;color:var(--primary-dark)">📋 Observações / Alergias</strong>
              <p style="margin-top:6px;font-size:0.88rem;color:var(--text-secondary)">${c.notes}</p>
            </div></div>` : ''}

          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" onclick="Clients.openModal('${c.id}');Clients.closeDrawer()">
              <span class="material-symbols-outlined">edit</span> Editar
            </button>
            ${c.phone ? `<a class="btn btn-wa btn-sm" href="https://wa.me/55${c.phone.replace(/\D/g,'')}" target="_blank">
              📲 WhatsApp
            </a>` : ''}
            <button class="btn btn-ghost btn-sm" onclick="Clients.switchTab('historico')" style="color:var(--primary)">
              <span class="material-symbols-outlined">history</span> Histórico
            </button>
            <button class="btn btn-ghost btn-sm" onclick="Clients.switchTab('galeria')" style="color:var(--primary)">
              <span class="material-symbols-outlined">photo_library</span> Galeria
            </button>
          </div>
        </div>`;
    },

    _tabHistoricoHTML(data, client) {
        const { history, totalSpent, totalVisits } = data;

        const statsHTML = `
        <div class="history-stats">
          <div class="history-stat">
            <div class="history-stat-value">${totalVisits}</div>
            <div class="history-stat-label">Atendimentos</div>
          </div>
          <div class="history-stat">
            <div class="history-stat-value">${App.formatCurrency(totalSpent)}</div>
            <div class="history-stat-label">Total Gasto</div>
          </div>
          <div class="history-stat">
            <div class="history-stat-value">${totalVisits > 0 ? App.formatCurrency(totalSpent / totalVisits) : '—'}</div>
            <div class="history-stat-label">Ticket Médio</div>
          </div>
        </div>`;

        if (history.length === 0) {
            return statsHTML + `<div class="empty-state" style="padding:40px">
              <span class="material-symbols-outlined empty-state-icon">history</span>
              <p class="empty-state-title">Sem histórico registrado</p>
              <p class="empty-state-desc">Fichas técnicas e agendamentos aparecerão aqui.</p>
            </div>`;
        }

        const timelineHTML = history.map((item, idx) => {
            const dt = item.date?.toDate ? item.date.toDate() : new Date(item.date || 0);
            const dateStr = isNaN(dt) ? '—' : dt.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });
            const isFicha = item.type === 'ficha';
            const detailId = `tl-detail-${idx}`;

            // Detalhes extras para fichas técnicas
            const fichaDetails = isFicha ? `
              <div id="${detailId}" class="timeline-detail hidden">
                ${item.ph ? `<div class="timeline-detail-row"><span>pH</span><strong>${item.ph}</strong></div>` : ''}
                ${item.product ? `<div class="timeline-detail-row"><span>Produto</span><strong>${item.product}</strong></div>` : ''}
                ${item.time ? `<div class="timeline-detail-row"><span>Tempo</span><strong>${item.time} min</strong></div>` : ''}
                ${item.curl ? `<div class="timeline-detail-row"><span>Curvatura</span><strong>${item.curl}</strong></div>` : ''}
                ${item.observation ? `<div class="timeline-detail-row" style="grid-column:1/-1"><span>Obs.</span><strong>${item.observation}</strong></div>` : ''}
              </div>` : '';

            return `
            <div class="timeline-item">
              <div class="timeline-dot ${isFicha ? 'timeline-dot-rose' : item.status === 'done' ? 'timeline-dot-gold' : 'timeline-dot-muted'}">
                <span class="material-symbols-outlined" style="font-size:14px">${isFicha ? 'spa' : item.status === 'done' ? 'check_circle' : 'event'}</span>
              </div>
              <div class="timeline-body">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                  <div>
                    <div class="timeline-date">${dateStr}</div>
                    <div class="timeline-title">${item.procedure || item.service || '—'}</div>
                  </div>
                  ${isFicha ? `<button class="btn btn-ghost btn-sm" style="padding:2px 6px;font-size:0.75rem" onclick="document.getElementById('${detailId}').classList.toggle('hidden')">
                    <span class="material-symbols-outlined" style="font-size:14px">expand_more</span>
                  </button>` : ''}
                </div>
                <div class="timeline-meta">
                  ${isFicha ? '<span class="badge badge-rose" style="font-size:0.7rem">Ficha Técnica</span>' : ''}
                  ${item.status === 'done' ? '<span class="badge badge-green" style="font-size:0.7rem">Concluído</span>' : ''}
                  ${item.price ? `<span style="font-size:0.8rem;color:var(--gold-dark);font-weight:600">${App.formatCurrency(parseFloat(item.price))}</span>` : ''}
                  ${item.professionalName ? `<span style="font-size:0.78rem;color:var(--text-muted)">por ${item.professionalName}</span>` : ''}
                </div>
                ${item.notes ? `<div style="font-size:0.78rem;color:var(--text-secondary);margin-top:4px;font-style:italic">"${item.notes}"</div>` : ''}
                ${fichaDetails}
              </div>
            </div>`;
        }).join('');

        return statsHTML + `<div class="timeline">${timelineHTML}</div>`;
    },

    _tabGaleriaHTML(photos) {
        if (photos.length === 0) {
            return `<div class="empty-state" style="padding:40px">
              <span class="material-symbols-outlined empty-state-icon">photo_camera</span>
              <p class="empty-state-title">Sem fotos registradas</p>
              <p class="empty-state-desc">Adicione registros no Portfólio vinculando a esta cliente.</p>
              <button class="btn btn-primary btn-sm" onclick="App.navigate('portfolio');Clients.closeDrawer()">
                Ir para Portfólio
              </button>
            </div>`;
        }

        return `
        <div style="display:flex;flex-direction:column;gap:16px">
          <p style="font-size:0.85rem;color:var(--text-muted)">${photos.length} registro${photos.length !== 1 ? 's' : ''} encontrado${photos.length !== 1 ? 's' : ''}</p>
          ${photos.map(p => `
          <div class="gallery-item-card">
            <div class="gallery-item-header">
              <span style="font-weight:600;font-size:0.9rem">${p.procedure || '—'}</span>
              <span style="font-size:0.78rem;color:var(--text-muted)">${p.date || '—'}</span>
            </div>
            <div class="gallery-photos-grid">
              <div class="gallery-photo-wrap">
                <div class="gallery-label">ANTES</div>
                ${p.photoBefore
                  ? `<img src="${p.photoBefore}" alt="Antes" class="gallery-photo" onclick="Clients._enlargePhoto('${p.photoBefore}')" />`
                  : `<div class="gallery-photo-empty"><span class="material-symbols-outlined">photo_camera</span></div>`
                }
              </div>
              <div class="gallery-photo-wrap">
                <div class="gallery-label gallery-label-after">DEPOIS</div>
                ${p.photoAfter
                  ? `<img src="${p.photoAfter}" alt="Depois" class="gallery-photo" onclick="Clients._enlargePhoto('${p.photoAfter}')" />`
                  : `<div class="gallery-photo-empty"><span class="material-symbols-outlined">auto_awesome</span></div>`
                }
              </div>
            </div>
            ${'⭐'.repeat(p.rating || 5)}
            ${p.notes ? `<div style="font-size:0.78rem;color:var(--text-secondary);margin-top:6px;font-style:italic">"${p.notes}"</div>` : ''}
          </div>`).join('')}
        </div>

        <!-- Lightbox -->
        <div id="client-lightbox" class="modal-overlay hidden" onclick="this.classList.add('hidden')" style="z-index:9999">
          <img id="client-lightbox-img" src="" style="max-width:90vw;max-height:90vh;border-radius:12px;object-fit:contain" />
        </div>`;
    },

    _enlargePhoto(src) {
        const lb = document.getElementById('client-lightbox');
        const img = document.getElementById('client-lightbox-img');
        if (lb && img) { img.src = src; lb.classList.remove('hidden'); }
    },

    _tabAvaliacoesHTML(reviews, client) {
        if (!client.phone) {
            return `<div class="empty-state" style="padding:40px">
              <span class="material-symbols-outlined empty-state-icon">star_border</span>
              <p class="empty-state-title">Sem telefone cadastrado</p>
              <p class="empty-state-desc">Avaliações são vinculadas ao telefone da cliente.</p>
            </div>`;
        }
        if (!reviews.length) {
            return `<div class="empty-state" style="padding:40px">
              <span class="material-symbols-outlined empty-state-icon">rate_review</span>
              <p class="empty-state-title">Nenhuma avaliação ainda</p>
              <p class="empty-state-desc">Envie o link NPS após o atendimento pelo WhatsApp.</p>
              ${client.phone ? `<a class="btn btn-wa btn-sm" href="${WA.reviewLink(client.name, client.phone)}" target="_blank">📲 Enviar link de avaliação</a>` : ''}
            </div>`;
        }
        const avg = reviews.reduce((s,r) => s + (r.rating || 0), 0) / reviews.length;
        const stars = n => '⭐'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
        return `
        <div style="display:flex;flex-direction:column;gap:12px">
          <div class="history-stats" style="margin-bottom:4px">
            <div class="history-stat">
              <div class="history-stat-value">${avg.toFixed(1)}</div>
              <div class="history-stat-label">Nota Média</div>
            </div>
            <div class="history-stat">
              <div class="history-stat-value">${reviews.length}</div>
              <div class="history-stat-label">Avaliações</div>
            </div>
          </div>
          ${reviews.map(r => {
            const dt = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt || 0);
            const dateStr = isNaN(dt) ? '' : dt.toLocaleDateString('pt-BR');
            return `
            <div class="card" style="padding:0">
              <div class="card-body" style="padding:14px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                  <span style="font-size:1.1rem">${stars(r.rating || 0)}</span>
                  <span style="font-size:0.75rem;color:var(--text-muted)">${dateStr}</span>
                </div>
                ${r.comment ? `<p style="font-size:0.85rem;color:var(--text-secondary);font-style:italic">"${r.comment}"</p>` : ''}
              </div>
            </div>`;
          }).join('')}
          <div style="margin-top:4px">
            <a class="btn btn-wa btn-sm" href="${WA.reviewLink(client.name, client.phone)}" target="_blank">📲 Pedir nova avaliação</a>
          </div>
        </div>`;
    },

    // ===== MODAL CADASTRO/EDIÇÃO =====
    async openModal(id = null) {
        Clients.editingId = id;
        document.getElementById('client-modal-title').textContent = id ? 'Editar Cliente' : 'Nova Cliente';
        const form = document.getElementById('client-form');
        form.reset();

        if (id) {
            const c = await Store.getClient(id);
            if (c) {
                document.getElementById('client-name').value = c.name || '';
                document.getElementById('client-phone').value = c.phone || '';
                document.getElementById('client-email').value = c.email || '';
                document.getElementById('client-birthday').value = c.birthday || '';
                document.getElementById('client-procedure').value = c.procedure || '';
                document.getElementById('client-status').value = c.status || 'active';
                document.getElementById('client-notes').value = c.notes || '';
            }
        }
        document.getElementById('client-modal').classList.remove('hidden');
    },

    closeModal(event) {
        if (event && event.target !== document.getElementById('client-modal')) return;
        document.getElementById('client-modal')?.classList.add('hidden');
        Clients.editingId = null;
    },

    async handleSave(e) {
        e.preventDefault();
        const btn = document.getElementById('client-save-btn');
        btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
        const data = {
            name:      document.getElementById('client-name').value.trim(),
            phone:     document.getElementById('client-phone').value.trim(),
            email:     document.getElementById('client-email').value.trim(),
            birthday:  document.getElementById('client-birthday').value,
            procedure: document.getElementById('client-procedure').value,
            status:    document.getElementById('client-status').value,
            notes:     document.getElementById('client-notes').value.trim()
        };
        try {
            if (Clients.editingId) await Store.updateClient(Clients.editingId, data);
            else await Store.addClient(data);
            document.getElementById('client-modal').classList.add('hidden');
            App.showToast('Cliente salva com sucesso!', 'success');
            await Clients.loadClients();
        } catch (err) {
            App.showToast('Erro ao salvar: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined">save</span> Salvar';
        }
    },

    async deleteClient(id, name) {
        if (!confirm(`Excluir a cliente "${name}"?`)) return;
        try {
            await Store.deleteClient(id);
            App.showToast('Cliente removida.', 'success');
            await Clients.loadClients();
        } catch (err) {
            App.showToast('Erro ao excluir.', 'error');
        }
    },

    exportExcel() {
        const data = Clients.currentClients.map(c => ({
            'Nome': c.name || '',
            'Telefone': c.phone || '',
            'Email': c.email || '',
            'Procedimento': c.procedure || '',
            'Data Nascimento': c.birthday || '',
            'Status': c.status === 'active' ? 'Ativa' : 'Inativa',
            'Observações': c.notes || ''
        }));
        ExcelExport.fromData(data, `clientes_${new Date().toISOString().slice(0,10)}`, 'Clientes');
    }
};
