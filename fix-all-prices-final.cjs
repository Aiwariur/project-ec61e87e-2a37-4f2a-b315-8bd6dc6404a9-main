const Database = require('better-sqlite3');
const db = new Database('parrot_shop.db');

console.log('🔧 Исправление всех цен в базе данных...\n');

// Получаем все товары
const products = db.prepare('SELECT id, name, price, old_price FROM products').all();

console.log(`📦 Найдено товаров: ${products.length}\n`);

// Умножаем все цены на 100 (переводим в копейки)
const updatePrice = db.prepare('UPDATE products SET price = ?, old_price = ? WHERE id = ?');

const updateMany = db.transaction((products) => {
  for (const product of products) {
    const newPrice = product.price * 100;
    const newOldPrice = product.old_price ? product.old_price * 100 : null;
    
    updatePrice.run(newPrice, newOldPrice, product.id);
    
    console.log(`✅ ID ${product.id}: ${product.name}`);
    console.log(`   Цена: ${product.price} → ${newPrice}`);
    if (product.old_price) {
      console.log(`   Старая цена: ${product.old_price} → ${newOldPrice}`);
    }
    console.log('');
  }
});

updateMany(products);

console.log('✨ Все цены успешно исправлены!');
console.log('\n📊 Проверка первых 5 товаров:');

const check = db.prepare('SELECT id, name, price, old_price FROM products LIMIT 5').all();
check.forEach(p => {
  console.log(`\nID ${p.id}: ${p.name}`);
  console.log(`  Цена в БД: ${p.price} копеек = ${(p.price / 100).toLocaleString('ru-RU')} ₽`);
  if (p.old_price) {
    console.log(`  Старая цена: ${p.old_price} копеек = ${(p.old_price / 100).toLocaleString('ru-RU')} ₽`);
  }
});

db.close();
