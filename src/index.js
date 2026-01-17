export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("OK", { status: 200 });
    }

    const data = await request.json();

    const message = `
🛒 Yeni Sipariş

👤 İsim: ${data.name}
📞 Telefon: ${data.phone}
🏙️ Şehir: ${data.city}
📍 Adres: ${data.delivery_address}
🚚 Teslimat: ${data.delivery_type}

📦 Ürünler:
${(data.cart_items || []).map(i => `- ${i}`).join("\n")}

💰 Toplam: ${data.total_price}
    `;

    const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: message,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
