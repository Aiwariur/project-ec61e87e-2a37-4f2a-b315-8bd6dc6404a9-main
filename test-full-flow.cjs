const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🧪 ПОЛНЫЙ ТЕСТ ПОТОКА ЗАКАЗА\n');
console.log('='.repeat(60));

try {
  const now = Math.floor(Date.now() / 1000);
  
  // ШАГ 1: Создание заказа
  console.log('\n📝 ШАГ 1: Создание заказа');
  console.log('-'.repeat(60));
  
  const customerResult = db.prepare(`
    INSERT INTO customers (name, phone, email, address, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('Полный Тест', '+7 (999) 000-11-22', 'fulltest@test.ru', 'Тестовый адрес', now, now);
  
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
  
  console.log(`✅ Заказ создан:`);
  console.log(`   ID: ${orderId}`);
  console.log(`   Номер: ${orderNumber}`);
  
  // ШАГ 2: Страница благодарности
  console.log('\n📄 ШАГ 2: Страница благодарности');
  console.log('-'.repeat(60));
  
  const thankYouUrl = `/thank-you?order=${orderNumber}`;
  console.log(`✅ URL страницы: ${thankYouUrl}`);
  
  // ШАГ 3: Ссылка на Telegram
  console.log('\n💬 ШАГ 3: Ссылка на Telegram бота');
  console.log('-'.repeat(60));
  
  const telegramLink = `https://t.me/papugasik_bot?start=order_${orderNumber}`;
  console.log(`✅ Ссылка: ${telegramLink}`);
  
  // ШАГ 4: Обработка /start в боте
  console.log('\n🤖 ШАГ 4: Обработка команды /start');
  console.log('-'.repeat(60));
  
  // Симулируем что бот получает
  const startCommand = `/start order_${orderNumber}`;
  console.log(`Команда: ${startCommand}`);
  
  // Парсим параметры как в боте
  const match = startCommand.match(/\/start(.*)/);
  const params = match[1].trim();
  console.log(`Параметры (после trim): "${params}"`);
  
  // Убираем префикс order_
  const orderParam = params.replace(/^order_/, '');
  console.log(`После удаления префикса: "${orderParam}"`);
  
  // ШАГ 5: Поиск в БД
  console.log('\n🔍 ШАГ 5: Поиск заказа в БД');
  console.log('-'.repeat(60));
  
  console.log(`SQL запрос:`);
  console.log(`  WHERE o.order_number = '${orderParam}' OR o.id = '${orderParam}'`);
  
  const order = db.prepare(`
    SELECT 
      o.*,
      c.name as customer_name,
      c.phone as customer_phone
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.order_number = ? OR o.id = ?
  `).get(orderParam, orderParam);
  
  if (order) {
    console.log(`✅ ЗАКАЗ НАЙДЕН!`);
    console.log(`   ID: ${order.id}`);
    console.log(`   Номер: ${order.order_number}`);
    console.log(`   Клиент: ${order.customer_name}`);
    console.log(`   Статус: ${order.status}`);
  } else {
    console.log(`❌ ЗАКАЗ НЕ НАЙДЕН!`);
    console.log(`\n🔍 Отладка:`);
    
    // Проверяем что вообще есть в БД
    const allOrders = db.prepare('SELECT id, order_number FROM orders ORDER BY id DESC LIMIT 3').all();
    console.log(`\nПоследние заказы в БД:`);
    allOrders.forEach(o => {
      console.log(`   ${o.id}: ${o.order_number}`);
    });
    
    // Проверяем точное совпадение
    const exactMatch = db.prepare('SELECT id FROM orders WHERE order_number = ?').get(orderParam);
    console.log(`\nТочное совпадение order_number = "${orderParam}": ${exactMatch ? 'ДА' : 'НЕТ'}`);
  }
  
  // ШАГ 6: Очистка
  console.log('\n🧹 ШАГ 6: Очистка');
  console.log('-'.repeat(60));
  
  db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
  db.prepare('DELETE FROM customers WHERE id = ?').run(customerId);
  console.log('✅ Тестовые данные удалены');
  
  console.log('\n' + '='.repeat(60));
  if (order) {
    console.log('✅ ТЕСТ ПРОЙДЕН УСПЕШНО!');
  } else {
    console.log('❌ ТЕСТ ПРОВАЛЕН!');
  }
  console.log('='.repeat(60));
  
} catch (error) {
  console.error('\n❌ ОШИБКА:', error.message);
  console.error(error.stack);
  process.exit(1);
} finally {
  db.close();
}
