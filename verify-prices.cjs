const Database = require('better-sqlite3');

const db = new Database('parrot_shop.db');

try {
  const products = db.prepare('SELECT id, name, price FROM products ORDER BY price DESC').all();
  
  console.log('=== ПРОВЕРКА ЦЕН В БАЗЕ ДАННЫХ ===\n');
  console.log(`Всего товаров: ${products.length}\n`);
  
  console.log('Топ-10 самых дорогих товаров:');
  products.slice(0, 10).forEach(p => {
    console.log(`ID ${p.id}: ${p.price.toLocaleString('ru-RU')} руб. - ${p.name.substring(0, 50)}`);
  });
  
  console.log('\n10 самых дешевых товаров:');
  products.slice(-10).reverse().forEach(p => {
    console.log(`ID ${p.id}: ${p.price.toLocaleString('ru-RU')} руб. - ${p.name.substring(0, 50)}`);
  });
  
  const maxPrice = Math.max(...products.map(p => p.price));
  const minPrice = Math.min(...products.map(p => p.price));
  const avgPrice = Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length);
  
  console.log('\n📊 Статистика:');
  console.log(`Максимальная цена: ${maxPrice.toLocaleString('ru-RU')} руб.`);
  console.log(`Минимальная цена: ${minPrice.toLocaleString('ru-RU')} руб.`);
  console.log(`Средняя цена: ${avgPrice.toLocaleString('ru-RU')} руб.`);
  
  const tooExpensive = products.filter(p => p.price >= 1000000);
  if (tooExpensive.length > 0) {
    console.log('\n❌ ОШИБКА! Найдены товары с ценой >= 1 000 000:');
    tooExpensive.forEach(p => {
      console.log(`ID ${p.id}: ${p.price.toLocaleString('ru-RU')} руб. - ${p.name}`);
    });
  } else {
    console.log('\n✅ ВСЕ ЦЕНЫ КОРРЕКТНЫ! Все товары дешевле 1 000 000 руб.');
  }
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
} finally {
  db.close();
}
