const http = require('http');

const API_URL = 'http://localhost:3001';

console.log('🧪 Тестирование системы отслеживания посетителей\n');

// Функция для имитации визита
async function simulateVisit(ip, userAgent, referrer = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'X-Forwarded-For': ip
      }
    };

    if (referrer) {
      options.headers['Referer'] = referrer;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });

    req.on('error', reject);
    req.end();
  });
}

// Функция для получения статистики
async function getStats() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/visitors/stats',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Функция для получения списка посетителей
async function getVisitors() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/visitors',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('1️⃣ Имитация первого визита (Москва)...');
    await simulateVisit(
      '95.31.18.119', // IP из Москвы
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      'https://google.com'
    );
    console.log('✅ Первый визит отправлен\n');
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('2️⃣ Имитация повторного визита (та же Москва)...');
    await simulateVisit(
      '95.31.18.119',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
    );
    console.log('✅ Повторный визит отправлен\n');
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('3️⃣ Имитация визита из Санкт-Петербурга...');
    await simulateVisit(
      '178.176.77.88', // IP из СПб
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
      'https://yandex.ru'
    );
    console.log('✅ Визит из СПб отправлен\n');
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('4️⃣ Получение статистики...');
    const stats = await getStats();
    console.log('📊 Статистика посещений:');
    console.log(`   Всего уникальных посетителей: ${stats.total}`);
    console.log(`   Новых за сегодня: ${stats.new_today}`);
    console.log(`   Повторных визитов: ${stats.returning}`);
    console.log('\n📍 По странам:');
    stats.by_country.forEach(c => {
      console.log(`   ${c.country}: ${c.count}`);
    });
    console.log('\n🏙️ По городам:');
    stats.by_city.forEach(c => {
      console.log(`   ${c.city}, ${c.country}: ${c.count}`);
    });
    console.log('\n⏰ Последние визиты:');
    stats.recent.forEach(v => {
      const date = new Date(v.last_visit);
      console.log(`   ${v.city}, ${v.country} (${v.ip_address}) - визитов: ${v.visit_count} - ${date.toLocaleString('ru-RU')}`);
    });

    console.log('\n5️⃣ Получение полного списка посетителей...');
    const visitors = await getVisitors();
    console.log(`\n👥 Всего записей: ${visitors.length}`);
    visitors.slice(0, 5).forEach((v, i) => {
      const lastVisit = new Date(v.last_visit);
      console.log(`\n${i + 1}. IP: ${v.ip_address}`);
      console.log(`   Локация: ${v.city}, ${v.region}, ${v.country}`);
      console.log(`   Визитов: ${v.visit_count}`);
      console.log(`   Последний визит: ${lastVisit.toLocaleString('ru-RU')}`);
      console.log(`   Откуда: ${v.referrer || 'Прямой заход'}`);
    });

    console.log('\n✅ Все тесты пройдены успешно!');
    console.log('\n💡 Проверьте Telegram - должны прийти уведомления о посетителях');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️ Сервер не запущен! Запустите: npm run server');
    }
  }
}

runTests();
