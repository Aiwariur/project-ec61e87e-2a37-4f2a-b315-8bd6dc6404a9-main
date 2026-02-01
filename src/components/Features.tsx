import { Shield, Truck, HeartHandshake, Award, Clock, Headphones } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Shield,
    title: 'Гарантия здоровья',
    description: 'Все птицы проходят ветеринарный контроль и имеют необходимые документы.',
  },
  {
    icon: Truck,
    title: 'Доставка по всей РФ',
    description: 'Безопасная доставка в специальных контейнерах с климат-контролем.',
  },
  {
    icon: HeartHandshake,
    title: 'Поддержка после покупки',
    description: 'Консультируем по уходу, кормлению и содержанию на протяжении всей жизни.',
  },
  {
    icon: Award,
    title: 'Сертифицированный питомник',
    description: 'Официальный питомник с лицензией на разведение экзотических птиц.',
  },
  {
    icon: Clock,
    title: '15+ лет опыта',
    description: 'Тысячи счастливых клиентов по всей России доверяют нам.',
  },
  {
    icon: Headphones,
    title: 'Круглосуточная поддержка',
    description: 'Отвечаем на вопросы и помогаем решить любые проблемы 24/7.',
  },
];

const Features = () => {
  return (
    <section id="about" className="py-8 sm:py-10 lg:py-12 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8">
          <span className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wide">
            Почему мы
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground mt-2 mb-4">
            Наши преимущества
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Мы заботимся о каждой птице и каждом клиенте, обеспечивая 
            высочайший уровень сервиса.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-4 sm:p-6 text-center sm:text-left">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto sm:mx-0">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
