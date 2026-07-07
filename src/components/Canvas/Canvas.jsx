import { useEffect, useRef, useState } from 'react';
import paper from 'paper';
import { TOOLS } from '../../canvas/tools/toolIds.js';
import {
  pickItem,
  isOverlayItem,
  createSelection,
  artworkLayers,
} from '../../canvas/operations/selection.js';
import { runSelectionAction } from '../../canvas/operations/selectionActions.js';
import {
  isolationActive,
  isolationCrumbs,
  enterIsolation,
  exitIsolationTo,
  exitIsolationAll,
  adoptNewItems,
} from '../../canvas/operations/isolation.js';
import { relayoutAllText } from '../../canvas/operations/textLayout.js';
import { subscribeFonts } from '../../state/fonts.js';
import { setSelectedItems, clearSelection, getSelectedItems } from '../../state/selection.js';
import { bumpDocument } from '../../state/document.js';
import { createSelectTool } from '../../canvas/tools/selectTool.js';
import { createDirectSelectTool } from '../../canvas/tools/directSelectTool.js';
import { createGroupSelectTool } from '../../canvas/tools/groupSelectTool.js';
import { createMagicWandTool } from '../../canvas/tools/magicWandTool.js';
import { createLassoTool } from '../../canvas/tools/lassoTool.js';
import { createHandTool } from '../../canvas/tools/handTool.js';
import { createRotateViewTool } from '../../canvas/tools/rotateViewTool.js';
import { createZoomTool } from '../../canvas/tools/zoomTool.js';
import { createPenTool } from '../../canvas/tools/penTool.js';
import {
  createAddAnchorTool,
  createDeleteAnchorTool,
  createConvertAnchorTool,
} from '../../canvas/tools/anchorTools.js';
import { createCurvatureTool } from '../../canvas/tools/curvatureTool.js';
import { createPencilTool } from '../../canvas/tools/pencilTool.js';
import { createSmoothTool } from '../../canvas/tools/smoothTool.js';
import { createPathEraserTool } from '../../canvas/tools/pathEraserTool.js';
import { createJoinTool } from '../../canvas/tools/joinTool.js';
import { createPaintbrushTool } from '../../canvas/tools/paintbrushTool.js';
import { createBlobBrushTool } from '../../canvas/tools/blobBrushTool.js';
import { createShaperTool } from '../../canvas/tools/shaperTool.js';
import { createShapeBuilderTool } from '../../canvas/tools/shapeBuilderTool.js';
import {
  createRotateTool,
  createReflectTool,
  createScaleTool,
  createShearTool,
} from '../../canvas/tools/transformTools.js';
import { createReshapeTool } from '../../canvas/tools/reshapeTool.js';
import { createFreeTransformTool } from '../../canvas/tools/freeTransformTool.js';
import { createWidthTool } from '../../canvas/tools/widthTool.js';
import {
  createWarpTool,
  createTwirlTool,
  createPuckerTool,
  createBloatTool,
  createScallopTool,
  createCrystallizeTool,
  createWrinkleTool,
} from '../../canvas/tools/liquifyTools.js';
import { createPuppetWarpTool } from '../../canvas/tools/puppetWarpTool.js';
import { createEyedropperTool } from '../../canvas/tools/eyedropperTool.js';
import { createMeasureTool } from '../../canvas/tools/measureTool.js';
import { createDimensionTool } from '../../canvas/tools/dimensionTool.js';
import { createEraserTool } from '../../canvas/tools/eraserTool.js';
import { createScissorsTool } from '../../canvas/tools/scissorsTool.js';
import { createKnifeTool } from '../../canvas/tools/knifeTool.js';
import { createRectangularGridTool } from '../../canvas/tools/rectangularGridTool.js';
import { createPolarGridTool } from '../../canvas/tools/polarGridTool.js';
import { createTextTool, createVerticalTextTool } from '../../canvas/tools/textTool.js';
import { createTouchTypeTool } from '../../canvas/tools/touchTypeTool.js';
import { createRectangleTool } from '../../canvas/tools/rectangleTool.js';
import { createEllipseTool } from '../../canvas/tools/ellipseTool.js';
import { createPolygonTool } from '../../canvas/tools/polygonTool.js';
import { createStarTool } from '../../canvas/tools/starTool.js';
import { createFlareTool } from '../../canvas/tools/flareTool.js';
import { createLineTool } from '../../canvas/tools/lineTool.js';
import { createArcTool } from '../../canvas/tools/arcTool.js';
import { createSpiralTool } from '../../canvas/tools/spiralTool.js';
import styles from './Canvas.module.css';

const TOOL_FACTORIES = {
  [TOOLS.SELECT]: createSelectTool,
  [TOOLS.DIRECT_SELECT]: createDirectSelectTool,
  [TOOLS.GROUP_SELECT]: createGroupSelectTool,
  [TOOLS.MAGIC_WAND]: createMagicWandTool,
  [TOOLS.LASSO]: createLassoTool,
  [TOOLS.HAND]: createHandTool,
  [TOOLS.ROTATE_VIEW]: createRotateViewTool,
  [TOOLS.ZOOM]: createZoomTool,
  [TOOLS.PEN]: createPenTool,
  [TOOLS.ADD_ANCHOR]: createAddAnchorTool,
  [TOOLS.DELETE_ANCHOR]: createDeleteAnchorTool,
  [TOOLS.CONVERT_ANCHOR]: createConvertAnchorTool,
  [TOOLS.CURVATURE]: createCurvatureTool,
  [TOOLS.PENCIL]: createPencilTool,
  [TOOLS.SMOOTH]: createSmoothTool,
  [TOOLS.PATH_ERASER]: createPathEraserTool,
  [TOOLS.JOIN]: createJoinTool,
  [TOOLS.PAINTBRUSH]: createPaintbrushTool,
  [TOOLS.BLOB_BRUSH]: createBlobBrushTool,
  [TOOLS.SHAPER]: createShaperTool,
  [TOOLS.SHAPE_BUILDER]: createShapeBuilderTool,
  [TOOLS.ROTATE]: createRotateTool,
  [TOOLS.REFLECT]: createReflectTool,
  [TOOLS.SCALE]: createScaleTool,
  [TOOLS.SHEAR]: createShearTool,
  [TOOLS.RESHAPE]: createReshapeTool,
  [TOOLS.FREE_TRANSFORM]: createFreeTransformTool,
  [TOOLS.WIDTH]: createWidthTool,
  [TOOLS.WARP]: createWarpTool,
  [TOOLS.TWIRL]: createTwirlTool,
  [TOOLS.PUCKER]: createPuckerTool,
  [TOOLS.BLOAT]: createBloatTool,
  [TOOLS.SCALLOP]: createScallopTool,
  [TOOLS.CRYSTALLIZE]: createCrystallizeTool,
  [TOOLS.WRINKLE]: createWrinkleTool,
  [TOOLS.PUPPET_WARP]: createPuppetWarpTool,
  [TOOLS.EYEDROPPER]: createEyedropperTool,
  [TOOLS.MEASURE]: createMeasureTool,
  [TOOLS.DIMENSION]: createDimensionTool,
  [TOOLS.ERASER]: createEraserTool,
  [TOOLS.SCISSORS]: createScissorsTool,
  [TOOLS.KNIFE]: createKnifeTool,
  [TOOLS.RECTANGULAR_GRID]: createRectangularGridTool,
  [TOOLS.POLAR_GRID]: createPolarGridTool,
  [TOOLS.TEXT]: createTextTool,
  [TOOLS.VERTICAL_TEXT]: createVerticalTextTool,
  [TOOLS.TOUCH_TYPE]: createTouchTypeTool,
  [TOOLS.RECTANGLE]: createRectangleTool,
  [TOOLS.ELLIPSE]: createEllipseTool,
  [TOOLS.POLYGON]: createPolygonTool,
  [TOOLS.STAR]: createStarTool,
  [TOOLS.FLARE]: createFlareTool,
  [TOOLS.LINE]: createLineTool,
  [TOOLS.ARC]: createArcTool,
  [TOOLS.SPIRAL]: createSpiralTool,
};

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 50;
const ZOOM_STEP = 1.1;

export default function Canvas({
  activeTool,
  onSelectionChange,
  onEditText,
  pendingEditRef,
  refreshRef,
  actionRef,
  viewRef,
  paintRef,
  snapRef,
  onZoomChange,
  onRotationChange,
  onIsolationChange,
}) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const toolRef = useRef(null);
  // Persistent view over the global selection store: draws the overlay and
  // feeds App / the contextual task bar no matter which tool is active.
  const docSelRef = useRef(null);
  // Latest callbacks, kept in refs so the mount-once listeners read the current
  // prop without re-binding.
  const onSelChangeRef = useRef(onSelectionChange);
  onSelChangeRef.current = onSelectionChange;
  const onEditTextRef = useRef(onEditText);
  onEditTextRef.current = onEditText;
  const onZoomChangeRef = useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;
  const onRotationChangeRef = useRef(onRotationChange);
  onRotationChangeRef.current = onRotationChange;
  const onIsolationChangeRef = useRef(onIsolationChange);
  onIsolationChangeRef.current = onIsolationChange;

  // Contextual task bar state (floats under the selection on the canvas).
  const [ctxRect, setCtxRect] = useState(null);
  const [ctxItems, setCtxItems] = useState([]);
  // Isolation-mode breadcrumbs (empty = not isolated).
  const [isoCrumbs, setIsoCrumbs] = useState([]);

  // After any user gesture that may have changed the document: adopt items
  // drawn while isolated into the isolated group, then signal panels.
  const afterMutation = () => {
    if (isolationActive()) adoptNewItems();
    bumpDocument();
  };

  const syncIsolation = () => {
    const crumbs = isolationCrumbs();
    setIsoCrumbs(crumbs);
    onIsolationChangeRef.current?.(crumbs.length);
  };

  // Exit isolation down to `depth` levels; select the group we stepped out of.
  const leaveIsolationTo = (depth) => {
    const left = exitIsolationTo(depth);
    if (left && left.parent) setSelectedItems([left]);
    else clearSelection();
    syncIsolation();
    bumpDocument();
    paper.view.update();
  };

  // Let the parent ask for an overlay redraw after an external change (e.g. a
  // Properties edit): the shared overlay plus any tool-specific widgets.
  if (refreshRef) {
    refreshRef.current = () => {
      if (toolRef.current?.refreshSelection) toolRef.current.refreshSelection();
      else docSelRef.current?.draw();
    };
  }
  // Menu / Properties commands: prefer the active tool (it may add behaviour),
  // otherwise run against the shared selection — so commands work everywhere.
  if (actionRef) {
    actionRef.current = (name) => {
      if (toolRef.current?.runAction) toolRef.current.runAction(name);
      else if (docSelRef.current) runSelectionAction(docSelRef.current, name);
      afterMutation();
    };
  }

  // View-level commands from the menus (zoom, fit, new document).
  if (viewRef) {
    viewRef.current = (cmd) => {
      const view = paper.view;
      const clamp = (z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
      const redraw = () => {
        toolRef.current?.onViewChange?.();
        docSelRef.current?.draw();
      };
      const applyZoom = (nz, pivot) => {
        const oldZoom = view.zoom;
        const z = clamp(nz);
        if (z === oldZoom) return;
        const beta = oldZoom / z;
        const offset = pivot.subtract(view.center);
        view.zoom = z;
        view.center = view.center.add(offset.multiply(1 - beta));
        redraw();
        onZoomChangeRef.current?.(view.zoom);
      };
      if (cmd === 'zoomIn') applyZoom(view.zoom * ZOOM_STEP, view.center);
      else if (cmd === 'zoomOut') applyZoom(view.zoom / ZOOM_STEP, view.center);
      else if (cmd === 'zoomActual') applyZoom(1, view.center);
      else if (cmd === 'zoomFit') {
        const items = [];
        artworkLayers().forEach((l) => {
          if (!l.visible) return;
          l.children.forEach((it) => {
            if (!isOverlayItem(it) && it.visible) items.push(it);
          });
        });
        if (!items.length) {
          applyZoom(1, view.center);
          return;
        }
        let b = items[0].bounds.clone();
        for (let i = 1; i < items.length; i += 1) b = b.unite(items[i].bounds);
        if (b.width < 1 || b.height < 1) {
          applyZoom(1, b.center);
          return;
        }
        const margin = 60;
        view.zoom = clamp(Math.min(
          (view.viewSize.width - margin) / b.width,
          (view.viewSize.height - margin) / b.height,
        ));
        view.center = b.center;
        redraw();
        onZoomChangeRef.current?.(view.zoom);
      } else if (cmd === 'rotateViewCW' || cmd === 'rotateViewCCW' || cmd === 'rotateViewReset') {
        view.rotation = cmd === 'rotateViewReset' ? 0 : view.rotation + (cmd === 'rotateViewCW' ? 90 : -90);
        redraw();
        onRotationChangeRef.current?.(view.rotation);
      } else if (cmd === 'isolate') {
        const sel = getSelectedItems();
        const group = sel.length === 1 ? sel[0] : null;
        if (enterIsolation(group)) {
          clearSelection();
          syncIsolation();
          bumpDocument();
          paper.view.update();
        }
      } else if (cmd === 'exitIsolation') {
        leaveIsolationTo(0);
      } else if (cmd === 'clear') {
        exitIsolationAll();
        syncIsolation();
        clearSelection();
        artworkLayers().forEach((l) => l.remove());
        const fresh = new paper.Layer(); // becomes the active layer
        fresh.name = 'Layer 1';
        bumpDocument();
        paper.view.update();
      }
    };
  }

  // Interaction state kept in refs so the (mount-once) DOM listeners
  // always read the latest values without re-binding.
  const spaceDownRef = useRef(false);
  const panningRef = useRef(false);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  // --- Paper.js setup (runs once) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    paper.setup(canvas);
    paper.project.activeLayer.name = 'Layer 1';

    // One persistent selection view for the whole document: renders the shared
    // overlay and reports selection / bounds regardless of the active tool.
    const docSelection = createSelection(
      (items) => {
        onSelChangeRef.current?.(items);
        setCtxItems(items);
      },
      (rect) => setCtxRect(rect),
    );
    docSelRef.current = docSelection;

    // Measure the stage (not the canvas) — Paper writes inline width/height on
    // the canvas, so observing it would feed back on itself.
    const applySize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (w > 0 && h > 0) paper.view.viewSize = new paper.Size(w, h);
    };
    const resizeObserver = new ResizeObserver(applySize);
    resizeObserver.observe(stage);
    applySize();

    // Always measure relative to the canvas. mousemove/mouseup are bound on
    // window so a drag keeps tracking off-canvas — there e.target isn't the
    // canvas, so e.offsetX would be relative to the wrong element.
    const toProject = (e) => {
      const rect = canvas.getBoundingClientRect();
      return paper.view.viewToProject(
        new paper.Point(e.clientX - rect.left, e.clientY - rect.top),
      );
    };

    const updateCursor = () => {
      if (panningRef.current) canvas.style.cursor = 'grabbing';
      else if (spaceDownRef.current) canvas.style.cursor = 'grab';
      else canvas.style.cursor = toolRef.current?.cursor ?? 'default';
    };

    // --- Zoom toward the cursor ---
    const onWheel = (e) => {
      e.preventDefault();
      const view = paper.view;
      const oldZoom = view.zoom;
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oldZoom * factor));
      if (newZoom === oldZoom) return;

      const mouse = toProject(e);
      const beta = oldZoom / newZoom;
      const offset = mouse.subtract(view.center);
      view.zoom = newZoom;
      view.center = view.center.add(offset.multiply(1 - beta));
      // Handles are sized in screen pixels — rescale the overlay and widgets.
      toolRef.current?.onViewChange?.();
      docSelection.draw();
      onZoomChangeRef.current?.(view.zoom);
    };

    // --- Pan (space + drag) and tool dispatch ---
    const onMouseDown = (e) => {
      if (spaceDownRef.current) {
        panningRef.current = true;
        updateCursor();
        return;
      }
      drawingRef.current = true;
      const point = toProject(e);
      lastPointRef.current = point;
      toolRef.current?.onMouseDown?.(point, e);
    };

    const onMouseMove = (e) => {
      if (panningRef.current) {
        const delta = new paper.Point(e.movementX, e.movementY).divide(
          paper.view.zoom,
        );
        paper.view.center = paper.view.center.subtract(delta);
        return;
      }
      if (drawingRef.current) {
        const point = toProject(e);
        const delta = point.subtract(lastPointRef.current);
        lastPointRef.current = point;
        toolRef.current?.onMouseDrag?.(point, delta, e);
        return;
      }
      // Idle hover — let the tool suggest a cursor (e.g. resize over a handle).
      if (!spaceDownRef.current) {
        const cursor = toolRef.current?.onMouseHover?.(toProject(e), e);
        canvas.style.cursor = cursor ?? toolRef.current?.cursor ?? 'default';
      }
    };

    const onMouseUp = (e) => {
      if (panningRef.current) {
        panningRef.current = false;
        updateCursor();
        return;
      }
      if (drawingRef.current) {
        drawingRef.current = false;
        toolRef.current?.onMouseUp?.(toProject(e), e);
        afterMutation();
      }
    };

    // Double-click: text → edit it; group → isolate it (deeper when already
    // isolated); empty space while isolated → step one level out.
    const onDblClick = (e) => {
      const item = pickItem(toProject(e));
      if (item && item.data && item.data.isText) {
        onEditTextRef.current?.(item);
        return;
      }
      if (item && item.className === 'Group') {
        if (enterIsolation(item)) {
          clearSelection();
          syncIsolation();
          bumpDocument();
          paper.view.update();
        }
        return;
      }
      if (!item && isolationActive()) {
        leaveIsolationTo(isolationCrumbs().length - 1);
      }
    };

    // Selection commands work from any tool: the active tool may add
    // behaviour; otherwise they run against the shared selection store.
    const runToolAction = (name) => {
      if (toolRef.current?.runAction) toolRef.current.runAction(name);
      else runSelectionAction(docSelection, name);
      afterMutation();
    };

    const onKeyDown = (e) => {
      // Ignore shortcuts while typing in a form field (e.g. Properties panel).
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        return;
      }
      // While a tool captures the keyboard (e.g. text editing), every key —
      // including Space — goes to it, not to pan/shortcut handling.
      if (toolRef.current?.wantsKeyboard?.()) {
        toolRef.current.onKeyDown?.(e);
        afterMutation(); // typing edits the document (Layers labels follow)
        return;
      }
      if (e.code === 'Space') {
        if (!spaceDownRef.current) {
          e.preventDefault();
          spaceDownRef.current = true;
          updateCursor();
        }
        return;
      }
      // Group / ungroup (Cmd/Ctrl+G, +Shift to ungroup).
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyG') {
        e.preventDefault();
        runToolAction(e.shiftKey ? 'ungroup' : 'group');
        return;
      }
      // Select all / deselect / duplicate.
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyA') {
        e.preventDefault();
        runToolAction(e.shiftKey ? 'deselect' : 'selectAll');
        return;
      }
      // ⌘D = Transform Again (Illustrator); duplicates when nothing recorded.
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyD') {
        e.preventDefault();
        runToolAction('transformAgain');
        return;
      }
      // Join paths (⌘J) and Compound Path make / release (⌘8 / ⌥⌘8).
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyJ') {
        e.preventDefault();
        runToolAction('pathJoin');
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.code === 'Digit8') {
        e.preventDefault();
        runToolAction(e.altKey ? 'compoundRelease' : 'compoundMake');
        return;
      }
      // Lock / hide (⌘2 / ⌘3; with Alt — unlock all / show all).
      if ((e.metaKey || e.ctrlKey) && (e.code === 'Digit2' || e.code === 'Digit3')) {
        e.preventDefault();
        const lock = e.code === 'Digit2';
        runToolAction(e.altKey ? (lock ? 'unlockAll' : 'showAll') : (lock ? 'lockSelection' : 'hideSelection'));
        return;
      }
      // Escape steps out of isolation mode one level at a time.
      if (e.code === 'Escape' && isolationActive()) {
        leaveIsolationTo(isolationCrumbs().length - 1);
        return;
      }
      // X swaps the active fill/stroke focus; Shift+X swaps the colours.
      if (e.code === 'KeyX' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (e.shiftKey) paintRef?.current?.swap?.();
        else paintRef?.current?.toggleFocus?.();
        return;
      }
      // Avoid Backspace navigating the browser back (no text inputs here).
      if (e.code === 'Backspace') e.preventDefault();
      toolRef.current?.onKeyDown?.(e);
      afterMutation();
    };

    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        spaceDownRef.current = false;
        panningRef.current = false;
        updateCursor();
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('dblclick', onDblClick);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('dblclick', onDblClick);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      docSelection.dispose();
      docSelRef.current = null;
      paper.project?.clear();
    };
  }, []);

  // A font that finishes loading changes glyph metrics — re-layout all text.
  useEffect(() => subscribeFonts(() => {
    relayoutAllText();
    toolRef.current?.refreshSelection?.();
    paper.view?.update();
  }), []);

  // --- Swap the active tool when it changes ---
  useEffect(() => {
    toolRef.current?.deactivate?.();
    const factory = TOOL_FACTORIES[activeTool];
    const toolCtx = {
      // Selection reporting is global now (the store feeds App and the task
      // bar via the persistent view) — tools only get behavioural hooks.
      consumePendingEdit: () => {
        const item = pendingEditRef?.current ?? null;
        if (pendingEditRef) pendingEditRef.current = null;
        return item;
      },
      getSnap: () => snapRef?.current ?? { grid: false, objects: false },
      onRotation: (deg) => onRotationChangeRef.current?.(deg),
      zoomAt: (point, dir) => {
        const view = paper.view;
        const oldZoom = view.zoom;
        const factor = dir > 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oldZoom * factor));
        if (newZoom === oldZoom) return;
        const beta = oldZoom / newZoom;
        const offset = point.subtract(view.center);
        view.zoom = newZoom;
        view.center = view.center.add(offset.multiply(1 - beta));
        toolRef.current?.onViewChange?.();
        docSelRef.current?.draw();
        onZoomChangeRef.current?.(view.zoom);
      },
    };
    toolRef.current = factory ? factory(toolCtx) : null;
    const canvas = canvasRef.current;
    if (canvas && !spaceDownRef.current && !panningRef.current) {
      canvas.style.cursor = toolRef.current?.cursor ?? 'default';
    }
  }, [activeTool]);

  const single = ctxItems.length === 1 ? ctxItems[0] : null;
  const isGroup = !!(single && single.className === 'Group' && !(single.data && single.data.isText));
  const isText = !!(single && single.data && single.data.isText);
  const showCtx = ctxRect && ctxItems.length > 0;

  return (
    <div ref={stageRef} className={styles.stage}>
      <canvas ref={canvasRef} className={styles.canvas} />
      {isoCrumbs.length > 0 && (
        <div className={styles.crumbs}>
          <button type="button" className={styles.crumb} onClick={() => leaveIsolationTo(0)}>
            Document
          </button>
          {isoCrumbs.map((label, i) => (
            <span key={`${label}-${i}`} className={styles.crumbWrap}>
              <span className={styles.crumbSep}>›</span>
              <button
                type="button"
                className={i === isoCrumbs.length - 1 ? `${styles.crumb} ${styles.crumbLast}` : styles.crumb}
                onClick={() => leaveIsolationTo(i + 1)}
              >
                {label}
              </button>
            </span>
          ))}
        </div>
      )}
      {showCtx && (
        <div
          className={styles.ctxBar}
          style={{ left: ctxRect.x + ctxRect.w / 2, top: ctxRect.y + ctxRect.h + 10 }}
        >
          {ctxItems.length >= 2 && (
            <button type="button" className={styles.ctxBtn} onClick={() => toolRef.current?.runAction?.('group')}>
              Group
            </button>
          )}
          {isGroup && (
            <button type="button" className={styles.ctxBtn} onClick={() => toolRef.current?.runAction?.('ungroup')}>
              Ungroup
            </button>
          )}
          {isText && (
            <button type="button" className={styles.ctxBtn} onClick={() => onEditTextRef.current?.(single)}>
              Edit
            </button>
          )}
          <button type="button" className={styles.ctxBtn} onClick={() => toolRef.current?.runAction?.('delete')}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
