import { Truck, Package, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const deliveryOptions = [
  {
    icon: MapPin,
    title: 'Самовывоз',
    description: 'Бесплатно из нашего питомника в Москве',
    price: 'Бесплатно',
  },
  {
    icon: Truck,
    title: 'Курьером по Москве',
    description: 'Доставка в день заказа или в удобное время',
    price: 'от 500 ₽',
  },
  {
    icon: Package,
    title: 'Доставка по России',
    description: 'Специальный контейнер с климат-контролем',
    price: 'от 3 000 ₽',
  },
  {
    icon: Clock,
    title: 'Экспресс-доставка',
    description: 'Срочная доставка авиатранспортом',
    price: 'от 7 000 ₽',
  },
];

const Delivery = () => {
  return (
    <section id="delivery" className="py-8 sm:py-10 lg:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8">
          <span className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wide">
            Варианты доставки
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground mt-2 mb-4">
            Доставка по всей России
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Мы доставляем попугаев в любой город России. Каждая птица перевозится 
            в специальном контейнере с соблюдением всех правил безопасности.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {deliveryOptions.map((option, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <option.icon className="h-6 w-6 sm:h-7 sm:w-7 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">{option.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">{option.description}</p>
                <span className="text-base sm:text-lg font-bold text-primary">{option.price}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-primary/5 rounded-2xl border border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                Нужна помощь с выбором?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Позвоните нам, и мы подберём идеального попугая и рассчитаем стоимость доставки
              </p>
            </div>
            <a
              href="tel:+78001234567"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap w-full md:w-auto text-sm sm:text-base"
            >
              8 (800) 123-45-67
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Delivery;
