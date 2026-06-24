import paper from 'paper';
import { overlayed } from '../operations/freehand.js';
import { createSelection } from '../operations/selection.js';
import { runSelectionAction } from '../operations/selectionActions.js';

// Knife — drag a freehand line across closed shapes to slice each into two
// pieces along the cut. For each crossed shape we take the chord of the knife
// between its outermost crossings and rejoin it with the two boundary arcs.
// After cutting, the resulting pieces are selected so the cut is visible and
// they can be dragged apart straight away.

// Trim an open path to the range [o1, o2], returning the middle piece.
function trimOpen(p, o1, o2) {
  const tail = p.splitAt(p.getLocationAt(o2));
  if (tail) tail.remove();
  const mid = p.splitAt(p.getLocationAt(o1));
  p.remove();
  return mid;
}

// Open boundary arc of a closed path from offset `from` to `to` (wraps).
function arcOf(path, from, to) {
  const c = path.clone({ insert: true });
  c.splitAt(c.getLocationAt(from)); // reopen the loop at `from`
  let len = to - from;
  if (len < 0) len += path.length;
  const tail = c.splitAt(c.getLocationAt(len));
  if (tail) tail.remove();
  return c;
}

function copyStyle(src, dst) {
  dst.fillColor = src.fillColor;
  dst.strokeColor = src.strokeColor;
  dst.strokeWidth = src.strokeWidth;
}

// Slice one closed path with the knife; returns the two pieces, or null.
function sliceTarget(target, knife) {
  if (target.closed === false) return null;
  let xs;
  try {
    xs = target.getIntersections(knife);
  } catch {
    return null;
  }
  if (!xs || xs.length < 2) return null;
  // Outermost crossings along the knife span the shape.
  xs.sort((a, b) => a.intersection.offset - b.intersection.offset);
  const f = xs[0];
  const l = xs[xs.length - 1];

  try {
    const chord = trimOpen(knife.clone({ insert: true }), f.intersection.offset, l.intersection.offset);
    const arc1 = arcOf(target, f.offset, l.offset);
    const arc2 = arcOf(target, l.offset, f.offset);
    const chordRev = chord.clone({ insert: true });
    chordRev.reverse();

    arc1.join(chordRev, 1);
    arc1.closed = true;
    arc2.join(chord, 1);
    arc2.closed = true;

    if (Math.abs(arc1.area) > 0.5 && Math.abs(arc2.area) > 0.5) {
      copyStyle(target, arc1);
      copyStyle(target, arc2);
      target.remove();
      return [arc1, arc2];
    }
    arc1.remove();
    arc2.remove();
    return null;
  } catch {
    return null; // leave the shape intact if the slice fails
  }
}

// Slice an OPEN path: split it at every knife crossing into separate pieces.
// (Needed for shapes already opened by the Scissors tool, and for plain strokes.)
function sliceOpenPath(target, knife) {
  let xs;
  try {
    xs = target.getIntersections(knife);
  } catch {
    return null;
  }
  if (!xs || !xs.length) return null;
  // Split from the far end inwards so earlier offsets stay valid.
  const offsets = xs.map((x) => x.offset).sort((a, b) => b - a);
  const pieces = [];
  let cur = target;
  offsets.forEach((off) => {
    const loc = cur.getLocationAt(off);
    if (!loc) return;
    const piece = cur.splitAt(loc);
    if (piece) {
      copyStyle(target, piece);
      pieces.push(piece);
    }
  });
  return pieces.length ? [...pieces, cur] : null;
}

export function createKnifeTool(ctx = {}) {
  const selection = createSelection(ctx.onSelectionChange, ctx.onSelectionBounds);
  let knife = null;

  const drop = () => {
    if (knife) knife.remove();
    knife = null;
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      selection.clear();
      knife = new paper.Path();
      knife.strokeColor = new paper.Color('#9aa0a6');
      knife.strokeWidth = 1;
      knife.dashArray = [4, 3];
      knife.add(point);
    },

    onMouseDrag(point) {
      if (knife) knife.add(point);
    },

    onMouseUp() {
      if (!knife) return;
      if (knife.segments.length < 2) {
        drop();
        return;
      }
      const targets = paper.project.getItems({
        match: (it) => it.className === 'Path' && it !== knife && !it.locked && !overlayed(it),
      });
      const pieces = [];
      targets.forEach((t) => {
        if (!t.bounds.intersects(knife.bounds)) return;
        let cut;
        if (t.closed || t.fillColor) {
          // A region (incl. a shape opened by Scissors): zip any gap shut and
          // divide it into two closed halves.
          if (!t.closed) t.closed = true;
          cut = sliceTarget(t, knife);
        } else {
          // A plain open stroke: split the line at each crossing.
          cut = sliceOpenPath(t, knife);
        }
        if (cut) pieces.push(...cut);
      });
      drop();
      // Select the fresh pieces so the cut is visible and immediately movable.
      if (pieces.length) selection.setTargets(pieces);
    },

    runAction(name) {
      runSelectionAction(selection, name);
    },

    onViewChange() {
      selection.draw();
    },

    refreshSelection() {
      selection.draw();
    },

    deactivate() {
      drop();
      selection.clear();
    },
  };
}
