# Flinki der Fuchs 🦊

Ein Jump-and-Run-Spiel für Kinder von 6 bis 8 Jahren, als reine Web-App (Vanilla JS, ES-Module, kein Build-Schritt).
Gedacht für Safari auf dem iPad, gespiegelt per AirPlay auf den TV und gespielt mit einem Bluetooth-Controller.

> **Stand:** Schritt 8: Flinki-Rennen (Pseudo-3D-Kartrennen). Davor Schritt 7: Lernstufen (Kindergarten bis 3. Klasse) mit 13 Rätselarten. Davor Schritt 6: 8 Welten mit Leitern, Wasser, fahrenden Plattformen, versteckten Sternen und Lernrätseln.
> Als Nächstes: Einstellungen & Musik, Level-Editor, 2-Spieler-Modus. 8 Welten, Editor, 2 Spieler, Einstellungen und Musik folgen in den nächsten Schritten.

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
| Leiter hoch/runter | Stick/Steuerkreuz ▲ ▼ (oder Sprung halten = hoch) | ↑ ↓ oder W / S | «Hopp» halten = hoch |
| Schwimmen         | Springen = Schwimmzug, an der Oberfläche hüpft Flinki hinaus | Leertaste | «Hopp» |
| Bestätigen        | wie Springen                      | Enter / Leertaste     | Bildschirm tippen|
| Pause             | Start / Options / + (auch Select) | Esc oder P            | ❚❚ oben in der Mitte |
| Karte: Welt wählen | ◀ ▶                              | ← →                   | Welt antippen (nochmal tippen = los) |
| Pause-Menü        | ◀ ▶ wählen, A: ▶ weiter / 🗺 Karte | ← → und Leertaste     | Knopf antippen   |

- **Safari meldet einen Controller erst nach dem ersten Tastendruck.** Auf dem Titelbild steht deshalb
  «Controller? Einmal eine Taste drücken».
- Die Touch-Knöpfe erscheinen nur auf Touch-Geräten, und nur solange kein Controller aktiv ist.
- Längeres Drücken der Sprungtaste lässt Flinki höher springen. Coyote Time (0,1 s) und
  Jump Buffer (0,14 s) machen das Springen nachsichtig.

## Flinki-Rennen (Pseudo-3D)

Im Titelbild **«Rennen»** wählen (◀ ▶ und A, oder antippen), dann eine Strecke:
**Wiesenring**, **Strandkurs** oder **Regenbogenbahn**.

- Ansicht wie bei alten Konsolen-Kartspielen («Mode 7»): Man sitzt hinter Flinkis Kart, die Strecke läuft in die Tiefe.
- **Lenken:** ◀ ▶ (Stick, Steuerkreuz, Pfeiltasten oder Touch-Knöpfe). **Gas geht automatisch.**
- **Sterne** füllen die Turbo-Anzeige. **A / Leertaste / «Turbo»** zündet den Turbo (braucht ¼ der Anzeige).
- **Gelbe Pfeil-Felder** auf der Strecke geben ebenfalls Turbo.
- **Lenkhilfe:** Wer nicht lenkt, wird sanft auf der Strecke gehalten. Neben der Strecke wird man nur langsamer.
- Gegner: **Schnecke, Hase, Igel**. Sie passen ihr Tempo an, damit es spannend bleibt.
- 3 Runden, danach ein Siegertreppchen. Die beste Platzierung pro Strecke wird als Medaille gespeichert.
- Start = Pause (weiter oder zurück zu den Strecken).
- **Neue Strecke:** in `src/race/tracks.js` einen Eintrag mit Kontrollpunkten (`pts`) ergänzen. Daraus wird automatisch
  eine runde Strecke. Deko: `tree`, `palm` oder `lolly`.

## Die 8 Welten

| # | Welt | Neu dazu |
|---|------|----------|
| 1 | Sonnenwiese | laufen, springen, Schnecken, Sprungpilz, erstes Rätsel |
| 2 | Abendhügel | versteckte Sterne |
| 3 | Kletterwald | Leitern |
| 4 | Sternennacht | fahrende Plattform ↔ |
| 5 | Seeufer | Wasser & Schwimmen |
| 6 | Wolkenland | Aufzüge ↕ und Plattform-Brücken |
| 7 | Bergpfad | alles gemischt |
| 8 | Regenbogenland | Finale mit zwei Rätsel-Toren |

## Lernrätsel

In den Welten stehen **Rätsel-Tore** `?` auf dem Weg und **Rätsel-Kisten** `K` daneben.
Läuft Flinki hinein, öffnet sich ein grosses Rätsel-Fenster:

- **Lernstufe wählen:** Auf der Weltkarte oben links «Lernen» antippen (Controller: ▲ und A).

  | Stufe | Rätsel |
  |---|---|
  | Automatisch | Stufe wächst mit der Welt (Welt 1–2 Kindergarten, 3–5 1. Klasse, 6–8 2. Klasse) |
  | Kindergarten | zählen bis 8, mehr/weniger, Plus bis 5 mit Bildern, Muster, Anlaute (2 Buchstaben) |
  | 1. Klasse | zählen bis 12, Plus/Minus bis 10, fehlende Zahl bis 20, Uhr (volle Stunde), Wörter lesen, Anlaute |
  | 2. Klasse | Plus/Minus bis 100 mit Zehnerübergang (37 + 8, 83 − 36), Einmaleins 2/5/10, dann 3/4, Platzhalter (? + 7 = 15), Verdoppeln/Halbieren bis 100, Textaufgaben, Zahlenreihen, Uhr (halbe Stunde), Geld (Franken), Silben, Wort → Bild |
  | 3. Klasse | Plus/Minus bis 1000 (340 + 250, 456 + 38, 700 − 260), alle Einmaleins-Reihen und 4 × 30, Geteilt (56 : 7), Platzhalter (6 × ? = 42), Grösser/kleiner (< > =), Textaufgaben, Zahlenreihen, Uhr (Viertelstunde), Geld mit Rappen |

  Innerhalb einer Stufe werden die Rätsel in späteren Welten etwas schwerer. In der 2. und 3. Klasse kommen Rechenaufgaben
  häufiger vor; die falschen Antworten sind typische Fehler (Übertrag vergessen = ±10/±100, um 1 verrechnet).
- **Lernstand für Eltern:** Im Lernstufen-Fenster steht pro Rätselart, wie oft es beim ersten Versuch geklappt hat
  (grün ab 75 %, orange ab 50 %).
- **Vorlesen:** Die Frage wird vorgelesen, der 🔊-Knopf wiederholt sie. So geht es auch ohne Lesen.
  Auf dem iPad eine schöne deutsche Stimme laden: Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Deutsch.
- **Falsch ist nicht schlimm:** Die falsche Antwort wird grau, «Probier nochmal!», man versucht einfach weiter.
  Die richtige Antwort bringt einen Bonus-Stern, und das Tor geht auf.
- **Steuerung:** ◀ ▶ auswählen, A antworten. Start bzw. ✕ schliesst das Fenster (beim Tor geht Flinki einen Schritt zurück).
  Auf dem Touchscreen einfach die Antwort antippen.
- Die Aufgaben sind jedes Mal neu gewürfelt.

## Ablauf & Spielstand

Titelbild → **Weltkarte** → Welt spielen → Ziel → zurück zur Karte, wo Flinki zur nächsten Welt hüpft.
Eine Welt wird frei, sobald die vorherige geschafft ist. Unter jeder geschafften Welt steht die beste Sternzahl
(gelb, wenn alle Sterne gesammelt sind). Nach der letzten Welt kommt der Jubel-Bildschirm.

Der Spielstand liegt im Browser (localStorage, Schlüssel `flinki-spielstand-v1`), pro Gerät und pro Adresse.
Die App auf dem Home-Bildschirm und Safari haben **getrennte** Spielstände.
- **Alle Welten zum Testen freischalten:** `?alle` an die Adresse hängen, z. B. `…/Flinki-der-Fuchs/?alle`
  (wird nicht gespeichert).
- Wird ein Level geändert (andere Sternzahl), zählt sein Rekord neu.

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
  levels.js         lädt die Level-Dateien (levels/index.json)
  levelformat.js    Text-Map lesen/schreiben, Level aufbauen
  themes.js         Farbthemen (wiese, abend, nacht)
  save.js           Spielstand (localStorage)
  ui.js             Layout von Karte, Pause-Menü und Rätsel-Fenster (fürs Zeichnen und Antippen)
  gfx.js            Canvas, Zeichen-Grundfunktionen, Flinki-Figur
  quiz.js           Lernrätsel erzeugen (Arten, Schwierigkeit je Welt)
  quizdraw.js       Rätsel-Fenster zeichnen
  pics.js           selbst gezeichnete Bilder (Apfel, Fisch, Haus, …) und Formen
  speech.js         Vorlesen (Web Speech API, auf dem iPad offline)
  race/race.js      Flinki-Rennen: Pseudo-3D-Boden, Karts, Gegner, Streckenwahl
  race/tracks.js    Rennstrecken (Kontrollpunkte, Farben, Deko)
levels/
  index.json        Reihenfolge der Welten
  sonnenwiese.txt … ein Level pro Datei (Text-Map)
assets/
  fonts/            Schrift «Baloo 2» (SIL Open Font License, siehe OFL.txt)
  icons/            App-Icons (selbst gezeichnet)
tools/
  icons.html        zeichnet die App-Icons (im Browser öffnen → «PNG speichern»)
  make-icons.mjs    dasselbe automatisch: node tools/make-icons.mjs (braucht Playwright)
  check_levels.py   prüft alle Level auf Erreichbarkeit (python3 tools/check_levels.py)
  build_levels.py   hat die Welten 3, 5–8 erzeugt (nur als Hilfe, die .txt-Dateien sind die Quelle)
```

Alle Pfade sind **relativ** (`./src/…`, `./levels/…`). Das Spiel läuft deshalb auch in einem Unterordner,
zum Beispiel unter GitHub Pages (`/Flinki-der-Fuchs/`) oder in Home Assistant (`/local/flinki/`).

## Level-Format (Text-Map)

Jedes Level ist eine Textdatei in `levels/`. Die Reihenfolge der Welten steht in `levels/index.json`.

```
name: Sonnenwiese
thema: wiese
---
....................................................................................................
... (insgesamt 15 Zeilen, eine Zeile = eine Kachelreihe, ein Zeichen = eine Kachel 48×48 px) ...
..F..............S............####......S..........C.............P..............S.........S.....Z...
#######################..#####################..#######################..###########################
#######################..#####################..#######################..###########################
```

| Zeichen | Bedeutung |
|---------|-----------|
| `.` oder Leerzeichen | leer (Luft) |
| `#` | Erde/Boden (oben automatisch mit Gras) |
| `B` | gelber Block (fest) |
| `-` | Holzbrett – von unten durchspringbar, man kann darauf stehen |
| `F` | Startplatz von Flinki |
| `*` | Stern |
| `S` | Schnecke (läuft hin und her, schubst nur weg) |
| `P` | Sprungpilz |
| `C` | Checkpoint-Fähnchen (hier geht es nach dem Runterfallen weiter) |
| `Z` | Ziel-Fahne |
| `H` | Leiter – mit ▲/▼ klettern; auf der obersten Sprosse kann man stehen |
| `~` | Wasser – schwimmen (jeder Sprung ist ein Schwimmzug). Unter dem Wasser braucht es Boden! |
| `M` | fahrende Plattform ↔ (`MMM` = 3 Kacheln breit) – fährt bis zu Wand, Stopper `:` oder max. 8 Kacheln |
| `V` | fahrende Plattform ↕ (Aufzug) – gleiche Regeln, senkrecht |
| `:` | Stopper für fahrende Plattformen (unsichtbar) |
| `+` | versteckter Stern – erst sichtbar, wenn Flinki nahe ist (verrät sich durch ein leises Glitzern) |
| `?` | **Rätsel-Tor** – versperrt den Weg (die ganze Spalte darüber), öffnet sich mit der richtigen Antwort, +1 Stern |
| `K` | **Rätsel-Kiste** – freiwillig, +1 Stern |

Regeln und Tipps:
- **Kopf:** `name:` (wird am Levelanfang angezeigt) und `thema:` (`wiese`, `abend` oder `nacht`), danach eine Zeile `---`.
- **Höhe:** 15 Zeilen. Fehlende Zeilen werden oben mit Luft aufgefüllt. Kürzere Zeilen werden rechts mit Luft aufgefüllt.
- **Figuren und Objekte** stehen auf dem Boden ihrer Zelle, direkt darunter sollte also Boden, ein Block oder ein Brett sein.
  Sterne schweben in der Mitte ihrer Zelle.
- Der **normale Boden** sind die unteren 2 Zeilen, Figuren kommen in die Zeile darüber.
  Eine Lücke im Boden ist ein Loch, bei dem man zum letzten Checkpoint zurückkommt.
- Flinki springt normal etwa **4 Kacheln hoch** und rund **5 Lücken weit**, mit dem Pilz deutlich höher.
- Sterne und `+` dürfen auch im Wasser liegen (die Zelle bleibt dann Wasser).
- **Prüfen, ob ein Level schaffbar ist:** `python3 tools/check_levels.py` meldet unerreichbare Sterne, Kisten, Tore oder ein unerreichbares Ziel.
- **Neues Level hinzufügen:** Datei `levels/meinlevel.txt` anlegen, in `levels/index.json` eintragen und
  (für den Offline-Modus) in `sw.js` bei `FILES` ergänzen und `VERSION` erhöhen.

## Als App installieren (iPad & iPhone)

**iPhone:** Safari erlaubt dort keinen Vollbild-Modus für Webseiten. Vollbild gibt es nur als App vom Home-Bildschirm.
Der ⛶-Knopf zeigt auf dem iPhone deshalb eine kurze Anleitung dazu.


1. Die Spiel-Adresse in **Safari** öffnen (nicht in Chrome, sonst gibt es kein «Zum Home-Bildschirm»).
2. Teilen-Knopf ⎋ → **«Zum Home-Bildschirm»** → «Hinzufügen».
3. Das Spiel über das Fuchs-Icon starten. Es läuft im Vollbild, ohne Adressleiste.
4. Einmal online starten, danach geht es **auch ohne Internet**.
5. Hochformat: Das Spiel zeigt ein Symbol «iPad drehen». Tipp: Die Ausrichtungssperre im Kontrollzentrum
   auf Querformat stellen, dann kippt nichts beim Spielen.

**Auf den TV:** Kontrollzentrum → Bildschirmsynchronisierung → Apple TV bzw. AirPlay-Gerät wählen.
Das Bild ist 16:9, schwarze Ränder beim iPad-Format sind normal.

**Updates:** Mit Internet lädt das Spiel immer die neueste Version. Nach einem Update lädt es sich einmal
von selbst neu. Ohne Internet läuft die zuletzt gespeicherte Version.
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

Ein Update geht so: Dateien ersetzen – beim nächsten Start (mit Netz) ist die neue Version da.
