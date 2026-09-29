/* ---------- Zeichnen ---------- */
import { W, H, T, ROWS, FONT } from './config.js';
import { G, P } from './state.js';
import { LEVELS } from './levels.js';
import { tile, solid } from './physics.js';
import { padActive, isTouch } from './input.js';
import { THEMES } from './themes.js';
import { best, isUnlocked } from './save.js';
import { mapNodes, NODE_R, PAUSE_BTNS } from './ui.js';
import { drawQuiz } from './quizdraw.js';
import { ctx, scale, el, rrect, txt, starShape, cloud, drawFox } from './gfx.js';

const SKYSTARS = []; for (let i = 0; i < 70; i++) SKYSTARS.push([Math.random() * W, Math.random() * 360, Math.random() * 6]);

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
  if (d.rainbow) { // Regenbogen im Hintergrund
    ['#ff5b5b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa'].forEach((c, i) => { ctx.strokeStyle = c; ctx.globalAlpha = .55; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(640 - G.cam * .05, 620, 420 - i * 16, Math.PI, 0); ctx.stroke(); });
    ctx.globalAlpha = 1;
  }
  hills(.25, 470, 45, d.far, .0042);
  hills(.5, 560, 35, d.near, .0071);
  if (d.trees) for (let i = 0; i < 9; i++) { // Tannen im Wald
    const span = W + 200, x = (((i * 173 - G.cam * .5) % span) + span) % span - 100, h = 120 + (i * 37) % 60;
    ctx.fillStyle = '#6b4a2b'; ctx.fillRect(x - 6, 560 - 20, 12, 40);
    ctx.fillStyle = '#2f7d3f'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x, 540 - h + k * 30); ctx.lineTo(x - 40 + k * 4, 560 - h * .35 + k * 22); ctx.lineTo(x + 40 - k * 4, 560 - h * .35 + k * 22); ctx.fill(); }
  }
}
function drawTiles(d) {
  const lvl = G.lvl;
  const x0 = Math.max(0, Math.floor(G.cam / T)), x1 = Math.min(lvl.w - 1, x0 + Math.ceil(W / T) + 1);
  for (let y = 0; y < ROWS; y++) for (let x = x0; x <= x1; x++) {
    const c = lvl.g[y][x], px = x * T, py = y * T;
    if (c === '#') {
      ctx.fillStyle = d.dirt; ctx.fillRect(px, py, T + 1, T + 1);
      if ((x * 7 + y * 13) % 5 === 0) { ctx.fillStyle = d.dirt2; el(px + 16, py + 30, 5, 4); el(px + 34, py + 18, 3, 3); }
      if (!solid(tile(x, y - 1)) || tile(x, y - 1) === 'G') {
        ctx.fillStyle = d.grass; ctx.fillRect(px, py, T + 1, 13);
        for (let k = 0; k < 3; k++) el(px + 8 + k * 16, py + 13, 8, 6);
        ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(px, py, T + 1, 4);
      }
    } else if (c === 'B') {
      rrect(px + 2, py + 2, T - 4, T - 4, 9); ctx.fillStyle = '#ffc93c'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#d98a00'; ctx.stroke();
      ctx.fillStyle = '#e8a400'; el(px + 16, py + 18, 4, 4); el(px + 32, py + 30, 4, 4); el(px + 30, py + 14, 3, 3);
    } else if (c === 'H') {
      ctx.fillStyle = '#9a5f34'; ctx.fillRect(px + 8, py, 6, T + 1); ctx.fillRect(px + T - 14, py, 6, T + 1);
      ctx.fillStyle = '#c98a4b'; for (const ry of [10, 34]) { rrect(px + 6, py + ry, T - 12, 6, 3); ctx.fill(); }
    } else if (c === '-') {
      rrect(px, py, T + 1, 17, 5); ctx.fillStyle = '#c98a4b'; ctx.fill();
      ctx.fillStyle = '#8a5a2b'; ctx.fillRect(px, py + 12, T + 1, 5);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(px + 4, py + 3, T - 8, 3);
    }
  }
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
function drawWater(d) {
  const lvl = G.lvl, time = G.time;
  const x0 = Math.max(0, Math.floor(G.cam / T)), x1 = Math.min(lvl.w - 1, x0 + Math.ceil(W / T) + 1);
  ctx.fillStyle = d.water || 'rgba(60,150,255,.5)';
  for (let y = 0; y < ROWS; y++) {
    // zusammenhängende Wasserstücke einer Zeile in einem Zug zeichnen (keine Nähte)
    for (let x = x0; x <= x1; x++) {
      if (lvl.g[y][x] !== '~') continue;
      const top = tile(x, y - 1) !== '~'; // Oberfläche (mit Wellen) oder tiefes Wasser
      let e = x; while (e + 1 <= x1 && lvl.g[y][e + 1] === '~' && (tile(e + 1, y - 1) !== '~') === top) e++;
      const px = x * T, pw = (e - x + 1) * T;
      if (!top) ctx.fillRect(px, y * T, pw, T);
      else {
        ctx.beginPath(); ctx.moveTo(px, y * T + T);
        for (let wx = px; wx <= px + pw; wx += 8) ctx.lineTo(wx, y * T + 8 + Math.sin(time * 3 + wx * .08) * 3);
        ctx.lineTo(px + pw, y * T + T); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.fillStyle = 'rgba(255,255,255,.55)';
        for (let wx = px; wx < px + pw; wx += 8) ctx.fillRect(wx, y * T + 7 + Math.sin(time * 3 + wx * .08) * 3, 8, 3);
        ctx.restore();
      }
      x = e;
    }
  }
}
function drawPlat(e) {
  rrect(e.x, e.y, e.w, e.h + 2, 7); ctx.fillStyle = '#6fc3ff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#2f7fc0'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(e.x + 6, e.y + 3, e.w - 12, 3);
  // kleine Pfeile zeigen die Richtung
  ctx.fillStyle = '#2f7fc0';
  const cx = e.x + e.w / 2, cy = e.y + 11;
  if (e.vx !== 0) { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 22, cy); ctx.lineTo(cx + s * 12, cy - 5); ctx.lineTo(cx + s * 12, cy + 5); ctx.fill(); } }
  else { ctx.beginPath(); ctx.moveTo(cx, cy - 7); ctx.lineTo(cx - 6, cy); ctx.lineTo(cx + 6, cy); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx, cy + 8); ctx.lineTo(cx - 6, cy + 2); ctx.lineTo(cx + 6, cy + 2); ctx.fill(); }
}
function drawGate(e) {
  const a = e.open ? Math.max(0, 1 - e.openT * 1.5) : 1; if (a <= 0) return;
  const x = e.x, bot = e.y, sink = e.open ? e.openT * 160 : 0, time = G.time;
  ctx.globalAlpha = a;
  // Zaubervorhang über dem Tor
  for (let y = 0; y < bot - 2 * T; y += 12) {
    ctx.fillStyle = `hsla(${(y * 1.5 + time * 140) % 360},90%,72%,.42)`; ctx.fillRect(x + 10, y, T - 20, 12);
  }
  for (let k = 0; k < 3; k++) starShape(x + T / 2 + Math.sin(time * 2 + k * 2) * 10, ((time * 60 + k * 170) % (bot - 2 * T)), 6, time * 2, '#fff', '#ffe066');
  // Holztor mit Fragezeichen
  ctx.save(); ctx.beginPath(); ctx.rect(x - 10, 0, T + 20, bot); ctx.clip();
  const y0 = bot - 2 * T + sink;
  rrect(x + 1, y0, T - 2, 2 * T, 10); ctx.fillStyle = '#c98a4b'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#7a4a22'; ctx.stroke();
  ctx.fillStyle = '#b0743b'; ctx.fillRect(x + 15, y0 + 4, 3, 2 * T - 8); ctx.fillRect(x + 30, y0 + 4, 3, 2 * T - 8);
  ctx.fillStyle = '#ffe066'; el(x + T / 2, y0 + 34, 19, 19);
  txt('?', x + T / 2, y0 + 37, 34, '#ff4d8d');
  ctx.restore();
  ctx.globalAlpha = 1;
}
function drawChest(e) {
  const cx = e.x + e.w / 2, by = e.y + e.h, time = G.time;
  const bob = e.open ? 0 : Math.abs(Math.sin(time * 3)) * -3;
  ctx.fillStyle = 'rgba(40,25,20,.25)'; el(cx, by - 1, 24, 4);
  rrect(cx - 24, by - 28, 48, 28, 6); ctx.fillStyle = '#c98a4b'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#7a4a22'; ctx.stroke();
  ctx.fillStyle = '#8a5a2b'; ctx.fillRect(cx - 24, by - 16, 48, 4);
  if (!e.open) {
    rrect(cx - 26, by - 44 + bob, 52, 18, 8); ctx.fillStyle = '#d99a55'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffe066'; el(cx, by - 26 + bob, 9, 9); txt('?', cx, by - 25 + bob, 16, '#ff4d8d');
  } else {
    ctx.save(); ctx.translate(cx - 24, by - 28); ctx.rotate(-1.9); rrect(0, -2, 52, 16, 8); ctx.fillStyle = '#d99a55'; ctx.fill(); ctx.stroke(); ctx.restore();
    if (e.openT < 2) for (let k = 0; k < 3; k++) starShape(cx - 14 + k * 14, by - 36 - ((e.openT * 40 + k * 9) % 30), 5, e.openT * 4, '#fff', '#ffe066');
  }
}
function drawEnts() {
  const time = G.time;
  for (const e of G.lvl.ents) {
    if (e.x < G.cam - 100 || e.x > G.cam + W + 100) continue;
    if (e.t === 'star' && !e.got) {
      if (e.hidden && !e.seen) { // nur ein leises Glitzern verrät den versteckten Stern
        const g = Math.max(0, Math.sin(time * 2.2 + e.ph * 3)); if (g > .85) starShape(e.x, e.y, 6 * (g - .85) / .15 + 2, time * 3, 'rgba(255,255,255,.8)', 'rgba(255,255,255,0)');
      } else starShape(e.x, e.y + Math.sin(time * 3 + e.ph) * 4, 17, Math.sin(time * 2 + e.ph) * .2, e.hidden ? '#fff27a' : undefined, e.hidden ? '#ff9f1a' : undefined);
    }
    else if (e.t === 'plat') drawPlat(e);
    else if (e.t === 'snail' && e.dead >= 0) drawSnail(e);
    else if (e.t === 'shroom') drawShroom(e);
    else if (e.t === 'gate') drawGate(e);
    else if (e.t === 'chest') drawChest(e);
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
  drawFox(P.x + P.w / 2, P.y + P.h, P.face, G.time, P.sq, (P.onGround && Math.abs(P.vx) > 30) || P.swim || (P.climb && (Math.abs(P.vy) > 10 || Math.abs(P.vx) > 10)));
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
  const th = THEMES.wiese;
  G.cam = time * 60; drawBG(th);
  ctx.fillStyle = th.grass; ctx.fillRect(0, H - 96, W, 96); ctx.fillStyle = th.dirt; ctx.fillRect(0, H - 83, W, 83);
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
  const r = G.run[G.levelIdx];
  txt('Super gemacht!', W / 2, H / 2 - 100, 76, '#ffe066');
  starShape(W / 2 - 90, H / 2 + 5, 34, 0);
  ctx.font = `800 56px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
  ctx.fillText(`${r.got} / ${r.total}`, W / 2 - 40, H / 2 + 8);
  if (G.record && r.got > 0) txt('Rekord!', W / 2 + 250, H / 2 - 40, 34, '#b6ffcf');
  if (G.doneT > .8 && Math.sin(G.time * 5) > -.3) txt(hint() + ' zum Weitermachen', W / 2, H / 2 + 110, 36, '#b6ffcf');
}
function drawWin() {
  const time = G.time;
  drawBG(THEMES.nacht);
  let g = 0, t = 0; LEVELS.forEach(l => { const b = best(l); if (b) { g += b.got; t += b.total; } });
  panel(420);
  txt('Du bist ein Hüpf-Profi!', W / 2, H / 2 - 130, 70, '#ffe066');
  drawFox(W / 2, H / 2 + 30 - Math.abs(Math.sin(time * 4)) * 30, 1, time, 0, false);
  starShape(W / 2 - 90, H / 2 + 90, 30, 0);
  ctx.font = `800 50px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(`${g} / ${t} Sterne`, W / 2 - 50, H / 2 + 93);
  if (Math.sin(time * 5) > -.3) txt(hint() + ' zur Karte', W / 2, H / 2 + 170, 34, '#b6ffcf');
  drawFx();
}

/* ---------- Weltkarte ---------- */
function lockShape(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -8, 12, Math.PI, 0); ctx.stroke();
  rrect(-18, -8, 36, 28, 6); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.fillStyle = '#6b6b7a'; el(0, 3, 4, 4); ctx.fillRect(-2, 3, 4, 9);
  ctx.restore();
}
// Kleine Vorschau der Welt im Kreis: Himmel, Sonne/Mond, Boden
function worldBadge(def, x, y, r) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  const g = ctx.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, def.sky[0]); g.addColorStop(1, def.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = def.sun; el(x + r * .45, y - r * .4, r * .22, r * .22);
  if (def.night) { ctx.fillStyle = def.sky[0]; el(x + r * .53, y - r * .47, r * .18, r * .18); }
  ctx.fillStyle = def.near; el(x - r * .3, y + r * .55, r * .9, r * .45);
  ctx.fillStyle = def.grass; ctx.fillRect(x - r, y + r * .5, r * 2, r * .2);
  ctx.fillStyle = def.dirt; ctx.fillRect(x - r, y + r * .68, r * 2, r);
  ctx.restore();
}
function drawMap() {
  const time = G.time, th = THEMES.wiese;
  G.cam = time * 25; drawBG(th);
  ctx.fillStyle = th.grass; ctx.fillRect(0, 600, W, 120); ctx.fillStyle = th.dirt; ctx.fillRect(0, 616, W, 104);
  const nodes = mapNodes(LEVELS.length);
  // Pfad
  ctx.lineCap = 'round'; ctx.setLineDash([2, 26]);
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i], b = nodes[i + 1], open = isUnlocked(LEVELS, i + 1);
    ctx.strokeStyle = open ? '#fff8e0' : 'rgba(255,255,255,.35)'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + (i % 2 ? -60 : 60), b.x, b.y); ctx.stroke();
  }
  ctx.setLineDash([]);
  // Knoten
  nodes.forEach((n, i) => {
    const def = LEVELS[i], open = isUnlocked(LEVELS, i), b = best(def), sel = i === G.mapSel;
    const r = NODE_R * (sel ? 1.12 + Math.sin(time * 4) * .03 : 1);
    ctx.fillStyle = 'rgba(40,25,80,.25)'; el(n.x, n.y + r * .9, r * .9, r * .25);
    worldBadge(def, n.x, n.y, r);
    ctx.lineWidth = sel ? 9 : 6; ctx.strokeStyle = sel ? '#ffe066' : '#fff';
    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.stroke();
    if (!open) {
      ctx.fillStyle = 'rgba(60,60,80,.55)'; el(n.x, n.y, r, r); lockShape(n.x, n.y + 2, 1.1);
    } else {
      txt(String(i + 1), n.x, n.y + 4, 54, '#fff');
      if (b) { // geschafft: Sterne darunter
        starShape(n.x - 34, n.y + r + 30, 15, 0);
        ctx.font = `800 28px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(35,20,60,.9)';
        const s = `${b.got}/${b.total}`; ctx.strokeText(s, n.x - 14, n.y + r + 32); ctx.fillStyle = b.got === b.total ? '#ffe066' : '#fff'; ctx.fillText(s, n.x - 14, n.y + r + 32);
      }
    }
  });
  // Flinki hüpft zwischen den Welten
  const a = nodes[G.mapFrom], z = nodes[G.mapSel], t = G.mapT;
  const fx = a.x + (z.x - a.x) * t, fy = a.y + (z.y - a.y) * t - Math.sin(t * Math.PI) * 120;
  const idle = t >= 1 ? Math.abs(Math.sin(time * 3)) * 10 : 0;
  drawFox(fx, fy - NODE_R * 1.12 - idle, z.x >= a.x ? 1 : -1, time, 0, false);
  // Titel der gewählten Welt
  const def = LEVELS[G.mapSel];
  rrect(W / 2 - 330, 22, 660, 92, 30); ctx.fillStyle = 'rgba(40,25,80,.6)'; ctx.fill();
  txt(`${G.mapSel + 1}  ${def.name}`, W / 2, 70, 58, '#ffe066');
  if (Math.sin(time * 4) > -.4) txt(isTouch && !padActive ? 'Tippe auf eine Welt' : '◀ ▶ wählen   ' + (padActive ? 'A' : 'Leertaste') + ' = los!', W / 2, H - 40, 34, '#fff');
}

/* ---------- Pause-Menü ---------- */
function playIcon(x, y) { ctx.fillStyle = '#3ddc84'; ctx.beginPath(); ctx.moveTo(x - 22, y - 30); ctx.lineTo(x + 30, y); ctx.lineTo(x - 22, y + 30); ctx.closePath(); ctx.fill(); }
function mapIcon(x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#fff1c8'; ctx.beginPath(); ctx.moveTo(-40, -26); ctx.lineTo(-14, -34); ctx.lineTo(14, -26); ctx.lineTo(40, -34); ctx.lineTo(40, 26); ctx.lineTo(14, 34); ctx.lineTo(-14, 26); ctx.lineTo(-40, 34); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#d9c08a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, -34); ctx.lineTo(-14, 26); ctx.moveTo(14, -26); ctx.lineTo(14, 34); ctx.stroke();
  ctx.strokeStyle = '#ff4d8d'; ctx.lineWidth = 4; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(-30, 18); ctx.quadraticCurveTo(0, -30, 28, 8); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#ff4d8d'; el(28, 8, 6, 6);
  ctx.restore();
}
function drawPause() {
  panel(330);
  txt('Pause', W / 2, H / 2 - 100, 76, '#ffe066');
  PAUSE_BTNS.forEach((b, i) => {
    const sel = i === G.pauseSel;
    rrect(b.x, b.y, b.w, b.h, 28); ctx.fillStyle = sel ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.55)'; ctx.fill();
    if (sel) { ctx.lineWidth = 7; ctx.strokeStyle = '#ffe066'; ctx.stroke(); }
    (i === 0 ? playIcon : mapIcon)(b.x + b.w / 2, b.y + b.h / 2);
  });
}

export function draw() {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  if (G.state === 'title') { drawTitle(); return; }
  if (G.state === 'win') { drawWin(); return; }
  if (G.state === 'map') { drawMap(); return; }
  const d = G.lvl.def;
  drawBG(d);
  ctx.save(); ctx.translate(-Math.round(G.cam), 0);
  drawTiles(d); drawEnts(); drawPlayer(); drawWater(d); drawFx();
  ctx.restore();
  drawHUD();
  if (G.state === 'pause') drawPause();
  if (G.state === 'quiz') drawQuiz(G.quiz, padActive);
  if (G.state === 'done') drawDone();
}
