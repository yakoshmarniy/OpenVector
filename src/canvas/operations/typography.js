import paper from 'paper';
import { relayout, advance, variantOf, applyTextStyle } from './textLayout.js';

// Type-menu commands that rewrite a text group's rawText / typography settings.

const textItems = () => paper.project.getItems({ match: (it) => it.data && it.data.isText });

// Font usage across the document, for the Find Font dialog.
export function listFontUsage() {
  const counts = new Map();
  textItems().forEach((g) => {
    const f = g.data.fontFamily || 'sans-serif';
    counts.set(f, (counts.get(f) || 0) + 1);
  });
  return [...counts.entries()].map(([family, count]) => ({ family, count }));
}

// Swap every use of `from` for `to`; returns how many text objects changed.
export function replaceFont(from, to) {
  const hits = textItems().filter((g) => (g.data.fontFamily || 'sans-serif') === from);
  hits.forEach((g) => applyTextStyle(g, { fontFamily: to }));
  return hits.length;
}

const toTitle = (s) => s.replace(/\S+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

// Lowercase everything, then capitalise the first letter of the text, of each
// paragraph, and after sentence-ending punctuation.
const toSentence = (s) => s
  .toLowerCase()
  .replace(/(^|[.!?…]\s+|\n\s*)(\p{L})/gu, (m, pre, ch) => pre + ch.toUpperCase());

export function changeCase(group, kind) {
  const raw = group.data.rawText || '';
  const out = kind === 'upper' ? raw.toUpperCase()
    : kind === 'lower' ? raw.toLowerCase()
      : kind === 'title' ? toTitle(raw)
        : toSentence(raw);
  group.data.rawText = out;
  relayout(group);
}

// Typographer's quotes, em dashes, ellipses. Applies all substitutions at
// once (Illustrator's dialog with per-option checkboxes comes with 15.1).
export function smartPunctuation(group) {
  let s = group.data.rawText || '';
  s = s.replace(/\.\.\./g, '…');
  s = s.replace(/--/g, '—');
  s = s.replace(/(^|[\s([{«\n])"/g, '$1“').replace(/"/g, '”');
  s = s.replace(/(^|[\s([{«\n])'/g, '$1‘').replace(/'/g, '’');
  group.data.rawText = s;
  relayout(group);
}

// Fit Headline: spread the text across the full area width by adjusting
// tracking. Joins the text into one line (a headline), like Illustrator does
// for the paragraph under the cursor.
export function fitHeadline(group) {
  const d = group.data;
  if (d.mode !== 'area' || d.orientation === 'vertical') return false;
  const text = (d.rawText || '').replace(/\n/g, ' ').trim();
  if (text.length < 2) return false;
  const width = d.areaWidth - (d.indentLeft || 0) - (d.indentRight || 0) - (d.indentFirst || 0);
  const adv = advance(text, d.fontSize, d.fontFamily, variantOf(d));
  // Tiny margin keeps the exact-fit line from wrapping on float rounding.
  d.tracking = (width - adv) / (text.length - 1) - 0.01;
  d.rawText = text;
  relayout(group);
  return true;
}
