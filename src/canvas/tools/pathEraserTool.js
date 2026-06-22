import paper from 'paper';
import { pathAt } from '../operations/freehand.js';

// Path Eraser — scrub along a path to cut out the part you drag over, leaving a
// gap (the path splits into the pieces on either side of the scrub).
export function createPathEraserTool() {
  let path = null;
  let startLoc = null;

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      path = pathAt(point, 10);
      startLoc = path ? path.getNearestLocation(point) : null;
    },

    onMouseUp(point) {
      if (path && startLoc) {
        try {
          const endLoc = path.getNearestLocation(point);
          if (endLoc) eraseRange(path, startLoc.offset, endLoc.offset);
        } catch {
          /* leave the path untouched if the split fails */
        }
      }
      path = null;
      startLoc = null;
    },

    onMouseHover(point) {
      return pathAt(point, 10) ? 'crosshair' : 'default';
    },

    deactivate() {
      path = null;
      startLoc = null;
    },
  };
}

const tiny = (p) => p && p.segments && p.segments.length < 2;

function eraseRange(path, oA, oB) {
  const a = Math.min(oA, oB);
  const b = Math.max(oA, oB);
  if (b - a < 0.5) return; // a tap, not a scrub

  if (path.closed) {
    // Reopen the loop at `a`, then drop the scrubbed arc, keeping the rest.
    path.splitAt(path.getLocationAt(a));
    const after = path.splitAt(path.getLocationAt(b - a));
    path.remove(); // scrubbed arc
    if (tiny(after)) after.remove();
  } else {
    const after = path.splitAt(path.getLocationAt(b));
    const middle = path.splitAt(path.getLocationAt(a));
    if (middle) middle.remove();
    if (tiny(path)) path.remove();
    if (tiny(after)) after.remove();
  }
}
