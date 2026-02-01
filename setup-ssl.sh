#!/bin/bash
# Скрипт для настройки SSL на сервере

set -e

# Домен
DOMAIN="zolotoykakadushop.sbs"
EMAIL="admin@zolotoykakadushop.sbs"

echo "🔒 Настройка SSL для $DOMAIN"
echo "================================"

# Установка Certbot
echo "📦 Установка Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
echo "🔐 Получение SSL сертификата от Let's Encrypt..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect

# Автообновление сертификата
echo "🔄 Настройка автообновления сертификата..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Проверка конфига Nginx
echo "✅ Проверка конфигурации Nginx..."
nginx -t

# Перезапуск Nginx
echo "🔄 Перезапуск Nginx..."
systemctl restart nginx

echo ""
echo "✅ SSL настроен!"
echo "🌐 Сайт доступен: https://$DOMAIN"
echo ""
echo "Проверь автообновление: systemctl status certbot.timer"
