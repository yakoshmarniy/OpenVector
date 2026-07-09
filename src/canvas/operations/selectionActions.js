import paper from 'paper';
import { editableItems } from './selection.js';
import { groupItems, ungroupItems, booleanOp } from './booleans.js';
import { alignItems, distributeItems } from './align.js';
import { clearArrowheads, refreshArrowheads } from './arrowheads.js';
import { clearWidthEnvelope, refreshWidthEnvelope } from './widthProfile.js';
import { clearGradientFill } from './gradients.js';
import { clearMeshFill } from './mesh.js';
import { clearAppearanceCompanions, refreshAppearance } from './appearance.js';
import { unlockAllItems, showAllItems } from './visibility.js';
import { pathfinderOp } from './pathfinder.js';
import { makeCompoundPath, releaseCompoundPath } from './compound.js';
import {
  joinPaths,
  averagePoints,
  outlineStrokes,
  offsetPaths,
  simplifyPaths,
  splitIntoGrid,
  cleanUpDocument,
} from './pathOps.js';
import {
  moveItems,
  rotateItems,
  scaleItems,
  shearItems,
  flipItems,
  transformEach,
  transformAgain,
  hasLastTransform,
  recordTransform,
  unionBounds,
  getScaleStrokes,
} from './transform.js';
import { pruneSelection } from '../../state/selection.js';

const PATHFINDER_OPS = ['divide', 'trim', 'merge', 'crop', 'outline'];
const AVERAGE_AXES = { averageBoth: 'both', averageH: 'h', averageV: 'v' };

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
export function runSelectionAction(selection, rawName) {
  // Commands may carry an argument after a colon (e.g. "offsetPath:10").
  const [name, arg] = rawName.split(':');

  // Commands that don't need an existing selection.
  if (name === 'selectAll') {
    selection.setTargets(editableItems());
    return;
  }
  if (name === 'deselect') {
    selection.clear();
    return;
  }
  if (name === 'unlockAll') {
    unlockAllItems();
    paper.view.update();
    return;
  }
  if (name === 'showAll') {
    showAllItems();
    paper.view.update();
    return;
  }
  if (name === 'cleanUp') {
    cleanUpDocument();
    pruneSelection();
    paper.view.update();
    return;
  }

  const items = selection.targets.slice();
  if (!items.length) return;

  if (PATHFINDER_OPS.includes(name)) {
    const result = pathfinderOp(items, name);
    if (result) selection.setTarget(result);
    return;
  }
  if (AVERAGE_AXES[name]) {
    if (averagePoints(items, AVERAGE_AXES[name])) selection.draw();
    paper.view.update();
    return;
  }

  switch (name) {
    case 'flipH':
    case 'flipV':
      flipItems(items, name === 'flipH' ? 'h' : 'v');
      recordTransform({ kind: 'reflect', angle: name === 'flipH' ? 90 : 0, pivot: null });
      selection.draw();
      return;
    case 'transformAgain': {
      // ⌘D. With no recorded transform yet, fall back to a plain duplicate.
      if (!hasLastTransform()) {
        runSelectionAction(selection, 'duplicate');
        return;
      }
      const out = transformAgain(items);
      if (out && out !== items) selection.setTargets(out);
      else selection.draw();
      return;
    }
    case 'moveBy': {
      const [dx, dy] = (arg || '').split(',').map(Number);
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
      moveItems(items, dx, dy);
      recordTransform({ kind: 'move', dx, dy });
      selection.draw();
      return;
    }
    case 'rotateBy': {
      const angle = Number(arg);
      if (!Number.isFinite(angle) || !angle) return;
      const pivot = unionBounds(items).center;
      rotateItems(items, angle, pivot);
      recordTransform({ kind: 'rotate', angle, pivot: { x: pivot.x, y: pivot.y } });
      selection.draw();
      return;
    }
    case 'scaleBy': {
      const [sx, sy] = (arg || '').split(',').map(Number);
      if (!Number.isFinite(sx) || !Number.isFinite(sy) || !sx || !sy) return;
      const pivot = unionBounds(items).center;
      scaleItems(items, sx, sy, pivot);
      recordTransform({
        kind: 'scale', sx, sy, pivot: { x: pivot.x, y: pivot.y }, withStrokes: getScaleStrokes(),
      });
      selection.draw();
      return;
    }
    case 'shearBy': {
      const deg = Number(arg);
      if (!Number.isFinite(deg) || !deg) return;
      const shx = Math.tan((deg * Math.PI) / 180);
      const pivot = unionBounds(items).center;
      shearItems(items, shx, 0, pivot);
      recordTransform({ kind: 'shear', shx, shy: 0, pivot: { x: pivot.x, y: pivot.y } });
      selection.draw();
      return;
    }
    case 'transformEach': {
      const [sx, sy, dx, dy, angle] = (arg || '').split(',').map(Number);
      const opts = {
        sx: Number.isFinite(sx) && sx ? sx : 1,
        sy: Number.isFinite(sy) && sy ? sy : 1,
        dx: Number.isFinite(dx) ? dx : 0,
        dy: Number.isFinite(dy) ? dy : 0,
        angle: Number.isFinite(angle) ? angle : 0,
      };
      transformEach(items, opts);
      recordTransform({ kind: 'each', opts });
      selection.draw();
      return;
    }
    case 'delete':
      items.forEach((t) => {
        clearArrowheads(t);
        clearWidthEnvelope(t);
        clearGradientFill(t);
        clearMeshFill(t);
        clearAppearanceCompanions(t);
        t.remove();
      });
      selection.clear();
      return;
    case 'duplicate': {
      const clones = items.map((t) => {
        const c = t.clone();
        c.position = c.position.add(new paper.Point(12, 12));
        refreshArrowheads(c); // build the clone's own heads (config is copied)
        refreshWidthEnvelope(c);
        refreshAppearance(c);
        return c;
      });
      selection.setTargets(clones);
      // ⌘D again repeats the duplicate+offset (Transform Again semantics).
      recordTransform({ kind: 'move', dx: 12, dy: 12, copy: true });
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
        if (t.nextSibling) t.insertAbove(t.nextSibling);
      });
      selection.draw();
      return;
    case 'lockSelection':
      items.forEach((t) => {
        t.locked = true;
      });
      pruneSelection();
      return;
    case 'hideSelection':
      items.forEach((t) => {
        t.visible = false;
      });
      pruneSelection();
      paper.view.update();
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
    case 'compoundMake': {
      const cp = makeCompoundPath(items);
      if (cp) selection.setTarget(cp);
      return;
    }
    case 'compoundRelease': {
      const kids = releaseCompoundPath(items[0]);
      if (kids) selection.setTargets(kids);
      return;
    }
    case 'pathJoin': {
      const joined = joinPaths(items);
      if (joined) selection.setTarget(joined);
      return;
    }
    case 'outlineStroke': {
      const results = outlineStrokes(items);
      if (results.length) selection.setTargets(results);
      return;
    }
    case 'offsetPath': {
      const copies = offsetPaths(items, Number(arg));
      if (copies.length) selection.setTargets(copies);
      return;
    }
    case 'simplify':
      if (simplifyPaths(items)) selection.draw();
      paper.view.update();
      return;
    case 'splitGrid': {
      const [rows, cols, gutter] = (arg || '').split(',').map(Number);
      const cells = splitIntoGrid(items, rows, cols, gutter || 0);
      if (cells.length) selection.setTargets(cells);
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
