/* ---------- Sound (WebAudio) ---------- */
let ac = null;

// Muss aus einer Benutzeraktion heraus aufgerufen werden (Safari).
export function audio() {
  try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) {}
}

function tone(f, d, type, vol, slide, delay) {
  if (!ac) return; const t = ac.currentTime + (delay || 0);
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
  g.gain.setValueAtTime(vol || .1, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + .03);
}

export const sfx = {
  jump: () => tone(420, .16, 'square', .07, 820),
  star: () => { tone(988, .08, 'triangle', .16); tone(1319, .14, 'triangle', .16, 0, .07); },
  stomp: () => tone(320, .14, 'square', .09, 120),
  boing: () => tone(220, .35, 'triangle', .2, 880),
  ouch: () => tone(260, .22, 'sawtooth', .06, 120),
  check: () => [523, 659, 784].forEach((f, i) => tone(f, .14, 'triangle', .14, 0, i * .09)),
  oops: () => tone(500, .35, 'triangle', .12, 200),
  swim: () => tone(300, .12, 'sine', .08, 520),
  select: () => tone(660, .07, 'triangle', .1, 880),
  nope: () => tone(180, .18, 'triangle', .12, 140),
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .18, 'triangle', .15, 0, i * .12))
};
