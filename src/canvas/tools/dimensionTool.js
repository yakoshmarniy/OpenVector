import paper from 'paper';
import { createSelection, addOverlay } from '../operations/selection.js';
import { runSelectionAction } from '../operations/selectionActions.js';

// Dimension Tool — drag between two points to create a dimension annotation
// as real artwork: a line with outward arrowheads, end ticks and a length
// label. Shift constrains the direction to 45° steps. The finished group is
// selectable / movable like any other object.

const STROKE = '#9aa0a6';
const TICK = 5; // half-length of the end ticks, px
const ARROW = 7; // arrowhead size, px

function buildDimension(a, b) {
  const v = b.subtract(a);
  const len = v.length;
  if (len < 2) return null;
  const dir = v.normalize();
  let n = new paper.Point(-dir.y, dir.x);
  if (n.y > 0) n = n.multiply(-1); // keep the label above the line

  const group = new paper.Group();
  const col = new paper.Color(STROKE);

  const line = new paper.Path.Line(a, b);
  line.strokeColor = col.clone();
  line.strokeWidth = 1;
  group.addChild(line);

  [a, b].forEach((p) => {
    const tick = new paper.Path.Line(p.add(n.multiply(TICK)), p.subtract(n.multiply(TICK)));
    tick.strokeColor = col.clone();
    tick.strokeWidth = 1;
    group.addChild(tick);
  });

  // Arrowheads at both ends, tips on the end points, pointing outward.
  [[a, dir.multiply(-1)], [b, dir]].forEach(([tip, d]) => {
    const base = tip.subtract(d.multiply(ARROW));
    const perp = new paper.Point(-d.y, d.x).multiply(ARROW * 0.4);
    const head = new paper.Path([tip, base.add(perp), base.subtract(perp)]);
    head.closed = true;
    head.fillColor = col.clone();
    group.addChild(head);
  });

  const label = new paper.PointText({
    point: a.add(v.multiply(0.5)).add(n.multiply(8)),
    content: `${Math.round(len * 10) / 10} px`,
    fillColor: col.clone(),
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 12,
    justification: 'center',
  });
  // Rotate the label along the line, flipped upright when pointing left.
  let ang = dir.angle;
  if (ang > 90 || ang < -90) ang += 180;
  label.rotate(ang, a.add(v.multiply(0.5)).add(n.multiply(8)));
  group.addChild(label);

  group.data.isDimension = true;
  return group;
}

export function createDimensionTool(ctx = {}) {
  const selection = createSelection();
  let start = null;
  let end = null;
  let preview = null;

  const clearPreview = () => {
    if (preview) {
      preview.remove();
      preview = null;
    }
  };

  const constrain = (a, b, shift) => {
    if (!shift) return b;
    const v = b.subtract(a);
    const ang = (Math.round(v.angle / 45) * 45 * Math.PI) / 180;
    const len = v.length;
    return a.add(new paper.Point(Math.cos(ang) * len, Math.sin(ang) * len));
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      start = point.clone();
      end = null;
    },

    onMouseDrag(point, delta, e) {
      if (!start) return;
      end = constrain(start, point, e && e.shiftKey);
      clearPreview();
      const g = buildDimension(start, end);
      if (g) {
        preview = g;
        addOverlay(preview);
        preview.bringToFront();
      }
    },

    onMouseUp() {
      clearPreview();
      if (start && end) {
        const g = buildDimension(start, end);
        if (g) selection.setTarget(g);
      }
      start = null;
      end = null;
    },

    onKeyDown(e) {
      if ((e.code === 'Delete' || e.code === 'Backspace') && selection.targets.length) {
        e.preventDefault();
        runSelectionAction(selection, 'delete');
      } else if (e.code === 'Escape') {
        clearPreview();
        start = null;
        end = null;
      }
    },

    runAction(name) {
      runSelectionAction(selection, name);
    },

    onViewChange() {
      selection.draw();
    },

    refreshSelection() {
      selection.draw();
    },

    deactivate() {
      clearPreview();
      selection.dispose();
    },
  };
}
