/**
 * Helper to send messages to Telegram via Bot API
 */
export async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}
