const CACHE_NAME = 'dlanding-cache-v9';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles-base.css',
  '/css/styles-header.css',
  '/css/styles-hero.css',
  '/css/styles-features.css',
  '/css/styles-problems.css',
  '/css/styles-phone.css',
  '/css/styles-faq.css',
  '/css/styles-footer.css',
  '/css/styles-modals.css',
  '/css/styles-animations.css',
  '/css/styles-rtl.css',
  '/css/styles-aurora.css',

  '/css/critical.css',
  '/js/seo-jsonld.js',
  '/js/app-core.js',
  '/js/app-scroll.js',
  '/js/app-ui.js',
  '/js/app-cookie.js',
  '/js/app-i18n.js',
  '/js/app-toc.js',
  '/favicon/site.webmanifest',
  '/404.html',
  '/privacy.html',
  '/terms.html',
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
  '/fonts/NotoSansArabic-700.woff2',
  '/fr/', '/fr/index.html',
  '/es/', '/es/index.html',
  '/pt/', '/pt/index.html',
  '/it/', '/it/index.html',
  '/nl/', '/nl/index.html',
  '/pl/', '/pl/index.html',
  '/sv/', '/sv/index.html',
  '/no/', '/no/index.html',
  '/da/', '/da/index.html',
  '/fi/', '/fi/index.html',
  '/cs/', '/cs/index.html',
  '/ro/', '/ro/index.html',
  '/hu/', '/hu/index.html',
  '/el/', '/el/index.html',
  '/uk/', '/uk/index.html',
  '/ja/', '/ja/index.html',
  '/ko/', '/ko/index.html',
  '/hi/', '/hi/index.html',
  '/bn/', '/bn/index.html',
  '/th/', '/th/index.html',
  '/vi/', '/vi/index.html',
  '/id/', '/id/index.html',
  '/he/', '/he/index.html',
  '/es/privacy.html', '/es/terms.html', '/es/404.html',
  '/fr/privacy.html', '/fr/terms.html', '/fr/404.html',
  '/pt/privacy.html', '/pt/terms.html', '/pt/404.html',
  '/it/privacy.html', '/it/terms.html', '/it/404.html',
  '/nl/privacy.html', '/nl/terms.html', '/nl/404.html',
  '/pl/privacy.html', '/pl/terms.html', '/pl/404.html',
  '/sv/privacy.html', '/sv/terms.html', '/sv/404.html',
  '/no/privacy.html', '/no/terms.html', '/no/404.html',
  '/da/privacy.html', '/da/terms.html', '/da/404.html',
  '/fi/privacy.html', '/fi/terms.html', '/fi/404.html',
  '/cs/privacy.html', '/cs/terms.html', '/cs/404.html',
  '/ro/privacy.html', '/ro/terms.html', '/ro/404.html',
  '/hu/privacy.html', '/hu/terms.html', '/hu/404.html',
  '/el/privacy.html', '/el/terms.html', '/el/404.html',
  '/uk/privacy.html', '/uk/terms.html', '/uk/404.html',
  '/ja/privacy.html', '/ja/terms.html', '/ja/404.html',
  '/ko/privacy.html', '/ko/terms.html', '/ko/404.html',
  '/hi/privacy.html', '/hi/terms.html', '/hi/404.html',
  '/bn/privacy.html', '/bn/terms.html', '/bn/404.html',
  '/th/privacy.html', '/th/terms.html', '/th/404.html',
  '/vi/privacy.html', '/vi/terms.html', '/vi/404.html',
  '/id/privacy.html', '/id/terms.html', '/id/404.html',
  '/he/privacy.html', '/he/terms.html', '/he/404.html'
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
