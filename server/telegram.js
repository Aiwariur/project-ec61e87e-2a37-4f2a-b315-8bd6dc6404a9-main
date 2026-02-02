import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const appUrl = process.env.APP_URL;
const webhookSecret = token ? encodeURIComponent(token) : '';
const webhookPath = `/api/telegram/webhook/${webhookSecret}`;

let bot = null;
let handlersRegistered = false;
let currentMode = 'disabled';

/**
 * Инициализирует Telegram-бота и настраивает обработчики.
 * Почему так: в production обычно нужен webhook, а локально проще polling.
 * Edge case: если бот уже инициализирован, повторно не создаем экземпляр.
 */
export function initTelegram(app = null) {
  if (!token) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN не найден');
    currentMode = 'disabled';
    return { bot: null, mode: currentMode };
  }

  if (bot) {
    return { bot, mode: currentMode };
  }

  try {
    if (appUrl) {
      // Webhook-режим для production: Telegram сам доставляет обновления на наш сервер.
      bot = new TelegramBot(token, { polling: false });
      currentMode = 'webhook';
      const webhookUrl = `${appUrl}${webhookPath}`;
      bot.setWebHook(webhookUrl).catch((error) => {
        console.error('❌ Ошибка установки Telegram webhook:', error.message);
      });

      if (app) {
        // Обработчик вебхука должен принимать JSON, поэтому используем express.json() в index.js.
        app.post(webhookPath, (req, res) => {
          try {
            bot.processUpdate(req.body);
            res.sendStatus(200);
          } catch (error) {
            console.error('❌ Ошибка обработки Telegram webhook:', error.message);
            res.sendStatus(500);
          }
        });
      }
    } else {
      // Polling-режим для разработки: не требует публичного URL.
      bot = new TelegramBot(token, { polling: true });
      currentMode = 'polling';
    }

    registerHandlers();
    console.log(`✅ Telegram бот инициализирован (${currentMode})`);
  } catch (error) {
    console.error('❌ Ошибка инициализации Telegram:', error.message);
    currentMode = 'disabled';
  }

  return { bot, mode: currentMode };
}

/**
 * Отправляет уведомление о новом заказе
 */
export async function sendOrderNotification(orderData) {
  if (!bot || !chatId) {
    console.warn('⚠️ Telegram не настроен');
    return { success: false };
  }
  
  try {
    const { order_number, customer_name, customer_phone, items, total } = orderData;
    
    let message = `🦜 <b>НОВЫЙ ЗАКАЗ!</b>\n\n`;
    message += `📋 <b>Номер:</b> ${order_number}\n`;
    message += `👤 <b>Клиент:</b> ${customer_name}\n`;
    message += `📱 <b>Телефон:</b> ${customer_phone}\n\n`;
    message += `🛒 <b>Товары:</b>\n`;
    
    items.forEach((item, i) => {
      const product = db.prepare('SELECT name FROM products WHERE id = ?').get(item.id);
      const name = product ? product.name : 'Товар';
      const price = (item.price / 100).toFixed(0);
      message += `${i + 1}. ${name} × ${item.quantity} = ${price}₽\n`;
    });
    
    const totalPrice = (total / 100).toFixed(0);
    message += `\n💰 <b>ИТОГО: ${totalPrice}₽</b>`;
    
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    
    console.log('✅ Уведомление отправлено в Telegram');
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка отправки в Telegram:', error.message);
    return { success: false };
  }
}

/**
 * Отправляет простое уведомление в Telegram (например, заявки на консультацию).
 * Почему так: контактный роут ожидает универсальную функцию без привязки к заказу.
 */
export async function sendTelegramNotification(message, options = {}) {
  if (!bot || !chatId) {
    console.warn('⚠️ Telegram не настроен');
    return { success: false };
  }

  try {
    await bot.sendMessage(chatId, message, {
      parse_mode: options.parse_mode || 'Markdown',
      disable_web_page_preview: true,
      ...options
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка отправки уведомления:', error.message);
    return { success: false };
  }
}

/**
 * Отправляет уведомление об изменении статуса
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
    
    const message = `📊 <b>Статус заказа изменен</b>\n\n` +
                   `📋 Заказ: ${orderNumber}\n` +
                   `Было: ${statusNames[oldStatus]}\n` +
                   `Стало: <b>${statusNames[newStatus]}</b>`;
    
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка отправки уведомления:', error.message);
    return { success: false };
  }
}

/**
 * Регистрирует обработчики бота.
 * Что делает: принимает /start с параметром заказа и обрабатывает подтверждение через кнопки.
 * Почему так: это единственная надежная точка связи клиента через Telegram.
 */
function registerHandlers() {
  if (!bot || handlersRegistered) {
    return;
  }

  handlersRegistered = true;

  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const payload = match?.[1] || '';
    const orderNumber = payload.startsWith('order_') ? payload.replace('order_', '') : null;

    if (!orderNumber) {
      await bot.sendMessage(
        msg.chat.id,
        'Привет! Для подтверждения заказа откройте ссылку из сайта.',
        { disable_web_page_preview: true }
      );
      return;
    }

    const order = db.prepare(`
      SELECT o.id, o.order_number, o.status, o.total,
             c.name as customer_name, c.phone as customer_phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.order_number = ?
    `).get(orderNumber);

    if (!order) {
      await bot.sendMessage(msg.chat.id, `Заказ ${orderNumber} не найден.`);
      return;
    }

    const items = db.prepare(`
      SELECT product_name, quantity, price
      FROM order_items
      WHERE order_id = ?
    `).all(order.id);

    const totalPrice = (order.total / 100).toFixed(0);
    let message = `🦜 <b>Подтверждение заказа</b>\n\n`;
    message += `📋 <b>Номер:</b> ${order.order_number}\n`;
    message += `👤 <b>Клиент:</b> ${order.customer_name}\n`;
    message += `📱 <b>Телефон:</b> ${order.customer_phone}\n\n`;
    message += `🛒 <b>Товары:</b>\n`;

    items.forEach((item, index) => {
      const price = (item.price / 100).toFixed(0);
      message += `${index + 1}. ${item.product_name} × ${item.quantity} = ${price}₽\n`;
    });

    message += `\n💰 <b>ИТОГО: ${totalPrice}₽</b>\n`;
    message += `\nСтатус: <b>${order.status}</b>`;

    // Кнопки нужны, чтобы подтвердить заказ прямо в чате без ручного ввода данных.
    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Подтвердить', callback_data: `confirm:${order.order_number}` },
          { text: '❌ Отменить', callback_data: `cancel:${order.order_number}` }
        ]
      ]
    };

    await bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML', reply_markup: keyboard });
  });

  bot.on('callback_query', async (query) => {
    const data = query.data || '';
    const [action, orderNumber] = data.split(':');

    if (!orderNumber) {
      await bot.answerCallbackQuery(query.id, { text: 'Некорректные данные запроса.' });
      return;
    }

    const order = db.prepare('SELECT id, status, order_number FROM orders WHERE order_number = ?').get(orderNumber);

    if (!order) {
      await bot.answerCallbackQuery(query.id, { text: 'Заказ не найден.' });
      return;
    }

    if (action === 'confirm') {
      if (order.status === 'confirmed') {
        await bot.answerCallbackQuery(query.id, { text: 'Заказ уже подтвержден.' });
        return;
      }
      if (order.status === 'cancelled') {
        await bot.answerCallbackQuery(query.id, { text: 'Заказ уже отменен.' });
        return;
      }

      // Сохраняем Telegram-данные клиента для связи и обновляем статус.
      db.prepare(`
        UPDATE orders
        SET status = 'confirmed',
            telegram_username = ?,
            telegram_user_id = ?
        WHERE id = ?
      `).run(query.from.username || null, String(query.from.id || ''), order.id);

      await bot.answerCallbackQuery(query.id, { text: 'Заказ подтвержден.' });
      await bot.sendMessage(query.message.chat.id, `✅ Заказ ${order.order_number} подтвержден. Спасибо!`);
      sendStatusUpdateNotification(order.order_number, order.status, 'confirmed').catch(err => {
        console.error('Не удалось отправить уведомление о статусе:', err);
      });
      return;
    }

    if (action === 'cancel') {
      if (order.status === 'cancelled') {
        await bot.answerCallbackQuery(query.id, { text: 'Заказ уже отменен.' });
        return;
      }

      db.prepare(`
        UPDATE orders
        SET status = 'cancelled',
            telegram_username = ?,
            telegram_user_id = ?
        WHERE id = ?
      `).run(query.from.username || null, String(query.from.id || ''), order.id);

      await bot.answerCallbackQuery(query.id, { text: 'Заказ отменен.' });
      await bot.sendMessage(query.message.chat.id, `❌ Заказ ${order.order_number} отменен.`);
      sendStatusUpdateNotification(order.order_number, order.status, 'cancelled').catch(err => {
        console.error('Не удалось отправить уведомление о статусе:', err);
      });
    }
  });
}

export default bot;
