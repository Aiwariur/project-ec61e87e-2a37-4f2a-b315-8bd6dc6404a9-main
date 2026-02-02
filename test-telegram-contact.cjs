const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🧪 Тестирование функции Telegram контактов\n');

try {
  // 1. Проверяем структуру таблицы
  console.log('1️⃣ Проверка структуры таблицы orders:');
  const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
  const hasUsername = tableInfo.some(col => col.name === 'telegram_username');
  const hasUserId = tableInfo.some(col => col.name === 'telegram_user_id');
  
  console.log(`   ✅ telegram_username: ${hasUsername ? 'есть' : 'НЕТ'}`);
  console.log(`   ✅ telegram_user_id: ${hasUserId ? 'есть' : 'НЕТ'}`);
  
  if (!hasUsername || !hasUserId) {
    console.log('\n❌ Ошибка: не все поля добавлены. Запустите migrate-telegram-fields.cjs');
    process.exit(1);
  }
  
  // 2. Создаем тестовый заказ с Telegram данными
  console.log('\n2️⃣ Создание тестового заказа:');
  
  const now = Math.floor(Date.now() / 1000);
  
  // Создаем тестового клиента
  const customerResult = db.prepare(`
    INSERT INTO customers (name, phone, email, address, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('Тестовый Клиент', '+7 (999) 999-99-99', 'test@example.com', 'Тестовый адрес', now, now);
  
  const customerId = customerResult.lastInsertRowid;
  console.log(`   ✅ Создан клиент ID: ${customerId}`);
  
  // Создаем заказ с Telegram данными
  const orderNumber = `TEST-${Date.now()}`;
  const orderResult = db.prepare(`
    INSERT INTO orders (
      order_number, customer_id, delivery_method, payment_method, 
      total, status, telegram_username, telegram_user_id, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    orderNumber,
    customerId,
    'Доставка',
    'sbp',
    5000000,
    'confirmed',
    'test_user',
    '123456789',
    now
  );
  
  const orderId = orderResult.lastInsertRowid;
  console.log(`   ✅ Создан заказ ${orderNumber} (ID: ${orderId})`);
  console.log(`   ✅ Telegram: @test_user (ID: 123456789)`);
  
  // 3. Проверяем, что данные сохранились
  console.log('\n3️⃣ Проверка сохраненных данных:');
  
  const order = db.prepare(`
    SELECT 
      o.*,
      c.name as customer_name,
      c.phone as customer_phone
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.id = ?
  `).get(orderId);
  
  console.log(`   📋 Заказ: ${order.order_number}`);
  console.log(`   👤 Клиент: ${order.customer_name}`);
  console.log(`   📱 Телефон: ${order.customer_phone}`);
  console.log(`   💬 Telegram: @${order.telegram_username || 'не указан'}`);
  console.log(`   🆔 User ID: ${order.telegram_user_id || 'не указан'}`);
  console.log(`   📊 Статус: ${order.status}`);
  
  // 4. Проверяем API формат
  console.log('\n4️⃣ Формат данных для API:');
  console.log(JSON.stringify({
    id: order.id,
    order_number: order.order_number,
    customer_name: order.customer_name,
    telegram_username: order.telegram_username,
    telegram_user_id: order.telegram_user_id,
    status: order.status
  }, null, 2));
  
  // 5. Удаляем тестовые данные
  console.log('\n5️⃣ Очистка тестовых данных:');
  db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
  db.prepare('DELETE FROM customers WHERE id = ?').run(customerId);
  console.log('   ✅ Тестовые данные удалены');
  
  console.log('\n✅ Все тесты пройдены успешно!');
  console.log('\n📝 Что дальше:');
  console.log('   1. Запустите сервер: npm run dev:all');
  console.log('   2. Откройте админку: http://localhost:5173/admin');
  console.log('   3. Когда клиент подтвердит заказ через Telegram, вы увидите его username');
  console.log('   4. Нажмите "Написать в Telegram" чтобы открыть диалог');
  
} catch (error) {
  console.error('\n❌ Ошибка теста:', error.message);
  process.exit(1);
} finally {
  db.close();
}
