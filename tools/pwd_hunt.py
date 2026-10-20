#!/usr/bin/env python3
"""Hunt the actual password: credential table + every message type + patterns."""
from __future__ import print_function
import io, json, os, re, sqlite3, sys

DB = r"C:\Users\USER\.local\share\opencode\opencode.db"
OUT = os.path.join(os.environ.get("TEMP", r"C:\Windows\Temp"), "opencode", "pwd_hunt.json")

EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@gmail\.com")
STRONG = re.compile(
    r"(?:password|passwd|pwd|pass\s*word|pass\s*=\s*|pass\s*:\s*|"
    r"\u0631\u0645\u0632|\u067e\u0633\u0648\u0631\u062f|\u06af\u0630\u0631\u0648\u0627\u0698\u0647)",
    re.I,
)
# a token that could be a password: long-ish, has digits and letters
CAND = re.compile(r"[A-Za-z0-9@#_\-\.!$%]{6,60}")


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

    print("== session_message types ==")
    for t, n in cur.execute("SELECT type, COUNT(*) FROM session_message GROUP BY type"):
        print("   %-14s %d" % (str(t), n))

    print("")
    print("== credential table ==")
    cols = [r[1] for r in cur.execute("PRAGMA table_info(credential)")]
    print("   cols: %s" % ", ".join(cols))
    rows = cur.execute("SELECT * FROM credential").fetchall()
    print("   rows: %d" % len(rows))
    for r in rows[:20]:
        print("   %s" % (str(r)[:400],))

    print("")
    print("== account table ==")
    acols = [r[1] for r in cur.execute("PRAGMA table_info(account)")]
    print("   cols: %s" % ", ".join(acols))
    arows = cur.execute("SELECT * FROM account").fetchall()
    print("   rows: %d" % len(arows))
    for r in arows[:20]:
        print("   %s" % (str(r)[:400],))

    print("")
    print("== messages with a gmail AND a password keyword ==")
    out = []
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
        mails = sorted(set(EMAIL.findall(text)))
        if not mails:
            continue
        for m in STRONG.finditer(text):
            seg = text[m.end():m.end() + 120]
            seg = re.split(r"[\r\n]", seg)[0]
            seg = re.sub(r"^[=:\s'\"]+", "", seg).strip()
            toks = CAND.findall(seg)
            toks = [t for t in toks if "@" not in t and not t.lower().startswith("http")]
            if not toks:
                continue
            out.append({
                "type": typ, "ts": ts, "mails": mails,
                "keyword": m.group(0),
                "after": seg[:160],
                "tokens": toks[:4],
            })
            break
    print("   hits: %d" % len(out))
    for h in out[:30]:
        print("   type=%s ts=%s mail=%s kw=%r" % (
            h["type"], h["ts"], ",".join(h["mails"]), h["keyword"]))
        print("      after: %s" % h["after"])
        print("      tokens: %s" % h["tokens"])

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print("")
    print("wrote %s" % OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
