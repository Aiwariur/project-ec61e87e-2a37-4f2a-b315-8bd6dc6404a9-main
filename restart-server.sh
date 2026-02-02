#!/bin/bash

# Скрипт для перезапуска сервера на production

echo "🔄 Перезапуск сервера..."

# Останавливаем текущий процесс
pkill -f "node server/index.js" || true
sleep 2

# Запускаем сервер в фоне
NODE_ENV=production nohup node server/index.js > server.log 2>&1 &

echo "✅ Сервер перезапущен"
echo "📝 Логи: tail -f server.log"
