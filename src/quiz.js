/* ---------- Lernrätsel: Aufgaben erzeugen ----------
 * Arten: count (zählen), plus, minus, pattern (Muster fortsetzen), letter (Anlaut).
 * Die Schwierigkeit steigt mit der Welt (0 = erste Welt).
 * Jede Aufgabe: { type, say, prompt, options[], correct, kind, ...Daten fürs Bild }
 */
export const WORDS = ['Apfel', 'Ball', 'Fisch', 'Sonne', 'Mond', 'Haus', 'Eis', 'Herz', 'Pilz', 'Wolke', 'Uhr', 'Leiter', 'Zelt', 'Fuchs', 'Stern', 'Rakete'];
const LETTERS = 'ABDEFHIKLMNOPRSTUWZ';
const COUNT_OBJ = { apfel: 'Äpfel', stern: 'Sterne', fisch: 'Fische', ball: 'Bälle' };
export const SHAPES = ['kreis', 'dreieck', 'quadrat', 'stern'];
export const COLORS = ['#ff4d4d', '#3d8bff', '#3ddc84', '#ffb020', '#b18cff'];

const lvl = (arr, w) => arr[Math.min(w, arr.length - 1)];

export function makeQuiz(world = 0, avoid = null, rnd = Math.random) {
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const pick = a => a[Math.floor(rnd() * a.length)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const finish = (q, answer, others) => {
    const opts = shuffle([answer, ...others]);
    return { ...q, options: opts, correct: opts.indexOf(answer) };
  };
  // Zahl-Antworten: die richtige plus Nachbarn (±1, ±2), nie negativ
  const numOpts = (ans, n) => {
    const set = new Set(), cand = shuffle([ans - 1, ans + 1, ans - 2, ans + 2, ans + 3]);
    for (const c of cand) if (c >= 0 && c !== ans && set.size < n - 1) set.add(c);
    return [...set];
  };

  const pool = ['count', 'pattern', 'letter'];
  if (world >= 1) pool.push('plus');
  if (world >= 2) pool.push('minus');
  const type = pick(pool.length > 1 ? pool.filter(t => t !== avoid) : pool);

  if (type === 'count') {
    const obj = pick(Object.keys(COUNT_OBJ)), n = int(2, lvl([5, 6, 8, 10, 12, 15, 18, 20], world));
    return finish({ type, obj, n, kind: 'number', prompt: 'Wie viele?', say: `Wie viele ${COUNT_OBJ[obj]} siehst du?` }, n, numOpts(n, 3));
  }
  if (type === 'plus') {
    const max = lvl([5, 6, 10, 10, 15, 20, 20, 20], world), a = int(1, max - 1), b = int(1, max - a);
    return finish({ type, a, b, kind: 'number', prompt: 'Rechne!', say: `Wie viel ist ${a} plus ${b}?` }, a + b, numOpts(a + b, 3));
  }
  if (type === 'minus') {
    const max = lvl([5, 6, 8, 10, 15, 20, 20, 20], world), a = int(2, max), b = int(1, a - 1);
    return finish({ type, a, b, kind: 'number', prompt: 'Rechne!', say: `Wie viel ist ${a} minus ${b}?` }, a - b, numOpts(a - b, 3));
  }
  if (type === 'pattern') {
    const units = world < 2 ? ['AB'] : world < 4 ? ['AB', 'AAB', 'ABB'] : ['ABC', 'AABB', 'ABB', 'ABAC'];
    const unit = pick(units), letters = [...new Set(unit)];
    // Symbole: am Anfang nur Form ODER Farbe verschieden, später beides
    const shapes = shuffle([...SHAPES]), colors = shuffle([...COLORS]);
    const byShape = world < 3 ? rnd() < .5 : true;
    const sym = {};
    letters.forEach((l, i) => sym[l] = byShape ? `${shapes[i]}:${world < 3 ? colors[0] : colors[i]}` : `kreis:${colors[i]}`);
    const len = unit.length >= 4 ? 7 : unit.length === 3 ? 6 : 5;
    const seq = []; for (let i = 0; i < len; i++) seq.push(sym[unit[i % unit.length]]);
    const answer = sym[unit[len % unit.length]];
    const others = Object.values(sym).filter(s => s !== answer);
    const extra = byShape ? `${shapes[letters.length]}:${world < 3 ? colors[0] : colors[letters.length]}` : `kreis:${colors[letters.length]}`;
    while (others.length < 2) others.push(extra);
    return finish({ type, seq, kind: 'shape', prompt: 'Was kommt dann?', say: 'Was kommt als Nächstes?' }, answer, others.slice(0, 2));
  }
  // letter
  const word = pick(WORDS), ans = word[0].toUpperCase(), n = world === 0 ? 2 : 3;
  const others = shuffle(LETTERS.split('').filter(l => l !== ans)).slice(0, n - 1);
  return finish({ type: 'letter', word, kind: 'letter', prompt: 'Womit fängt es an?', say: `Womit fängt ${word} an?` }, ans, others);
}
