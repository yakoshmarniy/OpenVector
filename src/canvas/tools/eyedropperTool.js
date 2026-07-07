import paper from 'paper';
import { pickItem } from '../operations/selection.js';
import { readStyle, applyStyle } from '../operations/itemStyle.js';
import { afterStyleEdit } from '../operations/swatchOps.js';
import { getSelectedItems } from '../../state/selection.js';
import { setDefaultPaint } from '../../state/colors.js';

// Eyedropper: click an object to copy its appearance onto the selection
// (fill, stroke, weight, caps, dashes, opacity). Alt-click gives instead —
// the selection's appearance is applied to the object under the cursor.
// With nothing selected a plain click samples into the default paint, so the
// next shapes you draw pick the colours up.

const CURSOR_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">' +
  '<path d="M3 17l1-4 8-8 3 3-8 8-4 1z" fill="none" stroke="white" stroke-width="3"/>' +
  '<path d="M3 17l1-4 8-8 3 3-8 8-4 1z" fill="none" stroke="black" stroke-width="1.4"/>' +
  '<path d="M12 3l2-2 4 4-2 2" fill="black" stroke="white" stroke-width="1"/></svg>';

// Turn a readStyle() snapshot into a patch applyStyle understands on any
// target (text targets simply ignore the path-only keys).
function patchFrom(style) {
  const patch = {
    fillColor: style.hasFill ? style.fillColor : null,
    strokeColor: style.hasStroke ? style.strokeColor : null,
    strokeWidth: style.strokeWidth,
    opacity: style.opacity,
  };
  if (!style.isText) {
    patch.strokeCap = style.strokeCap;
    patch.strokeJoin = style.strokeJoin;
    patch.dashArray = style.dashArray.slice();
  }
  return patch;
}

export function createEyedropperTool() {
  return {
    cursor: `url("${CURSOR_SVG}") 3 17, crosshair`,

    onMouseDown(point, e) {
      const item = pickItem(point);
      const selected = getSelectedItems();

      if (e.altKey) {
        // Give: paint the clicked object with the selection's appearance.
        const source = selected[0];
        if (!source || !item || item === source) return;
        applyStyle(item, patchFrom(readStyle(source)));
        afterStyleEdit();
        return;
      }

      if (!item) return;
      const style = readStyle(item);
      const targets = selected.filter((t) => t !== item);
      if (targets.length) {
        const patch = patchFrom(style);
        targets.forEach((t) => applyStyle(t, patch));
        afterStyleEdit();
      } else if (!selected.length) {
        // Nothing selected — sample into the default paint for new shapes.
        setDefaultPaint({
          fill: style.hasFill ? style.fillColor : undefined,
          stroke: style.hasStroke ? style.strokeColor : undefined,
        });
        paper.view.update();
      }
    },
  };
}
