// === Página de Gestão de Equipe (Owner Only) ===
const TeamManagement = {

    // ── Aba ativa ──────────────────────────────────────────
    _activeTab: 'equipe',

    // ── Render principal ───────────────────────────────────
    async render(container) {
        const uid = firebase.auth().currentUser?.uid;
        if (!uid) return;

        // Plano — companies é a fonte canônica (atualizada pelo webhook do Asaas)
        let planName = 'solo';
        try {
            const companyDoc = await db.collection('companies').doc(uid).get();
            if (companyDoc.exists) {
                planName = (companyDoc.data().plan || companyDoc.data().selectedPlan || 'solo').toLowerCase();
            } else {
                // Fallback: studios (usuários novos sem companies ainda)
                const studioDoc = await db.collection('studios').doc(uid).get();
                if (studioDoc.exists && studioDoc.data().plan) {
                    planName = studioDoc.data().plan.toLowerCase();
                }
            }
        } catch (e) { console.warn('Erro ao buscar plano:', e); }

        const maxTeam  = planName === 'premium' ? 10 : planName === 'studio' ? 3 : 1;
        const canAddTeam = planName === 'studio' || planName === 'premium';

        // Equipe & convites
        let teamMembers = [], commissionConfig = {}, pendingInvites = [];
        try {
            [teamMembers, commissionConfig] = await Promise.all([
                Team.getTeamMembers(uid),
                Store.getCommissionConfig()
            ]);
        } catch (e) { console.warn('Erro ao buscar equipe:', e); }

        try {
            const snap = await db.collection('team_invites')
                .where('ownerId', '==', uid)
                .where('status', '==', 'pending')
                .get();
            pendingInvites = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) { console.warn('Erro convites:', e); }

        const totalTeam      = 1 + teamMembers.length;
        const slotsAvailable = maxTeam - totalTeam;
        const planLabel      = planName.charAt(0).toUpperCase() + planName.slice(1);

        container.innerHTML = `
        <div style="max-width:860px;margin:0 auto;padding:24px">

            <!-- Header -->
            <div class="card" style="background:linear-gradient(135deg,var(--primary),#a85d73);color:white;padding:24px;border-radius:16px;margin-bottom:20px">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
                    <div>
                        <h2 style="font-size:1.4rem;font-weight:800;margin:0">👥 Gestão de Equipe</h2>
                        <p style="opacity:.9;margin-top:4px;font-size:.9rem">
                            Plano <strong>${planLabel}</strong> — ${totalTeam}/${maxTeam} profissionais
                        </p>
                    </div>
                    <div style="background:rgba(255,255,255,.2);border-radius:12px;padding:12px 20px;text-align:center">
                        <div style="font-size:2rem;font-weight:900">${totalTeam}</div>
                        <div style="font-size:.75rem;opacity:.8">de ${maxTeam}</div>
                    </div>
                </div>
                <!-- Barra de progresso -->
                <div style="margin-top:16px;background:rgba(255,255,255,.2);border-radius:8px;height:8px;overflow:hidden">
                    <div style="height:100%;border-radius:8px;background:white;transition:width .3s;width:${(totalTeam/maxTeam)*100}%"></div>
                </div>
            </div>

            <!-- Abas -->
            <div style="display:flex;gap:4px;margin-bottom:20px;background:var(--bg-card);padding:6px;border-radius:12px;border:1px solid var(--border-color)">
                <button id="tab-btn-equipe" onclick="TeamManagement._switchTab('equipe')"
                    style="flex:1;padding:10px 0;border-radius:8px;border:none;cursor:pointer;font-size:.92rem;font-weight:600;transition:all .2s;
                           background:${TeamManagement._activeTab==='equipe'?'var(--primary)':'transparent'};
                           color:${TeamManagement._activeTab==='equipe'?'white':'var(--text-secondary)'}">
                    👥 Minha Equipe
                </button>
                <button id="tab-btn-permissoes" onclick="TeamManagement._switchTab('permissoes')"
                    style="flex:1;padding:10px 0;border-radius:8px;border:none;cursor:pointer;font-size:.92rem;font-weight:600;transition:all .2s;
                           background:${TeamManagement._activeTab==='permissoes'?'var(--primary)':'transparent'};
                           color:${TeamManagement._activeTab==='permissoes'?'white':'var(--text-secondary)'}">
                    🔐 Permissões
                </button>
            </div>

            <!-- Conteúdo das abas -->
            <div id="team-tab-content">
                ${TeamManagement._activeTab === 'equipe'
                    ? TeamManagement._renderTabEquipe(canAddTeam, slotsAvailable, teamMembers, commissionConfig, pendingInvites, planLabel)
                    : TeamManagement._renderTabPermissoes()
                }
            </div>

        </div>`;
    },

    // ── Troca de aba ──────────────────────────────────────
    _switchTab(tab) {
        TeamManagement._activeTab = tab;
        // Re-renderiza sem recarregar dados do servidor
        const container = document.getElementById('page-content');
        if (container) {
            App.currentPage = null;
            App.navigate('team');
        }
    },

    // ── Aba: Minha Equipe ─────────────────────────────────
    _renderTabEquipe(canAddTeam, slotsAvailable, teamMembers, commissionConfig, pendingInvites, planLabel) {
        if (!canAddTeam) {
            return `
            <div class="card" style="padding:32px;border-radius:12px;text-align:center;background:var(--bg-card)">
                <span class="material-symbols-outlined" style="font-size:48px;color:var(--primary);opacity:.5">upgrade</span>
                <h3 style="color:var(--text-primary);margin-top:12px">Plano Solo — Apenas Você</h3>
                <p style="color:var(--text-secondary);margin-top:8px;max-width:400px;margin-inline:auto">
                    No plano <strong>Solo</strong> você trabalha individualmente. Faça upgrade para
                    <strong>Estúdio</strong> (até 3 profissionais) ou <strong>Premium</strong> (até 10) para
                    adicionar parceiras à sua equipe.
                </p>
                <button class="btn btn-primary" onclick="App.navigate('settings')" style="margin-top:20px">
                    <span class="material-symbols-outlined">rocket_launch</span> Ver Planos
                </button>
            </div>`;
        }

        return `
        <!-- Convidar -->
        <div class="card" style="padding:24px;border-radius:12px;margin-bottom:20px;background:var(--bg-card)">
            <h3 style="color:var(--text-primary);margin-bottom:4px;font-weight:700">
                <span class="material-symbols-outlined" style="font-size:20px;vertical-align:middle">person_add</span>
                Convidar Profissional
            </h3>
            <p style="color:var(--text-muted);font-size:.82rem;margin-bottom:16px">
                A profissional precisará criar uma conta ou fazer login com o mesmo e-mail informado aqui.
            </p>
            ${slotsAvailable <= 0 ? `
                <div style="padding:14px;background:rgba(255,107,107,.1);border-radius:8px;color:#ff6b6b;text-align:center;font-size:.88rem">
                    <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">warning</span>
                    Limite de profissionais atingido para o plano <strong>${planLabel}</strong>.
                    Faça upgrade para adicionar mais.
                </div>
            ` : `
                <div style="display:flex;gap:12px;flex-wrap:wrap">
                    <input type="text"  id="invite-name"  class="form-control" placeholder="Nome da profissional" style="flex:1;min-width:140px" />
                    <input type="email" id="invite-email" class="form-control" placeholder="E-mail" style="flex:1.5;min-width:200px" />
                    <button class="btn btn-primary" id="btn-send-invite" onclick="TeamManagement.sendInvite()">
                        <span class="material-symbols-outlined">send</span> Convidar
                    </button>
                </div>
            `}
        </div>

        <!-- Convites pendentes -->
        ${pendingInvites.length > 0 ? `
        <div class="card" style="padding:24px;border-radius:12px;margin-bottom:20px;background:var(--bg-card)">
            <h3 style="color:var(--text-primary);margin-bottom:16px;font-weight:700">
                <span class="material-symbols-outlined" style="font-size:20px;vertical-align:middle">hourglass_top</span>
                Aguardando Aceitação (${pendingInvites.length})
            </h3>
            ${pendingInvites.map(inv => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-radius:8px;background:rgba(232,164,184,.08);margin-bottom:8px">
                <div>
                    <div style="font-weight:600;color:var(--text-primary)">${inv.name || '—'}</div>
                    <div style="font-size:.84rem;color:var(--text-secondary)">${inv.email}</div>
                </div>
                <button class="btn btn-ghost" style="color:#ff6b6b;font-size:.84rem" onclick="TeamManagement.cancelInvite('${inv.id}')">
                    <span class="material-symbols-outlined" style="font-size:16px">close</span> Cancelar
                </button>
            </div>`).join('')}
        </div>` : ''}

        <!-- Equipe ativa -->
        <div class="card" style="padding:24px;border-radius:12px;background:var(--bg-card)">
            <h3 style="color:var(--text-primary);margin-bottom:16px;font-weight:700">
                <span class="material-symbols-outlined" style="font-size:20px;vertical-align:middle">groups</span>
                Equipe Ativa
            </h3>

            <!-- Proprietária -->
            <div style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:10px;background:linear-gradient(135deg,rgba(232,164,184,.15),rgba(232,164,184,.05));margin-bottom:8px;border:1px solid rgba(232,164,184,.2)">
                <div style="width:40px;height:40px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:18px">👑</div>
                <div style="flex:1">
                    <div style="font-weight:700;color:var(--text-primary)">${firebase.auth().currentUser?.displayName || 'Você'}</div>
                    <div style="font-size:.82rem;color:var(--text-secondary)">${firebase.auth().currentUser?.email}</div>
                </div>
                <span style="font-size:.75rem;padding:4px 12px;border-radius:20px;background:var(--primary);color:white;font-weight:600">Proprietária</span>
            </div>

            ${teamMembers.length === 0 ? `
            <div style="text-align:center;padding:32px;color:var(--text-muted)">
                <span class="material-symbols-outlined" style="font-size:40px;opacity:.4">person_add</span>
                <p style="margin-top:8px">Nenhuma profissional na equipe ainda.</p>
            </div>` : teamMembers.map(m => {
                const comm = commissionConfig[m.id];
                const commLabel = comm
                    ? (comm.type === 'percent' ? `💰 ${comm.value}% sobre o total` : `💰 R$ ${parseFloat(comm.value||0).toFixed(2)} por atendimento`)
                    : '💰 Comissão não definida';
                return `
                <div style="display:flex;align-items:flex-start;gap:12px;padding:14px;border-radius:10px;background:var(--bg-tertiary);margin-bottom:8px;border:1px solid var(--border-color)">
                    <div style="width:40px;height:40px;border-radius:50%;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">💼</div>
                    <div style="flex:1;min-width:0">
                        <div style="font-weight:600;color:var(--text-primary)">${m.name || 'Profissional'}</div>
                        <div style="font-size:.82rem;color:var(--text-secondary)">${m.email}</div>
                        <div style="font-size:.75rem;color:var(--text-muted);margin-top:2px">
                            Desde ${m.joinedAt ? new Date(m.joinedAt.toDate?.() || m.joinedAt).toLocaleDateString('pt-BR') : '-'}
                        </div>
                        <div style="margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                            <span style="font-size:.8rem;padding:3px 10px;border-radius:20px;background:${comm?'rgba(40,167,69,.12)':'rgba(150,150,150,.1)'};color:${comm?'#28a745':'var(--text-muted)'}">
                                ${commLabel}
                            </span>
                            <button class="btn btn-ghost btn-sm" style="font-size:.78rem;padding:3px 10px"
                                onclick="TeamManagement.editCommission('${m.id}','${(m.name||'').replace(/'/g,"\\'")}')">
                                ✏️ Editar comissão
                            </button>
                            <button class="btn btn-ghost btn-sm" style="font-size:.78rem;padding:3px 10px"
                                onclick="TeamManagement.editPermissions('${m.id}','${(m.name||'').replace(/'/g,"\\'")}')">
                                🔐 Permissões
                            </button>
                        </div>
                    </div>
                    <button class="btn btn-ghost" style="color:#ff6b6b;font-size:.82rem;flex-shrink:0"
                        onclick="TeamManagement.removeMember('${m.id}','${(m.name||'Profissional').replace(/'/g,"\\'")}')">
                        <span class="material-symbols-outlined" style="font-size:18px">person_remove</span>
                    </button>
                </div>`;
            }).join('')}
        </div>`;
    },

    // ── Aba: Permissões ───────────────────────────────────
    _renderTabPermissoes() {
        const allowed = [
            { icon: 'event',               label: 'Agenda',                   desc: 'Ver, criar e editar agendamentos' },
            { icon: 'people',              label: 'Cadastro de Clientes',     desc: 'Cadastrar e editar dados de clientes' },
            { icon: 'history',             label: 'Histórico de Atendimentos',desc: 'Ver e registrar atendimentos realizados' },
            { icon: 'spa',                 label: 'Ficha Técnica',            desc: 'Preencher e consultar fichas técnicas' },
            { icon: 'photo_camera',        label: 'Portfólio',                desc: 'Adicionar e visualizar fotos do trabalho' },
            { icon: 'notifications_active',label: 'Lembretes',                desc: 'Ver e enviar lembretes às clientes' },
            { icon: 'cake',                label: 'Aniversariantes',          desc: 'Visualizar aniversariantes do mês' },
            { icon: 'gavel',               label: 'Termo de Consentimento',   desc: 'Preencher termos com a cliente' },
        ];

        const blocked = [
            { icon: 'bar_chart',            label: 'Relatórios' },
            { icon: 'payments',             label: 'Financeiro' },
            { icon: 'account_balance_wallet',label: 'Bolsa da Beleza' },
            { icon: 'inventory_2',          label: 'Estoque' },
            { icon: 'menu_book',            label: 'Catálogo de Serviços' },
            { icon: 'settings',             label: 'Configurações' },
            { icon: 'group',                label: 'Gestão de Equipe' },
            { icon: 'savings',              label: 'Indique e Ganhe' },
            { icon: 'diamond',              label: 'Programa de Fidelidade' },
            { icon: 'dashboard',            label: 'Dashboard Financeiro' },
            { icon: 'store',                label: 'Perfil do Studio' },
            { icon: 'link',                 label: 'Link da Bio' },
        ];

        return `
        <!-- Explicação -->
        <div class="card" style="padding:20px 24px;border-radius:12px;margin-bottom:20px;background:linear-gradient(135deg,rgba(232,164,184,.12),rgba(232,164,184,.04));border:1px solid rgba(232,164,184,.25)">
            <div style="display:flex;gap:12px;align-items:flex-start">
                <span class="material-symbols-outlined" style="color:var(--primary);font-size:24px;margin-top:2px">info</span>
                <div>
                    <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px">Como funcionam as permissões?</div>
                    <p style="color:var(--text-secondary);font-size:.88rem;line-height:1.6;margin:0">
                        Ao convidar uma profissional, ela terá acesso apenas às funcionalidades <strong>operacionais</strong> do seu studio —
                        tudo que ela precisa para realizar o atendimento. Dados de <strong>gestão, financeiro e administração</strong>
                        são exclusivos da proprietária e nunca ficam visíveis para a equipe.
                    </p>
                </div>
            </div>
        </div>

        <!-- Permitido -->
        <div class="card" style="padding:24px;border-radius:12px;margin-bottom:20px;background:var(--bg-card)">
            <h3 style="color:var(--text-primary);margin-bottom:16px;font-weight:700;display:flex;align-items:center;gap:8px">
                <span style="width:28px;height:28px;border-radius:50%;background:rgba(40,167,69,.15);display:inline-flex;align-items:center;justify-content:center">
                    <span class="material-symbols-outlined" style="font-size:16px;color:#28a745">check</span>
                </span>
                O que as profissionais podem acessar
            </h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
                ${allowed.map(item => `
                <div style="display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:10px;background:rgba(40,167,69,.06);border:1px solid rgba(40,167,69,.15)">
                    <div style="width:36px;height:36px;border-radius:8px;background:rgba(40,167,69,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                        <span class="material-symbols-outlined" style="font-size:18px;color:#28a745">${item.icon}</span>
                    </div>
                    <div>
                        <div style="font-weight:600;color:var(--text-primary);font-size:.9rem">${item.label}</div>
                        <div style="font-size:.78rem;color:var(--text-secondary);margin-top:2px">${item.desc}</div>
                    </div>
                </div>`).join('')}
            </div>
        </div>

        <!-- Bloqueado -->
        <div class="card" style="padding:24px;border-radius:12px;background:var(--bg-card)">
            <h3 style="color:var(--text-primary);margin-bottom:16px;font-weight:700;display:flex;align-items:center;gap:8px">
                <span style="width:28px;height:28px;border-radius:50%;background:rgba(255,107,107,.12);display:inline-flex;align-items:center;justify-content:center">
                    <span class="material-symbols-outlined" style="font-size:16px;color:#ff6b6b">lock</span>
                </span>
                Exclusivo da Proprietária — não visível para a equipe
            </h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">
                ${blocked.map(item => `
                <div style="display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:8px;background:rgba(255,107,107,.05);border:1px solid rgba(255,107,107,.12)">
                    <span class="material-symbols-outlined" style="font-size:18px;color:rgba(255,107,107,.6)">${item.icon}</span>
                    <span style="font-size:.86rem;color:var(--text-secondary)">${item.label}</span>
                </div>`).join('')}
            </div>
        </div>`;
    },

    // ── Ações ─────────────────────────────────────────────
    async sendInvite() {
        const nameInput  = document.getElementById('invite-name');
        const emailInput = document.getElementById('invite-email');
        const btn        = document.getElementById('btn-send-invite');
        const name  = nameInput?.value?.trim();
        const email = emailInput?.value?.trim()?.toLowerCase();

        if (!name || !email) { App.toast('Preencha nome e e-mail.', 'warning'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { App.toast('E-mail inválido.', 'warning'); return; }

        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div>';
        try {
            const result = await Team.inviteProfessional(firebase.auth().currentUser.uid, email, name);
            if (result.success) {
                App.toast('✅ Convite enviado!', 'success');
                App.currentPage = null;
                await App.navigate('team');
            } else {
                App.toast(result.error || 'Erro ao enviar convite.', 'error');
            }
        } catch (err) {
            App.toast('Erro: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined">send</span> Convidar';
        }
    },

    async cancelInvite(inviteId) {
        if (!confirm('Cancelar este convite?')) return;
        try {
            await db.collection('team_invites').doc(inviteId).update({ status: 'cancelled' });
            App.toast('Convite cancelado.', 'info');
            App.currentPage = null;
            await App.navigate('team');
        } catch (err) { App.toast('Erro: ' + err.message, 'error'); }
    },

    async removeMember(memberId, memberName) {
        if (!confirm(`Remover ${memberName} da equipe?\n\nEla perderá o acesso ao studio.`)) return;
        try {
            await Team.removeProfessional(firebase.auth().currentUser.uid, memberId);
            App.toast(`${memberName} removida da equipe.`, 'info');
            App.currentPage = null;
            await App.navigate('team');
        } catch (err) { App.toast('Erro: ' + err.message, 'error'); }
    },

    async editCommission(memberId, memberName) {
        let config = {};
        try { config = await Store.getCommissionConfig(); } catch(e) {}
        const curr = config[memberId] || { type: 'percent', value: '' };

        const modalId = 'comm-modal-' + memberId;
        document.getElementById(modalId)?.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
          <div class="modal-container" onclick="event.stopPropagation()" style="max-width:420px">
            <div class="modal-header">
              <h3 class="modal-title">💰 Comissão — ${memberName}</h3>
              <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
            </div>
            <div class="modal-body">
              <p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:16px">
                Configure livremente conforme o acordo entre vocês.
              </p>
              <div class="form-group">
                <label class="form-label">Tipo de comissão</label>
                <select class="form-control" id="comm-type-${memberId}"
                    onchange="TeamManagement._toggleCommValue('${memberId}')">
                  <option value="percent" ${curr.type==='percent'?'selected':''}>% sobre o total do atendimento</option>
                  <option value="fixed"   ${curr.type==='fixed'  ?'selected':''}>Valor fixo por atendimento (R$)</option>
                  <option value="none"    ${curr.type==='none'   ?'selected':''}>Sem comissão cadastrada</option>
                </select>
              </div>
              <div class="form-group" id="comm-value-wrap-${memberId}" ${curr.type==='none'?'style="display:none"':''}>
                <label class="form-label" id="comm-value-label-${memberId}">${curr.type==='fixed'?'Valor fixo (R$)':'Percentual (%)'}</label>
                <input class="form-control" id="comm-value-${memberId}" type="number" min="0" step="0.01"
                  placeholder="${curr.type==='fixed'?'Ex: 50.00':'Ex: 40'}" value="${curr.value||''}" />
              </div>
              <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:20px">
                <button class="btn btn-ghost" onclick="document.getElementById('${modalId}').remove()">Cancelar</button>
                <button class="btn btn-primary" onclick="TeamManagement._saveCommission('${memberId}','${modalId}')">
                  <span class="material-symbols-outlined">save</span> Salvar
                </button>
              </div>
            </div>
          </div>`;
        document.body.appendChild(modal);
    },

    _toggleCommValue(memberId) {
        const type  = document.getElementById(`comm-type-${memberId}`)?.value;
        const wrap  = document.getElementById(`comm-value-wrap-${memberId}`);
        const label = document.getElementById(`comm-value-label-${memberId}`);
        const input = document.getElementById(`comm-value-${memberId}`);
        if (!wrap) return;
        wrap.style.display  = type === 'none' ? 'none' : '';
        if (type !== 'none') {
            label.textContent   = type === 'fixed' ? 'Valor fixo (R$)' : 'Percentual (%)';
            input.placeholder   = type === 'fixed' ? 'Ex: 50.00' : 'Ex: 40';
        }
    },

    async _saveCommission(memberId, modalId) {
        const type  = document.getElementById(`comm-type-${memberId}`)?.value;
        const value = parseFloat(document.getElementById(`comm-value-${memberId}`)?.value) || 0;
        try {
            const config = await Store.getCommissionConfig();
            if (type === 'none') { delete config[memberId]; }
            else { config[memberId] = { type, value }; }
            await Store.saveCommissionConfig(config);
            App.toast('Comissão salva!', 'success');
            document.getElementById(modalId)?.remove();
            App.currentPage = null;
            await App.navigate('team');
        } catch(err) { App.toast('Erro: ' + err.message, 'error'); }
    },

    async editPermissions(memberId, memberName) {
        let permissions = {};
        try {
            const doc = await db.collection('professionals').doc(memberId).get();
            if (doc.exists && doc.data().permissions) {
                permissions = doc.data().permissions;
            }
        } catch (e) { console.warn('Erro ao buscar permissões:', e); }

        const opModules = [
            { id: 'schedule',     label: '📅 Agenda',                    desc: 'Visualizar e criar agendamentos de clientes' },
            { id: 'clients',      label: '👥 Cadastro de Clientes',      desc: 'Cadastrar e editar dados de clientes' },
            { id: 'interactions', label: '📊 Histórico de Atendimentos', desc: 'Consultar atendimentos antigos das clientes' },
            { id: 'ficha',        label: '✨ Ficha Técnica',             desc: 'Preencher fichas de anamnese (Cílios, Sobrancelha, Manicure...)' },
            { id: 'portfolio',    label: '📸 Portfólio de Fotos',        desc: 'Adicionar antes/depois de fotos aos perfis' },
            { id: 'reminders',    label: '🔔 Central de Lembretes',      desc: 'Ver e enviar mensagens de confirmação e lembretes' },
            { id: 'birthday',     label: '🎂 Aniversariantes',           desc: 'Visualizar aniversariantes do mês atual' },
            { id: 'consent',      label: '📋 Termo de Consentimento',    desc: 'Coletar assinaturas digitais nos termos das clientes' },
            { id: 'tutorial',     label: '📖 Guia de Uso',               desc: 'Acessar tutoriais explicativos da plataforma' }
        ];

        const admModules = [
            { id: 'dashboard',            label: '📈 Dashboard Financeiro',      desc: 'Visualizar gráficos, faturamento e resumo financeiro' },
            { id: 'reports',              label: '📊 Relatórios de Desempenho',  desc: 'Relatórios de faturamento, comissões e atendimentos' },
            { id: 'invoices',             label: '💰 Central Financeira',        desc: 'Controle de contas a pagar (despesas) e receber' },
            { id: 'inventory',            label: '📦 Controle de Estoque',       desc: 'Visualizar e editar insumos, colas e produtos' },
            { id: 'catalog',              label: '🛍️ Catálogo de Serviços',     desc: 'Cadastrar e alterar preços de procedimentos' },
            { id: 'bolsa-beleza',         label: '👛 A Bolsa da Beleza',         desc: 'Acessar e criar campanhas de vendas e ofertas' },
            { id: 'referrals',            label: '🎁 Indique e Ganhe',           desc: 'Gerenciar programa de indicação de outras profissionais' },
            { id: 'loyalty',              label: '💎 Programa de Fidelidade',     desc: 'Configurar cashback e pontos para clientes' },
            { id: 'reviews',              label: '⭐ Avaliações NPS',             desc: 'Visualizar notas e feedbacks deixados por clientes' },
            { id: 'booking-online',       label: '📅 Configurar Agenda Online',  desc: 'Alterar regras do link de agendamento da bio' },
            { id: 'notifications-config', label: '💬 Configurar WhatsApp Z-API',  desc: 'Alterar chaves de automação de mensagens de confirmação' },
            { id: 'bio-link',             label: '🔗 Personalizar Link da Bio',  desc: 'Configurar cartão de visita digital e links de redes' },
            { id: 'business-hours',       label: '🕐 Horários de Funcionamento', desc: 'Definir horário padrão do estúdio e dias de folga' },
            { id: 'studio-profile',       label: '🏪 Perfil do Estúdio',         desc: 'Alterar endereço, logo e nome fantasia do negócio' },
            { id: 'cost-calc',            label: '🧮 Calculadora de Custos',     desc: 'Calcular preço de custo por procedimento' },
            { id: 'team',                 label: '👥 Gestão de Equipe',          desc: 'Convidar profissionais, comissões e gerenciar acessos' },
            { id: 'settings',             label: '⚙️ Configurações & Assinatura',desc: 'Gerenciar fatura do Asaas e chaves gerais da conta' }
        ];

        const renderCheckboxes = (modules, defaultVal) => {
            return modules.map(m => {
                const checked = permissions[m.id] !== undefined ? !!permissions[m.id] : defaultVal;
                return `
                <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;margin-bottom:2px">
                    <input type="checkbox" id="perm-chk-${m.id}" data-page="${m.id}" ${checked ? 'checked' : ''} style="margin-top:4px;cursor:pointer;accent-color:var(--primary)" />
                    <label for="perm-chk-${m.id}" style="cursor:pointer;flex:1">
                        <div style="font-weight:600;font-size:.86rem;color:var(--text-primary)">${m.label}</div>
                        <div style="font-size:.74rem;color:var(--text-muted);margin-top:1px;line-height:1.3">${m.desc}</div>
                    </label>
                </div>`;
            }).join('');
        };

        const modalId = 'perm-modal-' + memberId;
        document.getElementById(modalId)?.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
          <div class="modal-container" onclick="event.stopPropagation()" style="max-width:650px;width:95%">
            <div class="modal-header">
              <h3 class="modal-title">🔐 Permissões — ${memberName}</h3>
              <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
            </div>
            <div class="modal-body" style="max-height:75vh;overflow-y:auto;padding-right:4px">
              <p style="font-size:.82rem;color:var(--text-secondary);margin-bottom:16px">
                Marque abaixo quais páginas e funcionalidades a profissional poderá acessar.
              </p>
              
              <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
                <button class="btn btn-outline btn-sm" style="font-size:.78rem;padding:6px 12px" onclick="TeamManagement._setAllPerms('${modalId}', 'operacional')">📋 Operacionais Apenas</button>
                <button class="btn btn-outline btn-sm" style="font-size:.78rem;padding:6px 12px" onclick="TeamManagement._setAllPerms('${modalId}', 'full')">⚡ Acesso Total</button>
                <button class="btn btn-outline btn-sm" style="font-size:.78rem;padding:6px 12px" onclick="TeamManagement._setAllPerms('${modalId}', 'none')">❌ Restringir Tudo</button>
              </div>

              <div style="margin-bottom:20px">
                <h4 style="font-size:.85rem;font-weight:800;color:var(--primary);margin-bottom:10px;border-left:3px solid var(--primary);padding-left:8px">
                    🛠️ MÓDULOS OPERACIONAIS (ATENDIMENTO)
                </h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(270px, 1fr));gap:8px">
                    ${renderCheckboxes(opModules, true)}
                </div>
              </div>

              <div>
                <h4 style="font-size:.85rem;font-weight:800;color:#c9a96e;margin-bottom:10px;border-left:3px solid #c9a96e;padding-left:8px">
                    💼 MÓDULOS DE GESTÃO E CONFIGURAÇÕES
                </h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(270px, 1fr));gap:8px">
                    ${renderCheckboxes(admModules, false)}
                </div>
              </div>

              <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;border-top:1px solid var(--border-color);padding-top:16px">
                <button class="btn btn-ghost" onclick="document.getElementById('${modalId}').remove()">Cancelar</button>
                <button class="btn btn-primary" onclick="TeamManagement._savePermissions('${memberId}','${modalId}')">
                  <span class="material-symbols-outlined">save</span> Salvar Permissões
                </button>
              </div>
            </div>
          </div>`;
        document.body.appendChild(modal);
    },

    _setAllPerms(modalId, mode) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        const checks = modal.querySelectorAll('input[type="checkbox"]');
        const opPages = ['schedule', 'clients', 'interactions', 'ficha', 'portfolio', 'reminders', 'birthday', 'consent', 'tutorial'];
        checks.forEach(chk => {
            const page = chk.dataset.page;
            if (mode === 'full') {
                chk.checked = true;
            } else if (mode === 'none') {
                chk.checked = false;
            } else if (mode === 'operacional') {
                chk.checked = opPages.includes(page);
            }
        });
    },

    async _savePermissions(memberId, modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        const newPermissions = {};
        modal.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            const page = chk.dataset.page;
            newPermissions[page] = chk.checked;
        });

        try {
            await db.collection('professionals').doc(memberId).update({ permissions: newPermissions });

            const doc = await db.collection('professionals').doc(memberId).get();
            if (doc.exists) {
                const data = doc.data();
                if (data.authUid) {
                    await db.collection('professionals').doc(data.authUid).update({ permissions: newPermissions });
                }
                if (data.originalInviteId) {
                    await db.collection('professionals').doc(data.originalInviteId).update({ permissions: newPermissions });
                }
            }

            App.toast('✅ Permissões salvas!', 'success');
            document.getElementById(modalId)?.remove();
            App.currentPage = null;
            await App.navigate('team');
        } catch(err) {
            App.toast('Erro: ' + err.message, 'error');
        }
    }
};
