import {
  createSelection,
  pickItem,
  computeResizeBounds,
} from '../operations/selection.js';
import { groupItems, ungroupItems, booleanOp } from '../operations/booleans.js';

const HANDLE_CURSOR = {
  nw: 'nwse-resize', se: 'nwse-resize',
  ne: 'nesw-resize', sw: 'nesw-resize',
  n: 'ns-resize', s: 'ns-resize',
  e: 'ew-resize', w: 'ew-resize',
};

/**
 * Select tool — click to select, Shift+click to add/remove from the selection,
 * drag the body to move (all selected), drag a handle to resize (single).
 * Shift keeps aspect ratio while resizing. Delete removes, Escape deselects.
 * runAction() performs group/ungroup and the boolean operations.
 */
export function createSelectTool(ctx = {}) {
  const selection = createSelection(ctx.onSelectionChange);
  let mode = null; // 'move' | 'resize' | null
  let activeHandle = null;
  let originalBounds = null;

  return {
    cursor: 'default',

    onMouseDown(point, e) {
      const handle = selection.hitHandle(point);
      if (handle && selection.target) {
        mode = 'resize';
        activeHandle = handle;
        originalBounds = selection.target.bounds.clone();
        return;
      }

      const item = pickItem(point);
      const additive = !!(e && e.shiftKey);

      if (item) {
        if (additive) {
          selection.toggle(item);
          mode = null;
        } else {
          if (!selection.has(item)) selection.setTarget(item);
          mode = 'move';
        }
      } else if (!additive) {
        selection.clear();
        mode = null;
      }
    },

    onMouseDrag(point, delta, e) {
      if (mode === 'move' && selection.targets.length) {
        selection.targets.forEach((t) => {
          t.position = t.position.add(delta);
        });
        selection.draw();
      } else if (mode === 'resize' && selection.target && originalBounds) {
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

    onMouseHover(point) {
      const handle = selection.hitHandle(point);
      if (handle) return HANDLE_CURSOR[handle];
      return pickItem(point) ? 'move' : 'default';
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

    // group | ungroup | unite | subtract | intersect | exclude
    runAction(name) {
      const items = selection.targets.slice();
      if (name === 'group') {
        const g = groupItems(items);
        if (g) selection.setTarget(g);
      } else if (name === 'ungroup') {
        const kids = ungroupItems(items[0]);
        if (kids) selection.setTargets(kids);
      } else {
        const result = booleanOp(items, name);
        if (result) selection.setTarget(result);
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
