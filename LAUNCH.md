# Launch checklist — AI Tool Scout

Do these in order. Items marked **[YOU]** need your login; everything else is done for you.

---

## 1. Hosting — Cloudflare Pages  ✅ ready

| # | Step | Status |
|---|------|--------|
| 1.1 | Cloudflare account created | **[YOU]** |
| 1.2 | Wrangler authenticated | **[YOU]** (browser approval) |
| 1.3 | `node build.js` → `/dist` | ✅ done |
| 1.4 | `wrangler pages deploy dist` | automated |
| 1.5 | Site live on `ai-tool-scout.pages.dev` | automated |

**Your part:** on the Cloudflare login page that is open in your browser, sign in (or sign up — free, no credit card). Then approve the "Wrangler" permission prompt by clicking **Allow**.

---

## 2. Domain

Two options:

**Option A — free subdomain (zero cost)**
Cloudflare Pages gives you `<project>.pages.dev` automatically. Done as soon as the deploy succeeds.

**Option B — real domain (≈ $1–8/year)**
Recommended for AdSense. Buy at Cloudflare Registrar (at-cost, no markup) and attach it under
*Workers & Pages → your project → Custom domains → Set up custom domain*.

> **AdSense note:** Google's direct applications are often rejected on subdomains. If approval
> matters more than $8/year, choose Option B.

---

## 3. Google Search Console  **[YOU] — logins only**

1. Open <https://search.google.com/search-console> → sign in with your Google account.
2. Click **Add property** → choose **URL prefix** → paste your site URL → **Continue**.
3. Verification method → **HTML tag** → copy the content value (looks like `AbC123...`).
4. Send me that value. I will insert it into `lib.js` (`REPLACE_WITH_GSC_TOKEN`),
   rebuild and redeploy.
5. Back in Search Console → **Sitemaps** → submit `sitemap.xml` → **Submit**.
6. Use **URL Inspection** on the homepage → **Request indexing**.

---

## 4. Google AdSense  **[YOU] — logins only**

**Before applying, the site needs these (already built):**
- [x] About, Contact, Privacy Policy, Terms — all present and linked in the footer
- [x] Original articles, 850–1,100 words
- [x] Mobile responsive, HTTPS
- [x] `robots.txt` allows `Mediapartners-Google`
- [x] Privacy policy discloses cookies and Google AdSense
- [x] No broken navigation

**Steps:**
1. Wait until the site is indexed (Search Console shows the homepage indexed).
2. Publish a few more articles — 8–15 total gives a much better approval chance.
   Add them in `src/posts-1.js` or `src/posts-2.js`, then run `node build.js`.
3. Open <https://adsense.google.com> → sign in → **Get started** → enter your site URL.
4. Google gives you a verification snippet. Send it to me — I will add it to `config.js`
   (`ADSENSE_CLIENT`) and flip `ADSENSE_ENABLED: true`, which also generates `ads.txt`.
5. Wait for review (typically 2 days to 3 weeks).
6. Once approved, paste your ad unit code where you want it — the `.ad-slot` containers
   already exist on every page and reserve their height, so ads will not shift the layout.

---

## 5. After approval — revenue tuning

- Ads perform best **inside article content**, not at the very top.
- Keep the in-content `.ad-slot` between the intro and the body — that is where it is now.
- US/UK/CA/EU traffic pays far more than other regions. English-only content helps.
- Add 2–4 articles per week; AdSense revenue follows consistent traffic, not ad count.

---

## Commands reference

```bash
node build.js     # rebuild /dist
node check.js     # SEO lint
node server.js    # preview at localhost:4173
deploy.cmd        # build + check + deploy in one step
```
