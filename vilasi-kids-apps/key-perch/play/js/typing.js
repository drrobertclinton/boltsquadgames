// The typing surface used by lessons, the race and the one minute check.
import { h, keyName, fingerPhrase } from './ui.js';
import { listen } from './input.js';
import { sfx } from './sound.js';
import { baseKey, needsShift, shiftSideFor } from './curriculum.js';

// Pauses longer than this do not count against speed (a sneeze, a question).
const LONG_PAUSE = 4000;

export function newStats() {
  return { chars: 0, clean: 0, ms: 0, keys: {}, wrongShift: 0, swaps: {} };
}

export function mergeStats(a, b) {
  a.chars += b.chars; a.clean += b.clean; a.ms += b.ms; a.wrongShift += b.wrongShift;
  for (const [k, s] of Object.entries(b.keys)) {
    const r = a.keys[k] || (a.keys[k] = { hit: 0, miss: 0 });
    r.hit += s.hit; r.miss += s.miss;
  }
  for (const [k, n] of Object.entries(b.swaps)) a.swaps[k] = (a.swaps[k] || 0) + n;
  return a;
}

export const wpmOf = (s) => (s.ms > 0 ? (s.chars / 5) / (s.ms / 60000) : 0);
export const accOf = (s) => (s.chars > 0 ? s.clean / s.chars : 0);

// Runs one piece of text. Resolves with stats when it is finished, time runs
// out, or cancel() is called.
export function typeText({ host, text, board = null, handsView = null, hintDelay = 0, timeLimit = 0, onProgress = null, onTick = null, onMiss = null }) {
  const stats = newStats();
  const box = h('div', { class: 'typebox', role: 'textbox', 'aria-label': 'Text to type' });
  const hint = h('div', { class: 'hint', 'aria-live': 'polite' });
  const spans = [];
  const words = text.split(/( )/);
  for (const w of words) {
    if (w === ' ') {
      const s = h('span', { class: 'ch sp' }, ' ');
      spans.push(s);
      box.append(s);
    } else if (w) {
      const wrap = h('span', { class: 'word' });
      for (const c of w) { const s = h('span', { class: 'ch' }, c); spans.push(s); wrap.append(s); }
      box.append(wrap);
    }
  }
  host.append(box, hint);

  let pos = 0;
  let missedHere = false;
  let startedAt = 0;
  let lastKey = 0;
  let hintTimer = 0;
  let wrongRun = 0;
  let done = false;
  let finish = () => {};
  let tickTimer = 0;
  let total = 0; // chars typed, kept separate so a time limit can stop mid-text

  const showNext = (immediate = false) => {
    clearTimeout(hintTimer);
    const ch = text[pos];
    const light = () => { board?.next(ch); handsView?.next(ch); };
    if (hintDelay && !immediate) {
      board?.clear(); handsView?.clear();
      hintTimer = setTimeout(light, hintDelay);
    } else light();
  };

  const mark = () => {
    spans.forEach((s) => s.classList.remove('now'));
    const s = spans[pos];
    if (!s) return;
    s.classList.add('now');
    const top = s.offsetTop - box.offsetTop;
    if (box.scrollHeight > box.clientHeight) box.scrollTop = Math.max(0, top - box.clientHeight / 3);
  };

  const end = () => {
    if (done) return;
    done = true;
    clearTimeout(hintTimer);
    clearInterval(tickTimer);
    off();
    board?.clear();
    handsView?.clear();
    stats.chars = total;
    finish(stats);
  };

  const bump = (k, field) => {
    const r = stats.keys[k] || (stats.keys[k] = { hit: 0, miss: 0 });
    r[field]++;
  };

  const off = listen((ev) => {
    if (done) return;
    if (ev.type === 'control') {
      if (ev.key === 'Backspace') hint.textContent = 'No need to go back. Just press the right key.';
      return;
    }
    if (ev.type !== 'key') return;
    const want = text[pos];
    const now = performance.now();
    if (!startedAt) {
      startedAt = now;
      if (timeLimit) {
        tickTimer = setInterval(() => {
          const left = timeLimit - (performance.now() - startedAt);
          onTick?.(left);
          if (left <= 0) { stats.ms = timeLimit; end(); }
        }, 100);
      }
    } else {
      stats.ms += Math.min(now - lastKey, LONG_PAUSE);
    }
    lastKey = now;

    const got = ev.key;
    // Caps Lock is a setting, not a mistake. Tell them and do not count it.
    const flipped = got.length === 1 && got.toLowerCase() === want.toLowerCase() && got !== want;
    if (flipped && ev.caps && !ev.shift) {
      hint.textContent = 'Caps Lock is on. Press it once to turn it off.';
      return;
    }

    if (got === want) {
      spans[pos].classList.remove('now', 'bad');
      spans[pos].classList.add(missedHere ? 'fixed' : 'good');
      board?.flash(want, true);
      sfx.key();
      bump(baseKey(want), 'hit');
      total++;
      if (!missedHere) stats.clean++;
      if (needsShift(want) && ev.shiftSide && ev.shiftSide !== 'unknown' && ev.shiftSide !== 'touch' && ev.shiftSide !== shiftSideFor(want)) {
        stats.wrongShift++;
        hint.textContent = `Good capital! Next time hold the ${shiftSideFor(want)} Shift with your ${shiftSideFor(want)} pinky.`;
      } else if (hint.textContent) {
        hint.textContent = '';
      }
      missedHere = false;
      wrongRun = 0;
      pos++;
      onProgress?.(pos / text.length, stats, total);
      if (pos >= text.length) { end(); return; }
      mark();
      showNext(false);
    } else {
      if (got.toLowerCase() === 'shift') return;
      sfx.wrong();
      spans[pos].classList.remove('bad');
      void spans[pos].offsetWidth;
      spans[pos].classList.add('bad');
      board?.flash(got, false);
      if (!missedHere) {
        missedHere = true;
        bump(baseKey(want), 'miss');
        const pair = `${baseKey(want)}>${baseKey(got)}`;
        stats.swaps[pair] = (stats.swaps[pair] || 0) + 1;
      }
      wrongRun++;
      onMiss?.();
      hint.textContent = want === ' '
        ? 'Tap the space bar with your thumb.'
        : `That is your ${fingerPhrase(want)}, on the ${keyName(baseKey(want))} key.`;
      showNext(true);
      if (wrongRun === 3) hint.textContent = `Take your time. Put your fingers back on the bumps, then find ${keyName(baseKey(want))}.`;
    }
  });

  mark();
  showNext(!hintDelay);

  const promise = new Promise((res) => { finish = res; });
  return { promise, cancel: end, box, get position() { return pos; } };
}
