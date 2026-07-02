// Font registry: which font families the document can use. Three groups —
// detected system fonts, user-loaded font files (.ttf/.otf/.woff/.woff2) and
// Google Fonts fetched by name. Framework-free with a subscribe() hook so both
// React (pickers, manager dialog) and the canvas (re-layout on load) can react.

const LS_GOOGLE = 'ov.fonts.google';

// Generic CSS families always work — they head the system group.
const GENERIC_FAMILIES = ['sans-serif', 'serif', 'monospace'];

// Curated candidates; only the ones actually installed pass detection.
const SYSTEM_CANDIDATES = [
  'Arial', 'Helvetica', 'Helvetica Neue', 'Verdana', 'Tahoma', 'Trebuchet MS',
  'Segoe UI', 'Gill Sans', 'Optima', 'Futura', 'Avenir', 'Avenir Next',
  'Times New Roman', 'Georgia', 'Garamond', 'Palatino', 'Baskerville',
  'Didot', 'American Typewriter', 'Courier New', 'Menlo', 'Monaco',
  'Consolas', 'Impact', 'Comic Sans MS', 'Brush Script MT',
];

export const GOOGLE_SUGGESTIONS = [
  'Roboto', 'Inter', 'Montserrat', 'Lora', 'Oswald', 'Playfair Display',
];

// A family is installed if rendering with it changes the measured width
// against at least one generic fallback (the classic canvas trick —
// document.fonts.check() false-positives on aliased families).
function detectSystemFonts() {
  const ctx = document.createElement('canvas').getContext('2d');
  const sample = 'mmmmmmmmmmlliWQ@0123';
  const base = {};
  ['monospace', 'serif'].forEach((g) => {
    ctx.font = `72px ${g}`;
    base[g] = ctx.measureText(sample).width;
  });
  return SYSTEM_CANDIDATES.filter((f) => ['monospace', 'serif'].some((g) => {
    ctx.font = `72px "${f}", ${g}`;
    return ctx.measureText(sample).width !== base[g];
  }));
}

const state = {
  system: [...GENERIC_FAMILIES, ...detectSystemFonts()],
  custom: [], // { family, face } — session-only (FontFace objects aren't serialisable)
  google: [], // family names, persisted in localStorage
};

const listeners = new Set();
function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeFonts(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getFontGroups() {
  return {
    system: state.system.slice(),
    custom: state.custom.map((c) => c.family),
    google: state.google.slice(),
  };
}

export function allFamilies() {
  return [...state.custom.map((c) => c.family), ...state.google, ...state.system];
}

// --- Custom font files ---

function familyFromFileName(name) {
  const base = name.replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/, '');
  return base.replace(/[-_]+/g, ' ').trim() || 'Custom Font';
}

function uniqueFamily(family) {
  const taken = new Set(allFamilies().map((f) => f.toLowerCase()));
  if (!taken.has(family.toLowerCase())) return family;
  let i = 2;
  while (taken.has(`${family} ${i}`.toLowerCase())) i += 1;
  return `${family} ${i}`;
}

// Load .ttf/.otf/.woff/.woff2 files into document.fonts. Returns per-file
// results so the manager dialog can report partial failures.
export async function loadFontFiles(files) {
  const added = [];
  const errors = [];
  for (const file of files) {
    try {
      const family = uniqueFamily(familyFromFileName(file.name));
      const buffer = await file.arrayBuffer();
      const face = new FontFace(family, buffer);
      await face.load();
      document.fonts.add(face);
      // Keep the raw bytes: Create Outlines parses them with opentype.js.
      state.custom.push({ family, face, buffer });
      added.push(family);
    } catch (err) {
      errors.push(`${file.name}: ${err.message || 'not a valid font file'}`);
    }
  }
  if (added.length) notify();
  return { added, errors };
}

// --- Google Fonts ---

function googleLinkId(family) {
  return `ov-gf-${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

// Axis sets, richest first: full variable range with italics, the four
// static classics, plain regular+bold, finally whatever the family has.
// css2 rejects the whole request if any axis tuple is missing, so we walk
// down until one loads — that way variants (weights, italic) come as real
// faces when the family has them, and the browser synthesizes the rest.
const GOOGLE_AXES = [
  ':ital,wght@0,100..900;1,100..900',
  ':ital,wght@0,400;0,700;1,400;1,700',
  ':wght@400;700',
  '',
];

function tryStylesheet(id, href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve(link);
    link.onerror = () => {
      link.remove();
      reject(new Error('axis set unavailable'));
    };
    document.head.appendChild(link);
  });
}

async function injectGoogleFont(family) {
  const id = googleLinkId(family);
  if (!document.getElementById(id)) {
    const urlFamily = family.replace(/ /g, '+');
    let attached = false;
    for (const axes of GOOGLE_AXES) {
      try {
        await tryStylesheet(id, `https://fonts.googleapis.com/css2?family=${urlFamily}${axes}&display=swap`);
        attached = true;
        break;
      } catch {
        // next, plainer axis set
      }
    }
    if (!attached) throw new Error(`"${family}" not found on Google Fonts`);
  }
  // The stylesheet alone doesn't fetch the font — force it and verify.
  const loaded = await document.fonts.load(`16px "${family}"`);
  if (!loaded.length) {
    document.getElementById(id)?.remove();
    throw new Error(`"${family}" failed to load`);
  }
  // Warm the common variants so the canvas doesn't measure with fallback
  // metrics on first use (fire-and-forget; missing faces just no-op).
  ['bold 16px', 'italic 16px', 'italic bold 16px'].forEach((v) => {
    document.fonts.load(`${v} "${family}"`).catch(() => {});
  });
}

export async function addGoogleFont(rawName) {
  const family = rawName.trim().replace(/\s+/g, ' ');
  if (!family) throw new Error('Enter a font name');
  if (state.google.some((f) => f.toLowerCase() === family.toLowerCase())) {
    throw new Error(`"${family}" is already added`);
  }
  await injectGoogleFont(family);
  state.google.push(family);
  localStorage.setItem(LS_GOOGLE, JSON.stringify(state.google));
  notify();
  return family;
}

export function removeFont(family) {
  const ci = state.custom.findIndex((c) => c.family === family);
  if (ci >= 0) {
    document.fonts.delete(state.custom[ci].face);
    state.custom.splice(ci, 1);
    notify();
    return;
  }
  const gi = state.google.indexOf(family);
  if (gi >= 0) {
    state.google.splice(gi, 1);
    localStorage.setItem(LS_GOOGLE, JSON.stringify(state.google));
    document.getElementById(googleLinkId(family))?.remove();
    notify();
  }
}

// --- Font binaries (for Create Outlines) ---

// Generic CSS families resolved to concrete local faces, best match first.
const GENERIC_LOCAL = {
  'sans-serif': ['Helvetica', 'Arial', 'Segoe UI', 'Verdana'],
  serif: ['Times New Roman', 'Times', 'Georgia'],
  monospace: ['Menlo', 'Courier New', 'Monaco', 'Consolas'],
};

function fontsourceId(family) {
  return family.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Google families: fetch a static WOFF (v1 — opentype.js can't read woff2)
// from the Fontsource mirror on jsDelivr. Falls back towards regular when the
// exact weight/italic face doesn't exist.
async function fetchGoogleBinary(family, weight, italic) {
  const id = fontsourceId(family);
  const tries = [];
  const styles = italic ? ['italic', 'normal'] : ['normal'];
  const weights = [...new Set([weight, 400, 700])];
  styles.forEach((s) => weights.forEach((w) => tries.push(`latin-${w}-${s}`)));
  for (const variant of tries) {
    const res = await fetch(`https://cdn.jsdelivr.net/fontsource/fonts/${id}@latest/${variant}.woff`)
      .catch(() => null);
    if (res && res.ok) return res.arrayBuffer();
  }
  throw new Error(`No downloadable face found for "${family}"`);
}

// System families: the Local Font Access API (Chromium; prompts once).
async function fetchLocalBinary(family, weight, italic) {
  if (typeof window.queryLocalFonts !== 'function') {
    throw new Error(`"${family}" is a system font — outlining it needs the Local Font Access API (Chrome) or the font file loaded via Type > Fonts…`);
  }
  const families = GENERIC_LOCAL[family] || [family];
  const fonts = await window.queryLocalFonts();
  const candidates = fonts.filter((f) => families.some((fam) => f.family.toLowerCase() === fam.toLowerCase()));
  if (!candidates.length) throw new Error(`"${family}" was not found among local fonts`);
  const wantBold = weight >= 600;
  const score = (f) => {
    const s = f.style.toLowerCase();
    let n = 0;
    if (/bold/.test(s) === wantBold) n += 2;
    if (/italic|oblique/.test(s) === italic) n += 2;
    if (s === 'regular' && !wantBold && !italic) n += 1;
    return n;
  };
  candidates.sort((a, b) => score(b) - score(a));
  const blob = await candidates[0].blob();
  return blob.arrayBuffer();
}

// Raw bytes of the face closest to family+weight+style. Custom files win
// (we hold their buffers), then the Fontsource mirror for Google families,
// then local fonts. Callers parse the result with opentype.js.
export async function resolveFontBinary(family, { weight = 400, italic = false } = {}) {
  const custom = state.custom.find((c) => c.family === family);
  if (custom) return custom.buffer;
  if (state.google.some((f) => f === family)) return fetchGoogleBinary(family, weight, italic);
  return fetchLocalBinary(family, weight, italic);
}

// Any face that finishes loading (variant weights/italics fetch lazily on
// first use) re-notifies subscribers, so canvas text re-measures with the
// real metrics instead of the synthesized fallback.
document.fonts?.addEventListener?.('loadingdone', () => notify());

// Restore persisted Google Fonts on startup (fire-and-forget: each family
// notifies as it arrives so open documents re-layout with real metrics).
(function restoreGoogleFonts() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(LS_GOOGLE) || '[]');
  } catch {
    saved = [];
  }
  if (!Array.isArray(saved)) return;
  saved.forEach((family) => {
    if (typeof family !== 'string' || !family) return;
    state.google.push(family);
    injectGoogleFont(family).then(notify).catch(() => {});
  });
})();
