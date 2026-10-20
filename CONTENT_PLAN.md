# AI Tool Scout — Content Plan (posts 07–30)

Created 2026-09-27. Goal: reach **20–30 original articles** (LAUNCH.md §4) before
the AdSense application. 6 posts are already live; 24 more are queued here in
**4 topic clusters of 6**.

## Hard requirements (every article)

| Item | Rule |
|---|---|
| Language | English (`lang="en"`), original writing — **no translation, no copy-paste** |
| Body length | **1,000–1,200 words** (LAUNCH says 800–1,200; aim high) |
| Meta description | **≤ 150 characters** — enforced by `check_desc.py` |
| Structure | `<h2 id="...">` sections (4–7), `<h3>` where useful, `<p>`, `<ul>`, `<table>` allowed |
| Opening | 1–2 intro `<p>` before the first `<h2>` (this becomes the `.lead` context) |
| Tone | Analytical, evidence-led, no hype, no "revolutionary/unleash/skyrocket" |
| Recurring device | `<p><strong>What it means for you:</strong> …</p>` in at least 2 sections |
| `faq` | exactly 3 `{q, a}` entries, each answer 40–80 words |
| `keywords` | 5 strings |
| `author` | one of `Sarah Whitfield`, `Marcus Lindqvist` (existing house authors) |
| `category` | one of `Comparisons`, `Guides`, `Roundups`, `Trends` |
| `date` / `updated` | `2026-09-2x` (September 2026 — see permalink note) |
| Internal links | **must be `/2026/09/<slug>.html`** — short form `/<slug>.html` returns **404** |
| Cross-links | 2–4 internal links per article, to related articles in this plan |

### Permalink warning
Blogger permalinks here are date-based. `https://scoutaitools.blogspot.com/<slug>.html`
and `/2026/10/<slug>.html` both **404**. Only `/2026/09/<slug>.html` resolves for a
post published in September 2026. Therefore every article in this plan carries a
September 2026 date, and every internal link uses the `/2026/09/` prefix.

### Source files
- `src/posts-4.js` → posts 07–12 (Comparisons)
- `src/posts-5.js` → posts 13–18 (Guides)
- `src/posts-6.js` → posts 19–24 (Roundups)
- `src/posts-7.js` → posts 25–30 (Trends)

`node blogger/make-editor-content.js` regenerates `blogger/content/*.json` from these.
Existing files `src/posts-1.js`, `src/posts-2.js`, `src/posts-3.js`, `src/pages.js`
must not be modified.

---

## Cluster A — Comparisons (`src/posts-4.js`, category `Comparisons`)

| # | slug | title |
|---|---|---|
| 07 | `gemini-vs-chatgpt-2026` | Gemini vs ChatGPT: Which Is Better in 2026? |
| 08 | `copilot-vs-cursor-2026` | GitHub Copilot vs Cursor: Which Is Better for Coding in 2026? |
| 09 | `perplexity-vs-google-search-2026` | Perplexity vs Google Search: Which Should You Use in 2026? |
| 10 | `midjourney-vs-dall-e-2026` | Midjourney vs DALL-E: Which Image Model Wins in 2026? |
| 11 | `notion-ai-vs-clickup-brain-2026` | Notion AI vs ClickUp Brain: Which Is Better in 2026? |
| 12 | `jasper-vs-copy-ai-2026` | Jasper vs Copy.ai: Which Is Better for Writing in 2026? |

## Cluster B — Practical guides (`src/posts-5.js`, category `Guides`)

| # | slug | title |
|---|---|---|
| 13 | `ai-research-workflow-2026` | How to Build an AI Research Workflow (2026 Guide) |
| 14 | `summarize-long-documents-with-ai` | How to Summarize Long Documents with AI (2026 Guide) |
| 15 | `fact-check-ai-output-before-publishing` | How to Fact-Check AI Output Before You Publish (2026 Guide) |
| 16 | `personal-knowledge-base-with-ai` | How to Build a Personal Knowledge Base with AI (2026 Guide) |
| 17 | `automate-your-inbox-with-ai` | How to Automate Your Inbox with AI (No-Code 2026 Guide) |
| 18 | `make-ai-writing-sound-like-you` | How to Make AI Writing Sound Like You (2026 Guide) |

## Cluster C — Roundups (`src/posts-6.js`, category `Roundups`)

| # | slug | title |
|---|---|---|
| 19 | `best-ai-coding-assistants-2026` | 9 Best AI Coding Assistants in 2026 |
| 20 | `best-ai-image-generators-2026` | 8 Best AI Image Generators in 2026 |
| 21 | `best-ai-note-taking-apps-2026` | 10 Best AI Note-Taking Apps in 2026 |
| 22 | `best-ai-voice-generators-2026` | 7 Best AI Voice Generators in 2026 |
| 23 | `free-ai-tools-for-students-2026` | 11 Free AI Tools for Students in 2026 |
| 24 | `best-ai-agents-2026` | 8 AI Agents You Can Actually Use in 2026 |

## Cluster D — Trends & analysis (`src/posts-7.js`, category `Trends`)

| # | slug | title |
|---|---|---|
| 25 | `ai-agents-in-2026` | AI Agents in 2026: What Actually Works (and What Doesn't) |
| 26 | `small-language-models-explained` | Small Language Models: Why They Matter in 2026 |
| 27 | `ai-search-engines-and-the-web-2026` | AI Search Engines: Are They Killing the Web? |
| 28 | `open-vs-closed-ai-models-2026` | Open vs Closed AI Models: Which Should You Build On? |
| 29 | `ai-copyright-guide-2026` | AI Copyright in 2026: What Creators Need to Know |
| 30 | `cost-of-running-ai-2026` | The Real Cost of Running AI in 2026: Free vs Paid |

---

## Cluster → existing posts (cross-link targets)

Existing live posts (link to these where relevant):

- `/2026/09/best-ai-writing-tools-2026.html` — 7 Best AI Writing Tools in 2026 *(Comparisons)*
- `/2026/09/chatgpt-vs-claude-2026.html` — ChatGPT vs Claude *(Comparisons)*
- `/2026/09/how-to-write-better-prompts.html` — How to Write Better Prompts *(Guides)*
- `/2026/09/free-ai-tools-worth-using.html` — 12 Free AI Tools *(Roundups)*
- `/2026/09/automate-workflows-without-coding.html` — Automate Your Work *(Guides)*
- `/2026/09/what-will-happen-in-next-5-years-ai.html` — AI Predictions for 2031 *(Trends)*

Legal pages (link from Guides/Trends where natural):
`/p/about-ai-tool-scout.html` · `/p/contact-us.html` · `/p/privacy-policy.html`

## Progress log

- [ ] Cluster A — posts 07–12
- [ ] Cluster B — posts 13–18
- [ ] Cluster C — posts 19–24
- [ ] Cluster D — posts 25–30
- [ ] `check_desc.py` all ≤150
- [ ] Published + feed/sitemap verified
