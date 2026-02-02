import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

let bot = null;

// Инициализация бота с polling для интерактивности
if (token) {
  try {
    bot = new TelegramBot(token, { polling: true });
    console.log('✅ Telegram бот инициализирован (режим polling)');
    
    // Обработка ошибок polling
    bot.on('polling_error', (error) => {
      if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
        console.error('❌ Конфликт: другой экземпляр бота уже запущен. Остановите другие процессы.');
      } else {
        console.error('❌ Ошибка polling:', error.message);
      }
    });
    
    // Обработка команды /start
    bot.onText(/\/start(.*)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const params = match[1].trim();
      
      console.log('🔍 /start получен, параметры:', params);
      
      // Если есть параметр с номером заказа
      if (params) {
        // Убираем префикс "order_" если он есть
        const orderParam = params.replace(/^order_/, '');
        console.log('🔍 Параметр после очистки:', orderParam);
        await handleOrderConfirmation(chatId, orderParam);
      } else {
        // Приветственное сообщение
        const welcomeMessage = 
          '🦜 <b>Добро пожаловать в ПопугайМаркет!</b>\n\n' +
          'Здесь вы можете:\n' +
          '• Подтвердить свой заказ\n' +
          '• Получить информацию о доставке\n' +
          '• Связаться с поддержкой\n\n' +
          'Для подтверждения заказа перейдите по ссылке из письма или с сайта.';
        
        await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' });
      }
    });
    
    // Обработка нажатий на inline-кнопки
    bot.on('callback_query', async (query) => {
      console.log('📱 Получен callback:', query.data);
      
      const chatId = query.message.chat.id;
      const messageId = query.message.message_id;
      const data = query.data;
      
      try {
        if (data.startsWith('confirm_')) {
          const orderId = data.replace('confirm_', '');
          console.log('✅ Подтверждение заказа ID:', orderId);
          await confirmOrder(chatId, messageId, orderId, query.id);
        } else if (data.startsWith('cancel_')) {
          const orderId = data.replace('cancel_', '');
          console.log('❌ Отмена заказа ID:', orderId);
          await cancelOrderRequest(chatId, messageId, orderId, query.id);
        }
      } catch (error) {
        console.error('❌ Ошибка обработки callback:', error);
        await bot.answerCallbackQuery(query.id, { text: 'Произошла ошибка' });
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка инициализации Telegram бота:', error.message);
  }
} else {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN не найден в .env');
}

/**
 * Показывает детали заказа и кнопку подтверждения
 */
async function handleOrderConfirmation(chatId, orderParam) {
  try {
    console.log('🔍 handleOrderConfirmation вызван с параметром:', orderParam);
    
    // Параметр уже очищен от префикса в обработчике /start
    const cleanOrderParam = orderParam;
    console.log('🔍 Ищем заказ по:', cleanOrderParam);
    
    // Ищем заказ по order_number или по id
    let order = db.prepare(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.order_number = ? OR o.id = ?
    `).get(cleanOrderParam, cleanOrderParam);
    
    console.log('📊 Результат поиска:', order ? `Найден заказ #${order.order_number}` : 'Заказ не найден');
    
    if (!order) {
      // Попробуем найти все заказы для отладки
      const allOrders = db.prepare('SELECT id, order_number FROM orders ORDER BY id DESC LIMIT 5').all();
      console.log('📋 Последние 5 заказов в БД:', allOrders);
      
      await bot.sendMessage(
        chatId, 
        '❌ <b>Заказ не найден</b>\n\n' +
        'Проверьте ссылку или обратитесь в поддержку.\n\n' +
        'Возможные причины:\n' +
        '• Заказ еще не создан в системе\n' +
        '• Неверная ссылка\n' +
        '• Технический сбой\n\n' +
        'Напишите нам, и мы поможем!',
        { parse_mode: 'HTML' }
      );
      return;
    }
    
    // Получаем товары заказа
    const items = db.prepare(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);
    
    // Форматируем сообщение
    let message = `🦜 <b>Ваш заказ #${order.order_number}</b>\n\n`;
    message += `👤 <b>Получатель:</b> ${order.customer_name}\n`;
    message += `📱 <b>Телефон:</b> ${order.customer_phone}\n`;
    if (order.customer_email) {
      message += `📧 <b>Email:</b> ${order.customer_email}\n`;
    }
    message += `\n📍 <b>Адрес доставки:</b>\n${order.customer_address || 'Не указан'}\n`;
    
    const paymentMethodNames = {
      'sbp': 'СБП (Система быстрых платежей)',
      'card': 'Оплата картой',
      'manager': 'Обсудить с менеджером',
    };
    message += `\n💳 <b>Способ оплаты:</b> ${paymentMethodNames[order.payment_method] || order.payment_method}\n`;
    
    if (order.comment) {
      message += `\n💬 <b>Комментарий:</b> ${order.comment}\n`;
    }
    
    message += `\n🛒 <b>Товары:</b>\n`;
    items.forEach((item, index) => {
      const price = (item.price / 100).toFixed(2);
      message += `${index + 1}. ${item.product_name || 'Товар'} × ${item.quantity} = ${price}₽\n`;
    });
    
    const total = (order.total / 100).toFixed(2);
    message += `\n💰 <b>ИТОГО: ${total}₽</b>\n\n`;
    
    const statusEmoji = {
      'new': '🆕 Новый',
      'confirmed': '✅ Подтвержден',
      'shipped': '🚚 Отправлен',
      'delivered': '📦 Доставлен',
      'cancelled': '❌ Отменен'
    };
    message += `📊 <b>Статус:</b> ${statusEmoji[order.status] || order.status}`;
    
    // Создаем inline-кнопки
    const keyboard = {
      inline_keyboard: []
    };
    
    if (order.status === 'new') {
      keyboard.inline_keyboard.push([
        { text: '✅ Подтвердить заказ', callback_data: `confirm_${order.id}` }
      ]);
      keyboard.inline_keyboard.push([
        { text: '❌ Отменить заказ', callback_data: `cancel_${order.id}` }
      ]);
    }
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
    
  } catch (error) {
    console.error('Ошибка при обработке заказа:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже или свяжитесь с поддержкой.');
  }
}

/**
 * Подтверждает заказ
 */
async function confirmOrder(chatId, messageId, orderId, queryId) {
  try {
    console.log('🔄 Подтверждение заказа:', { chatId, orderId });
    
    // Получаем информацию о пользователе из callback query
    const chat = await bot.getChat(chatId);
    const telegramUsername = chat.username || null;
    const telegramUserId = String(chatId);
    
    console.log('👤 Telegram данные:', { username: telegramUsername, userId: telegramUserId });
    
    // Обновляем статус заказа и сохраняем Telegram данные
    const result = db.prepare(
      'UPDATE orders SET status = ?, telegram_username = ?, telegram_user_id = ? WHERE id = ?'
    ).run('confirmed', telegramUsername, telegramUserId, orderId);
    console.log('📝 Обновлено строк:', result.changes);
    
    // Получаем информацию о заказе
    const order = db.prepare('SELECT order_number FROM orders WHERE id = ?').get(orderId);
    
    if (!order) {
      console.error('❌ Заказ не найден:', orderId);
      await bot.answerCallbackQuery(queryId, { text: 'Заказ не найден' });
      return;
    }
    
    console.log('📋 Заказ найден:', order.order_number);
    
    // Отправляем уведомление менеджеру
    const managerChatId = process.env.TELEGRAM_CHAT_ID;
    console.log('👤 Chat ID клиента:', chatId, 'Chat ID менеджера:', managerChatId);
    
    if (String(chatId) !== String(managerChatId)) {
      let managerMessage = `✅ <b>Заказ подтвержден клиентом!</b>\n\n📋 Заказ: ${order.order_number}`;
      if (telegramUsername) {
        managerMessage += `\n👤 Telegram: @${telegramUsername}`;
      }
      managerMessage += `\n🆔 User ID: ${telegramUserId}`;
      
      await bot.sendMessage(managerChatId, managerMessage, { parse_mode: 'HTML' });
      console.log('✅ Уведомление отправлено менеджеру');
    }
    
    // Обновляем сообщение
    const confirmMessage = 
      `✅ <b>Заказ подтвержден!</b>\n\n` +
      `Спасибо! Ваш заказ #${order.order_number} подтвержден.\n\n` +
      `Мы свяжемся с вами в ближайшее время для уточнения деталей доставки.\n\n` +
      `Если у вас есть вопросы, напишите нам в этом чате.`;
    
    await bot.editMessageText(confirmMessage, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML'
    });
    
    // Отвечаем на callback query
    await bot.answerCallbackQuery(queryId, { text: 'Заказ подтвержден!' });
    console.log('✅ Заказ успешно подтвержден');
    
  } catch (error) {
    console.error('❌ Ошибка при подтверждении заказа:', error);
    await bot.answerCallbackQuery(queryId, { text: 'Ошибка. Попробуйте позже.' });
  }
}

/**
 * Обрабатывает запрос на отмену заказа
 */
async function cancelOrderRequest(chatId, messageId, orderId, queryId) {
  try {
    console.log('🔄 Отмена заказа:', { chatId, orderId });
    
    // Обновляем статус заказа
    const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', orderId);
    console.log('📝 Обновлено строк:', result.changes);
    
    // Получаем информацию о заказе
    const order = db.prepare('SELECT order_number FROM orders WHERE id = ?').get(orderId);
    
    if (!order) {
      console.error('❌ Заказ не найден:', orderId);
      await bot.answerCallbackQuery(queryId, { text: 'Заказ не найден' });
      return;
    }
    
    // Отправляем уведомление менеджеру
    const managerChatId = process.env.TELEGRAM_CHAT_ID;
    if (String(chatId) !== String(managerChatId)) {
      const managerMessage = `❌ <b>Заказ отменен клиентом</b>\n\n📋 Заказ: ${order.order_number}`;
      await bot.sendMessage(managerChatId, managerMessage, { parse_mode: 'HTML' });
      console.log('✅ Уведомление об отмене отправлено менеджеру');
    }
    
    // Обновляем сообщение
    const cancelMessage = 
      `❌ <b>Заказ отменен</b>\n\n` +
      `Ваш заказ #${order.order_number} отменен.\n\n` +
      `Если вы передумали или это произошло по ошибке, напишите нам в этом чате, и мы поможем оформить новый заказ.`;
    
    await bot.editMessageText(cancelMessage, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML'
    });
    
    // Отвечаем на callback query
    await bot.answerCallbackQuery(queryId, { text: 'Заказ отменен' });
    console.log('✅ Заказ успешно отменен');
    
  } catch (error) {
    console.error('❌ Ошибка при отмене заказа:', error);
    await bot.answerCallbackQuery(queryId, { text: 'Ошибка. Попробуйте позже.' });
  }
}

/**
 * Форматирует сообщение о новом заказе
 */
function formatOrderMessage(orderData) {
  const { order_number, customer_name, customer_phone, customer_email, delivery_method, address, comment, payment_method, items, total } = orderData;
  
  // Преобразуем код способа оплаты в читаемый текст
  const paymentMethodNames = {
    'sbp': '💳 СБП (Система быстрых платежей)',
    'card': '💳 Оплата картой',
    'manager': '💬 Обсудить с менеджером',
  };
  
  let message = `🦜 <b>НОВЫЙ ЗАКАЗ!</b>\n\n`;
  message += `📋 <b>Номер заказа:</b> ${order_number}\n\n`;
  
  message += `👤 <b>Клиент:</b>\n`;
  message += `   Имя: ${customer_name}\n`;
  message += `   Телефон: ${customer_phone}\n`;
  if (customer_email) {
    message += `   Email: ${customer_email}\n`;
  }
  
  message += `\n📦 <b>Доставка:</b> ${delivery_method || 'Доставка'}\n`;
  if (address) {
    message += `📍 <b>Адрес:</b> ${address}\n`;
  }
  
  if (payment_method) {
    message += `\n${paymentMethodNames[payment_method] || `💰 ${payment_method}`}\n`;
  }
  
  if (comment) {
    message += `\n💬 <b>Комментарий:</b> ${comment}\n`;
  }
  
  message += `\n🛒 <b>Товары:</b>\n`;
  items.forEach((item, index) => {
    // Получаем название товара из базы данных
    const product = db.prepare('SELECT name FROM products WHERE id = ?').get(item.id);
    const productName = product ? product.name : 'Товар';
    const price = (item.price / 100).toFixed(0);
    
    message += `   ${index + 1}. ${productName} × ${item.quantity} = ${price}₽\n`;
  });
  
  const totalFormatted = (total / 100).toFixed(0);
  message += `\n💰 <b>ИТОГО: ${totalFormatted}₽</b>`;
  
  return message;
}

/**
 * Отправляет уведомление о новом заказе в Telegram
 */
export async function sendOrderNotification(orderData) {
  if (!bot || !chatId) {
    console.warn('⚠️ Telegram бот не настроен, уведомление не отправлено');
    return { success: false, error: 'Bot not configured' };
  }
  
  try {
    const message = formatOrderMessage(orderData);
    
    // Создаем inline-кнопку для подтверждения заказа
    const keyboard = {
      inline_keyboard: [
        [
          { 
            text: '✅ Подтвердить заказ', 
            callback_data: `confirm_${orderData.orderId}` 
          }
        ],
        [
          { 
            text: '❌ Отменить заказ', 
            callback_data: `cancel_${orderData.orderId}` 
          }
        ]
      ]
    };
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: keyboard
    });
    
    console.log('✅ Уведомление отправлено в Telegram с кнопками подтверждения');
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка отправки в Telegram:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Отправляет общее уведомление в Telegram
 */
export async function sendTelegramNotification(message) {
  if (!bot || !chatId) {
    console.warn('⚠️ Telegram бот не настроен, уведомление не отправлено');
    return { success: false, error: 'Bot not configured' };
  }
  
  try {
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    
    console.log('✅ Уведомление отправлено в Telegram');
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка отправки в Telegram:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Отправляет уведомление об изменении статуса заказа
 */
export async function sendStatusUpdateNotification(orderNumber, oldStatus, newStatus) {
  if (!bot || !chatId) {
    return { success: false, error: 'Bot not configured' };
  }
  
  try {
    const statusEmoji = {
      'new': '🆕',
      'confirmed': '✅',
      'shipped': '🚚',
      'delivered': '📦',
      'cancelled': '❌'
    };
    
    const statusNames = {
      'new': 'Новый',
      'confirmed': 'Подтвержден',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    
    const message = `${statusEmoji[newStatus]} <b>Статус заказа изменен</b>\n\n` +
                   `📋 Заказ: ${orderNumber}\n` +
                   `Было: ${statusNames[oldStatus] || oldStatus}\n` +
                   `Стало: <b>${statusNames[newStatus] || newStatus}</b>`;
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML'
    });
    
    console.log('✅ Уведомление об изменении статуса отправлено');
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка отправки уведомления о статусе:', error.message);
    return { success: false, error: error.message };
  }
}

export default bot;
