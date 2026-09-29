/* ---------- Vorlesen (Web Speech API) ----------
 * Liest Rätselfragen vor, damit auch Kinder mitspielen können, die noch nicht lesen.
 * Auf dem iPad sind deutsche Stimmen eingebaut und funktionieren offline.
 */
const ok = 'speechSynthesis' in window;
let voice = null;
export const speech = { on: true };

function pickVoice() {
  const vs = speechSynthesis.getVoices().filter(v => /^de[-_]/i.test(v.lang));
  voice = vs.find(v => /Anna|Petra|Helena|Marlene|Vicki/i.test(v.name)) || vs[0] || null;
}
if (ok) { pickVoice(); speechSynthesis.addEventListener?.('voiceschanged', pickVoice); }

export function say(text) {
  if (!ok || !speech.on) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE'; if (voice) u.voice = voice;
    u.rate = .9; u.pitch = 1.1;
    speechSynthesis.speak(u);
  } catch (e) {}
}
export function hush() { if (ok) try { speechSynthesis.cancel(); } catch (e) {} }
