"use strict";
/** Zero-dependency static preview server for the /dist build. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "dist");
const PORT = process.env.PORT || 4173;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

function send(res, status, body, type, extra) {
  res.writeHead(status, Object.assign({ "Content-Type": type }, extra || {}));
  res.end(body);
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath.endsWith("/")) urlPath += "index.html";

  let filePath = path.join(DIST, urlPath);
  if (!filePath.startsWith(DIST)) return send(res, 403, "Forbidden", "text/plain");

  // Directory-style URLs → index.html
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const withIndex = path.join(filePath, "index.html");
    if (fs.existsSync(withIndex)) filePath = withIndex;
  }

  if (!fs.existsSync(filePath)) {
    const notFound = path.join(DIST, "404.html");
    const body = fs.existsSync(notFound)
      ? fs.readFileSync(notFound)
      : "404 Not Found";
    return send(res, 404, body, "text/html; charset=utf-8");
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    const idx = path.join(filePath, "index.html");
    if (fs.existsSync(idx)) {
      return send(res, 200, fs.readFileSync(idx), "text/html; charset=utf-8");
    }
    return send(res, 404, "404 Not Found", "text/plain");
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = TYPES[ext] || "application/octet-stream";
  // Only truly fingerprinted assets may be immutable; everything else revalidates.
  const cache =
    ext === ".html" || ext === ".xml" || ext === ".txt"
      ? "no-cache"
      : /\.(css|js|svg|png|woff2)$/.test(ext)
      ? "public, max-age=3600, must-revalidate"
      : "public, max-age=3600";

  send(res, 200, fs.readFileSync(filePath), type, { "Cache-Control": cache });
});

server.listen(PORT, () => {
  console.log(`▸ Preview: http://localhost:${PORT}`);
});
