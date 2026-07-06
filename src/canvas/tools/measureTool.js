import paper from 'paper';
import { addOverlay } from '../operations/selection.js';

// Measure Tool — drag between two points to read distance, ΔX/ΔY and angle.
// The readout is a screen-sized overlay that stays visible after mouse-up
// (like Illustrator's Info panel values) until the next measurement.

export function createMeasureTool(ctx = {}) {
  let start = null;
  let end = null;
  let overlay = null;

  const clearOverlay = () => {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  };

  const constrain = (a, b, shift) => {
    if (!shift) return b;
    const v = b.subtract(a);
    const ang = (Math.round(v.angle / 45) * 45 * Math.PI) / 180;
    const len = v.length;
    return a.add(new paper.Point(Math.cos(ang) * len, Math.sin(ang) * len));
  };

  function draw() {
    clearOverlay();
    if (!start || !end) return;
    const z = paper.view.zoom;
    overlay = new paper.Group();

    const line = new paper.Path.Line(start, end);
    line.strokeColor = new paper.Color('#7fd4ff');
    line.strokeWidth = 1 / z;
    line.dashArray = [4 / z, 3 / z];
    overlay.addChild(line);

    [start, end].forEach((p) => {
      const dotEl = new paper.Path.Circle({ center: p, radius: 2.5 / z });
      dotEl.fillColor = new paper.Color('#7fd4ff');
      overlay.addChild(dotEl);
    });

    const v = end.subtract(start);
    const angle = ((-v.angle % 360) + 360) % 360; // screen-y is inverted
    const fmt = (n) => (Math.round(n * 10) / 10).toString();
    const label = new paper.PointText({
      point: end.add(new paper.Point(12 / z, -12 / z)),
      content: `D: ${fmt(v.length)}   ∠: ${fmt(angle)}°\nW: ${fmt(Math.abs(v.x))}   H: ${fmt(Math.abs(v.y))}`,
      fillColor: new paper.Color('#dff0fa'),
      fontFamily: 'Menlo, monospace',
      fontSize: 11 / z,
      leading: 14 / z,
    });
    overlay.addChild(label);

    addOverlay(overlay);
    overlay.bringToFront();
  }

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      start = point.clone();
      end = null;
      clearOverlay();
    },

    onMouseDrag(point, delta, e) {
      if (!start) return;
      end = constrain(start, point, e && e.shiftKey);
      draw();
    },

    onMouseUp() {
      // Keep the readout on screen until the next measurement.
    },

    onKeyDown(e) {
      if (e.code === 'Escape') {
        start = null;
        end = null;
        clearOverlay();
      }
    },

    onViewChange() {
      draw();
    },

    deactivate() {
      clearOverlay();
    },
  };
}
