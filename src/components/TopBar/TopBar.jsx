import { TOOL_ITEMS } from '../toolItems.jsx';
import styles from './TopBar.module.css';

// Labelled tool boxes across the top — easier to recognise and pick than the
// icon-only left rail. Both reflect the same active tool.
export default function TopBar({ activeTool, onSelectTool }) {
  return (
    <div className={styles.bar} role="toolbar" aria-label="Tools (top)">
      <span className={styles.brand}>OpenVector</span>
      <div className={styles.group}>
        {TOOL_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={activeTool === id}
            className={activeTool === id ? `${styles.box} ${styles.active}` : styles.box}
            onClick={() => onSelectTool(id)}
          >
            <Icon />
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
