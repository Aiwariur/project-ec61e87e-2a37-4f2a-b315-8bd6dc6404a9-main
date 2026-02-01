import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useStore } from '@/lib/store';
import OrderForm from './OrderForm';

const Cart = () => {
  const cart = useStore((state) => state.cart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const getTotalPrice = useStore((state) => state.getTotalPrice);
  const clearCart = useStore((state) => state.clearCart);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4">
        <ShoppingBag className="h-12 sm:h-16 w-12 sm:w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 text-center">Корзина пуста</h3>
        <p className="text-sm sm:text-base text-muted-foreground text-center">
          Добавьте попугаев из каталога, чтобы оформить заказ
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="pb-4">
        <SheetTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Корзина ({cart.length})
        </SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-3 sm:space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-3 sm:gap-4 p-3 bg-muted/50 rounded-lg">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm sm:text-base text-foreground truncate">{item.name}</h4>
                <p className="text-xs sm:text-sm text-primary font-semibold">
                  {formatPrice(item.price)}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-xs sm:text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base text-muted-foreground">Итого:</span>
          <span className="text-xl sm:text-2xl font-bold text-foreground">
            {formatPrice(getTotalPrice())}
          </span>
        </div>
        
        <OrderForm>
          <Button size="lg" className="w-full text-sm sm:text-base">
            Оформить заказ
          </Button>
        </OrderForm>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs sm:text-sm"
          onClick={clearCart}
        >
          Очистить корзину
        </Button>
      </div>
    </div>
  );
};

export default Cart;
