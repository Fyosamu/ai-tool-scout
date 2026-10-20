#!/usr/bin/env python3
"""Build blogger/FIX_PLAN.json -- the join of payload truth and the live feed.

For every published post we need three things to be able to repair it:
  * the Blogger post id (pid)      -- used to locate the entry in the editor
  * the live slug                  -- what is broken today
  * the target slug + labels       -- what it must become (payload truth)

Output is ASCII only (cp1256-safe).
"""
import io
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CONTENT = os.path.join(ROOT, "blogger", "content")
OUT = os.path.join(ROOT, "blogger", "FIX_PLAN.json")

FEED = "https://scoutaitools.blogspot.com/feeds/posts/default?alt=json&max-results=50"
# Written on every successful live fetch, reused when the network is down so a
# transient failure can never wipe an existing plan.
FEED_CACHE = os.path.join(ROOT, "blogger", "feed_cache.json")


def norm(s):
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())


def load_payloads():
    out = {}
    for name in sorted(os.listdir(CONTENT)):
        m = re.match(r"^post-(\d+)\.json$", name)
        if not m:
            continue
        with io.open(os.path.join(CONTENT, name), encoding="utf-8") as fh:
            p = json.load(fh)
        out[m.group(1)] = {
            "post": m.group(1),
            "slug": p.get("slug") or "",
            "label": p.get("label") or "",
            "title": p.get("title") or "",
            "desc": p.get("description") or "",
            "words": len(re.sub(r"<[^>]+>", " ", p.get("html") or "").split()),
        }
    return out


def _parse_feed(raw):
    """raw -> (rows, total). Shared by the live fetch and the cache."""
    data = json.loads(raw)
    feed = data.get("feed", {})
    entries = feed.get("entry", []) or []
    rows = []
    for e in entries:
        pid = e.get("id", {}).get("$t", "")
        title = e.get("title", {}).get("$t", "")
        cats = [c.get("term", "") for c in (e.get("category") or [])]
        href = ""
        for ln in (e.get("link") or []):
            if ln.get("rel") == "alternate":
                href = ln.get("href", "")
        live_slug = href.rsplit("/", 1)[-1].replace(".html", "") if href else ""
        m = re.search(r"/posts/(\d+)", pid)
        rows.append({
            "pid": m.group(1) if m else pid,
            "title": title,
            "labels": sorted(set(cats)),
            "liveSlug": live_slug,
            "liveHref": href,
        })
    total = feed.get("openSearch$totalResults", {}).get("$t", "")
    return rows, total


def load_feed():
    err = None
    try:
        req = urllib.request.Request(FEED, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=45) as fh:
            raw = fh.read().decode("utf-8")
        rows, total = _parse_feed(raw)
        if rows:
            with io.open(FEED_CACHE, "w", encoding="utf-8") as out:
                out.write(raw)
            return rows, total
        err = "live feed parsed 0 entries"
    except Exception as exc:  # noqa: BLE001
        err = str(exc)

    if os.path.exists(FEED_CACHE):
        with io.open(FEED_CACHE, encoding="utf-8") as fh:
            rows, total = _parse_feed(fh.read())
        if rows:
            print("FEED OFFLINE (%s) -- using cache with %d rows" % (err, len(rows)))
            return rows, total

    raise RuntimeError("no usable feed: %s" % err)


def main():
    payloads = load_payloads()
    try:
        rows, total = load_feed()
    except Exception as exc:  # noqa: BLE001
        # Never write a plan built from an empty feed -- that would destroy the
        # existing one (seen in the field: FEED ERROR -> matched=0 -> wiped).
        print("FEED ERROR: %s" % exc)
        print("ABORT: not writing %s (an empty feed would wipe the plan)"
              % os.path.relpath(OUT, ROOT))
        return 2
    if not rows:
        print("ABORT: feed returned 0 entries, plan left untouched")
        return 2

    by_title = {}
    for r in rows:
        by_title.setdefault(norm(r["title"]), []).append(r)

    plan, unmatched = [], []
    for num in sorted(payloads):
        p = payloads[num]
        key = norm(p["title"])
        cand = by_title.get(key) or []
        r = cand.pop(0) if cand else None
        if r is None:
            unmatched.append({"post": num, "title": p["title"]})
            continue
        plan.append({
            "post": num,
            "pid": r["pid"],
            "title": p["title"],
            "targetSlug": p["slug"],
            "liveSlug": r["liveSlug"],
            "needsPermalink": r["liveSlug"] != p["slug"],
            "payloadLabel": p["label"],
            "liveLabels": r["labels"],
            "needsLabel": not r["labels"],
            "desc": p["desc"],
            "words": p["words"],
            "liveHref": r["liveHref"],
        })

    need_p = [x for x in plan if x["needsPermalink"]]
    need_l = [x for x in plan if x["needsLabel"]]
    good = [x for x in plan if not x["needsPermalink"]]

    doc = {
        "generated": "2026-09-28",
        "feedTotal": total,
        "payloadCount": len(payloads),
        "matched": len(plan),
        "unmatched": unmatched,
        "counts": {
            "total": len(plan),
            "permalinkWrong": len(need_p),
            "permalinkOk": len(good),
            "labelMissing": len(need_l),
        },
        "plan": plan,
    }
    with io.open(OUT, "w", encoding="utf-8") as fh:
        json.dump(doc, fh, ensure_ascii=True, indent=1)

    print("payloads=%d feedTotal=%s matched=%d unmatched=%d"
          % (len(payloads), total, len(plan), len(unmatched)))
    print("permalink wrong = %d   permalink ok = %d   labels missing = %d"
          % (len(need_p), len(good), len(need_l)))
    if unmatched:
        for u in unmatched:
            print("  UNMATCHED post-%s : %s" % (u["post"], u["title"][:60]))
    print("wrote %s" % os.path.relpath(OUT, ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
