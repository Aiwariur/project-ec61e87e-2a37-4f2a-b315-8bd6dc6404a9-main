import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import contactRouter from './routes/contact.js';
import reviewsRouter from './routes/reviews.js';
import visitorsRouter from './routes/visitors.js';
import { initTelegram } from './telegram.js'; // Инициализация Telegram бота
import { trackVisitor } from './middleware/visitor-tracker.js'; // Отслеживание посетителей

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// Gzip compression для всех ответов
app.use(compression({
  level: 6, // Уровень сжатия (0-9, где 9 - максимальное сжатие)
  threshold: 1024, // Сжимать только файлы больше 1KB
  filter: (req, res) => {
    // Не сжимать если клиент не поддерживает
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Использовать стандартный фильтр compression
    return compression.filter(req, res);
  }
}));

// Отслеживание посетителей (должно быть до статических файлов и роутов)
app.use(trackVisitor);

// Статические файлы (изображения товаров) с кешированием
app.use('/images', express.static(path.join(__dirname, '../public/images'), {
  maxAge: '30d', // Кеш на 30 дней
  immutable: true,
  setHeaders: (res, filePath) => {
    // Дополнительные заголовки для оптимизации
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png') || filePath.endsWith('.webp')) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    }
  }
}));

// Инициализация Telegram нужна до роутов, чтобы webhook мог принять запросы сразу.
initTelegram(app);

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/visitors', visitorsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// В production отдаем собранный фронтенд
if (isProduction) {
  // Статические файлы фронтенда с агрессивным кешированием
  app.use(express.static(path.join(__dirname, '../dist'), {
    maxAge: '1y', // Кеш на 1 год для статики с хешами
    immutable: true,
    setHeaders: (res, filePath) => {
      // HTML без кеша (для обновлений)
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
      // JS/CSS с долгим кешем (у них есть хеши в именах)
      else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));
  
  // Все остальные запросы (не API) отправляем на index.html для React Router
  app.use((_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (isProduction) {
    console.log(`🌐 Serving frontend from /dist`);
  }
});
