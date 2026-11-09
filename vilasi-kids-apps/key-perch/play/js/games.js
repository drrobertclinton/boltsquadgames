// Five games. Each one uses only the keys this typer has learned, and each one
// trains a different part of good typing.
import { icon } from './icons.js';
import { h, owl, keyboard, hands, shuffle, keyName } from './ui.js';
import { listen, isTouchFirst } from './input.js';
import { sfx } from './sound.js';
import { PACES, gameKeysThrough, wordsFor, poolThrough, patternText, sentencesFor, targetWpm, baseKey } from './curriculum.js';
import { typeText, wpmOf, accOf } from './typing.js';
import { colorOf, trickyKeys } from './store.js';

export const GAMES = [
  { id: 'seeds', title: 'Seed Catch', teaches: 'Learn where each key is', blurb: 'Seeds fall from the tree. Press the letter on a seed and your owl catches it.', needs: 'fj', icon: 'seed' },
  { id: 'ghost', title: 'Ghost Keys', teaches: 'Know the keyboard by heart', blurb: 'The letters have vanished! A key glows. Can you press it without looking down?', needs: 'dk', icon: 'ghost' },
  { id: 'beat', title: 'Beat Perch', teaches: 'Type with a steady rhythm', blurb: 'Letters hop along to the beat. Press each one right when it lands on the perch.', needs: 'sl', icon: 'drum' },
  { id: 'fireflies', title: 'Firefly Night', teaches: 'Keep your eyes up', blurb: 'Words glow in the dark. Type a whole word to catch it in your jar.', needs: 'a;', icon: 'firefly' },
  { id: 'race', title: 'Sky Race', teaches: 'Build speed the right way', blurb: 'Fly against friendly birds and your own best time. Mistakes slow you down.', needs: 'a;', icon: 'flag' },
];

function weighted(player, keys) {
  const tricky = new Set(trickyKeys(player, 6));
  const out = [];
  for (const k of keys) { out.push(k); if (tricky.has(k)) out.push(k, k); }
  return out;
}

const rand = (list) => list[Math.floor(Math.random() * list.length)];

function hud(...items) { return h('div', { class: 'hud' }, ...items); }

// Runs a frame loop until stop() is called.
function loop(fn) {
  let id = 0;
  let last = performance.now();
  let stopped = false;
  const tick = (t) => {
    if (stopped) return;
    const dt = Math.min(t - last, 100);
    last = t;
    fn(dt, t);
    if (!stopped) id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => { stopped = true; cancelAnimationFrame(id); };
}

/* ---------- Seed Catch: letters fall, one key at a time ---------- */
export function seedCatch({ host, player, reach, cleanups }) {
  const keys = gameKeysThrough(reach);
  const bag = weighted(player, keys);
  const speedScale = player.pace === 'gentle' ? 0.75 : player.pace === 'speedy' ? 1.25 : 1;
  const scoreEl = h('b', {}, '0');
  const leaves = h('b', { class: 'leaves', 'aria-label': '3 leaves left' }, icon('leaf', 26), icon('leaf', 26), icon('leaf', 26));
  const timeEl = h('b', {}, '60');
  const arena = h('div', { class: 'arena sky' });
  const tree = h('div', { class: 'canopy' });
  const birdEl = h('div', { class: 'catcher' }, owl(colorOf(player), { size: 84, branch: false }));
  const grass = h('div', { class: 'grass' });
  arena.append(tree, grass, birdEl);
  const board = keyboard({ pool: new Set(keys), small: true });
  host.append(hud(h('span', {}, 'Seeds ', scoreEl), h('span', {}, leaves), h('span', {}, 'Time ', timeEl)), arena, board.el);

  return new Promise((resolve) => {
    let seeds = [];
    let score = 0;
    let lives = 3;
    let clock = 60000;
    let sinceSpawn = 1400;
    let hits = 0;
    let misses = 0;
    let ended = false;
    const keyStats = {};
    const note = (k, f) => { const r = keyStats[k] || (keyStats[k] = { hit: 0, miss: 0 }); r[f]++; };

    const finish = () => {
      if (ended) return;
      ended = true;
      stop(); off();
      resolve({ score, label: 'seeds caught', acc: hits + misses ? hits / (hits + misses) : 0, keyStats });
    };

    const spawn = () => {
      const k = rand(bag);
      const el = h('div', { class: 'seed' }, k.toUpperCase());
      const x = 6 + Math.random() * 86;
      el.style.left = `${x}%`;
      arena.append(el);
      seeds.push({ k, el, y: -8, x });
    };

    const lowest = () => seeds.reduce((a, s) => (!a || s.y > a.y ? s : a), null);

    const off = listen((ev) => {
      if (ev.type !== 'key') return;
      const k = baseKey(ev.key);
      const hit = seeds.filter((s) => s.k === k).sort((a, b) => b.y - a.y)[0];
      if (hit) {
        hits++; score++; note(k, 'hit');
        scoreEl.textContent = score;
        sfx.catch();
        birdEl.style.left = `${hit.x}%`;
        hit.el.classList.add('caught');
        setTimeout(() => hit.el.remove(), 220);
        seeds = seeds.filter((s) => s !== hit);
        board.next(lowest()?.k ?? null);
      } else {
        misses++; sfx.wrong();
        board.flash(k, false);
        const low = lowest();
        if (low) note(low.k, 'miss');
      }
    });

    const stop = loop((dt) => {
      clock -= dt;
      timeEl.textContent = Math.max(0, Math.ceil(clock / 1000));
      const ramp = 1 - clock / 60000;
      sinceSpawn += dt;
      const gap = (2300 - ramp * 1200) / speedScale;
      if (sinceSpawn > gap) { sinceSpawn = 0; spawn(); board.next(lowest()?.k ?? null); }
      const fall = (14 + ramp * 12) * speedScale; // percent of the arena per second
      for (const s of seeds) {
        s.y += (fall * dt) / 1000;
        s.el.style.top = `${s.y}%`;
      }
      const down = seeds.filter((s) => s.y >= 84);
      for (const s of down) {
        s.el.classList.add('lost');
        setTimeout(() => s.el.remove(), 300);
        note(s.k, 'miss');
        lives--;
        leaves.lastChild?.remove();
        leaves.setAttribute('aria-label', `${Math.max(0, lives)} leaves left`);
        sfx.lose();
      }
      if (down.length) { seeds = seeds.filter((s) => s.y < 84); board.next(lowest()?.k ?? null); }
      if (lives <= 0 || clock <= 0) finish();
    });
    cleanups.push(() => { ended = true; stop(); off(); });
  });
}

/* ---------- Ghost Keys: the keyboard with no letters ---------- */
export function ghostKeys({ host, player, reach, cleanups }) {
  const keys = gameKeysThrough(reach);
  const bag = weighted(player, keys);
  const scoreEl = h('b', {}, '0');
  const streakEl = h('b', {}, '0');
  const timeEl = h('b', {}, '60');
  const prompt = h('div', { class: 'ghost-msg' }, 'Press the glowing key');
  const board = keyboard({ pool: new Set(keys), blankLabels: true });
  const handsView = hands();
  host.append(hud(h('span', {}, 'Found ', scoreEl), h('span', {}, 'Streak ', streakEl), h('span', {}, 'Time ', timeEl)), prompt, board.el, handsView.el);

  return new Promise((resolve) => {
    let score = 0;
    let streak = 0;
    let best = 0;
    let hits = 0;
    let misses = 0;
    let clock = 60000;
    let current = null;
    let ended = false;
    const keyStats = {};
    const note = (k, f) => { const r = keyStats[k] || (keyStats[k] = { hit: 0, miss: 0 }); r[f]++; };
    const nextKey = () => {
      let k = rand(bag);
      if (keys.length > 1) while (k === current) k = rand(bag);
      if (current) board.reveal(current, false);
      current = k;
      board.next(k);
      handsView.clear();
    };
    const finish = () => {
      if (ended) return;
      ended = true;
      stop(); off();
      resolve({ score, label: 'keys found', extra: `Longest streak: ${best}`, acc: hits + misses ? hits / (hits + misses) : 0, keyStats });
    };
    const off = listen((ev) => {
      if (ev.type !== 'key') return;
      const k = baseKey(ev.key);
      if (k === current) {
        hits++; score++; streak++; best = Math.max(best, streak);
        note(k, 'hit');
        scoreEl.textContent = score; streakEl.textContent = streak;
        sfx.note(streak);
        board.reveal(k, true);
        prompt.textContent = streak >= 10 ? `${streak} in a row!` : 'Press the glowing key';
        const was = k;
        setTimeout(() => board.reveal(was, false), 300);
        nextKey();
      } else {
        misses++; streak = 0; streakEl.textContent = 0;
        note(current, 'miss');
        sfx.wrong();
        board.flash(k, false);
        board.reveal(current, true);
        handsView.next(current);
        prompt.textContent = `That one is ${keyName(current)}. Try it!`;
      }
    });
    nextKey();
    const stop = loop((dt) => {
      clock -= dt;
      timeEl.textContent = Math.max(0, Math.ceil(clock / 1000));
      if (clock <= 0) finish();
    });
    cleanups.push(() => { ended = true; stop(); off(); });
  });
}

/* ---------- Beat Perch: an even rhythm, the mark of a real typist ---------- */
export function beatPerch({ host, player, reach, cleanups }) {
  const keys = gameKeysThrough(reach);
  const bag = weighted(player, keys);
  const bpm = PACES[player.pace].beat;
  const beatMs = 60000 / bpm;
  const TOTAL = 32;
  const seq = [];
  while (seq.length < TOTAL) {
    const a = rand(bag);
    let b = rand(bag);
    if (keys.length > 1) while (b === a) b = rand(bag);
    seq.push(...rand([[a, a, b, b], [a, b, a, b], [a, a, a, b], [a, b, b, a]]));
  }
  const scoreEl = h('b', {}, '0');
  const streakEl = h('b', {}, '0');
  const judge = h('div', { class: 'judge' }, 'Get ready');
  const track = h('div', { class: 'track' });
  const perch = h('div', { class: 'perch-line' }, owl(colorOf(player), { size: 92, branch: false }));
  track.append(perch);
  const board = keyboard({ pool: new Set(keys), small: true });
  host.append(hud(h('span', {}, 'Score ', scoreEl), h('span', {}, 'Streak ', streakEl), h('span', {}, `${bpm} beats a minute`)), judge, track, board.el);

  const LEAD = beatMs * 4;
  const HIT_X = 16; // percent across the track
  return new Promise((resolve) => {
    const notes = seq.slice(0, TOTAL).map((k, i) => ({ k, at: LEAD + i * beatMs, done: false, el: null, i }));
    notes.forEach((n) => { n.el = h('div', { class: 'beat-note' }, n.k.toUpperCase()); n.el.style.left = '110%'; track.append(n.el); });
    let start = 0;
    let score = 0;
    let streak = 0;
    let best = 0;
    let perfect = 0;
    let good = 0;
    let missed = 0;
    let beatNo = -1;
    let ended = false;
    const keyStats = {};
    const note = (k, f) => { const r = keyStats[k] || (keyStats[k] = { hit: 0, miss: 0 }); r[f]++; };

    const say = (text, cls) => {
      judge.textContent = text;
      judge.className = `judge ${cls}`;
    };
    const miss = (n, text = 'Missed') => {
      n.done = true;
      n.el.classList.add('gone');
      missed++; streak = 0; streakEl.textContent = 0;
      note(n.k, 'miss');
      say(text, 'late');
    };
    const finish = () => {
      if (ended) return;
      ended = true;
      stop(); off();
      const total = perfect + good + missed;
      resolve({ score, label: 'points', extra: `${perfect} right on the beat, longest streak ${best}`, acc: total ? (perfect + good) / total : 0, keyStats });
    };
    const off = listen((ev) => {
      if (ev.type !== 'key' || !start) return;
      const now = performance.now() - start;
      const k = baseKey(ev.key);
      const open = notes.find((n) => !n.done && n.at - now < beatMs * 0.9);
      if (!open) return;
      const gap = Math.abs(open.at - now);
      if (k !== open.k) {
        sfx.wrong();
        board.flash(k, false);
        miss(open, `That was ${keyName(open.k)}`);
        return;
      }
      if (gap <= beatMs * 0.2) {
        perfect++; score += 100; say('Right on the beat!', 'perfect');
      } else if (gap <= beatMs * 0.45) {
        good++; score += 60; say(open.at > now ? 'A little early' : 'A little late', 'good');
      } else {
        miss(open, open.at > now ? 'Too early' : 'Too late');
        return;
      }
      open.done = true;
      open.el.classList.add('hit');
      streak++; best = Math.max(best, streak);
      score += Math.min(streak, 20);
      note(k, 'hit');
      sfx.note(open.i);
      scoreEl.textContent = score; streakEl.textContent = streak;
    });
    start = performance.now();
    const stop = loop(() => {
      const now = performance.now() - start;
      const b = Math.floor(now / beatMs);
      if (b !== beatNo) { beatNo = b; sfx.drum(); perch.classList.remove('bop'); void perch.offsetWidth; perch.classList.add('bop'); }
      let nextUp = null;
      for (const n of notes) {
        const x = HIT_X + ((n.at - now) / beatMs) * 16;
        n.el.style.left = `${x}%`;
        if (!n.done && !nextUp) nextUp = n;
        if (!n.done && now - n.at > beatMs * 0.5) miss(n);
      }
      board.next(nextUp ? nextUp.k : null);
      if (now > LEAD + TOTAL * beatMs + 300) finish();
    });
    cleanups.push(() => { ended = true; stop(); off(); });
  });
}

/* ---------- Firefly Night: whole words, keyboard hidden ---------- */
export function fireflyNight({ host, player, reach, cleanups }) {
  const pool = new Set([...poolThrough(reach)].filter((c) => !(c >= 'A' && c <= 'Z')));
  let words = wordsFor(pool);
  if (words.length < 8) words = words.concat(patternText(gameKeysThrough(reach), 60).split(' '));
  const longest = player.pace === 'gentle' ? 5 : player.pace === 'steady' ? 7 : 12;
  const short = words.filter((w) => w.length <= longest);
  const list = short.length >= 8 ? short : words;
  const speedScale = player.pace === 'gentle' ? 0.7 : player.pace === 'speedy' ? 1.3 : 1;
  const jarEl = h('b', {}, '0');
  const timeEl = h('b', {}, '60');
  const arena = h('div', { class: 'arena night' });
  const stars = Array.from({ length: 34 }, () => {
    const s = h('i', { class: 'tw' });
    s.style.left = `${Math.random() * 100}%`; s.style.top = `${Math.random() * 70}%`;
    s.style.animationDelay = `${Math.random() * 3}s`;
    return s;
  });
  arena.append(...stars, h('div', { class: 'jar', 'aria-hidden': 'true' }, icon('jar', 54)));
  host.append(hud(h('span', {}, 'In your jar ', jarEl), h('span', { class: 'eyes' }, 'Eyes up. No peeking!'), h('span', {}, 'Time ', timeEl)), arena);
  if (isTouchFirst()) host.append(keyboard({ pool: new Set(gameKeysThrough(reach)), small: true }).el);

  return new Promise((resolve) => {
    let flies = [];
    let target = null;
    let caught = 0;
    let right = 0;
    let wrong = 0;
    let chars = 0;
    let clock = 60000;
    let since = 900;
    let ended = false;
    const keyStats = {};
    const note = (k, f) => { const r = keyStats[k] || (keyStats[k] = { hit: 0, miss: 0 }); r[f]++; };

    const spawn = () => {
      const used = new Set(flies.map((f) => f.w[0]));
      const choices = list.filter((w) => !used.has(w[0]));
      if (!choices.length) return;
      const w = rand(choices);
      const el = h('div', { class: 'fly' }, ...[...w].map((c) => h('span', {}, c)));
      const lane = 8 + Math.random() * 62;
      arena.append(el);
      flies.push({ w, el, x: -14, lane, pos: 0, phase: Math.random() * 6 });
    };
    const finish = () => {
      if (ended) return;
      ended = true;
      stop(); off();
      const total = right + wrong;
      resolve({ score: caught, label: 'fireflies caught', extra: `${Math.round(chars / 5)} words' worth of typing`, acc: total ? right / total : 0, keyStats });
    };
    const off = listen((ev) => {
      if (ev.type !== 'key') return;
      const k = ev.key;
      if (!target) {
        target = flies.filter((f) => f.w[0] === k).sort((a, b) => b.x - a.x)[0] || null;
        if (!target) {
          if (flies.length) { wrong++; sfx.wrong(); }
          return;
        }
        target.el.classList.add('locked');
      }
      const want = target.w[target.pos];
      if (k === want) {
        right++; chars++; note(baseKey(want), 'hit'); sfx.key();
        target.el.children[target.pos].classList.add('done');
        target.pos++;
        if (target.pos >= target.w.length) {
          caught++;
          jarEl.textContent = caught;
          sfx.catch();
          const f = target;
          f.el.classList.add('caught');
          setTimeout(() => f.el.remove(), 400);
          flies = flies.filter((x) => x !== f);
          target = null;
        }
      } else {
        wrong++; note(baseKey(want), 'miss'); sfx.wrong();
        target.el.classList.remove('wobble'); void target.el.offsetWidth; target.el.classList.add('wobble');
      }
    });
    const stop = loop((dt, t) => {
      clock -= dt;
      timeEl.textContent = Math.max(0, Math.ceil(clock / 1000));
      const ramp = 1 - clock / 60000;
      since += dt;
      const gap = (3400 - ramp * 1500) / speedScale;
      if (since > gap && flies.length < 5) { since = 0; spawn(); }
      const speed = (6 + ramp * 4) * speedScale;
      for (const f of flies) {
        f.x += (speed * dt) / 1000;
        f.el.style.left = `${f.x}%`;
        f.el.style.top = `${f.lane + Math.sin(t / 700 + f.phase) * 3}%`;
      }
      const gone = flies.filter((f) => f.x > 102);
      for (const f of gone) { f.el.remove(); if (target === f) target = null; note(baseKey(f.w[f.pos] || f.w[0]), 'miss'); }
      if (gone.length) flies = flies.filter((f) => f.x <= 102);
      if (clock <= 0) finish();
    });
    cleanups.push(() => { ended = true; stop(); off(); });
  });
}

/* ---------- Sky Race: racing friendly birds and your own best ---------- */
export function skyRace({ host, player, reach, cleanups }) {
  const pool = poolThrough(reach);
  const lower = new Set([...pool].filter((c) => !(c >= 'A' && c <= 'Z')));
  const sentences = sentencesFor(pool);
  const scale = PACES[player.pace].scale;
  const chars = Math.round(120 * scale);
  let text = '';
  if (sentences.length >= 6) {
    const list = shuffle(sentences);
    for (const s of list) { if (text.length >= chars) break; text += (text ? ' ' : '') + s; }
  } else {
    const words = shuffle(wordsFor(lower));
    let i = 0;
    while (text.length < chars) { text += (text ? ' ' : '') + words[i % words.length]; i++; }
  }
  const target = targetWpm(player.pace, reach);
  const best = player.games.race?.bestWpm || 0;
  const rivals = [
    { name: 'Robin', wpm: Math.max(4, target * 0.7), body: '#C5283D', belly: '#F9D6B8' },
    { name: 'Finch', wpm: Math.max(5, target), body: '#C9A21A', belly: '#FFF3C4' },
    { name: 'Swift', wpm: Math.max(6, target * 1.3), body: '#2B6CB0', belly: '#D6E9FA' },
  ];
  if (best) rivals.push({ name: 'Your best', wpm: best, body: '#8896A6', belly: '#EEF2F6', ghost: true });
  const course = h('div', { class: 'course' });
  const lane = (name, color, you) => {
    const bird = h('div', { class: 'racer' }, owl(color, { size: 44, branch: false }));
    const row = h('div', { class: `lane ${you ? 'you' : ''}` }, h('span', { class: 'lane-name' }, name), h('div', { class: 'lane-track' }, bird, h('div', { class: 'finish' })));
    course.append(row);
    return bird;
  };
  const me = lane('You', colorOf(player), true);
  const others = rivals.map((r) => ({ ...r, el: lane(r.name, { body: r.body, belly: r.belly }, false), p: 0 }));
  host.append(course);
  const typeHost = h('div', { class: 'race-type' });
  host.append(typeHost);
  if (isTouchFirst()) host.append(keyboard({ pool: lower, small: true }).el);
  const put = (el, p) => { el.style.left = `calc(${Math.min(1, p) * 92}%)`; };

  return new Promise((resolve) => {
    let begun = 0;
    let beatenBy = 0;
    const session = typeText({
      host: typeHost,
      text,
      onProgress: (p) => {
        if (!begun) begun = performance.now();
        put(me, p);
      },
    });
    const stop = loop(() => {
      if (!begun) return;
      const min = (performance.now() - begun) / 60000;
      for (const o of others) {
        o.p = (o.wpm * 5 * min) / text.length;
        put(o.el, o.p);
      }
    });
    cleanups.push(() => { stop(); session.cancel(); });
    session.promise.then((stats) => {
      stop();
      if (cleanups.dead) return;
      const min = (performance.now() - begun) / 60000;
      beatenBy = rivals.filter((r) => (r.wpm * 5 * min) / text.length >= 1).length;
      const wpm = wpmOf(stats);
      const place = beatenBy + 1;
      const suffix = ['1st', '2nd', '3rd', '4th', '5th'][place - 1];
      const newBest = wpm > best;
      if (newBest) {
        player.games.race = { ...(player.games.race || {}), bestWpm: Math.round(wpm) };
      }
      resolve({
        score: Math.round(wpm), label: 'words a minute',
        extra: `You came in ${suffix}.${newBest && best ? ' That beats your best!' : ''}`,
        acc: accOf(stats), keyStats: stats.keys, wpm, typed: true,
      });
    });
  });
}

export const RUNNERS = { seeds: seedCatch, ghost: ghostKeys, beat: beatPerch, fireflies: fireflyNight, race: skyRace };
