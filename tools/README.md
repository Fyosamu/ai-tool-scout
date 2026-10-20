# tools/ — ابزارهای راستی‌آزمایی و بازیابی

همه‌چیز **آفلاین** و بدون وابستگی خارجی (فقط پایتون استاندارد) کار می‌کند.
این‌ها قبلاً در `%TEMP%` بودند و با پاک‌شدن موقت از بین می‌رفتند؛ حالا بخشی
از پروژه‌اند.

```powershell
cd 'C:\Users\USER\Documents\Default Project\ai-tool-scout'
```

| فایل | کار | چه باید بدهد |
|---|---|---|
| `check_links.py` | همه‌ی `href`های `blogger/content/*.json` را در برابر **URLهای واقعیِ تأییدشده‌ی سایت** می‌سنجد | `BROKEN INTERNAL: none` · `REDIRECTS: none` |
| `check_anchors.py` | انکرهای درون‌صفحه‌ای (`#toc` و …) در برابر `id`های همان سند + شناسه‌ی تکراری + پرش سطح هدینگ | `BROKEN ANCHORS: 0` · `none` · `no heading level skips` |
| `check_link_graph.py` | گراف لینک داخلی: پست‌های یتیم، پست‌های بدون لینک خروجی، خوشه‌های برچسبی | `NO outbound: 0 -> []` · `NO inbound: 0 -> []` |
| `check_desc.py` | طول متا‌توضیح همه‌ی پست‌ها و صفحات | `ALL DESCRIPTIONS <= 150` |
| `check_theme.py` | XML سالم بودنِ `blogger/theme.xml` + فیکس‌های رندر + **تگ GA4 و Consent Mode v2** + اسلگ‌های واقعی فوتر + **نقش `role=main` و زیرخطِ لینکِ داخلِ متن** + آمار هدر=۳۰ + سینتکس هر بلاک `<script>` و اعتبار JSON-LD | `ALL THEME CHECKS PASSED` |
| `build_fix_plan.py` | payload را با **خوراک زنده** قاطی می‌کند و `blogger/FIX_PLAN.json` را می‌سازد: `pid` + `targetSlug` + `liveSlug` + label | `matched=30 unmatched=0` · شمارشِ `permalinkWrong` / `labelMissing` |
| `verify_live.py` | ⭐ **تنها ابزاری که شبکه می‌زند** — خوراک، گراف لینکِ زنده، مارکرهای تم، robots و سایت‌مپ‌ها | `RESULT: ALL LIVE CHECKS PASSED` · `EXIT=0` (با `--links` هر مقصد را هم می‌سنجد) |
| `restore_from_opencode_db.py` | بازسازی فایل‌های حذف‌شده از `session_message` در `opencode.db` | فقط فایل‌های **غایب** را می‌نویسد؛ موجودها را دست نمی‌زند |
| `../blogger/make-dmca-json.py` | تولید payload صفحه‌ی DMCA (در `src/pages.js` نیست) | `page-06.json` + ادغام در `index.json` |

## ترتیب تولید payload

```powershell
node  blogger\make-editor-content.js     # 35 آیتم (30 پست + 5 صفحه) → blogger\content
python blogger\make-dmca-json.py         # page-06 + ادغام در index.json → مجموع 36
node  blogger\build-theme.js             # blogger\theme.xml
python tools\check_desc.py
python tools\check_links.py
python tools\check_anchors.py
python tools\check_link_graph.py
python tools\check_theme.py
python tools\build_fix_plan.py            # payload x feed -> FIX_PLAN.json
python tools\verify_live.py --links       # the ONLY checker that hits the network
```

> **تفاوت حیاتی:** شش چکرِ اول payload را در برابر payload می‌سنجد؛ آن‌ها
> هرگز نمی‌توانند بفهمند سایتِ زنده دارد `404` می‌دهد. فقط `verify_live.py`
> به شبکه می‌زند و وضعیت واقعی را می‌گوید. همیشه آخر اجرا شود.

> ترتیب مهم است: `make-editor-content.js` هر بار `index.json` را از نو
> می‌نویسد و DMCA (که در `src/pages.js` نیست) را حذف می‌کند؛
> `make-dmca-json.py` باید **بعد** اجرا شود تا برگردد.

## اگر فایل‌ها دوباره پاک شدند

پاک‌شدنِ قبلی توسط یک فرآیند بیرونی رخ داد، نه دستور داخلی.

```powershell
python tools\restore_from_opencode_db.py
node   blogger\make-editor-content.js
python blogger\make-dmca-json.py
node   blogger\build-theme.js
```

منبع بازیابی: `%LOCALAPPDATA%\opencode\opencode.db` → جدول `session_message`
(ستون `data` JSON، کلید ابزار **`name`** نه `tool`، و `state.input.content`
محتوای کاملِ فرمان `write` است). بازسازی به‌ترتیب `seq` انجام می‌شود.

## سه نکته‌ی اثبات‌شده

1. `python -c` با آرگومان پیچیده در این محیط می‌شکند → حتماً فایل `.py`.
2. `print` پایتون روی cp1256 با کاراکتر فارسی crash می‌کند → اسکریپت‌های
   بالا فقط ASCII چاپ می‌کنند.
3. خروجی PowerShell یونیکد را مخدوش می‌کند → برای مقادیر حساس بایت بخوانید.
