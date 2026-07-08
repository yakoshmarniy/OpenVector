import { useEffect, useState } from 'react';
import styles from './Properties.module.css';
import { subscribeMesh, getActiveMeshPoint } from '../../state/mesh.js';
import { subscribeDocument } from '../../state/document.js';
import { getPointColor, setPointColor, refreshMesh } from '../../canvas/operations/mesh.js';
import { afterStyleEdit } from '../../canvas/operations/swatchOps.js';

// Mesh tool options: recolour the mesh node selected on the canvas. Reads the
// active node from state/mesh (set by the Mesh tool); editing writes the
// colour back and rebuilds the mesh companion.

export default function MeshSection() {
  const [, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);
  useEffect(() => subscribeMesh(bump), []);
  useEffect(() => subscribeDocument(bump), []);

  const active = getActiveMeshPoint();
  const color = active ? getPointColor(active.item, active.r, active.c) : null;

  const onColor = (hex) => {
    if (!active) return;
    setPointColor(active.item, active.r, active.c, hex);
    refreshMesh(active.item);
    afterStyleEdit();
  };

  return (
    <div className={styles.actions}>
      <p className={styles.heading}>Gradient Mesh</p>
      {active && color ? (
        <label className={styles.row}>
          <span className={styles.label}>Node color</span>
          <input type="color" value={color} onChange={(e) => onColor(e.target.value)} />
        </label>
      ) : (
        <span className={styles.subLabel}>
          Click a filled object to add a mesh, then click a node to recolor it.
          Object ▸ Create Gradient Mesh… builds a full lattice.
        </span>
      )}
    </div>
  );
}
