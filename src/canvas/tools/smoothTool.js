import { pathAt } from '../operations/freehand.js';

// Smooth — scrub over a path to reduce its jaggedness. Each pass refits the
// curve through fewer points (path.simplify), so repeated drags smooth more.
export function createSmoothTool() {
  let target = null;

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      target = pathAt(point, 10);
    },

    onMouseUp() {
      if (target && target.segments && target.segments.length > 2) {
        target.simplify(6);
      }
      target = null;
    },

    onMouseHover(point) {
      return pathAt(point, 10) ? 'crosshair' : 'default';
    },

    deactivate() {
      target = null;
    },
  };
}
