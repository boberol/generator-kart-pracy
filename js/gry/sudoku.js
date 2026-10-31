/* Sudoku obrazkowe lub liczbowe 4×4 i 6×6. */
(function () {
  'use strict';

  const OBRAZKI = ['🍎', '🐱', '⭐', '🚗', '🌸', '⚽'];

  function rozwiazanie(N, bw, bh, R) {
    // Wzorzec bazowy, potem tasowanie cyfr, wierszy w pasach i pasów.
    const wzor = (r, c) => (bw * (r % bh) + Math.floor(r / bh) + c) % N;
    const cyfry = R.shuffle([...Array(N).keys()]);
    const pasyW = R.shuffle([...Array(N / bh).keys()]);
    const wiersze = pasyW.flatMap((p) => R.shuffle([...Array(bh).keys()]).map((r) => p * bh + r));
    const pasyK = R.shuffle([...Array(N / bw).keys()]);
    const kolumny = pasyK.flatMap((p) => R.shuffle([...Array(bw).keys()]).map((c) => p * bw + c));
    return wiersze.map((r) => kolumny.map((c) => cyfry[wzor(r, c)]));
  }

  function ileRozwiazan(g, N, bw, bh, limit) {
    let licz = 0;
    const ok = (r, c, v) => {
      for (let i = 0; i < N; i++) if (g[r][i] === v || g[i][c] === v) return false;
      const r0 = r - (r % bh), c0 = c - (c % bw);
      for (let i = 0; i < bh; i++) for (let j = 0; j < bw; j++) if (g[r0 + i][c0 + j] === v) return false;
      return true;
    };
    (function szukaj() {
      if (licz >= limit) return;
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (g[r][c] !== null) continue;
        for (let v = 0; v < N; v++) if (ok(r, c, v)) { g[r][c] = v; szukaj(); g[r][c] = null; }
        return;
      }
      licz++;
    })();
    return licz;
  }

  KP.zarejestruj({
    id: 'sudoku',
    nazwa: 'Sudoku',
    ikona: '🟦',
    opis: 'Sudoku z obrazkami albo liczbami.',
    opcje: [
      { id: 'rozmiar', etykieta: 'Rozmiar', wybory: [{ value: '4', label: '4 × 4 (łatwe)' }, { value: '6', label: '6 × 6 (trudniejsze)' }], domyslnie: '4' },
      { id: 'znaki', etykieta: 'Wypełniamy', wybory: [{ value: 'obrazki', label: 'Obrazkami' }, { value: 'liczby', label: 'Liczbami' }], domyslnie: 'obrazki' },
      { id: 'ile', etykieta: 'Liczba plansz', wybory: [{ value: '1', label: '1' }, { value: '2', label: '2' }], domyslnie: '2' },
    ],

    generuj(o, R) {
      const N = parseInt(o.rozmiar, 10) === 6 ? 6 : 4;
      const [bw, bh] = N === 6 ? [3, 2] : [2, 2];
      const znak = (v) => (o.znaki === 'liczby' ? String(v + 1) : OBRAZKI[v]);
      const plansze = [];
      const ile = parseInt(o.ile, 10) || 1;
      for (let p = 0; p < ile; p++) {
        const pelna = rozwiazanie(N, bw, bh, R);
        const g = pelna.map((w) => w.slice());
        // Usuwamy pola, dopóki rozwiązanie pozostaje jednoznaczne.
        const cel = N === 4 ? 9 : 20;
        let usuniete = 0;
        for (const i of R.shuffle([...Array(N * N).keys()])) {
          if (usuniete >= cel) break;
          const r = Math.floor(i / N), c = i % N, v = g[r][c];
          g[r][c] = null;
          if (ileRozwiazan(g.map((w) => w.slice()), N, bw, bh, 2) === 1) usuniete++;
          else g[r][c] = v;
        }
        plansze.push({ pelna, g });
      }
      const tabela = (pl, rozw) => {
        let h = `<table class="sudoku n${N}">`;
        for (let r = 0; r < N; r++) {
          h += '<tr>';
          for (let c = 0; c < N; c++) {
            const kl = [];
            if ((c + 1) % bw === 0 && c < N - 1) kl.push('pg');
            if ((r + 1) % bh === 0 && r < N - 1) kl.push('dg');
            const dane = pl.g[r][c] !== null;
            if (!dane && rozw) kl.push('wpis');
            h += `<td class="${kl.join(' ')}">${dane || rozw ? znak(pl.pelna[r][c]) : ''}</td>`;
          }
          h += '</tr>';
        }
        return h + '</table>';
      };
      const uzyte = [...Array(N).keys()].map((v) => `<span class="znak">${znak(v)}</span>`).join(' ');
      const wszystko = (rozw) => `<p class="podpis">Użyj: ${uzyte}</p><div class="plansze">${plansze.map((pl) => tabela(pl, rozw)).join('')}</div>`;
      const co = o.znaki === 'liczby' ? 'liczby' : 'obrazki';
      return {
        tytul: 'Sudoku',
        polecenie: `Uzupełnij puste pola. W każdym wierszu, w każdej kolumnie i w każdym pogrubionym prostokącie wszystkie ${co} muszą być różne.`,
        tresc: wszystko(false),
        rozwiazanie: wszystko(true),
      };
    },
  });
})();
