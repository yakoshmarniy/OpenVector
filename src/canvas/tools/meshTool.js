import paper from 'paper';
import { createSelection, pickItem, addOverlay } from '../operations/selection.js';
import { afterStyleEdit } from '../operations/swatchOps.js';
import {
  hasMesh, createMesh, refreshMesh, hitPoint, pointPosition, setPointPosition,
} from '../operations/mesh.js';
import { setActiveMeshPoint, clearActiveMeshPoint, getActiveMeshPoint } from '../../state/mesh.js';

// Mesh Tool. Click a filled path with no mesh → give it a default 3×3 gradient
// mesh (nodes start at the fill colour, so nothing jumps; the lattice appears).
// Click a node to select it (recolour via the Properties Mesh section); drag a
// node to warp the mesh. The node grid is drawn as an overlay of mesh lines and
// square handles that track the shape.

const HANDLE = '#7fd4ff';
const HIT_PX = 8;

export function createMeshTool(ctx = {}) {
  let overlay = null;
  let drag = null; // { r, c } while dragging a node

  const selection = createSelection(() => drawGrid());
  const primary = () => selection.targets.find((t) => t instanceof paper.Path) || null;

  const clearOverlay = () => {
    if (overlay) { overlay.remove(); overlay = null; }
  };

  function drawGrid() {
    clearOverlay();
    const item = primary();
    if (!item || !hasMesh(item)) return;
    const mesh = item.data.mesh;
    const z = paper.view.zoom;
    const r = HIT_PX / z;
    overlay = new paper.Group();
    overlay.data.meshWidget = true;

    // Mesh lines.
    for (let i = 0; i < mesh.rows; i += 1) {
      const pts = [];
      for (let j = 0; j < mesh.cols; j += 1) pts.push(pointPosition(item, i, j));
      const line = new paper.Path(pts);
      line.strokeColor = HANDLE; line.strokeWidth = 0.75 / z;
      overlay.addChild(line);
    }
    for (let j = 0; j < mesh.cols; j += 1) {
      const pts = [];
      for (let i = 0; i < mesh.rows; i += 1) pts.push(pointPosition(item, i, j));
      const line = new paper.Path(pts);
      line.strokeColor = HANDLE; line.strokeWidth = 0.75 / z;
      overlay.addChild(line);
    }
    // Node handles.
    const active = getActiveMeshPoint();
    for (let i = 0; i < mesh.rows; i += 1) {
      for (let j = 0; j < mesh.cols; j += 1) {
        const p = pointPosition(item, i, j);
        const h = new paper.Path.Rectangle({
          rectangle: new paper.Rectangle(p.subtract(r * 0.6), new paper.Size(r * 1.2, r * 1.2)),
        });
        const on = active && active.item === item && active.r === i && active.c === j;
        h.fillColor = on ? HANDLE : new paper.Color(mesh.points[i][j].color);
        h.strokeColor = HANDLE; h.strokeWidth = 1.2 / z;
        h.data.meshNode = { r: i, c: j };
        overlay.addChild(h);
      }
    }
    addOverlay(overlay);
    overlay.bringToFront();
  }

  drawGrid();

  const rebuild = (item) => {
    refreshMesh(item);
    drawGrid();
    afterStyleEdit();
    paper.view.update();
  };

  return {
    cursor: 'crosshair',

    onMouseDown(point) {
      let item = primary();
      // Selecting/creating a target.
      if (!item || !hasMesh(item)) {
        const hit = pickItem(point);
        if (hit && hit instanceof paper.Path) {
          if (!selection.has(hit)) selection.setTarget(hit);
          item = hit;
        }
        if (!item || !(item instanceof paper.Path)) { clearActiveMeshPoint(); return; }
        if (!hasMesh(item)) {
          createMesh(item, 3, 3, 'flat');
          drawGrid();
          afterStyleEdit();
          paper.view.update();
          return;
        }
      }

      // Hit a node?
      const node = hitPoint(item, point, HIT_PX / paper.view.zoom);
      if (node) {
        setActiveMeshPoint({ item, r: node.r, c: node.c });
        drag = node;
        drawGrid();
        return;
      }
      clearActiveMeshPoint();
      drawGrid();
    },

    onMouseDrag(point) {
      const item = primary();
      if (!item || !drag) return;
      setPointPosition(item, drag.r, drag.c, point);
      rebuild(item);
    },

    onMouseUp() { drag = null; },

    onViewChange() { drawGrid(); },
    refreshSelection() { drawGrid(); },
    deactivate() { clearOverlay(); clearActiveMeshPoint(); selection.dispose(); },
  };
}
