const formatEUR = (n) => n.toFixed(2).replace(".", ",") + " €";

const categories = [
  { id: "hauptgerichte", label: "Hauptgerichte" },
  { id: "beilage", label: "Beilage" },
  { id: "dessert", label: "Dessert" },
];

const dishes = [
  // Hauptgerichte (mind. 3)
  { id: "m1", cat: "hauptgerichte", name: "Risotto Pilze", desc: "Cremig mit frischen Pilzen", price: 10.90 },
  { id: "m2", cat: "hauptgerichte", name: "Pasta Gemüse", desc: "Mit frischem Gemüse", price: 9.50 },
  { id: "m3", cat: "hauptgerichte", name: "Pasta Spezial", desc: "Hausgemacht & würzig", price: 11.20 },

  // Beilage (mind. 2)
  { id: "s1", cat: "beilage", name: "Knoblauchbrot", desc: "Knusprig & warm", price: 3.20 },
  { id: "s2", cat: "beilage", name: "Salat", desc: "Frisch mit Dressing", price: 4.50 },

  // Dessert (mind. 2)
  { id: "d1", cat: "dessert", name: "Schoko Dessert", desc: "Süß & cremig", price: 4.50 },
  { id: "d2", cat: "dessert", name: "Tiramisu", desc: "Klassisch italienisch", price: 4.90 },
];

// cart: id -> {id,name,price,qty}
const cart = new Map();

// DOM
const tabsEl = document.getElementById("tabs");

const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountMobileEl = document.getElementById("cartCountMobile");

const cartDialog = document.getElementById("cartDialog");
const cartBtnMobile = document.getElementById("cartBtnMobile");
const closeCart = document.getElementById("closeCart");

const cartItemsMobileEl = document.getElementById("cartItemsMobile");
const cartTotalMobileEl = document.getElementById("cartTotalMobile");

const orderBtn = document.getElementById("orderBtn");
const orderBtnMobile = document.getElementById("orderBtnMobile");

const toastEl = document.getElementById("toast");
const yearEl = document.getElementById("year");

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function renderTabs() {
  tabsEl.innerHTML = categories
    .map((c) => `<a class="tab" href="#${c.id}">${c.label}</a>`)
    .join("");
}

function renderDishes() {
  categories.forEach((c) => {
    const listEl = document.getElementById(`dishList-${c.id}`);
    const list = dishes.filter((d) => d.cat === c.id);

    listEl.innerHTML = list
      .map(
        (d) => `
        <div class="dish">
          <div>
            <div class="dish__name">${d.name}</div>
            <div class="dish__desc">${d.desc}</div>
          </div>

          <div class="dish__right">
            <div class="price">${formatEUR(d.price)}</div>
            <span class="qtyBadge" data-qtyfor="${d.id}">0</span>
            <button class="plusBtn" type="button" data-add="${d.id}">+</button>
          </div>
        </div>
      `
      )
      .join("");
  });

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });

  updateQtyBadges();
}

function addToCart(id) {
  const dish = dishes.find((d) => d.id === id);
  if (!dish) return;

  const existing = cart.get(id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.set(id, { id, name: dish.name, price: dish.price, qty: 1 });
  }

  renderCart();
  showToast(`Hinzugefügt: ${dish.name}`);
}

function inc(id) {
  const item = cart.get(id);
  if (!item) return;
  item.qty += 1;
  renderCart();
}

function dec(id) {
  const item = cart.get(id);
  if (!item) return;

  item.qty -= 1;
  if (item.qty <= 0) cart.delete(id);

  renderCart();
}

function del(id) {
  cart.delete(id);
  renderCart();
}

function calcTotal() {
  let total = 0;
  cart.forEach((i) => (total += i.price * i.qty));
  return total;
}

function calcCount() {
  let count = 0;
  cart.forEach((i) => (count += i.qty));
  return count;
}

function updateQtyBadges() {
  document.querySelectorAll("[data-qtyfor]").forEach((el) => {
    const id = el.dataset.qtyfor;
    const item = cart.get(id);
    el.textContent = item ? String(item.qty) : "0";
  });
}

function renderCart() {
  const count = calcCount();
  cartCountMobileEl.textContent = String(count);

  if (cart.size === 0) {
    cartItemsEl.innerHTML = `<p class="muted">Noch nichts ausgewählt.</p>`;
    cartItemsMobileEl.innerHTML = `<p class="muted">Noch nichts ausgewählt.</p>`;
  } else {
    const itemsHtml = [...cart.values()]
      .map(
        (i) => `
        <div class="cartItem">
          <div class="cartTop">
            <strong>${i.name}</strong>
            <span>${formatEUR(i.price * i.qty)}</span>
          </div>

          <div class="cartActions">
            <button class="iconBtn" type="button" data-dec="${i.id}">−</button>
            <span class="qtyNum">${i.qty}</span>
            <button class="iconBtn" type="button" data-inc="${i.id}">+</button>
            <button class="iconBtn" type="button" data-del="${i.id}">🗑</button>
          </div>
        </div>
      `
      )
      .join("");

    cartItemsEl.innerHTML = itemsHtml;
    cartItemsMobileEl.innerHTML = itemsHtml;

    document.querySelectorAll("[data-inc]").forEach((b) =>
      b.addEventListener("click", () => inc(b.dataset.inc))
    );
    document.querySelectorAll("[data-dec]").forEach((b) =>
      b.addEventListener("click", () => dec(b.dataset.dec))
    );
    document.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", () => del(b.dataset.del))
    );
  }

  const total = calcTotal();
  cartTotalEl.textContent = formatEUR(total);
  cartTotalMobileEl.textContent = formatEUR(total);

  updateQtyBadges();
}

function placeOrder() {
  if (cart.size === 0) {
    showToast("Warenkorb ist leer.");
    return;
  }
  cart.clear();
  renderCart();
  showToast("Testbestellung durchgeführt ✅");
}

function bindUiEvents() {
  cartBtnMobile.addEventListener("click", () => cartDialog.showModal());
  closeCart.addEventListener("click", () => cartDialog.close());

  orderBtn.addEventListener("click", placeOrder);
  orderBtnMobile.addEventListener("click", () => {
    placeOrder();
    cartDialog.close();
  });
}

function init() {
  yearEl.textContent = new Date().getFullYear();
  renderTabs();
  renderDishes();
  renderCart();
  bindUiEvents();
}

init();
