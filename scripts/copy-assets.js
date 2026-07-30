"use strict";

// Copies version-controlled static assets (resume PDFs/JSONs, etc.) from
// src/assets/ into the build output at dist/. Runs as part of `npm run build`
// via the build:assets script so the assets survive fresh CI checkouts where
// dist/ does not exist.

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "src", "assets");
const DEST_DIR = path.join(__dirname, "..", "dist");

const copyDir = (src, dest) => {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${path.relative(SRC_DIR, srcPath)}`);
        }
    }
};

if (!fs.existsSync(SRC_DIR)) {
    console.log("No src/assets directory found - nothing to copy.");
    process.exit(0);
}

copyDir(SRC_DIR, DEST_DIR);
console.log("Asset copy complete.");
