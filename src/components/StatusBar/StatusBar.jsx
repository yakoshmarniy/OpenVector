import styles from './StatusBar.module.css';

// Bottom status strip: zoom, units and a short selection summary.
export default function StatusBar({ zoom, sel }) {
  const zoomPct = Math.round((zoom ?? 1) * 100);
  let info = 'Ready';
  if (sel?.count === 1) info = sel.isGroup ? 'Group selected' : sel.style?.isText ? 'Text selected' : '1 object selected';
  else if (sel?.count > 1) info = `${sel.count} objects selected`;

  return (
    <div className={styles.bar}>
      <span className={styles.zoom}>{zoomPct}%</span>
      <span className={styles.sep}>·</span>
      <span>px</span>
      <span className={styles.spacer} />
      <span className={styles.info}>{info}</span>
    </div>
  );
}
