import { useEffect, useRef, useState } from 'react';
import { TOOLS } from '../../canvas/tools/toolIds.js';
import { TOOL_ITEMS } from '../toolItems.jsx';
import styles from './Toolbar.module.css';

const BY_ID = Object.fromEntries(TOOL_ITEMS.map((i) => [i.id, i]));

// Related tools share a slot and expand in a flyout (like Illustrator).
const GROUPS = [
  [TOOLS.SELECT, TOOLS.DIRECT_SELECT, TOOLS.GROUP_SELECT],
  [TOOLS.MAGIC_WAND],
  [TOOLS.LASSO],
  [TOOLS.PEN, TOOLS.ADD_ANCHOR, TOOLS.DELETE_ANCHOR, TOOLS.CONVERT_ANCHOR, TOOLS.CURVATURE],
  [TOOLS.PENCIL, TOOLS.SHAPER, TOOLS.SMOOTH, TOOLS.PATH_ERASER, TOOLS.JOIN],
  [TOOLS.PAINTBRUSH, TOOLS.BLOB_BRUSH],
  [TOOLS.TEXT, TOOLS.VERTICAL_TEXT, TOOLS.TOUCH_TYPE],
  [TOOLS.RECTANGLE, TOOLS.ROUNDED_RECTANGLE, TOOLS.ELLIPSE, TOOLS.POLYGON, TOOLS.STAR, TOOLS.FLARE],
  [TOOLS.LINE, TOOLS.ARC, TOOLS.SPIRAL, TOOLS.RECTANGULAR_GRID, TOOLS.POLAR_GRID],
  [TOOLS.ERASER, TOOLS.SCISSORS, TOOLS.KNIFE],
  [TOOLS.HAND, TOOLS.ROTATE_VIEW, TOOLS.ZOOM],
];

export default function Toolbar({ activeTool, onSelectTool, paint, columns, onToggleColumns }) {
  const [current, setCurrent] = useState({});
  const [openGroup, setOpenGroup] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const railRef = useRef(null);

  useEffect(() => {
    GROUPS.forEach((tools, gi) => {
      if (tools.length > 1 && tools.includes(activeTool)) {
        setCurrent((c) => (c[gi] === activeTool ? c : { ...c, [gi]: activeTool }));
      }
    });
  }, [activeTool]);

  useEffect(() => {
    if (openGroup === null && !drawerOpen) return undefined;
    const close = () => {
      setOpenGroup(null);
      setDrawerOpen(false);
    };
    const onDoc = (e) => {
      if (railRef.current && !railRef.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [openGroup, drawerOpen]);

  const repFor = (tools, gi) => (current[gi] && tools.includes(current[gi]) ? current[gi] : tools[0]);

  const pick = (gi, toolId) => {
    setCurrent((c) => ({ ...c, [gi]: toolId }));
    onSelectTool(toolId);
    setOpenGroup(null);
  };

  const pickFromDrawer = (toolId) => {
    onSelectTool(toolId);
    setDrawerOpen(false);
  };

  return (
    <div
      ref={railRef}
      className={columns === 2 ? `${styles.toolbar} ${styles.two}` : styles.toolbar}
      role="toolbar"
      aria-label="Tools"
    >
      <div className={styles.slots}>
        {GROUPS.map((tools, gi) => {
          const rep = BY_ID[repFor(tools, gi)];
          const RepIcon = rep.Icon;
          const groupActive = tools.includes(activeTool);
          const multi = tools.length > 1;
          return (
            <div key={gi} className={styles.slot}>
              <button
                type="button"
                title={rep.label}
                aria-label={rep.label}
                aria-pressed={groupActive}
                className={groupActive ? `${styles.tool} ${styles.active}` : styles.tool}
                onClick={() => onSelectTool(rep.id)}
              >
                <RepIcon />
              </button>
              {multi && (
                <button
                  type="button"
                  aria-label={`More tools: ${tools.map((t) => BY_ID[t].label).join(', ')}`}
                  aria-expanded={openGroup === gi}
                  className={styles.flyoutToggle}
                  onClick={() => setOpenGroup(openGroup === gi ? null : gi)}
                >
                  <span className={styles.tri} />
                </button>
              )}
              {multi && openGroup === gi && (
                <div className={styles.flyout} role="menu">
                  {tools.map((tid) => {
                    const it = BY_ID[tid];
                    const ItIcon = it.Icon;
                    return (
                      <button
                        key={tid}
                        type="button"
                        role="menuitem"
                        aria-label={it.label}
                        aria-pressed={activeTool === tid}
                        className={activeTool === tid ? `${styles.flyItem} ${styles.flyActive}` : styles.flyItem}
                        onClick={() => pick(gi, tid)}
                      >
                        <ItIcon />
                        <span className={styles.flyLabel}>{it.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.paint} title="Fill / Stroke">
          <span className={styles.stroke} style={{ borderColor: paint?.stroke || 'var(--ov-text-dim)' }} />
          <span className={styles.fill} style={{ background: paint?.fill || 'transparent' }} />
        </div>
        <button
          type="button"
          className={styles.colToggle}
          title="All tools"
          aria-label="All tools"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((o) => !o)}
        >
          ⋯
        </button>
        <button
          type="button"
          className={styles.colToggle}
          title="Toggle one/two columns"
          onClick={onToggleColumns}
        >
          {columns === 2 ? '1' : '2'}
        </button>
      </div>

      {drawerOpen && (
        <div className={styles.drawer} role="menu" aria-label="All tools">
          <div className={styles.drawerTitle}>All Tools</div>
          <div className={styles.drawerGrid}>
            {TOOL_ITEMS.map((it) => {
              const ItIcon = it.Icon;
              return (
                <button
                  key={it.id}
                  type="button"
                  role="menuitem"
                  aria-label={it.label}
                  aria-pressed={activeTool === it.id}
                  className={activeTool === it.id ? `${styles.drawerItem} ${styles.flyActive}` : styles.drawerItem}
                  onClick={() => pickFromDrawer(it.id)}
                >
                  <ItIcon />
                  <span className={styles.drawerLabel}>{it.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
