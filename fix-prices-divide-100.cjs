const Database = require('better-sqlite3');

const db = new Database('parrot_shop.db');

try {
  console.log('Начинаю исправление цен...\n');

  // Получаем все товары
  const products = db.prepare('SELECT id, name, price FROM products').all();
  
  console.log(`Найдено товаров: ${products.length}\n`);
  
  // Показываем первые 5 товаров ДО изменения
  console.log('Примеры цен ДО изменения:');
  products.slice(0, 5).forEach(p => {
    console.log(`ID ${p.id}: ${p.name.substring(0, 40)}... - ${p.price} руб.`);
  });
  
  // Обновляем цены - делим на 100
  const updateStmt = db.prepare('UPDATE products SET price = ? WHERE id = ?');
  const updateMany = db.transaction((products) => {
    for (const product of products) {
      const newPrice = Math.round(product.price / 100);
      updateStmt.run(newPrice, product.id);
    }
  });
  
  updateMany(products);
  
  // Проверяем результат
  const updatedProducts = db.prepare('SELECT id, name, price FROM products').all();
  
  console.log('\n✅ Цены успешно обновлены!\n');
  console.log('Примеры цен ПОСЛЕ изменения:');
  updatedProducts.slice(0, 5).forEach(p => {
    console.log(`ID ${p.id}: ${p.name.substring(0, 40)}... - ${p.price} руб.`);
  });
  
  // Статистика
  const minPrice = Math.min(...updatedProducts.map(p => p.price));
  const maxPrice = Math.max(...updatedProducts.map(p => p.price));
  const avgPrice = Math.round(updatedProducts.reduce((sum, p) => sum + p.price, 0) / updatedProducts.length);
  
  console.log('\n📊 Статистика цен:');
  console.log(`Минимальная цена: ${minPrice} руб.`);
  console.log(`Максимальная цена: ${maxPrice} руб.`);
  console.log(`Средняя цена: ${avgPrice} руб.`);
  
  // Проверяем, что все цены меньше 1 000 000
  const tooExpensive = updatedProducts.filter(p => p.price >= 1000000);
  if (tooExpensive.length > 0) {
    console.log('\n⚠️ ВНИМАНИЕ! Найдены товары с ценой >= 1 000 000:');
    tooExpensive.forEach(p => {
      console.log(`ID ${p.id}: ${p.name} - ${p.price} руб.`);
    });
  } else {
    console.log('\n✅ Все цены меньше 1 000 000 руб.');
  }
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
} finally {
  db.close();
}
