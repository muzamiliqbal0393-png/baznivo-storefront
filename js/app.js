/* ==========================================================================
   BAZNIVO — app.js
   Header/footer injection, cart, wishlist, product rendering, page logic
   ========================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CFG = () => window.BAZNIVO_CONFIG || {};
const money = (n) => STORE.currency + ' ' + Number(n).toLocaleString('en-US');
const off = (p) => (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
const bySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
const catName = (slug) => (CATEGORIES.find((c) => c.slug === slug) || {}).name || slug;
const cartUrl = (text) => 'https://wa.me/' + STORE.whatsapp + '?text=' + encodeURIComponent(text);

/* ----------------------------- icons ----------------------------- */
const I = {
  truck: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h13v13H1z"/><path d="M14 8h4l3 3v5h-7z"/><circle cx="5.5" cy="19" r="2"/><circle cx="17.5" cy="19" r="2"/></svg>',
  tag: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.4"/></svg>',
  shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
  headset: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="14" width="4" height="6" rx="1.5"/><rect x="18" y="14" width="4" height="6" rx="1.5"/><path d="M20 20a4 4 0 0 1-4 4h-3"/></svg>',
  refresh: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/></svg>',
  star: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.6 7 .8-5.2 4.8 1.4 7L12 17.7 5.8 21.2l1.4-7L2 9.4l7-.8Z"/></svg>',
  heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 5.6a5.4 5.4 0 0 0-7.6 0L12 6.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21.6l8.8-8.8a5.4 5.4 0 0 0 0-7.2Z"/></svg>',
  heartFull: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.8 5.6a5.4 5.4 0 0 0-7.6 0L12 6.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21.6l8.8-8.8a5.4 5.4 0 0 0 0-7.2Z"/></svg>',
  cart: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.3A2 2 0 0 0 9.6 17h9.2a2 2 0 0 0 2-1.6L22 7H6"/></svg>',
  user: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
  search: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>',
  menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  chev: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  chevDown: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 5 5L20 6"/></svg>',
  wa: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 0 1 6.9 12.6l-.3.5.8 2.8-2.9-.8-.5.3A8.2 8.2 0 1 1 12 3.8Zm-3.6 4c-.2 0-.5 0-.7.3-.3.3-.9.9-.9 2s.9 2.3 1 2.5c.2.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.4l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.8-.1-.2 0-.4.1-.5l.5-.6c.1-.2.2-.3.3-.5v-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4Z"/></svg>',
  ig: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1Zm0 5a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm6.1-8.1a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z"/></svg>',
  fb: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.6V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.5V14h2.8v8h3.2Z"/></svg>',
  tt: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 2h-3v13.2a2.4 2.4 0 1 1-1.9-2.3V9.8a5.6 5.6 0 1 0 5 5.6V9.1a6 6 0 0 0 3.3 1V7a3.4 3.4 0 0 1-3.4-3.4V2Z"/></svg>',
  pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="11" r="2.6"/></svg>',
  mail: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/></svg>',
};

/* ----------------------------- storage ----------------------------- */
const readStore = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const writeStore = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const Cart = {
  items: readStore('baznivo-cart', []),
  save() {
    writeStore('baznivo-cart', this.items);
    renderCartCount();
  },
  add(slug, qty = 1) {
    const line = this.items.find((i) => i.slug === slug);
    if (line) line.qty += qty;
    else this.items.push({ slug, qty });
    this.save();
    openCart();
    toast('Added to cart');
  },
  setQty(slug, qty) {
    const line = this.items.find((i) => i.slug === slug);
    if (!line) return;
    line.qty = Math.max(1, qty);
    this.save();
    renderCart();
  },
  remove(slug) {
    this.items = this.items.filter((i) => i.slug !== slug);
    this.save();
    renderCart();
  },
  count() {
    return this.items.reduce((n, i) => n + i.qty, 0);
  },
  clear() {
    this.items = [];
    this.save();
    renderCart();
  },
  subtotal() {
    return this.items.reduce((sum, i) => {
      const p = bySlug(i.slug);
      return p ? sum + p.price * i.qty : sum;
    }, 0);
  },
};

/* cart lines whose product no longer exists in the catalogue are dropped,
   so the summary totals and checkout never see an undefined product */
Cart.prune = function () {
  const before = this.items.length;
  this.items = this.items.filter((i) => bySlug(i.slug));
  if (this.items.length !== before) this.save();
  return this.items;
};
Cart.lines = function () {
  return this.items.filter((i) => bySlug(i.slug));
};
Cart.count = function () {
  return this.lines().reduce((n, i) => n + i.qty, 0);
};

const Wishlist = {
  items: readStore('baznivo-wish', []),
  has(slug) {
    return this.items.includes(slug);
  },
  toggle(slug) {
    if (this.has(slug)) this.items = this.items.filter((s) => s !== slug);
    else this.items.push(slug);
    writeStore('baznivo-wish', this.items);
    renderWishCount();
    toast(this.has(slug) ? 'Saved to wishlist' : 'Removed from wishlist');
  },
};

/* ----------------------------- header / footer ----------------------------- */

/* ----------------------------- site config ----------------------------- */
function applyConfig() {
  const c = CFG();
  if (c.store) {
    Object.entries(c.store).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') STORE[k] = v;
    });
  }
  const promo = c.promo;
  const promoEl = $('#promo');
  if (promo && promoEl) {
    promoEl.innerHTML = `
      <div class="promo__in">
        <span class="promo__kicker">${promo.kicker || 'Offer'}</span>
        <h2>${promo.title || ''}</h2>
        <p>${promo.text || ''}</p>
        <div class="promo__actions">
          <a class="btn btn--white" href="${promo.href || 'shop.html'}">${promo.cta || 'Shop now'}</a>
          <a class="btn btn--onDark" href="contact.html">Ask a question</a>
        </div>
      </div>`;
  }
}

function headerHTML(active) {
  const navItem = (href, label, key) =>
    `<a class="nav__link${active === key ? ' is-active' : ''}" href="${href}">${label}</a>`;

  const catMenu = CATEGORIES.map(
    (c) => `<a href="shop.html?category=${c.slug}">${c.name}<span>${PRODUCTS.filter((p) => p.category === c.slug).length} items</span></a>`
  ).join('');

  return `
  <div class="topbar">
    <div class="container topbar__in">
      <div class="topbar__list">
        ${(CFG().announcement?.length ? CFG().announcement : ['Free delivery on orders over ' + money(STORE.freeShipAt)])
          .slice(0, 3)
          .map((t, i) => `<span class="topbar__item">${[I.truck, I.tag, I.shield][i] || I.shield} ${t}</span>`)
          .join('')}
      </div>
      <div class="topbar__socials">
        <a href="${cartUrl('Hello Baznivo!')}" aria-label="WhatsApp" target="_blank" rel="noopener">${I.wa}</a>
        <a href="#" aria-label="TikTok">${I.tt}</a>
        <a href="#" aria-label="Instagram">${I.ig}</a>
        <a href="#" aria-label="Facebook">${I.fb}</a>
      </div>
    </div>
  </div>

  <header class="header" id="site-header-el">
    <div class="container header__in">
      <button class="icon-btn burger" id="burger" aria-label="Menu">${I.menu}</button>
      <a class="brand" href="index.html" aria-label="Baznivo home">
        <img src="assets/img/logo.png" alt="Baznivo — Your Beauty, Your Style">
      </a>
      <nav class="nav" aria-label="Main">
        ${navItem('index.html', 'Home', 'home')}
        <div class="has-menu">
          <a class="nav__link${active === 'shop' ? ' is-active' : ''}" href="shop.html">Shop ${I.chevDown}</a>
          <div class="menu">
            <a href="shop.html">All products</a>
            <a href="shop.html?sort=new">New arrivals</a>
            <a href="shop.html?sort=discount">Offers</a>
            <a href="shop.html?sort=popular">Best sellers</a>
          </div>
        </div>
        <div class="has-menu">
          <button class="nav__link" type="button">Categories ${I.chevDown}</button>
          <div class="menu">${catMenu}</div>
        </div>
        ${navItem('about.html', 'About', 'about')}
        ${navItem('blog.html', 'Blog', 'blog')}
        ${navItem('contact.html', 'Contact', 'contact')}
      </nav>
      <div class="header__tools">
        <form class="search" action="shop.html" role="search">
          ${I.search}
          <input type="search" name="q" placeholder="Search products..." aria-label="Search products">
        </form>
        <a class="icon-btn" href="wishlist.html" aria-label="Wishlist">
          ${I.heart}<span class="badge-count" data-wish-count hidden>0</span>
        </a>
        <button class="icon-btn" type="button" data-cart-open aria-label="Cart">
          ${I.cart}<span class="badge-count" data-cart-count hidden>0</span>
        </button>
      </div>
    </div>
  </header>

  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <a class="brand" href="index.html"><img src="assets/img/logo.png" alt="Baznivo"></a>
      <button class="icon-btn" id="mobile-close" aria-label="Close menu">${I.close}</button>
    </div>
    <form class="search" action="shop.html" role="search" style="display:flex;margin-top:1rem">
      ${I.search}<input type="search" name="q" placeholder="Search products...">
    </form>
    <ul>
      <li><a href="index.html">Home</a></li>
      <li><a href="shop.html">Shop all</a></li>
      ${CATEGORIES.map((c) => `<li><a href="shop.html?category=${c.slug}">${c.name}</a></li>`).join('')}
      <li><a href="about.html">About</a></li>
      <li><a href="blog.html">Blog</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
  </nav>`;
}

function footerHTML() {
  return `
  <footer class="footer">
    <div class="container footer__top">
      <div class="footer__brand">
        <img src="assets/img/logo.png" alt="Baznivo">
        <p>Baznivo is a Pakistan-based makeup and beauty store — lipsticks, palettes, foundation, brushes and skincare. Genuine products, honest pricing and cash on delivery nationwide.</p>
        <div class="footer__contact">
          <span>${I.pin} ${STORE.city}</span>
          <span>${I.mail} ${STORE.email}</span>
          <span>${I.wa} +${STORE.whatsapp}</span>
        </div>
      </div>
      <div>
        <h4>Shop</h4>
        <ul>
          ${CATEGORIES.slice(0, 5).map((c) => `<li><a href="shop.html?category=${c.slug}">${c.name}</a></li>`).join('')}
          <li><a href="shop.html?sort=discount">Offers</a></li>
        </ul>
      </div>
      <div>
        <h4>Help</h4>
        <ul>
          <li><a href="contact.html">Contact us</a></li>
          <li><a href="contact.html#faq">Delivery &amp; returns</a></li>
          <li><a href="contact.html#faq">How to order</a></li>
          <li><a href="blog.html">Journal</a></li>
          <li><a href="about.html">About Baznivo</a></li>
        </ul>
      </div>
      <div>
        <h4>Order &amp; support</h4>
        <p style="font-size:.88rem">Order on WhatsApp or ask a question — we reply fast.</p>
        <a class="btn btn--sm" href="${cartUrl('Hello Baznivo! I would like to place an order.')}" target="_blank" rel="noopener" style="margin-top:.6rem">
          ${I.wa} Order on WhatsApp
        </a>
        <div class="footer__pay">
          <span>Cash on Delivery</span><span>JazzCash</span><span>EasyPaisa</span><span>Bank Transfer</span>
        </div>
      </div>
    </div>
    <div class="container footer__bottom">
      <span>© ${new Date().getFullYear()} Baznivo. All rights reserved.</span>
      <span>Genuine products · 7-day returns · Nationwide delivery · <a href="admin.html" style="color:#c9a7dd">Admin</a></span>
    </div>
  </footer>`;
}

function cartDrawerHTML() {
  return `
  <div class="overlay" id="overlay"></div>
  <aside class="drawer" id="cart-drawer" aria-label="Shopping cart">
    <div class="drawer__head">
      <h3>Your cart</h3>
      <button class="icon-btn" data-cart-close aria-label="Close cart">${I.close}</button>
    </div>
    <div class="drawer__body" id="cart-body"></div>
    <div class="drawer__foot" id="cart-foot"></div>
  </aside>
  <div class="toast-wrap" id="toasts"></div>
  <a class="wa-float" href="${cartUrl('Hello Baznivo! I have a question about a product.')}" target="_blank" rel="noopener" aria-label="WhatsApp">
    ${I.wa}<span>Chat with us</span>
  </a>`;
}

/* ----------------------------- toasts ----------------------------- */
function toast(msg) {
  const wrap = $('#toasts');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = I.check + '<span>' + msg + '</span>';
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

/* ----------------------------- cart UI ----------------------------- */
function renderCartCount() {
  const n = Cart.count();
  $$('[data-cart-count]').forEach((el) => {
    el.textContent = n;
    el.hidden = n === 0;
  });
}
function renderWishCount() {
  const n = Wishlist.items.length;
  $$('[data-wish-count]').forEach((el) => {
    el.textContent = n;
    el.hidden = n === 0;
  });
}

function renderCart() {
  const body = $('#cart-body');
  const foot = $('#cart-foot');
  if (!body) return;

  if (!Cart.items.length) {
    body.innerHTML = `<div class="cart-empty"><p><strong>Your cart is empty.</strong></p><p style="font-size:.86rem">Add a product to get started.</p><a class="btn btn--sm" href="shop.html">Start shopping</a></div>`;
    foot.innerHTML = '';
    return;
  }

  body.innerHTML = Cart.items
    .map((line) => {
      const p = bySlug(line.slug);
      if (!p) return '';
      return `
      <div class="line-item">
        <img src="${p.image}" alt="${p.name}">
        <div>
          <div class="line-item__name">${p.name}</div>
          <div class="line-item__qty">
            <button data-qty="-1" data-slug="${p.slug}" aria-label="Decrease quantity">−</button>
            <span>${line.qty}</span>
            <button data-qty="1" data-slug="${p.slug}" aria-label="Increase quantity">+</button>
          </div>
          <button class="line-item__remove" data-remove="${p.slug}">Remove</button>
        </div>
        <div class="line-item__price">${money(p.price * line.qty)}</div>
      </div>`;
    })
    .join('');

  const sub = Cart.subtotal();
  const ship = sub >= STORE.freeShipAt ? 0 : 200;
  const total = sub + ship;

  foot.innerHTML = `
    <div class="totals">
      <div class="totals__row"><span>Subtotal</span><strong>${money(sub)}</strong></div>
      <div class="totals__row"><span>Delivery</span><strong>${ship === 0 ? 'Free' : money(ship)}</strong></div>
      <div class="totals__row totals__row--grand"><span>Total</span><span>${money(total)}</span></div>
    </div>
    <a class="btn btn--block" href="checkout.html">Checkout &mdash; ${money(total)}</a>
    <a class="btn btn--ghost btn--block" href="${cartUrl(orderMessage())}" target="_blank" rel="noopener" style="margin-top:.5rem">${I.wa} Order on WhatsApp</a>
    <p class="cart-note">Cash on delivery available. Once your order is confirmed we send tracking on WhatsApp.</p>`;
}

function orderMessage() {
  const lines = Cart.items.map((line, i) => {
    const p = bySlug(line.slug);
    return p ? `${i + 1}. ${p.name} x${line.qty} — ${money(p.price * line.qty)}` : '';
  }).filter(Boolean);
  const sub = Cart.subtotal();
  return (
    'Hello Baznivo! I would like to place this order:\n\n' +
    lines.join('\n') +
    `\n\nSubtotal: ${money(sub)}\n\nNaam:\nAddress:\nCity:\nPhone:`
  );
}

function openCart() {
  renderCart();
  $('#cart-drawer')?.classList.add('is-open');
  $('#overlay')?.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  $('#cart-drawer')?.classList.remove('is-open');
  $('#overlay')?.classList.remove('is-open');
  $('#mobile-nav')?.classList.remove('is-open');
  document.body.style.overflow = '';
}


/* ----------------------------- hero slider ----------------------------- */
/* phones ko chhota (720p) file do, desktop ko full 1080p — same footage */
function heroVideoSrc(src) {
  if (!src || !/^assets\/video\//i.test(src)) return src;
  const small = window.matchMedia('(max-width: 800px)').matches;
  return small ? src.replace(/\.mp4$/i, '-720.mp4') : src;
}
function initHero() {
  const mount = $('#hero-slides');
  if (!mount) return;
  const cfg = window.BAZNIVO_CONFIG?.hero || {};
  const slides = (cfg.slides || []).filter((sl) => sl && (sl.image || sl.video));
  if (!slides.length) return;

  mount.innerHTML = slides
    .map(
      (sl, i) => `
    <div class="hero__slide${sl.layout === 'split' ? ' hero__slide--split' : ''}${i === 0 ? ' is-live' : ''}" role="group" aria-roledescription="slide" aria-label="Slide ${i + 1} of ${slides.length}">
      <div class="hero__media">
        ${
          sl.video
            ? `<video class="hero__video" muted loop playsinline preload="${i === 0 ? 'auto' : 'none'}" poster="${sl.poster || ''}" aria-hidden="true">
                 <source src="${heroVideoSrc(sl.video)}" type="video/mp4">
               </video>`
            : `<img src="${sl.image}" alt="${(sl.title || 'Baznivo').replace(/"/g, '')}"${i ? ' loading="lazy"' : ''} style="object-position:${sl.focus || 'center'}">`
        }
      </div>
      <div class="container hero__in">
        <div class="hero__content">
          <img class="hero__mark" src="assets/img/logo-white.png" alt="Baznivo">
          ${sl.kicker ? `<div class="hero__tagline">${sl.kicker}</div>` : ''}
          ${i === 0 ? `<h1 class="hero__title">${sl.title || ''}</h1>` : `<p class="hero__title">${sl.title || ''}</p>`}
          ${sl.sub ? `<p class="hero__sub">${sl.sub}</p>` : ''}
          <div class="hero__actions">
            ${sl.cta ? `<a class="btn btn--white" href="${sl.href || 'shop.html'}">${sl.cta}</a>` : ''}
            ${sl.cta2 ? `<a class="btn btn--onDark" href="${sl.href2 || 'shop.html'}">${sl.cta2}</a>` : ''}
          </div>
        </div>
      </div>
    </div>`
    )
    .join('');

  const els = $$('.hero__slide', mount);
  const dotsWrap = $('#hero-dots');
  if (dotsWrap && els.length > 1) {
    dotsWrap.innerHTML = els
      .map((_, i) => `<button class="hero__dot${i === 0 ? ' is-live' : ''}" data-slide="${i}" role="tab" aria-label="Go to slide ${i + 1}"></button>`)
      .join('');
  }

  let idx = 0;
  let timer = null;
  const interval = Math.max(1200, Number(cfg.interval) || 2000);
  const show = (i) => {
    idx = (i + els.length) % els.length;
    els.forEach((el, n) => {
      const live = n === idx;
      el.classList.toggle('is-live', live);
      const v = el.querySelector('video');
      if (!v) return;
      if (live) {
        v.play?.().catch(() => {});
      } else {
        v.pause?.();
        try { v.currentTime = 0; } catch {}
      }
    });
    $$('.hero__dot', dotsWrap || document).forEach((d, n) => d.classList.toggle('is-live', n === idx));
  };
  show(0);
  const start = () => {
    if (els.length < 2 || reduceMotion) return;
    stop();
    timer = setInterval(() => show(idx + 1), interval);
  };
  const stop = () => timer && clearInterval(timer);

  $('#hero-prev')?.addEventListener('click', () => {
    show(idx - 1);
    start();
  });
  $('#hero-next')?.addEventListener('click', () => {
    show(idx + 1);
    start();
  });
  dotsWrap?.addEventListener('click', (e) => {
    const d = e.target.closest('[data-slide]');
    if (!d) return;
    show(Number(d.dataset.slide));
    start();
  });

  const heroEl = $('#hero');
  heroEl?.addEventListener('mouseenter', stop);
  heroEl?.addEventListener('mouseleave', start);
  heroEl?.addEventListener('focusin', stop);
  start();
}

/* ----------------------------- product card ----------------------------- */
function productCard(p) {
  const rating =
    p.reviews > 0
      ? `<div class="rating">${I.star.repeat(Math.max(1, Math.round(p.rating)))} <span>${p.rating.toFixed(1)} (${p.reviews})</span></div>`
      : '<div class="rating rating--empty"><span>New arrival</span></div>';
  return `
  <article class="p-card reveal">
    <a class="p-card__media" href="product.html?slug=${p.slug}" aria-label="${p.name}">
      <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.closest('.p-card__media').classList.add('is-empty')">
      <div class="p-card__badges">
        ${p.badge ? `<span class="chip${p.badge === 'Limited' ? ' chip--gold' : ''}">${p.badge}</span>` : ''}
        ${off(p) >= 15 ? `<span class="chip chip--green">-${off(p)}%</span>` : ''}
        ${p.stock === 0 ? '<span class="chip chip--muted">Out of stock</span>' : ''}
      </div>
    </a>
    <button class="p-card__wish${Wishlist.has(p.slug) ? ' is-on' : ''}" data-wish="${p.slug}" aria-label="Wishlist">
      ${Wishlist.has(p.slug) ? I.heartFull : I.heart}
    </button>
    <div class="p-card__quick">
      <button class="btn btn--sm btn--block" data-add="${p.slug}"${p.stock === 0 ? ' disabled' : ''}>${I.cart} ${p.stock === 0 ? 'Out of stock' : 'Add to cart'}</button>
    </div>
    <div class="p-card__body">
      <span class="p-card__cat">${catName(p.category)}</span>
      <h3 class="p-card__name"><a href="product.html?slug=${p.slug}">${p.name}</a></h3>
      ${rating}
      <div class="p-card__price">
        <span class="price-now">${money(p.price)}</span>
        ${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span><span class="price-off">-${off(p)}%</span>` : ''}
      </div>
    </div>
  </article>`;
}

/* ----------------------------- page boot ----------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  // real API data (agar available ho) load hone ka intezaar
  try {
    if (window.BAZNIVO_API_READY) await window.BAZNIVO_API_READY;
  } catch {}
  const SRC = window.BAZNIVO_SOURCE === 'api' ? 'API' : 'mock';
  console.info('[Baznivo] catalog source:', SRC, '| products:', PRODUCTS.length);
  const page = document.body.dataset.page || 'home';

  applyConfig();

  const headerMount = $('#site-header');
  if (headerMount) headerMount.innerHTML = headerHTML(page);
  const footerMount = $('#site-footer');
  if (footerMount) footerMount.innerHTML = footerHTML();
  document.body.insertAdjacentHTML('beforeend', cartDrawerHTML());

  Cart.prune(); /* drop lines for products that no longer exist */
  renderCartCount();
  renderWishCount();
  renderCart();

  /* global click handling */
  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      const qtyEl = $('#pd-qty');
      const qty = qtyEl && add.dataset.add === document.body.dataset.slug ? Number(qtyEl.textContent) : 1;
      Cart.add(add.dataset.add, qty || 1);
      return;
    }
    const wish = e.target.closest('[data-wish]');
    if (wish) {
      e.preventDefault();
      Wishlist.toggle(wish.dataset.wish);
      wish.classList.toggle('is-on', Wishlist.has(wish.dataset.wish));
      wish.innerHTML = Wishlist.has(wish.dataset.wish) ? I.heartFull : I.heart;
      if (page === 'shop' && new URLSearchParams(location.search).get('wish')) renderShop();
      return;
    }
    if (e.target.closest('[data-cart-open]')) return openCart();
    if (e.target.closest('[data-cart-close]') || e.target.id === 'overlay') return closeCart();

    const qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) {
      const line = Cart.items.find((i) => i.slug === qtyBtn.dataset.slug);
      if (line) Cart.setQty(line.slug, line.qty + Number(qtyBtn.dataset.qty));
      return;
    }
    const rm = e.target.closest('[data-remove]');
    if (rm) return Cart.remove(rm.dataset.remove);

    if (e.target.closest('#burger')) {
      $('#mobile-nav')?.classList.add('is-open');
      $('#overlay')?.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      return;
    }
    if (e.target.closest('#mobile-close')) return closeCart();
  });

  /* sticky header shadow */
  const headerEl = $('#site-header-el');
  if (headerEl) {
    const onScroll = () => headerEl.classList.toggle('is-stuck', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* reveal on scroll */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add('is-in');
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.08 }
      )
    : null;
  const watchReveals = () => {
    $$('.reveal:not(.is-in)').forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));
  };
  watchReveals();
  window.watchReveals = watchReveals;

  /* newsletter */
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-newsletter]');
    if (!form) return;
    e.preventDefault();
    toast('Thanks — you are subscribed.');
    form.reset();
  });

  /* hero slider (admin-managed, default 2s) */
  initHero();

  /* page specific */
  if ($('#home-featured')) {
    const pinned = (CFG().featured || []).map((slug) => bySlug(slug)).filter(Boolean);
    const featured = pinned.length ? pinned : window.BAZNIVO_FEATURED?.length ? window.BAZNIVO_FEATURED : PRODUCTS.slice(0, 8);
    const fresh = window.BAZNIVO_NEW?.length ? window.BAZNIVO_NEW : PRODUCTS.slice(0, 4);
    $('#home-featured').innerHTML = featured.slice(0, 8).map((p) => productCard(p)).join('');
    $('#home-new').innerHTML = fresh.slice(0, 4).map((p) => productCard(p)).join('');

    /* reviews — sirf jab asli feedback ho */
    const reviews = window.BAZNIVO_REVIEWS?.length
      ? window.BAZNIVO_REVIEWS
      : window.BAZNIVO_SOURCE === 'api'
      ? []
      : REVIEWS;
    if (reviews.length) {
      $('#home-reviews').innerHTML = reviews
        .map(
          (r) => `
        <div class="review reveal">
          <div class="review__stars">${I.star.repeat(r.stars || 5)}</div>
          <p>“${r.text}”</p>
          <div class="review__who">
            <span class="review__avatar">${(r.name || 'B')[0]}</span>
            <div><strong>${r.name}</strong><span>${r.city || 'Pakistan'} · Verified buyer</span></div>
          </div>
        </div>`
        )
        .join('');
    } else {
      $('#sec-reviews')?.remove();
    }

    /* journal — real blog posts */
    const posts = window.BAZNIVO_POSTS?.length
      ? window.BAZNIVO_POSTS
      : JOURNAL.map((j) => ({ ...j, href: 'blog.html' }));
    if (posts.length) {
      $('#home-journal').innerHTML = posts
        .slice(0, 3)
        .map(
          (j) => `
        <article class="p-card p-card--story reveal">
          <a class="p-card__media" href="${j.href || 'blog.html?slug=' + j.slug}">
            <img src="${j.image}" alt="${j.title}" loading="lazy">
          </a>
          <div class="p-card__body">
            <span class="p-card__cat">${j.date}</span>
            <h3 class="p-card__name"><a href="${j.href || 'blog.html?slug=' + j.slug}">${j.title}</a></h3>
            <p class="p-card__excerpt">${j.excerpt}</p>
            <a class="link-more" href="${j.href || 'blog.html?slug=' + j.slug}">Read story ${I.chev}</a>
          </div>
        </article>`
        )
        .join('');
    } else {
      $('#sec-journal')?.remove();
    }

    /* categories — top 6, real covers */
    $('#cat-grid').innerHTML = CATEGORIES.slice(0, 6)
      .map(
        (c) => `
      <a class="cat-card reveal" href="shop.html?category=${c.slug}">
        <img src="${c.image}" alt="${c.name}" loading="lazy">
        <span class="cat-card__label">${c.name} ${I.chev}</span>
      </a>`
      )
      .join('');

    const chips = $('#brand-chips');
    if (chips) chips.innerHTML = CATEGORIES.slice(0, 6).map((c) => `<a class="btn btn--ghost btn--sm" href="shop.html?category=${c.slug}">${c.name}</a>`).join('');
    watchReveals();
  }

  if (page === 'shop') initShop();
  if (page === 'product') initProduct();
  if (page === 'contact') initContact();
  if (page === 'wishlist') initWishlist();
  if (page === 'checkout') initCheckout();
  if (page === 'order') initOrderSuccess();
});

/* ----------------------------- shop page ----------------------------- */
let shopState = { category: [], q: '', sort: 'new', max: 100000, wish: false };

function initShop() {
  const params = new URLSearchParams(location.search);
  // mobile par filters band, desktop par khule
  const filtersEl = $('#filters');
  if (filtersEl) filtersEl.open = window.innerWidth > 980;
  if (params.get('category')) shopState.category = [params.get('category')];
  if (params.get('q')) shopState.q = params.get('q').toLowerCase();
  if (params.get('wish')) shopState.wish = true;
  const ceiling = Math.max(...PRODUCTS.map((p) => p.price), 1000);
  shopState.max = Math.ceil(ceiling / 500) * 500;
  const price = $('#filter-price');
  if (price) {
    price.max = shopState.max;
    price.value = shopState.max;
    if ($('#price-label')) $('#price-label').textContent = money(shopState.max);
  }
  shopState.sort = params.get('sort') || 'new';

  const filterWrap = $('#filter-cats');
  if (filterWrap) {
    filterWrap.innerHTML = CATEGORIES.map(
      (c) => `<label class="check"><input type="checkbox" value="${c.slug}" ${shopState.category.includes(c.slug) ? 'checked' : ''}> ${c.name}</label>`
    ).join('');
    filterWrap.addEventListener('change', () => {
      shopState.category = $$('input:checked', filterWrap).map((i) => i.value);
      renderShop();
    });
  }

  if (price) {
    price.addEventListener('input', () => {
      shopState.max = Number(price.value);
      $('#price-label').textContent = money(shopState.max);
      renderShop();
    });
  }

  const sortSel = $('#sort');
  if (sortSel) {
    sortSel.value = shopState.sort;
    sortSel.addEventListener('change', () => {
      shopState.sort = sortSel.value;
      renderShop();
    });
  }

  renderShop();
}

function renderShop() {
  const grid = $('#shop-grid');
  if (!grid) return;

  let list = PRODUCTS.slice();
  if (shopState.category.length) list = list.filter((p) => shopState.category.includes(p.category));
  if (shopState.q)
    list = list.filter(
      (p) => (p.name + ' ' + p.brand + ' ' + catName(p.category) + ' ' + p.blurb).toLowerCase().includes(shopState.q)
    );
  if (shopState.wish) list = list.filter((p) => Wishlist.has(p.slug));
  list = list.filter((p) => p.price <= shopState.max);

  if (shopState.sort === 'low') list.sort((a, b) => a.price - b.price);
  else if (shopState.sort === 'high') list.sort((a, b) => b.price - a.price);
  else if (shopState.sort === 'new') list.sort((a, b) => b.id - a.id);
  else if (shopState.sort === 'discount') list.sort((a, b) => off(b) - off(a));
  else list.sort((a, b) => b.sortId - a.sortId);

  $('#shop-count').textContent = `${list.length} products`;
  const chipWrap = $('#active-filters');
  if (chipWrap) {
    chipWrap.innerHTML = [
      ...shopState.category.map((c) => `<span class="chip chip--purple">${catName(c)}</span>`),
      shopState.q ? `<span class="chip">“${shopState.q}”</span>` : '',
      shopState.wish ? '<span class="chip chip--green">Wishlist</span>' : '',
    ].join('');
  }

  grid.innerHTML = list.length
    ? list.map(productCard).join('')
    : `<div class="empty" style="grid-column:1/-1"><p><strong>No products found.</strong></p><p>Try different filters or browse the full catalogue.</p><a class="btn btn--sm" href="shop.html">All products</a></div>`;
  window.watchReveals?.();
}

/* ----------------------------- product page ----------------------------- */
function initProduct() {
  const slug = new URLSearchParams(location.search).get('slug') || PRODUCTS[0].slug;
  const p = bySlug(slug) || PRODUCTS[0];
  document.body.dataset.slug = p.slug;

  $('#pd-crumb').innerHTML = `<a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <a href="shop.html?category=${p.category}">${catName(p.category)}</a> / <span>${p.name}</span>`;

  /* SEO: real title, canonical and Product structured data per product */
  document.title = /Baznivo/i.test(p.name) ? `${p.name} | Official Store` : `${p.name} — ${money(p.price)} | Baznivo`;
  const canon = document.querySelector('link[rel="canonical"]');
  if (canon) canon.href = `${location.origin}/product?slug=${p.slug}`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', (p.desc || p.blurb || '').slice(0, 158));
  const ogT = document.querySelector('meta[property="og:title"]');
  if (ogT) ogT.setAttribute('content', `${p.name} — Baznivo`);
  const ogI = document.querySelector('meta[property="og:image"]');
  if (ogI) ogI.setAttribute('content', location.origin + '/' + String(p.image).replace(/^\.?\//, ''));
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: location.origin + '/' + String(p.image).replace(/^\.?\//, ''),
    description: p.desc || p.blurb,
    brand: { '@type': 'Brand', name: p.brand || 'Baznivo' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: p.price,
      availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${location.origin}/product?slug=${p.slug}`,
    },
  });
  document.head.appendChild(ld);

  let active = p.image;
  const paint = () => {
    $('#pd-gallery').innerHTML = `
      <div class="pd__main"><img src="${active}" alt="${p.name}"></div>
      <div class="pd__thumbs">${p.gallery
        .map((g) => `<button class="pd__thumb${g === active ? ' is-live' : ''}" data-thumb="${g}"><img src="${g}" alt=""></button>`)
        .join('')}</div>`;
  };
  paint();

  $('#pd-info').innerHTML = `
    <span class="pd__brand">${p.brand}</span>
    <h1>${p.name}</h1>
    ${p.reviews > 0 ? `<div class="rating">${I.star.repeat(Math.max(1, Math.round(p.rating)))} <span>${p.rating.toFixed(1)} · ${p.reviews} reviews</span></div>` : '<div class="rating rating--empty"><span>New arrival</span></div>'}
    <div class="pd__price">
      <span class="price-now">${money(p.price)}</span>
      ${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span><span class="chip chip--green">-${off(p)}%</span>` : ''}
    </div>
    <span class="pd__stock">${p.stock > 0 ? 'In stock — ready to ship' : 'Out of stock'}</span>
    <p class="pd__desc">${p.desc || p.blurb}</p>
    ${p.shades.length ? `<div class="shades">${p.shades
      .map((s, i) => `<button class="shade${i === 0 ? ' is-live' : ''}" style="background:${s}" aria-label="Shade ${i + 1}"></button>`)
      .join('')}<span style="font-size:.82rem;color:var(--muted)">${p.shades.length} shades</span></div>` : ''}
    <div class="pd__buy">
      <div class="qty">
        <button data-pd-qty="-1" aria-label="Decrease quantity">−</button>
        <span id="pd-qty">1</span>
        <button data-pd-qty="1" aria-label="Increase quantity">+</button>
      </div>
      <button class="btn" data-add="${p.slug}">${I.cart} Add to cart</button>
      <a class="btn btn--ghost" href="${cartUrl('Hello Baznivo! I am interested in: ' + p.name + ' (' + money(p.price) + ')')}" target="_blank" rel="noopener">${I.wa} Buy on WhatsApp</a>
    </div>
    <div class="pd__meta">
      <span>${I.truck} Free delivery on orders above ${money(STORE.freeShipAt)}</span>
      <span>${I.refresh} 14-day easy returns</span>
      <span>${I.shield} 100% original products</span>
    </div>
    <div class="acc">
      <details open>
        <summary>Description</summary>
        <div class="acc__body"><p>${p.blurb}</p></div>
      </details>
      ${
        Object.keys(p.specs || {}).length
          ? `<details>
        <summary>Specifications</summary>
        <div class="acc__body"><ul>${Object.entries(p.specs)
          .map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`)
          .join('')}</ul></div>
      </details>`
          : ''
      }
      ${
        p.howTo?.length
          ? `<details>
        <summary>How to use</summary>
        <div class="acc__body"><ul>${p.howTo.map((h) => `<li>${h}</li>`).join('')}</ul></div>
      </details>`
          : ''
      }
      <details>
        <summary>Delivery &amp; returns</summary>
        <div class="acc__body">
          <p>Delivery across Pakistan in 2–4 working days. Cash on delivery available. If something is not right, request a return within 14 days.</p>
        </div>
      </details>
    </div>`;

  $('#pd-related').innerHTML = PRODUCTS.filter((x) => x.slug !== p.slug)
    .sort((a, b) => (b.category === p.category) - (a.category === p.category))
    .slice(0, 4)
    .map(productCard)
    .join('');

  document.title = `${p.name} — ${p.brand} | Baznivo`;

  document.addEventListener('click', (e) => {
    const thumb = e.target.closest('[data-thumb]');
    if (thumb) {
      active = thumb.dataset.thumb;
      paint();
      return;
    }
    const q = e.target.closest('[data-pd-qty]');
    if (q) {
      const el = $('#pd-qty');
      el.textContent = Math.max(1, Number(el.textContent) + Number(q.dataset.pdQty));
      return;
    }
    const shade = e.target.closest('.shade');
    if (shade) {
      $$('.shade').forEach((s) => s.classList.remove('is-live'));
      shade.classList.add('is-live');
    }
  });

  window.watchReveals?.();
}

/* ----------------------------- contact page ----------------------------- */
function initContact() {
  const form = $('#contact-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const msg = `Hello Baznivo!\nName: ${data.get('name')}\nPhone: ${data.get('phone')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
    window.open(cartUrl(msg), '_blank');
    toast('Opening WhatsApp — just tap send.');
  });
}

/* ==========================================================================
   Wishlist page
   ========================================================================== */
function initWishlist() {
  const grid = $('#wish-grid');
  if (!grid) return;
  const paint = () => {
    const items = PRODUCTS.filter((p) => Wishlist.has(p.slug));
    $('#wish-count-label').textContent = items.length + (items.length === 1 ? ' product' : ' products');
    grid.innerHTML = items.length
      ? items.map(productCard).join('')
      : `<div class="empty" style="grid-column:1/-1">
           <p><strong>Your wishlist is empty.</strong></p>
           <p>Tap the heart on any product to save it here for later.</p>
           <a class="btn btn--sm" href="shop.html">Shop now</a>
         </div>`;
    window.watchReveals?.();
  };
  paint();
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-wish]')) setTimeout(paint, 30);
  });
}

/* ==========================================================================
   Orders (saved in this browser — confirmed on WhatsApp)
   ========================================================================== */
const Orders = {
  all() {
    return readStore('baznivo-orders', []);
  },
  add(order) {
    const list = this.all();
    list.unshift(order);
    writeStore('baznivo-orders', list.slice(0, 30));
  },
  find(id) {
    return this.all().find((o) => o.id === id);
  },
  setStatus(id, status, message) {
    const list = this.all();
    const o = list.find((x) => x.id === id);
    if (!o) return;
    o.send = { status, message: message || '', at: new Date().toISOString() };
    writeStore('baznivo-orders', list);
  },
  clear() {
    writeStore('baznivo-orders', []);
  },
};

const COUPONS = { CASTMATICS10: { off: 0.1, min: 1500, label: '10% off' } };

function totalsFor(couponCode) {
  const sub = Cart.subtotal();
  const ship = sub === 0 ? 0 : sub >= STORE.freeShipAt ? 0 : 200;
  const c = COUPONS[String(couponCode || '').toUpperCase().trim()];
  const ok = c && sub >= c.min;
  const discount = ok ? Math.round(sub * c.off) : 0;
  return { sub, ship, discount, total: Math.max(0, sub + ship - discount), coupon: ok ? c : null };
}

/* order forwarding — set `ordersWebhook` in site-config.js / admin Store settings */
function orderWebhookUrl() {
  const u = window.BAZNIVO_CONFIG?.ordersWebhook;
  return typeof u === 'string' && /^https:\/\//i.test(u.trim()) ? u.trim() : '';
}

function orderPayload(order) {
  return {
    _subject: `Baznivo order ${order.id}`,
    _template: 'table',
    _captcha: 'false',
    Order: order.id,
    Placed: new Date(order.date).toLocaleString('en-GB'),
    Customer: order.customer.name,
    Phone: order.customer.phone,
    Email: order.customer.email || '-',
    Address: `${order.customer.address}, ${order.customer.city}`,
    Notes: order.customer.notes || '-',
    Payment: order.payment,
    Items: order.items.map((i) => `${i.qty} x ${i.name} @ ${money(i.price)}`).join(' | '),
    Subtotal: money(order.totals.sub),
    Delivery: order.totals.ship === 0 ? 'Free' : money(order.totals.ship),
    Total: money(order.totals.total),
    Store: location.origin,
  };
}

/* returns 'sent' | 'failed' | 'off' — never throws, never blocks the order */
async function sendOrderNotice(order) {
  const url = orderWebhookUrl();
  if (!url) return 'off';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(orderPayload(order)),
      signal: ctrl.signal,
    });
    const d = await r.json().catch(() => ({}));
    const ok = r.ok && String(d.success) !== 'false';
    Orders.setStatus(order.id, ok ? 'sent' : 'failed', d.message || '');
    return ok ? 'sent' : 'failed';
  } catch (err) {
    Orders.setStatus(order.id, 'failed', err.message || 'network');
    return 'failed';
  } finally {
    clearTimeout(timer);
  }
}

/* ==========================================================================
   Checkout page
   ========================================================================== */
function initCheckout() {
  if (!$('#checkout')) return;
  let couponCode = sessionStorage.getItem('baznivo-coupon') || '';

  const renderSummary = () => {
    const t = totalsFor(couponCode);
    const items = Cart.lines()
      .map((line) => {
        const p = bySlug(line.slug);
        if (!p) return '';
        return `<div class="summary__item">
          <img src="${p.image}" alt="${p.name}">
          <div><strong style="font-size:.85rem;color:var(--purple-deep)">${p.name}</strong>
          <div class="summary__qty">Qty ${line.qty} × ${money(p.price)}</div></div>
          <div style="font-weight:700;color:var(--pink-strong)">${money(p.price * line.qty)}</div>
        </div>`;
      })
      .join('');

    $('#summary').innerHTML = `
      <h3>Your order (${Cart.count()} items)</h3>
      <div class="summary__items">${items || '<p style="font-size:.85rem;color:var(--muted)">Your cart is empty.</p>'}</div>
      <div class="coupon-row">
        <input id="coupon" placeholder="Coupon code" value="${couponCode}" aria-label="Coupon code">
        <button class="btn btn--ghost btn--sm" type="button" id="apply-coupon">Apply</button>
      </div>
      <div class="form-msg" id="coupon-msg"></div>
      <div class="summary__totals">
        <div><span>Subtotal</span><strong>${money(t.sub)}</strong></div>
        <div><span>Delivery</span><strong>${t.ship === 0 ? 'Free' : money(t.ship)}</strong></div>
        ${t.discount ? `<div style="color:var(--green)"><span>Discount (${t.coupon.label})</span><strong>− ${money(t.discount)}</strong></div>` : ''}
        <div class="grand"><span>Total</span><span>${money(t.total)}</span></div>
      </div>
      <p class="cart-note">We send tracking on WhatsApp as soon as your order is confirmed.</p>`;

    $('#apply-coupon')?.addEventListener('click', () => {
      couponCode = $('#coupon').value;
      sessionStorage.setItem('baznivo-coupon', couponCode);
      const c = COUPONS[couponCode.toUpperCase().trim()];
      renderSummary();
      const msg = $('#coupon-msg');
      if (!c) msg.className = 'form-msg is-bad', (msg.textContent = 'That coupon code is not valid.');
      else if (Cart.subtotal() < c.min) msg.className = 'form-msg is-bad', (msg.textContent = `This coupon requires a minimum order of ${money(c.min)}.`);
      else msg.className = 'form-msg is-ok', (msg.textContent = `Coupon applied — ${c.label}`);
    });
    return t;
  };

  renderSummary();

  $('#checkout-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    Cart.prune();
    if (!Cart.items.length) {
      toast('Your cart is empty — add a product first.');
      return;
    }
    const fd = new FormData(e.target);
    const t = totalsFor(couponCode);
    const order = {
      id: 'BZ-' + Date.now().toString(36).toUpperCase().slice(-6),
      date: new Date().toISOString(),
      items: Cart.items
        .map((l) => {
          const p = bySlug(l.slug);
          return p ? { slug: l.slug, name: p.name, price: p.price, qty: l.qty } : null;
        })
        .filter(Boolean),
      totals: t,
      customer: {
        name: (fd.get('name') || '').toString().trim(),
        phone: (fd.get('phone') || '').toString().trim(),
        email: (fd.get('email') || '').toString().trim(),
        address: (fd.get('address') || '').toString().trim(),
        city: (fd.get('city') || '').toString().trim(),
        notes: (fd.get('notes') || '').toString().trim(),
      },
      payment: (fd.get('payment') || 'cod').toString(),
    };
    Orders.add(order);
    Cart.clear();
    sessionStorage.removeItem('baznivo-coupon');
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) {
      btn.dataset.label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Placing your order…';
    }
    const status = await sendOrderNotice(order); // never throws
    location.href = 'order-success.html?order=' + encodeURIComponent(order.id) + '&send=' + status;
  });
}

/* ==========================================================================
   Order success page
   ========================================================================== */
function initOrderSuccess() {
  const wrap = $('#order-wrap');
  if (!wrap) return;
  const id = new URLSearchParams(location.search).get('order') || '';
  const order = Orders.find(id);

  if (!order) {
    wrap.innerHTML = `<div class="empty"><p><strong>Order not found.</strong></p>
      <p>Your browser data may have been cleared. Confirm your order on WhatsApp and we will help.</p>
      <a class="btn btn--sm" href="contact.html">Contact us</a></div>`;
    return;
  }

  const t = order.totals;
  const payLabel = { cod: 'Cash on Delivery', jazzcash: 'JazzCash', easypaisa: 'EasyPaisa' }[order.payment] || order.payment;
  const waText =
    `Hello Baznivo! Please confirm my order:\nOrder #${order.id}\n\n` +
    order.items.map((i, n) => `${n + 1}. ${i.name} x${i.qty} — ${money(i.price * i.qty)}`).join('\n') +
    `\n\nTotal: ${money(t.total)} (${payLabel})\nName: ${order.customer.name}\nPhone: ${order.customer.phone}\nAddress: ${order.customer.address}, ${order.customer.city}`;

  $('#order-ref').textContent = 'Order #' + order.id;

  const sendState = new URLSearchParams(location.search).get('send') || order.send?.status || 'off';
  const note =
    sendState === 'sent'
      ? 'Your order has been sent to our team. We confirm it on WhatsApp shortly.'
      : sendState === 'failed'
        ? 'Your order is saved on this device. Tap the WhatsApp button so we can confirm it straight away.'
        : 'Your order is saved on this device. Tap the WhatsApp button to send it to our team.';
  const noteEl = document.getElementById('order-send-note');
  if (noteEl) {
    noteEl.textContent = note;
    noteEl.className = 'form-msg ' + (sendState === 'sent' ? 'is-ok' : 'is-bad');
  }
  $('#order-details').innerHTML = `
    <h3>Order summary</h3>
    <div class="summary__items">
      ${order.items
        .map((i) => {
          const p = bySlug(i.slug);
          return `<div class="summary__item">
            <img src="${p ? p.image : ''}" alt="${i.name}">
            <div><strong style="font-size:.85rem;color:var(--purple-deep)">${i.name}</strong>
            <div class="summary__qty">Qty ${i.qty} × ${money(i.price)}</div></div>
            <div style="font-weight:700;color:var(--pink-strong)">${money(i.price * i.qty)}</div>
          </div>`;
        })
        .join('')}
    </div>
    <div class="summary__totals">
      <div><span>Subtotal</span><strong>${money(t.sub)}</strong></div>
      <div><span>Delivery</span><strong>${t.ship === 0 ? 'Free' : money(t.ship)}</strong></div>
      ${t.discount ? `<div style="color:var(--green)"><span>Discount</span><strong>− ${money(t.discount)}</strong></div>` : ''}
      <div class="grand"><span>Total</span><span>${money(t.total)}</span></div>
      <div style="color:var(--muted);font-size:.82rem"><span>Payment</span><span>${payLabel}</span></div>
    </div>
    <div style="border-top:1px dashed var(--line);margin-top:.9rem;padding-top:.9rem;font-size:.86rem;color:var(--body)">
      <strong style="color:var(--purple-deep)">Delivery to</strong><br>
      ${order.customer.name}<br>${order.customer.address}, ${order.customer.city}<br>${order.customer.phone}
    </div>`;

  $('#order-wa').href = cartUrl(waText);

  $('#order-timeline').innerHTML = `
    <div class="tl is-done"><div class="tl__dot">${I.check}</div><div><strong>Order received</strong><span>Your order has been recorded.</span></div></div>
    <div class="tl"><div class="tl__dot">2</div><div><strong>WhatsApp confirmation</strong><span>We message you to confirm the details.</span></div></div>
    <div class="tl"><div class="tl__dot">3</div><div><strong>Dispatch</strong><span>2–4 working days, with a tracking number.</span></div></div>
    <div class="tl"><div class="tl__dot">4</div><div><strong>Delivered</strong><span>Pay cash when the parcel arrives.</span></div></div>`;
}
