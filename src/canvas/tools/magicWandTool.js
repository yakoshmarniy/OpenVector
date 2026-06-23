import paper from 'paper';
import { createSelection, pickItem, isOverlayItem } from '../operations/selection.js';

// Sum-of-RGB-channel tolerance (each channel 0..1, so 0..3 total).
const TOL = 0.16;

const fillOf = (it) => it.fillColor || null;
const strokeOf = (it) => it.strokeColor || null;

function close(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return Math.abs(a.red - b.red) + Math.abs(a.green - b.green) + Math.abs(a.blue - b.blue) <= TOL;
}

// Magic Wand — click an object to select every object with a similar fill (or
// stroke, if the clicked object has no fill). Shift+click adds to the selection.
export function createMagicWandTool(ctx = {}) {
  const selection = createSelection(ctx.onSelectionChange, ctx.onSelectionBounds);

  const matches = (ref) => {
    const refFill = fillOf(ref);
    const refStroke = strokeOf(ref);
    if (!refFill && !refStroke) return [ref];
    const useFill = !!refFill;
    return paper.project.activeLayer.children.filter((it) => {
      if (isOverlayItem(it) || it.locked) return false;
      return useFill ? close(fillOf(it), refFill) : close(strokeOf(it), refStroke);
    });
  };

  return {
    cursor: 'default',

    onMouseDown(point, e) {
      const item = pickItem(point);
      if (!item) {
        if (!(e && e.shiftKey)) selection.clear();
        return;
      }
      const set = matches(item);
      if (e && e.shiftKey) set.forEach((m) => !selection.has(m) && selection.toggle(m));
      else selection.setTargets(set);
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
      selection.clear();
    },
  };
}
