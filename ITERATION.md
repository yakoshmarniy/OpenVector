# Текущая задача: итерация 8.1 — Базовый цвет и Swatches

## Сделать:
- [ ] Color панель: слайдеры RGB / HSB / CMYK / Grayscale, Hex-поле, Lab (по возможности);
      переключение модели через меню панели; спектр-полоска снизу (как в Illustrator)
- [ ] Color Picker (диалог по dblclick на свотче Fill/Stroke в тулбаре/панели): поле
      насыщенность×яркость + полоса Hue, поля RGB/HSB/Hex, превью старый/новый цвет,
      предупреждение out-of-gamut (для CMYK-режима документа)
- [ ] Eyedropper (I): клик — взять fill/stroke/обводку/opacity с объекта и применить
      к выделению; Alt-клик — наоборот (отдать стиль выделения объекту под курсором)
- [ ] Swatches панель: список/сетка свотчей, добавить/удалить, дефолтная библиотека,
      Global Colors (правка свотча меняет объекты, где он применён), Spot Colors (базово);
      Pantone/Color Books — отложить, если не влезает
- [ ] Document Color Mode (RGB/CMYK) — переключатель в File-меню, влияет на Color панель
      и предупреждения gamut
- [ ] Create Swatch из выделения; None/Registration свотчи

## Уже сделано (не трогать):
- Итерации по 7.3 включительно (см. CLAUDE.md «Сверка с планом 20 фаз»):
  выделение, фигуры, Pen, рисование/резка, текст 5.1–5.3, организация 6.1–6.2,
  трансформации 7.1, Width/Puppet Warp/Measure/Dimension 7.2, Liquify 7.3

## Не трогать:
- Всё что не в списке выше
- Следующие итерации

## Дополнения к плану из ресёрча Illustrator 2024–2026 (НЕ эта итерация — вписать в CLAUDE.md при шлифовке плана):
- **Новые инструменты, которых нет в плане:** Objects on Path (v29.0, 2025 — раскладка
  объектов вдоль пути с ручками spacing/alignment/orientation) → к фазе 7/11;
  Intertwine (Make/Edit/Release) уже есть в 11.3 — ок.
- **Dimension tool** (v28.3): у нас v1 сделан в 7.2; в Illustrator — Linear/Angular/Radial,
  units/scale/precision, отдельный слой Dimensions → добить при 13.x.
- **Contextual Task Bar** — в Illustrator это центральная поверхность (контекстные действия
  для путей/фигур/текста/групп/масок + AI-действия). У нас есть зачаток с 1.2 — при 20.2
  сделать общий реестр «команда → меню/Properties/Task Bar/виджет».
- **On-canvas виджеты** — сверить наш набор со списком из ресёрча (Live Corners с типами
  углов round/inverted/chamfer, gradient annotator, blend spine, repeat-виджеты,
  9-point reference — частично есть); каждый виджет = переиспользуемый оверлей-компонент.
- **Фаза 18 (AI) разбить на треки:** 18.0 архитектура (Generative Object data model,
  variation management, Generation History) → генерация (Text to Vector, Shape Fill,
  Expand) → редактирование (Prompt to Edit, Generative Recolor) → текст (Rewrite, Retype)
  → Mockup/Turntable → AI Assistant. Adobe-фичи мапить на open-model эквиваленты
  (пользовательские ключи).
- **Transform Each** получил Relative/Absolute scaling (2026) — у нас заглушка prompt, учесть в 15.x.
- **Blending modes:** канонический список 16 штук подтверждён (см. ресёрч, секция E) — для 11.1.
- **Артборды:** лимит Illustrator — до 1000 (для 13.1 как ориентир, не обязательство).

## Контекст:
- Стек: Vite + React + Paper.js
- Инструменты: src/canvas/tools/
- Каждый инструмент = отдельный файл
- Все строки UI через t('key') — никакого хардкода
- Без console.log в продакшне
