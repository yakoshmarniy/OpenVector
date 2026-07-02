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
export function advance(text, fontSize, fontFamily) {
  if (!text) return 0;
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  measureCtx.font = `${fontSize}px ${fontFamily}`;
  return measureCtx.measureText(text).width;
}

// View-level toggle (Type > Show Hidden Characters): renders space dots and
// paragraph marks as dim non-interactive glyphs.
let showHidden = false;
export function setShowHiddenChars(value) {
  showHidden = !!value;
  relayoutAllText();
}
export function getShowHiddenChars() {
  return showHidden;
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

// Lay a horizontal block (point/area text) out into positioned lines, applying
// paragraph settings: indents (area only) and space before/after paragraphs.
// Both layoutBlock and caretSegment consume this, so they can't drift apart.
function blockLines(d) {
  const { fontSize: fs, fontFamily: ff, tracking: tr } = d;
  const raw = d.rawText || '';
  const w = d.mode === 'area' ? d.areaWidth : null;
  const iL = w ? d.indentLeft || 0 : 0;
  const iR = w ? d.indentRight || 0 : 0;
  const iF = w ? d.indentFirst || 0 : 0;
  const sBefore = d.spaceBefore || 0;
  const sAfter = d.spaceAfter || 0;
  const paras = raw.split('\n');
  const lines = [];
  let y = d.originY + fs;

  paras.forEach((para, pi) => {
    if (pi > 0) y += sBefore;
    const paraLines = [];
    if (!para) paraLines.push({ text: '', first: true });
    else if (w) {
      let line = '';
      let first = true;
      para.split(' ').forEach((word) => {
        const test = line ? `${line} ${word}` : word;
        const avail = w - iL - iR - (first ? iF : 0);
        if (!line || lineWidth(test, fs, ff, tr) <= avail) line = test;
        else {
          paraLines.push({ text: line, first });
          first = false;
          line = word;
        }
      });
      paraLines.push({ text: line, first });
    } else {
      paraLines.push({ text: para, first: true });
    }

    paraLines.forEach((pl, li) => {
      const indent = iL + (pl.first ? iF : 0);
      const availW = w ? w - indent - iR : null;
      const lw = lineWidth(pl.text, fs, ff, tr);
      let startX = d.originX + indent;
      if (d.justification === 'center') startX = w ? startX + (availW - lw) / 2 : d.originX - lw / 2;
      else if (d.justification === 'right') startX = w ? startX + (availW - lw) : d.originX - lw;
      lines.push({
        text: pl.text,
        startX,
        y,
        paraEnd: li === paraLines.length - 1,
        lastPara: pi === paras.length - 1,
      });
      y += d.leading;
    });
    y += sAfter;
  });
  return lines;
}

export function createTextItem({
  point, areaWidth = null, areaHeight = null, path = null, orientation = 'horizontal',
}) {
  const group = new paper.Group();
  // Keep moves in the group's matrix (glyphs stay in local coords) so a
  // re-layout after dragging the text doesn't snap it back to the origin.
  group.applyMatrix = false;
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
  d.orientation = orientation; // 'horizontal' | 'vertical'
  d.glyphFx = {}; // per-glyph Touch Type transforms, keyed by glyph index

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

// A hidden-character mark: dim, locked (skipped by hit tests), and not a real
// glyph — Touch Type indexing ignores it.
function addHiddenMark(group, ch, x, y, fs, ff) {
  const g = new paper.PointText({
    point: [x, y],
    content: ch,
    fontSize: fs * 0.85,
    fontFamily: ff,
    justification: 'left',
  });
  g.fillColor = new paper.Color('#5f7f9a');
  g.locked = true;
  g.data.hiddenMark = true;
  group.addChild(g);
}

function layoutBlock(group) {
  const d = group.data;
  const { fontSize: fs, fontFamily: ff, tracking: tr } = d;
  const shift = d.baselineShift || 0;

  blockLines(d).forEach((line) => {
    const baseY = line.y - shift;
    const { text, startX } = line;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      const x = startX + advance(text.slice(0, i), fs, ff) + tr * i;
      if (ch === ' ') {
        // advance is counted; no glyph needed — but the toggle shows a dot
        if (showHidden) addHiddenMark(group, '·', x, baseY, fs, ff);
        continue;
      }
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
    if (showHidden && line.paraEnd) {
      const endX = startX + lineWidth(text, fs, ff, tr);
      addHiddenMark(group, line.lastPara ? '#' : '¶', endX, baseY, fs, ff);
    }
  });
}

// Columns of a vertical block: paragraphs (\n) start new columns; in area mode
// a paragraph also wraps to a new column once it exceeds the box height.
function verticalColumns(d, fs, tr) {
  const raw = d.rawText || '';
  const vStep = fs + tr;
  const maxH = d.mode === 'area' ? d.areaHeight : null;
  const cols = [];
  raw.split('\n').forEach((para) => {
    if (!para) {
      cols.push('');
      return;
    }
    if (maxH) {
      const per = Math.max(1, Math.floor(maxH / vStep));
      for (let i = 0; i < para.length; i += per) cols.push(para.slice(i, i + per));
    } else {
      cols.push(para);
    }
  });
  return cols;
}

// Vertical text: glyphs stack downward in a column; columns advance leftwards
// from the origin (tategaki). Each glyph is centred on its column axis.
function layoutVertical(group) {
  const d = group.data;
  const { fontSize: fs, fontFamily: ff, tracking: tr } = d;
  const vStep = fs + tr;
  const colStep = d.leading;
  const cols = verticalColumns(d, fs, tr);

  cols.forEach((colText, ci) => {
    const x = d.originX - ci * colStep;
    for (let i = 0; i < colText.length; i += 1) {
      const ch = colText[i];
      if (ch === ' ') continue;
      const y = d.originY + fs + i * vStep;
      const cw = advance(ch, fs, ff);
      const g = new paper.PointText({
        point: [x - cw / 2, y],
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
  const vertical = d.orientation === 'vertical';
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
    // Vertical-on-path turns each glyph 90° so it reads across the path.
    g.rotate(vertical ? tan.angle - 90 : tan.angle, localPt);
    // Baseline shift moves the glyph along the path normal (positive = up).
    if (d.baselineShift) g.translate(tan.rotate(-90).multiply(d.baselineShift));
  }
}

// Per-glyph Touch Type transform: offset, then scale/rotate about the glyph.
function applyGlyphFx(g, fx) {
  if (!fx) return;
  if (fx.dx || fx.dy) g.translate(new paper.Point(fx.dx || 0, fx.dy || 0));
  const c = g.bounds.center;
  if (fx.s && fx.s !== 1) g.scale(fx.s, c);
  if (fx.rot) g.rotate(fx.rot, c);
}

// Re-layout every text item — called when a font finishes loading, since
// glyph advances measured before the load used fallback metrics.
export function relayoutAllText() {
  paper.project
    .getItems({ match: (it) => it.data && it.data.isText })
    .forEach(relayout);
}

export function relayout(group) {
  const d = group.data;
  group.children
    .filter((c) => c.data && (c.data.glyph || c.data.hiddenMark))
    .forEach((c) => c.remove());
  if (d.mode === 'path') layoutPath(group);
  else if (d.orientation === 'vertical') layoutVertical(group);
  else layoutBlock(group);

  // Index glyphs in reading order and apply any Touch Type transforms.
  let i = 0;
  group.children
    .filter((c) => c.data && c.data.glyph)
    .forEach((g) => {
      g.data.glyphIndex = i;
      applyGlyphFx(g, d.glyphFx && d.glyphFx[i]);
      i += 1;
    });
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

  if (d.orientation === 'vertical') {
    const vStep = fs + tr;
    const cols = verticalColumns(d, fs, tr);
    const ci = Math.max(0, cols.length - 1);
    const count = cols.length ? cols[ci].length : 0;
    const x = d.originX - ci * d.leading;
    const y = d.originY + fs + count * vStep - fs * 0.5;
    return {
      from: group.localToGlobal(new paper.Point(x - fs * 0.4, y)),
      to: group.localToGlobal(new paper.Point(x + fs * 0.4, y)),
    };
  }

  const lines = blockLines(d);
  const last = lines[lines.length - 1];
  const baseY = last.y - (d.baselineShift || 0);
  const caretX = last.startX + lineWidth(last.text, fs, ff, tr);
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
    // Vertical area columns run leftwards from the origin, so the box is on the
    // left of originX; horizontal area extends to the right.
    const x1 = d.orientation === 'vertical' ? d.originX - d.areaWidth : d.originX;
    const x2 = d.orientation === 'vertical' ? d.originX : d.originX + d.areaWidth;
    const tl = group.localToGlobal(new paper.Point(x1, d.originY));
    const br = group.localToGlobal(new paper.Point(x2, d.originY + (d.areaHeight || 0)));
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
    fontFamily: d.fontFamily || DEFAULT_FONT,
    fontSize: d.fontSize,
    leading: d.leading,
    tracking: d.tracking || 0,
    justification: d.justification,
    baselineShift: d.baselineShift || 0,
    indentLeft: d.indentLeft || 0,
    indentRight: d.indentRight || 0,
    indentFirst: d.indentFirst || 0,
    spaceBefore: d.spaceBefore || 0,
    spaceAfter: d.spaceAfter || 0,
    textMode: d.mode,
    orientation: d.orientation || 'horizontal',
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
  if ('fontFamily' in patch) {
    d.fontFamily = patch.fontFamily || DEFAULT_FONT;
    needsLayout = true;
  }
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
  ['baselineShift', 'indentLeft', 'indentRight', 'indentFirst', 'spaceBefore', 'spaceAfter']
    .forEach((key) => {
      if (key in patch) {
        d[key] = patch[key] || 0;
        needsLayout = true;
      }
    });
  if (needsLayout) relayout(group);
}
