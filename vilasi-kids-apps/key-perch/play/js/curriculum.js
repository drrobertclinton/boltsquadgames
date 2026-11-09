// Key Perch curriculum: finger map, ordered lessons and the text builder.
// This file has no browser code, so other apps (My Own Tutor) can import it.
import { WORDS, SENTENCES, PASSAGES } from './words.js';

export const FINGERS = {
  lp: { name: 'left pinky', hand: 'left', home: 'a' },
  lr: { name: 'left ring finger', hand: 'left', home: 's' },
  lm: { name: 'left middle finger', hand: 'left', home: 'd' },
  li: { name: 'left pointer finger', hand: 'left', home: 'f' },
  th: { name: 'thumb', hand: 'both', home: ' ' },
  ri: { name: 'right pointer finger', hand: 'right', home: 'j' },
  rm: { name: 'right middle finger', hand: 'right', home: 'k' },
  rr: { name: 'right ring finger', hand: 'right', home: 'l' },
  rp: { name: 'right pinky', hand: 'right', home: ';' },
};

const FINGER_KEYS = {
  lp: '`1qaz', lr: '2wsx', lm: '3edc', li: '45rtfgvb', th: ' ',
  ri: '67yuhjnm', rm: '8ik,', rr: '9ol.', rp: "0-=p[]\\;'/",
};
export const FINGER_OF = {};
for (const [f, keys] of Object.entries(FINGER_KEYS)) for (const k of keys) FINGER_OF[k] = f;

// Characters typed with Shift, and the plain key each one lives on.
const SHIFTED = { '?': '/', '!': '1', ':': ';', '<': ',', '>': '.' };
export const baseKey = (ch) => {
  if (SHIFTED[ch]) return SHIFTED[ch];
  return ch >= 'A' && ch <= 'Z' ? ch.toLowerCase() : ch;
};
export const needsShift = (ch) => !!SHIFTED[ch] || (ch >= 'A' && ch <= 'Z');
export const fingerFor = (ch) => FINGER_OF[baseKey(ch)];
// Good form: the pinky on the other hand holds Shift.
export const shiftSideFor = (ch) => (FINGERS[fingerFor(ch)]?.hand === 'left' ? 'right' : 'left');

export const UNITS = [
  { id: 'ready', title: 'Get ready', blurb: 'How to sit and where your hands live.' },
  { id: 'home', title: 'Home row', blurb: 'The keys your fingers always come back to.' },
  { id: 'top', title: 'Top row', blurb: 'Reach up, then come straight back home.' },
  { id: 'bottom', title: 'Bottom row', blurb: 'Reach down without looking down.' },
  { id: 'caps', title: 'Capitals', blurb: 'One pinky holds Shift, the other hand types.' },
  { id: 'numbers', title: 'Numbers', blurb: 'The longest reach of all.' },
  { id: 'speed', title: 'Flying', blurb: 'Real paragraphs, steady and smooth.' },
];

const L = (id, unit, title, keys, tip, extra = {}) => ({ id, unit, title, keys: [...keys], tip, ...extra });

export const LESSONS = [
  L('setup', 'ready', 'Hands home', '', 'Feel for the little bumps on F and J. Those bumps let you find home without looking.', { kind: 'setup' }),

  L('fj', 'home', 'F and J', 'fj', 'Your pointer fingers sit on the bumps. Your thumbs rest on the space bar.'),
  L('dk', 'home', 'D and K', 'dk', 'Your middle fingers press D and K. Keep your pointer fingers on the bumps.'),
  L('sl', 'home', 'S and L', 'sl', 'Your ring fingers press S and L. Let the finger do the work, not your whole hand.'),
  L('a;', 'home', 'A and ;', 'a;', 'Your pinkies press A and the semicolon. Now you can type real words!'),
  L('gh', 'home', 'G and H', 'gh', 'Slide a pointer finger over one key, press, and slide right back to the bump.'),
  L('homerev', 'home', 'Home row words', '', 'Eyes on the screen. Your fingers already know where to go.', { review: true }),

  L('ei', 'top', 'E and I', 'ei', 'Middle fingers reach up. Your other fingers stay close to home.'),
  L('ru', 'top', 'R and U', 'ru', 'Pointer fingers reach up and a little to the side, then back to the bumps.'),
  L('ty', 'top', 'T and Y', 'ty', 'A long reach for your pointer fingers. Touch the key, then come back.'),
  L('wo', 'top', 'W and O', 'wo', 'Ring fingers reach up. Keep your wrists floating.'),
  L('qp', 'top', 'Q and P', 'qp', 'Pinkies reach up. These are the trickiest top row keys, so go slowly.'),
  L('toprev', 'top', 'Top row words', '', 'Try not to peek. Trust your fingers.', { review: true }),

  L('nm', 'bottom', 'N and M', 'nm', 'Your right pointer finger reaches down and in for N, then straight down for M.'),
  L('vb', 'bottom', 'V and B', 'vb', 'Your left pointer finger reaches down for V, and a little farther for B.'),
  L('c,', 'bottom', 'C and comma', 'c,', 'Middle fingers curl down. Your other fingers stay on home row.'),
  L('x.', 'bottom', 'X and period', 'x.', 'Ring fingers curl down. A period ends a sentence.'),
  L('z/', 'bottom', 'Z and slash', 'z/', 'Pinkies curl down. Keep your hands still and let the pinky move.'),
  L('botrev', 'bottom', 'All your letters', '', 'You know every letter now. Keep your eyes up.', { review: true }),

  L('capR', 'caps', 'Capitals on the left', '', 'For a capital on the left hand, hold the right Shift with your right pinky.', { caps: 'left', shiftDrill: 'ASDFGQWERTZXCVB' }),
  L('capL', 'caps', 'Capitals on the right', '', 'For a capital on the right hand, hold the left Shift with your left pinky.', { caps: 'right', shiftDrill: 'JKLHYUIOPNM' }),
  L('qmark', 'caps', 'Question marks', '?', 'Hold the left Shift with your left pinky and press the slash key with your right pinky.'),
  L('caprev', 'caps', 'Real sentences', '', 'Capitals, commas and periods all together. Nice and steady.', { review: true }),

  L('47', 'numbers', '4 and 7', '47', 'Pointer fingers make the long reach up to the number row, then come home.'),
  L('38', 'numbers', '3 and 8', '38', 'Middle fingers reach up two rows. Go slowly until it feels easy.'),
  L('29', 'numbers', '2 and 9', '29', 'Ring fingers reach up two rows. Keep your other fingers near home.'),
  L('10', 'numbers', '1 and 0', '10', 'Pinkies reach up two rows. Slow and right beats fast and wrong.'),
  L('56', 'numbers', '5 and 6', '56', 'The longest reach for your pointer fingers. You have got this.'),
  L('numrev', 'numbers', 'Numbers in sentences', '', 'Numbers and letters together. Come back home after every number.', { review: true }),

  L('fly1', 'speed', 'Steady flying', '', 'Try to keep an even beat, like a slow drum. Same speed on easy and hard keys.', { passages: 1 }),
  L('fly2', 'speed', 'Smooth flying', '', 'If you make a lot of mistakes, slow down a little. Speed grows from being right.', { passages: 2 }),
  L('fly3', 'speed', 'Graduation flight', '', 'This is your last flight. Sit tall, breathe, and show what you learned.', { passages: 2, graduation: true }),
];

export const lessonIndex = (id) => LESSONS.findIndex((l) => l.id === id);

// All the characters a child may be asked to type once they reach this lesson.
export function poolThrough(index) {
  const pool = new Set([' ']);
  let caps = false;
  for (let i = 0; i <= index && i < LESSONS.length; i++) {
    const l = LESSONS[i];
    for (const k of l.keys) pool.add(k);
    if (l.caps) caps = true;
    if (l.id === 'capL') caps = true;
  }
  if (index >= lessonIndex('setup') && index === 0) for (const k of 'asdfjkl;') pool.add(k);
  if (caps) for (const k of [...pool]) if (k >= 'a' && k <= 'z') pool.add(k.toUpperCase());
  return pool;
}

// Plain keys only: what games drill.
export function gameKeysThrough(index) {
  const out = [];
  for (const k of poolThrough(index)) if (k !== ' ' && k !== '?' && !(k >= 'A' && k <= 'Z')) out.push(k);
  return out.length >= 2 ? out : ['f', 'j'];
}

export const wordsFor = (pool) => WORDS.filter((w) => [...w].every((c) => pool.has(c)));

// Keeps random letter drills from ever spelling something rude.
const NEVER = new Set(['poop', 'pee', 'peep', 'boob', 'boobs', 'tit', 'tits', 'titt', 'ass', 'poo', 'wee', 'wiz', 'nut', 'nuts', 'bum']);
const safeGroup = (g) => !NEVER.has(g.toLowerCase());

function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const pick = (rng, list) => list[Math.floor(rng() * list.length)];

// Rhythm groups built from at most two letters, like "fjf jjf ffj".
export function patternText(keys, chars, rng = Math.random) {
  const list = keys.filter((k) => k !== ' ');
  const shapes = ['aaa', 'bbb', 'ab', 'ba', 'aab', 'abb', 'aba', 'bab', 'abab'];
  const out = [];
  let len = 0;
  while (len < chars) {
    const a = pick(rng, list);
    let b = pick(rng, list);
    if (list.length > 1) while (b === a) b = pick(rng, list);
    const group = pick(rng, shapes).replace(/a/g, a).replace(/b/g, b);
    if (!safeGroup(group)) continue;
    out.push(group);
    len += group.length + 1;
  }
  return out.join(' ');
}

export function wordText(words, chars, rng = Math.random, favor = []) {
  const favored = words.filter((w) => favor.some((k) => w.includes(k)));
  const out = [];
  let len = 0;
  let guard = 0;
  while (len < chars && guard++ < 500) {
    const source = favored.length && rng() < 0.65 ? favored : words;
    const w = pick(rng, source);
    if (out[out.length - 1] === w) continue;
    out.push(w);
    len += w.length + 1;
  }
  return out.join(' ');
}

// Fit a sentence to the keys learned so far, or return null if it cannot fit.
export function fitSentence(sentence, pool) {
  let s = sentence;
  if (!pool.has('A')) s = s.toLowerCase();
  if (!pool.has(',')) s = s.replace(/,/g, '');
  if (!pool.has('.')) s = s.replace(/\.$/, '');
  if (!pool.has('?')) s = s.replace(/\?$/, '');
  return [...s].every((c) => pool.has(c)) ? s : null;
}

export const sentencesFor = (pool) => SENTENCES.map((s) => fitSentence(s, pool)).filter(Boolean);

function sentenceText(list, chars, rng, favor = []) {
  const favored = list.filter((s) => favor.some((k) => s.includes(k)));
  const out = [];
  let len = 0;
  const used = new Set();
  let guard = 0;
  while (len < chars && guard++ < 300) {
    const source = favored.length && rng() < 0.6 ? favored : list;
    const s = pick(rng, source);
    if (used.has(s) && used.size < list.length) continue;
    used.add(s);
    out.push(s);
    len += s.length + 1;
  }
  return out.join(' ');
}

function numberText(keys, chars, rng) {
  const digits = keys.filter((k) => k >= '0' && k <= '9');
  const out = [];
  let len = 0;
  while (len < chars) {
    let g = '';
    const n = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < n; i++) g += pick(rng, digits);
    out.push(g);
    len += g.length + 1;
  }
  return out.join(' ');
}

function capitalWords(lettersToUse, pool, chars, rng) {
  const lower = new Set([...pool].filter((c) => c >= 'a' && c <= 'z'));
  const words = WORDS.filter((w) => w.length >= 3 && [...w].every((c) => lower.has(c)) && lettersToUse.includes(w[0].toUpperCase()));
  const out = [];
  let len = 0;
  while (len < chars) {
    const w = pick(rng, words);
    const cap = w[0].toUpperCase() + w.slice(1);
    out.push(cap);
    len += cap.length + 1;
  }
  return out.join(' ');
}

// Text scale: Gentle is shorter than Speedy so a young typer can finish.
export const PACES = {
  gentle: { label: 'Gentle', blurb: 'Short lessons. Great for ages 6 to 8.', scale: 0.6, wpm: [5, 12], pass: 0.85, beat: 50 },
  steady: { label: 'Steady', blurb: 'The usual path. Great for ages 8 to 11.', scale: 1, wpm: [8, 22], pass: 0.9, beat: 66 },
  speedy: { label: 'Speedy', blurb: 'Longer lessons. For older kids and grown-ups.', scale: 1.4, wpm: [12, 40], pass: 0.92, beat: 84 },
};

export function targetWpm(paceId, index) {
  const [lo, hi] = PACES[paceId].wpm;
  return Math.round(lo + ((hi - lo) * index) / (LESSONS.length - 1));
}

// A lesson is a short list of typed steps. eyesUp hides the keyboard picture.
export function buildSteps(lesson, paceId = 'steady', seed = Date.now()) {
  const rng = makeRng(seed);
  const scale = PACES[paceId].scale;
  const n = (c) => Math.max(14, Math.round(c * scale));
  const index = lessonIndex(lesson.id);
  const pool = poolThrough(index);
  const plain = [...pool].filter((k) => k !== ' ' && !(k >= 'A' && k <= 'Z') && k !== '?');
  const words = wordsFor(new Set([...pool].filter((c) => !(c >= 'A' && c <= 'Z'))));
  const sentences = sentencesFor(pool);
  const unitNo = UNITS.findIndex((u) => u.id === lesson.unit);
  const steps = [];

  if (lesson.kind === 'setup') {
    steps.push({ label: 'Press each home key', text: 'a s d f j k l ;', guide: true });
    steps.push({ label: 'Now back the other way', text: '; l k j f d s a', guide: true });
    return steps;
  }

  if (lesson.shiftDrill) {
    const list = [...lesson.shiftDrill];
    let drill = '';
    while (drill.length < n(30)) drill += pick(rng, list) + ' ';
    steps.push({ label: 'Hold Shift with the other pinky', text: drill.trim(), guide: true });
    steps.push({ label: 'Capital words', text: capitalWords(lesson.shiftDrill, pool, n(50), rng) });
    const fit = sentences.filter((s) => /[A-Z]/.test(s) && [...s].every((c) => !(c >= 'A' && c <= 'Z') || lesson.shiftDrill.includes(c)));
    steps.push({ label: 'Sentences', text: sentenceText(fit.length ? fit : sentences, n(70), rng), eyesUp: true });
    return steps;
  }

  if (lesson.passages) {
    const list = [...PASSAGES].sort(() => rng() - 0.5);
    for (let i = 0; i < lesson.passages; i++) steps.push({ label: i ? 'Keep flying' : 'Your passage', text: clip(list[i], n(220)), eyesUp: true });
    return steps;
  }

  const newKeys = lesson.keys;
  if (newKeys.length && newKeys.some((k) => k >= '0' && k <= '9')) {
    const digits = plain.filter((k) => k >= '0' && k <= '9');
    steps.push({ label: 'Meet your new keys', text: patternText(newKeys, n(26), rng), guide: true });
    steps.push({ label: 'Number practice', text: numberText(digits, n(44), rng) });
    const fit = sentences.filter((s) => /\d/.test(s));
    if (fit.length >= 2) steps.push({ label: 'Numbers in sentences', text: sentenceText(fit, n(60), rng), eyesUp: true });
    return steps;
  }

  if (lesson.id === 'qmark') {
    steps.push({ label: 'Meet the question mark', text: 'why? who? how? what? when? where?', guide: true });
    const fit = sentences.filter((s) => s.endsWith('?'));
    steps.push({ label: 'Ask some questions', text: sentenceText(fit, n(80), rng), eyesUp: true });
    return steps;
  }

  if (lesson.review) {
    steps.push({ label: 'Warm up with words', text: wordText(words, n(70), rng) });
    const fit = lesson.id === 'numrev' ? sentences.filter((s) => /\d/.test(s)) : sentences;
    if (fit.length >= 2) steps.push({ label: 'Now some sentences', text: sentenceText(fit, n(100), rng), eyesUp: unitNo >= 2 });
    else steps.push({ label: 'More words', text: wordText(words, n(70), rng), eyesUp: unitNo >= 2 });
    return steps;
  }

  // A normal "two new keys" lesson.
  steps.push({ label: 'Meet your new keys', text: patternText(newKeys, n(26), rng), guide: true });
  steps.push({ label: 'Mix them with what you know', text: patternText([...newKeys, ...newKeys, ...plain], n(40), rng) });
  const usable = words.filter((w) => newKeys.some((k) => w.includes(k)));
  if (usable.length >= 3) steps.push({ label: 'Real words', text: wordText(words, n(50), rng, newKeys) });
  const fit = sentences.filter((s) => newKeys.some((k) => s.toLowerCase().includes(k)));
  if (fit.length >= 2 && unitNo >= 2) steps.push({ label: 'Sentences', text: sentenceText(fit, n(60), rng, newKeys), eyesUp: true });
  return steps;
}

function clip(passage, chars) {
  if (passage.length <= chars) return passage;
  const cut = passage.slice(0, chars);
  const end = cut.lastIndexOf('. ');
  return end > 40 ? cut.slice(0, end + 1) : cut.slice(0, cut.lastIndexOf(' '));
}

export function checkText() {
  return [...PASSAGES].sort(() => Math.random() - 0.5).join(' ');
}

// Text for "practice my tricky keys".
export function trickyText(keys, poolIndex, chars = 90) {
  const pool = poolThrough(poolIndex);
  const lower = new Set([...pool].filter((c) => !(c >= 'A' && c <= 'Z')));
  const words = wordsFor(lower).filter((w) => keys.some((k) => w.includes(k)));
  const a = patternText(keys.length > 1 ? keys : [...keys, 'f', 'j'].slice(0, 2), Math.round(chars * 0.4));
  return words.length >= 3 ? `${a} ${wordText(words, Math.round(chars * 0.6))}` : `${a} ${patternText(keys.length > 1 ? keys : [...keys, 'f'], Math.round(chars * 0.6))}`;
}

export { makeRng };
