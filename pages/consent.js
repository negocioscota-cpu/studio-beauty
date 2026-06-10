// === TERMO DE CONSENTIMENTO DIGITAL ===
const Consent = {
    currentClients: [],
    signaturePad: null,
    isDrawing: false,
    editingId: null,

    async render(container) {
        Consent.currentClients = await Store.getClients();
        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Header -->
          <div class="card" style="background:linear-gradient(135deg,var(--primary) 0%,#8B5E6B 100%);color:white">
            <div class="card-body" style="display:flex;align-items:center;gap:16px">
              <div style="font-size:40px">📝</div>
              <div>
                <h3 style="font-weight:800;font-size:1.2rem;margin-bottom:4px">Termos de Consentimento</h3>
                <p style="opacity:0.9;font-size:0.85rem">Proteção jurídica com assinatura digital da cliente antes de cada procedimento.</p>
              </div>
            </div>
          </div>

          <div class="toolbar">
            <input class="form-control search-input" type="text" placeholder="🔍 Buscar por cliente..." id="consent-search" oninput="Consent.filterList()" />
            <button class="btn btn-primary" onclick="Consent.openModal()">
              <span class="material-symbols-outlined">add</span> Novo Termo
            </button>
          </div>

          <div id="consent-list"></div>
        </div>

        <!-- Modal -->
        <div id="consent-modal" class="modal-overlay hidden" onclick="Consent.closeModal(event)">
          <div class="modal-container" style="max-width:600px" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title" id="consent-modal-title">Novo Termo de Consentimento</h3>
              <button class="modal-close" onclick="Consent.closeModal()">✕</button>
            </div>
            <form id="consent-form" onsubmit="Consent.handleSave(event)" class="modal-body" style="max-height:70vh;overflow-y:auto">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Cliente *</label>
                  <select class="form-control" id="consent-client" required>
                    <option value="">-- Selecione --</option>
                    ${Consent.currentClients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Procedimento *</label>
                  <select class="form-control" id="consent-procedure" required>
                    <option value="">-- Selecione --</option>
                    <option>Extensão de Cílios — Volume Russo</option>
                    <option>Extensão de Cílios — Clássico</option>
                    <option>Lifting de Cílios</option>
                    <option>Manutenção de Extensão</option>
                    <option>Design de Sobrancelhas</option>
                    <option>Micropigmentação</option>
                    <option>Brow Lamination</option>
                    <option>Henna de Sobrancelhas</option>
                    <option>Remoção de Extensão</option>
                  </select>
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">Alergias / Sensibilidades Conhecidas</label>
                  <textarea class="form-control" id="consent-allergies" rows="2" placeholder="Ex: sensibilidade a adesivos, alergia a latex..."></textarea>
                </div>

                <!-- Checklist médico -->
                <div class="form-group form-group-full">
                  <label class="form-label" style="margin-bottom:10px">Checklist de Saúde</label>
                  <div style="display:flex;flex-direction:column;gap:8px">
                    <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;cursor:pointer">
                      <input type="checkbox" id="consent-pregnancy"> Está grávida ou amamentando?
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;cursor:pointer">
                      <input type="checkbox" id="consent-medication"> Está usando algum medicamento?
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;cursor:pointer">
                      <input type="checkbox" id="consent-patch-test"> Patch test realizado?
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;cursor:pointer">
                      <input type="checkbox" id="consent-eye-surgery"> Cirurgia ocular recente?
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;cursor:pointer">
                      <input type="checkbox" id="consent-skin-condition"> Condição dermatológica ativa?
                    </label>
                  </div>
                </div>

                <div class="form-group form-group-full">
                  <label class="form-label">Medicamentos em uso</label>
                  <input class="form-control" id="consent-medications" placeholder="Nome dos medicamentos, se houver" />
                </div>

                <div class="form-group form-group-full">
                  <label class="form-label">Observações adicionais</label>
                  <textarea class="form-control" id="consent-notes" rows="2" placeholder="Informações extras relevantes"></textarea>
                </div>

                <!-- Assinatura Digital -->
                <div class="form-group form-group-full">
                  <label class="form-label">Assinatura da Cliente <small style="color:var(--text-muted);font-weight:400">(opcional — pode enviar via WhatsApp)</small></label>
                  <div style="position:relative;border:2px solid var(--border);border-radius:var(--radius-sm);background:#fff;overflow:hidden">
                    <canvas id="consent-signature-pad" width="520" height="180" style="width:100%;cursor:crosshair;touch-action:none"></canvas>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="Consent.clearSignature()" style="position:absolute;top:6px;right:6px;font-size:0.75rem">
                      <span class="material-symbols-outlined" style="font-size:16px">restart_alt</span> Limpar
                    </button>
                  </div>
                  <p style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">Assine aqui ou salve sem assinatura e envie o link via WhatsApp para a cliente assinar remotamente.</p>
                </div>

                <!-- Consentimento -->
                <div class="form-group form-group-full">
                  <label style="display:flex;align-items:flex-start;gap:8px;font-size:0.82rem;cursor:pointer;background:var(--primary-xlight);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--primary-light)">
                    <input type="checkbox" id="consent-agree" style="margin-top:2px">
                    <span>Declaro que a cliente foi informada sobre o procedimento, possíveis riscos e cuidados pós-procedimento.</span>
                  </label>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-ghost" onclick="Consent.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  <span class="material-symbols-outlined">save</span> Salvar Termo
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal Visualizar -->
        <div id="consent-view-modal" class="modal-overlay hidden" onclick="Consent.closeViewModal(event)">
          <div class="modal-container" style="max-width:600px" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Termo de Consentimento</h3>
              <button class="modal-close" onclick="Consent.closeViewModal()">✕</button>
            </div>
            <div id="consent-view-body" class="modal-body" style="max-height:70vh;overflow-y:auto"></div>
          </div>
        </div>`;

        await Consent.loadList();
    },

    async loadList() {
        const list = document.getElementById('consent-list');
        list.innerHTML = '<div style="text-align:center;padding:32px"><div class="spinner"></div></div>';
        const items = await Store.getConsents();
        Consent._allItems = items;
        Consent.renderList(items);
    },

    renderList(items) {
        const list = document.getElementById('consent-list');
        if (!items.length) {
            list.innerHTML = `<div class="empty-state">
                <span class="material-symbols-outlined empty-state-icon">description</span>
                <p class="empty-state-title">Nenhum termo registrado</p>
                <p class="empty-state-desc">Crie termos de consentimento antes dos procedimentos</p>
                <button class="btn btn-primary" onclick="Consent.openModal()">Criar Primeiro Termo</button>
            </div>`;
            return;
        }

        list.innerHTML = `<div class="table-wrapper"><table>
            <thead><tr>
                <th>Cliente</th><th>Procedimento</th><th>Data</th><th>Status</th><th>Ações</th>
            </tr></thead>
            <tbody>${items.map(item => {
                const client = Consent.currentClients.find(c => c.id === item.clientId);
                let statusBadge;
                if (item.signature && item.signedRemotely) {
                    statusBadge = '<span class="badge badge-green">📲 Assinado remotamente</span>';
                } else if (item.signature) {
                    statusBadge = '<span class="badge badge-green">✅ Assinado</span>';
                } else {
                    statusBadge = '<span class="badge badge-brown">🟡 Pendente</span>';
                }
                const whatsBtn = !item.signature ? `<button class="btn btn-ghost btn-sm" onclick="Consent.sendWhatsApp('${item.id}')" title="Enviar via WhatsApp" style="color:#25D366"><span class="material-symbols-outlined">share</span></button>` : '';
                return `<tr>
                    <td style="font-weight:600">${client?.name || 'Cliente removida'}</td>
                    <td>${item.procedure || '-'}</td>
                    <td>${App.formatDate(item.date || item.createdAt)}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div style="display:flex;gap:4px">
                            ${whatsBtn}
                            <button class="btn btn-ghost btn-sm" onclick="Consent.viewTerm('${item.id}')" title="Visualizar">
                                <span class="material-symbols-outlined">visibility</span>
                            </button>
                            <button class="btn btn-ghost btn-sm" onclick="Consent.delete('${item.id}')" style="color:var(--danger)" title="Excluir">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>`;
            }).join('')}</tbody>
        </table></div>`;
    },

    filterList() {
        const q = document.getElementById('consent-search').value.toLowerCase();
        if (!Consent._allItems) return;
        const filtered = Consent._allItems.filter(item => {
            const client = Consent.currentClients.find(c => c.id === item.clientId);
            return (client?.name || '').toLowerCase().includes(q) || (item.procedure || '').toLowerCase().includes(q);
        });
        Consent.renderList(filtered);
    },

    openModal() {
        Consent.editingId = null;
        document.getElementById('consent-form').reset();
        document.getElementById('consent-modal').classList.remove('hidden');
        setTimeout(() => Consent.initSignaturePad(), 100);
    },

    closeModal(event) {
        if (event && event.target !== document.getElementById('consent-modal')) return;
        document.getElementById('consent-modal')?.classList.add('hidden');
    },

    initSignaturePad() {
        const canvas = document.getElementById('consent-signature-pad');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Ajusta resolução do canvas
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        ctx.strokeStyle = '#1a0a10';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let drawing = false;
        let lastX = 0, lastY = 0;

        function getPos(e) {
            const r = canvas.getBoundingClientRect();
            const touch = e.touches ? e.touches[0] : e;
            return { x: touch.clientX - r.left, y: touch.clientY - r.top };
        }

        function start(e) {
            e.preventDefault();
            drawing = true;
            const p = getPos(e);
            lastX = p.x; lastY = p.y;
        }
        function move(e) {
            e.preventDefault();
            if (!drawing) return;
            const p = getPos(e);
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            lastX = p.x; lastY = p.y;
            Consent._hasSignature = true;
        }
        function stop() { drawing = false; }

        canvas.addEventListener('mousedown', start);
        canvas.addEventListener('mousemove', move);
        canvas.addEventListener('mouseup', stop);
        canvas.addEventListener('mouseleave', stop);
        canvas.addEventListener('touchstart', start, { passive: false });
        canvas.addEventListener('touchmove', move, { passive: false });
        canvas.addEventListener('touchend', stop);

        Consent._hasSignature = false;
    },

    clearSignature() {
        const canvas = document.getElementById('consent-signature-pad');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Consent._hasSignature = false;
    },

    getSignatureData() {
        const canvas = document.getElementById('consent-signature-pad');
        if (!canvas || !Consent._hasSignature) return null;
        return canvas.toDataURL('image/png', 0.5);
    },

    async handleSave(e) {
        e.preventDefault();
        const signature = Consent.getSignatureData();
        const clientId = document.getElementById('consent-client').value;
        const client = Consent.currentClients.find(c => c.id === clientId);

        const data = {
            clientId: clientId,
            clientName: client?.name || '',
            clientPhone: client?.phone || '',
            procedure: document.getElementById('consent-procedure').value,
            allergies: document.getElementById('consent-allergies').value,
            pregnancy: document.getElementById('consent-pregnancy').checked,
            medication: document.getElementById('consent-medication').checked,
            patchTest: document.getElementById('consent-patch-test').checked,
            eyeSurgery: document.getElementById('consent-eye-surgery').checked,
            skinCondition: document.getElementById('consent-skin-condition').checked,
            medications: document.getElementById('consent-medications').value,
            notes: document.getElementById('consent-notes').value,
            agreed: document.getElementById('consent-agree').checked,
            date: firebase.firestore.Timestamp.fromDate(new Date()),
            status: signature ? 'signed' : 'pending'
        };

        // Se tem assinatura presencial, salva direto
        if (signature) {
            data.signature = signature;
        } else {
            // Gera token para assinatura remota via WhatsApp
            data.signToken = crypto.randomUUID();
        }

        // Salva nome do studio para exibir na página pública
        try { data.studioName = App.currentUser?.displayName || ''; } catch(e) {}

        try {
            const newId = await Store.addConsent(data);
            document.getElementById('consent-modal').classList.add('hidden');
            if (signature) {
                App.showToast('Termo salvo com assinatura digital! ✅', 'success');
            } else {
                App.showToast('Termo salvo! Envie o link via WhatsApp para a cliente assinar. 📲', 'success');
                // Oferece enviar pelo WhatsApp automaticamente
                setTimeout(() => Consent.sendWhatsApp(newId), 500);
            }
            await Consent.loadList();
        } catch (err) {
            App.showToast('Erro: ' + err.message, 'error');
        }
    },

    async viewTerm(id) {
        const items = Consent._allItems || await Store.getConsents();
        const item = items.find(i => i.id === id);
        if (!item) return;
        const client = Consent.currentClients.find(c => c.id === item.clientId);

        const checkItem = (val, label) => `<div style="display:flex;align-items:center;gap:6px;font-size:0.85rem">
            <span style="color:${val ? 'var(--danger)' : 'var(--success)'}">${val ? '⚠️ Sim' : '✅ Não'}</span> ${label}
        </div>`;

        document.getElementById('consent-view-body').innerHTML = `
        <div style="display:flex;flex-direction:column;gap:16px">
            <div style="text-align:center;padding:16px;border-bottom:2px solid var(--border)">
                <div style="font-size:1.3rem;font-weight:800;color:var(--primary)">Termo de Consentimento</div>
                <div style="font-size:0.82rem;color:var(--text-muted)">Data: ${App.formatDate(item.date || item.createdAt)}</div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Cliente</div>
                    <div style="font-weight:700;font-size:1rem">${client?.name || '-'}</div>
                </div>
                <div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Procedimento</div>
                    <div style="font-weight:700;font-size:1rem">${item.procedure || '-'}</div>
                </div>
            </div>

            ${item.allergies ? `<div style="background:var(--warning-bg);border:1px solid #F5CCA0;padding:10px 14px;border-radius:var(--radius-sm)">
                <div style="font-size:0.75rem;font-weight:700;color:#7A5010;text-transform:uppercase;margin-bottom:4px">Alergias / Sensibilidades</div>
                <div style="font-size:0.85rem;color:#7A5010">${item.allergies}</div>
            </div>` : ''}

            <div style="display:flex;flex-direction:column;gap:6px;background:var(--bg);padding:12px;border-radius:var(--radius-sm)">
                <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px">Checklist de Saúde</div>
                ${checkItem(item.pregnancy, 'Gravidez / Amamentação')}
                ${checkItem(item.medication, 'Uso de medicamentos')}
                ${checkItem(!item.patchTest, 'Patch test NÃO realizado')}
                ${checkItem(item.eyeSurgery, 'Cirurgia ocular recente')}
                ${checkItem(item.skinCondition, 'Condição dermatológica ativa')}
            </div>

            ${item.medications ? `<div><div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Medicamentos</div>
                <div style="font-size:0.85rem">${item.medications}</div></div>` : ''}

            ${item.notes ? `<div><div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Observações</div>
                <div style="font-size:0.85rem">${item.notes}</div></div>` : ''}

            <div style="border-top:2px solid var(--border);padding-top:16px;text-align:center">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Assinatura da Cliente</div>
                ${item.signature ? `<img src="${item.signature}" style="max-width:300px;border:1px solid var(--border);border-radius:var(--radius-sm);background:#fff" />` : '<span style="color:var(--warning);font-size:0.85rem">🟡 Aguardando assinatura remota</span>'}
                ${item.signedRemotely ? `<div style="font-size:0.78rem;color:var(--success);margin-top:6px">📲 Assinado remotamente em ${item.signedAt?.toDate ? item.signedAt.toDate().toLocaleString('pt-BR') : '-'}</div>` : ''}
            </div>

            <div style="text-align:center;font-size:0.72rem;color:var(--text-muted);padding-top:8px;border-top:1px solid var(--border)">
                Documento gerado digitalmente pelo sistema Studio Beauty.
            </div>
        </div>`;

        document.getElementById('consent-view-modal').classList.remove('hidden');
    },

    closeViewModal(event) {
        if (event && event.target !== document.getElementById('consent-view-modal')) return;
        document.getElementById('consent-view-modal')?.classList.add('hidden');
    },

    async sendWhatsApp(id) {
        const items = Consent._allItems || await Store.getConsents();
        const item = items.find(i => i.id === id);
        if (!item) return;

        // Se não tem token, gera um
        let token = item.signToken;
        if (!token) {
            token = crypto.randomUUID();
            await Store.updateConsent(id, { signToken: token });
        }

        const baseUrl = location.origin;
        const signUrl = `${baseUrl}/assinar-termo.html?id=${id}&token=${token}&_=${Date.now()}`;
        const client = Consent.currentClients.find(c => c.id === item.clientId);
        const clientName = client?.name?.split(' ')[0] || 'Cliente';

        const msg = `Olá ${clientName}! 💕\n\nSegue o link para assinar o *Termo de Consentimento* do seu procedimento de *${item.procedure}*:\n\n📝 ${signUrl}\n\nÉ rápido e seguro! Basta abrir o link, ler o termo e assinar com o dedo na tela. ✨`;

        const phone = (client?.phone || '').replace(/\D/g, '');
        const waUrl = phone
            ? `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`
            : `https://wa.me/?text=${encodeURIComponent(msg)}`;

        window.open(waUrl, '_blank');
        App.showToast('Link de assinatura enviado via WhatsApp! 📲', 'success');
    },

    async delete(id) {
        if (!confirm('Excluir este termo?')) return;
        await Store.deleteConsent(id);
        App.showToast('Termo removido.', 'success');
        await Consent.loadList();
    }
};
