/* ==========================================================================
   BAZNIVO — site configuration
   Admin dashboard (admin.html) yahan se content edit karta hai.
   Edits browser ke localStorage mein save hote hain; "Export" se JSON file
   download kar ke isi file mein replace kar dein — phir sab visitors ko dikhega.
   ========================================================================== */

const DEFAULT_SITE_CONFIG = {
  version: 1,
  store: {
    name: 'Baznivo',
    tagline: 'Your Beauty, Your Style',
    whatsapp: '923154120584',
    email: 'mkhalid5838@gmail.com',
    city: 'Lahore, Pakistan',
    freeShipAt: 2500,
    currency: 'Rs',
  },
  announcement: [
    'Free delivery on orders over Rs 2,500',
    '100% original products',
    'Cash on delivery nationwide',
  ],
  hero: {
    interval: 6000,
    slides: [
      {
        video: 'assets/video/hero-1.mp4',
        poster: 'assets/img/hero-poster/hero-1.jpg',
        focus: 'center 40%',
        layout: 'full',
        kicker: 'Baznivo — Your Beauty, Your Style',
        title: 'Beauty that fits your everyday',
        sub: 'Makeup, skincare and everyday essentials — genuine products, honest prices and cash on delivery across Pakistan.',
        cta: 'Shop the collection',
        href: 'shop.html',
        cta2: 'View offers',
        href2: 'shop.html?sort=discount',
      },
      {
        video: 'assets/video/hero-2.mp4',
        poster: 'assets/img/hero-poster/hero-2.jpg',
        focus: 'center 46%',
        layout: 'full',
        kicker: 'Big lashes, zero clumps',
        title: 'Mascara that lifts and holds',
        sub: 'Smudge-proof volume for long days — easy to build, easy to remove.',
        cta: 'Shop eyes',
        href: 'shop.html?category=eyes',
      },
      {
        video: 'assets/video/hero-3.mp4',
        poster: 'assets/img/hero-poster/hero-3.jpg',
        focus: 'center 44%',
        layout: 'full',
        kicker: 'Blended in seconds',
        title: 'Shadow that flatters every skin tone',
        sub: 'Soft, buildable pigments — from everyday neutrals to full glam.',
        cta: 'Shop all makeup',
        href: 'shop.html',
      },
      {
        video: 'assets/video/hero-4.mp4',
        poster: 'assets/img/hero-poster/hero-4.jpg',
        focus: 'center 50%',
        layout: 'full',
        kicker: 'Pro tools',
        title: 'Brushes that do the work',
        sub: 'Soft, dense bristles with a fair price tag — built to last.',
        cta: 'Shop brushes',
        href: 'shop.html?category=brushes',
      },
    ],
  },
  promo: {
    kicker: 'Welcome offer',
    title: '10% off your first order',
    text: 'Use code CASTMATICS10 at checkout. Minimum order Rs 1,500. Cash on delivery available nationwide.',
    code: 'CASTMATICS10',
    cta: 'Shop the edit',
    href: 'shop.html',
  },
  beautyOnly: true, // sirf makeup/beauty catalogue dikhao (baqi categories hide)

  /* Orders: har order ka poora record is URL par POST hota hai (email / sheet / Zapier).
     Default = FormSubmit (free). Pehla order aane par ek activation email aayega — ek click. */
  ordersWebhook: 'https://formsubmit.co/ajax/mkhalid5838@gmail.com',

  /* Publish: admin se "Publish live" GitHub par commit karta hai (token browser me rehta hai) */
  publish: {
    repo: 'muzamiliqbal0393-png/baznivo-storefront',
    branch: 'main',
    file: 'js/site-config.js',
  },

  /* Products: khali = API / bundled makeup catalogue. Admin → Products se bharne par
     yahi catalogue live hota hai (publish ke baad). */
  products: [],

  featured: [], // product slugs — khali chhorein to API ke featured products chalenge
  adminPasscode: 'baznivo',
};

/* localStorage override (admin dashboard se) */
(function () {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem('baznivo-site-config') || 'null');
  } catch {
    saved = null;
  }
  const deepMerge = (base, patch) => {
    if (!patch || typeof patch !== 'object') return base;
    const out = Array.isArray(base) ? base.slice() : { ...base };
    Object.keys(patch).forEach((k) => {
      const pv = patch[k];
      if (pv && typeof pv === 'object' && !Array.isArray(pv) && base && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        out[k] = deepMerge(base[k], pv);
      } else {
        out[k] = pv;
      }
    });
    return out;
  };
  window.BAZNIVO_CONFIG = saved ? deepMerge(DEFAULT_SITE_CONFIG, saved) : DEFAULT_SITE_CONFIG;
})();
