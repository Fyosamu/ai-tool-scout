#!/usr/bin/env python3
"""User turns that look like they carry a password. Excludes THIS session."""
from __future__ import print_function
import io, json, os, re, sqlite3, sys

DB = r"C:\Users\USER\.local\share\opencode\opencode.db"
OUT = os.path.join(os.environ.get("TEMP", r"C:\Windows\Temp"), "opencode", "user_pwd.txt")
THIS = "ses_f2729e1a2ffeq8gDKcCJ6G5vVi"

KW = re.compile(
    r"(password|passwd|pwd|\u0631\u0645\u0632|\u067e\u0633\u0648\u0631\u062f|"
    r"\u06af\u0630\u0631\u0648\u0627\u0698\u0647|\u06a9\u0644\u0645\u0647\s*\u0639\u0628\u0648\u0631|"
    r"\u062c\u06cc\u0645\u06cc\u0644|\u0627\u06cc\u0645\u06cc\u0644)", re.I)
TOKEN = re.compile(r"[A-Za-z0-9@#_\-\.!$%]{5,64}")


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
    found = []
    for sid, typ, ts, data in cur.execute(
            "SELECT session_id, type, time_created, data FROM session_message "
            "ORDER BY time_created DESC"):
        if typ != "user" or sid == THIS or not data:
            continue
        try:
            obj = json.loads(data)
        except Exception:
            continue
        blobs = []
        walk(obj, blobs)
        text = "\n".join(blobs)
        if not KW.search(text):
            continue
        # drop instruction/system noise: only short-ish human messages
        flat = " ".join(text.split())
        if len(flat) > 6000:
            continue
        toks = [t for t in TOKEN.findall(flat) if not t.lower().startswith("http")]
        found.append({"ts": ts, "sid": sid, "text": flat, "tokens": toks[:40]})

    print("candidate user messages: %d" % len(found))
    lines = []
    for f in found[:60]:
        lines.append("=== ts=%s sid=%s" % (f["ts"], f["sid"]))
        lines.append(f["text"])
        lines.append("")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8") as fh:
        fh.write(u"\n".join(lines))
    print("wrote %s (%d lines)" % (OUT, len(lines)))
    for f in found[:40]:
        print("ts=%s tokens=%s" % (f["ts"], f["tokens"][:25]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
