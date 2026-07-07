# Current task: iteration 8.1 — Base color and Swatches

## To do:
- [ ] Color panel: RGB / HSB / CMYK / Grayscale sliders, Hex field, Lab (if feasible);
      model switching via the panel menu; spectrum strip at the bottom (as in Illustrator)
- [ ] Color Picker (dialog on dblclick of the Fill/Stroke swatch in the toolbar/panel):
      saturation×brightness field + Hue bar, RGB/HSB/Hex fields, old/new color preview,
      out-of-gamut warning (for CMYK document mode)
- [ ] Eyedropper (I): click — pick fill/stroke/stroke width/opacity from an object and apply
      to the selection; Alt-click — the reverse (give the selection's style to the object under
      the cursor)
- [ ] Swatches panel: swatch list/grid, add/remove, default library,
      Global Colors (editing a swatch updates objects where it's applied), Spot Colors (basic);
      Pantone/Color Books — defer if it doesn't fit
- [ ] Document Color Mode (RGB/CMYK) — a toggle in the File menu, affects the Color panel
      and gamut warnings
- [ ] Create Swatch from selection; None/Registration swatches

## Already done (don't touch):
- Iterations through 7.3 inclusive (see CLAUDE.md "Reconciliation with the 20-phase plan"):
  selection, shapes, Pen, drawing/cutting, text 5.1–5.3, organization 6.1–6.2,
  transforms 7.1, Width/Puppet Warp/Measure/Dimension 7.2, Liquify 7.3

## Don't touch:
- Anything not in the list above
- Later iterations

## Plan additions from Illustrator 2024–2026 research (NOT this iteration — fold into CLAUDE.md during plan polish):
- **New tools missing from the plan:** Objects on Path (v29.0, 2025 — laying out objects
  along a path with spacing/alignment/orientation handles) → phase 7/11;
  Intertwine (Make/Edit/Release) is already in 11.3 — fine.
- **Dimension tool** (v28.3): our v1 was done in 7.2; in Illustrator — Linear/Angular/Radial,
  units/scale/precision, a dedicated Dimensions layer → finish at 13.x.
- **Contextual Task Bar** — in Illustrator this is a central surface (contextual actions
  for paths/shapes/text/groups/masks + AI actions). We have a seed since 1.2 — at 20.2
  build a shared registry "command → menu/Properties/Task Bar/widget".
- **On-canvas widgets** — check our set against the research list (Live Corners with corner
  types round/inverted/chamfer, gradient annotator, blend spine, repeat widgets,
  9-point reference — partially present); each widget = a reusable overlay component.
- **Phase 18 (AI) split into tracks:** 18.0 architecture (Generative Object data model,
  variation management, Generation History) → generation (Text to Vector, Shape Fill,
  Expand) → editing (Prompt to Edit, Generative Recolor) → text (Rewrite, Retype)
  → Mockup/Turntable → AI Assistant. Map Adobe features to open-model equivalents
  (user-provided keys).
- **Transform Each** got Relative/Absolute scaling (2026) — ours is a prompt stub, account for it in 15.x.
- **Blending modes:** the canonical list of 16 confirmed (see research, section E) — for 11.1.
- **Artboards:** Illustrator's limit is up to 1000 (a reference for 13.1, not an obligation).

## Context:
- Stack: Vite + React + Paper.js
- Tools: src/canvas/tools/
- Each tool = a separate file
- All UI strings via t('key') — no hardcoding
- No console.log in production
