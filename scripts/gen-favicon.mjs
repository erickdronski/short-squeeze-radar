/**
 * Generate the branded favicon set from app/icon.svg (the radar mark).
 * Run: node scripts/gen-favicon.mjs
 *
 * Produces:
 *   app/favicon.ico   — multi-size (16/32/48) PNG-in-ICO, replaces the Next default
 *   app/apple-icon.png — 180x180 for iOS home screen
 * (app/icon.svg is served directly to modern browsers by Next's App Router.)
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";

const svg = readFileSync(new URL("../app/icon.svg", import.meta.url));
// High density so the rasterizer renders a large base, then we downscale crisply.
const render = (size) => sharp(svg, { density: 1024 }).resize(size, size).png().toBuffer();

const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map(render));

// Pack PNGs into an ICO container (PNG-encoded entries — supported everywhere).
const count = pngs.length;
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type = icon
header.writeUInt16LE(count, 4);

const dir = Buffer.alloc(count * 16);
let offset = 6 + count * 16;
pngs.forEach((png, i) => {
  const s = sizes[i];
  const e = i * 16;
  dir.writeUInt8(s >= 256 ? 0 : s, e + 0); // width (0 = 256)
  dir.writeUInt8(s >= 256 ? 0 : s, e + 1); // height
  dir.writeUInt8(0, e + 2); // palette
  dir.writeUInt8(0, e + 3); // reserved
  dir.writeUInt16LE(1, e + 4); // color planes
  dir.writeUInt16LE(32, e + 6); // bits per pixel
  dir.writeUInt32LE(png.length, e + 8); // size of image data
  dir.writeUInt32LE(offset, e + 12); // offset
  offset += png.length;
});

const ico = Buffer.concat([header, dir, ...pngs]);
writeFileSync(new URL("../app/favicon.ico", import.meta.url), ico);

const apple = await sharp(svg, { density: 1024 }).resize(180, 180).png().toBuffer();
writeFileSync(new URL("../app/apple-icon.png", import.meta.url), apple);

console.log(`favicon.ico: ${ico.length} bytes (${count} sizes) + apple-icon.png (180) written`);
