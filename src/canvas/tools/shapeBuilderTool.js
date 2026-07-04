import paper from 'paper';
import { createSelection, addOverlay, pickItem } from '../operations/selection.js';
import { runSelectionAction } from '../operations/selectionActions.js';
import { atomicRegions } from '../operations/pathfinder.js';
import { isDegenerate } from '../operations/booleans.js';
import { clearArrowheads } from '../operations/arrowheads.js';

// Shape Builder — select a few shapes, then click a region to break it out,
// drag across regions to merge them, Alt+click/drag to delete regions.
// Regions are the atomic-overlap decomposition of the selected shapes; only
// the shapes a gesture touches are rebuilt, the rest stay intact.

const HL_FILL = 'rgba(111, 133, 149, 0.45)';
const HL_STROKE = '#8fb0c4';

const isPathLike = (it) => it.className === 'Path' || it.className === 'CompoundPath';

export function createShapeBuilderTool(ctx = {}) {
  let regions = []; // { geom (hidden path on the overlay layer), src }
  let hover = null; // highlight overlay under the cursor
  let picked = []; // region indexes collected during the current gesture
  let marks = []; // highlight overlays for picked regions
  let dragging = false;

  const clearHover = () => {
    if (hover) hover.remove();
    hover = null;
  };
  const clearPicked = () => {
    marks.forEach((m) => m.remove());
    marks = [];
    picked = [];
  };
  const clearRegions = () => {
    regions.forEach((r) => r.geom.remove());
    regions = [];
  };

  const selection = createSelection(() => rebuild());

  function rebuild() {
    clearHover();
    clearPicked();
    clearRegions();
    const paths = selection.targets.filter(isPathLike);
    if (!paths.length) return;
    paths.sort((a, b) => a.index - b.index);
    regions = atomicRegions(paths);
    regions.forEach((r) => {
      r.geom.visible = false; // hit-tested manually, never rendered
      addOverlay(r.geom);
    });
  }

  function regionAt(point) {
    for (let i = regions.length - 1; i >= 0; i -= 1) {
      if (regions[i].geom.contains(point)) return i;
    }
    return -1;
  }

  function highlight(i) {
    const c = regions[i].geom.clone({ insert: false });
    c.visible = true;
    c.fillColor = new paper.Color(HL_FILL);
    c.strokeColor = new paper.Color(HL_STROKE);
    c.strokeWidth = 1.5 / paper.view.zoom;
    return addOverlay(c);
  }

  function addPick(i) {
    if (picked.includes(i)) return;
    picked.push(i);
    marks.push(highlight(i));
    paper.view.update();
  }

  // Apply the gesture: unite the picked regions and rebuild only the shapes
  // they overlap. erase=true removes the picked area instead of extracting it.
  function apply(erase) {
    if (!picked.length) return;
    const donor = regions[picked[0]].src; // appearance for the merged piece

    let uni = regions[picked[0]].geom.clone({ insert: true });
    uni.visible = true;
    uni.locked = false;
    uni.data = {};
    for (let k = 1; k < picked.length; k += 1) {
      const next = uni.unite(regions[picked[k]].geom);
      next.data = {};
      uni.remove();
      uni = next;
    }

    const paths = selection.targets.filter(isPathLike);
    const survivors = [];
    let parent = null;
    paths.forEach((p) => {
      const overlap = p.intersect(uni);
      const touched = !isDegenerate(overlap);
      overlap?.remove();
      if (!touched) {
        survivors.push(p);
        return;
      }
      parent = parent || p.parent;
      const rest = p.subtract(uni);
      clearArrowheads(p);
      p.remove();
      if (isDegenerate(rest)) rest?.remove();
      else {
        rest.data = {};
        survivors.push(rest);
      }
    });

    if (erase) {
      uni.remove();
    } else {
      uni.fillColor = donor.fillColor || donor.strokeColor || new paper.Color('#000000');
      uni.strokeColor = donor.strokeColor;
      uni.strokeWidth = donor.strokeWidth;
      uni.opacity = donor.opacity;
      if (parent && uni.parent !== parent) parent.addChild(uni);
      survivors.push(uni);
    }
    selection.setTargets(survivors); // triggers rebuild()
    paper.view.update();
  }

  rebuild(); // the selection may predate the tool switch

  return {
    cursor: 'crosshair',

    onMouseHover(point) {
      if (!regions.length) return null;
      clearHover();
      const i = regionAt(point);
      if (i >= 0) hover = highlight(i);
      paper.view.update();
      return i >= 0 ? 'crosshair' : null;
    },

    onMouseDown(point, e) {
      clearHover();
      const i = regionAt(point);
      if (i < 0) {
        // Off the regions: (re)build the working selection like Select does.
        const item = pickItem(point);
        if (item) {
          if (e.shiftKey) selection.toggle(item);
          else selection.setTarget(item);
        } else if (!e.shiftKey) {
          selection.clear();
        }
        return;
      }
      dragging = true;
      addPick(i);
    },

    onMouseDrag(point) {
      if (!dragging) return;
      const i = regionAt(point);
      if (i >= 0) addPick(i);
    },

    onMouseUp(point, e) {
      if (!dragging) return;
      dragging = false;
      const erase = !!e.altKey;
      const chosen = picked.slice();
      clearPicked();
      picked = chosen;
      apply(erase);
      picked = [];
    },

    runAction(name) {
      runSelectionAction(selection, name);
    },

    onViewChange() {
      selection.draw();
      clearHover();
    },

    refreshSelection() {
      selection.draw();
      rebuild(); // Properties edits restyle shapes — regions keep sources
    },

    deactivate() {
      clearHover();
      clearPicked();
      clearRegions();
      selection.dispose();
    },
  };
}
