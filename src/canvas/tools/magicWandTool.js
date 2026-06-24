import paper from 'paper';
import { createSelection, pickItem, isOverlayItem } from '../operations/selection.js';
import { runSelectionAction } from '../operations/selectionActions.js';

// Sum-of-RGB-channel tolerance (each channel 0..1, so 0..3 total).
const TOL = 0.16;
const WEIGHT_TOL = 1; // stroke-width tolerance in px

const fillOf = (it) => it.fillColor || null;
const strokeOf = (it) => it.strokeColor || null;

function colorClose(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return Math.abs(a.red - b.red) + Math.abs(a.green - b.green) + Math.abs(a.blue - b.blue) <= TOL;
}

// Effective stroke width (0 when there's no stroke).
const weightOf = (it) => (it.strokeColor ? it.strokeWidth || 0 : 0);

// Magic Wand — click an object to select every object with a similar appearance:
// fill colour AND stroke colour AND stroke weight must all match (so stroke is
// never ignored). Shift+click adds to the selection.
export function createMagicWandTool(ctx = {}) {
  const selection = createSelection(ctx.onSelectionChange, ctx.onSelectionBounds);

  const matches = (ref) => {
    const refFill = fillOf(ref);
    const refStroke = strokeOf(ref);
    const refWeight = weightOf(ref);
    return paper.project.activeLayer.children.filter((it) => {
      if (isOverlayItem(it) || it.locked) return false;
      if (it.className !== 'Path' && it.className !== 'CompoundPath' && it.className !== 'Shape') {
        return false; // only match fillable/strokable artwork
      }
      return (
        colorClose(fillOf(it), refFill) &&
        colorClose(strokeOf(it), refStroke) &&
        Math.abs(weightOf(it) - refWeight) <= WEIGHT_TOL
      );
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
      selection.clear();
    },
  };
}
