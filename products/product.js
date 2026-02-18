// =========================
// Dark/Light Mode (NEW)
// =========================
const THEME_KEY = "miniperfume_theme_v1";

function setTheme(mode) {
  const isDark = mode === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem(THEME_KEY, mode);

  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = isDark ? "☀️" : "🌙";
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (saved === "dark" || saved === "light") setTheme(saved);
  else setTheme(prefersDark ? "dark" : "light");
}

function updateActiveNav() {
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-item');

  // លុប style active ចាស់ចេញទាំងអស់
  navItems.forEach(item => {
    item.classList.remove('text-slate-900', 'dark:text-white');
    item.classList.add('text-slate-500', 'dark:text-slate-400');
  });

  // បន្ថែម style active ទៅកាន់ item ដែលត្រូវនឹង URL
  if (currentPath.includes('product.html')) {
    const productNav = document.getElementById('nav-product');
    if (productNav) {
      productNav.classList.replace('text-slate-500', 'text-slate-900');
      productNav.classList.replace('dark:text-slate-400', 'dark:text-white');
    }
  } else if (currentPath.includes('about.html')) {
    const receiptNav = document.getElementById('nav-receipt');
    if (receiptNav) {
      receiptNav.classList.replace('text-slate-500', 'text-slate-900');
      receiptNav.classList.replace('dark:text-slate-400', 'dark:text-white');
    }
  } else {
    // បើមិនមែនទំព័រខាងលើ គឺចាត់ទុកថាជាទំព័រ Home
    const homeNav = document.getElementById('nav-home');
    if (homeNav) {
      homeNav.classList.replace('text-slate-500', 'text-slate-900');
      homeNav.classList.replace('dark:text-slate-400', 'dark:text-white');
    }
  }
}

// window

const normalize = (p) => {
  p = p.split("?")[0].split("#")[0];
  if (p.endsWith("/")) p += "index.html";           // folder -> index.html
  p = p.replace(/\/{2,}/g, "/");                    // clean //
  return p.toLowerCase();
};

const current = normalize(location.pathname);

document.querySelectorAll("a.nav-link").forEach((a) => {
  const href = a.getAttribute("href");
  if (!href || href.startsWith("http")) return;

  // Convert relative href to an absolute pathname
  const resolved = new URL(href, location.href);
  if (normalize(resolved.pathname) === current) {
    a.classList.add("active");
  }
});

// ហៅ function ឱ្យដំណើរការ
document.addEventListener('DOMContentLoaded', updateActiveNav);

// =========================
// Mini Perfume Shop App
// (from previous script.js)
// search : productGrid
// =========================

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
const STORAGE_KEY = "miniperfume_cart_v1";
const PROMO_CODE = "WELCOME10";
const PROMO_RATE = 0.10;

let cart = loadCart();         // { [productId]: qty }
let promo = loadPromo();       // { codeApplied: boolean }
let search = "";
let sort = "featured";

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
function loadCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function savePromo() { localStorage.setItem(STORAGE_KEY + "_promo", JSON.stringify(promo)); }
function loadPromo() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY + "_promo")) || { codeApplied: false }; }
  catch { return { codeApplied: false }; }
}

function cartCount() { return Object.values(cart).reduce((a, b) => a + b, 0); }

function subtotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function discountAmount(sub) { return promo.codeApplied ? sub * PROMO_RATE : 0; }
function total() {
  const sub = subtotal();
  return Math.max(0, sub - discountAmount(sub));
}

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
}

// ---------- Products render ----------
function productCard(p) {
  const quantity = cart[p.id] || 0;
  const chips = p.notes.map(n => `
    <span class="rounded-full border bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600
                 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">
      ${escapeHtml(n)}
    </span>
  `).join("");

  return `
    <article onclick="showDetail('${p.id}')" class="rounded-3xl min-w-[230px] border bg-white p-1 shadow-sm flex flex-col
                    dark:bg-slate-900 dark:border-slate-800 cursor-pointer hover:shadow-md transition-all">

      <div class="overflow-hidden rounded-t-[20px] rounded-b-[5px]">
        <img src="${escapeHtml(p.image)}"
             alt="${escapeHtml(p.name)}"
             class="h-48 w-full object-cover" />
      </div>

      <div class="flex mt-2 pl-2 pr-2 items-start justify-between gap-1">
        <div class="w-full">
          <div class="flex items-center justify-between">
            <h4 class="text-base font-semibold">
              ${p.name.length > 12 ? escapeHtml(p.name.slice(0, 12)) + '...' : escapeHtml(p.name)}
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              ${escapeHtml(p.brand)}
            </p>
          </div>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            ${escapeHtml(p.vibe)} • ${escapeHtml(p.size)}
          </p>
        </div>
      </div>

      <div class="mt-2 pl-2 pr-2 flex flex-wrap gap-2">
        ${chips}
      </div>

      <div class="mt-2 mb-2 pl-2 pr-2 flex items-center justify-between">
        <p class="text-lg font-semibold">
          ${money(p.price)}
        </p>
        <div class="relative">
          <button onclick="event.stopPropagation(); addToCart('${p.id}')"
                  class="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white 
                         hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
            Add
          </button>
        
          
          ${quantity > 0 ? `
            <div class="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-semibold text-slate-900 border
                   dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700">
              <span class="text-slate-900 dark:text-white">${quantity}</span>
            </div>
          ` : ''} 
        </div>
      </div>
    </article>
  `;
}

// ----------- Show Product Detail ----------
function showDetail(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  // Fill the Modal Data
  $("#detail-img").src = product.image;
  $("#detail-title").innerText = product.name;
  $("#detail-brand").innerText = product.brand;
  $("#detail-notes").innerHTML = product.notes.map(n => `<span class="rounded-full border bg-slate-50 px-2.5 py-1 text-sm text-slate-600
                                         dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">${escapeHtml(n)}</span>`).join(" ");
  $("#detail-category").innerText = `${product.vibe} • ${product.size}`;
  $("#detail-price").innerText = money(product.price);

  // Generate description from notes if a formal description doesn't exist
  $("#detail-desc").innerText = product.des || `Experience the essence of ${product.name} ${product.brand} A ${product.vibe.toLowerCase()} fragrance featuring notes of ${product.notes.join(', ')}. Perfect for those who appreciate ${product.brand} craftsmanship.`;

  // Show Modal
  const modal = $("#detail-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex"); // Ensure it uses flex to center
  document.body.classList.add("overflow-hidden");
}

// Close Detail
function closeDetail() {
  $("#detail-modal").classList.add("hidden");
  $("#detail-modal").classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
}

function getFilteredSortedProducts() {
  let items = [...PRODUCTS];

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(p => {
      const hay = `${p.name} ${p.brand} ${p.size} ${p.vibe} ${p.notes.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (sort === "price_asc") items.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") items.sort((a, b) => b.price - a.price);
  else if (sort === "name_asc") items.sort((a, b) => a.name.localeCompare(b.name));
  else items.sort((a, b) => a.featured - b.featured);

  return items;
}

function renderProducts() {
  const items = getFilteredSortedProducts();
  const container = $("#productGrid");

  // ១. បំបែកផលិតផលជាក្រុមៗតាម Brand
  const grouped = items.reduce((acc, p) => {
    if (!acc[p.brand]) acc[p.brand] = [];
    acc[p.brand].push(p);
    return acc;
  }, {});

  // ២. បង្កើត HTML សម្រាប់ក្រុម Brand នីមួយៗ
  let finalHtml = "";

  for (const brand in grouped) {
    finalHtml += `
      <section class="mb-10">
        <div class="flex items-end justify-between gap-3 mb-4">
          <div>
            <h3 class="text-base font-semibold">Brand ${escapeHtml(brand)}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Showing ${grouped[brand].length} items</p>
          </div>
          <button class="rounded-2xl border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 
                         dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800">
            All Products
          </button>
        </div>

        <div class="flex gap-4 pb-4 overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          ${grouped[brand].map(p => productCard(p)).join("")}
        </div>
      </section>
    `;
  }

  // ៣. បង្ហាញទៅក្នុង Container
  container.innerHTML = finalHtml || `<div class="text-center py-20 text-slate-500">No products found.</div>`;
}

// receipt modal (for demo, just shows cart)
function openReceiptModal() {
  // For now, let's show the cart if it has items, or a toast if empty
  if (cartCount() > 0) {
    openCart();
  } else {
    openCart();
  }
}

// ---------- Cart drawer ----------
const cartDrawer = document.getElementById("cartDrawer");
const openCart = () => {
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.remove("hidden");
  document.body.classList.add("no-scroll"); // Lock background
  renderCart();
};

const closeCart = () => {
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.add("hidden");
  document.body.classList.remove("no-scroll"); // Unlock background
}

// function showDetail(id) {
//   // ... existing logic to find product ...
//   $("#detail-modal").classList.remove("hidden");
//   $("#detail-modal").classList.add("flex");
//   document.body.classList.add("no-scroll"); // Lock background
// }

// function closeDetail() {
//   $("#detail-modal").classList.add("hidden");
//   $("#detail-modal").classList.remove("flex");
//   document.body.classList.remove("no-scroll"); // Unlock background
// }

$("#openCartBtn").addEventListener("click", () => { openCart(); renderCart(); });
$("#closeCartBtn").addEventListener("click", closeCart);
$("#cartOverlay").addEventListener("click", closeCart);

// Escape to close drawers/modals
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeCart(); closeCheckout(); }
});

function renderCartBadge() {
  $("#cartCount").textContent = cartCount();
  $("#cartSub").textContent = `${cartCount()} item${cartCount() === 1 ? "" : "s"}`;
  $("#checkoutBtn").disabled = cartCount() === 0;
}

function cartRow(p, qty) {
  return `
        <li class="rounded-2xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs text-slate-500 dark:text-slate-400">${escapeHtml(p.brand)}</p>
              <p class="mt-1 text-sm font-semibold truncate">${escapeHtml(p.name)} <span class="text-slate-400 font-medium">• ${escapeHtml(p.size)}</span></p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">${escapeHtml(p.vibe)}</p>
            </div>
            <p class="text-sm font-semibold whitespace-nowrap">${money(p.price * qty)}</p>
          </div>

          <div class="mt-3 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <button data-dec="${p.id}" class="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50
                                         dark:bg-slate-950 dark:border-slate-700 dark:hover:bg-slate-900">−</button>
              <span class="min-w-[2ch] text-center text-sm font-medium">${qty}</span>
              <button data-inc="${p.id}" class="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50
                                         dark:bg-slate-950 dark:border-slate-700 dark:hover:bg-slate-900">+</button>
            </div>
            <button data-del="${p.id}" class="rounded-xl border bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50
                                        dark:bg-slate-950 dark:border-slate-700 dark:hover:bg-slate-900">
              Remove
            </button>
          </div>
        </li>
      `;
}

function renderCart() {
  const entries = Object.entries(cart);
  const hasItems = entries.length > 0;
  $("#emptyCart").classList.toggle("hidden", hasItems);

  $("#cartItems").innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return p ? cartRow(p, qty) : "";
  }).join("");

  const sub = subtotal();
  const disc = discountAmount(sub);
  $("#subtotalText").textContent = money(sub);
  $("#discountText").textContent = `-${money(disc)}`;
  $("#totalText").textContent = money(sub - disc);
  $("#checkoutTotal").textContent = money(sub - disc);

  $("#promoHint").textContent = promo.codeApplied
    ? `Promo applied: ${PROMO_CODE} (10% off)`
    : `Try ${PROMO_CODE} for 10% off.`;

  $$("#cartItems [data-inc]").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.inc;
    setQty(id, (cart[id] || 0) + 1);
  }));
  $$("#cartItems [data-dec]").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.dec;
    setQty(id, (cart[id] || 0) - 1);
  }));
  $$("#cartItems [data-del]").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.del;
    delete cart[id];
    saveCart();
    renderCart();
    renderCartBadge();
    showToast("Removed 🗑️");
  }));
}

$("#clearCartBtn").addEventListener("click", () => {
  cart = {};
  saveCart();
  promo.codeApplied = false;
  savePromo();
  renderCart();
  renderCartBadge();
  showToast("Cart cleared");
});

$("#applyPromo").addEventListener("click", () => {
  const code = ($("#promoInput").value || "").trim().toUpperCase();
  if (code === PROMO_CODE) {
    promo.codeApplied = true;
    savePromo();
    renderCart();
    showToast("Promo applied 🎉");
  } else {
    promo.codeApplied = false;
    savePromo();
    renderCart();
    showToast("Invalid code");
  }
});

// ---------- Checkout modal ----------
const checkoutBackdrop = $("#checkoutBackdrop");
const openCheckout = () => {
  if (cartCount() === 0) return showToast("Cart is empty 🙂");
  checkoutBackdrop.classList.remove("hidden");
  checkoutBackdrop.classList.add("flex");
  $("#checkoutTotal").textContent = money(total());
};
const closeCheckout = () => {
  checkoutBackdrop.classList.add("hidden");
  checkoutBackdrop.classList.remove("flex");
};

$("#checkoutBtn").addEventListener("click", openCheckout);
$("#closeCheckout").addEventListener("click", closeCheckout);
checkoutBackdrop.addEventListener("click", (e) => { if (e.target === checkoutBackdrop) closeCheckout(); });

$("#checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const order = {
    name: $("#name").value.trim(),
    phone: $("#phone").value.trim(),
    address: $("#address").value.trim(),
    payment: $("#payment").value,
    note: $("#note").value.trim(),
    items: Object.entries(cart).map(([id, qty]) => {
      const p = PRODUCTS.find(x => x.id === id);
      return { id, name: p?.name, price: p?.price, qty };
    }),
    total: total(),
    promoApplied: promo.codeApplied
  };

  console.log("ORDER (demo):", order);

  closeCheckout();
  closeCart();
  cart = {};
  saveCart();
  promo.codeApplied = false;
  savePromo();
  renderCartBadge();
  showToast("Order placed ✅ (demo)");
  e.target.reset();
});

// ---------- Search / sort / clear ----------
function bindSearchSort() {
  const desktopSearch = $("#searchInput");
  const mobileSearch = $("#searchInputMobile");
  const desktopSort = $("#sortSelect");
  const mobileSort = $("#sortSelectMobile");

  const setSearch = (val) => { search = val; renderProducts(); };
  const setSort = (val) => { sort = val; renderProducts(); };

  desktopSearch.addEventListener("input", () => { setSearch(desktopSearch.value); mobileSearch.value = desktopSearch.value; });
  mobileSearch.addEventListener("input", () => { setSearch(mobileSearch.value); desktopSearch.value = mobileSearch.value; });

  desktopSort.addEventListener("change", () => { setSort(desktopSort.value); mobileSort.value = desktopSort.value; });
  mobileSort.addEventListener("change", () => { setSort(mobileSort.value); desktopSort.value = mobileSort.value; });

  $("#clearFilters").addEventListener("click", () => {
    search = "";
    sort = "featured";
    desktopSearch.value = "";
    mobileSearch.value = "";
    desktopSort.value = "featured";
    mobileSort.value = "featured";
    renderProducts();
    showToast("Cleared");
  });

  // Ctrl/Cmd + K to focus search
  window.addEventListener("keydown", (e) => {
    const isK = (e.key || "").toLowerCase() === "k";
    if (isK && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      (window.innerWidth >= 768 ? desktopSearch : mobileSearch).focus();
    }
  });
}

// ---------- Security: escape HTML ----------
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  // theme init
  initTheme();
  const tbtn = $("#themeToggle");
  if (tbtn) {
    tbtn.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "light" : "dark");
    });
  }

  // app init
  $("#year").textContent = new Date().getFullYear();
  bindSearchSort();
  renderProducts();
  renderCartBadge();
  renderCart();
});