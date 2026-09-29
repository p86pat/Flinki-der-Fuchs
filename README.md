# Flinki der Fuchs 🦊

Ein Jump-and-Run-Spiel für Kinder von 6 bis 8 Jahren, als reine Web-App (Vanilla JS, ES-Module, kein Build-Schritt).
Gedacht für Safari auf dem iPad, gespiegelt per AirPlay auf den TV und gespielt mit einem Bluetooth-Controller.

> **Stand:** Schritt 2: Modulstruktur, installierbar als App (PWA) und offline spielbar.
> Text-Maps, Weltkarte, 8 Welten, Editor, 2 Spieler, Einstellungen und Musik folgen in den nächsten Schritten.

## Starten (lokal)

ES-Module laufen nicht über `file://`. Deshalb braucht es einen kleinen Webserver:

```sh
python3 -m http.server 8000
```

Dann `http://localhost:8000/` öffnen. Vom iPad aus im selben WLAN: `http://<IP-des-Rechners>:8000/`.

## Steuerung

| Aktion            | Controller                        | Tastatur              | Touch            |
|-------------------|-----------------------------------|-----------------------|------------------|
| Laufen            | Linker Stick / Steuerkreuz ◀ ▶    | ← → oder A / D        | ◀ ▶ Knöpfe       |
| Springen          | A / B / X / Y (jede Taste) oder ▲ | Leertaste, ↑ oder W   | «Hopp»           |
| Bestätigen        | wie Springen                      | Enter / Leertaste     | Bildschirm tippen|
| Pause             | Start / Options / + (auch Select) | Esc oder P            | –                |

- **Safari meldet einen Controller erst nach dem ersten Tastendruck.** Auf dem Titelbild steht deshalb
  «Controller? Einmal eine Taste drücken».
- Die Touch-Knöpfe erscheinen nur auf Touch-Geräten, und nur solange kein Controller aktiv ist.
- Längeres Drücken der Sprungtaste lässt Flinki höher springen. Coyote Time (0,1 s) und
  Jump Buffer (0,14 s) machen das Springen nachsichtig.

## Projektstruktur

```
index.html          Einstieg (lädt ./src/game.js als Modul, registriert den Service Worker)
manifest.webmanifest  App-Beschreibung für «Zum Home-Bildschirm»
sw.js               Service Worker (Offline-Cache)
flinki.html         Original-Prototyp (Referenz, wird später entfernt)
src/
  config.js         Konstanten: 1280×720, Kachel 48 px, 15 Zeilen, Physik 120 Hz
  state.js          gemeinsamer Spielzustand (G) und Spielfigur (P)
  game.js           Spiellogik, Zustände (Titel/Spiel/Pause/Ziel/Ende), Hauptschleife
  physics.js        Kachel-Abfrage, Kollision
  input.js          Tastatur, Touch, Gamepad-API, Vollbild-Knopf
  render.js         alles Zeichnen (Canvas), devicePixelRatio-Anpassung
  audio.js          Soundeffekte per WebAudio
  fx.js             Partikel und schwebende Texte
  levels.js         Level-Liste und Aufbau
levels/
  welt1.js …        ein Level pro Datei
assets/
  fonts/            Schrift «Baloo 2» (SIL Open Font License, siehe OFL.txt)
  icons/            App-Icons (selbst gezeichnet)
tools/
  icons.html        zeichnet die App-Icons (im Browser öffnen → «PNG speichern»)
  make-icons.mjs    dasselbe automatisch: node tools/make-icons.mjs (braucht Playwright)
```

Alle Pfade sind **relativ** (`./src/…`, `../levels/…`). Das Spiel läuft deshalb auch in einem Unterordner,
zum Beispiel unter GitHub Pages (`/Flinki-der-Fuchs/`) oder in Home Assistant (`/local/flinki/`).

## Level-Format (aktuell)

Ein Level ist im Moment noch eine kleine Bau-Funktion wie im Prototyp. Das Raster ist 15 Kacheln hoch,
Zeile 13 ist der normale Boden:

```js
export default {
  name: 'Sonnenwiese', sky: ['#6ec3ff', '#e2f5ff'], /* … Farben … */
  build(b) {
    b.init(100);          // Breite in Kacheln
    b.start(2);           // Startspalte
    b.ground(0, 22);      // Boden von Spalte 0 bis 22 (optional: Oberkante)
    b.block(10, 10, 3);   // 3 feste Blöcke ab Spalte 10, Zeile 10
    b.plank(21, 10, 5);   // Brett (von unten durchspringbar)
    b.stars(5, 11, 3);    // 3 Sterne
    b.snail(17);          // Schnecke
    b.shroom(65);         // Sprungpilz
    b.check(51);          // Checkpoint-Fähnchen
    b.goal(96);           // Ziel-Fahne
  }
};
```

In einem der nächsten Schritte wird daraus eine **Text-Map** (ein Zeichen pro Kachel) mit Level-Editor im Browser.

## Als App installieren (iPad)

1. Die Spiel-Adresse in **Safari** öffnen (nicht in Chrome, sonst gibt es kein «Zum Home-Bildschirm»).
2. Teilen-Knopf ⎋ → **«Zum Home-Bildschirm»** → «Hinzufügen».
3. Das Spiel über das Fuchs-Icon starten. Es läuft im Vollbild, ohne Adressleiste.
4. Einmal online starten, danach geht es **auch ohne Internet**.
5. Hochformat: Das Spiel zeigt ein Symbol «iPad drehen». Tipp: Die Ausrichtungssperre im Kontrollzentrum
   auf Querformat stellen, dann kippt nichts beim Spielen.

**Auf den TV:** Kontrollzentrum → Bildschirmsynchronisierung → Apple TV bzw. AirPlay-Gerät wählen.
Das Bild ist 16:9, schwarze Ränder beim iPad-Format sind normal.

**Updates:** Der Service Worker liefert zuerst die gespeicherte Version und lädt im Hintergrund nach.
Neue Level oder Änderungen erscheinen deshalb beim **übernächsten** Start (App ganz schliessen und neu öffnen).
Wer eine neue Datei hinzufügt, trägt sie in `sw.js` unter `FILES` ein und erhöht `VERSION`.

## Hosting

Das Spiel besteht nur aus statischen Dateien. Alle Pfade sind relativ, es läuft deshalb in jedem Unterordner.
Für den Service Worker (Offline) braucht es **HTTPS** oder `localhost`. Über reines `http://` im Heimnetz
läuft das Spiel trotzdem, aber ohne Offline-Modus und ohne echte App-Installation.

### Variante A: GitHub Pages (empfohlen, HTTPS inklusive)

0. Mit einem kostenlosen GitHub-Konto funktioniert Pages nur bei **öffentlichen** Repositories.
   Ein privates Repository zuerst öffentlich machen: Settings → General → ganz unten «Danger Zone» →
   «Change visibility» → Public. Alternative: GitHub Pro.
1. Auf GitHub: Repository → **Settings → Pages**.
2. Unter «Build and deployment»: Source **«Deploy from a branch»**, Branch **`main`**, Ordner **`/ (root)`** → Save.
3. Nach 1–2 Minuten ist das Spiel erreichbar unter
   `https://<github-user>.github.io/Flinki-der-Fuchs/`
4. Diese Adresse auf dem iPad in Safari öffnen und wie oben zum Home-Bildschirm hinzufügen.

Jeder Push auf `main` veröffentlicht automatisch die neue Version.

### Variante B: Home Assistant im Heimnetz

1. Im Ordner `/config/www/` einen Unterordner `flinki` anlegen, z. B. mit dem Add-on «File editor»,
   «Samba share» oder «Studio Code Server».
   Gibt es `www` noch nicht, lege ihn an und **starte Home Assistant einmal neu**.
2. Alle Dateien des Projekts hineinkopieren (`index.html`, `manifest.webmanifest`, `sw.js`, `src/`, `levels/`, `assets/`).
   `tools/`, `flinki.html` und `README.md` braucht es nicht.
   Der Aufbau muss so aussehen: `/config/www/flinki/index.html`, `/config/www/flinki/src/game.js`, …
3. Aufruf auf dem iPad:
   - mit HTTPS (z. B. Nabu Casa oder ein eigenes Zertifikat): `https://<deine-ha-adresse>/local/flinki/index.html`
     → offline-fähig und als App installierbar.
   - nur `http://homeassistant.local:8123/local/flinki/index.html` → spielbar, aber ohne Offline-Modus.
4. Hinweis: Dateien unter `/local/` sind **ohne Anmeldung** erreichbar. Für ein Kinderspiel ist das unproblematisch.
   Leg dort aber keine privaten Daten ab.

Ein Update geht so: Dateien ersetzen, dann auf dem iPad die App zweimal neu starten (siehe «Updates»).
