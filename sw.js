/* Service Worker: macht das Spiel offline spielbar.
 * Strategie «stale-while-revalidate»: Antwort sofort aus dem Cache, im Hintergrund
 * wird die Datei neu geladen. Änderungen auf dem Server sind also beim übernächsten
 * Start sichtbar. Neue Dateien bitte in FILES eintragen und VERSION erhöhen.
 */
const VERSION = 'flinki-v4';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/game.js',
  './src/config.js',
  './src/state.js',
  './src/audio.js',
  './src/input.js',
  './src/physics.js',
  './src/render.js',
  './src/fx.js',
  './src/levels.js',
  './src/levelformat.js',
  './src/themes.js',
  './src/save.js',
  './src/ui.js',
  './levels/index.json',
  './levels/welt1.txt',
  './levels/welt2.txt',
  './levels/welt3.txt',
  './assets/fonts/baloo2-latin.woff2',
  './assets/icons/icon-180.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('flinki-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    // Seitenaufrufe (auch mit ?…) auf index.html abbilden
    const key = req.mode === 'navigate' ? './index.html' : req;
    const cached = await cache.match(key, { ignoreSearch: req.mode === 'navigate' });
    const fresh = fetch(req).then(res => {
      if (res.ok) cache.put(key, res.clone());
      return res;
    }).catch(() => cached);
    if (cached) { e.waitUntil(fresh); return cached; }
    return fresh;
  }));
});
