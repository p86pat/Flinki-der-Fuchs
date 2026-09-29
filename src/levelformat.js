/* ---------- Level-Format: Text-Map, ein Zeichen pro Kachel ----------
 *
 *   name: Sonnenwiese
 *   thema: wiese
 *   ---
 *   ....(15 Zeilen Karte)....
 *
 * Kacheln:  .  leer      #  Erde/Boden     B  Block     -  Brett (von unten durchspringbar)
 *           H  Leiter    ~  Wasser (schwimmen)   :  Stopper für bewegliche Plattformen (unsichtbar)
 * Objekte:  F  Flinki (Start)   *  Stern   S  Schnecke   P  Sprungpilz
 *           C  Checkpoint       Z  Ziel
 *           ?  Rätsel-Tor (versperrt den Weg bis zur richtigen Antwort, gibt einen Bonus-Stern)
 *           K  Rätsel-Kiste (freiwillig, gibt einen Bonus-Stern)
 *           +  versteckter Stern (erscheint erst, wenn Flinki nahe ist)
 *           M  bewegliche Plattform waagrecht, V  senkrecht (MMM = 3 Kacheln breit).
 *              Sie fährt bis zu einer Wand, einem Stopper : oder höchstens 8 Kacheln weit.
 * Objekte stehen auf dem Boden der Zelle, in der sie eingetragen sind (Stern: Zellmitte).
 */
import { T, ROWS } from './config.js';
import { THEMES } from './themes.js';

export const TILES = { '.': 'leer', '#': 'Erde', 'B': 'Block', '-': 'Brett', 'H': 'Leiter', '~': 'Wasser', ':': 'Stopper' };
export const OBJECTS = { 'F': 'Start', '*': 'Stern', 'S': 'Schnecke', 'P': 'Sprungpilz', 'C': 'Checkpoint', 'Z': 'Ziel', '?': 'Rätsel-Tor', 'K': 'Rätsel-Kiste', '+': 'Versteckter Stern', 'M': 'Plattform ↔', 'V': 'Plattform ↕' };

// Text → Level-Definition { name, thema, rows[] } (+ Farben des Themas)
export function parseLevel(text, fallbackName = 'Level') {
  const lines = text.replace(/\r/g, '').split('\n');
  const meta = {}; let i = 0;
  const sep = lines.findIndex(l => l.trim() === '---');
  if (sep >= 0) {
    for (; i < sep; i++) { const m = lines[i].match(/^\s*([a-zäöü]+)\s*:\s*(.*)$/i); if (m) meta[m[1].toLowerCase()] = m[2].trim(); }
    i = sep + 1;
  }
  let rows = lines.slice(i).filter(l => l.trim() !== '').map(l => l.replace(/ /g, '.'));
  // Auf genau ROWS Zeilen bringen: oben mit Leerzeilen auffüllen, zu viele oben abschneiden
  while (rows.length < ROWS) rows.unshift('');
  rows = rows.slice(rows.length - ROWS);
  const w = Math.max(1, ...rows.map(r => r.length));
  rows = rows.map(r => r.padEnd(w, '.'));
  const thema = THEMES[meta.thema] ? meta.thema : 'wiese';
  return { ...THEMES[thema], name: meta.name || fallbackName, thema, rows };
}

// Level-Definition → Text (für den Editor/Export)
export function serializeLevel(def) {
  return `name: ${def.name}\nthema: ${def.thema}\n---\n${def.rows.join('\n')}\n`;
}

// Level-Definition → spielbarer Level-Zustand
export function buildLevel(def, idx) {
  const L = { g: [], ents: [], w: def.rows[0].length, def, idx, sx: 2 * T + 7, sy: 13 * T - 42 };
  for (let y = 0; y < ROWS; y++) {
    const row = [];
    for (let x = 0; x < L.w; x++) {
      const c = def.rows[y][x];
      row.push(TILES[c] && c !== ':' ? c : '.');
      switch (c) {
        case '*': L.ents.push({ t: 'star', x: x * T + T / 2, y: y * T + T / 2, got: false, ph: Math.random() * 6 }); break;
        case '+': L.ents.push({ t: 'star', hidden: true, seen: false, x: x * T + T / 2, y: y * T + T / 2, got: false, ph: Math.random() * 6 }); break;
        case 'S': L.ents.push({ t: 'snail', x: x * T + 2, y: (y + 1) * T - 30, w: 44, h: 30, vx: -45, dead: 0 }); break;
        case 'P': L.ents.push({ t: 'shroom', x: x * T, y: (y + 1) * T - 34, w: 48, h: 34, sq: 0 }); break;
        case 'C': L.ents.push({ t: 'check', x: x * T + T / 2, y: (y + 1) * T, on: false }); break;
        case 'Z': L.ents.push({ t: 'goal', x: x * T + T / 2, y: (y + 1) * T }); break;
        case '?': L.ents.push({ t: 'gate', x: x * T, y: (y + 1) * T, cy: y, open: false, openT: 0 }); break;
        case 'K': L.ents.push({ t: 'chest', x: x * T + 2, y: (y + 1) * T - 40, w: 44, h: 40, open: false, cool: false, openT: 0 }); break;
        case 'F': L.sx = x * T + 7; L.sy = (y + 1) * T - 42; break;
      }
    }
    L.g.push(row);
  }
  // Objekte unter Wasser (z. B. Sterne): Zelle bleibt Wasser, wenn darüber oder daneben Wasser ist
  for (let changed = true; changed;) {
    changed = false;
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < L.w; x++) {
      if (L.g[y][x] !== '.' || !OBJECTS[def.rows[y][x]]) continue;
      const wet = (y > 0 && L.g[y - 1][x] === '~') || (x > 0 && L.g[y][x - 1] === '~') || (x < L.w - 1 && L.g[y][x + 1] === '~');
      if (wet) { L.g[y][x] = '~'; changed = true; }
    }
  }
  // Bewegliche Plattformen: zusammenhängende M bzw. V in einer Zeile = eine Plattform
  const R = def.rows, at = (x, y) => (y < 0 || y >= ROWS || x < 0 || x >= L.w) ? '#' : R[y][x];
  const blocks = c => c === '#' || c === 'B' || c === ':' || c === '?';
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < L.w; x++) {
    const c = R[y][x]; if ((c !== 'M' && c !== 'V') || (x > 0 && R[y][x - 1] === c)) continue;
    let n = 1; while (R[y][x + n] === c) n++;
    const e = { t: 'plat', x: x * T, y: y * T, w: n * T, h: 17, dx: 0, dy: 0 };
    if (c === 'M') {
      let a = x, b = x + n - 1;
      while (x - a < 8 && !blocks(at(a - 1, y))) a--;
      while (b - (x + n - 1) < 8 && !blocks(at(b + 1, y))) b++;
      Object.assign(e, { vx: 80, vy: 0, minX: a * T, maxX: (b - n + 1) * T, minY: e.y, maxY: e.y });
    } else {
      const free = yy => [...Array(n)].every((_, k) => !blocks(at(x + k, yy)));
      let a = y, b = y;
      while (y - a < 8 && a > 1 && free(a - 1)) a--;
      while (b - y < 8 && b < ROWS - 2 && free(b + 1)) b++;
      Object.assign(e, { vx: 0, vy: -70, minX: e.x, maxX: e.x, minY: a * T, maxY: b * T });
    }
    L.ents.push(e);
  }
  // Rätsel-Tore: ganze Spalte über dem Tor ist fest ('G'), bis das Rätsel gelöst ist
  for (const e of L.ents) if (e.t === 'gate') for (let y = 0; y <= e.cy; y++) L.g[y][e.x / T] = 'G';
  L.total = L.ents.filter(e => e.t === 'star' || e.t === 'gate' || e.t === 'chest').length;
  return L;
}
