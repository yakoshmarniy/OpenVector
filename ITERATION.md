# Текущая задача: итерация 7.3 — Liquify

## Сделать:
- [ ] 7 инструментов Liquify: Warp, Twirl, Pucker, Bloat, Scallop, Crystallize, Wrinkle
      (в Illustrator это одна группа тулбара, Warp = Shift-R)
- [ ] Общая кисть: Width/Height (эллиптическая), Angle, Intensity; Alt-drag = изменить размер
      кисти на холсте, курсор показывает контур кисти
- [ ] Опции по инструментам: Simplify (Warp/Pucker/Bloat/Twirl), Twirl Rate (Twirl),
      Complexity + Detail (Scallop/Crystallize/Wrinkle), Horizontal/Vertical % (Wrinkle)
- [ ] Чекбоксы «Brush Affects Anchor Points / In Tangent Handles / Out Tangent Handles»
      (Scallop/Crystallize/Wrinkle)
- [ ] Диалог опций по двойному клику на инструмент в тулбаре (как в Illustrator);
      пока диалогов нет (15.x) — допустим prompt/секция в Properties
- [ ] Liquify работает по выделению, если оно есть; иначе — по всему, что под кистью;
      деформирует только Path-геометрию (текст/растр пропускаем, v1)
- [ ] Toolbar: группа из 7 инструментов + иконки

## Уже сделано (не трогать):
- Итерации по 7.2 включительно (см. CLAUDE.md «Сверка с планом 20 фаз»):
  выделение, фигуры, Pen, рисование/резка, текст 5.1–5.3, организация 6.1–6.2,
  трансформации 7.1, Width Tool / Puppet Warp / Measure / Dimension 7.2

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
