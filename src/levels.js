/* ---------- Levels ---------- */
import { T, ROWS } from './config.js';
import welt1 from '../levels/welt1.js';
import welt2 from '../levels/welt2.js';
import welt3 from '../levels/welt3.js';

export const LEVELS = [welt1, welt2, welt3];

export function makeLevel(i) {
  const def = LEVELS[i], L = { g: [], ents: [], w: 0, def, idx: i, sx: 0, sy: 0 };
  const b = {
    init(w) { L.w = w; for (let r = 0; r < ROWS; r++) L.g.push(new Array(w).fill('.')); },
    ground(a, z, top = 13) { for (let x = a; x <= z; x++) for (let y = top; y < ROWS; y++) L.g[y][x] = '#'; },
    block(x, y, n = 1) { for (let k = 0; k < n; k++) L.g[y][x + k] = 'b'; },
    plank(x, y, n) { for (let k = 0; k < n; k++) L.g[y][x + k] = '-'; },
    stars(x, y, n = 1) { for (let k = 0; k < n; k++) L.ents.push({ t: 'star', x: (x + k) * T + T / 2, y: y * T + T / 2, got: false, ph: Math.random() * 6 }); },
    snail(x, y = 12) { L.ents.push({ t: 'snail', x: x * T + 2, y: (y + 1) * T - 30, w: 44, h: 30, vx: -45, dead: 0 }); },
    shroom(x, y = 12) { L.ents.push({ t: 'shroom', x: x * T, y: (y + 1) * T - 34, w: 48, h: 34, sq: 0 }); },
    check(x, y = 12) { L.ents.push({ t: 'check', x: x * T + T / 2, y: (y + 1) * T, on: false }); },
    goal(x, y = 12) { L.ents.push({ t: 'goal', x: x * T + T / 2, y: (y + 1) * T }); },
    start(x, y = 12) { L.sx = x * T + 7; L.sy = (y + 1) * T - 42; }
  };
  def.build(b);
  L.total = L.ents.filter(e => e.t === 'star').length;
  return L;
}
