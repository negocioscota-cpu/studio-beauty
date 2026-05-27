const CACHE_NAME = 'studiobeauty-static-v1';
const DYNAMIC_CACHE_NAME = 'studiobeauty-dynamic-v1';

const ASSETS_TO_CACHE = [
  'app.html',
  'css/app.css',
  'js/firebase-config.js',
  'js/auth.js',
  'js/store.js',
  'js/app.js',
  'js/referrals.js',
  'js/ia-consultoria.js',
  'pages/dashboard.js',
  'pages/schedule.js',
  'pages/clients.js',
  'pages/client-form.js',
  'pages/inventory.js',
  'pages/interactions.js',
  'pages/invoices.js',
  'pages/settings.js',
  'pages/bolsa-beleza-sb.js',
  'img/logo.png',
  'img/logo-192.png',
  'img/logo-512.png',
  'manifest.json'
];

// Instalação do Service Worker - Pré-caching do App Shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Pré-cacheando App Shell...');
      // Mapeamento tolerante de erros para evitar que falhas em arquivos individuais abortem toda a instalação
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn(`[Service Worker] Falha ao pré-cachear asset: ${asset}`, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker - Limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  // Ignora requisições que não sejam GET (ex: POST do Firestore/Auth)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignora explicitamente chamadas de autenticação, banco de dados ou funções do Firebase
  if (
    url.hostname.includes('firebase') || 
    url.hostname.includes('googleapis') || 
    url.pathname.includes('/__/auth')
  ) {
    return;
  }

  // Resposta com cache-first para assets do App Shell e stale-while-revalidate para os demais
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        const isStaticAsset = ASSETS_TO_CACHE.some(asset => event.request.url.includes(asset));
        if (isStaticAsset) {
          return cachedResponse;
        }

        // Stale-While-Revalidate em segundo plano para recursos externos (fontes, Tailwind, etc.)
        fetch(event.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {/* Silencia falhas de conexão em background */});

        return cachedResponse;
      }

      // Se não estiver no cache, vai à rede
      return fetch(event.request).then(networkResponse => {
        // Armazena novos assets dinamicamente se forem de CDNs ou fontes confiáveis
        const isSafeToCache = (
          url.hostname.includes('cdn.tailwindcss.com') ||
          url.hostname.includes('fonts.googleapis.com') ||
          url.hostname.includes('fonts.gstatic.com') ||
          url.hostname.includes('cdn.jsdelivr.net') ||
          url.hostname.includes('qrcode-generator')
        );

        if (networkResponse.status === 200 && isSafeToCache) {
          return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }

        return networkResponse;
      }).catch(err => {
        // Fallback offline elegante para app.html caso falhe toda a rede e cache para navegações
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('app.html');
        }
        console.warn('[Service Worker] Falha de conexão para recurso:', event.request.url, err);
      });
    })
  );
});
