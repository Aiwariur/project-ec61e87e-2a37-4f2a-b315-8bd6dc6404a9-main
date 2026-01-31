import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const orderSchema = z.object({
  name: z.string().trim().min(2, 'Имя слишком короткое').max(100, 'Имя слишком длинное'),
  phone: z.string().trim().min(10, 'Введите корректный номер телефона').max(20, 'Номер слишком длинный'),
  email: z.string().trim().email('Введите корректный email').max(255, 'Email слишком длинный'),
  address: z.string().trim().min(10, 'Введите полный адрес').max(500, 'Адрес слишком длинный'),
  comment: z.string().trim().max(1000, 'Комментарий слишком длинный').optional(),
});

interface OrderFormProps {
  children: React.ReactNode;
}

const OrderForm = ({ children }: OrderFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const cart = useStore((state) => state.cart);
  const getTotalPrice = useStore((state) => state.getTotalPrice);
  const clearCart = useStore((state) => state.clearCart);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      comment: formData.get('comment') as string,
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

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: data.name,
          customer_phone: data.phone,
          customer_email: data.email,
          delivery_method: 'Доставка',
          address: data.address,
          comment: data.comment,
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

      toast.success('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
      clearCart();
      setOpen(false);
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg sm:text-xl text-center sm:text-left">Оформление заказа</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-center sm:text-left">
            Заполните форму, и мы свяжемся с вами для подтверждения заказа
          </DialogDescription>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-muted/30 rounded-lg p-3 sm:p-4 mb-4">
          <h4 className="font-medium text-xs sm:text-sm mb-2 text-center sm:text-left">Ваш заказ:</h4>
          <div className="space-y-1 text-xs sm:text-sm">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold text-xs sm:text-sm">
            <span>Итого:</span>
            <span className="text-primary">{formatPrice(getTotalPrice())}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm">Ваше имя *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Иван Иванов"
              required
              className={`text-sm ${errors.name ? 'border-destructive' : ''}`}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs sm:text-sm">Телефон *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              required
              className={`text-sm ${errors.phone ? 'border-destructive' : ''}`}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ivan@example.com"
              required
              className={`text-sm ${errors.email ? 'border-destructive' : ''}`}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs sm:text-sm">Адрес доставки *</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Город, улица, дом, квартира"
              required
              className={`text-sm ${errors.address ? 'border-destructive' : ''}`}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-xs sm:text-sm">Комментарий к заказу</Label>
            <Textarea
              id="comment"
              name="comment"
              placeholder="Дополнительные пожелания..."
              className={`text-sm ${errors.comment ? 'border-destructive' : ''}`}
            />
            {errors.comment && (
              <p className="text-xs text-destructive">{errors.comment}</p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full text-sm sm:text-base" disabled={isSubmitting}>
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderForm;
