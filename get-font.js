/* Downloads the Latin subset of Inter from Google Fonts and reports sizes. */
const fs = require("fs");
const path = require("path");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function main() {
  const cssUrl =
    "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap&subset=latin";

  const cssRes = await fetch(cssUrl, { headers: { "User-Agent": UA } });
  const css = await cssRes.text();

  // Google returns one @font-face block per subset. Pick the "latin" block.
  const blocks = css.split("@font-face");
  let latinUrl = null;
  for (const b of blocks) {
    if (!/unicode-range:\s*U\+0000-00FF/.test(b)) continue;
    const m = b.match(/url\((https:[^)]+\.woff2)\)/);
    if (m) {
      latinUrl = m[1];
      break;
    }
  }

  if (!latinUrl) {
    console.error("✗ Could not find the latin woff2 URL. CSS was:");
    console.error(css.slice(0, 1500));
    process.exit(1);
  }

  console.log("→ Fetching latin subset…");
  const fontRes = await fetch(latinUrl, { headers: { "User-Agent": UA } });
  const buf = Buffer.from(await fontRes.arrayBuffer());

  const target = path.join(__dirname, "public", "assets", "fonts", "inter-var.woff2");
  const before = fs.existsSync(target) ? fs.statSync(target).size : 0;
  fs.writeFileSync(target, buf);

  console.log(`  before: ${(before / 1024).toFixed(1)} KB`);
  console.log(`  after:  ${(buf.length / 1024).toFixed(1)} KB`);
  if (before) console.log(`  saved:  ${((before - buf.length) / 1024).toFixed(1)} KB`);
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
