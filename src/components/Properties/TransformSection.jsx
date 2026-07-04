import { useEffect, useState } from 'react';
import paper from 'paper';
import { subscribeSelection, getSelectedItems } from '../../state/selection.js';
import { subscribeDocument, bumpDocument } from '../../state/document.js';
import { createSelection } from '../../canvas/operations/selection.js';
import {
  unionBounds,
  refPoint,
  moveItems,
  scaleItems,
  rotateItems,
  shearItems,
  flipItems,
  recordTransform,
  getScaleStrokes,
  setScaleStrokes,
} from '../../canvas/operations/transform.js';
import styles from './Properties.module.css';

// Transform panel section: X/Y/W/H around a selectable reference point, plus
// rotate / shear deltas and flips. Reads bounds straight from the selection
// store (re-rendered on selection changes and document bumps) and applies
// transforms directly — unlike style edits these aren't per-item styles.

const REF_ROWS = [['nw', 'n', 'ne'], ['w', 'c', 'e'], ['sw', 's', 'se']];

// A number field that applies a RELATIVE amount: commits on Enter/blur and
// resets to 0, so "rotate by 30°" doesn't fire on every keystroke.
function DeltaInput({ title, onCommit }) {
  const [val, setVal] = useState('');
  const commit = () => {
    const n = Number(val);
    if (Number.isFinite(n) && n !== 0) onCommit(n);
    setVal('');
  };
  return (
    <input
      type="number"
      className={styles.number}
      placeholder="0"
      title={title}
      aria-label={title}
      value={val}
      step="1"
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        }
      }}
    />
  );
}

// Module-level view over the shared selection: lets the panel redraw the
// overlay after a transform without owning any tool state.
const selView = createSelection();

export default function TransformSection() {
  const [, setTick] = useState(0);
  const [ref, setRef] = useState('c');
  const bump = () => setTick((t) => t + 1);

  useEffect(() => subscribeSelection(bump), []);
  useEffect(() => subscribeDocument(bump), []);

  const items = getSelectedItems();
  if (!items.length) return null;
  const b = unionBounds(items);
  if (!b) return null;
  const rp = refPoint(b, ref);
  const round = (v) => Math.round(v * 100) / 100;

  const after = () => {
    selView.draw();
    bumpDocument();
    paper.view.update();
  };

  const setPos = (axis, value) => {
    if (!Number.isFinite(value)) return;
    const dx = axis === 'x' ? value - rp.x : 0;
    const dy = axis === 'y' ? value - rp.y : 0;
    if (!dx && !dy) return;
    moveItems(items, dx, dy);
    recordTransform({ kind: 'move', dx, dy });
    after();
  };

  const setSize = (axis, value) => {
    if (!Number.isFinite(value) || value < 0.1) return;
    const sx = axis === 'w' ? value / b.width : 1;
    const sy = axis === 'h' ? value / b.height : 1;
    if (!Number.isFinite(sx) || !Number.isFinite(sy) || (sx === 1 && sy === 1)) return;
    scaleItems(items, sx, sy, rp);
    recordTransform({
      kind: 'scale', sx, sy, pivot: { x: rp.x, y: rp.y }, withStrokes: getScaleStrokes(),
    });
    after();
  };

  const rotateBy = (angle) => {
    rotateItems(items, angle, rp);
    recordTransform({ kind: 'rotate', angle, pivot: { x: rp.x, y: rp.y } });
    after();
  };

  const shearBy = (deg) => {
    const shx = Math.tan((deg * Math.PI) / 180);
    shearItems(items, shx, 0, rp);
    recordTransform({ kind: 'shear', shx, shy: 0, pivot: { x: rp.x, y: rp.y } });
    after();
  };

  const flip = (axis) => {
    flipItems(items, axis);
    recordTransform({ kind: 'reflect', angle: axis === 'h' ? 90 : 0, pivot: null });
    after();
  };

  return (
    <div className={styles.transformSection}>
      <span className={styles.subLabel}>Transform</span>
      <div className={styles.transformBody}>
        <div className={styles.refGrid} role="radiogroup" aria-label="Reference point">
          {REF_ROWS.map((row, ri) => (
            <div key={ri} className={styles.refRow}>
              {row.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={ref === r}
                  aria-label={`Reference ${r}`}
                  className={ref === r ? `${styles.refDot} ${styles.refDotActive}` : styles.refDot}
                  onClick={() => setRef(r)}
                />
              ))}
            </div>
          ))}
        </div>
        <div className={styles.transformFields}>
          <div className={styles.tightRow}>
            <span className={styles.tfLabel}>X</span>
            <input type="number" className={styles.numberXs} step="1" value={round(rp.x)}
              aria-label="X position"
              onChange={(e) => setPos('x', Number(e.target.value))} />
            <span className={styles.tfLabel}>Y</span>
            <input type="number" className={styles.numberXs} step="1" value={round(rp.y)}
              aria-label="Y position"
              onChange={(e) => setPos('y', Number(e.target.value))} />
          </div>
          <div className={styles.tightRow}>
            <span className={styles.tfLabel}>W</span>
            <input type="number" className={styles.numberXs} min="0.1" step="1" value={round(b.width)}
              aria-label="Width"
              onChange={(e) => setSize('w', Number(e.target.value))} />
            <span className={styles.tfLabel}>H</span>
            <input type="number" className={styles.numberXs} min="0.1" step="1" value={round(b.height)}
              aria-label="Height"
              onChange={(e) => setSize('h', Number(e.target.value))} />
          </div>
        </div>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Rotate</span>
        <DeltaInput title="Rotate by (degrees)" onCommit={rotateBy} />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Shear</span>
        <DeltaInput title="Shear by (degrees)" onCommit={shearBy} />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Flip</span>
        <button type="button" className={styles.iconBtn} title="Flip horizontal"
          aria-label="Flip horizontal" onClick={() => flip('h')}>
          ⇋
        </button>
        <button type="button" className={styles.iconBtn} title="Flip vertical"
          aria-label="Flip vertical" onClick={() => flip('v')}>
          ⇵
        </button>
      </div>
      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          checked={getScaleStrokes()}
          onChange={(e) => {
            setScaleStrokes(e.target.checked);
            bump();
          }}
        />
        Scale strokes &amp; effects
      </label>
    </div>
  );
}
