import paper from 'paper';
import { createSelection, isOverlayItem } from '../operations/selection.js';

// Lasso — drag a freehand loop; on release, select every object the loop
// contains or crosses. Shift adds to the current selection.
export function createLassoTool(ctx = {}) {
  const selection = createSelection(ctx.onSelectionChange, ctx.onSelectionBounds);
  let path = null;
  let additive = false;

  const clearPath = () => {
    if (path) {
      path.remove();
      path = null;
    }
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point, e) {
      additive = !!(e && e.shiftKey);
      clearPath();
      const z = paper.view.zoom;
      path = new paper.Path([point]);
      path.strokeColor = new paper.Color('#6f8595');
      path.strokeWidth = 1 / z;
      path.dashArray = [3 / z, 2 / z];
      path.fillColor = new paper.Color(0.43, 0.52, 0.59, 0.1);
      path.data.isSelectionOverlay = true;
      path.locked = true;
    },

    onMouseDrag(point) {
      if (path) path.add(point);
    },

    onMouseUp() {
      if (!path) return;
      path.closed = true;
      const lasso = path;
      const hits = paper.project.activeLayer.children.filter((it) => {
        if (isOverlayItem(it) || it.locked) return false;
        if (lasso.contains(it.bounds.center)) return true;
        try {
          return lasso.intersects(it);
        } catch {
          return false;
        }
      });
      clearPath();
      if (additive) hits.forEach((h) => !selection.has(h) && selection.toggle(h));
      else selection.setTargets(hits);
    },

    onKeyDown(e) {
      if (!selection.targets.length) return;
      if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        selection.targets.forEach((t) => t.remove());
        selection.clear();
      } else if (e.code === 'Escape') {
        selection.clear();
      }
    },

    onViewChange() {
      selection.draw();
    },

    refreshSelection() {
      selection.draw();
    },

    deactivate() {
      clearPath();
      selection.clear();
    },
  };
}
