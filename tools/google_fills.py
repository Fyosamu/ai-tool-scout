#!/usr/bin/env python3
"""Find every string that was ever filled/typed into a Google sign-in page.

Probe: messages that mention accounts.google.com (or the password step) AND
carry a browser fill/type tool call. Extract every  text: "..."  value.
ASCII-only stdout.
"""
from __future__ import print_function
import io, json, os, re, sqlite3, sys

DB = r"C:\Users\USER\.local\share\opencode\opencode.db"
OUT = os.path.join(os.environ.get("TEMP", r"C:\Windows\Temp"),
                   "opencode", "google_fills.txt")
THIS = "ses_f2729e1a2ffeq8gDKcCJ6G5vVi"

PAGE = re.compile(r"accounts\.google\.com|/signin/v2/identifier|challenge/pwd|"
                  r"Welcome|Enter your password", re.I)
FILL = re.compile(r"(?:browser\.(?:fill|type|fill_form|press)|\"text\"\s*:)", re.I)
VAL = re.compile(r"text[\"']?\s*[:=]\s*[\"']([^\"']{1,120})[\"']")
VAL2 = re.compile(r"value[\"']?\s*[:=]\s*[\"']([^\"']{1,120})[\"']")


def walk(node, acc):
    if isinstance(node, str):
        acc.append(node)
    elif isinstance(node, dict):
        for v in node.values():
            walk(v, acc)
    elif isinstance(node, list):
        for v in node:
            walk(v, acc)


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    con = sqlite3.connect(DB)
    cur = con.cursor()
    hits, allvals = [], {}
    for sid, typ, ts, data in cur.execute(
            "SELECT session_id, type, time_created, data FROM session_message "
            "ORDER BY time_created ASC"):
        if sid == THIS or not data:
            continue
        try:
            obj = json.loads(data)
        except Exception:
            continue
        acc = []
        walk(obj, acc)
        text = "\n".join(acc)
        if not PAGE.search(text):
            continue
        vals = VAL.findall(text) + VAL2.findall(text)
        if vals:
            allvals.setdefault(" | ".join(sorted(set(vals))[:6]), ts)
        if FILL.search(text) and vals:
            hits.append((typ, ts, sorted(set(vals))[:8]))

    print("messages w/ google page + filled values: %d" % len(hits))
    for typ, ts, vals in hits[:40]:
        print("  type=%-10s ts=%s" % (typ, ts))
        for v in vals:
            print("      fill -> %s" % v)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8") as fh:
        for k, ts in sorted(allvals.items(), key=lambda kv: kv[1]):
            fh.write(u"ts=%s\n  %s\n\n" % (ts, k))
    print("")
    print("distinct fill/value dumps: %d -> %s" % (len(allvals), OUT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
