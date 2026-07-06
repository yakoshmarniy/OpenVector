import paper from 'paper';
import { addOverlay, editableItems } from '../operations/selection.js';
import {
  getWidthProfile,
  ensureProfile,
  widthAt,
  addWidthPoint,
  removeWidthPoint,
  refreshWidthEnvelope,
  isWidthEnvelope,
} from '../operations/widthProfile.js';

// Width Tool — click a stroked path to plant a width point and drag to set
// the stroke width there; the stroke re-renders as a variable-width envelope.
// Drag a side handle to change the width, drag the spine dot to slide the
// point along the path, Alt-click a handle (or Delete) removes the point.

const PATH_TOL = 10; // px — how close a click must be to the spine
const HANDLE_TOL = 7; // px — grab tolerance around markers

export function createWidthTool(ctx = {}) {
  let shown = null; // path whose width points are currently displayed
  let active = null; // { path, pt } — last touched width point
  let mode = null; // 'width' | 'slide'
  let markers = null; // overlay group

  const strokedPaths = () => {
    const out = [];
    const walk = (it) => {
      if (isWidthEnvelope(it)) return;
      if (it.className === 'Path' && it.segments.length > 1 && it.strokeColor) out.push(it);
      else if (it.children && !(it.data && it.data.isText)) it.children.forEach(walk);
    };
    editableItems().forEach(walk);
    return out;
  };

  const nearestOn = (point, tol) => {
    let best = null;
    strokedPaths().forEach((p) => {
      const loc = p.getNearestLocation(point);
      if (!loc) return;
      const d = loc.point.getDistance(point);
      if (d <= tol && (!best || d < best.d)) best = { path: p, loc, d };
    });
    return best;
  };

  const clearMarkers = () => {
    if (markers) {
      markers.remove();
      markers = null;
    }
  };

  function drawMarkers() {
    clearMarkers();
    if (!shown || !shown.parent) return;
    const prof = getWidthProfile(shown);
    if (!prof) return;
    const z = paper.view.zoom;
    const L = shown.length;
    markers = new paper.Group();

    prof.points.forEach((pt) => {
      const off = Math.min(L, pt.o * L);
      const p = shown.getPointAt(off);
      let n = shown.getNormalAt(off);
      if (!p || !n || n.length < 1e-6) return;
      n = n.normalize();
      const half = Math.max(0.5, pt.w / 2);
      const a = p.add(n.multiply(half));
      const b = p.subtract(n.multiply(half));
      const isActive = active && active.pt === pt;

      const rung = new paper.Path.Line(a, b);
      rung.strokeColor = new paper.Color('#7fd4ff');
      rung.strokeWidth = 1 / z;
      markers.addChild(rung);

      [a, b].forEach((end) => {
        const s = 6 / z;
        const h = new paper.Path.Rectangle({
          rectangle: new paper.Rectangle(end.subtract(s / 2), new paper.Size(s, s)),
        });
        h.fillColor = new paper.Color(isActive ? '#7fd4ff' : '#cfd3d7');
        h.strokeColor = new paper.Color('#3a3d41');
        h.strokeWidth = 1 / z;
        h.data.wpSide = pt;
        markers.addChild(h);
      });

      const spine = new paper.Path.Circle({ center: p, radius: 3.5 / z });
      spine.fillColor = new paper.Color(isActive ? '#7fd4ff' : '#eef1f4');
      spine.strokeColor = new paper.Color('#3a3d41');
      spine.strokeWidth = 1 / z;
      spine.data.wpSpine = pt;
      markers.addChild(spine);
    });

    addOverlay(markers);
    markers.bringToFront();
  }

  const hitMarker = (point) => {
    if (!markers) return null;
    const tol = HANDLE_TOL / paper.view.zoom;
    for (let i = markers.children.length - 1; i >= 0; i -= 1) {
      const c = markers.children[i];
      if (!c.data) continue;
      if (c.data.wpSpine && c.bounds.expand(tol).contains(point)) {
        return { kind: 'slide', pt: c.data.wpSpine };
      }
      if (c.data.wpSide && c.bounds.expand(tol).contains(point)) {
        return { kind: 'width', pt: c.data.wpSide };
      }
    }
    return null;
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point, e) {
      const m = hitMarker(point);
      if (m && shown) {
        if (e && e.altKey) {
          removeWidthPoint(shown, m.pt);
          active = null;
          refreshWidthEnvelope(shown);
          drawMarkers();
          return;
        }
        active = { path: shown, pt: m.pt };
        mode = m.kind;
        drawMarkers();
        return;
      }

      const hit = nearestOn(point, PATH_TOL / paper.view.zoom);
      if (!hit) {
        shown = null;
        active = null;
        clearMarkers();
        return;
      }
      const path = hit.path;
      const prof = ensureProfile(path);
      if (!prof) return;
      const o = path.length > 1e-6 ? hit.loc.offset / path.length : 0;
      const w0 = prof.points.length ? widthAt(prof, o) : prof.base;
      const pt = addWidthPoint(path, o, w0);
      shown = path;
      active = { path, pt };
      mode = 'width';
      refreshWidthEnvelope(path);
      drawMarkers();
    },

    onMouseDrag(point) {
      if (!mode || !active || !active.path.parent) return;
      const path = active.path;
      const prof = getWidthProfile(path);
      if (!prof) return;
      if (mode === 'width') {
        const anchor = path.getPointAt(Math.min(path.length, active.pt.o * path.length));
        if (!anchor) return;
        active.pt.w = Math.max(0.2, point.getDistance(anchor) * 2);
      } else {
        const loc = path.getNearestLocation(point);
        if (!loc) return;
        active.pt.o = Math.max(0, Math.min(1, path.length > 1e-6 ? loc.offset / path.length : 0));
        prof.points.sort((a, b) => a.o - b.o);
      }
      prof.preset = 'custom';
      refreshWidthEnvelope(path);
      drawMarkers();
    },

    onMouseUp() {
      mode = null;
    },

    onMouseHover(point) {
      if (hitMarker(point)) return 'pointer';
      if (mode) return null;
      const hit = nearestOn(point, PATH_TOL / paper.view.zoom);
      const p = hit ? hit.path : null;
      if (p !== shown) {
        shown = p;
        if (!active || active.path !== p) active = null;
        drawMarkers();
      }
      return p ? 'crosshair' : null;
    },

    onKeyDown(e) {
      if ((e.code === 'Delete' || e.code === 'Backspace') && active && active.path.parent) {
        e.preventDefault();
        removeWidthPoint(active.path, active.pt);
        refreshWidthEnvelope(active.path);
        active = null;
        drawMarkers();
      } else if (e.code === 'Escape') {
        shown = null;
        active = null;
        clearMarkers();
      }
    },

    onViewChange() {
      drawMarkers();
    },

    refreshSelection() {
      drawMarkers();
    },

    deactivate() {
      clearMarkers();
    },
  };
}
