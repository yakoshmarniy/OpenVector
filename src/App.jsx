import { useCallback, useRef, useState } from 'react';
import TopBar from './components/TopBar/TopBar.jsx';
import Toolbar from './components/Toolbar/Toolbar.jsx';
import Canvas from './components/Canvas/Canvas.jsx';
import Properties from './components/Properties/Properties.jsx';
import StatusBar from './components/StatusBar/StatusBar.jsx';
import { TOOLS } from './canvas/tools/toolIds.js';
import { readStyle, applyStyle } from './canvas/operations/itemStyle.js';

const emptySel = { count: 0, isGroup: false, style: null };

export default function App() {
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [sel, setSel] = useState(emptySel);
  const [snap, setSnap] = useState({ grid: false, objects: false });
  const [zoom, setZoom] = useState(1);
  const selItemsRef = useRef([]);
  const refreshSelRef = useRef(null);
  const actionRef = useRef(null);
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

  const handleEditText = useCallback(
    (item) => {
      if (activeTool === TOOLS.TEXT) return;
      pendingEditRef.current = item;
      setActiveTool(TOOLS.TEXT);
    },
    [activeTool],
  );

  return (
    <div className="app">
      <TopBar snap={snap} onToggleSnap={toggleSnap} />
      <div className="app-body">
        <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />
        <Canvas
          activeTool={activeTool}
          onSelectionChange={handleSelectionChange}
          onEditText={handleEditText}
          pendingEditRef={pendingEditRef}
          refreshRef={refreshSelRef}
          actionRef={actionRef}
          snapRef={snapRef}
          onZoomChange={setZoom}
        />
        <Properties sel={sel} onChange={handleStyleChange} onAction={handleAction} />
      </div>
      <StatusBar zoom={zoom} sel={sel} />
    </div>
  );
}
