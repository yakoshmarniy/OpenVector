// Global object-selection store — the single source of truth. Tools, panels
// and menu commands read/write it; subscribers (canvas overlay, App, Layers
// panel) redraw on change. Selection therefore survives tool switches.

const listeners = new Set();
let items = [];

// An item is alive while its ancestor chain ends in a layer that is still in
// the project (a removed item loses its parent; a removed layer leaves the
// project's layer list, taking its whole subtree with it).
const alive = (it) => {
  if (!it) return false;
  let c = it;
  while (c.parent) c = c.parent;
  return c.className === 'Layer' && !!c.project && c.project.layers.includes(c);
};

export function subscribeSelection(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn(items.slice()));
}

export function getSelectedItems() {
  // Items can be removed behind the store's back (booleans, knife…) — prune
  // lazily on read so nobody ever sees a dead item.
  const pruned = items.filter(alive);
  if (pruned.length !== items.length) items = pruned;
  return items.slice();
}

export function setSelectedItems(next) {
  items = (next || []).filter(alive);
  notify();
}

export function toggleSelectedItem(item) {
  if (!item) return;
  const i = items.indexOf(item);
  if (i >= 0) items.splice(i, 1);
  else items.push(item);
  notify();
}

export function clearSelection() {
  items = [];
  notify();
}

// Style edits don't change WHICH items are selected, but the panels that
// mirror the selection (App, Color panel) need to re-read it — fire listeners.
export function notifySelectionChanged() {
  notify();
}

// Drop selected items that are no longer selectable (hidden / locked / on a
// hidden or locked layer). Used after Layers-panel toggles and Lock/Hide.
export function pruneSelection() {
  const ok = (it) => {
    for (let c = it; c; c = c.parent) {
      if (!c.visible || c.locked) return false;
    }
    return true;
  };
  const pruned = items.filter((it) => alive(it) && ok(it));
  if (pruned.length !== items.length) {
    items = pruned;
    notify();
  }
}
