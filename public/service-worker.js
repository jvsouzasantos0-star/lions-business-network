const staticCache = 'lions-static-v3';
const dynamicCache = 'lions-dynamic-v3';
const precacheAssets = [
  '/',
  '/index.html',
  '/login.html',
  '/cadastro.html',
  '/empresas.html',
  '/empresa.html',
  '/ofertas.html',
  '/plano.html',
  '/meu-plano.html',
  '/offline.html',
  '/css/style.css',
  '/img/hero-lion.png',
  '/js/pwa.js',
  '/js/api.js',
  '/js/auth.js',
  '/js/guards.js',
  '/js/storage.js',
  '/js/ui.js',
  '/js/pages/login.js',
  '/js/pages/register.js',
  '/js/pages/home.js',
  '/js/pages/companies.js',
  '/js/pages/company-detail.js',
  '/js/pages/offers.js',
  '/js/pages/plan.js',
  '/assets/icons/icon-192.svg',
  '/assets/icons/icon-512.svg',
  '/assets/images/lions-hero.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCache).then((cache) => cache.addAll(precacheAssets))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => ![staticCache, dynamicCache].includes(key)).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(dynamicCache).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          caches.open(dynamicCache).then((cache) => cache.put(request, response.clone()));
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      return cached || caches.match('/offline.html');
    })
  );
});