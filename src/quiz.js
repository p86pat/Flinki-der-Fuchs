/* ---------- Lernrätsel: Aufgaben erzeugen ----------
 * Lernstufen: 1 Kindergarten, 2 1. Klasse, 3 2. Klasse, 4 3. Klasse.
 * p (0…1) = Fortschritt innerhalb der Stufe (spätere Welten etwas schwerer).
 * Jede Aufgabe: { type, say, prompt, options[], correct, kind, ...Daten fürs Bild }
 * kind: number | letter | shape | text | pic | side
 */
export const STAGES = [
  { id: 1, name: 'Kindergarten', sample: '3 + 2' },
  { id: 2, name: '1. Klasse', sample: '7 − 4' },
  { id: 3, name: '2. Klasse', sample: '37 + 8' },
  { id: 4, name: '3. Klasse', sample: '456 + 38' }
];

// Rätselarten je Stufe (Name fürs Eltern-Menü)
export const TYPE_NAMES = {
  count: 'Zählen', compare: 'Mehr/weniger', plus: 'Plus', minus: 'Minus', pattern: 'Muster',
  letter: 'Anlaute', missing: 'Zahlenreihen', clock: 'Uhrzeit', money: 'Geld', read: 'Wörter lesen',
  syllables: 'Silben', double: 'Verdoppeln', half: 'Halbieren', times: 'Einmaleins', divide: 'Geteilt',
  gap: 'Platzhalter', story: 'Textaufgaben', bigger: 'Grösser/kleiner'
};
const POOLS = {
  1: ['count', 'compare', 'pattern', 'letter', 'plus'],
  2: ['count', 'plus', 'minus', 'missing', 'pattern', 'letter', 'read', 'clock', 'compare'],
  // 2. und 3. Klasse: Rechnen kommt öfter vor (doppelte Einträge = häufiger)
  3: ['plus', 'plus', 'minus', 'minus', 'times', 'times', 'gap', 'double', 'half', 'story', 'missing', 'clock', 'money', 'read', 'syllables'],
  4: ['plus', 'plus', 'minus', 'minus', 'times', 'times', 'divide', 'divide', 'gap', 'gap', 'story', 'story', 'bigger', 'missing', 'clock', 'money']
};
const NAMES = [['Lena', 'Sie'], ['Tim', 'Er'], ['Mia', 'Sie'], ['Noah', 'Er'], ['Flinki', 'Er'], ['Lara', 'Sie'], ['Elias', 'Er']];
const THINGS = ['Sterne', 'Äpfel', 'Murmeln', 'Sticker', 'Nüsse'];

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

  // grosse Zahlen: typische Fehler als Ablenker (Übertrag vergessen = ±10, ±100, um 1 verzählt)
  const bigOpts = ans => {
    const c = shuffle([ans + 10, ans - 10, ans + 1, ans - 1, ...(ans >= 100 ? [ans + 100, ans - 100] : [])]);
    return [...new Set(c.filter(x => x >= 0 && x !== ans))].slice(0, 2);
  };
  // Zehnerübergang erzwingen: Einer zusammen ≥ 10 (plus) bzw. Einer zu klein (minus)
  const carryPlus = (lo, hi, bLo, bHi) => { let a, b, n = 0; do { a = int(lo, hi); b = int(bLo, bHi); } while ((a % 10 + b % 10 < 10) && n++ < 50); return [a, b]; };
  const borrowMinus = (lo, hi, bLo, bHi) => { let a, b, n = 0; do { a = int(lo, hi); b = int(bLo, Math.min(bHi, a - 1)); } while ((a % 10 >= b % 10) && n++ < 50); return [a, b]; };
  const calc = (t, a, b, ans, prompt = 'Rechne!') => finish({ type: t, a, b, op: { plus: '+', minus: '−', times: '×', divide: ':' }[t] || '+', kind: 'number', prompt,
    say: `Wie viel ist ${a} ${{ plus: 'plus', minus: 'minus', times: 'mal', divide: 'geteilt durch' }[t]} ${b}?` }, ans, ans >= 20 ? bigOpts(ans) : numOpts(ans));

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
      if (stage === 4) { // bis 1000
        const k = pick(p < .4 ? ['HZ', 'HZ', 'HZE+E'] : ['HZ', 'HZE+E', 'HZE+ZE', 'HZE+ZE']);
        if (k === 'HZ') { let a, b; do { a = int(1, 7) * 100 + int(0, 9) * 10; b = int(1, 8) * 100 + int(1, 9) * 10; } while (a + b > 990); return calc('plus', a, b, a + b); }
        let a, b; do { [a, b] = k === 'HZE+E' ? carryPlus(101, 890, 3, 9) : carryPlus(101, 850, 12, 99); } while (a + b > 999);
        return calc('plus', a, b, a + b);
      }
      if (stage === 3) { // bis 100 mit Zehnerübergang
        const k = pick(p < .3 ? ['E+E', 'ZE+E'] : ['ZE+E', 'ZE+ZE', 'ZE+ZE']);
        const [a, b] = k === 'E+E' ? carryPlus(3, 9, 3, 9) : k === 'ZE+E' ? carryPlus(12, 89, 3, 9) : carryPlus(12, 69, 12, 29);
        return calc('plus', a, b, a + b);
      }
      const max = stage === 1 ? 5 : 10, a = int(1, max - 1), b = int(1, max - a);
      return finish({ type, a, b, kind: 'number', prompt: 'Rechne!', say: `Wie viel ist ${a} plus ${b}?` }, a + b, numOpts(a + b));
    }
    case 'minus': {
      if (stage === 4) {
        const k = pick(p < .4 ? ['HZ', 'HZ', 'HZE-E'] : ['HZ', 'HZE-E', 'HZE-ZE', 'HZE-ZE']);
        if (k === 'HZ') { const a = int(3, 9) * 100 + int(0, 9) * 10, b = int(1, Math.floor(a / 100) - 1) * 100 + int(1, 9) * 10; return calc('minus', a, b, a - b); }
        const [a, b] = k === 'HZE-E' ? borrowMinus(110, 990, 3, 9) : borrowMinus(150, 990, 12, 99);
        return calc('minus', a, b, a - b);
      }
      if (stage === 3) {
        const k = pick(p < .3 ? ['ZE-E'] : ['ZE-E', 'ZE-ZE', 'ZE-ZE']);
        const [a, b] = k === 'ZE-E' ? borrowMinus(21, 99, 3, 9) : borrowMinus(31, 99, 12, 59);
        return calc('minus', a, b, a - b);
      }
      const a = int(2, 10), b = int(1, a - 1);
      return finish({ type, a, b, kind: 'number', prompt: 'Rechne!', say: `Wie viel ist ${a} minus ${b}?` }, a - b, numOpts(a - b));
    }
    case 'double': {
      const a = stage >= 3 ? (p < .4 ? int(6, 25) : int(15, 50)) : int(2, lerp(6, 10));
      return finish({ type, a, b: a, op: '+', kind: 'number', prompt: 'Verdopple!', say: `Was ist das Doppelte von ${a}?` }, 2 * a, 2 * a >= 20 ? bigOpts(2 * a) : [2 * a + 2, 2 * a - 1]);
    }
    case 'half': {
      const h = p < .4 ? int(3, 25) : int(10, 50), a = 2 * h;
      return finish({ type, a, kind: 'number', prompt: 'Halbiere!', say: `Was ist die Hälfte von ${a}?` }, h, h >= 20 ? bigOpts(h) : numOpts(h));
    }
    case 'times': {
      const rows = stage === 3 ? (p < .5 ? [2, 5, 10] : [2, 3, 4, 5, 10]) : [2, 3, 4, 5, 6, 7, 8, 9];
      const row = pick(rows), k = int(2, 10);
      if (stage === 4 && p > .5 && rnd() < .3) { const z = int(2, 9) * 10, m = int(2, 9); return calc('times', m, z, m * z); } // 4 × 30
      const ans = k * row;
      return finish({ type, a: k, b: row, op: '×', kind: 'number', prompt: 'Einmaleins', say: `Wie viel ist ${k} mal ${row}?` }, ans,
        [...new Set(shuffle([ans + row, ans - row, ans + 1, ans - 1, (k + 1) * (row + 1)]).filter(x => x > 0 && x !== ans))].slice(0, 2));
    }
    case 'divide': {
      const b = int(2, 9), q = int(2, 10), a = b * q;
      return finish({ type, a, b, op: ':', kind: 'number', prompt: 'Geteilt', say: `Wie viel ist ${a} geteilt durch ${b}?` }, q,
        [...new Set(shuffle([q + 1, q - 1, q + 2, b]).filter(x => x > 0 && x !== q))].slice(0, 2));
    }
    case 'gap': { // Platzhalter: ? + 7 = 15, 6 × ? = 42
      const ops = stage === 3 ? ['plus', 'minus', 'times'] : ['plus', 'minus', 'times', 'divide', 'times'];
      const op = pick(ops);
      let a, b, c, hole = rnd() < .5 ? 0 : 1;
      if (op === 'plus') { [a, b] = stage === 3 ? carryPlus(5, 60, 3, 30) : carryPlus(100, 700, 12, 99); c = a + b; }
      else if (op === 'minus') { [a, b] = stage === 3 ? borrowMinus(21, 99, 3, 40) : borrowMinus(150, 900, 12, 99); c = a - b; }
      else if (op === 'times') { a = int(2, 10); b = stage === 3 ? pick([2, 5, 10, 3, 4]) : int(2, 9); c = a * b; }
      else { b = int(2, 9); c = int(2, 10); a = b * c; }
      const ans = hole === 0 ? a : b, sym = { plus: '+', minus: '−', times: '×', divide: ':' }[op];
      const left = hole === 0 ? '?' : String(a), right = hole === 1 ? '?' : String(b);
      return finish({ type, eq: `${left} ${sym} ${right} = ${c}`, kind: 'number', prompt: 'Welche Zahl fehlt?',
        say: `Welche Zahl fehlt? ${left === '?' ? 'Wie viel' : left} ${{ plus: 'plus', minus: 'minus', times: 'mal', divide: 'geteilt durch' }[op]} ${right === '?' ? 'wie viel' : right} gibt ${c}.` }, ans,
        ans >= 20 ? bigOpts(ans) : [...new Set(shuffle([ans + 1, ans - 1, ans + 2, c]).filter(x => x > 0 && x !== ans))].slice(0, 2));
    }
    case 'bigger': { // 348 ? 384 → < > =
      const a = int(100, 999), r = rnd();
      const b = r < .2 ? a : r < .6 ? Number(String(a).split('').reverse().join('')) || a + 10 : a + pick([-100, -10, -1, 1, 10, 100]);
      const ans = a < b ? '<' : a > b ? '>' : '=';
      return finish({ type, eq: `${a}  ?  ${b}`, kind: 'letter', prompt: 'Grösser, kleiner, gleich?', say: `Ist ${a} grösser, kleiner oder gleich ${b}?` }, ans, ['<', '>', '='].filter(x => x !== ans));
    }
    case 'story': { // kurze Textaufgabe (wird vorgelesen)
      const [name, pron] = pick(NAMES), thing = pick(THINGS), k = pick(stage === 3 ? ['plus', 'minus', 'times'] : ['plus', 'minus', 'times', 'divide']);
      let lines, ans;
      if (k === 'plus') { const [a, b] = stage === 3 ? carryPlus(12, 60, 5, 30) : carryPlus(120, 600, 25, 250); ans = a + b; lines = [`${name} hat ${a} ${thing}.`, `${pron} bekommt ${b} dazu.`, 'Wie viele sind es jetzt?']; }
      else if (k === 'minus') { const [a, b] = stage === 3 ? borrowMinus(31, 99, 5, 40) : borrowMinus(200, 900, 25, 199); ans = a - b; lines = [`${name} hat ${a} ${thing}.`, `${pron} verschenkt ${b}.`, 'Wie viele bleiben übrig?']; }
      else if (k === 'times') { const a = int(2, stage === 3 ? 5 : 9), b = stage === 3 ? pick([2, 5, 10]) : int(3, 9); ans = a * b; lines = [`In einer Schachtel sind ${b} ${thing}.`, `${name} hat ${a} Schachteln.`, 'Wie viele sind es zusammen?']; }
      else { const b = int(2, 6), q = int(3, 9); ans = q; lines = [`${b * q} ${thing} werden gerecht`, `auf ${b} Kinder verteilt.`, 'Wie viele bekommt jedes Kind?']; }
      return finish({ type, lines, kind: 'number', prompt: 'Textaufgabe', say: lines.join(' ') }, ans, ans >= 20 ? bigOpts(ans) : numOpts(ans));
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
