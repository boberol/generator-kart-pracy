/* Wczytuje skrypty generatora (bez interfejsu) do piaskownicy Node, w kolejności z index.html. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const KORZEN = path.join(__dirname, '..');

function skryptyZIndex() {
  const html = fs.readFileSync(path.join(KORZEN, 'index.html'), 'utf8');
  return Array.from(html.matchAll(/<script src="([^"]+)"/g)).map((m) => m[1]);
}

function zaladuj() {
  // Minimalne atrapy przeglądarki: canvas do mierzenia tekstu.
  const ctx2d = { font: '', measureText: (t) => ({ width: String(t).length * 50, actualBoundingBoxAscent: 50 }) };
  const document = {
    createElement: () => ({ getContext: () => ctx2d }),
    querySelectorAll: () => [],
    addEventListener: () => {},
  };
  const sandbox = { console, document, Math, Date, JSON, URLSearchParams };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  skryptyZIndex()
    .filter((s) => !/app\.js$/.test(s))
    .forEach((s) => vm.runInContext(fs.readFileSync(path.join(KORZEN, s), 'utf8'), sandbox, { filename: s }));
  return sandbox.KP;
}

module.exports = { zaladuj, skryptyZIndex, KORZEN };
