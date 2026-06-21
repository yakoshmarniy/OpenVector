import paper from 'paper';
import { LINE_STYLE } from './styles.js';

// Arc — drag horizontally for span, vertically for the bow height.
export function createArcTool() {
  let path = null;
  let origin = null;

  return {
    cursor: 'crosshair',
    onMouseDown(point) {
      origin = point;
    },
    onMouseDrag(point) {
      if (!origin) return;
      const from = origin;
      const to = new paper.Point(point.x, origin.y);
      // Keep the three points non-collinear so Path.Arc stays valid.
      const bowY = Math.abs(point.y - origin.y) < 1 ? origin.y + 1 : point.y;
      const through = new paper.Point((origin.x + point.x) / 2, bowY);
      if (path) path.remove();
      path = null;
      if (Math.abs(point.x - origin.x) < 1) return;
      try {
        path = new paper.Path.Arc(from, through, to);
      } catch {
        path = null;
        return;
      }
      path.fillColor = null;
      path.strokeColor = new paper.Color(LINE_STYLE.strokeColor);
      path.strokeWidth = LINE_STYLE.strokeWidth;
    },
    onMouseUp() {
      if (path && path.length < 1) path.remove();
      path = null;
      origin = null;
    },
  };
}
