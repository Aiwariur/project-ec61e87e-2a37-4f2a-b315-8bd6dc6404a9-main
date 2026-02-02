const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://zolotoykakadushop.sbs';
const PRODUCTION_IP = 'https://144.31.212.184';

console.log('🧪 ТЕСТ PRODUCTION СЕРВЕРА\n');
console.log('='.repeat(60));

async function testEndpoint(url, path) {
  return new Promise((resolve) => {
    const fullUrl = `${url}${path}`;
    console.log(`\n📡 Проверяю: ${fullUrl}`);
    
    const client = url.startsWith('https') ? https : http;
    
    client.get(fullUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Статус: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`   ✅ Ответ получен`);
            resolve({ success: true, data: json });
          } catch (e) {
            console.log(`   ✅ HTML получен (${data.length} байт)`);
            resolve({ success: true, data: data });
          }
        } else {
          console.log(`   ❌ Ошибка: ${res.statusCode}`);
          resolve({ success: false, status: res.statusCode });
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Ошибка подключения: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

async function runTests() {
  console.log('\n1️⃣ ПРОВЕРКА HEALTH CHECK');
  console.log('-'.repeat(60));
  
  // Проверяем по домену
  let result = await testEndpoint(PRODUCTION_URL, '/api/health');
  if (!result.success) {
    // Пробуем по IP
    console.log('\n   Пробую по IP...');
    result = await testEndpoint(PRODUCTION_IP, '/api/health');
  }
  
  console.log('\n2️⃣ ПРОВЕРКА API ТОВАРОВ');
  console.log('-'.repeat(60));
  
  result = await testEndpoint(PRODUCTION_URL, '/api/products');
  if (!result.success) {
    result = await testEndpoint(PRODUCTION_IP, '/api/products');
  }
  
  if (result.success && result.data) {
    const products = Array.isArray(result.data) ? result.data : [];
    console.log(`   📦 Товаров в API: ${products.length}`);
    if (products.length > 0) {
      console.log(`   📋 Первый товар: ${products[0].name || 'без названия'}`);
    }
  }
  
  console.log('\n3️⃣ ПРОВЕРКА API ЗАКАЗОВ');
  console.log('-'.repeat(60));
  
  result = await testEndpoint(PRODUCTION_URL, '/api/orders');
  if (!result.success) {
    result = await testEndpoint(PRODUCTION_IP, '/api/orders');
  }
  
  if (result.success && result.data) {
    const orders = Array.isArray(result.data) ? result.data : [];
    console.log(`   📋 Заказов в системе: ${orders.length}`);
    if (orders.length > 0) {
      const lastOrder = orders[0];
      console.log(`   📦 Последний заказ: ${lastOrder.order_number}`);
      console.log(`   📊 Статус: ${lastOrder.status}`);
      console.log(`   👤 Клиент: ${lastOrder.customer_name}`);
      
      if (lastOrder.telegram_username) {
        console.log(`   💬 Telegram: @${lastOrder.telegram_username}`);
      } else {
        console.log(`   ⚠️  Telegram данные отсутствуют`);
      }
    }
  }
  
  console.log('\n4️⃣ ПРОВЕРКА ГЛАВНОЙ СТРАНИЦЫ');
  console.log('-'.repeat(60));
  
  result = await testEndpoint(PRODUCTION_URL, '/');
  if (!result.success) {
    result = await testEndpoint(PRODUCTION_IP, '/');
  }
  
  if (result.success && typeof result.data === 'string') {
    const hasReact = result.data.includes('root');
    const hasTitle = result.data.includes('ПопугайМаркет') || result.data.includes('Попугай');
    console.log(`   ${hasReact ? '✅' : '❌'} React root найден`);
    console.log(`   ${hasTitle ? '✅' : '❌'} Заголовок найден`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ ПРОВЕРКА ЗАВЕРШЕНА');
  console.log('='.repeat(60));
  
  console.log('\n📝 РЕКОМЕНДАЦИИ:');
  console.log('1. Если API не отвечает - проверьте что сервер запущен');
  console.log('2. Если товаров 0 - нужно импортировать products.json');
  console.log('3. Если заказы без Telegram - бот не работает на сервере');
  console.log('\n💡 Для проверки логов на сервере:');
  console.log('   ssh root@144.31.212.184');
  console.log('   pm2 logs popugai-market');
}

runTests().catch(console.error);
