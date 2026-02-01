# 🔒 Настройка домена и SSL для zolotoykakadushop.sbs

## ✅ Что уже сделано:
- Домен куплен: zolotoykakadushop.sbs
- A-записи добавлены в DNS (указывают на 144.31.212.184)

## 🚀 Команды для выполнения на сервере:

### 1. Подключись к серверу:
```bash
ssh root@144.31.212.184
```

### 2. Перейди в папку проекта:
```bash
cd /var/www/popugai-market
```

### 3. Обнови проект (если нужно):
```bash
git pull
```

### 4. Установи Certbot:
```bash
apt update
apt install -y certbot python3-certbot-nginx
```

### 5. Получи SSL сертификат:
```bash
certbot --nginx -d zolotoykakadushop.sbs -d www.zolotoykakadushop.sbs --email admin@zolotoykakadushop.sbs --agree-tos --non-interactive --redirect
```

### 6. Настрой автообновление сертификата:
```bash
systemctl enable certbot.timer
systemctl start certbot.timer
```

### 7. Проверь и перезапусти Nginx:
```bash
nginx -t
systemctl restart nginx
```

## 🎉 Готово!

Сайт доступен:
- http://zolotoykakadushop.sbs (редирект на https)
- https://zolotoykakadushop.sbs ✅
- https://www.zolotoykakadushop.sbs ✅

## 📊 Проверка:

```bash
# Статус SSL
certbot certificates

# Проверка автообновления
systemctl status certbot.timer

# Тест обновления (dry run)
certbot renew --dry-run
```

## ⚠️ Важно:

DNS может обновляться до 24 часов, но обычно 5-30 минут.

Проверь что домен резолвится:
```bash
ping zolotoykakadushop.sbs
```

Должен показать IP: 144.31.212.184
