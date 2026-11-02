const C='gives-v1';self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.json','icon.svg']))));
self.addEventListener('fetch',e=>{if(e.request.url.endsWith('causes.json'))return e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
