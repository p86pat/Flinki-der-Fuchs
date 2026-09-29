/* ---------- Canvas & Zeichen-Grundfunktionen (von render.js und quizdraw.js genutzt) ---------- */
import { W, H, FONT } from './config.js';

export const cv = document.getElementById('c'), ctx = cv.getContext('2d');
export let scale = 1;

// Canvas an Fenster und devicePixelRatio anpassen (Letterboxing bei anderem Seitenverhältnis).
function fit() {
  const vw = document.body.clientWidth || innerWidth, vh = document.body.clientHeight || innerHeight;
  const s = Math.min(vw / W, vh / H), dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.style.width = Math.round(W * s) + 'px'; cv.style.height = Math.round(H * s) + 'px';
  cv.width = Math.round(W * s * dpr); cv.height = Math.round(H * s * dpr); scale = s * dpr;
}
addEventListener('resize', fit); addEventListener('orientationchange', () => setTimeout(fit, 200)); fit();

export function el(x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
export function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
export function txt(s, x, y, size, col, align) {
  ctx.font = `800 ${size}px ${FONT}`; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * .18; ctx.strokeStyle = 'rgba(35,20,60,.9)'; ctx.strokeText(s, x, y); ctx.fillStyle = col || '#fff'; ctx.fillText(s, x, y);
}
export function starShape(x, y, r, rot, fill, stroke) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .5 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = fill || '#ffd43b'; ctx.fill(); ctx.lineWidth = r * .16; ctx.strokeStyle = stroke || '#e89b00'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
export function cloud(x, y, s, col) { ctx.fillStyle = col; el(x, y, 50 * s, 28 * s); el(x + 40 * s, y + 6 * s, 40 * s, 24 * s); el(x - 40 * s, y + 8 * s, 36 * s, 20 * s); el(x + 8 * s, y - 18 * s, 34 * s, 24 * s); }
export function drawFox(x, y, face, t, sq, walking) {
  ctx.save(); ctx.translate(x, y); ctx.scale(face * (1 + sq), 1 - sq);
  const wag = Math.sin(t * 7) * .3;
  ctx.save(); ctx.translate(-14, -16); ctx.rotate(-.5 + wag);
  ctx.fillStyle = '#ff8a2a'; el(-13, 0, 17, 9); ctx.fillStyle = '#fff'; el(-26, 0, 7, 6); ctx.restore();
  const st = walking ? Math.sin(t * 18) * 6 : 0;
  ctx.fillStyle = '#5a2d0c'; el(-7 + st, -3, 8, 4.5); el(8 - st, -3, 8, 4.5);
  ctx.fillStyle = '#ff8a2a';
  ctx.beginPath(); ctx.moveTo(-14, -34); ctx.lineTo(-10, -56); ctx.lineTo(-1, -38); ctx.fill();
  ctx.beginPath(); ctx.moveTo(2, -38); ctx.lineTo(10, -57); ctx.lineTo(15, -33); ctx.fill();
  ctx.fillStyle = '#5a2d0c';
  ctx.beginPath(); ctx.moveTo(-10, -38); ctx.lineTo(-9, -50); ctx.lineTo(-4, -39); ctx.fill();
  ctx.beginPath(); ctx.moveTo(5, -39); ctx.lineTo(10, -51); ctx.lineTo(12, -37); ctx.fill();
  ctx.fillStyle = '#ff8a2a'; el(0, -22, 19, 21);
  ctx.fillStyle = '#fff3e6'; el(5, -14, 11, 10); el(12, -24, 9, 7);
  ctx.fillStyle = '#fff'; el(4, -29, 5, 6); el(13, -29, 4.5, 6);
  ctx.fillStyle = '#2a1a10'; el(5.5, -28, 2.8, 3.8); el(14, -28, 2.6, 3.8);
  ctx.fillStyle = '#fff'; el(6.5, -30, 1.1, 1.3); el(15, -30, 1, 1.3);
  ctx.fillStyle = '#2a1a10'; el(20, -23, 3, 2.4);
  ctx.fillStyle = 'rgba(255,110,140,.55)'; el(-2, -21, 4, 2.5);
  ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(14, -20, 3, .2, Math.PI - .4); ctx.stroke();
  ctx.restore();
}
