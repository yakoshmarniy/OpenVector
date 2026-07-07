// Paper-side of the swatch library: applying swatches to items and keeping
// objects painted with a GLOBAL swatch in sync when the swatch is edited.
// The link is a tag on the item (data.fillSwatch / data.strokeSwatch = id);
// colours themselves stay plain paint, so everything else keeps working.

import paper from 'paper';
import { applyStyle } from './itemStyle.js';
import { artworkLayers, createSelection } from './selection.js';
import { notifySelectionChanged } from '../../state/selection.js';
import { bumpDocument } from '../../state/document.js';

// Module-level view over the shared selection so style edits made from the
// panels can redraw the overlay without owning tool state.
const selView = createSelection();

// Re-sync everything that mirrors the document after a style edit from a
// panel: overlay (width envelopes/arrowheads follow), App style, Layers.
export function afterStyleEdit() {
  selView.draw();
  notifySelectionChanged();
  bumpDocument();
  paper.view.update();
}

const TAG = { fill: 'fillSwatch', stroke: 'strokeSwatch' };

// Paint `which` ('fill' | 'stroke') of the items with the swatch. Global
// swatches tag the item; plain swatches (and None) clear the tag.
export function applySwatchTo(items, swatch, which) {
  const colorKey = which === 'stroke' ? 'strokeColor' : 'fillColor';
  const tagKey = TAG[which] || TAG.fill;
  items.forEach((item) => {
    applyStyle(item, { [colorKey]: swatch.color ?? null });
    if (!item.data) item.data = {};
    if (swatch.color && swatch.global) item.data[tagKey] = swatch.id;
    else delete item.data[tagKey];
  });
}

function taggedItems(id) {
  const out = [];
  artworkLayers().forEach((layer) => {
    layer.getItems({
      match: (it) => it.data && (it.data.fillSwatch === id || it.data.strokeSwatch === id),
    }).forEach((it) => out.push(it));
  });
  return out;
}

// A global swatch was edited — retint every object painted with it.
export function retintSwatch(swatch) {
  taggedItems(swatch.id).forEach((item) => {
    const patch = {};
    if (item.data.fillSwatch === swatch.id) patch.fillColor = swatch.color;
    if (item.data.strokeSwatch === swatch.id) patch.strokeColor = swatch.color;
    applyStyle(item, patch);
  });
}

// Before deleting a swatch: keep the objects' current colour, drop the link.
export function untagSwatch(id) {
  taggedItems(id).forEach((item) => {
    if (item.data.fillSwatch === id) delete item.data.fillSwatch;
    if (item.data.strokeSwatch === id) delete item.data.strokeSwatch;
  });
}
