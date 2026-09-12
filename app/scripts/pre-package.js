// Pre-package script: copies the Next.js standalone build into electron/build/
// This avoids electron-builder skipping dot-directories (.next) inside extraResources
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const standaloneSrc = path.join(root, ".next", "standalone");
const buildDir = path.join(root, "electron", "build", "app");

function copyDir(src, dst) {
  if (!fs.existsSync(src)) {
    console.error("Source not found:", src);
    process.exit(1);
  }
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    // Skip electron and release dirs if present
    if (entry.name === "electron" || entry.name === "release") continue;
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// Clean build dir
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true, force: true });
}

// Copy standalone (includes .next/, node_modules/, public/, server.js, package.json)
console.log("Copying standalone to electron/build/app/...");
copyDir(standaloneSrc, buildDir);

// Verify .next directory was copied
const nextDir = path.join(buildDir, ".next");
if (fs.existsSync(nextDir)) {
  console.log("✓ .next directory copied successfully");
  const staticDir = path.join(nextDir, "static");
  if (fs.existsSync(staticDir)) {
    console.log("✓ .next/static directory present");
  } else {
    console.error("✗ .next/static directory MISSING");
  }
} else {
  console.error("✗ .next directory MISSING — server will fail!");
  process.exit(1);
}

// Verify public directory
const publicDir = path.join(buildDir, "public");
if (fs.existsSync(publicDir)) {
  console.log("✓ public directory present");
} else {
  console.error("✗ public directory MISSING");
}

// Verify server.js
const serverFile = path.join(buildDir, "server.js");
if (fs.existsSync(serverFile)) {
  console.log("✓ server.js present");
} else {
  console.error("✗ server.js MISSING");
  process.exit(1);
}

console.log("Pre-package copy complete.");
