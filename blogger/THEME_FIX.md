# رفع باگ رندر دسکتاپ — گزارش نهایی

**وضعیت: ✅ حل شده** (۲۰۲۶/۰۹/۲۷)

## علامت بیماری

```
نسخه‌ی دسکتاپ:  Blog1=0, postLinks=0, textLen=1075   ← خالی
نسخه‌ی موبایل:  Blog1=1, postLinks=1                  ← سالم
```

تم سفارشی روی دسکتاپ هیچ ویجتی رندر نمی‌کرد و صفحه‌ی Layout خالی بود.

---

## آنچه رد شد (همه‌ی فرضیه‌های اشتباه)

| فرضیه | آزمایش | نتیجه |
|---|---|---|
| XML خراب است | `ET.fromstring` روی تم | ✅ WELL-FORMED — رد شد |
| تگ غیرقانونی `<b:includable>` خارج از widget | پارسر درختی | ✅ همه جای درست‌اند — رد شد |
| تکرارِ سکشن | شمارش `id` ها | ✅ بدون تکرار — رد شد |
| فقدان `b:version='2'` و `class='v2'` روی `<html>` | `theme-fixed.xml` | ⛔ جواب نداد |
| وجود `version='1'` روی `<b:widget id='Blog1'>` | `theme-v3.xml` (حذف شد) | ⛔ جواب نداد |
| تفاوت `<b:widget-setting>` با تم مرجع | مقایسه‌ی لیست‌ها | ✅ **۲۰=۲۰ یکسان** — رد شد |
| تفاوت `<b:includable>` با تم مرجع | مقایسه‌ی لیست‌ها | ✅ **۲۳=۲۳ یکسان** — رد شد |
| تفاوت باز‌شدن `<b:widget>` | مقایسه‌ی رشته | ✅ دقیقاً یکسان — رد شد |

**نتیجه: خودِ تم از نظر محتوای `Blog1` با تم سالمِ Simple هیچ تفاوتی ندارد.**

---

## آزمایش‌های کلیدی (رفتار Blogger را محرز کرد)

| اقدام | نتیجه |
|---|---|
| `Apply this theme` از گالری | ✅ لِی‌اوت ساخته می‌شود (`Blog1` به سکشن `main` وصل می‌شود) |
| `Save` روی خودِ تم Simple + نشانه | ✅ لِی‌اوت **حفظ** می‌شود (`Blog1=1, postLinks=4`) |
| `Save` روی تم سفارشی | ⛔ کل لِی‌اوت **پاک** می‌شد (`Blog1=0`) |

> **قانون رفتاری Blogger:** `Apply` از گالری لِی‌اوت را می‌سازد.
> `Save` فقط وقتی لِی‌اوت را حفظ می‌کند که سکشن‌های تم با چیدمانِ ذخیره‌شده هم‌پوشانی داشته باشند.

---

## ریشه‌ی واقعی و رفع

سه تفاوت ساختاریِ باقی‌مانده با تم مرجع:

| | Simple (سالم) | تم ما |
|---|---|---|
| `class` سکشن main | `main` | `blog-main` |
| والدِ سکشن main | `<div class='column-center-inner'>` | `<main class='site-main'>` |
| شمارِ سکشن‌های اعلام‌شده | ۱۳ سکشن (کلِ چیدمان) | فقط ۳ سکشن (`adtop, main, adbottom`) |

### رفع در `theme-v4.xml` (سه اصلاح هم‌زمان)

1. `class='blog-main'` → **`class='main'`** (هم‌نام با مرجع)
2. `<main id='site-main'>` → **`<div id='site-main'>`** (والدِ سکشن، المانِ HTML نباشد)
3. **افزودن ۱۲ سکشنِ رزروشده** که چیدمانِ ذخیره‌شده به آن‌ها اشاره دارد، داخل
   `<div class='layout-reserved' style='display:none'>` پیش از `</body>`:

   ```
   navbar, header, crosscol, crosscol-overflow,
   sidebar-right-1, sidebar-right-2-1, sidebar-right-2-2, sidebar-right-3,
   footer-1, footer-2-1, footer-2-2, footer-3
   ```

   این‌ها **خالی** اعلام شدند تا ویجت‌های اضافه‌ی Blogger (Navbar/Header/Attribution)
   وارد طراحیِ سفارشی نشوند، ولی چیدمانِ ذخیره‌شده جایی برای نشستن داشته باشد.

### نتیجه

```
DESKTOP: Blog1=1  postLinks=2  textLen=1139
MOBILE:  Blog1=1  postLinks=1
POST:    textLen=8914  Jasper=6
```

---

## پاک‌سازی محتوای آزمایشی (`theme-v5.xml`)

دو ویجت `Text` در اسلات‌های تبلیغاتی، رشته‌های آزمایشیِ قبلی را نگه داشته بودند:

| ویجت | سکشن | مقدار قدیمی | اکنون |
|---|---|---|---|
| `Text1` | `adtop` | `PERSIST-TEST-XYZ` | خالی |
| `Text2` | `adbottom` | `PROBE-ADBOT` | خالی |

**نکته:** `version='1'` روی این دو ویجت باقی ماند و **هیچ مشکلی ایجاد نکرد** —
پس ویژگی `version` در `<b:widget>` اصلاً عامل باگ نبود.

اسلات‌های `adtop` / `adbottom` عمداً خالی ماندند تا **بعد از تأیید ادسنس**، کد تبلیغاتی
در همان‌جا قرار گیرد (گذاشتن کد AdSense قبل از تأیید، خطای نمایش می‌دهد).

---

## رَن‌بوک بازسازی (اگر دوباره خراب شد)

1. گالری تم → `Simply Simple` → **`Apply this theme`**  (لِی‌اوت را می‌سازد)
2. `Edit HTML` → باز کردن فایل تم فعلی (فایل پشتیبان را داشته باشید)
3. سه اصلاح بالا را اعمال کنید (`class='main'`، `<div>` به‌جای `<main>`، ۱۲ سکشن رزروشده)
4. تزریق به ادیتور: `input#themeInject` را **به ابتدای `<body>`** اضافه کنید
   (وگرنه بیرون از سقفِ ۵۰۰ خطِ snapshot می‌افتد) → `files.upload` → `FileReader` →
   `cm.CodeMirror.setValue(txt)`
5. **`Save`** (هرگز `Restore` — Restore لِی‌اوت را خالی می‌کند)
6. راستی‌آزمایی:

```bash
curl -s https://scoutaitools.blogspot.com/ | grep -o 'id="Blog1"' | wc -l   # باید 1 باشد
curl -s "https://scoutaitools.blogspot.com/?m=1" | grep -o 'id="Blog1"' | wc -l
```

---

## فایل‌ها

| فایل | توضیح |
|---|---|
| `blogger/theme-current-backup.xml` | پشتیبان اصلی (۸۱٬۰۰۱ بایت) |
| `blogger/theme-fixed.xml` | + `b:version='2'` و `class='v2'` — **جواب نداد** |
| `blogger/theme-v3.xml` | − `version='1'` روی Blog1 — **جواب نداد** |
| `blogger/theme-v4.xml` | ✅ **رفع رندر** (سه اصلاح ساختاری) |
| `blogger/theme-v5.xml` | ✅ **نسخه‌ی روی سایت** (v4 + پاک‌سازی محتوای آزمایشی) |
| `blogger/theme.xml` | بازسازی از `build-theme.js` — **۲۰۲۶-۰۹-۲۷ بازسازی شد** |

---

## ⚠️ هشدار بازیابی (۲۰۲۶-۰۹-۲۷)

در یک پاک‌سازیِ بیرونی کل پوشه‌ی پروژه از دیسک حذف شد و **همه‌ی فایل‌های تم
(شامل `theme-v5.xml` یعنی نسخه‌ی زنده، به‌علاوه‌ی `theme-current-backup.xml`
و `theme-fixed.xml`/`v3`/`v4`) از بین رفتند**. `build-theme.js` هم نسخه‌ی
**قبل از فیکس** بود، یعنی خروجی‌اش همان باگ رندر دسکتاپ را داشت.

### کاری که شد
سه اصلاحِ بالا مستقیماً داخل `build-theme.js` نهاده شد تا بازتولید، خروجیِ
شکسته نسازد:

1. `class='blog-main'` → `class='main'`
2. `<main class='site-main'>` → `<div class='site-main'>` (و `</main>` → `</div>`)
3. ۱۲ سکشن رزروشده داخل `<div class='layout-reserved' style='display:none'>`
   پیش از `</body>`

خروجیِ فعلی راستی‌آزمایی شده: `class='blog-main'=0`، `</main>=0`،
`layout-reserved=1`، ۱۵ `b:section`، بدون محتوای آزمایشی، و **XML well-formed**.

### کاری که باید انجام شود (به محض وصل شدن مرورگر)
> **`theme.xml` هنوز با نسخه‌ی زنده یکی نشده و نباید آپلود شود.**

1. Blogger → Theme → **Edit HTML** → Select all → Copy → ذخیره به‌عنوان
   `blogger/theme-live.xml` (این، پشتیبان واقعی سایت است)
2. مقایسه‌ی `theme-live.xml` با `theme.xml`؛ هر تفاوتِ دیگر را به `build-theme.js`
   بیاورید
3. تا این مقایسه انجام نشده، **هرگز** `theme.xml` را Save نکنید — Saveِ تمِ
   ناسازگار کل Layout را پاک می‌کند (`Blog1=0`)
4. `Restore` ممنوع است (Layout را خالی می‌کند) — فقط `Save`
