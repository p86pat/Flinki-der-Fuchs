# Flinki der Fuchs 🦊

Ein Jump-and-Run-Spiel für Kinder von 6 bis 8 Jahren, als reine Web-App (Vanilla JS, ES-Module, kein Build-Schritt).
Gedacht für Safari auf dem iPad, gespiegelt per AirPlay auf den TV und gespielt mit einem Bluetooth-Controller.

> **Stand:** Schritt 1: Der Prototyp (`flinki.html`) ist in Module aufgeteilt, das Verhalten ist unverändert.
> PWA/Offline, Weltkarte, 8 Welten, Text-Maps, Editor, 2 Spieler, Einstellungen und Musik folgen in den nächsten Schritten.

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
index.html          Einstieg (lädt ./src/game.js als Modul)
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
assets/             (später: Icons für die PWA)
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

## Hosting

Die ausführliche Anleitung (mit PWA/Offline) folgt im PWA-Schritt. Kurzfassung:

- **GitHub Pages:** Repository → Settings → Pages → «Deploy from a branch», Branch `main`, Ordner `/ (root)`.
  Danach ist das Spiel unter `https://<user>.github.io/Flinki-der-Fuchs/` erreichbar.
- **Home Assistant:** Alle Dateien nach `/config/www/flinki/` kopieren. Beim allerersten Anlegen von `www`
  Home Assistant einmal neu starten. Aufruf: `http://<homeassistant>:8123/local/flinki/index.html`.
