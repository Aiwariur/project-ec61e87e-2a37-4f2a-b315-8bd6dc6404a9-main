const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🔧 Автоматическое удаление всех дубликатов товаров...\n');

// Получаем все товары
const products = db.prepare('SELECT * FROM products ORDER BY id').all();
console.log(`📊 Всего товаров до очистки: ${products.length}\n`);

// Группируем по названию
const byName = {};
products.forEach(product => {
  const name = product.name.trim();
  if (!byName[name]) {
    byName[name] = [];
  }
  byName[name].push(product);
});

// Находим дубликаты по названию
const duplicatesByName = Object.entries(byName).filter(([_, items]) => items.length > 1);

if (duplicatesByName.length === 0) {
  console.log('✅ Дубликатов по названию не найдено\n');
  db.close();
  process.exit(0);
}

console.log(`❌ Найдено ${duplicatesByName.length} товаров с дублирующимися названиями\n`);

const idsToDelete = [];
duplicatesByName.forEach(([name, items]) => {
  // Сортируем по цене (минимальная первая)
  items.sort((a, b) => a.price - b.price);
  
  console.log(`🗑️  "${name.substring(0, 60)}${name.length > 60 ? '...' : ''}"`);
  console.log(`   Оставляю ID: ${items[0].id} (цена: ${(items[0].price / 100).toFixed(2)}₽)`);
  
  for (let i = 1; i < items.length; i++) {
    console.log(`   Удаляю ID: ${items[i].id} (цена: ${(items[i].price / 100).toFixed(2)}₽)`);
    idsToDelete.push(items[i].id);
  }
  console.log('');
});

if (idsToDelete.length > 0) {
  console.log(`\n📝 Всего будет удалено: ${idsToDelete.length} дубликатов\n`);
  
  // Удаляем дубликаты
  const deleteStmt = db.prepare('DELETE FROM products WHERE id = ?');
  const deleteMany = db.transaction((ids) => {
    for (const id of ids) {
      deleteStmt.run(id);
    }
  });
  
  deleteMany(idsToDelete);
  
  console.log('✅ Дубликаты успешно удалены!\n');
  
  // Проверяем результат
  const remainingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
  console.log(`📊 Товаров после очистки: ${remainingProducts.count}`);
  console.log(`🗑️  Удалено записей: ${products.length - remainingProducts.count}\n`);
  
  // Финальная проверка
  const checkDuplicates = db.prepare(`
    SELECT name, COUNT(*) as count 
    FROM products 
    GROUP BY name 
    HAVING count > 1
  `).all();
  
  if (checkDuplicates.length === 0) {
    console.log('✅ Все дубликаты по названию удалены!\n');
  } else {
    console.log('⚠️  Остались дубликаты:');
    checkDuplicates.forEach(dup => {
      console.log(`   ${dup.name} - ${dup.count} записей`);
    });
  }
}

db.close();
console.log('✅ Готово!');
