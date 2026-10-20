# AI Tool Scout

Static, dependency-free website for the **AI Tool Scout** niche
(AI tool reviews, comparisons and guides) — built for speed, SEO and
AdSense readiness.

> **Status (2026-09-26):** the live site runs on **Blogger** with a custom
> `.com` domain as the zero-cost path — settled by
> `../ADSENSE_HOSTING_HANDOFF.md`. This static build (`/dist`, Cloudflare
> Pages) is the **legacy path, superseded — do not deploy**; the Node sources
> in `src/` remain the **content pipeline** that feeds the Blogger editor
> (`node blogger/make-editor-content.js`). Hosting, domain location (US/USD),
> free-host rules and the money-out chain (Iranicard/Afraz vs. Adsterra →
> Trust Wallet) live in **`LAUNCH.md`**.

- **Generator:** plain Node 18+, no npm dependencies
- **Output:** fully static HTML in `/dist` (legacy — superseded by Blogger)
- **Host:** ~~Cloudflare Pages~~ → **Blogger + custom `.com`** (see `LAUNCH.md`)
- **Scores:** Lighthouse 100 / 100 / 100 (Accessibility, Best Practices, SEO)

---

## Commands

```bash
node build.js       # generate /dist
node check.js       # per-article SEO checks (titles, descriptions, heading ids)
node make-images.js # regenerate logo.png / og-default.png / apple-touch-icon.png
node get-font.js    # re-download the Latin subset of Inter
node server.js      # preview locally on http://localhost:4173
npm run build       # alias for node build.js
npm run serve       # build + preview
```

---

## Project structure

```
config.js            Site-wide settings (URL, name, nav, AdSense id…)
lib.js               HTML head/header/footer + JSON-LD graph builder
build.js             Static site generator (pages, sitemap, robots, RSS)
server.js            Zero-dependency local preview server
check.js             SEO lint for every built article
make-images.js       Pure-Node PNG generator (no image libraries)
get-font.js          Downloads the Inter latin subset
src/
  posts-1.js         Comparison / review articles
  posts-2.js         Guides and roundups
  pages.js           About, Contact, Privacy, Terms
public/              Static assets copied verbatim into /dist
  assets/css/site.css
  assets/js/site.js
  assets/fonts/
  _headers           Cloudflare Pages security + cache headers
  _redirects         Cloudflare Pages redirects
dist/                Build output (deploy this)
```

---

## Editing content

Add an object to `src/posts-1.js` or `src/posts-2.js`:

```js
{
  slug: "my-article-slug",          // → /blog/my-article-slug/
  title: "Under ~60 characters",     // keeps the <title> within Google's limit
  description: "120–160 characters.",// shown in search results
  category: "Guides",
  date: "2026-09-25",
  updated: "2026-09-25",
  author: "Jane Doe",
  rating: { value: 4.5, count: 100 }, // optional → aggregateRating schema
  keywords: ["…", "…"],
  gradient: "linear-gradient(135deg,#4f8cff,#22d3ee)",
  badge: "AI",                       // short label on the card thumbnail
  excerpt: "Shown on listing cards.",
  faq: [{ q: "…", a: "…" }],         // optional → FAQPage schema
  body: `<h2>Heading</h2><p>…</p>`,  // HTML
}
```

Then run `node build.js` and `node check.js`.

Reading time, table of contents, heading ids, JSON-LD, breadcrumbs and
the sitemap entry are all generated automatically.

---

## Before going live

1. **Set the real domain** in `config.js` → `SITE_URL`
   (canonical URLs, OG tags, sitemap, RSS and JSON-LD all derive from it).
2. **Search Console token** → replace `REPLACE_WITH_GSC_TOKEN` in `lib.js`.
3. **AdSense** → set `ADSENSE_CLIENT` and flip `ADSENSE_ENABLED` in `config.js`.
   This also writes `ads.txt`.
4. **Analytics (optional)** → set `GA_MEASUREMENT_ID` in `config.js`.
5. Re-run `node build.js`.

---

## Deploying to Cloudflare Pages

1. Push this folder to a GitHub repository.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Build settings:
   - **Build command:** `node build.js`
   - **Build output directory:** `dist`
   - **Node version:** 18 or later
4. Deploy. Add your custom domain under **Custom domains** when ready.

The `_headers` file is picked up automatically and applies
HSTS, CSP, `X-Frame-Options`, `X-Content-Type-Options` and cache rules.

---

## AdSense checklist

- [x] About, Contact, Privacy Policy, Terms pages
- [x] Original articles (850–1,100 words each)
- [x] Clear navigation, no broken links
- [x] Mobile friendly, HTTPS-ready
- [x] `robots.txt` allows `Mediapartners-Google`
- [x] Reserved ad slots (no layout shift)
- [x] Privacy policy discloses cookies + AdSense
- [ ] Real publisher id in `config.js`
- [ ] Site verified in Search Console and indexed
