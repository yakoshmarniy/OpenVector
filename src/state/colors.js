// Document colour state: colour mode (RGB/CMYK), the swatch library and the
// default paint used for newly drawn shapes. Framework-free store with
// subscribe() — React panels and canvas tools stay in sync.
//
// Swatch: { id, name, color: '#rrggbb', global, spot }. Global swatches tag
// the objects they are applied to (item.data.fillSwatch / strokeSwatch), so
// editing the swatch retints those objects (see operations/swatchOps.js).
// 'none' and 'registration' are fixed pseudo-swatches supplied by the panel.

import { SHAPE_STYLE, LINE_STYLE } from '../canvas/tools/styles.js';

const LS_SWATCHES = 'ov.swatches';
const LS_MODE = 'ov.colorMode';

// Default library — muted, desaturated (house palette), plus neutrals.
const DEFAULT_LIBRARY = [
  ['White', '#ffffff'],
  ['Black', '#000000'],
  ['25% Gray', '#bfbfbf'],
  ['50% Gray', '#808080'],
  ['75% Gray', '#404040'],
  ['Clay Red', '#a05252'],
  ['Ochre', '#a8784f'],
  ['Olive Gold', '#a89e55'],
  ['Moss', '#6e8f62'],
  ['Slate Teal', '#5f8d86'],
  ['Dusk Blue', '#5a7794'],
  ['Heather', '#7a6a90'],
  ['Mauve', '#96608a'],
].map(([name, color], i) => ({
  id: `lib-${i}`, name, color, global: false, spot: false,
}));

function loadSwatches() {
  try {
    const raw = localStorage.getItem(LS_SWATCHES);
    if (!raw) return DEFAULT_LIBRARY.slice();
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return DEFAULT_LIBRARY.slice();
    return list.filter((s) => s && s.id && typeof s.color === 'string');
  } catch {
    return DEFAULT_LIBRARY.slice();
  }
}

const state = {
  mode: localStorage.getItem(LS_MODE) === 'cmyk' ? 'cmyk' : 'rgb',
  swatches: loadSwatches(),
};

let counter = 0;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

function persistSwatches() {
  try {
    localStorage.setItem(LS_SWATCHES, JSON.stringify(state.swatches));
  } catch {
    // Storage full/blocked — swatches simply won't persist this session.
  }
}

export function subscribeColors(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// --- Document colour mode ---

export function getColorMode() {
  return state.mode;
}

export function setColorMode(mode) {
  state.mode = mode === 'cmyk' ? 'cmyk' : 'rgb';
  try {
    localStorage.setItem(LS_MODE, state.mode);
  } catch { /* non-fatal */ }
  notify();
}

// --- Swatches ---

export function getSwatches() {
  return state.swatches.slice();
}

export function getSwatch(id) {
  return state.swatches.find((s) => s.id === id) || null;
}

export function addSwatch({ name, color, global = true, spot = false }) {
  counter += 1;
  const swatch = {
    id: `sw-${Date.now().toString(36)}-${counter}`,
    name: name || `Swatch ${state.swatches.length + 1}`,
    color,
    global: !!global,
    spot: !!spot,
  };
  state.swatches.push(swatch);
  persistSwatches();
  notify();
  return swatch;
}

export function updateSwatch(id, patch) {
  const swatch = state.swatches.find((s) => s.id === id);
  if (!swatch) return null;
  Object.assign(swatch, patch);
  if (swatch.spot) swatch.global = true; // spot inks behave as global colours
  persistSwatches();
  notify();
  return swatch;
}

export function removeSwatch(id) {
  const i = state.swatches.findIndex((s) => s.id === id);
  if (i < 0) return;
  state.swatches.splice(i, 1);
  persistSwatches();
  notify();
}

// --- Default paint (applied to newly drawn shapes) ---
// SHAPE_STYLE / LINE_STYLE are read by the drawing tools at gesture time, so
// mutating them changes what the next shape looks like.

export function getDefaultPaint() {
  return { fill: SHAPE_STYLE.fillColor, stroke: SHAPE_STYLE.strokeColor };
}

export function setDefaultPaint({ fill, stroke }) {
  if (fill) SHAPE_STYLE.fillColor = fill;
  if (stroke) {
    SHAPE_STYLE.strokeColor = stroke;
    LINE_STYLE.strokeColor = stroke;
  }
  notify();
}
