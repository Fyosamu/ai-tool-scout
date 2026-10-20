"use strict";
/**
 * Tiny static file server for blogger/content/ on 127.0.0.1:8899 with CORS
 * headers, so the automation sandbox can fetch JSON payloads via fetch().
 *
 * Run: node blogger/serve-content.js
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "content");
const PORT = 8899;

http.createServer((req, res) => {
  const name = path.basename(String(req.url).split("?")[0]);
  const file = path.join(DIR, name);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  if (!/^[\w.-]+\.json$/.test(name) || !fs.existsSync(file)) {
    res.writeHead(404, {"Content-Type": "text/plain"});
    res.end("not found");
    return;
  }
  const body = fs.readFileSync(file);
  res.writeHead(200, {"Content-Type": "application/json; charset=utf-8", "Content-Length": body.length});
  res.end(body);
}).listen(PORT, "127.0.0.1", () => console.log(`content server on http://127.0.0.1:${PORT}`));
