const Database = require('better-sqlite3');

const db = new Database('./parrot_shop.db');

console.log('🔍 Проверка текущих цен на production...\n');

// Получаем текущие цены
const products = db.prepare('SELECT id, name, price, old_price FROM products ORDER BY id').all();

console.log(`Всего товаров: ${products.length}\n`);
console.log('Первые 5 товаров (до изменения):');
products.slice(0, 5).forEach(p => {
  console.log(`  ID ${p.id}: ${p.name}`);
  console.log(`    Цена: ${p.price} руб, Старая цена: ${p.old_price || 'нет'}`);
});

// Статистика до изменения
const statsBefore = db.prepare('SELECT MIN(price) as min, MAX(price) as max, AVG(price) as avg FROM products').get();
console.log(`\nСтатистика ДО: от ${statsBefore.min} до ${statsBefore.max} руб (средняя: ${Math.round(statsBefore.avg)} руб)`);

console.log('\n💰 Снижаю все цены на 20%...\n');

// Обновляем цены: новая цена = текущая цена * 0.8 (снижение на 20%)
const updateStmt = db.prepare(`
  UPDATE products 
  SET 
    old_price = price,
    price = ROUND(price * 0.8)
  WHERE id = ?
`);

const updateMany = db.transaction((products) => {
  for (const product of products) {
    updateStmt.run(product.id);
  }
});

updateMany(products);

// Проверяем результат
const productsAfter = db.prepare('SELECT id, name, price, old_price FROM products ORDER BY id').all();

console.log('Первые 5 товаров (после изменения):');
productsAfter.slice(0, 5).forEach(p => {
  console.log(`  ID ${p.id}: ${p.name}`);
  console.log(`    Цена: ${p.price} руб, Старая цена: ${p.old_price}`);
});

// Статистика после изменения
const statsAfter = db.prepare('SELECT MIN(price) as min, MAX(price) as max, AVG(price) as avg FROM products').get();
console.log(`\nСтатистика ПОСЛЕ: от ${statsAfter.min} до ${statsAfter.max} руб (средняя: ${Math.round(statsAfter.avg)} руб)`);

console.log('\n✅ Все цены успешно снижены на 20%!');
console.log(`📊 Экономия для покупателей: от ${statsBefore.min - statsAfter.min} до ${statsBefore.max - statsAfter.max} руб на товар`);

db.close();
