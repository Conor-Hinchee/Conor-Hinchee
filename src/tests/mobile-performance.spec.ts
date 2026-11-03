import { expect, test } from "@playwright/test";

// Runs in the "mobile-perf" project only: an iPhone viewport in Chromium,
// with the CPU throttled through CDP to approximate a mid-range phone.
const CPU_THROTTLE = 4;
const MAX_CANVAS_MEGAPIXELS = 4;
const MAX_MEDIAN_FRAME_MS = 20;
const MAX_P95_FRAME_MS = 34;
const SCROLL_FRAMES = 120;

test.describe("mobile performance", () => {
  test.beforeEach(async ({ page }) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_THROTTLE });
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1000);
  });

  test("no canvas is larger than the device can comfortably paint", async ({ page }) => {
    const canvases = await page.$$eval("canvas", (els) =>
      els.map((el) => ({
        owner: el.parentElement?.id ?? "",
        megapixels: (el.width * el.height) / 1e6,
      }))
    );

    for (const canvas of canvases) {
      expect(canvas.megapixels, `canvas in #${canvas.owner}`).toBeLessThanOrEqual(
        MAX_CANVAS_MEGAPIXELS
      );
    }
  });

  test("scrolling stays smooth", async ({ page }) => {
    const gaps = await page.evaluate(
      (frames) =>
        new Promise<number[]>((resolve) => {
          const result: number[] = [];
          let last = performance.now();
          let y = 0;
          const step = (t: number) => {
            result.push(t - last);
            last = t;
            y += 20;
            window.scrollTo(0, y);
            if (result.length < frames) requestAnimationFrame(step);
            else resolve(result);
          };
          requestAnimationFrame(step);
        }),
      SCROLL_FRAMES
    );

    const sorted = [...gaps].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    console.log(`scroll frames: median ${median.toFixed(1)}ms, p95 ${p95.toFixed(1)}ms`);

    expect(median, "median frame time (ms)").toBeLessThanOrEqual(MAX_MEDIAN_FRAME_MS);
    expect(p95, "p95 frame time (ms)").toBeLessThanOrEqual(MAX_P95_FRAME_MS);
  });
});
