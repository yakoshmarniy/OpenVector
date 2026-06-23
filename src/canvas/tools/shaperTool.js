import paper from 'paper';
import { SHAPE_STYLE, LINE_STYLE } from './styles.js';

const col = (c) => new paper.Color(c);

// Shaper — draw a rough gesture and it snaps to a clean shape. The fill ratio
// (drawn area ÷ bounding-box area) tells rectangle (~1) from ellipse (~0.79)
// from triangle (~0.5); a thin gesture becomes a straight line.
function recognize(pts) {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = maxX - minX;
  const h = maxY - minY;
  if (w < 3 && h < 3) return null;

  let a = 0;
  for (let i = 0; i < pts.length; i += 1) {
    const j = (i + 1) % pts.length;
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  const area = Math.abs(a) / 2;
  const ratio = area / Math.max(1, w * h);
  const minDim = Math.min(w, h);
  const maxDim = Math.max(w, h);

  // Thin, low-area gesture → straight line through the endpoints.
  if (minDim < maxDim * 0.18 && ratio < 0.3) {
    const line = new paper.Path.Line(pts[0], pts[pts.length - 1]);
    line.strokeColor = col(LINE_STYLE.strokeColor);
    line.strokeWidth = LINE_STYLE.strokeWidth;
    return line;
  }

  const bbox = new paper.Rectangle(minX, minY, w, h);
  let shape;
  if (ratio > 0.82) {
    shape = new paper.Path.Rectangle(bbox);
  } else if (ratio > 0.62) {
    shape = new paper.Path.Ellipse(bbox);
  } else if (ratio > 0.38) {
    shape = new paper.Path([
      new paper.Point((minX + maxX) / 2, minY),
      new paper.Point(maxX, maxY),
      new paper.Point(minX, maxY),
    ]);
    shape.closed = true;
  } else {
    shape = new paper.Path(pts.map((p) => new paper.Segment(p)));
    shape.closed = true;
    shape.simplify(4);
  }
  shape.fillColor = col(SHAPE_STYLE.fillColor);
  shape.strokeColor = col(SHAPE_STYLE.strokeColor);
  shape.strokeWidth = SHAPE_STYLE.strokeWidth;
  return shape;
}

export function createShaperTool() {
  let path = null;
  let pts = [];

  const drop = () => {
    if (path) path.remove();
    path = null;
    pts = [];
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      path = new paper.Path();
      path.strokeColor = col('#9aa0a6');
      path.strokeWidth = 1.5;
      path.add(point);
      pts = [point.clone()];
    },

    onMouseDrag(point) {
      if (!path) return;
      path.add(point);
      pts.push(point.clone());
    },

    onMouseUp() {
      if (!path) return;
      const collected = pts;
      drop();
      if (collected.length >= 3) recognize(collected);
    },

    deactivate() {
      drop();
    },
  };
}
