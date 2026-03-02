// ╔══════════════════════════════════════════════╗
// ║  Antenna DB — Service Worker                 ║
// ║  離線快取 + 背景更新策略                      ║
// ╚══════════════════════════════════════════════╝

const CACHE_NAME = 'antenna-db-v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for Google Sheets data

// 靜態資源（永久快取，版本更新時自動替換）
const STATIC_ASSETS = [
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap'
];

// ── Install: 預先快取靜態資源 ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        // Google Fonts 可能因 CORS 失敗，忽略
        console.warn('[SW] Some assets failed to cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: 清除舊版快取 ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: 快取策略 ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Sheets CSV → Network First（資料優先即時）
  if (url.hostname === 'docs.google.com' || url.hostname === 'sheets.googleapis.com') {
    event.respondWith(networkFirstWithFallback(event.request));
    return;
  }

  // Google Fonts → Stale While Revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // 本地靜態檔案 → Cache First
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // 其他請求：直接 network
  event.respondWith(fetch(event.request));
});

// ── 策略函式 ──

// Network First：優先網路，失敗則回傳快取（適合資料）
async function networkFirstWithFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      console.log('[SW] Offline fallback for:', request.url);
      return cached;
    }
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache First：優先快取，沒有則網路（適合靜態資源）
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate：回傳快取同時背景更新（適合字體）
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || await networkFetch;
}

// ── 監聽來自頁面的訊息 ──
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
