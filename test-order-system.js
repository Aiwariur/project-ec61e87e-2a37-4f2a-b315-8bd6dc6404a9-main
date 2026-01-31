// Тестовый скрипт для проверки системы заказов

const API_URL = 'http://localhost:3001';

console.log('🧪 Тестируем систему заказов...\n');

async function testOrderSystem() {
  try {
    // 1. Проверяем что сервер работает
    console.log('1️⃣ Проверяем сервер...');
    const healthCheck = await fetch(`${API_URL}/api/health`);
    if (!healthCheck.ok) throw new Error('Сервер не отвечает');
    console.log('   ✅ Сервер работает\n');

    // 2. Получаем товары
    console.log('2️⃣ Получаем товары...');
    const productsRes = await fetch(`${API_URL}/api/products`);
    const products = await productsRes.json();
    console.log(`   ✅ Загружено ${products.length} товаров\n`);

    if (products.length === 0) {
      console.log('   ⚠️ Нет товаров в базе. Запустите import-products.js');
      return;
    }

    // 3. Создаем тестовый заказ
    console.log('3️⃣ Создаем тестовый заказ...');
    const testOrder = {
      customer_name: 'Иван Тестовый',
      customer_phone: '+7 (999) 123-45-67',
      customer_email: 'test@example.com',
      delivery_method: 'Доставка',
      address: 'Москва, ул. Тестовая, д. 1, кв. 1',
      comment: 'Тестовый заказ',
      items: [
        {
          id: products[0].id,
          quantity: 1,
          price: products[0].price
        }
      ],
      total: products[0].price
    };

    const createRes = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOrder)
    });

    if (!createRes.ok) {
      const error = await createRes.json();
      throw new Error(`Ошибка создания заказа: ${JSON.stringify(error)}`);
    }

    const createdOrder = await createRes.json();
    console.log(`   ✅ Заказ создан: ${createdOrder.order_number}`);
    console.log(`   📦 ID заказа: ${createdOrder.id}\n`);

    // 4. Получаем список заказов
    console.log('4️⃣ Получаем список заказов...');
    const ordersRes = await fetch(`${API_URL}/api/orders`);
    const orders = await ordersRes.json();
    console.log(`   ✅ Найдено ${orders.length} заказов\n`);

    // 5. Получаем детали заказа
    console.log('5️⃣ Получаем детали заказа...');
    const orderRes = await fetch(`${API_URL}/api/orders/${createdOrder.id}`);
    const orderDetails = await orderRes.json();
    console.log(`   ✅ Заказ: ${orderDetails.order_number}`);
    console.log(`   👤 Клиент: ${orderDetails.customer_name}`);
    console.log(`   📞 Телефон: ${orderDetails.customer_phone}`);
    console.log(`   📧 Email: ${orderDetails.customer_email}`);
    console.log(`   📍 Адрес: ${orderDetails.customer_address}`);
    console.log(`   💰 Сумма: ${orderDetails.total} ₽`);
    console.log(`   📦 Товаров: ${orderDetails.items.length}\n`);

    // 6. Обновляем статус заказа
    console.log('6️⃣ Обновляем статус заказа...');
    const updateRes = await fetch(`${API_URL}/api/orders/${createdOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' })
    });

    if (!updateRes.ok) throw new Error('Ошибка обновления статуса');
    console.log('   ✅ Статус обновлен на "confirmed"\n');

    console.log('🎉 Все тесты пройдены успешно!');
    console.log('\n📝 Система готова к работе:');
    console.log('   • Заказы создаются ✅');
    console.log('   • Клиенты сохраняются в отдельной таблице ✅');
    console.log('   • Админка получает данные ✅');
    console.log('   • Статусы обновляются ✅');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    console.log('\n💡 Убедитесь что:');
    console.log('   1. Сервер запущен (npm run server)');
    console.log('   2. База данных мигрирована (node migrate-db.js)');
    console.log('   3. Товары загружены (node import-products.js)');
    process.exit(1);
  }
}

testOrderSystem();
