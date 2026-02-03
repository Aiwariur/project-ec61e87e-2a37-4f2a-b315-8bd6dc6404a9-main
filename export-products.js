import db from './server/db.js';
import fs from 'fs';

console.log('📦 Экспорт товаров из базы данных...');

try {
  const products = db.prepare('SELECT * FROM products ORDER BY id').all();
  
  if (products.length === 0) {
    console.log('⚠️  База данных пустая. Сначала импортируйте товары командой: npm run setup');
    process.exit(1);
  }
  
  // Преобразуем данные для JSON
  const productsJson = products.map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    old_price: p.old_price,
    in_stock: p.in_stock === 1,
    image: p.image,
    images: p.images ? JSON.parse(p.images) : [],
    description: p.description,
    specs: p.specs ? JSON.parse(p.specs) : {},
    category: p.category,
    popular: p.popular === 1,
    created_at: p.created_at
  }));
  
  fs.writeFileSync('products.json', JSON.stringify(productsJson, null, 2));
  
  console.log(`✅ Экспортировано ${productsJson.length} товаров в products.json`);
  console.log('📝 Файл готов для деплоя в production');
} catch (error) {
  console.error('❌ Ошибка экспорта:', error.message);
  process.exit(1);
}
