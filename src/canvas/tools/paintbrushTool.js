import { createBrush } from '../operations/freehand.js';
import { SHAPE_STYLE } from './styles.js';

// Paintbrush — like the pencil but a thicker, rounded stroke and stronger
// smoothing for a painterly line. (Real brush definitions arrive in iter. 23.)
export function createPaintbrushTool() {
  return createBrush({
    stroke: SHAPE_STYLE.strokeColor,
    width: 4,
    simplify: 4,
    cap: 'round',
  });
}
