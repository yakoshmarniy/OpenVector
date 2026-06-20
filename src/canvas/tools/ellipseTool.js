import paper from 'paper';
import { SHAPE_STYLE } from './styles.js';

// Shift while drawing constrains to a circle, preserving drag direction.
function constrainSquare(origin, point) {
  const size = Math.max(Math.abs(point.x - origin.x), Math.abs(point.y - origin.y));
  return new paper.Point(
    origin.x + (point.x < origin.x ? -size : size),
    origin.y + (point.y < origin.y ? -size : size),
  );
}

/**
 * Ellipse tool — draw an ellipse by dragging. Hold Shift for a circle.
 * Handlers receive points already converted to project coordinates.
 */
export function createEllipseTool() {
  let path = null;
  let origin = null;

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      origin = point;
    },

    onMouseDrag(point, _delta, e) {
      if (!origin) return;
      const to = e && e.shiftKey ? constrainSquare(origin, point) : point;
      const rect = new paper.Rectangle(
        new paper.Point(Math.min(origin.x, to.x), Math.min(origin.y, to.y)),
        new paper.Size(Math.abs(to.x - origin.x), Math.abs(to.y - origin.y)),
      );
      // Path.Ellipse can't be reshaped via segments, so rebuild each step.
      if (path) path.remove();
      path = new paper.Path.Ellipse({ rectangle: rect, ...SHAPE_STYLE });
    },

    onMouseUp() {
      if (path && path.bounds.width < 1 && path.bounds.height < 1) {
        path.remove();
      }
      path = null;
      origin = null;
    },
  };
}
