import express from 'express';
import db from '../db.js';

const router = express.Router();

// Получить все отзывы
router.get('/', (_req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT * FROM reviews 
      ORDER BY created_at DESC
    `).all();
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Добавить отзыв
router.post('/', (req, res) => {
  try {
    const { customer_name, city, rating, text, image, delivery_method } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO reviews (customer_name, city, rating, text, image, delivery_method, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      customer_name,
      city || null,
      rating || 5,
      text,
      image || null,
      delivery_method || 'Доставка',
      Date.now()
    );
    
    res.status(201).json({ 
      id: result.lastInsertRowid,
      message: 'Review created successfully' 
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Добавить несколько отзывов за раз (для массовой генерации)
router.post('/batch', (req, res) => {
  try {
    const { reviews } = req.body;
    
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: 'Reviews array is required' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO reviews (customer_name, city, rating, text, image, delivery_method, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((reviewsList) => {
      for (const review of reviewsList) {
        stmt.run(
          review.customer_name,
          review.city || null,
          review.rating || 5,
          review.text,
          review.image || null,
          review.delivery_method || 'Доставка',
          Date.now()
        );
      }
    });
    
    insertMany(reviews);
    
    res.status(201).json({ 
      message: `${reviews.length} reviews created successfully` 
    });
  } catch (error) {
    console.error('Error creating reviews:', error);
    res.status(500).json({ error: 'Failed to create reviews' });
  }
});

export default router;
