// === CONFIGURAÇÕES DO ESTÚDIO ===
const Settings = {
    _saving: false,

    async render(container) {
        container.innerHTML = `<div style="display:flex;justify-content:center;padding:48px"><div class="spinner"></div></div>`;

        // Carregar dados em paralelo
        let studioData = {};
        let smsTemplatesData = {};
        let emailTemplatesData = {};
        let paymentConfig = { enabled: false, apiKey: '', environment: 'sandbox', cancellationPolicy: '' };
        let focusNfeConfig = { enabled: false, token: '', environment: 'sandbox', defaultCnae: '', defaultServiceDescription: '', issRate: 2.0, taxRegime: '1' };
        let commConfig = {
            email: { sentThisMonth: 0, limit: 1000, lastResetDate: new Date().toISOString() },
            sms: { creditsBalance: 0 }
        };

        try {
            const sd = await firebase.firestore().collection('studioConfig').doc(Store._uid()).get().catch(() => null);
            if (sd && sd.exists) {
                studioData = sd.data();
                if (studioData.asaasPaymentConfig) paymentConfig = { ...paymentConfig, ...studioData.asaasPaymentConfig };
                if (studioData.focusNfeConfig) focusNfeConfig = { ...focusNfeConfig, ...studioData.focusNfeConfig };
                if (studioData.communication) commConfig = { ...commConfig, ...studioData.communication };
                if (studioData.smsTemplates) smsTemplatesData = studioData.smsTemplates;
                if (studioData.emailTemplates) emailTemplatesData = studioData.emailTemplates;
            }
        } catch(e) {}

        container.innerHTML = Settings._buildHTML(studioData, paymentConfig, focusNfeConfig, commConfig, smsTemplatesData, emailTemplatesData);
        Settings._bindEvents();
    },

    _buildHTML(sd, pc, fnc, cc, smsT, emailT) {
        const plan = sd.plan || 'solo';
        const planLimits = { solo: 1000, studio: 3000, premium: 10000 };
        const emailLimit = cc?.email?.limit || planLimits[plan] || 1000;
        const emailSent = cc?.email?.sentThisMonth || 0;
        const emailPct = Math.min(100, Math.round((emailSent / emailLimit) * 100));
        const smsBalance = cc?.sms?.creditsBalance || 0;
        const cs = sd.communicationSettings || { emailEnabled: false, smsEnabled: false };

        return `
        <div style="max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:20px">

          <!-- Header -->
          <div class="card" style="background:linear-gradient(135deg,#1a0a1e 0%,#2d1040 50%,#1a0a1e 100%)">
            <div class="card-body" style="padding:28px;display:flex;align-items:center;gap:16px">
              <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">⚙️</div>
              <div>
                <h2 style="font-size:1.3rem;font-weight:700;color:white">Configurações do Estúdio</h2>
                <p style="font-size:0.85rem;color:var(--text-muted);margin-top:2px">Personalize o sistema para o seu negócio</p>
              </div>
            </div>
          </div>

          <!-- Dados do Estúdio -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">🏪 Dados do Estúdio</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
              <div class="form-group">
                <label class="form-label">Nome do Estúdio</label>
                <input type="text" class="form-input" id="cfg-studio-name"
                  value="${sd.studioName || ''}" placeholder="Ex: Studio Beauty by Ana">
              </div>
              <div class="form-group">
                <label class="form-label">Telefone / WhatsApp do Estúdio</label>
                <input type="tel" class="form-input" id="cfg-studio-phone"
                  value="${sd.studioPhone || ''}" placeholder="(11) 99999-9999">
              </div>
              <div class="form-group">
                <label class="form-label">Cidade / Estado</label>
                <input type="text" class="form-input" id="cfg-studio-city"
                  value="${sd.studioCity || ''}" placeholder="São Paulo, SP">
              </div>
              <div class="form-group">
                <label class="form-label">Instagram (sem @)</label>
                <input type="text" class="form-input" id="cfg-studio-instagram"
                  value="${sd.instagram || ''}" placeholder="seuestudio">
              </div>
              <button class="btn btn-primary" onclick="Settings.saveStudio()" id="btn-save-studio">
                <span class="material-symbols-outlined">save</span> Salvar Dados do Estúdio
              </button>
            </div>
          </div>

          <!-- Link de Avaliação Padrão -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">⭐ Link de Avaliação NPS</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
              <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5">
                Compartilhe este link com suas clientes para coletar avaliações do estúdio de forma geral.
                Para links vinculados a agendamentos (com rastreamento), use os botões na <strong>Agenda</strong>.
              </p>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <input type="text" class="form-input" id="cfg-review-link"
                  value="${location.origin}/avaliacao.html?studio=${Store._uid()}"
                  readonly style="flex:1;font-size:0.8rem;color:var(--text-muted)">
                <button class="btn btn-outline" onclick="Settings.copyReviewLink()" style="white-space:nowrap">
                  <span class="material-symbols-outlined">content_copy</span> Copiar
                </button>
                <button class="btn btn-outline" onclick="Settings.shareReviewWhatsApp()" style="white-space:nowrap">
                  <span style="font-size:1rem">📲</span> WhatsApp
                </button>
              </div>
            </div>
          </div>

          <!-- Mensagens Pós-Atendimento -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">📲 Mensagens Pós-Atendimento</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
              <div style="background:rgba(37,211,102,0.08);border:1px solid rgba(37,211,102,0.2);border-radius:12px;padding:16px">
                <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5">
                  📲 Ao concluir um atendimento, o sistema sugere enviar orientações de cuidados pós-procedimento para a cliente via WhatsApp.
                </p>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between">
                <label style="font-weight:700;font-size:0.92rem;color:var(--text-primary)">Ativar mensagens pós-atendimento</label>
                <label class="switch" style="position:relative;display:inline-block;width:48px;height:26px">
                  <input type="checkbox" id="cfg-aftercare-enabled" ${sd.aftercareEnabled !== false ? 'checked' : ''}
                    style="opacity:0;width:0;height:0">
                  <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:${sd.aftercareEnabled !== false ? '#25D366' : 'rgba(255,255,255,0.15)'};border-radius:26px;transition:0.3s" onclick="this.previousElementSibling.click();this.style.background=this.previousElementSibling.checked?'#25D366':'rgba(255,255,255,0.15)';const dot=this.querySelector('span');if(dot)dot.style.transform=this.previousElementSibling.checked?'translateX(22px)':'translateX(0)'">
                    <span style="position:absolute;content:'';height:20px;width:20px;left:3px;bottom:3px;background:white;border-radius:50%;transition:0.3s;transform:${sd.aftercareEnabled !== false ? 'translateX(22px)' : 'translateX(0)'}"></span>
                  </span>
                </label>
              </div>
              <div style="display:flex;flex-direction:column;gap:14px" id="aftercare-templates-list">
                ${['Extensão de Cílios','Lifting de Cílios','Design de Sobrancelhas','Micropigmentação','Henna de Sobrancelhas','Brow Lamination'].map(proc => {
                  const customVal = sd.aftercareTemplates && sd.aftercareTemplates[proc] ? sd.aftercareTemplates[proc] : '';
                  const defaultVal = (typeof WA !== 'undefined' && WA.AFTERCARE_DEFAULTS && WA.AFTERCARE_DEFAULTS[proc]) || '';
                  const displayVal = customVal || defaultVal;
                  return `<div style="border:1px solid var(--border);border-radius:10px;padding:14px;background:rgba(255,255,255,0.03)">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                      <span style="font-weight:600;font-size:0.85rem;color:var(--text-primary)">${proc}</span>
                      <button class="btn btn-ghost btn-sm" style="font-size:0.72rem;color:var(--text-muted)" onclick="Settings.resetAftercareTemplate('${proc}')" title="Restaurar padrão">🔄 Restaurar padrão</button>
                    </div>
                    <textarea class="form-input aftercare-tpl" data-procedure="${proc}" rows="5" style="font-size:0.8rem;line-height:1.5;resize:vertical">${displayVal.replace(/`/g,'\`')}</textarea>
                  </div>`;
                }).join('')}
              </div>
              <button class="btn btn-primary" onclick="Settings.saveAftercare()" id="btn-save-aftercare">
                <span class="material-symbols-outlined">save</span> Salvar Mensagens
              </button>
            </div>
          </div>

          <!-- Templates de Mensagens WhatsApp -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">✉️ Templates de Mensagens WhatsApp</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
              <div style="background:rgba(37,211,102,0.08);border:1px solid rgba(37,211,102,0.2);border-radius:12px;padding:16px">
                <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5">
                  ✉️ Personalize as mensagens que o sistema envia automaticamente via WhatsApp. Use <b>{nome}</b> para o nome da cliente, <b>{procedimento}</b> para o procedimento, <b>{data}</b> para a data, <b>{horario}</b> para o horário, <b>{recompensa}</b> para o prêmio de fidelidade e <b>{visitas}</b> para número de visitas.
                </p>
              </div>

              ${[
                { key: 'confirmation', label: '✨ Confirmação de Agendamento', defaultText: `✨ *Confirmação de Agendamento — {studio}*\n\nOlá, *{nome}*! 💕\n\nSeu agendamento está confirmado:\n📅 *Data:* {data}\n⏰ *Horário:* {horario}\n💅 *Procedimento:* {procedimento}\n\nPor favor, confirme sua presença respondendo *SIM* a esta mensagem.\n\nQualquer dúvida, estou à disposição! 😊\n✨ *Studio Beauty*` },
                { key: 'reminder', label: '🔔 Lembrete D-1', defaultText: `🔔 *Lembrete — {studio}*\n\nOlá, *{nome}*! 💕\n\nLembrando do seu agendamento *amanhã*:\n⏰ *Horário:* {horario}\n💅 *Procedimento:* {procedimento}\n\nPor favor, confirme sua presença respondendo *SIM*.\nAté amanhã! 😊\n✨ *Studio Beauty*` },
                { key: 'review', label: '⭐ Solicitação de Avaliação', defaultText: `⭐ *Avalie seu atendimento — {studio}*\n\nOlá, *{nome}*! 💕\n\nAdoramos te receber! Que tal deixar uma avaliação rápida?\n\n👇 Clique no link abaixo (leva menos de 1 minuto):\n{link}\n\nSua opinião é muito importante para nós! 😊💕\n✨ *Studio Beauty*` },
                { key: 'winback', label: '💕 Reconquista de Inativas', defaultText: `💕 *Sentimos sua falta, {nome}!*\n\n_{studio}_\n\nFaz um tempinho que não nos vemos e gostaríamos muito de te receber novamente! 😊\n\n📲 Responda essa mensagem para agendar seu horário com *condições especiais de retorno*!\n\nTe esperamos de volta! 💖\n✨ *Studio Beauty*` },
                { key: 'loyalty', label: '🎉 Brinde de Fidelidade', defaultText: `🎉 *Parabéns, {nome}!* 💕\n\nVocê atingiu *{visitas} atendimentos* no *{studio}* e ganhou:\n🎁 *{recompensa}*\n\nAgende seu próximo horário e venha resgatar seu presente!\nObrigada pela sua fidelidade! 💖\n✨ *Studio Beauty*` }
              ].map(t => {
                const customVal = sd.whatsappTemplates && sd.whatsappTemplates[t.key] ? sd.whatsappTemplates[t.key] : '';
                const displayVal = customVal || t.defaultText;
                return `<div style="border:1px solid var(--border);border-radius:10px;padding:14px;background:rgba(255,255,255,0.03)">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                    <span style="font-weight:600;font-size:0.85rem;color:var(--text-primary)">${t.label}</span>
                    <button class="btn btn-ghost btn-sm" style="font-size:0.72rem;color:var(--text-muted)" onclick="Settings.resetWhatsAppTemplate('${t.key}')" title="Restaurar padrão">🔄 Restaurar padrão</button>
                  </div>
                  <textarea class="form-input wa-template" data-template="${t.key}" rows="6" style="font-size:0.8rem;line-height:1.5;resize:vertical">${displayVal.replace(/`/g,'\\`')}</textarea>
                </div>`;
              }).join('')}

              <button class="btn btn-primary" onclick="Settings.saveWhatsAppTemplates()" id="btn-save-wa-templates">
                <span class="material-symbols-outlined">save</span> Salvar Templates
              </button>
            </div>
          </div>

          <!-- Templates de Mensagens SMS -->
          <div class="card">
            <div class="card-header" style="background:linear-gradient(135deg,#0d2818,#1a4d2e);color:white;display:flex;align-items:center;gap:10px">
              <span class="material-symbols-outlined" style="color:#4ade80">sms</span>
              <span class="card-title" style="color:white;margin:0">Mensagens SMS Automáticas</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
              <div style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);border-radius:12px;padding:16px">
                <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5">
                  💬 Personalize os textos de SMS enviados automaticamente pelo sistema. O SMS é mais curto que o WhatsApp — use textos objetivos e diretos.
                  Variáveis disponíveis: <b>{nome}</b>, <b>{procedimento}</b>, <b>{data}</b>, <b>{horario}</b>, <b>{studio}</b>, <b>{recompensa}</b>, <b>{visitas}</b>.
                </p>
                <p style="font-size:0.75rem;color:var(--text-muted);margin-top:8px">⚠️ Cada SMS tem limite de ~160 caracteres por segmento. Mensagens maiores serão enviadas em múltiplos segmentos (consome mais créditos).</p>
              </div>

              ${Settings._buildSmsCardsHTML(smsT)}

              <button class="btn btn-primary" onclick="Settings.saveSmsTemplates()" id="btn-save-sms-templates">
                <span class="material-symbols-outlined">save</span> Salvar Templates de SMS
              </button>
            </div>
          </div>

          <!-- Templates de E-mail -->
          <div class="card">
            <div class="card-header" style="background:linear-gradient(135deg,#1a1040,#2d1557);color:white;display:flex;align-items:center;gap:10px">
              <span class="material-symbols-outlined" style="color:#a78bfa">mail</span>
              <span class="card-title" style="color:white;margin:0">Mensagens de E-mail Automáticas</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
              <div style="background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.15);border-radius:12px;padding:16px">
                <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5">
                  📧 Personalize o corpo dos e-mails automáticos. O sistema aplica automaticamente o layout visual premium do seu estúdio (cabeçalho, cores e rodapé).
                  Variáveis disponíveis: <b>{nome}</b>, <b>{procedimento}</b>, <b>{data}</b>, <b>{horario}</b>, <b>{studio}</b>, <b>{recompensa}</b>, <b>{visitas}</b>, <b>{link}</b>.
                </p>
                <p style="font-size:0.75rem;color:var(--text-muted);margin-top:8px">💡 Dica: use quebras de linha para organizar o texto. O sistema converte automaticamente para o formato de e-mail.</p>
              </div>

              ${Settings._buildEmailCardsHTML(emailT)}

              <button class="btn btn-primary" onclick="Settings.saveEmailTemplates()" id="btn-save-email-templates">
                <span class="material-symbols-outlined">save</span> Salvar Templates de E-mail
              </button>
            </div>
          </div>

          <!-- E-mail Personalizado (redação livre) -->
          <div class="card">
            <div class="card-header" style="background:linear-gradient(135deg,#1e0533,#3b0764);color:white;display:flex;align-items:center;gap:10px">
              <span class="material-symbols-outlined" style="color:#c084fc">edit_note</span>
              <span class="card-title" style="color:white;margin:0">E-mail Personalizado</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
              <div style="background:rgba(192,132,252,0.06);border:1px solid rgba(192,132,252,0.15);border-radius:12px;padding:16px">
                <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5">
                  ✍️ Redija e-mails livres para grupos específicos de clientes. Ideal para promoções, comunicados, novidades do studio ou mensagens sazonais.
                  O sistema aplica automaticamente o layout visual premium com o nome do seu estúdio.
                </p>
              </div>

              <!-- Seletor de Grupo -->
              <div>
                <label style="font-weight:700;font-size:0.85rem;color:var(--text-primary);display:block;margin-bottom:8px">
                  📋 Enviar para:
                </label>
                <select class="form-input" id="custom-email-group" style="font-size:0.88rem" onchange="Settings._loadCustomEmailRecipients()">
                  <option value="all">👥 Todos os clientes com e-mail</option>
                  <option value="upcoming">📅 Clientes com agendamento nos próximos 7 dias</option>
                  <option value="inactive">😴 Clientes inativas (+45 dias sem atendimento)</option>
                  <option value="birthday">🎂 Aniversariantes do mês</option>
                  <option value="loyalty">🎁 Clientes com fidelidade ativa</option>
                </select>
                <div id="custom-email-recipients-info" style="margin-top:8px;font-size:0.78rem;color:var(--text-muted);display:flex;align-items:center;gap:6px">
                  <span class="material-symbols-outlined" style="font-size:16px">info</span>
                  Selecione um grupo para ver a quantidade de destinatários.
                </div>
              </div>

              <!-- Assunto -->
              <div>
                <label style="font-weight:700;font-size:0.85rem;color:var(--text-primary);display:block;margin-bottom:8px">
                  📌 Assunto do E-mail:
                </label>
                <input class="form-input" id="custom-email-subject" type="text" placeholder="Ex: Novidades de Junho no seu Studio ✨" style="font-size:0.88rem"/>
              </div>

              <!-- Corpo do E-mail -->
              <div>
                <label style="font-weight:700;font-size:0.85rem;color:var(--text-primary);display:block;margin-bottom:8px">
                  ✉️ Corpo do E-mail:
                </label>
                <textarea class="form-input" id="custom-email-body" rows="10" style="font-size:0.85rem;line-height:1.6;resize:vertical" placeholder="Escreva aqui a sua mensagem...&#10;&#10;Use quebras de linha para organizar o texto.&#10;O sistema aplica o layout premium automaticamente.&#10;&#10;Dica: use {nome} para personalizar com o nome da cliente." oninput="document.getElementById('custom-email-char-count').textContent=this.value.length+' caracteres'"></textarea>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
                  <span style="font-size:0.72rem;color:var(--text-muted)">💡 Variável disponível: <b>{nome}</b> (nome da cliente)</span>
                  <span id="custom-email-char-count" style="font-size:0.72rem;color:var(--text-muted)">0 caracteres</span>
                </div>
              </div>

              <!-- Progresso de envio -->
              <div id="custom-email-progress" style="display:none">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.82rem">
                  <span style="color:var(--text-secondary)">Enviando e-mails...</span>
                  <strong id="custom-email-progress-text" style="color:var(--gold)">0/0</strong>
                </div>
                <div style="height:8px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden">
                  <div id="custom-email-progress-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#c084fc,var(--primary));border-radius:99px;transition:width 0.3s"></div>
                </div>
              </div>

              <!-- Botão Enviar -->
              <button class="btn btn-primary" id="btn-send-custom-email" onclick="Settings.sendCustomEmail()" style="background:linear-gradient(135deg,#7c3aed,#5b21b6);box-shadow:0 4px 16px rgba(124,58,237,0.3)">
                <span class="material-symbols-outlined">send</span> Enviar E-mail para o Grupo Selecionado
              </button>
            </div>
          </div>

          <!-- Central de Comunicação (E-mail & SMS) -->
          <div class="card">
            <div class="card-header" style="background:linear-gradient(135deg,#0d1f2d,#1d3557);color:white;display:flex;align-items:center;gap:10px">
              <span class="material-symbols-outlined" style="color:var(--gold)">campaign</span>
              <span class="card-title" style="color:white;margin:0">Central de Comunicação (E-mail & SMS)</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:20px">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-top:-4px">Envie e-mails promocionais e alertas de SMS centralizados e acompanhe seu consumo</p>

              <!-- Painel de E-mail -->
              <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:16px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <span style="font-weight:700;font-size:0.9rem;color:var(--text-primary)">📧 E-mail Centralizado</span>
                  <span class="badge badge-green" style="text-transform:uppercase;font-weight:700;background:var(--primary);color:#fff">${plan}</span>
                </div>
                <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:12px">Os e-mails são enviados de forma automatizada pelo servidor da plataforma.</p>
                
                <div style="margin-bottom:6px;display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-secondary)">
                  <span>Uso no mês atual:</span>
                  <strong>${emailSent} de ${emailLimit} e-mails</strong>
                </div>
                <div style="height:10px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden;margin-bottom:6px">
                  <div style="height:100%;width:${emailPct}%;background:linear-gradient(90deg,var(--primary),#3b82f6);border-radius:99px;transition:width 0.4s"></div>
                </div>
                <div style="font-size:0.72rem;color:var(--text-muted)">Seu limite é renovado mensalmente com base no seu plano de assinatura.</div>
              </div>

              <!-- Painel de SMS -->
              <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
                <div style="flex:1;min-width:200px">
                  <span style="font-weight:700;font-size:0.9rem;color:var(--text-primary);display:block;margin-bottom:4px">💬 SMS Centralizado (Pré-pago)</span>
                  <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0">Envie lembretes e confirmações de presença com altíssima taxa de abertura.</p>
                </div>
                <div style="display:flex;align-items:center;gap:16px;background:var(--bg-secondary);padding:12px 18px;border-radius:12px;border:1px solid var(--border)">
                  <div style="text-align:right">
                    <span style="font-size:0.72rem;color:var(--text-muted);display:block">Saldo de Créditos</span>
                    <strong style="font-size:1.3rem;color:var(--gold);font-weight:800">${smsBalance} SMS</strong>
                  </div>
                  <button class="btn btn-primary" onclick="Settings.openSmsRechargeModal()" style="padding:8px 12px;height:38px;font-size:0.82rem;display:inline-flex;align-items:center;gap:6px">
                    <span class="material-symbols-outlined" style="font-size:18px">bolt</span> Recarregar
                  </button>
                </div>
              </div>

              <!-- Toggles de Preferências de Envio -->
              <div style="border-top:1px solid var(--border);padding-top:16px;display:flex;flex-direction:column;gap:14px">
                <span style="font-weight:700;font-size:0.9rem;color:var(--text-primary)">⚙️ Preferências de Disparo Automático</span>
                
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <div>
                    <label style="font-weight:700;font-size:0.85rem;color:var(--text-primary)">Enviar também por E-mail</label>
                    <span style="font-size:0.72rem;color:var(--text-muted);display:block">Dispara e-mail de lembrete, confirmação e pós-procedimento</span>
                  </div>
                  <label class="switch" style="position:relative;display:inline-block;width:48px;height:26px">
                    <input type="checkbox" id="cfg-comm-email-enabled" ${cs.emailEnabled ? 'checked' : ''} style="opacity:0;width:0;height:0">
                    <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:${cs.emailEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.15)'};border-radius:26px;transition:0.3s" onclick="this.previousElementSibling.click();this.style.background=this.previousElementSibling.checked?'var(--primary)':'rgba(255,255,255,0.15)';const dot=this.querySelector('span');if(dot)dot.style.transform=this.previousElementSibling.checked?'translateX(22px)':'translateX(0)'">
                      <span style="position:absolute;content:'';height:20px;width:20px;left:3px;bottom:3px;background:white;border-radius:50%;transition:0.3s;transform:${cs.emailEnabled ? 'translateX(22px)' : 'translateX(0)'}"></span>
                    </span>
                  </label>
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between">
                  <div>
                    <label style="font-weight:700;font-size:0.85rem;color:var(--text-primary)">Enviar também por SMS</label>
                    <span style="font-size:0.72rem;color:var(--text-muted);display:block">Dispara SMS de lembrete, confirmação e pós-procedimento (usa créditos)</span>
                  </div>
                  <label class="switch" style="position:relative;display:inline-block;width:48px;height:26px">
                    <input type="checkbox" id="cfg-comm-sms-enabled" ${cs.smsEnabled ? 'checked' : ''} style="opacity:0;width:0;height:0">
                    <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:${cs.smsEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.15)'};border-radius:26px;transition:0.3s" onclick="this.previousElementSibling.click();this.style.background=this.previousElementSibling.checked?'var(--primary)':'rgba(255,255,255,0.15)';const dot=this.querySelector('span');if(dot)dot.style.transform=this.previousElementSibling.checked?'translateX(22px)':'translateX(0)'">
                      <span style="position:absolute;content:'';height:20px;width:20px;left:3px;bottom:3px;background:white;border-radius:50%;transition:0.3s;transform:${cs.smsEnabled ? 'translateX(22px)' : 'translateX(0)'}"></span>
                    </span>
                  </label>
                </div>
                
                <button class="btn btn-primary" onclick="Settings.saveCommunication()" id="btn-save-comm" style="margin-top:8px">
                  <span class="material-symbols-outlined">save</span> Salvar Preferências de Comunicação
                </button>
              </div>

            </div>
          </div>

          <!-- Pagamento Online (Asaas) -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">💳 Pagamento Online</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-top:-4px">Receba pagamentos antecipados nos agendamentos</p>

              <div style="background:rgba(201,169,110,0.08);border:1px solid rgba(201,169,110,0.2);border-radius:12px;padding:16px">
                <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5">
                  💡 Para receber pagamentos, crie uma conta gratuita em <a href="https://asaas.com" target="_blank" style="color:var(--gold);text-decoration:underline">asaas.com</a> e copie sua API Key em: <strong>Minha Conta → Integrações → API</strong>.
                </p>
              </div>

              <div style="display:flex;align-items:center;justify-content:space-between">
                <label style="font-weight:700;font-size:0.92rem;color:var(--text-primary)">Ativar pagamento antecipado</label>
                <label class="switch" style="position:relative;display:inline-block;width:48px;height:26px">
                  <input type="checkbox" id="cfg-payment-enabled" ${pc.enabled ? 'checked' : ''}
                    style="opacity:0;width:0;height:0">
                  <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:${pc.enabled ? 'var(--gold)' : 'rgba(255,255,255,0.15)'};border-radius:26px;transition:0.3s" onclick="this.previousElementSibling.click();this.style.background=this.previousElementSibling.checked?'var(--gold)':'rgba(255,255,255,0.15)';const dot=this.querySelector('span');if(dot)dot.style.transform=this.previousElementSibling.checked?'translateX(22px)':'translateX(0)'">
                    <span style="position:absolute;content:'';height:20px;width:20px;left:3px;bottom:3px;background:white;border-radius:50%;transition:0.3s;transform:${pc.enabled ? 'translateX(22px)' : 'translateX(0)'}"></span>
                  </span>
                </label>
              </div>

              <div class="form-group">
                <label class="form-label">API Key Asaas</label>
                <div style="position:relative">
                  <input type="password" class="form-input" id="cfg-payment-apikey"
                    value="${pc.apiKey || ''}" placeholder="Cole sua API Key do Asaas" style="padding-right:44px">
                  <button type="button" id="btn-toggle-apikey" onclick="Settings.toggleApiKeyVisibility()"
                    style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);padding:4px;display:flex;align-items:center;justify-content:center"
                    title="Mostrar/ocultar API Key">
                    <span class="material-symbols-outlined" style="font-size:1.2rem">visibility_off</span>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Ambiente</label>
                <select class="form-input" id="cfg-payment-environment" style="cursor:pointer">
                  <option value="sandbox" ${pc.environment === 'sandbox' ? 'selected' : ''}>Sandbox (testes)</option>
                  <option value="production" ${pc.environment === 'production' ? 'selected' : ''}>Produção</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Política de cancelamento</label>
                <textarea class="form-input" id="cfg-payment-cancellation" rows="3"
                  style="resize:vertical;font-size:0.85rem;line-height:1.5"
                  placeholder="Ex: Cancelamentos com até 24h de antecedência recebem estorno total. Após esse prazo, não há estorno.">${pc.cancellationPolicy || ''}</textarea>
              </div>

              <button class="btn btn-primary" onclick="Settings.savePayment()" id="btn-save-payment">
                <span class="material-symbols-outlined">save</span> Salvar Configurações de Pagamento
              </button>
            </div>
          </div>

          <!-- Emissão de NFS-e (Focus NFe) -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">🧾 Nota Fiscal Eletrônica (NFS-e)</span>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-top:-4px">Emita notas fiscais de serviço de forma controlada a partir da agenda</p>

              <div style="background:rgba(201,169,110,0.08);border:1px solid rgba(201,169,110,0.2);border-radius:12px;padding:16px">
                <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5">
                  💡 Cadastre a sua empresa e faça o upload do seu <strong>Certificado Digital A1</strong> diretamente no painel da <a href="https://focusnfe.com.br" target="_blank" style="color:var(--gold);text-decoration:underline">Focus NFe</a>. Depois, copie o seu <strong>Token de API</strong> e preencha as regras fiscais abaixo.
                </p>
              </div>

              <div style="display:flex;align-items:center;justify-content:space-between">
                <label style="font-weight:700;font-size:0.92rem;color:var(--text-primary)">Ativar emissão de NFS-e</label>
                <label class="switch" style="position:relative;display:inline-block;width:48px;height:26px">
                  <input type="checkbox" id="cfg-focusnfe-enabled" ${fnc.enabled ? 'checked' : ''}
                    style="opacity:0;width:0;height:0">
                  <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:${fnc.enabled ? 'var(--gold)' : 'rgba(255,255,255,0.15)'};border-radius:26px;transition:0.3s" onclick="this.previousElementSibling.click();this.style.background=this.previousElementSibling.checked?'var(--gold)':'rgba(255,255,255,0.15)';const dot=this.querySelector('span');if(dot)dot.style.transform=this.previousElementSibling.checked?'translateX(22px)':'translateX(0)'">
                    <span style="position:absolute;content:'';height:20px;width:20px;left:3px;bottom:3px;background:white;border-radius:50%;transition:0.3s;transform:${fnc.enabled ? 'translateX(22px)' : 'translateX(0)'}"></span>
                  </span>
                </label>
              </div>

              <div class="form-group">
                <label class="form-label">Token Focus NFe</label>
                <div style="position:relative">
                  <input type="password" class="form-input" id="cfg-focusnfe-token"
                    value="${fnc.token || ''}" placeholder="Cole seu Token da Focus NFe" style="padding-right:44px">
                  <button type="button" id="btn-toggle-focusnfe-token" onclick="Settings.toggleFocusNfeTokenVisibility()"
                    style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);padding:4px;display:flex;align-items:center;justify-content:center"
                    title="Mostrar/ocultar Token">
                    <span class="material-symbols-outlined" style="font-size:1.2rem">visibility_off</span>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Ambiente da API</label>
                <select class="form-input" id="cfg-focusnfe-environment" style="cursor:pointer">
                  <option value="sandbox" ${fnc.environment === 'sandbox' ? 'selected' : ''}>Homologação (Testes sem valor fiscal)</option>
                  <option value="production" ${fnc.environment === 'production' ? 'selected' : ''}>Produção (Com valor fiscal real)</option>
                </select>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="form-group">
                  <label class="form-label">Regime Tributário</label>
                  <select class="form-input" id="cfg-focusnfe-regime" style="cursor:pointer">
                    <option value="1" ${fnc.taxRegime === '1' ? 'selected' : ''}>Simples Nacional</option>
                    <option value="2" ${fnc.taxRegime === '2' ? 'selected' : ''}>MEI (Microempreendedor Individual)</option>
                    <option value="3" ${fnc.taxRegime === '3' ? 'selected' : ''}>Lucro Presumido</option>
                    <option value="4" ${fnc.taxRegime === '4' ? 'selected' : ''}>Lucro Real</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Alíquota ISS Padrão (%)</label>
                  <input type="number" class="form-input" id="cfg-focusnfe-iss"
                    value="${fnc.issRate || 2.0}" step="0.01" min="0" max="30" placeholder="Ex: 2.00">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">CNAE de Serviço Padrão</label>
                <input type="text" class="form-input" id="cfg-focusnfe-cnae"
                  value="${fnc.defaultCnae || ''}" placeholder="Ex: 9602502 (Cabelereiros, estética, etc.)">
              </div>

              <div class="form-group">
                <label class="form-label">Descrição Padrão do Serviço</label>
                <textarea class="form-input" id="cfg-focusnfe-description" rows="3"
                  style="resize:vertical;font-size:0.85rem;line-height:1.5"
                  placeholder="Ex: Prestação de serviços de beleza e cuidados com a estética corporal e facial.">${fnc.defaultServiceDescription || ''}</textarea>
              </div>

              <button class="btn btn-primary" onclick="Settings.saveFocusNfe()" id="btn-save-focusnfe">
                <span class="material-symbols-outlined">save</span> Salvar Configurações Fiscais
              </button>
            </div>
          </div>

          <!-- Aviso de Segurança -->
          <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid var(--border);text-align:center">
            <p style="font-size:0.78rem;color:var(--text-muted)">
              🔒 Seus dados são privados e isolados. Somente você acessa as informações do seu estúdio.
            </p>
          </div>

        </div>`;
    },

    _bindEvents() {
        // Sem elementos de preview de fidelidade (configurado no módulo Fidelidade)
    },

    async saveStudio() {
        if (Settings._saving) return;
        const btn = document.getElementById('btn-save-studio');
        Settings._setBtnLoading(btn, true);
        try {
            await firebase.firestore().collection('studioConfig').doc(Store._uid()).set({
                studioName:  document.getElementById('cfg-studio-name')?.value.trim() || '',
                studioPhone: document.getElementById('cfg-studio-phone')?.value.trim() || '',
                studioCity:  document.getElementById('cfg-studio-city')?.value.trim() || '',
                instagram:   document.getElementById('cfg-studio-instagram')?.value.trim() || '',
                updatedAt:   firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            App.showToast('Dados do estúdio salvos! ✅', 'success');
        } catch(e) {
            App.showToast('Erro ao salvar: ' + e.message, 'error');
        }
        Settings._setBtnLoading(btn, false);
    },

    copyReviewLink() {
        const link = document.getElementById('cfg-review-link')?.value;
        navigator.clipboard?.writeText(link).then(() => App.showToast('Link copiado! ✅', 'success'));
    },

    shareReviewWhatsApp() {
        const link = document.getElementById('cfg-review-link')?.value;
        const msg = `⭐ *Avalie nosso atendimento!*\n\nClique no link abaixo para deixar sua avaliação:\n${link}\n\nSua opinião é muito importante para nós! 💕`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    },

    _setBtnLoading(btn, loading) {
        Settings._saving = loading;
        if (!btn) return;
        btn.disabled = loading;
        btn.innerHTML = loading
            ? '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div> Salvando...'
            : '<span class="material-symbols-outlined">save</span> Salvar';
    },

    async saveAftercare() {
        if (Settings._saving) return;
        const btn = document.getElementById('btn-save-aftercare');
        Settings._setBtnLoading(btn, true);
        try {
            const enabled = document.getElementById('cfg-aftercare-enabled')?.checked !== false;
            const templates = {};
            document.querySelectorAll('.aftercare-tpl').forEach(el => {
                const proc = el.dataset.procedure;
                const val = el.value.trim();
                if (val && typeof WA !== 'undefined' && WA.AFTERCARE_DEFAULTS && val !== WA.AFTERCARE_DEFAULTS[proc]) {
                    templates[proc] = val;
                }
            });
            await Store.updateStudioConfig({ aftercareEnabled: enabled, aftercareTemplates: templates });
            App.showToast('Mensagens pós-atendimento salvas! ✅', 'success');
        } catch(e) {
            App.showToast('Erro ao salvar: ' + e.message, 'error');
        }
        Settings._setBtnLoading(btn, false);
    },

    resetAftercareTemplate(procedure) {
        if (typeof WA === 'undefined' || !WA.AFTERCARE_DEFAULTS) {
            App.showToast('Templates padrão não disponíveis.', 'error');
            return;
        }
        const defaultText = WA.AFTERCARE_DEFAULTS[procedure] || WA.AFTERCARE_DEFAULTS['default'] || '';
        const textareas = document.querySelectorAll('.aftercare-tpl');
        for (const el of textareas) {
            if (el.dataset.procedure === procedure) {
                el.value = defaultText;
                break;
            }
        }
        App.showToast(`Template de "${procedure}" restaurado ao padrão! 🔄`, 'success');
    },

    // === Templates WhatsApp ===
    _waDefaults: {
        confirmation: `✨ *Confirmação de Agendamento — {studio}*\n\nOlá, *{nome}*! 💕\n\nSeu agendamento está confirmado:\n📅 *Data:* {data}\n⏰ *Horário:* {horario}\n💅 *Procedimento:* {procedimento}\n\nPor favor, confirme sua presença respondendo *SIM* a esta mensagem.\n\nQualquer dúvida, estou à disposição! 😊\n✨ *Studio Beauty*`,
        reminder: `🔔 *Lembrete — {studio}*\n\nOlá, *{nome}*! 💕\n\nLembrando do seu agendamento *amanhã*:\n⏰ *Horário:* {horario}\n💅 *Procedimento:* {procedimento}\n\nPor favor, confirme sua presença respondendo *SIM*.\nAté amanhã! 😊\n✨ *Studio Beauty*`,
        review: `⭐ *Avalie seu atendimento — {studio}*\n\nOlá, *{nome}*! 💕\n\nAdoramos te receber! Que tal deixar uma avaliação rápida?\n\n👇 Clique no link abaixo (leva menos de 1 minuto):\n{link}\n\nSua opinião é muito importante para nós! 😊💕\n✨ *Studio Beauty*`,
        winback: `💕 *Sentimos sua falta, {nome}!*\n\n_{studio}_\n\nFaz um tempinho que não nos vemos e gostaríamos muito de te receber novamente! 😊\n\n📲 Responda essa mensagem para agendar seu horário com *condições especiais de retorno*!\n\nTe esperamos de volta! 💖\n✨ *Studio Beauty*`,
        loyalty: `🎉 *Parabéns, {nome}!* 💕\n\nVocê atingiu *{visitas} atendimentos* no *{studio}* e ganhou:\n🎁 *{recompensa}*\n\nAgende seu próximo horário e venha resgatar seu presente!\nObrigada pela sua fidelidade! 💖\n✨ *Studio Beauty*`
    },

    // === Templates SMS (curtos e objetivos) ===
    _smsDefaults: {
        confirmation: `{studio}: Ola {nome}! Seu agendamento de {procedimento} esta confirmado para {data} as {horario}. Confirme respondendo SIM. Obrigada!`,
        reminder: `{studio}: Ola {nome}! Lembrete: amanha as {horario} voce tem {procedimento} agendado. Confirme respondendo SIM. Te esperamos!`,
        review: `{studio}: Ola {nome}! Como foi seu atendimento? Avalie em menos de 1 min: {link} - Sua opiniao e muito importante!`,
        winback: `{studio}: Ola {nome}! Sentimos sua falta! Que tal agendar um horario? Temos condicoes especiais de retorno. Responda para agendar!`,
        loyalty: `{studio}: Parabens {nome}! Voce completou {visitas} atendimentos e ganhou: {recompensa}! Agende e venha resgatar seu premio!`,
        aftercare: `{studio}: Ola {nome}! Lembre-se dos cuidados pos-{procedimento}: evite agua na regiao por 24h e siga as orientacoes. Duvidas? Responda aqui!`
    },

    // === Templates E-mail (corpo do e-mail, o layout HTML é aplicado automaticamente) ===
    _emailDefaults: {
        confirmation: `Olá, {nome}! 💕\n\nSeu agendamento está confirmado!\n\n📅 Data: {data}\n⏰ Horário: {horario}\n💅 Procedimento: {procedimento}\n\nPor favor, confirme sua presença respondendo este e-mail ou entrando em contato conosco.\n\nQualquer dúvida, estamos à disposição!\nUm beijo, {studio} ✨`,
        reminder: `Olá, {nome}! 💕\n\nLembrando que amanhã você tem um agendamento conosco:\n\n⏰ Horário: {horario}\n💅 Procedimento: {procedimento}\n\nSe precisar reagendar, entre em contato o quanto antes.\n\nTe esperamos! 😊\n{studio} ✨`,
        review: `Olá, {nome}! 💕\n\nFoi um prazer te receber! Adoraríamos saber como foi a sua experiência.\n\n👇 Clique no link abaixo para deixar sua avaliação (leva menos de 1 minuto):\n{link}\n\nSua opinião nos ajuda a melhorar cada vez mais!\nObrigada, {studio} ✨`,
        winback: `Olá, {nome}! 💕\n\nFaz um tempinho que não nos vemos e sentimos sua falta!\n\nQue tal agendar um horário? Temos condições especiais de retorno esperando por você.\n\nResponda este e-mail ou entre em contato para agendar!\n\nTe esperamos de volta! 💖\n{studio} ✨`,
        loyalty: `Olá, {nome}! 🎉💕\n\nParabéns! Você atingiu {visitas} atendimentos no {studio} e ganhou:\n\n🎁 {recompensa}\n\nAgende seu próximo horário e venha resgatar seu presente!\n\nObrigada pela sua fidelidade! 💖\n{studio} ✨`,
        aftercare: `Olá, {nome}! 💕\n\nAqui estão os cuidados importantes após o seu procedimento de {procedimento}:\n\n• Evite contato com água na região por 24h\n• Não aplique maquiagem na área tratada\n• Use protetor solar quando necessário\n• Siga as orientações específicas do seu procedimento\n\nQualquer dúvida, estamos à disposição!\nUm beijo, {studio} ✨`
    },

    // Helper: gera HTML dos cards de templates SMS
    _buildSmsCardsHTML(smsT) {
        const items = [
            { key: 'confirmation', label: '✅ Confirmação de Agendamento' },
            { key: 'reminder', label: '🔔 Lembrete D-1' },
            { key: 'review', label: '⭐ Avaliação Pós-Atendimento' },
            { key: 'winback', label: '💕 Reconquista de Inativas' },
            { key: 'loyalty', label: '🎁 Brinde de Fidelidade' },
            { key: 'aftercare', label: '🩹 Cuidados Pós-Procedimento' }
        ];
        return items.map(t => {
            const customVal = smsT && smsT[t.key] ? smsT[t.key] : '';
            const displayVal = customVal || Settings._smsDefaults[t.key] || '';
            const safeVal = displayVal.replace(/`/g, "'");
            const charCount = displayVal.length;
            const segments = Math.ceil(charCount / 160) || 1;
            const segColor = segments <= 1 ? '#4ade80' : segments <= 2 ? '#facc15' : '#f87171';
            return '<div style="border:1px solid var(--border);border-radius:10px;padding:14px;background:rgba(255,255,255,0.03)">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px">' +
                '<span style="font-weight:600;font-size:0.85rem;color:var(--text-primary)">' + t.label + '</span>' +
                '<div style="display:flex;align-items:center;gap:10px">' +
                  '<span class="sms-char-count" data-smskey="' + t.key + '" style="font-size:0.7rem;color:' + segColor + ';font-weight:600">' + charCount + ' chars · ' + segments + ' segmento' + (segments > 1 ? 's' : '') + '</span>' +
                  '<button class="btn btn-ghost btn-sm" style="font-size:0.72rem;color:var(--text-muted)" onclick="Settings.resetSmsTemplate(\'' + t.key + '\')" title="Restaurar padrão">🔄 Restaurar</button>' +
                '</div>' +
              '</div>' +
              '<textarea class="form-input sms-template" data-smstemplate="' + t.key + '" rows="3" style="font-size:0.8rem;line-height:1.5;resize:vertical" oninput="Settings._updateSmsCharCount(this)">' + safeVal + '</textarea>' +
            '</div>';
        }).join('');
    },

    // Helper: gera HTML dos cards de templates E-mail
    _buildEmailCardsHTML(emailT) {
        const items = [
            { key: 'confirmation', label: '✨ Confirmação de Agendamento' },
            { key: 'reminder', label: '🔔 Lembrete D-1' },
            { key: 'review', label: '⭐ Avaliação Pós-Atendimento' },
            { key: 'winback', label: '💕 Reconquista de Inativas' },
            { key: 'loyalty', label: '🎁 Brinde de Fidelidade' },
            { key: 'aftercare', label: '🩹 Cuidados Pós-Procedimento' }
        ];
        return items.map(t => {
            const customVal = emailT && emailT[t.key] ? emailT[t.key] : '';
            const displayVal = customVal || Settings._emailDefaults[t.key] || '';
            const safeVal = displayVal.replace(/`/g, "'");
            return '<div style="border:1px solid var(--border);border-radius:10px;padding:14px;background:rgba(255,255,255,0.03)">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px">' +
                '<span style="font-weight:600;font-size:0.85rem;color:var(--text-primary)">' + t.label + '</span>' +
                '<button class="btn btn-ghost btn-sm" style="font-size:0.72rem;color:var(--text-muted)" onclick="Settings.resetEmailTemplate(\'' + t.key + '\')" title="Restaurar padrão">🔄 Restaurar</button>' +
              '</div>' +
              '<textarea class="form-input email-template" data-emailtemplate="' + t.key + '" rows="5" style="font-size:0.8rem;line-height:1.5;resize:vertical">' + safeVal + '</textarea>' +
            '</div>';
        }).join('');
    },

    async saveWhatsAppTemplates() {
        if (Settings._saving) return;
        const btn = document.getElementById('btn-save-wa-templates');
        Settings._setBtnLoading(btn, true);
        try {
            const templates = {};
            document.querySelectorAll('.wa-template').forEach(el => {
                const key = el.dataset.template;
                const val = el.value.trim();
                if (val && val !== Settings._waDefaults[key]) {
                    templates[key] = val;
                }
            });
            await Store.updateStudioConfig({ whatsappTemplates: templates });
            App.showToast('Templates de WhatsApp salvos! ✅', 'success');
        } catch(e) {
            App.showToast('Erro ao salvar: ' + e.message, 'error');
        }
        Settings._setBtnLoading(btn, false);
    },

    resetWhatsAppTemplate(key) {
        const defaultText = Settings._waDefaults[key] || '';
        const textareas = document.querySelectorAll('.wa-template');
        for (const el of textareas) {
            if (el.dataset.template === key) {
                el.value = defaultText;
                break;
            }
        }
        App.showToast('Template restaurado ao padrão! 🔄', 'success');
    },

    // === Templates SMS ===
    async saveSmsTemplates() {
        if (Settings._saving) return;
        const btn = document.getElementById('btn-save-sms-templates');
        Settings._setBtnLoading(btn, true);
        try {
            const templates = {};
            document.querySelectorAll('.sms-template').forEach(el => {
                const key = el.dataset.smstemplate;
                const val = el.value.trim();
                if (val && val !== Settings._smsDefaults[key]) {
                    templates[key] = val;
                }
            });
            await Store.updateStudioConfig({ smsTemplates: templates });
            // Atualiza o cache no WA se disponível
            if (typeof WA !== 'undefined') {
                WA._smsTemplates = Object.keys(templates).length > 0 ? templates : null;
            }
            App.showToast('Templates de SMS salvos! ✅', 'success');
        } catch(e) {
            App.showToast('Erro ao salvar: ' + e.message, 'error');
        }
        Settings._setBtnLoading(btn, false);
    },

    resetSmsTemplate(key) {
        const defaultText = Settings._smsDefaults[key] || '';
        const textareas = document.querySelectorAll('.sms-template');
        for (const el of textareas) {
            if (el.dataset.smstemplate === key) {
                el.value = defaultText;
                Settings._updateSmsCharCount(el);
                break;
            }
        }
        App.showToast('Template SMS restaurado ao padrão! 🔄', 'success');
    },

    _updateSmsCharCount(textarea) {
        const key = textarea.dataset.smstemplate;
        const charCount = textarea.value.length;
        const segments = Math.ceil(charCount / 160) || 1;
        const segColor = segments <= 1 ? '#4ade80' : segments <= 2 ? '#facc15' : '#f87171';
        const badge = document.querySelector(`.sms-char-count[data-smskey="${key}"]`);
        if (badge) {
            badge.style.color = segColor;
            badge.textContent = `${charCount} chars · ${segments} segmento${segments > 1 ? 's' : ''}`;
        }
    },

    // === Templates E-mail ===
    async saveEmailTemplates() {
        if (Settings._saving) return;
        const btn = document.getElementById('btn-save-email-templates');
        Settings._setBtnLoading(btn, true);
        try {
            const templates = {};
            document.querySelectorAll('.email-template').forEach(el => {
                const key = el.dataset.emailtemplate;
                const val = el.value.trim();
                if (val && val !== Settings._emailDefaults[key]) {
                    templates[key] = val;
                }
            });
            await Store.updateStudioConfig({ emailTemplates: templates });
            // Atualiza o cache no WA se disponível
            if (typeof WA !== 'undefined') {
                WA._emailTemplates = Object.keys(templates).length > 0 ? templates : null;
            }
            App.showToast('Templates de E-mail salvos! ✅', 'success');
        } catch(e) {
            App.showToast('Erro ao salvar: ' + e.message, 'error');
        }
        Settings._setBtnLoading(btn, false);
    },

    resetEmailTemplate(key) {
        const defaultText = Settings._emailDefaults[key] || '';
        const textareas = document.querySelectorAll('.email-template');
        for (const el of textareas) {
            if (el.dataset.emailtemplate === key) {
                el.value = defaultText;
                break;
            }
        }
        App.showToast('Template de e-mail restaurado ao padrão! 🔄', 'success');
    },

    // === E-mail Personalizado (redação livre para grupos) ===
    _customEmailRecipients: [],

    async _loadCustomEmailRecipients() {
        const uid = Store._uid();
        if (!uid) return;
        const infoEl = document.getElementById('custom-email-recipients-info');
        infoEl.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;animation:spin 0.6s linear infinite">sync</span> Carregando clientes...';

        try {
            const group = document.getElementById('custom-email-group').value;
            const clientsSnap = await db.collection('studios').doc(uid).collection('clients').get();
            const allClients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.email && c.email.includes('@'));

            const now = new Date();
            let filtered = [];

            if (group === 'all') {
                filtered = allClients;
            } else if (group === 'upcoming') {
                const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                const bookingsSnap = await db.collection('studios').doc(uid).collection('bookings')
                    .where('date', '>=', now.toISOString().slice(0, 10))
                    .where('date', '<=', in7Days.toISOString().slice(0, 10)).get();
                const bookedClientIds = new Set(bookingsSnap.docs.map(d => d.data().clientId));
                filtered = allClients.filter(c => bookedClientIds.has(c.id));
            } else if (group === 'inactive') {
                const cutoff = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
                filtered = allClients.filter(c => {
                    const lastVisit = c.lastVisit?.toDate ? c.lastVisit.toDate() : (c.lastVisit ? new Date(c.lastVisit) : null);
                    return !lastVisit || lastVisit < cutoff;
                });
            } else if (group === 'birthday') {
                const currentMonth = now.getMonth() + 1;
                filtered = allClients.filter(c => {
                    if (!c.birthday) return false;
                    const parts = c.birthday.split('/');
                    const bMonth = parseInt(parts.length >= 2 ? parts[1] : parts[0]);
                    return bMonth === currentMonth;
                });
            } else if (group === 'loyalty') {
                filtered = allClients.filter(c => c.loyaltyVisits && c.loyaltyVisits > 0);
            }

            Settings._customEmailRecipients = filtered;
            const groupLabel = document.getElementById('custom-email-group').selectedOptions[0]?.text || group;
            infoEl.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;color:var(--gold)">group</span> <strong style="color:var(--gold)">' + filtered.length + ' cliente' + (filtered.length !== 1 ? 's' : '') + '</strong> encontrada' + (filtered.length !== 1 ? 's' : '') + ' no grupo: ' + groupLabel;
        } catch (err) {
            console.error('Erro ao carregar clientes:', err);
            infoEl.innerHTML = '<span style="color:var(--danger)">❌ Erro ao carregar: ' + err.message + '</span>';
            Settings._customEmailRecipients = [];
        }
    },

    async sendCustomEmail() {
        const uid = Store._uid();
        if (!uid) { App.showToast('Faça login primeiro.', 'error'); return; }

        const subject = document.getElementById('custom-email-subject').value.trim();
        const body = document.getElementById('custom-email-body').value.trim();
        const recipients = Settings._customEmailRecipients;

        if (!subject) { App.showToast('⚠️ Preencha o assunto do e-mail.', 'error'); return; }
        if (!body) { App.showToast('⚠️ Escreva o corpo do e-mail.', 'error'); return; }
        if (!recipients || recipients.length === 0) {
            App.showToast('⚠️ Nenhum cliente no grupo. Selecione outro grupo.', 'error');
            return;
        }

        const groupLabel = document.getElementById('custom-email-group').selectedOptions[0]?.text || '';
        if (!confirm('Confirma o envio de ' + recipients.length + ' e-mail(s)?\n\nGrupo: ' + groupLabel + '\nAssunto: ' + subject + '\n\nEsta ação consumirá ' + recipients.length + ' e-mail(s) da sua cota mensal.')) return;

        const btn = document.getElementById('btn-send-custom-email');
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 0.6s linear infinite">sync</span> Enviando...';

        const progressDiv = document.getElementById('custom-email-progress');
        const progressText = document.getElementById('custom-email-progress-text');
        const progressBar = document.getElementById('custom-email-progress-bar');
        progressDiv.style.display = 'block';

        const studioName = window._studioName || 'Nosso Studio';
        const sendFn = firebase.functions().httpsCallable('sendCentralEmail');
        let sent = 0;
        let errors = 0;

        for (let i = 0; i < recipients.length; i++) {
            const client = recipients[i];
            const personalBody = body.replace(/\{nome\}/g, client.name || client.clientName || 'Cliente');
            const htmlMessage = personalBody.replace(/\n/g, '<br>');

            const htmlContent = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
                'body{margin:0;padding:0;background-color:#0b050f;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:#e2e8f0}' +
                '.container{max-width:600px;margin:40px auto;background-color:#12071a;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.15);box-shadow:0 10px 30px rgba(0,0,0,0.5)}' +
                '.header{background:linear-gradient(135deg,#1a0a1e 0%,#2d1040 100%);padding:40px 20px;text-align:center;border-bottom:2px solid #c9a96e}' +
                '.header h1{color:#fff;margin:0;font-size:26px;font-weight:700;letter-spacing:1px}' +
                '.content{padding:40px 30px;line-height:1.7;font-size:15px;color:#cbd5e1}' +
                '.content strong{color:#fff}' +
                '.msg-box{background-color:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-left:4px solid #c9a96e;border-radius:8px;padding:24px;margin:15px 0;font-size:16px;color:#f1f5f9}' +
                '.footer{background-color:#08030c;padding:25px 20px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid rgba(255,255,255,0.03)}' +
                '.footer a{color:#c9a96e;text-decoration:none}' +
                '</style></head><body><div class="container">' +
                '<div class="header"><h1>' + studioName + '</h1></div>' +
                '<div class="content">' +
                '<p>Olá, <strong>' + (client.name || client.clientName || 'Cliente') + '</strong>! 💕</p>' +
                '<div class="msg-box">' + htmlMessage + '</div>' +
                '</div>' +
                '<div class="footer"><p>Enviado por <strong>' + studioName + '</strong> via Studio Beauty</p>' +
                '<p style="margin-top:8px">Tecnologia <a href="https://clientehub.app.br" target="_blank">Studio Beauty</a></p></div>' +
                '</div></body></html>';

            try {
                await sendFn({ studioUid: uid, toEmail: client.email, subject: subject, htmlContent: htmlContent });
                sent++;
            } catch (err) {
                console.warn('Falha ao enviar para', client.email, err.message);
                errors++;
            }

            const progress = ((i + 1) / recipients.length * 100).toFixed(0);
            progressText.textContent = (i + 1) + '/' + recipients.length;
            progressBar.style.width = progress + '%';
        }

        progressDiv.style.display = 'none';
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined">send</span> Enviar E-mail para o Grupo Selecionado';

        if (errors === 0) {
            App.showToast('✅ ' + sent + ' e-mail(s) enviado(s) com sucesso!', 'success');
        } else {
            App.showToast('⚠️ ' + sent + ' enviados, ' + errors + ' falharam.', 'warning');
        }

        // Limpar formulário
        document.getElementById('custom-email-subject').value = '';
        document.getElementById('custom-email-body').value = '';
        document.getElementById('custom-email-char-count').textContent = '0 caracteres';
    },

    // === Pagamento Online (Asaas) ===
    toggleApiKeyVisibility() {
        const input = document.getElementById('cfg-payment-apikey');
        const btn = document.getElementById('btn-toggle-apikey');
        if (!input || !btn) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.querySelector('.material-symbols-outlined').textContent = isPassword ? 'visibility' : 'visibility_off';
    },

    async savePayment() {
        if (Settings._saving) return;
        const btn = document.getElementById('btn-save-payment');
        Settings._setBtnLoading(btn, true);
        try {
            const config = {
                enabled: document.getElementById('cfg-payment-enabled')?.checked || false,
                apiKey: document.getElementById('cfg-payment-apikey')?.value.trim() || '',
                environment: document.getElementById('cfg-payment-environment')?.value || 'sandbox',
                cancellationPolicy: document.getElementById('cfg-payment-cancellation')?.value.trim() || ''
            };
            await Store.updateStudioConfig({ asaasPaymentConfig: config });
            App.showToast('Configurações de pagamento salvas! ✅', 'success');
        } catch(e) {
            App.showToast('Erro ao salvar: ' + e.message, 'error');
        }
        Settings._setBtnLoading(btn, false);
    },

    // === Nota Fiscal Eletrônica (Focus NFe) ===
    toggleFocusNfeTokenVisibility() {
        const input = document.getElementById('cfg-focusnfe-token');
        const btn = document.getElementById('btn-toggle-focusnfe-token');
        if (!input || !btn) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.querySelector('.material-symbols-outlined').textContent = isPassword ? 'visibility' : 'visibility_off';
    },

    async saveFocusNfe() {
        if (Settings._saving) return;
        const btn = document.getElementById('btn-save-focusnfe');
        Settings._setBtnLoading(btn, true);
        try {
            const config = {
                enabled: document.getElementById('cfg-focusnfe-enabled')?.checked || false,
                token: document.getElementById('cfg-focusnfe-token')?.value.trim() || '',
                environment: document.getElementById('cfg-focusnfe-environment')?.value || 'sandbox',
                taxRegime: document.getElementById('cfg-focusnfe-regime')?.value || '1',
                issRate: parseFloat(document.getElementById('cfg-focusnfe-iss')?.value) || 2.0,
                defaultCnae: document.getElementById('cfg-focusnfe-cnae')?.value.trim() || '',
                defaultServiceDescription: document.getElementById('cfg-focusnfe-description')?.value.trim() || ''
            };
            await Store.updateStudioConfig({ focusNfeConfig: config });
            App.showToast('Configurações fiscais salvas! ✅', 'success');
        } catch(e) {
            App.showToast('Erro ao salvar: ' + e.message, 'error');
        }
        Settings._setBtnLoading(btn, false);
    },

    async saveCommunication() {
        if (Settings._saving) return;
        const btn = document.getElementById('btn-save-comm');
        Settings._setBtnLoading(btn, true);
        try {
            const config = {
                emailEnabled: document.getElementById('cfg-comm-email-enabled')?.checked || false,
                smsEnabled: document.getElementById('cfg-comm-sms-enabled')?.checked || false
            };
            await firebase.firestore().collection('studioConfig').doc(Store._uid()).set({
                communicationSettings: config
            }, { merge: true });
            App.showToast('Preferências de comunicação salvas! ✅', 'success');
        } catch(e) {
            App.showToast('Erro ao salvar: ' + e.message, 'error');
        }
        Settings._setBtnLoading(btn, false);
    },

    _selectedPackage: 'prata',

    openSmsRechargeModal() {
        const modalId = 'sms-recharge-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.style.zIndex = '9999';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        modal.innerHTML = `
          <div class="modal-container" onclick="event.stopPropagation()" style="max-width:480px">
            <div class="modal-header">
              <h3 class="modal-title">⚡ Recarregar Créditos de SMS</h3>
              <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
            </div>
            <div class="modal-body" style="padding:20px;display:flex;flex-direction:column;gap:16px" id="recharge-modal-content">
              <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px">
                Selecione o melhor pacote de créditos de SMS para o seu estúdio. A liberação ocorre em segundos via PIX!
              </p>
              
              <div style="display:flex;flex-direction:column;gap:10px">
                
                <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;border:1px solid var(--border);border-radius:10px;cursor:pointer;background:var(--bg-secondary);transition:all 0.2s"
                     onclick="Settings.selectSmsPackage('bronze', this)">
                  <div>
                    <strong style="color:var(--text-primary);display:block;font-size:0.9rem">🥉 Pacote Bronze (100 SMS)</strong>
                    <span style="font-size:0.75rem;color:var(--text-muted)">Exclusivo para pequenos estúdios</span>
                  </div>
                  <strong style="color:var(--gold);font-size:1.05rem">R$ 15,00</strong>
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;border:2px solid var(--gold);border-radius:10px;cursor:pointer;background:rgba(201,169,110,0.06);position:relative;transition:all 0.2s"
                     onclick="Settings.selectSmsPackage('prata', this)">
                  <span style="position:absolute;top:-10px;right:10px;background:var(--gold);color:black;font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px">Recomendado</span>
                  <div>
                    <strong style="color:var(--text-primary);display:block;font-size:0.9rem">🥈 Pacote Prata (300 SMS)</strong>
                    <span style="font-size:0.75rem;color:var(--text-muted)">Excelente custo-benefício</span>
                  </div>
                  <strong style="color:var(--gold);font-size:1.05rem">R$ 39,00</strong>
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;border:1px solid var(--border);border-radius:10px;cursor:pointer;background:var(--bg-secondary);transition:all 0.2s"
                     onclick="Settings.selectSmsPackage('ouro', this)">
                  <div>
                    <strong style="color:var(--text-primary);display:block;font-size:0.9rem">🥇 Pacote Ouro (500 SMS)</strong>
                    <span style="font-size:0.75rem;color:var(--text-muted)">Melhor valor por mensagem</span>
                  </div>
                  <strong style="color:var(--gold);font-size:1.05rem">R$ 59,00</strong>
                </div>

              </div>

              <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:12px">
                <button class="btn btn-ghost" onclick="document.getElementById('${modalId}').remove()">Cancelar</button>
                <button class="btn btn-primary" id="btn-generate-recharge" onclick="Settings.generateSmsRecharge()" style="display:inline-flex;align-items:center;gap:6px">
                  <span class="material-symbols-outlined" style="font-size:18px">pix</span> Gerar PIX
                </button>
              </div>
            </div>
          </div>`;
        document.body.appendChild(modal);
        Settings._selectedPackage = 'prata';
    },

    selectSmsPackage(packageId, element) {
        Settings._selectedPackage = packageId;
        const containers = element.parentElement.children;
        for (let el of containers) {
            el.style.borderColor = 'var(--border)';
            el.style.borderWidth = '1px';
            el.style.background = 'var(--bg-secondary)';
        }
        element.style.borderColor = 'var(--gold)';
        element.style.borderWidth = '2px';
        element.style.background = 'rgba(201,169,110,0.06)';
    },

    async generateSmsRecharge() {
        const btn = document.getElementById('btn-generate-recharge');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div> Gerando...';
        }

        try {
            const buyFn = firebase.functions().httpsCallable('buySmsCredits');
            const resp = await buyFn({
                studioUid: Store._uid(),
                packageId: Settings._selectedPackage
            });

            const data = resp.data;
            const content = document.getElementById('recharge-modal-content');
            
            if (content && data.pixCopiaCola) {
                content.innerHTML = `
                <div style="text-align:center;display:flex;flex-direction:column;gap:16px;padding:10px 0">
                    <span class="material-symbols-outlined" style="font-size:48px;color:#28a745;margin:0 auto">check_circle</span>
                    <h4 style="font-size:1.05rem;font-weight:700;color:var(--text-primary);margin:0">PIX de Recarga Gerado!</h4>
                    <p style="font-size:0.8rem;color:var(--text-secondary);margin:0">Escaneie o QR Code ou copie o código abaixo para pagar. Seus créditos serão liberados imediatamente após o pagamento!</p>
                    
                    ${data.pixQrCodeBase64 ? `
                    <div style="background:white;padding:12px;border-radius:12px;width:180px;height:180px;margin:0 auto;display:flex;align-items:center;justify-content:center;border:1px solid var(--border)">
                        <img src="data:image/png;base64,${data.pixQrCodeBase64}" style="width:100%;height:100%" alt="QR Code Pix" />
                    </div>` : ''}

                    <div class="form-group" style="text-align:left">
                        <label class="form-label" style="font-size:0.75rem">Código Copia e Cola Pix:</label>
                        <div style="display:flex;gap:8px">
                            <input class="form-input" id="pix-copy-input" value="${data.pixCopiaCola}" readonly style="font-size:0.78rem;color:var(--text-secondary);flex:1;height:38px" />
                            <button class="btn btn-outline" onclick="Settings.copyPixCode()" style="padding:0 12px;height:38px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px">
                                <span class="material-symbols-outlined" style="font-size:18px">content_copy</span> Copiar
                            </button>
                        </div>
                    </div>

                    <div style="border-top:1px solid var(--border);padding-top:16px;display:flex;justify-content:flex-end">
                        <button class="btn btn-primary" onclick="document.getElementById('sms-recharge-modal').remove();Settings.render(document.getElementById('page-content'))">
                            Fechar e Atualizar Saldo
                        </button>
                    </div>
                </div>`;
            } else {
                throw new Error("Não foi possível carregar as informações do Pix.");
            }
        } catch (err) {
            App.showToast('Erro ao gerar cobrança: ' + err.message, 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined">pix</span> Gerar PIX';
            }
        }
    },

    copyPixCode() {
        const input = document.getElementById('pix-copy-input');
        if (input) {
            input.select();
            navigator.clipboard?.writeText(input.value).then(() => {
                App.showToast('Pix Copia e Cola copiado com sucesso! 🚀', 'success');
            });
        }
    }
};
