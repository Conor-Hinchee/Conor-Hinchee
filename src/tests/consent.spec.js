import { test, expect } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:3000";

// Keep tests offline and deterministic: GTM and third-party assets never load,
// so we assert on what the page pushes into the dataLayer. The browser-sync
// client is blocked too, since its ghost mode mirrors clicks and scrolls
// between parallel test browsers.
const blockThirdParties = async (page) => {
  await page.route(
    /googletagmanager\.com|fontawesome\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|jsdelivr\.net|\/browser-sync\//,
    (route) => route.abort()
  );
};

const readDataLayer = (page) =>
  page.evaluate(() =>
    (window.dataLayer || []).map((entry) =>
      Object.prototype.toString.call(entry) === "[object Arguments]"
        ? { command: Array.from(entry) }
        : { event: entry.event }
    )
  );

const consentCommands = (dataLayer, type) =>
  dataLayer
    .filter((e) => e.command && e.command[0] === "consent" && e.command[1] === type)
    .map((e) => e.command[2]);

const consentCookie = async (context) =>
  (await context.cookies()).find((c) => c.name === "consent_v2");

// The banner fades in with a CSS transition that can crawl on a busy machine,
// so check the inline opacity the script sets instead of the animated value.
const expectBannerShown = (page) =>
  expect(page.locator("#consentBanner")).toHaveAttribute("style", /opacity:\s*1/);

const openBanner = async (page) => {
  await page.mouse.wheel(0, 800);
  await expectBannerShown(page);
  await page.locator("#consentBanner").click();
};

test.beforeEach(async ({ page }) => {
  await blockThirdParties(page);
});

test.describe("consent defaults (before GTM loads)", () => {
  test("sets region-based defaults ahead of the GTM container", async ({ page }) => {
    await page.goto(BASE_URL);
    const dataLayer = await readDataLayer(page);

    const defaults = consentCommands(dataLayer, "default");
    expect(defaults).toHaveLength(2);

    const [optInRegions, everywhereElse] = defaults;
    expect(optInRegions.analytics_storage).toBe("denied");
    expect(optInRegions.region).toEqual(expect.arrayContaining(["DE", "FR", "GB", "CH", "NO"]));
    expect(optInRegions.region).not.toContain("US");
    expect(everywhereElse.analytics_storage).toBe("granted");
    expect(everywhereElse.region).toBeUndefined();

    for (const d of defaults) {
      expect(d.ad_storage).toBe("denied");
      expect(d.ad_user_data).toBe("denied");
      expect(d.ad_personalization).toBe("denied");
    }

    const lastDefault = dataLayer.findLastIndex(
      (e) => e.command && e.command[0] === "consent" && e.command[1] === "default"
    );
    const gtmStart = dataLayer.findIndex((e) => e.event === "gtm.js");
    expect(gtmStart).toBeGreaterThan(lastDefault);
  });

  test("does not record a choice before the visitor makes one", async ({ page, context }) => {
    await page.goto(BASE_URL);
    await page.mouse.wheel(0, 800);
    await expectBannerShown(page);

    expect(consentCommands(await readDataLayer(page), "update")).toHaveLength(0);
    expect(await consentCookie(context)).toBeUndefined();
  });
});

test.describe("consent banner choices", () => {
  test("decline turns analytics off and remembers it", async ({ page, context }) => {
    await page.goto(BASE_URL);
    await openBanner(page);
    await page.locator("#cookieDecline").click();

    await expect(page.locator("#consentBanner")).toBeHidden();
    expect(consentCommands(await readDataLayer(page), "update")).toEqual([
      { analytics_storage: "denied" },
    ]);
    expect((await consentCookie(context)).value).toBe("denied");
  });

  test("consent turns analytics on and remembers it", async ({ page, context }) => {
    await page.goto(BASE_URL);
    await openBanner(page);
    await page.locator("#cookieConsent").click();

    await expect(page.locator("#consentBanner")).toBeHidden();
    expect(consentCommands(await readDataLayer(page), "update")).toEqual([
      { analytics_storage: "granted" },
    ]);
    expect((await consentCookie(context)).value).toBe("granted");
  });
});

test.describe("returning visitors", () => {
  for (const choice of ["granted", "denied"]) {
    test(`applies a stored "${choice}" choice before GTM and hides the banner`, async ({
      page,
      context,
    }) => {
      await context.addCookies([{ name: "consent_v2", value: choice, url: BASE_URL }]);
      await page.goto(BASE_URL);

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
  }) => {
    const legacy = encodeURIComponent(JSON.stringify({ analytics_storage: "denied" }));
    await context.addCookies([{ name: "cookie-consent", value: legacy, url: BASE_URL }]);
    await page.addInitScript(() => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem("trackConsent", JSON.stringify({ analytics_storage: "denied" }));
        sessionStorage.setItem("seeded", "1");
      }
    });
    await page.goto(BASE_URL);

    expect(consentCommands(await readDataLayer(page), "update")).toHaveLength(0);
    await page.mouse.wheel(0, 800);
    await expectBannerShown(page);

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "cookie-consent")).toBeUndefined();
    expect(await page.evaluate(() => localStorage.getItem("trackConsent"))).toBeNull();
  });
});
