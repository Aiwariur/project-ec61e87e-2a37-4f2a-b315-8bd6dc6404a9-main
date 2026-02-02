import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const isProduction = process.env.NODE_ENV === 'production';
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL; // Например: https://yourdomain.com/telegram-webhook

let bot = null;

// Инициализация бота
if (token) {
  try {
    if (isProduction && webhookUrl) {
      // Production: используем webhook
      bot = new TelegramBot(token, { 
        webHook: {
          port: process.env.TELEGRAM_WEBHOOK_PORT || 3001
        }
      });
      
      // Устанавливаем webhook
      bot.setWebHook(`${webhookUrl}/telegram-webhook`)
        .then(() => {
          console.log('✅ Telegram webhook установлен:', webhookUrl);
        })
        .catch(err => {
          console.error('❌ Ошибка установки webhook:', err.message);
        });
      
    } else {
      // Development: используем polling
      bot = new TelegramBot(token, { 
        polling: {
          interval: 300,
          autoStart: true,
          params: {
            timeout: 10
          }
        }
      });
      console.log('✅ Telegram бот запущен (polling mode)');
    }
    
    // Обработка команды /start
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, 
        '🦜 Добро пожаловать в ПопугайМаркет!\n\n' +
        'Здесь вы будете получать уведомления о ваших заказах.\n\n' +
        'Ваш Chat ID: ' + chatId
      );
    });
    
    // Обработка callback-ов от inline кнопок
    bot.on('callback_query', async (callbackQuery) => {
      const msg = callbackQuery.message;
      const data = callbackQuery.data;
      const userId = callbackQuery.from.id;
      const username = callbackQuery.from.username;
      const firstName = callbackQuery.from.first_name;
      const lastName = callbackQuery.from.last_name;
      
      console.log('📩 Получен callback:', data);
      
      // Обработка подтверждения заказа
      if (data.startsWith('confirm_order_')) {
        const orderNumber = data.replace('confirm_order_', '');
        
        try {
          // Находим заказ в БД
          const order = db.prepare('SELECT id, status FROM orders WHERE order_number = ?').get(orderNumber);
          
          if (!order) {
            await bot.answerCallbackQuery(callbackQuery.id, {
              text: '❌ Заказ не найден',
              show_alert: true
            });
            return;
          }
          
          // Проверяем, не подтвержден ли уже
          if (order.status === 'confirmed') {
            await bot.answerCallbackQuery(callbackQuery.id, {
              text: '✅ Заказ уже подтвержден',
              show_alert: false
            });
            return;
          }
          
          // Обновляем заказ
          db.prepare(`
            UPDATE orders 
            SET status = 'confirmed',
                telegram_username = ?,
                telegram_user_id = ?
            WHERE id = ?
          `).run(username || null, userId.toString(), order.id);
          
          // Формируем имя клиента
          const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Клиент';
          
          // Отвечаем на callback
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '✅ Заказ подтвержден!',
            show_alert: false
          });
          
          // Обновляем сообщение - убираем кнопку и добавляем статус
          const originalText = msg.text;
          const updatedText = originalText + 
            '\n\n✅ <b>ЗАКАЗ ПОДТВЕРЖДЕН</b>' +
            '\n👤 Клиент: ' + fullName +
            (username ? '\n📱 Telegram: @' + username : '') +
            '\n🆔 User ID: ' + userId;
          
          await bot.editMessageText(updatedText, {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            parse_mode: 'HTML'
          });
          
          // Отправляем уведомление менеджеру
          await bot.sendMessage(chatId, 
            '🎉 <b>Заказ подтвержден клиентом!</b>\n\n' +
            '📋 Номер: ' + orderNumber + '\n' +
            '👤 Клиент: ' + fullName + '\n' +
            (username ? '📱 Telegram: @' + username + '\n' : '') +
            '🆔 User ID: ' + userId + '\n\n' +
            '💬 Теперь вы можете написать клиенту напрямую в Telegram!',
            { parse_mode: 'HTML' }
          );
          
          console.log('✅ Заказ подтвержден:', orderNumber);
          
        } catch (error) {
          console.error('❌ Ошибка подтверждения заказа:', error);
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Ошибка подтверждения',
            show_alert: true
          });
        }
      }
    });
    
    // Обработка ошибок
    bot.on('polling_error', (error) => {
      console.error('⚠️ Telegram polling error:', error.message);
    });
    
    bot.on('webhook_error', (error) => {
      console.error('⚠️ Telegram webhook error:', error.message);
    });
    
  } catch (error) {
    console.error('❌ Ошибка инициализации Telegram:', error.message);
  }
} else {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN не найден в .env');
}

/**
 * Отправляет уведомление о новом заказе с кнопкой подтверждения
 */
export async function sendOrderNotification(orderData) {
  if (!bot || !chatId) {
    console.warn('⚠️ Telegram не настроен');
    return { success: false, error: 'Telegram не настроен' };
  }
  
  try {
    const { order_number, customer_name, customer_phone, customer_email, items, total, delivery_method, comment } = orderData;
    
    // Формируем сообщение
    let message = '🦜 <b>НОВЫЙ ЗАКАЗ!</b>\n\n';
    message += '📋 <b>Номер:</b> ' + order_number + '\n';
    message += '👤 <b>Клиент:</b> ' + customer_name + '\n';
    message += '📱 <b>Телефон:</b> ' + customer_phone + '\n';
    if (customer_email) {
      message += '📧 <b>Email:</b> ' + customer_email + '\n';
    }
    message += '🚚 <b>Доставка:</b> ' + (delivery_method || 'Не указана') + '\n';
    
    if (comment) {
      message += '💬 <b>Комментарий:</b> ' + comment + '\n';
    }
    
    message += '\n🛒 <b>Товары:</b>\n';
    
    // Добавляем товары
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = db.prepare('SELECT name FROM products WHERE id = ?').get(item.id);
      const name = product ? product.name : 'Товар';
      const price = (item.price / 100).toFixed(0);
      const itemTotal = ((item.price * item.quantity) / 100).toFixed(0);
      message += (i + 1) + '. ' + name + ' × ' + item.quantity + ' = ' + itemTotal + ' ₽\n';
    }
    
    const totalPrice = (total / 100).toFixed(0);
    message += '\n💰 <b>ИТОГО: ' + totalPrice + ' ₽</b>';
    
    // Inline кнопка для подтверждения
    const keyboard = {
      inline_keyboard: [[
        {
          text: '✅ Подтвердить заказ',
          callback_data: 'confirm_order_' + order_number
        }
      ]]
    };
    
    // Отправляем сообщение
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
    
    console.log('✅ Уведомление о заказе отправлено:', order_number);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Ошибка отправки уведомления:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Отправляет уведомление об изменении статуса заказа
 */
export async function sendStatusUpdateNotification(orderNumber, oldStatus, newStatus) {
  if (!bot || !chatId) {
    return { success: false };
  }
  
  try {
    const statusNames = {
      'new': 'Новый',
      'confirmed': 'Подтвержден',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    
    const message = '📊 <b>Статус заказа изменен</b>\n\n' +
                   '📋 Заказ: ' + orderNumber + '\n' +
                   'Было: ' + statusNames[oldStatus] + '\n' +
                   'Стало: <b>' + statusNames[newStatus] + '</b>';
    
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    
    console.log('✅ Уведомление о статусе отправлено:', orderNumber);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Ошибка отправки уведомления о статусе:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Express middleware для обработки webhook
 */
export function getTelegramWebhookHandler() {
  if (!bot) {
    return (req, res) => res.sendStatus(404);
  }
  return (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  };
}

export default bot;
