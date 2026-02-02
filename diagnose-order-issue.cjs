const https = require('https');

const PRODUCTION_URL = 'https://zolotoykakadushop.sbs';
const ORDER_NUMBER = 'ORD-1770068335633'; // Последний заказ

console.log('🔍 ДИАГНОСТИКА ПРОБЛЕМЫ С ПОДТВЕРЖДЕНИЕМ ЗАКАЗОВ\n');
console.log('='.repeat(70));

async function getOrders() {
  return new Promise((resolve, reject) => {
    https.get(`${PRODUCTION_URL}/api/orders`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function diagnose() {
  console.log('\n📊 ШАГ 1: Получаю все заказы с сервера...\n');
  
  const orders = await getOrders();
  console.log(`✅ Получено заказов: ${orders.length}\n`);
  
  console.log('📋 АНАЛИЗ ПОСЛЕДНИХ 5 ЗАКАЗОВ:');
  console.log('-'.repeat(70));
  
  const recentOrders = orders.slice(0, 5);
  
  recentOrders.forEach((order, index) => {
    console.log(`\n${index + 1}. Заказ: ${order.order_number}`);
    console.log(`   Статус: ${order.status}`);
    console.log(`   Клиент: ${order.customer_name}`);
    console.log(`   Телефон: ${order.customer_phone}`);
    console.log(`   Дата: ${new Date(order.created_at * 1000).toLocaleString('ru-RU')}`);
    
    if (order.telegram_username) {
      console.log(`   ✅ Telegram: @${order.telegram_username}`);
      console.log(`   ✅ User ID: ${order.telegram_user_id}`);
    } else {
      console.log(`   ❌ Telegram данные ОТСУТСТВУЮТ`);
    }
    
    // Генерируем ссылку для подтверждения
    const telegramLink = `https://t.me/papugasik_bot?start=order_${order.order_number}`;
    console.log(`   🔗 Ссылка: ${telegramLink}`);
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('🔍 ДИАГНОСТИКА ПРОБЛЕМЫ:\n');
  
  const ordersWithTelegram = orders.filter(o => o.telegram_username);
  const ordersWithoutTelegram = orders.filter(o => !o.telegram_username);
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  
  console.log(`📊 Статистика:`);
  console.log(`   Всего заказов: ${orders.length}`);
  console.log(`   С Telegram данными: ${ordersWithTelegram.length}`);
  console.log(`   БЕЗ Telegram данных: ${ordersWithoutTelegram.length}`);
  console.log(`   Подтвержденных: ${confirmedOrders.length}`);
  
  console.log('\n❗ ПРОБЛЕМЫ:');
  
  if (ordersWithoutTelegram.length === orders.length) {
    console.log('   🔴 КРИТИЧНО: НИ ОДИН заказ не имеет Telegram данных!');
    console.log('   Это значит что:');
    console.log('   1. Telegram бот НЕ РАБОТАЕТ на production сервере');
    console.log('   2. ИЛИ клиенты НЕ МОГУТ подтвердить заказы через бота');
    console.log('   3. ИЛИ функция confirmOrder() НЕ СОХРАНЯЕТ данные');
  } else if (ordersWithoutTelegram.length > ordersWithTelegram.length) {
    console.log('   🟡 ВНИМАНИЕ: Большинство заказов без Telegram данных');
    console.log('   Возможные причины:');
    console.log('   1. Бот работает нестабильно');
    console.log('   2. Клиенты не переходят по ссылке');
    console.log('   3. Проблемы с сохранением данных');
  } else {
    console.log('   🟢 Telegram данные сохраняются (но не для всех заказов)');
  }
  
  console.log('\n💡 ЧТО ПРОВЕРИТЬ НА СЕРВЕРЕ:\n');
  console.log('1. Подключитесь к серверу:');
  console.log('   ssh root@144.31.212.184\n');
  
  console.log('2. Проверьте логи PM2:');
  console.log('   pm2 logs popugai-market --lines 100\n');
  
  console.log('3. Проверьте что бот запущен:');
  console.log('   В логах должно быть:');
  console.log('   "✅ Telegram бот инициализирован (режим polling)"\n');
  
  console.log('4. Проверьте .env файл:');
  console.log('   cat /var/www/popugai-market/.env');
  console.log('   Должны быть:');
  console.log('   - TELEGRAM_BOT_TOKEN=8372065466:AAH5ejcJHBXZnAPQ8ZXiG_eErAE8S_AwnnE');
  console.log('   - TELEGRAM_CHAT_ID=7784231136\n');
  
  console.log('5. Проверьте структуру БД:');
  console.log('   cd /var/www/popugai-market');
  console.log('   sqlite3 parrot_shop.db');
  console.log('   .schema orders');
  console.log('   SELECT telegram_username, telegram_user_id FROM orders LIMIT 5;');
  console.log('   .quit\n');
  
  console.log('6. Попробуйте вручную подтвердить заказ:');
  console.log(`   Откройте: https://t.me/papugasik_bot?start=order_${ORDER_NUMBER}`);
  console.log('   Нажмите "Подтвердить заказ"');
  console.log('   Проверьте логи PM2 на наличие ошибок\n');
  
  console.log('7. Если бот не отвечает:');
  console.log('   pm2 restart popugai-market');
  console.log('   pm2 logs popugai-market --lines 50\n');
  
  console.log('='.repeat(70));
  console.log('✅ ДИАГНОСТИКА ЗАВЕРШЕНА');
  console.log('='.repeat(70));
}

diagnose().catch(err => {
  console.error('\n❌ ОШИБКА:', err.message);
  process.exit(1);
});
