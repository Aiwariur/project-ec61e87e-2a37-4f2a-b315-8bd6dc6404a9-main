const Database = require('better-sqlite3');

const db = new Database('./parrot_shop.db');

console.log('📋 Последние 10 заказов в БД:\n');

const orders = db.prepare(`
  SELECT id, order_number, status, telegram_username, telegram_user_id, created_at
  FROM orders 
  ORDER BY id DESC 
  LIMIT 10
`).all();

if (orders.length === 0) {
  console.log('❌ Заказов нет');
} else {
  orders.forEach(order => {
    const date = new Date(order.created_at * 1000).toLocaleString('ru-RU');
    console.log(`ID: ${order.id} | ${order.order_number}`);
    console.log(`   Статус: ${order.status}`);
    console.log(`   Telegram: ${order.telegram_username ? '@' + order.telegram_username : 'нет'} (ID: ${order.telegram_user_id || 'нет'})`);
    console.log(`   Создан: ${date}`);
    console.log('');
  });
}

db.close();
