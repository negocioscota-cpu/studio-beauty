// === Client Form Page ===
const ClientFormPage = {
    render(clientId) {
        const isEdit = clientId && clientId !== 'new';
        return `
        <div class="max-w-4xl mx-auto space-y-8">
            <div>
                <p class="text-sm text-on-surface-variant mb-1">Clientes › <span class="text-primary font-semibold">${isEdit ? 'Editar' : 'Novo Cadastro'}</span></p>
                <h2 class="font-headline text-3xl font-extrabold tracking-tight">${isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                <p class="text-on-surface-variant mt-1">Complete as informações do cliente para ${isEdit ? 'atualizar o' : 'iniciar o'} cadastro.</p>
            </div>

            <!-- Status toggle -->
            <div class="bg-surface-container-low rounded-xl p-6 flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-on-surface">Status do Cadastro</h3>
                    <p class="text-sm text-on-surface-variant">Selecione o estado atual do relacionamento</p>
                </div>
                <div class="flex bg-surface-container-high p-1 rounded-xl">
                    <button type="button" class="status-btn px-5 py-2 rounded-lg text-sm font-bold transition-all" data-status="active">Ativo</button>
                    <button type="button" class="status-btn px-5 py-2 rounded-lg text-sm font-bold transition-all" data-status="prospect">Prospecto</button>
                    <button type="button" class="status-btn px-5 py-2 rounded-lg text-sm font-bold transition-all" data-status="inactive">Inativo</button>
                </div>
            </div>

            <form id="client-form" class="space-y-8">
                <input type="hidden" id="client-id" value="${isEdit ? clientId : ''}"/>
                <input type="hidden" id="client-status" value="active"/>

                <!-- Client Info -->
                <div class="bg-surface-container-lowest rounded-xl p-8 shadow-sm ghost-border">
                    <h3 class="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">person</span>
                        Informações do Cliente
                    </h3>
                    <div class="space-y-6">
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Nome Completo</label>
                            <input type="text" id="cf-name" class="w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="Ex: Maria Oliveira Santos" required/>
                        </div>
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">CPF / CNPJ</label>
                                <input type="text" id="cf-document" class="w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="000.000.000-00"/>
                            </div>
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Telefone</label>
                                <input type="tel" id="cf-phone" class="w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="(11) 99999-9999"/>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">E-mail</label>
                                <input type="email" id="cf-email" class="w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="nome@exemplo.com"/>
                            </div>
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">🎂 Data de Nascimento</label>
                                <input type="date" id="cf-birthdate" class="w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface"/>
                            </div>
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Endereço</label>
                            <input type="text" id="cf-address" class="w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="Rua, número, bairro..."/>
                        </div>
                    </div>
                </div>

                <!-- Service Info -->
                <div class="bg-surface-container-lowest rounded-xl p-8 shadow-sm ghost-border">
                    <h3 class="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">work</span>
                        Informações do Serviço
                    </h3>
                    <div class="space-y-6">
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Tipo de Serviço</label>
                                <select id="cf-service-type" class="w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface">
                                    <option value="">Selecione...</option>
                                    <option value="consultoria">Consultoria</option>
                                    <option value="manutencao">Manutenção</option>
                                    <option value="projeto">Projeto</option>
                                    <option value="atendimento">Atendimento</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Categoria</label>
                                <input type="text" id="cf-category" class="w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="Ex: Premium, Básico"/>
                            </div>
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Observações</label>
                            <textarea id="cf-notes" rows="3" class="w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface resize-none" placeholder="Anotações importantes sobre o cliente..."></textarea>
                        </div>
                    </div>
                </div>

                <!-- Financial alert -->
                <div class="bg-secondary-fixed/30 rounded-xl p-6 flex items-start gap-4">
                    <span class="material-symbols-outlined text-secondary text-2xl mt-1">warning</span>
                    <div>
                        <h4 class="font-bold text-on-secondary-fixed-variant">Observações Financeiras</h4>
                        <p class="text-sm text-on-secondary-fixed mt-1">Registre aqui pendências de pagamento ou atenções especiais no faturamento.</p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end gap-4 pt-4 border-t border-outline-variant/10" style="position: relative; z-index: 50;">
                    <a href="#/clients" class="px-8 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors">Cancelar</a>
                    <button type="submit" id="btn-save-client" class="px-8 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2">
                        <span class="material-symbols-outlined">save</span>
                        Finalizar Registro
                    </button>
                </div>
            </form>
        </div>`;
    },

    async init(clientId) {
        // Status buttons
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.status-btn').forEach(b => {
                    b.classList.remove('bg-primary', 'text-white', 'shadow-sm');
                });
                btn.classList.add('bg-primary', 'text-white', 'shadow-sm');
                document.getElementById('client-status').value = btn.dataset.status;
            });
        });

        // Default active
        const defaultBtn = document.querySelector('.status-btn[data-status="active"]');
        if (defaultBtn) defaultBtn.classList.add('bg-primary', 'text-white', 'shadow-sm');

        // Load existing client
        if (clientId && clientId !== 'new') {
            try {
                const client = await Store.getClient(clientId);
                if (client) {
                    document.getElementById('cf-name').value = client.name || '';
                    document.getElementById('cf-document').value = client.document || '';
                    document.getElementById('cf-phone').value = client.phone || '';
                    document.getElementById('cf-email').value = client.email || '';
                    document.getElementById('cf-birthdate').value = client.birthdate || '';
                    document.getElementById('cf-address').value = client.address || '';
                    document.getElementById('cf-service-type').value = client.serviceType || '';
                    document.getElementById('cf-category').value = client.category || '';
                    document.getElementById('cf-notes').value = client.notes || '';
                    document.getElementById('client-status').value = client.status || 'active';

                    // Status button
                    document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('bg-primary', 'text-white', 'shadow-sm'));
                    const activeBtn = document.querySelector(`.status-btn[data-status="${client.status}"]`);
                    if (activeBtn) activeBtn.classList.add('bg-primary', 'text-white', 'shadow-sm');
                }
            } catch (e) {
                console.error('Error loading client:', e);
            }
        }

        // Form submit
        const form = document.getElementById('client-form');
        const saveBtn = document.getElementById('btn-save-client');

        // Scroll to first invalid field on click
        saveBtn.addEventListener('click', () => {
            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid && firstInvalid.type !== 'hidden') {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus();
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('cf-name').value,
                document: document.getElementById('cf-document').value,
                phone: document.getElementById('cf-phone').value,
                email: document.getElementById('cf-email').value,
                birthdate: document.getElementById('cf-birthdate').value,
                address: document.getElementById('cf-address').value,
                serviceType: document.getElementById('cf-service-type').value,
                category: document.getElementById('cf-category').value,
                notes: document.getElementById('cf-notes').value,
                status: document.getElementById('client-status').value
            };

            // Show loading state
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<div class="spinner"></div> Salvando...';

            try {
                const existingId = document.getElementById('client-id').value;
                if (existingId) {
                    await Store.updateClient(existingId, data);
                    App.showToast('Cliente atualizado com sucesso!', 'success');
                } else {
                    await Store.addClient(data);
                    App.showToast('Cliente cadastrado com sucesso!', 'success');
                }
                window.location.hash = '#/clients';
            } catch (err) {
                App.showToast('Erro ao salvar: ' + err.message, 'error');
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<span class="material-symbols-outlined">save</span> Finalizar Registro';
            }
        });
    }
};
