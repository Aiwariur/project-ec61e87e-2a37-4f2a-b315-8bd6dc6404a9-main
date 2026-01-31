import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

let bot = null;

// Инициализация бота
if (token) {
  try {
    bot = new TelegramBot(token, { polling: false });
    console.log('✅ Telegram бот инициализирован');
  } catch (error) {
    console.error('❌ Ошибка инициализации Telegram бота:', error.message);
  }
} else {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN не найден в .env');
}

/**
 * Форматирует сообщение о новом заказе
 */
function formatOrderMessage(orderData) {
  const { order_number, customer_name, customer_phone, customer_email, delivery_method, address, comment, items, total } = orderData;
  
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
  
  if (comment) {
    message += `\n💬 <b>Комментарий:</b> ${comment}\n`;
  }
  
  message += `\n🛒 <b>Товары:</b>\n`;
  items.forEach((item, index) => {
    message += `   ${index + 1}. ${item.name || 'Товар'} x${item.quantity} - ${item.price}₽\n`;
  });
  
  message += `\n💰 <b>ИТОГО: ${total}₽</b>`;
  
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
