const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🧪 Тестирование Telegram ссылки для подтверждения заказа\n');

try {
  const now = Math.floor(Date.now() / 1000);
  
  // 1. Создаем тестовый заказ
  console.log('1️⃣ Создание тестового заказа:');
  
  const customerResult = db.prepare(`
    INSERT INTO customers (name, phone, email, address, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('Тест Клиент', '+7 (999) 555-44-33', 'test@test.ru', 'Тестовый адрес', now, now);
  
  const customerId = customerResult.lastInsertRowid;
  
  const orderNumber = `ORD-${Date.now()}`;
  const orderResult = db.prepare(`
    INSERT INTO orders (
      order_number, customer_id, delivery_method, payment_method, 
      total, status, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(orderNumber, customerId, 'Доставка', 'sbp', 10000000, 'new', now);
  
  const orderId = orderResult.lastInsertRowid;
  console.log(`   ✅ Создан заказ: ${orderNumber} (ID: ${orderId})`);
  
  // 2. Генерируем ссылку как на странице ThankYou
  console.log('\n2️⃣ Ссылка для клиента:');
  const telegramLink = `https://t.me/papugasik_bot?start=order_${orderNumber}`;
  console.log(`   ${telegramLink}`);
  
  // 3. Симулируем обработку параметра
  console.log('\n3️⃣ Обработка параметра бота:');
  const startParam = `order_${orderNumber}`;
  console.log(`   Параметр /start: ${startParam}`);
  
  // Убираем префикс "order_"
  const cleanParam = startParam.replace(/^order_/, '');
  console.log(`   Очищенный параметр: ${cleanParam}`);
  
  // 4. Ищем заказ
  console.log('\n4️⃣ Поиск заказа в БД:');
  const order = db.prepare(`
    SELECT 
      o.*,
      c.name as customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.order_number = ? OR o.id = ?
  `).get(cleanParam, cleanParam);
  
  if (order) {
    console.log(`   ✅ Заказ найден!`);
    console.log(`   📋 Номер: ${order.order_number}`);
    console.log(`   👤 Клиент: ${order.customer_name}`);
    console.log(`   📊 Статус: ${order.status}`);
  } else {
    console.log(`   ❌ Заказ НЕ найден!`);
  }
  
  // 5. Проверяем поиск по ID
  console.log('\n5️⃣ Альтернативный поиск по ID:');
  const orderById = db.prepare(`
    SELECT order_number FROM orders WHERE id = ?
  `).get(orderId);
  
  if (orderById) {
    console.log(`   ✅ Заказ найден по ID: ${orderById.order_number}`);
  }
  
  // 6. Очистка
  console.log('\n6️⃣ Очистка:');
  db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
  db.prepare('DELETE FROM customers WHERE id = ?').run(customerId);
  console.log('   ✅ Тестовые данные удалены');
  
  console.log('\n✅ Тест завершен!');
  console.log('\n📝 Как работает:');
  console.log('   1. Клиент оформляет заказ на сайте');
  console.log('   2. Его перекидывает на /thank-you?order=ORD-123456');
  console.log('   3. На странице кнопка "Подтвердить в Telegram"');
  console.log('   4. Ссылка: https://t.me/papugasik_bot?start=order_ORD-123456');
  console.log('   5. Бот получает параметр "order_ORD-123456"');
  console.log('   6. Убирает префикс "order_" → "ORD-123456"');
  console.log('   7. Ищет заказ по order_number = "ORD-123456"');
  console.log('   8. Показывает детали и кнопки подтверждения');
  
} catch (error) {
  console.error('\n❌ Ошибка:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  db.close();
}
