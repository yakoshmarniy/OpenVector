import paper from 'paper';
import { isTextItem, readTextStyle, applyTextStyle } from './textLayout.js';
import { refreshArrowheads } from './arrowheads.js';
import {
  hasWidthProfile,
  getWidthProfile,
  setBaseWidth,
  applyWidthPreset,
  refreshWidthEnvelope,
} from './widthProfile.js';
import { getGradient, clearGradient, refreshGradientFill } from './gradients.js';
import { clearMesh, refreshMesh } from './mesh.js';

// Read/write the visual style of a Paper.js item as plain serialisable values,
// so React (the Properties panel) can drive it without touching paper directly.
// Text items are groups of glyphs, handled by textLayout.

const DEFAULT_FILL = '#b9bcc0';
const DEFAULT_STROKE = '#7d8186';

// A plain hex for the paint swatch: a gradient has none, so fall back to its
// first stop; a solid Color gives its CSS hex.
function solidHex(color, gradient, fallback) {
  if (gradient && gradient.stops && gradient.stops.length) return gradient.stops[0].color;
  if (color && color.type !== 'gradient') return color.toCSS(true);
  return fallback;
}

// Classify the dash pattern back into the three UI presets.
function lineTypeOf(dashArray, cap) {
  if (!dashArray || !dashArray.length) return 'solid';
  if (dashArray[0] === 0 && cap === 'round') return 'dotted';
  return 'dashed';
}

export function readStyle(item) {
  if (isTextItem(item)) return readTextStyle(item);

  const dashArray = item.dashArray && item.dashArray.length ? item.dashArray.slice() : [];
  const strokeCap = item.strokeCap || 'butt';
  const arrows = (item.data && item.data.arrows) || {};
  const fillGradient = getGradient(item, 'fill');
  const strokeGradient = getGradient(item, 'stroke');
  return {
    hasFill: !!item.fillColor,
    // A gradient Color has no single hex — report the first stop for the swatch.
    fillColor: solidHex(item.fillColor, fillGradient, DEFAULT_FILL),
    fillGradient,
    hasStroke: !!item.strokeColor,
    strokeColor: solidHex(item.strokeColor, strokeGradient, DEFAULT_STROKE),
    strokeGradient,
    // With a width profile the native strokeWidth is 0 — report the nominal.
    strokeWidth: hasWidthProfile(item) ? getWidthProfile(item).base : (item.strokeWidth ?? 0),
    widthPreset: hasWidthProfile(item) ? (getWidthProfile(item).preset || 'custom') : 'uniform',
    strokeCap,
    strokeJoin: item.strokeJoin || 'miter',
    dashArray,
    lineType: lineTypeOf(dashArray, strokeCap),
    opacity: item.opacity ?? 1,
    // Arrowheads only make sense on open paths.
    isOpenPath: item instanceof paper.Path && !item.closed,
    arrowStart: !!arrows.start,
    arrowEnd: !!arrows.end,
    arrowScale: arrows.scale || 1,
    isText: false,
  };
}

// patch keys are optional; a key set to null clears that paint.
export function applyStyle(item, patch) {
  if (isTextItem(item)) {
    applyTextStyle(item, patch);
    return;
  }
  // Wrap CSS strings in paper.Color: assigning a string stores it lazily, and
  // a second assignment before a render throws ("_canvasStyle on string").
  // A solid paint replaces any gradient that was on that channel.
  if ('fillColor' in patch) {
    clearGradient(item, 'fill');
    clearMesh(item);
    item.fillColor = patch.fillColor ? new paper.Color(patch.fillColor) : null;
  }
  if ('strokeColor' in patch) {
    clearGradient(item, 'stroke');
    item.strokeColor = patch.strokeColor ? new paper.Color(patch.strokeColor) : null;
  }
  if ('strokeWidth' in patch) {
    if (hasWidthProfile(item)) setBaseWidth(item, patch.strokeWidth);
    else item.strokeWidth = patch.strokeWidth;
  }
  if ('widthPreset' in patch) applyWidthPreset(item, patch.widthPreset);
  if ('strokeCap' in patch) item.strokeCap = patch.strokeCap;
  if ('strokeJoin' in patch) item.strokeJoin = patch.strokeJoin;
  if ('dashArray' in patch) item.dashArray = patch.dashArray || [];
  if ('opacity' in patch) item.opacity = patch.opacity;

  if ('arrowStart' in patch || 'arrowEnd' in patch || 'arrowScale' in patch) {
    const arrows = { ...(item.data.arrows || {}) };
    if ('arrowStart' in patch) arrows.start = patch.arrowStart;
    if ('arrowEnd' in patch) arrows.end = patch.arrowEnd;
    if ('arrowScale' in patch) arrows.scale = patch.arrowScale;
    item.data.arrows = arrows;
  }

  // Stroke colour / width / arrow toggles all change the heads — rebuild them.
  refreshArrowheads(item);
  // Same for the variable-width envelope (colour, weight, opacity, preset).
  refreshWidthEnvelope(item);
  // Same for the conic gradient companion fan.
  refreshGradientFill(item);
  // Same for the gradient-mesh companion.
  refreshMesh(item);
}
