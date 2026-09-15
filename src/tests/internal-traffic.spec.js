import { test, expect } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:3000";
const DISABLE_FLAG = "ga-disable-G-0440Q7V3FG";

test.beforeEach(async ({ page, context }) => {
  await page.route(
    /googletagmanager\.com|fontawesome\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|jsdelivr\.net|\/browser-sync\//,
    (route) => route.abort()
  );
  await context.addCookies([{ name: "consent_v2", value: "granted", url: BASE_URL }]);
  // Record the flag as soon as the document is parsed, to prove the blocking
  // script sets it before GTM would have loaded.
  await page.addInitScript((flag) => {
    window.__flagAtParse = null;
    document.addEventListener("DOMContentLoaded", () => {
      window.__flagAtParse = window[flag];
    });
  }, DISABLE_FLAG);
});

const state = (page) =>
  page.evaluate(
    ([flag, key]) => ({
      disabled: window[flag],
      disabledAtParse: window.__flagAtParse,
      stored: localStorage.getItem(key),
    }),
    [DISABLE_FLAG, "analytics_opt_out"]
  );

test("analytics is on by default", async ({ page }) => {
  await page.goto(BASE_URL);
  expect(await state(page)).toEqual({ disabled: false, disabledAtParse: false, stored: null });
});

test("?internal=1 turns analytics off and remembers it", async ({ page }) => {
  const logs = [];
  page.on("console", (msg) => logs.push(msg.text()));

  await page.goto(`${BASE_URL}/?internal=1`);
  expect(await state(page)).toEqual({ disabled: true, disabledAtParse: true, stored: "1" });
  expect(logs.join(" ")).toContain("Analytics off for this browser");

  // Still off on a later visit with no parameter, and set before GTM loads.
  await page.goto(BASE_URL);
  expect(await state(page)).toEqual({ disabled: true, disabledAtParse: true, stored: "1" });
});

test("?internal=0 turns it back on", async ({ page }) => {
  await page.goto(`${BASE_URL}/?internal=1`);
  await page.goto(`${BASE_URL}/?internal=0`);
  expect(await state(page)).toEqual({ disabled: false, disabledAtParse: false, stored: null });

  await page.goto(BASE_URL);
  expect(await state(page)).toEqual({ disabled: false, disabledAtParse: false, stored: null });
});

test("the opt-out applies on every page", async ({ page }) => {
  await page.goto(`${BASE_URL}/?internal=1`);
  for (const path of ["/blog/", "/now/"]) {
    await page.goto(`${BASE_URL}${path}`);
    const { disabled, disabledAtParse } = await state(page);
    expect(disabled, path).toBe(true);
    expect(disabledAtParse, path).toBe(true);
  }
});
