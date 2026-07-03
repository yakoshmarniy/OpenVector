import { artworkLayers } from './selection.js';
import { isTransientItem } from './isolation.js';

// Object > Lock / Hide. Locking uses the same `locked` flag system items use,
// so Unlock All must skip transient items (arrowheads, overlays, marks) and
// isolation-dimmed artwork — those are locked by the app, not the user.

export function unlockAllItems() {
  let n = 0;
  artworkLayers().forEach((l) => {
    l.children.forEach((it) => {
      if (!it.locked || isTransientItem(it) || (it.data && it.data.isoDim)) return;
      it.locked = false;
      n += 1;
    });
  });
  return n;
}

export function showAllItems() {
  let n = 0;
  artworkLayers().forEach((l) => {
    l.children.forEach((it) => {
      if (it.visible || isTransientItem(it)) return;
      it.visible = true;
      n += 1;
    });
  });
  return n;
}
