import { test, expect } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:3000";

// Every same-origin file a page references (favicons, stylesheets, scripts,
// images) must exist in the build. Catches assets that are linked in the HTML
// but never make it into dist/, like the favicon that 404'd on every page.

for (const path of ["/", "/blog/?post=latest", "/now/"]) {
  test(`all local assets referenced by ${path} exist`, async ({ page, request }) => {
    await page.route(
      /googletagmanager\.com|fontawesome\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|jsdelivr\.net|\/browser-sync\//,
      (route) => route.abort()
    );
    await page.goto(`${BASE_URL}${path}`);

    const refs = await page.evaluate(() =>
      [
        ...[...document.querySelectorAll("link[href]")].map((el) => el.getAttribute("href")),
        ...[...document.querySelectorAll("script[src], img[src]")].map((el) => el.getAttribute("src")),
      ].filter((ref) => ref && ref.startsWith("/") && !ref.startsWith("//") && !ref.includes("browser-sync"))
    );
    expect(refs.length).toBeGreaterThan(0);

    const missing = [];
    for (const ref of new Set(refs)) {
      const res = await request.get(`${BASE_URL}${ref}`);
      if (res.status() !== 200) missing.push(`${ref} -> ${res.status()}`);
    }
    expect(missing).toEqual([]);
  });
}

test("favicons are declared on every page", async ({ request }) => {
  for (const path of ["/", "/blog/", "/now/"]) {
    const html = await (await request.get(`${BASE_URL}${path}`)).text();
    expect(html, path).toMatch(/rel="?icon"?[^>]*odin-favicon\.svg/);
    expect(html, path).toMatch(/rel="?apple-touch-icon"?/);
  }
});
