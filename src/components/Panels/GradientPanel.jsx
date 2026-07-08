import { useEffect, useRef, useState } from 'react';
import { subscribeSelection, getSelectedItems } from '../../state/selection.js';
import { subscribeDocument } from '../../state/document.js';
import paper from 'paper';
import {
  getGradient, applyGradient, readGeometry, defaultGradient, rampColorAt,
} from '../../canvas/operations/gradients.js';
import { afterStyleEdit } from '../../canvas/operations/swatchOps.js';
import styles from './GradientPanel.module.css';

// Gradient panel: build and edit the fill gradient of the selected paths.
// A ramp bar shows the stops (drag to move, click empty to add, Alt-click to
// remove); the selected stop exposes colour / opacity / location. Type, angle,
// reverse, presets and interpolation/dither options sit around it. Edits apply
// live to every selected path (each keeps its own axis geometry).

const TYPES = [
  { id: 'linear', label: 'Linear' },
  { id: 'radial', label: 'Radial' },
  { id: 'conic', label: 'Conic' },
];

const PRESETS = [
  ['#ffffff', '#1a1a1a'],
  ['#1a1a1a', '#ffffff'],
  ['#a05252', '#a89e55'],
  ['#5a7794', '#96608a'],
  ['#6e8f62', '#5f8d86'],
  ['#a8784f', '#2b2b2b'],
];

// A CSS gradient string for the preview swatch.
function cssRamp(desc) {
  const stops = desc.stops
    .slice()
    .sort((a, b) => a.offset - b.offset)
    .map((s) => `${withAlpha(s.color, s.opacity)} ${Math.round(s.offset * 100)}%`)
    .join(', ');
  if (desc.type === 'radial') return `radial-gradient(circle, ${stops})`;
  if (desc.type === 'conic') return `conic-gradient(from ${desc.angle || 0}deg, ${stops})`;
  return `linear-gradient(90deg, ${stops})`;
}

function withAlpha(hex, opacity) {
  const a = Math.round((opacity == null ? 1 : opacity) * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
}

const paths = () => getSelectedItems().filter((it) => it instanceof paper.Path);

export default function GradientPanel() {
  const [, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);
  const [desc, setDesc] = useState(() => defaultGradient('linear'));
  const [sel, setSel] = useState(0); // selected stop index
  const barRef = useRef(null);

  // Re-read the gradient of the first selected path when the selection or
  // document changes (so external edits — the on-canvas tool — reflect here).
  useEffect(() => {
    const sync = () => {
      const p = paths()[0];
      const g = p && getGradient(p, 'fill');
      if (g) setDesc(JSON.parse(JSON.stringify(g)));
      bump();
    };
    sync();
    const u1 = subscribeSelection(sync);
    const u2 = subscribeDocument(sync);
    return () => { u1(); u2(); };
  }, []);

  const hasSelection = paths().length > 0;

  // Push the working descriptor onto every selected path and redraw.
  const apply = (next) => {
    setDesc(next);
    const list = paths();
    const first = list[0];
    const sameType = first && getGradient(first, 'fill') && getGradient(first, 'fill').type === next.type;
    list.forEach((p) => {
      const existing = getGradient(p, 'fill');
      const keepGeom = existing && existing.type === next.type ? readGeometry(p, 'fill') : null;
      applyGradient(p, JSON.parse(JSON.stringify(next)), 'fill', keepGeom);
    });
    if (list.length) afterStyleEdit();
    void sameType;
  };

  const sortedIdx = () => desc.stops
    .map((s, i) => ({ s, i }))
    .sort((a, b) => a.s.offset - b.s.offset);

  const setStop = (i, patch) => {
    const next = { ...desc, stops: desc.stops.map((s, k) => (k === i ? { ...s, ...patch } : s)) };
    apply(next);
  };

  const addStopAt = (offset) => {
    const { color, opacity } = rampColorAt(desc, offset);
    const next = { ...desc, stops: [...desc.stops, { offset, color, opacity }] };
    apply(next);
    setSel(next.stops.length - 1);
  };

  const removeStop = (i) => {
    if (desc.stops.length <= 2) return;
    const next = { ...desc, stops: desc.stops.filter((_, k) => k !== i) };
    apply(next);
    setSel(0);
  };

  const reverse = () => {
    apply({ ...desc, stops: desc.stops.map((s) => ({ ...s, offset: 1 - s.offset })) });
  };

  // --- stop bar interaction ---
  const offsetFromEvent = (e) => {
    const rect = barRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  };

  const onBarPointerDown = (e) => {
    if (e.target.dataset.stop != null) return; // handled by the marker
    if (!hasSelection) return;
    addStopAt(offsetFromEvent(e));
  };

  const dragStop = (i) => (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.altKey) { removeStop(i); return; }
    setSel(i);
    e.target.setPointerCapture?.(e.pointerId);
    const move = (ev) => setStop(i, { offset: offsetFromEvent(ev) });
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const active = desc.stops[sel] || desc.stops[0];

  return (
    <aside className={styles.panel} aria-label="Gradient">
      <div className={styles.header}>
        <span className={styles.title}>Gradient</span>
        <div className={styles.types}>
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={desc.type === t.id ? styles.typeOn : styles.type}
              onClick={() => apply({ ...desc, type: t.id })}
              title={t.label}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {!hasSelection && (
        <div className={styles.hint}>Select an object to apply a gradient.</div>
      )}

      <div
        className={styles.bar}
        ref={barRef}
        onPointerDown={onBarPointerDown}
        style={{ background: cssRamp({ ...desc, type: 'linear' }) }}
        aria-label="Gradient stops"
      >
        {desc.stops.map((s, i) => (
          <span
            key={i}
            data-stop={i}
            className={i === sel ? styles.stopOn : styles.stop}
            style={{ left: `${s.offset * 100}%`, background: s.color }}
            onPointerDown={dragStop(i)}
            title={`${Math.round(s.offset * 100)}%`}
          />
        ))}
      </div>

      <div className={styles.previewRow}>
        <span className={styles.preview} style={{ background: cssRamp(desc) }} />
        <button type="button" className={styles.smallBtn} onClick={reverse} disabled={!hasSelection}>
          Reverse
        </button>
      </div>

      <div className={styles.stopEditor}>
        <label className={styles.field}>
          <span>Stop</span>
          <input
            type="color"
            value={active.color}
            disabled={!hasSelection}
            onChange={(e) => setStop(sel, { color: e.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span>Opacity</span>
          <input
            type="number" min="0" max="100" className={styles.num}
            value={Math.round((active.opacity ?? 1) * 100)}
            disabled={!hasSelection}
            onChange={(e) => setStop(sel, { opacity: Math.max(0, Math.min(100, +e.target.value)) / 100 })}
          />
        </label>
        <label className={styles.field}>
          <span>Location</span>
          <input
            type="number" min="0" max="100" className={styles.num}
            value={Math.round(active.offset * 100)}
            disabled={!hasSelection}
            onChange={(e) => setStop(sel, { offset: Math.max(0, Math.min(100, +e.target.value)) / 100 })}
          />
        </label>
      </div>

      {(desc.type === 'linear' || desc.type === 'conic') && (
        <label className={styles.field}>
          <span>Angle</span>
          <input
            type="number" className={styles.num}
            value={Math.round(desc.angle || 0)}
            disabled={!hasSelection}
            onChange={(e) => apply({ ...desc, angle: +e.target.value })}
          />
          <span className={styles.unit}>°</span>
        </label>
      )}

      <div className={styles.options}>
        <label className={styles.field}>
          <span>Interpolation</span>
          <select
            className={styles.select}
            value={desc.interpolation || 'classic'}
            disabled={!hasSelection}
            onChange={(e) => apply({ ...desc, interpolation: e.target.value })}
          >
            <option value="classic">Classic</option>
            <option value="perceptual">Perceptual</option>
          </select>
        </label>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={!!desc.dither}
            disabled={!hasSelection}
            onChange={(e) => apply({ ...desc, dither: e.target.checked })}
          />
          <span>Dither</span>
        </label>
      </div>

      <div className={styles.presets}>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            type="button"
            className={styles.presetSwatch}
            style={{ background: `linear-gradient(90deg, ${p[0]}, ${p[1]})` }}
            disabled={!hasSelection}
            title="Apply preset"
            onClick={() => apply({
              ...desc,
              stops: [{ offset: 0, color: p[0], opacity: 1 }, { offset: 1, color: p[1], opacity: 1 }],
            })}
          />
        ))}
      </div>
    </aside>
  );
}
