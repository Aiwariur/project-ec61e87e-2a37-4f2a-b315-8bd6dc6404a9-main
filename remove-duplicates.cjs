const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🔧 Удаление дубликатов товаров...\n');

// Получаем все товары
const products = db.prepare('SELECT * FROM products ORDER BY id').all();
console.log(`📊 Всего товаров до очистки: ${products.length}\n`);

// Группируем по полному совпадению (название + цена + категория)
const byFullMatch = {};
products.forEach(product => {
  const key = `${product.name.trim()}|${product.price}|${product.category}`;
  if (!byFullMatch[key]) {
    byFullMatch[key] = [];
  }
  byFullMatch[key].push(product);
});

// Находим ID для удаления (оставляем только первый с минимальным ID)
const idsToDelete = [];
Object.entries(byFullMatch).forEach(([key, items]) => {
  if (items.length > 1) {
    // Сортируем по ID и берём все кроме первого
    items.sort((a, b) => a.id - b.id);
    const [name, price, category] = key.split('|');
    console.log(`🗑️  Удаляю дубликаты для "${name.substring(0, 50)}..."`);
    console.log(`   Оставляю ID: ${items[0].id}`);
    
    for (let i = 1; i < items.length; i++) {
      console.log(`   Удаляю ID: ${items[i].id}`);
      idsToDelete.push(items[i].id);
    }
    console.log('');
  }
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
  
  // Проверяем, остались ли дубликаты
  const checkDuplicates = db.prepare(`
    SELECT name, price, category, COUNT(*) as count 
    FROM products 
    GROUP BY name, price, category 
    HAVING count > 1
  `).all();
  
  if (checkDuplicates.length === 0) {
    console.log('✅ Полных дубликатов больше нет!\n');
  } else {
    console.log('⚠️  Остались дубликаты:');
    checkDuplicates.forEach(dup => {
      console.log(`   ${dup.name} - ${dup.count} записей`);
    });
  }
} else {
  console.log('✅ Полных дубликатов не найдено, удалять нечего\n');
}

db.close();
console.log('✅ Готово!');
