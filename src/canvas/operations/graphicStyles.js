import { readStyle, applyStyle } from './itemStyle.js';
import { getAppearance, clearAppearance, refreshAppearance } from './appearance.js';

// Graphic Styles — capture the full appearance of an object into a plain
// serialisable bundle, and apply such a bundle back onto any object. Used by
// the Graphic Styles panel (save/apply a named set) and to render previews.
//
// A bundle carries the object's base fill/stroke, stroke attributes, opacity,
// arrowheads, width profile preset and any extra appearance fills/strokes.

let counter = 0;
const nextId = () => `apx${(counter += 1)}`;

export function captureStyle(item) {
  const s = readStyle(item);
  if (s.isText) return null;
  const extras = (getAppearance(item) || []).map((l) => {
    const copy = { ...l };
    delete copy.id;
    return copy;
  });
  return {
    fill: s.hasFill ? s.fillColor : null,
    stroke: s.hasStroke ? s.strokeColor : null,
    strokeWidth: s.strokeWidth,
    strokeCap: s.strokeCap,
    strokeJoin: s.strokeJoin,
    miterLimit: s.miterLimit,
    dashArray: s.dashArray ? s.dashArray.slice() : [],
    opacity: s.opacity,
    widthPreset: s.widthPreset,
    arrows: (s.arrowStart || s.arrowEnd)
      ? { start: s.arrowStart, end: s.arrowEnd, startScale: s.arrowStartScale, endScale: s.arrowEndScale }
      : null,
    appearance: extras,
  };
}

export function applyGraphicStyle(item, bundle) {
  if (!item || !bundle) return;
  const s = readStyle(item);
  if (s.isText) return;

  // Base paint + stroke attributes go through the normal style pipeline.
  applyStyle(item, {
    fillColor: bundle.fill ?? null,
    strokeColor: bundle.stroke ?? null,
    strokeWidth: bundle.strokeWidth ?? 1,
    strokeCap: bundle.strokeCap || 'butt',
    strokeJoin: bundle.strokeJoin || 'miter',
    miterLimit: bundle.miterLimit ?? 10,
    dashArray: bundle.dashArray ? bundle.dashArray.slice() : [],
    opacity: bundle.opacity ?? 1,
    widthPreset: bundle.widthPreset || 'uniform',
    arrowStart: !!(bundle.arrows && bundle.arrows.start),
    arrowEnd: !!(bundle.arrows && bundle.arrows.end),
    arrowStartScale: (bundle.arrows && bundle.arrows.startScale) ?? 1,
    arrowEndScale: (bundle.arrows && bundle.arrows.endScale) ?? 1,
  });

  // Replace extra appearance fills/strokes wholesale (fresh ids).
  clearAppearance(item);
  if (bundle.appearance && bundle.appearance.length) {
    item.data.appearance = bundle.appearance.map((l) => ({ ...l, id: nextId() }));
    refreshAppearance(item);
  }
}
