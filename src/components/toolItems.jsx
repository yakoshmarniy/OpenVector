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

function MagicWandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19l9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 4v3M14 13v-3M11.5 7h5M19 10h-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18 5l1.5-1.5M18.5 8.5L20 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function LassoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11a8 4 0 1 1 9 3.9c-2 .5-3 1-3 2.6a2 2 0 0 0 2 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="19.5" r="1.4" fill="currentColor" />
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

function RotateViewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 12a8 8 0 1 1-2.3-5.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 4v4h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function AddAnchorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3l3 6-3 2-3-2 3-6z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="9" y1="11" x2="9" y2="17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 17h6M18 14v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DeleteAnchorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3l3 6-3 2-3-2 3-6z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="9" y1="11" x2="9" y2="17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ConvertAnchorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 18a8 8 0 0 1 8-8 8 8 0 0 0 8-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="10" y="8" width="4" height="4" fill="currentColor" />
    </svg>
  );
}

function CurvatureIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 17C8 17 9 5 14 5s6 12 7 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="14" cy="5" r="1.8" fill="currentColor" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20l1.2-4L16 5.2a2 2 0 0 1 2.8 2.8L8 18.8 4 20z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14.5 6.5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SmoothIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 16c3 0 4-9 8-9 3 0 3 5 6 5 2 0 4-2 4-2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PathEraserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 17l8-8 5 5-3 3H6z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 7l4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function JoinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8a6 6 0 0 0 8 5 6 6 0 0 0 8-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="4" cy="8" r="1.8" fill="currentColor" />
      <circle cx="20" cy="8" r="1.8" fill="currentColor" />
    </svg>
  );
}

function PaintbrushIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 3l6 6-7 4-3-3 4-7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M11 10c-4 1-5 4-5 7 3 0 6-1 7-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function BlobBrushIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 14c-2-1-3-4-1-6s5-1 6-3 5-2 7 1-1 6-3 7-3 0-5 2-7 1-7-2z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

function ShaperIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="7" width="11" height="11" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 4c4 0 7 3 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>
  );
}

function ShapeBuilderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 5.4a6 6 0 0 1 0 9.2 6 6 0 0 1 0-9.2z" fill="currentColor" />
      <path d="M17.5 17.5v4M15.5 19.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function EraserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 19l-4-4a1.5 1.5 0 0 1 0-2.1l8-8a1.5 1.5 0 0 1 2.1 0l4 4a1.5 1.5 0 0 1 0 2.1l-6 6z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 19h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ScissorsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="6" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="18" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7.5L20 18M8 16.5L20 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function KnifeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20c2-8 9-15 16-17-1 8-7 14-12 15z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 20l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RectangularGridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.3 4v16M14.6 4v16M4 9.3h16M4 14.6h16" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function PolarGridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7" stroke="currentColor" strokeWidth="1.1" />
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

function VerticalTextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5h14M12 5v14M9 19h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(90 12 12)" />
    </svg>
  );
}

function TouchTypeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h9M8.5 4v9M6.5 13h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 14l2 7 1.6-3 3 1.2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
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

function RotateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12a7 7 0 1 1-7-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 2.5l3 2.5-3 2.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

function ReflectIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v18" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2.5 2" />
      <path d="M9 8L4 16h5V8z" fill="currentColor" />
      <path d="M15 8l5 8h-5V8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="10" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 14L19 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 10V5h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6h11l-5 12H4L9 6z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 3.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9 3.5l-1.5-1.2M9 3.5L7.5 4.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ReshapeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 18c4-1 5-7 8-11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 7l4-3 3 4-4 3z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

function FreeTransformIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 5h13v13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2" />
      <path d="M5 9l14 1-9 9-4-1L5 9z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="3.4" y="7.4" width="3.2" height="3.2" fill="currentColor" />
      <rect x="17.4" y="8.4" width="3.2" height="3.2" fill="currentColor" />
      <rect x="8.4" y="17.4" width="3.2" height="3.2" fill="currentColor" />
    </svg>
  );
}

function WidthIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12C8 5.5 16 5.5 21 12C16 18.5 8 18.5 3 12z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1" strokeDasharray="2.5 2" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

function PuppetWarpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 18c4 1 8-2 9-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="15" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="7" r="1" fill="currentColor" />
      <path d="M15 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="5" cy="18.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

function WarpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19c3 0 4-3 4-6 0-4 2-4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 9h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18 9l-2.2-1.8M18 9l-2.2 1.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function TwirlIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12m-1.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0" fill="currentColor" />
      <path d="M12 4a8 8 0 0 1 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 20a8 8 0 0 1-8-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 7.5a4.5 4.5 0 0 1 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 16.5A4.5 4.5 0 0 1 7.5 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PuckerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <path d="M12 3v5M12 21v-5M3 12h5M21 12h-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 8l-1.6-1.6M12 8l1.6-1.6M12 16l-1.6 1.6M12 16l1.6 1.6M8 12l-1.6-1.6M8 12l-1.6 1.6M16 12l1.6-1.6M16 12l1.6 1.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function BloatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 9V4M12 15v5M9 12H4M15 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 4l-1.6 1.6M12 4l1.6 1.6M12 20l-1.6-1.6M12 20l1.6-1.6M4 12l1.6-1.6M4 12l1.6 1.6M20 12l-1.6-1.6M20 12l-1.6 1.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ScallopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 15c1.5-3 3-3 4.5 0s3 3 4.5 0 3-3 4.5 0 3 3 4.5 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1" strokeDasharray="2.5 2" />
    </svg>
  );
}

function CrystallizeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l2 5.5L20 7l-3.5 4.5L21 15l-6 .5L13 21l-2.5-5L5 17.5 7.5 12 4 8l6 .5z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function WrinkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 9l2.5-2 2.5 3 2.5-3.5 2.5 3 2.5-2.5 2.5 2 3-2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16l2.5-1.5 2.5 2 2.5-2.5 2.5 2 2.5-1.5 2.5 1.5 3-1.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MeasureIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1.5" y="13.2" width="20" height="6.5" rx="1" transform="rotate(-35 12 16)" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 14.8l1.6 2.3M10.6 12.3l1.1 1.6M14 9.9l1.6 2.3M17.6 7.4l1.1 1.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function DimensionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8v12M20 8v12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4 14h16" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 14l3-2v4zM20 14l-3-2v4z" fill="currentColor" />
      <path d="M9 5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// label is plain text for now; will move to i18next t() when i18n lands.
export const TOOL_ITEMS = [
  { id: TOOLS.SELECT, label: 'Select', Icon: SelectIcon },
  { id: TOOLS.DIRECT_SELECT, label: 'Direct Selection', Icon: DirectSelectIcon },
  { id: TOOLS.GROUP_SELECT, label: 'Group Selection', Icon: GroupSelectIcon },
  { id: TOOLS.MAGIC_WAND, label: 'Magic Wand', Icon: MagicWandIcon },
  { id: TOOLS.LASSO, label: 'Lasso', Icon: LassoIcon },
  { id: TOOLS.PEN, label: 'Pen', Icon: PenIcon },
  { id: TOOLS.ADD_ANCHOR, label: 'Add Anchor Point', Icon: AddAnchorIcon },
  { id: TOOLS.DELETE_ANCHOR, label: 'Delete Anchor Point', Icon: DeleteAnchorIcon },
  { id: TOOLS.CONVERT_ANCHOR, label: 'Convert Anchor Point', Icon: ConvertAnchorIcon },
  { id: TOOLS.CURVATURE, label: 'Curvature', Icon: CurvatureIcon },
  { id: TOOLS.PENCIL, label: 'Pencil', Icon: PencilIcon },
  { id: TOOLS.SMOOTH, label: 'Smooth', Icon: SmoothIcon },
  { id: TOOLS.PATH_ERASER, label: 'Path Eraser', Icon: PathEraserIcon },
  { id: TOOLS.JOIN, label: 'Join', Icon: JoinIcon },
  { id: TOOLS.PAINTBRUSH, label: 'Paintbrush', Icon: PaintbrushIcon },
  { id: TOOLS.BLOB_BRUSH, label: 'Blob Brush', Icon: BlobBrushIcon },
  { id: TOOLS.SHAPER, label: 'Shaper', Icon: ShaperIcon },
  { id: TOOLS.SHAPE_BUILDER, label: 'Shape Builder', Icon: ShapeBuilderIcon },
  { id: TOOLS.ROTATE, label: 'Rotate', Icon: RotateIcon },
  { id: TOOLS.REFLECT, label: 'Reflect', Icon: ReflectIcon },
  { id: TOOLS.SCALE, label: 'Scale', Icon: ScaleIcon },
  { id: TOOLS.SHEAR, label: 'Shear', Icon: ShearIcon },
  { id: TOOLS.RESHAPE, label: 'Reshape', Icon: ReshapeIcon },
  { id: TOOLS.FREE_TRANSFORM, label: 'Free Transform', Icon: FreeTransformIcon },
  { id: TOOLS.WIDTH, label: 'Width', Icon: WidthIcon },
  { id: TOOLS.WARP, label: 'Warp', Icon: WarpIcon },
  { id: TOOLS.TWIRL, label: 'Twirl', Icon: TwirlIcon },
  { id: TOOLS.PUCKER, label: 'Pucker', Icon: PuckerIcon },
  { id: TOOLS.BLOAT, label: 'Bloat', Icon: BloatIcon },
  { id: TOOLS.SCALLOP, label: 'Scallop', Icon: ScallopIcon },
  { id: TOOLS.CRYSTALLIZE, label: 'Crystallize', Icon: CrystallizeIcon },
  { id: TOOLS.WRINKLE, label: 'Wrinkle', Icon: WrinkleIcon },
  { id: TOOLS.PUPPET_WARP, label: 'Puppet Warp', Icon: PuppetWarpIcon },
  { id: TOOLS.MEASURE, label: 'Measure', Icon: MeasureIcon },
  { id: TOOLS.DIMENSION, label: 'Dimension', Icon: DimensionIcon },
  { id: TOOLS.ERASER, label: 'Eraser', Icon: EraserIcon },
  { id: TOOLS.SCISSORS, label: 'Scissors', Icon: ScissorsIcon },
  { id: TOOLS.KNIFE, label: 'Knife', Icon: KnifeIcon },
  { id: TOOLS.RECTANGULAR_GRID, label: 'Rectangular Grid', Icon: RectangularGridIcon },
  { id: TOOLS.POLAR_GRID, label: 'Polar Grid', Icon: PolarGridIcon },
  { id: TOOLS.TEXT, label: 'Type', Icon: TextIcon },
  { id: TOOLS.VERTICAL_TEXT, label: 'Vertical Type', Icon: VerticalTextIcon },
  { id: TOOLS.TOUCH_TYPE, label: 'Touch Type', Icon: TouchTypeIcon },
  { id: TOOLS.RECTANGLE, label: 'Rectangle', Icon: RectangleIcon },
  { id: TOOLS.ELLIPSE, label: 'Ellipse', Icon: EllipseIcon },
  { id: TOOLS.POLYGON, label: 'Polygon', Icon: PolygonIcon },
  { id: TOOLS.STAR, label: 'Star', Icon: StarIcon },
  { id: TOOLS.FLARE, label: 'Flare', Icon: FlareIcon },
  { id: TOOLS.LINE, label: 'Line', Icon: LineIcon },
  { id: TOOLS.ARC, label: 'Arc', Icon: ArcIcon },
  { id: TOOLS.SPIRAL, label: 'Spiral', Icon: SpiralIcon },
  { id: TOOLS.HAND, label: 'Hand', Icon: HandIcon },
  { id: TOOLS.ROTATE_VIEW, label: 'Rotate View', Icon: RotateViewIcon },
  { id: TOOLS.ZOOM, label: 'Zoom', Icon: ZoomIcon },
];
