// === URL Parameter Tracking ===
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref');
if (refCode) {
    localStorage.setItem('referralCode', refCode);
}

// === Auth Module ===
const Auth = {
    currentUser: null,
    isRecoveryMode: false,

    init() {
        auth.onAuthStateChanged(async user => {
            Auth.currentUser = user;
            
            const loginScreen = document.getElementById('login-screen');
            const registerScreen = document.getElementById('register-screen');
            const appShell = document.getElementById('app-shell');
            const blockedScreen = document.getElementById('blocked-screen');

            if (user) {
                try {
                    const doc = await db.collection('companies').doc(user.uid).get();
                    if (doc.exists) {
                        const companyData = doc.data();
                        Auth.companyData = companyData;
                        const now = new Date();

                        // ── Verificação de acesso via Asaas ──
                        const asaasStatus = companyData.asaasStatus; // ACTIVE | OVERDUE | CANCELLED | PENDING | undefined
                        const status = companyData.status; // active | trial | overdue | blocked

                        // 1. Se tem assinatura Asaas ativa → livre acesso
                        if (asaasStatus === 'ACTIVE') {
                            // Verificar se expirou por data (fallback)
                            if (companyData.subscriptionExpiresAt) {
                                const expiresAt = companyData.subscriptionExpiresAt.toDate();
                                if (now > expiresAt) {
                                    // Expirou mas webhook ainda não chegou — bloquear preventivamente
                                    if (loginScreen) loginScreen.classList.add('hidden');
                                    if (registerScreen) registerScreen.classList.add('hidden');
                                    if (appShell) appShell.classList.add('hidden');
                                    if (blockedScreen) blockedScreen.classList.remove('hidden');
                                    return;
                                }
                            }
                            // Acesso liberado — continua abaixo
                        }
                        // 2. Em trial — verificar prazo
                        else if (status === 'trial' || (!asaasStatus && companyData.plan === 'free')) {
                            const trialEnd = companyData.trialEndsAt
                                ? companyData.trialEndsAt.toDate()
                                : (() => {
                                    const t = companyData.createdAt ? companyData.createdAt.toDate() : now;
                                    t.setDate(t.getDate() + 14);
                                    return t;
                                  })();
                            if (now > trialEnd) {
                                if (loginScreen) loginScreen.classList.add('hidden');
                                if (registerScreen) registerScreen.classList.add('hidden');
                                if (appShell) appShell.classList.add('hidden');
                                if (blockedScreen) blockedScreen.classList.remove('hidden');
                                return;
                            }
                        }
                        // 3. Bloqueado / cancelado / inadimplente
                        else if (asaasStatus === 'CANCELLED' || asaasStatus === 'OVERDUE' || status === 'blocked' || status === 'overdue') {
                            if (loginScreen) loginScreen.classList.add('hidden');
                            if (registerScreen) registerScreen.classList.add('hidden');
                            if (appShell) appShell.classList.add('hidden');
                            if (blockedScreen) blockedScreen.classList.remove('hidden');
                            return;
                        }
                    }
                } catch (err) {
                    console.error("Erro ao verificar status da empresa:", err);
                }


                loginScreen.classList.add('hidden');
                registerScreen.classList.add('hidden');
                if(blockedScreen) blockedScreen.classList.add('hidden');
                appShell.classList.remove('hidden');
                
                document.getElementById('user-name').textContent = user.displayName || user.email.split('@')[0];
                document.getElementById('user-role').textContent = user.email;
                App.init();
            } else {
                loginScreen.classList.remove('hidden');
                registerScreen.classList.add('hidden');
                appShell.classList.add('hidden');
                if(blockedScreen) blockedScreen.classList.add('hidden');
            }
        });

        // === 1. Toggle Password Visibility ===
        document.getElementById('btn-toggle-password').addEventListener('click', () => {
            const pw = document.getElementById('login-password');
            const icon = document.querySelector('#btn-toggle-password .material-symbols-outlined');
            if (pw.type === 'password') {
                pw.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                pw.type = 'password';
                icon.textContent = 'visibility';
            }
        });

        // === 5. Real-time Email Validation (onBlur) ===
        const emailInput = document.getElementById('login-email');
        const emailError = document.getElementById('email-error-msg');

        emailInput.addEventListener('blur', () => {
            const val = emailInput.value.trim();
            if (val && !Auth.isValidEmail(val)) {
                emailInput.classList.add('border-red-500');
                emailInput.classList.remove('border-transparent');
                emailError.classList.remove('hidden');
            } else {
                emailInput.classList.remove('border-red-500');
                emailInput.classList.add('border-transparent');
                emailError.classList.add('hidden');
            }
            Auth.validateForm();
        });

        emailInput.addEventListener('input', () => {
            const val = emailInput.value.trim();
            if (Auth.isValidEmail(val)) {
                emailInput.classList.remove('border-red-500');
                emailInput.classList.add('border-transparent');
                emailError.classList.add('hidden');
            }
            Auth.validateForm();
        });

        // === 5. Validate on password input too ===
        document.getElementById('login-password').addEventListener('input', () => {
            Auth.validateForm();
        });

        // === 3. Dynamic "Esqueceu a Senha?" Flow ===
        document.getElementById('btn-forgot-password').addEventListener('click', () => {
            if (!Auth.isRecoveryMode) {
                Auth.enterRecoveryMode();
            } else {
                Auth.exitRecoveryMode();
            }
        });

        // === Toggle Login <-> Register ===
        document.getElementById('btn-show-register').addEventListener('click', () => {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('register-screen').classList.remove('hidden');
        });

        document.getElementById('btn-show-login').addEventListener('click', () => {
            document.getElementById('register-screen').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
        });

        // === Login / Recovery Form Submit ===
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            if (Auth.isRecoveryMode) {
                Auth.handlePasswordRecovery();
                return;
            }

            Auth.handleLogin();
        });

        // === 4. Google Sign-In ===
        const handleGoogleAuth = async (btnId, errorElId) => {
            const btn = document.getElementById(btnId);
            if (!btn) return;
            btn.disabled = true;
            btn.style.opacity = '0.6';
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                const cred = await auth.signInWithPopup(provider);
                
                if (cred.additionalUserInfo && cred.additionalUserInfo.isNewUser) {
                    const referralCode = localStorage.getItem('referralCode') || null;
                    await db.collection('companies').doc(cred.user.uid).set({
                        companyName: cred.user.displayName || "Minha Empresa",
                        segment: "outros",
                        ownerName: cred.user.displayName || "",
                        ownerPhone: cred.user.phoneNumber || "",
                        ownerEmail: cred.user.email || "",
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        plan: 'free',
                        status: 'active',
                        referredBy: referralCode,
                        pixKey: ''
                    });
                }
            } catch (err) {
                if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                    const errorEl = document.getElementById(errorElId);
                    if (errorEl) {
                        let msg = 'Erro ao entrar com Google: ' + (err.message || err.code);
                        if (err.code === 'auth/operation-not-allowed') {
                            msg = 'Autenticação pelo Google desativada. Ative no painel Firebase (Authentication > Sign-in method) para funcionar.';
                        }
                        errorEl.textContent = msg;
                        errorEl.classList.remove('hidden');
                    }
                }
            } finally {
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        };

        if (document.getElementById('btn-google-login')) {
            document.getElementById('btn-google-login').addEventListener('click', () => handleGoogleAuth('btn-google-login', 'login-error'));
        }
        
        if (document.getElementById('btn-google-register')) {
            document.getElementById('btn-google-register').addEventListener('click', () => handleGoogleAuth('btn-google-register', 'register-error'));
        }

        // === Register Form ===
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const company = document.getElementById('reg-company').value.trim();
            const segment = document.getElementById('reg-segment').value;
            const name = document.getElementById('reg-name').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;
            const errorEl = document.getElementById('register-error');
            const btn = document.getElementById('register-btn');

            errorEl.classList.add('hidden');

            if (password !== passwordConfirm) {
                errorEl.classList.remove('hidden');
                errorEl.textContent = 'As senhas não coincidem.';
                return;
            }

            if (password.length < 6) {
                errorEl.classList.remove('hidden');
                errorEl.textContent = 'A senha deve ter pelo menos 6 caracteres.';
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<div class="spinner"></div> Criando conta...';

            try {
                const cred = await auth.createUserWithEmailAndPassword(email, password);
                await cred.user.updateProfile({ displayName: name });
                const referralCode = localStorage.getItem('referralCode') || null;
                await db.collection('companies').doc(cred.user.uid).set({
                    companyName: company,
                    segment: segment,
                    ownerName: name,
                    ownerPhone: phone,
                    ownerEmail: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    plan: 'free',
                    status: 'active',
                    referredBy: referralCode,
                    pixKey: ''
                });
            } catch (err) {
                errorEl.classList.remove('hidden');
                const messages = {
                    'auth/email-already-in-use': 'Este e-mail já está cadastrado. Tente fazer login.',
                    'auth/invalid-email': 'E-mail inválido.',
                    'auth/weak-password': 'A senha é muito fraca. Use pelo menos 6 caracteres.',
                    'auth/operation-not-allowed': 'Registro por e-mail não está habilitado.'
                };
                errorEl.textContent = messages[err.code] || 'Erro ao criar conta: ' + err.message;
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined text-xl">rocket_launch</span> Criar Minha Conta';
            }
        });

        // === Logout ===
        document.getElementById('btn-logout').addEventListener('click', () => {
            auth.signOut();
        });
    },

    // === Utility: validate email format ===
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // === 5. Enable/disable login button based on form validity ===
    validateForm() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');

        let isValid;
        if (Auth.isRecoveryMode) {
            isValid = Auth.isValidEmail(email);
        } else {
            isValid = Auth.isValidEmail(email) && password.length > 0;
        }

        if (isValid) {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    },

    // === 3. Enter Recovery Mode ===
    enterRecoveryMode() {
        Auth.isRecoveryMode = true;
        document.getElementById('login-title').textContent = 'Recuperar Senha';
        document.getElementById('login-subtitle').textContent = 'Informe seu e-mail para receber o link de recuperação.';
        document.getElementById('password-field-wrapper').classList.add('hidden');
        document.getElementById('remember-me-wrapper').classList.add('hidden');
        document.getElementById('login-btn-text').textContent = 'Enviar link de recuperação';
        document.getElementById('login-btn-icon').textContent = 'send';
        document.getElementById('btn-forgot-password').textContent = '← Voltar ao login';
        document.getElementById('login-password').removeAttribute('required');

        // Hide Google login & separator in recovery mode
        const separator = document.querySelector('#login-form').nextElementSibling;
        const googleBtn = document.getElementById('btn-google-login');
        if (separator) separator.classList.add('hidden');
        if (googleBtn) googleBtn.classList.add('hidden');

        // Clear errors
        const errorEl = document.getElementById('login-error');
        errorEl.classList.add('hidden');
        errorEl.classList.remove('text-primary', 'bg-primary/5');
        errorEl.classList.add('text-error', 'bg-error-container');

        Auth.validateForm();
    },

    // === 3. Exit Recovery Mode ===
    exitRecoveryMode() {
        Auth.isRecoveryMode = false;
        document.getElementById('login-title').textContent = 'Acesse sua conta';
        document.getElementById('login-subtitle').textContent = 'Bem-vindo de volta ao seu painel de gestão.';
        document.getElementById('password-field-wrapper').classList.remove('hidden');
        document.getElementById('remember-me-wrapper').classList.remove('hidden');
        document.getElementById('login-btn-text').textContent = 'Entrar no Painel';
        document.getElementById('login-btn-icon').textContent = 'arrow_forward';
        document.getElementById('btn-forgot-password').textContent = 'Esqueceu a senha?';
        document.getElementById('login-password').setAttribute('required', '');

        // Show Google login & separator
        const separator = document.querySelector('#login-form').nextElementSibling;
        const googleBtn = document.getElementById('btn-google-login');
        if (separator) separator.classList.remove('hidden');
        if (googleBtn) googleBtn.classList.remove('hidden');

        // Clear errors
        document.getElementById('login-error').classList.add('hidden');

        Auth.validateForm();
    },

    // === 3. Handle Password Recovery ===
    async handlePasswordRecovery() {
        const email = document.getElementById('login-email').value.trim();
        const errorEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');

        btn.disabled = true;
        btn.innerHTML = '<div class="spinner"></div>';

        try {
            await auth.sendPasswordResetEmail(email);
            errorEl.innerHTML = '<span class="text-primary font-bold">✓ E-mail enviado!</span> Verifique sua caixa de entrada para redefinir a senha.';
            errorEl.classList.remove('hidden', 'text-error', 'bg-error-container');
            errorEl.classList.add('text-primary', 'bg-primary/5');
        } catch (err) {
            const messages = {
                'auth/user-not-found': 'E-mail não encontrado no sistema.',
                'auth/invalid-email': 'E-mail inválido.',
                'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.'
            };
            errorEl.textContent = messages[err.code] || 'Erro ao enviar e-mail de recuperação.';
            errorEl.classList.remove('hidden', 'text-primary', 'bg-primary/5');
            errorEl.classList.add('text-error', 'bg-error-container');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span id="login-btn-text">Enviar link de recuperação</span><span class="material-symbols-outlined text-xl" id="login-btn-icon">send</span>';
            Auth.validateForm();
        }
    },

    // === Handle Login ===
    async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const remember = document.getElementById('login-remember').checked;
        const errorEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');

        btn.disabled = true;
        btn.innerHTML = '<div class="spinner"></div>';
        errorEl.classList.add('hidden');

        try {
            // 2. Set persistence based on "Manter-me conectado"
            const persistence = remember
                ? firebase.auth.Auth.Persistence.LOCAL
                : firebase.auth.Auth.Persistence.SESSION;
            await auth.setPersistence(persistence);

            await auth.signInWithEmailAndPassword(email, password);
        } catch (err) {
            errorEl.classList.remove('hidden');
            errorEl.classList.add('text-error', 'bg-error-container');
            errorEl.classList.remove('text-primary', 'bg-primary/5');
            const messages = {
                'auth/user-not-found': 'Usuário não encontrado.',
                'auth/wrong-password': 'Senha incorreta.',
                'auth/invalid-email': 'E-mail inválido.',
                'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
                'auth/invalid-credential': 'Credenciais inválidas. Verifique e-mail e senha.'
            };
            errorEl.textContent = messages[err.code] || 'Erro ao fazer login: ' + err.message;
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span id="login-btn-text">Entrar no Painel</span><span class="material-symbols-outlined text-xl" id="login-btn-icon">arrow_forward</span>';
            Auth.validateForm();
        }
    }
};
