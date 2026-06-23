import paper from 'paper';

// Rotate View — drag to spin the canvas view around its centre (the artwork is
// untouched; only the view rotates). Hold Shift to snap to 15°. Angles are
// measured in screen space, which stays fixed as the view rotates. Points arrive
// in project coordinates, so we map them back with projectToView.
export function createRotateViewTool(ctx = {}) {
  let center = null;
  let startAngle = 0;
  let startRotation = 0;
  let dragging = false;

  const screenCenter = () =>
    new paper.Point(paper.view.viewSize.width / 2, paper.view.viewSize.height / 2);

  return {
    cursor: 'grab',

    onMouseDown(point) {
      const v = paper.view;
      center = screenCenter();
      startAngle = v.projectToView(point).subtract(center).angle;
      startRotation = v.rotation;
      dragging = true;
    },

    onMouseDrag(point, _delta, e) {
      if (!dragging) return;
      const v = paper.view;
      const angle = v.projectToView(point).subtract(center).angle;
      let next = startRotation + (angle - startAngle);
      if (e && e.shiftKey) next = Math.round(next / 15) * 15;
      v.rotation = next;
      ctx.onRotation?.(v.rotation);
    },

    onMouseUp() {
      dragging = false;
    },

    deactivate() {
      dragging = false;
    },
  };
}
