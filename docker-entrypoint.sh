#!/bin/sh
set -e

echo "🚀 Запуск приложения ПопугайМаркет..."
echo "📂 Рабочая директория: $(pwd)"
echo "🌍 NODE_ENV: ${NODE_ENV:-not set}"
echo ""

# Проверяем наличие критичных файлов
echo "🔍 Проверка файлов..."
if [ -f "products.json" ]; then
  echo "✅ products.json найден"
  echo "📊 Размер файла: $(wc -c < products.json) байт"
else
  echo "❌ КРИТИЧНО: products.json НЕ НАЙДЕН!"
  echo "📂 Содержимое /app:"
  ls -la /app/ || true
fi

if [ -d "dist" ]; then
  echo "✅ dist/ директория найдена"
else
  echo "⚠️  dist/ директория не найдена"
fi

if [ -d "public/images/products" ]; then
  echo "✅ public/images/products/ найдена"
  echo "📸 Количество изображений: $(ls -1 public/images/products/*.jpg 2>/dev/null | wc -l)"
else
  echo "⚠️  public/images/products/ не найдена"
fi

echo ""

# Инициализируем базу данных если нужно (или проверяем что она есть)
echo "📦 Проверка базы данных..."
if [ -f "/app/data/parrot_shop.db" ]; then
  echo "✅ База данных найдена"
  # Проверяем количество товаров
  echo "📊 Проверка товаров в БД..."
  node -e "
    const db = require('better-sqlite3')('/app/data/parrot_shop.db');
    const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
    console.log('📦 Товаров в БД:', count.count);
    if (count.count === 0) {
      console.log('⚠️  База пустая, запускаю импорт...');
      process.exit(1);
    }
  " || node server/init-db.js
else
  echo "⚠️  База данных не найдена, создаю..."
  node server/init-db.js
fi

if [ $? -ne 0 ]; then
  echo "❌ ОШИБКА: Не удалось инициализировать базу данных!"
  exit 1
fi

echo ""

# Запускаем сервер
echo "🌐 Запуск сервера..."
exec node server/index.js
