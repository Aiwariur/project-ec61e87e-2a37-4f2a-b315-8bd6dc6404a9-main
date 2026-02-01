const Database = require('better-sqlite3');
const path = require('path');
const readline = require('readline');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Анализ товаров с одинаковыми названиями...\n');

// Получаем все товары
const products = db.prepare('SELECT * FROM products ORDER BY id').all();

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
  rl.close();
  process.exit(0);
}

console.log(`❌ Найдено ${duplicatesByName.length} товаров с дублирующимися названиями\n`);
console.log('📋 Список дубликатов:\n');

duplicatesByName.forEach(([name, items], index) => {
  console.log(`${index + 1}. "${name.substring(0, 60)}${name.length > 60 ? '...' : ''}"`);
  console.log(`   Количество записей: ${items.length}`);
  items.sort((a, b) => a.price - b.price);
  items.forEach(item => {
    console.log(`   - ID: ${item.id}, Цена: ${(item.price / 100).toFixed(2)}₽`);
  });
  console.log('');
});

console.log('\n⚠️  ВНИМАНИЕ! Сейчас будут удалены дубликаты.');
console.log('Для каждого названия останется только товар с МИНИМАЛЬНОЙ ценой.\n');

rl.question('Продолжить? (да/нет): ', (answer) => {
  if (answer.toLowerCase() !== 'да' && answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
    console.log('\n❌ Отменено пользователем');
    db.close();
    rl.close();
    process.exit(0);
  }

  console.log('\n🔧 Удаление дубликатов...\n');

  const idsToDelete = [];
  duplicatesByName.forEach(([name, items]) => {
    // Сортируем по цене (минимальная первая)
    items.sort((a, b) => a.price - b.price);
    
    console.log(`🗑️  "${name.substring(0, 50)}..."`);
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
  }

  db.close();
  rl.close();
  console.log('✅ Готово!');
});
