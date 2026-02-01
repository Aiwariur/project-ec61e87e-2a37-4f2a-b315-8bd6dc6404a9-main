const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🔍 Проверка дубликатов товаров в базе данных...\n');

// Получаем все товары
const products = db.prepare('SELECT * FROM products ORDER BY id').all();

console.log(`📊 Всего товаров в базе: ${products.length}\n`);

// Группируем по названию
const byName = {};
products.forEach(product => {
  const name = product.name.trim();
  if (!byName[name]) {
    byName[name] = [];
  }
  byName[name].push(product);
});

// Ищем дубликаты по названию
const duplicatesByName = Object.entries(byName).filter(([_, items]) => items.length > 1);

if (duplicatesByName.length > 0) {
  console.log(`❌ Найдено ${duplicatesByName.length} товаров с дублирующимися названиями:\n`);
  
  duplicatesByName.forEach(([name, items]) => {
    console.log(`📦 "${name}" - ${items.length} записей:`);
    items.forEach(item => {
      console.log(`   ID: ${item.id}, Цена: ${item.price}, Категория: ${item.category}`);
    });
    console.log('');
  });
} else {
  console.log('✅ Дубликатов по названию не найдено\n');
}

// Проверяем полные дубликаты (название + цена + категория)
const byFullMatch = {};
products.forEach(product => {
  const key = `${product.name.trim()}|${product.price}|${product.category}`;
  if (!byFullMatch[key]) {
    byFullMatch[key] = [];
  }
  byFullMatch[key].push(product);
});

const fullDuplicates = Object.entries(byFullMatch).filter(([_, items]) => items.length > 1);

if (fullDuplicates.length > 0) {
  console.log(`❌ Найдено ${fullDuplicates.length} полных дубликатов (название + цена + категория):\n`);
  
  fullDuplicates.forEach(([key, items]) => {
    const [name, price, category] = key.split('|');
    console.log(`📦 "${name}" (${price}₽, ${category}) - ${items.length} записей:`);
    items.forEach(item => {
      console.log(`   ID: ${item.id}`);
    });
    console.log('');
  });
} else {
  console.log('✅ Полных дубликатов не найдено\n');
}

// Статистика по категориям
console.log('📊 Статистика по категориям:');
const byCategory = {};
products.forEach(product => {
  const cat = product.category || 'Без категории';
  byCategory[cat] = (byCategory[cat] || 0) + 1;
});

Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`   ${cat}: ${count} товаров`);
});

console.log('\n📋 Уникальные ID товаров:');
const uniqueIds = new Set(products.map(p => p.id));
console.log(`   Всего записей: ${products.length}`);
console.log(`   Уникальных ID: ${uniqueIds.size}`);

if (products.length !== uniqueIds.size) {
  console.log(`   ❌ Есть дубликаты ID!`);
} else {
  console.log(`   ✅ Все ID уникальны`);
}

db.close();
