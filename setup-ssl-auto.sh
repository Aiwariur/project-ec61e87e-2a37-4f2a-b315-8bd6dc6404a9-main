#!/bin/bash
set -e

SERVER="144.31.212.184"
USER="root"
PASS="eh5gRDe4yCsK"

echo "🔒 Настройка SSL для zolotoykakadushop.sbs"

sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no $USER@$SERVER << 'ENDSSH'
set -e

cd /var/www/popugai-market

echo "📦 Установка Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

echo "🔐 Получение SSL сертификата..."
certbot --nginx -d zolotoykakadushop.sbs -d www.zolotoykakadushop.sbs \
  --email admin@zolotoykakadushop.sbs \
  --agree-tos \
  --non-interactive \
  --redirect

echo "🔄 Настройка автообновления..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo "✅ Перезапуск Nginx..."
systemctl restart nginx

echo ""
echo "✅ SSL НАСТРОЕН!"
echo "🌐 Сайт: https://zolotoykakadushop.sbs"
echo ""

ENDSSH

echo "✅ Готово! Сайт работает на https://zolotoykakadushop.sbs"
