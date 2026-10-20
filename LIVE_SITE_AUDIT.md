# LIVE_SITE_AUDIT — راستی‌آزمایی سایت زنده

**تاریخ:** ۲۰۲۶-۰۹-۲۸ · **روش:** خوراک `?alt=json` + بازدید مستقیم URLها
(سدِ شبکه برداشته شده بود؛ نشست Blogger خارج بود)

> این سند **ملاک عمل** است. پایش‌های آفلاینِ `tools/check_*.py` فقط payload
> را با payload مقایسه می‌کنند و این اشکالات را نمی‌بینند.

---

## 🔴 ۱. permalinkها — ۲۹ پست از ۳۰ اشتباه است

خوراک زنده (`openSearch$totalResults = 30`) نشان می‌دهد Blogger برای اکثر
پست‌ها اسلگِ خودکار ساخته. فقط پست ۰۶ درست است.

| # | pid | اسلگِ **زنده** | اسلگِ **انتظار** | وضع |
|---|---|---|---|---|
| 01 | 1515536672386299466 | `blog-post` | `best-ai-writing-tools-2026` | ❌ |
| 02 | 4122583933584080022 | `blog-post_757` | `chatgpt-vs-claude-2026` | ❌ |
| 03 | 6047794877003620777 | `blog-post_856` | `how-to-write-better-prompts` | ❌ |
| 04 | 8676714744343116472 | `blog-post_878` | `free-ai-tools-worth-using` | ❌ |
| 05 | 6936350663889775391 | `blog-post_571` | `automate-workflows-without-coding` | ❌ |
| **06** | 7281291439031598893 | `what-will-happen-in-next-5-years-ai` | همان | ✅ |
| 07 | 2937820689903344369 | `blog-post_26` | `gemini-vs-chatgpt-2026` | ❌ |
| 08 | 3026835855863636129 | `202609copilot-vs-cursor-2026` | `copilot-vs-cursor-2026` | ❌ |
| 09 | 8129490338568835148 | `blog-post_99` | `perplexity-vs-google-search-2026` | ❌ |
| 10 | 4345972799747586355 | `blog-post_860` | `midjourney-vs-dall-e-2026` | ❌ |
| 11 | 747489235880593418 | `blog-post_891` | `notion-ai-vs-clickup-brain-2026` | ❌ |
| 12 | 8483265573640863237 | `blog-post_326` | `jasper-vs-copy-ai-2026` | ❌ |
| 13 | 5771053074906780569 | **`a`** | `ai-research-workflow-2026` | ❌ |
| 14 | 4443953523137870580 | `blog-post_659` | `summarize-long-documents-with-ai` | ❌ |
| 15 | 3359307054840827272 | `blog-post_224` | `fact-check-ai-output-before-publishing` | ❌ |
| 16 | 4175451325680050396 | `blog-post_411` | `personal-knowledge-base-with-ai` | ❌ |
| 17 | 5028796122594099042 | `blog-post_793` | `automate-your-inbox-with-ai` | ❌ |
| 18 | 4937135815721733352 | `blog-post_312` | `make-ai-writing-sound-like-you` | ❌ |
| 19 | 236636078081439630 | `blog-post_836` | `best-ai-coding-assistants-2026` | ❌ |
| 20 | 2641645176078373338 | `blog-post_956` | `best-ai-image-generators-2026` | ❌ |
| 21 | 3274506210057508980 | `blog-post_113` | `best-ai-note-taking-apps-2026` | ❌ |
| 22 | 2978892009671672435 | `blog-post_278` | `best-ai-voice-generators-2026` | ❌ |
| 23 | 8645018358350560360 | `blog-post_645` | `free-ai-tools-for-students-2026` | ❌ |
| 24 | 6848799701075738345 | `blog-post_162` | `best-ai-agents-2026` | ❌ |
| 25 | 158086631308042290 | `blog-post_144` | `ai-agents-in-2026` | ❌ |
| 26 | 2910522432393581188 | `blog-post_839` | `small-language-models-explained` | ❌ |
| 27 | 6854111663675778332 | `blog-post_934` | `ai-search-engines-and-the-web-2026` | ❌ |
| 28 | 6725575664089555774 | `blog-post_212` | `open-vs-closed-ai-models-2026` | ❌ |
| 29 | 4804364865993047300 | `blog-post_92` | `ai-copyright-guide-2026` | ❌ |
| 30 | 666425908158792879 | `blog-post_371` | `cost-of-running-ai-2026` | ❌ |

**اثبات مستقیم:**
```
GET /2026/09/best-ai-writing-tools-2026.html  → 404  (طول صفحه ۸۰۶)
GET /2026/09/blog-post.html                   → 200  (طول صفحه ۹۵۰۱)
```

### ریشه
فیلدِ Permalink در جریان انتشار **مقدارش پر می‌شد ولی اعمال نمی‌شد** —
گیتِ انتشار فقط `value === slug` را می‌خواند، نه اینکه Blogger واقعاً
اسلگ را پذیرفته. شواهد:

- پست ۰۸ → `202609copilot-vs-cursor-2026` یعنی `/2026/09/` هم تایپ شده
- پست ۱۳ → فقط `a` یعنی تایپِ کاراکتربه‌کاراکتر عملاً گم شده
- بقیه → فیلد خالی مانده و Blogger به `blog-post_NNN` برگشته

### اثر تجمیعی 🔴 — شمارشِ زنده (۲۰۲۶-۰۹-۲۸)

همه‌ی ۳۰ صفحه‌ی پست را با `fetch` درون‌مرورگر خواندم و وضعیت هر مقصد را سنجیدم:

| | تعداد |
|---|---|
| صفحاتِ پستِ بررسی‌شده | **۳۰ / ۳۰** |
| مجموع لینکِ داخلیِ مقاله | **۱۲۰** |
| ├ لینکِ **self** از تم (`data:post.url`) | ۳۰ → همیشه درست ✅ |
| ├ لینکِ **محتوا** به مقصدِ سالم | **۲** ✅ (هر دو به پست ۰۶) |
| └ لینکِ **محتوا** به مقصدِ **۴۰۴** | **۸۸** 🔴 |
| مقصدهای متمایز | ۵۹ |
| └ مقصدِ ۴۰۴ | **۲۹** 🔴 |
| └ مقصدِ ۲۰۰ | ۲۴ |
| └ مقصدِ خطای fetch (همان مقصدِ سالم) | ۶ |

**نکته‌ی مهم:** payloadها هیچ‌جا به `blog-post_NNN` لینک نمی‌دهند
(`Select-String -Pattern 'blog-post_'` روی `content/*.json` → `NONE`)؛
یعنی ۳۰ لینکِ سالم فقط **self-link** از تم‌اند. پس:

> **۸۸ لینکِ داخلیِ محتوا = ۸۸ لینکِ ۴۰۴** و گرافِ آفلاینِ سبز فقط به‌خاطر
> این سبز بود که هر دو طرف را از payload می‌خواند.

### چرا ترمیمِ permalink همه‌چیز را درست می‌کند
- لینک‌های self از تم سمت سرور با `data:post.url` رندر می‌شوند → با تغییر اسلگ
  **خودبه‌خود** به URL جدید می‌روند؛ هیچ‌وقت نمی‌شکنند.
- لینک‌های محتوا ثابت‌اند و روی اسلگِ سفارشی اشاره دارند → با ترمیمِ permalink
  **۸۸ لینکِ شکسته درست می‌شوند**.
- یعنی **هیچ لینکی به اسلگِ خودکار وابسته نیست** → تغییر permalink هیچ چیزِ
  سالمی را نمی‌شکند.

### ⚠️ یک پیامد جانبی
GSC قبلاً `sitemap.xml` را با همین URLهای `blog-post_NNN` خورده. بعد از ترمیم،
آن URLهای قدیمی ۴۰۴ می‌شوند و در GSC خطای *Not found* نشان می‌دهد. سایت نوپاست
و بازدید واقعی ندارد، پس بی‌ضرر است؛ فقط بعد از ترمیم سایت‌مپ را دوباره
Submit کنید تا URLهای جدید جایگزین شوند.

### همچنین تأیید شد
- **`sitemap.xml` همین اسلگ‌های خراب را به GSC می‌دهد** (۳۰ `<loc>` با `blog-post_NNN`)
- URLهای نامناسب برای سئو و برای بازبین ادسنس

---

## 🔴 ۲. برچسب (Label) — ۲۴ پست هیچ برچسبی ندارد

فقط پست‌های ۰۱–۰۶ برچسب دارند:

| برچسب | پست‌ها |
|---|---|
| Comparisons | ۰۱، ۰۲ |
| Guides | ۰۳، ۰۵ |
| Roundups | ۰۴ |
| Trends | ۰۶ |
| **بدون برچسب** | **۰۷ تا ۳۰** |

اثبات: `/search/label/Comparisons` فقط ۲ پست نشان می‌دهد (باید ۸ باشد)؛
خوراک هم برای ۰۷–۳۰ آرایه‌ی `category` خالی دارد.

> صفحاتِ برچسبِ خالی برای AdSense بد است (صفحات کم‌محتوا/توخالی).

---

## 🟡 ۳. موارد دیگر

| مورد | وضع |
|---|---|
| آمارِ هدر: **«6 Articles published»** | ❌ ثابت و قدیمی — باید ۳۰ شود ✅ در `build-theme.js` اصلاح شد + گیت به `check_theme.py` اضافه شد (`ALL THEME CHECKS PASSED`) |
| صفحه‌ی Editorial Team | ⏳ **منتشر نشده** (`sitemap-pages.xml` فقط ۵ صفحه دارد) |
| صفحاتِ `/p/*.html` (۵ صفحه) | ✅ هر ۵ تا ۲۰۰ + h1 درست + متا‌توضیح ۱۲۷–۱۴۹ کاراکتر + canonical درست |
| سرعت صفحه (Navigation Timing) | ✅ TTFB ۲۲۵–۴۹۱ms · DOMContentLoaded ۴۰۰–۱۲۲۵ms · load ۵۷۳–۲۹۳۵ms · ۶–۸ درخواست |
| Core Web Vitals | ⏳ PageSpeed Insights سهمیه‌اش تمام شد (`Queries per day`) — بعداً دوباره |
| متا‌توضیح پست‌ها | ✅ روی سایت درست است (نمونه‌ی پست ۰۱ تست شد) |
| Canonical پست‌ها | ✅ درست؛ اما صفحه‌ی ۴۰۴ canonical با **`//`** دارد |
| `robots.txt` | ✅ `Mediapartners-Google → Allow` (حیاتی برای ادسنس) + Sitemap |
| `sitemap.xml` | ✅ ۳۰ URL (ولی اسلگ‌های بالا) |
| `sitemap-pages.xml` | ✅ ۵ URL: `dmca-copyright` · `terms-of-service` · `privacy-policy` · `contact-us` · `about-ai-tool-scout` ← **تأیید `PAGE_SLUG_MAP`** |
| صفحات | ✅ همه‌ی اسلگ‌های صفحات با نگاشت محلی یکی است |
| نشست Blogger | ⛔ **خارج** — `Sign in to continue to Blogger` |

---

## 🟢 ۴. برنامه‌ی ترمیم (نیازمند ورود به Blogger)

> روشِ اثبات‌شده: `More options → Revert to draft → Permalink → Custom`
> رادیو با dispatch پنج رویداد ماوس → تایپ → **تأیید `preview`** → Publish.

### ⚠️ گیت باید سخت‌تر شود
گیتِ قبلی `value === slug` کافی نبود. گیتِ جدید، **قبل از Publish**:

```
preview === "https://scoutaitools.blogspot.com/2026/09/<slug>.html"
```

و **بعد از Publish، از خوراک تأیید بگیر** نه از فیلد:

```
/feed/posts/default?alt=json → entry.link[rel=alternate].href
```

### ترتیب کار
1. **پست‌های ۰۱–۰۷** (تاریخ باید حفظ شود — Revert تاریخ را نگه می‌دارد)
2. **پست‌های ۰۸–۳۰** (۲۳ پست؛ هم permalink، هم label)
3. برای هر پست **label** را هم دوباره بزن
4. بعد از هر دسته، خوراک را دوباره بخوان و جدول بالا را چک کن
5. `sitemap.xml` خودبه‌خود به‌روز می‌شود → در GSC دوباره ارسال
6. آمار هدر را از ۶ به ۳۰ تغییر بده (در `build-theme.js` + تم زنده)
7. انتشار صفحه‌ی Editorial Team + Update صفحه‌ی About و DMCA

### فهرست کاملِ کارهای منتظر ورود
`PENDING_BROWSER_WORK.md` را ببینید.

---

## 📌 نتیجه‌ی راستی‌آزمایی برای ادسنس

| | |
|---|---|
| محتوا (۳۰ مقاله، ۶ صفحه) | ✅ سر جایش است، متا‌توضیح‌ها درست |
| `robots.txt` / `Mediapartners-Google` | ✅ |
| سایت‌مپ‌ها | ✅ (ولی URL اشتباه) |
| **لینک‌های داخلی** | 🔴 **تقریباً همه ۴۰۴** |
| **برچسب‌ها** | 🔴 **۲۴ پست بدون برچسب** |
| صفحاتِ برچسبِ خالی | 🔴 بعد از ترمیمِ ۲ برطرف می‌شود |
