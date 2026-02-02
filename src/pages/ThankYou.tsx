import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageCircle } from 'lucide-react';

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;

  useEffect(() => {
    // Если нет номера заказа, редиректим на главную
    if (!orderNumber) {
      navigate('/', { replace: true });
    }
  }, [orderNumber, navigate]);

  // Ссылка на Telegram бота: подтверждение происходит в чате, а не на сайте.
  const telegramLink = orderNumber && botUsername
    ? `https://t.me/${botUsername}?start=order_${orderNumber}`
    : null;

  // Fallback на страницу ожидания, если Telegram не задан или не открылся.
  const confirmLink = orderNumber
    ? `/confirm-order?order=${orderNumber}`
    : '/';

  const handleConfirmClick = () => {
    if (telegramLink) {
      window.open(telegramLink, '_blank', 'noopener,noreferrer');
    }
    navigate(confirmLink);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 text-center space-y-6">
          {/* Иконка успеха */}
          <div className="flex justify-center">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4">
              <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Заголовок */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Спасибо за заказ!
            </h1>
            {orderNumber && (
              <p className="text-muted-foreground">
                Номер заказа: <span className="font-semibold text-foreground">#{orderNumber}</span>
              </p>
            )}
          </div>

          {/* Основное сообщение */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3 text-left">
              <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h2 className="font-semibold text-lg text-foreground">
                  Важная информация о связи
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  В связи с тем, что в РФ периодически блокируются различные каналы связи через интернет, 
                  <strong className="text-foreground"> Telegram является единственным стабильным каналом связи</strong> с нашей компанией.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Пожалуйста, подтвердите ваш заказ в Telegram, чтобы мы могли оперативно с вами связаться 
                  и обсудить детали доставки.
                </p>
              </div>
            </div>
          </div>

          {/* Кнопка подтверждения */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full md:w-auto px-8 py-6 text-lg font-semibold"
              onClick={handleConfirmClick}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Подтвердить заказ
            </Button>
            <p className="text-xs text-muted-foreground">
              Нажмите кнопку, чтобы подтвердить ваш заказ
            </p>
          </div>

          {/* Дополнительная информация */}
          <div className="pt-6 border-t border-border space-y-3">
            <p className="text-sm text-muted-foreground">
              Мы также отправили подтверждение на указанный вами email.
            </p>
            <p className="text-sm text-muted-foreground">
              Если у вас возникли вопросы, вы можете связаться с нами через Telegram.
            </p>
          </div>

          {/* Кнопка возврата */}
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full md:w-auto"
            >
              Вернуться на главную
            </Button>
          </div>
        </div>

        {/* Дополнительный блок с преимуществами */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-card/50 rounded-lg p-4">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-sm font-medium">Безопасная оплата</p>
          </div>
          <div className="bg-card/50 rounded-lg p-4">
            <div className="text-2xl mb-2">🚚</div>
            <p className="text-sm font-medium">Быстрая доставка</p>
          </div>
          <div className="bg-card/50 rounded-lg p-4">
            <div className="text-2xl mb-2">💬</div>
            <p className="text-sm font-medium">Поддержка 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
