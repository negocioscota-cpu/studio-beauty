// === Settings Page ===
const SettingsPage = {
    isDirty: false,
    savedData: {},
    dayNames: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],

    render() {
        // 1. Horários flexíveis por dia
        const flexRows = this.dayNames.map((d,i) => `
            <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high hover:bg-surface-container transition-colors" data-flex-day="${i}">
                <button type="button" class="day-btn w-12 h-10 rounded-lg text-xs font-bold transition-all ${i<5?'bg-primary/10 text-primary':'bg-surface-container text-on-surface-variant'}" data-day="${i}">${d}</button>
                <input type="time" class="flex-day-start settings-input px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-on-surface w-24 ${i>=5?'opacity-40':''}" value="${i>=5?'09:00':'08:00'}" ${i>=5?'disabled':''}/>
                <span class="text-xs text-on-surface-variant font-bold">até</span>
                <input type="time" class="flex-day-end settings-input px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-on-surface w-24 ${i>=5?'opacity-40':''}" value="${i>=5?'13:00':'18:00'}" ${i>=5?'disabled':''}/>
            </div>`).join('');

        return `
        <div class="max-w-4xl mx-auto space-y-8">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 class="font-headline text-3xl font-extrabold tracking-tight">Configurações</h2>
                    <p class="text-on-surface-variant mt-1">Personalize o sistema da Studiobeauty.</p>
                </div>
                <div id="unsaved-badge" class="hidden items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl animate-pulse">
                    <span class="material-symbols-outlined text-amber-600 text-sm">warning</span>
                    <span class="text-xs font-bold text-amber-700">Alterações não salvas</span>
                </div>
            </div>

            <!-- Profile Section -->
            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-6 flex items-center gap-2"><span class="material-symbols-outlined text-primary">account_circle</span>Perfil da Empresa</h3>
                <div class="space-y-6">
                    <div class="flex items-center gap-6 mb-6">
                        <div id="logo-upload-area" class="relative w-24 h-24 rounded-2xl vitality-gradient flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20 cursor-pointer overflow-hidden group hover:scale-105 transition-transform" title="Clique ou arraste para trocar o logo">
                            <img id="logo-preview" src="" class="hidden absolute inset-0 w-full h-full object-cover" alt="Logo"/>
                            <span id="logo-text" class="z-10">CH</span>
                            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center"><span class="material-symbols-outlined text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity">photo_camera</span></div>
                            <input type="file" id="logo-file-input" accept="image/*" class="hidden"/>
                        </div>
                        <div class="flex-1">
                            <h4 id="company-display-name" class="font-bold text-lg">Sua Empresa</h4>
                            <p class="text-sm text-on-surface-variant mb-2">Clique no ícone para carregar seu logo</p>
                            <div class="flex gap-2">
                                <button onclick="document.getElementById('logo-file-input').click()" class="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"><span class="material-symbols-outlined text-xs">upload</span>Trocar Logo</button>
                                <button id="btn-remove-logo" onclick="SettingsPage.removeLogo()" class="hidden px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"><span class="material-symbols-outlined text-xs">delete</span>Remover</button>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Nome da Empresa</label><input type="text" id="set-company" class="settings-input w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="Nome da empresa"/></div>
                        <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Telefone</label><input type="tel" id="set-phone" class="settings-input w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="(00) 00000-0000" maxlength="15"/></div>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Endereço</label>
                        <div class="relative">
                            <input type="text" id="set-address" class="settings-input w-full px-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface pr-10" placeholder="Comece a digitar o endereço..." autocomplete="off"/>
                            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">location_on</span>
                            <div id="address-suggestions" class="hidden absolute z-50 left-0 right-0 top-full mt-1 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/20 max-h-48 overflow-y-auto"></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">CEP</label><input type="text" id="set-cep" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="00000-000" maxlength="9"/></div>
                        <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Cidade</label><input type="text" id="set-city" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="Cidade"/></div>
                        <div><label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Estado</label><input type="text" id="set-state" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface" placeholder="UF" maxlength="2"/></div>
                    </div>
                </div>
            </div>

            <!-- 1. Horários Flexíveis por Dia -->
            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-primary">schedule</span>Horário de Funcionamento</h3>
                <p class="text-sm text-on-surface-variant mb-6">Defina horários diferentes para cada dia da semana. Clique no dia para ativar/desativar.</p>
                <div class="space-y-2" id="flex-schedule">${flexRows}</div>
                <!-- 2. Intervalo de Almoço -->
                <div class="mt-6 p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl">
                    <div class="flex items-center gap-3 mb-3">
                        <input type="checkbox" id="set-lunch-enabled" class="settings-input w-4 h-4 accent-amber-600" checked/>
                        <label for="set-lunch-enabled" class="font-bold text-sm text-amber-800 flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">lunch_dining</span>Bloqueio de Horário de Almoço</label>
                    </div>
                    <div id="lunch-fields" class="flex items-center gap-3 ml-7">
                        <input type="time" id="set-lunch-start" value="12:00" class="settings-input px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm text-on-surface w-28"/>
                        <span class="text-xs font-bold text-amber-700">até</span>
                        <input type="time" id="set-lunch-end" value="13:00" class="settings-input px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm text-on-surface w-28"/>
                        <span class="text-xs text-amber-600 ml-2">Clientes não poderão agendar neste período</span>
                    </div>
                </div>
            </div>

            <!-- 5. Moeda e Tempo de Serviço -->
            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-6 flex items-center gap-2"><span class="material-symbols-outlined text-primary">payments</span>Moeda e Serviço</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Símbolo da Moeda</label>
                        <select id="set-currency" class="settings-input w-full px-4 py-4 bg-surface-container-high border-none rounded-xl text-on-surface">
                            <option value="R$" selected>R$ — Real Brasileiro</option>
                            <option value="US$">US$ — Dólar Americano</option>
                            <option value="€">€ — Euro</option>
                            <option value="£">£ — Libra Esterlina</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Tempo Médio de Atendimento</label>
                        <div class="flex gap-2">
                            <button type="button" class="duration-btn settings-input flex-1 py-3 rounded-xl text-sm font-bold transition-all" data-dur="30">30 min</button>
                            <button type="button" class="duration-btn settings-input flex-1 py-3 rounded-xl text-sm font-bold transition-all" data-dur="60" data-selected="true">60 min</button>
                            <button type="button" class="duration-btn settings-input flex-1 py-3 rounded-xl text-sm font-bold transition-all" data-dur="90">90 min</button>
                            <button type="button" class="duration-btn settings-input flex-1 py-3 rounded-xl text-sm font-bold transition-all" data-dur="120">120 min</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. Notificações + Personalização de Lembrete -->
            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-6 flex items-center gap-2"><span class="material-symbols-outlined text-primary">notifications</span>Notificações e Lembretes</h3>
                <div class="space-y-4">
                    <label class="flex items-center justify-between p-4 bg-surface-container-high rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
                        <div><p class="font-bold text-on-surface">E-mails de Lembrete</p><p class="text-sm text-on-surface-variant">Lembretes automáticos para clientes antes dos agendamentos</p></div>
                        <input type="checkbox" id="set-email-reminders" checked class="settings-input w-5 h-5 text-primary bg-surface rounded focus:ring-primary"/>
                    </label>
                    <label class="flex items-center justify-between p-4 bg-surface-container-high rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
                        <div><p class="font-bold text-on-surface">Notificações Push</p><p class="text-sm text-on-surface-variant">Receba alertas em tempo real sobre novos agendamentos</p></div>
                        <input type="checkbox" id="set-push-notif" class="settings-input w-5 h-5 text-primary bg-surface rounded focus:ring-primary"/>
                    </label>
                </div>
                <!-- 3. Mensagem personalizada -->
                <div class="mt-6">
                    <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Mensagem de Saudação do Lembrete</label>
                    <textarea id="set-greeting-msg" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface resize-none h-24 text-sm" placeholder="Olá {nome}! Lembrando da sua consulta de {serviço} no dia {data} às {hora}. Esperamos você! 🏥"></textarea>
                    <div class="flex flex-wrap gap-2 mt-2">
                        <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Variáveis:</span>
                        <button onclick="SettingsPage.insertVar('{nome}')" class="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20">{nome}</button>
                        <button onclick="SettingsPage.insertVar('{serviço}')" class="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20">{serviço}</button>
                        <button onclick="SettingsPage.insertVar('{data}')" class="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20">{data}</button>
                        <button onclick="SettingsPage.insertVar('{hora}')" class="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20">{hora}</button>
                        <button onclick="SettingsPage.insertVar('{empresa}')" class="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20">{empresa}</button>
                    </div>
                </div>
            </div>

            <!-- 4. Link de Agendamento Online -->
            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-primary">link</span>Link de Agendamento Online</h3>
                <p class="text-sm text-on-surface-variant mb-6">Compartilhe este link na bio do Instagram, WhatsApp Business ou site para que seus pacientes agendem sozinhos.</p>
                <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    <div class="flex-1 flex items-center bg-surface-container-high rounded-xl overflow-hidden">
                        <span class="px-4 py-4 bg-primary/10 text-primary font-bold text-sm whitespace-nowrap">clientehubclin.web.app/booking/</span>
                        <input type="text" id="set-booking-slug" class="settings-input flex-1 px-3 py-4 bg-transparent border-none text-on-surface font-bold text-sm" placeholder="sua-empresa"/>
                    </div>
                    <button onclick="SettingsPage.copyBookingLink()" class="px-4 py-4 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors" title="Copiar link"><span class="material-symbols-outlined">content_copy</span></button>
                    <button onclick="SettingsPage.shareBookingLink()" class="px-4 py-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors" title="Compartilhar via WhatsApp"><span class="material-symbols-outlined">share</span></button>
                </div>
                <div id="booking-link-preview" class="mt-3 p-3 bg-blue-50 rounded-xl flex items-center gap-2 hidden">
                    <span class="material-symbols-outlined text-blue-600 text-sm">check_circle</span>
                    <span id="booking-full-link" class="text-xs text-blue-700 font-medium"></span>
                </div>
                <!-- QR Code Section -->
                <div class="mt-4 flex flex-col sm:flex-row items-center gap-4 p-4 bg-surface-container-high rounded-xl">
                    <div id="qr-preview" class="w-36 h-36 bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-outline-variant/30 overflow-hidden">
                        <span class="material-symbols-outlined text-3xl text-on-surface-variant/40">qr_code_2</span>
                    </div>
                    <div class="flex-1 text-center sm:text-left">
                        <p class="font-bold text-sm text-on-surface">QR Code de Agendamento</p>
                        <p class="text-xs text-on-surface-variant mb-3">Os pacientes podem escanear para acessar sua agenda.</p>
                        <div class="flex gap-2 justify-center sm:justify-start flex-wrap">
                            <button onclick="SettingsPage.generateQR()" class="px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"><span class="material-symbols-outlined text-sm">qr_code_2</span>Gerar QR Code</button>
                            <button id="btn-download-qr" onclick="SettingsPage.downloadQR()" class="hidden px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"><span class="material-symbols-outlined text-sm">download</span>Baixar PNG</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 5. Minha Assinatura (Asaas) -->
            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-primary">workspace_premium</span>Minha Assinatura</h3>
                <p class="text-sm text-on-surface-variant mb-6">Gerencie seu plano Studiobeauty. Pagamentos processados com segurança via Asaas.</p>

                <!-- Card de status da assinatura -->
                <div id="subscription-status-card" class="p-5 rounded-xl mb-6" style="background: linear-gradient(135deg, rgba(201,124,92,0.1) 0%, rgba(212,175,55,0.08) 100%); border: 1px solid rgba(201,124,92,0.2);">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                            <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Status da Assinatura</p>
                            <div id="sub-status-badge" class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3" style="background: rgba(201,124,92,0.15); color: #7B3F2A;">
                                <span class="w-2 h-2 rounded-full animate-pulse" style="background: #c97c5c;"></span>
                                <span id="sub-status-text">Carregando...</span>
                            </div>
                            <div id="sub-plan-info">
                                <p id="sub-plan-name" class="font-bold text-on-surface text-sm"></p>
                                <p id="sub-plan-detail" class="text-xs text-on-surface-variant mt-0.5"></p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-on-surface-variant mb-1">Próxima cobrança</p>
                            <p id="sub-next-billing" class="font-bold text-on-surface text-sm">—</p>
                        </div>
                    </div>
                    <!-- Barra de progresso do trial -->
                    <div id="sub-trial-bar-container" class="mt-4 hidden">
                        <div class="flex justify-between text-xs text-on-surface-variant mb-1">
                            <span>Dias de teste usados</span>
                            <span id="sub-trial-days-left" class="font-bold" style="color: #c97c5c;"></span>
                        </div>
                        <div class="w-full h-2 rounded-full" style="background: rgba(201,124,92,0.15);">
                            <div id="sub-trial-progress" class="h-2 rounded-full transition-all" style="background: linear-gradient(90deg, #c97c5c, #d4af37); width: 0%;"></div>
                        </div>
                    </div>
                </div>

                <!-- Ações -->
                <div class="flex flex-col sm:flex-row gap-3">
                    <a href="subscribe.html" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all text-white" style="background: linear-gradient(135deg, #c97c5c, #a0522d); box-shadow: 0 4px 12px rgba(201,124,92,0.3);">
                        <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1;">upgrade</span>
                        Mudar Plano
                    </a>
                    <button id="btn-cancel-subscription" onclick="SettingsPage.cancelSubscription()" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                        <span class="material-symbols-outlined text-base">cancel</span>
                        Cancelar Assinatura
                    </button>
                </div>
                <p class="text-xs text-on-surface-variant mt-4 text-center opacity-70">Ao cancelar, você mantém acesso até o fim do período pago. Cancele quando quiser, sem multas.</p>

                <!-- Checkout Online para clientes -->
                <div class="mt-6 pt-6 border-t border-outline-variant/10">
                    <h4 class="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-base" style="font-variation-settings: 'FILL' 1;">point_of_sale</span>
                        Checkout Online para Clientes
                    </h4>
                    <label class="flex items-center justify-between p-4 bg-surface-container-high rounded-xl cursor-pointer hover:bg-surface-container transition-colors mb-4">
                        <div><p class="font-bold text-on-surface">Ativar Checkout Online</p><p class="text-sm text-on-surface-variant">Clientes pagam via Pix ou Boleto ao confirmar o agendamento</p></div>
                        <input type="checkbox" id="set-payment-enabled" class="settings-input w-5 h-5 text-primary bg-surface rounded focus:ring-primary"/>
                    </label>
                    <div>
                        <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Preço por Serviço (R$)</label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl">
                                <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">content_cut</span>
                                <span class="flex-1 font-bold text-sm">Design de Sobrancelha</span>
                                <input type="number" id="price-consulta" class="settings-input w-24 px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-right font-bold" placeholder="0.00" step="0.01" min="0"/>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl">
                                <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">visibility</span>
                                <span class="flex-1 font-bold text-sm">Extensão de Cílios</span>
                                <input type="number" id="price-retorno" class="settings-input w-24 px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-right font-bold" placeholder="0.00" step="0.01" min="0"/>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl">
                                <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">face_retouching_natural</span>
                                <span class="flex-1 font-bold text-sm">Laminação</span>
                                <input type="number" id="price-exame" class="settings-input w-24 px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-right font-bold" placeholder="0.00" step="0.01" min="0"/>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl">
                                <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">spa</span>
                                <span class="flex-1 font-bold text-sm">Outros Procedimentos</span>
                                <input type="number" id="price-procedimento" class="settings-input w-24 px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-right font-bold" placeholder="0.00" step="0.01" min="0"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 6. Dados Fiscais (NFS-e) -->
            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-primary">receipt_long</span>Dados Fiscais (NFS-e)</h3>
                <p class="text-sm text-on-surface-variant mb-6">Configure os dados necessários para emissão de Notas Fiscais de Serviço Eletrônicas.</p>
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">CNPJ</label>
                            <input type="text" id="set-fiscal-cnpj" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface text-sm" placeholder="00.000.000/0000-00" maxlength="18"/>
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Inscrição Municipal</label>
                            <input type="text" id="set-fiscal-insc-municipal" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface text-sm" placeholder="Número da inscrição municipal"/>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">CNAE Principal</label>
                            <input type="text" id="set-fiscal-cnae" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="8630-5/03" maxlength="12"/>
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Código Serviço Padrão</label>
                            <input type="text" id="set-fiscal-service-code" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="0601" value="0601"/>
                        </div>
                        <div>
                            <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Alíquota ISS Padrão (%)</label>
                            <input type="number" id="set-fiscal-iss-rate" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="5" value="5" step="0.01" min="0" max="100"/>
                        </div>
                    </div>
                    <div class="border-t border-outline-variant/10 pt-4">
                        <h4 class="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary text-base">vpn_key</span>
                            Integração Focus NFe
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">API Token Focus NFe</label>
                                <input type="password" id="set-fiscal-api-token" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm" placeholder="Insira seu token da Focus NFe"/>
                                <p class="text-[10px] text-on-surface-variant mt-1">Obtido em: focusnfe.com.br → Credenciais da API</p>
                            </div>
                            <div>
                                <label class="block font-label text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Ambiente</label>
                                <select id="set-fiscal-environment" class="settings-input w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-on-surface text-sm">
                                    <option value="homologacao">🟡 Homologação (Testes)</option>
                                    <option value="producao">🟢 Produção (Real)</option>
                                </select>
                            </div>
                        </div>
                        <div class="mt-3 p-3 bg-amber-50 rounded-xl flex items-start gap-2">
                            <span class="material-symbols-outlined text-amber-600 text-sm mt-0.5">info</span>
                            <p class="text-[11px] text-amber-800">No modo <strong>MVP/Demo</strong>, as notas são simuladas localmente. Para emissão real, configure o token e altere para <strong>Produção</strong>. A integração será feita via Cloud Functions.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Save -->
            <div class="flex justify-end gap-4">
                <button id="btn-discard" onclick="SettingsPage.discard()" class="hidden px-6 py-3 bg-surface-container-high text-on-surface-variant font-bold rounded-xl hover:bg-surface-container transition-colors flex items-center gap-2"><span class="material-symbols-outlined">undo</span>Descartar</button>
                <button onclick="SettingsPage.save()" class="px-8 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2"><span class="material-symbols-outlined">save</span>Salvar Configurações</button>
            </div>
        </div>`;
    },

    async init() {
        // 1. Day buttons → toggle + enable/disable time fields
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const row = btn.closest('[data-flex-day]');
                const isActive = btn.classList.contains('bg-primary/10');
                btn.classList.toggle('bg-primary/10', !isActive);
                btn.classList.toggle('text-primary', !isActive);
                btn.classList.toggle('bg-surface-container', isActive);
                btn.classList.toggle('text-on-surface-variant', isActive);
                row.querySelectorAll('input[type=time]').forEach(inp => { inp.disabled = isActive; inp.classList.toggle('opacity-40', isActive); });
                this.markDirty();
            });
        });
        // Duration btns — use data-selected for reliable detection
        this.applyDurationStyles();
        document.querySelectorAll('.duration-btn').forEach(btn => btn.addEventListener('click', () => {
            document.querySelectorAll('.duration-btn').forEach(b => delete b.dataset.selected);
            btn.dataset.selected = 'true';
            this.applyDurationStyles();
            this.markDirty();
        }));
        // 2. Lunch toggle
        document.getElementById('set-lunch-enabled')?.addEventListener('change', (e) => {
            const fields = document.getElementById('lunch-fields');
            fields.querySelectorAll('input').forEach(i => i.disabled = !e.target.checked);
            fields.classList.toggle('opacity-40', !e.target.checked);
            this.markDirty();
        });
        // Slug → preview
        document.getElementById('set-booking-slug')?.addEventListener('input', (e) => {
            e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'');
            this.updateBookingPreview();
            this.markDirty();
        });
        // Logo, Phone, Address, Dirty
        this.initLogoUpload();
        this.initPhoneMask();
        this.initAddressAutocomplete();
        this.initDirtyTracker();
        this.loadSavedSettings();
    },

    // === Upload de Logo ===
    initLogoUpload() {
        const area = document.getElementById('logo-upload-area'), input = document.getElementById('logo-file-input');
        if (!area || !input) return;
        area.addEventListener('click', (e) => { if (e.target !== input) input.click(); });
        input.addEventListener('change', (e) => { if (e.target.files[0]) this.processLogo(e.target.files[0]); });
        area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('ring-4','ring-primary/40'); });
        area.addEventListener('dragleave', () => area.classList.remove('ring-4','ring-primary/40'));
        area.addEventListener('drop', (e) => { e.preventDefault(); area.classList.remove('ring-4','ring-primary/40'); if (e.dataTransfer.files[0]) this.processLogo(e.dataTransfer.files[0]); });
    },
    processLogo(file) {
        if (!file.type.startsWith('image/')) { App.showToast('Selecione uma imagem.','error'); return; }
        if (file.size > 2*1024*1024) { App.showToast('Máx 2MB.','error'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('logo-preview').src = e.target.result;
            document.getElementById('logo-preview').classList.remove('hidden');
            document.getElementById('logo-text').classList.add('hidden');
            document.getElementById('btn-remove-logo')?.classList.remove('hidden');
            document.getElementById('btn-remove-logo')?.classList.add('flex');
            localStorage.setItem('ch_logo', e.target.result);
            this.markDirty(); App.showToast('Logo atualizado!','success');
        };
        reader.readAsDataURL(file);
    },
    removeLogo() {
        document.getElementById('logo-preview').src = ''; document.getElementById('logo-preview').classList.add('hidden');
        document.getElementById('logo-text').classList.remove('hidden');
        document.getElementById('btn-remove-logo')?.classList.add('hidden');
        localStorage.removeItem('ch_logo'); this.markDirty(); App.showToast('Logo removido.','success');
    },

    // === Máscara Telefone + CEP ===
    initPhoneMask() {
        document.getElementById('set-phone')?.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g,'');
            if (v.length>11) v=v.slice(0,11);
            if (v.length>6) v=`(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
            else if (v.length>2) v=`(${v.slice(0,2)}) ${v.slice(2)}`;
            else if (v.length>0) v=`(${v}`;
            e.target.value=v; this.markDirty();
        });
        document.getElementById('set-cep')?.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g,'');
            if (v.length>8) v=v.slice(0,8);
            if (v.length>5) v=`${v.slice(0,5)}-${v.slice(5)}`;
            e.target.value=v; this.markDirty();
            if (v.replace('-','').length===8) this.lookupCEP(v.replace('-',''));
        });
    },

    // === Autocomplete Endereço ===
    initAddressAutocomplete() {
        const addr = document.getElementById('set-address'); if (!addr) return;
        let debounce;
        addr.addEventListener('input', () => { this.markDirty(); clearTimeout(debounce); debounce = setTimeout(() => this.searchAddress(addr.value), 400); });
        document.addEventListener('click', (e) => { if (!e.target.closest('#set-address, #address-suggestions')) document.getElementById('address-suggestions')?.classList.add('hidden'); });
    },
    async searchAddress(query) {
        const box = document.getElementById('address-suggestions');
        if (!query || query.length<3) { box?.classList.add('hidden'); return; }
        const cepOnly = query.replace(/\D/g,'');
        if (cepOnly.length>=5 && cepOnly.length<=8) {
            try { const r = await fetch(`https://viacep.com.br/ws/${cepOnly.padEnd(8,'0')}/json/`); const d = await r.json();
                if (!d.erro) { box.innerHTML = `<button class="w-full text-left p-3 hover:bg-primary/5 text-sm rounded-lg" onclick="SettingsPage.selectAddress(this)" data-street="${d.logradouro||''}" data-city="${d.localidade||''}" data-state="${d.uf||''}" data-cep="${d.cep||''}"><p class="font-bold">${d.logradouro||query}</p><p class="text-xs text-on-surface-variant">${d.bairro||''}, ${d.localidade} - ${d.uf} • ${d.cep}</p></button>`; box.classList.remove('hidden'); return; }
            } catch(e) {}
        }
        try { const r = await fetch(`https://viacep.com.br/ws/SP/Sao Paulo/${encodeURIComponent(query)}/json/`); const d = await r.json();
            if (Array.isArray(d) && d.length>0) { box.innerHTML = d.slice(0,5).map(i=>`<button class="w-full text-left p-3 hover:bg-primary/5 text-sm" onclick="SettingsPage.selectAddress(this)" data-street="${i.logradouro}" data-city="${i.localidade}" data-state="${i.uf}" data-cep="${i.cep}"><p class="font-bold">${i.logradouro}</p><p class="text-xs text-on-surface-variant">${i.bairro}, ${i.localidade}-${i.uf} • ${i.cep}</p></button>`).join(''); box.classList.remove('hidden'); return; }
        } catch(e) {}
        box.innerHTML = '<p class="p-3 text-xs text-center text-on-surface-variant">Nenhum resultado. Tente o CEP.</p>'; box.classList.remove('hidden');
    },
    selectAddress(btn) { document.getElementById('set-address').value=btn.dataset.street; document.getElementById('set-cep').value=btn.dataset.cep; document.getElementById('set-city').value=btn.dataset.city; document.getElementById('set-state').value=btn.dataset.state; document.getElementById('address-suggestions').classList.add('hidden'); this.markDirty(); },
    async lookupCEP(cep) {
        try { const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`); const d=await r.json();
            if (!d.erro) { document.getElementById('set-address').value=d.logradouro||''; document.getElementById('set-city').value=d.localidade||''; document.getElementById('set-state').value=d.uf||''; App.showToast('Endereço preenchido!','success'); }
        } catch(e) {}
    },

    // === Dirty Tracker ===
    initDirtyTracker() {
        document.querySelectorAll('.settings-input').forEach(input => { input.addEventListener(input.type==='checkbox'?'change':'input', () => this.markDirty()); });
        this._origHashHandler = window.onhashchange;
        window.onhashchange = (e) => { if (this.isDirty) { if (!confirm('⚠️ Alterações não salvas.\nDeseja sair?')) { window.location.hash='#/settings'; return; } this.isDirty=false; } if (this._origHashHandler) this._origHashHandler(e); };
        window.addEventListener('beforeunload', this._beforeUnload);
    },
    _beforeUnload(e) { if (SettingsPage.isDirty) { e.preventDefault(); e.returnValue=''; } },
    markDirty() { this.isDirty=true; document.getElementById('unsaved-badge')?.classList.remove('hidden'); document.getElementById('unsaved-badge')?.classList.add('flex'); document.getElementById('btn-discard')?.classList.remove('hidden'); document.getElementById('btn-discard')?.classList.add('flex'); },
    clearDirty() { this.isDirty=false; document.getElementById('unsaved-badge')?.classList.add('hidden'); document.getElementById('btn-discard')?.classList.add('hidden'); window.removeEventListener('beforeunload', this._beforeUnload); },
    discard() { if (!confirm('Descartar alterações?')) return; this.loadSavedSettings(); this.clearDirty(); App.showToast('Descartado.','info'); },

    // === 3. Inserir variável no textarea ===
    insertVar(v) { const ta = document.getElementById('set-greeting-msg'); if (!ta) return; const s=ta.selectionStart, e=ta.selectionEnd; ta.value = ta.value.substring(0,s)+v+ta.value.substring(e); ta.selectionStart=ta.selectionEnd=s+v.length; ta.focus(); this.markDirty(); },

    // === 4. Booking Link ===
    BOOKING_DOMAIN: 'https://clientehubclin.web.app/booking/',
    getBookingUrl() { return this.BOOKING_DOMAIN + (document.getElementById('set-booking-slug')?.value || ''); },

    updateBookingPreview() {
        const slug = document.getElementById('set-booking-slug')?.value;
        const preview = document.getElementById('booking-link-preview');
        const link = document.getElementById('booking-full-link');
        if (slug) { preview.classList.remove('hidden'); link.textContent = this.getBookingUrl(); }
        else { preview.classList.add('hidden'); }
    },
    copyBookingLink() {
        const slug = document.getElementById('set-booking-slug')?.value;
        if (!slug) { App.showToast('Digite um slug primeiro.','info'); return; }
        navigator.clipboard.writeText(this.getBookingUrl()); App.showToast('Link copiado! ✅','success');
    },
    shareBookingLink() {
        const slug = document.getElementById('set-booking-slug')?.value;
        if (!slug) { App.showToast('Digite um slug primeiro.','info'); return; }
        const msg = `Agende sua consulta! 🏥📅\n${this.getBookingUrl()}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');
    },
    generateQR() {
        const slug = document.getElementById('set-booking-slug')?.value;
        if (!slug) { App.showToast('Digite um slug para gerar o QR Code.','info'); return; }
        const url = this.getBookingUrl();
        try {
            const qr = qrcode(0, 'M');
            qr.addData(url);
            qr.make();
            const container = document.getElementById('qr-preview');
            container.innerHTML = qr.createImgTag(5, 12);
            container.querySelector('img').style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:8px;';
            container.classList.remove('border-dashed','border-2');
            document.getElementById('btn-download-qr')?.classList.remove('hidden');
            document.getElementById('btn-download-qr')?.classList.add('flex');
            App.showToast('QR Code gerado com sucesso! ✅','success');
        } catch(e) { console.error('QR error:', e); App.showToast('Erro ao gerar QR Code.','error'); }
    },
    downloadQR() {
        const img = document.querySelector('#qr-preview img');
        if (!img) { App.showToast('Gere o QR Code primeiro.','info'); return; }
        const canvas = document.createElement('canvas');
        canvas.width = 400; canvas.height = 400;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 400);
        const tmpImg = new Image();
        tmpImg.onload = () => {
            ctx.drawImage(tmpImg, 20, 20, 360, 360);
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillStyle = '#0d7377';
            ctx.textAlign = 'center';
            const a = document.createElement('a');
            a.download = 'clientehubclin-qrcode.png';
            a.href = canvas.toDataURL('image/png');
            a.click();
            App.showToast('QR Code baixado! 📥','success');
        };
        tmpImg.src = img.src;
    },

    // === Load / Save ===
    loadSavedSettings() {
        const s = JSON.parse(localStorage.getItem('ch_settings')||'{}');
        if (s.company) { document.getElementById('set-company').value=s.company; document.getElementById('company-display-name').textContent=s.company; }
        if (s.phone) document.getElementById('set-phone').value=s.phone;
        if (s.address) document.getElementById('set-address').value=s.address;
        if (s.cep) document.getElementById('set-cep').value=s.cep;
        if (s.city) document.getElementById('set-city').value=s.city;
        if (s.state) document.getElementById('set-state').value=s.state;
        if (s.greetingMsg) document.getElementById('set-greeting-msg').value=s.greetingMsg;
        if (s.bookingSlug) { document.getElementById('set-booking-slug').value=s.bookingSlug; this.updateBookingPreview(); }
        // Pagamentos
        if (s.paymentEnabled) document.getElementById('set-payment-enabled').checked=true;
        if (s.servicePrices) {
            if (s.servicePrices['Consulta']) document.getElementById('price-consulta').value=s.servicePrices['Consulta'];
            if (s.servicePrices['Retorno']) document.getElementById('price-retorno').value=s.servicePrices['Retorno'];
            if (s.servicePrices['Exame']) document.getElementById('price-exame').value=s.servicePrices['Exame'];
            if (s.servicePrices['Procedimento']) document.getElementById('price-procedimento').value=s.servicePrices['Procedimento'];
        }
        // Carregar dados da assinatura Asaas
        this.loadSubscriptionStatus();
        if (s.currency) document.getElementById('set-currency').value=s.currency;
        if (s.lunchStart) document.getElementById('set-lunch-start').value=s.lunchStart;
        if (s.lunchEnd) document.getElementById('set-lunch-end').value=s.lunchEnd;
        if (s.lunchEnabled===false) { document.getElementById('set-lunch-enabled').checked=false; document.getElementById('lunch-fields')?.classList.add('opacity-40'); }
        if (s.duration) { document.querySelectorAll('.duration-btn').forEach(b => delete b.dataset.selected); const durBtn = document.querySelector(`.duration-btn[data-dur="${s.duration}"]`); if (durBtn) durBtn.dataset.selected = 'true'; this.applyDurationStyles(); }
        if (s.flexSchedule) { s.flexSchedule.forEach((fs,i) => { const row=document.querySelector(`[data-flex-day="${i}"]`); if(!row)return; const btn=row.querySelector('.day-btn'); const [start,end]=row.querySelectorAll('input[type=time]'); if(fs.active) { btn.classList.add('bg-primary/10','text-primary'); btn.classList.remove('bg-surface-container','text-on-surface-variant'); start.disabled=false; end.disabled=false; start.classList.remove('opacity-40'); end.classList.remove('opacity-40'); } else { btn.classList.remove('bg-primary/10','text-primary'); btn.classList.add('bg-surface-container','text-on-surface-variant'); start.disabled=true; end.disabled=true; start.classList.add('opacity-40'); end.classList.add('opacity-40'); } start.value=fs.start||'08:00'; end.value=fs.end||'18:00'; }); }
        // Dados Fiscais
        if (s.fiscalCnpj) document.getElementById('set-fiscal-cnpj').value=s.fiscalCnpj;
        if (s.fiscalInscMunicipal) document.getElementById('set-fiscal-insc-municipal').value=s.fiscalInscMunicipal;
        if (s.fiscalCnae) document.getElementById('set-fiscal-cnae').value=s.fiscalCnae;
        if (s.fiscalServiceCode) document.getElementById('set-fiscal-service-code').value=s.fiscalServiceCode;
        if (s.fiscalIssRate) document.getElementById('set-fiscal-iss-rate').value=s.fiscalIssRate;
        if (s.fiscalApiToken) document.getElementById('set-fiscal-api-token').value=s.fiscalApiToken;
        if (s.fiscalEnvironment) document.getElementById('set-fiscal-environment').value=s.fiscalEnvironment;
        const logo = localStorage.getItem('ch_logo');
        if (logo) { const p=document.getElementById('logo-preview'); if(p){p.src=logo;p.classList.remove('hidden');document.getElementById('logo-text')?.classList.add('hidden');document.getElementById('btn-remove-logo')?.classList.remove('hidden');document.getElementById('btn-remove-logo')?.classList.add('flex');} }
        // Sempre aplicar estilos dos botões de duração ao final
        this.applyDurationStyles();
    },

    async save() {
        const flexSchedule = [];
        document.querySelectorAll('[data-flex-day]').forEach((row,i) => {
            const btn = row.querySelector('.day-btn');
            const [start,end] = row.querySelectorAll('input[type=time]');
            flexSchedule.push({ day: i, active: btn.classList.contains('bg-primary/10'), start: start.value, end: end.value });
        });
        const settings = {
            company: document.getElementById('set-company')?.value||'',
            phone: document.getElementById('set-phone')?.value||'',
            address: document.getElementById('set-address')?.value||'',
            cep: document.getElementById('set-cep')?.value||'',
            city: document.getElementById('set-city')?.value||'',
            state: document.getElementById('set-state')?.value||'',
            flexSchedule,
            lunchEnabled: document.getElementById('set-lunch-enabled')?.checked??true,
            lunchStart: document.getElementById('set-lunch-start')?.value||'12:00',
            lunchEnd: document.getElementById('set-lunch-end')?.value||'13:00',
            currency: document.getElementById('set-currency')?.value||'R$',
            duration: document.querySelector('.duration-btn[data-selected]')?.dataset.dur||'60',
            greetingMsg: document.getElementById('set-greeting-msg')?.value||'',
            bookingSlug: document.getElementById('set-booking-slug')?.value||'',
            paymentEnabled: document.getElementById('set-payment-enabled')?.checked||false,
            servicePrices: {
                'Consulta': parseFloat(document.getElementById('price-consulta')?.value)||0,
                'Retorno': parseFloat(document.getElementById('price-retorno')?.value)||0,
                'Exame': parseFloat(document.getElementById('price-exame')?.value)||0,
                'Procedimento': parseFloat(document.getElementById('price-procedimento')?.value)||0
            },
            // Dados Fiscais
            fiscalCnpj: document.getElementById('set-fiscal-cnpj')?.value||'',
            fiscalInscMunicipal: document.getElementById('set-fiscal-insc-municipal')?.value||'',
            fiscalCnae: document.getElementById('set-fiscal-cnae')?.value||'',
            fiscalServiceCode: document.getElementById('set-fiscal-service-code')?.value||'0601',
            fiscalIssRate: parseFloat(document.getElementById('set-fiscal-iss-rate')?.value)||5,
            fiscalApiToken: document.getElementById('set-fiscal-api-token')?.value||'',
            fiscalEnvironment: document.getElementById('set-fiscal-environment')?.value||'homologacao'
        };
        localStorage.setItem('ch_settings', JSON.stringify(settings));
        if (settings.company) document.getElementById('company-display-name').textContent = settings.company;

        // Salvar booking link no Firestore para a página pública funcionar
        if (settings.bookingSlug && auth.currentUser) {
            try {
                await db.collection('bookingLinks').doc(auth.currentUser.uid).set({
                    slug: settings.bookingSlug,
                    uid: auth.currentUser.uid,
                    settings: {
                        company: settings.company,
                        flexSchedule: settings.flexSchedule,
                        lunchEnabled: settings.lunchEnabled,
                        lunchStart: settings.lunchStart,
                        lunchEnd: settings.lunchEnd,
                        duration: settings.duration,
                        paymentEnabled: settings.paymentEnabled,
                        servicePrices: settings.servicePrices
                    },
                    mpAccessToken: settings.mpAccessToken || '',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch(e) { console.warn('Erro ao salvar booking link:', e); }
        }

        this.clearDirty();
        App.showToast('Configurações salvas com sucesso! ✅','success');
    },

    // === Aplicar estilos visuais nos botões de duração ===
    applyDurationStyles() {
        document.querySelectorAll('.duration-btn').forEach(btn => {
            if (btn.dataset.selected === 'true') {
                btn.style.backgroundColor = '#0d7377';
                btn.style.color = '#ffffff';
                btn.style.boxShadow = '0 4px 12px rgba(13, 115, 119, 0.3)';
                btn.style.transform = 'scale(1.02)';
            } else {
                btn.style.backgroundColor = '';
                btn.style.color = '';
                btn.style.boxShadow = '';
                btn.style.transform = '';
                btn.classList.add('bg-surface-container-high', 'text-on-surface-variant');
            }
        });
    },

    // === Assinatura Asaas ===
    async loadSubscriptionStatus() {
        const badge = document.getElementById('sub-status-badge');
        const statusText = document.getElementById('sub-status-text');
        const planName = document.getElementById('sub-plan-name');
        const planDetail = document.getElementById('sub-plan-detail');
        const nextBilling = document.getElementById('sub-next-billing');
        const trialBar = document.getElementById('sub-trial-bar-container');
        const trialDaysLeft = document.getElementById('sub-trial-days-left');
        const trialProgress = document.getElementById('sub-trial-progress');

        if (!auth.currentUser) return;

        try {
            const doc = await db.collection('companies').doc(auth.currentUser.uid).get();
            if (!doc.exists) return;
            const data = doc.data();

            const asaasStatus = data.asaasStatus; // ACTIVE | OVERDUE | CANCELLED
            const status = data.status;            // trial | active | blocked | overdue
            const plan = data.plan || 'Essencial';
            const now = new Date();

            const planLabels = {
                essential: 'Plano Essencial — R$ 49,90/mês',
                professional: 'Plano Profissional — R$ 89,90/mês',
                clinic: 'Plano Clínica — R$ 149,90/mês',
                free: 'Período de Teste (Trial)',
            };

            // Status badge
            const statusMap = {
                'ACTIVE': { text: '✅ Ativo', bg: 'rgba(34,197,94,0.15)', color: '#15803d' },
                'OVERDUE': { text: '⚠️ Pagamento em Atraso', bg: 'rgba(245,158,11,0.15)', color: '#b45309' },
                'CANCELLED': { text: '❌ Cancelado', bg: 'rgba(239,68,68,0.15)', color: '#dc2626' },
                'trial': { text: '⏳ Período de Teste', bg: 'rgba(201,124,92,0.15)', color: '#7B3F2A' },
            };

            let currentStatus;
            if (asaasStatus && statusMap[asaasStatus]) currentStatus = statusMap[asaasStatus];
            else if (status === 'trial') currentStatus = statusMap['trial'];
            else currentStatus = { text: '— Sem Assinatura', bg: 'rgba(107,114,128,0.1)', color: '#6b7280' };

            if (badge) { badge.style.background = currentStatus.bg; badge.style.color = currentStatus.color; }
            if (statusText) statusText.textContent = currentStatus.text;
            if (planName) planName.textContent = planLabels[plan] || `Plano ${plan}`;

            // Próxima cobrança
            if (data.subscriptionExpiresAt && nextBilling) {
                const exp = data.subscriptionExpiresAt.toDate();
                nextBilling.textContent = exp.toLocaleDateString('pt-BR');
                if (planDetail) planDetail.textContent = 'Renovação automática via Asaas';
            } else if (nextBilling) {
                nextBilling.textContent = '—';
            }

            // Barra de trial
            if (!asaasStatus && (status === 'trial' || !status)) {
                const trialStart = data.createdAt ? data.createdAt.toDate() : now;
                const trialEnd = data.trialEndsAt ? data.trialEndsAt.toDate() : new Date(trialStart.getTime() + 14 * 86400000);
                const totalDays = 14;
                const usedDays = Math.max(0, Math.min(totalDays, Math.floor((now - trialStart) / 86400000)));
                const remaining = Math.max(0, totalDays - usedDays);
                const pct = Math.min(100, (usedDays / totalDays) * 100);

                if (trialBar) trialBar.classList.remove('hidden');
                if (trialDaysLeft) trialDaysLeft.textContent = `${remaining} dia${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}`;
                if (trialProgress) trialProgress.style.width = `${pct}%`;
                if (planDetail) planDetail.textContent = `Trial termina em ${trialEnd.toLocaleDateString('pt-BR')}`;
                if (planName) planName.textContent = 'Período de Avaliação Gratuita (14 dias)';
            }

        } catch(e) {
            console.warn('Erro ao carregar status da assinatura:', e);
            if (statusText) statusText.textContent = 'Erro ao carregar';
        }
    },

    async cancelSubscription() {
        if (!confirm('⚠️ Confirmar cancelamento?\n\nVocê continuará com acesso até o fim do período pago. Após o vencimento, o acesso será encerrado.')) return;

        const btn = document.getElementById('btn-cancel-subscription');
        if (btn) { btn.disabled = true; btn.textContent = 'Cancelando...'; }

        try {
            const cancelFn = firebase.functions().httpsCallable('cancelAsaasSubscription');
            const result = await cancelFn({});
            if (result.data.success) {
                App.showToast('Assinatura cancelada. Você mantém acesso até o vencimento. 😔', 'info');
                await this.loadSubscriptionStatus();
            } else {
                throw new Error(result.data.error || 'Falha no cancelamento');
            }
        } catch(e) {
            console.error('Erro ao cancelar:', e);
            App.showToast('Erro ao cancelar assinatura. Tente novamente ou entre em contato.', 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-symbols-outlined text-base">cancel</span> Cancelar Assinatura'; }
        }
    }
};
