/* Zabawy w kratce: szlaczki po kratkach (wzór → ślad → samodzielnie)
   oraz dyktando graficzne (strzałki z liczbą kratek, z rozwiązaniem). */
(function () {
  'use strict';

  // Wielkość kratki w jednostkach SVG (640 j. ≈ 186 mm, 1 mm ≈ 3,44 j.).
  const KRATKA = { duza: 34.4, srednia: 25.8, mala: 17.2 };

  /* Szlaczki: punkty jednego okresu od (0,0) do (p,0), y w górę (w kratkach).
     `osobno` – każdy okres to osobna kreska; `pola` – kratki do zamalowania. */
  const SZLACZKI = {
    zamki: { nazwa: 'Zamki', p: 2, h: 2, pkt: [[0, 0], [0, 2], [1, 2], [1, 0], [2, 0]], poziom: 1 },
    trojkaty: { nazwa: 'Daszki', p: 2, h: 2, pkt: [[0, 0], [1, 2], [2, 0]], poziom: 1 },
    kwadraty: { nazwa: 'Kwadraty do zamalowania', p: 2, h: 1, pola: [[0, 0]], poziom: 1 },
    kreski: { nazwa: 'Kreski ukośne', p: 1, h: 2, pkt: [[0, 0], [1, 2]], osobno: true, poziom: 1 },
    pila: { nazwa: 'Piła', p: 2, h: 2, pkt: [[0, 0], [2, 2], [2, 0]], poziom: 2 },
    szerokieZamki: { nazwa: 'Szerokie zamki', p: 4, h: 2, pkt: [[0, 0], [0, 2], [2, 2], [2, 0], [4, 0]], poziom: 2 },
    schodki: { nazwa: 'Schodki', p: 3, h: 2, pkt: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 0], [3, 0]], poziom: 2 },
    strzalki: { nazwa: 'Strzałki', p: 2, h: 2, pkt: [[0, 0], [1, 1], [0, 2]], osobno: true, poziom: 2 },
    piramidki: { nazwa: 'Piramidki', p: 4, h: 2, pkt: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 1], [3, 1], [3, 0], [4, 0]], poziom: 3 },
    szachownica: { nazwa: 'Szachownica', p: 2, h: 2, pola: [[0, 0], [1, 1]], poziom: 3 },
    zygzak: { nazwa: 'Duży zygzak', p: 4, h: 2, pkt: [[0, 0], [2, 2], [4, 0]], poziom: 3 },
    wiezyczki: { nazwa: 'Wieżyczki', p: 4, h: 3, pkt: [[0, 0], [0, 2], [1, 2], [1, 3], [2, 3], [2, 2], [3, 2], [3, 0], [4, 0]], poziom: 3 },
  };

  /* Dyktando: ruchy „liczba + kierunek”. Kształt jest zamknięty (wraca do startu). */
  const KIER = {
    '↑': [0, 1], '↓': [0, -1], '→': [1, 0], '←': [-1, 0],
    '↗': [1, 1], '↘': [1, -1], '↙': [-1, -1], '↖': [-1, 1],
  };
  const OBRAZKI = {
    domek: { nazwa: 'Domek', ruchy: '3↑ 2↗ 2↘ 3↓ 4←', poziom: 1 },
    zamek: { nazwa: 'Zamek', ruchy: '4↑ 1→ 1↓ 1→ 1↑ 1→ 1↓ 1→ 1↑ 1→ 4↓ 5←', poziom: 1 },
    schody: { nazwa: 'Schody', ruchy: '1↑ 1→ 1↑ 1→ 1↑ 1→ 1↑ 1→ 4↓ 4←', poziom: 1 },
    plus: { nazwa: 'Plus', ruchy: '2↑ 2← 2↑ 2→ 2↑ 2→ 2↓ 2→ 2↓ 2← 2↓ 2←', poziom: 1 },
    ryba: { nazwa: 'Rybka', ruchy: '4↑ 2↘ 2↗ 2↘ 2↙ 2↖ 2↙', poziom: 2 },
    choinka: { nazwa: 'Choinka', ruchy: '2↑ 2← 2↗ 1← 2↗ 2↘ 1← 2↘ 2← 2↓ 2←', poziom: 2 },
    strzalka: { nazwa: 'Strzałka', ruchy: '2↑ 3→ 2↑ 3↘ 3↙ 2↑ 3←', poziom: 2 },
    serce: { nazwa: 'Serce', ruchy: '3↖ 1↑ 1↗ 1→ 1↘ 1↗ 1→ 1↘ 1↓ 3↙', poziom: 3 },
    lodka: { nazwa: 'Łódka', ruchy: '6→ 2↗ 5← 4↑ 3↘ 3← 1↓ 5← 2↘', poziom: 3 },
    grzybek: { nazwa: 'Grzybek', ruchy: '2↑ 2← 2↗ 2→ 2↘ 2← 2↓ 2←', poziom: 2 },
    rakieta: { nazwa: 'Rakieta', ruchy: '1↖ 4↑ 2↗ 2↘ 4↓ 1↙ 2←', poziom: 3 },
  };

  KP.kratkaObrazki = OBRAZKI;
  KP.kratkaSzlaczki = SZLACZKI;

  KP.ruchyNaPunkty = function (ruchy) {
    const pts = [[0, 0]];
    String(ruchy).trim().split(/\s+/).forEach((r) => {
      const m = r.match(/^(\d+)(.)$/u);
      if (!m || !KIER[m[2]]) throw new Error('Zły ruch: ' + r);
      const [dx, dy] = KIER[m[2]], n = +m[1];
      const [x, y] = pts[pts.length - 1];
      pts.push([x + dx * n, y + dy * n]);
    });
    return pts;
  };

  const poziomNr = { latwy: 1, sredni: 2, trudny: 3 };

  KP.zarejestruj({
    id: 'kratka',
    nazwa: 'Szlaczki w kratce i dyktando',
    ikona: '🟦',
    opis: 'Szlaczki po kratkach i dyktando graficzne ze strzałkami.',
    opcje: [
      { id: 'tryb', etykieta: 'Rodzaj zadania', wybory: [{ value: 'szlaczki', label: 'Szlaczki w kratce' }, { value: 'dyktando', label: 'Dyktando graficzne' }], domyslnie: 'szlaczki' },
      { id: 'poziom', etykieta: 'Poziom trudności', wybory: KP.POZIOMY, domyslnie: 'latwy' },
      { id: 'wzor', etykieta: 'Wzór', wybory: [{ value: 'mieszane', label: 'Różne (wg poziomu)' }].concat(Object.keys(SZLACZKI).map((k) => ({ value: k, label: SZLACZKI[k].nazwa }))), domyslnie: 'mieszane', gdy: { tryb: 'szlaczki' } },
      { id: 'kolejnosc', etykieta: 'Kolejność wzorów', wybory: [{ value: 'wpisana', label: 'Od najłatwiejszych' }, { value: 'losowa', label: 'Losowa' }], domyslnie: 'wpisana', gdy: { tryb: 'szlaczki', wzor: 'mieszane' } },
      { id: 'obrazek', etykieta: 'Obrazek', wybory: [{ value: 'losowy', label: 'Losowy (wg poziomu)' }].concat(Object.keys(OBRAZKI).map((k) => ({ value: k, label: OBRAZKI[k].nazwa }))), domyslnie: 'losowy', gdy: { tryb: 'dyktando' } },
      { id: 'kratka', etykieta: 'Wielkość kratki', wybory: [{ value: 'duza', label: 'Duża (1 cm)' }, { value: 'srednia', label: 'Średnia (7,5 mm)' }, { value: 'mala', label: 'Mała (5 mm, jak w zeszycie)' }], domyslnie: 'duza' },
      { id: 'kWzor', etykieta: 'Kolor wzoru', typ: 'kolor', domyslnie: '#1f2a44' },
      { id: 'kSlad', etykieta: 'Kolor śladu', typ: 'kolor', domyslnie: '#8a93a6' },
      { id: 'kLinia', etykieta: 'Kolor kratki', typ: 'kolor', domyslnie: '#a9c4e0' },
    ],

    generuj(o, R) {
      return o.tryb === 'dyktando' ? dyktando(o, R) : szlaczki(o, R);
    },
  });

  function siatka(W, H, k, kolor) {
    // Odrobina zapasu, żeby skrajne linie nie były ucięte na brzegu rysunku.
    const nx = Math.floor((W - 2) / k), ny = Math.floor((H - 2) / k);
    const ox = (W - nx * k) / 2, oy = (H - ny * k) / 2;
    let d = '';
    for (let i = 0; i <= nx; i++) d += `M${(ox + i * k).toFixed(1)} ${oy.toFixed(1)}V${(oy + ny * k).toFixed(1)}`;
    for (let j = 0; j <= ny; j++) d += `M${ox.toFixed(1)} ${(oy + j * k).toFixed(1)}H${(ox + nx * k).toFixed(1)}`;
    return { nx, ny, ox, oy, svg: `<path d="${d}" fill="none" stroke="${kolor}" stroke-width="0.8"/>` };
  }

  function szlaczki(o, R) {
    const W = 640, H = 860;
    const k = KRATKA[o.kratka] || KRATKA.duza;
    const kL = o.kLinia || '#a9c4e0', kW = o.kWzor || '#1f2a44', kS = o.kSlad || '#8a93a6';
    const s = siatka(W, H, k, kL);
    const poz = poziomNr[o.poziom] || 1;
    const klucze = Object.keys(SZLACZKI);
    const pula = klucze.filter((key) => SZLACZKI[key].poziom <= poz).sort((a, b) => SZLACZKI[a].poziom - SZLACZKI[b].poziom);
    let kolejka = [];
    const nastepny = () => {
      if (SZLACZKI[o.wzor]) return o.wzor;
      if (!kolejka.length) kolejka = o.kolejnosc === 'losowa' ? R.shuffle(pula) : pula.slice();
      return kolejka.shift();
    };
    // Ile okresów ze śladem: łatwy – do końca, średni – połowa, trudny – bez śladu.
    const sladCzesc = poz === 1 ? 1 : poz === 2 ? 0.5 : 0;
    const X = (cx) => s.ox + cx * k;
    let out = '';
    let wiersz = 1; // w kratkach od góry
    while (true) {
      const klucz = nastepny();
      const w = SZLACZKI[klucz];
      if (wiersz + w.h + 1 > s.ny) break;
      const baza = wiersz + w.h; // linia bazowa (w kratkach od góry)
      const Y = (cy) => s.oy + (baza - cy) * k;
      const okresy = Math.floor((s.nx - 2) / w.p);
      const wzorN = Math.min(okresy, w.p >= 3 ? 1 : 2);
      const sladN = Math.round((okresy - wzorN) * sladCzesc);
      const rysuj = (od, ile, wzor) => {
        if (ile <= 0) return '';
        if (w.pola) {
          let r = '';
          for (let n = od; n < od + ile; n++) {
            w.pola.forEach(([px, py]) => {
              const x = X(1 + n * w.p + px), y = Y(py + 1);
              r += wzor
                ? `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${k.toFixed(1)}" height="${k.toFixed(1)}" fill="${kW}"/>`
                : `<rect x="${(x + 1.5).toFixed(1)}" y="${(y + 1.5).toFixed(1)}" width="${(k - 3).toFixed(1)}" height="${(k - 3).toFixed(1)}" fill="none" stroke="${kS}" stroke-width="1.6" stroke-dasharray="0.1 4" stroke-linecap="round"/>`;
            });
          }
          return r;
        }
        const linie = [];
        if (w.osobno) {
          for (let n = od; n < od + ile; n++) linie.push(w.pkt.map(([px, py]) => [1 + n * w.p + px, py]));
        } else {
          const pts = [];
          for (let n = od; n < od + ile; n++) w.pkt.forEach(([px, py], i) => { if (i || n === od) pts.push([1 + n * w.p + px, py]); });
          linie.push(pts);
        }
        const d = linie.map((pts) => pts.map(([cx, cy], i) => (i ? 'L' : 'M') + X(cx).toFixed(1) + ' ' + Y(cy).toFixed(1)).join('')).join('');
        return wzor
          ? `<path d="${d}" fill="none" stroke="${kW}" stroke-width="${(k * 0.1 + 1.2).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`
          : `<path d="${d}" fill="none" stroke="${kS}" stroke-width="${(k * 0.08 + 1).toFixed(1)}" stroke-dasharray="0.1 ${(k * 0.22 + 2).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`;
      };
      out += rysuj(0, wzorN, true) + rysuj(wzorN, sladN, false);
      wiersz += w.h + 2;
    }
    return {
      tytul: 'Szlaczki w kratce',
      polecenie: sladCzesc ? 'Rysuj szlaczek po śladzie, a potem dokończ go samodzielnie do końca linii.' : 'Przerysuj szlaczek po kratkach i dokończ go do końca linii.',
      tresc: `<svg class="rys pelna" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${s.svg}${out}</svg>`,
      rozwiazanie: null,
    };
  }

  function dyktando(o, R) {
    const W = 640, H = 600;
    const k = KRATKA[o.kratka] || KRATKA.duza;
    const kL = o.kLinia || '#a9c4e0', kW = o.kWzor || '#1f2a44';
    const poz = poziomNr[o.poziom] || 1;
    let klucz = o.obrazek;
    if (!OBRAZKI[klucz]) {
      const pula = Object.keys(OBRAZKI).filter((key) => OBRAZKI[key].poziom === poz);
      klucz = R.pick(pula);
    }
    const ob = OBRAZKI[klucz];
    const pts = KP.ruchyNaPunkty(ob.ruchy);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const s = siatka(W, H, k, kL);
    // Start tak, żeby obrazek był na środku kartki.
    const sx = Math.floor((s.nx - (maxX - minX)) / 2) - minX;
    const sy = Math.floor((s.ny - (maxY - minY)) / 2) - minY; // od dołu
    const P = ([cx, cy]) => [s.ox + (sx + cx) * k, s.oy + (s.ny - (sy + cy)) * k];
    const [x0, y0] = P([0, 0]);
    const kropka = `<circle cx="${x0.toFixed(1)}" cy="${y0.toFixed(1)}" r="${(k * 0.18 + 2).toFixed(1)}" fill="${kW}"/>`;
    const d = pts.map((p, i) => { const [x, y] = P(p); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }).join('');

    const ruchy = ob.ruchy.split(/\s+/);
    const lista = ruchy.map((r, i) => `<li><span class="nr">${i + 1}.</span>${KP.esc(r.slice(0, -1))}<b>${KP.esc(r.slice(-1))}</b></li>`).join('');
    const diagonalne = /[↗↘↙↖]/u.test(ob.ruchy);
    const legenda = `<p class="dyktando-legenda">↑ w górę · ↓ w dół · → w prawo · ← w lewo${diagonalne ? ' · ↗ ↘ ↙ ↖ na ukos przez kratkę' : ''}</p>`;
    const svg = (rozw) => `<svg class="rys pelna" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${s.svg}${rozw ? `<path d="${d}" fill="${kW}" fill-opacity="0.12" stroke="${kW}" stroke-width="${(k * 0.1 + 1.4).toFixed(1)}" stroke-linejoin="round" stroke-linecap="round"/>` : ''}${kropka}</svg>`;
    return {
      tytul: 'Dyktando graficzne',
      polecenie: 'Zacznij od kropki. Rysuj po liniach kratki: liczba mówi, o ile kratek, a strzałka, w którą stronę. Co powstało?',
      tresc: `<ol class="dyktando">${lista}</ol>${legenda}${svg(false)}<p class="podpis">To jest: <i class="linia-pisania"></i></p>`,
      rozwiazanie: `${svg(true)}<p class="podpis">To jest: <b>${KP.esc(ob.nazwa.toLocaleLowerCase('pl'))}</b></p>`,
    };
  }
})();
