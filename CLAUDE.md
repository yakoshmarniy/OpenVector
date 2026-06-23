# OpenVector

Опенсорсный векторный редактор — бесплатная альтернатива Adobe Illustrator.
Целевая аудитория: дизайнеры, которым нужна бесплатная альтернатива Illustrator.
GitHub: https://github.com/yakoshmarniy/OpenVector  ·  Лицензия: MIT

> ⚠️ Канонический remote — **yakoshmarniy** (см. «Git и релизы»). В исходном тексте
> плана был указан `koshmrniy/OpenVector` — это 404, не использовать.

---

## Стек

- **Vite** — сборка
- **React** — UI (функциональные компоненты + хуки)
- **Paper.js** — векторная графика на canvas
- **i18next** — мультиязычность (EN по умолчанию, RU, расширяемо)
- **WebSocket** — коллаборация (фаза 19.2)
- **Electron** — десктоп (фаза 19.3, не сейчас)

---

## Карта интерфейса

```
┌──────────────────────────────────────────────────────────┐
│ MENU BAR: File Edit Object Type Select Effect View Window │
├──────────────────────────────────────────────────────────┤
│ CONTROL BAR (контекстная под выбранный инструмент/объект) │
├──────┬───────────────────────────────────────┬───────────┤
│ TOOL │                                       │PROPERTIES │
│ BAR  │            CANVAS                      │ + PANELS  │
│      │        (холст + артборды)             │ (Layers,  │
│ Fill │                                       │  Color,   │
│Stroke│       [Contextual Task Bar]           │  Swatches │
│Modes │                                       │  …)       │
├──────┴───────────────────────────────────────┴───────────┤
│ STATUS BAR: масштаб | единицы | артборд | инфо           │
└──────────────────────────────────────────────────────────┘
```

---

## План разработки (20 фаз)

**Авторитетный план.** Нумерация: **Фаза.Итерация** (например 3.2 = фаза 3, вторая
итерация). Одна итерация = один промпт = посильный кусок на сессию. Claude берёт ОДНУ
итерацию, реализует её пункты, коммитит, обновляет статус, останавливается. Не лезть в
следующую итерацию без явной просьбы. Порядок пунктов внутри итерации можно менять, если
так логичнее.

> Чеклисты ниже — список задач. **Фактическое состояние выполнения на сейчас** — в
> разделе «Текущий статус → Сверка с планом 20 фаз». Чтобы не вести учёт в двух местах,
> галочки в самом плане оставлены пустыми.

Карта: итерации 1–7 → рабочий MVP · 8–14 → паритет с Illustrator ·
15–17 → профессиональный уровень · 18–20 → AI, плагины, коллаборация, релиз.

### ФАЗА 1 — Каркас и холст

**1.1 — Layout приложения**
- [ ] Структура окна: Menu Bar, Control Bar, Toolbar, Canvas, Properties, Status Bar
- [ ] Тёмная тема, базовые стили, разметка панелей (пока пустых)
- [ ] Status Bar: поля под масштаб, единицы, активный артборд

**1.2 — Холст и навигация**
- [ ] Холст на весь экран (Paper.js)
- [ ] Зум (колесо), панорамирование (пробел+drag), Rotate View
- [ ] Rectangle Tool (рисование drag-ом) — проверка что движок работает
- [ ] Contextual Task Bar (всплывает под выделением)

### ФАЗА 2 — Выделение и Toolbar

**2.1 — Toolbar и инструменты выделения**
- [ ] Toolbar: одна/две колонки, drawer со всеми инструментами, группировка (зажать → вложенные)
- [ ] Selection, Direct Selection, Group Selection
- [ ] Magic Wand, Lasso
- [ ] Hand, Zoom

**2.2 — Bounding box и трансформации мышью**
- [ ] Bounding box: масштаб, поворот, Reset Bounding Box
- [ ] Reference Point selector (9 позиций)
- [ ] Модификаторы: Shift (пропорции/45°), Alt (от центра / копия при drag)
- [ ] Nudge стрелками (настраиваемый шаг), Transform Again
- [ ] Drawing Modes (Normal/Behind/Inside), Screen Modes (клавиша F)

### ФАЗА 3 — Фигуры

**3.1 — Примитивы**
- [ ] Rectangle, Rounded Rectangle, Ellipse, Polygon, Star, Line, Arc, Spiral, Flare
- [ ] Live shapes (виджеты на холсте, скругление углов)

**3.2 — Заливка и обводка**
- [ ] Заливка цветом
- [ ] Обводка (цвет, толщина, тип, концы, углы, пунктир, стрелки)
- [ ] Прозрачность / Opacity

### ФАЗА 4 — Pen и рисование

**4.1 — Pen и кривые**
- [ ] Pen Tool, Add/Delete/Convert Anchor Point, Curvature Tool

**4.2 — Свободное рисование и резка**
- [ ] Pencil, Smooth, Path Eraser, Join, Paintbrush, Blob Brush, Shaper
- [ ] Eraser, Scissors, Knife
- [ ] Rectangular/Polar Grid Tools

### ФАЗА 5 — Текст

**5.1 — Type Tools**
- [ ] Point, Area, on a Path, Vertical (все варианты), Touch Type

**5.2 — Шрифты**
- [ ] Системные шрифты, загрузка .ttf/.otf, Google Fonts, менеджер, превью
- [ ] Retype (распознать шрифт из изображения)

**5.3 — Типографика**
- [ ] Character панель (размер, кернинг, трекинг, baseline shift, leading)
- [ ] Paragraph панель (выравнивание, отступы, интервалы)
- [ ] Create Outlines, Find Font, Change Case, Smart Punctuation
- [ ] Threaded Text, Text Wrap, Show Hidden Characters, Fit Headline
- [ ] Tabs, Glyphs панели

### ФАЗА 6 — Организация объектов

**6.1 — Порядок, группы, слои**
- [ ] Arrange (Bring to Front/Back, Forward/Backward)
- [ ] Align панель (выравнивание + Distribute; объекты/холст/артборд)
- [ ] Group/Ungroup, Lock/Unlock, Hide/Show
- [ ] Isolation Mode (двойной клик, хлебные крошки, затемнение)
- [ ] Layers панель (создание, удаление, переименование, скрытие, блокировка, sublayers, drag между слоями)

**6.2 — Pathfinder и path-операции**
- [ ] Pathfinder панель (Add, Subtract, Intersect, Exclude, Divide, Trim, Merge, Crop, Outline)
- [ ] Shape Builder Tool
- [ ] Compound Path (Make/Release)
- [ ] Path-операции: Join, Average, Outline Stroke, Offset Path, Simplify, Split Into Grid, Clean Up

### ФАЗА 7 — Трансформации и деформация

**7.1 — Базовые трансформации**
- [ ] Transform панель (X, Y, W, H, угол, shear, Scale Strokes & Effects)
- [ ] Rotate, Reflect (+ Flip H/V), Scale, Shear, Reshape, Transform Each (Relative/Absolute)
- [ ] Free Transform (+ Perspective Distort, Free Distort, Constrain)

**7.2 — Деформация и ширина**
- [ ] Puppet Warp (black/white pins, мин. 3, Show Mesh, Rotate pin, Select All Pins)
- [ ] Width Tool, Variable Width Profiles
- [ ] Dimension Tool, Measure Tool

**7.3 — Liquify**
- [ ] Warp, Twirl, Pucker, Bloat, Scallop, Crystallize, Wrinkle
- [ ] Опции: Width/Height, Intensity, Simplify, Twirl Rate, Detail, Complexity, Brush Affects Anchor Points / In-Out Tangent Handles

### ФАЗА 8 — Цвет

**8.1 — Базовый цвет и Swatches**
- [ ] Color панель (RGB/HSB/CMYK/Hex/Lab), Color Picker (превью, out-of-gamut)
- [ ] Eyedropper
- [ ] Swatches панель: Global Colors, Spot Colors, Pantone (TPX/TCX, Coated/Uncoated), Color Books
- [ ] Create Swatch из изображения (Object Mosaic), Create Swatch Info
- [ ] Document Color Mode (RGB/CMYK)

**8.2 — Гармонии и Recolor**
- [ ] Color Guide: Harmony Rules (Complementary, Monochromatic, Triad, Analogous, High Contrast, Pentagram), вариации (Tints/Shades, Warm/Cool, Vivid/Muted)
- [ ] Recolor Artwork (полный диалог): Harmony Rules, base color, Link/Unlink, рандомизация порядка/насыщенности, Add/Remove Color, ограничение библиотекой
- [ ] Цветовые круги: smooth / segmented / color bars; H/S/B sliders

### ФАЗА 9 — Градиенты, обводка, стили

**9.1 — Градиенты и Mesh**
- [ ] Gradient панель + Gradient Tool: линейный, радиальный, конический
- [ ] Gradient presets, dither, перцептивная интерполяция
- [ ] Mesh Tool, Create Gradient Mesh

**9.2 — Stroke, Appearance, стили**
- [ ] Stroke панель (полная: профили ширины, стрелки независимого размера)
- [ ] Appearance панель (несколько заливок/обводок на объекте)
- [ ] Graphic Styles панель (сохранить/применить набор)

### ФАЗА 10 — Эффекты

**10.1 — Архитектура и Stylize**
- [ ] Raster vs vector effects, Document Raster Effects Settings (dpi), редактирование через Appearance, Apply Last Effect
- [ ] Stylize: Drop Shadow, Inner/Outer Glow, Feather, Round Corners, Scribble (опции), Add Arrowheads

**10.2 — Warp и Distort**
- [ ] Warp: Arc, Arch, Bulge, Shell, Flag, Wave, Fish, Rise, Fisheye, Inflate, Squeeze, Twist
- [ ] Distort & Transform: Free Distort, Pucker & Bloat, Roughen (Smooth/Corner, Detail), Transform, Twist, Zig Zag (Relative/Absolute, Ridges)
- [ ] Effect > Pathfinder (живой), Convert to Shape, Offset Path (как эффект)

**10.3 — 3D, Photoshop, SVG**
- [ ] 3D and Materials: Extrude & Bevel, Revolve, Inflate, Rotate, Materials
- [ ] Photoshop Effects: Artistic, Blur, Brush Strokes, Distort, Pixelate, Sketch, Stylize, Texture
- [ ] SVG Filters + SVG Interactivity панель

### ФАЗА 11 — Спецтехники

**11.1 — Маски, Blend, Live Paint**
- [ ] Clipping Mask (Make/Release/Edit), Opacity Mask
- [ ] Blend Tool (Make/Release/Expand, Blend Options)
- [ ] Live Paint (Bucket, Selection, Make/Merge/Release/Gap Options/Expand)
- [ ] Blending Modes (Transparency панель: все 16 + Isolate Blending, Knockout)

**11.2 — Символы и кисти**
- [ ] Symbols: панель + Symbol Tools (Sprayer/Shifter/Scruncher/Sizer/Spinner/Stainer/Screener/Styler)
- [ ] Symbol Options: Dynamic/Static, Registration Point, 9-Slice Scaling, Break Link, Replace, Redefine, Reset Transformations
- [ ] Brushes: панель + 5 типов (Calligraphic, Scatter, Art, Pattern, Bristle)
- [ ] Brush архитектура: parameter-only vs object-based, Base Object, Colorization Method, Apply/Leave Strokes, Brush Libraries

**11.3 — Паттерны, Repeat, Envelope, Perspective**
- [ ] Pattern Options (Tile Types: Grid, Brick, Hex), паттерн как заливка/обводка
- [ ] Intertwine (Make/Edit/Release)
- [ ] Repeat: Radial, Grid, Mirror (виджеты, instances, spacing, Expand)
- [ ] Envelope Distort (Warp/Mesh/Top Object, Edit/Release)
- [ ] Perspective Grid + Selection Tool

### ФАЗА 12 — Изображения и трассировка

**12.1 — Вставка растра**
- [ ] Place (вставить растр/SVG), Links панель
- [ ] Crop Image, Rasterize, Create Object Mosaic

**12.2 — Image Trace**
- [ ] Image Trace (Make/Expand/Release) + панель (порог, цвета, детализация, пути, углы, пресеты)

### ФАЗА 13 — Артборды, сетки, навигация

**13.1 — Артборды**
- [ ] Artboard Tool: несколько артбордов, rename (в т.ч. множественный), resize, duplicate, Fit to Artwork, Rearrange, Artboards панель

**13.2 — Сетки, направляющие, привязка**
- [ ] Rulers, Guides (Make/Lock/Clear/from Object, стиль Lines/Dots, цвет), Smart Guides
- [ ] Snapping: to Grid, Pixel, Point, Glyph, Tangent; limit to active artboard; tolerance

**13.3 — Режимы просмотра**
- [ ] Preview/Outline (Ctrl+Y), Pixel Preview, Overprint Preview, Transparency Grid
- [ ] Show/Hide: Bounding Box, Edges, Text Threads, Gradient Annotator
- [ ] Navigator, Info панели; New View, New Window (dual-monitor)

### ФАЗА 14 — Файлы, экспорт, печать

**14.1 — Открытие и сохранение**
- [ ] File: New (+ из шаблона), Open/Recent, Save/Save As/Save a Copy, Revert, стартовый экран, вкладки документов
- [ ] Импорт/открытие: SVG, PNG, JPG, TIFF, PDF, EPS, попытка .ai; drag&drop в окно

**14.2 — Экспорт растра и SVG**
- [ ] Export As: PNG, JPG, TIFF, BMP, GIF, WebP; Export for Screens; Export Selection
- [ ] SVG-экспорт (полный): Minify, Presentation Attributes/Inline/Internal CSS, Object IDs, decimal precision, responsive, global swatches → CSS variables, Use Artboards
- [ ] Save as PDF, EPS; Package
- [ ] Web: Slices (+ URL), Image Maps, rollover, SVG Interactivity

**14.3 — Допечатная подготовка**
- [ ] Bleed, Trim/Crop/Registration Marks, Overprint Preview/Fill/Stroke, Separations Preview, Ink Manager
- [ ] Color Management: Assign/Convert Profile, Color Settings, Flattener Preview, Transparency Flattener Presets, Proof Setup/Colors, Gamut Warning

### ФАЗА 15 — Меню, настройки, рабочее пространство

**15.1 — Меню Edit и Select**
- [ ] Edit: Cut/Copy/Paste (+ in Place, in Front/Back, on All Artboards), Find/Replace, Check Spelling, Define Pattern, Edit Colors (Adjust/Saturate/Desaturate/Invert/Convert Grayscale)
- [ ] Select: All/Deselect/Reselect/Inverse, Same (Fill/Stroke/Opacity/Mode), Object (Text/Masks/Stray Points), Save Selection, Above/Below

**15.2 — Preferences**
- [ ] 15 разделов: General (Keyboard Increment, Constrain Angle, Corner Radius, Anti-aliasing, Reset), Selection & Anchor Display, Type, Units & Undo, Guides & Grid, Smart Guides, Slices, Hyphenation (+ user dictionary), Plug-ins & Scratch Disks, User Interface (тема, яркость, масштаб UI), Performance (GPU), File Handling & Clipboard, Appearance of Black, Devices
- [ ] Search Preferences (Ctrl+K → сразу поиск)
- [ ] Keyboard Shortcuts (кастомизация, экспорт/импорт наборов)

**15.3 — Рабочее пространство и ввод**
- [ ] Workspace (сохранить/переключить/сбросить, пресеты), Control Bar, Properties Panel, Discover Panel
- [ ] Единицы (px/pt/mm/cm/inch), Document Setup, метаданные, ICC профили
- [ ] Управление/ввод: контекстное меню, multi-touch, графический планшет (давление/наклон)
- [ ] Поведение панелей: float/dock, Tab/Shift+Tab, полноэкранный, сохранение раскладки, Application Frame

### ФАЗА 16 — Автоматизация

**16.1 — Actions и Graphs**
- [ ] Actions панель (запись, воспроизведение, batch, Delete Unused Panel Items)
- [ ] Scripts (поддержка .jsx)
- [ ] Graph Tool (9 типов: Column, Stacked Column, Bar, Stacked Bar, Line, Area, Scatter, Pie, Radar)
- [ ] Graph Type Options (оси Value/Category, Drop Shadow, Legend, Column/Cluster Width), Graph Data, Graph Design

**16.2 — Variables / Data Merge**
- [ ] Variables панель: типы (Text @, Linked File, Graph %, Visibility #)
- [ ] Capture Data Set, Save/Load Library (XML), batch-вывод, импорт CSV

### ФАЗА 17 — Восточноазиатская типографика (CJK)

**17.1 — Японский набор: основы**
- [ ] Show East Asian Options, Composite Fonts (Kanji/Kana/Roman/Number/Punctuation)
- [ ] Tsume, Aki, Mojisoroe
- [ ] Mojikumi (пресеты JIS X 4051: YakumonoHankaku, GyomatsuYakumono*, TsumeGumi, BetaGumi; custom Basic/Detailed/Stretched)
- [ ] Kinsoku (Hard/Soft, Push In/Out First/Out Only, Bunri-Kinshi, Burasagari, custom)

**17.2 — Спец-функции и OpenType**
- [ ] Tate-chu-yoko, Warichu, Ruby/Furigana, Kenten, Shatai, Kurikaeshi
- [ ] OpenType панель (Ligatures Standard/Discretionary/Contextual, Swash, Stylistic Alt/Sets, Titling, Figure types, Position, Ordinals, Fractions, Proportional/Tabular Metrics)

### ФАЗА 18 — AI (на пользовательских ключах)

**18.1 — Подключение и генерация**
- [ ] AI Integration: менеджер ключей (6 провайдеров), Test, выбор модели, индикатор расхода, «ключи только на устройстве»
- [ ] Генерация: Text to Vector (+ Style Reference, редактируемый текст), Generative Shape Fill, Generative Expand, Generate Pattern/Palette/Variations/Icon Set/Background

**18.2 — Обработка и умный UI**
- [ ] Обработка: AI Image Trace, Remove Background, Auto-colorize, Style Transfer, Auto-simplify, Smart Crop Marks, AI Retype
- [ ] Умный UI: Natural Language Commands, AI Suggestions, Auto-align, Smart Duplicate, Discover Panel

### ФАЗА 19 — Платформа: плагины, коллаборация, десктоп

**19.1 — Плагины**
- [ ] Plugin API + Manager (установка из .zip/GitHub URL, sandbox, документация)

**19.2 — Коллаборация**
- [ ] WebSocket: курсоры в реальном времени, комментарии, история изменений, Share link, Cloud Documents

**19.3 — Electron (десктоп)**
- [ ] Нативное меню, открытие/сохранение через диалог, drag&drop файлов, автообновление

### ФАЗА 20 — Производительность, редизайн, релиз

**20.1 — История и производительность**
- [ ] Undo/Redo (100 шагов, история, восстановление после краша, автосохранение, бэкапы)
- [ ] Оптимизация больших файлов, lazy rendering, GPU-ускорение

**20.2 — Редизайн**
- [ ] UI-редизайн, светлая тема, кастомные темы, иконки, анимации, адаптивность

**20.3 — Релиз**
- [ ] Все горячие клавиши (совместимость с Illustrator), онбординг
- [ ] README, CONTRIBUTING.md, CODE_OF_CONDUCT.md, сайт, Product Hunt

---

## Модель AI — детали реализации

Пользователь вводит свой API ключ в Настройки > AI Integration. Ключ хранится **ТОЛЬКО локально** (localStorage в браузере, electron-store в десктопе). OpenVector никогда не видит ключи пользователей.

Запросы идут напрямую: устройство пользователя → API провайдера (OpenAI / Anthropic / и т.д.)

Это написано явно в интерфейсе и в README — это важно для доверия.

**UI страницы AI Integration:**
- Поле для каждого провайдера (Anthropic, OpenAI, Gemini, Stability, Replicate, Fal.ai)
- Кнопка "Test" — проверить что ключ работает
- Индикатор статуса (активен / не задан / ошибка)
- Выбор модели для каждого типа задач
- Индикатор расхода токенов (если API возвращает эту информацию)
- Предупреждение: "Ключи хранятся только на вашем устройстве"

**Поддерживаемые API (пользователь выбирает):**
- Anthropic (Claude) — текстовые команды, генерация SVG
- OpenAI (GPT-4o / DALL-E) — генерация, текстовые команды
- Google Gemini — альтернатива GPT
- Stability AI — генерация изображений
- Replicate — доступ к open-source моделям
- Fal.ai — быстрая и дешёвая генерация

---

## Структура папок

```
OpenVector/
├── CLAUDE.md              ← этот файл, читать в начале каждой сессии
├── package.json
├── vite.config.js
├── index.html
├── public/
└── src/
    ├── main.jsx           ← точка входа
    ├── App.jsx            ← корневой компонент
    ├── canvas/            ← вся логика Paper.js
    │   ├── tools/         ← каждый инструмент отдельным файлом
    │   ├── operations/    ← булевы, трансформации, path-операции
    │   └── effects/       ← эффекты, фильтры (фаза 10)
    ├── components/
    │   ├── Toolbar/       ← левая панель инструментов
    │   ├── Properties/    ← правая контекстная панель
    │   ├── Panels/        ← плавающие панели (Layers, Color, Swatches…)
    │   ├── MenuBar/       ← верхнее меню
    │   ├── ControlBar/    ← контекстная панель под меню
    │   ├── StatusBar/     ← нижняя строка
    │   ├── Canvas/        ← обёртка холста
    │   └── AIPanel/       ← AI-инструменты (фаза 18)
    ├── state/             ← глобальное состояние, история (undo/redo)
    ├── i18n/              ← переводы EN и RU
    ├── plugins/           ← система плагинов (фаза 19)
    └── styles/            ← глобальные стили, темы
```

> Реальное состояние дерева на сейчас: есть `canvas/{tools,operations}`,
> `components/{MenuBar,ControlBar,Toolbar,Properties,Canvas,StatusBar}`, `styles/`.
> Папки `effects/`, `Panels/`, `AIPanel/`, `state/`, `i18n/`, `plugins/` появятся по мере
> соответствующих фаз. (Временный `TopBar/` удалён — его заменили Menu Bar + Control Bar.)

---

## Соглашения по коду

- Каждый инструмент — отдельный файл в `src/canvas/tools/`
- Компоненты — функциональные, с хуками
- Стили — **CSS Modules** (решение сессии 1, без доп. зависимостей)
- Все строки UI через `t('key')` — без хардкода (когда подключим i18next)
- Коммиты на английском: `feat:`, `fix:`, `refactor:`
- Никаких console.log в продакшне

---

## Git и релизы

**Каждая завершённая итерация заливается на GitHub как отдельное нововведение.**
Это постоянное указание пользователя — отдельного подтверждения на пуш итерации не нужно
(предусловия ниже должны быть выполнены).

Порядок (после того как итерация собрана `npm run build` и проверена в браузере):
1. Один коммит на итерацию: `feat: phase X.Y — <короткое название>` (английский).
   В конце коммита — trailer `Co-Authored-By: ...` (как требует харнесс).
2. `git push origin main`.
3. Тег на итерацию: `git tag phase-X.Y -m "<название>"` → `git push origin phase-X.Y`.
4. Если итерация частичная — пушим что готово, в теле коммита перечисляем отложенное.

**Теги — история нумераций:**
- `iter-1`…`iter-8` — самый первый план (история).
- `np-1`…`np-5` — план «61 итерация» (история). np-5 = свободное рисование.
- `phase-X.Y` — текущий план 20 фаз. Так тегаем дальше.

**Предусловия (✅ выполнены 2026-06-20):**
- OpenVector — отдельный git-репозиторий (`.git` в папке, ветка `main`).
- Remote: `origin` → `git@github.com:yakoshmarniy/OpenVector.git` (SSH).
- Авторизация: SSH-ключ `~/.ssh/id_ed25519` добавлен в аккаунт `yakoshmarniy`, пуш работает.
- Залито: `main` + теги по `np-5` включительно. Дальше пушим каждую итерацию по правилу выше
  (`GIT_SSH_COMMAND='ssh -o BatchMode=yes' git push`).

---

## Мультиязычность

- Язык по умолчанию: English
- Поддерживаемые: EN, RU
- Библиотека: i18next + react-i18next
- Все строки интерфейса через t('key') — никаких хардкод строк в компонентах

---

## Текущий статус

### Сессия 1 — прогресс (✅ завершена)

- [x] 1. Структура папок создана (точно как в этом файле)
- [x] 2. Инициализация Vite + React
- [x] 3. Подключён Paper.js
- [x] 4. Базовый холст на весь экран, тёмный фон
- [x] 5. Зум (колёсико) и панорамирование (пробел + drag)
- [x] 6. Инструмент Rectangle (рисование прямоугольника drag-ом)
- [x] 7. Минимальная панель инструментов слева (Select, Rectangle)

Решение по стилям: **CSS Modules** (без доп. зависимостей).
i18next пока не подключаем — это отдельный пункт чеклиста, не входит в задачи этой сессии.

Запуск: `npm install` → `npm run dev`. Сборка: `npm run build` (проверена, проходит).

Заметки / решения сессии 1:
- ID инструментов вынесены в `src/canvas/tools/toolIds.js` — иначе циклический импорт
  (App ↔ Toolbar/Canvas) ловит TDZ и приложение не монтируется.
- Координаты мыши берём из `clientX/Y − rect` холста, не из `offsetX` — слушатели
  mousemove/mouseup висят на `window`, чтобы тянуть фигуру за пределами холста.
- StrictMode выключен в `main.jsx`, иначе `paper.setup()` вызывается дважды.
- Select делает минимум: клик — выделить, drag — переместить. Без масштаба/поворота.

### Сессия 2 — прогресс (✅ завершена)

Объём согласован с пользователем: трансформация фигур + новые инструменты.

- [x] Маркеры-ручки у выделенной фигуры (8 шт.) — изменение размера мышкой
- [x] Модификаторы: Shift при рисовании = квадрат/круг; Shift при ресайзе = пропорции;
      Shift для линии = угол кратно 45°
- [x] Delete/Backspace — удалить выделенное; Escape — снять выделение
- [x] Курсоры при наведении (resize над ручкой, move над фигурой)
- [x] Инструмент Ellipse (эллипс/круг, drag-ом)
- [x] Инструмент Line (линия, drag-ом)

Заметки / решения сессии 2:
- Оверлей выделения (рамка + 8 ручек) живёт в `src/canvas/operations/selection.js`,
  помечен `data.isSelectionOverlay` и `locked` → исключён из hit-теста и (в будущем) экспорта.
  Ручки имеют постоянный экранный размер (`8px / zoom`), перерисовываются при зуме.
- **Фикс размера холста**: Paper пишет inline `width/height` на `<canvas>`, поэтому
  раннее измерение (до применения CSS-модулей) замораживало высоту на 150px.
  Решение — обёртка `.stage` + `ResizeObserver` по ней (не по самому canvas,
  иначе обратная связь). См. `Canvas.jsx`.
- Ресайз через `item.bounds`; осезависимые фигуры (горизонт/вертикаль линии)
  с нулевой стороной не ресайзятся (защита от деления на ноль), но двигаются.

### Сессия 3 — прогресс (✅ завершена)

Объём согласован с пользователем: панель свойств справа.

- [x] Компонент `components/Properties/` — панель справа, всегда видна
- [x] Для выделенной фигуры: заливка (цвет + вкл/выкл), обводка (цвет + вкл/выкл),
      толщина обводки, прозрачность (слайдер 0–100%)
- [x] Двусторонняя связь: выделение → панель читает стиль; правка в панели → фигура меняется
- [x] Пустое состояние «Nothing selected», когда ничего не выбрано

Заметки / решения сессии 3:
- Мост между Paper-выделением и React: `selection.js` принимает `onChange` →
  `selectTool(ctx)` → `Canvas` прокидывает `onSelectionChange` в App. App хранит
  ref на paper-item и снапшот стиля в state. Уведомление шлётся только при смене
  выделения (не при move/resize).
- Чтение/запись стиля — `src/canvas/operations/itemStyle.js` (`readStyle`/`applyStyle`),
  чтобы App не лез в paper напрямую. Цвета через `color.toCSS(true)` → hex для `input[type=color]`.
- При выключенном fill/stroke последний выбранный цвет сохраняется в state (свотч не
  сбрасывается в дефолт).
- В `Canvas.onKeyDown` добавлен гард: если фокус в `<input>`/`<textarea>`, шорткаты
  (Space/Delete/Backspace) игнорируются — иначе ломался ввод в полях панели.

### Сессия 4 — прогресс (✅ завершена)

Объём согласован с пользователем: Pen Tool (кривые Безье).

- [x] Инструмент Pen: клик — угловая точка, клик+drag — гладкая точка (зеркальные ручки)
- [x] Закрытие пути кликом по первой точке; Enter/Escape — завершить открытый путь
- [x] Живой предпросмотр (rubber-band кривая к курсору) + маркеры точек
- [x] Закрытый путь → заливка+обводка; открытый → только обводка
- [x] Pen-пути полноценно работают с Select (move/resize) и панелью свойств

Заметки / решения сессии 4:
- **Важный баг Paper.js**: присвоение цвета *строкой* (`item.fillColor = '#...'`)
  хранит её лениво; второе присвоение цвета до рендера кидает
  `Cannot create property '_canvasStyle' on string`. В headless-превью RAF задушен,
  поэтому путь не рендерится между операциями и баг проявляется. Решение — везде в
  penTool оборачиваем цвета в `new paper.Color(css)` (хелпер `color()`).
  (Другие инструменты не падали, т.к. их фигуры рендерятся до повторной правки цвета.)
- Pen — stateful-инструмент (мультиклик), в отличие от drag-once. Состояние пути живёт
  в замыкании `createPenTool`; `finish()` обнуляет `path` (по close/Enter/Escape/deactivate).
- Оверлеи пера (точки, rubber-band) помечены `data.isPenOverlay` + `locked`, удаляются в finish.

### Сессия 5 — прогресс (частично завершена)

Объём: итерация 5 «Текст». Сделана основа, две сложные подфичи отложены.

- [x] Инструмент Text: point text (клик) и area type (drag-рамка), редактирование на холсте
- [x] Каретка, ввод символов/пробела/Enter/Backspace, Escape/смена инструмента = commit, пустой текст отбрасывается
- [x] Перенос по словам внутри area-рамки
- [x] Панель: выравнивание (L/C/R), размер шрифта, межстрочный интервал
- [x] Текст работает с Select (move) и панелью (цвет = заливка)
- [x] Селект-оверлей перерисовывается после правок в панели (refreshSelection)
- [x] Редактирование текста после размещения: двойной клик по тексту (из любого инструмента) → правка
- [x] Левый рейл в стиле Illustrator: похожие инструменты сгруппированы в один слот с flyout
      (Rectangle/Ellipse/Line); слот помнит последний выбранный. Верхний бар — только бренд,
      инструменты НЕ дублируются сверху и сбоку
- [ ] Type on a Path — отложено (итерация 5b)
- [ ] Межбуквенный интервал — отложено (итерация 5b)

Заметки / решения сессии 5:
- Paper.js НЕ умеет area-wrapping/type-on-path/letter-spacing. Перенос делаем сами:
  raw-текст в `item.data.rawText`, отображаемый (с переносами) считаем в
  `src/canvas/operations/textLayout.js` (`wrap`/`relayout`/`caretSegment`). Замер ширины —
  временный PointText.
- Редактирование — захват клавиш (без overlay-textarea): зум/пан-безопасно, интегрировано с Paper.
  Canvas видит `tool.wantsKeyboard()` → при true все клавиши (вкл. Space) идут в инструмент, не в pan.
- Каретка/рамка пера-текста помечены `data.isTextOverlay` + locked, чистятся на commit.
- Цвета в text/caret — через `new paper.Color(...)` (см. грабли из сессии 4).
- **Сессия 5b — посимвольный движок текста**: текст теперь = `paper.Group` глифов-`PointText`
  (`data.glyph`), всё состояние в `group.data` (rawText, mode point/area/path, fontSize, leading,
  tracking, justification, fillColor/strokeColor, origin, areaWidth/Height). `textLayout.js`:
  `relayout` раскладывает глифы (ширины символов меряем offscreen-canvas `measureText`), `layoutPath`
  ставит глифы вдоль клона пути (`getPointAt`/`getTangentAt` + поворот). Это дало tracking и
  type-on-path. Глифы — в ЛОКАЛЬНЫХ координатах группы (origin), поэтому move через матрицу +
  повторный relayout не «уезжают». `isTextItem` теперь = `data.isText`; `textEntity` поднимает
  клик по глифу к группе. Type on path: клик инструментом Text по обычному пути → клонируем путь
  в скрытый guide-child, оригинал не трогаем (безопасно при пустом commit).
- **Хит-тест текста**: `paper.hitTest` по `PointText` ненадёжен (ловит только по глифам).
  Общий `pickItem(point)` в `selection.js`: сперва `hitTest` (фигуры), затем фолбэк по
  области текста `hitRegion(item)` (bounds ∪ рамка area-текста) — клик в любом месте текста/рамки.
  Используется в Select, Text и dblclick. Поэтому текст выделяется/двигается/правится кликом.
  Для area-текста в `data.areaHeight` хранится высота рамки (для кликабельной пустой части).
- Добавлен мост `refreshRef`: App после правки стиля зовёт `tool.refreshSelection()` →
  ручки выделения отслеживают изменение размера текста/толщины обводки.
- Двойной клик по тексту: Canvas ловит `dblclick` → `onEditText(item)` → App ставит
  `pendingEditRef` + переключает на Text → textTool в `consumePendingEdit()` начинает правку.
  Клик по уже редактируемому тексту = no-op (не коммитит/не создаёт новый).
- Иконки+список инструментов вынесены в `src/components/toolItems.jsx` (общий источник).
- Лейаут App колоночный: `TopBar` (только бренд) сверху, ниже строка `.app-body` (рейл/холст/панель).
- `Toolbar` группирует инструменты (`GROUPS`): мультислот показывает представителя
  (последний выбранный), треугольник в углу открывает flyout-поповер со всеми вариантами.
  Закрытие — клик вне рейла или Escape. Дублирования инструментов сверху больше нет.

### Сессия 6 — прогресс (✅ завершена)

Объём: итерация 6 — группировка + булевы операции.

- [x] Мульти-выделение в `selection.js` (массив `targets`): Shift+клик toggle, рамка-объединение
      + тонкая рамка по каждому объекту; ручки ресайза только при одном выделенном.
- [x] Marquee (рамка протягиванием по пустому месту) → выделяет пересечённые объекты; Shift добавляет.
      Реализовано в `selectTool` (mode 'marquee', оверлей-прямоугольник). Главный способ выбрать несколько.
- [x] `pickItem` маппит клик в верхнеуровневый объект (`topLevel`) → клик по части группы берёт группу.
- [x] `src/canvas/operations/booleans.js`: `groupItems`/`ungroupItems`/`booleanOp` (Paper нативно).
- [x] `selectTool.runAction(name)` (group/ungroup/unite/subtract/intersect/exclude); мост `actionRef` App→Canvas→tool.
- [x] Панель Properties контекстная: 0 — пусто; 1 — стиль; 1 группа — Ungroup; 2+ — «N selected» + Group + 4 булевы.
- [x] Шорткаты Cmd/Ctrl+G и Cmd/Ctrl+Shift+G в `Canvas.onKeyDown`.

Заметки / решения сессии 6:
- `onSelectionChange` теперь передаёт МАССИВ targets; App нормализует (item|null|array) и держит `sel {count,isGroup,style}`.
- subtract = нижний минус верхние (сортировка по `item.index`). Булевы только на Path/CompoundPath (текст/группы пропускаем).
- Разгруппировка только для обычных групп (не `data.isText`).
- **Латентный фикс текста**: текст-группе ставим `applyMatrix = false`, иначе перемещение «запекалось» бы в
  глифы и relayout после move сбрасывал бы позицию. Проверено: move+правка сохраняют позицию.

### Сессия 7 — прогресс (✅ завершена)

Объём: новая итерация np-5 (по плану «61») = свободное рисование. По новому плану это **фаза 4.2** (частично).

- [x] Pencil, Smooth, Path Eraser, Join, Paintbrush, Blob Brush — 6 инструментов.
- [x] Общий хелпер `src/canvas/operations/freehand.js` (`col`, `overlayed`, `pathAt`, `createBrush`).
- [x] Pencil/Paintbrush — `createBrush` + `path.simplify`. Blob Brush — круги-штампы → unite в заливку, merge перекрытий.
- [x] Smooth — `path.simplify` (скругляет/убирает шум). Path Eraser — `splitAt` диапазона → разрыв. Join — reverse+addSegments / замыкание.
- [x] Залито, тег `np-5`.

Заметки / решения сессии 7:
- Blob Brush: штампы держим МАССИВОМ кругов прямо в слое, не в Group — иначе `clone({insert:true})`
  кладёт клон внутрь группы, и результат boolean-операции тоже попадает в группу → `stamps.remove()`
  сносит готовую заливку.
- Headless-превью: `paper.view.update()` рисует ТОЛЬКО если view «грязный» (`_needsUpdate`). После правок
  через хендлеры флаг бывает уже сброшен → update() = no-op, экран и `getImageData` пустые. Форс-редрав:
  `layer.opacity=0.999; view.update(); layer.opacity=1; view.update();`. `requestAnimationFrame` в headless
  НЕ срабатывает (eval с RAF виснет на 30с) — не использовать для форс-редрава.

### Сессия 8 — прогресс (✅ завершена)

Объём: завершение **фазы 4.2** (план 20 фаз). Также: переписан CLAUDE.md под план «20 фаз».

- [x] Eraser (`eraserTool.js`) — круги-штампы → unite → subtract из перекрытых закрытых путей.
- [x] Scissors (`scissorsTool.js`) — `pathAt` + `getNearestLocation` + `splitAt`. Открытый → 2 пути; закрытый → открывается.
- [x] Knife (`knifeTool.js`) — freehand-линия; для каждой закрытой фигуры: chord ножа между крайними
      пересечениями + две дуги границы → 2 закрытых куска. Площадь сохраняется, без остатков.
- [x] Shaper (`shaperTool.js`) — распознавание по доле площади (area/bbox): >0.82 прямоугольник,
      >0.62 эллипс, >0.38 треугольник, тонкий жест → линия, иначе сглаженный путь.
- [x] Rectangular Grid (`rectangularGridTool.js`) — drag-бокс → Group (рамка + 4+4 делителя), Shift=квадрат.
- [x] Polar Grid (`polarGridTool.js`) — drag-бокс → Group (4 кольца + 8 спиц), Shift=круг.
- [x] Toolbar: Shaper в группу карандаша; Grid-инструменты в группу линии; новая группа Eraser/Scissors/Knife.

Заметки / решения сессии 8:
- Knife: `getIntersections(target, knife)` даёт CurveLocation с `.intersection` (точка на ноже).
  `arcOf` извлекает дугу границы через clone+`splitAt` (как в Path Eraser), `trimOpen` — chord ножа.
  `path.join(other, tol)` соединяет дугу с chord и УДАЛЯЕТ other. Куски валидируем по `area>0.5`.
- Knife/Eraser режут только ЗАКРЫТЫЕ пути (Path с `closed` / CompoundPath). Открытые штрихи пропускаем.
- Грабли теста (не кода): `onMouseUp` НЕ добавляет финальную точку (как у всех инструментов) —
  в синтетических тестах ножа надо тянуть `onMouseDrag` за пределы фигуры, иначе один пересек → нет реза.

### Сессия 9 — прогресс (✅ завершена)

Объём: **фаза 5.1** добита — вертикальный текст (все 3 варианта) + Touch Type.

- [x] Вертикальная ориентация в движке (`textLayout.js`): `d.orientation`, `layoutVertical`
      (глифы вниз по колонке, колонки влево — tategaki), `verticalColumns` (перенос по высоте для area),
      vertical-on-path (поворот глифа на `tan.angle − 90`), вертикальная каретка, hitRegion для vertical area.
- [x] `textTool.js` рефакторнут в общий `makeTextTool(ctx,{orientation})`; экспортит `createTextTool`
      (горизонт.) и `createVerticalTextTool` (верт.). Один верт-инструмент покрывает point/area/on-path
      по жесту — как и горизонтальный Type. Для verical area origin = правый-верх рамки (колонки влево).
- [x] Touch Type (`touchTypeTool.js`): клик по глифу → его трансформ (drag=сдвиг, Shift=масштаб,
      Alt=поворот) хранится в `group.data.glyphFx[index]` и переживает relayout.
- [x] Движок: relayout-постпроход проставляет `glyph.data.glyphIndex` и применяет `glyphFx` (`applyGlyphFx`).
- [x] Toolbar: группа Type = [Type, Vertical Type, Touch Type]. Иконки добавлены.

Заметки / решения сессии 9:
- Per-glyph Touch Type: фокус не на overlay-виджете с ручками (отложено), а на сдвиг/масштаб/поворот
  через модификаторы. fx применяется в relayout-постпроходе по `glyphIndex` (порядок чтения, без пробелов),
  поэтому идемпотентно и не «уезжает» при повторной раскладке/move.
- Вертикальные 3 варианта НЕ три отдельных инструмента, а один Vertical Type (как горизонтальный Type
  объединяет point/area/on-path по жесту). В тулбаре одна кнопка Vertical Type.
- Грабли headless: после `location.reload()` окно схлопывается — нужно заново `preview_resize` +
  `dispatchEvent('resize')`, иначе скриншот мелкий (view при этом уже корректный).

### Сессия 10 — прогресс (✅ завершена)

Объём: добиваем ранний пробел **фазы 1.1** — Menu Bar + Control Bar (был только временный TopBar).

- [x] `components/MenuBar/` — 8 меню (File/Edit/Object/Type/Select/Effect/View/Window), дропдауны,
      акселераторы, сепараторы, disabled-пункты для будущих фаз, чек-пункты (Snap, 2 колонки).
      Закрытие по клику вне/Escape, переключение по наведению между открытыми.
- [x] `components/ControlBar/` — контекстная строка под меню: имя инструмента + для 1 объекта
      инлайн Fill/Stroke/W/Opacity, для группы Ungroup, для 2+ align/Group/булевы.
- [x] `selectTool.runAction` расширен: selectAll, deselect, duplicate, arrangeFront/Back/Forward/Backward.
      (Arrange — формально фаза 6.1, но нужен для осмысленного меню Object; мелочь.)
- [x] Canvas: `viewRef` для view-команд (zoomIn/Out/Fit/Actual, clear=New). Шорткаты Cmd/Ctrl+A
      (Select All, +Shift = Deselect) и Cmd/Ctrl+D (Duplicate).
- [x] App: `handleCommand` маршрутизирует — view/документ-команды в Canvas через viewRef,
      команды выделения в активный инструмент через actionRef. TopBar удалён.

Заметки / решения сессии 10:
- Команды выделения (group/booleans/align/arrange/delete/selectAll/deselect) идут через
  `actionRef → tool.runAction`, т.е. работают когда активен Select (он держит выделение). На других
  инструментах выделение очищается при переключении — пункты меню тогда disabled (по `sel`). Это
  честно и согласуется с архитектурой; общий командный шин — позже (фаза 15.1).
- View-команды (zoom/fit/clear) — в Canvas через `viewRef`, не через инструмент (они уровня вида/документа).
- Zoom Fit считает union bounds всех не-overlay объектов, вписывает с полем 60px, центрирует.

### Сессия 11 — прогресс (✅ завершена)

Объём: ранний пробел **фазы 1.2** — Rotate View (поворот холста-вида).

- [x] `rotateViewTool.js` — drag вращает `paper.view.rotation` вокруг центра экрана; Shift = шаг 15°.
      Угол меряем в ЭКРАННЫХ координатах (`projectToView`), они стабильны при вращении вида.
- [x] View-меню: Rotate View 90° CW / 90° CCW / Reset Rotation → `viewRef` в Canvas.
- [x] Status Bar показывает угол поворота (нормализован к (−180,180], скрыт при 0°).
- [x] Toolbar: группа Hand = [Hand, Rotate View, Zoom]. Иконка добавлена.

Заметки / решения сессии 11:
- `paper.view.rotation` поддерживается; `viewToProject`/`projectToView` учитывают поворот, поэтому
  ВСЕ инструменты продолжают работать при повёрнутом виде (round-trip точки проверен).
- Поворот вращает ТОЛЬКО вид, артворк в проектных координатах не меняется.
- App держит `rotation` в state (через `onRotationChange`); прямой `paper.view.rotation=…` в тестах
  не обновляет статус-бар (артефакт теста, не баг).

### Сессия 12 — прогресс (✅ завершена)

Объём: ранний пробел **фазы 2.1** — Magic Wand, Lasso, drawer.

- [x] `magicWandTool.js` — клик по объекту выделяет все с совпадающим ВНЕШНИМ ВИДОМ: заливка (цвет)
      И обводка (цвет) И толщина обводки (TOL=0.16 по сумме RGB; WEIGHT_TOL=1px). Обводка НЕ игнорируется.
      Shift = добавить. Объектное выделение через общий `createSelection`.
- [x] `lassoTool.js` — freehand-петля выделяет ОПОРНЫЕ ТОЧКИ внутри (как Direct Selection, не всю
      фигуру). Drag выбранной точки двигает все выбранные; Backspace/Delete удаляет; Shift добавляет.
      Свой overlay (заполненный квадрат = выбрана, пустой = нет).
- [x] Drawer в `Toolbar` — кнопка «⋯» в футере открывает панель со ВСЕМИ инструментами (грид 2 кол.,
      иконка+подпись); клик выбирает инструмент и закрывает. Закрытие по клику вне рейла / Escape.
- [x] Toolbar: Magic Wand и Lasso — отдельные слоты после группы выделения. Иконки добавлены.

Заметки / решения сессии 12:
- **Правка по фидбеку**: Lasso раньше брал всю фигуру (центр внутри/пересечение) — это неверно.
  Теперь Lasso выделяет ОПОРНЫЕ ТОЧКИ петлёй (freehand Direct Selection): `loop.contains(seg.point)`
  по всем редактируемым путям; выбранные точки двигаются/удаляются прямо в инструменте. Это
  ТОЧЕЧНОЕ выделение — App.sel (объектный) не трогаем, Properties показывает «Nothing selected».
- **Правка по фидбеку**: Magic Wand игнорировал обводку (матч только по заливке при наличии fill).
  Теперь матч = заливка И обводка (цвет) И толщина. weightOf=0 если нет обводки.
- Magic Wand держит ОБЪЕКТНОЕ выделение (свой `createSelection`), репортит в App; move не делает.
  Lasso — ТОЧЕЧНОЕ, со своим overlay и своим drag точек.
- `.toolbar` получил `position: relative`, чтобы drawer позиционировался относительно рейла.

### Сверка с планом 20 фаз — что уже сделано

> Старые сессии 1–7 делались по прежним планам (теги `iter-*`, `np-*` — история).
> Ниже — соответствие текущему плану «20 фаз». Многое сделано НЕ по порядку фаз
> (прежний план шёл иначе), поэтому ранние фазы частично закрыты.

- **1.1 (Layout):** ✅ ГОТОВО — Menu Bar (8 меню с дропдаунами/акселераторами), Control Bar (контекстный), Toolbar/Canvas/Properties/Status Bar, тёмная тема
- **1.2 (Холст/навигация):** ✅ ГОТОВО — зум/пан, Rotate View (инструмент + меню View + статус-бар), Rectangle, Contextual Task Bar
- **2.1 (Toolbar/выделение):** ✅ ГОТОВО — 1/2 колонки + flyout, Select/Direct/Group, Magic Wand, Lasso, Hand/Zoom, drawer (список всех инструментов)
- **2.2 (Bounding box/трансформации):** 🟡 масштаб ручками ✅, Shift-модификаторы ✅ (частично) · ⬜ поворот ручками, Reset BB, Reference Point, Alt (от центра/копия), Transform Again, Drawing Modes, Screen Modes (F)
- **3.1 (Примитивы):** 🟡 все фигуры ✅ (Rect, Rounded, Ellipse, Polygon, Star, Line, Arc, Spiral, Flare) · ⬜ live shapes (виджеты/скругление на холсте)
- **3.2 (Заливка/обводка):** 🟡 заливка ✅, обводка цвет+толщина ✅, opacity ✅ · ⬜ тип/концы/углы/пунктир/стрелки
- **4.1 (Pen):** ✅ ГОТОВО (Pen, Add/Delete/Convert Anchor, Curvature)
- **4.2 (Свободное рисование/резка):** ✅ ГОТОВО — Pencil, Smooth, Path Eraser, Join, Paintbrush, Blob Brush, Shaper, Eraser, Scissors, Knife, Rectangular/Polar Grid
- **5.1 (Type):** ✅ ГОТОВО — Point, Area, on a Path, Vertical (point/area/on-path), Touch Type
- **5.3 (Типографика):** 🟡 размер/leading/tracking/justification ✅ · ⬜ панели Character/Paragraph/Tabs/Glyphs, Create Outlines, …
- **6.1 (Организация):** 🟡 Align + Distribute, Group/Ungroup ✅ · ⬜ Arrange (z-order), Lock/Hide, Isolation Mode, Layers панель
- **6.2 (Pathfinder):** 🟡 Add/Subtract/Intersect/Exclude ✅ · ⬜ Divide/Trim/Merge/Crop/Outline, Shape Builder, Compound Path, path-ops
- **8.1 (Цвет):** 🟡 заливка/обводка/opacity в Properties · ⬜ Color панель (RGB/HSB/CMYK/Hex/Lab), Picker, Eyedropper, Swatches, Document Color Mode
- **9.2 (Stroke/Appearance):** 🟡 толщина обводки · ⬜ полная Stroke-панель, Appearance, Graphic Styles
- **13.2 (Привязка):** 🟡 Snap to Grid, Snap to Object · ⬜ Rulers, Guides, Smart Guides, Snap to Pixel/Point/Glyph/Tangent

Общие подсистемы ещё не сделаны: **i18n (EN/RU)**, **экспорт (SVG/PNG/…)**, **слои**,
**Menu Bar / Control Bar**, **Undo/Redo** (фаза 20.1).

**Следующее по плану (ранние пробелы):** 2.2 трансформации мышью (поворот рамкой, Reset BB,
Reference Point, Alt-копия, Transform Again, Drawing/Screen Modes) · 3.1 live shapes ·
3.2 полная обводка (тип/концы/углы/пунктир/стрелки). Затем 5.2 Шрифты. Идём по возрастанию номера фаз.

> Грабли Paper: `project.getItems(fn)` с голой функцией НЕ работает (трактует fn как класс) —
> нужно `getItems({ match: fn })`. Иначе фильтр молча возвращает 0.

### Отложенные архитектурные решения

- **Единый стор выделения (инфраструктура, НЕ отдельный пункт плана).** Сейчас каждый инструмент
  держит выделение у себя (свой `createSelection`); при переключении инструментов оно сбрасывается, и
  команды меню работают только на активном Select. **Решение: сделать общий источник правды для
  выделения вместе со слоями — в фазе 6.1** (панель Layers всё равно обязана читать/задавать выделение
  из одного места, она и вынудит этот рефактор). Раньше 6.1 не трогаем — переделывать под слои.
- **Настройки выделения (фича) — фаза 15.2**, раздел Preferences → «Selection & Anchor Display»
  (допуск клика, размер/вид опорных точек, выбор объекта только по контуру и т.п.). Смежное:
  Select-меню (Same/Inverse/**Save Selection**/Above-Below) — 15.1; Isolation Mode — 6.1.

---

## Важно

Перед началом каждой сессии:
1. Прочитай этот файл
2. Проверь есть ли свежий чекпоинт в `_claude-notes/` (чекпоинты пишем в проект)
3. Спроси что делаем сегодня если непонятно
4. Идём по плану «20 фаз» по порядку, начиная с самой ранней незакрытой итерации
   (см. «Сверка с планом 20 фаз»). Не забегать вперёд без явной просьбы.

---

## Obsidian checkpoint protocol

Vault подключён к этому проекту (корень vault = корень OpenVector).
Заметки пиши в `_claude-notes/` через `mcp__obsidian-vault__write_note`.

**Когда писать чекпоинт:**
- Перед тем как пользователь напишет `/compact`
- После завершения любой значимой задачи (новый файл, баг, архитектурное решение)
- Если сессия идёт дольше 30 минут

**Формат файла:** `_claude-notes/checkpoint-YYYY-MM-DD-HH-MM.md`

**Содержание чекпоинта (verbatim, без сокращений):**

```markdown
---
type: session-checkpoint
project: OpenVector
date: [ISO datetime]
---

Проект: [[CLAUDE]]

## For future Claude

## Текущая задача
[Одно предложение — что именно делается прямо сейчас]

## Файлы изменены в эту сессию
- src/canvas/tools/pen.js:42 — [что именно сделано]
- src/components/Toolbar/Toolbar.jsx:18 — [что именно сделано]

## Решения принятые в сессию
- [Точное решение]: [точная причина почему]

## Активные ошибки / баги
[Точный текст ошибки из консоли если есть]

## Неочевидные вещи которые нужно знать
[Всё что будущий Claude не найдёт в коде сам — порядок инициализации, side effects, причины странных решений]

## Следующий шаг
[Одно конкретное действие]
```

**Восстановление после /compact:**
Пользователь напишет "восстанови контекст из обсидиана" — ты делаешь
`search_notes` → `read_note` на последний чекпоинт → объявляешь что восстановлено.
Читай дословно, не пересказывай и не интерпретируй.
