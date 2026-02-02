const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('📋 Последние заказы в БД:\n');

try {
  const orders = db.prepare(`
    SELECT id, order_number, status, created_at 
    FROM orders 
    ORDER BY id DESC 
    LIMIT 5
  `).all();
  
  if (orders.length === 0) {
    console.log('❌ Заказов нет в БД');
  } else {
    orders.forEach(order => {
      const date = new Date(order.created_at * 1000).toLocaleString('ru-RU');
      console.log(`ID: ${order.id} | ${order.order_number} | ${order.status} | ${date}`);
    });
  }
} catch (error) {
  console.error('Ошибка:', error.message);
} finally {
  db.close();
}
