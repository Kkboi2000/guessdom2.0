const CACHE = 'guessdom-v2';

const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/data/cards.js',
  '/src/i18n/en.js',
  '/src/i18n/th.js',
  '/src/i18n/jp.js',
  '/src/settings.js',
  '/src/audio.js',
  '/assets/cards/back.webp',
  '/assets/backgrounds/menu.gif',
  '/assets/backgrounds/boardsetup.gif',
  '/assets/sounds/flip.mp3',
  '/assets/music/bgm.mp3',
  '/assets/icons/icon.webp',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Cache-first for all assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache card images dynamically
        if (event.request.url.includes('/assets/')) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
