// Everything is saved on this device only. Nothing is ever sent anywhere.
import { LESSONS, lessonIndex } from './curriculum.js';

const KEY = 'keyperch.v1';
let memory = null;

const blank = () => ({ players: [], current: null, sound: true, voice: true, lastBreak: 0 });

function nativePrefs() {
  return window.Capacitor?.Plugins?.Preferences || null;
}

function readLocal() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export const state = load();

function load() {
  try {
    const raw = readLocal();
    if (raw) return { ...blank(), ...JSON.parse(raw) };
  } catch { /* a damaged save starts fresh */ }
  return blank();
}

// iOS can clear web storage when a device runs low on space, so the native
// apps keep a second copy in the app's own preferences.
export async function restoreNativeCopy() {
  const prefs = nativePrefs();
  if (!prefs || state.players.length) return false;
  try {
    const { value } = await prefs.get({ key: KEY });
    if (!value) return false;
    Object.assign(state, blank(), JSON.parse(value));
    save();
    return true;
  } catch { return false; }
}

export function save() {
  const raw = JSON.stringify(state);
  memory = raw;
  try { localStorage.setItem(KEY, raw); } catch { /* private mode: keep playing, just no save */ }
  try { nativePrefs()?.set({ key: KEY, value: raw }); } catch { /* same */ }
}

export const OWL_COLORS = [
  { id: 'brown', label: 'Brown', body: '#7A4A2B', belly: '#F4DDB8' },
  { id: 'snow', label: 'Snowy', body: '#9AA7B5', belly: '#FFFFFF' },
  { id: 'teal', label: 'Teal', body: '#1E7F86', belly: '#D5F0EC' },
  { id: 'plum', label: 'Plum', body: '#7A3E9D', belly: '#F0DDF7' },
  { id: 'berry', label: 'Berry', body: '#B5305F', belly: '#FBDCE5' },
  { id: 'sun', label: 'Sunny', body: '#C9811A', belly: '#FFF0C9' },
];

export function addPlayer(color, pace) {
  const p = { id: `p${Date.now()}`, color, pace, lessons: {}, keys: {}, history: [], games: {}, wear: [], placed: [], minutes: 0 };
  state.players.push(p);
  state.current = p.id;
  save();
  return p;
}

export const player = () => state.players.find((p) => p.id === state.current) || null;
export const colorOf = (p) => OWL_COLORS.find((c) => c.id === p?.color) || OWL_COLORS[0];

export function passedCount(p) {
  let n = 0;
  for (const l of LESSONS) { if (p.lessons[l.id]?.stars > 0) n++; else break; }
  return n;
}

export function isUnlocked(p, index) {
  if (p.unlockAll) return true;
  if (index === 0) return true;
  return !!p.lessons[LESSONS[index - 1].id]?.stars;
}

export function nextLessonIndex(p) {
  for (let i = 0; i < LESSONS.length; i++) if (!p.lessons[LESSONS[i].id]?.stars) return i;
  return -1;
}

// The furthest lesson this typer has reached, used to pick keys for games.
export function reachIndex(p) {
  let reach = 0;
  LESSONS.forEach((l, i) => { if (p.lessons[l.id]?.stars) reach = i; });
  return reach;
}

export const hasPassed = (p, id) => !!p.lessons[id]?.stars;
export const hasReached = (p, id) => p.unlockAll || reachIndex(p) >= lessonIndex(id);

export const totalStars = (p) => Object.values(p.lessons).reduce((a, l) => a + (l.stars || 0), 0);

export function recordKeys(p, keyStats) {
  for (const [k, s] of Object.entries(keyStats)) {
    const row = p.keys[k] || (p.keys[k] = { hit: 0, miss: 0 });
    row.hit += s.hit || 0;
    row.miss += s.miss || 0;
  }
}

export function trickyKeys(p, count = 4) {
  return Object.entries(p.keys)
    .filter(([k, s]) => k !== ' ' && s.miss >= 2 && s.hit + s.miss >= 8)
    .sort((a, b) => b[1].miss / (b[1].hit + b[1].miss) - a[1].miss / (a[1].hit + a[1].miss))
    .slice(0, count)
    .map(([k]) => k);
}

export function recordLesson(p, id, result) {
  const was = p.lessons[id] || { stars: 0, bestWpm: 0, bestAcc: 0, plays: 0 };
  p.lessons[id] = {
    stars: Math.max(was.stars, result.stars),
    bestWpm: Math.max(was.bestWpm, result.wpm),
    bestAcc: Math.max(was.bestAcc, result.acc),
    plays: was.plays + 1,
  };
}

export function recordHistory(p, kind, wpm, acc) {
  p.history.push({ t: Date.now(), kind, wpm: Math.round(wpm), acc: Math.round(acc * 100) });
  if (p.history.length > 300) p.history.splice(0, p.history.length - 300);
}

export function removePlayer(id) {
  state.players = state.players.filter((p) => p.id !== id);
  if (state.current === id) state.current = state.players[0]?.id || null;
  save();
}
