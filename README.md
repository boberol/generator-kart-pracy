# Generator kart pracy dla dzieci

Strona do tworzenia kart pracy do druku (A4) dla dzieci w wieku przedszkolnym i wczesnoszkolnym. Cały interfejs i treść kart są po polsku. Każda karta to prosta zabawa, a nacisk położony jest na **pisanie i grafomotorykę**.

## Rodzaje kart

**Pisanie i grafomotoryka**
- **Pisanie po śladzie** – wybrane litery w dowolnej kolejności (z sylabami i wyrazami), wyrazy z obrazkami lub własne, albo własny tekst. Domyślne pismo to **Literki** (jednokreskowe litery z `js/literki.js`): ślad z kropek lub kresek. Do wyboru także pismo pisane (Playwrite Polska) i drukowane (Andika). Liniatura z polem środkowym, kratka, jedna linia lub bez linii; trzy wielkości; liczba powtórzeń; miejsce na samodzielne pisanie; własne kolory wzoru, śladu, pola i linii.
- **Szlaczki w kratce i dyktando graficzne** – szlaczki rysowane po kratkach (zamki, daszki, schodki, piramidki, szachownica…; wzór → ślad → samodzielnie) oraz dyktando graficzne ze strzałkami (domek, rybka, choinka, serce, łódka…) ze stroną rozwiązania; kratka 1 cm, 7,5 mm lub 5 mm.
- **Szlaczki** – fale, zygzaki, zamki, łuki, mostki, pętelki, ząbki, sprężynki; wzór + ślad + miejsce na samodzielne dokończenie; kolejność losowa lub od najłatwiejszych; własne kolory.
- **Papier w linie i kratkę** – puste strony: linie z polem środkowym, pojedyncze linie, kratka (1 cm / 5 mm), siatka kropek, rysunek + linie, pięciolinia; tytuł, margines, kolory.
- **Prowadzenie linii** – prowadzenie kredki po kropkowanej ścieżce od obrazka do obrazka.
- **Połącz kropki** – 9 obrazków, 12/22/34 kropki.
- **Labirynt** – trzy rozmiary, z rozwiązaniem.
- **Przerysuj obrazek** – przerysowanie mozaiki po kratkach lub dorysowanie drugiej połowy (symetria).

**Litery i słowa**: brakujące litery, rozsypanka literowa, wykreślanka (wszystkie także z własnymi wyrazami), połącz w pary (obrazek–wyraz).

**Liczby i logika**: działania (zwykłe, ukryte hasło/szyfr, porównywanie, brakujące liczby; zakres do 10/20/100), sudoku obrazkowe i liczbowe 4×4 i 6×6.

## Funkcje
- Przycisk **Losuj nową** (lub klawisz <kbd>N</kbd>) tworzy nową kartę; **numer karty** pozwala odtworzyć dokładnie tę samą kartę.
- **Kilka kart naraz** (do 10 różnych) – rozwiązania drukują się na końcu.
- Ustawienia zapamiętują się w przeglądarce (osobno dla każdego rodzaju karty) i w adresie strony; **Kopiuj link** wysyła dokładnie tę kartę.
- Podgląd z powiększeniem (dopasowanie do szerokości, <kbd>+</kbd>/<kbd>−</kbd>), wyszukiwarka kart, okno „Jak to działa?”.
- Opcjonalna **strona z rozwiązaniem**, własny podpis na karcie, druk czarno-biały, przywracanie domyślnych kolorów i ustawień.
- **Drukuj / zapisz PDF** – każda karta na osobnej stronie A4.
- Działa na komputerze, tablecie i telefonie; po pierwszym wejściu także **bez internetu** (service worker). Czcionki są dołączone do strony, bez Google Fonts.
- Dostępność: kontrast zgodny z WCAG AA, obsługa klawiatury, etykiety pól, ograniczenie animacji dla osób, które je wyłączyły.

## Uruchomienie
To zwykła strona statyczna (HTML + CSS + JavaScript, bez budowania).

- Lokalnie: `python3 -m http.server` i wejdź na http://localhost:8000 (albo otwórz `index.html`).
- W internecie: włącz GitHub Pages dla tego repozytorium (Settings → Pages → gałąź z kodem, folder `/`).

## Testy
```
npm install            # instaluje Playwright (tylko do testów)
npx playwright install chromium
npm test               # wszystkie testy
npm run test:szybkie   # same generatory, bez przeglądarki
```
- `tests/generatory.test.js` – każda karta dla każdej wartości każdej opcji, powtarzalność, bezpieczeństwo własnego tekstu, szybkość generowania, kompletność Literek, dyktando i szlaczki w kratce.
- `tests/przegladarka.test.js` – prawdziwa przeglądarka: wybór każdej karty, podgląd, link, pamięć ustawień, liczba kart, wydruk do PDF (liczba stron = liczba kart), dostępność, widok na telefonie.

Testy uruchamiają się też automatycznie na GitHubie (`.github/workflows/testy.yml`).

## Struktura
```
index.html          – strona
css/style.css       – wygląd i ustawienia druku
js/core.js          – losowanie, słownictwo z obrazkami, wzory szlaczków, rysowanie literek
js/literki.js       – kształty liter „Literki” (wygenerowane z plików SVG)
js/app.js           – interfejs, podgląd, druk
js/ikony.js         – ikony interfejsu (SVG)
js/gry/*.js         – każda gra w osobnym pliku (rejestruje się przez KP.zarejestruj)
fonts/              – czcionki (Nunito, Andika, Playwrite Polska; licencja OFL)
sw.js               – praca bez internetu (po dodaniu pliku dopisz go do listy i zmień WERSJA)
tests/              – testy
```

### Dodawanie nowej gry
Utwórz plik w `js/gry/`, wywołaj `KP.zarejestruj({ id, nazwa, ikona, opis, opcje, generuj(opcje, R) })`, gdzie `generuj` zwraca `{ tytul, polecenie, tresc, rozwiazanie }` (HTML/SVG). Dołącz plik w `index.html` (z `defer`), dopisz go w `sw.js`, dopisz `id` do odpowiedniej grupy w `js/app.js` i dodaj ikonę w `js/ikony.js`. Testy same sprawdzą nową kartę.

### Literki
`js/literki.js` powstał z plików SVG (po jednym na literę: `a.svg`, `a-ogonek.svg`, `l-stroke.svg`, `z-dot.svg` itd.). Każda litera ma ścieżki, szerokość oraz położenie linii bazowej i górnej linii pola środkowego. Zestaw zawiera 32 małe litery polskiego alfabetu; znaki spoza zestawu (np. wielkie litery, kropka) są rysowane pismem Playwrite Polska.
