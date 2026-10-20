#!/usr/bin/env python3
"""check_feed.py -- verify every post's live URL against blogger/FIX_PLAN.json.

The browser feed tab goes down often (tunnel), so verification must be able to
run from the command line. Tries the live feed first, falls back to the cache
written by build_fix_plan.py.

Output is ASCII only (cp1256-safe).

Exit codes:
  0 = every post's live URL matches targetSlug
  1 = at least one mismatch
  2 = could not read a feed at all
"""
import io
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PLAN = os.path.join(ROOT, "blogger", "FIX_PLAN.json")
CACHE = os.path.join(ROOT, "blogger", "feed_cache.json")
FEED = "https://scoutaitools.blogspot.com/feeds/posts/default?alt=json&max-results=50"

YEAR = "2026"
MONTH = "09"


def norm(s):
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())


def parse(raw):
    data = json.loads(raw)
    feed = data.get("feed", {})
    out = {}
    for e in feed.get("entry", []) or []:
        # Feed ids look like tag:blogger.com,1999:blog-<bid>.post-<pid>
        pid_m = re.search(r"\.post-(\d+)", e.get("id", {}).get("$t", "")) or \
            re.search(r"/posts/(\d+)", e.get("id", {}).get("$t", ""))
        if not pid_m:
            continue
        href = ""
        for ln in (e.get("link") or []):
            if ln.get("rel") == "alternate":
                href = ln.get("href", "")
        out[pid_m.group(1)] = {
            "href": href,
            "slug": href.rsplit("/", 1)[-1].replace(".html", "") if href else "",
            "title": e.get("title", {}).get("$t", ""),
            "labels": sorted({c.get("term", "") for c in (e.get("category") or [])}),
        }
    return out, feed.get("openSearch$totalResults", {}).get("$t", "")


def load_feed():
    errs = []
    try:
        req = urllib.request.Request(FEED, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=45) as fh:
            raw = fh.read().decode("utf-8")
        rows, total = parse(raw)
        if rows:
            with io.open(CACHE, "w", encoding="utf-8") as out:
                out.write(raw)
            return rows, total, "live"
        errs.append("live feed parsed 0 entries")
    except Exception as exc:  # noqa: BLE001
        errs.append(str(exc))

    if os.path.exists(CACHE):
        with io.open(CACHE, encoding="utf-8") as fh:
            rows, total = parse(fh.read())
        if rows:
            return rows, total, "cache(%s)" % errs[-1][:60]
    raise RuntimeError("; ".join(errs))


def main():
    with io.open(PLAN, encoding="utf-8") as fh:
        plan = json.load(fh)
    items = plan.get("plan") or []
    if not items:
        print("ABORT: FIX_PLAN.json has an empty plan")
        return 2

    try:
        live, total, source = load_feed()
    except Exception as exc:  # noqa: BLE001
        print("FEED ERROR: %s" % exc)
        return 2

    print("feed source = %s   entries = %s   plan = %d" % (source, total, len(items)))

    bad_slug, bad_label, missing = [], [], []
    for it in items:
        num = it["post"]
        pid_raw = it["pid"]
        # plan stores the full tag id; normalise to the numeric pid used as key
        pid_m = re.search(r"\.post-(\d+)", pid_raw) or re.search(r"(\d+)$", pid_raw)
        pid = pid_m.group(1) if pid_m else pid_raw
        target = it["targetSlug"]
        want = "https://scoutaitools.blogspot.com/%s/%s/%s.html" % (YEAR, MONTH, target)
        row = live.get(pid)
        if row is None:
            missing.append(num)
            print("  post-%s  MISSING from feed" % num)
            continue
        if row["href"] != want:
            bad_slug.append(num)
            print("  post-%s  SLUG  live=%-45s want=%s"
                  % (num, row["slug"], target))
        want_label = (it.get("payloadLabel") or "").strip()
        if want_label:
            labels = [norm(x) for x in row["labels"]]
            if norm(want_label) not in labels:
                bad_label.append(num)
                print("  post-%s  LABEL live=%-45s want=%s"
                      % (num, ",".join(row["labels"]) or "-", want_label))

    ok = not (bad_slug or bad_label or missing)
    print("permalink wrong = %d   label wrong = %d   missing = %d"
          % (len(bad_slug), len(bad_label), len(missing)))
    print("RESULT: %s" % ("ALL OK" if ok else "FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
