// === Firestore Store — LashBrow CRUD Operations ===
const Store = {
    // Retorna o UID do studio (owner). Para profissionais, retorna o ownerId.
    _uid() {
        if (typeof Team !== 'undefined' && Team.ownerId) return Team.ownerId;
        return firebase.auth().currentUser?.uid;
    },
    // Retorna o UID real do usuário logado (para filtros por profissional)
    _profUid() { return firebase.auth().currentUser?.uid; },

    // === CLIENTS ===
    async getClients() {
        const snap = await db.collection('clients').where('userId','==',this._uid()).orderBy('name').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async getClient(id) {
        const d = await db.collection('clients').doc(id).get();
        return d.exists ? { id: d.id, ...d.data() } : null;
    },
    async addClient(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.status = data.status || 'active';
        data.userId = this._uid();
        const ref = await db.collection('clients').add(data);
        return ref.id;
    },
    async updateClient(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('clients').doc(id).update(data);
    },
    async deleteClient(id) { await db.collection('clients').doc(id).delete(); },

    // === APPOINTMENTS ===
    async getAppointments(dateFilter, filterByProfessional) {
        let q = db.collection('appointments').where('userId','==',this._uid());
        // Profissional só vê sua própria agenda (a menos que owner filtre por profissional)
        if (typeof Team !== 'undefined' && Team.isProfessional()) {
            q = q.where('professionalId','==',this._profUid());
        } else if (filterByProfessional) {
            q = q.where('professionalId','==',filterByProfessional);
        }
        q = q.orderBy('date');
        if (dateFilter) {
            const s = new Date(dateFilter); s.setHours(0,0,0,0);
            const e = new Date(dateFilter); e.setHours(23,59,59,999);
            q = q.where('date','>=',s).where('date','<=',e);
        }
        const snap = await q.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addAppointment(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.status = data.status || 'scheduled';
        data.userId = this._uid();
        data.professionalId = data.professionalId || this._profUid();
        data.professionalName = data.professionalName || Team?.profData?.name || firebase.auth().currentUser?.displayName || '';
        const ref = await db.collection('appointments').add(data);
        return ref.id;
    },
    // Busca appointments por intervalo de datas (para visão semanal/mensal)
    async getAppointmentsRange(startDate, endDate) {
        let q = db.collection('appointments').where('userId','==',this._uid());
        if (typeof Team !== 'undefined' && Team.isProfessional()) {
            q = q.where('professionalId','==',this._profUid());
        }
        q = q.where('date','>=',startDate).where('date','<',endDate).orderBy('date');
        const snap = await q.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async updateAppointment(id, data) { await db.collection('appointments').doc(id).update(data); },
    async deleteAppointment(id) { await db.collection('appointments').doc(id).delete(); },

    // === INVENTORY (Insumos de cílios/sobrancelhas) ===
    async getInventory() {
        const snap = await db.collection('inventory').where('userId','==',this._uid()).orderBy('name').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addInventoryItem(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.userId = this._uid();
        const ref = await db.collection('inventory').add(data);
        return ref.id;
    },
    async updateInventoryItem(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('inventory').doc(id).update(data);
    },
    async deleteInventoryItem(id) { await db.collection('inventory').doc(id).delete(); },

    // Logs de movimentação
    async addMovementLog(entry) {
        entry.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        entry.user = firebase.auth().currentUser?.email || 'sistema';
        entry.userId = this._uid();
        await db.collection('inventory_logs').add(entry);
    },
    async getMovementLogs(itemId) {
        let q = itemId
            ? db.collection('inventory_logs').where('itemId','==',itemId).orderBy('timestamp','desc').limit(50)
            : db.collection('inventory_logs').where('userId','==',this._uid()).orderBy('timestamp','desc').limit(100);
        const snap = await q.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // === FICHA TÉCNICA (Módulo Exclusivo LashBrow) ===
    async getFichasTecnicas(clientId) {
        let q = db.collection('ficha_tecnica').where('userId','==',this._uid());
        if (clientId) q = q.where('clientId','==',clientId);
        // Profissional só vê suas próprias fichas
        if (typeof Team !== 'undefined' && Team.isProfessional()) {
            q = q.where('professionalId','==',this._profUid());
        }
        q = q.orderBy('date','desc');
        const snap = await q.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addFichaTecnica(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.userId = this._uid();
        data.professionalId = this._profUid(); // Quem criou
        data.professionalName = Team?.profData?.name || firebase.auth().currentUser?.displayName || '';
        const ref = await db.collection('ficha_tecnica').add(data);
        return ref.id;
    },
    async updateFichaTecnica(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('ficha_tecnica').doc(id).update(data);
    },
    async deleteFichaTecnica(id) { await db.collection('ficha_tecnica').doc(id).delete(); },

    // === INTERACTIONS ===
    async getInteractions() {
        let q = db.collection('interactions').where('userId','==',this._uid());
        if (typeof Team !== 'undefined' && Team.isProfessional()) {
            q = q.where('professionalId','==',this._profUid());
        }
        const snap = await q.orderBy('date','desc').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addInteraction(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.userId = this._uid();
        data.professionalId = this._profUid();
        data.professionalName = Team?.profData?.name || firebase.auth().currentUser?.displayName || '';
        const ref = await db.collection('interactions').add(data);
        return ref.id;
    },
    async deleteInteraction(id) { await db.collection('interactions').doc(id).delete(); },

    // === REMINDERS ===
    async getReminders() {
        const snap = await db.collection('reminders').where('userId','==',this._uid()).orderBy('dueDate').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addReminder(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.dismissed = false; data.userId = this._uid();
        data.professionalId = this._profUid();
        const ref = await db.collection('reminders').add(data);
        return ref.id;
    },
    async deleteReminder(id) { await db.collection('reminders').doc(id).delete(); },

    // === INVOICES (Financeiro) ===
    async getInvoices() {
        const snap = await db.collection('invoices').where('userId','==',this._uid()).orderBy('createdAt','desc').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addInvoice(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.userId = this._uid();
        const ref = await db.collection('invoices').add(data);
        return ref.id;
    },
    async updateInvoice(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('invoices').doc(id).update(data);
    },
    async deleteInvoice(id) { await db.collection('invoices').doc(id).delete(); },

    // === EXPENSES (Contas a Pagar) ===
    async getExpenses(filters = {}) {
        // Query simples sem orderBy — ordena client-side para evitar índice composto
        let q = db.collection('expenses').where('userId','==',this._uid());
        const snap = await q.get();
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Filtros client-side
        if (filters.status) docs = docs.filter(d => d.status === filters.status);
        if (filters.from) {
            const from = new Date(filters.from); from.setHours(0,0,0,0);
            docs = docs.filter(d => {
                const dt = d.dueDate?.toDate ? d.dueDate.toDate() : (d.dueDate ? new Date(d.dueDate) : null);
                return dt && dt >= from;
            });
        }
        if (filters.to) {
            const to = new Date(filters.to); to.setHours(23,59,59,999);
            docs = docs.filter(d => {
                const dt = d.dueDate?.toDate ? d.dueDate.toDate() : (d.dueDate ? new Date(d.dueDate) : null);
                return dt && dt <= to;
            });
        }
        // Ordenar por dueDate client-side
        docs.sort((a, b) => {
            const da = a.dueDate?.toDate ? a.dueDate.toDate() : (a.dueDate ? new Date(a.dueDate) : new Date(0));
            const db_ = b.dueDate?.toDate ? b.dueDate.toDate() : (b.dueDate ? new Date(b.dueDate) : new Date(0));
            return da - db_;
        });
        return docs;
    },
    async addExpense(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.userId = this._uid();
        // Converter dueDate string para Timestamp
        if (data.dueDate && typeof data.dueDate === 'string') {
            data.dueDate = firebase.firestore.Timestamp.fromDate(new Date(data.dueDate + 'T00:00:00'));
        }
        const ref = await db.collection('expenses').add(data);
        return ref.id;
    },
    async updateExpense(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        if (data.dueDate && typeof data.dueDate === 'string') {
            data.dueDate = firebase.firestore.Timestamp.fromDate(new Date(data.dueDate + 'T00:00:00'));
        }
        await db.collection('expenses').doc(id).update(data);
    },
    async deleteExpense(id) { await db.collection('expenses').doc(id).delete(); },

    // === CLIENT HISTORY ===
    async getClientHistory(clientId) {
        const uid = this._uid();
        const [fichasSnap, aptsSnap, invsSnap] = await Promise.all([
            db.collection('clients').doc(clientId).collection('technicalSheets').orderBy('createdAt','desc').limit(20).get().catch(()=>({ docs: [] })),
            db.collection('appointments').where('userId','==',uid).where('clientId','==',clientId).orderBy('date','desc').limit(20).get().catch(()=>({ docs: [] })),
            db.collection('invoices').where('userId','==',uid).where('clientId','==',clientId).orderBy('createdAt','desc').limit(20).get().catch(()=>({ docs: [] }))
        ]);
        const fichas = fichasSnap.docs.map(d=>({ id:d.id, type:'ficha', ...d.data() }));
        const apts   = aptsSnap.docs.map(d=>({ id:d.id, type:'appointment', ...d.data() }));
        const invs   = invsSnap.docs.map(d=>({ id:d.id, type:'invoice', ...d.data() }));
        const history = [...fichas, ...apts].sort((a,b)=>{
            const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.date||0);
            const db2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.date||0);
            return db2 - da;
        });
        const totalSpent = invs.filter(i=>i.status==='paid').reduce((s,i)=>s+(i.value||0),0);
        return { history, totalVisits: apts.length + fichas.length, totalSpent };
    },

    // === INVENTORY (Estoque) ===
    async getInventory() {
        const snap = await db.collection('inventory').where('userId','==',this._uid()).orderBy('name','asc').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addInventoryItem(data) {
        data.userId = this._uid();
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        if (data.expiryDate && typeof data.expiryDate === 'string') {
            data.expiryDate = firebase.firestore.Timestamp.fromDate(new Date(data.expiryDate + 'T00:00:00'));
        }
        const ref = await db.collection('inventory').add(data);
        return ref.id;
    },
    async updateInventoryItem(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        if (data.expiryDate && typeof data.expiryDate === 'string') {
            data.expiryDate = firebase.firestore.Timestamp.fromDate(new Date(data.expiryDate + 'T00:00:00'));
        }
        await db.collection('inventory').doc(id).update(data);
    },
    async deleteInventoryItem(id) { await db.collection('inventory').doc(id).delete(); },

    // === SHOPPING LIST (Lista de Compras) ===
    async getShoppingList() {
        const snap = await db.collection('shoppingList').where('userId','==',this._uid()).orderBy('createdAt','desc').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addShoppingItem(data) {
        data.userId = this._uid();
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.checked = false;
        const ref = await db.collection('shoppingList').add(data);
        return ref.id;
    },
    async toggleShoppingItem(id, checked) {
        await db.collection('shoppingList').doc(id).update({ checked, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    },
    async deleteShoppingItem(id) { await db.collection('shoppingList').doc(id).delete(); },

    // === PORTFOLIO (Antes & Depois) ===
    async getPortfolio() {
        const snap = await db.collection('portfolio').where('userId','==',this._uid()).orderBy('date','desc').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addPortfolio(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.userId = this._uid();
        data.professionalId = this._profUid();
        data.professionalName = Team?.profData?.name || firebase.auth().currentUser?.displayName || '';
        const ref = await db.collection('portfolio').add(data);
        return ref.id;
    },
    async updatePortfolio(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('portfolio').doc(id).update(data);
    },
    async deletePortfolio(id) { await db.collection('portfolio').doc(id).delete(); },

    // Reminder update
    async updateReminder(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('reminders').doc(id).update(data);
    },

    // === CATALOG (Procedimentos/Serviços) ===
    async getCatalog() {
        const snap = await db.collection('catalog').where('userId','==',this._uid()).orderBy('name').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addCatalog(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.userId = this._uid();
        const ref = await db.collection('catalog').add(data);
        return ref.id;
    },
    async updateCatalog(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('catalog').doc(id).update(data);
    },
    async deleteCatalog(id) { await db.collection('catalog').doc(id).delete(); },

    // === COST ANALYSES (Calculadora de Custo) ===
    async getCostAnalyses() {
        const snap = await db.collection('cost_analyses').where('userId','==',this._uid()).orderBy('date','desc').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addCostAnalysis(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.userId = this._uid();
        const ref = await db.collection('cost_analyses').add(data);
        return ref.id;
    },
    async deleteCostAnalysis(id) { await db.collection('cost_analyses').doc(id).delete(); },

    // === CONSENTS (Termos de Consentimento) ===
    async getConsents(clientId) {
        let q = db.collection('consents').where('userId','==',this._uid());
        if (clientId) q = q.where('clientId','==',clientId);
        q = q.orderBy('date','desc');
        const snap = await q.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addConsent(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.userId = this._uid();
        const ref = await db.collection('consents').add(data);
        return ref.id;
    },
    async updateConsent(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('consents').doc(id).update(data);
    },
    async deleteConsent(id) { await db.collection('consents').doc(id).delete(); },

    // === DASHBOARD STATS ===
    async getDashboardStats() {
        const uid = this._uid();
        const clientsSnap = await db.collection('clients').where('userId','==',uid).get();
        const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const today = new Date(); today.setHours(0,0,0,0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

        // Agendamentos do dia (com dados completos para exibir)
        const apptSnap = await db.collection('appointments')
            .where('userId','==',uid).where('date','>=',today).where('date','<',tomorrow)
            .orderBy('date').get();
        const todayAppts = apptSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // === PERÍODO: últimos 6 meses (para gráfico de evolução + mês anterior) ===
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0,0,0,0);

        // Uma ÚNICA query para appointments dos últimos 6 meses (em vez de carregar TODOS)
        const recentApptSnap = await db.collection('appointments')
            .where('userId','==',uid).where('date','>=',sixMonthsAgo)
            .orderBy('date').get();
        const recentAppts = recentApptSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Mês atual
        const startMonth = new Date(today); startMonth.setDate(1); startMonth.setHours(0,0,0,0);
        // Mês anterior
        const startPrevMonth = new Date(startMonth); startPrevMonth.setMonth(startPrevMonth.getMonth() - 1);
        const endPrevMonth = new Date(startMonth);

        // Faturas do mês
        const invSnap = await db.collection('invoices')
            .where('userId','==',uid).where('createdAt','>=',startMonth).get();
        const monthInvRevenue = invSnap.docs.reduce((sum,d) => sum + (d.data().value || 0), 0);

        // Faturas do mês anterior
        const prevInvSnap = await db.collection('invoices')
            .where('userId','==',uid).where('createdAt','>=',startPrevMonth)
            .where('createdAt','<',endPrevMonth).get();
        const prevMonthInvRevenue = prevInvSnap.docs.reduce((sum,d) => sum + (d.data().value || 0), 0);

        // Separar agendamentos por mês atual e anterior
        const monthAppts = recentAppts.filter(a => {
            const dt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            return dt >= startMonth;
        });
        const prevMonthAppts = recentAppts.filter(a => {
            const dt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            return dt >= startPrevMonth && dt < endPrevMonth;
        });

        // Faturamento mês atual (invoices + appointments com preço)
        const monthApptRevenue = monthAppts.reduce((sum,a) => sum + parseFloat(a.price || 0), 0);
        const totalMonthRevenue = monthInvRevenue + monthApptRevenue;

        // Faturamento mês anterior
        const prevMonthApptRevenue = prevMonthAppts.reduce((sum,a) => sum + parseFloat(a.price || 0), 0);
        const totalPrevMonthRevenue = prevMonthInvRevenue + prevMonthApptRevenue;

        // Ticket médio mês atual
        const completedThisMonth = monthAppts.filter(a => parseFloat(a.price || 0) > 0).length;
        const avgTicket = completedThisMonth > 0 ? totalMonthRevenue / completedThisMonth : 0;

        // Ticket médio mês anterior
        const completedPrevMonth = prevMonthAppts.filter(a => parseFloat(a.price || 0) > 0).length;
        const prevAvgTicket = completedPrevMonth > 0 ? totalPrevMonthRevenue / completedPrevMonth : 0;

        // Novos clientes este mês e mês anterior
        const newClientsMonth = clients.filter(c => {
            if (!c.createdAt) return false;
            const ts = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
            return ts >= startMonth;
        }).length;
        const prevNewClientsMonth = clients.filter(c => {
            if (!c.createdAt) return false;
            const ts = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
            return ts >= startPrevMonth && ts < endPrevMonth;
        }).length;

        // Atendimentos mês anterior
        const prevMonthAppointments = prevMonthAppts.length;

        // Retoques pendentes nos próximos 7 dias
        const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
        const fichaSnap = await db.collection('ficha_tecnica')
            .where('userId','==',uid).where('nextRetouchDate','<=',nextWeek).get();
        const upcomingRetouches = fichaSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(f => f.nextRetouchDate)
            .sort((a,b) => {
                const da = a.nextRetouchDate?.toDate ? a.nextRetouchDate.toDate() : new Date(a.nextRetouchDate);
                const db2 = b.nextRetouchDate?.toDate ? b.nextRetouchDate.toDate() : new Date(b.nextRetouchDate);
                return da - db2;
            });

        // === GRÁFICO: últimos 7 dias (do cache de recentAppts, sem query extra) ===
        const last7 = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today); d.setDate(d.getDate() - i);
            const d2 = new Date(d); d2.setDate(d2.getDate() + 1);
            const count = recentAppts.filter(a => {
                const dt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                return dt >= d && dt < d2;
            }).length;
            last7.push({ label: d.toLocaleDateString('pt-BR', { weekday: 'short' }), count });
        }

        // === GRÁFICO: evolução últimos 6 meses ===
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const mStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const mEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
            const mAppts = recentAppts.filter(a => {
                const dt = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                return dt >= mStart && dt < mEnd;
            });
            const mRevenue = mAppts.reduce((s, a) => s + parseFloat(a.price || 0), 0);
            last6Months.push({
                label: mStart.toLocaleDateString('pt-BR', { month: 'short' }),
                month: mStart.toLocaleDateString('pt-BR', { month: 'long' }),
                year: mStart.getFullYear(),
                appointments: mAppts.length,
                revenue: mRevenue,
                clients: clients.filter(c => {
                    if (!c.createdAt) return false;
                    const ts = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
                    return ts >= mStart && ts < mEnd;
                }).length
            });
        }

        // === META MENSAL (do studioConfig) ===
        let monthlyGoal = 0;
        try {
            const goalDoc = await db.collection('studioConfig').doc(uid).get();
            if (goalDoc.exists) monthlyGoal = goalDoc.data().monthlyGoal || 0;
        } catch(e) { /* sem meta configurada */ }

        return {
            totalClients: clients.length,
            activeClients: clients.filter(c => c.status === 'active').length,
            inactiveClients: clients.filter(c => c.status === 'inactive').length,
            newClientsMonth,
            todayAppointments: todayAppts.length,
            todayAppts,
            monthRevenue: totalMonthRevenue,
            avgTicket,
            revenue: totalMonthRevenue,
            pendingRetouches: upcomingRetouches.length,
            upcomingRetouches,
            last7Days: last7,
            clients,
            // NOVOS: comparativo mês anterior
            prevMonthRevenue: totalPrevMonthRevenue,
            prevMonthAppointments,
            prevNewClientsMonth,
            prevAvgTicket,
            // NOVOS: evolução 6 meses
            last6Months,
            // NOVOS: meta
            monthlyGoal,
            monthAppointments: monthAppts.length
        };
    },

    // === HISTÓRICO POR CLIENTE ===
    async getClientHistory(clientId) {
        const uid = this._uid();
        // Fichas técnicas
        const fichaSnap = await db.collection('ficha_tecnica')
            .where('userId','==',uid).where('clientId','==',clientId)
            .orderBy('date','desc').get();
        const fichas = fichaSnap.docs.map(d => ({ id: d.id, type: 'ficha', ...d.data() }));

        // Appointments
        const apptSnap = await db.collection('appointments')
            .where('userId','==',uid).where('clientId','==',clientId)
            .orderBy('date','desc').get();
        const appts = apptSnap.docs.map(d => ({ id: d.id, type: 'appointment', ...d.data() }));

        // Merge e sort por data desc
        const all = [...fichas, ...appts].sort((a, b) => {
            const da = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
            const db2 = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
            return db2 - da;
        });

        // Totais
        const totalSpent = appts.reduce((s, a) => s + parseFloat(a.price || 0), 0);
        const lastVisit = all.length > 0 ? all[0] : null;

        return { history: all, totalSpent, totalVisits: appts.length, lastVisit };
    },

    // === PORTFÓLIO POR CLIENTE ===
    async getPortfolioByClient(clientId) {
        const snap = await db.collection('portfolio')
            .where('userId','==',this._uid())
            .where('clientId','==',clientId)
            .orderBy('date','desc').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // === AVALIAÇÕES (REVIEWS) ===
    async addReview(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        return db.collection('reviews').add(data);
    },
    async getReviews() {
        const uid = this._uid();
        const snap = await db.collection('reviews').where('studioId','==',uid).orderBy('createdAt','desc').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async getAvgRating() {
        const reviews = await this.getReviews();
        if (!reviews.length) return { avg: 0, total: 0 };
        const avg = reviews.reduce((s,r) => s + (r.rating || 0), 0) / reviews.length;
        return { avg: Math.round(avg * 10) / 10, total: reviews.length };
    },

    // === PROGRAMA DE FIDELIDADE ===
    async getLoyaltyConfig() {
        const uid = this._uid();
        const doc = await db.collection('studios').doc(uid).get();
        return doc.exists && doc.data().loyalty ? doc.data().loyalty : { threshold: 10, reward: 'Manutenção grátis' };
    },
    async saveLoyaltyConfig(config) {
        const uid = this._uid();
        await db.collection('studios').doc(uid).set({ loyalty: config }, { merge: true });
    },
    async getAllAppointmentsDone() {
        const snap = await db.collection('appointments')
            .where('userId','==',this._uid())
            .where('status','==','done').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    // Verifica se o cliente atingiu o marco de fidelidade (retorna reached + totalVisits)
    async checkLoyaltyMilestone(clientId, threshold) {
        const snap = await db.collection('appointments')
            .where('userId','==',this._uid())
            .where('clientId','==',clientId)
            .where('status','==','done').get();
        const total = snap.size;
        const reached = threshold > 0 && total > 0 && total % threshold === 0;
        return { reached, totalVisits: total };
    },

    // === AVALIAÇÕES POR CLIENTE ===
    async getClientReviews(clientPhone) {
        if (!clientPhone) return [];
        const snap = await db.collection('reviews')
            .where('studioId','==',this._uid())
            .where('clientPhone','==',clientPhone)
            .orderBy('createdAt','desc').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // === FIDELIDADE POR CLIENTE ===
    async getClientLoyalty(clientId) {
        const [config, milestone] = await Promise.all([
            this.getLoyaltyConfig().catch(() => ({ threshold: 10, reward: 'Manutenção grátis' })),
            db.collection('appointments')
                .where('userId','==',this._uid())
                .where('clientId','==',clientId)
                .where('status','==','done').get()
        ]);
        const totalVisits = milestone.size;
        const progress = config.threshold > 0
            ? Math.min(100, Math.round((totalVisits % config.threshold) / config.threshold * 100))
            : 0;
        const milestones = config.threshold > 0 ? Math.floor(totalVisits / config.threshold) : 0;
        const nextIn = config.threshold > 0 ? config.threshold - (totalVisits % config.threshold) : 0;
        return { totalVisits, progress, milestones, nextIn, config };
    },

    // === NOTA MÉDIA GLOBAL DO ESTÚDIO (NPS Dashboard) ===
    async getAvgRating() {
        const snap = await db.collection('reviews')
            .where('studioId', '==', this._uid())
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();
        const docs = snap.docs.map(d => d.data());
        if (!docs.length) return { avg: 0, total: 0, recent: [] };
        const sum = docs.reduce((acc, d) => acc + (d.rating || 0), 0);
        return {
            avg: sum / docs.length,
            total: docs.length,
            recent: docs.slice(0, 5)
        };
    },

    // === COMISSÃO DE PROFISSIONAIS ===
    // config é um objeto { [professionalId]: { type: 'percent'|'fixed', value: Number, label: String } }
    async getCommissionConfig() {
        const uid = this._uid();
        const doc = await db.collection('studios').doc(uid).get();
        return (doc.exists && doc.data().commissions) ? doc.data().commissions : {};
    },
    async saveCommissionConfig(config) {
        const uid = this._uid();
        await db.collection('studios').doc(uid).set({ commissions: config }, { merge: true });
    },
    // Retorna os atendimentos concluídos de um profissional num período, com valor e cálculo de comissão
    async getCommissionSummary(professionalId, from, to) {
        let q = db.collection('appointments')
            .where('userId', '==', this._uid())
            .where('status', '==', 'done');
        if (professionalId) q = q.where('professionalId', '==', professionalId);
        if (from) q = q.where('date', '>=', from);
        if (to)   q = q.where('date', '<=', to);
        const snap = await q.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // === ESTOQUE (INVENTÁRIO) ===
    async getInventory() {
        const snap = await db.collection('inventory')
            .where('userId', '==', this._uid())
            .orderBy('name')
            .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addInventoryItem(data) {
        return db.collection('inventory').add({
            userId: this._uid(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            ...data
        });
    },
    async updateInventoryItem(itemId, data) {
        return db.collection('inventory').doc(itemId).update({
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            ...data
        });
    },
    async deleteInventoryItem(itemId) {
        return db.collection('inventory').doc(itemId).delete();
    },
    // Registra um log de uso de estoque num atendimento
    async logInventoryUsage(apptId, usedItems) {
        if (!usedItems || usedItems.length === 0) return;
        return db.collection('inventory_logs').add({
            userId: this._uid(),
            apptId,
            usedItems,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
};

