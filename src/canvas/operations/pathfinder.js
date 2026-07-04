import paper from 'paper';
import { isDegenerate } from './booleans.js';
import { clearArrowheads } from './arrowheads.js';

// Pathfinder operations beyond the four plain booleans: Divide, Trim, Merge,
// Crop, Outline. All of them work on the atomic-region decomposition of the
// selected shapes (every visually distinct overlap piece becomes its own
// path), which is also what the Shape Builder tool builds its preview from.

const isPathLike = (it) => it.className === 'Path' || it.className === 'CompoundPath';

const fillKey = (c) => (c ? c.toCSS(true) : 'none');

// Paint a result piece like its source shape, fill-only (Illustrator's
// pathfinder drops strokes), and scrub any cloned metadata (live-shape flags,
// arrow config) that no longer applies to the derived geometry.
function paintLikeFill(geom, src) {
  geom.fillColor = src.fillColor || src.strokeColor || new paper.Color('#000000');
  geom.strokeColor = null;
  geom.opacity = src.opacity;
  geom.data = {};
}

// Group result pieces where the front-most original sat, then drop originals.
function finishOp(pieces, originals) {
  if (!pieces.length) return null;
  const top = originals.reduce((a, b) => (b.index > a.index ? b : a));
  const parent = top.parent;
  originals.forEach((p) => {
    clearArrowheads(p);
    p.remove();
  });
  const g = new paper.Group(pieces);
  if (parent && g.parent !== parent) parent.addChild(g);
  return g;
}

/**
 * Decompose paths (bottom→top order) into disjoint atomic regions.
 * Returns [{ geom, src }] where `geom` is a freshly inserted PathItem and
 * `src` is the original whose appearance the region should take (the
 * top-most shape covering it). Originals are left untouched.
 */
export function atomicRegions(paths) {
  let pieces = [];
  paths.forEach((p) => {
    const next = [];
    let remaining = p.clone({ insert: true });
    remaining.data = {};
    pieces.forEach((q) => {
      const inter = q.geom.intersect(remaining);
      const diff = q.geom.subtract(remaining);
      const rest = remaining.subtract(q.geom);
      q.geom.remove();
      remaining.remove();
      remaining = rest;
      if (isDegenerate(inter)) inter?.remove();
      else next.push({ geom: inter, src: p }); // p is on top here
      if (isDegenerate(diff)) diff?.remove();
      else next.push({ geom: diff, src: q.src });
    });
    if (isDegenerate(remaining)) remaining?.remove();
    else next.push({ geom: remaining, src: p });
    pieces = next;
  });
  return pieces;
}

// Divide — every overlap piece becomes its own filled path.
function divide(paths) {
  const regions = atomicRegions(paths);
  regions.forEach((r) => paintLikeFill(r.geom, r.src));
  return finishOp(regions.map((r) => r.geom), paths);
}

// Trim — each shape minus everything above it (hidden parts removed).
// Returns [{ geom, src }] bottom→top; shared by Trim and Merge.
function trimPieces(paths) {
  const pieces = [];
  let cover = null;
  for (let i = paths.length - 1; i >= 0; i -= 1) {
    const p = paths[i];
    const vis = cover ? p.subtract(cover) : p.clone({ insert: true });
    if (isDegenerate(vis)) vis?.remove();
    else pieces.unshift({ geom: vis, src: p });
    if (cover) {
      const merged = cover.unite(p);
      cover.remove();
      cover = merged;
    } else {
      cover = p.clone({ insert: true });
    }
  }
  cover?.remove();
  return pieces;
}

function trim(paths) {
  const pieces = trimPieces(paths);
  pieces.forEach((r) => paintLikeFill(r.geom, r.src));
  return finishOp(pieces.map((r) => r.geom), paths);
}

// Merge — Trim, then unite the trimmed pieces that share a fill colour.
function merge(paths) {
  const pieces = trimPieces(paths);
  pieces.forEach((r) => paintLikeFill(r.geom, r.src));
  const byFill = new Map();
  pieces.forEach((r) => {
    const k = fillKey(r.geom.fillColor);
    if (!byFill.has(k)) byFill.set(k, []);
    byFill.get(k).push(r.geom);
  });
  const out = [];
  byFill.forEach((geoms) => {
    let acc = geoms[0];
    for (let i = 1; i < geoms.length; i += 1) {
      const next = acc.unite(geoms[i]);
      next.data = {};
      acc.remove();
      geoms[i].remove();
      acc = next;
    }
    out.push(acc);
  });
  return finishOp(out, paths);
}

// Crop — the top shape clips everything below it, then disappears.
function crop(paths) {
  if (paths.length < 2) return null;
  const top = paths[paths.length - 1];
  const below = paths.slice(0, -1);
  const pieces = [];
  below.forEach((p) => {
    const piece = p.intersect(top);
    if (isDegenerate(piece)) {
      piece?.remove();
      return;
    }
    paintLikeFill(piece, p);
    pieces.push(piece);
  });
  if (!pieces.length) return null;
  return finishOp(pieces, paths);
}

// Split one Path at a set of project-space points. Splitting a closed path
// first re-opens it in place; each further split yields a new piece.
function splitAtPoints(path, points) {
  const pieces = [path];
  points.forEach((pt) => {
    for (let i = 0; i < pieces.length; i += 1) {
      const piece = pieces[i];
      const loc = piece.getNearestLocation(pt);
      if (!loc || loc.point.getDistance(pt) > 0.1) continue;
      const wasClosed = piece.closed;
      const rest = piece.splitAt(loc);
      if (!wasClosed && rest && rest !== piece) pieces.push(rest);
      break;
    }
  });
  return pieces;
}

// Outline — unfilled open strokes divided at every intersection, coloured by
// the fill of the shape they came from.
function outline(paths) {
  const pieces = [];
  paths.forEach((p) => {
    const others = paths.filter((o) => o !== p);
    const points = [];
    others.forEach((o) => {
      try {
        p.getIntersections(o).forEach((x) => points.push(x.point));
      } catch {
        /* skip un-intersectable geometry */
      }
    });
    const strokeCol = p.fillColor || p.strokeColor || new paper.Color('#000000');
    const children = p.className === 'CompoundPath' ? p.children.slice() : [p];
    children.forEach((child) => {
      const work = child.clone({ insert: true });
      work.data = {};
      splitAtPoints(work, points).forEach((piece) => {
        piece.fillColor = null;
        piece.strokeColor = strokeCol;
        piece.strokeWidth = 1;
        piece.data = {};
        pieces.push(piece);
      });
    });
  });
  return finishOp(pieces, paths);
}

const OPS = { divide, trim, merge, crop, outline };

/**
 * Run a pathfinder operation on the selection. Returns the resulting Group
 * (originals consumed) or null when the op doesn't apply — in which case the
 * originals are left exactly as they were.
 */
export function pathfinderOp(items, op) {
  const fn = OPS[op];
  if (!fn) return null;
  const paths = (items || []).filter(isPathLike);
  if (paths.length < 2) return null;
  paths.sort((a, b) => a.index - b.index); // bottom → top
  return fn(paths);
}
