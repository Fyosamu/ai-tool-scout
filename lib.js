"use strict";
const config = require("./config");

/** Escape text for HTML body/attribute contexts. */
function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escape a string inside a JSON-LD <script> block. */
function jsonld(obj) {
  return JSON.stringify(obj, null, 0).replace(/</g, "\\u003c");
}

function absolute(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return config.SITE_URL.replace(/\/$/, "") + (path.startsWith("/") ? path : "/" + path);
}

function navHtml(currentPath) {
  return config.NAV.map((item) => {
    const active =
      item.href === "/"
        ? currentPath === "/"
        : currentPath.startsWith(item.href.replace(/\/$/, ""));
    return `<li><a href="${item.href}"${active ? ' aria-current="page"' : ""}>${esc(
      item.label
    )}</a></li>`;
  }).join("\n            ");
}

function footerHtml() {
  return config.FOOTER_LINKS.map(
    (l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`
  ).join("\n            ");
}

/**
 * Build <head> metadata: SEO, Open Graph, Twitter, canonical, hreflang,
 * RSS, robots and the WebSite + WebPage/Article JSON-LD graph.
 */
function head(page) {
  const url = absolute(page.path || "/");
  const title = page.noindex ? page.title : `${page.title} | ${config.SITE_NAME}`;
  const desc = page.description || config.TAGLINE;
  const type = page.type || "website";
  const image = absolute(page.image || "/og-default.png");
  const keywords =
    page.keywords && page.keywords.length
      ? `\n  <meta name="keywords" content="${esc(page.keywords.join(", "))}">`
      : "";

  const robots = page.noindex
    ? `<meta name="robots" content="noindex, nofollow">`
    : `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="googlebot" content="index, follow">`;

  // ---- JSON-LD graph -------------------------------------------------
  const graph = [];

  graph.push({
    "@type": "WebSite",
    "@id": absolute("/") + "#website",
    url: absolute("/"),
    name: config.SITE_NAME,
    description: config.TAGLINE,
    inLanguage: config.LANGUAGE,
    publisher: { "@id": absolute("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absolute("/blog/?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  });

  graph.push({
    "@type": "Organization",
    "@id": absolute("/#organization"),
    name: config.SITE_NAME,
    url: absolute("/"),
    logo: { "@type": "ImageObject", url: absolute("/logo.png"), width: 512, height: 512 },
    sameAs: [config.AUTHOR.url],
  });

  if (type === "Article" || type === "BlogPosting") {
    graph.push({
      "@type": type === "Article" ? "Article" : "BlogPosting",
      "@id": url + "#article",
      headline: page.title,
      description: desc,
      image: [image],
      datePublished: page.datePublished || undefined,
      dateModified: page.dateModified || page.datePublished || undefined,
      inLanguage: config.LANGUAGE,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@id": absolute("/#organization") },
      publisher: { "@id": absolute("/organization") },
      keywords: (page.keywords || []).join(", "),
    });
  } else {
    graph.push({
      "@type": "WebPage",
      "@id": url + "#webpage",
      name: title,
      description: desc,
      url,
      inLanguage: config.LANGUAGE,
      isPartOf: { "@id": absolute("/#website") },
    });
  }

  if (Array.isArray(page.breadcrumbs) && page.breadcrumbs.length) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: page.breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.label,
        item: absolute(b.href),
      })),
    });
  }

  if (Array.isArray(page.faq) && page.faq.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: page.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  if (page.aggregateRating) {
    graph.push({
      "@type": "SoftwareApplication",
      name: page.title,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: page.aggregateRating.value,
        ratingCount: page.aggregateRating.count,
        bestRating: "5",
      },
    });
  }

  const hreflangs =
    config.ALTERNATES &&
    config.ALTERNATES.map(
      (a) =>
        `  <link rel="alternate" hreflang="${a.lang}" href="${absolute(a.href)}">`
    ).join("\n") || "";

  return `<!DOCTYPE html>
<html lang="${config.LANGUAGE}" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">${keywords}
  <meta name="author" content="${esc(config.AUTHOR.name)}">
  ${robots}
  <meta name="theme-color" content="${config.THEME_COLOR}">
  <link rel="canonical" href="${url}">
${hreflangs ? hreflangs + "\n" : ""}
  <!-- Open Graph -->
  <meta property="og:type" content="${type === "Article" || type === "BlogPosting" ? "article" : "website"}">
  <meta property="og:site_name" content="${esc(config.SITE_NAME)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(page.title)}">
  <meta property="og:locale" content="${config.LOCALE}">
  ${page.datePublished ? `<meta property="article:published_time" content="${page.datePublished}">
  <meta property="article:modified_time" content="${page.dateModified || page.datePublished}">` : ""}
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${esc(page.title)}">
  <!-- Feeds & verification hooks -->
  <link rel="alternate" type="application/rss+xml" title="${esc(config.SITE_NAME)} RSS" href="/rss.xml">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta name="google-site-verification" content="REPLACE_WITH_GSC_TOKEN">
  <meta name="msvalidate.01" content="REPLACE_WITH_BING_TOKEN">
  <!-- Performance: preload critical assets -->
  <link rel="preload" href="/assets/css/site.css" as="style">
  <link rel="preload" href="/assets/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
  <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script type="application/ld+json">${jsonld({ "@context": "https://schema.org", "@graph": graph })}</script>
  ${config.ADSENSE_ENABLED ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.ADSENSE_CLIENT}" crossorigin="anonymous"></script>` : ""}
</head>`;
}

/** Skip-link + sticky header with primary navigation. */
function header(page) {
  return `<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" id="site-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="${esc(config.SITE_NAME)} home">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
            <path d="M16 2 4 9v14l12 7 12-7V9L16 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="m11 16 3.5 3.5L21 13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="brand-text">${esc(config.SITE_NAME)}</span>
      </a>

      <nav class="primary-nav" id="primary-nav" aria-label="Primary">
        <ul>
            ${navHtml(page.path || "/")}
        </ul>
      </nav>

      <div class="header-actions">
        <a class="btn btn-primary btn-sm" href="/blog/">Read the blog</a>
        <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Toggle navigation">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>
  <main id="main">`;
}

function footer(page) {
  const year = new Date().getFullYear();
  return `</main>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/">
            <span class="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="24" height="24" fill="none" aria-hidden="true">
                <path d="M16 2 4 9v14l12 7 12-7V9L16 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="m11 16 3.5 3.5L21 13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="brand-text">${esc(config.SITE_NAME)}</span>
          </a>
          <p>${esc(config.TAGLINE)}. Independent reviews, honest comparisons and step-by-step guides.</p>
        </div>

        <nav class="footer-col" aria-label="Site">
          <h2>Site</h2>
          <ul>
            <li><a href="/blog/">Blog</a></li>
            <li><a href="/guides/">Guides</a></li>
            <li><a href="/about/">About</a></li>
            <li><a href="/contact/">Contact</a></li>
          </ul>
        </nav>

        <nav class="footer-col" aria-label="Legal">
          <h2>Legal</h2>
          <ul>
            ${footerHtml()}
          </ul>
        </nav>
      </div>

      <div class="footer-bottom">
        <p>&copy; ${year} ${esc(config.SITE_NAME)}. All rights reserved.</p>
        <p class="muted">We may earn a commission through affiliate links at no extra cost to you.</p>
      </div>
    </div>
  </footer>

  <script src="/assets/js/site.js" defer></script>
  ${config.GA_MEASUREMENT_ID ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${config.GA_MEASUREMENT_ID}"></script>` : ""}
</body>
</html>`;
}

/** Full document for a page. */
function document_(page, body) {
  return head(page) + header(page) + body + footer(page);
}

module.exports = { esc, jsonld, absolute, document_, head, header, footer };
