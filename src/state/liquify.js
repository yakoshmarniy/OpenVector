// Shared Liquify brush options — the seven liquify tools use one brush (as in
// Illustrator, where resizing the brush in one tool carries to the others).
// Framework-free store with subscribe() so the canvas tools and the
// Properties section stay in sync.

const state = {
  // Global brush
  width: 100, // brush ellipse, project units
  height: 100,
  angle: 0, // ellipse rotation, degrees
  intensity: 50, // 0..100
  // Warp / Twirl / Pucker / Bloat
  simplify: 50, // anchor cleanup on release, 0 = off
  // Twirl
  twirlRate: 40, // degrees; negative twirls counter-clockwise
  // Scallop / Crystallize / Wrinkle
  complexity: 5, // 1..15 — how many anchors the brush textures
  detail: 2, // 1..10 — density of points added under the brush
  // Wrinkle
  wrinkleH: 0, // % of random horizontal displacement
  wrinkleV: 100, // % of random vertical displacement
  // Scallop / Crystallize / Wrinkle — what the brush moves
  affectAnchors: true,
  affectInTangents: false,
  affectOutTangents: false,
};

const listeners = new Set();

export function subscribeLiquify(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getLiquifyOptions() {
  return { ...state };
}

export function setLiquifyOptions(patch) {
  Object.assign(state, patch);
  state.width = Math.max(4, state.width);
  state.height = Math.max(4, state.height);
  state.intensity = Math.min(100, Math.max(0, state.intensity));
  listeners.forEach((fn) => fn());
}
