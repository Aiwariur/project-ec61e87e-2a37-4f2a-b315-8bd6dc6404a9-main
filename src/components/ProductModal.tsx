import { useState, useEffect } from 'react';
import { ShoppingCart, Check, X, Heart, Shield, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Product, useStore } from '@/lib/store';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductModal = ({ product, open, onOpenChange }: ProductModalProps) => {
  const addToCart = useStore((state) => state.addToCart);
  const cart = useStore((state) => state.cart);
  const isInCart = cart.some((item) => item.id === product.id);
  
  // Галерея изображений
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];
  
  // Сбрасываем индекс при открытии модального окна
  useEffect(() => {
    if (open) {
      setCurrentImageIndex(0);
    }
  }, [open]);
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} добавлен в корзину`);
  };

  // Extended info based on product
  const getProductDetails = (product: Product) => {
    const details: Record<string, { lifespan: string; size: string; care: string; features: string[] }> = {
      '1': {
        lifespan: '10-15 лет',
        size: '18-20 см',
        care: 'Легкий уход',
        features: ['Легко обучается', 'Общительный', 'Подходит для квартиры', 'Не требует много места'],
      },
      '2': {
        lifespan: '40-60 лет',
        size: '30-35 см',
        care: 'Требует внимания',
        features: ['Высокий интеллект', 'Говорит до 1500 слов', 'Привязывается к хозяину', 'Требует общения'],
      },
      '3': {
        lifespan: '15-25 лет',
        size: '30-33 см',
        care: 'Средний уход',
        features: ['Красивый хохолок', 'Мелодично поёт', 'Дружелюбный', 'Любит общение'],
      },
      '4': {
        lifespan: '50-60 лет',
        size: '80-90 см',
        care: 'Сложный уход',
        features: ['Яркое оперение', 'Друг на всю жизнь', 'Очень умный', 'Требует большого вольера'],
      },
      '5': {
        lifespan: '10-15 лет',
        size: '13-17 см',
        care: 'Легкий уход',
        features: ['Яркий окрас', 'Лучше парой', 'Активный', 'Компактный размер'],
      },
      '6': {
        lifespan: '40-50 лет',
        size: '35-40 см',
        care: 'Средний уход',
        features: ['Отличный говорун', 'Яркое оперение', 'Привязчивый', 'Весёлый характер'],
      },
    };
    return details[product.id] || details['1'];
  };

  const details = getProductDetails(product);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-muted">
            <img
              src={productImages[currentImageIndex]}
              alt={`${product.name} - фото ${currentImageIndex + 1}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            
            {/* Badges */}
            {product.oldPrice && (
              <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                Скидка {Math.round((1 - product.price / product.oldPrice) * 100)}%
              </Badge>
            )}
            <Badge variant="outline" className="absolute top-4 right-4 bg-card/90">
              {product.category}
            </Badge>
            
            {/* Navigation arrows - показываем только если больше 1 изображения */}
            {productImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card/80 hover:bg-card"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card/80 hover:bg-card"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 px-3 py-1 rounded-full text-xs font-medium">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
              </>
            )}
            
            {/* Thumbnails - показываем только если больше 1 изображения */}
            {productImages.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex 
                        ? 'bg-primary w-6' 
                        : 'bg-card/60 hover:bg-card/80'
                    }`}
                    aria-label={`Показать фото ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 sm:p-6 flex flex-col">
            <DialogHeader className="text-left mb-4">
              <DialogTitle className="font-serif text-xl sm:text-2xl text-center sm:text-left">{product.name}</DialogTitle>
            </DialogHeader>

            <p className="text-muted-foreground mb-4 text-sm sm:text-base text-center sm:text-left">{product.description}</p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
              <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-xs text-muted-foreground">Размер</p>
                <p className="font-semibold text-xs sm:text-sm">{details.size}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-xs text-muted-foreground">Срок жизни</p>
                <p className="font-semibold text-xs sm:text-sm">{details.lifespan}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-xs text-muted-foreground">Уход</p>
                <p className="font-semibold text-xs sm:text-sm">{details.care}</p>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2 text-center sm:text-left">Особенности:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-1">
                {details.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Guarantees */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Гарантия здоровья</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-primary" />
                <span>Доставка по РФ</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-primary" />
                <span>Документы</span>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="mt-auto pt-4 border-t border-border">
              <div className="flex items-baseline justify-center sm:justify-start gap-2 mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-base sm:text-lg text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="lg"
                  variant={isInCart ? 'secondary' : 'default'}
                  onClick={handleAddToCart}
                  className="flex-1 w-full"
                >
                  {isInCart ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      В корзине
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Добавить в корзину
                    </>
                  )}
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <a href="tel:+78001234567">Позвонить</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
