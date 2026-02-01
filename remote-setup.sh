#!/bin/bash
set -e

echo "🚀 Установка на сервере..."

# Обновление системы
apt update
apt install -y curl git

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Установка PM2
npm install -g pm2

# Установка Nginx
apt install -y nginx

# Создание директории проекта
mkdir -p /var/www/popugai-market
cd /var/www/popugai-market

# Распаковка проекта
tar -xzf /tmp/project.tar.gz
rm /tmp/project.tar.gz

# Создание .env для продакшена
cat > .env << 'EOF'
TELEGRAM_BOT_TOKEN=8372065466:AAH5ejcJHBXZnAPQ8ZXiG_eErAE8S_AwnnE
TELEGRAM_CHAT_ID=7784231136
NODE_ENV=production
PORT=3001
DATABASE_PATH=./parrot_shop.db
ALLOWED_ORIGINS=http://144.31.212.184
EOF

# Установка зависимостей
npm install

# Сборка фронтенда
npm run build

# Инициализация БД
node server/init-db.js

# Запуск бэкенда через PM2
pm2 delete popugai-market 2>/dev/null || true
pm2 start server/index.js --name popugai-market
pm2 save
pm2 startup systemd -u root --hp /root

# Настройка Nginx
cat > /etc/nginx/sites-available/popugai-market << 'NGINX'
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/popugai-market/dist;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

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

    access_log /var/log/nginx/popugai-market-access.log;
    error_log /var/log/nginx/popugai-market-error.log;
}
NGINX

ln -sf /etc/nginx/sites-available/popugai-market /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx
systemctl enable nginx

echo ""
echo "✅ Деплой завершён!"
echo "🌐 Сайт: http://144.31.212.184"
echo ""
pm2 status
