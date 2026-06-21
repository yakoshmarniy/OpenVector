import { useEffect, useRef } from 'react';
import paper from 'paper';
import { TOOLS } from '../../canvas/tools/toolIds.js';
import { pickItem } from '../../canvas/operations/selection.js';
import { createSelectTool } from '../../canvas/tools/selectTool.js';
import { createPenTool } from '../../canvas/tools/penTool.js';
import { createTextTool } from '../../canvas/tools/textTool.js';
import { createRectangleTool } from '../../canvas/tools/rectangleTool.js';
import { createRoundedRectangleTool } from '../../canvas/tools/roundedRectangleTool.js';
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
  [TOOLS.PEN]: createPenTool,
  [TOOLS.TEXT]: createTextTool,
  [TOOLS.RECTANGLE]: createRectangleTool,
  [TOOLS.ROUNDED_RECTANGLE]: createRoundedRectangleTool,
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
  snapRef,
}) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const toolRef = useRef(null);
  // Latest callbacks, kept in refs so the mount-once listeners read the current
  // prop without re-binding.
  const onSelChangeRef = useRef(onSelectionChange);
  onSelChangeRef.current = onSelectionChange;
  const onEditTextRef = useRef(onEditText);
  onEditTextRef.current = onEditText;

  // Let the parent ask the active tool to redraw its selection overlay after an
  // external change (e.g. a Properties edit).
  if (refreshRef) refreshRef.current = () => toolRef.current?.refreshSelection?.();
  // Let Properties buttons trigger group/boolean actions on the current tool.
  if (actionRef) actionRef.current = (name) => toolRef.current?.runAction?.(name);

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
      // Handles are sized in screen pixels — let the tool rescale them.
      toolRef.current?.onViewChange?.();
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
      }
    };

    // Double-click a text item → edit it (works from any tool).
    const onDblClick = (e) => {
      const item = pickItem(toProject(e));
      if (item && item.data && item.data.isText) {
        onEditTextRef.current?.(item);
      }
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
        toolRef.current?.runAction?.(e.shiftKey ? 'ungroup' : 'group');
        return;
      }
      // Avoid Backspace navigating the browser back (no text inputs here).
      if (e.code === 'Backspace') e.preventDefault();
      toolRef.current?.onKeyDown?.(e);
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
      paper.project?.clear();
    };
  }, []);

  // --- Swap the active tool when it changes ---
  useEffect(() => {
    toolRef.current?.deactivate?.();
    const factory = TOOL_FACTORIES[activeTool];
    const toolCtx = {
      onSelectionChange: (item) => onSelChangeRef.current?.(item),
      consumePendingEdit: () => {
        const item = pendingEditRef?.current ?? null;
        if (pendingEditRef) pendingEditRef.current = null;
        return item;
      },
      getSnap: () => snapRef?.current ?? { grid: false, objects: false },
    };
    toolRef.current = factory ? factory(toolCtx) : null;
    const canvas = canvasRef.current;
    if (canvas && !spaceDownRef.current && !panningRef.current) {
      canvas.style.cursor = toolRef.current?.cursor ?? 'default';
    }
  }, [activeTool]);

  return (
    <div ref={stageRef} className={styles.stage}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
