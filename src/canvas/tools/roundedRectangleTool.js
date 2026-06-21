import paper from 'paper';
import { SHAPE_STYLE } from './styles.js';

const MAX_RADIUS = 40;

// Rounded rectangle — drag to define the box; corner radius scales with size.
export function createRoundedRectangleTool() {
  let path = null;
  let origin = null;

  return {
    cursor: 'crosshair',
    onMouseDown(point) {
      origin = point;
    },
    onMouseDrag(point) {
      if (!origin) return;
      const x = Math.min(origin.x, point.x);
      const y = Math.min(origin.y, point.y);
      const w = Math.abs(point.x - origin.x);
      const h = Math.abs(point.y - origin.y);
      const r = Math.min(Math.min(w, h) * 0.2, MAX_RADIUS);
      if (path) path.remove();
      path = new paper.Path.Rectangle(
        new paper.Rectangle(new paper.Point(x, y), new paper.Size(w, h)),
        r,
      );
      path.fillColor = new paper.Color(SHAPE_STYLE.fillColor);
      path.strokeColor = new paper.Color(SHAPE_STYLE.strokeColor);
      path.strokeWidth = SHAPE_STYLE.strokeWidth;
    },
    onMouseUp() {
      if (path && path.bounds.width < 1 && path.bounds.height < 1) path.remove();
      path = null;
      origin = null;
    },
  };
}
