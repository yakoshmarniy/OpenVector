// Document-structure version — a cheap change signal for panels that mirror
// the paper tree (Layers). Paper has no mutation events, so the canvas bumps
// this after every user gesture (mouse-up, handled key, menu action).

const listeners = new Set();
let version = 0;

export function subscribeDocument(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function bumpDocument() {
  version += 1;
  listeners.forEach((fn) => fn(version));
}

export function documentVersion() {
  return version;
}
