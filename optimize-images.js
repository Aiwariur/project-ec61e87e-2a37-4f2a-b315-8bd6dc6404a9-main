#!/usr/bin/env node

/**
 * Скрипт для оптимизации изображений товаров
 * 
 * Использование:
 * npm install --save-dev sharp
 * node optimize-images.js
 * 
 * Что делает:
 * 1. Сжимает JPEG до качества 85%
 * 2. Создает WebP версии (качество 80%)
 * 3. Создает responsive версии (thumbnail, medium, large)
 * 4. Удаляет метаданные
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, 'public', 'images', 'products');
const outputDir = path.join(__dirname, 'public', 'images', 'products-optimized');

// Создаем директорию для оптимизированных изображений
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Размеры для responsive images
const sizes = {
  thumbnail: 300,  // Для превью в каталоге
  medium: 600,     // Для модальных окон на мобильных
  large: 1200,     // Для модальных окон на десктопе
};

async function optimizeImage(filename) {
  const inputPath = path.join(imagesDir, filename);
  const baseName = path.parse(filename).name;
  
  console.log(`Обработка: ${filename}`);
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Оригинальный размер
    const originalSize = fs.statSync(inputPath).size;
    console.log(`  Оригинал: ${(originalSize / 1024).toFixed(2)} КБ`);
    
    // 1. Оптимизированный JPEG (качество 85%)
    await image
      .jpeg({ quality: 85, progressive: true })
      .toFile(path.join(outputDir, `${baseName}.jpg`));
    
    const jpegSize = fs.statSync(path.join(outputDir, `${baseName}.jpg`)).size;
    console.log(`  JPEG 85%: ${(jpegSize / 1024).toFixed(2)} КБ (экономия ${((1 - jpegSize/originalSize) * 100).toFixed(1)}%)`);
    
    // 2. WebP версия (качество 80%)
    await image
      .webp({ quality: 80 })
      .toFile(path.join(outputDir, `${baseName}.webp`));
    
    const webpSize = fs.statSync(path.join(outputDir, `${baseName}.webp`)).size;
    console.log(`  WebP 80%: ${(webpSize / 1024).toFixed(2)} КБ (экономия ${((1 - webpSize/originalSize) * 100).toFixed(1)}%)`);
    
    // 3. Responsive версии
    for (const [sizeName, width] of Object.entries(sizes)) {
      // JPEG
      await sharp(inputPath)
        .resize(width, width, { fit: 'cover' })
        .jpeg({ quality: 85, progressive: true })
        .toFile(path.join(outputDir, `${baseName}-${sizeName}.jpg`));
      
      // WebP
      await sharp(inputPath)
        .resize(width, width, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(path.join(outputDir, `${baseName}-${sizeName}.webp`));
    }
    
    console.log(`  ✓ Создано 8 версий (JPEG + WebP × 4 размера)`);
    
  } catch (error) {
    console.error(`  ✗ Ошибка: ${error.message}`);
  }
}

async function main() {
  console.log('🖼️  Оптимизация изображений товаров\n');
  
  const files = fs.readdirSync(imagesDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file));
  
  console.log(`Найдено файлов: ${files.length}\n`);
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  
  for (const file of files) {
    await optimizeImage(file);
    console.log('');
  }
  
  // Подсчет общей экономии
  const originalFiles = fs.readdirSync(imagesDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file));
  
  originalFiles.forEach(file => {
    totalOriginal += fs.statSync(path.join(imagesDir, file)).size;
  });
  
  const optimizedFiles = fs.readdirSync(outputDir)
    .filter(file => /\.jpg$/i.test(file) && !file.includes('-'));
  
  optimizedFiles.forEach(file => {
    totalOptimized += fs.statSync(path.join(outputDir, file)).size;
  });
  
  console.log('═══════════════════════════════════════');
  console.log(`Оригинал: ${(totalOriginal / 1024 / 1024).toFixed(2)} МБ`);
  console.log(`Оптимизировано: ${(totalOptimized / 1024 / 1024).toFixed(2)} МБ`);
  console.log(`Экономия: ${((1 - totalOptimized/totalOriginal) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════');
  console.log('\n✅ Готово!');
  console.log('\nСледующие шаги:');
  console.log('1. Проверьте качество изображений в папке products-optimized/');
  console.log('2. Замените оригинальные файлы оптимизированными');
  console.log('3. Обновите компоненты для использования WebP с fallback на JPEG');
}

main().catch(console.error);
