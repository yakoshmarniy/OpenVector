import paper from 'paper';
import { hexToRgb, rgbToHex } from './colorConvert.js';

// Gradient Mesh. Paper.js has no mesh primitive, so — like the conic gradient
// fan — a mesh is a companion group of flat-shaded micro-quads clipped to the
// path, tagged `data.isMeshFill` + `data.ownerId`, rebuilt (never moved) by
// `refreshMesh` from the selection overlay and applyStyle so it tracks the
// shape. The model lives on `item.data.mesh`:
//   { rows, cols, points: [ [ { u, v, color } … cols ] … rows ] }
// Point positions are stored parametrically (u,v in 0..1) relative to the path
// bounds, so the mesh follows translation and scale (v1: not rotation, like the
// conic fan). Colour is a plain '#rrggbb'. Each cell (a quad of four corner
// points) is bilinearly interpolated in both position and colour.

const MESH_FLAG = 'isMeshFill';
const SUBDIVISIONS = 6; // micro-quads per cell edge — reads smooth, stays cheap

export function isMeshFillItem(item) {
  return !!(item && item.data && item.data[MESH_FLAG]);
}

export function getMesh(item) {
  return (item && item.data && item.data.mesh) || null;
}

export function hasMesh(item) {
  return !!getMesh(item);
}

// --- model construction ---

const clamp01 = (t) => Math.max(0, Math.min(1, t));
const mix = (a, b, t) => a + (b - a) * t;

function mixHex(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex({ r: mix(ca.r, cb.r, t), g: mix(ca.g, cb.g, t), b: mix(ca.b, cb.b, t) });
}

// Colour of a grid node for a given appearance.
function nodeColor(u, v, base, appearance, highlight) {
  if (appearance === 'flat' || !highlight) return base;
  // Normalised distance from centre (0 at centre, 1 at the corners).
  const d = Math.min(1, Math.hypot(u - 0.5, v - 0.5) / 0.7071);
  const centreWeight = 1 - d; // 1 at centre → 0 at edge
  const amount = (highlight / 100) * (appearance === 'toCenter' ? centreWeight : d);
  return mixHex(base, '#ffffff', amount);
}

// Build (or rebuild) the mesh model on the item. `base` defaults to the item's
// current fill; appearance ∈ flat | toCenter | toEdge; highlight 0..100.
export function createMesh(item, rows = 3, cols = 3, appearance = 'flat', highlight = 60, base = null) {
  const baseHex = base
    || (item.fillColor && item.fillColor.type !== 'gradient' ? item.fillColor.toCSS(true) : '#b9bcc0');
  const r = Math.max(2, Math.round(rows));
  const c = Math.max(2, Math.round(cols));
  const points = [];
  for (let i = 0; i < r; i += 1) {
    const row = [];
    const v = r === 1 ? 0 : i / (r - 1);
    for (let j = 0; j < c; j += 1) {
      const u = c === 1 ? 0 : j / (c - 1);
      row.push({ u, v, color: nodeColor(u, v, baseHex, appearance, highlight) });
    }
    points.push(row);
  }
  if (!item.data) item.data = {};
  item.data.mesh = { rows: r, cols: c, points };
  // Keep an opaque backdrop so the path still hit-tests under the companion.
  if (!item.fillColor || item.fillColor.type === 'gradient') item.fillColor = new paper.Color(baseHex);
  refreshMesh(item);
  return item.data.mesh;
}

export function clearMesh(item) {
  if (item && item.data) delete item.data.mesh;
  clearMeshFill(item);
}

// --- point access (for the Mesh tool / Properties) ---

export function pointPosition(item, r, c) {
  const mesh = getMesh(item);
  if (!mesh) return null;
  const b = item.bounds;
  const p = mesh.points[r][c];
  return b.topLeft.add(new paper.Point(p.u * b.width, p.v * b.height));
}

// Move node (r,c) to a project point, stored back as parametric u,v.
export function setPointPosition(item, r, c, point) {
  const mesh = getMesh(item);
  if (!mesh) return;
  const b = item.bounds;
  mesh.points[r][c].u = clamp01(b.width ? (point.x - b.left) / b.width : 0);
  mesh.points[r][c].v = clamp01(b.height ? (point.y - b.top) / b.height : 0);
}

export function getPointColor(item, r, c) {
  const mesh = getMesh(item);
  return mesh ? mesh.points[r][c].color : null;
}

export function setPointColor(item, r, c, color) {
  const mesh = getMesh(item);
  if (mesh) mesh.points[r][c].color = color;
}

// Nearest node to a project point within `tol` project units → {r,c} | null.
export function hitPoint(item, point, tol) {
  const mesh = getMesh(item);
  if (!mesh) return null;
  let best = null;
  let bestD = tol;
  for (let r = 0; r < mesh.rows; r += 1) {
    for (let c = 0; c < mesh.cols; c += 1) {
      const d = pointPosition(item, r, c).getDistance(point);
      if (d <= bestD) { bestD = d; best = { r, c }; }
    }
  }
  return best;
}

// --- companion render ---

function ownedMeshes(item) {
  const parent = item.parent;
  if (!parent) return [];
  return parent.children.filter(
    (ch) => ch.data && ch.data[MESH_FLAG] && ch.data.ownerId === item.id,
  );
}

export function clearMeshFill(item) {
  ownedMeshes(item).forEach((m) => m.remove());
}

const bilerp = (a, b, c, d, u, v) => a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;

function bilerpPoint(p00, p10, p01, p11, u, v) {
  return new paper.Point(
    bilerp(p00.x, p10.x, p01.x, p11.x, u, v),
    bilerp(p00.y, p10.y, p01.y, p11.y, u, v),
  );
}

function bilerpColor(c00, c10, c01, c11, u, v) {
  const a = hexToRgb(c00);
  const b = hexToRgb(c10);
  const c = hexToRgb(c01);
  const d = hexToRgb(c11);
  return new paper.Color(
    bilerp(a.r, b.r, c.r, d.r, u, v) / 255,
    bilerp(a.g, b.g, c.g, d.g, u, v) / 255,
    bilerp(a.b, b.b, c.b, d.b, u, v) / 255,
  );
}

// Rebuild the mesh companion for an item (no-op when it has no mesh). Sweeps
// its own stale companions first.
export function refreshMesh(item) {
  if (!item || isMeshFillItem(item)) return;
  clearMeshFill(item);
  const mesh = getMesh(item);
  if (!mesh || !(item instanceof paper.Path) || !item.visible) return;

  const b = item.bounds;
  const pos = (r, c) => b.topLeft.add(new paper.Point(mesh.points[r][c].u * b.width, mesh.points[r][c].v * b.height));

  const patches = new paper.Group();
  for (let r = 0; r < mesh.rows - 1; r += 1) {
    for (let c = 0; c < mesh.cols - 1; c += 1) {
      const p00 = pos(r, c); const p10 = pos(r, c + 1); const p01 = pos(r + 1, c); const p11 = pos(r + 1, c + 1);
      const k00 = mesh.points[r][c].color; const k10 = mesh.points[r][c + 1].color;
      const k01 = mesh.points[r + 1][c].color; const k11 = mesh.points[r + 1][c + 1].color;
      for (let i = 0; i < SUBDIVISIONS; i += 1) {
        for (let j = 0; j < SUBDIVISIONS; j += 1) {
          const u0 = i / SUBDIVISIONS; const u1 = (i + 1) / SUBDIVISIONS;
          const v0 = j / SUBDIVISIONS; const v1 = (j + 1) / SUBDIVISIONS;
          const quad = new paper.Path([
            bilerpPoint(p00, p10, p01, p11, u0, v0),
            bilerpPoint(p00, p10, p01, p11, u1, v0),
            bilerpPoint(p00, p10, p01, p11, u1, v1),
            bilerpPoint(p00, p10, p01, p11, u0, v1),
          ]);
          quad.closed = true;
          const col = bilerpColor(k00, k10, k01, k11, (u0 + u1) / 2, (v0 + v1) / 2);
          quad.fillColor = col;
          quad.strokeColor = col; // hairline of same colour kills seams
          quad.strokeWidth = 0.5;
          patches.addChild(quad);
        }
      }
    }
  }

  const mask = item.clone({ insert: false });
  mask.data = {};
  mask.clipMask = true;
  const clip = new paper.Group([mask, patches]);
  clip.clipped = true;
  clip.data[MESH_FLAG] = true;
  clip.data.ownerId = item.id;
  clip.locked = true;
  clip.insertAbove(item);
}
