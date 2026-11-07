/* Testy generatorów kart (bez przeglądarki): node --test */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { zaladuj, skryptyZIndex, KORZEN } = require('./zaladuj');

const KP = zaladuj();
// Obiekty z piaskownicy mają inne prototypy – porównujemy kopie JSON.
const czyste = (x) => JSON.parse(JSON.stringify(x));
const domyslne = (g) => Object.fromEntries(g.opcje.map((op) => [op.id, op.domyslnie]));

test('wszystkie skrypty z index.html istnieją', () => {
  skryptyZIndex().forEach((s) => assert.ok(fs.existsSync(path.join(KORZEN, s)), s));
});

test('rejestr zawiera wszystkie karty i każda jest w menu', () => {
  const app = fs.readFileSync(path.join(KORZEN, 'js/app.js'), 'utf8');
  const ids = KP.gry.map((g) => g.id);
  assert.equal(new Set(ids).size, ids.length, 'identyfikatory kart są unikalne');
  assert.ok(ids.length >= 14);
  ids.forEach((id) => assert.match(app, new RegExp(`'${id}'`), `karta ${id} jest w GRUPY w app.js`));
});

test('opcje kart mają poprawną budowę', () => {
  KP.gry.forEach((g) => {
    assert.ok(g.nazwa && g.opis && g.ikona, g.id);
    const idOpcji = new Set();
    g.opcje.forEach((op) => {
      assert.ok(!idOpcji.has(op.id), `${g.id}.${op.id} powtórzone`);
      idOpcji.add(op.id);
      assert.ok(op.etykieta, `${g.id}.${op.id} ma etykietę`);
      if (!op.typ) assert.ok(op.wybory.some((w) => w.value === op.domyslnie), `${g.id}.${op.id}: domyślna wartość jest na liście`);
      if (op.typ === 'kolor') assert.match(op.domyslnie, /^#[0-9a-f]{6}$/i, `${g.id}.${op.id}`);
      if (op.gdy) Object.keys(op.gdy).forEach((k) => assert.ok(g.opcje.some((o) => o.id === k), `${g.id}.${op.id}: gdy → ${k}`));
    });
  });
});

test('losowanie jest powtarzalne (ten sam numer = ta sama karta)', () => {
  const a = KP.losowanie(123), b = KP.losowanie(123), c = KP.losowanie(124);
  const sa = Array.from({ length: 20 }, () => a.next());
  assert.deepEqual(sa, Array.from({ length: 20 }, () => b.next()));
  assert.notDeepEqual(sa, Array.from({ length: 20 }, () => c.next()));
  sa.forEach((x) => assert.ok(x >= 0 && x < 1));
  KP.gry.forEach((g) => {
    const [x] = KP.utworzKarty(g, domyslne(g), 777, 1);
    const [y] = KP.utworzKarty(g, domyslne(g), 777, 1);
    assert.equal(x.wynik.tresc, y.wynik.tresc, g.id);
  });
});

test('każda karta generuje się dla każdej wartości każdej opcji', () => {
  let ile = 0;
  KP.gry.forEach((g) => {
    const baza = domyslne(g);
    const warianty = [baza];
    g.opcje.forEach((op) => {
      if (op.wybory) op.wybory.forEach((w) => {
        const o = Object.assign({}, baza, { [op.id]: w.value });
        // Opcje zależne (gdy) – ustaw też warunek, żeby opcja była aktywna.
        if (op.gdy) Object.assign(o, op.gdy);
        warianty.push(o);
      });
    });
    warianty.forEach((o) => {
      [1, 42, 99999].forEach((nr) => {
        const [k] = KP.utworzKarty(g, o, nr, 1);
        const w = k.wynik;
        assert.equal(typeof w.tresc, 'string', `${g.id} ${JSON.stringify(o)}`);
        assert.ok(w.tresc.length > 20, `${g.id}: pusta treść dla ${JSON.stringify(o)}`);
        assert.doesNotMatch(w.tresc, /undefined|NaN/, `${g.id}: undefined/NaN w treści dla ${JSON.stringify(o)} nr ${nr}`);
        if (w.rozwiazanie) assert.doesNotMatch(w.rozwiazanie, /undefined|NaN/, `${g.id}: rozwiązanie`);
        ile++;
      });
    });
  });
  assert.ok(ile > 500, `sprawdzono ${ile} wariantów`);
});

test('własny tekst jest bezpiecznie wstawiany (bez wstrzykiwania HTML)', () => {
  const zly = '<img src=x onerror=alert(1)>';
  KP.gry.forEach((g) => {
    const o = domyslne(g);
    g.opcje.filter((op) => op.typ === 'tekst' || op.typ === 'linia').forEach((op) => { o[op.id] = zly; if (op.gdy) Object.assign(o, op.gdy); });
    const [k] = KP.utworzKarty(g, o, 5, 1);
    assert.ok(!k.wynik.tresc.includes('<img'), `${g.id} wstawił surowy HTML`);
  });
});

test('kilka kart naraz to różne karty z kolejnymi numerami', () => {
  const g = KP.gry.find((x) => x.id === 'labirynt');
  const karty = KP.utworzKarty(g, domyslne(g), 1000, 4);
  assert.deepEqual(czyste(karty.map((k) => k.nr)), [1000, 1001, 1002, 1003]);
  assert.equal(new Set(karty.map((k) => k.wynik.tresc)).size, 4);
});

test('generowanie jest szybkie (< 40 ms na kartę)', () => {
  KP.gry.forEach((g) => {
    const o = domyslne(g);
    KP.utworzKarty(g, o, 1, 1); // rozgrzewka
    const t0 = process.hrtime.bigint();
    KP.utworzKarty(g, o, 2, 5);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 5;
    assert.ok(ms < 40, `${g.id}: ${ms.toFixed(1)} ms`);
  });
});

test('dyktando graficzne: każdy obrazek jest zamknięty i ma poprawne ruchy', () => {
  Object.entries(KP.kratkaObrazki).forEach(([k, ob]) => {
    const pts = KP.ruchyNaPunkty(ob.ruchy);
    assert.deepEqual(czyste(pts[pts.length - 1]), [0, 0], `${k} wraca do startu`);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    assert.ok(Math.max(...xs) - Math.min(...xs) <= 17 && Math.max(...ys) - Math.min(...ys) <= 16, `${k} mieści się w dużej kratce`);
  });
  assert.throws(() => KP.ruchyNaPunkty('2x'));
  [1, 2, 3].forEach((p) => assert.ok(Object.values(KP.kratkaObrazki).some((o) => o.poziom === p), `obrazki na poziomie ${p}`));
});

test('szlaczki w kratce: wzory kończą okres na linii bazowej', () => {
  Object.entries(KP.kratkaSzlaczki).forEach(([k, w]) => {
    if (w.pola) return w.pola.forEach(([x, y]) => assert.ok(x < w.p && y < w.h, k));
    const ost = w.pkt[w.pkt.length - 1];
    if (!w.osobno) assert.deepEqual(czyste(ost), [w.p, 0], `${k} kończy się w (p, 0)`);
    w.pkt.forEach(([x, y]) => assert.ok(y >= 0 && y <= w.h, `${k} mieści się w wysokości`));
  });
});

test('Literki zawierają wszystkie małe litery polskiego alfabetu', () => {
  const alfabet = 'aąbcćdeęfghijklłmnńoóprsśtuwyzźż';
  Array.from(alfabet).forEach((l) => {
    const g = KP.literki[l];
    assert.ok(g, `brak litery ${l}`);
    assert.ok(Array.isArray(g.d) && g.d.length && g.w > 0, `litera ${l}`);
  });
});

test('odmiana liczebników po polsku', () => {
  const f = (n) => KP.odmiana(n, 'strona', 'strony', 'stron');
  assert.equal(f(1), 'strona');
  assert.equal(f(2), 'strony');
  assert.equal(f(4), 'strony');
  assert.equal(f(5), 'stron');
  assert.equal(f(12), 'stron');
  assert.equal(f(22), 'strony');
  assert.equal(f(25), 'stron');
});

test('esc zamienia znaki specjalne HTML', () => {
  assert.equal(KP.esc('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
});

test('service worker zapisuje wszystkie pliki strony', () => {
  const sw = fs.readFileSync(path.join(KORZEN, 'sw.js'), 'utf8');
  skryptyZIndex().forEach((s) => assert.ok(sw.includes(`'./${s}'`), `sw.js nie zna ${s}`));
  fs.readdirSync(path.join(KORZEN, 'fonts')).filter((f) => f.endsWith('.woff2'))
    .forEach((f) => assert.ok(sw.includes(`'./fonts/${f}'`), `sw.js nie zna fonts/${f}`));
  const css = fs.readFileSync(path.join(KORZEN, 'css/style.css'), 'utf8');
  Array.from(css.matchAll(/url\('\.\.\/(fonts\/[^']+)'\)/g)).forEach((m) => assert.ok(fs.existsSync(path.join(KORZEN, m[1])), m[1]));
});
