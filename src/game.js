/* ---------- Spiellogik & Hauptschleife ---------- */
import { W, H, T, STEP } from './config.js';
import { G, P } from './state.js';
import { sfx } from './audio.js';
import { LEVELS, makeLevel } from './levels.js';
import { tile, solid, moveX, moveY, overlap } from './physics.js';
import { readInput, updateTouchUI } from './input.js';
import { msg, burst, updateFx } from './fx.js';
import { draw } from './render.js';

function startLevel(i) {
  G.levelIdx = i; G.lvl = makeLevel(i);
  const lvl = G.lvl;
  Object.assign(P, { x: lvl.sx, y: lvl.sy, vx: 0, vy: 0, face: 1, inv: 0, sq: 0, buffer: 0, coyote: 0, bounced: false, rx: lvl.sx, ry: lvl.sy });
  G.cam = 0; G.parts = []; G.msgs = []; G.starsGot = 0; G.state = 'play';
  msg(LEVELS[i].name, P.x + 17, P.y - 40, '#fff');
}

function update(dt, inp) {
  const lvl = G.lvl;
  G.time += dt;
  // Spieler
  const max = 340, acc = P.onGround ? 2600 : 1800;
  const moving = inp.left !== inp.right;
  if (inp.left && !inp.right) { P.vx -= acc * dt; P.face = -1; }
  else if (inp.right && !inp.left) { P.vx += acc * dt; P.face = 1; }
  else { const f = (P.onGround ? 2600 : 900) * dt; P.vx = Math.abs(P.vx) <= f ? 0 : P.vx - Math.sign(P.vx) * f; }
  P.vx = Math.max(-max, Math.min(max, P.vx));
  // Jump Buffer + Coyote Time
  P.buffer -= dt; P.coyote = P.onGround ? .1 : P.coyote - dt;
  if (P.buffer > 0 && P.coyote > 0) { P.vy = -950; P.buffer = 0; P.coyote = 0; P.onGround = false; P.bounced = false; P.sq = -.22; sfx.jump(); }
  if (!inp.jump && !P.bounced && P.vy < -360) P.vy = -360; // variable Sprunghöhe
  P.vy = Math.min(1100, P.vy + 2300 * dt);
  const wasGround = P.onGround;
  moveX(P, P.vx * dt); moveY(P, P.vy * dt);
  if (P.onGround) { P.bounced = false; if (!wasGround) P.sq = .2; }
  P.sq *= Math.pow(.0005, dt);
  P.walk += moving && P.onGround ? dt : 0;
  if (P.inv > 0) P.inv -= dt;

  // Objekte
  for (const e of lvl.ents) {
    if (e.t === 'star' && !e.got) {
      const dx = (P.x + P.w / 2) - e.x, dy = (P.y + P.h / 2) - e.y;
      if (dx * dx + dy * dy < 36 * 36) { e.got = true; G.starsGot++; sfx.star(); burst(e.x, e.y, '#ffd43b', 10, 220); }
    } else if (e.t === 'snail') {
      if (e.dead > 0) { e.dead -= dt; continue; }
      if (e.dead < 0) continue;
      const nx = e.x + e.vx * dt, front = e.vx < 0 ? Math.floor(nx / T) : Math.floor((nx + e.w) / T), ty = Math.floor((e.y + e.h - 1) / T);
      const below = tile(front, ty + 1);
      if (solid(tile(front, ty)) || !(solid(below) || below === '-')) e.vx = -e.vx; else e.x = nx;
      if (overlap(P, e)) {
        if (P.vy > 0 && P.y + P.h < e.y + e.h * .7) {
          e.dead = .5; P.vy = inp.jump ? -820 : -600; P.bounced = inp.jump; sfx.stomp(); burst(e.x + e.w / 2, e.y + e.h / 2, '#ff7eb0', 12, 240); msg('Plopp!', e.x + e.w / 2, e.y - 10, '#ffe066');
          setTimeout(() => { e.dead = -1; }, 500);
        } else if (P.inv <= 0) {
          // Gegner schubsen nur weg
          P.vx = (P.x + P.w / 2 < e.x + e.w / 2 ? -1 : 1) * 380; P.vy = -480; P.bounced = true; P.inv = 1.4; sfx.ouch(); msg('Autsch!', P.x + 17, P.y - 20, '#fff');
        }
      }
    } else if (e.t === 'shroom') {
      if (e.sq > 0) e.sq -= dt;
      if (overlap(P, e) && P.vy > 0 && P.y + P.h <= e.y + 20) { P.y = e.y - P.h; P.vy = -1400; P.bounced = true; e.sq = .25; sfx.boing(); burst(e.x + 24, e.y, '#ffffff', 8, 160); }
    } else if (e.t === 'check' && !e.on) {
      if (P.x + P.w / 2 > e.x) { e.on = true; P.rx = e.x - 17; P.ry = e.y - P.h; sfx.check(); msg('Gespeichert!', e.x, e.y - 110, '#b6ffcf'); burst(e.x, e.y - 80, '#3ddc84', 14, 220); }
    } else if (e.t === 'goal') {
      if (P.x + P.w > e.x - 4) {
        G.state = 'done'; G.doneT = 0; G.run[G.levelIdx] = { got: G.starsGot, total: lvl.total }; sfx.win();
        for (let k = 0; k < 5; k++) burst(e.x, e.y - 180 - k * 10, ['#ff4d8d', '#ffd43b', '#4dc3ff', '#3ddc84', '#b18cff'][k], 14, 380);
      }
    }
  }
  // Runterfallen → zurück zum letzten Checkpoint
  if (P.y > H + 80) { Object.assign(P, { x: P.rx, y: P.ry, vx: 0, vy: 0, inv: 1 }); sfx.oops(); msg('Hoppla! Nochmal!', P.x + 17, P.y - 30, '#fff'); }
  updateFx(dt);
  const target = Math.max(0, Math.min(lvl.w * T - W, P.x - W * .4));
  G.cam += (target - G.cam) * Math.min(1, dt * 7);
}

/* ---------- Loop (feste Physik-Schrittweite) ---------- */
let last = performance.now(), accT = 0;
function frame(now) {
  const d = Math.min(.05, (now - last) / 1000); last = now;
  const inp = readInput();
  if (G.state === 'title') { G.time += d; if (inp.confirmPressed) { G.run = []; startLevel(0); } }
  else if (G.state === 'play') {
    if (inp.startPressed) { G.state = 'pause'; }
    else {
      if (inp.jumpPressed) P.buffer = .14;
      accT += d; while (accT >= STEP) { update(STEP, inp); accT -= STEP; if (G.state !== 'play') break; }
    }
  }
  else if (G.state === 'pause') { G.time += d; if (inp.startPressed || inp.confirmPressed) G.state = 'play'; }
  else if (G.state === 'done') {
    G.time += d; G.doneT += d; updateFx(d);
    if (G.doneT > .8 && inp.confirmPressed) {
      if (G.levelIdx < LEVELS.length - 1) startLevel(G.levelIdx + 1);
      else { G.state = 'win'; G.parts = []; sfx.win(); }
    }
  }
  else if (G.state === 'win') {
    G.time += d; updateFx(d);
    if (Math.random() < d * 3) burst(Math.random() * W, Math.random() * 300, ['#ff4d8d', '#ffd43b', '#4dc3ff', '#3ddc84'][Math.floor(Math.random() * 4)], 12, 300);
    if (inp.confirmPressed) { G.state = 'title'; }
  }
  updateTouchUI(G.state === 'play');
  draw();
  requestAnimationFrame(frame);
}
if (document.fonts && document.fonts.load) document.fonts.load(`800 40px 'Baloo 2'`).catch(() => {});
requestAnimationFrame(frame);
