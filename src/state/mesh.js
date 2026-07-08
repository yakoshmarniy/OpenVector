// Active gradient-mesh point: which node the Mesh tool has selected, so the
// Properties Mesh section can recolour it. Framework-free store with
// subscribe(), mirroring state/liquify.js. Holds the owning paper item plus the
// node's grid coordinates; cleared when the tool deactivates or selection dies.

let active = null; // { item, r, c } | null
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeMesh(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getActiveMeshPoint() {
  return active;
}

export function setActiveMeshPoint(point) {
  active = point;
  notify();
}

export function clearActiveMeshPoint() {
  if (!active) return;
  active = null;
  notify();
}
