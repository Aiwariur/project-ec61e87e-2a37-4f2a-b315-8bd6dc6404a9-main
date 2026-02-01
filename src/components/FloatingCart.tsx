import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useStore } from '@/lib/store';
import Cart from './Cart';

const FloatingCart = () => {
  const totalItems = useStore((state) => state.getTotalItems());
  const getTotalPrice = useStore((state) => state.getTotalPrice);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  // Не показываем кнопку если корзина пуста
  if (totalItems === 0) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {/* Мобильная версия - внизу по центру */}
        <Button
          size="lg"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 shadow-2xl hover:shadow-3xl hover:scale-105 
                     transition-all duration-300 md:hidden animate-in slide-in-from-bottom-4 fade-in
                     flex items-center gap-3 px-6 py-6 rounded-full min-w-[280px] justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-in zoom-in">
                {totalItems}
              </Badge>
            </div>
            <span className="font-semibold">Корзина</span>
          </div>
          <span className="font-bold text-base">
            {formatPrice(getTotalPrice())}
          </span>
        </Button>
      </SheetTrigger>

      <SheetTrigger asChild>
        {/* Десктопная версия - правый нижний угол */}
        <Button
          size="lg"
          className="hidden md:flex fixed bottom-8 right-8 z-40 shadow-2xl hover:shadow-3xl hover:scale-105
                     transition-all duration-300 animate-in slide-in-from-right-4 fade-in
                     items-center gap-3 px-6 py-6 rounded-full"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-in zoom-in">
              {totalItems}
            </Badge>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs opacity-90">Корзина ({totalItems})</span>
            <span className="font-bold text-base">
              {formatPrice(getTotalPrice())}
            </span>
          </div>
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg">
        <Cart />
      </SheetContent>
    </Sheet>
  );
};

export default FloatingCart;
