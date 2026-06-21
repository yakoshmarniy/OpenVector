// Tool identifiers — kept in a standalone module so App, Toolbar and Canvas
// can share them without creating a circular import.
export const TOOLS = {
  SELECT: 'select',
  DIRECT_SELECT: 'directSelect',
  GROUP_SELECT: 'groupSelect',
  PEN: 'pen',
  ADD_ANCHOR: 'addAnchor',
  DELETE_ANCHOR: 'deleteAnchor',
  CONVERT_ANCHOR: 'convertAnchor',
  CURVATURE: 'curvature',
  TEXT: 'text',
  RECTANGLE: 'rectangle',
  ROUNDED_RECTANGLE: 'roundedRectangle',
  ELLIPSE: 'ellipse',
  POLYGON: 'polygon',
  STAR: 'star',
  FLARE: 'flare',
  LINE: 'line',
  ARC: 'arc',
  SPIRAL: 'spiral',
  HAND: 'hand',
  ZOOM: 'zoom',
};
