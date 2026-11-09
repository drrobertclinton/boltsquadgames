// Key Perch screens.
import {
  LESSONS, UNITS, PACES, lessonIndex, buildSteps, poolThrough, targetWpm, checkText, trickyText, FINGERS, fingerFor,
} from './curriculum.js';
import {
  state, save, player, addPlayer, OWL_COLORS, colorOf, isUnlocked, nextLessonIndex, reachIndex, totalStars,
  recordKeys, recordHistory, recordLesson, trickyKeys, removePlayer, restoreNativeCopy, hasReached,
} from './store.js';
import { h, btn, owl, keyboard, hands, keyName, stars, touchNote } from './ui.js';
import { listen, held, onHardware, isTouchFirst } from './input.js';
import { sfx, say, hush } from './sound.js';
import { typeText, newStats, mergeStats, wpmOf, accOf } from './typing.js';
import { GAMES, RUNNERS } from './games.js';
import { icon } from './icons.js';

const app = document.getElementById('app');
let cleanups = [];

function teardown() {
  cleanups.dead = true;
  for (const c of cleanups) { try { c(); } catch { /* keep going */ } }
  cleanups = [];
  hush();
}

function screen(cls, ...kids) {
  teardown();
  app.replaceChildren();
  const s = h('main', { class: `screen ${cls}` }, ...kids);
  app.append(s);
  window.scrollTo(0, 0);
  document.activeElement?.blur?.();
  return s;
}

function topBar({ back = null, title = '' } = {}) {
  const p = player();
  return h('header', { class: 'topbar' },
    back ? btn('‹ Back', back, 'ghost back', { 'data-testid': 'back' }) : h('span', { class: 'brand' }, 'Key Perch'),
    title ? h('h1', { class: 'bar-title' }, title) : h('span', { class: 'grow' }),
    h('div', { class: 'bar-tools' },
      p ? h('span', { class: 'star-count', 'aria-label': `${totalStars(p)} stars` }, `★ ${totalStars(p)}`) : null,
      toggle('Voice', 'voice', 'voice'),
      toggle('Sound', 'sound', 'sound'),
    ));
}

function toggle(label, key, iconName) {
  const b = h('button', { type: 'button', class: `tool ${state[key] ? '' : 'off'}`, 'aria-pressed': String(state[key]), 'aria-label': label, title: label }, icon(iconName, 24));
  b.addEventListener('click', () => {
    state[key] = !state[key];
    b.classList.toggle('off', !state[key]);
    b.setAttribute('aria-pressed', String(state[key]));
    if (key === 'voice' && !state.voice) hush();
    save();
  });
  return b;
}

/* ---------- First run and choosing a typer ---------- */
function welcome() {
  let color = OWL_COLORS[0];
  let pace = 'steady';
  const preview = h('div', { class: 'preview' });
  const draw = () => preview.replaceChildren(owl(color, { size: 170 }));
  draw();
  const colorRow = h('div', { class: 'choice-row' }, OWL_COLORS.map((c) => {
    const b = h('button', { type: 'button', class: `swatch ${c === color ? 'on' : ''}`, style: { background: c.body }, 'aria-label': c.label, onClick: () => {
      color = c; draw();
      colorRow.querySelectorAll('.swatch').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
    } });
    return b;
  }));
  const paceRow = h('div', { class: 'choice-row paces' }, Object.entries(PACES).map(([id, p]) => {
    const b = h('button', { type: 'button', class: `pace ${id === pace ? 'on' : ''}`, 'data-pace': id, onClick: () => {
      pace = id;
      paceRow.querySelectorAll('.pace').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
    } }, h('b', {}, p.label), h('small', {}, p.blurb));
    return b;
  }));
  screen('welcome',
    h('div', { class: 'card hero' },
      preview,
      h('h1', {}, state.players.length ? 'New typer' : 'Welcome to Key Perch'),
      h('p', { class: 'lead' }, 'Learn to type the right way, with all ten fingers.'),
      h('h2', {}, 'Pick your owl'), colorRow,
      h('h2', {}, 'Pick your pace'), paceRow,
      h('div', { class: 'row-center' }, btn('Start learning', () => { addPlayer(color.id, pace); home(); }, 'primary big', { 'data-testid': 'start' }),
        state.players.length ? btn('Cancel', chooser, 'ghost') : null),
    ));
  say('Welcome to Key Perch. Pick your owl and your pace.');
}

function chooser() {
  screen('chooser', h('div', { class: 'card hero' },
    h('h1', {}, "Who's typing?"),
    h('div', { class: 'owl-grid' }, state.players.map((p) => h('button', { type: 'button', class: 'owl-pick', onClick: () => { state.current = p.id; save(); home(); } },
      owl(colorOf(p), { size: 110, wear: p.wear }), h('span', {}, `${colorOf(p).label} owl`), h('small', {}, `★ ${totalStars(p)}`)))),
    state.players.length < 6 ? btn('Add a typer', welcome, 'ghost') : null));
}

/* ---------- Home ---------- */
let homeTab = 'lessons';

function home() {
  const p = player();
  if (!p) return state.players.length ? chooser() : welcome();
  const tabs = [['lessons', 'Lessons'], ['games', 'Games'], ['nest', 'My nest']];
  const body = h('div', { class: 'tab-body' });
  const tabRow = h('div', { class: 'tabs', role: 'tablist' }, tabs.map(([id, label]) => {
    const b = h('button', { type: 'button', role: 'tab', class: `tab ${homeTab === id ? 'on' : ''}`, 'data-testid': `tab-${id}`, onClick: () => { homeTab = id; home(); } }, label);
    return b;
  }));
  screen('home', topBar(), tabRow, body,
    h('footer', { class: 'home-foot' },
      state.players.length > 1 ? btn('Change typer', chooser, 'ghost small') : btn('Add a typer', welcome, 'ghost small'),
      btn('For grown-ups', grownupGate, 'ghost small', { 'data-testid': 'grownups' })));
  if (homeTab === 'lessons') lessonsTab(body, p);
  if (homeTab === 'games') gamesTab(body, p);
  if (homeTab === 'nest') nestTab(body, p);
}

function lessonsTab(body, p) {
  const nextI = nextLessonIndex(p);
  const graduated = nextI === -1;
  const next = graduated ? null : LESSONS[nextI];
  const go = next ? btn(`${nextI === 0 ? 'Start' : 'Keep going'}: ${next.title}`, () => startLesson(next), 'primary big', { 'data-testid': 'continue' }) : null;
  const tricky = trickyKeys(p);
  const hero = h('div', { class: 'hero-row' },
    owl(colorOf(p), { size: 104, wear: p.wear }),
    h('div', {},
      h('h1', {}, graduated ? 'You graduated!' : nextI === 0 ? 'Let us get your hands ready' : next.title),
      h('p', {}, graduated ? 'Practice any lesson, or try to beat your best in the games.' : UNITS.find((u) => u.id === next.unit).blurb),
      go,
      hasReached(p, 'a;') ? btn('One minute typing check', typingCheck, 'ghost', { 'data-testid': 'check' }) : null,
      tricky.length ? btn(`Practice tricky keys: ${tricky.map((k) => keyName(k)).join(', ')}`, () => trickyPractice(tricky), 'ghost') : null,
    ));
  const map = h('div', { class: 'unit-list' }, UNITS.map((u) => {
    const lessons = LESSONS.filter((l) => l.unit === u.id);
    return h('section', { class: 'unit' },
      h('h2', {}, u.title),
      h('div', { class: 'lesson-grid' }, lessons.map((l) => {
        const i = lessonIndex(l.id);
        const open = isUnlocked(p, i);
        const rec = p.lessons[l.id];
        return h('button', { type: 'button', class: `lesson ${rec?.stars ? 'done' : ''} ${i === nextI ? 'current' : ''}`, disabled: !open, 'data-lesson': l.id, onClick: () => startLesson(l) },
          h('span', { class: 'lesson-keys' }, l.keys.length ? l.keys.map((k) => k.toUpperCase()).join(' ') : '★'),
          h('span', { class: 'lesson-title' }, l.title),
          stars(rec?.stars || 0));
      })));
  }));
  body.append(hero, map);
  if (go) setTimeout(() => go.focus(), 0);
}

function gameOpen(p, g) {
  return hasReached(p, g.needs);
}

function gamesTab(body, p) {
  body.append(h('div', { class: 'game-grid' }, GAMES.map((g) => {
    const open = gameOpen(p, g);
    const best = p.games[g.id]?.best;
    return h('button', { type: 'button', class: `game ${open ? '' : 'locked'}`, disabled: !open, 'data-game': g.id, onClick: () => startGame(g) },
      icon(g.icon, 42),
      h('b', {}, g.title),
      h('small', { class: 'teaches' }, g.teaches),
      h('small', {}, open ? g.blurb : `Opens after the ${LESSONS.find((l) => l.id === g.needs).title} lesson.`),
      best ? h('small', { class: 'best' }, `Best: ${best}`) : null);
  })));
}

/* ---------- Nest: rewards for stars, nothing to buy ---------- */
const PRIZES = [
  { id: 'party', label: 'Party hat', at: 3, kind: 'hat', icon: 'party' },
  { id: 'scarf', label: 'Scarf', at: 8, kind: 'wear', icon: 'scarf' },
  { id: 'beanie', label: 'Beanie', at: 14, kind: 'hat', icon: 'beanie' },
  { id: 'bow', label: 'Bow tie', at: 20, kind: 'wear', icon: 'bow' },
  { id: 'glasses', label: 'Glasses', at: 28, kind: 'wear', icon: 'glasses' },
  { id: 'cap', label: 'Graduation cap', at: 40, kind: 'hat', icon: 'cap' },
  { id: 'crown', label: 'Crown', at: 60, kind: 'hat', icon: 'crown' },
];
const DECOR = [
  { id: 'leaf', at: 1, icon: 'leaf' }, { id: 'flower', at: 5, icon: 'flower' }, { id: 'acorn', at: 10, icon: 'seed' },
  { id: 'mushroom', at: 16, icon: 'mushroom' }, { id: 'butterfly', at: 24, icon: 'butterfly' }, { id: 'apple', at: 32, icon: 'apple' },
  { id: 'lantern', at: 45, icon: 'lantern' }, { id: 'moon', at: 55, icon: 'moon' }, { id: 'rainbow', at: 75, icon: 'rainbow' },
];

function nestTab(body, p) {
  const count = totalStars(p);
  const stage = h('div', { class: 'nest-stage' });
  const draw = () => {
    stage.replaceChildren(
      ...DECOR.filter((d) => count >= d.at).map((d, i) => h('span', { class: `decor d${i}` }, icon(d.icon, i === 8 ? 58 : 38))),
      h('div', { class: 'nest-owl' }, owl(colorOf(p), { size: 210, wear: p.wear })),
    );
  };
  draw();
  const wearRow = h('div', { class: 'prize-grid' }, PRIZES.map((w) => {
    const open = count >= w.at;
    const b = h('button', { type: 'button', class: `prize ${p.wear.includes(w.id) ? 'on' : ''}`, disabled: !open, onClick: () => {
      if (p.wear.includes(w.id)) p.wear = p.wear.filter((x) => x !== w.id);
      else {
        if (w.kind === 'hat') p.wear = p.wear.filter((x) => !PRIZES.find((q) => q.id === x && q.kind === 'hat'));
        p.wear.push(w.id);
      }
      save();
      wearRow.querySelectorAll('.prize').forEach((e, i) => e.classList.toggle('on', p.wear.includes(PRIZES[i].id)));
      draw();
    } }, icon(open ? w.icon : 'lock', 32), h('b', {}, w.label), h('small', {}, open ? (p.wear.includes(w.id) ? 'Wearing it' : 'Tap to wear') : `${w.at} stars`));
    return b;
  }));
  body.append(h('div', { class: 'nest' }, stage, h('p', { class: 'lead center' }, `You have ${count} stars. Earn stars in lessons to fill your nest.`), wearRow));
}

/* ---------- Posture and the "hold F and J" start ---------- */
function postureCard(onDone) {
  const checks = [
    ['chair', 'Sit up tall', 'Back straight, feet flat on the floor.'],
    ['elbow', 'Elbows at your sides', 'Keep the keyboard right in front of you.'],
    ['hand', 'Curve your fingers', 'Like you are holding a small ball. Wrists float above the desk.'],
    ['eyes', 'Eyes on the screen', 'Your fingers will learn the keys. Your eyes do not need to help.'],
  ];
  const go = btn('I am ready', onDone, 'primary big', { 'data-testid': 'ready' });
  const s = screen('lesson-intro', topBar({ back: home }), h('div', { class: 'card' },
    h('h1', {}, 'Sit like a typist'),
    h('div', { class: 'check-grid' }, checks.map(([ico, a, b]) => h('div', { class: 'check' }, icon(ico, 46), h('b', {}, a), h('small', {}, b)))),
    h('div', { class: 'row-center' }, go)));
  say('Sit up tall with your feet flat. Keep your elbows at your sides, curve your fingers, and keep your eyes on the screen.');
  setTimeout(() => go.focus(), 0);
  return s;
}

// Both pointer fingers must be on the bumps before anything starts.
function holdHome(host, onDone) {
  const board = keyboard({});
  const handView = hands();
  board.keys.get('f').classList.add('next');
  board.keys.get('j').classList.add('next');
  handView.el.querySelectorAll('[data-f="li"],[data-f="ri"]').forEach((e) => e.classList.add('lit'));
  const msg = h('h1', { class: 'center' }, 'Hands home!');
  const sub = h('p', { class: 'lead center' }, 'Feel for the bumps. Hold down F and J together to start.');
  const meter = h('div', { class: 'hold-meter' }, h('i', {}));
  host.replaceChildren(...[msg, sub, meter, touchNote(), board.el, handView.el].filter(Boolean));
  say('Hands home. Feel for the bumps. Hold down F and J together.');
  let timer = 0;
  const NEED = 500;
  const off = listen((ev) => {
    if (ev.type === 'key' || ev.type === 'up') {
      const both = held.has('f') && held.has('j');
      if (both && !timer) {
        meter.classList.add('filling');
        timer = setTimeout(() => { off(); sfx.catch(); onDone(); }, NEED);
      } else if (!both && timer) {
        clearTimeout(timer); timer = 0;
        meter.classList.remove('filling');
      }
    }
  });
  cleanups.push(() => { clearTimeout(timer); off(); });
}

/* ---------- Lessons ---------- */
function startLesson(lesson) {
  const p = player();
  const steps = buildSteps(lesson, p.pace);
  const intro = () => lessonIntro(lesson, steps);
  if (lesson.kind === 'setup' || !p.lessons[lesson.id]) {
    if (lesson.kind === 'setup' || !p.postureSeen || Date.now() - p.postureSeen > 3 * 864e5) {
      p.postureSeen = Date.now();
      save();
      postureCard(lesson.kind === 'setup' ? () => runSteps(lesson, steps) : intro);
      return;
    }
  }
  intro();
}

function lessonIntro(lesson, steps) {
  const board = keyboard({ pool: poolThrough(lessonIndex(lesson.id)) });
  const handView = hands();
  const firstKey = lesson.keys[0];
  if (firstKey) {
    lesson.keys.forEach((k) => {
      const el = board.keys.get(k);
      if (el) el.classList.add('next');
      const f = fingerFor(k);
      handView.el.querySelectorAll(`[data-f="${f}"]`).forEach((e) => e.classList.add('lit'));
    });
  }
  const cards = lesson.keys.length
    ? h('div', { class: 'meet' }, lesson.keys.map((k) => h('div', { class: 'meet-card' }, h('span', { class: 'cap-big' }, k.toUpperCase()), h('small', {}, FINGERS[fingerFor(k)].name))))
    : null;
  const go = btn('Start lesson', () => runSteps(lesson, steps), 'primary big', { 'data-testid': 'begin' });
  screen('lesson-intro', topBar({ back: home, title: lesson.title }), h('div', { class: 'card' },
    cards, h('p', { class: 'lead center' }, lesson.tip), touchNote(), board.el, handView.el, h('div', { class: 'row-center' }, go)));
  say(lesson.tip);
  setTimeout(() => go.focus(), 0);
}

function runSteps(lesson, steps) {
  const index = lessonIndex(lesson.id);
  const p = player();
  const total = newStats();
  const unit = UNITS.findIndex((u) => u.id === lesson.unit);
  const hintDelay = unit <= 1 ? 0 : unit <= 3 ? 1100 : 1600;
  const stepRun = (i) => {
    if (i >= steps.length) return lessonResult(lesson, total);
    const step = steps[i];
    const pool = poolThrough(index);
    const main = h('div', { class: 'type-screen' });
    const head = h('div', { class: 'step-head' }, h('h2', {}, step.label), h('span', { class: 'step-count' }, `Step ${i + 1} of ${steps.length}`));
    const host = h('div', {});
    const board = keyboard({ pool: lesson.kind === 'setup' ? new Set('asdfjkl;') : pool });
    const handView = hands();
    const eyes = step.eyesUp && !isTouchFirst() ? h('p', { class: 'eyes-note' }, 'Eyes up! The keyboard is hidden, but it comes back if you need help.') : null;
    const hideHelp = step.eyesUp && !isTouchFirst();
    const under = h('div', { class: `under ${hideHelp ? 'hidden-help' : ''}` }, board.el, handView.el);
    main.append(...[head, host, eyes, touchNote(), under].filter(Boolean));
    screen('typing', topBar({ back: home, title: lesson.title }), main);
    let misses = 0;
    // The hidden keyboard comes back if they are struggling.
    const onMiss = () => { misses++; if (misses >= 2) under.classList.remove('hidden-help'); };
    const session = typeText({ host, text: step.text, board, handsView: handView, hintDelay: step.guide ? 0 : hintDelay, onMiss });
    cleanups.push(() => session.cancel());
    session.promise.then((stats) => {
      if (session.dead) return;
      mergeStats(total, stats);
      stepRun(i + 1);
    });
    session.dead = false;
    cleanups.push(() => { session.dead = true; });
  };
  // Every lesson starts with fingers on the bumps.
  const s = screen('typing', topBar({ back: home, title: lesson.title }));
  const host = h('div', { class: 'hold-host' });
  s.append(host);
  holdHome(host, () => stepRun(0));
}

function starsFor(lesson, acc, wpm, pace) {
  const need = PACES[pace].pass;
  if (lesson.kind === 'setup') return 3;
  if (acc < need) return 0;
  const target = targetWpm(pace, lessonIndex(lesson.id));
  if (acc >= 0.97 && wpm >= target) return 3;
  if (acc >= Math.min(0.95, need + 0.05)) return 2;
  return 1;
}

function celebrate(host) {
  for (let i = 0; i < 24; i++) {
    const c = h('i', { class: 'confetti', 'aria-hidden': 'true' });
    c.style.left = `${Math.random() * 100}%`;
    c.style.animationDelay = `${Math.random() * 0.5}s`;
    c.style.background = ['#F2C14E', '#2B8A6B', '#E4572E', '#7A3E9D', '#2B6CB0'][i % 5];
    host.append(c);
  }
}

function lessonResult(lesson, total) {
  const p = player();
  const acc = accOf(total);
  const wpm = wpmOf(total);
  const earned = starsFor(lesson, acc, wpm, p.pace);
  const before = p.lessons[lesson.id]?.stars || 0;
  const wasGrad = !!p.graduated;
  recordKeys(p, total.keys);
  recordHistory(p, lesson.id, wpm, acc);
  recordLesson(p, lesson.id, { stars: earned, wpm: Math.round(wpm), acc: Math.round(acc * 100) });
  if (lesson.graduation && earned) p.graduated = true;
  addMinutes(p, total.ms);
  save();
  const passed = earned > 0;
  if (passed) sfx.star(); else sfx.lose();
  const idx = lessonIndex(lesson.id);
  const next = LESSONS[idx + 1];
  const worst = Object.entries(total.keys).filter(([, s]) => s.miss > 0).sort((a, b) => b[1].miss - a[1].miss).slice(0, 3).map(([k]) => k);
  const target = targetWpm(p.pace, idx);
  let tip;
  if (lesson.kind === 'setup') tip = 'Now your fingers know where home is. They come back here after every key.';
  else if (!passed) tip = `You need ${Math.round(PACES[p.pace].pass * 100)}% to move on. Go a little slower. Being right matters more than being fast.`;
  else if (total.wrongShift) tip = 'Remember: hold Shift with the pinky on the other hand.';
  else if (earned === 3) tip = 'Careful and quick. That is exactly how good typists work.';
  else if (acc >= 0.97) tip = `Very careful! For the third star, try for ${target} words a minute.`;
  else tip = 'For more stars, slow down a little and hit every key on purpose.';
  const go = passed && next
    ? btn(`Next: ${next.title}`, () => startLesson(next), 'primary big', { 'data-testid': 'next' })
    : btn(passed ? 'Back to lessons' : 'Try again', passed ? home : () => startLesson(lesson), 'primary big', { 'data-testid': 'again' });
  const card = h('div', { class: 'card result' },
    owl(colorOf(p), { size: 120, wear: p.wear, cls: passed ? 'cheer' : '' }),
    h('h1', {}, passed ? (lesson.graduation && !wasGrad ? 'You graduated!' : 'Nice flying!') : 'Almost there'),
    stars(earned),
    lesson.kind === 'setup' ? null : h('div', { class: 'score-row' },
      h('div', {}, h('b', { 'data-testid': 'acc' }, `${Math.round(acc * 100)}%`), h('small', {}, 'correct')),
      h('div', {}, h('b', { 'data-testid': 'wpm' }, `${Math.round(wpm)}`), h('small', {}, 'words a minute'))),
    worst.length ? h('p', {}, `Keys to watch: ${worst.map(keyName).join(', ')}`) : null,
    earned > before && before > 0 ? h('p', {}, 'New best!') : null,
    h('p', { class: 'lead center' }, tip),
    stretchNote(p),
    h('div', { class: 'row-center' }, go, passed && next ? btn('Practice again', () => startLesson(lesson), 'ghost') : null, btn('Lessons', home, 'ghost')));
  const s = screen('results', card);
  if (passed) celebrate(s);
  say(`${passed ? 'Nice flying.' : 'Almost there.'} ${tip}`);
  setTimeout(() => go.focus(), 0);
}

function addMinutes(p, ms) {
  p.minutes = (p.minutes || 0) + ms / 60000;
  state.sinceBreak = (state.sinceBreak || 0) + ms / 60000;
}

function stretchNote() {
  if ((state.sinceBreak || 0) < 15) return null;
  state.sinceBreak = 0;
  save();
  return h('div', { class: 'stretch' }, h('b', {}, 'Stretch break!'), ' Shake out your hands, roll your shoulders, and look out a window for a moment.');
}

/* ---------- One minute check and tricky keys ---------- */
function typingCheck() {
  const p = player();
  const s = screen('typing', topBar({ back: home, title: 'One minute check' }));
  const host = h('div', { class: 'hold-host' });
  s.append(host);
  holdHome(host, () => {
    const timer = h('b', { class: 'clock' }, '60');
    const main = h('div', { class: 'type-screen' }, h('div', { class: 'step-head' }, h('h2', {}, 'Type until the clock runs out'), timer));
    const typeHost = h('div', {});
    const touchBoard = isTouchFirst() ? keyboard({}) : null;
    main.append(...[typeHost, h('p', { class: 'eyes-note' }, 'The clock starts on your first key. Calm and steady wins.'), touchBoard?.el].filter(Boolean));
    screen('typing', topBar({ back: home, title: 'One minute check' }), main);
    const session = typeText({ host: typeHost, text: checkText(), timeLimit: 60000, onTick: (left) => { timer.textContent = Math.max(0, Math.ceil(left / 1000)); } });
    let dead = false;
    cleanups.push(() => { dead = true; session.cancel(); });
    session.promise.then((stats) => {
      if (dead) return;
      const acc = accOf(stats);
      const wpm = wpmOf(stats);
      recordKeys(p, stats.keys);
      recordHistory(p, 'check', wpm, acc);
      addMinutes(p, stats.ms);
      save();
      sfx.star();
      const checks = p.history.filter((x) => x.kind === 'check');
      const go = btn('Back to lessons', home, 'primary big');
      screen('results', h('div', { class: 'card result' },
        owl(colorOf(p), { size: 110, wear: p.wear }),
        h('h1', {}, 'Time!'),
        h('div', { class: 'score-row' },
          h('div', {}, h('b', {}, `${Math.round(wpm)}`), h('small', {}, 'words a minute')),
          h('div', {}, h('b', {}, `${Math.round(acc * 100)}%`), h('small', {}, 'correct'))),
        checks.length > 1 ? h('p', {}, `Your best so far: ${Math.max(...checks.map((x) => x.wpm))} words a minute.`) : null,
        h('p', { class: 'lead center' }, acc < 0.9 ? 'Lots of mistakes slow you down more than careful typing does. Try going a bit slower.' : 'Do this once a week and watch your number grow.'),
        h('div', { class: 'row-center' }, go, btn('Try again', typingCheck, 'ghost'))));
      setTimeout(() => go.focus(), 0);
    });
  });
}

function trickyPractice(keys) {
  const p = player();
  const main = h('div', { class: 'type-screen' }, h('div', { class: 'step-head' }, h('h2', {}, `Tricky keys: ${keys.map(keyName).join(', ')}`)));
  const typeHost = h('div', {});
  const board = keyboard({});
  const handView = hands();
  main.append(typeHost, board.el, handView.el);
  screen('typing', topBar({ back: home, title: 'Practice' }), main);
  const session = typeText({ host: typeHost, text: trickyText(keys, reachIndex(p)), board, handsView: handView });
  let dead = false;
  cleanups.push(() => { dead = true; session.cancel(); });
  session.promise.then((stats) => {
    if (dead) return;
    recordKeys(p, stats.keys);
    addMinutes(p, stats.ms);
    save();
    sfx.star();
    const go = btn('Back to lessons', home, 'primary big');
    screen('results', h('div', { class: 'card result' },
      owl(colorOf(p), { size: 110, wear: p.wear }),
      h('h1', {}, 'Good practice'),
      h('div', { class: 'score-row' }, h('div', {}, h('b', {}, `${Math.round(accOf(stats) * 100)}%`), h('small', {}, 'correct'))),
      h('div', { class: 'row-center' }, go, btn('Again', () => trickyPractice(trickyKeys(p).length ? trickyKeys(p) : keys), 'ghost'))));
    setTimeout(() => go.focus(), 0);
  });
}

/* ---------- Games ---------- */
function startGame(game) {
  const p = player();
  const go = btn('Play', () => playGame(game), 'primary big', { 'data-testid': 'play' });
  screen('game-intro', topBar({ back: () => { homeTab = 'games'; home(); }, title: game.title }), h('div', { class: 'card hero' },
    icon(game.icon, 96),
    h('h1', {}, game.title),
    h('p', { class: 'lead' }, game.blurb),
    h('p', { class: 'teaches' }, `This game helps you: ${game.teaches.toLowerCase()}.`),
    touchNote(),
    p.games[game.id]?.best ? h('p', {}, `Your best: ${p.games[game.id].best}`) : null,
    h('div', { class: 'row-center' }, go)));
  say(game.blurb);
  setTimeout(() => go.focus(), 0);
}

function playGame(game) {
  const p = player();
  const reach = p.unlockAll ? LESSONS.length - 1 : reachIndex(p);
  const main = h('div', { class: `game-screen g-${game.id}` });
  screen('play', topBar({ back: () => { homeTab = 'games'; home(); }, title: game.title }), main);
  const myCleanups = cleanups;
  RUNNERS[game.id]({ host: main, player: p, reach, cleanups }).then((r) => {
    if (myCleanups !== cleanups || cleanups.dead) return;
    const prev = p.games[game.id]?.best || 0;
    const isBest = r.score > prev;
    p.games[game.id] = { ...(p.games[game.id] || {}), best: Math.max(prev, r.score), plays: (p.games[game.id]?.plays || 0) + 1 };
    recordKeys(p, r.keyStats || {});
    save();
    if (isBest && prev) sfx.cheer(); else sfx.star();
    const go = btn('Play again', () => playGame(game), 'primary big', { 'data-testid': 'again' });
    const s = screen('results', h('div', { class: 'card result' },
      owl(colorOf(p), { size: 110, wear: p.wear, cls: 'cheer' }),
      h('h1', {}, isBest && prev ? 'New best!' : game.title),
      h('div', { class: 'score-row' },
        h('div', {}, h('b', { 'data-testid': 'score' }, `${r.score}`), h('small', {}, r.label)),
        h('div', {}, h('b', {}, `${Math.round((r.acc || 0) * 100)}%`), h('small', {}, 'correct'))),
      r.extra ? h('p', {}, r.extra) : null,
      h('div', { class: 'row-center' }, go, btn('All games', () => { homeTab = 'games'; home(); }, 'ghost'))));
    if (isBest && prev) celebrate(s);
    setTimeout(() => go.focus(), 0);
  });
}

/* ---------- For grown-ups, behind a typed math question ---------- */
function grownupGate() {
  const a = 6 + Math.floor(Math.random() * 7);
  const b = 3 + Math.floor(Math.random() * 7);
  const input = h('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', 'aria-label': 'Answer', 'data-testid': 'gate-answer' });
  const msg = h('p', { class: 'hint', role: 'alert' });
  const check = (e) => {
    e?.preventDefault();
    if (Number(input.value.trim()) === a * b) grownups();
    else { msg.textContent = 'That is not it. Please ask a grown-up.'; input.value = ''; input.focus(); }
  };
  screen('gate', topBar({ back: home }), h('form', { class: 'card hero', onSubmit: check },
    h('h1', {}, 'For grown-ups'),
    h('p', { class: 'lead' }, `What is ${a} × ${b}?`),
    input, msg,
    h('div', { class: 'row-center' }, btn('Continue', check, 'primary', { 'data-testid': 'gate-ok' }))));
  setTimeout(() => input.focus(), 0);
}

function progressChart(p) {
  const pts = p.history.filter((x) => x.kind !== 'setup').slice(-30);
  if (pts.length < 2) return h('p', {}, 'A chart of speed appears after a few lessons.');
  const W = 560; const H = 130;
  const max = Math.max(10, ...pts.map((x) => x.wpm));
  const line = pts.map((x, i) => `${(i / (pts.length - 1)) * (W - 20) + 10},${H - 14 - (x.wpm / max) * (H - 30)}`).join(' ');
  return h('div', { class: 'chart', html: `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Typing speed over recent lessons"><line x1="10" x2="${W - 10}" y1="${H - 14}" y2="${H - 14}" class="axis"/><polyline points="${line}" class="spark"/><text x="10" y="14" class="ax">${max} wpm</text><text x="${W - 10}" y="${H - 1}" text-anchor="end" class="ax">latest</text></svg>` });
}

function grownups() {
  const list = state.players;
  const typers = list.map((p) => {
    const passed = Object.values(p.lessons).filter((l) => l.stars).length;
    const last = p.history[p.history.length - 1];
    const checks = p.history.filter((x) => x.kind === 'check');
    const tricky = trickyKeys(p);
    const paceRow = h('div', { class: 'choice-row' }, Object.entries(PACES).map(([id, pa]) => {
      const b = btn(pa.label, () => {
        p.pace = id; save();
        paceRow.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
      }, `small ${p.pace === id ? 'on' : ''}`);
      return b;
    }));
    const unlock = btn(p.unlockAll ? 'All lessons are open' : 'Open all lessons (already knows some)', () => {
      p.unlockAll = !p.unlockAll; save(); grownups();
    }, 'ghost small');
    const resetBtn = btn('Remove this typer', () => {
      resetBtn.textContent = 'Tap again to remove for good';
      if (resetBtn.dataset.armed) { removePlayer(p.id); return state.players.length ? grownups() : welcome(); }
      resetBtn.dataset.armed = '1';
      return null;
    }, 'ghost small danger');
    return h('section', { class: 'card typer' },
      h('div', { class: 'hero-row small' }, owl(colorOf(p), { size: 64 }), h('h2', {}, `${colorOf(p).label} owl`)),
      h('div', { class: 'score-row small' },
        h('div', {}, h('b', {}, `${passed}/${LESSONS.length}`), h('small', {}, 'lessons')),
        h('div', {}, h('b', {}, `${Math.round(p.minutes || 0)}`), h('small', {}, 'minutes typed')),
        h('div', {}, h('b', {}, last ? `${last.wpm}` : '-'), h('small', {}, 'latest wpm')),
        h('div', {}, h('b', {}, last ? `${last.acc}%` : '-'), h('small', {}, 'latest accuracy')),
        h('div', {}, h('b', {}, checks.length ? `${Math.max(...checks.map((x) => x.wpm))}` : '-'), h('small', {}, 'best 1-min check'))),
      progressChart(p),
      h('p', {}, tricky.length ? `Tricky keys: ${tricky.map(keyName).join(', ')}` : 'No tricky keys yet.'),
      h('h3', {}, 'Pace'), paceRow,
      h('div', { class: 'row-left' }, unlock, resetBtn));
  });
  screen('grownups', topBar({ back: home, title: 'For grown-ups' }),
    h('div', { class: 'card' },
      h('h2', {}, 'What Key Perch teaches'),
      h('p', {}, 'Touch typing: all ten fingers, home row first, eyes on the screen. Children must be accurate before they move on, because speed built on bad habits is hard to fix later.'),
      h('h2', {}, 'What it can and cannot see'),
      h('p', {}, 'The app sees which keys are pressed, how quickly, and which Shift key was used. It cannot see fingers. If you watch for one thing, watch for fingers coming back to home row and eyes staying up.')),
    ...typers,
    h('div', { class: 'card' },
      h('h2', {}, 'Privacy'),
      h('p', {}, 'No ads, no accounts, no purchases, no tracking. Progress is saved only on this device or in this browser.'),
      h('p', {}, h('a', { href: 'https://drrobertclinton.github.io/vilasi-kids-apps/key-perch/privacy/' }, 'Privacy policy'), ' · ', h('a', { href: 'https://drrobertclinton.github.io/vilasi-kids-apps/key-perch/support/' }, 'Support')),
      h('p', { class: 'fine' }, 'Key Perch is published by Vilasi, Inc.')));
}

/* ---------- Start ---------- */
async function boot() {
  await restoreNativeCopy();
  if (!state.current && state.players.length === 1) state.current = state.players[0].id;
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.Capacitor) {
    try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch { /* offline play is optional */ }
  }
  home();
}

// Once a real keyboard is used, the note telling people to connect one goes away.
onHardware(() => document.querySelectorAll('.touch-note').forEach((e) => e.remove()));
boot();
