const CACHE = 'learn-txid-v1';
const OFFLINE_URL = '/offline/';

// Precache critical assets
const PRECACHE = [
  '/',
  '/favicon.svg',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Network-first for API/analytics calls
  if (url.hostname !== location.hostname) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for static assets (css, js, images, fonts)
  if (/\.(css|js|png|jpg|jpeg|svg|woff2?|ttf|eot)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        if (res.ok) {
          const c = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, c));
        }
        return res;
      }))
    );
    return;
  }

  // Network-first for HTML pages, cache visited pages for offline
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && e.request.mode === 'navigate') {
        const c = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, c));
      }
      return res;
    }).catch(() => {
      return caches.match(e.request).then(cached => {
        if (cached) return cached;
        if (e.request.mode === 'navigate') {
          return new Response(
            '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>오프라인 - TXID</title><style>body{background:#09090b;color:#e6edf3;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}div{text-align:center}h1{color:#f7931a;margin-bottom:.5rem}p{color:#8b949e}</style></head><body><div><h1>TXID</h1><p>오프라인 상태입니다.<br>이전에 방문한 페이지만 볼 수 있습니다.</p><p><a href="/" style="color:#f7931a">홈으로 →</a></p></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      });
    })
  );
});
