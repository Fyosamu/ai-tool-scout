import glob, json, os, io, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

base = r"C:\Users\USER\Documents\Default Project\ai-tool-scout\blogger\content"
files = sorted(glob.glob(os.path.join(base, "*.json")))

bad = []
print("%-14s %-6s %-6s %-6s  %s" % ("file", "dlen", "tlen", "hlen", "status"))
for p in files:
    name = os.path.basename(p)
    if name == "index.json":
        continue
    with io.open(p, "r", encoding="utf-8") as f:
        d = json.load(f)
    dl = len(d.get("description") or "")
    tl = len(d.get("title") or "")
    hl = len(d.get("html") or "")
    ok = dl <= 150
    if not ok:
        bad.append((name, dl))
    print("%-14s %-6d %-6d %-6d  %s" % (name, dl, tl, hl, "OK" if ok else "TOO LONG"))

print("")
if bad:
    print("OVER LIMIT:")
    for n, l in bad:
        print("   ", n, l)
else:
    print("ALL DESCRIPTIONS <= 150")
