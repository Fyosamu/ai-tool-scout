import json, os, re, glob, collections

C = r"C:\Users\USER\Documents\Default Project\ai-tool-scout\blogger\content"
bad = collections.defaultdict(list)
tot_ids = tot_anch = 0
for f in sorted(glob.glob(os.path.join(C, "*.json"))):
    b = os.path.basename(f)
    if b == "index.json":
        continue
    o = json.load(open(f, encoding="utf-8"))
    html = o.get("html") or ""
    ids = set(re.findall(r'\bid\s*=\s*"([^"]+)"', html))
    anchors = [m.group(1) for m in re.finditer(r'href\s*=\s*"#([^"]+)"', html)]
    tot_ids += len(ids)
    tot_anch += len(anchors)
    for a in anchors:
        if a not in ids:
            bad[b].append(a)

print("total ids=%d  in-page anchors=%d" % (tot_ids, tot_anch))
print("BROKEN ANCHORS: %d" % sum(len(v) for v in bad.values()))
for b, v in bad.items():
    print("  %-14s %s" % (b, sorted(set(v))))

# duplicate ids?
print("\nDUPLICATE IDS:")
dupfound = 0
for f in sorted(glob.glob(os.path.join(C, "*.json"))):
    b = os.path.basename(f)
    if b == "index.json":
        continue
    o = json.load(open(f, encoding="utf-8"))
    ids = re.findall(r'\bid\s*=\s*"([^"]+)"', o.get("html") or "")
    d = [k for k, n in collections.Counter(ids).items() if n > 1]
    if d:
        dupfound += 1
        print("  %-14s %s" % (b, d))
if not dupfound:
    print("  none")

# heading order check per document
print("\nHEADING ORDER (h1 skipped - theme owns it):")
issues = 0
for f in sorted(glob.glob(os.path.join(C, "*.json"))):
    b = os.path.basename(f)
    if b == "index.json":
        continue
    o = json.load(open(f, encoding="utf-8"))
    hs = [int(m.group(1)) for m in re.finditer(r'<h([1-6])\b', o.get("html") or "")]
    if not hs:
        continue
    prev = hs[0]
    jumps = 0
    for h in hs[1:]:
        if h > prev + 1:
            jumps += 1
        prev = h
    if jumps:
        issues += 1
        print("  %-14s jumps=%d  seq=%s" % (b, jumps, hs[:14]))
if not issues:
    print("  no heading level skips")
