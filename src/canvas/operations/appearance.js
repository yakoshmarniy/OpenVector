import paper from 'paper';

// Appearance — multiple fills and strokes on a single object (the Appearance
// panel). Paper items carry ONE fillColor and ONE strokeColor, so the object's
// own paint is the BOTTOM fill + stroke of the stack; every EXTRA fill/stroke
// is an additional appearance layer, kept as data and rendered by a companion
// clone stacked above the item (same pattern as arrowheads / width envelopes):
//
//   item.data.appearance = [ layer, … ]   // index 0 = TOP of the visual stack
//   layer = { id, kind:'fill'|'stroke', color, opacity, visible,
//             width?, dashArray?, cap?, join? }   // width/dash/cap/join: stroke
//
// Companions (`data.isAppearanceLayer`, linked by `ownerId`) are rebuilt — never
// moved — on every overlay redraw and on style edits, so they track the path
// through moves, transforms and reshapes.

const LAYER_FLAG = 'isAppearanceLayer';
let counter = 0;
const nextId = () => `ap${(counter += 1)}`;

export const isAppearanceLayer = (item) => !!(item && item.data && item.data[LAYER_FLAG]);

export const getAppearance = (item) => (item && item.data && item.data.appearance) || null;

export const hasAppearance = (item) => {
  const a = getAppearance(item);
  return !!(a && a.length);
};

const canCarryAppearance = (item) =>
  (item instanceof paper.Path || item instanceof paper.CompoundPath)
  && !isAppearanceLayer(item);

function ensureList(item) {
  if (!item.data.appearance) item.data.appearance = [];
  return item.data.appearance;
}

export function addFill(item, color) {
  if (!canCarryAppearance(item)) return null;
  const list = ensureList(item);
  const layer = { id: nextId(), kind: 'fill', color: color || '#808080', opacity: 1, visible: true };
  list.unshift(layer); // new appearance goes on top
  return layer;
}

export function addStroke(item, color) {
  if (!canCarryAppearance(item)) return null;
  const list = ensureList(item);
  const layer = {
    id: nextId(), kind: 'stroke', color: color || '#000000', opacity: 1, visible: true,
    width: item.strokeWidth || 1, cap: 'butt', join: 'miter', dashArray: [],
  };
  list.unshift(layer);
  return layer;
}

export function setLayer(item, id, patch) {
  const list = getAppearance(item);
  if (!list) return;
  const layer = list.find((l) => l.id === id);
  if (layer) Object.assign(layer, patch);
}

export function removeLayer(item, id) {
  const list = getAppearance(item);
  if (!list) return;
  const i = list.findIndex((l) => l.id === id);
  if (i >= 0) list.splice(i, 1);
  if (!list.length) delete item.data.appearance;
}

// Move a layer up (toward the top, index 0) or down in the stack.
export function moveLayer(item, id, dir) {
  const list = getAppearance(item);
  if (!list) return;
  const i = list.findIndex((l) => l.id === id);
  if (i < 0) return;
  const j = dir === 'up' ? i - 1 : i + 1;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
}

export function clearAppearance(item) {
  clearAppearanceCompanions(item);
  if (item && item.data) delete item.data.appearance;
}

// ---------------------------------------------------------------------------
// Companion rendering

function ownedLayers(item) {
  const parent = item.parent;
  if (!parent) return [];
  return parent.children.filter(
    (c) => c.data && c.data[LAYER_FLAG] && c.data.ownerId === item.id,
  );
}

export function clearAppearanceCompanions(item) {
  ownedLayers(item).forEach((c) => c.remove());
  if (item && item.children) {
    item.children.forEach((c) => {
      if (!isAppearanceLayer(c)) clearAppearanceCompanions(c);
    });
  }
}

// A bare geometry clone of the item (no paint, no data, unlocked segments).
function geometryClone(item) {
  const g = item.clone({ insert: false, deep: true });
  g.fillColor = null;
  g.strokeColor = null;
  g.data = {};
  g.opacity = 1;
  g.selected = false;
  return g;
}

export function refreshAppearance(item) {
  if (!item || isAppearanceLayer(item)) return;
  if (item.children && !(item.data && item.data.isText)) {
    // Sweep stale companions from a cloned group first (ownerId points at the
    // original), then recurse.
    const ids = new Set(item.children.map((c) => c.id));
    item.children.slice().forEach((c) => {
      if (isAppearanceLayer(c) && !ids.has(c.data.ownerId)) c.remove();
    });
    item.children.forEach((c) => refreshAppearance(c));
    return;
  }
  ownedLayers(item).forEach((c) => c.remove());
  const list = getAppearance(item);
  if (!list || !list.length || !canCarryAppearance(item) || !item.visible) return;

  const baseOpacity = item.opacity ?? 1;
  // Insert bottom-of-list first so index 0 ends up topmost (each insertAbove
  // sits directly above the item, pushing earlier inserts up).
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const layer = list[i];
    if (!layer.visible) continue;
    const c = geometryClone(item);
    if (layer.kind === 'fill') {
      c.fillColor = new paper.Color(layer.color);
      c.strokeColor = null;
    } else {
      c.strokeColor = new paper.Color(layer.color);
      c.strokeWidth = layer.width ?? 1;
      c.strokeCap = layer.cap || 'butt';
      c.strokeJoin = layer.join || 'miter';
      c.dashArray = layer.dashArray && layer.dashArray.length ? layer.dashArray.slice() : [];
      c.fillColor = null;
    }
    c.opacity = baseOpacity * (layer.opacity ?? 1);
    c.data[LAYER_FLAG] = true;
    c.data.ownerId = item.id;
    c.locked = true;
    c.insertAbove(item);
  }
}
