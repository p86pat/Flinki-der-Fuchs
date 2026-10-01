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
  banane() {
    ctx.fillStyle = '#ffd43b'; ctx.beginPath(); ctx.moveTo(-40, -20);
    ctx.quadraticCurveTo(-30, 36, 40, 24); ctx.quadraticCurveTo(-8, 18, -30, -26); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e0a800'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#7a4a22'; el(-36, -24, 5, 5); el(40, 24, 4, 3);
  },
  tomate() {
    ctx.fillStyle = '#ff3b3b'; el(0, 6, 40, 34);
    ctx.fillStyle = 'rgba(255,255,255,.45)'; el(-16, -6, 8, 6);
    ctx.fillStyle = '#2fa84f'; for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(0, -26); ctx.rotate(i * 1.25); el(10, 0, 12, 4); ctx.restore(); }
    line(4, '#2fa84f', [[0, -26], [2, -38]]);
  },
  blume() {
    line(6, '#2fa84f', [[0, 0], [0, 48]]); ctx.save(); ctx.translate(12, 32); ctx.rotate(-.6); ctx.fillStyle = '#3ddc84'; el(0, 0, 12, 5); ctx.restore();
    ctx.fillStyle = '#ff7ab8'; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; el(Math.cos(a) * 18, -10 + Math.sin(a) * 18, 12, 12); }
    ctx.fillStyle = '#ffd43b'; el(0, -10, 11, 11);
  },
  auto() {
    ctx.fillStyle = '#3d8bff'; rrect(-46, -4, 92, 30, 10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-26, -4); ctx.lineTo(-14, -28); ctx.lineTo(18, -28); ctx.lineTo(32, -4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#cfe8ff'; ctx.beginPath(); ctx.moveTo(-18, -7); ctx.lineTo(-10, -23); ctx.lineTo(0, -23); ctx.lineTo(0, -7); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(5, -7); ctx.lineTo(5, -23); ctx.lineTo(15, -23); ctx.lineTo(25, -7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a1a10'; el(-24, 26, 11, 11); el(24, 26, 11, 11); ctx.fillStyle = '#bbb'; el(-24, 26, 4, 4); el(24, 26, 4, 4);
    ctx.fillStyle = '#ffe066'; el(42, 6, 4, 4);
  },
  maus() {
    ctx.strokeStyle = '#b0a8b9'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(30, 18); ctx.quadraticCurveTo(54, 20, 48, 40); ctx.stroke();
    ctx.fillStyle = '#b0a8b9'; el(4, 16, 32, 22);
    ctx.fillStyle = '#b0a8b9'; el(-22, -14, 13, 13); el(4, -18, 13, 13); ctx.fillStyle = '#ffb3c7'; el(-22, -14, 7, 7); el(4, -18, 7, 7);
    ctx.fillStyle = '#b0a8b9'; el(-24, 8, 16, 14);
    ctx.fillStyle = '#2a1a10'; el(-28, 4, 3, 3.5); el(-38, 10, 4, 3.5);
    line(1.5, '#6b6b7a', [[-36, 12], [-50, 8]]); line(1.5, '#6b6b7a', [[-36, 14], [-50, 18]]);
  },
  tisch() {
    ctx.fillStyle = '#c98a4b'; rrect(-46, -14, 92, 14, 4); ctx.fill();
    ctx.fillStyle = '#9a5f34'; ctx.fillRect(-40, 0, 9, 40); ctx.fillRect(31, 0, 9, 40);
    ctx.fillStyle = '#ffd43b'; el(-10, -24, 9, 9); ctx.fillStyle = '#ff4d4d'; el(14, -22, 7, 7);
  },
  rose() {
    line(6, '#2fa84f', [[0, 0], [0, 48]]); ctx.save(); ctx.translate(-12, 26); ctx.rotate(.6); ctx.fillStyle = '#3ddc84'; el(0, 0, 12, 5); ctx.restore();
    ctx.fillStyle = '#e8304e'; el(0, -14, 24, 20); ctx.fillStyle = '#ff5c78'; el(-6, -18, 13, 11); el(8, -12, 11, 10);
    ctx.strokeStyle = '#b01e3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -14, 8, 0, 4.5); ctx.stroke();
  },
  hose() {
    ctx.fillStyle = '#3d8bff'; ctx.beginPath(); ctx.moveTo(-30, -40); ctx.lineTo(30, -40); ctx.lineTo(34, 44); ctx.lineTo(8, 44); ctx.lineTo(0, -6); ctx.lineTo(-8, 44); ctx.lineTo(-34, 44); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2f6fd0'; ctx.fillRect(-30, -40, 60, 10); ctx.fillStyle = '#ffd43b'; el(0, -35, 4, 4);
  },
  tanne() {
    ctx.fillStyle = '#7a5230'; ctx.fillRect(-7, 30, 14, 18);
    ctx.fillStyle = '#2f9e44'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(0, -48 + k * 22); ctx.lineTo(-36 + k * 2, 0 + k * 16); ctx.lineTo(36 - k * 2, 0 + k * 16); ctx.closePath(); ctx.fill(); }
  },
  kanne() {
    ctx.strokeStyle = '#3d8bff'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(30, 0, 16, -1.4, 1.4); ctx.stroke();
    ctx.fillStyle = '#3d8bff'; ctx.beginPath(); ctx.moveTo(-26, -30); ctx.lineTo(26, -30); ctx.lineTo(32, 40); ctx.lineTo(-32, 40); ctx.closePath(); ctx.fill();
    poly('#3d8bff', [[-26, -24], [-50, -36], [-46, -28], [-28, -12]]);
    ctx.fillStyle = '#2f6fd0'; ctx.fillRect(-28, -36, 56, 8); ctx.fillStyle = '#fff'; el(0, 6, 8, 8);
  },
  geld() {
    for (let k = 0; k < 4; k++) { ctx.fillStyle = '#c9a43a'; el(-14, 34 - k * 10, 26, 8); ctx.fillStyle = '#e8c45a'; el(-14, 31 - k * 10, 26, 8); }
    ctx.fillStyle = '#c9a43a'; el(20, 20, 24, 24); ctx.fillStyle = '#e8c45a'; el(20, 18, 22, 22);
    ctx.fillStyle = '#9a7a20'; ctx.font = "800 22px 'Baloo 2',sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Fr', 20, 20);
  },
  kreis() { ctx.strokeStyle = '#3d8bff'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.stroke(); },
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

// Schweizer Münze (Wert in Rappen)
const COIN = { 500: [44, '#d9dde3', '5', 'Fr.'], 200: [38, '#d9dde3', '2', 'Fr.'], 100: [32, '#d9dde3', '1', 'Fr.'], 50: [25, '#d9dde3', '½', 'Fr.'], 20: [29, '#e3e6ea', '20', 'Rp.'], 10: [27, '#e3e6ea', '10', 'Rp.'], 5: [24, '#e8c45a', '5', 'Rp.'] };
export function drawCoin(v, x, y, k = 1) {
  const [r0, col, big, small] = COIN[v], r = r0 * k;
  ctx.fillStyle = 'rgba(40,25,20,.2)'; el(x + 2, y + 3, r, r);
  ctx.fillStyle = col; el(x, y, r, r);
  ctx.strokeStyle = 'rgba(80,80,100,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r - 4, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#4a4a5a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `800 ${Math.round(r * .8)}px 'Baloo 2',sans-serif`; ctx.fillText(big, x, y - r * .12);
  ctx.font = `800 ${Math.round(r * .36)}px 'Baloo 2',sans-serif`; ctx.fillText(small, x, y + r * .5);
}

// Zeigeruhr
export function drawClock(h, m, x, y, r) {
  ctx.fillStyle = '#3d8bff'; el(x, y, r, r); ctx.fillStyle = '#fff'; el(x, y, r * .86, r * .86);
  ctx.fillStyle = '#3a2560'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `800 ${Math.round(r * .2)}px 'Baloo 2',sans-serif`;
  for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6 - Math.PI / 2; ctx.fillText(String(i), x + Math.cos(a) * r * .68, y + Math.sin(a) * r * .68 + 2); }
  for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30; if (i % 5) { ctx.fillStyle = '#b8b0cc'; el(x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8, 1.6, 1.6); } }
  const ha = ((h % 12) + m / 60) * Math.PI / 6 - Math.PI / 2, ma = m * Math.PI / 30 - Math.PI / 2;
  line(r * .09, '#3a2560', [[x, y], [x + Math.cos(ha) * r * .42, y + Math.sin(ha) * r * .42]]);  // kurzer Stundenzeiger
  line(r * .055, '#ff4d4d', [[x, y], [x + Math.cos(ma) * r * .66, y + Math.sin(ma) * r * .66]]); // langer Minutenzeiger
  ctx.fillStyle = '#3a2560'; el(x, y, r * .06, r * .06);
}
