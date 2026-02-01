const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🦜 Исправляем цены (делим на 100)...\n');

try {
  // Получаем все товары
  const products = db.prepare('SELECT id, name, price, old_price FROM products').all();
  
  console.log(`Найдено товаров: ${products.length}\n`);
  
  // Обновляем каждый товар
  const updateStmt = db.prepare(`
    UPDATE products 
    SET price = ?, old_price = ?, specs = ?
    WHERE id = ?
  `);
  
  const updateMany = db.transaction((products) => {
    for (const product of products) {
      // Делим цены на 100
      const newPrice = Math.round(product.price / 100);
      const newOldPrice = Math.round(product.old_price / 100);
      
      // Вычисляем скидку
      const discount = Math.round((1 - newPrice / newOldPrice) * 100);
      
      console.log(`ID ${product.id}: ${product.name.substring(0, 40)}...`);
      console.log(`  Старая цена: ${(newOldPrice / 100).toFixed(0)} ₽`);
      console.log(`  Новая цена: ${(newPrice / 100).toFixed(0)} ₽`);
      console.log(`  Скидка: ${discount}%\n`);
      
      // Обновляем specs
      const specs = JSON.stringify([
        {
          key: "Оригинальная цена",
          value: `${(newOldPrice / 100).toFixed(0)} ₽`
        },
        {
          key: "Скидка",
          value: `${discount}%`
        }
      ]);
      
      updateStmt.run(newPrice, newOldPrice, specs, product.id);
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
