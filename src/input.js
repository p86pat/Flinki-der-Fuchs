/* ---------- Eingabe: Tastatur, Touch, Gamepad ---------- */
import { audio } from './audio.js';

const keys = {};
addEventListener('keydown', e => { keys[e.code] = true; audio(); if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); });
addEventListener('keyup', e => { keys[e.code] = false; });

const touch = { l: false, r: false, j: false };
let tapped = false, prev = { jump: false, start: false, confirm: false };
export let padActive = false;
export const isTouch = ('ontouchstart' in window) || matchMedia('(pointer:coarse)').matches;

document.getElementById('c').addEventListener('pointerdown', () => { tapped = true; audio(); });
[['bl', 'l'], ['br', 'r'], ['bj', 'j']].forEach(([id, k]) => {
  const el = document.getElementById(id);
  const on = e => { e.preventDefault(); touch[k] = true; audio(); if (k === 'j') tapped = true; el.style.background = 'rgba(255,255,255,.5)'; };
  const off = e => { e.preventDefault(); touch[k] = false; el.style.background = ''; };
  el.addEventListener('pointerdown', on); ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => el.addEventListener(n, off));
});
document.addEventListener('gesturestart', e => e.preventDefault());

// Einmal pro Frame aufrufen. Liefert gehaltene Tasten und Flanken (…Pressed).
export function readInput() {
  let left = !!(keys.ArrowLeft || keys.KeyA) || touch.l, right = !!(keys.ArrowRight || keys.KeyD) || touch.r;
  let jump = !!(keys.Space || keys.ArrowUp || keys.KeyW) || touch.j;
  let start = !!(keys.Escape || keys.KeyP), confirm = !!keys.Enter;
  let pa = false;
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const p of pads) { if (!p) continue; pa = true;
    const bt = i => p.buttons[i] && p.buttons[i].pressed, ax = p.axes[0] || 0;
    if (ax < -.4 || bt(14)) left = true; if (ax > .4 || bt(15)) right = true;
    if (bt(0) || bt(1) || bt(2) || bt(3) || bt(12)) jump = true;
    if (bt(9) || bt(8)) start = true;
  }
  padActive = pa; confirm = confirm || jump;
  const out = { left, right, jump, jumpPressed: jump && !prev.jump, startPressed: start && !prev.start, confirmPressed: (confirm && !prev.confirm) || tapped };
  if (out.confirmPressed || out.jumpPressed) audio();
  prev = { jump, start, confirm }; tapped = false; return out;
}

const touchUI = document.getElementById('touch');
export function updateTouchUI(playing) { touchUI.classList.toggle('hidden', !(isTouch && !padActive && playing)); }

/* Vollbild */
const fsBtn = document.getElementById('fs');
const de = document.documentElement;
const reqFS = de.requestFullscreen || de.webkitRequestFullscreen;
// Als installierte App (Home-Bildschirm) ist das Spiel schon im Vollbild.
const installed = navigator.standalone || matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches;
if (!reqFS || installed) fsBtn.classList.add('hidden');
fsBtn.addEventListener('click', () => {
  const inFS = document.fullscreenElement || document.webkitFullscreenElement;
  try { if (inFS) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else reqFS.call(de); } catch (e) {}
  fsBtn.blur();
});
