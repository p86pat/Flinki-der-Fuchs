/* ---------- Spielstand (localStorage) ----------
 * best: { <level-id>: { got, total } } – beste Sternzahl je Level.
 * Eine Welt ist frei, wenn die vorherige geschafft ist.
 * Zum Testen: ?alle im Adress-Link schaltet alle Welten frei (wird nicht gespeichert).
 */
const KEY = 'flinki-spielstand-v1';
const ALL = new URLSearchParams(location.search).has('alle');

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s.best === 'object' && s.best) return { best: s.best };
  } catch (e) {}
  return { best: {} };
}
export const save = load();

function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} }

export function best(def) { return save.best[def.id] || null; }

export function isUnlocked(levels, i) { return ALL || i === 0 || !!best(levels[i - 1]); }

// Nach dem Ziel aufrufen. Gibt true zurück, wenn es ein neuer Rekord ist.
export function finishLevel(def, got, total) {
  const b = best(def), prevGot = b && b.total === total ? b.got : -1; // Level geändert → neu zählen
  if (got <= prevGot) return false;
  save.best[def.id] = { got, total };
  persist();
  return true;
}

export function resetSave() { save.best = {}; persist(); }
