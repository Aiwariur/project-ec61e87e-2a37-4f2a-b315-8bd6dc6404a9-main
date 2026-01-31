import db from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 Начинаю инициализацию базы данных...');
console.log(`📂 Текущая директория: ${__dirname}`);
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Проверяем, есть ли уже данные в таблице products
const checkProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
console.log(`📊 Товаров в БД: ${checkProducts.count}`);

if (checkProducts.count === 0) {
  console.log('📦 База данных пустая, начинаю импорт товаров...');
  
  // Пробуем несколько возможных путей к products.json
  const possiblePaths = [
    path.join(__dirname, '../products.json'),           // Относительно server/
    path.join(process.cwd(), 'products.json'),          // Относительно рабочей директории
    '/app/products.json',                                // Абсолютный путь в Docker
  ];
  
  let productsJsonPath = null;
  
  for (const testPath of possiblePaths) {
    console.log(`🔍 Проверяю путь: ${testPath}`);
    if (fs.existsSync(testPath)) {
      productsJsonPath = testPath;
      console.log(`✅ Файл найден: ${testPath}`);
      break;
    } else {
      console.log(`❌ Файл не найден: ${testPath}`);
    }
  }
  
  if (productsJsonPath) {
    try {
      console.log(`📖 Читаю файл: ${productsJsonPath}`);
      const fileContent = fs.readFileSync(productsJsonPath, 'utf-8');
      const productsData = JSON.parse(fileContent);
      
      console.log(`📦 Найдено товаров в JSON: ${productsData.length}`);
      
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
      console.log(`✅ Успешно импортировано ${productsData.length} товаров`);
      
      // Проверяем что товары действительно добавились
      const finalCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
      console.log(`✅ Товаров в БД после импорта: ${finalCount.count}`);
      
    } catch (error) {
      console.error('❌ Ошибка при импорте товаров:', error.message);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  } else {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Файл products.json не найден ни по одному из путей!');
    console.error('📂 Содержимое рабочей директории:');
    try {
      const files = fs.readdirSync(process.cwd());
      files.forEach(file => console.log(`  - ${file}`));
    } catch (e) {
      console.error('Не удалось прочитать директорию:', e.message);
    }
    throw new Error('products.json не найден - невозможно инициализировать базу данных');
  }
} else {
  console.log(`✅ База данных уже содержит ${checkProducts.count} товаров`);
}

console.log('🎉 Инициализация завершена успешно');
