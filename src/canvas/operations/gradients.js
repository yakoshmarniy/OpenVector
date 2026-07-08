import paper from 'paper';
import { hexToRgb, rgbToHex } from './colorConvert.js';

// Gradient fills/strokes. Linear and radial are Paper.js native gradient
// Colors — Paper transforms their geometry together with the item, so once
// applied they follow moves/scales/rotations on their own. Conic (angular)
// has no Paper primitive, so it is rendered the width-envelope / arrowheads
// way: a companion clipped wedge-fan Group tagged `data.isGradientFill` and
// owned by its path via `data.ownerId`, rebuilt (never moved) by
// `refreshGradientFill`, which the selection overlay and applyStyle call on
// every redraw so it tracks the shape (v1: the fan follows translation and
// scale via the bounds; its start angle does not rotate — noted).

const FILL_KEY = 'fillGradient';
const STROKE_KEY = 'strokeGradient';
const GRAD_FLAG = 'isGradientFill';
const FAN_SEGMENTS = 96;

export const GRADIENT_TYPES = ['linear', 'radial', 'conic'];

const dataKey = (which) => (which === 'stroke' ? STROKE_KEY : FILL_KEY);

export function isGradientFillItem(item) {
  return !!(item && item.data && item.data[GRAD_FLAG]);
}

// --- descriptor helpers ---

export function defaultGradient(type = 'linear', c0 = '#ffffff', c1 = '#1a1a1a') {
  return {
    type,
    angle: 0, // linear axis / conic start, degrees
    stops: [
      { offset: 0, color: c0, opacity: 1 },
      { offset: 1, color: c1, opacity: 1 },
    ],
  };
}

export function getGradient(item, which = 'fill') {
  return (item && item.data && item.data[dataKey(which)]) || null;
}

function sortedStops(desc) {
  return desc.stops.slice().sort((a, b) => a.offset - b.offset);
}

// sRGB ↔ linear-light, for perceptual interpolation (blend in linear space so
// mid-tones don't muddy — the classic red→green problem).
const toLinear = (c) => Math.pow(c / 255, 2.2);
const fromLinear = (v) => Math.max(0, Math.min(255, 255 * Math.pow(Math.max(0, v), 1 / 2.2)));

function mixHex(a, b, f, perceptual) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (perceptual) {
    return rgbToHex({
      r: fromLinear(toLinear(ca.r) + (toLinear(cb.r) - toLinear(ca.r)) * f),
      g: fromLinear(toLinear(ca.g) + (toLinear(cb.g) - toLinear(ca.g)) * f),
      b: fromLinear(toLinear(ca.b) + (toLinear(cb.b) - toLinear(ca.b)) * f),
    });
  }
  return rgbToHex({ r: ca.r + (cb.r - ca.r) * f, g: ca.g + (cb.g - ca.g) * f, b: ca.b + (cb.b - ca.b) * f });
}

// The stop list actually used for rendering. Perceptual interpolation inserts
// linear-light midpoints so Paper's native (sRGB) interpolation approximates a
// perceptual ramp; classic returns the stops untouched.
function renderStops(desc) {
  const s = sortedStops(desc);
  if (desc.interpolation !== 'perceptual' || s.length < 2) return s;
  const out = [];
  for (let i = 0; i < s.length - 1; i += 1) {
    const a = s[i];
    const b = s[i + 1];
    out.push(a);
    for (let k = 1; k <= 2; k += 1) {
      const f = k / 3;
      out.push({
        offset: a.offset + (b.offset - a.offset) * f,
        color: mixHex(a.color, b.color, f, true),
        opacity: (a.opacity ?? 1) + ((b.opacity ?? 1) - (a.opacity ?? 1)) * f,
      });
    }
  }
  out.push(s[s.length - 1]);
  return out;
}

// A Paper colour for a stop, honouring its opacity.
function stopColor(stop) {
  const c = new paper.Color(stop.color);
  c.alpha = stop.opacity == null ? 1 : stop.opacity;
  return c;
}

// Sample the ramp at t in [0,1] (used to shade conic wedges) → paper.Color.
function sampleRamp(stops, t) {
  const s = stops;
  if (t <= s[0].offset) return stopColor(s[0]);
  if (t >= s[s.length - 1].offset) return stopColor(s[s.length - 1]);
  for (let i = 0; i < s.length - 1; i += 1) {
    const a = s[i];
    const b = s[i + 1];
    if (t >= a.offset && t <= b.offset) {
      const span = b.offset - a.offset || 1;
      const f = (t - a.offset) / span;
      const ca = hexToRgb(a.color);
      const cb = hexToRgb(b.color);
      const mix = rgbToHex({
        r: ca.r + (cb.r - ca.r) * f,
        g: ca.g + (cb.g - ca.g) * f,
        b: ca.b + (cb.b - ca.b) * f,
      });
      const col = new paper.Color(mix);
      col.alpha = (a.opacity ?? 1) + ((b.opacity ?? 1) - (a.opacity ?? 1)) * f;
      return col;
    }
  }
  return stopColor(s[s.length - 1]);
}

// Ramp colour at t as a plain { color:'#hex', opacity } — used when adding a
// stop on the canvas so the new stop matches the existing blend.
export function rampColorAt(desc, t) {
  const c = sampleRamp(renderStops(desc), t);
  return { color: c.toCSS(true), opacity: c.alpha };
}

// Default linear/radial geometry from the item's bounds and the axis angle.
function defaultGeometry(item, desc) {
  const b = item.bounds;
  const c = b.center;
  const dir = new paper.Point({ angle: desc.angle || 0, length: 1 });
  if (desc.type === 'radial') {
    const radius = Math.max(b.width, b.height) / 2 || 1;
    return { origin: c.clone(), destination: c.add(dir.multiply(radius)) };
  }
  // Linear: axis spans the bounds along the direction.
  const half = (Math.abs(dir.x) * b.width + Math.abs(dir.y) * b.height) / 2 || 1;
  return { origin: c.subtract(dir.multiply(half)), destination: c.add(dir.multiply(half)) };
}

// Build the native Paper gradient Color for linear/radial.
function nativeColor(desc, geom) {
  const stops = renderStops(desc).map((s) => new paper.GradientStop(stopColor(s), s.offset));
  const gradient = new paper.Gradient(stops, desc.type === 'radial');
  return new paper.Color(gradient, geom.origin, geom.destination, geom.highlight || null);
}

// --- apply / clear ---

// Apply a gradient descriptor to `which` ('fill'|'stroke') of the item.
// `geom` (project-space origin/destination[/highlight]) is optional — when
// omitted it is derived from the bounds. Returns the geometry used.
export function applyGradient(item, desc, which = 'fill', geom = null) {
  if (!item.data) item.data = {};
  item.data[dataKey(which)] = desc;
  const g = geom || defaultGeometry(item, desc);

  if (which === 'stroke') {
    // Stroke conic is not supported (v1) — fall back to linear geometry.
    const d = desc.type === 'conic' ? { ...desc, type: 'linear' } : desc;
    item.strokeColor = nativeColor(d, geom || defaultGeometry(item, d));
    return g;
  }

  if (desc.type === 'conic') {
    // The visible fill is the companion fan; keep an opaque backdrop on the
    // path itself so it still hit-tests and no gaps show through the seams.
    item.fillColor = stopColor(sortedStops(desc)[0]);
  } else {
    item.fillColor = nativeColor(desc, g);
  }
  refreshGradientFill(item);
  return g;
}

// Live project-space geometry of a linear/radial gradient (for the on-canvas
// annotator). Falls back to the bounds-derived default when unavailable.
export function readGeometry(item, which = 'fill') {
  const color = which === 'stroke' ? item.strokeColor : item.fillColor;
  if (color && color.type === 'gradient' && color.origin && color.destination) {
    return {
      origin: color.origin.clone(),
      destination: color.destination.clone(),
      highlight: color.highlight ? color.highlight.clone() : null,
    };
  }
  const desc = getGradient(item, which);
  return desc ? defaultGeometry(item, desc) : null;
}

export function clearGradient(item, which = 'fill') {
  if (item && item.data) delete item.data[dataKey(which)];
  if (which === 'fill') clearGradientFill(item);
}

// --- conic companion fan (fill only) ---

function ownedFans(item) {
  const parent = item.parent;
  if (!parent) return [];
  return parent.children.filter(
    (c) => c.data && c.data[GRAD_FLAG] && c.data.ownerId === item.id,
  );
}

export function clearGradientFill(item) {
  ownedFans(item).forEach((f) => f.remove());
}

function buildFan(item, desc) {
  const b = item.bounds;
  const center = b.center;
  const radius = Math.hypot(b.width, b.height) / 2 + 1; // cover the whole shape
  const stops = renderStops(desc);
  const start = desc.angle || 0;

  const fan = new paper.Group();
  for (let i = 0; i < FAN_SEGMENTS; i += 1) {
    const t0 = i / FAN_SEGMENTS;
    const t1 = (i + 1) / FAN_SEGMENTS;
    const col = sampleRamp(stops, (t0 + t1) / 2);
    const p0 = center.add(new paper.Point({ angle: start + t0 * 360, length: radius }));
    const p1 = center.add(new paper.Point({ angle: start + t1 * 360, length: radius }));
    const wedge = new paper.Path([center, p0, p1]);
    wedge.closed = true;
    wedge.fillColor = col;
    // A hairline stroke of the same colour hides anti-alias seams between wedges.
    wedge.strokeColor = col;
    wedge.strokeWidth = 0.6;
    fan.addChild(wedge);
  }

  // Clip the fan to the shape.
  const mask = item.clone({ insert: false });
  mask.data = {};
  mask.clipMask = true;
  const clip = new paper.Group([mask, fan]);
  clip.clipped = true;
  clip.data[GRAD_FLAG] = true;
  clip.data.ownerId = item.id;
  clip.locked = true;
  clip.insertAbove(item);
}

// Rebuild the conic companion for an item (no-op for linear/radial / no
// gradient). Also sweeps orphan fans whose owner is gone.
export function refreshGradientFill(item) {
  if (!item || isGradientFillItem(item)) return;
  clearGradientFill(item);
  const desc = getGradient(item, 'fill');
  if (desc && desc.type === 'conic' && item instanceof paper.Path && item.visible) {
    buildFan(item, desc);
  }
}
