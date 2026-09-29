/* ---------- Kacheln & Kollision ---------- */
import { T, ROWS } from './config.js';
import { G } from './state.js';

export function tile(tx, ty) { if (ty < 0 || ty >= ROWS) return '.'; if (tx < 0 || tx >= G.lvl.w) return '#'; return G.lvl.g[ty][tx]; }
export const solid = c => c === '#' || c === 'b';

export function moveX(e, dx) {
  e.x += dx;
  const top = Math.floor(e.y / T), bot = Math.floor((e.y + e.h - .01) / T);
  if (dx > 0) { const tx = Math.floor((e.x + e.w - .01) / T); for (let ty = top; ty <= bot; ty++) if (solid(tile(tx, ty))) { e.x = tx * T - e.w; e.vx = 0; break; } }
  else if (dx < 0) { const tx = Math.floor(e.x / T); for (let ty = top; ty <= bot; ty++) if (solid(tile(tx, ty))) { e.x = (tx + 1) * T; e.vx = 0; break; } }
  e.x = Math.max(0, Math.min(G.lvl.w * T - e.w, e.x));
}

export function moveY(e, dy) {
  const oldBottom = e.y + e.h; e.y += dy; e.onGround = false;
  const l = Math.floor(e.x / T), r = Math.floor((e.x + e.w - .01) / T);
  if (dy > 0) {
    const ty = Math.floor((e.y + e.h - .01) / T);
    for (let tx = l; tx <= r; tx++) { const c = tile(tx, ty);
      if (solid(c) || (c === '-' && oldBottom <= ty * T + .5)) { e.y = ty * T - e.h; e.vy = 0; e.onGround = true; return; } }
  } else if (dy < 0) {
    const ty = Math.floor(e.y / T);
    for (let tx = l; tx <= r; tx++) if (solid(tile(tx, ty))) { e.y = (ty + 1) * T; e.vy = 0; return; }
  }
}

export const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
