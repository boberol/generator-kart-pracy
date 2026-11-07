/* Testy w prawdziwej przeglądarce (Playwright + Chromium): node --test */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { KORZEN } = require('./zaladuj');

let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { chromium = null; }

const TYPY = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

function serwer() {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const plik = path.join(KORZEN, p === '/' ? 'index.html' : p);
      if (!plik.startsWith(KORZEN) || !fs.existsSync(plik) || fs.statSync(plik).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': TYPY[path.extname(plik)] || 'application/octet-stream' });
      fs.createReadStream(plik).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok(s));
  });
}

test('interfejs w przeglądarce', { skip: !chromium && 'brak Playwright' }, async (t) => {
  const srv = await serwer();
  const URL0 = `http://127.0.0.1:${srv.address().port}/`;
  const przegladarka = await chromium.launch();
  const kontekst = await przegladarka.newContext({ viewport: { width: 1440, height: 900 } });
  const bledy = [];
  const nowaStrona = async (adres = URL0) => {
    const p = await kontekst.newPage();
    p.on('pageerror', (e) => bledy.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error') bledy.push(m.text()); });
    p.on('requestfailed', (r) => bledy.push('nie wczytano: ' + r.url()));
    await p.goto(adres);
    await p.waitForSelector('.strona');
    return p;
  };

  try {
    await t.test('strona wczytuje się bez błędów i bez zewnętrznych zasobów', async () => {
      const zewn = [];
      const p = await kontekst.newPage();
      p.on('request', (r) => { if (!r.url().startsWith(URL0)) zewn.push(r.url()); });
      p.on('pageerror', (e) => bledy.push(e.message));
      await p.goto(URL0);
      await p.waitForSelector('.strona');
      assert.deepEqual(zewn, [], 'brak zapytań do zewnętrznych serwerów');
      assert.equal(await p.locator('.kafel').count(), await p.evaluate(() => KP.gry.length));
      assert.equal(await p.locator('.kafel[aria-pressed="true"]').count(), 1);
      await p.close();
    });

    await t.test('każdy rodzaj karty da się wybrać i wygenerować', async () => {
      const p = await nowaStrona();
      const ids = await p.$$eval('.kafel', (els) => els.map((e) => e.dataset.gra));
      for (const id of ids) {
        await p.click(`.kafel[data-gra="${id}"]`);
        await p.waitForFunction((g) => location.hash.includes('gra=' + g), id);
        assert.ok(await p.locator('#podglad .strona').count() >= 1, id);
        assert.equal(await p.locator('#podglad .blad').count(), 0, `${id}: błąd generowania`);
        const czas = await p.evaluate(() => KP.ostatniCzas);
        assert.ok(czas < 150, `${id}: generowanie trwało ${czas.toFixed(0)} ms`);
        const nazwa = await p.textContent('#nazwa-gry');
        assert.ok(nazwa.length > 3);
      }
      await p.close();
    });

    await t.test('zmiana opcji od razu zmienia podgląd', async () => {
      const p = await nowaStrona(URL0 + '#gra=szlaczki&nr=10');
      const przed = await p.innerHTML('#podglad');
      await p.selectOption('#op-poziom', 'trudny');
      await p.waitForFunction(() => location.hash.includes('poziom=trudny'));
      assert.notEqual(await p.innerHTML('#podglad'), przed);
      await p.close();
    });

    await t.test('ten sam link daje tę samą kartę', async () => {
      const adres = URL0 + '#gra=labirynt&poziom=sredni&nr=4321';
      const a = await nowaStrona(adres);
      const b = await nowaStrona(adres);
      assert.equal(await a.innerHTML('#podglad'), await b.innerHTML('#podglad'));
      await a.close(); await b.close();
    });

    await t.test('Losuj i klawisz N tworzą nową kartę', async () => {
      const p = await nowaStrona(URL0 + '#gra=labirynt&nr=111');
      await p.click('#losuj');
      await p.waitForFunction(() => !location.hash.includes('nr=111&') && !location.hash.endsWith('nr=111'));
      const nr1 = await p.inputValue('#nr-karty');
      await p.locator('body').click({ position: { x: 1000, y: 500 } });
      await p.keyboard.press('n');
      await p.waitForFunction((n) => document.querySelector('#nr-karty').value !== n, nr1);
      await p.close();
    });

    await t.test('liczba kart i strony z rozwiązaniami', async () => {
      const p = await nowaStrona(URL0 + '#gra=labirynt&nr=50');
      assert.equal(await p.locator('.strona').count(), 2);
      await p.selectOption('#ile-kart', '3');
      await p.waitForFunction(() => document.querySelectorAll('.strona').length === 6);
      assert.equal(await p.locator('.strona-rozw').count(), 3);
      assert.match(await p.textContent('#licznik'), /6 stron/);
      await p.locator('#rozw').setChecked(false, { force: true });
      await p.waitForFunction(() => document.querySelectorAll('.strona').length === 3);
      await p.close();
    });

    await t.test('ustawienia zostają zapamiętane po odświeżeniu', async () => {
      const p = await nowaStrona(URL0 + '#gra=sudoku&nr=1');
      await p.fill('#naglowek', 'Grupa Biedronki');
      await p.waitForFunction(() => document.querySelector('.karta-naglowek'));
      await p.waitForTimeout(500);
      await p.goto(URL0);
      await p.waitForSelector('.strona');
      assert.equal(await p.inputValue('#naglowek'), 'Grupa Biedronki');
      assert.equal(await p.getAttribute('.kafel[data-gra="sudoku"]', 'aria-pressed'), 'true');
      await p.evaluate(() => localStorage.clear());
      await p.close();
    });

    await t.test('wydruk: tylko kartki A4, bez interfejsu', async () => {
      const p = await nowaStrona(URL0 + '#gra=pisanie&nr=7');
      await p.emulateMedia({ media: 'print' });
      for (const sel of ['.topbar', '.katalog', '.ustawienia', '.pasek-podgladu', '.pasek-mobilny']) {
        assert.equal(await p.locator(sel).isVisible(), false, `${sel} widoczny w druku`);
      }
      const rozm = await p.$eval('.strona', (e) => { const r = e.getBoundingClientRect(); return [r.width, r.height]; });
      assert.ok(Math.abs(rozm[0] - 793.7) < 2 && Math.abs(rozm[1] - 1122.5) < 2, `rozmiar strony ${rozm}`);
      const pdf = await p.pdf({ preferCSSPageSize: true, printBackground: true });
      const strony = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
      assert.equal(strony, await p.locator('.strona').count(), 'liczba stron PDF = liczba kart');
      await p.close();
    });

    await t.test('Literki rysują się po wczytaniu czcionek', async () => {
      const p = await nowaStrona(URL0 + '#gra=pisanie&litery=ab&nr=3');
      await p.evaluate(() => document.fonts.ready);
      assert.ok(await p.locator('svg.pisanie g.pis-wiersz path').count() > 10);
      await p.close();
    });

    await t.test('dostępność: każde pole ma etykietę, przyciski mają nazwy', async () => {
      const p = await nowaStrona();
      for (const id of ['pisanie', 'kratka', 'matematyka']) {
        await p.click(`.kafel[data-gra="${id}"]`);
        const bez = await p.$$eval('input, select, textarea', (els) => els.filter((e) => {
          if (e.type === 'hidden') return false;
          const l = e.labels && e.labels.length ? e.labels[0].textContent.trim() : '';
          return !l && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby');
        }).map((e) => e.id || e.outerHTML.slice(0, 60)));
        assert.deepEqual(bez, [], `pola bez etykiety (${id})`);
      }
      const przyciski = await p.$$eval('button', (els) => els.filter((b) => !(b.textContent.trim() || b.getAttribute('aria-label'))).map((b) => b.id));
      assert.deepEqual(przyciski, [], 'przyciski bez nazwy');
      assert.equal(await p.locator('h1').count(), 1);
      assert.equal(await p.getAttribute('html', 'lang'), 'pl');
      await p.close();
    });

    await t.test('telefon: bez przewijania w bok, menu kart się rozwija', async () => {
      const tel = await przegladarka.newContext({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true });
      const p = await tel.newPage();
      await p.goto(URL0);
      await p.waitForSelector('.strona');
      const [sw, cw] = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      assert.ok(sw <= cw, `przewijanie w bok: ${sw} > ${cw}`);
      assert.ok(await p.locator('.pasek-mobilny').isVisible());
      assert.equal(await p.locator('#lista-gier').isVisible(), false);
      await p.click('#katalog-przelacznik');
      assert.ok(await p.locator('#lista-gier').isVisible());
      await p.click('.kafel[data-gra="szlaczki"]');
      assert.equal(await p.locator('#lista-gier').isVisible(), false);
      assert.match(await p.textContent('#katalog-wybor'), /Szlaczki/);
      await tel.close();
    });

    await t.test('wyszukiwarka kart filtruje listę', async () => {
      const p = await nowaStrona();
      await p.fill('#szukaj', 'dyktando');
      assert.equal(await p.locator('.kafle li:not([hidden])').count(), 1);
      await p.keyboard.press('Enter');
      await p.waitForFunction(() => location.hash.includes('gra=kratka'));
      await p.fill('#szukaj', 'zzzz');
      assert.ok(await p.locator('#brak-wynikow').isVisible());
      await p.close();
    });

    await t.test('w konsoli nie było błędów', () => {
      assert.deepEqual(bledy, []);
    });
  } finally {
    await przegladarka.close();
    srv.close();
  }
});
