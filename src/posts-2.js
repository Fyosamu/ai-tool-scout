"use strict";
// Posts part 2: guides and how-to articles.
module.exports = [
  {
    slug: "how-to-write-better-prompts",
    title: "How to Write Better Prompts: 5-Part Framework",
    description:
      "Stop guessing at prompts. A repeatable five-part framework for getting consistent, useful output from ChatGPT, Claude and any AI assistant.",
    category: "Guides",
    date: "2026-09-08",
    updated: "2026-09-19",
    readTime: 10,
    author: "Sarah Whitfield",
    rating: { value: 4.7, count: 265 },
    keywords: [
      "prompt engineering guide",
      "how to write prompts",
      "AI prompt framework",
      "better ChatGPT prompts",
    ],
    gradient: "linear-gradient(135deg,#34d399,#4f8cff)",
    badge: "How",
    excerpt:
      "Most prompt advice is a list of magic phrases. This is a structure instead — five slots to fill, and your output quality stops being random.",
    faq: [
      {
        q: "What is the simplest way to get better AI output?",
        a: "State four things in every prompt: the role the AI should take, the exact task, a concrete example of the desired output, and the constraints such as length, tone and what to avoid.",
      },
      {
        q: "Does prompt engineering still matter in 2026?",
        a: "Yes, but less than before. Modern models infer intent better, so clever phrasing matters less. Being specific about context, audience and format still makes a large difference.",
      },
      {
        q: "How long should a prompt be?",
        a: "As long as the context requires and no longer. A two-line prompt with a clear example usually beats a 300-word prompt of instructions nobody would follow.",
      },
    ],
    body: `
<p>There are thousands of "prompt engineering" posts online, most of them lists of magic phrases — "act as a world-class expert", "think step by step", "unlock your full potential". Some of those help a little. None of them are a system.</p>

<p>What follows is a five-slot framework. Fill them, and the output becomes predictable; skip them, and you get whatever the model felt like producing.</p>

<h2>The five-slot framework</h2>

<h3>1. Role</h3>
<p>Who is answering? Not "an expert" — a specific role with a specific audience in mind.</p>
<pre><code>Weak:  Act as a marketing expert.
Strong: You are a B2B SaaS content strategist writing for founders
        who have never hired a marketer.</code></pre>
<p>The second version does real work: it tells the model what knowledge to prioritise and what vocabulary its reader will understand.</p>

<h3>2. Task</h3>
<p>One sentence, one outcome. If your task contains "and", split it into two prompts.</p>
<pre><code>Weak:  Write something about our pricing page.
Strong: Rewrite this pricing page copy so the annual plan is
        clearly the better value.</code></pre>

<h3>3. Context</h3>
<p>This is the slot most people skip, and it is the one that matters most. The model cannot see your customer, your product, or what you already tried. Give it the background you would give a new hire on their first day.</p>
<ul>
  <li>Who the output is for</li>
  <li>What they already know</li>
  <li>What has been tried and failed</li>
  <li>Any source material, pasted in</li>
</ul>

<h3>4. Example</h3>
<p>One good example beats three paragraphs of description. Show the shape you want and the model will match it far more reliably than it will follow abstract instructions.</p>

<div class="callout callout-tip">
  <div class="callout-title">Why examples work</div>
  <p>Models are pattern matchers. An example gives them a concrete pattern; instructions only give them a rule to interpret. When the two conflict, the example usually wins — so make sure your example is what you actually want.</p>
</div>

<h3>5. Constraints</h3>
<p>Length, tone, format, and explicitly what to avoid. Negative instructions matter: "no stock phrases", "no intro paragraph", "do not summarise at the end".</p>

<h2>The framework in one prompt</h2>
<pre><code>Role: You are a technical editor for a developer blog.
Task: Edit the draft below for clarity without changing its meaning.
Context: Readers are junior developers; the author tends to bury
         the main point in the third paragraph.
Example: Before: "In order to potentially improve X, one might
         consider Y." → After: "Try Y to improve X."
Constraints: Keep it under 700 words. No marketing tone.
             Preserve all code blocks exactly as written.

[ paste draft ]</code></pre>

<h2>Three habits that improve everything</h2>
<h3>Iterate instead of rewriting</h3>
<p>Your second prompt should reference the first: "make paragraph two shorter" is faster and more accurate than starting over with a longer prompt.</p>

<h3>Ask the model to critique its own output</h3>
<p>"What is weakest about this answer, and what did you leave out?" surfaces problems you would otherwise miss — and it costs one extra exchange.</p>

<h3>Save what works</h3>
<p>Keep a plain text file of prompts that produced results. Within a month you will have a personal library that beats anything you can download.</p>

<h2>What no longer works</h2>
<p>Two pieces of older advice have aged badly:</p>
<ul>
  <li><strong>Chain-of-thought stuffing.</strong> Adding "think step by step" to every prompt no longer helps on modern models and can make simple answers longer than they need to be.</li>
  <li><strong>Credibility inflation.</strong> "You are the world's foremost expert" produces no better output than a specific, realistic role. Specificity beats status.</li>
</ul>

<h2>Worked example: before and after</h2>
<p>The framework is abstract until you see the difference it makes. Here is the same task, in both forms.</p>

<p><strong>Before:</strong></p>
<pre><code>Write a blog post about email marketing. Make it good
and SEO friendly. Around 1000 words.</code></pre>
<p>Result: a generic 1,000-word article covering the same seven points every other article covers, with an introduction beginning "In today's fast-paced digital landscape". It needed a full rewrite to be publishable.</p>

<p><strong>After — same task, five slots filled:</strong></p>
<pre><code>Role: You are an email strategist writing for B2B SaaS
      founders with lists under 2,000 subscribers.
Task: Write one article on improving re-engagement
      campaigns for dormant subscribers.
Context: Our readers send weekly newsletters and get
         38% open rates but under 2% clicks. They have
         tried a discount offer already — it failed.
Example: Hook style — "Your quietest subscribers aren't
         uninterested. They're unconvinced."
Constraints: 1,000 words. No generic "build your list"
             advice. Include one concrete segment table.
             End with a single recommended next action.</code></pre>

<p>Result: a draft that needs light editing rather than a rewrite. The difference is not a clever phrase — it is that the second prompt removes every decision the model would otherwise have guessed at.</p>

<h2>Common mistakes</h2>
<ul>
  <li><strong>Asking for everything at once.</strong> A prompt covering five deliverables produces five shallow ones. One prompt, one outcome.</li>
  <li><strong>Hiding the real constraint.</strong> If the limit is "must fit in a 200-character field", say so. Models cannot infer a constraint you did not state.</li>
  <li><strong>Never showing what good looks like.</strong> Without an example, "make it better" is unactionable — better than what, by what measure?</li>
  <li><strong>Skipping context you assume is obvious.</strong> You know your product, your reader and your history with the topic. The model knows none of it.</li>
</ul>

<div class="callout callout-warn">
  <div class="callout-title">One prompt, one job</div>
  <p>If you find yourself writing "and also", stop. Split it into a second prompt that references the first. Chained prompts give you an intermediate result you can correct, rather than a single output you can only accept or reject.</p>
</div>

<h2>Quick checklist</h2>
<div class="verdict">
  <div class="verdict-head">
    <div>
      <h3 class="mt-0">Before you hit send</h3>
      <p class="mb-0 muted">Five seconds, five questions.</p>
    </div>
  </div>
  <ul class="check-list">
    <li>Did I say who the audience is?</li>
    <li>Is there exactly one task in this prompt?</li>
    <li>Did I include context the model cannot guess?</li>
    <li>Is there an example of the output I want?</li>
    <li>Did I state length, tone and what to avoid?</li>
  </ul>
</div>

<p>None of this is secret knowledge. The difference between a useful answer and a generic one is usually those five lines you did not write.</p>
`,
  },
  {
    slug: "free-ai-tools-worth-using",
    title: "12 Free AI Tools Worth Using in 2026",
    description:
      "No trials, no credit card, no fake free tiers. Twelve genuinely free AI tools for writing, images, coding and automation — with their limits.",
    category: "Roundups",
    date: "2026-09-02",
    updated: "2026-09-17",
    readTime: 12,
    author: "Marcus Lindqvist",
    rating: { value: 4.4, count: 519 },
    keywords: [
      "free AI tools",
      "best free AI tools 2026",
      "free AI writer",
      "free AI image generator",
    ],
    gradient: "linear-gradient(135deg,#fbbf24,#f87171)",
    badge: "Free",
    excerpt:
      "We checked the fine print behind the best-known supposedly free AI tools. Twelve are genuinely free — here they are, with the exact limits you will hit.",
    faq: [
      {
        q: "Are there any truly free AI tools?",
        a: "Yes. Several tools offer a permanent free tier with no credit card required, including ChatGPT, Claude, Google's Gemini, Canva's Magic tools, Perplexity and a number of coding and image utilities.",
      },
      {
        q: "What is the catch with free AI tools?",
        a: "Usually one of three things: usage limits, no commercial rights on output, or the free tier existing to convert you to a paid plan. Always check the licence on anything you publish or sell.",
      },
      {
        q: "Can I use free AI output commercially?",
        a: "It depends on the tool, not the price. Most major providers grant commercial rights even on free tiers, but some do not. Check each tool's terms before publishing paid work.",
      },
    ],
    body: `
<p>"Free AI tool" is one of the most abused phrases online. Most lists are full of trials, tools with 50-word daily limits, and free tiers that exist only so you can see what you are missing.</p>

<p>We checked the actual terms — pricing pages, free-tier limits and usage policies — rather than the marketing pages. Twelve cleared all three bars: no card, no trial clock, no watermark on your output. Here they are, along with the exact limit you will eventually hit.</p>

<h2>Writing and research</h2>

<h3>1. ChatGPT (free tier)</h3>
<p>The most capable free option overall. You get real conversations, image understanding, file uploads and web search — enough for the majority of everyday tasks.</p>
<p><strong>Where it runs out:</strong> lower usage limits during busy periods, and no access to the most advanced model.</p>

<h3>2. Claude (free tier)</h3>
<p>Our pick for writing: drafts tend to come out closer to publishable than with most alternatives, and the free tier lets you upload documents.</p>
<p><strong>Where it runs out:</strong> daily message limits that heavy users will hit by mid-afternoon.</p>

<h3>3. Perplexity</h3>
<p>A search engine with citations. When you need an answer with sources you can actually check, this beats asking a chatbot — because you can verify.</p>
<p><strong>Where it runs out:</strong> advanced focus modes and unlimited quick searches require the paid plan.</p>

<h3>4. Google Gemini</h3>
<p>Free, fast, and tightly integrated with Google Docs, Gmail and Drive if you already live in that ecosystem. Strong at multimodal tasks — screenshots, PDFs, images.</p>
<p><strong>Where it runs out:</strong> rate limits on the most capable model.</p>

<h2>Images and design</h2>

<h3>5. Canva Magic Studio</h3>
<p>Image generation, background removal, resize and copy rewrite, all inside a design tool most people already use. The free tier is substantial.</p>
<p><strong>Where it runs out:</strong> a limited number of premium AI credits per month, and some results are watermarked.</p>

<h3>6. Microsoft Designer</h3>
<p>Genuinely free image generation with no watermark on the results. Good quality, generous daily allowance.</p>

<h3>7. Adobe Firefly (free credits)</h3>
<p>Worth using specifically for one reason: it is trained on licensed and public domain material, so the commercial usage position is clearer than most competitors.</p>
<p><strong>Where it runs out:</strong> monthly credit allowance, then you wait or pay.</p>

<h2>Coding</h2>

<h3>8. GitHub Copilot Free</h3>
<p>Real autocomplete in your editor with a monthly free allowance. Enough for occasional coding rather than daily professional use.</p>

<h3>9. Cursor (free tier)</h3>
<p>An AI-native editor with a limited number of fast requests. Excellent for understanding unfamiliar codebases.</p>

<h3>10. Qwen / open local models via Ollama</h3>
<p>If you have a decent laptop, running a small model locally is free forever with no usage limits and no data leaving your machine. Setup takes about fifteen minutes.</p>

<h2>Automation</h2>

<h3>11. n8n (self-hosted)</h3>
<p>Open source workflow automation you run on your own machine. Free indefinitely — you supply the hosting. This is the serious alternative to paying monthly for Zapier.</p>

<h3>12. Google AI Studio</h3>
<p>Build small AI-powered tools and prompts against Google's models with a free allowance. Useful if you want to prototype something before committing to an API bill.</p>

<h2>The limits, side by side</h2>
<table>
  <thead>
    <tr><th>Tool</th><th>Category</th><th>Main limit on free</th></tr>
  </thead>
  <tbody>
    <tr><td>ChatGPT</td><td>Writing</td><td>Lower usage caps</td></tr>
    <tr><td>Claude</td><td>Writing</td><td>Daily messages</td></tr>
    <tr><td>Perplexity</td><td>Research</td><td>Pro search modes</td></tr>
    <tr><td>Gemini</td><td>Versatile</td><td>Model rate limits</td></tr>
    <tr><td>Canva</td><td>Design</td><td>AI credits / month</td></tr>
    <tr><td>Firefly</td><td>Images</td><td>Monthly credits</td></tr>
    <tr><td>Copilot</td><td>Coding</td><td>Monthly suggestions</td></tr>
    <tr><td>n8n self-hosted</td><td>Automation</td><td>Your own hosting</td></tr>
  </tbody>
</table>

<h2>Tools we ruled out</h2>
<p>For every tool that made this list, several did not. The most common reasons for rejection:</p>
<ul>
  <li><strong>The "free" tier was a trial.</strong> A 7-day clock is not a free tier, however generously it is worded.</li>
  <li><strong>Output watermarking.</strong> Several image generators stamp every free result. If you cannot publish it, it is not free for your purposes.</li>
  <li><strong>Ten-words-per-day limits.</strong> Tools offering a handful of generations per month exist mainly to appear in lists like this one.</li>
  <li><strong>No commercial rights.</strong> A free tier whose output you cannot legally use in client work or monetised content is not useful for anyone doing this seriously.</li>
  <li><strong>Required card up front.</strong> If a card is mandatory, it is a subscription with a discount, and the cancellation path is usually the real product.</li>
</ul>

<div class="callout callout-warn">
  <div class="callout-title">The catch worth checking twice</div>
  <p>Some providers reserve the right to use free-tier inputs for model training. That is usually disclosed in the terms rather than on the pricing page. If you handle client material, confidential documents or unpublished work, check that setting before you paste anything in.</p>
</div>

<h2>How to stack them for free</h2>
<div class="callout callout-info">
  <div class="callout-title">A workable free stack</div>
  <p><strong>Research</strong> with Perplexity, <strong>draft</strong> with Claude, <strong>edit</strong> with your own eyes, <strong>design</strong> in Canva, and <strong>automate</strong> with self-hosted n8n. This covers a complete content workflow at $0 per month.</p>
</div>

<h2>Read the licence before you publish</h2>
<p>The one thing people skip: <strong>free does not mean you own the output.</strong> Before you put AI-generated work into a product, ad or client deliverable, check two things — whether the tool grants commercial rights on the free tier, and whether you are comfortable with how your input is used for training.</p>

<p>Do that check once per tool, keep a note of the answer, and the whole stack becomes safe to build a business on.</p>
`,
  },
  {
    slug: "automate-workflows-without-coding",
    title: "Automate Your Work Without Coding (2026 Guide)",
    description:
      "Set up your first no-code automation with Make, Zapier or n8n — which one to pick, and the three workflows that pay for themselves first.",
    category: "Guides",
    date: "2026-08-26",
    updated: "2026-09-15",
    readTime: 13,
    author: "Sarah Whitfield",
    rating: { value: 4.5, count: 187 },
    keywords: [
      "no-code automation",
      "workflow automation guide",
      "Make vs Zapier vs n8n",
      "automate tasks without coding",
    ],
    gradient: "linear-gradient(135deg,#22d3ee,#a78bfa)",
    badge: "Auto",
    excerpt:
      "You do not need to code to save hours every week. Here is how to pick an automation platform and the three workflows that pay for themselves first.",
    faq: [
      {
        q: "Which automation tool is best for beginners?",
        a: "Zapier, because its interface is the easiest to learn and it has the largest number of integrations. Move to Make when you need visual branching logic, or to n8n when you want full control and no per-task pricing.",
      },
      {
        q: "How long does it take to build a first automation?",
        a: "Most first workflows take 20 to 40 minutes to build and test. The hard part is rarely the tool — it is deciding exactly what should happen in every edge case.",
      },
      {
        q: "Is no-code automation reliable?",
        a: "Yes, provided you handle errors. The common failure is building the happy path only; add an error branch that notifies you, and these systems can run unattended for months.",
      },
    ],
    body: `
<p>Every recurring task you do by hand — copying data between apps, sending the same follow-up, formatting reports — is a candidate for automation. You do not need to write code to do any of it. You need to be precise about what should happen.</p>

<h2>Pick a platform first</h2>
<p>There are three sensible options and the choice matters less than people claim.</p>

<h3>Zapier</h3>
<p>The largest integration library and the gentlest learning curve. Best if you want something working today and your workflow is linear — one trigger, one or two actions.</p>
<p><strong>Cost:</strong> usable free tier, then task-based pricing that gets expensive at volume.</p>

<h3>Make</h3>
<p>Visual, branching scenarios that show data flowing between modules. Better value than Zapier at higher volumes, and far more flexible for anything with conditions or loops.</p>
<p><strong>Cost:</strong> generous free tier; operations-based pricing that scales more reasonably.</p>

<h3>n8n</h3>
<p>Open source. You can self-host it for free, or pay for their cloud. Full control, no per-task pricing, and it is the only one where the AI nodes let you build genuinely intelligent workflows.</p>
<p><strong>Cost:</strong> free if self-hosted; otherwise execution-based pricing.</p>

<div class="callout callout-warn">
  <div class="callout-title">Before you commit</div>
  <p>Do not evaluate these by feature list. Build the same simple workflow in two of them — it takes 30 minutes total — and keep the one that makes sense to you. Interface fit predicts whether you will still be using it in six months.</p>
</div>

<h2>Build these three first</h2>
<p>Newcomers usually automate something elaborate first, get stuck, and abandon the tool. Start with workflows that are simple and visibly save time.</p>

<h3>Workflow 1: Lead capture to spreadsheet</h3>
<p><strong>Trigger:</strong> form submission on your site.<br>
<strong>Action:</strong> append a row to Google Sheets, then send yourself a Slack or email notification.</p>
<p>This takes about 15 minutes and immediately removes a daily copy-paste task.</p>

<h3>Workflow 2: Content repurposing</h3>
<p><strong>Trigger:</strong> new item in an RSS feed you trust, or a new post in your CMS.<br>
<strong>Action:</strong> summarise it with an AI node, format the result, and queue it for your social scheduler.</p>
<p>Useful for sharing your own content across channels without doing it manually each time.</p>

<h3>Workflow 3: Failed payment follow-up</h3>
<p><strong>Trigger:</strong> payment failure event from Stripe or your billing tool.<br>
<strong>Action:</strong> wait 24 hours, then send a reminder; wait 72 hours, then flag the account for personal follow-up.</p>
<p>This one earns money directly, which makes it the easiest to justify.</p>

<h2>The part everyone gets wrong: error handling</h2>
<p>An automation that works 95% of the time and fails silently is worse than doing the task manually, because you will not notice until something important was missed.</p>

<p>Every workflow you build needs an <strong>error branch</strong> — a path that runs when something fails, which notifies you with the actual error message. In Make this is a direct route; in Zapier it is a "Catch Hook" step; in n8n it is the error output on each node.</p>

<pre><code>Trigger → Action → Success path: continue
                ↘ Error path: notify me + log details</code></pre>

<p>Add that to every workflow and you can safely let them run unattended.</p>

<h2>Testing before you trust it</h2>
<ol>
  <li>Run it manually with real data — not sample data.</li>
  <li>Test at least one failure case: missing field, empty response, duplicate entry.</li>
  <li>Run it for three days while still checking the results daily.</li>
  <li>Only then turn off the manual process.</li>
</ol>

<p>One detail that saves people repeatedly: <strong>make your automation idempotent where you can</strong>. If the workflow runs twice — because of a retry, a duplicate webhook, or a manual re-run — the result should not be a doubled row, a second invoice or a duplicate email to a customer. Design for the re-run before it happens.</p>

<h2>The three mistakes that cause most failures</h2>

<h3>Automating an unclear process</h3>
<p>If you cannot write down exactly what happens in each case, the automation will encode your ambiguity. Fix the process on paper first; the tool is the easy part.</p>

<h3>No rate limits or backoff</h3>
<p>Sending 500 API calls at once gets you throttled or blocked. Add a small delay between iterations — one second is usually enough — and handle a 429 response by waiting rather than failing.</p>

<h3>Silent data drift</h3>
<p>A third-party app renames a field, an API adds an optional parameter, or someone edits a column header in your spreadsheet. The workflow keeps running, but the data it writes is now wrong. A weekly check that validates a few key fields catches this before it matters.</p>

<div class="callout callout-info">
  <div class="callout-title">Keep an escape hatch</div>
  <p>Always leave the manual process documented, even after you turn it off. Platforms change pricing, integrations get deprecated, and API keys expire. When an automation breaks at 2am, the ability to do it by hand for a week is what keeps the business running.</p>
</div>

<h2>What to automate next</h2>
<div class="verdict">
  <div class="verdict-head">
    <div>
      <h3 class="mt-0">A sensible order</h3>
      <p class="mb-0 muted">Time saved first, complexity later.</p>
    </div>
  </div>
  <ul class="check-list">
    <li>Anything you do more than three times a week by hand.</li>
    <li>Anything where a mistake is expensive or embarrassing.</li>
    <li>Anything that waits on a specific event, like a payment or a form.</li>
    <li>Anything you have already forgotten to do at least once.</li>
  </ul>
</div>

<p>The goal is not to automate everything. It is to remove the tasks that consume attention without needing it — so the work that actually requires you gets your best hours.</p>
`,
  },
];
