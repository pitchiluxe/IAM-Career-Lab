// Copy static files into the Next.js standalone directory (required for standalone mode)
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const standaloneDir = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const staticDst = path.join(standaloneDir, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDst = path.join(standaloneDir, "public");

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

copyDir(staticSrc, staticDst);
copyDir(publicSrc, publicDst);
console.log("Copied .next/static and public/ into .next/standalone/");
