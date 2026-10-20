# PUBLISH_LOG — AI Tool Scout

وضعیت انتشار وبلاگ. هرچه اینجا هست **روی سایت زنده اجرا و راستی‌آزمایی شده**،
نه برنامه‌ریزی‌شده.

- **وبلاگ:** `4791704820460938856` — `scoutaitools.blogspot.com`
- **دامنه‌ی هدف:** `aitoolscout.com` (Namecheap) — ⏳ وصل نشده، `DOMAIN_SETUP.md`
- **زبان سایت:** انگلیسی · **کشور ادسنس:** ایالات متحده (USD)

---

## ۱. وضعیت کلی — ۲۰۲۶-۰۹-۲۷

| | |
|---|---|
| پست‌ها | **۳۰ منتشرشده** — `All(30) / Published(30) / Draft(0)` |
| صفحات | About · Contact · Privacy · Terms · **Editorial Team ⏳** · DMCA |
| تم | `theme-v5.xml` روی سایت (فایل محلی گم شد → بازسازی، `THEME_FIX.md`) |
| سئو | GSC مالکیت + سایت‌مپ‌ها · GA4 `G-ZTQGKRPVYN` · cookie consent |
| ادسنس | ⏳ درخواست نشده — نیازمند VPN + اکانت از مسیر افراک/ایرانی‌کارت (`LAUNCH.md §6`) |

---

## ۲. permalinkها (نگاشت نهایی)

پست‌های ۰۱–۰۶ و ۰۷ ابتدا اسلگِ خودکار داشتند و لینک‌های داخلی را می‌شکستند.
همه از مسیر **More options → Revert to draft → Permalink (Custom) → Publish**
اصلاح شدند (رادیوهای Custom فقط برای پیش‌نویس رندر می‌شوند)؛ تاریخ اصلی حفظ شد.

| # | اسلگ | # | اسلگ |
|---|---|---|---|
| 01 | `best-ai-writing-tools-2026` | 16 | `personal-knowledge-base-with-ai` |
| 02 | `chatgpt-vs-claude-2026` | 17 | `automate-your-inbox-with-ai` |
| 03 | `how-to-write-better-prompts` | 18 | `make-ai-writing-sound-like-you` |
| 04 | `free-ai-tools-worth-using` | 19 | `best-ai-coding-assistants-2026` |
| 05 | `automate-workflows-without-coding` | 20 | `best-ai-image-generators-2026` |
| 06 | `what-will-happen-in-next-5-years-ai` | 21 | `best-ai-note-taking-apps-2026` |
| 07 | `gemini-vs-chatgpt-2026` | 22 | `best-ai-voice-generators-2026` |
| 08 | `copilot-vs-cursor-2026` | 23 | `free-ai-tools-for-students-2026` |
| 09 | `perplexity-vs-google-search-2026` | 24 | `best-ai-agents-2026` |
| 10 | `midjourney-vs-dall-e-2026` | 25 | `ai-agents-in-2026` |
| 11 | `notion-ai-vs-clickup-brain-2026` | 26 | `small-language-models-explained` |
| 12 | `jasper-vs-copy-ai-2026` | 27 | `ai-search-engines-and-the-web-2026` |
| 13 | `ai-research-workflow-2026` | 28 | `open-vs-closed-ai-models-2026` |
| 14 | `summarize-long-documents-with-ai` | 29 | `ai-copyright-guide-2026` |
| 15 | `fact-check-ai-output-before-publishing` | 30 | `cost-of-running-ai-2026` |

صفحات (اسلگ = permalink):

| صفحه | اسلگ | یادداشت |
|---|---|---|
| About | `about-ai-tool-scout` | |
| Contact | `contact-us` | `/p/contact.html` → **301** به اینجا |
| Privacy | `privacy-policy` | |
| Terms | `terms-of-service` | توضیح ۱۵۷ → **۱۳۳** |
| Editorial Team | `editorial-team` | ⏳ **پرداخته‌نشده** |
| DMCA | `dmca-copyright` | توضیح ۱۶۱ → **۱۴۴**؛ لینک تماس هم اصلاح شد |

---

## ۳. کارهای این جلسه (۲۰۲۶-۰۹-۲۷)

1. **پایش کامل لینک** روی ۳۰ پست + ۶ صفحه (۲۹۴ `href`) با سخت‌گیریِ URLهای
   واقعی تأییدشده → **۰ شکسته، ۰ ریدایرکت، ۰ خارجی**
2. **رفع لینکِ شکسته:** اسلگ payload پست ۰۶ (`ai-predictions-2031`) با URL
   واقعی (`what-will-happen-in-next-5-years-ai`) نمی‌خورد → اصلاح در
   `src/posts-3.js`
3. **درمان خوشه‌ای لینک‌سازی (دروازه‌ی ادسنس):**
   - پست‌های ۰۱–۰۶ **هیچ لینک خروجی نداشتند** → هر کدام یک پاراگراف
     تحریریه‌ی لینک‌دار گرفت (نقشه: `RELATED` در
     `blogger/make-editor-content.js`)
   - پست‌های **۰۷، ۱۷، ۲۲ یتیم بودند** → حالا از ۰۲/۰۵/۰۴ لینک می‌گیرند
   - نتیجه: **۰ پست یتیم، ۰ پست بدون لینک خروجی** — روی سایت زنده هم اعمال شد
     (`Changes saved`؛ راستی‌آزمایی نهایی پست ۰۶ ⏳ `PENDING_BROWSER_WORK.md` §1)
4. **صفحه‌ی Editorial Team ساخته شد** (`page-05.json`) — بیوی واقعیِ هر دو
   نویسنده (Sarah Whitfield ۱۶ پست، Marcus Lindqvist ۱۴ پست)، پنج قانون
   تحریریه، سیاست اصلاحیه، و پیوند از صفحه‌ی About. ⏳ انتشار مانده.
5. **نگاشت لینک‌ها به URL واقعی زنده تغییر کرد** (`LINK_MAP` + `PAGE_SLUG_MAP`) —
   قبلاً `/p/about.html` و `/p/terms.html` بود که ۴۰۴ بود؛ حالا
   `about-ai-tool-scout` / `terms-of-service` / `contact-us`. اسلگِ payloadِ
   صفحات هم با permalink زنده یکی شد تا **انتشار دوباره URL را عوض نکند**.
6. **فوتر تم:** ستون Legal حالا Privacy · Terms · **DMCA** · About · Contact
   با اسلگ‌های واقعی (قبلاً DMCA غایب بود و لینک‌ها قدیمی).
7. **منبع تم با فیکس‌های رندر هم‌خوان شد** (`build-theme.js`: `class='main'`،
   `<div>` به‌جای `<main>`، ۱۲ سکشن رزروشده) — قبلاً بازتولید نسخه‌ی **شکسته**
   را می‌داد. خروجی XML well-formed است.
8. **منبع تم حالا سایت را بازسازی می‌کند** — تا قبل از این جلسه تگ GA4،
   بنر کوکی و اسلگ‌های واقعیِ منو/فوتر **فقط** روی تمِ زنده بودند (بعده
   `build-theme.js` نداشت)، یعنی یک Save از منبعِ محلی همه را از بین می
   برد. همه از نو بازسازی شدند + **Consent Mode v2** اضافه شد: چهار سیگنال
   `ad_storage` / `ad_user_data` / `ad_personalization` / `analytics_storage`
   پیش‌فرض `denied`، و فقط با پذیرشِ بازدیدکننده `granted` می‌شوند
   (دروازه‌ی `LAUNCH.md §4`).
9. **اعتبارسنج تم** ساخته شد (`tools/check_theme.py`): XML سالم + فیکس‌های
   رندر + سیگنال‌های Consent Mode + اسلگ‌های فوتر + سینتکس هر `<script>` و
   اعتبار JSON-LD — **همه سبز**. همین اعتبارسنج بود که سه لینک قدیمیِ منوی
   هدر (`about.html` / `contact.html`) را در منبع گرفت.
10. **ابزارها به پروژه منتقل شد** (`tools/`) تا با پاک‌شدن Temp از بین نروند.

---

## ۴. راستی‌آزمایی (پیش از هر درخواست ادسنس)

```powershell
cd 'C:\Users\USER\Documents\Default Project\ai-tool-scout'
node  blogger\make-editor-content.js
python blogger\make-dmca-json.py
python tools\check_links.py
python tools\check_anchors.py
python tools\check_link_graph.py
python tools\check_desc.py
```

همه باید `none` / `0` / `ALL DESCRIPTIONS <= 150` بدهند. جزئیات: `tools/README.md`.

**کارهایی که منتظر مرورگر و VPNاند:** `PENDING_BROWSER_WORK.md`.
