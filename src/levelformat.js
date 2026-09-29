/* ---------- Level-Format: Text-Map, ein Zeichen pro Kachel ----------
 *
 *   name: Sonnenwiese
 *   thema: wiese
 *   ---
 *   ....(15 Zeilen Karte)....
 *
 * Kacheln:  .  leer      #  Erde/Boden     B  Block     -  Brett (von unten durchspringbar)
 * Objekte:  F  Flinki (Start)   *  Stern   S  Schnecke   P  Sprungpilz
 *           C  Checkpoint       Z  Ziel
 * Objekte stehen auf dem Boden der Zelle, in der sie eingetragen sind (Stern: Zellmitte).
 */
import { T, ROWS } from './config.js';
import { THEMES } from './themes.js';

export const TILES = { '.': 'leer', '#': 'Erde', 'B': 'Block', '-': 'Brett' };
export const OBJECTS = { 'F': 'Start', '*': 'Stern', 'S': 'Schnecke', 'P': 'Sprungpilz', 'C': 'Checkpoint', 'Z': 'Ziel' };

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
      row.push(TILES[c] ? c : '.');
      switch (c) {
        case '*': L.ents.push({ t: 'star', x: x * T + T / 2, y: y * T + T / 2, got: false, ph: Math.random() * 6 }); break;
        case 'S': L.ents.push({ t: 'snail', x: x * T + 2, y: (y + 1) * T - 30, w: 44, h: 30, vx: -45, dead: 0 }); break;
        case 'P': L.ents.push({ t: 'shroom', x: x * T, y: (y + 1) * T - 34, w: 48, h: 34, sq: 0 }); break;
        case 'C': L.ents.push({ t: 'check', x: x * T + T / 2, y: (y + 1) * T, on: false }); break;
        case 'Z': L.ents.push({ t: 'goal', x: x * T + T / 2, y: (y + 1) * T }); break;
        case 'F': L.sx = x * T + 7; L.sy = (y + 1) * T - 42; break;
      }
    }
    L.g.push(row);
  }
  L.total = L.ents.filter(e => e.t === 'star').length;
  return L;
}
