import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import contactRouter from './routes/contact.js';
import reviewsRouter from './routes/reviews.js';
import './telegram.js'; // Инициализация Telegram бота

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы (изображения товаров)
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/reviews', reviewsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// В production отдаем собранный фронтенд
if (isProduction) {
  // Статические файлы фронтенда
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Все остальные запросы (не API) отправляем на index.html для React Router
  app.use((_req, res) => {
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
