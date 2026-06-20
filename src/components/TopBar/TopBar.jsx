import styles from './TopBar.module.css';

// Slim header. Tools live in the left rail (grouped flyouts) — the top bar no
// longer duplicates them. Top-level actions (File/Edit/export) will land here.
export default function TopBar() {
  return (
    <div className={styles.bar}>
      <span className={styles.brand}>OpenVector</span>
    </div>
  );
}
