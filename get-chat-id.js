import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в .env');
  process.exit(1);
}

console.log('🤖 Запуск бота для получения chat_id...\n');
console.log('📝 Инструкция:');
console.log('1. Откройте Telegram');
console.log('2. Найдите вашего бота @papugasik_bot');
console.log('3. Напишите боту любое сообщение (например, /start или "Привет")');
console.log('4. Вернитесь сюда - вы увидите ваш CHAT_ID\n');
console.log('⏳ Ожидаю сообщение от вас...\n');

const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username ? `@${msg.from.username}` : 'без username';
  const firstName = msg.from.first_name || '';
  const lastName = msg.from.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  console.log('✅ Получено сообщение!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤 От: ${fullName} (${username})`);
  console.log(`💬 Текст: "${msg.text}"`);
  console.log(`🆔 ВАШ CHAT_ID: ${chatId}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📋 Скопируйте этот CHAT_ID и вставьте в файл .env:');
  console.log(`TELEGRAM_CHAT_ID=${chatId}\n`);
  
  // Отправляем подтверждение
  bot.sendMessage(chatId, 
    '✅ Отлично! Я получил ваше сообщение.\n\n' +
    `Ваш CHAT_ID: ${chatId}\n\n` +
    'Теперь скопируйте этот ID и укажите его в файле .env вашего проекта.'
  );
  
  console.log('✅ Бот отправил вам подтверждение в Telegram');
  console.log('\n⚠️  Нажмите Ctrl+C чтобы остановить скрипт');
});

bot.on('polling_error', (error) => {
  console.error('❌ Ошибка:', error.message);
});
