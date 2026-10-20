#!/usr/bin/env python3
"""Find a Gmail address + password the user says they dropped in a conversation.

Scans every opencode session_message body for
  * an email address (gmail or otherwise)
  * an adjacent password/credential hint

Only the ADDRESS is printed. The password is written to a temp JSON file so it
can be used for the sign-in without ever landing in the transcript.

ASCII-only stdout (cp1256-safe).
"""
from __future__ import print_function

import io
import json
import os
import re
import sqlite3
import sys

CANDIDATES = [
    os.path.join(os.environ.get("LOCALAPPDATA", ""), "opencode", "opencode.db"),
    os.path.join(os.environ.get("APPDATA", ""), "opencode", "opencode.db"),
    os.path.join(os.path.expanduser("~"), ".local", "share", "opencode", "opencode.db"),
    r"C:\Users\USER\.local\share\opencode\opencode.db",
]

OUT_DIR = os.path.join(os.environ.get("TEMP", r"C:\Windows\Temp"), "opencode")
OUT = os.path.join(OUT_DIR, "found_credentials.json")

EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
PWD_KEYS = re.compile(
    r"(password|passwd|pwd|pass\b|secret|credential|"
    r"\u0631\u0645\u0632|\u067e\u0633\u0648\u0631\u062f|\u06a9\u0644\u0645\u0647\s*\u0639\u0628\u0648\u0631)",
    re.I,
)


def scan_text(text, hits, seen_pwd):
    for m in EMAIL.finditer(text):
        addr = m.group(0)
        tail = text[m.end():m.end() + 400]
        ctx_before = text[max(0, m.start() - 160):m.start()]
        blob = ctx_before + " >>> " + tail

        pwd = ""
        # same line:  email ... password  OR  password ... email
        line_start = text.rfind("\n", 0, m.start()) + 1
        line_end = text.find("\n", m.end())
        line = text[line_start: line_end if line_end != -1 else len(text)]
        line_wo_mail = line.replace(addr, " ")

        k = PWD_KEYS.search(line_wo_mail)
        if k:
            seg = line_wo_mail[k.end():]
            seg = re.split(r"[\n\r]", seg)[0]
            seg = re.sub(r"^[=:\s'\"]+", "", seg).strip()
            cand = seg.split()[0] if seg.split() else ""
            if 3 <= len(cand) <= 64 and not EMAIL.match(cand):
                pwd = cand

        if not pwd:
            k2 = PWD_KEYS.search(tail)
            if k2:
                seg = tail[k2.end():]
                seg = re.split(r"[\n\r]", seg)[0]
                seg = re.sub(r"^[=:\s'\"]+", "", seg).strip()
                cand = seg.split()[0] if seg.split() else ""
                if 3 <= len(cand) <= 64 and not EMAIL.match(cand) and not cand.startswith("http"):
                    pwd = cand

        key = addr.lower()
        if key not in hits:
            hits[key] = {
                "email": addr,
                "password": pwd,
                "where": blob.replace("\n", " ")[:220],
            }
        elif pwd and not hits[key]["password"]:
            hits[key]["password"] = pwd
            hits[key]["where"] = blob.replace("\n", " ")[:220]
        if pwd:
            seen_pwd.add(key)


def main():
    db = next((p for p in CANDIDATES if p and os.path.exists(p)), None)
    if not db:
        print("ERROR: opencode.db not found")
        for p in CANDIDATES:
            print("  tried: %s" % p)
        return 2
    print("db: %s" % db)

    con = sqlite3.connect(db)
    cur = con.cursor()
    try:
        tables = [r[0] for r in cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table'")]
        print("tables: %s" % ", ".join(tables))
        cols = [r[1] for r in cur.execute("PRAGMA table_info(session_message)")]
        print("session_message cols: %s" % ", ".join(cols))
        textcol = "data" if "data" in cols else cols[-1]
        n = 0
        hits, with_pwd = {}, set()
        for (val,) in cur.execute("SELECT %s FROM session_message" % textcol):
            if not val:
                continue
            n += 1
            scan_text(val, hits, with_pwd)
        print("scanned %d messages" % n)
    finally:
        con.close()

    if not hits:
        print("NO email found in conversations")
        return 1

    found = sorted(hits.values(), key=lambda h: (not h["password"], h["email"]))
    print("emails found: %d" % len(found))
    for h in found:
        print("  - %s   password=%s" % (h["email"], "YES" if h["password"] else "no"))

    os.makedirs(OUT_DIR, exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8") as fh:
        json.dump({"candidates": found}, fh, ensure_ascii=False, indent=1)
    print("wrote %s" % OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
