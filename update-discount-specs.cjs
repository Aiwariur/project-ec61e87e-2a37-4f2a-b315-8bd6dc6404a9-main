const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🦜 Обновляем информацию о скидках в specs...\n');

try {
  // Получаем все товары
  const products = db.prepare('SELECT id, name, price, old_price, specs FROM products').all();
  
  console.log(`Найдено товаров: ${products.length}\n`);
  
  // Обновляем каждый товар
  const updateStmt = db.prepare(`
    UPDATE products 
    SET specs = ? 
    WHERE id = ?
  `);
  
  let updated = 0;
  
  for (const product of products) {
    // Вычисляем реальную скидку
    const discount = Math.round((1 - product.price / product.old_price) * 100);
    
    // Парсим specs
    let specs = JSON.parse(product.specs);
    
    // Обновляем значение скидки
    const discountSpec = specs.find(s => s.key === 'Скидка');
    if (discountSpec) {
      discountSpec.value = `${discount}%`;
      
      // Сохраняем обновленные specs
      updateStmt.run(JSON.stringify(specs), product.id);
      updated++;
      
      console.log(`ID ${product.id}: ${product.name.substring(0, 50)}... - скидка ${discount}%`);
    }
  }
  
  console.log(`\n✅ Обновлено товаров: ${updated}`);
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
} finally {
  db.close();
}
