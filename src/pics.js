/* ---------- Selbst gezeichnete Bilder für die Rätsel ----------
 * drawPic(name, x, y, size): Bild in einem Kasten size×size um (x,y).
 * drawShape(key, x, y, r): Form für Muster-Rätsel, key = 'form:farbe'.
 */
import { ctx, el, rrect, starShape, cloud, drawFox } from './gfx.js';

function line(w, col, pts) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
function poly(col, pts) { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); }

const PICS = {
  apfel() {
    line(6, '#7a4a22', [[0, -30], [4, -46]]);
    ctx.save(); ctx.translate(16, -40); ctx.rotate(-.5); ctx.fillStyle = '#3ddc84'; el(0, 0, 14, 7); ctx.restore();
    ctx.fillStyle = '#ff4d4d'; el(-12, 6, 26, 32); el(12, 6, 26, 32);
    ctx.fillStyle = 'rgba(255,255,255,.45)'; el(-18, -6, 6, 10);
  },
  ball() {
    ctx.fillStyle = '#3d8bff'; el(0, 0, 40, 40);
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#ffe066'; ctx.fillRect(-40, -12, 80, 24);
    ctx.fillStyle = '#ff4d4d'; el(0, 0, 12, 40); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; el(-16, -20, 8, 6);
  },
  fisch() {
    poly('#ff8a2a', [[26, 0], [48, -22], [48, 22]]);
    ctx.fillStyle = '#ffb020'; el(-4, 0, 36, 24);
    poly('#ff8a2a', [[-6, -20], [8, -34], [14, -18]]);
    ctx.fillStyle = '#fff'; el(-22, -6, 7, 7); ctx.fillStyle = '#2a1a10'; el(-23, -6, 3.5, 3.5);
    ctx.strokeStyle = '#e07000'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(2, 0, 12, -1, 1); ctx.stroke();
  },
  sonne() {
    ctx.strokeStyle = '#ffb020'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 32, Math.sin(a) * 32); ctx.lineTo(Math.cos(a) * 46, Math.sin(a) * 46); ctx.stroke(); }
    ctx.fillStyle = '#ffd43b'; el(0, 0, 26, 26);
    ctx.fillStyle = '#2a1a10'; el(-8, -4, 3, 4); el(8, -4, 3, 4);
    ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 4, 9, .3, Math.PI - .3); ctx.stroke();
  },
  mond() {
    ctx.save(); ctx.beginPath(); ctx.rect(-60, -60, 120, 120); ctx.arc(18, -12, 32, 0, Math.PI * 2); ctx.clip('evenodd');
    ctx.fillStyle = '#ffe066'; el(0, 0, 40, 40); ctx.restore();
    ctx.fillStyle = '#2a1a10'; el(-18, -4, 3, 4);
  },
  haus() {
    ctx.fillStyle = '#ffe2b0'; ctx.fillRect(-34, -8, 68, 50);
    poly('#ff4d4d', [[-44, -6], [0, -46], [44, -6]]);
    ctx.fillStyle = '#9a5f34'; rrect(-10, 12, 20, 30, 4); ctx.fill();
    ctx.fillStyle = '#6ec3ff'; ctx.fillRect(14, 4, 14, 14); ctx.fillRect(-28, 4, 12, 14);
  },
  eis() {
    poly('#e8b27a', [[-22, -4], [22, -4], [0, 48]]);
    line(2, '#c98a4b', [[-14, 6], [6, 30]]); line(2, '#c98a4b', [[14, 6], [-6, 30]]);
    ctx.fillStyle = '#ff9ec7'; el(-10, -14, 16, 14); ctx.fillStyle = '#fff4e0'; el(10, -16, 16, 14);
    ctx.fillStyle = '#ffb3d6'; el(0, -30, 15, 13); ctx.fillStyle = '#ff4d4d'; el(0, -44, 6, 6);
  },
  herz() {
    ctx.fillStyle = '#ff4d8d'; ctx.beginPath(); ctx.moveTo(0, 38);
    ctx.bezierCurveTo(-60, -4, -30, -48, 0, -18); ctx.bezierCurveTo(30, -48, 60, -4, 0, 38); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)'; el(-20, -16, 7, 5);
  },
  pilz() {
    ctx.fillStyle = '#fff2dc'; rrect(-12, -4, 24, 40, 8); ctx.fill();
    ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.ellipse(0, -2, 42, 36, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; el(-20, -16, 7, 6); el(8, -26, 8, 7); el(24, -10, 5, 4);
  },
  wolke() { cloud(0, 6, .72, '#bcdcff'); cloud(0, 2, .66, '#e8f4ff'); },
  uhr() {
    ctx.fillStyle = '#3d8bff'; el(0, 0, 42, 42); ctx.fillStyle = '#fff'; el(0, 0, 34, 34);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.fillStyle = '#3a2560'; el(Math.cos(a) * 27, Math.sin(a) * 27, 2.5, 2.5); }
    line(5, '#3a2560', [[0, 0], [0, -22]]); line(5, '#ff4d4d', [[0, 0], [16, 8]]);
  },
  leiter() {
    line(7, '#9a5f34', [[-18, -46], [-18, 46]]); line(7, '#9a5f34', [[18, -46], [18, 46]]);
    for (let y = -34; y <= 34; y += 17) line(6, '#c98a4b', [[-18, y], [18, y]]);
  },
  zelt() {
    poly('#3ddc84', [[-46, 38], [0, -40], [46, 38]]);
    poly('#1f8a4c', [[-12, 38], [0, 6], [12, 38]]);
    line(4, '#7a4a22', [[0, -40], [0, -50]]); poly('#ff4d4d', [[0, -50], [16, -45], [0, -40]]);
  },
  fuchs() { ctx.save(); ctx.scale(1.35, 1.35); drawFox(0, 30, 1, .9, 0, false); ctx.restore(); },
  stern() { starShape(0, 0, 42, 0); },
  rakete() {
    poly('#ff8a2a', [[-10, 34], [0, 54], [10, 34]]);
    poly('#ff4d4d', [[-16, 10], [-30, 38], [-12, 32]]); poly('#ff4d4d', [[16, 10], [30, 38], [12, 32]]);
    ctx.fillStyle = '#e8eef8'; el(0, 0, 16, 38);
    poly('#ff4d4d', [[-14, -22], [0, -48], [14, -22]]);
    ctx.fillStyle = '#3d8bff'; el(0, -6, 8, 8); ctx.fillStyle = '#bfe0ff'; el(-2, -8, 3, 3);
  }
};

export function drawPic(name, x, y, size) {
  const f = PICS[name.toLowerCase()]; if (!f) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 100, size / 100); f(); ctx.restore();
}

export function drawShape(key, x, y, r) {
  const [shape, col] = key.split(':');
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.strokeStyle = 'rgba(35,20,60,.55)'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (shape === 'kreis') ctx.arc(0, 0, r, 0, Math.PI * 2);
  else if (shape === 'quadrat') rrect(-r * .88, -r * .88, r * 1.76, r * 1.76, r * .2);
  else if (shape === 'dreieck') { ctx.moveTo(0, -r); ctx.lineTo(r * 1.05, r * .8); ctx.lineTo(-r * 1.05, r * .8); ctx.closePath(); }
  if (shape === 'stern') { ctx.restore(); starShape(x, y, r * 1.1, 0, col, 'rgba(35,20,60,.55)'); return; }
  ctx.fill(); ctx.stroke(); ctx.restore();
}
