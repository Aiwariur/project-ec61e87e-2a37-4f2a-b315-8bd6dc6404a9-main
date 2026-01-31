import Database from 'better-sqlite3';

const db = new Database('./parrot_shop.db');

// Проверяем таблицы
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Таблицы в БД:', tables.map(t => t.name));

// Проверяем товары
const products = db.prepare('SELECT COUNT(*) as count FROM products').get();
console.log('Товаров в БД:', products.count);

if (products.count > 0) {
  const sample = db.prepare('SELECT id, name, price FROM products LIMIT 3').all();
  console.log('Примеры товаров:', sample);
}

// Проверяем заказы
const orders = db.prepare('SELECT COUNT(*) as count FROM orders').get();
console.log('Заказов в БД:', orders.count);

db.close();
