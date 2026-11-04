const DEFAULT_BREADCRUMB = "navigate";

const hideJumpLinks = () => {
  const jumpLinks = document.querySelectorAll(".jumplink");
  jumpLinks.forEach((jumpLink) => {
    jumpLink.classList.add("hidden");
  });

  // show home link
  const breadcrumbNavHome = document.querySelector("#breadcrumbNavHome");
  if (!breadcrumbNavHome) return;
  breadcrumbNavHome.classList.remove("hidden");
  breadcrumbNavHome.classList.add("block");
};

const updateBreadcrumb = () => {
  const breadcrumbNavButton = document.querySelector("#breadcrumbNavButton");
  const path = window.location.pathname;
  const fullUrl = window.location.href;
  const id = fullUrl.split("#");

  if (!breadcrumbNavButton) return;

  if (id.length > 1) {
    breadcrumbNavButton.innerHTML = "#" + id[1];
  } else if (path !== "/") {
    breadcrumbNavButton.innerHTML = path.replaceAll("/", "");
    hideJumpLinks();
  } else {
    breadcrumbNavButton.innerHTML = DEFAULT_BREADCRUMB;
  }
};

const toggleMainDropDown = () => {
  const breadcrumbDropdown = document.querySelector("#breadcrumbNavDropdown");
  const body = document.querySelector("body");
  if (!breadcrumbDropdown || !body) return;
  
  breadcrumbDropdown.classList.toggle("invisible");
  updateBreadcrumb();

  if (!breadcrumbDropdown.classList.contains("invisible")) {
    setTimeout(() => {
      const bodyListener = (e: MouseEvent) => {
        if (!(e.target instanceof Node && breadcrumbDropdown.contains(e.target))) {
          breadcrumbDropdown.classList.add("invisible");
          body.removeEventListener("click", bodyListener);
        }
      };
      body.addEventListener("click", bodyListener);
    }, 0);
  }
};

const initNavBubbles = () => {
  const bubbleEls = document.querySelectorAll<HTMLElement>(".nav-bubble");

  bubbleEls.forEach((el) => {
    const moveBubble = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--bubble-x", `${clientX - rect.left}px`);
      el.style.setProperty("--bubble-y", `${clientY - rect.top}px`);
    };

    el.addEventListener("pointermove", (e) => moveBubble(e.clientX, e.clientY));

    el.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      if (touch) moveBubble(touch.clientX, touch.clientY);
      el.classList.add("bubble-active");
    }, { passive: true });

    const clearBubble = () => el.classList.remove("bubble-active");
    el.addEventListener("touchend", clearBubble);
    el.addEventListener("touchcancel", clearBubble);
  });
};

const initBreadcrumb = () => {
  const breadcrumbNavButton = document.querySelector("#breadcrumbNavButton");

  updateBreadcrumb();
  if (!breadcrumbNavButton) return;
  breadcrumbNavButton.addEventListener("click", toggleMainDropDown);
  initNavBubbles();
};

export default initBreadcrumb;
