const http = require('http');

// Тест API категорий
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/products/categories',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Статус:', res.statusCode);
    console.log('Категории из API:', JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error('Ошибка:', error.message);
  console.log('\n⚠ Убедись, что сервер запущен: npm run server');
});

req.end();
