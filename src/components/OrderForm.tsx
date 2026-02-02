import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { z } from 'zod';
import { X } from 'lucide-react';

const orderSchema = z.object({
  name: z.string().trim().min(2, 'Имя слишком короткое').max(100, 'Имя слишком длинное'),
  phone: z.string().trim().min(10, 'Введите корректный номер телефона').max(20, 'Номер слишком длинный'),
  comment: z.string().trim().max(1000, 'Комментарий слишком длинный').optional(),
  delivery_method: z.enum(['pickup', 'courier', 'russia', 'express'], {
    required_error: 'Выберите способ доставки',
  }),
  payment_method: z.enum(['sbp', 'card', 'manager'], {
    required_error: 'Выберите способ оплаты',
  }),
});

interface OrderFormProps {
  children: React.ReactNode;
}

const OrderForm = ({ children }: OrderFormProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deliveryMethod, setDeliveryMethod] = useState<string>('courier');
  const [paymentMethod, setPaymentMethod] = useState<string>('sbp');
  const cart = useStore((state) => state.cart);
  const getTotalPrice = useStore((state) => state.getTotalPrice);
  const clearCart = useStore((state) => state.clearCart);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      comment: formData.get('comment') as string,
      delivery_method: deliveryMethod,
      payment_method: paymentMethod,
    };

    const result = orderSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    const deliveryMethodNames: Record<string, string> = {
      pickup: 'Самовывоз',
      courier: 'Курьером по Краснодару',
      russia: 'Доставка по России',
      express: 'Экспресс-доставка',
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: data.name,
          customer_phone: data.phone,
          customer_email: '',
          delivery_method: deliveryMethodNames[data.delivery_method] || 'Доставка',
          address: '',
          comment: data.comment,
          payment_method: data.payment_method,
          items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          total: getTotalPrice(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      const orderNumber = result.order_number || result.id || Date.now();

      clearCart();
      setOpen(false);
      
      // Редирект на страницу благодарности
      navigate(`/thank-you?order=${orderNumber}`);
    } catch (error) {
      toast.error('Ошибка при отправке заказа. Попробуйте еще раз.');
      console.error('Order submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Button size="lg" className="w-full" disabled>
        Корзина пуста
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[95vh] flex flex-col p-0 gap-0">
        {/* Компактный заголовок с кнопкой закрытия */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-background sticky top-0 z-10">
          <div>
            <DialogTitle className="font-serif text-base sm:text-lg">Оформление заказа</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Сумма: <span className="font-semibold text-foreground">{formatPrice(getTotalPrice())}</span>
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-2.5 sm:space-y-3">
            {/* Компактный список товаров */}
            <div className="bg-muted/30 rounded p-2 text-xs">
              <div className="space-y-0.5 max-h-20 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-muted-foreground">
                    <span>{item.name} ×{item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Поля ввода */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Имя *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Иван Иванов"
                required
                className={`text-xs h-8 ${errors.name ? 'border-destructive' : ''}`}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs">Телефон *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                required
                className={`text-xs h-8 ${errors.phone ? 'border-destructive' : ''}`}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            {/* Способ доставки - компактный */}
            <div className="space-y-1.5">
              <Label className="text-xs">Доставка *</Label>
              <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                <div className="flex items-start space-x-2 p-2 border rounded hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="pickup" id="pickup" className="mt-0.5" />
                  <Label htmlFor="pickup" className="flex-1 cursor-pointer text-xs leading-tight">
                    <div className="font-medium">Самовывоз</div>
                    <div className="text-muted-foreground">Краснодар</div>
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-2 border rounded hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="courier" id="courier" className="mt-0.5" />
                  <Label htmlFor="courier" className="flex-1 cursor-pointer text-xs leading-tight">
                    <div className="font-medium">Курьер Краснодар</div>
                    <div className="text-muted-foreground">от 500 ₽</div>
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-2 border rounded hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="russia" id="russia" className="mt-0.5" />
                  <Label htmlFor="russia" className="flex-1 cursor-pointer text-xs leading-tight">
                    <div className="font-medium">По России</div>
                    <div className="text-muted-foreground">от 3 000 ₽</div>
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-2 border rounded hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="express" id="express" className="mt-0.5" />
                  <Label htmlFor="express" className="flex-1 cursor-pointer text-xs leading-tight">
                    <div className="font-medium">Экспресс</div>
                    <div className="text-muted-foreground">от 3 500 ₽</div>
                  </Label>
                </div>
              </RadioGroup>
              {errors.delivery_method && <p className="text-xs text-destructive">{errors.delivery_method}</p>}
            </div>

            {/* Комментарий - компактный */}
            <div className="space-y-1.5">
              <Label htmlFor="comment" className="text-xs">Комментарий</Label>
              <Textarea
                id="comment"
                name="comment"
                placeholder="Пожелания..."
                className={`text-xs h-16 resize-none ${errors.comment ? 'border-destructive' : ''}`}
              />
              {errors.comment && <p className="text-xs text-destructive">{errors.comment}</p>}
            </div>

            {/* Способ оплаты - компактный */}
            <div className="space-y-1.5">
              <Label className="text-xs">Оплата *</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-start space-x-2 p-2 border rounded hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="sbp" id="sbp" className="mt-0.5" />
                  <Label htmlFor="sbp" className="flex-1 cursor-pointer text-xs leading-tight">
                    <div className="font-medium">СБП</div>
                    <div className="text-muted-foreground">По номеру телефона</div>
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-2 border rounded hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="card" id="card" className="mt-0.5" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer text-xs leading-tight">
                    <div className="font-medium">Карта</div>
                    <div className="text-muted-foreground">Visa, MasterCard, МИР</div>
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-2 border rounded hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="manager" id="manager" className="mt-0.5" />
                  <Label htmlFor="manager" className="flex-1 cursor-pointer text-xs leading-tight">
                    <div className="font-medium">С менеджером</div>
                    <div className="text-muted-foreground">Обсудим способ</div>
                  </Label>
                </div>
              </RadioGroup>
              {errors.payment_method && <p className="text-xs text-destructive">{errors.payment_method}</p>}
            </div>
          </div>

          {/* Закрепленная кнопка внизу */}
          <div className="border-t bg-background p-3 sm:p-4 space-y-2 sticky bottom-0">
            <Button 
              type="submit" 
              size="sm" 
              className="w-full text-xs sm:text-sm h-9" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
            </Button>
            <p className="text-xs text-muted-foreground text-center leading-tight">
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderForm;
