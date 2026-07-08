import { useRef, useState } from 'react';
import paper from 'paper';
import { getSelectedItems } from '../../state/selection.js';
import { createMesh, clearMesh } from '../../canvas/operations/mesh.js';
import { afterStyleEdit } from '../../canvas/operations/swatchOps.js';
import styles from './MeshDialog.module.css';

// Create Gradient Mesh: turns the selected filled path into a gradient mesh.
// Rows × Columns set the lattice; Appearance shades the nodes (Flat / To Center
// / To Edge) and Highlight sets how much white the highlight adds. Previews
// live on the canvas; Cancel restores the original fill.

const APPEARANCES = [
  { id: 'flat', label: 'Flat' },
  { id: 'toCenter', label: 'To Center' },
  { id: 'toEdge', label: 'To Edge' },
];

export default function MeshDialog({ onClose }) {
  const target = getSelectedItems().find((it) => it instanceof paper.Path) || null;
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [appearance, setAppearance] = useState('toCenter');
  const [highlight, setHighlight] = useState(60);
  // Snapshot the original fill so Cancel can restore it.
  const originalFill = useRef(
    target && target.fillColor && target.fillColor.type !== 'gradient'
      ? target.fillColor.toCSS(true) : null,
  );

  if (!target) {
    return (
      <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className={styles.dialog} role="dialog" aria-label="Create Gradient Mesh">
          <div className={styles.head}><span className={styles.title}>Create Gradient Mesh</span></div>
          <div className={styles.body}>Select a filled path first.</div>
          <div className={styles.foot}>
            <button type="button" className={styles.btn} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const preview = (r, c, a, h) => {
    createMesh(target, r, c, a, h);
    afterStyleEdit();
    paper.view.update();
  };

  const set = (patch) => {
    const next = { rows, cols, appearance, highlight, ...patch };
    setRows(next.rows); setCols(next.cols); setAppearance(next.appearance); setHighlight(next.highlight);
    preview(next.rows, next.cols, next.appearance, next.highlight);
  };

  const cancel = () => {
    clearMesh(target);
    if (originalFill.current) target.fillColor = new paper.Color(originalFill.current);
    afterStyleEdit();
    paper.view.update();
    onClose();
  };

  const ok = () => {
    createMesh(target, rows, cols, appearance, highlight);
    afterStyleEdit();
    paper.view.update();
    onClose();
  };

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && cancel()}>
      <div className={styles.dialog} role="dialog" aria-label="Create Gradient Mesh">
        <div className={styles.head}>
          <span className={styles.title}>Create Gradient Mesh</span>
          <button type="button" className={styles.close} aria-label="Close" onClick={cancel}>✕</button>
        </div>
        <div className={styles.body}>
          <label className={styles.field}>
            <span>Rows</span>
            <input type="number" min="2" max="50" value={rows}
              onChange={(e) => set({ rows: Math.max(2, Math.min(50, +e.target.value || 2)) })} />
          </label>
          <label className={styles.field}>
            <span>Columns</span>
            <input type="number" min="2" max="50" value={cols}
              onChange={(e) => set({ cols: Math.max(2, Math.min(50, +e.target.value || 2)) })} />
          </label>
          <label className={styles.field}>
            <span>Appearance</span>
            <select value={appearance} onChange={(e) => set({ appearance: e.target.value })}>
              {APPEARANCES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>Highlight</span>
            <input type="range" min="0" max="100" value={highlight}
              disabled={appearance === 'flat'}
              onChange={(e) => set({ highlight: +e.target.value })} />
            <span className={styles.val}>{highlight}%</span>
          </label>
        </div>
        <div className={styles.foot}>
          <button type="button" className={styles.btn} onClick={cancel}>Cancel</button>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={ok}>OK</button>
        </div>
      </div>
    </div>
  );
}
