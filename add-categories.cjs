const Database = require('better-sqlite3');
const db = new Database('./parrot_shop.db');

console.log('Добавление колонки category в таблицу products...');

try {
  // Проверяем, есть ли уже колонка category
  const tableInfo = db.prepare("PRAGMA table_info(products)").all();
  const hasCategory = tableInfo.some(col => col.name === 'category');
  
  if (!hasCategory) {
    db.prepare("ALTER TABLE products ADD COLUMN category TEXT").run();
    console.log('✓ Колонка category добавлена');
  } else {
    console.log('✓ Колонка category уже существует');
  }

  // Обновляем категории для каждой породы
  const updates = [
    { pattern: 'Сине-желтый ара', category: 'Ара' },
    { pattern: 'Ара Синелобый малый', category: 'Ара' },
    { pattern: 'Амазон Белолобый', category: 'Амазон' },
    { pattern: 'Амазон Венесуэльский', category: 'Амазон' },
    { pattern: 'Амазон Желтолобый', category: 'Амазон' },
    { pattern: 'Амазон Синелобый', category: 'Амазон' },
    { pattern: 'Большой белохохлый какаду', category: 'Какаду' },
    { pattern: 'Желтохохлый какаду', category: 'Какаду' },
    { pattern: 'Какаду Гоффина', category: 'Какаду' },
    { pattern: 'Розовый какаду', category: 'Какаду' },
    { pattern: 'Краснохвостый Жако', category: 'Жако' },
    { pattern: 'Благородный Эклектус', category: 'Эклектус' },
    { pattern: 'Корелла', category: 'Корелла' },
    { pattern: 'Аратинга солнечная', category: 'Аратинга' },
    { pattern: 'Монах/квакер/калита', category: 'Монах' },
    { pattern: 'Ожереловый попугай', category: 'Ожереловый' },
    { pattern: 'Королевский попугай', category: 'Королевский' },
    { pattern: 'Сенегальский', category: 'Сенегальский' },
    { pattern: 'Радужный лорикет', category: 'Лорикет' },
    { pattern: 'Пиррура Молине', category: 'Пиррура' }
  ];

  console.log('\nОбновление категорий товаров...');
  const updateStmt = db.prepare('UPDATE products SET category = ? WHERE name LIKE ?');
  
  updates.forEach(({ pattern, category }) => {
    const result = updateStmt.run(category, `%${pattern}%`);
    console.log(`✓ ${category}: обновлено ${result.changes} товаров`);
  });

  // Проверяем результат
  console.log('\nПроверка категорий:');
  const categories = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM products 
    WHERE category IS NOT NULL
    GROUP BY category 
    ORDER BY category
  `).all();
  
  console.log('\nКатегории в базе:');
  categories.forEach(cat => {
    console.log(`  ${cat.category}: ${cat.count} товаров`);
  });

  const uncategorized = db.prepare('SELECT COUNT(*) as count FROM products WHERE category IS NULL').get();
  if (uncategorized.count > 0) {
    console.log(`\n⚠ Товаров без категории: ${uncategorized.count}`);
    const items = db.prepare('SELECT id, name FROM products WHERE category IS NULL').all();
    items.forEach(item => {
      console.log(`  ID ${item.id}: ${item.name}`);
    });
  } else {
    console.log('\n✓ Все товары имеют категории!');
  }

} catch (error) {
  console.error('Ошибка:', error.message);
} finally {
  db.close();
}
