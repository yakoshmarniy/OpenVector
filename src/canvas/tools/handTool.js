import paper from 'paper';

// Hand tool — drag to pan the view (a selectable alternative to Space+drag).
export function createHandTool() {
  return {
    cursor: 'grab',
    onMouseDown() {},
    onMouseDrag(point, delta, e) {
      const v = paper.view;
      const screen = new paper.Point(e ? e.movementX : 0, e ? e.movementY : 0);
      v.center = v.center.subtract(screen.divide(v.zoom));
    },
    onMouseUp() {},
  };
}
