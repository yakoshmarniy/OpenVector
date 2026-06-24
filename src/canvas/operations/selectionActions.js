import paper from 'paper';
import { isOverlayItem } from './selection.js';
import { groupItems, ungroupItems, booleanOp } from './booleans.js';
import { alignItems, distributeItems } from './align.js';

const ALIGN_MODES = {
  alignLeft: 'left',
  alignHCenter: 'hcenter',
  alignRight: 'right',
  alignTop: 'top',
  alignVCenter: 'vcenter',
  alignBottom: 'bottom',
};

/**
 * Run an object-selection command against a `createSelection` instance. Shared
 * by every tool that holds an object selection (Select, Magic Wand, Knife) so
 * the menu / Properties / Control Bar buttons work no matter which is active.
 */
export function runSelectionAction(selection, name) {
  // Commands that don't need an existing selection.
  if (name === 'selectAll') {
    const all = paper.project.activeLayer.children.filter(
      (it) => !isOverlayItem(it) && !it.locked,
    );
    selection.setTargets(all);
    return;
  }
  if (name === 'deselect') {
    selection.clear();
    return;
  }

  const items = selection.targets.slice();
  if (!items.length) return;

  switch (name) {
    case 'delete':
      items.forEach((t) => t.remove());
      selection.clear();
      return;
    case 'duplicate': {
      const clones = items.map((t) => {
        const c = t.clone();
        c.position = c.position.add(new paper.Point(12, 12));
        return c;
      });
      selection.setTargets(clones);
      return;
    }
    case 'arrangeFront':
      items.forEach((t) => t.bringToFront());
      selection.draw();
      return;
    case 'arrangeBack':
      items.slice().reverse().forEach((t) => t.sendToBack());
      selection.draw();
      return;
    case 'arrangeForward':
      items.forEach((t) => {
        if (t.nextSibling && !isOverlayItem(t.nextSibling)) t.insertAbove(t.nextSibling);
      });
      selection.draw();
      return;
    case 'arrangeBackward':
      items.forEach((t) => {
        if (t.previousSibling) t.insertBelow(t.previousSibling);
      });
      selection.draw();
      return;
    case 'distributeH':
      distributeItems(items, 'h');
      selection.draw();
      return;
    case 'distributeV':
      distributeItems(items, 'v');
      selection.draw();
      return;
    case 'group': {
      const g = groupItems(items);
      if (g) selection.setTarget(g);
      return;
    }
    case 'ungroup': {
      const kids = ungroupItems(items[0]);
      if (kids) selection.setTargets(kids);
      return;
    }
    default:
      break;
  }

  if (ALIGN_MODES[name]) {
    alignItems(items, ALIGN_MODES[name]);
    selection.draw();
    return;
  }

  const result = booleanOp(items, name);
  if (result) selection.setTarget(result);
}
