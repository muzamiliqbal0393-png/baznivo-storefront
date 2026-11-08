/* ==========================================================================
   BAZNIVO — app.js
   Header/footer injection, cart, wishlist, product rendering, page logic
   ========================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

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
    toast('Cart mein add ho gaya');
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
    toast(this.has(slug) ? 'Wishlist mein add ho gaya' : 'Wishlist se nikal diya');
  },
};

/* ----------------------------- header / footer ----------------------------- */
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
        <span class="topbar__item">${I.truck} Free Delivery on Orders Above ${money(STORE.freeShipAt)}</span>
        <span class="topbar__item">${I.tag} Best Prices Guaranteed</span>
        <span class="topbar__item">${I.shield} Secure &amp; Easy Payments</span>
      </div>
      <div class="topbar__socials">
        <a href="${cartUrl('Assalam o Alaikum!')}" aria-label="WhatsApp" target="_blank" rel="noopener">${I.wa}</a>
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
        <p>Makeup, skincare aur beauty essentials — sirf original products, cash on delivery ke saath, poore Pakistan mein.</p>
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
          <li><a href="blog.html">Beauty journal</a></li>
          <li><a href="about.html">About Baznivo</a></li>
        </ul>
      </div>
      <div>
        <h4>Order karein</h4>
        <p style="font-size:.88rem">WhatsApp par order ya sawal — turant jawab.</p>
        <a class="btn btn--sm" href="${cartUrl('Assalam o Alaikum! Mujhe order karna hai.')}" target="_blank" rel="noopener" style="margin-top:.6rem">
          ${I.wa} WhatsApp par order
        </a>
        <div class="footer__pay">
          <span>Cash on Delivery</span><span>JazzCash</span><span>EasyPaisa</span><span>Bank Transfer</span>
        </div>
      </div>
    </div>
    <div class="container footer__bottom">
      <span>© ${new Date().getFullYear()} Baznivo. All rights reserved.</span>
      <span>Original products · 14-day easy returns · Nationwide delivery</span>
    </div>
  </footer>`;
}

function cartDrawerHTML() {
  return `
  <div class="overlay" id="overlay"></div>
  <aside class="drawer" id="cart-drawer" aria-label="Shopping cart">
    <div class="drawer__head">
      <h3>Aap ka cart</h3>
      <button class="icon-btn" data-cart-close aria-label="Close cart">${I.close}</button>
    </div>
    <div class="drawer__body" id="cart-body"></div>
    <div class="drawer__foot" id="cart-foot"></div>
  </aside>
  <div class="toast-wrap" id="toasts"></div>
  <a class="wa-float" href="${cartUrl('Assalam o Alaikum! Baznivo par makeup products ke bare mein poochna hai.')}" target="_blank" rel="noopener" aria-label="WhatsApp">
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
    body.innerHTML = `<div class="cart-empty"><p><strong>Aap ka cart khali hai.</strong></p><p style="font-size:.86rem">Makeup picks shamil karein aur shopping shuru karein.</p><a class="btn btn--sm" href="shop.html">Shop now</a></div>`;
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
            <button data-qty="-1" data-slug="${p.slug}" aria-label="Kam karein">−</button>
            <span>${line.qty}</span>
            <button data-qty="1" data-slug="${p.slug}" aria-label="Barhayein">+</button>
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
    <a class="btn btn--ghost btn--block" href="${cartUrl(orderMessage())}" target="_blank" rel="noopener" style="margin-top:.5rem">${I.wa} WhatsApp par order</a>
    <p class="cart-note">Cash on delivery available. Order confirm hone par hum WhatsApp par tracking bhejte hain.</p>`;
}

function orderMessage() {
  const lines = Cart.items.map((line, i) => {
    const p = bySlug(line.slug);
    return p ? `${i + 1}. ${p.name} x${line.qty} — ${money(p.price * line.qty)}` : '';
  }).filter(Boolean);
  const sub = Cart.subtotal();
  return (
    'Assalam o Alaikum! Mujhe ye order karna hai:\n\n' +
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

/* ----------------------------- product card ----------------------------- */
function productCard(p) {
  const stars = I.star.repeat(Math.round(p.rating));
  return `
  <article class="p-card reveal">
    <a class="p-card__media" href="product.html?slug=${p.slug}" aria-label="${p.name}">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="p-card__badges">
        ${p.badge ? `<span class="chip${p.badge === 'New' ? ' chip--purple' : p.badge === 'Limited' ? ' chip--gold' : ''}">${p.badge}</span>` : ''}
        ${off(p) >= 15 ? `<span class="chip chip--green">-${off(p)}%</span>` : ''}
      </div>
    </a>
    <button class="p-card__wish${Wishlist.has(p.slug) ? ' is-on' : ''}" data-wish="${p.slug}" aria-label="Wishlist">
      ${Wishlist.has(p.slug) ? I.heartFull : I.heart}
    </button>
    <div class="p-card__quick">
      <button class="btn btn--sm btn--block" data-add="${p.slug}">${I.cart} Add to cart</button>
    </div>
    <div class="p-card__body">
      <span class="p-card__cat">${catName(p.category)}</span>
      <h3 class="p-card__name"><a href="product.html?slug=${p.slug}">${p.name}</a></h3>
      <div class="rating">${stars} <span>${p.rating.toFixed(1)} (${p.reviews})</span></div>
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

  const headerMount = $('#site-header');
  if (headerMount) headerMount.innerHTML = headerHTML(page);
  const footerMount = $('#site-footer');
  if (footerMount) footerMount.innerHTML = footerHTML();
  document.body.insertAdjacentHTML('beforeend', cartDrawerHTML());

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
    toast('Shukriya! Aap newsletter mein shamil ho gaye.');
    form.reset();
  });

  /* hero slider */
  const heroSlides = $$('.hero__slide');
  if (heroSlides.length) {
    let idx = 0;
    const dots = $$('.hero__dot');
    const show = (i) => {
      idx = (i + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((s, n) => s.classList.toggle('is-live', n === idx));
      dots.forEach((d, n) => d.classList.toggle('is-live', n === idx));
    };
    $('[data-hero-prev]')?.addEventListener('click', () => show(idx - 1));
    $('[data-hero-next]')?.addEventListener('click', () => show(idx + 1));
    dots.forEach((d, n) => d.addEventListener('click', () => show(n)));
    setInterval(() => show(idx + 1), 7000);
  }

  /* page specific */
  if ($('#home-featured')) {
    $('#home-featured').innerHTML = PRODUCTS.filter((p) => p.badge).concat(PRODUCTS.slice(0, 4)).slice(0, 8).map(productCard).join('');
    $('#home-new').innerHTML = PRODUCTS.filter((p) => p.id >= 9).concat(PRODUCTS.slice(0, 4)).slice(0, 4).map(productCard).join('');
    $('#home-reviews').innerHTML = REVIEWS.map(
      (r) => `
      <div class="review reveal">
        <div class="review__stars">${I.star.repeat(r.stars)}</div>
        <p>“${r.text}”</p>
        <div class="review__who">
          <span class="review__avatar">${r.name[0]}</span>
          <div><strong>${r.name}</strong><span>${r.city} · Verified buyer</span></div>
        </div>
      </div>`
    ).join('');
    $('#home-journal').innerHTML = JOURNAL.map(
      (j) => `
      <article class="p-card reveal">
        <a class="p-card__media" href="blog.html"><img src="${j.image}" alt="${j.title}" loading="lazy"></a>
        <div class="p-card__body">
          <span class="p-card__cat">${j.date}</span>
          <h3 class="p-card__name">${j.title}</h3>
          <p style="font-size:.85rem;color:var(--muted);margin:0">${j.excerpt}</p>
          <a class="link-more" href="blog.html">Read story ${I.chev}</a>
        </div>
      </article>`
    ).join('');
    $('#cat-grid').innerHTML = CATEGORIES.map(
      (c) => `
      <a class="cat-card reveal" href="shop.html?category=${c.slug}">
        <img src="${c.image}" alt="${c.name}" loading="lazy">
        <span class="cat-card__label">${c.name} ${I.chev}</span>
      </a>`
    ).join('');
    const chips = $('#brand-chips');
    if (chips) chips.innerHTML = CATEGORIES.map((c) => `<a class="btn btn--ghost btn--sm" href="shop.html?category=${c.slug}">${c.name}</a>`).join('');
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
let shopState = { category: [], q: '', sort: 'popular', max: 4000, wish: false };

function initShop() {
  const params = new URLSearchParams(location.search);
  if (params.get('category')) shopState.category = [params.get('category')];
  if (params.get('q')) shopState.q = params.get('q').toLowerCase();
  if (params.get('wish')) shopState.wish = true;
  shopState.sort = params.get('sort') || 'popular';

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

  const price = $('#filter-price');
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
  else list.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews);

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
    : `<div class="empty" style="grid-column:1/-1"><p><strong>Koi product nahi mila.</strong></p><p>Filters change karein ya saara catalog dekhein.</p><a class="btn btn--sm" href="shop.html">All products</a></div>`;
  window.watchReveals?.();
}

/* ----------------------------- product page ----------------------------- */
function initProduct() {
  const slug = new URLSearchParams(location.search).get('slug') || PRODUCTS[0].slug;
  const p = bySlug(slug) || PRODUCTS[0];
  document.body.dataset.slug = p.slug;

  $('#pd-crumb').innerHTML = `<a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <a href="shop.html?category=${p.category}">${catName(p.category)}</a> / <span>${p.name}</span>`;

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
    <div class="rating">${I.star.repeat(Math.round(p.rating))} <span>${p.rating.toFixed(1)} · ${p.reviews} reviews</span></div>
    <div class="pd__price">
      <span class="price-now">${money(p.price)}</span>
      ${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span><span class="chip chip--green">-${off(p)}%</span>` : ''}
    </div>
    <span class="pd__stock">${p.stock > 0 ? 'In stock — ready to ship' : 'Out of stock'}</span>
    <p class="pd__desc">${p.desc}</p>
    ${p.shades.length ? `<div class="shades">${p.shades
      .map((s, i) => `<button class="shade${i === 0 ? ' is-live' : ''}" style="background:${s}" aria-label="Shade ${i + 1}"></button>`)
      .join('')}<span style="font-size:.82rem;color:var(--muted)">${p.shades.length} shades</span></div>` : ''}
    <div class="pd__buy">
      <div class="qty">
        <button data-pd-qty="-1" aria-label="Kam karein">−</button>
        <span id="pd-qty">1</span>
        <button data-pd-qty="1" aria-label="Barhayein">+</button>
      </div>
      <button class="btn" data-add="${p.slug}">${I.cart} Add to cart</button>
      <a class="btn btn--ghost" href="${cartUrl('Assalam o Alaikum! Mujhe ye product chahiye: ' + p.name + ' (' + money(p.price) + ')')}" target="_blank" rel="noopener">${I.wa} Buy on WhatsApp</a>
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
      <details>
        <summary>Specifications</summary>
        <div class="acc__body"><ul>${Object.entries(p.specs)
          .map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`)
          .join('')}</ul></div>
      </details>
      <details>
        <summary>Kaise lagayein</summary>
        <div class="acc__body"><ul>${p.howTo.map((h) => `<li>${h}</li>`).join('')}</ul></div>
      </details>
      <details>
        <summary>Delivery &amp; returns</summary>
        <div class="acc__body">
          <p>Poore Pakistan mein delivery, 2–4 working days. Cash on delivery available. Product pasand na aaye to 14 din ke andar return request kar sakte hain.</p>
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
    const msg = `Assalam o Alaikum! Naam: ${data.get('name')}\nPhone: ${data.get('phone')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
    window.open(cartUrl(msg), '_blank');
    toast('WhatsApp khul raha hai — bas send dabayein.');
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
           <p><strong>Wishlist khali hai.</strong></p>
           <p>Product card par dil ke nishan par click karein — wo yahan save ho jayega.</p>
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
   Orders (local record — WhatsApp par confirm hota hai)
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

/* ==========================================================================
   Checkout page
   ========================================================================== */
function initCheckout() {
  if (!$('#checkout')) return;
  let couponCode = sessionStorage.getItem('baznivo-coupon') || '';

  const renderSummary = () => {
    const t = totalsFor(couponCode);
    const items = Cart.items
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
      <h3>Aap ka order (${Cart.count()} items)</h3>
      <div class="summary__items">${items || '<p style="font-size:.85rem;color:var(--muted)">Cart khali hai.</p>'}</div>
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
      <p class="cart-note">Order confirm hone par hum WhatsApp par tracking bhejte hain.</p>`;

    $('#apply-coupon')?.addEventListener('click', () => {
      couponCode = $('#coupon').value;
      sessionStorage.setItem('baznivo-coupon', couponCode);
      const c = COUPONS[couponCode.toUpperCase().trim()];
      renderSummary();
      const msg = $('#coupon-msg');
      if (!c) msg.className = 'form-msg is-bad', (msg.textContent = 'Ye coupon valid nahi hai.');
      else if (Cart.subtotal() < c.min) msg.className = 'form-msg is-bad', (msg.textContent = `Is coupon ke liye minimum order ${money(c.min)} hai.`);
      else msg.className = 'form-msg is-ok', (msg.textContent = `Coupon lag gaya — ${c.label}`);
    });
    return t;
  };

  renderSummary();

  $('#checkout-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!Cart.items.length) {
      toast('Cart khali hai — pehle koi product add karein.');
      return;
    }
    const fd = new FormData(e.target);
    const t = totalsFor(couponCode);
    const order = {
      id: 'BZ-' + Date.now().toString(36).toUpperCase().slice(-6),
      date: new Date().toISOString(),
      items: Cart.items.map((l) => {
        const p = bySlug(l.slug);
        return { slug: l.slug, name: p.name, price: p.price, qty: l.qty };
      }),
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
    location.href = 'order-success.html?order=' + encodeURIComponent(order.id);
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
    wrap.innerHTML = `<div class="empty"><p><strong>Order nahi mila.</strong></p>
      <p>Ho sakta hai browser ka data clear ho gaya ho. WhatsApp par apna order confirm karein.</p>
      <a class="btn btn--sm" href="contact.html">Contact karein</a></div>`;
    return;
  }

  const t = order.totals;
  const payLabel = { cod: 'Cash on Delivery', jazzcash: 'JazzCash', easypaisa: 'EasyPaisa' }[order.payment] || order.payment;
  const waText =
    `Assalam o Alaikum! Order confirm karna hai:\nOrder #${order.id}\n\n` +
    order.items.map((i, n) => `${n + 1}. ${i.name} x${i.qty} — ${money(i.price * i.qty)}`).join('\n') +
    `\n\nTotal: ${money(t.total)} (${payLabel})\nNaam: ${order.customer.name}\nPhone: ${order.customer.phone}\nAddress: ${order.customer.address}, ${order.customer.city}`;

  $('#order-ref').textContent = 'Order #' + order.id;
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
    <div class="tl is-done"><div class="tl__dot">${I.check}</div><div><strong>Order mil gaya</strong><span>Aap ka order record ho gaya hai.</span></div></div>
    <div class="tl"><div class="tl__dot">2</div><div><strong>WhatsApp confirmation</strong><span>Hum aap ko message kar ke confirm karte hain.</span></div></div>
    <div class="tl"><div class="tl__dot">3</div><div><strong>Dispatch</strong><span>2–4 working days, tracking number ke saath.</span></div></div>
    <div class="tl"><div class="tl__dot">4</div><div><strong>Delivered</strong><span>Cash on delivery par payment.</span></div></div>`;
}
