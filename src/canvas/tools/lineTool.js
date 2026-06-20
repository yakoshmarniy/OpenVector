import paper from 'paper';
import { LINE_STYLE } from './styles.js';

/**
 * Line tool — draw a straight line by dragging. Hold Shift to snap the
 * angle to the nearest 45°. Points arrive in project coordinates.
 */
export function createLineTool() {
  let path = null;
  let origin = null;

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      origin = point;
      path = new paper.Path.Line({ from: point, to: point, ...LINE_STYLE });
    },

    onMouseDrag(point, _delta, e) {
      if (!path || !origin) return;
      let to = point;
      if (e && e.shiftKey) {
        const v = point.subtract(origin);
        to = origin.add(
          new paper.Point({ length: v.length, angle: Math.round(v.angle / 45) * 45 }),
        );
      }
      path.segments = [new paper.Segment(origin), new paper.Segment(to)];
    },

    onMouseUp() {
      if (path && path.length < 1) {
        path.remove();
      }
      path = null;
      origin = null;
    },
  };
}
