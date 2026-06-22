import paper from 'paper';

// Shared helpers for the free-drawing tools (Pencil, Paintbrush, Blob Brush,
// Smooth, Path Eraser, Join). Kept here so each tool file stays tiny.

// Wrap a colour string in a real Color up front — assigning a colour *string*
// stores it lazily and a later colour write before render throws inside Paper.
export const col = (css) => new paper.Color(css);

export function overlayed(item) {
  for (let c = item; c; c = c.parent) {
    if (c.data && c.data.isSelectionOverlay) return true;
  }
  return false;
}

// Topmost editable Path under the cursor: hit-test fill/stroke first, then fall
// back to the nearest path edge within `tolPx` screen pixels.
export function pathAt(point, tolPx = 8) {
  const z = paper.view.zoom;
  const hit = paper.project.hitTest(point, {
    fill: true,
    stroke: true,
    tolerance: 6 / z,
    match: (r) => !overlayed(r.item),
  });
  if (hit && hit.item.className === 'Path') return hit.item;

  const tol = tolPx / z;
  let best = null;
  paper.project
    .getItems({ match: (it) => it.className === 'Path' && !overlayed(it) })
    .forEach((p) => {
      const loc = p.getNearestLocation(point);
      if (loc) {
        const d = loc.point.getDistance(point);
        if (d <= tol && (!best || d < best.d)) best = { d, path: p };
      }
    });
  return best ? best.path : null;
}

/**
 * Generic freehand brush: drag lays down points, mouse-up fits Bézier curves
 * through them (path.simplify). Pencil and Paintbrush are thin wrappers.
 */
export function createBrush({ stroke, width, simplify = 2.5, cap = 'round' }) {
  let path = null;

  const drop = () => {
    if (path) path.remove();
    path = null;
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      path = new paper.Path();
      path.strokeColor = col(stroke);
      path.strokeWidth = width;
      path.strokeCap = cap;
      path.strokeJoin = 'round';
      path.add(point);
    },

    onMouseDrag(point) {
      if (path) path.add(point);
    },

    onMouseUp() {
      if (!path) return;
      if (path.segments.length < 2) {
        drop();
        return;
      }
      path.simplify(simplify);
      path = null;
    },

    deactivate() {
      if (path && path.segments.length < 2) drop();
      else path = null;
    },
  };
}
