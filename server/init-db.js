import db from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Проверяем, есть ли уже данные в таблице products
const checkProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();

if (checkProducts.count === 0) {
  console.log('📦 Инициализация базы данных с тестовыми данными...');
  
  // Импортируем товары из JSON файла если он есть
  const productsJsonPath = path.join(__dirname, '../products.json');
  
  if (fs.existsSync(productsJsonPath)) {
    const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));
    
    const insertProduct = db.prepare(`
      INSERT INTO products (id, slug, name, price, old_price, in_stock, image, images, description, specs, popular, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((products) => {
      for (const product of products) {
        insertProduct.run(
          product.id,
          product.slug,
          product.name,
          product.price,
          product.old_price || null,
          product.in_stock ? 1 : 0,
          product.image,
          JSON.stringify(product.images || []),
          product.description || '',
          JSON.stringify(product.specs || {}),
          product.popular ? 1 : 0,
          Date.now()
        );
      }
    });
    
    insertMany(productsData);
    console.log(`✅ Импортировано ${productsData.length} товаров`);
  } else {
    console.log('⚠️  Файл products.json не найден, создаем пустую базу');
  }
} else {
  console.log('✅ База данных уже содержит данные');
}

console.log('🎉 Инициализация завершена');
