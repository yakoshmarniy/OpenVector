import styles from './ControlBar.module.css';

// Contextual bar under the menu. Mirrors the most-used controls inline: the
// active tool on the left, then quick style/arrange controls for the current
// selection (the full set still lives in the Properties panel).
const ALIGNS = [
  { id: 'alignLeft', glyph: 'L', label: 'Align left' },
  { id: 'alignHCenter', glyph: 'C', label: 'Align centers (horizontal)' },
  { id: 'alignRight', glyph: 'R', label: 'Align right' },
  { id: 'alignTop', glyph: 'T', label: 'Align top' },
  { id: 'alignVCenter', glyph: 'M', label: 'Align centers (vertical)' },
  { id: 'alignBottom', glyph: 'B', label: 'Align bottom' },
];

const BOOLEANS = [
  { id: 'unite', label: 'Unite' },
  { id: 'subtract', label: 'Subtract' },
  { id: 'intersect', label: 'Intersect' },
  { id: 'exclude', label: 'Exclude' },
];

function SingleStyle({ style, onChange }) {
  return (
    <div className={styles.group}>
      <label className={styles.swatchLabel} title="Fill">
        <span className={styles.tag}>Fill</span>
        <input
          type="color"
          className={styles.swatch}
          value={style.fillColor}
          disabled={!style.hasFill}
          onChange={(e) => onChange({ fillColor: e.target.value })}
        />
      </label>
      <label className={styles.swatchLabel} title="Stroke">
        <span className={styles.tag}>Stroke</span>
        <input
          type="color"
          className={styles.swatch}
          value={style.strokeColor}
          disabled={!style.hasStroke}
          onChange={(e) => onChange({ strokeColor: e.target.value })}
        />
      </label>
      <div className={styles.field} title="Stroke width">
        <span className={styles.tag}>W</span>
        <input
          type="number"
          className={styles.number}
          min="0"
          step="0.5"
          value={style.strokeWidth}
          disabled={!style.hasStroke}
          onChange={(e) => onChange({ strokeWidth: Number(e.target.value) })}
        />
      </div>
      <div className={styles.field} title="Opacity">
        <span className={styles.tag}>Opacity</span>
        <input
          type="range"
          className={styles.range}
          min="0"
          max="100"
          value={Math.round(style.opacity * 100)}
          onChange={(e) => onChange({ opacity: Number(e.target.value) / 100 })}
        />
      </div>
    </div>
  );
}

export default function ControlBar({ toolLabel, sel, onChange, onAction }) {
  const { count, isGroup, style } = sel;

  return (
    <div className={styles.bar}>
      <span className={styles.tool}>{toolLabel}</span>
      <span className={styles.divider} />

      {count === 0 && <span className={styles.hint}>Nothing selected</span>}

      {count === 1 && !isGroup && style && <SingleStyle style={style} onChange={onChange} />}

      {count === 1 && isGroup && (
        <div className={styles.group}>
          <span className={styles.hint}>Group</span>
          <button type="button" className={styles.btn} onClick={() => onAction('ungroup')}>
            Ungroup
          </button>
        </div>
      )}

      {count >= 2 && (
        <div className={styles.group}>
          <span className={styles.hint}>{count} selected</span>
          <div className={styles.iconRow}>
            {ALIGNS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={styles.iconBtn}
                title={a.label}
                aria-label={a.label}
                onClick={() => onAction(a.id)}
              >
                {a.glyph}
              </button>
            ))}
          </div>
          <button type="button" className={styles.btn} onClick={() => onAction('group')}>
            Group
          </button>
          {BOOLEANS.map((b) => (
            <button key={b.id} type="button" className={styles.btn} onClick={() => onAction(b.id)}>
              {b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
