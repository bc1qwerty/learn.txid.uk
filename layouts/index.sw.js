const CACHE = 'learn-txid-{{ now.Unix }}';
const STATIC_CACHE = 'learn-txid-static-v1';

// Precache critical assets
const PRECACHE = [
  '/',
  '/favicon.svg',
  '/manifest.json'
];

// Static assets that rarely change
const STATIC_EXTENSIONS = /\.(css|js|woff2?|ttf|eot)$/;
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|svg|webp|avif|gif|ico)$/;

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
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE && k !== STATIC_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Network-first for API/analytics/external calls
  if (url.hostname !== location.hostname) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for fingerprinted static assets (CSS/JS with hash in filename)
  if (STATIC_EXTENSIONS.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const c = res.clone();
            // Use static cache for immutable assets (fingerprinted)
            const cacheName = url.pathname.includes('.min.') || url.search.includes('v=') ? STATIC_CACHE : CACHE;
            caches.open(cacheName).then(cache => cache.put(e.request, c));
          }
          return res;
        });
      })
    );
    return;
  }

  // Cache-first for images (long-lived)
  if (IMAGE_EXTENSIONS.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const c = res.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(e.request, c));
          }
          return res;
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for HTML pages
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(res => {
        if (res.ok && e.request.mode === 'navigate') {
          const c = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, c));
        }
        return res;
      }).catch(() => {
        if (cached) return cached;
        if (e.request.mode === 'navigate') {
          return new Response(
            '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>오프라인 - TXID</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#09090b;color:#e6edf3;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}div{text-align:center;padding:2rem}h1{color:#f7931a;font-size:2rem;margin-bottom:.5rem}p{color:#8b949e;margin-bottom:1rem;line-height:1.6}a{color:#f7931a;text-decoration:none}a:hover{text-decoration:underline}.retry{display:inline-block;margin-top:1rem;padding:.5rem 1.5rem;border:1px solid #f7931a;border-radius:.5rem;color:#f7931a;cursor:pointer;background:none;font-size:1rem}.retry:hover{background:#f7931a;color:#09090b}</style></head><body><div><h1>TXID</h1><p>오프라인 상태입니다.<br>인터넷 연결을 확인해 주세요.</p><p>이전에 방문한 페이지는 오프라인에서도 볼 수 있습니다.</p><button class="retry" onclick="location.reload()">다시 시도</button><br><a href="/" style="display:inline-block;margin-top:1rem">홈으로 &rarr;</a></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      });

      // Return cached version immediately, update in background
      return cached || fetchPromise;
    })
  );
});

// Listen for skip-waiting messages from the app
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
