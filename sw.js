/* Service worker: strona działa także bez internetu.
   Pliki strony: najpierw sieć (zawsze najnowsza wersja), w razie braku sieci – kopia.
   Czcionki: najpierw kopia (nie zmieniają się). Zmień WERSJA po dodaniu nowych plików. */
const WERSJA = 'kp-v2';
const PLIKI = [
  './',
  './manifest.webmanifest',
  './ikona.svg',
    './css/style.css',
    './fonts/andika-latin-400.woff2',
    './fonts/andika-latin-700.woff2',
    './fonts/andika-latin-ext-400.woff2',
    './fonts/andika-latin-ext-700.woff2',
    './fonts/nunito-latin-ext.woff2',
    './fonts/nunito-latin.woff2',
    './fonts/playwrite-pl-300.woff2',
    './index.html',
    './js/app.js',
    './js/core.js',
    './js/gry/dopasuj.js',
    './js/gry/kratka.js',
    './js/gry/kropki.js',
    './js/gry/labirynt.js',
    './js/gry/litery.js',
    './js/gry/matematyka.js',
    './js/gry/papier.js',
    './js/gry/pisanie.js',
    './js/gry/przerysuj.js',
    './js/gry/rozsypanka.js',
    './js/gry/sciezki.js',
    './js/gry/sudoku.js',
    './js/gry/szlaczki.js',
    './js/gry/wykreslanka.js',
    './js/ikony.js',
    './js/literki.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(WERSJA).then((c) => c.addAll(PLIKI)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((klucze) => Promise.all(klucze.filter((k) => k !== WERSJA).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.url.endsWith('.woff2')) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req)));
    return;
  }
  e.respondWith(
    fetch(req)
      .then((odp) => {
        if (odp.ok) { const kopia = odp.clone(); caches.open(WERSJA).then((c) => c.put(req, kopia)); }
        return odp;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./')))
  );
});
