import paper from 'paper';
import { createSelection, pickItem, addOverlay } from '../operations/selection.js';
import { afterStyleEdit } from '../operations/swatchOps.js';
import {
  getGradient,
  applyGradient,
  readGeometry,
  defaultGradient,
  rampColorAt,
} from '../operations/gradients.js';

// Gradient Tool with an on-canvas annotator (like Illustrator's). It edits the
// FILL gradient of the first selected path (v1):
//   drag on the shape        → (re)define the axis start → end
//   drag the round/square end → move that endpoint (angle / length)
//   drag a diamond stop       → slide its offset along the axis
//   click the axis            → add a stop there (colour sampled from the ramp)
//   Alt-click a stop          → remove it (min 2 stops)
// Radial shows the axis plus its radius circle; conic shows a centre ring with
// a start-angle handle (drag rotates the start angle).

const HANDLE = '#7fd4ff';
const HIT_PX = 9;

export function createGradientTool(ctx = {}) {
  let widget = null;
  let drag = null; // { kind, index?, origin, destination }

  const selection = createSelection(() => drawAnnotator());

  const primary = () => selection.targets.find((t) => t instanceof paper.Path) || null;

  const clearWidget = () => {
    if (widget) { widget.remove(); widget = null; }
  };

  // Points of the diamond stop markers along the axis.
  const stopPoint = (geom, offset) =>
    geom.origin.add(geom.destination.subtract(geom.origin).multiply(offset));

  function drawAnnotator() {
    clearWidget();
    const item = primary();
    if (!item) return;
    const desc = getGradient(item, 'fill');
    if (!desc) return;
    const geom = readGeometry(item, 'fill');
    if (!geom) return;
    const z = paper.view.zoom;
    const r = HIT_PX / z;
    widget = new paper.Group();
    widget.data.gradWidget = true;

    if (desc.type === 'conic') {
      const c = item.bounds.center;
      const ring = new paper.Path.Circle({ center: c, radius: r * 1.4 });
      ring.strokeColor = HANDLE; ring.strokeWidth = 1.5 / z; ring.fillColor = null;
      widget.addChild(ring);
      const handle = c.add(new paper.Point({ angle: desc.angle || 0, length: r * 3 }));
      const spoke = new paper.Path.Line(c, handle);
      spoke.strokeColor = HANDLE; spoke.strokeWidth = 1.5 / z;
      widget.addChild(spoke);
      const knob = new paper.Path.Circle({ center: handle, radius: r * 0.7 });
      knob.fillColor = HANDLE; knob.data.grad = 'angle';
      widget.addChild(knob);
      addOverlay(widget);
      widget.bringToFront();
      return;
    }

    // Axis line.
    const line = new paper.Path.Line(geom.origin, geom.destination);
    line.strokeColor = HANDLE; line.strokeWidth = 1.5 / z;
    widget.addChild(line);

    if (desc.type === 'radial') {
      const radius = geom.destination.subtract(geom.origin).length;
      const circle = new paper.Path.Circle({ center: geom.origin, radius });
      circle.strokeColor = HANDLE; circle.strokeWidth = 1 / z;
      circle.dashArray = [3 / z, 3 / z]; circle.fillColor = null;
      widget.addChild(circle);
    }

    // Origin square, destination circle.
    const sq = new paper.Path.Rectangle({
      rectangle: new paper.Rectangle(geom.origin.subtract(r * 0.7), new paper.Size(r * 1.4, r * 1.4)),
    });
    sq.fillColor = '#20242a'; sq.strokeColor = HANDLE; sq.strokeWidth = 1.5 / z;
    sq.data.grad = 'origin';
    widget.addChild(sq);
    const dot = new paper.Path.Circle({ center: geom.destination, radius: r * 0.8 });
    dot.fillColor = '#20242a'; dot.strokeColor = HANDLE; dot.strokeWidth = 1.5 / z;
    dot.data.grad = 'destination';
    widget.addChild(dot);

    // Stop diamonds.
    desc.stops.forEach((s, i) => {
      const p = stopPoint(geom, s.offset);
      const d = new paper.Path.RegularPolygon(p, 4, r * 0.85);
      d.fillColor = new paper.Color(s.color);
      d.strokeColor = HANDLE; d.strokeWidth = 1.5 / z;
      d.data.grad = 'stop'; d.data.stopIndex = i;
      widget.addChild(d);
    });

    addOverlay(widget);
    widget.bringToFront();
  }

  drawAnnotator();

  const hitHandle = (point) => {
    if (!widget) return null;
    const tol = HIT_PX / paper.view.zoom;
    for (let i = widget.children.length - 1; i >= 0; i -= 1) {
      const c = widget.children[i];
      if (c.data && c.data.grad && c.bounds.expand(tol).contains(point)) return c;
    }
    return null;
  };

  // Offset of a point projected onto the axis, clamped to [0,1].
  const offsetOf = (geom, point) => {
    const axis = geom.destination.subtract(geom.origin);
    const len2 = axis.dot(axis) || 1;
    return Math.max(0, Math.min(1, point.subtract(geom.origin).dot(axis) / len2));
  };

  const commit = (item, desc, geom) => {
    applyGradient(item, desc, 'fill', geom);
    afterStyleEdit();
    drawAnnotator();
    paper.view.update();
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point, e) {
      let item = primary();
      // No path selected yet — pick one under the cursor.
      if (!item) {
        const hit = pickItem(point);
        if (hit) selection.setTarget(hit);
        item = primary();
        if (!item) return;
      }

      const desc = getGradient(item, 'fill');
      const handle = desc ? hitHandle(point) : null;

      if (handle && handle.data.grad === 'stop') {
        if (e.altKey && desc.stops.length > 2) {
          desc.stops.splice(handle.data.stopIndex, 1);
          commit(item, desc, readGeometry(item, 'fill'));
          return;
        }
        drag = { kind: 'stop', index: handle.data.stopIndex };
        return;
      }
      if (handle && (handle.data.grad === 'origin' || handle.data.grad === 'destination')) {
        drag = { kind: handle.data.grad };
        return;
      }
      if (handle && handle.data.grad === 'angle') {
        drag = { kind: 'angle' };
        return;
      }

      // Click on the axis (not a handle) → add a stop.
      if (desc && desc.type !== 'conic') {
        const geom = readGeometry(item, 'fill');
        const t = offsetOf(geom, point);
        const proj = stopPoint(geom, t);
        if (proj.getDistance(point) <= HIT_PX / paper.view.zoom) {
          const { color, opacity } = rampColorAt(desc, t);
          desc.stops.push({ offset: t, color, opacity });
          desc.stops.sort((a, b) => a.offset - b.offset);
          commit(item, desc, geom);
          return;
        }
      }

      // Otherwise begin (re)defining the axis from here.
      drag = { kind: 'define', start: point };
    },

    onMouseDrag(point) {
      const item = primary();
      if (!item || !drag) return;
      let desc = getGradient(item, 'fill');

      if (drag.kind === 'define') {
        if (!desc) desc = defaultGradient('linear');
        commit(item, desc, { origin: drag.start.clone(), destination: point.clone() });
        return;
      }
      if (!desc) return;
      const geom = readGeometry(item, 'fill');

      if (drag.kind === 'origin') {
        commit(item, desc, { origin: point.clone(), destination: geom.destination });
      } else if (drag.kind === 'destination') {
        commit(item, desc, { origin: geom.origin, destination: point.clone() });
      } else if (drag.kind === 'stop') {
        const t = offsetOf(geom, point);
        desc.stops[drag.index] = { ...desc.stops[drag.index], offset: t };
        commit(item, desc, geom);
      } else if (drag.kind === 'angle') {
        const c = item.bounds.center;
        desc.angle = point.subtract(c).angle;
        commit(item, desc, geom);
      }
    },

    onMouseUp() {
      // Keep stop ordering sane after a drag past a neighbour.
      const item = primary();
      const desc = item && getGradient(item, 'fill');
      if (desc && desc.stops.some((s, i) => i && s.offset < desc.stops[i - 1].offset)) {
        desc.stops.sort((a, b) => a.offset - b.offset);
        commit(item, desc, readGeometry(item, 'fill'));
      }
      drag = null;
    },

    onViewChange() { drawAnnotator(); },
    refreshSelection() { drawAnnotator(); },
    deactivate() { clearWidget(); selection.dispose(); },
  };
}
