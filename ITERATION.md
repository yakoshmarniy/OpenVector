# Текущая задача: итерация 3.2 — Заливка и обводка

## Сделать:
- [x] Заливка цветом (Fill) — выбор цвета через color picker
- [x] Обводка (Stroke) — цвет, толщина, тип линии (solid/dashed/dotted)
- [x] Концы линий (butt / round / square)
- [x] Углы (miter / round / bevel)
- [x] Пунктир (dash pattern, настраиваемый) — Dash/Gap поля
- [x] Стрелки на концах линии (Start/End + размер; живые, следуют за путём)
- [x] Прозрачность / Opacity (0–100%)
- [x] Fill/Stroke индикатор внизу Toolbar (X — фокус, Shift+X — поменять местами)

## Уже сделано (не трогать):
- Итерация 3.1 — все примитивы (Rectangle, Ellipse, Polygon, Star, Line, Arc, Spiral, Flare, Live shapes)

## Не трогать:
- Всё что не в списке выше
- Следующие итерации

## Контекст:
- Стек: Vite + React + Paper.js
- Инструменты: src/canvas/tools/
- Каждый инструмент = отдельный файл
- Все строки UI через t('key') — никакого хардкода
- Без console.log в продакшне
