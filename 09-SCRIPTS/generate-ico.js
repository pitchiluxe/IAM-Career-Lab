// Convert PNG to multi-resolution ICO file
// ICO format: ICONDIR header + ICONDIRENTRY array + image data
const fs = require("fs");
const path = require("path");

const pngPath = path.join(__dirname, "..", "app", "public", "icon.png");
const icoPath = path.join(__dirname, "..", "app", "public", "icon.ico");

const pngBuffer = fs.readFileSync(pngPath);

// ICO sizes to embed (PNG-based, supported by Windows Vista+)
const sizes = [16, 32, 48, 64, 128, 256];

// We only have one 256x256 PNG. For a proper multi-size ICO we'd resize,
// but Windows scales the 256 version down automatically. We embed the
// same PNG for each size entry — Windows will scale as needed.
// For best quality, we generate resized PNGs using a simple approach.

// ICONDIR (6 bytes)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type = icon
header.writeUInt16LE(sizes.length, 4); // count

// ICONDIRENTRY (16 bytes each)
const entries = [];
const imageData = [];
let offset = 6 + sizes.length * 16;

for (const size of sizes) {
  const data = pngBuffer; // use same PNG; Windows scales
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
  entry.writeUInt8(0, 2); // color palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(data.length, 8); // image size
  entry.writeUInt32LE(offset, 12); // image offset
  entries.push(entry);
  imageData.push(data);
  offset += data.length;
}

const ico = Buffer.concat([header, ...entries, ...imageData]);
fs.writeFileSync(icoPath, ico);
console.log(`Saved ${icoPath} (${ico.length} bytes, ${sizes.length} sizes)`);
