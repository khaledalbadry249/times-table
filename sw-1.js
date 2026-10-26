// مغامرة جدول الضرب — ملف العمل بدون إنترنت
// عند تعديل اللعبة ورفعها غيّر رقم النسخة هنا (v1 -> v2) ليصل التحديث للجميع.
const V = 'tt-v2';
const CORE = ['./', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './apple-touch-icon.png', './favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// عرض النسخة المخزّنة فورًا مع تحديثها في الخلفية (سريع ويعمل بلا إنترنت)
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const own = u.origin === location.origin;
  const fonts = /(^|\.)(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!own && !fonts) return;

  e.respondWith((async () => {
    const cache = await caches.open(V);
    const hit = await cache.match(r, { ignoreSearch: r.mode === 'navigate' });
    const net = fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(r.mode === 'navigate' ? './index.html' : r, res.clone());
      return res;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    if (res) return res;
    if (r.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
    return Response.error();
  })());
});
