# Launch checklist — AI Tool Scout

Do these in order. Items marked **[YOU]** need your login or payment; everything
else is done for you.

> **Settled by `../ADSENSE_HOSTING_HANDOFF.md` (decisions) and confirmed by
> `../VERIFIED_FINDINGS.md` (real-browser DOM extraction, 2026-09-26).**
> Three unbreakable rules:
> 1. AdSense blocks Iran (OFAC) — an Iranian payment address can never be used.
> 2. The bank country **must equal** the AdSense payment-address country.
> 3. No `.ir`, no Iranian hosting, no Persian-language site — `.com` + English
>    only. (Our site is already English-only ✅.)
>
> Supersedes the earlier "AdSense is impossible for Iran" conclusion: AdSense
> stays possible **only through Afraz/Iranicard** (their address, their bank,
> their verification) — approval itself is never guaranteed.

---

## 1. Platform & hosting — Blogger + custom `.com` (zero cost)  ✅ already in use

| # | Step | Status |
|---|------|--------|
| 1.1 | Site live on Blogger (`scoutaitools.blogspot.com`) | ✅ done |
| 1.2 | Domain **chosen & owned: `aitoolscout.com`** (Namecheap, registered 2024). Email Forwarding ON → AdSense PIN receivable · clean NS · all site emails (hello/privacy/copyright/partners@) already on it. Alt `scoutaitools.com` rejected: parked, no MX, redirect chain = bad signal. **No Iranicard purchase needed.** | ✅ done |
| 1.3 | **DNS at Namecheap** (Cloudflare not needed): CNAME `www → ghs.google.com` · CNAME `fdp7g6bslbfd → gv-m5h3gm4h6oc5ra.dv.googlehosted.com` · replace parking A records at apex with Google A's `216.239.32.21 / 216.239.34.21 / 216.239.36.21 / 216.239.38.21` (current: `www.aitoolscout.com → parkingpage.namecheap.com`) | **[YOU] — main blocker** |
| 1.4 | Blogger → Settings → Publishing → Custom domain → `aitoolscout.com` → **final SAVE** + enable HTTPS | automated (after 1.3) |
| 1.5 | Verify: apex/www respond, HTTPS on, blogspot→custom-domain redirect healthy (curl) | automated |
| 1.6 | Update `SITE_URL` in `config.js`, canonical URLs, GSC property URL, sitemap resubmission | automated (me) |

Why this path (from the handoff):
- ✅ $0/month; Google-owned platform; **best possible AdSense fit** (same company).
- ✅ Custom `.com` removes blogspot's country-redirect problem and the
  weak-subdomain disadvantage for AdSense. `.com` is a **country-less gTLD**
  (Verisign registry, US company) ⇒ no conflict with the US location rule.
- ✅ Dynamic (themes, widgets, JS) — not limited to static files.
- ❌ Never: `.ir` domain, Iranian hosting, Persian-only content
  (Afraz official Q&A: AdSense approves none of them).
- ❌ Never: Vercel free tier (non-commercial); Freenom-style free domains
  (.tk/.ml/.ga/.cf — not free since 2023, not supported by Iranicard,
  distrusted by AdSense).
- ⚠️ Avoid long-term: staying on the bare `blogspot.com` subdomain.
- ⚠️ Open risk R1 (§7): Afraz/Iranicard claim blogs need **6 months of age**.

### Only if we ever leave Blogger → allowed free hosts

| Host | Company / location | Verdict |
|---|---|---|
| **Cloudflare Pages** | US (global network) | ✅ best — unlimited bandwidth, **no commercial restrictions**, free custom domain + SSL, no card, no forced subdomain (limits: 20k files, 500 builds/mo) |
| **Netlify** | US | ✅ allowed — 100 GB/mo, free custom domain + SSL (2nd choice) |
| **GitHub Pages** | US (Microsoft) | ⚠️ risky — "not for business" wording |
| **Vercel** | US | ❌ rejected — non-commercial free tier |
| Free PHP hosts (000WebHost…) | — | ❌ rejected — injected ads, poor quality |

Static-only caveat: Cloudflare Pages/Netlify serve HTML/CSS/JS only
(Astro/Hugo/Eleventy) — **not needed while the site runs on Blogger.**

---

## 2. Location decision — 🇺🇸 US (USD) primary, 🇹🇷 Turkey (TRY) fallback

The AdSense payment-address country determines everything (bank must match):

- **Afraz's verified rule:** host/domain may be from **any country not on
  Google's sanctions list** («هر کشوری که در فهرست تحریم گوگل نباشد»).
- **US (USD) — chosen:** AdSense fully supported · every allowed free host is
  a US company · English content targets US traffic (best ad prices).
- **Turkey (TRY) — fallback:** Iranicard opens Ziraat / Vakifbank accounts
  directly; AdSense supports EFT in TRY.
- **Payoneer — verified facts:** Iranicard's own page states
  **«در حال حاضر خدمات افتتاح حساب ارائه نمی‌گردد»** (account opening
  disabled; it was $79 when active); only **cashing/top-up** of existing
  accounts works.
  **Intended chain (user's plan):** AdSense (US/USD) → EFT → **Payoneer
  US/USD/ACH receiving account** (Payoneer's first official row) → Iranicard
  income-cashing (active, <2 h) → Rial. ✅ satisfies Google's same-country rule.
  ⏳ **OPEN QUESTION: do we already own a Payoneer account?**
  Yes → chain complete. No → either obtain an account via another trusted
  route, or fall back to the Afraz route (§6, 18% fee).

---

## 3. Google Search Console + Analytics

### ✅ Done on the blogspot URL (2026-09-27)
- **GSC** — property `https://scoutaitools.blogspot.com/` (URL prefix), ownership
  *auto-verified* (blog-owner account) · sitemaps `sitemap.xml` + `sitemap-pages.xml`
  submitted → both currently show **"Couldn't fetch"** (independent curl: both
  **200**, valid XML, **6 post locs / 5 page locs**, `robots.txt` declares them →
  Google-side lag on a fresh property; **re-check status tomorrow**) · URL
  Inspection homepage → "URL is available to Google / Page can be indexed", live
  test passed → **Indexing requested**.
- **GA4** — account + property "AI Tool Scout": timezone **United States
  (GMT-07:00)**, currency **USD**, industry Computers & Electronics; ToS (US) +
  GDPR Data Processing Terms accepted. Web stream `https://scoutaitools.blogspot.com`,
  Stream ID 15851404283, **Measurement ID `G-ZTQGKRPVYN`** — tag verified in theme
  `<head>`, `anonymize_ip` on, **gated by the cookie banner** (`aits_cookie_consent`
  → Decline means GA4 never loads).
- `robots.txt` verified: `Mediapartners-Google` open (AdSense crawler) · `/search`
  blocked · `Sitemap:` declared · no `X-Robots-Tag` / no `noindex` on any page.

### ⏳ After the custom domain connects (step 1.4)
- **Add a NEW GSC property** for `https://www.aitoolscout.com/` — URL-prefix
  properties cannot be re-pointed. Keep the blogspot property, resubmit both
  sitemaps under the new one, request indexing of the canonical homepage.
- **Update the GA4 web-stream URL** to the custom domain (don't split stats).

---

## 4. Content & SEO — gates before ANY monetization request

Course checklist (`../ADSENSE_HANDOFF.md` §2) + AdSense Program Policies:

- [x] **20–30 original articles**, 800–1,200 words each, in 3–4 topic clusters
      ← ✅ **all 30 published** (2026-09-27; `All(30) / Published(30) /
      Draft(0)`; each 8,700–12,000 chars with TOC, h2 structure, labels;
      every meta description ≤150 chars verified via `check_desc.py` —
      including `page-04` which was 157 and is now 133)
- [x] Privacy Policy / About / Contact / Terms — **all live** (`/p/*` → 200)
- [x] **DMCA / Copyright page published** — `/p/dmca-copyright.html` (200;
      copyright@aitoolscout.com, counter-notice section ✓; its old
      `/p/contact.html` links covered by a permanent **301 →
      /p/contact-us.html**, verified)
- [x] **Navigation fixed (2026-09-27):** menu previously pointed at 404s;
      now real slugs (about-ai-tool-scout · contact-us · terms-of-service ·
      dmca-copyright in the footer Legal column) — verified: 0 broken menu
      links, 4 broken internal links fixed at source + 301 fallback
- [x] **Cookie consent banner (2026-09-27):** bottom bar Accept/Decline + Privacy
      link · choice in `localStorage` (`aits_cookie_consent`) · footer "Cookie
      settings" reopens it · themed (#4f8cff) · **GA4 consent-gated** (verified:
      `!== "declined"` → `__gtagLoad()`; undecided → loads)
- [x] **Consent Mode v2 (2026-09-27):** all four signals —
      `ad_storage` / `ad_user_data` / `ad_personalization` /
      `analytics_storage` — now **default to `denied`** before `gtag.js` loads
      and are only promoted by `__gtagConsent('granted')` when the visitor
      accepts. Declined → the tag never loads at all. Declared in
      `blogger/build-theme.js` and asserted by `tools/check_theme.py`.
      ⏳ **Deployed to source only — must reach the live theme** (reconcile
      step, `THEME_FIX.md`).
- [ ] ⏳ **TCF-certified CMP** for EEA/UK traffic — still owed (needs a CMP
      vendor account: `[YOU]`). Required by Google *before* any ad code goes
      on the page; Consent Mode v2 above is the other half of that gate.
- [x] **Topic-Cluster internal linking (2026-09-27)** — audited across all
      30 posts + 4 pages (289 hrefs): **0 broken internal links · 0 broken
      in-page anchors (196) · 0 duplicate ids · 0 heading-level skips ·
      0 orphan posts · 0 posts without an outbound link**. Posts 01–06 were
      published before the linking pass and had none; one editorial paragraph
      was appended to each (source of truth: `RELATED` map in
      `blogger/make-editor-content.js`), which also links the three orphans
      07 / 17 / 22. Applied to the live posts via the editor.
- [x] **Editorial/author page built (2026-09-27)** — `src/pages.js` →
      `blogger/content/page-05.json` («Editorial Team», slug
      `editorial-team`): real bios for both byline authors (Sarah Whitfield
      16 posts, Marcus Lindqvist 14), the five editorial rules, a corrections
      policy, and linked from the About page's editorial standards list.
      ⏳ **Still owed: publishing it** + a byline link in the theme —
      see `PENDING_BROWSER_WORK.md` §2.
- [x] GSC verified + sitemaps submitted + homepage **indexing requested**
      (blogspot property; sitemap status "Couldn't fetch" → re-check tomorrow;
      new property for the custom domain still owed — §3)
- [x] GA4 connected — `G-ZTQGKRPVYN` (US/USD, consent-gated) — stream URL to be
      updated after the domain switch (§3)
- [ ] Core Web Vitals green (LCP < 2.5s), HTTPS, mobile-friendly, fast
- [ ] First organic visits — **many rejections are simply "no traffic yet"**;
      apply only after baseline organic traffic exists (course §2.5)
- [ ] 100% original content — **no raw machine translation** (course's #1
      rejection reason), no copy-paste; every article adds something extra
- [ ] **No ad code of any kind before AdSense approval** (course §2.3) —
      `adtop`/`adbottom` slots stay empty until then

---

## 5. Monetization track 1 (interim) — Adsterra

- Rationale: AdSense pays **no crypto at all** (`../ADSENSE_HANDOFF.md` §4) and
  takes months to approve; Adsterra accepts the site earlier and pays in
  **USDT/BTC → Trust Wallet**.
- Status: signup started (tabs open in the browser) — **[YOU]** login to finish.
- Rules: natural CTR only (above ~3% is a red flag), no bot/manual click padding.

---

## 6. Monetization track 2 (main) — AdSense via Afraz (Iranicard)

Verified on afrak.com on 2026-09-26:

- AdSense is filtered for Iranians → Afraz handles **account creation** (foreign
  phone verification), an **approved address**, and their **non-Iran bank**.
- Money chain: Google pays on the **21st–26th** → Afraz's bank (same country as
  the payment address) → **18% fee** → Rial to your Iranian bank.
- Afraz's page explicitly covers **website** income («قرار دادن آن در سایت،
  درآمد حاصل از نمایش تبلیغات هر ماه به حساب واریز خواهد شد») — still ask for
  **written confirmation of *website* (not YouTube) cashing** at signup, because
  one older user report claimed otherwise.
- **اشتراکی (shared)**: several sites on one AdSense — Afraz first reviews your
  content for suspension risk (must be copyright-free and pre-approved).
  **اختصاصی (dedicated)**: needs a real foreign person's info (not our path).
- Settlement: AdSense has 3 verification stages (identity, address, bank);
  with stages 1+2 done Afraz can enter bank details and cash out.
- **6-month blog rule** → tracked as **open risk R1 (§7)** (stated by BOTH
  Iranicard and Afraz; not in Google's docs; binds in practice because Afraz
  is the settlement agent).
- After approval: $10 → identity verification → $10 → PIN (post, 2–3 weeks) →
  payment method → **$100 threshold** → payout 21–26 monthly
  (full mechanics in `../ADSENSE_HANDOFF.md` §3).
- **No one can guarantee AdSense approval** (2–6 week review). Section 4 gates
  come first; do not apply on a half-built site.

**[YOU] steps:** Namecheap DNS records (step 1.3) · confirm Payoneer account
status (§2 open question) · later register at `client.afrak.com` when the site
is ready · AdSense/GSC/GA4 logins.

---

## 7. Open risks & blockers  (updated 2026-09-27)

### R1 — "6-month blog rule" — OPEN RISK (must track)
Both `iranicard.ir/online-ads/google-adsense/` and `afrak.com/google-adsense/`
state verbatim:

> **«برای ثبت نام وبلاگ در ادسنس باید ۶ ماه از زمان ایجاد آن گذشته باشد؛
> در صورتی که برای وب سایت‌ها چنین محدودیتی وجود ندارد.»**
> ("A blog must be 6 months old before AdSense signup; websites have no such
> limit.") — both sites add that new sites usually fail anyway for thin content.

- **Not found in Google's official documentation** → source is Afraz/Iranicard
  only. But **Afraz is our settlement agent — their rule binds us in practice.**
- Impact if enforced: Blogger path (blog created Sep 2026) waits until
  **~Mar 2027**; a *website* path has no such limit.
- **Decision — keep path (الف), prepare path (ب):**
  - (الف) Continue on Blogger (structure exists, $0, best AdSense fit) and
    **document the exact blog creation date from day one** (screenshot/proof).
  - At Afraz signup ask explicitly: does the 6-month rule apply to our blog,
    and does connecting a custom `.com` change its classification? →
    **get the answer in writing.**
  - (ب) Ready fallback: migrate to `.com` + Cloudflare Pages as a *website*
    (host table in §1) — zero monthly cost, no 6-month rule.
  - Trigger to switch to (ب): Afraz confirms the rule applies AND waiting
    is worse than a migration.

### R2 — ✅ FIXED (2026-09-27): zero-post rendering — real root cause found
- Symptom (2026-09-26): desktop rendered **no widgets at all** (Blog1=0,
  postLinks=0, only static `/p/` links) while mobile was fine; feed had 1 post
  that never appeared on the homepage.
- **Real root cause (full diagnosis in `blogger/THEME_FIX.md`):** the custom
  theme declared only **3 sections** (adtop, main, adbottom) while the saved
  layout references **13** → every theme **Save rewrote the whole layout and
  wiped all widgets**, including Blog1. (The earlier "stale render / stuck
  recompile" theory was wrong.)
- **Fix = `blogger/theme-v5.xml` (live):** `class='main'` to match the healthy
  reference theme · section parent `<div>` instead of `<main>` · **12 reserved
  empty sections** inside a hidden `<div class='layout-reserved'>` so the saved
  layout has somewhere to sit · test strings cleaned (PERSIST/PROBE → 0).
- Final verification (curl + cache-bust, 2026-09-27, after the publish round):
  desktop **Blog1=1, unique postLinks=6**; mobile **Blog1=1**; **feed=6** with
  all expected titles; 5 static pages **200**; `/p/contact.html` → **301**;
  `no-items`=**14 = 12 reserved + adtop + adbottom — expected** (hidden);
  PERSIST/PROBE=0.
- ⚠️ **Behavioral rules (THEME_FIX.md) + one new data point (2026-09-27):**
  `Apply` builds the layout · Save preserves layout only when theme sections
  overlap the saved layout · **`Restore` wiped the layout under the old
  3-section theme — but publishing the fixed theme (all sections declared)
  via Restore on 2026-09-27 preserved it** (numbers above). ⇒ Restore is no
  longer categorically forbidden, yet **every theme publish MUST be followed
  by the post-render check** — HTTP 200 alone does NOT prove posts render
  (the gap in the progress report). Default path remains **Save**; rebuild
  runbook lives in `THEME_FIX.md`.
- ✅ Completed queue: posts 02–06 published (feed=6 verified) · navigation
  fixed · DMCA published. Remaining: Namecheap DNS (1.3) → final SAVE +
  HTTPS (1.4) → GSC/GA4 → cookie banner → posts 07–30.
  `RESTORE_RUNBOOK.md` Step 1 superseded (banner on top); Steps 2/3 valid.

### R3 — AdSense approval itself
Never guaranteed (2–6 week review; no appeal shortcut). Gates in §4 first.

---

## Money chain (settled)

```
site (aitoolscout.com on Blogger) ── zero-cost hosting, US/UK/CA/EU traffic
    ├─ GSC + GA4 + 20–30 articles + legal pages (About/Contact/Privacy/Terms/DMCA ✓)
    ▼
AdSense application (payment location: US / USD)
    $10 identity → $10 PIN (aitoolscout.com forwarding ✓) → payment method
    → $100 threshold → payout 21st–26th monthly
    ▼
Route A (user's plan): EFT → Payoneer US/USD/ACH receiving account
    → Iranicard income-cashing (active) → Rial     [needs an existing Payoneer]
Route B (fallback):   Afraz bank (same country as address)
    → 18% fee → Rial                               [works without Payoneer]

Interim: Adsterra → USDT/BTC → Trust Wallet (AdSense pays no crypto)
```

### Source documents
- `../ADSENSE_HOSTING_HANDOFF.md` — domain/host/location/money-out decisions
- `../VERIFIED_FINDINGS.md` — ✅ real-browser verification of Iranicard/Afraz
  pages (domain fee 4–5% / 1–5 h CONFIRMED; Payoneer opening disabled; Afraz
  cashes website income; 6-month blog rule; zero-posts bug evidence)
- `../ADSENSE_HANDOFF.md` — course analysis + AdSense approval checklist +
  full payment know-how (from `../video1_transcript.txt`, 52-min lecture)
- `blogger/THEME_FIX.md` — theme root cause, rejected hypotheses, rebuild runbook
- Verified live: afrak.com/google-adsense/ (18%, .ir rejected, shared/dedicated)

---

## Commands reference

```bash
node build.js     # legacy static build (/dist) — superseded, do not deploy
node server.js    # preview legacy build at localhost:4173
deploy.cmd        # legacy Cloudflare Pages deploy — superseded
```

Live content pipeline: `src/posts-*.js`, `src/pages.js` →
`node blogger/make-editor-content.js` → Blogger editor.
