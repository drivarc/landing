const CACHE_NAME = 'dlanding-cache-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles-base.css',
  '/styles-header.css',
  '/styles-hero.css',
  '/styles-features.css',
  '/styles-problems.css',
  '/styles-phone.css',
  '/styles-faq.css',
  '/styles-footer.css',
  '/styles-modals.css',
  '/styles-animations.css',
  '/styles-rtl.css',
  '/footer-socials.css',
  '/css/critical.css',
  '/app-core.js',
  '/app-scroll.js',
  '/app-ui.js',
  '/app-cookie.js',
  '/favicon/site.webmanifest',
  '/404.html',
  '/privacy.html',
  '/terms.html',
  '/drivarc.html',
  '/en/',
  '/en/index.html',
  '/de/',
  '/de/index.html',
  '/ru/',
  '/ru/index.html',
  '/ar/',
  '/ar/index.html',
  '/zh/',
  '/zh/index.html',
  '/images/logo-256.png',
  '/images/ataturk-240.webp',
  '/fonts/Inter-400.woff2',
  '/fonts/Inter-500.woff2',
  '/fonts/Inter-700.woff2',
  '/fonts/Inter-600.woff2',
  '/fonts/NotoSansArabic-400.woff2',
  '/fonts/NotoSansArabic-500.woff2',
  '/fonts/NotoSansArabic-600.woff2',
  '/fonts/NotoSansArabic-700.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Installing. Caching assets.');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log(`[Service Worker] Deleting old cache: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        if (event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html').catch(() => caches.match('/404.html'));
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
