import { test, expect } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:3000";

// Blog content lives in src/assets/blog and is copied into dist by
// build:assets. It used to live only in the tracked dist/ folder, so when dist/
// stopped being committed the deployed blog lost every post. These tests hit
// the real build output (no fixtures) so that can't silently happen again.

test.describe("blog content is part of the build", () => {
  test("posts.json and every post it lists are served", async ({ request }) => {
    const index = await request.get(`${BASE_URL}/blog/content/posts.json`);
    expect(index.status()).toBe(200);

    const { posts } = await index.json();
    expect(posts.length).toBeGreaterThan(0);

    for (const post of posts) {
      const res = await request.get(`${BASE_URL}/blog/content/${post.id}.md`);
      expect(res.status(), `${post.id}.md`).toBe(200);
    }
  });

  test("markdown themes are served", async ({ request }) => {
    for (const theme of ["light", "dark"]) {
      const res = await request.get(`${BASE_URL}/blog/github-markdown-${theme}.css`);
      expect(res.status(), theme).toBe(200);
    }
  });

  test("?post=latest loads the newest post without the error fallback", async ({ page }) => {
    await page.route(/googletagmanager\.com|fontawesome\.com|fonts\.g|jsdelivr\.net|\/browser-sync\//, (route) =>
      route.abort()
    );
    await page.goto(`${BASE_URL}/blog?post=latest`);
    await expect(page.locator("zero-md")).toHaveAttribute("src", /\/blog\/content\/.+\.md$/);
    await expect(page.getByText("Error loading post")).toHaveCount(0);
    await expect(page).toHaveTitle(/Conor Hinchee \| Blog \| .+/);
  });
});
