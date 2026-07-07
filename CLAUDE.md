# OpenVector

Open-source vector editor — a free alternative to Adobe Illustrator.
Target audience: designers who need a free Illustrator alternative.
GitHub: https://github.com/yakoshmarniy/OpenVector  ·  License: MIT

> ⚠️ The canonical remote is **yakoshmarniy** (see "Git & releases"). The original plan
> text referenced `koshmrniy/OpenVector` — that's a 404, do not use it.

> 📝 **Docs language rule (user directive, 2026-07-07):** ALL project documents
> (CLAUDE.md, ITERATION.md, `_claude-notes/` checkpoints, future README/docs) are written
> in **English** — Cyrillic tokenizes ~1.5–2× more expensively, and CLAUDE.md is loaded
> into context every session. Chat with the user stays in Russian.

---

## Stack

- **Vite** — build
- **React** — UI (functional components + hooks)
- **Paper.js** — vector graphics on canvas
- **i18next** — internationalization (EN default, RU, extensible)
- **WebSocket** — collaboration (phase 19.2)
- **Electron** — desktop (phase 19.3, not now)

---

## UI map

```
┌──────────────────────────────────────────────────────────┐
│ MENU BAR: File Edit Object Type Select Effect View Window │
├──────────────────────────────────────────────────────────┤
│ CONTROL BAR (contextual for the active tool/object)      │
├──────┬───────────────────────────────────────┬───────────┤
│ TOOL │                                       │PROPERTIES │
│ BAR  │            CANVAS                      │ + PANELS  │
│      │        (canvas + artboards)           │ (Layers,  │
│ Fill │                                       │  Color,   │
│Stroke│       [Contextual Task Bar]           │  Swatches │
│Modes │                                       │  …)       │
├──────┴───────────────────────────────────────┴───────────┤
│ STATUS BAR: zoom | units | artboard | info               │
└──────────────────────────────────────────────────────────┘
```

---

## Development plan (20 phases)

**The authoritative plan.** Numbering: **Phase.Iteration** (e.g. 3.2 = phase 3, second
iteration). One iteration = one prompt = a manageable chunk per session. Claude takes ONE
iteration, implements its items, commits, updates status, stops. Do not start the next
iteration without an explicit request. The order of items within an iteration may be
changed if it makes more sense.

> The checklists below are the task list. **The actual completion state right now** is in
> "Current status → Reconciliation with the 20-phase plan". To avoid double bookkeeping,
> the checkboxes in the plan itself are left empty.

Map: iterations 1–7 → working MVP · 8–14 → Illustrator parity ·
15–17 → professional level · 18–20 → AI, plugins, collaboration, release.

### PHASE 1 — Skeleton and canvas

**1.1 — App layout**
- [ ] Window structure: Menu Bar, Control Bar, Toolbar, Canvas, Properties, Status Bar
- [ ] Dark theme, base styles, panel scaffolding (empty for now)
- [ ] Status Bar: fields for zoom, units, active artboard

**1.2 — Canvas and navigation**
- [ ] Full-screen canvas (Paper.js)
- [ ] Zoom (wheel), panning (space+drag), Rotate View
- [ ] Rectangle Tool (drag to draw) — sanity check that the engine works
- [ ] Contextual Task Bar (pops up under the selection)

### PHASE 2 — Selection and Toolbar

**2.1 — Toolbar and selection tools**
- [ ] Toolbar: one/two columns, drawer with all tools, grouping (long-press → nested)
- [ ] Selection, Direct Selection, Group Selection
- [ ] Magic Wand, Lasso
- [ ] Hand, Zoom

> Lasso is ONE tool (freehand anchor-point selection), as in Illustrator. No other variants
> exist or are planned: Polygonal/Magnetic Lasso is Photoshop (raster), outside vector parity.

**2.2 — Bounding box and mouse transforms**
- [ ] Bounding box: scale, rotate, Reset Bounding Box
- [ ] Reference Point selector (9 positions)
- [ ] Modifiers: Shift (proportions/45°), Alt (from center / copy on drag)
- [ ] Arrow-key nudge (configurable step), Transform Again
- [ ] Drawing Modes (Normal/Behind/Inside), Screen Modes (F key)

### PHASE 3 — Shapes

**3.1 — Primitives**
- [ ] Rectangle, Rounded Rectangle, Ellipse, Polygon, Star, Line, Arc, Spiral, Flare
- [ ] Live shapes (on-canvas widgets, corner rounding)

> There is no separate "Rounded Rectangle" tool: every rectangle is live, corners are
> rounded with an on-canvas widget (see session 16). The duplicate tool was removed (session 17).

**3.2 — Fill and stroke**
- [ ] Color fill
- [ ] Stroke (color, width, type, caps, joins, dashes, arrowheads)
- [ ] Transparency / Opacity

### PHASE 4 — Pen and drawing

**4.1 — Pen and curves**
- [ ] Pen Tool, Add/Delete/Convert Anchor Point, Curvature Tool

**4.2 — Freehand drawing and cutting**
- [ ] Pencil, Smooth, Path Eraser, Join, Paintbrush, Blob Brush, Shaper
- [ ] Eraser, Scissors, Knife
- [ ] Rectangular/Polar Grid Tools

### PHASE 5 — Text

**5.1 — Type Tools**
- [ ] Point, Area, on a Path, Vertical (all variants), Touch Type

**5.2 — Fonts**
- [ ] System fonts, .ttf/.otf upload, Google Fonts, manager, previews
- [ ] Retype (recognize a font from an image)

**5.3 — Typography**
- [ ] Character panel (size, kerning, tracking, baseline shift, leading)
- [ ] Paragraph panel (alignment, indents, spacing)
- [ ] Create Outlines, Find Font, Change Case, Smart Punctuation
- [ ] Threaded Text, Text Wrap, Show Hidden Characters, Fit Headline
- [ ] Tabs, Glyphs panels

### PHASE 6 — Object organization

**6.1 — Order, groups, layers**
- [ ] Arrange (Bring to Front/Back, Forward/Backward)
- [ ] Align panel (alignment + Distribute; objects/canvas/artboard)
- [ ] Group/Ungroup, Lock/Unlock, Hide/Show
- [ ] Isolation Mode (double-click, breadcrumbs, dimming)
- [ ] Layers panel (create, delete, rename, hide, lock, sublayers, drag between layers)

**6.2 — Pathfinder and path operations**
- [ ] Pathfinder panel (Add, Subtract, Intersect, Exclude, Divide, Trim, Merge, Crop, Outline)
- [ ] Shape Builder Tool
- [ ] Compound Path (Make/Release)
- [ ] Path ops: Join, Average, Outline Stroke, Offset Path, Simplify, Split Into Grid, Clean Up

### PHASE 7 — Transforms and distortion

**7.1 — Basic transforms**
- [ ] Transform panel (X, Y, W, H, angle, shear, Scale Strokes & Effects)
- [ ] Rotate, Reflect (+ Flip H/V), Scale, Shear, Reshape, Transform Each (Relative/Absolute)
- [ ] Free Transform (+ Perspective Distort, Free Distort, Constrain)

**7.2 — Distortion and width**
- [ ] Puppet Warp (black/white pins, min. 3, Show Mesh, Rotate pin, Select All Pins)
- [ ] Width Tool, Variable Width Profiles
- [ ] Dimension Tool, Measure Tool

**7.3 — Liquify**
- [ ] Warp, Twirl, Pucker, Bloat, Scallop, Crystallize, Wrinkle
- [ ] Options: Width/Height, Intensity, Simplify, Twirl Rate, Detail, Complexity, Brush Affects Anchor Points / In-Out Tangent Handles

### PHASE 8 — Color

**8.1 — Base color and Swatches**
- [ ] Color panel (RGB/HSB/CMYK/Hex/Lab), Color Picker (preview, out-of-gamut)
- [ ] Eyedropper
- [ ] Swatches panel: Global Colors, Spot Colors, Pantone (TPX/TCX, Coated/Uncoated), Color Books
- [ ] Create Swatch from an image (Object Mosaic), Create Swatch Info
- [ ] Document Color Mode (RGB/CMYK)

**8.2 — Harmonies and Recolor**
- [ ] Color Guide: Harmony Rules (Complementary, Monochromatic, Triad, Analogous, High Contrast, Pentagram), variations (Tints/Shades, Warm/Cool, Vivid/Muted)
- [ ] Recolor Artwork (full dialog): Harmony Rules, base color, Link/Unlink, order/saturation randomization, Add/Remove Color, library constraint
- [ ] Color wheels: smooth / segmented / color bars; H/S/B sliders

### PHASE 9 — Gradients, stroke, styles

**9.1 — Gradients and Mesh**
- [ ] Gradient panel + Gradient Tool: linear, radial, conical
- [ ] Gradient presets, dither, perceptual interpolation
- [ ] Mesh Tool, Create Gradient Mesh

**9.2 — Stroke, Appearance, styles**
- [ ] Stroke panel (full: width profiles, independently sized arrowheads)
- [ ] Appearance panel (multiple fills/strokes per object)
- [ ] Graphic Styles panel (save/apply a set)

### PHASE 10 — Effects

**10.1 — Architecture and Stylize**
- [ ] Raster vs vector effects, Document Raster Effects Settings (dpi), editing via Appearance, Apply Last Effect
- [ ] Stylize: Drop Shadow, Inner/Outer Glow, Feather, Round Corners, Scribble (options), Add Arrowheads

**10.2 — Warp and Distort**
- [ ] Warp: Arc, Arch, Bulge, Shell, Flag, Wave, Fish, Rise, Fisheye, Inflate, Squeeze, Twist
- [ ] Distort & Transform: Free Distort, Pucker & Bloat, Roughen (Smooth/Corner, Detail), Transform, Twist, Zig Zag (Relative/Absolute, Ridges)
- [ ] Effect > Pathfinder (live), Convert to Shape, Offset Path (as an effect)

**10.3 — 3D, Photoshop, SVG**
- [ ] 3D and Materials: Extrude & Bevel, Revolve, Inflate, Rotate, Materials
- [ ] Photoshop Effects: Artistic, Blur, Brush Strokes, Distort, Pixelate, Sketch, Stylize, Texture
- [ ] SVG Filters + SVG Interactivity panel

### PHASE 11 — Special techniques

**11.1 — Masks, Blend, Live Paint**
- [ ] Clipping Mask (Make/Release/Edit), Opacity Mask
- [ ] Blend Tool (Make/Release/Expand, Blend Options)
- [ ] Live Paint (Bucket, Selection, Make/Merge/Release/Gap Options/Expand)
- [ ] Blending Modes (Transparency panel: all 16 + Isolate Blending, Knockout)

**11.2 — Symbols and brushes**
- [ ] Symbols: panel + Symbol Tools (Sprayer/Shifter/Scruncher/Sizer/Spinner/Stainer/Screener/Styler)
- [ ] Symbol Options: Dynamic/Static, Registration Point, 9-Slice Scaling, Break Link, Replace, Redefine, Reset Transformations
- [ ] Brushes: panel + 5 types (Calligraphic, Scatter, Art, Pattern, Bristle)
- [ ] Brush architecture: parameter-only vs object-based, Base Object, Colorization Method, Apply/Leave Strokes, Brush Libraries

**11.3 — Patterns, Repeat, Envelope, Perspective**
- [ ] Pattern Options (Tile Types: Grid, Brick, Hex), pattern as fill/stroke
- [ ] Intertwine (Make/Edit/Release)
- [ ] Repeat: Radial, Grid, Mirror (widgets, instances, spacing, Expand)
- [ ] Envelope Distort (Warp/Mesh/Top Object, Edit/Release)
- [ ] Perspective Grid + Selection Tool

### PHASE 12 — Images and tracing

**12.1 — Raster placement**
- [ ] Place (insert raster/SVG), Links panel
- [ ] Crop Image, Rasterize, Create Object Mosaic

**12.2 — Image Trace**
- [ ] Image Trace (Make/Expand/Release) + panel (threshold, colors, detail, paths, corners, presets)

### PHASE 13 — Artboards, grids, navigation

**13.1 — Artboards**
- [ ] Artboard Tool: multiple artboards, rename (incl. bulk), resize, duplicate, Fit to Artwork, Rearrange, Artboards panel

**13.2 — Grids, guides, snapping**
- [ ] Rulers, Guides (Make/Lock/Clear/from Object, Lines/Dots style, color), Smart Guides
- [ ] Snapping: to Grid, Pixel, Point, Glyph, Tangent; limit to active artboard; tolerance

**13.3 — View modes**
- [ ] Preview/Outline (Ctrl+Y), Pixel Preview, Overprint Preview, Transparency Grid
- [ ] Show/Hide: Bounding Box, Edges, Text Threads, Gradient Annotator
- [ ] Navigator, Info panels; New View, New Window (dual-monitor)

### PHASE 14 — Files, export, print

**14.1 — Opening and saving**
- [ ] File: New (+ from template), Open/Recent, Save/Save As/Save a Copy, Revert, start screen, document tabs
- [ ] Import/open: SVG, PNG, JPG, TIFF, PDF, EPS, best-effort .ai; drag&drop into the window

**14.2 — Raster and SVG export**
- [ ] Export As: PNG, JPG, TIFF, BMP, GIF, WebP; Export for Screens; Export Selection
- [ ] SVG export (full): Minify, Presentation Attributes/Inline/Internal CSS, Object IDs, decimal precision, responsive, global swatches → CSS variables, Use Artboards
- [ ] Save as PDF, EPS; Package
- [ ] Web: Slices (+ URL), Image Maps, rollover, SVG Interactivity

**14.3 — Prepress**
- [ ] Bleed, Trim/Crop/Registration Marks, Overprint Preview/Fill/Stroke, Separations Preview, Ink Manager
- [ ] Color Management: Assign/Convert Profile, Color Settings, Flattener Preview, Transparency Flattener Presets, Proof Setup/Colors, Gamut Warning

### PHASE 15 — Menus, settings, workspace

**15.1 — Edit and Select menus**
- [ ] Edit: Cut/Copy/Paste (+ in Place, in Front/Back, on All Artboards), Find/Replace, Check Spelling, Define Pattern, Edit Colors (Adjust/Saturate/Desaturate/Invert/Convert Grayscale)
- [ ] Select: All/Deselect/Reselect/Inverse, Same (Fill/Stroke/Opacity/Mode), Object (Text/Masks/Stray Points), Save Selection, Above/Below

**15.2 — Preferences**
- [ ] 15 sections: General (Keyboard Increment, Constrain Angle, Corner Radius, Anti-aliasing, Reset), Selection & Anchor Display, Type, Units & Undo, Guides & Grid, Smart Guides, Slices, Hyphenation (+ user dictionary), Plug-ins & Scratch Disks, User Interface (theme, brightness, UI scale), Performance (GPU), File Handling & Clipboard, Appearance of Black, Devices
- [ ] Search Preferences (Ctrl+K → straight to search)
- [ ] Keyboard Shortcuts (customization, set export/import)

**15.3 — Workspace and input**
- [ ] Workspace (save/switch/reset, presets), Control Bar, Properties Panel, Discover Panel
- [ ] Units (px/pt/mm/cm/inch), Document Setup, metadata, ICC profiles
- [ ] Control/input: context menu, multi-touch, graphics tablet (pressure/tilt)
- [ ] Panel behavior: float/dock, Tab/Shift+Tab, fullscreen, layout persistence, Application Frame

### PHASE 16 — Automation

**16.1 — Actions and Graphs**
- [ ] Actions panel (record, playback, batch, Delete Unused Panel Items)
- [ ] Scripts (.jsx support)
- [ ] Graph Tool (9 types: Column, Stacked Column, Bar, Stacked Bar, Line, Area, Scatter, Pie, Radar)
- [ ] Graph Type Options (Value/Category axes, Drop Shadow, Legend, Column/Cluster Width), Graph Data, Graph Design

**16.2 — Variables / Data Merge**
- [ ] Variables panel: types (Text @, Linked File, Graph %, Visibility #)
- [ ] Capture Data Set, Save/Load Library (XML), batch output, CSV import

### PHASE 17 — East Asian typography (CJK)

**17.1 — Japanese composition: basics**
- [ ] Show East Asian Options, Composite Fonts (Kanji/Kana/Roman/Number/Punctuation)
- [ ] Tsume, Aki, Mojisoroe
- [ ] Mojikumi (JIS X 4051 presets: YakumonoHankaku, GyomatsuYakumono*, TsumeGumi, BetaGumi; custom Basic/Detailed/Stretched)
- [ ] Kinsoku (Hard/Soft, Push In/Out First/Out Only, Bunri-Kinshi, Burasagari, custom)

**17.2 — Special features and OpenType**
- [ ] Tate-chu-yoko, Warichu, Ruby/Furigana, Kenten, Shatai, Kurikaeshi
- [ ] OpenType panel (Ligatures Standard/Discretionary/Contextual, Swash, Stylistic Alt/Sets, Titling, Figure types, Position, Ordinals, Fractions, Proportional/Tabular Metrics)

### PHASE 18 — AI (user-provided keys)

**18.1 — Connection and generation**
- [ ] AI Integration: key manager (6 providers), Test, model selection, usage indicator, "keys stay on device"
- [ ] Generation: Text to Vector (+ Style Reference, editable text), Generative Shape Fill, Generative Expand, Generate Pattern/Palette/Variations/Icon Set/Background

**18.2 — Processing and smart UI**
- [ ] Processing: AI Image Trace, Remove Background, Auto-colorize, Style Transfer, Auto-simplify, Smart Crop Marks, AI Retype
- [ ] Smart UI: Natural Language Commands, AI Suggestions, Auto-align, Smart Duplicate, Discover Panel

### PHASE 19 — Platform: plugins, collaboration, desktop

**19.1 — Plugins**
- [ ] Plugin API + Manager (install from .zip/GitHub URL, sandbox, documentation)

**19.2 — Collaboration**
- [ ] WebSocket: real-time cursors, comments, change history, Share link, Cloud Documents

**19.3 — Electron (desktop)**
- [ ] Native menu, open/save via dialogs, file drag&drop, auto-update

### PHASE 20 — Performance, redesign, release

**20.1 — History and performance**
- [ ] Undo/Redo (100 steps, history, crash recovery, autosave, backups)
- [ ] Large-file optimization, lazy rendering, GPU acceleration

**20.2 — Redesign**
- [ ] UI redesign, light theme, custom themes, icons, animations, responsiveness

**20.3 — Release**
- [ ] All keyboard shortcuts (Illustrator-compatible), onboarding
- [ ] README, CONTRIBUTING.md, CODE_OF_CONDUCT.md, website, Product Hunt

---

## AI model — implementation details

The user enters their API key in Settings > AI Integration. The key is stored **ONLY locally** (localStorage in the browser, electron-store on desktop). OpenVector never sees user keys.

Requests go directly: user's device → provider API (OpenAI / Anthropic / etc.)

This is stated explicitly in the UI and in the README — it matters for trust.

**AI Integration page UI:**
- A field per provider (Anthropic, OpenAI, Gemini, Stability, Replicate, Fal.ai)
- "Test" button — verify the key works
- Status indicator (active / not set / error)
- Model selection per task type
- Token usage indicator (if the API returns it)
- Warning: "Keys are stored only on your device"

**Supported APIs (user's choice):**
- Anthropic (Claude) — text commands, SVG generation
- OpenAI (GPT-4o / DALL-E) — generation, text commands
- Google Gemini — GPT alternative
- Stability AI — image generation
- Replicate — access to open-source models
- Fal.ai — fast and cheap generation

---

## Folder structure

```
OpenVector/
├── CLAUDE.md              ← this file, read at the start of every session
├── package.json
├── vite.config.js
├── index.html
├── public/
└── src/
    ├── main.jsx           ← entry point
    ├── App.jsx            ← root component
    ├── canvas/            ← all Paper.js logic
    │   ├── tools/         ← each tool in its own file
    │   ├── operations/    ← booleans, transforms, path ops
    │   └── effects/       ← effects, filters (phase 10)
    ├── components/
    │   ├── Toolbar/       ← left tool rail
    │   ├── Properties/    ← right contextual panel
    │   ├── Panels/        ← floating panels (Layers, Color, Swatches…)
    │   ├── MenuBar/       ← top menu
    │   ├── ControlBar/    ← contextual bar under the menu
    │   ├── StatusBar/     ← bottom bar
    │   ├── Canvas/        ← canvas wrapper
    │   └── AIPanel/       ← AI tools (phase 18)
    ├── state/             ← global state, history (undo/redo)
    ├── i18n/              ← EN and RU translations
    ├── plugins/           ← plugin system (phase 19)
    └── styles/            ← global styles, themes
```

> Actual tree state right now: `canvas/{tools,operations}`,
> `components/{MenuBar,ControlBar,Toolbar,Properties,Panels,Canvas,StatusBar,FontPicker,FontsDialog,FindFontDialog}`,
> `styles/`, `state/` (`fonts.js`, `selection.js`, `document.js` — sessions 19/22),
> `Panels/` (LayersPanel — session 22).
> `effects/`, `AIPanel/`, `i18n/`, `plugins/` will appear with their phases.
> (The temporary `TopBar/` was removed — replaced by Menu Bar + Control Bar.)

---

## Code conventions

- Each tool is a separate file in `src/canvas/tools/`
- Components are functional, with hooks
- Styles — **CSS Modules** (session 1 decision, no extra dependencies)
- All UI strings go through `t('key')` — no hardcoding (once i18next is wired up)
- Commits in English: `feat:`, `fix:`, `refactor:`
- No console.log in production

---

## Git & releases

**EVERY change is committed and pushed to GitHub immediately, with a clear descriptive message.**
Standing user rule: don't accumulate edits. Any meaningful action — feature, bugfix,
refactor, tool removal, plan/docs edit — is its own commit + `git push origin main`
in the same pass, no separate confirmation. The commit message (English, present tense)
must clearly say WHAT was done: `feat: …`, `fix: …`, `refactor: …`, `docs: …`, `chore: …`.
Group into one commit only what is logically one action; different actions — different commits.
Tag `phase-X.Y` when an iteration is closed (see below).

**Every completed iteration is pushed to GitHub as a distinct feature.**
This is a standing user directive — no separate confirmation needed to push an iteration
(the preconditions below must hold).

Procedure (after the iteration is built with `npm run build` and verified in the browser):
1. One commit per iteration: `feat: phase X.Y — <short title>` (English).
   End the commit with the `Co-Authored-By: ...` trailer (as the harness requires).
2. `git push origin main`.
3. Tag the iteration: `git tag phase-X.Y -m "<title>"` → `git push origin phase-X.Y`.
4. If the iteration is partial — push what's ready, list the deferred items in the commit body.

**Tags — numbering history:**
- `iter-1`…`iter-8` — the very first plan (history).
- `np-1`…`np-5` — the "61 iterations" plan (history). np-5 = freehand drawing.
- `phase-X.Y` — the current 20-phase plan. Tag this way going forward.

**Preconditions (✅ satisfied 2026-06-20):**
- OpenVector is its own git repository (`.git` in the folder, branch `main`).
- Remote: `origin` → `git@github.com:yakoshmarniy/OpenVector.git` (SSH).
- Auth: SSH key `~/.ssh/id_ed25519` added to the `yakoshmarniy` account, push works.
- Uploaded: `main` + tags through `np-5`. From here on, push every iteration per the rule above
  (`GIT_SSH_COMMAND='ssh -o BatchMode=yes' git push`).

---

## Internationalization

- Default language: English
- Supported: EN, RU
- Library: i18next + react-i18next
- All UI strings via t('key') — no hardcoded strings in components

---

## Current status

### Session 1 — progress (✅ done)

- [x] 1. Folder structure created (exactly as in this file)
- [x] 2. Vite + React initialized
- [x] 3. Paper.js wired up
- [x] 4. Basic full-screen canvas, dark background
- [x] 5. Zoom (wheel) and panning (space + drag)
- [x] 6. Rectangle tool (drag to draw a rectangle)
- [x] 7. Minimal left toolbar (Select, Rectangle)

Styling decision: **CSS Modules** (no extra dependencies).
i18next not wired up yet — it's a separate checklist item, out of this session's scope.

Run: `npm install` → `npm run dev`. Build: `npm run build` (verified, passes).

Session 1 notes / decisions:
- Tool IDs extracted to `src/canvas/tools/toolIds.js` — otherwise a circular import
  (App ↔ Toolbar/Canvas) hits TDZ and the app fails to mount.
- Mouse coordinates come from `clientX/Y − rect` of the canvas, not `offsetX` — the
  mousemove/mouseup listeners sit on `window` so a shape can be dragged beyond the canvas.
- StrictMode is disabled in `main.jsx`, otherwise `paper.setup()` runs twice.
- Select does the minimum: click to select, drag to move. No scale/rotate.

### Session 2 — progress (✅ done)

Scope agreed with the user: shape transforms + new tools.

- [x] Handle markers on the selected shape (8 of them) — mouse resizing
- [x] Modifiers: Shift while drawing = square/circle; Shift while resizing = proportions;
      Shift for a line = angle snapped to 45°
- [x] Delete/Backspace — delete selection; Escape — deselect
- [x] Hover cursors (resize over a handle, move over a shape)
- [x] Ellipse tool (ellipse/circle, by drag)
- [x] Line tool (line, by drag)

Session 2 notes / decisions:
- The selection overlay (frame + 8 handles) lives in `src/canvas/operations/selection.js`,
  tagged `data.isSelectionOverlay` and `locked` → excluded from hit-testing and (later) export.
  Handles keep a constant screen size (`8px / zoom`), redrawn on zoom.
- **Canvas size fix**: Paper writes inline `width/height` onto `<canvas>`, so an early
  measurement (before CSS modules applied) froze the height at 150px.
  Solution — a `.stage` wrapper + `ResizeObserver` on it (not on the canvas itself,
  otherwise feedback loop). See `Canvas.jsx`.
- Resize goes through `item.bounds`; axis-degenerate shapes (horizontal/vertical lines)
  with a zero side don't resize (division-by-zero guard) but do move.

### Session 3 — progress (✅ done)

Scope agreed with the user: right-hand properties panel.

- [x] `components/Properties/` component — right panel, always visible
- [x] For the selected shape: fill (color + on/off), stroke (color + on/off),
      stroke width, opacity (0–100% slider)
- [x] Two-way binding: selection → panel reads style; panel edit → shape updates
- [x] "Nothing selected" empty state when nothing is selected

Session 3 notes / decisions:
- Bridge between Paper selection and React: `selection.js` takes `onChange` →
  `selectTool(ctx)` → `Canvas` forwards `onSelectionChange` to App. App keeps a ref
  to the paper item and a style snapshot in state. Notifications fire only on selection
  change (not on move/resize).
- Style read/write — `src/canvas/operations/itemStyle.js` (`readStyle`/`applyStyle`),
  so App doesn't touch paper directly. Colors via `color.toCSS(true)` → hex for `input[type=color]`.
- With fill/stroke toggled off, the last picked color is kept in state (the swatch
  doesn't reset to default).
- `Canvas.onKeyDown` got a guard: if focus is in an `<input>`/`<textarea>`, shortcuts
  (Space/Delete/Backspace) are ignored — otherwise typing in panel fields broke.

### Session 4 — progress (✅ done)

Scope agreed with the user: Pen Tool (Bézier curves).

- [x] Pen tool: click — corner point, click+drag — smooth point (mirrored handles)
- [x] Close the path by clicking the first point; Enter/Escape — finish an open path
- [x] Live preview (rubber-band curve to the cursor) + point markers
- [x] Closed path → fill+stroke; open → stroke only
- [x] Pen paths fully work with Select (move/resize) and the properties panel

Session 4 notes / decisions:
- **Important Paper.js bug**: assigning a color as a *string* (`item.fillColor = '#...'`)
  stores it lazily; a second color assignment before a render throws
  `Cannot create property '_canvasStyle' on string`. In headless preview RAF is throttled,
  so the path doesn't render between operations and the bug fires. Solution — everywhere in
  penTool wrap colors in `new paper.Color(css)` (the `color()` helper).
  (Other tools didn't crash because their shapes render before the color is edited again.)
- Pen is a stateful tool (multi-click), unlike drag-once tools. Path state lives in the
  `createPenTool` closure; `finish()` nulls `path` (on close/Enter/Escape/deactivate).
- Pen overlays (points, rubber-band) are tagged `data.isPenOverlay` + `locked`, removed in finish.

### Session 5 — progress (partially done)

Scope: iteration 5 "Text". The core is done, two complex sub-features deferred.

- [x] Text tool: point text (click) and area type (drag frame), on-canvas editing
- [x] Caret, typing chars/space/Enter/Backspace, Escape/tool switch = commit, empty text is discarded
- [x] Word wrap inside the area frame
- [x] Panel: alignment (L/C/R), font size, line spacing
- [x] Text works with Select (move) and the panel (color = fill)
- [x] Selection overlay redraws after panel edits (refreshSelection)
- [x] Editing text after placement: double-click on text (from any tool) → edit
- [x] Illustrator-style left rail: similar tools grouped into one slot with a flyout
      (Rectangle/Ellipse/Line); the slot remembers the last pick. Top bar — brand only,
      tools are NOT duplicated top and side
- [ ] Type on a Path — deferred (iteration 5b)
- [ ] Letter spacing — deferred (iteration 5b)

Session 5 notes / decisions:
- Paper.js can NOT do area-wrapping/type-on-path/letter-spacing. We wrap ourselves:
  raw text in `item.data.rawText`, displayed text (with breaks) computed in
  `src/canvas/operations/textLayout.js` (`wrap`/`relayout`/`caretSegment`). Width measured
  with a temporary PointText.
- Editing — key capture (no overlay-textarea): zoom/pan-safe, integrated with Paper.
  Canvas checks `tool.wantsKeyboard()` → when true all keys (incl. Space) go to the tool, not pan.
- Text caret/frame overlays are tagged `data.isTextOverlay` + locked, cleaned on commit.
- Colors in text/caret — via `new paper.Color(...)` (see session 4 gotcha).
- **Session 5b — per-glyph text engine**: text is now a `paper.Group` of glyph `PointText`s
  (`data.glyph`), all state in `group.data` (rawText, mode point/area/path, fontSize, leading,
  tracking, justification, fillColor/strokeColor, origin, areaWidth/Height). `textLayout.js`:
  `relayout` lays out glyphs (char widths measured with an offscreen-canvas `measureText`),
  `layoutPath` places glyphs along a clone of the path (`getPointAt`/`getTangentAt` + rotation).
  This delivered tracking and type-on-path. Glyphs are in the group's LOCAL coordinates (origin),
  so moving via the matrix + re-relayout doesn't drift. `isTextItem` is now `data.isText`;
  `textEntity` lifts a glyph click to the group. Type on path: clicking a regular path with the
  Text tool → we clone the path into a hidden guide child, the original is untouched (safe on
  an empty commit).
- **Text hit-testing**: `paper.hitTest` on `PointText` is unreliable (only hits glyphs).
  Shared `pickItem(point)` in `selection.js`: first `hitTest` (shapes), then a text-region
  fallback `hitRegion(item)` (bounds ∪ area-text frame) — click anywhere on the text/frame.
  Used by Select, Text and dblclick. That's why text selects/moves/edits by click.
  For area text, `data.areaHeight` stores frame height (for the clickable empty part).
- Added a `refreshRef` bridge: after a style edit App calls `tool.refreshSelection()` →
  selection handles track text size / stroke width changes.
- Double-click on text: Canvas catches `dblclick` → `onEditText(item)` → App sets
  `pendingEditRef` + switches to Text → textTool starts editing in `consumePendingEdit()`.
  Clicking already-edited text is a no-op (doesn't commit/create new).
- Icons + tool list extracted to `src/components/toolItems.jsx` (single source).
- App layout is columnar: `TopBar` (brand only) on top, below it the `.app-body` row
  (rail/canvas/panel).
- `Toolbar` groups tools (`GROUPS`): a multi-slot shows a representative (last picked),
  the corner triangle opens a flyout popover with all variants. Closes on click outside
  the rail or Escape. No more tool duplication up top.

### Session 6 — progress (✅ done)

Scope: iteration 6 — grouping + boolean operations.

- [x] Multi-selection in `selection.js` (a `targets` array): Shift+click toggles, union frame
      + a thin frame per object; resize handles only with a single selection.
- [x] Marquee (drag a frame over empty space) → selects intersected objects; Shift adds.
      Implemented in `selectTool` (mode 'marquee', overlay rectangle). The main multi-select method.
- [x] `pickItem` maps a click to the top-level object (`topLevel`) → clicking part of a group picks the group.
- [x] `src/canvas/operations/booleans.js`: `groupItems`/`ungroupItems`/`booleanOp` (Paper native).
- [x] `selectTool.runAction(name)` (group/ungroup/unite/subtract/intersect/exclude); `actionRef` bridge App→Canvas→tool.
- [x] Contextual Properties panel: 0 — empty; 1 — style; 1 group — Ungroup; 2+ — "N selected" + Group + 4 booleans.
- [x] Shortcuts Cmd/Ctrl+G and Cmd/Ctrl+Shift+G in `Canvas.onKeyDown`.

Session 6 notes / decisions:
- `onSelectionChange` now passes an ARRAY of targets; App normalizes (item|null|array) and keeps `sel {count,isGroup,style}`.
- subtract = bottom minus the ones above (sorted by `item.index`). Booleans only on Path/CompoundPath (text/groups skipped).
- Ungroup only for plain groups (not `data.isText`).
- **Latent text fix**: text groups get `applyMatrix = false`, otherwise moves would "bake" into
  glyphs and relayout after move would reset position. Verified: move+edit keep position.

### Session 7 — progress (✅ done)

Scope: new iteration np-5 (per the "61" plan) = freehand drawing. In the new plan this is **phase 4.2** (partial).

- [x] Pencil, Smooth, Path Eraser, Join, Paintbrush, Blob Brush — 6 tools.
- [x] Shared helper `src/canvas/operations/freehand.js` (`col`, `overlayed`, `pathAt`, `createBrush`).
- [x] Pencil/Paintbrush — `createBrush` + `path.simplify`. Blob Brush — circle stamps → unite into a fill, merge overlaps.
- [x] Smooth — `path.simplify` (rounds/removes noise). Path Eraser — `splitAt` a range → gap. Join — reverse+addSegments / close.
- [x] Pushed, tag `np-5`.

Session 7 notes / decisions:
- Blob Brush: keep stamps as an ARRAY of circles directly in the layer, not in a Group — otherwise
  `clone({insert:true})` puts the clone inside the group, the boolean result lands in the group too,
  and `stamps.remove()` wipes the finished fill.
- Headless preview: `paper.view.update()` draws ONLY if the view is "dirty" (`_needsUpdate`). After
  edits via handlers the flag may already be cleared → update() is a no-op, screen and `getImageData`
  are empty. Force redraw: `layer.opacity=0.999; view.update(); layer.opacity=1; view.update();`.
  `requestAnimationFrame` does NOT fire in headless (an eval with RAF hangs 30s) — don't use it
  for force-redraw.

### Session 8 — progress (✅ done)

Scope: finish **phase 4.2** (20-phase plan). Also: CLAUDE.md rewritten for the 20-phase plan.

- [x] Eraser (`eraserTool.js`) — circle stamps → unite → subtract from overlapped closed paths.
- [x] Scissors (`scissorsTool.js`) — `pathAt` + `getNearestLocation` + `splitAt`. Open → 2 paths; closed → opens.
- [x] Knife (`knifeTool.js`) — freehand line; for each closed shape: knife chord between the outermost
      intersections + two boundary arcs → 2 closed pieces. Area is preserved, no leftovers.
- [x] Shaper (`shaperTool.js`) — recognition by area ratio (area/bbox): >0.82 rectangle,
      >0.62 ellipse, >0.38 triangle, thin gesture → line, otherwise a smoothed path.
- [x] Rectangular Grid (`rectangularGridTool.js`) — drag box → Group (frame + 4+4 dividers), Shift=square.
- [x] Polar Grid (`polarGridTool.js`) — drag box → Group (4 rings + 8 spokes), Shift=circle.
- [x] Toolbar: Shaper into the pencil group; Grid tools into the line group; new group Eraser/Scissors/Knife.

Session 8 notes / decisions:
- Knife: `getIntersections(target, knife)` gives CurveLocation with `.intersection` (point on the knife).
  `arcOf` extracts a boundary arc via clone+`splitAt` (like Path Eraser), `trimOpen` — the knife chord.
  `path.join(other, tol)` joins the arc with the chord and DELETES other. Pieces validated by `area>0.5`.
- Knife/Eraser cut only CLOSED paths (Path with `closed` / CompoundPath). Open strokes are skipped.
- Test gotcha (not code): `onMouseUp` does NOT add a final point (like all tools) —
  in synthetic knife tests drag `onMouseDrag` beyond the shape, otherwise one intersection → no cut.

### Session 9 — progress (✅ done)

Scope: **phase 5.1** finished — vertical text (all 3 variants) + Touch Type.

- [x] Vertical orientation in the engine (`textLayout.js`): `d.orientation`, `layoutVertical`
      (glyphs down a column, columns leftward — tategaki), `verticalColumns` (height-based wrap for area),
      vertical-on-path (glyph rotated by `tan.angle − 90`), vertical caret, hitRegion for vertical area.
- [x] `textTool.js` refactored into a shared `makeTextTool(ctx,{orientation})`; exports `createTextTool`
      (horizontal) and `createVerticalTextTool` (vertical). One vertical tool covers point/area/on-path
      by gesture — same as the horizontal Type. For vertical area, origin = top-right of the frame
      (columns go left).
- [x] Touch Type (`touchTypeTool.js`): click a glyph → its transform (drag=move, Shift=scale,
      Alt=rotate) is stored in `group.data.glyphFx[index]` and survives relayout.
- [x] Engine: a relayout post-pass sets `glyph.data.glyphIndex` and applies `glyphFx` (`applyGlyphFx`).
- [x] Toolbar: Type group = [Type, Vertical Type, Touch Type]. Icons added.

Session 9 notes / decisions:
- Per-glyph Touch Type: focus is not an overlay widget with handles (deferred) but move/scale/rotate
  via modifiers. fx applies in the relayout post-pass by `glyphIndex` (reading order, no spaces),
  so it's idempotent and doesn't drift on re-layout/move.
- The 3 vertical variants are NOT three separate tools but one Vertical Type (just as horizontal Type
  combines point/area/on-path by gesture). One Vertical Type button in the toolbar.
- Headless gotcha: after `location.reload()` the window collapses — re-run `preview_resize` +
  `dispatchEvent('resize')`, otherwise the screenshot is tiny (the view itself is already correct).

### Session 10 — progress (✅ done)

Scope: close the early gap in **phase 1.1** — Menu Bar + Control Bar (only a temporary TopBar existed).

- [x] `components/MenuBar/` — 8 menus (File/Edit/Object/Type/Select/Effect/View/Window), dropdowns,
      accelerators, separators, disabled items for future phases, check items (Snap, 2 columns).
      Closes on outside click/Escape, hover-switches between open menus.
- [x] `components/ControlBar/` — contextual strip under the menu: tool name + for 1 object
      inline Fill/Stroke/W/Opacity, for a group Ungroup, for 2+ align/Group/booleans.
- [x] `selectTool.runAction` extended: selectAll, deselect, duplicate, arrangeFront/Back/Forward/Backward.
      (Arrange is formally phase 6.1, but needed for a meaningful Object menu; trivial.)
- [x] Canvas: `viewRef` for view commands (zoomIn/Out/Fit/Actual, clear=New). Shortcuts Cmd/Ctrl+A
      (Select All, +Shift = Deselect) and Cmd/Ctrl+D (Duplicate).
- [x] App: `handleCommand` routes — view/document commands to Canvas via viewRef,
      selection commands to the active tool via actionRef. TopBar removed.

Session 10 notes / decisions:
- Selection commands (group/booleans/align/arrange/delete/selectAll/deselect) go through
  `actionRef → tool.runAction`, i.e. they work when Select is active (it holds the selection). On
  other tools the selection clears on switch — menu items are then disabled (by `sel`). This is
  honest and consistent with the architecture; a shared command bus comes later (phase 15.1).
- View commands (zoom/fit/clear) — in Canvas via `viewRef`, not through a tool (they're view/document level).
- Zoom Fit computes union bounds of all non-overlay objects, fits with a 60px margin, centers.

### Session 11 — progress (✅ done)

Scope: early gap of **phase 1.2** — Rotate View (canvas-view rotation).

- [x] `rotateViewTool.js` — drag rotates `paper.view.rotation` around the screen center; Shift = 15° steps.
      The angle is measured in SCREEN coordinates (`projectToView`), which are stable while the view rotates.
- [x] View menu: Rotate View 90° CW / 90° CCW / Reset Rotation → `viewRef` in Canvas.
- [x] Status Bar shows the rotation angle (normalized to (−180,180], hidden at 0°).
- [x] Toolbar: Hand group = [Hand, Rotate View, Zoom]. Icon added.

Session 11 notes / decisions:
- `paper.view.rotation` is supported; `viewToProject`/`projectToView` account for rotation, so
  ALL tools keep working with a rotated view (point round-trip verified).
- Rotation rotates ONLY the view; artwork in project coordinates is unchanged.
- App keeps `rotation` in state (via `onRotationChange`); a direct `paper.view.rotation=…` in tests
  doesn't update the status bar (test artifact, not a bug).

### Session 12 — progress (✅ done)

Scope: early gap of **phase 2.1** — Magic Wand, Lasso, drawer.

- [x] `magicWandTool.js` — clicking an object selects all with matching APPEARANCE: fill (color)
      AND stroke (color) AND stroke width (TOL=0.16 by RGB sum; WEIGHT_TOL=1px). Stroke is NOT ignored.
      Shift = add. Object selection via the shared `createSelection`.
- [x] `lassoTool.js` — a freehand loop selects ANCHOR POINTS inside (like Direct Selection, not the
      whole shape). Dragging a selected point moves all selected; Backspace/Delete deletes; Shift adds.
      Its own overlay (filled square = selected, hollow = not).
- [x] Drawer in `Toolbar` — the "⋯" button in the footer opens a panel with ALL tools (2-col grid,
      icon+label); clicking picks the tool and closes. Closes on click outside the rail / Escape.
- [x] Toolbar: Magic Wand and Lasso are separate slots after the selection group. Icons added.

Session 12 notes / decisions:
- **Feedback fix**: Lasso used to take the whole shape (center inside/intersection) — wrong.
  Now Lasso selects ANCHOR POINTS with the loop (freehand Direct Selection): `loop.contains(seg.point)`
  across all editable paths; selected points move/delete right in the tool. This is
  POINT selection — App.sel (object-level) is untouched, Properties shows "Nothing selected".
- **Feedback fix**: Magic Wand ignored stroke (matched fill only when fill existed).
  Now match = fill AND stroke (color) AND width. weightOf=0 when no stroke.
- Magic Wand holds an OBJECT selection (its own `createSelection`), reports to App; no move.
  Lasso is POINT-level, with its own overlay and its own point dragging.
- `.toolbar` got `position: relative` so the drawer positions relative to the rail.

### Session 13 — progress (✅ core of 2.2)

Scope: **phase 2.2** — core of mouse transforms (the tail deferred to 7.1).

- [x] Rotate by corner: dragging in the zone outside a corner handle rotates the selection around
      the frame center; Shift = 15° steps. `rotateZone(point)` + accumulated angle (`rotateApplied`)
      with no drift.
- [x] Alt+drag = copy: on move start with Alt we clone the targets and move the clones (originals stay).
- [x] Alt-resize = scale from center (symmetric); `computeResizeBounds` got an `alt` parameter.
- [x] Shift while moving = H/V constrain.
- [x] Arrow-key nudge (1px, Shift = 10px) — in `selectTool.onKeyDown` (arrows arrive via Canvas).

Session 13 notes / decisions:
- Rotation rotates the REAL geometry (`item.rotate(step, center)`); the selection frame stays
  AXIS-aligned (recomputed from bounds). Rotated bounding box (tilted frame) + Reset
  Bounding Box + Reference Point deferred — that's an overlay refactor, logical to do with the
  Transform panel (7.1).
- Rotate zone: a point outside the frame within an 8..26px ring from a corner; resize handles
  take priority.
- Verified: rotate 40° → bounds 115×110 (as computed); Alt-drag → 2 objects; Alt-resize → 140×100,
  center in place; Shift-move (50,20) → X only; nudge +1 then +10 = 11.

### Session 14 — feedback fixes (✅)

- [x] **Action buttons didn't work with Knife/Magic Wand.** Cause: commands (Group/Unite/Align/…)
      go to the ACTIVE tool's `runAction`, which only Select implemented. Logic extracted into
      `src/canvas/operations/selectionActions.js` (`runSelectionAction(selection, name)`) and wired
      to Select, Magic Wand, Knife. Now Properties/Control Bar/task-bar buttons and menu items
      work on any tool that holds an object selection.
- [x] **"The knife only scratches."** In fact the knife cuts correctly (2 closed pieces, areas
      exactly halves); it looked like a scratch because the halves sit flush. Knife now selects the
      pieces after the cut (immediately visible), and they can be pulled apart/grouped/booleaned.

> Architecture note: the shared `runSelectionAction` is a step toward a unified selection store,
> but selection still does NOT survive tool switching (that's still in 6.1 with layers). Lasso is
> point-level and doesn't participate in `runSelectionAction` (segments there, not objects).

### Session 15 — feedback fixes (✅)

- [x] **A boolean with an empty result destroyed shapes.** `booleanOp` with an empty/subpixel
      result (Intersect of non-overlapping, full mutual annihilation) deleted the originals and
      left a degenerate path (a "pixel"). Added `isDegenerate` → on an empty result the originals
      are NOT touched, return null (selection stays as it was). Verified: intersect of
      non-overlapping → null, 2 objects intact; intersect of overlapping → the intersection zone
      (area 2500).
- [x] **The knife ignored open paths** (after scissors `closed=false`). Added `sliceOpenPath` —
      cuts an open path at every intersection with the knife; the knife match no longer requires
      `it.closed` (takes any non-locked Path except overlays). Verified: scissors opened a
      rectangle → the knife cuts it into 3 pieces.

### Session 16 — progress (✅ core of 3.1 + rotate cursor)

Scope: **phase 3.1** — live rectangle (corner rounding via a widget); + discoverable rotate-by-corner.

- [x] `operations/liveShape.js` — `tagLiveRect`/`isLiveRect`/`rectAxisAligned`/`maxRadius`/`setRadius`/
      `radiusWidgetPoint`. The radius lives in `data.live={kind:'rect',radius}`; `setRadius` rebuilds
      segments from bounds+radius (`Path.Rectangle({rectangle,radius})`), bounds unchanged.
- [x] Rectangle and Rounded Rectangle are tagged `tagLiveRect` (radius 0 / computed).
- [x] selectTool: radius widget (a circle near the top-left corner, diagonal offset = radius, min 14px);
      widget hit → mode 'radius', drag = `setRadius(min(dx,dy))`. The widget draws/cleans in
      draw/up/view/refresh/deactivate; hidden during transforms.
- [x] Rotate-by-corner (from 2.2) now has an arrow cursor (data-URI SVG, grab fallback) — now noticeable.

Session 16 notes / decisions:
- The widget shows only for ONE selected live rectangle and while it's axis-aligned
  (`rectAxisAligned`: all segment points on bounds edges). After rotation the widget hides (a tilted
  live frame — later, with the Transform panel 7.1). Resize scales the rounding too (radius approximate).
- Verified: rect 4→8 segments after rounding, radius 45, bounds stable 160×120; rotate zone →
  SVG cursor; widget hover → pointer.
- live parameters for polygon/star/ellipse (sides/points/pie) are NOT done — deferred.

### Session 17 — feedback fixes (✅)

- [x] **The knife didn't halve a shape opened by scissors.** The knife picked a strategy by `closed`:
      an open (but filled) path after scissors was cut as a line (`sliceOpenPath`) — the middle
      "vanished". Now the strategy is by CONTENT: if the path is `closed || fillColor` — it's a region,
      we stitch the cut (`closed=true`) and split into two closed halves (`sliceTarget`); only a
      genuinely unfilled open stroke goes to `sliceOpenPath`. Verified: scissors→knife = 2 pieces of
      14000 each (exact halves), both closed.
- [x] **Removed the separate Rounded Rectangle tool.** Rounding now belongs to ANY rectangle
      (live rect, on-canvas widget), so the duplicate is unnecessary. Removed `roundedRectangleTool.js`
      and references in toolIds/Canvas/toolItems/Toolbar. A rectangle is drawn with the regular
      Rectangle and rounded with the widget.

### Session 18 — progress (✅ iteration 3.2)

Scope: **phase 3.2** finished — full stroke + arrowheads + Fill/Stroke indicator.

- [x] `itemStyle.js`: reads/writes `strokeCap`, `strokeJoin`, `dashArray`, arrowheads (`data.arrows`).
      Line type (solid/dashed/dotted) is derived from dashArray+cap; a preset maps to a concrete
      pattern (`dashPatternFor`, scaled by width). Dotted = `dashArray:[0, w*2]` + `strokeCap:'round'`.
- [x] Properties: stroke-detail block — Line (3 SVG icons), Cap (3), Join (3), Dash/Gap fields
      (custom dash), Arrowheads (Start/End + size). Arrowheads show only for open paths
      (`isOpenPath`). All fields disabled when stroke is off.
- [x] `operations/arrowheads.js` — arrowheads are NOT baked into the path: each is a separate filled
      triangle `data.isArrow`, tied to its path via `data.ownerId` (path id). `refreshArrowheads`
      rebuilds (not moves) them; called from `selection.draw()` (on every redraw →
      they follow move/resize/rotate) and from `applyStyle` (color/width/toggles change the head).
      Old heads found by ownerId (not stored references) → cloning a path doesn't touch others'.
- [x] The Fill/Stroke indicator in the Toolbar is interactive: click a swatch = focus, ⇄ = swap,
      key **X** = toggle focus, **Shift+X** = swap fill/stroke (`swapFillStroke` in App,
      called from `Canvas.onKeyDown` via `paintRef`). The X hotkey guards `!meta/!ctrl/!alt`
      (doesn't break Cut).

Session 18 notes / decisions:
- Arrowheads are `locked=true` → Paper hitTest ignores them (not selectable), `selectAll` filters by
      `!locked`. Deleting a path cleans its heads (`clearArrowheads` in `selectionActions.delete`);
      duplicate builds its own heads for the clone (`refreshArrowheads(c)`).
- `numberSm` needs `box-sizing: border-box`, otherwise padding+border inflated the fields and the
      panel overflowed by ~24px (horizontal scroll). Verified: scrollWidth 219 ≤ 220.
- Verified in the browser: a dotted line + arrowheads on both ends render and survive
      deselection; Shift+X on a rect swaps #b9bcc0↔#7d8186; X toggles the swatch focus.

### Session 19 — progress (✅ iteration 5.2)

Scope: **phase 5.2** — fonts (system, files, Google Fonts, manager, previews).

- [x] `src/state/fonts.js` — font registry (first module in `state/`): 3 groups (system/custom/google),
      `subscribeFonts` for React and Canvas. System fonts — a curated list of 26 candidates,
      detected via canvas width measurement against generic fallbacks (23 + 3 generic passed on Mac).
- [x] File upload .ttf/.otf/.woff/.woff2: `FontFace` + `document.fonts.add`; family name from the
      file name, collisions get a "2" suffix. Files live for the session (FontFace doesn't
      serialize) — hint in the UI.
- [x] Google Fonts: inject a css2 `<link>` + verify with `document.fonts.load()`; a wrong name →
      link.onerror → clear error, state untouched. The list persists in localStorage
      (`ov.fonts.google`) and restores on start (as fonts load — notify → re-layout).
- [x] `textLayout.js`: `fontFamily` in read/applyTextStyle (with re-layout), `relayoutAllText()`.
- [x] `components/FontPicker/` — dropdown in Properties (text only): the button and every item
      render in THEIR OWN font, groups Loaded/Google/System, footer "Manage fonts…" → the manager.
- [x] `components/FontsDialog/` — manager (Type > Fonts…): editable preview line, per-family
      preview, file upload, Google (field + Enter/Add + suggestion chips), ✕ removal.
- [x] Canvas subscribes to the registry: a font finished loading → `relayoutAllText` + overlay
      refresh + update (advance was measured with a fallback before load — metrics change).
- [x] Retype (font from an image) — NOT here: that's AI, explicitly listed in 18.2 (AI Retype).

Session 19 notes / decisions:
- **`document.fonts.check()` returns true for an UNregistered family** (vacuous truth) —
  verify loading via `document.fonts.load()` and the result length. For the same reason system
  detection uses canvas measurement (72px, string m/l/W/@) against monospace AND serif (differing
  from at least one = installed), not check().
- Test gotcha (not code): a synthetic keydown `code:'Space'` with a NON-text tool enables
  pan (`spaceDownRef`) and without keyup it sticks — all subsequent mousedowns go to panning.
  Always send keyup. Tool switching via a toolbar click applies in a useEffect (async) —
  send the button click and canvas events in SEPARATE evals.
- In headless eval the live paper instance is obtained by dynamically importing the exact URL from
  `performance.getEntriesByType('resource')` (`/node_modules/.vite/deps/paper.js?v=…`);
  `/@id/paper` returns a DIFFERENT instance (project=null). `/src/*.js` modules imported by direct
  path share the app's instance (verified via shared state).
- `.claude/launch.json`: added an `openvector-alt` config (port 5181) for when 5180
  is taken by a parallel session's dev server.

### Session 20 — progress (✅ core of 5.3)

Scope: **phase 5.3** — typography (core; complex subsystems deferred).

- [x] Character: **baseline shift** (whole text object; in block text = baseline offset,
      on a path = offset along the normal). Baseline field in Properties.
- [x] Paragraph: **indents** (left / first-line / right — area text only) and
      **space before/after paragraph** (point and area). Indent (3) and Space (2) fields in Properties.
- [x] `textLayout.js` refactored: a shared `blockLines(d)` computes lines (wrapping with indents,
      startX by justification, y with spacing) — used by both `layoutBlock` and `caretSegment`
      (the math used to be duplicated and could diverge). The old `wrap()` removed.
- [x] **Change Case** (UPPERCASE / lowercase / Title Case / Sentence case) — Type submenu.
- [x] **Smart Punctuation** — “ ” ‘ ’ … — (applies everything at once; checkbox dialog — from 15.1).
- [x] **Fit Headline** — area text: joins into one line and fits tracking to the frame width
      (minus indents). Enabled only for horizontal area text.
- [x] **Show Hidden Characters** — global toggle (`setShowHiddenChars`): space dots `·`,
      `¶` at paragraph ends, `#` at text end. Marks are `data.hiddenMark` + `locked` (not hit,
      not indexed as glyphs — Touch Type fx don't shift), cleaned in relayout.
- [x] MenuBar: **submenu support** (`item.items` → hover flyout, `.subMenu` in CSS) — generic,
      will serve Arrange/Effect. Type menu: Change Case ▸, Smart Punctuation, Fit Headline,
      Show Hidden Characters (with ✓); Create Outlines/Find Font — disabled (deferred).
- [x] New module `src/canvas/operations/typography.js` (changeCase/smartPunctuation/fitHeadline);
      commands go App.applyTextCommand → over the selected text groups (selItemsRef), not via the tool.
- [ ] Deferred: Create Outlines (needs opentype.js + font binaries — FontFace won't give them;
      fonts.js doesn't keep buffers), Find Font, Threaded Text, Text Wrap, Character/Paragraph
      as separate floating panels (all in Properties for now), Tabs, Glyphs, pair kerning (needs
      per-character selection in the text editor).

Session 20 notes / decisions:
- Paragraph indents apply ONLY in area text (point text has no frame — width undefined);
  space before/after — in both. Vertical and on-path text ignore paragraph settings (v1).
  Baseline shift works in block and path modes, not in vertical (v1).
- Fit Headline leaves a tiny margin (−0.01 tracking), otherwise a line exactly at frame width
  wraps due to float rounding.
- **Panel layout fix**: `input[type=range]` in a flex row doesn't shrink (min-width:auto,
  default width ~129px) — the panel scrolled in X. Fixed with `min-width: 0` on `.range`.
  The 3-field Indent row has its own class `.tightRow` (gap 4) + `.numberXs` (42px).
- Test gotcha (not code): after a synthetic `button.click()` in eval React flushes state AFTER
  return — check the DOM in the NEXT eval. React onMouseEnter triggers via `mouseover`
  (bubbles: true); a bare `mouseenter` isn't caught.

### Session 21 — progress (✅ 5.3: Create Outlines + Find Font; bold/italic)

Scope: finishing **phase 5.3** — Create Outlines, Find Font; + the bold/italic engine committed
(fontWeight/fontStyle, `variantOf` through the whole layout) with UI toggles.

- [x] **Create Outlines** (Type menu, enabled with text selected): text group → a group of
      `CompoundPath` outlines. New `operations/outlines.js` + dependency **opentype.js@2**.
      Each glyph `PointText` draws its char at LOCAL (0,0), while placement/rotation/Touch Type
      sit in its matrix → we generate the outline at (0,0) (`font.getPath`) and run it through
      `glyph.matrix`, then `group.matrix` — all modes (point/area/path/vertical/touch) land
      exactly where they rendered. Center-aligned glyphs (on-path) — shifted by −advance/2.
- [x] **Font binaries** (`resolveFontBinary` in `state/fonts.js`): file fonts — the buffer is kept
      at upload; Google — WOFF v1 from the Fontsource mirror on jsDelivr
      (`cdn.jsdelivr.net/fontsource/fonts/<id>@latest/latin-<weight>-<style>.woff`, fallback to
      400/normal); system — `queryLocalFonts` (Chromium, prompt) with style scoring, generic
      families mapped to real ones (sans-serif→Helvetica/Arial etc.). Parse+cache by
      family|weight|italic.
- [x] **Find Font** (Type > Find Font…): dialog `components/FindFontDialog/` — document families
      with object counts, replacement picked from all registered, Replace changes all occurrences
      (`listFontUsage`/`replaceFont` in typography.js). After replacement — re-sync panel/overlay.
- [x] Bold/Italic: engine (parallel edit) + commit 068978e; Properties got weight selection
      (100–900) and an Italic toggle (finished by a parallel session).

Session 21 notes / decisions:
- **Google won't serve TTF to a browser**: spoofing User-Agent in fetch has no effect (client
  hints), css2 always returns woff2, and opentype.js does NOT read woff2 (needs brotli). Solution —
  the Fontsource mirror on jsDelivr, which has WOFF v1 (opentype.js parses it via built-in inflate).
- A binary resolution error (no Local Font Access, family not found) — an alert with clear text,
  the text is NOT touched (group replacement happens only after a successful parse).
- The selection is cleared BEFORE outlining (`deselect` via actionRef) — the text group gets
  deleted and the overlay must not hold a dead reference. Illustrator preserves selection — our
  TODO for 6.1 (unified selection store).
- Outline ≠ canvas metrics: opentype's advance can differ slightly from `measureText` (the browser
  may have rendered a different binary) — indistinguishable by eye, each glyph has its own
  position, no accumulation.

### Session 22 — progress (✅ iteration 6.1)

Scope: **phase 6.1** — object organization. Also closed the deferred "unified selection store" refactor.

- [x] **Unified selection store** (`src/state/selection.js`): one source of truth, subscriptions for
      React/Canvas; `alive` check walks the chain up to a layer in project.layers (survives layer
      deletion); `pruneSelection` filters hidden/locked along the chain. **Selection survives tool
      switching**: `createSelection` in `operations/selection.js` is now a thin wrapper over the
      store; the overlay is a module singleton; `dispose()` (in tools' deactivate) removes
      callbacks WITHOUT resetting the store. Canvas keeps a permanent instance (`docSelRef`) →
      App/task-bar feed off the store under any tool; shortcuts and menus (⌘A/⌘G/⌘D/⌘2/⌘3,
      Group/booleans/…) work with the `runSelectionAction(docSelection)` fallback when the active
      tool has no `runAction`.
- [x] **Overlay layer** `__overlay` (`data.isOverlayLayer`, always on top, getOverlayLayer):
      selection frame, marquee, guides, radius widget — independent of user layers.
      `addOverlay(item)` — shared helper.
- [x] **Layers panel** (`components/Panels/LayersPanel.jsx`, first module in Panels/): layers
      (top of the list = top of the canvas), create/delete (header buttons), activate by click,
      rename by dblclick (layers and objects), eye/lock on layers and objects, group nesting
      (disclosure ▸/▾, indents), object labels (Text “…”, Rectangle, Compound Path…), fill/stroke
      swatch, select by click (Shift = add), highlight of selected, **drag&drop**:
      onto a layer row = into that layer on top, onto an object row = insert above it (guarded
      against dropping into one's own subtree). Refresh — via `state/document.js` (bumpDocument
      from Canvas after every gesture: mouseup/keydown/actions) + selection store subscription.
- [x] **Lock/Hide**: Object menu Lock Selection (⌘2) / Unlock All (⌥⌘2) / Hide Selection (⌘3) /
      Show All (⌥⌘3) + commands in `runSelectionAction`; `operations/visibility.js` — Unlock All
      skips system locks (overlays, arrowheads, hiddenMark, isoDim). Locked items don't hit-test.
- [x] **Isolation Mode** (`operations/isolation.js`): dblclick on a group (from any tool) →
      isolation; nested dblclick goes deeper (chain). Everything outside the isolated group dims
      (opacity ×0.25) and locks; exit restores exactly. **Breadcrumbs** on the canvas
      (Document › Group › …, click a crumb = exit to that level), Escape = one level up, dblclick
      on empty = one level up; after full exit the group is selected. Object menu: Isolate
      Selected Group / Exit Isolation Mode. **New objects drawn in isolation are adopted
      by the group** (`adoptNewItems` in Canvas.afterMutation: everything unlocked at layer level →
      into the group). `pickItem.topLevel` stops at the isolation root → clicks select the group's
      CHILDREN.
- [x] **Multi-layer everywhere**: selectAll/marquee/wand — `editableItems()` (visible unlocked
      layers; in isolation — the root's children); snapping/zoomFit — across all visible layers;
      `groupItems` puts the group into the front element's container (not activeLayer); the knife
      cuts only visible/unlocked along the chain; File > New clears all layers and creates "Layer 1".
- [x] Text: `data.editing` while editing (overlay hidden — the caret is the visual), the store
      holds the text (Properties works); after commit the text stays selected.
- [x] Window > Layers (panel toggle); the right column `.side-col` = Properties (grows, scrolls) +
      Layers (240px). Arrange from 6.1 was done earlier (session 10).

Session 22 notes / decisions:
- `new paper.Layer()` AUTO-activates and goes on top — after creation we push the overlay layer
  back up (`project.insertLayer(layers.length, ol)`), restore the previous active manually
  (in getOverlayLayer).
- The Illustrator pattern "drawing in isolation adds to the group" is implemented WITHOUT touching
  tools: isolation's apply() locks everything pre-existing at layer level → after mouseup anything
  unlocked and new at layer level = freshly created → `root.addChild` (coordinates preserved, the
  group matrix is identity). A pen mid-drawing gets adopted too — harmless (coordinates unchanged).
- Test gotcha (not code): clicking a menu button and reading the dropdown are SEPARATE evals (React
  flushes after return); a second click on the menu title TOGGLES (closes). Synthetic DnD works via
  `new DataTransfer()` + DragEvent(dragstart/dragover/drop) with one dt.
- Deferred: the Delete key under non-selection tools (Delete currently works only in selection
  tools); auto-selecting a freshly drawn shape (AI behavior) — for 6.2/7.1.

### Session 23 — progress (✅ iteration 6.2)

Scope: **phase 6.2** — Pathfinder and path operations. All checklist items closed.

- [x] **`operations/pathfinder.js`** — Divide, Trim, Merge, Crop, Outline. The core is
      `atomicRegions(paths)`: decomposition of shapes (bottom→top) into non-overlapping atomic
      regions (iteratively: new shape P against each piece Q → Q∩P / Q−P / remainder of P; a
      region's style comes from the topmost covering shape). The result is a Group in place of the
      front original; fills preserved, strokes reset (as in Illustrator); empty result → null,
      originals untouched (the booleanOp pattern). Merge = Trim + unite pieces with equal fill;
      Outline = open contour pieces cut at all intersections, stroke = the source shape's fill.
- [x] **Shape Builder Tool** (`shapeBuilderTool.js`, its own Toolbar slot): works off the selection
      (a click outside regions selects a shape, Shift adds). Hover highlights an atomic region,
      click extracts it, drag across several regions merges, **Alt = delete**. Region previews are
      invisible paths on the overlay layer (addOverlay, manual hit via contains). A gesture
      rebuilds ONLY the affected shapes (each → itself minus the union of chosen regions); the
      result stays selected → regions rebuild via the store subscription.
- [x] **Compound Path** (`operations/compound.js`): Make (⌘8, 2+ paths; style from the bottom one,
      fillRule evenodd → holes) and Release (⌥⌘8; children get the compound's style). Properties:
      Make at 2+, Release for a selected CompoundPath (`sel.isCompound` from App).
- [x] **Path ops** (`operations/pathOps.js`): **Join** (⌘J; 1 open path → close, 2 → join nearest
      ends with auto-reverse), **Average** (Both/Horizontal/Vertical — all anchor points),
      **Outline Stroke** (via **paperjs-offset** offsetStroke; a filled path → Group [fill,
      stroke outline]), **Offset Path** (PaperOffset.offset; the original stays, the copy is
      selected), **Simplify** (path.simplify 2.5), **Split Into Grid** (rows×cols+gutter by
      bounds), **Clean Up** (stray points, unpainted paths, empty groups; skips system/locked).
- [x] **UI**: Object menu — Pathfinder submenu (9 ops), Compound Path (Make/Release), Path
      (7 commands); MenuBar submenus got separator support. Properties (2+): a grid of 9
      pathfinder buttons + Make Compound Path. Canvas shortcuts: ⌘J, ⌘8, ⌥⌘8.
- [x] New dependency: **paperjs-offset@2** (offset geometry, Paper.js can't do it itself).

Session 23 notes / decisions:
- **Parameterized commands**: `runSelectionAction` accepts `"offsetPath:10"` / `"splitGrid:3,3,10"`
  — App shows `window.prompt` and passes the argument after the colon. Proper dialogs — 15.x.
- Average with an object selection averages ALL path points (Illustrator does the same when whole
  objects are selected); Average over selected points — when per-segment selection reaches UI
  commands.
- Divide of non-overlapping shapes honestly yields a Group of whole pieces — atomic regions with
  no overlaps = the shapes themselves.
- Shape Builder: the merged piece's style comes from the FIRST selected region's source
  (Illustrator takes the object under the gesture start). The donor is read after removing the
  originals — safe (remove() only detaches the item; properties remain readable).
- `cp.area` of a CompoundPath whose children share a winding direction SUMS them (the hole isn't
  subtracted) — visually the hole is there (evenodd, contains() confirms); don't trust the number.
- No floating Pathfinder panel — everything in Properties (like Character/Paragraph); panels — 15.3.

### Session 24 — progress (✅ iteration 7.1)

Scope: **phase 7.1** — basic transforms + Transform Again and Reference Point from the 2.2 tail.

- [x] **`operations/transform.js`** — the core: refPoint (9 positions), unionBounds,
      move/rotate/scale/shear/reflect/flipItems, transformEach (around EACH object's own center),
      the **Scale Strokes & Effects** preset (get/setScaleStrokes; on scale strokeWidth × the mean
      factor), **Transform Again** (recordTransform/transformAgain: move/rotate/scale/shear/
      reflect/each, `copy:true` = clone first — gives the classic "rotate a copy → ⌘D around the
      circle"), **free distort** (collectPaths/snapshotPaths/distortPaths — bilinear remap of
      segments and handles from the source rect into an arbitrary quad; every frame from the
      SNAPSHOT, not incremental).
- [x] **Transform section in Properties** (`TransformSection.jsx`, for any selection ≥1):
      3×3 Reference Point selector, X/Y/W/H relative to the chosen reference point, Rotate/Shear
      (Δ° fields: commit on Enter/blur, reset to 0 — DeltaInput), Flip H/V, Scale strokes checkbox.
      The panel reads the selection store directly (subscribeSelection+subscribeDocument);
      mutations are direct ops calls + its own `createSelection().draw()` + bumpDocument.
- [x] **4 tools** (`transformTools.js`, shared factory): Rotate, Reflect, Scale, Shear.
      Movable pivot (click = reposition, Escape = reset to center, crosshair marker on the
      overlay), drag = transform around the pivot, Shift = constrain (45°/proportions/15°),
      **Alt-drag = transform a copy**. The gesture is recorded for Transform Again. Scale
      scales strokes ONCE on mouseup (by the accumulated factor, not per frame).
      Reflect: the axis = drag direction from the pivot; axis change θ1→θ2 applies as rotate 2Δθ.
- [x] **Reshape** (`reshapeTool.js`): pull any point of a path — neighboring anchors follow with a
      Gaussian falloff along the CURVE (σ = 15% of length; for closed paths, ring distance).
- [x] **Free Transform** (`freeTransformTool.js`): a quad widget over the selection bounds;
      corner = scale (Shift = proportions), **⌘+corner = free distort**, **⌘⇧+corner =
      perspective** (the adjacent corner along the drag axis moves toward), edge = axis scale,
      **⌘+edge = skew**. Every gesture starts from fresh axis-aligned bounds and bakes on mouseup.
      Distort applies to Path geometry only (text groups untouched, v1).
- [x] **⌘D = Transform Again** (Illustrator-compatible): no recorded transform → falls back to
      duplicate. Recorded: move/Alt-copy/nudge/rotate-by-corner (selectTool), the 4 tools'
      gestures, duplicate (as move+copy 12,12), panel edits, menu commands.
      Edit > Duplicate stays in the menu but without the accelerator.
- [x] **Object > Transform** submenu: Transform Again ⌘D, Move…/Rotate…/Scale…/Shear… (prompt,
      like Offset Path), Reflect Horizontal/Vertical, Transform Each… (prompt: sx%,sy%,dx,dy,angle).
      selectionActions commands: `moveBy:` `rotateBy:` `scaleBy:` `shearBy:` `transformEach:` +
      `flipH`/`flipV`/`transformAgain`.
- [x] Toolbar: groups [Rotate, Reflect], [Scale, Shear, Reshape], [Free Transform] + 6 icons.
- [ ] Deferred: rotated bounding box + Reset Bounding Box (overlay refactor), Drawing Modes,
      Screen Modes (F), homography for perspective (bilinear remap for now), text distortion,
      dialogs instead of prompt (15.x).

Session 24 notes / decisions:
- **New-code gotcha**: the selection store notifies only on CHANGES — a tool drawing its own
  overlay (pivot marker, Free Transform quad) must draw it immediately in the factory
  (drawMarker()/drawWidget()), otherwise until the first selection change there's no widget
  and the handles don't hit-test.
- Free distort via a geometry snapshot: the bilinear remap is non-invertible, so every frame the
  segments are restored from the mousedown snapshot and remapped. For a rectangular/parallelogram
  quad the remap is exact (= affine).
- Incremental gestures (rotate/scale/shear) apply step = desired − applied (for scale — the
  ratio) — no drift for any drag length.
- paper: `strokeScaling` has no effect on a Path with applyMatrix=true (the matrix bakes into
  segments, strokeWidth unchanged) — hence Scale Strokes is implemented as explicit strokeWidth
  multiplication.
- Test gotcha: "5000%" in the status bar after a series of synthetic gestures is an artifact of
  test manipulation (paper.view.zoom was 1 at the time); doesn't reproduce after reload.

### Session 25 — feedback fix (✅ shape-accurate selection)

- [x] **Marquee selected by bounding box.** Click (`pickItem`) was always precise (paper hitTest
      fill/stroke), but the marquee used `rect.intersects(it.bounds)` — dragging in the empty
      notch of an L-shape or inside a zigzag's "shell" selected the object. New `itemHitsRect(item,
      rect)` in `operations/selection.js`: bbox is only a prefilter; then honestly — the contour
      crosses the frame (`item.intersects(probe)`), the object is fully inside
      (`rect.contains(bounds)`), or the frame sits on a FILLED area
      (`fillColor && contains(rect.center)`). Groups — recursively over children; path-less leaves
      (text glyphs, raster) stay on bbox.
- [x] **The overlay drew rectangles instead of shapes.** Now every selected object is highlighted
      with the outline of its real geometry (`addShapeOutline`: clones of all visible Paths inside
      the target on the overlay layer, color #7fb2d9, 1px/zoom; the clone's data/fill/dash/opacity
      are reset). Without paths (text) — a fallback rectangle. The shared dashed union-bounds frame
      and single-selection handles remain (that's the transform box, as in Illustrator).

Session 25 notes:
- Hidden paths are skipped in the outline walk (otherwise the invisible guide path of
  text-on-path gave `found=true` and the text got no highlight at all).
- "Marquee inside a fill" can't be started from the UI — mousedown on a fill starts a move, not a
  marquee (in tests this looked like a false failure).
- The probe rectangle is `new paper.Path.Rectangle({rectangle, insert: false})`; without
  `insert: false` it would land in the active layer.

### Session 26 — feedback fixes (✅ Shape Builder + layer reordering)

- [x] **Shape Builder didn't merge NON-overlapping shapes** (the user saw "doesn't work";
      Alt-delete worked). Root cause: region hitboxes were kept `visible=false`, and paper's
      boolean fast-path for DISJOINT operands COPIES them into the result — the merged
      CompoundPath got invisible children: bounds lied (invisible skipped),
      intersect/subtract/isDegenerate returned garbage, dragging across two separate shapes
      produced two objects instead of one. Overlapping shapes build new geometry (not the
      fast-path) — which is why that case worked. Fix: regions are now VISIBLE but unpainted
      (`fillColor=null, strokeColor=null`) — they don't render, contains works, boolean results
      are clean. Plus UX: dashed seams of all regions while the tool is active (clones on the
      overlay, 1px/zoom; after a merge the seam between pieces disappears — the gesture became
      visible; seams redraw in onViewChange). Verified: disjoint merge → 1 CompoundPath with
      correct bounds and visible children; overlapping: extract 2→3, Alt 3→2, merge 2→1.
- [x] **Layer reordering by drag in the Layers panel.** Layer rows became draggable; payload
      `kind:id` (item/layer) — shared onDrop: layer onto layer (or onto an object row) = go ABOVE
      the target layer (topmost-first list), an object — as before (into a layer on top / above an
      object). After the move `getOverlayLayer()` re-pins the overlay to the top.
      `draggable={!editing}` — drag disabled during rename.

Session 26 notes:
- The user's "same-colored ellipses" case additionally masked the tool's work: extract/merge with
  identical fills are visually indistinguishable — region seams now give feedback. Lesson: a
  gesture's result must be visible even with identical styles.
- paper `layer.insertAbove(otherLayer)` honestly reorders layers in project.layers (layers are
  Items too).

### Session 27 — progress (✅ iteration 7.2)

Scope: **phase 7.2** — distortion and width. All 4 checklist items closed (v1).

- [x] **`operations/widthProfile.js`** — variable stroke width. The profile lives in
      `path.data.width = {base, preset, points:[{o: 0..1, w: px}]}`. Paper can't do variable-width
      strokes → rendered as a separate FILLED envelope (`data.isWidthEnvelope` + `ownerId`, the
      arrowheads pattern: rebuilt on every overlay redraw and in applyStyle → follows
      move/transform/reshape). While a profile exists the path has `strokeWidth = 0` (paper won't
      draw a zero stroke), the nominal lives in `base`, itemStyle maps it into the panel. Closed
      path → the envelope is a CompoundPath of two rings (evenodd). End widths interpolate toward
      base (a single point = a spindle, as in Illustrator). Editing Width in the panel scales the
      profile proportionally; scaleStrokeWidths (Scale Strokes & Effects) scales base+points.
- [x] **Width Tool** (`widthTool.js`): click on a stroke — new width point, drag = width
      (2× distance to the axis); markers: a crossbar + squares at the ends (drag = width) + a dot
      on the spine (drag = slide along the path); Alt-click a marker / Delete — remove the point;
      last point removed → profile dropped, native stroke restored. Hover highlights the path.
- [x] **Variable Width Profiles**: a Profile select in Properties (Uniform + 4 presets + Custom),
      `applyWidthPreset` builds points from the nominal; custom edits → preset='custom'.
- [x] **Puppet Warp** (`puppetWarpTool.js` + `operations/puppetWarp.js`): pins + rigid MLS
      (Schaefer 2006, no mesh — the deformation field is computed per vertex: anchors + handle
      ENDS, curves bend). Click an object = target, click the target = pin, drag selected pins =
      deformation FROM A SNAPSHOT; when the pin set changes the snapshot re-bakes (re-base) —
      gestures compose without drift. Shift-click = pin multi-select, A = all pins, Delete =
      remove pins (deformation stays), Escape = clear selection/pins. 1 pin = pure translation.
- [x] **Measure Tool**: drag → overlay readout D/∠/W/H (Shift = 45°), stays until the next measure.
- [x] **Dimension Tool**: drag → a dimension annotation AS ARTWORK (line, ticks, outward arrows,
      an "N px" label along the line, flipped if upside down; Shift = 45°); the group selects and
      moves like a normal object, `data.isDimension`.
- [x] Toolbar: groups [Width, Puppet Warp] and [Measure, Dimension] + 4 icons.
- [ ] Deferred: Show Mesh and pin rotation (Puppet Warp), asymmetric width points
      (Alt half-width in Illustrator), Width markers for paths inside groups (the envelope itself
      works in groups — no markers/point-adding).

Session 27 notes / decisions:
- **A path with a profile didn't hit-test**: strokeWidth=0 → paper's stroke hit doesn't fire, the
  envelope is locked, and the `{locked:true}` option of project.hitTest does NOT work in our paper
  build (verified). Fix in `pickItem`: a manual envelope pass (`getItems({match}) + contains`) →
  a click ANYWHERE on the stroke body resolves to the owning path.
- A group clone copies the child envelope with the OLD ownerId → orphan sweep in
  refreshWidthEnvelope (envelopes without an owner among siblings get removed). The Delete command
  cleans envelopes like arrowheads.
- `isTransientItem` (isolation.js) — the central filter for system items (Layers, Unlock All,
  adoption) — the envelope was added there with one line. The selection outline (addShapeOutline)
  skips the envelope: selection highlights the spine.
- Vite doesn't read PORT from env — vite.config.js got `server.port = process.env.PORT`
  (needed by the preview harness with autoPort; the `openvector-any` config in .claude/launch.json).
- Test gotchas: the preview viewport after a server restart can be 0×0 → `preview_resize` with
  explicit width/height, then manually `paper.view.viewSize = stage.clientSize` (the
  ResizeObserver doesn't fire in headless). The toolbar slot after picking from the drawer shows
  the picked tool — an `aria-label="Width"` button may be absent from the rail; take it from the
  drawer.

### Session 28 — progress (✅ iteration 7.3)

Scope: **phase 7.3** — Liquify. All 7 tools + the shared brush + options (v1).

- [x] **`src/state/liquify.js`** — brush options store, ONE brush for all 7 tools (as in
      Illustrator): width/height/angle/intensity + simplify (warp group), twirlRate,
      complexity/detail (texture group), wrinkleH/V, checkboxes affectAnchors/In/Out.
      subscribe() — tools and Properties stay in sync (Alt-drag resize shows in the fields
      immediately).
- [x] **`operations/liquify.js`** — the core: elliptical brush weight (cos² falloff in
      brush-local coordinates — angle/width/height respected), `subdivideUnderBrush` (adds anchor
      points under the brush, spacing from Detail, cap 40 insertions/event), `liquifyStep` —
      7 modes: warp (delta×weight), twirl (rotates points+handles around the brush center, signed
      rate), pucker/bloat (toward/away from the brush center, handles shrink/grow),
      scallop/crystallize (toward/away from the center with per-segment random stable for the
      whole gesture — WeakMap in `newGesture`; Complexity = fraction of affected points, handles
      retract per the checkboxes), wrinkle (fresh random every event — "wrinkles" while held;
      H%/V% per axis).
- [x] **`tools/liquifyTools.js`** — shared factory of 7 tools: the brush ellipse overlay follows
      the mouse (hover and drag), drag = deformation (over the selection if any; otherwise
      everything under the brush), **Alt-drag = on-canvas brush resize** (Shift+Alt = circular),
      Delete/Escape/runAction — as in Reshape. Text/dimension/system items skipped (v1).
- [x] **LiquifySection in Properties** (`components/Properties/LiquifySection.jsx`): renders when
      a liquify tool is active (Properties got an `activeTool` prop), fields per mode:
      Brush W/H/Angle/Intensity — always; Simplify — warp/twirl/pucker/bloat; Twirl Rate — twirl;
      Complexity+Detail — scallop/crystallize/wrinkle; H/V — wrinkle; the 3 "Brush affects"
      checkboxes — texture group. Replaces Illustrator's dblclick-on-tool dialog (dialogs — 15.x).
- [x] Toolbar: 7 tools in the Width slot (as in Illustrator: Width + 7 Liquify + Puppet Warp),
      7 new icons. A width-profiled path rebuilds its envelope after deformation.
- [ ] Deferred: options dialog on tool-button dblclick (15.x), text deformation.

Session 28 notes / decisions:
- **`path.simplify()` must not be called after a gesture**: it re-fits the WHOLE path — rectangle
  corners far from the brush got rounded, bounds drifted. Instead `finishLiquify` (warp group
  only) does two local passes: `pruneCollinear` (removes handle-less points lying on a straight
  line between neighbors — undoes over-subdivision, doesn't touch corners/curves; threshold from
  Simplify) and `smoothMovedRuns` (catmull-rom smooth only over contiguous runs of moved
  segments — WeakSet `gesture.moved`). Result: warp gives a smooth bulge, the rectangle's 4
  corners stay put. The texture group (scallop/crystallize/wrinkle) is not smoothed — the jags ARE
  the result.
- Directions for twirl/pucker/bloat/scallop/crystallize are from the BRUSH CENTER (not the shape
  center), as in Illustrator; at the point exactly under the brush center dir≈0 → the segment is
  skipped (guard 1e-6).
- Test gotcha (not code): `preview_click` on buttons with toggle logic (drawer, toolbar flyout)
  fires as TWO clicks — the panel closes back. Pick tools via `button.click()` in eval:
  the flyout toggle in one eval, the flyout item in the next.

> Old sessions 1–7 were done under previous plans (tags `iter-*`, `np-*` — history).
> Below is the mapping to the current 20-phase plan. Much was done OUT of phase order
> (the old plan went differently), so early phases are partially closed.

### Reconciliation with the 20-phase plan

- **1.1 (Layout):** ✅ DONE — Menu Bar (8 menus with dropdowns/accelerators), Control Bar (contextual), Toolbar/Canvas/Properties/Status Bar, dark theme
- **1.2 (Canvas/navigation):** ✅ DONE — zoom/pan, Rotate View (tool + View menu + status bar), Rectangle, Contextual Task Bar
- **2.1 (Toolbar/selection):** ✅ DONE — 1/2 columns + flyout, Select/Direct/Group, Magic Wand, Lasso, Hand/Zoom, drawer (list of all tools)
- **2.2 (Bounding box/transforms):** 🟡 handle scaling, **rotate-by-corner** (Shift=15°), Shift move constrain, **Alt-copy on drag**, **Alt-scale from center**, **arrow nudge** (Shift=10), **Reference Point (9 pos., in the Transform section)**, **Transform Again (⌘D)** ✅ · ⬜ Reset BB + rotated bounding box, Drawing Modes, Screen Modes (F) — deferred (overlay refactor)
- **3.1 (Primitives):** 🟡 all shapes ✅; **live rectangle — corner rounding via on-canvas widget** ✅; rotate any shape by corner with an arrow cursor ✅ · ⬜ live params for polygon/star/ellipse (sides/points/pie angles) — deferred
- **3.2 (Fill/stroke):** ✅ DONE — fill, stroke (color+width), line type (solid/dashed/dotted), caps (butt/round/square), joins (miter/round/bevel), custom dash (Dash/Gap), end arrowheads (Start/End + size; live — follow the path), opacity, Fill/Stroke indicator in the Toolbar (X — focus, Shift+X — swap)
- **4.1 (Pen):** ✅ DONE (Pen, Add/Delete/Convert Anchor, Curvature)
- **4.2 (Freehand/cutting):** ✅ DONE — Pencil, Smooth, Path Eraser, Join, Paintbrush, Blob Brush, Shaper, Eraser, Scissors, Knife, Rectangular/Polar Grid
- **5.1 (Type):** ✅ DONE — Point, Area, on a Path, Vertical (point/area/on-path), Touch Type
- **5.2 (Fonts):** ✅ DONE — system (detection), .ttf/.otf/.woff files, Google Fonts (+persist), manager (Type > Fonts…), previews, FontPicker in Properties · Retype → 18.2 (AI)
- **5.3 (Typography):** 🟡 almost everything ✅ — size/leading/tracking/justification, bold/italic (weight 100–900), baseline shift, paragraph indents (area), space before/after, Change Case, Smart Punctuation, Fit Headline, Show Hidden Characters, **Create Outlines** (opentype.js: files/Google via Fontsource WOFF/local via queryLocalFonts), **Find Font** (replacement dialog), MenuBar submenus · ⬜ Threaded Text, Text Wrap, Tabs/Glyphs panels, pair kerning (needs per-character selection)
- **6.1 (Organization):** ✅ DONE — Arrange (z-order), Align + Distribute, Group/Ungroup, Lock/Unlock All (⌘2/⌥⌘2), Hide/Show All (⌘3/⌥⌘3), Isolation Mode (dblclick, breadcrumbs, dimming, adoption of new objects), Layers panel (create/delete/rename/eye/lock/nesting/drag between layers), **unified selection store** (survives tool switching; commands work under any tool)
- **6.2 (Pathfinder):** ✅ DONE — all 9 ops (Unite/Subtract/Intersect/Exclude + Divide/Trim/Merge/Crop/Outline; Object > Pathfinder menu + grid in Properties), Shape Builder Tool (click/drag/Alt-delete, region highlight), Compound Path Make/Release (⌘8/⌥⌘8), path ops: Join (⌘J), Average ×3, Outline Stroke, Offset Path, Simplify, Split Into Grid, Clean Up · Offset/Grid values via prompt for now (dialogs — 15.x)
- **7.1 (Transforms):** ✅ DONE — Transform section in Properties (Reference Point 3×3, X/Y/W/H, Rotate/Shear Δ°, Flip H/V, Scale Strokes & Effects), Rotate/Reflect/Scale/Shear tools (click-to-place pivot, Shift constrain, Alt-copy), Reshape (falloff), Free Transform (scale/⌘ distort/⌘⇧ perspective/⌘ skew), Transform Each…, Transform Again (⌘D, with duplicate fallback), Object > Transform submenu · ⬜ rotated box/Reset BB, Drawing/Screen Modes — deferred
- **7.2 (Distortion/width):** ✅ DONE — Width Tool (width points: drag/slide/Alt-delete), Variable Width Profiles (Uniform + 4 presets in Properties), envelope rendering (isWidthEnvelope), Puppet Warp (pins, rigid MLS, Shift multi-select, A = all, Delete keeps deformation), Measure (D/∠/W/H readout), Dimension (dimension annotation as artwork) · ⬜ Show Mesh/pin rotation, asymmetric width points — deferred
- **7.3 (Liquify):** ✅ DONE — 7 tools (Warp/Twirl/Pucker/Bloat/Scallop/Crystallize/Wrinkle) in the Width slot, shared elliptical brush (W/H/Angle/Intensity, Alt-drag on-canvas resize, Shift+Alt = circular), per-tool options in a Properties section (Simplify, Twirl Rate, Complexity/Detail, Wrinkle H/V, Brush Affects Anchors/In/Out Tangents checkboxes), subdivision under the brush + prune/smooth on gesture finish · ⬜ dblclick-on-tool dialog (15.x), text deformation
- **8.1 (Color):** 🟡 fill/stroke/opacity in Properties · ⬜ Color panel (RGB/HSB/CMYK/Hex/Lab), Picker, Eyedropper, Swatches, Document Color Mode
- **9.2 (Stroke/Appearance):** 🟡 stroke width · ⬜ full Stroke panel, Appearance, Graphic Styles
- **13.2 (Snapping):** 🟡 Snap to Grid, Snap to Object · ⬜ Rulers, Guides, Smart Guides, Snap to Pixel/Point/Glyph/Tangent

Shared subsystems not yet built: **i18n (EN/RU)**, **export (SVG/PNG/…)**,
**Undo/Redo** (phase 20.1).

**Next by plan (early gaps):** 8.1 Color (Color panel RGB/HSB/CMYK/Hex/Lab,
Color Picker, Eyedropper, Swatches, Document Color Mode). Previously deferred: rotated box +
Reset BB, Drawing/Screen Modes (2.2/7.1 tail); live params for polygon/star/ellipse (from 3.x);
Delete key and auto-select of a new shape under non-selection tools;
Offset/Grid/Move/Rotate/Scale/Shear/Transform Each dialogs instead of prompt — 15.x.

> Paper gotcha: `project.getItems(fn)` with a bare function does NOT work (treats fn as a
> class) — use `getItems({ match: fn })`. Otherwise the filter silently returns 0.

### Deferred architectural decisions

- ~~Unified selection store~~ — **✅ DONE in 6.1 (session 22)**: `src/state/selection.js` +
  a permanent instance in Canvas; selection survives tool switching, menu commands/shortcuts
  work under any tool (the `runSelectionAction` fallback).
- **Selection preferences (feature) — phase 15.2**, Preferences → "Selection & Anchor Display"
  (click tolerance, anchor size/style, contour-only object picking, etc.). Related:
  Select menu (Same/Inverse/**Save Selection**/Above-Below) — 15.1.
- **Contextual pruning of inapplicable buttons (user feedback, TODO).** Right now
  Properties/Control Bar/task bar show the full operation set at 2+ selected even when an
  operation is meaningless (e.g. Intersect/Exclude on adjacent knife pieces with no overlap →
  empty result; align/distribute with too few objects). **Inapplicable actions must be
  hidden/disabled based on the actual selection state.** Do it when polishing the Pathfinder
  panel (6.2) and during general UI polish (20.2). Low priority, but don't forget.

---

## Important

Before starting every session:
1. Read this file
2. Check for a fresh checkpoint in `_claude-notes/` (checkpoints are written into the project)
3. Ask what we're doing today if unclear
4. Follow the 20-phase plan in order, starting from the earliest unclosed iteration
   (see "Reconciliation with the 20-phase plan"). Don't jump ahead without an explicit request.

---

## Obsidian checkpoint protocol

The vault is connected to this project (vault root = OpenVector root).
Write notes into `_claude-notes/` via `mcp__obsidian-vault__write_note`.

Checkpoints are written in **English** (docs language rule; checkpoints written before
2026-07-07 remain in Russian — read them as-is).

**When to write a checkpoint:**
- Before the user is about to run `/compact`
- After completing any significant task (new file, bug, architectural decision)
- If the session runs longer than 30 minutes

**File format:** `_claude-notes/checkpoint-YYYY-MM-DD-HH-MM.md`

**Checkpoint content (verbatim, no abridging):**

```markdown
---
type: session-checkpoint
project: OpenVector
date: [ISO datetime]
---

Project: [[CLAUDE]]

## For future Claude

## Current task
[One sentence — what exactly is being done right now]

## Files changed this session
- src/canvas/tools/pen.js:42 — [what exactly was done]
- src/components/Toolbar/Toolbar.jsx:18 — [what exactly was done]

## Decisions made this session
- [Exact decision]: [exact reason why]

## Active errors / bugs
[Exact console error text if any]

## Non-obvious things to know
[Everything future Claude won't find in the code itself — init order, side effects, reasons for odd decisions]

## Next step
[One concrete action]
```

**Recovery after /compact:**
The user will write "восстанови контекст из обсидиана" — you do
`search_notes` → `read_note` on the latest checkpoint → announce what was restored.
Read it verbatim, don't paraphrase or interpret.
