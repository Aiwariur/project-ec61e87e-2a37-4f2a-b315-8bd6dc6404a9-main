const http = require('http');

function testAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/products',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const products = JSON.parse(data);
          console.log('=== ПРОВЕРКА API /api/products ===\n');
          console.log(`Получено товаров: ${products.length}\n`);
          
          console.log('Первые 5 товаров:');
          products.slice(0, 5).forEach(p => {
            console.log(`ID ${p.id}: ${p.price.toLocaleString('ru-RU')} руб. - ${p.name.substring(0, 50)}`);
          });
          
          const prices = products.map(p => p.price);
          const maxPrice = Math.max(...prices);
          const minPrice = Math.min(...prices);
          const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
          
          console.log('\n📊 Статистика цен через API:');
          console.log(`Максимальная цена: ${maxPrice.toLocaleString('ru-RU')} руб.`);
          console.log(`Минимальная цена: ${minPrice.toLocaleString('ru-RU')} руб.`);
          console.log(`Средняя цена: ${avgPrice.toLocaleString('ru-RU')} руб.`);
          
          const tooExpensive = products.filter(p => p.price >= 1000000);
          if (tooExpensive.length > 0) {
            console.log('\n❌ ОШИБКА! Найдены товары с ценой >= 1 000 000:');
            tooExpensive.forEach(p => {
              console.log(`ID ${p.id}: ${p.price.toLocaleString('ru-RU')} руб. - ${p.name}`);
            });
            resolve(false);
          } else {
            console.log('\n✅ ВСЕ ЦЕНЫ КОРРЕКТНЫ! API отдает правильные цены.');
            resolve(true);
          }
        } catch (error) {
          console.error('❌ Ошибка парсинга JSON:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Ошибка запроса:', error.message);
      reject(error);
    });

    req.end();
  });
}

testAPI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Критическая ошибка:', error.message);
    process.exit(1);
  });
