import paper from 'paper';
import { createSelection } from '../operations/selection.js';

const isOverlay = (item) => {
  for (let c = item; c; c = c.parent) if (c.data && c.data.isSelectionOverlay) return true;
  return false;
};

// Group Selection — selects the item *inside* a group (the deep hit), not the
// whole top-level group. Drag to move that single item.
export function createGroupSelectTool(ctx = {}) {
  const selection = createSelection(ctx.onSelectionChange, ctx.onSelectionBounds);
  let mode = null;

  const deepPick = (point) => {
    const hit = paper.project.hitTest(point, {
      fill: true,
      stroke: true,
      tolerance: 6 / paper.view.zoom,
      match: (r) => !isOverlay(r.item),
    });
    if (!hit) return null;
    let it = hit.item;
    // A text glyph resolves to its text group; otherwise keep the deep item.
    if (it.data && it.data.glyph && it.parent) it = it.parent;
    return it;
  };

  return {
    cursor: 'default',

    onMouseDown(point) {
      const it = deepPick(point);
      if (it) {
        selection.setTarget(it);
        mode = 'move';
      } else {
        selection.clear();
        mode = null;
      }
    },

    onMouseDrag(point, delta) {
      if (mode === 'move' && selection.target) {
        selection.target.position = selection.target.position.add(delta);
        selection.draw();
      }
    },

    onMouseUp() {
      mode = null;
    },

    onKeyDown(e) {
      if (!selection.target) return;
      if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        selection.target.remove();
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
      selection.clear();
    },
  };
}
