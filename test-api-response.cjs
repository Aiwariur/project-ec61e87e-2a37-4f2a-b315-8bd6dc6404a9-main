const Database = require('better-sqlite3');
const db = new Database('parrot_shop.db');

console.log('🔍 Проверка что API должен отдавать:\n');

const products = db.prepare('SELECT id, name, price, old_price FROM products LIMIT 5').all();

products.forEach(p => {
  const parsed = {
    ...p,
    oldPrice: p.old_price,
    inStock: p.in_stock,
  };
  
  console.log(`ID ${p.id}:`);
  console.log(`  name: ${p.name.substring(0, 40)}...`);
  console.log(`  price: ${p.price} (${p.price / 100} ₽)`);
  console.log(`  old_price: ${p.old_price} (${p.old_price / 100} ₽)`);
  console.log(`  oldPrice: ${parsed.oldPrice} (${parsed.oldPrice / 100} ₽)`);
  console.log(`  Скидка видна? ${parsed.oldPrice ? 'ДА' : 'НЕТ'}`);
  console.log('');
});

db.close();
