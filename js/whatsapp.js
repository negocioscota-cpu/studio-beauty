// === WHATSAPP HELPER — LashBrow ===
// Gera links wa.me sem necessidade de API paga
const WA = {
    // Formata o número para o padrão wa.me (apenas dígitos, com código 55)
    _formatPhone(phone) {
        if (!phone) return null;
        const digits = phone.replace(/\D/g, '');
        // Adiciona 55 se não tiver código de país
        return digits.startsWith('55') ? digits : '55' + digits;
    },

    // Gera link wa.me com mensagem pré-preenchida
    _link(phone, msg) {
        const num = WA._formatPhone(phone);
        if (!num) return null;
        return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    },

    // Abre o link no WhatsApp (nova aba)
    open(phone, msg) {
        const link = WA._link(phone, msg);
        if (!link) {
            App.showToast('Número de telefone não cadastrado para esta cliente.', 'error');
            return;
        }
        window.open(link, '_blank');
    },

    // === CONFIRMAÇÃO DE AGENDAMENTO ===
    confirmation(clientName, phone, procedure, dateStr, time) {
        const msg =
`✨ *Confirmação de Agendamento — LashBrow*

Olá, *${clientName}*! 💕

Seu agendamento está confirmado:
📅 *Data:* ${dateStr}
⏰ *Horário:* ${time}
💅 *Procedimento:* ${procedure || 'Atendimento'}

Por favor, confirme sua presença respondendo *SIM* a esta mensagem.

Qualquer dúvida, estou à disposição! 😊`;
        WA.open(phone, msg);
    },

    // === LEMBRETE D-1 ===
    reminder(clientName, phone, procedure, time) {
        const msg =
`🔔 *Lembrete — LashBrow*

Olá, *${clientName}*! 💕

Lembrando do seu agendamento *amanhã*:
⏰ *Horário:* ${time}
💅 *Procedimento:* ${procedure || 'Atendimento'}

Por favor, confirme sua presença respondendo *SIM*.
Até amanhã! 😊✨`;
        WA.open(phone, msg);
    },

    // === BRINDE DE FIDELIDADE ===
    loyaltyReward(clientName, phone, reward, visitCount) {
        const msg =
`🎉 *Parabéns, ${clientName}!* 💕

Você atingiu *${visitCount} atendimentos* no nosso studio e ganhou:
🎁 *${reward}*

Agende seu próximo horário e venha resgatar seu presente!
Obrigada pela sua fidelidade! 💖✨`;
        WA.open(phone, msg);
    },

    // === LINK DE AVALIAÇÃO ===
    reviewLink(clientName, phone, reviewUrl) {
        reviewUrl = reviewUrl || `${location.origin}/avaliacao.html`;
        // Adiciona name e phone à URL para personalização e vínculo no Firestore
        const url = new URL(reviewUrl, location.origin);
        if (clientName) url.searchParams.set('name', clientName);
        if (phone)      url.searchParams.set('phone', phone);
        const finalUrl = url.toString();
        const msg =
`⭐ *Avalie seu atendimento — LashBrow*

Olá, *${clientName}*! 💕

Adoramos te receber! Que tal deixar uma avaliação rápida?

👇 Clique no link abaixo (leva menos de 1 minuto):
${finalUrl}

Sua opinião é muito importante para nós! 😊💕`;
        const num = WA._formatPhone(phone);
        if (!num) return finalUrl; // fallback: retorna URL sem WA
        return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    },

    // === ABRE LINK DE AVALIAÇÃO (para botão direto) ===
    reviewRequest(clientName, phone, reviewUrl) {
        const link = WA.reviewLink(clientName, phone, reviewUrl);
        if (!link || link.startsWith(location.origin)) {
            // Sem telefone: copia link
            navigator.clipboard?.writeText(reviewUrl || link).then(() =>
                App.showToast('Link de avaliação copiado! Cole no WhatsApp.', 'success')
            );
            return;
        }
        window.open(link, '_blank');
    }
};
