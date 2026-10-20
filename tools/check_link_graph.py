import json, os, re, glob, collections

C = r"C:\Users\USER\Documents\Default Project\ai-tool-scout\blogger\content"
SITE = "https://scoutaitools.blogspot.com"

docs = {}
for f in sorted(glob.glob(os.path.join(C, "*.json"))):
    b = os.path.basename(f)
    if b == "index.json":
        continue
    o = json.load(open(f, encoding="utf-8"))
    docs[b] = o

# resolve each doc to a node key
key = {}
for b, o in docs.items():
    if o.get("kind") == "page" or b.startswith("page-"):
        key[b] = "/p/%s.html" % o["slug"]
    else:
        key[b] = "/2026/09/%s.html" % o["slug"]
by_path = {v: k for k, v in key.items()}

out = collections.defaultdict(set)
inn = collections.defaultdict(set)
unresolved = collections.Counter()
for b, o in docs.items():
    for m in re.finditer(r'href\s*=\s*"([^"]+)"', o.get("html") or ""):
        h = m.group(1)
        if h.startswith("http") and not (h.startswith(SITE) or "blogspot.com" in h):
            continue
        if h.startswith(SITE):
            h = h[len(SITE):]
        if h.startswith("#") or h.startswith("mailto:"):
            continue
        tgt = by_path.get(h)
        if tgt is None:
            if h.startswith("/2026/") or h.startswith("/p/"):
                unresolved[h] += 1
            continue
        if tgt != b:
            out[b].add(tgt)
            inn[tgt].add(b)

posts = [b for b in docs if b.startswith("post-")]
pages = [b for b in docs if b.startswith("page-")]

print("posts=%d pages=%d" % (len(posts), len(pages)))
print("unresolved internal targets:", dict(unresolved))

no_out = [b for b in posts if not out[b]]
no_in = [b for b in posts if not inn[b]]
print("\nposts with NO outbound internal link: %d -> %s" % (len(no_out), sorted(no_out)))
print("posts with NO inbound internal link:  %d -> %s" % (len(no_in), sorted(no_in)))

# BFS from homepage-ish roots (pages act as entry points)
roots = pages
seen = set(roots)
frontier = list(roots)
depth = {r: 0 for r in roots}
while frontier:
    nxt = []
    for u in frontier:
        for v in out[u]:
            if v not in seen:
                seen.add(v)
                depth[v] = depth[u] + 1
                nxt.append(v)
    frontier = nxt
unreach = [b for b in docs if b not in seen]
print("\nreachable from the 4 pages: %d / %d" % (len(seen), len(docs)))
if unreach:
    print("  unreachable:", sorted(unreach))
ds = [depth[b] for b in seen]
print("  max depth from pages = %d, avg = %.2f" % (max(ds), sum(ds) / len(ds)))

# label clusters
labels = collections.Counter(o.get("label") or "?" for b, o in docs.items() if b.startswith("post-"))
print("\nLABEL clusters:")
for l, n in labels.most_common():
    members = sorted(b for b in posts if (docs[b].get("label") or "?") == l)
    cross = sum(1 for b in members if any(t.startswith("post-") for t in out[b]))
    print("  %-14s n=%-3d with-outbound-links=%d" % (l, n, cross))

deg = sorted(((len(out[b]), b) for b in posts), reverse=True)
print("\nTOP internal hubs:")
for d, b in deg[:8]:
    print("   %-3d out / %-3d in   %s" % (d, len(inn[b]), b))
