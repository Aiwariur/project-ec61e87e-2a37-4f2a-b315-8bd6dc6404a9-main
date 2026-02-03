# Чеклист оптимизации производительности

## ✅ Уже сделано

### 1. Кеширование HTTP
- ✅ Статические файлы (JS/CSS): 1 год с immutable
- ✅ Изображения: 30 дней
- ✅ HTML: без кеша (для обновлений)

### 2. Gzip сжатие
- ✅ Добавлен compression middleware
- ✅ Уровень сжатия: 6 (оптимальный баланс)
- ✅ Порог: 1KB (не сжимаем маленькие файлы)

### 3. Code Splitting
- ✅ Разделение vendor кода (React, UI, Utils)
- ✅ Минификация с Terser
- ✅ Удаление console.log в production

### 4. Оптимизация изображений
- ✅ Lazy loading для всех изображений каталога
- ✅ fetchpriority="high" для hero изображения
- ✅ decoding="async" для неблокирующей декодировки
- ✅ Создан компонент OptimizedImage для WebP
- ✅ Создан скрипт optimize-images.js

### 5. Preconnect
- ✅ Google Fonts preconnect
- ✅ DNS prefetch для fonts.gstatic.com

## 🔄 Требуется выполнить

### 1. Оптимизация изображений (КРИТИЧНО!)

**Проблема**: Изображения весят 1+ МБ каждое, всего ~16 МБ

**Решение**:
```bash
# 1. Установить sharp для обработки изображений
npm install --save-dev sharp

# 2. Запустить оптимизацию
npm run optimize:images

# 3. Проверить результаты в public/images/products-optimized/

# 4. Заменить оригинальные файлы
# Windows:
rmdir /s /q public\images\products
move public\images\products-optimized public\images\products

# Linux/Mac:
rm -rf public/images/products
mv public/images/products-optimized public/images/products
```

**Ожидаемый результат**: 
- Экономия ~70% размера (с 16 МБ до ~5 МБ)
- WebP версии для современных браузеров
- Responsive версии для разных экранов

### 2. Использование OptimizedImage компонента

Заменить обычные `<img>` на `<OptimizedImage>` в:
- ✅ ProductCard.tsx (уже добавлен lazy loading)
- ⏳ ProductModal.tsx
- ⏳ Testimonials.tsx
- ⏳ Другие компоненты с изображениями

Пример:
```tsx
import OptimizedImage from '@/components/OptimizedImage';

// Вместо:
<img src={product.image} alt={product.name} />

// Использовать:
<OptimizedImage 
  src={product.image} 
  alt={product.name}
  priority={false} // true только для hero
/>
```

### 3. Lazy loading компонентов

Добавить динамический импорт для тяжелых компонентов:

```tsx
// src/App.tsx
import { lazy, Suspense } from 'react';

const Admin = lazy(() => import('@/pages/Admin'));
const ProductModal = lazy(() => import('@/components/ProductModal'));

// В роутах:
<Route 
  path="/admin" 
  element={
    <Suspense fallback={<div>Загрузка...</div>}>
      <Admin />
    </Suspense>
  } 
/>
```

### 4. Оптимизация шрифтов

Рассмотреть использование system fonts вместо Google Fonts:

```css
/* tailwind.config.ts */
fontFamily: {
  sans: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif'
  ],
}
```

Или оставить Google Fonts, но:
- Использовать только нужные начертания
- Добавить font-display: swap

### 5. Service Worker (опционально)

Для PWA и offline-режима:

```bash
npm install --save-dev vite-plugin-pwa
```

## 📊 Ожидаемые результаты

### До оптимизации (текущее состояние)
- **LCP**: ~4s
- **FCP**: ~2.5s
- **Bundle size**: 490 КиБ JS + 81 КиБ CSS
- **Images**: ~16 МБ
- **Lighthouse Score**: ~60

### После оптимизации
- **LCP**: < 2.5s ⚡ (-40%)
- **FCP**: < 1.8s ⚡ (-30%)
- **Bundle size**: ~350 КиБ ⚡ (-30%)
- **Images**: ~5 МБ ⚡ (-70%)
- **Lighthouse Score**: 90+ 🎯

## 🚀 Быстрый старт

Выполните эти команды для максимального эффекта:

```bash
# 1. Установить зависимости для оптимизации изображений
npm install --save-dev sharp

# 2. Оптимизировать изображения
npm run optimize:images

# 3. Заменить оригинальные файлы (после проверки качества)
# Windows:
move /Y public\images\products-optimized\*.* public\images\products\

# 4. Пересобрать проект
npm run build

# 5. Проверить результат
npm run preview
```

## 📈 Мониторинг

После деплоя проверьте:
1. **PageSpeed Insights**: https://pagespeed.web.dev/
2. **GTmetrix**: https://gtmetrix.com/
3. **WebPageTest**: https://www.webpagetest.org/

Целевые метрики:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Lighthouse Score > 90

## 🔧 Дополнительные оптимизации

### Для production сервера

1. **Nginx кеширование** (если используете Nginx):
```nginx
location ~* \.(jpg|jpeg|png|webp|gif|svg|ico)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

location ~* \.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

2. **CDN** (опционально):
- Cloudflare (бесплатный план)
- AWS CloudFront
- Vercel Edge Network

3. **HTTP/2** или **HTTP/3**:
- Включить в Nginx/Apache
- Автоматически в Vercel/Netlify

## ❓ FAQ

**Q: Почему изображения такие большие?**
A: Оригинальные фото не оптимизированы. Нужно сжать и конвертировать в WebP.

**Q: Безопасно ли удалять console.log?**
A: Да, в production они не нужны. В development они остаются.

**Q: Нужен ли Service Worker?**
A: Не обязательно, но улучшает UX для повторных визитов.

**Q: Как проверить что кеширование работает?**
A: Откройте DevTools → Network → проверьте заголовки Cache-Control.
