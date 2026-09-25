"use strict";
/**
 * Generates logo.png (512x512) and og-default.png (1200x630)
 * using only Node's built-in zlib — no image dependencies.
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

/* ---------------- CRC32 ---------------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/** Build a PNG from an RGBA pixel buffer. */
function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type: RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------------- Drawing helpers ---------------- */

function makeCanvas(w, h) {
  return { w, h, buf: Buffer.alloc(w * h * 4) };
}

function px(c, x, y, r, g, b, a) {
  x = x | 0;
  y = y | 0;
  if (x < 0 || y < 0 || x >= c.w || y >= c.h || a <= 0) return;
  const i = (y * c.w + x) * 4;
  const na = a / 255;
  const oa = c.buf[i + 3] / 255;
  const outA = na + oa * (1 - na);
  if (outA <= 0) return;
  c.buf[i]     = Math.round((r * na + c.buf[i] * oa * (1 - na)) / outA);
  c.buf[i + 1] = Math.round((g * na + c.buf[i + 1] * oa * (1 - na)) / outA);
  c.buf[i + 2] = Math.round((b * na + c.buf[i + 2] * oa * (1 - na)) / outA);
  c.buf[i + 3] = Math.round(outA * 255);
}

/** Vertical/diagonal gradient fill. */
function fillGradient(c, stops) {
  for (let y = 0; y < c.h; y++) {
    const t = y / (c.h - 1);
    const col = lerpStops(stops, t);
    for (let x = 0; x < c.w; x++) px(c, x, y, col[0], col[1], col[2], 255);
  }
}

function lerpStops(stops, t) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (t >= p0 && t <= p1) {
      const k = p1 === p0 ? 0 : (t - p0) / (p1 - p0);
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * k),
        Math.round(c0[1] + (c1[1] - c0[1]) * k),
        Math.round(c0[2] + (c1[2] - c0[2]) * k),
      ];
    }
  }
  return stops[stops.length - 1][1];
}

/** Rounded rectangle with optional radius per corner. */
function roundRect(c, x, y, w, h, r, rG, b, a) {
  const rr = Array.isArray(r) ? r : [r, r, r, r];
  for (let py = y; py < y + h; py++) {
    for (let pxX = x; pxX < x + w; pxX++) {
      const dx0 = pxX - x;
      const dy0 = py - y;
      const dx1 = x + w - 1 - pxX;
      const dy1 = y + h - 1 - py;
      let inside = true;
      if (dx0 < rr[0] && dy0 < rr[0]) inside = (rr[0] - dx0) ** 2 + (rr[0] - dy0) ** 2 <= rr[0] ** 2;
      if (inside && dx1 < rr[1] && dy0 < rr[1]) inside = (rr[1] - dx1) ** 2 + (rr[1] - dy0) ** 2 <= rr[1] ** 2;
      if (inside && dx1 < rr[2] && dy1 < rr[2]) inside = (rr[2] - dx1) ** 2 + (rr[2] - dy1) ** 2 <= rr[2] ** 2;
      if (inside && dx0 < rr[3] && dy1 < rr[3]) inside = (rr[3] - dx0) ** 2 + (rr[3] - dy1) ** 2 <= rr[3] ** 2;
      if (inside) px(c, pxX, py, rG, b, a === undefined ? 255 : a);
    }
  }
}

/** Thick line with round caps (for the check mark / hex edges). */
function line(c, x0, y0, x1, y1, width, r, g, b, a) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
  const half = width / 2;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = x0 + (x1 - x0) * t;
    const cy = y0 + (y1 - y0) * t;
    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        if (dx * dx + dy * dy <= half * half) {
          const edge = Math.sqrt(dx * dx + dy * dy);
          const alpha = edge > half - 1 ? Math.max(0, (half - edge)) * 255 : a;
          px(c, cx + dx, cy + dy, r, g, b, alpha);
        }
      }
    }
  }
}

/* ---------------- Logo ---------------- */
function drawLogo(size) {
  const c = makeCanvas(size, size);
  fillGradient(c, [[0, [10, 15, 28]], [1, [7, 11, 20]]]);

  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.31;

  // Hexagon vertices (pointy-top)
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI / 180) * (60 * i - 90);
    pts.push([cx + R * Math.cos(ang), cy + R * Math.sin(ang)]);
  }

  // Gradient stroke colour, sampled along the hexagon
  for (let i = 0; i < 6; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % 6];
    const t = i / 6;
    const col = lerpStops(
      [[0, [79, 140, 255]], [0.55, [34, 211, 238]], [1, [167, 139, 250]]],
      t
    );
    line(c, ax, ay, bx, by, size * 0.045, col[0], col[1], col[2], 255);
  }

  // Check mark
  const s = size * 0.045;
  const col = lerpStops([[0, [79, 140, 255]], [1, [34, 211, 238]]], 0.5);
  line(c, cx - R * 0.44, cy + R * 0.02, cx - R * 0.08, cy + R * 0.38, s, col[0], col[1], col[2], 255);
  line(c, cx - R * 0.08, cy + R * 0.38, cx + R * 0.5, cy - R * 0.42, s, col[0], col[1], col[2], 255);

  return encodePNG(size, size, c.buf);
}

/* ---------------- OG image (1200x630) ---------------- */
function drawOG() {
  const W = 1200;
  const H = 630;
  const c = makeCanvas(W, H);

  fillGradient(c, [[0, [12, 18, 34]], [0.55, [8, 12, 23]], [1, [6, 9, 17]]]);

  // Ambient glows
  function glow(cx, cy, rad, r, g, b, strength) {
    const x0 = Math.max(0, cx - rad), x1 = Math.min(W - 1, cx + rad);
    const y0 = Math.max(0, cy - rad), y1 = Math.min(H - 1, cy + rad);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d > rad) continue;
        const f = (1 - d / rad) ** 2 * strength;
        const i = (y * W + x) * 4;
        c.buf[i]     = Math.min(255, c.buf[i] + r * f);
        c.buf[i + 1] = Math.min(255, c.buf[i + 1] + g * f);
        c.buf[i + 2] = Math.min(255, c.buf[i + 2] + b * f);
      }
    }
  }
  glow(150, 60, 620, 79, 140, 255, 0.36);
  glow(1080, 90, 540, 167, 139, 250, 0.30);
  glow(600, 640, 560, 34, 211, 238, 0.20);

  // Logo mark, top-left
  const mark = 96;
  const mx = 90, my = 84;
  const cx = mx + mark / 2, cy = my + mark / 2;
  const R = mark * 0.36;
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI / 180) * (60 * i - 90);
    pts.push([cx + R * Math.cos(ang), cy + R * Math.sin(ang)]);
  }
  for (let i = 0; i < 6; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % 6];
    const col = lerpStops([[0, [79, 140, 255]], [0.55, [34, 211, 238]], [1, [167, 139, 250]]], i / 6);
    line(c, ax, ay, bx, by, 7, col[0], col[1], col[2], 255);
  }
  const sc = lerpStops([[0, [79, 140, 255]], [1, [34, 211, 238]]], 0.5);
  line(c, cx - R * 0.44, cy + R * 0.02, cx - R * 0.08, cy + R * 0.38, 7, sc[0], sc[1], sc[2], 255);
  line(c, cx - R * 0.08, cy + R * 0.38, cx + R * 0.5, cy - R * 0.42, 7, sc[0], sc[1], sc[2], 255);

  // Pill: site name next to mark
  roundRect(c, 204, my + 24, 268, 48, 24, 255, 255, 255);
  drawText(c, 232, my + 56, "AI TOOL SCOUT", 21, [7, 11, 20], 700);

  // Headline — two lines, drawn with a built-in bitmap font
  drawText(c, 90, 300, "Find the right AI tool", 66, [255, 255, 255], 800);
  drawText(c, 90, 384, "in minutes, not weeks.", 66, [79, 140, 255], 800);

  // Sub-line
  drawText(c, 90, 470, "Honest reviews  ·  Real benchmarks  ·  Clear verdicts", 27, [154, 168, 196], 500);

  // Accent bar
  roundRect(c, 90, 540, 160, 5, 3, 34, 211, 238);

  return encodePNG(W, H, c.buf);
}

/* ---------------- 5x7 bitmap font ---------------- */
const GLYPHS = {
  A:["01110","10001","10001","11111","10001","10001","10001"],
  B:["11110","10001","10001","11110","10001","10001","11110"],
  C:["01110","10001","10000","10000","10000","10001","01110"],
  D:["11110","10001","10001","10001","10001","10001","11110"],
  E:["11111","10000","10000","11110","10000","10000","11111"],
  F:["11111","10000","10000","11110","10000","10000","10000"],
  G:["01110","10001","10000","10111","10001","10001","01111"],
  H:["10001","10001","10001","11111","10001","10001","10001"],
  I:["11111","00100","00100","00100","00100","00100","11111"],
  J:["00111","00010","00010","00010","00010","10010","01100"],
  K:["10001","10010","10100","11000","10100","10010","10001"],
  L:["10000","10000","10000","10000","10000","10000","11111"],
  M:["10001","11011","10101","10101","10001","10001","10001"],
  N:["10001","11001","10101","10011","10001","10001","10001"],
  O:["01110","10001","10001","10001","10001","10001","01110"],
  P:["11110","10001","10001","11110","10000","10000","10000"],
  Q:["01110","10001","10001","10001","10101","10010","01101"],
  R:["11110","10001","10001","11110","10100","10010","10001"],
  S:["01111","10000","10000","01110","00001","00001","11110"],
  T:["11111","00100","00100","00100","00100","00100","00100"],
  U:["10001","10001","10001","10001","10001","10001","01110"],
  V:["10001","10001","10001","10001","10001","01010","00100"],
  W:["10001","10001","10001","10101","10101","11011","10001"],
  X:["10001","10001","01010","00100","01010","10001","10001"],
  Y:["10001","10001","01010","00100","00100","00100","00100"],
  Z:["11111","00001","00010","00100","01000","10000","11111"],
  "0":["01110","10001","10011","10101","11001","10001","01110"],
  "1":["00100","01100","00100","00100","00100","00100","01110"],
  "2":["01110","10001","00001","00110","01000","10000","11111"],
  "3":["11110","00001","00001","01110","00001","00001","11110"],
  "4":["00010","00110","01010","10010","11111","00010","00010"],
  "5":["11111","10000","11110","00001","00001","10001","01110"],
  "6":["01110","10000","11110","10001","10001","10001","01110"],
  "7":["11111","00001","00010","00100","01000","01000","01000"],
  "8":["01110","10001","10001","01110","10001","10001","01110"],
  "9":["01110","10001","10001","01111","00001","00001","01110"],
  " ":["00000","00000","00000","00000","00000","00000","00000"],
  "-":["00000","00000","00000","11111","00000","00000","00000"],
  ".":["00000","00000","00000","00000","00000","01100","01100"],
  ",":["00000","00000","00000","00000","01100","00100","01000"],
  ":":["00000","01100","01100","00000","01100","01100","00000"],
  "·":["00000","00000","01100","01100","00000","00000","00000"],
  "·2":["00000","00000","01100","01100","00000","00000","00000"],
  "/":["00001","00010","00010","00100","01000","01000","10000"],
  "(":["00010","00100","01000","01000","01000","00100","00010"],
  ")":["01000","00100","00010","00010","00010","00100","01000"],
  "&":["01100","10010","10100","01000","10101","10010","01101"],
  "!":["00100","00100","00100","00100","00100","00000","00100"],
  "?":["01110","10001","00001","00110","00100","00000","00100"],
};

/** Draw uppercase text using the 5x7 bitmap font, scaled to `size` px per glyph height. */
function drawText(c, x, y, text, size, rgb, weight) {
  const scale = Math.max(1, Math.round(size / 7));
  const gw = 5 * scale;
  const gap = Math.round(scale * 1.4);
  const bold = weight >= 700;

  let cx = x;
  const str = text.toUpperCase();

  for (const chRaw of str) {
    let ch = chRaw;
    if (chRaw === "—") ch = "-";
    const g = GLYPHS[ch] || GLYPHS[ch.toLowerCase()] || GLYPHS["?"];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (g[row][col] === "1") {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              px(c, cx + col * scale + sx, y - size + row * scale + sy, rgb[0], rgb[1], rgb[2], 255);
              if (bold) {
                px(c, cx + col * scale + sx + 1, y - size + row * scale + sy, rgb[0], rgb[1], rgb[2], 255);
              }
            }
          }
        }
      }
    }
    cx += gw + gap + (bold ? scale : 0);
  }
  return cx - x;
}

/* ---------------- Output ---------------- */
const out = path.join(__dirname, "public");

fs.writeFileSync(path.join(out, "logo.png"), drawLogo(512));
console.log("✓ logo.png (512x512)");

fs.writeFileSync(path.join(out, "og-default.png"), drawOG());
console.log("✓ og-default.png (1200x630)");

fs.writeFileSync(path.join(out, "apple-touch-icon.png"), drawLogo(180));
console.log("✓ apple-touch-icon.png (180x180)");

// favicon.ico fallback: reuse the 512 png (browsers accept PNG favicons via <link>)
console.log("▸ Done");
