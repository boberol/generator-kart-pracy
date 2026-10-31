/* Połącz kropki: kształty z ponumerowanymi punktami. */
(function () {
  'use strict';

  // Serce z krzywej parametrycznej, punkty w równych odstępach (od dolnego czubka).
  function serce(n) {
    const f = (t) => [16 * Math.pow(Math.sin(t), 3), -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))];
    const M = 600, gesto = [], dl = [0];
    for (let i = 0; i <= M; i++) gesto.push(f(Math.PI + (i / M) * Math.PI * 2));
    for (let i = 1; i <= M; i++) dl.push(dl[i - 1] + Math.hypot(gesto[i][0] - gesto[i - 1][0], gesto[i][1] - gesto[i - 1][1]));
    const p = [];
    for (let k = 0, j = 0; k < n; k++) {
      const cel = (k / n) * dl[M];
      while (dl[j] < cel) j++;
      p.push(gesto[j]);
    }
    return p;
  }
  function gwiazda() {
    const p = [];
    for (let i = 0; i < 10; i++) {
      const a = ((-90 + i * 36) * Math.PI) / 180, r = i % 2 ? 19 : 48;
      p.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    return p;
  }

  const KSZTALTY = [
    { nazwa: 'gwiazda', rogi: gwiazda() },
    { nazwa: 'serce', krzywa: serce },
    { nazwa: 'domek', rogi: [[22, 90], [22, 52], [6, 52], [50, 12], [64, 25], [64, 10], [77, 10], [77, 37], [94, 52], [78, 52], [78, 90]] },
    { nazwa: 'choinka', rogi: [[50, 4], [72, 30], [58, 30], [82, 54], [64, 54], [90, 78], [57, 78], [57, 96], [43, 96], [43, 78], [10, 78], [36, 54], [18, 54], [42, 30], [28, 30]] },
    { nazwa: 'ryba', rogi: [[12, 50], [24, 36], [42, 28], [60, 30], [74, 40], [92, 26], [86, 50], [92, 74], [74, 60], [60, 70], [42, 72], [24, 64]] },
    { nazwa: 'żaglówka', rogi: [[50, 6], [84, 56], [54, 56], [54, 66], [94, 66], [78, 88], [22, 88], [6, 66], [46, 66], [46, 56], [20, 56]] },
    { nazwa: 'kot', rogi: [[50, 88], [32, 85], [19, 74], [14, 54], [18, 14], [38, 32], [62, 32], [82, 14], [86, 54], [81, 74], [68, 85]] },
    { nazwa: 'rakieta', rogi: [[50, 4], [62, 20], [64, 60], [78, 76], [78, 90], [62, 82], [38, 82], [22, 90], [22, 76], [36, 60], [38, 20]] },
    { nazwa: 'grzyb', rogi: [[50, 12], [72, 18], [88, 34], [92, 50], [60, 50], [62, 86], [38, 86], [40, 50], [8, 50], [12, 34], [28, 18]] },
  ];

  // Dodaje punkty pośrednie na krawędziach, proporcjonalnie do ich długości.
  function zageszczaj(rogi, n) {
    const m = rogi.length;
    if (n <= m) return rogi.slice();
    const dl = rogi.map((p, i) => Math.hypot(rogi[(i + 1) % m][0] - p[0], rogi[(i + 1) % m][1] - p[1]));
    const suma = dl.reduce((a, b) => a + b, 0);
    const extra = n - m;
    const przydz = dl.map((d) => (d / suma) * extra);
    const cale = przydz.map(Math.floor);
    let reszta = extra - cale.reduce((a, b) => a + b, 0);
    przydz.map((v, i) => [v - cale[i], i]).sort((a, b) => b[0] - a[0]).slice(0, reszta).forEach(([, i]) => cale[i]++);
    const out = [];
    rogi.forEach((p, i) => {
      const q = rogi[(i + 1) % m];
      out.push(p);
      for (let j = 1; j <= cale[i]; j++) {
        const t = j / (cale[i] + 1);
        out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
      }
    });
    return out;
  }

  // Skaluje punkty do pola 0–100 z marginesem.
  function normalizuj(p) {
    const xs = p.map((a) => a[0]), ys = p.map((a) => a[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const s = 84 / Math.max(maxX - minX, maxY - minY);
    const dx = (100 - (maxX - minX) * s) / 2, dy = (100 - (maxY - minY) * s) / 2;
    return p.map(([x, y]) => [dx + (x - minX) * s, dy + (y - minY) * s]);
  }

  const ILE = { latwy: 12, sredni: 22, trudny: 34 };

  KP.zarejestruj({
    id: 'kropki',
    nazwa: 'Połącz kropki',
    ikona: '✏️',
    opis: 'Połącz kropki po kolei i odkryj obrazek.',
    opcje: [
      { id: 'poziom', etykieta: 'Poziom trudności', wybory: KP.POZIOMY, domyslnie: 'latwy' },
      { id: 'ksztalt', etykieta: 'Obrazek', wybory: [{ value: 'losowy', label: 'Niespodzianka' }].concat(KSZTALTY.map((k) => ({ value: k.nazwa, label: k.nazwa[0].toUpperCase() + k.nazwa.slice(1) }))), domyslnie: 'losowy' },
    ],

    generuj(o, R) {
      const ksz = KSZTALTY.find((k) => k.nazwa === o.ksztalt) || R.pick(KSZTALTY);
      const n = ILE[o.poziom] || ILE.latwy;
      const pkt = normalizuj(ksz.krzywa ? ksz.krzywa(n) : zageszczaj(ksz.rogi, n));
      const cx = pkt.reduce((a, p) => a + p[0], 0) / pkt.length;
      const cy = pkt.reduce((a, p) => a + p[1], 0) / pkt.length;
      const fs = pkt.length > 25 ? 2.6 : 3.4;
      const jedn = (a, b) => { const d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; return [(a[0] - b[0]) / d, (a[1] - b[1]) / d]; };

      // Numer odsuwamy od obu sąsiednich kropek (dwusieczna kąta), żeby nie nachodził na linie.
      const kropki = pkt.map(([x, y], i) => {
        const prev = pkt[(i - 1 + pkt.length) % pkt.length], next = pkt[(i + 1) % pkt.length];
        const a = jedn([x, y], prev), b = jedn([x, y], next);
        let dx = a[0] + b[0], dy = a[1] + b[1];
        if (Math.hypot(dx, dy) < 0.3) {
          dx = -(next[1] - prev[1]); dy = next[0] - prev[0];
          if (dx * (x - cx) + dy * (y - cy) < 0) { dx = -dx; dy = -dy; }
        }
        const d = Math.hypot(dx, dy) || 1;
        const lx = x + (dx / d) * (fs * 1.15), ly = y + (dy / d) * (fs * 1.15);
        const pierwsza = i === 0 ? ' class="pierwsza"' : '';
        return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${i === 0 ? 1.3 : 0.9}"${pierwsza}/>` +
          `<text x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" font-size="${fs}" text-anchor="middle" dominant-baseline="central">${i + 1}</text>`;
      }).join('');
      const linia = `<polygon points="${pkt.map((p) => p.map((v) => v.toFixed(2)).join(',')).join(' ')}" fill="none" stroke="#e4572e" stroke-width="0.7" stroke-linejoin="round"/>`;
      const svg = (extra) => `<svg class="rys kropki" viewBox="-4 -4 108 108" xmlns="http://www.w3.org/2000/svg">${extra || ''}<g class="punkty">${kropki}</g></svg>`;

      return {
        tytul: 'Połącz kropki',
        polecenie: `Połącz kropki po kolei, od 1 do ${pkt.length}, a na koniec połącz ${pkt.length} z 1. Co powstało? Pokoloruj obrazek.`,
        tresc: svg() + '<p class="podpis">To jest: <span class="linia-pisania"></span></p>',
        rozwiazanie: svg(linia) + `<p class="podpis">To jest: <b>${ksz.nazwa}</b></p>`,
      };
    },
  });
})();
