import paper from 'paper';

const CONCENTRIC = 4; // number of rings
const RADIAL = 8; // number of spokes
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

// Polar Grid — drag a box, get concentric rings plus radial spokes. The box
// sets the outer ellipse; Shift makes it a circle.
export function createPolarGridTool() {
  let group = null;
  let origin = null;

  const build = (o, p) => {
    if (group) group.remove();
    const cx = (o.x + p.x) / 2;
    const cy = (o.y + p.y) / 2;
    const rx = Math.abs(p.x - o.x) / 2;
    const ry = Math.abs(p.y - o.y) / 2;
    if (rx < 1 || ry < 1) return;
    const center = new paper.Point(cx, cy);

    group = new paper.Group();
    for (let k = 1; k <= CONCENTRIC; k += 1) {
      const f = k / CONCENTRIC;
      group.addChild(stroked(new paper.Path.Ellipse({
        center,
        radius: [rx * f, ry * f],
      })));
    }
    for (let m = 0; m < RADIAL; m += 1) {
      const angle = (m / RADIAL) * Math.PI * 2;
      const end = new paper.Point(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
      group.addChild(stroked(new paper.Path.Line(center, end)));
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
