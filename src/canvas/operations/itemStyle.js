import { isTextItem, readTextStyle, applyTextStyle } from './textLayout.js';

// Read/write the visual style of a Paper.js item as plain serialisable values,
// so React (the Properties panel) can drive it without touching paper directly.
// Text items are groups of glyphs, handled by textLayout.

const DEFAULT_FILL = '#b9bcc0';
const DEFAULT_STROKE = '#7d8186';

export function readStyle(item) {
  if (isTextItem(item)) return readTextStyle(item);

  return {
    hasFill: !!item.fillColor,
    fillColor: item.fillColor ? item.fillColor.toCSS(true) : DEFAULT_FILL,
    hasStroke: !!item.strokeColor,
    strokeColor: item.strokeColor ? item.strokeColor.toCSS(true) : DEFAULT_STROKE,
    strokeWidth: item.strokeWidth ?? 0,
    opacity: item.opacity ?? 1,
    isText: false,
  };
}

// patch keys are optional; a key set to null clears that paint.
export function applyStyle(item, patch) {
  if (isTextItem(item)) {
    applyTextStyle(item, patch);
    return;
  }
  if ('fillColor' in patch) item.fillColor = patch.fillColor;
  if ('strokeColor' in patch) item.strokeColor = patch.strokeColor;
  if ('strokeWidth' in patch) item.strokeWidth = patch.strokeWidth;
  if ('opacity' in patch) item.opacity = patch.opacity;
}
