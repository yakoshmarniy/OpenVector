import { useEffect, useRef, useState } from 'react';
import {
  getFontGroups, subscribeFonts, loadFontFiles, addGoogleFont, removeFont,
  GOOGLE_SUGGESTIONS,
} from '../../state/fonts.js';
import styles from './FontsDialog.module.css';

const DEFAULT_PREVIEW = 'The quick brown fox 0123';

function FontRow({ family, preview, removable }) {
  return (
    <div className={styles.fontRow}>
      <div className={styles.fontMeta}>
        <span className={styles.fontName}>{family}</span>
        <span className={styles.fontSample} style={{ fontFamily: family }}>
          {preview || DEFAULT_PREVIEW}
        </span>
      </div>
      {removable && (
        <button
          type="button"
          className={styles.remove}
          title={`Remove ${family}`}
          aria-label={`Remove ${family}`}
          onClick={() => removeFont(family)}
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * Font manager (Type > Fonts…): preview all available families, load font
 * files, add Google Fonts by name. Loaded files last for the session; the
 * Google list persists and re-fetches on startup.
 */
export default function FontsDialog({ onClose }) {
  const [groups, setGroups] = useState(getFontGroups);
  const [preview, setPreview] = useState(DEFAULT_PREVIEW);
  const [googleName, setGoogleName] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { kind: 'ok' | 'error', text }
  const fileRef = useRef(null);

  useEffect(() => subscribeFonts(() => setGroups(getFontGroups())), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const { added, errors } = await loadFontFiles(files);
    if (errors.length) setNotice({ kind: 'error', text: errors.join('; ') });
    else if (added.length) setNotice({ kind: 'ok', text: `Loaded: ${added.join(', ')}` });
  };

  const onAddGoogle = async (name) => {
    setBusy(true);
    setNotice(null);
    try {
      const family = await addGoogleFont(name);
      setGoogleName('');
      setNotice({ kind: 'ok', text: `Added ${family} from Google Fonts` });
    } catch (err) {
      setNotice({ kind: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-label="Fonts">
        <div className={styles.header}>
          <span className={styles.title}>Fonts</span>
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className={styles.controls}>
          <label className={styles.previewRow}>
            <span className={styles.label}>Preview</span>
            <input
              type="text"
              className={styles.textInput}
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
            />
          </label>

          <div className={styles.addRow}>
            <button type="button" className={styles.action} onClick={() => fileRef.current?.click()}>
              Load font file…
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              multiple
              className={styles.hiddenInput}
              onChange={onFiles}
            />
            <span className={styles.hint}>.ttf / .otf / .woff — kept for this session</span>
          </div>

          <div className={styles.addRow}>
            <input
              type="text"
              className={styles.textInput}
              placeholder="Google Fonts family, e.g. Roboto"
              value={googleName}
              disabled={busy}
              onChange={(e) => setGoogleName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !busy && onAddGoogle(googleName)}
            />
            <button
              type="button"
              className={styles.action}
              disabled={busy || !googleName.trim()}
              onClick={() => onAddGoogle(googleName)}
            >
              {busy ? 'Adding…' : 'Add'}
            </button>
          </div>

          <div className={styles.chips}>
            {GOOGLE_SUGGESTIONS.filter((s) => !groups.google.includes(s)).map((s) => (
              <button key={s} type="button" className={styles.chip} disabled={busy}
                onClick={() => onAddGoogle(s)}>
                {s}
              </button>
            ))}
          </div>

          {notice && (
            <p className={notice.kind === 'error' ? styles.error : styles.ok}>{notice.text}</p>
          )}
        </div>

        <div className={styles.listArea}>
          {groups.custom.length > 0 && (
            <>
              <div className={styles.groupTitle}>Loaded ({groups.custom.length})</div>
              {groups.custom.map((f) => (
                <FontRow key={f} family={f} preview={preview} removable />
              ))}
            </>
          )}
          {groups.google.length > 0 && (
            <>
              <div className={styles.groupTitle}>Google Fonts ({groups.google.length})</div>
              {groups.google.map((f) => (
                <FontRow key={f} family={f} preview={preview} removable />
              ))}
            </>
          )}
          <div className={styles.groupTitle}>System ({groups.system.length})</div>
          {groups.system.map((f) => (
            <FontRow key={f} family={f} preview={preview} />
          ))}
        </div>
      </div>
    </div>
  );
}
