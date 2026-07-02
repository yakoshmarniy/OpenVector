import { useEffect, useRef, useState } from 'react';
import { getFontGroups, subscribeFonts } from '../../state/fonts.js';
import styles from './FontPicker.module.css';

const GROUP_TITLES = { custom: 'Loaded', google: 'Google Fonts', system: 'System' };
const SAMPLE = 'Aa Bb Яя';

/**
 * Font family dropdown. Each entry is a card: family name in the UI font plus
 * a sample line rendered in that family. Hovering an entry live-previews it on
 * the selected text; closing without picking restores the original family.
 */
export default function FontPicker({ value, onChange, onManage }) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState(getFontGroups);
  const rootRef = useRef(null);
  // Family committed when the popover opened; restored on close-without-pick.
  const openedValueRef = useRef(value);
  // Latest applied family (committed or hover preview) — avoids no-op churn.
  const appliedRef = useRef(value);
  appliedRef.current = value;

  useEffect(() => subscribeFonts(() => setGroups(getFontGroups())), []);

  const openPopover = () => {
    openedValueRef.current = value;
    setOpen(true);
  };

  const revertPreview = () => {
    if (appliedRef.current !== openedValueRef.current) onChange(openedValueRef.current);
  };

  const closeWithoutPick = () => {
    revertPreview();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) closeWithoutPick();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') closeWithoutPick();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const preview = (family) => {
    if (appliedRef.current !== family) onChange(family);
  };

  const pick = (family) => {
    onChange(family);
    openedValueRef.current = family; // committed — nothing to revert
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={styles.button}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={value}
        style={{ fontFamily: value }}
        onClick={() => (open ? closeWithoutPick() : openPopover())}
      >
        <span className={styles.buttonLabel}>{value}</span>
        <span className={styles.chevron} aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className={styles.popover} role="listbox">
          <div className={styles.list} onMouseLeave={revertPreview}>
            {['custom', 'google', 'system'].map((key) => {
              const families = groups[key];
              if (!families.length) return null;
              return (
                <div key={key}>
                  <div className={styles.groupTitle}>{GROUP_TITLES[key]}</div>
                  {families.map((family) => (
                    <button
                      key={family}
                      type="button"
                      role="option"
                      aria-selected={family === openedValueRef.current}
                      className={
                        family === openedValueRef.current
                          ? `${styles.item} ${styles.itemActive}`
                          : styles.item
                      }
                      onMouseEnter={() => preview(family)}
                      onClick={() => pick(family)}
                    >
                      <span className={styles.itemName}>{family}</span>
                      <span className={styles.itemSample} style={{ fontFamily: family }}>
                        {SAMPLE}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          {onManage && (
            <button
              type="button"
              className={styles.manage}
              onClick={() => {
                closeWithoutPick();
                onManage();
              }}
            >
              Manage fonts…
            </button>
          )}
        </div>
      )}
    </div>
  );
}
