import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Truck, Heart } from 'lucide-react';
import heroImage from '@/assets/hero-parrot.jpg';

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Красивый попугай"
          fetchpriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="py-12 sm:py-16 lg:py-20 max-w-2xl mx-auto text-center lg:text-left lg:mx-0">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-primary text-primary-foreground rounded-full">
            🦜 Лучшие попугаи России
          </span>
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-serif font-bold text-card mb-6 leading-tight">
            Экзотические попугаи с доставкой по РФ
          </h1>
          
          <p className="text-base sm:text-lg text-card/80 mb-8 leading-relaxed">
            Более 15 лет мы помогаем людям найти идеального пернатого друга. 
            Здоровые птицы с документами, консультации и поддержка после покупки.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a href="#catalog">
                Выбрать попугая
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
              <a href="#contact-form">
                Получить консультацию
              </a>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 justify-center lg:justify-start">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-card/90">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm">Гарантия здоровья</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-card/90">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-sm">Доставка по всей России</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-card/90">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-sm">15+ лет опыта</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
