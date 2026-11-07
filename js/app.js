/* Interfejs generatora: wybór karty, ustawienia, podgląd, druk. */
(function () {
  'use strict';

  const GRUPY = [
    { id: 'pisanie', nazwa: 'Pisanie i grafomotoryka', gry: ['pisanie', 'szlaczki', 'kratka', 'sciezki', 'papier', 'kropki', 'labirynt', 'przerysuj'] },
    { id: 'slowa', nazwa: 'Litery i słowa', gry: ['litery', 'rozsypanka', 'wykreslanka', 'dopasuj'] },
    { id: 'liczby', nazwa: 'Liczby i logika', gry: ['matematyka', 'sudoku'] },
  ];
  const ILE_KART = [1, 2, 3, 4, 5, 6, 8, 10];
  const ZOOMY = [0.35, 0.5, 0.65, 0.8, 1, 1.25, 1.5];
  const KLUCZ_PAMIECI = 'kp-ustawienia-v1';

  const $ = (s) => document.querySelector(s);
  const stan = { gra: 'pisanie', opcje: {}, nr: 0, rozwiazanie: true, naglowek: '', cb: false, ile: 1, zoom: 'fit' };
  let pamiec = {}; // opcje zapamiętane osobno dla każdej gry

  const gra = (id) => KP.gry.find((g) => g.id === id);
  const nowyNumer = () => Math.floor(Math.random() * 900000) + 100000;
  const czyKolor = (op) => op.typ === 'kolor';

  function domyslneOpcje(g) {
    const o = {};
    g.opcje.forEach((op) => { o[op.id] = op.domyslnie; });
    return o;
  }

  // Przyjmuje tylko poprawne wartości (np. z linku albo starej wersji strony).
  function poprawOpcje(g, zrodlo) {
    const o = domyslneOpcje(g);
    if (!zrodlo) return o;
    g.opcje.forEach((op) => {
      if (!(op.id in zrodlo)) return;
      const v = String(zrodlo[op.id]);
      if (op.typ === 'kolor') { if (/^#[0-9a-f]{6}$/i.test(v)) o[op.id] = v; }
      else if (op.typ) o[op.id] = v.slice(0, 600);
      else if (op.wybory.some((w) => w.value === v)) o[op.id] = v;
    });
    return o;
  }

  /* ---------- Pamięć przeglądarki ---------- */
  function wczytajPamiec() {
    try { return JSON.parse(localStorage.getItem(KLUCZ_PAMIECI)) || null; } catch (e) { return null; }
  }
  let czasZapisu;
  function zapiszPamiec() {
    clearTimeout(czasZapisu);
    czasZapisu = setTimeout(() => {
      pamiec[stan.gra] = { ...stan.opcje };
      try {
        localStorage.setItem(KLUCZ_PAMIECI, JSON.stringify({
          gra: stan.gra, pamiec, naglowek: stan.naglowek, cb: stan.cb, rozwiazanie: stan.rozwiazanie, ile: stan.ile, zoom: stan.zoom,
        }));
      } catch (e) { /* tryb prywatny – trudno */ }
    }, 400);
  }

  /* ---------- Adres strony ---------- */
  function czytajAdres() {
    const p = new URLSearchParams(location.hash.slice(1));
    if (!p.has('gra')) return false;
    const g = gra(p.get('gra')) || gra('pisanie');
    stan.gra = g.id;
    stan.opcje = poprawOpcje(g, Object.fromEntries(p.entries()));
    stan.nr = parseInt(p.get('nr'), 10) || nowyNumer();
    stan.rozwiazanie = p.get('rozw') !== '0';
    stan.naglowek = (p.get('naglowek') || '').slice(0, 80);
    stan.cb = p.get('cb') === '1';
    const ile = parseInt(p.get('ile'), 10);
    stan.ile = ILE_KART.includes(ile) ? ile : 1;
    return true;
  }

  function adres() {
    const p = new URLSearchParams();
    p.set('gra', stan.gra);
    const g = gra(stan.gra);
    const dom = domyslneOpcje(g);
    // Krótszy link: tylko ustawienia inne niż domyślne.
    Object.entries(stan.opcje).forEach(([k, v]) => { if (v !== dom[k]) p.set(k, v); });
    p.set('nr', stan.nr);
    if (stan.ile > 1) p.set('ile', stan.ile);
    if (!stan.rozwiazanie) p.set('rozw', '0');
    if (stan.naglowek) p.set('naglowek', stan.naglowek);
    if (stan.cb) p.set('cb', '1');
    return '#' + p.toString();
  }
  let ostatniAdres = '';
  function zapiszAdres() {
    ostatniAdres = adres();
    history.replaceState(null, '', ostatniAdres);
  }

  /* ---------- Lista kart ---------- */
  function rysujListeGier() {
    $('#lista-gier').innerHTML = GRUPY.map((gr) => `
      <section class="grupa" data-grupa="${gr.id}">
        <h3 class="grupa-tytul">${gr.nazwa}</h3>
        <ul class="kafle" role="list">${gr.gry.map(gra).filter(Boolean).map((g) => `
          <li><button type="button" class="kafel" data-gra="${g.id}" aria-pressed="false" data-szukaj="${KP.esc((g.nazwa + ' ' + g.opis).toLocaleLowerCase('pl'))}">
            <span class="kafel-ikona">${KP.ikona(g.id) || `<span aria-hidden="true">${g.ikona}</span>`}</span>
            <span class="kafel-tekst"><span class="kafel-nazwa">${g.nazwa}</span><span class="kafel-opis">${g.opis}</span></span>
          </button></li>`).join('')}
        </ul>
      </section>`).join('');
    oznaczWybrana();
  }

  function oznaczWybrana() {
    document.querySelectorAll('.kafel').forEach((k) => k.setAttribute('aria-pressed', String(k.dataset.gra === stan.gra)));
    const g = gra(stan.gra);
    $('#katalog-wybor').innerHTML = `${KP.ikona(g.id)}<span>${KP.esc(g.nazwa)}</span>`;
  }

  function wybierzGre(id) {
    if (id === stan.gra) { zamknijKatalog(); return; }
    pamiec[stan.gra] = { ...stan.opcje };
    stan.gra = id;
    stan.opcje = poprawOpcje(gra(id), pamiec[id]);
    stan.nr = nowyNumer();
    oznaczWybrana();
    rysujOpcje();
    zaplanuj();
    zamknijKatalog();
    if (matchMedia('(max-width: 1023px)').matches) $('#ustawienia').scrollIntoView({ behavior: bezRuchu() ? 'auto' : 'smooth', block: 'start' });
  }

  function filtruj(fraza) {
    const f = fraza.trim().toLocaleLowerCase('pl');
    let widoczne = 0;
    document.querySelectorAll('.grupa').forEach((gr) => {
      let wGrupie = 0;
      gr.querySelectorAll('.kafel').forEach((k) => {
        const ok = !f || k.dataset.szukaj.includes(f);
        k.parentElement.hidden = !ok;
        if (ok) wGrupie++;
      });
      gr.hidden = !wGrupie;
      widoczne += wGrupie;
    });
    $('#brak-wynikow').hidden = widoczne > 0;
  }

  function zamknijKatalog() {
    $('#katalog').classList.remove('otwarty');
    $('#katalog-przelacznik').setAttribute('aria-expanded', 'false');
  }

  /* ---------- Ustawienia ---------- */
  function widoczna(op) {
    return !op.gdy || Object.entries(op.gdy).every(([k, v]) => stan.opcje[k] === v);
  }

  function pole(op) {
    const wart = KP.esc(stan.opcje[op.id] == null ? '' : stan.opcje[op.id]);
    const ukryj = widoczna(op) ? '' : ' hidden';
    const id = `op-${op.id}`;
    if (op.typ === 'tekst') {
      return `<label class="pole szerokie" data-pole="${op.id}"${ukryj}><span class="etykieta">${op.etykieta}</span><textarea id="${id}" data-op="${op.id}" rows="3" maxlength="600" spellcheck="false">${wart}</textarea></label>`;
    }
    if (op.typ === 'linia') {
      return `<label class="pole szerokie" data-pole="${op.id}"${ukryj}><span class="etykieta">${op.etykieta}</span><input id="${id}" type="text" data-op="${op.id}" maxlength="80" value="${wart}" autocomplete="off" spellcheck="false"></label>`;
    }
    if (op.typ === 'kolor') {
      return `<label class="pole pole-kolor" data-pole="${op.id}"${ukryj}><input id="${id}" type="color" data-op="${op.id}" value="${wart}"><span class="etykieta">${op.etykieta}</span></label>`;
    }
    return `<label class="pole" data-pole="${op.id}"${ukryj}><span class="etykieta">${op.etykieta}</span><select id="${id}" data-op="${op.id}">${op.wybory.map((w) =>
      `<option value="${KP.esc(w.value)}"${w.value === stan.opcje[op.id] ? ' selected' : ''}>${KP.esc(w.label)}</option>`).join('')}</select></label>`;
  }

  function rysujOpcje() {
    const g = gra(stan.gra);
    $('#nazwa-gry').textContent = g.nazwa;
    $('#opis-gry').textContent = g.opis;
    $('#ikona-gry').innerHTML = KP.ikona(g.id) || g.ikona;
    document.title = `${g.nazwa} – generator kart pracy dla dzieci`;
    $('#opcje').innerHTML = g.opcje.filter((op) => !czyKolor(op)).map(pole).join('');
    const kolory = g.opcje.filter(czyKolor);
    $('#opcje-kolory').innerHTML = kolory.map(pole).join('');
    $('#sekcja-kolory').hidden = !kolory.length;
  }

  function odswiezWidocznosc() {
    gra(stan.gra).opcje.forEach((op) => {
      const el = document.querySelector(`[data-pole="${op.id}"]`);
      if (el) el.hidden = !widoczna(op);
    });
  }

  let czasPisania;
  function zmianaOpcji(e) {
    const el = e.target.closest('[data-op]');
    if (!el) return;
    const natychmiast = e.type === 'change' || el.tagName === 'SELECT';
    const zastosuj = () => {
      stan.opcje[el.dataset.op] = el.value;
      odswiezWidocznosc();
      zaplanuj();
    };
    clearTimeout(czasPisania);
    if (natychmiast) zastosuj();
    else czasPisania = setTimeout(zastosuj, el.type === 'color' ? 60 : 250);
  }

  /* ---------- Generowanie i podgląd ---------- */
  function strona(wynik, g, nr, czyRozw) {
    const tytul = czyRozw ? `Rozwiązanie: ${wynik.tytul}` : wynik.tytul;
    const glowa = czyRozw
      ? '<div class="karta-glowa"><span>Dla nauczyciela / rodzica</span></div>'
      : wynik.bezImienia ? '' : '<div class="karta-glowa"><span>Imię: <i class="linia-pisania"></i></span><span>Data: <i class="linia-pisania krotka"></i></span></div>';
    const ikona = wynik.bezIkony ? '' : `<span aria-hidden="true">${g.ikona}</span> `;
    return `<article class="strona${czyRozw ? ' strona-rozw' : ''}${stan.cb ? ' czarno-biala' : ''}">
      ${glowa}
      ${stan.naglowek ? `<p class="karta-naglowek">${KP.esc(stan.naglowek)}</p>` : ''}
      ${tytul ? `<h2 class="karta-tytul">${ikona}${KP.esc(tytul)}</h2>` : ''}
      ${wynik.polecenie ? `<p class="karta-polecenie">${KP.esc(wynik.polecenie)}</p>` : ''}
      <div class="karta-tresc">${czyRozw ? wynik.rozwiazanie : wynik.tresc}</div>
      <footer class="karta-stopka">Karta nr ${nr} · ${KP.esc(g.nazwa)}</footer>
    </article>`;
  }

  let zaplanowane = false;
  function zaplanuj() {
    if (zaplanowane) return;
    zaplanowane = true;
    requestAnimationFrame(() => { zaplanowane = false; generuj(); });
  }

  let pokolenie = 0;
  function generuj() {
    const g = gra(stan.gra);
    const podglad = $('#podglad');
    const t0 = performance.now();
    let karty;
    try {
      karty = KP.utworzKarty(g, stan.opcje, stan.nr, stan.ile);
    } catch (e) {
      console.error(e);
      podglad.innerHTML = '<div class="blad" role="alert"><b>Nie udało się utworzyć karty.</b><p>Zmień ustawienia albo kliknij „Losuj nową”.</p></div>';
      return;
    }
    const maRozw = karty.some((k) => k.wynik.rozwiazanie);
    let html = karty.map((k) => strona(k.wynik, g, k.nr, false)).join('');
    if (stan.rozwiazanie && maRozw) html += karty.filter((k) => k.wynik.rozwiazanie).map((k) => strona(k.wynik, g, k.nr, true)).join('');
    podglad.innerHTML = html;

    // Dodatkowe układanie (np. tekst po wczytaniu czcionek) – każda funkcja raz.
    const po = Array.from(new Set(karty.map((k) => k.wynik.po).filter(Boolean)));
    const moje = ++pokolenie;
    po.forEach((f) => f(podglad));
    if (po.length && document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(() => { if (moje === pokolenie) po.forEach((f) => f(podglad)); });
    }

    $('#nr-karty').value = stan.nr;
    $('#pole-rozw').hidden = !maRozw;
    const stron = podglad.children.length;
    $('#licznik').textContent = `${stron} ${KP.odmiana(stron, 'strona', 'strony', 'stron')} A4`;
    KP.ostatniCzas = performance.now() - t0;
    ustawZoom();
    zapiszAdres();
    zapiszPamiec();
  }

  /* ---------- Powiększenie ---------- */
  const SZER_A4 = 793.7; // 210 mm przy 96 dpi
  function skalaDopasowana() {
    const obszar = $('#obszar-podgladu');
    const styl = getComputedStyle(obszar);
    const wolne = obszar.clientWidth - parseFloat(styl.paddingLeft) - parseFloat(styl.paddingRight);
    return Math.max(0.2, Math.min(1, wolne / SZER_A4));
  }
  function ustawZoom() {
    const s = stan.zoom === 'fit' ? skalaDopasowana() : stan.zoom;
    $('#podglad').style.setProperty('--skala', s.toFixed(3));
    const przycisk = $('#dopasuj');
    przycisk.textContent = `${Math.round(s * 100)}%`;
    przycisk.setAttribute('aria-label', stan.zoom === 'fit' ? `Powiększenie ${Math.round(s * 100)}%, dopasowane do szerokości` : `Powiększenie ${Math.round(s * 100)}%. Kliknij, aby dopasować do szerokości`);
    przycisk.classList.toggle('aktywny', stan.zoom === 'fit');
  }
  function zmienZoom(kierunek) {
    const teraz = stan.zoom === 'fit' ? skalaDopasowana() : stan.zoom;
    const lista = kierunek > 0 ? ZOOMY.filter((z) => z > teraz + 0.01) : ZOOMY.filter((z) => z < teraz - 0.01).reverse();
    if (lista.length) stan.zoom = lista[0];
    ustawZoom();
    zapiszPamiec();
  }

  /* ---------- Akcje ---------- */
  let czasToastu;
  function toast(tekst) {
    const t = $('#toast');
    t.innerHTML = KP.ikona('ok') + `<span>${KP.esc(tekst)}</span>`;
    t.classList.add('widoczny');
    clearTimeout(czasToastu);
    czasToastu = setTimeout(() => t.classList.remove('widoczny'), 2600);
  }

  function losuj() {
    stan.nr = nowyNumer();
    zaplanuj();
  }

  async function drukuj() {
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) { /* drukujemy mimo to */ } }
    window.print();
  }

  async function kopiujLink() {
    const url = location.href.split('#')[0] + adres();
    try {
      await navigator.clipboard.writeText(url);
      toast('Link do tej karty skopiowany');
    } catch (e) {
      window.prompt('Skopiuj link do karty:', url);
    }
  }

  function resetKolory() {
    gra(stan.gra).opcje.filter(czyKolor).forEach((op) => { stan.opcje[op.id] = op.domyslnie; });
    rysujOpcje();
    zaplanuj();
    toast('Przywrócono domyślne kolory');
  }

  function resetWszystko() {
    stan.opcje = domyslneOpcje(gra(stan.gra));
    stan.naglowek = '';
    stan.cb = false;
    stan.rozwiazanie = true;
    stan.ile = 1;
    synchronizujWspolne();
    rysujOpcje();
    zaplanuj();
    toast('Przywrócono ustawienia domyślne');
  }

  function synchronizujWspolne() {
    $('#rozw').checked = stan.rozwiazanie;
    $('#naglowek').value = stan.naglowek;
    $('#cb').checked = stan.cb;
    $('#ile-kart').value = String(stan.ile);
  }

  const bezRuchu = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wPolu = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

  function start() {
    KP.wstawIkony();
    const zapisane = wczytajPamiec();
    if (zapisane) {
      pamiec = zapisane.pamiec || {};
      stan.naglowek = String(zapisane.naglowek || '').slice(0, 80);
      stan.cb = !!zapisane.cb;
      stan.rozwiazanie = zapisane.rozwiazanie !== false;
      stan.ile = ILE_KART.includes(zapisane.ile) ? zapisane.ile : 1;
      stan.zoom = typeof zapisane.zoom === 'number' && ZOOMY.includes(zapisane.zoom) ? zapisane.zoom : 'fit';
    }
    if (!czytajAdres()) {
      const g = gra(zapisane && zapisane.gra) || gra('pisanie');
      stan.gra = g.id;
      stan.opcje = poprawOpcje(g, pamiec[g.id]);
      stan.nr = nowyNumer();
    }
    rysujListeGier();
    rysujOpcje();
    synchronizujWspolne();

    $('#lista-gier').addEventListener('click', (e) => { const b = e.target.closest('.kafel'); if (b) wybierzGre(b.dataset.gra); });
    $('#szukaj').addEventListener('input', (e) => filtruj(e.target.value));
    $('#szukaj').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); const k = document.querySelector('.kafle li:not([hidden]) .kafel'); if (k) wybierzGre(k.dataset.gra); }
      if (e.key === 'Escape') { e.target.value = ''; filtruj(''); }
    });
    $('#katalog-przelacznik').addEventListener('click', () => {
      const otwarty = $('#katalog').classList.toggle('otwarty');
      $('#katalog-przelacznik').setAttribute('aria-expanded', String(otwarty));
    });

    const form = $('#formularz');
    form.addEventListener('submit', (e) => e.preventDefault());
    $('#opcje').addEventListener('input', zmianaOpcji);
    $('#opcje').addEventListener('change', zmianaOpcji);
    $('#opcje-kolory').addEventListener('input', zmianaOpcji);
    $('#opcje-kolory').addEventListener('change', zmianaOpcji);

    $('#losuj').addEventListener('click', losuj);
    $('#losuj-m').addEventListener('click', losuj);
    $('#drukuj').addEventListener('click', drukuj);
    $('#drukuj-m').addEventListener('click', drukuj);
    $('#kopiuj-link').addEventListener('click', kopiujLink);
    $('#reset-kolory').addEventListener('click', resetKolory);
    $('#reset-wszystko').addEventListener('click', resetWszystko);
    $('#pomoc').addEventListener('click', () => $('#okno-pomocy').showModal());
    $('#okno-pomocy').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

    $('#rozw').addEventListener('change', (e) => { stan.rozwiazanie = e.target.checked; zaplanuj(); });
    $('#cb').addEventListener('change', (e) => { stan.cb = e.target.checked; zaplanuj(); });
    $('#ile-kart').addEventListener('change', (e) => { stan.ile = parseInt(e.target.value, 10) || 1; zaplanuj(); });
    let t;
    $('#naglowek').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { stan.naglowek = e.target.value.trim(); zaplanuj(); }, 250); });
    $('#nr-karty').addEventListener('change', (e) => {
      const n = parseInt(e.target.value, 10);
      if (n > 0) { stan.nr = Math.min(n, 999999999); zaplanuj(); } else e.target.value = stan.nr;
    });

    $('#pomniejsz').addEventListener('click', () => zmienZoom(-1));
    $('#powieksz').addEventListener('click', () => zmienZoom(1));
    $('#dopasuj').addEventListener('click', () => { stan.zoom = 'fit'; ustawZoom(); zapiszPamiec(); });
    if (window.ResizeObserver) new ResizeObserver(() => { if (stan.zoom === 'fit') ustawZoom(); }).observe($('#obszar-podgladu'));
    else window.addEventListener('resize', ustawZoom);

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || wPolu(e.target) || $('#okno-pomocy').open) return;
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); losuj(); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); zmienZoom(1); }
      else if (e.key === '-' || e.key === '−') { e.preventDefault(); zmienZoom(-1); }
      else if (e.key === '0') { e.preventDefault(); stan.zoom = 'fit'; ustawZoom(); }
    });

    window.addEventListener('hashchange', () => {
      if (location.hash === ostatniAdres) return;
      if (!czytajAdres()) return;
      oznaczWybrana();
      rysujOpcje();
      synchronizujWspolne();
      generuj();
    });

    generuj();
    document.documentElement.classList.add('gotowe');

    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/^(localhost|127\.)/.test(location.hostname)) {
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
  }

  KP.app = { stan, generuj, adres };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
