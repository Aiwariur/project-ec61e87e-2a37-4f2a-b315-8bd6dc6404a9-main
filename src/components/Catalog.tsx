import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import { Product } from '@/lib/store';

// Цвета для категорий попугаев
const categoryColors: Record<string, string> = {
  'Все': 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0',
  'Ара': 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0',
  'Амазон': 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0',
  'Какаду': 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white border-0',
  'Жако': 'bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white border-0',
  'Эклектус': 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0',
  'Корелла': 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white border-0',
  'Аратинга': 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0',
  'Монах': 'bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white border-0',
  'Ожереловый': 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0',
  'Королевский': 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0',
  'Сенегальский': 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0',
  'Лорикет': 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0',
  'Пиррура': 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white border-0',
};

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Все']);
  const [activeCategory, setActiveCategory] = useState('Все');
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(12); // Показываем по 12 товаров

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories');
      const data = await response.json();
      setCategories(['Все', ...data]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories(['Все', 'Ара', 'Амазон', 'Какаду', 'Жако', 'Эклектус', 'Корелла', 'Аратинга', 'Монах', 'Ожереловый', 'Королевский', 'Сенегальский', 'Лорикет', 'Пиррура']);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = activeCategory === 'Все'
    ? products
    : products.filter((product) => product.category === activeCategory);

  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  const loadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  // Сбрасываем счётчик при смене категории
  useEffect(() => {
    setDisplayCount(12);
  }, [activeCategory]);

  return (
    <section id="catalog" className="py-8 sm:py-10 lg:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8">
          <span className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wide">
            Наш ассортимент
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground mt-2 mb-4">
            Каталог попугаев
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Выберите своего идеального пернатого друга. Все птицы здоровы, 
            привиты и имеют необходимые документы.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2">
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={`
                text-xs sm:text-sm font-semibold px-4 py-2 rounded-full
                transition-all duration-300 transform hover:scale-105 shadow-md
                ${activeCategory === category 
                  ? categoryColors[category] || 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0'
                  : 'bg-white/80 hover:bg-white text-gray-700 border border-gray-300'
                }
              `}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-muted-foreground">Загрузка товаров...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Кнопка "Показать ещё" */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full shadow-lg"
                >
                  Показать ещё ({filteredProducts.length - displayCount} товаров)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Catalog;
