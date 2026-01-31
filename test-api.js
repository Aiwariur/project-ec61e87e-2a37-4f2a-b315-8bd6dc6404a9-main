// Тест API
async function testAPI() {
  try {
    // Тест загрузки товаров
    console.log('Тестирую GET /api/products...');
    const productsRes = await fetch('http://localhost:3001/api/products');
    const products = await productsRes.json();
    console.log(`✓ Загружено товаров: ${products.length}`);
    
    if (products.length > 0) {
      console.log(`  Первый товар: ${products[0].name} - ${products[0].price} ₽`);
    }
    
    // Тест создания заказа
    console.log('\nТестирую POST /api/orders...');
    const orderRes = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Тестовый клиент',
        customer_phone: '+7 (999) 123-45-67',
        customer_email: 'test@example.com',
        delivery_method: 'Доставка',
        address: 'Москва, ул. Примерная, д. 1',
        comment: 'Тестовый заказ',
        items: [{ id: 65, quantity: 1, price: 9500000 }],
        total: 9500000,
      }),
    });
    
    if (orderRes.ok) {
      const order = await orderRes.json();
      console.log(`✓ Заказ создан: ${order.order_number}`);
    } else {
      const error = await orderRes.json();
      console.log(`✗ Ошибка: ${error.error}`);
    }
    
    // Тест получения заказов
    console.log('\nТестирую GET /api/orders...');
    const ordersRes = await fetch('http://localhost:3001/api/orders');
    const orders = await ordersRes.json();
    console.log(`✓ Всего заказов: ${orders.length}`);
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

testAPI();
