/* Prowadzenie linii po śladzie od obrazka do obrazka. */
(function () {
  'use strict';

  const PARY = [
    ['🐝', '🌸'], ['🐭', '🧀'], ['🐰', '🥕'], ['🚗', '🏠'], ['🐶', '🦴'], ['🐦', '🌳'],
    ['🚀', '🌙'], ['⚽', '🥅'], ['🐿️', '🌰'], ['🐻', '🍯'], ['🐸', '🪷'], ['🦋', '🌼'],
    ['🐌', '🍃'], ['🐟', '🪸'], ['🐱', '🥛'], ['🚂', '🏁'],
  ];
  const UST = {
    latwy: { wiersze: 5, okresy: [1, 2], wzory: ['prosta', 'fala', 'luki', 'mostki', 'zygzak'] },
    sredni: { wiersze: 6, okresy: [3, 4], wzory: ['fala', 'zygzak', 'luki', 'mostki', 'zamki', 'trojkaty'] },
    trudny: { wiersze: 7, okresy: [5, 7], wzory: ['zygzak', 'zamki', 'petelki', 'trojkaty', 'sprezynka', 'fala'] },
  };
  const PROSTA = { f: (s) => [s, 0.5] };

  KP.zarejestruj({
    id: 'sciezki',
    nazwa: 'Prowadzenie linii',
    ikona: '🖍️',
    grupa: 'pisanie',
    opis: 'Prowadź linię po śladzie od obrazka do obrazka.',
    opcje: [{ id: 'poziom', etykieta: 'Poziom trudności', wybory: KP.POZIOMY, domyslnie: 'latwy' }],

    generuj(o, R) {
      const u = UST[o.poziom] || UST.latwy;
      const W = 640, H = 860;
      const h = H / u.wiersze;
      const pary = R.shuffle(PARY);
      const wzory = R.shuffle(u.wzory);
      const em = Math.min(64, h * 0.5);
      const x0 = 30 + em, x1 = W - 30 - em;
      let svg = '';
      for (let i = 0; i < u.wiersze; i++) {
        const [a, b] = pary[i % pary.length];
        const klucz = wzory[i % wzory.length];
        const wzor = klucz === 'prosta' ? PROSTA : KP.wzory[klucz];
        const okr = R.int(u.okresy[0], u.okresy[1]);
        const yS = i * h + h / 2;
        const amp = klucz === 'prosta' ? 0 : h * 0.42;
        const pts = KP.punktyWzoru(wzor, 0, okr, x0 + 28, yS + amp / 2, (x1 - x0 - 56) / okr, amp, 60);
        const [sx, sy] = pts[0];
        svg += `<line x1="30" y1="${(i + 1) * h}" x2="${W - 30}" y2="${(i + 1) * h}" stroke="#e3e6ec" stroke-width="1" ${i === u.wiersze - 1 ? 'opacity="0"' : ''}/>`;
        svg += `<path d="M${x0 - 6} ${yS}L${sx} ${sy}${KP.sciezka(pts).replace(/^M/, 'L')}L${x1 + 6} ${yS}" fill="none" stroke="#8a93a6" stroke-width="3" stroke-dasharray="0.1 9" stroke-linecap="round" stroke-linejoin="round"/>`;
        svg += `<text x="${30 + em / 2}" y="${yS}" font-size="${em}" text-anchor="middle" dominant-baseline="central">${a}</text>`;
        svg += `<text x="${W - 30 - em / 2}" y="${yS}" font-size="${em}" text-anchor="middle" dominant-baseline="central">${b}</text>`;
      }
      return {
        tytul: 'Prowadź linię',
        polecenie: 'Poprowadź kredką linię po kropkach od obrazka po lewej do obrazka po prawej. Staraj się nie wyjeżdżać poza ślad.',
        tresc: `<svg class="rys pelna" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`,
        rozwiazanie: null,
      };
    },
  });
})();
