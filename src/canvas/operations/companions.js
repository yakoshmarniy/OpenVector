import { clearArrowheads } from './arrowheads.js';
import { clearWidthEnvelope } from './widthProfile.js';
import { clearGradientFill } from './gradients.js';
import { clearMeshFill } from './mesh.js';
import { clearAppearanceCompanions } from './appearance.js';

// Companions = the separate render items (arrowheads, variable-width envelope,
// conic-gradient fan, gradient-mesh patches, extra appearance fills/strokes)
// that mirror a path but live as sibling items linked by `data.ownerId`. Any
// operation that CONSUMES a user object (boolean, pathfinder, compound, path
// ops, shape builder) must clean its companions first, or they orphan onto the
// canvas as locked, undeletable ghosts.

export function clearAllCompanions(item) {
  if (!item) return;
  clearArrowheads(item);
  clearWidthEnvelope(item);
  clearGradientFill(item);
  clearMeshFill(item);
  clearAppearanceCompanions(item);
}

// Strip companion CONFIG from an item's data. Boolean/path-op results are built
// by cloning an operand, so they inherit its width profile, gradient, mesh and
// appearance data — which would render the wrong (or invisible, when a width
// profile zeroes strokeWidth) result. Reset to a clean solid-styled path.
export function stripCompanionData(item) {
  if (!item || !item.data) return;
  if (item.data.width) {
    // A width profile hides the native stroke (strokeWidth 0) — restore it.
    if (!item.strokeWidth && item.data.width.base) item.strokeWidth = item.data.width.base;
    delete item.data.width;
  }
  delete item.data.arrows;
  delete item.data.fillGradient;
  delete item.data.strokeGradient;
  delete item.data.mesh;
  delete item.data.appearance;
}
