import paper from 'paper';
import { parse } from 'opentype.js';
import { resolveFontBinary } from '../../state/fonts.js';

// Create Outlines: replace a text group with real vector paths. Each glyph
// PointText draws its character at the local origin (its matrix holds the
// placement, rotation and Touch Type transforms), so we generate the outline
// at (0,0) with opentype.js and push it through the glyph's and the group's
// matrices — every text mode (point/area/path/vertical/Touch Type) comes out
// exactly where it rendered.

const fontCache = new Map(); // "family|weight|italic" → opentype.Font promise

function fontFor(family, weight, italic) {
  const key = `${family}|${weight}|${italic}`;
  if (!fontCache.has(key)) {
    const promise = resolveFontBinary(family, { weight, italic }).then(parse);
    promise.catch(() => fontCache.delete(key)); // don't cache failures
    fontCache.set(key, promise);
  }
  return fontCache.get(key);
}

export async function createOutlines(group) {
  const d = group.data;
  const weight = d.fontWeight || 400;
  const italic = d.fontStyle === 'italic';
  const font = await fontFor(d.fontFamily || 'sans-serif', weight, italic);

  const glyphs = group.children.filter((c) => c.data && c.data.glyph);
  if (!glyphs.length) throw new Error('Text is empty');

  const out = new paper.Group();
  glyphs.forEach((g) => {
    const fs = g.fontSize;
    const ch = g.content;
    // Center-justified glyphs (type on a path) anchor mid-advance.
    const startX = g.justification === 'center' ? -font.getAdvanceWidth(ch, fs) / 2 : 0;
    const cp = new paper.CompoundPath(font.getPath(ch, startX, 0, fs).toPathData(4));
    cp.transform(g.matrix);
    cp.transform(group.matrix);
    cp.fillColor = d.fillColor ? new paper.Color(d.fillColor) : null;
    if (d.strokeColor) {
      cp.strokeColor = new paper.Color(d.strokeColor);
      cp.strokeWidth = d.strokeWidth || 1;
    }
    out.addChild(cp);
  });
  out.opacity = group.opacity ?? 1;

  group.parent.insertChild(group.index + 1, out);
  group.remove();
  return out;
}
