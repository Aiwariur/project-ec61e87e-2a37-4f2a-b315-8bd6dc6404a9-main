@echo off
echo ========================================
echo    ДЕПЛОЙ НА СЕРВЕР
echo ========================================
echo.

echo [1/3] Пушим коммит в GitHub...
git push
if errorlevel 1 (
    echo ОШИБКА: Не удалось запушить в GitHub
    pause
    exit /b 1
)
echo ✓ Коммит запушен
echo.

echo [2/3] Подключаемся к серверу...
ssh root@144.31.212.184 "cd /var/www/popugai-market && git pull && node migrate-add-category.cjs && npm run build && pm2 restart popugai-market"
if errorlevel 1 (
    echo ОШИБКА: Не удалось развернуть на сервере
    pause
    exit /b 1
)
echo ✓ Развернуто на сервере
echo.

echo [3/3] Готово!
echo.
echo ========================================
echo    Сайт обновлён: http://144.31.212.184
echo ========================================
echo.
pause
