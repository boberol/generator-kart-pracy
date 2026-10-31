/* Labirynt: generowany algorytmem DFS z powrotami, z rozwiązaniem (BFS). */
(function () {
  'use strict';

  const BOHATEROWIE = [
    { start: '🐭', meta: '🧀', tekst: 'Pomóż myszce dotrzeć do sera.' },
    { start: '🐰', meta: '🥕', tekst: 'Pomóż króliczkowi znaleźć marchewkę.' },
    { start: '🐝', meta: '🌸', tekst: 'Pomóż pszczółce dolecieć do kwiatka.' },
    { start: '🐶', meta: '🦴', tekst: 'Pomóż pieskowi znaleźć kość.' },
    { start: '🐿️', meta: '🌰', tekst: 'Pomóż wiewiórce dotrzeć do orzecha.' },
    { start: '🚗', meta: '🏠', tekst: 'Pomóż autku wrócić do domu.' },
    { start: '🐻', meta: '🍯', tekst: 'Pomóż misiowi znaleźć miód.' },
  ];

  const ROZMIARY = { latwy: [7, 9], sredni: [12, 15], trudny: [18, 23] };

  KP.zarejestruj({
    id: 'labirynt',
    nazwa: 'Labirynt',
    ikona: '🌀',
    opis: 'Znajdź drogę od startu do mety.',
    opcje: [{ id: 'poziom', etykieta: 'Poziom trudności', wybory: KP.POZIOMY, domyslnie: 'latwy' }],

    generuj(o, R) {
      const [kol, wier] = ROZMIARY[o.poziom] || ROZMIARY.latwy;
      const n = kol * wier;
      // ściany: [góra, prawo, dół, lewo]
      const sciany = Array.from({ length: n }, () => [true, true, true, true]);
      const odw = new Array(n).fill(false);
      const KIER = [
        [0, -1, 0, 2],
        [1, 0, 1, 3],
        [0, 1, 2, 0],
        [-1, 0, 3, 1],
      ];
      const stos = [0];
      odw[0] = true;
      while (stos.length) {
        const c = stos[stos.length - 1];
        const x = c % kol, y = Math.floor(c / kol);
        const sasiedzi = KIER.filter(([dx, dy]) => {
          const nx = x + dx, ny = y + dy;
          return nx >= 0 && ny >= 0 && nx < kol && ny < wier && !odw[ny * kol + nx];
        });
        if (!sasiedzi.length) { stos.pop(); continue; }
        const [dx, dy, s, p] = R.pick(sasiedzi);
        const nc = (y + dy) * kol + (x + dx);
        sciany[c][s] = false;
        sciany[nc][p] = false;
        odw[nc] = true;
        stos.push(nc);
      }
      const ost = n - 1;
      sciany[0][3] = false;
      sciany[ost][1] = false;

      // rozwiązanie
      const rodzic = new Array(n).fill(-1);
      rodzic[0] = 0;
      const kolejka = [0];
      while (kolejka.length) {
        const c = kolejka.shift();
        if (c === ost) break;
        const x = c % kol, y = Math.floor(c / kol);
        KIER.forEach(([dx, dy, s]) => {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= kol || ny >= wier || sciany[c][s]) return;
          const nc = ny * kol + nx;
          if (rodzic[nc] === -1) { rodzic[nc] = c; kolejka.push(nc); }
        });
      }
      const droga = [];
      for (let c = ost; ; c = rodzic[c]) { droga.unshift(c); if (c === 0) break; }

      // rysowanie
      const W = 640, H = 800, pad = 46;
      const k = Math.min((W - 2 * pad) / kol, (H - 2 * pad) / wier);
      const ox = (W - k * kol) / 2, oy = (H - k * wier) / 2;
      let d = '';
      for (let y = 0; y < wier; y++) {
        for (let x = 0; x < kol; x++) {
          const s = sciany[y * kol + x];
          const X = ox + x * k, Y = oy + y * k;
          if (s[0]) d += `M${X} ${Y}h${k}`;
          if (s[3]) d += `M${X} ${Y}v${k}`;
          if (x === kol - 1 && s[1]) d += `M${X + k} ${Y}v${k}`;
          if (y === wier - 1 && s[2]) d += `M${X} ${Y + k}h${k}`;
        }
      }
      const gr = o.poziom === 'trudny' ? 2.5 : o.poziom === 'sredni' ? 3.5 : 5;
      const b = R.pick(BOHATEROWIE);
      const em = Math.min(40, Math.max(28, k * 1.1));
      const sx = ox - em * 0.6, sy = oy + k / 2;
      const mx = ox + kol * k + em * 0.6, my = oy + wier * k - k / 2;
      const emoji = `
        <text x="${sx}" y="${sy}" font-size="${em}" text-anchor="middle" dominant-baseline="central">${b.start}</text>
        <text x="${mx}" y="${my}" font-size="${em}" text-anchor="middle" dominant-baseline="central">${b.meta}</text>`;
      const svg = (extra) => `<svg class="rys" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        ${extra || ''}
        <path d="${d}" fill="none" stroke="#222" stroke-width="${gr}" stroke-linecap="round"/>
        ${emoji}</svg>`;

      const pkt = droga.map((c) => `${ox + (c % kol) * k + k / 2},${oy + Math.floor(c / kol) * k + k / 2}`);
      pkt.unshift(`${ox},${oy + k / 2}`);
      pkt.push(`${ox + kol * k},${my}`);
      const linia = `<polyline points="${pkt.join(' ')}" fill="none" stroke="#e4572e" stroke-width="${Math.max(3, k / 4)}" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`;

      return {
        tytul: 'Labirynt',
        polecenie: b.tekst + ' Narysuj drogę ołówkiem.',
        tresc: svg(),
        rozwiazanie: svg(linia),
      };
    },
  });
})();
