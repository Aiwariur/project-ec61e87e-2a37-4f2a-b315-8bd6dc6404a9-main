const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database('./parrot_shop.db');

// Функция для поиска дополнительных изображений товара (без основного)
function findAdditionalImages(productId) {
  const publicDir = './public/images/products';
  const additionalImages = [];
  
  // Ищем дополнительные изображения (product-100-1.jpg, product-100-2.jpg и т.д.)
  let index = 1;
  while (true) {
    const additionalImage = path.join(publicDir, `product-${productId}-${index}.jpg`);
    if (fs.existsSync(additionalImage)) {
      additionalImages.push(`/images/products/product-${productId}-${index}.jpg`);
      index++;
    } else {
      break;
    }
  }
  
  return additionalImages;
}

// Получаем все товары
const products = db.prepare('SELECT id FROM products').all();

const update = db.prepare('UPDATE products SET images = ? WHERE id = ?');

let count = 0;
for (const product of products) {
  const additionalImages = findAdditionalImages(product.id);
  const imagesJson = JSON.stringify(additionalImages);
  
  console.log(`Товар ${product.id}: найдено ${additionalImages.length} дополнительных изображений`);
  
  try {
    update.run(imagesJson, product.id);
    count++;
  } catch (e) {
    console.log(`Ошибка при обновлении товара ${product.id}: ${e.message}`);
  }
}

console.log(`Обновлено товаров: ${count}`);
db.close();
