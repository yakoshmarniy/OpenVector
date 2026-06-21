import paper from 'paper';
import {
  createSelection,
  pickItem,
  computeResizeBounds,
  isOverlayItem,
} from '../operations/selection.js';
import { groupItems, ungroupItems, booleanOp } from '../operations/booleans.js';
import { alignItems, distributeItems } from '../operations/align.js';
import { snapMove } from '../operations/snapping.js';

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

const ALIGN_MODES = {
  alignLeft: 'left', alignHCenter: 'hcenter', alignRight: 'right',
  alignTop: 'top', alignVCenter: 'vcenter', alignBottom: 'bottom',
};

/**
 * Select tool — click to select, Shift+click to add/remove, drag empty space
 * for a marquee, drag the body to move (snapping to grid/objects when enabled),
 * drag a handle to resize. runAction() does align/distribute/group/booleans.
 */
export function createSelectTool(ctx = {}) {
  const selection = createSelection(ctx.onSelectionChange);
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

  return {
    cursor: 'default',

    onMouseDown(point, e) {
      const handle = selection.hitHandle(point);
      if (handle && selection.target) {
        mode = 'resize';
        activeHandle = handle;
        originalBounds = selection.target.bounds.clone();
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
        const raw = point.subtract(moveStart);
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
        );
        selection.draw();
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
    },

    onMouseHover(point) {
      const handle = selection.hitHandle(point);
      if (handle) return HANDLE_CURSOR[handle];
      return pickItem(point) ? 'move' : 'default';
    },

    onKeyDown(e) {
      if (!selection.targets.length) return;
      if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        selection.targets.forEach((t) => t.remove());
        selection.clear();
      } else if (e.code === 'Escape') {
        selection.clear();
      }
    },

    runAction(name) {
      const items = selection.targets.slice();
      if (ALIGN_MODES[name]) {
        alignItems(items, ALIGN_MODES[name]);
        selection.draw();
      } else if (name === 'distributeH') {
        distributeItems(items, 'h');
        selection.draw();
      } else if (name === 'distributeV') {
        distributeItems(items, 'v');
        selection.draw();
      } else if (name === 'group') {
        const g = groupItems(items);
        if (g) selection.setTarget(g);
      } else if (name === 'ungroup') {
        const kids = ungroupItems(items[0]);
        if (kids) selection.setTargets(kids);
      } else {
        const result = booleanOp(items, name);
        if (result) selection.setTarget(result);
      }
    },

    onViewChange() {
      selection.draw();
    },

    refreshSelection() {
      selection.draw();
    },

    deactivate() {
      clearMarquee();
      clearGuides();
      selection.clear();
    },
  };
}
