const PAYPAL_ME_USERNAME = "cartonix";
const ORDER_EMAIL = "caemostajo@gmail.com";

const products = [
  {
    id: "starter-kit",
    name: "Starter Kit",
    price: 18000,
    badge: "Más popular",
    description: "El kit base para empezar a cortar, perforar y unir cartón.",
    includes: ["1 sierra", "1 des-cartonillador", "25 tornillos"],
    gallery: [
      { src: "assets/starter-kit-1.png", alt: "Starter Kit Cartonix completo" },
      { src: "assets/starter-kit-2.png", alt: "Starter Kit en cartón" },
      { src: "assets/starter-kit-3.png", alt: "Starter Kit vista superior" },
      { src: "assets/starter-kit-4.png", alt: "Starter Kit detalle de herramientas" },
    ],
  },
  {
    id: "constructor-kit",
    name: "Kit Constructor",
    price: 24000,
    badge: "Crea en grande",
    description: "Más herramientas y piezas para mecanismos, puertas y estructuras.",
    includes: ["1 sierra", "1 des-cartonillador", "1 roller doblador", "50 tornillos", "4 visagras", "4 deslizadores", "4 manillas"],
    gallery: [
      { src: "assets/constructor-kit-1.png", alt: "Kit Constructor Cartonix completo" },
      { src: "assets/constructor-kit-2.png", alt: "Accesorios del Kit Constructor" },
      { src: "assets/constructor-kit-3.png", alt: "Herramientas reales del Kit Constructor" },
      { src: "assets/constructor-kit-4.png", alt: "Proyecto de cartón hecho con Kit Constructor" },
    ],
  },
  {
    id: "accessory-kit",
    name: "Kit de Accesorios",
    price: 10000,
    badge: "Más piezas",
    description: "Hinges, manillas, deslizadores y conectores para ampliar tus builds.",
    includes: ["Visagras", "Deslizadores", "Manillas", "Conectores", "Tornillos extra"],
    gallery: [
      { src: "assets/accessories-kit-1.png", alt: "Kit de accesorios Cartonix" },
      { src: "assets/accessories-kit-2.jpg", alt: "Accesorios junto a herramientas" },
      { src: "assets/accessories-kit-3.jpg", alt: "Tornillos y accesorios amarillos" },
      { src: "assets/accessories-kit-4.jpg", alt: "Accesorios usados en cartón" },
    ],
  },
  {
    id: "screws-50",
    name: "Tornillos x50",
    price: 8000,
    badge: "Repuesto",
    description: "Caja de 50 tornillos Cartonix para unir cartón sin pegamento.",
    includes: ["50 tornillos", "Tamaño estándar", "Reutilizables"],
    gallery: [
      { src: "assets/screws-50-1.png", alt: "Caja de 50 tornillos Cartonix" },
      { src: "assets/screws-50-2.png", alt: "Tornillos reales Cartonix" },
      { src: "assets/screws-50-3.png", alt: "Tornillos con accesorios" },
      { src: "assets/screws-50-4.png", alt: "Tornillos en kit Cartonix" },
    ],
  },
  {
    id: "long-screws-50",
    name: "Tornillos largos x50",
    price: 8500,
    badge: "Más agarre",
    description: "Caja de 50 tornillos largos para cartón doble o uniones más profundas.",
    includes: ["50 tornillos largos", "Para cartón grueso", "Reutilizables"],
    gallery: [
      { src: "assets/long-screws-50-1.png", alt: "Caja de 50 tornillos largos Cartonix" },
      { src: "assets/long-screws-50-2.png", alt: "Tornillos largos con herramientas" },
      { src: "assets/long-screws-50-3.png", alt: "Tornillos amarillos reales" },
      { src: "assets/long-screws-50-4.png", alt: "Tornillos largos usados en construcción" },
    ],
  },
];

const cart = new Map();
const colones = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const money = {
  format(value) {
    return `₡ ${colones.format(value)}`;
  },
};

const productGrid = document.querySelector("#product-grid");
const cartDrawer = document.querySelector("#cart-drawer");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartCount = document.querySelector("#cart-count");
const subtotalEl = document.querySelector("#subtotal");
const shippingEl = document.querySelector("#shipping");
const taxEl = document.querySelector("#tax");
const totalEl = document.querySelector("#total");
const toast = document.querySelector("#toast");
const checkoutForm = document.querySelector("#checkout-form");
const menuButton = document.querySelector("[data-menu-toggle]");
const mainNav = document.querySelector("#main-nav");

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-art">
            <img src="${product.gallery[0].src}" alt="${product.gallery[0].alt}" data-main-image="${product.id}" />
            <span class="product-badge">${product.badge}</span>
          </div>
          <div class="product-gallery" aria-label="Galería de ${product.name}">
            ${product.gallery
              .map(
                (image, index) => `
                  <button class="${index === 0 ? "active" : ""}" type="button" data-gallery="${product.id}" data-image="${image.src}" data-alt="${image.alt}">
                    <img src="${image.src}" alt="" />
                  </button>
                `
              )
              .join("")}
          </div>
          <div class="product-bottom">
            <h3>${product.name}</h3>
            <strong class="product-price">${money.format(product.price)}</strong>
          </div>
          <p class="product-copy">${product.description}</p>
          <div class="product-includes">
            ${product.includes.map((item) => `<span>⌁ ${item}</span>`).join("")}
          </div>
          <button class="add-button" type="button" data-add-product="${product.id}">Agregar</button>
        </article>
      `
    )
    .join("");
}

function getProduct(id) {
  return products.find((product) => product.id === id);
}

function addToCart(item, quantity = 1) {
  const existing = cart.get(item.id);
  cart.set(item.id, {
    ...item,
    quantity: existing ? existing.quantity + quantity : quantity,
  });
  renderCart();
  showToast(`${item.name} agregado al carrito`);
}

function updateQuantity(id, change) {
  const item = cart.get(id);
  if (!item) return;

  const nextQuantity = item.quantity + change;
  if (nextQuantity <= 0) {
    cart.delete(id);
  } else {
    cart.set(id, { ...item, quantity: nextQuantity });
  }
  renderCart();
}

function getCartTotals() {
  const items = [...cart.values()];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal === 0 ? 0 : subtotal > 120 ? 0 : 9;
  const tax = Math.round(subtotal * 0.0825);
  const total = subtotal + shipping + tax;
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, shipping, tax, total, quantity };
}

function renderCart() {
  const { items, subtotal, shipping, tax, total, quantity } = getCartTotals();

  cartItems.innerHTML = items
    .map(
      (item) => `
        <div class="cart-line">
          <div>
            <strong>${item.name}</strong>
            <p>${money.format(item.price)} cada uno</p>
          </div>
          <div class="qty-control" aria-label="Cantidad para ${item.name}">
            <button type="button" data-qty="${item.id}" data-change="-1" aria-label="Quitar uno">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-qty="${item.id}" data-change="1" aria-label="Agregar uno">+</button>
          </div>
        </div>
      `
    )
    .join("");

  cartEmpty.hidden = items.length > 0;
  subtotalEl.textContent = money.format(subtotal);
  shippingEl.textContent = shipping === 0 && subtotal > 0 ? "Gratis" : money.format(shipping);
  taxEl.textContent = money.format(tax);
  totalEl.textContent = money.format(total);
  cartCount.textContent = quantity;
}

function encodeForm(data) {
  return new URLSearchParams(data).toString();
}

function buildOrderSummary(items) {
  return items.map((item) => `${item.quantity} x ${item.name} (${money.format(item.price)} c/u)`).join(" | ");
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

document.addEventListener("click", (event) => {
  const addProductButton = event.target.closest("[data-add-product]");
  const quantityButton = event.target.closest("[data-qty]");
  const galleryButton = event.target.closest("[data-gallery]");

  if (event.target.closest("[data-menu-toggle]")) {
    const isOpen = mainNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    return;
  }

  if (event.target.closest(".nav a")) {
    mainNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }

  if (galleryButton) {
    const productId = galleryButton.dataset.gallery;
    const mainImage = document.querySelector(`[data-main-image="${productId}"]`);
    mainImage.src = galleryButton.dataset.image;
    mainImage.alt = galleryButton.dataset.alt;
    document.querySelectorAll(`[data-gallery="${productId}"]`).forEach((button) => {
      button.classList.toggle("active", button === galleryButton);
    });
    return;
  }

  if (addProductButton) {
    addToCart(getProduct(addProductButton.dataset.addProduct));
    openCart();
    return;
  }

  if (event.target.closest("[data-open-cart]")) {
    openCart();
    return;
  }

  if (event.target.closest("[data-close-cart]")) {
    closeCart();
    return;
  }

  if (quantityButton) {
    updateQuantity(quantityButton.dataset.qty, Number(quantityButton.dataset.change));
  }
});

checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (cart.size === 0) {
    showToast("Agrega un kit antes de pagar");
    return;
  }

  const { items, total } = getCartTotals();
  const formData = new FormData(checkoutForm);
  const customerName = formData.get("name");
  const customerEmail = formData.get("checkout-email");
  const paypalUrl = `https://www.paypal.me/${PAYPAL_ME_USERNAME}/${total}`;

  try {
    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeForm({
        "form-name": "cartonix-order",
        name: customerName,
        email: customerEmail,
        order: buildOrderSummary(items),
        total: money.format(total),
        paypalUrl,
        recipient: ORDER_EMAIL,
      }),
    });
  } catch (error) {
    showToast("No se pudo registrar el pedido, pero puedes continuar a PayPal.");
  }

  window.open(paypalUrl, "_blank", "noopener,noreferrer");
  showToast("Pedido registrado. PayPal se abrió para completar el pago.");
});

renderProducts();
renderCart();
