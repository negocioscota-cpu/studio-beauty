// ============================================================
// Invites — Sistema de Convites LashBrow
// Parceiros recebem link direto ao cadastro com plano ativo
// ============================================================
const Invites = (() => {

    // Lê o código de convite da URL
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');

    // Parceiros conhecidos (hardcoded como fallback rápido)
    // Para adicionar novo parceiro, também cadastrar no Firestore
    const KNOWN_PARTNERS = {
        'LASHANDBEAUTY': {
            partnerName: 'Lash and Beauty',
            plan: 'studio',
            subscriptionStatus: 'active',
            maxEmployees: 2
        }
    };

    // Dados do convite resolvido
    let resolvedInvite = null;

    /**
     * Inicializa o módulo.
     * Valida o código no Firestore (ou fallback local) e prepara o estado.
     */
    async function init() {
        if (!inviteCode) return;

        // Salvar código no localStorage para uso pós-cadastro
        localStorage.setItem('inviteCode', inviteCode.toUpperCase());

        try {
            // Tentar buscar no Firestore primeiro
            const doc = await db.collection('invites').doc(inviteCode.toUpperCase()).get();

            if (doc.exists) {
                const data = doc.data();
                if (!data.active) {
                    console.warn('Convite inativo:', inviteCode);
                    localStorage.removeItem('inviteCode');
                    return;
                }
                resolvedInvite = data;
            } else {
                // Fallback: verificar lista hardcoded
                const fallback = KNOWN_PARTNERS[inviteCode.toUpperCase()];
                if (fallback) {
                    resolvedInvite = fallback;
                } else {
                    console.warn('Código de convite não reconhecido:', inviteCode);
                    localStorage.removeItem('inviteCode');
                    return;
                }
            }
        } catch (err) {
            // Offline ou Firestore indisponível: usar fallback
            const fallback = KNOWN_PARTNERS[inviteCode.toUpperCase()];
            if (fallback) {
                resolvedInvite = fallback;
            } else {
                console.warn('Erro ao validar convite:', err);
            }
        }

        if (resolvedInvite) {
            _showInviteBanner();
        }
    }

    /**
     * Exibe banner de boas-vindas na tela de cadastro
     */
    function _showInviteBanner() {
        if (!resolvedInvite) return;

        const registerScreen = document.getElementById('register-screen');
        if (!registerScreen) return;

        // Atualizar subtítulo padrão
        const sub = registerScreen.querySelector('.auth-logo-sub');
        if (sub) sub.textContent = `Parceria ${resolvedInvite.partnerName || 'Exclusiva'} · Acesso imediato`;

        const title = registerScreen.querySelector('.auth-title');
        if (title) title.textContent = 'Criar sua conta';

        const subtitle = registerScreen.querySelector('.auth-subtitle');
        if (subtitle) subtitle.textContent = `Bem-vinda! Sua conta já inclui o Plano Studio com acesso para você e mais ${resolvedInvite.maxEmployees || 2} profissionais.`;

        // Inserir banner dourado antes do formulário
        const authCard = registerScreen.querySelector('.auth-card');
        if (authCard && !document.getElementById('invite-banner')) {
            const banner = document.createElement('div');
            banner.id = 'invite-banner';
            banner.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #fff8ec, #fff3d6);
                    border: 1.5px solid var(--gold, #c9a96e);
                    border-radius: 12px;
                    padding: 14px 16px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                ">
                    <span style="font-size: 1.6rem; line-height: 1;">🎁</span>
                    <div>
                        <div style="font-weight: 700; color: #8b6914; font-size: 0.92rem; margin-bottom: 2px;">
                            Convite ${resolvedInvite.partnerName || 'Exclusivo'} · Plano Studio Incluso
                        </div>
                        <div style="font-size: 0.82rem; color: #a07820; line-height: 1.4;">
                            Sua conta terá acesso completo ao Plano Studio — gestão para você e até
                            ${resolvedInvite.maxEmployees || 2} profissionais da sua equipe.
                        </div>
                    </div>
                </div>`;
            // Inserir antes do primeiro filho do auth-card
            authCard.insertBefore(banner, authCard.firstChild);
        }
    }

    /**
     * Retorna os dados do convite resolvido (usado pelo auth.js no cadastro)
     */
    function getInviteData() {
        return resolvedInvite;
    }

    /**
     * Marca o convite como utilizado no Firestore e registra o usuário
     */
    async function registerUse(uid, email, name, studioName) {
        if (!inviteCode || !resolvedInvite) return;
        const code = inviteCode.toUpperCase();
        const userRecord = {
            uid,
            email,
            name:        name        || '',
            studioName:  studioName  || '',
            usedAt: new Date().toISOString()
        };
        try {
            const ref = db.collection('invites').doc(code);
            const doc = await ref.get();
            if (doc.exists) {
                await ref.update({
                    usageCount: firebase.firestore.FieldValue.increment(1),
                    users: firebase.firestore.FieldValue.arrayUnion(userRecord)
                });
            } else {
                // Criar registro se era fallback hardcoded
                await ref.set({
                    code,
                    partnerName: resolvedInvite.partnerName || '',
                    plan: resolvedInvite.plan || 'studio',
                    subscriptionStatus: resolvedInvite.subscriptionStatus || 'active',
                    maxEmployees: resolvedInvite.maxEmployees || 2,
                    active: true,
                    usageCount: 1,
                    users: [userRecord],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (err) {
            console.warn('Erro ao registrar uso do convite:', err);
            // Não bloquear o fluxo de cadastro por isso
        }
        localStorage.removeItem('inviteCode');
    }

    /**
     * Verifica se há convite ativo na sessão atual
     */
    function hasActiveInvite() {
        return !!resolvedInvite;
    }

    return { init, getInviteData, registerUse, hasActiveInvite };
})();

window.Invites = Invites;
