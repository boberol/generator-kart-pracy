/* Rozsypanka literowa: ułóż wyraz z pomieszanych liter. */
(function () {
  'use strict';

  KP.zarejestruj({
    id: 'rozsypanka',
    nazwa: 'Rozsypanka literowa',
    ikona: '🧩',
    opis: 'Ułóż wyraz z pomieszanych liter.',
    opcje: [
      { id: 'poziom', etykieta: 'Poziom trudności', wybory: KP.POZIOMY, domyslnie: 'latwy' },
      { id: 'temat', etykieta: 'Temat', wybory: KP.tematy, domyslnie: 'wszystkie' },
      KP.opcjaWlasne,
      { id: 'litery', etykieta: 'Litery', wybory: KP.WIELKOSC, domyslnie: 'wielkie' },
    ],

    generuj(o, R) {
      const poz = o.poziom || 'latwy';
      const [minDl, maxDl] = poz === 'latwy' ? [3, 4] : poz === 'sredni' ? [4, 6] : [6, 12];
      const ile = poz === 'latwy' ? 6 : 8;
      let kand = KP.slowaZTematu(o.temat, o).filter((w) => w.slowo.length >= minDl && w.slowo.length <= maxDl);
      if (kand.length < ile) kand = KP.slowaZTematu(o.temat, o).filter((w) => w.slowo.length >= 3);
      const wybrane = R.shuffle(kand).slice(0, ile);
      const pokazObrazek = poz !== 'trudny';

      const zadania = wybrane.map((w) => {
        const lit = Array.from(KP.litery(w.slowo, o.litery));
        let mix = lit;
        for (let i = 0; i < 10 && mix.join('') === lit.join(''); i++) mix = R.shuffle(lit);
        return { w, lit, mix };
      });

      const lista = (rozw) => '<div class="rozsypanka">' + zadania.map((z) =>
        '<div class="wiersz-rozs">' +
        (pokazObrazek ? `<div class="em-sredni">${z.w.obrazek}</div>` : '') +
        `<div class="mix">${z.mix.map((l) => `<span class="kafelek">${KP.esc(l)}</span>`).join('')}</div>` +
        `<div class="wyraz">${z.lit.map((l) => `<span class="kratka luka">${rozw ? KP.esc(l) : ''}</span>`).join('')}</div>` +
        '</div>').join('') + '</div>';

      return {
        tytul: 'Rozsypanka literowa',
        polecenie: pokazObrazek
          ? 'Litery się pomieszały! Ułóż z nich wyraz pasujący do obrazka i wpisz go w kratki.'
          : 'Litery się pomieszały! Ułóż z nich wyrazy i wpisz je w kratki.',
        tresc: lista(false),
        rozwiazanie: lista(true),
      };
    },
  });
})();
