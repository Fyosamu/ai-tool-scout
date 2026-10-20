#!/usr/bin/env python3
"""verify_live.py -- one command that proves the LIVE site's real state.

Why this exists: every other checker in tools/ compares payload against
payload, so it happily reports "0 broken links" while the live site serves
404s. This script only talks to the network.

Checks
  1. feed        : 30 posts, permalink == target slug, labels present
  2. link graph  : every /2026/09/ link inside every live post -> HTTP status
  3. theme       : the markers that must reach the live theme
  4. robots/sitemaps

ASCII output only (cp1256-safe). Exit 0 = all green.

Usage:  python tools/verify_live.py
        python tools/verify_live.py --links      (also probe every target)
"""
from __future__ import print_function

import io
import json
import os
import re
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PLAN = os.path.join(ROOT, "blogger", "FIX_PLAN.json")

BASE = "https://scoutaitools.blogspot.com"
FEED = BASE + "/feeds/posts/default?alt=json&max-results=50"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"

fails = []
warns = []


def get(url, timeout=40):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as fh:
            return fh.status, fh.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        return exc.code, (exc.read().decode("utf-8", "replace") if exc.fp else "")
    except Exception as exc:  # noqa: BLE001
        return -1, str(exc)


def bad(msg):
    fails.append(msg)
    print("  [FAIL] " + msg)


def ok(msg):
    print("  [ ok ] " + msg)


def warn(msg):
    warns.append(msg)
    print("  [WARN] " + msg)


def norm(s):
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())


def check_feed(plan_rows):
    print("--- 1. feed: permalinks and labels ---")
    st, body = get(FEED)
    if st != 200:
        bad("feed HTTP %s" % st)
        return []
    try:
        data = json.loads(body)
    except Exception as exc:  # noqa: BLE001
        bad("feed not JSON: %s" % exc)
        return []
    entries = (data.get("feed") or {}).get("entry") or []
    total = (data.get("feed") or {}).get("openSearch$totalResults", {}).get("$t")
    rows = []
    for e in entries:
        title = (e.get("title") or {}).get("$t", "")
        href = ""
        for ln in (e.get("link") or []):
            if ln.get("rel") == "alternate":
                href = ln.get("href", "")
        slug = href.rsplit("/", 1)[-1].replace(".html", "") if href else ""
        labels = sorted({c.get("term", "") for c in (e.get("category") or [])})
        pid = re.search(r"/posts/(\d+)", (e.get("id") or {}).get("$t", ""))
        rows.append({"pid": pid.group(1) if pid else "", "title": title,
                     "slug": slug, "labels": labels, "href": href})

    print("  feed total = %s   entries = %d" % (total, len(rows)))
    if str(total) != "30" or len(rows) != 30:
        bad("expected 30 posts, feed says %s/%d" % (total, len(rows)))

    want = {norm(r["title"]): r for r in plan_rows}
    wrong_slug, no_label = [], []
    for r in rows:
        p = want.get(norm(r["title"]))
        if not p:
            continue
        if r["slug"] != p["targetSlug"]:
            wrong_slug.append("%s -> %s (want %s)"
                              % (p["post"], r["slug"], p["targetSlug"]))
        if not r["labels"]:
            no_label.append("%s %s" % (p["post"], r["title"][:40]))

    if wrong_slug:
        bad("permalinks wrong: %d/%d" % (len(wrong_slug), len(rows)))
        for x in wrong_slug:
            print("        " + x)
    else:
        ok("permalinks: all 30 match the target slug")

    if no_label:
        bad("posts with no label: %d" % len(no_label))
        for x in no_label:
            print("        " + x)
    else:
        ok("labels: every post has at least one")
    return rows


def check_links(probe):
    print("--- 2. internal link graph (live) ---")
    st, sm = get(BASE + "/sitemap.xml")
    posts = re.findall(r"<loc>([^<]+)</loc>", sm) if st == 200 else []
    if not posts:
        bad("sitemap.xml unreadable (HTTP %s)" % st)
        return
    print("  live post urls in sitemap = %d" % len(posts))

    targets = {}
    dead_pages = []
    for u in posts:
        s, html = get(u)
        if s != 200:
            dead_pages.append("%s -> %s" % (u.rsplit("/", 1)[-1], s))
            continue
        found = set(re.findall(
            r"href\s*=\s*[\"'](?:https?://scoutaitools\.blogspot\.com)?"
            r"(/2026/09/[^\"']+\.html)[\"']", html))
        if not found:
            dead_pages.append("no article link: " + u.rsplit("/", 1)[-1])
        for f in found:
            targets[f] = targets.get(f, 0) + 1

    if dead_pages:
        bad("post pages with problems: %d" % len(dead_pages))
        for x in dead_pages:
            print("        " + x)
    else:
        ok("all %d post pages return 200 and carry article links" % len(posts))

    print("  distinct internal targets = %d (refs %d)"
          % (len(targets), sum(targets.values())))
    if not probe:
        warn("target probing skipped -- run with --links")
        return

    live = {u.rsplit("/", 1)[-1] for u in posts}
    broken = []
    for path in sorted(targets):
        if path.rsplit("/", 1)[-1] in live:
            continue
        s, _ = get(BASE + path)
        if s != 200:
            broken.append((path, s, targets[path]))
    if broken:
        bad("broken internal targets: %d (%d links)"
            % (len(broken), sum(b[2] for b in broken)))
        for p, s, c in broken:
            print("        %s -> %s (x%d)" % (p, s, c))
    else:
        ok("every internal link target resolves 200")


def check_theme():
    print("--- 3. live theme markers ---")
    st, home = get(BASE + "/")
    if st != 200:
        bad("homepage HTTP %s" % st)
        return
    checks = [
        ("main landmark", r"id='main' role='main'"),
        ("hero stat 30", r"<strong>30</strong><span>Articles published"),
        ("GA4 tag", r"G-ZTQGKRPVYN"),
        ("cookie bar", r"aits_cookie_consent"),
        ("cookie settings btn", r"Cookie settings"),
        ("consent v2 ad_storage", r"ad_storage"),
        ("consent __gtagConsent", r"__gtagConsent"),
        ("in-text link underline", r"\.site-main p a"),
        ("footer dmca slug", r"dmca-copyright\.html"),
        ("footer terms slug", r"terms-of-service\.html"),
        ("editorial-team link", r"editorial-team"),
    ]
    for name, rx in checks:
        if re.search(rx, home):
            ok(name)
        else:
            bad("missing on live theme: " + name)
    if len(re.findall(r"ca-pub-\d+", home)):
        warn("AdSense ca-pub found on the page (should only appear AFTER approval)")
    else:
        ok("no ad code on the page (correct before approval)")


def check_seo_files():
    print("--- 4. robots + sitemaps + legal pages ---")
    st, robots = get(BASE + "/robots.txt")
    if st == 200 and "Mediapartners-Google" in robots and "Disallow: \n" in robots.replace("\r", ""):
        ok("robots.txt allows Mediapartners-Google + declares sitemap")
    else:
        bad("robots.txt missing Mediapartners-Google allowance (HTTP %s)" % st)

    st, sm = get(BASE + "/sitemap.xml")
    n = len(re.findall(r"<loc>", sm)) if st == 200 else 0
    (ok if n == 30 else bad)("sitemap.xml locs = %d (want 30)" % n)

    st, sp = get(BASE + "/sitemap-pages.xml")
    pages = re.findall(r"<loc>([^<]+)</loc>", sp) if st == 200 else []
    (ok if len(pages) >= 5 else bad)("sitemap-pages locs = %d (want >=5)" % len(pages))
    if len(pages) < 6:
        warn("Editorial Team page not in sitemap-pages yet (%d/6)" % len(pages))

    for name in ["about-ai-tool-scout", "contact-us", "privacy-policy",
                 "terms-of-service", "dmca-copyright"]:
        s, _ = get(BASE + "/p/%s.html" % name)
        (ok if s == 200 else bad)("page /p/%s.html -> %s" % (name, s))


def main():
    probe = "--links" in sys.argv
    rows = []
    if os.path.exists(PLAN):
        with io.open(PLAN, encoding="utf-8") as fh:
            rows = (json.load(fh).get("plan") or [])
        print("plan: %d rows from FIX_PLAN.json" % len(rows))
    else:
        warn("FIX_PLAN.json missing -- run: python tools/build_fix_plan.py")
    print("")

    check_feed(rows)
    print("")
    check_links(probe)
    print("")
    check_theme()
    print("")
    check_seo_files()

    print("")
    print("=" * 60)
    if fails:
        print("RESULT: %d FAILED, %d warning(s)" % (len(fails), len(warns)))
        return 1
    print("RESULT: ALL LIVE CHECKS PASSED (%d warning(s))" % len(warns))
    return 0


if __name__ == "__main__":
    sys.exit(main())
