/* Ikony interfejsu (24×24, obrys). Wstawiane do elementów z atrybutem data-ikona
   oraz do listy kart (KP.ikona(id)). */
(function () {
  'use strict';

  const P = {
    // akcje
    drukuj: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/><path d="M17.5 12h.01"/>',
    losuj: '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="M4 4l5 5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    szukaj: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    pomoc: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.6 2.6 0 0 1 5 .8c0 1.7-2.5 2.3-2.5 4"/><path d="M12 17.5h.01"/>',
    ok: '<path d="M20 6 9 17l-5-5"/>',
    // rodzaje kart
    pisanie: '<path d="M3 20h18"/><path d="M15.5 3.5a2.1 2.1 0 0 1 3 3L8 17l-4 1 1-4z"/>',
    szlaczki: '<path d="M3 9c2-3.5 3.5-3.5 4.5 0S10 12.5 12 9s3.5-3.5 4.5 0 2.5 3.5 4.5 0"/><path d="M3 17c2-3.5 3.5-3.5 4.5 0s2.5 3.5 4.5 0 3.5-3.5 4.5 0 2.5 3.5 4.5 0" stroke-dasharray="0.1 3"/>',
    kratka: '<path d="M3 3h18v18H3z" stroke-opacity=".45"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18" stroke-opacity=".45"/><path d="M3 15V9h6v6h6V9h6" stroke-width="2.2"/>',
    sciezki: '<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18c5 0 3-8 7-9s3-3 3-3" stroke-dasharray="0.1 3"/>',
    papier: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 11h7M9 14h7M9 17h5"/>',
    kropki: '<circle cx="5" cy="17" r="1.3" fill="currentColor"/><circle cx="9" cy="6" r="1.3" fill="currentColor"/><circle cx="15" cy="10" r="1.3" fill="currentColor"/><circle cx="19" cy="4" r="1.3" fill="currentColor"/><circle cx="18" cy="19" r="1.3" fill="currentColor"/><path d="M5 17 9 6l6 4 4-6" />',
    labirynt: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 3v8h4M16 7v6h-8M12 17h9M8 17v4"/>',
    przerysuj: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18" stroke-opacity=".45"/><path d="M3 3h9v9H3z" fill="currentColor" fill-opacity=".25"/><path d="M12 12h9v9h-9z" fill="currentColor" fill-opacity=".25"/>',
    litery: '<path d="M4 18 8.5 6 13 18"/><path d="M5.7 14h5.6"/><rect x="15" y="10" width="6" height="8" rx="1.5" stroke-dasharray="2 2"/>',
    rozsypanka: '<rect x="3" y="6" width="8" height="8" rx="2" transform="rotate(-8 7 10)"/><rect x="13" y="10" width="8" height="8" rx="2" transform="rotate(9 17 14)"/>',
    wykreslanka: '<path d="M3 3h12v12H3z" stroke-opacity=".45"/><path d="M7 3v12M11 3v12M3 7h12M3 11h12" stroke-opacity=".45"/><circle cx="16" cy="16" r="4"/><path d="m19 19 2.5 2.5"/>',
    dopasuj: '<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6.5 17 17.5M7 17.5 17 6.5"/>',
    matematyka: '<path d="M4 7h6M7 4v6M14 7h6M5 15l4 4M9 15l-4 4M14 15.5h6M14 19h6"/>',
    sudoku: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
  };

  KP.ikona = function (nazwa, klasa) {
    const p = P[nazwa];
    if (!p) return '';
    return `<svg class="ikona${klasa ? ' ' + klasa : ''}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
  };

  KP.wstawIkony = function (root) {
    (root || document).querySelectorAll('[data-ikona]:not([data-ikona-ok])').forEach((el) => {
      el.insertAdjacentHTML('afterbegin', KP.ikona(el.dataset.ikona));
      el.setAttribute('data-ikona-ok', '');
    });
  };
})();
