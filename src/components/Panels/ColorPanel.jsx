import { useEffect, useRef, useState } from 'react';
import { subscribeSelection, getSelectedItems } from '../../state/selection.js';
import { subscribeDocument } from '../../state/document.js';
import {
  subscribeColors, getColorMode, getDefaultPaint, setDefaultPaint,
} from '../../state/colors.js';
import { readStyle, applyStyle } from '../../canvas/operations/itemStyle.js';
import { afterStyleEdit } from '../../canvas/operations/swatchOps.js';
import {
  normHex, hexToRgb, rgbToHex, rgbToHsb, hsbToRgb, rgbToCmyk, cmykToRgb,
  rgbToGray, grayToRgb, rgbToLab, labToRgb, isOutOfCmykGamut, nearestInGamut,
} from '../../canvas/operations/colorConvert.js';
import styles from './ColorPanel.module.css';

// Color panel: slider view of the focused paint (fill or stroke) in the
// chosen model — RGB / HSB / CMYK / Grayscale / Lab — plus a hex field and a
// click-to-pick spectrum bar, like Illustrator's Color panel. Edits apply to
// every selected object; with nothing selected they set the default paint.

const MODELS = {
  rgb: {
    label: 'RGB',
    channels: [
      { key: 'r', label: 'R', min: 0, max: 255 },
      { key: 'g', label: 'G', min: 0, max: 255 },
      { key: 'b', label: 'B', min: 0, max: 255 },
    ],
    from: (rgb) => ({ ...rgb }),
    to: (v) => ({ ...v }),
  },
  hsb: {
    label: 'HSB',
    channels: [
      { key: 'h', label: 'H', min: 0, max: 360, unit: '°' },
      { key: 's', label: 'S', min: 0, max: 100, unit: '%' },
      { key: 'b', label: 'B', min: 0, max: 100, unit: '%' },
    ],
    from: rgbToHsb,
    to: hsbToRgb,
  },
  cmyk: {
    label: 'CMYK',
    channels: [
      { key: 'c', label: 'C', min: 0, max: 100, unit: '%' },
      { key: 'm', label: 'M', min: 0, max: 100, unit: '%' },
      { key: 'y', label: 'Y', min: 0, max: 100, unit: '%' },
      { key: 'k', label: 'K', min: 0, max: 100, unit: '%' },
    ],
    from: rgbToCmyk,
    to: cmykToRgb,
  },
  gray: {
    label: 'Grayscale',
    channels: [{ key: 'k', label: 'K', min: 0, max: 100, unit: '%' }],
    from: (rgb) => ({ k: rgbToGray(rgb) }),
    to: (v) => grayToRgb(v.k),
  },
  lab: {
    label: 'Lab',
    channels: [
      { key: 'l', label: 'L', min: 0, max: 100 },
      { key: 'a', label: 'a', min: -128, max: 127 },
      { key: 'b', label: 'b', min: -128, max: 127 },
    ],
    from: rgbToLab,
    to: labToRgb,
  },
};

// Slider track gradient: sample the channel across its range with the other
// channels held at their current values.
function trackGradient(model, channel, values) {
  const def = MODELS[model];
  const stops = [];
  const n = 7;
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const v = { ...values, [channel.key]: channel.min + t * (channel.max - channel.min) };
    stops.push(`${rgbToHex(def.to(v))} ${Math.round(t * 100)}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

// Spectrum bar: hue across, white→pure→black down. Drawn once per size.
function drawSpectrum(canvas) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const hueGrad = ctx.createLinearGradient(0, 0, w, 0);
  for (let i = 0; i <= 6; i += 1) hueGrad.addColorStop(i / 6, `hsl(${i * 60}, 100%, 50%)`);
  ctx.fillStyle = hueGrad;
  ctx.fillRect(0, 0, w, h);
  const lum = ctx.createLinearGradient(0, 0, 0, h);
  lum.addColorStop(0, 'rgba(255,255,255,1)');
  lum.addColorStop(0.5, 'rgba(255,255,255,0)');
  lum.addColorStop(0.5, 'rgba(0,0,0,0)');
  lum.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = lum;
  ctx.fillRect(0, 0, w, h);
}

export default function ColorPanel({ paintFocus, onSetPaintFocus }) {
  const [, setTick] = useState(0);
  const [model, setModel] = useState(getColorMode() === 'cmyk' ? 'cmyk' : 'rgb');
  const [hexText, setHexText] = useState(null); // in-progress hex edit
  const spectrumRef = useRef(null);
  const bump = () => setTick((t) => t + 1);

  useEffect(() => subscribeSelection(bump), []);
  useEffect(() => subscribeDocument(bump), []);
  useEffect(() => subscribeColors(bump), []);
  useEffect(() => {
    if (spectrumRef.current) drawSpectrum(spectrumRef.current);
  }, []);

  const items = getSelectedItems();
  const style = items.length ? readStyle(items[0]) : null;
  const defaults = getDefaultPaint();
  const colorKey = paintFocus === 'stroke' ? 'strokeColor' : 'fillColor';

  const fillHex = style ? (style.hasFill ? style.fillColor : null) : defaults.fill;
  const strokeHex = style ? (style.hasStroke ? style.strokeColor : null) : defaults.stroke;
  const currentRaw = paintFocus === 'stroke' ? strokeHex : fillHex;
  const hex = normHex(currentRaw) || '#808080';
  const noPaint = !currentRaw;

  const applyHex = (nextHex) => {
    setHexText(null);
    if (items.length) {
      items.forEach((it) => applyStyle(it, { [colorKey]: nextHex }));
      afterStyleEdit();
    } else {
      setDefaultPaint({ [paintFocus]: nextHex });
    }
  };

  const def = MODELS[model];
  const values = def.from(hexToRgb(hex));
  const setChannel = (channel, raw) => {
    const v = Math.min(channel.max, Math.max(channel.min, raw));
    applyHex(rgbToHex(def.to({ ...values, [channel.key]: v })));
  };

  const pickFromSpectrum = (e) => {
    const canvas = spectrumRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(canvas.width - 1, Math.max(0, ((e.clientX - rect.left) / rect.width) * canvas.width));
    const y = Math.min(canvas.height - 1, Math.max(0, ((e.clientY - rect.top) / rect.height) * canvas.height));
    const [r, g, b] = canvas.getContext('2d').getImageData(Math.round(x), Math.round(y), 1, 1).data;
    applyHex(rgbToHex({ r, g, b }));
  };

  const outOfGamut = getColorMode() === 'cmyk' && !noPaint && isOutOfCmykGamut(hex);

  return (
    <aside className={styles.panel} aria-label="Color">
      <div className={styles.header}>
        <span className={styles.title}>Color</span>
        <select
          className={styles.modelSelect}
          aria-label="Color model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {Object.entries(MODELS).map(([id, m]) => (
            <option key={id} value={id}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.body}>
        <div className={styles.proxy} title="Fill / Stroke — X switches focus">
          <button
            type="button"
            aria-label="Edit stroke color"
            aria-pressed={paintFocus === 'stroke'}
            className={paintFocus === 'stroke' ? `${styles.proxyStroke} ${styles.proxyActive}` : styles.proxyStroke}
            style={{ borderColor: strokeHex || 'var(--ov-text-dim)' }}
            onClick={() => onSetPaintFocus?.('stroke')}
          >
            {!strokeHex && <span className={styles.noneSlash} />}
          </button>
          <button
            type="button"
            aria-label="Edit fill color"
            aria-pressed={paintFocus === 'fill'}
            className={paintFocus === 'fill' ? `${styles.proxyFill} ${styles.proxyActive}` : styles.proxyFill}
            style={{ background: fillHex || 'transparent' }}
            onClick={() => onSetPaintFocus?.('fill')}
          >
            {!fillHex && <span className={styles.noneSlash} />}
          </button>
        </div>

        <div className={styles.sliders}>
          {def.channels.map((ch) => (
            <div key={ch.key} className={styles.sliderRow}>
              <span className={styles.chLabel}>{ch.label}</span>
              <input
                type="range"
                className={styles.slider}
                style={{ backgroundImage: trackGradient(model, ch, values) }}
                min={ch.min}
                max={ch.max}
                value={Math.round(values[ch.key])}
                aria-label={`${def.label} ${ch.label}`}
                onChange={(e) => setChannel(ch, Number(e.target.value))}
              />
              <input
                type="number"
                className={styles.chValue}
                min={ch.min}
                max={ch.max}
                value={Math.round(values[ch.key])}
                aria-label={`${def.label} ${ch.label} value`}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n)) setChannel(ch, n);
                }}
              />
            </div>
          ))}

          <div className={styles.hexRow}>
            <span className={styles.chLabel}>#</span>
            <input
              type="text"
              className={styles.hexInput}
              value={hexText ?? hex.slice(1)}
              aria-label="Hex color"
              onChange={(e) => setHexText(e.target.value)}
              onBlur={() => {
                const h = normHex(hexText ?? '');
                if (h) applyHex(h);
                else setHexText(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.target.blur();
                }
              }}
            />
            {noPaint && <span className={styles.noneNote}>none</span>}
            {outOfGamut && (
              <button
                type="button"
                className={styles.gamut}
                title="Out of CMYK gamut — click to correct"
                onClick={() => applyHex(nearestInGamut(hex))}
              >
                <span className={styles.gamutMark}>⚠</span>
                <span className={styles.gamutChip} style={{ background: nearestInGamut(hex) }} />
              </button>
            )}
          </div>
        </div>
      </div>

      <canvas
        ref={spectrumRef}
        className={styles.spectrum}
        width={196}
        height={16}
        aria-label="Color spectrum"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          pickFromSpectrum(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons & 1) pickFromSpectrum(e);
        }}
      />
    </aside>
  );
}
