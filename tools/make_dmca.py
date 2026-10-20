import json, os

page = {
    "id": "page-06",
    "kind": "page",
    "title": "DMCA & Copyright",
    "slug": "dmca-copyright",
    "label": "",
    "description": "How to report copyright infringement on AI Tool Scout: notice requirements, response timeline, counter-notification and repeat-infringer policy.",
    "html": """<p class="lead">How to report copyright infringement and how we respond. Last updated 27 September 2026.</p>

<div class="prose">
  <div class="callout callout-info">
    <div class="callout-title">The short version</div>
    <p>Found something on AI Tool Scout that you believe copies your work? Email <strong>copyright@aitoolscout.com</strong> with the details listed below. We review every complete notice promptly and remove or disable access to material we find infringing.</p>
  </div>

  <h2>1. Our commitment</h2>
  <p>AI Tool Scout publishes original editorial work written and reviewed by our own team. We do not copy articles from other websites, and we do not publish unedited machine translations. If we ever get it wrong, we fix it quickly &mdash; that is what this page is for.</p>

  <h2>2. Filing a copyright notice (DMCA)</h2>
  <p>To help us locate the material quickly, a valid notice should include all of the following:</p>
  <ol>
    <li>A physical or electronic signature of the copyright owner, or of a person authorised to act on the owner's behalf.</li>
    <li>Identification of the copyrighted work you claim has been infringed &mdash; a link to the original source is always helpful.</li>
    <li>Identification of the material you say is infringing, including the <strong>exact URL(s)</strong> on this site where it appears.</li>
    <li>Your full name, mailing address, telephone number and email address.</li>
    <li>A statement that you have a good-faith belief that the use complained of is not authorised by the copyright owner, its agent, or the law.</li>
    <li>A statement, made under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorised to act on the owner's behalf.</li>
  </ol>
  <p>Send the complete notice to <strong>copyright@aitoolscout.com</strong> with the subject line &ldquo;DMCA notice&rdquo;. Incomplete notices slow the review down, so please include every item.</p>

  <h2>3. What happens after you write to us</h2>
  <ul>
    <li>We acknowledge every complete notice within <strong>two business days</strong>.</li>
    <li>We review the claim against the original work, and where the claim is supported we remove or disable access to the material promptly.</li>
    <li>We keep a record of notices and their outcomes.</li>
    <li>We may terminate access for users or contributors who repeatedly infringe copyright.</li>
    <li>Removed material is only restored where we hold a documented right to use it (a licence, written permission, or a determination that the use is lawful).</li>
  </ul>

  <h2>4. Counter-notification</h2>
  <p>If you believe your content was removed through mistake or misidentification, you may send a counter-notification to the same address. It should contain:</p>
  <ul>
    <li>Identification of the material that was removed and the location where it appeared before removal.</li>
    <li>Your name, address, telephone number and email address.</li>
    <li>A statement under penalty of perjury that you have a good-faith belief the material was removed as a result of mistake or misidentification.</li>
    <li>Your consent to the jurisdiction of the appropriate federal court, or your acceptance of service of process from the party who filed the original notice.</li>
  </ul>

  <h2>5. Other concerns</h2>
  <p>Trademark questions, privacy requests and broken links are handled through the channels on our <a href="/p/contact-us.html">Contact page</a> &mdash; please mark the subject line clearly so it reaches the right person.</p>

  <div class="callout callout-warn">
    <div class="callout-title">Please be sure before you file</div>
    <p>Knowingly making a false claim of infringement can have legal consequences. This page describes our process and is general information, not legal advice.</p>
  </div>
</div>""",
}

out = r"C:\Users\USER\Documents\Default Project\ai-tool-scout\blogger\content\page-06.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(page, f, ensure_ascii=False, separators=(",", ":"))

# verify round-trip
d = json.load(open(out, encoding="utf-8"))
print("written:", out)
print("bytes:", os.path.getsize(out))
print("keys:", list(d.keys()))
print("title:", d["title"], "| slug:", d["slug"], "| html chars:", len(d["html"]))

# make-editor-content.js rewrites index.json from src/pages.js alone, so the
# DMCA page (which lives here, not in src) has to be merged back in afterwards.
# Run order is therefore: make-editor-content.js -> make_dmca.py
idx_path = os.path.join(os.path.dirname(out), "index.json")
try:
    idx = json.load(open(idx_path, encoding="utf-8"))
except FileNotFoundError:
    idx = []
if not any(e.get("id") == page["id"] for e in idx):
    idx.append({"id": page["id"], "kind": page["kind"], "title": page["title"], "slug": page["slug"]})
    with open(idx_path, "w", encoding="utf-8") as f:
        json.dump(idx, f, ensure_ascii=False, indent=2)
    print("index.json: added", page["id"], "-> total", len(idx))
else:
    print("index.json: already contains", page["id"])
