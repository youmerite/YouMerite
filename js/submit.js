// submit.js - Son hali (14 Ocak 2026)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('customer-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Form verilerini topla
    const orderData = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      city: form.city.value.trim(),
      delivery_address: form.delivery_address.value.trim(),
      delivery_type: form.delivery_type.value,
      cart_items: cart.map(i => `${i.name} × ${i.quantity}`).join('\n'),
      total_price: document.getElementById('cart-total').textContent.trim()
    };

    // Netlify Forms için doğru formatta veri hazırla
    const formData = new URLSearchParams();
    formData.append('form-name', 'order-submissions'); // MUTLAKA İLK SIRADA!
    Object.entries(orderData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      // 1. Netlify Forms'a gönder
      console.log('Netlify Forms gönderiliyor...');
      const formResponse = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      console.log('Netlify status:', formResponse.status);

      if (!formResponse.ok) {
        const errorText = await formResponse.text();
        console.error('Netlify Forms hatası:', errorText.substring(0, 200));
        throw new Error(`Netlify Forms reddetti (status ${formResponse.status})`);
      }

      // 2. Telegram'a gönder (opsiyonel - hata verse bile devam eder)
      console.log('Telegram gönderiliyor...');
      await fetch('/.netlify/functions/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      }).catch(err => {
        console.warn('Telegram hatası (devam ediyor):', err.message);
        // Telegram başarısız olsa da formu kabul et
      });

      // Başarılı işlem
      document.getElementById('success-message').innerHTML = `
        <p style="color:#d4af37; font-size:1.4rem; text-align:center; margin-top:20px;">
          ✅ Sipariş başarıyla alındı!<br>
          💰 Toplam: ${orderData.total_price}<br>
          🚚 Ödeme: Kapıda Nakit (DZD)<br>
          📞 Kısa süre içinde sizi arayacağız.
        </p>
      `;

      // Formu gizle, sepeti temizle
      form.style.display = 'none';
      cart.length = 0;
      localStorage.removeItem('cart');
      document.getElementById('cart-count').textContent = '0';

      // 6 saniye sonra modal'ı kapat
      setTimeout(() => {
        document.getElementById('cart-modal').style.display = 'none';
      }, 6000);

    } catch (err) {
      console.error('Genel gönderim hatası:', err.message);
      alert('Gönderim başarısız oldu: ' + err.message + '\nLütfen tekrar deneyin veya bize doğrudan ulaşın.');
    }
  });
});