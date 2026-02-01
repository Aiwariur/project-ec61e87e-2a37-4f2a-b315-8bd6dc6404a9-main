const http = require('http');

console.log('🌐 Проверка живого API на http://localhost:3001/api/products\n');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/products',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      
      console.log(`Получено товаров: ${products.length}\n`);
      
      // Проверяем первые 3 товара
      products.slice(0, 3).forEach(p => {
        console.log(`ID ${p.id}: ${p.name.substring(0, 40)}...`);
        console.log(`  price: ${p.price} (${p.price / 100} ₽)`);
        console.log(`  oldPrice: ${p.oldPrice || 'НЕТ'} ${p.oldPrice ? `(${p.oldPrice / 100} ₽)` : ''}`);
        console.log(`  old_price: ${p.old_price || 'НЕТ'} ${p.old_price ? `(${p.old_price / 100} ₽)` : ''}`);
        console.log(`  Скидка отображается? ${p.oldPrice ? '✅ ДА' : '❌ НЕТ'}`);
        console.log('');
      });
    } catch (e) {
      console.error('Ошибка парсинга:', e.message);
      console.log('Ответ:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Ошибка запроса: ${e.message}`);
  console.log('\n⚠️  Убедись что сервер запущен: npm run server');
});

req.end();
