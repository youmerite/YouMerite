export default {
  async fetch(request, env) {
    // ← Log'lar buraya geliyor (env burada tanımlı)
    console.log("TOKEN mevcut mu:", !!env.TELEGRAM_BOT_TOKEN);
    console.log("CHAT_ID mevcut mu:", !!env.TELEGRAM_CHAT_ID);
    console.log("TOKEN değeri (ilk 10 karakter):", env.TELEGRAM_BOT_TOKEN ? env.TELEGRAM_BOT_TOKEN.substring(0, 10) + "..." : "yok");
    console.log("CHAT_ID değeri:", env.TELEGRAM_CHAT_ID || "yok");

    console.log("Worker çağrıldı:", request.method);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return new Response("OK", { status: 200 });
    }

    try {
      const data = await request.json();
      console.log("Gelen veri:", data);

      if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
        console.error("Secrets eksik! TOKEN:", !!env.TELEGRAM_BOT_TOKEN, "CHAT_ID:", !!env.TELEGRAM_CHAT_ID);
        throw new Error("Telegram secrets missing");
      }

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

      console.log("Gönderilecek mesaj:", message);

      const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

      const tgRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: message.trim(),
        }),
      });

      const result = await tgRes.json();
      console.log("Telegram yanıtı:", result);

      if (!tgRes.ok || !result.ok) {
        console.error("Telegram hata:", result);
        throw new Error(result.description || "Telegram failed");
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    } catch (err) {
      console.error("Worker hatası:", err.message);
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}