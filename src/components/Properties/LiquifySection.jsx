import { useEffect, useState } from 'react';
import {
  getLiquifyOptions,
  setLiquifyOptions,
  subscribeLiquify,
} from '../../state/liquify.js';
import { SIMPLIFY_MODES, TEXTURE_MODES } from '../../canvas/operations/liquify.js';
import styles from './Properties.module.css';

const MODE_LABELS = {
  warp: 'Warp',
  twirl: 'Twirl',
  pucker: 'Pucker',
  bloat: 'Bloat',
  scallop: 'Scallop',
  crystallize: 'Crystallize',
  wrinkle: 'Wrinkle',
};

// Brush options for the active Liquify tool. One shared brush across all
// seven tools (state/liquify.js); Alt-drag on canvas resizes it too, so the
// fields re-render on store changes. Stands in for Illustrator's
// double-click-the-tool options dialog until real dialogs land (15.x).
export default function LiquifySection({ mode }) {
  const [opts, setOpts] = useState(getLiquifyOptions);
  useEffect(() => subscribeLiquify(() => setOpts(getLiquifyOptions())), []);
  const set = (patch) => setLiquifyOptions(patch);

  const num = (v, lo) => Math.max(lo, Number(v) || 0);
  const texture = TEXTURE_MODES.includes(mode);

  return (
    <div className={styles.actions}>
      <p className={styles.heading}>{MODE_LABELS[mode]} Tool</p>

      <span className={styles.subLabel}>Brush (Alt-drag on canvas resizes)</span>
      <div className={styles.row}>
        <span className={styles.label}>Width</span>
        <input type="number" className={styles.number} min="4" step="1"
          title="Brush width"
          value={Math.round(opts.width)}
          onChange={(e) => set({ width: num(e.target.value, 4) })} />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Height</span>
        <input type="number" className={styles.number} min="4" step="1"
          title="Brush height"
          value={Math.round(opts.height)}
          onChange={(e) => set({ height: num(e.target.value, 4) })} />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Angle</span>
        <input type="number" className={styles.number} step="1"
          title="Brush angle"
          value={Math.round(opts.angle)}
          onChange={(e) => set({ angle: Number(e.target.value) || 0 })} />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Intensity</span>
        <input type="range" className={styles.range} min="0" max="100"
          value={opts.intensity}
          onChange={(e) => set({ intensity: Number(e.target.value) })} />
        <span className={styles.value}>{opts.intensity}%</span>
      </div>

      {SIMPLIFY_MODES.includes(mode) && (
        <div className={styles.row}>
          <span className={styles.label}>Simplify</span>
          <input type="range" className={styles.range} min="0" max="100"
            title="Anchor cleanup on release (0 = off)"
            value={opts.simplify}
            onChange={(e) => set({ simplify: Number(e.target.value) })} />
          <span className={styles.value}>{opts.simplify}</span>
        </div>
      )}

      {mode === 'twirl' && (
        <div className={styles.row}>
          <span className={styles.label}>Twirl Rate</span>
          <input type="number" className={styles.number} min="-180" max="180" step="1"
            title="Twirl rate — negative twirls counter-clockwise"
            value={Math.round(opts.twirlRate)}
            onChange={(e) => set({ twirlRate: Number(e.target.value) || 0 })} />
        </div>
      )}

      {texture && (
        <>
          <div className={styles.row}>
            <span className={styles.label}>Complexity</span>
            <input type="number" className={styles.number} min="1" max="15" step="1"
              value={Math.round(opts.complexity)}
              onChange={(e) => set({ complexity: num(e.target.value, 1) })} />
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Detail</span>
            <input type="number" className={styles.number} min="1" max="10" step="1"
              value={Math.round(opts.detail)}
              onChange={(e) => set({ detail: num(e.target.value, 1) })} />
          </div>
        </>
      )}

      {mode === 'wrinkle' && (
        <div className={styles.row}>
          <span className={styles.label}>H / V</span>
          <input type="number" className={styles.numberSm} min="0" max="100" step="1"
            title="Horizontal wrinkle %"
            value={Math.round(opts.wrinkleH)}
            onChange={(e) => set({ wrinkleH: num(e.target.value, 0) })} />
          <input type="number" className={styles.numberSm} min="0" max="100" step="1"
            title="Vertical wrinkle %"
            value={Math.round(opts.wrinkleV)}
            onChange={(e) => set({ wrinkleV: num(e.target.value, 0) })} />
        </div>
      )}

      {texture && (
        <>
          <span className={styles.subLabel}>Brush affects</span>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={opts.affectAnchors}
              onChange={(e) => set({ affectAnchors: e.target.checked })} />
            Anchor points
          </label>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={opts.affectInTangents}
              onChange={(e) => set({ affectInTangents: e.target.checked })} />
            In tangent handles
          </label>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={opts.affectOutTangents}
              onChange={(e) => set({ affectOutTangents: e.target.checked })} />
            Out tangent handles
          </label>
        </>
      )}
    </div>
  );
}
