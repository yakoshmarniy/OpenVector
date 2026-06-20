import { TOOL_ITEMS } from '../toolItems.jsx';
import styles from './Toolbar.module.css';

export default function Toolbar({ activeTool, onSelectTool }) {
  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Tools">
      {TOOL_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={activeTool === id}
          className={activeTool === id ? `${styles.tool} ${styles.active}` : styles.tool}
          onClick={() => onSelectTool(id)}
        >
          <Icon />
        </button>
      ))}
    </div>
  );
}
