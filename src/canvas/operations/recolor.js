// Recolor Artwork core: extract the distinct paint colours used by a
// selection (fills and strokes, walking groups; text groups are leaves whose
// colours live in group.data) and apply replacement colours back. Every write
// goes through applyStyle so text, arrowheads and width envelopes follow.

import { readStyle, applyStyle } from './itemStyle.js';
import { isTransientItem } from './isolation.js';
import { normHex } from './colorConvert.js';
import { toHsb } from './harmony.js';

// → [{ hex, uses: [{ item, key }] }] sorted by hue (grays last, dark→light).
// `key` is 'fillColor' | 'strokeColor' — the applyStyle patch key.
export function collectColors(items) {
  const map = new Map();
  const add = (raw, item, key) => {
    const hex = normHex(raw);
    if (!hex) return;
    if (!map.has(hex)) map.set(hex, []);
    map.get(hex).push({ item, key });
  };

  const visit = (item) => {
    if (!item || isTransientItem(item)) return;
    if (item.data && item.data.isText) {
      const s = readStyle(item);
      if (s.hasFill) add(s.fillColor, item, 'fillColor');
      if (s.hasStroke) add(s.strokeColor, item, 'strokeColor');
      return;
    }
    if (item.className === 'Group') {
      item.children.forEach(visit);
      return;
    }
    if (item.fillColor) add(item.fillColor.toCSS(true), item, 'fillColor');
    if (item.strokeColor) add(item.strokeColor.toCSS(true), item, 'strokeColor');
  };
  (items || []).forEach(visit);

  const entries = [...map.entries()].map(([hex, uses]) => ({ hex, uses }));
  entries.sort((a, b) => {
    const ha = toHsb(a.hex);
    const hb = toHsb(b.hex);
    const grayA = ha.s < 8;
    const grayB = hb.s < 8;
    if (grayA !== grayB) return grayA ? 1 : -1;
    return grayA ? ha.b - hb.b : ha.h - hb.h;
  });
  return entries;
}

// Paint every use of each entry with `next` (skips no-ops and useless rows).
export function applyAssignments(entries) {
  entries.forEach((entry) => {
    const next = normHex(entry.next);
    if (!next) return;
    entry.uses.forEach(({ item, key }) => applyStyle(item, { [key]: next }));
  });
}

// Cancel path: restore every use to the colour it had when collected.
export function restoreOriginals(entries) {
  entries.forEach((entry) => {
    entry.uses.forEach(({ item, key }) => applyStyle(item, { [key]: entry.hex }));
  });
}
