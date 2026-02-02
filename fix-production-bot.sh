#!/bin/bash

echo "🔧 ИСПРАВЛЕНИЕ TELEGRAM БОТА НА PRODUCTION"
echo "=========================================="

# Подключаемся к серверу и выполняем команды
ssh root@144.31.212.184 << 'ENDSSH'

echo ""
echo "📂 Переход в директорию проекта..."
cd /var/www/popugai-market

echo ""
echo "🔍 Проверка .env файла..."
if grep -q "TELEGRAM_BOT_TOKEN=8372065466" .env; then
    echo "✅ TELEGRAM_BOT_TOKEN найден"
else
    echo "❌ TELEGRAM_BOT_TOKEN отсутствует или неверный"
    echo "Добавляю правильный токен..."
    sed -i '/TELEGRAM_BOT_TOKEN/d' .env
    echo "TELEGRAM_BOT_TOKEN=8372065466:AAH5ejcJHBXZnAPQ8ZXiG_eErAE8S_AwnnE" >> .env
fi

if grep -q "TELEGRAM_CHAT_ID=7784231136" .env; then
    echo "✅ TELEGRAM_CHAT_ID найден"
else
    echo "❌ TELEGRAM_CHAT_ID отсутствует или неверный"
    echo "Добавляю правильный chat_id..."
    sed -i '/TELEGRAM_CHAT_ID/d' .env
    echo "TELEGRAM_CHAT_ID=7784231136" >> .env
fi

echo ""
echo "📋 Текущий .env:"
cat .env

echo ""
echo "🔄 Перезапуск приложения..."
pm2 restart popugai-market

echo ""
echo "⏳ Ждем 3 секунды..."
sleep 3

echo ""
echo "📊 Проверка логов (последние 30 строк)..."
pm2 logs popugai-market --lines 30 --nostream

echo ""
echo "✅ Готово!"
echo ""
echo "🧪 Теперь попробуйте:"
echo "1. Откройте: https://t.me/papugasik_bot?start=order_ORD-1770068335633"
echo "2. Нажмите 'Подтвердить заказ'"
echo "3. Проверьте что статус изменился"

ENDSSH

echo ""
echo "=========================================="
echo "✅ СКРИПТ ЗАВЕРШЕН"
echo "=========================================="
