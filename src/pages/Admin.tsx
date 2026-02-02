import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  delivery_method?: string;
  payment_method?: string;
  comment?: string;
  total: number;
  status: string;
  telegram_username?: string;
  telegram_user_id?: string;
  created_at: number;
  items: OrderItem[];
}

const Admin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ru-RU');
  };

  const getPaymentMethodName = (method?: string) => {
    const names: Record<string, string> = {
      'sbp': 'СБП (Система быстрых платежей)',
      'card': 'Оплата картой',
      'manager': 'Обсудить с менеджером',
    };
    return method ? (names[method] || method) : 'Не указан';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedOrder(null)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к заказам
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Заказ {selectedOrder.order_number}</CardTitle>
                <Select value={selectedOrder.status} onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Новый</SelectItem>
                    <SelectItem value="confirmed">Подтвержден</SelectItem>
                    <SelectItem value="shipped">Отправлен</SelectItem>
                    <SelectItem value="delivered">Доставлен</SelectItem>
                    <SelectItem value="cancelled">Отменен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3">Информация о клиенте</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Имя</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Телефон</p>
                    <p className="font-medium">{selectedOrder.customer_phone}</p>
                  </div>
                  {selectedOrder.customer_email && (
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedOrder.customer_email}</p>
                    </div>
                  )}
                  {selectedOrder.telegram_username && (
                    <div>
                      <p className="text-muted-foreground">Telegram</p>
                      <p className="font-medium">@{selectedOrder.telegram_username}</p>
                    </div>
                  )}
                </div>
                
                {/* Telegram Actions */}
                {selectedOrder.telegram_user_id && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://t.me/${selectedOrder.telegram_username || selectedOrder.telegram_user_id}`, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Написать в Telegram
                    </Button>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              {(selectedOrder.delivery_method || selectedOrder.customer_address || selectedOrder.payment_method) && (
                <div>
                  <h3 className="font-semibold mb-3">Доставка и оплата</h3>
                  <div className="space-y-2 text-sm">
                    {selectedOrder.delivery_method && (
                      <div>
                        <p className="text-muted-foreground">Способ доставки</p>
                        <p className="font-medium">{selectedOrder.delivery_method}</p>
                      </div>
                    )}
                    {selectedOrder.customer_address && (
                      <div>
                        <p className="text-muted-foreground">Адрес</p>
                        <p className="font-medium">{selectedOrder.customer_address}</p>
                      </div>
                    )}
                    {selectedOrder.payment_method && (
                      <div>
                        <p className="text-muted-foreground">Способ оплаты</p>
                        <p className="font-medium">{getPaymentMethodName(selectedOrder.payment_method)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Товары ({selectedOrder.items.length})</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">Количество: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Comment */}
              {selectedOrder.comment && (
                <div>
                  <h3 className="font-semibold mb-2">Комментарий</h3>
                  <p className="text-sm text-muted-foreground">{selectedOrder.comment}</p>
                </div>
              )}

              {/* Meta */}
              <div className="text-xs text-muted-foreground">
                <p>Создан: {formatDate(selectedOrder.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Админка - Заказы</h1>
          <p className="text-muted-foreground mt-2">Всего заказов: {orders.length}</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Заказов нет</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedOrder(order)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{order.order_number}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        {order.telegram_username && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            @{order.telegram_username}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {order.customer_name} • {order.customer_phone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)} • {order.items.length} товаров
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
