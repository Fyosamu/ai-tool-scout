/* Dev helper: prints h2 ids and basic SEO checks for each built article. */
const fs = require("fs");
const path = require("path");

const blogDir = path.join(__dirname, "dist", "blog");
const dirs = fs
  .readdirSync(blogDir, { withFileTypes: true })
  .filter((d) => d.isDirectory());

for (const d of dirs) {
  const file = path.join(blogDir, d.name, "index.html");
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, "utf8");

  const ids = [...html.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
  const hasOg = html.includes('property="og:title"');
  const hasLd = html.includes('application/ld+json');
  const hasCanon = html.includes('rel="canonical"');
  const hasBreadcrumbLd = html.includes("BreadcrumbList");
  const titleLen = (html.match(/<title>(.*?)<\/title>/) || ["", ""])[1].length;
  const descLen = (
    html.match(/<meta name="description" content="(.*?)"/) || ["", ""]
  )[1].length;

  const flags = [];
  if (dupes.length) flags.push("DUP IDS: " + dupes.join(","));
  if (!hasOg) flags.push("no og:");
  if (!hasLd) flags.push("no JSON-LD");
  if (!hasCanon) flags.push("no canonical");
  if (!hasBreadcrumbLd) flags.push("no breadcrumb");
  if (titleLen > 65) flags.push("title long " + titleLen);
  if (descLen < 70 || descLen > 170) flags.push("desc len " + descLen);

  console.log(
    d.name.padEnd(36),
    `${ids.length} h2`.padEnd(8),
    `T:${titleLen}`.padEnd(6),
    `D:${descLen}`.padEnd(7),
    flags.length ? "✗ " + flags.join(" | ") : "✓"
  );
}
