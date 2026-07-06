import paper from 'paper';
import { hitRegion, isTextItem } from './textLayout.js';
import { refreshArrowheads } from './arrowheads.js';
import { refreshWidthEnvelope, isWidthEnvelope } from './widthProfile.js';
import {
  subscribeSelection,
  getSelectedItems,
  setSelectedItems,
  toggleSelectedItem,
  clearSelection,
} from '../../state/selection.js';
import { isolationRoot, isTransientItem } from './isolation.js';

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

// ---------------------------------------------------------------------------
// Layers

// Artwork layers = every layer except the dedicated overlay layer on top.
export function artworkLayers() {
  return paper.project.layers.filter((l) => !(l.data && l.data.isOverlayLayer));
}

// The overlay layer hosts selection boxes, marquees, guides and widgets so
// they stay visible above (and independent of) user layers. It must never
// become the active layer — new artwork goes to the user's layer.
export function getOverlayLayer() {
  const project = paper.project;
  let ol = project.layers.find((l) => l.data && l.data.isOverlayLayer);
  if (!ol) {
    const prev = project.activeLayer;
    ol = new paper.Layer(); // note: constructing a layer activates it
    ol.data.isOverlayLayer = true;
    ol.name = '__overlay';
    if (prev) prev.activate();
  }
  if (project.layers[project.layers.length - 1] !== ol) {
    project.insertLayer(project.layers.length, ol);
  }
  return ol;
}

// Move a freshly created helper item (marquee, guides, widget…) onto the
// overlay layer and flag it out of hit-tests and exports.
export function addOverlay(item) {
  item.data[OVERLAY_FLAG] = true;
  item.locked = true;
  getOverlayLayer().addChild(item);
  return item;
}

// Items the user can currently select: children of the isolation root while
// isolated, otherwise the top-level items of visible, unlocked layers.
// Locked covers system items too (overlays, arrowheads, dimmed artwork).
export function editableItems() {
  const root = isolationRoot();
  if (root) {
    return root.children.filter((it) => !it.locked && it.visible && !isTransientItem(it));
  }
  const out = [];
  artworkLayers().forEach((l) => {
    if (!l.visible || l.locked) return;
    l.children.forEach((it) => {
      if (isOverlayItem(it) || it.locked || !it.visible || isTransientItem(it)) return;
      out.push(it);
    });
  });
  return out;
}

// ---------------------------------------------------------------------------
// Picking

// Walk up to the item that sits directly in a layer (so clicking a child of a
// group — or a glyph of a text group — selects the whole top-level object).
// Inside isolation the walk stops at the isolated group: its direct children
// are what get selected.
function topLevel(item) {
  const root = isolationRoot();
  let it = item;
  while (it && it.parent && !(it.parent instanceof paper.Layer) && it.parent !== root) {
    it = it.parent;
  }
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

  // Variable-width strokes: the spine path has strokeWidth 0 (not stroke-
  // hittable) and its envelope is locked (hitTest skips locked items even
  // with the `locked` option in this paper build) — probe the envelopes by
  // hand and give the click to the owning path, so the whole stroke body is
  // clickable.
  const envs = paper.project.getItems({ match: (it) => isWidthEnvelope(it) && it.visible });
  for (let i = envs.length - 1; i >= 0; i -= 1) {
    const e = envs[i];
    if (e.contains(point)) {
      const owner = e.parent && e.parent.children.find((c) => c.id === e.data.ownerId);
      if (owner && !owner.locked && owner.visible) return topLevel(owner);
    }
  }

  const texts = paper.project.getItems({ match: (it) => isTextItem(it) });
  for (let i = texts.length - 1; i >= 0; i -= 1) {
    const t = texts[i];
    if (isOverlayItem(t) || t.locked || !t.visible) continue;
    if (hitRegion(t).contains(point)) return topLevel(t);
  }
  return null;
}

// True when the marquee rectangle touches the item's real GEOMETRY — outline
// crossed, item fully enclosed, or the rect sitting on painted fill. A bare
// bounding-box overlap is not enough: dragging through the empty notch of an
// L-shape (or inside a pen squiggle's hull) must not select it.
export function itemHitsRect(item, rect) {
  if (!rect.intersects(item.bounds)) return false; // cheap prefilter
  if (rect.contains(item.bounds)) return true; // fully enclosed
  if (item.className === 'Path' || item.className === 'CompoundPath') {
    const probe = new paper.Path.Rectangle({ rectangle: rect, insert: false });
    if (item.intersects(probe)) return true;
    return !!(item.fillColor && item.contains(rect.center));
  }
  if (item.children && item.children.length) {
    return item.children.some((c) => itemHitsRect(c, rect));
  }
  // Leaf items without path geometry (text glyphs, rasters) keep bbox hits.
  return true;
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

export function computeResizeBounds(handle, ob, mouse, shift, alt) {
  const isCorner = handle.length === 2;

  // Alt — scale symmetrically about the centre (both sides move together).
  if (alt) {
    const c = ob.center;
    let hw = ob.width / 2;
    let hh = ob.height / 2;
    if (handle.includes('e') || handle.includes('w')) hw = Math.abs(mouse.x - c.x);
    if (handle.includes('n') || handle.includes('s')) hh = Math.abs(mouse.y - c.y);
    if (shift && isCorner) {
      const ratio = ob.width / ob.height || 1;
      if (hw / ratio > hh) hh = hw / ratio;
      else hw = hh * ratio;
    }
    hw = Math.max(0.5, hw);
    hh = Math.max(0.5, hh);
    return new paper.Rectangle(new paper.Point(c.x - hw, c.y - hh), new paper.Size(hw * 2, hh * 2));
  }

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

// ---------------------------------------------------------------------------
// Shared overlay renderer (module singleton — the store is global, so is the
// box). Text items being edited are skipped: the caret owns that visual.

let overlayGroup = null;
const changeCbs = new Set();
const boundsCbs = new Set();
let storeSubscribed = false;

const visibleTargets = () =>
  getSelectedItems().filter((t) => !(t.data && t.data.editing));

function reportBounds() {
  if (!boundsCbs.size) return;
  const targets = visibleTargets();
  if (!targets.length) {
    boundsCbs.forEach((cb) => cb(null));
    return;
  }
  const b = unionBounds(targets);
  const tl = paper.view.projectToView(b.topLeft);
  const br = paper.view.projectToView(b.bottomRight);
  const rect = { x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y };
  boundsCbs.forEach((cb) => cb(rect));
}

function removeOverlay() {
  if (overlayGroup) {
    overlayGroup.remove();
    overlayGroup = null;
  }
}

// Accent outline tracing the item's real geometry (Illustrator-style): every
// path inside the target is cloned onto the overlay. Returns false when the
// item has no path geometry (text, rasters) — callers fall back to a rect.
function addShapeOutline(group, item, zoom, color) {
  let found = false;
  const walk = (it) => {
    if (!it.visible) return; // e.g. the hidden guide path inside on-path text
    if (isWidthEnvelope(it)) return; // the spine outline already reads as selected
    if (it.className === 'Path') {
      const o = it.clone({ insert: false });
      o.data = {}; // the clone copies data (live-rect flags, arrow config…)
      o.fillColor = null;
      o.strokeColor = color;
      o.strokeWidth = 1 / zoom;
      o.dashArray = [];
      o.opacity = 1;
      group.addChild(o);
      found = true;
    } else if (it.children) {
      it.children.forEach(walk);
    }
  };
  walk(item);
  return found;
}

function drawOverlay() {
  removeOverlay();
  if (!paper.project) return;
  const targets = visibleTargets();
  // Keep arrowheads and variable-width envelopes following their paths as
  // they move / resize / rotate.
  targets.forEach((t) => {
    refreshArrowheads(t);
    refreshWidthEnvelope(t);
  });
  if (!targets.length) {
    reportBounds();
    return;
  }
  const zoom = paper.view.zoom;
  const hs = HANDLE_PX / zoom;

  overlayGroup = new paper.Group();
  overlayGroup.data[OVERLAY_FLAG] = true;
  overlayGroup.locked = true;

  // Highlight each selected object along its actual shape, so a pen path or
  // star reads as selected in its own form, not as a bounding rectangle.
  const OUTLINE = '#7fb2d9'; // muted blue — readable on the grey fills
  targets.forEach((t) => {
    if (!addShapeOutline(overlayGroup, t, zoom, OUTLINE)) {
      const ib = new paper.Path.Rectangle(t.bounds);
      ib.strokeColor = OUTLINE;
      ib.strokeWidth = 1 / zoom;
      ib.fillColor = null;
      overlayGroup.addChild(ib);
    }
  });

  const b = unionBounds(targets);
  const box = new paper.Path.Rectangle(b);
  box.strokeColor = '#6f8595';
  box.strokeWidth = 1 / zoom;
  box.dashArray = [4 / zoom, 3 / zoom];
  box.fillColor = null;
  overlayGroup.addChild(box);

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
      overlayGroup.addChild(h);
    });
  }

  getOverlayLayer().addChild(overlayGroup);
  overlayGroup.bringToFront();
  reportBounds();
}

function onStoreChange(items) {
  drawOverlay();
  changeCbs.forEach((cb) => cb(items.slice()));
}

/**
 * View over the global selection store. Multiple instances share one store
 * and one overlay; onChange/onBounds callbacks (used by the canvas) are
 * registered per instance and removed by dispose(). dispose() does NOT clear
 * the selection — that's the point: it survives tool switches.
 */
export function createSelection(onChange, onBounds) {
  if (!storeSubscribed) {
    subscribeSelection(onStoreChange);
    storeSubscribed = true;
  }
  if (onChange) changeCbs.add(onChange);
  if (onBounds) boundsCbs.add(onBounds);

  return {
    get targets() {
      return getSelectedItems();
    },
    get target() {
      return getSelectedItems()[0] || null;
    },

    get bounds() {
      const targets = getSelectedItems();
      return targets.length ? unionBounds(targets) : null;
    },

    has(item) {
      return getSelectedItems().includes(item);
    },

    setTargets(items) {
      setSelectedItems(items);
    },

    setTarget(item) {
      setSelectedItems(item ? [item] : []);
    },

    toggle(item) {
      toggleSelectedItem(item);
    },

    clear() {
      clearSelection();
    },

    // Redraw the overlay without re-announcing the selection (used on every
    // drag frame — App state must not churn there).
    draw: drawOverlay,

    hitHandle(point) {
      if (!overlayGroup || getSelectedItems().length !== 1) return null;
      const hs = HANDLE_PX / paper.view.zoom;
      for (const child of overlayGroup.children) {
        if (child.data && child.data.handle && child.bounds.expand(hs).contains(point)) {
          return child.data.handle;
        }
      }
      return null;
    },

    dispose() {
      if (onChange) changeCbs.delete(onChange);
      if (onBounds) boundsCbs.delete(onBounds);
    },
  };
}
