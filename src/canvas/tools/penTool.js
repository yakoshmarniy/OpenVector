import paper from 'paper';
import { SHAPE_STYLE, LINE_STYLE } from './styles.js';

// Screen-space sizes (divided by zoom so they stay constant on screen).
const CLOSE_PX = 9; // click within this of the first anchor to close the path
const DOT_PX = 3.5; // anchor marker radius

const DRAW_STROKE = '#9aa0a6';
const PREVIEW_STROKE = '#6f8595';

// Build a Paper Color up front. Assigning a colour *string* stores it lazily;
// a second colour assignment before the item renders then throws inside Paper
// ("_canvasStyle on string"). Real Color objects avoid that entirely.
const color = (css) => new paper.Color(css);

/**
 * Pen tool — build a path point by point.
 *   click           → corner anchor (straight segments)
 *   click + drag     → smooth anchor (drag sets mirrored Bézier handles)
 *   click first dot  → close the path
 *   Enter / Escape   → finish an open path
 * Points arrive in project coordinates.
 */
export function createPenTool() {
  let path = null; // committed path being built
  let rubberBand = null; // live preview segment to the cursor
  let anchors = null; // overlay group of anchor markers
  let activeSegment = null; // segment whose handles are being dragged
  let dragging = false;

  const clearRubberBand = () => {
    if (rubberBand) {
      rubberBand.remove();
      rubberBand = null;
    }
  };

  const clearAnchors = () => {
    if (anchors) {
      anchors.remove();
      anchors = null;
    }
  };

  const rebuildAnchors = () => {
    clearAnchors();
    if (!path) return;
    const z = paper.view.zoom;
    anchors = new paper.Group();
    anchors.data.isPenOverlay = true;
    anchors.locked = true;
    path.segments.forEach((seg, i) => {
      const dot = new paper.Path.Circle({ center: seg.point, radius: DOT_PX / z });
      dot.fillColor = color(i === 0 ? '#aebfd0' : '#cfd3d7');
      dot.strokeColor = color('#3a3d41');
      dot.strokeWidth = 1 / z;
      anchors.addChild(dot);
    });
    anchors.bringToFront();
  };

  const updateRubberBand = (point) => {
    clearRubberBand();
    if (!path || path.segments.length === 0) return;
    const z = paper.view.zoom;
    const last = path.lastSegment;
    rubberBand = new paper.Path();
    rubberBand.strokeColor = color(PREVIEW_STROKE);
    rubberBand.strokeWidth = 1 / z;
    rubberBand.dashArray = [4 / z, 3 / z];
    rubberBand.data.isPenOverlay = true;
    rubberBand.locked = true;
    // Carry the last anchor's outgoing handle so the preview matches the curve.
    rubberBand.add(new paper.Segment(last.point, null, last.handleOut));
    rubberBand.add(new paper.Segment(point));
    anchors?.bringToFront();
  };

  const finish = () => {
    clearRubberBand();
    clearAnchors();
    if (path) {
      if (path.segments.length < 2) {
        path.remove(); // a lone point isn't a path
      } else if (path.closed) {
        path.fillColor = color(SHAPE_STYLE.fillColor);
        path.strokeColor = color(SHAPE_STYLE.strokeColor);
        path.strokeWidth = SHAPE_STYLE.strokeWidth;
      } else {
        path.fillColor = null;
        path.strokeColor = color(LINE_STYLE.strokeColor);
        path.strokeWidth = LINE_STYLE.strokeWidth;
      }
    }
    path = null;
    activeSegment = null;
    dragging = false;
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      const z = paper.view.zoom;

      // Click near the first anchor → close the path.
      if (path && path.segments.length >= 2) {
        const first = path.firstSegment.point;
        if (point.getDistance(first) <= CLOSE_PX / z) {
          path.closed = true;
          finish();
          return;
        }
      }

      if (!path) {
        path = new paper.Path();
        path.strokeColor = color(DRAW_STROKE);
        path.strokeWidth = 1.5 / z;
      }
      activeSegment = path.add(point);
      dragging = true;
      rebuildAnchors();
      clearRubberBand();
    },

    onMouseDrag(point) {
      if (!dragging || !activeSegment) return;
      const handle = point.subtract(activeSegment.point);
      activeSegment.handleOut = handle;
      activeSegment.handleIn = handle.multiply(-1); // mirror → smooth point
    },

    onMouseUp() {
      dragging = false;
      activeSegment = null;
    },

    onMouseHover(point) {
      if (!path || path.segments.length === 0) return 'crosshair';
      updateRubberBand(point);
      const near =
        path.segments.length >= 2 &&
        point.getDistance(path.firstSegment.point) <= CLOSE_PX / paper.view.zoom;
      return near ? 'pointer' : 'crosshair';
    },

    onKeyDown(e) {
      if (e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        finish();
      }
    },

    onViewChange() {
      rebuildAnchors();
    },

    deactivate() {
      finish();
    },
  };
}
