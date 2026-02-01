const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🦜 Исправляем цены в specs...\n');

try {
  const products = db.prepare('SELECT id, name, price, old_price, specs FROM products').all();
  
  console.log(`Найдено товаров: ${products.length}\n`);
  
  const updateStmt = db.prepare(`UPDATE products SET specs = ? WHERE id = ?`);
  
  const updateMany = db.transaction((products) => {
    for (const product of products) {
      const discount = Math.round((1 - product.price / product.old_price) * 100);
      
      const specs = JSON.stringify([
        {
          key: "Оригинальная цена",
          value: `${(product.old_price / 100).toFixed(0)} ₽`
        },
        {
          key: "Скидка",
          value: `${discount}%`
        }
      ]);
      
      console.log(`ID ${product.id}: old_price=${(product.old_price / 100).toFixed(0)} ₽, скидка=${discount}%`);
      
      updateStmt.run(specs, product.id);
    }
  });
  
  updateMany(products);
  
  console.log('\n✅ Все specs обновлены!');
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
} finally {
  db.close();
}
