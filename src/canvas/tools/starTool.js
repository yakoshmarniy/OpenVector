import paper from 'paper';
import { SHAPE_STYLE } from './styles.js';

const POINTS = 5;
const INNER_RATIO = 0.5;

// Star — drag from the centre outwards to set the outer radius.
export function createStarTool() {
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
      path = new paper.Path.Star(origin, POINTS, radius, radius * INNER_RATIO);
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
