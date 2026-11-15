const C='mt-cache';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
e.respondWith(fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque')){const k=r.clone();const u=new URL(e.request.url);u.search='';caches.open(C).then(c=>c.put(u.origin===location.origin?u.href:e.request,k))}return r}).catch(()=>{const u=new URL(e.request.url);u.search='';return caches.match(u.origin===location.origin?u.href:e.request).then(m=>m||caches.match('index.html'))}))});
