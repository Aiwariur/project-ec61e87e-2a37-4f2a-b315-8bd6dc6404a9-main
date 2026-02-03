@echo off
echo Очистка сервера от конфликтующих файлов...
ssh root@144.31.212.184 "cd /var/www/popugai-market && rm -f reduce-prices-20-production.cjs && git status"
echo.
echo Готово! Теперь можно запустить deploy.bat
pause
