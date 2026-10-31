/* Działania matematyczne: zwykłe zadania lub szyfr z ukrytym hasłem. */
(function () {
  'use strict';

  const HASLA = ['BRAWO', 'SUPER', 'JESIEŃ', 'KOTEK', 'ZABAWA', 'WAKACJE', 'DYNIA', 'SZKOŁA', 'PRZYJACIEL', 'CZEKOLADA', 'WIEWIÓRKA', 'MISTRZ', 'SŁONECZKO', 'LATAWIEC'];

  function dzialanie(R, rodzaj, max) {
    const typ = rodzaj === 'mieszane' ? R.pick(['+', '-']) : rodzaj;
    if (typ === '+') {
      const a = R.int(0, max), b = R.int(0, max - a);
      return { tekst: `${a} + ${b}`, wynik: a + b };
    }
    if (typ === '-') {
      const a = R.int(0, max), b = R.int(0, a);
      return { tekst: `${a} − ${b}`, wynik: a - b };
    }
    // mnożenie: iloczyn nie większy niż zakres (maks. tabliczka do 100)
    const lim = Math.min(10, max);
    let a, b;
    do { a = R.int(1, lim); b = R.int(1, lim); } while (a * b > max);
    return { tekst: `${a} · ${b}`, wynik: a * b };
  }

  // Działanie o z góry zadanym wyniku (do szyfru).
  function dzialanieDla(R, rodzaj, max, w) {
    const typ = rodzaj === 'mieszane' ? R.pick(['+', '-']) : rodzaj;
    if (typ === '+') { const a = w >= 2 ? R.int(1, w - 1) : R.int(0, w); return { tekst: `${a} + ${w - a}`, wynik: w }; }
    if (typ === '-') { const a = w < max ? R.int(w + 1, max) : w; return { tekst: `${a} − ${a - w}`, wynik: w }; }
    const pary = [];
    for (let a = 1; a <= 10; a++) if (w % a === 0 && w / a <= 10) pary.push(a);
    const a = R.pick(pary);
    return { tekst: `${a} · ${w / a}`, wynik: w };
  }

  function mozliweWyniki(rodzaj, max) {
    const s = new Set();
    if (rodzaj === '*') {
      for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) if (a * b <= max) s.add(a * b);
    } else {
      for (let w = 1; w <= max; w++) s.add(w);
    }
    return Array.from(s);
  }

  // Unikamy zbyt wielu banalnych zadań typu 0 + 0.
  function ciekawe(R, rodzaj, max) {
    let d;
    for (let i = 0; i < 20; i++) {
      d = dzialanie(R, rodzaj, max);
      if (!/(^| )0( |$)/.test(d.tekst) || R.next() < 0.1) break;
    }
    return d;
  }

  KP.zarejestruj({
    id: 'matematyka',
    nazwa: 'Działania',
    ikona: '🔢',
    opis: 'Dodawanie, odejmowanie, mnożenie i ukryte hasła.',
    opcje: [
      { id: 'tryb', etykieta: 'Rodzaj karty', wybory: [{ value: 'haslo', label: 'Ukryte hasło (szyfr)' }, { value: 'zwykle', label: 'Zwykłe działania' }, { value: 'porownaj', label: 'Porównywanie (<, >, =)' }, { value: 'ciagi', label: 'Brakujące liczby' }], domyslnie: 'haslo' },
      { id: 'zakres', etykieta: 'Zakres liczb', wybory: [{ value: '10', label: 'do 10' }, { value: '20', label: 'do 20' }, { value: '100', label: 'do 100' }], domyslnie: '10' },
      { id: 'rodzaj', etykieta: 'Działania', wybory: [{ value: '+', label: 'Dodawanie' }, { value: '-', label: 'Odejmowanie' }, { value: 'mieszane', label: 'Dodawanie i odejmowanie' }, { value: '*', label: 'Mnożenie' }], domyslnie: '+' },
    ],

    generuj(o, R) {
      const max = parseInt(o.zakres, 10) || 10;
      const rodzaj = o.rodzaj || '+';

      if (o.tryb === 'zwykle') {
        const zad = Array.from({ length: 20 }, () => ciekawe(R, rodzaj, max));
        const lista = (rozw) => '<ol class="dzialania">' + zad.map((d) =>
          `<li><span>${d.tekst} =</span> <span class="okienko">${rozw ? d.wynik : ''}</span></li>`).join('') + '</ol>';
        return {
          tytul: 'Policz i wpisz wynik',
          polecenie: 'Rozwiąż działania i wpisz wyniki w okienka.',
          tresc: lista(false),
          rozwiazanie: lista(true),
        };
      }

      if (o.tryb === 'porownaj') {
        const zad = Array.from({ length: 16 }, () => {
          const a = ciekawe(R, rodzaj, max);
          const b = R.next() < 0.25 ? dzialanieDla(R, rodzaj, max, a.wynik) : R.next() < 0.5 ? { tekst: String(R.int(0, max)) } : ciekawe(R, rodzaj, max);
          if (b.wynik === undefined) b.wynik = parseInt(b.tekst, 10);
          const [l, p] = R.next() < 0.5 ? [a, b] : [b, a];
          return { l, p, znak: l.wynik < p.wynik ? '<' : l.wynik > p.wynik ? '>' : '=' };
        });
        const lista = (rozw) => '<ol class="dzialania porownaj">' + zad.map((z) =>
          `<li><span>${z.l.tekst}</span> <span class="okienko kolko">${rozw ? z.znak : ''}</span> <span>${z.p.tekst}</span></li>`).join('') + '</ol>';
        return {
          tytul: 'Porównaj',
          polecenie: 'Policz i porównaj obie strony. W kółko wpisz znak <, > albo =.',
          tresc: lista(false),
          rozwiazanie: lista(true),
        };
      }

      if (o.tryb === 'ciagi') {
        const krokMax = max <= 10 ? 2 : max <= 20 ? 3 : 10;
        const ciagi = Array.from({ length: 8 }, () => {
          const dl = 6;
          const krok = R.int(1, krokMax) * (R.next() < 0.3 ? -1 : 1);
          let start = R.int(0, max);
          if (krok > 0) start = Math.min(start, max - krok * (dl - 1));
          else start = Math.max(start, -krok * (dl - 1));
          const liczby = Array.from({ length: dl }, (_, i) => start + krok * i);
          const luki = new Set(R.shuffle([1, 2, 3, 4, 5]).slice(0, 2));
          return { liczby, luki };
        });
        const lista = (rozw) => '<div class="ciagi">' + ciagi.map((c) => '<div class="ciag">' + c.liczby.map((v, i) =>
          c.luki.has(i) ? `<span class="okienko">${rozw ? v : ''}</span>` : `<span class="okienko dane">${v}</span>`).join('') + '</div>').join('') + '</div>';
        return {
          tytul: 'Brakujące liczby',
          polecenie: 'Odkryj, jak zmieniają się liczby, i wpisz te, których brakuje.',
          tresc: lista(false),
          rozwiazanie: lista(true),
        };
      }

      // Tryb szyfru: każda litera hasła ma swoją liczbę.
      const mozliwe = mozliweWyniki(rodzaj, max);
      const hasla = HASLA.filter((h) => new Set(h).size <= mozliwe.length);
      const haslo = R.pick(hasla);
      const litery = Array.from(new Set(haslo));
      const pula = R.shuffle(mozliwe);
      const kod = {};
      litery.forEach((l, i) => { kod[l] = pula[i]; });

      const zadania = Array.from(haslo).map((l) => ({ ...dzialanieDla(R, rodzaj, max, kod[l]), litera: l }));

      const klucz = '<div class="klucz">' + litery.slice().sort((a, b) => kod[a] - kod[b])
        .map((l) => `<div><b>${kod[l]}</b><span>${l}</span></div>`).join('') + '</div>';
      const kolumny = zadania.length <= 6 ? zadania.length : Math.ceil(zadania.length / 2);
      const szyfr = (rozw) => `<div class="szyfr" style="--n:${kolumny}">` + zadania.map((z) =>
        `<div class="kol"><div class="dz">${z.tekst}</div><div class="okienko">${rozw ? z.wynik : ''}</div><div class="okienko litera">${rozw ? z.litera : ''}</div></div>`).join('') + '</div>';

      return {
        tytul: 'Ukryte hasło',
        polecenie: 'Rozwiąż działania. Wynik wpisz w górne okienko, a w dolne wpisz literę, która pasuje do wyniku według szyfru. Jakie hasło się ukryło?',
        tresc: '<h3>Szyfr</h3>' + klucz + szyfr(false),
        rozwiazanie: '<h3>Szyfr</h3>' + klucz + szyfr(true) + `<p class="podpis">Hasło: <b>${haslo}</b></p>`,
      };
    },
  });
})();
