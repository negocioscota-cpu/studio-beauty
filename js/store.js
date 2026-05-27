// === Firestore Store — CRUD Operations ===
const Store = {
    // === CLIENTS ===
    async getClients() {
        const snapshot = await db.collection('clients').orderBy('name').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getClient(id) {
        const doc = await db.collection('clients').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async addClient(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.status = data.status || 'active';
        const ref = await db.collection('clients').add(data);
        return ref.id;
    },

    async updateClient(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('clients').doc(id).update(data);
    },

    async deleteClient(id) {
        await db.collection('clients').doc(id).delete();
    },

    // === APPOINTMENTS ===
    async getAppointments(dateFilter) {
        let query = db.collection('appointments').orderBy('date');
        if (dateFilter) {
            const start = new Date(dateFilter);
            start.setHours(0, 0, 0, 0);
            const end = new Date(dateFilter);
            end.setHours(23, 59, 59, 999);
            query = query.where('date', '>=', start).where('date', '<=', end);
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addAppointment(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.status = data.status || 'scheduled';
        const ref = await db.collection('appointments').add(data);
        return ref.id;
    },

    async updateAppointment(id, data) {
        await db.collection('appointments').doc(id).update(data);
    },

    async deleteAppointment(id) {
        await db.collection('appointments').doc(id).delete();
    },

    // === INVENTORY ===
    async getInventory() {
        const snapshot = await db.collection('inventory').orderBy('name').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addInventoryItem(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await db.collection('inventory').add(data);
        return ref.id;
    },

    async updateInventoryItem(id, data) {
        await db.collection('inventory').doc(id).update(data);
    },

    async deleteInventoryItem(id) {
        await db.collection('inventory').doc(id).delete();
    },

    // === SERVICES (sub-collection of clients) ===
    async getClientServices(clientId) {
        const snapshot = await db.collection('clients').doc(clientId)
            .collection('services').orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addClientService(clientId, data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await db.collection('clients').doc(clientId)
            .collection('services').add(data);
        return ref.id;
    },

    // === STATS ===
    async getDashboardStats() {
        const clientsSnap = await db.collection('clients').get();
        const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointmentsSnap = await db.collection('appointments')
            .where('date', '>=', today)
            .where('date', '<', tomorrow)
            .get();

        const active = clients.filter(c => c.status === 'active').length;
        const prospects = clients.filter(c => c.status === 'prospect').length;
        const inactive = clients.filter(c => c.status === 'inactive').length;

        return {
            totalClients: clients.length,
            activeClients: active,
            prospects,
            inactiveClients: inactive,
            todayAppointments: appointmentsSnap.size,
            clients
        };
    },

    // === INTERACTIONS ===
    async getInteractions() {
        const snapshot = await db.collection('interactions').orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addInteraction(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await db.collection('interactions').add(data);
        return ref.id;
    },

    async updateInteraction(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('interactions').doc(id).update(data);
    },

    async deleteInteraction(id) {
        await db.collection('interactions').doc(id).delete();
    },

    async getInteractions() {
        const snapshot = await db.collection('interactions').orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // === INVENTORY UPDATE ===
    async updateInventoryItem(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('inventory').doc(id).update(data);
    },

    // === MOVEMENT LOG ===
    async addMovementLog(entry) {
        entry.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        entry.user = firebase.auth().currentUser?.email || 'sistema';
        await db.collection('inventory_logs').add(entry);
    },

    async getMovementLogs(itemId) {
        const q = itemId
            ? db.collection('inventory_logs').where('itemId', '==', itemId).orderBy('timestamp', 'desc').limit(50)
            : db.collection('inventory_logs').orderBy('timestamp', 'desc').limit(100);
        const snap = await q.get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getInventoryByBarcode(barcode) {
        const snap = await db.collection('inventory').where('barcode', '==', barcode).limit(1).get();
        return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
    },

    // === REMINDERS (Follow-up) ===
    async getReminders() {
        const snap = await db.collection('reminders').orderBy('dueDate').get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addReminder(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.dismissed = false;
        const ref = await db.collection('reminders').add(data);
        return ref.id;
    },

    async deleteReminder(id) {
        await db.collection('reminders').doc(id).delete();
    },

    // === INVOICES (NFS-e) ===
    async getInvoices() {
        const snapshot = await db.collection('invoices').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addInvoice(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.user = firebase.auth().currentUser?.email || 'sistema';
        const ref = await db.collection('invoices').add(data);
        return ref.id;
    },

    async updateInvoice(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('invoices').doc(id).update(data);
    },

    async deleteInvoice(id) {
        await db.collection('invoices').doc(id).delete();
    },

    // === SERVICES ===
    async getServices() {
        const snapshot = await db.collection('services').orderBy('name').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addService(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await db.collection('services').add(data);
        return ref.id;
    },

    async updateService(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('services').doc(id).update(data);
    },

    async deleteService(id) {
        await db.collection('services').doc(id).delete();
    },

    // === PORTFOLIO ===
    async getPortfolioItems() {
        const snapshot = await db.collection('portfolio').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addPortfolioItem(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await db.collection('portfolio').add(data);
        return ref.id;
    },

    async deletePortfolioItem(id) {
        await db.collection('portfolio').doc(id).delete();
    },

    // === TEAM ===
    async getTeam() {
        const snapshot = await db.collection('team').orderBy('name').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addTeamMember(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await db.collection('team').add(data);
        return ref.id;
    },

    async updateTeamMember(id, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('team').doc(id).update(data);
    },

    async deleteTeamMember(id) {
        await db.collection('team').doc(id).delete();
    },

    // === TECHNICAL RECORDS (Anamnese/Fichas) ===
    async getTechnicalRecords(clientId = null) {
        let q = db.collection('technical_records');
        if (clientId) {
            q = q.where('clientId', '==', clientId);
        }
        q = q.orderBy('createdAt', 'desc');
        const snapshot = await q.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addTechnicalRecord(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await db.collection('technical_records').add(data);
        return ref.id;
    },

    async deleteTechnicalRecord(id) {
        await db.collection('technical_records').doc(id).delete();
    },

    // === CONSENTS ===
    async getConsents(clientId = null) {
        let q = db.collection('consents');
        if (clientId) {
            q = q.where('clientId', '==', clientId);
        }
        q = q.orderBy('createdAt', 'desc');
        const snapshot = await q.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addConsent(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await db.collection('consents').add(data);
        return ref.id;
    },

    // === REVIEWS ===
    async getReviews() {
        const snapshot = await db.collection('reviews').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addReview(data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await db.collection('reviews').add(data);
        return ref.id;
    }
};
