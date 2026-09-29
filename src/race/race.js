/* ---------- Flinki-Rennen: Pseudo-3D-Kartrennen («Mode 7») ----------
 * Boden: Die Strecke wird einmal von oben in eine Textur gemalt. Pro Bild wird jede
 * Bildzeile unter dem Horizont perspektivisch aus dieser Textur abgetastet
 * (kleiner Puffer, dann hochskaliert). Karts, Bäume und Sterne sind aufrechte Figuren.
 */
import { W, H, FONT } from '../config.js';
import { ctx, el, rrect, txt, starShape, drawFox } from '../gfx.js';
import { THEMES } from '../themes.js';
import { TRACKS } from './tracks.js';
import { sfx } from '../audio.js';
import { say } from '../speech.js';

const LAPS = 3;
const HORIZON = 250, FOCAL = 560, CAM_H = 95, CAM_BACK = 190, FAR = 4200;
const FW = 480, FH = Math.ceil((H - HORIZON) / 3); // Boden-Puffer (1/3 Auflösung)
const TEX = 4;                                     // 1 Texel = 4 Welt-Pixel
const BASE_SPEED = 520;

export const CHARS = [
  { id: 'fuchs', name: 'Flinki', kart: '#3d8bff', head: '#ff8a2a' },
  { id: 'schnecke', name: 'Schnecke', kart: '#ffd43b', head: '#ffd27a' },
  { id: 'hase', name: 'Hase', kart: '#3ddc84', head: '#c9c3cf' },
  { id: 'igel', name: 'Igel', kart: '#b18cff', head: '#8a5a3a' }
];

export const R = { phase: 'idle' }; // aktuelles Rennen

/* ---------- Strecke vorbereiten ---------- */
function buildTrack(def) {
  const P = def.pts, n = P.length, dense = [];
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    for (let s = 0; s < 40; s++) {
      const t = s / 40, t2 = t * t, t3 = t2 * t;
      const f = k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
      dense.push([f(0), f(1)]);
    }
  }
  // gleichmässig alle 20 px
  const S = [dense[0]]; let need = 20;
  for (let i = 1; i <= dense.length; i++) {
    let a = S[S.length - 1]; const b = dense[i % dense.length];
    let d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    while (d >= need) {
      const t = need / d; a = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; S.push(a);
      d = Math.hypot(b[0] - a[0], b[1] - a[1]); need = 20;
    }
    need -= d;
  }
  if (Math.hypot(S[S.length - 1][0] - S[0][0], S[S.length - 1][1] - S[0][1]) < 10) S.pop();
  const N = S.length;
  const pts = S.map((p, i) => {
    const q = S[(i + 1) % N], r = S[(i - 1 + N) % N], a = Math.atan2(q[1] - r[1], q[0] - r[0]);
    return { x: p[0], y: p[1], a, nx: -Math.sin(a), ny: Math.cos(a) };
  });
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const p of pts) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  const M = 900;
  return { def, pts, N, bx: minX - M, by: minY - M, bw: maxX - minX + 2 * M, bh: maxY - minY + 2 * M };
}

// Pseudo-Zufall (gleiche Deko bei jedem Start)
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function nearest(tr, x, y, from = -1) {
  let best = -1, bd = 1e18;
  const scan = from < 0 ? [0, tr.N] : [from - 25, from + 45];
  for (let j = scan[0]; j < scan[1]; j++) {
    const i = ((j % tr.N) + tr.N) % tr.N, p = tr.pts[i], d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bd) { bd = d; best = i; }
  }
  return { i: best, d: Math.sqrt(bd) };
}

// Boden-Textur: Strecke von oben malen
function paintTexture(tr) {
  const d = tr.def, cw = Math.ceil(tr.bw / TEX), ch = Math.ceil(tr.bh / TEX);
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const g = c.getContext('2d'), rnd = rng(7);
  g.fillStyle = d.ground; g.fillRect(0, 0, cw, ch);
  g.fillStyle = d.ground2; for (let i = 0; i < cw * ch / 60; i++) g.fillRect(rnd() * cw, rnd() * ch, 2 + rnd() * 3, 2 + rnd() * 3);
  // Blumen / Muscheln
  const dots = d.decor === 'palm' ? ['#fff4e0', '#ffb3a0'] : d.decor === 'lolly' ? ['#fff', '#ffe066', '#69db7c'] : ['#ffe066', '#fff', '#ff9ec7'];
  for (let i = 0; i < cw * ch / 900; i++) { g.fillStyle = dots[i % dots.length]; g.beginPath(); g.arc(rnd() * cw, rnd() * ch, 1.6, 0, 7); g.fill(); }
  const path = () => { g.beginPath(); tr.pts.forEach((p, i) => { const x = (p.x - tr.bx) / TEX, y = (p.y - tr.by) / TEX; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
  g.lineJoin = 'round'; g.lineCap = 'round';
  path(); g.lineWidth = (d.width + 44) / TEX; g.strokeStyle = d.curb[1]; g.stroke();
  path(); g.setLineDash([36 / TEX, 36 / TEX]); g.strokeStyle = d.curb[0]; g.stroke(); g.setLineDash([]);
  path(); g.lineWidth = d.width / TEX; g.strokeStyle = d.road; g.stroke();
  path(); g.lineWidth = d.width * .55 / TEX; g.strokeStyle = d.road2; g.stroke();
  path(); g.lineWidth = 6 / TEX; g.setLineDash([60 / TEX, 60 / TEX]); g.strokeStyle = 'rgba(255,255,255,.8)'; g.stroke(); g.setLineDash([]);
  // Start/Ziel: Schachbrett
  const p0 = tr.pts[0];
  g.save(); g.translate((p0.x - tr.bx) / TEX, (p0.y - tr.by) / TEX); g.rotate(p0.a);
  const sq = 20 / TEX, rows = 2, cols = Math.ceil(d.width / 20);
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { g.fillStyle = (r + k) % 2 ? '#222' : '#fff'; g.fillRect(-sq + r * sq, -d.width / 2 / TEX + k * sq, sq, sq); }
  g.restore();
  // Turbo-Felder
  for (const b of tr.boosts) {
    g.save(); g.translate((b.x - tr.bx) / TEX, (b.y - tr.by) / TEX); g.rotate(b.a);
    g.fillStyle = '#ffb020'; g.fillRect(-40 / TEX, -34 / TEX, 80 / TEX, 68 / TEX);
    g.fillStyle = '#fff3b0';
    for (const o of [-22, 8]) { g.beginPath(); g.moveTo((o) / TEX, -24 / TEX); g.lineTo((o + 18) / TEX, 0); g.lineTo(o / TEX, 24 / TEX); g.lineTo((o + 8) / TEX, 0); g.closePath(); g.fill(); }
    g.restore();
  }
  const data = g.getImageData(0, 0, cw, ch);
  return { w: cw, h: ch, px: new Uint32Array(data.data.buffer), groundPx: hexToU32(d.ground) };
}
function hexToU32(h) { const n = parseInt(h.slice(1), 16); return (255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16); }

/* ---------- Rennen starten ---------- */
let floorCv = null, floorCtx = null, floorImg = null, floorBuf = null;

export function startRace(trackIdx) {
  const def = TRACKS[trackIdx], tr = buildTrack(def), N = tr.N;
  // Turbo-Felder und Sterne verteilen
  tr.boosts = [];
  for (let k = 1; k < 4; k++) { const p = tr.pts[Math.floor(N * k / 4 + N / 10) % N], off = ((k % 3) - 1) * def.width * .22; tr.boosts.push({ x: p.x + p.nx * off, y: p.y + p.ny * off, a: p.a }); }
  const stars = [];
  for (let i = 30; i < N - 10; i += 22) { const p = tr.pts[i], off = [-.25, 0, .25, 0][Math.floor(i / 22) % 4] * def.width; stars.push({ x: p.x + p.nx * off, y: p.y + p.ny * off, on: true, t: 0 }); }
  // Deko neben der Strecke
  const deco = [], rnd = rng(trackIdx * 99 + 3);
  for (let tries = 0; deco.length < 70 && tries < 3000; tries++) {
    const x = tr.bx + rnd() * tr.bw, y = tr.by + rnd() * tr.bh, n = nearest(tr, x, y);
    if (n.d > def.width / 2 + 90 && n.d < 700) deco.push({ x, y, s: .8 + rnd() * .6, k: Math.floor(rnd() * 3) });
  }
  tex = paintTexture(tr);
  if (!floorCv) { floorCv = document.createElement('canvas'); floorCv.width = FW; floorCv.height = FH; floorCtx = floorCv.getContext('2d'); floorImg = floorCtx.createImageData(FW, FH); floorBuf = new Uint32Array(floorImg.data.buffer); }
  // Startaufstellung: Gegner vorne in einer Reihe, Flinki dahinter in der Mitte (freie Sicht, überholen macht Spass)
  const grid = [[0, 9], [-.28, 3], [0, 3], [.28, 3]]; // [Spur, Abstand hinter der Linie]
  const karts = CHARS.map((c, i) => {
    const [ln, back] = grid[i], idx = (N - back) % N, p = tr.pts[idx], lane = ln * def.width;
    return { ...c, x: p.x + p.nx * lane, y: p.y + p.ny * lane, ang: p.a, speed: 0, idx, prog: -back, turbo: 0, meter: 0,
      skill: [1, .86, .9, .94][i], lane: ln * .8, done: false, time: 0, lean: 0, bump: 0 };
  });
  Object.assign(R, { trackIdx, def, theme: THEMES[def.theme], tr, stars, deco, karts, me: karts[0], phase: 'count', t: 0, raceT: 0, camA: karts[0].ang, place: 1, gotStars: 0, pauseSel: 0, resSel: 0, lastCount: 4 });
}
let tex = null;

/* ---------- Update ---------- */
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };

export const RACE_BTNS = [{ x: W / 2 - 190, y: H / 2 - 20, w: 170, h: 140 }, { x: W / 2 + 20, y: H / 2 - 20, w: 170, h: 140 }];
const hitR = (p, r) => p && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

// Rückgabe: 'menu' wenn zurück zur Streckenwahl
export function updateRace(dt, inp) {
  R.t += dt;
  if (R.phase === 'pause') {
    if (inp.tap) { const i = RACE_BTNS.findIndex(b => hitR(inp.tap, b)); if (i === 0) R.phase = 'run'; if (i === 1) return 'menu'; return; }
    if (inp.leftPressed) R.pauseSel = 0; if (inp.rightPressed) R.pauseSel = 1;
    if (inp.startPressed) R.phase = 'run';
    else if (inp.confirmPressed) { if (R.pauseSel === 0) R.phase = 'run'; else return 'menu'; }
    return;
  }
  if (R.phase === 'results') {
    if (R.t < .8) return;
    if (inp.tap) { const i = RACE_BTNS.findIndex(b => hitR(inp.tap, { ...b, y: b.y + 150 })); if (i === 0) startRace(R.trackIdx); if (i === 1) return 'menu'; return; }
    if (inp.leftPressed) R.resSel = 0; if (inp.rightPressed) R.resSel = 1;
    if (inp.startPressed) return 'menu';
    if (inp.confirmPressed) { if (R.resSel === 0) startRace(R.trackIdx); else return 'menu'; }
    return;
  }
  if (R.phase === 'count') {
    const c = Math.ceil(3 - R.t);
    if (c !== R.lastCount && c >= 0) { R.lastCount = c; if (c > 0) { sfx.select(); say(String(c)); } else { sfx.check(); say('Los!'); } }
    if (R.t >= 3) { R.phase = 'run'; R.t = 0; }
    stepKarts(dt, inp, false);
    return;
  }
  if (inp.startPressed && R.phase === 'run') { R.phase = 'pause'; R.pauseSel = 0; return; }
  R.raceT += dt;
  stepKarts(dt, inp, true);
  if (R.phase === 'finish' && R.t > 3) { R.phase = 'results'; R.t = 0; finalize(); }
}

function stepKarts(dt, inp, go) {
  const { tr, def, me } = R, N = tr.N, half = def.width / 2;
  for (const k of R.karts) {
    const near = nearest(tr, k.x, k.y, k.idx), p = tr.pts[near.i];
    let dIdx = near.i - k.idx; if (dIdx > N / 2) dIdx -= N; if (dIdx < -N / 2) dIdx += N;
    k.prog += dIdx; k.idx = near.i;
    const onRoad = near.d < half + 12;
    if (k.turbo > 0) k.turbo -= dt;
    // Turbo-Felder
    for (const b of tr.boosts) if ((b.x - k.x) ** 2 + (b.y - k.y) ** 2 < 60 * 60 && k.turbo < .6) { k.turbo = 1.1; if (k === me) sfx.boing(); }
    let target = 0, steer = 0;
    if (go && !k.done || (go && k.done)) {
      if (k === me && !k.done) {
        steer = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
        if (inp.jumpPressed && k.meter >= .25 && R.phase === 'run') { k.meter -= .25; k.turbo = 1.3; sfx.jump(); }
        target = BASE_SPEED;
      } else {
        // Computer: Punkt vor sich anpeilen, Tempo an Flinki anpassen (bleibt spannend)
        const ahead = tr.pts[(k.idx + 9) % N], lane = (k.lane + Math.sin(R.raceT * .4 + k.skill * 9) * .12) * def.width;
        const tx = ahead.x + ahead.nx * lane, ty = ahead.y + ahead.ny * lane;
        steer = Math.max(-1, Math.min(1, angDiff(Math.atan2(ty - k.y, tx - k.x), k.ang) * 2.5));
        const diff = (me.prog - k.prog) / N;
        target = BASE_SPEED * (k.done ? .7 : k.skill * Math.max(.78, Math.min(1.14, 1 + diff * .7)));
      }
    }
    if (!onRoad) target *= .5;
    if (k.turbo > 0) target *= 1.4;
    k.speed += (target - k.speed) * Math.min(1, dt * (target > k.speed ? 1.1 : 2.2));
    const turn = 2.3 * Math.min(1, Math.abs(k.speed) / 220);
    k.ang += steer * turn * dt;
    // Lenkhilfe für Flinki: ohne Lenken sanft einen Punkt vorne auf der Strecke anpeilen
    if (k === me && !steer && go && !k.done) {
      const lat = Math.max(-.3, Math.min(.3, ((k.x - p.x) * p.nx + (k.y - p.y) * p.ny) / def.width)) * def.width;
      const a = tr.pts[(k.idx + 10) % N], want = Math.atan2(a.y + a.ny * lat - k.y, a.x + a.nx * lat - k.x);
      k.ang += angDiff(want, k.ang) * Math.min(1, dt * 2.2);
    }
    k.lean += ((steer || 0) - k.lean) * Math.min(1, dt * 8);
    k.x += Math.cos(k.ang) * k.speed * dt; k.y += Math.sin(k.ang) * k.speed * dt;
    // zu weit weg? sanft zurück zur Strecke
    if (near.d > half + 240) { k.x += (p.x - k.x) * dt * 1.5; k.y += (p.y - k.y) * dt * 1.5; k.ang += angDiff(p.a, k.ang) * dt * 2; }
    if (k.bump > 0) k.bump -= dt;
    // Ziel
    if (!k.done && k.prog >= LAPS * N) { k.done = true; k.time = R.raceT; if (k === me) { R.phase = 'finish'; R.t = 0; R.place = placeOf(k); sfx.win(); say(R.place === 1 ? 'Erster Platz! Super!' : `Platz ${R.place}! Toll gemacht!`); } }
  }
  // Karts schubsen sich weg
  const ks = R.karts;
  for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
    const a = ks[i], b = ks[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
    if (d < 52 && d > .01) {
      const push = (52 - d) / 2, ux = dx / d, uy = dy / d;
      a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push;
      a.speed *= .97; b.speed *= .97;
      if ((a === me || b === me) && me.bump <= 0) { sfx.stomp(); me.bump = .5; }
    }
  }
  // Sterne
  for (const s of R.stars) {
    if (!s.on) { s.t -= dt; if (s.t <= 0) s.on = true; continue; }
    if ((s.x - me.x) ** 2 + (s.y - me.y) ** 2 < 55 * 55) { s.on = false; s.t = 8; R.gotStars++; me.meter = Math.min(1, me.meter + .25); sfx.star(); }
  }
  if (R.phase !== 'finish') R.place = placeOf(me);
  // Kamera folgt weich
  R.camA += angDiff(me.ang, R.camA) * Math.min(1, dt * 5);
}

function placeOf(k) {
  return 1 + R.karts.filter(o => o !== k && (o.done && (!k.done || o.time < k.time) || (!o.done && !k.done && o.prog > k.prog))).length;
}
function finalize() {
  const order = [...R.karts].sort((a, b) => (a.done && b.done) ? a.time - b.time : a.done ? -1 : b.done ? 1 : b.prog - a.prog);
  R.order = order; R.place = order.indexOf(R.me) + 1;
}

/* ---------- Zeichnen ---------- */
function drawSky(th) {
  const g = ctx.createLinearGradient(0, 0, 0, HORIZON); g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, HORIZON + 2);
  const off = -R.camA * 520; // Himmel dreht mit
  ctx.fillStyle = th.sun; ctx.globalAlpha = .35; el(((off * .5 + 900) % (W + 400) + W + 400) % (W + 400) - 200, 90, 70, 70); ctx.globalAlpha = 1;
  el(((off * .5 + 900) % (W + 400) + W + 400) % (W + 400) - 200, 90, 50, 50);
  for (let i = 0; i < 6; i++) { const span = W + 400, x = (((i * 260 + off * .6) % span) + span) % span - 200; ctx.fillStyle = th.cloud; el(x, 60 + (i * 37) % 80, 60, 24); el(x + 40, 54 + (i * 37) % 80, 44, 22); }
  for (const [f, base, amp, col, fr] of [[.8, HORIZON - 40, 38, th.far, .006], [1, HORIZON - 12, 22, th.near, .011]]) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, HORIZON + 2);
    for (let x = 0; x <= W; x += 16) { const wx = x - off * f; ctx.lineTo(x, base - Math.abs(Math.sin(wx * fr)) * amp - Math.sin(wx * fr * 2.7) * amp * .3); }
    ctx.lineTo(W, HORIZON + 2); ctx.closePath(); ctx.fill();
  }
}

function camera() {
  const me = R.me, ca = Math.cos(R.camA), sa = Math.sin(R.camA);
  return { x: me.x - ca * CAM_BACK, y: me.y - sa * CAM_BACK, dx: ca, dy: sa, px: -sa, py: ca };
}

function drawFloor(cam) {
  const { tr } = R, t = tex, buf = floorBuf, bg = t.groundPx;
  for (let r = 0; r < FH; r++) {
    const sy = HORIZON + (r + .5) * (H - HORIZON) / FH, dy = sy - HORIZON, z = CAM_H * FOCAL / dy;
    const cx = cam.x + cam.dx * z, cy = cam.y + cam.dy * z, k = z / FOCAL * (W / FW);
    let wx = cam.x + cam.dx * z + cam.px * (-FW / 2 + .5) * k, wy = cam.y + cam.dy * z + cam.py * (-FW / 2 + .5) * k;
    const sx = cam.px * k, syy = cam.py * k, row = r * FW;
    for (let c = 0; c < FW; c++) {
      const u = ((wx - tr.bx) / TEX) | 0, v = ((wy - tr.by) / TEX) | 0;
      buf[row + c] = (u >= 0 && v >= 0 && u < t.w && v < t.h) ? t.px[v * t.w + u] : bg;
      wx += sx; wy += syy;
    }
    void cx; void cy;
  }
  floorCtx.putImageData(floorImg, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(floorCv, 0, HORIZON, W, H - HORIZON);
  ctx.imageSmoothingEnabled = true;
  // Dunst am Horizont
  const g = ctx.createLinearGradient(0, HORIZON, 0, HORIZON + 90); g.addColorStop(0, R.theme.sky[1]); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, HORIZON, W, 90);
}

function project(cam, x, y) {
  const vx = x - cam.x, vy = y - cam.y, z = vx * cam.dx + vy * cam.dy;
  if (z < 60 || z > FAR) return null;
  const lat = vx * cam.px + vy * cam.py, k = FOCAL / z;
  return { sx: W / 2 + lat * k, sy: HORIZON + CAM_H * k, k, z };
}

// Kart von hinten (Figur schaut nach vorne)
function drawKartBack(c, x, y, k, lean = 0, turbo = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(lean * .06);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; el(0, 0, 40, 8);
  if (turbo > 0) { for (const s of [-14, 14]) { ctx.fillStyle = '#ffb020'; ctx.beginPath(); ctx.moveTo(s - 7, -12); ctx.lineTo(s, 8 + Math.random() * 14); ctx.lineTo(s + 7, -12); ctx.fill(); ctx.fillStyle = '#fff3b0'; el(s, -10, 4, 4); } }
  ctx.fillStyle = '#2a2a33'; rrect(-40, -24, 17, 24, 5); ctx.fill(); rrect(23, -24, 17, 24, 5); ctx.fill();
  ctx.fillStyle = c.kart; rrect(-30, -34, 60, 26, 9); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.18)'; rrect(-30, -16, 60, 8, 4); ctx.fill();
  ctx.fillStyle = '#6b6b7a'; el(-12, -12, 4, 3); el(12, -12, 4, 3);
  ctx.fillStyle = 'rgba(255,255,255,.35)'; rrect(-24, -32, 48, 5, 3); ctx.fill();
  // Fahrer von hinten
  const hy = -54;
  if (c.id === 'fuchs') {
    ctx.save(); ctx.translate(20, -26); ctx.rotate(.5 + Math.sin(R.t * 8) * .15); ctx.fillStyle = '#ff8a2a'; el(12, 0, 16, 8); ctx.fillStyle = '#fff'; el(26, 0, 6, 5); ctx.restore();
    ctx.fillStyle = '#ff8a2a'; ctx.beginPath(); ctx.moveTo(-15, hy - 6); ctx.lineTo(-11, hy - 30); ctx.lineTo(-2, hy - 10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(2, hy - 10); ctx.lineTo(11, hy - 30); ctx.lineTo(15, hy - 6); ctx.fill();
    ctx.fillStyle = '#5a2d0c'; ctx.beginPath(); ctx.moveTo(-11, hy - 10); ctx.lineTo(-10, hy - 24); ctx.lineTo(-5, hy - 11); ctx.fill();
    ctx.beginPath(); ctx.moveTo(5, hy - 11); ctx.lineTo(10, hy - 24); ctx.lineTo(11, hy - 10); ctx.fill();
    ctx.fillStyle = '#ff8a2a'; el(0, hy, 17, 16);
  } else if (c.id === 'schnecke') {
    ctx.strokeStyle = '#e0a94a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, hy - 10); ctx.lineTo(-10, hy - 28); ctx.moveTo(6, hy - 10); ctx.lineTo(10, hy - 28); ctx.stroke();
    ctx.fillStyle = '#2a1a10'; el(-10, hy - 29, 3.5, 3.5); el(10, hy - 29, 3.5, 3.5);
    ctx.fillStyle = '#ffd27a'; el(0, hy - 4, 11, 11);
    ctx.fillStyle = '#e0508a'; el(0, hy + 10, 19, 17);
    ctx.strokeStyle = '#a8305e'; ctx.lineWidth = 3; ctx.beginPath(); for (let a = 0; a < Math.PI * 4; a += .3) ctx.lineTo(Math.cos(a) * (2 + a * 1.1), hy + 10 + Math.sin(a) * (2 + a * 1.1)); ctx.stroke();
  } else if (c.id === 'hase') {
    ctx.fillStyle = '#c9c3cf'; el(-7, hy - 26, 6, 18); el(7, hy - 26, 6, 18);
    ctx.fillStyle = '#ffb3c7'; el(-7, hy - 26, 2.5, 12); el(7, hy - 26, 2.5, 12);
    ctx.fillStyle = '#c9c3cf'; el(0, hy, 16, 15); ctx.fillStyle = '#fff'; el(0, hy + 16, 7, 6);
  } else {
    ctx.fillStyle = '#5a3a22';
    ctx.beginPath(); for (let i = 0; i <= 12; i++) { const a = Math.PI + i * Math.PI / 12, r = i % 2 ? 26 : 16; ctx.lineTo(Math.cos(a) * r, hy + 8 + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8a5a3a'; el(0, hy + 6, 17, 13);
  }
  ctx.restore();
}

function drawDeco(kind, x, y, k, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k * s, k * s);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; el(0, 0, 34, 8);
  if (kind === 'palm') {
    ctx.strokeStyle = '#9a6b3a'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(14, -60, 4, -120); ctx.stroke();
    ctx.fillStyle = '#2fa84f'; for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(4, -120); ctx.rotate(-2.6 + i * .8); el(28, 0, 32, 8); ctx.restore(); }
  } else if (kind === 'lolly') {
    ctx.fillStyle = '#fff'; ctx.fillRect(-4, -90, 8, 90);
    const cols = ['#ff5b8a', '#ffe066', '#69db7c', '#4dabf7'];
    for (let r = 34; r > 0; r -= 8) { ctx.fillStyle = cols[(r / 8 | 0) % 4]; el(0, -110, r, r); }
  } else {
    ctx.fillStyle = '#7a5230'; ctx.fillRect(-7, -50, 14, 50);
    ctx.fillStyle = '#2f9e44'; el(0, -80, 40, 40); ctx.fillStyle = '#40c057'; el(-12, -92, 22, 20);
  }
  ctx.restore();
}

function drawStartArch(cam) {
  const p = R.tr.pts[0], w = R.def.width / 2 + 40;
  const a = project(cam, p.x + p.nx * w, p.y + p.ny * w), b = project(cam, p.x - p.nx * w, p.y - p.ny * w);
  if (!a || !b) return;
  const ha = 170 * a.k, hb = 170 * b.k;
  ctx.fillStyle = '#6b6b7a'; ctx.fillRect(a.sx - 6 * a.k, a.sy - ha, 12 * a.k, ha); ctx.fillRect(b.sx - 6 * b.k, b.sy - hb, 12 * b.k, hb);
  const t1 = a.sy - ha, t2 = b.sy - hb, bh1 = 44 * a.k, bh2 = 44 * b.k;
  // Banner mit Schachbrett
  const n = 12;
  for (let i = 0; i < n; i++) for (let r = 0; r < 2; r++) {
    const f0 = i / n, f1 = (i + 1) / n;
    const x0 = a.sx + (b.sx - a.sx) * f0, x1 = a.sx + (b.sx - a.sx) * f1;
    const y0 = t1 + (t2 - t1) * f0, y1 = t1 + (t2 - t1) * f1, h0 = bh1 + (bh2 - bh1) * f0, h1 = bh1 + (bh2 - bh1) * f1;
    ctx.fillStyle = (i + r) % 2 ? '#222' : '#fff';
    ctx.beginPath(); ctx.moveTo(x0, y0 + h0 * r / 2); ctx.lineTo(x1, y1 + h1 * r / 2); ctx.lineTo(x1, y1 + h1 * (r + 1) / 2); ctx.lineTo(x0, y0 + h0 * (r + 1) / 2); ctx.fill();
  }
}

function medal(place) { return ['#ffd43b', '#d0d6e0', '#e0a060', '#b6ffcf'][place - 1] || '#fff'; }

function drawMinimap() {
  const { tr } = R, bw = 220, bh = 150, x0 = W - bw - 24, y0 = 24;
  rrect(x0 - 8, y0 - 8, bw + 16, bh + 16, 18); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill();
  const s = Math.min(bw / (tr.bw - 1800), bh / (tr.bh - 1800)), ox = x0 + bw / 2, oy = y0 + bh / 2, cx = tr.bx + tr.bw / 2, cy = tr.by + tr.bh / 2;
  ctx.beginPath(); tr.pts.forEach((p, i) => { const x = ox + (p.x - cx) * s, y = oy + (p.y - cy) * s; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath();
  ctx.lineWidth = 8; ctx.strokeStyle = '#8e929c'; ctx.stroke();
  for (const k of [...R.karts].reverse()) { ctx.fillStyle = k === R.me ? '#ff8a2a' : k.kart; el(ox + (k.x - cx) * s, oy + (k.y - cy) * s, k === R.me ? 8 : 6, k === R.me ? 8 : 6); }
}

function drawHUD() {
  const me = R.me, lap = Math.max(1, Math.min(LAPS, Math.floor(me.prog / R.tr.N) + 1));
  // Platz
  rrect(20, 18, 150, 110, 24); ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fill();
  ctx.fillStyle = medal(R.place); el(62, 73, 34, 34); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.stroke();
  ctx.font = `800 46px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a2560'; ctx.fillText(String(R.place), 62, 77);
  ctx.font = `800 26px ${FONT}`; ctx.fillText('Platz', 128, 60);
  ctx.font = `800 22px ${FONT}`; ctx.fillStyle = '#6a5a8a'; ctx.fillText(`von ${R.karts.length}`, 128, 90);
  // Runde + Sterne
  rrect(186, 18, 250, 54, 18); ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fill();
  ctx.font = `800 32px ${FONT}`; ctx.fillStyle = '#3a2560'; ctx.textAlign = 'left'; ctx.fillText(`Runde ${lap}/${LAPS}`, 204, 47);
  rrect(186, 80, 160, 48, 18); ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fill();
  starShape(214, 104, 16, 0); ctx.font = `800 30px ${FONT}`; ctx.fillStyle = '#3a2560'; ctx.fillText(String(R.gotStars), 240, 106);
  // Turbo-Anzeige (4 Teile)
  const tx = W / 2 - 130, ty = H - 58;
  rrect(tx - 70, ty - 22, 330, 44, 20); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill();
  ctx.font = `800 24px ${FONT}`; ctx.fillStyle = '#ff8a2a'; ctx.textAlign = 'left'; ctx.fillText('Turbo', tx - 58, ty + 2);
  for (let i = 0; i < 4; i++) { rrect(tx + 20 + i * 56, ty - 12, 48, 24, 10); ctx.fillStyle = me.meter >= (i + 1) * .25 - .001 ? '#ffb020' : '#e8dff0'; ctx.fill(); }
  drawMinimap();
}

function drawPanelButtons(sel, labels, dy = 0) {
  RACE_BTNS.forEach((b0, i) => {
    const b = { ...b0, y: b0.y + dy }, on = i === sel;
    rrect(b.x, b.y, b.w, b.h, 28); ctx.fillStyle = on ? 'rgba(255,255,255,.97)' : 'rgba(255,255,255,.6)'; ctx.fill();
    if (on) { ctx.lineWidth = 7; ctx.strokeStyle = '#ffe066'; ctx.stroke(); }
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2 - 12;
    if (labels[i] === 'play') { ctx.fillStyle = '#3ddc84'; ctx.beginPath(); ctx.moveTo(cx - 20, cy - 28); ctx.lineTo(cx + 28, cy); ctx.lineTo(cx - 20, cy + 28); ctx.fill(); }
    else if (labels[i] === 'again') { ctx.strokeStyle = '#3d8bff'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, 24, -.3, 4.6); ctx.stroke(); ctx.fillStyle = '#3d8bff'; ctx.beginPath(); ctx.moveTo(cx + 18, cy - 30); ctx.lineTo(cx + 34, cy - 6); ctx.lineTo(cx + 8, cy - 4); ctx.fill(); }
    else { for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { ctx.fillStyle = (r + c) % 2 ? '#222' : '#fff'; ctx.fillRect(cx - 32 + c * 16, cy - 24 + r * 16, 16, 16); } ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.strokeRect(cx - 32, cy - 24, 64, 48); }
    ctx.font = `800 22px ${FONT}`; ctx.fillStyle = '#3a2560'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText({ play: 'Weiter', again: 'Nochmal', menu: 'Strecken' }[labels[i]], cx, b.y + b.h - 20);
  });
}

function drawResults() {
  ctx.fillStyle = 'rgba(20,10,40,.6)'; ctx.fillRect(0, 0, W, H);
  const pl = R.place;
  txt(pl === 1 ? '1. Platz – Gold!' : pl === 2 ? '2. Platz – Silber!' : pl === 3 ? '3. Platz – Bronze!' : 'Geschafft!', W / 2, 70, 64, medal(pl));
  // Siegertreppchen
  const pod = [[W / 2, 250, 1], [W / 2 - 190, 290, 2], [W / 2 + 190, 320, 3]];
  for (const [x, y, place] of pod) {
    const k = R.order[place - 1]; if (!k) continue;
    rrect(x - 80, y, 160, 470 - y, 14); ctx.fillStyle = medal(place); ctx.fill();
    ctx.font = `800 54px ${FONT}`; ctx.fillStyle = '#3a2560'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(place), x, y + 60);
    if (k.id === 'fuchs') drawFox(x, y - 4 - Math.abs(Math.sin(R.t * 5)) * (place === pl ? 16 : 0), 1, R.t, 0, false);
    else drawKartBack(k, x, y - 2, .9);
  }
  if (pl > 3) { txt('Du bist ins Ziel gekommen!', W / 2, 200, 34, '#fff'); }
  rrect(W / 2 - 110, 118, 220, 44, 18); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fill();
  starShape(W / 2 - 60, 140, 16, 0); ctx.font = `800 28px ${FONT}`; ctx.fillStyle = '#3a2560'; ctx.textAlign = 'left'; ctx.fillText(`${R.gotStars} Sterne`, W / 2 - 36, 142);
  if (R.t > .8) drawPanelButtons(R.resSel, ['again', 'menu'], 150);
}

export function drawRace() {
  const cam = camera();
  drawSky(R.theme);
  drawFloor(cam);
  // Figuren sammeln und von hinten nach vorne zeichnen
  const list = [];
  for (const d of R.deco) { const p = project(cam, d.x, d.y); if (p && p.sx > -200 && p.sx < W + 200) list.push({ z: p.z, f: () => drawDeco(R.def.decor, p.sx, p.sy, p.k, d.s) }); }
  for (const s of R.stars) if (s.on) { const p = project(cam, s.x, s.y); if (p && p.z > 130 && p.sx > -60 && p.sx < W + 60) list.push({ z: p.z, f: () => starShape(p.sx, p.sy - 44 * p.k - Math.sin(R.t * 4 + s.x) * 5 * p.k, 24 * p.k, Math.sin(R.t * 3 + s.y) * .4) }); }
  for (const k of R.karts) { const p = project(cam, k.x, k.y); if (p && (k === R.me || p.z > CAM_BACK * .75) && p.sx > -150 && p.sx < W + 150) list.push({ z: p.z, f: () => drawKartBack(k, p.sx, p.sy, p.k, k.lean, k.turbo) }); }
  const arch = project(cam, R.tr.pts[0].x, R.tr.pts[0].y); if (arch) list.push({ z: arch.z, f: () => drawStartArch(cam) });
  list.sort((a, b) => b.z - a.z).forEach(o => o.f());
  if (R.me.turbo > 0) { ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; for (let i = 0; i < 10; i++) { const a = (i * 2.4 + R.t * 10) % 6.28, r1 = 380 + (i * 37) % 120; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r1, 470 + Math.sin(a) * r1 * .5); ctx.lineTo(W / 2 + Math.cos(a) * (r1 + 90), 470 + Math.sin(a) * (r1 + 90) * .5); ctx.stroke(); } }
  if (R.phase !== 'results') drawHUD();
  if (R.phase === 'count') { const c = Math.ceil(3 - R.t); txt(c > 0 ? String(c) : 'Los!', W / 2, 300, 180 - (R.t % 1) * 40, c > 0 ? '#fff' : '#3ddc84'); }
  if (R.phase === 'run' && R.t < .8) txt('Los!', W / 2, 300, 150, '#3ddc84');
  if (R.phase === 'finish') txt('Ziel!', W / 2, 300, 150, '#ffe066');
  if (R.phase === 'pause') { ctx.fillStyle = 'rgba(20,10,40,.55)'; ctx.fillRect(0, 0, W, H); txt('Pause', W / 2, H / 2 - 110, 76, '#ffe066'); drawPanelButtons(R.pauseSel, ['play', 'menu']); }
  if (R.phase === 'results') drawResults();
}

/* ---------- Streckenwahl ---------- */
export function trackCards() {
  const w = 340, h = 330, gap = 36, x0 = W / 2 - (3 * w + 2 * gap) / 2;
  return TRACKS.map((_, i) => ({ x: x0 + i * (w + gap), y: 170, w, h }));
}
const smooth = [];
export function drawRaceMenu(sel, bestPlaces, time, padActive) {
  const th = THEMES.wiese, g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#6cc75a'; ctx.fillRect(0, 560, W, 160);
  for (let i = 0; i < 12; i++) for (let r = 0; r < 2; r++) { ctx.fillStyle = (i + r) % 2 ? '#222' : '#fff'; ctx.fillRect(i * (W / 12), 540 + r * 20, W / 12, 20); }
  txt('Flinki-Rennen', W / 2, 80, 84, '#ffe066');
  trackCards().forEach((c, i) => {
    const t = TRACKS[i], on = i === sel, y = c.y - (on ? 10 : 0);
    rrect(c.x, y, c.w, c.h, 30); ctx.fillStyle = on ? '#fff' : '#fff8e8'; ctx.fill();
    ctx.lineWidth = on ? 9 : 4; ctx.strokeStyle = on ? '#ffb020' : '#d8cbe8'; ctx.stroke();
    // Mini-Strecke
    rrect(c.x + 20, y + 20, c.w - 40, 190, 20); ctx.fillStyle = t.ground; ctx.fill();
    const sm = smooth[i] || (smooth[i] = buildTrack(t).pts.map(p => [p.x, p.y]));
    let a = 1e9, b = 1e9, A = -1e9, B = -1e9; for (const [x, yy] of sm) { a = Math.min(a, x); b = Math.min(b, yy); A = Math.max(A, x); B = Math.max(B, yy); }
    const s = Math.min((c.w - 90) / (A - a), 150 / (B - b)), ox = c.x + c.w / 2 - (a + A) / 2 * s, oy = y + 115 - (b + B) / 2 * s;
    ctx.beginPath(); sm.forEach(([x, yy], k) => k ? ctx.lineTo(ox + x * s, oy + yy * s) : ctx.moveTo(ox + x * s, oy + yy * s)); ctx.closePath();
    ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = t.curb[0]; ctx.stroke(); ctx.lineWidth = 10; ctx.strokeStyle = t.road; ctx.stroke();
    ctx.font = `800 36px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a2560'; ctx.fillText(t.name, c.x + c.w / 2, y + 250);
    const bp = bestPlaces[t.id];
    if (bp) { ctx.fillStyle = medal(bp); el(c.x + c.w / 2, y + 295, 22, 22); ctx.font = `800 26px ${FONT}`; ctx.fillStyle = '#3a2560'; ctx.fillText(String(bp), c.x + c.w / 2, y + 297); }
  });
  if (Math.sin(time * 4) > -.4) txt(padActive ? '◀ ▶ wählen   A = los!' : 'Tippe auf eine Strecke', W / 2, 640, 34, '#fff');
}
