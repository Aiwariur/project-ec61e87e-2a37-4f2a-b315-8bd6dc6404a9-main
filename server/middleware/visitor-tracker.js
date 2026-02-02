import db from '../db.js';
import { sendVisitorNotification } from '../telegram.js';

// Получение IP адреса с учетом прокси
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         'unknown';
}

// Получение геолокации по IP (используем бесплатный API)
async function getGeoLocation(ip) {
  // Пропускаем локальные IP
  if (ip === 'unknown' || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.')) {
    return {
      country: 'Локальная сеть',
      city: 'Localhost',
      region: 'Local'
    };
  }

  try {
    // Используем бесплатный API ip-api.com (лимит 45 запросов в минуту)
    const response = await fetch(`http://ip-api.com/json/${ip}?lang=ru&fields=status,country,city,regionName`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country || 'Неизвестно',
        city: data.city || 'Неизвестно',
        region: data.regionName || 'Неизвестно'
      };
    }
  } catch (error) {
    console.error('Ошибка получения геолокации:', error.message);
  }

  return {
    country: 'Неизвестно',
    city: 'Неизвестно',
    region: 'Неизвестно'
  };
}

// Middleware для отслеживания посещений
export async function trackVisitor(req, res, next) {
  // Отслеживаем только GET запросы к главной странице и страницам товаров
  // Пропускаем API запросы, статику и служебные запросы
  if (req.method !== 'GET' || 
      req.path.startsWith('/api/') || 
      req.path.startsWith('/images/') ||
      req.path.includes('.') && !req.path.endsWith('.html')) {
    return next();
  }

  try {
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'Прямой заход';
    const pageUrl = req.originalUrl || req.url;
    const now = Date.now();

    // Проверяем, был ли этот посетитель раньше
    const existingVisitor = db.prepare(
      'SELECT * FROM visitors WHERE ip_address = ?'
    ).get(ip);

    if (existingVisitor) {
      // Обновляем существующего посетителя
      const newVisitCount = existingVisitor.visit_count + 1;
      
      db.prepare(`
        UPDATE visitors 
        SET visit_count = ?, 
            last_visit = ?,
            user_agent = ?,
            referrer = ?,
            page_url = ?
        WHERE ip_address = ?
      `).run(newVisitCount, now, userAgent, referrer, pageUrl, ip);

      // Отправляем уведомление о повторном визите
      sendVisitorNotification({
        ip,
        country: existingVisitor.country,
        city: existingVisitor.city,
        region: existingVisitor.region,
        visitCount: newVisitCount,
        isNewVisitor: false,
        referrer,
        pageUrl,
        userAgent
      });

    } else {
      // Получаем геолокацию для нового посетителя
      const geoData = await getGeoLocation(ip);

      // Добавляем нового посетителя
      db.prepare(`
        INSERT INTO visitors (ip_address, user_agent, country, city, region, visit_count, first_visit, last_visit, referrer, page_url)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
      `).run(ip, userAgent, geoData.country, geoData.city, geoData.region, now, now, referrer, pageUrl);

      // Отправляем уведомление о новом посетителе
      sendVisitorNotification({
        ip,
        country: geoData.country,
        city: geoData.city,
        region: geoData.region,
        visitCount: 1,
        isNewVisitor: true,
        referrer,
        pageUrl,
        userAgent
      });
    }

  } catch (error) {
    console.error('Ошибка отслеживания посетителя:', error);
    // Не прерываем запрос из-за ошибки трекинга
  }

  next();
}
