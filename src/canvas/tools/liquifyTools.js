import paper from 'paper';
import { createSelection, addOverlay } from '../operations/selection.js';
import { runSelectionAction } from '../operations/selectionActions.js';
import { getLiquifyOptions, setLiquifyOptions } from '../../state/liquify.js';
import {
  collectLiquifyPaths,
  liquifyStep,
  finishLiquify,
  newGesture,
} from '../operations/liquify.js';

// The seven Liquify tools share one factory: an elliptical brush cursor that
// follows the mouse, drag = deform whatever is under it (the selection when
// there is one), Alt-drag = resize the brush on canvas (Shift keeps it round).

function makeLiquifyTool(mode) {
  return function createLiquifyTool() {
    const selection = createSelection();

    let cursorItem = null; // brush outline following the mouse
    let lastCursorAt = null;
    let gesture = null;
    let touched = null; // Set of paths deformed this gesture
    let sizing = null; // { center } while Alt-resizing the brush

    const clearCursor = () => {
      if (cursorItem) cursorItem.remove();
      cursorItem = null;
    };

    const drawCursor = (point) => {
      clearCursor();
      lastCursorAt = point;
      const o = getLiquifyOptions();
      const px = 1 / paper.view.zoom;
      cursorItem = new paper.Path.Ellipse({
        rectangle: new paper.Rectangle(
          point.x - o.width / 2,
          point.y - o.height / 2,
          o.width,
          o.height,
        ),
        insert: false,
      });
      if (o.angle) cursorItem.rotate(o.angle, point);
      cursorItem.strokeColor = new paper.Color('#7fb2d9');
      cursorItem.strokeWidth = px;
      cursorItem.dashArray = [4 * px, 3 * px];
      cursorItem.fillColor = null;
      addOverlay(cursorItem);
    };

    return {
      cursor: 'crosshair',

      onMouseHover(point) {
        drawCursor(point);
        return undefined;
      },

      onMouseDown(point, e) {
        if (e && e.altKey) {
          sizing = { center: point };
          return;
        }
        gesture = newGesture();
        touched = new Set();
        drawCursor(point);
      },

      onMouseDrag(point, delta, e) {
        if (sizing) {
          // Brush grows from the Alt-down point; Shift keeps it circular.
          const dx = Math.max(4, Math.abs(point.x - sizing.center.x) * 2);
          const dy = Math.max(4, Math.abs(point.y - sizing.center.y) * 2);
          const uniform = e && e.shiftKey;
          setLiquifyOptions(uniform
            ? { width: Math.max(dx, dy), height: Math.max(dx, dy) }
            : { width: dx, height: dy });
          drawCursor(sizing.center);
          return;
        }
        if (!gesture) return;
        const o = getLiquifyOptions();
        const paths = collectLiquifyPaths(point, o);
        liquifyStep(mode, paths, point, delta, o, gesture).forEach((p) => touched.add(p));
        drawCursor(point);
        if (selection.targets.length) selection.draw();
      },

      onMouseUp(point) {
        if (sizing) {
          sizing = null;
          return;
        }
        if (touched && touched.size) {
          finishLiquify(mode, [...touched], getLiquifyOptions(), gesture);
          selection.draw();
        }
        gesture = null;
        touched = null;
        if (point) drawCursor(point);
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
        if (lastCursorAt) drawCursor(lastCursorAt); // stroke is sized in px
      },

      refreshSelection() {
        selection.draw();
        if (lastCursorAt) drawCursor(lastCursorAt); // brush options may have changed
      },

      deactivate() {
        clearCursor();
        selection.dispose();
      },
    };
  };
}

export const createWarpTool = makeLiquifyTool('warp');
export const createTwirlTool = makeLiquifyTool('twirl');
export const createPuckerTool = makeLiquifyTool('pucker');
export const createBloatTool = makeLiquifyTool('bloat');
export const createScallopTool = makeLiquifyTool('scallop');
export const createCrystallizeTool = makeLiquifyTool('crystallize');
export const createWrinkleTool = makeLiquifyTool('wrinkle');
