import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const db = new Database('./parrot_shop.db');

// Товары с информацией
const products = [
  { id: 65, name: 'Сине-желтый ара (Ara ararauna)', price: 9500000, old_price: 38000000, description: 'Ручной выкормыш, полностью социализирован' },
  { id: 66, name: 'Какаду Молуккский', price: 12000000, old_price: 45000000, description: 'Редкий вид, очень умный и общительный' },
  { id: 67, name: 'Жако (Серый попугай)', price: 8500000, old_price: 35000000, description: 'Отличный говорун, долгожитель' },
  { id: 68, name: 'Амазон зеленокрылый', price: 7500000, old_price: 30000000, description: 'Веселый и активный попугай' },
  { id: 69, name: 'Корелла', price: 2500000, old_price: 9000000, description: 'Идеален для начинающих' },
  { id: 70, name: 'Волнистый попугай', price: 1500000, old_price: 5000000, description: 'Маленький, но очень милый' },
  { id: 71, name: 'Неразлучник', price: 2000000, old_price: 7000000, description: 'Парные птицы, очень привязаны друг к другу' },
  { id: 72, name: 'Ара Зеленокрылый', price: 11000000, old_price: 42000000, description: 'Величественная птица с ярким оперением' },
  { id: 73, name: 'Какаду Белохохлый', price: 10000000, old_price: 40000000, description: 'Белоснежное оперение, очень красивый' },
  { id: 74, name: 'Лори Радужный', price: 5000000, old_price: 18000000, description: 'Яркие краски, активный и игривый' },
  { id: 75, name: 'Попугай Эклектус', price: 6000000, old_price: 22000000, description: 'Самцы зеленые, самки красные' },
  { id: 76, name: 'Какаду Серный', price: 9000000, old_price: 36000000, description: 'Желтый хохолок, очень социален' },
  { id: 77, name: 'Ара Сине-желтый (молодой)', price: 8000000, old_price: 32000000, description: 'Молодая особь, хорошо приручается' },
  { id: 78, name: 'Амазон краснолобый', price: 6500000, old_price: 24000000, description: 'Говорящий попугай, хороший компаньон' },
  { id: 79, name: 'Какаду Инка', price: 11500000, old_price: 44000000, description: 'Редкий вид с красивым оперением' },
  { id: 80, name: 'Лори Чёрный', price: 4500000, old_price: 16000000, description: 'Чёрное оперение с красными пятнами' },
  { id: 81, name: 'Попугай Сенегальский', price: 3500000, old_price: 12000000, description: 'Маленький, но очень умный' },
  { id: 82, name: 'Какаду Розовый', price: 13000000, old_price: 50000000, description: 'Розовое оперение, очень редкий' },
  { id: 83, name: 'Ара Зелёный', price: 10500000, old_price: 41000000, description: 'Зелёное оперение, величественный вид' },
  { id: 84, name: 'Амазон жёлтоголовый', price: 7000000, old_price: 28000000, description: 'Жёлтая голова, хороший говорун' },
  { id: 85, name: 'Корелла Белая', price: 3000000, old_price: 10000000, description: 'Белое оперение, очень красивая' },
  { id: 86, name: 'Волнистый попугай Голубой', price: 2000000, old_price: 6000000, description: 'Голубое оперение, редкий окрас' },
  { id: 87, name: 'Неразлучник Персиковый', price: 2500000, old_price: 8000000, description: 'Персиковое оперение, очень милый' },
  { id: 88, name: 'Ара Красный', price: 250000000, old_price: 380000000, description: 'Самый крупный попугай, величественный' },
  { id: 89, name: 'Какаду Чёрный', price: 14000000, old_price: 52000000, description: 'Чёрное оперение, очень редкий' },
  { id: 90, name: 'Лори Жёлтый', price: 5500000, old_price: 20000000, description: 'Жёлтое оперение, активный' },
  { id: 91, name: 'Попугай Африканский серый', price: 8500000, old_price: 34000000, description: 'Очень умный, долгожитель' },
  { id: 92, name: 'Амазон синелобый', price: 6800000, old_price: 25000000, description: 'Синий лоб, хороший говорун' },
  { id: 93, name: 'Какаду Гребнистый', price: 9500000, old_price: 37000000, description: 'Большой гребень, очень красивый' },
  { id: 94, name: 'Ара Сине-жёлтый (взрослый)', price: 10000000, old_price: 39000000, description: 'Взрослая особь, полностью социализирован' },
  { id: 95, name: 'Лори Красный', price: 6000000, old_price: 23000000, description: 'Красное оперение, очень яркий' },
  { id: 96, name: 'Попугай Эклектус (самка)', price: 7000000, old_price: 26000000, description: 'Красное оперение, самка' },
  { id: 97, name: 'Амазон зелёный', price: 7200000, old_price: 29000000, description: 'Зелёное оперение, активный' },
  { id: 98, name: 'Корелла Жёлтая', price: 3200000, old_price: 11000000, description: 'Жёлтое оперение, очень красивая' },
  { id: 99, name: 'Волнистый попугай Зелёный', price: 1800000, old_price: 5500000, description: 'Зелёное оперение, классический окрас' },
  { id: 100, name: 'Неразлучник Оранжевый', price: 2300000, old_price: 7500000, description: 'Оранжевое оперение, очень милый' },
  { id: 101, name: 'Ара Синий', price: 11500000, old_price: 43000000, description: 'Синее оперение, величественный' },
  { id: 102, name: 'Какаду Жёлтый', price: 10500000, old_price: 40000000, description: 'Жёлтое оперение, очень красивый' },
  { id: 103, name: 'Лори Оранжевый', price: 5800000, old_price: 21000000, description: 'Оранжевое оперение, активный' },
  { id: 104, name: 'Попугай Сенегальский (молодой)', price: 3200000, old_price: 11500000, description: 'Молодая особь, хорошо приручается' },
  { id: 105, name: 'Амазон красный', price: 7500000, old_price: 30000000, description: 'Красное оперение, хороший говорун' },
  { id: 106, name: 'Какаду Пальмовый', price: 12500000, old_price: 48000000, description: 'Редкий вид, очень красивый' },
  { id: 107, name: 'Ара Зелёный (молодой)', price: 9500000, old_price: 38000000, description: 'Молодая особь, хорошо приручается' },
  { id: 108, name: 'Лори Чёрный (молодой)', price: 4200000, old_price: 15000000, description: 'Молодая особь, активная' },
  { id: 109, name: 'Попугай Эклектус (молодой)', price: 5500000, old_price: 20000000, description: 'Молодая особь, хорошо приручается' },
  { id: 110, name: 'Амазон жёлтый', price: 7300000, old_price: 29000000, description: 'Жёлтое оперение, хороший говорун' },
  { id: 111, name: 'Какаду Белый', price: 9800000, old_price: 38000000, description: 'Белое оперение, очень красивый' },
  { id: 112, name: 'Ара Красный (молодой)', price: 200000000, old_price: 350000000, description: 'Молодая особь, хорошо приручается' },
  { id: 113, name: 'Лори Жёлтый (молодой)', price: 5000000, old_price: 18000000, description: 'Молодая особь, активная' },
  { id: 114, name: 'Попугай Африканский серый (молодой)', price: 7500000, old_price: 30000000, description: 'Молодая особь, хорошо приручается' },
  { id: 115, name: 'Амазон синий', price: 7800000, old_price: 31000000, description: 'Синее оперение, хороший говорун' },
  { id: 116, name: 'Какаду Серный (молодой)', price: 8000000, old_price: 32000000, description: 'Молодая особь, хорошо приручается' },
  { id: 117, name: 'Ара Сине-жёлтый (птенец)', price: 7500000, old_price: 30000000, description: 'Птенец, очень хорошо приручается' },
  { id: 118, name: 'Лори Красный (молодой)', price: 5300000, old_price: 19000000, description: 'Молодая особь, активная' },
  { id: 119, name: 'Попугай Сенегальский (взрослый)', price: 4000000, old_price: 14000000, description: 'Взрослая особь, полностью социализирован' },
  { id: 120, name: 'Амазон оранжевый', price: 7600000, old_price: 30000000, description: 'Оранжевое оперение, хороший говорун' },
  { id: 121, name: 'Какаду Розовый (молодой)', price: 11500000, old_price: 45000000, description: 'Молодая особь, хорошо приручается' },
  { id: 122, name: 'Ара Зелёный (взрослый)', price: 11000000, old_price: 42000000, description: 'Взрослая особь, полностью социализирован' },
  { id: 123, name: 'Лори Оранжевый (молодой)', price: 5200000, old_price: 19000000, description: 'Молодая особь, активная' },
  { id: 124, name: 'Попугай Эклектус (взрослый)', price: 7500000, old_price: 28000000, description: 'Взрослая особь, полностью социализирован' },
  { id: 125, name: 'Амазон фиолетовый', price: 8000000, old_price: 32000000, description: 'Фиолетовое оперение, хороший говорун' },
  { id: 126, name: 'Какаду Чёрный (молодой)', price: 12500000, old_price: 48000000, description: 'Молодая особь, хорошо приручается' },
  { id: 127, name: 'Ара Красный (взрослый)', price: 280000000, old_price: 400000000, description: 'Взрослая особь, полностью социализирован' },
];

// Вставляем товары
const insert = db.prepare(`
  INSERT INTO products (id, name, price, old_price, image, images, description, in_stock, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Функция для поиска всех изображений товара
function findProductImages(productId) {
  const publicDir = './public/images/products';
  const allImages = [];
  
  // Основное изображение уже хранится в поле image, поэтому в массив images
  // добавляем только дополнительные изображения (product-100-1.jpg, product-100-2.jpg и т.д.)
  let index = 1;
  while (true) {
    const additionalImage = path.join(publicDir, `product-${productId}-${index}.jpg`);
    if (fs.existsSync(additionalImage)) {
      allImages.push(`/images/products/product-${productId}-${index}.jpg`);
      index++;
    } else {
      break;
    }
  }
  
  return allImages;
}

let count = 0;
for (const product of products) {
  const image = `/images/products/product-${product.id}.jpg`;
  const allImages = findProductImages(product.id);
  const images = JSON.stringify(allImages);
  
  console.log(`Товар ${product.id}: найдено ${allImages.length} изображений`);
  
  try {
    insert.run(
      product.id,
      product.name,
      product.price,
      product.old_price,
      image,
      images,
      product.description,
      1,
      Math.floor(Date.now() / 1000)
    );
    count++;
  } catch (e) {
    console.log(`Ошибка при вставке товара ${product.id}: ${e.message}`);
  }
}

console.log(`Импортировано товаров: ${count}`);
db.close();
