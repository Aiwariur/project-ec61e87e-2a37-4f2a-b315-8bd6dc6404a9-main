#!/usr/bin/env node

/**
 * Скрипт проверки готовности к деплою
 * Проверяет все критичные файлы и данные перед деплоем
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let errors = 0;
let warnings = 0;

function check(name, condition, errorMsg, isWarning = false) {
  if (condition) {
    console.log(`✅ ${name}`);
    return true;
  } else {
    if (isWarning) {
      console.log(`⚠️  ${name}: ${errorMsg}`);
      warnings++;
    } else {
      console.log(`❌ ${name}: ${errorMsg}`);
      errors++;
    }
    return false;
  }
}

console.log('🔍 ПРОВЕРКА ГОТОВНОСТИ К ДЕПЛОЮ\n');

// 1. Проверка products.json
console.log('📦 Проверка данных товаров:');
const productsJsonPath = path.join(__dirname, 'products.json');
const productsJsonExists = fs.existsSync(productsJsonPath);
check('products.json существует', productsJsonExists, 'Файл не найден');

if (productsJsonExists) {
  try {
    const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));
    check('products.json валидный JSON', true, '');
    check('products.json содержит товары', productsData.length > 0, 'Массив пустой');
    console.log(`   📊 Товаров в файле: ${productsData.length}`);
    
    // Проверка структуры первого товара
    if (productsData.length > 0) {
      const firstProduct = productsData[0];
      check('Товары имеют ID', firstProduct.id !== undefined, 'Отсутствует поле id');
      check('Товары имеют название', firstProduct.name !== undefined, 'Отсутствует поле name');
      check('Товары имеют цену', firstProduct.price !== undefined, 'Отсутствует поле price');
      check('Товары имеют изображение', firstProduct.image !== undefined, 'Отсутствует поле image');
    }
  } catch (e) {
    check('products.json парсится', false, e.message);
  }
}

console.log('');

// 2. Проверка изображений
console.log('🖼️  Проверка изображений:');
const imagesDir = path.join(__dirname, 'public/images/products');
const imagesDirExists = fs.existsSync(imagesDir);
check('Директория public/images/products существует', imagesDirExists, 'Директория не найдена');

if (imagesDirExists) {
  const images = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg'));
  check('Есть изображения товаров', images.length > 0, 'Нет JPG файлов');
  console.log(`   📸 Изображений найдено: ${images.length}`);
  check('Достаточно изображений', images.length >= 60, 'Меньше 60 изображений', true);
}

console.log('');

// 3. Проверка критичных файлов
console.log('📄 Проверка критичных файлов:');
check('Dockerfile существует', fs.existsSync(path.join(__dirname, 'Dockerfile')), 'Файл не найден');
check('docker-entrypoint.sh существует', fs.existsSync(path.join(__dirname, 'docker-entrypoint.sh')), 'Файл не найден');
check('server/init-db.js существует', fs.existsSync(path.join(__dirname, 'server/init-db.js')), 'Файл не найден');
check('server/db.js существует', fs.existsSync(path.join(__dirname, 'server/db.js')), 'Файл не найден');
check('server/index.js существует', fs.existsSync(path.join(__dirname, 'server/index.js')), 'Файл не найден');

console.log('');

// 4. Проверка .dockerignore
console.log('🐳 Проверка .dockerignore:');
const dockerignorePath = path.join(__dirname, '.dockerignore');
if (fs.existsSync(dockerignorePath)) {
  const dockerignore = fs.readFileSync(dockerignorePath, 'utf-8');
  const lines = dockerignore.split('\n').map(l => l.trim());
  
  check('.dockerignore существует', true, '');
  check('products.json НЕ исключён', !lines.includes('products.json'), 'products.json в .dockerignore!');
  check('*.json НЕ исключён', !lines.includes('*.json'), '*.json в .dockerignore!');
  
  // Проверяем что нужные файлы исключены
  check('node_modules исключён', lines.includes('node_modules'), 'Нужно исключить node_modules', true);
  check('*.db исключён', lines.includes('*.db'), 'Нужно исключить *.db', true);
} else {
  check('.dockerignore существует', false, 'Файл не найден', true);
}

console.log('');

// 5. Проверка dist (если есть)
console.log('🏗️  Проверка сборки:');
const distExists = fs.existsSync(path.join(__dirname, 'dist'));
if (distExists) {
  check('dist/ существует', true, '');
  check('dist/index.html существует', fs.existsSync(path.join(__dirname, 'dist/index.html')), 'index.html не найден');
} else {
  check('dist/ существует', false, 'Запустите npm run build', true);
}

console.log('');

// 6. Проверка package.json
console.log('📦 Проверка package.json:');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    check('package.json валидный', true, '');
    check('Есть скрипт build', packageJson.scripts?.build !== undefined, 'Отсутствует scripts.build');
    check('Есть зависимость better-sqlite3', packageJson.dependencies?.['better-sqlite3'] !== undefined, 'Отсутствует better-sqlite3');
    check('Есть зависимость express', packageJson.dependencies?.express !== undefined, 'Отсутствует express');
  } catch (e) {
    check('package.json парсится', false, e.message);
  }
}

console.log('');

// Итоги
console.log('═'.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!');
  console.log('✅ Проект готов к деплою');
  console.log('');
  console.log('Следующие шаги:');
  console.log('1. git add .');
  console.log('2. git commit -m "fix: гарантированная загрузка товаров"');
  console.log('3. git push origin main');
  process.exit(0);
} else {
  console.log(`⚠️  Найдено проблем: ${errors} критичных, ${warnings} предупреждений`);
  console.log('');
  if (errors > 0) {
    console.log('❌ КРИТИЧНЫЕ ОШИБКИ - деплой невозможен!');
    console.log('Исправьте ошибки и запустите проверку снова.');
    process.exit(1);
  } else {
    console.log('⚠️  Есть предупреждения, но деплой возможен');
    console.log('Рекомендуется исправить предупреждения перед деплоем.');
    process.exit(0);
  }
}
