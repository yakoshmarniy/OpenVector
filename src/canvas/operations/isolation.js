import paper from 'paper';

// Isolation Mode — double-click a group to edit only its contents. Everything
// outside the isolated group is dimmed and locked (so it can't be clicked).
// Double-clicking a nested group isolates deeper: the chain of groups is the
// breadcrumb path. Exiting restores original opacity / locked flags.

let chain = []; // isolated groups, outermost first
let dimmed = []; // { item, opacity, locked } saved for restore

// System items that must never be dimmed, adopted or unlocked wholesale:
// selection/pen/text overlays, arrowheads and hidden-character marks.
export function isTransientItem(it) {
  const d = it.data;
  return !!(d && (
    d.isSelectionOverlay || d.isTextOverlay || d.isPenOverlay
    || d.isArrow || d.hiddenMark
  ));
}

export const isolationActive = () => chain.length > 0;
export const isolationRoot = () => (chain.length ? chain[chain.length - 1] : null);
export const isolationCrumbs = () => chain.map((g) => g.name || 'Group');

function restore() {
  dimmed.forEach(({ item, opacity, locked }) => {
    if (!item.parent) return; // removed while isolated
    item.opacity = opacity;
    item.locked = locked;
    delete item.data.isoDim;
  });
  dimmed = [];
}

function dim(it) {
  if (isTransientItem(it)) return;
  dimmed.push({ item: it, opacity: it.opacity, locked: it.locked });
  it.data.isoDim = true;
  it.opacity *= 0.25;
  it.locked = true;
}

function apply() {
  restore();
  chain = chain.filter((g) => g.parent); // a chain member may have been removed
  if (!chain.length) return;
  // Dim every top-level item except the outermost isolated group…
  paper.project.layers.forEach((layer) => {
    if (layer.data && layer.data.isOverlayLayer) return;
    layer.children.forEach((it) => {
      if (it !== chain[0]) dim(it);
    });
  });
  // …and, inside each chain link, every sibling of the next link.
  for (let i = 0; i < chain.length - 1; i += 1) {
    chain[i].children.forEach((c) => {
      if (c !== chain[i + 1]) dim(c);
    });
  }
}

export function enterIsolation(group) {
  if (!group || group.className !== 'Group' || (group.data && group.data.isText)) return false;
  chain.push(group);
  apply();
  return true;
}

// Pop levels until `depth` remain. Returns the outermost group that was left
// (so the caller can re-select it after a full exit).
export function exitIsolationTo(depth) {
  let left = null;
  while (chain.length > Math.max(0, depth)) left = chain.pop();
  apply();
  return left;
}

export const exitIsolationLevel = () => exitIsolationTo(chain.length - 1);
export const exitIsolationAll = () => exitIsolationTo(0);

// Tools drop new items at layer level; while isolated, Illustrator puts them
// inside the isolated group instead. Adopt anything unlocked that appeared at
// the top level (everything pre-existing was locked by apply()).
export function adoptNewItems() {
  const root = isolationRoot();
  if (!root) return;
  paper.project.layers.forEach((layer) => {
    if (layer.data && layer.data.isOverlayLayer) return;
    layer.children.slice().forEach((it) => {
      if (it === chain[0] || it.locked || isTransientItem(it)) return;
      root.addChild(it); // identity-matrix group: global coords are preserved
    });
  });
}
