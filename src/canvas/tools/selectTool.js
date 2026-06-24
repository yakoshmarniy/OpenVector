import paper from 'paper';
import {
  createSelection,
  pickItem,
  computeResizeBounds,
  isOverlayItem,
} from '../operations/selection.js';
import { runSelectionAction } from '../operations/selectionActions.js';
import { snapMove } from '../operations/snapping.js';
import {
  isLiveRect,
  rectAxisAligned,
  setRadius,
  radiusWidgetPoint,
} from '../operations/liveShape.js';

// A curved-arrow cursor for the rotate zone (data-URI SVG, falls back to grab).
const ROTATE_CURSOR =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>"
  + "<g fill='none' stroke='black' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'>"
  + "<path d='M6 10a7 7 0 1 1 0 4'/><path d='M6 6v5h5'/></g>"
  + "<g fill='none' stroke='white' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'>"
  + "<path d='M6 10a7 7 0 1 1 0 4'/><path d='M6 6v5h5'/></g></svg>\") 12 12, grab";

function normRect(a, b) {
  return new paper.Rectangle(
    new paper.Point(Math.min(a.x, b.x), Math.min(a.y, b.y)),
    new paper.Size(Math.abs(b.x - a.x), Math.abs(b.y - a.y)),
  );
}

const HANDLE_CURSOR = {
  nw: 'nwse-resize', se: 'nwse-resize',
  ne: 'nesw-resize', sw: 'nesw-resize',
  n: 'ns-resize', s: 'ns-resize',
  e: 'ew-resize', w: 'ew-resize',
};

/**
 * Select tool — click to select, Shift+click to add/remove, drag empty space
 * for a marquee, drag the body to move (snapping to grid/objects when enabled),
 * drag a handle to resize. runAction() does align/distribute/group/booleans.
 */
export function createSelectTool(ctx = {}) {
  const selection = createSelection(ctx.onSelectionChange, ctx.onSelectionBounds);
  let mode = null; // 'move' | 'resize' | 'marquee' | null
  let activeHandle = null;
  let originalBounds = null;
  let marqueeStart = null;
  let marqueePath = null;
  let marqueeAdditive = false;
  // Absolute-move bookkeeping (so snapping is stable, not drift-prone).
  let moveStart = null;
  let moveOrigin = [];
  let moveUnion = null;
  let guides = null;
  // Rotation (drag just outside a corner): fixed centre + accumulated angle.
  let rotateCenter = null;
  let rotateStart = 0;
  let rotateApplied = 0;
  // Live-shape corner-radius widget.
  let widget = null;
  let radiusItem = null;

  const clearMarquee = () => {
    if (marqueePath) {
      marqueePath.remove();
      marqueePath = null;
    }
  };

  const drawMarquee = (rect) => {
    clearMarquee();
    const z = paper.view.zoom;
    marqueePath = new paper.Path.Rectangle(rect);
    marqueePath.strokeColor = '#6f8595';
    marqueePath.strokeWidth = 1 / z;
    marqueePath.dashArray = [3 / z, 2 / z];
    marqueePath.fillColor = new paper.Color(0.43, 0.52, 0.59, 0.12);
    marqueePath.data.isSelectionOverlay = true;
    marqueePath.locked = true;
    marqueePath.bringToFront();
  };

  const clearGuides = () => {
    if (guides) {
      guides.remove();
      guides = null;
    }
  };

  const drawGuides = (xs, ys) => {
    clearGuides();
    if (!xs.length && !ys.length) return;
    const vb = paper.view.bounds;
    const z = paper.view.zoom;
    guides = new paper.Group();
    guides.data.isSelectionOverlay = true;
    guides.locked = true;
    xs.forEach((x) => {
      const l = new paper.Path.Line(new paper.Point(x, vb.top), new paper.Point(x, vb.bottom));
      l.strokeColor = '#8a9aa8';
      l.strokeWidth = 1 / z;
      guides.addChild(l);
    });
    ys.forEach((y) => {
      const l = new paper.Path.Line(new paper.Point(vb.left, y), new paper.Point(vb.right, y));
      l.strokeColor = '#8a9aa8';
      l.strokeWidth = 1 / z;
      guides.addChild(l);
    });
    guides.bringToFront();
  };

  // A point just OUTSIDE a corner of the selection box → rotate zone.
  const rotateZone = (point) => {
    if (!selection.targets.length) return null;
    const b = selection.bounds;
    if (!b || b.contains(point)) return null;
    const z = paper.view.zoom;
    const hs = 8 / z;
    const margin = 26 / z;
    const corners = { nw: b.topLeft, ne: b.topRight, se: b.bottomRight, sw: b.bottomLeft };
    let best = null;
    Object.keys(corners).forEach((k) => {
      const d = point.getDistance(corners[k]);
      if (d > hs && d <= margin && (!best || d < best.d)) best = { k, d };
    });
    return best ? best.k : null;
  };

  // Live-rectangle corner-radius widget (shown for a single axis-aligned live rect).
  const clearWidget = () => {
    if (widget) {
      widget.remove();
      widget = null;
    }
    radiusItem = null;
  };

  const drawWidget = () => {
    clearWidget();
    const t = selection.targets.length === 1 ? selection.targets[0] : null;
    if (!t || !isLiveRect(t) || !rectAxisAligned(t)) return;
    radiusItem = t;
    const z = paper.view.zoom;
    const s = 5 / z;
    const c = radiusWidgetPoint(t);
    widget = new paper.Path.Circle({ center: c, radius: s });
    widget.fillColor = new paper.Color('#cfd3d7');
    widget.strokeColor = new paper.Color('#3a3d41');
    widget.strokeWidth = 1 / z;
    widget.data.isSelectionOverlay = true;
    widget.locked = true;
    widget.bringToFront();
  };

  const widgetHit = (point) => {
    if (!widget || !radiusItem) return false;
    return widget.bounds.expand(8 / paper.view.zoom).contains(point);
  };

  return {
    cursor: 'default',

    onMouseDown(point, e) {
      // Live-rect corner-radius widget sits inside the box, so check it first.
      if (widgetHit(point)) {
        mode = 'radius';
        return;
      }
      clearWidget();

      const handle = selection.hitHandle(point);
      if (handle && selection.target) {
        mode = 'resize';
        activeHandle = handle;
        originalBounds = selection.target.bounds.clone();
        return;
      }

      // Drag just outside a corner → rotate around the selection centre.
      if (rotateZone(point)) {
        mode = 'rotate';
        rotateCenter = selection.bounds.center;
        rotateStart = point.subtract(rotateCenter).angle;
        rotateApplied = 0;
        return;
      }

      const item = pickItem(point);
      const additive = !!(e && e.shiftKey);

      if (item) {
        if (additive) {
          selection.toggle(item);
          mode = null;
        } else {
          if (!selection.has(item)) selection.setTarget(item);
          // Alt+drag leaves the originals and moves duplicates.
          if (e && e.altKey) selection.setTargets(selection.targets.map((t) => t.clone()));
          mode = 'move';
          moveStart = point;
          moveOrigin = selection.targets.map((t) => t.position.clone());
          moveUnion = selection.bounds;
        }
      } else {
        if (!additive) selection.clear();
        mode = 'marquee';
        marqueeStart = point;
        marqueeAdditive = additive;
      }
    },

    onMouseDrag(point, delta, e) {
      if (mode === 'move' && selection.targets.length && moveUnion) {
        let raw = point.subtract(moveStart);
        // Shift constrains the move to the horizontal or vertical axis.
        if (e && e.shiftKey) {
          raw = Math.abs(raw.x) >= Math.abs(raw.y)
            ? new paper.Point(raw.x, 0)
            : new paper.Point(0, raw.y);
        }
        const snap = ctx.getSnap ? ctx.getSnap() : { grid: false, objects: false };
        const { dx, dy, guideXs, guideYs } = snapMove(moveUnion, raw, snap, selection.targets);
        const d = new paper.Point(dx, dy);
        selection.targets.forEach((t, i) => {
          t.position = moveOrigin[i].add(d);
        });
        selection.draw();
        drawGuides(guideXs, guideYs);
      } else if (mode === 'resize' && selection.target && originalBounds) {
        if (originalBounds.width < 1e-3 || originalBounds.height < 1e-3) return;
        selection.target.bounds = computeResizeBounds(
          activeHandle,
          originalBounds,
          point,
          !!(e && e.shiftKey),
          !!(e && e.altKey),
        );
        selection.draw();
      } else if (mode === 'rotate' && rotateCenter) {
        const cur = point.subtract(rotateCenter).angle;
        let desired = cur - rotateStart;
        if (e && e.shiftKey) desired = Math.round(desired / 15) * 15;
        const step = desired - rotateApplied;
        if (step) {
          selection.targets.forEach((t) => t.rotate(step, rotateCenter));
          rotateApplied = desired;
          selection.draw();
        }
      } else if (mode === 'radius' && radiusItem) {
        const b = radiusItem.bounds;
        setRadius(radiusItem, Math.min(point.x - b.left, point.y - b.top));
        selection.draw();
        drawWidget();
      } else if (mode === 'marquee' && marqueeStart) {
        drawMarquee(normRect(marqueeStart, point));
      }
    },

    onMouseUp(point) {
      if (mode === 'marquee') {
        clearMarquee();
        if (marqueeStart && point) {
          const rect = normRect(marqueeStart, point);
          if (rect.width > 2 || rect.height > 2) {
            const hits = paper.project.activeLayer.children.filter(
              (it) => !isOverlayItem(it) && rect.intersects(it.bounds),
            );
            if (marqueeAdditive) hits.forEach((h) => !selection.has(h) && selection.toggle(h));
            else selection.setTargets(hits);
          }
        }
        marqueeStart = null;
        marqueeAdditive = false;
      }
      clearGuides();
      mode = null;
      activeHandle = null;
      originalBounds = null;
      moveStart = null;
      moveOrigin = [];
      moveUnion = null;
      rotateCenter = null;
      drawWidget();
    },

    onMouseHover(point) {
      if (widgetHit(point)) return 'pointer';
      const handle = selection.hitHandle(point);
      if (handle) return HANDLE_CURSOR[handle];
      if (rotateZone(point)) return ROTATE_CURSOR;
      return pickItem(point) ? 'move' : 'default';
    },

    onKeyDown(e) {
      if (!selection.targets.length) return;
      // Arrow keys nudge the selection (Shift = larger step).
      const nudge = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.code];
      if (nudge) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const d = new paper.Point(nudge[0] * step, nudge[1] * step);
        selection.targets.forEach((t) => {
          t.position = t.position.add(d);
        });
        selection.draw();
        drawWidget();
        return;
      }
      if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        selection.targets.forEach((t) => t.remove());
        selection.clear();
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
      clearMarquee();
      clearGuides();
      clearWidget();
      selection.clear();
    },
  };
}
