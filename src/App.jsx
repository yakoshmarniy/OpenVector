import { useCallback, useEffect, useRef, useState } from 'react';
import MenuBar from './components/MenuBar/MenuBar.jsx';
import ControlBar from './components/ControlBar/ControlBar.jsx';
import Toolbar from './components/Toolbar/Toolbar.jsx';
import Canvas from './components/Canvas/Canvas.jsx';
import Properties from './components/Properties/Properties.jsx';
import LayersPanel from './components/Panels/LayersPanel.jsx';
import ColorPanel from './components/Panels/ColorPanel.jsx';
import SwatchesPanel from './components/Panels/SwatchesPanel.jsx';
import ColorGuidePanel from './components/Panels/ColorGuidePanel.jsx';
import ColorPickerDialog from './components/ColorPicker/ColorPickerDialog.jsx';
import RecolorDialog from './components/RecolorDialog/RecolorDialog.jsx';
import StatusBar from './components/StatusBar/StatusBar.jsx';
import FontsDialog from './components/FontsDialog/FontsDialog.jsx';
import FindFontDialog from './components/FindFontDialog/FindFontDialog.jsx';
import { TOOLS } from './canvas/tools/toolIds.js';
import { TOOL_ITEMS } from './components/toolItems.jsx';
import { readStyle, applyStyle } from './canvas/operations/itemStyle.js';
import { setShowHiddenChars } from './canvas/operations/textLayout.js';
import { changeCase, smartPunctuation, fitHeadline } from './canvas/operations/typography.js';
import { createOutlines } from './canvas/operations/outlines.js';
import {
  subscribeColors, getColorMode, setColorMode, getDefaultPaint, setDefaultPaint,
} from './state/colors.js';

const emptySel = { count: 0, isGroup: false, isCompound: false, style: null };
const TOOL_LABELS = Object.fromEntries(TOOL_ITEMS.map((i) => [i.id, i.label]));

export default function App() {
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [sel, setSel] = useState(emptySel);
  const [snap, setSnap] = useState({ grid: false, objects: false });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [columns, setColumns] = useState(1);
  const [paintFocus, setPaintFocus] = useState('fill'); // which paint X-shortcuts target
  const [fontsOpen, setFontsOpen] = useState(false);
  const [findFontOpen, setFindFontOpen] = useState(false);
  const [hiddenChars, setHiddenChars] = useState(false);
  const [layersOpen, setLayersOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);
  const [swatchesOpen, setSwatchesOpen] = useState(true);
  const [colorGuideOpen, setColorGuideOpen] = useState(false);
  const [recolorOpen, setRecolorOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // 'fill' | 'stroke'
  const [isoDepth, setIsoDepth] = useState(0); // isolation-mode nesting depth
  const selItemsRef = useRef([]);
  const refreshSelRef = useRef(null);
  const actionRef = useRef(null);
  const viewRef = useRef(null); // view-level commands (zoom/fit/new) into Canvas
  const pendingEditRef = useRef(null); // text item queued for editing (double-click)
  const paintRef = useRef(null); // X / Shift+X handlers, called from Canvas keydown
  const snapRef = useRef(snap);
  snapRef.current = snap;

  // Colour state (document mode, default paint) lives in a plain store —
  // re-render when it changes so the menu checkmarks and toolbar follow.
  const [, setColorsTick] = useState(0);
  useEffect(() => subscribeColors(() => setColorsTick((t) => t + 1)), []);

  const toggleSnap = useCallback((key) => {
    setSnap((s) => ({ ...s, [key]: !s[key] }));
  }, []);

  const handleSelectionChange = useCallback((arg) => {
    const items = Array.isArray(arg) ? arg : arg ? [arg] : [];
    selItemsRef.current = items;
    const single = items.length === 1 ? items[0] : null;
    const isGroup = !!(single && single.className === 'Group' && !(single.data && single.data.isText));
    const isCompound = !!(single && single.className === 'CompoundPath');
    setSel({ count: items.length, isGroup, isCompound, style: single ? readStyle(single) : null });
  }, []);

  const handleStyleChange = useCallback((patch) => {
    const items = selItemsRef.current;
    const item = items[0];
    if (!item) return;
    items.forEach((it) => applyStyle(it, patch));
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

  // Swap the selected item's fill and stroke colours (Shift+X).
  const swapFillStroke = useCallback(() => {
    const item = selItemsRef.current[0];
    if (!item) return;
    const s = readStyle(item);
    if (s.isText) return;
    applyStyle(item, {
      fillColor: s.hasStroke ? s.strokeColor : null,
      strokeColor: s.hasFill ? s.fillColor : null,
    });
    const fresh = readStyle(item);
    setSel((prev) => ({
      ...prev,
      style: {
        ...fresh,
        fillColor: fresh.hasFill ? fresh.fillColor : s.strokeColor,
        strokeColor: fresh.hasStroke ? fresh.strokeColor : s.fillColor,
      },
    }));
    refreshSelRef.current?.();
  }, []);

  const togglePaintFocus = useCallback(() => {
    setPaintFocus((f) => (f === 'fill' ? 'stroke' : 'fill'));
  }, []);

  // Expose the X-shortcut handlers to Canvas's global keydown handler.
  paintRef.current = { swap: swapFillStroke, toggleFocus: togglePaintFocus };

  // Type-menu commands rewrite the selected text group's data, then re-sync
  // the panel style and the selection overlay (text bounds change).
  const applyTextCommand = useCallback((fn) => {
    const items = selItemsRef.current.filter((it) => it?.data?.isText);
    if (!items.length) return;
    items.forEach(fn);
    setSel((prev) => ({ ...prev, style: readStyle(items[0]) }));
    refreshSelRef.current?.();
  }, []);

  // Menu commands: view/document-level handled here, selection commands routed
  // to the active tool (they apply when the Select tool holds the selection).
  const handleCommand = useCallback(
    (cmd) => {
      switch (cmd) {
        case 'caseUpper':
        case 'caseLower':
        case 'caseTitle':
        case 'caseSentence':
          applyTextCommand((g) => changeCase(g, cmd.slice(4).toLowerCase()));
          break;
        case 'smartPunct':
          applyTextCommand(smartPunctuation);
          break;
        case 'fitHeadline':
          applyTextCommand(fitHeadline);
          break;
        case 'createOutlines': {
          const items = selItemsRef.current.filter((it) => it?.data?.isText);
          if (!items.length) break;
          // Drop the selection first — the text groups are about to be removed.
          actionRef.current?.('deselect');
          Promise.all(items.map(createOutlines)).catch((err) => {
            window.alert(`Create Outlines failed: ${err.message}`);
          });
          break;
        }
        case 'movePrompt': {
          const v = window.prompt('Move — horizontal, vertical (px):', '10,10');
          if (v === null) break;
          const [dx, dy] = v.split(',').map((s) => Number(s.trim()));
          if (Number.isFinite(dx) && Number.isFinite(dy)) actionRef.current?.(`moveBy:${dx},${dy}`);
          break;
        }
        case 'rotatePrompt': {
          const v = window.prompt('Rotate — angle (degrees, CW):', '45');
          if (v === null) break;
          const a = Number(v);
          if (Number.isFinite(a) && a !== 0) actionRef.current?.(`rotateBy:${a}`);
          break;
        }
        case 'scalePrompt': {
          const v = window.prompt('Scale — uniform % or "width%, height%":', '150');
          if (v === null) break;
          const parts = v.split(',').map((s) => Number(s.trim()));
          const sx = parts[0] / 100;
          const sy = (parts.length > 1 ? parts[1] : parts[0]) / 100;
          if (sx > 0 && sy > 0) actionRef.current?.(`scaleBy:${sx},${sy}`);
          break;
        }
        case 'shearPrompt': {
          const v = window.prompt('Shear — angle (degrees):', '15');
          if (v === null) break;
          const a = Number(v);
          if (Number.isFinite(a) && a !== 0 && Math.abs(a) < 89) actionRef.current?.(`shearBy:${a}`);
          break;
        }
        case 'transformEachPrompt': {
          const v = window.prompt(
            'Transform Each — scaleX%, scaleY%, moveX, moveY, angle:',
            '100,100,0,0,0',
          );
          if (v === null) break;
          const [sx, sy, dx, dy, angle] = v.split(',').map((s) => Number(s.trim()));
          if (sx > 0 && sy > 0) {
            actionRef.current?.(`transformEach:${sx / 100},${sy / 100},${dx || 0},${dy || 0},${angle || 0}`);
          }
          break;
        }
        case 'offsetPath': {
          const v = window.prompt('Offset distance (px, negative = inset):', '10');
          if (v === null) break;
          const d = Number(v);
          if (Number.isFinite(d) && d !== 0) actionRef.current?.(`offsetPath:${d}`);
          break;
        }
        case 'splitGrid': {
          const v = window.prompt('Split into grid — rows, columns, gutter (px):', '3,3,10');
          if (v === null) break;
          const [rows, cols, gutter] = v.split(',').map((s) => Number(s.trim()));
          if (rows >= 1 && cols >= 1) {
            actionRef.current?.(`splitGrid:${Math.round(rows)},${Math.round(cols)},${gutter >= 0 ? gutter : 0}`);
          }
          break;
        }
        case 'toggleHiddenChars':
          setShowHiddenChars(!hiddenChars);
          setHiddenChars(!hiddenChars);
          refreshSelRef.current?.();
          break;
        case 'snapGrid':
          toggleSnap('grid');
          break;
        case 'snapObjects':
          toggleSnap('objects');
          break;
        case 'toggleColumns':
          setColumns((c) => (c === 2 ? 1 : 2));
          break;
        case 'toggleLayers':
          setLayersOpen((v) => !v);
          break;
        case 'toggleColor':
          setColorOpen((v) => !v);
          break;
        case 'toggleSwatches':
          setSwatchesOpen((v) => !v);
          break;
        case 'toggleColorGuide':
          setColorGuideOpen((v) => !v);
          break;
        case 'openRecolor':
          if (selItemsRef.current.length) setRecolorOpen(true);
          break;
        case 'colorModeRGB':
          setColorMode('rgb');
          break;
        case 'colorModeCMYK':
          setColorMode('cmyk');
          break;
        case 'openFonts':
          setFontsOpen(true);
          break;
        case 'openFindFont':
          setFindFontOpen(true);
          break;
        case 'zoomIn':
        case 'zoomOut':
        case 'zoomFit':
        case 'zoomActual':
        case 'rotateViewCW':
        case 'rotateViewCCW':
        case 'rotateViewReset':
        case 'isolate':
        case 'exitIsolation':
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
    [toggleSnap, applyTextCommand, hiddenChars],
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
      : getDefaultPaint();

  // Picker (double-click on the toolbar paint proxy): recolour the selection,
  // or — with nothing selected — the default paint for new shapes.
  const applyPickedColor = useCallback(
    (which, hex) => {
      if (selItemsRef.current.length) handleStyleChange({ [`${which}Color`]: hex });
      else setDefaultPaint({ [which]: hex });
    },
    [handleStyleChange],
  );

  return (
    <div className="app">
      <MenuBar
        sel={sel}
        snap={snap}
        columns={columns}
        hiddenChars={hiddenChars}
        layersOpen={layersOpen}
        isoDepth={isoDepth}
        colorMode={getColorMode()}
        colorOpen={colorOpen}
        swatchesOpen={swatchesOpen}
        colorGuideOpen={colorGuideOpen}
        onCommand={handleCommand}
      />
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
          paintFocus={paintFocus}
          onSetPaintFocus={setPaintFocus}
          onSwapPaint={swapFillStroke}
          onOpenPicker={setPickerTarget}
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
          paintRef={paintRef}
          snapRef={snapRef}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onIsolationChange={setIsoDepth}
        />
        <div className="side-col">
          <Properties
            sel={sel}
            onChange={handleStyleChange}
            onAction={handleAction}
            onManageFonts={() => setFontsOpen(true)}
            activeTool={activeTool}
          />
          {colorOpen && <ColorPanel paintFocus={paintFocus} onSetPaintFocus={setPaintFocus} />}
          {swatchesOpen && <SwatchesPanel paintFocus={paintFocus} />}
          {colorGuideOpen && (
            <ColorGuidePanel
              paintFocus={paintFocus}
              onOpenRecolor={() => selItemsRef.current.length && setRecolorOpen(true)}
            />
          )}
          {layersOpen && <LayersPanel />}
        </div>
      </div>
      <StatusBar zoom={zoom} rotation={rotation} sel={sel} />
      {fontsOpen && <FontsDialog onClose={() => setFontsOpen(false)} />}
      {recolorOpen && <RecolorDialog onClose={() => setRecolorOpen(false)} />}
      {pickerTarget && (
        <ColorPickerDialog
          title={pickerTarget === 'fill' ? 'Fill Color' : 'Stroke Color'}
          initial={paint[pickerTarget] || (pickerTarget === 'fill' ? '#b9bcc0' : '#7d8186')}
          onApply={(hex) => {
            applyPickedColor(pickerTarget, hex);
            setPickerTarget(null);
          }}
          onClose={() => setPickerTarget(null)}
        />
      )}
      {findFontOpen && (
        <FindFontDialog
          onClose={() => setFindFontOpen(false)}
          onReplaced={() => {
            // Selected text may have been restyled — re-sync panel + overlay.
            const item = selItemsRef.current[0];
            if (item?.data?.isText) setSel((prev) => ({ ...prev, style: readStyle(item) }));
            refreshSelRef.current?.();
          }}
        />
      )}
    </div>
  );
}
