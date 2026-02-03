@echo off
chcp 65001 >nul
echo Установка terser на сервере...
ssh root@144.31.212.184 "cd /var/www/popugai-market; npm install --save-dev terser; npm run build; pm2 restart popugai-market"
echo.
echo Готово!
pause
