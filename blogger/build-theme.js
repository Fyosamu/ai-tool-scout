"use strict";
/**
 * Generates blogger/theme.xml — a complete Blogger theme that mirrors the
 * AI Tool Scout design system:
 *
 *   - full site.css embedded in <b:skin> (self-hosted font swapped for
 *     Google Fonts, since Blogger cannot host our /assets folder)
 *   - site.js inlined at the end of <body> (nav, sticky header, reveal,
 *     code-copy, form fallback)
 *   - homepage hero + latest-articles grid
 *   - custom Blog1 widget: article view / static page view / index cards
 *   - JSON-LD: static WebSite + Organization in <head>, per-post
 *     BlogPosting + BreadcrumbList on item pages (post data is only
 *     available inside the widget loop)
 *   - empty ad sections (adtop / adbottom) ready for Adsterra gadgets
 *
 * Zero dependencies. Run: node blogger/build-theme.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE = "https://scoutaitools.blogspot.com";
const SITE_NAME = "AI Tool Scout";

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

/* ------------------------------------------------------------------ */
/* CSS                                                                 */
/* ------------------------------------------------------------------ */

let css = read("public/assets/css/site.css");

// Blogger cannot serve our /assets/fonts — use the Google Fonts link in
// <head> instead, so drop the @font-face block (its relative URL 404s).
css = css.replace(/@font-face\s*\{[^}]*\}\s*/g, "");

css += `
/* ---- Blogger-specific adjustments ---- */
.widget { margin: 0; }
.ad-zone { margin: 0 auto; max-width: 1180px; padding: 12px 20px; text-align: center; }
.ad-zone:not(:empty) { padding-top: 22px; padding-bottom: 6px; }
h1.post-title { margin-top: 14px; }
main#main { min-height: 50vh; }
.post-card .card-link { margin-top: 14px; }
.section-tight#latest { padding-top: 4px; }
.article-header .breadcrumb { margin-bottom: 8px; }
.post-card .post-body { justify-content: flex-start; }
`;

if (css.indexOf("]]>") !== -1) css = css.split("]]>").join("]] >");

/* ------------------------------------------------------------------ */
/* JS                                                                  */
/* ------------------------------------------------------------------ */

const js = read("public/assets/js/site.js");
if (js.indexOf("]]>") !== -1) {
  throw new Error("site.js contains ]]>, cannot embed inside CDATA");
}

/* ------------------------------------------------------------------ */
/* GA4 + consent mode (LAUNCH.md §4)                                   */
/* ------------------------------------------------------------------ */

const GA_ID = "G-ZTQGKRPVYN";

/**
 * Consent Mode v2. Google wants the four signals defaulted to `denied`
 * BEFORE any ad code exists, and promoted to `granted` only after the
 * visitor accepts. Observed behaviour on the live theme:
 *
 *   accepted    -> consent update 'granted', gtag.js loads
 *   declined    -> gtag.js never loads, signals stay denied
 *   undecided   -> gtag.js loads but every signal stays denied
 *                  (cookieless pings only, banner still up)
 *
 * `__gtagLoad` / `__gtagConsent` are the names the banner and the footer
 * "Cookie settings" link call, so keep them when reconciling with an export.
 */
const ga = `<script type='text/javascript'>
  //<![CDATA[
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.__GA_ID = '${GA_ID}';
  window.__gtagLoad = function(){
    if (window.__gtagLoaded) return;
    window.__gtagLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + window.__GA_ID;
    document.head.appendChild(s);
  };
  window.__gtagConsent = function(state){
    var v = state === 'granted' ? 'granted' : 'denied';
    gtag('consent', 'update', {
      ad_storage: v, ad_user_data: v,
      ad_personalization: v, analytics_storage: v
    });
    if (v === 'granted') window.__gtagLoad();
  };
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });
  (function(){
    var stored = null;
    try { stored = localStorage.getItem('aits_cookie_consent'); } catch (e) {}
    if (stored === 'granted') window.__gtagConsent('granted');
    if (stored !== 'denied') window.__gtagLoad();
    gtag('js', new Date());
    gtag('config', window.__GA_ID, { anonymize_ip: true });
  })();
  //]]>
</script>`;

/**
 * Cookie bar. Self-contained inline styling: it has to render even though
 * the CSS is owned by the export we have not reconciled yet (THEME_FIX.md).
 */
const cookieBar = `  <div id='aits-cookie-bar' role='region' aria-label='Cookie consent' hidden='hidden'
       style='position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#0b1220;border-top:1px solid #243044;padding:14px 18px;font-size:14px;line-height:1.5;color:#dbe4f3'>
    <div style='max-width:1120px;margin:0 auto;display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:space-between'>
      <p style='margin:0;flex:1 1 420px'>We use cookies to measure traffic and, if you allow it, to show advertising. See our <a href='/p/privacy-policy.html' style='color:#4f8cff'>Privacy Policy</a>.</p>
      <div style='display:flex;gap:10px;flex:0 0 auto'>
        <button type='button' id='aits-cookie-decline' style='background:transparent;color:#dbe4f3;border:1px solid #3a4a66;border-radius:8px;padding:9px 18px;font:inherit;cursor:pointer'>Decline</button>
        <button type='button' id='aits-cookie-accept' style='background:#4f8cff;color:#ffffff;border:1px solid #4f8cff;border-radius:8px;padding:9px 18px;font:inherit;cursor:pointer'>Accept</button>
      </div>
    </div>
  </div>
  <script type='text/javascript'>
  //<![CDATA[
  (function(){
    var KEY = 'aits_cookie_consent';
    var bar = document.getElementById('aits-cookie-bar');
    if (!bar) return;
    function read(){ try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function write(v){ try { localStorage.setItem(KEY, v); } catch (e) {} }
    function show(){ bar.hidden = false; }
    function hide(){ bar.hidden = true; }
    if (!read()) show();
    var acc = document.getElementById('aits-cookie-accept');
    var dec = document.getElementById('aits-cookie-decline');
    if (acc) acc.addEventListener('click', function(){ write('granted'); window.__gtagConsent && window.__gtagConsent('granted'); hide(); });
    if (dec) dec.addEventListener('click', function(){ write('denied');  window.__gtagConsent && window.__gtagConsent('denied');  hide(); });
    document.addEventListener('click', function(e){
      var t = e.target;
      if (t && t.closest && t.closest('#aits-cookie-settings')) { e.preventDefault(); show(); }
    });
  })();
  //]]>
</script>
`;

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

const theme = `<?xml version='1.0' encoding='UTF-8'?>
<!DOCTYPE html>
<html lang='en' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta charset='utf-8'/>
  <meta content='width=device-width, initial-scale=1, viewport-fit=cover' name='viewport'/>
  <b:include data='blog' name='all-head-content'/>
  <title><data:blog.pageTitle/></title>
  <b:if cond='data:blog.metaDescription'>
    <meta expr:content='data:blog.metaDescription' name='description'/>
  </b:if>
  <link expr:href='data:blog.url' rel='canonical'/>
  <meta content='website' property='og:type'/>
  <meta content='${SITE_NAME}' property='og:site_name'/>
  <meta expr:content='data:blog.pageTitle' property='og:title'/>
  <b:if cond='data:blog.metaDescription'>
    <meta expr:content='data:blog.metaDescription' property='og:description'/>
  <b:else/>
    <meta content='Find the right AI tool in minutes, not weeks — independent AI tool reviews, comparisons and guides.' property='og:description'/>
  </b:if>
  <meta expr:content='data:blog.url' property='og:url'/>
  <meta content='en_US' property='og:locale'/>
  <meta content='#070b14' name='theme-color'/>
  <!-- Social cards: Twitter/X reads these when og:image is absent. -->
  <meta content='summary' name='twitter:card'/>
  <meta content='AI Tool Scout' name='twitter:site'/>
  <meta expr:content='data:blog.pageTitle' name='twitter:title'/>
  <b:if cond='data:blog.metaDescription'>
    <meta expr:content='data:blog.metaDescription' name='twitter:description'/>
  <b:else/>
    <meta content='Find the right AI tool in minutes, not weeks - independent AI tool reviews, comparisons and guides.' name='twitter:description'/>
  </b:if>
  <!-- Connection hints: fonts + Blogger content are render blockers for LCP. -->
  <link crossorigin='anonymous' href='https://fonts.gstatic.com' rel='preconnect'/>
  <link href='https://www.blogger.com' rel='preconnect'/>
  <link href='https://blogger.googleusercontent.com' rel='preconnect'/>
  <link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap' rel='stylesheet'/>
  <b:skin><![CDATA[${css}]]></b:skin>
  <script type='application/ld+json'>
{"@context":"https://schema.org","@graph":[{"@type":"WebSite","@id":"${BASE}/#website","url":"${BASE}/","name":"${SITE_NAME}","description":"Find the right AI tool in minutes, not weeks","inLanguage":"en","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"${BASE}/search?q={search_term_string}"},"query-input":"required name=search_term_string"}},{"@type":"Organization","@id":"${BASE}/#organization","name":"${SITE_NAME}","url":"${BASE}/","description":"Independent AI tool reviews, comparisons and guides."}]}
  </script>
  <noscript><style>.reveal{opacity:1!important;transform:none!important}</style></noscript>
  ${ga}
</head>
<body>
  <a class='skip-link' href='#main'>Skip to content</a>

  <header class='site-header' id='site-header'>
    <div class='container header-inner'>
      <a class='brand' expr:href='data:blog.homepageUrl' aria-label='AI Tool Scout home'>
        <span class='brand-mark' aria-hidden='true'>
          <svg viewBox='0 0 32 32' width='28' height='28' fill='none' aria-hidden='true'>
            <path d='M16 2 4 9v14l12 7 12-7V9L16 2Z' stroke='currentColor' stroke-width='2' stroke-linejoin='round'/>
            <path d='m11 16 3.5 3.5L21 13' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/>
          </svg>
        </span>
        <span class='brand-text'>${SITE_NAME}</span>
      </a>

      <nav class='primary-nav' id='primary-nav' aria-label='Primary'>
        <ul>
          <li><a expr:href='data:blog.homepageUrl'>Home</a></li>
          <li><a href='/search/label/Guides'>Guides</a></li>
          <li><a href='/p/about-ai-tool-scout.html'>About</a></li>
          <li><a href='/p/contact-us.html'>Contact</a></li>
        </ul>
      </nav>

      <div class='header-actions'>
        <a class='btn btn-primary btn-sm' expr:href='data:blog.homepageUrl'>Read the blog</a>
        <button class='nav-toggle' id='nav-toggle' aria-expanded='false' aria-controls='primary-nav' aria-label='Toggle navigation'>
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>

  <b:section class='ad-zone' id='adtop' maxwidgets='1' showaddelement='yes'>
  </b:section>

  <!-- role=main gives Lighthouse/axe the single main landmark it asks for;
       keep the div tag: a real main element here once broke Blogger's saved
       Layout (THEME_FIX.md / risk R2). -->
  <div class='site-main' id='main' role='main'>
    <b:if cond='data:blog.url == data:blog.homepageUrl or data:blog.url == data:blog.homepageUrl + &quot;?m=1&quot;'>
      <section class='hero'>
        <div class='container'>
          <div class='hero-grid'>
            <div>
              <div class='hero-badges'>
                <span class='pill'><span class='dot' aria-hidden='true'></span> Updated weekly</span>
                <span class='pill'>Independent &amp; unsponsored</span>
                <span class='pill'>Research-based reviews</span>
              </div>

              <h1>Find the right <span class='grad'>AI tool</span> in minutes, not weeks.</h1>

              <p class='lead'>
                We research AI writing tools, assistants, image generators and
                automation platforms so you don&#8217;t have to. Source-checked comparisons,
                clear verdicts — no vendor input, no bought rankings.
              </p>

              <div class='btn-group'>
                <a class='btn btn-primary btn-lg' href='#latest'>Browse all reviews</a>
                <a class='btn btn-ghost btn-lg' href='/search/label/Guides'>Read the guides</a>
              </div>

              <div class='hero-stats'>
                <!-- Hero stats are hand-written: Blogger templates cannot count
                     total posts. Bump "Articles published" whenever posts are
                     added (it was still 6 after all 30 went live). -->
                <div class='stat'><strong>30</strong><span>Articles published</span></div>
                <div class='stat'><strong>50+</strong><span>Tools covered</span></div>
                <div class='stat'><strong>0</strong><span>Sponsored rankings</span></div>
              </div>
            </div>

            <div class='hero-card' aria-hidden='true'>
              <div class='hero-card-head'>
                <i></i><i></i><i></i>
                <span>editors-picks</span>
              </div>

              <div class='mini-tool'>
                <div class='ico' style='background:linear-gradient(135deg,#4f8cff,#22d3ee)'>JP</div>
                <div class='meta'>
                  <strong>Jasper</strong>
                  <span>Marketing &amp; brand voice</span>
                  <div class='bar'><i style='width:94%'></i></div>
                </div>
                <div class='score'>4.7</div>
              </div>

              <div class='mini-tool'>
                <div class='ico' style='background:linear-gradient(135deg,#a78bfa,#22d3ee)'>CL</div>
                <div class='meta'>
                  <strong>Claude</strong>
                  <span>Long-form writing</span>
                  <div class='bar'><i style='width:92%'></i></div>
                </div>
                <div class='score'>4.6</div>
              </div>

              <div class='mini-tool'>
                <div class='ico' style='background:linear-gradient(135deg,#34d399,#4f8cff)'>CP</div>
                <div class='meta'>
                  <strong>Copy.ai</strong>
                  <span>Content workflows</span>
                  <div class='bar'><i style='width:90%'></i></div>
                </div>
                <div class='score'>4.5</div>
              </div>

              <div class='mini-tool'>
                <div class='ico' style='background:linear-gradient(135deg,#fbbf24,#f87171)'>RY</div>
                <div class='meta'>
                  <strong>Rytr</strong>
                  <span>Short copy on a budget</span>
                  <div class='bar'><i style='width:80%'></i></div>
                </div>
                <div class='score'>4.0</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class='section'>
        <div class='container'>
          <div class='section-head'>
            <span class='eyebrow'>Latest</span>
            <h2>Fresh reviews and guides</h2>
            <p>Every article is based on primary sources and independent evidence, not press releases.</p>
          </div>
        </div>
      </section>
    </b:if>

    <b:section class='main' id='maincontent' showaddelement='no'>
      <b:widget id='Blog1' locked='true' title='Blog posts' type='Blog'>
        <b:includable id='main'>
          <b:if cond='data:blog.pageType == &quot;error_page&quot;'>
            <section class='section'>
              <div class='container narrow text-center'>
                <span class='eyebrow'>Error 404</span>
                <h1>This page doesn&#8217;t exist</h1>
                <p class='lead'>The link may be broken, or the page may have moved. Try one of these instead.</p>
                <div class='btn-group' style='justify-content:center'>
                  <a class='btn btn-primary' expr:href='data:blog.homepageUrl'>Back to home</a>
                  <a class='btn btn-ghost' href='/search/label/Guides'>Browse guides</a>
                </div>
              </div>
            </section>
          <b:else/>
            <b:if cond='data:blog.pageType == &quot;item&quot; or data:blog.pageType == &quot;static_page&quot;'>
              <b:loop values='data:posts' var='post'>
                <article class='post'>
                  <header class='article-header'>
                    <div class='container narrow'>
                      <nav aria-label='Breadcrumb'>
                        <ol class='breadcrumb'>
                          <li><a expr:href='data:blog.homepageUrl'>Home</a></li>
                          <li aria-current='page'><data:post.title/></li>
                        </ol>
                      </nav>

                      <h1 class='post-title'><data:post.title/></h1>

                      <b:if cond='data:blog.pageType == &quot;item&quot;'>
                        <div class='article-meta'>
                          <span class='avatar' aria-hidden='true'>AI</span>
                          <span>By <strong><data:post.author/></strong></span>
                          <span aria-hidden='true'>•</span>
                          <time><data:post.timestamp/></time>
                        </div>
                      </b:if>
                    </div>
                  </header>

                  <div class='container narrow'>
                    <data:post.body/>
                  </div>
                </article>

                <b:if cond='data:blog.pageType == &quot;item&quot;'>
                  <script type='application/ld+json'>
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "mainEntityOfPage": {"@type": "WebPage", "@id": "<data:post.url/>"},
      "headline": "<data:post.title/>",
      "inLanguage": "en",
      "author": {"@type": "Organization", "name": "AI Tool Scout Editorial"},
      "publisher": {"@type": "Organization", "name": "${SITE_NAME}", "url": "<data:blog.homepageUrl/>"},
      "isPartOf": {"@id": "<data:blog.homepageUrl/>#website"}
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "<data:blog.homepageUrl/>"},
        {"@type": "ListItem", "position": 2, "name": "<data:post.title/>", "item": "<data:post.url/>"}
      ]
    }
  ]
}
                  </script>
                </b:if>
              </b:loop>
            <b:else/>
              <section class='section-tight' id='latest'>
                <div class='container'>
                  <div class='grid grid-3'>
                    <b:loop values='data:posts' var='post'>
                      <article class='post-card reveal'>
                        <div class='post-body'>
                          <div class='post-meta'>
                            <b:loop values='data:post.labels' var='label'>
                              <span class='tag'><data:label.name/></span>
                            </b:loop>
                            <span><data:post.timestamp/></span>
                          </div>
                          <h3><a expr:href='data:post.url'><data:post.title/></a></h3>
                          <a class='card-link' expr:href='data:post.url'>Read the guide</a>
                        </div>
                      </article>
                    </b:loop>
                  </div>
                </div>
              </section>
            </b:if>
          </b:if>
        </b:includable>
      </b:widget>
    </b:section>
  </div>

  <b:section class='ad-zone' id='adbottom' maxwidgets='1' showaddelement='yes'>
  </b:section>

  <footer class='site-footer'>
    <div class='container'>
      <div class='footer-grid'>
        <div class='footer-brand'>
          <a class='brand' expr:href='data:blog.homepageUrl'>
            <span class='brand-mark' aria-hidden='true'>
              <svg viewBox='0 0 32 32' width='24' height='24' fill='none' aria-hidden='true'>
                <path d='M16 2 4 9v14l12 7 12-7V9L16 2Z' stroke='currentColor' stroke-width='2' stroke-linejoin='round'/>
                <path d='m11 16 3.5 3.5L21 13' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/>
              </svg>
            </span>
            <span class='brand-text'>${SITE_NAME}</span>
          </a>
          <p>Find the right AI tool in minutes, not weeks. Independent reviews, honest comparisons and step-by-step guides.</p>
        </div>

        <nav class='footer-col' aria-label='Site'>
          <h2>Site</h2>
          <ul>
            <li><a expr:href='data:blog.homepageUrl'>Blog</a></li>
            <li><a href='/search/label/Guides'>Guides</a></li>
            <li><a href='/p/about-ai-tool-scout.html'>About</a></li>
            <li><a href='/p/contact-us.html'>Contact</a></li>
          </ul>
        </nav>

        <!--
          Legal column. The slugs below are the ones the live pages actually
          resolve to (verified 200 on 2026-09-27; /p/contact.html 301s to
          contact-us but we link straight there). DMCA must stay visible: an
          AdSense reviewer expects a copyright page to be one click away.
        -->
        <nav class='footer-col' aria-label='Legal'>
          <h2>Legal</h2>
          <ul>
            <li><a href='/p/privacy-policy.html'>Privacy Policy</a></li>
            <li><a href='/p/terms-of-service.html'>Terms of Service</a></li>
            <li><a href='/p/dmca-copyright.html'>DMCA</a></li>
            <li><a href='/p/about-ai-tool-scout.html'>About</a></li>
            <li><a href='/p/contact-us.html'>Contact</a></li>
          </ul>
        </nav>
      </div>

      <div class='footer-bottom'>
        <p>&#169; 2026 ${SITE_NAME}. All rights reserved.</p>
        <p class='muted'>We may earn a commission through affiliate links at no extra cost to you.</p>
        <p class='muted'><a href='#' id='aits-cookie-settings'>Cookie settings</a></p>
      </div>
    </div>
  </footer>

  <script>
  //<![CDATA[
${js}
  //]]>
  </script>

  <!--
    Reserved layout sections. The saved Blogger Layout points at these ids, so
    they MUST be declared (empty) or a plain Save wipes the whole layout and
    the desktop page renders zero widgets. See THEME_FIX.md - this is the fix
    that took desktop from Blog1=0 to Blog1=1. Keep them empty and hidden:
    they exist only so the stored layout has somewhere to sit.
  -->
  <div class='layout-reserved' style='display:none'>
    <b:section id='navbar' maxwidgets='1' showaddelement='no'></b:section>
    <b:section id='header' maxwidgets='1' showaddelement='no'></b:section>
    <b:section id='crosscol' maxwidgets='1' showaddelement='no'></b:section>
    <b:section id='crosscol-overflow' maxwidgets='1' showaddelement='no'></b:section>
    <b:section id='sidebar-right-1' showaddelement='no'></b:section>
    <b:section id='sidebar-right-2-1' showaddelement='no'></b:section>
    <b:section id='sidebar-right-2-2' showaddelement='no'></b:section>
    <b:section id='sidebar-right-3' showaddelement='no'></b:section>
    <b:section id='footer-1' showaddelement='no'></b:section>
    <b:section id='footer-2-1' showaddelement='no'></b:section>
    <b:section id='footer-2-2' showaddelement='no'></b:section>
    <b:section id='footer-3' showaddelement='no'></b:section>
  </div>
${cookieBar}
</body>
</html>
`;

const out = path.join(__dirname, "theme.xml");
fs.writeFileSync(out, theme, "utf8");

const kb = (Buffer.byteLength(theme, "utf8") / 1024).toFixed(1);
console.log(`✓ ${out}`);
console.log(`  ${kb} KB · css embedded: ${css.length} B · js embedded: ${js.length} B`);
