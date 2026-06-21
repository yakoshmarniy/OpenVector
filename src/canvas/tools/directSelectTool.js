import paper from 'paper';

const HANDLE_PX = 7;

const isOverlay = (item) => {
  for (let c = item; c; c = c.parent) if (c.data && c.data.isSelectionOverlay) return true;
  return false;
};

// Direct Selection — click a path to reveal its anchor points, drag a point to
// reshape it. (Bézier handle editing is a later iteration.)
export function createDirectSelectTool() {
  let path = null;
  let overlay = null;
  let seg = null;

  const clearOverlay = () => {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  };

  const drawAnchors = () => {
    clearOverlay();
    if (!path || !path.segments) return;
    const z = paper.view.zoom;
    const s = HANDLE_PX / z;
    overlay = new paper.Group();
    overlay.data.isSelectionOverlay = true;
    overlay.locked = true;
    const outline = path.clone({ insert: false });
    outline.fillColor = null;
    outline.strokeColor = new paper.Color('#6f8595');
    outline.strokeWidth = 1 / z;
    outline.dashArray = [3 / z, 2 / z];
    overlay.addChild(outline);
    path.segments.forEach((sg) => {
      const h = new paper.Path.Rectangle({
        rectangle: new paper.Rectangle(sg.point.subtract(s / 2), new paper.Size(s, s)),
      });
      h.fillColor = new paper.Color('#cfd3d7');
      h.strokeColor = new paper.Color('#3a3d41');
      h.strokeWidth = 1 / z;
      overlay.addChild(h);
    });
    overlay.bringToFront();
  };

  const setPath = (p) => {
    path = p && p.className === 'Path' ? p : null;
    drawAnchors();
  };

  return {
    cursor: 'default',

    onMouseDown(point) {
      const z = paper.view.zoom;
      const segHit = paper.project.hitTest(point, {
        segments: true,
        tolerance: HANDLE_PX / z,
        match: (r) => !isOverlay(r.item),
      });
      if (segHit && segHit.type === 'segment') {
        if (segHit.segment.path !== path) setPath(segHit.segment.path);
        seg = segHit.segment;
        return;
      }
      const hit = paper.project.hitTest(point, {
        fill: true,
        stroke: true,
        tolerance: 6 / z,
        match: (r) => !isOverlay(r.item),
      });
      setPath(hit ? hit.item : null);
      seg = null;
    },

    onMouseDrag(point, delta) {
      if (seg) {
        seg.point = seg.point.add(delta);
        drawAnchors();
      }
    },

    onMouseUp() {
      seg = null;
    },

    onKeyDown(e) {
      if (e.code === 'Escape') setPath(null);
    },

    onViewChange() {
      drawAnchors();
    },

    deactivate() {
      clearOverlay();
      path = null;
      seg = null;
    },
  };
}
