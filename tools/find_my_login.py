#!/usr/bin/env python3
"""Narrow the credential hunt to what the USER actually typed.

Filters session_message to rows whose type is a user turn, containing a
gmail address, newest first, and prints a short snippet plus any token that
looks like a password sitting next to a Persian password keyword.

ASCII-only stdout.
"""
from __future__ import print_function

import io
import json
import os
import re
import sqlite3
import sys

DB = r"C:\Users\USER\.local\share\opencode\opencode.db"
OUT = os.path.join(os.environ.get("TEMP", r"C:\Windows\Temp"),
                   "opencode", "user_logins.json")

EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@gmail\.com")
PERSIAN_HINT = re.compile(
    u"[\u0631\u0645\u0632|\u067e\u0633\u0648\u0631\u062f|\u06af\u0630\u0631\u0648\u0627\u0698\u0647|"
    u"\u062c\u06cc\u0645\u06cc\u0644|\u0627\u06cc\u0645\u06cc\u0644|\u06a9\u0644\u0645\u0647|\u0627\u0633\u062a\u062e\u0631\u0627\u0645]",
)
PWD_KEY = re.compile(
    u"(\u0631\u0645\u0632|\u067e\u0633\u0648\u0631\u062f|\u06af\u0630\u0631\u0648\u0627\u0698\u0647|"
    u"\u06a9\u0644\u0645\u0647\\s*\u0639\u0628\u0648\u0631|password|passwd|pwd)",
    re.I,
)


def walk(node, acc):
    """Collect every string inside a JSON message payload."""
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
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    if not os.path.exists(DB):
        print("ERROR: db missing")
        return 2
    con = sqlite3.connect(DB)
    cur = con.cursor()
    cols = [r[1] for r in cur.execute("PRAGMA table_info(session_message)")]
    print("cols: %s" % ", ".join(cols))

    rows = cur.execute(
        "SELECT type, time_created, data FROM session_message "
        "ORDER BY time_created DESC"
    ).fetchall()
    print("total messages: %d" % len(rows))

    hits = []
    for typ, ts, data in rows:
        if not data:
            continue
        try:
            obj = json.loads(data)
        except Exception:
            continue
        blobs = []
        walk(obj, blobs)
        text = "\n".join(blobs)
        mails = sorted(set(EMAIL.findall(text)))
        if not mails:
            continue
        low = text.lower()
        if typ and typ not in ("user", "human"):
            continue
        hints = bool(PERSIAN_HINT.search(text))
        # password candidates: token right after a password keyword
        pwds = []
        for m in PWD_KEY.finditer(text):
            seg = text[m.end():m.end() + 90]
            seg = re.split(r"[\r\n]", seg)[0]
            seg = re.sub(r"^[=:\s'\"\u0022]+", "", seg).strip()
            tok = seg.split()[0] if seg.split() else ""
            if 4 <= len(tok) <= 60 and "@gmail" not in tok and not tok.startswith("http"):
                pwds.append(tok)
        flat = " ".join(text.split())
        hits.append({
            "type": typ,
            "ts": ts,
            "mails": mails,
            "persianHint": hints,
            "passwords": pwds,
            "snippet": flat[:4000],
        })

    print("user messages containing @gmail.com: %d" % len(hits))
    print("")

    def a(s):
        """ASCII-safe view: cp1256 cannot encode every Persian glyph."""
        return "".join(c if 32 <= ord(c) < 127 else "?" for c in s)

    for h in hits[:25]:
        print("ts=%s  mails=%s" % (h["ts"], ",".join(h["mails"])))
        print("   persianHint=%s  pwds=%s" % (h["persianHint"], h["passwords"][:3]))
        print("   snippet: %s" % a(h["snippet"][:520]))
        print("")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8") as fh:
        json.dump(hits, fh, ensure_ascii=False, indent=1)
    print("wrote %s" % OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
