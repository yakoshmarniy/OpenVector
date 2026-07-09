import paper from 'paper';

// Arrowheads for open, stroked paths. They are NOT baked into the path: each
// arrowhead is a separate filled triangle flagged `data.isArrow`, owned by its
// path via `data.ownerId` (the path's id). They are rebuilt — never moved — by
// `refreshArrowheads`, which the selection overlay calls on every redraw, so the
// heads track the path through moves, resizes and rotations. Discovery is by
// ownerId (not stored refs) so cloning a path can't disturb the original's heads.

const ARROW_FLAG = 'isArrow';

export function isArrowItem(item) {
  return !!(item && item.data && item.data[ARROW_FLAG]);
}

function ownedArrows(item) {
  const parent = item.parent;
  if (!parent) return [];
  return parent.children.filter(
    (c) => c.data && c.data[ARROW_FLAG] && c.data.ownerId === item.id,
  );
}

export function clearArrowheads(item) {
  ownedArrows(item).forEach((a) => a.remove());
}

// `tip` = endpoint, `dir` = unit vector the arrow points along (outward).
function arrowPath(tip, dir, size, color) {
  const base = tip.subtract(dir.multiply(size));
  const perp = new paper.Point(-dir.y, dir.x).multiply(size * 0.55);
  const p = new paper.Path([tip, base.add(perp), base.subtract(perp)]);
  p.closed = true;
  p.fillColor = color.clone();
  p.strokeColor = null;
  return p;
}

export function refreshArrowheads(item) {
  if (!item || isArrowItem(item)) return;
  clearArrowheads(item);

  const cfg = item.data && item.data.arrows;
  if (!cfg || (!cfg.start && !cfg.end)) return;
  // Only open, stroked paths carry arrowheads.
  if (!(item instanceof paper.Path) || item.closed) return;
  if (!item.strokeColor || item.segments.length < 2) return;

  const color = item.strokeColor;
  const base = Math.max(6, (item.strokeWidth || 1) * 4);
  // Start and end heads scale independently (Illustrator's Stroke panel).
  const startScale = cfg.startScale ?? cfg.scale ?? 1;
  const endScale = cfg.endScale ?? cfg.scale ?? 1;

  const make = (tip, dir, size) => {
    if (!dir || dir.length < 1e-4) return;
    const head = arrowPath(tip, dir.normalize(), size, color);
    head.data[ARROW_FLAG] = true;
    head.data.ownerId = item.id;
    head.locked = true;
    head.insertAbove(item);
  };

  if (cfg.end) make(item.lastSegment.point, item.getTangentAt(item.length), base * endScale);
  if (cfg.start) make(item.firstSegment.point, item.getTangentAt(0).multiply(-1), base * startScale);
}
