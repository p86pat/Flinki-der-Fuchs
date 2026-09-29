/* ---------- Lernrätsel: Aufgaben erzeugen ----------
 * Lernstufen: 1 Kindergarten, 2 1. Klasse, 3 2. Klasse, 4 3. Klasse.
 * p (0…1) = Fortschritt innerhalb der Stufe (spätere Welten etwas schwerer).
 * Jede Aufgabe: { type, say, prompt, options[], correct, kind, ...Daten fürs Bild }
 * kind: number | letter | shape | text | pic | side
 */
export const STAGES = [
  { id: 1, name: 'Kindergarten', sample: '3 + 2' },
  { id: 2, name: '1. Klasse', sample: '7 − 4' },
  { id: 3, name: '2. Klasse', sample: '15 + 4' },
  { id: 4, name: '3. Klasse', sample: '6 × 7' }
];

// Rätselarten je Stufe (Name fürs Eltern-Menü)
export const TYPE_NAMES = {
  count: 'Zählen', compare: 'Mehr/weniger', plus: 'Plus', minus: 'Minus', pattern: 'Muster',
  letter: 'Anlaute', missing: 'Zahlenreihen', clock: 'Uhrzeit', money: 'Geld', read: 'Wörter lesen',
  syllables: 'Silben', double: 'Verdoppeln', times: 'Einmaleins'
};
const POOLS = {
  1: ['count', 'compare', 'pattern', 'letter', 'plus'],
  2: ['count', 'plus', 'minus', 'missing', 'pattern', 'letter', 'read', 'clock', 'compare'],
  3: ['plus', 'minus', 'missing', 'double', 'clock', 'money', 'read', 'syllables', 'pattern'],
  4: ['plus', 'minus', 'times', 'missing', 'clock', 'money', 'syllables', 'read']
};

// Wörter mit Bild (pics.js) und Silben
export const WORDS = {
  Apfel: 'Ap-fel', Ball: 'Ball', Fisch: 'Fisch', Sonne: 'Son-ne', Mond: 'Mond', Haus: 'Haus', Eis: 'Eis',
  Herz: 'Herz', Pilz: 'Pilz', Wolke: 'Wol-ke', Uhr: 'Uhr', Leiter: 'Lei-ter', Zelt: 'Zelt', Fuchs: 'Fuchs',
  Stern: 'Stern', Rakete: 'Ra-ke-te', Banane: 'Ba-na-ne', Tomate: 'To-ma-te', Blume: 'Blu-me', Auto: 'Au-to'
};
const SHORT = Object.keys(WORDS).filter(w => w.length <= 4);
const LETTERS = 'ABDEFHIKLMNOPRSTUWZ';
const COUNT_OBJ = { apfel: 'Äpfel', stern: 'Sterne', fisch: 'Fische', ball: 'Bälle' };
export const SHAPES = ['kreis', 'dreieck', 'quadrat', 'stern'];
export const COLORS = ['#ff4d4d', '#3d8bff', '#3ddc84', '#ffb020', '#b18cff'];
// Schweizer Münzen in Rappen
export const COINS = [500, 200, 100, 50, 20, 10, 5];

// Stufe aus Welt (Automatik): Welt 1–2 → Kindergarten, 3–5 → 1. Klasse, 6–8 → 2. Klasse
export const autoStage = world => world < 2 ? 1 : world < 5 ? 2 : 3;

export const fmtMoney = r => r % 100 === 0 ? `${r / 100} Fr.` : `${Math.floor(r / 100)}.${String(r % 100).padStart(2, '0')} Fr.`;
export const fmtTime = (h, m) => `${h}:${String(m).padStart(2, '0')}`;

export function makeQuiz(stage = 1, p = 0, avoid = null, rnd = Math.random) {
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const pick = a => a[Math.floor(rnd() * a.length)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const lerp = (a, b) => Math.round(a + (b - a) * p);
  const finish = (q, answer, others) => {
    const opts = shuffle([answer, ...others]);
    return { stage, ...q, options: opts, correct: opts.indexOf(answer) };
  };
  // Zahl-Antworten: die richtige plus Nachbarn, nie negativ, nie doppelt
  const numOpts = (ans, n = 3, step = 1) => {
    const set = new Set(), cand = shuffle([ans - step, ans + step, ans - 2 * step, ans + 2 * step, ans + 10, ans - 10, ans + 1, ans - 1]);
    for (const c of cand) if (c >= 0 && c !== ans && set.size < n - 1) set.add(c);
    return [...set];
  };

  const pool = POOLS[stage] || POOLS[1];
  const type = pick(pool.length > 1 ? pool.filter(t => t !== avoid) : pool);

  switch (type) {
    case 'count': {
      const obj = pick(Object.keys(COUNT_OBJ)), n = int(2, stage === 1 ? lerp(5, 8) : lerp(10, 12));
      return finish({ type, obj, n, kind: 'number', prompt: 'Wie viele?', say: `Wie viele ${COUNT_OBJ[obj]} siehst du?` }, n, numOpts(n));
    }
    case 'compare': {
      const max = stage === 1 ? lerp(5, 6) : 10, obj = pick(Object.keys(COUNT_OBJ));
      let a = int(1, max), b = int(1, max); while (a === b) b = int(1, max);
      const ans = a > b ? 'links' : 'rechts';
      return finish({ type, obj, a, b, kind: 'side', prompt: 'Wo sind mehr?', say: `Wo sind mehr ${COUNT_OBJ[obj]}?` }, ans, [ans === 'links' ? 'rechts' : 'links']);
    }
    case 'plus': {
      if (stage >= 4) { // bis 100: Zehner, dann Zehner+Einer
        const a = p < .5 ? int(1, 8) * 10 : int(11, 79), b = p < .5 ? int(1, 9 - a / 10) * 10 : int(1, 9) + (rnd() < .5 ? 10 : 0);
        return finish({ type, a, b, kind: 'number', prompt: 'Rechne!', say: `Wie viel ist ${a} plus ${b}?` }, a + b, numOpts(a + b, 3, a % 10 || b % 10 ? 1 : 10));
      }
      const max = stage === 1 ? 5 : stage === 2 ? 10 : 20, a = int(1, max - 1), b = int(1, max - a);
      return finish({ type, a, b, kind: 'number', prompt: 'Rechne!', say: `Wie viel ist ${a} plus ${b}?` }, a + b, numOpts(a + b));
    }
    case 'minus': {
      if (stage >= 4) {
        const a = p < .5 ? int(3, 10) * 10 : int(30, 99), b = p < .5 ? int(1, a / 10 - 1) * 10 : int(2, 9) + (rnd() < .5 ? 10 : 0);
        return finish({ type, a, b, kind: 'number', prompt: 'Rechne!', say: `Wie viel ist ${a} minus ${b}?` }, a - b, numOpts(a - b, 3, a % 10 || b % 10 ? 1 : 10));
      }
      const max = stage === 2 ? 10 : 20, a = int(2, max), b = int(1, a - 1);
      return finish({ type, a, b, kind: 'number', prompt: 'Rechne!', say: `Wie viel ist ${a} minus ${b}?` }, a - b, numOpts(a - b));
    }
    case 'double': {
      const a = int(2, lerp(6, 10));
      return finish({ type, a, b: a, kind: 'number', prompt: 'Verdopple!', say: `Was ist das Doppelte von ${a}?` }, 2 * a, [2 * a + 2, 2 * a - 1]);
    }
    case 'times': {
      const row = p < .4 ? pick([2, 5, 10]) : int(2, 9), k = int(2, 10);
      return finish({ type, a: k, b: row, kind: 'number', prompt: 'Einmaleins', say: `Wie viel ist ${k} mal ${row}?` }, k * row, [...new Set([k * row + row, k * row - row, (k + 1) * (row + 1), k * row + 1].filter(x => x > 0 && x !== k * row))].slice(0, 2));
    }
    case 'missing': {
      const step = stage === 2 ? 1 : stage === 3 ? pick([1, 2, 5, 10]) : pick([2, 3, 4, 5, 10, 20]);
      const len = 5, top = stage === 2 ? 20 : stage === 3 ? 50 : 100;
      const start = int(stage === 2 ? 1 : 0, Math.max(1, Math.floor(top / step) - len)) * step + (stage === 2 ? 0 : 0);
      const seq = Array.from({ length: len }, (_, i) => start + i * step), hole = int(1, len - 2);
      // Ablenker, die NICHT schon in der Reihe stehen (sonst kann man ausschliessen statt zählen)
      const ans = seq[hole], swap = ans >= 10 && ans % 10 ? Number(String(ans).split('').reverse().join('')) : -1;
      const cands = shuffle([ans + 10, ans - 10, swap, ans + step * len, ans + 1 + step, ans - 1 - step, ans + 5]);
      const others = [...new Set(cands.filter(c => c >= 0 && c !== ans && !seq.includes(c)))].slice(0, 2);
      return finish({ type, seq, hole, kind: 'number', prompt: 'Welche Zahl fehlt?', say: 'Welche Zahl fehlt?' }, ans, others);
    }
    case 'clock': {
      const mins = stage === 2 ? [0] : stage === 3 ? [0, 30] : [0, 15, 30, 45];
      const h = int(1, 12), m = pick(mins);
      const ans = fmtTime(h, m), others = new Set();
      const alt = [[h % 12 + 1, m], [(h + 10) % 12 + 1, m], [h, (m + 30) % 60], [m ? h : h % 12 + 1, m ? 0 : 30], [h, (m + 15) % 60]];
      for (const [hh, mm] of shuffle(alt)) { const t = fmtTime(hh, mm); if (t !== ans && others.size < 2 && (stage > 2 || mm === 0) && (stage > 3 || mm % 30 === 0)) others.add(t); }
      while (others.size < 2) others.add(fmtTime((h + others.size + 2) % 12 + 1, m));
      return finish({ type, h, m, kind: 'text', prompt: 'Wie spät ist es?', say: 'Wie spät ist es?' }, ans, [...others]);
    }
    case 'money': {
      const kinds = stage === 3 ? [500, 200, 100] : COINS.slice(0, 6);
      const n = int(2, stage === 3 ? lerp(3, 4) : lerp(3, 5)), coins = [];
      for (let i = 0; i < n; i++) coins.push(pick(kinds));
      coins.sort((a, b) => b - a);
      const sum = coins.reduce((s, c) => s + c, 0), d = stage === 3 ? 100 : pick([10, 20, 50]);
      const others = [...new Set(shuffle([sum + d, sum - d, sum + 2 * d, sum + 100]).filter(v => v > 0 && v !== sum))].slice(0, 2);
      return finish({ type, coins, kind: 'text', prompt: 'Wie viel Geld?', say: 'Wie viel Geld ist das?' }, fmtMoney(sum), others.map(fmtMoney));
    }
    case 'read': {
      const words = Object.keys(WORDS), list = stage === 2 ? SHORT : words;
      const word = pick(list), others = shuffle(list.filter(w => w !== word)).slice(0, 2);
      if (stage >= 3 && rnd() < .5) // Wort lesen → Bild wählen
        return finish({ type, word, show: 'word', kind: 'pic', prompt: 'Lies! Welches Bild?', say: 'Lies das Wort. Welches Bild passt?' }, word, others);
      return finish({ type, word, show: 'pic', kind: 'text', prompt: 'Welches Wort passt?', say: 'Welches Wort passt zum Bild?' }, word, others);
    }
    case 'syllables': {
      const word = pick(Object.keys(WORDS)), n = WORDS[word].split('-').length;
      return finish({ type, word, kind: 'number', prompt: 'Wie viele Silben?', say: `Wie viele Silben hat ${word}? Klatsch mit!` }, n, [1, 2, 3, 4].filter(x => x !== n).sort(() => rnd() - .5).slice(0, 2));
    }
    case 'pattern': {
      const units = stage === 1 ? (p < .5 ? ['AB'] : ['AB', 'AAB']) : stage === 2 ? ['AB', 'AAB', 'ABB', 'ABC'] : ['ABC', 'AABB', 'ABB', 'ABAC'];
      const unit = pick(units), letters = [...new Set(unit)];
      const shapes = shuffle([...SHAPES]), colors = shuffle([...COLORS]);
      const byShape = stage === 1 ? rnd() < .5 : true, mixed = stage >= 3;
      const sym = {};
      letters.forEach((l, i) => sym[l] = byShape ? `${shapes[i]}:${mixed ? colors[i] : colors[0]}` : `kreis:${colors[i]}`);
      const len = unit.length >= 4 ? 7 : unit.length === 3 ? 6 : 5;
      const seq = []; for (let i = 0; i < len; i++) seq.push(sym[unit[i % unit.length]]);
      const answer = sym[unit[len % unit.length]];
      const others = Object.values(sym).filter(s => s !== answer);
      const extra = byShape ? `${shapes[letters.length]}:${mixed ? colors[letters.length] : colors[0]}` : `kreis:${colors[letters.length]}`;
      while (others.length < 2) others.push(extra);
      return finish({ type, seq, kind: 'shape', prompt: 'Was kommt dann?', say: 'Was kommt als Nächstes?' }, answer, others.slice(0, 2));
    }
    default: { // letter
      const word = pick(Object.keys(WORDS)), ans = word[0].toUpperCase(), n = stage === 1 ? 2 : 3;
      const others = shuffle(LETTERS.split('').filter(l => l !== ans)).slice(0, n - 1);
      return finish({ type: 'letter', word, kind: 'letter', prompt: 'Womit fängt es an?', say: `Womit fängt ${word} an?` }, ans, others);
    }
  }
}
