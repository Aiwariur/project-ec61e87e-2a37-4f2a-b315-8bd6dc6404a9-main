import { sendOrderNotification } from './server/telegram.js';

// Тестовые данные заказа
const testOrder = {
  order_number: 'ORD-TEST-' + Date.now(),
  customer_name: 'Иван Тестовый',
  customer_phone: '+7 (999) 123-45-67',
  customer_email: 'test@example.com',
  delivery_method: 'Доставка курьером',
  address: 'г. Москва, ул. Тестовая, д. 1, кв. 1',
  comment: 'Это тестовый заказ для проверки Telegram-бота',
  items: [
    { name: 'Ара сине-желтый', quantity: 1, price: 150000 },
    { name: 'Корм премиум', quantity: 2, price: 2500 }
  ],
  total: 155000
};

console.log('🧪 Отправка тестового уведомления в Telegram...\n');
console.log('Данные заказа:', JSON.stringify(testOrder, null, 2));

sendOrderNotification(testOrder)
  .then(result => {
    if (result.success) {
      console.log('\n✅ Тест пройден! Уведомление успешно отправлено в Telegram');
    } else {
      console.log('\n❌ Тест не пройден:', result.error);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Ошибка теста:', error);
    process.exit(1);
  });
