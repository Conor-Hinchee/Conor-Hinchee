import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import {
  htmlPartials,
  inlineBlockingScript,
  minifyHtml,
  trailingSlash,
} from "./vite.plugins.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src");
const port = Number(process.env.PORT) || 3000;

export default defineConfig({
  root,
  appType: "mpa",
  // Served at the site root and copied as-is: /images, /blog/content, resume
  publicDir: "assets",
  plugins: [
    tailwindcss(),
    trailingSlash(),
    htmlPartials(root),
    inlineBlockingScript(root),
    minifyHtml(),
  ],
  server: { port, strictPort: true, host: "127.0.0.1" },
  preview: { port, strictPort: true, host: "127.0.0.1" },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: path.join(root, "index.html"),
        blog: path.join(root, "blog/index.html"),
        now: path.join(root, "now/index.html"),
      },
    },
  },
});
