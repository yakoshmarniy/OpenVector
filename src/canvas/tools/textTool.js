import paper from 'paper';
import {
  createTextItem,
  setRawText,
  relayout,
  isTextItem,
  caretSegment,
} from '../operations/textLayout.js';

/**
 * Text tool.
 *   click            → point text at the cursor
 *   drag             → area text (typed text wraps inside the box)
 *   click a text     → re-edit it
 *   type             → edit content (Enter = newline, Backspace = delete)
 *   Escape / switch  → commit (empty text is discarded)
 * Points arrive in project coordinates.
 */
export function createTextTool(ctx = {}) {
  let editing = null;
  let caret = null;
  let startPoint = null;
  let boxPreview = null;
  let isAreaDrag = false;

  const removeCaret = () => {
    if (caret) {
      caret.remove();
      caret = null;
    }
  };

  const showCaret = () => {
    if (!editing) return;
    removeCaret();
    const seg = caretSegment(editing);
    caret = new paper.Path.Line({ from: seg.from, to: seg.to });
    caret.strokeColor = new paper.Color('#c7c9cc');
    caret.strokeWidth = 1 / paper.view.zoom;
    caret.data.isTextOverlay = true;
    caret.locked = true;
  };

  const removeBox = () => {
    if (boxPreview) {
      boxPreview.remove();
      boxPreview = null;
    }
  };

  const beginEdit = (item) => {
    editing = item;
    showCaret();
    ctx.onSelectionChange?.(item);
  };

  const commit = () => {
    removeCaret();
    removeBox();
    if (editing) {
      if (!editing.data.rawText) editing.remove(); // discard empty text
      editing = null;
      ctx.onSelectionChange?.(null);
    }
  };

  return {
    cursor: 'text',

    onMouseDown(point) {
      // Re-edit an existing text item.
      const hit = paper.project.hitTest(point, {
        fill: true,
        tolerance: 5 / paper.view.zoom,
      });
      if (hit && isTextItem(hit.item) && hit.item !== editing) {
        commit();
        beginEdit(hit.item);
        return;
      }
      commit();
      startPoint = point;
      isAreaDrag = false;
    },

    onMouseDrag(point) {
      if (!startPoint) return;
      isAreaDrag = true;
      removeBox();
      boxPreview = new paper.Path.Rectangle(new paper.Rectangle(startPoint, point));
      boxPreview.strokeColor = new paper.Color('#6f8595');
      boxPreview.strokeWidth = 1 / paper.view.zoom;
      boxPreview.dashArray = [4 / paper.view.zoom, 3 / paper.view.zoom];
      boxPreview.data.isTextOverlay = true;
      boxPreview.locked = true;
    },

    onMouseUp(point) {
      if (!startPoint) return;
      removeBox();
      if (isAreaDrag) {
        const rect = new paper.Rectangle(startPoint, point);
        if (rect.width > 5 && rect.height > 5) {
          beginEdit(createTextItem({ point: rect.topLeft, areaWidth: rect.width }));
        }
      } else {
        beginEdit(createTextItem({ point: startPoint }));
      }
      startPoint = null;
      isAreaDrag = false;
    },

    onKeyDown(e) {
      if (!editing) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return; // leave shortcuts alone
      if (e.code === 'Escape') {
        e.preventDefault();
        commit();
        return;
      }
      let raw = editing.data.rawText || '';
      if (e.code === 'Enter') {
        e.preventDefault();
        raw += '\n';
      } else if (e.code === 'Backspace') {
        e.preventDefault();
        raw = raw.slice(0, -1);
      } else if (e.key.length === 1) {
        e.preventDefault();
        raw += e.key;
      } else {
        return;
      }
      setRawText(editing, raw);
      showCaret();
    },

    // Tells Canvas to route every key here (so Space types instead of panning).
    wantsKeyboard() {
      return !!editing;
    },

    onViewChange() {
      if (editing) {
        relayout(editing);
        showCaret();
      }
    },

    deactivate() {
      commit();
    },
  };
}
