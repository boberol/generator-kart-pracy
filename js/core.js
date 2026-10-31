/* Wspólne narzędzia: rejestr gier, generator liczb losowych, słownictwo. */
(function () {
  'use strict';

  const KP = (window.KP = { gry: [] });

  KP.zarejestruj = function (gra) {
    KP.gry.push(gra);
  };

  /* Deterministyczny generator (mulberry32): ten sam numer karty = ta sama karta. */
  KP.losowanie = function (ziarno) {
    let a = ziarno >>> 0;
    const next = function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const R = {
      next,
      int: (min, max) => min + Math.floor(next() * (max - min + 1)),
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      shuffle: (arr) => {
        const a2 = arr.slice();
        for (let i = a2.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [a2[i], a2[j]] = [a2[j], a2[i]];
        }
        return a2;
      },
    };
    return R;
  };

  KP.hashTekstu = function (s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  KP.esc = function (s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };

  /* Polska odmiana liczebników: 1 wyraz, 2 wyrazy, 5 wyrazów. */
  KP.odmiana = function (n, jeden, kilka, wiele) {
    if (n === 1) return jeden;
    const d = n % 10, s = n % 100;
    return d >= 2 && d <= 4 && (s < 12 || s > 14) ? kilka : wiele;
  };

  KP.litery = function (slowo, wielkosc) {
    return wielkosc === 'male' ? slowo.toLocaleLowerCase('pl') : slowo.toLocaleUpperCase('pl');
  };

  /* Słownictwo: wyraz + obrazek (emoji) w podziale na tematy. */
  KP.tematy = [
    { value: 'zwierzeta', label: 'Zwierzęta' },
    { value: 'jedzenie', label: 'Owoce i warzywa' },
    { value: 'dom', label: 'Dom i szkoła' },
    { value: 'przyroda', label: 'Przyroda i pogoda' },
    { value: 'pojazdy', label: 'Pojazdy' },
    { value: 'wszystkie', label: 'Wszystko razem' },
  ];

  const S = {
    zwierzeta: 'KOT🐱 PIES🐶 KROWA🐄 KOŃ🐴 ŚWINIA🐷 KACZKA🦆 ŻABA🐸 LIS🦊 SOWA🦉 MYSZ🐭 ZEBRA🦓 LEW🦁 SŁOŃ🐘 ŻÓŁW🐢 WĄŻ🐍 JEŻ🦔 RYBA🐟 KOZA🐐 KURA🐔 PSZCZOŁA🐝 MOTYL🦋 ŚLIMAK🐌 NIEDŹWIEDŹ🐻 KRÓLIK🐰 PINGWIN🐧 MAŁPA🐵',
    jedzenie: 'JABŁKO🍎 GRUSZKA🍐 BANAN🍌 CYTRYNA🍋 WIŚNIE🍒 TRUSKAWKA🍓 WINOGRONA🍇 ANANAS🍍 ARBUZ🍉 MARCHEW🥕 OGÓREK🥒 POMIDOR🍅 KUKURYDZA🌽 DYNIA🎃 GRZYB🍄 BROKUŁ🥦 ZIEMNIAK🥔 KIWI🥝 CEBULA🧅 CHLEB🍞 SER🧀 JAJKO🥚',
    dom: 'KSIĄŻKA📖 OŁÓWEK✏️ PLECAK🎒 NOŻYCZKI✂️ ZEGAR⏰ ŻARÓWKA💡 KLUCZ🔑 KRZESŁO🪑 ŁÓŻKO🛏️ PARASOL☂️ TELEFON📱 DOM🏠 PIŁKA⚽ BALON🎈 PREZENT🎁 LIST✉️ ZESZYT📓 KUBEK☕ LALKA🪆 MŁOTEK🔨',
    przyroda: 'SŁOŃCE☀️ KSIĘŻYC🌙 GWIAZDA⭐ CHMURA☁️ DESZCZ🌧️ TĘCZA🌈 BAŁWAN⛄ DRZEWO🌳 KWIAT🌸 LIŚĆ🍁 OGIEŃ🔥 ŚNIEŻYNKA❄️ KASZTAN🌰 GÓRY⛰️ FALA🌊 TULIPAN🌷 KAKTUS🌵 PIORUN⚡',
    pojazdy: 'AUTO🚗 AUTOBUS🚌 ROWER🚲 POCIĄG🚂 SAMOLOT✈️ STATEK🚢 RAKIETA🚀 TRAKTOR🚜 HELIKOPTER🚁 MOTOR🏍️ ŁÓDKA⛵ TRAMWAJ🚋 KARETKA🚑 TAKSÓWKA🚕 HULAJNOGA🛴',
  };

  KP.slowa = {};
  Object.keys(S).forEach((kat) => {
    KP.slowa[kat] = S[kat].split(' ').map((t) => {
      const m = t.match(/^([A-ZĄĆĘŁŃÓŚŹŻ]+)(.+)$/u);
      return { slowo: m[1], obrazek: m[2], kat };
    });
  });

  KP.slowaZTematu = function (temat) {
    if (temat === 'wszystkie' || !KP.slowa[temat]) {
      return Object.values(KP.slowa).flat();
    }
    return KP.slowa[temat].slice();
  };

  KP.POZIOMY = [
    { value: 'latwy', label: 'Łatwy (4–6 lat)' },
    { value: 'sredni', label: 'Średni (6–8 lat)' },
    { value: 'trudny', label: 'Trudny (8–10 lat)' },
  ];

  KP.WIELKOSC = [
    { value: 'wielkie', label: 'WIELKIE LITERY' },
    { value: 'male', label: 'małe litery' },
  ];
})();

/* Wzory szlaczków: funkcja s∈[0,1) → [x, y] w jednostkach jednego okresu
   (x: 0–1 w prawo, y: 0 = dół, 1 = góra). Używane w szlaczkach i ścieżkach. */
(function () {
  'use strict';
  const P = Math.PI * 2;
  KP.wzory = {
    fala: { nazwa: 'Fale', f: (s) => [s, 0.5 + 0.5 * Math.sin(P * s - Math.PI / 2)] },
    zygzak: { nazwa: 'Zygzak', f: (s) => [s, s < 0.5 ? 2 * s : 2 - 2 * s], kanty: [0, 0.5] },
    zamki: {
      nazwa: 'Zamki',
      f: (s) => (s < 0.25 ? [0, s * 4] : s < 0.5 ? [(s - 0.25) * 2, 1] : s < 0.75 ? [0.5, 1 - (s - 0.5) * 4] : [0.5 + (s - 0.75) * 2, 0]),
      kanty: [0, 0.25, 0.5, 0.75],
    },
    luki: { nazwa: 'Łuki (u)', f: (s) => [s, 1 - Math.sin(Math.PI * s)], kanty: [0] },
    mostki: { nazwa: 'Mostki (n)', f: (s) => [s, Math.sin(Math.PI * s)], kanty: [0] },
    petelki: { nazwa: 'Pętelki', f: (s) => [s - 0.28 * Math.sin(P * s), 0.5 - 0.5 * Math.cos(P * s)] },
    trojkaty: {
      nazwa: 'Ząbki',
      f: (s) => (s < 0.4 ? [s * 1.25, s * 2.5] : s < 0.8 ? [0.5, 1 - (s - 0.4) * 2.5] : [0.5 + (s - 0.8) * 2.5, 0]),
      kanty: [0, 0.4, 0.8],
    },
    sprezynka: { nazwa: 'Sprężynka', f: (s) => [s + 0.42 * Math.sin(P * s), 0.5 - 0.5 * Math.cos(P * s)] },
  };

  /* Punkty wzoru od okresu u0 do u1 (mogą być ułamkowe), przeskalowane do prostokąta. */
  KP.punktyWzoru = function (wzor, u0, u1, x0, yDol, szer, wys, gestosc) {
    const n = gestosc || 48;
    const pts = [];
    const kanty = wzor.kanty || [];
    let poprzedni = null;
    const dodaj = (u) => {
      const k = Math.floor(u), s = u - k;
      const [x, y] = wzor.f(s);
      const p = [x0 + (k + x) * szer, yDol - y * wys];
      if (!poprzedni || Math.abs(p[0] - poprzedni[0]) > 0.01 || Math.abs(p[1] - poprzedni[1]) > 0.01) pts.push(p);
      poprzedni = p;
    };
    const kroki = [];
    for (let u = u0; u < u1; u += 1 / n) kroki.push(u);
    // Dokładne narożniki, żeby kanty były ostre.
    for (let k = Math.floor(u0); k < u1; k++) kanty.forEach((c) => { if (k + c >= u0 && k + c <= u1) kroki.push(k + c); });
    kroki.push(u1 - 1e-9);
    kroki.sort((a, b) => a - b).forEach(dodaj);
    return pts;
  };

  KP.sciezka = function (pts) {
    return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
  };
})();
