// ══════════════════════════════════════════════════════════════════
// Service Worker — LashBrow (Offline-First)
// Estratégia: Cache-First para estáticos, Network-First para app
// Firebase/API requests são ignorados (gerenciados pelo SDK offline)
// ══════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'v4'; // Módulo Estoque 2026-05-13
const CACHE_NAME = `lashbrow-${CACHE_VERSION}`;

// Todos os arquivos necessários para o app funcionar offline
const STATIC_ASSETS = [
  '/',
  '/app.html',
  '/css/main.css',
  '/js/firebase-config.js',
  '/js/auth.js',
  '/js/app.js',
  '/js/store.js',
  '/js/referrals.js',
  '/js/subscription.js',
  '/js/offline-indicator.js',
  // Módulos de páginas
  '/pages/dashboard.js',
  '/pages/clients.js',
  '/pages/schedule.js',
  '/pages/ficha-tecnica.js',
  '/pages/modules.js'
];

// ── Install: pré-cachear todos os assets estáticos ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: limpar caches de versões antigas ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('lashbrow-') && k !== CACHE_NAME)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: estratégia inteligente por tipo de recurso ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 🔥 Skip: requisições Firebase/Firestore/Auth (gerenciadas pelo SDK offline)
  if (url.hostname.includes('firestore') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('cloudfunctions') ||
      url.hostname.includes('identitytoolkit') ||
      url.hostname.includes('securetoken') ||
      url.hostname.includes('firebaseio') ||
      url.hostname.includes('firebasestorage')) {
    return;
  }

  // 🖼️ CDN assets (fonts, icons, imagens externas) — Cache-First
  if (url.hostname.includes('fonts.googleapis') ||
      url.hostname.includes('fonts.gstatic') ||
      url.hostname.includes('gstatic.com') ||
      url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(resp => {
            if (resp.ok) {
              const clone = resp.clone();
              caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
            }
            return resp;
          });
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 📦 App assets (HTML, CSS, JS locais) — Network-First com fallback cache
  event.respondWith(
    fetch(event.request)
      .then(resp => {
        // Atualizar cache com versão mais recente do servidor
        if (resp.ok && event.request.method === 'GET') {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return resp;
      })
      .catch(() =>
        caches.match(event.request)
          .then(cached => cached || caches.match('/app.html'))
      )
  );
});

