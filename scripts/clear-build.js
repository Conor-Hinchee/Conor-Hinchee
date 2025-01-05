"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const PATHS_TO_REMOVE = [
    "/now",
    "/blog",
    "/Conor-Hinchee/blocking.bundle.js",
    "/Conor-Hinchee/index.bundle.js",
    "/Conor-Hinchee/main.css",
    "/index.html"
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const confirmDelete = () => {
    return new Promise((resolve) => {
        rl.question("Are you sure you want to clear the build? (y/N) ", (answer) => {
            resolve(answer.toLowerCase() === "y");
            rl.close();
        });
    });
};

const removeFile = async (filePath) => {
    try {
        const fullPath = path.join(__dirname, "..", "dist", filePath);
        console.log(`Removing: ${fullPath}`);
        const exists = await fs.promises.access(fullPath)
            .then(() => true)
            .catch(() => false);

        if (!exists) {
            console.log(`Skipping ${filePath} - not found`);
            return;
        }

        const stats = await fs.promises.stat(fullPath);
        if (stats.isDirectory()) {
            await fs.promises.rm(fullPath, { recursive: true, force: true });
        } else {
            await fs.promises.unlink(fullPath);
        }
        console.log(`Removed: ${filePath}`);
    } catch (err) {
        console.error(`Error removing ${filePath}:`, err);
    }
};

const reset = async () => {
    const confirmed = await confirmDelete();
    if (!confirmed) {
        console.log("Operation cancelled");
        return;
    }

    console.log("Starting cleanup...");
    await Promise.all(PATHS_TO_REMOVE.map(removeFile));
    console.log("Cleanup complete");
};

reset();

