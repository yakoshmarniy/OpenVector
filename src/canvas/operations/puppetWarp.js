import paper from 'paper';

// Puppet Warp deformation core — rigid Moving Least Squares (Schaefer et al.,
// "Image Deformation Using Moving Least Squares", 2006). Pins are the control
// points: each pin maps its original position `p` to its dragged position `q`;
// every path vertex (anchor + both handle endpoints) is remapped through the
// rigid MLS field. No mesh is needed — the field is evaluated per vertex.

const ALPHA2 = 2; // 2α with α = 1 → weights w_i = 1 / |p_i − v|²
const EPS = 1e-6;

const perp = (v) => ({ x: -v.y, y: v.x });
const dot = (a, b) => a.x * b.x + a.y * b.y;

// pins: [{ p: {x,y}, q: {x,y} }] — original → current positions.
export function mlsRigid(v, pins) {
  if (!pins.length) return { x: v.x, y: v.y };
  if (pins.length === 1) {
    // A single pin can only translate.
    const { p, q } = pins[0];
    return { x: v.x + (q.x - p.x), y: v.y + (q.y - p.y) };
  }

  let wsum = 0;
  let psx = 0;
  let psy = 0;
  let qsx = 0;
  let qsy = 0;
  const ws = new Array(pins.length);
  for (let i = 0; i < pins.length; i += 1) {
    const { p } = pins[i];
    const dx = p.x - v.x;
    const dy = p.y - v.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < EPS) {
      // v sits on a pin — it moves exactly with it.
      const { q } = pins[i];
      return { x: q.x, y: q.y };
    }
    const w = 1 / d2 ** (ALPHA2 / 2);
    ws[i] = w;
    wsum += w;
    psx += w * p.x;
    psy += w * p.y;
    qsx += w * pins[i].q.x;
    qsy += w * pins[i].q.y;
  }
  const pStar = { x: psx / wsum, y: psy / wsum };
  const qStar = { x: qsx / wsum, y: qsy / wsum };
  const d = { x: v.x - pStar.x, y: v.y - pStar.y };
  const dPerp = perp(d);

  // f→(v) = Σ q̂_i A_i with A_i = w_i (p̂_i; −p̂_i⊥)(d; −d⊥)ᵀ.
  let fx = 0;
  let fy = 0;
  for (let i = 0; i < pins.length; i += 1) {
    const w = ws[i];
    const hp = { x: pins[i].p.x - pStar.x, y: pins[i].p.y - pStar.y };
    const hq = { x: pins[i].q.x - qStar.x, y: pins[i].q.y - qStar.y };
    const hpPerp = perp(hp);
    const a00 = w * dot(hp, d);
    const a01 = -w * dot(hp, dPerp);
    const a10 = -w * dot(hpPerp, d);
    const a11 = w * dot(hpPerp, dPerp);
    fx += hq.x * a00 + hq.y * a10;
    fy += hq.x * a01 + hq.y * a11;
  }
  const flen = Math.hypot(fx, fy);
  const dlen = Math.hypot(d.x, d.y);
  if (flen < EPS) {
    // Degenerate direction — fall back to the weighted translation.
    return { x: v.x - pStar.x + qStar.x, y: v.y - pStar.y + qStar.y };
  }
  const s = dlen / flen;
  return { x: qStar.x + fx * s, y: qStar.y + fy * s };
}

// Leaf paths inside an item (skipping text groups and width envelopes).
export function collectWarpPaths(item) {
  const out = [];
  const walk = (it) => {
    if (it.data && (it.data.isText || it.data.isWidthEnvelope)) return;
    if (it.className === 'Path' && it.segments.length > 0) out.push(it);
    else if (it.children) it.children.forEach(walk);
  };
  walk(item);
  return out;
}

// Absolute-coordinate snapshot of the paths' geometry (anchor + handle tips).
export function snapshotGeometry(paths) {
  return paths.map((p) => p.segments.map((s) => ({
    point: s.point.clone(),
    handleIn: s.handleIn.clone(),
    handleOut: s.handleOut.clone(),
  })));
}

// Deform every vertex from the snapshot through the MLS field. Handles are
// remapped as absolute endpoints and re-expressed relative to the new anchor,
// so curves bend along with the pins instead of staying rigid.
export function deformFromSnapshot(paths, snapshot, pins) {
  const f = (pt) => {
    const r = mlsRigid(pt, pins);
    return new paper.Point(r.x, r.y);
  };
  paths.forEach((path, pi) => {
    const snap = snapshot[pi];
    if (!snap || !path.parent) return;
    path.segments.forEach((seg, si) => {
      const s = snap[si];
      if (!s) return;
      const np = f(s.point);
      seg.point = np;
      seg.handleIn = s.handleIn.length < EPS
        ? new paper.Point(0, 0)
        : f(s.point.add(s.handleIn)).subtract(np);
      seg.handleOut = s.handleOut.length < EPS
        ? new paper.Point(0, 0)
        : f(s.point.add(s.handleOut)).subtract(np);
    });
  });
}
