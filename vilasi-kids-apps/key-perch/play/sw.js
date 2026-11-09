// Lets the web version work offline on Chromebooks and computers. Stores only the app's own files.
const NAME = 'keyperch-1.0.0';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'css/app.css', 'js/app.js', 'js/curriculum.js', 'js/icons.js', 'js/games.js', 'js/input.js', 'js/sound.js', 'js/store.js', 'js/typing.js', 'js/ui.js', 'js/words.js', 'fonts/Lexend_400Regular.ttf', 'fonts/Lexend_600SemiBold.ttf', 'fonts/Fraunces_700Bold.ttf', 'img/icon-192.png', 'img/icon-512.png'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(NAME).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((all) => Promise.all(all.filter((k) => k !== NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
