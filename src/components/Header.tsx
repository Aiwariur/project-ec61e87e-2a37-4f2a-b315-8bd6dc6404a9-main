import { useState } from 'react';
import { ShoppingCart, Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CONTACTS } from '@/config/contacts';
import Cart from './Cart';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalItems = useStore((state) => state.getTotalItems());

  const navLinks = [
    { href: '#catalog', label: 'Каталог' },
    { href: '#about', label: 'О нас' },
    { href: '#delivery', label: 'Доставка' },
    { href: '#contacts', label: 'Контакты' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🦜</span>
            <span className="font-serif text-base sm:text-xl font-bold text-primary">ПопугайМаркет</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={`tel:${CONTACTS.phoneLink}`}
              className="hidden lg:flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              {CONTACTS.phone}
            </a>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <Cart />
              </SheetContent>
            </Sheet>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 sm:h-10 sm:w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4 text-center">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={`tel:${CONTACTS.phoneLink}`}
                className="flex items-center justify-center gap-2 text-sm font-medium text-primary"
              >
                <Phone className="h-4 w-4" />
                {CONTACTS.phone}
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
