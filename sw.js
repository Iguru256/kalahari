const CACHE_NAME = 'kalahari-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js'
];

self.addEventListener('install', (event) => {
  // pre-cache core assets
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Clean up old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Use network-first for navigation and core assets to avoid serving stale CSS/HTML during development
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // For HTML/CSS/JS try network first, fallback to cache
  if (req.destination === 'document' || req.destination === 'style' || req.destination === 'script'){
    event.respondWith(
      fetch(req).then(res => {
        // update cache
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(()=> caches.match(req))
    );
    return;
  }

  // For other requests (images etc.) use cache-first
  event.respondWith(
    caches.match(req).then(resp => resp || fetch(req).then(r=>{
      // optionally cache images as well
      return r;
    }))
  );
});
