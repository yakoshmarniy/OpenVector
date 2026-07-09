import { useEffect, useState } from 'react';
import paper from 'paper';
import { getSelectedItems, subscribeSelection } from '../../state/selection.js';
import { subscribeDocument } from '../../state/document.js';
import { readStyle, applyStyle } from '../../canvas/operations/itemStyle.js';
import { afterStyleEdit } from '../../canvas/operations/swatchOps.js';
import {
  getAppearance, addFill, addStroke, setLayer, removeLayer, moveLayer,
  refreshAppearance,
} from '../../canvas/operations/appearance.js';
import styles from './AppearancePanel.module.css';

// Appearance panel: multiple fills and strokes on one object. The object's own
// paint is the base Fill/Stroke at the bottom; "Add New Fill/Stroke" stack
// extra appearance layers on top (index 0 = topmost). Rows expose visibility,
// colour, weight (stroke), opacity, reordering and deletion.

const first = () => getSelectedItems().filter(
  (it) => it instanceof paper.Path || it instanceof paper.CompoundPath,
)[0] || null;

export default function AppearancePanel() {
  const [, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);

  useEffect(() => {
    const u1 = subscribeSelection(bump);
    const u2 = subscribeDocument(bump);
    return () => { u1(); u2(); };
  }, []);

  const item = first();
  const style = item ? readStyle(item) : null;
  const extras = item ? (getAppearance(item) || []) : [];

  const editExtra = (id, patch) => {
    setLayer(item, id, patch);
    refreshAppearance(item);
    afterStyleEdit();
    bump();
  };
  const editBase = (patch) => {
    applyStyle(item, patch);
    afterStyleEdit();
    bump();
  };
  const structural = (fn) => {
    fn();
    refreshAppearance(item);
    afterStyleEdit();
    bump();
  };

  return (
    <aside className={styles.panel} aria-label="Appearance">
      <div className={styles.header}><span className={styles.title}>Appearance</span></div>

      {!item && <div className={styles.hint}>Select a path to edit its appearance.</div>}

      {item && (
        <>
          <div className={styles.list}>
            {/* Extra layers, topmost first */}
            {extras.map((l, i) => (
              <div className={styles.rowLayer} key={l.id}>
                <button
                  type="button"
                  className={styles.eye}
                  title={l.visible ? 'Hide' : 'Show'}
                  onClick={() => editExtra(l.id, { visible: !l.visible })}
                >{l.visible ? '👁' : '—'}</button>
                <span className={styles.kind}>{l.kind === 'fill' ? 'Fill' : 'Stroke'}</span>
                <input
                  type="color" className={styles.swatch} value={l.color}
                  onChange={(e) => editExtra(l.id, { color: e.target.value })}
                />
                {l.kind === 'stroke' && (
                  <input
                    type="number" min="0" step="0.5" className={styles.wnum}
                    value={+(+l.width).toFixed(2)} title="Weight"
                    onChange={(e) => editExtra(l.id, { width: Math.max(0, Number(e.target.value)) })}
                  />
                )}
                <input
                  type="number" min="0" max="100" className={styles.onum}
                  value={Math.round((l.opacity ?? 1) * 100)} title="Opacity %"
                  onChange={(e) => editExtra(l.id, { opacity: Math.max(0, Math.min(100, +e.target.value)) / 100 })}
                />
                <div className={styles.rowBtns}>
                  <button type="button" className={styles.mini} disabled={i === 0}
                    title="Move up" onClick={() => structural(() => moveLayer(item, l.id, 'up'))}>▲</button>
                  <button type="button" className={styles.mini} disabled={i === extras.length - 1}
                    title="Move down" onClick={() => structural(() => moveLayer(item, l.id, 'down'))}>▼</button>
                  <button type="button" className={styles.mini}
                    title="Delete" onClick={() => structural(() => removeLayer(item, l.id))}>✕</button>
                </div>
              </div>
            ))}

            {/* Base stroke */}
            <div className={styles.rowLayer}>
              <button
                type="button" className={styles.eye} title={style.hasStroke ? 'Remove stroke' : 'No stroke'}
                onClick={() => editBase({ strokeColor: style.hasStroke ? null : (style.strokeColor || '#000000') })}
              >{style.hasStroke ? '👁' : '—'}</button>
              <span className={styles.kind}>Stroke</span>
              <input
                type="color" className={styles.swatch} value={style.strokeColor}
                disabled={!style.hasStroke}
                onChange={(e) => editBase({ strokeColor: e.target.value })}
              />
              <input
                type="number" min="0" step="0.5" className={styles.wnum}
                value={+(+style.strokeWidth).toFixed(2)} disabled={!style.hasStroke} title="Weight"
                onChange={(e) => editBase({ strokeWidth: Math.max(0, Number(e.target.value)) })}
              />
              <div className={styles.rowBtns} />
            </div>

            {/* Base fill */}
            <div className={styles.rowLayer}>
              <button
                type="button" className={styles.eye} title={style.hasFill ? 'Remove fill' : 'No fill'}
                onClick={() => editBase({ fillColor: style.hasFill ? null : (style.fillColor || '#b9bcc0') })}
              >{style.hasFill ? '👁' : '—'}</button>
              <span className={styles.kind}>Fill</span>
              <input
                type="color" className={styles.swatch} value={style.fillColor}
                disabled={!style.hasFill}
                onChange={(e) => editBase({ fillColor: e.target.value })}
              />
              <div className={styles.rowBtns} />
            </div>

            {/* Object opacity */}
            <div className={styles.rowLayer}>
              <span className={styles.kindWide}>Opacity</span>
              <input
                type="number" min="0" max="100" className={styles.onum}
                value={Math.round((style.opacity ?? 1) * 100)}
                onChange={(e) => editBase({ opacity: Math.max(0, Math.min(100, +e.target.value)) / 100 })}
              />
              <span className={styles.pct}>%</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.btn}
              onClick={() => structural(() => addFill(item, style.fillColor))}>Add Fill</button>
            <button type="button" className={styles.btn}
              onClick={() => structural(() => addStroke(item, style.strokeColor))}>Add Stroke</button>
          </div>
        </>
      )}
    </aside>
  );
}
