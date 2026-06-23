import paper from 'paper';

const HANDLE_PX = 7;

const col = (c) => new paper.Color(c);

const isOverlay = (item) => {
  for (let c = item; c; c = c.parent) if (c.data && c.data.isSelectionOverlay) return true;
  return false;
};

// A path whose anchor points can be lassoed: a real Path, not an overlay, not
// locked, and not part of a text block (glyph guides etc.).
const isEditablePath = (it) => {
  if (it.className !== 'Path' || it.locked || isOverlay(it)) return false;
  for (let c = it; c; c = c.parent) if (c.data && (c.data.isText || c.data.isTextGuide)) return false;
  return true;
};

const editablePaths = () =>
  paper.project.getItems({ match: (it) => it.className === 'Path' && isEditablePath(it) });

// Lasso — drag a freehand loop to select the ANCHOR POINTS inside it (across any
// number of paths), like a freehand Direct Selection. Drag a selected point to
// move all selected points; Backspace/Delete removes them; Shift adds to the set.
export function createLassoTool() {
  const selected = new Set(); // selected segment objects
  let overlay = null;
  let loop = null; // freehand selection path while dragging
  let additive = false;
  let dragging = false; // moving the selected points

  const clearOverlay = () => {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  };

  const clearLoop = () => {
    if (loop) {
      loop.remove();
      loop = null;
    }
  };

  // Drop segments whose path was removed so the set stays valid.
  const prune = () => {
    [...selected].forEach((sg) => {
      if (!sg.path || !sg.path.isInserted || !sg.path.isInserted()) selected.delete(sg);
    });
  };

  const draw = () => {
    clearOverlay();
    prune();
    if (!selected.size) return;
    const z = paper.view.zoom;
    const s = HANDLE_PX / z;
    overlay = new paper.Group();
    overlay.data.isSelectionOverlay = true;
    overlay.locked = true;

    const paths = new Set();
    selected.forEach((sg) => paths.add(sg.path));
    paths.forEach((p) => {
      const outline = p.clone({ insert: false });
      outline.fillColor = null;
      outline.strokeColor = col('#6f8595');
      outline.strokeWidth = 1 / z;
      outline.dashArray = [3 / z, 2 / z];
      overlay.addChild(outline);
      p.segments.forEach((sg) => {
        const on = selected.has(sg);
        const h = new paper.Path.Rectangle({
          rectangle: new paper.Rectangle(sg.point.subtract(s / 2), new paper.Size(s, s)),
        });
        h.fillColor = on ? col('#cfd3d7') : null;
        h.strokeColor = col(on ? '#3a3d41' : '#6f8595');
        h.strokeWidth = 1 / z;
        overlay.addChild(h);
      });
    });
    overlay.bringToFront();
  };

  const segmentAt = (point) => {
    const hit = paper.project.hitTest(point, {
      segments: true,
      tolerance: HANDLE_PX / paper.view.zoom,
      match: (r) => isEditablePath(r.item),
    });
    return hit && hit.type === 'segment' ? hit.segment : null;
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point, e) {
      // Click a point that's already selected → move the selected points.
      const seg = segmentAt(point);
      if (seg && selected.has(seg)) {
        dragging = true;
        return;
      }
      // Otherwise begin a freehand selection loop.
      dragging = false;
      additive = !!(e && e.shiftKey);
      clearLoop();
      const z = paper.view.zoom;
      loop = new paper.Path([point]);
      loop.strokeColor = col('#6f8595');
      loop.strokeWidth = 1 / z;
      loop.dashArray = [3 / z, 2 / z];
      loop.fillColor = new paper.Color(0.43, 0.52, 0.59, 0.1);
      loop.data.isSelectionOverlay = true;
      loop.locked = true;
    },

    onMouseDrag(point, delta) {
      if (dragging) {
        selected.forEach((sg) => {
          sg.point = sg.point.add(delta);
        });
        draw();
      } else if (loop) {
        loop.add(point);
      }
    },

    onMouseUp() {
      if (dragging) {
        dragging = false;
        return;
      }
      if (!loop) return;
      loop.closed = true;
      const region = loop;
      if (!additive) selected.clear();
      editablePaths().forEach((p) => {
        p.segments.forEach((sg) => {
          if (region.contains(sg.point)) selected.add(sg);
        });
      });
      clearLoop();
      draw();
    },

    onMouseHover(point) {
      const seg = segmentAt(point);
      return seg && selected.has(seg) ? 'move' : 'crosshair';
    },

    onKeyDown(e) {
      if (!selected.size) return;
      if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        selected.forEach((sg) => {
          const p = sg.path;
          if (!p) return;
          if (p.segments.length <= 2) p.remove();
          else sg.remove();
        });
        selected.clear();
        draw();
      } else if (e.code === 'Escape') {
        selected.clear();
        draw();
      }
    },

    onViewChange() {
      draw();
    },

    refreshSelection() {
      draw();
    },

    deactivate() {
      clearLoop();
      clearOverlay();
      selected.clear();
      dragging = false;
    },
  };
}
