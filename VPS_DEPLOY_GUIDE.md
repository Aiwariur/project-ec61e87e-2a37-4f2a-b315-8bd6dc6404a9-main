# 🚀 Гайд по деплою на VPS

## 📋 Информация о сервере

- **IP:** 144.31.212.184
- **ОС:** Ubuntu 24.04 LTS
- **Пользователь:** root
- **Ресурсы:** 1 CPU, 2GB RAM, 80GB ROM

## 🎯 Первый деплой (один раз)

### 1. Сделай репозиторий публичным

Открой https://github.com/Aiwariur/project-ec61e87e-2a37-4f2a-b315-8bd6dc6404a9-main

Settings → прокрути вниз → Danger Zone → Change visibility → Make public

### 2. Подключись к серверу

```bash
ssh root@144.31.212.184
```

### 3. Установи зависимости и проект

```bash
# Обновление системы
apt update && apt install -y curl git nginx

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Установка PM2
npm install -g pm2

# Клонирование проекта
cd /var/www
git clone https://github.com/Aiwariur/project-ec61e87e-2a37-4f2a-b315-8bd6dc6404a9-main.git popugai-market
cd popugai-market

# Создание .env
cat > .env << 'EOF'
TELEGRAM_BOT_TOKEN=8372065466:AAH5ejcJHBXZnAPQ8ZXiG_eErAE8S_AwnnE
TELEGRAM_CHAT_ID=7784231136
NODE_ENV=production
PORT=3001
DATABASE_PATH=./parrot_shop.db
ALLOWED_ORIGINS=http://144.31.212.184
EOF

# Установка зависимостей и сборка
npm install
npm run build

# Инициализация БД
node server/init-db.js

# Запуск бэкенда
pm2 start server/index.js --name popugai-market
pm2 save
pm2 startup systemd -u root --hp /root
```

### 4. Настрой Nginx

```bash
cat > /etc/nginx/sites-available/popugai-market << 'EOF'
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
EOF

ln -sf /etc/nginx/sites-available/popugai-market /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### 5. Готово! 🎉

Сайт работает: **http://144.31.212.184**

---

## 🔄 Обновление проекта (после изменений)

Когда запушил новый код в GitHub:

```bash
ssh root@144.31.212.184
cd /var/www/popugai-market
git stash
git pull
npm run build
pm2 restart popugai-market
```

Или одной командой с локальной машины:

```bash
ssh root@144.31.212.184 "cd /var/www/popugai-market && git stash && git pull && npm run build && pm2 restart popugai-market"
```

---

## 📊 Управление приложением

### PM2 (бэкенд)

```bash
pm2 status                    # Статус
pm2 logs popugai-market       # Логи в реальном времени
pm2 restart popugai-market    # Перезапуск
pm2 stop popugai-market       # Остановка
pm2 start popugai-market      # Запуск
pm2 monit                     # Мониторинг ресурсов
```

### Nginx (веб-сервер)

```bash
systemctl status nginx        # Статус
systemctl restart nginx       # Перезапуск
nginx -t                      # Проверка конфига
tail -f /var/log/nginx/popugai-market-access.log  # Логи доступа
tail -f /var/log/nginx/popugai-market-error.log   # Логи ошибок
```

### База данных

```bash
cd /var/www/popugai-market
sqlite3 parrot_shop.db        # Открыть БД
.tables                       # Список таблиц
.quit                         # Выход
```

---

## 🐛 Решение проблем

### Сайт не открывается

```bash
# Проверь статус сервисов
pm2 status
systemctl status nginx

# Проверь порты
netstat -tulpn | grep :80
netstat -tulpn | grep :3001

# Проверь логи
pm2 logs popugai-market --lines 50
tail -f /var/log/nginx/popugai-market-error.log
```

### API не работает

```bash
# Проверь бэкенд
curl http://localhost:3001/api/products

# Проверь .env
cat .env

# Перезапусти
pm2 restart popugai-market
```

### База данных не работает

```bash
cd /var/www/popugai-market
ls -la parrot_shop.db  # Проверь существование
node server/init-db.js # Пересоздай таблицы
```

### Нет места на диске

```bash
df -h                  # Проверь место
pm2 flush              # Очисти логи PM2
journalctl --vacuum-time=7d  # Очисти системные логи
```

---

## 🔒 Безопасность (опционально)

### Настройка firewall

```bash
ufw allow 22/tcp       # SSH
ufw allow 80/tcp       # HTTP
ufw allow 443/tcp      # HTTPS (если будет SSL)
ufw enable
ufw status
```

### Смена пароля root

```bash
passwd root
```

### Создание отдельного пользователя

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

---

## 🌐 Подключение домена (опционально)

Если купишь домен (например, `popugai-market.ru`):

### 1. Настрой DNS

В панели регистратора домена добавь A-запись:
```
A  @  144.31.212.184
```

### 2. Обнови Nginx конфиг

```bash
nano /etc/nginx/sites-available/popugai-market
```

Замени `server_name _;` на `server_name popugai-market.ru www.popugai-market.ru;`

### 3. Установи SSL (Let's Encrypt)

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d popugai-market.ru -d www.popugai-market.ru
```

---

## 📞 Контакты и поддержка

Если что-то пошло не так:
1. Проверь логи (см. раздел "Решение проблем")
2. Перезапусти сервисы
3. Проверь .env файл
4. Убедись что порты 80 и 3001 открыты

**Сайт работает:** http://144.31.212.184
