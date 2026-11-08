# Baznivo — storefront

Static storefront for **Baznivo**, deployed on Vercel at `https://baznivo-storefront.vercel.app`.
The catalogue, categories, settings and journal come from the live Baznivo API, so products and
orders stay in sync with the existing dashboard.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home — hero slider (5 slides), categories, best sellers, offer banner, new arrivals, journal |
| `shop.html` | Catalogue with filters (category, price), sorting and collapsible mobile filters |
| `product.html` | Product detail, gallery, specs, related products |
| `wishlist.html` | Saved products (local storage) |
| `checkout.html` | Order form with cash on delivery / JazzCash / EasyPaisa selection |
| `order-success.html` | Order confirmation + WhatsApp handoff |
| `blog.html` | Journal index and article view (`blog.html?slug=…`) |
| `about.html`, `contact.html`, `404.html` | Supporting pages |
| `admin.html` | Storefront admin dashboard (see below) |

## Admin dashboard

Open `/admin.html`. Default passcode: `baznivo` (change it in **Store settings**).

It manages:

- **Hero slider** — up to 5 slides, image (URL or upload), label, headline, subheading, up to two
  buttons, slide order, and rotation speed (default **2 seconds**).
- **Offers & content** — announcement bar lines and the homepage offer banner.
- **Featured products** — which products appear under “Best sellers”.
- **Store settings** — store name, tagline, WhatsApp number, email, city, free-delivery threshold,
  currency, admin passcode.
- **Backup & publish** — export/import the config as JSON.

Edits are stored in the browser (`localStorage → baznivo-site-config`). To publish them for every
visitor, download the config and replace the `DEFAULT_SITE_CONFIG` object in `js/site-config.js`,
then redeploy. Products, prices, stock and orders are managed in the existing Baznivo dashboard
(`https://baznivo.vercel.app/admin`) — this panel links to it directly.

## Live API integration

- `js/api.js` fetches `/api/products`, `/api/categories`, `/api/settings`, `/api/blog` and
  `/api/reviews` on boot and maps them onto the site's data shape.
- `vercel.json` rewrites `/api/*` to the live API and `/media/*` to the live `assets/*`.
  The `/media` proxy is required because the source images are served with
  `cross-origin-resource-policy: same-origin`, which blocks direct hotlinking.
- `js/data.js` is a bundled fallback catalogue (used when the API is unreachable, or with `?mock=1`).
  `?rawcats=1` shows the API's original categories.
- Prices arrive in minor units (paisa). Values below 100 are treated as rupees entered by mistake and
  corrected; corrupt regular prices (more than 5× the sale price) are hidden.
- Category groups are derived from product names (`CATEGORY_RULES` in `js/api.js`) because the live
  categories are mixed up. Remove that layer once the API categories are fixed.

## Local development

```bash
python3 tools/serve.py 4173     # serves site/ and proxies /api and /media to the live API
```

## Deployment

```bash
vercel --prod --project baznivo-storefront --scope <team>
```

Vercel serves the static files directly; no build step is required.

## Notes

- Mobile: 4/3/2 column grid via the `--cols` CSS variable, collapsible shop filters below 980px,
  inline add-to-cart on cards below 700px.
- Accessibility: keyboard-reachable controls, `aria-label`s on icon buttons, reduced-motion users
  get a static hero (no autoplay).
