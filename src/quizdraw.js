/* ---------- Rätsel-Fenster zeichnen ---------- */
import { W, H, FONT } from './config.js';
import { ctx, el, rrect, starShape } from './gfx.js';
import { drawPic, drawShape } from './pics.js';
import { QUIZ_PANEL, QUIZ_SPEAK, QUIZ_CLOSE, quizButtons } from './ui.js';

const INK = '#3a2560';
function label(s, x, y, size, col = INK) {
  ctx.font = `800 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(s, x, y);
}
function speaker(r) {
  const x = r.x + r.w / 2, y = r.y + r.h / 2;
  rrect(r.x, r.y, r.w, r.h, 22); ctx.fillStyle = '#ffe9a8'; ctx.fill();
  ctx.fillStyle = INK; ctx.fillRect(x - 24, y - 10, 14, 20);
  ctx.beginPath(); ctx.moveTo(x - 12, y - 10); ctx.lineTo(x + 4, y - 24); ctx.lineTo(x + 4, y + 24); ctx.lineTo(x - 12, y + 10); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const rr of [12, 22]) { ctx.beginPath(); ctx.arc(x + 6, y, rr, -.8, .8); ctx.stroke(); }
}
function closeBtn(r) {
  const x = r.x + r.w / 2, y = r.y + r.h / 2;
  rrect(r.x, r.y, r.w, r.h, 22); ctx.fillStyle = '#ffd0dc'; ctx.fill();
  ctx.strokeStyle = '#c0304e'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 16, y - 16); ctx.lineTo(x + 16, y + 16); ctx.moveTo(x + 16, y - 16); ctx.lineTo(x - 16, y + 16); ctx.stroke();
}

// Objekte in Reihen zu 5 (wie ein Zehnerfeld – hilft beim Zählen)
function objectGrid(obj, n, cx, cy, maxS, crossFrom = n) {
  const perRow = 5, rows = Math.ceil(n / perRow);
  const s = Math.min(maxS, 230 / rows), gapX = s * 1.12, gapY = s * 1.05;
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / perRow), c = i % perRow;
    const inRow = Math.min(perRow, n - r * perRow);
    const x = cx - (inRow - 1) * gapX / 2 + c * gapX, y = cy - (rows - 1) * gapY / 2 + r * gapY;
    if (obj === 'stern') starShape(x, y, s * .42, 0); else drawPic(obj, x, y, s);
    if (i >= crossFrom) { // weggenommen
      ctx.strokeStyle = 'rgba(200,30,60,.85)'; ctx.lineWidth = s * .1; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - s * .4, y - s * .4); ctx.lineTo(x + s * .4, y + s * .4); ctx.moveTo(x + s * .4, y - s * .4); ctx.lineTo(x - s * .4, y + s * .4); ctx.stroke();
    }
  }
}

function content(q) {
  const cy = 320;
  if (q.type === 'count') objectGrid(q.obj, q.n, W / 2, cy, 90);
  else if (q.type === 'plus' || q.type === 'minus') {
    const op = q.type === 'plus' ? '+' : '−';
    label(`${q.a} ${op} ${q.b} = ?`, W / 2, q.a + q.b <= 10 || q.type === 'minus' && q.a <= 10 ? 235 : cy, 96);
    if (q.type === 'plus' && q.a + q.b <= 10) {
      objectGrid('apfel', q.a, W / 2 - 240, 390, 66);
      label('+', W / 2, 390, 70);
      objectGrid('apfel', q.b, W / 2 + 240, 390, 66);
    } else if (q.type === 'minus' && q.a <= 10) {
      objectGrid('apfel', q.a, W / 2, 390, 66, q.a - q.b);
    }
  } else if (q.type === 'pattern') {
    const n = q.seq.length + 1, gap = Math.min(130, 860 / n), x0 = W / 2 - (n - 1) * gap / 2;
    q.seq.forEach((k, i) => drawShape(k, x0 + i * gap, cy, gap * .36));
    const x = x0 + (n - 1) * gap;
    rrect(x - gap * .45, cy - gap * .45, gap * .9, gap * .9, 16); ctx.setLineDash([10, 8]); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); ctx.setLineDash([]);
    label('?', x, cy + 4, gap * .6);
  } else if (q.type === 'letter') {
    drawPic(q.word, W / 2, cy, 230);
  }
}

function answer(q, i, b) {
  const x = b.x + b.w / 2, y = b.y + b.h / 2, v = q.options[i];
  if (q.kind === 'number') label(String(v), x, y + 6, 104);
  else if (q.kind === 'letter') label(v, x, y + 8, 116);
  else drawShape(v, x, y, 46);
}

// Q = { q, sel, wrong[], solved, t, shake, shakeI }
export function drawQuiz(Q, padActive) {
  const q = Q.q, t = Q.t;
  const pop = Math.min(1, t * 5), sc = .85 + .15 * pop;
  ctx.fillStyle = `rgba(20,10,40,${.5 * pop})`; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2); ctx.globalAlpha = pop;
  const P = QUIZ_PANEL;
  rrect(P.x, P.y, P.w, P.h, 40); ctx.fillStyle = '#fff8e8'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#ffd43b'; ctx.stroke();
  // Kopf: Stern-Symbol, Frage, Vorlesen, Schliessen
  speaker(QUIZ_SPEAK); closeBtn(QUIZ_CLOSE);
  label(q.prompt, W / 2, 108, 58);
  content(q);
  quizButtons(q.options.length).forEach((b, i) => {
    const wrong = Q.wrong.includes(i), right = Q.solved && i === q.correct, sel = !Q.solved && i === Q.sel && !wrong;
    const dx = Q.shakeI === i && Q.shake > 0 ? Math.sin(Q.shake * 60) * 10 * Q.shake / .4 : 0;
    const lift = sel ? -6 : 0;
    ctx.save(); ctx.translate(dx, lift);
    if (wrong) ctx.globalAlpha = .35 * pop;
    rrect(b.x, b.y, b.w, b.h, 28);
    ctx.fillStyle = right ? '#b6ffcf' : '#ffffff'; ctx.fill();
    ctx.lineWidth = sel || right ? 9 : 5; ctx.strokeStyle = right ? '#3ddc84' : sel ? '#ffb020' : '#d8cbe8'; ctx.stroke();
    answer(q, i, b);
    ctx.restore();
    if (sel && padActive) { ctx.fillStyle = '#ffb020'; ctx.beginPath(); ctx.moveTo(b.x + b.w / 2 - 16, b.y - 20); ctx.lineTo(b.x + b.w / 2 + 16, b.y - 20); ctx.lineTo(b.x + b.w / 2, b.y - 4); ctx.fill(); }
  });
  if (Q.solved) {
    const k = Math.min(1, (t - Q.solvedAt) * 3);
    starShape(W / 2, 420 - k * 40, 30 + 40 * k, k * 6, '#ffd43b');
  }
  ctx.restore();
}
