// === Team & Roles Module — LashBrow Multi-Professional ===
const Team = {
    currentRole: null,    // 'owner' | 'professional'
    ownerId: null,        // UID do dono do studio (para profissionais = ownerId, para owners = próprio uid)
    profData: null,       // Dados do profissional (se for professional)
    planLimits: { solo: 1, studio: 3, premium: 10 }, // Total incluindo owner

    // === Inicialização ===
    async detectRole(uid) {
        // 1. Verifica se é owner em 'studios' (coleção atual)
        const studioDoc = await db.collection('studios').doc(uid).get();
        if (studioDoc.exists) {
            Team.currentRole = 'owner';
            Team.ownerId = uid;
            Team.profData = null;
            console.log('👑 Papel detectado: Owner (studios)');
            return 'owner';
        }

        // 1b. Fallback legacy: verifica 'companies'
        try {
            const companyDoc = await db.collection('companies').doc(uid).get();
            if (companyDoc.exists) {
                Team.currentRole = 'owner';
                Team.ownerId = uid;
                Team.profData = null;
                console.log('👑 Papel detectado: Owner (companies/legacy)');
                return 'owner';
            }
        } catch(e) { /* ignorar se não tiver permissão */ }

        // 2. Verifica se é profissional vinculado
        const profDoc = await db.collection('professionals').doc(uid).get();
        if (profDoc.exists && profDoc.data().status === 'active') {
            Team.currentRole = 'professional';
            Team.ownerId = profDoc.data().ownerId;
            Team.profData = { id: uid, ...profDoc.data() };
            console.log('💼 Papel detectado: Profissional vinculado a', Team.ownerId);
            return 'professional';
        }

        // 3. Novo usuário sem vínculo — tratar como owner do próprio espaço
        Team.currentRole = 'owner';
        Team.ownerId = uid;
        Team.profData = null;
        console.log('🆕 Novo usuário — tratado como Owner');
        return 'owner';
    },

    isOwner()        { return Team.currentRole === 'owner'; },
    isProfessional() { return Team.currentRole === 'professional'; },

    // Retorna o UID que deve ser usado para queries de dados do studio
    getStudioUid() {
        return Team.ownerId || firebase.auth().currentUser?.uid;
    },

    // === Controle de Acesso por Página ===
    // Páginas que profissionais podem acessar
    professionalPages: [
        'dashboard', 'clients', 'schedule', 'ficha',
        'portfolio', 'reminders', 'consent', 'birthday', 'interactions'
    ],

    // Páginas exclusivas do owner
    ownerOnlyPages: [
        'reports', 'invoices', 'inventory', 'catalog',
        'bolsa-beleza', 'referrals', 'settings', 'team'
    ],

    canAccess(page) {
        if (Team.isOwner()) return true;
        if (Team.isProfessional()) return Team.professionalPages.includes(page);
        return false;
    },

    // === CRUD Equipe (apenas owner) ===
    async getTeamMembers() {
        const uid = Team.getStudioUid();
        const snap = await db.collection('professionals')
            .where('ownerId', '==', uid)
            .orderBy('name')
            .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async getTeamLimit() {
        const uid = Team.getStudioUid();
        const doc = await db.collection('companies').doc(uid).get();
        if (!doc.exists) return 1;
        const plan = doc.data().plan || doc.data().selectedPlan || 'solo';
        // Mapeia o plano para o limite
        if (plan === 'premium' || plan === 'Premium') return 10;
        if (plan === 'studio' || plan === 'Studio') return 3;
        return 1; // solo
    },

    async inviteProfessional(ownerId, email, name, phone) {
        if (!Team.isOwner()) throw new Error('Apenas o proprietário pode convidar profissionais.');

        const ownerUid = ownerId || Team.ownerId;

        // Verifica limite
        const members = await Team.getTeamMembers();
        const limit = await Team.getTeamLimit();
        // +1 porque o owner conta como 1
        if (members.length + 1 >= limit) {
            return { success: false, error: `Limite atingido! Seu plano permite até ${limit} profissionais (incluindo você). Faça upgrade para adicionar mais.` };
        }

        // Verifica se já existe convite para este email
        const existing = members.find(m => m.email === email.toLowerCase());
        if (existing) {
            return { success: false, error: 'Este e-mail já está vinculado ao seu studio.' };
        }

        // Verifica se já existe convite pendente
        const pendingSnap = await db.collection('team_invites')
            .where('ownerId', '==', ownerUid)
            .where('email', '==', email.toLowerCase())
            .where('status', '==', 'pending')
            .get();
        if (!pendingSnap.empty) {
            return { success: false, error: 'Já existe um convite pendente para este e-mail.' };
        }

        // Cria documento de convite
        const inviteData = {
            ownerId: ownerUid,
            name: name,
            email: email.toLowerCase(),
            phone: phone || '',
            role: 'professional',
            status: 'pending',
            invitedAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const ref = await db.collection('team_invites').add(inviteData);

        // Também cria registro pendente na collection professionals
        await db.collection('professionals').add({
            ...inviteData,
            inviteId: ref.id
        });

        // Salva na subcoleção team do company para referência rápida
        await db.collection('companies').doc(ownerUid)
            .collection('team').doc(ref.id).set({
                name, email: email.toLowerCase(), role: 'professional',
                status: 'pending', inviteId: ref.id
            });

        return { success: true, inviteId: ref.id };
    },

    async activateProfessional(profDocId, authUid) {
        // Chamado quando um profissional faz login e encontra seu convite pelo email
        await db.collection('professionals').doc(profDocId).update({
            authUid: authUid,
            status: 'active',
            activatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Cria documento com o UID real para lookup rápido
        await db.collection('professionals').doc(authUid).set({
            ownerId: (await db.collection('professionals').doc(profDocId).get()).data().ownerId,
            name: (await db.collection('professionals').doc(profDocId).get()).data().name,
            email: (await db.collection('professionals').doc(profDocId).get()).data().email,
            phone: (await db.collection('professionals').doc(profDocId).get()).data().phone || '',
            role: 'professional',
            status: 'active',
            originalInviteId: profDocId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    async removeProfessional(ownerId, profDocId) {
        if (!Team.isOwner()) throw new Error('Apenas o proprietário pode remover profissionais.');
        
        const ownerUid = ownerId || Team.ownerId;
        const profDoc = await db.collection('professionals').doc(profDocId).get();
        if (profDoc.exists) {
            const data = profDoc.data();
            // Marca como inativo (soft delete)
            await db.collection('professionals').doc(profDocId).update({ status: 'inactive' });
            
            // Se tem authUid, marca esse doc também
            if (data.authUid) {
                const authDoc = await db.collection('professionals').doc(data.authUid).get();
                if (authDoc.exists) {
                    await db.collection('professionals').doc(data.authUid).update({ status: 'inactive' });
                }
            }

            // Atualiza subcoleção team (tenta com catch pois pode não existir)
            try {
                await db.collection('companies').doc(ownerUid)
                    .collection('team').doc(profDocId).update({ status: 'inactive' });
            } catch (e) { /* ignore */ }
        }
    },

    async reactivateProfessional(profDocId) {
        if (!Team.isOwner()) throw new Error('Apenas o proprietário pode reativar profissionais.');
        
        const profDoc = await db.collection('professionals').doc(profDocId).get();
        if (profDoc.exists) {
            const data = profDoc.data();
            await db.collection('professionals').doc(profDocId).update({ status: 'active' });
            
            if (data.authUid) {
                const authDoc = await db.collection('professionals').doc(data.authUid).get();
                if (authDoc.exists) {
                    await db.collection('professionals').doc(data.authUid).update({ status: 'active' });
                }
            }

            await db.collection('companies').doc(Team.ownerId)
                .collection('team').doc(profDocId).update({ status: 'active' });
        }
    },

    // Chamado no login: verifica se o email do usuário tem convite pendente
    async checkPendingInvite(uid, email) {
        const snap = await db.collection('professionals')
            .where('email', '==', email.toLowerCase())
            .where('status', '==', 'pending')
            .limit(1)
            .get();

        if (!snap.empty) {
            const inviteDoc = snap.docs[0];
            const inviteData = inviteDoc.data();
            
            // Ativa o profissional com o UID real
            await db.collection('professionals').doc(uid).set({
                ownerId: inviteData.ownerId,
                name: inviteData.name,
                email: email.toLowerCase(),
                phone: inviteData.phone || '',
                role: 'professional',
                status: 'active',
                originalInviteId: inviteDoc.id,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Atualiza o documento de convite original
            await db.collection('professionals').doc(inviteDoc.id).update({
                authUid: uid,
                status: 'active',
                activatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Atualiza subcoleção team
            await db.collection('companies').doc(inviteData.ownerId)
                .collection('team').doc(inviteDoc.id).update({
                    status: 'active', authUid: uid
                });

            return true;
        }
        return false;
    }
};
