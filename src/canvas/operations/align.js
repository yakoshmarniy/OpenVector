import paper from 'paper';

// Align and distribute the selected items relative to their shared bounding box.

function unionBounds(items) {
  let b = items[0].bounds.clone();
  for (let i = 1; i < items.length; i += 1) b = b.unite(items[i].bounds);
  return b;
}

// mode: left | hcenter | right | top | vcenter | bottom
export function alignItems(items, mode) {
  if (!items || items.length < 2) return;
  const g = unionBounds(items);
  items.forEach((it) => {
    const b = it.bounds;
    let dx = 0;
    let dy = 0;
    switch (mode) {
      case 'left': dx = g.left - b.left; break;
      case 'hcenter': dx = g.center.x - b.center.x; break;
      case 'right': dx = g.right - b.right; break;
      case 'top': dy = g.top - b.top; break;
      case 'vcenter': dy = g.center.y - b.center.y; break;
      case 'bottom': dy = g.bottom - b.bottom; break;
      default: break;
    }
    if (dx || dy) it.position = it.position.add(new paper.Point(dx, dy));
  });
}

// Evenly space item centres along an axis ('h' | 'v'). Needs 3+ items.
export function distributeItems(items, axis) {
  if (!items || items.length < 3) return;
  const key = axis === 'h' ? 'x' : 'y';
  const sorted = items.slice().sort((a, b) => a.bounds.center[key] - b.bounds.center[key]);
  const first = sorted[0].bounds.center[key];
  const last = sorted[sorted.length - 1].bounds.center[key];
  const step = (last - first) / (sorted.length - 1);
  sorted.forEach((it, i) => {
    const target = first + step * i;
    const d = target - it.bounds.center[key];
    if (d) {
      it.position = it.position.add(axis === 'h' ? new paper.Point(d, 0) : new paper.Point(0, d));
    }
  });
}
