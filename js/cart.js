let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  document.getElementById('cart-count').textContent =
    cart.reduce((s, i) => s + i.quantity, 0);
}

function updateCartDisplay() {
  const items = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  items.innerHTML = '';

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const div = document.createElement('div');
    div.innerHTML = `
      <span>${item.name} × ${item.quantity}</span>
      <span>${item.price * item.quantity} DZD</span>
      <button data-i="${index}">×</button>
    `;

    div.querySelector('button').onclick = () => {
      cart.splice(index, 1);
      saveCart();
      updateCartDisplay();
    };

    items.appendChild(div);
  });

  totalEl.textContent = total + ' DZD';
}

function addToCart(name, price) {
  const found = cart.find(i => i.name === name);
  if (found) found.quantity++;
  else cart.push({ name, price: Number(price), quantity: 1 });

  saveCart();
  updateCartDisplay();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cart-icon').onclick = () => {
    document.getElementById('cart-modal').style.display = 'block';
    updateCartDisplay();
  };

  document.getElementById('close-modal').onclick = () => {
    document.getElementById('cart-modal').style.display = 'none';
  };

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.onclick = () => addToCart(btn.dataset.name, btn.dataset.price);
  });

  saveCart();
});

window.cart = cart;
