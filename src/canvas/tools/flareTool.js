import paper from 'paper';

// Flare — a stylised lens flare: a soft core (stacked translucent circles), a
// halo ring, and a chain of small circles toward the drag point. A true glow
// needs gradients (iteration 12); this is a vector approximation for now.
export function createFlareTool() {
  let group = null;
  let origin = null;

  const soft = (g, a) => new paper.Color(0.84, 0.86, 0.88, a);

  return {
    cursor: 'crosshair',
    onMouseDown(point) {
      origin = point;
    },
    onMouseDrag(point) {
      if (!origin) return;
      const reach = Math.max(2, origin.getDistance(point));
      const coreR = reach * 0.18;
      if (group) group.remove();
      group = new paper.Group();

      for (let i = 3; i >= 1; i -= 1) {
        const c = new paper.Path.Circle(origin, coreR * i);
        c.fillColor = soft(group, 0.1 * i);
        group.addChild(c);
      }
      const core = new paper.Path.Circle(origin, coreR * 0.6);
      core.fillColor = new paper.Color(0.95, 0.96, 0.97, 0.9);
      group.addChild(core);

      const ring = new paper.Path.Circle(origin, coreR * 2.3);
      ring.strokeColor = new paper.Color(0.8, 0.82, 0.85, 0.5);
      ring.strokeWidth = 1;
      ring.fillColor = null;
      group.addChild(ring);

      const dir = point.subtract(origin);
      const n = 4;
      for (let i = 1; i <= n; i += 1) {
        const p = origin.add(dir.multiply(i / (n + 1)));
        const rr = coreR * (i % 2 ? 0.45 : 0.28);
        const dot = new paper.Path.Circle(p, rr);
        dot.fillColor = soft(group, 0.28);
        group.addChild(dot);
      }
    },
    onMouseUp() {
      if (group && !group.children.length) group.remove();
      group = null;
      origin = null;
    },
  };
}
