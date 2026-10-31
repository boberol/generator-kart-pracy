/* Papier: puste strony z liniaturą, kratką, kropkami lub miejscem na rysunek. */
(function () {
  'use strict';

  const kolor = (id, etykieta, domyslnie, gdy) => ({ id, etykieta, typ: 'kolor', domyslnie, gdy });
  // Wysokość pola środkowego / boku kratki w jednostkach SVG (640 j. ≈ 186 mm, czyli 1 j. ≈ 0,29 mm).
  const ROZMIAR = { duze: 34.4, srednie: 26, male: 17.2 };

  KP.zarejestruj({
    id: 'papier',
    nazwa: 'Papier w linie i kratkę',
    ikona: '📄',
    opis: 'Puste strony: liniatura, kratka, kropki, miejsce na rysunek.',
    opcje: [
      {
        id: 'rodzaj', etykieta: 'Rodzaj strony', domyslnie: 'liniatura', wybory: [
          { value: 'liniatura', label: 'Linie z polem środkowym' },
          { value: 'linie', label: 'Pojedyncze linie' },
          { value: 'kratka', label: 'Kratka' },
          { value: 'kropki', label: 'Siatka kropek' },
          { value: 'rysunek', label: 'Rysunek + linie' },
          { value: 'piec', label: 'Pięciolinia' },
        ],
      },
      { id: 'rozmiar', etykieta: 'Wielkość', wybory: [{ value: 'duze', label: 'Duża (przedszkole, kratka 1 cm)' }, { value: 'srednie', label: 'Średnia (klasa 1)' }, { value: 'male', label: 'Mała (klasa 2–3, kratka 5 mm)' }], domyslnie: 'duze' },
      { id: 'tytul', etykieta: 'Tytuł strony (opcjonalnie)', typ: 'linia', domyslnie: '' },
      { id: 'imie', etykieta: 'Pole „Imię i data”', wybory: [{ value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' }], domyslnie: 'tak' },
      { id: 'margines', etykieta: 'Margines', wybory: [{ value: 'nie', label: 'Bez marginesu' }, { value: 'tak', label: 'Z czerwonym marginesem' }], domyslnie: 'nie' },
      kolor('kLinia', 'Kolor linii', '#8fb3d9'),
      kolor('kPole', 'Kolor pola środkowego', '#fff6d6', { rodzaj: 'liniatura' }),
      kolor('kBaza', 'Kolor linii bazowej', '#dd6666'),
    ],

    generuj(o) {
      const W = 640, H = 900, mx = 6;
      const r = ROZMIAR[o.rozmiar] || ROZMIAR.duze;
      const kL = o.kLinia || '#8fb3d9', kB = o.kBaza || '#dd6666';
      const linia = (x1, y1, x2, y2, kol, gr, ext) => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${kol}" stroke-width="${gr}" ${ext || ''}/>`;
      let s = '';
      let y = 0;

      const liniatura = (od, doY) => {
        const wys = r * 3 + r * 0.7;
        const n = Math.floor((doY - od) / wys);
        for (let i = 0; i < n; i++) {
          const top = od + i * wys + r * 0.35;
          s += `<rect x="${mx}" y="${top + r}" width="${W - 2 * mx}" height="${r}" fill="${o.kPole || '#fff6d6'}"/>`;
          s += linia(mx, top, W - mx, top, kL, 0.9);
          s += linia(mx, top + r, W - mx, top + r, kL, 0.9, 'stroke-dasharray="5 4"');
          s += linia(mx, top + 2 * r, W - mx, top + 2 * r, kB, 1.3);
          s += linia(mx, top + 3 * r, W - mx, top + 3 * r, kL, 0.9);
        }
      };
      const linie = (od, doY) => {
        const k = r * 1.6;
        for (let yy = od + k; yy <= doY; yy += k) s += linia(mx, yy, W - mx, yy, kL, 1);
      };

      if (o.rodzaj === 'kratka' || o.rodzaj === 'kropki') {
        const k = r;
        const nx = Math.floor((W - 2 * mx) / k), ny = Math.floor(H / k);
        const ox = (W - nx * k) / 2, oy = (H - ny * k) / 2;
        if (o.rodzaj === 'kratka') {
          for (let i = 0; i <= nx; i++) s += linia(ox + i * k, oy, ox + i * k, oy + ny * k, kL, 0.7);
          for (let j = 0; j <= ny; j++) s += linia(ox, oy + j * k, ox + nx * k, oy + j * k, kL, 0.7);
        } else {
          for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) s += `<circle cx="${(ox + i * k).toFixed(1)}" cy="${(oy + j * k).toFixed(1)}" r="1.6" fill="${kL}"/>`;
        }
      } else if (o.rodzaj === 'rysunek') {
        const h = H * 0.45;
        s += `<rect x="${mx}" y="2" width="${W - 2 * mx}" height="${h}" rx="10" fill="none" stroke="${kL}" stroke-width="2" stroke-dasharray="8 5"/>`;
        y = h + 20;
        liniatura(y, H);
      } else if (o.rodzaj === 'linie') {
        linie(0, H);
      } else if (o.rodzaj === 'piec') {
        const odst = Math.max(r * 0.5, 11), grupa = odst * 4 + r * 2.2;
        for (let top = r * 0.6; top + odst * 4 <= H; top += grupa) {
          for (let i = 0; i < 5; i++) s += linia(mx, top + i * odst, W - mx, top + i * odst, kL, 1);
        }
      } else {
        liniatura(0, H);
      }
      if (o.margines === 'tak') s += linia(mx + 50, 0, mx + 50, H, kB, 1.2);

      return {
        tytul: o.tytul || '',
        polecenie: '',
        bezImienia: o.imie === 'nie',
        bezIkony: true,
        tresc: `<svg class="rys pelna" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`,
        rozwiazanie: null,
      };
    },
  });
})();
