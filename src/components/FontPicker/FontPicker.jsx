import { useEffect, useRef, useState } from 'react';
import { getFontGroups, subscribeFonts } from '../../state/fonts.js';
import styles from './FontPicker.module.css';

const GROUP_TITLES = { custom: 'Loaded', google: 'Google Fonts', system: 'System' };

/**
 * Font family dropdown: the button and every list entry render in their own
 * family (a native <select> can't style options). Footer opens the manager.
 */
export default function FontPicker({ value, onChange, onManage }) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState(getFontGroups);
  const rootRef = useRef(null);

  useEffect(() => subscribeFonts(() => setGroups(getFontGroups())), []);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (family) => {
    onChange(family);
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
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.buttonLabel}>{value}</span>
        <span className={styles.chevron} aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className={styles.popover} role="listbox">
          <div className={styles.list}>
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
                      aria-selected={family === value}
                      className={family === value ? `${styles.item} ${styles.itemActive}` : styles.item}
                      style={{ fontFamily: family }}
                      onClick={() => pick(family)}
                    >
                      {family}
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
                setOpen(false);
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
