const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🧪 Тестирование потока заказа с Telegram\n');

try {
  // 1. Создаем тестовый заказ
  console.log('1️⃣ Создание тестового заказа:');
  
  const now = Math.floor(Date.now() / 1000);
  
  // Создаем клиента
  const customerResult = db.prepare(`
    INSERT INTO customers (name, phone, email, address, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('Тест Клиент', '+7 (999) 888-77-66', 'test@test.ru', 'Тестовая улица, 1', now, now);
  
  const customerId = customerResult.lastInsertRowid;
  console.log(`   ✅ Создан клиент ID: ${customerId}`);
  
  // Создаем заказ
  const orderNumber = `TEST-${Date.now()}`;
  const orderResult = db.prepare(`
    INSERT INTO orders (
      order_number, customer_id, delivery_method, payment_method, 
      total, status, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(orderNumber, customerId, 'Доставка', 'sbp', 10000000, 'new', now);
  
  const orderId = orderResult.lastInsertRowid;
  console.log(`   ✅ Создан заказ ${orderNumber} (ID: ${orderId})`);
  
  // 2. Проверяем, что заказ можно найти по ID
  console.log('\n2️⃣ Поиск заказа по ID:');
  
  const order = db.prepare(`
    SELECT 
      o.*,
      c.name as customer_name,
      c.phone as customer_phone
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.id = ?
  `).get(orderId);
  
  if (order) {
    console.log(`   ✅ Заказ найден: ${order.order_number}`);
    console.log(`   📊 Статус: ${order.status}`);
    console.log(`   👤 Клиент: ${order.customer_name}`);
  } else {
    console.log('   ❌ Заказ НЕ найден!');
  }
  
  // 3. Симулируем подтверждение через Telegram
  console.log('\n3️⃣ Симуляция подтверждения через Telegram:');
  
  const updateResult = db.prepare(`
    UPDATE orders 
    SET status = ?, telegram_username = ?, telegram_user_id = ? 
    WHERE id = ?
  `).run('confirmed', 'test_user', '123456789', orderId);
  
  console.log(`   ✅ Обновлено строк: ${updateResult.changes}`);
  
  // 4. Проверяем обновленные данные
  console.log('\n4️⃣ Проверка обновленных данных:');
  
  const updatedOrder = db.prepare(`
    SELECT * FROM orders WHERE id = ?
  `).get(orderId);
  
  console.log(`   📋 Заказ: ${updatedOrder.order_number}`);
  console.log(`   📊 Статус: ${updatedOrder.status}`);
  console.log(`   💬 Telegram: @${updatedOrder.telegram_username || 'не указан'}`);
  console.log(`   🆔 User ID: ${updatedOrder.telegram_user_id || 'не указан'}`);
  
  // 5. Проверяем callback_data формат
  console.log('\n5️⃣ Формат callback_data для кнопок:');
  console.log(`   confirm_${orderId} - для подтверждения`);
  console.log(`   cancel_${orderId} - для отмены`);
  
  // 6. Очистка
  console.log('\n6️⃣ Очистка тестовых данных:');
  db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
  db.prepare('DELETE FROM customers WHERE id = ?').run(customerId);
  console.log('   ✅ Тестовые данные удалены');
  
  console.log('\n✅ Все тесты пройдены!');
  console.log('\n📝 Как работает поток:');
  console.log('   1. Создается заказ с ID (например, 8)');
  console.log('   2. В Telegram отправляется уведомление с кнопками:');
  console.log('      - callback_data: "confirm_8"');
  console.log('      - callback_data: "cancel_8"');
  console.log('   3. Когда клиент нажимает кнопку, бот получает callback с ID заказа');
  console.log('   4. Бот ищет заказ по ID и обновляет его статус + сохраняет Telegram данные');
  
} catch (error) {
  console.error('\n❌ Ошибка теста:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  db.close();
}
