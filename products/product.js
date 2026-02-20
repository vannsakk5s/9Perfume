// =========================
// Dark/Light Mode & App Logic
// =========================
const THEME_KEY = "miniperfume_theme_v1";
const STORAGE_KEY = "miniperfume_cart_v1";
const PROMO_CODE = "WELCOME10";
const PROMO_RATE = 0.10;

// ---------- Data product ----------
const PRODUCTS = [
  { id: "p1", image: "/images/1.jpg", name: "Amber No. 7", brand: "ScentHouse", price: 69, size: "50ml", notes: ["amber", "vanilla", "musk"], vibe: "Warm • Smooth", featured: 1, des: "" },
  { id: "p2", image: "/images/2.jpg", name: "Rose Velvet", brand: "Maison Bloom", price: 54, size: "50ml", notes: ["rose", "peony", "powder"], vibe: "Soft • Romantic", featured: 2, des: "A soft and romantic rose scent with peony and powder notes." },
  { id: "p3", image: "/images/1.jpg", name: "Citrus Dawn", brand: "Atelier Fresh", price: 42, size: "30ml", notes: ["citrus", "bergamot", "tea"], vibe: "Bright • Clean", featured: 3, des: "A bright and clean citrus scent with bergamot and tea notes." },
  { id: "p4", image: "/images/2.jpg", name: "Oud Night", brand: "Desert Noir", price: 89, size: "60ml", notes: ["oud", "spice", "smoke"], vibe: "Bold • Luxe", featured: 4, des: "A bold and luxurious oud scent with spice and smoke notes." },
  { id: "p5", image: "/images/1.jpg", name: "Jasmine Breeze", brand: "ScentHouse", price: 59, size: "50ml", notes: ["jasmine", "green tea", "musk"], vibe: "Fresh • Elegant", featured: 5, des: "A fresh and elegant jasmine scent with green tea and musk notes." },
  { id: "p6", image: "/images/2.jpg", name: "Leather & Smoke", brand: "Maison Bloom", price: 75, size: "50ml", notes: ["leather", "smoke", "wood"], vibe: "Rugged • Mysterious", featured: 6, des: "A rugged and mysterious leather scent with smoke and wood notes." },
  { id: "p7", image: "/images/1.jpg", name: "Vanilla Sky", brand: "Desert Noir", price: 49, size: "30ml", notes: ["vanilla", "caramel", "sandalwood"], vibe: "Sweet • Cozy", featured: 7, des: "A sweet and cozy vanilla scent with caramel and sandalwood notes." },
  { id: "p8", image: "/images/2.jpg", name: "Ocean Mist", brand: "Atelier Fresh", price: 44, size: "30ml", notes: ["sea salt", "jasmine", "musk"], vibe: "Fresh • Aquatic", featured: 8, des: "A fresh and aquatic ocean scent with sea salt, jasmine, and musk notes." },
];

// ---------- State ----------
let cart = loadCart();
let promo = loadPromo();
let search = "";
let sort = "featured";
let currentCoords = null;

// ---------- Helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const money = (n) => `$${n.toFixed(2)}`;

function showToast(msg, ms = 2200) {
  const toast = $("#toast");
  $("#toastText").textContent = msg;
  toast.classList.remove("hidden");
  toast.classList.add("block");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.add("hidden");
    toast.classList.remove("block");
  }, ms);
}

function saveCart() { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
function loadCart() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function savePromo() { localStorage.setItem(STORAGE_KEY + "_promo", JSON.stringify(promo)); }
function loadPromo() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY + "_promo")) || { codeApplied: false }; } catch { return { codeApplied: false }; } }
function cartCount() { return Object.values(cart).reduce((a, b) => a + b, 0); }
function subtotal() { return Object.entries(cart).reduce((sum, [id, qty]) => { const p = PRODUCTS.find(x => x.id === id); return sum + (p ? p.price * qty : 0); }, 0); }
function discountAmount(sub) { return promo.codeApplied ? sub * PROMO_RATE : 0; }
function total() { const sub = subtotal(); return Math.max(0, sub - discountAmount(sub)); }

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  renderCartBadge();
  renderProducts();
  showToast("Added to cart ✅");
}

function setQty(id, qty) {
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  saveCart();
  renderCart();
  renderCartBadge();
  renderProducts();
}

function escapeHtml(str) { return String(str).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }

// ---------- UI Functions ----------
function setTheme(mode) {
  const isDark = mode === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem(THEME_KEY, mode);
  const btn = $("#themeToggle");
  if (btn) btn.textContent = isDark ? "☀️" : "🌙";
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(saved === "dark" || saved === "light" ? saved : (prefersDark ? "dark" : "light"));
}

function productCard(p) {
  const quantity = cart[p.id] || 0;
  const chips = p.notes.map(n => `<span class="rounded-full border bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">${escapeHtml(n)}</span>`).join("");
  return `
    <article onclick="showDetail('${p.id}')" class="rounded-3xl min-w-[230px] border bg-white p-1 shadow-sm flex flex-col dark:bg-slate-900 dark:border-slate-800 cursor-pointer hover:shadow-md transition-all">
      <div class="overflow-hidden rounded-t-[20px] rounded-b-[5px]"><img src="${escapeHtml(p.image)}" class="h-48 w-full object-cover" /></div>
      <div class="flex mt-2 pl-2 pr-2 items-start justify-between gap-1">
        <div class="w-full">
          <div class="flex items-center justify-between"><h4 class="text-base font-semibold">${p.name.length > 12 ? escapeHtml(p.name.slice(0, 12)) + '...' : escapeHtml(p.name)}</h4><p class="text-xs text-slate-500 dark:text-slate-400">${escapeHtml(p.brand)}</p></div>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">${escapeHtml(p.vibe)} • ${escapeHtml(p.size)}</p>
        </div>
      </div>
      <div class="mt-2 pl-2 pr-2 flex flex-wrap gap-2">${chips}</div>
      <div class="mt-2 mb-2 pl-2 pr-2 flex items-center justify-between">
        <p class="text-lg font-semibold">${money(p.price)}</p>
        <div class="relative">
          <button onclick="event.stopPropagation(); addToCart('${p.id}')" class="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">Add</button>
          ${quantity > 0 ? `<div class="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-semibold text-slate-900 border dark:bg-slate-900 dark:text-white dark:border-slate-700">${quantity}</div>` : ''}
        </div>
      </div>
    </article>`;
}

function showDetail(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  $("#detail-img").src = p.image;
  $("#detail-title").innerText = p.name;
  $("#detail-brand").innerText = p.brand;
  $("#detail-notes").innerHTML = p.notes.map(n => `<span class="rounded-full border bg-slate-50 px-2.5 py-1 text-sm text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">${escapeHtml(n)}</span>`).join(" ");
  $("#detail-category").innerText = `${p.vibe} • ${p.size}`;
  $("#detail-price").innerText = money(p.price);
  $("#detail-desc").innerText = p.des || `Experience the essence of ${p.name} ${p.brand}.`;
  $("#detail-modal").classList.replace("hidden", "flex");
  document.body.classList.add("overflow-hidden");
}

function closeDetail() { $("#detail-modal").classList.replace("flex", "hidden"); document.body.classList.remove("overflow-hidden"); }

function renderProducts() {
  let items = [...PRODUCTS];
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(p => `${p.name} ${p.brand} ${p.size} ${p.vibe} ${p.notes.join(" ")}`.toLowerCase().includes(q));
  }
  if (sort === "price_asc") items.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") items.sort((a, b) => b.price - a.price);
  else if (sort === "name_asc") items.sort((a, b) => a.name.localeCompare(b.name));
  else items.sort((a, b) => a.featured - b.featured);

  const grouped = items.reduce((acc, p) => { if (!acc[p.brand]) acc[p.brand] = []; acc[p.brand].push(p); return acc; }, {});
  let html = "";
  for (const brand in grouped) {
    html += `<section class="mb-10"><div class="flex items-end justify-between mb-4"><div><h3 class="text-base font-semibold">Brand ${escapeHtml(brand)}</h3><p class="text-sm text-slate-500">Showing ${grouped[brand].length} items</p></div></div><div class="flex gap-4 pb-4 overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">${grouped[brand].map(p => productCard(p)).join("")}</div></section>`;
  }
  $("#productGrid").innerHTML = html || `<div class="text-center py-20 text-slate-500">No products found.</div>`;
}

// ---------- Cart & Checkout Logic ----------
const openCart = () => { $("#cartDrawer").classList.remove("hidden"); renderCart(); };
const closeCart = () => { $("#cartDrawer").classList.add("hidden"); };
const openCheckout = () => { if (cartCount() === 0) return showToast("Cart is empty 🙂"); $("#checkoutBackdrop").classList.replace("hidden", "flex"); $("#checkoutTotal").textContent = money(total()); };
const closeCheckout = () => { $("#checkoutBackdrop").classList.replace("flex", "hidden"); };

function renderCartBadge() {
  $("#cartCount").textContent = cartCount();
  $("#cartSub").textContent = `${cartCount()} items`;
  $("#checkoutBtn").disabled = cartCount() === 0;
}

function renderCart() {
  const entries = Object.entries(cart);
  $("#emptyCart").classList.toggle("hidden", entries.length > 0);
  $("#cartItems").innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return "";
    return `<li class="rounded-2xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800"><div class="flex justify-between"><div><p class="text-xs text-slate-500">${p.brand}</p><p class="text-sm font-semibold">${p.name}</p></div><p class="text-sm font-semibold">${money(p.price * qty)}</p></div><div class="mt-3 flex justify-between"><div class="flex gap-2"><button onclick="setQty('${p.id}', ${qty - 1})" class="rounded-xl border px-3 py-1">-</button><span>${qty}</span><button onclick="setQty('${p.id}', ${qty + 1})" class="rounded-xl border px-3 py-1">+</button></div><button onclick="setQty('${p.id}', 0)" class="text-xs text-red-500">Remove</button></div></li>`;
  }).join("");
  const sub = subtotal();
  $("#subtotalText").textContent = money(sub);
  $("#discountText").textContent = `-${money(discountAmount(sub))}`;
  $("#totalText").textContent = money(total());
}

// =========================
// Form Submission (Fixed)
// =========================
async function handleCheckout(e) {
  e.preventDefault();
  const payBtn = $("#payBtn");
  if (payBtn.disabled) return;

  const phone = $("#phone").value.trim();
  const address = $("#address").value.trim();
  if (!phone || !address) return showToast("សូមបំពេញលេខទូរស័ព្ទ និងអាសយដ្ឋាន! ⚠️");

  payBtn.disabled = true;
  payBtn.textContent = "កំពុងផ្ញើ...";

  // យកទិន្នន័យពី Telegram (នឹងទៅជា WEB_USER បើតេស្តលើ Chrome)
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const orderData = {
    telegramId: tgUser?.id?.toString() || "WEB_USER",
    firstName: tgUser?.first_name || "Guest",
    phone,
    address,
    note: $("#note").value.trim(),
    items: Object.entries(cart).map(([id, qty]) => {
      const p = PRODUCTS.find(x => x.id === id);
      return p ? { name: p.name, price: p.price, qty } : null;
    }).filter(Boolean),
    total: total().toFixed(2),
    location: currentCoords
  };

  try {
    const res = await fetch('https://kevin-compete-antique-agrees.trycloudflare.com/api/place-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const result = await res.json();
    if (result.success) {
      showToast("ការកម្ម៉ង់បានជោគជ័យ! ✅");
      cart = {}; saveCart(); promo.codeApplied = false; savePromo();
      renderCartBadge(); renderCart(); closeCheckout(); closeCart();
      e.target.reset();
    } else throw new Error(result.error);
  } catch (err) {
    showToast("Error: " + err.message);
  } finally {
    payBtn.disabled = false;
    payBtn.textContent = "Pay";
  }
}

// =========================
// Initialization
// =========================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderProducts();
  renderCartBadge();
  
  $("#themeToggle").onclick = () => setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  $("#openCartBtn").onclick = openCart;
  $("#closeCartBtn").onclick = closeCart;
  $("#cartOverlay").onclick = closeCart;
  $("#checkoutBtn").onclick = openCheckout;
  $("#closeCheckout").onclick = closeCheckout;
  $("#checkoutForm").onsubmit = handleCheckout; // ប្រើតែមួយគត់នៅទីនេះ

  // Search Logic
  const sInput = $("#searchInput");
  if (sInput) sInput.oninput = (e) => { search = e.target.value; renderProducts(); };
});

// Map Logic
function openMapModal() {
  $("#map-container").classList.toggle("hidden");
  if (!map) {
    map = L.map('map').setView([11.5564, 104.9282], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    marker = L.marker([11.5564, 104.9282], { draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      currentCoords = { lat: pos.lat, lng: pos.lng };
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`).then(r => r.json()).then(d => $("#address").value = d.display_name);
    });
  }
}
let map, marker;