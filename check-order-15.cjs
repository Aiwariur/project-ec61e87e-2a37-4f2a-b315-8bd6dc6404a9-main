const Database = require('better-sqlite3');

const db = new Database('./parrot_shop.db');

const order = db.prepare(`
  SELECT id, order_number, status, telegram_username, telegram_user_id 
  FROM orders 
  WHERE id = 15
`).get();

if (order) {
  console.log('✅ Заказ #15:');
  console.log(`   Номер: ${order.order_number}`);
  console.log(`   Статус: ${order.status}`);
  console.log(`   Username: ${order.telegram_username || 'не указан'}`);
  console.log(`   User ID: ${order.telegram_user_id || 'не указан'}`);
} else {
  console.log('❌ Заказ #15 не найден');
}

db.close();
