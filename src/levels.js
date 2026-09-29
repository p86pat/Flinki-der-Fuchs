/* ---------- Levels laden ----------
 * Die Reihenfolge der Welten steht in levels/index.json.
 */
import { parseLevel, buildLevel } from './levelformat.js';

export const LEVELS = [];
const DIR = new URL('../levels/', import.meta.url);

export async function loadLevels() {
  const files = await (await fetch(new URL('index.json', DIR))).json();
  const texts = await Promise.all(files.map(f => fetch(new URL(f, DIR)).then(r => { if (!r.ok) throw new Error(f + ': ' + r.status); return r.text(); })));
  LEVELS.length = 0;
  texts.forEach((t, i) => LEVELS.push(parseLevel(t, files[i].replace(/\.txt$/, ''))));
}

export function makeLevel(i) { return buildLevel(LEVELS[i], i); }
