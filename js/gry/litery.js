/* Uzupełnij brakujące litery. */
(function () {
  'use strict';

  KP.zarejestruj({
    id: 'litery',
    nazwa: 'Brakujące litery',
    ikona: '🔤',
    opis: 'Wpisz litery, których brakuje w wyrazach.',
    opcje: [
      { id: 'poziom', etykieta: 'Poziom trudności', wybory: KP.POZIOMY, domyslnie: 'latwy' },
      { id: 'temat', etykieta: 'Temat', wybory: KP.tematy, domyslnie: 'wszystkie' },
      KP.opcjaWlasne,
      { id: 'litery', etykieta: 'Litery', wybory: KP.WIELKOSC, domyslnie: 'wielkie' },
    ],

    generuj(o, R) {
      const poz = o.poziom || 'latwy';
      const ile = poz === 'latwy' ? 6 : 8;
      const brak = poz === 'trudny' ? 2 : 1;
      const maxDl = poz === 'latwy' ? 5 : 12;
      let kandydaci = KP.slowaZTematu(o.temat, o).filter((w) => w.slowo.length <= maxDl && w.slowo.length > brak + 1);
      if (kandydaci.length < ile) kandydaci = KP.slowaZTematu(o.temat, o).filter((w) => w.slowo.length > brak + 1);
      const wybrane = R.shuffle(kandydaci).slice(0, ile);
      const bank = [];

      const karty = wybrane.map((w) => {
        const lit = Array.from(KP.litery(w.slowo, o.litery));
        const luki = new Set(R.shuffle(lit.map((_, i) => i)).slice(0, brak));
        luki.forEach((i) => bank.push(lit[i]));
        return { obrazek: w.obrazek, lit, luki };
      });

      const siatka = (rozw) => '<div class="karty-liter">' + karty.map((k) =>
        `<div class="karta-litery"><div class="em-duze">${k.obrazek}</div><div class="wyraz">` +
        k.lit.map((l, i) => k.luki.has(i)
          ? `<span class="kratka luka">${rozw ? KP.esc(l) : ''}</span>`
          : `<span class="kratka">${KP.esc(l)}</span>`).join('') +
        '</div></div>').join('') + '</div>';

      const podpowiedz = poz === 'latwy'
        ? '<p class="podpis">Litery do wpisania: ' + R.shuffle(bank).map((l) => `<span class="kratka mala">${KP.esc(l)}</span>`).join(' ') + '</p>'
        : '';

      return {
        tytul: 'Brakujące litery',
        polecenie: brak === 1 ? 'Popatrz na obrazek i wpisz w puste kratki brakującą literę.' : 'Popatrz na obrazek i wpisz w puste kratki brakujące litery.',
        tresc: siatka(false) + podpowiedz,
        rozwiazanie: siatka(true),
      };
    },
  });
})();
