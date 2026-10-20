"use strict";
/**
 * Generates blogger/content/*.json — one file per post/page, holding the
 * fully assembled HTML (heading ids, TOC, FAQ, author box, rewritten links)
 * plus editor metadata (title, slug, label, search description).
 *
 * Used by the browser editor-automation pipeline (serve-content.js provides
 * these files to the automation over localhost).
 *
 * Zero dependencies. Run: node blogger/make-editor-content.js
 */
const fs = require("fs");
const path = require("path");
const { assemblePostBody, assemblePageBody } = require("./make-import");

const ROOT = path.join(__dirname, "..");

// src/posts-1..7 — whichever exist. posts-1..3 hold the published six;
// posts-4..7 hold queue 07-30 (see ../CONTENT_PLAN.md).
const SRC_POSTS = [
  "posts-1",
  "posts-2",
  "posts-3",
  "posts-4",
  "posts-5",
  "posts-6",
  "posts-7",
];
const posts = SRC_POSTS.filter((n) =>
  fs.existsSync(path.join(ROOT, "src", `${n}.js`))
).flatMap((n) => require(path.join(ROOT, "src", n)));

const pages = require(path.join(ROOT, "src/pages"));

/**
 * Topic-cluster linking pass (LAUNCH.md §4).
 *
 * Posts 01-06 were published before the internal-linking pass, so they carry
 * no outbound links; posts 07/17/22 were never linked *to* (orphans). Each
 * entry below adds one editorial paragraph at the end of a post that closes
 * both gaps at once. Targets were chosen from the label clusters in
 * CONTENT_PLAN.md so that every link is contextual, not decorative.
 *
 * Re-run `node blogger/make-editor-content.js` after editing this map, then
 * push the paragraph to the live post via the editor automation.
 */
const RELATED = {
  "post-01":
    "Tool choice is only half the decision; how you write the instruction is the other half. " +
    'Our <a href="/2026/09/how-to-write-better-prompts.html">five-part prompt framework</a> covers ' +
    'that side, <a href="/2026/09/make-ai-writing-sound-like-you.html">making AI writing sound like you</a> ' +
    "covers the edit that follows, and for the narrower buying question " +
    '<a href="/2026/09/jasper-vs-copy-ai-2026.html">Jasper versus Copy.ai</a> goes line by line on the ' +
    "two tools built for publishing teams.",
  "post-02":
    "The third model in that fight is covered in our " +
    '<a href="/2026/09/gemini-vs-chatgpt-2026.html">Gemini versus ChatGPT comparison</a>. If long ' +
    'inputs are your main job, <a href="/2026/09/summarize-long-documents-with-ai.html">summarising ' +
    "long documents with AI</a> is the practical companion, and prompt quality still decides more " +
    'than model choice - see the <a href="/2026/09/how-to-write-better-prompts.html">five-part ' +
    "framework</a>.",
  "post-03":
    "Prompts get easier once the surrounding workflow is fixed. " +
    '<a href="/2026/09/ai-research-workflow-2026.html">Building an AI research workflow</a> shows ' +
    "where prompting fits into a repeatable process, and " +
    '<a href="/2026/09/make-ai-writing-sound-like-you.html">making AI writing sound like you</a> ' +
    "covers the edit that happens after the prompt returns.",
  "post-04":
    "Three of these categories are examined in depth elsewhere: " +
    '<a href="/2026/09/best-ai-image-generators-2026.html">the best AI image generators</a>, ' +
    '<a href="/2026/09/best-ai-voice-generators-2026.html">the best AI voice generators</a>, and ' +
    '<a href="/2026/09/free-ai-tools-for-students-2026.html">free tools built for students</a>.',
  "post-05":
    "The first workflow most people should automate is email: " +
    '<a href="/2026/09/automate-your-inbox-with-ai.html">automating your inbox without code</a> ' +
    "walks through it step by step, and " +
    '<a href="/2026/09/best-ai-agents-2026.html">eight AI agents you can actually use</a> covers ' +
    "the tools that act without a trigger you have to write.",
  "post-06":
    "Two of these predictions are already measurable: " +
    '<a href="/2026/09/ai-agents-in-2026.html">what AI agents actually deliver today</a> measures ' +
    'the first, and <a href="/2026/09/ai-search-engines-and-the-web-2026.html">AI search engines ' +
    'and the web</a> measures the second. The <a href="/2026/09/open-vs-closed-ai-models-2026.html">' +
    "open versus closed question</a> decides who captures the value either way.",
};

function appendRelated(html, id) {
  const para = RELATED[id];
  if (!para) return html;
  if (html.indexOf(para.slice(0, 60)) >= 0) return html; // idempotent
  return html.replace(/\s*$/, "\n\n<p>" + para + "</p>\n");
}

const OUT = path.join(__dirname, "content");
fs.mkdirSync(OUT, { recursive: true });

const items = [];

posts.forEach((p, i) => {
  const id = `post-${String(i + 1).padStart(2, "0")}`;
  items.push({
    id,
    kind: "post",
    title: p.title,
    slug: p.slug,
    label: p.category,
    description: p.description,
    html: appendRelated(assemblePostBody(p), id),
  });
});

/**
 * Live Blogger page slugs. `src/pages.js` stores pretty paths (/about/,
 * /terms/) but the pages were published under their full titles. The payload
 * slug IS the permalink, so if they disagreed, re-publishing a page would
 * silently change its URL and break every footer link pointing at the old
 * one. Keep this map equal to the live blog (verified 2026-09-27).
 */
const PAGE_SLUG_MAP = {
  "/about/": "about-ai-tool-scout",
  "/contact/": "contact-us",
  "/privacy-policy/": "privacy-policy",
  "/terms/": "terms-of-service",
  "/editorial-team/": "editorial-team",
};

pages.forEach((p, i) => {
  const slug =
    PAGE_SLUG_MAP[p.path] || p.path.replace(/^\//, "").replace(/\/$/, "");
  items.push({
    id: `page-${String(i + 1).padStart(2, "0")}`,
    kind: "page",
    title: p.title,
    slug,
    label: "",
    description: p.description,
    html: assemblePageBody(p),
  });
});

items.forEach((it) => {
  const file = path.join(OUT, `${it.id}.json`);
  fs.writeFileSync(file, JSON.stringify(it), "utf8");
  const kb = (Buffer.byteLength(JSON.stringify(it), "utf8") / 1024).toFixed(1);
  console.log(`  · ${it.id}.json  ${kb} KB  «${it.title}»`);
});

const index = items.map((it) => ({ id: it.id, kind: it.kind, title: it.title, slug: it.slug }));
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(index, null, 2), "utf8");
console.log(`✓ ${items.length} items → ${OUT}`);
