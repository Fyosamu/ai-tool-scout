import json, os, re, collections, glob

C = r"C:\Users\USER\Documents\Default Project\ai-tool-scout\blogger\content"
SITE = "https://scoutaitools.blogspot.com"

posts, pages = {}, {}
for f in sorted(glob.glob(os.path.join(C, "*.json"))):
    b = os.path.basename(f)
    if b == "index.json":
        continue
    try:
        o = json.load(open(f, encoding="utf-8"))
    except Exception as e:
        print("ERR", b, e)
        continue
    if o.get("kind") == "page" or b.startswith("page-"):
        pages[b] = o
    else:
        posts[b] = o

# --- post URLs: payload slug + /2026/09/ (permalinks verified on the live blog)
post_urls = set()
for b, o in posts.items():
    if o.get("slug"):
        post_urls.add("/2026/09/%s.html" % o["slug"])

# --- LIVE page URLs, verified 200 on the live blog (2026-09-27).
# Deliberately NOT derived from payload slugs: payload slug "about" maps to a
# live page called "about-ai-tool-scout", so trusting the payload would hide
# real 404s. /p/contact.html is kept only as a 301, never as a target.
LIVE_OK = {
    "/p/about-ai-tool-scout.html",
    "/p/contact-us.html",
    "/p/privacy-policy.html",
    "/p/terms-of-service.html",
    "/p/dmca-copyright.html",
    "/search",
    "/",
}
# Published but not yet re-verified (new page, browser offline at audit time)
LIVE_PENDING = {
    "/p/editorial-team.html",
}
LIVE_REDIRECT = {
    "/p/contact.html": "/p/contact-us.html",
}

valid = set(post_urls) | LIVE_OK | LIVE_PENDING

broken = collections.Counter()
broken_where = collections.defaultdict(list)
redirect = collections.Counter()
ext = collections.Counter()
anchors = collections.Counter()
total = 0

for b, o in list(posts.items()) + list(pages.items()):
    html = o.get("html") or ""
    for m in re.finditer(r'href\s*=\s*"([^"]*)"', html):
        h = m.group(1).strip()
        total += 1
        if h.startswith("#") or h.startswith("mailto:") or h.startswith("tel:"):
            anchors[h[:40]] += 1
            continue
        if h.startswith("http://") or h.startswith("https://"):
            if h.startswith(SITE) or "blogspot.com" in h:
                path = h[len(SITE):] if h.startswith(SITE) else h
            else:
                ext[h] += 1
                continue
        else:
            path = h
        path = path.split("?")[0]
        if path in valid:
            continue
        if path in LIVE_REDIRECT:
            redirect["%s -> %s" % (path, LIVE_REDIRECT[path])] += 1
            continue
        broken[path] += 1
        broken_where[path].append(b)

print("files: %d posts, %d pages | total hrefs: %d" % (len(posts), len(pages), total))
print("\n=== BROKEN INTERNAL (%d distinct) ===" % len(broken))
for h, n in broken.most_common(60):
    print("  %-62s x%-3d  <- %s" % (h, n, ",".join(sorted(set(broken_where[h]))[:6])))
if not broken:
    print("  none")

print("\n=== REDIRECTS (works, but costs a hop) ===")
for h, n in redirect.most_common():
    print("  %-62s x%d" % (h, n))
if not redirect:
    print("  none")

print("\n=== EXTERNAL (%d distinct) ===" % len(ext))
for h, n in ext.most_common(40):
    print("  %-70s x%d" % (h, n))
if not ext:
    print("  none")

print("\n=== payload page slugs vs LIVE url ===")
for b, o in sorted(pages.items()):
    s = o.get("slug")
    guess = "/p/%s.html" % s
    state = "OK" if guess in LIVE_OK else ("PENDING" if guess in LIVE_PENDING else "MISMATCH -> not a live url")
    print("  %-12s %-22s %s" % (b, guess, state))

print("\n=== anchor-only (%d distinct, in-page TOC) ===" % len(anchors))
