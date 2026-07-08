# Current task: iteration 9.1 — Gradients and Mesh

## To do:
- [ ] Gradient panel + Gradient Tool: linear, radial, conical (angular) gradients;
      on-canvas gradient annotator (drag the axis, move/add/delete stops, angle, aspect)
- [ ] Gradient presets, dither, perceptual interpolation (option)
- [ ] Mesh Tool, Create Gradient Mesh (Object menu; rows×columns, appearance flat/to
      edge/to center, highlight)
- [ ] Gradient works as fill AND stroke (along/across stroke); reverse, opacity stops

## Already done (don't touch):
- Iterations through 8.2 inclusive (see CLAUDE.md "Reconciliation"): selection, shapes,
  Pen, drawing/cutting, text 5.1–5.3, organization 6.1–6.2, transforms 7.1–7.3,
  color 8.1 (Color panel, Picker, Eyedropper, Swatches, Document Color Mode),
  color 8.2 (Color Guide harmonies + variations, Recolor Artwork dialog with wheel)
- Color conversions — `src/canvas/operations/colorConvert.js` (hex/RGB/HSB/CMYK/Lab,
  gamut) — reuse, don't duplicate
- Harmony math — `src/canvas/operations/harmony.js` (harmonyColors/variationRow/
  nearestColor/toHsb/toHex) — reuse for any colour-generation need
- Style edits from panels — via `applyStyle` + `afterStyleEdit()` from
  `operations/swatchOps.js` (redraw + notify + bump)
- Colour selection extraction — `operations/recolor.js` (collectColors) — reuse if a
  future feature needs to walk the selection's colours

## Don't touch:
- Anything not in the list above
- Later iterations

## Notes for 9.1:
- Paper.js DOES support gradients natively (`new paper.Gradient`, `GradientStop`,
  `Color({ gradient, origin, destination, radial })`) — but NOT conical/angular; that
  will need a custom render (like width envelopes / arrowheads pattern) or a raster fill.
- Gradient Mesh has no Paper.js primitive — it's a real subsystem (a lattice of colour
  patches). Budget it as the heavy item; consider a v1 that approximates (e.g. a grid of
  blended paths) if a full mesh is too big for one iteration.
- The on-canvas gradient annotator is another overlay widget — follow the pattern of the
  Free Transform quad / Puppet Warp pins (draw immediately in the tool factory, redraw on
  view change).

## Plan additions from Illustrator 2024–2026 research (fold into CLAUDE.md during plan polish):
- **New tools missing from the plan:** Objects on Path (v29.0, 2025) → phase 7/11;
  Intertwine (Make/Edit/Release) already in 11.3.
- **Dimension tool** (v28.3): v1 done in 7.2; full Linear/Angular/Radial + a Dimensions
  layer → finish at 13.x.
- **Contextual Task Bar** — build a shared registry "command → menu/Properties/Task
  Bar/widget" at 20.2.
- **Phase 18 (AI) split into tracks:** 18.0 architecture → generation → editing (incl.
  Generative Recolor — note it reuses 8.2's Recolor) → text → Mockup → AI Assistant.
- **Transform Each** Relative/Absolute (2026) — ours is a prompt stub, account for it in 15.x.
- **Blending modes:** canonical 16 confirmed — for 11.1.

## Context:
- Stack: Vite + React + Paper.js
- Tools: src/canvas/tools/
- Each tool = a separate file
- All UI strings via t('key') — no hardcoding
- No console.log in production
