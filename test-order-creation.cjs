const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🧪 Тестирование создания заказа через API\n');

try {
  const now = Math.floor(Date.now() / 1000);
  
  // 1. Создаем клиента
  console.log('1️⃣ Создание клиента:');
  const customerResult = db.prepare(`
    INSERT INTO customers (name, phone, email, address, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('API Тест', '+7 (999) 111-22-33', 'api@test.ru', 'Тестовый адрес', now, now);
  
  const customerId = customerResult.lastInsertRowid;
  console.log(`   ✅ Клиент создан, ID: ${customerId}`);
  
  // 2. Создаем заказ
  console.log('\n2️⃣ Создание заказа:');
  const orderNumber = `ORD-${Date.now()}`;
  const orderResult = db.prepare(`
    INSERT INTO orders (
      order_number, customer_id, delivery_method, payment_method, 
      total, status, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(orderNumber, customerId, 'Доставка', 'sbp', 10000000, 'new', now);
  
  const orderId = orderResult.lastInsertRowid;
  console.log(`   ✅ Заказ создан: ${orderNumber}`);
  console.log(`   📋 ID заказа: ${orderId}`);
  
  // 3. Проверяем, что API должен вернуть
  console.log('\n3️⃣ Формат ответа API:');
  const apiResponse = {
    success: true,
    id: orderId,
    order_number: orderNumber,
    message: 'Заказ успешно создан'
  };
  console.log(JSON.stringify(apiResponse, null, 2));
  
  // 4. Проверяем редирект URL
  console.log('\n4️⃣ URL для редиректа:');
  console.log(`   /thank-you?order=${orderNumber}`);
  console.log(`   или`);
  console.log(`   /thank-you?order=${orderId}`);
  
  // 5. Очистка
  console.log('\n5️⃣ Очистка:');
  db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
  db.prepare('DELETE FROM customers WHERE id = ?').run(customerId);
  console.log('   ✅ Тестовые данные удалены');
  
  console.log('\n✅ Тест завершен!');
  console.log('\n📝 Проверьте в браузере:');
  console.log('   1. Откройте DevTools (F12)');
  console.log('   2. Перейдите на вкладку Network');
  console.log('   3. Оформите заказ');
  console.log('   4. Найдите запрос POST /api/orders');
  console.log('   5. Проверьте Response - должен быть order_number');
  console.log('   6. Проверьте Console - должен быть редирект на /thank-you');
  
} catch (error) {
  console.error('\n❌ Ошибка:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  db.close();
}
