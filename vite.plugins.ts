import fs from "node:fs";
import path from "node:path";
import { build as esbuild } from "esbuild";
import posthtml from "posthtml";
import posthtmlModules from "posthtml-modules";
import htmlnano from "htmlnano";
import type { Connect, Plugin, ViteDevServer } from "vite";

const reloadOnChange = (
  server: ViteDevServer,
  matches: (file: string) => boolean,
) => {
  server.watcher.on("change", (file) => {
    if (matches(file)) server.ws.send({ type: "full-reload" });
  });
};

// GitHub Pages redirects /blog to /blog/. Vite's MPA mode 404s instead, so
// mirror Pages in dev and preview.
const redirectToDirectory =
  (dir: () => string): Connect.NextHandleFunction =>
  (req, res, next) => {
    const [pathname = "/", query] = (req.url ?? "/").split("?");
    if (
      !pathname.endsWith("/") &&
      fs.existsSync(path.join(dir(), pathname, "index.html"))
    ) {
      res.writeHead(301, {
        Location: `${pathname}/${query ? `?${query}` : ""}`,
      });
      res.end();
      return;
    }
    next();
  };

export const trailingSlash = (): Plugin => {
  let root = "";
  let outDir = "";
  return {
    name: "trailing-slash",
    configResolved: (config) => {
      root = config.root;
      outDir = path.resolve(config.root, config.build.outDir);
    },
    configureServer: (server) => {
      server.middlewares.use(redirectToDirectory(() => root));
    },
    configurePreviewServer: (server) => {
      server.middlewares.use(redirectToDirectory(() => outDir));
    },
  };
};

// Expands <module href="/components/x.html"> partials before Vite parses the
// page, so the <script>/<link> tags inside them get bundled and hashed. The
// partials aren't in Vite's module graph, so edits to them trigger a reload.
export const htmlPartials = (root: string): Plugin => {
  const componentsDir = path.join(root, "components");
  return {
    name: "html-partials",
    transformIndexHtml: {
      order: "pre",
      handler: async (html) => {
        const result = await posthtml([
          posthtmlModules({ root, initial: true }),
        ]).process(html);
        return result.html;
      },
    },
    configureServer: (server) => {
      server.watcher.add(componentsDir);
      reloadOnChange(server, (file) => file.startsWith(componentsDir));
    },
  };
};

// Minifies the final HTML. Vite leaves HTML untouched, and the old posthtml
// pipeline ran htmlnano on every page.
export const minifyHtml = (): Plugin => ({
  name: "minify-html",
  apply: "build",
  transformIndexHtml: {
    order: "post",
    handler: async (html) =>
      (await htmlnano.process(html, {}, htmlnano.presets.safe)).html,
  },
});

// Bundles <script inline src="..."> into a classic synchronous <script> in
// place. Module scripts are always deferred, but this one has to run before
// first paint (dark mode) and before GTM (consent defaults).
const INLINE_SCRIPT =
  /<script\b[^>]*\binline\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g;

export const inlineBlockingScript = (root: string): Plugin => {
  const inputs = new Set<string>();
  let minify = false;
  return {
    name: "inline-blocking-script",
    configResolved: (config) => {
      minify = config.command === "build";
    },
    transformIndexHtml: {
      order: "pre",
      handler: async (html) => {
        const matches = [...html.matchAll(INLINE_SCRIPT)];
        for (const [tag, src = ""] of matches) {
          const result = await esbuild({
            entryPoints: [path.join(root, src)],
            bundle: true,
            format: "iife",
            target: "es2020",
            minify,
            write: false,
            metafile: true,
          });
          Object.keys(result.metafile.inputs).forEach((input) =>
            inputs.add(path.resolve(input)),
          );
          const [output] = result.outputFiles;
          if (!output) throw new Error(`esbuild produced no output for ${src}`);
          const code = output.text
            .trim()
            .replaceAll("</script", "<\\/script");
          html = html.replace(tag, `<script>${code}</script>`);
        }
        return html;
      },
    },
    configureServer: (server) =>
      reloadOnChange(server, (file) => inputs.has(file)),
  };
};
