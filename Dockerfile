# Multi-stage build для оптимизации размера образа
FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем зависимости для сборки нативных модулей
RUN apk add --no-cache python3 make g++ sqlite-dev

# Копируем package files
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev для сборки фронтенда)
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем фронтенд
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Устанавливаем runtime зависимости для SQLite
RUN apk add --no-cache sqlite-libs

# Копируем package files
COPY package*.json ./

# Устанавливаем только production зависимости
# better-sqlite3 теперь в dependencies, поэтому установится
RUN apk add --no-cache python3 make g++ sqlite-dev && \
    npm ci --only=production && \
    apk del python3 make g++ sqlite-dev

# Копируем собранный фронтенд из builder stage
COPY --from=builder /app/dist ./dist

# Копируем серверную часть
COPY server ./server

# Копируем скрипты для работы с БД
COPY migrate-db.js import-products.js export-products.js ./

# Копируем products.json если он есть
COPY products.json* ./

# Копируем публичные файлы (изображения товаров)
COPY public ./public

# Копируем entrypoint скрипт
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Создаем директорию для базы данных
RUN mkdir -p /app/data

# Устанавливаем переменные окружения по умолчанию
ENV NODE_ENV=production
ENV PORT=3000

# Открываем порт
EXPOSE 3000

# Используем entrypoint для инициализации
ENTRYPOINT ["./docker-entrypoint.sh"]
