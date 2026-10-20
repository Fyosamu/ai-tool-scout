"use strict";
/**
 * Generates blogger/import.xml — a Blogger content-backup XML that can be
 * uploaded via Settings → Manage blog → Import content.
 *
 * Contains: all articles (posts-1/2/3) + static pages (About, Contact,
 * Privacy, Terms), with:
 *   - heading ids + build-time table of contents
 *   - FAQ rendered as callout blocks (Blogger-friendly HTML)
 *   - internal links rewritten to the blogspot URL structure
 *
 * Zero dependencies. Run: node blogger/make-import.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const posts = [
  ...require(path.join(ROOT, "src/posts-1")),
  ...require(path.join(ROOT, "src/posts-2")),
  ...require(path.join(ROOT, "src/posts-3")),
];
const pages = require(path.join(ROOT, "src/pages"));

const BLOG_ID = "4791704820460938856";
const BASE = "https://scoutaitools.blogspot.com";

/* ------------------------------------------------------------------ */
/* Helpers (mirrors of build.js logic)                                 */
/* ------------------------------------------------------------------ */

function escAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;");
}

function escText(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .replace(/&[a-z]+;/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function withHeadingIds(html) {
  let i = 0;
  return html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (m, attrs, inner) => {
    if (/\sid=/.test(attrs)) return m;
    i += 1;
    const plain = inner.replace(/<[^>]+>/g, "");
    const id = slugifyHeading(plain) || "section-" + i;
    return `<h2 id="${id}"${attrs}>${inner}</h2>`;
  });
}

function buildToc(bodyHtml) {
  const headings = [];
  const re = /<h2[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g;
  let m;
  while ((m = re.exec(bodyHtml)) !== null) {
    headings.push({ id: m[1], text: m[2].replace(/<[^>]+>/g, "").trim() });
  }
  if (headings.length < 2) return "";
  const items = headings
    .map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`)
    .join("\n            ");
  return `
      <nav class="toc" aria-labelledby="toc-heading">
        <h2 id="toc-heading">Table of contents</h2>
        <ol>
            ${items}
        </ol>
      </nav>`;
}

/* Rewrite internal links to the blogspot URL structure. */
const LINK_MAP = {
  "/": "/",
  "/blog/": "/",
  "/guides/": "/search/label/Guides",
  // Real Blogger page URLs (live blog, verified 2026-09-27). /p/contact.html
  // 301s to contact-us and the old /p/about.html & /p/terms.html slugs were
  // replaced, so linking to them costs a hop or 404s outright.
  "/about/": "/p/about-ai-tool-scout.html",
  "/contact/": "/p/contact-us.html",
  "/privacy-policy/": "/p/privacy-policy.html",
  "/terms/": "/p/terms-of-service.html",
  "/dmca/": "/p/dmca-copyright.html",
  "/editorial-team/": "/p/editorial-team.html",
};

function rewriteLinks(html) {
  return html.replace(/(href|action)="(\/[^"]*)"/g, (m, attr, url) => {
    let m2;
    if ((m2 = url.match(/^\/blog\/([^/]+)\/$/))) return `${attr}="/${m2[1]}.html`;
    if ((m2 = url.match(/^\/blog\/page\/\d+\/$/))) return `${attr}="/"`;
    if (LINK_MAP[url]) return `${attr}="${LINK_MAP[url]}"`;
    return m;
  });
}

/* ------------------------------------------------------------------ */
/* Body assembly                                                       */
/* ------------------------------------------------------------------ */

function assemblePostBody(p) {
  const bodyHtml = rewriteLinks(withHeadingIds(p.body));
  const toc = buildToc(bodyHtml);

  const initials = p.author
    .split(" ")
    .map((n) => n[0])
    .join("");

  const faqHtml =
    p.faq && p.faq.length
      ? `<section class="related" aria-labelledby="faq-h">
        <h2 id="faq-h">Frequently asked questions</h2>
        <div class="prose">
          ${p.faq
            .map(
              (f) => `<div class="callout callout-info">
            <div class="callout-title">${esc(f.q)}</div>
            <p>${esc(f.a)}</p>
          </div>`
            )
            .join("\n          ")}
        </div>
      </section>`
      : "";

  return `${toc}
<div class="prose" data-toc-source>
  <p class="lead">${esc(p.description)}</p>
  ${bodyHtml}
</div>

<div class="author-box">
  <span class="avatar" aria-hidden="true">${esc(initials)}</span>
  <div>
    <h3>${esc(p.author)}</h3>
    <p>Contributing editor at AI Tool Scout. Writes about AI tools, workflow
    automation and getting useful output from language models — grounded in
    published documentation and independent evidence rather than vendor marketing.</p>
  </div>
</div>

${faqHtml}`;
}

function assemblePageBody(p) {
  return `<p class="lead">${esc(p.lead)}</p>
${rewriteLinks(p.body)}`;
}

/* ------------------------------------------------------------------ */
/* Atom entries                                                        */
/* ------------------------------------------------------------------ */

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

const PAGE_DATES = {
  "/about/": ["2026-09-16T09:00:00-07:00", "2026-09-20T09:00:00-07:00"],
  "/contact/": ["2026-09-16T09:00:00-07:00", "2026-09-20T09:00:00-07:00"],
  "/privacy-policy/": ["2026-09-17T09:00:00-07:00", "2026-09-22T09:00:00-07:00"],
  "/terms/": ["2026-09-17T09:00:00-07:00", "2026-09-22T09:00:00-07:00"],
};

function main() {
  let num = 910000001;
  const entries = [];

  posts.forEach((p) => {
    const published = `${p.date}T09:00:00-07:00`;
    const updated = `${p.updated}T09:00:00-07:00`;
    entries.push(
      entry({
        kind: "POST",
        labels: [p.category],
        title: p.title,
        url: `${BASE}/${p.slug}.html`,
        body: assemblePostBody(p),
        published,
        updated,
        num: num++,
      })
    );
  });

  pages.forEach((p) => {
    const slug = p.path.replace(/^\//, "").replace(/\/$/, "");
    const [published, updated] = PAGE_DATES[p.path] || [
      "2026-09-16T09:00:00-07:00",
      "2026-09-20T09:00:00-07:00",
    ];
    entries.push(
      entry({
        kind: "PAGE",
        labels: [],
        title: p.title,
        url: `${BASE}/p/${slug}.html`,
        body: assemblePageBody(p),
        published,
        updated,
        num: num++,
      })
    );
  });

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

  const out = path.join(__dirname, "import.xml");
  fs.writeFileSync(out, xml, "utf8");

  const kb = (Buffer.byteLength(xml, "utf8") / 1024).toFixed(1);
  console.log(`✓ ${out}`);
  console.log(`  ${posts.length} posts + ${pages.length} pages · ${kb} KB`);
  posts.forEach((p) => console.log(`  · /${p.slug}.html  «${p.title}»`));
  pages.forEach((p) =>
    console.log(
      `  · /p/${p.path.replace(/^\//, "").replace(/\/$/, "")}.html  «${p.title}»`
    )
  );
}

module.exports = { assemblePostBody, assemblePageBody };

if (require.main === module) main();
