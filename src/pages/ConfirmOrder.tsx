import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const ConfirmOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [status, setStatus] = useState<'loading' | 'waiting' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
  const telegramLink = orderNumber && botUsername
    ? `https://t.me/${botUsername}?start=order_${orderNumber}`
    : null;

  useEffect(() => {
    if (!orderNumber) {
      navigate('/', { replace: true });
      return;
    }

    let isActive = true;
    let pollTimer = null;

    // Проверяем статус заказа, потому что подтверждение теперь происходит в Telegram.
    const checkOrderStatus = async (showLoader) => {
      try {
        if (!isActive) {
          return;
        }
        if (showLoader) {
          setStatus('loading');
        }

        const response = await fetch(`/api/orders/by-number/${orderNumber}`);

        if (!response.ok) {
          if (!isActive) {
            return;
          }
          setStatus('error');
          setMessage('Не удалось получить статус заказа');
          return;
        }

        const data = await response.json();

        if (data.status === 'confirmed') {
          if (!isActive) {
            return;
          }
          setStatus('success');
          setMessage('Заказ успешно подтвержден в Telegram!');
          return;
        }

        if (data.status === 'cancelled') {
          if (!isActive) {
            return;
          }
          setStatus('error');
          setMessage('Заказ был отменен');
          return;
        }

        if (!isActive) {
          return;
        }
        setStatus('waiting');
        setMessage('Ожидаем подтверждение в Telegram...');
      } catch (error) {
        if (!isActive) {
          return;
        }
        setStatus('error');
        setMessage('Ошибка подключения к серверу');
      }
    };

    // Polling нужен для обновления статуса без ручного перезахода пользователя.
    const startPolling = async () => {
      await checkOrderStatus(true);
      if (!isActive) {
        return;
      }
      pollTimer = window.setInterval(() => {
        checkOrderStatus(false);
      }, 5000);
    };

    startPolling();

    return () => {
      isActive = false;
      if (pollTimer) {
        window.clearInterval(pollTimer);
      }
    };
  }, [orderNumber, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 text-center space-y-6">
          {status === 'loading' && (
            <>
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Подтверждаем заказ...
              </h1>
            </>
          )}

          {status === 'waiting' && (
            <>
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Ожидаем подтверждение...
              </h1>
              <p className="text-muted-foreground">{message}</p>
              {telegramLink && (
                <div className="pt-4">
                  <Button onClick={() => window.open(telegramLink, '_blank', 'noopener,noreferrer')}>
                    Открыть Telegram
                  </Button>
                </div>
              )}
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4">
                  <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Заказ подтвержден!
              </h1>
              <p className="text-muted-foreground">
                Номер заказа: <span className="font-semibold text-foreground">#{orderNumber}</span>
              </p>
              <p className="text-muted-foreground">{message}</p>
              <div className="pt-4">
                <Button onClick={() => navigate('/')}>
                  Вернуться на главную
                </Button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4">
                  <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Ошибка
              </h1>
              <p className="text-muted-foreground">{message}</p>
              <div className="pt-4 space-x-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Попробовать снова
                </Button>
                <Button onClick={() => navigate('/')}>
                  Вернуться на главную
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrder;
