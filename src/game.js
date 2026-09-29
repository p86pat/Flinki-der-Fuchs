/* ---------- Spiellogik & Hauptschleife ---------- */
import { W, H, T, STEP } from './config.js';
import { G, P } from './state.js';
import { sfx } from './audio.js';
import { LEVELS, makeLevel, loadLevels } from './levels.js';
import { tile, solid, moveX, moveY, overlap, isWater, isLadder } from './physics.js';
import { readInput, updateTouchUI } from './input.js';
import { msg, burst, updateFx } from './fx.js';
import { draw } from './render.js';
import { isUnlocked, finishLevel, best, save, setStage, recordQuiz, raceResult } from './save.js';
import { startRace, updateRace, R } from './race/race.js';
import { trackCards } from './race/race.js';
import { TRACKS } from './race/tracks.js';
import { mapNodes, NODE_R, PAUSE_BTNS, hit, hitCircle, quizButtons, QUIZ_SPEAK, QUIZ_CLOSE, STAGE_BTN, STAGE_CLOSE, STAGE_OPTS, stageCards, MODE_BTNS } from './ui.js';
import { makeQuiz, autoStage, STAGES } from './quiz.js';
import { say, hush } from './speech.js';

function startLevel(i) {
  G.levelIdx = i; G.lvl = makeLevel(i);
  const lvl = G.lvl;
  Object.assign(P, { x: lvl.sx, y: lvl.sy, vx: 0, vy: 0, face: 1, inv: 0, sq: 0, buffer: 0, coyote: 0, bounced: false, rx: lvl.sx, ry: lvl.sy, climb: false, swim: false, plat: null });
  G.cam = 0; G.parts = []; G.msgs = []; G.starsGot = 0; G.state = 'play';
  msg(LEVELS[i].name, P.x + 17, P.y - 40, '#fff');
}

function update(dt, inp) {
  const lvl = G.lvl;
  G.time += dt;
  // Bewegliche Plattformen fahren – und nehmen Flinki mit
  for (const e of lvl.ents) if (e.t === 'plat') {
    const ox = e.x, oy = e.y;
    e.x += e.vx * dt; e.y += e.vy * dt;
    if (e.x < e.minX) { e.x = e.minX; e.vx = Math.abs(e.vx); } else if (e.x > e.maxX) { e.x = e.maxX; e.vx = -Math.abs(e.vx); }
    if (e.y < e.minY) { e.y = e.minY; e.vy = Math.abs(e.vy); } else if (e.y > e.maxY) { e.y = e.maxY; e.vy = -Math.abs(e.vy); }
    e.dx = e.x - ox; e.dy = e.y - oy;
    if (P.plat === e) { moveX(P, e.dx); P.y += e.dy; }
  }

  // Spieler
  const cx = P.x + P.w / 2;
  const onLadder = isLadder(cx, P.y + P.h - 2) || isLadder(cx, P.y + 6);
  const jumpHeld = inp.jump || (inp.upJ && !onLadder);
  P.swim = isWater(cx, P.y + P.h * .55);
  const moving = inp.left !== inp.right;

  // Leiter greifen: hoch drücken (oder Sprung halten im Fallen); oben stehend: runter drücken
  if (!P.climb && onLadder && (inp.up || (inp.jump && P.vy > -150) || (inp.down && !P.onGround))) P.climb = true;
  if (!P.climb && P.onGround && inp.down && isLadder(cx, P.y + P.h + 4)) { P.climb = true; P.y += 3; }
  if (P.climb && !onLadder && !isLadder(cx, P.y + P.h + 2)) P.climb = false;

  if (P.climb) {
    const dir = (inp.down ? 1 : 0) - (inp.up || inp.jump ? 1 : 0);
    P.vy = dir * 240; P.vx = (inp.right ? 1 : 0) * 150 - (inp.left ? 1 : 0) * 150;
    if (moving) P.face = inp.left ? -1 : 1;
    P.buffer = 0; P.coyote = 0; P.bounced = false;
    moveX(P, P.vx * dt); moveY(P, P.vy * dt);
    if (P.onGround && dir >= 0) P.climb = false; // unten angekommen
    P.walk += dir || moving ? dt : 0;
  } else {
    const max = P.swim ? 220 : 340, acc = P.onGround ? 2600 : P.swim ? 1400 : 1800;
    if (inp.left && !inp.right) { P.vx -= acc * dt; P.face = -1; }
    else if (inp.right && !inp.left) { P.vx += acc * dt; P.face = 1; }
    else { const f = (P.onGround ? 2600 : 900) * dt; P.vx = Math.abs(P.vx) <= f ? 0 : P.vx - Math.sign(P.vx) * f; }
    P.vx = Math.max(-max, Math.min(max, P.vx));
    P.buffer -= dt; P.coyote = P.onGround ? .1 : P.coyote - dt;
    if (P.swim) {
      // Schwimmen: jeder Sprung ist ein Schwimmzug; an der Oberfläche hüpft Flinki hinaus
      if (P.buffer > 0) {
        const surface = !isWater(cx, P.y - 4);
        P.vy = surface ? -820 : -360; P.buffer = 0; P.bounced = surface; P.sq = -.15; sfx.swim();
        burst(cx, P.y + P.h / 2, 'rgba(255,255,255,.8)', 5, 90);
      }
      P.vy = Math.min(170, P.vy + 700 * dt);
      if (Math.random() < dt * 2) burst(cx + P.face * 14, P.y + 10, 'rgba(255,255,255,.7)', 1, 30);
    } else {
      // Jump Buffer + Coyote Time
      if (P.buffer > 0 && P.coyote > 0) { P.vy = -950; P.buffer = 0; P.coyote = 0; P.onGround = false; P.bounced = false; P.sq = -.22; sfx.jump(); }
      if (!jumpHeld && !P.bounced && P.vy < -360) P.vy = -360; // variable Sprunghöhe
      P.vy = Math.min(1100, P.vy + 2300 * dt);
    }
    const wasGround = P.onGround;
    const oldBottom = P.y + P.h;
    moveX(P, P.vx * dt); moveY(P, P.vy * dt);
    // Auf Plattformen landen (von oben, wie beim Brett)
    P.plat = null;
    if (P.vy >= 0) for (const e of lvl.ents) if (e.t === 'plat' && P.x + P.w > e.x + 4 && P.x < e.x + e.w - 4 && oldBottom <= e.y + 2 && P.y + P.h >= e.y) {
      P.y = e.y - P.h; P.vy = 0; P.onGround = true; P.plat = e; break;
    }
    if (P.onGround) { P.bounced = false; if (!wasGround) P.sq = .2; }
    P.walk += (moving && P.onGround) || P.swim ? dt : 0;
  }
  P.sq *= Math.pow(.0005, dt);
  if (P.inv > 0) P.inv -= dt;

  // Objekte
  for (const e of lvl.ents) {
    if (e.t === 'star' && !e.got) {
      const dx = (P.x + P.w / 2) - e.x, dy = (P.y + P.h / 2) - e.y;
      if (e.hidden && !e.seen && dx * dx + dy * dy < 150 * 150) { e.seen = true; sfx.select(); burst(e.x, e.y, '#ffffff', 8, 120); }
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
    } else if (e.t === 'gate') {
      if (e.open) { e.openT += dt; continue; }
      if (G.state === 'play' && P.x + P.w > e.x - 3 && P.x < e.x + T && P.y < e.y) openQuiz(e);
    } else if (e.t === 'chest') {
      if (e.open) { e.openT += dt; continue; }
      const o = overlap(P, e);
      if (o && !e.cool && G.state === 'play') openQuiz(e); else if (!o) e.cool = false;
    } else if (e.t === 'goal') {
      if (P.x + P.w > e.x - 4) {
        G.state = 'done'; G.doneT = 0; G.run[G.levelIdx] = { got: G.starsGot, total: lvl.total }; G.record = finishLevel(lvl.def, G.starsGot, lvl.total); sfx.win();
        for (let k = 0; k < 5; k++) burst(e.x, e.y - 180 - k * 10, ['#ff4d8d', '#ffd43b', '#4dc3ff', '#3ddc84', '#b18cff'][k], 14, 380);
      }
    }
  }
  // Runterfallen → zurück zum letzten Checkpoint
  if (P.y > H + 80) { Object.assign(P, { x: P.rx, y: P.ry, vx: 0, vy: 0, inv: 1, climb: false, plat: null }); sfx.oops(); msg('Hoppla! Nochmal!', P.x + 17, P.y - 30, '#fff'); }
  updateFx(dt);
  const target = Math.max(0, Math.min(lvl.w * T - W, P.x - W * .4));
  G.cam += (target - G.cam) * Math.min(1, dt * 7);
}

/* ---------- Lernrätsel ---------- */
let lastQuizType = null;
function openQuiz(src) {
  const stage = save.stage === 'auto' ? autoStage(G.levelIdx) : save.stage;
  const q = makeQuiz(stage, G.levelIdx / Math.max(1, LEVELS.length - 1), lastQuizType); lastQuizType = q.type;
  G.quiz = { q, src, sel: 0, wrong: [], solved: false, solvedAt: 0, t: 0, shake: 0, shakeI: -1 };
  G.state = 'quiz'; P.vx = 0; sfx.select();
  say(q.say);
}

function closeQuiz(solved) {
  const Q = G.quiz, e = Q.src; hush();
  G.state = 'play'; G.quiz = null;
  if (solved) {
    e.open = true; e.openT = 0; G.starsGot++; sfx.star();
    const bx = e.t === 'gate' ? e.x + T / 2 : e.x + e.w / 2, by = e.t === 'gate' ? e.y - T : e.y;
    burst(bx, by, '#ffd43b', 18, 300); msg('Super!', bx, by - 40, '#ffe066');
    if (e.t === 'gate') for (let y = 0; y <= e.cy; y++) G.lvl.g[y][e.x / T] = '.';
  } else if (e.t === 'gate') {
    moveX(P, -40); P.vx = -120; // ein Stück zurück, damit das Rätsel nicht sofort wieder aufgeht
  } else e.cool = true;       // Kiste: erst wieder, wenn man weggegangen ist
}

function chooseAnswer(i) {
  const Q = G.quiz, q = Q.q;
  if (Q.solved || Q.wrong.includes(i)) return;
  if (i === q.correct) { Q.solved = true; Q.solvedAt = Q.t; sfx.check(); say('Super!'); recordQuiz(q.type, Q.wrong.length === 0); }
  else {
    Q.wrong.push(i); Q.shake = .4; Q.shakeI = i; sfx.nope(); say('Probier nochmal!');
    const free = q.options.map((_, k) => k).filter(k => !Q.wrong.includes(k));
    if (!free.includes(Q.sel)) Q.sel = free[0];
  }
}

function updateQuiz(d, inp) {
  const Q = G.quiz; Q.t += d; Q.shake = Math.max(0, Q.shake - d);
  if (Q.solved) { if (Q.t - Q.solvedAt > 1.3) closeQuiz(true); return; }
  if (Q.t < .35) return; // kurz warten, damit ein gehaltener Sprung nicht gleich antwortet
  const n = Q.q.options.length;
  if (inp.tap) {
    const i = quizButtons(n).findIndex(b => hit(inp.tap, b));
    if (i >= 0) { Q.sel = i; chooseAnswer(i); }
    else if (hit(inp.tap, QUIZ_SPEAK)) say(Q.q.say);
    else if (hit(inp.tap, QUIZ_CLOSE)) closeQuiz(false);
    return;
  }
  const step = dir => { let k = Q.sel; for (let j = 0; j < n; j++) { k = (k + dir + n) % n; if (!Q.wrong.includes(k)) { if (k !== Q.sel) sfx.select(); Q.sel = k; return; } } };
  if (inp.startPressed) closeQuiz(false);
  else if (inp.leftPressed) step(-1);
  else if (inp.rightPressed) step(1);
  else if (inp.confirmPressed) chooseAnswer(Q.sel);
}

/* ---------- Weltkarte ---------- */
function openMap(sel, from = sel) { G.state = 'map'; G.mapSel = sel; G.mapFrom = from; G.mapT = from === sel ? 1 : 0; G.parts = []; G.msgs = []; }

function mapMove(to) {
  if (to < 0 || to >= LEVELS.length || to === G.mapSel) return;
  if (!isUnlocked(LEVELS, to)) { sfx.nope(); return; }
  G.mapFrom = G.mapSel; G.mapSel = to; G.mapT = 0; sfx.select();
}

function updateMap(d, inp) {
  G.time += d; G.mapT = Math.min(1, G.mapT + d * 3.5);
  if (inp.tap) {
    if (hit(inp.tap, STAGE_BTN)) { openStage(); return; }
    const nodes = mapNodes(LEVELS.length);
    const i = nodes.findIndex(n => hitCircle(inp.tap, n, NODE_R + 14));
    if (i < 0) return;
    G.mapFocus = 'nodes';
    if (i === G.mapSel) startLevel(i); else mapMove(i);
    return;
  }
  if (inp.startPressed) { G.state = 'title'; return; }
  // ▲ wählt den Lernstufen-Knopf, ▼ zurück zu den Welten
  if (inp.upPressed && G.mapFocus !== 'stage') { G.mapFocus = 'stage'; sfx.select(); return; }
  if (G.mapFocus === 'stage') {
    if (inp.downPressed || inp.leftPressed || inp.rightPressed) { G.mapFocus = 'nodes'; sfx.select(); }
    else if (inp.jumpPressed || inp.confirmPressed) openStage();
    return;
  }
  if (inp.leftPressed) mapMove(G.mapSel - 1);
  else if (inp.rightPressed) mapMove(G.mapSel + 1);
  else if (inp.confirmPressed && G.mapT >= 1) startLevel(G.mapSel);
}

/* ---------- Lernstufe wählen (mit Lernstand für Eltern) ---------- */
function openStage() { G.state = 'stage'; G.stageSel = Math.max(0, STAGE_OPTS.indexOf(save.stage)); G.stageT = 0; sfx.select(); }
function updateStage(d, inp) {
  G.time += d; G.stageT += d;
  const choose = i => { setStage(STAGE_OPTS[i]); sfx.check(); G.state = 'map'; G.mapFocus = 'nodes'; };
  if (inp.tap) {
    const i = stageCards().findIndex(c => hit(inp.tap, c));
    if (i >= 0) choose(i); else if (hit(inp.tap, STAGE_CLOSE)) G.state = 'map';
    return;
  }
  if (G.stageT < .25) return;
  if (inp.startPressed) { G.state = 'map'; return; }
  if (inp.leftPressed && G.stageSel > 0) { G.stageSel--; sfx.select(); }
  else if (inp.rightPressed && G.stageSel < STAGE_OPTS.length - 1) { G.stageSel++; sfx.select(); }
  else if (inp.confirmPressed) choose(G.stageSel);
}

/* ---------- Pause-Menü: [weiter] [Karte] ---------- */
function updatePause(d, inp) {
  G.time += d;
  if (inp.tap) {
    const i = PAUSE_BTNS.findIndex(b => hit(inp.tap, b));
    if (i === 0) G.state = 'play'; else if (i === 1) openMap(G.levelIdx);
    return;
  }
  if (inp.leftPressed && G.pauseSel !== 0) { G.pauseSel = 0; sfx.select(); }
  if (inp.rightPressed && G.pauseSel !== 1) { G.pauseSel = 1; sfx.select(); }
  if (inp.startPressed) G.state = 'play';
  else if (inp.confirmPressed) { if (G.pauseSel === 0) G.state = 'play'; else openMap(G.levelIdx); }
}

/* ---------- Loop (feste Physik-Schrittweite) ---------- */
let last = performance.now(), accT = 0;
function frame(now) {
  const d = Math.min(.05, (now - last) / 1000); last = now;
  const inp = readInput();
  if (G.state === 'title') {
    G.time += d;
    // Modus wählen: Abenteuer oder Rennen
    let pick = -1;
    if (inp.tap) pick = MODE_BTNS.findIndex(b => hit(inp.tap, b));
    else {
      if (inp.leftPressed && G.titleSel) { G.titleSel = 0; sfx.select(); }
      if (inp.rightPressed && !G.titleSel) { G.titleSel = 1; sfx.select(); }
      if (inp.confirmPressed) pick = G.titleSel;
    }
    if (pick === 1) { G.titleSel = 1; G.state = 'racemenu'; sfx.select(); }
    else if (pick === 0) {
      // Auf der Karte bei der ersten noch nicht geschafften Welt beginnen
      let i = LEVELS.findIndex(l => !best(l)); if (i < 0) i = LEVELS.length - 1;
      openMap(i);
    }
  }
  else if (G.state === 'racemenu') {
    G.time += d;
    let pick = -1;
    if (inp.tap) pick = trackCards().findIndex(c => hit(inp.tap, c));
    else {
      if (inp.leftPressed && G.raceSel > 0) { G.raceSel--; sfx.select(); }
      if (inp.rightPressed && G.raceSel < TRACKS.length - 1) { G.raceSel++; sfx.select(); }
      if (inp.startPressed) G.state = 'title';
      else if (inp.confirmPressed) pick = G.raceSel;
    }
    if (pick >= 0) { G.raceSel = pick; startRace(pick); G.state = 'race'; }
  }
  else if (G.state === 'race') {
    G.time += d;
    const wasPhase = R.phase;
    if (updateRace(d, inp) === 'menu') G.state = 'racemenu';
    if (wasPhase !== 'finish' && R.phase === 'finish') raceResult(R.def.id, R.place);
  }
  else if (G.state === 'map') updateMap(d, inp);
  else if (G.state === 'stage') updateStage(d, inp);
  else if (G.state === 'play') {
    if (inp.startPressed) { G.state = 'pause'; G.pauseSel = 0; }
    else {
      const atLadder = isLadder(P.x + P.w / 2, P.y + P.h - 2) || isLadder(P.x + P.w / 2, P.y + 6);
      if (inp.jumpPressed || (inp.upJPressed && !atLadder)) P.buffer = .14;
      accT += d; while (accT >= STEP) { update(STEP, inp); accT -= STEP; if (G.state !== 'play') break; }
    }
  }
  else if (G.state === 'pause') updatePause(d, inp);
  else if (G.state === 'quiz') { G.time += d; updateQuiz(d, inp); }
  else if (G.state === 'done') {
    G.time += d; G.doneT += d; updateFx(d);
    if (G.doneT > .8 && inp.confirmPressed) {
      const last = G.levelIdx === LEVELS.length - 1;
      if (last && LEVELS.every(l => best(l))) { G.state = 'win'; G.parts = []; sfx.win(); }
      else openMap(last ? G.levelIdx : G.levelIdx + 1, G.levelIdx); // Flinki hüpft zur nächsten Welt
    }
  }
  else if (G.state === 'win') {
    G.time += d; updateFx(d);
    if (Math.random() < d * 3) burst(Math.random() * W, Math.random() * 300, ['#ff4d8d', '#ffd43b', '#4dc3ff', '#3ddc84'][Math.floor(Math.random() * 4)], 12, 300);
    if (inp.confirmPressed) openMap(G.levelIdx);
  }
  if (G.state !== 'play') accT = 0;
  updateTouchUI(G.state === 'play' || (G.state === 'race' && (R.phase === 'run' || R.phase === 'count')), G.state === 'race' ? 'Turbo' : 'Hopp');
  draw();
  requestAnimationFrame(frame);
}
if (document.fonts && document.fonts.load) document.fonts.load(`800 40px 'Baloo 2'`).catch(() => {});
try {
  await loadLevels();
  last = performance.now();
  requestAnimationFrame(frame);
} catch (e) {
  console.error(e);
  document.body.insertAdjacentHTML('beforeend', `<p style="position:fixed;inset:auto 0 40%;text-align:center;color:#fff;font:800 32px 'Baloo 2',sans-serif">Level konnten nicht geladen werden 😕<br><small>${e.message}</small></p>`);
}
