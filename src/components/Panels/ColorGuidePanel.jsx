import { useEffect, useState } from 'react';
import { subscribeSelection, getSelectedItems } from '../../state/selection.js';
import { subscribeColors, getDefaultPaint, setDefaultPaint } from '../../state/colors.js';
import { readStyle, applyStyle } from '../../canvas/operations/itemStyle.js';
import { afterStyleEdit } from '../../canvas/operations/swatchOps.js';
import { normHex } from '../../canvas/operations/colorConvert.js';
import {
  HARMONY_RULES, VARIATION_KINDS, harmonyColors, variationRow,
} from '../../canvas/operations/harmony.js';
import styles from './ColorGuidePanel.module.css';

// Color Guide: harmony colours derived from a base colour plus a variation
// grid (tints/shades, warm/cool, vivid/muted), like Illustrator's panel.
// Clicking the base chip re-seeds it from the current paint; clicking any
// colour applies it to the focused paint of the selection (or the default
// paint when nothing is selected).

export default function ColorGuidePanel({ paintFocus, onOpenRecolor }) {
  const [, setTick] = useState(0);
  const [rule, setRule] = useState('analogous');
  const [kind, setKind] = useState('tintsShades');
  const bump = () => setTick((t) => t + 1);

  useEffect(() => subscribeSelection(bump), []);
  useEffect(() => subscribeColors(bump), []);

  const currentPaint = () => {
    const items = getSelectedItems();
    const style = items.length ? readStyle(items[0]) : null;
    const defaults = getDefaultPaint();
    const raw = paintFocus === 'stroke'
      ? (style ? (style.hasStroke ? style.strokeColor : null) : defaults.stroke)
      : (style ? (style.hasFill ? style.fillColor : null) : defaults.fill);
    return normHex(raw);
  };

  const [base, setBase] = useState(() => currentPaint() || '#5a7794');

  const apply = (hex) => {
    const items = getSelectedItems();
    const colorKey = paintFocus === 'stroke' ? 'strokeColor' : 'fillColor';
    if (items.length) {
      items.forEach((it) => applyStyle(it, { [colorKey]: hex }));
      afterStyleEdit();
    } else {
      setDefaultPaint({ [paintFocus]: hex });
    }
  };

  const harmony = harmonyColors(base, rule);
  const hasSelection = getSelectedItems().length > 0;

  return (
    <aside className={styles.panel} aria-label="Color Guide">
      <div className={styles.header}>
        <span className={styles.title}>Color Guide</span>
        <select
          className={styles.select}
          aria-label="Harmony rule"
          value={rule}
          onChange={(e) => setRule(e.target.value)}
        >
          {HARMONY_RULES.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.harmonyRow}>
        <button
          type="button"
          className={`${styles.chip} ${styles.baseChip}`}
          style={{ background: base }}
          title="Base color — click to set from current paint"
          aria-label="Set base color from current paint"
          onClick={() => {
            const c = currentPaint();
            if (c) setBase(c);
          }}
        />
        {harmony.map((hex, i) => (
          <button
            key={`${hex}-${i}`}
            type="button"
            className={styles.chip}
            style={{ background: hex }}
            title={hex}
            aria-label={`Apply ${hex}`}
            onClick={() => apply(hex)}
          />
        ))}
      </div>

      <div className={styles.kindRow}>
        <select
          className={styles.select}
          aria-label="Variation kind"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          {VARIATION_KINDS.map((k) => (
            <option key={k.id} value={k.id}>{k.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.varGrid} role="grid" aria-label="Color variations">
        {harmony.map((hex, row) => (
          <div key={`row-${hex}-${row}`} className={styles.varRow} role="row">
            {variationRow(hex, kind).map((v, col) => (
              <button
                key={`${row}-${col}`}
                type="button"
                role="gridcell"
                className={col === 4 ? `${styles.varCell} ${styles.varBase}` : styles.varCell}
                style={{ background: v }}
                title={v}
                aria-label={`Apply ${v}`}
                onClick={() => apply(v)}
              />
            ))}
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.editBtn}
        disabled={!hasSelection}
        title={hasSelection ? 'Recolor the selected artwork' : 'Select artwork to recolor'}
        onClick={() => onOpenRecolor?.()}
      >
        Edit Colors…
      </button>
    </aside>
  );
}
