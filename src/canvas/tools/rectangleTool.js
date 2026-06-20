import paper from 'paper';
import { SHAPE_STYLE } from './styles.js';

// Shift while drawing constrains to a perfect square, preserving drag direction.
function constrainSquare(origin, point) {
  const size = Math.max(Math.abs(point.x - origin.x), Math.abs(point.y - origin.y));
  return new paper.Point(
    origin.x + (point.x < origin.x ? -size : size),
    origin.y + (point.y < origin.y ? -size : size),
  );
}

/**
 * Rectangle tool — draw a rectangle by dragging. Hold Shift for a square.
 * Handlers receive points already converted to project coordinates.
 */
export function createRectangleTool() {
  let path = null;
  let origin = null;

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      origin = point;
      path = new paper.Path.Rectangle({
        rectangle: new paper.Rectangle(point, point),
        ...SHAPE_STYLE,
      });
    },

    onMouseDrag(point, _delta, e) {
      if (!path || !origin) return;
      const to = e && e.shiftKey ? constrainSquare(origin, point) : point;
      const x1 = Math.min(origin.x, to.x);
      const y1 = Math.min(origin.y, to.y);
      const x2 = Math.max(origin.x, to.x);
      const y2 = Math.max(origin.y, to.y);
      path.segments = [
        new paper.Segment(new paper.Point(x1, y1)),
        new paper.Segment(new paper.Point(x2, y1)),
        new paper.Segment(new paper.Point(x2, y2)),
        new paper.Segment(new paper.Point(x1, y2)),
      ];
    },

    onMouseUp() {
      // Discard zero-size rectangles (a plain click without a drag).
      if (path && path.bounds.width < 1 && path.bounds.height < 1) {
        path.remove();
      }
      path = null;
      origin = null;
    },
  };
}
