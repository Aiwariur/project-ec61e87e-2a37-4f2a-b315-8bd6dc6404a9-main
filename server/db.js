import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// В production используем /app/data для персистентного хранения
const isProduction = process.env.NODE_ENV === 'production';
const dbDir = isProduction ? '/app/data' : path.join(__dirname, '..');
const dbPath = path.join(dbDir, 'parrot_shop.db');

// Создаем директорию для БД если её нет
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    slug TEXT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    old_price INTEGER,
    in_stock INTEGER DEFAULT 1,
    image TEXT,
    images TEXT,
    description TEXT,
    specs TEXT,
    popular INTEGER DEFAULT 0,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    delivery_method TEXT DEFAULT 'Доставка',
    comment TEXT,
    payment_method TEXT DEFAULT 'Не указан',
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'new',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    city TEXT,
    rating INTEGER,
    text TEXT,
    image TEXT,
    delivery_method TEXT,
    created_at INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`);

export default db;
