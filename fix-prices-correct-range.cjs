const Database = require('better-sqlite3');
const db = new Database('parrot_shop.db');

console.log('🔧 ПРАВИЛЬНОЕ исправление цен (диапазон 3000-150000 рублей)...\n');

// Получаем все товары
const products = db.prepare('SELECT id, name, price, old_price FROM products').all();

console.log(`📦 Найдено товаров: ${products.length}\n`);

// Правильные цены в копейках (умножаем рубли на 100)
const correctPrices = {
  // Кореллы - самые дешевые (3000-5000 руб)
  78: { price: 3850, old_price: 5000 },
  108: { price: 3650, old_price: 5000 },
  
  // Монахи, Пиррура, Ожереловые (12000-17000 руб)
  83: { price: 12250, old_price: 17500 },
  84: { price: 13475, old_price: 17500 },
  85: { price: 14800, old_price: 20000 },
  86: { price: 16200, old_price: 22500 },
  88: { price: 13825, old_price: 17500 },
  89: { price: 12775, old_price: 17500 },
  90: { price: 14400, old_price: 20000 },
  91: { price: 16200, old_price: 22500 },
  107: { price: 13825, old_price: 17500 },
  111: { price: 12950, old_price: 17500 },
  112: { price: 12425, old_price: 17500 },
  113: { price: 15400, old_price: 20000 },
  114: { price: 16650, old_price: 22500 },
  
  // Лорикеты, Аратинги (22000-30000 руб)
  82: { price: 25675, old_price: 32500 },
  81: { price: 28875, old_price: 37500 },
  105: { price: 30000, old_price: 37500 },
  106: { price: 22750, old_price: 32500 },
  
  // Сенегальские, Королевские (26000-29000 руб)
  80: { price: 28875, old_price: 37500 },
  87: { price: 26625, old_price: 37500 },
  79: { price: 26625, old_price: 37500 },
  109: { price: 28875, old_price: 37500 },
  110: { price: 27375, old_price: 37500 },
  
  // Амазоны (49000-71000 руб)
  67: { price: 52500, old_price: 75000 },
  68: { price: 56000, old_price: 70000 },
  69: { price: 65700, old_price: 90000 },
  70: { price: 66300, old_price: 85000 },
  94: { price: 59250, old_price: 75000 },
  95: { price: 49700, old_price: 70000 },
  96: { price: 71100, old_price: 90000 },
  97: { price: 62050, old_price: 85000 },
  117: { price: 54750, old_price: 75000 },
  118: { price: 49700, old_price: 70000 },
  119: { price: 63000, old_price: 90000 },
  120: { price: 68000, old_price: 85000 },
  
  // Эклектусы (56000-72000 руб)
  72: { price: 60000, old_price: 80000 },
  73: { price: 68400, old_price: 95000 },
  99: { price: 56800, old_price: 80000 },
  100: { price: 72200, old_price: 95000 },
  122: { price: 61600, old_price: 80000 },
  123: { price: 69350, old_price: 95000 },
  
  // Жако (63000-71000 руб)
  71: { price: 71100, old_price: 90000 },
  98: { price: 63900, old_price: 90000 },
  121: { price: 63900, old_price: 90000 },
  
  // Ара малые (67000-72000 руб)
  66: { price: 72200, old_price: 95000 },
  93: { price: 67450, old_price: 95000 },
  116: { price: 72200, old_price: 95000 },
  
  // Какаду Гоффина (85000-88000 руб)
  76: { price: 88550, old_price: 115000 },
  103: { price: 85100, old_price: 115000 },
  126: { price: 85100, old_price: 115000 },
  
  // Розовые какаду (88000-96000 руб)
  74: { price: 90000, old_price: 125000 },
  101: { price: 96250, old_price: 125000 },
  124: { price: 88750, old_price: 125000 },
  
  // Желтохохлые какаду (124000-126000 руб)
  77: { price: 126400, old_price: 160000 },
  104: { price: 124800, old_price: 160000 },
  127: { price: 124800, old_price: 160000 },
  
  // Ара большие (134000-152000 руб)
  65: { price: 152000, old_price: 190000 },
  92: { price: 134900, old_price: 190000 },
  115: { price: 138700, old_price: 190000 },
  
  // Белохохлые какаду (147000-159000 руб)
  75: { price: 159600, old_price: 210000 },
  102: { price: 157500, old_price: 210000 },
  125: { price: 147000, old_price: 210000 },
};

const updatePrice = db.prepare('UPDATE products SET price = ?, old_price = ? WHERE id = ?');

const updateMany = db.transaction((products) => {
  for (const product of products) {
    const correctPrice = correctPrices[product.id];
    
    if (correctPrice) {
      // Переводим в копейки (умножаем на 100)
      const newPrice = correctPrice.price * 100;
      const newOldPrice = correctPrice.old_price * 100;
      
      updatePrice.run(newPrice, newOldPrice, product.id);
      
      console.log(`✅ ID ${product.id}: ${product.name.substring(0, 50)}...`);
      console.log(`   Цена: ${correctPrice.price} ₽ (${newPrice} копеек)`);
      console.log(`   Старая: ${correctPrice.old_price} ₽ (${newOldPrice} копеек)\n`);
    }
  }
});

updateMany(products);

console.log('✨ Все цены исправлены!\n');
console.log('📊 Проверка диапазона цен:');

const minMax = db.prepare(`
  SELECT 
    MIN(price) as min_price, 
    MAX(price) as max_price,
    MIN(old_price) as min_old,
    MAX(old_price) as max_old
  FROM products
`).get();

console.log(`\nМинимальная цена: ${(minMax.min_price / 100).toLocaleString('ru-RU')} ₽`);
console.log(`Максимальная цена: ${(minMax.max_price / 100).toLocaleString('ru-RU')} ₽`);
console.log(`\nПримеры товаров:`);

const samples = db.prepare(`
  SELECT id, name, price, old_price 
  FROM products 
  WHERE id IN (78, 83, 67, 74, 65, 75)
  ORDER BY price
`).all();

samples.forEach(p => {
  console.log(`\n${p.name.substring(0, 40)}...`);
  console.log(`  Цена: ${(p.price / 100).toLocaleString('ru-RU')} ₽`);
  console.log(`  Старая: ${(p.old_price / 100).toLocaleString('ru-RU')} ₽`);
});

db.close();
