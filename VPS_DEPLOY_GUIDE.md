# 🚀 Гайд по деплою на VPS

## 📋 Информация о сервере

- **IP:** 144.31.212.184
- **ОС:** Ubuntu 24.04 LTS
- **Пользователь:** root
- **Пароль:** eh5gRDe4yCsK
- **Ресурсы:** 1 CPU, 2GB RAM, 80GB ROM

## 🎯 Быстрый старт

### 1. Подключись к серверу

```bash
ssh root@144.31.212.184
# Пароль: eh5gRDe4yCsK
```

### 2. Загрузи проект на сервер

**Вариант А: Через Git (рекомендуется)**
```bash
cd /var/www
git clone <твой-репозиторий> popugai-market
cd popugai-market
```

**Вариант Б: Через SCP с локальной машины**
```bash
# На твоём компьютере (Windows)
scp -r "C:\Users\Money\OneDrive\Desktop\project-ec61e87e-2a37-4f2a-b315-8bd6dc6404a9-main" root@144.31.212.184:/var/www/popugai-market
```

### 3. Запусти установку

```bash
# На сервере
cd /var/www/popugai-market
chmod +x deploy-to-vps.sh setup-project.sh
bash deploy-to-vps.sh
```

### 4. Настрой .env

```bash
nano .env
```

Вставь свои данные:
```env
TELEGRAM_BOT_TOKEN=твой_токен
TELEGRAM_CHAT_ID=твой_chat_id
NODE_ENV=production
PORT=3001
DATABASE_PATH=./parrot_shop.db
ALLOWED_ORIGINS=http://144.31.212.184
```

Сохрани: `Ctrl+O`, `Enter`, `Ctrl+X`

### 5. Запусти проект

```bash
bash setup-project.sh
```

### 6. Готово! 🎉

Открой в браузере: **http://144.31.212.184**

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

## 🔄 Обновление проекта

### Если используешь Git:

```bash
cd /var/www/popugai-market
git pull
npm install
npm run build
pm2 restart popugai-market
```

### Если загружаешь вручную:

```bash
# На локальной машине
scp -r dist root@144.31.212.184:/var/www/popugai-market/

# На сервере
pm2 restart popugai-market
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
