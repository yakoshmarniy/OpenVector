import paper from 'paper';

// On-screen size of resize handles, in pixels (kept constant across zoom).
const HANDLE_PX = 8;
const OVERLAY_FLAG = 'isSelectionOverlay';

const HANDLE_NAMES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

// True if the item (or any ancestor) is part of the selection overlay, so it
// can be excluded from hit-tests and, later, from export.
export function isOverlayItem(item) {
  for (let cur = item; cur; cur = cur.parent) {
    if (cur.data && cur.data[OVERLAY_FLAG]) return true;
  }
  return false;
}

function handlePoint(bounds, name) {
  switch (name) {
    case 'nw': return bounds.topLeft;
    case 'n': return bounds.topCenter;
    case 'ne': return bounds.topRight;
    case 'e': return bounds.rightCenter;
    case 'se': return bounds.bottomRight;
    case 's': return bounds.bottomCenter;
    case 'sw': return bounds.bottomLeft;
    case 'w': return bounds.leftCenter;
    default: return bounds.center;
  }
}

function normalizedRect(p1, p2) {
  const x = Math.min(p1.x, p2.x);
  const y = Math.min(p1.y, p2.y);
  const w = Math.max(1, Math.abs(p2.x - p1.x));
  const h = Math.max(1, Math.abs(p2.y - p1.y));
  return new paper.Rectangle(new paper.Point(x, y), new paper.Size(w, h));
}

/**
 * Compute the new bounds for a resize drag.
 * @param handle one of HANDLE_NAMES
 * @param ob     original bounds captured when the drag started (fixed anchor)
 * @param mouse  current pointer position (project coords)
 * @param shift  keep aspect ratio (corner handles only)
 */
export function computeResizeBounds(handle, ob, mouse, shift) {
  const isCorner = handle.length === 2;

  if (shift && isCorner) {
    const fixed = {
      nw: ob.bottomRight, ne: ob.bottomLeft, se: ob.topLeft, sw: ob.topRight,
    }[handle];
    const ratio = ob.width / ob.height;
    let dx = mouse.x - fixed.x;
    let dy = mouse.y - fixed.y;
    if (Math.abs(dx) / ratio > Math.abs(dy)) {
      dy = (dy < 0 ? -1 : 1) * (Math.abs(dx) / ratio);
    } else {
      dx = (dx < 0 ? -1 : 1) * (Math.abs(dy) * ratio);
    }
    return normalizedRect(fixed, new paper.Point(fixed.x + dx, fixed.y + dy));
  }

  let { left: l, top: t, right: r, bottom: b } = ob;
  if (handle.includes('n')) t = mouse.y;
  if (handle.includes('s')) b = mouse.y;
  if (handle.includes('w')) l = mouse.x;
  if (handle.includes('e')) r = mouse.x;
  return normalizedRect(new paper.Point(l, t), new paper.Point(r, b));
}

/**
 * Visual selection overlay: a dashed bounding box plus eight resize handles.
 * The overlay lives in the active layer but is flagged + locked so it never
 * participates in hit-tests or gets treated as user content.
 */
export function createSelection(onChange) {
  let target = null;
  let group = null;

  // Fired only when the selected item changes (not on move/resize/zoom redraws).
  function notify() {
    if (onChange) onChange(target);
  }

  function remove() {
    if (group) {
      group.remove();
      group = null;
    }
  }

  function draw() {
    remove();
    if (!target) return;

    const zoom = paper.view.zoom;
    const hs = HANDLE_PX / zoom;
    const b = target.bounds;

    group = new paper.Group();
    group.data[OVERLAY_FLAG] = true;
    group.locked = true;

    const box = new paper.Path.Rectangle(b);
    box.strokeColor = '#6f8595';
    box.strokeWidth = 1 / zoom;
    box.dashArray = [4 / zoom, 3 / zoom];
    box.fillColor = null;
    group.addChild(box);

    HANDLE_NAMES.forEach((name) => {
      const c = handlePoint(b, name);
      const h = new paper.Path.Rectangle({
        rectangle: new paper.Rectangle(c.subtract(hs / 2), new paper.Size(hs, hs)),
      });
      h.fillColor = '#cfd3d7';
      h.strokeColor = '#3a3d41';
      h.strokeWidth = 1 / zoom;
      h.data.handle = name;
      group.addChild(h);
    });

    group.bringToFront();
  }

  return {
    get target() {
      return target;
    },

    setTarget(item) {
      target = item || null;
      draw();
      notify();
    },

    clear() {
      target = null;
      remove();
      notify();
    },

    // Redraw in place (e.g. after a move/resize or a zoom change).
    draw,

    // Return the handle name under a point, or null.
    hitHandle(point) {
      if (!group) return null;
      const hs = HANDLE_PX / paper.view.zoom;
      for (const child of group.children) {
        if (child.data && child.data.handle && child.bounds.expand(hs).contains(point)) {
          return child.data.handle;
        }
      }
      return null;
    },
  };
}
