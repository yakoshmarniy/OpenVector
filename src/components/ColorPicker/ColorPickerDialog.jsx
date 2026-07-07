import { useCallback, useEffect, useRef, useState } from 'react';
import {
  normHex, hexToRgb, rgbToHex, rgbToHsb, hsbToRgb, rgbToCmyk, cmykToRgb,
  isOutOfCmykGamut, nearestInGamut,
} from '../../canvas/operations/colorConvert.js';
import { getColorMode } from '../../state/colors.js';
import styles from './ColorPickerDialog.module.css';

// Illustrator-style colour picker: saturation×brightness field + hue strip,
// HSB / RGB / CMYK / Hex fields, old vs new preview, and an out-of-gamut
// warning when the document is in CMYK mode. Optionally edits swatch
// metadata (name / global / spot) when `meta` is passed.

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function useDrag(onPoint) {
  const ref = useRef(null);
  const handler = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    onPoint(
      clamp((e.clientX - rect.left) / rect.width, 0, 1),
      clamp((e.clientY - rect.top) / rect.height, 0, 1),
    );
  }, [onPoint]);
  const onPointerDown = (e) => {
    e.preventDefault();
    ref.current?.setPointerCapture(e.pointerId);
    handler(e);
  };
  const onPointerMove = (e) => {
    if (e.buttons & 1) handler(e);
  };
  return { ref, onPointerDown, onPointerMove };
}

function Field({ label, value, min, max, onCommit }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <input
        type="number"
        className={styles.fieldInput}
        min={min}
        max={max}
        value={Math.round(value)}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onCommit(clamp(n, min, max));
        }}
      />
    </label>
  );
}

export default function ColorPickerDialog({
  title = 'Color Picker',
  initial = '#808080',
  meta = null, // { name, global, spot } — renders swatch options when set
  onApply,
  onClose,
}) {
  const [hsb, setHsb] = useState(() => rgbToHsb(hexToRgb(normHex(initial) || '#808080')));
  const [hexText, setHexText] = useState(() => normHex(initial) || '#808080');
  const [swatchMeta, setSwatchMeta] = useState(meta);

  const rgb = hsbToRgb(hsb);
  const hex = rgbToHex(rgb);
  const cmyk = rgbToCmyk(rgb);
  const cmykMode = getColorMode() === 'cmyk';
  const outOfGamut = cmykMode && isOutOfCmykGamut(hex);

  const setFromHsb = (next) => {
    setHsb(next);
    setHexText(rgbToHex(hsbToRgb(next)));
  };
  const setFromRgb = (next) => {
    const nh = rgbToHsb(next);
    // Keep the chosen hue when the colour collapses to gray (s = 0).
    setHsb((prev) => ({ ...nh, h: nh.s === 0 ? prev.h : nh.h }));
    setHexText(rgbToHex(next));
  };

  const sv = useDrag((x, y) => setFromHsb({ ...hsb, s: x * 100, b: (1 - y) * 100 }));
  const hue = useDrag((x, y) => setFromHsb({ ...hsb, h: y * 360 }));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const commitHex = () => {
    const h = normHex(hexText);
    if (h) setFromRgb(hexToRgb(h));
    else setHexText(hex);
  };

  const hueCss = `hsl(${Math.round(hsb.h)}, 100%, 50%)`;

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-label={title}>
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.wells}>
            <div
              className={styles.svField}
              style={{ backgroundColor: hueCss }}
              ref={sv.ref}
              onPointerDown={sv.onPointerDown}
              onPointerMove={sv.onPointerMove}
              aria-label="Saturation and brightness"
            >
              <div
                className={styles.svMarker}
                style={{ left: `${hsb.s}%`, top: `${100 - hsb.b}%` }}
              />
            </div>
            <div
              className={styles.hueStrip}
              ref={hue.ref}
              onPointerDown={hue.onPointerDown}
              onPointerMove={hue.onPointerMove}
              aria-label="Hue"
            >
              <div className={styles.hueMarker} style={{ top: `${(hsb.h / 360) * 100}%` }} />
            </div>
            <div className={styles.previewCol}>
              <div className={styles.previewBlock}>
                <div className={styles.previewNew} style={{ background: hex }} title="New color" />
                <div
                  className={styles.previewOld}
                  style={{ background: normHex(initial) || '#808080' }}
                  title="Current color"
                />
              </div>
              <span className={styles.previewLabel}>new / old</span>
              {outOfGamut && (
                <button
                  type="button"
                  className={styles.gamut}
                  title="Out of CMYK gamut — click to correct"
                  onClick={() => setFromRgb(hexToRgb(nearestInGamut(hex)))}
                >
                  <span className={styles.gamutMark}>⚠</span>
                  <span className={styles.gamutChip} style={{ background: nearestInGamut(hex) }} />
                </button>
              )}
            </div>
          </div>

          <div className={styles.fields}>
            <div className={styles.fieldCol}>
              <Field label="H" value={hsb.h} min={0} max={360} onCommit={(v) => setFromHsb({ ...hsb, h: v })} />
              <Field label="S" value={hsb.s} min={0} max={100} onCommit={(v) => setFromHsb({ ...hsb, s: v })} />
              <Field label="B" value={hsb.b} min={0} max={100} onCommit={(v) => setFromHsb({ ...hsb, b: v })} />
            </div>
            <div className={styles.fieldCol}>
              <Field label="R" value={rgb.r} min={0} max={255} onCommit={(v) => setFromRgb({ ...rgb, r: v })} />
              <Field label="G" value={rgb.g} min={0} max={255} onCommit={(v) => setFromRgb({ ...rgb, g: v })} />
              <Field label="B" value={rgb.b} min={0} max={255} onCommit={(v) => setFromRgb({ ...rgb, b: v })} />
            </div>
            <div className={styles.fieldCol}>
              <Field label="C" value={cmyk.c} min={0} max={100} onCommit={(v) => setFromRgb(cmykToRgb({ ...cmyk, c: v }))} />
              <Field label="M" value={cmyk.m} min={0} max={100} onCommit={(v) => setFromRgb(cmykToRgb({ ...cmyk, m: v }))} />
              <Field label="Y" value={cmyk.y} min={0} max={100} onCommit={(v) => setFromRgb(cmykToRgb({ ...cmyk, y: v }))} />
              <Field label="K" value={cmyk.k} min={0} max={100} onCommit={(v) => setFromRgb(cmykToRgb({ ...cmyk, k: v }))} />
            </div>
          </div>

          <label className={styles.hexRow}>
            <span className={styles.fieldLabel}>Hex</span>
            <input
              type="text"
              className={styles.hexInput}
              value={hexText}
              onChange={(e) => setHexText(e.target.value)}
              onBlur={commitHex}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitHex();
                }
              }}
            />
          </label>

          {swatchMeta && (
            <div className={styles.metaRows}>
              <label className={styles.hexRow}>
                <span className={styles.fieldLabel}>Name</span>
                <input
                  type="text"
                  className={styles.nameInput}
                  value={swatchMeta.name}
                  onChange={(e) => setSwatchMeta({ ...swatchMeta, name: e.target.value })}
                />
              </label>
              <div className={styles.checkRow}>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={swatchMeta.global}
                    onChange={(e) => setSwatchMeta({ ...swatchMeta, global: e.target.checked })}
                  />
                  Global
                </label>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={swatchMeta.spot}
                    onChange={(e) => setSwatchMeta({ ...swatchMeta, spot: e.target.checked, global: e.target.checked ? true : swatchMeta.global })}
                  />
                  Spot color
                </label>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.btn} onClick={onClose}>Cancel</button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => onApply(hex, swatchMeta)}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
