import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const ConfirmOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!orderNumber) {
      navigate('/', { replace: true });
      return;
    }

    // Подтверждаем заказ через API
    const confirmOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderNumber}/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegram_username: 'web_user',
            telegram_user_id: Date.now().toString(),
          }),
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Заказ успешно подтвержден!');
        } else {
          const data = await response.json();
          setStatus('error');
          setMessage(data.error || 'Не удалось подтвердить заказ');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Ошибка подключения к серверу');
      }
    };

    confirmOrder();
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
