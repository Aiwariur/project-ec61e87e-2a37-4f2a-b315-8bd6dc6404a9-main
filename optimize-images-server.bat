@echo off
chcp 65001 >nul
echo ========================================
echo    ОПТИМИЗАЦИЯ ИЗОБРАЖЕНИЙ НА СЕРВЕРЕ
echo ========================================
echo.

echo [1/4] Устанавливаем sharp на сервере...
ssh root@144.31.212.184 "cd /var/www/popugai-market && npm install --save-dev sharp"
echo.

echo [2/4] Копируем скрипт оптимизации...
scp optimize-images.js root@144.31.212.184:/var/www/popugai-market/
echo.

echo [3/4] Запускаем оптимизацию...
ssh root@144.31.212.184 "cd /var/www/popugai-market && node optimize-images.js"
echo.

echo [4/4] Перезапускаем сервер...
ssh root@144.31.212.184 "cd /var/www/popugai-market && pm2 restart popugai-market"
echo.

echo ========================================
echo    ГОТОВО!
echo ========================================
pause
