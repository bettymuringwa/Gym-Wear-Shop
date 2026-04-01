/* =============================================
   SIMBA ACTIVE — app.js
   All JavaScript for the frontend.

   When backend is ready (ASP.NET Core / C#),
   replace localStorage calls with fetch() to
   your API endpoints e.g. POST /api/cart/add
   ============================================= */

/* --------------------------------------------------
   PRODUCT DATA
   TODO: Replace with fetch('/api/products') when
   your C# API is ready
-------------------------------------------------- */
const PRODUCTS = [
  { id:1,  name:"Pride Training Tee",  cat:"tops",        category:"Training Tops",   price:249, badge:"new",  colors:["#6b7c5c","#272724","#f4efe6"], emoji:"👕", bg:"bg-a" },
  { id:2,  name:"Sage Muscle Tank",    cat:"tops",        category:"Training Tops",   price:199, badge:"hot",  colors:["#8a9b72","#c9a882"],           emoji:"🥋", bg:"bg-b" },
  { id:3,  name:"Nude Crop Top",       cat:"tops",        category:"Training Tops",   price:229, badge:null,   colors:["#c9a882","#dfc4a3","#272724"],  emoji:"👚", bg:"bg-c" },
  { id:4,  name:"Olive Flex Shorts",   cat:"bottoms",     category:"Shorts & Tights", price:279, badge:"new",  colors:["#6b7c5c","#272724","#c9a882"],  emoji:"🩳", bg:"bg-g" },
  { id:5,  name:"Earth Tights",        cat:"bottoms",     category:"Shorts & Tights", price:349, badge:null,   colors:["#7a5c3c","#272724"],            emoji:"🩲", bg:"bg-d" },
  { id:6,  name:"Taupe Joggers",       cat:"bottoms",     category:"Shorts & Tights", price:329, badge:null,   colors:["#c2b49c","#4a4a46"],            emoji:"👖", bg:"bg-h" },
  { id:7,  name:"Full Pride Set",      cat:"sets",        category:"Full Sets",        price:549, oldPrice:699, badge:"sale", colors:["#6b7c5c","#c9a882","#272724"], emoji:"🦁", bg:"bg-f" },
  { id:8,  name:"Nude Training Set",   cat:"sets",        category:"Full Sets",        price:499, badge:null,   colors:["#c9a882","#6b7c5c"],            emoji:"⚡", bg:"bg-e" },
  { id:9,  name:"Resistance Bands",    cat:"accessories", category:"Accessories",      price:149, badge:"new",  colors:["#6b7c5c","#7a5c3c"],            emoji:"💪", bg:"bg-a" },
  { id:10, name:"Training Gloves",     cat:"accessories", category:"Accessories",      price:179, badge:null,   colors:["#272724","#c9a882"],            emoji:"🥊", bg:"bg-f" },
];


/* --------------------------------------------------
   CART — uses localStorage for now.
   When C# API is ready, swap saveCart() and
   loadCart() with fetch() calls to:
     POST /api/cart/add
     DELETE /api/cart/remove
     GET /api/cart
-------------------------------------------------- */
let cart = JSON.parse(localStorage.getItem('simba_cart') || '[]');

function saveCart() {
  localStorage.setItem('simba_cart', JSON.stringify(cart));
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateBadge() {
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = cartCount();
}

function addToCart(id) {
  const product = PRODUCTS.find(x => x.id === id);
  if (!product) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  updateBadge();
  showToast(`${product.name} added to cart`);
}

function removeItem(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateBadge();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeItem(id);
    return;
  }

  saveCart();
  updateBadge();
  renderCart();
}


/* --------------------------------------------------
   CART SIDEBAR — open, close, render
-------------------------------------------------- */
function openCart() {
  renderCart();
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartSidebar').classList.add('open');
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartSidebar').classList.remove('open');
}

function renderCart() {
  const wrap  = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const foot  = document.getElementById('cartFoot');

  if (!cart.length) {
    wrap.innerHTML = '';
    empty.style.display = 'block';
    foot.style.display  = 'none';
    return;
  }

  empty.style.display = 'none';
  foot.style.display  = 'block';

  document.getElementById('cartSub').textContent = `P${cartTotal()}`;
  document.getElementById('cartTot').textContent = `P${cartTotal()}`;

  wrap.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <div class="ci-thumb ${item.bg}">${item.emoji}</div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-meta">${item.category} · Size: M</div>
        <div class="ci-controls">
          <div class="qty-row">
            <button class="q-btn" onclick="changeQty(${item.id}, -1)">
              <i data-lucide="minus" style="width:11px;height:11px;"></i>
            </button>
            <div class="q-n">${item.qty}</div>
            <button class="q-btn" onclick="changeQty(${item.id}, 1)">
              <i data-lucide="plus" style="width:11px;height:11px;"></i>
            </button>
          </div>
          <div style="display:flex;align-items:center;gap:0.4rem;">
            <span class="ci-price-tag">P${item.price * item.qty}</span>
            <button class="ci-del" onclick="removeItem(${item.id})">
              <i data-lucide="x" style="width:12px;height:12px;"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}


/* --------------------------------------------------
   PRODUCTS GRID — render with optional filter
-------------------------------------------------- */
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const list = filter === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.cat === filter);

  grid.innerHTML = list.map(p => `
    <div class="product-card reveal">
      <div class="product-img ${p.bg}">
        ${p.emoji}
        ${p.badge ? `<span class="p-badge badge-${p.badge}">
          ${p.badge === 'new' ? 'New' : p.badge === 'hot' ? 'Hot' : 'Sale'}
        </span>` : ''}
        <div class="p-quick">
          <button class="q-add" onclick="addToCart(${p.id})">+ Add to Cart</button>
          <button class="q-view" onclick="showToast('Product pages coming soon!')" title="Quick view">
            <i data-lucide="eye" style="width:14px;height:14px;"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="p-cat">${p.category}</div>
        <div class="p-name">${p.name}</div>
        <div class="p-foot">
          <div class="p-price">
            ${p.oldPrice ? `<span class="old">P${p.oldPrice}</span>` : ''}
            P${p.price}
          </div>
          <div class="p-colors">
            ${p.colors.map(c => `<div class="pdot" style="background:${c}"></div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Re-bind filter tab clicks each time products render
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts(btn.dataset.filter);
    });
  });

  lucide.createIcons();
  observeReveal();
}


/* --------------------------------------------------
   FILTER + SCROLL TO PRODUCTS
   Called by category cards
-------------------------------------------------- */
function filterGo(filter) {
  document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });

  setTimeout(() => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
    renderProducts(filter);
  }, 650);
}


/* --------------------------------------------------
   TOAST NOTIFICATION
-------------------------------------------------- */
let _toastTimer;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}


/* --------------------------------------------------
   SCROLL REVEAL ANIMATION
-------------------------------------------------- */
function observeReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal:not(.vis)').forEach(el => observer.observe(el));
}


/* --------------------------------------------------
   NAV — add shadow when user scrolls down
-------------------------------------------------- */
function initNav() {
  window.addEventListener('scroll', () => {
    document.getElementById('mainNav')?.classList.toggle('scrolled', window.scrollY > 30);
  });
}


/* --------------------------------------------------
   SMOOTH SCROLL — for all anchor <a href="#..."> links
-------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}


/* --------------------------------------------------
   INIT — runs when the page finishes loading
-------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  renderProducts();
  updateBadge();
  observeReveal();
  initNav();
  initSmoothScroll();
});