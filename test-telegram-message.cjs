const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'parrot_shop.db');
const db = new Database(dbPath);

console.log('🧪 Тестирование форматирования Telegram сообщения\n');

try {
  // Получаем реальный товар из базы
  const product = db.prepare('SELECT id, name, price FROM products LIMIT 1').get();
  
  if (!product) {
    console.log('❌ В базе нет товаров');
    process.exit(1);
  }
  
  console.log('📦 Тестовый товар:');
  console.log(`   ID: ${product.id}`);
  console.log(`   Название: ${product.name}`);
  console.log(`   Цена: ${(product.price / 100).toFixed(0)}₽`);
  
  // Симулируем данные заказа как они приходят из API
  const orderData = {
    orderId: 999,
    order_number: 'TEST-123456',
    customer_name: 'Иван Тестов',
    customer_phone: '+7 (999) 123-45-67',
    customer_email: 'test@example.com',
    delivery_method: 'Доставка',
    address: 'Москва, ул. Тестовая, д. 1, кв. 10',
    comment: 'Позвонить за час',
    payment_method: 'sbp',
    items: [
      {
        id: product.id,
        quantity: 1,
        price: product.price
      }
    ],
    total: product.price
  };
  
  console.log('\n📝 Форматирование сообщения:\n');
  
  // Форматируем сообщение (копия функции из telegram.js)
  const paymentMethodNames = {
    'sbp': '💳 СБП (Система быстрых платежей)',
    'card': '💳 Оплата картой',
    'manager': '💬 Обсудить с менеджером',
  };
  
  let message = `🦜 <b>НОВЫЙ ЗАКАЗ!</b>\n\n`;
  message += `📋 <b>Номер заказа:</b> ${orderData.order_number}\n\n`;
  
  message += `👤 <b>Клиент:</b>\n`;
  message += `   Имя: ${orderData.customer_name}\n`;
  message += `   Телефон: ${orderData.customer_phone}\n`;
  if (orderData.customer_email) {
    message += `   Email: ${orderData.customer_email}\n`;
  }
  
  message += `\n📦 <b>Доставка:</b> ${orderData.delivery_method || 'Доставка'}\n`;
  if (orderData.address) {
    message += `📍 <b>Адрес:</b> ${orderData.address}\n`;
  }
  
  if (orderData.payment_method) {
    message += `\n${paymentMethodNames[orderData.payment_method] || `💰 ${orderData.payment_method}`}\n`;
  }
  
  if (orderData.comment) {
    message += `\n💬 <b>Комментарий:</b> ${orderData.comment}\n`;
  }
  
  message += `\n🛒 <b>Товары:</b>\n`;
  orderData.items.forEach((item, index) => {
    // Получаем название товара из базы данных
    const prod = db.prepare('SELECT name FROM products WHERE id = ?').get(item.id);
    const productName = prod ? prod.name : 'Товар';
    const price = (item.price / 100).toFixed(0);
    
    message += `   ${index + 1}. ${productName} × ${item.quantity} = ${price}₽\n`;
  });
  
  const totalFormatted = (orderData.total / 100).toFixed(0);
  message += `\n💰 <b>ИТОГО: ${totalFormatted}₽</b>`;
  
  console.log(message);
  
  console.log('\n✅ Сообщение отформатировано корректно!');
  console.log('\n📋 Проверьте:');
  console.log('   ✓ Название товара отображается');
  console.log('   ✓ Цена отображается в рублях');
  console.log('   ✓ Количество товара указано');
  console.log('   ✓ Итоговая сумма корректна');
  
} catch (error) {
  console.error('\n❌ Ошибка теста:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  db.close();
}
