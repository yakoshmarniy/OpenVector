import paper from 'paper';
import { refreshArrowheads } from './arrowheads.js';

// Core transform operations shared by the Transform panel, the transform
// tools (Rotate/Reflect/Scale/Shear) and the Object > Transform menu.
// Every op takes explicit items + pivot so callers stay in charge of
// selection handling; Transform Again replays the last recorded op.

export const REF_POINTS = ['nw', 'n', 'ne', 'w', 'c', 'e', 'sw', 's', 'se'];

export function refPoint(bounds, ref) {
  switch (ref) {
    case 'nw': return bounds.topLeft;
    case 'n': return bounds.topCenter;
    case 'ne': return bounds.topRight;
    case 'w': return bounds.leftCenter;
    case 'e': return bounds.rightCenter;
    case 'sw': return bounds.bottomLeft;
    case 's': return bounds.bottomCenter;
    case 'se': return bounds.bottomRight;
    default: return bounds.center;
  }
}

export function unionBounds(items) {
  if (!items.length) return null;
  let b = items[0].bounds.clone();
  for (let i = 1; i < items.length; i += 1) b = b.unite(items[i].bounds);
  return b;
}

// ---------------------------------------------------------------------------
// Scale Strokes & Effects preference (Transform panel checkbox). When on,
// scaling also multiplies stroke widths by the mean scale factor.

let scaleStrokesPref = true;

export function getScaleStrokes() {
  return scaleStrokesPref;
}

export function setScaleStrokes(v) {
  scaleStrokesPref = !!v;
}

export function scaleStrokeWidths(items, factor) {
  if (!Number.isFinite(factor) || factor <= 0 || factor === 1) return;
  const walk = (it) => {
    if (it.strokeWidth) it.strokeWidth *= factor;
    if (it.children) it.children.forEach(walk);
  };
  items.forEach(walk);
}

// ---------------------------------------------------------------------------
// Primitive ops

export function moveItems(items, dx, dy) {
  const d = new paper.Point(dx, dy);
  items.forEach((t) => {
    t.position = t.position.add(d);
  });
}

export function rotateItems(items, angle, pivot) {
  items.forEach((t) => t.rotate(angle, pivot));
}

export function scaleItems(items, sx, sy, pivot, withStrokes = scaleStrokesPref) {
  items.forEach((t) => t.scale(sx, sy, pivot));
  if (withStrokes) scaleStrokeWidths(items, (Math.abs(sx) + Math.abs(sy)) / 2);
}

export function shearItems(items, shx, shy, pivot) {
  items.forEach((t) => t.shear(shx, shy, pivot));
}

// Reflect across the line through `pivot` at `axisAngle` degrees
// (0 = horizontal line → vertical flip, 90 = vertical line → horizontal flip).
export function reflectItems(items, axisAngle, pivot) {
  items.forEach((t) => {
    t.rotate(-axisAngle, pivot);
    t.scale(1, -1, pivot);
    t.rotate(axisAngle, pivot);
  });
}

export function flipItems(items, axis) {
  const b = unionBounds(items);
  if (!b) return;
  // 'h' mirrors left↔right (vertical axis), 'v' mirrors top↔bottom.
  reflectItems(items, axis === 'h' ? 90 : 0, b.center);
}

// Transform Each: every item transformed around its own reference point.
export function transformEach(items, { sx = 1, sy = 1, dx = 0, dy = 0, angle = 0, ref = 'c' } = {}) {
  items.forEach((t) => {
    const p = refPoint(t.bounds, ref);
    if (sx !== 1 || sy !== 1) {
      t.scale(sx, sy, p);
      if (scaleStrokesPref) scaleStrokeWidths([t], (Math.abs(sx) + Math.abs(sy)) / 2);
    }
    if (angle) t.rotate(angle, p);
    if (dx || dy) t.position = t.position.add(new paper.Point(dx, dy));
  });
}

// ---------------------------------------------------------------------------
// Transform Again (⌘D). Tools and menu ops record their last transform; the
// replay clones first when the original gesture made a copy (Alt-drag), which
// is what makes the classic "rotate a copy, then ⌘D around the circle" work.

let lastTransform = null;

export function recordTransform(t) {
  lastTransform = t;
}

export function hasLastTransform() {
  return !!lastTransform;
}

export function transformAgain(items) {
  const t = lastTransform;
  if (!t || !items.length) return null;
  let targets = items;
  if (t.copy) {
    targets = items.map((it) => {
      const c = it.clone();
      refreshArrowheads(c);
      return c;
    });
  }
  const pivot = t.pivot
    ? new paper.Point(t.pivot.x, t.pivot.y)
    : unionBounds(targets).center;
  switch (t.kind) {
    case 'move':
      moveItems(targets, t.dx, t.dy);
      break;
    case 'rotate':
      rotateItems(targets, t.angle, pivot);
      break;
    case 'scale':
      scaleItems(targets, t.sx, t.sy, pivot, t.withStrokes ?? scaleStrokesPref);
      break;
    case 'shear':
      shearItems(targets, t.shx, t.shy, pivot);
      break;
    case 'reflect':
      reflectItems(targets, t.angle, pivot);
      break;
    case 'each':
      transformEach(targets, t.opts);
      break;
    default:
      return null;
  }
  return targets;
}

// ---------------------------------------------------------------------------
// Free distort: remap path geometry from an axis-aligned source rectangle to
// an arbitrary quad {tl,tr,br,bl} (bilinear — exact for affine target quads).
// Only Path/CompoundPath geometry is distorted; other items (text) are left
// alone. Geometry is restored from `snapshot` first so a live drag always
// maps the ORIGINAL shape, not an accumulation of previous frames.

export function collectPaths(items) {
  const out = [];
  const walk = (it) => {
    if (it.className === 'Path') out.push(it);
    else if (it.children) it.children.forEach(walk);
  };
  items.forEach(walk);
  return out;
}

export function snapshotPaths(paths) {
  return paths.map((p) => ({
    path: p,
    segs: p.segments.map((s) => ({
      point: s.point.clone(),
      handleIn: s.handleIn.clone(),
      handleOut: s.handleOut.clone(),
    })),
  }));
}

export function distortPaths(snapshot, srcRect, quad) {
  const { left, top, width, height } = srcRect;
  const map = (pt) => {
    const u = width > 1e-6 ? (pt.x - left) / width : 0.5;
    const v = height > 1e-6 ? (pt.y - top) / height : 0.5;
    const topEdge = quad.tl.multiply(1 - u).add(quad.tr.multiply(u));
    const botEdge = quad.bl.multiply(1 - u).add(quad.br.multiply(u));
    return topEdge.multiply(1 - v).add(botEdge.multiply(v));
  };
  snapshot.forEach(({ path, segs }) => {
    segs.forEach((orig, i) => {
      const seg = path.segments[i];
      const np = map(orig.point);
      seg.point = np;
      // Handles are relative — map their absolute anchors, re-relativize.
      seg.handleIn = orig.handleIn.isZero()
        ? orig.handleIn
        : map(orig.point.add(orig.handleIn)).subtract(np);
      seg.handleOut = orig.handleOut.isZero()
        ? orig.handleOut
        : map(orig.point.add(orig.handleOut)).subtract(np);
    });
  });
}
