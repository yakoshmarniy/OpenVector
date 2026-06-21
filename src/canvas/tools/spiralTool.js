import paper from 'paper';
import { LINE_STYLE } from './styles.js';

const TURNS = 3;
const STEPS = TURNS * 40;

// Spiral — drag from the centre; distance sets the outer radius, direction the
// starting angle. Archimedean (radius grows linearly with angle).
export function createSpiralTool() {
  let path = null;
  let origin = null;

  return {
    cursor: 'crosshair',
    onMouseDown(point) {
      origin = point;
    },
    onMouseDrag(point) {
      if (!origin) return;
      const maxR = Math.max(1, origin.getDistance(point));
      const start = (point.subtract(origin).angle * Math.PI) / 180;
      if (path) path.remove();
      path = new paper.Path();
      for (let i = 0; i <= STEPS; i += 1) {
        const t = i / STEPS;
        const ang = start + t * TURNS * 2 * Math.PI;
        const r = maxR * t;
        path.add(origin.add(new paper.Point(Math.cos(ang) * r, Math.sin(ang) * r)));
      }
      path.smooth();
      path.fillColor = null;
      path.strokeColor = new paper.Color(LINE_STYLE.strokeColor);
      path.strokeWidth = LINE_STYLE.strokeWidth;
    },
    onMouseUp() {
      if (path && path.length < 2) path.remove();
      path = null;
      origin = null;
    },
  };
}
