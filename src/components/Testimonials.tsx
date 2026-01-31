import { Star } from 'lucide-react';
import { useEffect, useRef } from 'react';

const Testimonials = () => {
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      name: 'Анна Петрова',
      city: 'Москва',
      rating: 5,
      text: 'Купили Жако у вас 3 года назад. Кеша стал полноценным членом семьи! Очень умный и разговорчивый. Спасибо за профессиональную консультацию и поддержку.',
      image: '/images/products/product-67.jpg',
      parrot: 'Жако'
    },
    {
      name: 'Дмитрий Соколов',
      city: 'Санкт-Петербург',
      rating: 5,
      text: 'Ара — невероятная птица! Доставка прошла отлично, попугай приехал здоровым и активным. Все документы в порядке. Рекомендую!',
      image: '/images/products/product-94.jpg',
      parrot: 'Сине-жёлтый ара'
    },
    {
      name: 'Елена Морозова',
      city: 'Казань',
      rating: 5,
      text: 'Волнистые попугайчики просто прелесть! Дети в восторге. Магазин помог с выбором клетки и всех необходимых аксессуаров.',
      image: '/images/products/product-65.jpg',
      parrot: 'Волнистый попугай'
    },
    {
      name: 'Игорь Васильев',
      city: 'Новосибирск',
      rating: 5,
      text: 'Какаду — моя мечта! Спасибо ПопугайМаркет за её осуществление. Птица здоровая, ручная, с отличным характером.',
      image: '/images/products/product-95.jpg',
      parrot: 'Какаду'
    },
    {
      name: 'Мария Кузнецова',
      city: 'Екатеринбург',
      rating: 5,
      text: 'Корелла Тишка — самый милый попугай! Быстро привык к нам, поёт песенки. Консультанты очень помогли с адаптацией.',
      image: '/images/products/product-66.jpg',
      parrot: 'Корелла'
    },
    {
      name: 'Сергей Николаев',
      city: 'Краснодар',
      rating: 5,
      text: 'Амазон — потрясающая птица! Очень умная и общительная. Доставка в регион прошла идеально. Всё на высшем уровне!',
      image: '/images/products/product-68.jpg',
      parrot: 'Амазон'
    },
    {
      name: 'Ольга Смирнова',
      city: 'Ростов-на-Дону',
      rating: 5,
      text: 'Неразлучники — это любовь! Такие яркие и активные. Спасибо за подробную инструкцию по уходу и кормлению.',
      image: '/images/products/product-70.jpg',
      parrot: 'Неразлучники'
    },
    {
      name: 'Александр Попов',
      city: 'Уфа',
      rating: 5,
      text: 'Лори — невероятно красивый попугай! Яркие краски и весёлый характер. Дети не могут оторваться от него.',
      image: '/images/products/product-72.jpg',
      parrot: 'Лори'
    }
  ];

  // Дублируем отзывы для бесконечной прокрутки
  const row1 = [...testimonials.slice(0, 4), ...testimonials.slice(0, 4)];
  const row2 = [...testimonials.slice(4, 8), ...testimonials.slice(4, 8)];

  useEffect(() => {
    const scroll1 = scrollRef1.current;
    const scroll2 = scrollRef2.current;

    if (!scroll1 || !scroll2) return;

    let animationId1: number;
    let animationId2: number;
    let position1 = 0;
    let position2 = 0;

    const animate = () => {
      // Первая строка движется вправо
      position1 += 0.5;
      if (scroll1) {
        const maxScroll = scroll1.scrollWidth / 2;
        if (position1 >= maxScroll) {
          position1 = 0;
        }
        scroll1.style.transform = `translateX(-${position1}px)`;
      }

      // Вторая строка движется влево
      position2 += 0.5;
      if (scroll2) {
        const maxScroll = scroll2.scrollWidth / 2;
        if (position2 >= maxScroll) {
          position2 = 0;
        }
        scroll2.style.transform = `translateX(-${position2}px)`;
      }

      animationId1 = requestAnimationFrame(animate);
    };

    animationId1 = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId1);
      if (animationId2) cancelAnimationFrame(animationId2);
    };
  }, []);

  const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
    <div className="flex-shrink-0 w-[350px] mx-3">
      <div className="bg-card border border-border rounded-xl p-6 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={testimonial.image}
            alt={testimonial.parrot}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
            <p className="text-sm text-muted-foreground">{testimonial.city}</p>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {testimonial.text}
        </p>
        <div className="text-xs text-primary font-medium">
          Купил: {testimonial.parrot}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Отзывы наших клиентов
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Более 12,000 счастливых владельцев попугаев делятся своими историями
          </p>
        </div>
      </div>

      {/* Первая строка - движется вправо */}
      <div className="mb-6 overflow-hidden">
        <div ref={scrollRef1} className="flex" style={{ width: 'fit-content' }}>
          {row1.map((testimonial, index) => (
            <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
          ))}
        </div>
      </div>

      {/* Вторая строка - движется влево */}
      <div className="overflow-hidden">
        <div ref={scrollRef2} className="flex" style={{ width: 'fit-content' }}>
          {row2.map((testimonial, index) => (
            <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 text-center">
        <p className="text-muted-foreground">
          Средняя оценка: <span className="text-2xl font-bold text-primary">4.9</span> из 5 
          <span className="mx-2">•</span>
          Более <span className="font-semibold text-foreground">2,500 отзывов</span> на независимых площадках
        </p>
      </div>
    </section>
  );
};

export default Testimonials;
