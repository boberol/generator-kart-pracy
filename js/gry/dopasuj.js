/* Połącz obrazek z wyrazem. */
(function () {
  'use strict';

  KP.zarejestruj({
    id: 'dopasuj',
    nazwa: 'Połącz w pary',
    ikona: '🔗',
    opis: 'Połącz obrazek z pasującym wyrazem.',
    opcje: [
      { id: 'ile', etykieta: 'Liczba par', wybory: [{ value: '4', label: '4 pary' }, { value: '6', label: '6 par' }, { value: '8', label: '8 par' }], domyslnie: '6' },
      { id: 'temat', etykieta: 'Temat', wybory: KP.tematy, domyslnie: 'zwierzeta' },
      { id: 'litery', etykieta: 'Litery', wybory: KP.WIELKOSC, domyslnie: 'wielkie' },
    ],

    generuj(o, R) {
      const ile = parseInt(o.ile, 10) || 6;
      const slowa = R.shuffle(KP.slowaZTematu(o.temat)).slice(0, ile);
      const prawa = R.shuffle(slowa.map((_, i) => i));
      const W = 600, wier = 92, H = ile * wier + 20;
      const y = (i) => 10 + i * wier + wier / 2;
      const xl = 200, xp = 330;
      const najdl = Math.max(...slowa.map((w) => w.slowo.length));
      const fs = najdl > 9 ? 26 : 30;

      let rys = '';
      slowa.forEach((w, i) => {
        rys += `<text x="120" y="${y(i)}" font-size="56" text-anchor="middle" dominant-baseline="central">${w.obrazek}</text>`;
        rys += `<circle cx="${xl}" cy="${y(i)}" r="7"/>`;
      });
      prawa.forEach((idx, j) => {
        rys += `<circle cx="${xp}" cy="${y(j)}" r="7"/>`;
        rys += `<text x="${xp + 24}" y="${y(j)}" font-size="${fs}" font-weight="700" dominant-baseline="central">${KP.esc(KP.litery(slowa[idx].slowo, o.litery))}</text>`;
      });
      const linie = prawa.map((idx, j) => `<line x1="${xl}" y1="${y(idx)}" x2="${xp}" y2="${y(j)}" stroke="#e4572e" stroke-width="4" stroke-linecap="round"/>`).join('');
      const svg = (extra) => `<svg class="rys dopasuj" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${extra || ''}${rys}</svg>`;

      return {
        tytul: 'Połącz w pary',
        polecenie: 'Przeczytaj wyrazy. Połącz linią każdy obrazek z pasującym do niego wyrazem.',
        tresc: svg(),
        rozwiazanie: svg(linie),
      };
    },
  });
})();
