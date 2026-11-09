// All sound is made on the fly, so the app ships no audio files.
import { state } from './store.js';

let ctx = null;
function audio() {
  if (!state.sound) return null;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch { return null; }
}

function tone(freq, dur = 0.09, type = 'triangle', vol = 0.12, delay = 0) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + delay;
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  key: () => tone(660, 0.05, 'triangle', 0.05),
  wrong: () => tone(170, 0.14, 'square', 0.05),
  catch: () => { tone(740, 0.08); tone(988, 0.1, 'triangle', 0.1, 0.06); },
  star: () => { tone(784, 0.1); tone(988, 0.1, 'triangle', 0.12, 0.09); tone(1319, 0.2, 'triangle', 0.12, 0.18); },
  lose: () => { tone(330, 0.14, 'sine', 0.08); tone(247, 0.2, 'sine', 0.08, 0.12); },
  tick: () => tone(1200, 0.03, 'square', 0.025),
  drum: () => tone(110, 0.09, 'sine', 0.18),
  note: (i = 0) => tone([523, 587, 659, 784, 880, 1047][i % 6], 0.14, 'triangle', 0.1),
  cheer: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.18, 'triangle', 0.1, i * 0.09)),
};

// Reads instructions aloud for young readers, using the device's own voices.
export function say(text) {
  if (!state.voice || !text) return;
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/;/g, ' semicolon ').replace(/\bF and J\b/g, 'F and J'));
    u.rate = 0.95;
    s.speak(u);
  } catch { /* no voice here: the words are on screen anyway */ }
}

export function hush() {
  try { window.speechSynthesis?.cancel(); } catch { /* nothing to stop */ }
}
