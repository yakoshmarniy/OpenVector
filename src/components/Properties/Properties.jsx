import styles from './Properties.module.css';
import FontPicker from '../FontPicker/FontPicker.jsx';

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

function LineIcon({ kind }) {
  const dash = { solid: undefined, dashed: '5 3', dotted: '0.1 3' }[kind];
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
      <line x1="2" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="2"
        strokeLinecap={kind === 'dotted' ? 'round' : 'butt'} strokeDasharray={dash} />
    </svg>
  );
}

function CapIcon({ kind }) {
  const cap = { butt: 'butt', round: 'round', square: 'square' }[kind];
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
      <line x1="6" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="6" strokeLinecap={cap} />
      <line x1="6" y1="2" x2="6" y2="12" stroke="var(--ov-text-dim)" strokeWidth="0.75" />
    </svg>
  );
}

function JoinIcon({ kind }) {
  const join = { miter: 'miter', round: 'round', bevel: 'bevel' }[kind];
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
      <polyline points="4,12 4,4 18,4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin={join} />
    </svg>
  );
}

const LINE_TYPES = [
  { id: 'solid', label: 'Solid', Icon: LineIcon },
  { id: 'dashed', label: 'Dashed', Icon: LineIcon },
  { id: 'dotted', label: 'Dotted', Icon: LineIcon },
];
const CAPS = [
  { id: 'butt', label: 'Butt cap', Icon: CapIcon },
  { id: 'round', label: 'Round cap', Icon: CapIcon },
  { id: 'square', label: 'Square cap', Icon: CapIcon },
];
const JOINS = [
  { id: 'miter', label: 'Miter join', Icon: JoinIcon },
  { id: 'round', label: 'Round join', Icon: JoinIcon },
  { id: 'bevel', label: 'Bevel join', Icon: JoinIcon },
];

// One row of mutually-exclusive icon buttons.
function Seg({ options, value, onPick, disabled }) {
  return (
    <div className={styles.alignGroup}>
      {options.map((o) => {
        const Icon = o.Icon;
        const active = value === o.id;
        return (
          <button key={o.id} type="button" title={o.label} aria-label={o.label} aria-pressed={active}
            disabled={disabled}
            className={active ? `${styles.alignBtn} ${styles.alignActive}` : styles.alignBtn}
            onClick={() => onPick(o.id)}>
            <Icon kind={o.id} />
          </button>
        );
      })}
    </div>
  );
}

// Translate a line-type preset into a concrete dash pattern (scaled by width).
function dashPatternFor(lineType, strokeWidth) {
  const w = Math.max(1, strokeWidth || 1);
  if (lineType === 'dashed') return [w * 3, w * 2];
  if (lineType === 'dotted') return [0, w * 2];
  return [];
}

const ALIGNS = [
  { id: 'alignLeft', label: 'Align left', glyph: 'L' },
  { id: 'alignHCenter', label: 'Align centers (horizontal)', glyph: 'C' },
  { id: 'alignRight', label: 'Align right', glyph: 'R' },
  { id: 'alignTop', label: 'Align top', glyph: 'T' },
  { id: 'alignVCenter', label: 'Align centers (vertical)', glyph: 'M' },
  { id: 'alignBottom', label: 'Align bottom', glyph: 'B' },
];

const DISTRIBUTE = [
  { id: 'distributeH', label: 'Distribute horizontally', glyph: 'H' },
  { id: 'distributeV', label: 'Distribute vertically', glyph: 'V' },
];

function StyleControls({ style, onChange, onManageFonts }) {
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
            <span className={styles.label}>Font</span>
            <FontPicker
              value={style.fontFamily}
              onChange={(family) => onChange({ fontFamily: family })}
              onManage={onManageFonts}
            />
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Style</span>
            <div className={styles.alignGroup}>
              <button
                type="button"
                title="Bold"
                aria-label="Bold"
                aria-pressed={(style.fontWeight || 400) >= 600}
                className={(style.fontWeight || 400) >= 600 ? `${styles.alignBtn} ${styles.alignActive}` : styles.alignBtn}
                onClick={() => onChange({ fontWeight: (style.fontWeight || 400) >= 600 ? 400 : 700 })}
              >
                <span style={{ fontWeight: 700 }}>B</span>
              </button>
              <button
                type="button"
                title="Italic"
                aria-label="Italic"
                aria-pressed={style.fontStyle === 'italic'}
                className={style.fontStyle === 'italic' ? `${styles.alignBtn} ${styles.alignActive}` : styles.alignBtn}
                onClick={() => onChange({ fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' })}
              >
                <span style={{ fontStyle: 'italic' }}>I</span>
              </button>
            </div>
          </div>
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
          <div className={styles.row}>
            <span className={styles.label}>Baseline</span>
            <input type="number" className={styles.number} step="1"
              title="Baseline shift"
              value={Math.round(style.baselineShift ?? 0)}
              onChange={(e) => onChange({ baselineShift: Number(e.target.value) })} />
          </div>

          {style.textMode !== 'path' && style.orientation !== 'vertical' && (
            <>
              <span className={styles.subLabel}>Paragraph</span>
              {style.textMode === 'area' && (
                <div className={styles.tightRow}>
                  <span className={styles.label}>Indent</span>
                  <input type="number" className={styles.numberXs} min="0" step="1"
                    title="Left indent"
                    value={Math.round(style.indentLeft ?? 0)}
                    onChange={(e) => onChange({ indentLeft: Math.max(0, Number(e.target.value)) })} />
                  <input type="number" className={styles.numberXs} min="0" step="1"
                    title="First-line indent"
                    value={Math.round(style.indentFirst ?? 0)}
                    onChange={(e) => onChange({ indentFirst: Math.max(0, Number(e.target.value)) })} />
                  <input type="number" className={styles.numberXs} min="0" step="1"
                    title="Right indent"
                    value={Math.round(style.indentRight ?? 0)}
                    onChange={(e) => onChange({ indentRight: Math.max(0, Number(e.target.value)) })} />
                </div>
              )}
              <div className={styles.row}>
                <span className={styles.label}>Space</span>
                <input type="number" className={styles.numberSm} min="0" step="1"
                  title="Space before paragraph"
                  value={Math.round(style.spaceBefore ?? 0)}
                  onChange={(e) => onChange({ spaceBefore: Math.max(0, Number(e.target.value)) })} />
                <input type="number" className={styles.numberSm} min="0" step="1"
                  title="Space after paragraph"
                  value={Math.round(style.spaceAfter ?? 0)}
                  onChange={(e) => onChange({ spaceAfter: Math.max(0, Number(e.target.value)) })} />
              </div>
            </>
          )}
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

      {!style.isText && (
        <div className={styles.strokeDetail}>
          <div className={styles.row}>
            <span className={styles.label}>Line</span>
            <Seg options={LINE_TYPES} value={style.lineType} disabled={!style.hasStroke}
              onPick={(id) => onChange({
                dashArray: dashPatternFor(id, style.strokeWidth),
                strokeCap: id === 'dotted' ? 'round' : style.strokeCap,
              })} />
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Cap</span>
            <Seg options={CAPS} value={style.strokeCap} disabled={!style.hasStroke}
              onPick={(id) => onChange({ strokeCap: id })} />
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Join</span>
            <Seg options={JOINS} value={style.strokeJoin} disabled={!style.hasStroke}
              onPick={(id) => onChange({ strokeJoin: id })} />
          </div>

          {style.lineType !== 'solid' && (
            <div className={styles.row}>
              <span className={styles.label}>Dash</span>
              <input type="number" className={styles.numberSm} min="0" step="1"
                value={Math.round(style.dashArray[0] ?? 0)} disabled={!style.hasStroke}
                onChange={(e) => onChange({
                  dashArray: [Math.max(0, Number(e.target.value)), style.dashArray[1] ?? 3],
                })} />
              <span className={styles.gapLabel}>Gap</span>
              <input type="number" className={styles.numberSm} min="0" step="1"
                value={Math.round(style.dashArray[1] ?? 0)} disabled={!style.hasStroke}
                onChange={(e) => onChange({
                  dashArray: [style.dashArray[0] ?? 0, Math.max(0, Number(e.target.value))],
                })} />
            </div>
          )}

          {style.isOpenPath && (
            <>
              <span className={styles.subLabel}>Arrowheads</span>
              <div className={styles.row}>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={style.arrowStart} disabled={!style.hasStroke}
                    onChange={(e) => onChange({ arrowStart: e.target.checked })} />
                  Start
                </label>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={style.arrowEnd} disabled={!style.hasStroke}
                    onChange={(e) => onChange({ arrowEnd: e.target.checked })} />
                  End
                </label>
                <input type="number" className={styles.numberSm} min="0.25" max="6" step="0.25"
                  title="Arrowhead size"
                  value={style.arrowScale}
                  disabled={!style.hasStroke || (!style.arrowStart && !style.arrowEnd)}
                  onChange={(e) => onChange({ arrowScale: Math.max(0.25, Number(e.target.value)) })} />
              </div>
            </>
          )}
        </div>
      )}

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
export default function Properties({ sel, onChange, onAction, onManageFonts }) {
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

          <span className={styles.subLabel}>Align</span>
          <div className={styles.iconRow}>
            {ALIGNS.map((a) => (
              <button key={a.id} type="button" title={a.label} aria-label={a.label}
                className={styles.iconBtn} onClick={() => onAction(a.id)}>
                {a.glyph}
              </button>
            ))}
          </div>

          <span className={styles.subLabel}>Distribute</span>
          <div className={styles.iconRow}>
            {DISTRIBUTE.map((d) => (
              <button key={d.id} type="button" title={d.label} aria-label={d.label}
                className={styles.iconBtn} disabled={count < 3}
                onClick={() => onAction(d.id)}>
                {d.glyph}
              </button>
            ))}
          </div>

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

      {count === 1 && !isGroup && style && (
        <StyleControls style={style} onChange={onChange} onManageFonts={onManageFonts} />
      )}
    </aside>
  );
}
