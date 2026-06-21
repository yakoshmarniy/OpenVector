import paper from 'paper';
import { isOverlayItem } from './selection.js';

// Snapping while dragging: snap the moving selection's bounding box to a grid
// and/or to other objects' edges and centres. Returns an adjusted delta plus
// the guide line coordinates that matched (for drawing feedback).

export const GRID_SIZE = 10;
const THRESHOLD_PX = 6; // snap distance, in screen pixels

// Collect candidate snap coordinates (x and y) from every other top-level item.
function candidates(movingItems) {
  const xs = [];
  const ys = [];
  const moving = new Set(movingItems);
  paper.project.activeLayer.children.forEach((it) => {
    if (isOverlayItem(it) || moving.has(it)) return;
    const b = it.bounds;
    if (!b || (!b.width && !b.height)) return;
    xs.push(b.left, b.center.x, b.right);
    ys.push(b.top, b.center.y, b.bottom);
  });
  return { xs, ys };
}

function nearest(values, targets, threshold) {
  // best = smallest adjustment moving any target onto any value within threshold
  let best = null;
  targets.forEach((tv) => {
    values.forEach((v) => {
      const d = v - tv;
      if (Math.abs(d) <= threshold && (!best || Math.abs(d) < Math.abs(best.delta))) {
        best = { delta: d, line: v };
      }
    });
  });
  return best;
}

/**
 * @param origUnion bounding box of the selection at drag start
 * @param raw       proposed delta (current mouse - start mouse)
 * @param settings  { grid, objects }
 * @param movingItems items being moved (excluded from object candidates)
 * Returns { dx, dy, guideXs, guideYs }.
 */
export function snapMove(origUnion, raw, settings, movingItems) {
  let dx = raw.x;
  let dy = raw.y;
  const guideXs = [];
  const guideYs = [];

  if (settings.grid) {
    const movedLeft = origUnion.left + dx;
    const movedTop = origUnion.top + dy;
    dx += Math.round(movedLeft / GRID_SIZE) * GRID_SIZE - movedLeft;
    dy += Math.round(movedTop / GRID_SIZE) * GRID_SIZE - movedTop;
  }

  if (settings.objects) {
    const threshold = THRESHOLD_PX / paper.view.zoom;
    const { xs, ys } = candidates(movingItems);
    const xTargets = [origUnion.left + dx, origUnion.center.x + dx, origUnion.right + dx];
    const yTargets = [origUnion.top + dy, origUnion.center.y + dy, origUnion.bottom + dy];
    const sx = nearest(xs, xTargets, threshold);
    const sy = nearest(ys, yTargets, threshold);
    if (sx) {
      dx += sx.delta;
      guideXs.push(sx.line);
    }
    if (sy) {
      dy += sy.delta;
      guideYs.push(sy.line);
    }
  }

  return { dx, dy, guideXs, guideYs };
}
