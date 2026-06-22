import paper from 'paper';
import { col } from '../operations/freehand.js';
import { SHAPE_STYLE } from './styles.js';

const RADIUS = 8; // brush radius in project units

// Blob Brush — paints filled shapes. The drag lays down overlapping circular
// stamps that are united into one filled path on release; if the new blob
// overlaps an existing blob of the same colour, they merge (like Illustrator).
//
// Stamps are kept as a plain array of circles inserted straight into the layer
// (not a Group) — a Group would swallow the boolean result, which Paper inserts
// next to its operand.
export function createBlobBrushTool() {
  let stamps = null; // array of preview circles while drawing
  let last = null;

  const reset = () => {
    stamps = null;
    last = null;
  };

  const stamp = (point) => {
    const c = new paper.Path.Circle({ center: point, radius: RADIUS });
    c.fillColor = col(SHAPE_STYLE.fillColor);
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
      // Interpolate stamps along the move so the stroke stays continuous.
      const d = point.getDistance(last);
      if (d < RADIUS) return;
      const from = last;
      const n = Math.max(1, Math.floor(d / RADIUS));
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

      // Union the stamps into a single filled blob.
      let blob = circles[0];
      for (let i = 1; i < circles.length; i += 1) {
        const u = blob.unite(circles[i]);
        blob.remove();
        circles[i].remove();
        blob = u;
      }

      // Merge with any existing blob it overlaps (same-colour, like Illustrator).
      paper.project
        .getItems({ match: (it) => it !== blob && it.data && it.data.blob })
        .forEach((other) => {
          if (blob.intersects(other)) {
            const u = blob.unite(other);
            blob.remove();
            other.remove();
            blob = u;
          }
        });

      blob.fillColor = col(SHAPE_STYLE.fillColor);
      blob.strokeColor = null;
      blob.data.blob = true;
    },

    deactivate() {
      if (stamps) stamps.forEach((c) => c.remove());
      reset();
    },
  };
}
