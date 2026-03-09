const CACHE_NAME = 'mental-age-v1';
const ASSETS = [
  '/mental-age/',
  '/mental-age/index.html',
  '/mental-age/css/style.css',
  '/mental-age/js/app.js',
  '/mental-age/js/i18n.js',
  '/mental-age/js/locales/ko.json',
  '/mental-age/js/locales/en.json',
  '/mental-age/js/locales/ja.json',
  '/mental-age/js/locales/zh.json',
  '/mental-age/js/locales/hi.json',
  '/mental-age/js/locales/ru.json',
  '/mental-age/js/locales/es.json',
  '/mental-age/js/locales/pt.json',
  '/mental-age/js/locales/id.json',
  '/mental-age/js/locales/tr.json',
  '/mental-age/js/locales/de.json',
  '/mental-age/js/locales/fr.json',
  '/mental-age/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
