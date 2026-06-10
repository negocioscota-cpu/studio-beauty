// === WHATSAPP INTEGRATION — Studio Beauty + Z-API ===
// Envio automático via Cloud Function Z-API com fallback wa.me

const WA = {
    FUNCTIONS_BASE: 'https://us-central1-lashbrow-app.cloudfunctions.net',

    _customTemplates: null,
    _smsTemplates: null,
    _emailTemplates: null,
    _communicationSettings: null,

    // Carrega templates customizados do Firestore (chamado no login)
    async loadCustomTemplates() {
        try {
            const uid = typeof Store !== 'undefined' ? Store._uid() : null;
            if (!uid) return;
            const doc = await firebase.firestore().collection('studioConfig').doc(uid).get();
            if (doc.exists) {
                const data = doc.data();
                if (data.whatsappTemplates) {
                    WA._customTemplates = data.whatsappTemplates;
                }
                if (data.smsTemplates) {
                    WA._smsTemplates = data.smsTemplates;
                }
                if (data.emailTemplates) {
                    WA._emailTemplates = data.emailTemplates;
                }
                WA._communicationSettings = data.communicationSettings || { emailEnabled: false, smsEnabled: false };
            }
        } catch(e) { console.warn('Erro ao carregar templates WA:', e.message); }
    },

    // Defaults SMS (curtos, sem emojis, sem formatação)
    _SMS_DEFAULTS: {
        confirmation: `{studio}: Ola {nome}! Seu agendamento de {procedimento} esta confirmado para {data} as {horario}. Confirme respondendo SIM. Obrigada!`,
        reminder: `{studio}: Ola {nome}! Lembrete: amanha as {horario} voce tem {procedimento} agendado. Confirme respondendo SIM. Te esperamos!`,
        review: `{studio}: Ola {nome}! Como foi seu atendimento? Avalie em menos de 1 min: {link} - Sua opiniao e muito importante!`,
        winback: `{studio}: Ola {nome}! Sentimos sua falta! Que tal agendar um horario? Temos condicoes especiais de retorno. Responda para agendar!`,
        loyalty: `{studio}: Parabens {nome}! Voce completou {visitas} atendimentos e ganhou: {recompensa}! Agende e venha resgatar seu premio!`,
        aftercare: `{studio}: Ola {nome}! Lembre-se dos cuidados pos-{procedimento}: evite agua na regiao por 24h e siga as orientacoes. Duvidas? Responda aqui!`
    },

    // Monta o texto SMS usando template dedicado (custom > default SMS)
    _buildSmsText(templateKey, vars) {
        let msg = (WA._smsTemplates && WA._smsTemplates[templateKey]) || WA._SMS_DEFAULTS[templateKey] || '';
        if (!msg) return '';
        const studio = WA._getStudioName();
        msg = msg.replace(/\{studio\}/g, studio)
                 .replace(/\{nome\}/g, vars.nome || '')
                 .replace(/\{procedimento\}/g, vars.procedimento || 'Atendimento')
                 .replace(/\{data\}/g, vars.data || '')
                 .replace(/\{horario\}/g, vars.horario || '')
                 .replace(/\{link\}/g, vars.link || '')
                 .replace(/\{recompensa\}/g, vars.recompensa || '')
                 .replace(/\{visitas\}/g, vars.visitas || '');
        return msg;
    },

    // Defaults E-mail (corpo do e-mail, layout HTML é aplicado automaticamente)
    _EMAIL_DEFAULTS: {
        confirmation: `Olá, {nome}! 💕\n\nSeu agendamento está confirmado!\n\n📅 Data: {data}\n⏰ Horário: {horario}\n💅 Procedimento: {procedimento}\n\nPor favor, confirme sua presença respondendo este e-mail ou entrando em contato conosco.\n\nQualquer dúvida, estamos à disposição!\nUm beijo, {studio} ✨`,
        reminder: `Olá, {nome}! 💕\n\nLembrando que amanhã você tem um agendamento conosco:\n\n⏰ Horário: {horario}\n💅 Procedimento: {procedimento}\n\nSe precisar reagendar, entre em contato o quanto antes.\n\nTe esperamos! 😊\n{studio} ✨`,
        review: `Olá, {nome}! 💕\n\nFoi um prazer te receber! Adoraríamos saber como foi a sua experiência.\n\n👇 Clique no link abaixo para deixar sua avaliação (leva menos de 1 minuto):\n{link}\n\nSua opinião nos ajuda a melhorar cada vez mais!\nObrigada, {studio} ✨`,
        winback: `Olá, {nome}! 💕\n\nFaz um tempinho que não nos vemos e sentimos sua falta!\n\nQue tal agendar um horário? Temos condições especiais de retorno esperando por você.\n\nResponda este e-mail ou entre em contato para agendar!\n\nTe esperamos de volta! 💖\n{studio} ✨`,
        loyalty: `Olá, {nome}! 🎉💕\n\nParabéns! Você atingiu {visitas} atendimentos no {studio} e ganhou:\n\n🎁 {recompensa}\n\nAgende seu próximo horário e venha resgatar seu presente!\n\nObrigada pela sua fidelidade! 💖\n{studio} ✨`,
        aftercare: `Olá, {nome}! 💕\n\nAqui estão os cuidados importantes após o seu procedimento de {procedimento}:\n\n• Evite contato com água na região por 24h\n• Não aplique maquiagem na área tratada\n• Use protetor solar quando necessário\n• Siga as orientações específicas do seu procedimento\n\nQualquer dúvida, estamos à disposição!\nUm beijo, {studio} ✨`
    },

    // Monta o texto de E-mail usando template dedicado (custom > default)
    _buildEmailText(templateKey, vars) {
        let msg = (WA._emailTemplates && WA._emailTemplates[templateKey]) || WA._EMAIL_DEFAULTS[templateKey] || '';
        if (!msg) return '';
        const studio = WA._getStudioName();
        msg = msg.replace(/\{studio\}/g, studio)
                 .replace(/\{nome\}/g, vars.nome || '')
                 .replace(/\{procedimento\}/g, vars.procedimento || 'Atendimento')
                 .replace(/\{data\}/g, vars.data || '')
                 .replace(/\{horario\}/g, vars.horario || '')
                 .replace(/\{link\}/g, vars.link || '')
                 .replace(/\{recompensa\}/g, vars.recompensa || '')
                 .replace(/\{visitas\}/g, vars.visitas || '');
        return msg;
    },

    // Dispara opcionalmente E-mail e SMS com base nas preferências e cotas/saldos
    async _triggerEmailSms(clientName, phone, email, subject, rawMsg, smsTemplateKey, smsVars) {
        try {
            const uid = typeof Store !== 'undefined' ? Store._uid() : null;
            if (!uid) return;

            // Se ainda não carregou as preferências, tenta carregar
            if (!WA._communicationSettings) {
                await WA.loadCustomTemplates();
            }

            const settings = WA._communicationSettings || { emailEnabled: false, smsEnabled: false };

            // 1. Envio de SMS (usa template SMS dedicado se disponível)
            if (settings.smsEnabled && phone) {
                let smsMsg = '';
                if (smsTemplateKey && (WA._SMS_DEFAULTS[smsTemplateKey] || (WA._smsTemplates && WA._smsTemplates[smsTemplateKey]))) {
                    smsMsg = WA._buildSmsText(smsTemplateKey, smsVars || {});
                } else {
                    // Fallback: sanitiza o texto do WhatsApp
                    smsMsg = WA._sanitizeSmsText(rawMsg);
                }
                if (smsMsg) {
                    firebase.functions().httpsCallable('sendCentralSMS')({
                        studioUid: uid,
                        phone: phone,
                        message: smsMsg
                    }).then(resp => {
                        console.log('✅ SMS enviado via central:', resp.data);
                    }).catch(err => {
                        console.warn('⚠️ Falha ao enviar SMS centralizado:', err.message);
                    });
                }
            }

            // 2. Envio de E-mail (usa template de e-mail dedicado se disponível)
            if (settings.emailEnabled && email && email.includes('@')) {
                const studioName = WA._getStudioName();
                
                // Monta o corpo do e-mail usando template dedicado ou fallback
                let emailBodyText = '';
                if (smsTemplateKey && (WA._EMAIL_DEFAULTS[smsTemplateKey] || (WA._emailTemplates && WA._emailTemplates[smsTemplateKey]))) {
                    emailBodyText = WA._buildEmailText(smsTemplateKey, smsVars || {});
                } else {
                    emailBodyText = rawMsg;
                }
                
                // Transforma quebras de linha em <br> para o HTML
                const htmlMessage = emailBodyText.replace(/\n/g, '<br>');
                
                const htmlBody = `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { margin: 0; padding: 0; background-color: #0b050f; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #e2e8f0; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #12071a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(201, 169, 110, 0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                    .header { background: linear-gradient(135deg, #1a0a1e 0%, #2d1040 100%); padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a96e; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px; }
                    .content { padding: 40px 30px; line-height: 1.6; font-size: 15px; }
                    .content p { margin: 0 0 20px 0; color: #cbd5e1; }
                    .content strong { color: #ffffff; }
                    .msg-box { background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-left: 4px solid #c9a96e; border-radius: 8px; padding: 24px; margin: 25px 0; font-size: 16px; color: #f1f5f9; }
                    .footer { background-color: #08030c; padding: 25px 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.03); }
                    .footer a { color: #c9a96e; text-decoration: none; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>${studioName}</h1>
                    </div>
                    <div class="content">
                      <p>Olá, <strong>${clientName}</strong>! 💕</p>
                      <div class="msg-box">${htmlMessage}</div>
                      <p style="margin-top: 25px; margin-bottom: 0;">Estamos muito felizes em ter você conosco. Se tiver qualquer dúvida ou precisar reagendar, entre em contato!</p>
                    </div>
                    <div class="footer">
                      <p>Enviado automaticamente por <strong>${studioName}</strong> via Central de Comunicação</p>
                      <p style="margin-top: 8px;">Tecnologia <a href="https://clientehub.app.br" target="_blank">Studio Beauty</a> · Todos os direitos reservados</p>
                    </div>
                  </div>
                </body>
                </html>
                `;

                firebase.functions().httpsCallable('sendCentralEmail')({
                    studioUid: uid,
                    toEmail: email,
                    subject: subject,
                    htmlContent: htmlBody
                }).then(resp => {
                    console.log('✅ E-mail enviado via central:', resp.data);
                }).catch(err => {
                    console.warn('⚠️ Falha ao enviar E-mail centralizado:', err.message);
                });
            }

        } catch (e) {
            console.error('Erro no processamento _triggerEmailSms:', e);
        }
    },

    // Sanitiza texto do WhatsApp para SMS (remove emojis e formatação)
    _sanitizeSmsText(text) {
        if (!text) return '';
        // Remove asteriscos, underlines, riscado e til da formatação do WhatsApp
        let clean = text.replace(/[\*_~]/g, '');
        // Remove emojis usando regex Unicode abrangente
        clean = clean.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');
        return clean.trim();
    },

    // Substitui placeholders no template
    _applyTemplate(templateKey, defaultMsg, vars) {
        let msg = (WA._customTemplates && WA._customTemplates[templateKey]) || defaultMsg;
        // Substituir variáveis
        const studio = WA._getStudioName();
        msg = msg.replace(/\{studio\}/g, studio)
                 .replace(/\{nome\}/g, vars.nome || '')
                 .replace(/\{procedimento\}/g, vars.procedimento || 'Atendimento')
                 .replace(/\{data\}/g, vars.data || '')
                 .replace(/\{horario\}/g, vars.horario || '')
                 .replace(/\{link\}/g, vars.link || '')
                 .replace(/\{recompensa\}/g, vars.recompensa || '')
                 .replace(/\{visitas\}/g, vars.visitas || '');
        return msg;
    },

    // Formata o número para o padrão (apenas dígitos, com código 55)
    _formatPhone(phone) {
        if (!phone) return null;
        const digits = phone.replace(/\D/g, '');
        return digits.startsWith('55') ? digits : '55' + digits;
    },

    // Retorna nome do studio configurado
    _getStudioName() {
        try {
            const el = document.getElementById('cfg-studio-name');
            if (el && el.value && el.value.trim()) return el.value.trim();
        } catch(e) {}
        return window._studioName || 'Nosso Studio';
    },

    // Gera link wa.me (fallback)
    _link(phone, msg) {
        const num = WA._formatPhone(phone);
        if (!num) return null;
        return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    },

    // === ENVIO PRINCIPAL — Z-API com fallback wa.me ===
    async send(phone, msg) {
        if (!phone) {
            App.showToast('Número de telefone não cadastrado para esta cliente.', 'error');
            return;
        }

        const num = WA._formatPhone(phone);
        if (!num) {
            App.showToast('Número de telefone inválido.', 'error');
            return;
        }

        try {
            const resp = await fetch(`${WA.FUNCTIONS_BASE}/sendWhatsApp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: num, message: msg }),
            });

            if (resp.ok) {
                App.showToast('✅ Mensagem enviada via WhatsApp!', 'success');
                return true;
            }

            // Se Z-API falhou, fallback para wa.me
            throw new Error('Z-API retornou ' + resp.status);
        } catch (err) {
            console.warn('Z-API indisponível, abrindo wa.me:', err.message);
            const link = WA._link(phone, msg);
            if (link) {
                window.open(link, '_blank');
                App.showToast('📲 WhatsApp aberto — envie manualmente.', 'info');
            }
            return false;
        }
    },

    // Alias para compatibilidade
    open(phone, msg) {
        WA.send(phone, msg);
    },

    // === CONFIRMAÇÃO DE AGENDAMENTO ===
    confirmation(clientName, phone, procedure, dateStr, time, email = null) {
        const defaultMsg = `✨ *Confirmação de Agendamento — {studio}*\n\nOlá, *{nome}*! 💕\n\nSeu agendamento está confirmado:\n📅 *Data:* {data}\n⏰ *Horário:* {horario}\n💅 *Procedimento:* {procedimento}\n\nPor favor, confirme sua presença respondendo *SIM* a esta mensagem.\n\nQualquer dúvida, estou à disposição! 😊\n✨ *Studio Beauty*`;
        const msg = WA._applyTemplate('confirmation', defaultMsg, { nome: clientName, procedimento: procedure, data: dateStr, horario: time });
        WA.send(phone, msg);
        WA._triggerEmailSms(clientName, phone, email, `Confirmação de Agendamento — ${WA._getStudioName()}`, msg, 'confirmation', { nome: clientName, procedimento: procedure, data: dateStr, horario: time });
    },

    // === LEMBRETE D-1 ===
    reminder(clientName, phone, procedure, time, email = null) {
        const defaultMsg = `🔔 *Lembrete — {studio}*\n\nOlá, *{nome}*! 💕\n\nLembrando do seu agendamento *amanhã*:\n⏰ *Horário:* {horario}\n💅 *Procedimento:* {procedimento}\n\nPor favor, confirme sua presença respondendo *SIM*.\nAté amanhã! 😊\n✨ *Studio Beauty*`;
        const msg = WA._applyTemplate('reminder', defaultMsg, { nome: clientName, procedimento: procedure, horario: time });
        WA.send(phone, msg);
        WA._triggerEmailSms(clientName, phone, email, `Lembrete de Agendamento — ${WA._getStudioName()}`, msg, 'reminder', { nome: clientName, procedimento: procedure, horario: time });
    },

    // === BRINDE DE FIDELIDADE ===
    loyaltyReward(clientName, phone, reward, visitCount, email = null) {
        const defaultMsg = `🎉 *Parabéns, {nome}!* 💕\n\nVocê atingiu *{visitas} atendimentos* no *{studio}* e ganhou:\n🎁 *{recompensa}*\n\nAgende seu próximo horário e venha resgatar seu presente!\nObrigada pela sua fidelidade! 💖\n✨ *Studio Beauty*`;
        const msg = WA._applyTemplate('loyalty', defaultMsg, { nome: clientName, recompensa: reward, visitas: String(visitCount) });
        WA.send(phone, msg);
        WA._triggerEmailSms(clientName, phone, email, `Você ganhou um Presente! 🎁 — ${WA._getStudioName()}`, msg, 'loyalty', { nome: clientName, recompensa: reward, visitas: String(visitCount) });
    },

    // === LINK DE AVALIAÇÃO (retorna link, não envia) ===
    reviewLink(clientName, phone, reviewUrl) {
        const studio = WA._getStudioName();
        reviewUrl = reviewUrl || `${location.origin}/avaliacao.html`;
        const url = new URL(reviewUrl, location.origin);
        if (clientName) url.searchParams.set('name', clientName);
        if (phone)      url.searchParams.set('phone', phone);
        const finalUrl = url.toString();
        const msg =
`⭐ *Avalie seu atendimento — ${studio}*

Olá, *${clientName}*! 💕

Adoramos te receber! Que tal deixar uma avaliação rápida?

👇 Clique no link abaixo (leva menos de 1 minuto):
${finalUrl}

Sua opinião é muito importante para nós! 😊💕
✨ *Studio Beauty*`;
        const num = WA._formatPhone(phone);
        if (!num) return finalUrl;
        return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    },

    // === ENVIA LINK DE AVALIAÇÃO ===
    reviewRequest(clientName, phone, reviewUrl) {
        reviewUrl = reviewUrl || `${location.origin}/avaliacao.html`;
        const url = new URL(reviewUrl, location.origin);
        if (clientName) url.searchParams.set('name', clientName);
        if (phone)      url.searchParams.set('phone', phone);
        const finalUrl = url.toString();
        const defaultMsg = `⭐ *Avalie seu atendimento — {studio}*\n\nOlá, *{nome}*! 💕\n\nAdoramos te receber! Que tal deixar uma avaliação rápida?\n\n👇 Clique no link abaixo (leva menos de 1 minuto):\n{link}\n\nSua opinião é muito importante para nós! 😊💕\n✨ *Studio Beauty*`;
        if (!phone) {
            navigator.clipboard?.writeText(finalUrl).then(() =>
                App.showToast('Link de avaliação copiado! Cole no WhatsApp.', 'success')
            );
            return;
        }
        const msg = WA._applyTemplate('review', defaultMsg, { nome: clientName, link: finalUrl });
        WA.send(phone, msg);
    },

    // === TEMPLATES PADRÃO DE CUIDADOS PÓS-PROCEDIMENTO ===
    AFTERCARE_DEFAULTS: {
        'Extensão de Cílios': `✨ *Cuidados Pós-Extensão de Cílios*\n\n💧 Evite contato com água nas primeiras 24h\n😴 Não durma de bruços\n🚫 Não use rímel ou curvador\n🧴 Evite produtos oleosos nos olhos\n🧹 Limpe os cílios diariamente com escovinha\n\n📅 *Manutenção recomendada:* 21 a 28 dias\n\nCuide bem dos seus cílios! 💕`,
        'Lifting de Cílios': `✨ *Cuidados Pós-Lifting de Cílios*\n\n💧 Não molhe os cílios nas primeiras 24h\n🚫 Não use rímel nas primeiras 48h\n🧴 Evite saunas e piscinas por 48h\n👁️ Não esfregue os olhos\n\n📅 *Retorno recomendado:* 6 a 8 semanas\n\nSeus cílios estão lindos! 💕`,
        'Design de Sobrancelhas': `✨ *Cuidados Pós-Design de Sobrancelhas*\n\n💄 Não aplique maquiagem na região por 6h\n☀️ Use protetor solar na área\n🚫 Evite esfoliantes por 24h\n🧴 Hidrate a região com água termal\n\n📅 *Retoque recomendado:* 15 a 21 dias\n\nSuas sobrancelhas ficaram perfeitas! 💕`,
        'Micropigmentação': `✨ *Cuidados Pós-Micropigmentação*\n\n💧 Não molhe a região por 7 dias\n🚫 Não coce nem arranque casquinhas\n🧴 Aplique pomada cicatrizante conforme orientado\n☀️ Evite exposição solar direta\n🏊 Não frequente piscina/sauna por 15 dias\n\n📅 *Retorno para retoque:* 30 a 45 dias\n\nO resultado vai ficar lindo! Paciência na cicatrização 💕`,
        'Henna de Sobrancelhas': `✨ *Cuidados Pós-Henna*\n\n💧 Não molhe as sobrancelhas por 12h\n🧴 Evite esfoliantes e sabonetes na região\n☀️ Use protetor solar para prolongar a duração\n🚫 Não aplique maquiagem por 12h\n\n📅 *Duração média:* 7 a 15 dias\n\nAproveite suas sobrancelhas poderosas! 💕`,
        'Brow Lamination': `✨ *Cuidados Pós-Brow Lamination*\n\n💧 Não molhe as sobrancelhas por 24h\n🚫 Não penteie os fios por 48h\n🧴 Evite saunas e piscinas por 48h\n✨ Use gel ou cera fixadora para manter o efeito\n\n📅 *Retoque recomendado:* 6 a 8 semanas\n\nSuas sobrancelhas estão impecáveis! 💕`,
        'default': `✨ *Cuidados Pós-Procedimento*\n\n💧 Siga as orientações específicas do seu procedimento\n🧴 Mantenha a região limpa e hidratada\n☀️ Use protetor solar quando necessário\n\nQualquer dúvida, estamos à disposição! 💕`
    },

    // Retorna o template de aftercare (customizado tem prioridade)
    _getAftercareText(procedure, customTemplates) {
        if (customTemplates && customTemplates[procedure]) return customTemplates[procedure];
        const key = Object.keys(WA.AFTERCARE_DEFAULTS).find(k =>
            k !== 'default' && procedure.toLowerCase().includes(k.toLowerCase().split(' ')[0].toLowerCase())
        );
        return WA.AFTERCARE_DEFAULTS[key] || WA.AFTERCARE_DEFAULTS['default'];
    },

    // Envia cuidados pós-atendimento
    aftercare(clientName, phone, procedure, customTemplates, email = null) {
        const studio = WA._getStudioName();
        const template = WA._getAftercareText(procedure, customTemplates);
        const msg = `Olá, *${clientName}*! 💕\n\n${template}\n\nObrigada pela confiança! 😊\n_${studio}_\n✨ *Studio Beauty*`;
        WA.send(phone, msg);
        WA._triggerEmailSms(clientName, phone, email, `Cuidados Pós-Procedimento — ${WA._getStudioName()}`, msg, 'aftercare', { nome: clientName, procedimento: procedure });
    },

    // Mensagem de reconquista para clientes inativos
    winback(clientName, phone, lastProcedure, email = null) {
        const extra = lastProcedure ? `Da última vez você fez *${lastProcedure}* e ficou incrível! ✨\n\n` : '';
        const defaultMsg = `💕 *Sentimos sua falta, {nome}!*\n\n_{studio}_\n\nFaz um tempinho que não nos vemos e gostaríamos muito de te receber novamente! 😊\n\n${extra}📲 Responda essa mensagem para agendar seu horário com *condições especiais de retorno*!\n\nTe esperamos de volta! 💖\n✨ *Studio Beauty*`;
        const msg = WA._applyTemplate('winback', defaultMsg, { nome: clientName });
        WA.send(phone, msg);
        WA._triggerEmailSms(clientName, phone, email, `Sentimos sua falta! 💕 — ${WA._getStudioName()}`, msg, 'winback', { nome: clientName });
    }
};
