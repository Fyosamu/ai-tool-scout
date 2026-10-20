"use strict";
const fs = require("fs");
const path = require("path");
const src = path.join(require("os").tmpdir(), "opencode", "blog1-section.txt");
let s = fs.readFileSync(src, "utf8").replace(/^\uFEFF/, "");
const m = s.match(/<b:section[\s\S]*<\/b:section>/);
if (!m) { console.error("no section found"); process.exit(1); }
const html = m[0];
const out = path.join(__dirname, "content", "blog1-section.json");
fs.writeFileSync(out, JSON.stringify({ html }));
console.log("ok len=" + html.length +
  " hasMaincontent=" + html.includes("id='maincontent'") +
  " hasInclude=" + html.includes("b:include") +
  " endsOk=" + html.trimEnd().endsWith("</b:section>"));
