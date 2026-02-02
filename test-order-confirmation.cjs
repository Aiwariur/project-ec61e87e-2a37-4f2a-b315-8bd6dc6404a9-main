const Database = require('better-sqlite3');
const path = require('path');

// Подключаемся к БД
const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🔍 Проверка системы подтверждения заказов\n');

// 1. Проверяем последние заказы
console.log('📋 Последние 5 заказов:');
const orders = db.prepare(`
  SELECT 
    o.id,
    o.order_number,
    o.status,
    o.created_at,
    c.name as customer_name,
    c.phone as customer_phone
  FROM orders o
  JOIN customers c ON o.customer_id = c.id
  ORDER BY o.created_at DESC
  LIMIT 5
`).all();

if (orders.length === 0) {
  console.log('❌ Заказов в базе нет!');
  console.log('\n💡 Создайте тестовый заказ через сайт или используйте скрипт создания заказа.');
} else {
  orders.forEach((order, index) => {
    console.log(`\n${index + 1}. Заказ #${order.order_number}`);
    console.log(`   ID: ${order.id}`);
    console.log(`   Статус: ${order.status}`);
    console.log(`   Клиент: ${order.customer_name} (${order.customer_phone})`);
    console.log(`   Дата: ${new Date(order.created_at * 1000).toLocaleString('ru-RU')}`);
    
    // Генерируем ссылку для Telegram
    const telegramLink = `https://t.me/papugasik_bot?start=order_${order.order_number}`;
    console.log(`   🔗 Ссылка: ${telegramLink}`);
  });
  
  console.log('\n\n✅ Для тестирования:');
  console.log('1. Скопируйте одну из ссылок выше');
  console.log('2. Откройте её в браузере или Telegram');
  console.log('3. Нажмите "Start" в боте');
  console.log('4. Должна появиться информация о заказе с кнопками подтверждения');
}

// 2. Проверяем структуру таблиц
console.log('\n\n📊 Структура таблицы orders:');
const orderColumns = db.prepare("PRAGMA table_info(orders)").all();
console.log('Колонки:', orderColumns.map(c => c.name).join(', '));

console.log('\n📊 Структура таблицы customers:');
const customerColumns = db.prepare("PRAGMA table_info(customers)").all();
console.log('Колонки:', customerColumns.map(c => c.name).join(', '));

// 3. Проверяем переменные окружения
console.log('\n\n🔧 Настройки Telegram:');
require('dotenv').config();
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Установлен' : '❌ Не установлен');
console.log('TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID ? `✅ ${process.env.TELEGRAM_CHAT_ID}` : '❌ Не установлен');

db.close();
console.log('\n✅ Проверка завершена!');
