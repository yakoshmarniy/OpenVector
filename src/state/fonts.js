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
      const face = new FontFace(family, await file.arrayBuffer());
      await face.load();
      document.fonts.add(face);
      state.custom.push({ family, face });
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

async function injectGoogleFont(family) {
  const id = googleLinkId(family);
  if (!document.getElementById(id)) {
    await new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@400;700&display=swap`;
      link.onload = resolve;
      link.onerror = () => {
        link.remove();
        reject(new Error(`"${family}" not found on Google Fonts`));
      };
      document.head.appendChild(link);
    });
  }
  // The stylesheet alone doesn't fetch the font — force it and verify.
  const loaded = await document.fonts.load(`16px "${family}"`);
  if (!loaded.length) {
    document.getElementById(id)?.remove();
    throw new Error(`"${family}" failed to load`);
  }
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
