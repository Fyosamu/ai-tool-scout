import re, sys, os, subprocess, tempfile
import xml.etree.ElementTree as ET

THEME = r"C:\Users\USER\Documents\Default Project\ai-tool-scout\blogger\theme.xml"
raw = open(THEME, "rb").read().decode("utf-8")
print("theme.xml bytes:", len(raw.encode("utf-8")))

# --- 1. XML well-formed?
try:
    root = ET.fromstring(raw.encode("utf-8"))
    print("XML: WELL-FORMED  root =", root.tag.split("}")[-1])
except Exception as e:
    print("XML ERROR:", e)
    sys.exit(1)

# --- 2. structural fixes that took desktop from Blog1=0 to Blog1=1
checks = {
    "class='blog-main'": 0,          # must be gone
    "</main>": 0,                    # must be gone
    "<main ": 0,                     # must be gone
    "class='main'": 1,
    "<div class='site-main' id='main' role='main'>": 1,
    "layout-reserved": 1,
    "PERSIST-TEST-XYZ": 0,
    "PROBE-ADBOT": 0,
}
bad = []
for needle, want in checks.items():
    got = raw.count(needle)
    flag = "ok " if got == want else "BAD"
    if got != want:
        bad.append(needle)
    print("  [%s] %-42s want=%d got=%d" % (flag, needle, want, got))

# --- 3. GA4 + consent gates present
ga = {
    "GA id G-ZTQGKRPVYN": raw.count("G-ZTQGKRPVYN") > 0,
    "consent default denied": "consent', 'default'" in raw or "consent','default'" in raw,
    "ad_storage denied": raw.count("ad_storage: 'denied'") >= 1,
    "analytics_storage denied": raw.count("analytics_storage: 'denied'") >= 1,
    "ad_user_data present": "ad_user_data" in raw,
    "ad_personalization present": "ad_personalization" in raw,
    "anonymize_ip": "anonymize_ip" in raw,
    "__gtagLoad defined": "window.__gtagLoad" in raw,
    "__gtagConsent defined": "window.__gtagConsent" in raw,
    "cookie bar markup": "aits-cookie-bar" in raw,
    "cookie accept button": "aits-cookie-accept" in raw,
    "cookie decline button": "aits-cookie-decline" in raw,
    "footer Cookie settings link": "id='aits-cookie-settings'" in raw,
    "localStorage key": "aits_cookie_consent" in raw,
    "privacy link in bar": "privacy-policy.html" in raw,
    "hero stat matches post count (30)": "<strong>30</strong><span>Articles published</span>" in raw,
    "a11y main landmark (role=main)": "id='main' role='main'" in raw,
    "a11y in-text links underlined": ".site-main p a" in raw and "text-underline-offset: 3px" in raw,
}
print("--- GA4 / consent ---")
for k, v in ga.items():
    if not v:
        bad.append(k)
    print("  [%s] %s" % ("ok " if v else "BAD", k))

# --- 4. footer legal links must be the LIVE slugs
legal = {
    "/p/about-ai-tool-scout.html": raw.count("/p/about-ai-tool-scout.html"),
    "/p/contact-us.html": raw.count("/p/contact-us.html"),
    "/p/terms-of-service.html": raw.count("/p/terms-of-service.html"),
    "/p/dmca-copyright.html": raw.count("/p/dmca-copyright.html"),
    "/p/privacy-policy.html": raw.count("/p/privacy-policy.html"),
}
print("--- footer/live slugs ---")
for k, v in legal.items():
    if v < 1:
        bad.append(k)
    print("  [%s] %-34s x%d" % ("ok " if v >= 1 else "BAD", k, v))
for old in ("/p/about.html", "/p/terms.html", "/p/contact.html"):
    # count only real hrefs: the audit note in this file mentions them in prose
    c = raw.count("href='/%s'" % old)
    if c:
        bad.append("stale " + old)
        print("  [BAD] stale href still present: %s x%d" % (old, c))
if not any(b.startswith("stale") for b in bad):
    print("  [ok ] no stale hrefs (about/terms/contact.html)")

# --- 5. every <script> must parse as JS (JSON-LD blocks are not JS) ---
print("--- script blocks ---")
tags = re.findall(r"<script([^>]*)>(.*?)</script>", raw, re.S)
print("  found", len(tags), "script tags")
tmp = tempfile.mkdtemp(prefix="themescripts")
for i, (attrs, s) in enumerate(tags):
    if "ld+json" in attrs:
        # JSON-LD: must at least be valid JSON
        try:
            import json
            json.loads(s.strip())
            print("  [ok ] script %d  JSON-LD valid (%d B)" % (i, len(s.strip())))
        except Exception as e:
            bad.append("ldjson %d" % i)
            print("  [BAD] script %d JSON-LD invalid: %s" % (i, e))
        continue
    body = s
    m = re.search(r"//<!\[CDATA\[(.*?)//\]\]>", body, re.S)
    if m:
        body = m.group(1)
    body = body.strip()
    if not body:
        print("  [ok ] script %d empty/external" % i)
        continue
    p = os.path.join(tmp, "s%02d.js" % i)
    open(p, "w", encoding="utf-8").write(body)
    r = subprocess.run(["node", "--check", p], capture_output=True, text=True)
    if r.returncode != 0:
        bad.append("script %d" % i)
        print("  [BAD] script %d syntax error:" % i)
        print("   ", (r.stderr or "").strip()[:400])
    else:
        print("  [ok ] script %d  (%d B)" % (i, len(body)))

print("")
if bad:
    print("FAILED:", bad)
    sys.exit(1)
print("ALL THEME CHECKS PASSED")
