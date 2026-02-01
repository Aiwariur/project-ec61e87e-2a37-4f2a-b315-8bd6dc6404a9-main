const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🦜 Исправляем цены и скидки...\n');

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
      // Берем текущую old_price и делим на 2 - это будет новая базовая цена
      const newBasePrice = Math.round(product.old_price / 2);
      
      // Генерируем случайную скидку от 20% до 30%
      const discount = 20 + Math.floor(Math.random() * 11); // от 20 до 30
      
      // Применяем скидку к новой базовой цене
      const finalPrice = Math.round(newBasePrice * (1 - discount / 100));
      
      // Новая old_price = новая базовая цена (без скидки)
      const newOldPrice = newBasePrice;
      
      console.log(`ID ${product.id}: ${product.name.substring(0, 40)}...`);
      console.log(`  Новая базовая цена: ${(newOldPrice / 100).toFixed(0)} ₽`);
      console.log(`  Цена со скидкой: ${(finalPrice / 100).toFixed(0)} ₽`);
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
      
      updateStmt.run(finalPrice, newOldPrice, specs, product.id);
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
      AVG(price) as avg_price,
      MIN(ROUND((1.0 - CAST(price AS REAL) / CAST(old_price AS REAL)) * 100)) as min_discount,
      MAX(ROUND((1.0 - CAST(price AS REAL) / CAST(old_price AS REAL)) * 100)) as max_discount,
      AVG(ROUND((1.0 - CAST(price AS REAL) / CAST(old_price AS REAL)) * 100)) as avg_discount
    FROM products
  `).get();
  
  console.log('\n📊 Статистика:');
  console.log(`Всего товаров: ${stats.total}`);
  console.log(`Минимальная цена: ${(stats.min_price / 100).toFixed(0)} ₽`);
  console.log(`Максимальная цена: ${(stats.max_price / 100).toFixed(0)} ₽`);
  console.log(`Средняя цена: ${(stats.avg_price / 100).toFixed(0)} ₽`);
  console.log(`Диапазон скидок: ${stats.min_discount}% - ${stats.max_discount}%`);
  console.log(`Средняя скидка: ${stats.avg_discount.toFixed(1)}%`);
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
} finally {
  db.close();
}
