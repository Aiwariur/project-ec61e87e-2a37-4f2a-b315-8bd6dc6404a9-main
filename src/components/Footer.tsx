import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  return (
    <footer id="contacts" className="bg-foreground text-background py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Logo & About */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <span className="text-2xl">🦜</span>
              <span className="font-serif text-xl font-bold">ПопугайМаркет</span>
            </div>
            <p className="text-background/70 text-xs sm:text-sm">
              Официальный сертифицированный питомник экзотических попугаев. 
              Работаем с 2008 года, тысячи довольных клиентов по всей России.
            </p>
          </div>

          {/* Navigation */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Навигация</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#catalog" className="text-background/70 hover:text-background transition-colors">
                  Каталог попугаев
                </a>
              </li>
              <li>
                <a href="#about" className="text-background/70 hover:text-background transition-colors">
                  О нас
                </a>
              </li>
              <li>
                <a href="#delivery" className="text-background/70 hover:text-background transition-colors">
                  Доставка
                </a>
              </li>
              <li>
                <a href="#contacts" className="text-background/70 hover:text-background transition-colors">
                  Контакты
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Контакты</h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-center justify-center md:justify-start gap-2 text-background/70">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+78001234567" className="hover:text-background transition-colors">
                  8 (800) 123-45-67
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2 text-background/70">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:info@popugaimarket.ru" className="hover:text-background transition-colors">
                  info@popugaimarket.ru
                </a>
              </li>
              <li className="flex items-start justify-center md:justify-start gap-2 text-background/70">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>г. Краснодар, ул. Красная, д. 176, ТЦ "Галерея"</span>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Режим работы</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-center justify-center md:justify-start gap-2 text-background/70">
                <Clock className="h-4 w-4 shrink-0" />
                <div>
                  <p>Пн-Пт: 9:00 - 20:00</p>
                  <p>Сб-Вс: 10:00 - 18:00</p>
                </div>
              </li>
            </ul>
            <p className="text-background/70 text-xs sm:text-sm mt-3">
              Телефонная линия работает круглосуточно
            </p>
          </div>
        </div>

        <Separator className="bg-background/20 my-6 sm:my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-background/60 text-center md:text-left">
          <p>© 2024 ПопугайМаркет. Все права защищены.</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <a href="#" className="hover:text-background transition-colors">
              Политика конфиденциальности
            </a>
            <a href="#" className="hover:text-background transition-colors">
              Договор оферты
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
