import paper from 'paper';

// "Live shapes" keep editable parameters after creation. v1 covers the live
// rectangle corner radius, edited via an on-canvas widget (Select tool). The
// shape's outer frame is just its bounds, so rounding stays within the box.

export function tagLiveRect(item, radius = 0) {
  if (item) item.data.live = { kind: 'rect', radius };
}

export function isLiveRect(item) {
  return !!(item && item.data && item.data.live && item.data.live.kind === 'rect');
}

// True while the rectangle is still axis-aligned (every segment point sits on an
// edge of the bounding box). Once rotated, we hide the widget and treat it as a
// plain path — a tilted live frame is a later refinement (with the 7.1 panel).
export function rectAxisAligned(item) {
  if (!item.segments || !item.segments.length) return false;
  const b = item.bounds;
  const tol = 0.5;
  return item.segments.every((s) => {
    const p = s.point;
    return (
      Math.abs(p.x - b.left) < tol || Math.abs(p.x - b.right) < tol ||
      Math.abs(p.y - b.top) < tol || Math.abs(p.y - b.bottom) < tol
    );
  });
}

export function maxRadius(item) {
  const b = item.bounds;
  return Math.min(b.width, b.height) / 2;
}

export function setRadius(item, r) {
  const b = item.bounds.clone();
  const rad = Math.max(0, Math.min(r, Math.min(b.width, b.height) / 2));
  item.data.live.radius = rad;
  const tmp = new paper.Path.Rectangle({ rectangle: b, radius: rad, insert: false });
  item.segments = tmp.segments;
}

// Widget sits inside the top-left corner, offset along the diagonal by the
// current radius (min inset so it stays grabbable at radius 0).
export function radiusWidgetPoint(item) {
  const b = item.bounds;
  const r = (item.data.live && item.data.live.radius) || 0;
  const minInset = 14 / paper.view.zoom;
  const maxR = Math.min(b.width, b.height) / 2;
  const d = Math.min(Math.max(r, minInset), Math.max(maxR, minInset));
  return new paper.Point(b.left + d, b.top + d);
}
