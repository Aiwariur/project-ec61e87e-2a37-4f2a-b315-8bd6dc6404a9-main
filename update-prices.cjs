const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🦜 Начинаем обновление цен...\n');

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
      // Берем текущую old_price как базовую цену
      const basePrice = product.old_price;
      
      // Уменьшаем базовую цену на 50%
      const halfPrice = Math.round(basePrice / 2);
      
      // Генерируем случайную скидку от 20% до 30%
      const additionalDiscount = 0.20 + Math.random() * 0.10; // от 0.20 до 0.30
      
      // Применяем дополнительную скидку к половинной цене
      const finalPrice = Math.round(halfPrice * (1 - additionalDiscount));
      
      // Общая скидка в процентах
      const totalDiscount = Math.round((1 - finalPrice / basePrice) * 100);
      
      console.log(`ID ${product.id}: ${product.name.substring(0, 40)}...`);
      console.log(`  Старая цена: ${(basePrice / 100).toFixed(0)} ₽`);
      console.log(`  Новая цена: ${(finalPrice / 100).toFixed(0)} ₽`);
      console.log(`  Общая скидка: ${totalDiscount}%\n`);
      
      updateStmt.run(finalPrice, basePrice, product.id);
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
      AVG(ROUND((1.0 - CAST(price AS REAL) / CAST(old_price AS REAL)) * 100)) as avg_discount
    FROM products
  `).get();
  
  console.log('\n📊 Статистика:');
  console.log(`Всего товаров: ${stats.total}`);
  console.log(`Минимальная цена: ${(stats.min_price / 100).toFixed(0)} ₽`);
  console.log(`Максимальная цена: ${(stats.max_price / 100).toFixed(0)} ₽`);
  console.log(`Средняя цена: ${(stats.avg_price / 100).toFixed(0)} ₽`);
  console.log(`Средняя скидка: ${stats.avg_discount.toFixed(1)}%`);
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
} finally {
  db.close();
}
