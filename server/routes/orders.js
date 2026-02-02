import express from 'express';
import db from '../db.js';
import { sendOrderNotification, sendStatusUpdateNotification } from '../telegram.js';

const router = express.Router();

/**
 * Получить все заказы (для админки)
 */
router.get('/', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `).all();
    
    // Получаем товары для каждого заказа
    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, p.name as product_name, p.image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);
      
      return {
        ...order,
        items
      };
    });
    
    res.json(ordersWithItems);
  } catch (error) {
    console.error('❌ Ошибка получения заказов:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Создать новый заказ
 */
router.post('/', async (req, res) => {
  try {
    const { 
      customer_name, 
      customer_phone, 
      customer_email, 
      delivery_method, 
      address, 
      comment, 
      payment_method, 
      items, 
      total 
    } = req.body;
    
    // Валидация обязательных полей
    if (!customer_name || !customer_phone || !items || items.length === 0 || !total) {
      return res.status(400).json({ 
        error: 'Не заполнены обязательные поля',
        details: {
          customer_name: !!customer_name,
          customer_phone: !!customer_phone,
          items: items?.length > 0,
          total: !!total
        }
      });
    }
    
    const now = Math.floor(Date.now() / 1000);
    const order_number = 'ORD-' + Date.now();
    
    // Транзакция для создания заказа
    const createOrder = db.transaction(() => {
      // 1. Создаем или обновляем клиента
      let customer = db.prepare('SELECT id FROM customers WHERE phone = ?').get(customer_phone);
      
      let customerId;
      if (customer) {
        // Обновляем существующего клиента
        db.prepare(`
          UPDATE customers 
          SET name = ?, email = ?, address = ?, updated_at = ?
          WHERE id = ?
        `).run(customer_name, customer_email || null, address || null, now, customer.id);
        customerId = customer.id;
      } else {
        // Создаем нового клиента
        const result = db.prepare(`
          INSERT INTO customers (name, phone, email, address, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(customer_name, customer_phone, customer_email || null, address || null, now, now);
        customerId = result.lastInsertRowid;
      }
      
      // 2. Создаем заказ
      const orderResult = db.prepare(`
        INSERT INTO orders (
          order_number, 
          customer_id, 
          delivery_method, 
          comment, 
          payment_method, 
          total, 
          status, 
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        order_number,
        customerId,
        delivery_method || 'Доставка',
        comment || null,
        payment_method || 'Не указан',
        total,
        'new',
        now
      );
      
      const orderId = orderResult.lastInsertRowid;
      
      // 3. Добавляем товары в заказ
      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const item of items) {
        const product = db.prepare('SELECT name FROM products WHERE id = ?').get(item.id);
        const productName = product ? product.name : 'Товар';
        insertItem.run(orderId, item.id, productName, item.quantity, item.price);
      }
      
      return { orderId, order_number, customerId };
    });
    
    const result = createOrder();
    
    console.log('✅ Заказ создан:', result.order_number);
    
    // Отправляем уведомление в Telegram (асинхронно)
    sendOrderNotification({
      order_number: result.order_number,
      customer_name,
      customer_phone,
      customer_email,
      delivery_method,
      address,
      comment,
      payment_method,
      items,
      total
    }).catch(err => {
      console.error('⚠️ Не удалось отправить уведомление в Telegram:', err);
    });
    
    res.status(201).json({ 
      success: true,
      id: result.orderId, 
      order_number: result.order_number,
      message: 'Заказ успешно создан' 
    });
    
  } catch (error) {
    console.error('❌ Ошибка создания заказа:', error);
    res.status(500).json({ 
      error: 'Ошибка при создании заказа',
      details: error.message 
    });
  }
});

/**
 * Получить заказ по ID
 */
router.get('/:id', (req, res) => {
  try {
    const order = db.prepare(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `).get(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    const items = db.prepare(`
      SELECT oi.*, p.name as product_name, p.image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(req.params.id);
    
    res.json({ ...order, items });
  } catch (error) {
    console.error('❌ Ошибка получения заказа:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Обновить статус заказа (для админки)
 */
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Статус обязателен' });
    }
    
    // Получаем текущий заказ
    const order = db.prepare('SELECT order_number, status FROM orders WHERE id = ?').get(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    const oldStatus = order.status;
    
    // Обновляем статус
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    
    console.log('✅ Статус заказа обновлен:', order.order_number, oldStatus, '->', status);
    
    // Отправляем уведомление об изменении статуса
    if (oldStatus !== status) {
      sendStatusUpdateNotification(order.order_number, oldStatus, status).catch(err => {
        console.error('⚠️ Не удалось отправить уведомление о статусе:', err);
      });
    }
    
    res.json({ 
      success: true,
      message: 'Статус заказа обновлен' 
    });
    
  } catch (error) {
    console.error('❌ Ошибка обновления статуса:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
