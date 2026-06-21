import paper from 'paper';
import { SHAPE_STYLE } from './styles.js';

const SIDES = 6;

// Regular polygon — drag from the centre outwards to set the radius.
export function createPolygonTool() {
  let path = null;
  let origin = null;

  return {
    cursor: 'crosshair',
    onMouseDown(point) {
      origin = point;
    },
    onMouseDrag(point) {
      if (!origin) return;
      const radius = Math.max(1, origin.getDistance(point));
      if (path) path.remove();
      path = new paper.Path.RegularPolygon(origin, SIDES, radius);
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
