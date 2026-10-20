import sqlite3, os, json, sys, collections

ROOT = r"C:\Users\USER\Documents\Default Project"
TMP = r"C:\Users\USER\AppData\Local\Temp\opencode"
db = os.path.expandvars(r"%USERPROFILE%\.local\share\opencode\opencode.db")
con = sqlite3.connect("file:" + db.replace("\\", "/") + "?mode=ro", uri=True)
cur = con.cursor()

# collect write/edit ops in chronological order (seq)
ops = []
q = """SELECT seq, data FROM session_message
       WHERE type='assistant' AND (data LIKE '%"name":"write"%' OR data LIKE '%"name":"edit"%')
       ORDER BY seq"""
for seq, data in cur.execute(q):
    try:
        obj = json.loads(data)
    except Exception:
        continue
    c = obj.get("content")
    if not isinstance(c, list):
        continue
    for p in c:
        if not isinstance(p, dict) or p.get("type") != "tool":
            continue
        if p.get("name") not in ("write", "edit"):
            continue
        inp = (p.get("state") or {}).get("input") or {}
        path = inp.get("path")
        if not path:
            continue
        ops.append((seq, p.get("name"), path, inp))
con.close()

print("total ops:", len(ops))

def full(path):
    p = path.strip().strip('"')
    if os.path.isabs(p):
        return p
    return os.path.join(ROOT, p)

# replay per file
state = {}          # path -> content
order = []
failed = []
stats = collections.Counter()

for seq, name, path, inp in ops:
    fp = os.path.normpath(full(path))
    if not (fp.startswith(os.path.normpath(ROOT)) or fp.startswith(os.path.normpath(TMP))):
        stats["skip-outside"] += 1
        continue
    if name == "write":
        state[fp] = inp.get("content") or ""
        stats["write"] += 1
        if fp not in order:
            order.append(fp)
    else:
        stats["edit"] += 1
        cur_c = state.get(fp)
        if cur_c is None:
            # file may have existed on disk before; read it if present
            try:
                with open(fp, "r", encoding="utf-8", errors="replace") as f:
                    cur_c = f.read()
            except Exception:
                failed.append((fp, "edit-without-base", ""))
                continue
            if fp not in order:
                order.append(fp)
        old = inp.get("oldString") or ""
        new = inp.get("newString") or ""
        if old and old in cur_c:
            if inp.get("replaceAll"):
                state[fp] = cur_c.replace(old, new)
            else:
                state[fp] = cur_c.replace(old, new, 1)
        elif old:
            failed.append((fp, "oldString-not-found", old[:60]))
            stats["edit-fail"] += 1
        else:
            state[fp] = cur_c + new
        stats["edit-ok"] += 1

print("stats:", dict(stats))
print("distinct files:", len(state))

written, skipped, errs = [], [], []
for fp in order:
    if fp not in state:
        continue
    if os.path.exists(fp):
        skipped.append(fp)
        continue
    try:
        os.makedirs(os.path.dirname(fp), exist_ok=True)
        with open(fp, "w", encoding="utf-8", newline="") as f:
            f.write(state[fp])
        written.append(fp)
    except Exception as e:
        errs.append((fp, str(e)))

print("\nRESTORED:", len(written))
for fp in sorted(written):
    print("  +", fp)
print("already present (left alone):", len(skipped))
for fp in sorted(skipped)[:20]:
    print("  =", fp)
print("errors:", len(errs))
for e in errs[:20]:
    print("  !", e)
print("edit failures:", len(failed))
for e in failed[:25]:
    print("  ~", e[0], "|", e[1], "|", e[2])

with open(os.path.join(TMP, "restore_report.txt"), "w", encoding="utf-8") as f:
    f.write("RESTORED %d\n\n" % len(written))
    for fp in sorted(written):
        f.write("+ " + fp + "\n")
    f.write("\nSKIPPED %d\n" % len(skipped))
    for fp in sorted(skipped):
        f.write("= " + fp + "\n")
    f.write("\nEDIT-FAIL %d\n" % len(failed))
    for e in failed:
        f.write("~ %s | %s | %s\n" % e)
