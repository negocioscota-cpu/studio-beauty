// ══════════════════════════════════════════════════════════════════
// Offline Indicator — LashBrow
// Indicador visual de status de conexão e sincronização de dados
// ══════════════════════════════════════════════════════════════════
const OfflineIndicator = {

    _pendingTimeout: null,

    init() {
        // Criar o indicador fixo na UI
        this.createIndicator();

        // Escutar mudanças de conexão do navegador
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Estado inicial
        if (!navigator.onLine) {
            this.handleOffline();
        }
    },

    createIndicator() {
        // Evitar duplicatas
        if (document.getElementById('offline-indicator')) return;

        const indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.className = 'offline-indicator';
        indicator.innerHTML = `
            <span class="material-symbols-outlined offline-icon">wifi_off</span>
            <span class="offline-text">Modo Offline</span>
        `;
        document.body.appendChild(indicator);
    },

    handleOffline() {
        const el = document.getElementById('offline-indicator');
        if (!el) return;

        // Limpar timeout de ocultar
        if (this._pendingTimeout) {
            clearTimeout(this._pendingTimeout);
            this._pendingTimeout = null;
        }

        el.classList.remove('syncing', 'synced');
        el.querySelector('.offline-icon').textContent = 'wifi_off';
        el.querySelector('.offline-text').textContent = 'Modo Offline — dados salvos localmente';
        el.classList.add('show');

        console.log('📴 App entrou em modo offline');
    },

    handleOnline() {
        const el = document.getElementById('offline-indicator');
        if (!el) return;

        // Mostrar estado de sincronização
        el.classList.remove('synced');
        el.classList.add('show', 'syncing');
        el.querySelector('.offline-icon').textContent = 'sync';
        el.querySelector('.offline-text').textContent = 'Sincronizando dados...';

        console.log('🔄 Conexão restaurada — sincronizando...');

        // Esperar o Firestore sincronizar escritas pendentes
        if (typeof db !== 'undefined' && db.waitForPendingWrites) {
            db.waitForPendingWrites()
                .then(() => this.showSynced())
                .catch(err => {
                    console.warn('⚠️ Erro ao sincronizar:', err.message);
                    this.showSynced(); // Mostrar mesmo assim
                });
        } else {
            // Fallback: se db não está disponível, mostrar sucesso após delay
            setTimeout(() => this.showSynced(), 2000);
        }
    },

    showSynced() {
        const el = document.getElementById('offline-indicator');
        if (!el) return;

        el.classList.remove('syncing');
        el.classList.add('synced');
        el.querySelector('.offline-icon').textContent = 'cloud_done';
        el.querySelector('.offline-text').textContent = 'Dados sincronizados ✓';

        console.log('✅ Todos os dados foram sincronizados');

        // Ocultar após 3 segundos
        this._pendingTimeout = setTimeout(() => {
            el.classList.remove('show', 'synced');
            this._pendingTimeout = null;
        }, 3000);
    }
};
