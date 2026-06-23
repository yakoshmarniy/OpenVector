import styles from './StatusBar.module.css';

// Bottom status strip: zoom, view rotation, units and a selection summary.
export default function StatusBar({ zoom, rotation, sel }) {
  const zoomPct = Math.round((zoom ?? 1) * 100);
  // Normalize rotation to (-180, 180] for a tidy readout.
  const rot = ((((rotation ?? 0) % 360) + 540) % 360) - 180;
  const rotDeg = Math.round(rot);
  let info = 'Ready';
  if (sel?.count === 1) info = sel.isGroup ? 'Group selected' : sel.style?.isText ? 'Text selected' : '1 object selected';
  else if (sel?.count > 1) info = `${sel.count} objects selected`;

  return (
    <div className={styles.bar}>
      <span className={styles.zoom}>{zoomPct}%</span>
      <span className={styles.sep}>·</span>
      <span>px</span>
      {rotDeg !== 0 && (
        <>
          <span className={styles.sep}>·</span>
          <span>{rotDeg}°</span>
        </>
      )}
      <span className={styles.spacer} />
      <span className={styles.info}>{info}</span>
    </div>
  );
}
