/* ==========================================================================
   BAZNIVO — API bridge
   Live store API (baznivo.vercel.app/api/*) se real catalog load karta hai.
   API na mile to js/data.js ka bundled catalog use hota hai (offline-safe).
   ========================================================================== */

const API_HOST = 'https://baznivo.vercel.app'; // production backend
const API_PREFIX = '/api';                     // vercel.json rewrite -> API_HOST
const API_TIMEOUT = 5000;

async function apiGet(path, ms = API_TIMEOUT) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(API_PREFIX + path, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
      credentials: 'omit',
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

const absImg = (p) => {
  if (!p) return '';
  if (/^https?:/i.test(p)) return p;
  return API_HOST + (p.startsWith('/') ? p : '/' + p);
};

const toMajor = (v) => (v == null ? null : Math.round(Number(v)) / 100);

function mapCategory(c) {
  return {
    slug: c.slug,
    name: c.name,
    image: absImg(c.image),
    blurb: (c.description || '').replace(/^[^·]*·\s*/, '') || 'Thoughtfully selected.',
    count: c.product_count || 0,
  };
}

function mapProduct(p) {
  const price = toMajor(p.effective_price ?? p.sale_price ?? p.price);
  const regular = toMajor(p.price);
  let oldPrice = regular && regular > price ? regular : null;
  if (oldPrice && oldPrice > price * 5) oldPrice = null; // ghalat enter hui price (data bug) ignore
  const gallery = [absImg(p.image)];
  return {
    id: p.id,
    slug: p.slug,
    apiId: p.id,
    name: p.name,
    brand: p.brand || 'Baznivo',
    category: p.category_slug || 'all',
    price,
    oldPrice,
    image: absImg(p.image),
    gallery,
    badge: p.featured ? 'Best Seller' : '',
    rating: p.rating ? Number(p.rating) : 4.5,
    reviews: p.review_count || 0,
    stock: p.stock || 0,
    shades: [],
    blurb: (p.description || '').split('. ')[0] + '.',
    desc: p.description || '',
    specs: p.specifications && typeof p.specifications === 'object' ? p.specifications : {},
    howTo: [
      'Saaf, dry skin par lagayein.',
      'Halki layer se shuru karein, phir build karein.',
      'Istemaal ke baad dhak kar thandi jagah rakhein.',
    ],
    raw: p,
  };
}

function mapSettings(s) {
  if (!s) return null;
  const wa = (s.social_whatsapp || '').match(/(\d{10,15})/);
  return {
    name: s.store_name || STORE.name,
    whatsapp: wa ? wa[1] : STORE.whatsapp,
    email: s.support_email || STORE.email,
    announcement: s.announcement || '',
    currency: 'Rs',
  };
}

/* ---------- boot: real data -> globals (mock = fallback) ---------- */
window.BAZNIVO_API_READY = (async () => {
  const forceMock = new URLSearchParams(location.search).has('mock');
  if (forceMock) {
    window.BAZNIVO_SOURCE = 'mock';
    return;
  }
  try {
    const [prodRes, catRes, setRes] = await Promise.all([
      apiGet('/products?limit=100'),
      apiGet('/categories'),
      apiGet('/settings'),
    ]);

    const apiProducts = (prodRes.items || []).filter((p) => p.published !== 0).map(mapProduct);
    const apiCats = (catRes.items || []).filter((c) => c.active !== 0);

    if (apiProducts.length) {
      PRODUCTS = apiProducts;
      window.BAZNIVO_SOURCE = 'api';
    }
    if (apiCats.length) {
      const used = new Set(apiProducts.map((p) => p.category));
      const cats = apiCats.map(mapCategory).filter((c) => !used.size || used.has(c.slug) || c.count > 0);
      if (cats.length) CATEGORIES = cats.slice(0, 12);
    }
    const st = mapSettings(setRes.settings);
    if (st) {
      STORE.whatsapp = st.whatsapp;
      if (st.email) STORE.email = st.email;
      if (st.announcement) STORE.announcement = st.announcement;
    }
  } catch (err) {
    window.BAZNIVO_SOURCE = 'mock';
    console.warn('[Baznivo] API unavailable, bundled catalog use ho raha hai:', err.message);
  }
})();
