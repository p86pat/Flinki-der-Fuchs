/* ---------- Eingabe: Tastatur, Touch, Gamepad ---------- */
import { audio } from './audio.js';
import { W, H } from './config.js';

const keys = {}, hitKeys = {}; // hitKeys: seit der letzten Abfrage gedrückt (auch ganz kurze Tipper)
addEventListener('keydown', e => { keys[e.code] = true; if (!e.repeat) hitKeys[e.code] = true; audio(); if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); });
addEventListener('keyup', e => { keys[e.code] = false; });

const touch = { l: false, r: false, j: false, p: false };
let tapped = false, tapPos = null, prev = { jump: false, start: false, confirm: false, left: false, right: false };
export let padActive = false;
export const isTouch = ('ontouchstart' in window) || matchMedia('(pointer:coarse)').matches;

// Tippen auf das Bild: Position in Spielkoordinaten (1280×720) merken
const cv = document.getElementById('c');
cv.addEventListener('pointerdown', e => {
  const r = cv.getBoundingClientRect();
  tapped = true; tapPos = { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; audio();
});
[['bl', 'l'], ['br', 'r'], ['bj', 'j'], ['bp', 'p']].forEach(([id, k]) => {
  const el = document.getElementById(id);
  const on = e => { e.preventDefault(); touch[k] = true; audio(); if (k === 'j') tapped = true; el.style.background = 'rgba(255,255,255,.5)'; };
  const off = e => { e.preventDefault(); touch[k] = false; el.style.background = ''; };
  el.addEventListener('pointerdown', on); ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => el.addEventListener(n, off));
});
document.addEventListener('gesturestart', e => e.preventDefault());

const KEYMAP = {
  left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'],
  jump: ['Space'], up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
  start: ['Escape', 'KeyP'], enter: ['Enter']
};
const held = n => KEYMAP[n].some(c => keys[c]);
const hitNow = n => KEYMAP[n].some(c => hitKeys[c]);

// Einmal pro Frame aufrufen. Liefert gehaltene Tasten und Flanken (…Pressed).
export function readInput() {
  let left = held('left') || touch.l, right = held('right') || touch.r;
  let jump = held('jump') || touch.j;
  let up = held('up'), down = held('down'), upJ = up; // upJ: «hoch» als Sprung (Tastatur, Steuerkreuz – nicht Stick)
  let start = held('start') || touch.p, confirm = held('enter');
  let pa = false;
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const p of pads) { if (!p) continue; pa = true;
    const bt = i => p.buttons[i] && p.buttons[i].pressed, ax = p.axes[0] || 0, ay = p.axes[1] || 0;
    if (ax < -.4 || bt(14)) left = true; if (ax > .4 || bt(15)) right = true;
    if (ay < -.6 || bt(12)) up = true; if (bt(12)) upJ = true; if (ay > .6 || bt(13)) down = true;
    if (bt(0) || bt(1) || bt(2) || bt(3)) jump = true;
    if (bt(9) || bt(8)) start = true;
  }
  padActive = pa; confirm = confirm || jump;
  // Flanke: jetzt gedrückt und vorher nicht – oder ein kurzer Tipper zwischen zwei Frames
  const edge = (now, was, n) => (now && !was) || hitNow(n);
  const jumpPressed = edge(jump, prev.jump, 'jump');
  const upPressed = edge(up, prev.up, 'up'), upJPressed = edge(upJ, prev.upJ, 'up');
  const out = {
    left: left || hitNow('left'), right: right || hitNow('right'), jump: jump || hitNow('jump'),
    up: up || hitNow('up'), down: down || hitNow('down'), upPressed, downPressed: edge(down, prev.down, 'down'),
    upJ: upJ || hitNow('up'), upJPressed,
    jumpPressed, startPressed: edge(start, prev.start, 'start'),
    confirmPressed: (confirm && !prev.confirm) || hitNow('enter') || jumpPressed || upJPressed || tapped,
    leftPressed: edge(left, prev.left, 'left'), rightPressed: edge(right, prev.right, 'right'),
    tap: tapPos // null oder {x,y} – nur im Frame des Antippens
  };
  if (out.confirmPressed || out.jumpPressed) audio();
  prev = { jump, start, confirm, left, right, up, down, upJ };
  for (const c in hitKeys) delete hitKeys[c];
  tapped = false; tapPos = null; return out;
}

const touchUI = document.getElementById('touch');
const jumpBtn = document.getElementById('bj');
export function updateTouchUI(playing, jumpLabel = 'Hopp') {
  touchUI.classList.toggle('hidden', !(isTouch && !padActive && playing));
  if (jumpBtn.textContent !== jumpLabel) jumpBtn.textContent = jumpLabel;
}

/* Vollbild */
const fsBtn = document.getElementById('fs');
const de = document.documentElement;
const reqFS = de.requestFullscreen || de.webkitRequestFullscreen;
// Als installierte App (Home-Bildschirm) ist das Spiel schon im Vollbild.
const installed = navigator.standalone || matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches;
// iPhone: Safari kennt kein Vollbild für Webseiten → der Knopf zeigt stattdessen die Anleitung «Zum Home-Bildschirm»
const iOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const homeHint = document.getElementById('homehint');
if (installed || (!reqFS && !iOS)) fsBtn.classList.add('hidden');
fsBtn.addEventListener('click', () => {
  if (!reqFS) { homeHint.classList.remove('hidden'); fsBtn.blur(); return; }
  const inFS = document.fullscreenElement || document.webkitFullscreenElement;
  try { if (inFS) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else reqFS.call(de); } catch (e) {}
  fsBtn.blur();
});
const closeHint = e => { e.preventDefault(); e.stopPropagation(); homeHint.classList.add('hidden'); };
document.getElementById('homehint-ok').addEventListener('click', closeHint);
homeHint.addEventListener('pointerdown', e => { if (e.target === homeHint) closeHint(e); });
