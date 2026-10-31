/* Pisanie po śladzie: litery, sylaby, wyrazy lub własny tekst w liniaturze. */
(function () {
  'use strict';

  const ALFABET = 'A Ą B C Ć D E Ę F G H I J K L Ł M N Ń O Ó P R S Ś T U W Y Z Ź Ż'.split(' ');
  const SAMOGLOSKI = ['a', 'e', 'i', 'o', 'u', 'y'];
  const PISMA = {
    pisane: { rodzina: "'Playwrite PL', cursive", odstep: 0.9 },
    drukowane: { rodzina: "'Andika', 'Nunito', sans-serif", odstep: 0.9 },
  };
  const ROZMIARY = { duze: 26, srednie: 19, male: 14 }; // wysokość pola środkowego (jednostki SVG ≈ 0,29 mm)

  function sylaby(l) {
    const m = l.toLocaleLowerCase('pl');
    if (SAMOGLOSKI.includes(m) || 'ąęó'.includes(m)) return ['ma', 'la', 'ta', 'no', 'pu', 'ry'].map((s) => s[0] + m);
    if ('ćńśź'.includes(m)) return []; // te litery rzadko łączą się z samogłoską w sylabach dla dzieci
    return SAMOGLOSKI.filter((s) => !(s === 'y' && 'kgjl'.includes(m))).map((s) => m + s);
  }

  KP.zarejestruj({
    id: 'pisanie',
    nazwa: 'Pisanie po śladzie',
    ikona: '✍️',
    grupa: 'pisanie',
    opis: 'Litery, sylaby i wyrazy do pisania po śladzie.',
    opcje: [
      { id: 'tresc', etykieta: 'Co piszemy', wybory: [{ value: 'litera', label: 'Literę' }, { value: 'wyrazy', label: 'Wyrazy z obrazkami' }, { value: 'wlasny', label: 'Własny tekst' }], domyslnie: 'litera' },
      { id: 'litera', etykieta: 'Litera', wybory: ALFABET.map((l) => ({ value: l, label: `${l} ${l.toLocaleLowerCase('pl')}` })), domyslnie: 'A', gdy: { tresc: 'litera' } },
      { id: 'temat', etykieta: 'Temat', wybory: KP.tematy, domyslnie: 'zwierzeta', gdy: { tresc: 'wyrazy' } },
      { id: 'tekst', etykieta: 'Twój tekst (każda linijka osobno)', typ: 'tekst', domyslnie: 'Ala ma kota.\nMama\nTata', gdy: { tresc: 'wlasny' } },
      { id: 'pismo', etykieta: 'Pismo', wybory: [{ value: 'pisane', label: 'Pisane (szkolne)' }, { value: 'drukowane', label: 'Drukowane' }], domyslnie: 'pisane' },
      { id: 'liniatura', etykieta: 'Liniatura', wybory: [{ value: 'trzy', label: 'Trzy linie (pole środkowe)' }, { value: 'kratka', label: 'Kratka' }, { value: 'jedna', label: 'Jedna linia' }], domyslnie: 'trzy' },
      { id: 'rozmiar', etykieta: 'Wielkość liter', wybory: [{ value: 'duze', label: 'Duże (przedszkole)' }, { value: 'srednie', label: 'Średnie (klasa 1)' }, { value: 'male', label: 'Małe (klasa 2–3)' }], domyslnie: 'duze' },
    ],

    generuj(o, R) {
      const x = ROZMIARY[o.rozmiar] || ROZMIARY.duze;
      const pismo = PISMA[o.pismo] || PISMA.pisane;
      const W = 640, H = 860, mx = 18;
      const wysW = x * 3 + (o.liniatura === 'kratka' ? 0 : x * 0.6);
      const ileW = Math.floor(H / wysW);

      // Lista wierszy: { tekst, tryb: 'slad' | 'wolny', obrazek }
      const wiersze = [];
      if (o.tresc === 'wyrazy') {
        const sl = R.shuffle(KP.slowaZTematu(o.temat).filter((w) => w.slowo.length <= (x > 20 ? 6 : 9)));
        const male = (w) => { const s = w.slowo.toLocaleLowerCase('pl'); return s; };
        for (let i = 0; wiersze.length < ileW && i < sl.length; i++) {
          wiersze.push({ tekst: male(sl[i]), tryb: 'slad', obrazek: sl[i].obrazek });
          wiersze.push({ tekst: male(sl[i]), tryb: 'wolny', obrazek: sl[i].obrazek });
        }
      } else if (o.tresc === 'wlasny') {
        const linie = String(o.tekst || '').split(/\n+/).map((s) => s.trim()).filter(Boolean).slice(0, 20);
        if (!linie.length) linie.push('Wpisz tekst');
        let i = 0;
        while (wiersze.length < ileW) {
          const t = linie[i % linie.length];
          wiersze.push({ tekst: t, tryb: 'slad' });
          if (wiersze.length < ileW) wiersze.push({ tekst: t, tryb: 'wolny' });
          i++;
          if (i >= linie.length * 3) break;
        }
      } else {
        const L = ALFABET.includes(o.litera) ? o.litera : 'A';
        const l = L.toLocaleLowerCase('pl');
        const wyrazy = KP.slowaZTematu('wszystkie').filter((w) => w.slowo.startsWith(L) && w.slowo.length <= 7).map((w) => w.slowo.toLocaleLowerCase('pl'));
        const lista = [
          { tekst: L, tryb: 'slad' }, { tekst: L, tryb: 'slad' },
          { tekst: l, tryb: 'slad' }, { tekst: l, tryb: 'slad' },
          { tekst: L + l, tryb: 'slad' },
        ];
        const syl = sylaby(L);
        if (syl.length) lista.push({ tekst: syl.slice(0, 3).join(' '), tryb: 'slad', calosc: true }, { tekst: syl.slice(3).join(' '), tryb: 'slad', calosc: true });
        R.shuffle(wyrazy).slice(0, 3).forEach((w) => lista.push({ tekst: w, tryb: 'slad' }));
        lista.push({ tekst: L + l, tryb: 'wolny' });
        for (let i = 0; wiersze.length < ileW; i++) wiersze.push(i < lista.length ? lista[i] : { tekst: (i % 2 ? l : L), tryb: 'slad' });
      }

      let tlo = '', grupy = '';
      const y0 = (H - ileW * wysW) / 2;
      if (o.liniatura === 'kratka') {
        for (let gx = mx; gx <= W - mx + 0.1; gx += x) tlo += `<line x1="${gx}" y1="${y0}" x2="${gx}" y2="${y0 + ileW * wysW}" class="kratka-l"/>`;
        for (let gy = y0; gy <= y0 + ileW * wysW + 0.1; gy += x) tlo += `<line x1="${mx}" y1="${gy}" x2="${mx + Math.floor((W - 2 * mx) / x) * x}" y2="${gy}" class="kratka-l"/>`;
      }
      wiersze.slice(0, ileW).forEach((w, i) => {
        const top = y0 + i * wysW;
        const linia = top + x, baza = top + 2 * x, dol = top + 3 * x;
        if (o.liniatura === 'trzy') {
          tlo += `<rect x="${mx}" y="${linia}" width="${W - 2 * mx}" height="${x}" class="pole"/>`;
          tlo += `<line x1="${mx}" y1="${top}" x2="${W - mx}" y2="${top}" class="lin-g"/>`;
          tlo += `<line x1="${mx}" y1="${linia}" x2="${W - mx}" y2="${linia}" class="lin-s"/>`;
          tlo += `<line x1="${mx}" y1="${dol}" x2="${W - mx}" y2="${dol}" class="lin-g"/>`;
        }
        if (o.liniatura !== 'kratka') tlo += `<line x1="${mx}" y1="${baza}" x2="${W - mx}" y2="${baza}" class="lin-b"/>`;
        let start = mx + x * 0.4;
        if (w.obrazek) {
          grupy += `<text x="${mx + x * 0.9}" y="${top + 1.5 * x}" font-size="${x * 1.6}" text-anchor="middle" dominant-baseline="central">${w.obrazek}</text>`;
          start = mx + x * 2.1;
        }
        grupy += `<g class="pis-wiersz" data-tekst="${KP.esc(w.tekst)}" data-tryb="${w.tryb}" data-calosc="${w.calosc ? 1 : 0}" data-x="${start}" data-max="${W - mx - x * 0.3}" data-y="${baza}" data-xh="${x}" data-odstep="${pismo.odstep}"></g>`;
      });

      const svg = `<svg class="rys pelna pisanie" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="--pismo:${KP.esc(pismo.rodzina)}">${tlo}${grupy}</svg>`;
      return {
        tytul: o.tresc === 'litera' ? `Piszę literę ${ALFABET.includes(o.litera) ? o.litera : 'A'}` : 'Pisanie po śladzie',
        polecenie: 'Pisz po szarym śladzie, zaczynając od czarnego wzoru. W pustych miejscach napisz samodzielnie. Pamiętaj o prawidłowym trzymaniu ołówka.',
        tresc: svg,
        rozwiazanie: null,
        po: ulozWiersze,
      };
    },
  });

  // Rozmieszczanie tekstu po wczytaniu czcionki: dopasowanie wysokości do liniatury
  // i powtarzanie śladu do końca linii.
  const miary = {};
  function wspX(rodzina) {
    if (miary[rodzina]) return miary[rodzina];
    const c = document.createElement('canvas').getContext('2d');
    c.font = `100px ${rodzina}`;
    const m = c.measureText('x');
    const r = (m.actualBoundingBoxAscent || 50) / 100;
    if (document.fonts && document.fonts.status === 'loaded') miary[rodzina] = r;
    return r;
  }

  function ulozWiersze(kontener) {
    const NS = 'http://www.w3.org/2000/svg';
    kontener.querySelectorAll('svg.pisanie').forEach((svg) => {
      const rodzina = svg.style.getPropertyValue('--pismo') || 'sans-serif';
      const r = wspX(rodzina);
      svg.querySelectorAll('g.pis-wiersz').forEach((g) => {
        while (g.firstChild) g.removeChild(g.firstChild);
        const tekst = g.dataset.tekst;
        const xh = parseFloat(g.dataset.xh);
        const fs = xh / r;
        const y = parseFloat(g.dataset.y);
        const max = parseFloat(g.dataset.max);
        let x = parseFloat(g.dataset.x);
        const tryb = g.dataset.tryb;
        const nowy = (klasa) => {
          const t = document.createElementNS(NS, 'text');
          t.setAttribute('x', x.toFixed(1));
          t.setAttribute('y', y);
          t.setAttribute('font-size', fs.toFixed(1));
          t.setAttribute('class', klasa);
          t.style.fontFamily = rodzina;
          t.textContent = tekst;
          g.appendChild(t);
          return t;
        };
        const wzor = nowy('pis-wzor');
        const szer = wzor.getComputedTextLength();
        const odstep = xh * 2 * parseFloat(g.dataset.odstep);
        if (tryb === 'wolny') return;
        if (g.dataset.calosc === '1') {
          x += szer + odstep * 1.5;
          if (x + szer <= max) nowy('pis-slad');
          return;
        }
        for (;;) {
          x += szer + odstep;
          if (x + szer > max) break;
          nowy('pis-slad');
        }
      });
    });
  }
})();
