const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🦜 Умножаем цены обратно на 100...\n');

try {
  // Получаем все товары
  const products = db.prepare('SELECT id, name, price, old_price FROM products').all();
  
  console.log(`Найдено товаров: ${products.length}\n`);
  
  // Обновляем каждый товар
  const updateStmt = db.prepare(`
    UPDATE products 
    SET price = ?, old_price = ?
    WHERE id = ?
  `);
  
  const updateMany = db.transaction((products) => {
    for (const product of products) {
      // Умножаем цены на 100
      const newPrice = product.price * 100;
      const newOldPrice = product.old_price * 100;
      
      console.log(`ID ${product.id}: ${product.name.substring(0, 40)}...`);
      console.log(`  Было: ${product.price} -> Стало: ${newPrice}`);
      console.log(`  Было old: ${product.old_price} -> Стало: ${newOldPrice}\n`);
      
      updateStmt.run(newPrice, newOldPrice, product.id);
    }
  });
  
  updateMany(products);
  
  console.log('✅ Все цены успешно обновлены!');
  
  // Показываем статистику
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      MIN(price) as min_price,
      MAX(price) as max_price,
      AVG(price) as avg_price
    FROM products
  `).get();
  
  console.log('\n📊 Статистика:');
  console.log(`Всего товаров: ${stats.total}`);
  console.log(`Минимальная цена: ${(stats.min_price / 100).toFixed(0)} ₽`);
  console.log(`Максимальная цена: ${(stats.max_price / 100).toFixed(0)} ₽`);
  console.log(`Средняя цена: ${(stats.avg_price / 100).toFixed(0)} ₽`);
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
} finally {
  db.close();
}
