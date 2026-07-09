import { useEffect, useState } from 'react';
import paper from 'paper';
import { getSelectedItems, subscribeSelection } from '../../state/selection.js';
import {
  subscribeStyles, getStyles, addStyle, removeStyle, renameStyle,
} from '../../state/graphicStyles.js';
import { captureStyle, applyGraphicStyle } from '../../canvas/operations/graphicStyles.js';
import { afterStyleEdit } from '../../canvas/operations/swatchOps.js';
import styles from './GraphicStylesPanel.module.css';

// Graphic Styles panel: a library of saved appearance bundles. Click a swatch
// to apply it to the selection; "New Style" saves the selected object's current
// appearance. Styles persist in localStorage (state/graphicStyles.js).

const paths = () => getSelectedItems().filter(
  (it) => it instanceof paper.Path || it instanceof paper.CompoundPath,
);

// A CSS approximation of a bundle for the preview thumbnail.
function previewStyle(b) {
  const bg = b.fill || 'transparent';
  const stroke = b.stroke ? `${Math.min(6, b.strokeWidth || 1)}px solid ${b.stroke}` : '1px solid var(--ov-panel-border)';
  const s = { background: bg, border: stroke };
  if (!b.fill) {
    s.backgroundImage = 'linear-gradient(45deg, transparent 45%, #c0554f 45%, #c0554f 55%, transparent 55%)';
  }
  return s;
}

export default function GraphicStylesPanel() {
  const [, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);

  useEffect(() => {
    const u1 = subscribeStyles(bump);
    const u2 = subscribeSelection(bump);
    return () => { u1(); u2(); };
  }, []);

  const lib = getStyles();
  const hasSel = paths().length > 0;

  const apply = (bundle) => {
    const list = paths();
    if (!list.length) return;
    list.forEach((p) => applyGraphicStyle(p, bundle));
    afterStyleEdit();
  };

  const saveNew = () => {
    const item = paths()[0];
    if (!item) return;
    const bundle = captureStyle(item);
    if (bundle) addStyle(bundle);
  };

  return (
    <aside className={styles.panel} aria-label="Graphic Styles">
      <div className={styles.header}><span className={styles.title}>Graphic Styles</span></div>

      <div className={styles.grid}>
        {lib.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={styles.swatch}
            style={previewStyle(entry.style)}
            title={entry.name}
            disabled={!hasSel}
            onClick={() => apply(entry.style)}
            onDoubleClick={(e) => {
              e.preventDefault();
              const name = window.prompt('Style name:', entry.name);
              if (name) renameStyle(entry.id, name);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (window.confirm(`Delete style "${entry.name}"?`)) removeStyle(entry.id);
            }}
          />
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btn} disabled={!hasSel} onClick={saveNew}>New Style</button>
      </div>
      <div className={styles.note}>Click to apply · double-click to rename · right-click to delete</div>
    </aside>
  );
}
