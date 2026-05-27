// === Team Management Page ===
const TeamManagementPage = {
    members: [],

    render() {
        return `
        <div class="space-y-8 max-w-[1400px] mobile-full-width mx-auto animation-fade-in pb-20">
            <!-- Header -->
            <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Equipe & Comissões</h2>
                    <p class="text-on-surface-variant mt-1">Gerencie os profissionais do estúdio e as regras de comissionamento de cada um.</p>
                </div>
                <div>
                    <button id="btn-new-member" class="px-5 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">person_add</span>
                        Novo Profissional
                    </button>
                </div>
            </section>

            <!-- Grid de Profissionais -->
            <div id="team-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="col-span-full text-center py-12 text-on-surface-variant">
                    <div class="spinner mx-auto mb-4"></div>
                    <p class="text-sm">Carregando dados da equipe...</p>
                </div>
            </div>
        </div>`;
    },

    async init() {
        document.getElementById('btn-new-member')?.addEventListener('click', () => TeamManagementPage.showFormModal());
        await TeamManagementPage.loadData();
    },

    async loadData() {
        try {
            TeamManagementPage.members = await Store.getTeam();
            TeamManagementPage.renderGrid();
        } catch (error) {
            console.error("Erro ao carregar equipe:", error);
            App.showToast("Falha ao carregar profissionais do estúdio.", "error");
        }
    },

    renderGrid() {
        const grid = document.getElementById('team-grid');
        if (!grid) return;

        if (TeamManagementPage.members.length === 0) {
            grid.innerHTML = `
            <div class="col-span-full text-center py-16 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
                <span class="material-symbols-outlined text-primary/30 text-5xl mb-4">badge</span>
                <h4 class="font-headline font-bold text-lg text-on-surface">Nenhum profissional cadastrado</h4>
                <p class="text-on-surface-variant text-sm mt-1 mb-6">Cadastre as designers e colaboradoras do estúdio para comissionamento.</p>
                <button onclick="TeamManagementPage.showFormModal()" class="px-5 py-2.5 vitality-gradient text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto">
                    <span class="material-symbols-outlined text-base">add</span>
                    Adicionar Colaborador
                </button>
            </div>`;
            return;
        }

        grid.innerHTML = TeamManagementPage.members.map(member => {
            const commissionText = member.commissionType === 'percent'
                ? `${member.commissionValue || 0}% de comissão`
                : `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(member.commissionValue || 0)} fixo por serviço`;

            return `
            <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col justify-between group">
                <div>
                    <!-- Header do Card -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold font-headline" style="background-color: rgba(199, 123, 107, 0.1);">
                                ${member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 class="font-headline font-bold text-base text-on-surface">${member.name}</h4>
                                <span class="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">${member.role || 'Designer'}</span>
                            </div>
                        </div>
                        <div class="flex gap-1">
                            <button onclick="TeamManagementPage.showFormModal('${member.id}')" class="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" title="Editar">
                                <span class="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button onclick="TeamManagementPage.deleteMember('${member.id}')" class="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-on-surface-variant hover:text-red-600 transition-colors" title="Excluir">
                                <span class="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </div>

                    <!-- Dados de contato -->
                    <div class="space-y-2 mt-4">
                        <div class="flex items-center gap-2 text-xs text-on-surface-variant">
                            <span class="material-symbols-outlined text-base">mail</span>
                            <span>${member.email || 'Não informado'}</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-on-surface-variant">
                            <span class="material-symbols-outlined text-base">call</span>
                            <span>${member.phone || 'Não informado'}</span>
                        </div>
                    </div>
                </div>

                <!-- Footer do Card - Regra de Comissão -->
                <div class="flex items-center justify-between pt-4 border-t border-outline-variant/10 mt-6 bg-primary/2 rounded-xl p-3 border border-primary/5" style="background-color: rgba(199, 123, 107, 0.02);">
                    <div class="flex items-center gap-1.5 text-on-surface-variant">
                        <span class="material-symbols-outlined text-base text-primary">percent</span>
                        <span class="text-xs font-semibold text-on-surface">${commissionText}</span>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    showFormModal(memberId = null) {
        const isEdit = !!memberId;
        const member = isEdit ? TeamManagementPage.members.find(m => m.id === memberId) : null;

        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-8 max-w-lg mx-auto">
            <h3 class="font-headline font-bold text-2xl mb-1">${isEdit ? 'Editar Profissional' : 'Novo Profissional'}</h3>
            <p class="text-on-surface-variant text-sm mb-6">Insira os dados do profissional e configure as regras de comissionamento.</p>
            <form id="team-form" class="space-y-4">
                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Nome Completo</label>
                    <input type="text" id="tem-name" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Ex: Ana Souza" value="${member ? member.name : ''}" required />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Cargo / Especialidade</label>
                        <input type="text" id="tem-role" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Ex: Lash Designer" value="${member ? member.role : 'Lash Designer'}" required />
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Telefone / Celular</label>
                        <input type="text" id="tem-phone" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Ex: (11) 99999-9999" value="${member ? member.phone || '' : ''}" />
                    </div>
                </div>

                <div>
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">E-mail</label>
                    <input type="email" id="tem-email" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Ex: ana.souza@exemplo.com" value="${member ? member.email || '' : ''}" />
                </div>

                <!-- Regra de Comissão -->
                <div class="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-3" style="background-color: rgba(199, 123, 107, 0.05);">
                    <h4 class="font-headline font-bold text-sm text-primary flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-lg">payments</span>
                        Regra de Comissão
                    </h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Tipo de Comissão</label>
                            <select id="tem-comm-type" class="w-full px-4 py-2.5 bg-white border-none rounded-xl text-on-surface text-sm" required>
                                <option value="percent" ${member && member.commissionType === 'percent' ? 'selected' : ''}>Percentual (%)</option>
                                <option value="fixed" ${member && member.commissionType === 'fixed' ? 'selected' : ''}>Fixo (R$)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Valor da Comissão</label>
                            <input type="number" id="tem-comm-val" step="0.1" class="w-full px-4 py-2.5 bg-white border-none rounded-xl text-on-surface text-sm" placeholder="Ex: 40 para 40%" value="${member ? member.commissionValue : '40'}" required />
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-2.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl text-sm transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-2.5 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all text-sm flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">save</span>
                        Salvar Profissional
                    </button>
                </div>
            </form>
        </div>`;
        App.openModal();

        // Form Submit
        document.getElementById('team-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('tem-name').value.trim(),
                role: document.getElementById('tem-role').value.trim(),
                phone: document.getElementById('tem-phone').value.trim(),
                email: document.getElementById('tem-email').value.trim(),
                commissionType: document.getElementById('tem-comm-type').value,
                commissionValue: parseFloat(document.getElementById('tem-comm-val').value) || 0
            };

            try {
                if (isEdit) {
                    await Store.updateTeamMember(memberId, data);
                    App.showToast("Colaborador atualizado com sucesso!", "success");
                } else {
                    await Store.addTeamMember(data);
                    App.showToast("Colaborador cadastrado com sucesso!", "success");
                }
                App.closeModal();
                await TeamManagementPage.loadData();
            } catch (err) {
                console.error("Erro ao salvar membro da equipe:", err);
                App.showToast("Falha ao salvar profissional.", "error");
            }
        });
    },

    async deleteMember(memberId) {
        if (!confirm("Tem certeza que deseja desvincular este profissional da equipe?")) return;
        try {
            await Store.deleteTeamMember(memberId);
            App.showToast("Profissional removido da equipe!", "success");
            await TeamManagementPage.loadData();
        } catch (err) {
            console.error("Erro ao excluir profissional:", err);
            App.showToast("Falha ao remover profissional.", "error");
        }
    }
};
