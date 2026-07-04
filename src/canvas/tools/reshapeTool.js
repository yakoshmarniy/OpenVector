import paper from 'paper';
import { createSelection, pickItem } from '../operations/selection.js';
import { runSelectionAction } from '../operations/selectionActions.js';

// Reshape tool — grab anywhere on a path and pull: nearby anchors follow with
// a smooth falloff (measured along the curve, so only the local stretch of
// the path deforms). Works on the selected path, or picks one under the cursor.

const GRAB_TOL = 14; // px

export function createReshapeTool(ctx = {}) {
  const selection = createSelection();

  let path = null;
  let grabOffset = 0;
  let origin = null;
  let origSegs = null;
  let weights = null;

  const reshapablePaths = () => {
    const out = [];
    const walk = (it) => {
      if (it.className === 'Path' && it.segments.length > 1) out.push(it);
      else if (it.children && !(it.data && it.data.isText)) it.children.forEach(walk);
    };
    selection.targets.forEach(walk);
    return out;
  };

  const nearestOn = (candidates, point, tol) => {
    let best = null;
    candidates.forEach((p) => {
      const loc = p.getNearestLocation(point);
      if (!loc) return;
      const d = loc.point.getDistance(point);
      if (d <= tol && (!best || d < best.d)) best = { path: p, loc, d };
    });
    return best;
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      const tol = GRAB_TOL / paper.view.zoom;
      let hit = nearestOn(reshapablePaths(), point, tol);
      if (!hit) {
        // Nothing selected (or missed it) — try the path under the cursor.
        const item = pickItem(point);
        if (item && item.className === 'Path' && item.segments.length > 1) {
          const loc = item.getNearestLocation(point);
          if (loc && loc.point.getDistance(point) <= tol) {
            selection.setTarget(item);
            hit = { path: item, loc };
          }
        }
      }
      if (!hit) return;

      path = hit.path;
      grabOffset = hit.loc.offset;
      origin = point;
      origSegs = path.segments.map((s) => s.point.clone());

      // Gaussian falloff over curve distance from the grab point.
      const L = path.length;
      const sigma = Math.max(20 / paper.view.zoom, L * 0.15);
      weights = path.segments.map((s) => {
        let d = Math.abs(s.location.offset - grabOffset);
        if (path.closed) d = Math.min(d, L - d);
        return Math.exp(-(d * d) / (2 * sigma * sigma));
      });
    },

    onMouseDrag(point) {
      if (!path) return;
      const delta = point.subtract(origin);
      path.segments.forEach((seg, i) => {
        if (weights[i] > 1e-3) seg.point = origSegs[i].add(delta.multiply(weights[i]));
      });
      selection.draw();
    },

    onMouseUp() {
      if (path) selection.draw();
      path = null;
      origSegs = null;
      weights = null;
    },

    onKeyDown(e) {
      if ((e.code === 'Delete' || e.code === 'Backspace') && selection.targets.length) {
        e.preventDefault();
        runSelectionAction(selection, 'delete');
      } else if (e.code === 'Escape') {
        selection.clear();
      }
    },

    runAction(name) {
      runSelectionAction(selection, name);
    },

    onViewChange() {
      selection.draw();
    },

    refreshSelection() {
      selection.draw();
    },

    deactivate() {
      selection.dispose();
    },
  };
}
