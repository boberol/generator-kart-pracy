# Generator kart pracy dla dzieci

Strona do tworzenia kart pracy do druku (A4) dla dzieci w wieku przedszkolnym i wczesnoszkolnym. Cały interfejs i treść kart są po polsku. Każda karta to prosta zabawa, a nacisk położony jest na **pisanie i grafomotorykę**.

## Rodzaje kart

**Pisanie i grafomotoryka**
- **Pisanie po śladzie** – wybrane litery w dowolnej kolejności (z sylabami i wyrazami), wyrazy z obrazkami lub własne, albo własny tekst. Domyślne pismo to **Literki** (jednokreskowe litery z `js/literki.js`): ślad z kropek lub kresek. Do wyboru także pismo pisane (Playwrite Polska) i drukowane (Andika). Liniatura z polem środkowym, kratka, jedna linia lub bez linii; trzy wielkości; liczba powtórzeń; miejsce na samodzielne pisanie; własne kolory wzoru, śladu, pola i linii.
- **Szlaczki** – fale, zygzaki, zamki, łuki, mostki, pętelki, ząbki, sprężynki; wzór + ślad + miejsce na samodzielne dokończenie; kolejność losowa lub od najłatwiejszych; własne kolory.
- **Papier w linie i kratkę** – puste strony: linie z polem środkowym, pojedyncze linie, kratka (1 cm / 5 mm), siatka kropek, rysunek + linie, pięciolinia; tytuł, margines, kolory.
- **Prowadzenie linii** – prowadzenie kredki po kropkowanej ścieżce od obrazka do obrazka.
- **Połącz kropki** – 9 obrazków, 12/22/34 kropki.
- **Labirynt** – trzy rozmiary, z rozwiązaniem.
- **Przerysuj obrazek** – przerysowanie mozaiki po kratkach lub dorysowanie drugiej połowy (symetria).

**Litery i słowa**: brakujące litery, rozsypanka literowa, wykreślanka (wszystkie także z własnymi wyrazami), połącz w pary (obrazek–wyraz).

**Liczby i logika**: działania (zwykłe, ukryte hasło/szyfr, porównywanie, brakujące liczby; zakres do 10/20/100), sudoku obrazkowe i liczbowe 4×4 i 6×6.

## Funkcje
- Przycisk **Losuj** tworzy nową kartę; **numer karty** pozwala odtworzyć dokładnie tę samą kartę.
- Ustawienia zapisują się w adresie strony – link można wysłać innej osobie.
- Opcjonalna **strona z rozwiązaniem** (dla gier, które je mają).
- Własny podpis na karcie (np. nazwa grupy) i opcja druku czarno-białego.
- **Drukuj / zapisz PDF** – każda karta na osobnej stronie A4.

## Uruchomienie
To zwykła strona statyczna (HTML + CSS + JavaScript, bez instalowania czegokolwiek).

- Lokalnie: otwórz `index.html` w przeglądarce albo uruchom `python3 -m http.server` i wejdź na http://localhost:8000.
- W internecie: włącz GitHub Pages dla tego repozytorium (Settings → Pages → gałąź z kodem, folder `/`).

Czcionki (Nunito, Andika, Playwrite Polska) wczytywane są z Google Fonts, więc do poprawnego wyglądu pisma szkolnego potrzebny jest internet.

## Struktura
```
index.html          – strona
css/style.css       – wygląd i ustawienia druku
js/core.js          – losowanie, słownictwo z obrazkami, wzory szlaczków, rysowanie literek
js/literki.js       – kształty liter „Literki” (wygenerowane z plików SVG)
js/app.js           – interfejs, podgląd, druk
js/gry/*.js         – każda gra w osobnym pliku (rejestruje się przez KP.zarejestruj)
```

### Dodawanie nowej gry
Utwórz plik w `js/gry/`, wywołaj `KP.zarejestruj({ id, nazwa, ikona, opis, opcje, generuj(opcje, R) })`, gdzie `generuj` zwraca `{ tytul, polecenie, tresc, rozwiazanie }` (HTML/SVG). Dołącz plik w `index.html` i dopisz `id` do odpowiedniej grupy w `js/app.js`.

### Literki
`js/literki.js` powstał z plików SVG (po jednym na literę: `a.svg`, `a-ogonek.svg`, `l-stroke.svg`, `z-dot.svg` itd.). Każda litera ma ścieżki, szerokość oraz położenie linii bazowej i górnej linii pola środkowego. Zestaw zawiera 32 małe litery polskiego alfabetu; znaki spoza zestawu (np. wielkie litery, kropka) są rysowane pismem Playwrite Polska.
