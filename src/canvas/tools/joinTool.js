import paper from 'paper';
import { overlayed } from '../operations/freehand.js';

const END_PX = 14; // grab radius around an endpoint, in screen pixels

// Nearest open-path endpoint to a point, or null.
function endpointAt(point) {
  const tol = END_PX / paper.view.zoom;
  let best = null;
  paper.project
    .getItems({ match: (it) => it.className === 'Path' && !it.closed && !overlayed(it) })
    .forEach((p) => {
      if (!p.segments.length) return;
      [['first', p.firstSegment], ['last', p.lastSegment]].forEach(([which, seg]) => {
        const d = seg.point.getDistance(point);
        if (d <= tol && (!best || d < best.d)) best = { d, path: p, which, seg };
      });
    });
  return best;
}

// Join — click one open endpoint, release on another to connect them. Joining
// the two ends of the same path closes it.
export function createJoinTool() {
  let from = null;

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      from = endpointAt(point);
    },

    onMouseUp(point) {
      const to = endpointAt(point);
      if (from && to) joinEnds(from, to);
      from = null;
    },

    onMouseHover(point) {
      return endpointAt(point) ? 'pointer' : 'default';
    },

    deactivate() {
      from = null;
    },
  };
}

function joinEnds(a, b) {
  if (a.path === b.path) {
    if (a.which !== b.which) a.path.closed = true; // two ends of one path → close
    return;
  }
  const A = a.path;
  const B = b.path;
  // Orient so A ends at the picked end and B starts at the picked end.
  if (a.which === 'first') A.reverse();
  if (b.which === 'last') B.reverse();

  let segs = B.segments;
  // Drop a duplicate joint if the endpoints already coincide.
  if (A.lastSegment && B.firstSegment
      && A.lastSegment.point.isClose(B.firstSegment.point, 1e-6)) {
    segs = segs.slice(1);
  }
  A.addSegments(segs.map((s) => new paper.Segment(s.point, s.handleIn, s.handleOut)));
  B.remove();
}
