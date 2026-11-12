/* ==========================================================================
   BAZNIVO — API bridge (live store API)
   Real catalog, categories, settings, blog. API na mile to bundled fallback.
   ========================================================================== */

const API_HOST = 'https://baznivo.vercel.app';
const API_PREFIX = '/api';
const API_TIMEOUT = 6000;

async function apiGet(path, ms = API_TIMEOUT) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(API_PREFIX + path, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

/* Store ki images cross-origin block karti hain (CORP: same-origin),
   is liye unhe /media/ proxy (vercel.json rewrite) ke through same-origin serve karte hain. */
const CFG_BEAUTY_ONLY = () => {
  const c = window.BAZNIVO_CONFIG || {};
  return c.beautyOnly !== false;
};

const absImg = (p) => {
  if (!p) return '';
  let path = p;
  if (/^https?:/i.test(p)) {
    try {
      const u = new URL(p);
      if (u.host !== new URL(API_HOST).host) return p;
      path = u.pathname;
    } catch {
      return p;
    }
  }
  path = path.replace(/^\/?assets\//, '');
  return '/media/' + path.replace(/^\//, '');
};

/* Prices minor units (paisa) mein hain. Kabhi kabhi admin mein rupees type ho jati hain
   (e.g. 3990 ka Matlab Rs 3,990) — us surat mein correct karte hain. */
function priceOf(p) {
  const eff = Number(p.effective_price ?? p.sale_price ?? p.price ?? 0);
  let v = Math.round(eff / 100);
  if (v < 100) {
    const alt = Math.round(Number(p.sale_price || p.price || 0) / 100);
    if (alt < 100) v = alt * 100;
    else v = alt;
  }
  return v;
}

function oldPriceOf(p, price) {
  const regular = Math.round(Number(p.price || 0) / 100);
  if (!regular || regular <= price) return null;
  if (regular > price * 5) return null; // corrupt value
  return regular;
}

function mapProduct(p) {
  const price = priceOf(p);
  const specs = p.specifications && typeof p.specifications === 'object' ? p.specifications : {};
  const desc = (p.description || '').trim();
  return {
    id: p.id,
    apiId: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand || 'Baznivo',
    category: p.category_slug || 'all',
    categoryName: p.category_name || '',
    price,
    oldPrice: oldPriceOf(p, price),
    image: absImg(p.image),
    gallery: [absImg(p.image)],
    badge: Number(p.featured) === 1 ? 'Best Seller' : '',
    featured: Number(p.featured) === 1,
    rating: p.rating ? Number(p.rating) : 4.6,
    reviews: Number(p.review_count || 0),
    stock: Number(p.stock || 0),
    shades: [],
    blurb: desc ? desc.split('. ')[0].replace(/\.$/, '') + '.' : '',
    desc,
    specs,
    howTo: [],
    sortId: Number(p.id) || 0,
    createdAt: p.created_at || '',
  };
}

function mapCategory(c, products) {
  const own = products.filter((p) => p.category === c.slug);
  const cover = own.find((p) => p.image)?.image || absImg(c.image);
  return {
    slug: c.slug,
    name: c.name,
    image: cover,
    blurb: (c.description || '').replace(/^[^·]*·\s*/, '').trim() || `${own.length} products`,
    count: own.length || Number(c.product_count || 0),
  };
}


/* Live API ki categories mix hain (hoodie "makeup" mein, jeans "face-makeup" mein).
   Is liye storefront par product name ke basis par saaf groups banate hain.
   Admin se categories theek ho jayein to CATEGORY_RULES hata dein / ?rawcats=1. */
const CATEGORY_RULES = [
  { slug: 'beauty', name: 'Beauty & Care', kw: ['serum', 'lipstick', 'foundation', 'mascara', 'kajal', 'eyeliner', 'blush', 'palette', 'makeup brush', 'brush set', 'shampoo', 'conditioner', 'face wash', 'moistur', 'sunscreen', 'perfume', 'fragrance', 'skincare', 'nail', 'foundation', 'concealer', 'powder', 'beauty'] },
  { slug: 'footwear', name: 'Footwear', kw: ['sneaker', 'shoe', 'sandal', 'slipper', 'boot', 'heel', 'khussa', 'chappal', 'jogger', 'loafer'] },
  { slug: 'bags', name: 'Bags & Backpacks', kw: ['bag', 'backpack', 'tote', 'clutch', 'wallet', 'purse', 'luggage', 'handbag'] },
  { slug: 'watches', name: 'Watches', kw: ['watch', 'chronograph'] },
  { slug: 'electronics', name: 'Electronics', kw: ['headphone', 'earbud', 'earphone', 'speaker', 'camera', 'keyboard', 'mouse', 'charger', 'power bank', 'laptop', 'mobile', 'smartphone', 'tablet', 'monitor', 'console', 'microphone'] },
  { slug: 'fashion', name: 'Fashion', kw: ['hoodie', 'tee', 't-shirt', 'shirt', 'dress', 'jeans', 'trouser', 'kurta', 'jacket', 'sweater', 'sweatshirt', 'top', 'abaya', 'shawl', 'dupatta', 'sunglass', 'belt', 'cap', 'scarf', 'jewel'] },
  { slug: 'sports', name: 'Sports & Fitness', kw: ['gym', 'yoga', 'dumbbell', 'training', 'fitness', 'cycle', 'racket', 'sports', 'bottle'] },
  { slug: 'home', name: 'Home & Living', kw: ['mug', 'cup', 'cushion', 'lamp', 'pantry', 'kitchen', 'towel', 'bed', 'living', 'cookware', 'plate', 'vase', 'storage', 'mattress'] },
  { slug: 'groceries', name: 'Groceries', kw: ['grocery', 'rice', 'oil', 'flour', 'spice', 'snack', 'tea', 'coffee'] },
];

const API_CAT_FALLBACK = {
  'makeup': 'beauty',
  'face-makeup': 'beauty',
  'health-beauty': 'beauty',
  'shoes-footwear': 'footwear',
  'bags-backpacks': 'bags',
  'watches': 'watches',
  'smart-watches': 'watches',
  'electronics': 'electronics',
  'mobile-accessories': 'electronics',
  'women-s-fashion': 'fashion',
  'gym-fitness': 'sports',
  'sports-accessories': 'sports',
  'home-essentials': 'home',
  'groceries': 'groceries',
};

function groupOf(p) {
  const hay = `${p.name} ${p.brand || ''}`.toLowerCase();
  const rule = CATEGORY_RULES.find((r) => r.kw.some((k) => hay.includes(k)));
  if (rule) return rule;
  const fb = API_CAT_FALLBACK[p.category];
  return CATEGORY_RULES.find((r) => r.slug === fb) || { slug: 'more', name: 'Others' };
}

function buildCategories(products) {
  const groups = new Map();
  products.forEach((p) => {
    const g = groups.get(p.category) || { slug: p.category, name: p.categoryName, image: '', count: 0 };
    g.count += 1;
    if (!g.image && p.image) g.image = p.image;
    groups.set(p.category, g);
  });
  return [...groups.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function mapPost(p) {
  const d = new Date((p.created_at || '').replace(' ', 'T'));
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || '',
    body: p.body || '',
    image: absImg(p.image),
    author: p.author || 'Baznivo Editorial',
    date: isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
}

/* ---------------- boot ---------------- */
/* Bundled (makeup-only) catalogue — API mein makeup products na hone par yeh use hota hai */
const BUNDLED_PRODUCTS = PRODUCTS.slice();
const BUNDLED_CATEGORIES = CATEGORIES.slice();
const BUNDLED_JOURNAL = typeof JOURNAL !== 'undefined' ? JOURNAL.slice() : [];

window.BAZNIVO_API_READY = (async () => {
  if (new URLSearchParams(location.search).has('mock')) {
    window.BAZNIVO_SOURCE = 'mock';
    return;
  }
  try {
    const [prodRes, catRes, setRes, blogRes, revRes] = await Promise.all([
      apiGet('/products?limit=100'),
      apiGet('/categories'),
      apiGet('/settings'),
      apiGet('/blog').catch(() => ({ items: [] })),
      apiGet('/reviews').catch(() => ({ items: [] })),
    ]);

    const published = (prodRes.items || []).filter((p) => Number(p.published) !== 0).map(mapProduct);
    const withStock = published.filter((p) => p.stock > 0);
    const liveProducts = withStock.length >= 4 ? withStock : published; // sold-out items home/shop par hide

    const beautyOnly = CFG_BEAUTY_ONLY();

    if (liveProducts.length) {
      const rawCats = new URLSearchParams(location.search).has('rawcats');
      const apiCatName = new Map((catRes.items || []).map((c) => [c.slug, c.name]));
      liveProducts.forEach((p) => {
        p.apiCategory = p.category;
        if (!rawCats) {
          const g = groupOf({ ...p, category: p.category });
          p.category = g.slug;
          p.categoryName = g.name;
        } else {
          p.categoryName = apiCatName.get(p.category) || p.category;
        }
      });

      PRODUCTS = liveProducts;

      // categories: sirf woh jinke products maujood hain, count ke hisaab se
      const byCount = rawCats
        ? (catRes.items || []).filter((c) => Number(c.active) !== 0).map((c) => mapCategory(c, liveProducts)).filter((c) => c.count > 0)
        : buildCategories(liveProducts);
      if (byCount.length) CATEGORIES = byCount.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

      const inStock = liveProducts.filter((p) => p.stock > 0);
      const pool = inStock.length >= 4 ? inStock : liveProducts;
      const featured = pool.filter((p) => p.featured);
      window.BAZNIVO_FEATURED = (featured.length >= 4 ? featured : pool).slice(0, 8);
      window.BAZNIVO_NEW = pool.slice().sort((a, b) => b.sortId - a.sortId).slice(0, 4);

      /* ---- makeup-only mode ---- */
      if (beautyOnly) {
        const beauty = liveProducts.filter((p) => p.category === 'beauty');
        if (beauty.length >= 6) {
          // API mein kaafi makeup products hain -> unhi ko dikhao
          PRODUCTS = beauty;
          CATEGORIES = buildCategories(beauty);
          window.BAZNIVO_FEATURED = (beauty.filter((p) => p.featured).length ? beauty.filter((p) => p.featured) : beauty).slice(0, 8);
          window.BAZNIVO_NEW = beauty.slice().sort((a, b) => b.sortId - a.sortId).slice(0, 4);
          window.BAZNIVO_SOURCE = 'api-beauty';
        } else {
          // API mein makeup nahi -> bundled makeup catalogue
          PRODUCTS = BUNDLED_PRODUCTS;
          CATEGORIES = BUNDLED_CATEGORIES;
          window.BAZNIVO_FEATURED = BUNDLED_PRODUCTS.slice(0, 8);
          window.BAZNIVO_NEW = BUNDLED_PRODUCTS.slice(-4).reverse();
          window.BAZNIVO_SOURCE = 'bundled-beauty';
        }
      }
      if (!beautyOnly) window.BAZNIVO_SOURCE = 'api';
    }

    const st = setRes.settings || {};
    if (st.store_name) STORE.name = st.store_name;
    if (st.support_email) STORE.email = st.support_email;
    const wa = String(st.social_whatsapp || '').match(/(\d{10,15})/);
    if (wa) STORE.whatsapp = wa[1];
    if (st.announcement) STORE.announcement = st.announcement;
    STORE.googleLogin = !!st.google_login;

    window.BAZNIVO_POSTS = beautyOnly ? BUNDLED_JOURNAL : (blogRes.items || []).map(mapPost);
    window.BAZNIVO_REVIEWS = (revRes.items || [])
      .filter((r) => (r.body || r.text || '').trim() && Number(r.rating) >= 4)
      .map((r) => ({
        name: r.author || r.customer_name || 'Verified buyer',
        city: r.city || 'Pakistan',
        stars: Number(r.rating) || 5,
        text: (r.body || r.text || '').trim(),
      }))
      .slice(0, 3);
  } catch (err) {
    window.BAZNIVO_SOURCE = 'mock';
    console.warn('[Baznivo] API unavailable — bundled catalog:', err.message);
  }
})();

/* single blog post (article view ke liye) */
window.BAZNIVO_getPost = async function (slug) {
  try {
    const d = await apiGet('/blog/' + encodeURIComponent(slug));
    return d.post ? mapPost(d.post) : null;
  } catch {
    return null;
  }
};
