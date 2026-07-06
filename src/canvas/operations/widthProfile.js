import paper from 'paper';

// Variable stroke width (Width Tool + Variable Width Profiles).
//
// The profile lives on the path itself:
//   path.data.width = { base, preset, points: [{ o, w }, …] }
// where `o` is the offset along the path as a 0..1 fraction and `w` the full
// stroke width (px) at that point, sorted by `o`. `base` is the nominal weight
// shown in the Properties panel.
//
// Paper can't stroke with a variable width, so the stroke is rendered by a
// separate filled envelope item (`data.isWidthEnvelope`, linked by `ownerId`,
// same pattern as arrowheads): rebuilt — never moved — on every overlay
// redraw and on style edits. While a profile exists, the path's native
// strokeWidth is 0 (paper skips zero-width strokes); the logical weight stays
// in data.width.base and itemStyle maps it back for the panel.

const ENVELOPE_FLAG = 'isWidthEnvelope';
const MIN_W = 0.1;

export function isWidthEnvelope(item) {
  return !!(item && item.data && item.data[ENVELOPE_FLAG]);
}

export const getWidthProfile = (item) => (item && item.data && item.data.width) || null;

export const hasWidthProfile = (item) => !!getWidthProfile(item);

// Piecewise-linear width at offset fraction `o`. The path ends act as
// implicit anchors at the nominal weight (Illustrator: one width point makes
// a spindle that tapers back to the stroke weight at both ends).
export function widthAt(profile, o) {
  const pts = profile.points;
  if (!pts.length) return profile.base;
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (o <= first.o) {
    if (first.o < 1e-9) return first.w;
    return profile.base + (first.w - profile.base) * (o / first.o);
  }
  if (o >= last.o) {
    if (1 - last.o < 1e-9) return last.w;
    return last.w + (profile.base - last.w) * ((o - last.o) / (1 - last.o));
  }
  for (let i = 1; i < pts.length; i += 1) {
    if (o <= pts[i].o) {
      const a = pts[i - 1];
      const b = pts[i];
      const t = b.o - a.o < 1e-9 ? 0 : (o - a.o) / (b.o - a.o);
      return a.w + (b.w - a.w) * t;
    }
  }
  return profile.base;
}

const canCarryProfile = (item) =>
  item instanceof paper.Path && !isWidthEnvelope(item) && item.segments.length > 1;

// Start a profile on a stroked path: remember the nominal weight and hide the
// native (uniform) stroke so only the envelope renders.
export function ensureProfile(item) {
  if (!canCarryProfile(item)) return null;
  if (!item.data.width) {
    item.data.width = {
      base: item.strokeWidth || 1,
      preset: 'custom',
      points: [],
    };
    item.strokeWidth = 0;
  }
  return item.data.width;
}

export function clearProfile(item) {
  const prof = getWidthProfile(item);
  if (!prof) return;
  item.strokeWidth = prof.base;
  delete item.data.width;
  clearWidthEnvelope(item);
}

// Panel "Width" edits scale the whole profile proportionally (Illustrator
// keeps the profile shape when the stroke weight changes).
export function setBaseWidth(item, w) {
  const prof = getWidthProfile(item);
  if (!prof) return;
  const next = Math.max(MIN_W, w || 0);
  const factor = prof.base > 1e-9 ? next / prof.base : 1;
  prof.base = next;
  prof.points.forEach((p) => {
    p.w = Math.max(MIN_W, p.w * factor);
  });
}

export function addWidthPoint(item, o, w) {
  const prof = ensureProfile(item);
  if (!prof) return null;
  const pt = { o: Math.max(0, Math.min(1, o)), w: Math.max(MIN_W, w) };
  prof.points.push(pt);
  prof.points.sort((a, b) => a.o - b.o);
  prof.preset = 'custom';
  return pt;
}

export function removeWidthPoint(item, pt) {
  const prof = getWidthProfile(item);
  if (!prof) return;
  const i = prof.points.indexOf(pt);
  if (i >= 0) prof.points.splice(i, 1);
  prof.preset = 'custom';
  if (!prof.points.length) clearProfile(item);
}

// The classic preset shapes, expressed against the nominal weight.
export const WIDTH_PRESETS = [
  { id: 'uniform', label: 'Uniform' },
  { id: 'p1', label: 'Width Profile 1' }, // taper both ends
  { id: 'p2', label: 'Width Profile 2' }, // full → tip
  { id: 'p3', label: 'Width Profile 3' }, // tip → full
  { id: 'p4', label: 'Width Profile 4' }, // pinched middle
];

export function applyWidthPreset(item, presetId) {
  if (presetId === 'uniform') {
    clearProfile(item);
    return;
  }
  const prof = ensureProfile(item);
  if (!prof) return;
  const b = prof.base;
  const shapes = {
    p1: [{ o: 0, w: MIN_W }, { o: 0.5, w: b }, { o: 1, w: MIN_W }],
    p2: [{ o: 0, w: b }, { o: 1, w: MIN_W }],
    p3: [{ o: 0, w: MIN_W }, { o: 1, w: b }],
    p4: [{ o: 0, w: b }, { o: 0.5, w: Math.max(MIN_W, b * 0.25) }, { o: 1, w: b }],
  };
  const shape = shapes[presetId];
  if (!shape) return;
  prof.points = shape.map((p) => ({ ...p }));
  prof.preset = presetId;
}

// ---------------------------------------------------------------------------
// Envelope rendering

function ownedEnvelopes(item) {
  const parent = item.parent;
  if (!parent) return [];
  return parent.children.filter(
    (c) => c.data && c.data[ENVELOPE_FLAG] && c.data.ownerId === item.id,
  );
}

export function clearWidthEnvelope(item) {
  ownedEnvelopes(item).forEach((e) => e.remove());
  if (item && item.children) {
    item.children.forEach((c) => {
      if (!isWidthEnvelope(c)) clearWidthEnvelope(c);
    });
  }
}

// Sample offsets: dense enough for smooth curves, and always through the
// profile points themselves so width peaks stay sharp.
function sampleFractions(path, prof) {
  const n = Math.min(160, Math.max(32, Math.ceil(path.length / 6)));
  const ts = [];
  for (let i = 0; i <= n; i += 1) ts.push(i / n);
  prof.points.forEach((p) => ts.push(p.o));
  ts.sort((a, b) => a - b);
  return ts.filter((t, i) => i === 0 || t - ts[i - 1] > 1e-6);
}

function buildEnvelope(path, prof) {
  const L = path.length;
  if (L < 1e-6) return null;
  const ts = sampleFractions(path, prof);
  const left = [];
  const right = [];
  let lastNormal = null;
  ts.forEach((t) => {
    const off = Math.min(L, t * L);
    const p = path.getPointAt(off);
    let n = path.getNormalAt(off);
    if (!p) return;
    if (!n || n.length < 1e-6) n = lastNormal;
    if (!n) return;
    lastNormal = n;
    const half = Math.max(MIN_W, widthAt(prof, t)) / 2;
    left.push(p.add(n.multiply(half)));
    right.push(p.subtract(n.multiply(half)));
  });
  if (left.length < 2) return null;

  let env;
  if (path.closed) {
    // A closed spine yields two rings; even-odd fill leaves the middle open.
    const outer = new paper.Path({ segments: left, closed: true, insert: false });
    const inner = new paper.Path({ segments: right, closed: true, insert: false });
    env = new paper.CompoundPath({ children: [outer, inner], insert: false });
    env.fillRule = 'evenodd';
  } else {
    env = new paper.Path({ segments: left.concat(right.reverse()), closed: true, insert: false });
  }
  return env;
}

// Rebuild the envelope(s) for `item` (recursing into groups). Called from the
// selection overlay on every redraw and from applyStyle, so the envelope
// tracks moves, transforms, reshapes and style edits.
export function refreshWidthEnvelope(item) {
  if (!item || isWidthEnvelope(item)) return;
  if (item.children && !(item.data && item.data.isText)) {
    // Sweep stale envelopes first: cloning a group copies the child envelope,
    // but its ownerId still points at the original path.
    const ids = new Set(item.children.map((c) => c.id));
    item.children.slice().forEach((c) => {
      if (isWidthEnvelope(c) && !ids.has(c.data.ownerId)) c.remove();
    });
    item.children.forEach((c) => refreshWidthEnvelope(c));
    return;
  }
  const prof = getWidthProfile(item);
  ownedEnvelopes(item).forEach((e) => e.remove());
  if (!prof || !canCarryProfile(item) || !item.strokeColor || !item.visible) return;

  const env = buildEnvelope(item, prof);
  if (!env) return;
  env.fillColor = item.strokeColor.clone();
  env.strokeColor = null;
  env.opacity = item.opacity ?? 1;
  env.data[ENVELOPE_FLAG] = true;
  env.data.ownerId = item.id;
  env.locked = true;
  env.insertAbove(item);
}
