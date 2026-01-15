// api/send-order.js

export const handler = async (event) => {
  console.log('START: Handler çalıştı');
  console.log('Event body tipi:', typeof event.body, 'içerik var mı?', !!event.body);

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  console.log('TOKEN var mı?', !!TOKEN);
  console.log('CHAT_ID var mı?', !!CHAT_ID);

  if (!TOKEN || !CHAT_ID) {
    console.error('ENV VAR EKSİK!');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN veya TELEGRAM_CHAT_ID eksik' })
    };
  }

  let data = {};
  try {
    let bodyStr = event.body;
    if (Buffer.isBuffer(bodyStr)) bodyStr = bodyStr.toString();
    if (typeof bodyStr !== 'string') bodyStr = JSON.stringify(bodyStr);

    data = JSON.parse(bodyStr);
    console.log('Parsed data:', data);
  } catch (err) {
    console.error('JSON parse hatası:', err.message);
    return { statusCode: 400, body: JSON.stringify({ error: 'Geçersiz JSON', details: err.message }) };
  }

  const cartList = Array.isArray(data.cart_items) ? data.cart_items.join("\n") : (data.cart_items || "");

  const message = `
📦 NEW ORDER - YOU MÉRITE

👤 Name: ${data.name || "N/A"}
📞 Phone: ${data.phone || "N/A"}
🏙 City: ${data.city || "N/A"}
🏠 Address: ${data.delivery_address || "N/A"}
🚚 Delivery: ${data.delivery_type || "N/A"}

🛒 Items:
${cartList}

💰 Total: ${data.total_price || "N/A"}

💵 Payment: CASH ON DELIVERY
`;

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  try {
    console.log('Fetch başlıyor... URL:', url.replace(TOKEN, '***')); // token'ı logda gizle

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    console.log('Fetch status:', res.status);

    const result = await res.json();
    console.log('Telegram cevabı:', result);

    if (!result.ok) {
      console.error('Telegram API hatası:', result.description);
      return { statusCode: 500, body: JSON.stringify({ error: result.description }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('CRASH NOKTASI:', err.message);
    console.error('Stack:', err.stack);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};