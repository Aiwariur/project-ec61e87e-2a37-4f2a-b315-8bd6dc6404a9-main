const API_URL = 'http://144.31.212.184/api';

async function testFullOrderFlow() {
  console.log('🧪 ТЕСТ: Полный флоу создания и подтверждения заказа\n');
  
  // 1. Создаем заказ
  console.log('1️⃣ Создаем новый заказ...');
  const orderData = {
    customer_name: 'Тестовый Клиент',
    customer_phone: '+79991234567',
    customer_email: 'test@example.com',
    delivery_method: 'Доставка курьером',
    address: 'Москва, ул. Тестовая, д. 1',
    comment: 'Тестовый заказ для проверки Telegram',
    payment_method: 'sbp',
    items: [
      { id: 65, quantity: 1, price: 150000 }
    ],
    total: 150000
  };
  
  try {
    const createResponse = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    const createResult = await createResponse.json();
    
    if (!createResponse.ok) {
      console.error('❌ Ошибка создания заказа:', createResult);
      return;
    }
    
    console.log('✅ Заказ создан:', createResult.order_number);
    console.log('   ID:', createResult.id);
    
    const orderId = createResult.id;
    const orderNumber = createResult.order_number;
    
    // 2. Проверяем что заказ в БД
    console.log('\n2️⃣ Проверяем заказ через API...');
    const getResponse = await fetch(`${API_URL}/orders/${orderId}`);
    const order = await getResponse.json();
    
    console.log('✅ Заказ найден в БД:');
    console.log('   Номер:', order.order_number);
    console.log('   Статус:', order.status);
    console.log('   Telegram username:', order.telegram_username || 'нет');
    console.log('   Telegram user_id:', order.telegram_user_id || 'нет');
    
    // 3. Формируем ссылку для Telegram
    const telegramLink = `https://t.me/popugai_market_bot?start=order_${orderNumber}`;
    console.log('\n3️⃣ Ссылка для подтверждения в Telegram:');
    console.log('   ', telegramLink);
    
    console.log('\n📱 ИНСТРУКЦИЯ:');
    console.log('1. Перейдите по ссылке выше в Telegram');
    console.log('2. Нажмите "Подтвердить заказ"');
    console.log('3. Проверьте что заказ подтвердился');
    console.log('4. Запустите: node check-latest-orders.cjs');
    console.log('5. Проверьте что у заказа появились Telegram данные');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testFullOrderFlow();
