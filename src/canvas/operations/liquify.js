import paper from 'paper';
import { editableItems } from './selection.js';
import { isTransientItem } from './isolation.js';
import { getSelectedItems } from '../../state/selection.js';
import { hasWidthProfile, refreshWidthEnvelope } from './widthProfile.js';

// Liquify core — the seven brush deformers (Warp, Twirl, Pucker, Bloat,
// Scallop, Crystallize, Wrinkle). Each drag event applies one deformation
// step to every anchor/handle under the elliptical brush; holding the brush
// over a spot keeps deforming (per-event steps accumulate, as in Illustrator).

export const SIMPLIFY_MODES = ['warp', 'twirl', 'pucker', 'bloat'];
export const TEXTURE_MODES = ['scallop', 'crystallize', 'wrinkle'];

const brushRadius = (opts) => (opts.width + opts.height) / 4;

// Smooth cosine falloff: 1 at the brush centre → 0 at the ellipse edge.
// Distance is measured in brush-local coordinates (rotated by the brush
// angle, scaled by the two semi-axes) so the ellipse shape and tilt count.
function weightAt(point, center, opts) {
  const v = point.subtract(center).rotate(-opts.angle);
  const nx = v.x / (opts.width / 2);
  const ny = v.y / (opts.height / 2);
  const d = Math.sqrt(nx * nx + ny * ny);
  if (d >= 1) return 0;
  const c = Math.cos((d * Math.PI) / 2);
  return c * c;
}

// Path leaves the brush may deform: the selection when there is one,
// otherwise everything editable; text and system items are skipped (v1).
export function collectLiquifyPaths(center, opts) {
  const sel = getSelectedItems();
  const roots = sel.length ? sel : editableItems();
  const out = [];
  const walk = (it) => {
    if (!it || it.locked || !it.visible || isTransientItem(it)) return;
    if (it.data && (it.data.isText || it.data.isDimension)) return;
    if (it.className === 'Path') {
      if (it.segments.length > 1) out.push(it);
      return;
    }
    if (it.children) it.children.forEach(walk);
  };
  roots.forEach(walk);

  const r = Math.max(opts.width, opts.height) / 2;
  const brushRect = new paper.Rectangle(center.x - r, center.y - r, r * 2, r * 2);
  return out.filter((p) => p.bounds.intersects(brushRect));
}

// Per-gesture state: stable per-segment randoms (so Scallop/Crystallize
// texture doesn't re-roll and jitter on every drag event) and the set of
// segments the brush moved (for the end-of-gesture smoothing pass).
export function newGesture() {
  return { rnd: new WeakMap(), moved: new WeakSet() };
}

function gestureRand(gesture, seg) {
  let r = gesture.rnd.get(seg);
  if (r === undefined) {
    r = Math.random();
    gesture.rnd.set(seg, r);
  }
  return r;
}

// Add anchors under the brush so curves have enough points to bend. Target
// spacing shrinks as Detail grows; insertion is capped per event so point
// count stays bounded (once spacing is reached nothing more is added).
function subdivideUnderBrush(path, center, opts, detail) {
  const spacing = Math.max(5, brushRadius(opts) / (1 + detail));
  let inserted = 0;
  for (let i = 0; i < path.curves.length && inserted < 40; i += 1) {
    const curve = path.curves[i];
    if (curve.length <= spacing) continue;
    const mid = curve.getPointAt(curve.length / 2);
    if (weightAt(mid, center, opts) <= 0.01
      && weightAt(curve.point1, center, opts) <= 0.01
      && weightAt(curve.point2, center, opts) <= 0.01) continue;
    if (curve.divideAt(curve.getLocationAt(curve.length / 2))) {
      inserted += 1;
      i -= 1; // re-visit the first half — it may still be too long
    }
  }
}

// One deformation step for one segment. `delta` is the mouse move for this
// event (project units); `w` the brush weight at the anchor; `s` intensity.
function displaceSegment(mode, seg, center, delta, w, s, opts, gesture) {
  const p = seg.point;

  switch (mode) {
    case 'warp':
      seg.point = p.add(delta.multiply(w * s));
      gesture.moved.add(seg);
      return;

    case 'twirl': {
      const theta = opts.twirlRate * 0.08 * w * s;
      seg.point = p.rotate(theta, center);
      seg.handleIn = seg.handleIn.rotate(theta);
      seg.handleOut = seg.handleOut.rotate(theta);
      gesture.moved.add(seg);
      return;
    }

    case 'pucker':
    case 'bloat': {
      const k = 0.05 * w * s * (mode === 'pucker' ? 1 : -1);
      seg.point = p.add(center.subtract(p).multiply(k));
      // Shrink (pucker) / grow (bloat) the handles so curvature follows.
      seg.handleIn = seg.handleIn.multiply(1 - k);
      seg.handleOut = seg.handleOut.multiply(1 - k);
      gesture.moved.add(seg);
      return;
    }

    case 'scallop':
    case 'crystallize': {
      // Complexity decides how many anchors the brush textures; each affected
      // anchor gets a stable random amplitude for the whole gesture.
      const r1 = gestureRand(gesture, seg);
      const fraction = Math.min(1, 0.25 + opts.complexity * 0.05);
      if (r1 > fraction) return;
      const amp = 0.3 + (r1 / fraction) * 0.7;
      const dir = mode === 'scallop' ? center.subtract(p) : p.subtract(center);
      if (dir.length < 1e-6) return;
      const step = dir.normalize(brushRadius(opts) * 0.025 * w * s * amp);
      if (opts.affectAnchors) seg.point = p.add(step);
      // Retracting handles sharpens the edge into scallops / crystal spikes.
      if (opts.affectInTangents) seg.handleIn = seg.handleIn.multiply(1 - 0.15 * w * s);
      if (opts.affectOutTangents) seg.handleOut = seg.handleOut.multiply(1 - 0.15 * w * s);
      return;
    }

    case 'wrinkle': {
      // Fresh randoms every event — the edge keeps wrinkling while you hold.
      const k = brushRadius(opts) * 0.02 * w * s;
      const jitter = () => new paper.Point(
        (Math.random() * 2 - 1) * (opts.wrinkleH / 100) * k,
        (Math.random() * 2 - 1) * (opts.wrinkleV / 100) * k,
      );
      if (opts.affectAnchors) seg.point = p.add(jitter());
      if (opts.affectInTangents) seg.handleIn = seg.handleIn.add(jitter());
      if (opts.affectOutTangents) seg.handleOut = seg.handleOut.add(jitter());
      return;
    }

    default:
  }
}

// Apply one brush event to the given paths. Returns the paths it touched.
export function liquifyStep(mode, paths, center, delta, opts, gesture) {
  const s = opts.intensity / 100;
  if (s <= 0) return [];
  const touched = [];
  const detail = TEXTURE_MODES.includes(mode) ? opts.detail : 2;
  paths.forEach((path) => {
    subdivideUnderBrush(path, center, opts, detail);
    let hit = false;
    path.segments.forEach((seg) => {
      const w = weightAt(seg.point, center, opts);
      if (w <= 0.001) return;
      displaceSegment(mode, seg, center, delta, w, s, opts, gesture);
      hit = true;
    });
    if (hit) touched.push(path);
  });
  return touched;
}

// Drop handle-less anchors that sit on the straight line between their
// neighbours — undoes over-subdivision on stretches the brush barely moved.
// Never touches segments with handles, so real corners and curves survive
// (paper's whole-path simplify() would re-fit and round distant corners).
function pruneCollinear(path, tol) {
  for (let i = path.segments.length - 1; i >= 0; i -= 1) {
    const seg = path.segments[i];
    const prev = seg.previous;
    const next = seg.next;
    if (!prev || !next || prev === next) continue;
    if (!seg.handleIn.isZero() || !seg.handleOut.isZero()) continue;
    if (!prev.handleOut.isZero() || !next.handleIn.isZero()) continue;
    const a = prev.point;
    const ab = next.point.subtract(a);
    if (ab.length < 1e-6) continue;
    const t = seg.point.subtract(a).dot(ab) / ab.dot(ab);
    if (t <= 0 || t >= 1) continue;
    if (seg.point.subtract(a.add(ab.multiply(t))).length <= tol) seg.remove();
  }
}

// Fit smooth handles through the runs of segments the gesture moved, leaving
// the rest of the path untouched (a bare warp is a jagged polyline otherwise).
function smoothMovedRuns(path, moved) {
  const idx = [];
  path.segments.forEach((seg) => {
    if (moved.has(seg)) idx.push(seg.index);
  });
  if (!idx.length) return;
  let from = idx[0];
  let to = idx[0];
  const runs = [];
  for (let i = 1; i < idx.length; i += 1) {
    if (idx[i] === to + 1) to = idx[i];
    else {
      runs.push([from, to]);
      from = idx[i];
      to = idx[i];
    }
  }
  runs.push([from, to]);
  runs.forEach(([f, t]) => {
    try {
      path.smooth({ type: 'catmull-rom', factor: 0.5, from: f, to: t });
    } catch {
      /* index edge case — leave the run angular */
    }
  });
}

// End-of-gesture cleanup (Warp/Twirl/Pucker/Bloat): prune redundant anchors
// (Simplify option), smooth the deformed stretch, and rebuild variable-width
// envelopes on deformed spines. Texture modes keep their jagged anchors.
export function finishLiquify(mode, paths, opts, gesture) {
  paths.forEach((path) => {
    if (!path.parent) return; // removed mid-gesture
    if (SIMPLIFY_MODES.includes(mode)) {
      if (opts.simplify > 0) pruneCollinear(path, opts.simplify / 50);
      if (gesture) smoothMovedRuns(path, gesture.moved);
    }
    if (hasWidthProfile(path)) refreshWidthEnvelope(path);
  });
}
