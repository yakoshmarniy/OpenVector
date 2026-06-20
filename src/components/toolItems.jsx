import { TOOLS } from '../canvas/tools/toolIds.js';

// Inline icons keep the toolbars dependency-free. Shared by the left rail and
// the top bar so the tool list lives in one place.

function SelectIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 3l14 8-6 1.5L10 19 5 3z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3l4 9-4 3-4-3 4-9z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="12" y1="8" x2="12" y2="15" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="15" x2="12" y2="20" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 5h14M12 5v14M9 19h6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RectangleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EllipseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="5" y1="19" x2="19" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// label is plain text for now; will move to i18next t() when i18n lands.
export const TOOL_ITEMS = [
  { id: TOOLS.SELECT, label: 'Select', Icon: SelectIcon },
  { id: TOOLS.PEN, label: 'Pen', Icon: PenIcon },
  { id: TOOLS.TEXT, label: 'Text', Icon: TextIcon },
  { id: TOOLS.RECTANGLE, label: 'Rectangle', Icon: RectangleIcon },
  { id: TOOLS.ELLIPSE, label: 'Ellipse', Icon: EllipseIcon },
  { id: TOOLS.LINE, label: 'Line', Icon: LineIcon },
];
