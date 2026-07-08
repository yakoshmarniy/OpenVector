# Current task: iteration 9.2 — Stroke, Appearance, Graphic Styles

> Phase 9.1 (Gradients + Mesh) is done, sessions 31–32.

## To do:
- [ ] Full **Stroke panel** (Window > Stroke): width, cap, join, miter limit, dashes (dash/gap
      pairs), align stroke (center/inside/outside), variable width profiles, arrowheads with
      INDEPENDENT start/end scale, "Corners" (Adobe: scale corners with dashes). Much stroke
      logic already exists in Properties / `itemStyle.js` / `widthProfile.js` / `arrowheads.js`
      — this promotes it into a proper panel and adds align-stroke + independent arrow scale.
- [ ] **Appearance panel** (Window > Appearance): multiple fills and strokes per object, each
      its own colour/opacity/blend, reorderable; add/remove fill/stroke rows; live edit.
- [ ] **Graphic Styles panel** (Window > Graphic Styles): save the current object's appearance
      as a named style, apply to a selection, default library, thumbnails.

## Already done (don't touch):
- Iterations through 9.1 inclusive (see CLAUDE.md "Reconciliation").
- Stroke basics — `operations/itemStyle.js` (cap/join/dash/lineType), Properties stroke-detail
  block, arrowheads `operations/arrowheads.js` (companion triangles), variable width
  `operations/widthProfile.js` (envelope). REUSE — the Stroke panel wraps these.
- Gradients + Mesh (sessions 31–32) — `operations/gradients.js`, `operations/mesh.js`,
  `tools/gradientTool.js`, `tools/meshTool.js`, panels/dialog. Multiple-fill Appearance may
  need to coexist with gradient/mesh fills — keep that in mind.
- Companion-item pattern (ownerId/locked/insertAbove, rebuilt in `selection.drawOverlay`
  + `applyStyle`, in `isTransientItem`, cleared on delete) — arrowheads / width envelope /
  conic fan / mesh.
- Panels live in the right side-col (Window > … toggles); pattern: `Panels/*.jsx` + Window menu
  item + App open-state + gradientOpen/colorGuideOpen threading through MenuBar.
- Style edits — `applyStyle` + `afterStyleEdit()` (`operations/swatchOps.js`).

## Don't touch:
- Anything not in the list above
- Later iterations

## Notes for 9.2:
- Appearance with MULTIPLE fills/strokes has no Paper primitive on a single Path — model it as
  `item.data.appearance = { fills:[...], strokes:[...] }` and render extra fills/strokes as
  companion items (the arrowheads/mesh pattern), or as a Group of stacked clones. Decide early;
  it interacts with gradient/mesh fills (which are already companions).
- Graphic Styles = serialise the appearance model (+ base stroke/fill/opacity/effects later) to
  a named preset in a store (like swatches in `state/colors.js`); apply = write it onto the
  selection via applyStyle + the appearance model.
- Align-stroke inside/outside on an arbitrary path ≈ Offset Path on the stroke outline
  (`paperjs-offset` is already a dep, used by Outline Stroke / Offset Path).
- New floating panels follow the overlay/panel patterns from sessions 29–32 (side-col aside,
  Window menu toggle, App open-state, subscribe to selection + document stores).

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
