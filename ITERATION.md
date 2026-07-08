# Current task: iteration 9.1b — Gradient Mesh (Mesh Tool + Create Gradient Mesh)

> 9.1 was split (user directive, session 31): gradients first (done), Mesh next.

## To do:
- [ ] Mesh Tool: click a filled object to add mesh points forming a lattice of colour
      patches; select a patch/point, edit its colour (Color panel / picker)
- [ ] Create Gradient Mesh (Object menu): dialog Rows × Columns, Appearance
      (Flat / To Edge / To Center), Highlight %
- [ ] Mesh follows transforms (move/scale/rotate); works with selection + Layers

## Already done (don't touch):
- Iterations through 9.1a inclusive (see CLAUDE.md "Reconciliation").
- **Gradients (9.1a, session 31)** — `src/canvas/operations/gradients.js` (linear/radial
  native, conic wedge-fan companion; `applyGradient`/`getGradient`/`readGeometry`/
  `refreshGradientFill`/`clearGradient`; perceptual interpolation via `renderStops`).
  REUSE for mesh colour sampling / patch fills. Gradient Tool `tools/gradientTool.js`
  (annotator overlay pattern), panel `Panels/GradientPanel.jsx`, Window > Gradient.
- Companion-item pattern (ownerId/locked/insertAbove, rebuilt in `selection.drawOverlay`
  + `applyStyle`, in `isTransientItem`, cleared on delete) — arrowheads / width envelope /
  conic fan. A mesh raster (if chosen) follows the same wiring.
- Color conversions — `operations/colorConvert.js`; style edits — `applyStyle` +
  `afterStyleEdit()` (`operations/swatchOps.js`).

## Don't touch:
- Anything not in the list above
- Later iterations

## Notes for 9.1b:
- Paper.js has NO mesh primitive. A real gradient mesh is a Coons-patch lattice; a v1 that
  supports a grid of points with per-point colours and bilinear-interpolated patches is a
  reasonable first cut.
- Rendering a bilinear-blended quad: either subdivide each patch into many flat-shaded
  micro-quads (the conic fan already proves this reads smooth) or render to an offscreen
  canvas → Raster clipped to the shape. Prefer vector patches if feasible.
- Store the mesh model in `item.data.mesh = { rows, cols, points:[[{x,y,color}]] }` and
  rebuild the companion via the established refresh hook.
- The Mesh Tool overlay follows the Gradient Tool / Free Transform pattern (draw the widget
  immediately in the factory, redraw on `onViewChange`).

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
