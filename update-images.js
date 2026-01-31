import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const db = new Database('./parrot_shop.db');

// Функция для поиска всех изображений товара
function findProductImages(productId) {
  const publicDir = './public/images/products';
  const allImages = [];
  
  // Основное изображение
  const mainImage = `/images/products/product-${productId}.jpg`;
  allImages.push(mainImage);
  
  // Ищем дополнительные изображения (product-100-1.jpg, product-100-2.jpg и т.д.)
  let index = 1;
  while (true) {
    const additionalImage = path.join(publicDir, `product-${productId}-${index}.jpg`);
    if (fs.existsSync(additionalImage)) {
      allImages.push(`/images/products/product-${productId}-${index}.jpg`);
      index++;
    } else {
      break;
    }
  }
  
  return allImages;
}

// Получаем все товары
const products = db.prepare('SELECT id FROM products ORDER BY id').all();

// Обновляем поле images для каждого товара
const update = db.prepare('UPDATE products SET images = ? WHERE id = ?');

let count = 0;
for (const product of products) {
  const allImages = findProductImages(product.id);
  const images = JSON.stringify(allImages);
  
  console.log(`Товар ${product.id}: найдено ${allImages.length} изображений`);
  
  try {
    update.run(images, product.id);
    count++;
  } catch (e) {
    console.log(`Ошибка при обновлении товара ${product.id}: ${e.message}`);
  }
}

console.log(`\nОбновлено товаров: ${count}`);
db.close();
