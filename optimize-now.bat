@echo off
chcp 65001 >nul
echo Оптимизация изображений на сервере...

ssh root@144.31.212.184 "cd /var/www/popugai-market/public/images/products && for f in product-*.jpg; do convert $f -resize 800x800\> -quality 85 -strip temp_$f && mv temp_$f $f; done && echo Готово"

pause
