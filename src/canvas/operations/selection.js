import paper from 'paper';
import { hitRegion, isTextItem } from './textLayout.js';

// On-screen size of resize handles, in pixels (kept constant across zoom).
const HANDLE_PX = 8;
const OVERLAY_FLAG = 'isSelectionOverlay';

const HANDLE_NAMES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

export function isOverlayItem(item) {
  for (let cur = item; cur; cur = cur.parent) {
    if (cur.data && cur.data[OVERLAY_FLAG]) return true;
  }
  return false;
}

// Walk up to the item that sits directly in a layer (so clicking a child of a
// group — or a glyph of a text group — selects the whole top-level object).
function topLevel(item) {
  let it = item;
  while (it && it.parent && !(it.parent instanceof paper.Layer)) it = it.parent;
  return it;
}

// Topmost user item under a point. Paper's hit-test barely registers text
// (glyphs only), so fall back to the text region for clicks anywhere in it.
export function pickItem(point) {
  const hit = paper.project.hitTest(point, {
    fill: true,
    stroke: true,
    tolerance: 6 / paper.view.zoom,
    match: (r) => !isOverlayItem(r.item),
  });
  if (hit) return topLevel(hit.item);

  const texts = paper.project.getItems({ match: (it) => isTextItem(it) });
  for (let i = texts.length - 1; i >= 0; i -= 1) {
    if (!isOverlayItem(texts[i]) && hitRegion(texts[i]).contains(point)) return texts[i];
  }
  return null;
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

export function computeResizeBounds(handle, ob, mouse, shift) {
  const isCorner = handle.length === 2;
  if (shift && isCorner) {
    const fixed = {
      nw: ob.bottomRight, ne: ob.bottomLeft, se: ob.topLeft, sw: ob.topRight,
    }[handle];
    const ratio = ob.width / ob.height;
    let dx = mouse.x - fixed.x;
    let dy = mouse.y - fixed.y;
    if (Math.abs(dx) / ratio > Math.abs(dy)) dy = (dy < 0 ? -1 : 1) * (Math.abs(dx) / ratio);
    else dx = (dx < 0 ? -1 : 1) * (Math.abs(dy) * ratio);
    return normalizedRect(fixed, new paper.Point(fixed.x + dx, fixed.y + dy));
  }
  let { left: l, top: t, right: r, bottom: b } = ob;
  if (handle.includes('n')) t = mouse.y;
  if (handle.includes('s')) b = mouse.y;
  if (handle.includes('w')) l = mouse.x;
  if (handle.includes('e')) r = mouse.x;
  return normalizedRect(new paper.Point(l, t), new paper.Point(r, b));
}

function unionBounds(items) {
  let b = items[0].bounds.clone();
  for (let i = 1; i < items.length; i += 1) b = b.unite(items[i].bounds);
  return b;
}

/**
 * Selection overlay supporting one or many targets. A single target shows the
 * dashed box plus eight resize handles; multiple targets show a thin box per
 * item plus the union box (move-only, no per-item resize).
 */
export function createSelection(onChange, onBounds) {
  let targets = [];
  let group = null;

  function notify() {
    if (onChange) onChange(targets.slice());
  }

  // Report the selection's on-screen (view) rect for the contextual task bar.
  function reportBounds() {
    if (!onBounds) return;
    if (!targets.length) {
      onBounds(null);
      return;
    }
    const b = unionBounds(targets);
    const tl = paper.view.projectToView(b.topLeft);
    const br = paper.view.projectToView(b.bottomRight);
    onBounds({ x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y });
  }

  function remove() {
    if (group) {
      group.remove();
      group = null;
    }
  }

  function draw() {
    remove();
    if (!targets.length) {
      reportBounds();
      return;
    }
    const zoom = paper.view.zoom;
    const hs = HANDLE_PX / zoom;

    group = new paper.Group();
    group.data[OVERLAY_FLAG] = true;
    group.locked = true;

    if (targets.length > 1) {
      targets.forEach((t) => {
        const ib = new paper.Path.Rectangle(t.bounds);
        ib.strokeColor = '#5b6b78';
        ib.strokeWidth = 1 / zoom;
        ib.fillColor = null;
        group.addChild(ib);
      });
    }

    const b = unionBounds(targets);
    const box = new paper.Path.Rectangle(b);
    box.strokeColor = '#6f8595';
    box.strokeWidth = 1 / zoom;
    box.dashArray = [4 / zoom, 3 / zoom];
    box.fillColor = null;
    group.addChild(box);

    if (targets.length === 1) {
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
    }

    group.bringToFront();
    reportBounds();
  }

  return {
    get targets() {
      return targets;
    },
    get target() {
      return targets[0] || null;
    },

    get bounds() {
      return targets.length ? unionBounds(targets) : null;
    },

    has(item) {
      return targets.includes(item);
    },

    setTargets(items) {
      targets = (items || []).filter(Boolean);
      draw();
      notify();
    },

    setTarget(item) {
      targets = item ? [item] : [];
      draw();
      notify();
    },

    toggle(item) {
      if (!item) return;
      const i = targets.indexOf(item);
      if (i >= 0) targets.splice(i, 1);
      else targets.push(item);
      draw();
      notify();
    },

    clear() {
      targets = [];
      remove();
      reportBounds();
      notify();
    },

    draw,

    hitHandle(point) {
      if (!group || targets.length !== 1) return null;
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
