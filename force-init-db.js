// Скрипт для принудительной инициализации БД на сервере
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔥 ПРИНУДИТЕЛЬНАЯ ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ');
console.log('=' .repeat(60));

// Определяем путь к БД
const isProduction = process.env.NODE_ENV === 'production';
const dbDir = isProduction ? '/app/data' : __dirname;
const dbPath = path.join(dbDir, 'parrot_shop.db');

console.log(`📂 Рабочая директория: ${process.cwd()}`);
console.log(`🗄️  Путь к БД: ${dbPath}`);
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log('');

// Создаем директорию если нужно
if (!fs.existsSync(dbDir)) {
  console.log(`📁 Создаю директорию: ${dbDir}`);
  fs.mkdirSync(dbDir, { recursive: true });
}

// Открываем БД
console.log('🔌 Подключаюсь к базе данных...');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Создаем таблицы
console.log('📋 Создаю таблицы...');
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
`);

// Проверяем текущее количество товаров
const currentCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
console.log(`📊 Товаров в БД сейчас: ${currentCount.count}`);

// Ищем products.json
const possiblePaths = [
  path.join(__dirname, 'products.json'),
  path.join(process.cwd(), 'products.json'),
  '/app/products.json',
];

console.log('');
console.log('🔍 Ищу products.json...');
let productsJsonPath = null;

for (const testPath of possiblePaths) {
  console.log(`   Проверяю: ${testPath}`);
  if (fs.existsSync(testPath)) {
    productsJsonPath = testPath;
    console.log(`   ✅ НАЙДЕН!`);
    break;
  } else {
    console.log(`   ❌ Не найден`);
  }
}

if (!productsJsonPath) {
  console.error('');
  console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: products.json не найден!');
  console.error('📂 Содержимое текущей директории:');
  const files = fs.readdirSync(process.cwd());
  files.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

// Читаем и импортируем товары
console.log('');
console.log(`📖 Читаю файл: ${productsJsonPath}`);
const fileContent = fs.readFileSync(productsJsonPath, 'utf-8');
const productsData = JSON.parse(fileContent);
console.log(`📦 Найдено товаров в JSON: ${productsData.length}`);

// УДАЛЯЕМ все старые товары
console.log('');
console.log('🗑️  Очищаю таблицу products...');
db.prepare('DELETE FROM products').run();

// Импортируем товары
console.log('💾 Импортирую товары...');
const insertProduct = db.prepare(`
  INSERT INTO products (id, slug, name, price, old_price, in_stock, image, images, description, specs, popular, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((products) => {
  for (const product of products) {
    insertProduct.run(
      product.id,
      product.slug,
      product.name,
      product.price,
      product.old_price || null,
      product.in_stock ? 1 : 0,
      product.image,
      JSON.stringify(product.images || []),
      product.description || '',
      JSON.stringify(product.specs || {}),
      product.popular ? 1 : 0,
      Date.now()
    );
  }
});

insertMany(productsData);

// Проверяем результат
const finalCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
console.log('');
console.log('=' .repeat(60));
console.log(`✅ УСПЕШНО! Импортировано товаров: ${finalCount.count}`);
console.log('=' .repeat(60));

// Показываем первые 3 товара для проверки
console.log('');
console.log('📋 Первые 3 товара в БД:');
const samples = db.prepare('SELECT id, name, price FROM products LIMIT 3').all();
samples.forEach(p => {
  console.log(`   ${p.id}. ${p.name} - ${p.price / 100} руб.`);
});

db.close();
console.log('');
console.log('🎉 Готово! База данных заполнена.');
