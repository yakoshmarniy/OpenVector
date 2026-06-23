import paper from 'paper';
import { textEntity, relayout } from '../operations/textLayout.js';

// Touch Type — grab a single character in a text block and transform it on its
// own. Drag = move, Shift+drag = scale, Alt+drag = rotate. The transform is
// stored per glyph (group.data.glyphFx[index]) so it survives re-layout.
export function createTouchTypeTool() {
  let group = null;
  let index = null;
  let startFx = null;
  let down = null;
  let overlay = null;

  const clearOverlay = () => {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  };

  const glyphAt = (point) => {
    const hit = paper.project.hitTest(point, {
      fill: true,
      stroke: true,
      tolerance: 4 / paper.view.zoom,
      match: (r) => r.item.data && r.item.data.glyph,
    });
    return hit ? hit.item : null;
  };

  const drawOverlay = () => {
    clearOverlay();
    if (!group || index == null) return;
    const g = group.children.find((c) => c.data && c.data.glyph && c.data.glyphIndex === index);
    if (!g) return;
    const z = paper.view.zoom;
    overlay = new paper.Path.Rectangle(g.bounds.expand(4 / z));
    overlay.strokeColor = new paper.Color('#6f8595');
    overlay.strokeWidth = 1 / z;
    overlay.dashArray = [3 / z, 2 / z];
    overlay.data.isTextOverlay = true;
    overlay.locked = true;
    overlay.bringToFront();
  };

  return {
    cursor: 'default',

    onMouseDown(point) {
      const g = glyphAt(point);
      if (!g) {
        group = null;
        index = null;
        down = null;
        clearOverlay();
        return;
      }
      group = textEntity(g) || g.parent;
      index = g.data.glyphIndex;
      if (!group.data.glyphFx) group.data.glyphFx = {};
      startFx = { dx: 0, dy: 0, s: 1, rot: 0, ...(group.data.glyphFx[index] || {}) };
      down = point;
      drawOverlay();
    },

    onMouseDrag(point, _delta, e) {
      if (!group || index == null || !down) return;
      const total = point.subtract(down);
      const fx = { ...startFx };
      if (e && e.shiftKey) fx.s = Math.max(0.2, startFx.s * (1 - total.y * 0.01));
      else if (e && e.altKey) fx.rot = startFx.rot + total.x;
      else {
        fx.dx = startFx.dx + total.x;
        fx.dy = startFx.dy + total.y;
      }
      group.data.glyphFx[index] = fx;
      relayout(group);
      drawOverlay();
    },

    onMouseUp() {
      down = null;
    },

    onMouseHover(point) {
      return glyphAt(point) ? 'move' : 'default';
    },

    onViewChange() {
      drawOverlay();
    },

    deactivate() {
      clearOverlay();
      group = null;
      index = null;
      down = null;
    },
  };
}
