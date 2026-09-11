import { test, expect } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:3000";

const EVENT_PARAMS = [
  "section",
  "link_url",
  "link_text",
  "social_network",
  "project",
  "demo",
  "post_id",
  "post_title",
];

const POSTS_FIXTURE = {
  posts: [
    { id: "older-post", title: "Older Post", date: "2025-01-01" },
    { id: "newest-post", title: "Newest Post", date: "2026-06-01" },
  ],
};

test.beforeEach(async ({ page, context }) => {
  // Offline + deterministic: no GTM or third-party assets. Also block the
  // browser-sync client, whose ghost mode mirrors clicks and scrolls between
  // parallel test browsers.
  await page.route(
    /googletagmanager\.com|fontawesome\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|jsdelivr\.net|\/browser-sync\//,
    (route) => route.abort()
  );
  // A stored choice keeps the consent banner from covering links.
  await context.addCookies([{ name: "consent_v2", value: "granted", url: BASE_URL }]);
  // Don't actually navigate, open tabs or mail clients when links are clicked.
  // Runs in the bubble phase, after the site's capture-phase listener.
  await page.addInitScript(() => {
    const stop = (e) => {
      if (e.target.closest && e.target.closest("a")) e.preventDefault();
    };
    window.addEventListener("click", stop);
    window.addEventListener("auxclick", stop);
  });
});

// Custom events only (not GTM internals or consent commands), with the list of
// keys each push set, since undefined values don't survive serialization.
const readEvents = (page) =>
  page.evaluate(() =>
    (window.dataLayer || [])
      .filter((e) => e && typeof e.event === "string" && !e.event.startsWith("gtm."))
      .map((e) => ({ ...e, keys: Object.keys(e) }))
  );

const eventsNamed = async (page, name) =>
  (await readEvents(page)).filter((e) => e.event === name);

const expectAllParamKeys = (entry) => {
  for (const key of EVENT_PARAMS) expect(entry.keys).toContain(key);
};

test.describe("tracked link clicks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test("resume link fires resume_download", async ({ page }) => {
    await page.locator('#socials a[data-track="resume_download"]').click();
    const [event] = await eventsNamed(page, "resume_download");
    expect(event).toMatchObject({ section: "socials", link_text: "Resume" });
    expect(event.link_url).toContain("Resume%202026.pdf");
    expectAllParamKeys(event);
  });

  test("email link fires contact_click", async ({ page }) => {
    await page.locator('#socials a[href^="mailto:"]').click();
    const [event] = await eventsNamed(page, "contact_click");
    expect(event).toMatchObject({
      section: "socials",
      link_url: "mailto:code@conorhinchee.com",
    });
  });

  test("social links fire social_click with the network", async ({ page }) => {
    await page.locator('#socials a[data-social-network="github"]').click();
    const events = await eventsNamed(page, "social_click");
    expect(events.map((e) => e.social_network)).toEqual(["github"]);
  });

  test("the X link is gone", async ({ page }) => {
    expect(await page.locator('a[href*="x.com"]').count()).toBe(0);
  });

  for (const [project, section, repo] of [
    ["heap_analyzer", "random", "heap-analyzer"],
    ["tornado_simulator", "tornado", "Tornado-Simulator"],
    ["field", "field", "FIELD"],
  ]) {
    test(`${project} repo link fires project_click`, async ({ page }) => {
      const link = page.locator(`a[data-project="${project}"]`);
      await expect(link).toHaveAttribute("href", `https://github.com/Conor-Hinchee/${repo}`);
      await link.click();
      const [event] = await eventsNamed(page, "project_click");
      expect(event).toMatchObject({ project, section });
    });
  }

  test("middle click counts, right click doesn't", async ({ page }) => {
    const resume = page.locator('#socials a[data-track="resume_download"]');
    await resume.click({ button: "right" });
    expect(await eventsNamed(page, "resume_download")).toHaveLength(0);
    await resume.click({ button: "middle" });
    expect(await eventsNamed(page, "resume_download")).toHaveLength(1);
  });

  test("params from one event don't leak into the next", async ({ page }) => {
    await page.locator('#socials a[data-social-network="github"]').click();
    await page.locator('#socials a[href^="mailto:"]').click();
    const [contact] = await eventsNamed(page, "contact_click");
    expect(contact.keys).toContain("social_network");
    expect(contact.social_network).toBeUndefined();
  });

  test("every resume, email and social link on the homepage is tagged", async ({ page }) => {
    const untagged = await page.evaluate(() =>
      [
        ...document.querySelectorAll(
          'a[href^="mailto:"], a[href$=".pdf"], a[href*="github.com"], a[href*="linkedin.com"], a[href*="x.com"]'
        ),
      ]
        .filter((a) => !a.dataset.track)
        .map((a) => a.href)
    );
    expect(untagged).toEqual([]);
  });
});

test.describe("section_view", () => {
  test("fires once per section after it's been on screen for a second", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect
      .poll(async () => (await eventsNamed(page, "section_view")).map((e) => e.section))
      .toContain("about");

    // Jump straight to the bottom: sections in between are never on screen.
    await page.locator("#socials").scrollIntoViewIfNeeded();
    await expect
      .poll(async () => (await eventsNamed(page, "section_view")).map((e) => e.section))
      .toContain("socials");

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    await page.locator("#socials").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const sections = (await eventsNamed(page, "section_view")).map((e) => e.section);
    expect(sections.filter((s) => s === "socials")).toHaveLength(1);
    expect(sections.filter((s) => s === "about")).toHaveLength(1);
    expect(sections).not.toContain("tornado");
    expect(sections).not.toContain("consentBanner");
  });

  test("a section scrolled past quickly doesn't count", async ({ page }) => {
    await page.goto(BASE_URL);
    // Scroll to field, let the observer see it for two frames, then move on.
    // Done inside the page so test-runner latency can't stretch the dwell.
    await page.evaluate(async () => {
      const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
      document.querySelector("#field").scrollIntoView();
      await nextFrame();
      await nextFrame();
      document.querySelector("#socials").scrollIntoView();
    });
    await page.waitForTimeout(1500);
    const sections = (await eventsNamed(page, "section_view")).map((e) => e.section);
    expect(sections).not.toContain("field");
  });
});

test.describe("demo_interact", () => {
  test("fires once on the first interaction with a demo", async ({ page }) => {
    await page.goto(BASE_URL);
    const demo = page.locator('[data-track-demo="game_of_life"]');
    await demo.click();
    await demo.click();
    const events = await eventsNamed(page, "demo_interact");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ demo: "game_of_life", section: "random" });
    expectAllParamKeys(events[0]);
  });
});

test.describe("blog_post_view", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/blog/content/posts.json", (route) =>
      route.fulfill({ json: POSTS_FIXTURE })
    );
    await page.route("**/blog/content/*.md", (route) =>
      route.fulfill({ body: "# Test post", contentType: "text/markdown" })
    );
  });

  test("reports the post that ?post=latest resolved to", async ({ page }) => {
    await page.goto(`${BASE_URL}/blog/?post=latest`);
    await expect.poll(() => eventsNamed(page, "blog_post_view")).toHaveLength(1);
    const [event] = await eventsNamed(page, "blog_post_view");
    expect(event).toMatchObject({ post_id: "newest-post", post_title: "Newest Post" });
    expectAllParamKeys(event);
  });

  test("reports a specific post", async ({ page }) => {
    await page.goto(`${BASE_URL}/blog/?post=older-post`);
    await expect.poll(() => eventsNamed(page, "blog_post_view")).toHaveLength(1);
    const [event] = await eventsNamed(page, "blog_post_view");
    expect(event).toMatchObject({ post_id: "older-post", post_title: "Older Post" });
  });
});
