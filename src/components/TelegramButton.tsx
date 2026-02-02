import { MessageCircle } from 'lucide-react';

const TelegramButton = () => {
  return (
    <a
      href="https://t.me/kakadu_shop"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#0088cc] hover:bg-[#006699] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
      aria-label="Написать в Telegram"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Написать в Telegram
      </span>
    </a>
  );
};

export default TelegramButton;
