#!/usr/bin/env python3
"""Print the exact context around each candidate email + password keyword."""
from __future__ import print_function
import io, json, os, re, sqlite3, sys

DB = r"C:\Users\USER\.local\share\opencode\opencode.db"
OUT = os.path.join(os.environ.get("TEMP", r"C:\Windows\Temp"), "opencode", "pwd_context.txt")

MAILS = ["hkay7645@gmail.com", "akhob59@gmail.com"]
KW = re.compile(
    r"(password|passwd|pwd|\u0631\u0645\u0632|\u067e\u0633\u0648\u0631\u062f|"
    r"\u06af\u0630\u0631\u0648\u0627\u0698\u0647|\u06a9\u0644\u0645\u0647)", re.I)


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
    hits = []
    for typ, ts, data in cur.execute(
            "SELECT type, time_created, data FROM session_message ORDER BY time_created DESC"):
        if not data:
            continue
        try:
            obj = json.loads(data)
        except Exception:
            continue
        blobs = []
        walk(obj, blobs)
        text = "\n".join(blobs)
        low = text.lower()
        for mail in MAILS:
            start = 0
            while True:
                i = low.find(mail, start)
                if i < 0:
                    break
                start = i + 1
                lo, hi = max(0, i - 450), min(len(text), i + len(mail) + 450)
                window = text[lo:hi]
                if not KW.search(window):
                    continue
                # require an actual credential-looking token nearby
                if not re.search(
                    r"(password|passwd|pwd|\u0631\u0645\u0632|\u067e\u0633\u0648\u0631\u062f|"
                    r"\u06af\u0630\u0631\u0648\u0627\u0698\u0647)\W{0,14}([`'\"]?)([A-Za-z0-9@#_\-\.!$%]{6,60})\2",
                    window, re.I):
                    continue
                hits.append({
                    "type": typ, "ts": ts, "mail": mail,
                    "ctx": " ".join(window.split()),
                })

    # de-dup on context prefix
    seen, uniq = set(), []
    for h in hits:
        k = h["ctx"][:150]
        if k in seen:
            continue
        seen.add(k)
        uniq.append(h)

    print("context hits: %d (unique %d)" % (len(hits), len(uniq)))
    lines = []
    for h in uniq[:60]:
        lines.append("=== type=%s ts=%s mail=%s" % (h["type"], h["ts"], h["mail"]))
        lines.append(h["ctx"])
        lines.append("")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8") as fh:
        fh.write(u"\n".join(lines))
    print("wrote %s (%d lines)" % (OUT, len(lines)))

    # also print a compact ASCII view of the strongest token matches
    print("")
    for h in uniq[:20]:
        for m in re.finditer(
                r"(.{0,60})(password|passwd|pwd|\u0631\u0645\u0632|\u067e\u0633\u0648\u0631\u062f|"
                r"\u06af\u0630\u0631\u0648\u0627\u0698\u0647)\W{0,14}([`'\"]?)([A-Za-z0-9@#_\-\.!$%]{6,60})\3",
                h["ctx"], re.I):
            tok = m.group(4)
            pre = "".join(c if 32 <= ord(c) < 127 else "?" for c in m.group(1)[-40:])
            print("   %-24s  ...%s%s" % (tok, pre[-35:], m.group(2)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
