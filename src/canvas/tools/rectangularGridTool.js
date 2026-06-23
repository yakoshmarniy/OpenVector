import paper from 'paper';

const COLS = 5; // cells across
const ROWS = 5; // cells down
const STROKE = '#9aa0a6';

const stroked = (item) => {
  item.strokeColor = new paper.Color(STROKE);
  item.strokeWidth = 1;
  item.fillColor = null;
  return item;
};

function constrainSquare(origin, point) {
  const size = Math.max(Math.abs(point.x - origin.x), Math.abs(point.y - origin.y));
  return new paper.Point(
    origin.x + (point.x < origin.x ? -size : size),
    origin.y + (point.y < origin.y ? -size : size),
  );
}

// Rectangular Grid — drag a box, get a grid of cells. Hold Shift for a square.
export function createRectangularGridTool() {
  let group = null;
  let origin = null;

  const build = (o, p) => {
    if (group) group.remove();
    const x1 = Math.min(o.x, p.x);
    const y1 = Math.min(o.y, p.y);
    const x2 = Math.max(o.x, p.x);
    const y2 = Math.max(o.y, p.y);
    const w = x2 - x1;
    const h = y2 - y1;

    group = new paper.Group();
    group.addChild(stroked(new paper.Path.Rectangle(new paper.Rectangle(x1, y1, w, h))));
    for (let i = 1; i < COLS; i += 1) {
      const x = x1 + (w * i) / COLS;
      group.addChild(stroked(new paper.Path.Line(new paper.Point(x, y1), new paper.Point(x, y2))));
    }
    for (let j = 1; j < ROWS; j += 1) {
      const y = y1 + (h * j) / ROWS;
      group.addChild(stroked(new paper.Path.Line(new paper.Point(x1, y), new paper.Point(x2, y))));
    }
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      origin = point;
    },

    onMouseDrag(point, _delta, e) {
      if (!origin) return;
      build(origin, e && e.shiftKey ? constrainSquare(origin, point) : point);
    },

    onMouseUp() {
      if (group && group.bounds.width < 2 && group.bounds.height < 2) group.remove();
      group = null;
      origin = null;
    },

    deactivate() {
      if (group && origin) group.remove();
      group = null;
      origin = null;
    },
  };
}
