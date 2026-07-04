import paper from 'paper';
import { createSelection, pickItem, addOverlay } from '../operations/selection.js';
import { runSelectionAction } from '../operations/selectionActions.js';
import {
  unionBounds,
  collectPaths,
  snapshotPaths,
  distortPaths,
} from '../operations/transform.js';

// Free Transform tool. Every gesture starts from the selection's axis-aligned
// bounds and drags one handle of a quad; path geometry is remapped from the
// original rect to the quad (restored from a snapshot each frame, so the drag
// always distorts the ORIGINAL shape). Modifiers, Illustrator-style:
//   corner drag             → scale (Shift = keep ratio)
//   ⌘ + corner drag         → free distort (that corner only)
//   ⌘⇧ + corner drag        → perspective (mirror corner moves opposite)
//   edge drag               → scale one axis
//   ⌘ + edge drag           → skew along the edge
// Only Path geometry distorts; text groups are ignored by design (v1).

const HANDLE_PX = 8;
const CORNERS = ['tl', 'tr', 'br', 'bl'];
const EDGES = ['n', 'e', 's', 'w'];
// Corner pairs sharing an edge, per axis of mirroring for perspective.
const MIRROR_H = { tl: 'tr', tr: 'tl', bl: 'br', br: 'bl' };
const MIRROR_V = { tl: 'bl', bl: 'tl', tr: 'br', br: 'tr' };
const EDGE_CORNERS = { n: ['tl', 'tr'], e: ['tr', 'br'], s: ['bl', 'br'], w: ['tl', 'bl'] };

export function createFreeTransformTool(ctx = {}) {
  let widget = null;
  let mode = null; // 'corner' | 'edge' | null
  let handle = null;
  let srcRect = null;
  let quad = null;
  let snapshot = null;
  let start = null;

  const selection = createSelection(() => drawWidget());

  const quadFromRect = (r) => ({
    tl: r.topLeft.clone(),
    tr: r.topRight.clone(),
    br: r.bottomRight.clone(),
    bl: r.bottomLeft.clone(),
  });

  const edgeMid = (q, e) => {
    const [a, b] = EDGE_CORNERS[e];
    return q[a].add(q[b]).divide(2);
  };

  const clearWidget = () => {
    if (widget) {
      widget.remove();
      widget = null;
    }
  };

  function drawWidget() {
    clearWidget();
    const q = quad || (selection.targets.length ? quadFromRect(unionBounds(selection.targets)) : null);
    if (!q) return;
    const z = paper.view.zoom;
    const hs = HANDLE_PX / z;
    widget = new paper.Group();
    const outline = new paper.Path({
      segments: [q.tl, q.tr, q.br, q.bl],
      closed: true,
    });
    outline.strokeColor = new paper.Color('#7fd4ff');
    outline.strokeWidth = 1 / z;
    outline.fillColor = null;
    widget.addChild(outline);
    CORNERS.forEach((name) => {
      const h = new paper.Path.Rectangle({
        rectangle: new paper.Rectangle(q[name].subtract(hs / 2), new paper.Size(hs, hs)),
      });
      h.fillColor = new paper.Color('#cfd3d7');
      h.strokeColor = new paper.Color('#3a3d41');
      h.strokeWidth = 1 / z;
      h.data.ftHandle = name;
      widget.addChild(h);
    });
    EDGES.forEach((name) => {
      const c = edgeMid(q, name);
      const h = new paper.Path.Circle({ center: c, radius: hs / 2.4 });
      h.fillColor = new paper.Color('#cfd3d7');
      h.strokeColor = new paper.Color('#3a3d41');
      h.strokeWidth = 1 / z;
      h.data.ftHandle = name;
      widget.addChild(h);
    });
    addOverlay(widget);
    widget.bringToFront();
  }

  // The store only notifies on changes — draw for the selection we start with.
  drawWidget();

  const hitHandle = (point) => {
    if (!widget) return null;
    const hs = HANDLE_PX / paper.view.zoom;
    for (const child of widget.children) {
      if (child.data && child.data.ftHandle && child.bounds.expand(hs).contains(point)) {
        return child.data.ftHandle;
      }
    }
    return null;
  };

  return {
    cursor: 'default',

    onMouseDown(point, e) {
      const hit = hitHandle(point);
      if (hit && selection.targets.length) {
        srcRect = unionBounds(selection.targets);
        quad = quadFromRect(srcRect);
        snapshot = snapshotPaths(collectPaths(selection.targets));
        start = point;
        handle = hit;
        mode = CORNERS.includes(hit) ? 'corner' : 'edge';
        return;
      }
      // Not on a handle: (re)pick the object under the cursor.
      const item = pickItem(point);
      if (item) {
        if (!selection.has(item)) selection.setTarget(item);
      } else if (!(e && e.shiftKey)) {
        selection.clear();
      }
      quad = null;
      drawWidget();
    },

    onMouseDrag(point, delta, e) {
      if (!mode || !snapshot) return;
      const meta = !!(e && (e.metaKey || e.ctrlKey));
      const shift = !!(e && e.shiftKey);
      const q = quadFromRect(srcRect);
      const d = point.subtract(start);

      if (mode === 'corner') {
        if (meta && shift) {
          // Perspective: the dragged corner moves, its neighbour along the
          // drag axis mirrors the movement.
          if (Math.abs(d.x) >= Math.abs(d.y)) {
            q[handle].x += d.x;
            q[MIRROR_H[handle]].x -= d.x;
          } else {
            q[handle].y += d.y;
            q[MIRROR_V[handle]].y -= d.y;
          }
        } else if (meta) {
          // Free distort: only the grabbed corner follows the mouse.
          q[handle] = q[handle].add(d);
        } else {
          // Scale: opposite corner is fixed.
          const opposite = { tl: 'br', tr: 'bl', br: 'tl', bl: 'tr' }[handle];
          const fix = q[opposite];
          let nx = point.x;
          let ny = point.y;
          if (shift) {
            const ratio = srcRect.width / (srcRect.height || 1);
            const dx = nx - fix.x;
            const dy = ny - fix.y;
            if (Math.abs(dx) / ratio > Math.abs(dy)) ny = fix.y + Math.sign(dy || 1) * (Math.abs(dx) / ratio);
            else nx = fix.x + Math.sign(dx || 1) * (Math.abs(dy) * ratio);
          }
          const cornerX = handle === 'tl' || handle === 'bl' ? srcRect.left : srcRect.right;
          const cornerY = handle === 'tl' || handle === 'tr' ? srcRect.top : srcRect.bottom;
          const sx = (nx - fix.x) / (cornerX - fix.x || 1);
          const sy = (ny - fix.y) / (cornerY - fix.y || 1);
          CORNERS.forEach((name) => {
            q[name] = new paper.Point(
              fix.x + (q[name].x - fix.x) * sx,
              fix.y + (q[name].y - fix.y) * sy,
            );
          });
        }
      } else if (mode === 'edge') {
        if (meta) {
          // Skew: slide the edge's two corners along the edge direction.
          const [a, b] = EDGE_CORNERS[handle];
          const along = handle === 'n' || handle === 's'
            ? new paper.Point(d.x, 0)
            : new paper.Point(0, d.y);
          q[a] = q[a].add(along);
          q[b] = q[b].add(along);
        } else {
          // Scale one axis; the opposite edge stays.
          if (handle === 'n') {
            const s = (point.y - srcRect.bottom) / (srcRect.top - srcRect.bottom || 1);
            q.tl.y = srcRect.bottom + (srcRect.top - srcRect.bottom) * s;
            q.tr.y = q.tl.y;
          } else if (handle === 's') {
            const s = (point.y - srcRect.top) / (srcRect.bottom - srcRect.top || 1);
            q.bl.y = srcRect.top + (srcRect.bottom - srcRect.top) * s;
            q.br.y = q.bl.y;
          } else if (handle === 'w') {
            const s = (point.x - srcRect.right) / (srcRect.left - srcRect.right || 1);
            q.tl.x = srcRect.right + (srcRect.left - srcRect.right) * s;
            q.bl.x = q.tl.x;
          } else if (handle === 'e') {
            const s = (point.x - srcRect.left) / (srcRect.right - srcRect.left || 1);
            q.tr.x = srcRect.left + (srcRect.right - srcRect.left) * s;
            q.br.x = q.tr.x;
          }
        }
      }

      quad = q;
      distortPaths(snapshot, srcRect, quad);
      selection.draw();
      drawWidget();
    },

    onMouseUp() {
      if (mode) {
        // Bake the gesture: the next one starts from fresh bounds.
        mode = null;
        handle = null;
        snapshot = null;
        quad = null;
        srcRect = null;
        selection.draw();
        drawWidget();
      }
    },

    onMouseHover(point) {
      return hitHandle(point) ? 'pointer' : pickItem(point) ? 'move' : 'default';
    },

    onKeyDown(e) {
      if ((e.code === 'Delete' || e.code === 'Backspace') && selection.targets.length) {
        e.preventDefault();
        runSelectionAction(selection, 'delete');
        clearWidget();
      } else if (e.code === 'Escape') {
        selection.clear();
        clearWidget();
      }
    },

    runAction(name) {
      runSelectionAction(selection, name);
    },

    onViewChange() {
      selection.draw();
      drawWidget();
    },

    refreshSelection() {
      selection.draw();
      drawWidget();
    },

    deactivate() {
      clearWidget();
      selection.dispose();
    },
  };
}
