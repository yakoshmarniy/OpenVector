import { useEffect, useState } from 'react';
import { subscribeSelection, getSelectedItems } from '../../state/selection.js';
import {
  subscribeColors, getSwatches, addSwatch, updateSwatch, removeSwatch,
  getDefaultPaint, setDefaultPaint,
} from '../../state/colors.js';
import { readStyle } from '../../canvas/operations/itemStyle.js';
import {
  applySwatchTo, retintSwatch, untagSwatch, afterStyleEdit,
} from '../../canvas/operations/swatchOps.js';
import { normHex } from '../../canvas/operations/colorConvert.js';
import ColorPickerDialog from '../ColorPicker/ColorPickerDialog.jsx';
import styles from './SwatchesPanel.module.css';

// Swatches panel: fixed None / Registration cells plus the swatch library.
// Click applies the swatch to the focused paint of the selection (or to the
// default paint when nothing is selected). Double-click opens Swatch Options
// (picker + name / global / spot); editing a GLOBAL swatch retints every
// object painted with it.

const NONE = { id: 'none', name: 'None', color: null, global: false, spot: false };
const REGISTRATION = {
  id: 'registration', name: 'Registration', color: '#000000', global: false, spot: false,
};

export default function SwatchesPanel({ paintFocus }) {
  const [, setTick] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null); // swatch being edited
  const bump = () => setTick((t) => t + 1);

  useEffect(() => subscribeColors(bump), []);
  useEffect(() => subscribeSelection(bump), []);

  const swatches = getSwatches();

  const apply = (swatch) => {
    setSelectedId(swatch.id);
    const items = getSelectedItems();
    if (items.length) {
      applySwatchTo(items, swatch, paintFocus);
      afterStyleEdit();
    } else if (swatch.color) {
      setDefaultPaint({ [paintFocus]: swatch.color });
    }
  };

  // New swatch from the current paint (selection first, defaults otherwise).
  const createFromCurrent = () => {
    const items = getSelectedItems();
    const style = items.length ? readStyle(items[0]) : null;
    const defaults = getDefaultPaint();
    const color = normHex(
      paintFocus === 'stroke'
        ? (style ? (style.hasStroke ? style.strokeColor : null) : defaults.stroke)
        : (style ? (style.hasFill ? style.fillColor : null) : defaults.fill),
    );
    if (!color) return;
    const swatch = addSwatch({ color });
    setSelectedId(swatch.id);
    // Tag the selection with the new global swatch right away.
    if (items.length) {
      applySwatchTo(items, swatch, paintFocus);
      afterStyleEdit();
    }
  };

  const deleteSelected = () => {
    const swatch = swatches.find((s) => s.id === selectedId);
    if (!swatch) return;
    untagSwatch(swatch.id); // objects keep their colour, lose the link
    removeSwatch(swatch.id);
    setSelectedId(null);
  };

  const finishEdit = (hex, meta) => {
    const updated = updateSwatch(editing.id, {
      color: hex,
      name: meta?.name || editing.name,
      global: !!meta?.global,
      spot: !!meta?.spot,
    });
    if (updated?.global) {
      retintSwatch(updated);
      afterStyleEdit();
    } else if (updated) {
      untagSwatch(updated.id); // demoted from global — drop stale links
    }
    setEditing(null);
  };

  const cellClass = (sw) => {
    const cls = [styles.cell];
    if (sw.id === selectedId) cls.push(styles.cellSelected);
    if (sw.global) cls.push(styles.cellGlobal);
    if (sw.spot) cls.push(styles.cellSpot);
    return cls.join(' ');
  };

  const canDelete = swatches.some((s) => s.id === selectedId);

  return (
    <aside className={styles.panel} aria-label="Swatches">
      <div className={styles.header}>
        <span className={styles.title}>Swatches</span>
        <button
          type="button"
          className={styles.headBtn}
          title="New swatch from current color"
          aria-label="New swatch from current color"
          onClick={createFromCurrent}
        >
          +
        </button>
        <button
          type="button"
          className={styles.headBtn}
          title="Delete swatch"
          aria-label="Delete swatch"
          disabled={!canDelete}
          onClick={deleteSelected}
        >
          −
        </button>
      </div>

      <div className={styles.grid}>
        <button
          type="button"
          className={selectedId === 'none' ? `${styles.cell} ${styles.cellSelected}` : styles.cell}
          title="None"
          aria-label="None"
          onClick={() => apply(NONE)}
        >
          <span className={styles.noneSlash} />
        </button>
        <button
          type="button"
          className={selectedId === 'registration' ? `${styles.cell} ${styles.cellSelected}` : styles.cell}
          title="Registration"
          aria-label="Registration"
          style={{ background: '#000' }}
          onClick={() => apply(REGISTRATION)}
        >
          <svg viewBox="0 0 16 16" className={styles.regMark} aria-hidden="true">
            <circle cx="8" cy="8" r="4.5" fill="none" stroke="#fff" strokeWidth="1" />
            <path d="M8 0v16M0 8h16" stroke="#fff" strokeWidth="1" />
          </svg>
        </button>
        {swatches.map((sw) => (
          <button
            key={sw.id}
            type="button"
            className={cellClass(sw)}
            title={`${sw.name}${sw.global ? ' (global)' : ''}${sw.spot ? ' (spot)' : ''}`}
            aria-label={sw.name}
            style={{ background: sw.color }}
            onClick={() => apply(sw)}
            onDoubleClick={() => setEditing(sw)}
          />
        ))}
      </div>

      {editing && (
        <ColorPickerDialog
          title="Swatch Options"
          initial={editing.color}
          meta={{ name: editing.name, global: !!editing.global, spot: !!editing.spot }}
          onApply={finishEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </aside>
  );
}
