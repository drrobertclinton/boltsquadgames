// Small drawing helpers: elements, the owl, the keyboard and the hands.
import { FINGERS, FINGER_OF, baseKey, needsShift, fingerFor, shiftSideFor } from './curriculum.js';
import { touchDown, touchUp, isTouchFirst } from './input.js';

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
  return el;
}

export function btn(label, onClick, cls = '', attrs = {}) {
  return h('button', { type: 'button', class: `btn ${cls}`, onClick, ...attrs }, label);
}

// The same owl as the Perch app icons.
const HATS = {
  party: '<path d="M512 60 L420 240 L604 240Z" fill="#E4572E"/><circle cx="512" cy="60" r="26" fill="#F2C14E"/><path d="M470 150 L554 150 M445 200 L579 200" stroke="#fff" stroke-width="14"/>',
  crown: '<path d="M385 245 L365 110 L450 170 L512 80 L574 170 L659 110 L639 245Z" fill="#F2C14E" stroke="#B5851B" stroke-width="10"/><circle cx="512" cy="175" r="20" fill="#C5283D"/>',
  cap: '<path d="M512 80 L720 170 L512 260 L304 170Z" fill="#26324A"/><path d="M700 175 V270" stroke="#F2C14E" stroke-width="14"/><circle cx="700" cy="280" r="20" fill="#F2C14E"/>',
  beanie: '<path d="M350 245 C350 120 674 120 674 245Z" fill="#2B8A6B"/><rect x="340" y="225" width="344" height="42" rx="20" fill="#F2C14E"/><circle cx="512" cy="105" r="28" fill="#E4572E"/>',
};
const WEAR = {
  glasses: '<g fill="none" stroke="#26324A" stroke-width="16"><circle cx="425" cy="395" r="92"/><circle cx="599" cy="395" r="92"/><path d="M517 390 h-10"/></g>',
  bow: '<path d="M512 595 L420 545 L420 650Z M512 595 L604 545 L604 650Z" fill="#C5283D"/><circle cx="512" cy="597" r="22" fill="#8F1D2C"/>',
  scarf: '<path d="M380 545 Q512 620 644 545 L650 590 Q512 670 374 590Z" fill="#E4572E"/><rect x="580" y="585" width="52" height="120" rx="12" fill="#C5283D"/>',
};

export function owl(color, { size = 120, wear = [], branch = true, cls = '' } = {}) {
  const hats = wear.map((w) => HATS[w] || '').join('');
  const extras = wear.map((w) => WEAR[w] || '').join('');
  const svg = `<svg class="owl ${cls}" width="${size}" height="${size}" viewBox="100 40 824 800" role="img" aria-label="owl">
    ${branch ? '<rect x="150" y="770" width="724" height="46" rx="23" fill="#8B5E3C"/><path d="M300 770 q-30 -50 -80 -60 q45 -10 90 50z" fill="#5FA777"/><path d="M720 790 q40 50 95 50 q-45 -40 -80 -70z" fill="#5FA777"/>' : ''}
    <path d="M512 230 C370 230 300 330 300 470 C300 640 390 770 512 770 C634 770 724 640 724 470 C724 330 654 230 512 230z" fill="${color.body}"/>
    <path d="M340 290 L318 180 L430 250z M684 290 L706 180 L594 250z" fill="${color.body}"/>
    <path d="M512 480 C430 480 396 560 396 630 C396 710 450 760 512 760 C574 760 628 710 628 630 C628 560 594 480 512 480z" fill="${color.belly}"/>
    <circle cx="425" cy="395" r="82" fill="#fff"/><circle cx="599" cy="395" r="82" fill="#fff"/>
    <g class="pupils"><circle cx="433" cy="395" r="42" fill="#222"/><circle cx="591" cy="395" r="42" fill="#222"/>
    <circle cx="447" cy="380" r="13" fill="#fff"/><circle cx="605" cy="380" r="13" fill="#fff"/></g>
    <path d="M485 470 L539 470 L512 520z" fill="#F2A33A"/>
    <rect x="440" y="752" width="44" height="30" rx="15" fill="#F2A33A"/><rect x="540" y="752" width="44" height="30" rx="15" fill="#F2A33A"/>
    ${extras}${hats}
  </svg>`;
  const wrap = h('span', { class: 'owl-wrap', html: svg });
  return wrap;
}

const ROWS = [
  [['`', 1], ['1', 1], ['2', 1], ['3', 1], ['4', 1], ['5', 1], ['6', 1], ['7', 1], ['8', 1], ['9', 1], ['0', 1], ['-', 1], ['=', 1], ['Back', 2, 'wide']],
  [['Tab', 1.5, 'wide'], ['q', 1], ['w', 1], ['e', 1], ['r', 1], ['t', 1], ['y', 1], ['u', 1], ['i', 1], ['o', 1], ['p', 1], ['[', 1], [']', 1], ['\\', 1.5]],
  [['Caps', 1.75, 'wide'], ['a', 1], ['s', 1], ['d', 1], ['f', 1], ['g', 1], ['h', 1], ['j', 1], ['k', 1], ['l', 1], [';', 1], ["'", 1], ['Enter', 2.25, 'wide']],
  [['ShiftL', 2.25, 'shift'], ['z', 1], ['x', 1], ['c', 1], ['v', 1], ['b', 1], ['n', 1], ['m', 1], [',', 1], ['.', 1], ['/', 1], ['ShiftR', 2.75, 'shift']],
  [['', 4, 'blank'], [' ', 6.25, 'space'], ['', 4.75, 'blank']],
];

export function keyboard({ pool = null, blankLabels = false, small = false } = {}) {
  const keys = new Map();
  const root = h('div', { class: `kb ${small ? 'small' : ''} ${blankLabels ? 'blanks' : ''}`, 'aria-hidden': 'true' });
  for (const row of ROWS) {
    const r = h('div', { class: 'kb-row' });
    for (const [k, w, kind] of row) {
      const finger = FINGER_OF[k];
      const label = k === 'ShiftL' || k === 'ShiftR' ? 'Shift' : k === ' ' ? 'space' : k.length === 1 ? k.toUpperCase() : k;
      const el = h('div', { class: `key ${kind || ''} ${finger ? `f-${finger}` : 'off'}`, style: { flex: `${w} ${w} 0` } }, h('span', { class: 'cap' }, label));
      if (k === 'f' || k === 'j') el.classList.add('bump');
      if (pool && finger && k !== ' ' && !pool.has(k)) el.classList.add('dim');
      r.append(el);
      if (k) keys.set(k, el);
      const tappable = finger || k === 'ShiftL' || k === 'ShiftR';
      if (tappable) {
        const code = k === 'ShiftL' || k === 'ShiftR' ? 'Shift' : k;
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture?.(e.pointerId); touchDown(code); });
        el.addEventListener('pointerup', () => touchUp(code));
        el.addEventListener('pointercancel', () => touchUp(code));
      }
    }
    root.append(r);
  }
  let marked = [];
  let lastNext = null;
  const clear = () => { marked.forEach((e) => e.classList.remove('next', 'shift-next')); marked = []; lastNext = null; };
  return {
    el: root,
    keys,
    clear,
    // Light up the next key and, when needed, the Shift the other pinky holds.
    next(ch) {
      if (ch === lastNext && marked.length) return;
      clear();
      if (ch == null) return;
      lastNext = ch;
      const k = keys.get(baseKey(ch));
      if (k) { k.classList.add('next'); marked.push(k); }
      if (needsShift(ch)) {
        const s = keys.get(shiftSideFor(ch) === 'left' ? 'ShiftL' : 'ShiftR');
        if (s) { s.classList.add('next', 'shift-next'); marked.push(s); }
      }
    },
    flash(ch, good = true) {
      const k = keys.get(baseKey(ch));
      if (!k) return;
      const c = good ? 'hit' : 'miss';
      k.classList.remove(c);
      void k.offsetWidth;
      k.classList.add(c);
      setTimeout(() => k.classList.remove(c), 260);
    },
    reveal(ch, on = true) {
      const k = keys.get(ch);
      if (k) k.classList.toggle('reveal', on);
    },
    setPool(p) {
      for (const [k, el] of keys) if (FINGER_OF[k] && k !== ' ') el.classList.toggle('dim', !p.has(k));
    },
  };
}

// Two simple hands. The letter on each fingertip is that finger's home key.
const FINGER_SHAPES = [
  { id: 'p', x: 8, y: 30, h: 56, label: { l: 'A', r: ';' } },
  { id: 'r', x: 42, y: 12, h: 74, label: { l: 'S', r: 'L' } },
  { id: 'm', x: 76, y: 2, h: 84, label: { l: 'D', r: 'K' } },
  { id: 'i', x: 110, y: 14, h: 72, label: { l: 'F', r: 'J' } },
];

function oneHand(side) {
  const prefix = side === 'left' ? 'l' : 'r';
  const fingers = FINGER_SHAPES.map((f) => `
    <g class="finger f-${prefix}${f.id}" data-f="${prefix}${f.id}">
      <rect x="${f.x}" y="${f.y}" width="30" height="${f.h + 16}" rx="15"/>
      <text x="${f.x + 15}" y="${f.y + 22}" class="tip" ${side === 'right' ? `transform="scale(-1 1) translate(${-2 * (f.x + 15)} 0)"` : ''}>${f.label[prefix]}</text>
    </g>`).join('');
  const mirror = side === 'right' ? 'transform="translate(200 0) scale(-1 1)"' : '';
  return `<g ${mirror}>
    <g class="palm"><rect x="6" y="80" width="136" height="74" rx="30"/></g>
    ${fingers}
    <g class="finger f-th" data-f="th"><rect x="132" y="96" width="60" height="28" rx="14" transform="rotate(26 132 96)"/></g>
  </g>`;
}

export function hands({ small = false } = {}) {
  const root = h('div', { class: `hands ${small ? 'small' : ''}`, 'aria-hidden': 'true', html: `
    <svg viewBox="0 0 200 170">${oneHand('left')}</svg>
    <div class="hands-gap"></div>
    <svg viewBox="0 0 200 170">${oneHand('right')}</svg>` });
  let lit = [];
  const clear = () => { lit.forEach((e) => e.classList.remove('lit')); lit = []; };
  return {
    el: root,
    clear,
    next(ch) {
      clear();
      if (ch == null) return;
      const f = fingerFor(ch);
      if (f) root.querySelectorAll(`[data-f="${f}"]`).forEach((e) => { e.classList.add('lit'); lit.push(e); });
      if (needsShift(ch)) {
        const p = shiftSideFor(ch) === 'left' ? 'lp' : 'rp';
        root.querySelectorAll(`[data-f="${p}"]`).forEach((e) => { e.classList.add('lit'); lit.push(e); });
      }
    },
  };
}

// A plain sentence for "which finger", used in hints and the lesson intro.
export function fingerPhrase(ch) {
  const f = fingerFor(ch);
  return f ? FINGERS[f].name : 'finger';
}

export function keyName(ch) {
  if (ch === ' ') return 'space bar';
  if (ch === ';') return 'semicolon';
  if (ch === ',') return 'comma';
  if (ch === '.') return 'period';
  if (ch === '/') return 'slash';
  if (ch === '?') return 'question mark';
  return ch.toUpperCase();
}

export const touchNote = () => (isTouchFirst() ? h('p', { class: 'touch-note' }, 'A real keyboard is best. Tap the keys below until you connect one.') : null);

export function stars(n, max = 3) {
  const row = h('span', { class: 'stars', 'aria-label': `${n} of ${max} stars` });
  for (let i = 0; i < max; i++) row.append(h('span', { class: i < n ? 'star on' : 'star' }, '★'));
  return row;
}

export const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
