import { useEffect, useState } from 'react';
import paper from 'paper';
import { getSelectedItems, subscribeSelection } from '../../state/selection.js';
import { subscribeDocument } from '../../state/document.js';
import { readStyle, applyStyle } from '../../canvas/operations/itemStyle.js';
import { afterStyleEdit } from '../../canvas/operations/swatchOps.js';
import { WIDTH_PRESETS } from '../../canvas/operations/widthProfile.js';
import styles from './StrokePanel.module.css';

// Stroke panel: the full stroke controls (weight, cap, corner/join + miter
// limit, dashed pattern, width profile, arrowheads with independent start/end
// sizes). Edits apply live to every selected path.

const CAPS = [
  { id: 'butt', title: 'Butt cap' },
  { id: 'round', title: 'Round cap' },
  { id: 'square', title: 'Projecting cap' },
];
const JOINS = [
  { id: 'miter', title: 'Miter join' },
  { id: 'round', title: 'Round join' },
  { id: 'bevel', title: 'Bevel join' },
];

const paths = () => getSelectedItems().filter((it) => it instanceof paper.Path || it instanceof paper.CompoundPath);

export default function StrokePanel() {
  const [, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);
  const [style, setStyle] = useState(null);

  useEffect(() => {
    const sync = () => {
      const p = paths()[0];
      setStyle(p ? readStyle(p) : null);
      bump();
    };
    sync();
    const u1 = subscribeSelection(sync);
    const u2 = subscribeDocument(sync);
    return () => { u1(); u2(); };
  }, []);

  const apply = (patch) => {
    const list = paths();
    if (!list.length) return;
    list.forEach((p) => applyStyle(p, patch));
    setStyle(readStyle(list[0]));
    afterStyleEdit();
  };

  const has = !!style;
  const s = style || {};
  const dash = s.dashArray || [];
  const dashed = dash.length > 0;

  const setDashCell = (idx, val) => {
    const next = dash.slice();
    while (next.length < 6) next.push(0);
    next[idx] = Math.max(0, Number(val) || 0);
    // Trim trailing zero pairs for a tidy pattern.
    let end = next.length;
    while (end >= 2 && next[end - 1] === 0 && next[end - 2] === 0) end -= 2;
    apply({ dashArray: next.slice(0, end) });
  };

  const swapArrows = () => {
    apply({
      arrowStart: s.arrowEnd, arrowEnd: s.arrowStart,
      arrowStartScale: s.arrowEndScale, arrowEndScale: s.arrowStartScale,
    });
  };

  return (
    <aside className={styles.panel} aria-label="Stroke">
      <div className={styles.header}><span className={styles.title}>Stroke</span></div>

      {!has && <div className={styles.hint}>Select a path to edit its stroke.</div>}

      <label className={styles.row}>
        <span className={styles.lbl}>Weight</span>
        <input
          type="number" min="0" step="0.5" className={styles.num}
          value={has ? +(+s.strokeWidth).toFixed(2) : ''}
          disabled={!has}
          onChange={(e) => apply({ strokeWidth: Math.max(0, Number(e.target.value)) })}
        />
        <span className={styles.unit}>pt</span>
      </label>

      <div className={styles.row}>
        <span className={styles.lbl}>Cap</span>
        <div className={styles.seg}>
          {CAPS.map((c) => (
            <button
              key={c.id} type="button" title={c.title} disabled={!has}
              className={s.strokeCap === c.id ? styles.segOn : styles.segBtn}
              onClick={() => apply({ strokeCap: c.id })}
            >{capIcon(c.id)}</button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.lbl}>Corner</span>
        <div className={styles.seg}>
          {JOINS.map((j) => (
            <button
              key={j.id} type="button" title={j.title} disabled={!has}
              className={s.strokeJoin === j.id ? styles.segOn : styles.segBtn}
              onClick={() => apply({ strokeJoin: j.id })}
            >{joinIcon(j.id)}</button>
          ))}
        </div>
      </div>

      {s.strokeJoin === 'miter' && (
        <label className={styles.row}>
          <span className={styles.lbl}>Limit</span>
          <input
            type="number" min="1" max="500" className={styles.num}
            value={has ? Math.round(s.miterLimit ?? 10) : ''}
            disabled={!has}
            onChange={(e) => apply({ miterLimit: Math.max(1, Number(e.target.value)) })}
          />
        </label>
      )}

      <label className={styles.check}>
        <input
          type="checkbox" checked={dashed} disabled={!has}
          onChange={(e) => apply({ dashArray: e.target.checked ? [6, 4] : [] })}
        />
        <span>Dashed line</span>
      </label>

      {dashed && (
        <div className={styles.dashGrid}>
          {[0, 1, 2].map((pair) => (
            <div className={styles.dashPair} key={pair}>
              <input
                type="number" min="0" className={styles.dashNum}
                value={dash[pair * 2] ?? 0} disabled={!has}
                onChange={(e) => setDashCell(pair * 2, e.target.value)}
                title="dash"
              />
              <input
                type="number" min="0" className={styles.dashNum}
                value={dash[pair * 2 + 1] ?? 0} disabled={!has}
                onChange={(e) => setDashCell(pair * 2 + 1, e.target.value)}
                title="gap"
              />
            </div>
          ))}
          <div className={styles.dashLabels}><span>dash</span><span>gap</span></div>
        </div>
      )}

      <label className={styles.row}>
        <span className={styles.lbl}>Profile</span>
        <select
          className={styles.select}
          value={s.widthPreset || 'uniform'}
          disabled={!has}
          onChange={(e) => apply({ widthPreset: e.target.value })}
        >
          {WIDTH_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          {s.widthPreset === 'custom' && <option value="custom">Custom</option>}
        </select>
      </label>

      {s.isOpenPath && (
        <div className={styles.arrows}>
          <div className={styles.arrowHead}>
            <span className={styles.lbl}>Arrowheads</span>
            <button type="button" className={styles.textBtn} disabled={!has} onClick={swapArrows}>Swap ⇄</button>
          </div>
          <div className={styles.arrowRow}>
            <label className={styles.check}>
              <input
                type="checkbox" checked={!!s.arrowStart} disabled={!has || !s.hasStroke}
                onChange={(e) => apply({ arrowStart: e.target.checked })}
              />
              <span>Start</span>
            </label>
            <input
              type="number" min="0.25" step="0.25" className={styles.num}
              value={+(+s.arrowStartScale).toFixed(2)}
              disabled={!has || !s.arrowStart}
              onChange={(e) => apply({ arrowStartScale: Math.max(0.25, Number(e.target.value)) })}
              title="Start scale"
            />
          </div>
          <div className={styles.arrowRow}>
            <label className={styles.check}>
              <input
                type="checkbox" checked={!!s.arrowEnd} disabled={!has || !s.hasStroke}
                onChange={(e) => apply({ arrowEnd: e.target.checked })}
              />
              <span>End</span>
            </label>
            <input
              type="number" min="0.25" step="0.25" className={styles.num}
              value={+(+s.arrowEndScale).toFixed(2)}
              disabled={!has || !s.arrowEnd}
              onChange={(e) => apply({ arrowEndScale: Math.max(0.25, Number(e.target.value)) })}
              title="End scale"
            />
          </div>
        </div>
      )}
    </aside>
  );
}

// Tiny inline glyphs for the cap/join segmented buttons.
function capIcon(id) {
  if (id === 'round') return <svg width="20" height="10"><line x1="4" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /></svg>;
  if (id === 'square') return <svg width="20" height="10"><line x1="4" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="6" strokeLinecap="square" /></svg>;
  return <svg width="20" height="10"><line x1="4" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="6" strokeLinecap="butt" /></svg>;
}
function joinIcon(id) {
  const lj = id === 'miter' ? 'miter' : id === 'round' ? 'round' : 'bevel';
  return (
    <svg width="20" height="14"><polyline points="4,12 4,4 16,4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin={lj} /></svg>
  );
}
