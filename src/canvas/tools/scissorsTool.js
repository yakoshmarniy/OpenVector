import { pathAt } from '../operations/freehand.js';

// Scissors — click a path to cut it at that point. An open path splits into two
// paths; a closed path opens at the cut. (Two cuts separate a closed shape.)
export function createScissorsTool() {
  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      const path = pathAt(point, 8);
      if (!path) return;
      const loc = path.getNearestLocation(point);
      if (!loc) return;
      try {
        path.splitAt(loc);
      } catch {
        /* ignore cuts Paper can't make */
      }
    },

    onMouseHover(point) {
      return pathAt(point, 8) ? 'crosshair' : 'default';
    },
  };
}
