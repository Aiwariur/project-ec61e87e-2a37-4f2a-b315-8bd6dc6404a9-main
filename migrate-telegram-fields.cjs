const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🔄 Начинаем миграцию базы данных...');

try {
  // Проверяем, существуют ли уже колонки
  const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
  const hasUsername = tableInfo.some(col => col.name === 'telegram_username');
  const hasUserId = tableInfo.some(col => col.name === 'telegram_user_id');
  
  if (hasUsername && hasUserId) {
    console.log('✅ Колонки telegram_username и telegram_user_id уже существуют');
  } else {
    // Добавляем колонки если их нет
    if (!hasUsername) {
      db.prepare('ALTER TABLE orders ADD COLUMN telegram_username TEXT').run();
      console.log('✅ Добавлена колонка telegram_username');
    }
    
    if (!hasUserId) {
      db.prepare('ALTER TABLE orders ADD COLUMN telegram_user_id TEXT').run();
      console.log('✅ Добавлена колонка telegram_user_id');
    }
  }
  
  // Показываем статистику
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  const ordersWithTelegram = db.prepare('SELECT COUNT(*) as count FROM orders WHERE telegram_user_id IS NOT NULL').get();
  
  console.log('\n📊 Статистика:');
  console.log(`   Всего заказов: ${totalOrders.count}`);
  console.log(`   С Telegram данными: ${ordersWithTelegram.count}`);
  
  console.log('\n✅ Миграция завершена успешно!');
  
} catch (error) {
  console.error('❌ Ошибка миграции:', error.message);
  process.exit(1);
} finally {
  db.close();
}
