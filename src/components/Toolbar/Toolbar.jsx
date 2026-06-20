import { useEffect, useRef, useState } from 'react';
import { TOOLS } from '../../canvas/tools/toolIds.js';
import { TOOL_ITEMS } from '../toolItems.jsx';
import styles from './Toolbar.module.css';

const BY_ID = Object.fromEntries(TOOL_ITEMS.map((i) => [i.id, i]));

// Related tools share a slot and expand in a flyout (like Illustrator).
const GROUPS = [
  [TOOLS.SELECT],
  [TOOLS.PEN],
  [TOOLS.TEXT],
  [TOOLS.RECTANGLE, TOOLS.ELLIPSE, TOOLS.LINE], // primitive shapes
];

export default function Toolbar({ activeTool, onSelectTool }) {
  // Representative tool shown for each multi-tool group (the last one used).
  const [current, setCurrent] = useState({});
  const [openGroup, setOpenGroup] = useState(null);
  const railRef = useRef(null);

  // Keep a group's representative in sync with the active tool.
  useEffect(() => {
    GROUPS.forEach((tools, gi) => {
      if (tools.length > 1 && tools.includes(activeTool)) {
        setCurrent((c) => (c[gi] === activeTool ? c : { ...c, [gi]: activeTool }));
      }
    });
  }, [activeTool]);

  // Close the flyout on outside click or Escape.
  useEffect(() => {
    if (openGroup === null) return undefined;
    const onDoc = (e) => {
      if (railRef.current && !railRef.current.contains(e.target)) setOpenGroup(null);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenGroup(null);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [openGroup]);

  const repFor = (tools, gi) =>
    current[gi] && tools.includes(current[gi]) ? current[gi] : tools[0];

  const pick = (gi, toolId) => {
    setCurrent((c) => ({ ...c, [gi]: toolId }));
    onSelectTool(toolId);
    setOpenGroup(null);
  };

  return (
    <div ref={railRef} className={styles.toolbar} role="toolbar" aria-label="Tools">
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
              <div className={styles.flyout} role="menu" aria-label="Shape tools">
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
                      className={
                        activeTool === tid ? `${styles.flyItem} ${styles.flyActive}` : styles.flyItem
                      }
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
  );
}
