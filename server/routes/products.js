import express from 'express';
import db from '../db.js';

const router = express.Router();

// Получить список категорий
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT DISTINCT category 
      FROM products 
      WHERE category IS NOT NULL 
      ORDER BY category
    `).all();
    
    res.json(categories.map(c => c.category));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все товары
router.get('/', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    
    // Парсим JSON поля и преобразуем snake_case в camelCase
    const parsedProducts = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [p.image],
      specs: p.specs ? JSON.parse(p.specs) : [],
      oldPrice: p.old_price,
      inStock: p.in_stock,
    }));
    
    res.json(parsedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить товар по ID
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const parsed = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [product.image],
      specs: product.specs ? JSON.parse(product.specs) : [],
      oldPrice: product.old_price,
      inStock: product.in_stock,
    };
    
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
