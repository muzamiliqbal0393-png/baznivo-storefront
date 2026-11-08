# BAZNIVO — Makeup & Beauty Storefront

Purple/pink beauty storefront for the Pakistani market. **Static site** (HTML + CSS + vanilla JS), koi build step nahi — GitHub par push karein, Vercel khud deploy kar dega.

Live preview: **https://baznivo-makeup.vercel.app** *(deploy ke baad)*

---

## Features (sab kaam karte hain)

| Feature | Detail |
|---|---|
| Hero slider | 3 slides, auto-rotate + arrows + dots |
| Shop by Category | 6 category tiles, har tile apni category page par |
| Catalog + filters | Category, price slider, sort (best selling / new / price / discount), search |
| Product detail | Gallery + thumbnails, shades, specs accordion, qty selector, stock, related products |
| Cart drawer | Add / qty +- / remove, localStorage, free delivery Rs 2,500+ |
| Coupon | `CASTMATICS10` — 10% off, minimum Rs 1,500 |
| Checkout | Poora form (naam, phone, address, city), COD / JazzCash / EasyPaisa, live order summary |
| Order record | Order browser mein save + **order-success page** with order # aur delivery timeline |
| Wishlist | Product card par dil, alag `wishlist.html` page, badge count |
| WhatsApp | Floating button, order message, product par "Buy on WhatsApp", contact form |
| Content | About, Beauty Journal (3 posts), Contact + FAQ |
| SEO & PWA | Meta/OG tags, `sitemap.xml`, `robots.txt`, `site.webmanifest`, 404 page |
| Responsive | 4 → 3 → 2 column grid, mobile drawer menu, sticky header |
| A11y | Focus states, `prefers-reduced-motion` support, semantic landmarks |

---

## Structure

```
.
├── index.html            Home
├── shop.html             Shop + filters
├── product.html          Product detail (?slug=...)
├── wishlist.html         Saved products
├── checkout.html         Checkout form + summary
├── order-success.html    Order confirmation (?order=...)
├── about.html  blog.html  contact.html  404.html
├── css/styles.css        Poora theme
├── js/data.js            ★ STORE, CATEGORIES, PRODUCTS, REVIEWS, JOURNAL
├── js/app.js             Header/footer, cart, wishlist, checkout, orders, shop & product logic
├── assets/img/           Logo, hero, product photos
├── robots.txt  sitemap.xml  site.webmanifest  vercel.json  package.json
```

### Content edit karna

Sab kuch **`js/data.js`** mein hai:

```js
const STORE = { name, tagline, whatsapp, email, freeShipAt, ... };
const CATEGORIES = [ { slug, name, image, blurb }, ... ];
const PRODUCTS = [ {
  id, slug, name, brand, category,
  price, oldPrice, image, gallery: [...],
  badge, rating, reviews, stock, shades: [...],
  blurb, desc, specs: {}, howTo: [...]
}, ... ];
```

Naya product = ek object copy karein. Naya category = `CATEGORIES` mein entry (slug wahi rakhein jo product mein use hua hai).

---

## Local par chalana

```bash
# koi bhi static server chal jayega
npx serve .          # http://localhost:3000
# ya
python3 -m http.server 8000
```

---

## Deploy — GitHub + Vercel

### 1) GitHub repo banayein

```bash
cd site                       # is folder ke andar
git init
git add .
git commit -m "Baznivo makeup storefront"
git branch -M main
git remote add origin https://github.com/<USERNAME>/baznivo-storefront.git
git push -u origin main
```

### 2) Vercel par import karein

1. https://vercel.com/new par jayein
2. **Import Git Repository** → `baznivo-storefront` select karein
3. Framework preset: **Other** · Build command: *(khali)* · Output directory: *(khali — root)*
4. **Deploy** dabayein → 30 second mein link mil jayega: `https://baznivo-storefront.vercel.app`

**Ya** CLI se (ek hi command):

```bash
npm i -g vercel
vercel --prod          # pehli dafa login + project setup poochhega
```

### 3) Custom domain

Vercel → Project → **Settings → Domains** → apna domain add karein → DNS mein `A 76.76.21.21` (ya `CNAME cname.vercel-dns.com`).

---

## Badalne wali cheezein deploy se pehle

- [ ] `js/data.js` → `STORE.whatsapp` (`923154120584`), email, free-delivery limit
- [ ] Real Castmatics product names, prices, stock, shades
- [ ] Product photos `assets/img/` mein daal kar `data.js` mein file names update
- [ ] `sitemap.xml` aur `robots.txt` mein apna asli domain
- [ ] Footer ke social links (Instagram / Facebook / TikTok)
- [ ] Google Analytics / Meta Pixel agar chahiye

---

## Backend se joDna (aage ka rasta)

Filhal orders browser mein save hote hain aur WhatsApp par confirm hote hain (COD stores ke liye sab se aam tareeqa).
Jab backend ready ho to sirf 3 jagah change karna hoga:

1. **`js/data.js`** — hard-coded arrays ki jagah API se fetch (e.g. `GET /api/products`).
2. **`initCheckout()`** in `js/app.js` — order object `POST /api/orders` par bhejein.
3. **Cart / wishlist** — localStorage ki jagah server cart (optional).

Baqi UI, design aur pages waise hi rahenge.
