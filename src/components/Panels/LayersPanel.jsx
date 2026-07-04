import { useEffect, useState } from 'react';
import paper from 'paper';
import { artworkLayers, getOverlayLayer } from '../../canvas/operations/selection.js';
import { isTransientItem } from '../../canvas/operations/isolation.js';
import { subscribeDocument, bumpDocument } from '../../state/document.js';
import {
  subscribeSelection,
  setSelectedItems,
  toggleSelectedItem,
  pruneSelection,
} from '../../state/selection.js';
import styles from './LayersPanel.module.css';

// Human label for an unnamed item.
function labelOf(it) {
  if (it.data && it.data.isText) {
    const t = (it.data.rawText || '').trim().replace(/\s+/g, ' ');
    return t ? `Text “${t.slice(0, 12)}${t.length > 12 ? '…' : ''}”` : 'Text';
  }
  if (it.className === 'Group') return 'Group';
  if (it.className === 'CompoundPath') return 'Compound Path';
  if (it.data && it.data.live && it.data.live.kind === 'rect') return 'Rectangle';
  return it.className === 'Path' ? 'Path' : it.className;
}

const EyeIcon = ({ off }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1.5 8s2.4-4.2 6.5-4.2S14.5 8 14.5 8 12.1 12.2 8 12.2 1.5 8 1.5 8Z" />
    <circle cx="8" cy="8" r="2" />
    {off && <path d="M2.5 13.5 13.5 2.5" />}
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3.5" y="7" width="9" height="6.5" rx="1" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5 5 13.5h6l.5-9" />
  </svg>
);

// Can this item be selected on canvas (nothing hidden/locked up the chain)?
function selectable(it) {
  for (let c = it; c; c = c.parent) {
    if (!c.visible || c.locked) return false;
  }
  return true;
}

/**
 * Layers panel — mirrors the paper layer tree. Layers on top of the list are
 * on top of the canvas. Rows toggle visibility/lock, double-click renames,
 * click selects (Shift adds), drag moves items between layers / above items.
 */
export default function LayersPanel() {
  const [, setTick] = useState(0);
  const [selIds, setSelIds] = useState(() => new Set());
  const [openMap, setOpenMap] = useState({}); // id → bool (layers default open)
  const [editing, setEditing] = useState(null); // { id, value }
  const [dropKey, setDropKey] = useState(null);

  // Paper is set up by the canvas's mount effect (which runs first); re-read
  // once mounted, then follow document / selection changes.
  useEffect(() => {
    setTick((t) => t + 1);
    const offDoc = subscribeDocument(() => setTick((t) => t + 1));
    const offSel = subscribeSelection((items) => setSelIds(new Set(items.map((it) => it.id))));
    return () => {
      offDoc();
      offSel();
    };
  }, []);

  const ready = !!paper.project;
  const isOpen = (id, def) => openMap[id] ?? def;
  const toggleOpen = (id, def) => setOpenMap((m) => ({ ...m, [id]: !isOpen(id, def) }));

  const rows = [];
  if (ready) {
    const pushChildren = (parent, depth) => {
      parent.children.slice().reverse().forEach((it) => { // front-first
        if (isTransientItem(it) || (it.data && it.data.isSelectionOverlay)) return;
        const expandable =
          it.className === 'Group'
          && !(it.data && it.data.isText)
          && it.children.some((c) => !isTransientItem(c));
        rows.push({
          kind: 'item',
          key: `i${it.id}`,
          item: it,
          id: it.id,
          depth,
          expandable,
          open: isOpen(it.id, false),
          label: it.name || labelOf(it),
          visible: it.visible,
          locked: it.locked,
          selected: selIds.has(it.id),
          fill: it.fillColor ? it.fillColor.toCSS(true) : null,
          stroke: it.strokeColor ? it.strokeColor.toCSS(true) : null,
        });
        if (expandable && isOpen(it.id, false)) pushChildren(it, depth + 1);
      });
    };
    artworkLayers().slice().reverse().forEach((layer) => { // topmost first
      rows.push({
        kind: 'layer',
        key: `l${layer.id}`,
        layer,
        id: layer.id,
        label: layer.name || 'Layer',
        open: isOpen(layer.id, true),
        active: layer === paper.project.activeLayer,
        visible: layer.visible,
        locked: layer.locked,
      });
      if (isOpen(layer.id, true)) pushChildren(layer, 1);
    });
  }

  const refOf = (row) => (row.kind === 'layer' ? row.layer : row.item);

  const commitChange = () => {
    pruneSelection();
    paper.view.update();
    bumpDocument();
  };

  const toggleVisible = (row) => {
    const ref = refOf(row);
    ref.visible = !ref.visible;
    commitChange();
  };

  const toggleLocked = (row) => {
    const ref = refOf(row);
    ref.locked = !ref.locked;
    commitChange();
  };

  const onRowClick = (row, e) => {
    if (editing) return;
    if (row.kind === 'layer') {
      row.layer.activate();
      bumpDocument();
      return;
    }
    if (!selectable(row.item)) return;
    if (e.shiftKey) toggleSelectedItem(row.item);
    else setSelectedItems([row.item]);
  };

  const startRename = (row) => setEditing({ id: row.id, value: refOf(row).name || '' });

  const commitRename = (row) => {
    if (!editing) return;
    const v = editing.value.trim();
    refOf(row).name = v || null;
    setEditing(null);
    bumpDocument();
  };

  const addLayer = () => {
    const names = artworkLayers().map((l) => l.name || '');
    let n = 1;
    while (names.includes(`Layer ${n}`)) n += 1;
    const layer = new paper.Layer(); // appended on top and auto-activated
    layer.name = `Layer ${n}`;
    getOverlayLayer(); // keep the overlay layer above the new one
    bumpDocument();
  };

  const deleteActiveLayer = () => {
    const layers = artworkLayers();
    if (layers.length <= 1) return;
    const layer = paper.project.activeLayer;
    if (!layer || layer.data.isOverlayLayer) return;
    if (layer.children.some((it) => !isTransientItem(it))
      && !window.confirm(`Delete “${layer.name || 'Layer'}” and its contents?`)) {
      return;
    }
    layer.remove();
    const rest = artworkLayers();
    rest[rest.length - 1].activate(); // topmost remaining
    commitChange();
  };

  // --- Drag & drop: move an item into a layer (on top) or above an item ---
  const onDragStart = (row, e) => {
    e.dataTransfer.setData('text/plain', String(row.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (row, e) => {
    if (e.dataTransfer.types.includes('text/plain')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropKey(row.key);
    }
  };

  const onDrop = (row, e) => {
    e.preventDefault();
    setDropKey(null);
    const id = Number(e.dataTransfer.getData('text/plain'));
    const item = paper.project.getItem({ match: (it) => it.id === id });
    if (!item) return;
    const target = refOf(row);
    for (let c = target; c; c = c.parent) {
      if (c === item) return; // never drop into itself / its own subtree
    }
    if (row.kind === 'layer') row.layer.addChild(item); // top of that layer
    else if (target !== item) item.insertAbove(target);
    commitChange();
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Layers</span>
        <button type="button" className={styles.headBtn} title="New layer" onClick={addLayer}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 3v10M3 8h10" />
          </svg>
        </button>
        <button type="button" className={styles.headBtn} title="Delete active layer" onClick={deleteActiveLayer}>
          <TrashIcon />
        </button>
      </div>
      <div className={styles.list} onDragLeave={() => setDropKey(null)}>
        {rows.map((row) => {
          const isLayer = row.kind === 'layer';
          const classes = [isLayer ? styles.layerRow : styles.itemRow];
          if (isLayer && row.active) classes.push(styles.activeLayer);
          if (!isLayer && row.selected) classes.push(styles.selectedRow);
          if (dropKey === row.key) classes.push(styles.dropTarget);
          return (
            <div
              key={row.key}
              className={classes.join(' ')}
              style={isLayer ? undefined : { paddingLeft: 4 + row.depth * 12 }}
              onClick={(e) => onRowClick(row, e)}
              draggable={!isLayer}
              onDragStart={(e) => !isLayer && onDragStart(row, e)}
              onDragOver={(e) => onDragOver(row, e)}
              onDrop={(e) => onDrop(row, e)}
            >
              <button
                type="button"
                className={row.visible ? styles.flagBtn : `${styles.flagBtn} ${styles.flagOff}`}
                title={row.visible ? 'Hide' : 'Show'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisible(row);
                }}
              >
                <EyeIcon off={!row.visible} />
              </button>
              <button
                type="button"
                className={row.locked ? `${styles.flagBtn} ${styles.flagOn}` : `${styles.flagBtn} ${styles.flagDim}`}
                title={row.locked ? 'Unlock' : 'Lock'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLocked(row);
                }}
              >
                <LockIcon />
              </button>
              {(isLayer || row.expandable) ? (
                <button
                  type="button"
                  className={styles.disclose}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOpen(row.id, isLayer);
                  }}
                >
                  {row.open ? '▾' : '▸'}
                </button>
              ) : (
                <span className={styles.disclose} />
              )}
              {!isLayer && (
                <span
                  className={styles.swatch}
                  style={{
                    background: row.fill || 'transparent',
                    borderColor: row.stroke || 'var(--ov-panel-border)',
                  }}
                />
              )}
              {editing && editing.id === row.id ? (
                <input
                  className={styles.renameInput}
                  value={editing.value}
                  autoFocus
                  onChange={(e) => setEditing({ id: row.id, value: e.target.value })}
                  onBlur={() => commitRename(row)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(row);
                    if (e.key === 'Escape') setEditing(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className={isLayer ? styles.layerName : styles.itemName}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startRename(row);
                  }}
                >
                  {row.label}
                </span>
              )}
            </div>
          );
        })}
        {ready && rows.length === 0 && <p className={styles.empty}>No layers</p>}
      </div>
    </div>
  );
}
