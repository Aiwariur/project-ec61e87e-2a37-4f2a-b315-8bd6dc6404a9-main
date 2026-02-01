#!/bin/bash

# ПопугайМаркет - Настройка проекта на сервере
# Запускать после deploy-to-vps.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/var/www/popugai-market"
SERVER_IP="144.31.212.184"

echo "🦜 Настройка ПопугайМаркет"
echo "=========================="
echo ""

cd $PROJECT_DIR

echo -e "${YELLOW}📦 Шаг 1: Установка зависимостей${NC}"
npm install --production

echo -e "${YELLOW}🔨 Шаг 2: Сборка фронтенда${NC}"
npm run build

echo -e "${YELLOW}📝 Шаг 3: Проверка .env файла${NC}"
if [ ! -f .env ]; then
  echo -e "${RED}❌ Файл .env не найден!${NC}"
  echo "Создай .env файл с настройками:"
  echo ""
  cat .env.example
  echo ""
  exit 1
fi

echo -e "${YELLOW}🗄️ Шаг 4: Инициализация базы данных${NC}"
node server/init-db.js

echo -e "${YELLOW}🚀 Шаг 5: Запуск бэкенда через PM2${NC}"
pm2 delete popugai-market 2>/dev/null || true
pm2 start server/index.js --name popugai-market
pm2 save
pm2 startup

echo -e "${YELLOW}🌐 Шаг 6: Настройка Nginx${NC}"
cat > /etc/nginx/sites-available/popugai-market << 'EOF'
server {
    listen 80;
    server_name _;

    # Фронтенд (статика)
    location / {
        root /var/www/popugai-market/dist;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статики
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API (проксирование на бэкенд)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Логи
    access_log /var/log/nginx/popugai-market-access.log;
    error_log /var/log/nginx/popugai-market-error.log;
}
EOF

# Активация конфига
ln -sf /etc/nginx/sites-available/popugai-market /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфига
nginx -t

# Перезапуск Nginx
systemctl restart nginx
systemctl enable nginx

echo ""
echo -e "${GREEN}✅ Деплой завершён!${NC}"
echo ""
echo -e "${GREEN}🌐 Сайт доступен по адресу:${NC}"
echo "   http://$SERVER_IP"
echo ""
echo -e "${YELLOW}📊 Полезные команды:${NC}"
echo "   pm2 status              - статус приложения"
echo "   pm2 logs popugai-market - логи приложения"
echo "   pm2 restart popugai-market - перезапуск"
echo "   pm2 stop popugai-market - остановка"
echo "   nginx -t                - проверка конфига Nginx"
echo "   systemctl status nginx  - статус Nginx"
echo ""
