# Build stage - собираем фронтенд
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Копируем только то, что нужно для сборки фронтенда
COPY package*.json ./
COPY vite.config.ts tsconfig*.json components.json tailwind.config.ts postcss.config.js ./
COPY index.html ./
COPY src ./src
COPY public ./public

# Устанавливаем зависимости и собираем
RUN npm ci && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Устанавливаем зависимости для сборки better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite-dev sqlite-libs

# Копируем package files
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Удаляем build tools, оставляем только runtime
RUN apk del python3 make g++ sqlite-dev

# Копируем собранный фронтенд из frontend-builder stage
COPY --from=frontend-builder /app/dist ./dist

# Копируем серверную часть
COPY server ./server

# Копируем скрипты для работы с БД
COPY migrate-db.js import-products.js export-products.js ./

# КРИТИЧНО: Копируем products.json (без звездочки чтобы сборка упала если файла нет)
COPY products.json ./products.json

# Копируем публичные файлы (изображения товаров)
COPY public ./public

# Копируем entrypoint скрипт
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Создаем директорию для базы данных
RUN mkdir -p /app/data

# Проверяем что критичные файлы на месте
RUN echo "🔍 Проверка файлов в образе..." && \
    ls -lh products.json && \
    echo "✅ products.json найден" && \
    ls -lh server/init-db.js && \
    echo "✅ server/init-db.js найден" && \
    ls -lh dist/index.html && \
    echo "✅ dist/index.html найден" && \
    echo "📸 Изображения товаров:" && \
    ls -1 public/images/products/*.jpg | wc -l && \
    echo "✅ Все критичные файлы на месте"

# Устанавливаем переменные окружения по умолчанию
ENV NODE_ENV=production
ENV PORT=3000

# Открываем порт
EXPOSE 3000

# Используем entrypoint для инициализации
ENTRYPOINT ["./docker-entrypoint.sh"]
