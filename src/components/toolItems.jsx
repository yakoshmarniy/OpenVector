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

function DirectSelectIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3l14 8-6 1.5L10 19 5 3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function GroupSelectIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 2l12 7-5 1.3L8.5 16 4 2z" fill="currentColor" />
      <path d="M16 16h5M18.5 13.5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 11V6.5a1.4 1.4 0 0 1 2.8 0V11V4.6a1.4 1.4 0 0 1 2.8 0V11V6.2a1.4 1.4 0 0 1 2.8 0V13a6 6 0 0 1-6 6h-1a5 5 0 0 1-5-5v-2.6l-1-1a1.3 1.3 0 0 1 1.9-1.9L8 11z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="20" y1="20" x2="15.5" y2="15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function RoundedRectangleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PolygonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l2.6 5.7 6.2.6-4.7 4.1 1.4 6.1L12 16.9 6.5 19.6l1.4-6.1L3.2 9.3l6.2-.6z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function FlareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.5 2.5M16.5 16.5L19 19M19 5l-2.5 2.5M7.5 16.5L5 19"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ArcIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19a15 15 0 0 1 15-15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SpiralIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a2 2 0 1 1 2 2 4 4 0 1 1-4-4 6 6 0 1 1 6 6"
        fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// label is plain text for now; will move to i18next t() when i18n lands.
export const TOOL_ITEMS = [
  { id: TOOLS.SELECT, label: 'Select', Icon: SelectIcon },
  { id: TOOLS.DIRECT_SELECT, label: 'Direct Selection', Icon: DirectSelectIcon },
  { id: TOOLS.GROUP_SELECT, label: 'Group Selection', Icon: GroupSelectIcon },
  { id: TOOLS.PEN, label: 'Pen', Icon: PenIcon },
  { id: TOOLS.TEXT, label: 'Text', Icon: TextIcon },
  { id: TOOLS.RECTANGLE, label: 'Rectangle', Icon: RectangleIcon },
  { id: TOOLS.ROUNDED_RECTANGLE, label: 'Rounded Rectangle', Icon: RoundedRectangleIcon },
  { id: TOOLS.ELLIPSE, label: 'Ellipse', Icon: EllipseIcon },
  { id: TOOLS.POLYGON, label: 'Polygon', Icon: PolygonIcon },
  { id: TOOLS.STAR, label: 'Star', Icon: StarIcon },
  { id: TOOLS.FLARE, label: 'Flare', Icon: FlareIcon },
  { id: TOOLS.LINE, label: 'Line', Icon: LineIcon },
  { id: TOOLS.ARC, label: 'Arc', Icon: ArcIcon },
  { id: TOOLS.SPIRAL, label: 'Spiral', Icon: SpiralIcon },
  { id: TOOLS.HAND, label: 'Hand', Icon: HandIcon },
  { id: TOOLS.ZOOM, label: 'Zoom', Icon: ZoomIcon },
];
