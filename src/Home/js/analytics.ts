// Site analytics events, pushed to the GTM dataLayer.
//
// Events
//   resume_download, contact_click, social_click, project_click
//       Clicks on elements with data-track="<event>". Extra data-* attributes
//       become params (data-social-network, data-project).
//   section_view   A <main> section with an id was at least half on screen
//                  (or filled half the viewport) for a second. Once per page.
//   demo_interact  First pointer/keyboard interaction inside an element with
//                  data-track-demo="<name>". Once per page.
//   blog_post_view Pushed by the blog page's inline script.
//
// GTM keeps every key ever pushed in its data model, so each push sets all
// params (unused ones to undefined) to stop values leaking between events.
// If you add a param here, add it to the blog page's push too.

const EVENT_PARAMS = [
  "section",
  "link_url",
  "link_text",
  "social_network",
  "project",
  "demo",
  "post_id",
  "post_title",
] as const;

type EventParam = (typeof EVENT_PARAMS)[number];
type EventParams = Partial<Record<EventParam, string>>;

const SECTION_VIEW_DWELL_MS = 1000;

const track = (event: string, params: EventParams = {}): void => {
  window.dataLayer = window.dataLayer || [];
  const payload: Record<string, unknown> = { event };
  EVENT_PARAMS.forEach((key) => {
    payload[key] = params[key];
  });
  window.dataLayer.push(payload);
};

const sectionOf = (element: Element): string | undefined => element.closest("section[id]")?.id;

const linkText = (element: Element): string =>
  (element.getAttribute("aria-label") || element.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

// ---------- clicks ---------- //

const handleTrackedClick = (event: MouseEvent) => {
  // Left click and Enter fire "click"; middle click fires "auxclick".
  if (event.type === "auxclick" && event.button !== 1) return;

  if (!(event.target instanceof Element)) return;
  const element = event.target.closest("[data-track]");
  if (!(element instanceof HTMLElement)) return;

  track(element.dataset.track ?? "", {
    section: sectionOf(element),
    link_url:
      element instanceof HTMLAnchorElement ? element.href || undefined : undefined,
    link_text: linkText(element),
    social_network: element.dataset.socialNetwork,
    project: element.dataset.project,
  });
};

const initClickTracking = () => {
  document.addEventListener("click", handleTrackedClick, true);
  document.addEventListener("auxclick", handleTrackedClick, true);
};

// ---------- section views ---------- //

const initSectionViews = () => {
  if (!("IntersectionObserver" in window)) return;

  const sections = document.querySelectorAll(
    "main section[id]:not(#consentBanner)"
  );
  if (!sections.length) return;

  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const seen = new Set<string>();

  const isMostlyVisible = (entry: IntersectionObserverEntry): boolean => {
    if (!entry.isIntersecting) return false;
    const viewportHeight = entry.rootBounds?.height || window.innerHeight;
    // Tall sections can never be 50% visible, so also count a section that
    // fills at least half the viewport.
    return (
      entry.intersectionRatio >= 0.5 ||
      entry.intersectionRect.height >= viewportHeight * 0.5
    );
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (seen.has(id)) return;

        if (isMostlyVisible(entry)) {
          if (timers.has(id)) return;
          timers.set(
            id,
            setTimeout(() => {
              seen.add(id);
              timers.delete(id);
              observer.unobserve(entry.target);
              track("section_view", { section: id });
            }, SECTION_VIEW_DWELL_MS)
          );
        } else if (timers.has(id)) {
          clearTimeout(timers.get(id));
          timers.delete(id);
        }
      });
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] }
  );

  sections.forEach((section) => observer.observe(section));
};

// ---------- demo interactions ---------- //

const initDemoInteractions = () => {
  document.querySelectorAll("[data-track-demo]").forEach((element) => {
    if (!(element instanceof HTMLElement)) return;
    const demo = element.dataset.trackDemo;
    const controller = new AbortController();
    const onInteract = () => {
      controller.abort();
      track("demo_interact", { section: sectionOf(element), demo });
    };
    element.addEventListener("pointerdown", onInteract, {
      signal: controller.signal,
    });
    element.addEventListener("keydown", onInteract, {
      signal: controller.signal,
    });
  });
};

const initAnalytics = (): void => {
  initClickTracking();
  initSectionViews();
  initDemoInteractions();
};

export type { EventParam, EventParams };
export { EVENT_PARAMS, track };
export default initAnalytics;
