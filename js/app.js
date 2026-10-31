/* Interfejs generatora: wybór gry, opcje, podgląd i druk. */
(function () {
  'use strict';

  const GRUPY = [
    { id: 'pisanie', nazwa: 'Pisanie i grafomotoryka', gry: ['pisanie', 'szlaczki', 'sciezki', 'kropki', 'labirynt', 'przerysuj'] },
    { id: 'slowa', nazwa: 'Litery i słowa', gry: ['litery', 'rozsypanka', 'wykreslanka', 'dopasuj'] },
    { id: 'liczby', nazwa: 'Liczby i logika', gry: ['matematyka', 'sudoku'] },
  ];

  const $ = (s) => document.querySelector(s);
  const stan = { gra: null, opcje: {}, nr: 0, rozwiazanie: true, naglowek: '' };
  const pamiec = {}; // opcje zapamiętane osobno dla każdej gry

  const gra = (id) => KP.gry.find((g) => g.id === id);
  const nowyNumer = () => Math.floor(Math.random() * 900000) + 100000;

  function domyslneOpcje(g) {
    const o = {};
    g.opcje.forEach((op) => { o[op.id] = op.domyslnie; });
    return o;
  }

  function czytajAdres() {
    const p = new URLSearchParams(location.hash.slice(1));
    const g = gra(p.get('gra')) || gra('pisanie');
    stan.gra = g.id;
    stan.opcje = domyslneOpcje(g);
    g.opcje.forEach((op) => {
      if (!p.has(op.id)) return;
      const v = p.get(op.id);
      if (op.typ === 'tekst' || op.wybory.some((w) => w.value === v)) stan.opcje[op.id] = v;
    });
    stan.nr = parseInt(p.get('nr'), 10) || nowyNumer();
    stan.rozwiazanie = p.get('rozw') !== '0';
    stan.naglowek = p.get('naglowek') || '';
  }

  function zapiszAdres() {
    const p = new URLSearchParams();
    p.set('gra', stan.gra);
    Object.entries(stan.opcje).forEach(([k, v]) => p.set(k, v));
    p.set('nr', stan.nr);
    if (!stan.rozwiazanie) p.set('rozw', '0');
    if (stan.naglowek) p.set('naglowek', stan.naglowek);
    history.replaceState(null, '', '#' + p.toString());
  }

  function rysujListeGier() {
    const nav = $('#lista-gier');
    nav.innerHTML = GRUPY.map((gr) => `
      <div class="grupa">
        <h3>${gr.nazwa}</h3>
        <div class="kafle">${gr.gry.map(gra).filter(Boolean).map((g) => `
          <button type="button" class="kafel" data-gra="${g.id}" aria-pressed="${g.id === stan.gra}">
            <span class="kafel-ikona" aria-hidden="true">${g.ikona}</span>
            <span class="kafel-nazwa">${g.nazwa}</span>
            <span class="kafel-opis">${g.opis}</span>
          </button>`).join('')}
        </div>
      </div>`).join('');
    nav.querySelectorAll('.kafel').forEach((b) => b.addEventListener('click', () => {
      pamiec[stan.gra] = { ...stan.opcje };
      stan.gra = b.dataset.gra;
      stan.opcje = pamiec[stan.gra] || domyslneOpcje(gra(stan.gra));
      stan.nr = nowyNumer();
      nav.querySelectorAll('.kafel').forEach((k) => k.setAttribute('aria-pressed', k === b));
      rysujOpcje();
      generuj();
      if (window.matchMedia('(max-width: 900px)').matches) $('#ustawienia').scrollIntoView({ behavior: 'smooth' });
    }));
  }

  function widoczna(op) {
    return !op.gdy || Object.entries(op.gdy).every(([k, v]) => stan.opcje[k] === v);
  }

  function rysujOpcje() {
    const g = gra(stan.gra);
    $('#nazwa-gry').textContent = `${g.ikona} ${g.nazwa}`;
    const box = $('#opcje');
    box.innerHTML = g.opcje.map((op) => {
      const ukryj = widoczna(op) ? '' : ' hidden';
      if (op.typ === 'tekst') {
        return `<label class="pole-opcji"${ukryj}><span>${op.etykieta}</span><textarea data-op="${op.id}" rows="4" maxlength="400">${KP.esc(stan.opcje[op.id] || '')}</textarea></label>`;
      }
      return `<label class="pole-opcji"${ukryj}><span>${op.etykieta}</span><select data-op="${op.id}">${op.wybory.map((w) =>
        `<option value="${KP.esc(w.value)}"${w.value === stan.opcje[op.id] ? ' selected' : ''}>${KP.esc(w.label)}</option>`).join('')}</select></label>`;
    }).join('');
    let czasomierz;
    box.querySelectorAll('[data-op]').forEach((el) => {
      const zmiana = () => {
        stan.opcje[el.dataset.op] = el.value;
        g.opcje.forEach((op) => {
          const pole = box.querySelector(`[data-op="${op.id}"]`).closest('.pole-opcji');
          pole.hidden = !widoczna(op);
        });
        generuj();
      };
      if (el.tagName === 'TEXTAREA') el.addEventListener('input', () => { clearTimeout(czasomierz); czasomierz = setTimeout(zmiana, 350); });
      else el.addEventListener('change', zmiana);
    });
  }

  function strona(wynik, g, czyRozw) {
    const tytul = czyRozw ? `Rozwiązanie: ${wynik.tytul}` : wynik.tytul;
    const glowa = czyRozw
      ? '<div class="karta-glowa"><span>Dla nauczyciela / rodzica</span></div>'
      : `<div class="karta-glowa"><span>Imię: <i class="linia-pisania"></i></span><span>Data: <i class="linia-pisania krotka"></i></span></div>`;
    return `<article class="strona${czyRozw ? ' strona-rozw' : ''}">
      ${glowa}
      ${stan.naglowek ? `<p class="karta-naglowek">${KP.esc(stan.naglowek)}</p>` : ''}
      <h2 class="karta-tytul"><span aria-hidden="true">${g.ikona}</span> ${KP.esc(tytul)}</h2>
      <p class="karta-polecenie">${KP.esc(wynik.polecenie)}</p>
      <div class="karta-tresc">${czyRozw ? wynik.rozwiazanie : wynik.tresc}</div>
      <footer class="karta-stopka">Karta nr ${stan.nr} · ${KP.esc(g.nazwa)}</footer>
    </article>`;
  }

  let ostatni = null;
  function generuj() {
    const g = gra(stan.gra);
    const R = KP.losowanie(stan.nr ^ KP.hashTekstu(g.id));
    let wynik;
    try {
      wynik = g.generuj(stan.opcje, R);
    } catch (e) {
      console.error(e);
      $('#podglad').innerHTML = '<p class="blad">Ups! Nie udało się utworzyć karty. Spróbuj wylosować nową.</p>';
      return;
    }
    const podglad = $('#podglad');
    podglad.innerHTML = strona(wynik, g, false) + (stan.rozwiazanie && wynik.rozwiazanie ? strona(wynik, g, true) : '');
    $('#nr-karty').value = stan.nr;
    $('#pole-rozw').hidden = !wynik.rozwiazanie;
    ostatni = wynik;
    if (wynik.po) {
      wynik.po(podglad);
      if (document.fonts) document.fonts.ready.then(() => { if (ostatni === wynik) wynik.po(podglad); });
    }
    dopasujPodglad();
    zapiszAdres();
  }

  // Na wąskich ekranach pomniejszamy podgląd kartki A4.
  function dopasujPodglad() {
    const wrap = $('#podglad');
    const obszar = wrap.parentElement;
    const szer = wrap.offsetWidth || 794; // 210 mm przy 96 dpi
    const skala = Math.min(1, obszar.clientWidth / szer);
    wrap.style.setProperty('--skala', skala);
    obszar.style.height = skala < 1 ? `${wrap.offsetHeight * skala}px` : '';
  }

  function start() {
    czytajAdres();
    rysujListeGier();
    rysujOpcje();
    $('#rozw').checked = stan.rozwiazanie;
    $('#naglowek').value = stan.naglowek;

    $('#losuj').addEventListener('click', () => { stan.nr = nowyNumer(); generuj(); });
    $('#drukuj').addEventListener('click', () => window.print());
    $('#rozw').addEventListener('change', (e) => { stan.rozwiazanie = e.target.checked; generuj(); });
    let t;
    $('#naglowek').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { stan.naglowek = e.target.value.trim(); generuj(); }, 300); });
    $('#nr-karty').addEventListener('change', (e) => {
      const n = parseInt(e.target.value, 10);
      if (n > 0) { stan.nr = n; generuj(); }
    });
    window.addEventListener('resize', dopasujPodglad);
    window.addEventListener('hashchange', () => {
      czytajAdres();
      rysujListeGier();
      rysujOpcje();
      $('#rozw').checked = stan.rozwiazanie;
      $('#naglowek').value = stan.naglowek;
      generuj();
    });
    generuj();
  }

  document.addEventListener('DOMContentLoaded', start);
})();
