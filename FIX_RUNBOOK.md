# FIX_RUNBOOK — ترتیبِ دقیقِ اجرا بعد از لاگین

> این سند **مجری‌محور** است: هر مرحله یک گیتِ ورودی و یک گیتِ خروجی دارد.
> اگر گیتِ خروجی رد شد، مرحله را تکرار کن — **هرگز جلوتر نرو**.
>
> طرحِ داده‌ها: `blogger/FIX_PLAN.json` (ساخته‌شده با `tools/build_fix_plan.py`)
> اثباتِ نهایی: `python tools/verify_live.py --links` ⇒ خروجی `EXIT=0`

---

## ۰) پیش‌نیاز

| گیت | شرط |
|---|---|
| ورود | تب Blogger روی `blogger.com/blog/posts/4791704820460938856` باشد نه صفحه‌ی Sign in |
| داده | `FIX_PLAN.json` موجود و `matched=30` |
| پشتیبان | `blogger/theme.xml` ساخته شده (`node blogger/build-theme.js`) |

---

## الف) ترمیم permalink + label برای ۲۹ پست

### گیتِ ورودی برای هر پست
از `FIX_PLAN.json` بخوان: `pid`، `targetSlug`، `payloadLabel`، `liveSlug`.

### روش (اثبات‌شده روی پست‌های ۰۳ و ۰۴)

> 🔬 **ریشه‌ی خرابی پیدا شد (۲۰۲۶-۰۹-۲۸).** ادیتورِ Blogger دو حالتِ جدا دارد:
>
> - حالتی که `input.value` و متنِ **preview** را نشان می‌دهد
> - حالتی که **payloadِ ذخیره** (`Me2Pwc`، فیلدِ `[null,null,"<full url>"]`) از آن می‌خواند
>
> تایپِ اسلگ فقط حالتِ اول را عوض می‌کند. `post.url` کهنه می‌ماند و هنگامِ Publish
> همان مقدارِ کهنه ارسال می‌شود ⇒ پست با اسلگِ قبلی منتشر می‌شود.
> شواهدِ شبکه: درخواستِ `L3WS8` اسلگِ **جدید** را برد ولی `Me2Pwc` (۱۱٬۷۸۱ بایت) همان `blog-post_856` را.
>
> ⚠️ گیتِ preview **کافی نیست** — preview هم می‌تواند درست باشد و ذخیره خراب.
> تنها راهِ همگام‌سازیِ `post.url`: **تعویضِ رادیو `Automatic` ← `Custom`** بعد از تایپ.

1. باز کردن مستقیمِ پست: `https://www.blogger.com/blog/post/edit/4791704820460938856/<pid>`
   (تا `document.body.innerText` شامل `Post settings` شود — هیدراتِ کامل)
2. **Revert to draft** (از `document.getElementById('ow12')` + کلیک روی `Revert to draft`)
   و صبر تا دکمه به `Publish` تبدیل شود
3. باز کردن بخش **Permalink** (ref کلیک روی `[button] "Permalink"` تا `expanded=true`)
4. روی `input[aria-label="Custom Permalink Input"]`: `focus` → `Control+a` → تایپِ
   **کاراکتربهکاراکتر** `targetSlug`
5. **بلورِ معتبر**: ref-کلیک روی `[textbox] "Title"` (رویدادِ `blur` واقعی) + صبر ~۱٫۵ ثانیه
6. ⭐ **همگام‌سازیِ `post.url` — قدمی که قبلاً جا افتاده بود:**
   - ref-کلیک روی `[radio] "Automatic Permalink"` → صبر ~۱ ثانیه
   - ref-کلیک روی `[radio] "Custom Permalink"` → صبر ~۱٫۳ ثانیه
   - بعد از این رفت‌وبرگشت، `input.value` و preview هر دو باید اسلگِ جدید باشند
   - refها بعد از هر snapshot عوض می‌شوند ⇒ هر کلیک از snapshotِ تازه
   - کلیکِ مصنوعیِ JS کافی **نیست** (آزمایش شد: خروجی `blog-post_371` آمد)
7. **گیتِ ورود**: هر دو شرط باید برقرار باشند
   - `input[aria-label="Custom Permalink Input"].value === targetSlug`
   - preview === `"https://scoutaitools.blogspot.com/2026/09/" + targetSlug + ".html"`
   - اگر نبود: مرحلهٔ ۴ تا ۶ را یک بار دیگر تکرار کن
8. **Label** (فقط اگر `needsLabel=true`): ref-کلیک روی `[button] "Labels"`، سپس روی
   `textarea[aria-label="Separate labels by commas"]` → `Control+a` → تایپِ مقدارِ کامل
   (موجودِ فعلی + `,` + `payloadLabel`) + رویدادهای `input/change/keyup/blur`

   > فیلدِ لیبل **textarea** است نه input. کنترل‌های ادیتور `[role=button]` هستند نه `<button>`.

9. **Publish** → ref-کلیک روی `[button] "CONFIRM"` → تا `location.href` دیگر شامل
   `/post/edit/` نشود

### گیتِ خروجی — **از خوراک، نه از فیلد**

بعد از Publish، خوراک را بخوان و مقایسه کن:

```
entry.link[rel=alternate].href === ".../2026/09/" + targetSlug + ".html"
```

اگر نخواند: برگرد و دوباره. **فقط با خوراک اثبات کن، نه با مقدار فیلد.**

> 🐛 **باگِ ثبت‌شده در تأیید** — این دقیقاً باعث شد نتیجه‌ی پست ۰۴ دروغ گزارش شود:
> ```js
> // ❌ غلط: -1 هم truthy است، پس .find همیشه «اولین» آیتم را برمی‌گرداند
> (j.feed.entry||[]).find(x => (x.id.$t).indexOf(PID))   // → اولین پستِ خوراک
> // ✅ درست: تطابقِ انتهاییِ id
> (j.feed.entry||[]).filter(x => x.id.$t.slice(-('post-'+PID).length) === 'post-'+PID)[0]
> ```
> (خطای مشاهده‌شده: خروجیِ `blog-post_371` که مالِ پست ۳۰ بود، نه پست ۰۴.)
> نامِ فایلِ کشِ خوراک هم `blogger/feed_cache.json` است؛ `build_fix_plan.py` اگر
> خوراکِ زنده نگیرد از کش می‌خواند و **هرگز با خوراکِ خالی نمی‌نویسد** (خروجی ۲).

### ترتیب
1. اول `post-01 .. post-07` (تاریخِ انتشار با Revert حفظ می‌شود)
2. بعد `post-08 .. post-30`
3. بعد از هر دسته، یک بار `python tools\build_fix_plan.py` تا `FIX_PLAN.json`
   به‌روز شود و شمارشِ `permalinkWrong` کم شود

**خروجیِ مطلوبِ این مرحله:** `permalinkWrong = 0` و `labelMissing = 0`

---

## ب) انتشار صفحه‌ی Editorial Team

| گیت ورودی | شرط |
|---|---|
| permalink | `editorial-team` |
| عنوان | دقیقاً `Editorial Team` |
| گیت خروجی | `bodyLen > 5000` و `200` شدن `/p/editorial-team.html` |

بعد: لینکِ byline در تم (در `build-theme.js` هست) + به‌روزرسانی لینک در صفحه‌ی About.

---

## ج) اعمال تم (`theme.xml` ۵۰٫۷ KB)

### ⛔ گیتِ اجباری پیش از Save

```
blogger/theme.xml   (بازسازی‌شده از build-theme.js)
        vs
بازدیدِ زنده: Theme → Edit HTML → Select all → Copy
```

- اگر `theme-live.xml` هنوز روی دیسک نیست، **اول آن را بگیر**.
- `theme-v5.xml` (تمِ زنده‌ی فعلی) در دیسک موجود **نیست** ⇒ مقایسه فقط از داخل
  ادیتور ممکن است.

### روش
`THEME_FIX.md` runbook را دنبال کن. مسیر پیش‌فرض **Save** است.

### ⚠️ گیتِ خروجی (HTTP 200 کافی نیست!)
طبق R2، Save می‌تواند Layout را بازنویسی کند. **بازبینِ پس از رندر اجباری است:**

```
Blog1 = 1
تعداد postLinkهای یکتا = 30   (روی صفحه‌ی اصلی)
no-items بخش‌های رزروشده = 12 + adtop + adbottom  (پنهان، طبیعی)
PERSIST/PROBE = 0
```

اگر پست‌ها رندر نشدند → `RESTORE_RUNBOOK.md` / `THEME_FIX.md`.

### چه چیزهایی با این تم به زنده می‌رود
- `role='main'` ← فیکس `landmark-one-main`
- زیرخطِ لینک‌های داخل متن ← فیکس `link-in-text-block`
- آمار هدر ۶ → **۳۰**
- **Consent Mode v2** (`ad_storage` … پیش‌فرض `denied`) — دروازه‌ی ادسنس
- لینک‌های `editorial-team`

---

## د) بعد از همه‌چیز

1. `python tools\build_fix_plan.py`  → `permalinkWrong=0, labelMissing=0`
2. `python tools\verify_live.py --links` → **`EXIT=0`**
3. GSC → سایت‌مپ را دوباره Submit (URLهای جدید جایگزین `blog-post_NNN` شوند)
4. به‌روزرسانی `PENDING_BROWSER_WORK.md` و `LAUNCH.md §4`

---

## ه) کارهایی که فقط خودِ کاربر می‌تواند (بدون من)

| # | کار | چرا |
|---|---|---|
| 1 | **لاگین به Blogger / Google** | رمز نزد من نیست |
| 2 | **DNS دامنه در Namecheap** | لاگینِ Namecheap لازم دارد |
| 3 | ساخت حساب ادسنس (مسیر افراک/ایرانی‌کارت) | کارِ پولی |
| 4 | حساب CMP دارای گواهی TCF | ثبت‌نام در وندور |
| 5 | تهیه‌ی پاینور (USD/ACH آمریکا) | کارِ پولی |

### وضعیت DNS دامنه (اندازه‌گیری‌شده ۲۰۲۶-۰۹-۲۸ — هنوز پارکینگ Namecheap)

```
aitoolscout.com     A      162.255.119.42          <- parking IP (Google نیست)
www.aitoolscout.com CNAME  parkingpage.namecheap.com   <- باید ghs.google.com شود
NS                  registrar-servers.com (Namecheap)  ok
https://aitoolscout.com/                               timeout
```

رکوردهای لازم در `DOMAIN_SETUP.md`:
- `www` → CNAME `ghs.google.com`
- `fdp7g6bslbfd` → CNAME `gv-m5h3gm4h6oc5ra.dv.googlehosted.com`
- apex → A های `216.239.32.21` / `.34.21` / `.36.21` / `.38.21` (جایگزین A پارکینگ)

بعد از Save در Blogger: `Settings → Publishing → Custom domain → aitoolscout.com`
+ فعال‌کردن HTTPS.
