"use strict";
/**
 * Generates blogger/import-new.xml — a Blogger content-backup XML containing
 * ONLY the not-yet-published articles (src/posts-4..7), so it can be uploaded
 * through Settings → Manage blog → Import content without touching the 6 posts
 * and 5 pages that are already live.
 *
 * Two things it does that make-import.js does not:
 *
 *  1. SLUG_MAP — the six live posts were published from the editor, so Blogger
 *     derived their permalinks from the TITLE, not from the `slug` field in the
 *     source. Internal links written as /2026/09/<source-slug>.html would 404.
 *     This map rewrites those links to the real, resolving URLs.
 *
 *  2. Explicit <link href> per entry — we declare the canonical permalink we
 *     want for each NEW post. Whether Blogger honours it is verified with a
 *     one-post test import before the full batch goes in.
 *
 * Usage:
 *   node blogger/make-import-new.js                 # every unpublished post
 *   node blogger/make-import-new.js post-07 post-08 # only these slugs
 */
const fs = require("fs");
const path = require("path");
const { assemblePostBody } = require("./make-import");

const ROOT = path.join(__dirname, "..");
const BLOG_ID = "4791704820460938856";
const BASE = "https://scoutaitools.blogspot.com";
const PERMA_MONTH = "2026/09";

/* Source slug -> live permalink slug (title-derived by Blogger). */
const SLUG_MAP = {
  "best-ai-writing-tools-2026": "blog-post",
  "chatgpt-vs-claude-2026": "chatgpt-vs-claude-which-is-better-in",
  "how-to-write-better-prompts": "how-to-write-better-prompts-5-part",
  "free-ai-tools-worth-using": "12-free-ai-tools-worth-using-in-2026",
  "automate-workflows-without-coding": "automate-your-work-without-coding-2026",
  "what-will-happen-in-next-5-years-ai": "what-will-happen-in-next-5-years-ai",
};

const SOURCES = ["posts-4", "posts-5", "posts-6", "posts-7"];

function escText(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;");
}

/** Rewrite internal links from source slugs to the real live permalinks. */
function fixLinks(html) {
  let out = html;
  for (const [from, to] of Object.entries(SLUG_MAP)) {
    out = out.split(`/2026/09/${from}.html`).join(`/2026/09/${to}.html`);
    out = out.split(`/${from}.html`).join(`/2026/09/${to}.html`);
  }
  return out;
}

function entry(o) {
  const cats = [
    `  <category scheme='http://www.blogger.com/atom/ns#' term='kind' label='${o.kind}'/>`,
    ...o.labels.map(
      (l) => `  <category scheme='http://www.blogger.com/atom/ns#' term='${escAttr(l)}'/>`
    ),
  ].join("\n");

  return `  <entry>
  <author>
    <name>AI Tool Scout</name>
    <email>noreply@blogger.com</email>
  </author>
${cats}
  <content type='html'>${escText(o.body)}</content>
  <published>${o.published}</published>
  <id>tag:blogger,1999:blog-${BLOG_ID}.post-${o.num}</id>
  <link rel='alternate' type='text/html' href='${escAttr(o.url)}' title='${escAttr(o.title)}'/>
  <title type='text'>${escText(o.title)}</title>
  <updated>${o.updated}</updated>
  <app:control>
    <app:draft status='false'/>
  </app:control>
  <thr:total>0</thr:total>
</entry>`;
}

function main() {
  const wanted = process.argv.slice(2);

  const posts = [];
  for (const name of SOURCES) {
    const file = path.join(ROOT, "src", `${name}.js`);
    if (!fs.existsSync(file)) continue;
    for (const p of require(file)) posts.push(p);
  }

  if (!posts.length) {
    console.log("nothing to import — src/posts-4..7 do not exist yet");
    process.exit(0);
  }

  const sel = wanted.length ? posts.filter((p) => wanted.includes(p.slug)) : posts;
  if (wanted.length && sel.length !== wanted.length) {
    const missing = wanted.filter((s) => !sel.some((p) => p.slug === s));
    console.log("ERROR unknown slugs: " + missing.join(", "));
    process.exit(1);
  }

  let num = 910100001;
  const entries = sel.map((p) =>
    entry({
      kind: "POST",
      labels: [p.category],
      title: p.title,
      url: `${BASE}/${PERMA_MONTH}/${p.slug}.html`,
      body: fixLinks(assemblePostBody(p)),
      published: `${p.date}T09:00:00-07:00`,
      updated: `${p.updated}T09:00:00-07:00`,
      num: num++,
    })
  );

  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const xml = `<?xml version='1.0' encoding='UTF-8'?>
<blog xmlns='http://www.w3.org/2005/Atom'
      xmlns:app='http://purl.org/atom/app#'
      xmlns:thr='http://purl.org/syndication/thread/1.0'
      xmlns:gd='http://schemas.google.com/g/2005'
      xmlns:openSearch='http://opensearch.blogspot.com/ns/'>
  <id>tag:blogger,1999:blog-${BLOG_ID}</id>
  <published>${now}</published>
  <updated>${now}</updated>
  <title type='text'>AI Tool Scout</title>
  <subtitle type='text'>Find the right AI tool in minutes, not weeks — independent AI tool reviews, comparisons and guides.</subtitle>
  <link rel='self' type='application/atom+xml' href='https://www.blogger.com/feeds/${BLOG_ID}/posts/default'/>
  <link rel='alternate' type='text/html' href='${BASE}/'/>
  <generator version='7.00' uri='http://www.blogger.com'>Blogger</generator>
  <author>
    <name>AI Tool Scout</name>
    <email>noreply@blogger.com</email>
  </author>
${entries.join("\n")}
</blog>
`;

  const out = path.join(__dirname, "import-new.xml");
  fs.writeFileSync(out, xml, "utf8");
  console.log(`\u2713 ${out}`);
  console.log(`  ${sel.length} new post(s) \u00b7 ${(Buffer.byteLength(xml, "utf8") / 1024).toFixed(1)} KB`);
  sel.forEach((p) =>
    console.log(`  \u00b7 ${p.date}  /${PERMA_MONTH}/${p.slug}.html  \u00ab ${p.title} \u00bb`)
  );

  // Report any internal link that still does not resolve after fixLinks().
  const known = new Set([
    ...Object.values(SLUG_MAP).map((s) => `/2026/09/${s}.html`),
    ...posts.map((p) => `/2026/09/${p.slug}.html`),
  ]);
  const bad = new Set();
  sel.forEach((p) => {
    const body = fixLinks(assemblePostBody(p));
    const m = body.match(/href="\/2026\/09\/[^"]+\.html"/g) || [];
    m.forEach((h) => {
      const u = h.slice(6, -1);
      if (!known.has(u)) bad.add(u);
    });
  });
  if (bad.size) console.log("\n  !! unresolved internal links:\n    " + [...bad].join("\n    "));
}

main();
