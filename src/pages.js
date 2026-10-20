"use strict";
const config = require("../config");

/** Static (non-article) pages. */
module.exports = [
  {
    path: "/about/",
    title: "About AI Tool Scout",
    description:
      "Who we are, how we research AI tools, and why you can trust our comparisons. Independent, editorially controlled, and free of vendor influence.",
    nav: "About",
    hero: "About us",
    lead: "We research AI tools the way a careful buyer would — primary sources first, and no vendor input.",
    body: `
<div class="prose">
  <h2>Our mission</h2>
  <p>AI Tool Scout exists to answer one question honestly: <strong>is this tool actually worth your money and your time?</strong></p>
  <p>The internet is full of AI tool roundups written by people who have used each product once, or not at all — often with affiliate links pointing to whichever tool pays the highest commission. We do things differently. Every tool in our comparisons is checked against its own pricing page, documentation, changelog and terms before we publish a word — and scored against a fixed rubric, not a feature checklist.</p>

  <h2>How we research</h2>
  <p>Our process is deliberately boring and repeatable:</p>
  <ol>
    <li><strong>Primary sources first.</strong> Pricing, usage limits, data policies and commercial rights are taken from the provider's own terms and documentation, not its marketing page.</li>
    <li><strong>Independent evidence.</strong> Where reputable third-party benchmarks or tests exist, we use them and say so — instead of inventing numbers of our own.</li>
    <li><strong>One rubric for every tool.</strong> Each tool in a comparison is scored on the same criteria: output quality, instruction following, reliability, workflow fit, and price against value.</li>
    <li><strong>Opinion marked as opinion.</strong> When a judgment is ours rather than a documented fact, the text says so. Scores are editorial ratings, explained in the article itself.</li>
    <li><strong>Re-check on major releases.</strong> These products change monthly. When a significant release ships, we re-check the affected claims and update the article with a dated changelog.</li>
  </ol>

  <div class="callout callout-info">
    <div class="callout-title">What we do not do</div>
    <p>We do not accept payment for a review, a score, or a placement. We do not publish a score we cannot justify against our published criteria. If a tool is bad, we say so — including tools we link to.</p>
  </div>

  <h2>How we make money</h2>
  <p>AI Tool Scout is free to read and carries no paywall. We earn revenue in two ways:</p>
  <ul>
    <li><strong>Affiliate commissions.</strong> Some links to third-party tools earn us a commission if you subscribe. This never affects a price you pay, a score, or whether a tool appears in a comparison.</li>
    <li><strong>Advertising.</strong> We display contextual advertising. Ads are clearly marked and never placed inside our editorial verdicts.</li>
  </ul>
  <p>Both revenue streams are capped by one rule: <strong>the reader's trust is the only asset we actually own.</strong> A higher score cannot be bought.</p>

  <h2>Editorial standards</h2>
  <ul>
    <li>Claims are sourced, or marked as our own opinion.</li>
    <li>Pricing and limits are verified at the time of publication.</li>
    <li>Corrections are published openly at the bottom of an article, not silently applied.</li>
    <li>Every article carries a named author and a visible update history — the people behind those bylines, their backgrounds and how we work are set out on the <a href="/editorial-team/">editorial team page</a>.</li>
  </ul>

  <h2>Who we are</h2>
  <p>We are a small, independent editorial team of writers, developers and analysts who use these tools daily in our own work. We have no investors, no parent media company, and no obligation to any vendor.</p>

  <p>If you spot an error, an outdated price, or a claim you think we got wrong, please <a href="/contact/">tell us</a>. Corrections improve the site for everyone, and we will credit the change.</p>
</div>
`,
  },

  {
    path: "/contact/",
    title: "Contact Us",
    description:
      "Get in touch with the AI Tool Scout editorial team — corrections, partnership enquiries, tool submissions or general questions.",
    nav: "Contact",
    hero: "Contact us",
    lead: "Corrections, suggestions, tool submissions or partnership enquiries — we read everything.",
    body: `
  <h2 class="sr-only">Ways to reach us</h2>
<div class="grid grid-2">
  <div class="card">
    <div class="card-icon" aria-hidden="true">✉</div>
    <h3>General &amp; editorial</h3>
    <p>Questions about an article, a correction, or something we got wrong.</p>
    <p class="mb-0"><strong>hello@aitoolscout.com</strong></p>
  </div>

  <div class="card">
    <div class="card-icon" aria-hidden="true">◆</div>
    <h3>Tool submissions</h3>
    <p>Build an AI tool? Send it over. Every submission is reviewed before it is considered — and we never charge for coverage.</p>
    <p class="mb-0"><strong>submissions@aitoolscout.com</strong></p>
  </div>

  <div class="card">
    <div class="card-icon" aria-hidden="true">◈</div>
    <h3>Partnerships</h3>
    <p>Sponsored content and advertising enquiries. All partnerships are labelled as such and never buy editorial placement.</p>
    <p class="mb-0"><strong>partners@aitoolscout.com</strong></p>
  </div>

  <div class="card">
    <div class="card-icon" aria-hidden="true">◐</div>
    <h3>Response time</h3>
    <p>We aim to reply to all editorial messages within two business days. Partnership enquiries may take longer.</p>
    <p class="mb-0"><strong>Mon–Fri</strong></p>
  </div>
</div>

<h2 class="mt-3">Send a message</h2>
<form class="form" data-demo-form action="mailto:hello@aitoolscout.com" method="post" enctype="text/plain">
  <div class="grid grid-2">
    <div class="field">
      <label for="name">Your name</label>
      <input type="text" id="name" name="name" autocomplete="name" required placeholder="Jane Doe">
    </div>
    <div class="field">
      <label for="email">Email address</label>
      <input type="email" id="email" name="email" autocomplete="email" required placeholder="jane@example.com">
      <span class="hint">We only use this to reply to you.</span>
    </div>
  </div>

  <div class="field">
    <label for="subject">Subject</label>
    <input type="text" id="subject" name="subject" required placeholder="Correction on an article">
  </div>

  <div class="field">
    <label for="message">Message</label>
    <textarea id="message" name="message" required placeholder="Tell us what's on your mind..."></textarea>
  </div>

  <div class="btn-group">
    <button type="submit" class="btn btn-primary btn-lg">Send message</button>
  </div>

  <p class="form-note" data-form-note hidden>
    Prefer email? Write to <strong>hello@aitoolscout.com</strong> directly.
  </p>
</form>

<div class="callout callout-tip mt-3">
  <div class="callout-title">Reporting a correction</div>
  <p>Please include the article URL, the paragraph in question, and a source for the correct information. Corrections are verified before we update an article, and we publish what changed.</p>
</div>
`,
  },

  {
    path: "/privacy-policy/",
    title: "Privacy Policy",
    description:
      "How AI Tool Scout collects, uses and protects your data. Covers cookies, analytics, advertising including Google AdSense, and your GDPR rights.",
    nav: "Privacy",
    hero: "Privacy policy",
    lead: "Plain-language summary first, full policy second. Last updated 22 September 2026.",
    noindex: false,
    body: `
<div class="prose">
  <div class="callout callout-info">
    <div class="callout-title">The short version</div>
    <p>We collect the minimum needed to run this site. We do not sell personal data. We use cookies for analytics and, where enabled, advertising. You can opt out at any time. Questions go to <strong>privacy@aitoolscout.com</strong>.</p>
  </div>

  <h2>1. Who we are</h2>
  <p>AI Tool Scout ("we", "us", "our") operates this website. For data protection purposes, we are the data controller of the personal data described in this policy. Contact: <strong>privacy@aitoolscout.com</strong>.</p>

  <h2>2. Information we collect</h2>
  <h3>Information you give us</h3>
  <ul>
    <li><strong>Contact form:</strong> name, email address and message, if you choose to send one.</li>
    <li><strong>Newsletter:</strong> email address, if you subscribe. You can unsubscribe from any email we send.</li>
  </ul>
  <h3>Information collected automatically</h3>
  <ul>
    <li><strong>Usage data:</strong> pages visited, referring page, approximate location (country/city level), device and browser type.</li>
    <li><strong>Technical data:</strong> IP address, which we process for security and abuse prevention and then minimise or aggregate.</li>
  </ul>

  <h2>3. Cookies and similar technologies</h2>
  <p>We use the following categories of cookie:</p>
  <table>
    <thead><tr><th>Type</th><th>Purpose</th><th>Opt out</th></tr></thead>
    <tbody>
      <tr><td>Strictly necessary</td><td>Security, load balancing, remembering your consent choice</td><td>Not possible</td></tr>
      <tr><td>Analytics</td><td>Aggregated statistics about how the site is used</td><td>Cookie banner / browser settings</td></tr>
      <tr><td>Advertising</td><td>Relevant advertising and measuring ad performance</td><td>Cookie banner / Google Ads Settings</td></tr>
    </tbody>
  </table>
  <p>You can clear or block cookies in your browser settings at any time. Blocking strictly necessary cookies may affect how the site works.</p>

  <h2>4. Analytics</h2>
  <p>We use privacy-conscious, aggregated analytics to understand which articles are useful. Analytics data is processed in aggregate where possible. Where we use Google Analytics, Google acts as a processor and its own terms apply; you can opt out via the Google Analytics Opt-out Browser Add-on.</p>

  <h2>5. Advertising and Google AdSense</h2>
  <p>We may display advertising, including through Google AdSense. Google and its partners may use cookies to serve ads based on your prior visits to this or other websites.</p>
  <ul>
    <li>Google's use of advertising cookies enables it and its partners to serve ads based on your visit to this and other sites.</li>
    <li>You can opt out of personalised advertising by visiting <strong>Google Ads Settings</strong>.</li>
    <li>You can opt out of third-party vendor cookies at <strong>AboutAds.info</strong> or <strong>YourAdChoices</strong>.</li>
    <li>Google's own handling of data is governed by the <strong>Google Privacy &amp; Terms</strong> policy.</li>
  </ul>
  <p>Advertising does not give Google access to information you have provided directly to us.</p>

  <h2>6. How we use your information</h2>
  <ul>
    <li>To respond to messages you send us.</li>
    <li>To send a newsletter you subscribed to.</li>
    <li>To operate, secure and improve the website.</li>
    <li>To measure which content is useful.</li>
    <li>To display and measure advertising, where enabled.</li>
    <li>To comply with legal obligations.</li>
  </ul>

  <h2>7. Legal bases (GDPR)</h2>
  <ul>
    <li><strong>Consent</strong> — non-essential cookies and newsletter sign-up.</li>
    <li><strong>Legitimate interests</strong> — site security, aggregated analytics, improving content, contextual advertising.</li>
    <li><strong>Contract</strong> — responding to a request you made.</li>
    <li><strong>Legal obligation</strong> — tax, accounting or regulatory requests.</li>
  </ul>

  <h2>8. Sharing your information</h2>
  <p>We do not sell personal data. We share it only with:</p>
  <ul>
    <li><strong>Service providers</strong> who host the site, deliver email or provide analytics, under contracts restricting their use of your data.</li>
    <li><strong>Advertising partners</strong>, including Google, where advertising is enabled and you have consented.</li>
    <li><strong>Authorities</strong>, where legally required.</li>
  </ul>

  <h2>9. Retention</h2>
  <p>Contact messages are kept for up to 24 months. Newsletter data is kept until you unsubscribe. Analytics data is retained in aggregated form. Advertising data follows Google's own retention periods.</p>

  <h2>10. Your rights</h2>
  <p>Depending on your location, you may have the right to access, correct, delete, restrict or object to our use of your personal data, to data portability, and to withdraw consent. You may also lodge a complaint with your supervisory authority.</p>
  <p>To exercise any right, email <strong>privacy@aitoolscout.com</strong>. We respond within 30 days.</p>

  <h2>11. Children</h2>
  <p>This site is not directed at children under 13, and we do not knowingly collect data from them.</p>

  <h2>12. Changes to this policy</h2>
  <p>We will post any changes on this page and update the date below. Material changes will be highlighted prominently.</p>

  <h2>13. Contact</h2>
  <p>Privacy questions: <strong>privacy@aitoolscout.com</strong>. General contact via the <a href="/contact/">contact page</a>.</p>
</div>
`,
  },

  {
    path: "/terms/",
    title: "Terms of Service",
    description:
      "The terms governing your use of AI Tool Scout, including disclaimers, affiliate disclosure, intellectual property and liability limits.",
    nav: "Terms",
    hero: "Terms of service",
    lead: "The rules for using this website. Last updated 22 September 2026.",
    body: `
<div class="prose">
  <h2>1. Acceptance of terms</h2>
  <p>By accessing or using AI Tool Scout (the "Site"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Site.</p>

  <h2>2. About this site</h2>
  <p>The Site provides editorial content, comparisons, reviews and guides relating to artificial intelligence tools and related software. Content is provided for general information purposes only.</p>

  <h2>3. No professional advice</h2>
  <p>Nothing on this Site constitutes professional, legal, financial, medical or any other form of qualified advice. You should obtain independent professional advice where appropriate before acting on any information published here.</p>

  <h2>4. Accuracy of information</h2>
  <p>We aim for accuracy and review content regularly. Software pricing, features and limits change frequently. We make no warranty that any information is complete, current or error-free, and we are not obliged to update published content.</p>

  <h2>5. Affiliate disclosure</h2>
  <div class="callout callout-warn">
    <div class="callout-title">Disclosure</div>
    <p>The Site contains affiliate links. If you click a link and make a purchase, we may earn a commission at no additional cost to you. Commissions never influence our scores, rankings or conclusions, and we link to products we have reviewed regardless of whether an affiliate programme exists.</p>
  </div>

  <h2>6. Advertising</h2>
  <p>The Site may display third-party advertising, including through Google AdSense. Advertisements are not editorial recommendations. Any dealings you have with an advertiser are strictly between you and that advertiser.</p>

  <h2>7. Intellectual property</h2>
  <p>Unless otherwise stated, all content on the Site — including text, graphics, logos, comparisons and methodology — is our property and is protected by copyright. You may:</p>
  <ul>
    <li>View and read content for personal, non-commercial use.</li>
    <li>Share links to our articles.</li>
    <li>Quote short extracts with clear attribution and a link to the original.</li>
  </ul>
  <p>You may not republish full articles, redistribute content commercially, or present our methodology as your own without written permission.</p>

  <h2>8. Acceptable use</h2>
  <p>You agree not to:</p>
  <ul>
    <li>Use the Site for any unlawful purpose.</li>
    <li>Attempt to gain unauthorised access to the Site or its systems.</li>
    <li>Interfere with the Site's operation, including through automated scraping that degrades performance.</li>
    <li>Misrepresent your identity when contacting us.</li>
  </ul>

  <h2>9. Third-party links</h2>
  <p>The Site links to third-party websites we do not control. We are not responsible for their content, terms or privacy practices. Inclusion of a link is not an endorsement.</p>

  <h2>10. Limitation of liability</h2>
  <p>To the maximum extent permitted by law, the Site and its operators shall not be liable for any indirect, incidental, special or consequential damages, or any loss of profits, data or goodwill, arising from your use of or reliance on the Site.</p>
  <p>The Site is provided "as is" and "as available" without warranties of any kind, express or implied.</p>

  <h2>11. Indemnity</h2>
  <p>You agree to indemnify and hold harmless the Site's operators from any claim arising out of your misuse of the Site or your breach of these Terms.</p>

  <h2>12. Changes to these terms</h2>
  <p>We may update these Terms from time to time. Changes take effect when posted. Continued use of the Site after changes constitutes acceptance.</p>

  <h2>13. Governing law</h2>
  <p>These Terms are governed by applicable international law, without regard to conflict-of-law principles. If any provision is found unenforceable, the remainder stays in effect.</p>

  <h2>14. Contact</h2>
  <p>Questions about these Terms: <strong>legal@aitoolscout.com</strong>, or via the <a href="/contact/">contact page</a>.</p>
</div>
`,
  },

  {
    path: "/editorial-team/",
    title: "Editorial Team",
    description:
      "Who writes AI Tool Scout: Sarah Whitfield and Marcus Lindqvist, their backgrounds, and the rules every article must pass before it publishes.",
    nav: "Team",
    hero: "Editorial team",
    lead: "Two writers, one rubric, and a rule that no vendor gets a say in what we publish.",
    body: `
<div class="prose">
  <p>AI Tool Scout is written by two people who use these tools in their own work every week. There is no newsroom behind us, no syndication partner, and no model rewriting our drafts. Every article on this site carries one of the two names below, and that name is accountable for it.</p>

  <div class="author-box">
    <span class="avatar" aria-hidden="true">SW</span>
    <div>
      <h3>Sarah Whitfield</h3>
      <p><strong>Contributing editor.</strong> Sarah writes about writing tools, prompting, research workflows and the practical side of getting useful output from a language model. She spent eight years in content operations before covering this space, which is where the habit of checking a vendor's pricing page and terms of service before writing anything came from. She has published 16 articles on AI Tool Scout, including our comparisons of writing assistants and our prompt framework.</p>
    </div>
  </div>

  <div class="author-box">
    <span class="avatar" aria-hidden="true">ML</span>
    <div>
      <h3>Marcus Lindqvist</h3>
      <p><strong>Editor and analyst.</strong> Marcus covers model releases, agents, developer tooling, licensing and the cost of running AI systems. His background is in software engineering and technical evaluation, which is why the numbers in his articles come from provider documentation, published benchmarks and reproducible tests rather than from a launch post. He has published 14 articles on AI Tool Scout, including our agent and infrastructure pieces.</p>
    </div>
  </div>

  <h2>How we work</h2>
  <ol>
    <li><strong>Primary sources first.</strong> Pricing, limits, data policies and commercial rights come from the provider's own documentation, not from its marketing page.</li>
    <li><strong>One rubric for every tool.</strong> Comparisons score the same criteria: output quality, instruction following, reliability, workflow fit, and price against value.</li>
    <li><strong>Facts and opinion are separated.</strong> A documented fact is sourced. A judgment is marked as a judgment. A score is an editorial rating, explained inside the article.</li>
    <li><strong>Re-check on major releases.</strong> These products change monthly. When something significant ships, we re-check the affected claims and date the update.</li>
    <li><strong>No paid coverage.</strong> We do not accept payment for a review, a score or a placement — see the <a href="/about/">about page</a> for how the site is funded.</li>
  </ol>

  <div class="callout callout-info">
    <div class="callout-title">Corrections</div>
    <p>If you spot an error, an outdated price, or a claim you think we got wrong, <a href="/contact/">tell us</a>. We publish corrections openly at the bottom of the affected article rather than editing silently, and we credit the change.</p>
  </div>

  <p>Want to reach a specific person? Use the <a href="/contact/">contact page</a> and route it to Sarah or Marcus — we answer every substantive message.</p>
</div>
`,
  },
];
