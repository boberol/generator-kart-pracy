/* Pisanie po śladzie: litery, sylaby, wyrazy lub własny tekst w wybranej liniaturze. */
(function () {
  'use strict';

  const SAMOGLOSKI = ['a', 'e', 'i', 'o', 'u', 'y'];
  const PISMA = {
    literki: { nazwa: 'Literki (domyślne)', rodzina: "'Playwrite PL', cursive" }, // rodzina tylko dla brakujących znaków
    pisane: { nazwa: 'Pisane (Playwrite Polska)', rodzina: "'Playwrite PL', cursive" },
    drukowane: { nazwa: 'Drukowane (Andika)', rodzina: "'Andika', 'Nunito', sans-serif" },
  };
  const ROZMIARY = { duze: 26, srednie: 19, male: 14 };

  function sylaby(l) {
    const m = l.toLocaleLowerCase('pl');
    if (SAMOGLOSKI.includes(m) || 'ąęó'.includes(m)) return ['m', 'l', 't', 'n', 'p', 'r'].map((s) => s + m);
    if ('ćńśź'.includes(m)) return [];
    return SAMOGLOSKI.filter((s) => !(s === 'y' && 'kgjl'.includes(m))).map((s) => m + s);
  }

  const kolor = (id, etykieta, domyslnie) => ({ id, etykieta, typ: 'kolor', domyslnie });

  KP.zarejestruj({
    id: 'pisanie',
    nazwa: 'Pisanie po śladzie',
    ikona: '✍️',
    opis: 'Litery, sylaby i wyrazy do pisania po śladzie.',
    opcje: [
      { id: 'tresc', etykieta: 'Co piszemy', wybory: [{ value: 'litera', label: 'Litery' }, { value: 'wyrazy', label: 'Wyrazy' }, { value: 'wlasny', label: 'Własny tekst' }], domyslnie: 'litera' },
      { id: 'litery', etykieta: 'Litery (w wybranej kolejności)', typ: 'linia', domyslnie: 'a', gdy: { tresc: 'litera' } },
      { id: 'temat', etykieta: 'Temat wyrazów', wybory: KP.tematy, domyslnie: 'zwierzeta', gdy: { tresc: 'wyrazy' } },
      Object.assign({}, KP.opcjaWlasne, { gdy: { tresc: 'wyrazy', temat: 'wlasne' } }),
      { id: 'tekst', etykieta: 'Twój tekst (każda linijka osobno)', typ: 'tekst', domyslnie: 'ala ma kota\nmama\ntata', gdy: { tresc: 'wlasny' } },
      { id: 'kolejnosc', etykieta: 'Kolejność', wybory: KP.KOLEJNOSCI, domyslnie: 'wpisana' },
      { id: 'pismo', etykieta: 'Pismo', wybory: Object.keys(PISMA).map((k) => ({ value: k, label: PISMA[k].nazwa })), domyslnie: 'literki' },
      { id: 'slad', etykieta: 'Wygląd śladu', wybory: [{ value: 'kropki', label: 'Kropki' }, { value: 'kreski', label: 'Kreski' }, { value: 'pelna', label: 'Jasna linia' }], domyslnie: 'kropki', gdy: { pismo: 'literki' } },
      { id: 'liniatura', etykieta: 'Liniatura', wybory: [{ value: 'trzy', label: 'Linie z polem środkowym' }, { value: 'kratka', label: 'Kratka' }, { value: 'jedna', label: 'Jedna linia' }, { value: 'brak', label: 'Bez linii' }], domyslnie: 'trzy' },
      { id: 'rozmiar', etykieta: 'Wielkość liter', wybory: [{ value: 'duze', label: 'Duże (przedszkole)' }, { value: 'srednie', label: 'Średnie (klasa 1)' }, { value: 'male', label: 'Małe (klasa 2–3)' }], domyslnie: 'duze' },
      { id: 'powtorzenia', etykieta: 'Ile razy powtórzyć', wybory: [{ value: 'wiersz', label: 'Do końca linii' }, { value: '3', label: '3 razy' }, { value: '2', label: '2 razy' }, { value: '1', label: '1 raz' }], domyslnie: 'wiersz' },
      { id: 'puste', etykieta: 'Samodzielne pisanie', wybory: [{ value: 'wzor', label: 'Linia ze wzorem po każdym śladzie' }, { value: 'koniec', label: 'Puste linie na końcu' }, { value: 'brak', label: 'Bez pustych linii' }], domyslnie: 'koniec' },
      kolor('kWzor', 'Kolor wzoru', '#1f2a44'),
      kolor('kSlad', 'Kolor śladu', '#8a93a6'),
      kolor('kPole', 'Kolor pola', '#fff6d6'),
      kolor('kLinia', 'Kolor linii', '#99aabb'),
    ],

    generuj(o, R) {
      const x = ROZMIARY[o.rozmiar] || ROZMIARY.duze;
      const pismo = PISMA[o.pismo] ? o.pismo : 'literki';
      const literki = pismo === 'literki';
      const W = 640, H = 860, mx = 18;
      const wysW = x * 3 + (o.liniatura === 'kratka' ? 0 : x * 0.6);
      const ileW = Math.floor(H / wysW);
      const zWzorem = o.puste === 'wzor';
      const naKoniec = o.puste === 'koniec' ? Math.max(1, Math.round(ileW / 4)) : 0;
      const miejsce = ileW - naKoniec;

      // Wiersze: { tekst, tryb: 'slad' | 'wolny' | 'pusty', obrazek }
      let tresci = [];
      if (o.tresc === 'wyrazy') {
        const sl = KP.slowaZTematu(o.temat, o).filter((w) => w.slowo.length <= (x > 20 ? 7 : 10));
        tresci = KP.uporzadkuj(sl, o.kolejnosc, R, (w) => w.slowo).map((w) => ({ tekst: w.slowo.toLocaleLowerCase('pl'), obrazek: w.obrazek }));
      } else if (o.tresc === 'wlasny') {
        const linie = String(o.tekst || '').split(/\n+/).map((s) => s.trim()).filter(Boolean).slice(0, 30);
        tresci = KP.uporzadkuj(linie.length ? linie : ['ala ma kota'], o.kolejnosc, R).map((t) => ({ tekst: t }));
      } else {
        let litery = Array.from(String(o.litery || '')).filter((c) => /[a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ]/u.test(c));
        litery = Array.from(new Set(litery));
        if (!litery.length) litery = ['a'];
        litery = KP.uporzadkuj(litery, o.kolejnosc, R);
        const wszystkie = KP.slowaZTematu('wszystkie');
        const kolejki = litery.map((L) => {
          const l = L.toLocaleLowerCase('pl');
          const q = [{ tekst: L }, { tekst: L }];
          if (!literki && L === l) q.push({ tekst: l.toLocaleUpperCase('pl') });
          const syl = sylaby(l);
          if (syl.length) q.push({ tekst: syl.slice(0, 3).join(' '), calosc: true }, { tekst: syl.slice(3).join(' '), calosc: true });
          const wyr = R.shuffle(wszystkie.filter((w) => w.slowo.toLocaleLowerCase('pl').includes(l) && w.slowo.length <= 7));
          wyr.slice(0, 3).forEach((w) => q.push({ tekst: w.slowo.toLocaleLowerCase('pl'), obrazek: w.obrazek }));
          return q;
        });
        const naLitere = Math.max(1, Math.floor((zWzorem ? miejsce / 2 : miejsce) / litery.length));
        kolejki.forEach((q) => { for (let i = 0; i < naLitere; i++) tresci.push(q[i] || q[i % 2]); });
      }

      const wiersze = [];
      for (let i = 0; wiersze.length < miejsce && tresci.length; i++) {
        const t = tresci[i % tresci.length];
        if (i >= tresci.length && o.tresc === 'litera') break;
        wiersze.push(Object.assign({ tryb: 'slad' }, t));
        if (zWzorem && wiersze.length < miejsce) wiersze.push(Object.assign({}, t, { tryb: 'wolny' }));
        if (i > 200) break;
      }
      while (wiersze.length < ileW) wiersze.push({ tryb: 'pusty', tekst: '' });

      const kL = o.kLinia || '#99aabb';
      let tlo = '', grupy = '';
      const y0 = (H - ileW * wysW) / 2;
      if (o.liniatura === 'kratka') {
        const szer = Math.floor((W - 2 * mx) / x) * x;
        for (let gx = mx; gx <= mx + szer + 0.1; gx += x) tlo += `<line x1="${gx}" y1="${y0}" x2="${gx}" y2="${y0 + ileW * wysW}" stroke="${kL}" stroke-width="0.6" opacity="0.7"/>`;
        for (let gy = y0; gy <= y0 + ileW * wysW + 0.1; gy += x) tlo += `<line x1="${mx}" y1="${gy}" x2="${mx + szer}" y2="${gy}" stroke="${kL}" stroke-width="0.6" opacity="0.7"/>`;
      }
      wiersze.forEach((w, i) => {
        const top = y0 + i * wysW;
        const linia = top + x, baza = top + 2 * x, dol = top + 3 * x;
        if (o.liniatura === 'trzy') {
          tlo += `<rect x="${mx}" y="${linia}" width="${W - 2 * mx}" height="${x}" fill="${o.kPole || '#fff6d6'}"/>`;
          tlo += `<line x1="${mx}" y1="${top}" x2="${W - mx}" y2="${top}" stroke="${kL}" stroke-width="0.8"/>`;
          tlo += `<line x1="${mx}" y1="${linia}" x2="${W - mx}" y2="${linia}" stroke="${kL}" stroke-width="0.8" stroke-dasharray="4 3"/>`;
          tlo += `<line x1="${mx}" y1="${dol}" x2="${W - mx}" y2="${dol}" stroke="${kL}" stroke-width="0.8"/>`;
        }
        if (o.liniatura === 'trzy' || o.liniatura === 'jedna') tlo += `<line x1="${mx}" y1="${baza}" x2="${W - mx}" y2="${baza}" stroke="#d66" stroke-width="1.2"/>`;
        if (w.tryb === 'pusty') return;
        let start = mx + x * 0.4;
        if (w.obrazek) {
          grupy += `<text x="${mx + x * 0.9}" y="${top + 1.5 * x}" font-size="${x * 1.6}" text-anchor="middle" dominant-baseline="central">${w.obrazek}</text>`;
          start = mx + x * 2.1;
        }
        const cfg = {
          t: w.tekst, tryb: w.tryb, c: w.calosc ? 1 : 0, x: start, max: W - mx - x * 0.3, y: baza, xh: x,
          p: pismo, r: PISMA[pismo].rodzina, ile: o.powtorzenia || 'wiersz', s: o.slad || 'kropki', st: false,
          kw: o.kWzor || '#1f2a44', ks: o.kSlad || '#8a93a6',
        };
        grupy += `<g class="pis-wiersz" data-cfg="${KP.esc(JSON.stringify(cfg))}"></g>`;
      });

      const opisLiter = o.tresc === 'litera' ? Array.from(new Set(Array.from(String(o.litery || 'a')).filter((c) => /\p{L}/u.test(c)))).join(', ') : '';
      return {
        tytul: opisLiter ? `Piszę: ${opisLiter}` : 'Pisanie po śladzie',
        polecenie: 'Pisz po śladzie, zaczynając od wzoru. W pustych miejscach napisz samodzielnie.',
        tresc: `<svg class="rys pelna pisanie" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${tlo}${grupy}</svg>`,
        rozwiazanie: null,
        po: ulozWiersze,
      };
    },
  });

  // Rozmieszczanie tekstu po wczytaniu czcionek: dopasowanie wysokości do liniatury
  // i powtarzanie śladu do końca linii.
  const ctx = document.createElement('canvas').getContext('2d');
  function wspX(rodzina) {
    ctx.font = `100px ${rodzina}`;
    const m = ctx.measureText('x');
    return (m.actualBoundingBoxAscent || 50) / 100;
  }
  function szerTekstu(tekst, fs, rodzina) {
    ctx.font = `${fs}px ${rodzina}`;
    return ctx.measureText(tekst).width;
  }

  function ulozWiersze(kontener) {
    kontener.querySelectorAll('svg.pisanie g.pis-wiersz').forEach((g) => {
      const c = JSON.parse(g.dataset.cfg);
      const fs = c.xh / wspX(c.r);
      // Kopia: zwraca [svg, szerokość]
      const kopia = (x, wzor) => {
        if (c.p === 'literki') {
          const u = KP.literkiUklad(c.t, c.xh, (ch) => szerTekstu(ch, fs, c.r));
          let svg = KP.literkiSvg(u, x, c.y, c.xh, {
            kolor: wzor ? c.kw : c.ks, kreska: wzor ? 'pelna' : c.s, grubosc: wzor ? 1 : 0.9, start: c.st,
          });
          u.elementy.filter((e) => e.brak).forEach((e) => {
            svg += `<text x="${(x + e.x).toFixed(1)}" y="${c.y}" font-size="${fs.toFixed(1)}" fill="${wzor ? c.kw : c.ks}" style="font-family:${KP.esc(c.r)}">${KP.esc(e.brak)}</text>`;
          });
          return [svg, u.szer];
        }
        const w = szerTekstu(c.t, fs, c.r);
        const kol = wzor ? c.kw : c.ks;
        return [`<text x="${x.toFixed(1)}" y="${c.y}" font-size="${fs.toFixed(1)}" fill="${kol}" ${wzor ? '' : 'opacity="0.55"'} style="font-family:${KP.esc(c.r)}">${KP.esc(c.t)}</text>`, w];
      };
      let x = c.x;
      const [pierwszy, szer] = kopia(x, true);
      let html = pierwszy;
      if (c.tryb === 'slad') {
        const odstep = c.xh * (c.c ? 2.6 : 1.6);
        const limit = c.ile === 'wiersz' ? Infinity : parseInt(c.ile, 10);
        for (let n = 0; n < limit; n++) {
          x += szer + odstep;
          if (x + szer > c.max) break;
          html += kopia(x, false)[0];
        }
      }
      g.innerHTML = html;
    });
  }
})();
