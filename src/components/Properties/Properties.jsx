import styles from './Properties.module.css';

// labels are plain text for now; will move to i18next t() when i18n lands.

function AlignIcon({ kind }) {
  const rows = {
    left: [0, 0, 0, 0],
    center: [3, 1, 3, 1],
    right: [6, 2, 6, 2],
  }[kind];
  const widths = { left: [16, 11, 14, 9], center: [12, 14, 12, 14], right: [16, 12, 14, 10] }[kind];
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      {rows.map((x, i) => (
        <rect key={i} x={x} y={2 + i * 4} width={widths[i]} height="2" rx="1" fill="currentColor" />
      ))}
    </svg>
  );
}

const BOOLEANS = [
  { id: 'unite', label: 'Unite' },
  { id: 'subtract', label: 'Subtract' },
  { id: 'intersect', label: 'Intersect' },
  { id: 'exclude', label: 'Exclude' },
];

function StyleControls({ style, onChange }) {
  const opacityPct = Math.round(style.opacity * 100);
  const aligns = [
    { id: 'left', label: 'Align left' },
    { id: 'center', label: 'Align center' },
    { id: 'right', label: 'Align right' },
  ];
  return (
    <>
      {style.isText && (
        <div className={styles.textSection}>
          <div className={styles.row}>
            <span className={styles.label}>Align</span>
            <div className={styles.alignGroup}>
              {aligns.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-label={a.label}
                  aria-pressed={style.justification === a.id}
                  className={style.justification === a.id ? `${styles.alignBtn} ${styles.alignActive}` : styles.alignBtn}
                  onClick={() => onChange({ justification: a.id })}
                >
                  <AlignIcon kind={a.id} />
                </button>
              ))}
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Size</span>
            <input type="number" className={styles.number} min="1" step="1"
              value={Math.round(style.fontSize)}
              onChange={(e) => onChange({ fontSize: Math.max(1, Number(e.target.value)) })} />
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Line</span>
            <input type="number" className={styles.number} min="0" step="1"
              value={Math.round(style.leading)}
              onChange={(e) => onChange({ leading: Math.max(0, Number(e.target.value)) })} />
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Tracking</span>
            <input type="number" className={styles.number} step="0.5"
              value={Math.round((style.tracking ?? 0) * 10) / 10}
              onChange={(e) => onChange({ tracking: Number(e.target.value) })} />
          </div>
        </div>
      )}

      <label className={styles.row}>
        <input type="checkbox" checked={style.hasFill}
          onChange={(e) => onChange({ fillColor: e.target.checked ? style.fillColor : null })} />
        <span className={styles.label}>Fill</span>
        <input type="color" className={styles.swatch} value={style.fillColor} disabled={!style.hasFill}
          onChange={(e) => onChange({ fillColor: e.target.value })} />
      </label>

      <label className={styles.row}>
        <input type="checkbox" checked={style.hasStroke}
          onChange={(e) => onChange({ strokeColor: e.target.checked ? style.strokeColor : null })} />
        <span className={styles.label}>Stroke</span>
        <input type="color" className={styles.swatch} value={style.strokeColor} disabled={!style.hasStroke}
          onChange={(e) => onChange({ strokeColor: e.target.value })} />
      </label>

      <div className={styles.row}>
        <span className={styles.label}>Width</span>
        <input type="number" className={styles.number} min="0" step="0.5"
          value={style.strokeWidth} disabled={!style.hasStroke}
          onChange={(e) => onChange({ strokeWidth: Number(e.target.value) })} />
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Opacity</span>
        <input type="range" className={styles.range} min="0" max="100" value={opacityPct}
          onChange={(e) => onChange({ opacity: Number(e.target.value) / 100 })} />
        <span className={styles.value}>{opacityPct}%</span>
      </div>
    </>
  );
}

/**
 * Right-hand panel. Adapts to the selection: nothing, a single item (style
 * controls), a group (ungroup), or several items (group + boolean ops).
 */
export default function Properties({ sel, onChange, onAction }) {
  const { count, isGroup, style } = sel;

  if (count === 0) {
    return (
      <aside className={styles.panel} aria-label="Properties">
        <p className={styles.empty}>Nothing selected</p>
      </aside>
    );
  }

  return (
    <aside className={styles.panel} aria-label="Properties">
      {count >= 2 && (
        <div className={styles.actions}>
          <p className={styles.heading}>{count} objects selected</p>
          <button type="button" className={styles.action} onClick={() => onAction('group')}>
            Group
          </button>
          <div className={styles.actionGrid}>
            {BOOLEANS.map((b) => (
              <button key={b.id} type="button" className={styles.action} onClick={() => onAction(b.id)}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {count === 1 && isGroup && (
        <div className={styles.actions}>
          <p className={styles.heading}>Group</p>
          <button type="button" className={styles.action} onClick={() => onAction('ungroup')}>
            Ungroup
          </button>
          {style && (
            <div className={styles.row}>
              <span className={styles.label}>Opacity</span>
              <input
                type="range"
                className={styles.range}
                min="0"
                max="100"
                value={Math.round(style.opacity * 100)}
                onChange={(e) => onChange({ opacity: Number(e.target.value) / 100 })}
              />
              <span className={styles.value}>{Math.round(style.opacity * 100)}%</span>
            </div>
          )}
        </div>
      )}

      {count === 1 && !isGroup && style && <StyleControls style={style} onChange={onChange} />}
    </aside>
  );
}
