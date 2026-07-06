import paper from 'paper';
import { createSelection, pickItem, addOverlay } from '../operations/selection.js';
import { runSelectionAction } from '../operations/selectionActions.js';
import {
  collectWarpPaths,
  snapshotGeometry,
  deformFromSnapshot,
} from '../operations/puppetWarp.js';

// Puppet Warp — plant pins on an object, then drag a pin to bend the artwork
// around the others (rigid MLS deformation, no mesh). Click the object to add
// a pin, click a pin to select it (Shift adds), drag selected pins to warp,
// Delete removes them (the deformation stays baked), A selects all pins,
// Escape deselects / clears the pins.

const PIN_R = 6; // px

export function createPuppetWarpTool(ctx = {}) {
  let target = null; // top-level item being warped
  let paths = []; // its leaf paths
  let snapshot = null; // geometry at the last bake
  let pins = []; // { pos, orig, selected }
  let overlay = null;
  let dragging = false;

  const selection = createSelection(() => {
    syncTarget();
    drawPins();
  });

  // Re-base the deformation: current geometry becomes the reference and every
  // pin's original position is reset to where it stands now. Done whenever the
  // pin set changes, so gestures compose sequentially without drift.
  const bake = () => {
    snapshot = snapshotGeometry(paths);
    pins.forEach((pin) => {
      pin.orig = pin.pos.clone();
    });
  };

  function setTarget(item) {
    target = item;
    paths = item ? collectWarpPaths(item) : [];
    pins = [];
    snapshot = paths.length ? snapshotGeometry(paths) : null;
    if (item) selection.setTarget(item);
  }

  function syncTarget() {
    const sel = selection.targets;
    const next = sel.length === 1 ? sel[0] : null;
    if (next !== target) {
      target = next;
      paths = next ? collectWarpPaths(next) : [];
      pins = [];
      snapshot = paths.length ? snapshotGeometry(paths) : null;
    }
  }

  const clearOverlay = () => {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  };

  function drawPins() {
    clearOverlay();
    if (!pins.length) return;
    const z = paper.view.zoom;
    overlay = new paper.Group();
    pins.forEach((pin) => {
      const ring = new paper.Path.Circle({ center: pin.pos, radius: PIN_R / z });
      ring.fillColor = new paper.Color(pin.selected ? '#7fd4ff' : '#eef1f4');
      ring.strokeColor = new paper.Color('#3a3d41');
      ring.strokeWidth = 1.4 / z;
      overlay.addChild(ring);
      const dotEl = new paper.Path.Circle({ center: pin.pos, radius: 1.6 / z });
      dotEl.fillColor = new paper.Color('#3a3d41');
      overlay.addChild(dotEl);
    });
    addOverlay(overlay);
    overlay.bringToFront();
  }

  const hitPin = (point) => {
    const tol = (PIN_R + 3) / paper.view.zoom;
    for (let i = pins.length - 1; i >= 0; i -= 1) {
      if (pins[i].pos.getDistance(point) <= tol) return pins[i];
    }
    return null;
  };

  const deform = () => {
    if (!snapshot || !pins.length) return;
    const mls = pins.map((pin) => ({
      p: { x: pin.orig.x, y: pin.orig.y },
      q: { x: pin.pos.x, y: pin.pos.y },
    }));
    deformFromSnapshot(paths, snapshot, mls);
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point, e) {
      const pin = hitPin(point);
      if (pin) {
        if (e && e.shiftKey) pin.selected = !pin.selected;
        else if (!pin.selected) {
          pins.forEach((p) => {
            p.selected = false;
          });
          pin.selected = true;
        }
        dragging = true;
        drawPins();
        return;
      }

      const item = pickItem(point);
      if (item && item === target) {
        // Plant a new pin; the current geometry becomes the new reference.
        bake();
        pins.forEach((p) => {
          p.selected = false;
        });
        pins.push({ pos: point.clone(), orig: point.clone(), selected: true });
        dragging = true;
        drawPins();
        return;
      }
      if (item) {
        setTarget(item);
        drawPins();
        return;
      }
      // Clicked empty space — keep the target, just drop pin selection.
      pins.forEach((p) => {
        p.selected = false;
      });
      drawPins();
    },

    onMouseDrag(point, delta) {
      if (!dragging || !pins.some((p) => p.selected)) return;
      pins.forEach((pin) => {
        if (pin.selected) pin.pos = pin.pos.add(delta);
      });
      deform();
      drawPins();
      selection.draw();
    },

    onMouseUp() {
      dragging = false;
    },

    onKeyDown(e) {
      if (e.code === 'Delete' || e.code === 'Backspace') {
        if (pins.some((p) => p.selected)) {
          e.preventDefault();
          pins = pins.filter((p) => !p.selected);
          bake(); // deformation stays; remaining pins re-anchor here
          drawPins();
        }
      } else if (e.code === 'KeyA' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (pins.length) {
          e.preventDefault();
          pins.forEach((p) => {
            p.selected = true;
          });
          drawPins();
        }
      } else if (e.code === 'Escape') {
        if (pins.some((p) => p.selected)) {
          pins.forEach((p) => {
            p.selected = false;
          });
        } else {
          pins = [];
        }
        drawPins();
      }
    },

    runAction(name) {
      runSelectionAction(selection, name);
    },

    onViewChange() {
      drawPins();
      selection.draw();
    },

    refreshSelection() {
      drawPins();
      selection.draw();
    },

    deactivate() {
      clearOverlay();
      selection.dispose();
    },
  };
}
