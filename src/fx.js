/* ---------- Partikel & schwebende Texte ---------- */
import { G } from './state.js';

export function msg(t, x, y, col) { G.msgs.push({ t, x, y, life: 1.6, col: col || '#fff' }); }

export function burst(x, y, col, n, sp) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = (sp || 200) * (.4 + Math.random() * .8);
    G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 100, life: .6 + Math.random() * .4, col, r: 3 + Math.random() * 4 });
  }
}

export function updateFx(dt) {
  for (const p of G.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt; p.life -= dt; }
  G.parts = G.parts.filter(p => p.life > 0);
  for (const m of G.msgs) { m.y -= 40 * dt; m.life -= dt; }
  G.msgs = G.msgs.filter(m => m.life > 0);
}
