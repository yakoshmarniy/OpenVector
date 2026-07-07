// Pure colour-space maths shared by the Color panel, the Color Picker and the
// Swatches panel. Everything round-trips through sRGB {r, g, b} in 0–255.
// CMYK is the naive device conversion (no ICC profiles yet — phase 14.3).

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// '#abc' / 'abc' / '#aabbcc' → '#aabbcc', or null when unparseable.
export function normHex(input) {
  if (typeof input !== 'string') return null;
  let s = input.trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(s)) s = s.replace(/./g, (ch) => ch + ch);
  return /^[0-9a-f]{6}$/.test(s) ? `#${s}` : null;
}

export function hexToRgb(hex) {
  const h = normHex(hex) || '#000000';
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  const to2 = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

// --- HSB (a.k.a. HSV): h 0–360, s 0–100, b 0–100 ---

export function rgbToHsb({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : (d / max) * 100, b: max * 100 };
}

export function hsbToRgb({ h, s, b }) {
  const sn = clamp(s, 0, 100) / 100;
  const vn = clamp(b, 0, 100) / 100;
  const hn = ((h % 360) + 360) % 360;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = vn - c;
  const seg = Math.floor(hn / 60);
  const [rn, gn, bn] = [
    [c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x],
  ][seg] || [c, x, 0];
  return { r: (rn + m) * 255, g: (gn + m) * 255, b: (bn + m) * 255 };
}

// --- CMYK: all channels 0–100 ---

export function rgbToCmyk({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: ((1 - rn - k) / (1 - k)) * 100,
    m: ((1 - gn - k) / (1 - k)) * 100,
    y: ((1 - bn - k) / (1 - k)) * 100,
    k: k * 100,
  };
}

export function cmykToRgb({ c, m, y, k }) {
  const kn = clamp(k, 0, 100) / 100;
  const chan = (v) => 255 * (1 - clamp(v, 0, 100) / 100) * (1 - kn);
  return { r: chan(c), g: chan(m), b: chan(y) };
}

// --- Grayscale: single K (ink) channel, 0 = white, 100 = black ---

export function rgbToGray({ r, g, b }) {
  return 100 - ((0.299 * r + 0.587 * g + 0.114 * b) / 255) * 100;
}

export function grayToRgb(k) {
  const v = 255 * (1 - clamp(k, 0, 100) / 100);
  return { r: v, g: v, b: v };
}

// --- Lab (D65): L 0–100, a/b ≈ −128…127. Out-of-sRGB results clamp. ---

function srgbToLinear(v) {
  const n = v / 255;
  return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(v) {
  const n = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  return clamp(n * 255, 0, 255);
}

const WHITE = { x: 0.95047, y: 1, z: 1.08883 }; // D65

export function rgbToLab({ r, g, b }) {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  const x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / WHITE.x;
  const y = (rl * 0.2126 + gl * 0.7152 + bl * 0.0722) / WHITE.y;
  const z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / WHITE.z;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function labToRgb({ l, a, b }) {
  const fy = (clamp(l, 0, 100) + 16) / 116;
  const fx = fy + clamp(a, -128, 127) / 500;
  const fz = fy - clamp(b, -128, 127) / 200;
  const inv = (t) => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787);
  const x = inv(fx) * WHITE.x;
  const y = inv(fy) * WHITE.y;
  const z = inv(fz) * WHITE.z;
  const rl = x * 3.2406 + y * -1.5372 + z * -0.4986;
  const gl = x * -0.9689 + y * 1.8758 + z * 0.0415;
  const bl = x * 0.0557 + y * -0.204 + z * 1.057;
  return { r: linearToSrgb(rl), g: linearToSrgb(gl), b: linearToSrgb(bl) };
}

// --- CMYK gamut (naive): a colour is printable when the CMYK round-trip
// reproduces it. The device conversion above is lossless, so approximate the
// press gamut by quantising channels to whole percents first. ---

export function cmykRoundTrip(hex) {
  const cmyk = rgbToCmyk(hexToRgb(hex));
  const q = {
    c: Math.round(cmyk.c), m: Math.round(cmyk.m), y: Math.round(cmyk.y), k: Math.round(cmyk.k),
  };
  return rgbToHex(cmykToRgb(q));
}

// Very saturated / very bright RGB colours fall outside a typical CMYK press
// gamut. Without profiles, flag colours whose saturation and brightness are
// both high — the classic out-of-gamut zone Illustrator warns about.
export function isOutOfCmykGamut(hex) {
  const { s, b } = rgbToHsb(hexToRgb(hex));
  return s > 82 && b > 82;
}

// Pull an out-of-gamut colour to the nearest "printable" one by damping
// saturation/brightness into the safe zone, then quantising through CMYK.
export function nearestInGamut(hex) {
  const hsb = rgbToHsb(hexToRgb(hex));
  if (!isOutOfCmykGamut(hex)) return cmykRoundTrip(hex);
  const scale = 82 / Math.max(hsb.s, hsb.b);
  return cmykRoundTrip(rgbToHex(hsbToRgb({
    h: hsb.h,
    s: Math.min(hsb.s, hsb.s * scale + 4),
    b: Math.min(hsb.b, hsb.b * scale + 4),
  })));
}
