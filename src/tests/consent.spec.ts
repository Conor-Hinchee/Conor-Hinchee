import { test, expect } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";

// The page's dataLayer, as typed in src/types/global.d.ts (which this config
// doesn't include): plain objects are events, `arguments` objects are gtag
// commands.
type DataLayerEntry = Record<string, unknown> | IArguments;
type GtmWindow = Window & { dataLayer?: DataLayerEntry[] };

type ConsentParams = Record<string, unknown>;
// gtag("consent", "default" | "update", params)
type GtagCommand = [name?: unknown, type?: unknown, params?: ConsentParams];
type DataLayerSnapshot = {
  command?: GtagCommand;
  event?: unknown;
};

// Keep tests offline and deterministic: GTM and third-party assets never load,
// so we assert on what the page pushes into the dataLayer. The browser-sync
// client is blocked too, since its ghost mode mirrors clicks and scrolls
// between parallel test browsers.
const blockThirdParties = async (page: Page) => {
  await page.route(
    /googletagmanager\.com|fontawesome\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|jsdelivr\.net|\/browser-sync\//,
    (route) => route.abort()
  );
};

const readDataLayer = (page: Page): Promise<DataLayerSnapshot[]> =>
  page.evaluate(() => {
    const isArguments = (entry: DataLayerEntry): entry is IArguments =>
      Object.prototype.toString.call(entry) === "[object Arguments]";
    return ((window as GtmWindow).dataLayer || []).map((entry) =>
      isArguments(entry)
        ? { command: Array.from(entry) as GtagCommand }
        : { event: entry.event }
    );
  });

const consentCommands = (dataLayer: DataLayerSnapshot[], type: string) =>
  dataLayer
    .filter((e) => e.command && e.command[0] === "consent" && e.command[1] === type)
    .map((e) => e.command?.[2]);

const consentCookie = async (context: BrowserContext) =>
  (await context.cookies()).find((c) => c.name === "consent_v2");

// The banner fades in with a CSS transition that can crawl on a busy machine,
// so check the inline opacity the script sets instead of the animated value.
const expectBannerShown = (page: Page) =>
  expect(page.locator("#consentBanner")).toHaveAttribute("style", /opacity:\s*1/);

const openBanner = async (page: Page) => {
  await page.mouse.wheel(0, 800);
  await expectBannerShown(page);
  await page.locator("#consentBanner").click();
};

test.beforeEach(async ({ page }) => {
  await blockThirdParties(page);
});

test.describe("consent defaults (before GTM loads)", () => {
  test("sets region-based defaults ahead of the GTM container", async ({ page }) => {
    await page.goto("/");
    const dataLayer = await readDataLayer(page);

    const defaults = consentCommands(dataLayer, "default");
    expect(defaults).toHaveLength(2);

    const [optInRegions, everywhereElse] = defaults;
    expect(optInRegions?.analytics_storage).toBe("denied");
    expect(optInRegions?.region).toEqual(expect.arrayContaining(["DE", "FR", "GB", "CH", "NO"]));
    expect(optInRegions?.region).not.toContain("US");
    expect(everywhereElse?.analytics_storage).toBe("granted");
    expect(everywhereElse?.region).toBeUndefined();

    for (const d of defaults) {
      expect(d?.ad_storage).toBe("denied");
      expect(d?.ad_user_data).toBe("denied");
      expect(d?.ad_personalization).toBe("denied");
    }

    const lastDefault = dataLayer.findLastIndex(
      (e) => e.command && e.command[0] === "consent" && e.command[1] === "default"
    );
    const gtmStart = dataLayer.findIndex((e) => e.event === "gtm.js");
    expect(gtmStart).toBeGreaterThan(lastDefault);
  });

  test("does not record a choice before the visitor makes one", async ({ page, context }) => {
    await page.goto("/");
    await page.mouse.wheel(0, 800);
    await expectBannerShown(page);

    expect(consentCommands(await readDataLayer(page), "update")).toHaveLength(0);
    expect(await consentCookie(context)).toBeUndefined();
  });
});

test.describe("consent banner choices", () => {
  test("decline turns analytics off and remembers it", async ({ page, context }) => {
    await page.goto("/");
    await openBanner(page);
    await page.locator("#cookieDecline").click();

    await expect(page.locator("#consentBanner")).toBeHidden();
    expect(consentCommands(await readDataLayer(page), "update")).toEqual([
      { analytics_storage: "denied" },
    ]);
    expect((await consentCookie(context))?.value).toBe("denied");
  });

  test("consent turns analytics on and remembers it", async ({ page, context }) => {
    await page.goto("/");
    await openBanner(page);
    await page.locator("#cookieConsent").click();

    await expect(page.locator("#consentBanner")).toBeHidden();
    expect(consentCommands(await readDataLayer(page), "update")).toEqual([
      { analytics_storage: "granted" },
    ]);
    expect((await consentCookie(context))?.value).toBe("granted");
  });
});

test.describe("returning visitors", () => {
  for (const choice of ["granted", "denied"]) {
    test(`applies a stored "${choice}" choice before GTM and hides the banner`, async ({
      page,
      context,
      baseURL,
    }) => {
      await context.addCookies([{ name: "consent_v2", value: choice, url: baseURL }]);
      await page.goto("/");

      const dataLayer = await readDataLayer(page);
      expect(consentCommands(dataLayer, "update")).toEqual([{ analytics_storage: choice }]);
      const update = dataLayer.findIndex(
        (e) => e.command && e.command[0] === "consent" && e.command[1] === "update"
      );
      expect(dataLayer.findIndex((e) => e.event === "gtm.js")).toBeGreaterThan(update);

      await page.mouse.wheel(0, 800);
      await page.waitForTimeout(1500);
      await expect(page.locator("#consentBanner")).not.toHaveAttribute("style", /opacity:\s*1/);
    });
  }

  test("re-asks visitors who only have the old, untrustworthy cookie", async ({
    page,
    context,
    baseURL,
  }) => {
    const legacy = encodeURIComponent(JSON.stringify({ analytics_storage: "denied" }));
    await context.addCookies([{ name: "cookie-consent", value: legacy, url: baseURL }]);
    await page.addInitScript(() => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem("trackConsent", JSON.stringify({ analytics_storage: "denied" }));
        sessionStorage.setItem("seeded", "1");
      }
    });
    await page.goto("/");

    expect(consentCommands(await readDataLayer(page), "update")).toHaveLength(0);
    await page.mouse.wheel(0, 800);
    await expectBannerShown(page);

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "cookie-consent")).toBeUndefined();
    expect(await page.evaluate(() => localStorage.getItem("trackConsent"))).toBeNull();
  });
});
