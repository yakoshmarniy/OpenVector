import paper from 'paper';

// Text is a Group of per-character PointText glyphs (data.glyph). The group
// carries all text state in data. Per-glyph layout is what lets us do letter
// spacing (tracking) and type-on-a-path — neither of which Paper's PointText
// supports on its own. Glyphs are positioned in the group's LOCAL coordinates
// (anchored to data.origin), so moving the group via its matrix just works and
// a re-layout after a move stays put.

export const DEFAULT_FONT_SIZE = 20;
const DEFAULT_TEXT_COLOR = '#c7c9cc';
const DEFAULT_FONT = 'sans-serif';
const DEFAULT_FILL = '#b9bcc0';
const DEFAULT_STROKE = '#7d8186';

let measureCtx = null;
// Advance width (what determines spacing), via an offscreen 2D context.
function advance(text, fontSize, fontFamily) {
  if (!text) return 0;
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  measureCtx.font = `${fontSize}px ${fontFamily}`;
  return measureCtx.measureText(text).width;
}

export function isTextItem(item) {
  return !!(item && item.data && item.data.isText);
}

// Map a hit item (possibly a child glyph) to its text group, else return null.
export function textEntity(item) {
  if (!item) return null;
  if (item.data && item.data.isText) return item;
  if (item.data && item.data.glyph && item.parent && item.parent.data && item.parent.data.isText) {
    return item.parent;
  }
  return null;
}

function lineWidth(line, fs, ff, tr) {
  if (!line) return 0;
  return advance(line, fs, ff) + tr * Math.max(0, line.length - 1);
}

function wrap(raw, width, fs, ff, tr) {
  const out = [];
  raw.split('\n').forEach((para) => {
    if (!para) {
      out.push('');
      return;
    }
    let line = '';
    para.split(' ').forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (!line || lineWidth(test, fs, ff, tr) <= width) line = test;
      else {
        out.push(line);
        line = word;
      }
    });
    out.push(line);
  });
  return out.join('\n');
}

export function createTextItem({ point, areaWidth = null, areaHeight = null, path = null }) {
  const group = new paper.Group();
  const d = group.data;
  d.isText = true;
  d.rawText = '';
  d.fontSize = DEFAULT_FONT_SIZE;
  d.fontFamily = DEFAULT_FONT;
  d.fillColor = DEFAULT_TEXT_COLOR;
  d.strokeColor = null;
  d.strokeWidth = 0;
  d.leading = DEFAULT_FONT_SIZE * 1.2;
  d.tracking = 0;
  d.justification = 'left';

  if (path) {
    d.mode = 'path';
    const guide = path.clone({ insert: false });
    guide.data = { isTextGuide: true };
    guide.fillColor = null;
    guide.strokeColor = null;
    guide.locked = true;
    group.addChild(guide);
    d.originX = 0;
    d.originY = 0;
  } else {
    d.mode = areaWidth ? 'area' : 'point';
    d.areaWidth = areaWidth;
    d.areaHeight = areaHeight;
    d.originX = point.x;
    d.originY = point.y;
  }
  return group;
}

export function setRawText(group, raw) {
  group.data.rawText = raw;
  relayout(group);
}

function styleGlyph(glyph, d) {
  glyph.fillColor = d.fillColor ? new paper.Color(d.fillColor) : null;
  if (d.strokeColor) {
    glyph.strokeColor = new paper.Color(d.strokeColor);
    glyph.strokeWidth = d.strokeWidth || 1;
  }
  glyph.data.glyph = true;
}

function layoutBlock(group) {
  const d = group.data;
  const { fontSize: fs, fontFamily: ff, tracking: tr } = d;
  const raw = d.rawText || '';
  const w = d.mode === 'area' ? d.areaWidth : null;
  const lines = w ? wrap(raw, w, fs, ff, tr).split('\n') : raw.split('\n');

  lines.forEach((line, li) => {
    const baseY = d.originY + fs + d.leading * li;
    const lw = lineWidth(line, fs, ff, tr);
    let startX = d.originX;
    if (d.justification === 'center') startX = w ? d.originX + (w - lw) / 2 : d.originX - lw / 2;
    else if (d.justification === 'right') startX = w ? d.originX + (w - lw) : d.originX - lw;

    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === ' ') continue; // advance is counted; no glyph needed
      const x = startX + advance(line.slice(0, i), fs, ff) + tr * i;
      const g = new paper.PointText({
        point: [x, baseY],
        content: ch,
        fontSize: fs,
        fontFamily: ff,
        justification: 'left',
      });
      styleGlyph(g, d);
      group.addChild(g);
    }
  });
}

function layoutPath(group) {
  const d = group.data;
  const { fontSize: fs, fontFamily: ff, tracking: tr } = d;
  const guide = group.children.find((c) => c.data && c.data.isTextGuide);
  if (!guide) return;
  const len = guide.length;
  const text = (d.rawText || '').replace(/\n/g, ' ');

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const off = advance(text.slice(0, i), fs, ff) + tr * i + advance(ch, fs, ff) / 2;
    if (off > len) break;
    if (ch === ' ') continue;
    const gpt = guide.getPointAt(off);
    if (!gpt) continue;
    const tan = guide.getTangentAt(off) || new paper.Point(1, 0);
    const localPt = group.globalToLocal(gpt);
    const g = new paper.PointText({
      point: localPt,
      content: ch,
      fontSize: fs,
      fontFamily: ff,
      justification: 'center',
    });
    styleGlyph(g, d);
    group.addChild(g);
    g.rotate(tan.angle, localPt);
  }
}

export function relayout(group) {
  group.children.filter((c) => c.data && c.data.glyph).forEach((c) => c.remove());
  if (group.data.mode === 'path') layoutPath(group);
  else layoutBlock(group);
}

// Caret endpoints in GLOBAL coordinates (the caret overlay lives outside group).
export function caretSegment(group) {
  const d = group.data;
  const { fontSize: fs, fontFamily: ff, tracking: tr } = d;

  if (d.mode === 'path') {
    const guide = group.children.find((c) => c.data && c.data.isTextGuide);
    const text = (d.rawText || '').replace(/\n/g, ' ');
    const len = guide ? guide.length : 0;
    const off = Math.min(advance(text, fs, ff) + tr * text.length, len);
    const gpt = guide ? guide.getPointAt(off) : new paper.Point(0, 0);
    const tan = (guide && guide.getTangentAt(off)) || new paper.Point(1, 0);
    const normal = tan.rotate(-90);
    return { from: gpt, to: gpt.add(normal.multiply(fs)) };
  }

  const raw = d.rawText || '';
  const lines = d.mode === 'area' ? wrap(raw, d.areaWidth, fs, ff, tr).split('\n') : raw.split('\n');
  const li = lines.length - 1;
  const last = lines[li];
  const baseY = d.originY + fs + d.leading * li;
  const lw = lineWidth(last, fs, ff, tr);
  let startX = d.originX;
  const w = d.mode === 'area' ? d.areaWidth : null;
  if (d.justification === 'center') startX = w ? d.originX + (w - lw) / 2 : d.originX - lw / 2;
  else if (d.justification === 'right') startX = w ? d.originX + (w - lw) : d.originX - lw;
  const caretX = startX + lw;
  return {
    from: group.localToGlobal(new paper.Point(caretX, baseY - fs * 0.8)),
    to: group.localToGlobal(new paper.Point(caretX, baseY + fs * 0.2)),
  };
}

// Clickable region (global): glyph bounds plus the full area frame.
export function hitRegion(group) {
  const d = group.data || {};
  let region = group.children.some((c) => c.data && c.data.glyph) ? group.bounds : null;

  if (d.mode === 'area' && d.areaWidth) {
    const tl = group.localToGlobal(new paper.Point(d.originX, d.originY));
    const br = group.localToGlobal(new paper.Point(d.originX + d.areaWidth, d.originY + (d.areaHeight || 0)));
    const box = new paper.Rectangle(tl, br);
    region = region ? region.unite(box) : box;
  }
  if (!region || (!region.width && !region.height)) {
    const o = group.localToGlobal(new paper.Point(d.originX || 0, d.originY || 0));
    region = new paper.Rectangle(o.subtract(10), new paper.Size(20, 20));
  }
  return region;
}

export function readTextStyle(group) {
  const d = group.data;
  return {
    isText: true,
    hasFill: !!d.fillColor,
    fillColor: d.fillColor || DEFAULT_FILL,
    hasStroke: !!d.strokeColor,
    strokeColor: d.strokeColor || DEFAULT_STROKE,
    strokeWidth: d.strokeWidth || 0,
    opacity: group.opacity ?? 1,
    fontSize: d.fontSize,
    leading: d.leading,
    tracking: d.tracking || 0,
    justification: d.justification,
  };
}

export function applyTextStyle(group, patch) {
  const d = group.data;
  let needsLayout = false;
  if ('fillColor' in patch) {
    d.fillColor = patch.fillColor;
    needsLayout = true;
  }
  if ('strokeColor' in patch) {
    d.strokeColor = patch.strokeColor;
    needsLayout = true;
  }
  if ('strokeWidth' in patch) {
    d.strokeWidth = patch.strokeWidth;
    needsLayout = true;
  }
  if ('opacity' in patch) group.opacity = patch.opacity;
  if ('fontSize' in patch) {
    d.fontSize = patch.fontSize;
    needsLayout = true;
  }
  if ('leading' in patch) {
    d.leading = patch.leading;
    needsLayout = true;
  }
  if ('tracking' in patch) {
    d.tracking = patch.tracking;
    needsLayout = true;
  }
  if ('justification' in patch) {
    d.justification = patch.justification;
    needsLayout = true;
  }
  if (needsLayout) relayout(group);
}
