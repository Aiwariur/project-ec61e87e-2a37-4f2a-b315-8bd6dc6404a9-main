import express from 'express';
import db from '../db.js';

const router = express.Router();

// Получить всех посетителей с сортировкой по последнему визиту
router.get('/', (req, res) => {
  try {
    const visitors = db.prepare(`
      SELECT 
        id,
        ip_address,
        country,
        city,
        region,
        visit_count,
        first_visit,
        last_visit,
        referrer,
        page_url,
        user_agent
      FROM visitors
      ORDER BY last_visit DESC
    `).all();

    res.json(visitors);
  } catch (error) {
    console.error('Ошибка получения посетителей:', error);
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

// Получить статистику посещений
router.get('/stats', (req, res) => {
  try {
    const stats = {
      total: db.prepare('SELECT COUNT(*) as count FROM visitors').get().count,
      new_today: db.prepare(`
        SELECT COUNT(*) as count 
        FROM visitors 
        WHERE first_visit >= ?
      `).get(Date.now() - 24 * 60 * 60 * 1000).count,
      returning: db.prepare('SELECT COUNT(*) as count FROM visitors WHERE visit_count > 1').get().count,
      by_country: db.prepare(`
        SELECT country, COUNT(*) as count 
        FROM visitors 
        GROUP BY country 
        ORDER BY count DESC 
        LIMIT 10
      `).all(),
      by_city: db.prepare(`
        SELECT city, country, COUNT(*) as count 
        FROM visitors 
        GROUP BY city, country 
        ORDER BY count DESC 
        LIMIT 10
      `).all(),
      recent: db.prepare(`
        SELECT ip_address, city, country, visit_count, last_visit
        FROM visitors
        ORDER BY last_visit DESC
        LIMIT 10
      `).all()
    };

    res.json(stats);
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Получить детальную информацию о конкретном посетителе
router.get('/:id', (req, res) => {
  try {
    const visitor = db.prepare(`
      SELECT * FROM visitors WHERE id = ?
    `).get(req.params.id);

    if (!visitor) {
      return res.status(404).json({ error: 'Посетитель не найден' });
    }

    res.json(visitor);
  } catch (error) {
    console.error('Ошибка получения посетителя:', error);
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

export default router;
