/* ---------- Zeichnen ---------- */
import { W, H, T, ROWS, FONT } from './config.js';
import { G, P } from './state.js';
import { LEVELS } from './levels.js';
import { tile, solid } from './physics.js';
import { padActive, isTouch } from './input.js';

const cv = document.getElementById('c'), ctx = cv.getContext('2d');
let scale = 1;

// Canvas an Fenster und devicePixelRatio anpassen (Letterboxing bei anderem Seitenverhältnis).
function fit() {
  const vw = document.body.clientWidth || innerWidth, vh = document.body.clientHeight || innerHeight;
  const s = Math.min(vw / W, vh / H), dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.style.width = Math.round(W * s) + 'px'; cv.style.height = Math.round(H * s) + 'px';
  cv.width = Math.round(W * s * dpr); cv.height = Math.round(H * s * dpr); scale = s * dpr;
}
addEventListener('resize', fit); addEventListener('orientationchange', () => setTimeout(fit, 200)); fit();

const SKYSTARS = []; for (let i = 0; i < 70; i++) SKYSTARS.push([Math.random() * W, Math.random() * 360, Math.random() * 6]);

function el(x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function txt(s, x, y, size, col, align) {
  ctx.font = `800 ${size}px ${FONT}`; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * .18; ctx.strokeStyle = 'rgba(35,20,60,.9)'; ctx.strokeText(s, x, y); ctx.fillStyle = col || '#fff'; ctx.fillText(s, x, y);
}
function starShape(x, y, r, rot, fill, stroke) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .5 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = fill || '#ffd43b'; ctx.fill(); ctx.lineWidth = r * .16; ctx.strokeStyle = stroke || '#e89b00'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
function cloud(x, y, s, col) { ctx.fillStyle = col; el(x, y, 50 * s, 28 * s); el(x + 40 * s, y + 6 * s, 40 * s, 24 * s); el(x - 40 * s, y + 8 * s, 36 * s, 20 * s); el(x + 8 * s, y - 18 * s, 34 * s, 24 * s); }
function hills(f, base, amp, col, freq) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W + 16; x += 16) { const wx = x + G.cam * f; ctx.lineTo(x, base - Math.sin(wx * freq) * amp - Math.sin(wx * freq * 2.3 + 1) * amp * .45); }
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
}
function drawBG(d) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, d.sky[0]); g.addColorStop(1, d.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (d.night) { ctx.fillStyle = '#fff'; for (const s of SKYSTARS) { ctx.globalAlpha = .45 + .45 * Math.sin(G.time * 2 + s[2]); ctx.fillRect(s[0], s[1], 3, 3); } ctx.globalAlpha = 1; }
  ctx.fillStyle = d.sun; ctx.globalAlpha = .35; el(d.sunX, d.sunY, d.sunR * 1.35, d.sunR * 1.35); ctx.globalAlpha = 1; el(d.sunX, d.sunY, d.sunR, d.sunR);
  if (d.night) { ctx.fillStyle = d.sky[0]; el(d.sunX + 18, d.sunY - 10, d.sunR * .85, d.sunR * .85); }
  for (let i = 0; i < 6; i++) { const span = W + 320; const x = (((i * 290 - G.cam * .15) % span) + span) % span - 160; cloud(x, 70 + (i * 53) % 130, .75 + (i % 3) * .22, d.cloud); }
  hills(.25, 470, 45, d.far, .0042);
  hills(.5, 560, 35, d.near, .0071);
}
function drawTiles(d) {
  const lvl = G.lvl;
  const x0 = Math.max(0, Math.floor(G.cam / T)), x1 = Math.min(lvl.w - 1, x0 + Math.ceil(W / T) + 1);
  for (let y = 0; y < ROWS; y++) for (let x = x0; x <= x1; x++) {
    const c = lvl.g[y][x], px = x * T, py = y * T;
    if (c === '#') {
      ctx.fillStyle = d.dirt; ctx.fillRect(px, py, T + 1, T + 1);
      if ((x * 7 + y * 13) % 5 === 0) { ctx.fillStyle = d.dirt2; el(px + 16, py + 30, 5, 4); el(px + 34, py + 18, 3, 3); }
      if (!solid(tile(x, y - 1))) {
        ctx.fillStyle = d.grass; ctx.fillRect(px, py, T + 1, 13);
        for (let k = 0; k < 3; k++) el(px + 8 + k * 16, py + 13, 8, 6);
        ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(px, py, T + 1, 4);
      }
    } else if (c === 'b') {
      rrect(px + 2, py + 2, T - 4, T - 4, 9); ctx.fillStyle = '#ffc93c'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#d98a00'; ctx.stroke();
      ctx.fillStyle = '#e8a400'; el(px + 16, py + 18, 4, 4); el(px + 32, py + 30, 4, 4); el(px + 30, py + 14, 3, 3);
    } else if (c === '-') {
      rrect(px, py, T + 1, 17, 5); ctx.fillStyle = '#c98a4b'; ctx.fill();
      ctx.fillStyle = '#8a5a2b'; ctx.fillRect(px, py + 12, T + 1, 5);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(px + 4, py + 3, T - 8, 3);
    }
  }
}
function drawFox(x, y, face, t, sq, walking) {
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
function drawSnail(e) {
  const dir = e.vx < 0 ? -1 : 1;
  ctx.save(); ctx.translate(e.x + e.w / 2, e.y + e.h); ctx.scale(dir, e.dead > 0 ? .35 : 1);
  ctx.fillStyle = '#ffd27a'; el(3, -7, 23, 7); el(18, -13, 8, 10);
  ctx.strokeStyle = '#e0a94a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(18, -20); ctx.lineTo(20, -31); ctx.moveTo(23, -19); ctx.lineTo(28, -29); ctx.stroke();
  ctx.fillStyle = '#2a1a10'; el(20, -32, 3, 3); el(28, -30, 3, 3);
  ctx.fillStyle = '#e0508a'; el(-5, -17, 15, 15);
  ctx.strokeStyle = '#a8305e'; ctx.lineWidth = 3; ctx.beginPath();
  for (let a = 0; a < Math.PI * 4; a += .3) { const r = 2 + a * 1.0; ctx.lineTo(-5 + Math.cos(a) * r, -17 + Math.sin(a) * r); } ctx.stroke();
  ctx.restore();
}
function drawShroom(e) {
  const s = e.sq > 0 ? Math.sin(e.sq * 25) * .18 : 0;
  ctx.save(); ctx.translate(e.x + 24, e.y + 34); ctx.scale(1 + s, 1 - s);
  rrect(-10, -20, 20, 20, 5); ctx.fillStyle = '#fff2dc'; ctx.fill();
  ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.ellipse(0, -18, 28, 20, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; el(-12, -26, 5, 4); el(6, -31, 6, 5); el(15, -22, 4, 3);
  ctx.restore();
}
function drawEnts() {
  const time = G.time;
  for (const e of G.lvl.ents) {
    if (e.x < G.cam - 100 || e.x > G.cam + W + 100) continue;
    if (e.t === 'star' && !e.got) starShape(e.x, e.y + Math.sin(time * 3 + e.ph) * 4, 17, Math.sin(time * 2 + e.ph) * .2);
    else if (e.t === 'snail' && e.dead >= 0) drawSnail(e);
    else if (e.t === 'shroom') drawShroom(e);
    else if (e.t === 'check') {
      ctx.fillStyle = '#6b6b7a'; ctx.fillRect(e.x - 3, e.y - 100, 6, 100); el(e.x, e.y - 100, 6, 6);
      ctx.fillStyle = e.on ? '#3ddc84' : '#d7d7e0'; ctx.beginPath(); ctx.moveTo(e.x + 3, e.y - 96); ctx.lineTo(e.x + 46, e.y - 82 + Math.sin(time * 4) * 3); ctx.lineTo(e.x + 3, e.y - 66); ctx.fill();
    } else if (e.t === 'goal') {
      ctx.fillStyle = '#55556a'; ctx.fillRect(e.x - 4, e.y - 230, 8, 230);
      rrect(e.x - 26, e.y - 14, 52, 14, 5); ctx.fill();
      ctx.fillStyle = '#ff4d8d'; ctx.beginPath(); ctx.moveTo(e.x + 4, e.y - 224);
      for (let k = 0; k <= 10; k++) ctx.lineTo(e.x + 4 + k * 9, e.y - 224 + Math.sin(time * 5 + k * .6) * 5 + k * .6);
      for (let k = 10; k >= 0; k--) ctx.lineTo(e.x + 4 + k * 9, e.y - 164 + Math.sin(time * 5 + k * .6) * 5 - k * .6);
      ctx.fill();
      starShape(e.x + 46, e.y - 194 + Math.sin(time * 5 + 2.5) * 5, 14, 0, '#fff', '#ffd0e2');
      starShape(e.x, e.y - 240, 16, time, '#ffd43b');
    }
  }
}
function drawPlayer() {
  if (P.inv > 0 && Math.floor(P.inv * 12) % 2 === 0) return;
  drawFox(P.x + P.w / 2, P.y + P.h, P.face, G.time, P.sq, P.onGround && Math.abs(P.vx) > 30);
}
function drawFx() {
  for (const p of G.parts) { ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2)); ctx.fillStyle = p.col; el(p.x, p.y, p.r, p.r); } ctx.globalAlpha = 1;
  for (const m of G.msgs) { ctx.globalAlpha = Math.min(1, m.life * 2); txt(m.t, m.x, m.y, 34, m.col); } ctx.globalAlpha = 1;
}
function drawHUD() {
  rrect(20, 18, 250, 64, 20); ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fill();
  starShape(56, 50, 20, 0);
  ctx.font = `800 38px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a2560';
  ctx.fillText(`${G.starsGot} / ${G.lvl.total}`, 88, 52);
  const lbl = `Welt ${G.levelIdx + 1}`;
  rrect(W - 190, 18, 170, 64, 20); ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fill();
  ctx.textAlign = 'center'; ctx.fillStyle = '#3a2560'; ctx.fillText(lbl, W - 105, 52);
}
function panel(h) { rrect(W / 2 - 360, H / 2 - h / 2, 720, h, 36); ctx.fillStyle = 'rgba(40,25,80,.72)'; ctx.fill(); }
function hint() {
  if (padActive) return 'Drück A';
  return isTouch ? 'Tippe auf den Bildschirm' : 'Drück die Leertaste';
}
function drawTitle() {
  const time = G.time;
  G.cam = time * 60; drawBG(LEVELS[0]);
  ctx.fillStyle = LEVELS[0].grass; ctx.fillRect(0, H - 96, W, 96); ctx.fillStyle = LEVELS[0].dirt; ctx.fillRect(0, H - 83, W, 83);
  const by = H - 96 - Math.abs(Math.sin(time * 3)) * 70;
  drawFox(W / 2, by, 1, time, 0, false);
  for (let i = 0; i < 5; i++) starShape(W / 2 - 240 + i * 120, 200 + Math.sin(time * 3 + i) * 10, 22, Math.sin(time + i) * .3);
  txt('Flinki der Fuchs', W / 2, 300, 104, '#ffe066');
  txt('Sammle Sterne und hüpf bis zur Fahne!', W / 2, 385, 40, '#fff');
  if (Math.sin(time * 5) > -.3) txt(hint() + ' zum Starten', W / 2, 470, 44, '#b6ffcf');
  txt(padActive ? 'Controller verbunden' : 'Controller? Einmal eine Taste drücken', W / 2, H - 40, 28, '#fff');
}
function drawDone() {
  panel(330);
  const r = G.run[G.levelIdx], last = G.levelIdx === LEVELS.length - 1;
  txt(last ? 'Geschafft!' : 'Super gemacht!', W / 2, H / 2 - 100, 76, '#ffe066');
  starShape(W / 2 - 90, H / 2 + 5, 34, 0);
  ctx.font = `800 56px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
  ctx.fillText(`${r.got} / ${r.total}`, W / 2 - 40, H / 2 + 8);
  if (G.doneT > .8 && Math.sin(G.time * 5) > -.3) txt(hint() + (!last ? ' für die nächste Welt' : ''), W / 2, H / 2 + 110, 36, '#b6ffcf');
}
function drawWin() {
  const time = G.time;
  drawBG(LEVELS[2]);
  let g = 0, t = 0; G.run.forEach(r => { if (r) { g += r.got; t += r.total; } });
  panel(420);
  txt('Du bist ein Hüpf-Profi!', W / 2, H / 2 - 130, 70, '#ffe066');
  drawFox(W / 2, H / 2 + 30 - Math.abs(Math.sin(time * 4)) * 30, 1, time, 0, false);
  starShape(W / 2 - 90, H / 2 + 90, 30, 0);
  ctx.font = `800 50px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(`${g} / ${t} Sterne`, W / 2 - 50, H / 2 + 93);
  if (Math.sin(time * 5) > -.3) txt(hint() + ' zum Nochmal-Spielen', W / 2, H / 2 + 170, 34, '#b6ffcf');
  drawFx();
}

export function draw() {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  if (G.state === 'title') { drawTitle(); return; }
  if (G.state === 'win') { drawWin(); return; }
  const d = G.lvl.def;
  drawBG(d);
  ctx.save(); ctx.translate(-Math.round(G.cam), 0);
  drawTiles(d); drawEnts(); drawPlayer(); drawFx();
  ctx.restore();
  drawHUD();
  if (G.state === 'pause') { panel(240); txt('Pause', W / 2, H / 2 - 40, 84, '#ffe066'); txt(hint() + ' zum Weiterspielen', W / 2, H / 2 + 50, 36, '#fff'); }
  if (G.state === 'done') drawDone();
}
