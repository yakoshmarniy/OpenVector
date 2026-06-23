import paper from 'paper';
import { col, overlayed } from '../operations/freehand.js';

const RADIUS = 10; // eraser radius in project units

// Eraser — drag over filled shapes to erase area. The drag lays down circular
// stamps united into one region that is subtracted from every closed path it
// overlaps. (Unlike Path Eraser, which trims a single open path's centerline.)
export function createEraserTool() {
  let stamps = null;
  let last = null;

  const reset = () => {
    stamps = null;
    last = null;
  };

  const stamp = (point) => {
    const c = new paper.Path.Circle({ center: point, radius: RADIUS });
    c.fillColor = col('#cccccc');
    c.strokeColor = null;
    stamps.push(c);
    last = point;
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      stamps = [];
      stamp(point);
    },

    onMouseDrag(point) {
      if (!stamps || !last) return;
      const step = RADIUS * 0.6;
      const d = point.getDistance(last);
      if (d < step) return;
      const from = last;
      const n = Math.max(1, Math.floor(d / step));
      const span = point.subtract(from);
      for (let i = 1; i <= n; i += 1) stamp(from.add(span.multiply(i / n)));
    },

    onMouseUp() {
      if (!stamps || !stamps.length) {
        reset();
        return;
      }
      const circles = stamps;
      reset();

      // Union the stamps into one eraser region.
      let blob = circles[0];
      for (let i = 1; i < circles.length; i += 1) {
        const u = blob.unite(circles[i]);
        blob.remove();
        circles[i].remove();
        blob = u;
      }

      // Subtract it from every closed path it overlaps.
      const targets = paper.project.getItems({
        match: (it) =>
          (it.className === 'Path' || it.className === 'CompoundPath') &&
          it !== blob &&
          it.closed !== false &&
          !overlayed(it),
      });
      targets.forEach((t) => {
        if (!t.bounds.intersects(blob.bounds)) return;
        try {
          const r = t.subtract(blob);
          if (r) {
            r.fillColor = t.fillColor;
            r.strokeColor = t.strokeColor;
            r.strokeWidth = t.strokeWidth;
            t.remove();
            if (!r.area) r.remove();
          }
        } catch {
          /* skip shapes the boolean op can't handle */
        }
      });

      blob.remove();
    },

    deactivate() {
      if (stamps) stamps.forEach((c) => c.remove());
      reset();
    },
  };
}
