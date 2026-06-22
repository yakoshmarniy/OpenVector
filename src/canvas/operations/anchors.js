import paper from 'paper';

const SIZE = 7;

// Build an overlay showing a path's anchor points: square = corner, diamond =
// smooth. Used by the pen-family editing tools so their effect is visible.
export function makeAnchorOverlay(path) {
  if (!path || !path.segments) return null;
  const z = paper.view.zoom;
  const s = SIZE / z;

  const g = new paper.Group();
  g.data.isSelectionOverlay = true;
  g.locked = true;

  const outline = path.clone({ insert: false });
  outline.fillColor = null;
  outline.strokeColor = new paper.Color('#6f8595');
  outline.strokeWidth = 1 / z;
  outline.dashArray = [3 / z, 2 / z];
  g.addChild(outline);

  path.segments.forEach((seg) => {
    const corner = seg.handleIn.length === 0 && seg.handleOut.length === 0;
    const h = new paper.Path.Rectangle({
      rectangle: new paper.Rectangle(seg.point.subtract(s / 2), new paper.Size(s, s)),
    });
    if (!corner) h.rotate(45, seg.point); // diamond marks a smooth point
    h.fillColor = new paper.Color(corner ? '#cfd3d7' : '#aebfd0');
    h.strokeColor = new paper.Color('#3a3d41');
    h.strokeWidth = 1 / z;
    g.addChild(h);
  });

  g.bringToFront();
  return g;
}
