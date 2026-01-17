export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("OK", { status: 200 });
    }

    try {
      const data = await request.json();
      const message = `
🛒 Yeni Sipariş

👤 İsim: ${data.name || "N/A"}
📞 Telefon: ${data.phone || "N/A"}
🏙️ Şehir: ${data.city || "N/A"}
📍 Adres: ${data.delivery_address || "N/A"}
🚚 Teslimat: ${data.delivery_type || "N/A"}

📦 Ürünler:
${(data.cart_items || []).map(i => `- ${i}`).join("\n")}

💰 Toplam: ${data.total_price || "N/A"}
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
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  },
};