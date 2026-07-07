# Current task: iteration 8.2 — Harmonies and Recolor

## To do:
- [ ] Color Guide panel: Harmony Rules (Complementary, Monochromatic, Triad, Analogous,
      High Contrast, Pentagram) derived from a base color; variation rows Tints/Shades,
      Warm/Cool, Vivid/Muted; click on a variation = apply to the focused paint
- [ ] Recolor Artwork (dialog, Edit > Edit Colors or a Color Guide button):
      extract the selection's colors, Harmony Rules, base color change, Link/Unlink
      harmony (linked rotation of all colors), randomize order and saturation/brightness,
      Add/Remove Color, limit to a swatch library
- [ ] Color wheel in Recolor: smooth / segmented modes + color bars; color markers on
      the wheel, dragging a marker = hue shift (linked = all together)
- [ ] H/S/B sliders for the selected color inside Recolor
- [ ] Apply: replace colors across the whole selection (fill/stroke, including text)

## Already done (don't touch):
- Iterations through 8.1 inclusive (see CLAUDE.md "Reconciliation"): selection, shapes,
  Pen, drawing/cutting, text 5.1–5.3, organization 6.1–6.2, transforms 7.1–7.3,
  color 8.1 (Color panel, Picker, Eyedropper, Swatches, Document Color Mode)
- Color conversions — `src/canvas/operations/colorConvert.js` (hex/RGB/HSB/CMYK/Lab,
  gamut) — reuse, don't duplicate
- Style edits from panels — via `applyStyle` + `afterStyleEdit()` from
  `operations/swatchOps.js` (redraw + notify + bump)

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
