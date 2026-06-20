import paper from 'paper';
import {
  createSelection,
  pickItem,
  computeResizeBounds,
} from '../operations/selection.js';

const HANDLE_CURSOR = {
  nw: 'nwse-resize', se: 'nwse-resize',
  ne: 'nesw-resize', sw: 'nesw-resize',
  n: 'ns-resize', s: 'ns-resize',
  e: 'ew-resize', w: 'ew-resize',
};

/**
 * Select tool — click to select, drag the body to move, drag a handle to
 * resize. Shift keeps aspect ratio while resizing a corner. Delete/Backspace
 * removes the selection, Escape deselects.
 */
export function createSelectTool(ctx = {}) {
  const selection = createSelection(ctx.onSelectionChange);
  let mode = null; // 'move' | 'resize' | null
  let activeHandle = null;
  let originalBounds = null;

  return {
    cursor: 'default',

    onMouseDown(point) {
      const handle = selection.hitHandle(point);
      if (handle && selection.target) {
        mode = 'resize';
        activeHandle = handle;
        originalBounds = selection.target.bounds.clone();
        return;
      }

      const item = pickItem(point);
      if (item) {
        if (item !== selection.target) selection.setTarget(item);
        mode = 'move';
      } else {
        selection.clear();
        mode = null;
      }
    },

    onMouseDrag(point, delta, e) {
      if (mode === 'move' && selection.target) {
        selection.target.position = selection.target.position.add(delta);
        selection.draw();
      } else if (mode === 'resize' && selection.target && originalBounds) {
        // Degenerate bounds (e.g. an axis-aligned line) can't be scaled.
        if (originalBounds.width < 1e-3 || originalBounds.height < 1e-3) return;
        selection.target.bounds = computeResizeBounds(
          activeHandle,
          originalBounds,
          point,
          !!(e && e.shiftKey),
        );
        selection.draw();
      }
    },

    onMouseUp() {
      mode = null;
      activeHandle = null;
      originalBounds = null;
    },

    // Hover feedback: resize cursor over a handle, move cursor over an item.
    onMouseHover(point) {
      const handle = selection.hitHandle(point);
      if (handle) return HANDLE_CURSOR[handle];
      return pickItem(point) ? 'move' : 'default';
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

    // Handles are sized in screen pixels, so they must be rebuilt on zoom.
    onViewChange() {
      selection.draw();
    },

    // Redraw handles after an external change (e.g. a Properties edit that
    // changed the item's bounds).
    refreshSelection() {
      selection.draw();
    },

    deactivate() {
      selection.clear();
    },
  };
}
