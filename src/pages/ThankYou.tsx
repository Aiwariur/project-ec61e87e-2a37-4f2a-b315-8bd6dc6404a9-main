import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageCircle, Home } from 'lucide-react';

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');

  useEffect(() => {
    // Если нет номера заказа, редиректим на главную
    if (!orderNumber) {
      navigate('/', { replace: true });
    }
  }, [orderNumber, navigate]);

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
              <div className="space-y-3">
                <h2 className="font-semibold text-lg text-foreground">
                  Подтвердите заказ в Telegram
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Мы отправили уведомление о вашем заказе в Telegram. 
                  <strong className="text-foreground"> Пожалуйста, нажмите кнопку "✅ Подтвердить заказ"</strong> в сообщении, 
                  чтобы мы могли оперативно с вами связаться.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Telegram — это единственный стабильный канал связи с нашей компанией в РФ. 
                  После подтверждения мы сможем обсудить детали доставки напрямую.
                </p>
              </div>
            </div>
          </div>

          {/* Инструкция */}
          <div className="bg-muted/50 rounded-lg p-6 text-left space-y-3">
            <h3 className="font-semibold text-foreground">Что делать дальше:</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Откройте Telegram и найдите сообщение от нашего бота</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Нажмите кнопку "✅ Подтвердить заказ"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Ожидайте сообщения от менеджера для уточнения деталей</span>
              </li>
            </ol>
          </div>

          {/* Дополнительная информация */}
          <div className="pt-6 border-t border-border space-y-3">
            <p className="text-sm text-muted-foreground">
              Если вы не получили сообщение в Telegram, проверьте настройки приватности 
              или свяжитесь с нами по телефону.
            </p>
            <p className="text-sm text-muted-foreground">
              Мы также отправили подтверждение на указанный email (если вы его указали).
            </p>
          </div>

          {/* Кнопка возврата */}
          <div className="pt-4">
            <Button
              onClick={() => navigate('/')}
              className="w-full md:w-auto"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
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
