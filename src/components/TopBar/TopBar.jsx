import styles from './TopBar.module.css';

// Slim header with the brand and document-level toggles (snapping). Tools live
// in the left rail; the top bar doesn't duplicate them.
export default function TopBar({ snap, onToggleSnap }) {
  const toggles = [
    { id: 'grid', label: 'Snap grid' },
    { id: 'objects', label: 'Snap objects' },
  ];
  return (
    <div className={styles.bar}>
      <span className={styles.brand}>OpenVector</span>
      <div className={styles.toggles}>
        {toggles.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={!!snap?.[t.id]}
            className={snap?.[t.id] ? `${styles.toggle} ${styles.on}` : styles.toggle}
            onClick={() => onToggleSnap(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
