import { createBrush } from '../operations/freehand.js';
import { LINE_STYLE } from './styles.js';

// Pencil — freehand line. Thin stroke, light simplify so it tracks the hand.
export function createPencilTool() {
  return createBrush({
    stroke: LINE_STYLE.strokeColor,
    width: 1.5,
    simplify: 2.5,
  });
}
