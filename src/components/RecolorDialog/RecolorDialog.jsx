import { useEffect, useRef, useState } from 'react';
import { getSelectedItems } from '../../state/selection.js';
import { getSwatches, addSwatch } from '../../state/colors.js';
import { collectColors, applyAssignments, restoreOriginals } from '../../canvas/operations/recolor.js';
import { afterStyleEdit } from '../../canvas/operations/swatchOps.js';
import {
  HARMONY_RULES, harmonyColors, nearestColor, toHsb, toHex,
} from '../../canvas/operations/harmony.js';
import { normHex } from '../../canvas/operations/colorConvert.js';
import styles from './RecolorDialog.module.css';

// Recolor Artwork: extracts the selection's colours into current → new rows,
// previews every edit live on the canvas, and restores the originals on
// Cancel. New colours are edited on the colour wheel (smooth / segmented /
// bars), with HSB sliders, harmony rules re-derived from the selected colour,
// linked hue rotation, randomisation, add/remove and a swatch-library limit.

const WHEEL = 210; // canvas css px (square)
const MARGIN = 10; // wheel edge → marker track inset

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// entry.next → wheel coordinates and back. Hue 0 points up, clockwise.
function markerPos(hex, R) {
  const { h, s } = toHsb(hex);
  const a = ((h - 90) * Math.PI) / 180;
  const r = (s / 100) * (R - MARGIN);
  return { x: R + r * Math.cos(a), y: R + r * Math.sin(a) };
}

function pointToHs(x, y, R) {
  const dx = x - R;
  const dy = y - R;
  const h = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
  const s = clamp((Math.hypot(dx, dy) / (R - MARGIN)) * 100, 0, 100);
  return { h, s };
}

function drawWheel(canvas, mode) {
  const ctx = canvas.getContext('2d');
  const R = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.beginPath();
  ctx.arc(R, R, R - 1, 0, Math.PI * 2);
  ctx.clip();

  if (mode === 'smooth' && typeof ctx.createConicGradient === 'function') {
    const grad = ctx.createConicGradient(-Math.PI / 2, R, R);
    for (let i = 0; i <= 12; i += 1) grad.addColorStop(i / 12, toHex({ h: i * 30, s: 100, b: 100 }));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const sat = ctx.createRadialGradient(R, R, 0, R, R, R - 1);
    sat.addColorStop(0, 'rgba(255,255,255,1)');
    sat.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sat;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Segmented (also the smooth fallback when conic gradients are missing):
    // 24 hue sectors × 6 saturation rings of flat patches.
    const sectors = 24;
    const rings = 6;
    for (let ri = rings - 1; ri >= 0; ri -= 1) {
      const rOut = ((ri + 1) / rings) * (R - 1);
      const s = ((ri + 0.5) / rings) * 100;
      for (let si = 0; si < sectors; si += 1) {
        const a0 = ((si * 360) / sectors - 90 - 180 / sectors) * (Math.PI / 180);
        const a1 = (((si + 1) * 360) / sectors - 90 - 180 / sectors) * (Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(R, R);
        ctx.arc(R, R, rOut, a0, a1);
        ctx.closePath();
        ctx.fillStyle = toHex({ h: (si * 360) / sectors, s, b: 100 });
        ctx.fill();
      }
    }
    // punch the innermost disc to near-white (s ≈ 0 core)
    ctx.beginPath();
    ctx.arc(R, R, (R - 1) / rings / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(R, R, R - 1, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawMarkers(canvas, entries, selectedIdx) {
  const ctx = canvas.getContext('2d');
  const R = canvas.width / 2;
  entries.forEach((entry, i) => {
    if (!entry.next) return;
    const { x, y } = markerPos(entry.next, R);
    const selected = i === selectedIdx;
    ctx.beginPath();
    ctx.arc(x, y, selected ? 9 : 6.5, 0, Math.PI * 2);
    ctx.fillStyle = entry.next;
    ctx.fill();
    ctx.lineWidth = selected ? 2 : 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, selected ? 10.5 : 7.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

export default function RecolorDialog({ onClose }) {
  const [entries, setEntries] = useState(() =>
    collectColors(getSelectedItems()).map((e) => ({ ...e, next: e.hex })));
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [rule, setRule] = useState('');
  const [linked, setLinked] = useState(false);
  const [limitToLib, setLimitToLib] = useState(false);
  const [wheelMode, setWheelMode] = useState('smooth');
  const originalsRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null); // index of the marker being dragged
  if (!originalsRef.current) originalsRef.current = entries.map((e) => ({ ...e }));

  const libColors = getSwatches().map((s) => normHex(s.color)).filter(Boolean);
  const snap = (hex) => (limitToLib && libColors.length ? nearestColor(hex, libColors) : hex);

  // Every mutation goes through here: snap to the library when limited,
  // paint the canvas live, notify the panels.
  const commit = (next) => {
    const snapped = next.map((e) => (e.next ? { ...e, next: snap(e.next) } : e));
    setEntries(snapped);
    applyAssignments(snapped);
    afterStyleEdit();
  };

  const updateSelected = (hex) => {
    commit(entries.map((e, i) => (i === selectedIdx ? { ...e, next: hex } : e)));
  };

  // Linked hue rotation: shift every colour's hue by the same delta.
  const rotateAll = (dh, draggedIdx = null, draggedS = null) => {
    commit(entries.map((e, i) => {
      if (!e.next) return e;
      const hsb = toHsb(e.next);
      const s = i === draggedIdx && draggedS !== null ? draggedS : hsb.s;
      return { ...e, next: toHex({ h: hsb.h + dh, s, b: hsb.b }) };
    }));
  };

  const applyRule = (id) => {
    setRule(id);
    if (!id) return;
    const base = entries[selectedIdx]?.next || entries[0]?.next;
    if (!base) return;
    const colors = harmonyColors(base, id);
    setLinked(true);
    commit(entries.map((e, i) => ({ ...e, next: colors[i % colors.length] })));
  };

  const shuffleOrder = () => {
    const nexts = entries.map((e) => e.next);
    for (let i = nexts.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [nexts[i], nexts[j]] = [nexts[j], nexts[i]];
    }
    commit(entries.map((e, i) => ({ ...e, next: nexts[i] })));
  };

  const jitterSB = () => {
    commit(entries.map((e) => {
      if (!e.next) return e;
      const hsb = toHsb(e.next);
      return {
        ...e,
        next: toHex({
          h: hsb.h,
          s: clamp(hsb.s * (0.7 + Math.random() * 0.6), 0, 100),
          b: clamp(hsb.b * (0.7 + Math.random() * 0.6), 5, 100),
        }),
      };
    }));
  };

  // Add: a free colour (no uses) spun off the selected one — it lives in the
  // harmony, and lands in the swatch library on OK.
  const addColor = () => {
    const from = entries[selectedIdx]?.next || '#5a7794';
    const hsb = toHsb(from);
    const next = [...entries, { hex: null, uses: [], next: toHex({ ...hsb, h: hsb.h + 30 }) }];
    setEntries(next);
    setSelectedIdx(next.length - 1);
  };

  // Remove: rows with artwork merge their uses into a neighbour row (the
  // classic reduce-palette move); free rows simply drop.
  const removeColor = () => {
    const entry = entries[selectedIdx];
    if (!entry) return;
    if (!entry.uses.length) {
      const next = entries.filter((_, i) => i !== selectedIdx);
      setEntries(next);
      setSelectedIdx(Math.max(0, selectedIdx - 1));
      return;
    }
    if (entries.length < 2) return;
    const targetIdx = selectedIdx === 0 ? 1 : selectedIdx - 1;
    const next = entries
      .map((e, i) => (i === targetIdx ? { ...e, uses: [...e.uses, ...entry.uses] } : e))
      .filter((_, i) => i !== selectedIdx);
    setSelectedIdx(Math.min(targetIdx > selectedIdx ? targetIdx - 1 : targetIdx, next.length - 1));
    commit(next);
  };

  const cancel = () => {
    restoreOriginals(originalsRef.current);
    afterStyleEdit();
    onClose();
  };

  const ok = () => {
    // Free colours added in the dialog become library swatches.
    entries.forEach((e) => {
      if (!e.uses.length && e.next) addSwatch({ color: e.next, global: false });
    });
    onClose();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') cancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || wheelMode === 'bars') return;
    drawWheel(canvas, wheelMode);
    drawMarkers(canvas, entries, selectedIdx);
  }, [entries, selectedIdx, wheelMode]);

  const canvasPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * WHEEL,
      y: ((e.clientY - rect.top) / rect.height) * WHEEL,
    };
  };

  const onWheelDown = (e) => {
    e.preventDefault();
    const { x, y } = canvasPoint(e);
    const R = WHEEL / 2;
    let best = -1;
    let bestD = 14;
    entries.forEach((entry, i) => {
      if (!entry.next) return;
      const p = markerPos(entry.next, R);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best >= 0) {
      dragRef.current = best;
      setSelectedIdx(best);
      canvasRef.current.setPointerCapture(e.pointerId);
    }
  };

  const onWheelMove = (e) => {
    const idx = dragRef.current;
    if (idx === null || idx === undefined || !(e.buttons & 1)) return;
    const { x, y } = canvasPoint(e);
    const { h, s } = pointToHs(x, y, WHEEL / 2);
    const entry = entries[idx];
    if (!entry?.next) return;
    const cur = toHsb(entry.next);
    if (linked) rotateAll(h - cur.h, idx, s);
    else commit(entries.map((en, i) => (i === idx ? { ...en, next: toHex({ h, s, b: cur.b }) } : en)));
  };

  const onWheelUp = () => {
    dragRef.current = null;
  };

  const selected = entries[selectedIdx] || null;
  const selHsb = selected?.next ? toHsb(selected.next) : { h: 0, s: 0, b: 0 };

  const setSelHsb = (patch) => {
    if (!selected?.next) return;
    const next = { ...selHsb, ...patch };
    if (linked && 'h' in patch) rotateAll(next.h - selHsb.h);
    else updateSelected(toHex(next));
  };

  const sliders = [
    { key: 'h', label: 'H', max: 360 },
    { key: 's', label: 'S', max: 100 },
    { key: 'b', label: 'B', max: 100 },
  ];

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && cancel()}>
      <div className={styles.dialog} role="dialog" aria-label="Recolor Artwork">
        <div className={styles.header}>
          <span className={styles.title}>Recolor Artwork</span>
          <button type="button" className={styles.close} aria-label="Close" onClick={cancel}>✕</button>
        </div>

        <div className={styles.toolsRow}>
          <select
            className={styles.select}
            aria-label="Harmony rule"
            value={rule}
            onChange={(e) => applyRule(e.target.value)}
          >
            <option value="">Harmony…</option>
            {HARMONY_RULES.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <button
            type="button"
            className={linked ? `${styles.toolBtn} ${styles.toolOn}` : styles.toolBtn}
            aria-pressed={linked}
            title="Link harmony colors — dragging rotates all hues together"
            onClick={() => setLinked((v) => !v)}
          >
            {linked ? 'Linked' : 'Unlinked'}
          </button>
          <button type="button" className={styles.toolBtn} title="Randomly change color order" onClick={shuffleOrder}>
            Shuffle
          </button>
          <button type="button" className={styles.toolBtn} title="Randomly vary saturation and brightness" onClick={jitterSB}>
            Vary S/B
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.wheelCol}>
            {wheelMode === 'bars' ? (
              <div className={styles.bars} aria-label="Color bars">
                {entries.map((e, i) => (
                  <button
                    key={`bar-${i}`}
                    type="button"
                    className={i === selectedIdx ? `${styles.bar} ${styles.barSelected}` : styles.bar}
                    style={{ background: e.next || 'transparent' }}
                    title={e.next || ''}
                    aria-label={`Color ${e.next || 'none'}`}
                    onClick={() => setSelectedIdx(i)}
                  />
                ))}
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className={styles.wheel}
                width={WHEEL}
                height={WHEEL}
                aria-label="Color wheel"
                onPointerDown={onWheelDown}
                onPointerMove={onWheelMove}
                onPointerUp={onWheelUp}
              />
            )}
            <div className={styles.modeRow} role="group" aria-label="Wheel mode">
              {[['smooth', 'Smooth'], ['segmented', 'Segmented'], ['bars', 'Bars']].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={wheelMode === id ? `${styles.modeBtn} ${styles.toolOn}` : styles.modeBtn}
                  aria-pressed={wheelMode === id}
                  onClick={() => setWheelMode(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className={styles.sliders}>
              {sliders.map(({ key, label, max }) => (
                <div key={key} className={styles.sliderRow}>
                  <span className={styles.chLabel}>{label}</span>
                  <input
                    type="range"
                    className={styles.slider}
                    min={0}
                    max={max}
                    value={Math.round(selHsb[key])}
                    disabled={!selected?.next}
                    aria-label={`New color ${label}`}
                    onChange={(e) => setSelHsb({ [key]: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    className={styles.chValue}
                    min={0}
                    max={max}
                    value={Math.round(selHsb[key])}
                    disabled={!selected?.next}
                    aria-label={`New color ${label} value`}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isFinite(n)) setSelHsb({ [key]: clamp(n, 0, max) });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.assignCol}>
            <div className={styles.assignHead}>
              <span className={styles.assignTitle}>
                Current → New ({entries.length})
              </span>
              <button type="button" className={styles.miniBtn} title="Add color" aria-label="Add color" onClick={addColor}>+</button>
              <button
                type="button"
                className={styles.miniBtn}
                title="Remove color (merges its artwork into the row above)"
                aria-label="Remove color"
                disabled={entries.length < 2 && !!entries[selectedIdx]?.uses.length}
                onClick={removeColor}
              >
                −
              </button>
            </div>
            <div className={styles.assignList}>
              {entries.map((e, i) => (
                <button
                  key={`row-${i}`}
                  type="button"
                  className={i === selectedIdx ? `${styles.assignRow} ${styles.assignSelected}` : styles.assignRow}
                  onClick={() => setSelectedIdx(i)}
                >
                  {e.hex ? (
                    <span className={styles.chipOld} style={{ background: e.hex }} title={e.hex} />
                  ) : (
                    <span className={`${styles.chipOld} ${styles.chipFree}`} title="New color (no artwork)" />
                  )}
                  <span className={styles.arrow}>→</span>
                  <span className={styles.chipNew} style={{ background: e.next }} title={e.next} />
                  <span className={styles.hexLabel}>{e.next}</span>
                  {e.uses.length > 0 && <span className={styles.useCount}>{e.uses.length}</span>}
                </button>
              ))}
            </div>
            <label className={styles.limitRow}>
              <input
                type="checkbox"
                checked={limitToLib}
                onChange={(e) => {
                  setLimitToLib(e.target.checked);
                  if (e.target.checked && libColors.length) {
                    const next = entries.map((en) => (
                      en.next ? { ...en, next: nearestColor(en.next, libColors) } : en));
                    setEntries(next);
                    applyAssignments(next);
                    afterStyleEdit();
                  }
                }}
              />
              Limit to swatch library
            </label>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.btn} onClick={cancel}>Cancel</button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={ok}>OK</button>
        </div>
      </div>
    </div>
  );
}
