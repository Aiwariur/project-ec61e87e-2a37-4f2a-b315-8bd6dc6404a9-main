import express from 'express';
import { sendTelegramNotification } from '../telegram.js';

const router = express.Router();

// Обработка заявок на консультацию
router.post('/', async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Телефон обязателен' });
    }

    // Формируем сообщение для Telegram
    const telegramMessage = `
🔔 *Новая заявка на консультацию*

📞 *Телефон:* ${phone}
💬 *Сообщение:* ${message || 'Не указано'}

⏰ Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    // Отправляем уведомление в Telegram
    await sendTelegramNotification(telegramMessage);

    res.json({ 
      success: true, 
      message: 'Заявка принята' 
    });
  } catch (error) {
    console.error('Ошибка обработки заявки:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: error.message 
    });
  }
});

export default router;
