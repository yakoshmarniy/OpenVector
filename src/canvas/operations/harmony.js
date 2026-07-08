// Colour harmony maths shared by the Color Guide panel and the Recolor
// Artwork dialog. Everything works in HSB on top of colorConvert; results are
// plain hex strings so callers can feed them straight into applyStyle.

import {
  normHex, hexToRgb, rgbToHex, rgbToHsb, hsbToRgb,
} from './colorConvert.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const toHsb = (hex) => rgbToHsb(hexToRgb(normHex(hex) || '#808080'));
export const toHex = (hsb) => rgbToHex(hsbToRgb({
  h: ((hsb.h % 360) + 360) % 360,
  s: clamp(hsb.s, 0, 100),
  b: clamp(hsb.b, 0, 100),
}));

export const HARMONY_RULES = [
  { id: 'complementary', label: 'Complementary' },
  { id: 'monochromatic', label: 'Monochromatic' },
  { id: 'triad', label: 'Triad' },
  { id: 'analogous', label: 'Analogous' },
  { id: 'highContrast', label: 'High Contrast' },
  { id: 'pentagram', label: 'Pentagram' },
];

// Derive the harmony group for a base colour. The base is always first, the
// rest follow Illustrator's spirit: hue spins for the geometric rules, tonal
// steps for Monochromatic, hue spins plus a tonal bridge for Complementary.
export function harmonyColors(baseHex, rule) {
  const base = toHsb(baseHex);
  const spin = (dh, ds = 1, db = 1) => toHex({ h: base.h + dh, s: base.s * ds, b: base.b * db });

  switch (rule) {
    case 'complementary':
      return [toHex(base), spin(0, 0.5, 1.12), spin(180, 0.5, 1.12), spin(180)];
    case 'monochromatic':
      return [
        toHex(base),
        spin(0, 0.65, 1),
        spin(0, 1, 0.68),
        spin(0, 0.35, 1.2),
        spin(0, 0.82, 0.45),
      ];
    case 'triad':
      return [toHex(base), spin(120), spin(240)];
    case 'analogous':
      return [toHex(base), spin(-30), spin(-15), spin(15), spin(30)];
    case 'highContrast':
      return [toHex(base), spin(180), spin(90), spin(270)];
    case 'pentagram':
      return [toHex(base), spin(72), spin(144), spin(216), spin(288)];
    default:
      return [toHex(base)];
  }
}

export const VARIATION_KINDS = [
  { id: 'tintsShades', label: 'Tints / Shades' },
  { id: 'warmCool', label: 'Warm / Cool' },
  { id: 'vividMuted', label: 'Vivid / Muted' },
];

const mixRgb = (rgb, target, t) => ({
  r: rgb.r + (target.r - rgb.r) * t,
  g: rgb.g + (target.g - rgb.g) * t,
  b: rgb.b + (target.b - rgb.b) * t,
});

// A variation row: `steps` colours left of the base, the base, `steps` right.
// tintsShades: darker ← base → lighter; warmCool: toward red ← → toward blue;
// vividMuted: toward gray ← → more saturated.
export function variationRow(hex, kind, steps = 4) {
  const base = toHsb(hex);
  const rgb = hexToRgb(normHex(hex) || '#808080');
  const left = [];
  const right = [];

  for (let i = steps; i >= 1; i -= 1) {
    const t = i / steps;
    if (kind === 'tintsShades') {
      left.push(toHex({ ...base, b: base.b * (1 - 0.72 * t) }));
    } else if (kind === 'warmCool') {
      left.push(rgbToHex(mixRgb(rgb, { r: 255, g: 70, b: 0 }, 0.4 * t)));
    } else {
      left.push(toHex({ ...base, s: base.s * (1 - 0.85 * t), b: base.b * (1 - 0.18 * t) }));
    }
  }
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    if (kind === 'tintsShades') {
      right.push(toHex({
        ...base,
        s: base.s * (1 - 0.8 * t),
        b: base.b + (100 - base.b) * 0.85 * t,
      }));
    } else if (kind === 'warmCool') {
      right.push(rgbToHex(mixRgb(rgb, { r: 0, g: 60, b: 255 }, 0.4 * t)));
    } else {
      right.push(toHex({
        ...base,
        s: base.s + (100 - base.s) * 0.8 * t,
        b: base.b + (100 - base.b) * 0.3 * t,
      }));
    }
  }
  return [...left, normHex(hex) || '#808080', ...right];
}

// Nearest colour (RGB distance) from a list — used by "limit to library".
export function nearestColor(hex, candidates) {
  const rgb = hexToRgb(hex);
  let best = null;
  let bestD = Infinity;
  candidates.forEach((c) => {
    const o = hexToRgb(c);
    const d = (rgb.r - o.r) ** 2 + (rgb.g - o.g) ** 2 + (rgb.b - o.b) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  });
  return best || hex;
}
