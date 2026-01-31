# 🔍 ПОЛНАЯ ПРОВЕРКА ПЕРЕД ДЕПЛОЕМ

## ⚠️ КРИТИЧНО: Проверка данных

### 1. Проверить products.json
```bash
# Файл должен существовать
ls -lh products.json

# Должно быть 63 товара
node -e "console.log('Товаров:', require('./products.json').length)"

# Первый товар для проверки структуры
node -e "console.log(JSON.stringify(require('./products.json')[0], null, 2))"
```

**Ожидаемый результат:** Файл существует, содержит 63 товара

### 2. Проверить изображения
```bash
# Должно быть минимум 63 изображения
ls -1 public/images/products/*.jpg | wc -l

# Проверить что изображения читаются
ls -lh public/images/products/product-65.jpg
```

**Ожидаемый результат:** Минимум 63 изображения

### 3. Проверить .dockerignore
```bash
# products.json НЕ должен быть исключён
grep "products.json" .dockerignore && echo "❌ ОШИБКА: products.json исключён!" || echo "✅ OK"

# Проверить что *.json не исключён
grep "^\*.json" .dockerignore && echo "❌ ОШИБКА: все JSON исключены!" || echo "✅ OK"
```

**Ожидаемый результат:** products.json НЕ исключён

## 🏗️ Проверка сборки

### 4. Собрать фронтенд
```bash
npm run build

# Проверить что dist создан
ls -lh dist/index.html
```

**Ожидаемый результат:** dist/index.html существует

### 5. Тест инициализации БД
```bash
# Удалить старую БД для чистого теста
rm -f parrot_shop.db parrot_shop.db-shm parrot_shop.db-wal

# Запустить инициализацию
node server/init-db.js

# Проверить что товары загрузились
node -e "const db = require('better-sqlite3')('parrot_shop.db'); console.log('Товаров в БД:', db.prepare('SELECT COUNT(*) as count FROM products').get().count)"
```

**Ожидаемый результат:** 
```
✅ Успешно импортировано 63 товаров
Товаров в БД: 63
```

## 🐳 Проверка Docker

### 6. Собрать Docker образ
```bash
docker build -t parrot-shop-test .
```

**Ожидаемый результат:** Сборка успешна, в логах видно:
```
✅ products.json найден
✅ server/init-db.js найден
✅ dist/index.html найден
```

### 7. Проверить файлы в образе
```bash
# Проверить products.json
docker run --rm parrot-shop-test ls -lh products.json

# Проверить количество товаров в JSON
docker run --rm parrot-shop-test node -e "console.log('Товаров:', require('./products.json').length)"

# Проверить изображения
docker run --rm parrot-shop-test sh -c "ls -1 public/images/products/*.jpg | wc -l"
```

**Ожидаемый результат:** Все файлы на месте

### 8. Запустить контейнер
```bash
# Запустить в фоне
docker run -d --name parrot-test -p 3000:3000 -e NODE_ENV=production parrot-shop-test

# Подождать 5 секунд
sleep 5

# Проверить логи
docker logs parrot-test
```

**Ожидаемый результат в логах:**
```
🚀 Запуск приложения ПопугайМаркет...
✅ products.json найден
📊 Размер файла: XXXXX байт
📦 Инициализация базы данных...
✅ Успешно импортировано 63 товаров
✅ Товаров в БД после импорта: 63
🎉 Инициализация завершена успешно
🌐 Запуск сервера...
🚀 Server running on port 3000
```

### 9. Проверить API
```bash
# Health check
curl http://localhost:3000/api/health

# Получить товары
curl http://localhost:3000/api/products | node -e "const data = JSON.parse(require('fs').readFileSync(0)); console.log('Товаров через API:', data.length)"

# Остановить контейнер
docker stop parrot-test
docker rm parrot-test
```

**Ожидаемый результат:** 
- Health: `{"status":"ok","environment":"production"}`
- Товаров через API: `63`

## 📦 Финальная проверка

### 10. Все файлы на месте
```bash
# Чек-лист файлов
echo "Проверка критичных файлов:"
[ -f "products.json" ] && echo "✅ products.json" || echo "❌ products.json"
[ -f "Dockerfile" ] && echo "✅ Dockerfile" || echo "❌ Dockerfile"
[ -f "docker-entrypoint.sh" ] && echo "✅ docker-entrypoint.sh" || echo "❌ docker-entrypoint.sh"
[ -f "server/init-db.js" ] && echo "✅ server/init-db.js" || echo "❌ server/init-db.js"
[ -f "server/db.js" ] && echo "✅ server/db.js" || echo "❌ server/db.js"
[ -d "dist" ] && echo "✅ dist/" || echo "❌ dist/"
[ -d "public/images/products" ] && echo "✅ public/images/products/" || echo "❌ public/images/products/"
```

### 11. Git статус
```bash
git status
```

**Ожидаемый результат:** Все изменения закоммичены

## 🚀 ГОТОВ К ДЕПЛОЮ

Если все проверки прошли успешно, можно деплоить:

```bash
git add .
git commit -m "fix: гарантированная загрузка товаров при деплое"
git push origin main
```

## 📊 Что было исправлено

1. **server/init-db.js** - улучшена логика поиска products.json
2. **docker-entrypoint.sh** - добавлены проверки файлов
3. **Dockerfile** - гарантированное копирование products.json
4. Все изменения с детальным логированием

## 🔧 Если что-то пошло не так

### products.json не найден в образе
```bash
# Проверить .dockerignore
cat .dockerignore | grep json

# Пересобрать образ
docker build --no-cache -t parrot-shop-test .
```

### База пустая после запуска
```bash
# Проверить логи контейнера
docker logs parrot-test

# Зайти в контейнер
docker exec -it parrot-test sh
ls -lh products.json
node -e "console.log(require('./products.json').length)"
```

### Изображения не загружаются
```bash
# Проверить в контейнере
docker exec -it parrot-test sh
ls -lh public/images/products/ | head
```
