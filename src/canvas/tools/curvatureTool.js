import paper from 'paper';
import { LINE_STYLE } from './styles.js';

// Curvature tool — click to drop points; the path auto-smooths through them
// (Catmull-Rom). Enter/Escape finishes; a lone point is discarded.
export function createCurvatureTool() {
  let path = null;

  const finish = () => {
    if (path && path.segments.length < 2) path.remove();
    path = null;
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      if (!path) {
        path = new paper.Path();
        path.strokeColor = new paper.Color(LINE_STYLE.strokeColor);
        path.strokeWidth = LINE_STYLE.strokeWidth;
        path.fillColor = null;
      }
      path.add(point);
      if (path.segments.length >= 3) path.smooth({ type: 'catmull-rom', factor: 0.5 });
    },

    onKeyDown(e) {
      if (e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        finish();
      }
    },

    deactivate() {
      finish();
    },
  };
}
