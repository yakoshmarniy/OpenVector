// Graphic Styles library: named appearance bundles (see
// operations/graphicStyles.js for the bundle shape). Framework-free store with
// subscribe() + localStorage persistence, mirroring state/colors.js.

const LS_KEY = 'ov.graphicStyles';

// A few built-in starters so the panel isn't empty. Muted, house palette.
const DEFAULTS = [
  {
    id: 'gs-fill', name: 'Grey Fill',
    style: { fill: '#b9bcc0', stroke: null, strokeWidth: 1, opacity: 1, appearance: [] },
  },
  {
    id: 'gs-outline', name: 'Outline',
    style: { fill: null, stroke: '#3a3a3a', strokeWidth: 2, opacity: 1, appearance: [] },
  },
  {
    id: 'gs-clay', name: 'Clay',
    style: { fill: '#a05252', stroke: '#5c2f2f', strokeWidth: 1.5, opacity: 1, appearance: [] },
  },
  {
    id: 'gs-double', name: 'Double Stroke',
    style: {
      fill: '#d8d5cc', stroke: '#2b2b2b', strokeWidth: 6, strokeCap: 'round', opacity: 1,
      appearance: [{ kind: 'stroke', color: '#a89e55', width: 2, opacity: 1, visible: true, cap: 'round' }],
    },
  },
];

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULTS.slice();
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return DEFAULTS.slice();
    return list.filter((s) => s && s.id && s.style);
  } catch {
    return DEFAULTS.slice();
  }
}

const state = { styles: load() };
let counter = 0;
const listeners = new Set();

function notify() { listeners.forEach((fn) => fn()); }

function persist() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state.styles)); } catch { /* quota */ }
}

export function subscribeStyles(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const getStyles = () => state.styles;

export function addStyle(style, name) {
  const id = `gs-${Date.now()}-${(counter += 1)}`;
  const entry = { id, name: name || `Style ${state.styles.length + 1}`, style };
  state.styles = [...state.styles, entry];
  persist();
  notify();
  return entry;
}

export function removeStyle(id) {
  state.styles = state.styles.filter((s) => s.id !== id);
  persist();
  notify();
}

export function renameStyle(id, name) {
  state.styles = state.styles.map((s) => (s.id === id ? { ...s, name } : s));
  persist();
  notify();
}
