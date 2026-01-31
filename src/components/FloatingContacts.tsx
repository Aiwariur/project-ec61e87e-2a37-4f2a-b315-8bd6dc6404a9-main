import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CONTACTS } from '@/config/contacts';

const FloatingContacts = () => {
  const whatsappUrl = `https://wa.me/${CONTACTS.whatsapp}?text=${encodeURIComponent('Здравствуйте! Интересуют попугаи с вашего сайта.')}`;
  const telegramUrl = `https://t.me/${CONTACTS.telegram}`;

  return (
    <TooltipProvider>
      {/* Десктопная версия - справа, выше корзины */}
      <div className="hidden md:flex fixed bottom-[180px] right-8 z-40 flex-col gap-3 animate-in slide-in-from-right-4 fade-in">
        {/* WhatsApp кнопка */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300
                         bg-[#25D366] hover:bg-[#20BA5A] text-white"
              asChild
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать в WhatsApp"
              >
                <MessageCircle className="h-6 w-6" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Написать в WhatsApp</p>
          </TooltipContent>
        </Tooltip>

        {/* Telegram кнопка */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300
                         bg-[#0088cc] hover:bg-[#006699] text-white"
              asChild
            >
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать в Telegram"
              >
                <Send className="h-6 w-6" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Написать в Telegram</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Мобильная версия - справа, выше корзины */}
      <div className="md:hidden fixed bottom-[100px] right-4 z-40 flex flex-col gap-3 animate-in slide-in-from-right-4 fade-in">
        {/* WhatsApp кнопка */}
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300
                     bg-[#25D366] hover:bg-[#20BA5A] text-white"
          asChild
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написать в WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        </Button>

        {/* Telegram кнопка */}
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300
                     bg-[#0088cc] hover:bg-[#006699] text-white"
          asChild
        >
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написать в Telegram"
          >
            <Send className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </TooltipProvider>
  );
};

export default FloatingContacts;
