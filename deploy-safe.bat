@echo off
chcp 65001 >nul
echo ========================================
echo    ДЕПЛОЙ НА СЕРВЕР (БЕЗОПАСНЫЙ)
echo ========================================
echo.

echo [1/4] Пушим коммит в GitHub...
git push
if errorlevel 1 (
    echo ОШИБКА: Не удалось запушить в GitHub
    pause
    exit /b 1
)
echo ✓ Коммит запушен
echo.

echo [2/4] Очищаем конфликтующие файлы на сервере...
ssh root@144.31.212.184 "cd /var/www/popugai-market; git clean -fd; git reset --hard HEAD"
if errorlevel 1 (
    echo ОШИБКА: Не удалось очистить сервер
    pause
    exit /b 1
)
echo ✓ Сервер очищен
echo.

echo [3/4] Подключаемся к серверу и обновляем...
ssh root@144.31.212.184 "cd /var/www/popugai-market; git pull; npm run build; pm2 restart popugai-market"
if errorlevel 1 (
    echo ОШИБКА: Не удалось развернуть на сервере
    pause
    exit /b 1
)
echo ✓ Развернуто на сервере
echo.

echo [4/4] Готово!
echo.
echo ========================================
echo    Сайт обновлён: http://144.31.212.184
echo ========================================
echo.
pause
