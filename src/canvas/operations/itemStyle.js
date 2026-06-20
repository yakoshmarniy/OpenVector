import { isTextItem, relayout, DEFAULT_FONT_SIZE } from './textLayout.js';

// Read/write the visual style of a Paper.js item as plain serialisable values,
// so React (the Properties panel) can drive it without touching paper directly.

const DEFAULT_FILL = '#b9bcc0';
const DEFAULT_STROKE = '#7d8186';

export function readStyle(item) {
  const style = {
    hasFill: !!item.fillColor,
    fillColor: item.fillColor ? item.fillColor.toCSS(true) : DEFAULT_FILL,
    hasStroke: !!item.strokeColor,
    strokeColor: item.strokeColor ? item.strokeColor.toCSS(true) : DEFAULT_STROKE,
    strokeWidth: item.strokeWidth ?? 0,
    opacity: item.opacity ?? 1,
    isText: false,
  };

  if (isTextItem(item)) {
    style.isText = true;
    style.fontSize = item.fontSize ?? DEFAULT_FONT_SIZE;
    style.leading = item.leading ?? Math.round((item.fontSize ?? DEFAULT_FONT_SIZE) * 1.2);
    style.justification = item.justification ?? 'left';
  }

  return style;
}

// patch keys are optional; a key set to null clears that paint.
export function applyStyle(item, patch) {
  if ('fillColor' in patch) item.fillColor = patch.fillColor;
  if ('strokeColor' in patch) item.strokeColor = patch.strokeColor;
  if ('strokeWidth' in patch) item.strokeWidth = patch.strokeWidth;
  if ('opacity' in patch) item.opacity = patch.opacity;

  if ('fontSize' in patch) item.fontSize = patch.fontSize;
  if ('leading' in patch) item.leading = patch.leading;
  if ('justification' in patch) item.justification = patch.justification;

  // Text geometry depends on these, so re-flow after changing them.
  if (isTextItem(item) && ('fontSize' in patch || 'leading' in patch || 'justification' in patch)) {
    relayout(item);
  }
}
