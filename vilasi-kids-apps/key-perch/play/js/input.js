// One place that turns real key presses (or taps on the drawn keyboard) into
// simple events. Only the screen on top of the stack hears them.
const stack = [];
export const held = new Set();
let shiftSide = null;      // which physical Shift is down: 'left' | 'right' | null
let touchShift = false;
export const seen = { hardware: false };
const seenListeners = new Set();
export const onHardware = (fn) => { seenListeners.add(fn); return () => seenListeners.delete(fn); };

export function listen(fn) {
  stack.push(fn);
  return () => {
    const i = stack.indexOf(fn);
    if (i >= 0) stack.splice(i, 1);
  };
}

function emit(ev) {
  const top = stack[stack.length - 1];
  if (top) top(ev);
}

const PLAY_KEYS = /^[\x20-\x7e]$/;

window.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') shiftSide = e.code === 'ShiftRight' ? 'right' : 'left';
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const printable = PLAY_KEYS.test(e.key);
  if (printable && !seen.hardware && !e.isComposing) {
    seen.hardware = true;
    seenListeners.forEach((f) => f());
  }
  const top = stack[stack.length - 1];
  if (!top) return;
  const target = e.target;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT')) return;
  // While a typing screen is up, keys belong to the game (not to page scroll,
  // Firefox quick find on ' and /, or a focused button catching the space bar).
  if (printable || e.key === 'Tab' || e.key === 'Backspace') {
    if (e.key !== 'Tab') e.preventDefault();
  }
  if (e.repeat) return;
  if (printable) {
    held.add(e.key.toLowerCase());
    emit({
      type: 'key', key: e.key, shift: e.shiftKey, shiftSide: e.shiftKey ? (shiftSide || 'unknown') : null,
      caps: !!e.getModifierState?.('CapsLock'),
    });
  } else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Enter') {
    emit({ type: 'control', key: e.key });
  }
}, true);

window.addEventListener('keyup', (e) => {
  if (e.key === 'Shift') shiftSide = null;
  if (PLAY_KEYS.test(e.key)) {
    held.delete(e.key.toLowerCase());
    emit({ type: 'up', key: e.key });
  }
}, true);

window.addEventListener('blur', () => { held.clear(); shiftSide = null; });

// Taps on the drawn keyboard land here.
export function touchDown(key) {
  if (key === 'Shift') { touchShift = !touchShift; emit({ type: 'touchShift', on: touchShift }); return; }
  let out = key;
  const wasShift = touchShift;
  if (touchShift) {
    out = key === '/' ? '?' : key === '1' ? '!' : key.toUpperCase();
    touchShift = false;
    emit({ type: 'touchShift', on: false });
  }
  held.add(key.toLowerCase());
  emit({ type: 'key', key: out, shift: wasShift, shiftSide: wasShift ? 'touch' : null, caps: false, touch: true });
}
export function touchUp(key) {
  if (key === 'Shift') return;
  held.delete(key.toLowerCase());
  emit({ type: 'up', key });
}
export const isTouchFirst = () => !seen.hardware && window.matchMedia?.('(pointer: coarse)').matches;
