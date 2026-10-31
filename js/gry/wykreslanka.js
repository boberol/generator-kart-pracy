/* Wykreślanka: ukryte wyrazy w siatce liter. */
(function () {
  'use strict';

  const USTAWIENIA = {
    latwy: { rozmiar: 8, ile: 5, kier: [[1, 0], [0, 1]] },
    sredni: { rozmiar: 10, ile: 8, kier: [[1, 0], [0, 1], [1, 1]] },
    trudny: { rozmiar: 12, ile: 11, kier: [[1, 0], [0, 1], [1, 1], [1, -1], [-1, 0], [0, -1], [-1, -1], [-1, 1]] },
  };
  // Częstsze litery pojawiają się częściej, żeby siatka wyglądała naturalnie.
  const WYPELNIENIE = 'AAAAEEEEIIIOOOUYYZZNNRRSSWWCCKKMMPPTTLLDDJBGHŁĄĘÓŚŻŹĆŃ';

  KP.zarejestruj({
    id: 'wykreslanka',
    nazwa: 'Wykreślanka',
    ikona: '🔍',
    opis: 'Odszukaj i zakreśl ukryte wyrazy.',
    opcje: [
      { id: 'poziom', etykieta: 'Poziom trudności', wybory: KP.POZIOMY, domyslnie: 'latwy' },
      { id: 'temat', etykieta: 'Temat', wybory: KP.tematy, domyslnie: 'zwierzeta' },
      KP.opcjaWlasne,
      { id: 'litery', etykieta: 'Litery', wybory: KP.WIELKOSC, domyslnie: 'wielkie' },
    ],

    generuj(o, R) {
      const u = USTAWIENIA[o.poziom] || USTAWIENIA.latwy;
      const N = u.rozmiar;
      const siatka = Array.from({ length: N }, () => new Array(N).fill(null));
      const trafienia = new Set();
      const kandydaci = R.shuffle(KP.slowaZTematu(o.temat, o).filter((w) => w.slowo.length >= 3 && w.slowo.length <= N));
      const umieszczone = [];

      for (const w of kandydaci) {
        if (umieszczone.length >= u.ile) break;
        const lit = Array.from(w.slowo);
        for (let proba = 0; proba < 150; proba++) {
          const [dx, dy] = R.pick(u.kier);
          const x0 = R.int(0, N - 1), y0 = R.int(0, N - 1);
          const x1 = x0 + dx * (lit.length - 1), y1 = y0 + dy * (lit.length - 1);
          if (x1 < 0 || y1 < 0 || x1 >= N || y1 >= N) continue;
          let ok = true;
          for (let i = 0; i < lit.length && ok; i++) {
            const c = siatka[y0 + dy * i][x0 + dx * i];
            if (c !== null && c !== lit[i]) ok = false;
          }
          if (!ok) continue;
          for (let i = 0; i < lit.length; i++) {
            siatka[y0 + dy * i][x0 + dx * i] = lit[i];
            trafienia.add((y0 + dy * i) * N + (x0 + dx * i));
          }
          umieszczone.push(w);
          break;
        }
      }
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (siatka[y][x] === null) siatka[y][x] = R.pick(Array.from(WYPELNIENIE));

      const tabela = (zRozw) => {
        let h = `<table class="wykreslanka" style="--n:${N}">`;
        for (let y = 0; y < N; y++) {
          h += '<tr>';
          for (let x = 0; x < N; x++) {
            const hit = zRozw && trafienia.has(y * N + x) ? ' class="hit"' : '';
            h += `<td${hit}>${KP.esc(KP.litery(siatka[y][x], o.litery))}</td>`;
          }
          h += '</tr>';
        }
        return h + '</table>';
      };
      const lista = '<ul class="lista-slow">' + umieszczone
        .slice().sort((a, b) => a.slowo.localeCompare(b.slowo, 'pl'))
        .map((w) => `<li><span class="em">${w.obrazek}</span> ${KP.esc(KP.litery(w.slowo, o.litery))}</li>`).join('') + '</ul>';

      const kierunki = o.poziom === 'trudny' ? 'poziomo, pionowo, na ukos, a nawet od tyłu'
        : o.poziom === 'sredni' ? 'poziomo, pionowo i na ukos' : 'poziomo i pionowo';
      return {
        tytul: 'Wykreślanka',
        polecenie: `Znajdź w kratkach ${umieszczone.length} ${KP.odmiana(umieszczone.length, 'wyraz', 'wyrazy', 'wyrazów')} i zakreśl je. Wyrazy są ukryte ${kierunki}.`,
        tresc: tabela(false) + lista,
        rozwiazanie: tabela(true) + lista,
      };
    },
  });
})();
