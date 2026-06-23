import { useCallback, useRef, useState } from 'react';
import MenuBar from './components/MenuBar/MenuBar.jsx';
import ControlBar from './components/ControlBar/ControlBar.jsx';
import Toolbar from './components/Toolbar/Toolbar.jsx';
import Canvas from './components/Canvas/Canvas.jsx';
import Properties from './components/Properties/Properties.jsx';
import StatusBar from './components/StatusBar/StatusBar.jsx';
import { TOOLS } from './canvas/tools/toolIds.js';
import { TOOL_ITEMS } from './components/toolItems.jsx';
import { readStyle, applyStyle } from './canvas/operations/itemStyle.js';

const emptySel = { count: 0, isGroup: false, style: null };
const TOOL_LABELS = Object.fromEntries(TOOL_ITEMS.map((i) => [i.id, i.label]));

export default function App() {
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [sel, setSel] = useState(emptySel);
  const [snap, setSnap] = useState({ grid: false, objects: false });
  const [zoom, setZoom] = useState(1);
  const [columns, setColumns] = useState(1);
  const selItemsRef = useRef([]);
  const refreshSelRef = useRef(null);
  const actionRef = useRef(null);
  const viewRef = useRef(null); // view-level commands (zoom/fit/new) into Canvas
  const pendingEditRef = useRef(null); // text item queued for editing (double-click)
  const snapRef = useRef(snap);
  snapRef.current = snap;

  const toggleSnap = useCallback((key) => {
    setSnap((s) => ({ ...s, [key]: !s[key] }));
  }, []);

  const handleSelectionChange = useCallback((arg) => {
    const items = Array.isArray(arg) ? arg : arg ? [arg] : [];
    selItemsRef.current = items;
    const single = items.length === 1 ? items[0] : null;
    const isGroup = !!(single && single.className === 'Group' && !(single.data && single.data.isText));
    setSel({ count: items.length, isGroup, style: single ? readStyle(single) : null });
  }, []);

  const handleStyleChange = useCallback((patch) => {
    const item = selItemsRef.current[0];
    if (!item) return;
    applyStyle(item, patch);
    const fresh = readStyle(item);
    setSel((prev) => ({
      ...prev,
      style: {
        ...fresh,
        fillColor: fresh.hasFill ? fresh.fillColor : patch.fillColor ?? prev.style?.fillColor ?? fresh.fillColor,
        strokeColor: fresh.hasStroke ? fresh.strokeColor : patch.strokeColor ?? prev.style?.strokeColor ?? fresh.strokeColor,
      },
    }));
    refreshSelRef.current?.();
  }, []);

  const handleAction = useCallback((name) => {
    actionRef.current?.(name);
  }, []);

  // Menu commands: view/document-level handled here, selection commands routed
  // to the active tool (they apply when the Select tool holds the selection).
  const handleCommand = useCallback(
    (cmd) => {
      switch (cmd) {
        case 'snapGrid':
          toggleSnap('grid');
          break;
        case 'snapObjects':
          toggleSnap('objects');
          break;
        case 'toggleColumns':
          setColumns((c) => (c === 2 ? 1 : 2));
          break;
        case 'zoomIn':
        case 'zoomOut':
        case 'zoomFit':
        case 'zoomActual':
          viewRef.current?.(cmd);
          break;
        case 'fileNew':
          if (window.confirm('Start a new document? This clears the canvas.')) {
            viewRef.current?.('clear');
          }
          break;
        default:
          actionRef.current?.(cmd);
      }
    },
    [toggleSnap],
  );

  const handleEditText = useCallback(
    (item) => {
      if (activeTool === TOOLS.TEXT) return;
      pendingEditRef.current = item;
      setActiveTool(TOOLS.TEXT);
    },
    [activeTool],
  );

  const paint =
    sel.count === 1 && sel.style
      ? {
          fill: sel.style.hasFill ? sel.style.fillColor : null,
          stroke: sel.style.hasStroke ? sel.style.strokeColor : null,
        }
      : { fill: '#b9bcc0', stroke: '#7d8186' };

  return (
    <div className="app">
      <MenuBar sel={sel} snap={snap} columns={columns} onCommand={handleCommand} />
      <ControlBar
        toolLabel={TOOL_LABELS[activeTool] || 'Tool'}
        sel={sel}
        onChange={handleStyleChange}
        onAction={handleAction}
      />
      <div className="app-body">
        <Toolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          paint={paint}
          columns={columns}
          onToggleColumns={() => setColumns((c) => (c === 2 ? 1 : 2))}
        />
        <Canvas
          activeTool={activeTool}
          onSelectionChange={handleSelectionChange}
          onEditText={handleEditText}
          pendingEditRef={pendingEditRef}
          refreshRef={refreshSelRef}
          actionRef={actionRef}
          viewRef={viewRef}
          snapRef={snapRef}
          onZoomChange={setZoom}
        />
        <Properties sel={sel} onChange={handleStyleChange} onAction={handleAction} />
      </div>
      <StatusBar zoom={zoom} sel={sel} />
    </div>
  );
}
