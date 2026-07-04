import paper from 'paper';
import { createSelection, pickItem, addOverlay } from '../operations/selection.js';
import { runSelectionAction } from '../operations/selectionActions.js';
import {
  rotateItems,
  scaleItems,
  shearItems,
  reflectItems,
  recordTransform,
  getScaleStrokes,
  scaleStrokeWidths,
} from '../operations/transform.js';
import { refreshArrowheads } from '../operations/arrowheads.js';

// Rotate / Reflect / Scale / Shear tools. All four share the same pattern:
// a movable pivot (single click repositions it, default = selection centre),
// drag transforms the selection around it, Shift constrains, Alt-drag
// transforms a copy. The finished gesture is recorded for Transform Again.

const CLICK_TOL = 3; // px of drag below which a gesture counts as a click

function makeTransformTool(kind, ctx = {}) {
  let pivot = null; // explicit pivot; null → follow the selection centre
  let marker = null;

  let mode = null; // 'gesture' | null
  let start = null;
  let moved = false;
  let copied = false;
  // Per-kind incremental state.
  let applied = null;
  let shearAxis = null; // 'x' | 'y', chosen at first significant drag
  let reflectAngle = null; // current axis angle (null until first apply)
  let strokeFactor = 1; // accumulated stroke-width factor (scale tool)

  const selection = createSelection(() => drawMarker());

  const pivotPoint = () => {
    if (pivot) return pivot;
    const b = selection.bounds;
    return b ? b.center : null;
  };

  const clearMarker = () => {
    if (marker) {
      marker.remove();
      marker = null;
    }
  };

  function drawMarker() {
    clearMarker();
    const p = pivotPoint();
    if (!p) return;
    const z = paper.view.zoom;
    marker = new paper.Group();
    const ring = new paper.Path.Circle({ center: p, radius: 4 / z });
    ring.strokeColor = new paper.Color('#7fd4ff');
    ring.strokeWidth = 1.2 / z;
    ring.fillColor = null;
    const l1 = new paper.Path.Line(p.subtract([8 / z, 0]), p.add([8 / z, 0]));
    const l2 = new paper.Path.Line(p.subtract([0, 8 / z]), p.add([0, 8 / z]));
    [l1, l2].forEach((l) => {
      l.strokeColor = new paper.Color('#7fd4ff');
      l.strokeWidth = 1 / z;
      marker.addChild(l);
    });
    marker.addChild(ring);
    addOverlay(marker);
    marker.bringToFront();
  }

  const snapAngle = (deg, step) => Math.round(deg / step) * step;

  // The store only notifies on changes — draw for the selection we start with.
  drawMarker();

  return {
    cursor: 'crosshair',

    onMouseDown(point, e) {
      // Convenience: with nothing selected, pick up the object under the cursor.
      if (!selection.targets.length) {
        const item = pickItem(point);
        if (item) selection.setTarget(item);
      }
      if (!selection.targets.length) return;

      mode = 'gesture';
      start = point;
      moved = false;
      copied = false;
      applied = null;
      shearAxis = null;
      reflectAngle = null;
      strokeFactor = 1;

      if (e && e.altKey) {
        // Transform a copy: originals stay, the clones take the gesture.
        selection.setTargets(selection.targets.map((t) => {
          const c = t.clone();
          refreshArrowheads(c);
          return c;
        }));
        copied = true;
      }
    },

    onMouseDrag(point, delta, e) {
      if (mode !== 'gesture' || !selection.targets.length) return;
      if (!moved && point.getDistance(start) * paper.view.zoom < CLICK_TOL) return;
      moved = true;
      const p = pivotPoint();
      if (!p) return;
      const targets = selection.targets;

      if (kind === 'rotate') {
        const a0 = start.subtract(p).angle;
        let desired = point.subtract(p).angle - a0;
        if (e && e.shiftKey) desired = snapAngle(desired, 45);
        const step = desired - (applied ?? 0);
        if (step) {
          rotateItems(targets, step, p);
          applied = desired;
          selection.draw();
        }
      } else if (kind === 'scale') {
        const v0 = start.subtract(p);
        const v1 = point.subtract(p);
        let dsx;
        let dsy;
        if (e && e.shiftKey) {
          // Uniform scale from the distance ratio.
          const d0 = v0.length;
          const s = d0 > 1e-3 ? v1.length / d0 : 1;
          dsx = s;
          dsy = s;
        } else {
          dsx = Math.abs(v0.x) > 4 ? v1.x / v0.x : 1;
          dsy = Math.abs(v0.y) > 4 ? v1.y / v0.y : 1;
        }
        if (!Number.isFinite(dsx) || Math.abs(dsx) < 0.01) dsx = applied ? applied.sx : 1;
        if (!Number.isFinite(dsy) || Math.abs(dsy) < 0.01) dsy = applied ? applied.sy : 1;
        const prev = applied ?? { sx: 1, sy: 1 };
        const stepX = dsx / prev.sx;
        const stepY = dsy / prev.sy;
        if (stepX !== 1 || stepY !== 1) {
          // Strokes are scaled once on mouse-up from the accumulated factor —
          // per-frame multiplication would compound float error.
          scaleItems(targets, stepX, stepY, p, false);
          applied = { sx: dsx, sy: dsy };
          selection.draw();
        }
      } else if (kind === 'shear') {
        const raw = point.subtract(start);
        if (!shearAxis) shearAxis = Math.abs(raw.x) >= Math.abs(raw.y) ? 'x' : 'y';
        let desired;
        if (shearAxis === 'x') {
          const lever = start.y - p.y;
          if (Math.abs(lever) < 4) return;
          desired = raw.x / lever;
        } else {
          const lever = start.x - p.x;
          if (Math.abs(lever) < 4) return;
          desired = raw.y / lever;
        }
        if (e && e.shiftKey) {
          const deg = snapAngle((Math.atan(desired) * 180) / Math.PI, 15);
          desired = Math.tan((deg * Math.PI) / 180);
        }
        const step = desired - (applied ?? 0);
        if (Math.abs(step) > 1e-4) {
          shearItems(targets, shearAxis === 'x' ? step : 0, shearAxis === 'y' ? step : 0, p);
          applied = desired;
          selection.draw();
        }
      } else if (kind === 'reflect') {
        let theta = point.subtract(p).angle;
        if (e && e.shiftKey) theta = snapAngle(theta, 45);
        if (reflectAngle === null) {
          reflectItems(targets, theta, p);
          reflectAngle = theta;
          selection.draw();
        } else if (theta !== reflectAngle) {
          // Changing the mirror axis θ1→θ2 equals a rotation by 2(θ2−θ1).
          rotateItems(targets, 2 * (theta - reflectAngle), p);
          reflectAngle = theta;
          selection.draw();
        }
      }
    },

    onMouseUp(point) {
      if (mode === 'gesture') {
        if (!moved) {
          // A plain click just repositions the pivot.
          pivot = point.clone();
        } else {
          const p = pivotPoint();
          const pv = p ? { x: p.x, y: p.y } : null;
          if (kind === 'rotate' && applied) {
            recordTransform({ kind: 'rotate', angle: applied, pivot: pv, copy: copied });
          } else if (kind === 'scale' && applied) {
            if (getScaleStrokes()) {
              strokeFactor = (Math.abs(applied.sx) + Math.abs(applied.sy)) / 2;
              scaleStrokeWidths(selection.targets, strokeFactor);
            }
            recordTransform({
              kind: 'scale', sx: applied.sx, sy: applied.sy, pivot: pv, copy: copied,
              withStrokes: getScaleStrokes(),
            });
          } else if (kind === 'shear' && applied) {
            recordTransform({
              kind: 'shear',
              shx: shearAxis === 'x' ? applied : 0,
              shy: shearAxis === 'y' ? applied : 0,
              pivot: pv,
              copy: copied,
            });
          } else if (kind === 'reflect' && reflectAngle !== null) {
            recordTransform({ kind: 'reflect', angle: reflectAngle, pivot: pv, copy: copied });
          }
          selection.draw();
        }
      }
      mode = null;
      start = null;
      drawMarker();
    },

    onKeyDown(e) {
      if (e.code === 'Escape') {
        // Reset the pivot back to the selection centre.
        pivot = null;
        drawMarker();
        e.preventDefault();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selection.targets.length) {
          e.preventDefault();
          runSelectionAction(selection, 'delete');
          clearMarker();
        }
      }
    },

    runAction(name) {
      runSelectionAction(selection, name);
    },

    onViewChange() {
      selection.draw();
      drawMarker();
    },

    refreshSelection() {
      selection.draw();
      drawMarker();
    },

    deactivate() {
      clearMarker();
      selection.dispose();
    },
  };
}

export const createRotateTool = (ctx) => makeTransformTool('rotate', ctx);
export const createReflectTool = (ctx) => makeTransformTool('reflect', ctx);
export const createScaleTool = (ctx) => makeTransformTool('scale', ctx);
export const createShearTool = (ctx) => makeTransformTool('shear', ctx);
