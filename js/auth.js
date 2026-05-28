// === URL Parameter Tracking (Referal + Plano) ===
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref');
const planoParam = urlParams.get('plano'); // solo | studio | premium
if (refCode) localStorage.setItem('referralCode', refCode);
if (planoParam) localStorage.setItem('selectedPlan', planoParam);

// === Auth Module — LashBrow ===
const Auth = {
    currentUser: null,
    isRecoveryMode: false,

    init(telaParam) {
        // Listener único de estado de autenticação
        auth.onAuthStateChanged(async user => {
            Auth.currentUser = user;

            // Oculta o overlay de loading sempre que o estado resolver
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => { overlay.style.display = 'none'; }, 400);
            }

            const loginScreen    = document.getElementById('login-screen');
            const registerScreen = document.getElementById('register-screen');
            const appShell       = document.getElementById('app-shell');
            const blockedScreen  = document.getElementById('blocked-screen');

            if (user) {
                try {
                    const doc = await db.collection('companies').doc(user.uid).get();

                    // 📴 Log quando dados vêm do cache offline do Firestore
                    if (doc.metadata.fromCache) {
                        console.log('📴 Verificação de acesso usando cache offline');
                    }

                    if (doc.exists) {
                        const data = doc.data();
                        const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
                        const now = new Date();
                        const TRIAL_DAYS = 14;

                        // Status do Asaas (preenchido pelo webhook)
                        const subStatus = data.subscriptionStatus; // active | overdue | cancelled | pending_payment | null

                        // 🟢 Cache do status para uso offline
                        if (subStatus === 'active') {
                            localStorage.setItem(`sub_status_${user.uid}`, 'active');
                        } else if (!subStatus || subStatus === 'trial') {
                            const trialExpired = data.plan === 'free' &&
                                (now - createdAt > TRIAL_DAYS * 24 * 60 * 60 * 1000);
                            localStorage.setItem(`sub_status_${user.uid}`, trialExpired ? 'expired' : 'trial');
                        }

                        // Casos que bloqueiam o acesso:
                        // 1. Plano free E trial expirado (sem assinatura)
                        // 2. Assinatura cancelada/overdue
                        // 3. Campo status == 'blocked' (admin manual)
                        const trialExpired = !subStatus && data.plan === 'free' &&
                            (now - createdAt > TRIAL_DAYS * 24 * 60 * 60 * 1000);

                        const subscriptionBlocked = ['cancelled', 'overdue', 'refunded'].includes(subStatus);
                        const adminBlocked = data.status === 'blocked';

                        if (trialExpired || subscriptionBlocked || adminBlocked) {
                            loginScreen.classList.add('hidden');
                            registerScreen.classList.add('hidden');
                            appShell.classList.add('hidden');
                            if (blockedScreen) blockedScreen.classList.remove('hidden');

                            // Se tem plano selecionado da landing, auto-iniciar pagamento
                            const pendingPlan = data.selectedPlan;
                            if (pendingPlan && pendingPlan !== 'free' && !subStatus) {
                                // Atualizar título para novo cadastro
                                const titleEl = blockedScreen.querySelector('h2');
                                if (titleEl) titleEl.textContent = '🎉 Falta só o pagamento!';
                                const subtEl = blockedScreen.querySelector('p');
                                if (subtEl) subtEl.textContent = `Você escolheu o plano ${pendingPlan.charAt(0).toUpperCase() + pendingPlan.slice(1)}. Finalize abaixo:`;
                                // Destacar o plano escolhido
                                setTimeout(() => {
                                    const cards = blockedScreen.querySelectorAll('.plan-card');
                                    cards.forEach(card => {
                                        const text = card.textContent.toLowerCase();
                                        if (text.includes(pendingPlan)) {
                                            card.style.border = '2px solid var(--gold)';
                                            card.style.boxShadow = '0 0 12px rgba(201,169,110,0.3)';
                                        }
                                    });
                                }, 100);
                            }

                            // Se overdue, tentar exibir link de pagamento automaticamente
                            if (subStatus === 'overdue') {
                                Subscription.getPaymentLink(user.uid).then(link => {
                                    if (link) {
                                        const errorEl = document.getElementById('subscription-error');
                                        if (errorEl) {
                                            errorEl.className = 'auth-error';
                                            errorEl.innerHTML = `⚠️ Sua última cobrança está em aberto.
                                                <br><a href="${link}" target="_blank" class="btn btn-primary btn-full" style="margin-top:10px">
                                                Pagar agora</a>`;
                                            errorEl.classList.remove('hidden');
                                        }
                                    }
                                });
                            }
                            return;
                        }

                        // Se tem selectedPlan (veio da landing) e ainda não tem assinatura ativa,
                        // mas está dentro do trial, mostrar tela de pagamento
                        if (data.selectedPlan && data.selectedPlan !== 'free' && !subStatus) {
                            loginScreen.classList.add('hidden');
                            registerScreen.classList.add('hidden');
                            appShell.classList.add('hidden');
                            if (blockedScreen) blockedScreen.classList.remove('hidden');
                            const titleEl = blockedScreen.querySelector('h2');
                            if (titleEl) titleEl.textContent = '🎉 Bem-vinda! Finalize sua assinatura';
                            const subtEl = blockedScreen.querySelector('p');
                            if (subtEl) subtEl.textContent = `Você escolheu o plano ${data.selectedPlan.charAt(0).toUpperCase() + data.selectedPlan.slice(1)}. Complete o pagamento para ativar:`;
                            setTimeout(() => {
                                const cards = blockedScreen.querySelectorAll('.plan-card');
                                cards.forEach(card => {
                                    const text = card.textContent.toLowerCase();
                                    if (text.includes(data.selectedPlan)) {
                                        card.style.border = '2px solid var(--gold)';
                                        card.style.boxShadow = '0 0 12px rgba(201,169,110,0.3)';
                                    }
                                });
                            }, 100);
                            return;
                        }
                    }
                } catch (err) {
                    console.error('Erro ao verificar acesso:', err);
                    // 📴 Offline fail-safe: usar último status salvo no localStorage
                    const lastStatus = localStorage.getItem(`sub_status_${user.uid}`);
                    if (lastStatus === 'active' || lastStatus === 'trial') {
                        console.log('📴 Usando último status de assinatura salvo:', lastStatus);
                    } else if (lastStatus === 'expired') {
                        // Status expirado salvo — manter bloqueio
                        loginScreen.classList.add('hidden');
                        registerScreen.classList.add('hidden');
                        appShell.classList.add('hidden');
                        if (blockedScreen) blockedScreen.classList.remove('hidden');
                        return;
                    }
                    // Fail-safe geral: não bloquear
                }

                loginScreen.classList.add('hidden');
                registerScreen.classList.add('hidden');
                if (blockedScreen) blockedScreen.classList.add('hidden');
                appShell.classList.remove('hidden');

                document.getElementById('user-name').textContent =
                    user.displayName || user.email.split('@')[0];
                document.getElementById('user-role').textContent = user.email;

                // 🔑 Detectar role (owner vs profissional)
                try {
                    // Primeiro verifica se há convite pendente para este email
                    await Team.checkPendingInvite(user.uid, user.email);
                    await Team.detectRole(user.uid);
                } catch (roleErr) {
                    console.warn('Erro ao detectar role:', roleErr);
                    // Fallback: tratar como owner do próprio UID
                    Team.currentRole = 'owner';
                    Team.ownerId = user.uid;
                }

                // Filtrar sidebar conforme role
                Auth.filterSidebar();

                App.init();

                // 🔌 Inicializar indicador de status online/offline
                if (typeof OfflineIndicator !== 'undefined') {
                    OfflineIndicator.init();
                }
            } else {
                // Não logado: decide qual tela mostrar
                if (telaParam === 'cadastro') {
                    loginScreen.classList.add('hidden');
                    registerScreen.classList.remove('hidden');
                } else {
                    loginScreen.classList.remove('hidden');
                    registerScreen.classList.add('hidden');
                }
                appShell.classList.add('hidden');
                if (blockedScreen) blockedScreen.classList.add('hidden');
            }
        });

        // Toggle senha
        document.getElementById('btn-toggle-password')?.addEventListener('click', () => {
            const pw = document.getElementById('login-password');
            const icon = document.querySelector('#btn-toggle-password .material-symbols-outlined');
            if (pw.type === 'password') { pw.type = 'text'; icon.textContent = 'visibility_off'; }
            else { pw.type = 'password'; icon.textContent = 'visibility'; }
        });

        // Validação email
        const emailInput = document.getElementById('login-email');
        emailInput?.addEventListener('blur', () => Auth.validateForm());
        emailInput?.addEventListener('input', () => Auth.validateForm());
        document.getElementById('login-password')?.addEventListener('input', () => Auth.validateForm());

        // Recuperar senha
        document.getElementById('btn-forgot-password')?.addEventListener('click', () => {
            Auth.isRecoveryMode ? Auth.exitRecoveryMode() : Auth.enterRecoveryMode();
        });

        // Toggle login/registro
        document.getElementById('btn-show-register')?.addEventListener('click', () => {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('register-screen').classList.remove('hidden');
        });
        document.getElementById('btn-show-login')?.addEventListener('click', () => {
            document.getElementById('register-screen').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
        });

        // Login form
        document.getElementById('login-form')?.addEventListener('submit', async e => {
            e.preventDefault();
            Auth.isRecoveryMode ? Auth.handlePasswordRecovery() : Auth.handleLogin();
        });

        // Google Auth
        const handleGoogle = async (btnId, errId) => {
            const btn = document.getElementById(btnId);
            if (!btn) return;
            btn.disabled = true; btn.style.opacity = '0.6';
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                const cred = await auth.signInWithPopup(provider);
                if (cred.additionalUserInfo?.isNewUser) {
                    const ref  = localStorage.getItem('referralCode') || null;
                    const inviteData = (typeof Invites !== 'undefined') ? Invites.getInviteData() : null;
                    let companyPlan, companySubStatus, selectedPlan;
                    if (inviteData) {
                        companyPlan      = inviteData.plan || 'studio';
                        companySubStatus = inviteData.subscriptionStatus || 'active';
                        selectedPlan     = null;
                    } else {
                        companyPlan      = 'free';
                        companySubStatus = null;
                        selectedPlan     = localStorage.getItem('selectedPlan') || 'free';
                    }
                    await db.collection('companies').doc(cred.user.uid).set({
                        companyName: cred.user.displayName || 'Meu Studio',
                        ownerName: cred.user.displayName || '',
                        ownerPhone: '',
                        ownerEmail: cred.user.email || '',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        plan: companyPlan, status: 'active',
                        subscriptionStatus: companySubStatus,
                        selectedPlan: selectedPlan,
                        inviteCode: inviteData ? (localStorage.getItem('inviteCode') || null) : null,
                        invitePartner: inviteData ? (inviteData.partnerName || null) : null,
                        referredBy: ref, pixKey: '',
                        referralCode: Auth.generateCode()
                    });
                    if (typeof Invites !== 'undefined' && inviteData) {
                        await Invites.registerUse(
                            cred.user.uid,
                            cred.user.email,
                            cred.user.displayName || '',
                            cred.user.displayName || ''
                        );
                    }
                    localStorage.removeItem('selectedPlan');
                }
            } catch (err) {
                if (!['auth/popup-closed-by-user','auth/cancelled-popup-request'].includes(err.code)) {
                    const el = document.getElementById(errId);
                    if (el) { el.textContent = 'Erro Google: ' + (err.message || err.code); el.classList.remove('hidden'); }
                }
            } finally { btn.disabled = false; btn.style.opacity = '1'; }
        };
        document.getElementById('btn-google-login')?.addEventListener('click', () => handleGoogle('btn-google-login','login-error'));
        document.getElementById('btn-google-register')?.addEventListener('click', () => handleGoogle('btn-google-register','register-error'));

        // Register form
        document.getElementById('register-form')?.addEventListener('submit', async e => {
            e.preventDefault();
            const studio   = document.getElementById('reg-studio').value.trim();
            const name     = document.getElementById('reg-name').value.trim();
            const phone    = document.getElementById('reg-phone').value.trim();
            const email    = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const pwConf   = document.getElementById('reg-password-confirm').value;
            const errorEl  = document.getElementById('register-error');
            const btn      = document.getElementById('register-btn');

            errorEl.classList.add('hidden');
            if (password !== pwConf) { errorEl.textContent = 'As senhas não coincidem.'; errorEl.classList.remove('hidden'); return; }
            if (password.length < 6) { errorEl.textContent = 'Mínimo 6 caracteres na senha.'; errorEl.classList.remove('hidden'); return; }

            btn.disabled = true;
            btn.innerHTML = '<div class="spinner"></div> Criando conta...';
            try {
                const cred = await auth.createUserWithEmailAndPassword(email, password);
                await cred.user.updateProfile({ displayName: name });
                const ref  = localStorage.getItem('referralCode') || null;

                // Verificar se veio de convite de parceiro
                const inviteData = (typeof Invites !== 'undefined') ? Invites.getInviteData() : null;

                let companyPlan, companySubStatus, selectedPlan;
                if (inviteData) {
                    // Conta ativa imediatamente pelo convite
                    companyPlan     = inviteData.plan || 'studio';
                    companySubStatus = inviteData.subscriptionStatus || 'active';
                    selectedPlan    = null;
                } else {
                    companyPlan     = 'free';
                    companySubStatus = null;
                    selectedPlan    = localStorage.getItem('selectedPlan') || 'free';
                }

                await db.collection('companies').doc(cred.user.uid).set({
                    companyName: studio,
                    ownerName: name, ownerPhone: phone, ownerEmail: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    plan: companyPlan,
                    status: 'active',
                    subscriptionStatus: companySubStatus,
                    selectedPlan: selectedPlan,
                    inviteCode: inviteData ? (localStorage.getItem('inviteCode') || null) : null,
                    invitePartner: inviteData ? (inviteData.partnerName || null) : null,
                    referredBy: ref, pixKey: '',
                    referralCode: Auth.generateCode()
                });

                // Registrar uso do convite no Firestore
                if (typeof Invites !== 'undefined' && inviteData) {
                    await Invites.registerUse(cred.user.uid, email, name, studio);
                }
                localStorage.removeItem('referralCode');
                localStorage.removeItem('selectedPlan');
            } catch (err) {
                const msgs = {
                    'auth/email-already-in-use': 'E-mail já cadastrado. Faça login.',
                    'auth/invalid-email': 'E-mail inválido.',
                    'auth/weak-password': 'Senha fraca. Use pelo menos 6 caracteres.'
                };
                errorEl.textContent = msgs[err.code] || 'Erro: ' + err.message;
                errorEl.classList.remove('hidden');
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined">spa</span> Criar Minha Conta';
            }
        });

        // Logout
        document.getElementById('btn-logout')?.addEventListener('click', () => auth.signOut());
    },

    generateCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        return Array.from({length: 8}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    },

    isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); },

    validateForm() {
        const email = document.getElementById('login-email')?.value.trim();
        const password = document.getElementById('login-password')?.value;
        const btn = document.getElementById('login-btn');
        if (!btn) return;
        const valid = Auth.isRecoveryMode ? Auth.isValidEmail(email) : Auth.isValidEmail(email) && password?.length > 0;
        btn.disabled = !valid;
    },

    enterRecoveryMode() {
        Auth.isRecoveryMode = true;
        document.getElementById('login-title').textContent = 'Recuperar Senha';
        document.getElementById('login-subtitle').textContent = 'Informe seu e-mail para receber o link.';
        document.getElementById('password-field-wrapper')?.classList.add('hidden');
        document.getElementById('login-btn-text').textContent = 'Enviar link';
        document.getElementById('btn-forgot-password').textContent = '← Voltar ao login';
        Auth.validateForm();
    },

    exitRecoveryMode() {
        Auth.isRecoveryMode = false;
        document.getElementById('login-title').textContent = 'Acesse sua conta';
        document.getElementById('login-subtitle').textContent = 'Bem-vinda ao seu painel de gestão.';
        document.getElementById('password-field-wrapper')?.classList.remove('hidden');
        document.getElementById('login-btn-text').textContent = 'Entrar no Painel';
        document.getElementById('btn-forgot-password').textContent = 'Esqueceu a senha?';
        Auth.validateForm();
    },

    async handlePasswordRecovery() {
        const email = document.getElementById('login-email').value.trim();
        const errorEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');
        btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
        try {
            await auth.sendPasswordResetEmail(email);
            errorEl.className = 'auth-success';
            errorEl.textContent = '✓ E-mail enviado! Verifique sua caixa de entrada.';
            errorEl.classList.remove('hidden');
        } catch (err) {
            const msgs = { 'auth/user-not-found': 'E-mail não encontrado.', 'auth/invalid-email': 'E-mail inválido.' };
            errorEl.className = 'auth-error'; errorEl.textContent = msgs[err.code] || 'Erro ao enviar e-mail.';
            errorEl.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span id="login-btn-text">Enviar link</span><span class="material-symbols-outlined">send</span>';
            Auth.validateForm();
        }
    },

    async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');
        btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
        errorEl.classList.add('hidden');
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (err) {
            const msgs = {
                'auth/user-not-found': 'Usuário não encontrado.',
                'auth/wrong-password': 'Senha incorreta.',
                'auth/invalid-credential': 'E-mail ou senha incorretos.',
                'auth/too-many-requests': 'Muitas tentativas. Tente mais tarde.'
            };
            errorEl.className = 'auth-error';
            errorEl.textContent = msgs[err.code] || 'Erro: ' + err.message;
            errorEl.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span id="login-btn-text">Entrar no Painel</span><span class="material-symbols-outlined">arrow_forward</span>';
            Auth.validateForm();
        }
    },

    // === Filtrar sidebar por role ===
    filterSidebar() {
        if (!Team.currentRole) return;

        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        // Esconder itens marcados como owner-only para profissionais
        sidebar.querySelectorAll('.nav-item[data-role="owner"]').forEach(item => {
            if (Team.isProfessional()) {
                item.style.display = 'none';
            } else {
                item.style.display = '';
            }
        });

        // Esconder labels de grupo que ficaram sem itens visíveis
        sidebar.querySelectorAll('.nav-group-label').forEach(label => {
            let next = label.nextElementSibling;
            let hasVisible = false;
            while (next && !next.classList.contains('nav-group-label') && !next.classList.contains('sidebar-footer')) {
                if (next.classList.contains('nav-item') && next.style.display !== 'none') {
                    hasVisible = true;
                    break;
                }
                next = next.nextElementSibling;
            }
            label.style.display = hasVisible ? '' : 'none';
        });

        // Mostrar badge de role no sidebar
        const roleBadge = document.getElementById('role-badge');
        if (roleBadge) {
            if (Team.isProfessional()) {
                roleBadge.textContent = '💼 Profissional';
                roleBadge.style.display = '';
                roleBadge.className = 'role-badge professional';
            } else {
                roleBadge.textContent = '👑 Proprietária';
                roleBadge.style.display = '';
                roleBadge.className = 'role-badge owner';
            }
        }

        // Se profissional, mostrar nome do studio
        if (Team.isProfessional()) {
            const studioSub = document.querySelector('.sidebar-logo-sub');
            if (studioSub) {
                db.collection('companies').doc(Team.ownerId).get().then(doc => {
                    if (doc.exists) {
                        studioSub.textContent = doc.data().companyName || 'Studio';
                    }
                });
            }
        }
    }
};
