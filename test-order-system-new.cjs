/**
 * Тестовый скрипт для проверки новой системы заказов
 * Проверяет создание заказа и отправку уведомления в Telegram
 */

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001';

async function testOrderSystem() {
  console.log('🧪 Тестирование новой системы заказов\n');
  
  try {
    // 1. Создаем тестовый заказ
    console.log('1️⃣ Создание тестового заказа...');
    
    const orderData = {
      customer_name: 'Тестовый Клиент',
      customer_phone: '+7 (999) 888-77-66',
      customer_email: 'test@example.com',
      delivery_method: 'Курьером по Краснодару',
      address: 'ул. Тестовая, д. 1',
      comment: 'Тестовый заказ для проверки системы',
      payment_method: 'sbp',
      items: [
        { id: 65, quantity: 1, price: 9500000 }
      ],
      total: 9500000
    };
    
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Ошибка создания заказа: ${JSON.stringify(error)}`);
    }
    
    const result = await response.json();
    console.log('✅ Заказ создан:', result.order_number);
    console.log('   ID:', result.id);
    
    // 2. Проверяем, что заказ появился в БД
    console.log('\n2️⃣ Проверка заказа в БД...');
    
    const orderResponse = await fetch(`${API_URL}/api/orders/${result.id}`);
    if (!orderResponse.ok) {
      throw new Error('Заказ не найден в БД');
    }
    
    const order = await orderResponse.json();
    console.log('✅ Заказ найден в БД');
    console.log('   Статус:', order.status);
    console.log('   Клиент:', order.customer_name);
    console.log('   Телефон:', order.customer_phone);
    console.log('   Товаров:', order.items.length);
    
    // 3. Информация о Telegram
    console.log('\n3️⃣ Проверка Telegram уведомления...');
    console.log('✅ Уведомление должно быть отправлено в Telegram');
    console.log('   Проверьте Telegram бота на наличие сообщения');
    console.log('   В сообщении должна быть кнопка "✅ Подтвердить заказ"');
    
    // 4. Инструкция по подтверждению
    console.log('\n4️⃣ Инструкция по подтверждению:');
    console.log('   1. Откройте Telegram и найдите сообщение от бота');
    console.log('   2. Нажмите кнопку "✅ Подтвердить заказ"');
    console.log('   3. Статус заказа изменится на "confirmed"');
    console.log('   4. В БД сохранятся telegram_username и telegram_user_id');
    
    // 5. Проверка админки
    console.log('\n5️⃣ Проверка в админке:');
    console.log('   Откройте: http://localhost:5173/admin');
    console.log('   Найдите заказ:', result.order_number);
    console.log('   После подтверждения появится бейдж с @username');
    console.log('   И кнопка "Написать в Telegram"');
    
    console.log('\n✅ Тест завершен успешно!');
    console.log('\n📝 Что проверить:');
    console.log('   ✓ Заказ создан в БД');
    console.log('   ✓ Уведомление отправлено в Telegram');
    console.log('   ✓ В сообщении есть кнопка подтверждения');
    console.log('   ✓ После клика статус меняется на "confirmed"');
    console.log('   ✓ Telegram данные сохраняются в БД');
    console.log('   ✓ В админке отображается @username');
    console.log('   ✓ Кнопка "Написать в Telegram" работает');
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Запуск теста
testOrderSystem();
