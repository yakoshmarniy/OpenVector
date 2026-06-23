import { useEffect, useRef, useState } from 'react';
import styles from './MenuBar.module.css';

// Top menu bar. Items map to app commands (onCommand). Features that belong to
// later phases are shown disabled so the structure is honest. Labels are plain
// text for now; they move to i18next t() when i18n lands.
function buildMenus({ sel, snap, columns }) {
  const has = sel.count >= 1;
  const multi = sel.count >= 2;
  const group = sel.count === 1 && sel.isGroup;
  const sep = { separator: true };

  return [
    {
      title: 'File',
      items: [
        { label: 'New', cmd: 'fileNew', accel: '⌘N' },
        { label: 'Open…', enabled: false },
        { label: 'Save', enabled: false },
        { label: 'Export…', enabled: false },
      ],
    },
    {
      title: 'Edit',
      items: [
        { label: 'Undo', enabled: false, accel: '⌘Z' },
        { label: 'Redo', enabled: false, accel: '⌘⇧Z' },
        sep,
        { label: 'Cut', enabled: false, accel: '⌘X' },
        { label: 'Copy', enabled: false, accel: '⌘C' },
        { label: 'Paste', enabled: false, accel: '⌘V' },
        sep,
        { label: 'Duplicate', cmd: 'duplicate', enabled: has, accel: '⌘D' },
        { label: 'Delete', cmd: 'delete', enabled: has, accel: '⌫' },
        sep,
        { label: 'Select All', cmd: 'selectAll', accel: '⌘A' },
        { label: 'Deselect', cmd: 'deselect', enabled: has, accel: '⌘⇧A' },
      ],
    },
    {
      title: 'Object',
      items: [
        { label: 'Group', cmd: 'group', enabled: multi, accel: '⌘G' },
        { label: 'Ungroup', cmd: 'ungroup', enabled: group, accel: '⌘⇧G' },
        sep,
        { label: 'Bring to Front', cmd: 'arrangeFront', enabled: has, accel: '⌘⇧]' },
        { label: 'Bring Forward', cmd: 'arrangeForward', enabled: has, accel: '⌘]' },
        { label: 'Send Backward', cmd: 'arrangeBackward', enabled: has, accel: '⌘[' },
        { label: 'Send to Back', cmd: 'arrangeBack', enabled: has, accel: '⌘⇧[' },
        sep,
        { label: 'Unite', cmd: 'unite', enabled: multi },
        { label: 'Subtract', cmd: 'subtract', enabled: multi },
        { label: 'Intersect', cmd: 'intersect', enabled: multi },
        { label: 'Exclude', cmd: 'exclude', enabled: multi },
        sep,
        { label: 'Lock', enabled: false },
        { label: 'Hide', enabled: false },
      ],
    },
    {
      title: 'Type',
      items: [
        { label: 'Create Outlines', enabled: false, accel: '⌘⇧O' },
        { label: 'Find Font…', enabled: false },
        { label: 'Change Case', enabled: false },
      ],
    },
    {
      title: 'Select',
      items: [
        { label: 'All', cmd: 'selectAll', accel: '⌘A' },
        { label: 'Deselect', cmd: 'deselect', enabled: has },
        sep,
        { label: 'Inverse', enabled: false },
        { label: 'Same', enabled: false },
      ],
    },
    {
      title: 'Effect',
      items: [
        { label: 'Apply Last Effect', enabled: false },
        { label: 'Document Raster Effects Settings…', enabled: false },
      ],
    },
    {
      title: 'View',
      items: [
        { label: 'Zoom In', cmd: 'zoomIn', accel: '⌘+' },
        { label: 'Zoom Out', cmd: 'zoomOut', accel: '⌘−' },
        { label: 'Fit in Window', cmd: 'zoomFit', accel: '⌘0' },
        { label: 'Actual Size', cmd: 'zoomActual', accel: '⌘1' },
        sep,
        { label: 'Snap to Grid', cmd: 'snapGrid', checked: !!snap.grid },
        { label: 'Snap to Objects', cmd: 'snapObjects', checked: !!snap.objects },
        sep,
        { label: 'Outline', enabled: false, accel: '⌘Y' },
      ],
    },
    {
      title: 'Window',
      items: [
        { label: 'Two-Column Toolbar', cmd: 'toggleColumns', checked: columns === 2 },
        sep,
        { label: 'Properties', enabled: false },
        { label: 'Layers', enabled: false },
        { label: 'Color', enabled: false },
      ],
    },
  ];
}

export default function MenuBar({ sel, snap, columns, onCommand }) {
  const [open, setOpen] = useState(null);
  const barRef = useRef(null);
  const menus = buildMenus({ sel, snap, columns });

  useEffect(() => {
    if (open === null) return undefined;
    const onDoc = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setOpen(null);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (item) => {
    if (item.separator || item.enabled === false || !item.cmd) return;
    onCommand(item.cmd);
    setOpen(null);
  };

  return (
    <div ref={barRef} className={styles.bar} role="menubar">
      <span className={styles.brand}>OpenVector</span>
      {menus.map((menu, mi) => (
        <div key={menu.title} className={styles.menu}>
          <button
            type="button"
            className={open === mi ? `${styles.title} ${styles.titleOpen}` : styles.title}
            aria-haspopup="true"
            aria-expanded={open === mi}
            onClick={() => setOpen(open === mi ? null : mi)}
            onMouseEnter={() => open !== null && setOpen(mi)}
          >
            {menu.title}
          </button>
          {open === mi && (
            <div className={styles.dropdown} role="menu">
              {menu.items.map((item, ii) =>
                item.separator ? (
                  <div key={`sep-${ii}`} className={styles.sep} />
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    className={styles.item}
                    disabled={item.enabled === false || (!item.cmd && !item.checked)}
                    onClick={() => choose(item)}
                  >
                    <span className={styles.check}>{item.checked ? '✓' : ''}</span>
                    <span className={styles.itemLabel}>{item.label}</span>
                    {item.accel && <span className={styles.accel}>{item.accel}</span>}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
