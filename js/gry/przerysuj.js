/* Przerysuj obrazek po kratkach albo dorysuj drugą połowę (symetria). */
(function () {
  'use strict';

  const KOLORY = ['#3b82c4', '#e4572e', '#2e9e5b', '#f2a900', '#8e5cc4'];
  const UST = { latwy: 6, sredni: 8, trudny: 10 };

  // Losowy, symetryczny obrazek z kratek (jak mozaika).
  function mozaika(N, R) {
    const pol = Math.ceil(N / 2);
    const g = Array.from({ length: N }, () => new Array(N).fill(0));
    const gest = 0.45;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < pol; x++) {
        const v = R.next() < gest ? 1 : 0;
        g[y][x] = v;
        g[y][N - 1 - x] = v;
      }
    }
    // Gwarantujemy, że obrazek nie jest pusty i ma wypełniony środek.
    g[Math.floor(N / 2)][pol - 1] = 1;
    g[Math.floor(N / 2)][N - pol] = 1;
    return g;
  }

  KP.zarejestruj({
    id: 'przerysuj',
    nazwa: 'Przerysuj obrazek',
    ikona: '🟩',
    grupa: 'pisanie',
    opis: 'Przerysuj mozaikę po kratkach lub dokończ symetrię.',
    opcje: [
      { id: 'tryb', etykieta: 'Zadanie', wybory: [{ value: 'przerysuj', label: 'Przerysuj obok' }, { value: 'symetria', label: 'Dorysuj drugą połowę' }], domyslnie: 'przerysuj' },
      { id: 'poziom', etykieta: 'Poziom trudności', wybory: KP.POZIOMY, domyslnie: 'latwy' },
    ],

    generuj(o, R) {
      const N = UST[o.poziom] || UST.latwy;
      const g0 = mozaika(N, R);
      const kolor = R.pick(KOLORY);
      const siatka = (ox, oy, k, pokaz, g = g0) => {
        let s = '';
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const pel = g[y][x] && pokaz(x, y);
          s += `<rect x="${ox + x * k}" y="${oy + y * k}" width="${k}" height="${k}" fill="${pel ? kolor : '#fff'}" stroke="#9aa3b2" stroke-width="1"/>`;
        }
        return s + `<rect x="${ox}" y="${oy}" width="${N * k}" height="${N * k}" fill="none" stroke="#1f2a44" stroke-width="2.5"/>`;
      };

      if (o.tryb === 'symetria') {
        const W = 640, k = Math.min(56, 560 / N), ox = (W - N * k) / 2, oy = 20;
        const H = oy * 2 + N * k;
        const pol = Math.floor(N / 2);
        const os = `<line x1="${ox + pol * k}" y1="${oy - 14}" x2="${ox + pol * k}" y2="${oy + N * k + 14}" stroke="#e4572e" stroke-width="3" stroke-dasharray="10 6"/>`;
        const svg = (wszystko) => `<svg class="rys" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${siatka(ox, oy, k, (x) => wszystko || x < pol)}${os}</svg>`;
        return {
          tytul: 'Dorysuj drugą połowę',
          polecenie: 'Czerwona linia to oś symetrii. Pokoloruj kratki po prawej stronie tak, aby obrazek wyglądał jak odbicie w lustrze.',
          tresc: svg(false),
          rozwiazanie: svg(true),
        };
      }

      const W = 640, odst = 40, k = Math.min(46, (W - odst - 20) / (2 * N));
      const ox1 = (W - (2 * N * k + odst)) / 2, ox2 = ox1 + N * k + odst, oy = 20;
      const H = oy * 2 + N * k;
      const obrazki = [g0].concat(N <= 8 ? [mozaika(N, R)] : []);
      const svg = (g, rozw) => `<svg class="rys" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${siatka(ox1, oy, k, () => true, g)}${siatka(ox2, oy, k, () => rozw, g)}</svg>`;
      return {
        tytul: 'Przerysuj obrazek',
        polecenie: 'Popatrz na obrazek po lewej stronie. Pokoloruj te same kratki w pustej siatce po prawej.',
        tresc: obrazki.map((g) => svg(g, false)).join('<div class="odstep"></div>'),
        rozwiazanie: obrazki.map((g) => svg(g, true)).join('<div class="odstep"></div>'),
      };
    },
  });
})();
