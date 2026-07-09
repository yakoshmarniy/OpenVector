import paper from 'paper';
import { PaperOffset } from 'paperjs-offset';
import { clearArrowheads } from './arrowheads.js';
import { clearAllCompanions } from './companions.js';
import { artworkLayers, isOverlayItem } from './selection.js';

// Object > Path operations: Join, Average, Outline Stroke, Offset Path,
// Simplify, Split Into Grid, Clean Up.

const isPathLike = (it) => it.className === 'Path' || it.className === 'CompoundPath';

function copyStyle(src, dst) {
  dst.fillColor = src.fillColor;
  dst.strokeColor = src.strokeColor;
  dst.strokeWidth = src.strokeWidth;
  dst.strokeCap = src.strokeCap;
  dst.strokeJoin = src.strokeJoin;
  dst.dashArray = src.dashArray;
  dst.opacity = src.opacity;
}

/**
 * Join (⌘J): one open path → close it; two open paths → connect their nearest
 * end points into a single path. Returns the joined path or null.
 */
export function joinPaths(items) {
  const open = (items || []).filter((it) => it.className === 'Path' && !it.closed);
  if (open.length === 1) {
    open[0].closed = true;
    return open[0];
  }
  if (open.length !== 2) return null;
  const [a, b] = open;
  // Try both orientations of both paths: connect a's tail to b's head.
  let best = null;
  [[false, false], [false, true], [true, false], [true, true]].forEach(([ra, rb]) => {
    const tail = ra ? a.firstSegment.point : a.lastSegment.point;
    const head = rb ? b.lastSegment.point : b.firstSegment.point;
    const dist = tail.getDistance(head);
    if (!best || dist < best.dist) best = { ra, rb, dist };
  });
  if (best.ra) a.reverse();
  if (best.rb) b.reverse();
  clearArrowheads(a);
  clearAllCompanions(b);
  a.addSegments(b.segments);
  b.remove();
  return a;
}

/**
 * Average anchor points of the selected paths: 'h' aligns them on the same
 * horizontal axis (one y), 'v' on the same vertical axis (one x), 'both'
 * collapses them onto a single point.
 */
export function averagePoints(items, axis = 'both') {
  const segs = [];
  (items || []).forEach((it) => {
    if (it.className === 'Path') segs.push(...it.segments);
    else if (it.className === 'CompoundPath') {
      it.children.forEach((c) => segs.push(...c.segments));
    }
  });
  if (segs.length < 2) return false;
  let sx = 0;
  let sy = 0;
  segs.forEach((s) => {
    sx += s.point.x;
    sy += s.point.y;
  });
  const ax = sx / segs.length;
  const ay = sy / segs.length;
  segs.forEach((s) => {
    if (axis !== 'h') s.point.x = ax;
    if (axis !== 'v') s.point.y = ay;
  });
  return true;
}

/**
 * Outline Stroke: expand each stroked path into a filled shape of the stroke.
 * A path that also has a fill becomes a group of [fill shape, stroke shape].
 * Returns the resulting items.
 */
export function outlineStrokes(items) {
  const out = [];
  (items || []).forEach((p) => {
    if (!isPathLike(p) || !p.strokeColor || !(p.strokeWidth > 0)) return;
    let shape;
    try {
      shape = PaperOffset.offsetStroke(p, p.strokeWidth / 2, {
        cap: p.strokeCap === 'square' ? 'butt' : (p.strokeCap || 'butt'),
        join: p.strokeJoin || 'miter',
        insert: true,
      });
    } catch {
      return; // leave the path untouched if expansion fails
    }
    if (!shape) return;
    shape.fillColor = p.strokeColor;
    shape.strokeColor = null;
    shape.opacity = p.opacity;
    shape.data = {};
    const parent = p.parent;
    let result = shape;
    if (p.fillColor) {
      const fill = p.clone({ insert: true });
      fill.strokeColor = null;
      fill.data = {};
      result = new paper.Group([fill, shape]);
    }
    if (parent && result.parent !== parent) parent.addChild(result);
    clearAllCompanions(p);
    p.remove();
    out.push(result);
  });
  return out;
}

/**
 * Offset Path: insert an offset copy `delta` px outside (negative = inside)
 * each selected path; originals stay (Illustrator behaviour). Returns copies.
 */
export function offsetPaths(items, delta) {
  const out = [];
  if (!Number.isFinite(delta) || delta === 0) return out;
  (items || []).forEach((p) => {
    if (!isPathLike(p)) return;
    let off;
    try {
      off = PaperOffset.offset(p, delta, { join: 'miter', insert: true });
    } catch {
      return;
    }
    if (!off) return;
    copyStyle(p, off);
    off.data = {};
    if (p.parent && off.parent !== p.parent) p.parent.addChild(off);
    out.push(off);
  });
  return out;
}

/** Simplify: refit the selected paths' curves, removing noise anchors. */
export function simplifyPaths(items, tolerance = 2.5) {
  let touched = false;
  (items || []).forEach((it) => {
    if (it.className === 'Path' && it.segments.length > 2) {
      touched = it.simplify(tolerance) || touched;
    } else if (it.className === 'CompoundPath') {
      it.children.forEach((c) => {
        if (c.segments.length > 2) touched = c.simplify(tolerance) || touched;
      });
    }
  });
  return touched;
}

/**
 * Split Into Grid: replace each selected object with rows×cols rectangles
 * covering its bounds, separated by `gutter` px. Returns the rectangles.
 */
export function splitIntoGrid(items, rows, cols, gutter = 0) {
  const out = [];
  if (!(rows >= 1) || !(cols >= 1) || !(gutter >= 0)) return out;
  (items || []).forEach((p) => {
    if (!isPathLike(p)) return;
    const b = p.bounds;
    const cw = (b.width - gutter * (cols - 1)) / cols;
    const ch = (b.height - gutter * (rows - 1)) / rows;
    if (cw <= 0 || ch <= 0) return;
    const parent = p.parent;
    const cells = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const rect = new paper.Path.Rectangle({
          point: [b.left + c * (cw + gutter), b.top + r * (ch + gutter)],
          size: [cw, ch],
        });
        copyStyle(p, rect);
        if (parent) parent.addChild(rect);
        cells.push(rect);
      }
    }
    clearAllCompanions(p);
    p.remove();
    out.push(...cells);
  });
  return out;
}

/**
 * Clean Up: delete stray points (paths with under two anchors), unpainted
 * paths (no fill, no stroke) and groups left empty by that. System items
 * (overlays, locked, text internals) are untouched. Returns removal count.
 */
export function cleanUpDocument() {
  let removed = 0;
  const sweep = (container) => {
    container.children.slice().forEach((it) => {
      if (it.locked || !it.visible || isOverlayItem(it)) return;
      if (it.data && it.data.isText) return; // glyph groups manage themselves
      if (it.className === 'Group') {
        sweep(it);
        if (!it.children.length) {
          it.remove();
          removed += 1;
        }
        return;
      }
      if (it.className === 'Path') {
        const stray = it.segments.length < 2;
        const unpainted = !it.fillColor && !it.strokeColor;
        if (stray || unpainted) {
          clearAllCompanions(it);
          it.remove();
          removed += 1;
        }
        return;
      }
      if (it.className === 'CompoundPath') {
        if (!it.children.length || (!it.fillColor && !it.strokeColor)) {
          clearAllCompanions(it);
          it.remove();
          removed += 1;
        }
      }
    });
  };
  artworkLayers().forEach(sweep);
  return removed;
}
