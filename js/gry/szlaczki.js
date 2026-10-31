/* Szlaczki: wzór do obrysowania po śladzie i do samodzielnego dokończenia. */
(function () {
  'use strict';

  const UST = {
    latwy: { wiersze: 6, okres: 70, slad: 1 },
    sredni: { wiersze: 8, okres: 52, slad: 0.55 },
    trudny: { wiersze: 10, okres: 40, slad: 0.25 },
  };

  KP.zarejestruj({
    id: 'szlaczki',
    nazwa: 'Szlaczki',
    ikona: '〰️',
    grupa: 'pisanie',
    opis: 'Rysuj szlaczki po śladzie, a potem samodzielnie.',
    opcje: [
      { id: 'poziom', etykieta: 'Poziom trudności', wybory: KP.POZIOMY, domyslnie: 'latwy' },
      { id: 'wzor', etykieta: 'Wzór', wybory: [{ value: 'mieszane', label: 'Różne wzory' }].concat(Object.keys(KP.wzory).map((k) => ({ value: k, label: KP.wzory[k].nazwa }))), domyslnie: 'mieszane' },
      { id: 'kolejnosc', etykieta: 'Kolejność wzorów', wybory: [{ value: 'losowa', label: 'Losowa' }, { value: 'wpisana', label: 'Od najłatwiejszych' }], domyslnie: 'losowa', gdy: { wzor: 'mieszane' } },
      { id: 'kWzor', etykieta: 'Kolor wzoru', typ: 'kolor', domyslnie: '#1f2a44' },
      { id: 'kSlad', etykieta: 'Kolor śladu', typ: 'kolor', domyslnie: '#8a93a6' },
      { id: 'kPole', etykieta: 'Kolor pola', typ: 'kolor', domyslnie: '#fff6d6' },
    ],

    generuj(o, R) {
      const u = UST[o.poziom] || UST.latwy;
      const W = 640, H = 860, mx = 24;
      const wysWiersza = H / u.wiersze;
      const wys = wysWiersza * 0.42;
      // „Od najłatwiejszych”: kolejność jak w KP.wzory (fale, zygzak, zamki…).
      const klucze = Object.keys(KP.wzory);
      const poKolei = o.kolejnosc === 'wpisana';
      let kolejne = [];
      let svg = '';
      for (let i = 0; i < u.wiersze; i++) {
        let klucz = o.wzor;
        if (!KP.wzory[klucz]) {
          if (!kolejne.length) kolejne = poKolei ? klucze.slice().reverse() : R.shuffle(klucze);
          klucz = kolejne.pop();
        }
        const wzor = KP.wzory[klucz];
        const yDol = i * wysWiersza + wysWiersza * 0.72;
        const yGora = yDol - wys;
        const okresy = Math.floor((W - 2 * mx) / u.okres);
        const sz = (W - 2 * mx) / okresy;
        const sladDo = 1 + Math.round((okresy - 1) * u.slad);
        // liniatura
        svg += `<rect x="${mx - 8}" y="${yGora}" width="${W - 2 * mx + 16}" height="${wys}" fill="${o.kPole || '#fff6d6'}"/>`;
        svg += `<line x1="${mx - 8}" y1="${yGora}" x2="${W - mx + 8}" y2="${yGora}" stroke="#9ab" stroke-width="1"/>`;
        svg += `<line x1="${mx - 8}" y1="${yDol}" x2="${W - mx + 8}" y2="${yDol}" stroke="#d66" stroke-width="1.4"/>`;
        // wzór (pierwszy okres pełną linią), potem ślad z kropek
        const wzorPts = KP.punktyWzoru(wzor, 0, 1, mx, yDol, sz, wys);
        svg += `<path d="${KP.sciezka(wzorPts)}" fill="none" stroke="${o.kWzor || '#1f2a44'}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
        if (sladDo > 1) {
          const sladPts = KP.punktyWzoru(wzor, 1, sladDo, mx, yDol, sz, wys);
          svg += `<path d="${KP.sciezka(sladPts)}" fill="none" stroke="${o.kSlad || '#8a93a6'}" stroke-width="2.6" stroke-dasharray="0.1 7" stroke-linecap="round" stroke-linejoin="round"/>`;
        }
        const start = wzorPts[0];
        svg += `<circle cx="${start[0]}" cy="${start[1]}" r="4.5" fill="#2e9e5b"/>`;
      }
      return {
        tytul: 'Szlaczki',
        polecenie: 'Zacznij od zielonej kropki. Rysuj szlaczek po śladzie, nie odrywając ołówka, a potem dokończ go samodzielnie do końca linii.',
        tresc: `<svg class="rys pelna" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`,
        rozwiazanie: null,
      };
    },
  });
})();
