const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🧹 Очистка описаний товаров от лишних фраз...\n');

// Получаем все товары
const products = db.prepare('SELECT id, name, description FROM products').all();

console.log(`📊 Всего товаров: ${products.length}\n`);

// Фразы для удаления
const phrasesToRemove = [
  'Ручной выкормыш',
  'ручной выкормыш',
  'Полностью социализирован',
  'полностью социализирован',
  'Полностью социализированный',
  'полностью социализированный',
  'Полностью социализированная',
  'полностью социализированная',
];

let updatedCount = 0;
const updateStmt = db.prepare('UPDATE products SET description = ? WHERE id = ?');

const updateMany = db.transaction(() => {
  products.forEach(product => {
    if (!product.description) return;
    
    let newDescription = product.description;
    let wasModified = false;
    
    // Удаляем каждую фразу
    phrasesToRemove.forEach(phrase => {
      if (newDescription.includes(phrase)) {
        newDescription = newDescription.replace(new RegExp(phrase, 'gi'), '');
        wasModified = true;
      }
    });
    
    if (wasModified) {
      // Очищаем лишние пробелы, запятые и точки
      newDescription = newDescription
        .replace(/\s+/g, ' ')           // Множественные пробелы в один
        .replace(/\s*,\s*,\s*/g, ', ')  // Двойные запятые
        .replace(/\s*\.\s*\.\s*/g, '. ') // Двойные точки
        .replace(/^[\s,\.]+/, '')       // Пробелы/запятые/точки в начале
        .replace(/[\s,\.]+$/, '')       // Пробелы/запятые/точки в конце
        .replace(/,\s*\./g, '.')        // Запятая перед точкой
        .trim();
      
      // Добавляем точку в конце если её нет
      if (newDescription && !newDescription.endsWith('.')) {
        newDescription += '.';
      }
      
      console.log(`✏️  ID ${product.id}: "${product.name.substring(0, 50)}..."`);
      console.log(`   Было: "${product.description}"`);
      console.log(`   Стало: "${newDescription}"\n`);
      
      updateStmt.run(newDescription, product.id);
      updatedCount++;
    }
  });
});

updateMany();

console.log(`\n✅ Обновлено товаров: ${updatedCount}`);
console.log(`📊 Без изменений: ${products.length - updatedCount}\n`);

db.close();
console.log('✅ Готово!');
