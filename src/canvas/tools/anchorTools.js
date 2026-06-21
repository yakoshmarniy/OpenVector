import paper from 'paper';

// Pen-family helpers: add / delete / convert anchor points on existing paths.

const isOverlay = (item) => {
  for (let c = item; c; c = c.parent) if (c.data && c.data.isSelectionOverlay) return true;
  return false;
};

const segmentAt = (point) => {
  const hit = paper.project.hitTest(point, {
    segments: true,
    tolerance: 8 / paper.view.zoom,
    match: (r) => !isOverlay(r.item),
  });
  return hit && hit.type === 'segment' ? hit.segment : null;
};

// Add Anchor Point — click on a path's outline to insert a new anchor there.
export function createAddAnchorTool() {
  return {
    cursor: 'copy',
    onMouseDown(point) {
      const tol = 8 / paper.view.zoom;
      let best = null;
      paper.project.getItems({ match: (it) => it.className === 'Path' && !isOverlay(it) }).forEach((p) => {
        const loc = p.getNearestLocation(point);
        if (loc) {
          const d = loc.point.getDistance(point);
          if (d <= tol && (!best || d < best.d)) best = { d, loc, path: p };
        }
      });
      if (best) best.path.divideAt(best.loc);
    },
  };
}

// Delete Anchor Point — click an anchor to remove it (path re-flows).
export function createDeleteAnchorTool() {
  return {
    cursor: 'default',
    onMouseDown(point) {
      const seg = segmentAt(point);
      if (!seg) return;
      const path = seg.path;
      if (path.segments.length <= 2) path.remove();
      else seg.remove();
    },
  };
}

// Convert Anchor Point — toggle a clicked anchor between corner and smooth.
export function createConvertAnchorTool() {
  return {
    cursor: 'default',
    onMouseDown(point) {
      const s = segmentAt(point);
      if (!s) return;
      const smooth = s.handleIn.length > 0 || s.handleOut.length > 0;
      if (smooth) {
        s.handleIn = new paper.Point(0, 0);
        s.handleOut = new paper.Point(0, 0);
      } else {
        const prev = s.previous ? s.previous.point : s.point;
        const next = s.next ? s.next.point : s.point;
        const tangent = next.subtract(prev);
        if (tangent.length === 0) return;
        const dir = tangent.normalize();
        const inLen = s.previous ? s.point.getDistance(prev) * 0.33 : 20;
        const outLen = s.next ? s.point.getDistance(next) * 0.33 : 20;
        s.handleIn = dir.multiply(-inLen);
        s.handleOut = dir.multiply(outLen);
      }
    },
  };
}
