import { useEffect, useState } from 'react';
import { allFamilies, getFontGroups, subscribeFonts } from '../../state/fonts.js';
import { listFontUsage, replaceFont } from '../../canvas/operations/typography.js';
import styles from './FindFontDialog.module.css';

/**
 * Find Font (Type > Find Font…): every family used in the document with its
 * object count; pick a replacement and swap all uses at once.
 */
export default function FindFontDialog({ onClose, onReplaced }) {
  const [usage, setUsage] = useState(listFontUsage);
  const [, setGroups] = useState(getFontGroups); // re-render when fonts arrive
  const [picks, setPicks] = useState({}); // family → replacement choice

  useEffect(() => subscribeFonts(() => setGroups(getFontGroups())), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const families = allFamilies();

  const onReplace = (from) => {
    const to = picks[from];
    if (!to || to === from) return;
    const n = replaceFont(from, to);
    setUsage(listFontUsage());
    setPicks((p) => ({ ...p, [from]: undefined }));
    onReplaced?.(n);
  };

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-label="Find Font">
        <div className={styles.header}>
          <span className={styles.title}>Find Font</span>
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>✕</button>
        </div>

        {usage.length === 0 ? (
          <p className={styles.empty}>The document has no text objects.</p>
        ) : (
          <div className={styles.list}>
            {usage.map(({ family, count }) => (
              <div key={family} className={styles.row}>
                <span className={styles.name} style={{ fontFamily: family }}>{family}</span>
                <span className={styles.count}>{count}</span>
                <select
                  className={styles.pick}
                  aria-label={`Replace ${family} with`}
                  value={picks[family] || ''}
                  onChange={(e) => setPicks((p) => ({ ...p, [family]: e.target.value }))}
                >
                  <option value="">Replace with…</option>
                  {families.filter((f) => f !== family).map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.action}
                  disabled={!picks[family]}
                  onClick={() => onReplace(family)}
                >
                  Replace
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
