export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: "Telegram env vars missing" });
    }

    const cart = Array.isArray(data.cart_items)
      ? data.cart_items.join("\n")
      : data.cart_items || "";

    const message = `
📦 NEW ORDER - YOU MÉRITE

👤 Name: ${data.name || "N/A"}
📞 Phone: ${data.phone || "N/A"}
🏙 City: ${data.city || "N/A"}
🏠 Address: ${data.delivery_address || "N/A"}
🚚 Delivery: ${data.delivery_type || "N/A"}

🛒 Items:
${cart}

💰 Total: ${data.total_price || "N/A"}

💵 Payment: CASH ON DELIVERY
`;

    const tg = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });

    const result = await tg.json();

    if (!result.ok) {
      return res.status(500).json({ error: result.description });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
