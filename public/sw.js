const CACHE_NAME = 'orgroom-shell-v2';
const SHELL = ['/', '/manifest.webmanifest', '/icons/orgroom.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache authenticated/API responses. They may contain private user or reservation data.
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const shouldCache = event.request.mode === 'navigate' || ['script','style','font','image'].includes(event.request.destination);
        if (shouldCache && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => event.request.mode === 'navigate' ? caches.match('/').then(cached => cached || Response.error()) : Response.error())
  );
});
