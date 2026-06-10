// ══════════════════════════════════════════════════════════════════
// Push Notifications PWA — Studio Beauty
// Notificações locais no dispositivo da profissional:
//   🎂 Aniversariantes do dia
//   📦 Estoque baixo
//   🔔 Lembrete D-1 de agendamentos
// ══════════════════════════════════════════════════════════════════

const PushNotifications = {
    // Estado
    _permission: 'default',
    _checkInterval: null,

    // ===== INICIALIZAÇÃO =====
    async init() {
        if (!('Notification' in window)) {
            console.log('[Push] Notifications API não suportada neste navegador.');
            return;
        }
        PushNotifications._permission = Notification.permission;

        // Se já tem permissão, agendar checagens
        if (Notification.permission === 'granted') {
            PushNotifications._scheduleChecks();
        }
    },

    // ===== SOLICITAR PERMISSÃO =====
    async requestPermission() {
        if (!('Notification' in window)) {
            App.showToast('⚠️ Seu navegador não suporta notificações push.', 'info');
            return false;
        }
        try {
            const result = await Notification.requestPermission();
            PushNotifications._permission = result;
            if (result === 'granted') {
                App.showToast('🔔 Notificações ativadas com sucesso!', 'success');
                PushNotifications._scheduleChecks();
                // Salvar preferência no Firestore
                const uid = firebase.auth().currentUser?.uid;
                if (uid) {
                    await db.collection('studios').doc(uid).set({
                        notifications: { push: true, pushGranted: true }
                    }, { merge: true });
                }
                return true;
            } else {
                App.showToast('❌ Permissão de notificação negada. Ative nas configurações do navegador.', 'error');
                return false;
            }
        } catch(e) {
            console.error('[Push] Erro ao solicitar permissão:', e);
            return false;
        }
    },

    // ===== VERIFICAR PERMISSÃO =====
    isGranted() {
        return 'Notification' in window && Notification.permission === 'granted';
    },

    // ===== AGENDAR CHECAGENS PERIÓDICAS =====
    _scheduleChecks() {
        // Executar imediatamente na abertura do app
        setTimeout(() => PushNotifications.checkAll(), 3000);

        // Depois a cada 30 minutos
        if (PushNotifications._checkInterval) clearInterval(PushNotifications._checkInterval);
        PushNotifications._checkInterval = setInterval(() => {
            PushNotifications.checkAll();
        }, 30 * 60 * 1000); // 30 min
    },

    // ===== VERIFICAR TUDO =====
    async checkAll() {
        if (!PushNotifications.isGranted()) return;
        const uid = firebase.auth().currentUser?.uid;
        if (!uid) return;

        // Verificar preferências do usuário
        let prefs = {};
        try {
            const doc = await db.collection('studios').doc(uid).get();
            if (doc.exists) prefs = doc.data().notifications || {};
        } catch(e) {}

        // Se push desativado nas configurações, não enviar
        if (prefs.push === false) return;

        // Verificar se já notificou hoje (evitar duplicatas)
        const todayKey = new Date().toISOString().split('T')[0];
        const lastCheck = localStorage.getItem('push_last_check');

        if (lastCheck !== todayKey) {
            localStorage.setItem('push_last_check', todayKey);

            // 🎂 Aniversariantes
            if (prefs.pushBirthday !== false) {
                await PushNotifications._checkBirthdays();
            }

            // 📦 Estoque baixo
            if (prefs.pushStock !== false) {
                await PushNotifications._checkLowStock();
            }
        }

        // 🔔 Lembrete D-1 (verificar a cada check)
        if (prefs.pushReminder !== false) {
            await PushNotifications._checkTomorrowReminders();
        }

        // ☀️ Lembrete D-0 — manhã do dia
        if (prefs.pushD0 !== false) {
            await PushNotifications._checkTodayReminders();
        }

        // 📅 Novos agendamentos online
        if (prefs.pushBooking !== false) {
            await PushNotifications._checkNewBookings();
        }
    },

    // ===== 🎂 ANIVERSARIANTES DO DIA =====
    async _checkBirthdays() {
        try {
            const clients = await Store.getClients();
            const today = new Date();
            const todayMonth = today.getMonth();
            const todayDate = today.getDate();

            const birthdays = clients.filter(c => {
                if (!c.birthday) return false;
                let bDate;
                if (c.birthday.toDate) bDate = c.birthday.toDate();
                else bDate = new Date(c.birthday + 'T12:00:00');
                if (isNaN(bDate.getTime())) return false;
                return bDate.getMonth() === todayMonth && bDate.getDate() === todayDate;
            });

            if (birthdays.length > 0) {
                const names = birthdays.map(c => c.name.split(' ')[0]).join(', ');
                PushNotifications._send({
                    title: `🎂 ${birthdays.length} aniversariante${birthdays.length > 1 ? 's' : ''} hoje!`,
                    body: `Parabéns para: ${names}. Envie uma mensagem de felicitações! 💕`,
                    icon: '/icons/icon-192.png',
                    tag: 'birthday-' + today.toISOString().split('T')[0],
                    data: { action: 'birthday' }
                });
            }
        } catch(e) {
            console.warn('[Push] Erro ao verificar aniversariantes:', e);
        }
    },

    // ===== 📦 ESTOQUE BAIXO =====
    async _checkLowStock() {
        try {
            const items = await Store.getInventory();
            const lowStock = items.filter(i => i.qty <= i.minQty);

            if (lowStock.length > 0) {
                const itemNames = lowStock.slice(0, 3).map(i => `${i.name} (${i.qty})`).join(', ');
                const extra = lowStock.length > 3 ? ` e mais ${lowStock.length - 3}` : '';
                PushNotifications._send({
                    title: `📦 ${lowStock.length} produto${lowStock.length > 1 ? 's' : ''} com estoque baixo`,
                    body: `${itemNames}${extra}. Reponha para não ficar sem material! ⚠️`,
                    icon: '/icons/icon-192.png',
                    tag: 'stock-' + new Date().toISOString().split('T')[0],
                    data: { action: 'inventory' }
                });
            }
        } catch(e) {
            console.warn('[Push] Erro ao verificar estoque:', e);
        }
    },

    // ===== 🔔 LEMBRETE D-1 =====
    async _checkTomorrowReminders() {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            // Verificar se já notificou D-1 para amanhã
            const d1Key = `push_d1_${tomorrowStr}`;
            if (localStorage.getItem(d1Key)) return;

            // Só enviar D-1 à tarde (após 14h) ou à noite
            const hour = new Date().getHours();
            if (hour < 14) return;

            const appts = await Store.getAppointments(tomorrowStr);
            const active = appts.filter(a => a.status !== 'canceled');

            if (active.length > 0) {
                const first = active.sort((a,b) => (a.time||'').localeCompare(b.time||''))[0];
                const firstName = (Schedule?.currentClients?.find(c => c.id === first.clientId)?.name || first.clientName || 'Cliente').split(' ')[0];

                PushNotifications._send({
                    title: `🔔 ${active.length} agendamento${active.length > 1 ? 's' : ''} amanhã`,
                    body: active.length === 1
                        ? `${firstName} às ${first.time || '--:--'} — ${first.procedure || 'Atendimento'}`
                        : `Primeiro: ${firstName} às ${first.time || '--:--'}. Confirme com suas clientes!`,
                    icon: '/icons/icon-192.png',
                    tag: 'd1-' + tomorrowStr,
                    data: { action: 'schedule' }
                });

                localStorage.setItem(d1Key, 'true');
            }
        } catch(e) {
            console.warn('[Push] Erro ao verificar lembretes D-1:', e);
        }
    },

    // ===== ☀️ LEMBRETE D-0 (HOJE) =====
    async _checkTodayReminders() {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const d0Key = `push_d0_${todayStr}`;
            if (localStorage.getItem(d0Key)) return;

            // Só enviar pela manhã (entre 7h e 10h)
            const hour = new Date().getHours();
            if (hour < 7 || hour > 10) return;

            const appts = await Store.getAppointments(todayStr);
            const active = appts.filter(a => a.status !== 'canceled');

            if (active.length > 0) {
                const sorted = active.sort((a,b) => (a.time||'').localeCompare(b.time||''));
                const firstName = (sorted[0].clientName || 'Cliente').split(' ')[0];

                PushNotifications._send({
                    title: `☀️ ${active.length} agendamento${active.length > 1 ? 's' : ''} hoje!`,
                    body: active.length === 1
                        ? `${firstName} às ${sorted[0].time || '--:--'} — ${sorted[0].procedure || 'Atendimento'}`
                        : `Primeiro: ${firstName} às ${sorted[0].time || '--:--'}. Bom dia de trabalho! 💕`,
                    icon: '/icons/icon-192.png',
                    tag: 'd0-' + todayStr,
                    data: { action: 'schedule' }
                });

                localStorage.setItem(d0Key, 'true');
            }
        } catch(e) {
            console.warn('[Push] Erro ao verificar lembretes D-0:', e);
        }
    },

    // ===== 📅 NOVOS AGENDAMENTOS ONLINE =====
    async _checkNewBookings() {
        try {
            const uid = firebase.auth().currentUser?.uid;
            if (!uid) return;

            const lastBookingCheck = localStorage.getItem('push_last_booking_check') || '2000-01-01';
            const cutoff = new Date(lastBookingCheck);

            // Buscar agendamentos criados após a última verificação
            const snap = await db.collection('appointments')
                .where('userId', '==', uid)
                .where('source', '==', 'online')
                .where('createdAt', '>', cutoff)
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            if (!snap.empty) {
                const newBookings = snap.docs.map(d => d.data());
                const clientName = (newBookings[0].clientName || 'Cliente').split(' ')[0];

                if (newBookings.length === 1) {
                    PushNotifications._send({
                        title: '📅 Novo agendamento online!',
                        body: `${clientName} agendou ${newBookings[0].procedure || 'um atendimento'} para ${newBookings[0].date || 'em breve'}`,
                        icon: '/icons/icon-192.png',
                        tag: 'booking-' + Date.now(),
                        data: { action: 'schedule' }
                    });
                } else {
                    PushNotifications._send({
                        title: `📅 ${newBookings.length} novos agendamentos online!`,
                        body: `${clientName} e mais ${newBookings.length - 1} agendaram. Confira sua agenda!`,
                        icon: '/icons/icon-192.png',
                        tag: 'booking-' + Date.now(),
                        data: { action: 'schedule' }
                    });
                }
            }

            localStorage.setItem('push_last_booking_check', new Date().toISOString());
        } catch(e) {
            console.warn('[Push] Erro ao verificar novos bookings:', e);
        }
    },

    // ===== ENVIAR NOTIFICAÇÃO =====
    _send({ title, body, icon, tag, data }) {
        if (!PushNotifications.isGranted()) return;

        try {
            // Tentar via Service Worker (funciona em background)
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, {
                        body,
                        icon: icon || '/icons/icon-192.png',
                        badge: '/icons/icon-192.png',
                        tag,
                        data,
                        vibrate: [200, 100, 200],
                        requireInteraction: false,
                        actions: data?.action === 'birthday'
                            ? [{ action: 'open-birthday', title: '🎂 Ver aniversariantes' }]
                            : data?.action === 'inventory'
                            ? [{ action: 'open-inventory', title: '📦 Ver estoque' }]
                            : [{ action: 'open-schedule', title: '📅 Ver agenda' }]
                    });
                });
            } else {
                // Fallback: Notification API direta (não funciona em background)
                new Notification(title, { body, icon, tag, data });
            }
        } catch(e) {
            console.warn('[Push] Erro ao enviar notificação:', e);
        }
    },

    // ===== ENVIAR NOTIFICAÇÃO DE TESTE =====
    sendTest() {
        if (!PushNotifications.isGranted()) {
            PushNotifications.requestPermission().then(granted => {
                if (granted) PushNotifications._sendTestNotification();
            });
            return;
        }
        PushNotifications._sendTestNotification();
    },

    _sendTestNotification() {
        PushNotifications._send({
            title: '✅ Notificações funcionando!',
            body: 'Você receberá alertas de aniversariantes, estoque baixo e lembretes D-1.',
            icon: '/icons/icon-192.png',
            tag: 'test-' + Date.now(),
            data: { action: 'test' }
        });
        App.showToast('Notificação de teste enviada! 🔔', 'success');
    }
};

// Auto-inicializar quando o app carregar
document.addEventListener('DOMContentLoaded', () => {
    // Esperar autenticação
    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                setTimeout(() => PushNotifications.init(), 2000);
            }
        });
    }
});
