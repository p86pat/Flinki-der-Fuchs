/* ---------- Gemeinsame Layouts für Menüs (Zeichnen + Antippen) ---------- */
import { W, H } from './config.js';

export const NODE_R = 50;

// Positionen der Welt-Knoten auf der Karte (Zickzack, passt für 1–10 Welten)
export function mapNodes(n) {
  const x0 = 150, x1 = W - 150, pts = [];
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? W / 2 : x0 + (x1 - x0) * i / (n - 1);
    pts.push({ x, y: i % 2 ? 470 : 340 });
  }
  return pts;
}

// Pause-Menü: [weiter, zur Karte]
export const PAUSE_BTNS = [
  { x: W / 2 - 190, y: H / 2 - 20, w: 170, h: 140 },
  { x: W / 2 + 20, y: H / 2 - 20, w: 170, h: 140 }
];

export const hit = (p, r) => p && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
export const hitCircle = (p, c, r) => p && (p.x - c.x) ** 2 + (p.y - c.y) ** 2 <= r * r;
