/* Service Worker: macht das Spiel offline spielbar.
 * Strategie «zuerst Netz»: Mit Internet kommt immer die neueste Version (und wird
 * gespeichert). Ohne Internet – oder wenn das Netz länger als 3 s braucht – kommt
 * die gespeicherte Version. Neue Dateien bitte in FILES eintragen und VERSION erhöhen.
 */
const VERSION = 'flinki-v11';
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
  './src/gfx.js',
  './src/quiz.js',
  './src/quizdraw.js',
  './src/pics.js',
  './src/speech.js',
  './src/race/race.js',
  './src/race/tracks.js',
  './levels/index.json',
  './levels/sonnenwiese.txt',
  './levels/abendhuegel.txt',
  './levels/kletterwald.txt',
  './levels/sternennacht.txt',
  './levels/seeufer.txt',
  './levels/wolkenland.txt',
  './levels/bergpfad.txt',
  './levels/regenbogenland.txt',
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
    const nav = req.mode === 'navigate', key = nav ? './index.html' : req;
    const fromCache = () => cache.match(key, { ignoreSearch: nav });
    const net = fetch(req, { cache: 'no-cache' }).then(res => {
      if (res.ok) cache.put(key, res.clone());
      return res;
    });
    // Netz gewinnt – ausser es ist offline oder zu langsam
    const slow = new Promise(r => setTimeout(r, 3000)).then(fromCache);
    try {
      const res = await Promise.race([net, slow]);
      if (res) { e.waitUntil(net.catch(() => {})); return res; }
      return await net;
    } catch (err) {
      return (await fromCache()) || Response.error();
    }
  }));
});
