# OpenVector

Опенсорсный векторный редактор — бесплатная альтернатива Adobe Illustrator.
Целевая аудитория: графические дизайнеры, которые не хотят платить за Illustrator.
GitHub: https://github.com/yakoshmarniy/OpenVector
Лицензия: MIT

---

## Стек

- **Vite** — сборщик проекта
- **React** — UI
- **Paper.js** — векторная графика на canvas
- **i18next** — мультиязычность (EN, RU, возможность добавить ещё)
- **Electron** — десктоп (добавляем в итерации 28, не сейчас)

---

## Итерация 1 — текущая

### Фичи которые входят:

**Инструменты**
- Инструмент выделения (Select)
- Pen Tool (кривые Безье)
- Прямоугольник
- Эллипс / Круг
- Линия
- Текст (базовый)

**Редактирование**
- Перемещение объектов
- Масштабирование объектов
- Поворот объектов
- Группировка
- Порядок слоёв (вперёд / назад)
- Булевы операции (объединить, вычесть, пересечь)

**Стили**
- Заливка цветом
- Обводка (цвет + толщина)
- Прозрачность

**Экспорт**
- Сохранение в SVG
- Экспорт в PNG

**Интерфейс**
- Панель инструментов (слева)
- Панель свойств (справа)
- Холст с зумом и панорамированием
- Тёмная тема (по умолчанию)

### Фичи которые НЕ входят в итерацию 1:
- Electron (десктоп)
- Слои (панель слоёв)
- Градиенты
- Эффекты и фильтры
- Кисти
- Symbols / Swatches

> Примечание: отложенные фичи выше теперь распределены по дорожной карте ниже
> (слои → итерация 10, градиенты → 12, эффекты → 15–17, символы → 19, кисти → 20,
> Electron → 28). Авторитетный план развития — раздел «Дорожная карта».

---

## Дорожная карта

Полный план развития OpenVector — 61 итерация, разбита на 18 блоков функциональности.

### БЛОК 1 — КАРКАС ПРИЛОЖЕНИЯ

**ИТЕРАЦИЯ 1 — Основной layout и холст UI**
- Холст с зумом и панорамированием
- Тёмная тема по умолчанию
- Contextual Task Bar (всплывающая панель под выделением)
- Status Bar (масштаб, единицы измерения, информация о документе)

**ИТЕРАЦИЯ 2 — Toolbar**
- Кастомизируемый Toolbar (одна/две колонки)
- Drawer со всеми инструментами
- Группировка инструментов (зажать → показать вложенные)
- Select Tool, Direct Selection Tool, Group Selection Tool
- Hand Tool, Zoom Tool
- Fill/Stroke индикатор внизу Toolbar

### БЛОК 2 — ИНСТРУМЕНТЫ РИСОВАНИЯ

**ИТЕРАЦИЯ 3 — Фигуры**
- Rectangle Tool + Rounded Rectangle
- Ellipse Tool
- Polygon Tool
- Star Tool (live shape с виджетами на холсте)
- Line Segment Tool
- Arc Tool
- Spiral Tool
- Flare Tool

**ИТЕРАЦИЯ 4 — Pen и кривые**
- Pen Tool
- Add Anchor Point Tool
- Delete Anchor Point Tool
- Convert Anchor Point Tool
- Curvature Tool

**ИТЕРАЦИЯ 5 — Свободное рисование**
- Pencil Tool
- Smooth Tool
- Path Eraser Tool
- Join Tool
- Paintbrush Tool
- Blob Brush Tool

**ИТЕРАЦИЯ 6 — Сетки**
- Rectangular Grid Tool
- Polar Grid Tool

### БЛОК 3 — ИНСТРУМЕНТЫ ВЫДЕЛЕНИЯ

**ИТЕРАЦИЯ 7 — Select меню + инструменты**
- Magic Wand Tool
- Lasso Tool
- Select All / Deselect / Reselect / Inverse
- Select Same (Fill Color, Stroke Color, Opacity, Blending Mode)
- Select Object (Text, Clipping Masks, Stray Points)
- Save Selection / Edit Selection
- Next Object Above / Below

### БЛОК 4 — ТЕКСТ

**ИТЕРАЦИЯ 8 — Type Tools**
- Type Tool (горизонтальный)
- Area Type Tool
- Type on a Path Tool
- Vertical Type Tool
- Vertical Area Type Tool
- Vertical Type on a Path Tool
- Touch Type Tool

**ИТЕРАЦИЯ 9 — Шрифты**
- Системные шрифты
- Загрузка своих шрифтов (.ttf / .otf)
- Google Fonts (поиск и загрузка из интернета)
- Менеджер шрифтов внутри приложения
- Превью шрифта перед применением
- Retype (распознать шрифт из изображения / outlined текста)

**ИТЕРАЦИЯ 10 — Типографика**
- Character панель (размер, кернинг, трекинг, baseline shift)
- Paragraph панель (выравнивание, отступы, интервалы)
- OpenType панель
- Glyphs панель
- Tabs панель
- Find Font
- Change Case
- Smart Punctuation
- Optical Margin Alignment
- Threaded Text (связанные текстовые блоки)
- Text Wrap
- Show Hidden Characters
- Create Outlines (текст в кривые)
- Fit Headline
- Type Orientation (горизонтальный / вертикальный)

### БЛОК 5 — ЦВЕТ И СТИЛИ

**ИТЕРАЦИЯ 11 — Базовый цвет**
- Color панель (RGB / HSB / CMYK / Hex)
- Eyedropper Tool
- Заливка и обводка
- Прозрачность / Opacity
- Document Color Mode RGB / CMYK

**ИТЕРАЦИЯ 12 — Swatches и библиотеки цветов**
- Swatches панель
- Global Colors
- Spot Colors
- Color Guide (гармонии цветов)
- Recolor Artwork
- Adjust Colors / Saturate / Desaturate
- Color Theme Picker
- Recent Colors (автосохранение последних цветов)
- Copy Hex value из любой панели

**ИТЕРАЦИЯ 13 — Градиент**
- Gradient панель
- Линейный градиент
- Радиальный градиент
- Конический градиент
- Gradient Tool (редактирование на холсте)
- Dither для градиентов (сглаживание)

**ИТЕРАЦИЯ 14 — Stroke и Appearance**
- Stroke панель (толщина, тип, концы, углы, пунктир, стрелки)
- Appearance панель (несколько заливок и обводок на одном объекте)
- Graphic Styles панель (сохранить / применить набор стилей)
- Expand Appearance

### БЛОК 6 — ТРАНСФОРМАЦИИ

**ИТЕРАЦИЯ 15 — Базовые трансформации**
- Transform панель (x, y, w, h, угол, shear)
- Move (точное перемещение по координатам)
- Rotate Tool
- Scale Tool
- Reflect Tool
- Shear Tool
- Reshape Tool
- Transform Each

**ИТЕРАЦИЯ 16 — Продвинутые трансформации**
- Free Transform Tool
- Puppet Warp Tool
- Width Tool
- Variable Width Profiles
- Dimension Tool (измерение расстояний, углов, радиусов)
- Measure Tool

### БЛОК 7 — ОРГАНИЗАЦИЯ ОБЪЕКТОВ

**ИТЕРАЦИЯ 17 — Arrange и Align**
- Arrange (Bring to Front / Send to Back / Bring Forward / Send Backward)
- Align панель (выравнивание объектов)
- Distribute (равномерное распределение)
- Group / Ungroup
- Lock / Unlock All
- Hide / Show All

**ИТЕРАЦИЯ 18 — Слои**
- Layers панель
- Создание / удаление / дублирование слоёв
- Переименование, скрытие, блокировка
- Перетаскивание объектов между слоями
- Sublayers

**ИТЕРАЦИЯ 19 — Pathfinder и Shape Builder**
- Pathfinder панель (Add, Subtract, Intersect, Exclude, Divide, Trim, Merge, Crop, Outline, Hard Mix, Soft Mix, Trap)
- Shape Builder Tool
- Compound Path (Make / Release)
- Path: Join, Average, Outline Stroke, Offset Path, Simplify, Add Anchor Points, Remove Anchor Points, Divide Objects Below, Split Into Grid, Clean Up

### БЛОК 8 — СПЕЦИАЛЬНЫЕ ИНСТРУМЕНТЫ

**ИТЕРАЦИЯ 20 — Live Paint**
- Live Paint Bucket Tool
- Live Paint Selection Tool
- Make / Merge / Release / Gap Options / Expand

**ИТЕРАЦИЯ 21 — Blend**
- Blend Tool
- Make / Release / Expand
- Blend Options (шаги, расстояние, ориентация)

**ИТЕРАЦИЯ 22 — Символы**
- Symbols панель
- Symbol Sprayer Tool
- Symbol Shifter / Scruncher / Sizer / Spinner / Stainer / Screener / Styler

**ИТЕРАЦИЯ 23 — Кисти**
- Brushes панель
- Calligraphic Brush
- Scatter Brush
- Art Brush
- Pattern Brush
- Bristle Brush

**ИТЕРАЦИЯ 24 — Паттерны**
- Pattern Options панель + редактор паттернов
- Tile Types (Grid, Brick by Row, Brick by Column, Hex by Column, Hex by Row)
- Паттерн как заливка / обводка

### БЛОК 9 — ДЕФОРМАЦИЯ И ЭФФЕКТЫ

**ИТЕРАЦИЯ 25 — Liquify инструменты**
- Warp Tool
- Twirl Tool
- Pucker Tool
- Bloat Tool
- Scallop Tool
- Crystallize Tool
- Wrinkle Tool

**ИТЕРАЦИЯ 26 — Эффекты Stylize**
- Drop Shadow
- Inner Glow / Outer Glow
- Feather
- Round Corners
- Scribble
- Crop Marks

**ИТЕРАЦИЯ 27 — Эффекты Warp**
- Arc, Arc Lower, Arc Upper, Arch, Bulge
- Shell Lower / Shell Upper
- Flag, Wave, Fish, Rise, Fisheye
- Inflate, Squeeze, Twist

**ИТЕРАЦИЯ 28 — Эффекты Distort & Transform**
- Free Distort
- Pucker & Bloat
- Roughen
- Transform (эффект)
- Twist (эффект)
- Zig Zag

**ИТЕРАЦИЯ 29 — Photoshop Effects**
- Artistic (Cutout, Dry Brush, Film Grain и др.)
- Blur (Gaussian, Radial, Smart Blur)
- Brush Strokes
- Distort
- Pixelate
- Sketch
- Stylize
- Texture
- Video

**ИТЕРАЦИЯ 30 — 3D and Materials**
- Extrude & Bevel
- Revolve
- Inflate
- Rotate
- Materials (текстуры, освещение, рендер)

**ИТЕРАЦИЯ 31 — SVG Filters**
- Встроенные SVG фильтры
- Применение к объектам
- SVG Interactivity панель (события и JavaScript)

### БЛОК 10 — МАСКИ И СПЕЦТЕХНИКИ

**ИТЕРАЦИЯ 32 — Маски и разрезание**
- Clipping Mask (Make / Release / Edit Contents)
- Opacity Mask
- Scissors Tool
- Knife Tool
- Eraser Tool

**ИТЕРАЦИЯ 33 — Envelope Distort**
- Make with Warp
- Make with Mesh
- Make with Top Object
- Edit Contents / Release
- Envelope Options

**ИТЕРАЦИЯ 34 — Perspective**
- Perspective Grid Tool
- Perspective Selection Tool
- Define Grid
- Snap to Perspective Grid
- Lock Grid / Lock Station Point

**ИТЕРАЦИЯ 35 — Mesh**
- Mesh Tool
- Create Gradient Mesh
- Create Object Mosaic
- Flatten Transparency

**ИТЕРАЦИЯ 36 — Image Trace и Retype**
- Image Trace панель
- Image Trace (Make / Expand / Release)
- Image Trace настройки (порог, цвета, детализация, пути, углы)
- Retype: Match Font
- Retype: Edit Text

### БЛОК 11 — МОНТАЖНЫЕ ОБЛАСТИ И НАВИГАЦИЯ

**ИТЕРАЦИЯ 37 — Монтажные области**
- Artboard Tool
- Несколько монтажных областей
- Rename / Resize / Duplicate / Delete
- Fit to Artwork Bounds
- Rearrange All Artboards
- Artboard Options

**ИТЕРАЦИЯ 38 — Направляющие и привязка**
- Rulers (горизонтальная и вертикальная)
- Guides (Show / Hide / Lock / Make from Object / Release / Clear)
- Smart Guides
- Snap to Grid
- Snap to Pixel
- Snap to Point
- Snap to Glyph
- Snapping Quick Access Panel
- Perspective Grid

**ИТЕРАЦИЯ 39 — View меню**
- Preview / Outline / Overprint Preview / Pixel Preview
- Proof Colors / Proof Setup
- Transparency Grid
- Show / Hide Bounding Box
- Show / Hide Text Threads
- Show / Hide Gradient Annotator
- Show / Hide Live Paint Gaps
- New View / Edit Views
- New Window (второе окно для dual-monitor)
- Zoom In / Out / Fit Page / Actual Size

### БЛОК 12 — ЭКСПОРТ И ФАЙЛЫ

**ИТЕРАЦИЯ 40 — Экспорт**
- Save as SVG
- Export As (PNG, JPG, TIFF, BMP, GIF, WebP)
- Export for Screens (несколько форматов и артбордов за раз)
- Save for Web (legacy)
- Save as PDF
- Save as EPS
- Package (упаковка файла со шрифтами и ссылками)
- Place (вставить растровое изображение / SVG в документ)
- Links панель — управление вставленными файлами

**ИТЕРАЦИЯ 41 — File меню полностью**
- New / New from Template
- Open / Open Recent
- Close / Close All
- Save / Save As / Save a Copy
- Save as Template
- Revert
- Scripts поддержка (.jsx файлы)
- Document Setup
- Document Color Mode (RGB / CMYK)
- File Info
- Print
- Exit

### БЛОК 13 — РАБОЧЕЕ ПРОСТРАНСТВО

**ИТЕРАЦИЯ 42 — Вспомогательные панели**
- Navigator панель
- Info панель
- Document Info панель
- Attributes панель
- Flattener Preview панель
- Separations Preview панель
- Variables панель

**ИТЕРАЦИЯ 43 — Edit меню полностью**
- Cut / Copy / Paste
- Paste in Place
- Paste on All Artboards
- Paste in Front / Paste in Back
- Clear
- Find / Replace
- Check Spelling / Edit Custom Dictionary
- Define Pattern
- Edit Colors (Recolor Artwork, Adjust Colors, Saturate, Desaturate, Blend Front to Back, Blend Horizontally, Blend Vertically, Convert to Grayscale, Invert Colors, Overprint Black)
- Edit Original
- Transparency Flattener Presets
- Print Presets
- Adobe PDF Presets
- Color Settings
- Assign Profile
- Keyboard Shortcuts (кастомизация горячих клавиш)
- Preferences (все настройки приложения, Search Preferences)

**ИТЕРАЦИЯ 44 — Workspace и настройки**
- Workspace (сохранить / переключить / сбросить раскладку)
- Preset Workspaces (Essentials, Typography, Painting, Web, Video и др.)
- Control Bar (верхняя контекстная панель под Menu Bar)
- Properties Panel (контекстная панель справа)
- Discover Panel (поиск функций приложения по описанию)
- Help Bar

### БЛОК 14 — ДОПОЛНИТЕЛЬНЫЕ ИНСТРУМЕНТЫ

**ИТЕРАЦИЯ 45 — Slice и Mockup**
- Slice Tool
- Slice Selection Tool
- Object > Slice (Make, Release, Create from Selection, Divide Objects)
- Mockup (наложение artwork на фото реального объекта)
- Mockup: сохранить как шаблон

**ИТЕРАЦИЯ 46 — Actions и Graphs**
- Actions панель (запись, воспроизведение, batch обработка)
- Graph Tool: Bar, Stacked Bar, Line, Area, Scatter, Pie, Radar
- Graph Data (редактор данных)
- Graph Design / Column / Marker

### БЛОК 15 — AI ИНСТРУМЕНТЫ

**ИТЕРАЦИЯ 47 — AI: подключение API**
- Менеджер API ключей (Anthropic, OpenAI, Gemini, Stability AI, Replicate, Fal.ai)
- Ключи хранятся локально, не отправляются на сервер OpenVector
- Выбор модели для каждого типа задач
- Индикатор расхода токенов / баланса

**ИТЕРАЦИЯ 48 — AI: генерация**
- Text to Vector (описал → получил SVG иконку / иллюстрацию / сцену)
- Generative Shape Fill (заполнить форму векторной графикой по описанию)
- Generative Expand (расширить artwork за границы холста)
- Generate Pattern (описал → тайловый SVG паттерн)
- Generate Color Palette (по настроению / бренду / референсу)
- Generate Variations (3-5 вариантов выбранного объекта)
- Text to Icon Set (набор иконок в едином стиле)
- Generate Background (векторный фон по описанию)

**ИТЕРАЦИЯ 49 — AI: умная обработка**
- AI Image Trace (умная трассировка растра, лучше стандартной)
- Remove Background (вырезать объект из растра)
- Auto-colorize (раскрасить чёрно-белый вектор)
- Style Transfer (перенести стиль одного объекта на другой)
- Auto-simplify Path (убрать лишние точки с сохранением формы)
- Smart Crop Marks (авто-расстановка меток для печати)
- Match Font / Retype (AI версия)

**ИТЕРАЦИЯ 50 — AI: умный интерфейс**
- Natural Language Commands ("сделай этот круг красным и сдвинь вправо")
- AI Suggestions (подсказки что сделать дальше, как Copilot)
- Auto-align (умное выравнивание по смыслу)
- Smart Duplicate (дублировать с учётом паттерна расположения)
- Discover Panel с AI поиском

### БЛОК 16 — ПЛАТФОРМА И КОЛЛАБОРАЦИЯ

**ИТЕРАЦИЯ 51 — Система плагинов**
- Plugin API (открытый интерфейс для разработчиков)
- Plugin Manager (установка, обновление, удаление)
- Установка из .zip / GitHub URL
- Sandbox (плагины изолированы от основного приложения)
- Документация Plugin API на GitHub

**ИТЕРАЦИЯ 52 — Коллаборация**
- Многопользовательский режим (WebSocket)
- Курсоры других пользователей в реальном времени
- Комментарии на холсте
- История изменений (кто что сделал)
- Share link (доступ по ссылке)
- Cloud Documents (сохранение в облако)

**ИТЕРАЦИЯ 53 — Electron (десктоп)**
- Electron обёртка
- Нативное меню (File, Edit, View)
- Открытие / сохранение файлов через нативный диалог
- Drag & drop файлов в приложение
- Автообновление приложения

### БЛОК 17 — ФИНАЛ

**ИТЕРАЦИЯ 54 — История и производительность**
- Полноценный Undo / Redo (100 шагов)
- Оптимизация для больших файлов
- Lazy rendering (рендерить только видимое)
- GPU ускорение где возможно
- Профилирование и устранение утечек памяти

**ИТЕРАЦИЯ 55 — UI редизайн**
- Полный редизайн всего интерфейса
- Светлая тема
- Кастомные темы (пользователь выбирает цвета интерфейса)
- Улучшенные иконки инструментов
- Анимации и переходы
- Адаптация под разные размеры экрана

**ИТЕРАЦИЯ 56 — Полировка и релиз**
- Все горячие клавиши (максимальная совместимость с Illustrator)
- Онбординг для новых пользователей
- Полная документация
- README / CONTRIBUTING.md / CODE_OF_CONDUCT.md
- Сайт проекта
- Product Hunt запуск

### БЛОК 18 — СИСТЕМНОЕ ПОВЕДЕНИЕ

**ИТЕРАЦИЯ 57 — Работа с файлами**
- Импорт / открытие SVG, PNG, JPG, TIFF, PDF, EPS
- Попытка открытия нативного .ai формата (Adobe Illustrator)
- Drag & drop файла прямо в окно браузера / приложения
- Recent Files (последние открытые файлы)
- Templates (встроенные шаблоны документов)
- Несколько открытых документов (вкладки)
- Стартовый экран (New / Open / Recent / Templates)

**ИТЕРАЦИЯ 58 — Автосохранение и восстановление**
- Автосохранение каждые N минут (настраивается)
- Отслеживание несохранённых изменений (точка в заголовке окна)
- Восстановление после краша (при следующем открытии)
- Резервные копии файла (последние N версий)
- История версий документа

**ИТЕРАЦИЯ 59 — Документ и единицы**
- Единицы измерения (px, pt, mm, cm, inch) — переключение в любой момент
- Размер документа и ориентация (Portrait / Landscape)
- Цветовые профили (ICC профили, назначение профиля)
- Разрешение документа (для растеризации эффектов)
- Метаданные документа (автор, описание, ключевые слова)
- Document Color Mode переключение (RGB ↔ CMYK)

**ИТЕРАЦИЯ 60 — Управление и ввод**
- Полная поддержка горячих клавиш совместимых с Illustrator
- Кастомизация горячих клавиш (меню EDIT > Keyboard Shortcuts)
- Контекстное меню (правая кнопка мыши на объекте / холсте)
- Multi-touch жесты (трекпад: pinch-to-zoom, два пальца для прокрутки)
- Поддержка графического планшета (Wacom и совместимые)
- Поддержка стилуса (давление, наклон)
- Scroll Lock / инвертировать скролл

**ИТЕРАЦИЯ 61 — Интерфейс: поведение панелей**
- Плавающие панели (открепить от края)
- Прикреплённые панели (dock к краю экрана)
- Скрытие всех панелей клавишей Tab
- Скрытие всего кроме холста (Shift+Tab)
- Полноэкранный режим
- Drag & drop панелей (переставить куда удобно)
- Сохранение раскладки панелей между сессиями
- Масштаб UI (для HiDPI / Retina экранов)

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
    │   └── operations/    ← булевы операции, трансформации
    ├── components/        ← UI компоненты
    │   ├── Toolbar/       ← панель инструментов слева
    │   ├── Properties/    ← панель свойств справа
    │   └── Canvas/        ← обёртка холста
    ├── i18n/              ← переводы EN и RU
    └── styles/            ← глобальные стили, тёмная тема
```

---

## Соглашения по коду

- Каждый инструмент — отдельный файл в `src/canvas/tools/`
- Компоненты — функциональные, с хуками
- Стили — CSS Modules или styled-components (решить в первой сессии)
- Коммиты на английском: `feat:`, `fix:`, `refactor:`
- Никаких console.log в продакшне

---

## Git и релизы

**Каждая завершённая итерация заливается на GitHub как отдельное нововведение.**
Это постоянное указание пользователя — отдельного подтверждения на пуш итерации не нужно
(предусловия ниже должны быть выполнены).

Порядок (после того как итерация собрана `npm run build` и проверена в браузере):
1. Один коммит на итерацию: `feat: iteration N — <короткое название>` (английский).
   В конце коммита — trailer `Co-Authored-By: ...` (как требует харнесс).
2. `git push origin main`.
3. Тег на итерацию: `git tag iter-N -m "<название>"` → `git push origin iter-N`.
4. Если итерация частичная (как 5) — пушим что готово, в теле коммита перечисляем отложенное.

**Предусловия (✅ выполнены 2026-06-20):**
- OpenVector — отдельный git-репозиторий (`.git` в папке, ветка `main`).
- Remote: `origin` → `git@github.com:yakoshmarniy/OpenVector.git` (SSH).
- Авторизация: SSH-ключ `~/.ssh/id_ed25519` добавлен в аккаунт `yakoshmarniy`, пуш работает.
- Залито: `main` + тег `iter-5` (итерации 1–5). Дальше пушим каждую итерацию по правилу выше
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

### Сверка с НОВЫМ планом (61 итерация) — что уже сделано

> Старые сессии 1–8 (выше) делались по ПРЕЖНЕЙ нумерации. Git-теги `iter-1`…`iter-8`
> относятся к старому плану и остаются историей. Ниже — соответствие новому плану.
> Идём дальше по новому плану, начиная с самой ранней незакрытой итерации.

- **Итерация 1 (Layout/холст):** ✅ холст зум/пан, ✅ тёмная тема, ✅ Contextual Task Bar (всплывает под выделением), ✅ Status Bar (зум/единицы/выделение) — ГОТОВО
- **Итерация 2 (Toolbar):** ✅ группировка-flyout, ✅ Select · ⬜ кастом 1/2 кол · ⬜ Drawer · ⬜ Direct Selection · ⬜ Group Selection · ⬜ Hand · ⬜ Zoom Tool · ⬜ индикатор Fill/Stroke
- **Итерация 3 (Фигуры):** ✅ ПОЛНОСТЬЮ (Rect, Rounded Rect, Ellipse, Polygon, Star, Line, Arc, Spiral, Flare)
- **Итерация 4 (Pen):** ✅ Pen · ⬜ Add/Delete/Convert Anchor · ⬜ Curvature
- **Итерация 8 (Type Tools):** ✅ Type, Area Type, Type on Path · ⬜ Vertical (×3), Touch Type
- **Итерация 10 (Типографика):** 🟡 размер/leading/tracking/justification · ⬜ панели Character/Paragraph/OpenType/Glyphs, Create Outlines, …
- **Итерация 11 (Базовый цвет):** 🟡 заливка/обводка/прозрачность · ⬜ Color-панель (RGB/HSB/CMYK/Hex), Eyedropper, Color Mode
- **Итерация 14 (Stroke/Appearance):** 🟡 толщина обводки · ⬜ полная Stroke-панель, Appearance, Graphic Styles
- **Итерация 17 (Arrange/Align):** ✅ Align, Distribute, Group/Ungroup · ⬜ Arrange (z-order), Lock/Hide
- **Итерация 19 (Pathfinder):** ✅ Unite/Subtract/Intersect/Exclude · ⬜ Divide/Trim/Merge/Crop/Outline, Shape Builder, Compound Path, Path-ops
- **Итерация 38 (Привязки):** 🟡 Snap to Grid, Snap to Object · ⬜ Rulers, Guides, Smart Guides, Snap to Pixel/Glyph

Остальные итерации (5–7, 9, 12–13, 15–16, 18, 20–37, 39–61) — не начаты.
Общие подсистемы ещё не сделаны: i18n (EN/RU), экспорт (SVG/PNG/…), слои, Undo/Redo (итер. 54).

**Следующее по порядку:** **Итерация 2 (Toolbar)** — кастом 1/2 кол, Drawer, Direct/Group
Selection, Hand, Zoom Tool, индикатор Fill/Stroke.

> Теги: старые `iter-1`…`iter-8` = старый план (история). Новый план тегаем `np-N`
> (np-1 = новая итерация 1), чтобы не пересекалось.

---

## Важно

Перед началом каждой сессии:
1. Прочитай этот файл
2. Проверь есть ли свежий чекпоинт в `_claude-notes/` (чекпоинты пишем в проект)
3. Спроси что делаем сегодня если непонятно
4. Идём по НОВОМУ плану (61 итерация) по порядку, начиная с самой ранней незакрытой
   (см. «Сверка с НОВЫМ планом»). Не забегать вперёд без явной просьбы.

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
