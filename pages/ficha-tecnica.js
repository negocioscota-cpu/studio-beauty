// === Technical Records & Lash Mapping Page ===
const FichaTecnicaPage = {
    records: [],

    render() {
        return `
        <div class="space-y-8 max-w-[1400px] mobile-full-width mx-auto animation-fade-in pb-20">
            <!-- Header -->
            <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Fichas Técnicas & Lash Mapping</h2>
                    <p class="text-on-surface-variant mt-1">Anamnese detalhada e mapas de design de cílios personalizados para cada cliente.</p>
                </div>
                <div>
                    <button id="btn-new-record" class="px-5 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-lg">medical_information</span>
                        Nova Ficha de Anamnese
                    </button>
                </div>
            </section>

            <!-- Fichas Listagem -->
            <div class="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/10 shadow-xs">
                <h3 class="font-headline font-bold text-lg mb-4">Fichas Técnicas Recentes</h3>
                <div id="records-list" class="space-y-4">
                    <div class="text-center py-12 text-on-surface-variant text-sm">
                        <div class="spinner mx-auto mb-4"></div>
                        <p>Carregando fichas técnicas...</p>
                    </div>
                </div>
            </div>
        </div>`;
    },

    async init() {
        document.getElementById('btn-new-record')?.addEventListener('click', () => FichaTecnicaPage.showFormModal());
        await FichaTecnicaPage.loadData();
    },

    async loadData() {
        try {
            FichaTecnicaPage.records = await Store.getTechnicalRecords();
            FichaTecnicaPage.renderList();
        } catch (error) {
            console.error("Erro ao carregar fichas técnicas:", error);
            App.showToast("Falha ao carregar fichas técnicas.", "error");
        }
    },

    renderList() {
        const list = document.getElementById('records-list');
        if (!list) return;

        if (FichaTecnicaPage.records.length === 0) {
            list.innerHTML = `
            <div class="text-center py-12 text-on-surface-variant">
                <span class="material-symbols-outlined text-primary/30 text-5xl mb-4">assignment</span>
                <h4 class="font-headline font-bold text-base text-on-surface">Nenhuma ficha técnica registrada</h4>
                <p class="text-xs mt-1">Registre a primeira ficha de anamnese e lash mapping de suas clientes.</p>
            </div>`;
            return;
        }

        list.innerHTML = FichaTecnicaPage.records.map(rec => {
            const formattedDate = rec.createdAt ? new Date(rec.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
            return `
            <div class="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/10 hover:border-primary/20 transition-all space-y-4">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold" style="background-color: rgba(199, 123, 107, 0.1);">
                            👁
                        </div>
                        <div>
                            <h4 class="font-headline font-bold text-sm text-on-surface">Ficha de: <strong class="text-primary">${rec.clientName}</strong></h4>
                            <p class="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Técnica: ${rec.mappingStyle || 'Clássico'} | Curvatura: ${rec.lashCurvature || 'D'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 self-end md:self-center">
                        <span class="text-[10px] text-on-surface-variant mr-2 font-medium">${formattedDate}</span>
                        <button onclick="FichaTecnicaPage.deleteRecord('${rec.id}')" class="w-8 h-8 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 flex items-center justify-center transition-colors" title="Excluir">
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </div>

                <!-- Lash Mapping Visual Box -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-outline-variant/10 text-xs text-on-surface-variant">
                    <!-- Detalhes Físicos -->
                    <div class="space-y-2 bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/5">
                        <h5 class="font-bold text-on-surface text-[11px] uppercase tracking-wider text-primary">Anamnese / Histórico</h5>
                        <p><strong>Alergias conhecidas:</strong> ${rec.allergies || 'Nenhuma informada'}</p>
                        <p><strong>Usa lentes de contato?</strong> ${rec.wearLenses ? 'Sim' : 'Não'}</p>
                        <p><strong>Problemas oculares/Tricotilomania?</strong> ${rec.ocularIssues ? 'Sim' : 'Não'}</p>
                        <p><strong>Observações de Saúde:</strong> ${rec.healthNotes || 'Nenhuma observação relevante.'}</p>
                    </div>

                    <!-- Mapping visual -->
                    <div class="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/5 space-y-3">
                        <h5 class="font-bold text-on-surface text-[11px] uppercase tracking-wider text-primary">Lash Mapping do Design</h5>
                        <div class="flex items-center justify-center gap-1.5 pt-2">
                            <!-- Quadrantes do olho esquerdo/direito simulação -->
                            <div class="flex border border-primary/20 rounded-lg overflow-hidden text-center font-bold text-[10px] h-8 bg-primary/2" style="background-color: rgba(199, 123, 107, 0.02);">
                                <span class="w-8 py-2 border-r border-primary/20 bg-primary/5 text-primary" style="background-color: rgba(199, 123, 107, 0.05);">${rec.mapQ1 || '8'}</span>
                                <span class="w-8 py-2 border-r border-primary/20">${rec.mapQ2 || '9'}</span>
                                <span class="w-8 py-2 border-r border-primary/20 bg-primary/5 text-primary" style="background-color: rgba(199, 123, 107, 0.05);">${rec.mapQ3 || '10'}</span>
                                <span class="w-8 py-2 border-r border-primary/20">${rec.mapQ4 || '11'}</span>
                                <span class="w-8 py-2 bg-primary/5 text-primary" style="background-color: rgba(199, 123, 107, 0.05);">${rec.mapQ5 || '12'}</span>
                            </div>
                        </div>
                        <div class="flex justify-between text-[9px] text-on-surface-variant/80 px-2">
                            <span>Canto Interno</span>
                            <span>Estilo: ${rec.mappingStyle || 'Gatinho'}</span>
                            <span>Canto Externo</span>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    showFormModal() {
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
        <div class="p-8 max-w-2xl mx-auto">
            <h3 class="font-headline font-bold text-2xl mb-1">Nova Ficha de Anamnese & Lash Mapping</h3>
            <p class="text-on-surface-variant text-sm mb-6">Complete as informações de saúde e o mapeamento dos cílios.</p>
            <form id="record-form" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Cliente</label>
                        <select id="ftc-client" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                            <option value="">Selecione a cliente...</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Estilo do Lash Mapping</label>
                        <select id="ftc-style" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" required>
                            <option value="Boneca">Boneca</option>
                            <option value="Gatinho">Gatinho</option>
                            <option value="Esquilo">Esquilo</option>
                            <option value="Natural">Natural / Clássico</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Curvatura do Fio</label>
                        <input type="text" id="ftc-curvature" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Ex: D, C, L" required />
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Espessura (mm)</label>
                        <input type="text" id="ftc-thickness" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Ex: 0.07" required />
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Técnica Geral</label>
                        <input type="text" id="ftc-technique" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Ex: Volume Russo" required />
                    </div>
                </div>

                <!-- Lash Mapping Quadrantes -->
                <div class="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-3" style="background-color: rgba(199, 123, 107, 0.05);">
                    <h4 class="font-headline font-bold text-sm text-primary flex items-center gap-1">
                        <span class="material-symbols-outlined text-lg">visibility</span>
                        Tamanhos por Quadrante (Canto Interno -> Canto Externo)
                    </h4>
                    <div class="grid grid-cols-5 gap-2.5">
                        <div>
                            <label class="block text-[10px] text-on-surface-variant mb-1 text-center font-bold">Q1</label>
                            <input type="text" id="ftc-q1" class="w-full px-2 py-2 bg-white border-none rounded-lg text-on-surface text-center text-xs" placeholder="8" value="8" required />
                        </div>
                        <div>
                            <label class="block text-[10px] text-on-surface-variant mb-1 text-center font-bold">Q2</label>
                            <input type="text" id="ftc-q2" class="w-full px-2 py-2 bg-white border-none rounded-lg text-on-surface text-center text-xs" placeholder="9" value="9" required />
                        </div>
                        <div>
                            <label class="block text-[10px] text-on-surface-variant mb-1 text-center font-bold">Q3</label>
                            <input type="text" id="ftc-q3" class="w-full px-2 py-2 bg-white border-none rounded-lg text-on-surface text-center text-xs" placeholder="10" value="10" required />
                        </div>
                        <div>
                            <label class="block text-[10px] text-on-surface-variant mb-1 text-center font-bold">Q4</label>
                            <input type="text" id="ftc-q4" class="w-full px-2 py-2 bg-white border-none rounded-lg text-on-surface text-center text-xs" placeholder="11" value="11" required />
                        </div>
                        <div>
                            <label class="block text-[10px] text-on-surface-variant mb-1 text-center font-bold">Q5</label>
                            <input type="text" id="ftc-q5" class="w-full px-2 py-2 bg-white border-none rounded-lg text-on-surface text-center text-xs" placeholder="12" value="12" required />
                        </div>
                    </div>
                </div>

                <!-- Histórico Anamnese Saúde -->
                <div class="space-y-3">
                    <h4 class="font-headline font-bold text-sm text-on-surface">Histórico de Saúde & Sensibilidades</h4>
                    <div class="flex gap-6 text-sm text-on-surface-variant font-medium">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" id="ftc-lenses" class="rounded border-outline-variant text-primary focus:ring-primary/20" />
                            Usa Lentes de Contato
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" id="ftc-ocular" class="rounded border-outline-variant text-primary focus:ring-primary/20" />
                            Sensibilidade Ocular
                        </label>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Alergias Conhecidas</label>
                            <input type="text" id="ftc-allergies" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Ex: Substâncias químicas, adesivos..." />
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Observações Gerais</label>
                            <input type="text" id="ftc-health-notes" class="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Gestante, rinite crônica, etc." />
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                    <button type="button" onclick="App.closeModal()" class="px-6 py-2.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl text-sm transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-2.5 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all text-sm flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">save</span>
                        Registrar Ficha
                    </button>
                </div>
            </form>
        </div>`;
        App.openModal();

        // Populate Clients
        Store.getClients().then(clients => {
            const select = document.getElementById('ftc-client');
            if (select) {
                select.innerHTML = '<option value="">Selecione a cliente...</option>' +
                    clients.map(c => `<option value="${c.id}" data-name="${c.name}">${c.name}</option>`).join('');
            }
        });

        // Submit Form
        document.getElementById('record-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const clientSel = document.getElementById('ftc-client');

            const data = {
                clientId: clientSel.value,
                clientName: clientSel.selectedOptions[0]?.dataset.name || '',
                mappingStyle: document.getElementById('ftc-style').value,
                lashCurvature: document.getElementById('ftc-curvature').value.trim(),
                lashThickness: document.getElementById('ftc-thickness').value.trim(),
                lashTechnique: document.getElementById('ftc-technique').value.trim(),
                mapQ1: document.getElementById('ftc-q1').value.trim(),
                mapQ2: document.getElementById('ftc-q2').value.trim(),
                mapQ3: document.getElementById('ftc-q3').value.trim(),
                mapQ4: document.getElementById('ftc-q4').value.trim(),
                mapQ5: document.getElementById('ftc-q5').value.trim(),
                wearLenses: document.getElementById('ftc-lenses').checked,
                ocularIssues: document.getElementById('ftc-ocular').checked,
                allergies: document.getElementById('ftc-allergies').value.trim(),
                healthNotes: document.getElementById('ftc-health-notes').value.trim()
            };

            try {
                await Store.addTechnicalRecord(data);
                App.closeModal();
                App.showToast("Ficha técnica e Mapping cadastrados com sucesso!", "success");
                await FichaTecnicaPage.loadData();
            } catch (err) {
                console.error("Erro ao registrar ficha técnica:", err);
                App.showToast("Erro ao registrar no banco.", "error");
            }
        });
    },

    async deleteRecord(recordId) {
        if (!confirm("Tem certeza que deseja excluir esta ficha técnica permanentemente?")) return;
        try {
            await Store.deleteTechnicalRecord(recordId);
            App.showToast("Ficha técnica excluída!", "success");
            await FichaTecnicaPage.loadData();
        } catch (err) {
            console.error("Erro ao excluir ficha:", err);
            App.showToast("Falha ao remover a ficha.", "error");
        }
    }
};
