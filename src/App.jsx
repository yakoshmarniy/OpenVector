import { useCallback, useRef, useState } from 'react';
import TopBar from './components/TopBar/TopBar.jsx';
import Toolbar from './components/Toolbar/Toolbar.jsx';
import Canvas from './components/Canvas/Canvas.jsx';
import Properties from './components/Properties/Properties.jsx';
import { TOOLS } from './canvas/tools/toolIds.js';
import { readStyle, applyStyle } from './canvas/operations/itemStyle.js';

export default function App() {
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [selStyle, setSelStyle] = useState(null);
  const selItemRef = useRef(null);
  const refreshSelRef = useRef(null);
  const pendingEditRef = useRef(null); // text item queued for editing (double-click)

  const handleSelectionChange = useCallback((item) => {
    selItemRef.current = item || null;
    setSelStyle(item ? readStyle(item) : null);
  }, []);

  const handleStyleChange = useCallback((patch) => {
    const item = selItemRef.current;
    if (!item) return;
    applyStyle(item, patch);
    const fresh = readStyle(item);
    // Keep the chosen swatch colour visible even when fill/stroke is toggled off.
    setSelStyle((prev) => ({
      ...fresh,
      fillColor: fresh.hasFill ? fresh.fillColor : patch.fillColor ?? prev?.fillColor ?? fresh.fillColor,
      strokeColor: fresh.hasStroke ? fresh.strokeColor : patch.strokeColor ?? prev?.strokeColor ?? fresh.strokeColor,
    }));
    // The change may have altered the item's bounds — refresh selection handles.
    refreshSelRef.current?.();
  }, []);

  // Double-clicking a text item enters edit mode: queue it and switch to Text.
  const handleEditText = useCallback(
    (item) => {
      if (activeTool === TOOLS.TEXT) return; // text tool already edits on click
      pendingEditRef.current = item;
      setActiveTool(TOOLS.TEXT);
    },
    [activeTool],
  );

  return (
    <div className="app">
      <TopBar activeTool={activeTool} onSelectTool={setActiveTool} />
      <div className="app-body">
        <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />
        <Canvas
          activeTool={activeTool}
          onSelectionChange={handleSelectionChange}
          onEditText={handleEditText}
          pendingEditRef={pendingEditRef}
          refreshRef={refreshSelRef}
        />
        <Properties style={selStyle} onChange={handleStyleChange} />
      </div>
    </div>
  );
}
