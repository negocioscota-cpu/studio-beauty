// === CLIENTES ===
const Clients = {
    currentClients: [],
    editingId: null,
    activeTagFilter: null,
    _selectedTags: [],
    activeTab: 'clientes',

    // === Paginação ===
    _pageSize: 50,
    _lastDoc: null,
    _hasMore: false,
    _isSearching: false,
    _searchTimer: null,

    // Tags pré-definidas
    TAGS: ['VIP', 'Nova', 'Recorrente', 'Fiel', 'Pós-operatório', 'Retorno pendente', 'Indicação'],
    TAG_COLORS: {
        'VIP': '#a855f7', 'Nova': '#22c55e', 'Recorrente': '#3b82f6',
        'Fiel': '#f59e0b', 'Pós-operatório': '#ef4444', 'Retorno pendente': '#f97316', 'Indicação': '#ec4899'
    },

    // Mapa de origens
    SOURCE_MAP: {
        'instagram': '📸 Instagram', 'facebook': '👤 Facebook', 'tiktok': '🎵 TikTok',
        'google': '🔍 Google', 'indicacao': '🤝 Indicação', 'panfleto': '📄 Panfleto',
        'passando': '🚶 Passando na frente', 'whatsapp': '💬 WhatsApp',
        'celular': '📱 Contato Celular', 'outro': '📌 Outro'
    },

    async render(container) {
        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Abas Clientes / Retenção -->
          <div style="display:flex;border-radius:10px;border:1px solid var(--border);overflow:hidden;margin-bottom:8px">
            <button id="tab-clientes" onclick="Clients.switchMainTab('clientes')" style="flex:1;padding:10px 20px;font-size:0.85rem;font-weight:700;border:none;cursor:pointer;transition:all 0.2s;background:var(--primary);color:#fff">👥 Clientes</button>
            <button id="tab-retencao" onclick="Clients.switchMainTab('retencao')" style="flex:1;padding:10px 20px;font-size:0.85rem;font-weight:700;border:none;cursor:pointer;transition:all 0.2s;background:var(--bg-secondary);color:var(--text-primary);border-left:1px solid var(--border)">📈 Retenção</button>
          </div>
          <div id="clients-tab-content">
          <!-- Toolbar -->
          <div class="toolbar">
            <div class="search-wrapper">
              <span class="material-symbols-outlined search-icon">search</span>
              <input class="search-input" id="clients-search" placeholder="Buscar clientes..." oninput="clearTimeout(Clients._searchTimer); Clients._searchTimer = setTimeout(() => Clients.filterClients(), 300)" />
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              <button class="btn btn-ghost btn-sm" onclick="Clients.importFromPhone()" title="Importar contatos do celular">
                <span class="material-symbols-outlined" style="font-size:18px">contacts</span> Importar
              </button>
              <button class="btn-export-excel" onclick="Clients.exportExcel()">
                <span class="material-symbols-outlined" style="font-size:18px">download</span> Exportar
              </button>
              <button class="btn btn-primary" id="btn-new-client" onclick="Clients.openModal()">
                <span class="material-symbols-outlined">person_add</span> Nova Cliente
              </button>
            </div>
          </div>

          <!-- Tags Filter Bar -->
          <div id="tags-filter-bar" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"></div>

          <!-- Table -->
          <div class="card">
            <div class="table-wrapper">
              <table>
                <thead><tr>
                  <th>Nome</th><th>Telefone</th><th>Origem</th><th>Tags</th><th>Status</th><th>Ações</th>
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
                  <input class="form-control" id="client-phone" placeholder="(00) 00000-0000" oninput="Clients._maskPhone(this)" maxlength="16" />
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
                <div class="form-group">
                  <label class="form-label">Como conheceu o studio</label>
                  <select class="form-control" id="client-source">
                    <option value="">-- Selecione --</option>
                    <option value="instagram">📸 Instagram</option>
                    <option value="facebook">👤 Facebook</option>
                    <option value="tiktok">🎵 TikTok</option>
                    <option value="google">🔍 Google</option>
                    <option value="indicacao">🤝 Indicação</option>
                    <option value="panfleto">📄 Panfleto</option>
                    <option value="passando">🚶 Passando na frente</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="outro">📌 Outro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Tags / Etiquetas</label>
                  <div id="client-tags-selector" style="display:flex;flex-wrap:wrap;gap:6px"></div>
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">Observações / Alergias</label>
                  <textarea class="form-control" id="client-notes" rows="3" placeholder="Alergias, preferências, observações..."></textarea>
                </div>

                <!-- Seção Dados Fiscais -->
                <div class="form-group form-group-full" style="margin-top: 12px; border-top: 1px solid var(--border); padding-top: 16px;">
                  <h4 style="font-size:0.9rem;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:6px;margin:0">🧾 Dados Fiscais (NFS-e)</h4>
                </div>
                <div class="form-group">
                  <label class="form-label">CPF ou CNPJ</label>
                  <input class="form-control" id="client-cpf-cnpj" placeholder="000.000.000-00" oninput="Clients._maskCpfCnpj(this)" />
                </div>
                <div class="form-group">
                  <label class="form-label">CEP</label>
                  <div style="display:flex;gap:8px">
                    <input class="form-control" id="client-cep" placeholder="00000-000" maxlength="9" oninput="Clients._maskCep(this)" style="flex:1" />
                    <button type="button" class="btn btn-ghost btn-sm" onclick="Clients.searchCep()" id="btn-search-cep" style="padding:0 12px;font-size:0.8rem">Buscar</button>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Logradouro (Rua/Avenida)</label>
                  <input class="form-control" id="client-street" placeholder="Rua..." />
                </div>
                <div class="form-group">
                  <label class="form-label">Número</label>
                  <input class="form-control" id="client-number" placeholder="Ex: 123" />
                </div>
                <div class="form-group">
                  <label class="form-label">Complemento</label>
                  <input class="form-control" id="client-complement" placeholder="Ex: Bloco B Apto 23" />
                </div>
                <div class="form-group">
                  <label class="form-label">Bairro</label>
                  <input class="form-control" id="client-neighborhood" placeholder="Bairro" />
                </div>
                <div class="form-group">
                  <label class="form-label">Cidade</label>
                  <input class="form-control" id="client-city" placeholder="Cidade" />
                </div>
                <div class="form-group">
                  <label class="form-label">Estado (UF)</label>
                  <input class="form-control" id="client-uf" placeholder="Ex: SP" maxlength="2" style="text-transform:uppercase" />
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
        </div>
          </div><!-- /clients-tab-content -->
          <div id="retention-tab-content" style="display:none"></div>
        </div>`;

        await Clients.loadClients();
        Clients._renderTagFilterBar();
    },

    async switchMainTab(tab) {
        Clients.activeTab = tab;
        document.getElementById('tab-clientes').style.background = tab === 'clientes' ? 'var(--primary)' : 'var(--bg-secondary)';
        document.getElementById('tab-clientes').style.color = tab === 'clientes' ? '#fff' : 'var(--text-primary)';
        document.getElementById('tab-retencao').style.background = tab === 'retencao' ? 'var(--primary)' : 'var(--bg-secondary)';
        document.getElementById('tab-retencao').style.color = tab === 'retencao' ? '#fff' : 'var(--text-primary)';
        
        const clientsContent = document.getElementById('clients-tab-content');
        const retentionContent = document.getElementById('retention-tab-content');
        
        if (tab === 'clientes') {
            clientsContent.style.display = '';
            retentionContent.style.display = 'none';
        } else {
            clientsContent.style.display = 'none';
            retentionContent.style.display = '';
            retentionContent.innerHTML = '<div style="text-align:center;padding:48px"><div class="spinner"></div></div>';
            await Retention.render(retentionContent);
        }
    },

    async loadClients() {
        Clients._lastDoc = null;
        Clients._hasMore = false;
        Clients._isSearching = false;
        const result = await Store.getClientsPaginated(Clients._pageSize);
        Clients.currentClients = result.clients;
        Clients._lastDoc = result.lastVisible;
        Clients._hasMore = result.hasMore;
        Clients.renderTable(Clients.currentClients);
        Clients._renderLoadMoreBtn();
    },

    async loadMore() {
        if (!Clients._hasMore || Clients._isSearching) return;
        const btn = document.getElementById('clients-load-more');
        if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:16px;height:16px"></div> Carregando...'; }
        try {
            const result = await Store.getClientsPaginated(Clients._pageSize, Clients._lastDoc);
            Clients.currentClients = [...Clients.currentClients, ...result.clients];
            Clients._lastDoc = result.lastVisible;
            Clients._hasMore = result.hasMore;
            Clients.renderTable(Clients.currentClients);
            Clients._renderLoadMoreBtn();
        } catch (err) {
            App.showToast('Erro ao carregar mais clientes: ' + err.message, 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px">expand_more</span> Carregar mais'; }
        }
    },

    _renderLoadMoreBtn() {
        let container = document.getElementById('clients-pagination');
        if (!container) {
            container = document.createElement('div');
            container.id = 'clients-pagination';
            container.style.cssText = 'display:flex;justify-content:center;padding:16px;gap:12px;align-items:center';
            const card = document.querySelector('#clients-tab-content .card');
            if (card) card.parentElement.appendChild(container);
        }
        const total = Clients.currentClients.length;
        if (Clients._hasMore && !Clients._isSearching) {
            container.innerHTML = `
              <span style="font-size:0.82rem;color:var(--text-muted)">${total} clientes carregados</span>
              <button id="clients-load-more" class="btn btn-primary btn-sm" onclick="Clients.loadMore()" style="gap:6px">
                <span class="material-symbols-outlined" style="font-size:16px">expand_more</span> Carregar mais ${Clients._pageSize}
              </button>`;
        } else if (total > 0) {
            container.innerHTML = `<span style="font-size:0.82rem;color:var(--text-muted)">✅ ${total} cliente${total !== 1 ? 's' : ''} carregado${total !== 1 ? 's' : ''}</span>`;
        } else {
            container.innerHTML = '';
        }
    },

    // === TAG FILTER BAR ===
    _renderTagFilterBar() {
        const bar = document.getElementById('tags-filter-bar');
        if (!bar) return;
        const allTags = new Set();
        Clients.currentClients.forEach(c => (c.tags || []).forEach(t => allTags.add(t)));
        Clients.TAGS.forEach(t => allTags.add(t));

        bar.innerHTML = `
          <span style="font-size:0.78rem;color:var(--text-muted);font-weight:600">🏷️ Filtrar:</span>
          <button onclick="Clients.filterByTag(null)"
            style="font-size:0.72rem;padding:4px 12px;border-radius:20px;border:1px solid var(--border);background:${!Clients.activeTagFilter ? 'var(--primary)' : 'var(--bg-secondary)'};color:${!Clients.activeTagFilter ? '#fff' : 'var(--text-primary)'};cursor:pointer;transition:all 0.2s;font-weight:600">Todas</button>
          ${[...allTags].map(tag => {
            const color = Clients.TAG_COLORS[tag] || '#6b7280';
            const isActive = Clients.activeTagFilter === tag;
            return `<button onclick="Clients.filterByTag('${tag}')"
              style="font-size:0.72rem;padding:4px 12px;border-radius:20px;border:1px solid ${color}40;background:${isActive ? color : color+'15'};color:${isActive ? '#fff' : color};cursor:pointer;transition:all 0.2s;font-weight:600">${tag}</button>`;
          }).join('')}
        `;
    },

    filterByTag(tag) {
        Clients.activeTagFilter = tag;
        Clients._renderTagFilterBar();
        Clients.filterClients();
    },

    renderTable(list) {
        let clients = list;
        if (Clients.activeTagFilter) {
            clients = clients.filter(c => (c.tags || []).includes(Clients.activeTagFilter));
        }
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
        tbody.innerHTML = clients.map(c => {
          const srcLabel = Clients.SOURCE_MAP[c.source] || (c.source ? '📌 ' + c.source : '—');
          const tagsHTML = (c.tags || []).map(t => {
            const col = Clients.TAG_COLORS[t] || '#6b7280';
            return `<span style="font-size:0.65rem;padding:2px 8px;border-radius:12px;background:${col}18;color:${col};font-weight:600;white-space:nowrap">${t}</span>`;
          }).join(' ');
          return `
          <tr>
            <td><strong>${c.name}</strong></td>
            <td>${c.phone || '-'}</td>
            <td style="font-size:0.82rem">${srcLabel}</td>
            <td><div style="display:flex;gap:4px;flex-wrap:wrap">${tagsHTML || '<span style="color:var(--text-muted);font-size:0.78rem">—</span>'}</div></td>
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
          </tr>`;
        }).join('');
    },

    async filterClients() {
        const q = document.getElementById('clients-search')?.value?.trim() || '';
        if (q.length >= 2) {
            // Busca: carrega todos e filtra client-side
            Clients._isSearching = true;
            try {
                const all = await Store.searchClients(q);
                Clients.renderTable(all);
                Clients._renderLoadMoreBtn();
            } catch (err) {
                App.showToast('Erro na busca: ' + err.message, 'error');
            }
        } else if (q.length === 0 && Clients._isSearching) {
            // Limpou busca: volta para paginação normal
            Clients._isSearching = false;
            await Clients.loadClients();
        } else {
            // Filtra no que já está carregado (digitou só 1 char)
            const filtered = Clients.currentClients.filter(c =>
                c.name?.toLowerCase().includes(q.toLowerCase()) ||
                c.phone?.includes(q) ||
                c.email?.toLowerCase().includes(q.toLowerCase())
            );
            Clients.renderTable(filtered);
        }
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

        document.getElementById('client-drawer-overlay').classList.remove('hidden');
        document.getElementById('client-drawer').classList.remove('hidden');
        requestAnimationFrame(() => {
            document.getElementById('client-drawer').classList.add('open');
        });

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
        const srcLabel = Clients.SOURCE_MAP[c.source] || (c.source || '—');

        const tagsHTML = (c.tags || []).length > 0 ? `
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
          ${(c.tags || []).map(t => {
            const col = Clients.TAG_COLORS[t] || '#6b7280';
            return `<span style="font-size:0.72rem;padding:3px 10px;border-radius:14px;background:${col}18;color:${col};font-weight:600">${t}</span>`;
          }).join('')}
        </div>` : '';

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
              ${tagsHTML}
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
            <div class="drawer-info-item">
              <span class="material-symbols-outlined drawer-info-icon">campaign</span>
              <div><div class="drawer-info-label">Como conheceu</div><div class="drawer-info-value">${srcLabel}</div></div>
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
            ${c.phone ? `<a class="btn btn-wa btn-sm" href="https://wa.me/55${c.phone.replace(/\\D/g,'')}" target="_blank">
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

            let fichaDetails = '';
            if (isFicha) {
                let rows = '';
                if (item.fichaKind === 'manicure') {
                    if (item.nailCondition) rows += `<div class="timeline-detail-row"><span>Estado</span><strong>${item.nailCondition}</strong></div>`;
                    if (item.nailShape) rows += `<div class="timeline-detail-row"><span>Formato</span><strong>${item.nailShape}</strong></div>`;
                    if (item.nailCuticle) rows += `<div class="timeline-detail-row"><span>Cutícula</span><strong>${item.nailCuticle}</strong></div>`;
                    if (item.nailType) rows += `<div class="timeline-detail-row"><span>Técnica</span><strong>${item.nailType}</strong></div>`;
                    if (item.nailObs) rows += `<div class="timeline-detail-row" style="grid-column:1/-1"><span>Obs. Unhas</span><strong>${item.nailObs}</strong></div>`;
                } else if (item.fichaKind === 'sobrancelhas') {
                    if (item.browDensity) rows += `<div class="timeline-detail-row"><span>Densidade</span><strong>${item.browDensity}</strong></div>`;
                    if (item.browShape) rows += `<div class="timeline-detail-row"><span>Formato</span><strong>${item.browShape}</strong></div>`;
                    if (item.browColor) rows += `<div class="timeline-detail-row"><span>Cor</span><strong>${item.browColor}</strong></div>`;
                    if (item.browObs) rows += `<div class="timeline-detail-row" style="grid-column:1/-1"><span>Obs. Sobrancelhas</span><strong>${item.browObs}</strong></div>`;
                } else if (item.fichaKind === 'labios') {
                    if (item.lipColor) rows += `<div class="timeline-detail-row"><span>Cor</span><strong>${item.lipColor}</strong></div>`;
                    if (item.lipShape) rows += `<div class="timeline-detail-row"><span>Formato</span><strong>${item.lipShape}</strong></div>`;
                    if (item.lipTexture) rows += `<div class="timeline-detail-row"><span>Textura</span><strong>${item.lipTexture}</strong></div>`;
                    if (item.lipObs) rows += `<div class="timeline-detail-row" style="grid-column:1/-1"><span>Obs. Lábios</span><strong>${item.lipObs}</strong></div>`;
                } else if (item.fichaKind === 'facial') {
                    if (item.faceSkin) rows += `<div class="timeline-detail-row"><span>Pele</span><strong>${item.faceSkin}</strong></div>`;
                    if (item.faceHydration) rows += `<div class="timeline-detail-row"><span>Hidratação</span><strong>${item.faceHydration}</strong></div>`;
                    if (item.faceTexture) rows += `<div class="timeline-detail-row"><span>Textura</span><strong>${item.faceTexture}</strong></div>`;
                    if (item.faceObs) rows += `<div class="timeline-detail-row" style="grid-column:1/-1"><span>Obs. Pele</span><strong>${item.faceObs}</strong></div>`;
                } else {
                    if (item.natDesc) rows += `<div class="timeline-detail-row"><span>Cílios</span><strong>${item.natDesc}</strong></div>`;
                    if (item.natSize) rows += `<div class="timeline-detail-row"><span>Tamanho</span><strong>${item.natSize}</strong></div>`;
                    if (item.natObs) rows += `<div class="timeline-detail-row" style="grid-column:1/-1"><span>Obs. Cílios</span><strong>${item.natObs}</strong></div>`;
                }
                
                if (item.mapeamento) rows += `<div class="timeline-detail-row" style="grid-column:1/-1"><span>Mapeamento</span><strong>${item.mapeamento}</strong></div>`;
                if (item.products) rows += `<div class="timeline-detail-row" style="grid-column:1/-1"><span>Produtos</span><strong>${item.products}</strong></div>`;
                if (item.duration) rows += `<div class="timeline-detail-row"><span>Duração</span><strong>${item.duration}</strong></div>`;
                
                const urls = item.nailMediaUrls || item.faceMediaUrls || item.lipMediaUrls || item.browMediaUrls || item.natMediaUrls || [];
                let mediaHtml = '';
                if (urls.length) {
                    mediaHtml = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;grid-column:1/-1">
                      ${urls.map(u=>`<a href="${u}" target="_blank" style="display:block;border-radius:4px;overflow:hidden;border:1px solid var(--border)">
                        ${u.match(/\.(mp4|mov|webm)/i) ? `<video src="${u}" style="width:40px;height:40px;object-fit:cover"></video>` : `<img src="${u}" style="width:40px;height:40px;object-fit:cover" />`}
                      </a>`).join('')}
                    </div>`;
                }

                fichaDetails = `
                  <div id="${detailId}" class="timeline-detail hidden" style="background:var(--surface);padding:10px;border-radius:8px;border:1px solid var(--border);margin-top:8px">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:0.78rem">
                      ${rows}
                    </div>
                    ${mediaHtml}
                  </div>`;
            }

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

    // ===== TAG SELECTOR (no modal) =====
    _renderTagSelector(selected = []) {
        Clients._selectedTags = [...selected];
        const container = document.getElementById('client-tags-selector');
        if (!container) return;
        container.innerHTML = Clients.TAGS.map(tag => {
            const col = Clients.TAG_COLORS[tag] || '#6b7280';
            const isSelected = Clients._selectedTags.includes(tag);
            return `<button type="button" onclick="Clients._toggleTag('${tag}')"
              style="font-size:0.72rem;padding:4px 12px;border-radius:16px;border:1.5px solid ${col};background:${isSelected ? col : 'transparent'};color:${isSelected ? '#fff' : col};cursor:pointer;transition:all 0.2s;font-weight:600">${isSelected ? '✓ ' : ''}${tag}</button>`;
        }).join('');
    },

    _toggleTag(tag) {
        const idx = Clients._selectedTags.indexOf(tag);
        if (idx >= 0) Clients._selectedTags.splice(idx, 1);
        else Clients._selectedTags.push(tag);
        Clients._renderTagSelector(Clients._selectedTags);
    },

    // ===== MODAL CADASTRO/EDIÇÃO =====
    async openModal(id = null) {
        Clients.editingId = id;
        document.getElementById('client-modal-title').textContent = id ? 'Editar Cliente' : 'Nova Cliente';
        const form = document.getElementById('client-form');
        form.reset();

        let selectedTags = [];
        if (id) {
            const c = await Store.getClient(id);
            if (c) {
                document.getElementById('client-name').value = c.name || '';
                const phoneInput = document.getElementById('client-phone');
                phoneInput.value = c.phone || '';
                Clients._maskPhone(phoneInput);
                document.getElementById('client-email').value = c.email || '';
                document.getElementById('client-birthday').value = c.birthday || '';
                document.getElementById('client-procedure').value = c.procedure || '';
                document.getElementById('client-status').value = c.status || 'active';
                document.getElementById('client-notes').value = c.notes || '';
                document.getElementById('client-source').value = c.source || '';
                selectedTags = c.tags || [];

                const fd = c.fiscalData || {};
                const addr = fd.address || {};
                document.getElementById('client-cpf-cnpj').value = fd.cpfCnpj || '';
                document.getElementById('client-cep').value = addr.zipCode || '';
                document.getElementById('client-street').value = addr.street || '';
                document.getElementById('client-number').value = addr.number || '';
                document.getElementById('client-complement').value = addr.complement || '';
                document.getElementById('client-neighborhood').value = addr.neighborhood || '';
                document.getElementById('client-city').value = addr.city || '';
                document.getElementById('client-uf').value = addr.state || '';
            }
        } else {
            document.getElementById('client-cpf-cnpj').value = '';
            document.getElementById('client-cep').value = '';
            document.getElementById('client-street').value = '';
            document.getElementById('client-number').value = '';
            document.getElementById('client-complement').value = '';
            document.getElementById('client-neighborhood').value = '';
            document.getElementById('client-city').value = '';
            document.getElementById('client-uf').value = '';
        }
        Clients._renderTagSelector(selectedTags);
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
            notes:     document.getElementById('client-notes').value.trim(),
            source:    document.getElementById('client-source').value,
            tags:      Clients._selectedTags,
            fiscalData: {
                cpfCnpj: document.getElementById('client-cpf-cnpj').value.trim(),
                address: {
                    zipCode:      document.getElementById('client-cep').value.trim(),
                    street:       document.getElementById('client-street').value.trim(),
                    number:       document.getElementById('client-number').value.trim(),
                    complement:   document.getElementById('client-complement').value.trim(),
                    neighborhood: document.getElementById('client-neighborhood').value.trim(),
                    city:         document.getElementById('client-city').value.trim(),
                    state:        document.getElementById('client-uf').value.trim().toUpperCase()
                }
            }
        };
        try {
            if (Clients.editingId) await Store.updateClient(Clients.editingId, data);
            else await Store.addClient(data);
            document.getElementById('client-modal').classList.add('hidden');
            App.showToast('Cliente salva com sucesso!', 'success');
            await Clients.loadClients();
            Clients._renderTagFilterBar();
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
            Clients._renderTagFilterBar();
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
            'Origem': Clients.SOURCE_MAP[c.source] || c.source || '',
            'Tags': (c.tags || []).join(', '),
            'Observações': c.notes || ''
        }));
        ExcelExport.fromData(data, `clientes_${new Date().toISOString().slice(0,10)}`, 'Clientes');
    },

    // ===== IMPORTAÇÃO DE CONTATOS DO CELULAR =====
    async importFromPhone() {
        if (!('contacts' in navigator && 'ContactsManager' in window)) {
            App.showToast('📱 A importação de contatos só funciona no celular (Chrome Android). Abra o sistema no celular para usar essa função.', 'info');
            return;
        }
        try {
            const props = ['name', 'tel', 'email'];
            const opts = { multiple: true };
            const contacts = await navigator.contacts.select(props, opts);
            if (!contacts || contacts.length === 0) {
                App.showToast('Nenhum contato selecionado.', 'info');
                return;
            }

            let imported = 0;
            let skipped = 0;
            for (const contact of contacts) {
                const name = contact.name?.[0] || '';
                const phone = contact.tel?.[0] || '';
                const email = contact.email?.[0] || '';
                if (!name) { skipped++; continue; }

                const exists = Clients.currentClients.find(c =>
                    c.name?.toLowerCase() === name.toLowerCase() ||
                    (phone && c.phone?.replace(/\D/g, '') === phone.replace(/\D/g, ''))
                );
                if (exists) { skipped++; continue; }

                await Store.addClient({
                    name, phone, email,
                    status: 'active',
                    source: 'celular',
                    tags: ['Nova']
                });
                imported++;
            }

            App.showToast(`✅ ${imported} contato${imported !== 1 ? 's' : ''} importado${imported !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} já existiam)` : ''}`, 'success');
            await Clients.loadClients();
            Clients._renderTagFilterBar();
        } catch (err) {
            if (err.name === 'AbortError') return;
            App.showToast('Erro na importação: ' + err.message, 'error');
        }
    },

    _maskPhone(el) {
        let v = el.value.replace(/\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        if (v.length > 7) {
            el.value = `(${v.substring(0,2)}) ${v.substring(2,7)}-${v.substring(7)}`;
        } else if (v.length > 2) {
            el.value = `(${v.substring(0,2)}) ${v.substring(2)}`;
        } else if (v.length > 0) {
            el.value = `(${v}`;
        }
    },

    async searchCep() {
        const cepEl = document.getElementById('client-cep');
        const btn = document.getElementById('btn-search-cep');
        if (!cepEl) return;
        const cep = cepEl.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            App.showToast('CEP inválido! Digite 8 números.', 'error');
            return;
        }
        if (btn) { btn.disabled = true; btn.innerHTML = '...'; }
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (data.erro) {
                App.showToast('CEP não encontrado.', 'error');
            } else {
                document.getElementById('client-street').value = data.logradouro || '';
                document.getElementById('client-neighborhood').value = data.bairro || '';
                document.getElementById('client-city').value = data.localidade || '';
                document.getElementById('client-uf').value = data.uf || '';
                document.getElementById('client-number')?.focus();
                App.showToast('Endereço preenchido! 📍', 'success');
            }
        } catch (err) {
            App.showToast('Erro ao buscar CEP: ' + err.message, 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = 'Buscar'; }
        }
    },

    _maskCpfCnpj(el) {
        let v = el.value.replace(/\D/g, '');
        if (v.length > 14) v = v.substring(0, 14);
        if (v.length > 11) {
            el.value = `${v.substring(0,2)}.${v.substring(2,5)}.${v.substring(5,8)}/${v.substring(8,12)}-${v.substring(12)}`;
        } else if (v.length > 9) {
            el.value = `${v.substring(0,3)}.${v.substring(3,6)}.${v.substring(6,9)}-${v.substring(9)}`;
        } else if (v.length > 6) {
            el.value = `${v.substring(0,3)}.${v.substring(3,6)}.${v.substring(6)}`;
        } else if (v.length > 3) {
            el.value = `${v.substring(0,3)}.${v.substring(3)}`;
        } else {
            el.value = v;
        }
    },

    _maskCep(el) {
        let v = el.value.replace(/\D/g, '');
        if (v.length > 8) v = v.substring(0, 8);
        if (v.length > 5) {
            el.value = `${v.substring(0,5)}-${v.substring(5)}`;
        } else {
            el.value = v;
        }
    }
};
