"use strict";
/**
 * Static site generator for AI Tool Scout.
 * Zero dependencies — runs on plain Node 18+.
 *
 * Outputs fully static HTML to /dist, ready for Cloudflare Pages,
 * GitHub Pages, Netlify or any web server.
 */
const fs = require("fs");
const path = require("path");
const config = require("./config");
const { esc, absolute, document_ } = require("./lib");

const posts = [
  ...require("./src/posts-1"),
  ...require("./src/posts-2"),
  ...require("./src/posts-3"),
];
const pages = require("./src/pages");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const PUBLIC = path.join(ROOT, "public");

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Write a file, creating parent directories. */
function write(rel, content) {
  const target = path.join(DIST, rel);
  mkdirp(path.dirname(target));
  fs.writeFileSync(target, content, "utf8");
  return target;
}

/** Recursively copy the /public folder into /dist. */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  mkdirp(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function escXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Estimate word count of a body HTML string. */
function wordCount(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
}

/**
 * Reading time derived from the real word count (average 225 wpm),
 * so it can never drift out of sync with the article body.
 */
function readTime(post) {
  return Math.max(1, Math.round(wordCount(post.body) / 225));
}

/** Add stable ids to every <h2> so TOC anchors work without JavaScript. */
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

/* ------------------------------------------------------------------ */
/* Reusable blocks                                                     */
/* ------------------------------------------------------------------ */

function postCard(p) {
  const href = `/blog/${p.slug}/`;
  return `
      <article class="post-card reveal">
        <a href="${href}" class="post-thumb" style="background:${p.gradient}" aria-hidden="true" tabindex="-1">
          <span>${esc(p.badge)}</span>
        </a>
        <div class="post-body">
          <div class="post-meta">
            <span class="tag">${esc(p.category)}</span>
            <span>${fmtDate(p.date)}</span>
            <span aria-hidden="true">•</span>
            <span>${readTime(p)} min read</span>
          </div>
          <h3><a href="${href}">${esc(p.title)}</a></h3>
          <p>${esc(p.excerpt)}</p>
          <a class="card-link" href="${href}">Read the guide</a>
        </div>
      </article>`;
}

function relatedCard(p) {
  const href = `/blog/${p.slug}/`;
  return `
          <article class="post-card">
            <a href="${href}" class="post-thumb" style="background:${p.gradient}" aria-hidden="true" tabindex="-1">
              <span>${esc(p.badge)}</span>
            </a>
            <div class="post-body">
              <div class="post-meta">
                <span class="tag">${esc(p.category)}</span>
                <span>${readTime(p)} min read</span>
              </div>
              <h3><a href="${href}">${esc(p.title)}</a></h3>
            </div>
          </article>`;
}

/** Ad slot placeholder — reserved height so CLS stays at zero. */
function adSlot(label) {
  return `<aside class="ad-slot" aria-label="Advertisement">
    <span class="ad-label">${esc(label || "Advertisement")}</span>
  </aside>`;
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

function renderHome() {
  const featured = posts.slice(0, 6);

  const body = `
  <section class="hero">
    <div class="container">
      <div class="hero-grid">
        <div>
          <div class="hero-badges">
            <span class="pill"><span class="dot" aria-hidden="true"></span> Updated weekly</span>
            <span class="pill">Independent &amp; unsponsored</span>
            <span class="pill">Tested with real work</span>
          </div>

          <h1>Find the right <span class="grad">AI tool</span> in minutes, not weeks.</h1>

          <p class="lead">
            We spend weeks testing AI writing tools, assistants, image generators and
            automation platforms so you don't have to. Honest comparisons, real benchmarks,
            and clear verdicts — no vendor input, no bought rankings.
          </p>

          <div class="btn-group">
            <a class="btn btn-primary btn-lg" href="/blog/">Browse all reviews</a>
            <a class="btn btn-ghost btn-lg" href="/guides/">Read the guides</a>
          </div>

          <div class="hero-stats">
            <div class="stat"><strong>140+</strong><span>Tools tested</span></div>
            <div class="stat"><strong>2,400+</strong><span>Benchmarks run</span></div>
            <div class="stat"><strong>60k</strong><span>Monthly readers</span></div>
          </div>
        </div>

        <div class="hero-card" aria-hidden="true">
          <div class="hero-card-head">
            <i></i><i></i><i></i>
            <span>latest-test.results</span>
          </div>

          <div class="mini-tool">
            <div class="ico" style="background:linear-gradient(135deg,#4f8cff,#22d3ee)">JP</div>
            <div class="meta">
              <strong>Jasper</strong>
              <span>Marketing &amp; brand voice</span>
              <div class="bar"><i style="width:94%"></i></div>
            </div>
            <div class="score">4.7</div>
          </div>

          <div class="mini-tool">
            <div class="ico" style="background:linear-gradient(135deg,#a78bfa,#22d3ee)">CL</div>
            <div class="meta">
              <strong>Claude</strong>
              <span>Long-form writing</span>
              <div class="bar"><i style="width:92%"></i></div>
            </div>
            <div class="score">4.6</div>
          </div>

          <div class="mini-tool">
            <div class="ico" style="background:linear-gradient(135deg,#34d399,#4f8cff)">CP</div>
            <div class="meta">
              <strong>Copy.ai</strong>
              <span>Content workflows</span>
              <div class="bar"><i style="width:90%"></i></div>
            </div>
            <div class="score">4.5</div>
          </div>

          <div class="mini-tool">
            <div class="ico" style="background:linear-gradient(135deg,#fbbf24,#f87171)">RY</div>
            <div class="meta">
              <strong>Rytr</strong>
              <span>Short copy on a budget</span>
              <div class="bar"><i style="width:80%"></i></div>
            </div>
            <div class="score">4.0</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  ${adSlot()}

  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Latest</span>
        <h2>Fresh reviews and guides</h2>
        <p>Every article is based on hands-on testing, not press releases.</p>
      </div>

      <div class="grid grid-3">
        ${featured.map(postCard).join("\n")}
      </div>

      <div class="btn-group mt-3" style="justify-content:center">
        <a class="btn btn-ghost" href="/blog/">View all articles</a>
      </div>
    </div>
  </section>

  <section class="section-tight">
    <div class="container">
      <div class="grid grid-4">
        <div class="card reveal">
          <div class="card-icon" aria-hidden="true">◎</div>
          <h3>Real-world testing</h3>
          <p>Identical briefs, blind scoring and timed editing — so scores reflect actual work, not feature checklists.</p>
        </div>
        <div class="card reveal">
          <div class="card-icon" aria-hidden="true">◇</div>
          <h3>Vendor-independent</h3>
          <p>Nobody pays for a score or a ranking. Affiliate links never change what we conclude.</p>
        </div>
        <div class="card reveal">
          <div class="card-icon" aria-hidden="true">◈</div>
          <h3>Kept up to date</h3>
          <p>AI products ship monthly. We re-test after major releases and date every update.</p>
        </div>
        <div class="card reveal">
          <div class="card-icon" aria-hidden="true">◐</div>
          <h3>Plain language</h3>
          <p>No benchmark soup. We tell you which tool to pick, and exactly where each one falls short.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="cta-band reveal">
        <h2>Not sure where to start?</h2>
        <p>
          Read our framework for writing prompts that actually work, or start with the
          free stack that covers a complete content workflow at $0 per month.
        </p>
        <div class="btn-group">
          <a class="btn btn-primary" href="/blog/how-to-write-better-prompts/">Prompting framework</a>
          <a class="btn btn-ghost" href="/blog/free-ai-tools-worth-using/">Free tools stack</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section-tight">
    <div class="container narrow text-center">
      <span class="eyebrow">Newsletter</span>
      <h2>One useful email a week</h2>
      <p class="lead">New tests, pricing changes and the occasional tool we wish we'd found sooner. No spam, unsubscribe in one click.</p>
      <form class="newsletter" data-demo-form style="justify-content:center;margin-inline:auto" action="#" method="post">
        <label class="sr-only" for="nl-email">Email address</label>
        <input type="email" id="nl-email" name="email" placeholder="you@example.com" required>
        <button type="submit" class="btn btn-primary">Subscribe</button>
      </form>
      <p class="form-note mt-2" data-form-note hidden>Thanks! Connect a newsletter provider to activate this form.</p>
    </div>
  </section>`;

  return document_(
    {
      path: "/",
      title: "AI Tool Scout — Honest AI Tool Reviews, Comparisons and Guides",
      description:
        "Independent reviews and comparisons of AI writing tools, assistants, image generators and automation platforms. Tested with real work, ranked honestly, updated weekly.",
      keywords: [
        "AI tools",
        "AI tool reviews",
        "best AI writing tools",
        "AI comparisons",
        "ChatGPT vs Claude",
        "AI guides",
      ],
      image: "/og-default.png",
    },
    body
  );
}

function renderBlogIndex(pageNum, totalPages, items) {
  const body = `
  <section class="page-head">
    <div class="container">
      <nav aria-label="Breadcrumb">
        <ol class="breadcrumb">
          <li><a href="/">Home</a></li>
          <li aria-current="page">Blog</li>
        </ol>
      </nav>
      <span class="eyebrow">Blog</span>
      <h1>Reviews, comparisons &amp; guides</h1>
      <p>Everything we publish is based on hands-on testing. ${posts.length} articles and counting — sorted newest first.</p>
    </div>
  </section>

  ${adSlot()}

  <section class="section-tight">
    <div class="container">
      <h2 class="sr-only">All articles</h2>
      <div class="grid grid-3">
        ${items.map(postCard).join("\n")}
      </div>

      ${
        totalPages > 1
          ? `<nav aria-label="Pagination" class="pagination">
        ${
          pageNum > 1
            ? `<a href="${pageNum === 2 ? "/blog/" : "/blog/page/" + (pageNum - 1) + "/"}">← Prev</a>`
            : ""
        }
        ${Array.from({ length: totalPages }, (_, i) => {
          const n = i + 1;
          const href = n === 1 ? "/blog/" : `/blog/page/${n}/`;
          return n === pageNum
            ? `<span class="current" aria-current="page">${n}</span>`
            : `<a href="${href}">${n}</a>`;
        }).join("\n        ")}
        ${pageNum < totalPages ? `<a href="/blog/page/${pageNum + 1}/">Next →</a>` : ""}
      </nav>`
          : ""
      }
    </div>
  </section>`;

  return document_(
    {
      path: pageNum === 1 ? "/blog/" : `/blog/page/${pageNum}/`,
      title: pageNum === 1 ? "Blog" : `Blog — Page ${pageNum}`,
      description:
        "Latest AI tool reviews, head-to-head comparisons and practical guides from the AI Tool Scout editorial team.",
      keywords: ["AI tool blog", "AI reviews", "AI comparisons"],
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog/" },
      ],
      noindex: pageNum > 1,
    },
    body
  );
}

function renderGuides() {
  const guides = posts.filter(
    (p) => p.category === "Guides" || p.category === "Roundups"
  );

  const body = `
  <section class="page-head">
    <div class="container">
      <nav aria-label="Breadcrumb">
        <ol class="breadcrumb">
          <li><a href="/">Home</a></li>
          <li aria-current="page">Guides</li>
        </ol>
      </nav>
      <span class="eyebrow">Guides</span>
      <h1>Practical guides you can act on today</h1>
      <p>Step-by-step walkthroughs for prompting, automation and building a working AI stack — written for people who need results, not theory.</p>
    </div>
  </section>

  <section class="section-tight">
    <div class="container">
      <h2 class="sr-only">All guides</h2>
      <div class="grid grid-3">
        ${guides.map(postCard).join("\n")}
      </div>
    </div>
  </section>

  <section class="section-tight">
    <div class="container">
      <div class="cta-band reveal">
        <h2>Looking for comparisons instead?</h2>
        <p>Head-to-head tests of the tools themselves, with pricing, benchmarks and verdicts.</p>
        <div class="btn-group">
          <a class="btn btn-primary" href="/blog/">Browse all reviews</a>
        </div>
      </div>
    </div>
  </section>`;

  return document_(
    {
      path: "/guides/",
      title: "AI Guides & Tutorials",
      description:
        "Practical, step-by-step AI guides: prompt engineering frameworks, no-code automation walkthroughs and free tool stacks.",
      keywords: ["AI guides", "AI tutorials", "prompt engineering", "AI automation"],
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Guides", href: "/guides/" },
      ],
    },
    body
  );
}

/** Build a table of contents from a post's <h2> headings. */
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

function renderPost(p) {
  const words = wordCount(p.body);
  const related = posts.filter((x) => x.slug !== p.slug).slice(0, 3);
  const bodyHtml = withHeadingIds(p.body);
  const toc = buildToc(bodyHtml);

  const faqHtml =
    p.faq && p.faq.length
      ? `<section class="related" aria-labelledby="faq-h">
        <h2 id="faq-h">Frequently asked questions</h2>
        <div class="prose">
          ${p.faq
            .map(
              (f) => `<details class="callout callout-info">
            <summary class="callout-title">${esc(f.q)}</summary>
            <p>${esc(f.a)}</p>
          </details>`
            )
            .join("\n          ")}
        </div>
      </section>`
      : "";

  const body = `
  <article>
    <header class="article-header">
      <div class="container narrow">
        <nav aria-label="Breadcrumb">
          <ol class="breadcrumb">
            <li><a href="/">Home</a></li>
            <li><a href="/blog/">Blog</a></li>
            <li aria-current="page">${esc(p.category)}</li>
          </ol>
        </nav>

        <span class="tag">${esc(p.category)}</span>
        <h1 style="margin-top:14px">${esc(p.title)}</h1>
        <p class="lead">${esc(p.description)}</p>

        <div class="article-meta">
          <span class="avatar" aria-hidden="true">${esc(
            p.author.split(" ").map((n) => n[0]).join("")
          )}</span>
          <span>By <strong>${esc(p.author)}</strong></span>
          <span aria-hidden="true">•</span>
          <time datetime="${p.date}">Published ${fmtDate(p.date)}</time>
          <span aria-hidden="true">•</span>
          <time datetime="${p.updated}">Updated ${fmtDate(p.updated)}</time>
          <span aria-hidden="true">•</span>
          <span>${readTime(p)} min read</span>
          <span aria-hidden="true">•</span>
          <span>${words.toLocaleString("en-US")} words</span>
        </div>
      </div>
    </header>

    <div class="container narrow">
      ${adSlot("Advertisement")}

      ${toc}

      <div class="prose" data-toc-source>
        ${bodyHtml}
      </div>

      ${adSlot("Advertisement")}

      <div class="author-box">
        <span class="avatar" aria-hidden="true">${esc(
          p.author.split(" ").map((n) => n[0]).join("")
        )}</span>
        <div>
          <h3>${esc(p.author)}</h3>
          <p>Contributing editor at AI Tool Scout. Writes about AI tools, workflow
          automation and getting useful output from language models — based on hands-on
          testing rather than vendor documentation.</p>
        </div>
      </div>

      ${faqHtml}

      <section class="related" aria-labelledby="related-h">
        <h2 id="related-h">Related articles</h2>
        <div class="grid grid-3">
          ${related.map(relatedCard).join("\n")}
        </div>
      </section>
    </div>
  </article>`;

  return document_(
    {
      path: `/blog/${p.slug}/`,
      title: p.title,
      description: p.description,
      keywords: p.keywords,
      type: "Article",
      image: "/og-default.png",
      datePublished: p.date,
      dateModified: p.updated,
      faq: p.faq,
      aggregateRating: p.rating
        ? { value: p.rating.value, count: p.rating.count }
        : null,
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog/" },
        { label: p.title, href: `/blog/${p.slug}/` },
      ],
    },
    body
  );
}

function render404() {
  const body = `
  <section class="section" style="min-height:52vh;display:grid;place-items:center">
    <div class="container narrow text-center">
      <span class="eyebrow">Error 404</span>
      <h1>This page doesn't exist</h1>
      <p class="lead">The link may be broken, or the page may have moved. Try one of these instead.</p>
      <div class="btn-group" style="justify-content:center">
        <a class="btn btn-primary" href="/">Back to home</a>
        <a class="btn btn-ghost" href="/blog/">Browse the blog</a>
      </div>
    </div>
  </section>`;

  return document_(
    {
      path: "/404.html",
      title: "Page Not Found",
      description: "The page you are looking for could not be found.",
      noindex: true,
    },
    body
  );
}

function renderStaticPage(p) {
  const body = `
  <section class="page-head">
    <div class="container narrow">
      <nav aria-label="Breadcrumb">
        <ol class="breadcrumb">
          <li><a href="/">Home</a></li>
          <li aria-current="page">${esc(p.nav)}</li>
        </ol>
      </nav>
      <span class="eyebrow">${esc(p.nav)}</span>
      <h1>${esc(p.hero)}</h1>
      <p>${esc(p.lead)}</p>
    </div>
  </section>

  <section class="section-tight">
    <div class="container narrow">
      ${p.body}
    </div>
  </section>`;

  return document_(
    {
      path: p.path,
      title: p.title,
      description: p.description,
      keywords: [p.nav, config.SITE_NAME],
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: p.nav, href: p.path },
      ],
    },
    body
  );
}

/* ------------------------------------------------------------------ */
/* SEO artefacts                                                       */
/* ------------------------------------------------------------------ */

function buildSitemap(urls) {
  const body = urls
    .map((u) => {
      const last = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : "";
      const freq = u.changefreq || "monthly";
      const pri = u.priority != null ? u.priority : "0.7";
      return `  <url>
    <loc>${escXml(u.loc)}</loc>${last}
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>
  </url>`;
    })
    .join("\n");

  write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
  );
}

function buildSitemapIndex() {
  write(
    "sitemap-index.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${escXml(absolute("/sitemap.xml"))}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </sitemap>
</sitemapindex>
`
  );
}

function buildRobots() {
  write(
    "robots.txt",
    `# AI Tool Scout
User-agent: *
Allow: /

# Ads crawlers
User-agent: Mediapartners-Google
Disallow:

User-agent: AdsBot-Google
Allow: /

# Crawl budget protection
Disallow: /404.html
Disallow: /page/

Sitemap: ${absolute("/sitemap.xml")}
`
  );
}

function buildRSS() {
  const items = posts
    .slice(0, 20)
    .map((p) => {
      const link = absolute(`/blog/${p.slug}/`);
      return `    <item>
      <title>${escXml(p.title)}</title>
      <link>${escXml(link)}</link>
      <guid isPermaLink="true">${escXml(link)}</guid>
      <description>${escXml(p.description)}</description>
      <pubDate>${new Date(p.date + "T09:00:00Z").toUTCString()}</pubDate>
      <category>${escXml(p.category)}</category>
    </item>`;
    })
    .join("\n");

  write(
    "rss.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escXml(config.SITE_NAME)}</title>
    <link>${escXml(absolute("/"))}</link>
    <atom:link href="${escXml(absolute("/rss.xml"))}" rel="self" type="application/rss+xml"/>
    <description>${escXml(config.TAGLINE)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`
  );
}

function buildSecurityTxt() {
  write(
    ".well-known/security.txt",
    `Contact: mailto:security@aitoolscout.com
Expires: ${new Date(Date.now() + 31536000000).toISOString()}
Policy: ${absolute("/privacy-policy/")}
Preferred-Languages: en
`
  );
}

function buildHumansTxt() {
  write(
    "humans.txt",
    `/* TEAM */
Editor: AI Tool Scout Editorial
Contact: hello@aitoolscout.com
Location: Worldwide

/* SITE */
Language: en
Doctype: HTML5
Components: Vanilla JS, no framework
Host: Cloudflare Pages
`
  );
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

function main() {
  const started = Date.now();
  console.log("▸ Building AI Tool Scout…");

  rmrf(DIST);
  mkdirp(DIST);

  // 1. Static assets
  copyDir(PUBLIC, DIST);

  // 2. Home
  write("index.html", renderHome());

  // 3. Blog index + pagination
  const PER_PAGE = 9;
  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE));

  for (let page = 1; page <= totalPages; page++) {
    const items = posts.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const html = renderBlogIndex(page, totalPages, items);
    if (page === 1) write("blog/index.html", html);
    else write(`blog/page/${page}/index.html`, html);
  }

  // 4. Guides
  write("guides/index.html", renderGuides());

  // 5. Articles
  posts.forEach((p) => write(`blog/${p.slug}/index.html`, renderPost(p)));

  // 6. Static pages
  pages.forEach((p) => write(`${p.path.replace(/^\//, "")}index.html`, renderStaticPage(p)));

  // 7. 404
  write("404.html", render404());

  // 8. SEO artefacts
  const urls = [
    { loc: absolute("/"), changefreq: "weekly", priority: "1.0" },
    { loc: absolute("/blog/"), changefreq: "daily", priority: "0.9" },
    { loc: absolute("/guides/"), changefreq: "weekly", priority: "0.8" },
    ...posts.map((p) => ({
      loc: absolute(`/blog/${p.slug}/`),
      lastmod: p.updated,
      changefreq: "monthly",
      priority: "0.8",
    })),
    ...pages.map((p) => ({
      loc: absolute(p.path),
      changefreq: "yearly",
      priority: "0.5",
    })),
  ];

  buildSitemap(urls);
  buildSitemapIndex();
  buildRobots();
  buildRSS();
  buildSecurityTxt();
  buildHumansTxt();

  // 9. AdSense ads.txt placeholder (only meaningful once a client id exists)
  if (config.ADSENSE_ENABLED) {
    write("ads.txt", `google.com, ${config.ADSENSE_CLIENT}, DIRECT, f08c47fec0942fa0\n`);
  }

  // 10. Report
  const files = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else files.push(full);
    }
  })(DIST);

  const bytes = files.reduce((sum, f) => sum + fs.statSync(f).size, 0);
  const ms = Date.now() - started;

  console.log(`  ✓ ${files.length} files · ${(bytes / 1024).toFixed(1)} KB · ${ms} ms`);
  console.log(`  ✓ ${posts.length} articles · ${pages.length} static pages`);
  console.log(`  ✓ Site URL: ${config.SITE_URL}`);
  console.log("▸ Done. Output in /dist");
}

main();
