Я тебе, тварь, сказал изучить всю документацию, блять! Я тебе, тварь, сказал изучить всю документацию, блять! Я тебе, тварь, сказал изучить всю документацию, блять! Я тебе, тварь, сказал изучить всю документацию, блять! Оно должно работать ровно так, как я написал. Ровно так, как я написал, блядь. Ровно, блядь. Так, как я написал. Оно должно работать ровно так, как я написал. Ровно так, как я написал, блядь. Ровно, блядь. Так, как я написал. Оно должно работать ровно так, как я написал. Ровно так, как я написал, блядь. Ровно, блядь. Так, как я написал. Оно должно работать ровно так, как я написал. Ровно так, как я написал, блядь. Ровно, блядь. Так, как я написал. всё задеплоеновсё задеплоеновсё задеплоеновсё задеплоеновсё задеплоеновсё задеплоеновсё задеплоено---
inclusion: always
---

# Правила работы с проектом ПопугайМаркет

## Язык общения
**Всегда общайся с пользователем на русском языке.** Это основное правило.

## Контекст проекта
Перед выполнением любой задачи прочитай и усвой информацию из `PROJECT_DOCUMENTATION.md`:
- Это e-commerce приложение для продажи экзотических попугаев с доставкой по России
- Frontend: React 18 + TypeScript + Vite
- Backend: Express 5 + SQLite (better-sqlite3)
- UI: shadcn/ui + Tailwind CSS + Radix UI
- State: Zustand + React Query
- Фронтенд работает на http://localhost:5173
- Бэкенд работает на http://localhost:3001
- Товары загружаются с API `/api/products`
- Заказы отправляются на `/api/orders`
- Админка доступна по адресу `/admin`
- Страница благодарности: `/thank-you`

## Структура проекта
```
src/
├── components/     # React компоненты
│   ├── ui/        # shadcn/ui компоненты (50+ файлов)
│   ├── Header.tsx, Hero.tsx, Catalog.tsx
│   ├── ProductCard.tsx, ProductModal.tsx
│   ├── Cart.tsx, OrderForm.tsx
│   ├── Features.tsx, SocialProof.tsx
│   ├── Testimonials.tsx, Delivery.tsx
│   └── Footer.tsx
├── pages/          # Страницы
│   ├── Index.tsx      # Главная страница
│   ├── Admin.tsx      # Админка для заказов
│   ├── ThankYou.tsx   # Страница благодарности
│   └── NotFound.tsx   # 404
├── lib/            # Store (Zustand), утилиты
│   ├── store.ts       # Корзина и состояние
│   └── utils.ts       # Утилиты
├── hooks/          # Кастомные хуки
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── config/         # Конфигурация
│   └── contacts.ts    # Контактные данные
├── data/           # Данные
│   └── products.ts    # Типы товаров
└── assets/         # Изображения

server/
├── index.js        # Express сервер
├── db.js           # SQLite инициализация
├── init-db.js      # Инициализация БД
├── telegram.js     # Telegram-уведомления
└── routes/         # API маршруты
    ├── products.js # API товаров
    └── orders.js   # API заказов

public/
└── images/
    └── products/   # Фото товаров (product-65.jpg до product-127.jpg)

parrot_shop.db      # SQLite база данных
products.json       # Экспорт товаров для деплоя
```

## База данных (SQLite)

### Таблицы
1. **products** — 63 товара (попугаи)
   - Поля: id, slug, name, price, old_price, in_stock, image, images, description, specs, category, popular, created_at
   - Категории: Ара, Амазон, Какаду, Жако, Эклектус, Корелла, Аратинга, Монах, Ожереловый, Королевский, Сенегальский, Лорикет, Пиррура

2. **customers** — клиенты
   - Поля: id, name, phone, email, address, created_at, updated_at

3. **orders** — заказы
   - Поля: id, order_number, customer_id, delivery_method, comment, payment_method, total, status, telegram_order_id, telegram_confirmed, telegram_username, telegram_user_id, created_at
   - Статусы: `new`, `confirmed`, `shipped`, `delivered`, `cancelled`

4. **order_items** — товары в заказе
   - Поля: id, order_id, product_id, product_name, quantity, price

5. **reviews** — отзывы клиентов (6 отзывов)
   - Поля: id, customer_name, city, rating, text, image, delivery_method, created_at

## Важные особенности

### 1. Telegram-интеграция
- **Уведомления о новых заказах** — автоматически отправляются в Telegram
- **Уведомления об изменении статуса** — менеджер получает уведомления
- **Подтверждение заказа клиентом** — клиент может подтвердить заказ через бота
- **Сохранение Telegram данных** — при подтверждении сохраняются username и user_id
- **Связь с клиентом** — в админке есть кнопка "Написать в Telegram"
- Настройка: `npm run telegram:get-id` → обновить `.env` → `npm run test:telegram`

### 2. Каталог товаров
- **Единый каталог** — все товары в одном месте (Catalog.tsx)
- **Цветные категории** — каждая порода имеет свой градиент
- **Фильтрация по породам** — динамическая загрузка категорий из API
- **Анимации** — при наведении на карточки товаров

### 3. Корзина
- **Хранится в Zustand** — в памяти браузера
- **При перезагрузке очищается** — нет localStorage
- **Методы**: addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems

### 4. Админка
- **Просмотр всех заказов** — список с фильтрацией
- **Детальный просмотр** — информация о клиенте, товарах, доставке
- **Изменение статуса** — dropdown с автоматическим уведомлением
- **Telegram данные** — отображение username и кнопка для связи
- **Доступ**: http://localhost:5173/admin

### 5. Страница благодарности
- **Маршрут**: `/thank-you`
- **Показывается после оформления заказа**
- **Содержит**: номер заказа, информацию о следующих шагах

## API Endpoints

### Товары
- `GET /api/products` — все товары
- `GET /api/products/categories` — список категорий (пород)
- `GET /api/products/:id` — товар по ID

### Заказы
- `GET /api/orders` — все заказы (админка)
- `POST /api/orders` — создать заказ
- `GET /api/orders/:id` — заказ по ID
- `PATCH /api/orders/:id` — обновить статус заказа

### Health Check
- `GET /api/health` — проверка работы сервера

## Команды для запуска

```bash
# Разработка
npm run dev          # Только фронтенд (Vite)
npm run server       # Только бэкенд (Express)
npm run dev:all      # Фронтенд + бэкенд одновременно (рекомендуется)

# Production
npm run build        # Сборка для production
npm run build:dev    # Сборка в режиме development
npm run preview      # Предпросмотр собранного приложения

# База данных
npm run setup        # Настройка БД (миграция + импорт)
npm run db:migrate   # Создание таблиц
npm run db:import    # Импорт товаров
npm run db:export    # Экспорт товаров в products.json
npm run db:test      # Тест системы заказов

# Telegram
npm run telegram:get-id  # Получить CHAT_ID
npm run test:telegram    # Тест уведомлений

# Качество кода
npm run lint         # Проверка кода ESLint
npm run test         # Запуск тестов (Vitest)
npm run test:watch   # Тесты в режиме watch

# Деплой
npm run deploy:check    # Проверка готовности к деплою
npm run deploy:prepare  # Подготовка к деплою (экспорт + сборка + проверка)
```

## Переменные окружения (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
TELEGRAM_CHAT_ID=ваш_chat_id

# Production (для деплоя)
NODE_ENV=production
PORT=3000
```

## Деплой

### Готовность к деплою
Проект готов к деплою в Docker:
- ✅ Dockerfile и docker-compose.yml настроены
- ✅ Production-режим (сервер отдает фронтенд и API на одном порту)
- ✅ Автоматическая инициализация БД
- ✅ Персистентное хранилище для данных
- ✅ Health check endpoint

### Перед деплоем
```bash
npm run db:export      # Экспортировать товары
npm run deploy:prepare # Подготовить к деплою
git add . && git commit -m "Ready for deploy" && git push
```

## Типичные задачи

| Задача | Решение |
|--------|---------|
| Изменить цену товара | `UPDATE products SET price = ... WHERE id = ...;` |
| Добавить новый товар | Вставить запись в таблицу `products` с категорией |
| Добавить новую породу | Добавить товары с новой категорией, обновить цвета в Catalog.tsx |
| Просмотреть заказы | Перейти на `/admin` |
| Изменить статус заказа | Кликнуть на заказ в админке и выбрать новый статус |
| Связаться с клиентом | В админке нажать "Написать в Telegram" |
| Изменить номер телефона | Найти в `src/config/contacts.ts` или в компонентах |
| Изменить порядок секций | Отредактировать `src/pages/Index.tsx` |
| Изменить цвета категорий | Обновить `categoryColors` в `Catalog.tsx` |
| Настроить Telegram | `npm run telegram:get-id` → обновить `.env` |

## Перед каждой задачей
1. Прочитай этот файл (ты уже это делаешь)
2. Прочитай `PROJECT_DOCUMENTATION.md` если нужен контекст
3. Проверь структуру файлов если работаешь с новой частью кода
4. Убедись, что понимаешь, что нужно сделать
5. Выполни задачу и проверь результат

## Стиль общения
- Говори прямо и по делу
- Используй русский язык
- Объясняй что ты делаешь и почему
- Если что-то не работает, найди причину и исправь
- Не повторяйся — если уже сказал, не нужно говорить снова

## Важные замечания

1. **Корзина в памяти** — при перезагрузке очищается. Для сохранения нужно добавить localStorage.

2. **API должен быть запущен** — фронтенд загружает товары с бэкенда. Используй `npm run dev:all`.

3. **Таблицы БД** — автоматически создаются при запуске сервера через `server/init-db.js`.

4. **Фото товаров** — все находятся в `public/images/products/` (product-65.jpg до product-127.jpg).

5. **Telegram-уведомления** — работают асинхронно. Заказ создается даже если Telegram недоступен.

6. **Цветные категории** — каждая порода имеет свой уникальный градиент в Catalog.tsx.

7. **Единый каталог** — больше нет разделения на CatalogTop/CatalogBottom. Все товары в одном месте.

8. **Мобильная адаптивность** — полностью адаптивный дизайн с Tailwind breakpoints.

9. **Связь с клиентами** — при подтверждении заказа через Telegram сохраняются username и user_id для связи.

10. **Production-режим** — в production сервер отдает статику фронтенда и API на одном порту (3000).

---

**Версия проекта**: 0.2.0  
**Последнее обновление**: 2 февраля 2026
