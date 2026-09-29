#!/usr/bin/env python3
"""Prüft alle Level in levels/index.json auf Erreichbarkeit.

    python3 tools/check_levels.py

Grobe, eher vorsichtige Annahmen über Flinkis Bewegung:
  Sprung 4 Kacheln hoch (dann nur 2 weit), bis 3 hoch 4 weit, Sterne bis 4 über Flinki,
  Sprungpilz bis 8 hoch, Leitern hoch/runter, im Wasser überall hin,
  fahrende Plattformen: überall auf ihrer Bahn.
Meldet, wenn Ziel, Sterne, Kisten oder Tore nicht erreichbar sind.
"""
import json, os, sys
from collections import deque

ROWS = 15
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'levels')
SOLID = set('#B')


def parse(fn):
    head, body = open(os.path.join(D, fn), encoding='utf8').read().split('---\n')
    rows = [r.replace(' ', '.') for r in body.strip('\n').split('\n')]
    while len(rows) < ROWS:
        rows.insert(0, '')
    w = max(len(r) for r in rows)
    return [list(r.ljust(w, '.')) for r in rows[-ROWS:]], w


def check(fn):
    g, w = parse(fn)
    at = lambda x, y: '#' if x < 0 or x >= w else ('.' if y < 0 or y >= ROWS else g[y][x])
    free = lambda x, y: at(x, y) not in SOLID      # Tore gelten als lösbar → passierbar
    ladder = lambda x, y: at(x, y) == 'H'
    water = lambda x, y: at(x, y) == '~'

    # Plattform-Bahnen: Zellen, auf denen man stehen kann (Zeile über der Plattform)
    plat_stand = set()
    blocks = lambda c: c in '#B:?'
    for y in range(ROWS):
        x = 0
        while x < w:
            c = g[y][x]
            if c in 'MV':
                n = 1
                while x + n < w and g[y][x + n] == c:
                    n += 1
                if c == 'M':
                    a, b = x, x + n - 1
                    while x - a < 8 and not blocks(at(a - 1, y)): a -= 1
                    while b - (x + n - 1) < 8 and not blocks(at(b + 1, y)): b += 1
                    for xx in range(a, b + 1): plat_stand.add((xx, y - 1))
                else:
                    ok = lambda yy: all(not blocks(at(x + k, yy)) for k in range(n))
                    a, b = y, y
                    while y - a < 8 and a > 1 and ok(a - 1): a -= 1
                    while b - y < 8 and b < ROWS - 2 and ok(b + 1): b += 1
                    for yy in range(a, b + 1):
                        for k in range(n): plat_stand.add((x + k, yy - 1))
                x += n
            else:
                x += 1

    def stand(x, y):
        if not (0 <= x < w and 0 <= y < ROWS) or not free(x, y): return False
        if ladder(x, y) or water(x, y) or (x, y) in plat_stand: return True
        below = at(x, y + 1)
        return below in SOLID or below == '-' or (below == 'H' and at(x, y) != 'H')

    def fall(x, y):
        while y < ROWS and not stand(x, y):
            if not free(x, y): return None
            y += 1
        return (x, y) if y < ROWS else None

    start = next((x, y) for y in range(ROWS) for x in range(w) if g[y][x] == 'F')
    seen, q = {start}, deque([start])
    while q:
        x, y = q.popleft()
        nxt = []
        for dx in (-1, 1):  # gehen / runterfallen
            if free(x + dx, y): nxt.append(fall(x + dx, y))
        if ladder(x, y) or ladder(x, y + 1):  # Leiter
            nxt += [(x, y - 1) if free(x, y - 1) else None, (x, y + 1) if stand(x, y + 1) else None]
        if water(x, y):  # schwimmen
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if free(x + dx, y + dy): nxt.append(fall(x + dx, y + dy) if not water(x + dx, y + dy) else (x + dx, y + dy))
        surface = water(x, y) and not water(x, y - 1)
        up_max = 8 if any(at(x + k, y) == 'P' for k in (-1, 0, 1)) else 4
        if not water(x, y) or surface:
            for dy in range(-up_max, 9):  # Sprünge (dy<0 = nach oben)
                reach = (4 if dy >= -3 else 2) + (max(0, dy) // 2 if dy > 0 else 0)
                if dy < -4: reach = 3  # Sprungpilz
                for dx in range(-reach, reach + 1):
                    tx, ty = x + dx, y + dy
                    if (dx or dy) and stand(tx, ty):
                        # Kopffreiheit grob prüfen: Weg nach oben in Start- und Zielspalte frei
                        top = min(y, ty) - 1
                        if all(free(x, yy) for yy in range(top, y)) and all(free(tx, yy) for yy in range(top, ty)):
                            nxt.append((tx, ty))
        for n in nxt:
            if n and n not in seen:
                seen.add(n); q.append(n)

    problems = []
    # Pilz-Sprünge: alles bis 9 Kacheln über einem Pilz ist im Flug erreichbar
    shroom = {(x, y) for (x, y) in seen if any(at(x + k, y) == 'P' for k in (-1, 0, 1))}
    def reachable(ox, oy, up=3):
        if any((ox + dx, oy + dy) in seen for dx in (-1, 0, 1) for dy in range(0, up + 1)): return True
        return up > 0 and any((ox + dx, oy + dy) in shroom for dx in range(-2, 3) for dy in range(0, 10))
    for y in range(ROWS):
        for x in range(w):
            c = g[y][x]
            if c == 'Z' and (x, y) not in seen and not reachable(x, y, 0): problems.append(f'Ziel {x},{y}')
            if c in '*+' and not reachable(x, y, 4): problems.append(f'Stern {c} {x},{y}')
            if c in 'K?' and not reachable(x, y, 0): problems.append(f'{c} {x},{y}')
    stars = sum(r.count('*') + r.count('+') for r in g)
    extra = sum(r.count('?') + r.count('K') for r in g)
    print(f"{'OK ' if not problems else 'PROBLEM'} {fn:22} {w:4} breit, {stars:3} Sterne + {extra} Rätsel" + ('' if not problems else '\n   ' + '\n   '.join(problems)))
    return not problems


files = json.load(open(os.path.join(D, 'index.json')))
ok = all([check(f) for f in files])
sys.exit(0 if ok else 1)
