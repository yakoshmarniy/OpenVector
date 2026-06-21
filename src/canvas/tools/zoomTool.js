// Zoom tool — click to zoom in toward the point, Alt+click to zoom out.
// The actual view math + status-bar reporting live in Canvas (ctx.zoomAt).
export function createZoomTool(ctx = {}) {
  return {
    cursor: 'zoom-in',
    onMouseDown(point, e) {
      ctx.zoomAt?.(point, e && e.altKey ? -1 : 1);
    },
  };
}
