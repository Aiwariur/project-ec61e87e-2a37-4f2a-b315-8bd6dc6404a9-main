#!/bin/bash
cd /var/www/popugai-market/public/images/products

# Установка sharp если нет
npm list sharp || npm install sharp

# Оптимизация всех изображений
for img in product-*.jpg; do
  if [ -f "$img" ]; then
    echo "Оптимизация $img..."
    
    # Создаем временный файл
    node -e "
      const sharp = require('sharp');
      sharp('$img')
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toFile('${img}.tmp')
        .then(() => console.log('OK'))
        .catch(err => console.error(err));
    "
    
    # Заменяем оригинал
    if [ -f "${img}.tmp" ]; then
      mv "${img}.tmp" "$img"
    fi
  fi
done

echo "Готово!"
