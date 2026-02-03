# План оптимизации производительности ПопугайМаркет

## Текущие проблемы (из Lighthouse)

1. **Изображения** — 7 400 КиБ экономии
   - product-104.jpg: 1 033 КиБ
   - product-127.jpg: 1 033 КиБ
   - product-77.jpg: 1 033 КиБ
   - Всего: ~16 МБ загружается

2. **JavaScript** — 250 КиБ неиспользуемого кода
3. **CSS** — 64 КиБ неиспользуемого кода
4. **Кеширование** — 16 641 КиБ без кеша
5. **Блокирующие запросы** — 2 530 мс задержка

## Решения

### 1. Оптимизация изображений (КРИТИЧНО)

#### A. Конвертация в WebP/AVIF
- Уменьшение размера на 70-80%
- Поддержка всех современных браузеров

#### B. Responsive Images
- Разные размеры для разных экранов
- Lazy loading для изображений вне viewport

#### C. Сжатие существующих изображений
- Оптимизация JPEG (качество 80-85%)
- Удаление метаданных

### 2. Кеширование (КРИТИЧНО)

#### A. HTTP заголовки
```javascript
// Статические ресурсы: 1 год
Cache-Control: public, max-age=31536000, immutable

// Изображения: 1 месяц
Cache-Control: public, max-age=2592000

// HTML: без кеша (для обновлений)
Cache-Control: no-cache
```

#### B. Service Worker
- Кеширование критических ресурсов
- Offline-режим

### 3. Code Splitting

#### A. Lazy loading компонентов
- Админка загружается только при переходе
- Модальные окна загружаются по требованию

#### B. Vendor splitting
- React/React-DOM отдельно
- UI библиотеки отдельно

### 4. Preconnect/Prefetch

#### A. Google Fonts
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

#### B. Критические ресурсы
```html
<link rel="preload" as="image" href="/hero-parrot.jpg">
```

### 5. Оптимизация шрифтов

- Использовать font-display: swap
- Загружать только нужные начертания
- Рассмотреть system fonts

## Приоритеты

1. **Высокий** — Оптимизация изображений (70% улучшения)
2. **Высокий** — Настройка кеширования (быстрая загрузка повторных визитов)
3. **Средний** — Code splitting (уменьшение initial bundle)
4. **Средний** — Preconnect для шрифтов
5. **Низкий** — Service Worker (для PWA)

## Ожидаемые результаты

- **LCP**: < 2.5s (сейчас ~4s)
- **FCP**: < 1.8s (сейчас ~2.5s)
- **Bundle size**: -40% (с 490 КиБ до ~290 КиБ)
- **Images**: -70% (с 16 МБ до ~5 МБ)
- **Lighthouse Score**: 90+ (сейчас ~60)


## Быстрые команды

```bash
# Оптимизация изображений (КРИТИЧНО!)
npm install --save-dev sharp
npm run optimize:images

# Проверка после оптимизации
npm run build
npm run preview

# Деплой с оптимизациями
npm run deploy:prepare
```

## Дополнительные ресурсы

- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [Code Splitting in React](https://react.dev/reference/react/lazy)
