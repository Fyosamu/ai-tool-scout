#!/usr/bin/env python3
"""Deep pass: find any password tied to hkay7645, or any Google sign-in context.

Three probes, all written to one UTF-8 file for reading:
  A) user turns mentioning hkay / gmail / password words
  B) any mention of accounts.google.com   -> +-700 chars
  C) any mention of 'Enter your password' -> +-700 chars
ASCII-only stdout.
"""
from __future__ import print_function
import io, json, os, re, sqlite3, sys

DB = r"C:\Users\USER\.local\share\opencode\opencode.db"
OUT = os.path.join(os.environ.get("TEMP", r"C:\Windows\Temp"),
                   "opencode", "pwd_deep.txt")
THIS = "ses_f2729e1a2ffeq8gDKcCJ6G5vVi"

USER_HINT = re.compile(
    r"(hkay|gmail|password|passwd|pwd|"
    u"\u0631\u0645\u0632|\u067e\u0633\u0648\u0631\u062f|"
    u"\u06af\u0630\u0631\u0648\u0627\u0698\u0647|\u062c\u06cc\u0645\u06cc\u0644)", re.I)

GOOGLE = ["accounts.google.com", "Enter your password", "identifier?continue"]
TOKEN = re.compile(r"[A-Za-z0-9@#_\-\.!$%]{6,64}")


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
    rows = cur.execute(
        "SELECT session_id, type, time_created, data FROM session_message "
        "ORDER BY time_created ASC").fetchall()

    parts, seen = [], set()

    def add(tag, text):
        t = " ".join(text.split())
        if len(t) < 12:
            return
        k = (tag, t[:110])
        if k in seen:
            return
        seen.add(k)
        parts.append("### %s\n%s\n" % (tag, t))

    for sid, typ, ts, data in rows:
        if sid == THIS or not data:
            continue
        try:
            obj = json.loads(data)
        except Exception:
            continue
        acc = []
        walk(obj, acc)
        text = "\n".join(acc)
        flat = " ".join(text.split())

        if typ == "user" and USER_HINT.search(text) and len(flat) < 9000:
            add("USER ts=%s" % ts, flat)

        for needle in GOOGLE:
            start = 0
            while True:
                i = flat.find(needle, start)
                if i < 0:
                    break
                start = i + len(needle)
                lo, hi = max(0, i - 700), min(len(flat), i + 700)
                ctx = flat[lo:hi]
                if "reasoning" in ctx[:60] and "Sign in" not in ctx:
                    pass
                add("GOOGLE[%s] ts=%s type=%s" % (needle[:18], ts, typ), ctx)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8") as fh:
        fh.write(u"\n".join(parts))
    print("blocks: %d -> %s" % (len(parts), OUT))

    # ASCII index of anything that looks like a password sitting next to a keyword
    idx = 0
    for p in parts:
        for m in re.finditer(
                r"(password|passwd|pwd|"
                u"\u0631\u0645\u0632|\u067e\u0633\u0648\u0631\u062f"
                r")\W{0,16}([`'\"]?)([A-Za-z0-9@#_\-\.!$%]{6,64})\2",
                p, re.I):
            tok = m.group(3)
            if tok.lower() in ("password", "tryagain", "forgotten", "keyboard"):
                continue
            idx += 1
            if idx <= 60:
                print("  token=%s   near=%s" % (
                    tok, "".join(c if 32 <= ord(c) < 127 else "?"
                                 for c in p[max(0, m.start() - 70):m.start()])[-60:]))
    print("total token hits: %d" % idx)
    return 0


if __name__ == "__main__":
    sys.exit(main())
