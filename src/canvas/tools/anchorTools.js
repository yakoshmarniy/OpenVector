import paper from 'paper';
import { makeAnchorOverlay } from '../operations/anchors.js';

// Pen-family editing tools: add / delete / convert anchor points on existing
// paths. Each shows the hovered path's anchors (square = corner, diamond =
// smooth) and redraws after an edit so the change is visible.

const isOverlay = (item) => {
  for (let c = item; c; c = c.parent) if (c.data && c.data.isSelectionOverlay) return true;
  return false;
};

const segmentAt = (point) => {
  const hit = paper.project.hitTest(point, {
    segments: true,
    tolerance: 9 / paper.view.zoom,
    match: (r) => !isOverlay(r.item),
  });
  return hit && hit.type === 'segment' ? hit.segment : null;
};

// The path the cursor is over (for showing anchors). Includes a nearest-outline
// pass so it works even when hovering an unfilled path's edge.
const pathUnderCursor = (point) => {
  const tol = 8 / paper.view.zoom;
  const hit = paper.project.hitTest(point, {
    fill: true,
    stroke: true,
    tolerance: 6 / paper.view.zoom,
    match: (r) => !isOverlay(r.item),
  });
  if (hit && hit.item.className === 'Path') return hit.item;
  let best = null;
  paper.project.getItems({ match: (it) => it.className === 'Path' && !isOverlay(it) }).forEach((p) => {
    const loc = p.getNearestLocation(point);
    if (loc) {
      const d = loc.point.getDistance(point);
      if (d <= tol && (!best || d < best.d)) best = { d, path: p };
    }
  });
  return best ? best.path : null;
};

// actOnDown(point) performs the edit and returns the path to (re)show, or null.
function anchorEditor({ cursor, actOnDown }) {
  let overlay = null;
  let shown = null;

  const clear = () => {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    shown = null;
  };

  const show = (path) => {
    clear();
    if (path && path.isInserted && path.isInserted()) {
      overlay = makeAnchorOverlay(path);
      shown = path;
    }
  };

  return {
    cursor,
    onMouseDown(point) {
      const path = actOnDown(point);
      show(path);
    },
    onMouseHover(point) {
      const p = pathUnderCursor(point);
      if (p !== shown) show(p);
      return cursor;
    },
    onViewChange() {
      if (shown) show(shown);
    },
    deactivate() {
      clear();
    },
  };
}

export function createAddAnchorTool() {
  return anchorEditor({
    cursor: 'copy',
    actOnDown(point) {
      const tol = 8 / paper.view.zoom;
      let best = null;
      paper.project.getItems({ match: (it) => it.className === 'Path' && !isOverlay(it) }).forEach((p) => {
        const loc = p.getNearestLocation(point);
        if (loc) {
          const d = loc.point.getDistance(point);
          if (d <= tol && (!best || d < best.d)) best = { d, loc, path: p };
        }
      });
      if (best) {
        best.path.divideAt(best.loc);
        return best.path;
      }
      return pathUnderCursor(point);
    },
  });
}

export function createDeleteAnchorTool() {
  return anchorEditor({
    cursor: 'default',
    actOnDown(point) {
      const seg = segmentAt(point);
      if (!seg) return pathUnderCursor(point);
      const path = seg.path;
      if (path.segments.length <= 2) {
        path.remove();
        return null;
      }
      seg.remove();
      return path;
    },
  });
}

export function createConvertAnchorTool() {
  return anchorEditor({
    cursor: 'default',
    actOnDown(point) {
      const s = segmentAt(point);
      if (!s) return pathUnderCursor(point);
      const smooth = s.handleIn.length > 0 || s.handleOut.length > 0;
      if (smooth) {
        s.handleIn = new paper.Point(0, 0);
        s.handleOut = new paper.Point(0, 0);
      } else {
        const prev = s.previous ? s.previous.point : s.point;
        const next = s.next ? s.next.point : s.point;
        const tangent = next.subtract(prev);
        if (tangent.length > 0) {
          const dir = tangent.normalize();
          const inLen = s.previous ? s.point.getDistance(prev) * 0.33 : 20;
          const outLen = s.next ? s.point.getDistance(next) * 0.33 : 20;
          s.handleIn = dir.multiply(-inLen);
          s.handleOut = dir.multiply(outLen);
        }
      }
      return s.path;
    },
  });
}
