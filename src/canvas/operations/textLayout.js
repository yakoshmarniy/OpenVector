import paper from 'paper';

// Paper's PointText has no area-wrapping, so we keep the raw (unwrapped) text in
// item.data.rawText and compute a wrapped `content` for display. Point text uses
// the raw text as-is. Geometry is anchored to item.data.origin{X,Y}.

export const DEFAULT_FONT_SIZE = 20;
const DEFAULT_TEXT_COLOR = '#c7c9cc';
const DEFAULT_FONT = 'sans-serif';

export function isTextItem(item) {
  return !!item && item.className === 'PointText';
}

// Measure a single line's width by creating a throwaway PointText.
function measureWidth(text, fontSize, fontFamily) {
  if (!text) return 0;
  const probe = new paper.PointText({ point: [0, 0], content: text, fontSize, fontFamily });
  const w = probe.bounds.width;
  probe.remove();
  return w;
}

// Greedy word-wrap each paragraph to fit `width`.
function wrap(raw, width, fontSize, fontFamily) {
  const lines = [];
  raw.split('\n').forEach((para) => {
    if (para.length === 0) {
      lines.push('');
      return;
    }
    let line = '';
    para.split(' ').forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (!line || measureWidth(test, fontSize, fontFamily) <= width) {
        line = test;
      } else {
        lines.push(line);
        line = word;
      }
    });
    lines.push(line);
  });
  return lines.join('\n');
}

export function createTextItem({ point, areaWidth = null, areaHeight = null }) {
  const item = new paper.PointText({
    point: [point.x, point.y + DEFAULT_FONT_SIZE], // baseline sits below the click
    content: '',
    fillColor: new paper.Color(DEFAULT_TEXT_COLOR),
    fontSize: DEFAULT_FONT_SIZE,
    fontFamily: DEFAULT_FONT,
    justification: 'left',
    leading: DEFAULT_FONT_SIZE * 1.2,
  });
  item.data.rawText = '';
  item.data.areaWidth = areaWidth; // null = point text
  item.data.areaHeight = areaHeight; // drawn box height (area text only)
  item.data.originX = point.x; // box left / point anchor x
  item.data.originY = point.y; // box top / click y
  return item;
}

// The clickable region: the glyph bounds, plus the full drawn frame for area
// text (so empty parts of the box can still be selected, like Illustrator).
export function hitRegion(item) {
  let region = item.bounds;
  if (item.data && item.data.areaWidth) {
    const box = new paper.Rectangle(
      item.data.originX,
      item.data.originY,
      item.data.areaWidth,
      item.data.areaHeight || 0,
    );
    region = region.unite(box);
  }
  return region;
}

export function setRawText(item, raw) {
  item.data.rawText = raw;
  relayout(item);
}

// Recompute wrapped content + anchor position from the raw text and style.
export function relayout(item) {
  const raw = item.data.rawText || '';
  const w = item.data.areaWidth;
  const just = item.justification;
  const ox = item.data.originX;
  const oy = item.data.originY;

  item.content = w ? wrap(raw, w, item.fontSize, item.fontFamily) : raw;

  let x = ox;
  if (w) {
    if (just === 'center') x = ox + w / 2;
    else if (just === 'right') x = ox + w;
  }
  item.point = new paper.Point(x, oy + item.fontSize);
}

// Caret endpoints (project coords) at the end of the current text.
export function caretSegment(item) {
  const fontSize = item.fontSize;
  const lines = (item.content || '').split('\n');
  const lastLine = lines[lines.length - 1];
  const baselineY = item.point.y + item.leading * (lines.length - 1);
  const lineW = measureWidth(lastLine, fontSize, item.fontFamily);

  let caretX;
  if (item.justification === 'center') caretX = item.point.x + lineW / 2;
  else if (item.justification === 'right') caretX = item.point.x;
  else caretX = item.point.x + lineW;

  return {
    from: new paper.Point(caretX, baselineY - fontSize * 0.8),
    to: new paper.Point(caretX, baselineY + fontSize * 0.2),
  };
}
