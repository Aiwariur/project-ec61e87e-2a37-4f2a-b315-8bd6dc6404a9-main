import budgieImg from '@/assets/budgie.jpg';
import africanGreyImg from '@/assets/african-grey.jpg';
import cockatielImg from '@/assets/cockatiel.jpg';
import macawImg from '@/assets/macaw.jpg';
import lovebirdImg from '@/assets/lovebird.jpg';
import amazonImg from '@/assets/amazon.jpg';
import { Product } from '@/lib/store';

export const products: Product[] = [
  {
    id: '1',
    name: 'Волнистый попугай',
    price: 2500,
    oldPrice: 3500,
    image: budgieImg,
    category: 'Начинающим',
    description: 'Идеальный выбор для начинающих владельцев. Общительный и легко обучаемый.',
    inStock: true,
  },
  {
    id: '2',
    name: 'Жако (Серый попугай)',
    price: 85000,
    image: africanGreyImg,
    category: 'Говорящие',
    description: 'Самый умный говорящий попугай. Может выучить до 1500 слов.',
    inStock: true,
  },
  {
    id: '3',
    name: 'Корелла',
    price: 7500,
    oldPrice: 9000,
    image: cockatielImg,
    category: 'Популярные',
    description: 'Дружелюбный попугай с красивым хохолком. Отлично поёт.',
    inStock: true,
  },
  {
    id: '4',
    name: 'Ара Красный',
    price: 250000,
    image: macawImg,
    category: 'Премиум',
    description: 'Великолепный яркий попугай. Живёт до 60 лет. Настоящий друг на всю жизнь.',
    inStock: true,
  },
  {
    id: '5',
    name: 'Неразлучник',
    price: 4500,
    image: lovebirdImg,
    category: 'Начинающим',
    description: 'Маленький, но очень яркий попугай. Лучше содержать парой.',
    inStock: true,
  },
  {
    id: '6',
    name: 'Амазон',
    price: 120000,
    image: amazonImg,
    category: 'Говорящие',
    description: 'Отличный говорун с ярким оперением. Очень привязывается к хозяину.',
    inStock: true,
  },
];

export const categories = ['Все', 'Начинающим', 'Популярные', 'Говорящие', 'Премиум'];
