#!/usr/bin/env python3
"""Erzeugt die Welten 3 und 5-8 als Text-Maps und ergänzt 2 und 4.

Einmalige Hilfe beim Bauen – die Dateien in levels/ sind danach die Quelle
und können von Hand (oder später im Editor) weiter bearbeitet werden.

    python3 tools/build_levels.py

Prüft: keine überlappenden Objekte, Tor-Spalten frei, Leitern mit Boden,
Wasser mit Grund.
"""
import os

ROWS = 15
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'levels')


class Level:
    def __init__(self, w, name, thema):
        self.w, self.name, self.thema = w, name, thema
        self.g = [['.'] * w for _ in range(ROWS)]

    # --- Kacheln ---
    def ground(self, a, z, top=13, ch='#'):
        for x in range(a, z + 1):
            for y in range(top, ROWS):
                self.g[y][x] = ch

    def water(self, a, z, top, bottom=12):
        for x in range(a, z + 1):
            for y in range(top, bottom + 1):
                assert self.g[y][x] == '.', f'{self.name}: Wasser auf belegtem Feld {x},{y}'
                self.g[y][x] = '~'
        assert all(self.g[bottom + 1][x] == '#' for x in range(a, z + 1)), f'{self.name}: Wasser ohne Grund {a}-{z}'

    def ladder(self, x, top, bottom=12):
        for y in range(top, bottom + 1):
            self.put(x, y, 'H')
        assert self.g[bottom + 1][x] in '#B', f'{self.name}: Leiter {x} steht nicht auf Boden'

    def row(self, x, y, s):
        for i, c in enumerate(s):
            self.put(x + i, y, c)

    # --- Objekte ---
    def put(self, x, y, c):
        assert self.g[y][x] in '.~' or (c == ':' and self.g[y][x] == '.'), f'{self.name}: {x},{y} ist schon {self.g[y][x]!r} (wollte {c!r})'
        if self.g[y][x] == '~':
            assert c in '*+', f'{self.name}: {c!r} im Wasser bei {x},{y}'
        self.g[y][x] = c

    def stars(self, x, y, n=1, c='*'):
        for k in range(n):
            self.put(x + k, y, c)

    def gate(self, x, y):
        assert all(self.g[r][x] == '.' for r in range(0, y)), f'{self.name}: Spalte über Tor {x} nicht frei'
        self.put(x, y, '?')

    def text(self):
        for c in 'FZ':
            n = sum(r.count(c) for r in self.g)
            assert n == 1, f'{self.name}: {c} kommt {n}× vor'
        return f'name: {self.name}\nthema: {self.thema}\n---\n' + '\n'.join(''.join(r) for r in self.g) + '\n'


def load(fn):
    head, body = open(os.path.join(OUT, fn), encoding='utf8').read().split('---\n')
    rows = body.strip('\n').split('\n')
    meta = dict(l.split(': ', 1) for l in head.strip().split('\n'))
    L = Level(len(rows[0]), meta['name'], meta['thema'])
    L.g = [list(r) for r in rows]
    return L


def save(L, fn):
    with open(os.path.join(OUT, fn), 'w', encoding='utf8') as f:
        f.write(L.text())
    print('geschrieben:', fn, f'({L.w} breit)')


# ---------- Welt 2: Abendhügel – versteckte Sterne ----------
L = load('abendhuegel.txt')
if not any('+' in r for r in L.g):
    L.put(0, 11, '+')    # links vom Start
    L.put(47, 4, '+')    # hinter den Sternen auf den Blöcken
save(L, 'abendhuegel.txt')

# ---------- Welt 3: Kletterwald – Leitern ----------
L = Level(120, 'Kletterwald', 'wald')
L.ground(0, 20); L.put(2, 12, 'F'); L.stars(5, 11, 3); L.put(12, 12, 'S')
L.ladder(20, 10)                       # kleine erste Leiter (3 hoch)
L.ground(21, 32, 10); L.stars(22, 9, 4); L.put(29, 9, 'S')
L.ground(33, 45); L.put(34, 12, 'C'); L.put(38, 12, 'K'); L.stars(40, 11, 3)
L.ladder(45, 6)                        # hoher Baum (7 hoch)
L.ground(46, 52, 6); L.stars(47, 5, 4); L.put(51, 3, '+')
L.ground(53, 72); L.stars(55, 11, 3); L.put(62, 12, 'S'); L.stars(66, 10, 3)
L.ground(75, 100); L.put(76, 12, 'C'); L.stars(79, 11, 3); L.gate(88, 12)
L.ladder(94, 7); L.row(95, 7, '-----'); L.stars(95, 6, 4); L.put(99, 6, '+')
L.ground(104, 119); L.put(106, 12, 'P'); L.stars(105, 5, 3); L.put(111, 12, 'S'); L.put(115, 12, 'Z')
save(L, 'kletterwald.txt')

# ---------- Welt 4: Sternennacht – waagrechte Plattform ----------
L = load('sternennacht.txt')
if not any('M' in r for r in L.g):
    for x in range(85, 88):
        L.g[11][x] = '.'                   # erstes Brett wird zur fahrenden Plattform
    L.row(85, 11, 'MMM'); L.put(84, 11, ':'); L.put(92, 11, ':')
    L.put(99, 5, '+')
save(L, 'sternennacht.txt')

# ---------- Welt 5: Seeufer – Wasser ----------
L = Level(130, 'Seeufer', 'see')
L.ground(0, 14, 11); L.put(2, 10, 'F'); L.stars(6, 10, 3)
L.ground(15, 24); L.water(15, 24, 11); L.stars(17, 12, 3)
L.ground(25, 34, 11); L.put(27, 10, 'C'); L.stars(30, 10, 3)
L.ground(35, 50, 14); L.water(35, 50, 11, 13); L.stars(38, 13, 3); L.put(47, 13, '+'); L.stars(42, 11, 2)
L.ground(51, 75, 11); L.put(53, 10, 'K'); L.put(58, 10, 'S'); L.put(62, 10, 'C'); L.gate(70, 10); L.stars(65, 10, 3)
L.ground(76, 100); L.water(76, 81, 11); L.ground(82, 84, 10); L.water(85, 89, 11); L.ground(90, 92, 10); L.water(93, 100, 11)
L.stars(82, 9, 3); L.stars(90, 9, 3); L.stars(95, 12, 3)
L.ground(101, 129, 11); L.put(103, 10, 'C'); L.put(106, 10, 'P'); L.stars(105, 3, 3); L.put(112, 10, 'S'); L.stars(116, 10, 3); L.put(124, 10, 'Z')
save(L, 'seeufer.txt')

# ---------- Welt 6: Wolkenland – fahrende Plattformen ----------
L = Level(130, 'Wolkenland', 'wolken')
L.ground(0, 12); L.put(2, 12, 'F'); L.stars(5, 11, 3)
L.row(13, 13, 'MM')                    # Lücke 13-20, Plattform auf Bodenhöhe
L.ground(21, 32); L.put(23, 12, 'C'); L.stars(25, 11, 3); L.put(29, 12, 'S')
L.row(35, 12, 'VV')                    # Aufzug zur hohen Wolke
L.ground(40, 50, 7); L.stars(41, 6, 2); L.put(44, 6, 'K'); L.put(48, 3, '+'); L.stars(46, 5, 2)
L.ground(55, 68); L.put(56, 12, 'C'); L.stars(58, 11, 3); L.gate(64, 12)
L.row(69, 13, 'MMM')                   # lange Brücke 69-79
L.ground(80, 95); L.put(81, 12, 'C'); L.put(88, 12, 'S'); L.put(92, 12, 'P'); L.stars(91, 4, 3); L.stars(83, 11, 3)
L.row(96, 13, 'MM')
L.ground(102, 129); L.put(103, 12, 'C'); L.stars(107, 11, 4); L.put(115, 12, 'S'); L.put(125, 12, 'Z')
save(L, 'wolkenland.txt')

# ---------- Welt 7: Bergpfad – alles gemischt ----------
L = Level(140, 'Bergpfad', 'berg')
L.ground(0, 16); L.put(2, 12, 'F'); L.stars(5, 11, 3); L.put(10, 12, 'S')
L.ladder(16, 9); L.ground(17, 30, 9); L.stars(18, 8, 3); L.put(25, 8, 'S'); L.put(28, 8, 'C')
L.ground(31, 44); L.water(31, 44, 11); L.stars(34, 12, 3); L.put(42, 12, '+')
L.ground(45, 58, 11); L.put(47, 10, 'C'); L.put(51, 10, 'K'); L.stars(54, 10, 3)
L.row(60, 10, 'VV')                    # Aufzug zum Gipfel
L.ground(64, 80, 5); L.stars(65, 4, 3); L.gate(74, 4); L.put(79, 1, '+'); L.put(68, 4, 'C')
L.ground(81, 95); L.ladder(81, 5); L.put(83, 12, 'C'); L.put(90, 12, 'S'); L.stars(86, 11, 3)
L.row(96, 13, 'MM')                    # Brücke 96-105
L.ground(106, 139); L.put(107, 12, 'C'); L.put(112, 12, 'P'); L.stars(111, 4, 3); L.put(120, 12, 'S'); L.stars(124, 11, 3); L.put(134, 12, 'Z')
save(L, 'bergpfad.txt')

# ---------- Welt 8: Regenbogenland – Finale ----------
L = Level(150, 'Regenbogenland', 'regenbogen')
L.ground(0, 15); L.put(2, 12, 'F'); L.stars(5, 11, 3)
L.ladder(15, 10); L.ground(16, 26, 10); L.put(20, 9, 'K'); L.stars(22, 9, 3)
L.ground(27, 38); L.water(27, 38, 10); L.stars(30, 12, 3); L.put(36, 12, '+')
L.ground(39, 48, 10); L.put(40, 9, 'C'); L.gate(45, 9); L.stars(42, 9, 2)
L.row(49, 10, 'MM')                    # Brücke 49-57 (unten nichts!)
L.ground(58, 72, 10); L.put(59, 9, 'C'); L.put(64, 9, 'S'); L.stars(66, 9, 3); L.put(70, 5, '+')
L.row(74, 9, 'VV')                     # Aufzug zum Regenbogen-Gipfel
L.ground(78, 90, 4); L.put(80, 3, 'C'); L.stars(82, 3, 3); L.gate(86, 3)
L.ground(91, 110, 11); L.ladder(91, 4, 10); L.put(93, 10, 'C'); L.put(98, 10, 'S'); L.put(104, 10, 'P'); L.stars(103, 2, 3); L.put(108, 10, 'K')
L.ground(111, 122); L.water(111, 122, 11); L.stars(113, 12, 3); L.put(120, 12, '+')
L.ground(123, 149, 11); L.put(124, 10, 'C'); L.stars(128, 10, 4); L.put(135, 10, 'S'); L.put(144, 10, 'Z')
save(L, 'regenbogenland.txt')
