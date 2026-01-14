export const handler = async (event) => {
  let data = {};
  try {
    if (event.body) {
      data = JSON.parse(event.body);
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Empty body" })
      };
    }
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON" })
    };
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const message = `
📦 NEW ORDER - YOU MÉRITE

👤 Name: ${data.name}
📞 Phone: ${data.phone}
🏙 City: ${data.city}
🏠 Address: ${data.delivery_address}
🚚 Delivery: ${data.delivery_type}

🛒 Items:
${Array.isArray(data.cart_items) ? data.cart_items.join("\n") : data.cart_items}

💰 Total: ${data.total_price}

💵 Payment: CASH ON DELIVERY
  `;

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message })
    });

    const result = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, result })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
