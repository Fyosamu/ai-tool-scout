#!/usr/bin/env python3
"""Print exact context for the two password-looking tokens we found."""
from __future__ import print_function
import io, json, os, re, sqlite3, sys

DB = r"C:\Users\USER\.local\share\opencode\opencode.db"
OUT = os.path.join(os.environ.get("TEMP", r"C:\Windows\Temp"), "opencode", "token_ctx.txt")
TOKENS = ["Va7-r2enm7bq55t50v", "Ariangol12", "ariangol12"]
THIS = "ses_f2729e1a2ffeq8gDKcCJ6G5vVi"


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
    lines, seen = [], set()
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
        for tok in TOKENS:
            start = 0
            while True:
                i = text.find(tok, start)
                if i < 0:
                    break
                start = i + 1
                lo, hi = max(0, i - 500), min(len(text), i + len(tok) + 500)
                ctx = " ".join(text[lo:hi].split())
                key = ctx[:120]
                if key in seen:
                    continue
                seen.add(key)
                lines.append("### type=%s ts=%s token=%s" % (typ, ts, tok))
                lines.append(ctx)
                lines.append("")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8") as fh:
        fh.write(u"\n".join(lines))
    print("contexts: %d  -> %s" % (len(lines) // 3, OUT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
