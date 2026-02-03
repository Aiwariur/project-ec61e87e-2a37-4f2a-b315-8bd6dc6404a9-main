/**
 * Миграция: добавление колонки category в таблицу products
 * Запускать на сервере после деплоя: node migrate-add-category.cjs
 */

const Database = require('better-sqlite3');
const path = require('path');

// Определяем путь к БД
const isProduction = process.env.NODE_ENV === 'production';
const dbPath = isProduction 
  ? '/app/data/parrot_shop.db' 
  : path.join(__dirname, 'parrot_shop.db');

console.log(`📂 База данных: ${dbPath}`);

const db = new Database(dbPath);

// Проверяем, есть ли уже колонка category
const columns = db.prepare("PRAGMA table_info(products)").all();
const hasCategory = columns.some(col => col.name === 'category');

if (hasCategory) {
  console.log('✅ Колонка category уже существует');
} else {
  console.log('📝 Добавляю колонку category...');
  db.exec('ALTER TABLE products ADD COLUMN category TEXT');
  console.log('✅ Колонка category добавлена');
}

// Правила определения категории по названию
const categoryRules = [
  { pattern: /аратинг/i, category: 'Аратинга' },
  { pattern: /ара/i, category: 'Ара' },
  { pattern: /амазон/i, category: 'Амазон' },
  { pattern: /какаду/i, category: 'Какаду' },
  { pattern: /жако/i, category: 'Жако' },
  { pattern: /эклектус/i, category: 'Эклектус' },
  { pattern: /корелл/i, category: 'Корелла' },
  { pattern: /монах/i, category: 'Монах' },
  { pattern: /ожерел/i, category: 'Ожереловый' },
  { pattern: /королевск/i, category: 'Королевский' },
  { pattern: /сенегал/i, category: 'Сенегальский' },
  { pattern: /лорикет/i, category: 'Лорикет' },
  { pattern: /пиррур/i, category: 'Пиррура' },
];

function getCategory(name) {
  for (const rule of categoryRules) {
    if (rule.pattern.test(name)) {
      return rule.category;
    }
  }
  return null;
}

// Заполняем категории для товаров без категории
const products = db.prepare('SELECT id, name, category FROM products').all();
const updateStmt = db.prepare('UPDATE products SET category = ? WHERE id = ?');

let updated = 0;
for (const product of products) {
  if (!product.category) {
    const category = getCategory(product.name);
    if (category) {
      updateStmt.run(category, product.id);
      updated++;
      console.log(`  ${product.id}: ${product.name} -> ${category}`);
    }
  }
}

if (updated > 0) {
  console.log(`\n✅ Обновлено категорий: ${updated}`);
} else {
  console.log('✅ Все товары уже имеют категории');
}

// Проверяем результат
const categories = db.prepare('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category').all();
console.log(`\n📊 Категории в БД: ${categories.map(c => c.category).join(', ')}`);

db.close();
console.log('\n🎉 Миграция завершена');
