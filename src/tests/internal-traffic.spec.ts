import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const DISABLE_FLAG = "ga-disable-G-0440Q7V3FG";

// Google's opt-out flag (as typed in src/types/global.d.ts, which this config
// doesn't include) plus the value this spec records at parse time.
type FlagWindow = Window &
  Partial<Record<typeof DISABLE_FLAG, boolean>> & { __flagAtParse?: boolean | null };

test.beforeEach(async ({ page, context, baseURL }) => {
  await page.route(
    /googletagmanager\.com|fontawesome\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|jsdelivr\.net|\/browser-sync\//,
    (route) => route.abort()
  );
  await context.addCookies([{ name: "consent_v2", value: "granted", url: baseURL }]);
  // Record the flag as soon as the document is parsed, to prove the blocking
  // script sets it before GTM would have loaded.
  await page.addInitScript<typeof DISABLE_FLAG>((flag) => {
    const win = window as FlagWindow;
    win.__flagAtParse = null;
    document.addEventListener("DOMContentLoaded", () => {
      win.__flagAtParse = win[flag];
    });
  }, DISABLE_FLAG);
});

const state = (page: Page) =>
  page.evaluate(
    ([flag, key]) => ({
      disabled: (window as FlagWindow)[flag],
      disabledAtParse: (window as FlagWindow).__flagAtParse,
      stored: localStorage.getItem(key),
    }),
    [DISABLE_FLAG, "analytics_opt_out"] as const
  );

test("analytics is on by default", async ({ page }) => {
  await page.goto("/");
  expect(await state(page)).toEqual({ disabled: false, disabledAtParse: false, stored: null });
});

test("?internal=1 turns analytics off and remembers it", async ({ page }) => {
  const logs: string[] = [];
  page.on("console", (msg) => logs.push(msg.text()));

  await page.goto("/?internal=1");
  expect(await state(page)).toEqual({ disabled: true, disabledAtParse: true, stored: "1" });
  expect(logs.join(" ")).toContain("Analytics off for this browser");

  // Still off on a later visit with no parameter, and set before GTM loads.
  await page.goto("/");
  expect(await state(page)).toEqual({ disabled: true, disabledAtParse: true, stored: "1" });
});

test("?internal=0 turns it back on", async ({ page }) => {
  await page.goto("/?internal=1");
  await page.goto("/?internal=0");
  expect(await state(page)).toEqual({ disabled: false, disabledAtParse: false, stored: null });

  await page.goto("/");
  expect(await state(page)).toEqual({ disabled: false, disabledAtParse: false, stored: null });
});

test("the opt-out applies on every page", async ({ page }) => {
  await page.goto("/?internal=1");
  for (const path of ["/blog/", "/now/"]) {
    await page.goto(path);
    const { disabled, disabledAtParse } = await state(page);
    expect(disabled, path).toBe(true);
    expect(disabledAtParse, path).toBe(true);
  }
});
