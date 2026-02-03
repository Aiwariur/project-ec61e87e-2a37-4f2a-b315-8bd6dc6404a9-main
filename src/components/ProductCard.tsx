import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product, useStore } from '@/lib/store';
import { toast } from 'sonner';
import ProductModal from './ProductModal';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const addToCart = useStore((state) => state.addToCart);
  const cart = useStore((state) => state.cart);
  const isInCart = cart.some((item) => item.id === product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} добавлен в корзину`);
  };

  const handleCardClick = () => {
    setModalOpen(true);
  };

  return (
    <>
      <Card 
        className="group overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {product.oldPrice && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
              Скидка
            </Badge>
          )}
          <Badge variant="outline" className="absolute top-3 right-3 bg-card/90">
            {product.category}
          </Badge>
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-card bg-foreground/80 px-4 py-2 rounded-full text-sm font-medium">
              Подробнее
            </span>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground mb-4 text-center sm:text-left">
            {product.name}
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              variant={isInCart ? 'secondary' : 'default'}
              onClick={handleAddToCart}
              className="shrink-0 w-full sm:w-auto"
            >
              {isInCart ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  В корзине
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Купить
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductModal
        product={product}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
};

export default ProductCard;
